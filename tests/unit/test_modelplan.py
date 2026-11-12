"""The model plan (``plenio.core.modelplan``): which file of each component a machine uses, and why - on the
shipped catalogue for the usual cards, and on small made-up components for the rules."""

from __future__ import annotations

from pathlib import Path

import pytest
from hypothesis import given
from hypothesis import strategies as st

from plenio.core.modelplan import PREFERENCES, Pick, fingerprint, pick, plan
from plenio.core.models import Component, Variant, load_components

ROOT = Path(__file__).resolve().parents[2]
COMPONENTS = load_components(ROOT / "resources" / "models.toml")
SONG = "1 · YuE2 · Song"
CARDS = (None, 6.0, 8.0, 11.9, 15.9, 23.9)
"""No card, and what cards sold as 6, 8, 12, 16 and 24 GB report."""


def variant(name: str, size: int, quality: int, speed: int, low: float, full: float) -> Variant:
    return Variant(
        id=name,
        file=f"{name}.safetensors",
        url=f"https://huggingface.co/org/repo/resolve/{'0' * 40}/{name}.safetensors",
        bytes=size,
        sha256="ab" * 32,
        licence="MIT",
        role=name,
        default=quality == 1,
        quality=quality,
        speed=speed,
        vram_min_gib=low,
        vram_full_gib=full,
    )


SMALL = variant("small", 2_000, 1, 3, 0.0, 6.0)
MIDDLE = variant("middle", 5_000, 2, 2, 6.0, 12.0)
LARGE = variant("large", 9_000, 3, 1, 12.0, 20.0)
DEMO = Component("demo", "Demo", "checkpoints", (SMALL, MIDDLE, LARGE), templates=("T",))


def chosen(vram: float | None, prefer: str = "balanced", installed: dict[str, int] | None = None) -> Pick:
    return pick(DEMO, vram_gib=vram, installed=installed or {}, prefer=prefer)


# --- the rules ----------------------------------------------------------------------------------------------------


def test_the_best_file_that_runs_on_the_card_is_chosen() -> None:
    assert [chosen(v).file for v in (6.0, 12.0, 19.9, 20.0, 48.0)] == [
        "small.safetensors",
        "middle.safetensors",
        "middle.safetensors",
        "large.safetensors",
        "large.safetensors",
    ]
    found = chosen(12.0)
    assert found.reason == "12.0 GB of graphics memory: runs on the card" and found.warning == ""
    assert not found.installed and found.download_bytes == 5_000
    assert [v.id for v in found.alternatives] == ["small", "large"]


def test_below_every_full_threshold_a_file_that_runs_at_all_is_taken_and_said_so() -> None:
    only_large = Component("demo", "Demo", "checkpoints", (LARGE,))
    slow = pick(only_large, vram_gib=15.9, installed={})
    assert slow.file == "large.safetensors" and slow.reason.endswith("runs with offloading: slower")
    assert "slower" in slow.warning
    tiny = pick(only_large, vram_gib=4.0, installed={})
    assert tiny.reason.endswith("too large for this card: very slow") and "needs about 12 GB" in tiny.warning
    none = pick(only_large, vram_gib=None, installed={})
    assert none.reason.startswith("no graphics card") and "this machine has none" in none.warning


def test_the_preference_orders_the_candidates() -> None:
    assert [chosen(48.0, prefer).file for prefer in PREFERENCES] == [
        "large.safetensors",  # balanced
        "large.safetensors",  # quality
        "small.safetensors",  # speed
        "small.safetensors",  # small
    ]
    with pytest.raises(ValueError, match="unknown preference"):
        chosen(48.0, "cheap")


def test_an_installed_file_one_rank_below_the_best_is_kept_but_not_two() -> None:
    have_middle = {"middle.safetensors": 5_000}
    kept = chosen(48.0, installed=have_middle)
    assert kept.file == "middle.safetensors" and kept.installed and kept.download_bytes == 0
    assert kept.reason.endswith("installed (kept: nearly as good as the best for this card)")
    # two ranks below: the better file is worth it - but auto does not stop a run for it; it keeps the installed
    # one and names the better one (2.0's review after 3.5: a computer with 1.6's files keeps running them)
    have_small = {"small.safetensors": 2_000}
    small = chosen(48.0, installed=have_small)
    assert small.file == "small.safetensors" and small.installed and small.better is LARGE
    assert "large.safetensors would suit this card better" in small.warning
    quality = chosen(48.0, "quality", have_middle)
    assert quality.file == "middle.safetensors" and quality.better is LARGE  # quality names the best
    best = chosen(48.0, installed={"large.safetensors": 9_000})
    assert best.installed and best.reason.endswith("runs on the card, installed")


def test_auto_takes_an_installed_file_rather_than_stop_a_run() -> None:
    # only the large file is there, and the card is too small to run it fully: it runs, slower, and is kept
    slow = chosen(8.0, installed={"large.safetensors": 9_000})
    assert slow.file == "large.safetensors" and slow.installed and slow.better is not None
    assert "slower" in slow.warning or "very slow" in slow.warning
    # nothing installed: the plan's file, to fetch
    assert chosen(8.0).better is None and not chosen(8.0).installed


def test_a_file_of_another_size_is_not_installed() -> None:
    half = chosen(12.0, installed={"middle.safetensors": 1_234})  # an interrupted download
    assert half.file == "middle.safetensors" and not half.installed and half.download_bytes == 5_000


def test_a_pin_wins_and_warns_when_the_card_is_too_small() -> None:
    pinned = pick(DEMO, vram_gib=8.0, installed={"large.safetensors": 9_000}, pinned="large.safetensors")
    assert pinned.file == "large.safetensors" and pinned.installed and pinned.reason == "your choice"
    assert pinned.warning == "large.safetensors needs about 12 GB of graphics memory; this card has 8.0"
    fine = pick(DEMO, vram_gib=24.0, installed={}, pinned="large.safetensors")
    assert fine.warning == "" and not fine.installed
    # a finetune: not in the catalogue, taken as it is
    own = pick(DEMO, vram_gib=8.0, installed={"my-finetune.safetensors": 1}, pinned="my-finetune.safetensors")
    assert (
        own.variant is None
        and own.installed
        and "a file of your own" in own.reason
        and own.download_bytes == 0
    )
    assert pick(DEMO, vram_gib=8.0, installed={}, pinned="auto").file == "small.safetensors"  # auto is no pin


@given(
    vram=st.one_of(st.none(), st.floats(min_value=0.5, max_value=64.0)),
    prefer=st.sampled_from(PREFERENCES),
    have=st.sets(st.sampled_from(["small.safetensors", "middle.safetensors", "large.safetensors"])),
    order=st.permutations([SMALL, MIDDLE, LARGE]),
)
def test_the_pick_does_not_depend_on_the_order_of_the_variants_and_always_says_why(
    vram: float | None, prefer: str, have: set[str], order: list[Variant]
) -> None:
    sizes = {v.file: v.bytes for v in (SMALL, MIDDLE, LARGE)}
    installed = {file: sizes[file] for file in have}
    shuffled = Component("demo", "Demo", "checkpoints", tuple(order))
    first = pick(DEMO, vram_gib=vram, installed=installed, prefer=prefer)
    second = pick(shuffled, vram_gib=vram, installed=installed, prefer=prefer)
    assert (first.file, first.reason, first.warning) == (second.file, second.reason, second.warning)
    assert first.reason and first.variant is not None
    assert first.installed == (first.file in installed)


# --- the shipped catalogue ----------------------------------------------------------------------------------------

EXPECTED = {
    # card: (YuE2, FLUX.2 Klein, FLUX.2 text encoder) for the song template, nothing installed, balanced
    None: ("yue2_3b_int8_convrot", "flux-2-klein-4b-fp8", "qwen_3_4b_fp4_flux2"),
    6.0: ("yue2_3b_int8_convrot", "flux-2-klein-4b-fp8", "qwen_3_4b_fp4_flux2"),
    8.0: ("yue2_3b_int8_convrot", "flux-2-klein-4b-fp8", "qwen_3_4b_fp4_flux2"),
    11.9: ("yue2_3b_int8_convrot", "flux-2-klein-4b-fp8", "qwen_3_4b_fp4_flux2"),
    15.9: ("yue2_3b_int8_convrot", "flux-2-klein-4b", "qwen_3_4b"),
    23.9: ("yue2_3b_bf16", "flux-2-klein-4b", "qwen_3_4b"),
}


@pytest.mark.parametrize("card", CARDS)
def test_the_song_templates_files_for_the_usual_cards(card: float | None) -> None:
    found = plan(SONG, COMPONENTS, vram_gib=card, installed={})
    files = {p.component: p.file.removesuffix(".safetensors") for p in found.needed}
    assert (files["yue2"], files["flux2-klein"], files["flux2-text-encoder"]) == EXPECTED[card]
    assert files["flux2-vae"] == "flux2-vae"
    assert not found.ready and found.download_bytes == sum(p.variant.bytes for p in found.needed)  # type: ignore[union-attr]
    assert all(p.reason for p in (*found.needed, *found.optional))
    assert found.licences[0] == "CC BY-NC 4.0"  # YuE2's, first: the song is non-commercial


@pytest.mark.parametrize("card", [None, 4.0, 6.0, 8.0, 10.0, 11.9, 12.0, 15.4, 15.9, 23.9, 48.0])
def test_a_computer_with_1_6s_files_runs_every_template_on_auto(card: float | None) -> None:
    """The review after 3.5 (C1): with the templates' 1.6 defaults installed, auto must not stop on any card."""
    installed = {v.file: v.bytes for c in COMPONENTS.values() for v in c.variants if v.default}
    templates = {t for c in COMPONENTS.values() for t in c.templates}
    for template in templates:
        found = plan(template, COMPONENTS, vram_gib=card, installed=installed)
        assert found.ready, (template, card, [p.file for p in found.missing])


def test_what_is_installed_on_a_16_gb_card_is_what_the_plan_names() -> None:
    """The files of a 1.6 installation on 16 GB - the templates' defaults - are the plan's picks: nothing to fetch."""
    installed = {v.file: v.bytes for c in COMPONENTS.values() for v in c.variants if v.default}
    for template in ("1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"):
        found = plan(template, COMPONENTS, vram_gib=15.9, installed=installed)
        assert found.ready and found.download_bytes == 0 and found.warnings == (), template
        assert all(p.variant is not None and p.variant.default for p in found.needed), template
    # ... and on 24 GB the installed int8 YuE2 is kept: one rank below the bf16, no 7.8 GB download for it
    large = plan(SONG, COMPONENTS, vram_gib=23.9, installed=installed)
    yue2 = next(p for p in large.needed if p.component == "yue2")
    assert yue2.file == "yue2_3b_int8_convrot.safetensors" and "kept" in yue2.reason and large.ready


def test_pins_and_preferences_reach_every_component_of_a_template() -> None:
    pins = {"yue2": "my-yue2-finetune.safetensors", "flux2-klein": "auto"}
    found = plan(SONG, COMPONENTS, vram_gib=15.9, installed={"my-yue2-finetune.safetensors": 5}, pins=pins)
    by_component = {p.component: p for p in found.needed}
    assert by_component["yue2"].variant is None and by_component["yue2"].installed
    assert by_component["flux2-klein"].file == "flux-2-klein-4b.safetensors"
    small = plan(SONG, COMPONENTS, vram_gib=23.9, installed={}, prefer="small")
    assert {p.component: p.file for p in small.needed}["flux2-klein"] == "flux-2-klein-4b-fp8.safetensors"
    assert small.download_bytes < plan(SONG, COMPONENTS, vram_gib=23.9, installed={}).download_bytes
    # the optional blocks' files are planned too, apart from what the template needs
    assert {p.component for p in found.optional} >= {"audio-sr", "stems"}
    assert plan("0 · System Check", COMPONENTS, vram_gib=8.0, installed={}).needed == ()


def test_the_writers_native_files_go_by_the_card() -> None:
    writer = COMPONENTS["writer-native"]
    files = [pick(writer, vram_gib=card, installed={}).file.removesuffix(".safetensors") for card in CARDS]
    assert files == [
        "gemma4_e2b_it_int8_convrot",
        "gemma4_e2b_it_int8_convrot",
        "gemma4_e2b_it_int8_convrot",
        "gemma4_e4b_it_fp8_scaled",
        "gemma4_12b_int8_convrot",
        "gemma4_12b_int8_convrot",
    ]


def test_the_fingerprint_changes_when_a_file_arrives_or_the_pick_changes() -> None:
    before = plan(SONG, COMPONENTS, vram_gib=15.9, installed={}).needed
    after = plan(SONG, COMPONENTS, vram_gib=15.9, installed={"flux2-vae.safetensors": 336213556}).needed
    other = plan(SONG, COMPONENTS, vram_gib=8.0, installed={}).needed
    assert len({fingerprint(before), fingerprint(after), fingerprint(other)}) == 3
    assert fingerprint(before) == fingerprint(tuple(reversed(before))) and len(fingerprint(before)) == 16


# --- found by the mutation run (phase 9.3) ---------------------------------------------------------------------------


def test_a_card_with_exactly_the_files_threshold_runs_it() -> None:
    # 12.0 GiB is MIDDLE's full threshold: it runs on the card there, not below
    assert chosen(12.0, prefer="quality").reason.endswith("runs on the card")
    assert chosen(12.0, prefer="quality").file == "middle.safetensors"
    assert chosen(11.99, prefer="quality").file == "small.safetensors"
    # and LARGE's minimum: alone, it runs with offloading at exactly 12, too large below
    alone = Component("l", "L", "checkpoints", (LARGE,), templates=("T",))
    assert pick(alone, vram_gib=12.0, installed={}).reason.endswith("runs with offloading: slower")
    assert pick(alone, vram_gib=11.9, installed={}).reason.endswith("too large for this card: very slow")
    pinned = pick(DEMO, vram_gib=12.0, installed={}, pinned="large.safetensors")
    assert pinned.warning == ""  # exactly the minimum is enough
    assert "needs about 12 GB" in pick(DEMO, vram_gib=11.9, installed={}, pinned="large.safetensors").warning


def test_with_no_card_only_a_file_that_needs_none_runs() -> None:
    tiny = variant("tiny", 1_000, 1, 1, 0.5, 4.0)
    none_needed = variant("cpu", 3_000, 1, 1, 0.0, 0.0)
    component = Component("c", "C", "checkpoints", (tiny, none_needed), templates=("T",))
    assert pick(component, vram_gib=None, installed={}).file == "cpu.safetensors"


def test_files_that_tie_are_ordered_by_size_the_smaller_first() -> None:
    a = variant("a-big", 9_000, 2, 2, 0.0, 4.0)
    b = variant("b-small", 4_000, 2, 2, 0.0, 4.0)
    component = Component("c", "C", "checkpoints", (a, b), templates=("T",))
    for prefer in ("balanced", "quality", "speed"):
        assert pick(component, vram_gib=8.0, installed={}, prefer=prefer).file == "b-small.safetensors", prefer


def test_an_installed_file_one_rank_below_is_kept_but_not_two() -> None:
    # 24 GiB: LARGE is the best; MIDDLE (one rank below) installed is kept, SMALL (two below) is not
    for prefer in ("balanced", "small"):
        kept = pick(DEMO, vram_gib=24.0, installed={MIDDLE.file: MIDDLE.bytes}, prefer="balanced")
        assert kept.file == MIDDLE.file and "kept" in kept.reason, prefer
    two_below = pick(DEMO, vram_gib=24.0, installed={SMALL.file: SMALL.bytes}, prefer="balanced")
    assert two_below.file == SMALL.file and two_below.better == LARGE  # used, but the better one is offered
    assert "kept" not in two_below.reason
    # speed: SMALL is the fastest; an installed file of higher quality is kept (it is not below the best)
    fast = pick(DEMO, vram_gib=24.0, installed={LARGE.file: LARGE.bytes}, prefer="speed")
    assert fast.file == LARGE.file and fast.better is None and "kept" in fast.reason
    # one rank below the fastest is the most "speed" and "small" keep: two below is replaced
    fastest = variant("fastest", 1_000, 3, 9, 0.0, 4.0)
    slow = variant("slow", 1_000, 1, 1, 0.0, 4.0)
    two = Component("c", "C", "checkpoints", (fastest, slow), templates=("T",))
    for prefer in ("speed", "small", "balanced"):
        replaced = pick(two, vram_gib=8.0, installed={slow.file: slow.bytes}, prefer=prefer)
        assert replaced.better == fastest and "kept" not in replaced.reason, prefer


def test_a_fresh_pick_is_not_called_kept_and_names_its_alternatives() -> None:
    fresh = chosen(24.0)
    assert "kept" not in fresh.reason
    assert fresh.variant not in fresh.alternatives and set(fresh.alternatives) == {SMALL, MIDDLE}
    pinned = pick(DEMO, vram_gib=24.0, installed={}, pinned="middle.safetensors")
    assert pinned.variant not in pinned.alternatives and len(pinned.alternatives) == 2


def test_a_slow_file_and_a_better_one_are_both_said() -> None:
    # 8 GiB with only LARGE installed: it runs with offloading (needs 12), and MIDDLE would suit better
    found = pick(DEMO, vram_gib=8.0, installed={LARGE.file: LARGE.bytes})
    assert found.file == LARGE.file
    assert "needs about 12 GB" in found.warning and found.warning.endswith("Plenio Setup can fetch it.")
    assert found.warning.index("needs about") < found.warning.index("would suit this card better")


def test_a_pick_and_a_plan_cannot_be_changed_afterwards() -> None:
    import dataclasses

    with pytest.raises(dataclasses.FrozenInstanceError):
        chosen(8.0).file = "other"  # type: ignore[misc]
