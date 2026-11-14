"""Why a model host refused a download, in words (``plenio.core.assets.hub``) - and a Hugging Face token that
is never sent to another host, proven against two local servers."""

from __future__ import annotations

import errno
import threading
import urllib.error
import urllib.request
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

import pytest

from plenio.core.assets import hub

GATED = {"X-Error-Code": "GatedRepo", "X-Error-Message": "Access to model org/model is restricted."}


def test_the_file_or_a_redirect_to_it_is_no_refusal() -> None:
    for status in (200, 206, 302, 307):
        assert hub.classify(status, {}, has_token=False) is None


def test_a_gated_model_is_told_apart_by_what_the_user_has_done() -> None:
    first = hub.classify(401, GATED, has_token=False)
    assert first is not None and first.kind == "gated" and "accept their terms" in first.message
    # with a token the terms are the open step - or, where the makers approve by hand, their answer
    with_token = hub.classify(403, GATED, has_token=True)
    assert with_token is not None and with_token.kind == "token" and "gated repos" in with_token.fix
    waiting = hub.classify(403, GATED, has_token=True, manual_approval=True)
    assert waiting is not None and waiting.kind == "pending" and "can take days" in waiting.message
    # header names are matched whatever their case
    assert hub.classify(401, {"x-error-code": "GatedRepo"}, has_token=False).kind == "gated"  # type: ignore[union-attr]
    worded = hub.classify(
        403, {"X-Error-Message": "Access to this gated repo is restricted"}, has_token=False
    )
    assert worded is not None and worded.kind == "gated"


@pytest.mark.parametrize(
    ("status", "headers", "has_token", "kind", "said"),
    [
        (401, {}, False, "token", "needs a Hugging Face token"),
        (401, {}, True, "token", "missing, wrong or expired"),
        (403, {}, True, "token", "refuses this file for your account"),
        (404, {}, False, "moved", "catalogue needs an update"),
        (429, {"Retry-After": "40"}, False, "busy", "asks to wait 40 s"),
        (503, {}, False, "busy", "asks to wait a moment"),
        (500, {}, False, "other", "answered 500"),
    ],
)
def test_every_other_refusal_has_its_kind_and_its_words(
    status: int, headers: dict[str, str], has_token: bool, kind: str, said: str
) -> None:
    found = hub.classify(status, headers, has_token=has_token)
    assert found is not None and found.kind == kind and said in found.message and found.fix
    assert found.kind in hub.KINDS


def test_only_a_busy_host_is_waited_for() -> None:
    busy = hub.classify(429, {"retry-after": "12.5"}, has_token=False)
    assert busy is not None and busy.retries_by_itself and busy.retry_after == 12.5
    assert busy.to_dict() == {"kind": "busy", "message": busy.message, "fix": busy.fix, "retry_after": 12.5}
    moved = hub.classify(404, {}, has_token=False)
    assert moved is not None and not moved.retries_by_itself and "retry_after" not in moved.to_dict()


class SharingViolationError(PermissionError):
    """A Windows sharing violation (another program holds the file), on any system."""

    winerror = 32


def test_exceptions_are_refusals_too() -> None:
    assert hub.classify_error(urllib.error.URLError("no route")).kind == "offline"
    assert hub.classify_error(TimeoutError()).kind == "offline"
    assert hub.classify_error(ConnectionResetError()).kind == "offline"
    # a Windows sharing violation passes; any other PermissionError is a missing right, which no retry cures
    assert hub.classify_error(SharingViolationError(13, "in use")).kind == "locked"
    denied = hub.classify_error(PermissionError(13, "Permission denied"))
    assert denied.kind == "permission" and "Plenio Setup" in denied.fix and "/" not in denied.message
    assert hub.classify_error(OSError(errno.ENOSPC, "no space")).kind == "disk"
    http = urllib.error.HTTPError("https://huggingface.co/x", 401, "Unauthorized", GATED, None)  # type: ignore[arg-type]
    assert hub.classify_error(http).kind == "gated"
    assert hub.classify_error(ValueError("odd")).kind == "other"
    # an error's own text stays in the log: it can name this computer's folders
    other = hub.classify_error(OSError(5, "I/O error", "D:\\ComfyUI\\models\\x.part"))
    assert other.kind == "other" and "ComfyUI" not in other.message and "OSError" in other.message
    room = hub.no_room(24_100_000_000, 11_300_000_000, "D:")
    assert room.kind == "disk" and room.message == "24.1 GB needed, 11.3 GB free on D:."


def test_a_token_is_only_for_the_hub_over_https() -> None:
    assert hub.token_for("https://huggingface.co/org/m/resolve/abc/f.safetensors", "hf_x") == "hf_x"
    for url in (
        "http://huggingface.co/org/m/resolve/abc/f.safetensors",  # not encrypted
        "https://cdn-lfs.huggingface.co/repos/ab/cd",  # the hub's storage: needs none
        "https://huggingface.co.example.org/x",
        "https://github.com/org/repo/releases/download/v1/f.ckpt",
    ):
        assert hub.token_for(url, "hf_x") is None, url
    assert hub.token_for("https://huggingface.co/x", None) is None
    request = hub.request_for("https://huggingface.co/org/m/resolve/abc/f.bin", "hf_x", start=100)
    assert (
        request.get_header("Authorization") == "Bearer hf_x" and request.get_header("Range") == "bytes=100-"
    )
    plain = hub.request_for("https://github.com/org/repo/releases/download/v1/f.ckpt", "hf_x")
    assert plain.get_header("Authorization") is None and plain.get_header("Range") is None


# --- a redirect to another host: the token stays behind ------------------------------------------------------------


class Storage(BaseHTTPRequestHandler):
    seen: list[dict[str, str]] = []

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        pass

    def do_GET(self) -> None:  # noqa: N802
        Storage.seen.append({k.lower(): v for k, v in self.headers.items()})
        self.send_response(200)
        self.send_header("Content-Length", "4")
        self.end_headers()
        self.wfile.write(b"data")


class Front(BaseHTTPRequestHandler):
    target = ""
    seen: list[dict[str, str]] = []

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        pass

    def do_GET(self) -> None:  # noqa: N802
        Front.seen.append({k.lower(): v for k, v in self.headers.items()})
        self.send_response(302)
        self.send_header("Location", Front.target)
        self.send_header("Content-Length", "0")
        self.end_headers()


@pytest.fixture
def two_hosts() -> Iterator[tuple[str, str]]:
    """A front server that redirects to a storage server on another port (to urllib: another host)."""
    storage = ThreadingHTTPServer(("127.0.0.1", 0), Storage)
    front = ThreadingHTTPServer(("127.0.0.1", 0), Front)
    Storage.seen, Front.seen = [], []
    Front.target = f"http://127.0.0.1:{storage.server_address[1]}/blob"
    for server in (storage, front):
        threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://localhost:{front.server_address[1]}/file", Front.target
    for server in (storage, front):
        server.shutdown()
        server.server_close()


def test_a_redirect_to_another_host_does_not_carry_the_token(two_hosts: tuple[str, str]) -> None:
    url, _target = two_hosts
    request = urllib.request.Request(
        url, headers={"User-Agent": hub.AGENT, "Authorization": "Bearer hf_secret"}
    )  # noqa: S310
    with hub.opener().open(request, timeout=10) as answer:
        assert answer.read() == b"data"
    assert Front.seen[0]["authorization"] == "Bearer hf_secret"  # the host it was meant for
    assert len(Storage.seen) == 1 and "authorization" not in Storage.seen[0]
    assert Storage.seen[0]["user-agent"] == hub.AGENT  # everything else goes along
    # ... while urllib's own handler would have passed it on (what this handler is for)
    Storage.seen.clear()
    with urllib.request.build_opener().open(request, timeout=10) as answer:
        answer.read()
    assert Storage.seen[0].get("authorization") == "Bearer hf_secret"


def test_a_mirror_serves_the_same_path_and_never_gets_the_token() -> None:
    url = "https://huggingface.co/org/repo/resolve/0123/file.safetensors"
    assert (
        hub.mirrored(url, "http://127.0.0.1:9000/")
        == "http://127.0.0.1:9000/org/repo/resolve/0123/file.safetensors"
    )
    assert (
        hub.mirrored(url, "https://mirror.example/hf")
        == "https://mirror.example/hf/org/repo/resolve/0123/file.safetensors"
    )
    assert hub.mirrored(url, None) == url and hub.mirrored(url, "") == url
    for strange in ("file:///C:/x", "ftp://host", "http://host/?q=1", "not a url"):
        assert hub.mirrored(url, strange) == url
    release = "https://github.com/a/b/releases/download/v1/file.ckpt"
    assert hub.mirrored(release, "http://127.0.0.1:9000") == release  # only the hub's files
    assert hub.token_for(hub.mirrored(url, "https://mirror.example"), "hf_secret") is None
