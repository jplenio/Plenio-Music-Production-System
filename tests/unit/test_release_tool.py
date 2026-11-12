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
    assert text.index("## Added") < text.index("## Fixed") < text.index("## Install")
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
