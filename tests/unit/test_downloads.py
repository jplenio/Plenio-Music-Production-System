"""The download manager (``plenio.core.assets.downloads``) against a local stand-in for a model host: every way
a download ends - installed, resumed, paused, cancelled, and each refusal with its words."""

from __future__ import annotations

import hashlib
import threading
import time
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

from plenio.core.assets import hub
from plenio.core.assets.downloads import DownloadManager

pytestmark = pytest.mark.io

DATA = bytes(range(256)) * 4096  # about a megabyte
DIGEST = hashlib.sha256(DATA).hexdigest()


class Host(BaseHTTPRequestHandler):
    """Answers by path: ``/ok`` the file (with ``Range``), ``/slow`` the file in small pieces, ``/gated``,
    ``/moved``, ``/busy`` (once, then the file), ``/damaged`` (other bytes), ``/short`` (too few)."""

    requests: list[tuple[str, dict[str, str]]] = []
    busy_left = 1
    gate = threading.Event()

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        pass

    def do_GET(self) -> None:  # noqa: N802
        headers = {k.lower(): v for k, v in self.headers.items()}
        Host.requests.append((self.path, headers))
        if self.path == "/gated":
            self.send_response(403 if "authorization" in headers else 401)
            self.send_header("X-Error-Code", "GatedRepo")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if self.path == "/moved":
            self.send_error(404)
            return
        if self.path == "/busy" and Host.busy_left > 0:
            Host.busy_left -= 1
            self.send_response(429)
            self.send_header("Retry-After", "7")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        body = DATA
        if self.path == "/damaged":
            body = bytes(len(DATA))
        if self.path == "/short":
            body = DATA[:1000]
        start = 0
        if "range" in headers:
            start = int(headers["range"].removeprefix("bytes=").rstrip("-"))
            self.send_response(206)
        else:
            self.send_response(200)
        self.send_header("Content-Length", str(len(body) - start))
        self.end_headers()
        if self.path == "/slow":
            for offset in range(start, len(body), 65536):
                try:
                    self.wfile.write(body[offset : offset + 65536])
                    self.wfile.flush()
                except OSError:
                    return
                if offset >= 262144:
                    Host.gate.wait(10)  # holds here until the test lets it go on
            return
        self.wfile.write(body[start:])


@pytest.fixture
def host() -> Iterator[str]:
    Host.requests, Host.busy_left = [], 1
    Host.gate.clear()
    server = ThreadingHTTPServer(("127.0.0.1", 0), Host)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    Host.gate.set()
    server.shutdown()
    server.server_close()


def manager(**options: Any) -> tuple[DownloadManager, list[dict[str, Any]]]:
    events: list[dict[str, Any]] = []
    waits: list[float] = []
    made = DownloadManager(on_event=events.append, sleep=waits.append, **options)
    made.waits = waits  # type: ignore[attr-defined]
    return made, events


def until(condition: Any, timeout: float = 10.0) -> None:
    deadline = time.monotonic() + timeout
    while not condition():
        assert time.monotonic() < deadline, "the state did not come"
        time.sleep(0.005)


def test_a_file_is_fetched_verified_and_renamed_into_place(host: str, tmp_path: Path) -> None:
    downloads, events = manager()
    target = tmp_path / "checkpoints" / "model.safetensors"
    item = downloads.add("demo", f"{host}/ok", target, len(DATA), DIGEST, title="Demo model")
    assert downloads.wait()
    assert item.state == "installed" and target.read_bytes() == DATA and not item.part.exists()
    states = [e["state"] for e in events]
    assert states[0] == "queued" and "verifying" in states and states[-1] == "installed"
    shown = item.to_dict()
    assert shown == {
        "id": "demo",
        "title": "Demo model",
        "file": "model.safetensors",
        "state": "installed",
        "bytes": len(DATA),
        "done": len(DATA),
        "speed": 0,
        "seconds_left": None,
        "refusal": None,
    }
    assert str(tmp_path) not in str(shown)  # a page gets the file's name, not this computer's folder
    # asked again, the installed file is not fetched again
    assert downloads.add("demo", f"{host}/ok", target, len(DATA), DIGEST) is item
    assert len([p for p, _ in Host.requests if p == "/ok"]) == 1


def test_a_partial_file_is_resumed_where_it_ends(host: str, tmp_path: Path) -> None:
    """A download a killed process left behind: its ``.part`` is continued with ``Range`` and ends whole."""
    target = tmp_path / "model.safetensors"
    target.with_name("model.safetensors.part").write_bytes(DATA[:300_000])
    downloads, _ = manager()
    item = downloads.add("demo", f"{host}/ok", target, len(DATA), DIGEST)
    assert downloads.wait() and item.state == "installed" and target.read_bytes() == DATA
    assert Host.requests[-1][1]["range"] == "bytes=300000-"
    # a partial file longer than the file is no part of it: started anew
    other = tmp_path / "other.safetensors"
    other.with_name("other.safetensors.part").write_bytes(DATA + b"more")
    again = downloads.add("other", f"{host}/ok", other, len(DATA), DIGEST)
    assert downloads.wait() and again.state == "installed" and "range" not in Host.requests[-1][1]


def test_a_file_put_there_by_hand_is_verified_not_fetched(host: str, tmp_path: Path) -> None:
    target = tmp_path / "model.safetensors"
    target.write_bytes(DATA)
    downloads, _ = manager()
    item = downloads.add("demo", f"{host}/ok", target, len(DATA), DIGEST)
    assert downloads.wait() and item.state == "installed" and Host.requests == []


def test_pause_keeps_the_part_and_resume_goes_on_from_it(host: str, tmp_path: Path) -> None:
    downloads, _ = manager()
    target = tmp_path / "model.safetensors"
    item = downloads.add("demo", f"{host}/slow", target, len(DATA), DIGEST)
    until(lambda: item.done >= 262144)
    assert item.state == "downloading" and item.to_dict()["speed"] >= 0
    downloads.pause("demo")
    Host.gate.set()
    until(lambda: item.state == "paused")
    kept = item.part.stat().st_size
    assert 262144 <= kept < len(DATA) and not target.exists()
    downloads.resume("demo")
    assert downloads.wait() and item.state == "installed" and target.read_bytes() == DATA
    assert Host.requests[-1][1]["range"] == f"bytes={kept}-"


def test_cancel_leaves_a_part_that_the_next_start_resumes(host: str, tmp_path: Path) -> None:
    downloads, _ = manager()
    target = tmp_path / "model.safetensors"
    item = downloads.add("demo", f"{host}/slow", target, len(DATA), DIGEST)
    until(lambda: item.done >= 262144)
    downloads.cancel("demo")
    Host.gate.set()
    until(lambda: item.state == "cancelled")
    kept = item.part.stat().st_size
    assert kept >= 262144 and not target.exists()
    # the next start - also by a new manager, after a restart - goes on from the part
    later, _ = manager()
    again = later.add("demo", f"{host}/ok", target, len(DATA), DIGEST)
    assert later.wait() and again.state == "installed" and Host.requests[-1][1]["range"] == f"bytes={kept}-"


def test_a_waiting_file_is_paused_and_cancelled_at_once(host: str, tmp_path: Path) -> None:
    downloads, _ = manager(parallel=1)
    first = downloads.add("a", f"{host}/slow", tmp_path / "a.bin", len(DATA), DIGEST)
    second = downloads.add("b", f"{host}/ok", tmp_path / "b.bin", len(DATA), DIGEST)
    third = downloads.add("c", f"{host}/ok", tmp_path / "c.bin", len(DATA), DIGEST)
    until(lambda: first.done >= 262144)
    assert (second.state, third.state) == ("queued", "queued")  # one at a time here
    downloads.pause("b")
    downloads.cancel("c")
    assert (second.state, third.state) == ("paused", "cancelled")
    Host.gate.set()
    assert downloads.wait() and first.state == "installed" and not (tmp_path / "b.bin").exists()
    downloads.resume("b")
    assert downloads.wait() and second.state == "installed"
    assert [d["id"] for d in downloads.listing()] == ["a", "b", "c"]
    assert downloads.pause("nothing") is None and downloads.get("nothing") is None


def test_two_files_load_at_once_and_no_more(host: str, tmp_path: Path) -> None:
    downloads, _ = manager(parallel=2)
    items = [downloads.add(n, f"{host}/slow", tmp_path / f"{n}.bin", len(DATA), DIGEST) for n in "abc"]
    until(lambda: sum(i.state == "downloading" for i in items) == 2)
    time.sleep(0.05)
    assert sorted(i.state for i in items) == ["downloading", "downloading", "queued"]
    Host.gate.set()
    assert downloads.wait() and all(i.state == "installed" for i in items)


@pytest.mark.parametrize(
    ("path", "token", "manual", "state", "kind"),
    [
        ("/gated", None, False, "blocked", "gated"),
        ("/gated", "hf_secret", False, "blocked", "token"),
        ("/gated", "hf_secret", True, "blocked", "pending"),
        ("/moved", None, False, "blocked", "moved"),
        ("/damaged", None, False, "failed", "damaged"),
        ("/short", None, False, "failed", "damaged"),
    ],
)
def test_every_refusal_ends_in_a_state_with_words(
    path: str,
    token: str | None,
    manual: bool,
    state: str,
    kind: str,
    host: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(hub, "token_for", lambda url, value: value)  # the stand-in host may have the token
    downloads, events = manager(token=lambda: token)
    target = tmp_path / "model.safetensors"
    item = downloads.add("demo", f"{host}{path}", target, len(DATA), DIGEST, manual_approval=manual)
    assert downloads.wait()
    assert (item.state, item.refusal.kind if item.refusal else None) == (state, kind)
    assert item.refusal is not None and item.refusal.message and item.refusal.fix
    assert events[-1]["refusal"]["kind"] == kind
    assert not target.exists()
    if kind == "damaged":
        assert not item.part.exists()  # discarded: nothing damaged is resumed
    # nothing of a token is in what a page gets
    assert "hf_secret" not in str(events)


def test_a_busy_host_is_waited_for_and_then_the_file_comes(host: str, tmp_path: Path) -> None:
    downloads, events = manager()
    item = downloads.add("demo", f"{host}/busy", tmp_path / "model.bin", len(DATA), DIGEST)
    assert downloads.wait() and item.state == "installed"
    assert downloads.waits == [7.0]  # type: ignore[attr-defined] - what the host asked for
    assert any((e["refusal"] or {}).get("kind") == "busy" for e in events)
    assert item.refusal is None


def test_a_host_that_stays_busy_fails_and_can_be_tried_again(host: str, tmp_path: Path) -> None:
    Host.busy_left = 10
    downloads, _ = manager()
    item = downloads.add("demo", f"{host}/busy", tmp_path / "model.bin", len(DATA), DIGEST)
    assert downloads.wait()
    assert item.state == "failed" and item.refusal is not None and item.refusal.kind == "busy"
    Host.busy_left = 0
    downloads.resume("demo")
    assert downloads.wait() and item.state == "installed"


def test_no_connection_is_said_and_no_room_is_seen_before_a_byte_is_fetched(tmp_path: Path) -> None:
    downloads, _ = manager()
    gone = downloads.add("demo", "http://127.0.0.1:9/file", tmp_path / "model.bin", len(DATA), DIGEST)
    assert downloads.wait(30)
    assert gone.state == "failed" and gone.refusal is not None and gone.refusal.kind == "offline"
    full, _ = manager(free_bytes=lambda folder: 500_000)
    item = full.add("demo", "http://127.0.0.1:9/file", tmp_path / "other.bin", len(DATA), DIGEST)
    assert full.wait()
    assert item.state == "blocked" and item.refusal is not None and item.refusal.kind == "disk"
    assert "GB needed" in item.refusal.message and not item.part.exists()


def test_a_file_another_program_holds_is_tried_again_then_said(
    host: str, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.core.assets import downloads as module

    real = module.os.replace
    tries: list[int] = []

    def held(source: Any, target: Any) -> None:
        tries.append(1)
        if len(tries) < 3:
            raise PermissionError(13, "in use")
        real(source, target)

    monkeypatch.setattr(module.os, "replace", held)
    downloads, _ = manager()
    item = downloads.add("demo", f"{host}/ok", tmp_path / "model.bin", len(DATA), DIGEST)
    assert downloads.wait() and item.state == "installed" and len(tries) == 3
    assert downloads.waits == [2.0, 2.0]  # type: ignore[attr-defined]
    monkeypatch.setattr(
        module.os, "replace", lambda s, t: (_ for _ in ()).throw(PermissionError(13, "in use"))
    )
    stuck = downloads.add("other", f"{host}/ok", tmp_path / "other.bin", len(DATA), DIGEST)
    assert downloads.wait()
    assert stuck.state == "failed" and stuck.refusal is not None and stuck.refusal.kind == "locked"
    assert stuck.part.exists()  # the verified part stays: the next try only renames
