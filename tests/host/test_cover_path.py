"""The YuE2 Cover path in a real ComfyUI server with model fakes (V2).

Graph (as in the Cover template): fake source -> fake SheetSage2 -> Transcribe Score -> Score Tools
-> Song Sheet (score) -> Transcribe Lyrics / writer -> switches -> Song Sheet (text) -> fake render
-> Check Vocals -> Export Release.

SheetSage2 is replaced by recorded events of a real transcription (``minimax-excerpt.events.json``),
so Transcribe Score, the beat grid and the timeline run for real. The ASR worker does not run: the
server is offline and has no Whisper model, so a result can only come from the ASR cache, which the
tests fill with a recorded faster-whisper transcript. A run that needs the ASR without a cache entry
fails - that is how the tests prove the ASR was not requested.
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any

import pytest

from harness import ComfyServer, Log
from plenio.core.alignment import words_from
from plenio.core.asr import AsrCache, AsrResult, AsrSettings, cache_key
from plenio.core.assets.catalogue import load_catalogue

pytestmark = pytest.mark.host

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = json.loads(
    (ROOT / "tests" / "fixtures" / "cover" / "minimax-excerpt.json").read_text(encoding="utf-8")
)
SECONDS = float(FIXTURE["duration_s"])
PRIMED_VARIANT = 0
"""The fake source whose transcript is in the ASR cache; other variants have none."""

VOCALS = {
    "original": {"vocals": "original lyrics", "vocals.language": "auto", "vocals.voice": ""},
    "original-en": {"vocals": "original lyrics", "vocals.language": "English", "vocals.voice": ""},
    "new": {
        "vocals": "new lyrics",
        "vocals.language": "English",
        "vocals.voice": "",
        "vocals.theme": "lanterns on a river",
        "vocals.phrasing_reference": False,
    },
    "instrumental": {
        "vocals": "instrumental",
        "vocals.melody": "instrument plays the lead",
        "vocals.lead_instrument": "piano",
    },
}
ANSWER = {
    "original": "cover-none",
    "original-en": "cover-none",
    "new": "cover-new",
    "instrumental": "cover-instrumental",
}


def sheet_state(docs: dict[str, Any] | None = None, approved: str | None = None) -> str:
    state: dict[str, Any] = {"schema": "plenio.sheet_state/1", "docs": docs or {}}
    if approved:
        state["review"] = {"approved_fingerprint": approved}
    return json.dumps(state)


def cover_prompt(
    *,
    vocals: str = "original",
    variant: int = PRIMED_VARIANT,
    sheetsage: str = "normal",
    check_sheetsage: str = "no vocals",
    genre: str = "acoustic folk",
    harmony: str = "new accompaniment",
    score_state: str = "",
    text_state: str = "",
    score_review: str = "continue",
    text_review: str = "continue",
    take_seed: int = 1,
    mode: str = "one cover, stop to review",
) -> dict[str, Any]:
    brief_inputs = {
        "mode": mode,
        "template": "none",
        "description": "",
        "genre": genre,
        "mood": "warm, intimate",
        **VOCALS[vocals],
        "harmony": harmony,
        "title": "",
    }
    return {
        "1": {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": SECONDS, "variant": variant}},
        "2": {"class_type": "PlenioTestFakeSheetSage", "inputs": {"mode": sheetsage}},
        "3": {
            "class_type": "PlenioTranscribeScore",
            "inputs": {"audio_encoder": ["2", 0], "audio": ["1", 0]},
        },
        "4": {"class_type": "PlenioCoverBrief", "inputs": brief_inputs},
        "5": {"class_type": "PlenioTestFakeEngine", "inputs": {}},
        "6": {
            "class_type": "PlenioScoreTools",
            "inputs": {"score": ["3", 0], "brief": ["4", 0], "operation": "prepare from brief"},
        },
        "7": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["6", 0],
                "timeline": ["3", 1],
                "brief": ["4", 0],
                "engine": ["5", 0],
                "review": score_review,
                "sheet_state": score_state,
            },
        },
        "8": {
            "class_type": "PlenioTranscribeLyrics",
            "inputs": {
                "audio": ["1", 0],
                "score": ["7", 3],
                "timeline": ["3", 1],
                "brief": ["4", 0],
                "engine": "faster-whisper large-v3",
                "language": "auto",
                "device": "auto",
            },
        },
        "9": {
            "class_type": "PlenioComposePrompt",
            "inputs": {
                "brief": ["4", 0],
                "engine": ["5", 0],
                "score": ["7", 3],
                "language": ["8", 2],
                "reference_lyrics": ["8", 1],
                "detail": "standard",
            },
        },
        "10": {"class_type": "PlenioTestFakeLLM", "inputs": {"prompt": ["9", 0], "variant": ANSWER[vocals]}},
        "11": {"class_type": "PlenioParseDraft", "inputs": {"text": ["10", 0], "request": ["9", 1]}},
        "12": {
            "class_type": "ComfySwitchNode",
            "inputs": {"switch": ["4", 2], "on_true": ["8", 0], "on_false": ["11", 2]},
        },
        "13": {
            "class_type": "ComfySwitchNode",
            "inputs": {"switch": ["4", 3], "on_true": ["7", 8], "on_false": ["12", 0]},
        },
        "14": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "title": ["11", 0],
                "style": ["11", 1],
                "lyrics": ["13", 0],
                "artwork_prompt": ["11", 3],
                "context_score": ["7", 3],
                "timeline": ["3", 1],
                "brief": ["4", 0],
                "engine": ["5", 0],
                "review": text_review,
                "sheet_state": text_state,
            },
        },
        "15": {
            "class_type": "PlenioTestFakeRender",
            "inputs": {
                "style": ["14", 1],
                "lyrics": ["14", 2],
                "abc": ["7", 3],
                "mode": ["7", 5],
                "max_duration": ["7", 6],
                "seed": take_seed,
            },
        },
        "16": {"class_type": "PlenioTestFakeSheetSage", "inputs": {"mode": check_sheetsage}},
        "17": {
            "class_type": "PlenioVocalCheck",
            "inputs": {
                "audio": ["15", 0],
                "audio_encoder": ["16", 0],
                "brief": ["4", 0],
                "tolerance_seconds": 0.0,
            },
        },
        "18": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["17", 0],
                "title": ["14", 0],
                "folder": f"plenio-cover-test/{uuid.uuid4().hex[:10]}",
                "naming": "{title}",
                "collision": "number",
                "reports.report_0": ["7", 7],
                "reports.report_1": ["14", 7],
                "reports.report_2": ["3", 2],
                "reports.report_3": ["17", 2],
            },
        },
    }


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def sheet_payload(entry: dict[str, Any], node_id: str) -> dict[str, Any]:
    payload: dict[str, Any] = entry["outputs"][node_id]["plenio_sheet"][0]
    return payload


def summary(entry: dict[str, Any], node_id: str) -> str:
    return str(entry["outputs"][node_id]["plenio_summary"][0]["markdown"])


def tags(lyrics: str) -> list[str]:
    return [line for line in lyrics.splitlines() if line.startswith("[")]


@pytest.fixture(scope="module")
def primed(server: ComfyServer, tmp_path_factory: pytest.TempPathFactory) -> dict[str, Any]:
    """Fill the server's ASR cache with the recorded transcript of the primed fake source.

    The key is exactly what Transcribe Lyrics computes: the source hash and the vocal regions come from
    the server (a probe node records the timeline), the model revision from the asset catalogue.
    """
    log = Log(server.output_dir / "plenio_test_log.jsonl")
    log.clear()
    server.run(
        {
            "1": {
                "class_type": "PlenioTestFakeAudio",
                "inputs": {"seconds": SECONDS, "variant": PRIMED_VARIANT},
            },
            "2": {"class_type": "PlenioTestFakeSheetSage", "inputs": {"mode": "normal"}},
            "3": {
                "class_type": "PlenioTranscribeScore",
                "inputs": {"audio_encoder": ["2", 0], "audio": ["1", 0]},
            },
            "4": {"class_type": "PlenioTestTimelineProbe", "inputs": {"timeline": ["3", 1]}},
        }
    )
    probe = events(log, "timeline")[-1]
    assert probe["bars"] == len(FIXTURE["bar_starts"]) and probe["vocal_notes"] > 0
    revision = load_catalogue(ROOT / "resources" / "assets.toml")["faster-whisper-large-v3"].revision
    settings = AsrSettings(language="", regions=tuple((float(a), float(b)) for a, b in probe["regions"]))
    words = tuple(words_from(FIXTURE["words"]))
    result = AsrResult(
        engine="faster-whisper-large-v3",
        model="Systran/faster-whisper-large-v3",
        language=FIXTURE["language"],
        language_probability=0.99,
        segments=({"text": " ".join(w.word for w in words)},),
        words=words,
        device="cuda",
        seconds=16.8,
        settings=settings.to_dict(),
    )
    key = cache_key(probe["source_sha256"], settings, revision)
    AsrCache(server.base / "user" / "plenio" / "cache" / "asr").put(key, result)
    return {"key": key, "source_sha256": probe["source_sha256"], "regions": probe["regions"]}


# --- original lyrics -------------------------------------------------------------------------------


def test_original_lyrics_come_from_the_asr_placed_into_the_score_sections(
    server: ComfyServer, log: Log, primed: dict[str, Any]
) -> None:
    entry = server.run(cover_prompt(vocals="original"))
    render = events(log, "render")[-1]
    text = sheet_payload(entry, "14")
    score = sheet_payload(entry, "7")
    assert render["lyrics"] == text["docs"]["lyrics"]["text"]  # WYSIWYG
    assert render["abc"] == score["docs"]["score"]["text"]
    assert tags(render["lyrics"]) == ["[Verse]", "[Pre-Chorus]", "[Chorus]", "[Outro]"]
    assert "Blue light pooling on the sidewalk" in render["lyrics"]
    assert "from the cache" in summary(entry, "8") and "beat grid" in summary(entry, "8")
    # harmony "new accompaniment": the source chords are removed and YuE2 re-harmonises (melody mode)
    assert render["mode"] == "melody" and '"' not in render["abc"].split("K:", 1)[1]
    assert score["timeline"]["source_sha256"] == primed["source_sha256"]
    # the editor finds the ASR note by the hash of the lyrics draft it shows
    note = entry["outputs"]["8"]["plenio_asr"][0]
    assert note["draft_sha256"] == text["docs"]["lyrics"]["upstream_sha256"]
    assert "Blue" in note["low_confidence"] and text["timeline"]["sections"][0][0] == "verse"
    # ... also from disk, for a reload after which ComfyUI serves the node from its cache
    assert server.get(f"/plenio/asr/notes/{note['draft_sha256']}")["note"] == note
    assert server.get(f"/plenio/asr/notes/{'0' * 64}")["note"] is None


def test_a_new_take_reuses_score_asr_and_draft(server: ComfyServer, log: Log, primed: dict[str, Any]) -> None:
    server.run(cover_prompt(vocals="original", take_seed=11))
    log.clear()
    entry = server.run(cover_prompt(vocals="original", take_seed=12))
    assert events(log, "sheetsage") == [] and events(log, "llm") == [] and events(log, "audio") == []
    assert [e["seed"] for e in events(log, "render")] == [12]
    cached = [m[1]["nodes"] for m in entry["status"]["messages"] if m[0] == "execution_cached"][0]
    assert "8" in cached  # Transcribe Lyrics came from ComfyUI's cache (its summary is re-sent since 0.2.2)


def test_corrected_lyrics_win_and_conflict_when_the_score_sections_change(
    server: ComfyServer, log: Log, primed: dict[str, Any]
) -> None:
    first = server.run(cover_prompt(vocals="original"))
    draft = sheet_payload(first, "14")["docs"]["lyrics"]
    corrected = draft["text"].replace("Blue light pooling", "Blue light pouring")
    text_state = sheet_state(
        {"lyrics": {"state": "edited", "text": corrected, "base_sha256": draft["upstream_sha256"]}}
    )
    server.run(cover_prompt(vocals="original", text_state=text_state, take_seed=2))
    server.run(cover_prompt(vocals="original", text_state=text_state, take_seed=3))
    renders = events(log, "render")
    assert all("Blue light pouring" in r["lyrics"] for r in renders[-2:])  # the correction persists
    # The final score owns the sections: renaming one changes the ASR draft, and the correction
    # based on the old draft is not silently replaced - the run stops with a conflict.
    score_doc = sheet_payload(first, "7")["docs"]["score"]
    renamed = score_doc["upstream"].replace("% pre-chorus", "% bridge")
    score_state = sheet_state(
        {"score": {"state": "edited", "text": renamed, "base_sha256": score_doc["upstream_sha256"]}}
    )
    error = server.run_expect_error(
        cover_prompt(vocals="original", text_state=text_state, score_state=score_state)
    )
    assert error["node_type"] == "PlenioSongSheet"
    assert "conflict" in error["exception_message"] and "lyrics" in error["exception_message"]


def test_an_edited_score_is_what_is_rendered_and_what_the_lyrics_follow(
    server: ComfyServer, log: Log, primed: dict[str, Any]
) -> None:
    first = server.run(cover_prompt(vocals="original"))
    score_doc = sheet_payload(first, "7")["docs"]["score"]
    edited = score_doc["upstream"].replace("% pre-chorus", "% bridge").replace("Q:1/4=121", "Q:1/4=118")
    state = sheet_state(
        {"score": {"state": "edited", "text": edited, "base_sha256": score_doc["upstream_sha256"]}}
    )
    entry = server.run(cover_prompt(vocals="original", score_state=state, take_seed=4))
    render = events(log, "render")[-1]
    assert render["abc"] == edited.strip()
    assert tags(render["lyrics"]) == ["[Verse]", "[Bridge]", "[Chorus]", "[Outro]"]
    assert sheet_payload(entry, "7")["docs"]["score"]["status"] == "edited"


def test_section_edits_in_the_editor_change_the_asr_lyrics_draft(
    server: ComfyServer, log: Log, primed: dict[str, Any]
) -> None:
    """Rename and boundary move through /plenio/score/transform re-section the ASR lyrics draft;
    a lyrics correction based on the old draft then stops with a conflict."""
    first = server.run(cover_prompt(vocals="original"))
    score_doc = sheet_payload(first, "7")["docs"]["score"]
    old_lyrics = sheet_payload(first, "14")["docs"]["lyrics"]

    def transform(text: str, operation: dict[str, Any]) -> str:
        status, result = server.request(
            "POST", "/plenio/score/transform", {"abc": text, "operation": operation}
        )
        assert status == 200, result
        return str(result["abc"])

    status, view = server.request("POST", "/plenio/score/analyze", {"abc": score_doc["text"]})
    assert status == 200 and [s["label"] for s in view["sections"]] == [
        "verse",
        "pre-chorus",
        "chorus",
        "outro",
    ]
    chorus_start = view["sections"][2]["start_bar"]
    renamed = transform(score_doc["text"], {"op": "rename_section", "section": 2, "label": "bridge"})
    # One bar later: the words of the chorus's first bar move into the bridge. (One bar earlier would
    # change nothing here - bar 24 is the chorus pickup, which the pickup rule already puts into the chorus.)
    moved = transform(renamed, {"op": "move_section_boundary", "section": 3, "start_bar": chorus_start + 1})

    def run(score_text: str, seed: int) -> dict[str, Any]:
        state = sheet_state(
            {"score": {"state": "edited", "text": score_text, "base_sha256": score_doc["upstream_sha256"]}}
        )
        return server.run(cover_prompt(vocals="original", score_state=state, take_seed=seed))

    renamed_lyrics = sheet_payload(run(renamed, 31), "14")["docs"]["lyrics"]
    entry = run(moved, 32)
    moved_lyrics = sheet_payload(entry, "14")["docs"]["lyrics"]
    assert tags(moved_lyrics["text"]) == ["[Verse]", "[Bridge]", "[Chorus]", "[Outro]"]
    assert (
        len(
            {
                old_lyrics["upstream_sha256"],
                renamed_lyrics["upstream_sha256"],
                moved_lyrics["upstream_sha256"],
            }
        )
        == 3
    )
    render = events(log, "render")[-1]
    assert render["abc"] == sheet_payload(entry, "7")["docs"]["score"]["text"] == moved.strip()
    assert render["lyrics"] == moved_lyrics["text"]
    corrected = old_lyrics["text"].replace("Blue light pooling", "Blue light pouring")
    text_state = sheet_state(
        {"lyrics": {"state": "edited", "text": corrected, "base_sha256": old_lyrics["upstream_sha256"]}}
    )
    score_state = sheet_state(
        {"score": {"state": "edited", "text": moved, "base_sha256": score_doc["upstream_sha256"]}}
    )
    error = server.run_expect_error(
        cover_prompt(vocals="original", score_state=score_state, text_state=text_state)
    )
    assert error["node_type"] == "PlenioSongSheet"
    assert "conflict" in error["exception_message"] and "lyrics" in error["exception_message"]


def test_the_score_sheet_carries_the_source_for_ab_listening(
    server: ComfyServer, log: Log, primed: dict[str, Any]
) -> None:
    """``reference_audio`` is display only: a temporary Opus copy in the payload, served by /view."""
    prompt = cover_prompt(vocals="original", take_seed=41)
    prompt["7"]["inputs"]["reference_audio"] = ["1", 0]
    entry = server.run(prompt)
    payload = sheet_payload(entry, "7")
    reference = payload["reference_audio"]
    assert reference["type"] == "temp" and reference["filename"].endswith(".opus")
    query = urllib.parse.urlencode(reference)
    with urllib.request.urlopen(f"{server.url}/view?{query}", timeout=30) as response:  # noqa: S310 - local
        assert response.status == 200 and len(response.read()) > 1000
    assert "reference_audio" not in sheet_payload(entry, "14")
    assert events(log, "render")[-1]["abc"] == payload["docs"]["score"]["text"]


def test_fully_manual_lyrics_never_run_the_asr(server: ComfyServer, log: Log, primed: dict[str, Any]) -> None:
    manual = (
        "[Verse]\nMy own verse line\n\n[Pre-Chorus]\nRising up\n\n[Chorus]\nThe chorus I wrote\n\n[Outro]"
    )
    text_state = sheet_state({"lyrics": {"state": "manual", "text": manual}})
    # variant 7 has no ASR cache entry and the server is offline: a run that needed the ASR would fail.
    entry = server.run(cover_prompt(vocals="original-en", variant=7, text_state=text_state))
    assert events(log, "render")[-1]["lyrics"] == manual
    assert "8" not in entry["outputs"]
    assert sheet_payload(entry, "14")["docs"]["lyrics"]["status"] == "manual"


def test_auto_language_without_a_transcript_needs_the_asr_model(server: ComfyServer, log: Log) -> None:
    error = server.run_expect_error(cover_prompt(vocals="original", variant=8))
    assert error["node_type"] == "PlenioTranscribeLyrics"
    assert "offline" in error["exception_message"].lower()
    assert events(log, "render") == []


def test_a_source_without_vocal_melody_has_no_original_lyrics(server: ComfyServer, log: Log) -> None:
    error = server.run_expect_error(cover_prompt(vocals="original", sheetsage="no vocals"))
    assert error["node_type"] == "PlenioTranscribeLyrics"
    assert "no vocal melody" in error["exception_message"]
    assert events(log, "render") == []


# --- new lyrics ------------------------------------------------------------------------------------


def test_new_lyrics_are_written_against_the_final_score(server: ComfyServer, log: Log) -> None:
    # phrasing reference off: the ASR is not needed (variant 9 has no transcript)
    entry = server.run(cover_prompt(vocals="new", variant=9))
    render = events(log, "render")[-1]
    assert render["lyrics"].startswith("[Verse]\nPaper lanterns on the river")
    assert tags(render["lyrics"]) == ["[Verse]", "[Pre-Chorus]", "[Chorus]", "[Outro]"]
    assert "8" not in entry["outputs"]
    llm = events(log, "llm")[-1]
    assert llm["variant"] == "cover-new"


# --- instrumental ----------------------------------------------------------------------------------


def test_new_cover_every_run_writes_new_lyrics_on_the_same_transcription(
    server: ComfyServer, log: Log
) -> None:
    """0.2.2 work mode *new cover every run*: no review stops; each run a new version from the writer,
    while the source's transcription is computed at most once."""
    prompt = cover_prompt(
        vocals="new",
        genre=f"jazz {uuid.uuid4().hex[:6]}",
        mode="new cover every run",
        score_review="as the brief says",
        text_review="as the brief says",
    )
    server.run(prompt)
    server.run(prompt)
    prompts = [e["prompt"] for e in events(log, "llm")]
    assert len(prompts) == 2 and prompts[0] != prompts[1] and all("Series:" in p for p in prompts)
    assert len(events(log, "render")) == 2 and len(events(log, "sheetsage")) <= 1


def test_instrumental_cover_is_tags_only_with_a_silent_vocal_voice(server: ComfyServer, log: Log) -> None:
    entry = server.run(cover_prompt(vocals="instrumental", variant=10))
    render = events(log, "render")[-1]
    assert render["lyrics"] == "[Verse]\n\n[Pre-Chorus]\n\n[Chorus]\n\n[Outro]"  # the final score's sections
    assert "voice" not in render["style"].lower() and "English" not in render["style"]
    abc = render["abc"].splitlines()
    vocal_music = [abc[i + 1] for i, line in enumerate(abc) if line == "V: Vocal"]
    assert vocal_music and all(set(line) <= set("zZ0123456789|") for line in vocal_music)  # rests only
    assert "8" not in entry["outputs"]  # no ASR for instrumental covers
    check = summary(entry, "17")
    assert "passed" in check.lower() or "ok" in check.lower()


def test_check_vocals_flags_a_take_with_vocal_notes(server: ComfyServer, log: Log) -> None:
    entry = server.run(cover_prompt(vocals="instrumental", variant=10, check_sheetsage="normal"))
    check = summary(entry, "17")
    assert "vocal suspected" in check
    # the take is still delivered (a warning, not an error) so it can be listened to
    assert "18" in entry["outputs"]


def test_check_vocals_skips_sung_covers(server: ComfyServer, log: Log, primed: dict[str, Any]) -> None:
    entry = server.run(cover_prompt(vocals="original", check_sheetsage="normal"))
    assert "no vocal check" in summary(entry, "17")


# --- failures, invalid combinations, review --------------------------------------------------------


def test_a_failed_transcription_stops_with_a_clear_error(server: ComfyServer, log: Log) -> None:
    error = server.run_expect_error(cover_prompt(vocals="instrumental", sheetsage="fail"))
    assert error["node_type"] == "PlenioTranscribeScore"
    assert "could not transcribe" in error["exception_message"]
    assert events(log, "llm") == [] and events(log, "render") == []


def test_a_malformed_manual_score_stops_before_lyrics_and_render(server: ComfyServer, log: Log) -> None:
    state = sheet_state({"score": {"state": "manual", "text": "X:1\nM:4/4\nthis is not a score"}})
    error = server.run_expect_error(cover_prompt(vocals="instrumental", variant=10, score_state=state))
    assert error["node_type"] == "PlenioSongSheet"
    assert "score" in error["exception_message"].lower()
    assert events(log, "llm") == [] and events(log, "render") == []


def test_words_in_an_instrumental_cover_are_rejected(server: ComfyServer, log: Log) -> None:
    text_state = sheet_state({"lyrics": {"state": "manual", "text": "[Verse]\nsome words\n\n[Chorus]"}})
    error = server.run_expect_error(cover_prompt(vocals="instrumental", variant=10, text_state=text_state))
    assert error["node_type"] == "PlenioSongSheet"
    assert "only section tags" in error["exception_message"]
    assert events(log, "render") == []


def test_a_cover_brief_without_target_style_is_rejected(server: ComfyServer, log: Log) -> None:
    error = server.run_expect_error(cover_prompt(vocals="instrumental", genre=""))
    assert error["node_type"] == "PlenioCoverBrief"
    assert "target style" in error["exception_message"]


def test_score_review_stops_before_asr_writer_and_render(server: ComfyServer, log: Log) -> None:
    # variant 11 has no ASR transcript: the waiting run must not reach Transcribe Lyrics
    waiting = server.run(cover_prompt(vocals="original-en", variant=11, score_review="stop for review"))
    payload = sheet_payload(waiting, "7")
    assert payload["waiting"] and payload["fingerprint"]
    assert events(log, "llm") == [] and events(log, "render") == []
    manual = "[Verse]\nA line\n\n[Pre-Chorus]\nB line\n\n[Chorus]\nC line\n\n[Outro]"
    log.clear()
    server.run(
        cover_prompt(
            vocals="original-en",
            variant=11,
            score_review="stop for review",
            score_state=sheet_state(approved=payload["fingerprint"]),
            text_state=sheet_state({"lyrics": {"state": "manual", "text": manual}}),
        )
    )
    assert events(log, "sheetsage") == []  # the transcription was cached; only the sheet re-ran
    assert len(events(log, "render")) == 1 and events(log, "render")[0]["lyrics"] == manual


# --- takes (AS-16) ---------------------------------------------------------------------------------


def takes_prompt(takes: int, take_seed: int, check_sheetsage: str, **options: Any) -> dict[str, Any]:
    """The cover graph with the render inside a native loop, node ids as the frontend flattens a
    blueprint (``<wrapper>:<inner>``), like the *YuE2 Takes* blueprint."""
    prompt = cover_prompt(vocals="instrumental", variant=10, check_sheetsage=check_sheetsage, **options)
    render = prompt.pop("15")
    prompt.update(
        {
            "31": {"class_type": "PrimitiveInt", "inputs": {"value": take_seed}},
            "30:1": {
                "class_type": "StartLoop",
                "inputs": {
                    "mode": "simple",
                    "mode.num_iterations": takes,
                    "cache_iterations": False,
                    "initial_iteration_value": render["inputs"]["lyrics"],  # starts with the final lyrics
                },
            },
            "30:2": {
                "class_type": "ComfyMathExpression",
                "inputs": {"expression": "a + b", "values.a": ["30:1", 0], "values.b": ["31", 0]},
            },
            "30:3": {
                "class_type": "PlenioTestFakeRender",
                "inputs": {**render["inputs"], "seed": ["30:2", 1]},
            },
            "30:4": {"class_type": "EndLoop", "inputs": {"accumulate": True, "output_value": ["30:3", 0]}},
            "19": {"class_type": "PreviewAudio", "inputs": {"audio": ["17", 3]}},
        }
    )
    prompt["17"]["inputs"]["audio"] = ["30:4", 0]
    return prompt


def test_takes_loop_renders_n_seeds_and_check_vocals_keeps_one(server: ComfyServer, log: Log) -> None:
    entry = server.run(takes_prompt(3, 5, "no vocals"))
    assert sorted(e["seed"] for e in events(log, "render")) == [5, 6, 7]
    check = summary(entry, "17")
    assert "take 3" in check and "take 4" not in check
    assert len(entry["outputs"]["19"]["audio"]) == 3  # every take can be listened to
    assert "18" in entry["outputs"]  # one export: the selected take


def test_takes_loop_with_a_new_take_seed_renders_new_takes_only(server: ComfyServer, log: Log) -> None:
    server.run(takes_prompt(2, 40, "no vocals"))
    log.clear()
    entry = server.run(takes_prompt(2, 50, "no vocals"))
    assert sorted(e["seed"] for e in events(log, "render")) == [50, 51]
    assert "take 2" in summary(entry, "17")
    assert events(log, "llm") == [] and events(log, "sheetsage") == []  # the documents stay cached
    # Measured on ComfyUI 0.37.0: the native loop re-runs its body on every queue, even unchanged and
    # with cache_iterations (Start Loop's fingerprint is NaN) - N takes cost N renders per run.


@pytest.mark.parametrize("sheet", ["score", "text"])
def test_takes_loop_waits_with_the_sheets_under_review(server: ComfyServer, log: Log, sheet: str) -> None:
    # A native loop whose body is blocked never finishes (ComfyUI 0.37.0); the Takes blueprint therefore
    # starts the loop with the final lyrics, which a waiting sheet withholds.
    review = {"score_review": "stop for review"} if sheet == "score" else {"text_review": "stop for review"}
    entry = server.run(takes_prompt(2, 70, "no vocals", **review), timeout=120)
    assert sheet_payload(entry, "7" if sheet == "score" else "14")["waiting"]
    assert events(log, "render") == [] and "18" not in entry["outputs"]
