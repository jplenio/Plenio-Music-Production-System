"""V3 entry point: node list, route registration and startup diagnostics."""

from __future__ import annotations

import logging
import sys

from comfy_api.latest import ComfyExtension, io

from .. import __version__
from ..core import features
from ..core.dependencies import probe
from ..core.errors import PlenioError
from . import host, routes, song_api
from .nodes import NODES

log = logging.getLogger("plenio")


def remember_start() -> None:
    """How this ComfyUI was started - its Python, its main.py and the arguments (the models folder ...) - for the
    Plenio Player, which starts ComfyUI the same way when a song is ordered and none runs. Only where the
    player starts ComfyUI at all (the Studio add-on); the Comfy Registry package keeps nothing."""
    if not features.has("studio_launcher"):
        return
    from ..player.paths import state_dir

    try:
        features.load("studio_launcher").remember_start(state_dir(), list(sys.argv), sys.executable)
    except OSError as error:  # the player then starts it with its own settings only
        log.warning("Plenio: could not keep how ComfyUI was started for the player: %s", error)


class PlenioExtension(ComfyExtension):
    async def on_load(self) -> None:
        host.register_model_folders()
        remember_start()
        host.watch_runs()
        routes.register(host.prompt_server_routes())
        # the Song API: songs made by other programs, the Plenio Player first (docs/design/party-songs.md)
        song_api.register(host.prompt_server_routes())
        try:
            config = host.load_config()
        except PlenioError as error:
            # Nodes still register; they raise the same error when they need the configuration.
            log.error("Plenio configuration error: %s", error)
        else:
            log.info(
                "Plenio %s: offline=%s auto_download=%s", __version__, config.offline, config.auto_download
            )
        missing = sorted(name for name, version in probe().items() if version is None)
        if missing:
            log.warning(
                "Plenio: optional packages not installed: %s (see the System Check node)", ", ".join(missing)
            )

    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return list(NODES)


async def comfy_entrypoint() -> PlenioExtension:
    return PlenioExtension()
