"""Who asks: a browser on this computer, or a request from the network - for what Plenio's routes in ComfyUI answer
only on the computer itself (the System Check's report names its folders; the Plenio Player button starts a program
on it). ComfyUI itself has no login: with ``--listen`` everyone in the network reaches its routes.

Every route of Plenio in ComfyUI has one **access class** (``CLASSES``), declared where the route is listed
(``Route``) and enforced in one place (``plenio.comfy.routes.guarded``); a test walks every route.

Standard library only (``plenio.comfy.routes`` passes aiohttp's request apart, so this is tested without it).
"""

from __future__ import annotations

import ipaddress
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass
from typing import Any

PASSED_ON = ("forwarded", "x-forwarded-for", "x-real-ip", "x-plenio-remote")
"""Headers of a request a proxy passed on - from another computer, whatever address it comes from. The Plenio
Player's gateways (*In your network*) say ``X-Plenio-Remote``; a browser's own value never gets through them."""


CLASSES: Mapping[str, str] = {
    "local": "answered to a browser or program on this computer only: the route describes or changes the "
    "computer itself (its folders and versions, a program started on it)",
    "compute": "answered to whoever reaches ComfyUI: the route reads only its request and writes nothing",
    "data": "answered to whoever reaches ComfyUI: the route reads or writes only inside ComfyUI's own folders, "
    "by names checked against them, and names no place on this computer",
    "api": "the Song API: answered to whoever reaches ComfyUI (2.0: another computer needs an API token)",
}
"""The access classes of Plenio's routes in ComfyUI and what each means."""


@dataclass(frozen=True)
class Route:
    """One HTTP route: its method, path and handler, and who is answered (``access``, one of ``CLASSES``).
    A ``local`` route says ``what`` it is and gives a ``hint`` for the request it refuses."""

    method: str
    path: str
    handler: Callable[..., Any]
    access: str
    what: str = ""
    hint: str = ""

    def __post_init__(self) -> None:
        if self.access not in CLASSES:
            raise ValueError(f"{self.method} {self.path}: no access class {self.access!r}")
        if self.access == "local" and not (self.what and self.hint):
            raise ValueError(f"{self.method} {self.path}: a local route says what it is and gives a hint")


def _address(text: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    # an IPv6 address may name its interface: fe80::1%eth0
    try:
        found = ipaddress.ip_address(text.split("%", 1)[0])
    except ValueError:
        return None
    if isinstance(found, ipaddress.IPv6Address) and found.ipv4_mapped is not None:
        return found.ipv4_mapped
    return found


def from_this_computer(peer: str | None, headers: Mapping[str, str], own: Iterable[str] = ()) -> bool:
    """A request of a browser on this computer: its connection comes from a loopback address - or from the address it
    was made to (``own``: a browser here that uses the computer's address in the network) - and no proxy passed it on.
    """
    address = _address(peer or "")
    if address is None:
        return False
    here = {found for found in (_address(text) for text in own) if found is not None}
    if not (address.is_loopback or address in here):
        return False
    names = {str(name).lower() for name in headers}
    return not any(name in names for name in PASSED_ON)
