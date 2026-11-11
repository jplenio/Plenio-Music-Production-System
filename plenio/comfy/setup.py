"""Plenio Setup's routes in ComfyUI: the model plan, downloads of catalogue files, the Hugging Face token.

All of the access class ``local`` (``plenio.core.access``): they describe this computer and write into its
model folders, so only a browser on the computer itself is answered. A download is asked for by the
catalogue's variant ids; the file goes into ComfyUI's own folder for it under its catalogued name
(``plenio.core.setup_plan``). The page hears of every change as a ``plenio.download`` message on ComfyUI's
websocket.
"""

from __future__ import annotations

import asyncio
import functools
import json
import os
import time
from collections.abc import Mapping
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

from aiohttp import web

from .. import __version__
from ..core.access import Route
from ..core.assets import access as hub_access
from ..core.assets import hub
from ..core.assets.downloads import DownloadManager
from ..core.errors import PlenioUserError
from ..core.modelplan import AUTO, Pick, pick
from ..core.models import Component, file_problem, load_components, take_inventory
from ..core.setup_plan import Wanted, download_request, find_variant, plan_view
from ..core.setup_state import TEST_SONG, Drive, read_state, room_problem, update, write_state
from ..core.song_api import SongApiError
from . import host
from .routes import guarded, read_json
from .shared import RESOURCES, model_catalogue, system_report

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


_TAKEN: dict[str, dict[str, dict[str, str]]] = {}
"""The file each Model Choice output, per run (prompt id -> node id -> component and file): what the release
record names - not the plan asked again, which a download or a pin made during the run could change."""
_RUNS_KEPT = 16


def note_taken(node_id: str, component: str, file: str) -> None:
    """Model Choice of the run that executes now output ``file``."""
    run = host.current_prompt_id()
    if not run or not node_id:
        return
    _TAKEN.setdefault(run, {})[node_id] = {"component": component, "file": file}
    for old in list(_TAKEN)[:-_RUNS_KEPT]:
        _TAKEN.pop(old, None)


def taken_in_this_run() -> dict[str, dict[str, str]]:
    return dict(_TAKEN.get(host.current_prompt_id(), {}))


def consumed(prompt: Mapping[str, Any], node_id: str) -> bool:
    """Another node of the prompt takes ``node_id``'s output (a Model Choice beside a bypassed loader does not)."""
    return any(
        isinstance(value, list) and len(value) == 2 and str(value[0]) == node_id
        for node in prompt.values()
        if isinstance(node, Mapping)
        for value in (node.get("inputs") or {}).values()
    )


def components() -> dict[str, Component]:
    """The catalogue's components by id (for Model Choice's lists)."""
    return _components()


@functools.lru_cache(maxsize=4096)
def _problem(accepts: str, path: str, _mtime_ns: int, _size: int) -> str | None:
    # keyed by the file's time and size: a header is read once per version of a file
    return file_problem(accepts, Path(path))


def problem_of(component: Component, file: str) -> str | None:
    """Why ``file`` in the component's folder would not load as it (``None``: it would, or it is not there)."""
    if not component.accepts or any(v.file == file for v in component.variants):
        return (
            None  # the catalogue's own files are the kind by definition (a packed fp4 file has other shapes)
        )
    path = host.locate_model(component.folder, file)
    if path is None:
        return None
    try:
        status = path.stat()
    except OSError:
        return None
    return _problem(component.accepts, str(path), status.st_mtime_ns, status.st_size)


def file_listing(component: Component) -> dict[str, str | None]:
    """Every file of the component's folder with what keeps it from loading as the component (``None``: nothing).
    File names only - no place on this computer."""
    return {name: problem_of(component, name) for name in sorted(host.model_files(component.folder))}


async def files_get(request: web.Request) -> web.StreamResponse:
    """For Model Choice's lists: per component the files of its folder, why a file would not load as it (the page
    marks those) and what ``auto`` takes on this computer (``pick``). ``?component=<id>`` for one."""
    found = _components()
    wanted = request.query.get("component")
    if wanted is not None and wanted not in found:
        raise PlenioUserError(f"Plenio's catalogue has no model {wanted[:80]!r}.")
    chosen = [found[wanted]] if wanted is not None else list(found.values())

    def pick_of(component: Component) -> dict[str, Any] | None:
        try:
            found = choose(component.id, AUTO)
        except Exception:  # noqa: BLE001 - the list still shows its files
            return None
        return {
            "file": found.pick.file,
            "reason": found.pick.reason,
            "warning": found.pick.warning,
            "installed": found.pick.installed,
            "source": found.source,
        }

    def listing() -> dict[str, Any]:
        return {c.id: {"folder": c.folder, "files": file_listing(c), "pick": pick_of(c)} for c in chosen}

    return web.json_response({"components": await asyncio.to_thread(listing)})


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
    problem = problem_of(component, chosen.file) if pinned and chosen.installed else None
    if problem:  # said, not refused: the header check may not know a new build that loads
        chosen = replace(chosen, warning=f"{chosen.file} is {problem} - its loader may refuse it.")
    return Chosen(chosen, component, source)


def _templates(components: Mapping[str, Component]) -> list[str]:
    return sorted({t for c in components.values() for t in (*c.templates, *c.optional_templates)})


def _folders(components: Mapping[str, Component]) -> dict[str, list[dict[str, Any]]]:
    """Per model folder name the folders ComfyUI registered for it, the download target first, each with its free
    space: Setup's step 3 shows the target and lets the user choose another of these."""
    out: dict[str, list[dict[str, Any]]] = {}
    for kind in sorted({c.folder for c in components.values()}):
        out[kind] = [
            {"path": str(folder), "free_bytes": host.drive_of(folder)[1], "target": index == 0}
            for index, folder in enumerate(host.model_folders(kind))
        ]
    return out


async def plan_get(request: web.Request) -> web.StreamResponse:
    """The model plan of every template: which file suits this computer and why, what is installed, what is still
    to fetch - and the downloads at work. No path: the folders are their own answer (``folders_get``)."""
    config = host.load_config()
    components = _components()
    templates = _templates(components)
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


def _source(url: str) -> str:
    """Where a catalogue file is fetched from: its address, or the same path on the mirror ``HF_ENDPOINT`` names."""
    return hub.mirrored(url, os.environ.get("HF_ENDPOINT"))


def fetch_now(component: Component, variant: Any, *, poll_s: float = 0.5) -> str | None:
    """Fetch one catalogue file while a run waits for it (``[models] downloads = "auto"``): ``None`` once it is
    installed and verified, else what kept it (a refusal in words). Interrupting the run cancels the download."""
    folder = host.model_folder(component.folder)
    if folder is None:
        return f"ComfyUI has no model folder '{component.folder}'."
    wanted = [Wanted(variant, component, folder / variant.file)]
    problem = _room(wanted)
    if problem:
        return problem
    item = manager().add(
        variant.id,
        _source(variant.url),
        wanted[0].target,
        variant.bytes,
        variant.sha256,
        title=f"{component.title} - {variant.file}",
        manual_approval=variant.manual_approval,
    )
    progress = host.Progress(100)
    while item.state in ("queued", "downloading", "verifying"):
        if host.is_interrupted():
            manager().cancel(variant.id)
            host.raise_if_interrupted()
        progress.update(item.done / item.size if item.size else 0.0)
        time.sleep(poll_s)
    if item.state == "installed":
        return None
    if item.refusal is not None:
        return f"{item.refusal.message} {item.refusal.fix}".strip()
    return f"The download stopped ({item.state})."


def _targets(chosen: Any, components: Mapping[str, Component]) -> dict[str, Path | None]:
    """The folder each kind of model goes to: ComfyUI's target, or one of its other registered folders the request
    chose (``{"folders": {"diffusion_models": "<a registered path>"}}``) - never another."""
    if chosen is not None and not (
        isinstance(chosen, dict) and all(isinstance(v, str) for v in chosen.values())
    ):
        raise PlenioUserError("'folders' maps a kind of model to one of its registered folders.")
    targets: dict[str, Path | None] = {}
    for kind in {c.folder for c in components.values()}:
        registered = host.model_folders(kind)
        targets[kind] = registered[0] if registered else None
        wanted = (chosen or {}).get(kind)
        if wanted is not None:
            match = [folder for folder in registered if str(folder) == wanted]
            if not match:
                raise PlenioUserError(
                    f"{wanted[:120]!r} is not a folder ComfyUI searches for {kind}.",
                    hint="Choose one of the folders the plan lists, or add yours to extra_model_paths.yaml first.",
                )
            targets[kind] = match[0]
    return targets


def _room(wanted: list[Any]) -> str | None:
    """Whether the files to fetch fit on their drives, with 2 GB to spare."""
    drives: dict[Any, Drive] = {}
    for item in wanted:
        if item.target.is_file() and item.target.stat().st_size == item.variant.bytes:
            continue  # there already: nothing to fetch
        device, free = host.drive_of(item.target.parent)
        key = device if device is not None else str(item.target.parent)
        known = drives.get(key)
        drives[key] = Drive(
            str(item.target.parent), free, (known.needed if known else 0) + item.variant.bytes
        )
    return room_problem(drives.values())


async def downloads_start(request: web.Request) -> web.StreamResponse:
    """Fetch catalogue files: ``{"variants": [<variant id>, ...], "folders": {<kind>: <registered folder>}}``
    (``folders`` optional). Refused before anything starts when the files do not fit on their drives."""
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
    folders = await asyncio.to_thread(_targets, data.get("folders"), components)
    request_files = download_request(data.get("variants"), components, folders)
    problem = await asyncio.to_thread(_room, request_files)
    if problem:
        raise PlenioUserError(
            problem, hint="Free some space, or choose another folder for these files in Plenio Setup's plan."
        )
    started = []
    for wanted in request_files:
        item = manager().add(
            wanted.variant.id,
            _source(wanted.variant.url),
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
        return hub_access.check(
            _source(variant.url), hub_access.read_token(), manual_approval=variant.manual_approval
        )

    found = await asyncio.to_thread(probe)
    return web.json_response({"variant": variant.id, **found})


async def folders_get(request: web.Request) -> web.StreamResponse:
    """The folders each kind of model can go to - the target first - with their free space (step 3)."""
    return web.json_response({"folders": await asyncio.to_thread(_folders, _components())})


def _state_file() -> Path:
    return host.user_directory() / "plenio" / "setup.json"


async def state_get(request: web.Request) -> web.StreamResponse:
    """Where Setup was (``<user>/plenio/setup.json``) and this Plenio's version."""
    state = await asyncio.to_thread(read_state, _state_file())
    return web.json_response({"state": state.to_dict(), "version": __version__})


async def state_post(request: web.Request) -> web.StreamResponse:
    """Change where Setup is: ``step``, ``templates``, ``opened_for``, ``done``."""
    data = await read_json(request)
    templates = _templates(_components())

    def change() -> Any:
        path = _state_file()
        state = update(read_state(path), data, templates=templates)
        write_state(path, state)
        return state

    state = await asyncio.to_thread(change)
    return web.json_response({"state": state.to_dict(), "version": __version__})


async def findings_get(request: web.Request) -> web.StreamResponse:
    """The System Check's findings with their fixes, and the facts Setup's first step shows."""
    report, _markdown = await asyncio.to_thread(system_report)
    facts = report.data["facts"]
    return web.json_response(
        {
            "status": report.status.value,
            "findings": report.data["findings"],
            "computer": {
                key: facts.get(key)
                for key in (
                    "comfyui",
                    "platform",
                    "devices",
                    "ram_total_bytes",
                    "disk_free_bytes",
                    "models_root",
                )
            },
            "templates": report.data.get("templates", []),
        }
    )


async def test_song_post(request: web.Request) -> web.StreamResponse:
    """Queue Setup's test song (``TEST_SONG``) through the Song API; the page follows it as a job of
    ``/plenio/api/v1/jobs``. A refusal (a model file ComfyUI does not find ...) is answered as the API answers it."""
    from . import song_api

    try:
        return await song_api.create_job(json.loads(json.dumps(TEST_SONG)))
    except SongApiError as error:
        return web.json_response({"error": error.to_dict()}, status=error.status)


async def report_post(request: web.Request) -> web.StreamResponse:
    """A problem report (PD 4.3): ``{"workflow": ..., "error": ..., "download": false}`` answers the cleaned files
    for the page to show; with ``"download": true`` the same as a zip."""
    from ..core.problem_report import report_files, zip_bytes

    data = await read_json(request)
    workflow = data.get("workflow") if isinstance(data.get("workflow"), dict) else None
    error = data.get("error") if isinstance(data.get("error"), dict) else None

    def build() -> dict[str, str]:
        _report, markdown = system_report()
        return report_files(
            system=markdown,
            log=host.log_lines(),
            error=error,
            workflow=workflow,
            home=str(Path.home()),
            version=__version__,
        )

    files = await asyncio.to_thread(build)
    if data.get("download") is True:
        return web.Response(
            body=zip_bytes(files),
            content_type="application/zip",
            headers={"Content-Disposition": 'attachment; filename="plenio-report.zip"'},
        )
    return web.json_response({"files": files})


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
    _local("GET", "/plenio/setup/state", state_get),
    _local("POST", "/plenio/setup/state", state_post),
    _local("GET", "/plenio/setup/findings", findings_get),
    _local("GET", "/plenio/setup/folders", folders_get),
    _local("POST", "/plenio/setup/test-song", test_song_post),
    _local("POST", "/plenio/setup/report", report_post),
    Route("GET", "/plenio/models/files", files_get, "data"),
)
"""Plenio Setup's routes, all ``local`` - and the file lists of Model Choice (``data``: file names only)."""


def register(routes: web.RouteTableDef) -> None:
    for route in ROUTES:
        routes.route(route.method, route.path)(guarded(route))
