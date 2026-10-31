"""Titles and cover prompts from the song (owner's request 2026-10-23): the writer proposes ten titles after the
lyrics and Plenio picks one at random, passing over titles songs have already; the cover prompt is read from the
lyrics first, then the title, then the tags, in an image model's order."""

from __future__ import annotations

from plenio.core.brief import build_cover_brief, build_song_brief
from plenio.core.engines import EngineInfo, yue2
from plenio.core.writing import TITLE_CANDIDATES, compose, parse_draft, pick_title, title_candidates

ENGINE = EngineInfo("yue2", yue2.RULES_VERSION, yue2.capabilities())
TITLES = "\n".join(
    f"{k}. {t}"
    for k, t in enumerate(
        [
            "Salt on the Windowsill",
            '"Harbour Lights"',
            "Neon Rain",
            "**The Ferry at Six**",
            "What the Tide Keeps",
            "Neon Rain",  # twice: once is enough
            "Paper Boats",
            "Gull Weather",
            "Low Water",
            "Anchor Song",
        ],
        start=1,
    )
)
ANSWER = f"""STYLE: English, dreamy indie pop, airy female voice, jangly guitars, 104 BPM
LYRICS:
[Verse]
Salt on the windowsill, the ferry at six
[Chorus]
Harbour lights, carry me home
TITLES:
{TITLES}
ARTWORK: A small red ferry crossing a grey harbour at dawn, seen from a high window with salt crystals on the
sill in the foreground; soft fog, pale gold light; muted teal, rust and cream; a cinematic photograph on 35mm film,
fine grain, quiet and longing.
"""


def test_the_song_prompt_asks_for_ten_titles_after_the_lyrics_and_a_cover_from_the_song() -> None:
    prompt, request = compose(build_song_brief({"genre": "indie pop", "theme": "a harbour town"}), ENGINE)
    assert not request.fixed_title
    assert (
        f"think of {TITLE_CANDIDATES} truly different titles" in prompt and "the lyrics you write" in prompt
    )
    assert "Plenio picks one of them at random" in prompt and "neon" in prompt  # worn-out words named
    layout = prompt[prompt.index("Write your answer") :]
    assert layout.index("LYRICS:") < layout.index("TITLES:") < layout.index("ARTWORK:")
    assert "10. <title>" in layout and "TITLE: <the title>" not in layout
    # the cover: (a) the lyrics, (b) the title, (c) the tags - then subject, setting, composition, light ...
    artwork = next(line for line in prompt.splitlines() if line.startswith("- Artwork:"))
    assert artwork.index("(a) your lyrics") < artwork.index("(b) the title") < artwork.index("(c) the genre")
    assert "ONE strong visual idea" in artwork and "50 to 90 words" in artwork
    assert artwork.index("main subject") < artwork.index("composition") < artwork.index("the light")
    assert "No text, letters" in artwork


def test_one_title_is_picked_at_random_and_not_one_a_song_has() -> None:
    candidates = title_candidates(TITLES)
    assert candidates[:4] == ["Salt on the Windowsill", "Harbour Lights", "Neon Rain", "The Ferry at Six"]
    assert len(candidates) == 9  # the second Neon Rain is left out
    _prompt, request = compose(build_song_brief({"genre": "indie pop"}), ENGINE)
    draft = parse_draft(ANSWER, request)
    assert draft.title in candidates
    assert any("picked at random from 9" in note for note in draft.enforcements)
    assert parse_draft(ANSWER, request).title == draft.title  # the same answer, the same title
    # titles songs have already are passed over while others are left
    taken = [t for t in candidates if t != "Gull Weather"]
    assert parse_draft(ANSWER, request, taken=[t.upper() for t in taken]).title == "Gull Weather"
    title, why = pick_title(["Low Water"], ["low water"], seed_text="x")
    assert title == "Low Water" and "left out" not in why  # all taken: one of them all the same
    picks = {pick_title(candidates, seed_text=f"answer {k}")[0] for k in range(40)}
    assert len(picks) >= 6  # different answers, different picks
    assert "Anchor Song" not in {pick_title(candidates, seed_text=f"answer {k}")[0] for k in range(60)}
    assert draft.artwork_prompt.startswith("A small red ferry") and "35mm film" in draft.artwork_prompt


def test_a_title_names_what_the_song_is_about_not_how_it_sounds() -> None:
    """Owner's request 2026-10-31: titles had drifted towards the style ("Smooth Jazz Late Night")."""
    prompt, request = compose(build_song_brief({"genre": "smooth jazz", "mood": "late-night, warm"}), ENGINE)
    rule = next(line for line in prompt.splitlines() if line.startswith("- Titles:"))
    assert "never how it sounds" in rule and "(c) the genre" not in rule
    assert {"smooth", "jazz", "late-night", "warm"} <= set(request.sound_words)
    candidates = ["Smooth Jazz Late Night", "Velvet Groove", "The Last Tram Home", "Your Coat on My Chair"]
    for k in range(30):
        title, why = pick_title(candidates, seed_text=f"a{k}", sound=request.sound_words)
        assert title in ("The Last Tram Home", "Your Coat on My Chair") and "name the sound" in why
    # a song about a piano may be called so; and when every title names the sound, one of them all the same
    assert (
        pick_title(["Old Piano"], seed_text="x", sound=(), lyrics="the old piano in the hall")[0]
        == "Old Piano"
    )
    assert pick_title(["Jazz Night"], seed_text="x", sound=("jazz",))[0] == "Jazz Night"


def test_a_fixed_title_stays_and_an_answer_with_one_title_still_works() -> None:
    _prompt, request = compose(build_song_brief({"genre": "pop"}), ENGINE, fixed_title="Harbour")
    assert parse_draft(ANSWER, request).title == "Harbour"
    _prompt, free = compose(build_song_brief({"genre": "pop"}), ENGINE)
    old = "TITLE: Paper Boats\nSTYLE: pop, 100 BPM\nLYRICS:\n[Verse]\nfolded in the rain\nARTWORK: Boats."
    assert parse_draft(old, free).title == "Paper Boats"


def test_a_cover_with_the_original_lyrics_reads_them_for_its_picture() -> None:
    brief = build_cover_brief({"genre": "jazz", "vocals": "original lyrics", "language": "English"})
    lyrics = "[Verse]\nThe lighthouse keeper sings to the sea\n\n[Chorus]\nCome back, my ship of glass"
    prompt, request = compose(brief, ENGINE, score_sections=["[Verse]", "[Chorus]"], reference_lyrics=lyrics)
    assert request.lyrics_mode == "none"
    assert (
        "The source's lyrics, for the artwork" in prompt
        and "  The lighthouse keeper sings to the sea" in prompt
    )
    artwork = next(line for line in prompt.splitlines() if line.startswith("- Artwork:"))
    assert "(a) the source's lyrics above" in artwork
