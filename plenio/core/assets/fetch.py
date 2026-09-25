"""Offline policy and resumable downloads for catalogue assets."""

from __future__ import annotations

import hashlib
import os
import urllib.error
import urllib.request
from collections.abc import Callable
from pathlib import Path
from typing import Protocol

from ..config import PlenioConfig
from ..errors import PlenioAssetError, PlenioCancelledError
from .catalogue import Asset, AssetFile

ProgressCallback = Callable[[int, int, str], None]
"""``(bytes_done, bytes_total, message)``."""

_CHUNK = 1 << 20


class Fetcher(Protocol):
    def __call__(
        self,
        url: str,
        destination: Path,
        expected_size: int,
        progress: ProgressCallback | None,
        is_cancelled: Callable[[], bool] | None,
    ) -> None: ...


def asset_folder(root: Path, asset: Asset) -> Path:
    """``<root>/<kind>/<id>`` - one folder per asset."""
    return root / asset.kind / asset.id


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(_CHUNK), b""):
            digest.update(block)
    return digest.hexdigest()


def missing_files(asset: Asset, folder: Path) -> list[AssetFile]:
    """Files that are absent or have the wrong size (hashes are checked after download only)."""
    result = []
    for file in asset.files:
        target = folder / file.path
        if not target.is_file() or target.stat().st_size != file.size:
            result.append(file)
    return result


def _manual_steps(asset: Asset, folder: Path, files: list[AssetFile]) -> str:
    listing = "; ".join(f"{file.path} ({file.size} bytes) from {asset.url(file)}" for file in files)
    return f"Place these files into {folder}: {listing}"


def ensure_asset(
    asset: Asset,
    root: Path,
    config: PlenioConfig,
    *,
    fetch: Fetcher | None = None,
    progress: ProgressCallback | None = None,
    is_cancelled: Callable[[], bool] | None = None,
) -> Path:
    """Return the asset folder, downloading missing files when the policy allows it."""
    folder = asset_folder(root, asset)
    todo = missing_files(asset, folder)
    if not todo:
        return folder
    size = sum(file.size for file in todo)
    what = f"The asset '{asset.id}' ({asset.description or asset.kind}, {size / 2**20:.1f} MiB, licence {asset.licence})"
    if config.offline:
        raise PlenioAssetError(
            f"{what} is missing and offline mode is on ({config.sources.get('offline', 'offline')}).",
            hint=_manual_steps(asset, folder, todo),
        )
    if not config.auto_download:
        raise PlenioAssetError(
            f"{what} is missing and automatic downloads are off (PLENIO_AUTO_DOWNLOAD=0).",
            hint=_manual_steps(asset, folder, todo),
        )
    fetch = fetch or http_fetch
    done = 0
    for file in todo:
        target = folder / file.path
        partial = target.with_name(target.name + ".part")
        target.parent.mkdir(parents=True, exist_ok=True)

        def report(current: int, total: int, message: str, _offset: int = done) -> None:
            if progress is not None:
                progress(_offset + current, size, message)

        fetch(asset.url(file), partial, file.size, report, is_cancelled)
        actual = partial.stat().st_size
        if actual != file.size:
            partial.unlink(missing_ok=True)
            raise PlenioAssetError(
                f"Download of {file.path} for '{asset.id}' has {actual} bytes, expected {file.size}.",
                hint="Run the node again to retry; if it keeps failing, place the file manually. "
                + _manual_steps(asset, folder, [file]),
            )
        if file.sha256 and _sha256_file(partial) != file.sha256:
            partial.unlink(missing_ok=True)
            raise PlenioAssetError(
                f"Download of {file.path} for '{asset.id}' does not match the pinned SHA-256.",
                hint="The file was corrupted or changed upstream. Run the node again to retry.",
            )
        os.replace(partial, target)
        done += file.size
    return folder


def http_fetch(
    url: str,
    destination: Path,
    expected_size: int,
    progress: ProgressCallback | None,
    is_cancelled: Callable[[], bool] | None,
) -> None:
    """Download ``url`` into ``destination``, resuming an existing partial file."""
    start = destination.stat().st_size if destination.exists() else 0
    if start > expected_size:
        destination.unlink()
        start = 0
    if start == expected_size:
        return
    request = urllib.request.Request(url, headers={"User-Agent": "plenio-assets/1"})
    if start:
        request.add_header("Range", f"bytes={start}-")
    try:
        response = urllib.request.urlopen(request, timeout=60)  # noqa: S310 - https URLs from the pinned catalogue
    except urllib.error.URLError as error:
        raise PlenioAssetError(
            f"Could not download {url}: {error}.",
            hint="Check the network connection, or place the file manually and enable offline mode.",
        ) from error
    with response:
        mode = "ab" if start and response.status == 206 else "wb"
        done = start if mode == "ab" else 0
        with destination.open(mode) as handle:
            while True:
                if is_cancelled is not None and is_cancelled():
                    raise PlenioCancelledError(
                        "Download cancelled; the partial file is kept and resumed next time."
                    )
                block = response.read(_CHUNK)
                if not block:
                    break
                handle.write(block)
                done += len(block)
                if progress is not None:
                    progress(done, expected_size, f"Downloading {destination.name}")
