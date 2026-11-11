"""Make a song with the Plenio Song API and download its files - Python 3.9+, standard library only.

    python make_song.py "a night drive through a rainy city" --genre synthwave --out songs

Options: --api (another ComfyUI), --token (from another computer; or PLENIO_TOKEN), --template, --length, --vocals,
--language, --cover-art/--no-cover-art, --review text (stop when the lyrics are written: they are shown, then
approved), --field name=value (any field of the template, repeatable). The guide: docs/api/README.md.
"""

from __future__ import annotations

import argparse
import json
import os
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
    def __init__(self, base: str, token: str = "") -> None:
        self.base = base.rstrip("/")
        self.origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(self.base))
        # this computer needs no token; another one sends the token made in Plenio Setup > API access
        self.auth = {"Authorization": f"Bearer {token}"} if token else {}

    def call(self, method: str, path: str, body: Any = None, headers: dict[str, str] | None = None) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(
            self.base + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json", **self.auth, **(headers or {})},
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
            if job["status"] == "waiting_for_review":
                job = self.review(job)
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

    def review(self, job: dict[str, Any]) -> dict[str, Any]:
        """The job stopped where the Song Sheet stops: show its documents and let it go on. A program could edit
        them here - {"documents": {"title": "..."}} - and the edited ones are kept as written."""
        print(f"review stop '{job['waiting_at']}':")
        for kind, document in (job.get("documents") or {}).items():
            first = document["text"].strip().splitlines()[:1]
            print(f"  {kind}: {first[0] if first else ''}")
        approved: dict[str, Any] = self.call("POST", f"/jobs/{job['id']}/approve", {})
        return approved

    def download(self, job: dict[str, Any], folder: Path) -> list[Path]:
        folder.mkdir(parents=True, exist_ok=True)
        saved = []
        for file in job["result"]["files"]:
            target = folder / Path(file["name"]).name
            request = urllib.request.Request(self.origin + file["url"], headers=self.auth)
            with urllib.request.urlopen(request, timeout=300) as answer:
                target.write_bytes(answer.read())
            saved.append(target)
        return saved


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("description", help="what the song is about and how it should sound")
    parser.add_argument("--api", default="http://127.0.0.1:8188/plenio/api/v2")
    parser.add_argument("--token", default=os.environ.get("PLENIO_TOKEN", ""), help="from another computer")
    parser.add_argument(
        "--review", action="append", default=[], choices=["text", "score"], help="stop at this stage"
    )
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

    api = Api(args.api, args.token)
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

    request: dict[str, Any] = {
        "template": args.template,
        "fields": fields,
        "release": release,
        "client": {"name": "make_song.py"},
    }
    if args.review:
        request["review"] = args.review
    job = api.create(request, key=f"make-song-{uuid.uuid4()}")
    print(f"job {job['id']} - seeds {job['seeds']}")
    job = api.follow(job)
    if job["status"] != "succeeded":
        error = job.get("error") or {}
        print(f"no song: {job['status']} {error.get('code', '')} {error.get('message', '')}".strip())
        return 1
    result = job["result"]
    print(f"“{result['title']}” ({result.get('seconds', 0):.0f} s) is ready")
    for path in api.download(job, args.out):
        print("saved", path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
