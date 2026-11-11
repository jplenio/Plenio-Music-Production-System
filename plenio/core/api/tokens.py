"""Tokens for the Song API from another computer (PD 8.5): made in Plenio Setup, shown once, kept only as their
SHA-256 in ``<user>/plenio/api/tokens.json`` with a name and the time last used.

A token is ``plenio_`` and 43 characters of 256 random bits; it is sent as ``Authorization: Bearer plenio_…`` and
never in a query string. Its check compares hashes in constant time; the time of last use is written at most once a
minute. Nothing here logs a token - only its id and name.

Standard library only.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import threading
import time
from collections.abc import Callable
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from ..errors import PlenioUserError
from ..files import atomic_write_text

SCHEMA = "plenio.api_tokens/1"
PREFIX = "plenio_"
MAX_TOKENS = 50
TOUCH_EVERY_S = 60.0


def _digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class Token:
    id: str
    name: str
    sha256: str
    created: float
    last_used: float | None = None

    def shown(self) -> dict[str, Any]:
        """What a page lists: never the hash."""
        return {"id": self.id, "name": self.name, "created": self.created, "last_used": self.last_used}


class TokenStore:
    def __init__(self, path: Path, *, clock: Callable[[], float] = time.time):
        self.path = path
        self.clock = clock
        self._lock = threading.Lock()
        self._tokens: dict[str, Token] = {}
        self._read()

    def _read(self) -> None:
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        if not isinstance(raw, dict) or raw.get("schema") != SCHEMA:
            return
        for item in raw.get("tokens") or []:
            try:
                token = Token(**{key: item[key] for key in Token.__dataclass_fields__ if key in item})
            except (TypeError, KeyError):
                continue
            self._tokens[token.id] = token

    def _write(self) -> None:
        data = {"schema": SCHEMA, "tokens": [asdict(t) for t in self._tokens.values()]}
        atomic_write_text(self.path, json.dumps(data, indent=1))

    def listing(self) -> list[dict[str, Any]]:
        return [t.shown() for t in sorted(self._tokens.values(), key=lambda t: t.created)]

    def create(self, name: str) -> tuple[str, Token]:
        """A new token named ``name``: the token itself (shown once) and what is kept of it."""
        clean = " ".join(str(name).split())[:60]
        if not clean:
            raise PlenioUserError("A token needs a name (who uses it: 'my DAW', 'party laptop').")
        with self._lock:
            if len(self._tokens) >= MAX_TOKENS:
                raise PlenioUserError(
                    f"There are {MAX_TOKENS} tokens already.", hint="Take back one you no longer use."
                )
            secret = PREFIX + secrets.token_urlsafe(32)
            token = Token(id=secrets.token_hex(6), name=clean, sha256=_digest(secret), created=self.clock())
            self._tokens[token.id] = token
            self._write()
        return secret, token

    def revoke(self, token_id: str) -> bool:
        with self._lock:
            if self._tokens.pop(token_id, None) is None:
                return False
            self._write()
            return True

    def check(self, presented: str) -> Token | None:
        """The token ``presented`` is (``None``: none) - compared by hash, every one of them, in constant time."""
        if not presented.startswith(PREFIX):
            return None
        digest = _digest(presented)
        found = None
        for token in list(self._tokens.values()):
            if hmac.compare_digest(token.sha256, digest):
                found = token
        if found is None:
            return None
        now = self.clock()
        if found.last_used is None or now - found.last_used >= TOUCH_EVERY_S:
            with self._lock:
                current = self._tokens.get(found.id)
                if current is not None:
                    found = Token(current.id, current.name, current.sha256, current.created, now)
                    self._tokens[found.id] = found
                    self._write()
        return found


def bearer(header: str | None) -> str:
    """The token of an ``Authorization: Bearer …`` header (empty: none)."""
    scheme, _, value = str(header or "").strip().partition(" ")
    return value.strip() if scheme.lower() == "bearer" else ""
