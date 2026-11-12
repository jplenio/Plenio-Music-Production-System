"""The whole player from the network, and ComfyUI too (owner's request 2026-10-18: a simple link that opens the
complete player from any device in the home network whenever it runs - shown in the player - and ComfyUI in
the browser when it runs on the computer).

The player keeps listening on this computer only. *Open from your network* starts two small gateways of its
own on the network (ports 8780-8789): one passes requests on to the player, the other to the ComfyUI running
on this computer - which itself need not listen on the network (no ``--listen``). Both let in only a browser
that came with the link: its random part (``/<code>``) sets a cookie in that browser, and from then on the
address alone opens it - also ComfyUI's, on the same computer. Without it they answer with a short page
that says how to come in. *New link* makes another code; the old link and every browser let in by it are out.

A gateway reads a request's head, checks the cookie, and passes the request on with this computer's own
address as its host (ComfyUI and the player answer only requests addressed to themselves), the cookie taken
out and ``Connection: close``; then it passes the bytes both ways until the answer is done - a WebSocket
(ComfyUI's ``/ws``) stays open as long as it lasts. Requests that come this way say so (``X-Plenio-Remote``,
a browser's own value taken out): from the network, the player does everything but choose its folders, stop,
open folders on this computer's screen and delete songs for good (it retires them), and it names no folders of
this computer; ComfyUI ignores the header, and Plenio's routes in it answer what only this computer may ask -
the System Check's report, starting the player - as they answer ``--listen``: not from the network.

Standard library only.
"""

from __future__ import annotations

import hmac
import json
import os
import re
import secrets
import selectors
import socket
import socketserver
import threading
import time
import urllib.parse
from collections.abc import Callable
from pathlib import Path
from typing import Any

from .guest import ALL_NETWORKS, lan_addresses

PORTS = range(8780, 8790)
COOKIE = "plenio_net"
HEAD_LIMIT = 64 * 1024
IDLE = 15 * 60
"""Seconds a connection may stay quiet (a WebSocket of ComfyUI's waits long between messages)."""
FIND_EVERY = 5.0
DEFAULTS: dict[str, Any] = {"on": False, "token": "", "port": 0, "comfy_port": 0}
BAD_HEAD = re.compile(r"[\x00-\x08\x0a-\x1f\x7f]")
"""A head's lines hold no control character but a tab (CR and LF only between the lines)."""
TOKEN = re.compile(r"[!#$%&'*+.^_`|~0-9A-Za-z-]+")
"""A header's name, as HTTP has it (no space, no colon)."""
REMOTE_HEADER = "X-Plenio-Remote"
REMOTE_HOST_HEADER = "X-Plenio-Remote-Host"
REMOTE_PEER_HEADER = "X-Plenio-Remote-Peer"
"""The address the request came from (the gateway's socket peer): what limits wrong passwords - the Host header
is the browser's word and the same for every device."""
_HOP = {"connection", "keep-alive", "proxy-connection", "te", "trailer", "upgrade", "transfer-encoding"}


def new_token() -> str:
    """A code nobody guesses: 16 URL characters, about 96 bits."""
    return secrets.token_urlsafe(12)


DOOR = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plenio Player</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0910;color:#ddd;font:16px/1.5 system-ui,sans-serif">
<div style="max-width:520px;padding:24px"><h1 style="font-size:24px;color:#fff;margin:0 0 10px">{title}</h1><p>{text}</p></div></body></html>"""


def door(title: str, text: str) -> bytes:
    return DOOR.format(title=title, text=text).encode("utf-8")


class Head:
    """A request's first line and headers, as read from the socket (header names as sent, in order)."""

    def __init__(self, method: str, target: str, version: str, headers: list[tuple[str, str]]) -> None:
        self.method = method
        self.target = target
        self.version = version
        self.headers = headers

    def get(self, name: str) -> str:
        wanted = name.lower()
        return next((v for k, v in self.headers if k.lower() == wanted), "")

    def without(self, *names: str) -> list[tuple[str, str]]:
        drop = {n.lower() for n in names}
        return [(k, v) for k, v in self.headers if k.lower() not in drop]


def read_head(sock: socket.socket) -> tuple[Head, bytes] | None:
    """The request's head and whatever of its body came with it; ``None``: no request (or too large)."""
    data = b""
    while b"\r\n\r\n" not in data:
        if len(data) > HEAD_LIMIT:
            return None
        chunk = sock.recv(65536)
        if not chunk:
            return None
        data += chunk
    raw, rest = data.split(b"\r\n\r\n", 1)
    lines = raw.decode("latin-1").split("\r\n")
    # a lone CR or LF, a control character or a line without a name is refused: passed on, it could start a header
    # line of its own on the far side - the gateway's own X-Plenio-Remote among them (review of phase 6)
    if any(BAD_HEAD.search(line) for line in lines):
        return None
    parts = lines[0].split(" ")
    if len(parts) != 3 or not parts[2].startswith("HTTP/"):
        return None
    headers: list[tuple[str, str]] = []
    for line in lines[1:]:
        name, colon, value = line.partition(":")
        if not colon or not TOKEN.fullmatch(name):
            return None
        headers.append((name, value.strip()))
    return Head(parts[0], parts[1], parts[2], headers), rest


def cookie_value(header: str, name: str) -> str:
    for part in header.split(";"):
        key, _, value = part.strip().partition("=")
        if key == name:
            return value
    return ""


def without_cookie(header: str, name: str) -> str:
    return "; ".join(
        p.strip() for p in header.split(";") if p.strip() and p.strip().partition("=")[0] != name
    )


def forwarded_head(head: Head, target: tuple[str, int], *, remote: bool, peer: str = "") -> bytes:
    """The head passed on: addressed to ``target`` (and so the origin, when it was the gateway's own), the
    cookie of the way in taken out, the connection closed after the answer - unless it is a WebSocket."""
    here = head.get("Host")
    there = f"{target[0]}:{target[1]}"
    upgrade = head.get("Upgrade").lower() == "websocket"
    headers = head.without(
        "Host", REMOTE_HEADER, REMOTE_HOST_HEADER, REMOTE_PEER_HEADER, "Cookie", *([] if upgrade else _HOP)
    )
    out = [f"{head.method} {head.target} {head.version}", f"Host: {there}"]
    for name, value in headers:
        if name.lower() == "origin" and here and value in (f"http://{here}", f"https://{here}"):
            value = f"http://{there}"
        elif name.lower() == "referer" and here:
            value = re.sub(rf"^https?://{re.escape(here)}", f"http://{there}", value)
        out.append(f"{name}: {value}")
    cookies = without_cookie(head.get("Cookie"), COOKIE)
    if cookies:
        out.append(f"Cookie: {cookies}")
    if remote:
        out.append(f"{REMOTE_HEADER}: 1")
        out.append(f"{REMOTE_HOST_HEADER}: {here}")
        out.append(f"{REMOTE_PEER_HEADER}: {peer or 'network'}")
    if not upgrade:
        out.append("Connection: close")
    # a body sent in chunks keeps its framing (the header went with the hop-by-hop ones)
    if not upgrade and head.get("Transfer-Encoding"):
        out.append(f"Transfer-Encoding: {head.get('Transfer-Encoding')}")
    return ("\r\n".join(out) + "\r\n\r\n").encode("latin-1")


def pump(client: socket.socket, upstream: socket.socket) -> None:
    """Bytes both ways until the answer is done (the far side closes) or the line is quiet too long."""
    selector = selectors.DefaultSelector()
    selector.register(client, selectors.EVENT_READ, upstream)
    selector.register(upstream, selectors.EVENT_READ, client)
    open_ends = 2
    try:
        while open_ends:
            events = selector.select(IDLE)
            if not events:
                return
            for key, _ in events:
                source: socket.socket = key.fileobj  # type: ignore[assignment]
                sink: socket.socket = key.data
                try:
                    data = source.recv(65536)
                except OSError:
                    data = b""
                if not data:
                    if source is upstream:
                        return  # the answer is done
                    # the browser sent all it had: the request goes on, the answer still comes
                    selector.unregister(source)
                    open_ends -= 1
                    try:
                        upstream.shutdown(socket.SHUT_WR)
                    except OSError:
                        pass
                    continue
                try:
                    sink.sendall(data)
                except OSError:
                    return
    finally:
        selector.close()


class Gateway(socketserver.ThreadingTCPServer):
    """One gateway: requests with the way in's cookie passed on to ``target()`` (``None``: nothing to pass on
    to - the page ``missing`` answers)."""

    daemon_threads = True
    # As the player's own server: elsewhere the port is free again at once after a restart (its last
    # connections still waiting do not hold it, so the link keeps its port); on Windows SO_REUSEADDR would
    # let a second gateway take a port in use.
    allow_reuse_address = os.name != "nt"

    def __init__(
        self,
        address: tuple[str, int],
        access: NetworkAccess,
        target: Callable[[], tuple[str, int] | None],
        *,
        remote: bool,
        missing: bytes,
    ) -> None:
        self.access = access
        self.target = target
        self.remote = remote
        self.missing = missing
        super().__init__(address, GatewayHandler)


class GatewayHandler(socketserver.BaseRequestHandler):
    server: Gateway

    def answer(self, status: str, body: bytes, extra: list[tuple[str, str]] | None = None) -> None:
        lines = [
            f"HTTP/1.1 {status}",
            "Content-Type: text/html; charset=utf-8",
            f"Content-Length: {len(body)}",
        ]
        lines += ["Cache-Control: no-store", "Referrer-Policy: no-referrer", "Connection: close"]
        lines += [f"{k}: {v}" for k, v in extra or []]
        self.request.sendall(("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body)

    def handle(self) -> None:
        sock: socket.socket = self.request
        sock.settimeout(30)
        try:
            found = read_head(sock)
        except OSError:
            return
        if found is None:
            return
        head, rest = found
        access = self.server.access
        path = urllib.parse.urlsplit(head.target).path
        first, _, after = path.lstrip("/").partition("/")
        if access.token_ok(first):
            # the link: the cookie that lets this browser in, and on to the page
            query = urllib.parse.urlsplit(head.target).query
            where = "/" + after + (f"?{query}" if query else "")
            cookie = f"{COOKIE}={access.token}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax"
            return self.answer("302 Found", b"", [("Location", where), ("Set-Cookie", cookie)])
        if not access.token_ok(cookie_value(head.get("Cookie"), COOKIE)):
            text = (
                "This is the Plenio Player of a computer in this network. Open it with its link - "
                "Settings &gt; <b>In your network</b> on that computer shows it, with a QR code."
            )
            return self.answer("401 Unauthorized", door("Plenio Player", text))
        target = self.server.target()
        if target is None:
            return self.answer("503 Service Unavailable", self.server.missing)
        try:
            upstream = socket.create_connection(target, timeout=30)
        except OSError:
            return self.answer("503 Service Unavailable", self.server.missing)
        try:
            upstream.sendall(
                forwarded_head(head, target, remote=self.server.remote, peer=str(self.client_address[0]))
                + rest
            )
            sock.settimeout(None)
            upstream.settimeout(None)
            pump(sock, upstream)
        except OSError:
            pass
        finally:
            upstream.close()


class NetworkAccess:
    """The player and ComfyUI from the network: the settings (``network.json`` in the player's state folder),
    the two gateways, their addresses."""

    def __init__(
        self,
        directory: Path,
        player_port: Callable[[], int],
        comfyui: Callable[[], str | None],
        host: str = "0.0.0.0",  # noqa: S104 - meant for the network
    ) -> None:
        self.path = directory / "network.json"
        self.player_port = player_port
        self.comfyui = comfyui
        self.host = host
        self.lock = threading.Lock()
        self.settings = self._load()
        self.gateways: list[Gateway] = []
        self.error = ""
        self._found: tuple[float, tuple[str, int] | None] = (0.0, None)

    # --- settings --------------------------------------------------------------------------------------
    def _load(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            data = {}
        settings = {
            **DEFAULTS,
            **{k: v for k, v in (data if isinstance(data, dict) else {}).items() if k in DEFAULTS},
        }
        if not isinstance(settings["token"], str) or len(settings["token"]) < 12:
            settings["token"] = new_token()
        return settings

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(".tmp")
        temp.write_text(json.dumps(self.settings, indent=1), encoding="utf-8")
        temp.replace(self.path)

    @property
    def token(self) -> str:
        return str(self.settings["token"])

    def token_ok(self, token: str) -> bool:
        return (
            bool(self.settings["on"])
            and bool(token)
            and hmac.compare_digest(token.encode(), self.token.encode())
        )

    # --- the gateways ----------------------------------------------------------------------------------
    def comfyui_target(self) -> tuple[str, int] | None:
        """Where ComfyUI answers on this computer (looked for at most every few seconds)."""
        at, found = self._found
        if time.monotonic() - at < FIND_EVERY:
            return found
        url = self.comfyui()
        parts = urllib.parse.urlsplit(url) if url else None
        found = (parts.hostname or "127.0.0.1", parts.port or 80) if parts and parts.hostname else None
        self._found = (time.monotonic(), found)
        return found

    def resume(self) -> None:
        """At the player's start: on stays on (the same link, the same ports when they are free)."""
        if self.settings["on"]:
            with self.lock:
                self._start()

    def configure(self, changes: dict[str, Any]) -> dict[str, Any]:
        """Switch the access on or off, or make a new link (``regenerate``: the old one is out)."""
        with self.lock:
            if changes.get("regenerate"):
                self.settings["token"] = new_token()
            if "on" in changes:
                self.settings["on"] = bool(changes["on"])
            self._save()
            if self.settings["on"] and not self.gateways:
                self._start()
            elif not self.settings["on"] and self.gateways:
                self._stop()
        return self.status()

    def _bind(self, wanted: int, avoid: set[int], make: Callable[[int], Gateway]) -> Gateway | None:
        ports = ([wanted] if wanted and wanted not in avoid else []) + [
            p for p in PORTS if p != wanted and p not in avoid
        ]
        for port in ports:
            try:
                return make(port)
            except OSError:
                continue
        return None

    def _start(self) -> None:
        self.error = ""
        player = self._bind(
            int(self.settings.get("port") or 0),
            set(),
            lambda port: Gateway(
                (self.host, port),
                self,
                lambda: ("127.0.0.1", self.player_port()),
                remote=True,
                missing=door("Plenio Player", "The player does not answer just now - is it starting?"),
            ),
        )
        if player is None:
            self.error = f"no free port among {PORTS.start}-{PORTS.stop - 1}"
            self.settings["on"] = False
            self._save()
            return
        comfy = self._bind(
            int(self.settings.get("comfy_port") or 0),
            {player.server_address[1]},
            lambda port: Gateway(
                (self.host, port),
                self,
                self.comfyui_target,
                remote=True,
                missing=door(
                    "ComfyUI",
                    "ComfyUI is not running on the computer just now. Start it there, then reload this page.",
                ),
            ),
        )
        self.gateways = [g for g in (player, comfy) if g is not None]
        self.settings["port"] = player.server_address[1]
        self.settings["comfy_port"] = comfy.server_address[1] if comfy else 0
        self._save()
        for gateway in self.gateways:
            threading.Thread(target=gateway.serve_forever, daemon=True, name="plenio-network").start()

    def _stop(self) -> None:
        gateways, self.gateways = self.gateways, []
        for gateway in gateways:
            gateway.shutdown()
            gateway.server_close()

    def close(self) -> None:
        with self.lock:
            self._stop()

    def status(self, here: str = "") -> dict[str, Any]:
        """For the player's page: on, the links (with their code: they let a browser in) and the addresses of
        this computer; ``here``: the address a page came by from the network (its ComfyUI link uses it)."""
        running = bool(self.gateways)
        port = self.settings["port"]
        comfy = self.settings["comfy_port"]
        hosts = (lan_addresses() if self.host in ALL_NETWORKS else [self.host]) if running else []
        token = self.token
        urls = [f"http://{h}:{port}/{token}/" for h in hosts]
        comfy_urls = [f"http://{h}:{comfy}/{token}/" for h in hosts] if comfy else []
        here_host = here.rsplit(":", 1)[0] if here else ""
        return {
            "on": bool(self.settings["on"]) and running,
            "port": port,
            "comfy_port": comfy,
            "url": urls[0] if urls else "",
            "urls": urls,
            "comfyui_url": comfy_urls[0] if comfy_urls else "",
            "comfyui_urls": comfy_urls,
            # a page that came from the network opens ComfyUI by the address it came by (the cookie is there)
            "comfyui_here": f"http://{here_host}:{comfy}/" if here_host and comfy and running else "",
            "comfyui_running": self.comfyui_target() is not None,
            "error": self.error,
        }
