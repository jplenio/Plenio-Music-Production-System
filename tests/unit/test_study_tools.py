"""The L1/L2 study tools (``tools/studies``): the blind A/B pack and the separation report helpers.

The tools run on the owner's machine with real weights; what is tested here is the bookkeeping -
that the blind pack is really blind (the key names what the files hold) and that the separation
study's difference/level helpers mean what they say. No model, no GPU.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools" / "studies"


def load_tool(name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, TOOLS / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module  # dataclasses need the module registered while the body runs
    spec.loader.exec_module(module)
    return module


def decode(path: Path) -> tuple[np.ndarray, int]:
    import av

    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        rate = int(stream.rate)
        resampler = av.AudioResampler(
            format="fltp", layout="stereo" if stream.channels > 1 else "mono", rate=rate
        )
        chunks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray())
        for out in resampler.resample(None):
            chunks.append(out.to_ndarray())
    return np.concatenate(chunks, axis=1).astype(np.float64), rate


def audio(seconds: float = 0.2, rate: int = 48000) -> np.ndarray:
    frames = int(seconds * rate)
    t = np.arange(frames) / rate
    return np.vstack([np.sin(2 * np.pi * 220 * t), np.sin(2 * np.pi * 330 * t)]) * 0.5


def test_the_blind_pack_names_what_the_files_hold(tmp_path: Path) -> None:
    study = load_tool("sr_study")
    limited = audio()
    original = limited + 0.4 * np.sin(2 * np.pi * 19000 * np.arange(limited.shape[1]) / 48000)
    refined = limited + 0.001 * np.sin(2 * np.pi * 9000 * np.arange(limited.shape[1]) / 48000)
    arms = {
        "resample only": {"report": {"notes": []}},
        "universr[1]": {"report": {"notes": []}},
        "broken": {"report": {"notes": ["input already full band (22050 Hz) - resample only"]}},
    }
    outputs = {"resample only": limited.copy(), "universr[1]": refined, "broken": limited.copy()}
    facts = study.write_pack(
        tmp_path,
        tmp_path / "reference.flac",
        limited,
        arms,
        outputs,
        48000,
        reference_audio=original,
        edge_hz=14500.0,
    )

    folder = tmp_path / "reference"
    assert (folder / "key.json").is_file() and (folder / "README.md").is_file()
    assert (folder / "reference.flac").is_file()  # the untouched original for the comparison
    key = json.loads((folder / "key.json").read_text(encoding="utf-8"))
    assert key["edge_hz"] == 14500.0 and key["pairs"]
    pairs = key["pairs"]
    assert set(pairs) == {"universr[1]"}  # the baseline returned the input, the broken arm only resampled
    assert facts["resample only"] == {"skipped": "the arm returned the input unchanged"}
    assert "input already full band" in facts["broken"]["skipped"]

    pair = pairs["universr[1]"]
    assert {pair["band-limited"], pair["refined"]} == {1, 2}
    back_limited, rate = decode(folder / f"{pair['band-limited']}.flac")
    back_refined, _rate = decode(folder / f"{pair['refined']}.flac")
    back_reference, _rate = decode(folder / "reference.flac")
    assert rate == 48000
    assert back_limited.shape == limited.shape
    # 24-bit FLAC: the quantisation step is 2**-23, so the comparison asks for that and no more
    assert np.allclose(back_limited, limited, atol=2**-23)
    assert np.allclose(back_refined, refined, atol=2**-23)
    assert np.allclose(back_reference, original, atol=2**-23)
    assert not np.allclose(back_limited, back_refined, atol=2**-23)  # there is something to hear


def test_the_difference_helper_is_dbfs(tmp_path: Path) -> None:
    study = load_tool("stem_study")
    reference = audio(seconds=0.05)
    assert study._difference_db(reference, reference) is None
    assert study._difference_db(reference + 0.01, reference) == -40.0  # a 0.01 offset at full scale
    # silence against a 0.5-peak signal: the difference is the signal itself
    assert study._difference_db(np.zeros_like(reference), reference) == -6.02


def test_the_separation_summary_averages_the_songs() -> None:
    study = load_tool("stem_study")
    songs = {
        "a.flac": {
            "seconds_audio": 10.0,
            "real_time_factor": 3.0,
            "peak_vram_mb": 1500.0,
            "residual_energy_share": 0.01,
            "neutral": {"max_difference_dbfs": -160.0},
            "muted_range": {"max_difference_after_range_dbfs": -160.0},
        },
        "b.flac": {
            "seconds_audio": 20.0,
            "real_time_factor": 4.0,
            "peak_vram_mb": 1700.0,
            "residual_energy_share": 0.02,
            "neutral": {"max_difference_dbfs": -155.0},
            "muted_range": {"max_difference_after_range_dbfs": -158.0},
        },
    }
    summary = study.summarize({"songs": songs})
    assert summary["songs"] == 2 and summary["seconds_audio"] == 30.0
    assert summary["real_time_factor"] == 3.5 and summary["peak_vram_mb"] == 1700.0
    assert summary["neutral_max_difference_dbfs"] == -155.0  # the worst case, not the mean
    assert summary["muted_range_max_difference_dbfs"] == -158.0
    assert summary["residual_energy_share"] == 0.015


def test_the_separation_summary_survives_an_empty_run() -> None:
    study = load_tool("stem_study")
    assert study.summarize({"songs": {}}) == {}
