"""SR study (next-release plan §4.5): decides Refine's engine and its parameter defaults.

This is the measurement half of the local checklist **L1**; it runs on the owner's machine with the
real weights. It writes a JSON report and (with the listening pack) the blind A/B material.

Arms (plan §4.4):

- ``resample only`` - the pure resampler, the baseline;
- ``universr`` - the released checkpoint through Plenio's own adapter (``models/audio_sr``);
- ``external:<name>=<dir>`` - files another tool already produced (for example the legacy toolkit's
  FlashSR node, which stays installed side by side), so FlashSR is evaluated without vendoring it.

Material (plan §4.5):

- **simulation set** - full-band 48 kHz references; each is band-limited at ``--edge-hz`` (the
  measured MiniMax edge, default 14.5 kHz) and refined; the 16-24 kHz band is compared with the
  reference (log-spectral distance);
- **target set** - unmastered MiniMax takes (``--targets <dir>``); there is no reference, so the
  metrics describe what Refine *added* (fizz index, loudness change, true peak, timing).

Metrics: log-spectral distance 16-24 kHz, HF fizz (spectral flatness of 16-24 kHz and its envelope
correlation with 4-16 kHz), onset pre-echo in the HF band, loudness change in LU, true peak, real-time
factor and peak VRAM. The decision rule (§4.5): a model engine becomes the MiniMax default only if it
wins >= 70 % of the blind trials on >= 10 takes and shows no metric regression.

    <python with numpy, scipy, av and (for the model arm) torch> \\
        tools/studies/sr_study.py --out docs/test-reports/data/sr-study.json \\
        --models F:/ComfyUI/models --settings docs/test-reports/data/sr-study-settings.json \\
        [--edge-hz 14500] [--pack <dir>] reference/*.flac [--targets minimax-takes/]

With ``--pack <dir>`` the tool also writes the **blind A/B material** for the listening half of L1:
per simulation entry two level-matched files (``1.flac``/``2.flac``, order shuffled reproducibly) -
the band-limited input against the refined arm - plus ``key.json`` (do not open before judging) and
``README.md`` with the question. An arm that only resampled ("input already full band") writes no
pair and says so: there would be nothing to hear.

The settings file (optional) overrides the parameter grid, for example::

    {"universr": [{"pre_hz": 0, "crossover_hz": 0, "sr_gain": 1.0, "post_hz": 0, "engine": "universr"}]}
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

PROJECT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT))

from plenio.core.audio.loudness import measure  # noqa: E402
from plenio.core.audio.refine import OUTPUT_RATE, RefineSettings, refine  # noqa: E402
from plenio.core.audio.resample import lowpass, resample  # noqa: E402

DEFAULT_EDGE_HZ = 14500.0
ANALYSIS_FFT = 8192
BANDS = {"low": (4000.0, 16000.0), "high": (16000.0, 24000.0)}


# --- helpers ------------------------------------------------------------------------------------


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


def band_limit(samples: np.ndarray, rate: int, edge_hz: float) -> np.ndarray:
    """The simulation set's input: the reference low-passed at the MiniMax edge (linear phase)."""
    if edge_hz >= rate / 2 - 100:
        return samples
    kernel = lowpass(rate, edge_hz - 500.0, edge_hz + 500.0, 90.0)
    from scipy.signal import oaconvolve

    return np.asarray(oaconvolve(samples, kernel[None, :], mode="same", axes=-1))


def _frames(mono: np.ndarray, size: int = ANALYSIS_FFT, hop: int | None = None) -> np.ndarray:
    hop = hop or size // 2
    window = np.hanning(size)
    rows = [mono[s : s + size] * window for s in range(0, max(mono.size - size, 0), hop)]
    rows = [row for row in rows if float(np.mean(row * row)) > 1e-8]
    return np.array(rows) if rows else np.zeros((0, size))


def _band_db(frames: np.ndarray, rate: int, low: float, high: float) -> np.ndarray:
    power = np.abs(np.fft.rfft(frames, axis=-1)) ** 2
    freqs = np.fft.rfftfreq(frames.shape[-1], 1 / rate)
    select = (freqs >= low) & (freqs < high)
    mean = power[:, select].mean(axis=0) + 1e-30
    return 10 * np.log10(mean)


def log_spectral_distance(reference: np.ndarray, other: np.ndarray, rate: int) -> float | None:
    """Mean absolute difference (dB) of the long-term 16-24 kHz spectra of two signals."""
    low, high = BANDS["high"]
    high = min(high, rate / 2)
    a = _band_db(_frames(reference.mean(axis=0)), rate, low, high)
    b = _band_db(_frames(other.mean(axis=0)), rate, low, high)
    if not a.size or not b.size or a.shape != b.shape:
        return None
    return float(np.mean(np.abs(a - b)))


def fizz_index(samples: np.ndarray, rate: int) -> dict[str, float] | None:
    """How synthetic the added HF sounds: flatness of 16-24 kHz and its envelope vs. 4-16 kHz.

    A 'fizz' is noise-like and unrelated to the music: high spectral flatness in the high band and a
    low correlation of its loudness envelope with the low band's.
    """
    high = min(BANDS["high"][1], rate / 2)
    if high - BANDS["high"][0] < 1000:
        return None
    mono = samples.mean(axis=0)
    size, hop = 2048, 1024
    window = np.hanning(size)
    rows = np.array([mono[s : s + size] * window for s in range(0, max(mono.size - size, 0), hop)])
    if rows.shape[0] < 4:
        return None
    power = np.abs(np.fft.rfft(rows, axis=-1)) ** 2
    freqs = np.fft.rfftfreq(size, 1 / rate)
    high_band = (freqs >= BANDS["high"][0]) & (freqs < high)
    low_band = (freqs >= BANDS["low"][0]) & (freqs < BANDS["low"][1])
    if not high_band.any() or not low_band.any():
        return None
    high_power = power[:, high_band]
    geometric = np.exp(np.mean(np.log(high_power + 1e-30), axis=1))
    flatness = float(np.mean(geometric / (np.mean(high_power, axis=1) + 1e-30)))
    high_env = np.sqrt(power[:, high_band].sum(axis=1))
    low_env = np.sqrt(power[:, low_band].sum(axis=1))
    if high_env.std() < 1e-12 or low_env.std() < 1e-12:
        correlation = 0.0
    else:
        correlation = float(np.corrcoef(high_env, low_env)[0, 1])
    return {"flatness": round(flatness, 4), "envelope_correlation": round(correlation, 4)}


def onset_pre_echo_ms(samples: np.ndarray, rate: int, threshold_db: float = -12.0) -> float | None:
    """The longest HF energy *before* a strong onset, in ms (a negative result: none found).

    Onsets come from the low band's envelope (a rise of >= ``threshold_db``); the HF band is checked
    for energy up to 30 ms earlier, which is what a smeared/latent reconstruction produces.
    """
    high = min(BANDS["high"][1], rate / 2)
    mono = samples.mean(axis=0)
    size, hop = 1024, 256
    window = np.hanning(size)
    rows = np.array([mono[s : s + size] * window for s in range(0, max(mono.size - size, 0), hop)])
    if rows.shape[0] < 8:
        return None
    power = np.abs(np.fft.rfft(rows, axis=-1)) ** 2
    freqs = np.fft.rfftfreq(size, 1 / rate)
    low = np.sqrt(power[:, (freqs >= 200) & (freqs < BANDS["low"][1])].sum(axis=1))
    high_env = np.sqrt(power[:, (freqs >= BANDS["high"][0]) & (freqs < high)].sum(axis=1))
    if not low.size or not high_env.size:
        return None
    low_db = 20 * np.log10(low + 1e-30)
    high_db = 20 * np.log10(high_env + 1e-30)
    rises = [
        index
        for index in range(1, len(low_db))
        if low_db[index] - low_db[index - 1] >= threshold_db and low_db[index] > low_db.max() - 12
    ]
    frames_back = int(round(0.030 * rate / hop))
    worst = 0.0
    for index in rises:
        start = max(0, index - frames_back)
        if start == index:
            continue
        before = float(high_db[start:index].max()) if index > start else -np.inf
        after = float(high_db[index : index + frames_back].max())
        if after > -np.inf and before - after > 3.0:  # HF is louder before the onset than after it
            worst = max(worst, (index - start) * hop / rate * 1000.0)
    return round(worst, 2)


def loudness(samples: np.ndarray, rate: int) -> dict[str, Any]:
    facts = measure(samples, rate)
    return {
        "integrated_lufs": None if facts.integrated_lufs is None else round(facts.integrated_lufs, 3),
        "true_peak_dbtp": None if facts.true_peak_dbtp is None else round(facts.true_peak_dbtp, 3),
        "peak": round(float(np.abs(samples).max()), 6),
    }


# --- arms ---------------------------------------------------------------------------------------


@dataclass(frozen=True)
class Arm:
    name: str
    engine: Any = None
    settings: RefineSettings = RefineSettings()
    directory: Path | None = None

    def run(self, samples: np.ndarray, rate: int) -> tuple[np.ndarray, dict[str, Any]]:
        if self.directory is not None:
            return samples, {"engine": self.name, "external": str(self.directory)}
        return refine(samples, rate, self.engine, self.settings)


def load_engine(models_dir: Path | None) -> Any:
    """The released UniverSR engine through Plenio's adapter (needs the weights and torch).

    The tool is standalone, so the folder is read directly (``--models`` or ComfyUI's models folder)
    instead of ComfyUI's folder registry.
    """
    try:
        from _common import import_comfy_if_available
    except ImportError:  # run from another folder
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from _common import import_comfy_if_available

    import_comfy_if_available()  # before the load: the adapter asks ComfyUI for the device
    from plenio.comfy import audio_models, host, universr
    from plenio.core.errors import PlenioError
    from plenio.core.models import AUDIO_MODEL_FOLDERS

    folder = AUDIO_MODEL_FOLDERS["super-resolution"]
    root = Path(models_dir) if models_dir else Path(host.models_directory())
    directory = root / folder
    files = sorted(
        path.name for path in directory.glob("*") if path.is_file() and universr.matches(path.name)
    )
    if not files:
        raise SystemExit(
            f"no super-resolution model found in {directory}: put the UniverSR weights there "
            "(see docs/user/models.md), or select only the arm 'resample only'"
        )
    try:
        return audio_models.load("super-resolution", files[0], directory / files[0]).engine
    except PlenioError as error:
        raise SystemExit(str(error)) from error


def build_arms(
    settings: dict[str, list[dict[str, Any]]],
    models_dir: Path | None,
    only: list[str],
    external: list[str],
) -> list[Arm]:
    """The arms to measure: resample only, every model configuration, the external files (plan §4.4)."""
    wanted = set(only)
    arms: list[Arm] = []
    if not wanted or "resample only" in wanted:
        arms.append(Arm("resample only"))
    for engine_name, configs in (settings or {"universr": [{}]}).items():
        labels = [f"{engine_name}[{index + 1}]" for index in range(len(configs))]
        if wanted and not wanted & set(labels):
            continue
        # only UniverSR has an in-process adapter; other engines are measured through --external
        engine = load_engine(models_dir) if engine_name == "universr" else None
        for label, config in zip(labels, configs, strict=True):
            if wanted and label not in wanted:
                continue
            values = {key: value for key, value in config.items() if key != "engine"}
            arms.append(Arm(label, engine, RefineSettings(**values)))
    for arm in external_arms(external):
        if not wanted or arm.name in wanted:
            arms.append(arm)
    return arms


def external_arms(entries: list[str]) -> list[Arm]:
    arms = []
    for entry in entries:
        name, _, directory = entry.partition("=")
        path = Path(directory)
        if not path.is_dir():
            raise SystemExit(f"--external {entry}: {path} is not a directory")
        arms.append(Arm(name or path.name, directory=path))
    return arms


# --- the study ----------------------------------------------------------------------------------


def _measure(
    before: np.ndarray | None,
    reference: np.ndarray | None,
    result: np.ndarray,
    rate: int,
    seconds: float,
    peak_vram: int | None,
) -> dict[str, Any]:
    audio_seconds = result.shape[-1] / rate
    facts: dict[str, Any] = {
        "seconds": round(seconds, 3),
        "real_time_factor": round(audio_seconds / seconds, 4) if seconds > 0 else None,
        "loudness": loudness(result, rate),
        "fizz": fizz_index(result, rate),
        "onset_pre_echo_ms": onset_pre_echo_ms(result, rate),
    }
    if before is not None:
        # the stage's own level change (plan §4.5: must stay below 0.1 LU)
        prior = loudness(before, rate)
        if prior["integrated_lufs"] is not None and facts["loudness"]["integrated_lufs"] is not None:
            facts["loudness_change_lu"] = round(
                facts["loudness"]["integrated_lufs"] - prior["integrated_lufs"], 3
            )
    if reference is not None:
        facts["lsd_16_24_db"] = log_spectral_distance(reference, result, rate)
    if peak_vram is not None:
        facts["peak_vram_mb"] = round(peak_vram / 1024 / 1024, 1)
    return facts


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


def run_study(
    arms: list[Arm],
    references: list[Path],
    targets: list[Path],
    *,
    edge_hz: float,
    pack: Path | None = None,
) -> dict[str, Any]:
    report: dict[str, Any] = {
        "schema": "plenio.sr-study/1",
        "edge_hz": edge_hz,
        "output_rate": OUTPUT_RATE,
        "simulation": {},
        "targets": {},
    }
    for path in references:
        samples, rate = decode(path)
        if rate != OUTPUT_RATE:
            samples = resample(samples, rate, OUTPUT_RATE)
            rate = OUTPUT_RATE
        limited = band_limit(samples, rate, edge_hz)
        entry = {
            "input": str(path),
            "input_bandwidth_hz": _bandwidth(limited, rate),
            "input_lsd_16_24_db": log_spectral_distance(samples, limited, rate),
            "arms": {},
        }
        outputs: dict[str, np.ndarray] = {}
        for arm in arms:
            _reset_vram()
            started = time.perf_counter()
            result, stage = arm.run(limited, rate)
            seconds = time.perf_counter() - started
            outputs[arm.name] = result
            entry["arms"][arm.name] = {
                "report": stage,
                **_measure(limited, samples, result, OUTPUT_RATE, seconds, _peak_vram()),
            }
        if pack is not None:
            entry["pack"] = write_pack(pack, path, limited, entry["arms"], outputs, OUTPUT_RATE)
        report["simulation"][path.name] = entry
    for path in targets:
        samples, rate = decode(path)
        entry = {"input": str(path), "input_bandwidth_hz": _bandwidth(samples, rate), "arms": {}}
        for arm in arms:
            if arm.directory is not None:
                candidate = arm.directory / path.name
                if not candidate.is_file():
                    continue
                produced, produced_rate = decode(candidate)
                entry["arms"][arm.name] = _measure(samples, None, produced, produced_rate, 0.0, None)
                continue
            _reset_vram()
            started = time.perf_counter()
            result, stage = arm.run(samples, rate)
            seconds = time.perf_counter() - started
            entry["arms"][arm.name] = {
                "report": stage,
                **_measure(samples, None, result, OUTPUT_RATE, seconds, _peak_vram()),
            }
        report["targets"][path.name] = entry
    report["summary"] = summarize(report)
    return report


def write_pack(
    pack: Path,
    reference: Path,
    limited: np.ndarray,
    arms: dict[str, dict[str, Any]],
    outputs: dict[str, np.ndarray],
    rate: int,
) -> dict[str, Any]:
    """The blind A/B pair(s) for one simulation entry: the band-limited input against a refined arm.

    Both files are the same length and level (Refine does not normalise), so the only difference is
    what the arm added. The order is shuffled with a fixed seed; ``key.json`` names the winner and
    ``README.md`` asks the question. Arms that changed nothing (the baseline, or an arm that only
    resampled because the input was full band) write no pair - there would be nothing to hear.
    """
    import random

    from plenio.core.release import safe_filename, write_audio

    results: dict[str, Any] = {}
    pairs: dict[str, np.ndarray] = {}
    for arm_name, facts in arms.items():
        note = (facts.get("report") or {}).get("notes")
        if note:
            results[arm_name] = {"skipped": note[0]}
        elif arm_name in outputs and not np.allclose(outputs[arm_name], limited, atol=0.0):
            pairs[arm_name] = outputs[arm_name]
        else:
            results[arm_name] = {"skipped": "the arm returned the input unchanged"}
    if not pairs:
        return results
    folder = pack / safe_filename(reference.stem)
    folder.mkdir(parents=True, exist_ok=True)
    rng = random.Random(0xA11CE)
    key: dict[str, Any] = {}
    for arm_name, refined in pairs.items():
        first = bool(rng.random() < 0.5)
        write_audio(folder / "1.flac", limited if first else refined, rate, "flac", {"title": "1"})
        write_audio(folder / "2.flac", refined if first else limited, rate, "flac", {"title": "2"})
        key[arm_name] = {"band-limited": 1 if first else 2, "refined": 2 if first else 1}
    (folder / "key.json").write_text(
        json.dumps({"reference": str(reference), "pairs": key}, indent=1, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (folder / "README.md").write_text(
        f"# Blind A/B: {reference.name}\n\n"
        "`1.flac` and `2.flac` are the same recording at the same level; one is band-limited at "
        "the MiniMax edge, the other ran through a Refine arm.\n\n"
        "Listen (headphones help) and answer:\n\n"
        "1. Which file sounds more open - 1 or 2?\n"
        "2. Does the winner sound natural, or does it hiss, fizz or smear (cymbals, sibilance)?\n"
        "3. Is the difference worth the run time (see the JSON report's real-time factor)?\n\n"
        "Afterwards open `key.json`; it names the arm and which number it was.\n",
        encoding="utf-8",
    )
    return {"folder": str(folder), "key": key, **results}


def _bandwidth(samples: np.ndarray, rate: int) -> float | None:
    from plenio.core.audio.refine import measure_bandwidth

    edge = measure_bandwidth(samples, rate)
    return None if edge is None else round(edge, 1)


def summarize(report: dict[str, Any]) -> dict[str, Any]:
    """Per-arm averages over each set (the decision rule of §4.5 needs the listening verdicts too)."""
    summary: dict[str, Any] = {"simulation": {}, "targets": {}}
    for section in ("simulation", "targets"):
        per_arm: dict[str, list[dict[str, Any]]] = {}
        for entry in report[section].values():
            for arm, facts in entry["arms"].items():
                per_arm.setdefault(arm, []).append(facts)
        for arm, facts in per_arm.items():

            def mean(key: str, items: list[dict[str, Any]] = facts) -> float | None:
                values = []
                for item in items:
                    value: Any = item
                    for part in key.split("."):
                        value = value.get(part) if isinstance(value, dict) else None
                    if isinstance(value, (int, float)) and not isinstance(value, bool):
                        values.append(float(value))
                return round(float(np.mean(values)), 4) if values else None

            fizz = [f["fizz"] for f in facts if f.get("fizz")]
            summary[section][arm] = {
                "files": len(facts),
                "lsd_16_24_db": mean("lsd_16_24_db"),
                "fizz_flatness": round(float(np.mean([f["flatness"] for f in fizz])), 4) if fizz else None,
                "fizz_correlation": round(float(np.mean([f["envelope_correlation"] for f in fizz])), 4)
                if fizz
                else None,
                "loudness_change_lu": mean("loudness_change_lu"),
                "true_peak_dbtp": mean("loudness.true_peak_dbtp"),
                "real_time_factor": mean("real_time_factor"),
            }
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("references", nargs="*", type=Path, help="full-band 48 kHz files (simulation set)")
    parser.add_argument("--targets", type=Path, help="folder of unmastered MiniMax takes")
    parser.add_argument(
        "--out", type=Path, default=PROJECT / "docs" / "test-reports" / "data" / "sr-study.json"
    )
    parser.add_argument("--settings", type=Path, help="parameter grid per engine (JSON)")
    parser.add_argument("--models", type=Path, help="ComfyUI models folder (for models/audio_sr)")
    parser.add_argument(
        "--edge-hz", type=float, default=DEFAULT_EDGE_HZ, help="band limit of the simulation set"
    )
    parser.add_argument(
        "--external",
        action="append",
        default=[],
        metavar="NAME=DIR",
        help="an arm whose files another tool produced (e.g. flashsr=/path/to/refined)",
    )
    parser.add_argument(
        "--pack",
        type=Path,
        help="write the blind A/B material (two level-matched files, key.json, README.md) here",
    )
    parser.add_argument("--only", action="append", default=[], help="arm names to keep")
    args = parser.parse_args(argv)

    settings = json.loads(args.settings.read_text(encoding="utf-8")) if args.settings else {}
    arms = build_arms(settings, args.models, args.only, args.external)
    if not arms:
        raise SystemExit("no arm selected: check --only against the settings file")
    targets = sorted(p for p in (args.targets.glob("*") if args.targets else []) if p.is_file())
    if not args.references and not targets:
        raise SystemExit("nothing to measure: pass reference files and/or --targets")
    report = run_study(arms, list(args.references), targets, edge_hz=args.edge_hz, pack=args.pack)
    report["arms"] = [arm.name for arm in arms]
    report["devices"] = {
        arm.name: str(getattr(arm.engine, "device", "")) for arm in arms if arm.engine is not None
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print(f"wrote {args.out}")
    for section, arms_summary in report["summary"].items():
        for arm, facts in arms_summary.items():
            lsd = facts["lsd_16_24_db"]
            print(
                f"  {section:10s} {arm:16s} files {facts['files']:3d}  "
                f"LSD {lsd if lsd is not None else '-':>8}  "
                f"fizz {facts['fizz_flatness'] if facts['fizz_flatness'] is not None else '-':>7}  "
                f"RTF {facts['real_time_factor'] if facts['real_time_factor'] else '-'}"
            )
    print("\nThe decision also needs the blind listening verdicts (tools/studies/listening_pack.py).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
