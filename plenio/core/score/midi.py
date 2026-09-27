"""Standard MIDI files <-> the canonical score (next-release plan §10.4). Pure; no dependency.

**Export** (SMF type 1): a conductor track (tempo, time signatures at meter changes, key
signatures, section markers, and a ``plenio:score`` text event with the unit and the line
layout), then the tracks *Vocal* (channel 1), *Instrument* (2), *Chords* (3: block voicings plus
``plenio:chord <name>`` text events) and, when given, *Guide* (4: never sent to YuE2).
Velocity 90. ``import_midi(export_midi(S)).score == S`` for every valid score, and the Guide
notes come back unchanged.

**Import** of any other file is deterministic and reported: tracks are mapped by name (Vocal,
Instrument/Ins, Chords, Guide) or by an explicit mapping; onsets and durations are quantised to
a grid (1/32 note by default); Vocal and Instrument are reduced to one voice (at every moment the
highest sounding note wins; cut notes are reported); the first tempo is used (later changes are
reported and dropped); time signatures take effect at measure starts, key signatures anywhere on
the grid; markers start sections at the measure that contains them; chord symbols come from
``plenio:chord`` text events (recognising chords from notes is not part of this module).
"""

from __future__ import annotations

import bisect
import heapq
import json
import math
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioValidationError
from . import canonical as c
from . import chords as chord_templates
from .canonical import ChordSymbol, KeyChange, Note, Score, Section
from .model import _chord_pitches

VELOCITY = 90
BASE_PPQ = 480
CHANNELS = {"vocal": 0, "ins": 1, "chords": 2, "guide": 3}
TRACK_NAMES = {"vocal": "Vocal", "ins": "Instrument", "chords": "Chords", "guide": "Guide"}
NAME_TO_ROLE = {"vocal": "vocal", "instrument": "ins", "ins": "ins", "chords": "chords", "guide": "guide"}
ROLES = ("vocal", "ins", "chords", "guide")
CHORD_TEXT = "plenio:chord "
SCORE_TEXT = "plenio:score "
MAJOR = ("Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#")
MINOR = ("Abm", "Ebm", "Bbm", "Fm", "Cm", "Gm", "Dm", "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m")
MAX_TEMPO, MIN_TEMPO = 300, 20


@dataclass(frozen=True)
class GuideNote:
    """A note of the Guide track: playback and MIDI only, polyphony allowed, never sent to YuE2."""

    onset: int
    duration: int
    pitch: int


@dataclass(frozen=True)
class TrackInfo:
    """What the import knows about one track of a file (the import dialog shows this)."""

    index: int
    """0-based, as the keys of ``mapping``."""
    name: str
    notes: int
    role: str | None
    """The role the track's name suggests (``vocal``, ``ins``, ``chords``, ``guide``), else ``None``."""


@dataclass(frozen=True)
class MidiImport:
    score: Score
    guide: tuple[GuideNote, ...] = ()
    report: tuple[str, ...] = ()
    tracks: tuple[TrackInfo, ...] = ()


# --- bytes ------------------------------------------------------------------------------


def _vlq(value: int) -> bytes:
    out = [value & 0x7F]
    value >>= 7
    while value:
        out.append(0x80 | (value & 0x7F))
        value >>= 7
    return bytes(reversed(out))


def _meta(kind: int, data: bytes) -> bytes:
    return bytes([0xFF, kind]) + _vlq(len(data)) + data


def _chunk(kind: bytes, body: bytes) -> bytes:
    return kind + len(body).to_bytes(4, "big") + body


def _track(events: Iterable[tuple[int, int, bytes]], end: int) -> bytes:
    """``(tick, order, message)`` sorted by tick then order, plus the end of track at ``end``."""
    body = bytearray()
    now = 0
    for tick, _order, message in sorted(events, key=lambda e: (e[0], e[1])):
        body += _vlq(tick - now) + message
        now = tick
    body += _vlq(max(end - now, 0)) + _meta(0x2F, b"")
    return _chunk(b"MTrk", bytes(body))


@dataclass
class _Event:
    tick: int
    kind: str
    """``on``, ``off``, ``meta``."""
    channel: int = 0
    pitch: int = 0
    velocity: int = 0
    meta: int = 0
    data: bytes = b""


@dataclass
class _Track:
    name: str = ""
    events: list[_Event] = field(default_factory=list)
    end: int = 0
    """Tick of the end-of-track event (the song end of a Plenio file)."""


def _read(data: bytes) -> tuple[int, int, list[_Track]]:
    """``(format, ticks per quarter, tracks)``; raises a clear error for anything that is not an SMF."""

    def fail(message: str) -> PlenioValidationError:
        return PlenioValidationError(f"The file is not a readable MIDI file: {message}.")

    if len(data) < 14 or data[:4] != b"MThd":
        raise fail("no MThd header")
    length = int.from_bytes(data[4:8], "big")
    fmt, count, division = (int.from_bytes(data[8 + 2 * i : 10 + 2 * i], "big") for i in range(3))
    if division & 0x8000:
        raise fail("SMPTE time division is not supported (use ticks per quarter note)")
    if fmt not in (0, 1) or division == 0:
        raise fail(f"format {fmt} is not supported (use type 0 or 1)")
    cursor = 8 + length
    tracks: list[_Track] = []
    while cursor + 8 <= len(data) and len(tracks) < count:
        kind, size = data[cursor : cursor + 4], int.from_bytes(data[cursor + 4 : cursor + 8], "big")
        body = data[cursor + 8 : cursor + 8 + size]
        cursor += 8 + size
        if kind != b"MTrk":
            continue
        if len(body) != size:
            raise fail("a track is truncated")
        tracks.append(_parse_track(body, fail))
    return fmt, division, tracks


def _parse_track(body: bytes, fail: Any) -> _Track:
    track = _Track()
    tick, position, status = 0, 0, 0

    def vlq() -> int:
        nonlocal position
        value = 0
        for _ in range(4):
            if position >= len(body):
                raise fail("a delta time runs past the track end")
            byte = body[position]
            position += 1
            value = (value << 7) | (byte & 0x7F)
            if not byte & 0x80:
                return value
        raise fail("a variable-length number is too long")

    while position < len(body):
        tick += vlq()
        track.end = tick
        if position >= len(body):
            raise fail("an event is missing")
        byte = body[position]
        if byte == 0xFF:
            if position + 2 > len(body):
                raise fail("a meta event is truncated")
            meta = body[position + 1]
            position += 2
            size = vlq()
            payload = body[position : position + size]
            position += size
            if meta == 0x03 and not track.name:
                track.name = _text(payload)
            if meta == 0x2F:
                track.end = tick
                break
            track.events.append(_Event(tick, "meta", meta=meta, data=payload))
            continue
        if byte in (0xF0, 0xF7):
            position += 1
            position += vlq()
            continue
        if byte & 0x80:
            status = byte
            position += 1
        elif not status:
            raise fail("running status without a status byte")
        kind, channel = status & 0xF0, status & 0x0F
        width = 1 if kind in (0xC0, 0xD0) else 2
        values = body[position : position + width]
        position += width
        if len(values) < width:
            raise fail("a channel message is truncated")
        if kind == 0x90 and values[1] > 0:
            track.events.append(_Event(tick, "on", channel, values[0], values[1]))
        elif kind in (0x80, 0x90):
            track.events.append(_Event(tick, "off", channel, values[0]))
    return track


def _text(payload: bytes) -> str:
    try:
        return payload.decode("utf-8")
    except UnicodeDecodeError:
        return payload.decode("latin-1")


# --- export -----------------------------------------------------------------------------


def _ppq(denominator: int) -> int:
    """Ticks per quarter such that one unit is a whole number of ticks."""
    return BASE_PPQ * denominator // math.gcd(4 * BASE_PPQ, denominator)


def _key_signature(key: str) -> bytes:
    count = upstream.KEYS[key]
    return bytes([count & 0xFF, 1 if key.endswith("m") else 0])


def _guide_key(note: GuideNote) -> tuple[int, int, int]:
    """The canonical guide order: two notes at the same onset *and* pitch have no order in the file.

    The MIDI round trip pairs note-offs with note-ons by pitch, so simultaneous same-pitch notes come
    back as the same multiset in an arbitrary order (found by the hypothesis test, 2026-09-28). Both
    sides sort by ``(onset, pitch, duration)`` so the round trip is canonical and deterministic.
    """
    return (note.onset, note.pitch, note.duration)


def export_midi(score: Score, *, guide: Sequence[GuideNote] = (), title: str = "") -> bytes:
    """The score (and optional Guide notes) as a type-1 standard MIDI file."""
    c.validate(score)
    denominator = score.unit.denominator
    ppq = _ppq(denominator)
    per_unit = ppq * 4 // denominator
    end = score.total * per_unit
    conductor: list[tuple[int, int, bytes]] = []
    if title:
        conductor.append((0, 0, _meta(0x03, title.encode("utf-8"))))
    info = {"version": 1, "unit": denominator, "layout": list(score.layout)}
    conductor.append((0, 1, _meta(0x01, (SCORE_TEXT + json.dumps(info, separators=(",", ":"))).encode())))
    conductor.append((0, 4, _meta(0x51, round(60_000_000 / score.tempo).to_bytes(3, "big"))))
    for index, meter in enumerate(score.meters):
        if index == 0 or meter != score.meters[index - 1]:
            n, d = meter
            data = bytes([n, d.bit_length() - 1, 24, 8])
            conductor.append((score.starts[index] * per_unit, 2, _meta(0x58, data)))
    for change in score.keys:
        conductor.append((change.onset * per_unit, 3, _meta(0x59, _key_signature(change.key))))
    for section in score.sections:
        conductor.append(
            (score.starts[section.measure] * per_unit, 5, _meta(0x06, section.label.encode("utf-8")))
        )
    tracks = [_track(conductor, end)]

    def notes_track(
        role: str, notes: Iterable[tuple[int, int, int]], extra: Iterable[tuple[int, int, bytes]] = ()
    ) -> bytes:
        channel = CHANNELS[role]
        events = [(0, 0, _meta(0x03, TRACK_NAMES[role].encode()))]
        events += list(extra)
        for onset, duration, pitch in notes:
            events.append((onset * per_unit, 2, bytes([0x90 | channel, pitch, VELOCITY])))
            events.append(((onset + duration) * per_unit, 1, bytes([0x80 | channel, pitch, 0])))
        return _track(events, end)

    tracks.append(notes_track("vocal", ((n.onset, n.duration, n.pitch) for n in score.vocal)))
    tracks.append(notes_track("ins", ((n.onset, n.duration, n.pitch) for n in score.ins)))
    voicings = []
    texts = []
    for index, chord in enumerate(score.chords):
        until = score.chords[index + 1].onset if index + 1 < len(score.chords) else score.total
        texts.append((chord.onset * per_unit, 0, _meta(0x01, (CHORD_TEXT + chord.name).encode())))
        voicings += [(chord.onset, until - chord.onset, pitch) for pitch in _chord_pitches(chord.name)]
    tracks.append(notes_track("chords", voicings, texts))
    if guide:
        tracks.append(
            notes_track("guide", ((g.onset, g.duration, g.pitch) for g in sorted(guide, key=_guide_key)))
        )
    header = _chunk(b"MThd", (1).to_bytes(2, "big") + len(tracks).to_bytes(2, "big") + ppq.to_bytes(2, "big"))
    return header + b"".join(tracks)


# --- import -----------------------------------------------------------------------------


def _name_role(track: _Track) -> str | None:
    """The role a track's name suggests (``None`` for anything else)."""
    return NAME_TO_ROLE.get(track.name.strip().lower())


def _roles(
    tracks: Sequence[_Track], mapping: Mapping[int, str | None] | None, report: list[str]
) -> dict[int, str]:
    """Track index -> role: an explicit mapping first, then the track names (first track of a name wins)."""
    roles: dict[int, str] = {}
    for index, track in enumerate(tracks):
        if mapping is not None and index in mapping:
            role = mapping[index]
            if role is not None and role not in ROLES:
                raise PlenioValidationError(f"Unknown track role {role!r}; use one of {list(ROLES)} or none.")
            if role:
                roles[index] = role
            continue
        role = _name_role(track)
        has_notes = any(e.kind == "on" for e in track.events)
        if role and role not in roles.values():
            roles[index] = role
        elif has_notes:
            report.append(f"track {index + 1} ({track.name or 'unnamed'}) was not imported: map it to a role")
    return roles


def _grid(ticks: int, step: Fraction) -> int:
    """The index of the nearest grid point of ``ticks`` (halves round up)."""
    return int(math.floor(Fraction(ticks) / step + Fraction(1, 2)))


def _pairs(events: Sequence[_Event], end: int) -> list[tuple[int, int, int]]:
    """``(start tick, end tick, pitch)`` of every note: first in, first out per channel and pitch;
    a note that is never released ends with its track."""
    open_notes: dict[tuple[int, int], list[int]] = {}
    notes = []
    for event in events:
        key = (event.channel, event.pitch)
        if event.kind == "on":
            open_notes.setdefault(key, []).append(event.tick)
        elif event.kind == "off" and open_notes.get(key):
            notes.append((open_notes[key].pop(0), event.tick, event.pitch))
    for (_channel, pitch), starts in open_notes.items():
        notes += [(start, max(end, start), pitch) for start in starts]
    return sorted(notes)


def _monophonic(notes: Sequence[tuple[int, int, int]], role: str, report: list[str]) -> list[Note]:
    """One voice: at every moment the highest sounding note wins (equal pitch: the earlier note)."""
    notes = sorted(n for n in notes if n[1] > n[0])
    if not notes:
        return []
    cuts = sorted({t for n in notes for t in n[:2]})
    heap: list[tuple[int, int, int]] = []  # (-pitch, start, index)
    pieces: list[list[int]] = []  # [onset, end, pitch, index]
    added = 0
    for low, high in zip(cuts, cuts[1:], strict=False):
        while added < len(notes) and notes[added][0] <= low:
            heapq.heappush(heap, (-notes[added][2], notes[added][0], added))
            added += 1
        while heap and notes[heap[0][2]][1] <= low:
            heapq.heappop(heap)
        if not heap:
            continue
        winner = heap[0][2]
        if pieces and pieces[-1][3] == winner and pieces[-1][1] == low:
            pieces[-1][1] = high
        else:
            pieces.append([low, high, notes[winner][2], winner])
    kept: dict[int, list[list[int]]] = {}
    for piece in pieces:
        kept.setdefault(piece[3], []).append(piece)
    cut = sum(
        1
        for index, (start, end, _pitch) in enumerate(notes)
        if [(p[0], p[1]) for p in kept.get(index, [])] != [(start, end)]
    )
    if cut:
        name = "Vocal" if role == "vocal" else "Instrument"
        report.append(
            f"{name}: {cut} overlapping note(s) were shortened, split or dropped (the highest note wins)"
        )
    return [Note(onset, end - onset, pitch) for onset, end, pitch, _index in pieces]


def _measures(
    signatures: Sequence[tuple[Fraction, tuple[int, int]]], units: int, denominator: int, report: list[str]
) -> list[tuple[int, int]]:
    """The meter of every measure until ``units`` are covered; a change takes effect at a measure start."""
    changes = sorted(signatures)
    if not changes or changes[0][0] > 0:
        report.append("no time signature at the start: 4/4 assumed")
        changes.insert(0, (Fraction(0), (4, 4)))
    meters: list[tuple[int, int]] = []
    position = 0
    current = changes[0][1]
    pending = list(changes[1:])
    while position < units or not meters:
        while pending and pending[0][0] <= position:
            at, meter = pending.pop(0)
            if at < position:
                report.append(
                    f"time signature {meter[0]}/{meter[1]} inside a bar moved to the start of bar {len(meters) + 1}"
                )
            current = meter
        meters.append(current)
        position += current[0] * denominator // current[1]
    return meters


def _firsts(layout: Sequence[int]) -> list[int]:
    firsts, cursor = [], 0
    for count in layout:
        firsts.append(cursor)
        cursor += count
    return firsts


def _layout(count: int, firsts: set[int]) -> tuple[int, ...]:
    """Groups that start at every required measure, at most four measures long."""
    starts = sorted(m for m in firsts if 0 <= m < count)
    layout: list[int] = []
    for index, start in enumerate(starts):
        span = (starts[index + 1] if index + 1 < len(starts) else count) - start
        while span > c.MAX_GROUP:
            layout.append(c.MAX_GROUP)
            span -= c.MAX_GROUP
        layout.append(span)
    return tuple(layout)


def import_midi(
    data: bytes,
    *,
    mapping: Mapping[int, str | None] | None = None,
    grid: int = 32,
    chords_from_notes: bool = False,
) -> MidiImport:
    """A score (plus Guide notes and a report of every lossy step) from a standard MIDI file.

    ``mapping`` assigns track indices (0-based) to ``vocal``, ``ins``, ``chords``, ``guide`` or ``None``
    (not imported); ``grid`` is the note value foreign timing is quantised to (1/``grid`` note);
    ``chords_from_notes`` reads chord symbols from the notes of the *Chords* track when the file
    carries no ``plenio:chord`` text events (``core.score.chords``, best effort, reported).
    """
    if grid not in (4, 8, 16, 32, 64):
        raise PlenioValidationError("The import grid must be 1/4, 1/8, 1/16, 1/32 or 1/64 notes.")
    _format, ppq, tracks = _read(data)
    report: list[str] = []
    metas = [e for track in tracks for e in track.events if e.kind == "meta"]
    info: dict[str, Any] = {}
    for event in metas:
        text = _text(event.data)
        if event.meta == 0x01 and text.startswith(SCORE_TEXT):
            try:
                loaded = json.loads(text[len(SCORE_TEXT) :])
            except ValueError:
                loaded = None
            if isinstance(loaded, dict):
                info = loaded
            else:
                report.append("the plenio:score text event is damaged and was ignored")
    raw_signatures = [
        (e.tick, (e.data[0], 2 ** e.data[1]))
        for e in metas
        if e.meta == 0x58 and len(e.data) >= 2 and e.data[0] > 0
    ]
    unit = info.get("unit")
    if isinstance(unit, int) and c._power_of_two(unit) and unit <= c.MAX_UNIT:
        denominator, snap = unit, 1  # a Plenio file: its own unit, exact timing
    else:
        denominator = min(c.MAX_UNIT, max([grid, *(meter[1] for _tick, meter in raw_signatures)]))
        snap = max(1, denominator // grid)
    ticks_per_unit = Fraction(ppq * 4, denominator)
    step = ticks_per_unit * snap

    def at(tick: int) -> int:
        return _grid(tick, step) * snap

    roles = _roles(tracks, mapping, report)
    infos = tuple(
        TrackInfo(index, track.name, len(_pairs(track.events, track.end)), _name_role(track))
        for index, track in enumerate(tracks)
    )
    tempos = sorted(
        (e.tick, int.from_bytes(e.data[:3], "big")) for e in metas if e.meta == 0x51 and len(e.data) >= 3
    )
    tempo = 120
    if tempos:
        tempo = round(60_000_000 / max(tempos[0][1], 1))
        if len({value for _tick, value in tempos}) > 1:
            report.append(f"{len(tempos) - 1} later tempo change(s) were dropped (a score has one tempo)")
    else:
        report.append("no tempo: 120 BPM assumed")
    if not MIN_TEMPO <= tempo <= MAX_TEMPO:
        report.append(f"tempo {tempo} BPM clamped to {MIN_TEMPO}-{MAX_TEMPO}")
        tempo = min(max(tempo, MIN_TEMPO), MAX_TEMPO)
    pitched: dict[str, list[tuple[int, int, int]]] = {role: [] for role in ROLES}
    moved = 0
    for index, role in roles.items():
        for start, end, pitch in _pairs(tracks[index].events, tracks[index].end):
            onset, stop = at(start), at(end)
            if stop <= onset:
                stop = onset + snap
            moved += (Fraction(start) != onset * ticks_per_unit) + (Fraction(end) != stop * ticks_per_unit)
            pitched[role].append((onset, stop, pitch))
    if moved:
        report.append(f"{moved} note start(s)/end(s) were quantised to 1/{grid} notes")
    chords: dict[int, str] = {}
    for index, role in roles.items():
        if role != "chords":
            continue
        for event in tracks[index].events:
            text = _text(event.data) if event.kind == "meta" and event.meta == 0x01 else ""
            if text.startswith(CHORD_TEXT):
                name = text[len(CHORD_TEXT) :].strip()
                if upstream.CHORD.fullmatch(name) is None:
                    report.append(f"chord text {name!r} is not a supported chord symbol and was skipped")
                else:
                    chords[at(event.tick)] = name
    end_units = max(
        [
            math.ceil(Fraction(max((t.end for t in tracks), default=0)) / ticks_per_unit),
            *(end for role in ROLES for _onset, end, _pitch in pitched[role]),
            *(onset + 1 for onset in chords),
            *(at(e.tick) + 1 for e in metas if e.meta in (0x59, 0x06)),
            1,
        ]
    )
    signatures = [(Fraction(tick) / ticks_per_unit, meter) for tick, meter in raw_signatures]
    meters = _measures(signatures, end_units, denominator, report)
    starts = [0]
    for n, d in meters:
        starts.append(starts[-1] + n * denominator // d)
    total = starts[-1]
    keys: dict[int, str] = {}
    for event in sorted((e for e in metas if e.meta == 0x59 and len(e.data) >= 2), key=lambda e: e.tick):
        count = int.from_bytes(event.data[:1], "big", signed=True)
        if not -7 <= count <= 7:
            report.append(f"a key signature with {count} accidentals was skipped")
            continue
        keys[min(at(event.tick), total - 1)] = (MINOR if event.data[1] else MAJOR)[count + 7]
    if 0 not in keys:
        keys[0] = "C"
        report.append("no key signature at the start: C major assumed")
    if not chords and pitched["chords"]:
        if chords_from_notes:
            reading = chord_templates.recognize_chords(
                pitched["chords"], keys=sorted(keys.items()), default_key=keys[0]
            )
            chords = {chord.onset: chord.name for chord in reading.chords}
            note = f"chord symbols were read from the notes of the Chords track (best effort, {len(chords)} symbol(s))"
            if reading.merged:
                note += f"; {reading.merged} onset(s) are covered by the symbol before them"
            if reading.skipped:
                note += f"; {reading.skipped} onset(s) did not match a supported chord"
            report.append(note)
        else:
            report.append(
                "the Chords track has notes but no plenio:chord text events; turn on chord recognition "
                "to read symbols from the notes"
            )
    sections: dict[int, str] = {}
    for event in sorted((e for e in metas if e.meta == 0x06), key=lambda e: e.tick):
        label = " ".join(_text(event.data).split())
        if not label:
            continue
        units = min(at(event.tick), total - 1)
        measure = bisect.bisect_right(starts, units) - 1
        if starts[measure] != units:
            report.append(f"marker {label!r} moved to the start of bar {measure + 1}")
        sections[measure] = label
    required = {0, *sections, *(i for i in range(1, len(meters)) if meters[i] != meters[i - 1])}
    layout = _layout(len(meters), required)
    wanted = info.get("layout")
    if isinstance(wanted, list) and all(isinstance(v, int) and not isinstance(v, bool) for v in wanted):
        candidate = tuple(wanted)
        if (
            sum(candidate) == len(meters)
            and all(1 <= v <= c.MAX_GROUP for v in candidate)
            and required <= set(_firsts(candidate))
        ):
            layout = candidate
    group_onsets = {starts[g] for g in _firsts(layout)}
    score = Score(
        tempo=tempo,
        unit=Fraction(1, denominator),
        meters=tuple(meters),
        keys=tuple(
            KeyChange(o, keys[o], "header" if o == 0 else "field" if o in group_onsets else "inline")
            for o in sorted(keys)
        ),
        sections=tuple(Section(m, sections[m]) for m in sorted(sections)),
        layout=layout,
        vocal=tuple(_monophonic(pitched["vocal"], "vocal", report)),
        ins=tuple(_monophonic(pitched["ins"], "ins", report)),
        chords=tuple(ChordSymbol(o, chords[o]) for o in sorted(chords) if o < total),
    )
    found = c.problems(score)
    if found:
        raise PlenioValidationError(
            "The MIDI file cannot be read as a score.",
            diagnostics=[{"severity": "error", "message": problem, "where": "midi"} for problem in found],
        )
    guide = tuple(sorted((GuideNote(o, e - o, p) for o, e, p in pitched["guide"]), key=_guide_key))
    return MidiImport(score, guide, tuple(report), infos)


MAX_FILE_BYTES = 8 * 1024 * 1024


def filename_for(title: str) -> str:
    """``<title>.mid`` with only safe characters (``score.mid`` without a title)."""
    safe = "".join(ch if ch.isalnum() or ch in " -_()" else "_" for ch in title.strip())[:80].strip()
    return f"{safe or 'score'}.mid"


def guide_from_json(value: object) -> tuple[GuideNote, ...]:
    """Guide notes from ``[[onset, duration, pitch], ...]`` (the editor keeps them in node properties)."""
    if value in (None, ""):
        return ()
    if not isinstance(value, list):
        raise PlenioValidationError("'guide' must be a list of [onset, duration, pitch].")
    notes = []
    for item in value:
        if (
            not isinstance(item, list | tuple)
            or len(item) != 3
            or not all(isinstance(v, int) and not isinstance(v, bool) for v in item)
            or item[0] < 0
            or item[1] < 1
            or not 0 <= item[2] <= 127
        ):
            raise PlenioValidationError(
                f"Guide note {item!r} is not [onset >= 0, duration >= 1, pitch 0-127]."
            )
        notes.append(GuideNote(item[0], item[1], item[2]))
    return tuple(sorted(notes, key=_guide_key))


def mapping_from_json(value: object) -> dict[int, str | None] | None:
    """A track mapping from ``{"<track index>": "vocal" | "ins" | "chords" | "guide" | null}``."""
    if value in (None, ""):
        return None
    if not isinstance(value, dict):
        raise PlenioValidationError("'mapping' must map track numbers to roles.")
    mapping: dict[int, str | None] = {}
    for key, role in value.items():
        if not str(key).isdigit() or (role is not None and role not in ROLES):
            raise PlenioValidationError(
                f"Track mapping {key!r}: {role!r} is not valid; use one of {list(ROLES)} or null."
            )
        mapping[int(key)] = role
    return mapping


__all__ = [
    "MAX_FILE_BYTES",
    "GuideNote",
    "MidiImport",
    "TrackInfo",
    "export_midi",
    "filename_for",
    "guide_from_json",
    "import_midi",
    "mapping_from_json",
]
