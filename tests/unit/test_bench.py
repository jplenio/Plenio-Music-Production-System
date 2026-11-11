"""The benchmark tool (``tools/bench.py``): ordering, waiting, reading the record's timings, the report and the
comparison - against canned answers in the Song API's shapes. Real numbers come from a ComfyUI with models."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import bench


def run(stages: list[tuple[str, float, float]], total: float, peak: float = 0.0) -> dict[str, Any]:
    timings: dict[str, Any] = {
        "schema": "plenio.timings/1",
        "total_seconds": total,
        "stages": [
            {"stage": s, "seconds": t, **({"load_seconds": load} if load else {})} for s, t, load in stages
        ],
    }
    if peak:
        timings["peak_vram_gib"] = peak
    return {"status": "succeeded", "seconds": total, "timings": timings}


def test_every_brief_is_a_request_the_api_takes_with_fixed_seeds() -> None:
    assert list(bench.BRIEFS) == ["instrumental-60", "sung-90", "sung-180-hq-cover", "cover"]
    for name, brief in bench.BRIEFS.items():
        request = bench.request_of(brief, "recording.flac")
        assert request["template"] in ("yue2-song", "yue2-cover") and request["seeds"] == bench.SEEDS, name
        assert request["release"]["folder"] == "plenio/bench"
        assert ("source.audio" in request["fields"]) == bool(brief.get("needs_source"))
    assert bench.BRIEFS["sung-180-hq-cover"]["fields"]["finish.hq_mastering"] is True


def test_a_run_orders_waits_and_reads_the_records_timings() -> None:
    api = bench.FakeApi()
    said: list[str] = []
    found = bench.run_once(
        api, bench.BRIEFS["sung-180-hq-cover"], None, say=said.append, sleep=lambda s: None
    )
    assert found["status"] == "succeeded" and found["song_seconds"] == 61.0
    assert [s["stage"] for s in found["timings"]["stages"]][-1] == "5 · Cover Art"
    assert any("succeeded" in line for line in said)


def test_a_failed_job_and_a_record_without_timings_are_said() -> None:
    class Failing(bench.FakeApi):
        def call(self, method: str, path: str, body: Any = None, headers: Any = None) -> Any:
            if method == "GET" and path.startswith("/jobs/"):
                return {"id": "x", "status": "failed", "error": {"title": "The model file is missing"}}
            return super().call(method, path, body, headers)

    failed = bench.run_once(Failing(), bench.BRIEFS["sung-90"], None, sleep=lambda s: None)
    assert (
        failed["status"] == "failed"
        and failed["error"] == "The model file is missing"
        and "timings" not in failed
    )

    class Old(bench.FakeApi):
        def file(self, job_id: str, name: str) -> bytes:
            return json.dumps({"schema": "plenio.record/1", "audio": {"seconds": 60}}).encode()

    old = bench.run_once(Old(), bench.BRIEFS["sung-90"], None, sleep=lambda s: None)
    assert old["timings"] is None and "before 2.0" in old["error"]
    assert bench.summary([failed, old]) == {"runs": 2, "succeeded": 0}


def test_the_summary_is_the_median_with_the_first_run_apart() -> None:
    runs = [
        run([("2 · Write", 30.0, 12.0), ("3 · Render", 60.0, 9.0)], 95.0, 13.5),
        run([("2 · Write", 18.0, 0.0), ("3 · Render", 50.0, 0.0)], 70.0, 13.8),
        run([("2 · Write", 20.0, 0.0), ("3 · Render", 52.0, 0.0), ("4 · Master", 4.0, 0.0)], 78.0, 13.1),
        {"status": "failed", "seconds": 3.0, "error": "cancelled"},
    ]
    found = bench.summary(runs)
    assert (found["runs"], found["succeeded"]) == (4, 3)
    assert (found["total_seconds"], found["first_run_seconds"], found["fastest_seconds"]) == (
        78.0,
        95.0,
        70.0,
    )
    assert found["peak_vram_gib"] == 13.8
    assert found["stages"] == [
        {"stage": "2 · Write", "seconds": 20.0, "load_seconds": 0.0},
        {"stage": "3 · Render", "seconds": 52.0, "load_seconds": 0.0},
        {"stage": "4 · Master", "seconds": 4.0, "load_seconds": 0.0},
    ]


def test_a_brief_slower_than_before_by_more_than_the_tolerance_is_marked() -> None:
    def report(**totals: float) -> dict[str, Any]:
        return {"briefs": {name: {"summary": {"total_seconds": total}} for name, total in totals.items()}}

    rows = bench.compare(report(a=100.0, b=120.0, c=50.0, new=9.0), report(a=100.0, b=100.0, c=60.0), 0.10)
    assert [(r["brief"], r["change_percent"], r["slower"]) for r in rows] == [
        ("a", 0.0, False),
        ("b", 20.0, True),
        ("c", -16.7, False),
    ]
    assert bench.compare(report(b=109.9), report(b=100.0), 0.10)[0]["slower"] is False


def test_the_whole_tool_runs_against_canned_answers(tmp_path: Path, capsys: Any) -> None:
    older = tmp_path / "bench-older.json"
    assert bench.main(["--fake", "--runs", "2", "--label", "older", "--out", str(tmp_path)]) == 0
    assert older.is_file()
    report = json.loads(older.read_text(encoding="utf-8"))
    assert report["schema"] == "plenio.bench/1" and report["seeds"] == bench.SEEDS and report["runs"] == 2
    assert list(report["briefs"]) == [
        "instrumental-60",
        "sung-90",
        "sung-180-hq-cover",
    ]  # no --source: no cover
    assert all(b["summary"]["succeeded"] == 2 for b in report["briefs"].values())
    table = tmp_path / "bench.md"
    code = bench.main(
        ["--fake", "--runs", "1", "--briefs", "sung-90", "--compare", str(older), "--report", str(table)]
    )
    text = table.read_text(encoding="utf-8")
    assert (
        code == 0 and "## Against bench-older" in text and "| `sung-90` | 54.1 s | 54.1 s | +0.0 % |" in text
    )
    assert "| 2 · Write | 20.0 s | 8.0 s |" in text
    out = capsys.readouterr().out
    assert "skipped (give a recording with --source)" in out


def test_a_cover_is_benched_with_the_recording_uploaded(tmp_path: Path) -> None:
    recording = tmp_path / "source.flac"
    recording.write_bytes(b"fLaC")
    api = bench.FakeApi()
    report = bench.bench(api, ["cover"], 1, source=recording, sleep=lambda s: None)
    assert report["briefs"]["cover"]["summary"]["succeeded"] == 1
    assert next(iter(api.jobs.values()))["fields"]["source.audio"] == "source.flac"
