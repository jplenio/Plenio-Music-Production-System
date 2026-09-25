"""System Check node: installation and hardware diagnostics."""

from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import io

from ...core.system import check_system, to_markdown
from .. import host
from ..types import ReportType


class PlenioSystemCheck(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioSystemCheck",
            display_name="System Check",
            category="Plenio/Utilities",
            description=(
                "Shows ComfyUI and Plenio versions, GPUs and VRAM, optional packages, the offline/download "
                "policy and transparent hardware recommendations. Nothing is changed automatically."
            ),
            inputs=[
                io.Combo.Input(
                    "detail",
                    options=["summary", "full"],
                    default="summary",
                    tooltip="summary: readable overview. full: also the raw facts as JSON.",
                ),
            ],
            outputs=[
                ReportType.Output(display_name="report", tooltip="Report for Export Release or inspection.")
            ],
            is_output_node=True,
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        return float("nan")  # facts change outside the graph: always re-run

    @classmethod
    def execute(cls, detail: str) -> io.NodeOutput:
        report = check_system(host.system_facts())
        markdown = to_markdown(report)
        if detail == "full":
            markdown += (
                "\n\n### Raw facts\n\n```json\n" + json.dumps(report.data["facts"], indent=2) + "\n```"
            )
        return io.NodeOutput(
            report, ui={"plenio_summary": [{"status": report.status.value, "markdown": markdown}]}
        )
