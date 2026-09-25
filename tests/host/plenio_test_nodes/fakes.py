"""Model fakes for the YuE2 Song path: engine, writer, planner and renderer.

They run on the CPU in milliseconds and record what they receive, so host
tests can assert laziness, caching and that the renderer gets exactly the
Song Sheet's outputs (WYSIWYG).
"""

from __future__ import annotations

from typing import Any

import torch
from comfy_api.latest import io

PLAN_TEMPLATE = """X:1
T:
M:4/4
L:1/16
Q:1/4={tempo}
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
% verse
V: Vocal
"C"E2G2A2G2E2D2C4|"G"D2E2G2E2D2C2D4|
V: Ins
Z2|
% chorus
V: Vocal
"F"F2A2G2E2D2E2G4|"C"E2G2A2G2E2D2C4|
V: Ins
Z2|
"""

ANSWERS = {
    "a": "TITLE: Neon Rain\nSTYLE: English, warm piano pop, expressive female voice, light drums, 88 BPM\n"
    "LYRICS:\n[Verse]\nCity lights are fading slow\n\n[Chorus]\nWe run through neon rain\n"
    "ARTWORK: A rainy street at night with neon reflections.",
    "b": "TITLE: Neon Rain\nSTYLE: English, warm piano pop, expressive female voice, light drums, 88 BPM\n"
    "LYRICS:\n[Verse]\nA second draft of the verse\n\n[Chorus]\nWe run through neon rain\n"
    "ARTWORK: A rainy street at night with neon reflections.",
}


class FakeTokenizer:
    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        return 2 + len(style.split()) + len(lyrics.split()) + 20

    def abc_tokens(self, abc: str) -> int:
        return len(abc) // 3


class FakeEngine:
    engine_id = "yue2"
    rules_version = "plenio.yue2-rules/1"
    capabilities: dict[str, Any] = {}
    model = {"text_encoder": "fake"}
    tokenizer = FakeTokenizer()

    def to_dict(self) -> dict[str, Any]:
        return {"engine_id": self.engine_id, "rules_version": self.rules_version, "model": self.model}


class PlenioTestFakeEngine(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestFakeEngine",
            category="Plenio/Tests",
            inputs=[],
            outputs=[io.Custom("PLENIO_ENGINE").Output(display_name="engine")],
        )

    @classmethod
    def execute(cls) -> io.NodeOutput:
        return io.NodeOutput(FakeEngine())


def make_nodes(record: Any) -> list[type[io.ComfyNode]]:
    class PlenioTestFakeLLM(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakeLLM",
                category="Plenio/Tests",
                inputs=[
                    io.String.Input("prompt", force_input=True),
                    io.Combo.Input("variant", options=list(ANSWERS)),
                ],
                outputs=[io.String.Output()],
            )

        @classmethod
        def execute(cls, prompt: str, variant: str) -> io.NodeOutput:
            record("llm", variant=variant, prompt_chars=len(prompt))
            return io.NodeOutput(ANSWERS[variant])

    class PlenioTestFakePlan(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakePlan",
                category="Plenio/Tests",
                inputs=[
                    io.String.Input("style", force_input=True),
                    io.String.Input("lyrics", force_input=True),
                    io.Int.Input("seed", default=0, min=0, max=100),
                ],
                outputs=[io.String.Output(display_name="abc")],
            )

        @classmethod
        def execute(cls, style: str, lyrics: str, seed: int) -> io.NodeOutput:
            record("plan", seed=seed, style=style, lyrics=lyrics)
            return io.NodeOutput(PLAN_TEMPLATE.format(tempo=80 + seed))

    class PlenioTestFakeRender(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakeRender",
                category="Plenio/Tests",
                inputs=[
                    io.String.Input("style", force_input=True),
                    io.String.Input("lyrics", force_input=True),
                    io.String.Input("abc", force_input=True),
                    io.Combo.Input("mode", options=["full", "melody"]),
                    io.Float.Input("max_duration", force_input=True),
                    io.Int.Input("seed", default=0, min=0, max=10**9),
                ],
                outputs=[io.Audio.Output()],
            )

        @classmethod
        def execute(
            cls, style: str, lyrics: str, abc: str, mode: str, max_duration: float, seed: int
        ) -> io.NodeOutput:
            record(
                "render", style=style, lyrics=lyrics, abc=abc, mode=mode, max_duration=max_duration, seed=seed
            )
            t = torch.arange(22050) / 22050.0
            wave = (0.1 * torch.sin(2 * torch.pi * 220 * t)).reshape(1, 1, -1).repeat(1, 2, 1)
            return io.NodeOutput({"waveform": wave, "sample_rate": 22050})

    return [PlenioTestFakeEngine, PlenioTestFakeLLM, PlenioTestFakePlan, PlenioTestFakeRender]
