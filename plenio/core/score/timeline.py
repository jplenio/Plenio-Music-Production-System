"""The time grid of a transcribed score (schema ``plenio.timeline/1``).

SheetSage2 writes one ``Q:`` tempo into its ABC but quantises the notes to the
real beat grid, so a constant-tempo reading of the score misplaces bars by up
to two seconds (Phase 4A E1). Transcribe Score therefore keeps the decoded
beat grid: the start and end of every bar in source seconds, plus where the
transcription found vocal notes. Lyrics alignment and ASR use it; it belongs
to the transcription it came from (``score_sha256``).
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from ..errors import PlenioValidationError
from ..hashing import sha256_json

TIMELINE_SCHEMA = "plenio.timeline/1"


@dataclass(frozen=True)
class TimelineBar:
    start_s: float
    end_s: float
    meter: str

    def to_list(self) -> list[Any]:
        return [round(self.start_s, 3), round(self.end_s, 3), self.meter]


@dataclass(frozen=True)
class Timeline:
    source_sha256: str
    score_sha256: str
    duration_s: float
    bars: tuple[TimelineBar, ...]
    first_beat_s: float = 0.0
    pickup_padded: bool = False
    tempo_bpm: float | None = None
    median_bpm: float | None = None
    sections: tuple[tuple[str, int, int], ...] = ()
    vocal_notes: tuple[tuple[float, float], ...] = ()
    """Sounding vocal notes as (onset, end) in source seconds."""
    engine: str = "sheetsage2"
    extra: Mapping[str, Any] = field(default_factory=dict)

    @property
    def bar_starts(self) -> list[float]:
        return [bar.start_s for bar in self.bars]

    def bar_at(self, time_s: float) -> int:
        """0-based index of the bar that contains ``time_s`` (clamped to the first and last bar)."""
        starts = self.bar_starts
        index = 0
        low, high = 0, len(starts)
        while low < high:  # last start <= time_s
            middle = (low + high) // 2
            if starts[middle] <= time_s:
                index, low = middle, middle + 1
            else:
                high = middle
        return max(0, min(index, len(starts) - 1))

    def vocal_regions(
        self, *, merge_gap_s: float = 2.0, margin_s: float = 1.0, min_s: float = 0.5
    ) -> list[tuple[float, float]]:
        """Where somebody sings: merged vocal-note intervals with a margin, clamped to the audio."""
        return merge_intervals(
            self.vocal_notes, self.duration_s, merge_gap_s=merge_gap_s, margin_s=margin_s, min_s=min_s
        )

    def vocal_seconds(self) -> float:
        return sum(end - start for start, end in self.vocal_notes)

    def vocal_notes_near(self, time_s: float, window_s: float) -> int:
        return sum(1 for start, end in self.vocal_notes if start - window_s <= time_s <= end + window_s)

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": TIMELINE_SCHEMA,
            "engine": self.engine,
            "source_sha256": self.source_sha256,
            "score_sha256": self.score_sha256,
            "duration_s": round(self.duration_s, 3),
            "first_beat_s": round(self.first_beat_s, 3),
            "pickup_padded": self.pickup_padded,
            "tempo_bpm": self.tempo_bpm,
            "median_bpm": round(self.median_bpm, 2) if self.median_bpm is not None else None,
            "bars": [bar.to_list() for bar in self.bars],
            "sections": [list(section) for section in self.sections],
            "vocal_notes": [[round(a, 3), round(b, 3)] for a, b in self.vocal_notes],
            **({"extra": dict(self.extra)} if self.extra else {}),
        }

    @property
    def sha256(self) -> str:
        return sha256_json(self.to_dict())


def merge_intervals(
    intervals: Iterable[Sequence[float]],
    duration_s: float,
    *,
    merge_gap_s: float = 2.0,
    margin_s: float = 1.0,
    min_s: float = 0.5,
) -> list[tuple[float, float]]:
    """Merge intervals closer than ``merge_gap_s``, drop spans shorter than ``min_s``, add ``margin_s``."""
    spans: list[list[float]] = []
    for start, end in sorted((float(a), float(b)) for a, b, *_ in intervals):
        if end <= start:
            continue
        if spans and start - spans[-1][1] <= merge_gap_s:
            spans[-1][1] = max(spans[-1][1], end)
        else:
            spans.append([start, end])
    result: list[tuple[float, float]] = []
    for start, end in spans:
        if end - start < min_s:
            continue
        low, high = max(0.0, start - margin_s), min(duration_s, end + margin_s)
        if result and low <= result[-1][1]:
            result[-1] = (result[-1][0], high)
        else:
            result.append((low, high))
    return result


def timeline_from_dict(data: Mapping[str, Any]) -> Timeline:
    if data.get("schema") != TIMELINE_SCHEMA:
        raise PlenioValidationError(f"Unsupported timeline schema {data.get('schema')!r}.")
    try:
        bars = tuple(TimelineBar(float(a), float(b), str(m)) for a, b, m in data["bars"])
        return Timeline(
            source_sha256=str(data["source_sha256"]),
            score_sha256=str(data["score_sha256"]),
            duration_s=float(data["duration_s"]),
            bars=bars,
            first_beat_s=float(data.get("first_beat_s", 0.0)),
            pickup_padded=bool(data.get("pickup_padded", False)),
            tempo_bpm=data.get("tempo_bpm"),
            median_bpm=data.get("median_bpm"),
            sections=tuple((str(s[0]), int(s[1]), int(s[2])) for s in data.get("sections", [])),
            vocal_notes=tuple((float(a), float(b)) for a, b in data.get("vocal_notes", [])),
            engine=str(data.get("engine", "sheetsage2")),
            extra=dict(data.get("extra", {})),
        )
    except (KeyError, TypeError, ValueError) as error:
        raise PlenioValidationError(f"The timeline is malformed: {error!r}.") from error


def matches_score(timeline: Timeline, bar_meters: Sequence[str]) -> bool:
    """True when a score has the timeline's bar structure (same bar count and meters)."""
    return len(bar_meters) == len(timeline.bars) and all(
        meter == bar.meter for meter, bar in zip(bar_meters, timeline.bars, strict=True)
    )
