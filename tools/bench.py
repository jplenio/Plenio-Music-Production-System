"""The benchmark: fixed briefs through the Song API, where the time went per stage.

    python tools/bench.py --api http://127.0.0.1:8188 --label 1.6.0 --card "RTX 5060 Ti 16 GB"
    python tools/bench.py --api ... --briefs instrumental-60,sung-90 --runs 1      # a part of it
    python tools/bench.py --api ... --source recording.flac                        # also the cover brief
    python tools/bench.py --fake                                                   # the tool itself, no ComfyUI

It orders each brief ``--runs`` times (three by default) with fixed seeds, waits for the job, reads the song's
release record through the API and takes its ``timings`` (``plenio.timings/1``: seconds per group of the template,
the part spent loading models, the peak memory on the graphics card). The first run of a brief after another brief
loads models; the later ones show the warm case - the report gives every run and the median.

It writes ``docs/test-reports/data/bench-<label>.json`` and prints a Markdown table (``--report <file>`` saves
it). Two reports are compared with ``--compare <older.json>``: a brief slower by more than ``--tolerance`` (10 %)
is marked and the tool exits with 1 - the release check "no brief is slower than before".

``--fake`` runs the whole tool against an API made of canned answers: it checks ordering, waiting, reading and
the report without ComfyUI (the CI's check of the tool; its numbers mean nothing).

Standard library only. The songs it makes go to ``output/plenio/bench`` of the ComfyUI it talks to.
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from typing import Any

SCHEMA = "plenio.bench/1"
FINISHED = ("succeeded", "failed", "cancelled")
SEEDS = {"draft": 1101, "plan": 1102, "arrangement": 1103, "take": 1104, "cover": 1105}
"""The same seeds for every run: the same song is written and rendered, so runs differ only in time."""
RELEASE = {"folder": "plenio/bench", "album": "Plenio bench", "artist": "Plenio bench"}

BRIEFS: Mapping[str, Mapping[str, Any]] = {
    "instrumental-60": {
        "what": "an instrumental of about a minute, no cover art",
        "template": "yue2-song",
        "fields": {
            "description": "A calm lo-fi piano piece with soft vinyl crackle, brushed drums and a warm upright bass.",
            "genre": "lo-fi",
            "vocals": "instrumental",
            "length": "very short (about 1:00)",
            "finish.hq_mastering": False,
            "finish.cover_art": False,
        },
    },
    "sung-90": {
        "what": "a sung song of about 1:30, no cover art",
        "template": "yue2-song",
        "fields": {
            "description": "An upbeat synthwave song about a night drive along the coast, with a bright sung chorus.",
            "genre": "synthwave",
            "vocals": "sung",
            "language": "English",
            "length": "short (about 1:30)",
            "finish.hq_mastering": False,
            "finish.cover_art": False,
        },
    },
    "sung-180-hq-cover": {
        "what": "a sung song of about 3:00 with HQ mastering and cover art",
        "template": "yue2-song",
        "fields": {
            "description": "A warm folk-pop song about coming home after a long journey, acoustic guitar and piano.",
            "genre": "folk pop",
            "vocals": "sung",
            "language": "English",
            "length": "standard (about 3:00)",
            "finish.hq_mastering": True,
            "finish.cover_art": True,
        },
    },
    "cover": {
        "what": "a cover of the recording given with --source, original lyrics, no cover art",
        "template": "yue2-cover",
        "needs_source": True,
        "fields": {
            "description": "A gentle acoustic version with fingerpicked guitar and a soft, close voice.",
            "genre": "acoustic",
            "vocals": "original lyrics",
            "finish.hq_mastering": False,
            "finish.cover_art": False,
        },
    },
}
"""The yardstick's briefs. Changing one makes old and new reports incomparable: add a brief instead."""


class ApiError(RuntimeError):
    pass


class Api:
    """The Song API of a running ComfyUI (``/plenio/api/v1``)."""

    def __init__(self, base: str, timeout: float = 120.0) -> None:
        self.base = base.rstrip("/")
        if not self.base.endswith("/plenio/api/v1"):
            self.base += "/plenio/api/v1"
        self.timeout = timeout

    def _open(self, method: str, path: str, data: bytes | None, headers: Mapping[str, str]) -> bytes:
        request = urllib.request.Request(self.base + path, data=data, method=method, headers=dict(headers))  # noqa: S310
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as answer:  # noqa: S310 - the address given
                return bytes(answer.read())
        except urllib.error.HTTPError as error:
            try:
                problem = json.load(error).get("error", {})
            except ValueError:
                problem = {}
            raise ApiError(
                f"{method} {path}: {error.code} {problem.get('message', '')} {problem.get('hint', '')}".strip()
            ) from None
        except (urllib.error.URLError, TimeoutError) as error:
            raise ApiError(f"ComfyUI does not answer at {self.base}: {error}") from None

    def call(self, method: str, path: str, body: Any = None, headers: Mapping[str, str] | None = None) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        raw = self._open(method, path, data, {"Content-Type": "application/json", **(headers or {})})
        return json.loads(raw)

    def upload(self, path: Path) -> str:
        raw = self._open(
            "POST",
            f"/uploads?name={urllib.parse.quote(path.name)}",
            path.read_bytes(),
            {"Content-Type": "application/octet-stream"},
        )
        return str(json.loads(raw)["name"])

    def file(self, job_id: str, name: str) -> bytes:
        return self._open("GET", f"/jobs/{job_id}/files/{urllib.parse.quote(name)}", None, {})


class FakeApi:
    """Canned answers in the API's shapes, for ``--fake``: every job succeeds at once with a record whose timings
    are made up from the brief's fields (so the report has stages to show)."""

    def __init__(self) -> None:
        self.jobs: dict[str, dict[str, Any]] = {}

    def call(self, method: str, path: str, body: Any = None, headers: Mapping[str, str] | None = None) -> Any:
        if method == "GET" and path == "/":
            return {"api": "plenio-song-api", "version": "fake", "plenio": "fake", "comfyui": "fake"}
        if method == "POST" and path == "/jobs":
            job_id = uuid.uuid4().hex
            self.jobs[job_id] = dict(body)
            return {"id": job_id, "status": "queued", "seeds": dict(body.get("seeds") or {})}
        if method == "GET" and path.startswith("/jobs/"):
            job_id = path.split("/")[2].split("?")[0]
            name = f"bench-{job_id[:6]}"
            files = [
                {"name": f"{name}.flac", "role": "song"},
                {"name": f"{name}.plenio.json", "role": "record"},
            ]
            return {"id": job_id, "status": "succeeded", "result": {"files": files}}
        raise ApiError(f"the fake API has no {method} {path}")

    def upload(self, path: Path) -> str:
        return path.name

    def file(self, job_id: str, name: str) -> bytes:
        fields = self.jobs[job_id].get("fields") or {}
        stages = [
            {"stage": "1 · Brief", "seconds": 0.1},
            {"stage": "2 · Write", "seconds": 20.0, "load_seconds": 8.0},
            {"stage": "3 · Render", "seconds": 60.0 if "3:00" in str(fields.get("length")) else 30.0},
            {"stage": "4 · Master", "seconds": 12.0 if fields.get("finish.hq_mastering") else 3.0},
        ]
        if fields.get("finish.cover_art"):
            stages.append({"stage": "5 · Cover Art", "seconds": 18.0, "load_seconds": 11.0})
        total = round(sum(s["seconds"] for s in stages) + 1.0, 3)
        timings = {
            "schema": "plenio.timings/1",
            "total_seconds": total,
            "stages": stages,
            "peak_vram_gib": 12.5,
        }
        return json.dumps(
            {"schema": "plenio.record/1", "timings": timings, "audio": {"seconds": 61.0}}
        ).encode()


# --- one run ------------------------------------------------------------------------------------------------------


def request_of(brief: Mapping[str, Any], source: str | None) -> dict[str, Any]:
    fields = dict(brief["fields"])
    if brief.get("needs_source"):
        fields["source.audio"] = source
    return {
        "template": brief["template"],
        "fields": fields,
        "seeds": dict(SEEDS),
        "release": dict(RELEASE),
        "client": {"name": "plenio bench"},
    }


def run_once(
    api: Any,
    brief: Mapping[str, Any],
    source: str | None,
    *,
    wait: float = 3600.0,
    say: Callable[[str], None] = lambda text: None,
    sleep: Callable[[float], None] = time.sleep,
) -> dict[str, Any]:
    """Order one song, wait for it and read where its time went: ``{"status", "seconds", "timings", ...}``.
    ``seconds`` is the time this tool waited (queue included); the stages come from the song's record."""
    began = time.monotonic()
    job = api.call("POST", "/jobs", request_of(brief, source), {"Idempotency-Key": uuid.uuid4().hex})
    job_id = str(job["id"])
    view: dict[str, Any] = job
    while view.get("status") not in FINISHED:
        if time.monotonic() - began > wait:
            return {"status": "timeout", "seconds": round(time.monotonic() - began, 1), "job": job_id}
        view = api.call("GET", f"/jobs/{job_id}?wait=30")
        stage = (view.get("stage") or {}).get("group") or ""
        say(f"    {view.get('status')}{' - ' + stage if stage else ''}")
        if view.get("status") not in FINISHED:
            sleep(0.2)
    out: dict[str, Any] = {
        "status": str(view.get("status")),
        "seconds": round(time.monotonic() - began, 1),
        "job": job_id,
    }
    if view.get("status") != "succeeded":
        out["error"] = str(
            (view.get("error") or {}).get("title") or (view.get("error") or {}).get("message") or ""
        )
        return out
    files = (view.get("result") or {}).get("files") or []
    record_name = next((str(f["name"]) for f in files if f.get("role") == "record"), None)
    if record_name is None:
        out["error"] = "the job's result names no record"
        return out
    record = json.loads(api.file(job_id, record_name))
    out["timings"] = record.get("timings")
    out["song_seconds"] = (record.get("audio") or {}).get("seconds")
    if out["timings"] is None:
        out["error"] = "the record has no timings (a Plenio before 2.0)"
    return out


# --- the report ---------------------------------------------------------------------------------------------------


def summary(runs: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """The medians of a brief's runs: the total, every stage and its loading, the peak memory - and the first run
    apart (it loads what the runs after it find loaded)."""
    timed = [r for r in runs if isinstance(r.get("timings"), Mapping)]
    if not timed:
        return {"runs": len(runs), "succeeded": 0}
    totals = [float(r["timings"]["total_seconds"]) for r in timed]
    names: list[str] = []
    for run in timed:
        names += [s["stage"] for s in run["timings"]["stages"] if s["stage"] not in names]
    stages = []
    for name in names:
        spent = [float(s["seconds"]) for r in timed for s in r["timings"]["stages"] if s["stage"] == name]
        loads = [
            float(s.get("load_seconds", 0.0))
            for r in timed
            for s in r["timings"]["stages"]
            if s["stage"] == name
        ]
        stages.append(
            {
                "stage": name,
                "seconds": round(statistics.median(spent), 2),
                "load_seconds": round(statistics.median(loads), 2),
            }
        )
    peaks = [float(r["timings"]["peak_vram_gib"]) for r in timed if r["timings"].get("peak_vram_gib")]
    return {
        "runs": len(runs),
        "succeeded": len(timed),
        "total_seconds": round(statistics.median(totals), 2),
        "first_run_seconds": round(totals[0], 2),
        "fastest_seconds": round(min(totals), 2),
        "stages": stages,
        **({"peak_vram_gib": round(max(peaks), 2)} if peaks else {}),
    }


def compare(new: Mapping[str, Any], old: Mapping[str, Any], tolerance: float) -> list[dict[str, Any]]:
    """Per brief both reports have: the medians, the change in percent, and whether the new one is slower by more
    than ``tolerance`` (0.1 = 10 %)."""
    rows = []
    for name, brief in new.get("briefs", {}).items():
        before = (old.get("briefs", {}).get(name) or {}).get("summary") or {}
        after = brief.get("summary") or {}
        if "total_seconds" not in before or "total_seconds" not in after:
            continue
        was, now = float(before["total_seconds"]), float(after["total_seconds"])
        change = (now - was) / was if was else 0.0
        rows.append(
            {
                "brief": name,
                "before": was,
                "after": now,
                "change_percent": round(change * 100, 1),
                "slower": change > tolerance,
            }
        )
    return rows


def markdown(report: Mapping[str, Any], compared: Sequence[Mapping[str, Any]] = (), against: str = "") -> str:
    lines = [
        f"# Benchmark {report['label']}",
        "",
        f"Plenio {report.get('plenio', '?')} in ComfyUI {report.get('comfyui', '?')} on "
        f"{report.get('card') or 'an unnamed machine'}, {report['runs']} run(s) "
        f"per brief, {report['date']}. Seconds from the release record's `timings`; the median of the runs, the "
        "first run apart (it loads what the later ones find loaded). *load* is the part of a stage spent loading "
        "models.",
        "",
        "| Brief | Runs | Median | First run | Fastest | Peak VRAM |",
        "|---|---|---|---|---|---|",
    ]
    for name, brief in report["briefs"].items():
        s = brief["summary"]
        if not s.get("succeeded"):
            errors = sorted({str(r.get("error") or r.get("status")) for r in brief["runs"]})
            lines.append(f"| `{name}` | 0 of {s['runs']} | - | - | - | - | {'; '.join(errors)} |")
            continue
        peak = f"{s['peak_vram_gib']:.1f} GiB" if "peak_vram_gib" in s else "-"
        lines.append(
            f"| `{name}` | {s['succeeded']} of {s['runs']} | {s['total_seconds']:.1f} s | "
            f"{s['first_run_seconds']:.1f} s | {s['fastest_seconds']:.1f} s | {peak} |"
        )
    for name, brief in report["briefs"].items():
        s = brief["summary"]
        if not s.get("succeeded"):
            continue
        lines += [
            "",
            f"## `{name}` - {brief['what']}",
            "",
            "| Stage | Median | of it load |",
            "|---|---|---|",
        ]
        for stage in s["stages"]:
            load = f"{stage['load_seconds']:.1f} s" if stage["load_seconds"] else "-"
            lines.append(f"| {stage['stage']} | {stage['seconds']:.1f} s | {load} |")
    if compared:
        lines += [
            "",
            f"## Against {against}",
            "",
            "| Brief | Before | Now | Change | |",
            "|---|---|---|---|---|",
        ]
        for row in compared:
            mark = "**slower**" if row["slower"] else ""
            lines.append(
                f"| `{row['brief']}` | {row['before']:.1f} s | {row['after']:.1f} s | {row['change_percent']:+.1f} % | {mark} |"
            )
    return "\n".join(lines) + "\n"


def bench(
    api: Any,
    names: Sequence[str],
    runs: int,
    *,
    source: Path | None = None,
    label: str = "",
    card: str = "",
    say: Callable[[str], None] = lambda text: None,
    sleep: Callable[[float], None] = time.sleep,
) -> dict[str, Any]:
    about = api.call("GET", "/")
    uploaded = api.upload(source) if source is not None else None
    report: dict[str, Any] = {
        "schema": SCHEMA,
        "label": label or str(about.get("plenio") or "unnamed"),
        "plenio": about.get("plenio"),
        "api": about.get("version"),
        "comfyui": about.get("comfyui"),
        "card": card,
        "date": time.strftime("%Y-%m-%d"),
        "runs": runs,
        "seeds": dict(SEEDS),
        "briefs": {},
    }
    for name in names:
        brief = BRIEFS[name]
        if brief.get("needs_source") and uploaded is None:
            say(f"{name}: skipped (give a recording with --source)")
            continue
        say(f"{name}: {brief['what']}")
        results = []
        for index in range(runs):
            say(f"  run {index + 1} of {runs}")
            results.append(run_once(api, brief, uploaded, say=say, sleep=sleep))
            say(f"  -> {results[-1]['status']} in {results[-1]['seconds']} s")
        report["briefs"][name] = {"what": brief["what"], "runs": results, "summary": summary(results)}
    return report


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--api", default="http://127.0.0.1:8188", help="the ComfyUI that makes the songs")
    parser.add_argument(
        "--fake", action="store_true", help="canned answers instead of a ComfyUI (checks the tool)"
    )
    parser.add_argument(
        "--briefs", default="", help=f"comma-separated, of: {', '.join(BRIEFS)} (default: all)"
    )
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--source", type=Path, help="a recording for the cover brief")
    parser.add_argument("--label", default="", help="the report's name, e.g. the version (default: Plenio's)")
    parser.add_argument("--card", default="", help="the graphics card, for the report's text")
    parser.add_argument("--out", type=Path, help="where the JSON goes (default: docs/test-reports/data)")
    parser.add_argument("--report", type=Path, help="also save the Markdown table there")
    parser.add_argument("--compare", type=Path, help="an older report's JSON to compare with")
    parser.add_argument(
        "--tolerance", type=float, default=0.10, help="slower by more than this fails (0.10 = 10 %%)"
    )
    args = parser.parse_args(argv)
    names = [n.strip() for n in args.briefs.split(",") if n.strip()] or list(BRIEFS)
    unknown = [n for n in names if n not in BRIEFS]
    if unknown or args.runs < 1:
        parser.error(f"unknown briefs: {', '.join(unknown)}" if unknown else "--runs is at least 1")
    api: Any = FakeApi() if args.fake else Api(args.api)
    try:
        report = bench(
            api,
            names,
            args.runs,
            source=args.source,
            label=args.label or ("fake" if args.fake else ""),
            card=args.card,
            say=lambda text: print(text, flush=True),
            sleep=(lambda seconds: None) if args.fake else time.sleep,
        )
    except ApiError as error:
        print(error, file=sys.stderr)
        return 2
    compared: list[dict[str, Any]] = []
    if args.compare is not None:
        compared = compare(report, json.loads(args.compare.read_text(encoding="utf-8")), args.tolerance)
    text = markdown(report, compared, args.compare.stem if args.compare else "")
    print(text)
    if not args.fake or args.out is not None:
        folder = args.out or Path(__file__).resolve().parents[1] / "docs" / "test-reports" / "data"
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / f"bench-{report['label']}.json"
        target.write_bytes((json.dumps(report, indent=1, ensure_ascii=False) + "\n").encode("utf-8"))
        print(f"written: {target}")
    if args.report is not None:
        args.report.write_bytes(text.encode("utf-8"))
    failed = [n for n, b in report["briefs"].items() if not b["summary"].get("succeeded")]
    return 1 if failed or any(row["slower"] for row in compared) else 0


if __name__ == "__main__":
    sys.exit(main())
