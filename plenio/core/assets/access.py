"""Access to a gated model: which step is open, and the Hugging Face token of this computer.

A gated model answers only an account that accepted its terms, through a token. Access is asked for in the
browser, on the model's page; Plenio cannot do it for the user - it can say **which step is open**
(:func:`check`) after each thing the user does: accept the terms, give this computer a token, wait for the
makers' approval.

The token is Hugging Face's own, kept where its tools keep it: Plenio reads it with ``huggingface_hub`` (the
environment's ``HF_TOKEN`` first) and saves one through ``huggingface_hub.login`` - never in a file of its own,
never in a log, never in an answer to a page.

Standard library only, plus ``huggingface_hub`` when it is installed (ComfyUI installs it).
"""

from __future__ import annotations

import re
import urllib.error
import urllib.request
from collections.abc import Callable, Mapping
from typing import Any

from ..dependencies import require
from ..errors import PlenioError, PlenioUserError
from . import hub

STEPS = ("ready", "accept", "token", "pending", "moved", "busy", "offline", "other")
"""What :func:`check` answers: ``ready`` - the file can be fetched; ``accept`` - the terms on the model's page;
``token`` - a token (or one with the right permission); ``pending`` - the makers' approval; the rest are the
refusals of ``plenio.core.assets.hub`` that are no step of the user's."""
TOKEN_PAGE = "https://huggingface.co/settings/tokens"
_TOKEN = re.compile(r"hf_[A-Za-z0-9]{20,}")
_ENVIRONMENT = ("HF_TOKEN", "HUGGING_FACE_HUB_TOKEN")


def looks_like_token(text: str) -> bool:
    """``text`` has the shape of a Hugging Face user token (``hf_...``)."""
    return _TOKEN.fullmatch(text.strip()) is not None


def read_token(env: Mapping[str, str] | None = None) -> str | None:
    """This computer's Hugging Face token: the environment's, else the one Hugging Face's tools saved
    (``None``: none, or ``huggingface_hub`` is not installed)."""
    import os

    for name in _ENVIRONMENT:
        value = (os.environ if env is None else env).get(name, "").strip()
        if value:
            return value
    try:
        found = require("huggingface_hub").get_token()
    except PlenioError:
        return None
    except Exception:  # noqa: BLE001 - a broken token store: as if there were none
        return None
    return str(found).strip() or None if found else None


def save_token(token: str) -> None:
    """Keep ``token`` as this computer's Hugging Face token (``huggingface_hub.login``: the hub checks it, then
    it is stored where Hugging Face's tools read it). A text that is no token is refused before anything is
    sent."""
    clean = token.strip()
    if not looks_like_token(clean):
        raise PlenioUserError(
            "That is no Hugging Face token.",
            hint=f"A token starts with hf_ - create one with read access at {TOKEN_PAGE} and paste it whole.",
        )
    library = require("huggingface_hub")
    try:
        library.login(token=clean, add_to_git_credential=False, skip_if_logged_in=False)
    except Exception as error:  # noqa: BLE001 - the library's own errors, said without the token
        raise PlenioUserError(
            "Hugging Face did not accept the token.",
            hint=f"It may be mistyped, expired or revoked: create a new one at {TOKEN_PAGE}. "
            f"({type(error).__name__})",
        ) from None


def model_page(url: str) -> str | None:
    """The page of the model a Hugging Face file URL belongs to - where its terms are accepted."""
    match = re.fullmatch(r"https://huggingface\.co/([\w.-]+/[\w.-]+)/resolve/.+", url)
    return f"https://huggingface.co/{match.group(1)}" if match else None


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args: Any, **kwargs: Any) -> None:
        return None


def _probe(request: urllib.request.Request) -> tuple[int, Mapping[str, str]]:
    """The host's own answer to a HEAD (a redirect to its storage is the answer: the file is granted)."""
    try:
        with urllib.request.build_opener(_NoRedirect).open(request, timeout=30) as answer:
            return int(answer.status), dict(answer.headers)
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers or {})


def check(
    url: str,
    token: str | None,
    *,
    manual_approval: bool = False,
    probe: Callable[[urllib.request.Request], tuple[int, Mapping[str, str]]] = _probe,
) -> dict[str, Any]:
    """Which step is open for the file at ``url``: ``{"step", "message", "fix", "page", "token_page"}``.
    One small request (a HEAD, the token only to its own host); nothing is downloaded."""
    request = hub.request_for(url, token)
    request.method = "HEAD"
    try:
        status, headers = probe(request)
    except (urllib.error.URLError, OSError) as error:
        refusal: hub.Refusal | None = hub.classify_error(error)
    else:
        refusal = hub.classify(
            status, headers, has_token=bool(hub.token_for(url, token)), manual_approval=manual_approval
        )
    page = model_page(url)
    if refusal is None:
        return {"step": "ready", "message": "This computer may fetch the file.", "fix": "", "page": page}
    step = {"gated": "accept"}.get(refusal.kind, refusal.kind)
    return {
        "step": step if step in STEPS else "other",
        "message": refusal.message,
        "fix": refusal.fix,
        "page": page,
        "token_page": TOKEN_PAGE,
    }
