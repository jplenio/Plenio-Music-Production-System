"""What a request from the network gets names no place on this computer (the Registry's *information-disclosure*
class): Plenio's error answers keep a path's last two parts, a user template that cannot be read is named without
the error's text (an OSError's text is the file's absolute path), and Export Release names its record by its place
inside the output folder - ComfyUI keeps a node's output in ``/history``, which everyone who reaches it reads."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

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


def test_a_text_for_the_network_has_no_home_folder_no_user_name_and_short_paths(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plenio.core import problem_report

    monkeypatch.setattr(problem_report, "_home", lambda: r"C:\Users\Ana Maria")
    text = problem_report.for_the_network(
        r"no file in C:\Users\Ana Maria\ComfyUI\models\vae, D:\AI\ComfyUI\models\checkpoints\x.safetensors"
    )
    assert "Ana" not in text and "Maria" not in text and r"D:\AI" not in text
    assert "models/vae" in text and "checkpoints/x.safetensors" in text
    reason = problem_report.public_reason(PermissionError(13, "Permission denied", PLACE))
    assert (
        reason.startswith("PermissionError: ") and "ana" not in reason and "Night Drive.plenio.json" in reason
    )


@pytest.mark.parametrize(
    "header",
    ["Forwarded", "X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto", "X-Real-IP", "X-Client-IP",
     "True-Client-IP", "CF-Connecting-IP", "Via"],
)  # fmt: skip
def test_a_request_a_proxy_passed_on_is_not_from_this_computer(header: str) -> None:
    from plenio.core.access import from_this_computer

    assert from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188"})
    assert not from_this_computer("127.0.0.1", {"Host": "127.0.0.1:8188", header: "192.168.1.20"})


def test_the_llama_server_answers_plenio_and_no_web_page() -> None:
    """The fallback LLM server (llama-cpp-python) listens on a loopback port while it runs: a web page may send it a
    text/plain POST or reach it by DNS rebinding - it answers neither, and runs no model for them."""
    import http.client
    import threading
    from http.server import ThreadingHTTPServer

    from plenio.workers import llama_http

    server = ThreadingHTTPServer(("127.0.0.1", 0), llama_http._Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]

    def ask(method: str, path: str, headers: dict[str, str], body: bytes | None = None) -> int:
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
        connection.request(method, path, body=body, headers=headers)
        status = connection.getresponse().status
        connection.close()
        return status

    try:
        own = {"Host": f"127.0.0.1:{port}"}
        assert ask("GET", "/v1/models", own) == 200
        # Plenio's client: JSON to the loopback address (no model loaded here: 503, not 403)
        assert ask("POST", "/v1/chat/completions", {**own, "Content-Type": "application/json"}, b"{}") == 503
        page = {**own, "Origin": "http://example.com"}
        assert ask("GET", "/v1/models", page) == 403
        assert ask("POST", "/v1/chat/completions", {**own, "Content-Type": "text/plain"}, b"{}") == 403
        assert ask("GET", "/health", {"Host": f"rebound.example:{port}"}) == 403
    finally:
        server.shutdown()
        server.server_close()
