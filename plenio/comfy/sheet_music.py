"""The sheet music PDF of an export (Export Release, *sheet music*): reserved by the node, drawn by the browser.

The notation is drawn with abcjs in the browser (the same code as the score editor's *Export notation…*);
the backend has no music engraving. So Export Release reserves ``<name>.pdf`` next to the audio, sends the
browser that queued the run the score with its lyrics and a one-time token, and the browser posts the
finished PDF back to ``/plenio/export/sheet-music``. Only that file can be written with the token, only
once, only within ``TOKEN_TTL_S``, only a PDF; the release record then lists it and says *saved*.
"""

from __future__ import annotations

import json
import secrets
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..core.errors import PlenioUserError
from ..core.files import atomic_write_bytes, atomic_write_text
from ..core.release import file_facts, with_sheet_music

TOKEN_TTL_S = 30 * 60.0
"""How long the browser has to send the PDF (a long batch queues many exports at once)."""
MAX_BYTES = 128 * 1024 * 1024
"""300-dpi pages of a long score stay far below this."""
PAPERS = {"PDF (A4)": "a4", "PDF (Letter)": "letter"}
OFF = "off"
SHEET_MUSIC_OPTIONS = (OFF, *PAPERS)


@dataclass(frozen=True)
class Job:
    pdf: Path
    record: Path
    expires: float


class Jobs:
    """Reserved sheet music files by token (this server process only)."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def reserve(self, pdf: Path, record: Path, *, now: float | None = None) -> str:
        token = secrets.token_urlsafe(24)
        moment = time.monotonic() if now is None else now
        with self._lock:
            self._jobs = {k: v for k, v in self._jobs.items() if v.expires > moment}  # forget old ones
            self._jobs[token] = Job(pdf, record, moment + TOKEN_TTL_S)
        return token

    def _take(self, token: str, now: float) -> Job:
        with self._lock:
            job = self._jobs.pop(token, None)
        if job is None or job.expires <= now:
            raise PlenioUserError(
                "This sheet music can no longer be saved: the export is unknown to the server (it restarted, or "
                "the PDF was saved already) or older than 30 minutes.",
                hint="Export the song again, or save the notation from the Song Sheet's score editor "
                "(Export notation… > PDF).",
            )
        return job

    def save(self, token: str, data: bytes, *, now: float | None = None) -> dict[str, Any]:
        """Write the PDF of ``token`` and list it in the release record; returns the file's facts."""
        if not data.startswith(b"%PDF-"):
            raise PlenioUserError("The sheet music upload is not a PDF.")
        if len(data) > MAX_BYTES:
            raise PlenioUserError(f"The sheet music PDF is larger than {MAX_BYTES // 2**20} MB.")
        job = self._take(token, time.monotonic() if now is None else now)
        atomic_write_bytes(job.pdf, data)
        facts = file_facts(job.pdf)
        try:
            record = json.loads(job.record.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return facts  # the record was moved or edited meanwhile: the PDF stands on its own
        atomic_write_text(
            job.record, json.dumps(with_sheet_music(record, facts), indent=2, ensure_ascii=False)
        )
        return facts


JOBS = Jobs()
