"""The songs of Plenio output folders, for the Plenio Player (owner's request 2026-10-15): every release record
(``<name>.plenio.json``) with its files, the facts the library shows and searches, and - for one song - its
documents, the notation and the times its lyrics are sung.

Pure Python and ``plenio.core``. It reads the folders and writes there only when the listener removes a
song (owner's request 2026-10-16): its files go to the retired songs (``_retired`` in the library folder,
which the library does not read) or are deleted for good. A folder can also take other music, audio files
not from Plenio (``plenio.player.other``): songs of their own, marked so, with what their files have.
"""

from __future__ import annotations

import functools
import hashlib
import json
import logging
import os
import re
import shutil
import threading
import time
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..core import brief as brief_rules
from ..core import creativity as creativity_rules
from ..core import subtitles as subtitle_rules
from ..core.errors import PlenioError
from ..core.release import RECORD_SUFFIX, base_title, numbered_title_in
from . import other as other_music

CACHE_VERSION = 13
REFRESH_S = 15.0
"""A reader's songs are read again (in the background) when they are older than this."""
RETIRED_DIR = "_retired"
WAITING_DIR = "_waiting"
"""Where a song made in the player waits until it is released (owner's request 2026-10-29): each in a folder of its
own below its release folder, which the library does not read - the songs not released stay there, in ``not
released``."""
CLOCK_SLACK = 1.0
"""Seconds a file's time may run ahead of the clock read at a scan's start: on Windows a file written just
before can carry a time a little after a coarse ``time.time()``. A file further ahead (a wrong clock, a copy from
another time zone) is not taken for "now" - it would hide every song made until the clock caught up."""
EXPECTED_FOR_S = 3600.0
"""How long a record the player's studio made is waited for (:meth:`Library.expect`)."""
"""Where removed songs go, below the library folder they were in; the library does not read it."""
SKIP_DIRS = {".plenio-player", "__pycache__", ".git", RETIRED_DIR, WAITING_DIR}
AUDIO_KINDS = ("flac", "mp3", "wav")
ENGINE_NAMES = {"yue2": "YuE2", "minimax_music3": "MiniMax Music 3", "minimax": "MiniMax Music 3"}
RESOURCES = Path(__file__).resolve().parents[2] / "resources"
SEED_TITLES = {"take seed": "take", "draft seed": "draft", "arrangement seed": "arrangement"}
log = logging.getLogger("plenio.player")
_SRT_TIME = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)")


def _appeared(stat: os.stat_result) -> float:
    """When a file appeared here: written (mtime) or, for a file copied or moved in with its old time, put
    here (ctime: its creation on Windows, its last change of place elsewhere)."""
    return max(stat.st_mtime, stat.st_ctime)


def song_id(path: Path, root: Path) -> str:
    """A short id that stays the same while the record stays where it is."""
    rel = path.relative_to(root).as_posix() if path.is_relative_to(root) else path.as_posix()
    return hashlib.sha1(f"{root.as_posix()}|{rel}".encode()).hexdigest()[:12]


def _text(value: Any) -> str:
    return "" if value is None else str(value).strip()


def _brief_node(prompt: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    for node in prompt.values():
        if isinstance(node, Mapping) and node.get("class_type") in ("PlenioSongBrief", "PlenioCoverBrief"):
            return str(node["class_type"]), dict(node.get("inputs") or {})
    return "", {}


_TEMPLATES: dict[str, dict[str, str]] | None = None


def template_fields(template_id: str) -> dict[str, str]:
    """The fields of a shipped brief template (empty when unknown): they fill what the brief left empty."""
    global _TEMPLATES
    if _TEMPLATES is None:
        _TEMPLATES = {}
        try:
            from ..core.brief import TemplateLibrary

            library = TemplateLibrary(RESOURCES / "templates")
            for template in library._load().values():  # noqa: SLF001 - the library's own reader
                _TEMPLATES[template.id] = dict(template.fields)
        except Exception:  # noqa: BLE001 - the player works without templates
            _TEMPLATES = {}
    return _TEMPLATES.get(template_id, {})


COVER_LANGUAGE_DEFAULTS = {"original lyrics": "auto", "new lyrics": "English"}
"""The Cover Brief's language field by its vocals choice (``comfy/nodes/cover_brief.py``)."""
SONG_MODE_DEFAULT = "new song every run"
COVER_MODE_DEFAULT = "new cover every run"
"""The briefs' work mode by default (``comfy/nodes/brief.py``, ``cover_brief.py``)."""


def plenio_version(record: Mapping[str, Any]) -> tuple[int, int, int] | None:
    """The Plenio version that made a record (``None``: it names none)."""
    found = re.match(r"(\d+)\.(\d+)(?:\.(\d+))?", _text((record.get("versions") or {}).get("plenio")))
    return (int(found[1]), int(found[2]), int(found[3] or 0)) if found else None


def brief_facts(prompt: Mapping[str, Any], version: tuple[int, ...] | None = None) -> dict[str, Any]:
    """The brief as the song was made: typed values, the template's where a text field was empty, and the
    brief's default where neither was set. ``sources`` says which, per field: ``typed``, ``template`` or
    ``default`` (a text field left empty has no default value - the writer chose; owner's request
    2026-10-17: the song page shows every field, a default marked as one). ``version``: the Plenio version that
    made the song - its creativity is given on today's scale (``core.creativity.scaled_for``)."""
    kind, inputs = _brief_node(prompt)
    if not kind:
        return {}
    cover = kind == "PlenioCoverBrief"
    template = _text(inputs.get("template"))
    filled = template_fields(template) if template and template != "none" else {}
    sources: dict[str, str] = {}

    def field_value(name: str, key: str | None = None, default: str = "") -> str:
        typed = _text(inputs.get(key or name))
        if typed and typed != default:
            sources[name] = "typed"
            return typed
        from_template = _text(filled.get(name))
        if from_template and not typed:
            sources[name] = "template"
            return from_template
        sources[name] = "default"
        return default

    def choice(name: str, default: str, key: str | None = None) -> str:
        value = _text(inputs.get(key or name)) or default
        sources[name] = "default" if value == default else "typed"
        return value

    def number(name: str, key: str, default: int) -> int:
        raw = inputs.get(key)
        try:
            value = (
                brief_rules.closeness_value(raw, default) if isinstance(raw, (int, float, str)) else default
            )
        except PlenioError:  # a record edited by hand
            value = default
        sources[name] = "default" if value == default else "typed"
        return value

    vocals = _text(inputs.get("vocals")) or _text(filled.get("vocals")) or ("" if cover else "sung")
    sources["vocals"] = "typed" if _text(inputs.get("vocals")) else "default"
    language_default = COVER_LANGUAGE_DEFAULTS.get(vocals, "") if cover else ""
    facts: dict[str, Any] = {
        "kind": "cover" if cover else "song",
        "mode": choice("mode", COVER_MODE_DEFAULT if cover else SONG_MODE_DEFAULT),
        "template": "" if template == "none" else template,
        "description": field_value("description"),
        "genre": field_value("genre"),
        "mood": field_value("mood"),
        "tempo": field_value("tempo"),
        "length": "" if cover else choice("length", brief_rules.DEFAULT_LENGTH),
        "vocals": vocals,
        "language": field_value("language", "vocals.language", language_default),
        "voice": field_value("voice", "vocals.voice"),
        "theme": field_value("theme", "vocals.theme"),
        "melody": choice("melody", next(iter(brief_rules.MELODY_OPTIONS)), "vocals.melody")
        if vocals == "instrumental"
        else "",
        "lead_instrument": field_value("lead_instrument", "vocals.lead_instrument"),
        "key": field_value("key"),
        "meter": field_value("meter"),
        "arrangement": choice("arrangement", brief_rules.ARRANGEMENT_DEFAULT),
        "harmony": choice("harmony", next(iter(brief_rules.HARMONY_OPTIONS))) if cover else "",
        "closeness": number(
            "closeness",
            "song_flow_closeness" if cover else "genre_closeness",
            brief_rules.CLOSENESS_DEFAULT,
        ),
        "lyrics_closeness": number(
            "lyrics_closeness", "lyrics_closeness", brief_rules.LYRICS_CLOSENESS_DEFAULT
        )
        if cover and vocals == "new lyrics"
        else None,
        "lines_under_singing": bool(inputs.get("lines_under_singing")),
        # a song made before the slider was made as 1.4's 50 made it; one made before 1.5.0 carries 1.4's number,
        # which is twice today's (owner's request 2026-10-31: 1.4's 100 is today's 50)
        "creativity": creativity_rules.scaled_for(number("creativity", "creativity", 50), version),
    }
    sources["lines_under_singing"] = "typed" if facts["lines_under_singing"] else "default"
    if template == "none" or not template:
        sources["template"] = "default"
    facts["sources"] = sources
    return facts


SAMPLING_NAMES = ("temperature", "top_p", "top_k")


def _node_order(node_id: str) -> tuple[int, ...]:
    """``"8:701"`` -> ``(8, 701)``: nodes in the order of the graph (inside a block after the block)."""
    try:
        return tuple(int(part) for part in str(node_id).split(":"))
    except ValueError:
        return (1 << 30,)


def _sampling_value(
    prompt: Mapping[str, Any], value: Any, creativity: Any, version: tuple[int, ...] | None = None
) -> float | int | None:
    """A sampling field's value: the number written there, or what the Creativity node it is linked to gave
    (from the brief's creativity, or its own - on the scale of the Plenio ``version`` that made the song)."""
    if isinstance(value, bool):
        return None
    if isinstance(value, float):
        return round(value, 3)
    if isinstance(value, int):
        return value
    if isinstance(value, list) and len(value) == 2 and value[1] in (0, 1, 2):
        node = prompt.get(str(value[0]))
        if not (isinstance(node, Mapping) and node.get("class_type") == "PlenioCreativity"):
            return None
        inputs = node.get("inputs") or {}
        own = inputs.get("creativity")
        amount = creativity if "brief" in inputs or isinstance(own, list) else own
        try:
            chosen = creativity_rules.sampling_as_made(amount, str(inputs.get("stage") or "take"), version)
        except PlenioError:
            return None
        return (chosen.temperature, chosen.top_p, chosen.top_k)[int(value[1])]
    return None


def sampling_facts(
    prompt: Mapping[str, Any], creativity: Any = None, version: tuple[int, ...] | None = (9, 0, 0)
) -> dict[str, dict[str, float | int | bool]]:
    """The sampling the song was made with (owner's request 2026-10-19: the creativity's values on the song's
    page): the writer's first draft and a creative mode's plan (their temperature, from the branch the chosen
    writer model ran), YuE2's plan and take (temperature, top-p, top-k). What a record does not have is left
    out. ``fixed``: the numbers were written in the workflow, not given by a Creativity node - a block saved
    before it followed the brief's creativity, or a value set by hand (owner's report 2026-10-20). ``creativity``:
    the brief's as written in the record, on the scale of the Plenio ``version`` that made it (default: today's)."""

    def first(kind: str, prompt_from: str = "") -> Mapping[str, Any] | None:
        for node_id in sorted(prompt, key=_node_order):
            node = prompt[node_id]
            if not isinstance(node, Mapping) or node.get("class_type") != kind:
                continue
            if _text((node.get("_meta") or {}).get("title")).lower().startswith("second plan"):
                continue
            if prompt_from:
                link = (node.get("inputs") or {}).get("prompt")
                source = prompt.get(str(link[0])) if isinstance(link, list) and link else None
                if not (isinstance(source, Mapping) and source.get("class_type") == prompt_from):
                    continue
            return node
        return None

    def written(*raw: Any) -> dict[str, bool]:
        return {} if any(isinstance(value, list) for value in raw) else {"fixed": True}

    facts: dict[str, dict[str, float | int | bool]] = {}
    writer = next(
        (
            _text((node.get("inputs") or {}).get("model"))
            for node in prompt.values()
            if isinstance(node, Mapping) and node.get("class_type") == "PlenioWriterChoice"
        ),
        "",
    )
    local = " · " in writer  # 'models/LLM · …', 'LM Studio · …': a Local LLM; a bare file name: Generate Text
    for stage, compose in (("writer", "PlenioComposePrompt"), ("arrangement", "PlenioComposeArrangement")):
        node = first("PlenioLocalLLM" if local else "TextGenerate", compose)
        if node is not None:
            key = "temperature" if local else "sampling_mode.temperature"
            raw = (node.get("inputs") or {}).get(key)
            value = _sampling_value(prompt, raw, creativity, version)
            if value is not None:
                facts[stage] = {"temperature": value, **written(raw)}
    for stage, kind in (("plan", "YuE2GenerateABC"), ("take", "YuE2GenerateMusic")):
        node = first(kind)
        if node is None:
            continue
        inputs = node.get("inputs") or {}
        values = {
            name: _sampling_value(prompt, inputs.get(name), creativity, version) for name in SAMPLING_NAMES
        }
        if all(value is not None for value in values.values()):
            facts[stage] = {name: value for name, value in values.items() if value is not None}
            facts[stage].update(written(*(inputs.get(name) for name in SAMPLING_NAMES)))
    return facts


def prompt_facts(prompt: Mapping[str, Any]) -> dict[str, Any]:
    """The seeds of the template's seed nodes and the writer model."""
    seeds: dict[str, int] = {}
    writer = ""
    for node in prompt.values():
        if not isinstance(node, Mapping):
            continue
        inputs = node.get("inputs") or {}
        title = _text((node.get("_meta") or {}).get("title")).lower()
        if node.get("class_type") in ("PlenioSeed", "SeedNode") and title in SEED_TITLES:
            seed = inputs.get("seed")
            if isinstance(seed, int) and not isinstance(seed, bool):
                seeds.setdefault(SEED_TITLES[title], seed)
        if (
            node.get("class_type") == "PlenioWriterChoice"
            and isinstance(inputs.get("model"), str)
            and not writer
        ):
            writer = (
                Path(inputs["model"].replace("\\", "/"))
                .name.removesuffix(".safetensors")
                .removesuffix(".gguf")
            )
    return {"seeds": seeds, "writer": writer}


def score_facts(score: str) -> dict[str, Any]:
    """Tempo, key and meter from a score's header (cheap: the library has hundreds of songs)."""
    if not score.strip():
        return {}
    tempo = re.search(r"^Q:\s*(?:\d+/\d+=)?(\d+)", score, re.M)
    key = re.search(r"^K:\s*([^\s%]+)", score, re.M)
    meter = re.search(r"^M:\s*([^\s%]+)", score, re.M)
    return {
        "bpm": int(tempo.group(1)) if tempo else None,
        "score_key": key.group(1) if key else "",
        "score_meter": meter.group(1) if meter else "",
    }


def _engine(record: Mapping[str, Any]) -> str:
    for report in record.get("reports") or []:
        engine = (report.get("data") or {}).get("engine")
        if engine:
            return ENGINE_NAMES.get(str(engine), str(engine))
    return ""


def parse_srt(text: str) -> list[dict[str, Any]]:
    """The cues of an SRT file: ``start``, ``end`` and ``text``."""
    cues = []
    for block in re.split(r"\n\s*\n", text.replace("\r\n", "\n").strip()):
        lines = block.split("\n")
        for k, line in enumerate(lines):
            match = _SRT_TIME.search(line)
            if match:
                g = [int(x) for x in match.groups()]
                start = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
                end = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
                cues.append({"start": start, "end": end, "text": "\n".join(lines[k + 1 :]).strip()})
                break
    return cues


@dataclass
class Song:
    """A song of the library. ``record`` is its release record - for other music (``other``) its audio file."""

    id: str
    record: Path
    root: Path
    summary: dict[str, Any]
    files: dict[str, Path] = field(default_factory=dict)
    other: bool = False


def _files(record: Mapping[str, Any], path: Path) -> dict[str, Path]:
    """The song's files by kind (audio, original, cover, pdf, lines, notes, stems), found next to the record."""
    folder = path.parent
    stem = path.name.removesuffix(RECORD_SUFFIX)
    found: dict[str, Path] = {}
    for entry in record.get("files") or []:
        name = _text(entry.get("name"))
        if not name:
            continue
        candidate = folder / name
        role = entry.get("role")
        if role == "original":
            found.setdefault("original", candidate)
        elif role == "cover":
            found.setdefault("cover", candidate)
        elif role == "sheet_music":
            found.setdefault("pdf", candidate)
        elif role == "subtitles":
            found.setdefault(str(entry.get("subtitles") or "lines"), candidate)
        elif role == "stem":
            found.setdefault("stems", candidate.parent)
        elif role is None and entry.get("format") in AUDIO_KINDS and " take " not in name:
            found.setdefault(f"audio_{entry['format']}", candidate)
    # files written next to the record without an entry (or a record moved with its files)
    guesses = {
        "audio_flac": f"{stem}.flac",
        "audio_mp3": f"{stem}.mp3",
        "audio_wav": f"{stem}.wav",
        "original": f"{stem} (original).flac",
        "cover": f"{stem}.jpg",
        "pdf": f"{stem}.pdf",
        "lines": f"{stem} (lines).srt",
        "notes": f"{stem} (notes).srt",
        "sung": f"{stem} (sung).srt",
        # the song's page (``song_page.py``): written after the record, so the record does not list it
        "page": f"{stem}.html",
    }
    for kind, name in guesses.items():
        if kind not in found or not found[kind].exists():
            if (folder / name).exists():
                found[kind] = folder / name
    sheet = record.get("sheet_music") or {}
    if "pdf" not in found and sheet.get("file") and (folder / str(sheet["file"])).exists():
        found["pdf"] = folder / str(sheet["file"])
    inside = folder.resolve()
    files = {
        kind: p
        for kind, p in found.items()
        if p.exists() and (p.resolve() == inside or inside in p.resolve().parents)
    }
    for kind in ("audio_flac", "audio_mp3", "audio_wav"):
        if kind in files:
            files.setdefault("audio", files[kind])
    files["record"] = path
    return files


def measured_facts(record: Mapping[str, Any]) -> dict[str, Any] | None:
    """How well the song came out as Export Release measured it (since 1.4.0): the measures' version and the stars -
    for the library's filter, without opening the record again (``None``: not measured at the export)."""
    quality = record.get("quality")
    if not isinstance(quality, Mapping) or not isinstance(quality.get("version"), int):
        return None
    stars = quality.get("stars")
    if isinstance(stars, bool) or not isinstance(stars, (int, float)):
        stars = None
    return {"version": quality["version"], "stars": None if stars is None else float(stars)}


def made_facts(record: Mapping[str, Any]) -> dict[str, Any]:
    """How the song was made (the record's ``made``, since 1.4.0): when its run began and ended, how long it took,
    on what, the lyrics fidelity - for an older record the fidelity from its prompt or its Best Take."""
    made = record.get("made")
    made = made if isinstance(made, Mapping) else {}
    out: dict[str, Any] = {
        key: made[key]
        for key in ("started", "finished", "seconds", "on", "lyrics_fidelity")
        if made.get(key) is not None
    }
    if "lyrics_fidelity" not in out:
        prompt = record.get("prompt")
        for node in (prompt or {}).values() if isinstance(prompt, Mapping) else ():
            inputs = node.get("inputs") if isinstance(node, Mapping) else None
            for name, value in (inputs or {}).items() if isinstance(inputs, Mapping) else ():
                if str(name).split(".")[-1] == "fidelity" and isinstance(value, str) and value:
                    out["lyrics_fidelity"] = value.split(" ", 1)[0].lower()  # 'high - best of 2 takes': high
        if "lyrics_fidelity" not in out:
            for report in record.get("reports") or []:
                data = report.get("data") if isinstance(report, Mapping) else None
                if report.get("kind") == "best_take" and isinstance(data, Mapping) and data.get("level"):
                    out["lyrics_fidelity"] = str(data["level"])
    return out


def summarize(record: Mapping[str, Any], path: Path, root: Path) -> Song:
    """A song of the library from its record: what the list shows, sorts and searches."""
    documents = record.get("documents") or {}

    def doc(kind: str) -> str:
        entry = documents.get(kind)
        return _text(entry.get("text")) if isinstance(entry, Mapping) else ""

    prompt = record.get("prompt") or {}
    audio = record.get("audio") or {}
    loudness = (audio.get("loudness") or [{}])[0] or {}
    tags = dict(audio.get("tags") or {})
    brief = brief_facts(prompt, plenio_version(record))
    files = _files(record, path)
    lyrics = doc("lyrics")
    created = _text(record.get("created"))
    title = _text(record.get("title")) or doc("title") or path.name.removesuffix(RECORD_SUFFIX)
    lyrics_sha = (
        (documents.get("lyrics") or {}).get("sha256", "")
        if isinstance(documents.get("lyrics"), Mapping)
        else ""
    )
    score_sha = (
        (documents.get("score") or {}).get("sha256", "")
        if isinstance(documents.get("score"), Mapping)
        else ""
    )
    model = _engine(record)
    summary: dict[str, Any] = {
        "title": title,
        "created": created,
        "made": made_facts(record),
        "measured": measured_facts(record),
        "year": created[:4],
        "seconds": float(audio.get("seconds") or 0.0),
        "model": model,
        "kind": brief.get("kind") or ("master" if not model else "song"),
        "brief": brief,
        "genre": brief.get("genre") or _text(tags.get("genre")),
        "mood": brief.get("mood", ""),
        "language": brief.get("language", ""),
        "vocals": brief.get("vocals", ""),
        "instrumental": brief.get("vocals") == "instrumental",
        "arrangement": brief.get("arrangement", "off"),
        "template": brief.get("template", ""),
        "style": doc("style"),
        "lyrics": subtitle_rules.plain_lyrics(lyrics) if lyrics else "",
        "loudness": {
            "lufs": loudness.get("integrated_lufs"),
            "true_peak": loudness.get("true_peak_dbtp"),
            "range": loudness.get("loudness_range_lu"),
        },
        "tags": {k: v for k, v in tags.items() if k != "lyrics"},
        "plenio": _text((record.get("versions") or {}).get("plenio")),
        "folder": path.parent.relative_to(root).as_posix() if path.parent.is_relative_to(root) else "",
        "file": path.name.removesuffix(RECORD_SUFFIX),
        # the takes of one song: one title (a repeated title's number left out), one lyrics, one score
        "takes_key": hashlib.sha1(
            f"{base_title(title).lower()}|{lyrics_sha}|{score_sha}".encode()
        ).hexdigest()[:10]
        if (lyrics_sha or score_sha)
        else "",
        "has": {
            "audio": "audio" in files,
            # besides a FLAC or WAV: the player can play it instead, for less data over the network
            "mp3": "audio_mp3" in files and files["audio"] != files["audio_mp3"],
            "original": "original" in files,
            "cover": "cover" in files,
            "pdf": "pdf" in files,
            "lines": "lines" in files,
            "notes": "notes" in files,
            "stems": "stems" in files,
            "timing": bool(record.get("timing")),
            "sung": any(isinstance(t, Mapping) and t.get("sung") for t in record.get("timing") or []),
            "score": bool(doc("score")),
        },
        **score_facts(doc("score")),
        **prompt_facts(prompt),
        # the brief's creativity as the record has it, on the scale of the version that made it
        "sampling": sampling_facts(
            prompt, _brief_node(prompt)[1].get("creativity", 50), plenio_version(record)
        ),
    }
    song = Song(song_id(path, root), path, root, summary, files)
    summary["id"] = song.id
    return song


def distinguish_titles(songs: Iterable[Song]) -> None:
    """Songs of one title get `` (2)``, `` (3)`` ... in the order they were made - as Export Release numbers a
    title another song has since 1.1.0; songs exported before kept one title (owner's request 2026-10-22: every
    cover of a song had the same title in the list). The record's own title stays ``recorded_title``."""
    plenio = [song for song in songs if not song.other]
    groups: dict[str, list[Song]] = {}
    for song in plenio:
        groups.setdefault(str(song.summary.get("title") or "").strip().casefold(), []).append(song)
    used = {str(song.summary.get("title") or "").strip().casefold() for song in plenio}
    for group in groups.values():
        if len(group) < 2:
            continue
        group.sort(key=lambda song: (str(song.summary.get("created") or ""), song.id))
        for song in group[1:]:
            title = str(song.summary.get("title") or "")
            shown = numbered_title_in(title, used)
            used.add(shown.strip().casefold())
            # a new dict: the cache keeps the summary as the record has it
            song.summary = {**song.summary, "title": shown, "recorded_title": title}


def other_detail(song: Song) -> dict[str, Any]:
    """The page of a song not from Plenio: its tags, its lyrics, timed lines from its ``.lrc``/``.srt``."""
    lines = other_music.timed_lines(song.files)
    return {
        **song.summary,
        "documents": {
            "title": str(song.summary.get("title") or ""),
            "lyrics": str(song.summary.get("lyrics") or ""),
        },
        "lyrics_raw": "",
        "notation": {},
        "lines": lines,
        "timing_source": song.files["lines"].suffix.lstrip(".") if lines else "",
        "files": {kind: path.name for kind, path in song.files.items()},
        "owned_files": [
            path.relative_to(song.record.parent.resolve()).as_posix() for path in owned_files(song)
        ],
        "retire_to": str(retired_folder(song)),
        "record_path": "",
        "file_path": str(song.record),
        "licences": [],
        "versions": {},
    }


def sung_detail(found: Any) -> dict[str, Any]:
    """What the take sings, as heard (the record's ``timing[].sung``, ``core.subtitles.SungLyrics``): its timed
    lines, its text and how far it follows the lyrics - empty for a song exported before it was kept."""
    if not isinstance(found, Mapping) or not found.get("lines"):
        return {}
    return {
        "lines": list(found.get("lines") or []),
        "text": str(found.get("text") or ""),
        "written_heard": found.get("written_heard"),
        "extra_words": found.get("extra_words"),
        "not_sung": [str(x) for x in found.get("not_sung") or []],
        "sections": [dict(s) for s in found.get("sections") or [] if isinstance(s, Mapping)],
        # the words the writer model found misheard, each with the word heard (1.2.0's Check Sung Words, retired
        # since: songs exported with it keep them)
        "corrected": [dict(c) for c in found.get("corrected") or [] if isinstance(c, Mapping)],
    }


def timing_note(record: Mapping[str, Any]) -> str:
    """Why a song has no measured lyrics times, as far as its record tells."""
    status = record.get("subtitles")
    if isinstance(status, Mapping):
        if not status.get("wanted"):
            return "Lyrics subtitles were off when the song was exported."
        why = [str(x) for x in status.get("why") or [] if x]
        if why:
            return f"No lyrics times were measured when the song was exported - {why[0]}."
    version = _text((record.get("versions") or {}).get("plenio"))
    major = re.match(r"(\d+)\.", version)
    if major and int(major.group(1)) < 1:
        return f"The song was exported by Plenio {version}, before songs kept their lyrics times."
    return (
        "No lyrics times were measured when the song was exported (most often: the lyrics ASR could not run "
        "- the export's summary said why)."
    )


def _estimated_lines(
    record: Mapping[str, Any], score: str, lyrics: str, found: Mapping[str, Any]
) -> list[Any]:
    """The lyrics lines at the score's times, carried into the recording by the estimate ``found``
    (``core.subtitles.time_by_score``); none when the lyrics do not lie on the score."""
    from ..core.score import canonical, lyric_layout
    from .align import score_to_audio

    try:
        parsed = canonical.from_abc(score)
        layout = lyric_layout.layout(parsed, lyrics, _spans(record) or None)
        seconds = float((record.get("audio") or {}).get("seconds") or 0.0)
        timed = subtitle_rules.time_by_score(
            lyrics,
            score=parsed,
            layout=layout,
            duration=seconds or parsed.seconds(parsed.total) + 60.0,
            to_audio=lambda at: score_to_audio(at, dict(found)),
        )
    except (PlenioError, ValueError, KeyError, TypeError):
        return []
    return list(timed.to_timing()["lines"])


def song_detail(song: Song, cache: Path | None = None) -> dict[str, Any]:
    """Everything the song's page needs: the documents, the notation, the times, the files. With ``cache``,
    a song without measured times gets the score's place in its recording estimated (``plenio.player.align``),
    so that its notation follows the music - and its lyrics lines, where they lie on the score, follow it too
    (``timing_source`` ``estimated``)."""
    if song.other:
        return other_detail(song)
    record = json.loads(song.record.read_text(encoding="utf-8"))
    documents = record.get("documents") or {}

    def doc(kind: str) -> str:
        entry = documents.get(kind)
        return str(entry.get("text") or "") if isinstance(entry, Mapping) else ""

    score, lyrics = doc("score"), doc("lyrics")
    notation: dict[str, Any] = {}
    if score.strip():
        try:
            from ..core.score import canonical, editor_view

            view = editor_view(score, lyrics or None, _spans(record) or None)
            notation["abc"] = str(view.get("display_abc") or "")
            parsed = canonical.from_abc(score)
            starts = parsed.starts
            notation["tempo"] = parsed.tempo
            notation["sections"] = [
                {
                    "label": section.label,
                    "start": round(parsed.seconds(starts[section.measure]), 3),
                    "bar": section.measure + 1,
                }
                for section in parsed.sections
            ]
            notation["seconds"] = round(parsed.seconds(parsed.total), 3)
        except Exception as error:  # noqa: BLE001 - a song without notation still plays
            notation["error"] = str(error)
    timing = record.get("timing") or []
    lines: list[dict[str, Any]] = []
    source = ""
    sung: dict[str, Any] = {}
    if timing:
        first = timing[0]
        lines, source = list(first.get("lines") or []), str(first.get("timing") or "measured")
        notation["warp"] = first.get("warp")
        sung = sung_detail(first.get("sung"))
    elif "lines" in song.files:
        cues = parse_srt(song.files["lines"].read_text(encoding="utf-8", errors="replace"))
        notes = (
            parse_srt(song.files["notes"].read_text(encoding="utf-8", errors="replace"))
            if "notes" in song.files
            else []
        )
        lines = [_line_from_cues(cue, notes) for cue in cues]
        source = "subtitles"
    if notation.get("abc") and cache is not None and "audio" in song.files:
        from .align import cached_estimate, cached_follow

        # the notation follows the music: its path through the recording, near the measured warp (or, without
        # measured times, near the whole song's shift)
        measured = notation.get("warp") if timing else None
        found = cached_follow(song.files["audio"], score, cache, measured)
        notation["followed"] = found is not None
        if found is None and not timing:
            found = cached_estimate(song.files["audio"], score, cache)
        if found:
            notation["warp"] = measured or found["warp"]
            notation["anchors"] = found["anchors"]
            if not timing:
                notation["estimated"] = True
            if not lines and lyrics.strip():
                lines = _estimated_lines(record, score, lyrics, found)
                source = "estimated" if lines else source
    return {
        **song.summary,
        "documents": {kind: doc(kind) for kind in ("title", "style", "lyrics", "artwork_prompt")},
        "lyrics_raw": lyrics,
        "notation": notation,
        "lines": lines,
        "sung": sung,
        "timing_source": source,
        "timing_note": timing_note(record) if source in ("", "estimated") else "",
        "files": {kind: path.name for kind, path in song.files.items() if kind != "stems"},
        "owned_files": [
            path.relative_to(song.record.parent.resolve()).as_posix() for path in owned_files(song)
        ],
        "retire_to": str(retired_folder(song)),
        "record_path": str(song.record),
        "licences": record.get("licences") or [],
        "versions": record.get("versions") or {},
    }


def _line_from_cues(cue: Mapping[str, Any], notes: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """A timed line from an SRT pair: the notes file's cues inside the line give its units (by the length of
    the text they show)."""
    text = str(cue["text"]).replace("\n", " ")
    units = []
    for note in notes:
        if cue["start"] - 0.01 <= note["start"] < cue["end"] - 0.005:
            shown = str(note["text"]).replace("\n", " ")
            if text.startswith(shown.rstrip()):
                units.append([note["start"], len(shown)])
    return {
        "text": text,
        "start": cue["start"],
        "end": cue["end"],
        "units": units or [[cue["start"], len(text)]],
    }


def owned_files(song: Song) -> list[Path]:
    """Every file of the song in its record's folder: the record, the files it lists (the audio of every take,
    the unmastered take, the cover, the sheet music, the subtitles, the stems) and the files Export Release
    names after it. Nothing outside the record's folder. Other music: the audio and its own lyrics and cover."""
    if song.other:
        return other_music.owned(song.record, song.files)
    folder = song.record.parent.resolve()
    record = json.loads(song.record.read_text(encoding="utf-8"))
    candidates = [song.record]
    for entry in record.get("files") or []:
        name = _text(entry.get("name")) if isinstance(entry, Mapping) else ""
        if name:
            candidates.append(song.record.parent / name)
    candidates.extend(path for kind, path in song.files.items() if kind != "stems")
    found: list[Path] = []
    seen: set[Path] = set()
    for path in candidates:
        resolved = path.resolve()
        if resolved in seen or not resolved.is_file() or folder not in resolved.parents:
            continue
        seen.add(resolved)
        found.append(resolved)
    return found


def retired_folder(song: Song) -> Path:
    """Where the song's files go when it is retired: ``_retired`` below its library folder, in the same
    subfolders as before (``output/plenio/x`` -> ``output/_retired/plenio/x``)."""
    folder = song.record.parent.resolve()
    root = song.root.resolve()
    relative = folder.relative_to(root) if folder.is_relative_to(root) else Path(folder.name)
    return root / RETIRED_DIR / relative


def _retrying(action: Callable[[], object]) -> None:
    # the server may be reading the file for the browser at this moment, and Windows refuses then
    for attempt in range(8):
        try:
            action()
            return
        except PermissionError:
            if attempt == 7:
                raise
            time.sleep(0.25)


def remove_song(song: Song, action: str) -> dict[str, Any]:
    """Retire the song (``retire``: its files moved to :func:`retired_folder`, subfolders kept) or delete its
    files for good (``delete``). Empty subfolders the song leaves behind (its stems) go too."""
    if action not in ("retire", "delete"):
        raise ValueError(f"unknown action {action!r}")
    folder = song.record.parent.resolve()
    files = owned_files(song)
    target = retired_folder(song)
    if action == "retire" and any((target / f.relative_to(folder)).exists() for f in files):
        # a song of the same name was retired before: this one gets a folder of its own
        target = target / time.strftime("%Y-%m-%d %H%M%S")
    done: list[str] = []
    for path in files:
        relative = path.relative_to(folder)
        if action == "retire":
            destination = target / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            _retrying(functools.partial(shutil.move, str(path), str(destination)))
        else:
            _retrying(path.unlink)
        done.append(relative.as_posix())
    for parent in sorted({p.parent for p in files if p.parent != folder}, key=lambda p: -len(p.parts)):
        try:
            parent.rmdir()  # only when empty
        except OSError:
            pass
    return {"action": action, "files": done, "folder": str(target) if action == "retire" else None}


def _spans(record: Mapping[str, Any]) -> list[list[int]]:
    """The lyrics lines placed by hand on the score's Song Sheet (kept in the workflow the song was made with)."""
    workflow = record.get("workflow") or {}
    sheets = [
        str((report.get("data") or {}).get("node_id"))
        for report in record.get("reports") or []
        if report.get("kind") == "song_sheet" and (report.get("data") or {}).get("documents", {}).get("score")
    ]
    nodes = {str(n.get("id")): n for n in workflow.get("nodes") or [] if isinstance(n, Mapping)}
    for sheet in sheets:
        spans = ((nodes.get(sheet) or {}).get("properties") or {}).get("plenio_lyric_spans")
        if isinstance(spans, list) and spans:
            return [list(map(int, s)) for s in spans if isinstance(s, list) and len(s) >= 2]
    return []


class Library:
    """The songs below ``folders``; summaries cached on disk by the record's size and time. In the folders of
    ``other``, audio files that no record owns are songs too.

    Reading the folders again never holds up a reader: :meth:`songs`, :meth:`song` ... answer with the songs as last
    read and, when those are older than :data:`REFRESH_S`, have them read again in the background - only the very
    first time does a reader wait. Before (2026-10-26, 2958 records), every request after 15 s read them all again
    while it held one lock - also the audio a song streams, and Live Play asked every two seconds."""

    def __init__(self, folders: Iterable[Path], cache: Path | None = None, other: Iterable[Path] = ()):
        self.folders = [Path(f).resolve() for f in folders]
        self.other = {Path(f).resolve() for f in other}
        # the folders it started with (--folder, the default): back to them when Settings forgets its own
        self.started_with = list(self.folders)
        self.extra: list[Path] = []
        """Folders read besides the library's own - the party songs' when they are outside them (``maker``); not
        listed in Settings, and not read where one of the library's folders holds them already."""
        self.cache_path = cache
        self._lock = threading.Lock()
        """One reading of the folders at a time."""
        self._background_lock = threading.Lock()
        self._background: threading.Thread | None = None
        self._first = threading.Event()
        self._songs: dict[str, Song] = {}
        self._cache: dict[str, Any] = {}
        self._scanned = 0.0
        self._signature: tuple[Any, ...] | None = None
        self._listing: tuple[int, list[dict[str, Any]]] = (-1, [])
        # when each song appeared (its record's or file's time), and the wall clock at the last scan's start
        self._appeared: dict[str, float] = {}
        self.scan_started = 0.0
        # the records the player's studio made, until a reading finds them (when it was told), and when it did
        self._expected: dict[str, float] = {}
        self._arrived: dict[str, float] = {}
        self.errors: list[str] = []
        self.version = 0
        """Counts the changes of the songs: the page's copy of the library is current while it has this one."""
        self.progress: dict[str, int] = {"done": 0, "total": 0}
        """The records read so far and how many there are, while the folders are read (the first time: shown)."""
        if cache and cache.exists():
            try:
                data = json.loads(cache.read_text(encoding="utf-8"))
                if data.get("version") == CACHE_VERSION:
                    self._cache = data.get("songs") or {}
            except (OSError, ValueError):
                self._cache = {}

    @property
    def ready(self) -> bool:
        """The folders were read at least once."""
        return self._first.is_set()

    def wait_ready(self, timeout: float) -> bool:
        return self._first.wait(timeout)

    def set_folders(self, folders: Iterable[Path], other: Iterable[Path] = ()) -> None:
        """Read other folders from now on (chosen in Settings)."""
        with self._lock:
            self.folders = [Path(f).resolve() for f in folders]
            self.other = {Path(f).resolve() for f in other}
        self.scan(force=True)

    def roots(self) -> list[Path]:
        """The folders read: the library's, and the extra ones none of them holds."""
        found = list(self.folders)
        for extra in self.extra:
            try:
                folder = Path(extra).resolve()
            except OSError:
                continue
            if not any(folder == root or root in folder.parents for root in found):
                found.append(folder)
        return found

    def _walk(
        self,
    ) -> tuple[list[tuple[Path, Path, os.stat_result]], list[tuple[Path, Path, os.stat_result]]]:
        """Every release record below the roots, and in the folders with other music every audio file - each with
        its root and its stat, sorted by path. One pass with ``os.scandir``, which leaves the folders the library
        skips out on the way and has each file's stat from the folder's listing (``rglob`` went into every folder
        and read it twice: 0.34 s against 0.14 s for 44,000 files in 2,900 folders)."""
        records: list[tuple[Path, Path, os.stat_result]] = []
        audio: list[tuple[Path, Path, os.stat_result]] = []
        for root in self.roots():
            other = root in self.other and root in self.folders
            stack = [str(root)]
            while stack:
                try:
                    with os.scandir(stack.pop()) as entries:
                        for entry in entries:
                            try:
                                if entry.is_dir(follow_symlinks=False):
                                    if entry.name not in SKIP_DIRS:
                                        stack.append(entry.path)
                                elif entry.name.endswith(RECORD_SUFFIX):
                                    records.append((root, Path(entry.path), entry.stat()))
                                elif (
                                    other
                                    and os.path.splitext(entry.name)[1].lower() in other_music.AUDIO_SUFFIXES
                                ):
                                    audio.append((root, Path(entry.path), entry.stat()))
                            except OSError:
                                continue
                except OSError:
                    continue
        records.sort(key=lambda found: found[1])
        audio.sort(key=lambda found: found[1])
        return records, audio

    def _other_files(
        self, songs: Iterable[Song], audio: Iterable[tuple[Path, Path, os.stat_result]]
    ) -> Iterable[tuple[Path, Path, os.stat_result]]:
        """The audio files of the folders with other music that no Plenio song owns."""
        owned, stems = other_music.plenio_owned(songs)
        seen: set[Path] = set()
        for root, path, stat in audio:
            resolved = path.resolve()
            if resolved in seen:
                continue
            seen.add(resolved)
            if not other_music.is_plenio_file(path, owned, stems):
                yield root, path, stat

    def scan(self, *, force: bool = False, every: float = 15.0, wait: bool = True) -> None:
        """Read the records again (at most every ``every`` seconds unless ``force``); unchanged ones come from the
        cache. ``wait=False``: in the background - the call returns at once (one reading at a time)."""
        if not force and self._fresh(every):
            return
        if not wait:
            self._in_background(every)
            return
        with self._lock:
            if not force and self._fresh(every):
                return  # read by another thread meanwhile
            self._scan()

    def _fresh(self, every: float) -> bool:
        return self._first.is_set() and time.monotonic() - self._scanned < every

    def _in_background(self, every: float) -> None:
        with self._background_lock:
            if self._background is not None and self._background.is_alive():
                return

            def read() -> None:
                try:
                    self.scan(every=every)
                except Exception:  # noqa: BLE001 - a reader goes on with the songs it has
                    log.exception("Plenio Player: reading the song folders failed")

            self._background = threading.Thread(target=read, name="plenio-library-scan", daemon=True)
            self._background.start()

    def _refresh(self) -> None:
        """For a reader: the songs as last read - read again in the background when they are older than
        :data:`REFRESH_S`; the first time (nothing read yet) the reader waits for them."""
        self.scan(every=REFRESH_S, wait=not self._first.is_set())

    def _scan(self) -> None:
        started = time.time()
        records, audio = self._walk()
        # nothing came, went or changed since the last reading: the songs stay as they are (no 12 MB cache written
        # again, no titles numbered again - a library of thousands is looked through in a fraction of a second)
        signature = (
            tuple(self.roots()),
            tuple(sorted(self.other)),
            tuple((path, stat.st_size, int(stat.st_mtime)) for _, path, stat in records),
            tuple((path, stat.st_size, int(stat.st_mtime)) for _, path, stat in audio),
        )
        if signature == self._signature and self._first.is_set():
            self.scan_started = max(
                [started, *(at for at in self._appeared.values() if at <= started + CLOCK_SLACK)]
            )
            self._scanned = time.monotonic()
            return
        appeared: dict[str, float] = {}
        songs: dict[str, Song] = {}
        cache: dict[str, Any] = {}
        errors: list[str] = []
        read_anew = 0
        self.progress = {"done": 0, "total": len(records)}
        for done, (root, path, stat) in enumerate(records, 1):
            key = path.as_posix()
            stamp = [stat.st_size, int(stat.st_mtime)]
            cached = self._cache.get(key)
            try:
                if cached and cached.get("stamp") == stamp:
                    song = Song(cached["summary"]["id"], path, root, cached["summary"])
                    song.files = {k: Path(v) for k, v in cached["files"].items()}
                else:
                    record = json.loads(path.read_text(encoding="utf-8"))
                    song = summarize(record, path, root)
                    read_anew += 1
                songs[song.id] = song
                appeared[song.id] = max(_appeared(stat), self._arrival(key, path, started))
                cache[key] = {
                    "stamp": stamp,
                    "summary": song.summary,
                    "files": {k: str(v) for k, v in song.files.items()},
                }
            except (OSError, ValueError, KeyError, TypeError) as error:
                errors.append(f"{path.name}: {error}")
            self.progress["done"] = done
        for root, path, stat in self._other_files(list(songs.values()), audio):
            try:
                key = path.as_posix()
                stamp = [stat.st_size, int(stat.st_mtime)]
                cached = self._cache.get(key)
                if cached and cached.get("stamp") == stamp and cached.get("other"):
                    summary = cached["summary"]
                    files = {k: Path(v) for k, v in cached["files"].items()}
                else:
                    summary, files = other_music.summarize_other(path, root, song_id(path, root))
                    read_anew += 1
                song = Song(summary["id"], path, root, summary, files, other=True)
                songs[song.id] = song
                appeared[song.id] = _appeared(stat)
                cache[key] = {
                    "stamp": stamp,
                    "other": True,
                    "summary": summary,
                    "files": {k: str(v) for k, v in files.items()},
                }
            except (OSError, ValueError, KeyError, TypeError) as error:
                errors.append(f"{path.name}: {error}")
        distinguish_titles(songs.values())
        changed_cache = read_anew > 0 or cache.keys() != self._cache.keys()
        self._songs, self._cache, self.errors = songs, cache, errors
        self._appeared = appeared
        self._signature = signature
        self.version += 1
        # "now" for Live Play: no song seen in this scan may count as newer than it on the next question
        self.scan_started = max([started, *(at for at in appeared.values() if at <= started + CLOCK_SLACK)])
        self._scanned = time.monotonic()
        self._first.set()
        if self.cache_path and changed_cache:
            try:
                self.cache_path.parent.mkdir(parents=True, exist_ok=True)
                temp = self.cache_path.with_suffix(".tmp")
                temp.write_text(json.dumps({"version": CACHE_VERSION, "songs": cache}), encoding="utf-8")
                temp.replace(self.cache_path)
            except OSError:
                pass

    def newer(self, since: float) -> list[dict[str, Any]]:
        """The songs that appeared after ``since`` (the wall clock, as :attr:`scan_started` gives it), oldest
        first - for Live Play, which adds the songs ComfyUI makes while the music plays."""
        songs, appeared = self._songs, self._appeared
        found = [(at, songs[i].summary) for i, at in appeared.items() if at > since and i in songs]
        return [summary for _, summary in sorted(found, key=lambda x: x[0])]

    def counts(self) -> dict[Path, list[int]]:
        """Per folder: its Plenio songs and its other music."""
        self._refresh()
        found: dict[Path, list[int]] = {root: [0, 0] for root in self.folders}
        for song in list(self._songs.values()):
            found.setdefault(song.root, [0, 0])[1 if song.other else 0] += 1
        return found

    def songs(self) -> list[dict[str, Any]]:
        """Every song's summary, the newest first (made once per change of the songs)."""
        self._refresh()
        version, listing = self._listing
        if version != self.version:
            listing = sorted(
                (s.summary for s in list(self._songs.values())),
                key=lambda s: s.get("created", ""),
                reverse=True,
            )
            self._listing = (self.version, listing)
        return list(listing)

    def song(self, song_id: str) -> Song | None:
        self._refresh()
        return self._songs.get(song_id)

    def every(self) -> list[Song]:
        """Every song, in no order."""
        self._refresh()
        return list(self._songs.values())

    def expect(self, record: Path) -> None:
        """A release record the player's studio just made (``maker``): the reading that first finds it counts it as
        new from then on. Its file can be older than Live Play's last question - written before its folder was read
        (a party songs' folder outside the library's, added once its first song is made) - and Live Play would
        never take it in."""
        try:
            key = os.path.normcase(str(Path(record).resolve()))
        except OSError:
            return
        now = time.time()
        with self._lock:
            self._expected = {k: at for k, at in self._expected.items() if now - at < EXPECTED_FOR_S}
            self._expected[key] = now

    def _arrival(self, key: str, path: Path, started: float) -> float:
        """When a record the studio made was first read here (the reading's start; 0.0 for any other record).
        Only a record no reading found before: one that came the usual way is new by its own time."""
        at = self._arrived.get(key)
        if at is None and self._expected and key not in self._cache:
            norm = os.path.normcase(str(path))
            if self._expected.pop(norm, None) is not None:
                at = self._arrived[key] = started
        return at or 0.0

    def find_record(self, record: Path) -> Song | None:
        """The song of a release record file (``None``: not in the library)."""
        self._refresh()
        try:
            wanted = Path(record).resolve()
        except OSError:
            return None
        for song in list(self._songs.values()):
            if not song.other and song.record.name == wanted.name and song.record.resolve() == wanted:
                return song
        return None

    def remove(self, song_id: str, action: str) -> dict[str, Any] | None:
        """Retire or delete a song (:func:`remove_song`) and read the folders again; ``None``: no such song."""
        song = self.song(song_id)
        if song is None:
            return None
        try:
            return remove_song(song, action)
        finally:
            self.scan(force=True)
