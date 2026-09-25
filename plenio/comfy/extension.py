"""V3 entry point: node list, route registration and startup diagnostics."""

from __future__ import annotations

import logging

from comfy_api.latest import ComfyExtension, io

from .. import __version__
from ..core.dependencies import probe
from ..core.errors import PlenioError
from . import host, routes
from .nodes import NODES

log = logging.getLogger("plenio")


class PlenioExtension(ComfyExtension):
    async def on_load(self) -> None:
        host.register_model_folders()
        routes.register(host.prompt_server_routes())
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
