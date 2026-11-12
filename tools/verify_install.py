"""After a release (R1): install the published package into a fresh ComfyUI the way a user does, start it, and check
that it registers what the facts say - every node, the templates, the blueprints - with no import error, and that
the Studio add-on is not in it.

    python tools/verify_install.py --comfyui <a ComfyUI checkout> --version 2.0.0 [--zip <a packed zip>]

Without ``--zip`` the package comes from the Comfy Registry (``comfy node registry-install``); with it, from that
file (a check before publishing). Needs comfy-cli and ComfyUI's requirements in this Python; runs on the CPU.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tests" / "host"))
PACKAGE = "comfyui-plenio-music"


def install(comfyui: Path, version: str, packed: Path | None, base: Path) -> Path:
    nodes = base / "custom_nodes"
    nodes.mkdir(parents=True, exist_ok=True)
    target = nodes / PACKAGE
    if packed is not None:
        with zipfile.ZipFile(packed) as archive:
            archive.extractall(target)
        return target
    comfy = shutil.which("comfy")
    if comfy is None:
        raise SystemExit("comfy-cli is missing: python -m pip install comfy-cli")
    subprocess.run(  # noqa: S603 - comfy-cli, fixed arguments
        [
            comfy,
            "--skip-prompt",
            "--no-enable-telemetry",
            f"--workspace={comfyui}",
            "node",
            "registry-install",
            PACKAGE,
            "--version",
            version,
        ],
        check=True,
    )
    installed = comfyui / "custom_nodes" / PACKAGE
    shutil.move(str(installed), target)
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--comfyui", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--zip", type=Path)
    args = parser.parse_args(argv)
    from harness import ComfyServer

    facts = json.loads((PROJECT / "docs" / "facts.json").read_text(encoding="utf-8"))
    base = Path(tempfile.mkdtemp(prefix="plenio-verify-"))
    target = install(args.comfyui.resolve(), args.version, args.zip, base)
    problems = []
    if (target / "plenio" / "addons").exists():
        problems.append("the package carries the Studio add-on (it belongs to the full download only)")
    server = ComfyServer(args.comfyui.resolve(), base, node_packs=[target.name])
    server.start()
    try:
        info = server.get("/object_info")
        version = server.get("/system_stats")["system"]["comfyui_version"]
        log = server.log_text() if hasattr(server, "log_text") else ""
    finally:
        server.stop()
    plenio = sorted(name for name in info if name.startswith("Plenio"))
    retired = {"PlenioComposeSungCheck", "PlenioApplySungCheck"}
    shown = [name for name in plenio if name not in retired]
    if len(shown) != facts["nodes"]:
        problems.append(f"{len(shown)} nodes registered, the facts say {facts['nodes']}")
    templates = len(list((target / "example_workflows").glob("*.json")))
    blueprints = len(list((target / "subgraphs").glob("*.json")))
    if templates != facts["templates"] or blueprints != facts["blueprints"]:
        problems.append(
            f"{templates} templates and {blueprints} blueprints, the facts say {facts['templates']} and {facts['blueprints']}"
        )
    if "Cannot import" in log:
        problems.append("ComfyUI could not import a module of the package")
    print(f"ComfyUI {version}: {len(shown)} Plenio nodes, {templates} templates, {blueprints} blueprints")
    for problem in problems:
        print(f"PROBLEM {problem}", file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
