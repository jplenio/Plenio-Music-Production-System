"""The documentation's facts come from the code (phase D1, PD 10.3)."""

from __future__ import annotations

import re
from pathlib import Path

import facts
import pytest

from plenio.core.system import MIN_COMFYUI

ROOT = Path(__file__).resolve().parents[2]


def test_every_marker_is_as_the_code_says() -> None:
    assert facts.main(["--check"]) == 0, "run python tools/facts.py --write"


def test_a_number_edited_by_hand_is_found() -> None:
    known = facts.compute()
    edited = "Plenio adds <!--fact:nodes-->12<!--/fact--> nodes."
    assert facts.fill(edited, known) == f"Plenio adds <!--fact:nodes-->{known['nodes']}<!--/fact--> nodes."
    with pytest.raises(KeyError):
        facts.fill("<!--fact:no.such-->1<!--/fact-->", known)
    table = facts.fill("<!--facts:hardware-table-->\nold\n<!--/facts-->", known)
    assert "STALE ROW" not in table and "| 16-24 GB |" in table


def test_the_counts_are_the_codes() -> None:
    known = facts.compute()
    assert known["templates"] == len(list((ROOT / "example_workflows").glob("*.json")))
    assert (
        known["visuals"]["all"]
        == known["visuals"]["classic"] + known["visuals"]["drop"] + known["visuals"]["nova"] + 1
    )
    assert known["nodes"] >= 30 and known["brief_templates"] >= 200


def test_the_minimum_comfyui_is_the_one_the_ci_runs() -> None:
    assert ".".join(map(str, MIN_COMFYUI)) == facts.COMFYUI_TESTED[0]
    ci = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
    tags = [f"v{tag}" for tag in facts.COMFYUI_TESTED]
    assert all(re.search(rf"'\[\"{tags[0]}\", \"{tags[1]}\"\]'", line) for line in [ci]), (
        "ci.yml's host matrix"
    )
    assert f'requires-comfyui = ">={facts.COMFYUI_TESTED[0]}"' in (ROOT / "pyproject.toml").read_text(
        encoding="utf-8"
    )
