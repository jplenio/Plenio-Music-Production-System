"""Start an isolated ComfyUI with Plenio (and optionally the test nodes) for manual checks.

Usage (ComfyUI's Python, PLENIO_COMFYUI_ROOT set):

    python tools/dev_server.py [--test-nodes] [--gpu] [--models DIR] [--port N]

The server uses a temporary base directory; the user's custom nodes, user data
and outputs are not touched. Stop it with Ctrl+C.
"""

from __future__ import annotations

import argparse
import os
import shlex
import shutil
import sys
import tempfile
import time
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tests" / "host"))
sys.path.insert(0, str(PROJECT / "tools"))

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
    parser.add_argument(
        "--fake-hub",
        type=int,
        metavar="PORT",
        help="serve the catalogue's files from a throttled local stand-in for Hugging Face on PORT (tools/fake_hub.py), "
        "reached as the mirror HF_ENDPOINT; the copied package's models.toml expects its bytes; PLENIO_FAKE_GATED "
        "names file names that answer as gated",
    )
    parser.add_argument(
        "--comfy-args",
        default="",
        help='more options for main.py of ComfyUI, as one string: --comfy-args="--disable-pinned-memory"',
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
    hub = None
    if args.fake_hub:
        from fake_hub import rewrite_catalogue, serve

        ids = rewrite_catalogue(custom / PACKAGE_NAME / "resources" / "models.toml")
        os.environ["HF_ENDPOINT"] = f"http://127.0.0.1:{args.fake_hub}"  # the server reaches it as a mirror
        gated = frozenset(filter(None, os.environ.get("PLENIO_FAKE_GATED", "").split(",")))
        hub = serve(args.fake_hub, gated=gated)
        print(
            f"fake hub at http://127.0.0.1:{args.fake_hub} for {len(ids)} files (gated: {sorted(gated)})",
            flush=True,
        )
    packs = [PACKAGE_NAME]
    if args.test_nodes:
        shutil.copytree(
            PROJECT / "tests" / "host" / "plenio_test_nodes",
            custom / "plenio_test_nodes",
            ignore=shutil.ignore_patterns("__pycache__"),
        )
        packs.append("plenio_test_nodes")
    server = ComfyServer(
        root,
        base,
        node_packs=packs,
        cpu=not args.gpu,
        models_dir=args.models,
        extra_args=shlex.split(args.comfy_args),
    )
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
        if hub is not None:
            hub.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
