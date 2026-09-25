"""V3 node schema contracts, checked against the real ComfyUI API in-process.

Run with ComfyUI's Python and ``PLENIO_COMFYUI_ROOT`` pointing to the checkout.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

import pytest

pytestmark = pytest.mark.comfy
ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture(scope="module")
def nodes(comfy_path: Path) -> list[Any]:
    from plenio.comfy.extension import comfy_entrypoint

    extension = asyncio.run(comfy_entrypoint())
    return asyncio.run(extension.get_node_list())


def legacy_ids() -> set[str]:
    data = json.loads(
        (ROOT / "docs" / "design" / "data" / "legacy-node-inventory.json").read_text(encoding="utf-8")
    )
    return {entry["id"] for entry in data}


def test_node_identity_rules(nodes: list[Any]) -> None:
    ids = [node.GET_SCHEMA().node_id for node in nodes]
    assert len(ids) == len(set(ids))
    assert not set(ids) & legacy_ids()
    for node in nodes:
        schema = node.GET_SCHEMA()
        assert schema.node_id.startswith("Plenio"), schema.node_id
        assert schema.category.startswith("Plenio/"), schema.category
        assert schema.display_name and schema.description


def test_every_input_and_output_is_documented(nodes: list[Any]) -> None:
    for node in nodes:
        schema = node.GET_SCHEMA()
        for item in schema.inputs:
            assert item.tooltip, f"{schema.node_id}.{item.id} has no tooltip"
        for item in schema.outputs:
            assert item.tooltip, f"{schema.node_id} output {item.display_name} has no tooltip"


def test_schemas_serialise_like_comfyui_does(nodes: list[Any]) -> None:
    for node in nodes:
        info = node.GET_NODE_INFO_V1()
        json.dumps(info)
        assert info["name"] == node.GET_SCHEMA().node_id


def test_system_check_schema(nodes: list[Any]) -> None:
    node = next(n for n in nodes if n.GET_SCHEMA().node_id == "PlenioSystemCheck")
    info = node.GET_NODE_INFO_V1()
    assert info["output"] == ["PLENIO_REPORT"]
    assert info["output_node"] is True
    assert info["input"]["required"]["detail"][1]["options"] == ["summary", "full"]


def test_sheet_state_widget_type_serialises_as_custom_type(comfy_path: Path) -> None:
    from plenio.comfy.types import SheetState

    item = SheetState.Input("sheet_state", tooltip="state")
    assert item.get_io_type() == "PLENIO_SHEET_STATE"
    assert item.as_dict()["socketless"] is True
    assert item.as_dict()["default"] == ""
