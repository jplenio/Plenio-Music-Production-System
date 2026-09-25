"""Writing prompts for any LLM, and robust parsing of its answer.

``compose`` turns a brief plus the engine's writing rules into one plain
prompt. ``parse_draft`` extracts title, style, lyrics and artwork prompt from
whatever the LLM answered, and enforces the format deterministically; every
enforcement is reported (never silent).
"""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from .brief import CoverBrief, SongBrief
from .engines import EngineInfo, rules_for
from .engines.yue2 import melody_register, note_name
from .errors import PlenioValidationError

REQUEST_SCHEMA = "plenio.request/1"
BLOCKS = ("TITLE", "STYLE", "LYRICS", "ARTWORK")
DETAIL = {
    "concise": "Keep it compact: short sections with few lines.",
    "standard": "",
    "rich": "Use vivid, specific imagery and varied phrasing.",
}
# A label line: "TITLE: text", "### STYLE", "**Lyrics:**". Without a colon the label must stand alone,
# so that a lyric line such as "Style is everything" is never taken for a label.
_HEADING = re.compile(
    r"(?im)^[ \t>*#_\-]*\**\s*(TITLE|STYLE|LYRICS|ARTWORK)\s*\**(?:\s*:\s*\**[ \t]*(.*?)\**[ \t]*|[ \t]*)$"
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
) -> tuple[str, Request]:
    """The writing prompt for ``brief`` under the rules of ``engine``.

    Songs: the LLM writes title, style and lyrics; instrumental songs get the single tag
    ``[instrumental]`` from Plenio. Covers: the score defines the sections (see ``_compose_cover``).
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
        )
    rules = rules_for(engine.engine_id).writing_rules(
        instrumental=brief.instrumental, target_seconds=brief.target_seconds
    )
    if brief.instrumental:
        # YuE2: the single tag [instrumental]; engines that need a section map (MiniMax) provide one.
        sections: tuple[str, ...] = tuple(rules.get("instrumental_sections") or (INSTRUMENTAL_TAG,))
    else:
        sections = tuple(s.strip("[]") for s in score_sections) or tuple(rules["sections"])
    request = Request(
        engine.engine_id,
        engine.rules_version,
        brief.fingerprint,
        brief.instrumental,
        sections,
        fixed_title.strip(),
        lyrics_mode="tags" if brief.instrumental else "write",
    )
    parts = [
        f"You are a professional songwriter preparing a song for the AI music model {rules['engine']}.",
        "Write the song described in the brief below and follow the rules exactly.",
        "",
        "BRIEF",
        brief.to_text(),
        "",
        "RULES",
        "- Title: 1 to 6 words, no quotes."
        if not request.fixed_title
        else f'- Title: use exactly "{request.fixed_title}".',
        f"- {rules['style']}",
        f"- {rules['lyrics']}",
    ]
    if not brief.instrumental:
        section_line = " ".join(f"[{s}]" for s in sections)
        parts.append(
            f"- Sections, in this order: {section_line}"
            + (
                " (these follow the score and must not change)."
                if score_sections
                else " (adapt only if the brief asks for it)."
            )
        )
    parts.append("- Artwork: one sentence describing a square cover image; no text or letters in the image.")
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    example = lyrics_rules.tags_only(sections) if brief.instrumental else f"[{sections[0]}]\n<lines>\n..."
    parts += [*_example_style(rules), "", *_layout(example, multiline=bool(rules.get("style_multiline")))]
    return "\n".join(parts), request


def _example_style(rules: Mapping[str, Any]) -> list[str]:
    example = str(rules["example_style"])
    return ["", "Example style:", example] if "\n" in example else ["", f"Example style: {example}"]


def _layout(lyrics_example: str, *, multiline: bool = False) -> list[str]:
    return [
        "Write your answer in exactly this layout. Keep the four labels TITLE:, STYLE:, LYRICS: and ARTWORK: "
        "and replace the text in angle brackets; write nothing before or after it.",
        "",
        "TITLE: <the title>",
        *(
            ["STYLE:", "<the style, on several lines as described>"]
            if multiline
            else ["STYLE: <the style line>"]
        ),
        "LYRICS:",
        lyrics_example,
        "ARTWORK: <one sentence>",
    ]


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
            lines.append(f"    {lyrics_rules.estimate_syllables(line)} syllables, like: {line}")
    return lines


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
        "- Title: 1 to 6 words, no quotes."
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
            "sung (no stage directions, no repeat marks).",
        ]
        targets = reference_lines(reference_lyrics, sections) if reference_lyrics.strip() else []
        if targets:
            parts += [
                "- Fit the melody exactly: the melody was sung with the source lines below. Write the same "
                "number of lines per section, each new line with the SAME number of syllables as the source "
                "line it replaces (count them). Do not copy the source words:",
                *[f"  {line}" for line in targets],
            ]
        else:
            parts += [
                "- Fit the melody: one line per phrase, one syllable per note (count them):",
                *[f"  {line}" for line in phrasing_lines(phrasing)],
            ]
            if reference_lyrics.strip():
                parts.append("- The source's lyrics, for phrasing and meaning only (do not copy them):")
                parts += [f"  {line}" for line in reference_lyrics.strip().splitlines() if line.strip()]
        if brief.theme:
            parts.append(f"- Theme of the new lyrics: {brief.theme}")
        example = f"[{sections[0]}]\n<lines>\n..."
    else:
        reason = (
            "the original lyrics of the source are used" if mode == "none" else "the cover is instrumental"
        )
        parts.append(f"- Lyrics: {reason}; write only the word none after LYRICS:.")
        example = "none"
    parts.append("- Artwork: one sentence describing a square cover image; no text or letters in the image.")
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    parts += [*_example_style(rules), "", *_layout(example, multiline=bool(rules.get("style_multiline")))]
    return "\n".join(parts), request


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
    if first_tag is None:
        return {}
    head = []
    for line in lines[:first_tag]:
        cleaned = _MARKER.sub("", line).strip()
        label = _HEADING.match(line)
        if label and not (label.group(2) or "").strip():
            continue  # a bare label line (for example '### LYRICS')
        if label:
            cleaned = (label.group(2) or "").strip()
        if cleaned:
            head.append(cleaned)
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
    if directions:
        notes.append(f"{len(directions)} stage direction line(s) were removed, e.g. {directions[0]!r}")
    return lyrics_rules.parse_lyrics("\n".join(lines)).format()


def parse_draft(text: str, request: Request) -> Draft:
    """Extract and normalise the LLM answer. Raises when required blocks are missing."""
    notes: list[str] = []
    body, had_thinking = _strip_thinking(text)
    if had_thinking:
        notes.append("the model's thinking section was removed")
    blocks = _blocks(body)
    if not (blocks.get("STYLE") and blocks.get("LYRICS")):
        inferred = _infer_blocks(body)
        for name, value in inferred.items():
            if value and not blocks.get(name):
                blocks[name] = value
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
    result = [f.to_dict() for f in findings]
    if request.enforce_sections:
        mismatch = section_mismatch(draft.lyrics, request.sections)
        if mismatch:
            result.append({"severity": "error", "message": mismatch, "where": "lyrics"})
    return result
