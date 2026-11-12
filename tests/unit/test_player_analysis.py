"""The analysis track (phase 7.3): beats of a click track within 20 ms, one drop where a quiet song gets loud, beats
from measured bars, the cache, the route."""

from __future__ import annotations

import numpy as np
import pytest

from plenio.player import analysis

RATE = analysis.DECODE_RATE


def kicks(seconds: float, bpm: float, start: float = 0.25, gain: float = 1.0) -> np.ndarray:
    """A kick drum at ``bpm``: a 60 Hz burst falling off in 80 ms on every beat."""
    out = np.zeros(int(seconds * RATE), dtype=np.float32)
    n = int(0.12 * RATE)
    t = np.arange(n) / RATE
    hit = (np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.04)).astype(np.float32)
    beat = 60.0 / bpm
    at = start
    while at < seconds - 0.2:
        i = int(at * RATE)
        out[i : i + n] += gain * hit[: len(out) - i]
        at += beat
    return out


def test_a_click_track_at_120_bpm_has_its_beats_within_20_ms() -> None:
    track = analysis.analyse(kicks(30.0, 120.0))
    beats = np.array(track["beats"])
    truth = np.arange(0.25, 29.8, 0.5)
    assert track["source"] == "audio" and abs(track["bpm"] - 120) < 1.5
    matched = [float(np.min(np.abs(beats - t))) for t in truth[2:-2]]
    assert max(matched) <= 0.02, max(matched)
    assert track["confidence"] > 0.3
    assert len(track["downbeats"]) == pytest.approx(len(beats) / 4, abs=1)


def test_a_quiet_then_loud_song_has_one_drop_at_the_jump() -> None:
    quiet = kicks(24.0, 120.0, gain=0.08)
    loud = kicks(24.0, 120.0, start=0.25, gain=1.0)
    bass = (0.6 * np.sin(2 * np.pi * 55 * np.arange(len(loud)) / RATE)).astype(np.float32)
    song = np.concatenate([quiet, loud + bass])
    track = analysis.analyse(song)
    drops = [p for p in track["peaks"] if p["kind"] == "drop"]
    assert len(drops) == 1, drops
    assert abs(drops[0]["t"] - 24.0) <= 2.1  # on the downbeat of the jump (a bar is 2 s)
    assert len(track["sections"]) >= 2
    assert track["sections"][-1]["energy"] > track["sections"][0]["energy"]


def test_measured_bars_give_the_beats() -> None:
    bars = {"audio": [1.0, 3.0, 5.0], "meters": [[4, 4], [3, 4], [4, 4]]}
    beats, downbeats = analysis.from_bars(bars)  # type: ignore[misc]
    assert downbeats == [1.0, 3.0, 5.0]
    assert beats[:5] == [1.0, 1.5, 2.0, 2.5, 3.0] and beats[5] == pytest.approx(3.667, abs=1e-3)
    track = analysis.analyse(kicks(8.0, 120.0), bars=bars)
    assert track["source"] == "bars" and track["confidence"] == 1.0


def test_silence_and_shapes() -> None:
    track = analysis.analyse(np.zeros(RATE * 5, dtype=np.float32))
    assert track["schema"] == analysis.SCHEMA and track["confidence"] == 0.0
    import base64

    assert len(base64.b64decode(track["bands"]["low"])) == pytest.approx(5 * analysis.RATE, abs=2)


def test_the_route_answers_a_songs_track_and_keeps_it(tmp_path) -> None:  # noqa: ANN001
    import http.client
    import json
    import threading
    import wave

    from plenio.player.library import Library
    from plenio.player.server import State, serve

    folder = tmp_path / "songs"
    folder.mkdir()
    with wave.open(str(folder / "Beat.wav"), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes((kicks(12.0, 120.0) * 20000).astype("<i2").tobytes())
    record = {"schema": "plenio.record/1", "title": "Beat", "created": "2026-11-12T10:00:00Z",
              "audio": {"seconds": 12.0}, "files": [{"name": "Beat.wav", "format": "wav"}]}  # fmt: skip
    (folder / "Beat.plenio.json").write_text(json.dumps(record), encoding="utf-8")
    library = Library([folder], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    port = running.server_address[1]
    try:
        song = library.songs()[0]["id"]
        for _ in range(2):
            connection = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
            connection.request("GET", f"/api/analysis/{song}", headers={"Host": f"127.0.0.1:{port}"})
            answer = connection.getresponse()
            data = json.loads(answer.read())
            connection.close()
            assert answer.status == 200 and data["schema"] == analysis.SCHEMA and abs(data["bpm"] - 120) < 2
        assert list((tmp_path / "state" / "cache" / "analysis").glob("analysis-*.json"))
    finally:
        running.shutdown()
        running.server_close()
