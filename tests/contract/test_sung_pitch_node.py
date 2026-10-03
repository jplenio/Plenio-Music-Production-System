"""Sung Pitch (node): never stops a cover - without its separation model or when the separation fails it
says why there is no curve - and with a model it tracks the vocal stem (a fake separator here)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pytest

pytestmark = pytest.mark.comfy

RATE = 16000


def audio(seconds: float = 1.0, midi: float = 62) -> dict[str, Any]:
    import torch

    t = np.arange(int(seconds * RATE)) / RATE
    wave = 0.3 * np.sin(2 * np.pi * 440 * 2 ** ((midi - 69) / 12) * t)
    return {
        "waveform": torch.from_numpy(np.stack([wave, wave])[None].astype(np.float32)),
        "sample_rate": RATE,
    }


def test_a_missing_model_or_a_failed_separation_never_stops_the_run(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.comfy.nodes import sung_pitch

    monkeypatch.setattr(sung_pitch.host, "locate_model", lambda folder, file: None)
    pitch = sung_pitch.PlenioSungPitch._pitch(audio(), "model.ckpt")
    assert pitch.problem and "not in models/audio_separation" in pitch.problem
    monkeypatch.setattr(sung_pitch.host, "locate_model", lambda folder, file: Path("x.ckpt"))

    def broken(*_args: Any) -> Any:
        raise RuntimeError("out of memory")

    monkeypatch.setattr(sung_pitch.audio_models, "load", broken)
    pitch = sung_pitch.PlenioSungPitch._pitch(audio(), "model.ckpt")
    assert pitch.problem and "out of memory" in pitch.problem
    assert pitch.to_dict() == {"problem": pitch.problem}


def test_the_vocal_stem_is_tracked_and_the_whole_mix_is_a_fallback(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.comfy.nodes import sung_pitch

    class Separator:
        name = "Fake 2-stem"

        def separate(self, samples: np.ndarray, rate: int) -> dict[str, np.ndarray]:
            return {"vocals": samples, "other": samples * 0}

    class Model:
        engine = Separator()

    monkeypatch.setattr(sung_pitch.host, "locate_model", lambda folder, file: Path("x.ckpt"))
    monkeypatch.setattr(sung_pitch.audio_models, "load", lambda kind, file, path: Model())
    pitch = sung_pitch.PlenioSungPitch._pitch(audio(midi=62), "model.ckpt")
    assert pitch.source == "vocals of Fake 2-stem"
    assert abs(pitch.midi[25] - 62) < 0.2
    whole = sung_pitch.PlenioSungPitch._pitch(audio(midi=57), sung_pitch.WHOLE_MIX)
    assert "whole mix" in whole.source and abs(whole.midi[25] - 57) < 0.2
