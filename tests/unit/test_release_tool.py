"""The release tool (phase R0): the version everywhere, the CHANGELOG dated only with its intro, the notes and the
review request generated, verify on the tree."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest
import release
import release_notes

ROOT = Path(__file__).resolve().parents[2]

CHANGELOG = """# Changelog

## 9.9.9 - unreleased

{intro}### Added

- **A thing** that helps.

### Fixed

- **A bug** gone.

## 9.9.8 - 2026-01-01

### Added

- old
"""


def skeleton(tmp: Path, intro: str = "") -> Path:
    (tmp / "plenio").mkdir()
    (tmp / "frontend").mkdir()
    (tmp / "docs").mkdir()
    (tmp / "pyproject.toml").write_text('[project]\nname = "x"\nversion = "9.9.8"\n', encoding="utf-8")
    (tmp / "plenio" / "__init__.py").write_text('__version__ = "9.9.8"\n', encoding="utf-8")
    (tmp / "frontend" / "package.json").write_text(
        '{\n  "name": "f",\n  "version": "9.9.8"\n}\n', encoding="utf-8"
    )
    lock = {"name": "f", "version": "9.9.8", "packages": {"": {"name": "f", "version": "9.9.8"}}}
    (tmp / "frontend" / "package-lock.json").write_text(json.dumps(lock), encoding="utf-8")
    (tmp / "docs" / "facts.json").write_text(json.dumps({"version": "9.9.9"}), encoding="utf-8")
    (tmp / "CHANGELOG.md").write_text(CHANGELOG.format(intro=intro), encoding="utf-8")
    return tmp


def test_the_version_is_written_everywhere_it_stands(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(release, "PROJECT", skeleton(tmp_path))
    release.set_version("9.9.9")
    assert set(release.versions().values()) == {"9.9.9"}
    assert '"version": "9.9.9"' in (tmp_path / "frontend" / "package.json").read_text(encoding="utf-8")


def test_the_changelog_is_dated_only_with_its_intro(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(release, "PROJECT", skeleton(tmp_path))
    with pytest.raises(SystemExit, match="write the intro"):
        release.date_changelog("9.9.9", "2026-12-01")
    (tmp_path / "CHANGELOG.md").write_text(CHANGELOG.format(intro="Setup and more.\n\n"), encoding="utf-8")
    release.date_changelog("9.9.9", "2026-12-01")
    text = (tmp_path / "CHANGELOG.md").read_text(encoding="utf-8")
    assert "## 9.9.9 - 2026-12-01\n" in text and "## 9.9.8 - 2026-01-01" in text


def test_the_notes_come_from_the_section_in_a_fixed_order() -> None:
    text = release_notes.notes("9.9.9", CHANGELOG.format(intro="Setup and more.\n\n"), "comfy node install x")
    assert text.startswith("# Plenio 9.9.9\n\nSetup and more.\n")
    # how to install stays open; every change follows, folded part by part with its count
    assert text.index("## Install") < text.index("## Every change")
    assert text.index("<b>Added</b> (1)") < text.index("<b>Fixed</b> (1)")
    assert text.count("<details>") == text.count("</details>") == 2
    assert "- old" not in text and "`comfy node install x`" in text
    with pytest.raises(SystemExit, match="no intro"):
        release_notes.notes("9.9.9", CHANGELOG.format(intro=""), "x")
    with pytest.raises(SystemExit, match="no section"):
        release_notes.notes("1.0.0", CHANGELOG.format(intro=""), "x")


def test_the_review_request_names_the_launch_sites_and_the_delta_against_the_last_version() -> None:
    if shutil.which("git") is None:
        pytest.skip("no git")
    text = release.review_request("2.0.0")
    assert "`plenio/core/workers/protocol.py:" in text and "`plenio/player/launch.py:" in text
    assert "## Against 1.6.0" in text and "removed: [script-file]" in text
    assert "{" not in text.split("## What the package starts")[1]  # every blank filled


def test_the_version_strings_of_the_tree_agree() -> None:
    assert len(set(release.versions().values())) == 1, release.versions()


def test_prepare_takes_only_this_versions_benchmark_with_every_brief(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    import bench

    monkeypatch.setattr(
        release.subprocess, "run", lambda *a, **k: type("R", (), {"stdout": "", "returncode": 0})()
    )
    with pytest.raises(SystemExit, match="not of 2.0.0"):
        release.prepare("2.0.0", bench.BUDGETS, "2026-12-01")  # 1.6.0's report
    partial = json.loads(bench.BUDGETS.read_text(encoding="utf-8"))
    partial["label"] = "2.0.0"
    partial["briefs"].pop("sung-90")
    path = tmp_path / "bench-2.0.0.json"
    path.write_text(json.dumps(partial), encoding="utf-8")
    with pytest.raises(SystemExit, match=r"no successful run of \['sung-90'\]"):
        release.prepare("2.0.0", path, "2026-12-01")


def test_the_notes_link_files_at_the_tag_not_relative() -> None:
    text = release_notes.absolute_links("[guide](docs/user/x.md) [site](https://a.b/) [here](#top)", "2.0.0")
    assert "](https://github.com/jplenio/Plenio-Music-Production-System/blob/v2.0.0/docs/user/x.md)" in text
    assert "](https://a.b/)" in text and "](#top)" in text


SHOWN = """# Changelog

## 9.9.9 - unreleased

Setup and more.

### Highlights

- **Setup** - plans the files.
- **Another thing** - with `code` and a [guide](docs/user/x.md).

### Updating from 9.8

- Nothing to migrate.

### Added

#### A group

- **A thing** that helps,
  on two lines.
- **A second thing**.

### Changed

- **A change**.
"""


def test_the_highlights_and_the_update_stay_open_and_every_change_is_folded() -> None:
    text = release_notes.notes("9.9.9", SHOWN, "x")
    assert text.index("## Highlights") < text.index("## Updating from 9.8") < text.index("## Install")
    assert "- **Setup** - plans the files." in text and "<table>" not in text
    assert "<b>Added</b> (2)" in text and "#### A group" in text and "<b>Changed</b> (1)" in text
    assert "<b>Highlights</b>" not in text and "<b>Updating" not in text
    assert "blob/v9.9.9/docs/user/x.md" in text


def test_a_highlight_gets_its_picture_and_only_registered_videos_are_linked() -> None:
    look = {
        "banner": "assets/b.png",
        "watch": [{"key": "film-hero", "label": "The film"}, {"key": "not-uploaded", "label": "Later"}],
        "pictures": {"Setup": "assets/setup.jpg"},
    }
    media = 'site = "https://example.org/p"\n[[video]]\nkey = "film-hero"\nyoutube = "abc"\n'
    text = release_notes.notes("9.9.9", SHOWN, "x", look, media)
    raw = "https://raw.githubusercontent.com/jplenio/Plenio-Music-Production-System/v9.9.9"
    assert text.startswith(f'<p align="center"><img src="{raw}/assets/b.png"')
    assert "▶ **[The film](https://example.org/p/go/film-hero/)**" in text and "Later" not in text
    assert f'<img src="{raw}/assets/setup.jpg" alt="Setup"' in text
    assert (
        '<tr><td colspan="2">\n\n**Another thing**' in text
    )  # a highlight without a picture spans the table
    assert release_notes.items("- a\n  b\n- c\n\n#### h\n\n- d") == ["a\n  b", "c", "d"]
    assert release_notes.lead_in("***Home***: x") == "Home"


def test_the_registry_gets_a_square_icon_and_a_21_to_9_banner(tmp_path: Path) -> None:
    import struct
    import zlib

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))

    def png(path: Path, width: int, height: int) -> None:
        raw = b"".join(b"\x00" + b"\x00\x00\x00" * width for _ in range(height))
        header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(
            b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", header)
            + chunk(b"IDAT", zlib.compress(raw))
            + chunk(b"IEND", b"")
        )

    base = "https://raw.githubusercontent.com/jplenio/Plenio-Music-Production-System/main/"
    pyproject = f'[tool.comfy]\nIcon = "{base}assets/icon.png"\nBanner = "{base}assets/banner.png"\n'
    (tmp_path / "pyproject.toml").write_text(pyproject, encoding="utf-8")
    png(tmp_path / "assets" / "icon.png", 400, 400)
    png(tmp_path / "assets" / "banner.png", 84, 36)
    assert release.branding_problems(tmp_path) == []
    png(tmp_path / "assets" / "icon.png", 512, 512)
    png(tmp_path / "assets" / "banner.png", 80, 36)
    found = " ".join(release.branding_problems(tmp_path))
    assert "at most 400 px" in found and "21:9" in found
    assert release.branding_problems(ROOT) == []  # the repository's own


def test_the_checklist_says_where_the_release_stands_and_writes_nothing() -> None:
    if shutil.which("git") is None:
        pytest.skip("no git")
    before = (ROOT / "CHANGELOG.md").read_bytes()
    rows = release.checklist()
    steps = [step for _, step, _ in rows]
    assert any("the version is" in s for s in steps) and any("icon and banner" in s for s in steps)
    assert rows[-1][0] is None and rows[-2][0] is None  # the workflow and the verdict are the owner's
    assert all(todo for _, _, todo in rows)  # every step says what to do
    assert (ROOT / "CHANGELOG.md").read_bytes() == before
