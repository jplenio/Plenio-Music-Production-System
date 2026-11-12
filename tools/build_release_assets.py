"""Build the files attached to a GitHub release (docs/dev/release.md).

    python tools/build_release_assets.py [--out dist]

Needs comfy-cli (`python -m pip install comfy-cli`) and git. Writes into ``dist/v<version>/``:

- ``Plenio-Music-Production-System-v<version>.zip`` - the full download (ADR-0012): the Registry package
  (`comfy node pack`, so the same files as in the ComfyUI Manager) and the Studio add-on with the two start
  scripts, which ``.comfyignore`` leaves out of the Registry package, under one top folder, ready to unpack into
  ``ComfyUI/custom_nodes``;
- ``Plenio <template> v<version>.json`` - the six templates;
- ``SHA256SUMS.txt``.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
TOP = "Plenio-Music-Production-System"


def version() -> str:
    try:
        import tomllib
    except ModuleNotFoundError:  # Python 3.10
        import tomli as tomllib

    with open(PROJECT / "pyproject.toml", "rb") as handle:
        return str(tomllib.load(handle)["project"]["version"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", default=str(PROJECT / "dist"))
    args = parser.parse_args()
    comfy = shutil.which("comfy")
    if comfy is None:
        print("comfy-cli is missing: python -m pip install comfy-cli", file=sys.stderr)
        return 1
    tag = f"v{version()}"
    out = Path(args.out) / tag
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    env = {
        **os.environ,
        "GIT_CONFIG_COUNT": "1",
        "GIT_CONFIG_KEY_0": "core.quotePath",
        "GIT_CONFIG_VALUE_0": "false",
    }
    with tempfile.TemporaryDirectory() as scratch:
        packed = Path(scratch) / "node.zip"
        subprocess.run(  # noqa: S603 - fixed command
            [comfy, "--skip-prompt", "--no-enable-telemetry", "node", "pack"],
            cwd=PROJECT,
            env=env,
            check=True,
        )
        shutil.move(str(PROJECT / "node.zip"), packed)
        with (
            zipfile.ZipFile(packed) as source,
            zipfile.ZipFile(out / f"{TOP}-{tag}.zip", "w", zipfile.ZIP_DEFLATED) as zipped,
        ):
            names = [n for n in source.namelist() if not n.endswith("/")]
            for name in sorted(names):
                zipped.writestr(f"{TOP}/{name}", source.read(name))
            # the full download carries the Studio add-on (ADR-0012): the files git tracks of it
            tracked = (
                subprocess.run(  # noqa: S603, S607 - git, fixed arguments
                    ["git", "ls-files", "-z", "--", "plenio/addons", "Plenio Player.bat", "plenio_player.sh"],
                    cwd=PROJECT,
                    env=env,
                    capture_output=True,
                    check=True,
                )
                .stdout.decode()
                .split("\0")
            )
            addon = sorted(n for n in tracked if n and n not in names)
            for name in addon:
                zipped.write(PROJECT / name, f"{TOP}/{name}")
    if (
        not any(n.startswith("plenio/core/assets/") for n in names)
        or not any(n.startswith("subgraphs/") for n in names)
        or not any(n.startswith("plenio/addons/") for n in addon)
    ):
        print("the package is incomplete (see .comfyignore and [tool.comfy] includes)", file=sys.stderr)
        return 1
    for template in sorted((PROJECT / "example_workflows").glob("*.json")):
        shutil.copy(template, out / f"Plenio {template.stem} {tag}.json")
    sums = "".join(
        f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n" for path in sorted(out.iterdir())
    )
    (out / "SHA256SUMS.txt").write_text(sums, encoding="utf-8")
    print(
        f"wrote {len(list(out.iterdir()))} files ({len(names)} in the package, {len(addon)} of the add-on) to {out}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
