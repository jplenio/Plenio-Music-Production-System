"""A throttled stand-in for Hugging Face, for Plenio Setup's checks without real downloads.

``serve(port, ...)`` answers ``GET``/``HEAD`` of a Hugging Face file path (``/<repo>/resolve/<rev>/<file>``) with
small deterministic bytes made from the file's name (resumable with ``Range``), at a set speed; file names in
``gated`` answer ``401`` with ``X-Error-Code: GatedRepo`` as the hub does. ``rewrite_catalogue(path)`` makes a
*copy* of ``resources/models.toml`` expect those bytes (``bytes`` and ``sha256``; the addresses stay). Plenio
reaches the stand-in as a mirror (``HF_ENDPOINT``). Used by ``tools/dev_server.py --fake-hub``; never by the
package.
"""

from __future__ import annotations

import hashlib
import http.server
import re
import threading
import time
from pathlib import Path

SIZE = 3 * 2**20
"""Bytes of every fake file: enough for a progress bar to move."""


def content(file: str, size: int = SIZE) -> bytes:
    seed = hashlib.sha256(file.encode()).digest()
    return (seed * (size // len(seed) + 1))[:size]


def serve(
    port: int, *, bytes_per_second: int = 512 * 1024, gated: frozenset[str] = frozenset()
) -> http.server.ThreadingHTTPServer:
    """Start the stand-in in a thread; ``.shutdown()`` stops it."""

    class Hub(http.server.BaseHTTPRequestHandler):
        def log_message(self, *args: object) -> None:  # quiet
            pass

        def _answer(self, body: bool) -> None:
            file = self.path.split("?")[0].rstrip("/").rsplit("/", 1)[-1]
            if file in gated:
                self.send_response(401)
                self.send_header("X-Error-Code", "GatedRepo")
                self.send_header("X-Error-Message", "Access to this model is restricted. Please log in.")
                self.end_headers()
                return
            data = content(file)
            start = 0
            match = re.match(r"bytes=(\d+)-", self.headers.get("Range", ""))
            if match:
                start = int(match.group(1))
                self.send_response(206)
                self.send_header("Content-Range", f"bytes {start}-{len(data) - 1}/{len(data)}")
            else:
                self.send_response(200)
            self.send_header("Content-Length", str(len(data) - start))
            self.end_headers()
            if not body:
                return
            chunk = max(1, bytes_per_second // 10)
            for offset in range(start, len(data), chunk):
                try:
                    self.wfile.write(data[offset : offset + chunk])
                except OSError:
                    return
                time.sleep(0.1)

        def do_GET(self) -> None:  # noqa: N802 - the server's name
            self._answer(True)

        def do_HEAD(self) -> None:  # noqa: N802 - the server's name
            self._answer(False)

    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Hub)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def rewrite_catalogue(path: Path) -> list[str]:
    """Make every variant of the catalogue copy at ``path`` expect the stand-in's bytes; returns the file names."""
    text = path.read_text(encoding="utf-8")
    files: list[str] = []

    def variant(block: str) -> str:
        found = re.search(r'^\s*file = "([^"]+)"', block, flags=re.M)
        if not found:
            return block
        files.append(found.group(1))
        data = content(found.group(1))
        block = re.sub(r"^(\s*bytes = )\d+", rf"\g<1>{len(data)}", block, flags=re.M)
        return re.sub(
            r'^(\s*sha256 = )"[0-9a-f]+"', rf'\g<1>"{hashlib.sha256(data).hexdigest()}"', block, flags=re.M
        )

    parts = re.split(r"(?=^\s*\[\[component\.variant\]\])", text, flags=re.M)
    path.write_text(
        "".join(variant(part) if "[[component.variant]]" in part else part for part in parts),
        encoding="utf-8",
    )
    return files
