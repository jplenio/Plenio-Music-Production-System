"""Apply a section plan to a score - or fall back to the score as it was, and say why.

The order per section: chords (each bar's new chord must fit the melody, otherwise the planned chord
stays), then the instrument line (written from the bar chords), then the key shift; at the end the tempo.
Every step goes through the score model's validation; a step that fails is left out and noted. The result
is checked like a document the editor opens: the YuE2 parser accepts it, it reads back to the same model,
the score editor can show it note by note - and, with an engine, it fits YuE2's context. Anything else
returns the original score with ``status = "fallback"`` and the reason.
"""

from __future__ import annotations

import random
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field, replace
from typing import Any

from ..errors import PlenioError, PlenioValidationError
from ..score import canonical as c
from ..score import native, ops
from ..score.operations import editor_view
from . import lines
from .plan import (
    NEEDS_CHORDS,
    Plan,
    PlanError,
    Policy,
    SectionPlan,
    chord_at,
    melody_voice,
    read_plan,
    section_ranges,
    strong_positions,
)

STATUSES = ("applied", "partial", "unchanged", "fallback", "skipped")
VOCAL_LIMITS = (40, 84)
"""Sung notes stay between E2 and C6 when a section changes key."""
KEY_LIFT_HEADROOM = 2
"""A shifted section may sing at most this many semitones above the song's highest note."""


@dataclass(frozen=True)
class SectionResult:
    index: int
    label: str
    bars: str
    applied: tuple[str, ...] = ()
    kept: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "label": self.label,
            "bars": self.bars,
            "applied": list(self.applied),
            "kept": list(self.kept),
        }


@dataclass(frozen=True)
class Arrangement:
    abc: str
    status: str
    summary: str
    mode: str
    closeness: int
    sections: tuple[SectionResult, ...] = ()
    notes: tuple[str, ...] = ()
    plan: Plan | None = None
    idea: str = ""
    changes: tuple[str, ...] = field(default=())

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "summary": self.summary,
            "mode": self.mode,
            "closeness": self.closeness,
            "idea": self.idea,
            "sections": [s.to_dict() for s in self.sections],
            "notes": list(self.notes),
            "plan": self.plan.to_dict() if self.plan else None,
        }


def skipped(text: str, policy: Policy) -> Arrangement:
    """The score unchanged, without asking the writer: the simple mode, or a cover kept as it is."""
    return Arrangement(text, "skipped", f"skipped: {policy.skip_reason}", policy.mode.name, policy.closeness)


def _bars(first: int, end: int) -> str:
    return f"{first + 1}" if end - first == 1 else f"{first + 1}-{end}"


def _fits(chord: str, pitches: Sequence[int], tensions: str) -> bool:
    classes = set(lines.chord_classes(chord))
    root = lines.chord_root(chord.partition("/")[0])
    for pitch in pitches:
        pc = pitch % 12
        if pc in classes:
            continue
        if tensions == "strict":
            return False
        if tensions == "colour" and (pc - root) % 12 in (2, 9):
            continue
        if tensions == "free" and not any((pc - tone) % 12 == 1 for tone in classes):
            continue
        return False
    return True


def _sounding(notes: Sequence[c.Note], onset: int) -> int | None:
    for note in notes:
        if note.onset <= onset < note.end:
            return note.pitch
    return None


def _apply_chords(
    score: c.Score,
    first: int,
    end: int,
    progression: Sequence[str | None],
    policy: Policy,
    melody: Sequence[c.Note],
) -> tuple[c.Score, list[str], list[str]]:
    applied: list[str] = []
    kept: list[str] = []
    chords = list(score.chords)
    names: list[str] = []
    for i, measure in enumerate(range(first, end)):
        name = progression[i % len(progression)]
        start, length = score.starts[measure], score.lengths[measure]
        if name is None:  # the plan keeps this bar's chord
            names.append(chord_at(score, start) or "-")
            continue
        strong = [
            p
            for p in (
                _sounding(melody, pos) for pos in strong_positions(start, length, score.meters[measure])
            )
            if p is not None
        ]
        old = chord_at(score, start)
        if name == old:  # the planned chord again: nothing to change, nothing to report
            names.append(name)
            continue
        if not _fits(name, strong, policy.tensions):
            kept.append(f"bar {measure + 1}: {name} clashes with the melody; {old or 'no chord'} stays")
            names.append(old or "-")
            continue
        chords = [ch for ch in chords if not start <= ch.onset < start + length]
        chords.append(c.ChordSymbol(start, name))
        names.append(name)
    new = replace(score, chords=tuple(sorted(chords, key=lambda ch: ch.onset)))
    new = c.validate(new)
    if names and any(n != "-" for n in names):
        applied.append("chords " + " | ".join(names))
    return new, applied, kept


def _line(
    score: c.Score,
    first: int,
    end: int,
    plan: SectionPlan,
    *,
    seed: int,
    melody: Sequence[c.Note],
) -> list[lines.LineNote] | None:
    """The notes of the plan's lead role in the section; ``None`` keeps the line as it is."""
    if plan.lead == "keep":
        return None
    if plan.lead == "none":
        return []
    chord_names = [chord_at(score, score.starts[m]) for m in range(first, end)]
    bars = lines.bars_of(score, first, end, chord_names)
    rng = random.Random(f"{seed}:{plan.section}:{plan.lead}:{plan.energy}")
    quarter = max(1, score.units_per_quarter)
    step = lines.step_units(score, plan.energy)
    if plan.lead == "pad":
        return lines.pad(bars, plan.energy, rng)
    if plan.lead == "arpeggio":
        return lines.arpeggio(bars, plan.energy, rng, step)
    if plan.lead == "riff":
        return lines.riff(bars, plan.energy, rng, quarter)
    if plan.lead == "countermelody":
        return lines.countermelody(bars, plan.energy, rng, step, melody)
    if plan.lead == "solo":
        return lines.solo(bars, plan.energy, rng, quarter)
    if plan.lead == "octave":
        return lines.octave(bars, score.vocal) or lines.pad(bars, plan.energy, rng)
    if plan.lead == "motif":
        return lines.motif(bars, plan.motif, quarter)
    return None


def _apply_line(score: c.Score, first: int, end: int, notes: list[lines.LineNote], label: str) -> c.Score:
    start, stop = score.starts[first], score.starts[end]
    inside = [
        {"onset": onset, "duration": min(duration, stop - onset), "pitch": pitch}
        for onset, duration, pitch in notes
        if start <= onset < stop and duration > 0
    ]
    result = ops.place_notes(score, "ins", inside, clear=[start, stop], label=label)
    return result.score


def _split_at(notes: Sequence[c.Note], point: int) -> list[c.Note]:
    result: list[c.Note] = []
    for note in notes:
        if note.onset < point < note.end:
            result += [
                c.Note(note.onset, point - note.onset, note.pitch),
                c.Note(point, note.end - point, note.pitch),
            ]
        else:
            result.append(note)
    return result


def _apply_shifts(
    score: c.Score, ranges: Sequence[tuple[int, int]], shifts: Sequence[int], highest_sung: int | None
) -> tuple[c.Score, list[str]]:
    """Move every section by its shift (notes, chords and keys); a section whose voice would leave the
    singable range keeps its key. Returns the score and what stayed."""
    kept: list[str] = []
    final = list(shifts)
    for i, (first, end) in enumerate(ranges):
        if final[i] == 0:
            continue
        start, stop = score.starts[first], score.starts[end]
        sung = [n.pitch + final[i] for n in score.vocal if start <= n.onset < stop]
        ceiling = (
            VOCAL_LIMITS[1]
            if highest_sung is None
            else min(VOCAL_LIMITS[1], highest_sung + KEY_LIFT_HEADROOM)
        )
        if sung and (min(sung) < VOCAL_LIMITS[0] or max(sung) > ceiling):
            kept.append(
                f"section {i + 1}: the key shift {final[i]:+d} would leave the singing range; the key stays"
            )
            final[i] = 0
            continue
        # every note that sounds in the section (also one tied in from before) must stay a MIDI pitch
        moved = [n.pitch + final[i] for n in (*score.vocal, *score.ins) if n.onset < stop and n.end > start]
        if moved and (min(moved) < 0 or max(moved) > 127):
            kept.append(
                f"section {i + 1}: the key shift {final[i]:+d} would leave the MIDI range; the key stays"
            )
            final[i] = 0
    if not any(final):
        return score, kept
    vocal, ins = list(score.vocal), list(score.ins)
    for first, end in ranges:
        for point in (score.starts[first], score.starts[end]):
            vocal, ins = _split_at(vocal, point), _split_at(ins, point)

    def shift_of(onset: int) -> int:
        for i, (first, end) in enumerate(ranges):
            if score.starts[first] <= onset < score.starts[end]:
                return final[i]
        return 0

    moved_vocal = [c.Note(n.onset, n.duration, n.pitch + shift_of(n.onset)) for n in vocal]
    moved_ins = [c.Note(n.onset, n.duration, n.pitch + shift_of(n.onset)) for n in ins]
    if any(not 0 <= n.pitch <= 127 for n in (*moved_vocal, *moved_ins)):  # checked per section above
        return score, [
            *kept,
            *(
                f"section {i + 1}: the key shift {s:+d} would leave the MIDI range; the key stays"
                for i, s in enumerate(final)
                if s
            ),
        ]
    groups = {score.starts[g] for g in score.group_firsts}
    keys: list[c.KeyChange] = []
    boundaries = sorted({score.starts[first] for first, _ in ranges} | {k.onset for k in score.keys})
    for onset in boundaries:
        key = (
            native._transpose_key(score.key_at(onset), shift_of(onset))
            if shift_of(onset)
            else score.key_at(onset)
        )
        if keys and keys[-1].key == key:
            continue
        placement = "header" if onset == 0 else "field" if onset in groups else "inline"
        keys.append(c.KeyChange(onset, key, placement))
    chords = [
        c.ChordSymbol(ch.onset, native._chord_name(ch.name, shift_of(ch.onset), _key_at(keys, ch.onset)))
        if shift_of(ch.onset)
        else ch
        for ch in score.chords
    ]
    new = replace(
        score, keys=tuple(keys), vocal=tuple(moved_vocal), ins=tuple(moved_ins), chords=tuple(chords)
    )
    return c.validate(new), kept


def _key_at(keys: Sequence[c.KeyChange], onset: int) -> str:
    key = keys[0].key
    for change in keys:
        if change.onset > onset:
            break
        key = change.key
    return key


def _check(text: str) -> str | None:
    """Why the arranged text is not a document the Song Sheet can show and YuE2 can read (``None``: fine)."""
    analysis = native.analyze(text)
    if not analysis.ok:
        problems = [d.message for d in analysis.diagnostics if d.severity == "error"][:2]
        return "the arranged score does not pass YuE2's parser" + (
            f" ({'; '.join(problems)})" if problems else ""
        )
    try:
        if not c.musically_equal(c.from_abc(text), c.from_abc(c.to_abc(c.from_abc(text)))):
            return "the arranged score does not read back unchanged"
    except PlenioValidationError as error:
        return f"the arranged score cannot be read back ({error.message})"
    if editor_view(text).get("model") is None:
        return "the score editor could not show the arranged score note by note"
    return None


def arrange(
    text: str,
    answer: str,
    policy: Policy,
    *,
    seed: int = 0,
    fits: Callable[[str], str | None] | None = None,
) -> Arrangement:
    """``text`` arranged by the plan in ``answer`` under ``policy``.

    ``fits(abc)`` (optional) returns why an arranged score does not fit the music model (YuE2's
    context); the instrument lines are dropped first, then the whole arrangement falls back."""
    mode, closeness = policy.mode.name, policy.closeness

    def fallback(reason: str, plan: Plan | None = None, notes: Sequence[str] = ()) -> Arrangement:
        return Arrangement(
            text,
            "fallback",
            f"not applied: {reason} - the score is used as it was",
            mode,
            closeness,
            notes=(*notes, reason),
            plan=plan,
            idea=plan.idea if plan else "",
        )

    if policy.skip:
        return skipped(text, policy)
    try:
        score = c.from_abc(text)
    except PlenioValidationError as error:
        return fallback(f"the planned score cannot be edited note by note ({error.message})")
    ranges = section_ranges(score)
    try:
        plan = read_plan(answer, policy, len(ranges))
    except PlanError as error:
        return fallback(f"the writer's answer is not a usable plan - {error}")
    too_big: str | None = None
    for attempt in ("full", "without lines"):
        working = score
        results: list[SectionResult] = []
        notes = list(plan.notes)
        highest = max((n.pitch for n in score.vocal), default=None)
        shifts: list[int] = []
        for (label, first, end), section in zip(ranges, plan.sections, strict=True):
            applied: list[str] = []
            kept: list[str] = []
            melody = melody_voice(working, policy.melody)
            if section.chords is not None:
                try:
                    working, done, stayed = _apply_chords(working, first, end, section.chords, policy, melody)
                    applied += done
                    kept += stayed
                except (PlenioValidationError, ValueError, KeyError) as error:
                    kept.append(f"chords left out ({error})")
            if attempt == "full":
                start, stop = working.starts[first], working.starts[end]
                has_line = any(n.onset < stop and n.end > start for n in working.ins)  # also a held note
                lead = section.lead
                if lead != "keep" and has_line and not policy.replace_lines:
                    why = (
                        "it carries the melody" if policy.melody == "instrument" else "the closeness keeps it"
                    )
                    kept.append(f'lead "{lead}" left out: the instrument line plays here and {why}')
                    lead = "keep"
                if lead in NEEDS_CHORDS and not any(
                    chord_at(working, working.starts[m]) for m in range(first, end)
                ):
                    kept.append(f'lead "{lead}" left out: the section has no chords to build it on')
                    lead = "keep"
                if lead != "keep":
                    try:
                        line = _line(
                            working, first, end, replace(section, lead=lead), seed=seed, melody=melody
                        )
                        if line is not None:
                            working = _apply_line(working, first, end, line, f"arrangement: {lead}")
                            applied.append(
                                f"line {lead} (energy {section.energy})" if lead != "none" else "line silent"
                            )
                    except (PlenioValidationError, ValueError, KeyError, IndexError) as error:
                        kept.append(f'lead "{lead}" left out ({error})')
            shifts.append(section.key_shift)
            results.append(
                SectionResult(len(results) + 1, label, _bars(first, end), tuple(applied), tuple(kept))
            )
        try:
            working, stayed = _apply_shifts(working, [(f, e) for _, f, e in ranges], shifts, highest)
            for i, shift in enumerate(shifts):
                if not shift:
                    continue
                result = results[i]
                own = [s for s in stayed if s.startswith(f"section {i + 1}:")]
                if own:  # a planned part that stayed out: the section's (and the status's) business
                    kept_text = own[0].split(": ", 1)[1]
                    results[i] = replace(result, kept=(*result.kept, kept_text))
                else:
                    results[i] = replace(result, applied=(*result.applied, f"key {shift:+d}"))
            notes += [s for s in stayed if not s.startswith("section ")]
        except (PlenioValidationError, ValueError, KeyError) as error:
            notes.append(f"key shifts left out ({error})")
        if plan.tempo_change:
            bpm = max(20, min(300, round(score.tempo * (1 + plan.tempo_change / 100))))
            try:
                working = ops.change_tempo(working, bpm).score
                notes.append(f"tempo {score.tempo} -> {bpm} BPM ({plan.tempo_change:+d} %)")
            except PlenioValidationError as error:
                notes.append(f"tempo change left out ({error.message})")
        if working == score:
            if attempt == "without lines":  # the lines were all there was, and they do not fit
                notes.append(f"the instrument lines do not fit the music model's context ({too_big})")
            return Arrangement(
                text,
                "unchanged",
                (
                    "nothing of the plan could be used (see the notes)"
                    if any(r.kept for r in results)
                    else "the plan keeps everything as it is"
                )
                if attempt == "full"
                else "the plan's instrument lines do not fit the music model's context; nothing else changes",
                mode,
                closeness,
                tuple(results),
                tuple(notes),
                plan,
                plan.idea,
            )
        try:
            arranged = c.to_abc(working)
        except PlenioError as error:
            return fallback(f"the arranged score could not be written ({error})", plan, notes)
        problem = _check(arranged)
        if problem is not None:
            return fallback(problem, plan, notes)
        too_big = fits(arranged) if fits is not None else None
        if too_big is None:
            changed = sum(1 for r in results if r.applied)
            incomplete = any(r.kept for r in results) or bool(plan.dropped)
            status = "partial" if incomplete else "applied"
            if attempt == "without lines":
                notes.append("the instrument lines were left out so the score fits the music model's context")
                status = "partial"
            summary = f"{mode}: {changed} of {len(results)} sections arranged" + (
                " (some parts kept, see the notes)" if status == "partial" else ""
            )
            return Arrangement(
                arranged, status, summary, mode, closeness, tuple(results), tuple(notes), plan, plan.idea
            )
        if attempt == "without lines":
            return fallback(f"the arranged score does not fit the music model ({too_big})", plan, notes)
    raise AssertionError("unreachable")
