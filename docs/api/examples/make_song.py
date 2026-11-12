"""Make a song with the Plenio Song API and download its files - Python 3.9+, standard library only.

    python make_song.py "a night drive through a rainy city" --genre synthwave --out songs

Options: --api (another ComfyUI), --token (from another computer; or PLENIO_TOKEN), --template, --length, --vocals,
--language, --cover-art/--no-cover-art, --review text (stop when the lyrics are written: they are shown, then
approved), --title (with --review text: the title to approve instead of the written one), --field name=value (any
field of the template, repeatable). It uses plenio_client.py from the same folder. The guide: docs/api/README.md.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from plenio_client import Plenio, PlenioError  # noqa: E402 - beside this script


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("description", help="what the song is about and how it should sound")
    parser.add_argument("--api", default=os.environ.get("PLENIO_API", "http://127.0.0.1:8188"))
    parser.add_argument("--token", default=os.environ.get("PLENIO_TOKEN", ""), help="from another computer")
    parser.add_argument("--review", action="append", default=[], choices=["text", "score"], help="stop here")
    parser.add_argument("--title", default="", help="with --review text: approve this title instead")
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

    plenio = Plenio(args.api, args.token)
    try:
        return make(plenio, args)
    except PlenioError as error:  # every error of the API: status, code, message, hint, field
        print(f"{error.status} {error.code}: {error.message} {error.hint}".strip(), file=sys.stderr)
        return 2


def make(plenio: Plenio, args: argparse.Namespace) -> int:
    about = plenio.about()
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

    job = plenio.make_song(args.template, fields, review=args.review or None, release=release,
                           client="make_song.py")  # fmt: skip
    print(f"job {job['id']} - seeds {job['seeds']}")
    job = plenio.wait(job, on_change=show)
    while job["status"] == "waiting_for_review":
        # the job stopped where the Song Sheet stops: show its documents, change what you like, let it go on
        print(f"review stop '{job['waiting_at']}':")
        for kind, document in (job.get("documents") or {}).items():
            first = document["text"].strip().splitlines()[:1]
            print(f"  {kind}: {first[0] if first else ''}")
        edits = {"title": args.title} if args.title and job["waiting_at"] == "text" else None
        job = plenio.wait(plenio.approve(job, edits), on_change=show)
    if job["status"] != "succeeded":
        error = job.get("error") or {}
        print(f"no song: {job['status']} {error.get('code', '')} {error.get('message', '')}".strip())
        return 1
    result = job["result"]
    print(f"“{result['title']}” ({result.get('seconds', 0):.0f} s) is ready")
    for path in plenio.download(job, args.out):
        print("saved", path)
    return 0


def show(job: dict[str, Any]) -> None:
    stage = (job.get("stage") or {}).get("text", "")
    line = job["status"] + (f" - #{job['queue_position']} in line" if job.get("queue_position") else "")
    print(line + (f" - {stage}" if stage else ""))


if __name__ == "__main__":
    sys.exit(main())
