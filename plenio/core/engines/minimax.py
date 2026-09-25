"""MiniMax Music 3 rules: structured caption, lyrics tags, exact prompt budget, render ceiling.

Everything MiniMax-specific lives here (and in the MiniMax blueprints). The document called
``style`` in the Song Sheet is MiniMax's **caption**. Facts from ComfyUI 0.37.0
(``comfy/ldm/minimax_music``, ``comfy_extras/nodes_minimax_music.py``): the text encoder
builds ``<|im_start|><|caption_start|>{caption}<|caption_end|><|lyrics_start|>[start]\\n{lyrics}
<|lyrics_end|><|im_end|><|audio_start|>`` and refuses prompts over 5 000 tokens; at most
9 000 audio frames at 25 frames/s (360 s) are generated; the model can end earlier.

The caption layout (three headings: Global Metadata, Vocal Details, Arrangement) and the
instrumental conventions (``Vocal Details: n/a``, a tags-only section map about twice as long
as a sung song's, because MiniMax ends short maps early) come from the legacy toolkit's
measured MiniMax prompts (v3.1.3).
"""

from __future__ import annotations

import math
import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Protocol

from .. import lyrics as lyrics_rules
from ..diagnostics import Finding, error, info, warning

ENGINE_ID = "minimax_music3"
RULES_VERSION = "plenio.minimax-rules/1"
DISPLAY_NAME = "MiniMax Music 3"
MAX_PROMPT_TOKENS = 5000
FRAMES_PER_SECOND = 25
MAX_AUDIO_FRAMES = 9000
MAX_SECONDS = MAX_AUDIO_FRAMES / FRAMES_PER_SECOND  # 360 s
DEFAULT_MAX_SECONDS = 180.0
MIN_SECONDS = 10.0
DOCUMENTS = ("title", "style", "lyrics", "artwork_prompt")
STYLE_LABEL = "caption"
STYLE_MULTILINE = True
"""The caption keeps its lines (headings); YuE2's style is one line."""
CAPTION_HEADINGS = ("Global Metadata", "Vocal Details", "Arrangement")
CAPTION_TARGET_WORDS, CAPTION_WARN_WORDS, CAPTION_MIN_WORDS = 300, 600, 12
TAG_VOCABULARY = (
    "Intro",
    "Verse",
    "Pre-Chorus",
    "Chorus",
    "Post-Chorus",
    "Hook",
    "Bridge",
    "Break",
    "Drop",
    "Interlude",
    "Instrumental",
    "Solo",
    "Outro",
)
INSTRUMENTAL_TAGS = ("Intro", "Instrumental", "Bridge", "Break", "Drop", "Interlude", "Solo", "Outro")
LICENCE = "MiniMax-Music3 Community License (MiniMax Music 3): commercial use under the licence's conditions"
ESTIMATE_CHARS_PER_TOKEN = 3.5
"""Legacy calibration (German/English); exact counts need the loaded tokenizer."""
PROMPT_OVERHEAD_TOKENS = 12
"""The special tokens and ``[start]`` line around caption and lyrics (for the estimate only)."""

_WORD = re.compile(r"[^\W_][\w'’+#/-]*", re.UNICODE)
_HEADING = re.compile(
    r"(?im)^\s*(?:#+\s*)?\**\s*(global metadata|vocal details|arrangement)\s*\**\s*:?\s*(.*)$"
)
_ABC = re.compile(r"(?m)^(X:|K:|M:|L:|Q:|V:)")
_TAG_LINE = re.compile(r"(?m)^\s*\[[^\]\n]{1,40}\]\s*$")
_SPECIAL = re.compile(r"<\|[^|]*\|>")
_VOCAL_TERMS = re.compile(
    r"(?i)\b(vocals?|vocalists?|voices?|singers?|singing|sung|sings?|rap|rapper|rapping|choirs?|chants?|"
    r"humming|lyrics?|a\s?cappella|falsetto|duet|crooner|belting|spoken word|"
    r"(?:(?:mezzo-?)?soprano|alto|contralto|tenor|baritone|countertenor)"
    r"(?![\s-]*(?:sax\w*|guitars?|ukuleles?|horns?|recorders?|trombones?|clarinets?|flutes?|banjos?|violins?)\b))\b"
)
_NOT_APPLICABLE = re.compile(r"(?i)^\s*(n/?a|none|instrumental|no vocals?)\.?\s*$")


class Tokenizer(Protocol):
    """Exact prompt token counts from the loaded MiniMax text encoder (provided by the adapter)."""

    def prompt_tokens(self, caption: str, lyrics: str) -> int:
        """Tokens of the complete native prompt (special tokens included)."""
        ...


def capabilities() -> dict[str, Any]:
    return {
        "documents": list(DOCUMENTS),
        "score": False,
        "planning_modes": [],
        "frames_per_second": FRAMES_PER_SECOND,
        "prompt_tokens": MAX_PROMPT_TOKENS,
        "max_seconds": MAX_SECONDS,
        "default_max_seconds": DEFAULT_MAX_SECONDS,
        "style_label": STYLE_LABEL,
        "licence": LICENCE,
    }


# --- budget and ceiling -------------------------------------------------------------------


def estimate_tokens(caption: str, lyrics: str) -> int:
    """A conservative estimate without the tokenizer (never used to refuse a run)."""
    text = f"{caption}\n{lyrics}"
    if not text.strip():
        return 0
    return math.ceil(len(text) / ESTIMATE_CHARS_PER_TOKEN) + PROMPT_OVERHEAD_TOKENS


@dataclass(frozen=True)
class Budget:
    prompt_tokens: int
    exact: bool

    @property
    def remaining(self) -> int:
        return MAX_PROMPT_TOKENS - self.prompt_tokens

    def to_dict(self) -> dict[str, Any]:
        return {
            "max_prompt_tokens": MAX_PROMPT_TOKENS,
            "prompt_tokens": self.prompt_tokens,
            "remaining_tokens": self.remaining,
            "exact": self.exact,
        }


def budget(tokenizer: Tokenizer | None, caption: str, lyrics: str) -> Budget:
    if tokenizer is None:
        return Budget(estimate_tokens(caption, lyrics), exact=False)
    return Budget(int(tokenizer.prompt_tokens(caption, lyrics)), exact=True)


def describe_budget(data: Mapping[str, Any]) -> str:
    """One line for node summaries (``Budget.to_dict()``)."""
    kind = "exact" if data.get("exact") else "estimate"
    return f"{data['prompt_tokens']} of {data['max_prompt_tokens']} prompt tokens ({kind})"


def render_ceiling(max_seconds: float | None) -> float:
    """``max_duration`` for the text encoder: the brief's ceiling, at most 360 s (the model may end earlier)."""
    seconds = float(max_seconds) if max_seconds else DEFAULT_MAX_SECONDS
    return float(min(max(seconds, MIN_SECONDS), MAX_SECONDS))


# --- caption ----------------------------------------------------------------------------


def caption_sections(caption: str) -> dict[str, str]:
    """The text under each of the three headings (lower-case keys); empty when not structured."""
    matches = list(_HEADING.finditer(caption))
    sections: dict[str, str] = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(caption)
        body = (match.group(2) + "\n" + caption[match.end() : end]).strip()
        sections[match.group(1).lower()] = body
    return sections


def check_style(style: str, *, instrumental: bool) -> list[Finding]:
    """Rules of the caption (the Song Sheet's ``style`` document)."""
    text = style.strip()
    if not text:
        return [error("The caption is empty; describe genre, instruments, vocals and arrangement.", "style")]
    findings: list[Finding] = []
    words = len(_WORD.findall(text))
    if words < CAPTION_MIN_WORDS:
        findings.append(
            warning(
                f"The caption has only {words} words; MiniMax follows a detailed caption (about "
                f"{CAPTION_TARGET_WORDS} words: genre, tempo and key, vocals, arrangement).",
                "style",
            )
        )
    elif words > CAPTION_WARN_WORDS:
        findings.append(
            warning(
                f"The caption has {words} words; about {CAPTION_TARGET_WORDS} are enough, and caption and lyrics "
                f"together must stay under {MAX_PROMPT_TOKENS} tokens.",
                "style",
            )
        )
    if _ABC.search(text):
        findings.append(error("The caption contains ABC notation; MiniMax Music 3 takes no score.", "style"))
    if _TAG_LINE.search(text):
        findings.append(error("The caption contains section tags; they belong in the lyrics.", "style"))
    if _SPECIAL.search(text):
        findings.append(
            warning(
                "The caption contains <|...|> markers; the encoder rewrites them as plain words.", "style"
            )
        )
    sections = caption_sections(text)
    missing = [h for h in CAPTION_HEADINGS if h.lower() not in sections]
    if sections and missing:
        findings.append(
            info(f"The structured caption has no {', '.join(missing)} section.", "style", missing=missing)
        )
    elif not sections:
        findings.append(
            info(
                "The caption is free text; the structured form (Global Metadata, Vocal Details, Arrangement) "
                "describes the song more reliably.",
                "style",
            )
        )
    if instrumental:
        vocal_details = sections.get("vocal details")
        if vocal_details is not None and not _NOT_APPLICABLE.match(vocal_details):
            findings.append(error("An instrumental caption's Vocal Details must be exactly 'n/a'.", "style"))
        rest = "\n".join(v for k, v in sections.items() if k != "vocal details") if sections else text
        vocal = _VOCAL_TERMS.search(rest)
        if vocal:
            findings.append(
                warning(
                    f"The instrumental caption mentions vocals ({vocal.group(0)!r}); describe instruments only.",
                    "style",
                )
            )
    elif sections and _NOT_APPLICABLE.match(sections.get("vocal details", "x")):
        findings.append(
            error("The song is sung, but the caption's Vocal Details say it is instrumental.", "style")
        )
    return findings


def enforce_style(style: str, *, instrumental: bool) -> tuple[str, list[str]]:
    """Deterministic draft fixes: headings on their own lines; instrumental Vocal Details = ``n/a``."""
    lines = [line.rstrip() for line in style.replace("\r\n", "\n").split("\n")]
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()
    notes: list[str] = []
    if instrumental:
        sections = caption_sections(text)
        details = sections.get("vocal details")
        if details is not None and not _NOT_APPLICABLE.match(details):
            match = next(m for m in _HEADING.finditer(text) if m.group(1).lower() == "vocal details")
            following = [m.start() for m in _HEADING.finditer(text) if m.start() > match.start()]
            end = following[0] if following else len(text)
            text = text[: match.start()] + "Vocal Details\nn/a\n\n" + text[end:].lstrip("\n")
            notes.append("instrumental: the caption's Vocal Details were set to 'n/a'")
    return text.strip(), notes


# --- lyrics ---------------------------------------------------------------------------------


def check_lyrics(lyrics: str, *, instrumental: bool) -> list[Finding]:
    findings = lyrics_rules.check_lyrics(lyrics, instrumental=instrumental, vocabulary=TAG_VOCABULARY)
    parsed = lyrics_rules.parse_lyrics(lyrics)
    if instrumental and parsed.sections:
        vocal_tags = [
            s.tag
            for s in parsed.sections
            if re.sub(r"\s*\d+$", "", s.tag).lower()
            in {"verse", "pre-chorus", "chorus", "post-chorus", "hook"}
        ]
        if vocal_tags:
            findings.append(
                warning(
                    f"Vocal section tags {sorted(set(vocal_tags))} invite singing; instrumentals use [Intro], "
                    "[Instrumental], [Solo], [Break], [Bridge] and [Outro].",
                    "lyrics",
                )
            )
        if len(parsed.sections) < 5:
            findings.append(
                warning(
                    f"The instrumental map has {len(parsed.sections)} section(s); MiniMax ends short maps early - "
                    "use about twice as many sections as a sung song of the same length.",
                    "lyrics",
                )
            )
    return findings


# --- validation ------------------------------------------------------------------------------


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
    check: tuple[str, ...] = ("style", "lyrics"),
    target_seconds: float | None = None,
) -> Validation:
    """Validate the documents a Song Sheet owns; ``score_seconds`` is the render ceiling (max duration)."""
    caption, lyrics, score = docs.get("style", ""), docs.get("lyrics", ""), docs.get("score", "")
    findings: list[Finding] = []
    if "style" in check:
        findings += check_style(caption, instrumental=instrumental)
    if "lyrics" in check:
        findings += check_lyrics(lyrics, instrumental=instrumental)
    if "score" in check and score.strip():
        findings.append(
            error("MiniMax Music 3 takes no score; remove the score from this Song Sheet.", "score")
        )
    ceiling = render_ceiling(max_seconds)
    if max_seconds and max_seconds > MAX_SECONDS:
        findings.append(
            warning(
                f"MiniMax Music 3 renders at most {MAX_SECONDS:.0f} s; the render ceiling is {MAX_SECONDS:.0f} s.",
                "budget",
            )
        )
    result = budget(tokenizer, caption, lyrics) if (caption.strip() or lyrics.strip()) else None
    if result is not None:
        if result.prompt_tokens > MAX_PROMPT_TOKENS:
            message = (
                f"Caption and lyrics use {result.prompt_tokens} tokens; MiniMax Music 3 accepts at most "
                f"{MAX_PROMPT_TOKENS}. Shorten the caption or the lyrics by {-result.remaining} tokens."
            )
            findings.append(
                error(message, "budget", prompt_tokens=result.prompt_tokens)
                if result.exact
                else warning(
                    message.replace("use", "use about", 1)
                    + " (estimate; the exact count runs with the model)",
                    "budget",
                    prompt_tokens=result.prompt_tokens,
                )
            )
        elif not result.exact:
            findings.append(
                info(
                    f"About {result.prompt_tokens} of {MAX_PROMPT_TOKENS} prompt tokens (estimate; the exact count "
                    "is checked when the workflow runs with the loaded MiniMax text encoder).",
                    "budget",
                )
            )
        elif result.remaining < 250:
            findings.append(
                info(f"{result.prompt_tokens} of {MAX_PROMPT_TOKENS} prompt tokens used.", "budget")
            )
    if target_seconds and lyrics.strip() and not instrumental:
        lines = sum(len(s.lines) for s in lyrics_rules.parse_lyrics(lyrics).sections)
        expected = lyric_lines(target_seconds)
        if lines and not 0.5 * expected <= lines <= 2.0 * expected:
            findings.append(
                warning(
                    f"The lyrics have {lines} sung lines; for about {_clock(target_seconds)} MiniMax needs roughly "
                    f"{expected}.",
                    "lyrics",
                )
            )
    return Validation(tuple(findings), "full", ceiling, result)


def _clock(seconds: float) -> str:
    return f"{int(seconds // 60)}:{int(round(seconds % 60)):02d}"


# --- writing guidance --------------------------------------------------------------------------


SECONDS_PER_LYRIC_LINE = 5.0
"""Legacy guidance: about 45-55 lyric lines for a five-minute song."""


def lyric_lines(target_seconds: float) -> int:
    return max(8, round(target_seconds / SECONDS_PER_LYRIC_LINE))


def section_plan(target_seconds: float) -> list[str]:
    if target_seconds <= 100:
        return ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"]
    if target_seconds <= 200:
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
            "Outro",
        ]
    return [
        "Intro",
        "Verse",
        "Pre-Chorus",
        "Chorus",
        "Verse",
        "Pre-Chorus",
        "Chorus",
        "Bridge",
        "Solo",
        "Chorus",
        "Chorus",
        "Outro",
    ]


def instrumental_sections(target_seconds: float) -> list[str]:
    """A tags-only section map, about twice as long as a sung song's (MiniMax ends short maps early)."""
    body = 2 * len(section_plan(target_seconds)) - 2
    tags = ["Instrumental"] * body
    if body >= 6:
        tags[body // 2] = "Solo"
    if body >= 8:
        tags[(3 * body) // 4] = "Break"
    return ["Intro", *tags, "Outro"]


def writing_rules(*, instrumental: bool, target_seconds: float) -> dict[str, Any]:
    plan = instrumental_sections(target_seconds) if instrumental else section_plan(target_seconds)
    vocal = (
        "Vocal Details: write exactly n/a on the line after the heading."
        if instrumental
        else "Vocal Details: the lead voice (gender, register, timbre, delivery), backing vocals and the language."
    )
    style = (
        "Style (the MiniMax caption): about 150 to 300 words in exactly three headed parts, each heading on its "
        "own line: 'Global Metadata' (a first line like 'bpm is 92. key is D, and scale is minor. Indie pop / "
        "dream pop.', then the emotional arc and the production sound), 'Vocal Details' ("
        + vocal
        + "), and 'Arrangement' (the instruments, how groove and density develop, and one short sentence per "
        "section in the order of the lyrics). Describe sound, not feelings about sound; no artist names; no "
        "section tags and no lyric lines in the caption."
    )
    if instrumental:
        tags = " ".join(f"[{t}]" for t in plan)
        lyrics = (
            f"Lyrics: only section tags, each on its own line, in this order: {tags}. No words. Repeated "
            "[Instrumental] sections are intended; the caption's Arrangement gives each one a different function."
        )
    else:
        lyrics = (
            "Lyrics: each section starts with a tag on its own line (for example [Verse]), followed by the sung "
            "lines; a blank line between sections. Only words to be sung: no stage directions, no instruments, "
            "no timing, no repeat marks like (x2) - write repeated lines out. Instrumental sections such as "
            f"[Intro] stay empty. The song lasts about {_clock(target_seconds)}, so write about "
            f"{lyric_lines(target_seconds)} sung lines in total."
        )
    example_style = (
        "Global Metadata\nbpm is 96. key is E, and scale is minor. Cinematic post-rock / ambient.\nA slow build from "
        "a lonely piano motif to a wide, bright climax and a quiet resolution; warm, spacious, clean dynamics.\n\n"
        "Vocal Details\nn/a\n\nArrangement\nPiano carries the motif; clean electric guitars and strings layer in; "
        "brushed drums enter in the second section and turn to full kit at the climax; the solo is a sustained "
        "lead guitar; the outro returns to solo piano."
        if instrumental
        else "Global Metadata\nbpm is 88. key is A, and scale is major. Piano pop / soft rock.\nIntimate verses "
        "open into a warm, anthemic chorus; clean, close production with a gentle stereo width.\n\nVocal Details\n"
        "English lyrics; warm female alto lead, soft and breathy in the verses, full and bright in the chorus; "
        "light harmonies in the last chorus.\n\nArrangement\nAcoustic piano and rounded bass carry the verses; "
        "drums and strings enter in the pre-chorus; the bridge drops to piano and voice before the final chorus."
    )
    return {
        "engine": DISPLAY_NAME,
        "style": style,
        "lyrics": lyrics,
        "sections": plan,
        "instrumental_sections": plan if instrumental else [],
        "example_style": example_style,
        "tags": list(TAG_VOCABULARY),
        "style_multiline": STYLE_MULTILINE,
    }
