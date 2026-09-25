"""The model catalogue (resources/models.toml): validation, inventory and template readiness."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

from plenio.core.errors import PlenioUserError
from plenio.core.models import (
    Inventory,
    by_file,
    load_catalogue,
    parse_catalogue,
    readiness,
    size_text,
    take_inventory,
    template_names,
)

ROOT = Path(__file__).resolve().parents[2]
CATALOGUE = load_catalogue(ROOT / "resources" / "models.toml")


def entry(**changes: Any) -> dict[str, Any]:
    base: dict[str, Any] = {
        "id": "demo",
        "file": "demo.safetensors",
        "folder": "checkpoints",
        "url": "https://huggingface.co/org/repo/resolve/main/checkpoints/demo.safetensors",
        "bytes": 10,
        "licence": "MIT",
        "role": "demo",
        "default": True,
        "templates": ["1 · Demo"],
    }
    base.update(changes)
    return base


def test_shipped_catalogue() -> None:
    files = by_file(CATALOGUE)
    assert files["yue2_3b_int8_convrot.safetensors"].non_commercial
    assert not files["minimax_music3_dit_fp16.safetensors"].non_commercial
    assert template_names(CATALOGUE) == [
        "1 · YuE2 · Song",
        "2 · YuE2 · Cover",
        "3 · MiniMax · Song",
    ]
    # the FLUX.2 files serve only the optional Cover Art block
    flux = [m for m in CATALOGUE.values() if m.file.startswith(("flux", "qwen_3_4b")) and m.default]
    assert len(flux) == 3 and all(not m.templates and len(m.optional_templates) == 3 for m in flux)
    # alternatives are never template defaults
    assert all(not m.templates and not m.optional_templates for m in CATALOGUE.values() if not m.default)


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"folder": "somewhere"}, "unknown model folder"),
        ({"file": "sub/demo.safetensors"}, "unique .safetensors file name"),
        ({"url": "https://example.com/demo.safetensors"}, "Hugging Face file URL"),
        (
            {"url": "https://huggingface.co/org/repo/resolve/main/other.safetensors"},
            "ending in the file name",
        ),
        ({"default": False}, "alternative"),
        ({"optional_templates": ["1 · Demo"]}, "either always or optionally"),
        ({"bytes": -1}, "negative"),
        ({"licence": None} | {"role": None}, "incomplete"),
    ],
)
def test_bad_entries_are_refused(changes: dict[str, Any], message: str) -> None:
    raw = entry(**changes)
    raw = {k: v for k, v in raw.items() if v is not None}
    with pytest.raises(PlenioUserError, match=message):
        parse_catalogue({"schema": "plenio.models/1", "model": [raw]}, "test")


def test_duplicates_and_schema_are_refused() -> None:
    with pytest.raises(PlenioUserError, match="unique lower-case identifier"):
        parse_catalogue(
            {
                "schema": "plenio.models/1",
                "model": [entry(), entry(file="b.safetensors", url=entry()["url"].replace("demo", "b"))],
            },
            "t",
        )
    with pytest.raises(PlenioUserError, match="expected schema"):
        parse_catalogue({"schema": "x"}, "t")


def test_inventory_and_readiness(tmp_path: Path) -> None:
    files = by_file(CATALOGUE)
    present = {
        "yue2_3b_int8_convrot.safetensors": 3960938800,
        "gemma4_e4b_it_fp8_scaled.safetensors": 1234,  # size not recorded: any size counts
        "minimax_music3_dav.safetensors": 5,  # wrong size
    }

    def locate(folder: str, file: str) -> Path | None:
        if file not in present:
            return None
        path = tmp_path / folder / file
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as handle:
            handle.truncate(present[file])  # sparse: no real 4 GB file
        return path

    inventory = take_inventory(CATALOGUE, locate)
    assert inventory.status(files["yue2_3b_int8_convrot.safetensors"]) == "installed"
    assert inventory.status(files["gemma4_e4b_it_fp8_scaled.safetensors"]) == "installed"
    assert inventory.status(files["minimax_music3_dav.safetensors"]) == "size differs"
    assert inventory.status(files["sheetsage2_bf16.safetensors"]) == "missing"
    song, cover, minimax = readiness(CATALOGUE, inventory, template_names(CATALOGUE))
    assert song.template == "1 · YuE2 · Song" and song.ready
    assert {m.file for m in song.optional_missing} >= {"flux-2-klein-4b.safetensors"}
    assert not cover.ready and {m.file for m in cover.missing} == {
        "sheetsage2_bf16.safetensors",
        "ar_lora_inst_v3abc_comfyui.safetensors",
    }
    assert {m.file for m in minimax.missing} == {
        "minimax_music3_dit_fp16.safetensors",
        "minimax_music3_text_encoder_pruned_int8_convrot.safetensors",
    }  # a file of the wrong size is reported as incomplete, not as missing
    assert {m.file for m in minimax.incomplete} == {"minimax_music3_dav.safetensors"}
    assert minimax.missing_bytes == 4914197682 + 9196611886
    assert readiness(CATALOGUE, Inventory({}), ["4 · Enhance & Master"])[0].ready


def test_size_text() -> None:
    assert size_text(3960938800) == "4.0 GB"
    assert size_text(216696128) == "217 MB"
    assert size_text(0) == "size not recorded"


def test_the_model_guide_lists_every_catalogued_file() -> None:
    guide = (ROOT / "docs" / "user" / "models.md").read_text(encoding="utf-8")
    missing = [m.file for m in CATALOGUE.values() if m.file.removesuffix(".safetensors") not in guide]
    assert missing == []


def test_release_records_name_every_non_commercial_model_file() -> None:
    """Licences live in the catalogue, in the engine modules and in core.release.MODEL_LICENCES (which the
    record reads). A non-commercial model added to the catalogue only would be missing from records
    (Phase 10 review): every such file is either the engine's own checkpoint or listed for the record."""
    from plenio.core.release import MODEL_LICENCES

    engine_checkpoints = {"yue2_3b_int8_convrot.safetensors", "yue2_3b_bf16.safetensors"}  # yue2.LICENCE
    non_commercial = {m.file for m in CATALOGUE.values() if m.non_commercial}
    assert non_commercial - engine_checkpoints == set(MODEL_LICENCES)
