"""Syllables of sung words (owner's decision D4, 2026-10-08: own rules, no hyphenation package)."""

from __future__ import annotations

import pytest

from plenio.core import lyrics, syllables


@pytest.mark.parametrize(
    ("word", "count"),
    [
        # silent e, -ed, -es
        ("make", 1),
        ("stone", 1),
        ("loved", 1),
        ("dreamed", 1),
        ("wanted", 2),
        ("needed", 2),
        ("times", 1),
        ("places", 2),
        ("wishes", 2),
        # a consonant before -le is a syllable
        ("table", 2),
        ("little", 2),
        # y between vowels, at the start
        ("player", 2),
        ("beyond", 2),
        ("young", 1),
        ("played", 1),
        # two vowels that are two syllables - or not
        ("lion", 2),
        ("violin", 3),
        ("cruel", 2),
        ("nation", 2),
        ("vision", 2),
        ("blue", 1),
        # -ing after a vowel
        ("being", 2),
        ("going", 2),
        ("seeing", 2),
        # suffixes and compounds after a silent e
        ("lovely", 2),
        ("homeless", 2),
        ("statement", 2),
        ("sidewalk", 2),
        ("lifetime", 2),
        ("candlelight", 3),
        # the word list
        ("fire", 1),
        ("every", 3),
        ("people", 2),
        ("tonight", 2),
        ("idea", 3),
        # contractions
        ("don't", 1),
        ("I'm", 1),
        ("you're", 1),
        ("wouldn't", 2),
        ("didn't", 2),
        ("aren't", 1),
        ("ev'ry", 2),
        ("'cause", 1),
    ],
)
def test_english_words(word: str, count: int) -> None:
    assert syllables.count_word(word, "English") == count
    assert "".join(syllables.split(word, "English")) == word


@pytest.mark.parametrize(
    ("word", "parts"),
    [
        ("Liebe", ["Lie", "be"]),
        ("Radio", ["Ra", "di", "o"]),
        ("Freude", ["Freu", "de"]),
        ("waschen", ["wa", "schen"]),
        ("Haus", ["Haus"]),
        # every e is sung (owner's report 2026-10-08: "beide" was one syllable by the English rules)
        ("beide", ["bei", "de"]),
        ("gehen", ["ge", "hen"]),
        # one consonant, or the longest start a German syllable can have, goes to the next syllable
        ("verschossen", ["ver", "schos", "sen"]),
        ("Zucker", ["Zu", "cker"]),
        ("Mädchen", ["Mäd", "chen"]),
        ("Fenster", ["Fens", "ter"]),
        ("Apfel", ["Ap", "fel"]),
        ("Kopfhörer", ["Kopf", "hö", "rer"]),
        ("Wannsee", ["Wann", "see"]),
        ("Sommersprossen", ["Som", "mer", "spros", "sen"]),
        ("Badestrande", ["Ba", "de", "stran", "de"]),
        ("hochgeschlossen", ["hoch", "ge", "schlos", "sen"]),
    ],
)
def test_german_words(word: str, parts: list[str]) -> None:
    assert syllables.split(word, "German") == parts


def test_pieces_keep_punctuation_and_digraphs() -> None:
    assert syllables.split("fire,") == ["fire,"]
    assert syllables.split('"Hello!') == ['"Hel', "lo!"]
    assert syllables.split("machine") == ["ma", "chine"]
    assert syllables.split("father") == ["fa", "ther"]
    assert syllables.split("wouldn’t") == ["would", "n’t"]


def test_a_line_counts_its_words_and_hyphens() -> None:
    assert syllables.count("Blue light pooling on the sidewalk, your shadow stretched out long") == 14
    assert syllables.count("to-night ev-er-y-thing") == 2 + 4
    assert lyrics.estimate_syllables("I am going home tonight") == 7
    assert syllables.count("Ich liebe dich", "Deutsch") == 4


def test_the_language_is_guessed_from_common_words() -> None:
    assert syllables.guess_language("I walk the line and you are mine, in the night") == "English"
    assert syllables.guess_language("Ich bin die Nacht und du bist nicht mein Licht") == "German"
    assert syllables.guess_language("la la la") == ""
