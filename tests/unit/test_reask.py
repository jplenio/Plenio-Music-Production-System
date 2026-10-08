"""One more question to the arranger (owner's request 2026-10-08, design §3.5): the sections the harmony guard
had to repair much go back once, with concrete feedback; the second arrangement is used only when better."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import jsonschema

from plenio.core.arrangement import ModeLibrary, arrange, for_score, policy, reask

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
LIBRARY = ModeLibrary(ROOT / "resources" / "arrangement")


def rules(name: str, *, closeness: int = 60) -> Any:
    return policy(LIBRARY.by_name(name), kind="song", closeness=closeness, melody="vocal")


def entry(section: int, **fields: Any) -> dict[str, Any]:
    return {"section": section, "chords": "keep", "lead": "keep", "energy": 3, "key_shift": 0, **fields}


def plan(*sections: dict[str, Any]) -> str:
    return json.dumps({"idea": "test", "tempo_change": 0, "sections": list(sections)})


BAD = plan(entry(1, chords=["Db", "Gb", "Ab", "Eb"]), entry(2))  # none of it fits C major and the melody


def answer(*chords: str) -> str:
    return json.dumps(
        {"sections": [{"section": 1, "chords": list(chords), "lead": "keep", "energy": 3, "key_shift": 0}]}
    )


def test_a_section_the_guard_repaired_much_is_asked_again_with_feedback() -> None:
    policy = rules("varied")
    first = arrange(FIXTURE, BAD, policy)
    found = reask.flags(first, policy)
    assert [flag.section for flag in found] == [1] and len(found[0].reasons) == 4
    request = reask.request(FIXTURE, first, policy)
    assert request is not None and request.sections == (1,)
    assert "bar 1: Db is not a chord of C in pop" in request.prompt
    assert "the melody on the strong beats: E E | D D | E B | F G" in request.prompt
    assert "chords that fit (C major: C, Dm, Em, F, G, Am" in request.prompt
    assert '"<bar 1>"' in request.prompt and '"Db"' not in request.prompt.split("ANSWER")[1]
    jsonschema.validate(json.loads(answer("C", "G", "Am", "Dm")), request.schema)


def test_a_plan_the_guard_accepts_is_not_asked_again() -> None:
    policy = rules("varied")
    good = arrange(FIXTURE, plan(entry(1, chords=["C", "G", "Am", "Dm"]), entry(2)), policy)
    assert reask.flags(good, policy) == [] and reask.request(FIXTURE, good, policy) is None
    no_chords = for_score(policy, has_chords=False)  # YuE2 harmonises: there are no chords to ask about
    assert reask.flags(arrange(FIXTURE, BAD, policy), no_chords) == []


def test_only_the_asked_sections_change_and_the_better_arrangement_wins() -> None:
    policy = rules("varied")
    first = arrange(FIXTURE, BAD, policy)
    merged = reask.merged_answer(first, answer("C", "G", "Am", "Dm"), (1,))
    assert merged is not None
    sections: list[dict[str, Any]] = json.loads(merged)["sections"]
    assert sections[0]["chords"] == ["C", "G", "Am", "Dm"] and sections[1]["chords"] == "keep"
    second = arrange(FIXTURE, merged, policy)
    assert reask.repairs(second) < reask.repairs(first) and reask.better(first, second)
    # a second answer that is no better is not taken
    worse = arrange(FIXTURE, reask.merged_answer(first, answer("Db", "Gb", "Ab", "Eb"), (1,)) or "", policy)
    assert not reask.better(first, worse)


def test_an_answer_for_other_sections_or_without_json_is_not_used() -> None:
    first = arrange(FIXTURE, BAD, rules("varied"))
    assert reask.merged_answer(first, "Sorry.", (1,)) is None
    other = json.dumps(
        {"sections": [{"section": 2, "chords": ["F"], "lead": "pad", "energy": 3, "key_shift": 0}]}
    )
    assert reask.merged_answer(first, other, (1,)) is None
