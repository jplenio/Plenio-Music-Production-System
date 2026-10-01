"""A cover's original lyrics follow arranged sections (docs/design/score-arrange-design.md §4): the
final score's bars find their transcribed bars by content, so a copied chorus gets the chorus words
again, a moved verse takes its words along and a deleted section's words are left out (reported)."""

from __future__ import annotations

import json
from dataclasses import replace
from pathlib import Path

from plenio.core import alignment as al
from plenio.core import lyrics as lyrics_rules
from plenio.core import score as score_rules
from plenio.core.score import bar_match, ops
from plenio.core.score import canonical as c
from plenio.core.score.timeline import Timeline, TimelineBar, timeline_from_dict

ROOT = Path(__file__).resolve().parents[2]
TAKE = json.loads((ROOT / "tests" / "fixtures" / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))
PLAN = c.from_abc(TAKE["abc"])  # intro 1-9, verse 10-17, chorus 18-29, verse 30-38, chorus 39-54, outro 55-68


def timeline() -> Timeline:
    analysis = score_rules.analyze(TAKE["abc"])
    starts = TAKE["bar_starts"]
    ends = [*starts[1:], TAKE["duration_s"]]
    return Timeline(
        source_sha256="src",
        score_sha256="abc",
        duration_s=TAKE["duration_s"],
        bars=tuple(
            TimelineBar(a, b, bar.meter) for a, b, bar in zip(starts, ends, analysis.bars, strict=True)
        ),
        sections=tuple((s.label, s.start_bar, s.bars) for s in analysis.sections),
        vocal_notes=tuple((a, b) for a, b in TAKE["vocal_notes"]),
        bar_prints=bar_match.bar_prints(PLAN),
    )


def draft(score: c.Score, *, prints: bool = True) -> al.Alignment:
    abc = c.to_abc(score)
    analysis = score_rules.analyze(abc)
    return al.align(
        al.words_from(TAKE["words"]),
        list(analysis.sections),
        timeline=timeline(),
        score_meters=[b.meter for b in analysis.bars],
        score_prints=bar_match.bar_prints(score) if prints else (),
    )


def blocks(text: str) -> list[tuple[str, list[str]]]:
    return [(s.tag, al.normalize_words("\n".join(s.lines))) for s in lyrics_rules.parse_lyrics(text).sections]


def test_an_unchanged_score_is_its_own_transcription() -> None:
    prints = bar_match.bar_prints(PLAN)
    assert len(prints) == PLAN.measure_count and prints[0][0].startswith("4/4:")
    assert bar_match.is_identity(bar_match.match_bars(prints, prints), len(prints))
    assert draft(PLAN).method == "beat grid"


def test_arranged_bars_find_their_source_bars() -> None:
    source = bar_match.bar_prints(PLAN)
    copied = ops.arrange_sections(PLAN, [1, 2, 3, 3, 4, 5, 6]).score
    mapping = bar_match.match_bars(bar_match.bar_prints(copied), source)
    assert mapping[:29] == list(range(29))
    assert mapping[29:41] == list(range(17, 29))  # the copy is the first chorus again
    assert mapping[41:] == list(range(29, 68))
    deleted = ops.arrange_sections(PLAN, [1, 2, 3, 6]).score
    assert bar_match.match_bars(bar_match.bar_prints(deleted), source)[29:] == list(range(54, 68))
    # a bar whose notes were edited keeps its place after the bar before it
    bar = PLAN.starts[11]
    edited = ops.paste(
        PLAN, bar, PLAN.lengths[11], [{"track": "vocal", "onset": 0, "duration": 4, "pitch": 40}]
    ).score
    assert bar_match.match_bars(bar_match.bar_prints(edited), source)[11] == 11


def test_a_copied_chorus_gets_its_words_and_a_deleted_section_loses_them() -> None:
    plain = blocks(draft(PLAN).lyrics)
    copied = draft(ops.arrange_sections(PLAN, [1, 2, 3, 3, 4, 5, 6]).score)
    assert copied.method == "matched bars"
    words = blocks(copied.lyrics)
    assert [tag for tag, _ in words] == ["Intro", "Verse", "Chorus", "Chorus", "Verse", "Chorus", "Outro"]
    assert words[3][1] == plain[2][1] and words[3][1]  # the copy sings the first chorus again
    assert [w for _, w in words[:3]] == [w for _, w in plain[:3]]
    assert [w for _, w in words[4:]] == [w for _, w in plain[3:]]
    deleted = draft(ops.arrange_sections(PLAN, [1, 2, 3, 6]).score)
    kept = blocks(deleted.lyrics)
    assert [w for _, w in kept] == [w for _, w in [plain[0], plain[1], plain[2], plain[5]]]
    assert any("no longer in the score were left out" in w for w in deleted.warnings)


def test_a_moved_section_takes_its_words_along_and_lines_break_at_the_jump() -> None:
    plain = blocks(draft(PLAN).lyrics)
    moved = draft(ops.arrange_sections(PLAN, [1, 3, 2, 4, 5, 6]).score)
    words = blocks(moved.lyrics)
    assert [tag for tag, _ in words][:3] == ["Intro", "Chorus", "Verse"]
    assert words[1][1] == plain[2][1] and words[2][1] == plain[1][1]
    # without the bars' content (a timeline from before 0.4.0) the old fallback stays
    assert draft(ops.arrange_sections(PLAN, [1, 3, 2, 4, 5, 6]).score, prints=False).method != "matched bars"


def test_the_timeline_keeps_the_prints() -> None:
    line = timeline()
    data = json.loads(json.dumps(line.to_dict()))
    assert timeline_from_dict(data).bar_prints == line.bar_prints
    assert (
        "bar_prints" not in replace(line, bar_prints=()).to_dict()
    )  # old timelines read and write as before


# --- the editor computes the same (frontend/tests/fixtures/bar-match.json) -------------------------

MATCH_FIXTURE = ROOT / "frontend" / "tests" / "fixtures" / "bar-match.json"
TRICKY = json.loads(
    (ROOT / "frontend" / "tests" / "fixtures" / "tricky-score.json").read_text(encoding="utf-8")
)["abc"]


def match_fixture() -> dict[str, object]:
    source = bar_match.bar_prints(PLAN)
    edits = []
    for name, order in (
        ("copy the first chorus", [1, 2, 3, 3, 4, 5, 6]),
        ("move the first chorus up", [1, 3, 2, 4, 5, 6]),
        ("delete the second verse and chorus", [1, 2, 3, 6]),
    ):
        prints = bar_match.bar_prints(ops.arrange_sections(PLAN, order).score)
        edits.append({"name": name, "prints": prints, "mapping": bar_match.match_bars(prints, source)})
    data = {"tricky_prints": bar_match.bar_prints(c.from_abc(TRICKY)), "source": source, "edits": edits}
    return json.loads(json.dumps(data))


def write_match_fixture() -> None:
    with MATCH_FIXTURE.open("w", encoding="utf-8", newline="\n") as file:
        file.write(json.dumps(match_fixture(), indent=1) + "\n")


def test_the_bar_match_fixture_is_current() -> None:
    assert json.loads(MATCH_FIXTURE.read_text(encoding="utf-8")) == match_fixture(), (
        'regenerate frontend/tests/fixtures/bar-match.json: python -c "import sys; '
        "sys.path[:0] = ['tests/unit', 'tests/support']; import test_bar_match as t; t.write_match_fixture()\""
    )
