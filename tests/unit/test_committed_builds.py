"""Every file a committed frontend build loads is committed too: a build whose chunk is missing loads nothing in
ComfyUI (Plenio's whole extension fails with a 404) or in the player. Found 2026-11-12 after a release build whose
new chunks were left untracked."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def tracked() -> set[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z", "web", "plenio/player"], cwd=ROOT, capture_output=True, check=True
    )
    return {name for name in out.stdout.decode().split("\0") if name}


def test_every_chunk_and_asset_a_build_loads_is_committed() -> None:
    files = tracked()
    missing = []
    for name in sorted(files):
        if not name.startswith("web/js/") or not name.endswith((".js", ".mjs")):
            continue
        text = (ROOT / name).read_text(encoding="utf-8", errors="replace")
        for ref in re.findall(r"""["'](\./(?:chunks/)?[\w.-]+\.(?:mjs|js|css))["']""", text):
            target = (Path(name).parent / ref).as_posix().replace("/./", "/")
            if target not in files:
                missing.append(f"{name} loads {ref}")
    for page in ("plenio/player/static/index.html", "plenio/player/guest_static/index.html"):
        if page not in files:
            continue
        html = (ROOT / page).read_text(encoding="utf-8")
        for ref in re.findall(r'(?:src|href)="\.?/?(assets/[^"]+)"', html):
            if f"{Path(page).parent.as_posix()}/{ref}" not in files:
                missing.append(f"{page} loads {ref}")
    assert missing == [], "commit the build's files: " + "; ".join(missing)
