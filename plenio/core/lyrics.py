"""Sectioned lyrics: ``[Tag]`` on its own line, sung lines beneath, a blank line between sections.

Model independent. Engines add their own rules (tag vocabulary, limits) on top.
"""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from . import syllables
from .diagnostics import Finding, error, info, warning

TAG_MAX_CHARS = 160
"""The longest section tag: one's own may name and describe a section (``[Verse - Female Choir, Call and Response
delivery]``); a tag stays as it is written, however long (before 1.5.1 a tag of more than 40 characters was taken
for a sung line)."""
_TAG = re.compile(rf"^\[([^\[\]\n]{{1,{TAG_MAX_CHARS}}})\]$")
SECTION_NAMES = (
    "pre-chorus",
    "post-chorus",
    "intro",
    "verse",
    "chorus",
    "bridge",
    "interlude",
    "instrumental",
    "inst",
    "outro",
    "hook",
    "refrain",
    "solo",
    "breakdown",
    "break",
    "drop",
    "build",
)
"""The sections a tag may name before a description (the music models' sections and the ones Plenio fits to them)."""
_SECTION_HEAD = re.compile(
    r"^(pre[- ]?chorus|post[- ]?chorus|intro|verse|chorus|bridge|interlude|instrumental|inst|outro|hook|refrain|solo|"
    r"breakdown|break|drop|build)(?:\s*\d+)?(?:\s*[-\u2013\u2014:(,/|]|$)",
    re.IGNORECASE,
)
_REPEAT = re.compile(r"(?i)(\(\s*x\s*\d+\s*\)|\bx\s*\d+\s*$|\brepeat\b|\(\s*\d+\s*x\s*\))")
_DIRECTION = re.compile(r"^\s*[\(\[\{<].*[\)\]\}>]\s*$")
# What the band plays, said in a line of the lyrics without brackets (owner's report 2026-10-30: a writer filled a
# metal song's bridge with lines like "Violin tremolo over a pounding snare" or "Hold it long, no words, just
# sound" - and the music model sang them): an instrument with a way of playing it, two ways of playing, or words
# that say there are none. Words common in lyrics too (fill, scale, drop, fade) are not counted.
_INSTRUMENTS = frozenset(
    "guitar guitars sitar drum drums bass synth synths piano organ violin violins strings cello brass horns sax "
    "saxophone flute percussion cymbal cymbals snare hi-hat keyboard keyboards gitarre gitarren schlagzeug klavier "
    "orgel geige streicher".split()
)
_PLAYING = frozenset(
    "solo solos shred shredding glissando riff riffs breakdown crescendo decrescendo sustain sustained pentatonic "
    "arpeggio arpeggios tempo bpm staccato legato tremolo palm-muted distortion distorted reverb interlude octave "
    "octaves tapping whammy blast-beat blastbeat double-kick build-up buildup strumming fingerpicked harmonized "
    "gitarrensolo schlagzeugsolo".split()
)
_NO_WORDS = ("no words", "no vocals", "no lyrics", "without words", "just sound", "ohne worte", "ohne gesang")
_PERSON = frozenset(
    "i me my we our us you your ich mir mich mein meine wir uns du dir dich dein deine".split()
)
_TOKEN = re.compile(r"[^\W\d_]+(?:-[^\W\d_]+)*")
_WORD = re.compile(r"[^\W\d_][\w'’-]*", re.UNICODE)
_VOWELS = re.compile(r"[aeiouyäöüàáâèéêìíîòóôùúûæøå]+", re.IGNORECASE)


@dataclass(frozen=True)
class LyricsSection:
    tag: str
    lines: tuple[str, ...]

    @property
    def words(self) -> int:
        return sum(len(_WORD.findall(line)) for line in self.lines)


@dataclass(frozen=True)
class Lyrics:
    preamble: tuple[str, ...]
    sections: tuple[LyricsSection, ...]

    @property
    def tags(self) -> list[str]:
        return [section.tag for section in self.sections]

    @property
    def words(self) -> int:
        return sum(section.words for section in self.sections) + sum(
            len(_WORD.findall(line)) for line in self.preamble
        )

    @property
    def is_tags_only(self) -> bool:
        return not self.preamble and all(not section.lines for section in self.sections)

    def format(self) -> str:
        blocks = []
        if self.preamble:
            blocks.append("\n".join(self.preamble))
        for section in self.sections:
            blocks.append("\n".join([f"[{section.tag}]", *section.lines]))
        return "\n\n".join(blocks)


def parse_lyrics(text: str) -> Lyrics:
    preamble: list[str] = []
    sections: list[LyricsSection] = []
    current: tuple[str, list[str]] | None = None
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw.strip()
        match = _TAG.match(line)
        if match:
            if current is not None:
                sections.append(LyricsSection(current[0], tuple(current[1])))
            current = (match.group(1).strip(), [])
            continue
        if not line:
            continue
        if current is None:
            preamble.append(line)
        else:
            current[1].append(line)
    if current is not None:
        sections.append(LyricsSection(current[0], tuple(current[1])))
    return Lyrics(tuple(preamble), tuple(sections))


def playing_direction(line: str) -> bool:
    """Whether ``line`` tells the band what to play rather than being words to sing - never one that speaks of a
    person ("I play my guitar solo")."""
    text = line.casefold()
    words = _TOKEN.findall(text)
    if any(word in _PERSON for word in words):
        return False
    playing = {word for word in words if word in _PLAYING}
    instrument = any(word in _INSTRUMENTS for word in words)
    if any(phrase in text for phrase in _NO_WORDS):
        return bool(playing) or instrument
    return len(playing) >= 2 or (bool(playing) and instrument)


def without_playing_directions(lines: Sequence[str]) -> tuple[list[str], list[str]]:
    """The lyrics' lines (section tags among them) without the sections the writer filled with what the band plays:
    one made mostly of such lines - two at least, half of its lines - is played, not sung; all its lines go, its tag
    stays (an instrumental part). A single such line among sung ones stays: in the owner's library most of those
    were meant to be sung (a line like "Synth arpeggios rise into the night"). The lines kept, and those taken
    out."""
    kept: list[str] = []
    removed: list[str] = []
    section: list[str] = []

    def close() -> None:
        found = [line for line in section if line.strip() and playing_direction(line)]
        sung = [line for line in section if line.strip()]
        if len(found) >= 2 and 2 * len(found) >= len(sung):
            removed.extend(sung)
            kept.extend(line for line in section if not line.strip())
        else:
            kept.extend(section)
        section.clear()

    for line in lines:
        if _TAG.match(line.strip()):
            close()
            kept.append(line)
        else:
            section.append(line)
    close()
    return kept, removed


def section_head(tag: str) -> str | None:
    """The section a tag names when it is one of ``SECTION_NAMES``, alone or with a number or a description:
    ``[Verse 2 - Female Choir, Call and Response delivery]``, ``[Chorus: Male Solo]``, ``[Bridge (spoken)]`` ->
    ``verse``, ``chorus``, ``bridge``; ``[Pre Chorus]`` -> ``pre-chorus``. ``None``: a tag of one's own."""
    match = _SECTION_HEAD.match(tag.strip().strip("[]").strip())
    if match is None:
        return None
    head = re.sub(r"[\s-]+", "-", match.group(1).lower())
    return {"prechorus": "pre-chorus", "postchorus": "post-chorus"}.get(head, head)


def section_kind(tag: str) -> str:
    """A tag or a score's section name as sections are compared: the section it names (``section_head``), else the
    name without brackets and a trailing number, in lower case. The tag itself is never changed."""
    return section_head(tag) or re.sub(r"\s*\d+$", "", tag.strip().strip("[]").strip()).lower()


def tags_only(tags: Sequence[str]) -> str:
    """Lyrics consisting only of section tags (instrumental conditioning)."""
    return "\n\n".join(f"[{tag}]" for tag in tags)


SPARSE_TAG = "Hook"
"""The section of a song with sparse vocals that carries its few words; every other section stays empty."""
SPARSE_LINES_PER_HOOK = 2


def sparse_hooks(target_seconds: float) -> int:
    """How many [Hook] sections a song with sparse vocals has: about one a minute, two to four."""
    return max(2, min(4, round(target_seconds / 60)))


def sparse_line_limit(target_seconds: float) -> int:
    """The most sung lines a song with sparse vocals has: two per hook (a sung song of 3:00 has 22 to 36)."""
    return SPARSE_LINES_PER_HOOK * sparse_hooks(target_seconds)


def sparse_form(sections: int, hooks: int) -> list[str]:
    """A section map for sparse vocals of about ``sections`` sections: [Intro], empty [Instrumental] sections with
    ``hooks`` [Hook] sections spread evenly among them, a [Break] before the last hook when there is room,
    [Outro]."""
    body = max(sections - 2, 2 * hooks)
    tags = ["Instrumental"] * body
    places = [((2 * k + 1) * body) // (2 * hooks) for k in range(hooks)]
    for place in places:
        tags[place] = SPARSE_TAG
    before_last = places[-1] - 1
    if body >= 6 and tags[before_last] == "Instrumental" and before_last > places[-2]:
        tags[before_last] = "Break"
    return ["Intro", *tags, "Outro"]


def sparse_rule(tags: Sequence[str], limit: int, *, fixed: bool = False) -> str:
    """The writer's lyrics rule for sparse vocals: the map ``tags``, words only in its hooks, at most ``limit``
    lines. ``fixed``: ``tags`` are a score's sections - the words go into a few of them."""
    order = " ".join(f"[{tag}]" for tag in tags)
    where = (
        "Words go only into one to three of these sections where a short sung phrase fits best (a chorus or a hook "
        "first)"
        if fixed
        else f"Words go only into the [{SPARSE_TAG}] sections"
    )
    return (
        "Lyrics: sparse vocals - the song is mostly instrumental and the voice appears only now and then. Use "
        f"exactly these sections, in this order, each tag on its own line and a blank line between sections: {order}"
        + (" (they follow the score and must not change). " if fixed else ". ")
        + f"{where}: one or two short lines each (2 to 6 words a line), at most {limit} sung lines in the whole "
        "song; every other section stays empty. The few words carry the song: a hook phrase, a call, a short chant "
        "or wordless vocal sounds (for example 'ooh', 'ah', 'hey') that fit the theme, sit on the melody and come "
        "back rather than tell a story. Only words to be sung: no stage directions, no parentheses, no repeat marks."
    )


def check_sparse(text: str, limit: int) -> list[Finding]:
    """Sparse vocals: a warning when the lyrics have far more lines than ``limit`` (``sparse_line_limit``)."""
    lines = sum(len(section.lines) for section in parse_lyrics(text).sections)
    if lines <= 2 * limit:
        return []
    return [
        warning(
            f"Sparse vocals: the lyrics have {lines} sung lines; at most about {limit} keep the song mostly "
            "instrumental. Delete lines, or leave more sections empty.",
            "lyrics",
        )
    ]


def estimate_syllables(line: str, language: str = "") -> int:
    """A syllable estimate of a sung line (``syllables.count``: rules for English and German); a hint, not a
    measurement."""
    return syllables.count(line, language)


def check_lyrics(text: str, *, instrumental: bool, vocabulary: Sequence[str] = ()) -> list[Finding]:
    """Model-independent lyrics rules; ``vocabulary`` is the engine's list of known tags."""
    lyrics = parse_lyrics(text)
    findings: list[Finding] = []
    if not text.strip():
        if instrumental:
            findings.append(
                warning("The lyrics are empty; use section tags such as [Intro] and [Verse].", "lyrics")
            )
        else:
            findings.append(error("The lyrics are empty.", "lyrics"))
        return findings
    if not lyrics.sections:
        findings.append(
            error("The lyrics have no section tags; start each section with a line like [Verse].", "lyrics")
        )
    if lyrics.preamble:
        findings.append(
            warning(f"{len(lyrics.preamble)} line(s) appear before the first section tag.", "lyrics")
        )
    if instrumental and lyrics.words:
        findings.append(
            error(
                f"Instrumental lyrics must contain only section tags, but {lyrics.words} word(s) were found.",
                "lyrics",
            )
        )
    known = {tag.lower() for tag in vocabulary}
    for section in lyrics.sections:
        plain = re.sub(r"\s*\d+$", "", section.tag).lower()
        base = section_kind(section.tag)
        if known and base in known and plain != base:
            findings.append(
                info(
                    f"[{section.tag}] is sung as a {base}: the model reads the rest of the tag as a hint only.",
                    "lyrics",
                )
            )
        elif known and base not in known:
            findings.append(
                info(
                    f"[{section.tag}] is a section tag of your own: the model reads its name as a hint only - with "
                    "words it is sung like a verse or a chorus, without words it is an instrumental part.",
                    "lyrics",
                )
            )
        played = set(without_playing_directions(section.lines)[1])
        for line in section.lines:
            if _REPEAT.search(line):
                findings.append(warning(f"Repeat shorthand in {line!r}; write repeated lines out.", "lyrics"))
            elif _DIRECTION.match(line) or line in played:
                findings.append(warning(f"Stage direction {line!r} would be sung; remove it.", "lyrics"))
    if not instrumental and lyrics.sections and all(not s.lines for s in lyrics.sections):
        findings.append(error("The song is sung but no section contains words.", "lyrics"))
    return findings


SYLLABLE_FIT_LOW = 0.85
SYLLABLE_FIT_HIGH = 1.3
"""Syllables per melody note of a section outside which YuE2 did not sing the words clearly.
Phase 4B calibration on the M2 cover: the original lyrics (WER 0) and the 4A new lyrics the owner
judged "good, fitting" had 0.87-0.98; the writer's lyrics sung at WER 1.14 had 0.67-0.80."""


def syllable_fit(lyrics_text: str, phrasing: Sequence[Mapping[str, Any]]) -> list[Finding]:
    """Warn when a section's lyrics have far fewer or more syllables than its melody has notes.

    ``phrasing`` is ``score.phrasing(abc)`` of the final score. The syllables are an estimate, so
    this is a warning, not an error. The score's sections take the lyrics' blocks in order, by tag:
    the second verse of the score is compared with the second [Verse] block (owner's report 2026-10-08:
    every verse was compared with the last [Verse] block - 72 syllables for the first verse's 34 notes).
    """
    blocks = parse_lyrics(lyrics_text).sections
    language = syllables.guess_language(lyrics_text)
    findings: list[Finding] = []
    cursor = 0
    for part in phrasing:
        notes = sum(int(n) for n in part.get("phrases", []))
        key = str(part["tag"]).strip("[]").lower()
        found = next((i for i in range(cursor, len(blocks)) if blocks[i].tag.lower() == key), None)
        if found is None:
            continue
        cursor = found + 1
        section = blocks[found]
        if not notes or not section.lines:
            continue
        count = sum(estimate_syllables(line, language) for line in section.lines)
        ratio = count / notes
        if SYLLABLE_FIT_LOW <= ratio <= SYLLABLE_FIT_HIGH:
            continue
        direction = "too few" if ratio < SYLLABLE_FIT_LOW else "too many"
        findings.append(
            warning(
                f"{part['tag']} has about {count} syllables for {notes} melody notes ({direction}); YuE2 may "
                f"not sing the words clearly. Write about one syllable per note (lines of about "
                f"{', '.join(str(n) for n in part['phrases'])} syllables).",
                "lyrics",
                tag=part["tag"],
                syllables=count,
                notes=notes,
                ratio=round(ratio, 2),
            )
        )
    return findings


def compare_sections(
    lyrics_text: str, score_tags: Sequence[str], sung: Sequence[bool] | None = None
) -> list[Finding]:
    """Warn when the lyrics' section order differs from the score's sections. With ``sung`` (per score
    section: has it Vocal notes?) only the sung sections are compared - where the words land; an
    instrumental intro the lyrics do not name is no mismatch."""
    parsed = parse_lyrics(lyrics_text)
    if sung is not None and len(sung) == len(score_tags):
        words = [re.sub(r"\s*\d+$", "", s.tag).lower() for s in parsed.sections if s.lines]
        melody = [t.strip("[]").lower() for t, has in zip(score_tags, sung, strict=True) if has]
        if not words or not melody or words == melody:
            return []
        return [
            warning(
                f"The lyrics sing in the sections {words} but the score's sung sections are {melody}; words may "
                "land on melodies planned for other words. Plan again (another plan seed), or arrange the sections "
                "in the score editor.",
                "lyrics",
            )
        ]
    tags = [re.sub(r"\s*\d+$", "", t).lower() for t in parsed.tags]
    expected = [t.strip("[]").lower() for t in score_tags]
    if not tags or not expected or tags == expected or tags == ["instrumental"]:
        return []  # the bare [instrumental] tag lets the plan choose its own form
    return [
        warning(
            f"The lyrics have sections {tags} but the score has {expected}; align them so words land in the intended sections.",
            "lyrics",
        )
    ]
