"""A small client for the Plenio Song API v2 - one file, Python 3.9+, standard library only.

Copy it next to your script and use it::

    from plenio_client import Plenio

    plenio = Plenio()                                  # this computer: no token needed
    plenio = Plenio("http://studio:8188", token="plenio_...")   # another computer: a token from Plenio Setup
    job = plenio.make_song("yue2-song", {"description": "a night drive through a rainy city"}, review=["text"])
    job = plenio.wait(job)                              # until it ends or stops at a review
    if job["status"] == "waiting_for_review":
        job = plenio.approve(job, {"title": "Neon Rain"})   # edited documents are kept as written
        job = plenio.wait(job)
    for path in plenio.download(job, "songs"):
        print(path)

Every error of the API is raised as ``PlenioError`` with its ``status``, ``code``, ``message``, ``hint`` and
``field``. The guide: docs/api/README.md; the reference: docs/api/openapi.json.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from collections.abc import Callable, Iterator
from pathlib import Path
from typing import Any

__all__ = ["DEFAULT_BASE", "ENDED", "Event", "Plenio", "PlenioError"]

DEFAULT_BASE = "http://127.0.0.1:8188"
API_PATH = "/plenio/api/v2"
ENDED = ("succeeded", "failed", "cancelled")
"""A job in one of these states changes no more."""
WAITING = "waiting_for_review"

Job = dict[str, Any]


class PlenioError(Exception):
    """An answer of the API that is not a success, or a ComfyUI that does not answer (``status`` 0)."""

    def __init__(self, status: int, code: str, message: str, hint: str = "", field: str = "") -> None:
        super().__init__(f"{status} {code}: {message}" + (f" ({hint})" if hint else ""))
        self.status = status
        self.code = code
        self.message = message
        self.hint = hint
        self.field = field


class Event:
    """One event of ``/events``: its id (for a reconnect), its kind (``job.running``, ``download.done``...) and data."""

    def __init__(self, id: str, kind: str, data: dict[str, Any]) -> None:  # noqa: A002 - the stream's own word
        self.id = id
        self.kind = kind
        self.data = data

    def __repr__(self) -> str:
        return f"Event({self.id!r}, {self.kind!r}, {self.data!r})"


class Plenio:
    """The Song API v2 of one ComfyUI with Plenio.

    ``base`` is ComfyUI's address (``http://127.0.0.1:8188``) or the API's own (``.../plenio/api/v2``). ``token``
    is needed only from another computer (Plenio Setup > API access). ``timeout`` is per request, in seconds.
    """

    def __init__(self, base: str = DEFAULT_BASE, token: str = "", timeout: float = 90.0) -> None:
        base = base.rstrip("/")
        if not base.endswith(API_PATH):
            base += API_PATH
        self.base = base
        self.origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(base))
        self.timeout = timeout
        self._auth = {"Authorization": f"Bearer {token}"} if token else {}

    # -- requests ----------------------------------------------------------------------------------------------

    def call(
        self,
        method: str,
        path: str,
        body: Any = None,
        headers: dict[str, str] | None = None,
        timeout: float | None = None,
    ) -> Any:
        """One request to the API; the parsed JSON answer, or ``PlenioError``."""
        data = json.dumps(body).encode("utf-8") if body is not None else None
        sent = {"Accept": "application/json", **self._auth, **(headers or {})}
        if data is not None:
            sent["Content-Type"] = "application/json"
        return self._json(
            urllib.request.Request(self._url(path), data=data, method=method, headers=sent), timeout
        )

    def _url(self, path: str) -> str:
        return (
            path
            if path.startswith("http")
            else (self.origin + path if path.startswith(API_PATH) else self.base + path)
        )

    def _json(self, request: urllib.request.Request, timeout: float | None) -> Any:
        try:
            with urllib.request.urlopen(request, timeout=timeout or self.timeout) as answer:
                raw = answer.read()
        except urllib.error.HTTPError as error:
            raise _problem(error) from None
        except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
            reason = getattr(error, "reason", error)
            raise PlenioError(0, "unreachable", f"No answer from {self.origin}: {reason}",
                              "Is ComfyUI running, and is the address right?") from None  # fmt: skip
        return json.loads(raw) if raw else None

    # -- what the server offers --------------------------------------------------------------------------------

    def about(self) -> dict[str, Any]:
        """The API's name and version, Plenio's and ComfyUI's versions and the paths."""
        answer: dict[str, Any] = self.call("GET", "")
        return answer

    def templates(self) -> list[dict[str, Any]]:
        answer: list[dict[str, Any]] = self.call("GET", "/templates")["templates"]
        return answer

    def template(self, template_id: str) -> dict[str, Any]:
        """One template with its fields (names, types, choices, defaults)."""
        answer: dict[str, Any] = self.call("GET", f"/templates/{_quote(template_id)}")
        return answer

    # -- jobs ----------------------------------------------------------------------------------------------------

    def make_song(
        self,
        template: str,
        fields: dict[str, Any] | None = None,
        *,
        review: list[str] | None = None,
        release: dict[str, Any] | None = None,
        preset: str = "",
        client: str = "plenio_client.py",
        key: str = "",
        tries: int = 4,
    ) -> Job:
        """Order a song. ``review`` names the stops (``"text"``, ``"score"``); ``key`` makes a retry safe: a lost
        answer or a busy ComfyUI is tried again with the same key, and it stays one job."""
        body: dict[str, Any] = {
            "template": template,
            "fields": dict(fields or {}),
            "client": {"name": client},
        }
        if review is not None:
            body["review"] = list(review)
        if release:
            body["release"] = dict(release)
        if preset:
            body["preset"] = preset
        key = key or f"plenio-client-{uuid.uuid4()}"
        for attempt in range(tries):
            try:
                job: Job = self.call("POST", "/jobs", body, {"Idempotency-Key": key})
                return job
            except PlenioError as error:
                again = error.status == 0 or error.code == "busy" or error.status >= 502
                if not again or attempt == tries - 1:
                    raise
                time.sleep(2 ** (attempt + 1))
        raise AssertionError("unreachable")

    def job(self, job_id: str, wait: float = 0) -> Job:
        """A job as it is now; with ``wait`` the answer comes when it changes, or after that many seconds (≤ 60)."""
        query = f"?wait={min(60, max(0, int(wait)))}" if wait else ""
        timeout = self.timeout + wait if wait else None
        answer: Job = self.call("GET", f"/jobs/{_quote(job_id)}{query}", timeout=timeout)
        return answer

    def jobs(self) -> list[Job]:
        answer: list[Job] = self.call("GET", "/jobs")["jobs"]
        return answer

    def wait(
        self,
        job: Job | str,
        *,
        on_change: Callable[[Job], None] | None = None,
        until_review: bool = True,
        timeout: float | None = None,
    ) -> Job:
        """Follow a job until it ends - or, with ``until_review``, until it stops at a review (then approve it and
        wait again). ``on_change`` is called with each new state. ``timeout`` (seconds) raises ``TimeoutError``."""
        current = self.job(job) if isinstance(job, str) else job
        started = time.monotonic()
        seen = ""
        while True:
            state = f"{current['status']}|{(current.get('stage') or {}).get('text', '')}|{current.get('queue_position')}"
            if on_change is not None and state != seen:
                on_change(current)
            seen = state
            if current["status"] in ENDED or (until_review and current["status"] == WAITING):
                return current
            if timeout is not None and time.monotonic() - started > timeout:
                raise TimeoutError(f"job {current['id']} is still {current['status']}")
            current = self.job(current["id"], wait=30)

    def documents(self, job: Job | str) -> dict[str, dict[str, Any]]:
        """The documents of a job at a review stop: ``{"title": {"text", "sha256"}, "lyrics": ..., ...}``."""
        answer: dict[str, dict[str, Any]] = self.call("GET", f"/jobs/{_quote(_id(job))}/documents")[
            "documents"
        ]
        return answer

    def approve(self, job: Job | str, documents: dict[str, str] | None = None) -> Job:
        """Let a job go on from its review stop; the documents given (kind → text) are kept as written."""
        body = {"documents": dict(documents)} if documents else {}
        answer: Job = self.call("POST", f"/jobs/{_quote(_id(job))}/approve", body)
        return answer

    def cancel(self, job: Job | str) -> Job:
        answer: Job = self.call("DELETE", f"/jobs/{_quote(_id(job))}")
        return answer

    def timings(self, job: Job | str) -> dict[str, Any]:
        answer: dict[str, Any] = self.call("GET", f"/jobs/{_quote(_id(job))}/timings")
        return answer

    def download(self, job_or_song: dict[str, Any], folder: str | Path) -> list[Path]:
        """Save the files of a finished job (or of a song from ``song()``) into ``folder``; their paths."""
        files = (job_or_song.get("result") or job_or_song).get("files") or []
        target = Path(folder)
        target.mkdir(parents=True, exist_ok=True)
        saved = []
        for file in files:
            path = target / Path(str(file["name"])).name
            request = urllib.request.Request(self._url(str(file["url"])), headers=self._auth)
            try:
                with (
                    urllib.request.urlopen(request, timeout=max(self.timeout, 300)) as answer,
                    path.open("wb") as out,
                ):
                    while chunk := answer.read(1 << 20):
                        out.write(chunk)
            except urllib.error.HTTPError as error:
                raise _problem(error) from None
            saved.append(path)
        return saved

    # -- songs ---------------------------------------------------------------------------------------------------

    def songs(self, query: str = "") -> list[dict[str, Any]]:
        """The songs of the output folder, newest first; ``query`` searches words of the title, the date or the folder."""
        path = "/songs" + (f"?q={urllib.parse.quote(query)}" if query else "")
        answer: list[dict[str, Any]] = self.call("GET", path)["songs"]
        return answer

    def song(self, song_id: str) -> dict[str, Any]:
        answer: dict[str, Any] = self.call("GET", f"/songs/{_quote(song_id)}")
        return answer

    def again(self, song_id: str, as_: str = "take", fields: dict[str, Any] | None = None) -> Job:
        """Make a song again: ``take`` (a new take of the same plan), ``again``, ``like`` (a new song like it) or
        ``cover``. The answer is a new job."""
        body: dict[str, Any] = {"as": as_}
        if fields:
            body["fields"] = dict(fields)
        answer: Job = self.call("POST", f"/songs/{_quote(song_id)}/again", body)
        return answer

    def upload(self, path: str | Path) -> str:
        """Send a recording for a cover; the name to give the template's audio field."""
        source = Path(path)
        request = urllib.request.Request(
            self._url(f"/uploads?name={urllib.parse.quote(source.name)}"),
            data=source.read_bytes(),
            method="POST",
            headers={"Content-Type": "application/octet-stream", **self._auth},
        )
        answer: dict[str, Any] = self._json(request, max(self.timeout, 300))
        return str(answer["name"])

    # -- events --------------------------------------------------------------------------------------------------

    def events(self, after: str = "") -> Iterator[Event]:
        """The event stream, as it comes; pass the last ``Event.id`` as ``after`` to reconnect without a gap (a
        ``sync`` event says that something was missed: read the jobs again)."""
        headers = {"Accept": "text/event-stream", **self._auth}
        if after:
            headers["Last-Event-ID"] = after
        request = urllib.request.Request(self._url("/events"), headers=headers)
        try:
            answer = urllib.request.urlopen(request, timeout=60)  # a comment comes every 15 s
        except urllib.error.HTTPError as error:
            raise _problem(error) from None
        with answer:
            fields: dict[str, str] = {}
            for raw in answer:
                line = raw.decode("utf-8").rstrip("\r\n")
                if not line:
                    if "data" in fields:
                        yield Event(
                            fields.get("id", ""), fields.get("event", "message"), json.loads(fields["data"])
                        )
                    fields = {}
                elif not line.startswith(":"):
                    name, _, value = line.partition(":")
                    fields[name] = (
                        fields.get(name, "") + ("\n" if name in fields else "") + value.removeprefix(" ")
                    )


def _id(job: Job | str) -> str:
    return job if isinstance(job, str) else str(job["id"])


def _quote(part: str) -> str:
    return urllib.parse.quote(part, safe="")


def _problem(error: urllib.error.HTTPError) -> PlenioError:
    try:
        problem = json.load(error).get("error") or {}
    except (ValueError, AttributeError):
        problem = {}
    return PlenioError(
        error.code,
        str(problem.get("code") or "http_error"),
        str(problem.get("message") or error.reason),
        str(problem.get("hint") or ""),
        str(problem.get("field") or ""),
    )
