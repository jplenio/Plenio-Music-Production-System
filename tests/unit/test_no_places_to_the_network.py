"""What a request from the network gets names no place on this computer (the Registry's *information-disclosure*
class): Plenio's error answers keep a path's last two parts, a user template that cannot be read is named without
the error's text (an OSError's text is the file's absolute path), and Export Release names its record by its place
inside the output folder - ComfyUI keeps a node's output in ``/history``, which everyone who reaches it reads."""

from __future__ import annotations

import json
from pathlib import Path

from plenio.comfy import routes
from plenio.core.brief import TemplateLibrary
from plenio.core.errors import PlenioUserError

PLACE = r"C:\Users\ana\Documents\ComfyUI\output\plenio\Night Drive.plenio.json"


def body(response: object) -> dict[str, object]:
    return json.loads(response.text)["error"]  # type: ignore[attr-defined]


def test_an_error_answer_keeps_its_words_for_this_computer_and_no_place_for_the_network() -> None:
    error = PlenioUserError(
        f"The record {PLACE} cannot be read.", hint="Look in /home/ana/models/vae for it."
    )
    here = body(routes.error_response(error, here=True))
    assert PLACE in str(here["message"])  # this computer's own browser: as written
    away = body(routes.error_response(error, here=False))
    assert "ana" not in json.dumps(away) and "Users" not in json.dumps(away)
    assert "plenio/Night Drive.plenio.json" in str(away["message"]) and "models/vae" in str(away["hint"])


def test_a_bug_says_no_text_to_anyone() -> None:
    away = body(routes.error_response(OSError(13, "Permission denied", PLACE), here=False))
    assert away["type"] == "InternalError" and "ana" not in json.dumps(away)


def test_a_user_template_that_cannot_be_read_is_named_without_its_place(
    tmp_path: Path,
) -> None:
    folder = tmp_path / "user templates"
    folder.mkdir()
    broken = folder / "mine.md"
    broken.write_bytes(b"\xff\xfe not utf-8 \xff")
    library = TemplateLibrary(
        Path(__file__).resolve().parents[2] / "resources" / "templates", user_dir=folder
    )
    library.listing()  # reads the files
    reasons = dict(library.problems)
    assert "user/mine" in reasons
    assert reasons["user/mine"] == "the file could not be read (UnicodeDecodeError)"
    assert str(tmp_path) not in json.dumps(reasons)
