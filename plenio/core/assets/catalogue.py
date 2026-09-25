"""The asset catalogue (``resources/assets.toml``, schema ``plenio.assets/1``)."""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from ..errors import PlenioUserError
from ..files import read_toml

CATALOGUE_SCHEMA = "plenio.assets/1"
_ID = re.compile(r"[a-z0-9][a-z0-9._-]*")
_REVISION = re.compile(r"[0-9a-f]{40}")


@dataclass(frozen=True)
class AssetFile:
    path: str
    size: int
    sha256: str | None = None


@dataclass(frozen=True)
class Asset:
    id: str
    kind: str
    repo: str
    revision: str
    licence: str
    description: str
    files: tuple[AssetFile, ...]

    @property
    def total_size(self) -> int:
        return sum(file.size for file in self.files)

    def url(self, file: AssetFile) -> str:
        return f"https://huggingface.co/{self.repo}/resolve/{self.revision}/{file.path}"


def _safe_relative(path: str, where: str) -> str:
    pure = PurePosixPath(path)
    if not path or pure.is_absolute() or ".." in pure.parts or "\\" in path or ":" in path:
        raise PlenioUserError(f"{where}: unsafe file path {path!r} in the asset catalogue.")
    return str(pure)


def parse_catalogue(data: Mapping[str, Any], source: str) -> dict[str, Asset]:
    if data.get("schema") != CATALOGUE_SCHEMA:
        raise PlenioUserError(f"{source}: expected schema {CATALOGUE_SCHEMA!r}, got {data.get('schema')!r}.")
    assets: dict[str, Asset] = {}
    for index, raw in enumerate(data.get("asset", [])):
        where = f"{source} asset #{index + 1}"
        try:
            asset_id = str(raw["id"])
            files = tuple(
                AssetFile(
                    path=_safe_relative(str(item["path"]), where),
                    size=int(item["size"]),
                    sha256=(str(item["sha256"]).lower() if item.get("sha256") else None),
                )
                for item in raw["files"]
            )
            asset = Asset(
                id=asset_id,
                kind=str(raw["kind"]),
                repo=str(raw["repo"]),
                revision=str(raw["revision"]),
                licence=str(raw["licence"]),
                description=str(raw.get("description", "")),
                files=files,
            )
        except (KeyError, TypeError, ValueError) as error:
            raise PlenioUserError(f"{where} is incomplete or malformed: {error!r}.") from error
        if not _ID.fullmatch(asset.id) or not _ID.fullmatch(asset.kind):
            raise PlenioUserError(f"{where}: id and kind must be lower-case identifiers.")
        if not _REVISION.fullmatch(asset.revision):
            raise PlenioUserError(f"{where}: revision must be a full 40-character commit hash (pinned).")
        if not asset.files or any(file.size <= 0 for file in asset.files):
            raise PlenioUserError(f"{where}: every asset needs files with a known size.")
        if asset.id in assets:
            raise PlenioUserError(f"{where}: duplicate asset id {asset.id!r}.")
        assets[asset.id] = asset
    return assets


def load_catalogue(path: Path) -> dict[str, Asset]:
    return parse_catalogue(read_toml(path), str(path))
