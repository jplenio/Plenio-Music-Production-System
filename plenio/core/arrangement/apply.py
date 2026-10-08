"""Apply a section plan to a score - or fall back to the score as it was, and say why.

The order per section: chords (``harmony.repair``: the writer's chord where it belongs to the key and the
genre and carries the whole bar's melody, else the nearest chord that does), then the instrument line
(written from the chords sounding, fitted to the voice: only in its rests, or below it with *lines under
the singing*), a gate (a section that clashes more than before goes back to how it was), then the key
shift; at the end the tempo.
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
from . import harmony, lines
from .plan import (
    NEEDS_CHORDS,
    Plan,
    PlanError,
    Policy,
    SectionPlan,
    chord_at,
    for_score,
    melody_voice,
    read_plan,
    section_ranges,
)

STATUSES = ("applied", "partial", "unchanged", "fallback", "skipped")
VOCAL_LIMITS = (40, 84)
"""Sung notes stay between E2 and C6 when a section changes key."""
SHARE_TOLERANCE = 1e-9
"""How much more of a section's melody time may clash with its chords after the arrangement: none (a rounding
margin only). Replayed on study A1's 120 plans, a margin for passing notes (0.15) changed nothing - the guard
already keeps such chords out - but a fuzz case showed a short weak-beat note half the melody's time."""
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
    harmony: dict[str, Any] = field(default_factory=dict)
    """``before`` and ``after``: ``harmony.Measures`` of the score as planned and as arranged."""

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
            "harmony": self.harmony,
        }


def skipped(text: str, policy: Policy) -> Arrangement:
    """The score unchanged, without asking the writer: arrangement off, or a cover kept as it is."""
    return Arrangement(text, "skipped", f"skipped: {policy.skip_reason}", policy.mode.name, policy.closeness)


def _bars(first: int, end: int) -> str:
    return f"{first + 1}" if end - first == 1 else f"{first + 1}-{end}"


def section_vocabulary(score: c.Score, first: int, end: int, policy: Policy) -> harmony.Vocabulary:
    """The chords a section may use: its key, the genre family of the brief's genre and style, the mode's
    qualities narrowed by the closeness."""
    return harmony.vocabulary(
        harmony.section_key(score, first, end),
        harmony.genre_of(policy.genre),
        policy.qualities,
        closeness=policy.closeness,
        slash=policy.slash,
        tensions=policy.tensions,
    )


def _apply_chords(
    score: c.Score,
    first: int,
    end: int,
    progression: Sequence[str | None],
    policy: Policy,
    melody: Sequence[c.Note],
) -> tuple[c.Score, list[str], list[str]]:
    """The section's chords after ``harmony.repair``; a bar that keeps its chord gets it written out when the
    bar before it changed (so a held chord does not silently become the new one)."""
    vocab = section_vocabulary(score, first, end, policy)
    repaired = harmony.repair(score, first, end, progression, melody, vocab)
    applied: list[str] = []
    kept = [bar.note for bar in repaired if bar.note]
    chords = list(score.chords)
    names: list[str] = []
    changed = False
    for bar in repaired:
        start, length = score.starts[bar.measure], score.lengths[bar.measure]
        inside = [ch for ch in score.chords if start <= ch.onset < start + length]
        if bar.chords is None:
            sounding = chord_at(score, start)
            if changed and sounding and not any(ch.onset == start for ch in inside):
                chords.append(c.ChordSymbol(start, sounding))  # the old chord again after a changed bar
            names.append(sounding or "-")
            changed = False
            continue
        chords = [ch for ch in chords if not start <= ch.onset < start + length]
        chords += [c.ChordSymbol(onset, name) for onset, name in bar.chords]
        names.append(bar.chords[0][1])
        changed = True
    if changed and end < score.measure_count:
        after = score.starts[end]
        sounding = chord_at(score, after)
        if sounding and not any(ch.onset == after for ch in score.chords):
            chords.append(c.ChordSymbol(after, sounding))  # the next section starts with its own chord
    new = c.validate(replace(score, chords=tuple(sorted(chords, key=lambda ch: ch.onset))))
    if new.chords != score.chords:
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
    policy: Policy | None = None,
) -> list[lines.LineNote] | None:
    """The notes of the plan's lead role in the section, fitted to the chords and to the voice; ``None``
    keeps the line as it is.

    With a sung melody the line plays only where the voice rests (fills and answers - YuE2's own scores
    never sound the Ins voice under the singing); with ``policy.under_singing`` the rests keep the planned
    energy and the line under the voice is the calm one (energy at most 2), below the voice and without a
    minor second or major seventh against it."""
    notes = _raw_line(score, first, end, plan, seed=seed, melody=melody)
    if notes is None or not notes:
        return notes
    chord_names = [chord_at(score, score.starts[m]) for m in range(first, end)]
    bars = lines.bars_of(score, first, end, chord_names)
    quarter = max(1, score.units_per_quarter)
    notes = lines.settle(notes, bars, quarter)
    if policy is None or policy.melody != "vocal" or not score.vocal:
        return notes
    start, stop = score.starts[first], score.starts[end] if end < score.measure_count else score.total
    gaps = lines.rests_of(score.vocal, start, stop, quarter)
    fills = lines.in_rests(notes, gaps)
    if not policy.under_singing:
        return fills
    calm_plan = replace(plan, energy=min(2, plan.energy))
    calm = _raw_line(score, first, end, calm_plan, seed=seed, melody=melody) or []
    singing = _complement(gaps, start, stop)
    under = lines.below_voice(lines.in_rests(lines.settle(calm, bars, quarter), singing), score.vocal, bars)
    return sorted([*fills, *under])


def _complement(gaps: Sequence[tuple[int, int]], start: int, stop: int) -> list[tuple[int, int]]:
    """The spans of ``[start, stop)`` outside ``gaps``."""
    spans: list[tuple[int, int]] = []
    cursor = start
    for a, b in gaps:
        if a > cursor:
            spans.append((cursor, a))
        cursor = max(cursor, b)
    if cursor < stop:
        spans.append((cursor, stop))
    return spans


def _raw_line(
    score: c.Score,
    first: int,
    end: int,
    plan: SectionPlan,
    *,
    seed: int,
    melody: Sequence[c.Note],
) -> list[lines.LineNote] | None:
    """The notes the lead role's generator writes for the section."""
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


def _span(score: c.Score, first: int, end: int) -> tuple[int, int]:
    return score.starts[first], score.starts[end] if end < score.measure_count else score.total


@dataclass(frozen=True)
class Trouble:
    """A section's clashes (the gate compares them before and after the arrangement)."""

    accented: int
    """Melody notes a half step above their chord's tone on a strong beat or held for a beat."""
    clashes: int
    """Moments of an eighth or more with the voice and the line a minor second / major seventh apart."""
    share: float
    """The share of the melody's time that clashes with its chord (``harmony.Measures.clash_share``)."""

    def worse_than(self, before: Trouble) -> bool:
        return (
            self.accented > before.accented
            or self.clashes > before.clashes
            or self.share > before.share + SHARE_TOLERANCE
        )


def _trouble(score: c.Score, first: int, end: int, melody: str) -> Trouble:
    """A section's clashes (``Trouble``)."""
    start, stop = _span(score, first, end)
    voice = melody_voice(score, melody)
    accented = 0
    chords = list(score.chords)
    for piece in harmony.pieces(score, voice, start, stop):
        name = None
        for ch in chords:
            if ch.onset > piece.onset:
                break
            name = ch.name
        if name is None or not piece.accented:
            continue
        try:
            if harmony.is_avoid(piece.pitch % 12, harmony.tones(name)):
                accented += 1
        except ValueError:
            continue
    sung = sorted((n for n in score.vocal if n.onset < stop and n.end > start), key=lambda n: n.onset)
    line = sorted((n for n in score.ins if n.onset < stop and n.end > start), key=lambda n: n.onset)
    inside = [n for n in voice if n.onset < stop and n.end > start]
    share = harmony.measure(score, inside).clash_share if inside else 0.0
    return Trouble(accented, harmony.clashes(score, sung, line), share)


def _voice_clashes(score: c.Score) -> int:
    """Clashes between the voice and the line in the whole score (``harmony.clashes``)."""
    return harmony.clashes(
        score, sorted(score.vocal, key=lambda n: n.onset), sorted(score.ins, key=lambda n: n.onset)
    )


def _measures(before: c.Score, after: c.Score, policy: Policy) -> dict[str, Any]:
    """The harmony of the score as planned and as arranged (``harmony.Measures``), for the report."""
    genre = harmony.genre_of(policy.genre)
    tensions = genre.tensions | harmony.TENSIONS.get(policy.tensions, frozenset())
    return {
        "genre": genre.family,
        "before": harmony.measure(before, melody_voice(before, policy.melody), tensions=tensions).to_dict(),
        "after": harmony.measure(after, melody_voice(after, policy.melody), tensions=tensions).to_dict(),
    }


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


def _holding(shifts: Sequence[int]) -> tuple[list[int], bool]:
    """The planned key shifts with every lift held to the end: a section after a lift keeps it unless it lifts
    further (the owner's listening in study E7: a last chorus lifted and the outro back down was the most
    abrupt moment of the takes)."""
    held: list[int] = []
    running = 0
    for shift in shifts:
        if shift and (not running or ((shift > 0) == (running > 0) and abs(shift) >= abs(running))):
            running = shift
        held.append(running)
    return held, held != list(shifts)


def _triad(key: harmony.Key, degree: int) -> tuple[int, str] | None:
    """The diatonic triad on ``degree`` (0-based) of ``key``: root and quality (major, minor; ``None`` else)."""
    scale = key.scale
    root, third, fifth = scale[degree % 7], scale[(degree + 2) % 7], scale[(degree + 4) % 7]
    shape = ((third - root) % 12, (fifth - root) % 12)
    return (root, "") if shape == (4, 7) else (root, "m") if shape == (3, 7) else None


def _pivots(old: harmony.Key, new: harmony.Key) -> list[tuple[int, str]]:
    """Chords of both keys, the new key's pre-dominants first (ii and IV in major, iv and VI in minor)."""
    order = (3, 5, 0, 2) if new.minor else (1, 3, 5, 2)
    old_scale = set(old.scale)
    found = []
    for degree in order:
        triad = _triad(new, degree)
        if triad and {(triad[0] + i) % 12 for i in ((0, 4, 7) if triad[1] == "" else (0, 3, 7))} <= old_scale:
            found.append(triad)
    return found


def _modulations(old: harmony.Key, new: harmony.Key) -> list[tuple[str, list[tuple[int, str]]]]:
    """Chord sequences that lead into ``new``, the clearest first: a chord of both keys and the new key's
    dominant (the pivot-chord modulation), the new key's lowered sixth and seventh steps rising to it (bVI -
    bVII - I, common in pop and rock), its dominant alone; each chord as ``(root, quality)``."""
    tonic = new.tonic
    dominants = [((tonic + 7) % 12, "7"), ((tonic + 7) % 12, "")]
    sequences: list[tuple[str, list[tuple[int, str]]]] = []
    for pivot in _pivots(old, new):
        for dominant in dominants:
            sequences.append(("a chord of both keys, then the new key's dominant", [pivot, dominant]))
    sequences.append(
        (
            "the new key's lowered sixth and seventh steps rising to it",
            [((tonic + 8) % 12, ""), ((tonic + 10) % 12, "")],
        )
    )
    sequences += [("the new key's dominant", [dominant]) for dominant in dominants]
    return sequences


def _prepare_lifts(score: c.Score, original: c.Score, melody: Sequence[c.Note]) -> tuple[c.Score, list[str]]:
    """Every key change the arrangement made, led into by chords (the owner's listening in study E7: a single
    chord on half a bar still sounded sudden). In this order, the first whose every chord clashes with nothing
    that sounds under it - the melody and the instrument line:

    - a chord of both keys (the new key's ii/IV, or iv/VI in minor) and the new key's dominant, a bar each over
      the last two bars, else half a bar each in the last bar (Cm - D7 -> Gm, Em - A7 -> D);
    - the new key's bVI and bVII rising to it, likewise (Eb - F -> Gm, Bb - C -> D);
    - its dominant over the last bar, its second half or its last beat;
    - the subdominant or the chord on its lowered seventh step, on the last bar's second half or last beat.

    A change that none of them fits comes unprepared and is reported. A score without chords stays as it is
    (YuE2 harmonises it)."""
    if not score.chords:
        return score, []
    made = [k for k in score.keys if k.onset > 0 and k.onset not in {o.onset for o in original.keys}]
    chords = list(score.chords)
    notes: list[str] = []
    beat = max(1, score.units_per_quarter)
    sounding_notes = (*melody, *score.ins)

    def fits(name: str, start: int, stop: int) -> bool:
        try:
            chord_tones = harmony.tones(name)
            root = harmony.parse_chord(name)[0]
        except ValueError:
            return False
        parts = harmony.pieces(score, sounding_notes, start, stop)
        return not any(harmony.clashing(q.pitch % 12, chord_tones, root, frozenset({2, 9})) for q in parts)

    for change in made:
        last = score.measure_at(change.onset - 1)
        last_start = score.starts[last]
        old_key_name = score.key_at(change.onset - 1)
        try:
            old_key, new_key = harmony.key_of(old_key_name), harmony.key_of(change.key)
        except (KeyError, ValueError):
            continue
        earlier = [k.onset for k in score.keys if k.onset < change.onset]
        floor = max(earlier) if earlier else 0  # never reach back over an earlier key change
        half = last_start + (change.onset - last_start) // 2
        minor_name = change.key if new_key.minor else f"{change.key}m"
        two_bars = last - 1 >= 0 and score.starts[last - 1] >= floor
        found: tuple[str, list[tuple[int, str]]] | None = None
        for why, sequence in _modulations(old_key, new_key):
            # spelled in the new key; its lowered steps in its minor (Bb - C -> D, not A# - C)
            spelling = minor_name if "lowered" in why else change.key
            names = [harmony.chord_name(root, quality, spelling) for root, quality in sequence]
            if len(names) == 2:
                layouts = []
                if two_bars:
                    before_start = score.starts[last - 1]
                    before_half = before_start + (last_start - before_start) // 2
                    layouts.append([(before_start, last_start), (last_start, change.onset)])
                    layouts.append([(before_half, last_start), (last_start, change.onset)])
                if last_start < half < change.onset:
                    layouts.append([(last_start, half), (half, change.onset)])
            else:
                layouts = [[(start, change.onset)] for start in (last_start, half, change.onset - beat)]
            for layout in layouts:
                if all(start < stop and start >= floor for start, stop in layout) and all(
                    fits(name, start, stop) for name, (start, stop) in zip(names, layout, strict=True)
                ):
                    found = (why, [(start, name) for name, (start, _stop) in zip(names, layout, strict=True)])
                    break
            if found:
                break
        if found is None:
            for interval, quality in ((5, "m" if new_key.minor else ""), (10, "")):
                name = harmony.chord_name((new_key.tonic + interval) % 12, quality, minor_name)
                for start in (half, change.onset - beat):
                    if last_start <= start < change.onset and fits(name, start, change.onset):
                        found = ("a chord leading into it", [(start, name)])
                        break
                if found:
                    break
        if found is None:
            notes.append(
                f"the key change to {change.key} at bar {last + 2} comes unprepared: every leading chord would clash"
            )
            continue
        why, placed = found
        first = placed[0][0]
        before = [ch for ch in sorted(chords, key=lambda ch: ch.onset) if ch.onset <= change.onset]
        after = before[-1].name if before else None
        chords = [ch for ch in chords if not first <= ch.onset < change.onset]
        chords += [c.ChordSymbol(start, name) for start, name in placed]
        if after and not any(ch.onset == change.onset for ch in chords):
            chords.append(c.ChordSymbol(change.onset, after))  # the lifted section starts on its own chord
        bars = (
            f"bar {score.measure_at(first) + 1}"
            if score.measure_at(first) == last
            else f"bars {last}-{last + 1}"
        )
        notes.append(f"{bars}: {' - '.join(name for _, name in placed)} lead into {change.key} ({why})")
    if not notes or all("comes unprepared" in n for n in notes):
        return score, notes
    return c.validate(replace(score, chords=tuple(sorted(chords, key=lambda ch: ch.onset)))), notes


def _same_run(shifts: Sequence[int], i: int, j: int) -> bool:
    """Whether sections ``i`` and ``j`` belong to one run of the same shift."""
    low, high = min(i, j), max(i, j)
    return all(shifts[k] == shifts[i] for k in range(low, high + 1))


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
    # a lift that cannot be made in one of its sections stays out in all of them: falling back to the old key
    # in the middle of a held lift is the abrupt moment the hold avoids
    for i, planned in enumerate(shifts):
        if planned and not final[i]:
            for j, other in enumerate(shifts):
                if other == planned and final[j] and _same_run(shifts, i, j):
                    final[j] = 0
                    kept.append(
                        f"section {j + 1}: the key shift {planned:+d} stays out with section {i + 1}'s"
                    )
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
    # a chord held across a boundary where the shift changes is written again there, so it moves only
    # inside the shifted section (otherwise the next section would sound it moved, under its own notes)
    held = list(score.chords)
    for first, _end in ranges:
        point = score.starts[first]
        if point == 0 or any(ch.onset == point for ch in held):
            continue
        if shift_of(point) != shift_of(point - 1):
            sounding = chord_at(score, point)
            if sounding:
                held.append(c.ChordSymbol(point, sounding))
    held.sort(key=lambda ch: ch.onset)
    chords = [
        c.ChordSymbol(ch.onset, native._chord_name(ch.name, shift_of(ch.onset), _key_at(keys, ch.onset)))
        if shift_of(ch.onset)
        else ch
        for ch in held
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
    policy = for_score(policy, has_chords=bool(score.chords))  # no chords: YuE2 harmonises, none are added
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
            section_start = working
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
                            working,
                            first,
                            end,
                            replace(section, lead=lead),
                            seed=seed,
                            melody=melody,
                            policy=policy,
                        )
                        if line is not None and not line and lead != "none":
                            kept.append(
                                f'lead "{lead}" left out: the voice sings through the section, no room for a line'
                            )
                        elif line is not None:
                            working = _apply_line(working, first, end, line, f"arrangement: {lead}")
                            applied.append(
                                f"line {lead} (energy {section.energy})" if lead != "none" else "line silent"
                            )
                    except (PlenioValidationError, ValueError, KeyError, IndexError) as error:
                        kept.append(f'lead "{lead}" left out ({error})')
            trouble_before = _trouble(score, first, end, policy.melody)
            trouble_after = _trouble(working, first, end, policy.melody)
            # the voice against the line counted in the whole score as well: a clash held across the section's
            # boundary can fall apart into two when the line inside changes (found by the fuzz test)
            if applied and (
                trouble_after.worse_than(trouble_before)
                or _voice_clashes(working) > _voice_clashes(section_start)
            ):
                working = section_start
                kept.append(
                    "the arranged section clashed more than before (melody against chords "
                    f"{trouble_before.accented} -> {trouble_after.accented} accented, "
                    f"{trouble_before.share:.0%} -> {trouble_after.share:.0%} of its time; voice against line "
                    f"{trouble_before.clashes} -> {trouble_after.clashes}); it stays as it was"
                )
                applied = []
            shifts.append(section.key_shift)
            results.append(
                SectionResult(len(results) + 1, label, _bars(first, end), tuple(applied), tuple(kept))
            )
        try:
            shifts, held_on = _holding(shifts)
            if held_on:
                notes.append(
                    "the key lift holds to the end of the song (a lift that falls back again sounds abrupt)"
                )
            before_shift = working
            working, stayed = _apply_shifts(working, [(f, e) for _, f, e in ranges], shifts, highest)
            if working is not before_shift:
                working, prepared = _prepare_lifts(
                    working, before_shift, melody_voice(working, policy.melody)
                )
                notes += prepared
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
                arranged,
                status,
                summary,
                mode,
                closeness,
                tuple(results),
                tuple(notes),
                plan,
                plan.idea,
                harmony=_measures(score, c.from_abc(arranged), policy),
            )
        if attempt == "without lines":
            return fallback(f"the arranged score does not fit the music model ({too_big})", plan, notes)
    raise AssertionError("unreachable")
