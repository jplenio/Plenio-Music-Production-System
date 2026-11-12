"""List the songs of a ComfyUI with Plenio - Python 3.9+, standard library only.

    python list_songs.py                 # every song, newest first
    python list_songs.py rain --files    # songs with "rain" in the title, the date or the folder, with their files

Options: --api (another ComfyUI), --token (from another computer; or PLENIO_TOKEN). It uses plenio_client.py from
the same folder.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from plenio_client import Plenio, PlenioError  # noqa: E402 - beside this script


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("query", nargs="?", default="")
    parser.add_argument("--api", default=os.environ.get("PLENIO_API", "http://127.0.0.1:8188"))
    parser.add_argument("--token", default=os.environ.get("PLENIO_TOKEN", ""))
    parser.add_argument("--files", action="store_true", help="name each song's files")
    args = parser.parse_args()
    plenio = Plenio(args.api, args.token)
    try:
        found = plenio.songs(args.query)
        for row in found:
            print(
                f"{row['id']}  {row.get('title') or '(untitled)'}  {str(row.get('created') or '')[:10]}".rstrip()
            )
            if args.files:
                for file in plenio.song(row["id"])["files"]:
                    print(f"    {file.get('role') or 'file'}: {file['name']}")
        print(f"{len(found)} song(s)")
    except PlenioError as error:
        print(f"{error.status} {error.code}: {error.message} {error.hint}".strip(), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
