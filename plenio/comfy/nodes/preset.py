"""Preset: the template's settings for one way of making a song - *Best quality*, *Party - fast*, *Quick sketch*,
*Full song*, *Three takes*, *Instrumental* (``resources/presets/make.json``, the same six as the player's).

Choosing one sets the template's fields in the page - the length, the vocals, HQ mastering, cover art, lyrics
fidelity - as visible changes that Ctrl+Z takes back; nothing is hidden in the run. The node itself does nothing
when the workflow runs (it has no outputs).
"""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.presets import NONE, load_presets
from ..shared import RESOURCES

PRESETS_FILE = RESOURCES / "presets" / "make.json"


def _ids() -> list[str]:
    return [NONE, *load_presets(PRESETS_FILE)]


class PlenioPreset(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioPreset",
            display_name="Preset",
            category="Plenio/Song",
            description=(
                "Sets the template's fields for one way of making a song, as the player's presets do. The changes "
                "are visible in the nodes, and Ctrl+Z takes them back. The node does nothing when the workflow runs."
            ),
            inputs=[
                io.Combo.Input(
                    "preset",
                    options=_ids(),
                    default=NONE,
                    tooltip="none: the template as it is. best, party, sketch, full, takes, instrumental: the player's "
                    "presets - the node's help page lists what each sets.",
                )
            ],
            outputs=[],
        )

    @classmethod
    def execute(cls, preset: str = NONE, **_: Any) -> io.NodeOutput:
        return io.NodeOutput()
