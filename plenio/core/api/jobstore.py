"""Jobs of the Song API v2, kept on disk (PD 8.1): one JSON file per job in ``<user>/plenio/api/jobs/``, the index
in memory.

A v2 job has an id of its own (``job_<hex>``) and the ComfyUI prompts it ran as (a review stop and its approval are
two prompts of one job). Its file is written whole or not at all at every change of state - never for progress, which
lives only in the running server. At start the files are read again (a damaged or half-written file is skipped);
a job of *this* server (``instance``) that was queued or running when it stopped becomes ``failed`` with
``error.code = "interrupted"`` - a job of another ComfyUI that shares the user folder is left alone. An
``Idempotency-Key`` belongs to its caller (``owner``: the token, or this computer) and to a job that is not
interrupted: posting it again after a restart starts a new run. Kept: the newest ``KEEP`` jobs, none older than
``KEEP_DAYS`` once it ended.

API v1 does not read this store: it answers from ComfyUI's queue and history as 1.6.0 did (phase 5.1).

Standard library only. One writer at a time (a lock); readers get copies from the index.
"""

from __future__ import annotations

import json
import os
import secrets
import tempfile
import threading
import time
from collections.abc import Callable, Iterable, Mapping
from dataclasses import asdict, dataclass, field, replace
from pathlib import Path
from typing import Any

SCHEMA = "plenio.api_job/1"
ACTIVE = ("queued", "running", "waiting_for_review")
"""States in which a job may still change."""
ENDED = ("succeeded", "failed", "cancelled")
STATES = (*ACTIVE, *ENDED)
KEEP = 500
KEEP_DAYS = 30
_RENAME_TRIES = 6
_RENAME_WAIT_S = 0.25


@dataclass(frozen=True)
class Job:
    id: str
    template: str
    kind: str
    status: str
    created: float
    updated: float
    instance: str
    """The server that runs it (two ComfyUIs can share one user folder)."""
    prompts: tuple[str, ...] = ()
    """ComfyUI's prompt ids this job ran as, oldest first."""
    owner: str = ""
    """Who asked: a token's id, or ``here`` for this computer."""
    key: str = ""
    """The request's ``Idempotency-Key`` (empty: none)."""
    client: Mapping[str, str] = field(default_factory=dict)
    request: Mapping[str, Any] = field(default_factory=dict)
    """The request as it was taken (fields, release, seeds, review stops) - to run it again, or approve it."""
    stage: str = ""
    """The review stop it waits at (``text``, ``score``) - with ``waiting_for_review``."""
    result: Mapping[str, Any] | None = None
    error: Mapping[str, Any] | None = None
    """``code``, ``message`` and, where known, ``hint`` and ``node``."""
    ended: float | None = None

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["prompts"] = list(self.prompts)
        return {"schema": SCHEMA, **data}

    @staticmethod
    def from_dict(raw: Mapping[str, Any]) -> Job:
        if raw.get("schema") != SCHEMA:
            raise ValueError("not a job file")
        values = {name: raw[name] for name in Job.__dataclass_fields__ if name in raw}
        values["prompts"] = tuple(str(p) for p in values.get("prompts") or ())
        job = Job(**values)
        if job.status not in STATES or not job.id.startswith("job_"):
            raise ValueError("not a job")
        return job


def new_id() -> str:
    return f"job_{secrets.token_hex(8)}"


def _replace(source: str, target: Path) -> None:
    """``os.replace``, tried again a few times: on Windows a reader or a virus scanner can hold the target."""
    for attempt in range(_RENAME_TRIES):
        try:
            os.replace(source, target)
            return
        except PermissionError:
            if attempt == _RENAME_TRIES - 1:
                raise
            time.sleep(_RENAME_WAIT_S * (attempt + 1))


class JobStore:
    def __init__(self, folder: Path, instance: str, *, clock: Callable[[], float] = time.time):
        self.folder = folder
        self.instance = instance
        self.clock = clock
        self._lock = threading.RLock()
        self._jobs: dict[str, Job] = {}
        self.skipped: list[str] = []
        """Files that could not be read at start (their names)."""
        self._load()

    # --- start ------------------------------------------------------------------------------------------------
    def _load(self) -> None:
        self.folder.mkdir(parents=True, exist_ok=True)
        for path in sorted(self.folder.glob("job_*.json")):
            try:
                job = Job.from_dict(json.loads(path.read_text(encoding="utf-8")))
            except (OSError, ValueError, TypeError, KeyError):
                self.skipped.append(path.name)
                continue
            self._jobs[job.id] = job
        for temporary in self.folder.glob(".job_*.tmp"):
            temporary.unlink(missing_ok=True)  # a write that a stop cut short
        now = self.clock()
        for job in list(self._jobs.values()):
            if job.instance == self.instance and job.status in ACTIVE:
                self._write(
                    replace(
                        job,
                        status="failed",
                        error={
                            "code": "interrupted",
                            "message": "ComfyUI stopped while this job ran.",
                            "hint": "Post the request again; its Idempotency-Key starts a new run.",
                        },
                        updated=now,
                        ended=now,
                    )
                )
        self.prune()

    # --- reading ----------------------------------------------------------------------------------------------
    def get(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def by_prompt(self, prompt_id: str) -> Job | None:
        return next((job for job in self._jobs.values() if prompt_id in job.prompts), None)

    def by_key(self, owner: str, key: str) -> Job | None:
        """The job an ``Idempotency-Key`` stands for: the caller's, not interrupted."""
        if not key:
            return None
        for job in self._jobs.values():
            if job.owner == owner and job.key == key and (job.error or {}).get("code") != "interrupted":
                return job
        return None

    def listing(
        self, *, owner: str | None = None, statuses: Iterable[str] = (), limit: int = 50
    ) -> list[Job]:
        """The newest jobs first; ``owner``: only that caller's (``None``: everyone's - this computer)."""
        wanted = set(statuses)
        found = [
            job
            for job in self._jobs.values()
            if (owner is None or job.owner == owner) and (not wanted or job.status in wanted)
        ]
        return sorted(found, key=lambda job: job.created, reverse=True)[: max(0, limit)]

    def active(self) -> list[Job]:
        return [job for job in self._jobs.values() if job.status in ACTIVE and job.instance == self.instance]

    # --- writing ----------------------------------------------------------------------------------------------
    def create(
        self,
        *,
        template: str,
        kind: str,
        prompt: str,
        owner: str,
        key: str = "",
        client: Mapping[str, str] | None = None,
        request: Mapping[str, Any] | None = None,
    ) -> Job:
        now = self.clock()
        job = Job(
            id=new_id(),
            template=template,
            kind=kind,
            status="queued",
            created=now,
            updated=now,
            instance=self.instance,
            prompts=(prompt,) if prompt else (),
            owner=owner,
            key=key,
            client=dict(client or {}),
            request=dict(request or {}),
        )
        self._write(job)
        return job

    def update(self, job_id: str, **changes: Any) -> Job:
        """The job with ``changes`` (``status``, ``stage``, ``result``, ``error``, a new ``prompt`` to add),
        written. A change to an ended job is refused (it ended once)."""
        with self._lock:
            job = self._jobs[job_id]
            if job.status in ENDED:
                raise ValueError(f"{job_id} ended already ({job.status})")
            prompt = changes.pop("prompt", None)
            if prompt:
                changes["prompts"] = (*job.prompts, str(prompt))
            status = changes.get("status", job.status)
            if status not in STATES:
                raise ValueError(f"no state {status!r}")
            now = self.clock()
            changes.setdefault("updated", now)
            if status in ENDED:
                changes.setdefault("ended", now)
            updated = replace(job, **changes)
            self._write(updated)  # under the lock: no other change comes between reading and writing
        return updated

    def prune(self) -> int:
        """Forget ended jobs beyond the newest ``KEEP`` or older than ``KEEP_DAYS``; returns how many."""
        now = self.clock()
        ended = sorted(
            (j for j in self._jobs.values() if j.status in ENDED), key=lambda j: j.created, reverse=True
        )
        gone = [
            j for i, j in enumerate(ended) if i >= KEEP or (j.ended or j.created) < now - KEEP_DAYS * 86400
        ]
        with self._lock:
            for job in gone:
                self._jobs.pop(job.id, None)
                (self.folder / f"{job.id}.json").unlink(missing_ok=True)
        return len(gone)

    def _write(self, job: Job) -> None:
        data = json.dumps(job.to_dict(), ensure_ascii=False, indent=1).encode("utf-8")
        with self._lock:
            handle, temporary = tempfile.mkstemp(prefix=f".{job.id}.", suffix=".tmp", dir=self.folder)
            try:
                with os.fdopen(handle, "wb") as out:
                    out.write(data)
                    out.flush()
                    os.fsync(out.fileno())
                _replace(temporary, self.folder / f"{job.id}.json")
            except BaseException:
                Path(temporary).unlink(missing_ok=True)
                raise
            self._jobs[job.id] = job
