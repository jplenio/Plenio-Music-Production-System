"""Workflows saved with 1.x open in 2.0 (phase R4, rule 9): every node type they use still exists, and no node
holds more widget values than its definition makes now (fewer are filled with the defaults when ComfyUI loads them;
more would shift every value after them). The host tests run them (``tests/host/test_workflow_blocks.py``)."""

from __future__ import annotations

import gzip
import re
from pathlib import Path

import pytest
import workflow_validation as wv

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "workflows"
SAVED = sorted(FIXTURES.glob("*.json.gz"))


@pytest.mark.parametrize("saved", SAVED, ids=[p.name for p in SAVED])
def test_a_1x_workflow_uses_nodes_that_exist_with_no_more_values_than_they_take(saved: Path, tmp_path: Path) -> None:
    workflow = tmp_path / saved.name.removesuffix(".gz")
    workflow.write_bytes(gzip.decompress(saved.read_bytes()))
    problems = wv.validate_file(workflow, wv.load_snapshot(), wv.load_blueprints(wv.PROJECT / "subgraphs"))
    unknown = [p for p in problems if "unknown node type" in p]
    assert unknown == []
    too_many = []
    for problem in problems:
        counted = re.search(r"(\d+) widget values, the definition produces (\d+)", problem)
        if counted and int(counted.group(1)) > int(counted.group(2)):
            too_many.append(problem)
    assert too_many == []


def test_there_are_workflows_of_the_first_and_the_last_1x_release() -> None:
    names = " ".join(p.name for p in SAVED)
    assert "1.0.1" in names and "1.6.0" in names and len(SAVED) >= 3
