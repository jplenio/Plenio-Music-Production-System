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
TAG_VOCABULARY = (
    "Intro",
    "Verse",
    "Pre-Chorus",
    "Chorus",
    "Post-Chorus",
    "Hook",
    "Refrain",
    "Bridge",
    "Interlude",
    "Instrumental",
    "Solo",
    "Break",
    "Drop",
    "Build",
    "Outro",
)
LICENCE = "CC BY-NC 4.0 (YuE2-3B, YuE2 VAE): non-commercial use only"

_WORD = re.compile(r"[^\W_][\w'’+#/-]*", re.UNICODE)
_TIMESTAMP = re.compile(r"\b\d{1,2}:\d{2}\b")
_TIMING = re.compile(r"(?i)\b(seconds?|secs?|minutes?|mins?|duration|target length)\b")
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
                f"The style has {words} words; keep it under {STYLE_MAX_WORDS} (target {STYLE_TARGET_WORDS}).",
                "style",
            )
        )
    elif words > STYLE_WARN_WORDS:
        findings.append(
            warning(f"The style has {words} words; YuE2 works best with about {STYLE_TARGET_WORDS}.", "style")
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
    """Deterministic draft fixes: for instrumentals, drop descriptors that mention vocals or a language."""
    if not instrumental:
        return style, []
    kept: list[str] = []
    dropped: list[str] = []
    for descriptor in (part.strip() for part in style.split(",")):
        if not descriptor:
            continue
        (dropped if _VOCAL_TERMS.search(descriptor) or _LANGUAGES.search(descriptor) else kept).append(
            descriptor
        )
    if not dropped:
        return style, []
    return ", ".join(kept), [f"instrumental: removed style descriptors {dropped}"]


def check_lyrics(lyrics: str, *, instrumental: bool) -> list[Finding]:
    return lyrics_rules.check_lyrics(lyrics, instrumental=instrumental, vocabulary=TAG_VOCABULARY)


def check_score(
    score: str, *, instrumental: bool, lyrics: str = "", target_seconds: float | None = None
) -> tuple[list[Finding], float | None]:
    """Findings and the nominal score duration (``None`` without a valid score)."""
    if not score.strip():
        return [info("No score: YuE2 renders without a plan (off mode).", "score")], None
    analysis = score_rules.analyze(score)
    if not analysis.ok:
        return [error(d.message, f"score bar {d.bar}" if d.bar else "score") for d in analysis.errors], None
    findings: list[Finding] = [
        warning(d.message, "score") for d in analysis.diagnostics if d.severity == "warning"
    ]
    vocal_notes = analysis.voices["Vocal"]["notes"]
    if instrumental and vocal_notes:
        findings.append(
            error(
                f"Instrumental songs need a silent Vocal voice, but it has {vocal_notes} notes; "
                "run Score Tools 'prepare from brief'.",
                "score",
            )
        )
    if lyrics.strip():
        findings.extend(lyrics_rules.compare_sections(lyrics, [s.tag for s in analysis.sections]))
    if target_seconds and not 0.6 * target_seconds <= analysis.duration_s <= 1.5 * target_seconds:
        advice = (
            # instrumental plans ignore tags and timed tags (Phase 4A E4b); Score Tools fit length cuts whole sections
            "YuE2 chooses the length of instrumental plans itself: use Score Tools 'fit length', delete sections in "
            "the score, or plan again with another seed."
            if instrumental
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
) -> Validation:
    """Validate the documents a Song Sheet owns (``check``) with the others as context."""
    style, lyrics, score = docs.get("style", ""), docs.get("lyrics", ""), docs.get("score", "")
    findings: list[Finding] = []
    if "style" in check:
        findings += check_style(style, instrumental=instrumental)
    if "lyrics" in check:
        findings += check_lyrics(lyrics, instrumental=instrumental)
    duration: float | None = None
    if "score" in check:
        score_findings, duration = check_score(
            score, instrumental=instrumental, lyrics=lyrics, target_seconds=target_seconds
        )
        findings += score_findings
    elif score.strip():
        analysis = score_rules.analyze(score)
        duration = analysis.duration_s if analysis.ok else None
        if analysis.ok and "lyrics" in check and lyrics.strip() and not instrumental:
            findings += lyrics_rules.compare_sections(lyrics, [s.tag for s in analysis.sections])
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


def writing_rules(*, instrumental: bool, target_seconds: float) -> dict[str, Any]:
    plan = section_plan(target_seconds)
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
        else "Lyrics: each section starts with a tag on its own line (for example [Verse]), followed by the sung "
        "lines; a blank line between sections. Only words to be sung: no stage directions, no notes, no "
        "parentheses, no repeat marks like (x2) - write repeated lines out. Instrumental sections such as "
        f"[Intro] stay empty. The song lasts about {int(target_seconds // 60)}:{int(target_seconds % 60):02d}, "
        f"so write about {lyric_lines(target_seconds)} sung lines in total (YuE2 sings roughly one line every "
        f"{SECONDS_PER_LYRIC_LINE:.0f} seconds)."
    )
    example_style = (
        "cinematic post-rock, clean electric guitars, piano, strings, warm bass, brushed drums, lead guitar melody, "
        "uplifting, spacious, 92 BPM"
        if instrumental
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
    }
