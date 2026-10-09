"""A song's planned score made to fit the lyrics' song form (owner's request 2026-10-08; study G1)."""

from __future__ import annotations

from plenio.core import lyrics, song_form
from plenio.core import score as score_rules
from plenio.core.score import canonical as c

HEAD = """X:1
T:
M:4/4
L:1/16
Q:1/4=100
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
"""
MELODIES = {"verse": "E4G4A4G4", "chorus": "c4B4A4G4", "bridge": "F4A4c4A4", "intro": "G4E4D4C4"}


def plan(*sections: str) -> str:
    """One bar per section; a name with ``-`` is instrumental (``intro-``), else sung with its own melody."""
    parts = []
    for name in sections:
        label = name.rstrip("-")
        vocal = '"C"z16|' if name.endswith("-") else f'"C"{MELODIES[label]}|'
        parts.append(f"% {label}\nV: Vocal\n{vocal}\nV: Ins\nC16|\n")
    return HEAD + "".join(parts)


def lyric(*sections: str) -> str:
    return "\n\n".join(f"[{s.rstrip('-')}]" + ("" if s.endswith("-") else "\nla la la la") for s in sections)


def form_of(abc: str) -> list[tuple[str, bool]]:
    return [(p.label, p.sung) for p in song_form.plan_sections(c.from_abc(abc))]


def melodies(abc: str) -> list[str]:
    model = c.from_abc(abc)
    return [
        "".join(str(n.pitch) for n in model.vocal if model.starts[i] <= n.onset < model.starts[i + 1])
        for i in range(model.measure_count)
    ]


def test_a_plan_with_the_lyrics_form_stays() -> None:
    abc = plan("intro-", "verse", "chorus", "outro-")
    form = song_form.match(lyric("Verse 1", "Chorus"), abc)
    assert form.category == song_form.MATCH and form.score == abc and not form.changes


def test_sections_of_the_plan_are_put_in_the_lyrics_order() -> None:
    # the plan left out the second chorus and has a sung intro the lyrics have no words for
    abc = plan("intro", "verse", "chorus", "verse", "outro-")
    form = song_form.match(lyric("Verse 1", "Chorus", "Verse 2", "Chorus"), abc)
    assert form.category == song_form.ASSEMBLE
    assert form_of(form.score) == [
        ("verse", True),
        ("chorus", True),
        ("verse", True),
        ("chorus", True),
        ("outro", False),
    ]
    chorus = melodies(abc)[2]
    assert melodies(form.score)[1] == melodies(form.score)[3] == chorus  # chorus words on the chorus melody
    assert score_rules.analyze(form.score).ok


def test_as_many_sections_of_other_kinds_are_renamed() -> None:
    abc = plan("intro-", "verse", "verse", "verse")
    form = song_form.match(lyric("Verse", "Chorus", "Bridge"), abc)
    assert form.category == song_form.RENAME
    assert form_of(form.score) == [("intro", False), ("verse", True), ("chorus", True), ("bridge", True)]
    assert melodies(form.score) == melodies(abc)  # only the names changed


def test_a_missing_kind_takes_a_related_melody_only_as_the_last_resort() -> None:
    abc = plan("verse", "chorus", "verse", "chorus")
    lyrics_text = lyric("Verse", "Chorus", "Verse", "Chorus", "Bridge", "Chorus")
    first = song_form.match(lyrics_text, abc)
    assert first.category == song_form.DIFFERS and first.quality < song_form.REPLAN_BELOW
    last = song_form.match(lyrics_text, abc, substitute=True)
    assert last.category == song_form.SUBSTITUTE and "bridge on the verse's melody" in last.changes
    labels = [label for label, _sung in form_of(last.score)]
    assert labels == ["verse", "chorus", "verse", "chorus", "bridge", "chorus"]
    assert melodies(last.score)[4] == melodies(abc)[0]


def test_a_far_longer_assembly_is_refused() -> None:
    abc = plan("verse", "chorus")
    form = song_form.match(lyric("Verse", "Chorus", "Verse", "Chorus", "Verse", "Chorus"), abc)
    assert form.category == song_form.DIFFERS and "times as long" in form.notes[0]


def test_instrumentals_and_planning_off_are_skipped() -> None:
    abc = plan("intro-", "verse")
    assert song_form.match("[instrumental]", abc).category == song_form.SKIP
    assert song_form.match(lyric("Verse"), "").category == song_form.SKIP


def test_the_better_plan_wins_and_the_first_at_equal_quality() -> None:
    lyrics_text = lyric("Verse", "Chorus")
    first = song_form.match(lyrics_text, plan("verse", "verse", "verse"))
    second = song_form.match(lyrics_text, plan("verse", "chorus"))
    assert song_form.better(first, second) is second
    assert song_form.better(second, song_form.match(lyrics_text, plan("intro-", "verse", "chorus"))) is second


def test_the_sections_check_compares_sung_sections_only() -> None:
    abc = plan("intro-", "verse", "chorus", "outro-")
    analysis = score_rules.analyze(abc)
    tags = [s.tag for s in analysis.sections]
    sung = [s.vocal_notes > 0 for s in analysis.sections]
    assert lyrics.compare_sections(lyric("Verse 1", "Chorus"), tags, sung) == []
    assert lyrics.compare_sections(lyric("Verse 1", "Chorus"), tags)  # all sections: the intro differs
    assert "sung sections" in lyrics.compare_sections(lyric("Chorus", "Verse"), tags, sung)[0].message


def test_a_pickup_into_the_verse_makes_no_sung_intro() -> None:
    # owner's report 2026-10-09: the plan's intro ends with the verse's first word; counted as a sung intro
    # it shifted every name of a renamed plan (and an assembled one left the intro out)
    abc = plan("intro-", "verse", "chorus").replace('"C"z16|', '"C"z12G4|', 1)
    assert form_of(abc)[0] == ("intro", False)
    form = song_form.match(lyric("Verse", "Chorus"), abc)
    assert form.category == song_form.MATCH and form.score == abc
    analysis = score_rules.analyze(abc)
    assert analysis.sections[0].vocal_notes == 1
    flags = song_form.sung_flags(abc, analysis.sections)
    assert flags == [False, True, True]  # the sections check of the lyrics agrees
    assert lyrics.compare_sections(lyric("Verse", "Chorus"), [s.tag for s in analysis.sections], flags) == []


def test_a_section_of_the_plan_may_sing_the_blocks_after_its_own() -> None:
    # owner's report 2026-10-09: the planner wrote the chorus and the outro as one chorus section; renamed
    # to the lyrics' three sections, every section had the next one's name
    long_chorus = '% chorus\nV: Vocal\n"C"c4B4A4G4|"C"c4B4A4G4|\nV: Ins\nC16|C16|\n'
    abc = plan("verse") + long_chorus
    text = lyric("Verse", "Chorus", "Outro")  # four syllables each: eight notes for the chorus and the outro
    form = song_form.match(text, abc)
    assert form.category == song_form.MATCH and form.score == abc and not form.changes
    assert form.notes == ("its chorus section sings [Chorus] and [Outro]",)
    assert "in its own (verse - chorus)" in form.text
    # a chorus section with notes for the chorus only does not sing the outro as well
    assert song_form.match(text, plan("verse", "chorus")).category == song_form.DIFFERS
