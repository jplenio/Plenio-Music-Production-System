"""Transcribe Lyrics: sung words of a recording, placed into the final score's sections.

Also the *sung-lyrics check*: with ``expected_lyrics`` connected it compares what is sung in a take
with the lyrics the take was given (WER overall and per section).
"""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.alignment import LOW_CONFIDENCE, align, check_sung_lyrics, drop_inventions, join_tokens
from ...core.asr import (
    ENGINES,
    AsrCache,
    AsrNotes,
    AsrSettings,
    cache_key,
    engine_for,
    result_from_dict,
    weak_segments,
)
from ...core.assets import ensure_asset, missing_files
from ...core.brief import CoverBrief
from ...core.errors import PlenioUserError
from ...core.hashing import sha256_text
from ...core.reports import Report, Status
from ...core.sheet.resolve import normalize_document
from ...core.workers import WorkerEnv, WorkerLimits, run_worker
from .. import host
from ..shared import asset_catalogue
from ..types import Brief, ReportType, TimelineType

LANGUAGES = {
    "en": "English",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "it": "Italian",
    "pt": "Portuguese",
    "nl": "Dutch",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish",
    "pl": "Polish",
    "cs": "Czech",
    "ru": "Russian",
    "uk": "Ukrainian",
    "tr": "Turkish",
    "el": "Greek",
    "ar": "Arabic",
    "hi": "Hindi",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
}
MIN_RELIABLE_WORDS = 5
ASR_VRAM_BYTES = 4 * 2**30


def language_code(value: str) -> str:
    """``auto``/empty -> ``""``; a code or an English language name -> the Whisper code."""
    text = value.strip()
    if not text or text.lower() == "auto":
        return ""
    if text.lower() in LANGUAGES:
        return text.lower()
    for code, name in LANGUAGES.items():
        if name.lower() == text.lower():
            return code
    raise PlenioUserError(
        f"Unknown lyrics language {value!r}.",
        hint=f"Use 'auto', a language code or one of: {', '.join(LANGUAGES.values())}.",
    )


def _model_folder(asset_id: str, progress: host.Progress) -> tuple[Path, str]:
    config = host.load_config()
    asset = asset_catalogue()[asset_id]
    configured = config.asset_paths.get(asset_id)
    if configured is not None:
        if missing_files(asset, configured):
            raise PlenioUserError(
                f"The folder configured for {asset_id} ({configured}) does not hold the expected model files.",
                hint="Fix [asset_paths] in the Plenio config.toml or remove the entry; files: "
                + ", ".join(f.path for f in asset.files),
            )
        return configured, asset.revision
    folder = ensure_asset(
        asset,
        host.asset_root(config),
        config,
        progress=lambda done, total, _message: progress.update(0.3 * done / max(total, 1)),
        is_cancelled=host.is_interrupted,
    )
    return folder, asset.revision


def asr_notes() -> AsrNotes:
    return AsrNotes(host.user_directory() / "plenio" / "cache" / "asr-notes")


def asr_cache() -> AsrCache:
    return AsrCache(host.user_directory() / "plenio" / "cache" / "asr")


def _run_asr(audio: Any, settings: AsrSettings, source_sha256: str, progress: host.Progress) -> Any:
    engine = engine_for(settings.engine)
    cache = asr_cache()
    key = cache_key(source_sha256, settings, asset_catalogue()[engine.asset_id].revision)
    cached = cache.get(key)
    if cached is not None:
        return cached  # a stored result: no model, no worker, the same draft as before
    model_dir, _revision = _model_folder(engine.asset_id, progress)
    import numpy as np

    config = host.load_config()
    samples = host.mono_16k(audio)
    folder = host.temp_directory() / "plenio"
    folder.mkdir(parents=True, exist_ok=True)
    audio_file = folder / f"asr-{uuid.uuid4().hex}.npy"
    np.save(audio_file, samples)
    try:
        if settings.device != "cpu":
            host.free_memory(ASR_VRAM_BYTES)
        data = run_worker(
            engine.worker,
            {
                "engine": engine.id,
                "model_dir": str(model_dir),
                "audio": str(audio_file),
                "language": settings.language,
                "beam_size": settings.beam_size,
                "seed": settings.seed,
                "regions": [[a, b] for a, b in settings.regions],
                "device": settings.device,
            },
            env=WorkerEnv(pythonpath=(host.package_root(),)),
            limits=WorkerLimits(
                timeout_s=config.worker_timeout_s, idle_timeout_s=config.worker_idle_timeout_s
            ),
            on_progress=lambda fraction, _message: progress.update(
                None if fraction is None else 0.3 + 0.7 * fraction
            ),
            is_cancelled=host.is_interrupted,
        )
    finally:
        audio_file.unlink(missing_ok=True)
    result = result_from_dict(data)
    cache.put(key, result)
    return result


class PlenioTranscribeLyrics(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTranscribeLyrics",
            display_name="Transcribe Lyrics",
            category="Plenio/Audio analysis",
            description=(
                "Transcribes the sung words of a recording (faster-whisper large-v3, only where the transcription "
                "found singing) and places them into the final score's sections on the beat grid. With "
                "expected_lyrics connected it checks a take: were these lyrics sung, section by section?"
            ),
            inputs=[
                io.Audio.Input(
                    "audio", tooltip="The source recording, or a rendered take for the lyrics check."
                ),
                io.String.Input(
                    "score",
                    optional=True,
                    force_input=True,
                    tooltip="The final score: its sections become the tags.",
                ),
                TimelineType.Input(
                    "timeline",
                    optional=True,
                    tooltip="From Transcribe Score: bar times and where somebody sings.",
                ),
                Brief.Input(
                    "brief",
                    optional=True,
                    tooltip="Cover Brief: its lyrics language is used (the language widget is then ignored).",
                ),
                io.String.Input(
                    "expected_lyrics",
                    optional=True,
                    force_input=True,
                    tooltip="Lyrics a take was given: turns the node into the sung-lyrics check.",
                ),
                io.Combo.Input(
                    "engine",
                    options=list(ENGINES),
                    default="faster-whisper large-v3",
                    tooltip="ASR engine (runs in a separate process).",
                ),
                io.String.Input(
                    "language",
                    default="auto",
                    tooltip="'auto' detects the language, or name it (e.g. English, de).",
                ),
                io.Combo.Input(
                    "device",
                    options=["auto", "cuda", "cpu"],
                    default="auto",
                    advanced=True,
                    tooltip="auto: GPU, falling back to the CPU (about 0.6 x the audio length) with a warning.",
                ),
            ],
            outputs=[
                io.String.Output(
                    display_name="lyrics",
                    tooltip="Sectioned lyrics draft (or the heard lyrics in check mode).",
                ),
                io.String.Output(display_name="transcript", tooltip="Plain transcript."),
                io.String.Output(display_name="language", tooltip="Detected or given language."),
                ReportType.Output(
                    display_name="report", tooltip="Words, confidence, placement or check result."
                ),
            ],
        )

    @classmethod
    def execute(
        cls,
        audio: Any,
        engine: str,
        language: str,
        device: str = "auto",
        score: str | None = None,
        timeline: Any = None,
        expected_lyrics: str | None = None,
        brief: Any = None,
    ) -> io.NodeOutput:
        checking = expected_lyrics is not None
        if isinstance(brief, CoverBrief):
            language = brief.language or "auto"  # the brief owns the language
        source = host.audio_sha256(audio)
        own_timeline = timeline if timeline is not None and timeline.source_sha256 == source else None
        warnings: list[str] = []
        if timeline is not None and own_timeline is None:
            warnings.append("the timeline belongs to another recording; it was not used")
        if own_timeline is not None and not own_timeline.vocal_notes and not checking:
            raise PlenioUserError(
                "The transcription found no vocal melody in the source, so there are no sung words to transcribe.",
                hint="Is the source instrumental? Choose 'instrumental' in the Cover Brief, or enter the lyrics "
                "manually in the Song Sheet.",
            )
        regions = tuple(own_timeline.vocal_regions()) if own_timeline is not None else ()
        settings = AsrSettings(
            engine=engine, language=language_code(language), device=device, regions=regions
        )
        progress = host.Progress()
        result = _run_asr(audio, settings, source, progress)
        progress.update(1.0)
        if result.settings.get("device_note"):
            warnings.append(str(result.settings["device_note"]))
        detected = LANGUAGES.get(result.language, result.language or "unknown")
        transcript = join_tokens([w.word for w in result.words])
        data: dict[str, Any] = {
            "engine": result.engine,
            "model": result.model,
            "device": result.device,
            "cache_hit": result.cached,
            "language": result.language,
            "language_probability": round(result.language_probability, 3),
            "regions": [[round(a, 1), round(b, 1)] for a, b in regions],
            "words": len(result.words),
            "asr": result.to_dict(),
        }
        if checking:
            check = check_sung_lyrics(expected_lyrics or "", list(result.words))
            data["check"] = check.to_dict()
            status = Status.WARNING if check.findings else Status.OK
            summary = (
                f"sung-lyrics check: WER {check.wer:.0%}"
                if check.wer is not None
                else "sung-lyrics check: no words"
            ) + (
                f"; {len(check.findings)} section(s) not sung as written"
                if check.findings
                else "; all sections sung"
            )
            lines = [f"**{summary}**", *[f"- {f}" for f in check.findings]]
            report = Report(
                "sung_lyrics_check", status, summary, tuple(check.findings + tuple(warnings)), data
            )
            return io.NodeOutput(
                transcript,
                transcript,
                detected,
                report,
                ui={"plenio_summary": [{"status": status.value, "markdown": "\n".join(lines)}]},
            )
        weak = weak_segments(result)
        words = [w for w in result.words if w.segment not in weak]
        if weak:
            invented = [w.word for w in result.words if w.segment in weak]
            warnings.append(
                f"{len(invented)} word(s) the ASR decoder most likely invented were left out: "
                + repr(join_tokens(invented))
            )
            data["weak_segments"] = sorted(weak)
        kept, _dropped = drop_inventions(words, own_timeline)
        reliable = sum(1 for w in kept if w.p >= LOW_CONFIDENCE)
        if reliable < MIN_RELIABLE_WORDS:
            raise PlenioUserError(
                f"No reliable singing was found ({reliable} clear word(s)); the automatic lyrics would be guesswork.",
                hint="Set the language explicitly, trim the source to the sung part, or enter the lyrics manually in "
                "the Song Sheet.",
            )
        sections: list[Any] = []
        meters: list[str] = []
        if score is not None and score.strip():
            analysis = score_rules.validate(score)
            sections, meters = list(analysis.sections), [bar.meter for bar in analysis.bars]
        alignment = align(words, sections, timeline=own_timeline, score_meters=meters)
        warnings.extend(alignment.warnings)
        data["alignment"] = alignment.to_dict()
        summary = (
            f"{len(kept)} words in {len([s for s in alignment.sections if s['words']])} section(s), {detected} "
            f"({result.language_probability:.0%}), placement: {alignment.method}"
            + (", from the cache" if result.cached else f", {result.seconds:.0f} s on {result.device}")
        )
        report = Report(
            "transcribe_lyrics", Status.WARNING if warnings else Status.OK, summary, tuple(warnings), data
        )
        lines = [f"**{summary}**"]
        if alignment.low_confidence:
            lines.append(
                f"- {len(alignment.low_confidence)} low-confidence word(s): "
                + ", ".join(w.word for w in alignment.low_confidence[:12])
            )
        lines += [f"- warning: {w}" for w in warnings]
        # For the Song Sheet editor: it finds this note by the hash of the draft it shows.
        note = {
            "draft_sha256": sha256_text(normalize_document(alignment.lyrics)),
            "engine": result.engine,
            "language": detected,
            "low_confidence": [w.word for w in alignment.low_confidence],
            "left_out": [w.word for w in result.words if w.segment in weak]
            + [w.word for w in alignment.dropped],
        }
        asr_notes().put(note)  # also on disk: a cached node does not resend its UI output
        return io.NodeOutput(
            alignment.lyrics,
            transcript,
            detected,
            report,
            ui={
                "plenio_summary": [{"status": report.status.value, "markdown": "\n".join(lines)}],
                "plenio_asr": [note],
            },
        )
