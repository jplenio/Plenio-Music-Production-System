"""Snapshot the node definitions used by Plenio's templates and blueprints.

Starts an isolated ComfyUI (see tests/host/harness.py), reads ``/object_info``
and writes ``tools/data/node_types.json`` with every Plenio node plus the
native nodes listed below. The workflow validator checks graphs against this
snapshot, so CI does not need ComfyUI. Re-run after a ComfyUI upgrade:

    PLENIO_COMFYUI_ROOT=<ComfyUI> <ComfyUI python> tools/snapshot_node_types.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

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


def main() -> int:
    root = Path(os.environ["PLENIO_COMFYUI_ROOT"])
    base = Path(tempfile.mkdtemp(prefix="plenio-snapshot-"))
    (base / "custom_nodes").mkdir()
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
        print(f"missing node types: {missing}", file=sys.stderr)
        return 1
    snapshot = {
        "comfyui_version": version,
        "nodes": {name: {key: info[name].get(key) for key in KEYS} for name in wanted},
    }
    target = PROJECT / "tools" / "data" / "node_types.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(snapshot, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {len(wanted)} node types from ComfyUI {version} to {target.relative_to(PROJECT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
