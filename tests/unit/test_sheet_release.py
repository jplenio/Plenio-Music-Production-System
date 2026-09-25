"""Song Sheet evaluation (validation, review gate, report) and release export."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest

from plenio.core.engines import yue2
from plenio.core.errors import PlenioUserError
from plenio.core.hashing import sha256_text
from plenio.core.release import (
    MODEL_LICENCES,
    RecordInput,
    build_record,
    expand_pattern,
    plan_release,
    prompt_for_record,
    redact,
    safe_filename,
    workflow_licences,
    write_audio,
)
from plenio.core.sheet import DocEntry, DocState, SheetState, evaluate_sheet, normalize_document

ROOT = Path(__file__).resolve().parents[2]
SONG = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
STYLE = "English, warm piano pop, expressive female voice, acoustic piano, light drums, 88 BPM"
LYRICS = "[Verse]\nNeon fades along the lane\n\n[Chorus]\nLet the day come into view"


class FakeTokenizer:
    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        return len(style) + len(lyrics) + 60

    def abc_tokens(self, abc: str) -> int:
        return len(abc)


def text_sheet(
    state: SheetState | None = None,
    review: str = "continue",
    instrumental: bool = False,
    lyrics: str = LYRICS,
) -> object:
    return evaluate_sheet(
        state or SheetState(),
        {"title": "Neon", "style": STYLE, "lyrics": lyrics, "artwork_prompt": "A street."},
        ["title", "style", "lyrics", "artwork_prompt"],
        review=review,
        rules=yue2,
        engine_id="yue2",
        instrumental=instrumental,
        tokenizer=FakeTokenizer(),
        max_seconds=113.5,
    )


def test_text_sheet_valid_and_report() -> None:
    evaluation = text_sheet()
    assert evaluation.owned == ("title", "style", "lyrics", "artwork_prompt")
    assert not evaluation.has_errors and not evaluation.waiting_for_approval
    report = evaluation.report().to_dict()
    assert report["data"]["documents"]["lyrics"]["sha256"] == sha256_text(LYRICS)
    assert report["data"]["engine"] == "yue2"
    payload = evaluation.payload()
    assert payload["docs"]["style"]["upstream_sha256"] == sha256_text(normalize_document(STYLE))
    assert payload["fingerprint"] == evaluation.fingerprint


def test_review_gate_opens_only_for_the_approved_documents() -> None:
    waiting = text_sheet(review="stop for review")
    assert waiting.waiting_for_approval and waiting.report().status.value == "skipped"
    approved_state = SheetState(approved_fingerprint=waiting.fingerprint)
    assert not text_sheet(approved_state, review="stop for review").waiting_for_approval
    changed = text_sheet(approved_state, review="stop for review", lyrics=LYRICS + "\nOne more line")
    assert changed.waiting_for_approval


def test_instrumental_text_sheet_blocks_words() -> None:
    evaluation = text_sheet(instrumental=True)
    assert evaluation.has_errors
    assert "invalid" in evaluation.status_line()


def test_conflict_is_reported_without_validation() -> None:
    state = SheetState(docs={"lyrics": DocEntry(DocState.EDITED, "[Verse]\nmine", sha256_text("old draft"))})
    evaluation = text_sheet(state)
    assert evaluation.conflicts == ["lyrics"] and evaluation.fingerprint is None
    assert evaluation.status_line() == "conflict: lyrics"
    assert evaluation.findings == ()


def test_score_sheet_uses_context_for_the_budget() -> None:
    evaluation = evaluate_sheet(
        SheetState(),
        {"score": SONG},
        ["score"],
        rules=yue2,
        engine_id="yue2",
        tokenizer=FakeTokenizer(),
        context={"style": STYLE, "lyrics": LYRICS},
    )
    assert evaluation.planning_mode == "full"
    assert evaluation.score_seconds == pytest.approx(yue2.render_ceiling(8 * 4 * 60 / 88))
    # The budget is computed on the normalised text - exactly what reaches the model.
    assert evaluation.validation and evaluation.validation["budget"]["abc_tokens"] == len(
        normalize_document(SONG)
    )
    assert evaluation.payload()["context"] == {"style": STYLE, "lyrics": LYRICS}


def test_sheet_without_engine_checks_generic_rules() -> None:
    evaluation = evaluate_sheet(SheetState(), {"lyrics": "no tags"}, ["lyrics"])
    assert evaluation.has_errors
    assert any("No engine" in f.message for f in evaluation.findings)


def test_unknown_review_mode() -> None:
    with pytest.raises(ValueError):
        evaluate_sheet(SheetState(), {}, [], review="maybe")


# --- release -------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Neon: Rain / Night?", "Neon Rain Night"),
        ("CON", "CON_"),
        ("  ...  ", "Untitled"),
        ("Grüße aus Köln", "Grüße aus Köln"),
    ],
)
def test_safe_filename(name: str, expected: str) -> None:
    assert safe_filename(name) == expected


def test_naming_pattern_and_collisions(tmp_path: Path) -> None:
    name = expand_pattern("{date} {title}", {"date": "2026-09-25", "title": "Song"})
    assert name == "2026-09-25 Song"
    with pytest.raises(PlenioUserError):
        expand_pattern("{album}", {})
    first = plan_release(tmp_path, "album/Song", [".flac"])
    first.parent.mkdir(parents=True)
    first.with_name("Song.flac").write_bytes(b"x")
    assert plan_release(tmp_path, "album/Song", [".flac"]).name == "Song (2)"
    assert plan_release(tmp_path, "album/Song", [".flac"], collision="overwrite") == first
    with pytest.raises(PlenioUserError):
        plan_release(tmp_path, "album/Song", [".flac"], collision="error")


def test_flac_is_24_bit_and_lossless_to_24_bit(tmp_path: Path) -> None:
    soundfile = pytest.importorskip("soundfile")
    rate = 44100
    t = np.arange(rate // 2) / rate
    stereo = np.stack([0.5 * np.sin(2 * np.pi * 440 * t), 0.25 * np.sin(2 * np.pi * 220 * t)]).astype(
        np.float32
    )
    facts = write_audio(tmp_path / "x.flac", stereo, rate, "flac")
    info = soundfile.info(str(tmp_path / "x.flac"))
    assert (info.subtype, info.samplerate, info.channels, info.frames) == ("PCM_24", rate, 2, rate // 2)
    data, _ = soundfile.read(str(tmp_path / "x.flac"), dtype="float32")
    assert float(np.max(np.abs(data.T - stereo))) < 2**-22
    assert facts["bits"] == 24 and facts["clipped_samples"] == 0
    with pytest.raises(PlenioUserError):
        write_audio(tmp_path / "bad.flac", np.zeros((3, 10), dtype=np.float32), rate, "flac")


def test_redaction() -> None:
    prompt = {
        "1": {"inputs": {"api_key": "sk-abcdefghijklmnopqrstuv", "prompt": "use hf_" + "x" * 30, "seed": 5}}
    }
    redacted = redact(prompt)
    assert redacted["1"]["inputs"]["api_key"] == "<redacted>"
    assert "hf_" not in redacted["1"]["inputs"]["prompt"] and redacted["1"]["inputs"]["seed"] == 5


def test_record_prompt_drops_run_time_fields() -> None:
    # ComfyUI writes fingerprints into the prompt; native loop nodes fingerprint as NaN
    prompt = {
        "1": {
            "class_type": "StartLoop",
            "inputs": {"mode": "simple"},
            "is_changed": [float("nan")],
            "_loop_body": ["2"],
            "_meta": {"title": "Takes"},
        }
    }
    kept = prompt_for_record(prompt)
    assert kept == {
        "1": {"class_type": "StartLoop", "inputs": {"mode": "simple"}, "_meta": {"title": "Takes"}}
    }
    json.dumps(kept, allow_nan=False)


def test_workflow_licences_name_the_non_commercial_model_files() -> None:
    prompt = {
        "1": {
            "class_type": "AudioEncoderLoader",
            "inputs": {"audio_encoder_name": "sheetsage2_bf16.safetensors"},
        },
        "2": {
            "class_type": "LoraLoader",
            "inputs": {"lora_name": "yue2\\ar_lora_inst_v3abc_comfyui.safetensors"},  # a subfolder
        },
        "3": {"class_type": "KSampler", "inputs": {"seed": 1, "model": ["2", 0]}},
    }
    assert workflow_licences(prompt) == set(MODEL_LICENCES.values())
    assert workflow_licences({"1": {"inputs": {"text": "no model here"}}}) == set()
    assert workflow_licences(None) == set()


def test_record_collects_documents_and_is_json() -> None:
    report = text_sheet().report().to_dict()
    record = build_record(
        RecordInput(
            {"plenio": "0.1.0"},
            {"1": {"inputs": {"token": "secret-value-123456"}}},
            [report],
            [{"name": "a.flac"}],
            {"sample_rate": 44100},
            "Neon",
            [yue2.LICENCE],
        )
    )
    assert record["schema"] == "plenio.record/1"
    assert record["documents"]["lyrics"]["text"] == LYRICS
    assert record["prompt"]["1"]["inputs"]["token"] == "<redacted>"
    json.dumps(record)
