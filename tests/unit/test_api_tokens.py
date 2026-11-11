"""Tokens for the Song API from another computer (phase 5.4)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.core.api.tokens import TOUCH_EVERY_S, TokenStore, bearer
from plenio.core.errors import PlenioUserError


class Clock:
    now = 1_000_000.0

    def __call__(self) -> float:
        return self.now


def test_a_token_is_kept_only_as_its_hash_and_listed_by_name(tmp_path: Path) -> None:
    store = TokenStore(tmp_path / "tokens.json", clock=Clock())
    secret, token = store.create("  my   DAW  ")
    assert secret.startswith("plenio_") and len(secret) > 40 and token.name == "my DAW"
    text = (tmp_path / "tokens.json").read_text(encoding="utf-8")
    assert secret not in text and token.sha256 in text
    assert store.listing() == [
        {"id": token.id, "name": "my DAW", "created": token.created, "last_used": None}
    ]
    assert "sha256" not in json.dumps(store.listing())


def test_a_token_is_checked_and_its_use_noted_once_a_minute(tmp_path: Path) -> None:
    clock = Clock()
    store = TokenStore(tmp_path / "tokens.json", clock=clock)
    secret, token = store.create("laptop")
    assert store.check(secret).id == token.id
    assert store.check("plenio_wrong") is None and store.check(secret[7:]) is None and store.check("") is None
    first = store.listing()[0]["last_used"]
    clock.now += 10
    store.check(secret)
    assert store.listing()[0]["last_used"] == first  # not written again within a minute
    clock.now += TOUCH_EVERY_S
    store.check(secret)
    assert store.listing()[0]["last_used"] == clock.now
    again = TokenStore(tmp_path / "tokens.json", clock=clock)
    assert again.check(secret).id == token.id  # kept across a restart


def test_a_revoked_token_no_longer_opens(tmp_path: Path) -> None:
    store = TokenStore(tmp_path / "tokens.json")
    secret, token = store.create("old script")
    assert store.revoke(token.id) and not store.revoke(token.id)
    assert store.check(secret) is None
    with pytest.raises(PlenioUserError):
        store.create("   ")


def test_the_bearer_header() -> None:
    assert bearer("Bearer plenio_abc") == "plenio_abc" and bearer("bearer  plenio_abc ") == "plenio_abc"
    assert bearer("Basic abc") == "" and bearer(None) == ""
