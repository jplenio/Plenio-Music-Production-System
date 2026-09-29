"""Snapshot the node definitions used by Plenio's templates and blueprints.

Starts an isolated ComfyUI (see tests/host/harness.py), reads ``/object_info``
and writes ``tools/data/node_types.json`` with every Plenio node plus the
native nodes listed below. The workflow validator checks graphs against this
snapshot, so CI does not need ComfyUI. Re-run after a ComfyUI upgrade:

    PLENIO_COMFYUI_ROOT=<ComfyUI> <ComfyUI python> tools/snapshot_node_types.py

The ComfyUI must be the release the CI host job checks out (a tag such as ``v0.37.0``): a
``master`` checkout past the tag still calls itself 0.37.0, but its native nodes can differ
(``TextGenerate`` did, and the CI failed on the 0.3.0 push). The tool refuses a checkout that is
not exactly on a release tag unless ``--allow-untagged`` is given; the snapshot records the
checkout (``comfyui_ref``) so the host test compares native nodes only against the same one.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tests" / "host"))

from harness import PACKAGE_NAME, ComfyServer, copy_package  # noqa: E402

NATIVE_NODES = [
    "CheckpointLoaderSimple",
    "LoraLoader",
    "CLIPLoader",
    "UNETLoader",
    "VAELoader",
    "TextGenerate",
    "YuE2GenerateABC",
    "YuE2GenerateMusic",
    "EmptyYuE2LatentAudio",
    "MiniMaxMusic3TextEncode",
    "EmptyMiniMaxMusic3LatentAudio",
    "KSampler",
    "ConditioningZeroOut",
    "VAEDecodeAudio",
    "VAEDecodeAudioTiled",
    "PreviewAudio",
    "PreviewAny",
    "LoadAudio",
    "TrimAudioDuration",
    "AudioEncoderLoader",
    "SheetSage2AudioToABC",
    "SaveAudio",
    "SaveAudioAdvanced",
    "ComfySwitchNode",
    "PrimitiveString",
    "PrimitiveStringMultiline",
    "PrimitiveBoolean",
    "PrimitiveInt",
    "PrimitiveFloat",
    "SeedNode",
    "StartLoop",
    "EndLoop",
    "LoopIteration",
    "ComfyMathExpression",
    # Cover Art (FLUX.2 Klein 4B, Phase 8)
    "CLIPTextEncode",
    "CFGGuider",
    "RandomNoise",
    "KSamplerSelect",
    "Flux2Scheduler",
    "EmptyFlux2LatentImage",
    "SamplerCustomAdvanced",
    "VAEDecode",
    "PreviewImage",
]
KEYS = (
    "input",
    "input_order",
    "output",
    "output_name",
    "output_is_list",
    "output_node",
    "category",
    "display_name",
)


RELEASE_TAG = re.compile(r"v\d+\.\d+\.\d+")


def comfyui_ref(root: Path) -> str | None:
    """``git describe`` of the ComfyUI checkout: ``v0.37.0`` on the tag, ``v0.37.0-47-g2139131e`` past it;
    ``None`` for an install without git."""
    try:
        result = subprocess.run(
            ["git", "-C", str(root), "describe", "--tags", "--always"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    ref = result.stdout.strip()
    return ref if result.returncode == 0 and ref else None


def take_snapshot(root: Path, base: Path) -> dict[str, Any]:
    """The snapshot as this tool writes it, from a fresh server (Plenio only, no user data) in ``base``."""
    (base / "custom_nodes").mkdir(parents=True)
    copy_package(base / "custom_nodes")
    server = ComfyServer(root, base, node_packs=[PACKAGE_NAME])
    server.start()
    try:
        info = server.get("/object_info")
        version = server.get("/system_stats")["system"]["comfyui_version"]
    finally:
        server.stop()
    wanted = sorted(set(NATIVE_NODES) | {name for name in info if name.startswith("Plenio")})
    missing = [name for name in wanted if name not in info]
    if missing:
        raise SystemExit(f"missing node types: {missing}")
    return {
        "comfyui_version": version,
        "comfyui_ref": comfyui_ref(root),
        "nodes": {name: {key: info[name].get(key) for key in KEYS} for name in wanted},
    }


def main() -> int:
    root = Path(os.environ["PLENIO_COMFYUI_ROOT"])
    ref = comfyui_ref(root)
    if not (ref and RELEASE_TAG.fullmatch(ref)) and "--allow-untagged" not in sys.argv[1:]:
        print(
            f"{root} is not on a ComfyUI release tag (git describe: {ref}); the CI checks the tag, so its native "
            "nodes may differ. Snapshot a checkout of the tag, or pass --allow-untagged.",
            file=sys.stderr,
        )
        return 2
    snapshot = take_snapshot(root, Path(tempfile.mkdtemp(prefix="plenio-snapshot-")))
    target = PROJECT / "tools" / "data" / "node_types.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(snapshot, indent=1, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
    )
    nodes, version = len(snapshot["nodes"]), snapshot["comfyui_version"]
    print(f"wrote {nodes} node types from ComfyUI {version} to {target.relative_to(PROJECT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
