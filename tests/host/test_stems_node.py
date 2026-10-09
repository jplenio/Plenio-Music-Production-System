"""Separate Stems and Stem Mixer in a real ComfyUI server with a fake separator (plan §6, Phase 11B O7).

Real separation (BS-RoFormer) and its listening check run on the owner's machine (L2).
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from harness import ComfyServer, Log
from plenio.core.release import read_tags

pytestmark = pytest.mark.host


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def stems_prompt(mix: dict[str, Any] | None = None, kind: str = "separation") -> dict[str, Any]:
    return {
        "1": {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": 2.0, "variant": 2}},
        "2": {"class_type": "PlenioTestFakeAudioModel", "inputs": {"kind": kind}},
        "3": {"class_type": "PlenioSeparateStems", "inputs": {"audio": ["1", 0], "model": ["2", 0]}},
        "4": {
            "class_type": "PlenioStemMixer",
            "inputs": {
                "stems": ["3", 0],
                "mix": json.dumps({"schema": "plenio.stem_mix/1", **mix}) if mix else "",
            },
        },
        # unique probe names: a probe that ran before with the same inputs would be cached
        "5": {
            "class_type": "PlenioTestAudioProbe",
            "inputs": {"audio": ["4", 0], "name": f"mix {uuid.uuid4()}"},
        },
        "6": {
            "class_type": "PlenioTestAudioProbe",
            "inputs": {"audio": ["1", 0], "name": f"input {uuid.uuid4()}"},
        },
    }


def probes(log: Log) -> dict[str, dict[str, Any]]:
    return {e["name"].split()[0]: e for e in events(log, "probe")}


def decode(path: Path) -> tuple[np.ndarray, int]:
    """A written stem file as float ``[channels, frames]`` and its rate (24-bit FLAC: 2**31 full scale)."""
    import av

    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        rate = int(stream.codec_context.sample_rate)
        channels = int(stream.channels)
        frames = [frame.to_ndarray() for frame in container.decode(stream)]
    packed = np.concatenate(frames, axis=-1).astype(np.float64) / (1 << 31)
    return packed.reshape(-1, channels).T, rate


def rms(data: np.ndarray) -> float:
    return float(np.sqrt(np.mean(data**2)))


def test_a_neutral_mix_returns_the_input(server: ComfyServer, log: Log) -> None:
    entry = server.run(stems_prompt())
    found = probes(log)
    assert found["mix"]["shape"] == found["input"]["shape"] and found["mix"]["rate"] == found["input"]["rate"]
    assert found["mix"]["rms"] == pytest.approx(found["input"]["rms"], rel=1e-6)
    assert "neutral" in entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    assert "vocals, drums, bass, other + rest" in entry["outputs"]["3"]["plenio_summary"][0]["markdown"]


def test_solo_and_mute_follow_the_mixer_value(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt({"strips": {"vocals": {"solo": True}}}))
    found = probes(log)
    assert found["mix"]["rms"] == pytest.approx(0.4 * found["input"]["rms"], rel=1e-5)  # the fake's vocals
    log.clear()
    server.run(stems_prompt({"strips": {"rest": {"mute": True}}}))
    found = probes(log)
    assert found["mix"]["rms"] == pytest.approx(0.8 * found["input"]["rms"], rel=1e-5)  # without the residual


def test_errors_are_actionable(server: ComfyServer) -> None:
    wrong = server.run_expect_error(stems_prompt(kind="super-resolution"))
    assert (
        wrong["node_type"] == "PlenioSeparateStems"
        and "needs a separation model" in wrong["exception_message"]
    )
    send = server.run_expect_error(stems_prompt({"strips": {"drums": {"reverb": 0.3}}}))
    assert send["node_type"] == "PlenioStemMixer" and "no reverb bus yet" in send["exception_message"]
    typo = server.run_expect_error(stems_prompt({"strips": {"drums": {"pan": 0.3}}}))
    assert "unknown fields" in typo["exception_message"]


def test_the_payload_carries_the_strips_for_the_mixer_widget(server: ComfyServer) -> None:
    """The mixer widget draws its waveform from ``plenio_stems`` (Phase 11C M6/D12)."""
    entry = server.run(stems_prompt())
    payload = entry["outputs"]["4"]["plenio_stems"][0]
    assert payload["stems"] == ["vocals", "drums", "bass", "other", "rest"]
    assert payload["seconds"] == pytest.approx(2.0, abs=0.05)
    assert set(payload["peaks"]) == set(payload["stems"])
    for name, values in payload["peaks"].items():
        assert len(values) == 240, name
        assert max(values) > 0, name
        assert max(values) <= 1.0, name


def test_the_effect_buses_run_and_change_the_mix(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt())
    neutral = probes(log)["mix"]
    log.clear()
    entry = server.run(
        stems_prompt(
            {
                "strips": {"drums": {"reverb": 0.4, "delay": 0.25}},
                "reverb": {"preset": "hall"},
                "delay": {"time_ms": 250, "feedback": 0.35, "lowpass_hz": 4000},
            }
        )
    )
    found = probes(log)["mix"]
    assert found["rate"] == neutral["rate"] and found["shape"] == neutral["shape"]
    assert found["rms"] != pytest.approx(neutral["rms"], rel=1e-4)  # the sends are audible
    assert "Stem Mixer" in entry["outputs"]["4"]["plenio_summary"][0]["markdown"]


def test_a_muted_range_silences_only_its_stretch(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt())
    neutral = probes(log)["mix"]
    log.clear()
    server.run(stems_prompt({"strips": {"drums": {"muted": [[0.0, 1.0]]}}}))
    found = probes(log)["mix"]
    assert found["rms"] < neutral["rms"]  # half of the drums is gone
    assert found["rms"] > 0.5 * neutral["rms"]  # and nothing else
    assert found["shape"] == neutral["shape"] and found["rate"] == neutral["rate"]


def test_a_strip_marked_save_is_written_as_its_own_file(server: ComfyServer) -> None:
    """Owner's request (2026-09-28): a switch per stem writes it as a file; default: off. Without an Export
    Release that takes the mixer's report the files go to output/plenio/stems."""
    folder = server.output_dir / "plenio" / "stems"
    entry = server.run(
        stems_prompt({"strips": {"drums": {"save": True}, "rest": {"save": True, "gain_db": -6.0}}})
    )
    payload = entry["outputs"]["4"]["plenio_stems"][0]
    summary = entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    assert payload["saved"] == ["drums", "rest"]
    assert "saved drums as its own file: drums.flac" in summary
    assert "saved rest as its own file: rest.flac" in summary
    assert not (folder / "vocals.flac").exists()  # only the marked strips are written
    assert not (folder / "other.flac").exists()
    drums_audio, rate = decode(folder / "drums.flac")
    rest_audio, rest_rate = decode(folder / "rest.flac")
    assert rate == rest_rate == 24000
    assert drums_audio.shape == rest_audio.shape == (2, 48000)  # 2 s at the input's rate
    # the file holds that strip's own signal: the residual at its -6 dB, the fake's drums untouched
    assert rms(rest_audio) == pytest.approx(10 ** (-6 / 20) * rms(drums_audio), rel=1e-3)
    tags, _cover = read_tags(folder / "drums.flac")
    assert tags["title"] == "drums (Plenio stems)"


def test_with_an_export_the_stems_go_next_to_the_song(server: ComfyServer) -> None:
    """Owner's request (2026-10-09): the stems marked save are kept in the song's folder, in a folder named
    after the song with '-stems'; the release record lists them."""
    import jsonschema

    folder = f"stems-export/{uuid.uuid4().hex[:8]}"
    # (other mixer settings than the tests before: ComfyUI would take that mixer's result from its cache)
    prompt = stems_prompt(
        {"strips": {"drums": {"save": True, "gain_db": 0.0}, "rest": {"save": True, "gain_db": -6.0}}}
    )
    prompt["7"] = {
        "class_type": "PlenioExportRelease",
        "inputs": {
            "audio": ["4", 0],
            "folder": folder,
            "naming": "{title}",
            "collision": "number",
            "reports.report_0": ["4", 1],
        },
    }
    before = sorted((server.output_dir / "plenio" / "stems").glob("*.flac"))
    entry = server.run(prompt)
    summary = entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    assert "saved with the song: drums, rest - Export Release writes them into '<name>-stems'" in summary
    assert sorted((server.output_dir / "plenio" / "stems").glob("*.flac")) == before  # nothing there
    song = server.output_dir / folder
    assert sorted(p.name for p in song.iterdir()) == [
        "Untitled-stems",
        "Untitled.flac",
        "Untitled.plenio.json",
    ]
    stems = song / "Untitled-stems"
    assert sorted(p.name for p in stems.iterdir()) == ["drums.flac", "rest.flac"]
    drums_audio, rate = decode(stems / "drums.flac")
    rest_audio, _rate = decode(stems / "rest.flac")
    assert rate == 24000 and drums_audio.shape == (2, 48000)
    assert rms(rest_audio) == pytest.approx(10 ** (-6 / 20) * rms(drums_audio), rel=1e-3)
    assert read_tags(stems / "drums.flac")[0]["title"] == "Untitled (drums)"
    record = json.loads((song / "Untitled.plenio.json").read_text(encoding="utf-8"))
    listed = [(f["name"], f.get("role"), f.get("stem")) for f in record["files"] if f.get("role") == "stem"]
    assert listed == [
        ("Untitled-stems/drums.flac", "stem", "drums"),
        ("Untitled-stems/rest.flac", "stem", "rest"),
    ]
    schema = json.loads(
        (Path(__file__).resolve().parents[2] / "resources" / "schemas" / "record-1.schema.json").read_text(
            encoding="utf-8"
        )
    )
    jsonschema.validate(record, schema)
    export = entry["outputs"]["7"]["plenio_summary"][0]["markdown"]
    assert "- stems: Untitled-stems/ (drums, rest)" in export
    # the next export of the same title (the mixer's result from ComfyUI's cache, the export run again): the
    # song and its stems folder take ' (2)' together
    prompt["7"]["inputs"]["flac"] = True
    server.run(prompt)
    assert (song / "Untitled (2)-stems" / "drums.flac").is_file() and (song / "Untitled (2).flac").is_file()


def test_saved_stems_never_overwrite_an_earlier_file(server: ComfyServer) -> None:
    folder = server.output_dir / "plenio" / "stems"
    entry = server.run(stems_prompt({"strips": {"drums": {"save": True}}}))
    summary = entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    assert "saved drums as its own file: drums (2).flac" in summary
    assert (folder / "drums.flac").is_file() and (folder / "drums (2).flac").is_file()
    assert not (folder / "rest (2).flac").exists()  # the plain strip is not written again
