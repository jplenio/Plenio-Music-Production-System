"""New cover lyrics against their melody: the check, the repair request, the merge and the last step
(owner's request 2026-10-08, docs/design/harmony-and-lyrics-fit.md)."""

from __future__ import annotations

import json
from pathlib import Path

from plenio.core import lyrics_fit
from plenio.core.score import native

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def phrasing(*sections: tuple[str, list[int]]) -> list[dict[str, object]]:
    return [{"tag": f"[{tag}]", "phrases": phrases} for tag, phrases in sections]


def test_the_window_allows_fewer_syllables_than_notes_and_one_more_on_long_phrases() -> None:
    assert lyrics_fit.window(8) == (6, 9)
    assert lyrics_fit.window(4) == (2, 4)
    assert lyrics_fit.window(16) == (12, 17)


def test_lines_fit_their_phrases_one_to_one() -> None:
    text = "[Verse]\nI walk along the river\nThe water knows my name\n\n[Chorus]\nHold on"
    fit = lyrics_fit.check(text, phrasing(("Verse", [7, 6]), ("Chorus", [2])), language="English")
    assert fit.fits and fit.counts == (3, 3)
    verse = fit.sections[0]
    assert [(line.syllables, line.notes, line.phrases) for line in verse.lines] == [
        (7, 7, (0,)),
        (6, 6, (1,)),
    ]


def test_a_line_may_span_phrases_and_lines_may_share_one() -> None:
    # a line over a 6- and a 2-note phrase; two short lines on one 8-note phrase
    text = "[Verse]\nI walk along the river side\nHold me\nNever let go"
    fit = lyrics_fit.check(text, phrasing(("Verse", [6, 2, 8])), language="English")
    first, second, third = fit.sections[0].lines
    assert first.phrases == (0, 1) and first.notes == 8 and first.fits
    assert second.phrases == third.phrases == (2,) and second.shared == (3,) and second.fits


def test_the_original_words_of_the_fixture_mostly_fit() -> None:
    data = json.loads((FIXTURES / "cover" / "minimax-excerpt.json").read_text(encoding="utf-8"))
    fit = lyrics_fit.check(data["reference"], native.phrasing(data["abc"]), language="English")
    good, checked = fit.counts
    assert checked == 12 and good >= 9  # the transcription's phrases are rough; the sung words fit 10 of 12


def test_a_line_far_off_its_phrase_fails_with_its_target() -> None:
    text = "[Verse]\nOh\nThe night is long and every light is burning down the avenue"
    fit = lyrics_fit.check(text, phrasing(("Verse", [8, 8])), language="English")
    first, second = fit.sections[0].lines
    assert not first.fits and first.problem == "1 syllables for 8 notes - write 6-8"
    assert not second.fits and second.syllables > 9
    assert not fit.fits


def test_a_section_far_from_its_number_of_phrases_is_written_anew() -> None:
    text = "[Verse]\nOne line only"
    fit = lyrics_fit.check(text, phrasing(("Verse", [6, 6, 6, 6])), language="English")
    assert fit.sections[0].rewrite and not fit.fits
    empty = lyrics_fit.check("[Verse]\n\n[Outro]", phrasing(("Verse", [5]), ("Outro", [])))
    assert empty.sections[0].rewrite and not empty.sections[1].rewrite


def test_sections_of_the_same_tag_are_matched_in_order() -> None:
    text = "[Verse]\nI walk along the river\n\n[Chorus]\nHold on\n\n[Verse]\nOh"
    parts = phrasing(("Verse", [7]), ("Chorus", [2]), ("Verse", [1]))
    fit = lyrics_fit.check(text, parts, language="English")
    assert [s.phrases for s in fit.sections] == [(7,), (2,), (1,)]
    # the lyrics lack the chorus: the second verse still takes the second verse's phrases
    fit = lyrics_fit.check("[Verse]\nI walk along the river\n\n[Verse]\nOh", parts, language="English")
    assert [s.phrases for s in fit.sections] == [(7,), (1,)] and fit.fits


def test_sections_without_singing_are_not_checked() -> None:
    fit = lyrics_fit.check("[Intro]\nla la la\n\n[Verse]\nHold on", phrasing(("Intro", []), ("Verse", [2])))
    assert fit.fits and fit.counts == (1, 1)


def test_the_request_asks_for_failing_lines_only_with_targets_and_rhymes() -> None:
    text = (
        "[Verse]\nI walk along the river tonight\nThe water knows my name\n"
        "I keep on walking further and further into the burning light\nThe city calls again"
    )
    fit = lyrics_fit.check(text, phrasing(("Verse", [9, 6, 9, 6])), language="English")
    request = lyrics_fit.request(text, fit, language="English", theme="a long walk home")
    assert request is not None and request.asked == ((1, 3),)
    assert '"1-3": section 1 [Verse] line 3, "I keep on walking' in request.prompt
    assert "16 syllables, its phrase has 9 notes: write 6 to 9 syllables" in request.prompt
    assert 'rhymes with line 1 ("I walk along the river tonight")' in request.prompt
    assert "Theme: a long walk home" in request.prompt and "in English" in request.prompt
    # the schema holds the line's syllables to the target: 6 to 9 items
    slot = request.schema["properties"]["1-3"]["properties"]["syllables"]
    assert (slot["minItems"], slot["maxItems"]) == (6, 9) and request.schema["required"] == ["1-3"]
    assert (
        lyrics_fit.request(text, lyrics_fit.check(text, phrasing(("Verse", [9, 6, 17, 6]))), language="")
        is None
    )


def test_the_merge_takes_asked_lines_only_and_keeps_a_worse_one() -> None:
    text = "[Verse]\nI walk along the river tonight\nThe water knows my name\n\n[Chorus]\nHold on"
    fit = lyrics_fit.check(text, phrasing(("Verse", [7, 6]), ("Chorus", [2])), language="English")
    asked = lyrics_fit.request(text, fit).asked  # type: ignore[union-attr]
    assert asked == ((1, 1),)
    answer = (
        "<think>count</think>```json\n"
        '{"lines": [{"section": 1, "line": 1, "syllables": "I walk a-long the riv-er", "text": "I walk along the river"},'
        ' {"section": 1, "line": 2, "syllables": "x", "text": "Not asked for"},'
        ' {"section": 2, "line": 1, "syllables": "x", "text": "Not asked either"},]}\n```'
    )
    merged, notes = lyrics_fit.merge(text, answer, asked, fit)
    assert merged == "[Verse]\nI walk along the river\nThe water knows my name\n\n[Chorus]\nHold on"
    assert notes == ["[Verse] (section 1) line 1 rewritten"]
    worse = '{"lines": [{"section": "1", "line": "1", "syllables": "", "text": "I walk along the river tonight, my love"}]}'
    kept, notes = lyrics_fit.merge(text, worse, asked, fit)
    assert kept == text and "further off; kept" in notes[0]
    unusable, notes = lyrics_fit.merge(text, "I could not do it.", asked, fit)
    assert unusable == text and notes == ["the writer's answer had no lines to use"]


def test_a_section_asked_anew_is_taken_only_complete() -> None:
    text = "[Verse]\nOne line only"
    fit = lyrics_fit.check(text, phrasing(("Verse", [6, 6, 6])), language="English")
    request = lyrics_fit.request(text, fit)
    assert request is not None and request.asked == ((1, 0),)
    assert "write the section again with exactly 3 lines" in request.prompt
    assert request.schema["required"] == ["1-1", "1-2", "1-3"]
    lines = ["I walk along the road", "The night is calling me", "And I am going home"]
    answer = json.dumps({f"1-{n + 1}": {"syllables": t.split(), "text": t} for n, t in enumerate(lines)})
    merged, _notes = lyrics_fit.merge(text, answer, request.asked, fit)
    assert merged == "[Verse]\n" + "\n".join(lines)
    partial = json.dumps({"lines": [{"section": 1, "line": 2, "text": lines[1]}]})
    kept, notes = lyrics_fit.merge(text, partial, request.asked, fit)
    assert kept == text and "did not give the whole section" in notes[0]


def test_the_last_step_shortens_english_lines_by_one_or_two_syllables() -> None:
    text = (
        "[Verse]\nI am going to love you\nAnd I will hold you\nAnd now I hold you\n"
        "The water knows my name and every river runs to the sea"
    )
    parts = phrasing(("Verse", [5, 4, 4, 8]))
    fit = lyrics_fit.check(text, parts, language="English")
    shortened, notes = lyrics_fit.shorten(text, fit)
    # as far as needed: two contractions, one, a leading filler word
    assert shortened.splitlines()[1:4] == ["I'm gonna love you", "And I'll hold you", "Now I hold you"]
    after = lyrics_fit.check(shortened, parts, language="English").sections[0].lines
    assert [line.fits for line in after] == [True, True, True, False]
    assert len(notes) == 3  # the last line is far too long: the last step leaves it
    german = lyrics_fit.check(
        "[Verse]\nIch bin so müde heute Nacht", phrasing(("Verse", [5])), language="German"
    )
    assert lyrics_fit.shorten("[Verse]\nIch bin so müde heute Nacht", german) == (
        "[Verse]\nIch bin so müde heute Nacht",
        [],
    )


def test_a_keyed_answer_and_the_older_list_answer_both_merge() -> None:
    text = "[Verse]\nI walk along the river tonight\nThe water knows my name"
    fit = lyrics_fit.check(text, phrasing(("Verse", [7, 6])), language="English")
    keyed = json.dumps(
        {
            "1-1": {
                "syllables": ["I", "walk", "a", "long", "the", "riv", "er"],
                "text": "I walk along the river",
            }
        }
    )
    listed = json.dumps({"lines": [{"section": 1, "line": 1, "text": "I walk along the river"}]})
    expected = "[Verse]\nI walk along the river\nThe water knows my name"
    assert lyrics_fit.merge(text, keyed, [(1, 1)], fit)[0] == expected
    assert lyrics_fit.merge(text, listed, [(1, 1)], fit)[0] == expected


def test_a_round_asks_for_the_lines_furthest_off_first_and_at_most_max_lines() -> None:
    lines = [("Oh " * (1 + n % 5)).strip() for n in range(30)]  # 1-5 syllables on phrases of 10 notes
    text = "[Verse]\n" + "\n".join(lines)
    fit = lyrics_fit.check(text, phrasing(("Verse", [10] * 30)), language="English")
    request = lyrics_fit.request(text, fit)
    assert request is not None and len(request.asked) == lyrics_fit.MAX_LINES
    asked = {line for _section, line in request.asked}
    assert all(n + 1 in asked for n in range(30) if n % 5 == 0)  # every one-syllable line is among them
