"""Test-only node pack loaded next to Plenio by the host integration tests.

Every node appends one JSON line to ``<output>/plenio_test_log.jsonl`` when it
executes, so tests can assert exactly which nodes ran.
"""

from __future__ import annotations

import json
import os
from typing import Any

import folder_paths
from comfy_api.latest import ComfyExtension, io
from comfy_execution.graph_utils import ExecutionBlocker


def record(node: str, **data: Any) -> None:
    folder = folder_paths.get_output_directory()
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, "plenio_test_log.jsonl")
    with open(path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps({"node": node, **data}) + "\n")


class PlenioTestSource(io.ComfyNode):
    """Produces a string; stands in for an expensive upstream stage (LLM, ASR, planner)."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestSource",
            category="Plenio/Tests",
            inputs=[io.String.Input("name"), io.String.Input("value", default="")],
            outputs=[io.String.Output()],
        )

    @classmethod
    def execute(cls, name: str, value: str) -> io.NodeOutput:
        record("source", name=name, value=value)
        return io.NodeOutput(value)


class PlenioTestGate(io.ComfyNode):
    """Review-gate spike (AS-03): lazy input, per-output ExecutionBlocker."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestGate",
            category="Plenio/Tests",
            inputs=[
                io.String.Input("text", optional=True, lazy=True, force_input=True),
                io.Combo.Input("mode", options=["pass", "block", "manual"]),
            ],
            outputs=[io.String.Output(display_name="text"), io.String.Output(display_name="report")],
            is_output_node=True,
        )

    @classmethod
    def check_lazy_status(cls, mode: str, text: str | None = None) -> list[str]:
        return [] if mode == "manual" else (["text"] if text is None else [])

    @classmethod
    def execute(cls, mode: str, text: str | None = None) -> io.NodeOutput:
        record("gate", mode=mode, text=text)
        if mode == "manual":
            return io.NodeOutput("manual text", "manual", ui={"plenio_summary": [{"markdown": "manual"}]})
        if mode == "block":
            return io.NodeOutput(
                ExecutionBlocker(None), "blocked", ui={"plenio_summary": [{"markdown": "waiting"}]}
            )
        return io.NodeOutput(text, "passed")


class PlenioTestSink(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestSink",
            category="Plenio/Tests",
            inputs=[io.String.Input("value", force_input=True), io.String.Input("label", default="sink")],
            outputs=[],
            is_output_node=True,
        )

    @classmethod
    def execute(cls, value: str, label: str) -> io.NodeOutput:
        record("sink", label=label, value=value)
        return io.NodeOutput(ui={"received": [value]})


@io.comfytype(io_type="PLENIO_SHEET_STATE")
class SheetStateWidget(io.ComfyTypeIO):
    """Same io_type as Plenio's Song Sheet widget; the Plenio frontend extension renders it."""

    Type = str

    class Input(io.WidgetInput):
        def __init__(self, id: str, tooltip: str | None = None):
            super().__init__(id, None, False, tooltip, None, "", True)


class PlenioTestWidgetEcho(io.ComfyNode):
    """AS-02 spike: the custom widget value reaches execute unchanged."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestWidgetEcho",
            category="Plenio/Tests",
            inputs=[SheetStateWidget.Input("sheet_state", tooltip="state")],
            outputs=[io.String.Output()],
            is_output_node=True,
        )

    @classmethod
    def execute(cls, sheet_state: str) -> io.NodeOutput:
        record("echo", value=sheet_state, type=type(sheet_state).__name__)
        return io.NodeOutput(sheet_state, ui={"received": [sheet_state]})


class TestExtension(ComfyExtension):
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        from .fakes import make_nodes

        return [PlenioTestSource, PlenioTestGate, PlenioTestSink, PlenioTestWidgetEcho, *make_nodes(record)]


async def comfy_entrypoint() -> TestExtension:
    return TestExtension()
