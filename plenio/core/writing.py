"""Writing prompts for any LLM, and robust parsing of its answer.

``compose`` turns a brief plus the engine's writing rules into one plain
prompt. ``parse_draft`` extracts title, style, lyrics and artwork prompt from
whatever the LLM answered, and enforces the format deterministically; every
enforcement is reported (never silent).
"""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from . import lyrics as lyrics_rules
from .brief import SongBrief
from .engines import EngineInfo, rules_for
from .errors import PlenioValidationError

REQUEST_SCHEMA = "plenio.request/1"
BLOCKS = ("TITLE", "STYLE", "LYRICS", "ARTWORK")
DETAIL = {
    "concise": "Keep it compact: short sections with few lines.",
    "standard": "",
    "rich": "Use vivid, specific imagery and varied phrasing.",
}
# A label line: "TITLE: text", "### STYLE", "**Lyrics:**". Without a colon the label must stand alone,
# so that a lyric line such as "Style is everything" is never taken for a label.
_HEADING = re.compile(
    r"(?im)^[ \t>*#_\-]*\**\s*(TITLE|STYLE|LYRICS|ARTWORK)\s*\**(?:\s*:\s*\**[ \t]*(.*?)\**[ \t]*|[ \t]*)$"
)
_THINKING = [
    re.compile(r"(?is)<think>.*?</think>"),
    re.compile(r"(?is)<\|channel\>thought.*?<channel\|>"),
    re.compile(r"(?is)<\|channel\|>analysis.*?<\|end\|>"),
    re.compile(r"(?is)<\|?(?:think|thinking)\|?>.*?<\|?/(?:think|thinking)\|?>"),
]
_FENCE = re.compile(r"(?m)^```.*$")
_BOLD_TAG = re.compile(r"^\**\s*\[([^\]]{1,40})\]\s*\**$")
_LABEL_TAG = re.compile(
    r"^\**\s*\(?(intro|verse(?: \d+)?|pre-chorus|chorus|post-chorus|bridge|outro|hook|refrain|interlude|instrumental|solo|break)\)?\s*:?\s*\**$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class Request:
    engine_id: str
    rules_version: str
    brief_fingerprint: str
    instrumental: bool
    sections: tuple[str, ...]
    fixed_title: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": REQUEST_SCHEMA,
            "engine_id": self.engine_id,
            "rules_version": self.rules_version,
            "brief_fingerprint": self.brief_fingerprint,
            "instrumental": self.instrumental,
            "sections": list(self.sections),
            "fixed_title": self.fixed_title,
        }


@dataclass(frozen=True)
class Draft:
    title: str
    style: str
    lyrics: str
    artwork_prompt: str
    enforcements: tuple[str, ...] = field(default=())

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "style": self.style,
            "lyrics": self.lyrics,
            "artwork_prompt": self.artwork_prompt,
            "enforcements": list(self.enforcements),
        }


def compose(
    brief: SongBrief,
    engine: EngineInfo,
    *,
    detail: str = "standard",
    score_sections: Sequence[str] = (),
    fixed_title: str = "",
) -> tuple[str, Request]:
    """The writing prompt for ``brief`` under the rules of ``engine``."""
    rules = rules_for(engine.engine_id).writing_rules(
        instrumental=brief.instrumental, target_seconds=brief.target_seconds
    )
    sections = tuple(s.strip("[]") for s in score_sections) or tuple(rules["sections"])
    request = Request(
        engine.engine_id,
        engine.rules_version,
        brief.fingerprint,
        brief.instrumental,
        sections,
        fixed_title.strip(),
    )
    section_line = " ".join(f"[{s}]" for s in sections)
    parts = [
        f"You are a professional songwriter preparing a song for the AI music model {rules['engine']}.",
        "Write the song described in the brief below and follow the rules exactly.",
        "",
        "BRIEF",
        brief.to_text(),
        "",
        "RULES",
        "- Title: 1 to 6 words, no quotes."
        if not request.fixed_title
        else f'- Title: use exactly "{request.fixed_title}".',
        f"- {rules['style']}",
        f"- {rules['lyrics']}",
        f"- Sections, in this order: {section_line}"
        + (
            " (these follow the score and must not change)."
            if score_sections
            else " (adapt only if the brief asks for it)."
        ),
        "- Artwork: one sentence describing a square cover image; no text or letters in the image.",
    ]
    if DETAIL.get(detail):
        parts.append(f"- {DETAIL[detail]}")
    parts += [
        "",
        f"Example style: {rules['example_style']}",
        "",
        "Write your answer in exactly this layout. Keep the four labels TITLE:, STYLE:, LYRICS: and ARTWORK: "
        "and replace the text in angle brackets; write nothing before or after it.",
        "",
        "TITLE: <the title>",
        "STYLE: <the style line>",
        "LYRICS:",
        f"[{sections[0]}]",
        "<lines>" if not brief.instrumental else f"[{sections[1] if len(sections) > 1 else sections[0]}]",
        "...",
        "ARTWORK: <one sentence>",
    ]
    return "\n".join(parts), request


def _strip_thinking(text: str) -> tuple[str, bool]:
    stripped = text
    for pattern in _THINKING:
        stripped = pattern.sub("", stripped)
    return stripped, stripped != text


def _blocks(text: str) -> dict[str, str]:
    matches = list(_HEADING.finditer(text))
    # Use the last complete run of headings (models sometimes echo the format first).
    starts: dict[str, int] = {}
    for match in matches:
        starts[match.group(1).upper()] = matches.index(match)
    blocks: dict[str, str] = {}
    for name, index in starts.items():
        match = matches[index]
        following = [m.start() for m in matches if m.start() > match.start()]
        end = min(following) if following else len(text)
        inline = (match.group(2) or "").strip()
        body = (inline + "\n" if inline else "") + text[match.end() : end]
        blocks[name] = _FENCE.sub("", body).strip()
    return blocks


_DIRECTION_LINE = re.compile(r"^\s*[\(\{<].*[\)\}>]\s*$")
_REPEAT_MARK = re.compile(r"^(.*?)\s*\(\s*[x×]\s*([2-4])\s*\)\s*$", re.IGNORECASE)


_TAG_LINE = re.compile(r"^\**\s*\[[^\[\]\n]{1,40}\]\s*\**$")
_MARKER = re.compile(r"^\s*(?:#{1,6}|>|\*\*)\s*")


def _split_trailing_sentence(lyrics_text: str) -> tuple[str, str]:
    """Split off a final paragraph that reads like a sentence (an unlabelled artwork prompt)."""
    parts = lyrics_text.rstrip().rsplit("\n\n", 1)
    if len(parts) == 2:
        tail = _MARKER.sub("", parts[1].strip())
        if "\n" not in tail and len(tail.split()) >= 8 and tail.endswith(".") and not _TAG_LINE.match(tail):
            return parts[0].rstrip(), tail
    return lyrics_text, ""


def _infer_blocks(text: str) -> dict[str, str]:
    """Blocks of an answer without (complete) labels.

    Layout seen from real models: an optional title line, the style line(s),
    the ``[Tag]`` lyrics and a final artwork sentence; heading markers such as
    ``###`` may precede the content lines themselves.
    """
    lines = [line.rstrip() for line in _FENCE.sub("", text).strip().split("\n")]
    first_tag = next((i for i, line in enumerate(lines) if _TAG_LINE.match(line.strip())), None)
    if first_tag is None:
        return {}
    head = []
    for line in lines[:first_tag]:
        cleaned = _MARKER.sub("", line).strip()
        label = _HEADING.match(line)
        if label and not (label.group(2) or "").strip():
            continue  # a bare label line (for example '### LYRICS')
        if label:
            cleaned = (label.group(2) or "").strip()
        if cleaned:
            head.append(cleaned)
    blocks: dict[str, str] = {}
    if len(head) >= 2:
        blocks["TITLE"], blocks["STYLE"] = head[0], " ".join(head[1:])
    elif head:
        blocks["STYLE"] = head[0]
    body = []
    for line in lines[first_tag:]:
        label = _HEADING.match(line)
        if label and label.group(1).upper() == "ARTWORK":
            blocks["ARTWORK"] = (label.group(2) or "").strip()
            index = lines.index(line)
            rest = " ".join(_MARKER.sub("", item).strip() for item in lines[index + 1 :] if item.strip())
            blocks["ARTWORK"] = (blocks["ARTWORK"] + " " + rest).strip()
            break
        body.append(line)
    blocks["LYRICS"] = "\n".join(body).strip()
    return blocks


def _clean_lyrics(text: str, notes: list[str]) -> str:
    lines = []
    directions: list[str] = []
    converted = repeated = 0
    for raw in text.replace("\r\n", "\n").split("\n"):
        line = raw.strip().strip("*_").strip()
        bold = _BOLD_TAG.match(raw.strip())
        label = _LABEL_TAG.match(raw.strip())
        repeat = _REPEAT_MARK.match(line)
        if bold:
            line = f"[{bold.group(1).strip()}]"
        elif label:
            line = f"[{label.group(1).strip().title()}]"
            converted += 1
        elif _DIRECTION_LINE.match(line):
            directions.append(line)
            continue
        elif repeat and repeat.group(1):
            lines.extend([repeat.group(1)] * (int(repeat.group(2)) - 1))
            line = repeat.group(1)
            repeated += 1
        lines.append(line)
    if converted:
        notes.append(f"{converted} section label(s) such as 'Chorus:' were converted to [Chorus] tags")
    if repeated:
        notes.append(f"{repeated} repeat mark(s) such as '(x2)' were written out as repeated lines")
    if directions:
        notes.append(f"{len(directions)} stage direction line(s) were removed, e.g. {directions[0]!r}")
    return lyrics_rules.parse_lyrics("\n".join(lines)).format()


def parse_draft(text: str, request: Request) -> Draft:
    """Extract and normalise the LLM answer. Raises when required blocks are missing."""
    notes: list[str] = []
    body, had_thinking = _strip_thinking(text)
    if had_thinking:
        notes.append("the model's thinking section was removed")
    blocks = _blocks(body)
    if not (blocks.get("STYLE") and blocks.get("LYRICS")):
        inferred = _infer_blocks(body)
        for name, value in inferred.items():
            if value and not blocks.get(name):
                blocks[name] = value
        if inferred:
            notes.append("the model did not label every block; missing blocks were inferred from the layout")
    if blocks.get("LYRICS") and not blocks.get("ARTWORK"):
        lyrics_text, artwork = _split_trailing_sentence(blocks["LYRICS"])
        if artwork:
            blocks["LYRICS"], blocks["ARTWORK"] = lyrics_text, artwork
    missing = [name.lower() for name in ("STYLE", "LYRICS") if not blocks.get(name)]
    if missing:
        raise PlenioValidationError(
            f"The writing model's answer has no {' and no '.join(missing)} block.",
            diagnostics=[
                {
                    "severity": "error",
                    "message": f"answer starts with: {body.strip()[:200]!r}",
                    "where": "draft",
                }
            ],
            hint="Run again with another draft seed, or use a stronger writing model; the answer must use the "
            "headings ### TITLE, ### STYLE, ### LYRICS and ### ARTWORK.",
        )
    title = request.fixed_title or blocks.get("TITLE", "").split("\n")[0].strip().strip("\"'“”*# ")
    if not title:
        title = "Untitled"
        notes.append("no title was given; 'Untitled' is used")
    style_raw = blocks["STYLE"]
    style = re.sub(r"\s+", " ", style_raw.replace("*", "")).strip().strip("\"'“”")
    style = re.sub(r"(?i)^style\s*:\s*", "", style).rstrip(".")
    if style != style_raw.strip():
        notes.append("the style was joined into one line and cleaned")
    style, style_notes = rules_for(request.engine_id).enforce_style(style, instrumental=request.instrumental)
    notes.extend(style_notes)
    lyrics = _clean_lyrics(blocks["LYRICS"], notes)
    if request.instrumental:
        parsed = lyrics_rules.parse_lyrics(lyrics)
        if parsed.words:
            tags = parsed.tags or list(request.sections)
            lyrics = lyrics_rules.tags_only(tags)
            notes.append(
                f"instrumental: {parsed.words} word(s) were removed from the lyrics, only section tags remain"
            )
        elif not parsed.sections:
            lyrics = lyrics_rules.tags_only(request.sections)
            notes.append("instrumental: section tags were taken from the section plan")
    artwork = re.sub(r"\s+", " ", blocks.get("ARTWORK", "")).strip()
    return Draft(title[:80], style, lyrics, artwork, tuple(notes))


def draft_findings(draft: Draft, engine_id: str, *, instrumental: bool) -> list[Mapping[str, Any]]:
    """Engine checks on the draft (the Song Sheet repeats them on the final documents)."""
    rules = rules_for(engine_id)
    findings = rules.check_style(draft.style, instrumental=instrumental) + rules.check_lyrics(
        draft.lyrics, instrumental=instrumental
    )
    return [f.to_dict() for f in findings]
