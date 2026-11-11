"""Plenio Setup's routes in ComfyUI: the model plan, downloads of catalogue files, the Hugging Face token.

All of the access class ``local`` (``plenio.core.access``): they describe this computer and write into its
model folders, so only a browser on the computer itself is answered. A download is asked for by the
catalogue's variant ids; the file goes into ComfyUI's own folder for it under its catalogued name
(``plenio.core.setup_plan``). The page hears of every change as a ``plenio.download`` message on ComfyUI's
websocket.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, replace
from typing import Any

from aiohttp import web

from ..core.access import Route
from ..core.assets import access as hub_access
from ..core.assets.downloads import DownloadManager
from ..core.errors import PlenioUserError
from ..core.modelplan import AUTO, Pick, pick
from ..core.models import Component, load_components, take_inventory
from ..core.setup_plan import download_request, find_variant, plan_view
from . import host
from .routes import guarded, read_json
from .shared import RESOURCES, model_catalogue

EVENT = "plenio.download"
WHAT = "Plenio Setup reads this computer's model folders and writes into them"
HINT = "Open ComfyUI on the computer it runs on to set Plenio up; from here, 0 · System Check shows what is installed."

_manager: DownloadManager | None = None


def manager() -> DownloadManager:
    """The one download manager of this ComfyUI (made on first use)."""
    global _manager
    if _manager is None:
        _manager = DownloadManager(
            token=hub_access.read_token, on_event=lambda event: host.broadcast(EVENT, event)
        )
    return _manager


def _components() -> dict[str, Any]:
    return load_components(RESOURCES / "models.toml")


def _installed() -> dict[str, int]:
    return dict(take_inventory(model_catalogue(), host.locate_model).found)


def components() -> dict[str, Component]:
    """The catalogue's components by id (for Model Choice's lists)."""
    return _components()


@dataclass(frozen=True)
class Chosen:
    """Model Choice's answer: the plan's pick and where the choice came from."""

    pick: Pick
    component: Component
    source: str
    """``field`` (the node's own), ``config`` (a pin in config.toml) or ``plan``."""


def choose(component_id: str, file: str) -> Chosen:
    """The file for ``component_id`` on this computer now: the node's ``file`` when it is not ``auto``, else a
    pin of ``config.toml``, else the model plan with the configured preference. A pinned file that is in its
    folder counts as there whatever its size - it is the user's choice (another build, a finetune)."""
    found = _components()
    component = found.get(component_id)
    if component is None:
        raise PlenioUserError(
            f"Plenio's catalogue has no model {component_id!r}.",
            hint=f"Choose one of: {', '.join(found)}.",
        )
    config = host.load_config()
    if file and file != AUTO:
        pinned, source = file, "field"
    elif config.model_pins.get(component_id, AUTO) != AUTO:
        pinned, source = config.model_pins[component_id], "config"
    else:
        pinned, source = None, "plan"
    chosen = pick(
        component,
        vram_gib=host.active_vram_gib(),
        installed=_installed(),
        prefer=config.models_prefer,
        pinned=pinned,
    )
    if pinned and not chosen.installed and host.locate_model(component.folder, pinned) is not None:
        note = (
            f"{pinned} has another size than Plenio's catalogue says - used as your choice."
            if chosen.variant is not None
            else ""
        )
        chosen = replace(chosen, installed=True, warning=chosen.warning or note)
    return Chosen(chosen, component, source)


async def plan_get(request: web.Request) -> web.StreamResponse:
    """The model plan of every template: which file suits this computer and why, what is installed, what is still
    to fetch - and the downloads at work."""
    config = host.load_config()
    components = _components()
    templates = sorted({t for c in components.values() for t in (*c.templates, *c.optional_templates)})
    view = plan_view(
        components,
        templates,
        vram_gib=host.active_vram_gib(),
        installed=await asyncio.to_thread(_installed),
        prefer=config.models_prefer,
        pins=config.model_pins,
    )
    token = await asyncio.to_thread(hub_access.read_token)  # the token store is a file
    view.update(
        downloads=manager().listing(),
        policy={"downloads": config.model_downloads, "offline": config.offline},
        token=token is not None,  # whether there is one - never the token
    )
    return web.json_response(view)


async def downloads_start(request: web.Request) -> web.StreamResponse:
    """Fetch catalogue files: ``{"variants": [<variant id>, ...]}``."""
    config = host.load_config()
    if config.offline:
        raise PlenioUserError(
            "Offline mode is on: Plenio fetches nothing.",
            hint="Turn PLENIO_OFFLINE (or HF_HUB_OFFLINE) off, or place the files by hand - the plan names each "
            "file and its folder.",
        )
    if config.model_downloads == "off":
        raise PlenioUserError(
            'Downloads of model files are switched off ([models] downloads = "off").',
            hint='Set it to "ask" in Plenio\'s config.toml, or place the files by hand.',
        )
    data = await read_json(request)
    components = _components()
    folders = {c.folder: host.model_folder(c.folder) for c in components.values()}
    started = []
    for wanted in download_request(data.get("variants"), components, folders):
        item = manager().add(
            wanted.variant.id,
            wanted.variant.url,
            wanted.target,
            wanted.variant.bytes,
            wanted.variant.sha256,
            title=f"{wanted.component.title} - {wanted.variant.file}",
            manual_approval=wanted.variant.manual_approval,
        )
        started.append(item.to_dict())
    return web.json_response({"downloads": started})


async def downloads_list(request: web.Request) -> web.StreamResponse:
    return web.json_response({"downloads": manager().listing()})


def _acted(found: Any) -> web.StreamResponse:
    if found is None:
        raise PlenioUserError("No such download.", hint="Read the plan again: it lists the downloads.")
    return web.json_response({"download": found.to_dict()})


async def download_cancel(request: web.Request) -> web.StreamResponse:
    return _acted(manager().cancel(request.match_info["variant"]))


async def download_pause(request: web.Request) -> web.StreamResponse:
    return _acted(manager().pause(request.match_info["variant"]))


async def download_resume(request: web.Request) -> web.StreamResponse:
    return _acted(manager().resume(request.match_info["variant"]))


async def hub_token(request: web.Request) -> web.StreamResponse:
    """Keep a Hugging Face token for this computer (``{"token": "hf_..."}``): the hub checks it, Hugging Face's
    own library stores it. The answer says only that it is kept."""
    data = await read_json(request)
    token = data.get("token")
    if not isinstance(token, str):
        raise PlenioUserError("The request needs the 'token'.")
    await asyncio.to_thread(hub_access.save_token, token)
    return web.json_response({"saved": True})


async def access_check(request: web.Request) -> web.StreamResponse:
    """Which step is open before a catalogue file can be fetched (``{"variant": <id>}``): accept the terms, a
    token, the makers' approval - or nothing."""
    data = await read_json(request)
    variant = find_variant(data.get("variant"), _components())

    def probe() -> dict[str, Any]:
        return hub_access.check(variant.url, hub_access.read_token(), manual_approval=variant.manual_approval)

    found = await asyncio.to_thread(probe)
    return web.json_response({"variant": variant.id, **found})


def _local(method: str, path: str, handler: Any) -> Route:
    return Route(method, path, handler, "local", what=WHAT, hint=HINT)


ROUTES: tuple[Route, ...] = (
    _local("GET", "/plenio/setup/plan", plan_get),
    _local("GET", "/plenio/setup/downloads", downloads_list),
    _local("POST", "/plenio/setup/downloads", downloads_start),
    _local("DELETE", "/plenio/setup/downloads/{variant}", download_cancel),
    _local("POST", "/plenio/setup/downloads/{variant}/pause", download_pause),
    _local("POST", "/plenio/setup/downloads/{variant}/resume", download_resume),
    _local("POST", "/plenio/setup/hub-token", hub_token),
    _local("POST", "/plenio/setup/check", access_check),
)
"""Plenio Setup's routes: all ``local``."""


def register(routes: web.RouteTableDef) -> None:
    for route in ROUTES:
        routes.route(route.method, route.path)(guarded(route))
