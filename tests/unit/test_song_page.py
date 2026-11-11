"""A song's page as one HTML file (GitHub issue 2026-10-28: the full lyrics, to copy for a new run): what it
shows, that it escapes what it shows, that its links are the song's files - and the player's page for it."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from plenio.player.song_page import (
    date_time,
    made_facts,
    mastering_facts,
    model_facts,
    page_for,
    relative_link,
    render,
    song_facts,
    span_of,
)

LYRICS = "[Verse]\nThe streetlights bleed <across> the wet ground\n\n[Chorus]\nJust finding edges & haze"


def record_of(**extra: Any) -> dict[str, Any]:
    return {
        "schema": "plenio.record/1",
        "created": "2026-10-28T20:04:11+0100",
        "title": "Growing Through Water",
        "versions": {"plenio": "1.4.0", "comfyui": "0.42.0"},
        "documents": {
            "title": {"text": "Growing Through Water"},
            "style": {"text": "synthwave, whispered intimate vocal"},
            "lyrics": {"text": LYRICS},
            "artwork_prompt": {"text": "A lone figure on a rain-slicked street"},
        },
        "audio": {
            "seconds": 131.8,
            "loudness": [{"integrated_lufs": -14.0, "true_peak_dbtp": -1.2, "loudness_range_lu": 4.2}],
            "tags": {"artist": "Plenio", "album": "Night drives", "genre": "synthwave"},
        },
        "files": [
            {"name": "Growing Through Water.flac", "bytes": 26330092, "format": "flac"},
            {"name": "Growing Through Water.jpg", "role": "cover"},
        ],
        "licences": ["CC BY-NC 4.0 (YuE2-3B, YuE2 VAE): non-commercial use only"],
        "made": {
            "started": "2026-10-28T20:00:00+0100",
            "seconds": 259.2,
            "on": {
                "device": "gpu",
                "gpu": "NVIDIA GeForce RTX 5060 Ti",
                "vram_gb": 15.9,
                "cpu": "Ryzen",
                "cores": 24,
                "ram_gb": 61.6,
            },
            "lyrics_fidelity": "high",
        },
        "prompt": {
            "2": {
                "class_type": "PlenioSongBrief",
                "inputs": {
                    "mode": "new song every run",
                    "template": "",
                    "description": "a night drive",
                    "creativity": 50,
                },
            },
            "3:101": {
                "class_type": "CheckpointLoaderSimple",
                "inputs": {"ckpt_name": "yue2_3b_int8_convrot.safetensors"},
            },
            "3:102": {
                "class_type": "LoraLoader",
                "inputs": {
                    "lora_name": "ar_lora_inst_v3abc_comfyui.safetensors",
                    "strength_model": 0.0,
                    "strength_clip": 1.0,
                },
            },
            "4": {
                "class_type": "PlenioLoras",
                "inputs": {
                    "lora_1": "rock-ar.safetensors",
                    "strength_1": 0.5,
                    "lora_2": "none",
                    "strength_2": 1.0,
                },
            },
            "17:405": {
                "class_type": "PlenioEQ",
                "inputs": {"mode": "match preset", "mode.preset": "Warm - gentle"},
            },
            "17:406": {
                "class_type": "PlenioLoudness",
                "inputs": {"target": "streaming (-14 LUFS, -1 dBTP)", "compression": ["9", 0]},
            },
            "21:1001": {"class_type": "UNETLoader", "inputs": {"unet_name": "flux-2-klein-4b.safetensors"}},
            "21:1012": {"class_type": "VAEDecode", "inputs": {"samples": ["21:1011", 0]}},
            "24": {"class_type": "PlenioHQMastering", "inputs": {"hq_mastering": False}},
        },
        **extra,
    }


def detail_of(**extra: Any) -> dict[str, Any]:
    return {
        "title": "Growing Through Water",
        "created": "2026-10-28T20:04:11+0100",
        "kind": "song",
        "model": "YuE2",
        "seconds": 131.8,
        "bpm": 122,
        "score_key": "G#m",
        "genre": "synthwave",
        "brief": {
            "kind": "song",
            "mode": "new song every run",
            "description": "a night drive",
            "sources": {},
        },
        "style": "synthwave, whispered intimate vocal",
        "lyrics": "The streetlights bleed <across> the wet ground\nJust finding edges & haze",
        "lyrics_raw": LYRICS,
        "documents": {
            "title": "Growing Through Water",
            "style": "synthwave, whispered intimate vocal",
            "artwork_prompt": "A lone figure",
        },
        "tags": {"artist": "Plenio", "album": "Night drives"},
        "loudness": {"lufs": -14.0, "true_peak": -1.2, "range": 4.2},
        "seeds": {"take": 2754695385},
        "made": record_of()["made"],
        "files": {
            "audio_flac": "Growing Through Water.flac",
            "cover": "Growing Through Water.jpg",
            "record": "Growing Through Water.plenio.json",
        },
        "versions": {"plenio": "1.4.0", "comfyui": "0.42.0"},
        "licences": ["CC BY-NC 4.0"],
        "sung": {"text": "The streetlights bleed across the wet ground", "written_heard": 0.96},
        "notation": {},
        **extra,
    }


def test_the_page_has_the_full_lyrics_with_their_sections_to_copy() -> None:
    detail = detail_of()
    page = render(detail, record_of(), relative_link(detail["files"]))
    # escaped where it shows text, the sections kept, a button that copies them
    assert "[Verse]\nThe streetlights bleed &lt;across&gt; the wet ground" in page
    assert "edges &amp; haze" in page and "<across>" not in page
    assert 'data-copy="lyrics"' in page and 'id="lyrics"' in page
    assert 'id="lyrics-plain"' in page  # without the section tags
    assert "96 % of the words sung as written" in page
    # the prompts: the style, the brief's description, the cover's prompt
    for text in ("synthwave, whispered intimate vocal", "a night drive", "A lone figure"):
        assert text in page
    # the song's files beside it, by their names
    assert 'src="Growing%20Through%20Water.jpg"' in page
    assert 'href="Growing%20Through%20Water.plenio.json"' in page
    assert 'src="Growing%20Through%20Water.flac"' in page  # the audio player
    assert "drag its FLAC" in page
    assert "<title>Growing Through Water</title>" in page


def test_the_page_says_how_it_was_made() -> None:
    record = record_of()
    facts = dict((label, value) for label, value, _note in made_facts(detail_of()))
    assert facts["Made"] == "28 October 2026, 20:00"
    assert facts["Making took"] == "4 min 19 s"
    assert facts["Graphics card"] == "NVIDIA GeForce RTX 5060 Ti · 15.9 GB"
    assert facts["Processor"] == "Ryzen · 24 threads" and facts["Memory (RAM)"] == "61.6 GB"
    assert facts["Lyrics fidelity"].startswith("high")
    models = model_facts(record)
    assert ("Music model", "yue2_3b_int8_convrot.safetensors", "") in models
    assert ("Cover art model", "flux-2-klein-4b.safetensors", "") in models
    assert ("LoRA", "ar_lora_inst_v3abc_comfyui.safetensors", "plan 1.0") in models
    assert ("LoRA", "rock-ar.safetensors", "strength 0.5") in models
    assert not any(value == "none" for _label, value, _note in models)
    mastering = mastering_facts(record)
    assert ("EQ", "match preset · Warm - gentle", "") in mastering
    assert ("Loudness target", "streaming (-14 LUFS, -1 dBTP)", "") in mastering
    assert not any(
        label == "Dynamics" for label, _value, _note in mastering
    )  # a link has no value of its own
    assert ("HQ mastering", "off", "") in mastering


def test_a_model_chosen_by_model_choice_is_named_from_the_record() -> None:
    """Since 2.0 a loader's file comes from the block's Model Choice: the prompt says auto, the record the file."""
    record = record_of()
    prompt = record["prompt"]
    prompt["3:100"] = {
        "class_type": "PlenioModelChoice",
        "inputs": {"component": "yue2", "component.file": "auto"},
    }
    prompt["3:101"]["inputs"]["ckpt_name"] = ["3:100", 0]
    prompt["21:1000"] = {
        "class_type": "PlenioModelChoice",
        "inputs": {"component": "flux2-klein", "component.file": "my_flux_finetune.safetensors"},
    }
    prompt["21:1001"]["inputs"]["unet_name"] = ["21:1000", 0]
    record["models"] = {"3:100": {"component": "yue2", "file": "yue2_3b_bf16.safetensors"}}
    models = model_facts(record)
    assert ("Music model", "yue2_3b_bf16.safetensors", "") in models
    # a record without the note: the field's own file, when it names one
    assert ("Cover art model", "my_flux_finetune.safetensors", "") in models
    del record["models"]
    assert not any(label == "Music model" for label, _value, _note in model_facts(record))  # auto: not known


def test_the_facts_of_the_brief_mark_their_defaults() -> None:
    facts = {label: (value, note) for label, value, note in song_facts(detail_of())}
    assert facts["Mood"] == ("open - the writer chose", "default")
    assert facts["Tempo"] == ("122 BPM", "default - the writer chose")
    assert facts["Model"] == ("YuE2", "")
    recording = song_facts({"brief": {}, "seconds": 70, "kind": "master", "genre": "jazz"})
    assert ("Model", "a recording (Enhance & Master)", "") in recording


def test_an_instrumental_and_a_song_without_files_still_have_a_page() -> None:
    detail = detail_of(lyrics="", lyrics_raw="", sung={}, files={}, documents={})
    page = render(detail, {"prompt": {}}, relative_link({}))
    assert "An instrumental - no lyrics." in page and "<audio" not in page and "<img" not in page


def test_in_the_player_its_links_are_the_players(tmp_path: Path) -> None:
    detail = detail_of()
    record = record_of(sheet_music={"file": "Growing Through Water.pdf"})
    page = render(detail, record, lambda kind, _name: f"/media/abc/{kind}", in_player=True)
    assert 'src="/media/abc/cover"' in page and 'href="/media/abc/record"' in page
    assert "Open in ComfyUI on its page" in page
    assert "/media/abc/pdf" not in page  # a PDF the record names but no page drew is not offered
    beside = render(detail, record, relative_link(detail["files"]))
    assert 'href="Growing%20Through%20Water.pdf"' in beside  # beside the song: drawn just after the export


def test_page_for_reads_the_record_beside_the_song(tmp_path: Path) -> None:
    record_path = tmp_path / "Growing Through Water.plenio.json"
    record_path.write_text(json.dumps(record_of()), encoding="utf-8")
    (tmp_path / "Growing Through Water.flac").write_bytes(b"fLaC")
    page = page_for(record_path)
    assert "<h1>Growing Through Water</h1>" in page and "[Chorus]" in page
    assert 'src="Growing%20Through%20Water.flac"' in page


def test_times_read_as_people_say_them() -> None:
    assert date_time("2026-10-28T14:05:09+0100") == "28 October 2026, 14:05"
    assert date_time("not a time") == "not a time"
    assert date_time("") == ""
    assert span_of(45) == "45 s" and span_of(273) == "4 min 33 s" and span_of(3900) == "1 h 05 min"
