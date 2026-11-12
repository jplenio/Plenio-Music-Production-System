"""The Player API's search (plenio/player/search.py) finds what the page's search finds: both read the cases of
tests/fixtures/player/search-cases.json (the page's side: frontend/tests/searchParity.test.ts)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.player.search import Context, parse_query, search

CASES = json.loads(
    (Path(__file__).parents[1] / "fixtures" / "player" / "search-cases.json").read_text("utf-8")
)


@pytest.mark.parametrize("case", CASES["cases"], ids=lambda c: c["query"] or "(empty)")
def test_the_same_songs_in_the_same_order(case: dict[str, object]) -> None:
    context = Context.of_state(CASES["state"], CASES["measured"])
    assert [s["id"] for s in search(CASES["songs"], str(case["query"]), context)] == case["ids"]


def test_the_query_s_parts() -> None:
    terms = parse_query('#party -genre:pop "slow dance" what:ever')
    assert [(t.field, t.value, t.negate) for t in terms] == [
        ("tag", "party", False),
        ("genre", "pop", True),
        ("", "slow dance", False),
        ("", "what:ever", False),
    ]
