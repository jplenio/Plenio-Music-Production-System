"""What Plenio's routes in ComfyUI answer only on the computer itself (``core.access``) - ComfyUI has no login, so
with ``--listen`` everyone in the network reaches them - and what a route says of an error (``core.errors``): a
bug's text stays in the log, it can name this computer's folders."""

from __future__ import annotations

from plenio.core.access import from_this_computer
from plenio.core.errors import (
    INTERNAL_MESSAGE,
    PlenioAccessError,
    PlenioUserError,
    PlenioWorkerError,
    public_error,
)


def test_a_browser_on_this_computer_comes_from_a_loopback_address() -> None:
    for peer in ("127.0.0.1", "127.0.0.2", "::1", "::ffff:127.0.0.1"):
        assert from_this_computer(peer, {}), peer
    for peer in ("192.168.1.20", "10.0.0.5", "fe80::1%eth0", "", None, "localhost", "not an address"):
        assert not from_this_computer(peer, {}), peer
    # a browser here that uses the computer's own address in the network
    assert from_this_computer("192.168.1.5", {}, own=["192.168.1.5"])
    assert not from_this_computer("192.168.1.20", {}, own=["192.168.1.5"])


def test_a_request_a_proxy_passed_on_comes_from_the_network() -> None:
    """The Plenio Player's gateways (In your network) and other proxies connect from this computer itself."""
    for header in ("X-Plenio-Remote", "x-forwarded-for", "Forwarded", "X-Real-IP"):
        assert not from_this_computer("127.0.0.1", {header: "1"}), header
    assert from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", "Origin": "http://127.0.0.1:8188"})


def test_a_request_addressed_to_another_name_is_refused_though_it_comes_from_here() -> None:
    """DNS rebinding: a page whose name now points at 127.0.0.1 is same-origin for the browser and connects from
    loopback - but its Host header still names the page."""
    for host in ("127.0.0.1:8188", "localhost:8188", "LOCALHOST", "app.localhost:8188", "[::1]:8188", "::1"):
        assert from_this_computer("127.0.0.1", {"Host": host}), host
    for host in ("evil.example:8188", "evil.example", "192.168.1.20:8188", "", "127.0.0.1.evil.example"):
        assert not from_this_computer("127.0.0.1", {"Host": host}), host
    # the computer's own address and name, as a browser here may use them
    assert from_this_computer("192.168.1.5", {"Host": "192.168.1.5:8188"}, own=["192.168.1.5"])
    assert from_this_computer("127.0.0.1", {"Host": "studio-pc:8188"}, names=["Studio-PC"])
    assert not from_this_computer("127.0.0.1", {"Host": "other-pc:8188"}, names=["Studio-PC"])
    # a program without a Host header (HTTP/1.0) is still judged by its address
    assert from_this_computer("127.0.0.1", {})


def test_a_route_says_plenios_errors_as_written_and_a_bug_without_its_text() -> None:
    status, body = public_error(PlenioUserError("The record is gone.", hint="Choose another."))
    assert status == 400 and body["message"] == "The record is gone." and body["hint"] == "Choose another."
    status, body = public_error(PlenioAccessError("Only here."))
    assert status == 403 and body["type"] == "PlenioAccessError"
    status, body = public_error(PlenioWorkerError("The ASR stopped."))
    assert status == 500 and body["message"] == "The ASR stopped."
    secret = r"C:\Users\someone\ComfyUI\output\private\song.flac"
    status, body = public_error(FileNotFoundError(2, "No such file or directory", secret))
    assert status == 500 and body == {
        "type": "InternalError",
        "message": INTERNAL_MESSAGE,
        "hint": None,
        "details": {},
    }
    assert "someone" not in str(body)


def test_a_page_of_another_site_in_a_browser_here_is_not_this_computer() -> None:
    """Pre-review of phase 5: a website open in a browser on this computer can send to ComfyUI's address in the
    network - the peer is then this computer's own address; its Origin gives it away."""
    own = ["192.168.1.20"]
    lan = {"Host": "192.168.1.20:8188"}
    assert from_this_computer("192.168.1.20", {**lan, "Origin": "http://192.168.1.20:8188"}, own)
    assert from_this_computer("127.0.0.1", {"Host": "localhost:8188", "Origin": "http://localhost:8188"})
    assert not from_this_computer("192.168.1.20", {**lan, "Origin": "https://example.org"}, own)
    assert not from_this_computer(
        "192.168.1.20", {**lan, "Origin": "http://192.168.1.20:8799"}, own
    )  # another port
    assert not from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", "Origin": "null"})
    assert not from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", "Sec-Fetch-Site": "cross-site"})
    assert not from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", "Sec-Fetch-Site": "same-site"})
    assert from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", "Sec-Fetch-Site": "same-origin"})
    assert from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188"})  # a program: no Origin
