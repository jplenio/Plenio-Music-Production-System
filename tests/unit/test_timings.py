"""Where a run's time went (``plenio.core.timings``): seconds per stage for the release record."""

from __future__ import annotations

from plenio.core.release import record_fingerprint
from plenio.core.timings import OUTSIDE, SCHEMA, stage_timings

GROUPS = {"1": "1 · Brief", "2": "2 · Write", "4": "3 · Render", "9": "5 · Export", "7": ""}


def stage_of(node_id: str) -> str:
    return GROUPS.get(node_id.split(":", 1)[0], "")


def test_the_time_between_two_starts_belongs_to_the_node_that_started_first() -> None:
    starts = [("1", 100.0), ("2", 100.5), ("4:501", 110.5), ("4:502", 140.5), ("9", 170.5)]
    found = stage_timings(starts, 174.0, stage_of, began=99.0)
    assert found == {
        "schema": SCHEMA,
        "total_seconds": 75.0,
        "stages": [
            {"stage": "1 · Brief", "seconds": 0.5},
            {"stage": "2 · Write", "seconds": 10.0},
            {"stage": "3 · Render", "seconds": 60.0},  # both nodes of the block, one stage
            {"stage": "5 · Export", "seconds": 3.5},
        ],
    }


def test_a_stage_reached_again_adds_to_its_entry_and_keeps_its_place() -> None:
    starts = [("2", 0.0), ("4", 5.0), ("2", 8.0), ("9", 9.0)]
    stages = stage_timings(starts, 10.0, stage_of)["stages"]  # type: ignore[index]
    assert stages == [
        {"stage": "2 · Write", "seconds": 6.0},
        {"stage": "3 · Render", "seconds": 3.0},
        {"stage": "5 · Export", "seconds": 1.0},
    ]


def test_loading_is_part_of_its_stage_and_never_more_than_it() -> None:
    starts = [("2", 0.0), ("4:501", 10.0), ("4:502", 30.0)]
    found = stage_timings(starts, 50.0, stage_of, loads={"4:501": 6.25, "4:502": 1.0, "2": 99.0, "8": 3.0})
    assert found is not None
    assert found["stages"] == [
        {"stage": "2 · Write", "seconds": 10.0, "load_seconds": 10.0},
        {"stage": "3 · Render", "seconds": 40.0, "load_seconds": 7.25},
    ]
    assert found["total_seconds"] == 50.0  # without the queue's time: from the first start


def test_a_node_in_no_group_has_a_stage_of_its_own_and_the_peak_is_kept() -> None:
    found = stage_timings([("7", 1.0)], 2.5, stage_of, peak_vram_gib=13.826)
    assert found is not None
    assert found["stages"] == [{"stage": OUTSIDE, "seconds": 1.5}] and found["peak_vram_gib"] == 13.83
    assert "peak_vram_gib" not in (stage_timings([("7", 1.0)], 2.5, stage_of, peak_vram_gib=0.0) or {})


def test_nothing_noted_gives_no_timings() -> None:
    assert stage_timings([], 10.0, stage_of) is None
    assert stage_timings([("1", 20.0)], 10.0, stage_of) is None  # a start after now: another run's


def test_the_timings_are_not_part_of_the_records_fingerprint() -> None:
    record = {"schema": "plenio.release/1", "title": "A"}
    timed = {**record, "timings": {"schema": SCHEMA, "total_seconds": 1.0, "stages": []}}
    assert record_fingerprint(record) == record_fingerprint(timed)
