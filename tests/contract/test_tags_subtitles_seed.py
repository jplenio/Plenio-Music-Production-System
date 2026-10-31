"""1.0.0 (owner's request 2026-10-15): the briefs' fields as outputs and as Export Release's variables, the tags
filled with them, the lyrics subtitles timed from what the ASR heard, and Plenio · Seed."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

pytestmark = pytest.mark.comfy

ROOT = Path(__file__).resolve().parents[2]
SCORE = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")


def node(name: str) -> Any:
    from plenio.comfy import nodes

    return next(n for n in nodes.NODES if n.GET_SCHEMA().node_id == name)


def song_brief(vocals: dict[str, Any] | None = None, **extra: Any) -> Any:
    return node("PlenioSongBrief").execute(
        mode="one song, stop to review",
        template="none",
        description="a song about the sea",
        genre="indie pop",
        mood="",
        tempo="96 BPM",
        length="standard (about 3:00)",
        vocals=vocals or {"vocals": "sung", "language": "English", "voice": "warm voice", "theme": "the sea"},
        **extra,
    )


def test_the_song_briefs_fields_come_out_one_by_one(comfy_path: Path) -> None:
    output = song_brief(arrangement="hypnotic", genre_closeness=40, lines_under_singing=True, creativity=75)
    schema = node("PlenioSongBrief").GET_SCHEMA()
    names = [o.display_name for o in schema.outputs]
    assert names[:5] == [
        "brief",
        "brief_text",
        "max_seconds",
        "instrumental",
        "song_seed",
    ]  # saved links stay
    fields = dict(zip(names[5:], output.result[5:], strict=True))
    assert fields == {
        "template": "",
        "genre": "indie pop",
        "mood": "",
        "tempo": "96 BPM",
        "length": "standard (about 3:00)",
        "vocals": "sung",
        "language": "English",
        "voice": "warm voice",
        "theme": "the sea",
        "key": "",
        "meter": "",
        "arrangement": "hypnotic",
        "genre_closeness": 40,
        "lines_under_singing": True,
        "creativity": 75,
    }
    # the summary says what the chosen creative mode does (its tooltip names no modes any more), and the creativity
    summary = output.ui["plenio_summary"][0]["markdown"]
    assert "A steady repeating pattern" in summary and "Creativity: **75 (varied)**" in summary
    assert song_brief().result[0].creativity == 100  # without the slider (an older workflow): the default
    instrumental = song_brief(
        {"vocals": "instrumental", "melody": "accompaniment only", "lead_instrument": ""}
    )
    assert dict(zip(names[5:], instrumental.result[5:], strict=True))["language"] == ""


def test_the_cover_briefs_fields_use_the_option_names(comfy_path: Path) -> None:
    output = node("PlenioCoverBrief").execute(
        mode="one cover, stop to review",
        template="none",
        description="",
        genre="jazz",
        mood="mellow",
        vocals={"vocals": "original lyrics", "language": "", "voice": ""},
        harmony="keep original chords",
        title="A cover",
    )
    names = [o.display_name for o in node("PlenioCoverBrief").GET_SCHEMA().outputs]
    fields = dict(zip(names[5:], output.result[5:], strict=True))
    assert fields["vocals"] == "original lyrics" and fields["harmony"] == "keep original chords"
    assert fields["song_flow_closeness"] == 70 and fields["genre"] == "jazz"


def test_the_brief_seeds_and_writer_become_variables(comfy_path: Path) -> None:
    from plenio.comfy.nodes import export

    brief = song_brief().result[0]
    values = export.brief_variables(brief)
    assert (
        values["genre"] == "indie pop"
        and values["language"] == "English"
        and values["genre_closeness"] == "70"
    )
    assert values["lines_under_singing"] == "off" and values["mode"] == "one song, stop to review"
    prompt = {
        "3": {
            "class_type": "PlenioSeed",
            "inputs": {"seed": 77, "keep_seed": False},
            "_meta": {"title": "Take seed"},
        },
        "4": {"class_type": "SeedNode", "inputs": {"seed": 5}, "_meta": {"title": "Draft seed"}},
        "5": {"class_type": "PlenioWriterChoice", "inputs": {"model": "LLM/Qwen_Qwen3.5-9B-Q4_K_M.gguf"}},
        "6": {
            "class_type": "PlenioSeed",
            "inputs": {"seed": ["9", 0]},
            "_meta": {"title": "Arrangement seed"},
        },
    }
    assert export.prompt_variables(prompt) == {
        "take_seed": "77",
        "seed": "77",
        "draft_seed": "5",
        "writer": "Qwen_Qwen3.5-9B-Q4_K_M",
    }
    assert export.brief_variables(None) == {}


def test_tags_take_variables_and_the_tag_variables_come_first(comfy_path: Path) -> None:
    from plenio.comfy.nodes import export

    fields = {
        "artist": "Plenio Band",
        "album": "{genre} Sessions",
        "comment": "[Mood: {mood} · ]by {artist} on {album}",
        "genre": "{genre}",
        "lyrics": "{lyrics}",
        "date": "{nope}",
    }
    values = {"genre": "indie pop", "mood": "", "lyrics": "line one\nline two"}
    tags, notes = export.expand_tags(fields, values)
    assert tags == {
        "artist": "Plenio Band",
        "album": "indie pop Sessions",
        "comment": "by Plenio Band on indie pop Sessions",
        "genre": "indie pop",
        "lyrics": "line one\nline two",
        "date": "{nope}",  # connected text: an unknown name stays as written, with a note
    }
    assert notes and "{nope}" in notes[0]


def test_a_typo_in_a_typed_field_stops_the_run_before_it_renders(comfy_path: Path) -> None:
    validate = node("PlenioExportRelease").validate_inputs
    assert validate(naming="{date} {title}", tags={"tags": "tags", "comment": "{genre}"}) is True
    message = validate(naming="{date} {title}", tags={"tags": "tags", "comment": "Genre: {genr}"})
    assert isinstance(message, str) and "{genr}" in message and "comment" in message
    assert "file name pattern" in validate(naming="{titel}", tags={"tags": "title only"})
    assert isinstance(validate(**{"naming": "{title}", "tags.album": "{albm}"}), str)


def test_subtitles_from_what_the_asr_heard(comfy_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import numpy as np

    from plenio.comfy.nodes import export
    from plenio.core.alignment import AsrWord
    from plenio.core.asr import AsrResult

    asked: list[Any] = []
    words = [("Hold", 1.0, 1.4), ("on", 1.4, 1.8), ("to", 1.8, 2.0), ("the", 2.0, 2.2), ("light", 2.2, 3.0)]
    words += [("Never", 5.0, 5.4), ("let", 5.4, 5.6), ("it", 5.6, 5.8), ("go", 5.8, 6.6)]
    # a line the take makes up (owner's request 2026-10-23: what it really sings, documented and to follow)
    words += [("oh", 8.0, 8.3), ("yeah", 8.3, 8.9)]

    def fake_asr(audio: Any, settings: Any, source: str, progress: Any) -> AsrResult:
        asked.append(settings)
        heard = tuple(AsrWord(a, b, w, 0.9, 0) for w, a, b in words)
        return AsrResult("faster-whisper-large-v3", "large-v3", "en", 0.99, (), heard)

    monkeypatch.setattr(export, "run_asr", fake_asr)
    samples = np.zeros((2, 48000 * 10))
    sheet = {"lyrics": "[Verse]\nHold on to the light\nNever let it go", "score": "", "engine": ""}
    notes: list[str] = []
    timed, sung, why, heard_from = export._subtitles(samples, 48000, sheet, [], None, notes)
    assert (
        timed is not None and why == "" and notes == [] and asked[0].language == "en"
    )  # guessed from the lyrics
    assert [line.text for line in timed.lines] == ["Hold on to the light", "Never let it go"]
    assert timed.lines_srt().startswith("1\n00:00:0")
    assert sung is not None and [line.text for line in sung.subtitles.lines][-1] == "oh yeah"
    assert sung.written_heard == 1.0 and sung.extra_words == 2 and sung.text.startswith("[Verse]\nHold on")
    # an instrumental has no words: no ASR, no subtitles
    instrumental = song_brief(
        {"vocals": "instrumental", "melody": "accompaniment only", "lead_instrument": ""}
    )
    assert export._subtitles(samples, 48000, sheet, [], instrumental.result[0], notes) == (
        None,
        None,
        "an instrumental: no words",
        "",
    )
    assert len(asked) == 1 and heard_from == "the song"
    # heard on the take's vocal stem when it can be separated (owner 2026-10-24: the timing as good as possible)
    heard_audio: list[Any] = []

    def on_stem(audio: Any, settings: Any, source: str, progress: Any) -> AsrResult:
        heard_audio.append(audio)
        return fake_asr(audio, settings, source, progress)

    monkeypatch.setattr(export, "run_asr", on_stem)
    monkeypatch.setattr(export, "vocal_stem", lambda x, rate: (x * 0.5, ""))
    timed, sung, why, heard_from = export._subtitles(samples, 48000, sheet, [], None, notes, on_stem=True)
    assert timed is not None and heard_from == "vocal stem" and len(heard_audio) == 1
    # no separation model: the song is heard, and the summary says why
    monkeypatch.setattr(export, "vocal_stem", lambda x, rate: (None, "the separation model is not installed"))
    _timed, _sung, _why, heard_from = export._subtitles(samples, 48000, sheet, [], None, notes, on_stem=True)
    assert heard_from == "the song" and any("heard on the song - the separation model" in n for n in notes)


def test_subtitles_are_left_out_with_a_note_when_the_asr_cannot_run(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    import numpy as np

    from plenio.comfy.nodes import export
    from plenio.core.errors import PlenioAssetError

    def offline(*_args: Any) -> Any:
        raise PlenioAssetError("The asset is missing and offline mode is on.")

    monkeypatch.setattr(export, "run_asr", offline)
    notes: list[str] = []
    sheet = {"lyrics": "[Verse]\nHold on", "score": "", "engine": ""}
    timed, sung, why, _heard = export._subtitles(np.zeros((1, 4800)), 48000, sheet, [], None, notes)
    assert (
        timed is None
        and sung is None
        and why == "the lyrics ASR could not run: The asset is missing and offline mode is on."
    )
    assert notes and notes[0].startswith("subtitles: not written")


def test_the_seed_node(comfy_path: Path) -> None:
    seed = node("PlenioSeed")
    info = seed.GET_NODE_INFO_V1()
    spec = info["input"]["required"]["seed"][1]
    # no ComfyUI control: the frontend adds one to every INT named seed unless told not to
    assert spec["control_after_generate"] is False
    keep = info["input"]["required"]["keep_seed"][1]
    assert keep["label_on"].startswith("🔒") and keep["label_off"].startswith("🎲")
    assert seed.execute(seed=123, keep_seed=True).result == (123,)
