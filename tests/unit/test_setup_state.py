"""Plenio Setup's remembered state and the space check before a download (phase 4.2)."""

import json
from pathlib import Path

import pytest

from plenio.core.errors import PlenioUserError
from plenio.core.setup_state import (
    SPARE_BYTES,
    Drive,
    SetupState,
    read_state,
    room_problem,
    update,
    write_state,
)

TEMPLATES = ["1 · YuE2 · Song", "3 · MiniMax · Song"]


def test_a_missing_or_broken_file_starts_at_the_first_step(tmp_path: Path) -> None:
    assert read_state(tmp_path / "setup.json") == SetupState()
    (tmp_path / "setup.json").write_text("{not json", encoding="utf-8")
    assert read_state(tmp_path / "setup.json") == SetupState()
    (tmp_path / "setup.json").write_text(json.dumps({"schema": "other/9", "step": "go"}), encoding="utf-8")
    assert read_state(tmp_path / "setup.json") == SetupState()
    (tmp_path / "setup.json").write_text(
        json.dumps({"schema": "plenio.setup/1", "step": "nowhere"}), encoding="utf-8"
    )
    assert read_state(tmp_path / "setup.json") == SetupState()


def test_the_state_is_kept_and_read_back(tmp_path: Path) -> None:
    path = tmp_path / "plenio" / "setup.json"
    state = update(
        SetupState(), {"step": "plan", "templates": TEMPLATES[:1], "opened_for": "2.0.0"}, templates=TEMPLATES
    )
    write_state(path, state)
    assert read_state(path) == state
    assert not list(path.parent.glob("*.tmp"))
    assert json.loads(path.read_text(encoding="utf-8"))["schema"] == "plenio.setup/1"


@pytest.mark.parametrize(
    "request_body",
    [
        {"step": "elsewhere"},
        {"templates": "1 · YuE2 · Song"},
        {"templates": ["9 · Unknown"]},
        {"templates": [1]},
        {"done": "yes"},
        {"opened_for": 2},
        {"path": "C:/anything"},
    ],
)
def test_a_request_outside_the_state_is_refused_whole(request_body: dict[str, object]) -> None:
    with pytest.raises(PlenioUserError):
        update(SetupState(), {"step": "plan", **request_body}, templates=TEMPLATES)


def test_templates_are_kept_once_in_their_order() -> None:
    state = update(
        SetupState(), {"templates": [TEMPLATES[1], TEMPLATES[0], TEMPLATES[1]]}, templates=TEMPLATES
    )
    assert state.templates == (TEMPLATES[1], TEMPLATES[0])


def test_room_needs_the_files_and_two_gigabytes_on_each_drive() -> None:
    gib = 1024**3
    assert room_problem([Drive("D:/models", 30 * gib, 20 * gib)]) is None
    problem = room_problem([Drive("D:/models", 30 * gib, 20 * gib), Drive("E:/more", 11 * gib, 10 * gib)])
    assert problem is not None and "E:/more" in problem and "needed" in problem and "free" in problem
    assert room_problem([Drive("D:/models", 20 * gib + SPARE_BYTES - 1, 20 * gib)]) is not None
    assert (
        room_problem([Drive("D:/models", None, 20 * gib)]) is None
    )  # not measured: the manager checks again
    assert room_problem([Drive("D:/models", 0, 0)]) is None  # nothing to fetch there
