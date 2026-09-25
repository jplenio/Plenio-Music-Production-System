"""Worker side of the protocol (see ``protocol.py``).

A worker module calls ``serve(handler)`` from its ``__main__`` block. The
handler receives a ``Job`` and returns a JSON-serialisable mapping.
"""

from __future__ import annotations

import argparse
import json
import traceback
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from typing import Any

from ..errors import PlenioError
from ..files import atomic_write_text
from .protocol import ERROR_SCHEMA, RESULT_SCHEMA


class Job:
    def __init__(self, folder: Path):
        self.folder = folder
        self.request: dict[str, Any] = json.loads((folder / "request.json").read_text(encoding="utf-8"))
        self._progress = folder / "progress.jsonl"

    def progress(self, fraction: float | None, message: str = "") -> None:
        """Report progress (``fraction`` in 0..1 or ``None``); also resets the idle timer."""
        line = json.dumps({"progress": fraction, "message": message}, ensure_ascii=False)
        with self._progress.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")


def serve(handler: Callable[[Job], Mapping[str, Any]], argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Plenio worker")
    parser.add_argument("--job", required=True, type=Path)
    args = parser.parse_args(argv)
    job = Job(args.job)
    try:
        result = dict(handler(job))
    except PlenioError as error:
        atomic_write_text(
            job.folder / "error.json",
            json.dumps(
                {
                    "schema": ERROR_SCHEMA,
                    "type": type(error).__name__,
                    "message": error.message,
                    "hint": error.hint,
                }
            ),
        )
        return 1
    except Exception as error:  # the parent needs a readable error for anything that goes wrong
        atomic_write_text(
            job.folder / "error.json",
            json.dumps(
                {
                    "schema": ERROR_SCHEMA,
                    "type": type(error).__name__,
                    "message": str(error) or type(error).__name__,
                    "traceback": traceback.format_exc(),
                }
            ),
        )
        return 1
    atomic_write_text(job.folder / "result.json", json.dumps({"schema": RESULT_SCHEMA, "result": result}))
    return 0
