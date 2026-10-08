"""Lyrics that fit their melody: every line against its phrase, a targeted repair request, and the merge.

Owner's request 2026-10-08 (``docs/design/harmony-and-lyrics-fit.md``): new lyrics on an existing melody
(a cover's) must fit it syllable by syllable, and where they do not, the writer is asked again - for the
failing lines only, at most twice. Measured before: 41 % of new cover lines more than a quarter off their
phrase (the original words: 26 %), only 27 % of the sections with one line per phrase.

- ``check``: per section the lines against the phrases (``score.phrasing``: the Vocal notes, split at rests
  of a beat). Lines and phrases are aligned first - a line may span two or three short phrases, two or
  three short lines may share one (a singer breathes where the melody rests, not always where a line ends).
  A line fits when it has at most as many syllables as its notes (one more on six notes or more) and at
  most a quarter (at least two) fewer - a syllable may stretch over two notes, more syllables than notes
  blur. A section whose number of lines is far from its number of phrases is written anew.
- ``request``: a prompt and a JSON schema that ask for the failing lines only (or a section anew), with the
  whole lyrics for context, the rhyme to keep and the language. The writer hyphenates each line
  (``syllables``) - it plans the count word by word; Plenio counts itself.
- ``merge``: the answer's lines into the lyrics (everything else stays as it was).
- ``shorten``: the last step for a line still one or two syllables too long - contractions a singer uses
  anyway and a leading filler word (*I am* -> *I'm*, *going to* -> *gonna*, *and*). A line still too short
  stays: YuE2 sings a syllable over two notes (a melisma).

Sections are addressed by their number in the lyrics (1-based): a song may have two ``[verse]`` sections.
Pure: no ComfyUI, no I/O.
"""

from __future__ import annotations

import json
import math
import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from . import syllables

FIT_SCHEMA = "plenio.lyrics_fit/1"
MAX_ROUNDS = 2
"""Repair rounds after the draft (the owner: not endlessly)."""
MAX_LINES = 20
"""Lines asked for in one round (the furthest off first): about 80 tokens each with their syllables, so the
answer stays well inside a writer's limit (study A2: 38 lines were cut off at 2048 tokens)."""
GROUP_COST = 0.6
"""The alignment's cost of every extra phrase on a line (or line on a phrase): one to one is preferred."""


def window(notes: int) -> tuple[int, int]:
    """The syllables a line sung on ``notes`` notes may have."""
    low = notes - max(2, math.ceil(notes * 0.25))
    high = notes + (1 if notes >= 6 else 0)
    return max(1, low), high


def _miss(count: int, notes: int) -> int:
    low, high = window(notes)
    return low - count if count < low else max(0, count - high)


@dataclass(frozen=True)
class LineFit:
    section: int
    """1-based number of the section in the lyrics."""
    tag: str
    line: int
    """1-based line number in the section."""
    text: str
    syllables: int
    notes: int
    """The notes the line is sung on: its phrases, or its share of a phrase it shares."""
    phrases: tuple[int, ...]
    """0-based indexes of the section's phrases the line is sung on."""
    shared: tuple[int, ...] = ()
    """The other lines (1-based) sung on the same phrases."""
    fits: bool = True
    target: tuple[int, int] = (0, 0)
    """The syllables to write: the window, at most one per note (a shared line: its share, moved so that
    the line changes in the direction its group needs)."""

    @property
    def problem(self) -> str:
        if self.fits:
            return ""
        low, high = self.target
        return f"{self.syllables} syllables for {self.notes} notes - write {low}-{high}"


@dataclass(frozen=True)
class SectionFit:
    number: int
    tag: str
    phrases: tuple[int, ...]
    lines: tuple[LineFit, ...]
    rewrite: bool = False
    """The section's number of lines is far from its number of phrases: it is written anew."""
    texts: tuple[str, ...] = ()
    """The section's lines as written (also when it is written anew)."""

    @property
    def failing(self) -> tuple[LineFit, ...]:
        return tuple(line for line in self.lines if not line.fits)

    @property
    def needs_work(self) -> bool:
        return self.rewrite or bool(self.failing)


@dataclass(frozen=True)
class Fit:
    sections: tuple[SectionFit, ...]
    language: str = ""

    @property
    def fits(self) -> bool:
        return not any(s.needs_work for s in self.sections)

    @property
    def counts(self) -> tuple[int, int]:
        """Lines that fit, lines checked (sections with phrases; a section written anew fits none)."""
        checked = sum(max(len(s.texts), len(s.lines)) for s in self.sections if s.phrases)
        good = sum(1 for s in self.sections if not s.rewrite for line in s.lines if line.fits)
        return good, checked

    def to_dict(self) -> dict[str, Any]:
        good, checked = self.counts
        return {
            "schema": FIT_SCHEMA,
            "fits": self.fits,
            "lines_fitting": good,
            "lines": checked,
            "sections": [
                {
                    "section": s.number,
                    "tag": s.tag,
                    "phrases": list(s.phrases),
                    "rewrite": s.rewrite,
                    "lines": [
                        {
                            "line": line.line,
                            "syllables": line.syllables,
                            "notes": line.notes,
                            "phrases": list(line.phrases),
                            "fits": line.fits,
                        }
                        for line in s.lines
                    ],
                }
                for s in self.sections
                if s.phrases
            ],
        }


def _key(tag: str) -> str:
    return tag.strip().strip("[]").strip().lower()


def _match(tags: Sequence[str], parts: Sequence[Mapping[str, Any]]) -> list[tuple[int, ...]]:
    """The phrases of every lyrics section: by position when the lyrics have the score's sections in its
    order, otherwise the n-th section of a tag takes the n-th score section of that tag."""
    phrases = [tuple(int(n) for n in part.get("phrases", [])) for part in parts]
    keys = [_key(str(part["tag"])) for part in parts]
    if [_key(tag) for tag in tags] == keys:
        return phrases
    queues: dict[str, list[tuple[int, ...]]] = {}
    for key, found in zip(keys, phrases, strict=True):
        queues.setdefault(key, []).append(found)
    return [queues[_key(tag)].pop(0) if queues.get(_key(tag)) else () for tag in tags]


def _rewrite(lines: int, phrases: int) -> bool:
    return phrases > 0 and (lines == 0 or abs(lines - phrases) > max(1, phrases // 2))


GROUPS = ((1, 1), (1, 2), (2, 1), (1, 3), (3, 1), (2, 2))
"""``(lines, phrases)`` the alignment may join: a line over two or three phrases, two or three lines on one,
two lines across two phrases (a breath in the middle of a line)."""


def _align(
    counts: Sequence[int], phrases: Sequence[int], *, strict: bool
) -> list[tuple[int, int, int, int]] | None:
    """Lines onto phrases in order: ``(first line, end line, first phrase, end phrase)`` per group (``GROUPS``),
    with the fewest syllables off and, at equal cost, the fewest joins. ``strict``: a join only where the
    joined lines fit (a join explains a line break, not a line that is too long)."""
    lines, total = len(counts), len(phrases)
    inf = float("inf")
    best = [[inf] * (total + 1) for _ in range(lines + 1)]
    step: list[list[tuple[int, int] | None]] = [[None] * (total + 1) for _ in range(lines + 1)]
    best[0][0] = 0.0
    for i in range(lines):
        for j in range(total):
            if best[i][j] == inf:
                continue
            for a, b in GROUPS:
                if i + a > lines or j + b > total:
                    continue
                miss = _miss(sum(counts[i : i + a]), sum(phrases[j : j + b]))
                if strict and miss and a + b > 2:
                    continue
                cost = best[i][j] + miss + GROUP_COST * (a + b - 2)
                if cost < best[i + a][j + b]:
                    best[i + a][j + b], step[i + a][j + b] = cost, (i, j)
    if best[lines][total] == inf:
        return None
    groups = []
    i, j = lines, total
    while (i, j) != (0, 0):
        previous = step[i][j]
        assert previous is not None
        groups.append((previous[0], i, previous[1], j))
        i, j = previous
    return groups[::-1]


def _section(
    number: int, section: lyrics_rules.LyricsSection, phrases: tuple[int, ...], language: str
) -> SectionFit:
    texts = section.lines
    counts = [syllables.count(line, language) for line in texts]
    groups = None
    if not _rewrite(len(texts), len(phrases)):
        groups = _align(counts, phrases, strict=True) or _align(counts, phrases, strict=False)
    if groups is None:
        return SectionFit(number, section.tag, phrases, (), bool(phrases), texts)
    lines: list[LineFit] = []
    for first, end, start, stop in groups:
        notes = sum(phrases[start:stop])
        sung = sum(counts[first:end])
        fits = _miss(sung, notes) == 0
        for index in range(first, end):
            share = notes if end - first == 1 else max(1, round(notes * counts[index] / max(1, sung)))
            others = tuple(n + 1 for n in range(first, end) if n != index)
            low, high = window(share)
            high = min(high, share)
            if others and not fits and sung > window(notes)[1]:
                high = max(1, min(high, counts[index] - 1))
                low = min(low, high)
            elif others and not fits:
                low = max(low, counts[index] + 1)
                high = max(high, low)
            lines.append(
                LineFit(
                    number,
                    section.tag,
                    index + 1,
                    texts[index],
                    counts[index],
                    share,
                    tuple(range(start, stop)),
                    others,
                    fits,
                    (low, high),
                )
            )
    return SectionFit(number, section.tag, phrases, tuple(lines), False, texts)


def check(text: str, phrasing: Sequence[Mapping[str, Any]], *, language: str = "") -> Fit:
    """The lyrics' lines against the phrases of the score's sections (``score.phrasing``). A section without
    singing, or without a section of the score, is not checked."""
    parsed = lyrics_rules.parse_lyrics(text)
    matched = _match([section.tag for section in parsed.sections], phrasing)
    sections = tuple(
        _section(number, section, phrases, language) if phrases else SectionFit(number, section.tag, (), ())
        for number, (section, phrases) in enumerate(zip(parsed.sections, matched, strict=True), start=1)
    )
    return Fit(sections, language)


# --- the repair request ------------------------------------------------------------------------------

_RHYME_TAIL = re.compile(r"([aeiouy]+[^aeiouy\s]*)$")


def _rhyme(line: str) -> str:
    words = re.findall(r"[A-Za-zÀ-ÿ']+", line.lower())
    if not words:
        return ""
    match = _RHYME_TAIL.search(words[-1].rstrip("'"))
    return match.group(1) if match else words[-1]


def _rhymes_with(section: SectionFit, line: LineFit) -> LineFit | None:
    """Another line of the section that ends in the same sound (the rhyme to keep)."""
    sound = _rhyme(line.text)
    if len(sound) < 2:
        return None
    for other in section.lines:
        if other.line != line.line and _rhyme(other.text) == sound:
            return other
    return None


@dataclass(frozen=True)
class Request:
    prompt: str
    schema: dict[str, Any]
    asked: tuple[tuple[int, int], ...] = field(default=())
    """``(section, line)`` of every line asked for (line 0: the whole section anew)."""

    def to_dict(self) -> dict[str, Any]:
        return {"asked": [list(item) for item in self.asked]}


def _label(section: SectionFit) -> str:
    return f"section {section.number} [{section.tag}]"


def _key_of(section: int, line: int) -> str:
    return f"{section}-{line}"


def _fix(section: SectionFit, line: LineFit) -> str:
    low, high = line.target
    where = (
        f"its phrase has {line.notes} notes"
        if len(line.phrases) == 1 and not line.shared
        else f"its {len(line.phrases)} phrases have {line.notes} notes"
        if not line.shared
        else f"it shares {'a phrase' if len(line.phrases) == 1 else 'its phrases'} with line(s) "
        f"{', '.join(map(str, line.shared))}: about {line.notes} notes for it"
    )
    rhyme = _rhymes_with(section, line)
    keep = f' It rhymes with line {rhyme.line} ("{rhyme.text}") - keep the rhyme.' if rhyme else ""
    count = f"{low}" if low == high else f"{low} to {high}"
    return (
        f'- "{_key_of(section.number, line.line)}": {_label(section)} line {line.line}, "{line.text}" - '
        f"{line.syllables} syllables, {where}: write {count} syllables.{keep}"
    )


def _slot(low: int, high: int) -> dict[str, Any]:
    """One line of the answer: its syllables as a list of exactly ``low`` to ``high`` items (a schema-held
    writer cannot write more or fewer), then the line."""
    return {
        "type": "object",
        "properties": {
            "syllables": {
                "type": "array",
                "items": {"type": "string", "minLength": 1, "maxLength": 16},
                "minItems": low,
                "maxItems": high,
            },
            "text": {"type": "string", "minLength": 1, "maxLength": 200},
        },
        "required": ["syllables", "text"],
        "additionalProperties": False,
    }


def request(
    text: str,
    fit: Fit,
    *,
    language: str = "",
    closeness_text: str = "",
    reference: str = "",
    theme: str = "",
) -> Request | None:
    """The repair request for ``fit`` (``None`` when the lyrics fit). The answer is an object with one entry
    per line written, keyed ``"<section>-<line>"``; each entry spells the line as its list of syllables (held to
    the target count by the schema) and then the line itself."""
    if fit.fits:
        return None
    asked: list[tuple[int, int]] = []
    fixes: list[str] = []
    slots: dict[str, dict[str, Any]] = {}
    # the lines furthest off first, at most MAX_LINES per round (a long answer is cut off; the rest is the
    # next round's)
    budget = MAX_LINES
    chosen: set[tuple[int, int]] = set()
    whole: set[int] = set()
    for section in fit.sections:
        if section.rewrite and len(section.phrases) <= budget:
            whole.add(section.number)
            budget -= len(section.phrases)
    failing = sorted(
        (line for s in fit.sections if not s.rewrite for line in s.failing),
        key=lambda line: -abs(line.syllables - sum(line.target) / 2),
    )
    for line in failing[:budget]:
        chosen.add((line.section, line.line))
    if not whole and not chosen:  # one section larger than the budget: it is written anew all the same
        whole.add(next(s.number for s in fit.sections if s.rewrite))
    for section in fit.sections:
        if section.rewrite and section.number not in whole:
            continue
        if section.rewrite:
            targets = []
            for index, notes in enumerate(section.phrases, start=1):
                low, high = window(notes)
                high = min(high, notes)
                slots[_key_of(section.number, index)] = _slot(low, high)
                targets.append(f'"{_key_of(section.number, index)}" {low}-{high}')
            fixes.append(
                f"- {_label(section)} has {len(section.texts)} line(s) for {len(section.phrases)} phrase(s): write the "
                f"section again with exactly {len(section.phrases)} lines, telling what it tells now - syllables per "
                f"line: {', '.join(targets)}."
            )
            asked.append((section.number, 0))
            continue
        for line in section.failing:
            if (section.number, line.line) not in chosen:
                continue
            fixes.append(_fix(section, line))
            slots[_key_of(section.number, line.line)] = _slot(*line.target)
            asked.append((section.number, line.line))
    numbered = []
    for section in fit.sections:
        numbered.append(f"{_label(section)}")
        numbered += [f"  {index}. {line}" for index, line in enumerate(section.texts, start=1)]
    parts = [
        f"You wrote song lyrics{f' in {language}' if language else ''} for an existing melody. Some lines do not "
        "fit the melody: a phrase has a fixed number of notes, and a line is sung with one syllable per note - "
        "one or two fewer are fine (a syllable may stretch over two notes), more are not.",
        "",
        "THE LYRICS",
        *numbered,
        "",
        "WRITE THESE LINES ANEW",
        *fixes,
        "",
        "RULES",
        "- Keep each line's meaning and its place in the story; keep the rhymes named; keep the language"
        f"{f' ({language})' if language else ''} and the voice of the other lines. Change no other line.",
        '- Build each line syllable by syllable: "syllables" lists the syllables of the new line in order, one '
        'per item ("to-night" is "to", "night"; "every" is "ev", "er", "y") - exactly as many as asked for. '
        '"text" is the same line written normally.',
        "- Only words to be sung: no stage directions, no section tags, no line numbers in a line.",
    ]
    if closeness_text:
        parts.append(f"- Closeness to the source's lyrics: {closeness_text}")
    if theme:
        parts.append(f"- Theme: {theme}")
    if reference.strip():
        parts += ["", "THE SOURCE'S LYRICS (for meaning only)", reference.strip()[:1500]]
    first = next(iter(slots))
    example = {
        first: {"syllables": ["I", "walk", "a", "long", "the", "riv", "er"], "text": "I walk along the river"}
    }
    parts += [
        "",
        "ANSWER: only this JSON object, one entry per line asked for (its key as above):",
        json.dumps(example, ensure_ascii=False),
    ]
    schema = {
        "type": "object",
        "properties": slots,
        "required": list(slots),
        "additionalProperties": False,
    }
    return Request("\n".join(parts), schema, tuple(asked))


# --- the merge ----------------------------------------------------------------------------------------

_THINK = re.compile(r"<think>.*?</think>", re.DOTALL)
_FENCE = re.compile(r"```(?:json)?")
_KEY = re.compile(r"^\s*(\d+)\s*-\s*(\d+)\s*$")


def _answer_lines(answer: str) -> list[dict[str, Any]]:
    """The answer's lines as ``{"section", "line", "text"}``: from the keyed object (``"2-4": {...}``) or a
    ``"lines"`` list (an answer in the older form)."""
    text = _FENCE.sub("", _THINK.sub("", answer or ""))
    if "</think>" in text:
        text = text.split("</think>", 1)[1]
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return []
    raw = text[start : end + 1].replace("“", '"').replace("”", '"')
    for attempt in (raw, re.sub(r",\s*([}\]])", r"\1", raw)):
        try:
            data = json.loads(attempt)
        except ValueError:
            continue
        if not isinstance(data, dict):
            continue
        found = data.get("lines")
        if isinstance(found, list):
            return [item for item in found if isinstance(item, dict)]
        items = []
        for key, value in data.items():
            match = _KEY.match(str(key))
            if match is None:
                continue
            line_text = value.get("text") if isinstance(value, dict) else value
            items.append({"section": int(match.group(1)), "line": int(match.group(2)), "text": line_text})
        return items
    return []


def _number(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    match = re.search(r"\d+", str(value or ""))
    return int(match.group(0)) if match else None


def _clean(line: Any) -> str:
    text = re.sub(r"\s+", " ", str(line or "")).strip().strip('"').strip()
    return re.sub(r"^\d+[.)]\s+", "", text)


def merge(
    text: str, answer: str, asked: Sequence[tuple[int, int]], fit: Fit | None = None
) -> tuple[str, list[str]]:
    """The lyrics with the answer's lines in place of the lines asked for. Only asked lines change; a
    section asked anew takes the answer's lines only when they are complete (1 to n, in order). With the
    ``fit`` the lines were asked for, a new line that is further off its notes than the old one is not
    taken."""
    items = _answer_lines(answer)
    if not items:
        return text, ["the writer's answer had no lines to use"]
    parsed = lyrics_rules.parse_lyrics(text)
    wanted = {(section, line) for section, line in asked}
    whole = {where for where, number in asked if number == 0}
    found: dict[int, dict[int, str]] = {}
    for item in items:
        where, number, written = (
            _number(item.get("section")),
            _number(item.get("line")),
            _clean(item.get("text")),
        )
        if where is None or number is None or not written or "[" in written:
            continue
        if where in whole or (where, number) in wanted:
            found.setdefault(where, {})[number] = written
    targets = (
        {(fitted.section, fitted.line): fitted for s in fit.sections for fitted in s.lines} if fit else {}
    )
    language = fit.language if fit else ""
    notes: list[str] = []
    sections = []
    for number, section in enumerate(parsed.sections, start=1):
        new = found.get(number, {})
        if number in whole:
            numbers = sorted(new)
            if numbers and numbers == list(range(1, len(numbers) + 1)):
                sections.append(lyrics_rules.LyricsSection(section.tag, tuple(new[n] for n in numbers)))
                notes.append(f"[{section.tag}] (section {number}) written anew: {len(numbers)} lines")
                continue
            notes.append(
                f"[{section.tag}] (section {number}): the answer did not give the whole section; it stays"
            )
        lines = list(section.lines)
        for line_number, line in sorted(new.items()):
            if number in whole or not 1 <= line_number <= len(lines) or lines[line_number - 1] == line:
                continue
            target = targets.get((number, line_number))
            if target is not None:
                before = _miss(target.syllables, target.notes)
                after = _miss(syllables.count(line, language), target.notes)
                if after > before:
                    notes.append(
                        f"[{section.tag}] (section {number}) line {line_number}: the new line was further off; kept"
                    )
                    continue
            lines[line_number - 1] = line
            notes.append(f"[{section.tag}] (section {number}) line {line_number} rewritten")
        sections.append(lyrics_rules.LyricsSection(section.tag, tuple(lines)))
    missing = [item for item in asked if item[1] and item[1] not in found.get(item[0], {})]
    if missing:
        notes.append(f"{len(missing)} line(s) asked for were not in the answer; they stay")
    return lyrics_rules.Lyrics(parsed.preamble, tuple(sections)).format(), notes


# --- the last step: shorter by a syllable or two ---------------------------------------------------------

CONTRACTIONS = (
    (r"\bI am\b", "I'm"),
    (r"\byou are\b", "you're"),
    (r"\bwe are\b", "we're"),
    (r"\bthey are\b", "they're"),
    (r"\bdo not\b", "don't"),
    (r"\bdoes not\b", "doesn't"),
    (r"\bdid not\b", "didn't"),
    (r"\bcannot\b", "can't"),
    (r"\bcan not\b", "can't"),
    (r"\bwill not\b", "won't"),
    (r"\bis not\b", "isn't"),
    (r"\bare not\b", "aren't"),
    (r"\bit is\b", "it's"),
    (r"\bthat is\b", "that's"),
    (r"\bI will\b", "I'll"),
    (r"\byou will\b", "you'll"),
    (r"\bwe will\b", "we'll"),
    (r"\bI have\b", "I've"),
    (r"\bI would\b", "I'd"),
    (r"\bgoing to\b", "gonna"),
    (r"\bwant to\b", "wanna"),
    (r"\blet us\b", "let's"),
    (r"\bevery\b", "ev'ry"),
)
"""English contractions a singer uses anyway - each saves a syllable."""
FILLERS = re.compile(r"^(?:and|so|oh|but|just|yeah)[,]?\s+", re.IGNORECASE)
MAX_SHORTEN = 2
"""The last step shortens a line by at most this many syllables (the owner's decision D3)."""


def _capital(text: str, like: str) -> str:
    return text[:1].upper() + text[1:] if like[:1].isupper() and text else text


def _shorter(line: str, high: int, language: str) -> str:
    new = line
    for pattern, short in CONTRACTIONS:
        if syllables.count(new, language) <= high:
            break
        new = _capital(re.sub(pattern, short, new, count=1, flags=re.IGNORECASE), line)
    if syllables.count(new, language) > high:
        trimmed = FILLERS.sub("", new, count=1)
        if trimmed:
            new = _capital(trimmed, line) if trimmed != new else new
    return new


def shorten(text: str, fit: Fit) -> tuple[str, list[str]]:
    """English lines still one or two syllables too long (on a phrase of their own), shortened by
    contractions and a leading filler word, as far as needed. Other languages and other lines stay."""
    if syllables._language(fit.language) != "en":
        return text, []
    targets = {
        (line.section, line.line): line
        for section in fit.sections
        for line in section.failing
        if not line.shared and 0 < line.syllables - window(line.notes)[1] <= MAX_SHORTEN
    }
    if not targets:
        return text, []
    parsed = lyrics_rules.parse_lyrics(text)
    notes: list[str] = []
    sections = []
    for number, section in enumerate(parsed.sections, start=1):
        lines = list(section.lines)
        for index, line in enumerate(lines):
            target = targets.get((number, index + 1))
            if target is None:
                continue
            new = _shorter(line, window(target.notes)[1], fit.language)
            if new != line and syllables.count(new, fit.language) < syllables.count(line, fit.language):
                lines[index] = new
                notes.append(
                    f'[{section.tag}] (section {number}) line {index + 1} shortened: "{line}" -> "{new}"'
                )
        sections.append(lyrics_rules.LyricsSection(section.tag, tuple(lines)))
    return lyrics_rules.Lyrics(parsed.preamble, tuple(sections)).format(), notes
