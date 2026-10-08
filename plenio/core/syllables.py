"""Syllables of sung words: a rule-based splitter for English and German, vowel groups for other languages.

The owner's decision D4 (2026-10-08): no hyphenation package; rules and a short list of common lyric
words. The count is an estimate - the lyrics fit (``lyrics_fit``) allows a syllable or two either way -
but it is far closer than plain vowel groups for English: a silent final *e*, *-ed* and *-es* endings,
*-ing* after a vowel, *y* between vowels, two vowels that are two syllables (*li-on*, *vi-o-lin*, but not
*na-tion*), suffixes after a silent *e* (*love-ly*, *home-less*) and compounds (*some-where*).
``split`` gives the pieces, ``count`` their number; the score editor's lyrics layout uses the same split.
"""

from __future__ import annotations

import re

VOWELS = "aeiouyäöüàáâèéêìíîòóôùúûæøå"
_GROUP = re.compile(f"[{VOWELS}]+", re.IGNORECASE)
_WORD = re.compile(r"[^\W\d_][\w'’]*", re.UNICODE)

ENGLISH_WORDS = {
    "eye": 1,
    "eyes": 1,
    "people": 2,
    "idea": 3,
    "ideas": 3,
    "area": 3,
    "create": 2,
    "creates": 2,
    "created": 3,
    "creating": 3,
    "creation": 3,
    "theater": 3,
    "theatre": 3,
    "poem": 2,
    "poems": 2,
    "poet": 2,
    "quiet": 2,
    "diet": 2,
    "science": 2,
    "client": 2,
    "lion": 2,
    "lions": 2,
    "violin": 3,
    "violent": 3,
    "piano": 3,
    "radio": 3,
    "video": 3,
    "chaos": 2,
    "evening": 2,
    "business": 2,
    "maybe": 2,
    "every": 3,
    "everything": 4,
    "everyone": 3,
    "everybody": 4,
    "forever": 3,
    "naive": 2,
    "hello": 2,
    "fire": 1,
    "fires": 1,
    "hour": 1,
    "hours": 1,
    "our": 1,
    "ours": 1,
    "flower": 2,
    "flowers": 2,
    "power": 2,
    "tower": 2,
    "shower": 2,
    "heaven": 2,
    "seven": 2,
    "being": 2,
    "ocean": 2,
    "oceans": 2,
    "europe": 2,
    "moment": 2,
    "moments": 2,
    "real": 1,
    "really": 2,
    "goodbye": 2,
    "alive": 2,
    "inside": 2,
    "outside": 2,
    "tonight": 2,
    "tomorrow": 3,
    "yesterday": 3,
    "someone": 2,
    "something": 2,
    "somewhere": 2,
    "sometimes": 2,
    "somehow": 2,
    "anyone": 3,
    "anything": 3,
    "anywhere": 3,
    "nowhere": 2,
    "lonely": 2,
    "lovely": 2,
    "homeless": 2,
    "careful": 2,
    "loneliness": 3,
    "statement": 2,
    "basement": 2,
    "aren't": 1,
    "weren't": 1,
}
"""Common lyric words the rules get wrong (or that are worth not guessing)."""
_SUFFIXES = ("ness", "less", "ment", "ful", "ly")
"""Suffixes after a silent e that keep it silent: love-ly, home-less, state-ment, care-ful."""
_TAILS = (
    *_SUFFIXES,
    *("walk", "way", "ways", "time", "times", "line", "lines", "light", "lights", "land", "day", "days"),
    *("side", "place", "town", "stone", "work", "ward", "bound", "made", "night", "house", "like", "wise"),
)
"""Second parts of compounds after a silent e: side-walk, base-line, home-town, life-time, fire-place."""
_SIBILANT = ("s", "x", "z", "ch", "sh", "c", "g")
"""Endings before -es that keep it a syllable: kiss-es, box-es, wish-es, plac-es, chang-es."""


def _sibilant(stem: str) -> bool:
    return stem.endswith(_SIBILANT)


_HIATUS = ("ia", "io", "iu", "eo", "ua", "uo", "ue")
"""Two vowels that are two syllables in English (li-on, vi-o-lin, cru-el) - unless an i after t, s, c, x
or g is silent (na-tion, vi-sion, so-cial, re-gion, gra-cious)."""
ONSETS = ("ch", "sh", "th", "ph", "wh", "sch")
"""Consonant pairs that start a syllable together when they stand alone between two vowels."""
SILENT_TAILS = ("s", "m", "re", "ll", "t", "ve", "d", "n", "all")
"""What follows the apostrophe of a contraction without a syllable of its own (I'm, you're, y'all)."""
GERMAN_PAIRS = ("ie", "ei", "ai", "au", "äu", "eu", "aa", "ee", "oo")


def _language(language: str) -> str:
    lowered = language.strip().lower()
    if lowered.startswith(("german", "deutsch")) or lowered in ("de", "de-de"):
        return "de"
    if lowered in ("", "en", "english", "en-us", "en-gb") or lowered.startswith("english"):
        return "en"
    return "other"


_COMMON = {
    "English": {
        "the",
        "and",
        "you",
        "i",
        "to",
        "my",
        "me",
        "is",
        "in",
        "of",
        "it",
        "your",
        "we",
        "on",
        "for",
    },
    "German": {
        "und",
        "ich",
        "die",
        "der",
        "das",
        "nicht",
        "du",
        "ist",
        "mein",
        "mir",
        "wir",
        "ein",
        "zu",
        "dich",
    },
}


def guess_language(text: str) -> str:
    """English or German from the most common short words of a lyrics text (``""``: neither is clear)."""
    words = [w.lower() for w in _WORD.findall(text)]
    scores = {name: sum(1 for w in words if w in common) for name, common in _COMMON.items()}
    best = max(scores, key=lambda name: scores[name])
    others = sum(score for name, score in scores.items() if name != best)
    return best if scores[best] >= 3 and scores[best] >= 2 * others else ""


def _english_groups(word: str) -> list[tuple[int, int]]:
    """Vowel groups of an English word as ``(start, end)``, after the rules of the module docstring."""
    lower = word.lower()
    spans = [(m.start(), m.end()) for m in _GROUP.finditer(lower)]
    if not spans:
        return []
    # a y at the start is a consonant: you, yes, young
    if spans[0][0] == 0 and lower[0] == "y" and spans[0][1] > 1:
        spans[0] = (1, spans[0][1])
    result: list[tuple[int, int]] = []
    for start, end in spans:
        cut = start
        pieces: list[tuple[int, int]] = []
        for i in range(start + 1, end):
            pair = lower[i - 1 : i + 1]
            after = lower[i + 1 :]
            # y between vowels starts a syllable (play-er, be-yond) - not in -yed, -yes, -ye (played, eyes)
            if lower[i] == "y" and i + 1 < end and lower[i + 1 :].lstrip(VOWELS) not in ("d", "s", ""):
                pieces.append((cut, i))
                cut = i
                continue
            if pair in _HIATUS:
                silent_i = pair[0] == "i" and i >= 2 and lower[i - 2] in "tscxg"
                silent_u = pair == "ue" and (after in ("", "s", "d") or lower[i - 2 : i - 1] in ("q", "g"))
                if not silent_i and not silent_u:
                    pieces.append((cut, i))
                    cut = i
        pieces.append((cut, end))
        result += pieces
    # -ing after a vowel: be-ing, go-ing, see-ing
    if lower.endswith("ing") and len(result) >= 1:
        start, end = result[-1]
        if end == len(lower) - 2 and end - start >= 2 and lower[end - 1] == "i":
            result[-1] = (start, end - 1)
            result.append((end - 1, end))
    if len(result) < 2:
        return result
    last_start, last_end = result[-1]
    last = lower[last_start:last_end]
    tail = lower[last_end:]
    before = lower[last_start - 1] if last_start else ""
    consonant_before = before.isalpha() and before not in VOWELS
    # a silent final e: make, stone, smile - but table, little (a consonant before -le) and see, die, bye
    if last == "e" and tail == "" and consonant_before:
        syllabic_le = lower.endswith("le") and len(lower) > 2 and lower[-3] not in VOWELS and lower[-3] != "l"
        if not syllabic_le:
            result.pop()
    # -ed after anything but t or d: loved, dreamed (wanted, needed keep it)
    elif last == "e" and tail == "d" and consonant_before and before not in "td":
        result.pop()
    # -es after anything but a sibilant: loves, times (places, changes, wishes keep it)
    elif last == "e" and tail == "s" and consonant_before and not _sibilant(lower[:-2]):
        result.pop()
    return result


def _groups(word: str, language: str) -> list[tuple[int, int]]:
    if language == "en":
        return _english_groups(word)
    lower = word.lower()
    spans = [(m.start(), m.end()) for m in _GROUP.finditer(lower)]
    if language != "de":
        return spans
    # German: diphthongs and long vowels are one syllable, other vowels in a row one each (Ra-di-o, neu-e)
    result: list[tuple[int, int]] = []
    for start, end in spans:
        i = start
        while i < end:
            step = 2 if i + 1 < end and lower[i : i + 2] in GERMAN_PAIRS else 1
            result.append((i, i + step))
            i += step
    return result


def _cuts(word: str, groups: list[tuple[int, int]]) -> list[str]:
    if len(groups) <= 1:
        return [word]
    cuts = []
    for (_, left_end), (right_start, _) in zip(groups, groups[1:], strict=False):
        consonants = right_start - left_end
        onset = word[left_end:right_start].lower() in ONSETS  # ma-chine, fa-ther, ele-phant
        cuts.append(left_end + (consonants // 2 if consonants > 1 and not onset else 0))
    pieces = [word[a:b] for a, b in zip([0, *cuts], [*cuts, len(word)], strict=True)]
    return [p for p in pieces if p]


def _listed(word: str, n: int) -> list[str]:
    """A listed word in ``n`` pieces: the rules' split when it has ``n``, else its vowel groups merged
    from the end down to ``n`` (the count is the list's either way)."""
    ruled = _cuts(word, _english_groups(word))
    if len(ruled) == n:
        return ruled
    groups = [(m.start(), m.end()) for m in _GROUP.finditer(word.lower())]
    while len(groups) > n:
        a, b = groups[-2], groups[-1]
        groups[-2:] = [(a[0], b[1])]
    pieces = _cuts(word, groups)
    return pieces if len(pieces) == n else ruled


_PUNCTUATION = ".,;:!?\"'()“”‘’"


def split(word: str, language: str = "") -> list[str]:
    """``word`` in syllables (the pieces join back to the word, its punctuation on the first and last)."""
    clean = word.strip(_PUNCTUATION)
    if not clean or not _GROUP.search(clean):
        return [word] if word else []
    lead = word[: len(word) - len(word.lstrip(_PUNCTUATION))]
    trail = word[len(word.rstrip(_PUNCTUATION)) :]
    pieces = _split(clean, _language(language))
    return (
        [lead + pieces[0], *pieces[1:-1], pieces[-1] + trail]
        if len(pieces) > 1
        else [lead + pieces[0] + trail]
    )


def _split(clean: str, lang: str) -> list[str]:
    lower = clean.lower().replace("’", "'")
    if lang == "en":
        if lower in ENGLISH_WORDS:
            return _listed(clean, ENGLISH_WORDS[lower])
        for suffix in _TAILS:
            stem = lower[: -len(suffix)]
            if lower.endswith(suffix) and stem.endswith("e") and len(stem) > 2 and stem[-2] not in VOWELS:
                return _split(clean[: len(stem)], lang) + [clean[len(stem) :]]
        mark = lower.find("'")
        if mark > 0:  # contractions: don't, I'm, you're add nothing after the apostrophe; ev'ry does
            head, tail = clean[:mark], clean[mark + 1 :]
            apostrophe = clean[mark]
            pieces = _split(head, lang) if _GROUP.search(head) else [head]
            if (
                tail.lower() == "t"
                and len(head) > 2
                and head.lower().endswith("n")
                and head[-2] not in VOWELS
            ):
                return [*pieces[:-1], pieces[-1][:-1], "n" + apostrophe + tail]  # would-n't, did-n't, is-n't
            if tail.lower() in SILENT_TAILS or not _GROUP.search(tail):
                return [*pieces[:-1], pieces[-1] + apostrophe + tail]
            return [*pieces, apostrophe + tail]
    return _cuts(clean, _groups(clean, lang))


def count_word(word: str, language: str = "") -> int:
    lang = _language(language)
    lower = word.strip(".,;:!?\"'()“”‘’").lower()
    if lang == "en" and lower in ENGLISH_WORDS:
        return ENGLISH_WORDS[lower]
    return max(1, len(split(word, language))) if _GROUP.search(word) else (1 if word.strip() else 0)


def count(line: str, language: str = "") -> int:
    """The syllables of a sung line (hyphenated words count their parts)."""
    total = 0
    for word in _WORD.findall(line.replace("-", " ")):
        total += count_word(word, language)
    return total
