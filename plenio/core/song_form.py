"""The song form of the lyrics against the form of YuE2's plan, and how the plan is made to match.

Owner's request 2026-10-08 (``docs/design/harmony-and-lyrics-fit.md`` §3.4): a song's lyrics are written
first and YuE2 plans the melody from them - and in study G1 the plan's sung sections differed from the
lyrics' in three of four of the owner's sung songs (most often a bridge or a sung outro the plan does not
have, or a sung intro the lyrics do not). The words then land on melodies planned for other words. In this
order (``QUALITY``):

- **match**: the sung sections have the same kinds in the same order, or a section of the plan sings the
  lyrics blocks after its own up to the next section's kind and has the notes for them (the planner wrote
  one melody for a chorus and an outro; YuE2 sings the lines in their order) - nothing to do;
- **assemble**: every kind of sung section of the lyrics is in the plan - the score is put together from
  the plan's own sections in the lyrics' order (a chorus repeated, a sung intro without words left out),
  instrumental sections kept at the start and the end: chorus words on the chorus melody;
- **rename**: as many sung sections as the lyrics, but kinds the plan does not have - the plan's sections
  take the lyrics' names in order (the notes stay);
- **re-plan** (the node's lazy alternative, when none of the above): YuE2 plans once more with the next
  seed, and the better plan wins;
- **substitute**: a kind of the lyrics is still missing - it takes the melody of a related section of the
  plan (a bridge a verse's, a sung outro the chorus's), named after the lyrics;
- **fill** (2026-10-24): a sung section the plan gave too few Vocal notes for its words (``SPARSE_NOTES``)
  takes the melody of a section of its kind that has them - after YuE2 planned once more (**sparse**);
- **differs**: none of it works - the plan stays, and the sheet says the words may land elsewhere.

Sections are compared by kind: the name without a number (``Verse 2`` -> ``verse``). A section is sung when
it has lyric lines (lyrics) or Vocal notes besides a pickup into the next section (plan). Pure: no ComfyUI.
"""

from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from . import syllables
from .errors import PlenioError
from .score import canonical as c
from .score import lyric_layout, ops
from .score.edit import _label as section_label

MATCH, ASSEMBLE, RENAME, SUBSTITUTE, FILL, SPARSE, DIFFERS, SKIP = (
    "match",
    "assemble",
    "rename",
    "substitute",
    "fill",
    "sparse",
    "differs",
    "skip",
)
QUALITY = {MATCH: 6, ASSEMBLE: 5, RENAME: 4, SUBSTITUTE: 3, FILL: 3, SPARSE: 2, DIFFERS: 1, SKIP: 0}
"""How good a plan's form is for the lyrics (the better of two plans wins)."""
REPLAN_BELOW = QUALITY[RENAME]
"""A plan whose form is below this asks YuE2 for one more plan (study G1: two of five sung songs)."""
MAX_GROWTH = 1.5
"""A score put together from the plan's sections may be at most this much longer than the plan."""
INSTRUMENTAL_KINDS = {
    "instrumental": "interlude",
    "break": "interlude",
    "breakdown": "interlude",
    "solo": "interlude",
    "inst": "interlude",
    "drop": "interlude",
    "build": "interlude",
}
"""Lyric tags of sections without words and the plan's name for them."""
WORDLESS = ("interlude", "instrumental", "solo", "break")
"""The plan's names of a section without singing between sung ones, best first: where a section without words of
another name (a tag of one's own, ``[Violin Rise]``) finds its music when the plan has none of its name."""
SUBSTITUTES = {
    "bridge": ("verse", "chorus"),
    "pre-chorus": ("verse", "chorus"),
    "post-chorus": ("chorus", "verse"),
    "hook": ("chorus", "verse"),
    "refrain": ("chorus", "verse"),
    "outro": ("chorus", "verse"),
    "intro": ("verse", "chorus"),
    "interlude": ("verse", "chorus"),
    "breakdown": ("bridge", "verse", "chorus"),
    "drop": ("chorus", "verse"),
    "build": ("pre-chorus", "verse", "chorus"),
}
"""The plan's section kinds whose melody a missing sung kind takes, best first (else verse, then chorus - also for a
tag of one's own)."""
_UNSAFE = re.compile(r"[^a-z0-9 \-]+")


def kind(name: str) -> str:
    """``[Verse 2]`` -> ``verse``; ``Pre Chorus`` -> ``pre-chorus``. As a score's section names are written - lower
    case, letters, digits, spaces and hyphens, at most 30 characters - so a tag of one's own and the plan's section
    named after it are one kind: ``[Instrument: Violin Rise]`` -> ``instrument violin rise``, ``[Überleitung]`` ->
    ``uberleitung``, a name with nothing of these left (another script) -> ``section``. A section named with a
    description is that section: ``[Verse - Female Choir, Call and Response delivery]`` -> ``verse``."""
    head = lyrics_rules.section_head(name)
    if head:
        return head
    cleaned = re.sub(r"\s*\d+\s*$", "", name.strip().strip("[]").strip().lower())
    cleaned = re.sub(r"\s+", "-", cleaned) if cleaned in ("pre chorus", "post chorus") else cleaned
    plain = "".join(ch for ch in unicodedata.normalize("NFKD", cleaned) if not unicodedata.combining(ch))
    safe = " ".join(_UNSAFE.sub(" ", plain).split()).strip(" -")[:30].rstrip(" -")
    return safe or ("section" if cleaned else "")


@dataclass(frozen=True)
class PlanSection:
    index: int
    """0-based index among the score's sections (``ops._section_starts``)."""
    label: str
    measure: int
    sung: bool


def plan_sections(score: c.Score) -> list[PlanSection]:
    """The plan's sections; one is sung when it has Vocal notes besides a pickup into the next section (a
    plan's intro often ends with the verse's first word: counted as sung, it was left out of an assembled
    score or shifted every name of a renamed one - owner's report 2026-10-09)."""
    starts = ops._section_starts(score)
    bounds = [s.measure for s in starts] + [score.measure_count]
    lead = lyric_layout.pickups(score)
    result = []
    for index, section in enumerate(starts):
        first, end = score.starts[bounds[index]], score.starts[bounds[index + 1]]
        sung = any(first <= note.onset < end and note.onset not in lead for note in score.vocal)
        result.append(PlanSection(index, section.label, section.measure, sung))
    return result


def sung_flags(score: str, sections: Sequence[Any]) -> list[bool]:
    """Whether each of ``sections`` (``score.analyze``'s: ``start_bar``, ``vocal_notes``) is sung, as
    ``plan_sections`` counts it - for the sections check of the lyrics (a pickup into the verse makes no sung
    intro there either)."""
    flags = [section.vocal_notes > 0 for section in sections]
    try:
        plan = {p.measure + 1: p.sung for p in plan_sections(c.from_abc(score))}
    except PlenioError:
        return flags
    return [plan.get(section.start_bar, flag) for section, flag in zip(sections, flags, strict=True)]


MERGED_NOTES = 0.8
"""A section of the plan sings several lyrics blocks when it has at least this many Vocal notes per syllable."""
SPARSE_NOTES = 0.3
"""A sung section with fewer Vocal notes than this per syllable of its words is not sung as written: in the
owner's 19 YuE2 songs of 2026-10-24 the words of such sections were heard at 34 %, of all others at 88-90 % -
one plan gave a verse a single note for 67 syllables, and the take left the verse out."""
SPARSE_MIN_SYLLABLES = 20
"""Only a section with this many syllables (about two lines) counts as sparse: a short sung outro on a note or
two was heard at 84-90 % in the owner's songs - not worth another plan or a whole chorus's melody."""


def _blocks(text: str) -> list[tuple[str, str, int]]:
    """``(kind, tag, syllables)`` of the lyrics' sung blocks."""
    language = syllables.guess_language(text)
    return [
        (
            kind(block.tag),
            block.tag,
            sum(len(lyric_layout.syllables_of(line, language)) for line in block.lines),
        )
        for block in lyrics_rules.parse_lyrics(text).sections
        if block.lines
    ]


def _owned(model: c.Score, plan: list[PlanSection]) -> list[int]:
    """The Vocal notes of every section of the plan, a pickup with the section it leads into."""
    lead = lyric_layout.pickups(model)
    starts = [model.starts[p.measure] for p in plan]
    owned = [0] * len(plan)
    for note in model.vocal:
        index = max(k for k, start in enumerate(starts) if start <= note.onset)
        if note.onset in lead and index + 1 < len(plan):
            index += 1
        owned[index] += 1
    return owned


@dataclass(frozen=True)
class Sparse:
    index: int
    """The plan's section (0-based)."""
    tag: str
    notes: int
    syllables: int

    @property
    def text(self) -> str:
        return f"[{self.tag}] has {self.notes} notes for {self.syllables} syllables"


def sparse_sections(model: c.Score, text: str) -> list[Sparse]:
    """The sung sections with too few Vocal notes for their words (``SPARSE_NOTES``), when the plan's sung
    sections are the lyrics' blocks one to one (else nothing to say)."""
    plan = plan_sections(model)
    sung = [p for p in plan if p.sung]
    blocks = _blocks(text)
    if not sung or len(sung) != len(blocks):
        return []
    owned = _owned(model, plan)
    return [
        Sparse(section.index, tag, owned[section.index], count)
        for section, (_kind, tag, count) in zip(sung, blocks, strict=True)
        if count >= SPARSE_MIN_SYLLABLES and owned[section.index] < SPARSE_NOTES * count
    ]


def _fill(model: c.Score, sparse: list[Sparse]) -> tuple[c.Score, list[str]] | None:
    """The sparse sections on the melody of a sung section of their kind (else a related one) with notes for
    their words - the one whose notes come nearest their syllables; ``None`` when a section has no donor."""
    plan = plan_sections(model)
    owned = _owned(model, plan)
    thin = {item.index for item in sparse}
    order = list(range(len(plan)))
    changes: list[str] = []
    for item in sparse:
        wanted = kind(plan[item.index].label)
        donor = None
        for option in dict.fromkeys((wanted, *SUBSTITUTES.get(wanted, ()), "verse", "chorus")):
            found = [
                p.index
                for p in plan
                if p.sung
                and p.index not in thin
                and kind(p.label) == option
                and owned[p.index] >= SPARSE_NOTES * item.syllables
            ]
            if found:
                donor = min(found, key=lambda index: abs(math.log(owned[index] / item.syllables)))
                break
        if donor is None:
            return None
        order[item.index] = donor
        changes.append(
            f"{item.text}: it takes the melody of the plan's {plan[donor].label} ({owned[donor]} notes)"
        )
    result = ops.arrange_sections(model, [index + 1 for index in order])
    return result.score, [*changes, *result.changes]


def _merged(model: c.Score, plan: list[PlanSection], text: str) -> list[str] | None:
    """How the plan sings the lyrics in fewer sections, or ``None``: in order, every sung section of the plan
    starts with the next lyrics block of its kind and also sings the blocks after it up to one of the next
    section's kind, when it has notes for their syllables (``MERGED_NOTES``). The planner wrote one melody for
    them, and YuE2 sings the lines in their order (owner's report 2026-10-09: the chorus and the outro in one
    section - renamed, every section of the plan had the next one's name)."""
    blocks = _blocks(text)
    sung = [p for p in plan if p.sung]
    if not sung or len(sung) >= len(blocks):
        return None
    groups: list[list[int]] = []
    i = 0
    for position, section in enumerate(sung):
        if i >= len(blocks) or blocks[i][0] != kind(section.label):
            return None
        group = [i]
        i += 1
        following = kind(sung[position + 1].label) if position + 1 < len(sung) else None
        while i < len(blocks) and blocks[i][0] != following:
            group.append(i)
            i += 1
        groups.append(group)
    if i != len(blocks):
        return None
    owned = _owned(model, plan)
    notes: list[str] = []
    for section, group in zip(sung, groups, strict=True):
        if len(group) < 2:
            continue
        if owned[section.index] < MERGED_NOTES * sum(blocks[b][2] for b in group):
            return None
        tags = " and ".join(f"[{blocks[b][1]}]" for b in group)
        notes.append(f"its {kind(section.label)} section sings {tags}")
    return notes


def lyric_sections(text: str) -> list[tuple[str, bool]]:
    """``(tag, sung)`` of every lyrics section."""
    return [(section.tag, bool(section.lines)) for section in lyrics_rules.parse_lyrics(text).sections]


@dataclass(frozen=True)
class Form:
    category: str
    score: str
    """The score after the change, else as it was."""
    changes: tuple[str, ...] = ()
    lyrics_form: tuple[str, ...] = ()
    """The kinds of the lyrics' sung sections."""
    plan_form: tuple[str, ...] = ()
    """The kinds of the plan's sung sections (before the change)."""
    notes: tuple[str, ...] = field(default=())

    @property
    def quality(self) -> int:
        return QUALITY[self.category]

    def to_dict(self) -> dict[str, Any]:
        return {
            "category": self.category,
            "lyrics": list(self.lyrics_form),
            "plan": list(self.plan_form),
            "changes": list(self.changes),
            "notes": list(self.notes),
        }

    @property
    def text(self) -> str:
        lyrics, plan = " - ".join(self.lyrics_form), " - ".join(self.plan_form)
        if self.category == MATCH and self.notes:
            return (
                f"the plan sings the lyrics' sections ({lyrics}) in its own ({plan}): {'; '.join(self.notes)}"
            )
        if self.category == MATCH:
            return f"the plan's sung sections are the lyrics' ({lyrics})"
        if self.category == ASSEMBLE:
            return f"the score put together from the plan's sections in the lyrics' order: {lyrics} (the plan: {plan})"
        if self.category == RENAME:
            return f"the plan's sung sections named after the lyrics: {plan} -> {lyrics}"
        if self.category == FILL:
            return (
                f"a sung section the plan gave too few notes for its words takes another's melody ({lyrics})"
            )
        if self.category == SPARSE:
            return (
                f"the plan's sung sections are the lyrics' ({lyrics}), but {'; '.join(self.notes)} - "
                "its words may be left out"
            )
        if self.category == SUBSTITUTE:
            return (
                f"the score put together for the lyrics' form {lyrics}; sections the plan does not have take a "
                f"related section's melody (the plan: {plan})"
            )
        if self.category == DIFFERS:
            why = f" - {self.notes[0]}" if self.notes else ""
            return f"the plan's sung sections ({plan}) differ from the lyrics' ({lyrics}); words may land elsewhere{why}"
        return "; ".join(self.notes) or "no song form to compare"


def _rename(model: c.Score, tags: list[str]) -> tuple[c.Score, list[str]]:
    """The score's sung sections named after the lyrics' sung tags, in order (same number)."""
    changes: list[str] = []
    for section, tag in zip([p for p in plan_sections(model) if p.sung], tags, strict=True):
        label = section_label(kind(tag))
        if section.label != label:
            result = ops.rename_section_at(model, section.measure + 1, label)
            model = result.score
            changes += result.changes
    return model, changes


def _order(
    plan: list[PlanSection], lyrics: list[tuple[str, bool]], *, substitute: bool
) -> tuple[list[int], list[str]] | None:
    """The plan's sections in the lyrics' order and the substitutions made (``None``: a sung kind of the
    lyrics is not in the plan and ``substitute`` is off, or nothing substitutes it)."""
    by_kind: dict[tuple[str, bool], list[int]] = {}
    for section in plan:
        by_kind.setdefault((kind(section.label), section.sung), []).append(section.index)
    seen: dict[tuple[str, bool], int] = {}
    order: list[int] = []
    swaps: list[str] = []
    borrowed: set[int] = (
        set()
    )  # places in ``order`` where the intro's or outro's music plays between sung sections
    sung_at = [i for i, (_, sung) in enumerate(lyrics) if sung]
    for at, (tag, sung) in enumerate(lyrics):
        wanted = kind(tag) if sung else INSTRUMENTAL_KINDS.get(kind(tag), kind(tag))
        key = (wanted, sung)
        if not sung and key not in by_kind and sung_at and sung_at[0] < at < sung_at[-1]:
            # a part without words between sung ones, of a name the plan has not (a tag of one's own): the plan's
            # own such part - or, when the plan has none, its intro's or outro's music once more
            other = next((name for name in (*WORDLESS, "intro", "outro") if (name, False) in by_kind), None)
            if other is not None:
                key = (other, False)
                if other in ("intro", "outro"):
                    borrowed.add(len(order))
                if other != wanted:
                    swaps.append(f"{wanted} on the {other}'s music")
        if key not in by_kind and sung:
            if not substitute:
                return None
            options = (*SUBSTITUTES.get(wanted, ()), "verse", "chorus")
            other = next((o for o in options if (o, True) in by_kind), None)
            if other is None:
                return None
            swaps.append(f"{wanted} on the {other}'s melody")
            key = (other, True)
        found = by_kind.get(key)
        if not found:
            continue  # an empty tag the plan has no section for
        n = seen.get(key, 0)
        seen[key] = n + 1
        order.append(found[min(n, len(found) - 1)])
    if not order:
        return None
    first_sung = next(i for i, p in enumerate(plan) if p.sung)
    last_sung = max(i for i, p in enumerate(plan) if p.sung)
    leading = [p.index for p in plan[:first_sung]]
    trailing = [p.index for p in plan[last_sung + 1 :]]
    used = {index for place, index in enumerate(order) if place not in borrowed}
    if leading and not used & set(leading):
        order = leading + order
    if trailing and not used & set(trailing):
        order = order + trailing
    return order, swaps


def _assemble(
    model: c.Score,
    plan: list[PlanSection],
    sections: list[tuple[str, bool]],
    tags: list[str],
    *,
    substitute: bool,
) -> tuple[c.Score, list[str], list[str]] | str | None:
    """The score in the lyrics' order, its sung sections named after the lyrics; a reason when too long."""
    found = _order(plan, sections, substitute=substitute)
    if found is None:
        return None
    order, swaps = found
    if order == list(range(len(plan))):
        return None  # the plan's own order: nothing to assemble
    result = ops.arrange_sections(model, [index + 1 for index in order])
    assembled = result.score
    if assembled.total > model.total * MAX_GROWTH:
        return f"the lyrics' form would make the score {assembled.total / model.total:.1f} times as long"
    changes = list(result.changes)
    if len([p for p in plan_sections(assembled) if p.sung]) == len(tags):
        assembled, renamed = _rename(assembled, tags)
        changes += renamed
    return assembled, changes, swaps


def match(lyrics: str, score: str, *, substitute: bool = False) -> Form:
    """The plan's form against the lyrics' and the change that makes it fit (``substitute``: the last
    resort, after a second plan); a form that fits but leaves a sung section too few notes for its words is
    ``SPARSE`` - with ``substitute`` that section takes another's melody (``FILL``)."""
    form = _form(lyrics, score, substitute=substitute)
    if form.category not in (MATCH, ASSEMBLE, RENAME, SUBSTITUTE) or (form.category == MATCH and form.notes):
        return form  # a merged MATCH (one section sings several blocks) has checked its notes already
    try:
        model = c.from_abc(form.score)
    except PlenioError:
        return form
    sparse = sparse_sections(model, lyrics or "")
    if not sparse:
        return form
    if substitute:
        filled = _fill(model, sparse)
        if filled is not None:
            new, changes = filled
            return Form(FILL, c.to_abc(new), (*form.changes, *changes), form.lyrics_form, form.plan_form)
    return Form(
        SPARSE,
        form.score,
        form.changes,
        form.lyrics_form,
        form.plan_form,
        tuple(item.text for item in sparse),
    )


def _form(lyrics: str, score: str, *, substitute: bool) -> Form:
    """The plan's form against the lyrics' (``match`` without the notes check)."""
    if not (score or "").strip():
        return Form(SKIP, score, notes=("no score (planning is off)",))
    sections = lyric_sections(lyrics or "")
    tags = [tag for tag, sung in sections if sung]
    if not tags:
        return Form(SKIP, score, notes=("the lyrics have no sung section (an instrumental)",))
    try:
        model = c.from_abc(score)
    except PlenioError as error:
        return Form(SKIP, score, notes=(f"the score cannot be edited note by note ({error.message})",))
    plan = plan_sections(model)
    lyrics_form = tuple(kind(tag) for tag in tags)
    plan_form = tuple(kind(p.label) for p in plan if p.sung)
    if not plan_form:
        return Form(SKIP, score, notes=("the plan has no sung section",))
    if lyrics_form == plan_form:
        return Form(MATCH, score, (), lyrics_form, plan_form)
    merged = _merged(model, plan, lyrics or "")
    if merged is not None:
        return Form(MATCH, score, (), lyrics_form, plan_form, tuple(merged))
    notes: list[str] = []
    assembled = _assemble(model, plan, sections, tags, substitute=False)
    if isinstance(assembled, tuple):
        new, changes, _swaps = assembled
        return Form(ASSEMBLE, c.to_abc(new), tuple(changes), lyrics_form, plan_form)
    if isinstance(assembled, str):
        notes.append(assembled)
    if len(lyrics_form) == len(plan_form):
        renamed, changes = _rename(model, tags)
        return Form(RENAME, c.to_abc(renamed), tuple(changes), lyrics_form, plan_form)
    if substitute:
        assembled = _assemble(model, plan, sections, tags, substitute=True)
        if isinstance(assembled, tuple):
            new, changes, swaps = assembled
            return Form(SUBSTITUTE, c.to_abc(new), (*changes, *swaps), lyrics_form, plan_form)
        if isinstance(assembled, str):
            notes.append(assembled)
    return Form(DIFFERS, score, (), lyrics_form, plan_form, tuple(dict.fromkeys(notes)))


def better(first: Form, second: Form) -> Form:
    """The better of two plans' forms (the first at equal quality: it is the plan the seed chose)."""
    return second if second.quality > first.quality else first
