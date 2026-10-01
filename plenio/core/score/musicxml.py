"""The score as MusicXML 4.0 (owner's request 2026-10-01: the sheet music in a universal format).

MusicXML is what notation programs exchange (MuseScore, Sibelius, Finale, Dorico, Cubase's score
editor, Logic). The export writes the canonical score as two parts - *Vocal* with the chord symbols,
the section names (rehearsal marks), the tempo and the lyrics, and *Instrument* - with the score's
meters and keys. Notes that cross a bar line or last a length no single note value has are written
as tied notes; pitches are spelled for the key (the editor's speller). The Guide track is playback
only and stays in the MIDI export.

Plain text, no dependencies; the file opens without a DTD download (the DOCTYPE is informational).
"""

from __future__ import annotations

import datetime as _dt
from collections.abc import Sequence
from dataclasses import dataclass
from xml.sax.saxutils import escape

from ...third_party import yue2_abc_tools as upstream
from . import canonical, lyric_layout, ops
from .native import _spell

MUSICXML_MIME = "application/vnd.recordare.musicxml+xml"

# note values in quarters (with dots), largest first
_VALUES: tuple[tuple[float, str, int], ...] = (
    (6.0, "whole", 1),
    (4.0, "whole", 0),
    (3.0, "half", 1),
    (2.0, "half", 0),
    (1.5, "quarter", 1),
    (1.0, "quarter", 0),
    (0.75, "eighth", 1),
    (0.5, "eighth", 0),
    (0.375, "16th", 1),
    (0.25, "16th", 0),
    (0.1875, "32nd", 1),
    (0.125, "32nd", 0),
    (0.0625, "64th", 0),
    (0.03125, "128th", 0),
)
_KINDS = {
    "": ("major", ""),
    "m": ("minor", "m"),
    "dim": ("diminished", "dim"),
    "aug": ("augmented", "aug"),
    "7": ("dominant", "7"),
    "maj7": ("major-seventh", "maj7"),
    "m7": ("minor-seventh", "m7"),
    "dim7": ("diminished-seventh", "dim7"),
    "m7b5": ("half-diminished", "m7b5"),
    "sus4": ("suspended-fourth", "sus4"),
    "sus2": ("suspended-second", "sus2"),
    "6": ("major-sixth", "6"),
    "m6": ("minor-sixth", "m6"),
    "7sus4": ("suspended-fourth", "7sus4"),
    "m(maj7)": ("major-minor", "m(maj7)"),
}
_ALTER = {"bb": -2, "b": -1, "": 0, "#": 1, "##": 2}


@dataclass(frozen=True)
class _Piece:
    start: int
    length: int
    pitch: int | None  # None: a rest
    tie_in: bool
    tie_out: bool
    attack: int | None  # the onset of the sounding note this piece belongs to


def filename_for(title: str) -> str:
    """``<title>.musicxml`` with only safe characters (``score.musicxml`` without a title)."""
    safe = "".join(ch if ch.isalnum() or ch in " -_()" else "_" for ch in title.strip())[:80].strip()
    return f"{safe or 'score'}.musicxml"


def _values(units: int, per_quarter: int) -> list[tuple[int, str, int]]:
    """``units`` as note values ``(units, type, dots)``, largest first (tied when there are several)."""
    result: list[tuple[int, str, int]] = []
    left = units
    for quarters, kind, dots in _VALUES:
        size = quarters * per_quarter
        if size != int(size) or size < 1:
            continue
        while left >= size:
            result.append((int(size), kind, dots))
            left -= int(size)
    if left:  # finer than the table (never for a supported L): one more piece of the smallest kind
        result.append((left, "128th", 0))
    return result


def _pieces(notes: Sequence[canonical.Note], start: int, end: int, cuts: Sequence[int]) -> list[_Piece]:
    """The measure ``[start, end)`` of one voice as notes and rests, cut at ``cuts`` (key changes)."""
    events: list[_Piece] = []
    cursor = start
    for note in notes:
        if note.end <= start or note.onset >= end:
            continue
        if note.onset > cursor:
            events.append(_Piece(cursor, note.onset - cursor, None, False, False, None))
        begin, finish = max(note.onset, start), min(note.end, end)
        events.append(
            _Piece(begin, finish - begin, note.pitch, note.onset < start, note.end > end, note.onset)
        )
        cursor = finish
    if cursor < end:
        events.append(_Piece(cursor, end - cursor, None, False, False, None))
    result: list[_Piece] = []
    for piece in events:
        inner = [c for c in cuts if piece.start < c < piece.start + piece.length]
        bounds = [piece.start, *inner, piece.start + piece.length]
        for index, (a, b) in enumerate(zip(bounds, bounds[1:], strict=False)):
            result.append(
                _Piece(
                    a,
                    b - a,
                    piece.pitch,
                    piece.tie_in or (index > 0 and piece.pitch is not None),
                    piece.tie_out or (index < len(bounds) - 2 and piece.pitch is not None),
                    piece.attack,
                )
            )
    return result


def _pitch_xml(pitch: int, key: str) -> str:
    letter, alteration = _spell(pitch % 12, key)
    octave = (pitch - alteration) // 12 - 1
    alter = f"<alter>{alteration}</alter>" if alteration else ""
    return f"<pitch><step>{letter}</step>{alter}<octave>{octave}</octave></pitch>"


def _key_xml(key: str) -> str:
    mode = "minor" if key.endswith("m") else "major"
    return f"<key><fifths>{upstream.KEYS[key]}</fifths><mode>{mode}</mode></key>"


def _harmony_xml(name: str, offset: int) -> str:
    main, _, bass = name.partition("/")
    root, rest = main[0], main[1:]
    alteration = ""
    while rest[:1] in ("#", "b") and not rest.startswith("b5"):
        alteration += rest[0]
        rest = rest[1:]
    kind, text = _KINDS.get(rest, ("major", rest))
    parts = [f"<root><root-step>{root}</root-step>"]
    if _ALTER.get(alteration, 0):
        parts.append(f"<root-alter>{_ALTER[alteration]}</root-alter>")
    parts.append("</root>")
    parts.append(f'<kind text="{escape(text)}">{kind}</kind>')
    if rest == "7sus4":
        parts.append(
            "<degree><degree-value>7</degree-value><degree-alter>-1</degree-alter><degree-type>add</degree-type></degree>"
        )
    if bass:
        bass_alter = _ALTER.get(bass[1:], 0)
        parts.append(f"<bass><bass-step>{bass[0]}</bass-step>")
        if bass_alter:
            parts.append(f"<bass-alter>{bass_alter}</bass-alter>")
        parts.append("</bass>")
    if offset:
        parts.append(f"<offset>{offset}</offset>")
    return "<harmony>" + "".join(parts) + "</harmony>"


def _clef_xml(notes: Sequence[canonical.Note]) -> str:
    pitches = sorted(n.pitch for n in notes)
    low = bool(pitches) and pitches[len(pitches) // 2] < 57  # the middle note below A3: bass clef
    return "<clef><sign>F</sign><line>4</line></clef>" if low else "<clef><sign>G</sign><line>2</line></clef>"


def _syllabic(syllables: dict[int, lyric_layout.Syllable]) -> dict[int, str]:
    """``single``/``begin``/``middle``/``end`` of every syllable (by the onset of its note)."""
    result: dict[int, str] = {}
    word_open = False
    for onset in sorted(syllables):
        syllable = syllables[onset]
        if syllable.end_of_word:
            result[onset] = "end" if word_open else "single"
            word_open = False
        else:
            result[onset] = "middle" if word_open else "begin"
            word_open = True
    return result


def _part(
    score: canonical.Score,
    track: str,
    *,
    lead: bool,
    syllables: dict[int, lyric_layout.Syllable],
) -> list[str]:
    notes = score.track(track)
    per_quarter = score.units_per_quarter
    starts = ops._section_starts(score)
    section_at = {score.starts[s.measure]: s.label for s in starts if s in score.sections}
    chords = sorted(score.chords, key=lambda c: c.onset)
    syllabic = _syllabic(syllables) if lead else {}
    lines: list[str] = []
    previous_meter: tuple[int, int] | None = None
    for index, meter in enumerate(score.meters):
        start, end = score.starts[index], score.starts[index] + score.lengths[index]
        lines.append(f'<measure number="{index + 1}">')
        attributes = []
        if index == 0:
            attributes.append(f"<divisions>{per_quarter}</divisions>")
        key_changes = [k for k in score.keys if start <= k.onset < end and (k.onset > 0 or index == 0)]
        if index == 0:
            attributes.append(_key_xml(score.key_at(0)))
        elif key_changes and key_changes[0].onset == start and score.key_at(start) != score.key_at(start - 1):
            attributes.append(_key_xml(score.key_at(start)))
        if meter != previous_meter:
            attributes.append(f"<time><beats>{meter[0]}</beats><beat-type>{meter[1]}</beat-type></time>")
            previous_meter = meter
        if index == 0:
            attributes.append(_clef_xml(notes))
        if attributes:
            lines.append("<attributes>" + "".join(attributes) + "</attributes>")
        if lead and start in section_at:
            label = " ".join(word.capitalize() for word in section_at[start].split())
            lines.append(
                f'<direction placement="above"><direction-type><rehearsal>{escape(label)}</rehearsal>'
                "</direction-type></direction>"
            )
        if lead and index == 0:
            lines.append(
                '<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit>'
                f"<per-minute>{score.tempo}</per-minute></metronome></direction-type>"
                f'<sound tempo="{score.tempo}"/></direction>'
            )
        cuts = [k.onset for k in key_changes if start < k.onset]
        pieces = _pieces(notes, start, end, cuts)
        if all(p.pitch is None for p in pieces) and not (
            lead and any(start <= c.onset < end for c in chords)
        ):
            lines.append(
                f'<note><rest measure="yes"/><duration>{end - start}</duration><voice>1</voice></note>'
            )
            lines.append("</measure>")
            continue
        for piece in pieces:
            key = score.key_at(piece.start)
            if piece.start in cuts and piece.start != start:
                lines.append("<attributes>" + _key_xml(key) + "</attributes>")
            if lead:
                for chord in chords:
                    if piece.start <= chord.onset < piece.start + piece.length:
                        lines.append(_harmony_xml(chord.name, chord.onset - piece.start))
            values = _values(piece.length, per_quarter)
            for number, (units, kind, dots) in enumerate(values):
                first, last = number == 0, number == len(values) - 1
                tie_in = piece.pitch is not None and (piece.tie_in or not first)
                tie_out = piece.pitch is not None and (piece.tie_out or not last)
                body = [
                    _pitch_xml(piece.pitch, key) if piece.pitch is not None else "<rest/>",
                    f"<duration>{units}</duration>",
                ]
                if tie_in:
                    body.append('<tie type="stop"/>')
                if tie_out:
                    body.append('<tie type="start"/>')
                body.append("<voice>1</voice>")
                body.append(f"<type>{kind}</type>")
                body.extend(["<dot/>"] * dots)
                tied = [f'<tied type="{t}"/>' for t, on in (("stop", tie_in), ("start", tie_out)) if on]
                if tied:
                    body.append("<notations>" + "".join(tied) + "</notations>")
                attack = piece.attack
                if lead and first and not piece.tie_in and attack is not None and attack in syllables:
                    syllable = syllables[attack]
                    body.append(
                        f'<lyric number="1"><syllabic>{syllabic[attack]}</syllabic>'
                        f"<text>{escape(syllable.text)}</text></lyric>"
                    )
                lines.append("<note>" + "".join(body) + "</note>")
        lines.append("</measure>")
    return lines


def export_musicxml(score: canonical.Score, *, title: str = "", lyrics: str | None = None) -> str:
    """The score (and its lyrics, placed by ``lyric_layout``) as a MusicXML 4.0 partwise document."""
    syllables = lyric_layout.layout(score, lyrics).syllables() if lyrics and lyrics.strip() else {}
    today = _dt.date.today().isoformat()
    name = escape(title.strip()) or "Score"
    head = [
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
        '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" '
        '"http://www.musicxml.org/dtds/partwise.dtd">',
        '<score-partwise version="4.0">',
        f"<work><work-title>{name}</work-title></work>",
        "<identification><encoding><software>Plenio Music Production System</software>"
        f"<encoding-date>{today}</encoding-date></encoding></identification>",
        "<part-list>",
        '<score-part id="P1"><part-name>Vocal</part-name><part-abbreviation>Voc.</part-abbreviation></score-part>',
        '<score-part id="P2"><part-name>Instrument</part-name><part-abbreviation>Inst.</part-abbreviation></score-part>',
        "</part-list>",
    ]
    vocal = _part(score, "vocal", lead=True, syllables=syllables)
    ins = _part(score, "ins", lead=False, syllables={})
    body = ['<part id="P1">', *vocal, "</part>", '<part id="P2">', *ins, "</part>", "</score-partwise>"]
    return "\n".join(head + body) + "\n"
