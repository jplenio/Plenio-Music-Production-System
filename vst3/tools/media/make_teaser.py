"""The teaser "Plenio VST3": a song the plug-in made, and pictures of the plug-in making it.

    python tools/media/make_teaser.py <song folder> <tour folder> <out folder> [seconds,seconds,...]

<song folder> is a song of Plenio VST3's library (song.json, takes/<n>/: its audio, stems, score.mid, cover); <tour
folder> the frames of tools/media/tour.mjs; the screenshots come from docs/media/screens. Every scene starts on a bar
line or a sung line, so the cuts follow the music. Writes `plenio-vst3-teaser.mp4` (1920 x 1080) and
`plenio-vst3-teaser-vertical.mp4` (1080 x 1920), 30 frames a second, the music at -14 LUFS, and `teaser-poster.png`.
With seconds, only those frames as PNG (a preview). Needs NumPy, OpenCV, Pillow, soundfile and ffmpeg on the PATH;
the text is set in Montserrat (OFL-1.1) when the computer has it.

The drawing (sky, waves, stars, the neon logo, karaoke) comes from the SoundCraft add-in's teaser, by the same author.
The music is a YuE2 song: the video is under the model's licence, CC BY-NC 4.0.
"""

from __future__ import annotations

import json
import math
import os
import struct
import subprocess
import sys
from dataclasses import dataclass, field
from functools import cache, lru_cache
from pathlib import Path

import cv2
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont

FPS = 30
W, H = 1920, 1080
VW, VH = 1080, 1920
AMBER, PINK, VIOLET = (255, 178, 62), (255, 61, 139), (138, 77, 255)
NIGHT = (7, 4, 13)
URL = "github.com/jplenio/Plenio-Music-Production-System"
STEM_COLORS = {
    "vocals": (255, 178, 62),
    "drums": (255, 90, 110),
    "bass": (255, 61, 139),
    "other": (190, 90, 255),
    "rest": (120, 110, 255),
}
ROOT = Path(__file__).resolve().parents[2]
SCREENS = ROOT / "docs" / "media" / "screens"

# ---------------------------------------------------------------------------------------------------
# The song, as Plenio VST3's library keeps it


@dataclass
class Line:
    start: float
    end: float
    text: str


@dataclass
class Song:
    folder: Path
    audio: Path
    bars: list[float]  # audio seconds of every bar
    tempos: list[tuple[float, float]]  # (audio seconds, bpm) per bar
    sections: list[tuple[str, float, float]]  # (name, start, end), audio seconds
    lines: list[Line]
    notes: dict[
        str, list[tuple[float, float, int]]
    ]  # melody / instrument / chords: (start, end, pitch), audio seconds
    stems: dict[str, Path]
    cover: Path | None
    title: str
    tour: Path = Path()
    extra: dict = field(default_factory=dict)


def midi_notes(path: Path) -> tuple[dict[str, list[tuple[float, float, int]]], int]:
    """A score's notes by track name, in score seconds (its own tempo map)."""
    b = path.read_bytes()
    division = struct.unpack(">H", b[12:14])[0]
    i, tempo_events, tracks = 14, [], []

    def vlq(j: int) -> tuple[int, int]:
        v = 0
        while True:
            c = b[j]
            j += 1
            v = (v << 7) | (c & 0x7F)
            if c < 0x80:
                return v, j

    while i < len(b) and b[i : i + 4] == b"MTrk":
        n = struct.unpack(">I", b[i + 4 : i + 8])[0]
        j, end, tick, run, name, on, notes = i + 8, i + 8 + n, 0, 0, "", {}, []
        while j < end:
            d, j = vlq(j)
            tick += d
            s = b[j]
            if s == 0xFF:
                kind = b[j + 1]
                ln, k = vlq(j + 2)
                data = b[k : k + ln]
                j = k + ln
                if kind == 0x51:
                    tempo_events.append((tick, int.from_bytes(data, "big")))
                elif kind == 0x03 and not name:
                    name = data.decode("utf-8", "replace")
            elif s in (0xF0, 0xF7):
                ln, k = vlq(j + 1)
                j = k + ln
            else:
                if s & 0x80:
                    run = s
                    j += 1
                hi = run & 0xF0
                if hi in (0x80, 0x90):
                    pitch, vel = b[j], b[j + 1]
                    if hi == 0x90 and vel > 0:
                        on[(run & 15, pitch)] = tick
                    elif (run & 15, pitch) in on:
                        notes.append((on.pop((run & 15, pitch)), tick, pitch))
                j += 1 if hi in (0xC0, 0xD0) else 2
        tracks.append((name, notes))
        i = end
    tempo_events.sort()
    if not tempo_events or tempo_events[0][0] != 0:
        tempo_events.insert(0, (0, 500000))
    starts = [0.0]
    for (t0, us), (t1, _) in zip(tempo_events, tempo_events[1:], strict=False):
        starts.append(starts[-1] + (t1 - t0) / division * us / 1e6)

    def seconds(tick: int) -> float:
        k = max(0, int(np.searchsorted([e[0] for e in tempo_events], tick, side="right")) - 1)
        return starts[k] + (tick - tempo_events[k][0]) / division * tempo_events[k][1] / 1e6

    out = {}
    for name, notes in tracks:
        if notes:
            out[name.lower()] = [(seconds(a), seconds(z), p) for a, z, p in notes]
    return out, division


def load_song(folder: Path, tour: Path) -> Song:
    s = json.loads((folder / "song.json").read_text(encoding="utf-8"))
    take = s["takes"][max(0, int(s.get("active_take", 0)))]
    resolve = lambda rel: folder / Path(rel.replace("\\", "/"))
    bars = [float(x) for x in take["bars"]["audio"]]
    score = [float(x) for x in take["bars"]["score"]]
    meters = take["bars"].get("meters") or []
    tempos = []
    for k in range(len(bars) - 1):
        num, den = meters[k] if k < len(meters) else [4, 4]
        tempos.append((bars[k], 60.0 * num * 4 / den / max(1e-3, bars[k + 1] - bars[k])))
    lines = [
        Line(float(l["start"]), float(l["end"]), " ".join(str(l["text"]).split())) for l in take["lines"]
    ]
    # the sections: the lyrics' headers, the sung lines in order under them
    lyrics = take["documents"].get("lyrics") or s["documents"].get("lyrics") or ""
    lyrics = lyrics["text"] if isinstance(lyrics, dict) else lyrics
    marks, current, n = [], "intro", 0
    for row in lyrics.splitlines():
        row = row.strip()
        if row.startswith("[") and row.endswith("]"):
            current = row[1:-1].strip().lower()
            continue
        if row and n < len(lines):
            if not marks or marks[-1][0] != current or marks[-1][2] != n - 1:
                marks.append([current, lines[n].start, n])
            marks[-1][2] = n
            n += 1
    sections = []
    for k, (name, start, _) in enumerate(marks):
        end = marks[k + 1][1] if k + 1 < len(marks) else bars[-1]
        sections.append((name, start, end))
    notes = {}
    if "midi" in take["files"]:
        by_track, _ = midi_notes(resolve(take["files"]["midi"]))
        to_audio = lambda t: float(np.interp(t, score, bars))
        for name, role in (("vocal", "melody"), ("instrument", "instrument"), ("chords", "chords")):
            if name in by_track:
                notes[role] = [(to_audio(a), to_audio(z), p) for a, z, p in by_track[name]]
    stems = {st["name"]: resolve(st["file"]) for st in take.get("stems", [])}
    cover = resolve(take["files"]["cover_art"]) if "cover_art" in take["files"] else None
    return Song(
        folder,
        resolve(take["files"]["song"]),
        bars,
        tempos,
        sections,
        lines,
        notes,
        stems,
        cover,
        s["title"],
        tour,
    )


# ---------------------------------------------------------------------------------------------------
# Drawing


FONT_DIRS = [
    Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Windows/Fonts",
    Path("C:/Windows/Fonts"),
    Path.home() / ".fonts",
    Path("/usr/share/fonts"),
]


@cache
def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    for d in FONT_DIRS:
        for name in (
            f"Montserrat-{weight}.ttf",
            "segoeuib.ttf" if weight in ("Bold", "ExtraBold", "Black") else "segoeui.ttf",
        ):
            p = d / name
            if p.is_file():
                return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def ease(x: float) -> float:
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def gradient_rgb(width: int, height: int, colors=(AMBER, PINK, VIOLET)) -> np.ndarray:
    xs = np.linspace(0, 1, width)[None, :, None]
    a, b, c = (np.array(col, np.float32)[None, None, :] for col in colors)
    left = a + (b - a) * np.clip(xs / 0.5, 0, 1)
    right = b + (c - b) * np.clip((xs - 0.5) / 0.5, 0, 1)
    row = np.where(xs < 0.5, left, right)
    return np.repeat(row, height, axis=0)


@lru_cache(maxsize=512)
def text_sprite(
    text: str, weight: str, size: int, fill: str = "white", spacing: float = 0.0, glow: int = 0
) -> np.ndarray:
    """RGBA float32 [0, 1]: the text, white or in Plenio's gradient, with an optional glow."""
    f = font(weight, size)
    chars = list(text)
    extra = size * spacing
    widths = [f.getlength(c) for c in chars]
    width = int(sum(widths) + extra * max(0, len(chars) - 1)) + 4 + 2 * glow
    ascent, descent = f.getmetrics()
    height = ascent + descent + 4 + 2 * glow
    mask = Image.new("L", (width, height), 0)
    d = ImageDraw.Draw(mask)
    x = 2 + glow
    for c, w in zip(chars, widths, strict=False):
        d.text((x, 2 + glow), c, font=f, fill=255)
        x += w + extra
    m = np.asarray(mask, np.float32) / 255.0
    if fill == "gradient":
        rgb = gradient_rgb(width, height) / 255.0
    else:
        rgb = np.ones((height, width, 3), np.float32)
    out = np.dstack([rgb, m])
    if glow:
        g = cv2.GaussianBlur(m, (0, 0), glow / 2)
        halo = np.dstack([gradient_rgb(width, height) / 255.0, np.clip(g * 1.4, 0, 1)])
        out = over_rgba(halo, out)
    return out


def over_rgba(dst: np.ndarray, src: np.ndarray) -> np.ndarray:
    a = src[..., 3:4]
    rgb = src[..., :3] * a + dst[..., :3] * dst[..., 3:4] * (1 - a)
    alpha = a + dst[..., 3:4] * (1 - a)
    return np.dstack([np.where(alpha > 0, rgb / np.maximum(alpha, 1e-6), 0), alpha])


def paste(
    frame: np.ndarray, sprite: np.ndarray, x: float, y: float, alpha: float = 1.0, scale: float = 1.0
) -> None:
    """Alpha-blend an RGBA sprite onto the float RGB frame, top-left at (x, y)."""
    if alpha <= 0.001:
        return
    if abs(scale - 1.0) > 1e-3:
        sprite = cv2.resize(
            sprite,
            (max(1, int(sprite.shape[1] * scale)), max(1, int(sprite.shape[0] * scale))),
            interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR,
        )
    h, w = sprite.shape[:2]
    x0, y0 = int(round(x)), int(round(y))
    fx0, fy0 = max(0, x0), max(0, y0)
    fx1, fy1 = min(frame.shape[1], x0 + w), min(frame.shape[0], y0 + h)
    if fx1 <= fx0 or fy1 <= fy0:
        return
    s = sprite[fy0 - y0 : fy1 - y0, fx0 - x0 : fx1 - x0]
    a = s[..., 3:4] * alpha
    region = frame[fy0:fy1, fx0:fx1]
    region[:] = region * (1 - a) + s[..., :3] * a


def text(
    frame: np.ndarray,
    s: str,
    weight: str,
    size: int,
    cx: float,
    y: float,
    alpha=1.0,
    fill="white",
    spacing=0.0,
    glow=0,
    anchor="center",
    max_width=None,
) -> tuple[int, int]:
    sp = text_sprite(s, weight, size, fill, spacing, glow)
    scale = min(1.0, max_width / sp.shape[1]) if max_width else 1.0
    x = cx - sp.shape[1] * scale / 2 if anchor == "center" else cx
    paste(frame, sp, x, y, alpha, scale)
    return int(sp.shape[1] * scale), int(sp.shape[0] * scale)


@lru_cache(maxsize=64)
def picture(path: str, crop: tuple | None = None, width: int | None = None) -> np.ndarray:
    """A screenshot as RGBA float, cropped and scaled, in a rounded frame with a border."""
    img = Image.open(path).convert("RGB")
    if crop:
        img = img.crop(crop)
    if width:
        img = img.resize((width, round(img.size[1] * width / img.size[0])), Image.Resampling.LANCZOS)
    rgb = np.asarray(img, np.float32) / 255.0
    h, w = rgb.shape[:2]
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=18, fill=255)
    a = np.asarray(mask, np.float32) / 255.0
    border = Image.new("L", (w, h), 0)
    ImageDraw.Draw(border).rounded_rectangle((0, 0, w - 1, h - 1), radius=18, outline=255, width=3)
    b = np.asarray(border, np.float32)[..., None] / 255.0
    grad = gradient_rgb(w, h) / 255.0
    rgb = rgb * (1 - b) + grad * b
    return np.dstack([rgb, a])


def shadowed(
    frame: np.ndarray, sprite: np.ndarray, x: float, y: float, alpha: float = 1.0, scale: float = 1.0
) -> None:
    """A window: a soft neon shadow under it, then the picture."""
    h, w = int(sprite.shape[0] * scale), int(sprite.shape[1] * scale)
    pad = 60
    glow = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    cv2.rectangle(glow, (pad, pad), (pad + w, pad + h), 1.0, -1)
    glow = cv2.GaussianBlur(glow, (0, 0), 26)
    halo = np.dstack([gradient_rgb(w + 2 * pad, h + 2 * pad) / 255.0, glow * 0.55])
    paste(frame, halo, x - pad, y - pad + 10, alpha)
    paste(frame, sprite, x, y, alpha, scale)


def fit(sprite: np.ndarray, max_w: int, max_h: int) -> float:
    return min(max_w / sprite.shape[1], max_h / sprite.shape[0], 1.0)


# ---------------------------------------------------------------------------------------------------
# The world: sky, waves and stars, moving with the music


class World:
    def __init__(self, song: Song, envelope: np.ndarray):
        self.song = song
        self.env = envelope
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        sky = np.zeros((H, W, 3), np.float32)
        sky[:] = np.array(NIGHT, np.float32) / 255.0
        for cx, cy, r, col, k in (
            (0.86, 0.1, 0.75, VIOLET, 0.36),
            (0.08, 0.95, 0.6, PINK, 0.24),
            (0.55, 0.55, 0.5, AMBER, 0.07),
        ):
            d = np.sqrt(((xx / W - cx) / r) ** 2 + ((yy / H - cy) / (r * 1.2)) ** 2)
            sky += np.clip(1 - d, 0, 1)[..., None] ** 2 * (np.array(col, np.float32) / 255.0) * k
        self.sky = sky
        rng = np.random.default_rng(7)
        self.stars = np.column_stack(
            [
                rng.uniform(0, W, 260),
                rng.uniform(0, H, 260),
                rng.uniform(0.3, 1.0, 260),
                rng.uniform(4, 22, 260),
            ]
        )

    def level(self, a: float) -> float:
        i = int(max(0, min(len(self.env) - 1, a * FPS)))
        return float(self.env[i])

    def beat(self, a: float) -> float:
        """1 on every beat, falling off over a quarter of it."""
        bars = self.song.bars
        k = np.searchsorted(bars, a) - 1
        if k < 0 or k + 1 >= len(bars):
            return 0.0
        beat_len = (bars[k + 1] - bars[k]) / 4
        phase = ((a - bars[k]) % beat_len) / beat_len
        return math.exp(-phase * 6)

    def draw(self, a: float, t: float, energy: float = 1.0) -> np.ndarray:
        frame = self.sky.copy()
        level = self.level(a)
        pulse = self.beat(a)
        glow = np.zeros((H // 2, W // 2, 3), np.float32)
        sharp = np.zeros((H, W, 3), np.float32)
        xs = np.linspace(0, W, 220)
        for i, (base, amp, speed, width) in enumerate(
            ((0.80, 70, 0.35, 3), (0.84, 50, 0.22, 2), (0.76, 40, 0.5, 2))
        ):
            phase = t * speed + i * 1.7
            ys = (
                H * base
                + np.sin(xs / W * 5.0 + phase) * amp * (0.6 + 0.8 * level * energy)
                + np.sin(xs / W * 13.0 - phase * 1.3) * 14
            )
            pts = np.column_stack([xs, ys]).astype(np.int32)
            for j in range(len(pts) - 1):
                u = j / (len(pts) - 1)
                col = np.array(AMBER if u < 0.33 else PINK if u < 0.66 else VIOLET, np.float32) / 255.0
                cv2.line(
                    sharp,
                    tuple(pts[j]),
                    tuple(pts[j + 1]),
                    tuple(float(c) for c in col * (0.55 + 0.45 * pulse)),
                    width,
                    cv2.LINE_AA,
                )
            cv2.polylines(glow, [pts // 2], False, (1.0, 0.35, 0.65), 6, cv2.LINE_AA)
        glow = cv2.GaussianBlur(glow, (0, 0), 10) * (0.25 + 0.5 * pulse * energy)
        frame += cv2.resize(glow, (W, H)) + sharp * 0.9
        # Stars drift up slowly and twinkle with the beat.
        st = self.stars
        ys = (st[:, 1] - t * st[:, 3]) % H
        for x, y, b, _ in zip(st[:, 0], ys, st[:, 2], st[:, 3], strict=False):
            v = b * (0.5 + 0.5 * pulse)
            cv2.circle(frame, (int(x), int(y)), 1, (v, v, v), -1, cv2.LINE_AA)
        return frame


def envelope(audio: np.ndarray, rate: int) -> np.ndarray:
    hop = rate // FPS
    mono = audio.mean(axis=1) if audio.ndim == 2 else audio
    n = len(mono) // hop
    rms = np.sqrt(np.mean(mono[: n * hop].reshape(n, hop) ** 2, axis=1))
    rms = rms / max(1e-9, np.percentile(rms, 98))
    kernel = np.hanning(7) / np.hanning(7).sum()
    return np.clip(np.convolve(rms, kernel, mode="same"), 0, 1.2).astype(np.float32)


def logo_sprite(progress: float, size: int) -> np.ndarray:
    """The P drawn on as three neon strokes, then the waveform."""
    s = size / 512
    img = np.zeros((size, size, 3), np.float32)
    strokes = [
        [(136, 418), (136, 112), (282, 112), "arc", 120, (282, 352), (212, 352)],
        [(168, 418), (168, 144), (282, 144), "arc", 88, (282, 320), (232, 320)],
        [(200, 418), (200, 176), (282, 176), "arc", 56, (282, 288), (252, 288)],
    ]
    pts_all = []
    for st in strokes:
        pts = [st[0], st[1], st[2]]
        r = st[4]
        cx, cy = 282, st[2][1] + r
        for k in range(1, 41):
            ang = -math.pi / 2 + math.pi * k / 40
            pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
        pts.append(st[6])
        pts_all.append(np.array(pts, np.float32))
    bars = [(300, 402, 390), (330, 414, 378), (360, 426, 366), (390, 410, 382), (420, 400, 392)]
    grad = gradient_rgb(size, size) / 255.0
    mask = np.zeros((size, size), np.float32)
    for i, pts in enumerate(pts_all):
        seg = np.sqrt((np.diff(pts, axis=0) ** 2).sum(axis=1))
        total = seg.sum()
        take = min(1.0, max(0.0, progress * 1.4 - i * 0.12)) * total
        acc = 0.0
        for j in range(len(seg)):
            if acc >= take:
                break
            p0, p1 = pts[j], pts[j + 1]
            f = min(1.0, (take - acc) / max(seg[j], 1e-6))
            q = p0 + (p1 - p0) * f
            cv2.line(
                mask,
                (int(p0[0] * s), int(p0[1] * s)),
                (int(q[0] * s), int(q[1] * s)),
                1.0,
                max(2, int(17 * s)),
                cv2.LINE_AA,
            )
            acc += seg[j]
    wave = max(0.0, min(1.0, (progress - 0.7) / 0.3))
    for k, (x, y0, y1) in enumerate(bars):
        if wave * len(bars) > k:
            cv2.line(
                mask,
                (int(x * s), int(y0 * s)),
                (int(x * s), int(y1 * s)),
                1.0,
                max(2, int(17 * s)),
                cv2.LINE_AA,
            )
    glow = cv2.GaussianBlur(mask, (0, 0), 9 * s)
    a = np.clip(mask + glow * 0.9, 0, 1)
    img = grad * np.clip(mask + glow, 0, 1)[..., None]
    return np.dstack([img, a])


@lru_cache(maxsize=1)
def logo_small() -> np.ndarray:
    return logo_sprite(1.0, 84)


@lru_cache(maxsize=8)
def peaks(path: str, start: float, end: float, n: int) -> np.ndarray:
    rate = sf.info(path).samplerate
    data, _ = sf.read(
        path, start=int(max(0, start) * rate), stop=int(end * rate), dtype="float32", always_2d=True
    )
    mono = np.abs(data).max(axis=1)
    if len(mono) < n:
        return np.zeros(n, np.float32)
    k = len(mono) // n
    return mono[: k * n].reshape(n, k).max(axis=1)


def sung_line(song: Song, a: float):
    for l in song.lines:
        if l.start - 0.15 <= a <= l.end + 0.25:
            return l
    return None


def karaoke(frame: np.ndarray, song: Song, a: float, cx: float, y: float, size: int) -> None:
    line = sung_line(song, a)
    if not line:
        return
    done = min(1.0, max(0.0, (a - line.start) / max(0.3, line.end - line.start)))
    base = text_sprite(line.text, "SemiBold", size)
    lit = text_sprite(line.text, "SemiBold", size, fill="gradient")
    x = cx - base.shape[1] / 2
    alpha = min(1.0, (a - line.start + 0.15) / 0.2, (line.end + 0.25 - a) / 0.2)
    paste(frame, base, x, y, 0.55 * alpha)
    cut = int(base.shape[1] * done)
    if cut > 0:
        paste(frame, lit[:, :cut], x, y, alpha)


def caption(
    frame: np.ndarray,
    scene: Scene,
    u: float,
    x: float,
    y: float,
    title_size: int,
    sub_size: int,
    anchor="left",
    width=None,
) -> None:
    if not scene.caption:
        return
    alpha = ease(u / 0.12) * (1 - ease((u - 0.92) / 0.08))
    slide = (1 - ease(u / 0.15)) * 30
    _, h = text(
        frame,
        scene.caption,
        "ExtraBold",
        title_size,
        x - slide if anchor == "left" else x,
        y,
        alpha,
        fill="gradient",
        spacing=0.03,
        anchor=anchor,
        max_width=width,
    )
    text(
        frame,
        scene.sub,
        "Medium",
        sub_size,
        x,
        y + h + title_size * 0.1,
        alpha * 0.9,
        anchor=anchor,
        max_width=width,
    )


def vertical(frame: np.ndarray, world: World, a: float, t: float) -> np.ndarray:
    """1080 x 1920: a blurred, darkened sky of the frame behind it, the frame itself in the middle."""
    small = cv2.resize(frame, (VW // 4, VH // 4), interpolation=cv2.INTER_AREA)
    back = cv2.resize(cv2.GaussianBlur(small, (0, 0), 6), (VW, VH)) * 0.6
    pic = cv2.resize(frame, (VW, int(VW * H / W)), interpolation=cv2.INTER_AREA)
    y = int(VH * 0.47) - pic.shape[0] // 2
    back[y : y + pic.shape[0]] = pic
    return back


# ---------------------------------------------------------------------------------------------------
# Scenes. Each draws onto the frame at audio time `a`; `u` is how far the scene is (0..1).

# regions of the plug-in's window (1770 x 1140) in the tour's frames
DIALOG = (150, 30, 1620, 1110)
TIMELINE = (420, 330, 1770, 1140)


@lru_cache(maxsize=16)
def frames(tour: str, name: str) -> tuple[str, ...]:
    return tuple(str(p) for p in sorted((Path(tour) / name).glob("frame-*.jpg")))


def play(song: Song, name: str, u: float, crop=None, width: int = 1300, fallback: str | None = None):
    """The recorded scene at progress u: its frames fitted to the scene's length."""
    fs = frames(str(song.tour), name)
    if not fs:
        return picture(str(SCREENS / fallback), crop, width) if fallback else None
    k = min(len(fs) - 1, int(min(1.0, u) * (len(fs) - 1)))
    return picture(fs[k], crop, width)


def scene_window(frame, sprite, u, side="center", top=150, max_w=1100, max_h=820):
    if sprite is None:
        return
    scale = fit(sprite, max_w, max_h)
    w = sprite.shape[1] * scale
    slide = 1 - ease(u / 0.12)
    x = {"center": (W - w) / 2, "right": W - w - 100, "left": 100}[side]
    shadowed(frame, sprite, x + slide * 120, top + slide * 30, ease(u / 0.1), scale)


def scene_open(frame, song, a, u, ctx):
    lines = ["Your DAW has every tool you love.", "Now it writes the song with you."]
    k = 0 if u < 0.5 else 1
    v = (u * 2) % 1.0
    alpha = ease(v / 0.25) * (1 - ease((v - 0.8) / 0.2))
    text(frame, lines[k], "SemiBold", 62, W / 2, H * 0.40, alpha)


def scene_logo(frame, song, a, u, ctx):
    size = 360
    logo = logo_sprite(ease(u / 0.6), size)
    paste(frame, logo, W * 0.5 - 470 - size / 2 + 150, H * 0.5 - size / 2 - 40)
    x = W * 0.5 - 130
    alpha = ease((u - 0.25) / 0.3)
    paste(
        frame,
        text_sprite("PLENIO", "ExtraBold", 170, spacing=0.04),
        x,
        H * 0.5 - 200 + (1 - alpha) * 40,
        alpha,
    )
    paste(
        frame,
        text_sprite("MUSIC PRODUCTION SYSTEM", "SemiBold", 34, spacing=0.3),
        x + 6,
        H * 0.5 + 10,
        ease((u - 0.4) / 0.3),
    )
    pill_alpha = ease((u - 0.55) / 0.15)
    if pill_alpha > 0:
        pill = text_sprite("VST3 · IN YOUR DAW", "Bold", 34, spacing=0.2, glow=10)
        pw, ph = pill.shape[1] + 70, pill.shape[0] + 26
        m = np.zeros((ph + 40, pw + 40), np.float32)
        cv2.rectangle(m, (20, 20), (20 + pw, 20 + ph), 1.0, 4)
        m = cv2.GaussianBlur(m, (0, 0), 1.2)
        box = np.dstack(
            [
                gradient_rgb(pw + 40, ph + 40) / 255.0,
                np.clip(m * 2 + cv2.GaussianBlur(m, (0, 0), 10) * 2, 0, 1),
            ]
        )
        paste(frame, box, x - 14, H * 0.5 + 70, pill_alpha)
        paste(frame, pill, x - 14 + 20 + 35, H * 0.5 + 70 + 20 + 13, pill_alpha)


def scene_style(frame, song, a, u, ctx):
    scene_window(
        frame,
        play(song, "new-song", u, DIALOG, 1000, "brief.png"),
        u,
        "right",
        top=175,
        max_w=1060,
        max_h=790,
    )


def scene_making(frame, song, a, u, ctx):
    sprite = play(song, "timelapse", u, None, 1300, "making.png")
    if sprite is None:
        return
    scale = fit(sprite, 1180, 770) * (1.0 + 0.05 * ease(u))
    w = sprite.shape[1] * scale
    shadowed(frame, sprite, W - w - 100, 185, ease(u / 0.08), scale)


def scene_takes(frame, song, a, u, ctx):
    scene_window(
        frame, play(song, "takes", u, None, 1300, "song.png"), u, "right", top=175, max_w=1180, max_h=770
    )


def scene_edit(frame, song, a, u, ctx):
    scene_window(frame, play(song, "notes", u, TIMELINE, 1200), u, "right", top=175, max_w=1180, max_h=770)


def scene_title(frame, song, a, u, ctx):
    pulse = ctx["world"].beat(a)
    for i, line in enumerate(("PLENIO IS IN", "YOUR DAW")):
        sp = text_sprite(line, "Black", 160, fill="gradient", spacing=0.02, glow=18)
        scale = 1.0 + 0.03 * pulse + 0.06 * (1 - ease(u / 0.15))
        paste(
            frame,
            sp,
            W / 2 - sp.shape[1] * scale / 2,
            H * 0.28 + i * 185 - sp.shape[0] * (scale - 1) / 2,
            ease(u / 0.05),
            scale,
        )
    if u < 0.06:
        frame[:] = frame + (1 - u / 0.06) * 0.8


def scene_stems(frame, song, a, u, ctx):
    """The take's waveform splits into its stems."""
    t0, t1 = ctx["scene_start"], ctx["scene_end"]
    n = 900
    left, right = 300, W - 140
    mix = peaks(str(song.audio), t0, t1, n)
    split = ease((u - 0.12) / 0.3)
    names = [s for s in ("vocals", "drums", "bass", "other", "rest") if s in song.stems]
    rows = max(1, len(names))
    top, bottom = 230, H - 250
    lane = (bottom - top) / rows
    xs = np.linspace(left, right, n)
    head = int(n * u)
    for i, name in enumerate(names):
        y_split = top + lane * (i + 0.5)
        y = H / 2 + (y_split - H / 2) * split
        data = peaks(str(song.stems[name]), t0, t1, n) if split > 0 else mix
        amp = (lane * 0.42 if split > 0.5 else 160) * data
        col = np.array(STEM_COLORS[name], np.float32) / 255.0
        for j in range(0, n, 2):
            lit = 1.0 if j <= head else 0.45
            cv2.line(
                frame,
                (int(xs[j]), int(y - amp[j])),
                (int(xs[j]), int(y + amp[j])),
                tuple(float(c) for c in col * lit),
                2,
                cv2.LINE_AA,
            )
        text(frame, name.upper(), "Bold", 26, 130, y - 16, split, spacing=0.2, anchor="left")


def scene_tempo(frame, song, a, u, ctx):
    """Bar lines on the waveform, with the tempo Plenio measured for each bar."""
    t0, t1 = a - 3.0, a + 9.0
    left, right, mid = 140, W - 140, H * 0.53
    span0, span1 = max(0.0, round(ctx["scene_start"] - 3, 1)), ctx["scene_end"] + 9.0
    data = peaks(str(song.audio), span0, span1, 1400)
    n = len(data)
    for j in range(0, n, 2):
        t = span0 + (span1 - span0) * j / n
        if t < t0 or t > t1:
            continue
        x = left + (t - t0) / (t1 - t0) * (right - left)
        amp = data[j] * 150
        lit = 1.0 if t <= a else 0.5
        cv2.line(
            frame,
            (int(x), int(mid - amp)),
            (int(x), int(mid + amp)),
            (0.55 * lit, 0.85 * lit, 0.8 * lit),
            2,
            cv2.LINE_AA,
        )
    for bar, bpm in song.tempos:
        if t0 <= bar <= t1:
            x = left + (bar - t0) / (t1 - t0) * (right - left)
            cv2.line(
                frame, (int(x), int(mid - 230)), (int(x), int(mid + 200)), (1.0, 0.24, 0.55), 2, cv2.LINE_AA
            )
            text(frame, f"{bpm:.1f}", "Bold", 24, x + 8, mid - 262, 0.95, anchor="left")
    px = left + (a - t0) / (t1 - t0) * (right - left)
    cv2.line(frame, (int(px), int(mid - 280)), (int(px), int(mid + 230)), (1.0, 1.0, 1.0), 2, cv2.LINE_AA)


def scene_reaper(frame, song, a, u, ctx):
    shot = next((SCREENS / n for n in ("reaper-tracks.png", "daw-tab.png") if (SCREENS / n).is_file()), None)
    if shot:
        scene_window(frame, picture(str(shot), None, 1500), u, "center", top=200, max_w=1580, max_h=740)


def scene_cover(frame, song, a, u, ctx):
    if song.cover and song.cover.is_file():
        scene_window(frame, picture(str(song.cover), None, 640), u, "right", top=210, max_w=640, max_h=640)


def scene_daws(frame, song, a, u, ctx):
    names = ["REAPER", "CUBASE", "STUDIO ONE", "ABLETON LIVE", "FL STUDIO", "BITWIG"]
    text(
        frame,
        "IN THE DAW YOU ALREADY USE",
        "ExtraBold",
        58,
        W / 2,
        H * 0.17,
        ease(u / 0.12),
        fill="gradient",
        spacing=0.03,
    )
    for i, name in enumerate(names):
        alpha = ease((u - 0.08 - i * 0.07) / 0.12)
        row, col = divmod(i, 3)
        text(frame, name, "Bold", 54, W / 2 + (col - 1) * 520, H * 0.38 + row * 120, alpha, spacing=0.06)
    text(frame, "and every other VST3 host", "Medium", 34, W / 2, H * 0.66, ease((u - 0.55) / 0.15))


def scene_outro(frame, song, a, u, ctx):
    paste(frame, logo_sprite(1.0, 300), W / 2 - 150, H * 0.11, ease(u / 0.2))
    text(frame, "PLENIO VST3", "ExtraBold", 96, W / 2, H * 0.44, ease((u - 0.1) / 0.2), spacing=0.05)
    text(
        frame,
        "GENERATE THE SONG. KEEP WORKING IN YOUR DAW.",
        "SemiBold",
        32,
        W / 2,
        H * 0.56,
        ease((u - 0.18) / 0.2),
        spacing=0.1,
    )
    text(
        frame,
        "FREE & OPEN SOURCE  ·  RUNS ON YOUR GPU",
        "SemiBold",
        28,
        W / 2,
        H * 0.62,
        ease((u - 0.24) / 0.2),
        spacing=0.14,
    )
    text(frame, URL, "Bold", 42, W / 2, H * 0.69, ease((u - 0.3) / 0.2), fill="gradient")
    text(
        frame,
        f"Music: “{song.title}”, made with Plenio VST3 (YuE2, CC BY-NC 4.0)",
        "Medium",
        22,
        W / 2,
        H * 0.9,
        0.75 * ease((u - 0.3) / 0.2),
    )
    fade = ease((u - 0.84) / 0.16)
    frame[:] = frame * (1 - fade)


# ---------------------------------------------------------------------------------------------------
# The timeline: scenes keyed to bars and sung lines


@dataclass
class Scene:
    start: float
    end: float
    draw: callable
    caption: str = ""
    sub: str = ""


NO_LYRICS = ("scene_open", "scene_logo", "scene_title", "scene_daws", "scene_outro")


def timeline(song: Song) -> tuple[list[Scene], float, float]:
    bars = song.bars
    section = lambda name: next(((s, e) for n, s, e in song.sections if n == name), (None, None))
    verse, chorus = section("verse"), section("chorus")
    if verse[0] is None or chorus[0] is None:
        sys.exit("the song needs a verse and a chorus (its lyrics' headers)")
    bar_at = lambda t: int(np.argmin(np.abs(np.array(bars) - t)))
    v0, c0, c1 = bar_at(verse[0]), bar_at(chorus[0]), bar_at(chorus[1])
    in_verse = [l for l in song.lines if verse[0] - 0.5 <= l.start < chorus[0] - 0.5]
    in_chorus = [l for l in song.lines if chorus[0] - 0.5 <= l.start < chorus[1] - 0.5]
    vb = [bars[v0]] + [l.start for l in in_verse[1:4]] + [bars[c0]]
    cb = [bars[c0]] + [l.start for l in in_chorus[1:4]] + [bars[c1]]
    while len(vb) < 5:
        vb.insert(-1, (vb[-2] + vb[-1]) / 2)
    while len(cb) < 5:
        cb.insert(-1, (cb[-2] + cb[-1]) / 2)
    start = bars[max(0, v0 - 4)]
    end = bars[min(len(bars) - 1, c1 + 1)]
    # the chorus: a scene on every half of its lines; the outro on its last line
    half = lambda x, y: (x + y) / 2
    scenes = [
        Scene(start, bars[max(0, v0 - 2)], scene_open),
        Scene(bars[max(0, v0 - 2)], vb[0], scene_logo),
        Scene(vb[0], vb[1], scene_style, "PICK A STYLE", "250 of them, an idea, or your own words"),
        Scene(
            vb[1], vb[2], scene_making, "PLENIO MAKES IT", "writes, composes and sings it, on your own GPU"
        ),
        Scene(
            vb[2],
            vb[3],
            scene_takes,
            "EVERY TAKE ON YOUR TRACK",
            "up to four per run, in time with your project",
        ),
        Scene(
            vb[3],
            vb[4],
            scene_edit,
            "MOVE A NOTE. CHANGE A CHORD.",
            "render again, and it sings exactly that",
        ),
        Scene(cb[0], half(cb[0], cb[1]), scene_title),
        Scene(
            half(cb[0], cb[1]),
            cb[1],
            scene_stems,
            "STEMS · MIDI · TEMPO MAP",
            "dragged into your project, all from bar 1",
        ),
        Scene(
            cb[1],
            half(cb[1], cb[2]),
            scene_tempo,
            "THE GRID FOLLOWS THE SONG",
            "a tempo map from the bars measured in the take",
        ),
        Scene(
            half(cb[1], cb[2]),
            cb[2],
            scene_reaper,
            "REAPER: THE SONG ON ITS TRACKS",
            "every take as a REAPER take, in one click",
        ),
        Scene(
            cb[2],
            half(cb[2], cb[3]),
            scene_cover,
            "COVER ART FOR EVERY TAKE",
            "and words, melody and chords to change",
        ),
        Scene(half(cb[2], cb[3]), cb[3], scene_daws),
        Scene(cb[3], end, scene_outro),
    ]
    return scenes, start, end


# ---------------------------------------------------------------------------------------------------


def music(song: Song, start: float, end: float, out: Path) -> Path:
    """The teaser's music: the take from `start` to `end`, faded, at -14 LUFS."""
    data, rate = sf.read(str(song.audio), dtype="float32", always_2d=True)
    seg = data[int(start * rate) : int(end * rate)].copy()
    n_in, n_out = int(0.25 * rate), int(4.0 * rate)
    seg[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    seg[-n_out:] *= np.linspace(1, 0, n_out)[:, None] ** 1.5
    raw = out / "teaser-raw.wav"
    sf.write(str(raw), seg, rate, subtype="PCM_24")
    clip = out / "teaser-audio.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(raw),
            "-af",
            "loudnorm=I=-14:TP=-1:LRA=11",
            "-ar",
            str(rate),
            str(clip),
        ],
        check=True,
    )
    raw.unlink(missing_ok=True)
    return clip


def render(song_folder: Path, tour: Path, out: Path, preview: list[float] | None = None) -> None:
    """Both videos; with `preview` (seconds into the teaser) only those frames, as PNG."""
    song = load_song(song_folder, tour)
    scenes, start, end = timeline(song)
    data, rate = sf.read(str(song.audio), dtype="float32", always_2d=True)
    world = World(song, envelope(data, rate))
    out.mkdir(parents=True, exist_ok=True)
    total = int((end - start) * FPS)
    print(f"{song.title}: {end - start:.1f} s from {start:.2f} s, {total} frames, {len(scenes)} scenes")
    clip = None if preview else music(song, start, end, out)

    def encoder(path: Path, w: int, h: int):
        """ffmpeg writes <name>.part.mp4: an MP4 opens only once it is finished, so the video gets its name only then."""
        part = path.with_name(path.stem + ".part" + path.suffix)
        args = [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{w}x{h}",
            "-r",
            str(FPS),
            "-i",
            "-",
            "-i",
            str(clip),
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "17",
            "-pix_fmt",
            "yuv420p",
            "-profile:v",
            "high",
            "-c:a",
            "aac",
            "-b:a",
            "256k",
            "-movflags",
            "+faststart",
            "-shortest",
            str(part),
        ]
        proc = subprocess.Popen(args, stdin=subprocess.PIPE)
        proc.part, proc.final = part, path
        return proc

    wide = None if preview else encoder(out / "plenio-vst3-teaser.mp4", W, H)
    tall = None if preview else encoder(out / "plenio-vst3-teaser-vertical.mp4", VW, VH)
    poster = False
    for i in [int(s * FPS) for s in preview] if preview else range(total):
        a = start + i / FPS
        t = i / FPS
        scene = next((s for s in scenes if s.start <= a < s.end), scenes[-1])
        u = (a - scene.start) / max(1e-6, scene.end - scene.start)
        ctx = {"world": world, "scene_start": scene.start, "scene_end": scene.end}
        energy = 1.6 if scene.draw in (scene_title, scene_making) else 1.0
        frame = world.draw(a, t, energy)
        base = frame.copy() if scene.draw is scene_title else None
        scene.draw(frame, song, a, u, ctx)
        lyrics = scene.draw.__name__ not in NO_LYRICS
        # wide: the caption top left, the sung line at the bottom
        wide_frame = frame.copy()
        caption(wide_frame, scene, u, 110, 64, 54, 26)
        if lyrics:
            karaoke(wide_frame, song, a, W / 2, H - 112, 44)
        # tall: the wide picture in the middle, the caption above, the lyrics below
        tall_frame = vertical(frame if base is None else base, world, a, t)
        if base is not None:
            paste(
                tall_frame,
                logo_sprite(min(1.0, u * 3), 420),
                VW / 2 - 210,
                VH * 0.47 - 210,
                1.0,
                1.0 + 0.04 * world.beat(a),
            )
            for k, line in enumerate(("PLENIO IS IN", "YOUR DAW")):
                sp = text_sprite(line, "Black", 104, fill="gradient", spacing=0.02, glow=14)
                paste(tall_frame, sp, VW / 2 - sp.shape[1] / 2, 190 + k * 130, ease(u / 0.05))
        if scene.draw.__name__ not in ("scene_open", "scene_logo", "scene_title", "scene_outro"):
            paste(tall_frame, logo_small(), VW / 2 - 260, 96)
            text(
                tall_frame,
                "PLENIO VST3",
                "ExtraBold",
                44,
                VW / 2 - 260 + 104,
                116,
                0.95,
                spacing=0.05,
                anchor="left",
            )
        if scene.caption:
            caption(tall_frame, scene, u, VW / 2, 420, 64, 32, anchor="center", width=VW - 90)
        if lyrics:
            karaoke(tall_frame, song, a, VW / 2, 1330, 46)
        if scene.draw is not scene_outro:
            text(tall_frame, URL, "Bold", 30, VW / 2, VH - 170, 0.85, fill="gradient")
        to8 = lambda f: (np.clip(f, 0, 1) * 255).astype(np.uint8)
        if preview:
            Image.fromarray(to8(wide_frame)).save(out / f"preview-{i / FPS:05.1f}.png")
            Image.fromarray(to8(tall_frame)).save(out / f"preview-{i / FPS:05.1f}-vertical.png")
            continue
        wide.stdin.write(to8(wide_frame).tobytes())
        tall.stdin.write(to8(tall_frame).tobytes())
        if scene.draw is scene_title and not poster and u > 0.4:
            poster = True
            Image.fromarray(to8(wide_frame)).save(out / "teaser-poster.png")
        if i % 150 == 0:
            print(f"  {i}/{total}")
    for p in (wide, tall):
        if p:
            p.stdin.close()
            if p.wait() != 0:
                sys.exit(f"ffmpeg failed on {p.final.name}")
            p.part.replace(p.final)
    if clip:
        clip.unlink(missing_ok=True)
    print("done")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    at = [float(s) for s in sys.argv[4].split(",")] if len(sys.argv) > 4 else None
    render(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), at)
