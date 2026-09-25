"""System Check node: installation and hardware diagnostics."""

from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import io

from ..shared import system_report
from ..types import ReportType


class PlenioSystemCheck(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioSystemCheck",
            display_name="System Check",
            category="Plenio/Utilities",
            description=(
                "Shows ComfyUI and Plenio versions, GPUs and VRAM, which model files of each template are "
                "installed, optional packages and Plenio assets, the offline/download policy and the hardware "
                "rule table with this machine's row. Nothing is changed automatically."
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
        report, markdown = system_report()
        if detail == "full":
            markdown += (
                "\n\n### Raw facts\n\n```json\n" + json.dumps(report.data["facts"], indent=2) + "\n```"
            )
        return io.NodeOutput(
            report, ui={"plenio_summary": [{"status": report.status.value, "markdown": markdown}]}
        )
