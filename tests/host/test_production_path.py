"""The audio production chain in a real ComfyUI server (V2): EQ, Loudness & Dynamics, Export Release
(formats, tags, cover, original), the Enhance & Master graph with Load Audio, and the preset routes.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from harness import ComfyServer, Log
from plenio.core.audio import measure
from plenio.core.release import read_tags, write_audio

pytestmark = pytest.mark.host

TAGS = {
    "artist": "Plenio Tests",
    "album": "Host Suite",
    "date": "2026",
    "track": "7",
    "genre": "Pop",
    "comment": "made in a test",
    "album_artist": "Plenio",
    "composer": "J. P.",
}


def label() -> str:
    return uuid.uuid4().hex[:10]


def chain(
    *,
    folder: str,
    eq: dict[str, Any] | None = None,
    loudness: dict[str, Any] | None = None,
    export: dict[str, Any] | None = None,
    source: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "1": source or {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": 8.0, "variant": 3}},
        "2": {"class_type": "PlenioEQ", "inputs": {"audio": ["1", 0], **(eq or {"mode": "flat"})}},
        "3": {
            "class_type": "PlenioLoudness",
            "inputs": {
                "audio": ["2", 0],
                **(
                    loudness
                    or {
                        "target": "streaming (-14 LUFS, -1 dBTP)",
                        "compression": "Balanced - gentle glue",
                        "sample_rate": "keep",
                    }
                ),
            },
        },
        "4": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["3", 0],
                "folder": folder,
                "naming": "{title}",
                "flac": True,
                "mp3": False,
                "wav": False,
                "tags": "title only",
                "collision": "number",
                "reports.report_0": ["2", 1],
                "reports.report_1": ["3", 1],
                **(export or {"title": "Chain Test"}),
            },
        },
    }


RECORD_SCHEMA = Path(__file__).resolve().parents[2] / "resources" / "schemas" / "record-1.schema.json"


def record_of(server: ComfyServer, folder: str, name: str) -> dict[str, Any]:
    """The release record the Export node wrote, checked against its schema when jsonschema is installed."""
    data: dict[str, Any] = json.loads(
        (server.output_dir / folder / f"{name}.plenio.json").read_text(encoding="utf-8")
    )
    try:
        import jsonschema
    except ImportError:  # ComfyUI does not ship it; the CI host job installs it
        return data
    jsonschema.validate(data, json.loads(RECORD_SCHEMA.read_text(encoding="utf-8")))
    return data


def report_data(record: dict[str, Any], kind: str) -> dict[str, Any]:
    found: dict[str, Any] = next(r for r in record["reports"] if r["kind"] == kind)
    return found


def test_loudness_target_is_met_and_recorded(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    entry = server.run(chain(folder=folder))
    record = record_of(server, folder, "Chain Test")
    level = record["audio"]["loudness"][0]
    assert (
        level["integrated_lufs"] == pytest.approx(-14.0, abs=0.3) and level["true_peak_dbtp"] <= -1.0 + 0.05
    )
    loudness = report_data(record, "loudness")
    assert loudness["status"] == "ok" and loudness["data"]["items"][0]["target_reached"]
    assert report_data(record, "eq")["status"] == "skipped"  # flat
    assert "LUFS" in entry["outputs"]["3"]["plenio_summary"][0]["markdown"]


def test_output_rate_and_formats_with_tags(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    server.run(
        chain(
            folder=folder,
            loudness={
                "target": "custom",
                "target.lufs": -16.0,
                "target.ceiling_dbtp": -1.5,
                "compression": "off",
                "sample_rate": "48000",
            },
            export={
                "title": "Formats",
                "mp3": True,
                "wav": True,
                "tags": "tags",
                **{f"tags.{k}": v for k, v in TAGS.items()},
            },
        )
    )
    base = server.output_dir / folder
    record = record_of(server, folder, "Formats")
    formats = {f["format"]: f for f in record["files"] if "format" in f}
    assert set(formats) == {"flac", "mp3", "wav"} and formats["flac"]["sample_rate"] == 48000
    assert formats["flac"]["bits"] == 24 and formats["wav"]["bits"] == 32
    for suffix in ("flac", "mp3"):
        tags, cover = read_tags(base / f"Formats.{suffix}")
        assert tags == {"title": "Formats", **TAGS} and cover is None
    wav_tags, _ = read_tags(base / "Formats.wav")
    assert wav_tags["title"] == "Formats" and wav_tags["artist"] == "Plenio Tests"
    assert record["audio"]["loudness"][0]["integrated_lufs"] == pytest.approx(-16.0, abs=0.3)
    assert record["audio"]["tags"]["composer"] == "J. P."


def test_manual_eq_is_applied_and_shown(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    bands = {"schema": "plenio.eq/1", "preamp_db": -6.0, "bands": []}
    entry = server.run(
        chain(
            folder=folder,
            eq={"mode": "manual", "mode.bands": json.dumps(bands)},
            loudness={
                "target": "custom",
                "target.lufs": -30.0,
                "target.ceiling_dbtp": -1.0,
                "compression": "off",
                "sample_rate": "keep",
            },
            export={"title": "EQ"},
        )
    )
    shown = entry["outputs"]["2"]["plenio_eq"][0]
    assert shown["settings"]["preamp_db"] == -6.0 and shown["response_db"][0] == pytest.approx(-6.0)
    assert report_data(record_of(server, folder, "EQ"), "eq")["data"]["mode"] == "manual"


def test_tone_match_preset_and_reference_errors(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    server.run(
        chain(
            folder=folder,
            eq={"mode": "match preset", "mode.preset": "Warm - gentle (workflow default)"},
            export={"title": "Warm"},
        )
    )
    eq_report = report_data(record_of(server, folder, "Warm"), "eq")
    assert eq_report["data"]["mode"] == "match preset" and eq_report["data"]["settings"]
    error = server.run_expect_error(
        chain(
            folder=folder,
            eq={"mode": "match preset", "mode.preset": "Reference - balanced"},
            export={"title": "Ref"},
        )
    )
    assert error["node_type"] == "PlenioEQ" and "reference recording" in error["exception_message"]


def test_cover_and_original_are_exported(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    prompt = chain(folder=folder, export={"title": "Covered"})
    prompt["5"] = {
        "class_type": "EmptyImage",
        "inputs": {"width": 640, "height": 480, "batch_size": 1, "color": 0x3366AA},
    }
    prompt["4"]["inputs"].update({"cover": ["5", 0], "original": ["1", 0], "mp3": True})
    server.run(prompt)
    base = server.output_dir / folder
    assert (base / "Covered.jpg").stat().st_size > 1000
    assert (base / "Covered (original).flac").exists()
    record = record_of(server, folder, "Covered")
    roles = {f.get("role") for f in record["files"]}
    assert {"cover", "original"} <= roles
    for suffix in ("flac", "mp3"):  # embedded without an extra package (0.2.2)
        _tags, cover = read_tags(base / f"Covered.{suffix}")
        assert cover is not None and cover == (base / "Covered.jpg").read_bytes()


def test_enhance_graph_copies_tags_from_the_loaded_file(server: ComfyServer, log: Log) -> None:
    folder = f"plenio-production/{label()}"
    name = f"source-{label()}.flac"
    rate = 44100
    t = np.arange(rate * 6) / rate
    music = 0.1 * np.vstack([np.sin(2 * np.pi * 220 * t), np.sin(2 * np.pi * 330 * t)])
    (server.base / "input").mkdir(exist_ok=True)
    write_audio(server.base / "input" / name, music, rate, "flac", {"title": "Loaded Song", **TAGS})
    prompt = chain(
        folder=folder,
        source={"class_type": "LoadAudio", "inputs": {"audio": name}},
        eq={"mode": "match preset", "mode.preset": "Warm - gentle (workflow default)"},
        export={"tags": "copy from loaded file", "mp3": True},
    )
    prompt["4"]["inputs"]["original"] = ["1", 0]
    entry = server.run(prompt)
    summary = entry["outputs"]["4"]["plenio_summary"][0]
    assert (
        summary["status"] == "ok" and f"- tags copied from {name}" in summary["markdown"]
    )  # a note, no warning
    base = server.output_dir / folder
    tags, _cover = read_tags(base / "Loaded Song.flac")
    assert tags == {"title": "Loaded Song", **TAGS}
    original = base / "Loaded Song (original).flac"
    assert original.exists()
    level = record_of(server, folder, "Loaded Song")["audio"]["loudness"][0]
    assert level["integrated_lufs"] == pytest.approx(-14.0, abs=0.3)
    source_level = measure(music, rate).integrated_lufs
    assert source_level is not None and source_level < -18  # the master really changed the level


def test_bypassed_stages_change_nothing(server: ComfyServer, log: Log) -> None:
    """Flat EQ and a bypassed Loudness node (the frontend removes it and wires its input through):
    the exported FLAC has the source's samples, sample rate and tags."""
    folder = f"plenio-production/{label()}"
    name = f"bypass-{label()}.flac"
    rate = 44100
    rng = np.random.default_rng(5)
    music = np.round(0.3 * rng.standard_normal((2, rate * 3)).clip(-3, 3) * 2**23) / 2**23
    (server.base / "input").mkdir(exist_ok=True)
    write_audio(server.base / "input" / name, music, rate, "flac", {"title": "Bypassed", **TAGS})
    prompt = chain(
        folder=folder,
        source={"class_type": "LoadAudio", "inputs": {"audio": name}},
        export={"tags": "copy from loaded file"},
    )
    del prompt["3"]
    prompt["4"]["inputs"]["audio"] = ["2", 0]
    del prompt["4"]["inputs"]["reports.report_1"]
    server.run(prompt)
    path = server.output_dir / folder / "Bypassed.flac"
    assert read_tags(path) == ({"title": "Bypassed", **TAGS}, None)
    flac = next(f for f in record_of(server, folder, "Bypassed")["files"] if f.get("format") == "flac")
    assert flac["sample_rate"] == rate and flac["bits"] == 24 and flac["channels"] == 2
    import av

    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        data = np.concatenate([f.to_ndarray() for f in container.decode(stream)], axis=-1)
    decoded = data.reshape(-1, 2).T.astype(np.float64) / 2**31
    assert decoded.shape == music.shape and np.array_equal(decoded, music)


def test_copy_from_loaded_file_needs_a_load_audio_node(server: ComfyServer, log: Log) -> None:
    error = server.run_expect_error(
        chain(folder="plenio-production/x", export={"tags": "copy from loaded file"})
    )
    assert (
        error["node_type"] == "PlenioExportRelease"
        and "exactly one Load Audio node" in error["exception_message"]
    )


def test_preset_and_eq_routes(server: ComfyServer) -> None:
    eq = server.get("/plenio/presets/eq")
    assert eq["manual"][0]["name"] == "Flat" and len(eq["match"]) == 10
    loudness = server.get("/plenio/presets/loudness")
    assert loudness["targets"][0]["integrated_lufs"] == -14
    status, missing = server.request("GET", "/plenio/presets/colours")
    assert status == 400 and "Unknown preset kind" in missing["error"]["message"]
    settings = {
        "schema": "plenio.eq/1",
        "preamp_db": 0,
        "bands": [{"id": "a", "type": "peak", "frequency_hz": 1000, "gain_db": 6, "q": 1}],
    }
    status, curve = server.request(
        "POST", "/plenio/eq/response", {"settings": settings, "sample_rate": 48000, "points": 64}
    )
    assert (
        status == 200
        and len(curve["frequency_hz"]) == 64
        and max(curve["response_db"]) == pytest.approx(6.0, abs=0.2)
    )
    assert len(curve["bands"]) == 1
    bad = dict(settings, bands=[{"id": "a", "type": "peak", "frequency_hz": 1000, "gain_db": 60}])
    status, refused = server.request("POST", "/plenio/eq/response", {"settings": bad, "sample_rate": 48000})
    assert status == 400 and "gain_db" in refused["error"]["message"]


def test_enhance_template_contains_the_chain(server: ComfyServer, log: Log) -> None:
    """The shipped template is the graph the tests above run (Load Audio, EQ, Loudness, Export)."""
    template = json.loads(
        (Path(__file__).resolve().parents[2] / "example_workflows" / "4 · Enhance & Master.json").read_text(
            encoding="utf-8"
        )
    )
    types = sorted(n["type"] for n in template["nodes"])
    assert types == [
        "LoadAudio",
        "MarkdownNote",
        "PlenioEQ",
        "PlenioExportRelease",
        "PlenioLoudness",
        "PreviewAudio",
    ]


def test_hi_res_mp3_and_repeated_exports_keep_every_record(server: ComfyServer, log: Log) -> None:
    """Audit AUD-03 (MP3 of 96 kHz audio crashed) and AUD-04 (one base name per export; an earlier
    record was overwritten when the format set changed)."""
    folder = f"plenio-production/{label()}"
    name = f"hires-{label()}.flac"
    rate = 96000
    t = np.arange(rate * 3) / rate
    music = 0.1 * np.vstack([np.sin(2 * np.pi * 220 * t), np.sin(2 * np.pi * 330 * t)])
    (server.base / "input").mkdir(exist_ok=True)
    write_audio(server.base / "input" / name, music, rate, "flac", {"title": "Hi Res"})
    source = {"class_type": "LoadAudio", "inputs": {"audio": name}}
    first = chain(folder=folder, source=source, export={"title": "Hi Res", "flac": False, "mp3": True})
    entry = server.run(first)
    base = server.output_dir / folder
    record = record_of(server, folder, "Hi Res")
    mp3 = next(f for f in record["files"] if f.get("format") == "mp3")
    assert mp3["sample_rate"] == 48000 and mp3["converted_from_rate"] == 96000
    assert "MP3 written at 48000 Hz" in entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    second = chain(folder=folder, source=source, export={"title": "Hi Res", "flac": True, "mp3": False})
    server.run(second)
    # Hi Res.flac was free, but the export's record would have replaced the first one: numbered as a set
    assert (base / "Hi Res (2).flac").exists() and not (base / "Hi Res.flac").exists()
    assert record_of(server, folder, "Hi Res")["files"][0]["format"] == "mp3"
    assert record_of(server, folder, "Hi Res (2)")["files"][0]["format"] == "flac"
