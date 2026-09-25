"""Catalogue and fetching of Plenio-owned assets (files that are not ComfyUI model weights).

ComfyUI-format weights are never handled here: templates declare them in
``properties.models`` and ComfyUI's frontend downloads them. This module covers
files a Plenio node needs that ComfyUI does not know about (for example ASR
model folders for a worker). Assets are pinned to a repository revision and
fetched only when a node that needs them runs, under one global policy
(``PLENIO_AUTO_DOWNLOAD``, ``PLENIO_OFFLINE``).
"""

from .catalogue import Asset, AssetFile, load_catalogue
from .fetch import Fetcher, asset_folder, ensure_asset, http_fetch, missing_files

__all__ = [
    "Asset",
    "AssetFile",
    "Fetcher",
    "asset_folder",
    "ensure_asset",
    "http_fetch",
    "load_catalogue",
    "missing_files",
]
