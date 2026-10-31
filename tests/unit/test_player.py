"""The Plenio Player's server (owner's request 2026-10-15): the songs of a folder from their release records,
one song with its times and notation, the files in ranges, the listener's state - and it writes into the
songs' folder only to retire or delete a song the listener removes (owner's request 2026-10-16)."""

from __future__ import annotations

import http.client
import json
import os
import re
import threading
import urllib.parse
import urllib.request
from collections.abc import Iterator
from pathlib import Path

import pytest

from plenio.player import launch
from plenio.player.library import (
    RETIRED_DIR,
    Library,
    brief_facts,
    parse_srt,
    prompt_facts,
    remove_song,
    sampling_facts,
    score_facts,
    song_detail,
)
from plenio.player.server import State, comfyui_at, serve

SCORE = """X:1
T:
M:4/4
L:1/8
Q:1/4=120
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
% intro
V: Vocal
z8|
V: Ins
C8|
% verse
V: Vocal
CDEF GABc|
V: Ins
C8|
"""
LYRICS = "[Verse]\nwalking down the river side"
PROMPT = {
    "1": {
        "class_type": "PlenioSongBrief",
        "inputs": {
            "template": "none",
            "genre": "folk, acoustic",
            "mood": "warm",
            "vocals": "female",
            "key": "C",
        },
    },
    "2": {
        "class_type": "PlenioSeed",
        "_meta": {"title": "Take seed"},
        "inputs": {"seed": 42, "keep_seed": True},
    },
    "3": {"class_type": "PlenioWriterChoice", "inputs": {"model": "llm/gemma-4-e4b.gguf"}},
}
TIMING = [
    {
        "take": "",
        "timing": "measured",
        "warp": [1.0, -0.2],
        "lines": [
            {
                "text": "walking down the river side",
                "start": 1.8,
                "end": 4.0,
                "units": [[1.8, 3, 2.0], [2.05, 7, 2.25], [2.3, 12, 2.5]],
            }
        ],
    }
]


def record(title: str, **extra: object) -> dict[str, object]:
    return {
        "schema": "plenio.record/1",
        "title": title,
        "created": "2026-10-15T10:00:00Z",
        "documents": {
            "lyrics": {"text": LYRICS, "sha256": "l1"},
            "score": {"text": SCORE, "sha256": "s1"},
            "style": {"text": "folk, warm female voice"},
        },
        "prompt": PROMPT,
        "audio": {"seconds": 6.0, "loudness": [{"integrated_lufs": -14.2}], "tags": {"artist": "Plenio"}},
        "files": [
            {"name": f"{title}.flac", "format": "flac"},
            {"name": "../outside.flac", "role": "original"},
        ],
        "reports": [{"kind": "render", "data": {"engine": "yue2"}}],
        **extra,
    }


@pytest.fixture
def songs(tmp_path: Path) -> Path:
    folder = tmp_path / "output" / "plenio"
    folder.mkdir(parents=True)
    (folder / "River.plenio.json").write_text(json.dumps(record("River", timing=TIMING)), encoding="utf-8")
    (folder / "River.flac").write_bytes(bytes(range(256)) * 4)
    (tmp_path / "output" / "outside.flac").write_bytes(b"secret")
    (folder / "Old.plenio.json").write_text(json.dumps(record("Old")), encoding="utf-8")
    (folder / "Old.flac").write_bytes(b"x" * 100)
    (folder / "Old (lines).srt").write_text(
        "1\n00:00:01,800 --> 00:00:04,000\nwalking down the river side\n", encoding="utf-8"
    )
    (folder / "Old (notes).srt").write_text(
        "1\n00:00:01,800 --> 00:00:02,300\nwalking\n\n2\n00:00:02,300 --> 00:00:04,000\nwalking down the river side\n",
        encoding="utf-8",
    )
    (folder / "broken.plenio.json").write_text("{not json", encoding="utf-8")
    return tmp_path / "output"


@pytest.fixture
def server(songs: Path, tmp_path: Path) -> Iterator[tuple[str, int, Library]]:
    library = Library([songs], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    thread = threading.Thread(target=running.serve_forever, daemon=True)
    thread.start()
    yield "127.0.0.1", running.server_address[1], library
    running.shutdown()
    running.server_close()


def request(
    address: tuple[str, int, Library], method: str, path: str, body: bytes | None = None, **headers: str
) -> tuple[int, dict[str, str], bytes]:
    host, port, _ = address
    connection = http.client.HTTPConnection(host, port, timeout=10)
    connection.request(method, path, body=body, headers=headers)
    answer = connection.getresponse()
    data = answer.read()
    connection.close()
    return answer.status, dict(answer.getheaders()), data


def test_the_library_reads_records_and_leaves_out_broken_ones(songs: Path, tmp_path: Path) -> None:
    library = Library([songs], cache=tmp_path / "cache.json")
    found = {s["title"]: s for s in library.songs()}
    assert set(found) == {"River", "Old"}
    assert library.errors and "broken.plenio.json" in library.errors[0]
    river = found["River"]
    assert river["genre"] == "folk, acoustic" and river["mood"] == "warm" and river["model"] == "YuE2"
    assert river["bpm"] == 120 and river["score_key"] == "C" and river["score_meter"] == "4/4"
    assert river["seeds"] == {"take": 42} and river["writer"] == "gemma-4-e4b"
    assert river["has"]["audio"] and river["has"]["timing"] and not river["has"]["original"]
    assert river["lyrics"] == "walking down the river side"
    # a second library reads the cache, with the same songs
    again = Library([songs], cache=tmp_path / "cache.json")
    assert {s["id"] for s in again.songs()} == {s["id"] for s in found.values()}


def test_a_song_brings_its_times_and_its_notation(songs: Path) -> None:
    library = Library([songs])
    river = next(library.song(s["id"]) for s in library.songs() if s["title"] == "River")
    assert river is not None
    detail = song_detail(river)
    assert detail["timing_source"] == "measured"
    assert detail["lines"][0]["units"][0] == [1.8, 3, 2.0]
    assert detail["notation"]["tempo"] == 120 and detail["notation"]["warp"] == [1.0, -0.2]
    assert [s["label"] for s in detail["notation"]["sections"]] == ["intro", "verse"]
    assert detail["notation"]["sections"][1]["start"] == 2.0
    assert "w: wal-king down the ri-ver side" in detail["notation"]["abc"]
    assert detail["files"]["audio"] == "River.flac" and "original" not in detail["files"]


def test_a_song_brings_what_its_take_sings(tmp_path: Path) -> None:
    """Owner's request 2026-10-23: the lyrics as written and as the take sings them, both to follow. A song
    exported before has no sung version (an empty one, so the page offers the written lyrics only)."""
    folder = tmp_path / "plenio"
    folder.mkdir()
    sung = {
        "text": "[Verse]\nwalking down the riverside\noh baby",
        "lines": [{"text": "walking down the riverside", "start": 1.8, "end": 4.0, "units": [[1.8, 7]]}],
        "written_heard": 0.8,
        "extra_words": 2,
        "not_sung": [],
        "sections": [{"tag": "Verse", "words": 5, "heard": 4}],
    }
    timing = [{**TIMING[0], "sung": sung}]
    (folder / "River.plenio.json").write_text(json.dumps(record("River", timing=timing)), encoding="utf-8")
    (folder / "Old.plenio.json").write_text(json.dumps(record("Old", timing=TIMING)), encoding="utf-8")
    library = Library([folder])
    found = {s["title"]: s for s in library.songs()}
    assert found["River"]["has"]["sung"] and not found["Old"]["has"]["sung"]
    river = song_detail(library.song(found["River"]["id"]))  # type: ignore[arg-type]
    assert river["sung"]["lines"] == sung["lines"] and river["sung"]["written_heard"] == 0.8
    assert river["sung"]["text"].startswith("[Verse]") and river["lines"] == TIMING[0]["lines"]
    assert song_detail(library.song(found["Old"]["id"]))["sung"] == {}  # type: ignore[arg-type]


def test_without_times_in_the_record_the_subtitle_files_give_them(songs: Path) -> None:
    library = Library([songs])
    old = next(library.song(s["id"]) for s in library.songs() if s["title"] == "Old")
    assert old is not None
    detail = song_detail(old)
    assert detail["timing_source"] == "subtitles"
    line = detail["lines"][0]
    assert line["text"] == "walking down the river side"
    assert line["units"] == [[1.8, 7], [2.3, 27]]


def test_the_server_answers_the_page_the_library_and_a_song(server: tuple[str, int, Library]) -> None:
    status, headers, body = request(server, "GET", "/api/library")
    assert status == 200 and headers["Content-Type"].startswith("application/json")
    answer = json.loads(body)
    assert len(answer["songs"]) == 2 and answer["errors"]
    river = next(s for s in answer["songs"] if s["title"] == "River")
    status, _, body = request(server, "GET", f"/api/song/{river['id']}")
    assert status == 200 and json.loads(body)["lines"]
    assert request(server, "GET", "/api/song/nope")[0] == 404
    # the page for every other path (the player routes by #), never a file outside it
    status, headers, _ = request(server, "GET", "/playlists")
    assert status == 200 and headers["Content-Type"].startswith("text/html")
    status, _, body = request(server, "GET", "/../../pyproject.toml")
    assert b"[project]" not in body


def test_files_stream_in_ranges(server: tuple[str, int, Library]) -> None:
    songs = json.loads(request(server, "GET", "/api/library")[2])["songs"]
    river = next(s for s in songs if s["title"] == "River")
    url = f"/media/{river['id']}/audio"
    status, headers, body = request(server, "GET", url)
    assert status == 200 and len(body) == 1024 and headers["Accept-Ranges"] == "bytes"
    status, headers, body = request(server, "GET", url, Range="bytes=10-19")
    assert status == 206 and body == bytes(range(10, 20)) and headers["Content-Range"] == "bytes 10-19/1024"
    status, _, body = request(server, "GET", url, Range="bytes=-4")
    assert status == 206 and body == bytes([252, 253, 254, 255])
    assert request(server, "GET", url, Range="bytes=5000-")[0] == 416
    assert request(server, "GET", f"/media/{river['id']}/secrets")[0] == 404
    # a record naming a file outside its folder does not serve it
    assert request(server, "GET", f"/media/{river['id']}/original")[0] == 404


def test_the_state_is_kept_outside_the_songs_folder(server: tuple[str, int, Library], songs: Path) -> None:
    before = sorted(p.name for p in songs.rglob("*"))
    state = {
        "playlists": [{"id": "pl-1", "name": "Evening", "songs": ["a"]}],
        "favorites": ["a"],
        "tags": {"a": ["party", "road trip"]},
        "junk": 1,
    }
    status, _, _ = request(
        server, "PUT", "/api/state", json.dumps(state).encode(), **{"Content-Type": "application/json"}
    )
    assert status == 200
    saved = json.loads(request(server, "GET", "/api/state")[2])
    assert saved["playlists"][0]["name"] == "Evening" and saved["favorites"] == ["a"] and "junk" not in saved
    assert saved["tags"] == {"a": ["party", "road trip"]}
    assert request(server, "PUT", "/api/state", b"[1, 2]", **{"Content-Type": "application/json"})[0] == 400
    # only the player's own page changes the state: JSON, and from this origin when one is named
    assert request(server, "PUT", "/api/state", json.dumps(state).encode())[0] == 403
    elsewhere = {"Content-Type": "application/json", "Origin": "http://evil.example"}
    assert request(server, "PUT", "/api/state", json.dumps(state).encode(), **elsewhere)[0] == 403
    # reading the folders again too: a form of another site could make the player read thousands of records
    assert request(server, "POST", "/api/rescan")[0] == 403
    assert request(server, "POST", "/api/rescan", b"{}", **{"Content-Type": "application/json"})[0] == 200
    assert sorted(p.name for p in songs.rglob("*")) == before


def test_on_the_loopback_address_only_requests_addressed_to_it(server: tuple[str, int, Library]) -> None:
    assert request(server, "GET", "/api/library", Host="evil.example:80")[0] == 403
    assert request(server, "GET", "/api/library", Host=f"localhost:{server[1]}")[0] == 200


def test_facts_from_a_score_a_prompt_and_subtitles() -> None:
    assert score_facts("X:1\nM:3/4\nQ:1/4=96\nK:Am\nabc|") == {
        "bpm": 96,
        "score_key": "Am",
        "score_meter": "3/4",
    }
    assert score_facts("") == {}
    assert prompt_facts(PROMPT) == {"seeds": {"take": 42}, "writer": "gemma-4-e4b"}
    assert brief_facts(PROMPT)["genre"] == "folk, acoustic"
    assert brief_facts({}) == {}


def test_every_field_of_the_brief_with_where_its_value_came_from() -> None:
    # owner's request 2026-10-17: the song page shows every field, a default marked as one
    song = brief_facts(PROMPT)
    assert song["sources"]["genre"] == "typed" and song["genre"] == "folk, acoustic"
    assert song["sources"]["tempo"] == "default" and song["tempo"] == ""  # the writer chose
    assert (song["mode"], song["sources"]["mode"]) == ("new song every run", "default")
    assert (song["length"], song["sources"]["length"]) == ("standard (about 3:00)", "default")
    assert (song["arrangement"], song["sources"]["arrangement"]) == ("off", "default")
    assert (song["closeness"], song["sources"]["closeness"]) == (70, "default")
    assert song["lines_under_singing"] is False and song["sources"]["template"] == "default"
    cover = brief_facts(
        {
            "1": {
                "class_type": "PlenioCoverBrief",
                "inputs": {
                    "mode": "one cover, stop to review",
                    "vocals": "new lyrics",
                    "vocals.language": "English",
                    "arrangement": "dramatic",
                    "song_flow_closeness": 40,
                },
            }
        }
    )
    assert cover["kind"] == "cover" and cover["sources"]["mode"] == "typed"
    assert (cover["language"], cover["sources"]["language"]) == ("English", "default")
    assert (cover["harmony"], cover["sources"]["harmony"]) == ("new accompaniment", "default")
    assert (cover["arrangement"], cover["closeness"], cover["sources"]["closeness"]) == (
        "dramatic",
        40,
        "typed",
    )
    assert (cover["lyrics_closeness"], cover["sources"]["lyrics_closeness"]) == (0, "default")
    assert cover["length"] == "" and cover["melody"] == ""


def test_the_song_page_knows_the_briefs_defaults() -> None:
    from plenio.player import library as player_library

    root = Path(__file__).resolve().parents[2] / "plenio" / "comfy" / "nodes"
    song = (root / "brief.py").read_text(encoding="utf-8")
    cover = (root / "cover_brief.py").read_text(encoding="utf-8")
    assert f'default="{player_library.SONG_MODE_DEFAULT}"' in song
    assert f'default="{player_library.COVER_MODE_DEFAULT}"' in cover
    for choice, language in player_library.COVER_LANGUAGE_DEFAULTS.items():
        start = cover.index(f'"{choice}"')
        assert re.search(rf'"language",\s*default="{language}"', cover[start : start + 400])
    cues = parse_srt("1\r\n00:01:02,500 --> 00:01:04,000\r\nhello\r\nthere\r\n")
    assert cues == [{"start": 62.5, "end": 64.0, "text": "hello\nthere"}]


def test_the_creativity_and_the_sampling_it_gave() -> None:
    """Owner's request 2026-10-19: the song page shows the creativity and the sampling it gave. A song made
    before the slider: 25 (1.4's 50, on today's scale) and the numbers written in its nodes; a song of today's
    templates: the values its Creativity nodes gave."""
    old = brief_facts(PROMPT)
    assert (old["creativity"], old["sources"]["creativity"]) == (25, "default")
    written = {
        "1": {
            "class_type": "PlenioWriterChoice",
            "inputs": {"model": "gemma4_e4b_it_fp8_scaled.safetensors"},
        },
        "4:501": {"class_type": "PlenioComposePrompt", "inputs": {}},
        "4:504": {
            "class_type": "TextGenerate",
            "inputs": {"prompt": ["4:501", 0], "sampling_mode.temperature": 0.8},
        },
        "4:513": {
            "class_type": "TextGenerate",
            "inputs": {"prompt": ["4:510", 1], "sampling_mode.temperature": 0.7},
        },
        "8:701": {
            "class_type": "YuE2GenerateABC",
            "inputs": {"temperature": 0.7, "top_p": 0.9, "top_k": 30},
            "_meta": {"title": "YuE2 Generate ABC"},
        },
        "14:801": {
            "class_type": "YuE2GenerateMusic",
            "inputs": {"temperature": 1.0, "top_p": 0.95, "top_k": 100},
        },
    }
    # numbers written in the workflow are marked: they did not follow the creativity (owner's report 2026-10-20)
    assert sampling_facts(written, 50) == {
        "writer": {"temperature": 0.8, "fixed": True},
        "plan": {"temperature": 0.7, "top_p": 0.9, "top_k": 30, "fixed": True},
        "take": {"temperature": 1.0, "top_p": 0.95, "top_k": 100, "fixed": True},
    }
    # today's templates: the fields linked to the blocks' Creativity nodes, which take the brief's value
    brief = {
        "class_type": "PlenioSongBrief",
        "inputs": {"genre": "pop", "creativity": 75, "arrangement": "varied"},
    }
    linked = {
        "2": brief,
        "6": {"class_type": "PlenioWriterChoice", "inputs": {"model": "LM Studio · qwen3-14b"}},
        "4:501": {"class_type": "PlenioComposePrompt", "inputs": {"brief": ["2", 0]}},
        "4:530": {
            "class_type": "PlenioCreativity",
            "inputs": {"stage": "writer", "creativity": 50, "brief": ["2", 0]},
        },
        "4:504": {
            "class_type": "TextGenerate",
            "inputs": {"prompt": ["4:501", 0], "sampling_mode.temperature": ["4:530", 0]},
        },
        "4:505": {
            "class_type": "PlenioLocalLLM",
            "inputs": {"prompt": ["4:501", 0], "temperature": ["4:530", 0]},
        },
        "11:1301": {"class_type": "PlenioComposeArrangement", "inputs": {}},
        "11:1330": {
            "class_type": "PlenioCreativity",
            "inputs": {"stage": "arrangement", "creativity": 50, "brief": ["2", 0]},
        },
        "11:1305": {
            "class_type": "PlenioLocalLLM",
            "inputs": {"prompt": ["11:1301", 0], "temperature": ["11:1330", 0]},
        },
        "8:720": {"class_type": "PlenioCreativity", "inputs": {"stage": "plan", "creativity": ["2", 19]}},
        "8:701": {
            "class_type": "YuE2GenerateABC",
            "inputs": {"temperature": ["8:720", 0], "top_p": ["8:720", 1], "top_k": ["8:720", 2]},
        },
        "8:706": {
            "class_type": "YuE2GenerateABC",
            "inputs": {"temperature": 2.0, "top_p": 0.5, "top_k": 1},
            "_meta": {"title": "Second plan (only when the form differs)"},
        },
        "15:806": {"class_type": "PlenioCreativity", "inputs": {"stage": "take", "creativity": 30}},
        "15:801": {
            "class_type": "YuE2GenerateMusic",
            "inputs": {"temperature": ["15:806", 0], "top_p": ["15:806", 1], "top_k": ["15:806", 2]},
        },
    }
    facts = brief_facts(linked, (1, 5, 0))
    assert (facts["creativity"], facts["sources"]["creativity"]) == (75, "typed")
    # a song of 1.4 with the same numbers: its creativity is half on today's scale, its sampling the same as then
    assert brief_facts(linked, (1, 4, 1))["creativity"] == 38
    as_then = sampling_facts(linked, 75, (1, 4, 1))
    assert as_then["plan"] == {"temperature": 0.81, "top_p": 0.925, "top_k": 40}
    assert sampling_facts(linked, facts["creativity"], (1, 5, 0)) == {
        # 75 lies half way between the anchors 50 and 100
        "writer": {"temperature": 1.05},  # the Local LLM branch: the writer model is an LM Studio model
        "arrangement": {"temperature": 0.95},
        "plan": {"temperature": 0.96, "top_p": 0.955, "top_k": 57},  # the second plan is not the plan
        # its own value where no brief is linked: 30, a fifth of the way from 25 to 50
        "take": {"temperature": 1.02, "top_p": 0.954, "top_k": 110},
    }
    # a hand-edited record does not stop the library
    broken = brief_facts(
        {"2": {"class_type": "PlenioSongBrief", "inputs": {"genre": "pop", "creativity": "wild"}}}
    )
    assert broken["creativity"] == 25  # 1.4's 50, on today's scale
    assert (
        sampling_facts({"9": {"class_type": "YuE2GenerateMusic", "inputs": {"temperature": ["7", 0]}}}) == {}
    )


def add_song_with_stems(songs: Path) -> None:
    folder = songs / "plenio"
    files = [
        {"name": "Song.flac", "format": "flac"},
        {"name": "Song (lines).srt", "role": "subtitles", "subtitles": "lines"},
        {"name": "Song-stems/vocals.flac", "role": "stem"},
        {"name": "../outside.flac", "role": "original"},
    ]
    (folder / "Song.plenio.json").write_text(json.dumps({**record("Song"), "files": files}), encoding="utf-8")
    (folder / "Song.flac").write_bytes(b"s" * 50)
    (folder / "Song (lines).srt").write_text("1\n00:00:01,000 --> 00:00:02,000\nla\n", encoding="utf-8")
    (folder / "Song-stems").mkdir()
    (folder / "Song-stems" / "vocals.flac").write_bytes(b"v" * 20)


def song_id_of(address: tuple[str, int, Library], title: str) -> str:
    songs = json.loads(request(address, "GET", "/api/library")[2])["songs"]
    return next(s["id"] for s in songs if s["title"] == title)


def remove(address: tuple[str, int, Library], song: str, action: str, **headers: str) -> int:
    body = json.dumps({"action": action, "confirm": song}).encode()
    return request(
        address, "POST", f"/api/song/{song}/remove", body, **{"Content-Type": "application/json", **headers}
    )[0]


def test_a_retired_song_moves_to_its_folder_and_leaves_the_library(
    server: tuple[str, int, Library], songs: Path
) -> None:
    add_song_with_stems(songs)
    server[2].scan(force=True)
    song = song_id_of(server, "Song")
    detail = json.loads(request(server, "GET", f"/api/song/{song}")[2])
    assert sorted(detail["owned_files"]) == [
        "Song (lines).srt",
        "Song-stems/vocals.flac",
        "Song.flac",
        "Song.plenio.json",
    ]
    assert Path(detail["retire_to"]) == (songs / RETIRED_DIR / "plenio").resolve()
    assert remove(server, song, "retire") == 200
    retired = songs / RETIRED_DIR / "plenio"
    assert (retired / "Song.plenio.json").is_file() and (retired / "Song-stems" / "vocals.flac").is_file()
    assert not (songs / "plenio" / "Song.flac").exists() and not (songs / "plenio" / "Song-stems").exists()
    assert (songs / "outside.flac").read_bytes() == b"secret"  # named by the record, but not in its folder
    titles = [s["title"] for s in json.loads(request(server, "GET", "/api/library")[2])["songs"]]
    assert "Song" not in titles and "River" in titles  # the library does not read the retired songs
    assert request(server, "GET", f"/api/song/{song}")[0] == 404


def test_a_song_retired_again_gets_a_folder_of_its_own(songs: Path) -> None:
    library = Library([songs])
    for _ in range(2):
        add_song_with_stems(songs)
        library.scan(force=True)
        song = next(library.song(s["id"]) for s in library.songs() if s["title"] == "Song")
        assert song is not None
        result = remove_song(song, "retire")
    retired = songs / RETIRED_DIR / "plenio"
    assert (retired / "Song.flac").is_file()
    assert (
        Path(str(result["folder"])).parent == retired.resolve()
        and (Path(str(result["folder"])) / "Song.flac").is_file()
    )


def test_a_deleted_song_is_gone(server: tuple[str, int, Library], songs: Path) -> None:
    song = song_id_of(server, "Old")
    assert remove(server, song, "delete") == 200
    assert not list((songs / "plenio").glob("Old*")) and not (songs / RETIRED_DIR).exists()
    assert (songs / "outside.flac").exists() and (songs / "plenio" / "River.flac").exists()


def test_only_the_players_page_removes_a_song_and_only_the_one_it_names(
    server: tuple[str, int, Library], songs: Path
) -> None:
    song = song_id_of(server, "River")
    path = f"/api/song/{song}/remove"
    body = json.dumps({"action": "delete", "confirm": song}).encode()
    assert request(server, "POST", path, body)[0] == 403  # not JSON: what another site's page could send
    assert remove(server, song, "delete", Origin="http://evil.example") == 403
    other = json.dumps({"action": "delete", "confirm": "0123456789ab"}).encode()
    assert request(server, "POST", path, other, **{"Content-Type": "application/json"})[0] == 400
    assert remove(server, song, "burn") == 400
    assert remove(server, "0123456789ab", "delete") == 404
    assert (songs / "plenio" / "River.flac").exists()


def test_a_second_player_on_a_taken_port_does_not_start(
    server: tuple[str, int, Library], tmp_path: Path
) -> None:
    with pytest.raises(OSError):
        serve(server[2], State(tmp_path / "other.json"), "127.0.0.1", server[1])


def test_the_player_says_who_it_is_and_finds_a_song_by_its_record(
    server: tuple[str, int, Library], songs: Path
) -> None:
    info = json.loads(request(server, "GET", "/api/info")[2])
    assert (
        info["app"] == "plenio-player"
        and info["state"].endswith("state.json")
        and info["retired"] == RETIRED_DIR
    )
    record = songs / "plenio" / "River.plenio.json"
    status, _, body = request(server, "GET", f"/api/find?record={urllib.parse.quote(str(record))}")
    assert status == 200 and json.loads(body)["id"] == song_id_of(server, "River")
    other = urllib.parse.quote(str(songs / "plenio" / "Nope.plenio.json"))
    assert request(server, "GET", f"/api/find?record={other}")[0] == 404


def test_the_player_asks_only_this_computer_for_comfyui() -> None:
    assert comfyui_at("http://example.com:8188") is None
    assert comfyui_at("http://192.168.1.20:8188/") is None
    assert comfyui_at("file:///etc/passwd") is None


def test_stop_the_player_from_its_page(songs: Path, tmp_path: Path) -> None:
    library = Library([songs])
    running = serve(library, State(tmp_path / "state.json"), "127.0.0.1", 0)
    thread = threading.Thread(target=running.serve_forever, daemon=True)
    thread.start()
    address = ("127.0.0.1", running.server_address[1], library)
    assert request(address, "POST", "/api/quit", b"{}")[0] == 403  # not from the page
    assert request(address, "POST", "/api/quit", b"{}", **{"Content-Type": "application/json"})[0] == 200
    thread.join(timeout=5)
    assert not thread.is_alive()
    running.server_close()


def test_a_port_held_by_a_busy_listener_is_not_free() -> None:
    """A player busy reading its songs holds its port without answering at once: not free (owner's report
    2026-10-23 - the launcher took such a port for free and started a second player, which failed)."""
    import socket

    with socket.socket() as busy:
        busy.bind(("127.0.0.1", 0))
        busy.listen(1)
        assert launch._port_free(busy.getsockname()[1]) is False
        free = busy.getsockname()[1]
    assert launch._port_free(free) is True


def test_two_clicks_at_once_start_one_player(
    songs: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    import socket

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    monkeypatch.setattr(launch, "PORTS", range(port, port + 2))
    state = tmp_path / "state"
    answers: list[dict] = []
    clicks = [
        threading.Thread(target=lambda: answers.append(launch.ensure_player(songs, "", state, wait=40)))
        for _ in range(2)
    ]
    for click in clicks:
        click.start()
    for click in clicks:
        click.join()
    try:
        assert len(answers) == 2 and answers[0]["url"] == answers[1]["url"] == f"http://127.0.0.1:{port}/"
        assert sorted(a["started"] for a in answers) == [False, True]
        assert launch.player_at(port + 1) is None  # no second player
    finally:
        quit_request = urllib.request.Request(
            f"http://127.0.0.1:{port}/api/quit",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(quit_request, timeout=5).close()


def test_comfyui_starts_a_player_of_its_own_and_finds_it_again(
    songs: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    import socket

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    monkeypatch.setattr(launch, "PORTS", range(port, port + 1))
    state = tmp_path / "state"
    started = launch.ensure_player(songs, "http://127.0.0.1:8188", state, wait=40)
    try:
        assert started["started"] is True and started["url"] == f"http://127.0.0.1:{port}/"
        info = launch.player_at(port)
        assert info is not None and info["comfyui"] == "http://127.0.0.1:8188"
        assert info["folders"] == [str(songs.resolve())] and info["pid"] != os.getpid()
        again = launch.ensure_player(songs, "", state)
        assert again["started"] is False and again["url"] == started["url"]
        # a player that keeps its state elsewhere is another player: not taken for this state folder
        assert launch.find_player(tmp_path / "another-state") is None
        assert launch.find_player(state) == (port, info)
    finally:
        quit_request = urllib.request.Request(
            f"http://127.0.0.1:{port}/api/quit",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(quit_request, timeout=5).read()
    assert (state / "player.log").exists()


def test_the_listeners_own_visuals_are_read_from_the_state_folder_and_a_copy_never_overwrites(
    server: tuple[str, int, Library], tmp_path: Path
) -> None:
    # owner's request 2026-10-16: Plenio Drop presets of one's own, as files to write and share
    answer = json.loads(request(server, "GET", "/api/visuals")[2])
    assert answer["files"] == [] and Path(answer["folder"]) == tmp_path / "state" / "visuals"
    preset = json.dumps({"name": "Nebula Swirl (my copy)", "base": {"decay": 0.97}})
    body = json.dumps({"name": "Nebula Swirl (my copy)", "text": preset}).encode()
    json_header = {"Content-Type": "application/json"}
    first = json.loads(request(server, "POST", "/api/visuals/copy", body, **json_header)[2])
    second = json.loads(request(server, "POST", "/api/visuals/copy", body, **json_header)[2])
    assert (first["file"], second["file"]) == ("nebula-swirl-my-copy.json", "nebula-swirl-my-copy-2.json")
    folder = tmp_path / "state" / "visuals"
    assert (folder / "README.txt").is_file()
    (folder / "huge.json").write_text(" " * (300 * 1024), encoding="utf-8")
    (folder / "notes.txt").write_text("not a preset", encoding="utf-8")
    files = json.loads(request(server, "GET", "/api/visuals")[2])["files"]
    assert [f["name"] for f in files] == ["nebula-swirl-my-copy-2.json", "nebula-swirl-my-copy.json"]
    assert json.loads(files[0]["text"])["base"] == {"decay": 0.97} and files[0]["mtime"] > 0
    # only from the player's page, and only JSON presets
    assert request(server, "POST", "/api/visuals/copy", body)[0] == 403
    assert (
        request(server, "POST", "/api/visuals/copy", body, Origin="http://evil.example", **json_header)[0]
        == 403
    )
    bad = json.dumps({"name": "x", "text": "{not json"}).encode()
    assert request(server, "POST", "/api/visuals/copy", bad, **json_header)[0] == 400
    assert len(list(folder.glob("*.json"))) == 3


def test_a_new_song_is_new_once_also_when_its_file_time_runs_ahead_of_the_clock(
    songs: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Windows CI (2026-10-19): a file written just before a scan carried a time a little after the scan's
    coarse clock, so it came again as new from the answer's "now". A file far in the future does not move "now"
    (it would hide the songs made until the clock caught up)."""
    import os

    from plenio.player import library as library_module

    folder = songs / "plenio"
    library = Library([songs])
    library.scan(force=True)
    (folder / "Fresh.plenio.json").write_text(json.dumps(record("Fresh")), encoding="utf-8")
    written = (folder / "Fresh.plenio.json").stat().st_mtime
    real = library_module.time.time
    monkeypatch.setattr(library_module.time, "time", lambda: written - 0.01)  # a coarse clock, a tick behind
    library.scan(force=True)
    assert library.scan_started >= written
    assert library.newer(library.scan_started) == []
    # a record from a clock an hour ahead: "now" stays near the real one
    later = folder / "Later.plenio.json"
    later.write_text(json.dumps(record("Later")), encoding="utf-8")
    os.utime(later, (real() + 3600, real() + 3600))
    monkeypatch.setattr(library_module.time, "time", real)
    library.scan(force=True)
    assert library.scan_started < real() + 5


def test_live_play_hears_of_the_songs_made_while_it_plays(
    server: tuple[str, int, Library], songs: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # owner's request 2026-10-16: a song ComfyUI exports during a party joins the live playlist
    from plenio.player import server as server_module

    monkeypatch.setattr(server_module, "NEW_SONGS_EVERY", 0.0)
    start = json.loads(request(server, "GET", "/api/new")[2])
    assert start["songs"] == [] and start["now"] > 0
    assert json.loads(request(server, "GET", f"/api/new?since={start['now']}")[2])["songs"] == []
    (songs / "plenio" / "Fresh.flac").write_bytes(b"x" * 100)
    (songs / "plenio" / "Fresh.plenio.json").write_text(json.dumps(record("Fresh")), encoding="utf-8")
    later = json.loads(request(server, "GET", f"/api/new?since={start['now']}")[2])
    assert [s["title"] for s in later["songs"]] == ["Fresh"] and later["now"] >= start["now"]
    # asked again from the new "now": nothing new
    assert json.loads(request(server, "GET", f"/api/new?since={later['now']}")[2])["songs"] == []


def test_a_song_says_how_it_was_made_also_an_older_one() -> None:
    """Owner's request 2026-10-28: the details show when, how long, on what and with which lyrics fidelity; a record
    of 1.3 has no ``made`` - its fidelity comes from its prompt (the brief's label) or its Best Take."""
    from plenio.player.library import made_facts

    made = {
        "started": "2026-10-28T14:00:36+0100",
        "seconds": 273.2,
        "on": {"device": "gpu"},
        "lyrics_fidelity": "high",
    }
    assert made_facts({"made": made}) == made
    older = {"prompt": {"7": {"inputs": {"vocals.fidelity": "highest - best of 3 takes"}}}}
    assert made_facts(older) == {"lyrics_fidelity": "highest"}
    best = {"reports": [{"kind": "best_take", "data": {"level": "high"}}]}
    assert made_facts(best) == {"lyrics_fidelity": "high"}
    assert made_facts({}) == {}


def test_a_songs_page_shows_its_full_lyrics_and_links_the_players_files(
    server: tuple[str, int, Library],
) -> None:
    """GitHub issue 2026-10-28: the full lyrics to copy, on the song's page (``song_page.py``) - for any song of the
    library, also one exported before Export Release wrote the page."""
    _host, _port, library = server
    river = next(s for s in library.songs() if s["title"] == "River")
    status, headers, body = request(server, "GET", f"/page/{river['id']}")
    page = body.decode("utf-8")
    assert status == 200 and headers["Content-Type"].startswith("text/html")
    assert "<h1>River</h1>" in page and 'id="lyrics"' in page
    assert "walking down the river side" in page
    assert f'src="/media/{river["id"]}/audio_flac"' in page  # the player's own files
    assert "../outside.flac" not in page  # a file outside the record's folder is not the song's
    assert request(server, "GET", "/page/000000000000")[0] == 404
