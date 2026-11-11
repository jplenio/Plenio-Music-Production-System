"""What Plenio Setup shows and starts (``plenio.core.setup_plan``): the plan as a page's answer, and a download
request that can only name files of the catalogue, into ComfyUI's own model folders."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from hypothesis import given
from hypothesis import strategies as st

from plenio.core.errors import PlenioUserError
from plenio.core.models import load_components
from plenio.core.setup_plan import MAX_IDS, download_request, plan_view

ROOT = Path(__file__).resolve().parents[2]
COMPONENTS = load_components(ROOT / "resources" / "models.toml")
IDS = [v.id for c in COMPONENTS.values() for v in c.variants]
MODELS = Path("X:/ComfyUI/models") if Path("X:/").anchor else Path("/srv/ComfyUI/models")
FOLDERS: dict[str, Path | None] = {c.folder: MODELS / c.folder for c in COMPONENTS.values()}


def test_the_plan_for_a_page_says_file_reason_and_what_to_fetch() -> None:
    view = plan_view(
        COMPONENTS, ["1 · YuE2 · Song"], vram_gib=15.9, installed={"flux2-vae.safetensors": 336213556}
    )
    assert (view["vram_gib"], view["prefer"], view["pins"]) == (15.9, "balanced", {})
    song = view["templates"][0]
    assert song["template"] == "1 · YuE2 · Song" and not song["ready"] and song["download_bytes"] > 15e9
    assert "CC BY-NC 4.0" in song["licences"]
    picks = {p["component"]: p for p in song["picks"]}
    yue2 = picks["yue2"]
    assert yue2["file"] == "yue2_3b_int8_convrot.safetensors" and yue2["variant"] == "yue2-3b-int8"
    assert yue2["reason"] == "15.9 GB of graphics memory: runs on the card" and not yue2["optional"]
    assert yue2["download_bytes"] == 3960938800 and yue2["folder"] == "checkpoints"
    assert [v["id"] for v in yue2["variants"]] == ["yue2-3b-int8", "yue2-3b-bf16"]
    assert yue2["variants"][0]["non_commercial"] and not yue2["variants"][0]["measured"]
    vae = picks["flux2-vae"]
    assert vae["installed"] and vae["download_bytes"] == 0 and vae["variants"][0]["installed"]
    assert picks["stems"]["optional"] and picks["audio-sr"]["optional"]
    # nothing of this computer's folders is in the answer
    assert "ComfyUI" not in str(view) and ":/" not in str(view).replace("://", "")


def test_pins_and_the_preference_show_in_the_plan() -> None:
    view = plan_view(
        COMPONENTS,
        ["1 · YuE2 · Song"],
        vram_gib=8.0,
        installed={"my-finetune.safetensors": 9},
        prefer="small",
        pins={"yue2": "my-finetune.safetensors"},
    )
    yue2 = next(p for p in view["templates"][0]["picks"] if p["component"] == "yue2")
    assert yue2["variant"] is None and yue2["installed"] and "a file of your own" in yue2["reason"]
    assert view["pins"] == {"yue2": "my-finetune.safetensors"} and view["prefer"] == "small"


def test_a_request_of_catalogue_ids_names_each_file_in_its_own_folder() -> None:
    wanted = download_request(["yue2-3b-int8", "flux2-vae", "yue2-3b-int8"], COMPONENTS, FOLDERS)
    assert [(w.variant.id, w.target) for w in wanted] == [
        ("yue2-3b-int8", MODELS / "checkpoints" / "yue2_3b_int8_convrot.safetensors"),
        ("flux2-vae", MODELS / "vae" / "flux2-vae.safetensors"),
    ]  # asked twice, fetched once
    assert wanted[0].component.id == "yue2"


@pytest.mark.parametrize(
    "ids",
    [
        None,
        [],
        "yue2-3b-int8",
        [1],
        [None],
        ["yue2-3b-int8", "nothing-of-the-catalogue"],
        ["https://example.org/evil.safetensors"],
        ["../../outside.safetensors"],
        ["yue2_3b_int8_convrot.safetensors"],  # a file name is no id
        ["C:\\Windows\\system32\\x.dll"],
        ["yue2-3b-int8"] * (MAX_IDS + 1),
    ],
)
def test_anything_else_is_refused_and_nothing_of_the_request_is_fetched(ids: Any) -> None:
    with pytest.raises(PlenioUserError):
        download_request(ids, COMPONENTS, FOLDERS)


def test_a_model_folder_comfyui_does_not_know_is_said() -> None:
    with pytest.raises(PlenioUserError, match="has no model folder 'checkpoints'"):
        download_request(["yue2-3b-int8"], COMPONENTS, {**FOLDERS, "checkpoints": None})


texts = st.one_of(
    st.sampled_from(IDS),
    st.text(max_size=60),
    st.sampled_from(
        ["..", "../x", "/etc/passwd", "C:\\x", "https://huggingface.co/a/b/resolve/main/c.safetensors"]
    ),
    st.builds(lambda a, b: f"{a}/{b}", st.sampled_from(IDS), st.text(max_size=10)),
)


@given(ids=st.lists(texts, min_size=1, max_size=6))
def test_only_catalogue_ids_start_a_download_and_every_target_lies_in_a_model_folder(ids: list[str]) -> None:
    try:
        wanted = download_request(ids, COMPONENTS, FOLDERS)
    except PlenioUserError:
        assert not all(i in IDS for i in ids)  # refused only when something is not the catalogue's
        return
    assert all(i in IDS for i in ids)
    urls = {v.id: v.url for c in COMPONENTS.values() for v in c.variants}
    for item in wanted:
        assert (
            item.target.parent == FOLDERS[item.component.folder]
        )  # directly in the folder, under its own name
        assert item.target.name == item.variant.file and item.variant.url == urls[item.variant.id]
