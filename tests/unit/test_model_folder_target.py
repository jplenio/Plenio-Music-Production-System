"""Where Plenio Setup puts a download: the first model folder ComfyUI registered that it may write into.

A user's report (Linux): the first registered folder of a kind was a shared one ComfyUI may only read, and every
download stopped with "Permission denied".
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from plenio.comfy import host


def test_a_folder_is_writable_when_it_or_its_nearest_parent_may_be_written(tmp_path: Path) -> None:
    assert host.writable(tmp_path)
    assert host.writable(tmp_path / "not" / "made" / "yet")
    file = tmp_path / "a-file"
    file.write_text("x")
    assert not host.writable(file)  # a file is no folder


def test_the_download_target_is_the_first_folder_it_may_write_into(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    shared, own, other = tmp_path / "shared", tmp_path / "own", tmp_path / "other"
    for folder in (shared, own, other):
        folder.mkdir()
    monkeypatch.setattr(host, "_registered", lambda: {"vae": [str(shared), str(own), str(other)]})
    monkeypatch.setattr(host, "writable", lambda folder: folder != shared)
    assert host.model_folders("vae") == [
        own,
        other,
        shared,
    ]  # the writable ones first, each in ComfyUI's order
    assert host.model_folder("vae") == own


def test_with_no_writable_folder_comfyuis_first_stays_the_target(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    first, second = tmp_path / "first", tmp_path / "second"
    monkeypatch.setattr(host, "_registered", lambda: {"vae": [str(first), str(second)]})
    monkeypatch.setattr(host, "writable", lambda folder: False)
    assert host.model_folder("vae") == first
    assert host.model_folder("unknown") is None


@pytest.mark.skipif(os.name == "nt" or os.geteuid() == 0, reason="POSIX rights; root may write anywhere")
def test_a_read_only_folder_is_not_writable(tmp_path: Path) -> None:
    locked = tmp_path / "locked"
    locked.mkdir()
    locked.chmod(0o555)
    try:
        assert not host.writable(locked)
        assert not host.writable(locked / "vae")
    finally:
        locked.chmod(0o755)
