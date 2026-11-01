"""YuE2 rules: documents, style conventions, exact context budget, planning mode, render ceiling.

Everything YuE2-specific lives here (and in the YuE2 blueprints). Facts are
from yue2-design.md sections 1, 3 and 5.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Protocol

from .. import lyrics as lyrics_rules
from .. import score as score_rules
from .. import song_form
from ..diagnostics import Finding, error, info, warning
from ..timefmt import clock as _clock

ENGINE_ID = "yue2"
RULES_VERSION = "plenio.yue2-rules/1"
DISPLAY_NAME = "YuE2"
CONTEXT_TOKENS = 24576
FRAMES_PER_SECOND = 25
MAX_SECONDS = 900.0
DEFAULT_MAX_SECONDS = 360.0
MIN_MUSIC_SECONDS = 30.0
PLANNING_MODES = ("full", "melody")
DOCUMENTS = ("title", "style", "lyrics", "score", "artwork_prompt")
STYLE_LABEL = "style"
STYLE_TARGET_WORDS, STYLE_WARN_WORDS, STYLE_MAX_WORDS = 40, 60, 120
MODEL_SECTIONS = (
    "Intro",
    "Verse",
    "Pre-Chorus",
    "Chorus",
    "Bridge",
    "Interlude",
    "Instrumental",
    "Outro",
)
"""The sections YuE2 learned. Its lyrics' sections come from SongFormer (YuE2 report, arXiv 2609.33757 App. C:
"section boundaries and functional labels"), whose labels are intro, verse, pre-chorus, chorus, bridge, inst,
silence and outro (arXiv 2510.02797 §II-A); upstream's examples write them as tags in title case (``[Pre-Chorus]``)
and add ``[Interlude]``, and its instrumental skill names ``% intro`` ... ``% outro`` and ``% instrumental`` in the
score. Every other tag reaches YuE2 as plain text: it marks a section, its name is no more than a hint."""
TAG_VOCABULARY = (
    *MODEL_SECTIONS,
    "Post-Chorus",
    "Hook",
    "Refrain",
    "Solo",
    "Break",
    "Breakdown",
    "Drop",
    "Build",
)
"""The tags Plenio knows: YuE2's own sections, then those Plenio fits to a plan by a related section (a hook
sings on a chorus's melody, a solo or a break without words is an instrumental part - ``core.song_form``). Tags
of one's own work like these: words make a sung section, none an instrumental one."""
LICENCE = "CC BY-NC 4.0 (YuE2-3B, YuE2 VAE): non-commercial use only"

_WORD = re.compile(r"[^\W_][\w'’+#/-]*", re.UNICODE)
_TIMESTAMP = re.compile(r"\b\d{1,2}:\d{2}\b")
# a unit only after a number: "a warm, driving second half" is a style (half of the owner's cover series of
# 2026-10-23 stopped at it), "3 minutes" is a length
_TIMING = re.compile(
    r"(?i)\b(?:(?:\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|"
    r"fifty|sixty|ninety)[\s-]*(?:seconds?|secs?|minutes?|mins?)|duration|target length)\b"
)
_TAGS_IN_STYLE = re.compile(r"\[[^\]]{1,30}\]")
_STRUCTURE = re.compile(r"(?i)\b(intro|verse|pre-chorus|chorus|bridge|outro|hook)\b")
_ABC = re.compile(r"(?m)^(X:|K:|M:|L:|Q:|V:)")
_NEGATION = re.compile(r"(?i)\b(no|not|without|never|avoid|don't|dont|non)\b")
_VOCAL_TERMS = re.compile(
    r"(?i)\b(vocals?|vocalists?|voices?|voiced|singers?|singing|sung|sings?|rap|rapper|rapping|choirs?|chants?|"
    r"humming|hum|lyrics?|a\s?cappella|falsetto|duet|crooner|belting|spoken word|"
    # voice types, but not the instruments named after them (tenor sax, baritone guitar, alto flute)
    r"(?:(?:mezzo-?)?soprano|alto|contralto|tenor|baritone|countertenor)"
    r"(?![\s-]*(?:sax\w*|guitars?|ukuleles?|horns?|recorders?|trombones?|clarinets?|flutes?|banjos?|violins?)\b))\b"
)
_NOT_AN_INSTRUMENT = r"(?![\s-]*(?:sax\w*|guitars?|ukuleles?|horns?|recorders?|trombones?|clarinets?|flutes?|banjos?|violins?)\b)"
_MALE_VOICE = re.compile(
    r"(?i)\b(?:male|man|men|boy|baritone|basso|bass (?:voice|vocals?|singer)|(?:counter)?tenor)\b"
    + _NOT_AN_INSTRUMENT
)
_FEMALE_VOICE = re.compile(
    r"(?i)\b(?:female|woman|women|girl|(?:mezzo-?)?soprano|alto|contralto)\b" + _NOT_AN_INSTRUMENT
)
HIGH_MELODY_LOWEST = 60
"""A melody whose lowest note is at or above C4 lies in a female register."""
LOW_MELODY_HIGHEST = 60
"""A melody whose highest note is at or below C4 lies in a male register."""
VOCAL_WRITTEN_LOWEST = 40
"""E2: a bass's lowest sung note - and transcriptions write melodies an octave above the singing."""
VOCAL_WRITTEN_HIGHEST = 96
"""C7: a soprano's high C written an octave up, as SheetSage2 writes melodies; no voice sings higher."""
_NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")


def note_name(midi: int) -> str:
    return f"{_NOTE_NAMES[midi % 12]}{midi // 12 - 1}"


def voice_register(style: str) -> str:
    """``male``, ``female`` or ``""`` (none or both named)."""
    male, female = bool(_MALE_VOICE.search(style)), bool(_FEMALE_VOICE.search(style))
    return "male" if male and not female else "female" if female and not male else ""


def melody_register(lowest: int | None, highest: int | None) -> str:
    """``high`` (female register), ``low`` (male register) or ``""`` for a vocal melody's range."""
    if lowest is None or highest is None:
        return ""
    return "high" if lowest >= HIGH_MELODY_LOWEST else "low" if highest <= LOW_MELODY_HIGHEST else ""


def check_register(style: str, lowest: int | None, highest: int | None) -> list[Finding]:
    """Warn when the style asks for a voice whose register the (fixed) melody does not fit.

    Phase 4B cover of M2 (melody F#4-A5): the same new lyrics were sung at WER 1.13 by a
    "warm male baritone" and at WER 0.50 by a "soft female vocal". YuE2 does not transpose.
    """
    voice, melody = voice_register(style), melody_register(lowest, highest)
    if not voice or not melody or lowest is None or highest is None:
        return []
    span = f"{note_name(lowest)}-{note_name(highest)}"
    if voice == "male" and melody == "high":
        advice = "transpose the score down an octave (Score Tools: transpose, -12) or ask for a female voice"
    elif voice == "female" and melody == "low":
        advice = "transpose the score up an octave (Score Tools: transpose, +12) or ask for a male voice"
    else:
        return []
    return [
        warning(
            f"The style asks for a {voice} voice, but the vocal melody lies at {span}; YuE2 sings it as written and "
            f"the words become hard to understand. {advice[0].upper()}{advice[1:]}.",
            "style",
            lowest=lowest,
            highest=highest,
        )
    ]


def check_vocal_range(lowest: int | None, highest: int | None) -> list[Finding]:
    """Warn about a vocal melody that reaches where no voice sings: an octave slip (a MIDI keyboard
    played an octave off, notes moved too far). The ABC stays valid - YuE2 just cannot sing it."""
    if lowest is None or highest is None:
        return []
    found: list[Finding] = []
    if lowest < VOCAL_WRITTEN_LOWEST:
        found.append(
            warning(
                f"The vocal melody goes down to {note_name(lowest)}, below any singing voice; YuE2 cannot sing it "
                "as written. An octave slip? Select the notes and move them up (+8va).",
                "score",
                lowest=lowest,
            )
        )
    if highest > VOCAL_WRITTEN_HIGHEST:
        found.append(
            warning(
                f"The vocal melody goes up to {note_name(highest)}, above any singing voice; YuE2 cannot sing it "
                "as written. An octave slip? Select the notes and move them down (-8va).",
                "score",
                highest=highest,
            )
        )
    return found


_LANGUAGES = re.compile(
    r"(?i)\b(english|german|deutsch|french|spanish|italian|portuguese|japanese|korean|chinese|mandarin|"
    r"cantonese|russian|dutch|swedish|polish|turkish|arabic|hindi)\b"
)


class Tokenizer(Protocol):
    """Exact token counts from the loaded YuE2 text encoder (provided by the ComfyUI adapter)."""

    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        """Length of the conditioning prefix, including the start and ABC-start tokens."""
        ...

    def abc_tokens(self, abc: str) -> int:
        """Tokens of the ABC text itself (without delimiters)."""
        ...


def capabilities() -> dict[str, Any]:
    return {
        "documents": list(DOCUMENTS),
        "score": True,
        "planning_modes": list(PLANNING_MODES),
        "frames_per_second": FRAMES_PER_SECOND,
        "context_tokens": CONTEXT_TOKENS,
        "max_seconds": MAX_SECONDS,
        "default_max_seconds": DEFAULT_MAX_SECONDS,
        "licence": LICENCE,
    }


# --- derived render parameters --------------------------------------------------------


def planning_mode(score: str) -> str:
    """Render mode derived from the final score: chords -> ``full``, otherwise ``melody``.

    For an empty score the native node switches to ``off`` by itself; ``full``
    is returned so that the combo value stays valid.
    """
    if not score.strip():
        return "full"
    return "full" if score_rules.has_chords(score) else "melody"


def render_ceiling(score_duration_s: float) -> float:
    """``clamp(duration x 1.15 + 10 s, 30 s, 900 s)``: headroom so a planned song is never cut."""
    return float(min(max(score_duration_s * 1.15 + 10.0, MIN_MUSIC_SECONDS), MAX_SECONDS))


@dataclass(frozen=True)
class Budget:
    prefix_tokens: int
    abc_tokens: int
    music_tokens: int

    @property
    def music_seconds(self) -> float:
        return self.music_tokens / FRAMES_PER_SECOND

    def to_dict(self) -> dict[str, Any]:
        return {
            "context_tokens": CONTEXT_TOKENS,
            "prefix_tokens": self.prefix_tokens,
            "abc_tokens": self.abc_tokens,
            "music_tokens": self.music_tokens,
            "music_seconds": round(self.music_seconds, 2),
        }


def budget(tokenizer: Tokenizer, style: str, lyrics: str, score: str) -> Budget:
    """Exact context arithmetic of the native encoder (yue2-design section 5.2)."""
    mode = planning_mode(score)
    has_score = bool(score.strip())
    prefix = tokenizer.prefix_tokens(style, lyrics, mode if has_score else "off")
    abc = tokenizer.abc_tokens(score) if has_score else 0
    used = prefix + abc + 2  # ABC_END, MUSIC_START
    return Budget(prefix, abc, CONTEXT_TOKENS - used)


def describe_budget(data: Mapping[str, Any]) -> str:
    """One line for node summaries (``Budget.to_dict()``)."""
    used = int(data["prefix_tokens"]) + int(data["abc_tokens"])
    return f"{float(data['music_seconds']):.0f} s of music fit ({used} tokens used)"


# --- document rules ---------------------------------------------------------------------


def check_style(style: str, *, instrumental: bool) -> list[Finding]:
    findings: list[Finding] = []
    text = style.strip()
    if not text:
        return [error("The style is empty; describe genre, instruments, mood and tempo.", "style")]
    words = len(_WORD.findall(text))
    if words > STYLE_MAX_WORDS:
        findings.append(
            error(
                f"The style has {words} words; YuE2 takes at most {STYLE_MAX_WORDS} (about {STYLE_TARGET_WORDS} work best: "
                "genre, instruments, mood, voice and tempo).",
                "style",
            )
        )
    elif words > STYLE_WARN_WORDS:
        findings.append(
            warning(
                f"The style has {words} words; YuE2 works best with about {STYLE_TARGET_WORDS} (a hint, not a "
                f"limit: up to {STYLE_MAX_WORDS} are accepted).",
                "style",
            )
        )
    if "\n" in text:
        findings.append(warning("The style spans several lines; use one comma-separated line.", "style"))
    if _ABC.search(text):
        findings.append(
            error("The style contains ABC notation; the score belongs in the score document.", "style")
        )
    if _TIMESTAMP.search(text) or _TIMING.search(text):
        findings.append(
            error(
                "The style contains timing or duration; song length is set by the brief and the score.",
                "style",
            )
        )
    if _TAGS_IN_STYLE.search(text):
        findings.append(
            error("The style contains bracketed tags; section tags belong in the lyrics.", "style")
        )
    elif _STRUCTURE.search(text):
        findings.append(warning("The style mentions song sections; describe sound, not structure.", "style"))
    negation = _NEGATION.search(text)
    if negation:
        findings.append(
            warning(
                f"Negations such as {negation.group(0)!r} are unreliable; describe what you want positively.",
                "style",
            )
        )
    if instrumental:
        vocal = _VOCAL_TERMS.search(text)
        if vocal:
            findings.append(
                error(f"Instrumental style must not mention vocals ({vocal.group(0)!r}).", "style")
            )
        language = _LANGUAGES.search(text)
        if language:
            findings.append(
                error(f"Instrumental style must not name a language ({language.group(0)!r}).", "style")
            )
    elif not _VOCAL_TERMS.search(text):
        findings.append(
            info("Upstream recommends naming the vocal character (and language) in the style.", "style")
        )
    return findings


def enforce_style(style: str, *, instrumental: bool) -> tuple[str, list[str]]:
    """Deterministic draft fixes for everything ``check_style`` calls an error but an empty style: ABC lines
    and bracketed tags go, descriptors with a timing or past the word limit are dropped, and for
    instrumentals the descriptors that mention vocals or a language. An unchanged style comes back as it was."""
    notes: list[str] = []
    lines = [line.strip() for line in style.split("\n")]
    abc = [line for line in lines if _ABC.match(line) or "|" in line] if _ABC.search(style) else []
    if abc:
        lines = [line for line in lines if line not in abc]
        notes.append(f"removed {len(abc)} line(s) of ABC notation")
    text = ", ".join(line.rstrip(",") for line in lines if line) if len(lines) > 1 or abc else style
    tags = _TAGS_IN_STYLE.findall(text)
    if tags:
        text = _TAGS_IN_STYLE.sub("", text)
        notes.append(f"removed the tags {tags}")
    kept: list[str] = []
    timing: list[str] = []
    vocal: list[str] = []
    for descriptor in (part.strip() for part in text.split(",")):
        if not descriptor:
            continue
        if _TIMESTAMP.search(descriptor) or _TIMING.search(descriptor):
            timing.append(descriptor)
        elif instrumental and (_VOCAL_TERMS.search(descriptor) or _LANGUAGES.search(descriptor)):
            vocal.append(descriptor)
        else:
            kept.append(descriptor)
    if timing:
        notes.append(f"removed the timing {timing} (the brief and the score set the length)")
    if vocal:
        notes.append(f"instrumental: removed style descriptors {vocal}")
    words = 0
    for count, descriptor in enumerate(kept):
        words += len(_WORD.findall(descriptor))
        if words > STYLE_MAX_WORDS:
            notes.append(f"cut the style at {STYLE_MAX_WORDS} words")
            kept = kept[:count] or [" ".join(descriptor.split()[:STYLE_MAX_WORDS])]
            break
    if not notes:
        return style, []
    return ", ".join(kept), notes


def check_lyrics(lyrics: str, *, instrumental: bool) -> list[Finding]:
    return lyrics_rules.check_lyrics(lyrics, instrumental=instrumental, vocabulary=TAG_VOCABULARY)


def check_score(
    score: str,
    *,
    instrumental: bool,
    lyrics: str = "",
    target_seconds: float | None = None,
    sparse: bool = False,
) -> tuple[list[Finding], float | None]:
    """Findings and the nominal score duration (``None`` without a valid score)."""
    if not score.strip():
        return [info("No score: YuE2 renders without a plan (off mode).", "score")], None
    analysis = score_rules.analyze(score)
    if not analysis.ok:
        return [error(d.message, f"score bar {d.bar}" if d.bar else "score") for d in analysis.errors], None
    vocal_notes = analysis.voices["Vocal"]["notes"]
    if not vocal_notes and not analysis.voices["Ins"]["notes"]:
        # I12 (next-release plan §9.5): a score of rests cannot be rendered (e.g. an unfilled DAW skeleton)
        return [
            error(
                "The score contains only rests; YuE2 cannot render a score without notes. "
                "Add notes in the score editor, or remove the score to render without a plan.",
                "score",
            )
        ], analysis.duration_s
    findings: list[Finding] = [
        warning(d.message, "score") for d in analysis.diagnostics if d.severity == "warning"
    ]
    vocal = analysis.voices["Vocal"]
    findings += check_vocal_range(vocal.get("lowest"), vocal.get("highest"))
    if instrumental and vocal_notes:
        findings.append(
            error(
                f"Instrumental songs need a silent Vocal voice, but it has {vocal_notes} notes; "
                "run Score Tools 'prepare from brief'.",
                "score",
            )
        )
    if lyrics.strip():
        findings.extend(
            lyrics_rules.compare_sections(
                lyrics, [s.tag for s in analysis.sections], song_form.sung_flags(score, analysis.sections)
            )
        )
    # instrumental plans are fitted to 0.8-1.2 x the target by 'prepare from brief' (study E6); sung plans
    # follow their lyrics
    low, high = (0.75, 1.25) if instrumental else (0.6, 1.5)
    if target_seconds and not low * target_seconds <= analysis.duration_s <= high * target_seconds:
        advice = (
            # instrumental plans ignore tags and timed tags (Phase 4A E4b)
            "YuE2 chooses the length of instrumental plans itself, and Score Tools 'fit length' could not bring "
            "this one close: repeat or delete sections in the score, or plan again with another seed."
            if instrumental
            else "With sparse vocals the plan follows the sections: add or remove empty sections in the lyrics, "
            "plan again with another seed, or edit the score."
            if sparse
            else "The plan follows the amount of lyrics: shorten or lengthen them, or edit the score."
        )
        findings.append(
            warning(
                f"The score lasts {_clock(analysis.duration_s)} but the brief asks for about {_clock(target_seconds)}. "
                + advice,
                "score",
            )
        )
    return findings, analysis.duration_s


@dataclass(frozen=True)
class Validation:
    findings: tuple[Finding, ...]
    planning_mode: str
    score_seconds: float
    budget: Budget | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "findings": [f.to_dict() for f in self.findings],
            "planning_mode": self.planning_mode,
            "score_seconds": round(self.score_seconds, 2),
            "budget": self.budget.to_dict() if self.budget else None,
        }


def validate_documents(
    docs: Mapping[str, str],
    *,
    instrumental: bool,
    tokenizer: Tokenizer | None,
    max_seconds: float | None = None,
    check: tuple[str, ...] = ("style", "lyrics", "score"),
    target_seconds: float | None = None,
    sparse: bool = False,
) -> Validation:
    """Validate the documents a Song Sheet owns (``check``) with the others as context; ``sparse``: a song with
    sparse vocals (a few sung lines)."""
    style, lyrics, score = docs.get("style", ""), docs.get("lyrics", ""), docs.get("score", "")
    findings: list[Finding] = []
    if "style" in check:
        findings += check_style(style, instrumental=instrumental)
    if "lyrics" in check:
        findings += check_lyrics(lyrics, instrumental=instrumental)
        if sparse and target_seconds:
            findings += lyrics_rules.check_sparse(lyrics, lyrics_rules.sparse_line_limit(target_seconds))
    duration: float | None = None
    if "score" in check:
        score_findings, duration = check_score(
            score, instrumental=instrumental, lyrics=lyrics, target_seconds=target_seconds, sparse=sparse
        )
        findings += score_findings
    elif score.strip():
        analysis = score_rules.analyze(score)
        duration = analysis.duration_s if analysis.ok else None
        if analysis.ok and "lyrics" in check and lyrics.strip() and not instrumental:
            findings += lyrics_rules.compare_sections(
                lyrics, [s.tag for s in analysis.sections], song_form.sung_flags(score, analysis.sections)
            )
            # lyrics written for an existing melody (covers): do they fit its notes?
            findings += lyrics_rules.syllable_fit(lyrics, score_rules.phrasing(score))
        if analysis.ok and "style" in check and style.strip() and not instrumental:
            vocal = analysis.voices.get("Vocal", {})
            if vocal.get("notes"):
                findings += check_register(style, vocal.get("lowest"), vocal.get("highest"))
    ceiling = (
        render_ceiling(duration) if duration else float(min(max_seconds or DEFAULT_MAX_SECONDS, MAX_SECONDS))
    )
    result_budget: Budget | None = None
    score_ok = not score.strip() or duration is not None
    if tokenizer is None:
        findings.append(
            info(
                "The exact token budget is checked when the workflow runs (it needs the loaded YuE2 tokenizer).",
                "budget",
            )
        )
    elif style.strip() and score_ok:
        result_budget = budget(tokenizer, style, lyrics, score)
        seconds = result_budget.music_seconds
        if seconds < MIN_MUSIC_SECONDS:
            findings.append(
                error(
                    f"Style, lyrics and score use {CONTEXT_TOKENS - result_budget.music_tokens} of {CONTEXT_TOKENS} "
                    f"tokens; only {seconds:.0f} s of music would fit. Shorten the lyrics or the score.",
                    "budget",
                )
            )
        elif duration and seconds < duration:
            findings.append(
                warning(
                    f"Only {seconds:.0f} s of music fit into the context, but the score lasts {duration:.0f} s; "
                    "the song cannot finish.",
                    "budget",
                )
            )
        elif seconds < ceiling:
            findings.append(
                info(
                    f"The music budget ({seconds:.0f} s) is below the render ceiling ({ceiling:.0f} s).",
                    "budget",
                )
            )
    return Validation(tuple(findings), planning_mode(score) if score_ok else "full", ceiling, result_budget)


# --- writing guidance -------------------------------------------------------------------


SECONDS_PER_LYRIC_LINE = 8.0
"""Measured in the Phase 3 smoke run: YuE2 plans about 8-10 s per sung line (4/4, 80-90 BPM)."""


def lyric_lines(target_seconds: float) -> int:
    """About how many sung lines fit the target length."""
    return max(6, round(target_seconds / SECONDS_PER_LYRIC_LINE))


def section_plan(target_seconds: float) -> list[str]:
    """A typical section order for a target length (only used to guide the writer).

    The planned duration follows the amount of lyrics, so short songs get few sections.
    """
    if target_seconds <= 110:
        return ["Intro", "Verse", "Chorus", "Outro"]
    if target_seconds <= 200:
        return ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Chorus", "Outro"]
    return [
        "Intro",
        "Verse",
        "Pre-Chorus",
        "Chorus",
        "Verse",
        "Pre-Chorus",
        "Chorus",
        "Bridge",
        "Chorus",
        "Chorus",
        "Outro",
    ]


def sparse_sections(target_seconds: float) -> list[str]:
    """The section map of a song with sparse vocals: as many sections as a sung song of the length (the planner
    gives empty sections their own music, as in upstream's instrumental planning), its words in a few hooks."""
    return lyrics_rules.sparse_form(
        len(section_plan(target_seconds)), lyrics_rules.sparse_hooks(target_seconds)
    )


def writing_rules(*, instrumental: bool, target_seconds: float, sparse: bool = False) -> dict[str, Any]:
    """The writer's rules; ``sparse``: a sung song with sparse vocals (a few short lines in a mostly instrumental
    song)."""
    plan = sparse_sections(target_seconds) if sparse else section_plan(target_seconds)
    style = (
        f"Style: one line of comma-separated descriptors, at most {STYLE_TARGET_WORDS} words: genre and sub-genre, "
        "key instruments, "
        + ("the lead instrument, " if instrumental else "vocal character and the language of the lyrics, ")
        + "mood and production adjectives, and the tempo as 'NN BPM'. "
        "No sentences, no song structure, no timing or duration, no negations"
        + (", and no mention of vocals, voices, singers or languages." if instrumental else ".")
    )
    lyrics = (
        "Lyrics: write only the tag [instrumental] - no words and no other tags (YuE2 plans the form itself)."
        if instrumental
        else lyrics_rules.sparse_rule(plan, lyrics_rules.sparse_line_limit(target_seconds))
        + " YuE2 plays the empty sections as instrumental parts."
        if sparse
        else "Lyrics: each section starts with a tag on its own line (for example [Verse]), followed by the sung "
        "lines; a blank line between sections. Only words to be sung: no stage directions, no notes, no "
        "parentheses, no repeat marks like (x2) - write repeated lines out. Instrumental sections such as "
        f"[Intro] stay empty, and so does a part the band plays without singing (a solo, a break): never describe the playing in the lyrics. "
        f"Section tags YuE2 knows: {' '.join(f'[{tag}]' for tag in MODEL_SECTIONS)}; also understood: "
        f"{' '.join(f'[{tag}]' for tag in TAG_VOCABULARY if tag not in MODEL_SECTIONS)}. "
        f"The song lasts about {int(target_seconds // 60)}:{int(target_seconds % 60):02d}, "
        f"so write about {lyric_lines(target_seconds)} sung lines in total (YuE2 sings roughly one line every "
        f"{SECONDS_PER_LYRIC_LINE:.0f} seconds)."
    )
    example_style = (
        "cinematic post-rock, clean electric guitars, piano, strings, warm bass, brushed drums, lead guitar melody, "
        "uplifting, spacious, 92 BPM"
        if instrumental
        else "English, atmospheric downtempo, airy female voice with sparse vocal hooks, warm pads, deep bass, soft "
        "drums, hypnotic, spacious, 90 BPM"
        if sparse
        else "English, warm piano pop, expressive female voice, acoustic piano, rounded bass and light drums, "
        "lyrical memorable melody, unhurried phrasing, 88 BPM"
    )
    return {
        "engine": DISPLAY_NAME,
        "style": style,
        "lyrics": lyrics,
        "sections": plan,
        "example_style": example_style,
        "tags": list(TAG_VOCABULARY),
        "model_tags": list(MODEL_SECTIONS),
    }
