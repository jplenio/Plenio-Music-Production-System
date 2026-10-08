"""One more question to the arranger: the sections the harmony guard had to repair, with concrete feedback.

Owner's request 2026-10-08 (``docs/design/harmony-and-lyrics-fit.md`` §3.5): when the guard replaced more than
a third of a section's bars of the writer's chords, or a section fell back to the plan because it clashed more
than before, the writer is asked once more - for those sections only, with what did not fit, the melody on the
strong beats and the chords that fit their key. Its answer goes through the same guard (``arrange`` on the plan
with these sections replaced); the second arrangement is taken only when it has fewer repairs and no more
clashes. Never more than once.
"""

from __future__ import annotations

import json
import math
import re
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from ..score import canonical as c
from . import harmony
from .apply import Arrangement
from .plan import (
    ENERGY,
    Policy,
    ScoreSummary,
    _json_object,
    for_score,
    schema,
    summarize,
)

REPAIR_SHARE = 1 / 3
"""A section is asked again when the guard repaired more than this share of its bars."""
_REPAIR = re.compile(r"^bar \d+:")
_GATE = "clashed more than before"


@dataclass(frozen=True)
class Flag:
    section: int
    """1-based."""
    label: str
    bars: str
    reasons: tuple[str, ...]


def _bar_count(bars: str) -> int:
    first, _, last = bars.partition("-")
    return int(last or first) - int(first) + 1


def repairs(result: Arrangement) -> int:
    """The guard's repairs and the sections that fell back (each counts as all its bars)."""
    total = 0
    for section in result.sections:
        total += sum(1 for kept in section.kept if _REPAIR.match(kept))
        total += sum(_bar_count(section.bars) for kept in section.kept if _GATE in kept)
    return total


def flags(result: Arrangement, policy: Policy) -> list[Flag]:
    """The sections to ask again about (none when the plan was not used, or the chords may not change)."""
    if result.plan is None or result.status not in ("applied", "partial", "unchanged") or not policy.chords:
        return []
    found = []
    for section, planned in zip(result.sections, result.plan.sections, strict=False):
        repaired = [kept for kept in section.kept if _REPAIR.match(kept)]
        gate = [kept for kept in section.kept if _GATE in kept]
        if planned.chords is None and not gate:
            continue
        if gate or len(repaired) > _bar_count(section.bars) * REPAIR_SHARE:
            found.append(Flag(section.index, section.label, section.bars, tuple(repaired + gate)))
    return found


def _palette(summary: ScoreSummary, index: int, policy: Policy) -> str:
    info = summary.sections[index - 1]
    try:
        vocab = harmony.vocabulary(
            harmony.key_of(info.key or summary.key),
            harmony.genre_of(policy.genre),
            policy.qualities,
            closeness=policy.closeness,
            slash=policy.slash,
            tensions=policy.tensions,
        )
    except (KeyError, ValueError):
        return ""
    key = info.key or summary.key
    tonic = key[:-1] if vocab.key.minor else key
    return f"{tonic} {'minor' if vocab.key.minor else 'major'}: {vocab.palette()}"


@dataclass(frozen=True)
class Reask:
    prompt: str
    schema: dict[str, Any]
    sections: tuple[int, ...]


def _example(entry: dict[str, Any], flag: Flag) -> dict[str, Any]:
    """The section's entry with a place for a chord per bar (not the chords that did not fit)."""
    first = int(flag.bars.partition("-")[0])
    chords = [f"<bar {first + i}>" for i in range(_bar_count(flag.bars))]
    return {**entry, "chords": chords}


def request(text: str, result: Arrangement, policy: Policy, *, engine_name: str = "YuE2") -> Reask | None:
    """The re-ask for ``result`` of the score ``text`` (``None``: nothing to ask)."""
    found = flags(result, policy)
    if not found or result.plan is None:
        return None
    score = c.from_abc(text)
    summary = summarize(score, melody=policy.melody)
    policy = for_score(policy, has_chords=summary.has_chords)
    plan = result.plan.to_dict()
    lines = [
        f"You planned an arrangement for the AI music model {engine_name}. Plenio's harmony check could not use all "
        "of it: in the sections below your chords did not fit the melody or the key, and Plenio had to replace "
        "them (or kept the section as it was). Plan these sections once more - keep your idea.",
        "",
        "YOUR PLAN",
        json.dumps({"idea": plan["idea"], "sections": plan["sections"]}, ensure_ascii=False),
        "",
        "PLAN AGAIN",
    ]
    for flag in found:
        info = summary.sections[flag.section - 1]
        lines.append(f"- section {flag.section} ({flag.label}, bars {flag.bars}):")
        lines += [f"  - {reason}" for reason in flag.reasons[:8]]
        if policy.melody != "none":
            lines.append(f"  - the melody on the strong beats: {' | '.join(info.melody)}")
        lines.append(f"  - the chords planned now: {' | '.join(info.chords)}")
        palette = _palette(summary, flag.section, policy)
        if palette:
            lines.append(f"  - chords that fit ({palette})")
    lines += [
        "",
        "RULES",
        "- One chord per bar, chosen from the chords that fit, each containing the melody notes of its bar; "
        '"keep" keeps a bar\'s planned chord.',
        "- lead, energy and key_shift as in your plan, unless they caused the clash.",
        f"- energy {ENERGY[0]} to {ENERGY[1]}.",
        "",
        "ANSWER: only this JSON, one entry per section asked for:",
        json.dumps({"sections": [_example(plan["sections"][flag.section - 1], flag) for flag in found]}),
    ]
    full = schema(policy, len(summary.sections))
    item = json.loads(json.dumps(full["properties"]["sections"]["items"]))
    item["properties"]["section"] = {"type": "integer", "enum": [flag.section for flag in found]}
    answer_schema = {
        "type": "object",
        "properties": {
            "sections": {"type": "array", "minItems": len(found), "maxItems": len(found), "items": item}
        },
        "required": ["sections"],
        "additionalProperties": False,
    }
    return Reask("\n".join(lines), answer_schema, tuple(flag.section for flag in found))


def merged_answer(result: Arrangement, answer: str, sections: Sequence[int]) -> str | None:
    """The first plan with the asked sections replaced by the answer's (``None``: nothing usable)."""
    if result.plan is None:
        return None
    try:
        data = _json_object(answer)
    except ValueError:
        return None
    entries = data.get("sections") if isinstance(data, dict) else None
    if not isinstance(entries, list):
        return None
    plan = result.plan.to_dict()
    replaced = 0
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        try:
            number = int(entry.get("section", 0))
        except (TypeError, ValueError):
            continue
        if number in sections and 1 <= number <= len(plan["sections"]):
            plan["sections"][number - 1] = {**plan["sections"][number - 1], **entry, "section": number}
            replaced += 1
    if not replaced:
        return None
    return json.dumps(
        {"idea": plan["idea"], "tempo_change": plan["tempo_change"], "sections": plan["sections"]},
        ensure_ascii=False,
    )


def better(first: Arrangement, second: Arrangement) -> bool:
    """Whether the second arrangement is taken: fewer repairs, and no more clashes against the melody or
    between voice and line."""
    if second.status not in ("applied", "partial") or not second.harmony:
        return False
    # against the first arrangement - or, when it used nothing, against the score as planned
    a = (first.harmony.get("after") if first.harmony else second.harmony.get("before")) or {}
    b = second.harmony.get("after") or {}
    if b.get("accented_avoid", math.inf) > a.get("accented_avoid", math.inf):
        return False
    if b.get("clashes", math.inf) > a.get("clashes", math.inf):
        return False
    return repairs(second) < repairs(first)
