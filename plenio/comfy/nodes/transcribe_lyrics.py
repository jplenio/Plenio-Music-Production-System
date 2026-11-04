"""Transcribe Lyrics: sung words of a recording, placed into the final score's sections.

With ``vocals`` connected (a cover: Sung Pitch's vocal stem of the source) it hears the stem too and keeps the
hearing it was more confident of (``core.asr.prefer_stem``; owner 2026-10-24: the stem only where it hears
better - a separation also leaves artefacts that are misheard).

Also the *sung-lyrics check*: with ``expected_lyrics`` connected it compares what is sung in a take
with the lyrics the take was given (WER overall and per section).
"""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.alignment import LOW_CONFIDENCE, align, check_sung_lyrics, drop_inventions, join_tokens
from ...core.asr import DEFAULT_ENGINE, ENGINES, AsrSettings, confidence, prefer_stem, weak_segments
from ...core.brief import CoverBrief
from ...core.errors import PlenioCancelledError, PlenioUserError
from ...core.hashing import sha256_text
from ...core.reports import Report, Status
from ...core.score import bar_match, canonical
from ...core.sheet.resolve import normalize_document
from .. import host
from ..lyrics_asr import LANGUAGES, asr_notes, language_code
from ..lyrics_asr import run_asr as _run_asr
from ..sheet_music import bar_sources
from ..types import Brief, ReportType, TimelineType

MIN_RELIABLE_WORDS = 5


def asr_language(widget: str, brief: Any) -> str:
    """The language the ASR is told. A Cover Brief decides only for *original lyrics* covers: there its
    language is the source's. For *new lyrics* its language is that of the new text, not of the
    singing in the source (audit AUD-02), so the widget decides (default ``auto``)."""
    if isinstance(brief, CoverBrief) and brief.use_source_lyrics:
        return brief.language or "auto"
    return widget


def _new_lyrics_hint(brief: Any) -> str:
    """New lyrics ask for the source's words only for the phrasing reference or the lyrics closeness."""
    if not isinstance(brief, CoverBrief) or not brief.writes_lyrics:
        return ""
    return (
        " New lyrics need the source's words only for the phrasing reference and a lyrics closeness above 0: "
        "set lyrics closeness to 0 and the phrasing reference off to write them without the source's text."
    )


class PlenioTranscribeLyrics(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTranscribeLyrics",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Transcribe Lyrics",
            category="Plenio/Audio analysis",
            description=(
                "Transcribes the sung words of a recording (Qwen3-ASR 1.7B; Qwen3-ForcedAligner times every word, "
                "faster-whisper large-v3 steps in for languages the aligner does not know; only where the "
                "transcription found singing) and places them into the final score's sections on the beat grid. "
                "With expected_lyrics connected it checks a take: were these lyrics sung, section by section?"
            ),
            inputs=[
                io.Audio.Input(
                    "audio", tooltip="The source recording, or a rendered take for the lyrics check."
                ),
                io.Audio.Input(
                    "vocals",
                    optional=True,
                    tooltip="The source's vocal stem (Sung Pitch): heard too, and the more confident hearing of the "
                    "two is kept. Empty or unconnected: the recording alone.",
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
                    tooltip="Cover Brief: for original-lyrics covers its language is used (the language widget is "
                    "then ignored); for new lyrics the widget names the source's language.",
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
                    default=DEFAULT_ENGINE,
                    tooltip="Qwen3-ASR 1.7B: its aligner times the words; faster-whisper takes over a language it "
                    "cannot time (the summary says so). faster-whisper large-v3: always Whisper. Separate process.",
                ),
                io.String.Input(
                    "language",
                    default="auto",
                    tooltip="Language of the singing in this recording: 'auto' detects it, or name it (e.g. English, "
                    "de). An original-lyrics Cover Brief overrides it.",
                ),
                io.Combo.Input(
                    "device",
                    options=["auto", "cuda", "cpu"],
                    default="auto",
                    advanced=True,
                    tooltip="auto: the GPU, else the CPU with a warning (Qwen3 there takes several times the audio "
                    "length, Whisper about 0.6 x).",
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
            hidden=[io.Hidden.extra_pnginfo],
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
        vocals: Any = None,
    ) -> io.NodeOutput:
        checking = expected_lyrics is not None
        if not checking and isinstance(brief, CoverBrief) and brief.instrumental:
            # an instrumental cover sings no words: nothing to hear (since Fix Misheard Words reads this node's
            # lyrics, it runs for every cover - an instrumental source must not stop the run)
            summary = "an instrumental cover: no words to hear, the transcription was skipped"
            report = Report("transcribe_lyrics", Status.SKIPPED, summary, (), {"skipped": "instrumental"})
            return io.NodeOutput(
                "",
                "",
                "" if language.strip().lower() == "auto" else language.strip(),
                report,
                ui={"plenio_summary": [{"status": Status.SKIPPED.value, "markdown": f"**{summary}**"}]},
            )
        language = asr_language(language, brief)
        source = host.audio_sha256(audio)
        own_timeline = timeline if timeline is not None and timeline.source_sha256 == source else None
        warnings: list[str] = []
        if timeline is not None and own_timeline is None:
            warnings.append("the timeline belongs to another recording; it was not used")
        if own_timeline is not None and not own_timeline.vocal_notes and not checking:
            raise PlenioUserError(
                "The transcription found no vocal melody in the source, so there are no sung words to transcribe.",
                hint="Is the source instrumental? Choose 'instrumental' in the Cover Brief, or enter the lyrics "
                "manually in the Song Sheet." + _new_lyrics_hint(brief),
            )
        regions = tuple(own_timeline.vocal_regions()) if own_timeline is not None else ()
        settings = AsrSettings(
            engine=engine, language=language_code(language), device=device, regions=regions
        )
        progress = host.Progress()
        try:
            result = _run_asr(audio, settings, source, progress)
            stem = None
            if vocals is not None and not checking:
                stem = _run_asr(vocals, settings, host.audio_sha256(vocals), progress)
        except PlenioCancelledError:
            host.raise_if_interrupted()  # ComfyUI's interrupt, not an error dialog (AUD-10)
            raise
        progress.update(1.0)
        heard_from = "the recording"
        sure: dict[str, float | None] = {}
        if stem is not None:
            mix_words = [w for w in result.words if w.segment not in weak_segments(result)]
            stem_words = [w for w in stem.words if w.segment not in weak_segments(stem)]
            sure = {"recording": confidence(mix_words), "vocal stem": confidence(stem_words)}
            if prefer_stem(mix_words, stem_words):
                result, heard_from = stem, "the vocal stem"
        for key in ("engine_note", "device_note"):
            if result.settings.get(key):
                warnings.append(str(result.settings[key]))
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
        if stem is not None:
            data["heard_from"] = heard_from
            data["confidence"] = {k: None if v is None else round(v, 4) for k, v in sure.items()}
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
                "the Song Sheet." + _new_lyrics_hint(brief),
            )
        sections: list[Any] = []
        meters: list[str] = []
        prints: tuple[tuple[str, str], ...] = ()
        kept_bars: list[int | None] | None = None
        if score is not None and score.strip():
            analysis = score_rules.validate(score)
            sections, meters = list(analysis.sections), [bar.meter for bar in analysis.bars]
            try:  # an arranged score's bars find their source bars by content (copied sections get their words)
                prints = bar_match.bar_prints(canonical.from_abc(score))
            except canonical.ScoreSyntaxError:
                prints = ()
            if own_timeline is not None:  # the editor knows which bar is which: no guess by content
                kept_bars = bar_sources(
                    cls.hidden.extra_pnginfo, own_timeline.score_sha256, analysis.sha256, len(meters)
                )
        alignment = align(
            words,
            sections,
            timeline=own_timeline,
            score_meters=meters,
            score_prints=prints,
            score_sources=kept_bars,
        )
        warnings.extend(alignment.warnings)
        data["alignment"] = alignment.to_dict()
        summary = (
            f"{len(kept)} words in {len([s for s in alignment.sections if s['words']])} section(s), {detected}"
            + (f" ({result.language_probability:.0%})" if result.language_probability > 0 else "")
            + f", placement: {alignment.method}"
            + (f", heard from {heard_from} (the more confident hearing)" if stem is not None else "")
            + (", from the cache" if result.cached else f", {result.seconds:.0f} s on {result.device}")
            + f" ({result.engine})"
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
