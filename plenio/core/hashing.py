"""Canonical JSON and SHA-256 helpers used for document hashes and fingerprints."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def canonical_json(value: Any) -> str:
    """Serialise ``value`` deterministically (sorted keys, no whitespace, UTF-8 kept).

    Raises ``TypeError`` for values that are not plain JSON data, so that
    fingerprints never depend on ``repr`` of arbitrary objects.
    """
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def sha256_text(text: str) -> str:
    """Hex SHA-256 of the UTF-8 encoding of ``text``."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_json(value: Any) -> str:
    """Hex SHA-256 of ``canonical_json(value)``."""
    return sha256_text(canonical_json(value))


def short(digest: str, length: int = 12) -> str:
    """Abbreviated digest for display."""
    return digest[:length]
