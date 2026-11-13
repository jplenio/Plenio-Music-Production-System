"""The tutorial as a video: Plenio on a track, a song made, its takes, words and notes changed, into the project.

    python tools/media/make_tutorial.py <song folder> <tour folder> <out.mp4> [seconds,seconds,...]

Chapters of the tour's real frames (tools/media/tour.mjs) and the screenshots in docs/media/screens, a camera that
moves to the part of the window each step is about, a caption for every step, and quietly under it the song the tour
made. REAPER's own steps come from clips in the tour folder when they are there (reaper-insert.mp4, reaper-tracks.mp4,
recorded from REAPER's window), else from their screenshots. Beside the video: `tutorial-chapters.txt` (for YouTube's
description) and `tutorial-thumbnail.png`. With seconds, only those frames, as PNG beside the video; with `thumbnail`,
only the thumbnail.
The music is a YuE2 song, so the video is CC BY-NC 4.0, like the teaser. Needs what make_teaser.py needs.
"""

from __future__ import annotations

import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import make_teaser as mt  # noqa: E402

W, H, FPS = mt.W, mt.H, mt.FPS
SCREENS = mt.SCREENS
STAGE = (90, 70, W - 90, H - 200)  # where the window is shown (the caption under it)
FULL = None  # the whole picture
# REAPER's clips, recorded from a 2560 x 1440 screen: the camera on the instrument dialog and the routing question, and
# on the track list with Plenio's DAW tab beside it
REAPER_DIALOGS = (720, 190, 1500, 1090)
REAPER_PUT = (0, 130, 1700, 1120)


@dataclass
class Step:
    """One caption over one source: a tour scene (its frames at their own pace), a clip, or a still."""

    title: str
    text: str
    source: str  # "scene:<name>", "clip:<file>", "shot:<file>"
    view: tuple | None = FULL  # the part of the source the camera shows (x, y, w, h), in its pixels
    seconds: float | None = None  # a still's length; a scene or clip takes its own (times `speed`)
    speed: float = 1.0
    frames: list = field(default_factory=list)  # (path or index, seconds) once planned


CHAPTERS = [
    (
        "Plenio on a track",
        [
            Step(
                "Put Plenio on a track",
                "REAPER: Insert › Virtual instrument on new track › Plenio, then No to the routing question",
                "clip:reaper-insert.mp4",
                REAPER_DIALOGS,
            ),
            Step(
                "Plenio on a track", "its window opens over the track", "shot:reaper-plenio.png", seconds=3.5
            ),
            Step(
                "Accept the models' licences, once",
                "YuE2 and SheetSage2: CC BY-NC 4.0, for non-commercial use",
                "shot:licence.png",
                (480, 240, 820, 660),
                seconds=4.0,
            ),
        ],
    ),
    (
        "Make a song",
        [
            Step(
                "New song: pick a style",
                "250 of them; a style fills the brief, change any field",
                "scene:new-song",
                speed=1.0,
            ),
            Step(
                "Plenio makes the takes",
                "it writes the lyrics, composes, sings and plays, on your GPU",
                "scene:timelapse",
                speed=1.0,
            ),
        ],
    ),
    (
        "Your song",
        [
            Step(
                "Every take on this track",
                "the cover, the stars, the takes, the stems, the lyrics, the chords, the notes",
                "shot:song.png",
                seconds=4.5,
            ),
            Step(
                "Choose a take, solo a stem",
                "it plays in time with your project, from bar 1",
                "scene:takes",
                speed=1.0,
            ),
        ],
    ),
    (
        "Change it",
        [
            Step(
                "Change a line of the lyrics",
                "the next take sings it, with new notes for the new words",
                "scene:lyrics",
                speed=1.0,
            ),
            Step(
                "Move a note, choose another chord",
                "the next take sings exactly that",
                "scene:notes",
                (420, 330, 1350, 810),
                speed=1.0,
            ),
        ],
    ),
    (
        "Into your project",
        [
            Step(
                "The DAW tab",
                "drag the take, its stems, the MIDI, the tempo map, a click: all from bar 1",
                "scene:daw",
                speed=1.0,
            ),
            Step(
                "REAPER: Put on tracks",
                "every take as a REAPER take, the stems, the MIDI, the lyrics, the tempo map",
                "clip:reaper-tracks.mp4",
                REAPER_PUT,
            ),
            Step(
                "REAPER: the song on its tracks",
                "choose a take on the take lane: Plenio follows",
                "shot:reaper-tracks.png",
                seconds=4.0,
            ),
        ],
    ),
    (
        "And more",
        [
            Step(
                "Cover art for every take",
                "kept as cover.jpg with the song, the icon of REAPER's tracks",
                "scene:cover",
                speed=1.0,
            ),
            Step(
                "Your songs, also offline",
                "a saved project plays and edits without ComfyUI: only Generate needs it",
                "scene:library",
                speed=1.0,
            ),
        ],
    ),
]


def plan(tour: Path) -> list[tuple[int, Step]]:
    """The steps whose source is there, each with its frames and how long each shows."""
    out = []
    for c, (_, steps) in enumerate(CHAPTERS):
        for step in steps:
            kind, name = step.source.split(":", 1)
            if kind == "scene":
                listed = tour / name / "frames.txt"
                folder = tour / name
                if listed.exists():
                    rows = listed.read_text(encoding="utf-8").splitlines()
                    files = [r[6:-1] for r in rows if r.startswith("file ")]
                    durations = [float(r.split()[1]) for r in rows if r.startswith("duration ")]
                    step.frames = [
                        (folder / f, d / step.speed) for f, d in zip(files, durations, strict=False)
                    ]
                else:  # the time-lapse: a frame each 0.12 s
                    step.frames = [(f, 0.12 / step.speed) for f in sorted(folder.glob("frame-*.jpg"))] + [
                        (f, 1.5) for f in sorted(folder.glob("frame-*.jpg"))[-1:]
                    ]
            elif kind == "clip":
                path = tour / name
                if not path.exists():
                    continue
                cap = cv2.VideoCapture(str(path))
                fps = cap.get(cv2.CAP_PROP_FPS) or 30
                n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                cap.release()
                step.frames = [((path, k), 1 / fps / step.speed) for k in range(n)]
            else:
                path = SCREENS / name
                if not path.exists():
                    continue
                step.frames = [(path, step.seconds or 3.0)]
            if step.frames:
                out.append((c, step))
    return out


_clips: dict[str, list] = {}  # a clip: [its capture, the next frame it reads, the last frame read]


def picture_of(ref) -> np.ndarray:
    """A source frame as RGB float: a file, or (clip, frame number). A clip is read on from where it stands: seeking
    for every frame would decode from the last keyframe each time."""
    if isinstance(ref, tuple):
        path, k = ref
        entry = _clips.get(str(path))
        if entry is None:
            entry = _clips[str(path)] = [cv2.VideoCapture(str(path)), 0, None]
        cap, at, last = entry
        if k == at - 1 and last is not None:
            return last
        if k != at:
            cap.set(cv2.CAP_PROP_POS_FRAMES, k)
        ok, bgr = cap.read()
        if not ok:
            return np.zeros((H, W, 3), np.float32)
        entry[1], entry[2] = k + 1, cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        return entry[2]
    return np.asarray(Image.open(ref).convert("RGB"), np.float32) / 255.0


def place(
    canvas: np.ndarray, img: np.ndarray, view: tuple | None, alpha: float, stage: tuple = STAGE
) -> None:
    """The camera: the view of the source fitted into the stage, with a neon frame and shadow."""
    x, y, w, h = view if view else (0, 0, img.shape[1], img.shape[0])
    crop = img[int(y) : int(y + h), int(x) : int(x + w)]
    sx0, sy0, sx1, sy1 = stage
    scale = min((sx1 - sx0) / crop.shape[1], (sy1 - sy0) / crop.shape[0])
    cw, ch = max(1, int(crop.shape[1] * scale)), max(1, int(crop.shape[0] * scale))
    pic = cv2.resize(crop, (cw, ch), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    sprite = np.dstack([pic, np.ones((ch, cw), np.float32)])
    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=16, fill=255)
    sprite[..., 3] = np.asarray(mask, np.float32) / 255.0
    border = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(border).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=16, outline=255, width=3)
    b = np.asarray(border, np.float32)[..., None] / 255.0
    sprite[..., :3] = sprite[..., :3] * (1 - b) + mt.gradient_rgb(cw, ch) / 255.0 * b
    mt.shadowed(canvas, sprite, sx0 + ((sx1 - sx0) - cw) / 2, sy0 + ((sy1 - sy0) - ch) / 2, alpha)


def caption(canvas: np.ndarray, c: int, step: Step, u: float) -> None:
    alpha = mt.ease(u / 0.06) * (1 - mt.ease((u - 0.96) / 0.04))
    mt.text(
        canvas,
        f"{c + 1}  ·  {CHAPTERS[c][0].upper()}",
        "Bold",
        22,
        110,
        H - 178,
        0.8 * alpha,
        spacing=0.2,
        anchor="left",
    )
    _, h = mt.text(canvas, step.title, "ExtraBold", 46, 110, H - 146, alpha, fill="gradient", anchor="left")
    mt.text(canvas, step.text, "Medium", 28, 110, H - 146 + h + 2, 0.92 * alpha, anchor="left")


def card(canvas: np.ndarray, c: int, u: float) -> None:
    alpha = mt.ease(u / 0.2) * (1 - mt.ease((u - 0.8) / 0.2))
    mt.text(canvas, f"{c + 1}", "Black", 160, W / 2, H * 0.30, alpha, fill="gradient", glow=16)
    mt.text(canvas, CHAPTERS[c][0].upper(), "ExtraBold", 72, W / 2, H * 0.52, alpha, spacing=0.05)


def intro(canvas: np.ndarray, u: float) -> None:
    mt.paste(canvas, mt.logo_sprite(mt.ease(u / 0.5), 320), W / 2 - 160, H * 0.14)
    mt.text(canvas, "PLENIO VST3", "ExtraBold", 96, W / 2, H * 0.50, mt.ease((u - 0.3) / 0.2), spacing=0.05)
    mt.text(
        canvas,
        "Your first song in your DAW, step by step",
        "SemiBold",
        40,
        W / 2,
        H * 0.63,
        mt.ease((u - 0.4) / 0.2),
    )
    fade = mt.ease((u - 0.85) / 0.15)
    canvas[:] = canvas * (1 - 0.6 * fade)


def outro(canvas: np.ndarray, u: float) -> None:
    mt.paste(canvas, mt.logo_sprite(1.0, 240), W / 2 - 120, H * 0.10, mt.ease(u / 0.2))
    mt.text(
        canvas,
        "NOW MAKE YOURS",
        "ExtraBold",
        92,
        W / 2,
        H * 0.40,
        mt.ease((u - 0.1) / 0.2),
        fill="gradient",
        spacing=0.04,
    )
    mt.text(
        canvas,
        "Download, tutorial and every DAW's steps",
        "SemiBold",
        34,
        W / 2,
        H * 0.55,
        mt.ease((u - 0.2) / 0.2),
    )
    mt.text(canvas, mt.URL, "Bold", 44, W / 2, H * 0.62, mt.ease((u - 0.25) / 0.2), fill="gradient")
    mt.text(
        canvas,
        "Free & open source  ·  runs on your GPU  ·  songs for non-commercial use (YuE2, CC BY-NC 4.0)",
        "Medium",
        24,
        W / 2,
        H * 0.86,
        0.8 * mt.ease((u - 0.3) / 0.2),
    )
    canvas[:] = canvas * (1 - mt.ease((u - 0.85) / 0.15))


def thumbnail(world, out: Path) -> None:
    """The video's picture for YouTube and the posts: the title on the left, Plenio in REAPER on the right."""
    canvas = world.draw(30.0, 30.0, 0.7) * 0.85
    shot = next((SCREENS / n for n in ("reaper-daw.png", "song.png") if (SCREENS / n).is_file()), None)
    if shot:
        view = (0, 62, 1500, 1000) if shot.name.startswith("reaper") else None
        place(
            canvas, picture_of(shot), view, 1.0, stage=(int(W * 0.47), int(H * 0.15), W - 70, int(H * 0.85))
        )
    mt.text(canvas, "TUTORIAL", "Bold", 34, 110, H * 0.17, 0.9, spacing=0.3, anchor="left")
    for i, line in enumerate(("YOUR FIRST", "SONG IN", "YOUR DAW")):
        mt.text(
            canvas, line, "Black", 100, 104, H * 0.25 + i * 118, 1.0, fill="gradient", glow=14, anchor="left"
        )
    mt.paste(canvas, mt.logo_sprite(1.0, 96), 110, H * 0.73)
    mt.text(canvas, "PLENIO VST3", "ExtraBold", 52, 226, H * 0.73 + 20, 1.0, spacing=0.05, anchor="left")
    Image.fromarray((np.clip(canvas, 0, 1) * 255).astype(np.uint8)).save(out)


def render(song_folder: Path, tour: Path, out: Path, preview: list[float] | None = None) -> None:
    steps = plan(tour)
    song = mt.load_song(song_folder, tour)
    data, rate = sf.read(str(song.audio), dtype="float32", always_2d=True)
    world = mt.World(song, mt.envelope(data, rate))
    # the timeline: intro, then per chapter a card and its steps, then the outro
    segments = [("intro", None, None, 4.0)]
    last = None
    for c, step in steps:
        if c != last:
            segments.append(("card", c, None, 1.6))
            last = c
        segments.append(("step", c, step, sum(d for _, d in step.frames)))
    segments.append(("outro", None, None, 6.0))
    total = sum(s[3] for s in segments)
    n = int(total * FPS)
    chapters, at = [], 0.0
    for kind, c, _step, d in segments:
        if kind == "card":
            chapters.append((at, CHAPTERS[c][0]))
        at += d
    print(f"tutorial: {total:.1f} s, {len(steps)} steps")
    for t0, name in chapters:
        print(f"  {int(t0 // 60)}:{int(t0 % 60):02d} {name}")
    # the music: the song, quietly, looped if the video is longer, faded at the end
    bed = None
    if not preview:
        need = int(total * rate) + rate
        loop = np.concatenate([data] * (1 + need // len(data)))[:need]
        loop[-4 * rate :] *= np.linspace(1, 0, 4 * rate)[:, None]
        raw = out.with_suffix(".raw.wav")
        sf.write(str(raw), loop, rate, subtype="PCM_24")
        bed = out.with_suffix(".bed.wav")
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(raw),
                "-af",
                "loudnorm=I=-20:TP=-2:LRA=11",
                "-ar",
                str(rate),
                str(bed),
            ],
            check=True,
        )
        raw.unlink(missing_ok=True)
        part = out.with_name(out.stem + ".part" + out.suffix)
        enc = subprocess.Popen(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-f",
                "rawvideo",
                "-pix_fmt",
                "rgb24",
                "-s",
                f"{W}x{H}",
                "-r",
                str(FPS),
                "-i",
                "-",
                "-i",
                str(bed),
                "-c:v",
                "libx264",
                "-preset",
                "slow",
                "-crf",
                "18",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-movflags",
                "+faststart",
                "-shortest",
                str(part),
            ],
            stdin=subprocess.PIPE,
        )
    frames_at = [int(s * FPS) for s in preview] if preview else range(n)
    for i in frames_at:
        t = i / FPS
        acc = 0.0
        for kind, c, step, d in segments:
            if t < acc + d or (kind, c, step, d) == segments[-1]:
                break
            acc += d
        u = (t - acc) / max(1e-6, d)
        canvas = world.draw(t % max(1.0, len(data) / rate - 1), t, 0.6) * 0.85
        if kind == "intro":
            intro(canvas, u)
        elif kind == "outro":
            outro(canvas, u)
        elif kind == "card":
            card(canvas, c, u)
        else:
            local, ref = t - acc, step.frames[-1][0]
            for r, dur in step.frames:
                if local < dur:
                    ref = r
                    break
                local -= dur
            place(canvas, picture_of(ref), step.view, mt.ease(u / 0.05))
            caption(canvas, c, step, u)
        frame = (np.clip(canvas, 0, 1) * 255).astype(np.uint8)
        if preview:
            Image.fromarray(frame).save(out.parent / f"tutorial-{t:05.1f}.png")
        else:
            enc.stdin.write(frame.tobytes())
            if i % 300 == 0:
                print(f"  {i}/{n}")
    if not preview:
        enc.stdin.close()
        if enc.wait() != 0:
            sys.exit("ffmpeg failed on the tutorial")
        part.replace(out)  # the finished name only for a finished video: an MP4 does not open before
        bed.unlink(missing_ok=True)
        # YouTube shows chapters only when the first starts at 0:00 and each lasts 10 s or more: the 4-second intro
        # opens the first chapter instead of being one
        marks = [(0.0, chapters[0][1])] + chapters[1:]
        (out.parent / "tutorial-chapters.txt").write_text(
            "\n".join(f"{int(t0 // 60)}:{int(t0 % 60):02d} {name}" for t0, name in marks) + "\n",
            encoding="utf-8",
        )
        thumbnail(world, out.parent / "tutorial-thumbnail.png")
    print("done")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    if len(sys.argv) > 4 and sys.argv[4] == "thumbnail":
        song = mt.load_song(Path(sys.argv[1]), Path(sys.argv[2]))
        data, rate = sf.read(str(song.audio), dtype="float32", always_2d=True)
        thumbnail(
            mt.World(song, mt.envelope(data, rate)), Path(sys.argv[3]).parent / "tutorial-thumbnail.png"
        )
        sys.exit(0)
    at = [float(s) for s in sys.argv[4].split(",")] if len(sys.argv) > 4 else None
    render(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), at)
