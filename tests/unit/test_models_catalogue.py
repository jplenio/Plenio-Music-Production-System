"""The model catalogue (resources/models.toml): validation, inventory and template readiness."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from typing import Any, cast

import pytest

from plenio.core.errors import PlenioUserError
from plenio.core.models import (
    Inventory,
    by_file,
    load_catalogue,
    load_components,
    misplaced_file,
    model_roots,
    parse_catalogue,
    parse_components,
    readiness,
    sibling_folders,
    size_text,
    take_inventory,
    template_names,
)

ROOT = Path(__file__).resolve().parents[2]
CATALOGUE = load_catalogue(ROOT / "resources" / "models.toml")
COMPONENTS = load_components(ROOT / "resources" / "models.toml")
COMMIT = "0123456789abcdef0123456789abcdef01234567"


def variant(**changes: Any) -> dict[str, Any]:
    base: dict[str, Any] = {
        "id": "demo",
        "file": "demo.safetensors",
        "url": f"https://huggingface.co/org/repo/resolve/{COMMIT}/checkpoints/demo.safetensors",
        "bytes": 10,
        "sha256": "ab" * 32,
        "licence": "MIT",
        "role": "demo",
        "default": True,
    }
    base.update(changes)
    return {k: v for k, v in base.items() if v is not None}


def component(*variants: dict[str, Any], **changes: Any) -> dict[str, Any]:
    base: dict[str, Any] = {
        "id": "demo",
        "title": "Demo model",
        "folder": "checkpoints",
        "templates": ["1 · Demo"],
        "variant": list(variants) or [variant()],
    }
    base.update(changes)
    return base


def catalogue(*components: dict[str, Any]) -> dict[str, Any]:
    return {"schema": "plenio.models/2", "component": list(components) or [component()]}


def test_shipped_catalogue() -> None:
    files = by_file(CATALOGUE)
    assert files["yue2_3b_int8_convrot.safetensors"].non_commercial
    assert not files["minimax_music3_dit_fp16.safetensors"].non_commercial
    assert template_names(CATALOGUE) == [
        "1 · YuE2 · Song",
        "2 · YuE2 · Cover",
        "3 · MiniMax · Song",
        "4 · Enhance & Master",
        "5 · YuE2 · DAW",
    ]
    # the FLUX.2 files serve the Cover Art, on in the four song templates since 2026-10-23
    flux = [m for m in CATALOGUE.values() if m.file.startswith(("flux", "qwen_3_4b")) and m.default]
    assert len(flux) == 3 and all(len(m.templates) == 4 and not m.optional_templates for m in flux)
    # alternatives are never template defaults
    assert all(not m.templates and not m.optional_templates for m in CATALOGUE.values() if not m.default)


def test_a_complete_entry_is_read_into_a_component_its_variant_and_the_flat_view() -> None:
    found = parse_components(catalogue(), "test")["demo"]
    assert found.default.file == "demo.safetensors" and found.default.hub == (
        "org/repo",
        COMMIT,
        "checkpoints/demo.safetensors",
    )
    model = parse_catalogue(catalogue(), "test")["demo"]
    assert (model.folder, model.templates, model.component) == ("checkpoints", ("1 · Demo",), "demo")
    assert model.download_entry() == {
        "name": "demo.safetensors",
        "url": found.default.url,
        "directory": "checkpoints",
    }


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"file": "sub/demo.safetensors"}, "file name"),
        ({"url": "https://example.com/demo.safetensors"}, "Hugging Face or GitHub release file URL"),
        (
            {"url": f"https://huggingface.co/org/repo/resolve/{COMMIT}/other.safetensors"},
            "ending in the file name",
        ),
        # not pinned: a branch name can point at another file tomorrow
        (
            {"url": "https://huggingface.co/org/repo/resolve/main/checkpoints/demo.safetensors"},
            "pinned to a full commit hash",
        ),
        ({"sha256": None}, "the size and the SHA-256"),
        ({"sha256": "abc"}, "the size and the SHA-256"),
        ({"bytes": 0}, "the size and the SHA-256"),
        ({"bytes": -1}, "negative"),
        ({"quality": 0}, "ranks from 1"),
        ({"vram_min_gib": 12.0, "vram_full_gib": 8.0}, "vram_min_gib <= vram_full_gib"),
        ({"licence": None}, "incomplete"),
        ({"id": "Demo File"}, "lower-case identifier"),
    ],
)
def test_bad_variants_are_refused(changes: dict[str, Any], message: str) -> None:
    with pytest.raises(PlenioUserError, match=message):
        parse_components(catalogue(component(variant(**changes))), "test")


def test_a_draft_may_lack_what_the_tool_fills() -> None:
    draft = variant(url="https://huggingface.co/org/repo/resolve/main/demo.safetensors", sha256=None, bytes=0)
    found = parse_components(catalogue(component(draft)), "test", strict=False)["demo"].default
    assert found.sha256 == "" and found.hub == ("org/repo", "main", "demo.safetensors")
    release = variant(
        file="model.ckpt",
        url="https://github.com/org/repo/releases/download/v1.0.12/model.ckpt",
    )
    assert parse_components(catalogue(component(release)), "test")["demo"].default.hub is None


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"folder": "somewhere"}, "unknown model folder"),
        ({"optional_templates": ["1 · Demo"]}, "either always or optionally"),
        ({"variant": []}, "at least one variant"),
        ({"variant": [variant(default=False)]}, "exactly one variant is the default"),
        ({"loader": {"node": "CheckpointLoaderSimple"}}, "names its node and its input"),
        ({"title": None}, "incomplete"),
    ],
)
def test_bad_components_are_refused(changes: dict[str, Any], message: str) -> None:
    raw = {k: v for k, v in component(**changes).items() if v is not None}
    with pytest.raises(PlenioUserError, match=message):
        parse_components(catalogue(raw), "test")


def test_duplicates_ranks_and_the_schema_are_refused() -> None:
    other = variant(id="other", file="other.safetensors", url=variant()["url"].replace("demo", "other"))
    two_defaults = component(variant(), other)
    with pytest.raises(PlenioUserError, match="exactly one variant is the default"):
        parse_components(catalogue(two_defaults), "t")
    same_rank = component(variant(), {**other, "default": False})
    with pytest.raises(PlenioUserError, match="same quality rank"):
        parse_components(catalogue(same_rank), "t")
    fine = component(variant(), {**other, "default": False, "quality": 2})
    assert len(parse_components(catalogue(fine), "t")["demo"].variants) == 2
    # one file name, or one id, in two components
    again = component(variant(id="twin"), id="second")
    with pytest.raises(PlenioUserError, match="ids and file names are unique"):
        parse_components(catalogue(component(), again), "t")
    with pytest.raises(PlenioUserError, match="unique lower-case identifier"):
        parse_components(
            catalogue(
                component(),
                component(variant(id="x", file="x.safetensors", url=variant()["url"].replace("demo", "x"))),
            ),
            "t",
        )
    with pytest.raises(PlenioUserError, match="expected schema"):
        parse_components({"schema": "plenio.models/1"}, "t")


def test_the_shipped_catalogue_is_pinned_hashed_and_ranked() -> None:
    assert len(COMPONENTS) == 12 and len(CATALOGUE) == 18
    for found in COMPONENTS.values():
        for item in found.variants:
            hub = item.hub
            assert hub is None or len(hub[1]) == 40, item.id  # no branch name
            assert len(item.sha256) == 64 and item.bytes > 0, item.id
            assert item.basis, item.id
        ranked = sorted(found.variants, key=lambda v: v.quality)
        # a better file never needs less graphics memory than a lesser one of its component
        assert [v.vram_full_gib for v in ranked] == sorted(v.vram_full_gib for v in ranked), found.id
    # every file of 1.6.0 is there, in its folder
    files = by_file(CATALOGUE)
    assert files["yue2_3b_int8_convrot.safetensors"].folder == "checkpoints"
    assert files["model_bs_roformer_ep_17_sdr_9.6568.ckpt"].folder == "audio_separation"
    assert COMPONENTS["yue2"].loader_node == "CheckpointLoaderSimple" and COMPONENTS["yue2"].accepts
    # the repositories the hub renamed carry their current names
    urls = " ".join(m.url for m in CATALOGUE.values())
    assert (
        "Comfy-Org/flux2-klein/" not in urls
        and "vae-text-encorder" not in urls
        and "Comfy-Org/flux2-dev/" not in urls
    )
    assert "/resolve/main/" not in urls


def test_inventory_and_readiness(tmp_path: Path) -> None:
    files = by_file(CATALOGUE)
    present = {
        "yue2_3b_int8_convrot.safetensors": 3960938800,
        "gemma4_e4b_it_fp8_scaled.safetensors": 9057782194,  # the lighter writer: an alternative since 1.5.1
        "minimax_music3_dav.safetensors": 5,  # wrong size
        "pytorch_model.bin": 229072395,  # UniverSR: HQ 2 in every template's Master, with HQ mastering on
        "flux-2-klein-4b.safetensors": 7751105712,  # the cover art (on since 2026-10-23)
        "qwen_3_4b.safetensors": 8044982048,
        "flux2-vae.safetensors": 336213556,
    }

    def locate(folder: str, file: str) -> Path | None:
        if file not in present:
            return None
        # a file of that size, without writing 20 GB (Windows writes the zeros of a truncated file)
        size = present[file]
        return cast(Path, SimpleNamespace(stat=lambda: SimpleNamespace(st_size=size)))

    inventory = take_inventory(CATALOGUE, locate)
    assert inventory.status(files["yue2_3b_int8_convrot.safetensors"]) == "installed"
    assert inventory.status(files["gemma4_e4b_it_fp8_scaled.safetensors"]) == "installed"
    assert inventory.status(files["minimax_music3_dav.safetensors"]) == "size differs"
    assert inventory.status(files["sheetsage2_bf16.safetensors"]) == "missing"
    song, cover, minimax, enhance, daw = readiness(CATALOGUE, inventory, template_names(CATALOGUE))
    assert song.template == "1 · YuE2 · Song" and song.ready
    assert "flux-2-klein-4b.safetensors" not in {m.file for m in song.optional_missing}  # required now
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
    # the DAW template needs the same music model as the song template; no template needs a ComfyUI writer file
    # since 1.5.1 - the default writer is Gemma 4 12B, a GGUF the first song fetches (resources/assets.toml)
    assert daw.template == "5 · YuE2 · DAW" and daw.ready
    assert not files["gemma4_e4b_it_fp8_scaled.safetensors"].templates  # its component is needed by none
    assert all(
        "gemma4_e4b_it_fp8_scaled.safetensors" not in {m.file for m in t.missing} for t in (song, cover, daw)
    )
    assert {m.file for m in daw.optional_missing} >= {"ar_lora_inst_v3abc_comfyui.safetensors"}
    # Enhance & Master needs UniverSR alone: HQ mastering is on there by default (2026-10-24), the Stems bypassed
    assert enhance.ready
    assert {m.file for m in enhance.optional_missing} == {"model_bs_roformer_ep_17_sdr_9.6568.ckpt"}
    nothing = readiness(CATALOGUE, Inventory({}), ["4 · Enhance & Master"])[0]
    assert not nothing.ready and {m.file for m in nothing.missing} == {"pytorch_model.bin"}
    assert {m.file for m in nothing.optional_missing} == {"model_bs_roformer_ep_17_sdr_9.6568.ckpt"}


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


def test_plenio_folders_beside_the_extra_model_folders(tmp_path: Path) -> None:
    """A user's report 2026-10-10: an ``audio_separation`` folder beside the model folders of an
    extra_model_paths.yaml location was not searched (ComfyUI reads only the folders the file names)."""
    comfy, shared = tmp_path / "ComfyUI", tmp_path / "shared"
    for folder in ("models/checkpoints", "models/audio_separation", "custom_nodes/LLM"):
        (comfy / folder).mkdir(parents=True)
    for folder in ("checkpoints", "loras", "audio_separation", "audio_encoders"):
        (shared / folder).mkdir(parents=True)
    (shared / "audio_encoders" / "sheetsage2_bf16.safetensors").write_bytes(b"")
    registered = {
        "checkpoints": [str(comfy / "models" / "checkpoints"), str(shared / "checkpoints")],
        "loras": [str(shared / "loras")],
        "audio_separation": [str(comfy / "models" / "audio_separation")],
        "audio_encoders": [str(comfy / "models" / "audio_encoders")],
        "custom_nodes": [str(comfy / "custom_nodes")],  # no model root: its parent is ComfyUI itself
    }
    assert model_roots(registered) == [comfy / "models", shared]
    assert sibling_folders("audio_separation", registered) == [shared / "audio_separation"]
    assert sibling_folders("audio_sr", registered) == []  # existing folders only
    assert sibling_folders("LLM", registered) == []  # not beside custom_nodes
    registered["audio_separation"].append(str(shared / "audio_separation"))
    assert sibling_folders("audio_separation", registered) == []  # once registered, never twice
    assert misplaced_file("audio_encoders", "sheetsage2_bf16.safetensors", registered) == (
        shared / "audio_encoders" / "sheetsage2_bf16.safetensors"
    )
    assert misplaced_file("audio_encoders", "other.safetensors", registered) is None
    registered["audio_encoders"].append(str(shared / "audio_encoders"))  # the yaml's line added
    assert misplaced_file("audio_encoders", "sheetsage2_bf16.safetensors", registered) is None
