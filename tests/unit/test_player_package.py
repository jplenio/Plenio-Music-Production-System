"""Songs shared as a player (owner's request 2026-10-16): one HTML file with the player's page and the songs
chosen, which plays by itself - each song as an MP3 of at most 192 kbit/s, never its FLAC, and nothing of
this computer: no release record, no paths. Laid out to open at any size (owner's request 2026-10-18: a 2 GB
file on a phone): the list and the player first, then the songs in small pieces the page turns into files;
made in the background, in turn, and stoppable."""

from __future__ import annotations

import base64
import http.client
import io
import json
import re
import threading
import time
from collections.abc import Iterator
from fractions import Fraction
from pathlib import Path

import pytest

from plenio.player.library import Library
from plenio.player.package import build
from plenio.player.server import State, serve

av = pytest.importorskip("av")
np = pytest.importorskip("numpy")


def flac(path: Path, seconds: float = 4.0) -> None:
    rate = 44100
    with av.open(str(path), "w") as container:
        stream = container.add_stream("flac", rate=rate)
        stream.layout = "stereo"
        samples = (0.2 * np.sin(2 * np.pi * 330 * np.arange(int(rate * seconds)) / rate)).astype(np.float32)
        frame = av.AudioFrame.from_ndarray(np.stack([samples, samples]), format="fltp", layout="stereo")
        frame.sample_rate = rate
        frame.pts = 0
        frame.time_base = Fraction(1, rate)
        for packet in [*stream.encode(frame), *stream.encode(None)]:
            container.mux(packet)


@pytest.fixture
def songs(tmp_path: Path) -> Path:
    folder = tmp_path / "output" / "plenio"
    folder.mkdir(parents=True)
    for title in ("First", "Second"):
        flac(folder / f"{title}.flac")
        record = {
            "schema": "plenio.release/1",
            "title": title,
            "files": [{"name": f"{title}.flac", "format": "flac"}],
            "documents": {"lyrics": {"text": "la la la"}, "title": {"text": title}},
            "workflow": {"secret": "the workflow stays home"},
        }
        (folder / f"{title}.plenio.json").write_text(json.dumps(record), encoding="utf-8")
    try:
        from PIL import Image

        Image.new("RGB", (900, 900), (200, 40, 90)).save(folder / "First.jpg")
    except ImportError:
        pass
    (folder / "First.pdf").write_bytes(b"%PDF-1.4 sheet music")
    return tmp_path / "output"


KINDS = {"audio": "a", "cover": "c", "pdf": "p"}
PIECE_SCRIPT = re.compile(
    r'<script type="text/plain">([A-Za-z0-9+/=]*)</script><script>__plenio\.t\("(\w)","([0-9a-f]+)","([^"]+)",([01])\)</script>'
)


def blocks(html: str, kind: str) -> dict[str, bytes]:
    """The files of a kind, put together from their pieces (as the page's loader does)."""
    files: dict[str, bytes] = {}
    for data, short, key, _mime, _last in PIECE_SCRIPT.findall(html):
        if short == KINDS[kind]:
            files[key] = files.get(key, b"") + base64.b64decode(data)
    return files


def pages(html: str) -> dict[str, dict]:
    """Each song's page and waveform, as the loader gets them."""
    found = re.findall(r'<script>__plenio\.d\("([0-9a-f]+)",("(?:[^"\\]|\\.)*")\)</script>', html)
    return {key: json.loads(json.loads(text)) for key, text in found}


def test_a_shared_player_has_the_songs_as_mp3_and_nothing_of_this_computer(
    songs: Path, tmp_path: Path
) -> None:
    library = Library([songs])
    library.scan(force=True)
    ids = [s["id"] for s in library.songs()]
    seen: list[tuple[int, int]] = []
    [path] = build(
        library,
        ids,
        {"title": "Party <Mix>", "bitrate": 128, "pdf": True, "settings": {"lyrics": {"effect": "neon"}},
         "playlists": [{"name": "Both", "songs": ids}, {"name": "Elsewhere", "songs": ["0123456789ab"]}],
         "tags": {ids[0]: ["party", "", 7], "0123456789ab": ["elsewhere"]}},
        tmp_path / "state",
        lambda done, total, stage="": seen.append((done, total)),
    )  # fmt: skip
    assert path.name == "Party Mix.html" and seen[-1] == (2, 2)
    html = path.read_text(encoding="utf-8")
    assert "<title>Party &lt;Mix&gt; - Plenio Player</title>" in html
    # the page's own code inside, no file it would have to load; the player starts before the songs' pieces
    assert '<script type="module" async>' in html and 'src="./assets/' not in html and "<style>" in html
    order = [
        html.index(m)
        for m in (
            'id="plenio-portable"',
            "window.__plenio",
            '<script type="module" async>',
            "__plenio.d(",
            "__plenio.t(",
            "__plenio.end()",
        )
    ]
    assert order == sorted(order)
    data = json.loads(
        re.search(r'<script type="application/json" id="plenio-portable">(.*?)</script>', html, re.S).group(1)
    )
    assert data["format"] == "plenio.portable/2" and data["bitrate"] == 128
    assert data["files"] == {"audio": 2, "cover": len(blocks(html, "cover")), "pdf": 1}
    assert sorted(s["title"] for s in data["songs"]) == ["First", "Second"]
    assert data["settings"] == {"lyrics": {"effect": "neon"}}
    assert data["playlists"] == [{"name": "Both", "songs": ids}]
    # the tags of the songs packed, nothing else
    assert data["tags"] == {ids[0]: ["party"]}
    # MP3 only, at the bit rate asked for
    audio = blocks(html, "audio")
    assert sorted(audio) == sorted(ids)
    for sound in audio.values():
        with av.open(io.BytesIO(sound)) as container:
            stream = container.streams.audio[0]
            assert container.format.name == "mp3" and stream.codec_context.name in ("mp3", "mp3float")
            assert stream.codec_context.bit_rate <= 192_000
            assert 3.5 < container.duration / 1e6 < 4.5
        assert b"fLaC" not in sound[:64]
    first = next(s for s in data["songs"] if s["title"] == "First")
    assert first["has"]["pdf"] and blocks(html, "pdf")[first["id"]].startswith(b"%PDF")
    if first["has"]["cover"]:
        cover = blocks(html, "cover")[first["id"]]
        from PIL import Image

        assert max(Image.open(io.BytesIO(cover)).size) <= 512
    # nothing of this computer: no paths, no records, no workflow
    assert str(songs) not in html and str(songs).replace("\\", "/") not in html
    assert "the workflow stays home" not in html
    packed = json.dumps(data) + json.dumps(pages(html))
    assert ".plenio.json" not in packed and "workflow" not in packed
    page = pages(html)[first["id"]]
    detail = page["detail"]
    assert (
        detail["record_path"] == ""
        and detail["owned_files"] == []
        and detail["files"] == {"audio": "First.mp3", "pdf": "First.pdf"}
    )
    assert sorted(pages(html)) == sorted(ids) and isinstance(page["peaks"], list)
    # no "<" inside the JSON: it could close or bend the script element
    assert "<" not in re.search(r'id="plenio-portable">(.*?)</script>', html, re.S).group(1)


def test_a_long_song_goes_in_pieces_and_the_file_is_written_as_it_is_made(
    songs: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    import plenio.player.package as package

    monkeypatch.setattr(package, "PIECE", 4096)
    library = Library([songs])
    library.scan(force=True)
    ids = [s["id"] for s in library.songs()]
    [path] = build(library, ids, {"title": "Pieces", "bitrate": 192}, tmp_path / "state")
    html = path.read_text(encoding="utf-8")
    pieces = [m for m in PIECE_SCRIPT.findall(html) if m[1] == "a"]
    assert len(pieces) > 2 * len(ids)
    # each file's last piece says so, once
    assert sum(1 for m in pieces if m[4] == "1") == len(ids)
    assert all(len(m[0]) <= 4 * 4096 // 3 + 4 for m in pieces)
    assert not list((tmp_path / "state" / "packages").glob("*.part"))


def test_no_songs_or_a_bit_rate_above_192_make_no_player(songs: Path, tmp_path: Path) -> None:
    library = Library([songs])
    library.scan(force=True)
    with pytest.raises(ValueError):
        build(library, [], {"bitrate": 192}, tmp_path / "state")
    with pytest.raises(ValueError):
        build(library, [library.songs()[0]["id"]], {"bitrate": 320}, tmp_path / "state")


@pytest.mark.parametrize("ordered", [True, False])
def test_the_songs_go_in_the_order_given_each_once(songs: Path, tmp_path: Path, ordered: bool) -> None:
    library = Library([songs])
    library.scan(force=True)
    by_title = {s["title"]: s["id"] for s in library.songs()}
    wanted = [by_title["Second"], by_title["First"]]
    [path] = build(
        library, [*wanted, by_title["Second"]], {"bitrate": 128, "ordered": ordered}, tmp_path / "state"
    )
    html = path.read_text(encoding="utf-8")
    data = json.loads(
        re.search(r'<script type="application/json" id="plenio-portable">(.*?)</script>', html, re.S).group(1)
    )
    # an album's running order: the list, and the sound in the file, as given
    assert [s["id"] for s in data["songs"]] == wanted and data["ordered"] is ordered
    sound = [key for _d, short, key, _m, _l in PIECE_SCRIPT.findall(html) if short == "a"]
    assert list(dict.fromkeys(sound)) == wanted


@pytest.fixture
def server(songs: Path, tmp_path: Path) -> Iterator[tuple[str, int, Library, Path]]:
    library = Library([songs])
    library.scan(force=True)
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield "127.0.0.1", running.server_address[1], library, tmp_path / "state"
    running.shutdown()
    running.server_close()


def call(address, method: str, path: str, body: object = None, **headers: str):
    connection = http.client.HTTPConnection(address[0], address[1], timeout=60)
    data = json.dumps(body).encode() if body is not None else None
    if body is not None:
        headers.setdefault("Content-Type", "application/json")
    connection.request(method, path, body=data, headers=headers)
    answer = connection.getresponse()
    payload = answer.read()
    response_headers = dict(answer.getheaders())
    connection.close()
    return answer.status, json.loads(payload) if payload[:1] in (b"{", b"[") else payload, response_headers


def test_the_player_makes_a_shared_player_on_its_pages_request(
    server: tuple[str, int, Library, Path],
) -> None:
    ids = [s["id"] for s in server[2].songs()]
    request = {"songs": ids, "title": "Share", "bitrate": 160, "pdf": False}
    assert call(server, "POST", "/api/package", body=None)[0] == 403  # not JSON
    assert call(server, "POST", "/api/package", request, Origin="http://evil.example")[0] == 403
    assert call(server, "POST", "/api/package", {**request, "bitrate": 320})[0] == 400
    assert call(server, "POST", "/api/package", {**request, "songs": []})[0] == 400
    status, answer, _ = call(server, "POST", "/api/package", request)
    assert status == 200
    for _ in range(300):
        status, state, _ = call(server, "GET", f"/api/package/{answer['job']}")
        if state["state"] not in ("waiting", "working"):
            break
        time.sleep(0.1)
    assert state["state"] == "done" and state["file"] == "Share.html" and state["size"] > 10_000
    assert state["title"] == "Share" and "run" not in state
    listed = call(server, "GET", "/api/packages")[1]["files"]
    assert [f["name"] for f in listed] == ["Share.html"]
    jobs = call(server, "GET", "/api/package-jobs")[1]["jobs"]
    assert [j["job"] for j in jobs] == [answer["job"]]
    assert call(server, "POST", "/api/package-jobs/clear", {})[1]["jobs"] == []
    assert call(server, "POST", f"/api/package/{answer['job']}/cancel", {})[0] == 404
    status, body, headers = call(server, "GET", "/packages/Share.html?download=1")
    assert (
        status == 200
        and body.startswith(b"<!doctype html>")
        and "attachment" in headers["Content-Disposition"]
    )
    assert call(server, "GET", "/packages/..%2Fstate.json")[0] == 404
    assert call(server, "GET", "/api/package/ffffffffffffffff")[0] == 404


def test_shared_players_are_made_in_turn_and_one_can_be_stopped(songs: Path, tmp_path: Path) -> None:
    """One at a time, in the order asked; a waiting one stopped never starts, the one at work stops and leaves
    no file (owner's request 2026-10-18: in the background, a queue, stoppable)."""
    import plenio.player.package as package

    library = Library([songs])
    library.scan(force=True)
    ids = [s["id"] for s in library.songs()]
    gate = threading.Event()
    real = package.encode_mp3

    def slow(audio, bitrate, tags):  # the first player waits here until the test lets it go
        gate.wait(10)
        return real(audio, bitrate, tags)

    jobs = package.PackageJobs()
    package.encode_mp3 = slow
    try:
        first = jobs.start(library, ids, {"title": "First"}, tmp_path / "state")
        second = jobs.start(library, ids, {"title": "Second"}, tmp_path / "state")
        third = jobs.start(library, ids, {"title": "Third"}, tmp_path / "state")
        for _ in range(100):
            if jobs.status(first)["state"] == "working":
                break
            time.sleep(0.05)
        assert [jobs.status(j)["state"] for j in (first, second, third)] == ["working", "waiting", "waiting"]
        assert jobs.cancel(second) and jobs.status(second)["state"] == "stopped"
        assert jobs.cancel(first)
        gate.set()
        for _ in range(300):
            if jobs.status(third)["state"] not in ("waiting", "working"):
                break
            time.sleep(0.1)
    finally:
        package.encode_mp3 = real
        gate.set()
    assert jobs.status(first)["state"] == "stopped"
    assert jobs.status(third)["state"] == "done" and jobs.status(third)["file"] == "Third.html"
    made = sorted(p.name for p in (tmp_path / "state" / "packages").iterdir())
    assert made == ["Third.html"]
    assert [j["title"] for j in jobs.listing()] == ["Third", "Second", "First"]
    assert not jobs.cancel("ffffffffffffffff")


def test_a_large_share_in_parts_each_a_whole_player(
    songs: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Parts for phones (owner's request 2026-10-18: a large share on a phone): files of at most the size
    chosen, each a whole player of its songs, all with one id (the listener's favourites go with every part)."""
    import plenio.player.package as package

    library = Library([songs])
    library.scan(force=True)
    ids = [s["id"] for s in library.songs()]
    # parts too small for either song: each one a part of its own
    real = package._parts
    monkeypatch.setattr(
        package, "_parts", lambda songs, sizes, budget: real(songs, sizes, 1 if budget > 0 else 0)
    )
    options = {"title": "Big", "bitrate": 128, "part_mb": 250, "playlists": [{"name": "All", "songs": ids}]}
    paths = build(library, ids, options, tmp_path / "state")
    assert [p.name for p in paths] == ["Big (1 of 2).html", "Big (2 of 2).html"]
    datas = []
    for path in paths:
        html = path.read_text(encoding="utf-8")
        assert "<title>Big (" in html
        data = json.loads(re.search(r'id="plenio-portable">(.*?)</script>', html, re.S).group(1))
        datas.append(data)
        assert len(data["songs"]) == 1
        assert sorted(blocks(html, "audio")) == [data["songs"][0]["id"]]
        assert data["playlists"] == [{"name": "All", "songs": [data["songs"][0]["id"]]}]
    assert datas[0]["id"] == datas[1]["id"]
    assert datas[1]["part"] == {"index": 2, "count": 2, "files": ["Big (1 of 2).html", "Big (2 of 2).html"]}
    assert sorted(d["songs"][0]["id"] for d in datas) == sorted(ids)
    # one file when it fits, and only the sizes offered
    assert build(library, ids, {"title": "Small", "part_mb": 0}, tmp_path / "state")[0].name == "Small.html"
    with pytest.raises(ValueError):
        build(library, ids, {"part_mb": 3}, tmp_path / "state")
