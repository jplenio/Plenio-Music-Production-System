"""The player with songs, as one HTML file that plays by itself (owner's request 2026-10-16: give your music to
others very easily). Double-click it - no server, no install, no ComfyUI - and it is the Plenio Player with
these songs: the library, the song pages, the karaoke lyrics, the notation following the music, the visuals,
playlists, Live Play; the recipient's playlists and settings are kept in their browser.

Only what is meant for listening goes in: each song as an MP3 of at most 192 kbit/s (never the FLAC, the WAV
or the unmastered take), a small cover, the timed lyrics and the score's notation, its waveform, optionally
the sheet music PDF; no release record, no workflow, no paths of this computer.

Large files open (owner's request 2026-10-18: a 2 GB file on a phone). The browser reads an HTML file from top
to bottom, so the file is laid out for that (``plenio.portable/2``): first the page's style, the songs' list
and a small loader, then the player itself - which starts at once - then each song's page, the covers, the
sound in pieces of half a megabyte, the sheet music. Each piece is a block of text and a tiny script that hands
it to the loader and empties it: the browser keeps the songs as files of its own (blobs - Chrome puts them on
the disk when memory runs short), and the page keeps none of the text. The list is there at once (0.7 s for
365 songs, 2.6 GB), the songs play as their sound arrives (every one after 9-15 s on a desktop), and the page
holds about 150 MB once its memory is tidied.

What no file can change: a browser holds an HTML file in memory while it reads it (it reads faster than it
can parse), so opening a 2.6 GB file takes several GB for a while - a computer has them, most phones not. So a
large share can be made in **parts** (``part_mb``): several files of at most that size, each a whole player of
its songs, sharing the listener's favourites and playlists - a phone opens each one.

The files are written piece by piece as they are made - never held in memory -, the MP3s are made in a few
threads at once, and a player being made can be stopped (``PackageJobs``: one after the other, in turn).
"""

from __future__ import annotations

import base64
import io
import json
import os
import re
import secrets
import threading
import time
from collections import deque
from collections.abc import Callable, Iterator
from concurrent.futures import Future, ThreadPoolExecutor
from fractions import Fraction
from html import escape as html_escape
from pathlib import Path
from typing import IO, Any

from .. import __version__
from .analysis import track as analysis_track
from .library import Library, Song, song_detail
from .peaks import peaks

PACKAGES_DIR = "packages"
BITRATES = (128, 160, 192)
COVER_SIDE = 512
FORMAT = "plenio.portable/2"
MAX_SONGS = 2000
PART_SIZES = (0, 250, 500, 1000)
"""Parts of at most so many MB (0: one file)."""
PIECE = 512 * 1024
"""Bytes of sound per script: small enough for a phone to decode at once, few enough scripts for 2 GB."""
PDF_LIMIT = 8 * 2**20
JOBS_KEPT = 30
# what a song's page may show of a song; the rest stays on this computer
DETAIL_KEYS = (
    "id", "title", "created", "year", "seconds", "model", "kind", "brief", "genre", "mood", "language", "vocals",
    "instrumental", "arrangement", "template", "style", "lyrics", "loudness", "tags", "plenio", "takes_key",
    "bpm", "score_key", "score_meter", "seeds", "writer", "sampling", "other", "artist", "album",
    "documents", "lyrics_raw", "notation", "lines", "timing_source", "timing_note", "licences",
)  # fmt: skip
SUMMARY_KEYS = DETAIL_KEYS[: DETAIL_KEYS.index("documents")]

# The loader, before the songs' pieces: it turns each piece into a blob as it arrives (the script element goes,
# so the page never holds the text), joins a file's pieces and tells the player who waits for it.
LOADER = """(function () {
  var P = (window.__plenio = { urls: {}, parts: {}, waits: {}, details: {}, got: 0, total: %(total)d, done: false, onurl: null })
  // every piece decoded into one buffer (no garbage of decoded bytes; the blob takes a copy)
  var buffer = new Uint8Array(%(piece)d + 16)
  var table = new Uint8Array(128)
  var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var t = 0; t < 64; t++) table[abc.charCodeAt(t)] = t
  function decode(text) {
    if (buffer.setFromBase64) return buffer.subarray(0, buffer.setFromBase64(text).written)
    var n = text.length, pad = text.charCodeAt(n - 1) === 61 ? (text.charCodeAt(n - 2) === 61 ? 2 : 1) : 0, o = 0
    for (var i = 0; i < n; i += 4) {
      var a = table[text.charCodeAt(i)], b = table[text.charCodeAt(i + 1)], c = table[text.charCodeAt(i + 2)], d = table[text.charCodeAt(i + 3)]
      buffer[o++] = (a << 2) | (b >> 4)
      buffer[o++] = ((b & 15) << 4) | (c >> 2)
      buffer[o++] = ((c & 3) << 6) | d
    }
    return buffer.subarray(0, Math.max(0, o - pad))
  }
  // a script that has done its work goes, its text emptied at once (it would wait for the memory to be tidied)
  function drop(s) {
    if (!s) return
    if (s.firstChild) s.firstChild.data = ''
    if (s.parentNode) s.parentNode.removeChild(s)
  }
  function tell(key, value) {
    var list = P.waits[key]
    delete P.waits[key]
    if (list) for (var i = 0; i < list.length; i++) list[i](value)
  }
  function add(kind, id, mime, last, data) {
    var key = kind + '/' + id
    ;(P.parts[key] = P.parts[key] || []).push(new Blob([decode(data)]))
    if (last) {
      var url = URL.createObjectURL(new Blob(P.parts[key], { type: mime }))
      delete P.parts[key]
      P.urls[key] = url
      P.got++
      if (P.onurl) P.onurl(key, url)
      tell(key, url)
    }
  }
  P.d = function (id, text) {
    P.details[id] = text
    tell('d/' + id, text)
    drop(document.currentScript)
  }
  P.b = function (kind, id, mime, last, data) {
    add(kind, id, mime, last, data)
    drop(document.currentScript)
  }
  // a piece: its base64 in the text block just before this script
  P.t = function (kind, id, mime, last) {
    var s = document.currentScript, block = s && s.previousElementSibling
    add(kind, id, mime, last, block && block.firstChild ? block.firstChild.data : '')
    drop(block)
    drop(s)
  }
  P.end = function () {
    P.done = true
    for (var key in P.waits) tell(key, '')
    if (P.onurl) P.onurl('', '')
    drop(document.currentScript)
  }
  P.get = function (key) {
    if (P.urls[key] !== undefined) return Promise.resolve(P.urls[key])
    if (key.indexOf('d/') === 0 && P.details[key.slice(2)] !== undefined) return Promise.resolve(P.details[key.slice(2)])
    if (P.done) return Promise.resolve('')
    return new Promise(function (resolve) {
      ;(P.waits[key] = P.waits[key] || []).push(resolve)
    })
  }
})()"""


class Cancelled(Exception):  # noqa: N818 - a stop asked for, not an error
    """The player being made was stopped."""


def packages_dir(state_dir: Path) -> Path:
    return state_dir / PACKAGES_DIR


def encode_mp3(audio: Path, bitrate: int, tags: dict[str, str]) -> bytes:
    """The song as an MP3 (44.1 kHz stereo, ``bitrate`` kbit/s, its title and artist in the tags)."""
    import av

    out = io.BytesIO()
    with av.open(str(audio)) as source, av.open(out, "w", format="mp3") as target:
        for key, value in tags.items():
            if value:
                target.metadata[key] = value
        stream = target.add_stream("libmp3lame" if "libmp3lame" in av.codecs_available else "mp3", rate=44100)
        stream.layout = "stereo"
        stream.bit_rate = bitrate * 1000
        fmt = stream.codec_context.format.name if stream.codec_context.format else "s16p"
        resampler = av.AudioResampler(format=fmt, layout="stereo", rate=44100)
        position = 0
        for frame in source.decode(source.streams.audio[0]):
            for piece in resampler.resample(frame):
                piece.pts = position
                piece.time_base = Fraction(1, 44100)
                position += piece.samples
                for packet in stream.encode(piece):
                    target.mux(packet)
        for piece in resampler.resample(None):
            piece.pts = position
            piece.time_base = Fraction(1, 44100)
            position += piece.samples
            for packet in stream.encode(piece):
                target.mux(packet)
        for packet in stream.encode(None):
            target.mux(packet)
    return out.getvalue()


def small_cover(path: Path) -> bytes | None:
    """The cover as a JPEG of at most 512 pixels a side."""
    try:
        from PIL import Image

        with Image.open(path) as source:
            image = source.convert("RGB")
            image.thumbnail((COVER_SIDE, COVER_SIDE))
            out = io.BytesIO()
            image.save(out, "JPEG", quality=85)
            return out.getvalue()
    except Exception:  # noqa: BLE001 - a song without its cover still plays (it gets artwork)
        return None


def _script_text(value: Any) -> str:
    """JSON safe inside a script element: every ``<`` escaped (``</script>`` and ``<!--`` cannot close or
    bend it)."""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def _pieces(kind: str, key: str, data: bytes, mime: str) -> Iterator[str]:
    """A file as the loader's pieces: its base64 as a block of text (no script the browser would compile and
    keep), and a tiny script after it, ``__plenio.t(kind, id, mime, last)``, that hands it on."""
    count = max(1, -(-len(data) // PIECE))
    for k in range(count):
        chunk = base64.b64encode(data[k * PIECE : (k + 1) * PIECE]).decode("ascii")
        yield f'<script type="text/plain">{chunk}</script><script>__plenio.t("{kind}","{key}","{mime}",{int(k == count - 1)})</script>\n'


def _page(static: Path) -> tuple[str, str, str]:
    """The built page's head (title, icon), its script and its style."""
    index = (static / "index.html").read_text(encoding="utf-8")
    script = re.search(r'<script type="module"[^>]*src="\./([^"]+)"', index)
    style = re.search(r'<link rel="stylesheet"[^>]*href="\./([^"]+)"', index)
    icon = re.search(r'<link rel="icon"[^>]*>', index)
    if not script or not style:
        raise RuntimeError("the player's page is not built (npm run build:player)")
    js = (static / script.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
    css = (static / style.group(1)).read_text(encoding="utf-8").replace("</style", "<\\/style")
    head = icon.group(0) if icon else ""
    linked = re.search(r'href="\./([^"]+)"', head)
    if linked and (static / linked.group(1)).is_file():
        # one file: the page's icon goes in as a data address (the shared player has no folder beside it)
        picture = base64.b64encode((static / linked.group(1)).read_bytes()).decode("ascii")
        head = head.replace(linked.group(0), f'href="data:image/png;base64,{picture}"')
    return head, js, css


def tags_of(raw: Any, packed: set[str]) -> dict[str, list[str]]:
    """The listener's tags of the songs packed: short texts, at most 40 a song."""
    if not isinstance(raw, dict):
        return {}
    out: dict[str, list[str]] = {}
    for song_id, tags in raw.items():
        if song_id in packed and isinstance(tags, list):
            kept = [str(t).strip()[:40] for t in tags if isinstance(t, str) and t.strip()][:40]
            if kept:
                out[song_id] = kept
    return out


def file_name(title: str, folder: Path) -> Path:
    stem = re.sub(r'[\s<>:"/\\|?*\x00-\x1f]+', " ", title).strip().rstrip(".")[:80] or "Plenio songs"
    target = folder / f"{stem}.html"
    count = 1
    while target.exists() or target.with_suffix(".part").exists():
        count += 1
        target = folder / f"{stem} {count}.html"
    return target


def _workers() -> int:
    return max(1, min(8, (os.cpu_count() or 2) // 2))


def build(
    library: Library,
    ids: list[str],
    options: dict[str, Any],
    state_dir: Path,
    progress: Callable[..., None] = lambda done, total, stage="": None,
    static: Path | None = None,
    cancelled: Callable[[], bool] = lambda: False,
) -> list[Path]:
    """Write the portable player with the songs ``ids`` into the packages folder - one file, or parts; their
    paths back.

    ``options``: ``title``, ``bitrate`` (128, 160, 192), ``pdf`` (the sheet music), ``settings`` (the
    visuals' and the lyrics' look to start with), ``presets`` (the listener's own visuals: name, text),
    ``playlists`` (``[{"name", "songs"}]``, the songs among those packed), ``tags`` (song id -> the
    listener's tags of it), ``part_mb`` (parts of at most so many MB; 0: one file). ``progress(done, total,
    stage)``: ``reading`` the songs, then ``packing`` their sound. ``cancelled``: asked as it goes; when it says
    so, the files of this player go and ``Cancelled`` is raised."""
    from .server import STATIC

    bitrate = int(options.get("bitrate") or 192)
    if bitrate not in BITRATES:
        raise ValueError(f"MP3 at {', '.join(map(str, BITRATES))} kbit/s")
    if int(options.get("part_mb") or 0) not in PART_SIZES:
        raise ValueError(f"parts of {', '.join(map(str, PART_SIZES[1:]))} MB, or one file")
    songs: list[Song] = []
    for song_id in ids[:MAX_SONGS]:
        song = library.song(song_id)
        if song is None or "audio" not in song.files:
            continue
        songs.append(song)
    if not songs:
        raise ValueError("no songs to pack")
    title = str(options.get("title") or "Plenio songs").strip()[:120] or "Plenio songs"
    cache = state_dir / "cache"
    icon, js, css = _page(static or STATIC)
    total = len(songs)
    with_pdf = bool(options.get("pdf"))

    # 1. what the list, the songs' pages and the covers need (quick): the summaries go first in the file
    summaries: list[dict[str, Any]] = []
    details: list[tuple[str, str]] = []
    covers: list[tuple[str, bytes]] = []
    pdfs: list[tuple[str, Path]] = []
    # what each song adds to a file, about: its sound, cover, sheet music and page, as base64
    sizes: list[int] = []
    for done, song in enumerate(songs):
        if cancelled():
            raise Cancelled
        progress(done, total, "reading")
        detail = song_detail(song, cache=cache)
        summary = {k: song.summary[k] for k in SUMMARY_KEYS if k in song.summary}
        cover = small_cover(song.files["cover"]) if "cover" in song.files else None
        if cover:
            covers.append((song.id, cover))
        pdf = song.files.get("pdf") if with_pdf else None
        has_pdf = bool(pdf and pdf.is_file() and pdf.stat().st_size < PDF_LIMIT)
        if pdf and has_pdf:
            pdfs.append((song.id, pdf))
        summary["has"] = {
            "audio": True,
            "original": False,
            "cover": bool(cover),
            "pdf": has_pdf,
            "lines": bool(detail.get("lines")),
            "notes": False,
            "stems": False,
            "timing": bool(song.summary.get("has", {}).get("timing")),
            "score": bool(song.summary.get("has", {}).get("score")),
        }
        summary["folder"] = ""
        summary["file"] = ""
        summaries.append(summary)
        name = str(summary.get("title") or "song")
        page = {
            **{k: detail[k] for k in DETAIL_KEYS if k in detail},
            "has": summary["has"],
            "files": {"audio": f"{name}.mp3", **({"pdf": f"{name}.pdf"} if has_pdf else {})},
            "owned_files": [],
            "retire_to": "",
            "record_path": "",
            "versions": {"plenio": str(song.summary.get("plenio") or "")},
        }
        level = peaks(song.files["audio"], cache / "peaks")
        # the visuals' analysis track goes along (phase 7.3): the shared player knows the music ahead too
        track = analysis_track(song.files["audio"], cache / "analysis", None if song.other else song.record)
        text = json.dumps(
            {"detail": page, "peaks": level or None, "analysis": track},
            ensure_ascii=False,
            separators=(",", ":"),
        )
        details.append((song.id, text))
        seconds = float(song.summary.get("seconds") or 0.0)
        # a record without its length: from the file's size (lossless audio about 1000 kbit/s)
        sound = seconds * bitrate * 125 if seconds else song.files["audio"].stat().st_size * bitrate / 1000
        extra = len(cover or b"") + (pdf.stat().st_size if pdf and has_pdf else 0)
        sizes.append(int((sound + extra) * 4 / 3) + len(text) + 2000)
    # 2. the parts: one file, or files of at most part_mb each (a phone opens each one)
    groups = _parts(songs, sizes, int(options.get("part_mb") or 0) * 2**20 - len(js) - len(css))
    count = len(groups)
    folder = packages_dir(state_dir)
    folder.mkdir(parents=True, exist_ok=True)
    targets = _part_names(title, count, folder)
    shared_id = secrets.token_hex(6)
    created = time.strftime("%Y-%m-%dT%H:%M:%S")
    made: list[Path] = []
    done_before = 0
    try:
        for k, group in enumerate(groups):
            members = set(group)
            part_summaries = [s for k2, s in enumerate(summaries) if k2 in members]
            packed = {s["id"] for s in part_summaries}
            playlists = [
                {
                    "name": str(p.get("name") or "Playlist")[:80],
                    "songs": [i for i in p.get("songs") or [] if i in packed],
                }
                for p in options.get("playlists") or []
                if isinstance(p, dict)
            ]
            part_covers = [(i, c) for i, c in covers if i in packed]
            part_pdfs = [(i, f) for i, f in pdfs if i in packed]
            data = {
                "format": FORMAT,
                # one id for every part: the listener's favourites and playlists are the same in each
                "id": shared_id,
                "title": title,
                "created": created,
                "plenio": __version__,
                "bitrate": bitrate,
                "songs": part_summaries,
                "details": {},
                "peaks": {},
                "settings": options.get("settings") if isinstance(options.get("settings"), dict) else {},
                "presets": [
                    {"name": str(p.get("name")), "text": str(p.get("text")), "mtime": 0}
                    for p in options.get("presets") or []
                    if isinstance(p, dict) and p.get("name") and p.get("text")
                ],
                "playlists": [p for p in playlists if p["songs"]],
                "tags": tags_of(options.get("tags"), packed),
                "files": {"audio": len(group), "cover": len(part_covers), "pdf": len(part_pdfs)},
                "part": {"index": k + 1, "count": count, "files": [p.name for p in targets]}
                if count > 1
                else None,
            }
            heading = f"{title} ({k + 1} of {count})" if count > 1 else title

            def step(done: int, _total: int, stage: str = "", before: int = done_before) -> None:
                progress(before + done, total, stage)

            _write_part(
                targets[k],
                data,
                heading,
                icon,
                js,
                css,
                [(i, text) for i, text in details if i in packed],
                part_covers,
                part_pdfs,
                [songs[i] for i in group],
                part_summaries,
                bitrate,
                step,
                cancelled,
            )
            made.append(targets[k])
            done_before += len(group)
    except BaseException:
        for path in made:
            path.unlink(missing_ok=True)
        raise
    progress(total, total, "packing")
    return made


def _parts(songs: list[Song], sizes: list[int], budget: int) -> list[list[int]]:
    """The songs (their places) in parts of at most ``budget`` bytes each, in their order (a song larger than a
    part is a part of its own); ``budget`` 0 or less: one part."""
    if budget <= 0 or sum(sizes) <= budget:
        return [list(range(len(songs)))]
    groups: list[list[int]] = [[]]
    used = 0
    for k, size in enumerate(sizes):
        if groups[-1] and used + size > budget:
            groups.append([])
            used = 0
        groups[-1].append(k)
        used += size
    return groups


def _part_names(title: str, count: int, folder: Path) -> list[Path]:
    """``<title>.html``, or ``<title> (1 of 3).html`` ..., each free in the folder."""
    if count == 1:
        return [file_name(title, folder)]
    for attempt in range(1, 1000):
        stem = title if attempt == 1 else f"{title} {attempt}"
        names = [file_name(f"{stem} ({k + 1} of {count})", folder) for k in range(count)]
        if all(n.stem.endswith(f"({k + 1} of {count})") for k, n in enumerate(names)):
            return names
    raise RuntimeError("no free names for the parts")


def _write_part(
    target: Path,
    data: dict[str, Any],
    heading: str,
    icon: str,
    js: str,
    css: str,
    details: list[tuple[str, str]],
    covers: list[tuple[str, bytes]],
    pdfs: list[tuple[str, Path]],
    songs: list[Song],
    summaries: list[dict[str, Any]],
    bitrate: int,
    progress: Callable[..., None],
    cancelled: Callable[[], bool],
) -> None:
    """One file, written as it is made: head, list, loader, player, pages, covers, sound, sheet music."""
    partial = target.with_suffix(".part")
    total = len(covers) + len(songs) + len(pdfs)
    try:
        with partial.open("w", encoding="utf-8", newline="\n") as out:
            out.write(
                '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n'
                '<meta name="color-scheme" content="dark" />\n'
                f'<meta name="generator" content="Plenio Player {__version__}" />\n'
                f"<title>{html_escape(heading)} - Plenio Player</title>\n{icon}\n<style>{css}</style>\n</head>\n<body>\n"
                '<div id="app"></div>\n'
                f'<script type="application/json" id="plenio-portable">{_script_text(data)}</script>\n'
                f"<script>{LOADER % {'total': total, 'piece': PIECE}}</script>\n"
                # async: the player starts while the rest of the file is still read
                f'<script type="module" async>{js}</script>\n'
            )
            for song_id, text in details:
                out.write(f'<script>__plenio.d("{song_id}",{_script_text(text)})</script>\n')
            for song_id, cover in covers:
                out.writelines(_pieces("c", song_id, cover, "image/jpeg"))
            _write_sound(out, songs, summaries, bitrate, progress, cancelled)
            for song_id, pdf in pdfs:
                if cancelled():
                    raise Cancelled
                out.writelines(_pieces("p", song_id, pdf.read_bytes(), "application/pdf"))
            out.write("<script>__plenio.end()</script>\n</body>\n</html>\n")
        if cancelled():
            raise Cancelled
        partial.replace(target)
    finally:
        partial.unlink(missing_ok=True)


def _write_sound(
    out: IO[str],
    songs: list[Song],
    summaries: list[dict[str, Any]],
    bitrate: int,
    progress: Callable[..., None],
    cancelled: Callable[[], bool],
) -> None:
    """Every song's MP3, made in a few threads at once and written in the songs' order - only as many held in
    memory as threads are busy."""
    total = len(songs)

    def encode(k: int) -> bytes:
        if cancelled():
            raise Cancelled
        song, summary = songs[k], summaries[k]
        artist = str(song.summary.get("artist") or song.summary.get("tags", {}).get("artist") or "")
        return encode_mp3(
            song.files["audio"], bitrate, {"title": str(summary.get("title") or ""), "artist": artist}
        )

    workers = _workers()
    with ThreadPoolExecutor(workers, thread_name_prefix="plenio-mp3") as pool:
        waiting: deque[Future[bytes]] = deque()
        submitted = 0
        try:
            for k in range(total):
                while submitted < total and len(waiting) < workers * 2:
                    waiting.append(pool.submit(encode, submitted))
                    submitted += 1
                progress(k, total, "packing")
                mp3 = waiting.popleft().result()
                if cancelled():
                    raise Cancelled
                out.writelines(_pieces("a", songs[k].id, mp3, "audio/mpeg"))
        finally:
            for future in waiting:
                future.cancel()


class PackageJobs:
    """Shared players being made - one after the other, in turn, in a thread of their own - their progress
    asked for by the page, each one stoppable (a waiting one never starts, the one at work stops within a song
    and leaves no file)."""

    def __init__(self) -> None:
        self.jobs: dict[str, dict[str, Any]] = {}
        self.queue: deque[str] = deque()
        self.stop: set[str] = set()
        self.lock = threading.Lock()
        self.worker: threading.Thread | None = None
        self.made = 0

    def start(self, library: Library, ids: list[str], options: dict[str, Any], state_dir: Path) -> str:
        job = secrets.token_hex(8)
        title = str(options.get("title") or "Plenio songs").strip()[:120] or "Plenio songs"
        with self.lock:
            self.jobs[job] = {
                "job": job,
                "state": "waiting",
                "stage": "",
                "done": 0,
                "total": len(ids),
                "title": title,
                "bitrate": int(options.get("bitrate") or 192),
                "part_mb": int(options.get("part_mb") or 0),
                "created": time.time(),
                "order": self.made,
                "run": (library, ids, options, state_dir),
            }
            self.made += 1
            self.queue.append(job)
            self._forget_old()
            if self.worker is None or not self.worker.is_alive():
                self.worker = threading.Thread(target=self._work, daemon=True, name="plenio-packages")
                self.worker.start()
        return job

    def _forget_old(self) -> None:
        finished = [j for j, v in self.jobs.items() if v["state"] in ("done", "error", "stopped")]
        for job in finished[: max(0, len(finished) - JOBS_KEPT)]:
            del self.jobs[job]

    def _work(self) -> None:
        while True:
            with self.lock:
                if not self.queue:
                    self.worker = None
                    return
                job = self.queue.popleft()
                entry = self.jobs.get(job)
                if entry is None or entry["state"] != "waiting":
                    continue
                entry["state"] = "working"
                entry["started"] = time.time()
                library, ids, options, state_dir = entry.pop("run")

            def step(done: int, total: int, stage: str = "", job: str = job) -> None:
                with self.lock:
                    self.jobs[job].update(done=done, total=total, stage=stage)

            def stopped(job: str = job) -> bool:
                return job in self.stop

            try:
                paths = build(library, ids, options, state_dir, step, cancelled=stopped)
                result = {
                    "state": "done",
                    "file": paths[0].name,
                    "files": [{"name": p.name, "size": p.stat().st_size} for p in paths],
                    "size": sum(p.stat().st_size for p in paths),
                    "folder": str(paths[0].parent),
                }
            except Cancelled:
                result = {"state": "stopped"}
            except Exception as error:  # noqa: BLE001 - the page shows why
                result = {"state": "error", "error": str(error)}
            with self.lock:
                self.jobs[job].update(result, finished=time.time())
                self.stop.discard(job)

    def cancel(self, job: str) -> bool:
        """Stop a player being made, or keep a waiting one from starting; ``False``: no such job."""
        with self.lock:
            entry = self.jobs.get(job)
            if entry is None:
                return False
            if entry["state"] == "waiting":
                entry.update(state="stopped", finished=time.time())
                entry.pop("run", None)
            elif entry["state"] == "working":
                self.stop.add(job)
            return True

    def clear(self) -> None:
        """Forget the finished ones."""
        with self.lock:
            for job in [j for j, v in self.jobs.items() if v["state"] in ("done", "error", "stopped")]:
                del self.jobs[job]

    def status(self, job: str) -> dict[str, Any] | None:
        with self.lock:
            found = self.jobs.get(job)
            return _public(found) if found else None

    def listing(self) -> list[dict[str, Any]]:
        """Every job, the newest first."""
        with self.lock:
            return [_public(v) for v in sorted(self.jobs.values(), key=lambda v: -v["order"])]


def _public(entry: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in entry.items() if k != "run"}


def listing(state_dir: Path) -> list[dict[str, Any]]:
    folder = packages_dir(state_dir)
    if not folder.is_dir():
        return []
    files = sorted(folder.glob("*.html"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [{"name": p.name, "size": p.stat().st_size, "mtime": p.stat().st_mtime} for p in files]


def package_file(state_dir: Path, name: str) -> Path | None:
    folder = packages_dir(state_dir).resolve()
    candidate = (folder / name).resolve()
    if candidate.parent != folder or candidate.suffix != ".html" or not candidate.is_file():
        return None
    return candidate
