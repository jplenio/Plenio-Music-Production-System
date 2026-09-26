"""Model fakes for the YuE2 and MiniMax paths: engines, writer, planner and renderers.

They run on the CPU in milliseconds and record what they receive, so host
tests can assert laziness, caching and that the renderer gets exactly the
Song Sheet's outputs (WYSIWYG).
"""

from __future__ import annotations

import json
from pathlib import Path
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

COVER_STYLE = "English, acoustic folk pop, soft female vocal, fingerpicked guitar, warm piano, 121 BPM"
ANSWERS_COVER = {
    "cover-none": f"TITLE: Lanterns\nSTYLE: {COVER_STYLE}\nLYRICS:\nnone\nARTWORK: A lantern on a river.",
    "cover-new": f"TITLE: Lanterns\nSTYLE: {COVER_STYLE}\nLYRICS:\n[Verse]\nPaper lanterns on the river\n\n"
    "[Pre-Chorus]\nHear the bells across the bay\n\n[Chorus]\nLanterns floating through the dark\n\n[Outro]\n"
    "ARTWORK: A lantern on a river.",
    "cover-instrumental": "TITLE: Lanterns\nSTYLE: acoustic folk instrumental, warm piano lead melody, fingerpicked "
    "guitar, 121 BPM\nLYRICS:\nnone\nARTWORK: A lantern on a river.",
}

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


MINIMAX_CAPTION = (
    "Global Metadata\nbpm is 92. key is D, and scale is minor. Indie pop / dream pop.\nHazy verses open into a "
    "wide chorus; warm, close production.\n\nVocal Details\nEnglish lyrics; airy female lead, soft in the verses, "
    "fuller in the chorus.\n\nArrangement\nJangly guitars and a round bass carry the verses; drums and synth pads "
    "join in the chorus."
)
ANSWERS_MINIMAX = {
    "minimax": f"TITLE: Neon Rain\nSTYLE:\n{MINIMAX_CAPTION}\nLYRICS:\n[Verse]\nCity lights are fading slow\n"
    "Footsteps keep the time\n\n[Chorus]\nWe run through neon rain\nARTWORK: A rainy street at night.",
}


class FakeMiniMaxTokenizer:
    """One token per character of the native prompt's text (the exact count comes from the adapter)."""

    def prompt_tokens(self, caption: str, lyrics: str) -> int:
        return 12 + len(caption) + len(lyrics)


class FakeEngine:
    engine_id = "yue2"
    rules_version = "plenio.yue2-rules/1"
    capabilities: dict[str, Any] = {}
    model = {"text_encoder": "fake"}
    tokenizer = FakeTokenizer()

    def to_dict(self) -> dict[str, Any]:
        return {"engine_id": self.engine_id, "rules_version": self.rules_version, "model": self.model}


class FakeMiniMaxEngine(FakeEngine):
    engine_id = "minimax_music3"
    rules_version = "plenio.minimax-rules/1"
    tokenizer = FakeMiniMaxTokenizer()  # type: ignore[assignment]


class PlenioTestFakeEngine(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTestFakeEngine",
            category="Plenio/Tests",
            inputs=[io.Combo.Input("engine", options=["yue2", "minimax_music3"], optional=True)],
            outputs=[io.Custom("PLENIO_ENGINE").Output(display_name="engine")],
        )

    @classmethod
    def execute(cls, engine: str = "yue2") -> io.NodeOutput:
        return io.NodeOutput(FakeMiniMaxEngine() if engine == "minimax_music3" else FakeEngine())


ANSWERS.update(ANSWERS_COVER)
ANSWERS.update(ANSWERS_MINIMAX)

EVENTS_FILE = Path(__file__).resolve().parent / "minimax-excerpt.events.json"
FAKE_RATE = 24000


def fake_waveform(seconds: float, variant: int) -> torch.Tensor:
    """Deterministic stereo test signal; the host tests recompute it to predict the ASR cache key."""
    t = torch.arange(int(round(seconds * FAKE_RATE)), dtype=torch.float32) / FAKE_RATE
    wave = 0.1 * torch.sin(2 * torch.pi * 220.0 * t + float(variant))
    return wave.reshape(1, 1, -1).repeat(1, 2, 1)


class _FakeSheetSageModel:
    def __init__(self, mode: str):
        self.mode = mode

    def transcribe(self, waveform: torch.Tensor) -> list[dict[str, Any]]:
        if self.mode == "fail":
            raise ValueError("SheetSage2 needs at least two decoded beats to produce ABC.")
        events = json.loads(EVENTS_FILE.read_text(encoding="utf-8"))["events"]
        if self.mode == "no vocals":
            for event in events:
                melody = event["values"].get("melody")
                if melody:
                    event["values"]["melody"] = [n for n in melody if n["track"] != 0]
        return list(events)


class FakeSheetSage:
    """Stands in for ComfyUI's SheetSage2AudioEncoder: replays recorded SheetSage2 events."""

    model_sample_rate = FAKE_RATE
    load_device = "cpu"
    patcher = None

    def __init__(self, mode: str):
        self.model = _FakeSheetSageModel(mode)

    def generate_abc(self, audio: torch.Tensor, sample_rate: int, melody_only: bool = True) -> list[str]:
        from comfy.audio_encoders.sheetsage2_abc import events_to_abc

        duration = audio.shape[-1] / sample_rate
        return [events_to_abc(self.model.transcribe(audio), duration, melody_only=melody_only)]


def make_nodes(record: Any) -> list[type[io.ComfyNode]]:
    class PlenioTestFakeAudio(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakeAudio",
                category="Plenio/Tests",
                inputs=[
                    io.Float.Input("seconds", default=83.02),
                    io.Int.Input("variant", default=0, min=0, max=1000),
                ],
                outputs=[io.Audio.Output()],
            )

        @classmethod
        def execute(cls, seconds: float, variant: int) -> io.NodeOutput:
            record("audio", seconds=seconds, variant=variant)
            return io.NodeOutput({"waveform": fake_waveform(seconds, variant), "sample_rate": FAKE_RATE})

    class PlenioTestFakeSheetSage(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakeSheetSage",
                category="Plenio/Tests",
                inputs=[io.Combo.Input("mode", options=["normal", "no vocals", "fail"])],
                outputs=[io.AudioEncoder.Output()],
            )

        @classmethod
        def execute(cls, mode: str) -> io.NodeOutput:
            record("sheetsage", mode=mode)
            return io.NodeOutput(FakeSheetSage(mode))

    class PlenioTestTimelineProbe(io.ComfyNode):
        """Records a timeline and its vocal regions exactly (host tests derive ASR cache keys from them)."""

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestTimelineProbe",
                category="Plenio/Tests",
                inputs=[io.Custom("PLENIO_TIMELINE").Input("timeline")],
                outputs=[],
                is_output_node=True,
            )

        @classmethod
        def execute(cls, timeline: Any) -> io.NodeOutput:
            record(
                "timeline",
                source_sha256=timeline.source_sha256,
                bars=len(timeline.bars),
                vocal_notes=len(timeline.vocal_notes),
                regions=[list(region) for region in timeline.vocal_regions()],
            )
            return io.NodeOutput()

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
            record("llm", variant=variant, prompt_chars=len(prompt), prompt=prompt)
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

    class PlenioTestFakeMiniMaxRender(io.ComfyNode):
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="PlenioTestFakeMiniMaxRender",
                category="Plenio/Tests",
                inputs=[
                    io.String.Input("caption", force_input=True),
                    io.String.Input("lyrics", force_input=True),
                    io.Float.Input("max_duration", force_input=True),
                    io.Int.Input("seed", default=0, min=0, max=10**9),
                ],
                outputs=[io.Audio.Output()],
            )

        @classmethod
        def execute(cls, caption: str, lyrics: str, max_duration: float, seed: int) -> io.NodeOutput:
            record("minimax_render", caption=caption, lyrics=lyrics, max_duration=max_duration, seed=seed)
            t = torch.arange(44100) / 44100.0
            wave = (0.1 * torch.sin(2 * torch.pi * 330 * t)).reshape(1, 1, -1).repeat(1, 2, 1)
            return io.NodeOutput({"waveform": wave, "sample_rate": 44100})

    return [
        PlenioTestFakeEngine,
        PlenioTestFakeMiniMaxRender,
        PlenioTestFakeLLM,
        PlenioTestFakePlan,
        PlenioTestFakeRender,
        PlenioTestFakeAudio,
        PlenioTestFakeSheetSage,
        PlenioTestTimelineProbe,
    ]
