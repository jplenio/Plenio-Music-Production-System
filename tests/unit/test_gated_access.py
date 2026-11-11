"""Access to a gated model (``plenio.core.assets.access``): which step is open, with the host's recorded answers,
and this computer's Hugging Face token - read, saved through Hugging Face's own library, and never shown."""

from __future__ import annotations

import logging
import sys
import types
import urllib.error
import urllib.request
from typing import Any

import pytest

from plenio.core.assets import access
from plenio.core.errors import PlenioUserError

URL = "https://huggingface.co/org/model/resolve/0123456789abcdef0123456789abcdef01234567/model.safetensors"
GATED = {"X-Error-Code": "GatedRepo"}
TOKEN = "hf_" + "aB3" * 12


def probe(status: int, headers: dict[str, str] | None = None, seen: list[Any] | None = None) -> Any:
    def answer(request: urllib.request.Request) -> tuple[int, dict[str, str]]:
        if seen is not None:
            seen.append(request)
        return status, headers or {}

    return answer


def test_the_four_outcomes_of_a_gated_model() -> None:
    # nothing done yet: the terms on the model's page
    first = access.check(URL, None, probe=probe(401, GATED))
    assert first["step"] == "accept" and first["page"] == "https://huggingface.co/org/model"
    assert first["token_page"] == access.TOKEN_PAGE and "accept their terms" in first["message"]
    # a token, but its account has not accepted - or the token may not read gated models
    assert access.check(URL, TOKEN, probe=probe(403, GATED))["step"] == "token"
    # accepted, and the makers approve by hand
    waiting = access.check(URL, TOKEN, manual_approval=True, probe=probe(403, GATED))
    assert waiting["step"] == "pending" and "can take days" in waiting["message"]
    # granted: the host redirects to its storage (or answers the file)
    for status in (200, 302, 307):
        ready = access.check(URL, TOKEN, probe=probe(status))
        assert ready["step"] == "ready" and ready["fix"] == ""


def test_the_check_is_one_head_with_the_token_for_its_host_only() -> None:
    seen: list[urllib.request.Request] = []
    access.check(URL, TOKEN, probe=probe(302, seen=seen))
    assert [r.get_method() for r in seen] == ["HEAD"] and seen[0].get_header(
        "Authorization"
    ) == f"Bearer {TOKEN}"
    other = "https://github.com/org/repo/releases/download/v1/model.ckpt"
    answer = access.check(other, TOKEN, probe=probe(200, seen=seen))
    assert seen[1].get_header("Authorization") is None and answer["page"] is None


def test_other_refusals_are_named_and_never_a_step_of_the_users() -> None:
    assert access.check(URL, None, probe=probe(404))["step"] == "moved"
    assert access.check(URL, None, probe=probe(429, {"Retry-After": "3"}))["step"] == "busy"
    assert access.check(URL, None, probe=probe(500))["step"] == "other"

    def no_network(request: urllib.request.Request) -> tuple[int, dict[str, str]]:
        raise urllib.error.URLError("unreachable")

    assert access.check(URL, None, probe=no_network)["step"] == "offline"
    for status in (401, 403, 404, 429, 500):
        assert access.check(URL, None, probe=probe(status))["step"] in access.STEPS


def test_a_token_has_its_shape() -> None:
    assert access.looks_like_token(TOKEN) and access.looks_like_token(f"  {TOKEN}\n")
    for text in ("", "hf_short", "token", TOKEN.replace("hf_", "xx_"), TOKEN + " extra", "Bearer " + TOKEN):
        assert not access.looks_like_token(text), text


def fake_library(
    monkeypatch: pytest.MonkeyPatch, stored: str | None = None, refuse: bool = False
) -> list[Any]:
    calls: list[Any] = []
    module = types.ModuleType("huggingface_hub")

    def login(token: str | None = None, **options: Any) -> None:
        calls.append((token, options))
        if refuse:
            raise ValueError(f"Invalid user token {token}")  # a library's error may quote the token

    module.login = login  # type: ignore[attr-defined]
    module.get_token = lambda: stored  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "huggingface_hub", module)
    return calls


def test_the_token_is_read_from_the_environment_first_then_from_hugging_faces_store(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake_library(monkeypatch, stored="hf_stored_token_0123456789abcd")
    assert access.read_token({}) == "hf_stored_token_0123456789abcd"
    assert (
        access.read_token({"HF_TOKEN": " hf_from_environment_0123456789 "})
        == "hf_from_environment_0123456789"
    )
    assert access.read_token({"HUGGING_FACE_HUB_TOKEN": "hf_older_name_0123456789abcdef"}).startswith(
        "hf_older"
    )  # type: ignore[union-attr]
    fake_library(monkeypatch, stored=None)
    assert access.read_token({}) is None
    monkeypatch.setitem(sys.modules, "huggingface_hub", None)  # not installed
    assert access.read_token({}) is None


def test_a_token_is_saved_through_hugging_faces_library_and_never_shown(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture, capsys: pytest.CaptureFixture[str]
) -> None:
    caplog.set_level(logging.DEBUG)
    calls = fake_library(monkeypatch)
    access.save_token(f" {TOKEN} ")
    assert calls == [(TOKEN, {"add_to_git_credential": False, "skip_if_logged_in": False})]
    # what is no token is refused before anything is sent - and the text is not repeated
    with pytest.raises(PlenioUserError) as shape:
        access.save_token("my-password-123")
    assert len(calls) == 1 and "my-password-123" not in str(shape.value) + str(shape.value.hint)
    # a token the hub refuses: said without it, although the library's error quoted it
    calls = fake_library(monkeypatch, refuse=True)
    with pytest.raises(PlenioUserError) as refused:
        access.save_token(TOKEN)
    said = str(refused.value) + str(refused.value.hint) + repr(refused.value.__cause__)
    assert TOKEN not in said and "did not accept the token" in said and refused.value.__suppress_context__
    # nothing of a token in the log or on the console
    out = capsys.readouterr()
    assert TOKEN not in caplog.text and TOKEN not in out.out + out.err


def test_the_models_page_is_where_its_terms_are() -> None:
    assert access.model_page(URL) == "https://huggingface.co/org/model"
    assert access.model_page("https://github.com/org/repo/releases/download/v1/x.ckpt") is None
