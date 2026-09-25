"""The only module that touches ComfyUI internals.

Nodes and routes call these wrappers instead of importing ``comfy``,
``folder_paths``, ``server`` or ``comfy_execution`` themselves, so that a
ComfyUI API change is fixed in one place.
"""

from __future__ import annotations

import importlib.metadata
import logging
import os
import platform
import sys
from pathlib import Path
from typing import Any

from .. import __version__
from ..core.config import CONFIG_FILE_NAME, PlenioConfig
from ..core.dependencies import probe
from ..core.engines import EngineInfo, yue2
from ..core.errors import PlenioModelError
from ..core.system import Device, SystemFacts

log = logging.getLogger("plenio")

ASSET_FOLDER = "plenio"
"""ComfyUI model folder name for Plenio-owned assets (``models/plenio/<kind>/<id>``)."""


def comfyui_version() -> str:
    try:
        import comfyui_version

        return str(comfyui_version.__version__)
    except (ImportError, AttributeError):
        return "unknown"


def frontend_version() -> str:
    try:
        return importlib.metadata.version("comfyui_frontend_package")
    except importlib.metadata.PackageNotFoundError:
        return "unknown"


def user_directory() -> Path:
    import folder_paths

    return Path(folder_paths.get_user_directory())


def output_directory() -> Path:
    import folder_paths

    return Path(folder_paths.get_output_directory())


def models_directory() -> Path:
    import folder_paths

    return Path(folder_paths.models_dir)


def register_model_folders() -> None:
    """Register ``models/plenio`` so that assets live next to the other models."""
    import folder_paths

    if ASSET_FOLDER not in folder_paths.folder_names_and_paths:
        folder_paths.add_model_folder_path(ASSET_FOLDER, str(models_directory() / ASSET_FOLDER))


def asset_root(config: PlenioConfig) -> Path:
    if config.asset_dir is not None:
        return config.asset_dir
    import folder_paths

    paths = folder_paths.get_folder_paths(ASSET_FOLDER)
    return Path(paths[0]) if paths else models_directory() / ASSET_FOLDER


def load_config() -> PlenioConfig:
    return PlenioConfig.load(env=os.environ, config_file=user_directory() / "plenio" / CONFIG_FILE_NAME)


def prompt_server_routes() -> Any:
    from server import PromptServer

    return PromptServer.instance.routes


def execution_blocker(message: str | None = None) -> Any:
    """A per-output blocker: ``None`` blocks silently, a message blocks with an error."""
    from comfy_execution.graph_utils import ExecutionBlocker

    return ExecutionBlocker(message)


def is_interrupted() -> bool:
    import comfy.model_management

    return bool(comfy.model_management.processing_interrupted())


def raise_if_interrupted() -> None:
    import comfy.model_management

    comfy.model_management.throw_exception_if_processing_interrupted()


def free_memory(required_bytes: int, device: str | None = None) -> None:
    """Ask ComfyUI to make room on ``device`` before an out-of-process worker starts (R9)."""
    import comfy.model_management
    import torch

    target = torch.device(device) if device else comfy.model_management.get_torch_device()
    comfy.model_management.free_memory(required_bytes, target)


def send_event(event: str, data: dict[str, Any]) -> None:
    """Send a custom message to the browser that queued the prompt (``api.addEventListener`` in the frontend)."""
    from server import PromptServer

    server = PromptServer.instance
    server.send_sync(event, data, server.client_id)


class _YuE2Tokenizer:
    """Exact YuE2 token counts through the loaded text encoder's own tokenizer (AS-14)."""

    def __init__(self, tokenizer: Any):
        self._tokenizer = tokenizer

    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        tokens = self._tokenizer.tokenize_with_weights(style, lyrics=lyrics, cot=mode)
        return len(tokens["prefix"])

    def abc_tokens(self, abc: str) -> int:
        tokens = self._tokenizer.tokenize_with_weights("", lyrics="", cot="full", abc=abc)
        return len(tokens["abc_ids"])


def detect_engine(clip: Any) -> EngineInfo:
    """Identify the music model behind a CLIP object and return its engine descriptor."""
    import hashlib

    tokenizer = getattr(clip, "tokenizer", None)
    kind = type(tokenizer)
    if kind.__name__ == "YuE2Tokenizer" and kind.__module__.endswith("text_encoders.yue2"):
        raw = getattr(tokenizer, "tokenizer_json", b"")
        model = {
            "text_encoder": type(getattr(clip, "cond_stage_model", None)).__name__,
            "tokenizer": f"{kind.__module__}.{kind.__name__}",
            "tokenizer_sha256": hashlib.sha256(bytes(raw)).hexdigest() if raw else None,
        }
        return EngineInfo(
            yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities(), model, _YuE2Tokenizer(tokenizer)
        )
    detected = f"{kind.__module__}.{kind.__name__}" if tokenizer is not None else "no tokenizer"
    raise PlenioModelError(
        f"The connected model is not a supported music model (text encoder tokenizer: {detected}).",
        hint="Connect the CLIP output of the YuE2 Model block (checkpoint yue2_3b_int8_convrot.safetensors).",
    )


# --- audio ----------------------------------------------------------------------------------


def audio_sha256(audio: Any) -> str:
    """Hash of a ComfyUI AUDIO value (first batch item: samples and sample rate)."""
    import hashlib

    waveform = audio["waveform"][0].detach().to("cpu").float().contiguous()
    digest = hashlib.sha256()
    digest.update(str(int(audio["sample_rate"])).encode())
    digest.update(str(tuple(waveform.shape)).encode())
    digest.update(waveform.numpy().tobytes())
    return digest.hexdigest()


def audio_facts(audio: Any) -> tuple[Any, int, float]:
    """``(samples as numpy [channels, n], sample rate, seconds)`` of the first batch item."""
    waveform = audio["waveform"][0].detach().to("cpu").float()
    rate = int(audio["sample_rate"])
    return waveform.numpy(), rate, waveform.shape[-1] / rate


def audio_batch(audio: Any) -> int:
    return int(audio["waveform"].shape[0])


def mono_16k(audio: Any) -> Any:
    """The first batch item as 16 kHz mono float32 numpy (the input format of Whisper)."""
    import torchaudio

    waveform = audio["waveform"][0:1].float().mean(dim=1)
    resampled = torchaudio.functional.resample(waveform, int(audio["sample_rate"]), 16000)
    return resampled[0].detach().to("cpu").numpy()


def temp_directory() -> Path:
    import folder_paths

    return Path(folder_paths.get_temp_directory())


def save_reference_audio(audio: Any) -> dict[str, str]:
    """A temporary Opus copy of the first batch item for the editor's A/B player (``/view`` URL parts)."""
    from comfy_api.latest import io, ui

    first = {"waveform": audio["waveform"][:1], "sample_rate": audio["sample_rate"]}
    saved = ui.AudioSaveHelper.save_audio(
        first, filename_prefix="plenio_reference", folder_type=io.FolderType.temp, cls=None, format="opus"
    )
    item = saved[0]
    return {"filename": item["filename"], "subfolder": item["subfolder"], "type": item["type"]}


# --- SheetSage2 (native encoder, beat grid) ----------------------------------------------------

SHEETSAGE_WINDOW_S = 300.0
"""The native encoder pads every window to 300 s; longer audio needs a second native window."""


class _TranscriptionInternalsError(RuntimeError):
    pass


def _sheetsage_modules() -> tuple[Any, Any]:
    try:
        import comfy.model_management as mm
        from comfy.audio_encoders import sheetsage2_abc as ss
    except ImportError as error:  # pragma: no cover - depends on the ComfyUI version
        raise _TranscriptionInternalsError(str(error)) from error
    for name in ("events_to_abc", "infer_measures", "BeatEvent"):
        if not hasattr(ss, name):
            raise _TranscriptionInternalsError(f"comfy.audio_encoders.sheetsage2_abc.{name}")
    return mm, ss


def is_sheetsage_encoder(encoder: Any) -> bool:
    return hasattr(encoder, "generate_abc") and getattr(encoder, "model_sample_rate", None) == 24000


def sheetsage_events(encoder: Any, audio: Any) -> tuple[list[dict[str, Any]], float]:
    """Decoded SheetSage2 events of the first batch item (the path of ``generate_abc``)."""
    import torchaudio

    mm, _ss = _sheetsage_modules()
    model = getattr(encoder, "model", None)
    if model is None or not hasattr(model, "transcribe"):
        raise _TranscriptionInternalsError("SheetSage2AudioEncoder.model.transcribe")
    mono = torchaudio.functional.resample(
        audio["waveform"][0:1].float().mean(dim=1), int(audio["sample_rate"]), encoder.model_sample_rate
    )
    if getattr(encoder, "patcher", None) is not None:
        mm.load_model_gpu(encoder.patcher)
    waveform = mono[0]
    events = model.transcribe(waveform[None].to(encoder.load_device))
    return events, waveform.shape[-1] / encoder.model_sample_rate


def _beats(events: list[dict[str, Any]], duration: float, ss: Any) -> list[Any]:
    """The beat list exactly as ``events_to_abc`` builds and extends it."""
    from fractions import Fraction
    from statistics import median

    beats: list[Any] = []
    meter = None
    for event in events:
        rhythm = event["values"].get("rhythm", {})
        meter = rhythm.get("meter", meter)
        eighth = rhythm.get("eighth_position")
        if eighth is not None and meter is not None:
            position = Fraction(eighth * meter[1], 8)
            beats.append(ss.BeatEvent(event["time"], int(position) + 1, meter[0], meter[1]))
    if len(beats) < 2:
        return beats
    period = float(median([b.time - a.time for a, b in zip(beats[-9:], beats[-8:], strict=False)]))
    while beats[-1].time < duration - 1e-6:
        previous = beats[-1]
        beats.append(
            ss.BeatEvent(
                previous.time + period,
                previous.beat_id % previous.declared_numerator + 1,
                previous.declared_numerator,
                previous.denominator,
            )
        )
    return beats


def sheetsage_transcribe(encoder: Any, audio: Any) -> dict[str, Any]:
    """Native SheetSage2 transcription (full mode) plus the beat grid the native node discards.

    Returns ``abc`` (identical to ``SheetSage2AudioToABC(mode="full")``), ``bar_starts``/``bar_ends``
    in source seconds, ``vocal_notes`` [(onset, end)], ``first_beat_s``, ``pickup_padded`` and
    ``engine_path`` (``events`` or ``public`` when the internals are missing - then without a grid).
    """
    try:
        mm, ss = _sheetsage_modules()
        events, duration = sheetsage_events(encoder, audio)
    except _TranscriptionInternalsError as missing:
        log.warning(
            "Plenio: SheetSage2 internals not available (%s); transcribing without a time grid", missing
        )
        abc = encoder.generate_abc(audio["waveform"][0:1], audio["sample_rate"], melody_only=False)[0]
        return {"abc": abc, "engine_path": "public", "missing": str(missing)}
    del mm
    abc = ss.events_to_abc(events, duration, melody_only=False)
    beats = _beats(events, duration, ss)
    measures, _diagnostics = ss.infer_measures(beats)
    starts = [beats[m.start_beat].time for m in measures]
    ends = [beats[m.end_beat].time if m.end_beat < len(beats) else duration for m in measures]
    first = measures[0]
    if first.pad_before and len(measures) > 1:
        count = first.end_beat - first.start_beat
        full = measures[1].end_beat - measures[1].start_beat
        local = (beats[first.end_beat].time - beats[first.start_beat].time) / max(count, 1)
        starts[0] = beats[first.start_beat].time - (full - count) * local
    vocal = []
    for event in events:
        for note in event["values"].get("melody", ()):
            end = min(duration, note["end_time"])
            if note["track"] == 0 and end > event["time"]:
                vocal.append((float(event["time"]), float(end)))
    return {
        "abc": abc,
        "engine_path": "events",
        "duration_s": duration,
        "bar_starts": starts,
        "bar_ends": ends,
        "first_beat_s": float(beats[0].time) if beats else 0.0,
        "pickup_padded": bool(first.pad_before),
        "vocal_notes": sorted(vocal),
    }


def gpu_total_bytes() -> int | None:
    try:
        import torch

        if torch.cuda.is_available():
            return int(torch.cuda.get_device_properties(torch.cuda.current_device()).total_memory)
    except (ImportError, RuntimeError):
        return None
    return None


def is_out_of_memory(error: BaseException) -> bool:
    try:
        import torch

        return isinstance(error, torch.OutOfMemoryError)
    except (ImportError, AttributeError):
        return "out of memory" in str(error).lower()


def is_interruption(error: BaseException) -> bool:
    """ComfyUI's cancel exception (it must pass through unchanged)."""
    try:
        import comfy.model_management as mm

        return isinstance(error, mm.InterruptProcessingException)
    except (ImportError, AttributeError):
        return type(error).__name__ == "InterruptProcessingException"


# --- progress ----------------------------------------------------------------------------------


class Progress:
    """ComfyUI's node progress bar (0..100) for long Plenio steps."""

    def __init__(self, total: int = 100):
        import comfy.utils

        self._bar = comfy.utils.ProgressBar(total)
        self._total = total

    def update(self, fraction: float | None) -> None:
        if fraction is not None:
            self._bar.update_absolute(int(max(0.0, min(1.0, fraction)) * self._total), self._total)


def package_root() -> Path:
    """The folder that contains the ``plenio`` package (for worker processes)."""
    return Path(__file__).resolve().parents[2]


def _devices() -> tuple[Device, ...]:
    try:
        import torch
    except ImportError:
        return ()
    devices: list[Device] = []
    if torch.cuda.is_available():
        for index in range(torch.cuda.device_count()):
            properties = torch.cuda.get_device_properties(index)
            free: int | None
            try:
                free, _total = torch.cuda.mem_get_info(index)
            except RuntimeError:
                free = None
            devices.append(Device(index, properties.name, "cuda", int(properties.total_memory), free))
    if not devices:
        devices.append(Device(0, platform.processor() or "CPU", "cpu"))
    return tuple(devices)


def system_facts() -> SystemFacts:
    import comfy.model_management

    try:
        import psutil

        ram: int | None = int(psutil.virtual_memory().total)
    except ImportError:
        ram = None
    try:
        import torch

        torch_version = str(torch.__version__)
    except ImportError:
        torch_version = "not installed"
    return SystemFacts(
        plenio_version=__version__,
        comfyui_version=comfyui_version(),
        frontend_version=frontend_version(),
        python_version=sys.version.split()[0],
        platform=f"{platform.system()} {platform.release()}",
        torch_version=torch_version,
        active_device=str(comfy.model_management.get_torch_device()),
        devices=_devices(),
        ram_total_bytes=ram,
        packages=probe(),
        config=load_config().summary(),
    )
