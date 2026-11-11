"""Golden answers of the Song API v1 (phase 5.1): a fixed series of requests to every endpoint, each answer kept
with its status and the headers a program reads, its volatile parts masked - ids, times, seeds, versions, the
server's folders.

The answers were recorded from Plenio 1.6.0 (``c307d35``) on the pinned ComfyUI with model files of the catalogue's
names that are empty (a run gets past ComfyUI's validation and fails at its first loader). The host test
``tests/host/test_api_v1_golden.py`` replays the series against the code as it is and allows only the differences
``DELTAS`` names, each with its reason.

    python tools/api_v1_golden.py --url http://127.0.0.1:8195 --record tests/fixtures/api-v1
    python tools/api_v1_golden.py --url http://127.0.0.1:8195 --compare tests/fixtures/api-v1
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

BASE = "/plenio/api/v1"
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
VOLATILE_NUMBERS = {
    "created_at",
    "started_at",
    "finished_at",
    "queue_position",
    "seconds",
    "timestamp",
    "size",
}
VERSIONS = {"plenio", "comfyui", "frontend"}
SONG_FIELDS = {
    "genre": "lo-fi hip hop",
    "description": "a calm beat for the golden answers",
    "length": "very short (about 1:00)",
    "vocals": "instrumental",
    "finish.cover_art": False,
}


@dataclass
class Answer:
    status: int
    body: Any
    headers: dict[str, str] = field(default_factory=dict)


def call(url: str, method: str, path: str, body: Any = None, headers: dict[str, str] | None = None) -> Answer:
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url + path, data=data, method=method)
    if data is not None:
        request.add_header("Content-Type", "application/json")
    for name, value in (headers or {}).items():
        request.add_header(name, value)
    try:
        with urllib.request.urlopen(request, timeout=120) as response:  # noqa: S310 - a local test server
            raw, status, got = response.read(), response.status, response.headers
    except urllib.error.HTTPError as error:
        raw, status, got = error.read(), error.code, error.headers
    try:
        parsed = json.loads(raw) if raw else None
    except ValueError:
        parsed = {"<not json>": len(raw)}
    kept = {name: got[name] for name in ("Location", "Content-Type") if got.get(name)}
    if "Content-Type" in kept:
        kept["Content-Type"] = kept["Content-Type"].split(";")[0]
    return Answer(status, parsed, kept)


def finished(url: str, job_id: str, timeout: float = 180.0) -> Answer:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        answer = call(url, "GET", f"{BASE}/jobs/{job_id}")
        if answer.status != 200 or answer.body.get("status") in ("succeeded", "failed", "cancelled"):
            return answer
        time.sleep(0.5)
    raise TimeoutError(job_id)


def openapi_shape(document: Any) -> Any:
    """The OpenAPI document as its paths and methods (the schemas change with every template field)."""
    if not isinstance(document, dict):
        return document
    return {
        "openapi": document.get("openapi"),
        "paths": {path: sorted(item) for path, item in sorted((document.get("paths") or {}).items())},
    }


def series(url: str) -> Iterator[tuple[str, Answer]]:
    """The requests, in order: (case name, answer). Jobs are created by the series itself."""
    yield "index", call(url, "GET", BASE)
    yield "templates", call(url, "GET", f"{BASE}/templates")
    yield "template_song", call(url, "GET", f"{BASE}/templates/yue2-song")
    yield "template_cover", call(url, "GET", f"{BASE}/templates/yue2-cover")
    yield "template_unknown", call(url, "GET", f"{BASE}/templates/no-such-template")
    yield "briefs_song", call(url, "GET", f"{BASE}/briefs?kind=song")
    yield "briefs_bad_kind", call(url, "GET", f"{BASE}/briefs?kind=opera")
    doc = call(url, "GET", f"{BASE}/openapi.json")
    yield "openapi", Answer(doc.status, openapi_shape(doc.body), doc.headers)
    yield "models", call(url, "GET", f"{BASE}/models")
    yield "queue", call(url, "GET", f"{BASE}/queue")
    request = {"template": "yue2-song", "fields": SONG_FIELDS, "client": {"name": "golden"}}
    created = call(url, "POST", f"{BASE}/jobs", request, {"Idempotency-Key": "golden-answers-1"})
    yield "job_create", created
    yield (
        "job_create_again",
        call(url, "POST", f"{BASE}/jobs", request, {"Idempotency-Key": "golden-answers-1"}),
    )
    job_id = str((created.body or {}).get("id", ""))
    yield "job_failed", finished(url, job_id)
    listed = call(url, "GET", f"{BASE}/jobs")
    if isinstance(listed.body, dict):
        listed.body["jobs"] = [j for j in listed.body.get("jobs", []) if j.get("id") == job_id]
    yield "jobs_list", listed
    yield "job_file_of_failed", call(url, "GET", f"{BASE}/jobs/{job_id}/files/song.flac")
    yield "job_bars_of_failed", call(url, "GET", f"{BASE}/jobs/{job_id}/bars")
    yield "job_delete_finished", call(url, "DELETE", f"{BASE}/jobs/{job_id}")
    yield "job_unknown", call(url, "GET", f"{BASE}/jobs/00000000-0000-0000-0000-000000000000")
    yield "job_no_template", call(url, "POST", f"{BASE}/jobs", {"fields": {}})
    yield "job_unknown_template", call(url, "POST", f"{BASE}/jobs", {"template": "no-such-template"})
    yield (
        "job_unknown_field",
        call(url, "POST", f"{BASE}/jobs", {"template": "yue2-song", "fields": {"loudness_war": 11}}),
    )
    yield (
        "job_bad_choice",
        call(url, "POST", f"{BASE}/jobs", {"template": "yue2-song", "fields": {"vocals": "yodelled"}}),
    )
    yield "job_bad_fields", call(url, "POST", f"{BASE}/jobs", {"template": "yue2-song", "fields": [1]})
    yield "job_bad_json", call(url, "POST", f"{BASE}/jobs", "not an object")
    yield "from_record_empty", call(url, "POST", f"{BASE}/from-record", {})
    yield "upload_nothing", call(url, "POST", f"{BASE}/uploads", {})


def normalise(answer: Answer, base: str = "") -> dict[str, Any]:
    """An answer without what changes from run to run, as the golden file keeps it."""
    ids: dict[str, str] = {}

    def text(value: str) -> str:
        for found in UUID.findall(value):
            ids.setdefault(found, f"<id{len(ids) + 1}>")
            value = value.replace(found, ids[found])
        if base:
            for form in {base, base.replace("\\", "/"), base.replace("\\", "\\\\")}:
                value = value.replace(form, "<base>")
        return value

    def walk(value: Any, key: str = "", parent: str = "") -> Any:
        if isinstance(value, dict):
            if key == "seeds":
                return {name: "<seed>" for name in value}
            if key == "error" and parent == "job":
                return {name: "<run error>" if name in ("message", "type", "title", "node") else walk(v, name)
                        for name, v in value.items()}  # fmt: skip
            inner = "job" if "status" in value and "template" in value else ""
            return {name: walk(item, name, inner) for name, item in value.items()}
        if isinstance(value, list):
            return [walk(item, key, parent) for item in value]
        if isinstance(value, bool) or value is None:
            return value
        if isinstance(value, (int, float)) and key in VOLATILE_NUMBERS:
            return "<number>"
        if isinstance(value, str):
            if key in VERSIONS:
                return "<version>"
            return text(value)
        return value

    return {"status": answer.status, "headers": walk(answer.headers), "body": walk(answer.body)}


def differences(golden: Any, current: Any, where: str = "") -> Iterator[str]:
    """Where ``current`` differs from ``golden``: a JSON path and what changed."""
    if isinstance(golden, dict) and isinstance(current, dict):
        for key in sorted(set(golden) | set(current)):
            path = f"{where}/{key}"
            if key not in current:
                yield f"{path}: gone"
            elif key not in golden:
                yield f"{path}: new"
            else:
                yield from differences(golden[key], current[key], path)
    elif isinstance(golden, list) and isinstance(current, list):
        if len(golden) != len(current):
            yield f"{where}: {len(golden)} items -> {len(current)}"
        for index, (a, b) in enumerate(zip(golden, current, strict=False)):
            yield from differences(a, b, f"{where}/{index}")
    elif golden != current:
        yield f"{where}: {json.dumps(golden)[:80]} -> {json.dumps(current)[:80]}"


DELTAS: list[tuple[str, str, str]] = [
    (
        "models",
        "/body/models/",
        "2.1: every catalogue file is pinned to a commit (its url) and carries its measured size; a file of the "
        "wrong size says so (an empty stand-in of the instrumental adapter, whose size 1.6 did not know)",
    ),
    (
        "models",
        "/body/templates/",
        "3.3: a template's readiness follows its Model Choices - the files the model plan takes on this computer "
        "(here, without a graphics card, the fp8 and fp4 cover-art files), named by their catalogue variant",
    ),
    (
        "job_create_again",
        "/body/progress/nodes",
        "3.3, 4.6: the templates hold Model Choice nodes and the Preset field - the prompt has more nodes",
    ),
]
"""The differences of 2.0 against 1.6.0 that are reviewed: (case, path prefix, why). Everything else a local caller
gets is as 1.6.0 answered it."""


def unexplained(case: str, found: list[str], deltas: list[tuple[str, str, str]] = DELTAS) -> list[str]:
    return [d for d in found if not any(case == c and d.startswith(prefix) for c, prefix, _why in deltas)]


def main(argv: list[str] | None = None, *, log: Callable[[str], None] = print) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--url", required=True)
    parser.add_argument("--base", default="", help="the server's base folder, masked in the answers")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--record", type=Path)
    mode.add_argument("--compare", type=Path)
    args = parser.parse_args(argv)
    url = args.url.rstrip("/")
    bad = 0
    for case, answer in series(url):
        current = normalise(answer, args.base)
        if args.record:
            args.record.mkdir(parents=True, exist_ok=True)
            text = json.dumps(current, indent=1, ensure_ascii=False) + "\n"
            (args.record / f"{case}.json").write_bytes(text.encode("utf-8"))  # LF, as git keeps it
            log(f"recorded {case}: {answer.status}")
            continue
        golden = json.loads((args.compare / f"{case}.json").read_text(encoding="utf-8"))
        found = list(differences(golden, current))
        left = unexplained(case, found)
        bad += bool(left)
        log(f"{'ok  ' if not left else 'DIFF'} {case}" + "".join(f"\n     {d}" for d in found))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
