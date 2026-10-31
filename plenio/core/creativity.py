"""Creativity: one slider from steady (0) to adventurous (200) (owner's requests 2026-10-19 and 2026-10-31).

0-100 is exactly the slider of 1.0.2-1.4: 50 is the reference (the writer's prompt without creativity rules,
YuE2's native sampling), 100 experimental. Since 1.5.0 the slider goes on to 200 and its default is 100 - 1.4's
experimental setting gave the best songs; 101-200 goes further, moderately. A value saved or recorded before means
what it meant.

The slider acts on three places, each kept within what is known to work:

- **The writer's rules** (``writer_lines``): for the lyrics and the style, by level. 40-60 adds nothing - the
  prompt of before the slider.
- **The writer's and the arrangement's temperature** (``sampling``, stages ``writer`` and ``arrangement``): only
  the first drafts; the repairs and re-asks keep their own (they fix a form and must stay reliable). The drafts are
  checked and enforced as before.
- **YuE2's sampling** (stages ``plan`` and ``take``): the plan's (ABC) and the take's (music tokens)
  temperature, top-p and top-k. 50 gives exactly the native nodes' defaults. No study measured where quality drops
  (2026-10-31: no official guidance; community reports only), so 200 stays at the edge of the ranges reported as
  risky - ABC temperature above 1.0, music temperature above 1.15 - and widens top-p and top-k a little. The
  repetition penalty stays: music needs its repetitions, and a penalty below 1 invites endless loops.

Design notes: docs/design/creativity.md.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .engines.minimax import ENGINE_ID as MINIMAX
from .errors import PlenioUserError

CREATIVITY_MAX = 200
"""The slider's top since 1.5.0 (100 before)."""
CREATIVITY_DEFAULT = 100
"""The default since 1.5.0: 1.4's experimental setting, whose songs sounded best to the owner."""
REFERENCE = 50
"""The reference: the writer's prompt without creativity rules and YuE2's native sampling (1.4's default)."""

STEADY, RESTRAINED, BALANCED, VARIED, EXPERIMENTAL, ADVENTUROUS = (
    "steady",
    "restrained",
    "balanced",
    "varied",
    "experimental",
    "adventurous",
)
LEVELS: tuple[tuple[int, str], ...] = (
    (19, STEADY),
    (39, RESTRAINED),
    (60, BALANCED),
    (80, VARIED),
    (150, EXPERIMENTAL),
    (200, ADVENTUROUS),
)
"""The writer's levels by their highest value (up to 100 those of 1.4)."""

STAGES = ("writer", "arrangement", "plan", "take")


def creativity_value(value: Any, default: int = CREATIVITY_DEFAULT) -> int:
    """The slider's value: a whole number from 0 to 200 (an empty value takes ``default``)."""
    if value is None or str(value).strip() == "":
        return default
    try:
        number = round(float(value))
    except (TypeError, ValueError):
        raise PlenioUserError(
            f"Creativity {value!r} is not a number.", hint=f"Use 0 to {CREATIVITY_MAX}."
        ) from None
    return max(0, min(CREATIVITY_MAX, number))


def creativity_level(creativity: int) -> str:
    """``steady``, ``restrained``, ``balanced``, ``varied``, ``experimental`` or ``adventurous``."""
    value = creativity_value(creativity)
    return next(name for highest, name in LEVELS if value <= highest)


def describe(creativity: int) -> str:
    """For summaries: ``100 (experimental, the default)``, ``50 (balanced, the reference)``, ``170 (adventurous)``."""
    value = creativity_value(creativity)
    level = creativity_level(value)
    note = ", the default" if value == CREATIVITY_DEFAULT else ", the reference" if value == REFERENCE else ""
    return f"{value} ({level}{note})"


# --- the sampling -----------------------------------------------------------------------------------------


@dataclass(frozen=True)
class Sampling:
    temperature: float
    top_p: float
    top_k: int


SAMPLING: dict[str, dict[int, Sampling]] = {
    # the writer's first draft (title, style, lyrics); top-p and top-k as the templates set them
    "writer": {
        0: Sampling(0.60, 0.95, 64),
        50: Sampling(0.80, 0.95, 64),  # the templates' value
        100: Sampling(1.00, 0.95, 64),  # Gemma's own recommended temperature
        200: Sampling(1.10, 0.95, 64),
    },
    # a creative mode's arrangement plan
    "arrangement": {
        0: Sampling(0.55, 0.95, 64),
        50: Sampling(0.70, 0.95, 64),  # the templates' value
        100: Sampling(0.90, 0.95, 64),
        200: Sampling(1.00, 0.95, 64),
    },
    # the plan (YuE2 Generate ABC): which notes, chords and rhythms the score gets
    "plan": {
        0: Sampling(0.55, 0.85, 20),
        50: Sampling(0.70, 0.90, 30),  # the native node's defaults
        100: Sampling(0.92, 0.95, 50),
        200: Sampling(1.00, 0.96, 64),  # an ABC temperature above 1.0 is reported as risky
    },
    # the take (YuE2 Generate Music): how the score is performed - voice, instruments, sound
    "take": {
        0: Sampling(0.90, 0.92, 60),
        50: Sampling(1.00, 0.95, 100),  # the native node's defaults
        100: Sampling(1.10, 0.97, 150),
        200: Sampling(1.15, 0.98, 200),  # a music temperature above 1.15 is reported as risky
    },
}
"""Anchors at 0, 50, 100 and 200; between them the values move in a straight line (up to 100 as in 1.4)."""


def sampling(creativity: int, stage: str) -> Sampling:
    """The sampling for ``stage`` at ``creativity``; 50 gives the templates' values of before the slider (YuE2: the
    native defaults), 100 the experimental values of 1.4."""
    if stage not in SAMPLING:
        raise PlenioUserError(f"Unknown stage {stage!r}.", hint=f"Use one of {list(STAGES)}.")
    value = creativity_value(creativity)
    anchors = SAMPLING[stage]
    points = sorted(anchors)
    low = max(p for p in points[:-1] if p <= value)
    high = points[points.index(low) + 1]
    share = (value - low) / (high - low)
    a, b = anchors[low], anchors[high]

    def between(x: float, y: float) -> float:
        return x + (y - x) * share

    return Sampling(
        round(between(a.temperature, b.temperature), 3),
        round(between(a.top_p, b.top_p), 3),
        round(between(a.top_k, b.top_k)),
    )


# --- the writer ----------------------------------------------------------------------------------------------

_HEADS = {
    STEADY: "keep the song simple, steady and predictable - the most typical choices of its genre.",
    RESTRAINED: "stay close to the conventions of the genre - familiar choices and a clear, repeated hook.",
    VARIED: "give the song more contrast and character than usual, while it stays clearly in its genre.",
    EXPERIMENTAL: "make bold, surprising choices that still hang together - the song may borrow from a "
    "neighbouring genre and use an unusual instrument, sound or rhythm feel.",
    ADVENTUROUS: "go further than usual: a fresh blend of the song's genre with a clear touch of another, an "
    "unusual instrument or sound as its signature, a rhythm feel or turn listeners do not expect - while it stays "
    "one coherent, singable song.",
}

_DESCRIPTOR_STYLE = {
    STEADY: "Style: plain, typical descriptors - the genre's usual instruments, one steady groove, a clean and "
    "simple production.",
    RESTRAINED: "Style: the genre's usual instruments and one consistent sound.",
    VARIED: "Style: make the line more specific rather than longer (still about 40 words): name particular "
    "instruments and how they are played (for example 'fingerpicked nylon guitar', 'muted trumpet', 'pulsing "
    "analog bass'), a distinct production colour, and one or two descriptors of movement and contrast such as "
    "'dynamic build-ups', 'sparse-to-full contrast', 'instrumental fills between phrases'{sung}. Prefer exact "
    "words to stock ones like 'catchy' or 'uplifting'.",
}
_DESCRIPTOR_STYLE[EXPERIMENTAL] = (
    _DESCRIPTOR_STYLE[VARIED] + " Add one unexpected but fitting colour: an unusual instrument, a touch of a "
    "neighbouring genre or an uncommon rhythm feel."
)
_DESCRIPTOR_STYLE[ADVENTUROUS] = (
    _DESCRIPTOR_STYLE[VARIED]
    + " Add two unexpected but fitting colours: an unusual instrument or sound, a touch "
    "of a neighbouring genre, or an uncommon rhythm feel."
)

_CAPTION_STYLE = {
    STEADY: "Caption: one steady groove and the same instrumentation all the way through; the Arrangement part "
    "describes little change from section to section.",
    RESTRAINED: "Caption: a conventional arrangement for the genre, with gentle changes between the sections.",
    VARIED: "Caption: let the Arrangement part tell a clear arc of contrasts - an intimate start, a build, a full "
    "and wide high point, and a quieter contrast where the sections give room for one (a bridge, or a breakdown "
    "before the last chorus) - with instruments answering the {lead} and particular instruments and playing "
    "styles named.",
}
_CAPTION_STYLE[EXPERIMENTAL] = (
    _CAPTION_STYLE[VARIED] + " Allow one surprising turn: a key lift for the last chorus, a change of rhythm "
    "feel or an unusual instrument solo."
)
_CAPTION_STYLE[ADVENTUROUS] = (
    _CAPTION_STYLE[VARIED]
    + " Allow two surprising turns, such as a key lift for the last chorus, a change of "
    "rhythm feel, a sudden sparse breakdown or an unusual instrument solo - the song still flows as one."
)

_LYRICS = {
    STEADY: "Lyrics: plain everyday words, short regular lines and simple rhymes; the chorus repeats the same "
    "words each time.",
    RESTRAINED: "Lyrics: familiar images, regular lines and a chorus that repeats.",
    VARIED: "Lyrics: fresh, concrete images instead of stock phrases; vary line lengths and rhythm between the "
    "sections; keep the chorus hook memorable - its last repeat may change a few words to lift the ending.",
    EXPERIMENTAL: "Lyrics: an unexpected angle and imagery, inventive rhymes and rhythms; the hook stays "
    "recognisable.",
    ADVENTUROUS: "Lyrics: a surprising perspective (an object that speaks, a letter, a dialogue, a story told from "
    "its end), vivid unusual images, inventive rhymes and rhythms; the chorus hook stays simple enough to sing "
    "along.",
}
_LYRICS_ON_A_MELODY = {
    STEADY: "Lyrics: plain everyday words and simple rhymes.",
    RESTRAINED: "Lyrics: familiar images.",
    VARIED: "Lyrics: fresh, concrete images instead of stock phrases.",
    EXPERIMENTAL: "Lyrics: an unexpected angle and imagery, inventive rhymes.",
    ADVENTUROUS: "Lyrics: a surprising perspective and vivid unusual images, inventive rhymes.",
}
_EXTRA_SECTION = (
    " You may add one contrasting section - a [Bridge], or a [Break] before the last chorus - if the sections "
    "above have none."
)


def writer_lines(
    creativity: int,
    *,
    engine_id: str,
    instrumental: bool,
    lyrics: str,
    fixed_sections: bool,
) -> list[str]:
    """The writer's rules for ``creativity`` (nothing for 40-60: the reference prompt; up to 100 as in 1.4).

    ``engine_id``: MiniMax Music 3 writes a caption in three headed parts, every other engine one descriptor line
    (YuE2 sang longer style prose; yue2-design.md §3.1). ``lyrics``: ``write`` (the writer writes them),
    ``melody`` (new lyrics on a given melody - the syllable counts rule, so the lines keep their length),
    ``sparse`` (sparse vocals: a few short phrases) or ``none``. ``fixed_sections``: the sections come from a score and must not change."""
    level = creativity_level(creativity)
    if level == BALANCED:
        return []
    lines = [f"- Creativity ({creativity_value(creativity)} of 100, {level}): {_HEADS[level]}"]
    if engine_id == MINIMAX:
        lines.append("- " + _CAPTION_STYLE[level].format(lead="lead" if instrumental else "voice"))
    else:
        lines.append(
            "- "
            + _DESCRIPTOR_STYLE[level].format(sung="" if instrumental else " or 'layered backing vocals'")
        )
    if not instrumental and lyrics == "write":
        extra = _EXTRA_SECTION if level in (EXPERIMENTAL, ADVENTUROUS) and not fixed_sections else ""
        lines.append("- " + _LYRICS[level] + extra)
    elif not instrumental and lyrics == "melody":
        lines.append("- " + _LYRICS_ON_A_MELODY[level] + " The syllable counts above still rule.")
    elif not instrumental and lyrics == "sparse":
        lines.append("- " + _LYRICS_ON_A_MELODY[level] + " The words stay as few as the lyrics rule says.")
    return lines
