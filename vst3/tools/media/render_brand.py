"""Render Plenio VST3's logo, README banner and social preview to PNG with a headless Chromium.

    python tools/media/render_brand.py

The sources are in docs/media/src (HTML and CSS, no scripts) and logo.svg; the PNGs go
next to logo.svg. Edge or Chrome draws them, so gradients, glows and fonts look as in a browser. The
text uses Montserrat from this computer's fonts (OFL-1.1); without it the browser takes Segoe UI.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

MEDIA = Path(__file__).resolve().parents[2] / "docs" / "media"

# (source, output, width, height)
RENDERS = [
    ("logo.svg", "logo-512.png", 512, 512),
    ("src/banner.html", "banner.png", 1600, 520),
    ("src/social.html", "social-preview.png", 1280, 640),
]

BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]


def browser() -> str:
    for name in ("chromium", "chromium-browser", "google-chrome", "microsoft-edge"):
        found = shutil.which(name)
        if found:
            return found
    for path in BROWSERS:
        if Path(path).is_file():
            return path
    sys.exit("No Chromium browser found (Edge, Chrome or Chromium).")


def render(exe: str, source: Path, out: Path, width: int, height: int, profile: str) -> None:
    args = [
        exe,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--user-data-dir={profile}",
        "--default-background-color=00000000",
        f"--window-size={width},{height}",
        f"--screenshot={out}",
        source.as_uri(),
    ]
    subprocess.run(args, check=True, capture_output=True, timeout=120)
    print(f"{out.name}: {width} x {height}")


def main() -> None:
    exe = browser()
    with tempfile.TemporaryDirectory() as profile:
        for source, out, width, height in RENDERS:
            render(exe, MEDIA / source, MEDIA / out, width, height, profile)


if __name__ == "__main__":
    main()
