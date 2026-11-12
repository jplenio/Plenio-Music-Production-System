"""Links that never break (phase D2, MP 6): every video by its key in resources/media.toml; nothing links YouTube
directly outside the registry and what is generated from it."""

from __future__ import annotations

import re
from pathlib import Path

import media_links

ROOT = Path(__file__).resolve().parents[2]


def test_the_generated_files_are_current_and_nothing_links_youtube_directly() -> None:
    assert media_links.main(["--check"]) == 0, "run python tools/media_links.py --write"


def test_one_id_changed_in_the_registry_changes_the_go_page_and_the_players_list_only() -> None:
    data = media_links.registry()
    video = next(v for v in data["video"] if v["key"] == "tutorial-1-yue2-song")
    before = media_links.wanted_files(data)
    video["youtube"] = "AAAAAAAAAAA"
    after = media_links.wanted_files(data)
    changed = {p.relative_to(ROOT).as_posix() for p in before if before[p] != after[p]}
    assert changed == {"docs/go/tutorial-1-yue2-song/index.html", "frontend/src/player/media.generated.ts"}
    assert "https://youtu.be/AAAAAAAAAAA" in after[media_links.GO / "tutorial-1-yue2-song" / "index.html"]
    # the docs link the go-link, which does not change
    assert media_links.relinked("https://youtu.be/AAAAAAAAAAA", data).endswith("/go/tutorial-1-yue2-song/")


def test_every_tutorial_of_the_players_help_is_registered_and_has_its_picture() -> None:
    help_ts = (ROOT / "frontend" / "src" / "player" / "help.ts").read_text(encoding="utf-8")
    keys = re.findall(r"\{ key: '([\w-]+)'", help_ts)
    registered = {v["key"]: v for v in media_links.registry()["video"]}
    assert len(keys) == 14 and set(keys) <= set(registered)
    for key in keys:
        if registered[key]["kind"] == "tutorial":
            assert (ROOT / "assets" / "media" / f"{key}.jpg").is_file(), key
    # the README's tutorial table links every tutorial by its go-link
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert all(f"/go/{k}/" in readme for k in keys if registered[k]["kind"] == "tutorial")
