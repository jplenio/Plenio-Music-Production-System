"""A song's page as one HTML file (GitHub issue 2026-10-28: the full lyrics were hard to copy since the player
shows them timed): everything about the song in one readable place - the lyrics with their sections and the
prompts to copy, every field of the brief, how it was made, the sound, the score and links to its files.

One renderer for two places: Export Release writes ``<name>.html`` next to the song (its links are the file
names beside it), and the Plenio Player renders it for any song of its library, also one exported before
(``/page/<id>``, its links the player's own). Standard library only; the page needs no network: its style and
its copy buttons are inside it.
"""

from __future__ import annotations

import html
import json
import re
from collections.abc import Callable, Mapping, Sequence
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote

from ..core import creativity as creativity_rules

PAGE_SUFFIX = ".html"

Link = Callable[[str, str], str]
"""``link(kind, name)``: the URL of the song's file of that kind (``audio_mp3``, ``cover``, ``record`` ...)."""

FILE_LABELS: tuple[tuple[str, str], ...] = (
    ("audio_flac", "The song (FLAC)"),
    ("audio_mp3", "The song (MP3)"),
    ("audio_wav", "The song (WAV)"),
    ("original", "The unmastered take (FLAC)"),
    ("cover", "Cover art (JPEG)"),
    ("pdf", "Sheet music (PDF)"),
    ("lines", "Lyrics subtitles, whole lines (SRT)"),
    ("notes", "Lyrics subtitles, note by note (SRT)"),
    ("sung", "Lyrics as sung, subtitles (SRT)"),
    ("record", "Plenio record (JSON) - opens the song again in ComfyUI"),
)
FIDELITY_WORDS = {
    "standard": "standard - one take",
    "high": "high - the best of up to two takes for the words",
    "highest": "highest - the best of up to three takes for the words",
}
SEED_LABELS = {"draft": "Draft seed", "arrangement": "Arrangement seed", "take": "Take seed"}
SAMPLING_LABELS = (
    ("writer", "Writer temperature"),
    ("arrangement", "Arrangement temperature"),
    ("plan", "YuE2 plan sampling"),
    ("take", "YuE2 take sampling"),
)
OPEN = "open - the writer chose"


def relative_link(files: Mapping[str, str]) -> Link:
    """Links for the page beside the song: the file names, as the record's folder has them."""

    def link(kind: str, name: str) -> str:
        return quote(files.get(kind) or name)

    return link


def _e(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def clock(seconds: Any) -> str:
    try:
        total = max(0, round(float(seconds)))
    except (TypeError, ValueError):
        return ""
    return f"{total // 60}:{total % 60:02d}"


def span_of(seconds: Any) -> str:
    """``45 s``, ``4 min 33 s``, ``1 h 05 min`` (as the player's song page says it)."""
    try:
        s = max(0, round(float(seconds)))
    except (TypeError, ValueError):
        return ""
    if s < 60:
        return f"{s} s"
    if s < 3600:
        return f"{s // 60} min {s % 60:02d} s"
    return f"{s // 3600} h {(s % 3600) // 60:02d} min"


def date_time(stamp: Any) -> str:
    """A record's time (``2026-10-28T14:05:09+0100``) as ``28 October 2026, 14:05``; as written when unreadable."""
    text = str(stamp or "").strip()
    if not text:
        return ""
    try:
        when = datetime.fromisoformat(re.sub(r"([+-]\d\d)(\d\d)$", r"\1:\2", text))
    except ValueError:
        return text.replace("T", " ")[:16]
    return f"{when.day} {when.strftime('%B %Y')}, {when.strftime('%H:%M')}"


def describe_creativity(value: Any) -> str:
    try:
        number = creativity_rules.creativity_value(value)
    except Exception:  # noqa: BLE001 - a record edited by hand
        return str(value)
    note = (
        ", the default"
        if number == creativity_rules.CREATIVITY_DEFAULT
        else ", 1.4's reference"
        if number == creativity_rules.REFERENCE
        else ""
    )
    return f"{number} - {creativity_rules.creativity_level(number)}{note}"


def describe_sampling(values: Mapping[str, Any]) -> str:
    parts = [f"temperature {values.get('temperature')}"]
    if values.get("top_p") is not None:
        parts.append(f"top-p {values['top_p']}")
    if values.get("top_k") is not None:
        parts.append(f"top-k {values['top_k']}")
    return " · ".join(parts)


Fact = tuple[str, str, str]
"""(label, value, note) - the note in brackets after the value (``default``, ``from the template`` ...)."""


def song_facts(song: Mapping[str, Any]) -> list[Fact]:
    """Every field of the brief the song was made with - as the player's song page lists them
    (``frontend/src/player/songFacts.ts``): a field left empty with its default, marked as one."""
    brief = song.get("brief") or {}
    if not brief.get("kind"):
        return _plain_facts(song)
    sources = brief.get("sources") or {}
    cover = brief.get("kind") == "cover"
    out: list[Fact] = []

    def note_of(name: str) -> str:
        source = sources.get(name)
        return "default" if source == "default" else "from the template" if source == "template" else ""

    def field(label: str, name: str, value: Any = None, empty: str = OPEN) -> None:
        text = str(brief.get(name) or "") if value is None else str(value)
        out.append((label, text, note_of(name)) if text else (label, empty, "default"))

    def scored(label: str, name: str, from_score: str) -> None:
        typed = str(brief.get(name) or "")
        if from_score:
            value = f"{from_score} · {typed}" if typed and typed not in from_score else from_score
            out.append((label, value, note_of(name) if typed else "default - the writer chose"))
        else:
            field(label, name)

    field("Work mode", "mode")
    field("Template", "template", brief.get("template") or "none")
    field("Genre", "genre", brief.get("genre") or song.get("genre") or "")
    field("Mood", "mood")
    if not cover:
        scored("Tempo", "tempo", f"{song['bpm']} BPM" if song.get("bpm") else "")
    elif song.get("bpm"):
        out.append(("Tempo", f"{song['bpm']} BPM", "from the source"))
    if song.get("score_key") or not cover:
        scored("Key", "key", str(song.get("score_key") or ""))
    if song.get("score_meter") or not cover:
        scored("Meter", "meter", str(song.get("score_meter") or ""))
    out.append(("Length", clock(song.get("seconds")), ""))
    if not cover:
        field("Target length", "length")
    field("Vocals", "vocals")
    if brief.get("vocals") == "instrumental":
        field("Melody", "melody")
        field("Lead instrument", "lead_instrument")
    else:
        field("Language", "language", brief.get("language") or song.get("language") or "")
        field("Voice", "voice")
        if not cover or brief.get("vocals") == "new lyrics":
            field("Lyrics theme", "theme")
    if cover:
        field("Harmony", "harmony")
    field("Arrangement", "arrangement", brief.get("arrangement") or song.get("arrangement") or "")
    closeness = brief.get("closeness")
    field(
        "Song flow closeness" if cover else "Genre closeness",
        "closeness",
        "" if closeness is None else str(closeness),
    )
    if cover and brief.get("lyrics_closeness") is not None:
        field("Lyrics closeness", "lyrics_closeness", str(brief["lyrics_closeness"]))
    if cover and brief.get("original_notes") is not None:
        field("Original notes", "original_notes", str(brief["original_notes"]))
    field(
        "Lines under the singing", "lines_under_singing", "on" if brief.get("lines_under_singing") else "off"
    )
    if brief.get("creativity") is not None:
        field("Creativity", "creativity", describe_creativity(brief["creativity"]))
    sampling = song.get("sampling") or {}
    for stage, label in SAMPLING_LABELS:
        values = sampling.get(stage)
        if not isinstance(values, Mapping):
            continue
        if stage == "arrangement" and brief.get("arrangement") in (None, "", "off"):
            continue
        text = (
            str(values.get("temperature"))
            if stage in ("writer", "arrangement")
            else describe_sampling(values)
        )
        out.append((label, text, ""))
    out.append(("Model", str(song.get("model") or "a recording (Enhance & Master)"), ""))
    if song.get("writer"):
        out.append(("Lyrics and score by", str(song["writer"]), ""))
    out.append(("Kind", str(song.get("kind") or ""), ""))
    return out


def _plain_facts(song: Mapping[str, Any]) -> list[Fact]:
    brief = song.get("brief") or {}
    rows = [
        ("Genre", song.get("genre")),
        ("Mood", song.get("mood")),
        ("Tempo", f"{song['bpm']} BPM" if song.get("bpm") else brief.get("tempo")),
        ("Key", song.get("score_key") or brief.get("key")),
        ("Meter", song.get("score_meter") or brief.get("meter")),
        ("Length", clock(song.get("seconds"))),
        ("Language", song.get("language")),
        ("Model", song.get("model") or "a recording (Enhance & Master)"),
        ("Lyrics and score by", song.get("writer")),
        ("Kind", song.get("kind")),
    ]
    return [(label, str(value), "") for label, value in rows if value]


def made_facts(song: Mapping[str, Any]) -> list[Fact]:
    """How it was made: when, how long, on what, the lyrics fidelity (as the player's song page says it)."""
    made = song.get("made") or {}
    out: list[Fact] = []
    when = date_time(made.get("started") or song.get("created"))
    if when:
        out.append(("Made", when, "" if made.get("started") else "when it was saved"))
    if made.get("seconds") is not None:
        out.append(("Making took", span_of(made["seconds"]), ""))
    on = made.get("on")
    if isinstance(on, Mapping):
        if on.get("device") == "gpu" and on.get("gpu"):
            gpu = f"{on['gpu']} · {on['vram_gb']} GB" if on.get("vram_gb") else str(on["gpu"])
            out.append(("Graphics card", gpu, ""))
        else:
            out.append(("Graphics card", "none - made on the processor alone", ""))
        if on.get("cpu"):
            cpu = f"{on['cpu']} · {on['cores']} threads" if on.get("cores") else str(on["cpu"])
            out.append(("Processor", cpu, ""))
        if on.get("ram_gb"):
            out.append(("Memory (RAM)", f"{on['ram_gb']} GB", ""))
    fidelity = made.get("lyrics_fidelity")
    if fidelity:
        out.append(("Lyrics fidelity", FIDELITY_WORDS.get(str(fidelity), str(fidelity)), ""))
    return out


def _prompt_nodes(record: Mapping[str, Any], kinds: Sequence[str]) -> list[Mapping[str, Any]]:
    prompt = record.get("prompt")
    if not isinstance(prompt, Mapping):
        return []
    return [
        node
        for node in prompt.values()
        if isinstance(node, Mapping)
        and node.get("class_type") in kinds
        and isinstance(node.get("inputs"), Mapping)
    ]


def _plain_value(value: Any) -> str:
    """A widget's value as written in the prompt; a link to another node has none of its own."""
    if isinstance(value, (list, dict)) or value is None:
        return ""
    if isinstance(value, bool):
        return "on" if value else "off"
    return str(value)


IMAGE_NODES = ("VAEDecode", "PreviewImage", "SaveImage", "EmptyFlux2LatentImage", "EmptyLatentImage")
"""Nodes of a block that makes a picture: its model is the cover art's."""


def _block(node_id: Any) -> str:
    """``"21:1001"`` -> ``"21"``: the block (subgraph) a node of the prompt belongs to."""
    return str(node_id).split(":", 1)[0] if ":" in str(node_id) else ""


def model_facts(record: Mapping[str, Any]) -> list[Fact]:
    """The model files the song was made with: the music model, the cover art's and the LoRAs (a LoRA loader
    the run bypassed is not in its prompt)."""
    prompt = record.get("prompt")
    if not isinstance(prompt, Mapping):
        return []
    picture_blocks = {
        _block(node_id)
        for node_id, node in prompt.items()
        if isinstance(node, Mapping) and node.get("class_type") in IMAGE_NODES and _block(node_id)
    }
    out: list[Fact] = []
    seen: set[str] = set()
    for node_id, node in prompt.items():
        if not isinstance(node, Mapping) or node.get("class_type") not in (
            "CheckpointLoaderSimple",
            "UNETLoader",
        ):
            continue
        inputs = node.get("inputs") or {}
        name = _plain_value(inputs.get("ckpt_name") or inputs.get("unet_name"))
        if name and name not in seen:
            seen.add(name)
            picture = _block(node_id) in picture_blocks
            out.append(("Cover art model" if picture else "Music model", name, ""))
    for node in _prompt_nodes(record, ("LoraLoader", "LoraLoaderModelOnly")):
        inputs = node["inputs"]
        name = _plain_value(inputs.get("lora_name"))
        if not name:
            continue
        strengths = [
            f"{part} {inputs[key]}"
            for key, part in (("strength_model", "sound"), ("strength_clip", "plan"))
            if isinstance(inputs.get(key), (int, float)) and inputs.get(key)
        ]
        out.append(("LoRA", name, ", ".join(strengths)))
    for node in _prompt_nodes(record, ("PlenioLoras",)):
        inputs = node["inputs"]
        for slot in range(1, 9):
            name = _plain_value(inputs.get(f"lora_{slot}"))
            strength = inputs.get(f"strength_{slot}")
            if name and name != "none" and isinstance(strength, (int, float)) and strength:
                out.append(("LoRA", name, f"strength {strength}"))
    return out


def mastering_facts(record: Mapping[str, Any]) -> list[Fact]:
    """The finish the song had: EQ, loudness and dynamics, HQ mastering."""
    out: list[Fact] = []
    for node in _prompt_nodes(record, ("PlenioEQ",)):
        inputs = node["inputs"]
        mode = _plain_value(inputs.get("mode"))
        preset = _plain_value(inputs.get("mode.preset"))
        if mode:
            out.append(("EQ", f"{mode} · {preset}" if preset else mode, ""))
        break
    for node in _prompt_nodes(record, ("PlenioLoudness",)):
        inputs = node["inputs"]
        for key, label in (("target", "Loudness target"), ("compression", "Dynamics")):
            value = _plain_value(inputs.get(key))
            if value:
                out.append((label, value, ""))
        break
    for node in _prompt_nodes(record, ("PlenioHQMastering",)):
        value = _plain_value(node["inputs"].get("hq_mastering"))
        if value:
            out.append(("HQ mastering", value, ""))
        break
    return out


# --- the page --------------------------------------------------------------------------------------------------
STYLE = """
:root{--bg:#f6f5f2;--card:#fff;--ink:#1f2328;--muted:#5f6670;--line:#e3e1dc;--accent:#5b4bd6;--accent-ink:#fff;
--chip:#eeecf9;--code:#f3f2ef}
@media (prefers-color-scheme:dark){:root{--bg:#121318;--card:#1b1d24;--ink:#e9e9ee;--muted:#a3a8b3;--line:#2c2f39;
--accent:#8f82ff;--accent-ink:#121318;--chip:#272a3a;--code:#15171d}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:980px;margin:0 auto;padding:28px 16px 64px}
a{color:var(--accent)}
header.hero{display:grid;grid-template-columns:220px 1fr;gap:28px;align-items:center;margin-bottom:22px}
header.hero img{width:220px;height:220px;object-fit:cover;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
header.hero.no-cover{grid-template-columns:1fr}
.kicker{margin:0;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700;color:var(--accent)}
h1{margin:4px 0 6px;font-size:clamp(28px,5vw,44px);line-height:1.1}
.by{margin:0 0 10px;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px;padding:0;list-style:none}
.chips li{background:var(--chip);border-radius:999px;padding:3px 11px;font-size:13px}
audio{width:100%;max-width:520px}
nav.toc{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0 22px;font-size:14px}
section.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:0 0 16px}
section.card h2{margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}
.bar h3{margin:0 auto 0 0;font-size:16px}
button.copy{font:inherit;font-size:13px;border:1px solid var(--line);background:transparent;color:var(--ink);
border-radius:999px;padding:4px 12px;cursor:pointer}
button.copy:hover{border-color:var(--accent);color:var(--accent)}
button.copy.done{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:15px/1.6 inherit;font-family:inherit}
pre.lyrics{font-size:16px;line-height:1.7}
pre.code{background:var(--code);border-radius:10px;padding:12px 14px;font:13px/1.5 ui-monospace,Consolas,monospace;
max-height:420px;overflow:auto}
.prompt+.prompt{margin-top:18px}
dl{display:grid;grid-template-columns:minmax(150px,max-content) 1fr;gap:6px 18px;margin:0}
dt{color:var(--muted)}
dd{margin:0}
dd small{color:var(--muted)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid section.card{margin:0}
details summary{cursor:pointer;color:var(--muted);margin:14px 0 8px}
ul.files{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.rating{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:baseline;margin:-4px 0 12px}
.rating span{display:inline-flex;gap:8px;align-items:baseline}
.stars{font-size:22px;letter-spacing:2px;color:#e8a317}
.measured .stars{opacity:.45}
.rating small,.parts small{color:var(--muted)}
.parts{display:grid;grid-template-columns:minmax(150px,max-content) 1fr 90px;gap:6px 14px;align-items:center;margin:0}
.parts .meter{height:6px;border-radius:9px;background:var(--line);overflow:hidden}
.parts .meter i{display:block;height:100%;background:var(--accent)}
.parts .low i{background:#e8a317}
ul.files small{color:var(--muted)}
.hint{color:var(--muted);font-size:14px;margin:10px 0 0}
footer{color:var(--muted);font-size:13px;text-align:center;margin-top:28px}
@media (max-width:720px){header.hero{grid-template-columns:1fr}header.hero img{width:100%;height:auto;max-width:320px}
.grid{grid-template-columns:1fr}dl{grid-template-columns:1fr}dt{margin-top:6px}}
@media print{nav.toc,button.copy,audio{display:none}section.card{break-inside:avoid}body{background:#fff}}
"""

SCRIPT = """
document.querySelectorAll('button.copy').forEach(function (button) {
  button.addEventListener('click', function () {
    var source = document.getElementById(button.dataset.copy);
    var text = source ? (source.dataset.text || source.textContent) : '';
    var done = function () {
      var label = button.textContent;
      button.textContent = 'Copied';
      button.classList.add('done');
      setTimeout(function () { button.textContent = label; button.classList.remove('done'); }, 1400);
    };
    var fallback = function () {
      var area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(area);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  });
});
"""


def _dl(facts: Sequence[Fact]) -> str:
    rows = []
    for label, value, note in facts:
        extra = f" <small>({_e(note)})</small>" if note else ""
        rows.append(f"<dt>{_e(label)}</dt><dd>{_e(value)}{extra}</dd>")
    return "<dl>" + "".join(rows) + "</dl>"


def _copyable(element_id: str, title: str, text: str, *, kind: str = "prompt", button: str = "Copy") -> str:
    css = "lyrics" if kind == "lyrics" else "code" if kind == "code" else ""
    return (
        f'<div class="prompt"><div class="bar"><h3>{_e(title)}</h3>'
        f'<button class="copy" type="button" data-copy="{_e(element_id)}">{_e(button)}</button></div>'
        f'<pre id="{_e(element_id)}" class="{css}">{_e(text)}</pre></div>'
    )


def _card(anchor: str, title: str, body: str) -> str:
    return f'<section class="card" id="{_e(anchor)}"><h2>{_e(title)}</h2>{body}</section>'


def _stars(value: float) -> str:
    """★★★½☆ - the stars in text (without numpy: the page is written where the player runs too)."""
    full = int(value)
    half = value - full >= 0.5
    return "★" * full + ("½" if half else "") + "☆" * (5 - full - (1 if half else 0))


def rating_html(quality: Mapping[str, Any] | None, rating: float | None) -> tuple[str, str]:
    """The ratings under the title - rated by ear, clearly; measured, faded - and the measures' card (owner's
    request 2026-10-29: the measure is a pre-fill, a hint where to listen first; only listening tells)."""
    measured = quality.get("stars") if isinstance(quality, Mapping) else None
    line = []
    if isinstance(rating, (int, float)):
        line.append(
            f'<span class="by-ear" title="Rated by ear"><b class="stars">{_stars(float(rating))}</b>'
            f"<small>{float(rating):g} of 5, rated by ear</small></span>"
        )
    if isinstance(measured, (int, float)):
        line.append(
            '<span class="measured" title="Measured from the sound and the record - a hint, not the verdict">'
            f'<b class="stars">{_stars(float(measured))}</b><small>{float(measured):g} of 5, measured</small></span>'
        )
    head = f'<p class="rating">{"".join(line)}</p>' if line else ""
    parts = [p for p in (quality or {}).get("parts") or [] if isinstance(p, Mapping)]
    if not parts:
        return head, ""
    rows = []
    for part in parts:
        score = part.get("score")
        width = f"{round(float(score) * 100)}%" if isinstance(score, (int, float)) else "0%"
        # a weak measure in amber, what came out well in the accent
        kind = " low" if isinstance(score, (int, float)) and score < 0.6 else ""
        rows.append(
            f'<dt title="{_e(part.get("note") or "")}">{_e(part.get("label"))}</dt>'
            f"<dd>{_e(part.get('value'))}</dd>"
            f'<dd class="meter{kind}"><i style="width:{width}"></i></dd>'
        )
    body = (
        f'<dl class="parts">{"".join(rows)}</dl>'
        '<p class="hint">Measured from the sound and the record: how well the lyrics are sung as written, how '
        "clean the harmony is, how steady the beat - and what went wrong (an ending cut off, holes, clipping). A "
        "hint where to listen first: only listening tells how good a song is.</p>"
    )
    return head, body


def render(
    song: Mapping[str, Any],
    record: Mapping[str, Any],
    link: Link,
    *,
    in_player: bool = False,
    rating: float | None = None,
    quality: Mapping[str, Any] | None = None,
) -> str:
    """The page. ``song``: the player's detail of the song (``library.song_detail``); ``record``: its release
    record; ``link``: the URL of a file of the song. ``in_player``: the player shows it (its links are the
    player's; the page beside the song says how to open the song again). ``rating``: the stars it was given by
    ear; ``quality``: how well it came out, measured (else the record's)."""
    files: dict[str, str] = dict(song.get("files") or {})
    sheet = record.get("sheet_music")
    if not in_player and "pdf" not in files and isinstance(sheet, Mapping) and sheet.get("file"):
        # beside the song: an open ComfyUI page draws the PDF just after the export (the player lists what is)
        files["pdf"] = str(sheet["file"])
    documents: Mapping[str, Any] = song.get("documents") or {}
    title = str(song.get("title") or documents.get("title") or "Untitled")
    tags: Mapping[str, Any] = song.get("tags") or {}
    cover = song.get("kind") == "cover"
    kicker = "Cover song" if cover else "Song" if song.get("model") else "Recording"
    created = date_time((song.get("made") or {}).get("started") or song.get("created"))
    by = " · ".join(str(tags[k]) for k in ("artist", "album") if tags.get(k))
    chips = [
        clock(song.get("seconds")),
        f"{song['bpm']} BPM" if song.get("bpm") else "",
        str(song.get("score_key") or ""),
        str(song.get("genre") or ""),
        str(song.get("model") or ""),
    ]
    audio_kind = next((k for k in ("audio_mp3", "audio_flac", "audio_wav") if files.get(k)), "")
    measured = quality if quality is not None else record.get("quality")
    rating_line, rating_card = rating_html(measured if isinstance(measured, Mapping) else None, rating)
    hero = [
        f'<header class="hero{"" if files.get("cover") else " no-cover"}">',
        f'<img src="{_e(link("cover", files["cover"]))}" alt="Cover of {_e(title)}">'
        if files.get("cover")
        else "",
        "<div>",
        f'<p class="kicker">{_e(kicker)}{" · " + _e(created) if created else ""}</p>',
        f"<h1>{_e(title)}</h1>",
        f'<p class="by">{_e(by)}</p>' if by else "",
        '<ul class="chips">' + "".join(f"<li>{_e(c)}</li>" for c in chips if c) + "</ul>",
        rating_line,
        f'<audio controls preload="none" src="{_e(link(audio_kind, files[audio_kind]))}"></audio>'
        if audio_kind
        else "",
        "</div></header>",
    ]
    sections: list[tuple[str, str, str]] = []
    # the lyrics: as written, with their sections - what goes into a Song Sheet again
    raw = str(song.get("lyrics_raw") or documents.get("lyrics") or "").strip()
    plain = str(song.get("lyrics") or "").strip()
    if raw:
        body = _copyable(
            "lyrics", "As written, with the sections", raw, kind="lyrics", button="Copy the lyrics"
        )
        if plain and plain != raw:
            body += (
                f'<p class="hint"><button class="copy" type="button" data-copy="lyrics-plain">'
                "Copy without the section tags</button></p>"
                f'<pre id="lyrics-plain" hidden>{_e(plain)}</pre>'
            )
        sung = song.get("sung") or {}
        if isinstance(sung, Mapping) and str(sung.get("text") or "").strip():
            share = sung.get("written_heard")
            heard = (
                f" - {round(float(share) * 100)} % of the words sung as written"
                if isinstance(share, (int, float))
                else ""
            )
            body += (
                f"<details><summary>As the take sings them, heard when the song was exported{_e(heard)}</summary>"
                + _copyable("sung", "As sung", str(sung["text"]).strip(), kind="lyrics")
                + "</details>"
            )
        sections.append(("lyrics", "Lyrics", body))
    elif song.get("model"):
        sections.append(("lyrics", "Lyrics", '<p class="hint">An instrumental - no lyrics.</p>'))
    prompts = [
        (
            "style",
            "Style - what the music model was given",
            str(documents.get("style") or song.get("style") or ""),
        ),
        (
            "about",
            "What the song is about - the brief",
            str((song.get("brief") or {}).get("description") or ""),
        ),
        ("artwork", "The cover's prompt", str(documents.get("artwork_prompt") or "")),
    ]
    prompt_html = "".join(_copyable(key, label, text.strip()) for key, label, text in prompts if text.strip())
    if prompt_html:
        sections.append(("prompts", "Style and prompts", prompt_html))
    facts = song_facts(song)
    made = made_facts(song)
    models = model_facts(record)
    seeds = [
        (SEED_LABELS.get(str(name), str(name)), str(value), "")
        for name, value in (song.get("seeds") or {}).items()
    ]
    if rating_card:
        sections.append(("rating", "How it came out, measured", rating_card))
    if facts:
        sections.append(("song", "The song", _dl(facts)))
    if made or models or seeds:
        sections.append(("made", "How it was made", _dl([*made, *models, *seeds])))
    loudness = song.get("loudness") or {}
    sound: list[Fact] = []
    for key, label, unit in (
        ("lufs", "Loudness", "LUFS"),
        ("true_peak", "True peak", "dBTP"),
        ("range", "Loudness range", "LU"),
    ):
        value = loudness.get(key)
        if isinstance(value, (int, float)):
            sound.append((label, f"{value:.1f} {unit}", ""))
    sound += mastering_facts(record)
    if sound:
        sections.append(("sound", "The sound", _dl(sound)))
    score = str(((song.get("notation") or {}).get("abc")) or "").strip()
    if score:
        body = _copyable("score", "The score (ABC notation)", score, kind="code")
        if files.get("pdf"):
            body += f'<p class="hint"><a href="{_e(link("pdf", files["pdf"]))}">The sheet music (PDF)</a></p>'
        sections.append(("score", "Score", body))
    sizes = {
        str(entry.get("name")): entry.get("bytes")
        for entry in record.get("files") or []
        if isinstance(entry, Mapping)
    }
    items = []
    for kind, label in FILE_LABELS:
        name = files.get(kind)
        if not name:
            continue
        size = sizes.get(name)
        weight = f" · {size / 2**20:.1f} MB" if isinstance(size, (int, float)) and size >= 2**20 else ""
        items.append(
            f'<li><a href="{_e(link(kind, name))}">{_e(label)}</a> <small>{_e(name)}{_e(weight)}</small></li>'
        )
    again = (
        "Open the song again in ComfyUI: Open in ComfyUI on its page in the Plenio Player, or drag its FLAC or "
        "its record (.plenio.json) onto the ComfyUI page."
        if in_player
        else "Open the song again in ComfyUI: drag its FLAC or its record (.plenio.json) onto the ComfyUI page, "
        "or File › Continue a Plenio song…"
    )
    if items:
        sections.append(
            ("files", "Files", f'<ul class="files">{"".join(items)}</ul><p class="hint">{_e(again)}</p>')
        )
    versions: Mapping[str, Any] = song.get("versions") or {}
    licences = [str(x) for x in song.get("licences") or []]
    footer = " · ".join(
        [
            *(
                f"{'Plenio' if name == 'plenio' else 'ComfyUI' if name == 'comfyui' else name} {value}"
                for name, value in versions.items()
                if name in ("plenio", "comfyui") and value
            ),
            *(f"Licence: {licence}" for licence in licences),
        ]
    )
    toc = '<nav class="toc">' + "".join(f'<a href="#{_e(a)}">{_e(t)}</a>' for a, t, _ in sections) + "</nav>"
    # the facts side by side where there is room
    blocks = []
    pair = [s for s in sections if s[0] in ("song", "made")]
    for anchor, label, body in sections:
        if anchor == "made" and len(pair) == 2:
            continue
        if anchor == "song" and len(pair) == 2:
            blocks.append('<div class="grid">' + "".join(_card(a, t, b) for a, t, b in pair) + "</div>")
            continue
        blocks.append(_card(anchor, label, body))
    made_with = "Made with the Plenio Music Production System for ComfyUI" + (
        f" · {footer}" if footer else ""
    )
    return "\n".join(
        [
            "<!doctype html>",
            '<html lang="en"><head><meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            '<meta name="referrer" content="no-referrer">',
            f'<meta name="generator" content="Plenio {_e(versions.get("plenio", ""))}">',
            f"<title>{_e(title)}</title>",
            f"<style>{STYLE}</style></head><body><main>",
            *hero,
            toc,
            *blocks,
            f"<footer>{_e(made_with)}</footer>",
            f"</main><script>{SCRIPT}</script></body></html>",
            "",
        ]
    )


def page_for(
    record_path: Path,
    link: Link | None = None,
    *,
    in_player: bool = False,
    rating: float | None = None,
    quality: Mapping[str, Any] | None = None,
) -> str:
    """The page of the song whose release record is ``record_path`` (links beside it unless ``link``), with the
    stars it was given by ear and how well it came out, measured (``quality``: else the record's)."""
    from .library import song_detail, summarize

    record = json.loads(record_path.read_text(encoding="utf-8"))
    detail = song_detail(summarize(record, record_path, record_path.parent))
    return render(
        detail,
        record,
        link or relative_link(detail.get("files") or {}),
        in_player=in_player,
        rating=rating,
        quality=quality,
    )
