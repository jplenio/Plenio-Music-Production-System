"""Start an isolated ComfyUI with Plenio (and optionally the test nodes) for manual checks.

Usage (ComfyUI's Python, PLENIO_COMFYUI_ROOT set):

    python tools/dev_server.py [--test-nodes] [--gpu] [--models DIR] [--port N]

The server uses a temporary base directory; the user's custom nodes, user data
and outputs are not touched. Stop it with Ctrl+C.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
import time
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tests" / "host"))

from harness import PACKAGE_NAME, ComfyServer, copy_package  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--test-nodes", action="store_true", help="also load tests/host/plenio_test_nodes")
    parser.add_argument("--fixture-blueprint", action="store_true", help="add the AS-10 fixture blueprint")
    parser.add_argument("--gpu", action="store_true", help="use the GPU instead of --cpu")
    parser.add_argument("--models", type=Path, help="ComfyUI models directory (--models-directory)")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument(
        "--base", type=Path, help="reuse this base directory (outputs are kept, nodes re-copied)"
    )
    args = parser.parse_args()
    root = Path(os.environ["PLENIO_COMFYUI_ROOT"])
    base = args.base or Path(tempfile.mkdtemp(prefix="plenio-dev-"))
    custom = base / "custom_nodes"
    if custom.exists():
        shutil.rmtree(custom)
    custom.mkdir(parents=True)
    extra = {}
    if args.fixture_blueprint:
        extra["subgraphs/Plenio Test Blueprint.json"] = (
            PROJECT / "tests" / "fixtures" / "graphs" / "Plenio Test Blueprint.json"
        )
    copy_package(custom, extra)
    packs = [PACKAGE_NAME]
    if args.test_nodes:
        shutil.copytree(
            PROJECT / "tests" / "host" / "plenio_test_nodes",
            custom / "plenio_test_nodes",
            ignore=shutil.ignore_patterns("__pycache__"),
        )
        packs.append("plenio_test_nodes")
    server = ComfyServer(root, base, node_packs=packs, cpu=not args.gpu, models_dir=args.models)
    if args.port:
        server.port = args.port
        server.url = f"http://127.0.0.1:{args.port}"
    server.start()
    print(f"ComfyUI running at {server.url} (base {base}, log {server.log_path})", flush=True)
    try:
        while server.process is not None and server.process.poll() is None:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        server.stop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
