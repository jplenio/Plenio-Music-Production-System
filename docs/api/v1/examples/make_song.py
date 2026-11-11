"""Make a song with the Plenio Song API and download its files - Python 3.9+, standard library only.

    python make_song.py "a night drive through a rainy city" --genre synthwave --out songs

Options: --api (another ComfyUI), --template, --length, --vocals, --language, --cover-art/--no-cover-art,
--field name=value (any field of the template, repeatable). The guide: docs/api/README.md.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any

FINISHED = ("succeeded", "failed", "cancelled")


class Api:
    def __init__(self, base: str) -> None:
        self.base = base.rstrip("/")
        self.origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(self.base))

    def call(self, method: str, path: str, body: Any = None, headers: dict[str, str] | None = None) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(
            self.base + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json", **(headers or {})},
        )
        try:
            with urllib.request.urlopen(request, timeout=90) as answer:
                return json.load(answer)
        except urllib.error.HTTPError as error:
            # every error of the API: {"error": {"code", "message", "hint", "field"}}
            problem = json.load(error).get("error", {})
            raise SystemExit(
                f"{error.code} {problem.get('code')}: {problem.get('message')} {problem.get('hint', '')}".strip()
            ) from None

    def create(self, request: dict[str, Any], key: str, tries: int = 4) -> dict[str, Any]:
        """Order the song; a lost answer or a busy ComfyUI is tried again - with the same key it stays one song."""
        for attempt in range(tries):
            try:
                result: dict[str, Any] = self.call("POST", "/jobs", request, {"Idempotency-Key": key})
                return result
            except (urllib.error.URLError, TimeoutError) as error:
                if attempt == tries - 1:
                    raise SystemExit(f"ComfyUI does not answer at {self.base}: {error}") from None
                time.sleep(2 ** (attempt + 1))
        raise AssertionError("unreachable")

    def follow(self, job: dict[str, Any]) -> dict[str, Any]:
        """Until the job is done: each request waits up to 30 s for a change, so a song takes a handful of them."""
        shown = ""
        while job["status"] not in FINISHED:
            job = self.call("GET", f"/jobs/{job['id']}?wait=30")
            stage = (job.get("stage") or {}).get("text", "")
            line = f"{job['status']}" + (
                f" - #{job['queue_position']} in line" if job.get("queue_position") else ""
            )
            line += f" - {stage}" if stage else ""
            if line != shown:
                print(line)
                shown = line
        return job

    def download(self, job: dict[str, Any], folder: Path) -> list[Path]:
        folder.mkdir(parents=True, exist_ok=True)
        saved = []
        for file in job["result"]["files"]:
            target = folder / file["name"]
            urllib.request.urlretrieve(self.origin + file["url"], target)
            saved.append(target)
        return saved


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("description", help="what the song is about and how it should sound")
    parser.add_argument("--api", default="http://127.0.0.1:8188/plenio/api/v1")
    parser.add_argument("--template", default="yue2-song")
    parser.add_argument("--genre", default="")
    parser.add_argument(
        "--length", default="short (about 1:30)", help="a length of the list, seconds or 3:15"
    )
    parser.add_argument("--vocals", default="sung", choices=["sung", "sparse vocals", "instrumental"])
    parser.add_argument("--language", default="")
    parser.add_argument("--cover-art", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--field", action="append", default=[], help="name=value, any field of the template")
    parser.add_argument("--album", default="")
    parser.add_argument("--artist", default="")
    parser.add_argument("--out", type=Path, default=Path("songs"))
    args = parser.parse_args()

    api = Api(args.api)
    about = api.call("GET", "")
    print(f"{about['api']} {about['version']} · Plenio {about['plenio']} · ComfyUI {about['comfyui']}")

    fields: dict[str, Any] = {
        "description": args.description,
        "length": args.length,
        "vocals": args.vocals,
        "finish.cover_art": args.cover_art,
    }
    if args.genre:
        fields["genre"] = args.genre
    if args.language and args.vocals != "instrumental":
        fields["language"] = args.language
    for pair in args.field:
        name, _, value = pair.partition("=")
        typed = value[:1] in tuple("[{0123456789-") or value in ("true", "false")
        fields[name] = json.loads(value) if value and typed else value
    release = {k: v for k, v in (("album", args.album), ("artist", args.artist)) if v}

    job = api.create(
        {"template": args.template, "fields": fields, "release": release, "client": {"name": "make_song.py"}},
        key=f"make-song-{uuid.uuid4()}",
    )
    for warning in job.get("warnings", []):
        print("note:", warning)
    print(f"job {job['id']} - seeds {job['seeds']}")
    job = api.follow(job)
    if job["status"] != "succeeded":
        error = job.get("error") or {}
        print(f"no song: {job['status']} {error.get('title', '')} {error.get('message', '')}".strip())
        return 1
    result = job["result"]
    print(f"“{result['title']}” ({result.get('seconds', 0):.0f} s) is ready")
    for path in api.download(job, args.out):
        print("saved", path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
