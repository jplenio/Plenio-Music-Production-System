"""The sheet music PDF of an export (Export Release, *sheet music*): reserved by the node, drawn by the browser.

The notation is drawn with abcjs in the browser (the same code as the score editor's *Export notation…*);
the backend has no music engraving. So Export Release reserves ``<name>.pdf`` next to the audio and hands
the notation (the score with its lyrics, placed as the editor places them) and a one-time token to the
browser, which draws the PDF and posts it back to ``/plenio/export/sheet-music``. Only that file can be
written with the token, only once, only within ``TOKEN_TTL_S``, only a PDF; the release record then lists
it and says *saved*.

Every open ComfyUI page draws the jobs it receives - whichever workflow it shows - and asks for the jobs
still waiting (``Jobs.pending``) when it opens, comes back to the front or reconnects: an export whose page
was closed, reloaded or busy elsewhere gets its PDF the next time a page is there (owner's report
2026-10-09: no PDF when the run ended while another workflow was open).
"""

from __future__ import annotations

import json
import secrets
import threading
import time
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..core.errors import PlenioUserError
from ..core.files import atomic_write_bytes, atomic_write_text
from ..core.release import file_facts, with_sheet_music

TOKEN_TTL_S = 24 * 60 * 60.0
"""How long a reserved PDF waits for a page to draw it (a batch overnight, a page opened the next morning)."""
MAX_PENDING = 500
"""Reserved PDFs kept at most (the oldest are forgotten first)."""
MAX_BYTES = 128 * 1024 * 1024
"""300-dpi pages of a long score stay far below this."""
PAPERS = {"PDF (A4)": "a4", "PDF (Letter)": "letter"}
OFF = "off"
SHEET_MUSIC_OPTIONS = (OFF, *PAPERS)
SIZES = ("standard", "smaller", "compact", "large")
"""How large the music is drawn (the score editor's notation sizes, ``notationExport.ts``)."""
DEFAULT_SIZE = "standard"
SPANS_PROPERTY = "plenio_lyric_spans"
"""The Song Sheet's lyrics lines placed by hand, kept in the node's properties with the workflow."""


@dataclass(frozen=True)
class Job:
    pdf: Path
    record: Path
    expires: float
    notation: Mapping[str, Any] = field(default_factory=dict)
    """What the page draws (``file``, ``title``, ``paper``, ``size``, ``display_abc``)."""


class Jobs:
    """Reserved sheet music files by token (this server process only)."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def reserve(
        self, pdf: Path, record: Path, notation: Mapping[str, Any] | None = None, *, now: float | None = None
    ) -> str:
        token = secrets.token_urlsafe(24)
        moment = time.monotonic() if now is None else now
        with self._lock:
            self._jobs = {k: v for k, v in self._jobs.items() if v.expires > moment}  # forget old ones
            while len(self._jobs) >= MAX_PENDING:
                self._jobs.pop(next(iter(self._jobs)))
            self._jobs[token] = Job(pdf, record, moment + TOKEN_TTL_S, dict(notation or {}))
        return token

    def pending(self, *, now: float | None = None) -> list[dict[str, Any]]:
        """The jobs still waiting for a page to draw them, oldest first (each with its ``token``)."""
        moment = time.monotonic() if now is None else now
        with self._lock:
            return [
                {**job.notation, "token": token}
                for token, job in self._jobs.items()
                if job.expires > moment and job.notation
            ]

    def _take(self, token: str, now: float) -> Job:
        with self._lock:
            job = self._jobs.pop(token, None)
        if job is None or job.expires <= now:
            raise PlenioUserError(
                "This sheet music can no longer be saved: the export is unknown to the server (it restarted, or "
                f"the PDF was saved already) or older than {TOKEN_TTL_S / 3600:.0f} hours.",
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


def _workflow_node(workflow: Mapping[str, Any], node_id: str) -> Mapping[str, Any] | None:
    """The node ``node_id`` (an execution id: ``12``, or ``5:12`` inside a blueprint) of a saved workflow."""
    nodes: Any = workflow.get("nodes")
    definitions = {
        str(d.get("id")): d
        for d in (workflow.get("definitions") or {}).get("subgraphs") or []
        if isinstance(d, Mapping)
    }
    *outer, inner = str(node_id).split(":")
    for part in outer:  # down through the blueprints the node sits in
        holder = next((n for n in nodes or [] if isinstance(n, Mapping) and str(n.get("id")) == part), None)
        definition = definitions.get(str(holder.get("type"))) if holder is not None else None
        if definition is None:
            return None
        nodes = definition.get("nodes")
    return next((n for n in nodes or [] if isinstance(n, Mapping) and str(n.get("id")) == inner), None)


def _spans(value: Any) -> list[list[int]]:
    """Valid spans of a node property - ``[start, end, block, line]``, or ``[start, end]`` as Plenio 0.4.4 and
    0.4.5 kept them (anything else is ignored, as the editor does)."""
    if not isinstance(value, list):
        return []
    spans = []
    for item in value:
        if (
            isinstance(item, list | tuple)
            and len(item) in (2, 4)
            and all(isinstance(x, int) and not isinstance(x, bool) and x >= 0 for x in item)
            and item[1] > item[0]
        ):
            spans.append([int(x) for x in item])
    return spans


def hand_placed(extra_pnginfo: Any, sheets: Sequence[str | None]) -> list[list[int]]:
    """The lyrics lines placed by hand on the first of ``sheets`` (Song Sheet node ids) that has any - read
    from the workflow the run was queued with, so they come with the export whichever workflow a page shows."""
    workflow = extra_pnginfo.get("workflow") if isinstance(extra_pnginfo, Mapping) else None
    if not isinstance(workflow, Mapping):
        return []
    for sheet in sheets:
        if not sheet:
            continue
        node = _workflow_node(workflow, str(sheet))
        properties = node.get("properties") if node is not None else None
        spans = _spans(properties.get(SPANS_PROPERTY)) if isinstance(properties, Mapping) else []
        if spans:
            return spans
    return []
