"""The catalogue tool (``tools/catalogue_check.py``): what it reads from the hosts' answers and what it calls
drift. The answers here are recorded shapes - no test talks to the network."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import catalogue_check as tool
from plenio.core.files import read_toml
from plenio.core.models import Component, Variant, parse_components

COMMIT = "0123456789abcdef0123456789abcdef01234567"
NEWER = "fedcba9876543210fedcba9876543210fedcba98"
DIGEST = "ab" * 32


def variant(**changes: Any) -> Variant:
    base: dict[str, Any] = {
        "id": "demo",
        "file": "demo.safetensors",
        "url": f"https://huggingface.co/org/repo/resolve/{COMMIT}/checkpoints/demo.safetensors",
        "bytes": 1000,
        "sha256": DIGEST,
        "licence": "MIT",
        "role": "demo",
        "default": True,
    }
    return Variant(**{**base, **changes})


def catalogue(*variants: Variant, folder: str = "checkpoints") -> dict[str, Component]:
    return {
        "demo": Component("demo", "Demo", folder, tuple(variants) or (variant(),), templates=("1 · Demo",))
    }


class Hub:
    """Recorded answers: the repository's facts and a file's headers."""

    def __init__(self, **facts: Any) -> None:
        self.facts = {"id": "org/repo", "sha": NEWER, "gated": False, **facts}
        self.headers = {"x-linked-size": "1000", "x-linked-etag": f'"{DIGEST}"'}
        self.status = 302
        self.asked: list[tuple[str, str]] = []

    def __call__(self, method: str, url: str) -> tuple[int, dict[str, str], bytes]:
        self.asked.append((method, url))
        if url.startswith("https://huggingface.co/api/models/"):
            return 200, {}, json.dumps(self.facts).encode()
        if method == "HEAD":
            return self.status, dict(self.headers), b""
        return 404, {}, b""


def test_a_true_catalogue_has_no_notes_and_asks_a_repository_once() -> None:
    hub = Hub()
    second = variant(
        id="two", file="two.safetensors", url=variant().url.replace("demo", "two"), default=False, quality=2
    )
    updated, notes = tool.survey(catalogue(variant(), second), fetch=hub)
    assert notes == {} and updated["demo"].variants[0] == variant()
    assert [m for m, u in hub.asked if "/api/models/" in u] == ["GET"]  # one repository, asked once
    assert all(COMMIT in u for m, u in hub.asked if m == "HEAD")  # the pinned commit, not the newest


def test_a_branch_is_pinned_and_gaps_are_filled_without_being_drift() -> None:
    draft = variant(
        url="https://huggingface.co/org/repo/resolve/main/checkpoints/demo.safetensors", bytes=0, sha256=""
    )
    updated, notes = tool.survey(catalogue(draft), fetch=Hub())
    found = updated["demo"].variants[0]
    assert found.hub == ("org/repo", NEWER, "checkpoints/demo.safetensors")
    assert (found.bytes, found.sha256) == (1000, DIGEST)
    assert notes["demo"] == [f"main is not a commit: pinned to {NEWER[:12]}", "SHA-256 filled", "size filled"]
    assert tool.drift(notes) == {"demo": [f"main is not a commit: pinned to {NEWER[:12]}"]}


def test_a_renamed_or_gated_repository_and_a_changed_file_are_drift() -> None:
    hub = Hub(id="org/Repo-New", gated="auto")
    hub.headers = {"x-linked-size": "1234", "x-linked-etag": '"' + "cd" * 32 + '"'}
    updated, notes = tool.survey(catalogue(), fetch=hub)
    assert notes["demo"] == [
        "the repository org/repo is now org/Repo-New",
        "the repository org/Repo-New is now gated",
        "the size is 1234, not 1000",
        "the SHA-256 differs",
    ]
    found = updated["demo"].variants[0]
    assert found.url.startswith("https://huggingface.co/org/Repo-New/resolve/") and found.gated
    assert (found.bytes, found.sha256) == (1234, "cd" * 32)
    assert tool.drift(notes) == notes


def test_a_file_that_no_longer_resolves_keeps_its_entry_and_is_drift() -> None:
    hub = Hub()
    hub.status = 404
    updated, notes = tool.survey(catalogue(), fetch=hub)
    assert updated["demo"].variants[0] == variant() and "does not resolve (404)" in notes["demo"][0]
    gone = Hub()
    gone.facts = {}
    answer = tool.survey(catalogue(), fetch=lambda method, url: (401, {}, b""))[1]
    assert answer["demo"] == ["the repository org/repo does not answer (401)"]


def test_a_release_asset_takes_its_hash_from_github_or_from_an_installed_copy(tmp_path: Path) -> None:
    data = b"weights" * 100
    digest = hashlib.sha256(data).hexdigest()
    asset = variant(
        file="model.ckpt",
        url="https://github.com/org/repo/releases/download/v1.0.12/model.ckpt",
        bytes=len(data),
        sha256="",
    )

    def release(digest_field: str | None) -> Any:
        entry: dict[str, Any] = {"name": "model.ckpt", "size": len(data)}
        if digest_field:
            entry["digest"] = digest_field
        return lambda method, url: (200, {}, json.dumps({"assets": [entry]}).encode())

    published, notes = tool.survey(
        catalogue(asset, folder="audio_separation"), fetch=release(f"sha256:{digest}")
    )
    assert published["demo"].variants[0].sha256 == digest and notes == {}
    unpublished, notes = tool.survey(catalogue(asset, folder="audio_separation"), fetch=release(None))
    assert unpublished["demo"].variants[0].sha256 == "" and "no SHA-256 published" in notes["demo"][0]
    (tmp_path / "audio_separation").mkdir()
    (tmp_path / "audio_separation" / "model.ckpt").write_bytes(data)
    local, notes = tool.survey(
        catalogue(asset, folder="audio_separation"), fetch=release(None), local=tmp_path
    )
    assert local["demo"].variants[0].sha256 == digest
    assert notes["demo"] == ["SHA-256 from the local file of the same size"] and tool.drift(notes) == {}
    # a copy of another size is not the catalogue's file: not hashed
    (tmp_path / "audio_separation" / "model.ckpt").write_bytes(data + b"x")
    assert (
        tool.survey(catalogue(asset, folder="audio_separation"), fetch=release(None), local=tmp_path)[0][
            "demo"
        ]
        .variants[0]
        .sha256
        == ""
    )


def test_what_the_tool_writes_is_what_the_parser_reads(tmp_path: Path) -> None:
    shipped = parse_components(read_toml(tool.CATALOGUE), "shipped")
    text = tool.dump(shipped)
    assert text.encode("utf-8") == tool.CATALOGUE.read_bytes().replace(
        b"\r\n", b"\n"
    )  # the shipped file is the tool's
    again = tmp_path / "models.toml"
    again.write_bytes(text.encode("utf-8"))
    assert parse_components(read_toml(again), "again") == shipped


def test_the_tool_sends_no_credentials_and_only_asks_the_two_hosts() -> None:
    hub = Hub()
    tool.survey(parse_components(read_toml(tool.CATALOGUE), "shipped"), fetch=hub)
    hosts = {url.split("/")[2] for _method, url in hub.asked}
    assert hosts <= {"huggingface.co", "api.github.com"}
    assert {method for method, _url in hub.asked} <= {"GET", "HEAD"}
