"""A song as a video (owner's request 2026-10-16): the player's page sends the H.264 stream it encoded, the
server puts it together with the song's sound (the part chosen, faded where cut) into an MP4 in its videos
folder - only for the player's own page, and nothing outside that folder is served."""

from __future__ import annotations

import http.client
import json
import threading
from collections.abc import Iterator
from fractions import Fraction
from pathlib import Path

import pytest

from plenio.player.library import Library
from plenio.player.server import State, serve

av = pytest.importorskip("av")
np = pytest.importorskip("numpy")
FPS, W, H = 30, 320, 180


def song_audio(path: Path, seconds: float = 6.0) -> None:
    rate = 48000
    with av.open(str(path), "w") as container:
        stream = container.add_stream("flac", rate=rate)
        stream.layout = "stereo"
        samples = (0.3 * np.sin(2 * np.pi * 220 * np.arange(int(rate * seconds)) / rate)).astype(np.float32)
        frame = av.AudioFrame.from_ndarray(np.stack([samples, samples]), format="fltp", layout="stereo")
        frame.sample_rate = rate
        frame.pts = 0
        frame.time_base = Fraction(1, rate)
        for packet in [*stream.encode(frame), *stream.encode(None)]:
            container.mux(packet)


def h264_stream(frames: int) -> bytes:
    """An Annex B H.264 stream of ``frames`` frames, as the page's encoder writes it."""
    codec = next((c for c in ("libx264", "libopenh264", "h264_mf") if c in av.codecs_available), None)
    if codec is None:
        pytest.skip("no H.264 encoder in this PyAV")
    import io

    buffer = io.BytesIO()
    with av.open(buffer, "w", format="h264") as container:
        stream = container.add_stream(codec, rate=FPS)
        stream.width, stream.height, stream.pix_fmt = W, H, "yuv420p"
        if codec == "libx264":
            stream.options = {"bf": "0", "g": str(FPS * 2)}
        for k in range(frames):
            image = np.full((H, W, 3), k * 3 % 255, np.uint8)
            frame = av.VideoFrame.from_ndarray(image, format="rgb24")
            frame.pts = k
            for packet in stream.encode(frame):
                container.mux(packet)
        for packet in stream.encode(None):
            container.mux(packet)
    return buffer.getvalue()


@pytest.fixture
def server(tmp_path: Path) -> Iterator[tuple[str, int, str, Path]]:
    folder = tmp_path / "output" / "plenio"
    folder.mkdir(parents=True)
    song_audio(folder / "Tune.flac")
    record = {
        "schema": "plenio.release/1",
        "title": "Tune",
        "files": [{"name": "Tune.flac", "format": "flac"}],
    }
    (folder / "Tune.plenio.json").write_text(json.dumps(record), encoding="utf-8")
    library = Library([tmp_path / "output"])
    library.scan(force=True)
    song = library.songs()[0]["id"]
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield "127.0.0.1", running.server_address[1], song, tmp_path / "state" / "videos"
    running.shutdown()
    running.server_close()


def call(address, method: str, path: str, body: object = None, raw: bytes | None = None, **headers: str):
    connection = http.client.HTTPConnection(address[0], address[1], timeout=60)
    data = raw if raw is not None else json.dumps(body).encode() if body is not None else None
    if body is not None:
        headers.setdefault("Content-Type", "application/json")
    connection.request(method, path, body=data, headers=headers)
    answer = connection.getresponse()
    payload = answer.read()
    response_headers = dict(answer.getheaders())
    connection.close()
    parsed = json.loads(payload) if payload[:1] in (b"{", b"[") else payload
    return answer.status, parsed, response_headers


def test_a_song_becomes_an_mp4_with_its_sound(server: tuple[str, int, str, Path]) -> None:
    start = {
        "song": server[2],
        "take": "master",
        "start": 1.0,
        "length": 3.0,
        "fps": FPS,
        "width": W,
        "height": H,
    }
    status, answer, _ = call(server, "POST", "/api/video", start)
    assert status == 200
    job = answer["job"]
    stream = h264_stream(3 * FPS)
    half = len(stream) // 2
    binary = {"Content-Type": "application/octet-stream", "X-Plenio-Player": "1"}
    assert call(server, "POST", f"/api/video/{job}/data", raw=stream[:half], **binary)[0] == 200
    assert call(server, "POST", f"/api/video/{job}/data", raw=stream[half:], **binary)[1]["bytes"] == len(
        stream
    )
    status, made, _ = call(server, "POST", f"/api/video/{job}/finish", {"frames": 3 * FPS})
    assert status == 200 and made["file"] == f"Tune ({W}x{H}).mp4"
    path = server[3] / made["file"]
    with av.open(str(path)) as video:
        streams = {s.type: s for s in video.streams}
        assert streams["video"].codec_context.name == "h264" and streams["audio"].codec_context.name == "aac"
        assert sum(1 for _ in video.decode(video=0)) == 3 * FPS
        assert float(streams["video"].duration * streams["video"].time_base) == pytest.approx(3.0, abs=0.05)
        assert float(streams["audio"].duration * streams["audio"].time_base) == pytest.approx(3.0, abs=0.1)
        video.seek(0)
        sound = np.concatenate([f.to_ndarray()[0] for f in video.decode(audio=0)])
    # cut inside the song: faded in at the start and out at the end, full in the middle
    rms = lambda part: float(np.sqrt(np.mean(part**2)))  # noqa: E731
    n = len(sound)
    assert rms(sound[: n // 60]) < rms(sound[n // 2 - 2000 : n // 2 + 2000]) / 2
    assert rms(sound[-n // 60 :]) < rms(sound[n // 2 - 2000 : n // 2 + 2000]) / 2
    listed = call(server, "GET", "/api/videos")[1]["files"]
    assert [v["name"] for v in listed] == [made["file"]]
    status, body, headers = call(server, "GET", f"/videos/{made['file'].replace(' ', '%20')}?download=1")
    assert status == 200 and body[4:8] == b"ftyp" and "attachment" in headers["Content-Disposition"]
    assert not (server[3] / ".jobs" / job).exists()
    # the same again: a name of its own
    job2 = call(server, "POST", "/api/video", start)[1]["job"]
    call(server, "POST", f"/api/video/{job2}/data", raw=stream, **binary)
    assert (
        call(server, "POST", f"/api/video/{job2}/finish", {"frames": 0})[1]["file"] == f"Tune ({W}x{H}) 2.mp4"
    )


def test_the_sound_has_the_quality_chosen(server: tuple[str, int, str, Path]) -> None:
    """More quality settings (owner's request 2026-10-29): the AAC sound at 128 to 320 kbit/s; other rates refused."""
    start = {"song": server[2], "start": 0, "length": 5.0, "fps": FPS, "width": W, "height": H}
    assert call(server, "POST", "/api/video", {**start, "audio": 64})[0] == 400
    assert call(server, "POST", "/api/video", {**start, "audio": "320"})[0] == 400
    binary = {"Content-Type": "application/octet-stream", "X-Plenio-Player": "1"}
    stream = h264_stream(5 * FPS)
    rates = {}
    for kbits in (128, 320):
        job = call(server, "POST", "/api/video", {**start, "audio": kbits})[1]["job"]
        call(server, "POST", f"/api/video/{job}/data", raw=stream, **binary)
        made = call(server, "POST", f"/api/video/{job}/finish", {"frames": 5 * FPS})[1]
        with av.open(str(server[3] / made["file"])) as video:
            rates[kbits] = video.streams.audio[0].codec_context.bit_rate
    # the rate the MP4 says it has: FFmpeg's AAC needs less than 320 kbit/s for a test tone, but the higher setting
    # gives the sound clearly more
    assert rates[128] == pytest.approx(128_000, rel=0.05) and rates[320] > rates[128] * 1.5


def test_only_the_players_page_makes_videos_and_nothing_else_is_served(
    server: tuple[str, int, str, Path],
) -> None:
    start = {"song": server[2], "start": 0, "length": 2, "fps": FPS, "width": W, "height": H}
    assert call(server, "POST", "/api/video", raw=json.dumps(start).encode())[0] == 403  # not JSON
    assert call(server, "POST", "/api/video", start, Origin="http://evil.example")[0] == 403
    assert call(server, "POST", "/api/video", {**start, "song": "0123456789ab"})[0] == 404
    assert call(server, "POST", "/api/video", {**start, "fps": 7})[0] == 400
    assert call(server, "POST", "/api/video", {**start, "width": 99999})[0] == 400
    job = call(server, "POST", "/api/video", start)[1]["job"]
    data = b"\x00\x00\x00\x01" + b"x" * 100
    assert (
        call(
            server, "POST", f"/api/video/{job}/data", raw=data, **{"Content-Type": "application/octet-stream"}
        )[0]
        == 403
    )
    evil = {
        "Content-Type": "application/octet-stream",
        "X-Plenio-Player": "1",
        "Origin": "http://evil.example",
    }
    assert call(server, "POST", f"/api/video/{job}/data", raw=data, **evil)[0] == 403
    assert (
        call(server, "POST", "/api/video/ffffffffffffffff/data", raw=data, **{"X-Plenio-Player": "1"})[0]
        == 404
    )
    assert call(server, "POST", f"/api/video/{job}/cancel", {})[0] == 200
    assert not (server[3] / ".jobs" / job).exists()
    (server[3].parent / "secret.mp4").write_bytes(b"not for the page")
    assert call(server, "GET", "/videos/..%2Fsecret.mp4")[0] == 404
    assert call(server, "GET", "/videos/../state.json")[0] == 404


def test_the_videos_folder_is_shown_and_the_answer_says_whether_it_opened(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # "Open the folder" answers the folder and whether a file manager opened it (tests/unit/test_addons.py has
    # the file manager itself); without the Studio add-on the page gets the path and a sentence instead
    from plenio.core import features
    from plenio.player import visuals

    shown: list[Path] = []
    folder = tmp_path / "my videos"

    class FileManager:
        show_folder = staticmethod(shown.append)

    monkeypatch.setattr(features, "load", lambda addon: FileManager)
    assert visuals.show_folder(folder) == {"folder": str(folder), "opened": True}
    assert shown == [folder] and folder.is_dir()
    assert not (folder / "README.txt").exists()  # the visuals' README belongs to the visuals folder only
    monkeypatch.setenv(features.SWITCH, "0")
    answer = visuals.show_folder(folder)
    assert answer["folder"] == str(folder) and answer["opened"] is False and "copy it" in str(answer["hint"])
    assert shown == [folder]  # nothing was started
