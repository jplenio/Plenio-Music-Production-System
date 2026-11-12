"""A Plenio Player of 1.6.0 left its state; 2.0 reads it as it is (phase R4, rule 9 of the plan).

The fixture was made by the 1.6.0 player itself (``git archive c307d35``), over its own routes: two users made by
the admin (a co-host in the ``admin`` group, a listener), a playlist with a visual, a favourite, a tag, a rating and
settings. Every name, password and value is invented.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from plenio.player.accounts import Accounts
from plenio.player.server import State

FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "player" / "state-1.6.0"


def copied(tmp_path: Path) -> Path:
    folder = tmp_path / "state"
    shutil.copytree(FIXTURE, folder)
    return folder


def test_the_playlists_favourites_and_settings_of_1_6_are_read_as_they_were(tmp_path: Path) -> None:
    folder = copied(tmp_path)
    before = json.loads((FIXTURE / "state.json").read_text(encoding="utf-8"))
    data = State(folder / "state.json").read()
    for key in ("playlists", "favorites", "tags", "ratings", "settings"):
        assert data[key] == before[key], key
    assert data["playlists"][0]["name"] == "Test tones" and data["playlists"][0]["visual"] == "nova-aurora"


def test_the_users_of_1_6_log_in_with_their_passwords_and_keep_their_rights(tmp_path: Path) -> None:
    accounts = Accounts(copied(tmp_path))
    users = {u["name"]: u for u in accounts.users()}
    assert set(users) == {"Robin", "Sam"}
    token, robin = accounts.login(users["Robin"]["id"], "tone-check-1")
    assert token and robin["group"] == "admin"
    _, sam = accounts.login(users["Sam"]["id"], "tone-check-2")
    assert sam["group"] == "listener"
    # the admin group keeps the host's rights (2.0 calls it Co-host, D-9); a listener has none of them
    assert robin["helper"] is True and sam["helper"] is False
