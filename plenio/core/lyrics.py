"""Sectioned lyrics: ``[Tag]`` on its own line, sung lines beneath, a blank line between sections.

Model independent. Engines add their own rules (tag vocabulary, limits) on top.
"""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from . import syllables
from .diagnostics import Finding, error, info, warning

_TAG = re.compile(r"^\[([^\[\]\n]{1,40})\]$")
_REPEAT = re.compile(r"(?i)(\(\s*x\s*\d+\s*\)|\bx\s*\d+\s*$|\brepeat\b|\(\s*\d+\s*x\s*\))")
_DIRECTION = re.compile(r"^\s*[\(\[\{<].*[\)\]\}>]\s*$")
_WORD = re.compile(r"[^\W\d_][\w'’-]*", re.UNICODE)
_VOWELS = re.compile(r"[aeiouyäöüàáâèéêìíîòóôùúûæøå]+", re.IGNORECASE)


@dataclass(frozen=True)
class LyricsSection:
    tag: str
    lines: tuple[str, ...]

    @property
    def words(self) -> int:
        return sum(len(_WORD.findall(line)) for line in self.lines)


@dataclass(frozen=True)
class Lyrics:
    preamble: tuple[str, ...]
    sections: tuple[LyricsSection, ...]

    @property
    def tags(self) -> list[str]:
        return [section.tag for section in self.sections]

    @property
    def words(self) -> int:
        return sum(section.words for section in self.sections) + sum(
            len(_WORD.findall(line)) for line in self.preamble
        )

    @property
    def is_tags_only(self) -> bool:
        return not self.preamble and all(not section.lines for section in self.sections)

    def format(self) -> str:
        blocks = []
        if self.preamble:
            blocks.append("\n".join(self.preamble))
        for section in self.sections:
            blocks.append("\n".join([f"[{section.tag}]", *section.lines]))
        return "\n\n".join(blocks)


def parse_lyrics(text: str) -> Lyrics:
    preamble: list[str] = []
    sections: list[LyricsSection] = []
    current: tuple[str, list[str]] | None = None
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw.strip()
        match = _TAG.match(line)
        if match:
            if current is not None:
                sections.append(LyricsSection(current[0], tuple(current[1])))
            current = (match.group(1).strip(), [])
            continue
        if not line:
            continue
        if current is None:
            preamble.append(line)
        else:
            current[1].append(line)
    if current is not None:
        sections.append(LyricsSection(current[0], tuple(current[1])))
    return Lyrics(tuple(preamble), tuple(sections))


def tags_only(tags: Sequence[str]) -> str:
    """Lyrics consisting only of section tags (instrumental conditioning)."""
    return "\n\n".join(f"[{tag}]" for tag in tags)


def estimate_syllables(line: str, language: str = "") -> int:
    """A syllable estimate of a sung line (``syllables.count``: rules for English and German); a hint, not a
    measurement."""
    return syllables.count(line, language)


def check_lyrics(text: str, *, instrumental: bool, vocabulary: Sequence[str] = ()) -> list[Finding]:
    """Model-independent lyrics rules; ``vocabulary`` is the engine's list of known tags."""
    lyrics = parse_lyrics(text)
    findings: list[Finding] = []
    if not text.strip():
        if instrumental:
            findings.append(
                warning("The lyrics are empty; use section tags such as [Intro] and [Verse].", "lyrics")
            )
        else:
            findings.append(error("The lyrics are empty.", "lyrics"))
        return findings
    if not lyrics.sections:
        findings.append(
            error("The lyrics have no section tags; start each section with a line like [Verse].", "lyrics")
        )
    if lyrics.preamble:
        findings.append(
            warning(f"{len(lyrics.preamble)} line(s) appear before the first section tag.", "lyrics")
        )
    if instrumental and lyrics.words:
        findings.append(
            error(
                f"Instrumental lyrics must contain only section tags, but {lyrics.words} word(s) were found.",
                "lyrics",
            )
        )
    known = {tag.lower() for tag in vocabulary}
    for section in lyrics.sections:
        base = re.sub(r"\s*\d+$", "", section.tag).lower()
        if known and base not in known:
            findings.append(info(f"Unusual section tag [{section.tag}].", "lyrics"))
        for line in section.lines:
            if _REPEAT.search(line):
                findings.append(warning(f"Repeat shorthand in {line!r}; write repeated lines out.", "lyrics"))
            elif _DIRECTION.match(line):
                findings.append(warning(f"Stage direction {line!r} would be sung; remove it.", "lyrics"))
    if not instrumental and lyrics.sections and all(not s.lines for s in lyrics.sections):
        findings.append(error("The song is sung but no section contains words.", "lyrics"))
    return findings


SYLLABLE_FIT_LOW = 0.85
SYLLABLE_FIT_HIGH = 1.3
"""Syllables per melody note of a section outside which YuE2 did not sing the words clearly.
Phase 4B calibration on the M2 cover: the original lyrics (WER 0) and the 4A new lyrics the owner
judged "good, fitting" had 0.87-0.98; the writer's lyrics sung at WER 1.14 had 0.67-0.80."""


def syllable_fit(lyrics_text: str, phrasing: Sequence[Mapping[str, Any]]) -> list[Finding]:
    """Warn when a section's lyrics have far fewer or more syllables than its melody has notes.

    ``phrasing`` is ``score.phrasing(abc)`` of the final score. The syllables are an estimate, so
    this is a warning, not an error.
    """
    by_tag = {section.tag.lower(): section for section in parse_lyrics(lyrics_text).sections}
    language = syllables.guess_language(lyrics_text)
    findings: list[Finding] = []
    for part in phrasing:
        notes = sum(int(n) for n in part.get("phrases", []))
        section = by_tag.get(str(part["tag"]).strip("[]").lower())
        if not notes or section is None or not section.lines:
            continue
        count = sum(estimate_syllables(line, language) for line in section.lines)
        ratio = count / notes
        if SYLLABLE_FIT_LOW <= ratio <= SYLLABLE_FIT_HIGH:
            continue
        direction = "too few" if ratio < SYLLABLE_FIT_LOW else "too many"
        findings.append(
            warning(
                f"{part['tag']} has about {count} syllables for {notes} melody notes ({direction}); YuE2 may "
                f"not sing the words clearly. Write about one syllable per note (lines of about "
                f"{', '.join(str(n) for n in part['phrases'])} syllables).",
                "lyrics",
                tag=part["tag"],
                syllables=count,
                notes=notes,
                ratio=round(ratio, 2),
            )
        )
    return findings


def compare_sections(
    lyrics_text: str, score_tags: Sequence[str], sung: Sequence[bool] | None = None
) -> list[Finding]:
    """Warn when the lyrics' section order differs from the score's sections. With ``sung`` (per score
    section: has it Vocal notes?) only the sung sections are compared - where the words land; an
    instrumental intro the lyrics do not name is no mismatch."""
    parsed = parse_lyrics(lyrics_text)
    if sung is not None and len(sung) == len(score_tags):
        words = [re.sub(r"\s*\d+$", "", s.tag).lower() for s in parsed.sections if s.lines]
        melody = [t.strip("[]").lower() for t, has in zip(score_tags, sung, strict=True) if has]
        if not words or not melody or words == melody:
            return []
        return [
            warning(
                f"The lyrics sing in the sections {words} but the score's sung sections are {melody}; words may "
                "land on melodies planned for other words. Plan again (another plan seed), or arrange the sections "
                "in the score editor.",
                "lyrics",
            )
        ]
    tags = [re.sub(r"\s*\d+$", "", t).lower() for t in parsed.tags]
    expected = [t.strip("[]").lower() for t in score_tags]
    if not tags or not expected or tags == expected or tags == ["instrumental"]:
        return []  # the bare [instrumental] tag lets the plan choose its own form
    return [
        warning(
            f"The lyrics have sections {tags} but the score has {expected}; align them so words land in the intended sections.",
            "lyrics",
        )
    ]
