"""Model Choice against a made-up catalogue: ``auto`` follows the plan, a pin (the node's field, then
``config.toml``) wins, a missing file stops the run with its data, and the fingerprint follows what is installed."""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path
from typing import Any

import pytest

pytestmark = pytest.mark.comfy

BIG = "demo_big.safetensors"
SMALL = "demo_small.safetensors"


def variant(**fields: Any) -> Any:
    from plenio.core.models import Variant

    base = {
        "url": f"https://huggingface.co/org/demo/resolve/{'a' * 40}/{fields['file']}",
        "sha256": "ab" * 32,
        "licence": "Apache-2.0",
        "role": "demo model",
        "default": False,
    }
    return Variant(**{**base, **fields})


@pytest.fixture
def world(comfy_path: Path, monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    """A catalogue with one component of two files, a 24 GB card, nothing installed and the default config."""
    from plenio.comfy import host, setup
    from plenio.core.config import PlenioConfig
    from plenio.core.models import Component

    component = Component(
        id="demo",
        title="Demo model",
        folder="checkpoints",
        variants=(
            variant(
                id="demo-big", file=BIG, bytes=2000, quality=3, vram_min_gib=8, vram_full_gib=16, default=True
            ),
            variant(id="demo-small", file=SMALL, bytes=1000, quality=2, vram_min_gib=4, vram_full_gib=8),
        ),
        templates=("1 · Demo",),
    )
    state: dict[str, Any] = {
        "installed": {},
        "on_disk": {},
        "config": PlenioConfig(),
        "events": [],
    }
    monkeypatch.setattr(setup, "_components", lambda: {"demo": component})
    monkeypatch.setattr(setup, "_installed", lambda: dict(state["installed"]))
    monkeypatch.setattr(host, "active_vram_gib", lambda: 24.0)
    monkeypatch.setattr(host, "load_config", lambda: state["config"])
    monkeypatch.setattr(
        host, "locate_model", lambda folder, file: Path(file) if file in state["on_disk"] else None
    )
    monkeypatch.setattr(host, "model_files", lambda folder: ["my_finetune.safetensors", SMALL])
    monkeypatch.setattr(host, "send_event", lambda event, data: state["events"].append((event, data)))
    return state


def node() -> Any:
    from plenio.comfy.nodes.model_choice import PlenioModelChoice

    return PlenioModelChoice


def run(file: str = "auto") -> tuple[str, dict[str, Any]]:
    result = node().execute({"component": "demo", "file": file})
    return result.args[0], result.ui["plenio_summary"][0]


def test_the_list_offers_auto_the_catalogue_best_first_then_the_folder(world: dict[str, Any]) -> None:
    from plenio.comfy.nodes.model_choice import _components, _files

    assert _files(_components()["demo"]) == ["auto", BIG, SMALL, "my_finetune.safetensors"]
    schema = node().GET_SCHEMA()
    (choice,) = schema.inputs
    (option,) = choice.options
    assert option.key == "demo" and option.inputs[0].default == "auto" and option.inputs[0].tooltip


def test_auto_takes_the_installed_file_that_is_nearly_as_good(world: dict[str, Any]) -> None:
    world["installed"] = {SMALL: 1000}
    file, summary = run()
    assert file == SMALL
    assert summary["status"] == "ok" and "installed" in summary["markdown"] and SMALL in summary["markdown"]


def test_the_nodes_field_wins_then_a_pin_of_the_config(world: dict[str, Any]) -> None:
    world["installed"] = {SMALL: 1000, BIG: 2000}
    world["config"] = replace(world["config"], model_pins={"demo": SMALL})
    file, summary = run()
    assert file == SMALL and "pinned in config.toml" in summary["markdown"]
    file, summary = run(BIG)
    assert file == BIG and "chosen in this node" in summary["markdown"]
    # a file of one's own that is in the folder is taken as it is
    world["on_disk"] = {"my_finetune.safetensors": 1}
    file, summary = run("my_finetune.safetensors")
    assert file == "my_finetune.safetensors" and summary["status"] == "ok"


def test_a_missing_file_stops_the_run_with_its_data_and_tells_the_page(world: dict[str, Any]) -> None:
    from plenio.core.errors import PlenioModelError

    with pytest.raises(PlenioModelError) as caught:
        run()
    error = caught.value
    assert BIG in error.message and "Plenio Setup" in (error.hint or "")
    assert error.details == {
        "component": "demo",
        "file": BIG,
        "variant": "demo-big",
        "folder": "checkpoints",
        "url": f"https://huggingface.co/org/demo/resolve/{'a' * 40}/{BIG}",
    }
    assert BIG in (error.hint or "") and "models/checkpoints" in (error.hint or "")  # until Setup's page
    ((event, data),) = world["events"]
    assert event == "plenio.models_missing" and data["component"] == "demo" and data["file"] == BIG
    # a file of one's own that is not there is named with its folder, without Setup
    with pytest.raises(PlenioModelError) as caught:
        run("gone.safetensors")
    assert "models/checkpoints" in (caught.value.hint or "") and caught.value.details["variant"] is None


def test_installing_a_file_changes_the_fingerprint(world: dict[str, Any]) -> None:
    def fingerprint(file: str = "auto") -> Any:
        return node().fingerprint_inputs(component={"component": "demo", "file": file})

    before = fingerprint()
    assert fingerprint() == before  # stable while nothing changes
    world["installed"] = {BIG: 2000}
    assert fingerprint() != before
    pinned = fingerprint(SMALL)
    world["installed"] = {BIG: 2000, SMALL: 1000}
    assert fingerprint(SMALL) != pinned  # the pinned file arrived


def test_an_unknown_component_is_said_before_the_run(world: dict[str, Any]) -> None:
    assert node().validate_inputs(component={"component": "demo", "file": "anything.safetensors"}) is True
    said = node().validate_inputs(component={"component": "nope", "file": "auto"})
    assert isinstance(said, str) and "nope" in said


def test_a_pinned_file_of_another_kind_is_used_and_said(
    world: dict[str, Any], monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.comfy import setup

    world["on_disk"] = {"odd.safetensors": 1}
    monkeypatch.setattr(
        setup, "problem_of", lambda component, file: "not a demo model" if file == "odd.safetensors" else None
    )
    file, summary = run("odd.safetensors")
    assert file == "odd.safetensors" and summary["status"] == "warning"
    assert "not a demo model" in summary["markdown"] and "may refuse" in summary["markdown"]
