"""Contract tests run ComfyUI in-process, on the CPU - as the CI does, with a CPU-only torch."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def comfy_on_the_cpu(request: pytest.FixtureRequest) -> None:
    """ComfyUI's ``--cpu`` before ``comfy.model_management`` is first imported: without it, ComfyUI
    picks the device with ``torch.cuda.current_device()``, which fails on a CPU-only torch ("Torch not
    compiled with CUDA enabled") as soon as a node touches the model management (an interrupt check,
    say). Only tests that load ComfyUI (``comfy_path``) are touched."""
    if "comfy_path" not in request.fixturenames:
        return
    request.getfixturevalue("comfy_path")
    from comfy.cli_args import args

    args.cpu = True
