"""Draw the template thumbnails (``example_workflows/<template>.jpg``, 400 x 400 like ComfyUI's own).

The template browser shows ``<name>.jpg`` next to each custom-node template. The cards are drawn
from the definitions below (no screenshots), so they stay readable and reproducible:

    <python with Pillow> tools/build_thumbnails.py

Fonts: DejaVu Sans (Linux), Segoe UI or Arial (Windows); Pillow's built-in font otherwise.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PROJECT = Path(__file__).resolve().parents[1]
SIZE = 400
BACKGROUND = (24, 28, 36)
TEXT = (236, 239, 244)
MUTED = (158, 166, 180)

FONT_CANDIDATES = {
    "bold": ["DejaVuSans-Bold.ttf", "segoeuib.ttf", "arialbd.ttf", "LiberationSans-Bold.ttf"],
    "regular": ["DejaVuSans.ttf", "segoeui.ttf", "arial.ttf", "LiberationSans-Regular.ttf"],
}
FONT_FOLDERS = [
    Path("/usr/share/fonts/truetype/dejavu"),
    Path("/usr/share/fonts/truetype/liberation"),
    Path("C:/Windows/Fonts"),
    Path("/Library/Fonts"),
]


@dataclass(frozen=True)
class Card:
    number: str
    title: str
    subtitle: str
    steps: tuple[str, ...]
    footer: str
    accent: tuple[int, int, int]
    wave: bool = True


CARDS = {
    "0 · System Check": Card(
        "0",
        "System Check",
        "Is this machine ready?",
        ("Versions", "GPU / VRAM", "Model files", "Rule table"),
        "no models needed",
        (120, 130, 150),
        wave=False,
    ),
    "1 · YuE2 · Song": Card(
        "1",
        "YuE2 · Song",
        "New song with an editable score",
        ("Brief", "Write", "Text sheet", "Score sheet", "Render", "Master · Export"),
        "YuE2 3B · CC BY-NC 4.0",
        (64, 140, 220),
    ),
    "2 · YuE2 · Cover": Card(
        "2",
        "YuE2 · Cover",
        "New version of a recording",
        ("Source", "Score sheet", "Lyrics", "Text sheet", "Takes", "Master · Export"),
        "YuE2 3B + SheetSage2 · CC BY-NC 4.0",
        (230, 150, 60),
    ),
    "3 · MiniMax · Song": Card(
        "3",
        "MiniMax · Song",
        "New song from a structured caption",
        ("Brief", "Write", "Song sheet", "Render", "Master · Export"),
        "MiniMax Music 3 · Community License",
        (170, 100, 220),
    ),
    "4 · Enhance & Master": Card(
        "4",
        "Enhance & Master",
        "Finish any recording, on the CPU",
        ("Load audio", "EQ", "Loudness", "Export FLAC · MP3"),
        "no music model needed",
        (70, 180, 130),
    ),
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in FONT_CANDIDATES[kind]:
        for folder in FONT_FOLDERS:
            if (folder / name).is_file():
                return ImageFont.truetype(str(folder / name), size)
    return ImageFont.load_default(size)


def draw(card: Card) -> Image.Image:
    image = Image.new("RGB", (SIZE, SIZE), BACKGROUND)
    d = ImageDraw.Draw(image)
    d.rectangle([0, 0, SIZE, 8], fill=card.accent)
    d.text((24, 22), card.number, font=font("bold", 64), fill=card.accent)
    d.text((24, 100), card.title, font=font("bold", 30), fill=TEXT)
    d.text((24, 140), card.subtitle, font=font("regular", 16), fill=MUTED)
    if card.wave:  # a deterministic waveform: the path makes audio
        for i in range(56):
            x = 120 + i * 4.8
            height = 6 + 24 * abs(math.sin(i * 0.37) * math.cos(i * 0.11))
            d.rounded_rectangle([x, 58 - height, x + 2.6, 58 + height], radius=1.3, fill=card.accent)
    y = 180
    step_font = font("regular", 14)
    for index, step in enumerate(card.steps):
        d.rounded_rectangle([24, y, 250, y + 24], radius=6, outline=card.accent, width=1)
        d.text((34, y + 4), step, font=step_font, fill=TEXT)
        if index < len(card.steps) - 1:
            d.line([36, y + 24, 36, y + 30], fill=card.accent, width=2)
        y += 30
    d.text((24, SIZE - 34), card.footer, font=font("regular", 13), fill=MUTED)
    d.text((SIZE - 88, SIZE - 34), "Plenio", font=font("bold", 16), fill=card.accent)
    return image


def main() -> int:
    templates = sorted(p.stem for p in (PROJECT / "example_workflows").glob("*.json"))
    missing = [name for name in templates if name not in CARDS]
    if missing:
        raise SystemExit(f"no thumbnail card for {missing}")
    for name in templates:
        draw(CARDS[name]).save(
            PROJECT / "example_workflows" / f"{name}.jpg", "JPEG", quality=88, optimize=True
        )
    print(f"wrote {len(templates)} thumbnails")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
