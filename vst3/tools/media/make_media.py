"""The README's and the tutorial's animations, and the clips for the videos, from the tour (tools/media/tour.mjs).

    python tools/media/make_media.py anims <tour>          docs/media/anim/<scene>.gif
    python tools/media/make_media.py clips <tour> <out>    <out>/<scene>.mp4 (1920 x 1080, 30 fps, for the videos)

The tour leaves <tour>/<scene>/frame-*.jpg and frames.txt (every frame's duration: the recording's own pace) and,
for the time-lapse, frames a second and a half apart. ffmpeg (on the PATH) does the rest: one palette per
animation, so the frames do not flicker.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ANIM = ROOT / "docs" / "media" / "anim"

# scene -> (crop in the window's pixels (x, y, w, h) or None, width of the animation, frames a second)
SCENES = {
    "new-song": (None, 900, 12),
    "timelapse": (None, 900, 10),
    "takes": ((0, 60, 1770, 1080), 900, 12),
    "lyrics": (None, 900, 12),
    "notes": ((420, 330, 1350, 810), 900, 12),
    "daw": (None, 900, 12),
    "cover": (None, 900, 12),
    "library": (None, 900, 12),
}
TIMELAPSE_FRAME = 0.12  # seconds a time-lapse frame stays: a minute and a half of making becomes about 7 s


def concat_list(scene_dir: Path) -> Path:
    """The scene's frames with their durations; the time-lapse gets one written here."""
    listed = scene_dir / "frames.txt"
    if listed.exists():
        return listed
    frames = sorted(scene_dir.glob("frame-*.jpg"))
    if not frames:
        sys.exit(f"no frames in {scene_dir}")
    text = "".join(f"file '{f.name}'\nduration {TIMELAPSE_FRAME}\n" for f in frames)
    # the takes that arrived stay a moment longer
    text += f"file '{frames[-1].name}'\nduration 1.5\nfile '{frames[-1].name}'\n"
    listed.write_text(text, encoding="utf-8")
    return listed


def crop_filter(crop) -> str:
    return f"crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]}," if crop else ""


def ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def anims(tour: Path) -> None:
    ANIM.mkdir(parents=True, exist_ok=True)
    for scene, (crop, width, fps) in SCENES.items():
        folder = tour / scene
        if not folder.is_dir():
            print(f"{scene}: not in the tour, skipped")
            continue
        out = ANIM / f"{scene}.gif"
        graph = (
            f"{crop_filter(crop)}fps={fps},scale={width}:-2:flags=lanczos,split[a][b];"
            "[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle"
        )
        ffmpeg(
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list(folder)),
            "-filter_complex",
            graph,
            "-loop",
            "0",
            str(out),
        )
        print(f"{out.relative_to(ROOT)}: {out.stat().st_size / 1e6:.1f} MB")


def clips(tour: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for scene in SCENES:
        folder = tour / scene
        if not folder.is_dir():
            continue
        target = out / f"{scene}.mp4"
        graph = "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x07040d,format=yuv420p"
        ffmpeg(
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list(folder)),
            "-vf",
            graph,
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-preset",
            "slow",
            "-movflags",
            "+faststart",
            str(target),
        )
        print(f"{target}: {target.stat().st_size / 1e6:.1f} MB")


def main() -> None:
    if len(sys.argv) < 3 or sys.argv[1] not in ("anims", "clips"):
        sys.exit(__doc__)
    tour = Path(sys.argv[2])
    if sys.argv[1] == "anims":
        anims(tour)
    else:
        clips(tour, Path(sys.argv[3]) if len(sys.argv) > 3 else tour / "clips")


if __name__ == "__main__":
    main()
