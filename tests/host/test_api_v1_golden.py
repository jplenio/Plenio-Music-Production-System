"""Phase 5.1: the Song API v1 answers a caller on this computer as Plenio 1.6.0 did - every endpoint of
``tools/api_v1_golden.py``'s series against the golden answers recorded from 1.6.0 (``tests/fixtures/api-v1``),
with only the reviewed differences of ``DELTAS``."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from harness import PROJECT, ComfyServer

pytestmark = pytest.mark.host

sys.path.insert(0, str(PROJECT / "tools"))

from api_v1_golden import DELTAS, differences, normalise, series, series_v2, unexplained  # noqa: E402

GOLDEN = PROJECT / "tests" / "fixtures" / "api-v1"
GOLDEN_V2 = PROJECT / "tests" / "fixtures" / "api-v2"


def stand_in_models(models: Path) -> list[Path]:
    """Empty files of every catalogue name, as the golden answers were recorded with; returns those it made (the
    server is shared with the other host tests: they are taken away again)."""
    from plenio.core.models import load_components

    made = []
    for component in load_components(PROJECT / "resources" / "models.toml").values():
        for variant in component.variants:
            target = models / component.folder / variant.file
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                target.write_bytes(b"")
                made.append(target)
    return made


def test_v1_answers_this_computer_as_1_6_0_did(server: ComfyServer) -> None:
    made = stand_in_models(server.base / "models")
    problems: list[str] = []
    try:
        for case, answer in series(server.url):
            golden = json.loads((GOLDEN / f"{case}.json").read_text(encoding="utf-8"))
            found = list(differences(golden, normalise(answer, str(server.base))))
            problems += [f"{case}{d}" for d in unexplained(case, found)]
    finally:
        for path in made:
            path.unlink(missing_ok=True)
    assert problems == [], "\n".join(problems)
    assert all(why for _case, _prefix, why in DELTAS)  # every allowed difference has its reason


def test_v2_answers_as_recorded(server: ComfyServer) -> None:
    """Phase 5.3: API v2's answers, recorded from 2.0's code - the later tasks of phase 5 keep them (a change of
    v2 is recorded anew on purpose, with its reason in the commit)."""
    made = stand_in_models(server.base / "models")
    problems: list[str] = []
    try:
        for case, answer in series_v2(server.url):
            golden = json.loads((GOLDEN_V2 / f"{case}.json").read_text(encoding="utf-8"))
            problems += [f"{case}{d}" for d in differences(golden, normalise(answer, str(server.base)))]
    finally:
        for path in made:
            path.unlink(missing_ok=True)
    assert problems == [], "\n".join(problems)
