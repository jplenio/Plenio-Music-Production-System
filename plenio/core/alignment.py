"""Placing transcribed (ASR) words into a score's sections, and checking sung lyrics.

Pure functions; no audio, no model. Measured behaviour (Phase 4A E2b): midpoint
placement on the SheetSage2 beat grid plus the *pickup rule* put 99.4-100 % of
the words into the right section wherever the singer followed the lyric sheet.

Placement never invents or reorders words. The only words left out are short
phrases outside the vocal melody (typical ASR inventions after the singing,
such as "Thank you."); they are reported so the user can re-add them.
"""

from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from .score.native import Section
from .score.timeline import Timeline

PHRASE_GAP_S = 0.3
"""A pause of at least this length starts a new phrase."""
LINE_GAP_S = 0.9
"""A pause longer than this starts a new line in the draft."""
INVENTION_WINDOW_S = 6.0
INVENTION_MAX_WORDS = 8
"""Sign-off inventions such as "I'll see you next time." are short; a longer passage is kept even off the melody."""
LOW_CONFIDENCE = 0.5

_APOSTROPHES = str.maketrans({"’": "'", "‘": "'", "`": "'", "´": "'"})
_NON_WORD = re.compile(r"[^\w' ]+")


@dataclass(frozen=True)
class AsrWord:
    start: float
    end: float
    word: str
    p: float = 1.0
    segment: int = 0

    @property
    def mid(self) -> float:
        return (self.start + self.end) / 2

    def to_dict(self) -> dict[str, Any]:
        return {
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "word": self.word,
            "p": round(self.p, 3),
            "segment": self.segment,
        }


def words_from(rows: Iterable[Mapping[str, Any]]) -> list[AsrWord]:
    return [
        AsrWord(
            float(r["start"]),
            float(r["end"]),
            str(r["word"]).strip(),
            float(r.get("p", 1.0)),
            int(r.get("segment", 0)),
        )
        for r in rows
        if str(r.get("word", "")).strip()
    ]


def normalize_words(text: str) -> list[str]:
    """Word list for comparisons: section tags removed, case, apostrophes and punctuation folded."""
    text = unicodedata.normalize("NFKC", text).translate(_APOSTROPHES).lower()
    text = re.sub(r"\[[^\]]*\]", " ", text)
    text = _NON_WORD.sub(" ", text.replace("-", " "))
    return [w.strip("'") for w in text.split() if w.strip("'")]


# --- placement ------------------------------------------------------------------------------


def _is_head(words: Sequence[AsrWord], index: int) -> bool:
    """A phrase starts at the first word, after a pause, or where the ASR starts a new segment."""
    if index == 0:
        return True
    previous, current = words[index - 1], words[index]
    return current.start - previous.end >= PHRASE_GAP_S or current.segment != previous.segment


def _section_of_bar(sections: Sequence[Section]) -> list[int]:
    lookup: list[int] = []
    for index, section in enumerate(sections):
        lookup.extend([index] * section.bars)
    return lookup


def place_on_grid(
    words: Sequence[AsrWord], bar_starts: Sequence[float], sections: Sequence[Section]
) -> list[int]:
    """Section index per word: midpoint bar on the grid, then the pickup rule."""
    lookup = _section_of_bar(sections)
    if not lookup or not bar_starts:
        return [0] * len(words)

    def bar_of(time_s: float) -> int:
        index = 0
        for position, start in enumerate(bar_starts):
            if start <= time_s:
                index = position
            else:
                break
        return index

    placed = [lookup[min(bar_of(w.mid), len(lookup) - 1)] for w in words]
    for index, section in enumerate(sections[1:], start=1):
        bar = section.start_bar - 1
        if bar <= 0 or bar >= len(bar_starts):
            continue
        boundary, window = bar_starts[bar], bar_starts[bar] - bar_starts[bar - 1]
        inside = [i for i, w in enumerate(words) if boundary - window <= w.mid < boundary]
        heads = [i for i in inside if _is_head(words, i)]
        if not heads:
            continue
        last = inside[-1]
        continues = last + 1 < len(words) and not _is_head(words, last + 1)
        if continues:
            for i in range(heads[-1], last + 1):
                placed[i] = index
    return placed


@dataclass(frozen=True)
class Alignment:
    lyrics: str
    method: str
    """``beat grid``, ``section order`` or ``source order``."""
    sections: tuple[dict[str, Any], ...]
    dropped: tuple[AsrWord, ...] = ()
    low_confidence: tuple[AsrWord, ...] = ()
    warnings: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "method": self.method,
            "sections": list(self.sections),
            "dropped": [w.to_dict() for w in self.dropped],
            "low_confidence": [w.to_dict() for w in self.low_confidence],
            "warnings": list(self.warnings),
            "lyrics": self.lyrics,
        }


def drop_inventions(
    words: Sequence[AsrWord], timeline: Timeline | None
) -> tuple[list[AsrWord], list[AsrWord]]:
    """Leave out short phrases with no vocal note within ``INVENTION_WINDOW_S`` (kept, dropped)."""
    if timeline is None or not timeline.vocal_notes:
        return list(words), []
    phrases: list[list[int]] = []
    for index in range(len(words)):
        if not phrases or _is_head(words, index):
            phrases.append([])
        phrases[-1].append(index)
    dropped: set[int] = set()
    for phrase in phrases:
        if len(phrase) > INVENTION_MAX_WORDS:
            continue
        if all(timeline.vocal_notes_near(words[i].mid, INVENTION_WINDOW_S) == 0 for i in phrase):
            dropped.update(phrase)
    kept = [w for i, w in enumerate(words) if i not in dropped]
    return kept, [w for i, w in enumerate(words) if i in dropped]


def join_tokens(tokens: Sequence[str]) -> str:
    """Join ASR tokens into a line; tokens starting with '-' or an apostrophe attach to the previous word."""
    out = ""
    for token in tokens:
        if out and not token.startswith(("-", "'")):
            out += " "
        out += token
    return out


def _lines(words: Sequence[AsrWord]) -> list[str]:
    lines: list[list[str]] = []
    previous: AsrWord | None = None
    for word in words:
        new_line = (
            previous is None or word.start - previous.end > LINE_GAP_S or word.segment != previous.segment
        )
        if new_line:
            lines.append([])
        lines[-1].append(word.word)
        previous = word
    return [join_tokens(line) for line in lines if line]


def align(
    words: Sequence[AsrWord],
    sections: Sequence[Section],
    *,
    timeline: Timeline | None,
    score_meters: Sequence[str] = (),
) -> Alignment:
    """The automatic lyrics draft: the final score's section tags with the sung words in them.

    ``sections`` and ``score_meters`` describe the **final** score (after the user's edits), the
    timeline the transcription it was made from.
    """
    warnings: list[str] = []
    kept, dropped = drop_inventions(words, timeline)
    if dropped:
        warnings.append(
            f"{len(dropped)} word(s) outside the vocal melody were left out as ASR inventions: "
            + repr(join_tokens([w.word for w in dropped]))
        )
    low = tuple(w for w in kept if w.p < LOW_CONFIDENCE)
    method: str
    placed: list[int]
    if (
        timeline is not None
        and sections
        and len(score_meters) == len(timeline.bars)
        and all(m == b.meter for m, b in zip(score_meters, timeline.bars, strict=True))
    ):
        method = "beat grid"
        placed = place_on_grid(kept, timeline.bar_starts, sections)
    elif (
        timeline is not None
        and sections
        and timeline.sections
        and [s[0] for s in timeline.sections] == [s.label for s in sections]
    ):
        method = "section order"
        warnings.append(
            "The score's bar structure differs from the transcription; words were placed by the transcription's "
            "sections in order."
        )
        original = [Section(label, start, bars, 0.0, 0.0, 0) for label, start, bars in timeline.sections]
        placed = place_on_grid(kept, timeline.bar_starts, original)
    else:
        method = "source order"
        warnings.append(
            "The words could not be placed into the score's sections (no matching time grid); they are listed "
            "in source order under one tag. Add the section tags in the Song Sheet."
        )
        text = "\n".join(["[Verse]", *_lines(kept)]) if kept else ""
        return Alignment(
            text, method, ({"tag": "[Verse]", "words": len(kept)},), tuple(dropped), low, tuple(warnings)
        )
    blocks: list[str] = []
    summary: list[dict[str, Any]] = []
    for index, section in enumerate(sections):
        section_words = [w for w, s in zip(kept, placed, strict=True) if s == index]
        lines = _lines(section_words)
        blocks.append("\n".join([section.tag, *lines]))
        summary.append(
            {
                "tag": section.tag,
                "bars": section.bars,
                "vocal_notes": section.vocal_notes,
                "words": len(section_words),
            }
        )
        if section.vocal_notes >= 8 and not section_words:
            warnings.append(f"{section.tag} has {section.vocal_notes} vocal notes but no transcribed words.")
        if section_words and section.vocal_notes == 0:
            warnings.append(
                f"{section.tag} has {len(section_words)} word(s) but no vocal notes in the score."
            )
    return Alignment("\n\n".join(blocks), method, tuple(summary), tuple(dropped), low, tuple(warnings))


# --- sung-lyrics check ----------------------------------------------------------------------


def _alignment_pairs(
    reference: Sequence[str], hypothesis: Sequence[str]
) -> list[tuple[int | None, int | None]]:
    rows, cols = len(reference) + 1, len(hypothesis) + 1
    cost = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        cost[i][0] = i
    for j in range(cols):
        cost[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            same = reference[i - 1] == hypothesis[j - 1]
            cost[i][j] = min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (0 if same else 1))
    pairs: list[tuple[int | None, int | None]] = []
    i, j = len(reference), len(hypothesis)
    while i > 0 or j > 0:
        if i > 0 and j > 0 and cost[i][j] == cost[i - 1][j - 1] + (reference[i - 1] != hypothesis[j - 1]):
            pairs.append((i - 1, j - 1))
            i, j = i - 1, j - 1
        elif i > 0 and cost[i][j] == cost[i - 1][j] + 1:
            pairs.append((i - 1, None))
            i -= 1
        else:
            pairs.append((None, j - 1))
            j -= 1
    return pairs[::-1]


@dataclass(frozen=True)
class LyricsCheck:
    wer: float | None
    reference_words: int
    heard_words: int
    errors: Mapping[str, int]
    sections: tuple[dict[str, Any], ...]
    findings: tuple[str, ...] = field(default=())

    @property
    def passed(self) -> bool:
        return not self.findings

    def to_dict(self) -> dict[str, Any]:
        return {
            "wer": self.wer,
            "reference_words": self.reference_words,
            "heard_words": self.heard_words,
            "errors": dict(self.errors),
            "sections": list(self.sections),
            "findings": list(self.findings),
            "passed": self.passed,
        }


SECTION_MISS_WER = 0.6
"""A section whose words are this far off counts as not sung as written."""


def check_sung_lyrics(expected: str, heard: Sequence[AsrWord] | str) -> LyricsCheck:
    """Compare what was heard in a take with the lyrics it was given: WER overall and per section."""
    parsed = lyrics_rules.parse_lyrics(expected)
    reference: list[str] = []
    owner: list[int] = []
    tags: list[str] = []
    for index, section in enumerate(parsed.sections):
        tags.append(f"[{section.tag}]")
        section_words = normalize_words("\n".join(section.lines))
        reference.extend(section_words)
        owner.extend([index] * len(section_words))
    hypothesis_text = heard if isinstance(heard, str) else " ".join(w.word for w in heard)
    hypothesis = normalize_words(hypothesis_text)
    pairs = _alignment_pairs(reference, hypothesis)
    per_section: list[dict[str, Any]] = [{"tag": tag, "words": 0, "errors": 0} for tag in tags]
    subs = dels = ins = 0
    last_section = 0
    for r, h in pairs:
        if r is not None:
            last_section = owner[r]
            per_section[owner[r]]["words"] += 1
            if h is None:
                dels += 1
                per_section[owner[r]]["errors"] += 1
            elif reference[r] != hypothesis[h]:
                subs += 1
                per_section[owner[r]]["errors"] += 1
        else:
            ins += 1
            if per_section:
                per_section[last_section]["errors"] += 1
    findings: list[str] = []
    for item in per_section:
        item["wer"] = round(item["errors"] / item["words"], 3) if item["words"] else None
        if item["words"] >= 4 and item["wer"] is not None and item["wer"] >= SECTION_MISS_WER:
            findings.append(f"{item['tag']} was not sung as written ({item['wer']:.0%} of its words differ).")
    total = subs + dels + ins
    wer = round(total / len(reference), 4) if reference else None
    if not reference:
        findings.append("The expected lyrics contain no words to compare.")
    return LyricsCheck(
        wer,
        len(reference),
        len(hypothesis),
        {"substitutions": subs, "deletions": dels, "insertions": ins},
        tuple(per_section),
        tuple(findings),
    )
