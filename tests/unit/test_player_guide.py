"""The player's guide in seven pages (phase 6.7): every relative link and anchor resolves, every section carries the
key of its how-to chapter (registered in resources/media.toml, phase D2), the old page leads to each section."""

from __future__ import annotations

import re
from pathlib import Path

import pytest

GUIDE = Path(__file__).resolve().parents[2] / "docs" / "user" / "player"
PAGES = ("listening", "visuals", "party", "making-songs", "people", "sharing", "videos")


def slug(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"\s", "-", text)


def anchors(path: Path) -> set[str]:
    text = re.sub(r"```.*?```", "", path.read_text(encoding="utf-8"), flags=re.S)
    return {slug(line.lstrip("#").strip()) for line in text.splitlines() if line.startswith("#")}


@pytest.mark.parametrize("page", [*PAGES, "README"])
def test_links_and_anchors_resolve(page: str) -> None:
    path = GUIDE / f"{page}.md"
    text = re.sub(r"```.*?```", "", path.read_text(encoding="utf-8"), flags=re.S)
    for target in re.findall(r"\]\(([^)\s]+)\)", text):
        if re.match(r"^[a-z]+:", target):
            continue
        file, _, anchor = target.partition("#")
        found = (path.parent / file).resolve() if file else path
        assert found.exists(), (page, target)
        if anchor and found.suffix == ".md":
            assert anchor in anchors(found), (page, target)


@pytest.mark.parametrize("page", PAGES)
def test_every_section_has_its_chapter_key(page: str) -> None:
    lines = (GUIDE / f"{page}.md").read_text(encoding="utf-8").splitlines()
    for n, line in enumerate(lines):
        if line.startswith("## "):
            assert re.fullmatch(rf"<!-- media: player\.{re.escape(page)}\.[\w-]+ -->", lines[n + 1]), (
                page,
                line,
            )


def test_the_old_page_leads_to_every_section() -> None:
    old = (GUIDE.parent / "concepts" / "player.md").read_text(encoding="utf-8")
    for page in PAGES:
        assert f"../player/{page}.md" in old
