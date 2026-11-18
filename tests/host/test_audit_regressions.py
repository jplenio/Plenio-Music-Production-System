"""Regression tests for defects found in the Phase 9 audit that need a server of their own.

The server starts with a broken user template and a broken Plenio configuration in its user
directory: Plenio must still register every node, and the System Check must report the problem.
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = pytest.mark.host

ALL_NODES = {
    "PlenioSongBrief",
    "PlenioCoverBrief",
    "PlenioEngine",
    "PlenioComposePrompt",
    "PlenioParseDraft",
    "PlenioSongSheet",
    "PlenioScoreTools",
    "PlenioTranscribeScore",
    "PlenioTranscribeLyrics",
    "PlenioVocalCheck",
    "PlenioHQStereoCleanup",
    "PlenioHQRegenerateHighs",
    "PlenioHQDeReverb",
    "PlenioHQMastering",
    "PlenioEQ",
    "PlenioLoudness",
    "PlenioExportRelease",
    "PlenioSystemCheck",
    "PlenioAudioModelLoader",
    "PlenioRefine",
    "PlenioSeparateStems",
    "PlenioStemMixer",
}


@pytest.fixture(scope="module")
def broken_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-broken-user")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    plenio = base / "user" / "plenio"
    (plenio / "templates").mkdir(parents=True)
    (plenio / "templates" / "broken.md").write_text(
        "---\nname: Broken\nthis line has no colon\n---\n\nbody\n", encoding="utf-8"
    )
    (plenio / "templates" / "mine.md").write_text("---\nname: Mine\ngenre: folk\n---\n", encoding="utf-8")
    (plenio / "config.toml").write_text("offline = maybe\n", encoding="utf-8")
    server = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME], extra_env={"PLENIO_OFFLINE": "1"})
    server.start()
    yield server
    server.stop()


def test_a_broken_user_template_does_not_stop_plenio_from_loading(broken_server: ComfyServer) -> None:
    """AUD-01: one malformed file in user/plenio/templates made the whole import fail (0 nodes)."""
    info = broken_server.get("/object_info")
    assert ALL_NODES <= set(info)
    templates = info["PlenioSongBrief"]["input"]["required"]["template"]
    options = templates[1]["options"] if isinstance(templates[0], str) else templates[0]
    assert "user/mine" in options and "user/broken" not in options
    listing = broken_server.get("/plenio/templates")
    assert "malformed front matter line" in listing["problems"]["user/broken"]


def test_the_system_check_reports_a_broken_configuration(broken_server: ComfyServer) -> None:
    """AUD-06: an invalid config.toml made the System Check itself fail."""
    data = broken_server.get("/plenio/system")
    assert data["report"]["status"] == "warning"
    assert "Plenio configuration error" in data["markdown"]
    assert "config.toml" in data["markdown"]


@pytest.mark.parametrize(
    ("path", "body", "message"),
    [
        ("/plenio/eq/response", {"settings": "", "sample_rate": "fast"}, "sample_rate"),
        ("/plenio/eq/response", {"settings": "", "sample_rate": 0}, "sample_rate"),
        ("/plenio/eq/response", {"settings": "", "points": 10**9}, "points"),
        ("/plenio/eq/response", {"settings": "", "points": 100.5}, "points"),
        (
            "/plenio/sheet/resolve",
            {"owned": ["lyrics"], "upstream": {}, "max_seconds": "long"},
            "max_seconds",
        ),
        ("/plenio/sheet/resolve", {"owned": ["lyrics"], "upstream": {}, "review": "later"}, "review"),
        ("/plenio/sheet/resolve", {"owned": ["lyrics"], "upstream": {}, "engine": "nope"}, "nope"),
        ("/plenio/sheet/resolve", {"owned": "lyrics", "upstream": {}}, "owned"),
        ("/plenio/lyrics/analyze", {"lyrics": "[Verse]\nla", "engine": "nope"}, "nope"),
        (
            "/plenio/score/transform",
            {"abc": "x", "operation": {"op": "transpose", "semitones": float("inf")}},
            "whole number",
        ),
    ],
)
def test_routes_answer_bad_input_with_400(server: ComfyServer, path: str, body: dict, message: str) -> None:
    """AUD-08: malformed requests ended as 500 (and 'points' was unbounded)."""
    status, answer = server.request("POST", path, body)
    assert status == 400, answer
    assert message in answer["error"]["message"] + str(answer["error"].get("hint"))


def test_musicxml_goes_out_and_comes_back_through_the_routes(server: ComfyServer) -> None:
    """Export MusicXML -> Import MusicXML… (feature request 2026-10-22): the score and the lyrics with their
    places come back; MusicXML Plenio did not write is a clear 400."""
    abc = (
        "X:1\nT:\nM:4/4\nL:1/8\nQ:1/4=120\n"
        'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
        'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
        "K:C\n% verse\nV: Vocal\nCDEF GABc|c8|\nV: Ins\nC8|C8|\n"
    )
    lyrics = "[Verse]\nwalking down the river side\n"
    status, exported = server.request(
        "POST", "/plenio/score/musicxml/export", {"abc": abc, "title": "River", "lyrics": lyrics}
    )
    assert status == 200, exported
    status, back = server.request(
        "POST", "/plenio/score/musicxml/import", {"text": exported["data"], "abc": abc, "lyrics": lyrics}
    )
    assert status == 200, back
    assert back["abc"] == abc and back["lyrics"] == lyrics
    assert back["lyric_spans"] and len(back["lyric_spans"][0]) > 4  # the syllables' onsets
    assert back["analysis"]["ok"] and back["report"][0].startswith("2 bars at 120 BPM")
    foreign = exported["data"].replace("Plenio Music Production System", "MuseScore 4")
    status, answer = server.request("POST", "/plenio/score/musicxml/import", {"text": foreign, "abc": abc})
    assert status == 400 and "not by Plenio" in answer["error"]["message"]
    # a span with the onsets of its syllables passes the routes' check
    status, view = server.request(
        "POST", "/plenio/score/analyze", {"abc": abc, "lyrics": lyrics, "lyric_spans": back["lyric_spans"]}
    )
    assert status == 200 and view["ok"]


def test_tag_copy_accepts_an_annotated_load_audio_value(server: ComfyServer) -> None:
    """AUD-17: 'copy from loaded file' did not resolve Load Audio values like 'x.flac [input]'."""
    import uuid

    import numpy as np

    from plenio.core.release import read_tags, write_audio

    name = f"annotated-{uuid.uuid4().hex[:8]}.flac"
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100 * 2) / 44100
    write_audio(
        server.base / "input" / name,
        0.1 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2),
        44100,
        "flac",
        {"title": "Annotated", "artist": "Plenio"},
    )
    folder = f"plenio-audit/{uuid.uuid4().hex[:8]}"
    prompt = {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": f"{name} [input]"}},
        "2": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["1", 0],
                "folder": folder,
                "naming": "{title}",
                "collision": "number",
                "tags": "copy from loaded file",
            },
        },
    }
    server.run(prompt)
    tags, _cover = read_tags(server.output_dir / folder / "Annotated.flac")
    assert tags["artist"] == "Plenio"


def test_corrected_lyrics_of_a_song_sheet_win_over_the_copied_lyrics_tag(server: ComfyServer) -> None:
    """GitHub issue (1.3.1): Enhance & Master released the lyrics as heard, with no way to correct them. Its
    Lyrics block ends in a Song Sheet; corrected there, its words go into the record and - over the copied
    file's own lyrics tag - into the tags."""
    import json
    import uuid

    import numpy as np

    from plenio.core.release import read_tags, write_audio

    name = f"sung-{uuid.uuid4().hex[:8]}.flac"
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100 * 2) / 44100
    write_audio(
        server.base / "input" / name,
        0.1 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2),
        44100,
        "flac",
        {"title": "Streetlights", "artist": "Plenio", "lyrics": "the streetlights bleed"},
    )
    corrected = "[Verse]\nThe streetlamps bleed across the wet ground"
    state = {"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "manual", "text": corrected}}}
    folder = f"plenio-audit/{uuid.uuid4().hex[:8]}"
    prompt = {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": name}},
        "2": {
            "class_type": "PlenioSongSheet",
            "inputs": {"review": "continue", "sheet_state": json.dumps(state)},
        },
        "3": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["1", 0],
                "reports.report_0": ["2", 7],
                "folder": folder,
                "naming": "{title}",
                "collision": "number",
                "tags": "copy from loaded file",
                "lyrics_srt": False,
            },
        },
    }
    server.run(prompt)
    tags, _cover = read_tags(server.output_dir / folder / "Streetlights.flac")
    assert tags["lyrics"] == "The streetlamps bleed across the wet ground" and tags["artist"] == "Plenio"
    record = json.loads((server.output_dir / folder / "Streetlights.plenio.json").read_text(encoding="utf-8"))
    assert record["documents"]["lyrics"]["text"] == corrected


def test_the_record_says_when_how_long_and_on_what_the_song_was_made(server: ComfyServer) -> None:
    """Owner's request 2026-10-28: the song's details show when it was made (date and time), how long it took and
    on what (the graphics card or the processor, the RAM)."""
    import json
    import uuid

    import numpy as np

    from plenio.core.release import record_fingerprint, write_audio

    name = f"made-{uuid.uuid4().hex[:8]}.flac"
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100) / 44100
    write_audio(
        server.base / "input" / name, 0.1 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2), 44100, "flac", {}
    )
    folder = f"plenio-audit/{uuid.uuid4().hex[:8]}"
    prompt = {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": name}},
        "2": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["1", 0],
                "folder": folder,
                "naming": "made",
                "collision": "number",
                "lyrics_srt": False,
            },
        },
    }
    server.run(prompt)
    record = json.loads((server.output_dir / folder / "made.plenio.json").read_text(encoding="utf-8"))
    made = record["made"]
    assert made["started"] and made["finished"] and made["seconds"] is not None and made["seconds"] >= 0
    assert made["on"]["device"] in ("gpu", "cpu") and made["on"]["cpu"] and made["on"]["cores"]
    # when and on what it was made is not the song: the fingerprint leaves it out
    assert record["fingerprint"] == record_fingerprint({**record, "made": {"seconds": 1}})


def test_a_loud_unmastered_take_is_a_note_not_a_warning(server: ComfyServer) -> None:
    """A YuE2 render peaks above full scale, so its (original).flac clips; the export warned about it
    on every run ('a limiter before the export avoids this'), though the mastered files were fine."""
    import uuid

    import numpy as np

    from plenio.core.release import write_audio

    tag = uuid.uuid4().hex[:8]
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100 * 2) / 44100
    tone = np.vstack([np.sin(2 * np.pi * 220 * t)] * 2)
    write_audio(server.base / "input" / f"mastered-{tag}.flac", 0.5 * tone, 44100, "flac", {})
    write_audio(server.base / "input" / f"loud-{tag}.wav", 1.2 * tone, 44100, "wav", {})  # float: > 1 kept

    def export(audio: str, original: str | None) -> dict:
        folder = f"plenio-audit/{uuid.uuid4().hex[:8]}"
        prompt = {
            "1": {"class_type": "LoadAudio", "inputs": {"audio": audio}},
            "3": {
                "class_type": "PlenioExportRelease",
                "inputs": {
                    "audio": ["1", 0],
                    "folder": folder,
                    "naming": "{title}",
                    "collision": "number",
                    "tags": "title only",
                    **({"original": ["2", 0]} if original else {}),
                },
            },
        }
        if original:
            prompt["2"] = {"class_type": "LoadAudio", "inputs": {"audio": original}}
        return server.run(prompt)["outputs"]["3"]["plenio_summary"][0]

    quiet_song = export(f"mastered-{tag}.flac", f"loud-{tag}.wav")
    assert quiet_song["status"] == "ok", quiet_song["markdown"]
    assert "the unmastered take peaks at 1.200" in quiet_song["markdown"]
    assert "limiter" not in quiet_song["markdown"]
    loud_song = export(f"loud-{tag}.wav", None)  # the released file itself clips: still a warning
    assert loud_song["status"] == "warning" and "a limiter before the export" in loud_song["markdown"]


def test_a_repeated_title_gets_a_number_and_the_record_says_why_there_are_no_times(
    server: ComfyServer,
) -> None:
    """Every cover of one song had the same title in the Plenio Player (a user's report 2026-10-22): the second
    song of a title in the export folder is titled ``(2)``, in its tags, its record and its file name. And the
    record says why a song has no lyrics times (offline here: the ASR model is missing)."""
    import json
    import uuid

    import numpy as np

    from plenio.core.release import read_tags, write_audio

    tag = uuid.uuid4().hex[:8]
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100) / 44100
    write_audio(
        server.base / "input" / f"song-{tag}.flac",
        0.3 * np.vstack([np.sin(2 * np.pi * 330 * t)] * 2),
        44100,
        "flac",
        {},
    )
    folder = f"plenio-titles/{tag}"

    def export(collision: str, embed: bool = True) -> tuple[dict, dict]:
        prompt = {
            "1": {"class_type": "LoadAudio", "inputs": {"audio": f"song-{tag}.flac"}},
            "3": {
                "class_type": "PlenioExportRelease",
                "inputs": {
                    "audio": ["1", 0],
                    "folder": folder,
                    "naming": "{title}",
                    "collision": collision,
                    "tags": "title only",
                    "title": "Yesterday",
                    "project_in_flac": embed,  # another input: ComfyUI runs the export again
                },
            },
        }
        outputs = server.run(prompt)["outputs"]["3"]
        record = json.loads(
            (server.output_dir / outputs["plenio_player"][0]["record"]).read_text(encoding="utf-8")
        )
        return outputs["plenio_summary"][0], record

    first, record = export("number")
    assert record["title"] == "Yesterday" and "title:" not in first["markdown"]
    assert record["subtitles"]["wanted"] is True and record["subtitles"]["takes"] == 0
    assert record["subtitles"]["why"][0].startswith("the lyrics ASR could not run")
    # how it came out, measured: in the record, and its stars in the summary when there are any
    assert record["quality"]["version"] == 1
    assert ("- stars: " in first["markdown"]) == (record["quality"]["stars"] is not None)
    second, record = export("number", embed=False)
    assert record["title"] == "Yesterday (2)"
    assert (
        "another song in this folder is titled 'Yesterday' - this one is 'Yesterday (2)'"
        in second["markdown"]
    )
    tags, _cover = read_tags(server.output_dir / folder / "Yesterday (2).flac")
    assert tags["title"] == "Yesterday (2)"
    # overwrite replaces the song of that title: no number
    _third, record = export("overwrite")
    assert record["title"] == "Yesterday"


def test_a_free_form_length_passes_validation_with_a_note(server: ComfyServer) -> None:
    """A length like '2-3 minutes' (the predecessor toolkit's option, reused from other parameters)
    failed the prompt's validation; it now takes the nearest option and the node says so."""
    prompt = {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "mode": "one song, stop to review",
                "template": "none",
                "description": "A song about rain",
                "genre": "piano pop",
                "mood": "",
                "tempo": "",
                "length": "2-3 minutes",
                "vocals": "sung",
                "vocals.language": "English",
                "vocals.voice": "",
                "vocals.theme": "",
                "key": "",
                "meter": "",
            },
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 1], "label": "brief"}},
    }
    entry = server.run(prompt)
    assert "about 2:30" in entry["outputs"]["2"]["received"][0]
    summary = entry["outputs"]["1"]["plenio_summary"][0]
    assert summary["status"] == "warning" and "2-3 minutes" in summary["markdown"]
