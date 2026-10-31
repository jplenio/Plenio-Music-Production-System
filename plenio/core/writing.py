"""Writing prompts for any LLM, and robust parsing of its answer.

``compose`` turns a brief plus the engine's writing rules into one plain
prompt. ``parse_draft`` extracts title, style, lyrics and artwork prompt from
whatever the LLM answered, and enforces the format deterministically; every
enforcement is reported (never silent).
"""

from __future__ import annotations

import hashlib
import random
import re
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from . import syllables
from .arrangement import CreativeMode, writer_lines
from .brief import CoverBrief, SongBrief
from .creativity import writer_lines as creativity_lines
from .engines import EngineInfo, rules_for
from .engines.yue2 import melody_register, note_name
from .errors import PlenioValidationError

REQUEST_SCHEMA = "plenio.request/1"
BLOCKS = ("TITLE", "TITLES", "STYLE", "LYRICS", "ARTWORK")
DETAIL = {
    "concise": "Keep it compact: short sections with few lines.",
    "standard": "",
    "rich": "Use vivid, specific imagery and varied phrasing.",
}
# A label line: "TITLE: text", "### STYLE", "**Lyrics:**". Without a colon the label must stand alone,
# so that a lyric line such as "Style is everything" is never taken for a label.
_HEADING = re.compile(
    r"(?im)^[ \t>*#_\-]*\**\s*(TITLES|TITLE|STYLE|LYRICS|ARTWORK)\s*\**(?:\s*:\s*\**[ \t]*(.*?)\**[ \t]*|[ \t]*)$"
)
_THINKING = [
    re.compile(r"(?is)<think>.*?</think>"),
    re.compile(r"(?is)<\|channel\>thought.*?<channel\|>"),
    re.compile(r"(?is)<\|channel\|>analysis.*?<\|end\|>"),
    re.compile(r"(?is)<\|?(?:think|thinking)\|?>.*?<\|?/(?:think|thinking)\|?>"),
]
_FENCE = re.compile(r"(?m)^```.*$")
_BOLD_TAG = re.compile(r"^\**\s*\[([^\]]{1,40})\]\s*\**$")
_LABEL_TAG = re.compile(
    r"^\**\s*\(?(intro|verse(?: \d+)?|pre-chorus|chorus|post-chorus|bridge|outro|hook|refrain|interlude|instrumental|solo|break)\)?\s*:?\s*\**$",
    re.IGNORECASE,
)


LYRICS_MODES = ("write", "tags", "none")
INSTRUMENTAL_TAG = "instrumental"
"""Lyrics of an instrumental song: the single tag ``[instrumental]`` (Phase 4A: fewer vocal-like
sounds than section tags, and the owner preferred these takes)."""

PLAN_FORMS: tuple[tuple[float, tuple[str, ...]], ...] = (
    (100.0, ("Intro", "Verse", "Chorus", "Outro")),
    (165.0, ("Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro")),
    (250.0, ("Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Chorus", "Outro")),
    (
        float("inf"),
        (
            "Intro",
            "Verse",
            "Pre-Chorus",
            "Chorus",
            "Verse",
            "Pre-Chorus",
            "Chorus",
            "Bridge",
            "Chorus",
            "Outro",
        ),
    ),
)
"""Planner-only forms of an instrumental song by its target length (seconds, upper bound).

With the lyrics ``[instrumental]`` the planner mostly wrote an intro and one section repeating for
minutes (study E6). Upstream's instrumental workflow (YuE2 skill ``instrumental/``) plans with empty
section tags instead - "planner-only ... never sung in the final request" - and the render keeps
``[instrumental]``. Tag names are the instrumental adapter's vocabulary."""


def instrumental_plan_form(target_seconds: float) -> str:
    """The planner-only lyrics of an instrumental song: empty section tags, one per line."""
    form = next(tags for limit, tags in PLAN_FORMS if target_seconds <= limit)
    return "\n\n".join(f"[{tag}]" for tag in form) + "\n"


def plan_lyrics(lyrics: str, brief: Any) -> str:
    """What the YuE2 planner reads: for an instrumental song whose lyrics are the bare
    ``[instrumental]`` tag, a section form for the brief's length; otherwise the lyrics unchanged.
    Only the plan sees it - the render gets the sheet's lyrics (``[instrumental]``), and the plan's
    Vocal notes are moved to Ins by *prepare from brief*, as before."""
    bare = lyrics.strip().lower() == f"[{INSTRUMENTAL_TAG}]"
    if bare and isinstance(brief, SongBrief) and brief.instrumental:
        return instrumental_plan_form(brief.target_seconds)
    return lyrics


@dataclass(frozen=True)
class Request:
    engine_id: str
    rules_version: str
    brief_fingerprint: str
    instrumental: bool
    sections: tuple[str, ...]
    fixed_title: str = ""
    kind: str = "song"
    lyrics_mode: str = "write"
    """``write``: the LLM writes the lyrics; ``tags``: the lyrics are ``sections`` as tags (set by
    Plenio); ``none``: no lyrics from the LLM (original-lyrics covers take them from the source)."""
    enforce_sections: bool = False
    """The lyrics must have exactly ``sections`` (a cover's score defines them)."""
    sparse_lines: int = 0
    """Sparse vocals: the most sung lines the lyrics should have (``core.lyrics.sparse_line_limit``); 0 no limit."""
    sound_words: tuple[str, ...] = ()
    """Words of the brief's genre, mood and tempo: a proposed title with one of them describes the sound, not the
    song, and is not picked while others are left (``pick_title``)."""
    given_lyrics: str = ""
    """``lyrics_mode`` ``given``: the user's own lyrics (with section tags), sung as written - the writer writes
    only the title, the style and the artwork for them."""

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": REQUEST_SCHEMA,
            "engine_id": self.engine_id,
            "rules_version": self.rules_version,
            "brief_fingerprint": self.brief_fingerprint,
            "instrumental": self.instrumental,
            "sections": list(self.sections),
            "fixed_title": self.fixed_title,
            "kind": self.kind,
            "lyrics_mode": self.lyrics_mode,
            "enforce_sections": self.enforce_sections,
            "sparse_lines": self.sparse_lines,
        }


@dataclass(frozen=True)
class Draft:
    title: str
    style: str
    lyrics: str
    artwork_prompt: str
    enforcements: tuple[str, ...] = field(default=())

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "style": self.style,
            "lyrics": self.lyrics,
            "artwork_prompt": self.artwork_prompt,
            "enforcements": list(self.enforcements),
        }


def compose(
    brief: SongBrief | CoverBrief,
    engine: EngineInfo,
    *,
    detail: str = "standard",
    score_sections: Sequence[str] = (),
    fixed_title: str = "",
    phrasing: Sequence[Mapping[str, Any]] = (),
    language_hint: str = "",
    reference_lyrics: str = "",
    score_tempo: int | None = None,
    vocal_range: tuple[int, int] | None = None,
    mode: CreativeMode | None = None,
) -> tuple[str, Request]:
    """The writing prompt for ``brief`` under the rules of ``engine``.

    Songs: the LLM writes title, style and lyrics; instrumental songs get the single tag
    ``[instrumental]`` from Plenio; a song with sparse vocals gets the engine's mostly empty section map, its few
    words in the hooks. Covers: the score defines the sections (see ``_compose_cover``).
    ``mode``: the brief's creative mode, whose writer hints (and, for a song, the genre closeness) are
    added to the rules; ``off`` adds nothing. The brief's creativity adds its rules away from the reference
    (``core.creativity``; 40-60 adds nothing).
    """
    if isinstance(brief, CoverBrief):
        return _compose_cover(
            brief,
            engine,
            detail=detail,
            score_sections=score_sections,
            phrasing=phrasing,
            language_hint=language_hint,
            reference_lyrics=reference_lyrics,
            score_tempo=score_tempo,
            vocal_range=vocal_range,
            creative=mode,
        )
    rules = rules_for(engine.engine_id).writing_rules(
        instrumental=brief.instrumental, target_seconds=brief.target_seconds, sparse=brief.sparse
    )
    given = given_lyrics(brief.lyrics) if getattr(brief, "own_lyrics", False) else ""
    if brief.instrumental:
        # YuE2: the single tag [instrumental]; engines that need a section map (MiniMax) provide one.
        sections: tuple[str, ...] = tuple(rules.get("instrumental_sections") or (INSTRUMENTAL_TAG,))
    elif given and not score_sections:
        sections = tuple(lyrics_rules.parse_lyrics(given).tags)
    else:
        sections = tuple(s.strip("[]") for s in score_sections) or tuple(rules["sections"])
    request = Request(
        engine.engine_id,
        engine.rules_version,
        brief.fingerprint,
        brief.instrumental,
        sections,
        fixed_title.strip(),
        lyrics_mode="tags" if brief.instrumental else "given" if given else "write",
        sparse_lines=lyrics_rules.sparse_line_limit(brief.target_seconds)
        if brief.sparse and not given
        else 0,
        sound_words=sound_words(brief),
        given_lyrics=given,
    )
    if given:
        return _compose_given(brief, rules, request, detail=detail, mode=mode), request
    words = (
        "the brief's description and theme"
        if brief.instrumental
        else "the few words you write and the brief's description and theme"
        if brief.sparse
        else "the lyrics you write"
    )
    parts = [
        f"You are a professional songwriter preparing a song for the AI music model {rules['engine']}.",
        "Write the song described in the brief below and follow the rules exactly.",
        "",
        "BRIEF",
        brief.to_text(),
        "",
        "RULES",
        title_rule(words) if not request.fixed_title else f'- Title: use exactly "{request.fixed_title}".',
        f"- {rules['style']}",
        # sparse vocals on a score (the DAW template): its sections, words in a few of them
        f"- {lyrics_rules.sparse_rule(sections, request.sparse_lines, fixed=True)}"
        if brief.sparse and score_sections
        else f"- {rules['lyrics']}",
    ]
    if not brief.instrumental and not brief.sparse:
        section_line = " ".join(f"[{s}]" for s in sections)
        parts.append(
            f"- Sections, in this order: {section_line}"
            + (
                " (these follow the score and must not change)."
                if score_sections
                else " (adapt only if the brief asks for it)."
            )
        )
    parts.append(
        artwork_rule(
            "the brief's description and theme"
            if brief.instrumental
            else "your few words and the brief's description and theme"
            if brief.sparse
            else "your lyrics"
        )
    )
    parts += series_lines(brief)
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    if mode is not None:
        parts += writer_lines(mode, kind="song", closeness=brief.closeness, genre=brief.genre)
    parts += creativity_lines(
        brief.creativity,
        engine_id=engine.engine_id,
        instrumental=brief.instrumental,
        lyrics="none" if brief.instrumental else "sparse" if brief.sparse else "write",
        fixed_sections=bool(score_sections),
    )
    example = (
        lyrics_rules.tags_only(sections)
        if brief.instrumental
        else sparse_example(sections)
        if brief.sparse
        else f"[{sections[0]}]\n<lines>\n..."
    )
    multiline = bool(rules.get("style_multiline"))
    parts += [
        *_example_style(rules),
        "",
        *_layout(example, multiline=multiline, titles=not request.fixed_title),
    ]
    return "\n".join(parts), request


TITLE_CANDIDATES = 10
"""Titles the writer proposes; Plenio picks one at random (owner's request 2026-10-23: the same titles came
again and again - the writer's first idea is the most obvious one)."""
WORN_TITLE_WORDS = (
    "neon",
    "midnight",
    "echoes",
    "pulse",
    "fading",
    "drift",
    "glass",
    "circuit",
    "static",
    "velvet",
)
"""The words the owner's 1 577 song titles had most often (2026-10-23), after *the*, *in* and *of*."""


def sparse_example(sections: Sequence[str]) -> str:
    """The lyrics in the answer's layout for sparse vocals: the map up to its first hook, the hook with a line (a
    score's sections without a hook: the first one, with a line or none)."""
    if lyrics_rules.SPARSE_TAG not in sections:
        return f"[{sections[0]}]\n<one or two short lines, or nothing>\n\n..."
    shown: list[str] = []
    for tag in sections:
        shown.append(f"[{tag}]")
        if tag == lyrics_rules.SPARSE_TAG:
            shown[-1] += "\n<one or two short lines>"
            break
    return "\n\n".join(shown) + "\n\n..."


def title_rule(source: str) -> str:
    """The writer's rule for the titles; ``source``: what the song's words are (``"the lyrics"`` ...). A title says
    what the song is about, never how it sounds (owner's request 2026-10-31: titles had drifted towards the style -
    "Smooth Jazz Late Night")."""
    return (
        f"- Titles: when the rest is written, think of {TITLE_CANDIDATES} truly different titles for the song "
        f"(TITLES below), each 1 to 6 words, no quotes. Every title comes from {source}: what it is about, its "
        "story, its central image, a striking phrase, a person, an object, a place or a moment in it - not only "
        "the hook of the chorus. A title or theme the brief gives is a starting point. A title names what the "
        "song is about, never how it sounds: no genre, style, instrument, tempo or mood words (not 'Smooth Jazz "
        "Night', 'Lofi Dreams', 'Midnight Groove', 'Acoustic Ballad'). Mix them: concrete and poetic, short and "
        "long, a name, a question, an image. Avoid the most obvious title and worn-out song words ("
        + ", ".join(WORN_TITLE_WORDS)
        + "). Plenio picks one of them at random."
    )


def artwork_rule(source: str) -> str:
    """The writer's rule for the cover prompt (owner's request 2026-10-23: the cover from the song - its lyrics
    first, then its title, then its tags), written for an image model such as FLUX.2: natural sentences in a
    fixed order, one visual idea, concrete details, light, palette, medium."""
    return (
        "- Artwork: the prompt for the song's square cover, painted by an image model. First read the song, in "
        f"this order: (a) {source}: what it is about, its central motif, the feelings that could be shown as "
        "something seen, the objects and places it names; (b) the title; (c) the genre, mood, voice, tempo and "
        "language of the brief. Choose ONE strong visual idea from it - a concrete scene or a symbolic image that "
        "tells the song at a glance; no singers, microphones or instruments unless the song is about them. Then "
        "write 50 to 90 words in plain sentences, in this order: the main subject and what it does; the setting, "
        "the season and the time of day; the composition for a square format (close-up, wide, from above, "
        "centred with space around it); the light; two to four colours that carry the mood; the medium and style "
        "that suit the genre (for example a cinematic photograph on 35mm film, an oil painting, a watercolour, a "
        "risograph print, a paper collage, an ink drawing, a 3D render, a synthwave illustration); the texture "
        "and the atmosphere. No text, letters, numbers, logos, frames or borders in the image."
    )


def _example_style(rules: Mapping[str, Any]) -> list[str]:
    example = str(rules["example_style"])
    return ["", "Example style:", example] if "\n" in example else ["", f"Example style: {example}"]


def _layout(lyrics_example: str, *, multiline: bool = False, titles: bool = False) -> list[str]:
    """The answer's layout; with ``titles`` the candidate titles come after the lyrics (they are taken from them)
    instead of a title first."""
    style = (
        ["STYLE:", "<the style, on several lines as described>"] if multiline else ["STYLE: <the style line>"]
    )
    if titles:
        return [
            "Write your answer in exactly this layout. Keep the four labels STYLE:, LYRICS:, TITLES: and ARTWORK: "
            "and replace the text in angle brackets; write nothing before or after it.",
            "",
            *style,
            "LYRICS:",
            lyrics_example,
            "TITLES:",
            *[f"{k}. <title>" for k in range(1, TITLE_CANDIDATES + 1)],
            "ARTWORK: <the cover prompt, 50 to 90 words>",
        ]
    return [
        "Write your answer in exactly this layout. Keep the four labels TITLE:, STYLE:, LYRICS: and ARTWORK: "
        "and replace the text in angle brackets; write nothing before or after it.",
        "",
        "TITLE: <the title>",
        *style,
        "LYRICS:",
        lyrics_example,
        "ARTWORK: <the cover prompt, 50 to 90 words>",
    ]


def given_lyrics(text: str) -> str:
    """The user's own lyrics as the song sings them: their section tags (a label line such as 'Chorus:' made one), or,
    without any, ``[Verse]`` for every block of lines and ``[Chorus]`` for a block that comes back."""
    cleaned = _clean_lyrics(text, [])
    parsed = lyrics_rules.parse_lyrics(cleaned)
    if parsed.sections:
        if parsed.preamble:  # lines before the first tag: a verse of their own
            return lyrics_rules.parse_lyrics("[Verse]\n" + cleaned).format()
        return parsed.format()
    blocks = [block.strip() for block in re.split(r"\n\s*\n", text.strip()) if block.strip()]
    repeated = {block for block in blocks if blocks.count(block) > 1}
    return "\n\n".join(f"[{'Chorus' if block in repeated else 'Verse'}]\n{block}" for block in blocks)


def _compose_given(
    brief: SongBrief, rules: Mapping[str, Any], request: Request, *, detail: str, mode: CreativeMode | None
) -> str:
    """The writing prompt of a song with the user's own lyrics: the writer writes the title from them, the style and
    the artwork; the lyrics stay exactly as they are (owner's request 2026-10-31)."""
    parts = [
        f"You are a professional songwriter preparing a song for the AI music model {rules['engine']}.",
        "The lyrics of the song are given below and are sung exactly as written. Write the rest of the song "
        "described in the brief and follow the rules exactly.",
        "",
        "BRIEF",
        brief.to_text(),
        "",
        "RULES",
        title_rule("the given lyrics")
        if not request.fixed_title
        else f'- Title: use exactly "{request.fixed_title}".',
        f"- {rules['style']}",
        "- Lyrics: they are given; do not change, shorten or add to them. Write only the word none after LYRICS:.",
        "- The given lyrics:",
        *[f"  {line}" if line.strip() else "" for line in request.given_lyrics.splitlines()],
        artwork_rule("the given lyrics"),
    ]
    parts += series_lines(brief)
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    if mode is not None:
        parts += writer_lines(mode, kind="song", closeness=brief.closeness, genre=brief.genre)
    parts += creativity_lines(
        brief.creativity, engine_id=request.engine_id, instrumental=False, lyrics="none", fixed_sections=True
    )
    multiline = bool(rules.get("style_multiline"))
    return "\n".join(
        [
            *parts,
            *_example_style(rules),
            "",
            *_layout("none", multiline=multiline, titles=not request.fixed_title),
        ]
    )


def melody_register_hint(vocal_range: tuple[int, int] | None) -> str:
    """The voice rule for a cover whose melody lies in one register (YuE2 does not transpose)."""
    if vocal_range is None:
        return ""
    lowest, highest = vocal_range
    register = melody_register(lowest, highest)
    span = f"{note_name(lowest)}-{note_name(highest)}"
    if register == "high":
        return f"The vocal melody lies high ({span}): describe a female or high voice in the style, not a male one."
    if register == "low":
        return f"The vocal melody lies low ({span}): describe a male or low voice in the style, not a female one."
    return ""


def reference_lines(reference_lyrics: str, sections: Sequence[str]) -> list[str]:
    """Per section, the source's sung lines with their syllable counts: the most direct fit guide.

    Empty when the reference is not sectioned like the score (then the phrase map is used).
    """
    parsed = lyrics_rules.parse_lyrics(reference_lyrics)
    language = syllables.guess_language(reference_lyrics)
    by_tag = {section.tag.lower(): section for section in parsed.sections}
    if not parsed.sections or not all(s.lower() in by_tag for s in sections):
        return []
    lines: list[str] = []
    for tag in sections:
        section = by_tag[tag.lower()]
        if not section.lines:
            lines.append(f"[{tag}]: no singing - leave the section empty")
            continue
        lines.append(f"[{tag}]: {len(section.lines)} line(s)")
        for line in section.lines:
            lines.append(f"    {lyrics_rules.estimate_syllables(line, language)} syllables, like: {line}")
    return lines


def lyrics_closeness_text(closeness: int) -> str:
    """A new-lyrics cover's lyrics closeness in words (empty for 0: the source's text plays no role)."""
    if closeness <= 0:
        return ""
    if closeness < 30:
        return "only a hint of the source's lyrics: your own story on the theme; at most one image or phrase may echo them."
    if closeness < 60:
        return "keep the source's theme and mood, told with your own story and images."
    if closeness < 90:
        return "retell the source's story and keep its central images, in new words."
    return (
        "stay as close to the source's lyrics as possible: the meaning, the images and the rhymes of every line; "
        "where the language differs, translate them line by line, singable on the same notes."
    )


def phrasing_lines(phrasing: Sequence[Mapping[str, Any]]) -> list[str]:
    """One line per score section: how many lyric lines and about how many syllables each."""
    lines = []
    for section in phrasing:
        phrases = [int(n) for n in section.get("phrases", [])]
        if not phrases:
            lines.append(f"{section['tag']}: no singing - leave the section empty")
            continue
        sizes = ", ".join(str(n) for n in phrases)
        lines.append(f"{section['tag']}: {len(phrases)} line(s) of about {sizes} syllables")
    return lines


def _compose_cover(
    brief: CoverBrief,
    engine: EngineInfo,
    *,
    detail: str,
    score_sections: Sequence[str],
    phrasing: Sequence[Mapping[str, Any]],
    language_hint: str,
    reference_lyrics: str,
    score_tempo: int | None,
    vocal_range: tuple[int, int] | None = None,
    creative: CreativeMode | None = None,
) -> tuple[str, Request]:
    """Cover prompt: melody, form and tempo come from the score; the LLM describes the new version.

    Original-lyrics covers take their lyrics from the source (the LLM writes title, style and
    artwork only); new-lyrics covers are written against the score's phrasing; instrumental covers
    use the score's section tags.
    """
    if not score_sections:
        raise PlenioValidationError(
            "A cover is written against its final score, but no score is connected.",
            hint="Connect the score output of Song Sheet · Score to Write Song.",
        )
    rules = rules_for(engine.engine_id).writing_rules(instrumental=brief.instrumental, target_seconds=180.0)
    sections = tuple(s.strip("[]") for s in score_sections)
    mode = {"original": "none", "new": "write", "instrumental": "tags"}[brief.vocals]
    request = Request(
        engine.engine_id,
        engine.rules_version,
        brief.fingerprint,
        brief.instrumental,
        sections,
        brief.title.strip(),
        kind="cover",
        lyrics_mode=mode,
        enforce_sections=mode == "write",
        sound_words=sound_words(brief),
    )
    tempo = (
        f" The source's tempo is {score_tempo} BPM: write exactly '{score_tempo} BPM'." if score_tempo else ""
    )
    parts = [
        f"You are a professional arranger preparing a cover version for the AI music model {rules['engine']}.",
        "The melody, the song form and the tempo come from the source recording; you describe the new version.",
        "",
        "BRIEF",
        brief.to_text(),
        "",
        "RULES",
        title_rule(
            "the source's lyrics below"
            if mode == "none" and reference_lyrics.strip()
            else "the lyrics you write"
            if mode == "write"
            else "the brief's description and theme"
        )
        if not request.fixed_title
        else f'- Title: use exactly "{request.fixed_title}".',
        f"- {rules['style']}{tempo}",
    ]
    register = melody_register_hint(vocal_range) if not brief.instrumental else ""
    if register:
        parts.append(f"- {register}")
    language = brief.language or language_hint
    if not brief.instrumental and language:
        parts.append(f"- The lyrics are in {language}: name the language first in the style.")
    if mode == "write":
        section_line = " ".join(f"[{s}]" for s in sections)
        parts += [
            f"- Lyrics: new lyrics on the existing melody, with exactly these sections in this order: {section_line}. "
            "Each section starts with its tag on its own line, a blank line between sections, only words to be "
            "sung (no stage directions, no repeat marks). A part the band plays without singing - a solo, a "
            "break - is its tag with no lines below it; never describe the playing in the lyrics.",
        ]
        targets = reference_lines(reference_lyrics, sections) if reference_lyrics.strip() else []
        closeness = brief.lyrics_closeness if reference_lyrics.strip() else 0
        own_words = (
            "Do not copy the source words" if closeness < 90 else "Keep the source words where they fit"
        )
        if closeness:
            parts.append(
                f"- Closeness to the source's lyrics ({closeness} of 100): {lyrics_closeness_text(closeness)}"
            )
        if targets:
            parts += [
                "- Fit the melody exactly: the melody was sung with the source lines below. Write the same "
                "number of lines per section, each new line with the SAME number of syllables as the source "
                f"line it replaces (count them). {own_words}:",
                *[f"  {line}" for line in targets],
            ]
        else:
            parts += [
                "- Fit the melody: one line per phrase, one syllable per note (count them):",
                *[f"  {line}" for line in phrasing_lines(phrasing)],
            ]
            if reference_lyrics.strip():
                use = (
                    "for phrasing and meaning only (do not copy them)"
                    if closeness < 90
                    else "to stay close to"
                )
                parts.append(f"- The source's lyrics, {use}:")
                parts += [f"  {line}" for line in reference_lyrics.strip().splitlines() if line.strip()]
        if brief.theme:
            parts.append(f"- Theme of the new lyrics: {brief.theme}")
        example = f"[{sections[0]}]\n<lines>\n..."
    else:
        reason = (
            "the original lyrics of the source are used" if mode == "none" else "the cover is instrumental"
        )
        parts.append(f"- Lyrics: {reason}; write only the word none after LYRICS:.")
        if mode == "none" and reference_lyrics.strip():
            # the cover's picture (and title) come from what the song is about (owner's request 2026-10-23)
            parts.append(
                "- The source's lyrics, for the artwork (they are sung as they are; do not rewrite them):"
            )
            parts += [f"  {line}" for line in reference_lyrics.strip().splitlines() if line.strip()]
        example = "none"
    parts.append(
        artwork_rule(
            "your lyrics"
            if mode == "write"
            else "the source's lyrics above"
            if mode == "none" and reference_lyrics.strip()
            else "the title of the source and the brief's description"
        )
    )
    parts += series_lines(brief)
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    if creative is not None:
        parts += writer_lines(creative, kind="cover", closeness=brief.closeness, genre=brief.genre)
    parts += creativity_lines(
        brief.creativity,
        engine_id=engine.engine_id,
        instrumental=brief.instrumental,
        lyrics="melody" if mode == "write" else "none",
        fixed_sections=True,
    )
    multiline = bool(rules.get("style_multiline"))
    parts += [
        *_example_style(rules),
        "",
        *_layout(example, multiline=multiline, titles=not request.fixed_title),
    ]
    return "\n".join(parts), request


SERIES_ANGLES = (
    "a personal story told in the first person",
    "a portrait of someone else, seen from the outside",
    "one single moment, described in close-up",
    "a journey from one place to another",
    "words addressed directly to someone",
    "a memory, looking back",
    "a place or an object that carries the feeling",
    "a turning point: before and after",
)
"""Batch mode: one of these is suggested per song, so a series from one brief does not repeat itself."""


def series_lines(brief: Any) -> list[str]:
    """The writer's rule for a song of a batch series (``brief.variation`` set); nothing otherwise."""
    variation = getattr(brief, "variation", None)
    if variation is None:
        return []
    lines = [
        f"- Series: this brief is used for a series of different songs (variation {variation}). Write a new "
        "song with its own title, story, images and hook - not the first idea that comes to mind."
    ]
    if not brief.instrumental and getattr(brief, "vocals", "") != "original":
        angle = SERIES_ANGLES[variation % len(SERIES_ANGLES)]
        lines.append(f"- Angle for this song, if it fits the brief: {angle}.")
    return lines


def _strip_thinking(text: str) -> tuple[str, bool]:
    stripped = text
    for pattern in _THINKING:
        stripped = pattern.sub("", stripped)
    return stripped, stripped != text


def _blocks(text: str) -> dict[str, str]:
    matches = list(_HEADING.finditer(text))
    # Use the last complete run of headings (models sometimes echo the format first).
    starts: dict[str, int] = {}
    for match in matches:
        starts[match.group(1).upper()] = matches.index(match)
    blocks: dict[str, str] = {}
    for name, index in starts.items():
        match = matches[index]
        following = [m.start() for m in matches if m.start() > match.start()]
        end = min(following) if following else len(text)
        inline = (match.group(2) or "").strip()
        body = (inline + "\n" if inline else "") + text[match.end() : end]
        blocks[name] = _FENCE.sub("", body).strip()
    return blocks


_DIRECTION_LINE = re.compile(r"^\s*[\(\{<].*[\)\}>]\s*$")
_REPEAT_MARK = re.compile(r"^(.*?)\s*\(\s*[x×]\s*([2-4])\s*\)\s*$", re.IGNORECASE)


_TAG_LINE = re.compile(r"^\**\s*\[[^\[\]\n]{1,40}\]\s*\**$")
_MARKER = re.compile(r"^\s*(?:#{1,6}|>|\*\*)\s*")


def _split_trailing_sentence(lyrics_text: str) -> tuple[str, str]:
    """Split off a final paragraph that reads like a sentence (an unlabelled artwork prompt)."""
    parts = lyrics_text.rstrip().rsplit("\n\n", 1)
    if len(parts) == 2:
        tail = _MARKER.sub("", parts[1].strip())
        if "\n" not in tail and len(tail.split()) >= 8 and tail.endswith(".") and not _TAG_LINE.match(tail):
            return parts[0].rstrip(), tail
    return lyrics_text, ""


def _infer_blocks(text: str) -> dict[str, str]:
    """Blocks of an answer without (complete) labels.

    Layout seen from real models: an optional title line, the style line(s),
    the ``[Tag]`` lyrics and a final artwork sentence; heading markers such as
    ``###`` may precede the content lines themselves.
    """
    lines = [line.rstrip() for line in _FENCE.sub("", text).strip().split("\n")]
    first_tag = next((i for i, line in enumerate(lines) if _TAG_LINE.match(line.strip())), None)
    head = []
    for line in lines[: len(lines) if first_tag is None else first_tag]:
        cleaned = _MARKER.sub("", line).strip()
        label = _HEADING.match(line)
        if label and not (label.group(2) or "").strip():
            continue  # a bare label line (for example '### LYRICS')
        if label:
            cleaned = (label.group(2) or "").strip()
        if cleaned:
            head.append(cleaned)
    if first_tag is None:
        return _infer_without_lyrics(head)
    blocks: dict[str, str] = {}
    if len(head) >= 2:
        blocks["TITLE"], blocks["STYLE"] = head[0], " ".join(head[1:])
    elif head:
        blocks["STYLE"] = head[0]
    body = []
    for line in lines[first_tag:]:
        label = _HEADING.match(line)
        if label and label.group(1).upper() == "ARTWORK":
            blocks["ARTWORK"] = (label.group(2) or "").strip()
            index = lines.index(line)
            rest = " ".join(_MARKER.sub("", item).strip() for item in lines[index + 1 :] if item.strip())
            blocks["ARTWORK"] = (blocks["ARTWORK"] + " " + rest).strip()
            break
        body.append(line)
    blocks["LYRICS"] = "\n".join(body).strip()
    return blocks


def _infer_without_lyrics(head: list[str]) -> dict[str, str]:
    """An answer without a lyrics tag (a cover that keeps its lyrics, an instrumental): the title line, the
    style line(s), a bare 'none' where the lyrics would be, and a final artwork sentence. Seen 2026-10-23
    from Qwen3.8 27B: 'Lay All Your Love On Me-cover', the style, 'none', the artwork."""
    lines = [line for line in head if line.lower().strip(" .") != "none"]
    if len(lines) < 2:
        return {}
    blocks = {"TITLE": lines[0]}
    if len(lines) >= 3 and len(lines[-1].split()) >= 8 and lines[-1].endswith("."):
        blocks["ARTWORK"] = lines.pop()
    blocks["STYLE"] = " ".join(lines[1:])
    return blocks


def _clean_lyrics(text: str, notes: list[str]) -> str:
    lines = []
    directions: list[str] = []
    converted = repeated = 0
    for raw in text.replace("\r\n", "\n").split("\n"):
        line = raw.strip().strip("*_").strip()
        bold = _BOLD_TAG.match(raw.strip())
        label = _LABEL_TAG.match(raw.strip())
        repeat = _REPEAT_MARK.match(line)
        if bold:
            line = f"[{bold.group(1).strip()}]"
        elif label:
            line = f"[{label.group(1).strip().title()}]"
            converted += 1
        elif _DIRECTION_LINE.match(line):
            directions.append(line)
            continue
        elif repeat and repeat.group(1):
            lines.extend([repeat.group(1)] * (int(repeat.group(2)) - 1))
            line = repeat.group(1)
            repeated += 1
        lines.append(line)
    if converted:
        notes.append(f"{converted} section label(s) such as 'Chorus:' were converted to [Chorus] tags")
    if repeated:
        notes.append(f"{repeated} repeat mark(s) such as '(x2)' were written out as repeated lines")
    lines, playing = lyrics_rules.without_playing_directions(lines)
    directions += playing
    if directions:
        notes.append(f"{len(directions)} stage direction line(s) were removed, e.g. {directions[0]!r}")
    return lyrics_rules.parse_lyrics("\n".join(lines)).format()


_NUMBERING = re.compile(r"^\s*(?:\d{1,2}[.)]|[-*•])\s*")


def title_candidates(text: str) -> list[str]:
    """The titles of a TITLES block, one a line (numbering, quotes and emphasis taken off)."""
    found: list[str] = []
    for line in text.replace("\r\n", "\n").split("\n"):
        title = _NUMBERING.sub("", line).strip().strip("\"'“”*#_ ").rstrip(".")
        if title and len(title.split()) <= 8 and title.casefold() not in {t.casefold() for t in found}:
            found.append(title[:80])
    return found


def _title_key(title: str) -> str:
    return re.sub(r"[\W_]+", " ", title).strip().casefold()


MUSIC_WORDS = frozenset(
    """
    music song songs tune tunes melody melodies rhythm rhythms beat beats groove grooves vibe vibes tempo bpm jam
    ballad anthem lullaby serenade instrumental acoustic lofi lo-fi chill smooth jazz jazzy blues bluesy rock pop
    funk funky soul disco techno house trance synth synthwave wave rap hiphop hip-hop metal punk reggae swing bossa
    samba tango waltz polka folk country gospel orchestra orchestral symphony piano guitar guitars sax saxophone
    drum drums bass strings violin cello trumpet choir remix mix
    """.split()
)
"""Words that name a sound, a genre or an instrument: a title made of them describes how a song sounds."""
_TITLE_WORD = re.compile(r"[^\W\d_]+(?:[-'][^\W\d_]+)*")


def sound_words(brief: Any) -> tuple[str, ...]:
    """The words of a brief's genre, mood and tempo (three letters at least): a title with one of them names the
    sound."""
    text = " ".join(str(getattr(brief, name, "") or "") for name in ("genre", "mood", "tempo"))
    return tuple(sorted({w for w in (m.casefold() for m in _TITLE_WORD.findall(text)) if len(w) >= 3}))


def _words(text: str) -> set[str]:
    return {w.casefold() for w in _TITLE_WORD.findall(text) if len(w) >= 3}


def pick_title(
    candidates: Sequence[str],
    taken: Iterable[str] = (),
    *,
    seed_text: str = "",
    sound: Iterable[str] = (),
    lyrics: str = "",
) -> tuple[str, str]:
    """One of the writer's titles at random - not one a song has already (``taken``) while others are left,
    and seeded by the answer, so the same answer gives the same title. The title and a note why.

    A title that names the sound - a word of the brief's genre, mood or tempo (``sound``) or of ``MUSIC_WORDS``
    that the ``lyrics`` do not sing - is left out while others are left (owner's request 2026-10-31: the title is
    what the song is about; a song about a guitar may still be called so)."""
    if not candidates:
        return "", ""
    used = {_title_key(t) for t in taken}
    fresh = [t for t in candidates if _title_key(t) not in used]
    pool = fresh or list(candidates)
    sung = _words(lyrics)
    soundish = (set(sound) | MUSIC_WORDS) - sung
    about = [t for t in pool if not _words(t) & soundish]
    notes: list[str] = []
    skipped = len(candidates) - len(fresh)
    if skipped and fresh:
        notes.append(f"{skipped} left out: a song has it already")
    if about and len(about) < len(pool):
        notes.append(f"{len(pool) - len(about)} left out: they name the sound, not the song")
        pool = about
    seed = int(hashlib.sha256(seed_text.encode("utf-8")).hexdigest()[:16], 16)
    title = pool[random.Random(seed).randrange(len(pool))]
    left_out = f" ({'; '.join(notes)})" if notes else ""
    return title, f"the title was picked at random from {len(candidates)} the writer proposed{left_out}"


def parse_draft(text: str, request: Request, taken: Iterable[str] = ()) -> Draft:
    """Extract and normalise the LLM answer. Raises when required blocks are missing. ``taken``: titles songs
    have already (a proposed title among them is not picked while others are left)."""
    notes: list[str] = []
    body, had_thinking = _strip_thinking(text)
    if had_thinking:
        notes.append("the model's thinking section was removed")
    blocks = _blocks(body)
    if not (blocks.get("STYLE") and blocks.get("LYRICS")):
        inferred = {
            name: value for name, value in _infer_blocks(body).items() if value and not blocks.get(name)
        }
        blocks.update(inferred)
        if inferred:
            notes.append("the model did not label every block; missing blocks were inferred from the layout")
    if blocks.get("LYRICS") and not blocks.get("ARTWORK"):
        lyrics_text, artwork = _split_trailing_sentence(blocks["LYRICS"])
        if artwork:
            blocks["LYRICS"], blocks["ARTWORK"] = lyrics_text, artwork
    required = ("STYLE", "LYRICS") if request.lyrics_mode == "write" else ("STYLE",)
    missing = [name.lower() for name in required if not blocks.get(name)]
    if missing:
        raise PlenioValidationError(
            f"The writing model's answer has no {' and no '.join(missing)} block.",
            diagnostics=[
                {
                    "severity": "error",
                    "message": f"answer starts with: {body.strip()[:200]!r}",
                    "where": "draft",
                }
            ],
            hint="Run again with another draft seed, or use a stronger writing model; the answer must use the "
            "headings ### TITLE, ### STYLE, ### LYRICS and ### ARTWORK.",
        )
    title = request.fixed_title or blocks.get("TITLE", "").split("\n")[0].strip().strip("\"'“”*# ")
    if not request.fixed_title and blocks.get("TITLES"):
        picked, why = pick_title(
            title_candidates(blocks["TITLES"]),
            taken,
            seed_text=body,
            sound=request.sound_words,
            lyrics=blocks.get("LYRICS", ""),
        )
        if picked:
            title = picked
            notes.append(why)
    if not title:
        title = "Untitled"
        notes.append("no title was given; 'Untitled' is used")
    style_raw = blocks["STYLE"]
    engine_rules = rules_for(request.engine_id)
    if getattr(engine_rules, "STYLE_MULTILINE", False):
        # a structured caption keeps its lines; only markdown emphasis and outer quotes go
        style = "\n".join(line.replace("*", "").strip() for line in style_raw.strip().split("\n"))
        style = re.sub(r"(?i)^style\s*:\s*", "", style.strip().strip("\"'“”"))
        if style != style_raw.strip():
            notes.append("the style was cleaned (markdown emphasis removed)")
    else:
        style = re.sub(r"\s+", " ", style_raw.replace("*", "")).strip().strip("\"'“”")
        style = re.sub(r"(?i)^style\s*:\s*", "", style).rstrip(".")
        if style != style_raw.strip():
            notes.append("the style was joined into one line and cleaned")
    style, style_notes = engine_rules.enforce_style(style, instrumental=request.instrumental)
    notes.extend(style_notes)
    if request.lyrics_mode == "none":
        lyrics = ""
    elif request.lyrics_mode == "given":
        lyrics = request.given_lyrics
        answered = blocks.get("LYRICS", "").strip()
        if answered and answered.lower().strip(" .") != "none":
            notes.append("the given lyrics are sung as written (the model's lyrics were not used)")
    elif request.lyrics_mode == "tags":
        lyrics = lyrics_rules.tags_only(request.sections)
        written = lyrics_rules.parse_lyrics(_clean_lyrics(blocks.get("LYRICS", ""), []))
        if written.words or (written.sections and written.tags != list(request.sections)):
            notes.append(
                f"instrumental: the lyrics are the tags {lyrics.replace(chr(10) * 2, ' ')} "
                f"(the model's {written.words} word(s) and its tags were not used)"
            )
    else:
        lyrics = _clean_lyrics(blocks["LYRICS"], notes)
    artwork = re.sub(r"\s+", " ", blocks.get("ARTWORK", "")).strip()
    return Draft(title[:80], style, lyrics, artwork, tuple(notes))


def _section_key(tag: str) -> str:
    return re.sub(r"\s*\d+$", "", tag.strip("[]").strip()).lower()


def section_mismatch(lyrics: str, sections: Sequence[str]) -> str | None:
    """A message when the lyrics' sections differ from the required ones (order and number)."""
    have = [_section_key(t) for t in lyrics_rules.parse_lyrics(lyrics).tags]
    want = [_section_key(t) for t in sections]
    if have == want:
        return None
    return (
        f"The lyrics have the sections {['[' + t + ']' for t in have]} but the score has "
        f"{['[' + t + ']' for t in want]}; they must match in number and order. Run again with another draft "
        "seed or edit the lyrics in the Song Sheet."
    )


def draft_findings(draft: Draft, request: Request) -> list[Mapping[str, Any]]:
    """Engine checks on the draft (the Song Sheet repeats them on the final documents)."""
    rules = rules_for(request.engine_id)
    findings = rules.check_style(draft.style, instrumental=request.instrumental)
    if request.lyrics_mode != "none":
        findings += rules.check_lyrics(draft.lyrics, instrumental=request.instrumental)
    if request.sparse_lines:
        findings += lyrics_rules.check_sparse(draft.lyrics, request.sparse_lines)
    result = [f.to_dict() for f in findings]
    if request.enforce_sections:
        mismatch = section_mismatch(draft.lyrics, request.sections)
        if mismatch:
            result.append({"severity": "error", "message": mismatch, "where": "lyrics"})
    return result
