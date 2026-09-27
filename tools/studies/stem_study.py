"""Separation study (next-release plan §6 and the local checklist L2): BS-RoFormer on real songs.

This is the measurement half of **L2**; it runs on the owner's machine with the real checkpoint. Per
song it reports the separation's speed (seconds, real-time factor) and peak VRAM, how much energy the
residual *rest* holds, the level of every stem, and the two mixer contracts that hold without
listening:

- a **neutral mix** returns the input (the residual invariant; the difference is reported in dBFS),
- a **muted range** changes nothing outside its own stretch.

With ``--write-audio`` it writes the listening material for the owner's verdict: the neutral mix, the
four stems and the residual, plus one example mix, all 24-bit FLAC.

    <python with numpy, scipy, av and torch + CUDA> \\
        tools/studies/stem_study.py --models F:/ComfyUI/models \\
        --out docs/test-reports/data/stem-study.json --write-audio <dir> song.flac [song2.flac ...]

The listening verdict itself is the owner's (L2); the tool only produces the numbers and the files.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any

import numpy as np

PROJECT = Path(__file__).resolve().parents[2]
if str(PROJECT) not in sys.path:
    sys.path.insert(0, str(PROJECT))

from plenio.core.audio.effects import effects_for  # noqa: E402
from plenio.core.audio.stems import mix, parse_mix  # noqa: E402

MUTE_CHECK_SECONDS = 2.0
"""The muted range the range check writes into the first strip (seconds from the start)."""

EXAMPLE_MIX = {
    "schema": "plenio.stem_mix/1",
    "strips": {
        "vocals": {"reverb": 0.15},
        "drums": {"gain_db": -1.5},
        "other": {"gain_db": -1.0},
    },
    "reverb": {"preset": "room"},
}
"""The example mix the listening pack writes (a plausible balance, not a recommendation)."""


def decode(path: Path) -> tuple[np.ndarray, int]:
    """Decode like the native LoadAudio node (``(channels, samples)`` float32)."""
    try:
        from _common import load_audio
    except ImportError:  # run from another folder
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from _common import load_audio

    samples, rate = load_audio(path)
    data = samples if isinstance(samples, np.ndarray) else np.asarray(samples)
    return np.asarray(data, dtype=np.float64), int(rate)


def load_separator(models_dir: Path | None) -> tuple[Any, str]:
    """The separation engine through Plenio's own adapter (needs the checkpoint and torch)."""
    try:
        from _common import import_comfy_if_available
    except ImportError:  # run from another folder
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from _common import import_comfy_if_available

    import_comfy_if_available()  # before the load: the adapter asks ComfyUI for the device
    from plenio.comfy import audio_models, host, msst
    from plenio.core.errors import PlenioError
    from plenio.core.models import AUDIO_MODEL_FOLDERS

    folder = AUDIO_MODEL_FOLDERS["separation"]
    root = Path(models_dir) if models_dir else Path(host.models_directory())
    directory = root / folder
    files = sorted(path.name for path in directory.glob("*") if path.is_file() and msst.matches(path.name))
    if not files:
        raise SystemExit(
            f"no separation model found in {directory}: put the BS-RoFormer checkpoint there "
            "(see docs/user/models.md)"
        )
    try:
        model = audio_models.load("separation", files[0], directory / files[0])
    except PlenioError as error:
        raise SystemExit(str(error)) from error
    return model.engine, files[0]


def _reset_vram() -> None:
    try:
        import torch

        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
    except ImportError:
        return


def _peak_vram() -> int | None:
    try:
        import torch

        if torch.cuda.is_available():
            return int(torch.cuda.max_memory_allocated())
    except ImportError:
        return None
    return None


def _db(value: float) -> float | None:
    return None if value <= 0 else round(20 * float(np.log10(value)), 2)


def _level(samples: np.ndarray) -> dict[str, Any]:
    peak = float(np.max(np.abs(samples))) if samples.size else 0.0
    rms = float(np.sqrt(np.mean(samples**2))) if samples.size else 0.0
    return {"peak_dbfs": _db(peak), "rms_dbfs": _db(rms)}


def _difference_db(result: np.ndarray, reference: np.ndarray, *, frames: int | None = None) -> float | None:
    """The largest sample difference as dBFS (``None`` when both are exactly equal / empty)."""
    width = frames if frames is not None else reference.shape[1]
    a, b = result[:, :width], reference[:, :width]
    if a.size == 0 or b.size == 0:
        return None
    return _db(float(np.max(np.abs(a - b))))


def measure_song(separator: Any, path: Path, *, write_audio: Path | None) -> dict[str, Any]:
    from plenio.core.audio.stems import make_stems

    data, rate = decode(path)
    _reset_vram()
    started = time.perf_counter()
    separated = separator.separate(data, rate)
    seconds = time.perf_counter() - started
    peak_vram = _peak_vram()
    container = make_stems(data, rate, separated, source=separator.name)
    energy = float((data**2).sum())

    facts: dict[str, Any] = {
        "input": str(path),
        "rate": rate,
        "seconds_audio": round(data.shape[1] / rate, 3),
        "separation_seconds": round(seconds, 3),
        "real_time_factor": round((data.shape[1] / rate) / seconds, 4) if seconds > 0 else None,
        "peak_vram_mb": None if peak_vram is None else round(peak_vram / 1024 / 1024, 1),
        "stems": {name: _level(stem) for name, stem in container.strips()},
        "residual_energy_share": round(float((container.residual.astype(float) ** 2).sum()) / energy, 4)
        if energy
        else None,
        "input_level": _level(data),
    }

    neutral, neutral_report = mix(container)
    facts["neutral"] = {
        "max_difference_dbfs": _difference_db(neutral, data),
        "neutral": neutral_report["neutral"],
        "peak_db": neutral_report["peak_db"],
    }

    mute = json.dumps(
        {
            "schema": "plenio.stem_mix/1",
            "strips": {"drums": {"muted": [[0.0, MUTE_CHECK_SECONDS]]}},
        }
    )
    muted, _report = mix(container, parse_mix(mute))
    after = int(MUTE_CHECK_SECONDS * rate)
    facts["muted_range"] = {
        "seconds": MUTE_CHECK_SECONDS,
        "max_difference_after_range_dbfs": _difference_db(
            muted[:, after:], data[:, after:], frames=neutral.shape[1] - after
        ),
        "length_seconds": round(muted.shape[1] / rate, 3),
    }

    example = parse_mix(json.dumps(EXAMPLE_MIX))
    with_buses, bus_report = mix(container, example, effects=effects_for(example.buses))
    facts["example_mix"] = {
        "buses": bus_report["buses"],
        **_level(with_buses),
        "peak_db": bus_report["peak_db"],
    }

    if write_audio is not None:
        from plenio.core.release import safe_filename
        from plenio.core.release import write_audio as encode

        folder = write_audio / safe_filename(path.stem)
        folder.mkdir(parents=True, exist_ok=True)
        written = []
        encode(folder / "neutral-mix.flac", neutral, rate, "flac", {"title": f"{path.stem} (neutral mix)"})
        for name, stem in container.strips():
            encode(
                folder / f"{safe_filename(name)}.flac", stem, rate, "flac", {"title": f"{path.stem} ({name})"}
            )
        encode(folder / "mix-example.flac", with_buses, rate, "flac", {"title": f"{path.stem} (example mix)"})
        written = sorted(item.name for item in folder.glob("*.flac"))
        facts["written"] = [str(folder / name) for name in written]

    return facts


def run_study(songs: list[Path], models_dir: Path | None, write_audio: Path | None) -> dict[str, Any]:
    separator, model_file = load_separator(models_dir)
    report: dict[str, Any] = {
        "schema": "plenio.stem-study/1",
        "model": model_file,
        "source": separator.name,
        "device": str(getattr(separator, "device", "")),
        "stems": list(separator.stems),
        "songs": {},
    }
    for path in songs:
        report["songs"][path.name] = measure_song(separator, path, write_audio=write_audio)
    return report


def summarize(report: dict[str, Any]) -> dict[str, Any]:
    facts = list(report["songs"].values())
    if not facts:
        return {}
    rtfs = [f["real_time_factor"] for f in facts if f["real_time_factor"]]
    vram = [f["peak_vram_mb"] for f in facts if f["peak_vram_mb"] is not None]
    neutral = [f["neutral"]["max_difference_dbfs"] for f in facts if f["neutral"]["max_difference_dbfs"]]
    muted = [
        f["muted_range"]["max_difference_after_range_dbfs"]
        for f in facts
        if f["muted_range"]["max_difference_after_range_dbfs"]
    ]
    return {
        "songs": len(facts),
        "seconds_audio": round(sum(f["seconds_audio"] for f in facts), 1),
        "real_time_factor": round(float(np.mean(rtfs)), 4) if rtfs else None,
        "peak_vram_mb": round(float(np.max(vram)), 1) if vram else None,
        "neutral_max_difference_dbfs": round(float(np.max(neutral)), 2) if neutral else None,
        "muted_range_max_difference_dbfs": round(float(np.max(muted)), 2) if muted else None,
        "residual_energy_share": round(
            float(np.mean([f["residual_energy_share"] for f in facts if f["residual_energy_share"]])), 4
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("songs", nargs="+", type=Path, help="the songs to separate")
    parser.add_argument("--models", type=Path, help="ComfyUI models folder (for models/audio_separation)")
    parser.add_argument(
        "--out", type=Path, default=PROJECT / "docs" / "test-reports" / "data" / "stem-study.json"
    )
    parser.add_argument(
        "--write-audio",
        type=Path,
        help="also write the listening material (neutral mix, stems, example mix) under this folder",
    )
    args = parser.parse_args(argv)

    report = run_study(list(args.songs), args.models, args.write_audio)
    report["summary"] = summarize(report)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print(f"wrote {args.out}")
    facts = report["summary"]
    print(
        f"  {facts['songs']} song(s), {facts['seconds_audio']} s audio  "
        f"RTF {facts['real_time_factor']}  peak VRAM {facts['peak_vram_mb']} MB"
        f"  [{report['device']}]"
    )
    print(
        f"  residual energy {facts['residual_energy_share']}  "
        f"neutral difference {facts['neutral_max_difference_dbfs']} dBFS  "
        f"muted-range difference {facts['muted_range_max_difference_dbfs']} dBFS"
    )
    print("\nThe listening verdict of L2 is the owner's (docs/user/concepts/stems.md, plan §6).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
