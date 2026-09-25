"""Song briefs and the brief template library.

A brief is the structured intent of a song. It is model independent: engines
and the writing prompt interpret it. Templates are Markdown files with a small
front matter block; a template fills only the brief fields the user left empty
(one rule, the same in the editor and headless).
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from .errors import PlenioUserError
from .files import atomic_write_text
from .hashing import sha256_json

BRIEF_SCHEMA = "plenio.brief/1"
LENGTHS: dict[str, float] = {
    "short (about 1:30)": 90.0,
    "standard (about 3:00)": 180.0,
    "long (about 4:30)": 270.0,
}
DEFAULT_LENGTH = "standard (about 3:00)"
VOCALS = ("sung", "instrumental")
MELODY_OPTIONS = {"instrument plays the lead": "lead", "accompaniment only": "accompaniment"}
TEXT_FIELDS = (
    "description",
    "genre",
    "mood",
    "tempo",
    "key",
    "meter",
    "language",
    "voice",
    "theme",
    "lead_instrument",
)
TEMPLATE_FIELDS = (*TEXT_FIELDS, "length", "vocals", "melody")
_FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", re.DOTALL)
_ID = re.compile(r"[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)?")


@dataclass(frozen=True)
class SongBrief:
    description: str = ""
    genre: str = ""
    mood: str = ""
    tempo: str = ""
    length: str = DEFAULT_LENGTH
    key: str = ""
    meter: str = ""
    vocals: str = "sung"
    language: str = ""
    voice: str = ""
    theme: str = ""
    melody: str = "lead"
    lead_instrument: str = ""
    template: str = ""
    from_template: tuple[str, ...] = field(default=(), compare=False)
    kind: str = "song"

    @property
    def instrumental(self) -> bool:
        return self.vocals == "instrumental"

    @property
    def target_seconds(self) -> float:
        return LENGTHS[self.length]

    @property
    def max_seconds(self) -> float:
        """Generic render headroom for the target length (engines clamp it to their limits)."""
        return round(self.target_seconds * 1.15 + 10.0, 1)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["from_template"] = list(self.from_template)
        data["schema"] = BRIEF_SCHEMA
        data["target_seconds"] = self.target_seconds
        return data

    @property
    def fingerprint(self) -> str:
        data = self.to_dict()
        data.pop("from_template")
        return sha256_json(data)

    def to_text(self) -> str:
        """Readable summary (used in the writing prompt and the release record)."""
        lines = []
        if self.description:
            lines.append(f"Description: {self.description}")
        for label, value in (
            ("Genre", self.genre),
            ("Mood", self.mood),
            ("Tempo", self.tempo),
            ("Key", self.key),
            ("Meter", self.meter),
        ):
            if value:
                lines.append(f"{label}: {value}")
        lines.append(f"Length: {self.length}")
        if self.instrumental:
            lines.append("Vocals: none (instrumental)")
            lines.append(
                "Melody: "
                + (
                    "an instrument plays the lead melody"
                    if self.melody == "lead"
                    else "accompaniment only, no lead melody"
                )
            )
            if self.lead_instrument:
                lines.append(f"Lead instrument: {self.lead_instrument}")
        else:
            lines.append("Vocals: sung")
            for label, value in (
                ("Language", self.language),
                ("Voice", self.voice),
                ("Lyrics theme", self.theme),
            ):
                if value:
                    lines.append(f"{label}: {value}")
        return "\n".join(lines)


COVER_VOCALS = {
    "original lyrics": "original",
    "new lyrics": "new",
    "instrumental": "instrumental",
}
HARMONY_OPTIONS = {"new accompaniment": "new", "keep original chords": "keep"}
COVER_DEFAULT_MAX_SECONDS = 360.0


@dataclass(frozen=True)
class CoverBrief:
    """The intent of a cover: the target style and how the vocals and the harmony are treated.

    Melody, form, key and tempo come from the source's transcription (the score), so the brief has
    no length, tempo, key or meter. ``vocals`` decides where the lyrics draft comes from; which
    lyrics text is finally used is a state of the lyrics document in the Song Sheet.
    """

    description: str = ""
    genre: str = ""
    mood: str = ""
    vocals: str = "instrumental"
    language: str = ""
    voice: str = ""
    theme: str = ""
    phrasing_reference: bool = False
    melody: str = "lead"
    lead_instrument: str = ""
    harmony: str = "new"
    title: str = ""
    template: str = ""
    from_template: tuple[str, ...] = field(default=(), compare=False)
    kind: str = "cover"

    @property
    def instrumental(self) -> bool:
        return self.vocals == "instrumental"

    @property
    def use_source_lyrics(self) -> bool:
        return self.vocals == "original"

    @property
    def writes_lyrics(self) -> bool:
        return self.vocals == "new"

    @property
    def target_seconds(self) -> float | None:
        """Covers have no target length: the source defines it."""
        return None

    @property
    def max_seconds(self) -> float:
        return COVER_DEFAULT_MAX_SECONDS

    @property
    def length(self) -> str:
        return "as the source"

    def warnings(self) -> list[str]:
        notes = []
        if self.instrumental and self.melody == "accompaniment" and self.harmony == "new":
            notes.append(
                "Accompaniment only with a new harmony keeps neither the melody nor the chords: only the form, "
                "the tempo and the instrumental line remain, and YuE2 tends to invent a melody (in the Phase 4A "
                "study it sounded like gibberish singing). Keep the original chords or let an instrument play "
                "the melody."
            )
        return notes

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["from_template"] = list(self.from_template)
        data["schema"] = BRIEF_SCHEMA
        return data

    @property
    def fingerprint(self) -> str:
        data = self.to_dict()
        data.pop("from_template")
        return sha256_json(data)

    def to_text(self) -> str:
        lines = ["Kind: cover of a recorded song (melody, form and tempo come from the source)"]
        if self.description:
            lines.append(f"Target style: {self.description}")
        for label, value in (("Genre", self.genre), ("Mood", self.mood)):
            if value:
                lines.append(f"{label}: {value}")
        if self.vocals == "original":
            lines.append("Vocals: sung, with the original lyrics of the source")
            lines.append(f"Language: {self.language or 'as the source (detected)'}")
            if self.voice:
                lines.append(f"Voice: {self.voice}")
        elif self.vocals == "new":
            lines.append("Vocals: sung, with new lyrics on the source's melody")
            for label, value in (
                ("Language", self.language),
                ("Voice", self.voice),
                ("Lyrics theme", self.theme),
            ):
                if value:
                    lines.append(f"{label}: {value}")
        else:
            lines.append("Vocals: none (instrumental)")
            lines.append(
                "Melody: "
                + (
                    "an instrument plays the vocal melody"
                    if self.melody == "lead"
                    else "accompaniment only, no lead melody"
                )
            )
            if self.lead_instrument:
                lines.append(f"Lead instrument: {self.lead_instrument}")
        lines.append(
            "Harmony: "
            + (
                "new accompaniment (the original chords are not used)"
                if self.harmony == "new"
                else "original chords"
            )
        )
        if self.title:
            lines.append(f"Title: {self.title}")
        return "\n".join(lines)


def build_cover_brief(values: Mapping[str, Any], template: Template | None = None) -> CoverBrief:
    """Create a cover brief; the template fills only empty style fields. Invalid choices raise."""
    merged: dict[str, str] = {}
    from_template: list[str] = []
    for name in ("description", "genre", "mood", "language", "voice", "theme", "lead_instrument"):
        value = str(values.get(name, "") or "").strip()
        if not value and template is not None and template.fields.get(name) and name != "language":
            value = template.fields[name]
            from_template.append(name)
        merged[name] = value
    vocals = COVER_VOCALS.get(str(values.get("vocals", "")), str(values.get("vocals", "") or "instrumental"))
    if vocals not in COVER_VOCALS.values():
        raise PlenioUserError(
            f"Unknown cover vocal mode {vocals!r}.", hint=f"Choose one of {list(COVER_VOCALS)}."
        )
    harmony = HARMONY_OPTIONS.get(str(values.get("harmony", "")), str(values.get("harmony", "") or "new"))
    if harmony not in HARMONY_OPTIONS.values():
        raise PlenioUserError(
            f"Unknown harmony option {harmony!r}.", hint=f"Choose one of {list(HARMONY_OPTIONS)}."
        )
    melody_value = str(values.get("melody", "") or "")
    melody = MELODY_OPTIONS.get(melody_value, melody_value or "lead")
    if melody not in MELODY_OPTIONS.values():
        raise PlenioUserError(
            f"Unknown melody option {melody_value!r}.", hint=f"Choose one of {list(MELODY_OPTIONS)}."
        )
    language = merged["language"]
    if language.lower() == "auto":
        language = ""
    brief = CoverBrief(
        description=merged["description"],
        genre=merged["genre"],
        mood=merged["mood"],
        vocals=vocals,
        language=language if vocals != "instrumental" else "",
        voice=merged["voice"] if vocals != "instrumental" else "",
        theme=merged["theme"] if vocals == "new" else "",
        phrasing_reference=bool(values.get("phrasing_reference", False)) and vocals == "new",
        melody=melody if vocals == "instrumental" else "lead",
        lead_instrument=merged["lead_instrument"] if vocals == "instrumental" else "",
        harmony=harmony,
        title=str(values.get("title", "") or "").strip(),
        template=template.id if template else "",
        from_template=tuple(from_template),
    )
    if not (brief.description or brief.genre):
        raise PlenioUserError(
            "The cover brief has no target style.",
            hint="Choose a template or describe the target style (at least a genre or a description).",
        )
    return brief


@dataclass(frozen=True)
class Template:
    id: str
    name: str
    group: str
    fields: Mapping[str, str]
    source: str = "package"

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "group": self.group,
            "fields": dict(self.fields),
            "source": self.source,
        }


def build_song_brief(values: Mapping[str, str], template: Template | None = None) -> SongBrief:
    """Create a brief; fields left empty take the template's value. Invalid choices raise."""
    merged: dict[str, str] = {}
    from_template: list[str] = []
    for name in TEMPLATE_FIELDS:
        value = str(values.get(name, "") or "").strip()
        if not value and template is not None and template.fields.get(name):
            value = template.fields[name]
            from_template.append(name)
        merged[name] = value
    length = merged["length"] or DEFAULT_LENGTH
    if length not in LENGTHS:
        raise PlenioUserError(f"Unknown length {length!r}.", hint=f"Choose one of {list(LENGTHS)}.")
    vocals = merged["vocals"] or "sung"
    if vocals not in VOCALS:
        raise PlenioUserError(f"Unknown vocal mode {vocals!r}.", hint=f"Choose one of {list(VOCALS)}.")
    melody = MELODY_OPTIONS.get(merged["melody"], merged["melody"] or "lead")
    if melody not in MELODY_OPTIONS.values():
        raise PlenioUserError(
            f"Unknown melody option {merged['melody']!r}.", hint=f"Choose one of {list(MELODY_OPTIONS)}."
        )
    brief = SongBrief(
        **{name: merged[name] for name in TEXT_FIELDS},
        length=length,
        vocals=vocals,
        melody=melody,
        template=template.id if template else "",
        from_template=tuple(from_template),
    )
    if not (brief.description or brief.genre):
        raise PlenioUserError(
            "The brief is empty.",
            hint="Choose a template or describe the song (at least a genre or a description).",
        )
    return brief


# --- template files ------------------------------------------------------------------------


def parse_template(text: str, template_id: str, source: str = "package") -> Template:
    match = _FRONT_MATTER.match(text.replace("\r\n", "\n"))
    if match is None:
        raise PlenioUserError(f"Template {template_id!r} has no front matter block (--- ... ---).")
    fields: dict[str, str] = {}
    name = template_id.rsplit("/", 1)[-1].replace("-", " ").capitalize()
    group = (
        template_id.split("/", 1)[0].replace("-", " ").capitalize() if "/" in template_id else "My templates"
    )
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(":")
        if not sep:
            raise PlenioUserError(f"Template {template_id!r}: malformed front matter line {line!r}.")
        key, value = key.strip().lower(), value.strip()
        if key == "name":
            name = value
        elif key == "group":
            group = value
        elif key in TEMPLATE_FIELDS:
            fields[key] = value
        else:
            raise PlenioUserError(
                f"Template {template_id!r}: unknown field {key!r}.", hint=f"Known fields: {TEMPLATE_FIELDS}."
            )
    body = match.group(2).strip()
    if body:
        fields["description"] = body
    if fields.get("length") and fields["length"] not in LENGTHS:
        raise PlenioUserError(f"Template {template_id!r}: unknown length {fields['length']!r}.")
    if fields.get("vocals") and fields["vocals"] not in VOCALS:
        raise PlenioUserError(f"Template {template_id!r}: unknown vocal mode {fields['vocals']!r}.")
    return Template(template_id, name, group, fields, source)


def render_template(template: Template) -> str:
    lines = ["---", f"name: {template.name}", f"group: {template.group}"]
    lines += [f"{key}: {value}" for key, value in template.fields.items() if key != "description" and value]
    lines += ["---", "", template.fields.get("description", "").strip(), ""]
    return "\n".join(lines)


class TemplateLibrary:
    """Package templates (read-only) plus user templates (ComfyUI user directory)."""

    def __init__(self, package_dir: Path, user_dir: Path | None = None):
        self.package_dir = package_dir
        self.user_dir = user_dir
        self._templates: dict[str, Template] | None = None

    def _load(self) -> dict[str, Template]:
        templates: dict[str, Template] = {}
        for folder, source in ((self.package_dir, "package"), (self.user_dir, "user")):
            if folder is None or not folder.is_dir():
                continue
            for path in sorted(folder.rglob("*.md")):
                if path.name.lower() == "readme.md":
                    continue
                relative = path.relative_to(folder).with_suffix("").as_posix()
                template_id = relative if source == "package" else f"user/{relative}"
                templates[template_id] = parse_template(path.read_text(encoding="utf-8"), template_id, source)
        return templates

    def templates(self) -> dict[str, Template]:
        if self._templates is None:
            self._templates = self._load()
        return self._templates

    def reload(self) -> None:
        self._templates = None

    def ids(self) -> list[str]:
        return sorted(self.templates(), key=lambda i: (self.templates()[i].group, self.templates()[i].name))

    def get(self, template_id: str) -> Template:
        try:
            return self.templates()[template_id]
        except KeyError as error:
            raise PlenioUserError(
                f"Unknown brief template {template_id!r}.",
                hint="Choose 'none' or a template from the list (user templates appear after a refresh).",
            ) from error

    def listing(self) -> list[dict[str, Any]]:
        return [
            {
                "id": i,
                "name": self.templates()[i].name,
                "group": self.templates()[i].group,
                "source": self.templates()[i].source,
            }
            for i in self.ids()
        ]

    def save_user_template(self, name: str, fields: Mapping[str, str]) -> Template:
        if self.user_dir is None:
            raise PlenioUserError("User templates need the ComfyUI user directory.")
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60]
        if not slug or not _ID.fullmatch(slug):
            raise PlenioUserError(
                f"Template name {name!r} gives no usable file name.", hint="Use letters or digits."
            )
        template = Template(
            f"user/{slug}",
            name.strip(),
            "My templates",
            {k: str(v).strip() for k, v in fields.items() if k in TEMPLATE_FIELDS and str(v).strip()},
            "user",
        )
        atomic_write_text(self.user_dir / f"{slug}.md", render_template(template))
        self.reload()
        return template


def options(library: TemplateLibrary) -> list[str]:
    return ["none", *library.ids()]


def describe_fields(fields: Iterable[str]) -> str:
    return ", ".join(fields)
