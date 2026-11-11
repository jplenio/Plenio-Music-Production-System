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


def host_name(value: str) -> str:
    """The name of a ``Host`` header without its port, lower-case (``[::1]:8188`` -> ``::1``)."""
    text = value.strip().lower()
    if text.startswith("["):
        return text[1:].partition("]")[0]
    if text.count(":") == 1:
        return text.partition(":")[0]
    return text  # a bare IPv6 address, or a name without a port


def _addressed_here(
    host: str, here: set[ipaddress.IPv4Address | ipaddress.IPv6Address], names: Iterable[str]
) -> bool:
    """The ``Host`` a request was sent to names this computer: a loopback address, ``localhost``, one of the
    computer's own addresses or names. A page whose name was turned to 127.0.0.1 (DNS rebinding) is same-origin
    for the browser - its ``Host`` still carries the page's own name, and is refused."""
    name = host_name(host)
    if not name:
        return False
    if name == "localhost" or name.endswith(".localhost"):
        return True
    address = _address(name)
    if address is not None:
        return address.is_loopback or address in here
    return name in {str(n).strip().lower() for n in names if str(n).strip()}


def from_this_computer(
    peer: str | None, headers: Mapping[str, str], own: Iterable[str] = (), names: Iterable[str] = ()
) -> bool:
    """A request of a browser on this computer: its connection comes from a loopback address - or from the address it
    was made to (``own``: a browser here that uses the computer's address in the network) -, no proxy passed it on,
    and its ``Host`` (when it has one) names this computer (``names``: the computer's own host names)."""
    address = _address(peer or "")
    if address is None:
        return False
    here = {found for found in (_address(text) for text in own) if found is not None}
    if not (address.is_loopback or address in here):
        return False
    lowered = {str(name).lower(): value for name, value in headers.items()}
    if any(name in lowered for name in PASSED_ON):
        return False
    host = lowered.get("host")
    return host is None or _addressed_here(str(host), here, names)
