"""Talking to a model host: why a download was refused, and a token that stays with its host.

A file of the catalogue comes from Hugging Face (or, two of them, from a GitHub release). When the host refuses,
the user should not be left with a number: :func:`classify` turns a status and its headers - and
:func:`classify_error` an exception - into a :class:`Refusal` that says in words what happened, which kind of
problem it is (the page chooses the fix by it) and whether waiting helps.

A Hugging Face token gives access to gated models. It is sent to ``huggingface.co`` only: the host answers a
file request with a redirect to a storage server, and :class:`HubRedirects` drops the ``Authorization`` header
whenever a redirect leaves the host the token was meant for.

Standard library only.
"""

from __future__ import annotations

import errno
import socket
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

HUB_HOST = "huggingface.co"
TOKEN_HOSTS = frozenset({HUB_HOST})
"""The hosts a Hugging Face token is sent to - and no other, whatever a redirect says."""
AGENT = "plenio-assets/2"

KINDS = (
    "gated",  # the model's makers ask for an agreement on its page
    "pending",  # the agreement was given; the makers have not approved yet
    "token",  # no token, or one that may not read this model
    "moved",  # the file is no longer at its address
    "busy",  # the host asks to wait
    "offline",  # no connection
    "disk",  # no room
    "damaged",  # the file that arrived is not the catalogue's
    "locked",  # another program holds the file
    "other",
)


@dataclass(frozen=True)
class Refusal:
    """Why a download did not happen: its ``kind`` (one of ``KINDS``), what to tell the user, what they can do,
    and - for ``busy`` - how many seconds the host asks to wait."""

    kind: str
    message: str
    fix: str = ""
    retry_after: float | None = None

    @property
    def retries_by_itself(self) -> bool:
        return self.kind == "busy"

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"kind": self.kind, "message": self.message, "fix": self.fix}
        if self.retry_after is not None:
            out["retry_after"] = self.retry_after
        return out


def _header(headers: Mapping[str, str], name: str) -> str:
    wanted = name.lower()
    return next((str(value) for key, value in headers.items() if str(key).lower() == wanted), "")


def _seconds(text: str) -> float | None:
    try:
        return max(0.0, float(text))
    except ValueError:
        return None


def classify(
    status: int,
    headers: Mapping[str, str],
    *,
    has_token: bool,
    manual_approval: bool = False,
    host: str = HUB_HOST,
) -> Refusal | None:
    """The refusal a host's answer means (``None``: the answer is the file, or a redirect to it).
    ``has_token``: the request carried a token; ``manual_approval``: the catalogue says the model's makers
    approve each request by hand."""
    if status < 400:
        return None
    code = _header(headers, "X-Error-Code")
    if code == "GatedRepo" or (status == 403 and "gated" in _header(headers, "X-Error-Message").lower()):
        if not has_token:
            return Refusal(
                "gated",
                "This model's makers ask you to accept their terms once, on the model's page.",
                "Open the model's page, accept the terms, then give this computer a Hugging Face token.",
            )
        if manual_approval:
            return Refusal(
                "pending",
                "Your request is with the model's makers. They approve each request by hand - this can take days.",
                "Check again later, or use another variant of this model that needs no approval.",
            )
        return Refusal(
            "token",
            "Your Hugging Face token may not read this model: its terms are not accepted with this account, or "
            "the token lacks the permission.",
            "Accept the terms on the model's page with the account the token belongs to; a fine-grained token "
            'needs "Read access to contents of all public gated repos you can access".',
        )
    if status == 401:
        return Refusal(
            "token",
            "The host asks who you are: your Hugging Face token is missing, wrong or expired."
            if has_token
            else "The host asks who you are: this file needs a Hugging Face token.",
            "Create a token with read access on the token page and enter it in Plenio Setup.",
        )
    if status in (404, 410):
        return Refusal(
            "moved",
            "The file is no longer at its address. Plenio's catalogue needs an update.",
            "Update Plenio; if it is up to date, report it - the report names the file.",
        )
    if status == 429 or status == 503:
        wait = _seconds(_header(headers, "Retry-After"))
        asked = f" {wait:.0f} s" if wait is not None else " a moment"
        return Refusal(
            "busy", f"{host} asks to wait{asked}.", "Plenio waits and tries again by itself.", wait
        )
    if status == 403:
        return Refusal(
            "token",
            "The host refuses this file for your account.",
            "Open the model's page while logged in: it says whether an agreement or an approval is missing.",
        )
    return Refusal("other", f"{host} answered {status}.", "Try again; if it stays, report it.")


def classify_error(error: BaseException, *, host: str = HUB_HOST) -> Refusal:
    """The refusal an exception of a download means."""
    if isinstance(error, urllib.error.HTTPError):
        found = classify(error.code, dict(error.headers or {}), has_token=False, host=host)
        if found is not None:
            return found
    if isinstance(error, PermissionError):
        return Refusal(
            "locked",
            "Another program is using the file (often a virus scanner, for a moment).",
            "Try again in a few seconds.",
        )
    if isinstance(error, OSError) and error.errno == errno.ENOSPC:
        return Refusal("disk", "The disk is full.", "Free some room, or choose another folder.")
    if isinstance(error, urllib.error.URLError | socket.timeout | TimeoutError | ConnectionError):
        return Refusal(
            "offline",
            f"No connection to {host}.",
            "Check the network (a proxy, a firewall); the file can also be placed by hand - its folder and "
            "address are shown.",
        )
    return Refusal("other", f"The download failed: {error}", "Try again; if it stays, report it.")


def no_room(needed: int, free: int, where: str) -> Refusal:
    """The refusal for a download that would not fit (checked before it starts)."""
    return Refusal(
        "disk",
        f"{needed / 1e9:.1f} GB needed, {free / 1e9:.1f} GB free on {where}.",
        "Free some room, or choose another model folder.",
    )


def token_for(url: str, token: str | None) -> str | None:
    """``token`` when ``url`` is on a host it may be sent to (https only), else ``None``."""
    parts = urllib.parse.urlsplit(url)
    if not token or parts.scheme != "https" or (parts.hostname or "").lower() not in TOKEN_HOSTS:
        return None
    return token


class HubRedirects(urllib.request.HTTPRedirectHandler):
    """Follows a host's redirects, but never carries ``Authorization`` to another host: the hub redirects a
    file to a storage server, which needs no token and must not get one."""

    def redirect_request(
        self, req: urllib.request.Request, fp: Any, code: int, msg: str, headers: Any, newurl: str
    ) -> urllib.request.Request | None:
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new is None:
            return None
        before = (urllib.parse.urlsplit(req.full_url).hostname or "").lower()
        after = urllib.parse.urlsplit(newurl)
        if (after.hostname or "").lower() != before or after.scheme != "https":
            for name in list(new.headers):
                if name.lower() == "authorization":
                    del new.headers[name]
            new.unredirected_hdrs.pop("Authorization", None)
        return new


def request_for(url: str, token: str | None = None, *, start: int = 0) -> urllib.request.Request:
    """A GET for ``url``: the token only for its own host, a ``Range`` to resume at ``start``."""
    request = urllib.request.Request(url, headers={"User-Agent": AGENT})  # noqa: S310 - catalogue URLs (https)
    allowed = token_for(url, token)
    if allowed:
        request.add_header("Authorization", f"Bearer {allowed}")
    if start:
        request.add_header("Range", f"bytes={start}-")
    return request


def opener() -> urllib.request.OpenerDirector:
    """An opener that follows redirects with :class:`HubRedirects`."""
    return urllib.request.build_opener(HubRedirects)
