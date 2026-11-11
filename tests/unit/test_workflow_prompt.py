"""A workflow as ComfyUI's API prompt without a browser (the Song API, owner's request 2026-10-25): the same prompt
ComfyUI's own frontend makes - checked against prompts the frontend made of the Song API's templates
(tests/fixtures/song_api, written by tools/frontend_prompts.mjs) and, piece by piece, on small graphs."""

from __future__ import annotations

import copy
import json
import random
from pathlib import Path
from typing import Any

import pytest

from plenio.core.workflow_prompt import (
    WorkflowError,
    decode_widgets,
    encode_widgets,
    randomise_controls,
    to_prompt,
    widget_layout,
)

ROOT = Path(__file__).resolve().parents[2]
NODES: dict[str, Any] = json.loads((ROOT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))[
    "nodes"
]
FIXTURES = sorted((ROOT / "tests" / "fixtures" / "song_api").glob("*.json"))


def fixture(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads(
        (ROOT / "tests" / "fixtures" / "song_api" / name).read_text(encoding="utf-8")
    )
    return data


@pytest.mark.parametrize("path", FIXTURES, ids=lambda p: p.stem)
def test_the_frontends_workflows_give_the_frontends_prompts(path: Path) -> None:
    """The workflow the frontend serialised gives exactly the prompt it queued - every node, input and link."""
    data = json.loads(path.read_text(encoding="utf-8"))
    assert to_prompt(data["workflow"], NODES.get) == data["prompt"]


@pytest.mark.parametrize(
    ("name", "template"), [("yue2-song", "1 · YuE2 · Song"), ("yue2-cover", "2 · YuE2 · Cover")]
)
def test_the_template_files_give_the_frontends_prompt(name: str, template: str) -> None:
    """The template as shipped (not loaded by a frontend) gives the frontend's prompt of it too: the converter
    takes a subgraph's inputs by name and a bypass by the link's type, as a loaded graph has them."""
    workflow = json.loads((ROOT / "example_workflows" / f"{template}.json").read_text(encoding="utf-8"))
    expected = fixture(f"{name}.shipped.json")["prompt"]
    made = to_prompt(workflow, NODES.get)
    if name == "yue2-cover":  # the fixture's source recording was set in the frontend
        made["2"]["inputs"]["audio"] = expected["2"]["inputs"]["audio"]
    assert made == expected


def test_the_song_prompt_has_the_blocks_inner_nodes_and_no_frontend_nodes() -> None:
    prompt = fixture("yue2-song.shipped.json")["prompt"]
    assert {"MarkdownNote", "Note", "Reroute"}.isdisjoint(n["class_type"] for n in prompt.values())
    # the YuE2 Model block: its Model Choice feeds the checkpoint loader, the engine reads the loader's CLIP, its
    # bypassed adapter is left out and passed through
    assert prompt["3:101"]["inputs"] == {"component": "yue2", "component.file": "auto"}
    assert prompt["3:103"]["inputs"] == {"ckpt_name": ["3:101", 0]}
    assert prompt["3:105"]["inputs"]["clip"] == ["3:103", 1]
    assert "3:104" not in prompt
    assert all(":" not in key or key.split(":")[0].isdigit() for key in prompt)


# --- small graphs -------------------------------------------------------------------------------------------

INFO: dict[str, Any] = {
    "Source": {"input": {"required": {}}, "output": ["IMAGE", "STRING"], "display_name": "Source"},
    "Pass": {
        "input": {"required": {"image": ["IMAGE", {}], "text": ["STRING", {"forceInput": True}]}},
        "input_order": {"required": ["image", "text"]},
        "output": ["IMAGE", "STRING"],
        "display_name": "Pass",
    },
    "Sink": {
        "input": {
            "required": {
                "image": ["IMAGE", {}],
                "seed": ["INT", {"default": 0, "control_after_generate": True}],
            },
            "optional": {"text": ["STRING", {"default": "x"}]},
        },
        "input_order": {"required": ["image", "seed"], "optional": ["text"]},
        "output": [],
        "output_node": True,
        "display_name": "Sink",
    },
    "Choice": {
        "input": {
            "required": {
                "voice": [
                    "COMFY_DYNAMICCOMBO_V3",
                    {
                        "options": [
                            {
                                "key": "sung",
                                "inputs": {"required": {"language": ["STRING", {"default": "English"}]}},
                            },
                            {"key": "none", "inputs": {"required": {"lead": ["STRING", {"default": "sax"}]}}},
                        ]
                    },
                ],
                "level": ["FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0}],
            }
        },
        "input_order": {"required": ["voice", "level"]},
        "output": ["STRING"],
        "display_name": "Choice",
    },
    "Prompted": {
        "input": {"required": {"text": ["STRING", {"dynamicPrompts": True, "multiline": True}]}},
        "output": ["STRING"],
        "display_name": "Prompted",
    },
}


def node(node_id: int, node_type: str, *, mode: int = 0, inputs: list[Any] | None = None, outputs: list[Any] | None = None, values: list[Any] | None = None, title: str | None = None) -> dict[str, Any]:  # fmt: skip
    out: dict[str, Any] = {
        "id": node_id,
        "type": node_type,
        "mode": mode,
        "inputs": inputs or [],
        "outputs": outputs or [],
    }
    if values is not None:
        out["widgets_values"] = values
    if title:
        out["title"] = title
    return out


def slot(name: str, kind: str, link: int | None = None, widget: bool = False) -> dict[str, Any]:
    out: dict[str, Any] = {"name": name, "type": kind, "link": link}
    if widget:
        out["widget"] = {"name": name}
    return out


def test_widgets_follow_the_definition_and_a_seed_control_is_saved_not_sent() -> None:
    graph = {
        "nodes": [
            node(1, "Source", outputs=[{"name": "IMAGE", "type": "IMAGE"}]),
            node(
                2,
                "Sink",
                inputs=[slot("image", "IMAGE", 1), slot("seed", "INT", widget=True)],
                values=[7, "fixed", "words"],
            ),
        ],
        "links": [[1, 1, 0, 2, 0, "IMAGE"]],
    }
    prompt = to_prompt(graph, INFO.get)
    assert prompt["2"] == {
        "inputs": {"seed": 7, "text": "words", "image": ["1", 0]},
        "class_type": "Sink",
        "_meta": {"title": "Sink"},
    }
    assert [w.key for w in widget_layout(INFO["Sink"], [7, "fixed", "words"])] == [
        "seed",
        "seed#control",
        "text",
    ]


def test_a_bypassed_node_passes_on_the_input_of_the_type_asked_for_and_a_muted_one_gives_nothing() -> None:
    graph = {
        "nodes": [
            node(
                1,
                "Source",
                outputs=[{"name": "IMAGE", "type": "IMAGE"}, {"name": "STRING", "type": "STRING"}],
            ),
            node(2, "Pass", mode=4, inputs=[slot("image", "IMAGE", 1), slot("text", "STRING", 2)]),
            node(
                3,
                "Sink",
                inputs=[
                    slot("image", "IMAGE", 3),
                    slot("seed", "INT", widget=True),
                    slot("text", "STRING", 4),
                ],
                values=[1, "fixed", "x"],
            ),
            node(4, "Pass", mode=2, inputs=[slot("image", "IMAGE", 5)]),
            node(
                5,
                "Sink",
                inputs=[slot("image", "IMAGE", 6), slot("seed", "INT", widget=True)],
                values=[2, "fixed", "y"],
            ),
        ],
        "links": [
            [1, 1, 0, 2, 0, "IMAGE"],
            [2, 1, 1, 2, 1, "STRING"],
            [3, 2, 0, 3, 0, "IMAGE"],
            [4, 2, 1, 3, 2, "STRING"],
            [5, 1, 0, 4, 0, "IMAGE"],
            [6, 4, 0, 5, 0, "IMAGE"],
        ],
    }
    prompt = to_prompt(graph, INFO.get)
    assert "2" not in prompt and "4" not in prompt
    assert prompt["3"]["inputs"]["image"] == ["1", 0]
    assert prompt["3"]["inputs"]["text"] == ["1", 1]  # the second output: the input of its type
    assert "image" not in prompt["5"]["inputs"]  # from a muted node: nothing


def test_a_bypassed_node_without_an_input_of_the_type_gives_nothing() -> None:
    graph = {
        "nodes": [
            node(1, "Source", outputs=[{"name": "IMAGE", "type": "IMAGE"}]),
            node(2, "Pass", mode=4, inputs=[slot("image", "IMAGE", 1)]),
            node(3, "Prompted", inputs=[slot("text", "STRING", 2, widget=True)], values=["typed"]),
        ],
        "links": [[1, 1, 0, 2, 0, "IMAGE"], [2, 2, 1, 3, 0, "STRING"]],
    }
    # the widget keeps its own value when its link leads nowhere
    assert to_prompt(graph, INFO.get)["3"]["inputs"] == {"text": "typed"}


def test_reroutes_primitive_nodes_and_notes() -> None:
    graph = {
        "nodes": [
            node(1, "Source", outputs=[{"name": "IMAGE", "type": "IMAGE"}]),
            node(2, "Reroute", inputs=[slot("", "*", 1)], outputs=[{"name": "", "type": "IMAGE"}]),
            node(3, "PrimitiveNode", outputs=[{"name": "INT", "type": "INT"}], values=[42, "fixed"]),
            node(
                4,
                "Sink",
                inputs=[slot("image", "IMAGE", 2), slot("seed", "INT", 3, widget=True)],
                values=[0, "fixed", "x"],
            ),
            node(5, "MarkdownNote", values=["# hello"]),
        ],
        "links": [[1, 1, 0, 2, 0, "IMAGE"], [2, 2, 0, 4, 0, "IMAGE"], [3, 3, 0, 4, 1, "INT"]],
    }
    prompt = to_prompt(graph, INFO.get)
    assert set(prompt) == {"1", "4"}
    assert prompt["4"]["inputs"] == {"seed": 42, "text": "x", "image": ["1", 0]}


def _subgraph(sub_id: str, inner_modes: tuple[int, int] = (0, 0)) -> dict[str, Any]:
    """A subgraph: input ``text`` (to a widget of an inner Choice... here a Prompted node) and ``image`` (a socket
    through a Pass node) - outputs the image."""
    return {
        "id": sub_id,
        "name": "Block",
        "inputs": [
            {"name": "image", "type": "IMAGE", "linkIds": [11]},
            {"name": "text", "type": "STRING", "linkIds": [12]},
        ],
        "outputs": [{"name": "IMAGE", "type": "IMAGE", "linkIds": [13]}],
        "nodes": [
            node(
                101,
                "Pass",
                mode=inner_modes[0],
                inputs=[slot("image", "IMAGE", 11)],
                outputs=[{"name": "IMAGE", "type": "IMAGE"}],
            ),
            node(
                102,
                "Prompted",
                mode=inner_modes[1],
                inputs=[slot("text", "STRING", 12, widget=True)],
                values=[""],
                title="inner",
            ),
        ],
        "links": [
            {
                "id": 11,
                "origin_id": -10,
                "origin_slot": 0,
                "target_id": 101,
                "target_slot": 0,
                "type": "IMAGE",
            },
            {
                "id": 12,
                "origin_id": -10,
                "origin_slot": 1,
                "target_id": 102,
                "target_slot": 0,
                "type": "STRING",
            },
            {
                "id": 13,
                "origin_id": 101,
                "origin_slot": 0,
                "target_id": -20,
                "target_slot": 0,
                "type": "IMAGE",
            },
        ],
    }


def _with_block(
    mode: int = 0, inner_modes: tuple[int, int] = (0, 0), *, slot_text: bool = True
) -> dict[str, Any]:
    sub = "aaaaaaaa-0000-0000-0000-000000000000"
    instance_inputs = [slot("image", "IMAGE", 1)]
    if slot_text:
        instance_inputs.append(slot("text", "STRING", widget=True))
    return {
        "nodes": [
            node(1, "Source", outputs=[{"name": "IMAGE", "type": "IMAGE"}]),
            node(
                5,
                sub,
                mode=mode,
                inputs=instance_inputs,
                outputs=[{"name": "IMAGE", "type": "IMAGE"}],
                values=["promoted"],
            ),
            node(
                6,
                "Sink",
                inputs=[slot("image", "IMAGE", 2), slot("seed", "INT", widget=True)],
                values=[0, "fixed", "x"],
            ),
        ],
        "links": [[1, 1, 0, 5, 0, "IMAGE"], [2, 5, 0, 6, 0, "IMAGE"]],
        "definitions": {"subgraphs": [_subgraph(sub, inner_modes)]},
    }


def test_a_subgraph_is_flattened_with_its_promoted_widget() -> None:
    prompt = to_prompt(_with_block(), INFO.get)
    assert set(prompt) == {"1", "5:101", "5:102", "6"}
    assert prompt["5:101"]["inputs"] == {"image": ["1", 0]}
    assert prompt["5:102"] == {
        "inputs": {"text": "promoted"},
        "class_type": "Prompted",
        "_meta": {"title": "inner"},
    }
    assert prompt["6"]["inputs"]["image"] == ["5:101", 0]


def test_a_promoted_widget_without_a_slot_on_the_node_keeps_its_value() -> None:
    """A frontend that saved the workflow leaves an unlinked promoted widget out of the node's slots."""
    assert to_prompt(_with_block(slot_text=False), INFO.get)["5:102"]["inputs"] == {"text": "promoted"}


def test_a_bypassed_inner_node_and_a_bypassed_subgraph_pass_on() -> None:
    inner = to_prompt(_with_block(inner_modes=(4, 0)), INFO.get)
    assert "5:101" not in inner and inner["6"]["inputs"]["image"] == ["1", 0]
    whole = to_prompt(_with_block(mode=4), INFO.get)
    assert set(whole) == {"1", "6"} and whole["6"]["inputs"]["image"] == ["1", 0]
    muted = to_prompt(_with_block(mode=2), INFO.get)
    assert set(muted) == {"1", "6"} and "image" not in muted["6"]["inputs"]


def test_nested_subgraphs_get_their_path_as_id() -> None:
    outer_id, inner_id = "bbbbbbbb-0000-0000-0000-000000000000", "aaaaaaaa-0000-0000-0000-000000000000"
    outer = {
        "id": outer_id,
        "name": "Outer",
        "inputs": [{"name": "image", "type": "IMAGE", "linkIds": [21]}],
        "outputs": [{"name": "IMAGE", "type": "IMAGE", "linkIds": [22]}],
        "nodes": [
            node(
                201,
                inner_id,
                inputs=[slot("image", "IMAGE", 21), slot("text", "STRING", widget=True)],
                outputs=[{"name": "IMAGE", "type": "IMAGE"}],
                values=["deep"],
            )
        ],  # fmt: skip
        "links": [
            {
                "id": 21,
                "origin_id": -10,
                "origin_slot": 0,
                "target_id": 201,
                "target_slot": 0,
                "type": "IMAGE",
            },
            {
                "id": 22,
                "origin_id": 201,
                "origin_slot": 0,
                "target_id": -20,
                "target_slot": 0,
                "type": "IMAGE",
            },
        ],
    }
    graph = {
        "nodes": [
            node(1, "Source", outputs=[{"name": "IMAGE", "type": "IMAGE"}]),
            node(
                7, outer_id, inputs=[slot("image", "IMAGE", 1)], outputs=[{"name": "IMAGE", "type": "IMAGE"}]
            ),
            node(
                8,
                "Sink",
                inputs=[slot("image", "IMAGE", 2), slot("seed", "INT", widget=True)],
                values=[0, "fixed", "x"],
            ),
        ],
        "links": [[1, 1, 0, 7, 0, "IMAGE"], [2, 7, 0, 8, 0, "IMAGE"]],
        "definitions": {"subgraphs": [outer, _subgraph(inner_id)]},
    }
    prompt = to_prompt(graph, INFO.get)
    assert set(prompt) == {"1", "7:201:101", "7:201:102", "8"}
    assert prompt["7:201:101"]["inputs"] == {"image": ["1", 0]}
    assert prompt["7:201:102"]["inputs"] == {"text": "deep"}
    assert prompt["8"]["inputs"]["image"] == ["7:201:101", 0]


def test_a_dynamic_combo_sends_the_inputs_of_its_choice() -> None:
    graph = {"nodes": [node(1, "Choice", values=["none", "trumpet", 0.25])]}
    assert to_prompt(graph, INFO.get)["1"]["inputs"] == {
        "voice": "none",
        "voice.lead": "trumpet",
        "level": 0.25,
    }
    named = decode_widgets(INFO["Choice"], ["sung", "German", 0.5])
    assert named == {"voice": "sung", "voice.language": "German", "level": 0.5}
    assert encode_widgets(INFO["Choice"], {**named, "voice": "none"}) == ["none", "sax", 0.5]


def test_a_dynamic_prompt_makes_its_choices() -> None:
    graph = {"nodes": [node(1, "Prompted", values=["a {red|blue} {sky|sea}"])]}
    text = to_prompt(graph, INFO.get, rng=random.Random(3))["1"]["inputs"]["text"]
    assert text in {"a red sky", "a red sea", "a blue sky", "a blue sea"}


def test_an_unknown_node_type_is_said() -> None:
    with pytest.raises(WorkflowError, match="NoSuchNode"):
        to_prompt({"nodes": [node(1, "NoSuchNode")]}, INFO.get)


def test_a_randomize_control_draws_a_new_number_once() -> None:
    graph = {
        "nodes": [
            node(
                1,
                "Sink",
                inputs=[slot("image", "IMAGE"), slot("seed", "INT", widget=True)],
                values=[5, "randomize", "x"],
            ),
            node(
                2,
                "Sink",
                inputs=[slot("image", "IMAGE"), slot("seed", "INT", widget=True)],
                values=[5, "fixed", "x"],
            ),
        ]
    }
    changed = randomise_controls(graph, INFO.get, random.Random(1))
    assert changed == ["1.seed"]
    assert graph["nodes"][0]["widgets_values"][0] != 5 and graph["nodes"][1]["widgets_values"][0] == 5


def test_the_converter_leaves_the_workflow_as_it_was() -> None:
    data = fixture("yue2-song.shipped.json")["workflow"]
    before = copy.deepcopy(data)
    to_prompt(data, NODES.get)
    assert data == before
