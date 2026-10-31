"""The Song API's templates and requests, without ComfyUI (owner's request 2026-10-25: songs made from the Plenio
Player at a party, through an API of Plenio's own on the running ComfyUI; docs/design/party-songs.md).

A template the API runs says so in its ``extra.plenio_api`` (``{"id": "yue2-song", "kind": "song"}``). Its fields
are read from the template itself, every time, so that they follow the workflow of every version:

* the **song fields** - every widget of every node in the groups up to the brief's (*1 · SONG*; a cover's
  *1 · SOURCE* and *2 · COVER*): the brief's by their input name (``genre``; its DynamicCombo's inputs by their
  own name, ``language``, with the choices they belong to), the other nodes' as ``<node>.<input>`` with a short
  name per node type (``writer.model``, ``finish.hq_mastering``, ``source.audio``); the template's switches
  (``finish.cover_art``: the nodes marked ``plenio_switch: cover`` run or are bypassed) and its optional nodes
  (``excerpt.enabled``: a node titled *(optional)* runs);
* the **release fields** - the Export Release's widgets (``folder``, ``artist``, ``album`` ...);
* the **seeds** - the template's Plenio · Seed nodes by their part (``take``, ``draft``, ``plan``, ``cover``);
* the **documents** - what the template's Song Sheets keep (``title``, ``style``, ``lyrics``, ``score``,
  ``artwork_prompt``): given with a request, a document goes into its sheet as *manual*, and the run keeps it
  instead of writing or planning it anew - the documents of a song and a new take seed make a new take of it.

A request is checked against the node definitions of the ComfyUI that runs it, written into a copy of the
workflow (the widgets, a DynamicCombo's new choice with its inputs, the modes, the sheets' states), its seeds drawn
or given - and then the workflow is the API prompt (``workflow_prompt``). Review stops are not part of v1: the
brief's work mode is its run-through choice.

``request_from_record`` turns a release record back into a request: the song's fields, release fields, seeds and
documents as its prompt has them (owner's request 2026-10-26: a new take, or a new song, of any song of the player).
"""

from __future__ import annotations

import copy
import json
import random
import re
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import brief as brief_rules
from .errors import PlenioUserError
from .sheet.state import DOCUMENT_KINDS, SHEET_STATE_SCHEMA
from .workflow_prompt import (
    BYPASS,
    CONTROL,
    DYNAMIC_COMBO,
    NOTE_TYPES,
    SEED_LIMIT,
    InfoLookup,
    NodeInfo,
    decode_widgets,
    default_choice,
    encode_widgets,
    is_widget,
    option_keys,
    randomise_controls,
    to_prompt,
    widget_layout,
)

API_NAME = "plenio-song-api"
API_VERSION = "1.3"
"""1.1 (2026-10-26) only adds: a finished job's files to download, waiting for a job's change, filters of the job
list. A program written for 1.0 works unchanged."""
"""The API's version: a new minor version only adds (fields, paths, values); a new major one has its own path."""
MARKER = "plenio_api"
BRIEF_TYPES = {"PlenioSongBrief": "song", "PlenioCoverBrief": "cover"}
EXPORT_TYPE = "PlenioExportRelease"
SEED_TYPE = "PlenioSeed"
SHEET_TYPE = "PlenioSongSheet"
NODE_NAMES = {
    "PlenioWriterChoice": "writer",
    "PlenioHQMastering": "finish",
    "LoadAudio": "source",
    "TrimAudioDuration": "excerpt",
}
"""The short names of the nodes' fields (``writer.model``): stable, whatever a later version titles the node."""
SWITCH_FIELDS = {"cover": "finish.cover_art"}
"""The template's switches (nodes marked ``plenio_switch``): the field that runs or bypasses them."""
SWITCH_TEXT = {
    "cover": (
        "Cover Art",
        "Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no "
        "image model.",
    )
}
FIELD_ALIASES: dict[str, dict[str, str]] = {}
"""Old field names of a template that a later version renamed (template id -> old -> new): requests with the old
name keep working (the field list's test asks for an entry when a name goes)."""
OPTIONAL_MARK = "(optional)"
TEXT_LIMIT = 4000
LINE_LIMIT = 400
UPLOAD_PREFIX = "plenio-api-"
UPLOAD_DESCRIPTION = "A recording in ComfyUI's input folder: upload it with POST /uploads?name=<file> and give the answer's name here."
"""An upload field's description where its node (ComfyUI's Load Audio) brings none."""
"""Uploaded source recordings are saved in ComfyUI's input folder under names that start with this."""
DOCUMENT_LIMIT = 200_000
"""A document's characters at most (a long score in ABC is some ten thousand)."""
MODELS = (("YuE2", "YuE2"), ("MiniMax", "MiniMax Music 3"))
"""The music model a record's prompt ran, by the start of its classes' names."""
RUN_THROUGH = {
    "PlenioSongBrief": next(k for k, v in brief_rules.SONG_MODES.items() if v == "batch"),
    "PlenioCoverBrief": next(k for k, v in brief_rules.COVER_MODES.items() if v == "batch"),
}
"""The briefs' work mode for an API run: it runs through, without stopping at the Song Sheets (review stops are
not in v1 - docs/design/party-songs.md §2.7)."""


class SongApiError(ValueError):
    """A request the API refuses: ``code`` (stable, for programs), the message, a hint, the field."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        hint: str = "",
        field: str = "",
        status: int = 400,
        details: Any = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.hint = hint
        self.field = field
        self.status = status
        self.details = details

    def to_dict(self) -> dict[str, Any]:
        body: dict[str, Any] = {"code": self.code, "message": self.message}
        if self.hint:
            body["hint"] = self.hint
        if self.field:
            body["field"] = self.field
        if self.details is not None:
            body["details"] = self.details
        return body


def result_file(record: Path, name: str, listed: Iterable[str], output: Path) -> Path:
    """A file of a finished song to download (``GET /jobs/{id}/files/{name}``): one its release record lists, or the
    record itself - in the record's folder, inside ComfyUI's output folder. Nothing else, whatever the name says."""
    missing = SongApiError(
        "not_found",
        f"The song has no file {name!r}.",
        hint="The job's result lists its files, each with its url.",
        status=404,
    )
    if not name or Path(name).name != name or name in (".", ".."):
        raise missing
    if name not in set(listed) | {record.name}:
        raise missing
    folder = record.parent.resolve()
    path = (folder / name).resolve()
    if path.parent != folder or output.resolve() not in path.parents or not path.is_file():
        raise missing
    return path


# --- the template's anatomy ---------------------------------------------------------------------------------


def group_number(title: Any) -> int | None:
    """``"1 · SONG"`` -> 1; a group without a number (``COVER ART``) -> ``None``."""
    match = re.match(r"\s*(\d+)\s*·", str(title or ""))
    return int(match.group(1)) if match else None


def _inside(node: Mapping[str, Any], group: Mapping[str, Any]) -> bool:
    try:
        x, y = node["pos"][0], node["pos"][1]
        left, top, width, height = group["bounding"][:4]
    except (KeyError, IndexError, TypeError):
        return False
    return bool(left <= x <= left + width and top <= y <= top + height)


def group_of(workflow: Mapping[str, Any], node: Mapping[str, Any]) -> str:
    """The title of the group the node stands in (``""``: none)."""
    for group in workflow.get("groups") or []:
        if isinstance(group, Mapping) and _inside(node, group):
            return str(group.get("title") or "")
    return ""


def _top_nodes(workflow: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    return [n for n in workflow.get("nodes") or [] if isinstance(n, Mapping) and "id" in n]


def brief_node(workflow: Mapping[str, Any]) -> Mapping[str, Any] | None:
    return next((n for n in _top_nodes(workflow) if n.get("type") in BRIEF_TYPES), None)


def song_nodes(workflow: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    """The nodes of the song groups (the groups numbered up to the brief's), the brief first, then the others as
    the canvas shows them (group by group, top to bottom)."""
    brief = brief_node(workflow)
    if brief is None:
        return []
    last = group_number(group_of(workflow, brief)) or 1
    groups = [
        g
        for g in workflow.get("groups") or []
        if isinstance(g, Mapping) and (number := group_number(g.get("title"))) is not None and number <= last
    ]
    groups.sort(key=lambda g: group_number(g.get("title")) or 0)
    found: list[Mapping[str, Any]] = [brief]
    for group in groups:
        members = [n for n in _top_nodes(workflow) if _inside(n, group) and n is not brief]
        members.sort(key=lambda n: (float(n["pos"][1]), float(n["pos"][0])))
        found += [n for n in members if str(n.get("type")) not in NOTE_TYPES and n not in found]
    return found


def node_title(node: Mapping[str, Any], info: NodeInfo | None) -> str:
    return str(node.get("title") or (info or {}).get("display_name") or node.get("type") or "")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def node_name(node: Mapping[str, Any], taken: set[str]) -> str:
    """The short name of a node's fields: the type's (``NODE_NAMES``), else the class without *Plenio* in snake case;
    a second node of one name gets its title's."""
    node_type = str(node.get("type") or "")
    base = NODE_NAMES.get(node_type) or _slug(
        re.sub(r"(?<!^)(?=[A-Z])", "_", node_type.removeprefix("Plenio"))
    )
    name = base
    if name in taken:
        name = f"{base}_{_slug(str(node.get('title') or node.get('id')))}"
    taken.add(name)
    return name


# --- fields -------------------------------------------------------------------------------------------------


@dataclass(frozen=True)
class Field:
    """A field of the API: what it sets (``node``, ``input``; a switch or an optional node by ``kind``), its type,
    its default (the template's value), its choices and range, the choice it depends on (``when``)."""

    id: str
    kind: str  # widget | switch | enabled | fixed
    type: str  # text | string | integer | number | boolean | choice | upload
    label: str
    description: str
    default: Any
    node: int
    node_type: str
    node_title: str
    group: str
    input: str = ""
    choices: tuple[str, ...] = ()
    minimum: float | None = None
    maximum: float | None = None
    step: float | None = None
    when: tuple[tuple[str, tuple[str, ...]], ...] = ()
    defaults: tuple[tuple[str, Any], ...] = ()
    """A DynamicCombo input's default per choice (``language``: *auto* for original lyrics, *English* for new)."""
    inputs: tuple[str, ...] = ()
    """The node inputs it sets (one input; a DynamicCombo's input of several choices may have several names)."""
    switch: str = ""
    fixed: bool = False
    required: bool = False
    advanced: bool = False

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {
            "id": self.id,
            "label": self.label,
            "type": self.type,
            "default": self.default,
            "description": self.description,
            "node": {"id": self.node, "type": self.node_type, "title": self.node_title},
            "group": self.group,
        }
        if self.choices:
            out["choices"] = list(self.choices)
        for key, value in (("minimum", self.minimum), ("maximum", self.maximum), ("step", self.step)):
            if value is not None:
                out[key] = value
        if self.when:
            out["when"] = {name: list(values) for name, values in self.when}
        if self.defaults:
            out["defaults"] = dict(self.defaults)
        if self.fixed:
            out["fixed"] = True
        if self.required:
            out["required"] = True
        if self.advanced:
            out["advanced"] = True
        return out


@dataclass(frozen=True)
class Seed:
    """A Plenio · Seed node of the template: its part (``take``), its number, whether it is drawn anew each run."""

    id: str
    node: int
    title: str
    value: int
    keep: bool

    def to_dict(self) -> dict[str, Any]:
        return {"id": self.id, "node": self.node, "title": self.title, "drawn": not self.keep}


@dataclass(frozen=True)
class Template:
    id: str
    kind: str
    name: str
    """The workflow's name (``1 · YuE2 · Song``)."""
    workflow: Mapping[str, Any]
    fields: tuple[Field, ...]
    release: tuple[Field, ...]
    seeds: tuple[Seed, ...]
    sheets: tuple[tuple[str, int], ...] = ()
    """The documents the template's Song Sheets keep: (kind, the sheet's node id), in the order of DOCUMENT_KINDS."""

    @property
    def documents(self) -> list[str]:
        return [kind for kind, _ in self.sheets]

    @property
    def title(self) -> str:
        return re.sub(r"^\s*\d+\s*·\s*", "", self.name)

    def field(self, name: str) -> Field | None:
        return next((f for f in self.fields if f.id == name), None)

    def needs(self) -> list[str]:
        return [f.id for f in self.fields if f.required]

    def summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "kind": self.kind,
            "workflow": self.name,
            "needs": self.needs(),
        }

    def describe(self) -> dict[str, Any]:
        return {
            **self.summary(),
            "fields": [f.to_dict() for f in self.fields],
            "release": [f.to_dict() for f in self.release],
            "seeds": [s.to_dict() for s in self.seeds],
            "documents": self.documents,
            "aliases": dict(FIELD_ALIASES.get(self.id, {})),
        }


def _field_type(spec_type: Any, options: Mapping[str, Any]) -> str:
    if options.get("audio_upload") or options.get("image_upload") or options.get("video_upload"):
        return "upload"
    if isinstance(spec_type, list) or spec_type in ("COMBO", DYNAMIC_COMBO):
        return "choice"
    if spec_type == "INT":
        return "integer"
    if spec_type == "FLOAT":
        return "number"
    if spec_type in ("BOOLEAN", "PLENIO_FINISH_SWITCH"):
        return "boolean"
    if spec_type == "STRING":
        return "text" if options.get("multiline") else "string"
    return "string"


def _choices(spec_type: Any, options: Mapping[str, Any]) -> tuple[str, ...]:
    if spec_type == DYNAMIC_COMBO:
        return tuple(option_keys(options))
    if isinstance(spec_type, list):
        return tuple(str(c) for c in spec_type)
    if spec_type == "COMBO" and not options.get("audio_upload") and not options.get("image_upload"):
        return tuple(str(c) for c in options.get("options") or [])
    return ()


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) else None


def _label(name: str, options: Mapping[str, Any]) -> str:
    return str(options.get("display_name") or name.rsplit(".", 1)[-1].replace("_", " "))


def _spec(inputs: Mapping[str, Any], name: str) -> tuple[Any, Mapping[str, Any]] | None:
    for section in ("required", "optional"):
        entry = (inputs.get(section) or {}).get(name)
        if entry is not None:
            entry = list(entry) if isinstance(entry, (list, tuple)) else [entry]
            return entry[0], (entry[1] if len(entry) > 1 and isinstance(entry[1], Mapping) else {})
    return None


def _widget_specs(info: NodeInfo) -> list[tuple[str, Any, Mapping[str, Any], tuple[str, str] | None]]:
    """Every widget a node can have: (input name, type, options, (DynamicCombo, choice) it belongs to) - the inputs of
    every choice of a DynamicCombo, not only the one chosen."""
    out: list[tuple[str, Any, Mapping[str, Any], tuple[str, str] | None]] = []
    inputs = info.get("input") or {}
    order = info.get("input_order") or {}
    names = [*(order.get("required") or []), *(order.get("optional") or [])] or [
        *(inputs.get("required") or {}),
        *(inputs.get("optional") or {}),
    ]
    for name in names:
        found = _spec(inputs, str(name))
        if found is None:
            continue
        spec_type, options = found
        if spec_type == DYNAMIC_COMBO:
            out.append((str(name), spec_type, options, None))
            for option in options.get("options") or []:
                if not isinstance(option, Mapping):
                    continue
                nested = option.get("inputs") or {}
                for section in ("required", "optional"):
                    for child, child_spec in (nested.get(section) or {}).items():
                        child_spec = (
                            list(child_spec) if isinstance(child_spec, (list, tuple)) else [child_spec]
                        )
                        child_options = (
                            child_spec[1]
                            if len(child_spec) > 1 and isinstance(child_spec[1], Mapping)
                            else {}
                        )
                        if is_widget(child_spec[0], child_options):
                            out.append(
                                (
                                    f"{name}.{child}",
                                    child_spec[0],
                                    child_options,
                                    (str(name), str(option.get("key"))),
                                )
                            )
            continue
        if is_widget(spec_type, options):
            out.append((str(name), spec_type, options, None))
    return out


def _node_fields(
    workflow: Mapping[str, Any],
    node: Mapping[str, Any],
    info: NodeInfo,
    prefix: str,
    *,
    group: str,
    fixed: Mapping[str, Any] | None = None,
) -> list[Field]:
    """The fields of one node's widgets. ``prefix``: ``""`` for the brief (and the release), else ``"<name>."``."""
    values = decode_widgets(info, list(node.get("widgets_values") or []))
    linked = {
        str(e.get("name"))
        for e in node.get("inputs") or []
        if isinstance(e, Mapping) and e.get("link") is not None
    }
    title = node_title(node, info)
    merged: dict[str, dict[str, Any]] = {}
    for name, spec_type, options, belongs in _widget_specs(info):
        if name in linked or name.split(".")[0] in linked:
            continue  # set by the graph, not by a value
        short = name.rsplit(".", 1)[-1] if belongs and not prefix else name
        field_id = prefix + (short if belongs else name)
        entry = merged.get(field_id)
        if entry is None:
            entry = merged[field_id] = {
                "names": [],
                "spec_type": spec_type,
                "options": options,
                "when": {},
                "defaults": {},
            }
        if name not in entry["names"]:
            entry["names"].append(name)
        if belongs:
            parent, choice = belongs
            entry["when"].setdefault(prefix + parent, []).append(choice)
            entry["defaults"][choice] = options.get("default", "")
    fields: list[Field] = []
    for field_id, entry in merged.items():
        spec_type, options = entry["spec_type"], entry["options"]
        names = entry["names"]
        current = next((values[n] for n in names if n in values), None)
        if current is None:
            when = entry["when"]
            chosen = values.get(next(iter(when)).removeprefix(prefix)) if when else None
            current = entry["defaults"].get(str(chosen), options.get("default", ""))
        kind = "widget"
        is_fixed = bool(fixed and names[0] in fixed)
        if is_fixed:
            kind = "fixed"
            current = fixed[names[0]] if fixed else current
        field_type = _field_type(spec_type, options)
        fields.append(
            Field(
                id=field_id,
                kind=kind,
                type=field_type,
                label=_label(names[0], options),
                description=str(options.get("tooltip") or "")
                or (UPLOAD_DESCRIPTION if field_type == "upload" else ""),
                default=current,
                node=int(node["id"]),
                node_type=str(node.get("type")),
                node_title=title,
                group=group,
                input=names[0],
                inputs=tuple(names),
                choices=_choices(spec_type, options),
                minimum=_number(options.get("min")),
                maximum=_number(options.get("max")),
                step=_number(options.get("step")),
                when=tuple((parent, tuple(choices)) for parent, choices in entry["when"].items()),
                defaults=tuple(entry["defaults"].items()) if len(entry["names"]) > 1 or entry["when"] else (),
                fixed=is_fixed,
                required=field_type == "upload" and not str(current or "").strip(),
                advanced=bool(options.get("advanced")),
            )
        )
    return fields


def _seed_name(title: str, taken: set[str]) -> str:
    base = _slug(re.sub(r"\bseed\b", "", title, flags=re.I)) or "seed"
    name, count = base, 1
    while name in taken:
        count += 1
        name = f"{base}_{count}"
    taken.add(name)
    return name


def load_template(name: str, workflow: Mapping[str, Any], info: InfoLookup) -> Template:
    """The API's view of a template (``extra.plenio_api`` must be there), with the node definitions of ``info``."""
    marker = (workflow.get("extra") or {}).get(MARKER)
    if not isinstance(marker, Mapping) or not marker.get("id"):
        raise SongApiError("unknown_template", f"The workflow {name!r} is not a Song API template.")
    brief = brief_node(workflow)
    if brief is None:
        raise SongApiError("unknown_template", f"The template {name!r} has no Song Brief or Cover Brief.")
    template_id = str(marker["id"])
    fields: list[Field] = []
    taken: set[str] = set()
    switch_done: set[str] = set()
    for node in song_nodes(workflow):
        node_type = str(node.get("type"))
        node_info = info(node_type)
        group = group_of(workflow, node)
        if node_info is None:
            continue  # a subgraph node or a node ComfyUI does not know: no fields of its own
        is_brief = node is brief
        prefix = "" if is_brief else f"{node_name(node, taken)}."
        fixed = {"mode": RUN_THROUGH[node_type]} if is_brief and node_type in RUN_THROUGH else None
        fields += _node_fields(workflow, node, node_info, prefix, group=group, fixed=fixed)
        title = node_title(node, node_info)
        if not is_brief and title.strip().lower().endswith(OPTIONAL_MARK):
            fields.append(
                Field(
                    id=f"{prefix}enabled",
                    kind="enabled",
                    type="boolean",
                    label=title.replace(OPTIONAL_MARK, "").strip(),
                    description=f"Whether the optional node {title!r} runs (bypassed when off).",
                    default=int(node.get("mode") or 0) != BYPASS,
                    node=int(node["id"]),
                    node_type=node_type,
                    node_title=title,
                    group=group,
                )
            )
        if node_type == "PlenioHQMastering":
            # the switches drawn as cards on this node (frontend: finishSwitch.ts)
            for switch, field_id in SWITCH_FIELDS.items():
                members = switch_nodes(workflow, switch)
                if not members or switch in switch_done:
                    continue
                switch_done.add(switch)
                label, text = SWITCH_TEXT.get(switch, (switch.replace("_", " ").title(), ""))
                fields.append(
                    Field(
                        id=field_id,
                        kind="switch",
                        type="boolean",
                        label=label,
                        description=text,
                        default=any(int(n.get("mode") or 0) != BYPASS for n in members),
                        node=int(node["id"]),
                        node_type=node_type,
                        node_title=title,
                        group=group,
                        switch=switch,
                    )
                )
    for switch, field_id in SWITCH_FIELDS.items():
        members = switch_nodes(workflow, switch)
        if members and switch not in switch_done:
            label, text = SWITCH_TEXT.get(switch, (switch.replace("_", " ").title(), ""))
            fields.append(
                Field(
                    id=field_id,
                    kind="switch",
                    type="boolean",
                    label=label,
                    description=text,
                    default=any(int(n.get("mode") or 0) != BYPASS for n in members),
                    node=int(members[0]["id"]),
                    node_type=str(members[0].get("type")),
                    node_title=str(members[0].get("title") or ""),
                    group=group_of(workflow, members[0]),
                    switch=switch,
                )
            )
    release: list[Field] = []
    export = next((n for n in _top_nodes(workflow) if n.get("type") == EXPORT_TYPE), None)
    if export is not None and (export_info := info(EXPORT_TYPE)) is not None:
        release = _node_fields(workflow, export, export_info, "", group=group_of(workflow, export))
    seeds: list[Seed] = []
    seed_names: set[str] = set()
    for node in _top_nodes(workflow):
        if node.get("type") != SEED_TYPE:
            continue
        values = list(node.get("widgets_values") or [0, False])
        seeds.append(
            Seed(
                id=_seed_name(str(node.get("title") or "seed"), seed_names),
                node=int(node["id"]),
                title=str(node.get("title") or "Seed"),
                value=int(values[0]) if values and isinstance(values[0], int) else 0,
                keep=bool(values[1]) if len(values) > 1 else False,
            )
        )
    owners = sheet_owners(workflow)
    return Template(
        id=template_id,
        kind=str(marker.get("kind") or BRIEF_TYPES[str(brief.get("type"))]),
        name=name,
        workflow=workflow,
        fields=tuple(fields),
        release=tuple(release),
        seeds=tuple(seeds),
        sheets=tuple((kind, owners[kind]) for kind in DOCUMENT_KINDS if kind in owners),
    )


def sheet_owners(workflow: Mapping[str, Any]) -> dict[str, int]:
    """Which Song Sheet keeps each document: kind -> the node id of the sheet whose input of that name is linked
    (the draft comes from upstream there)."""
    owners: dict[str, int] = {}
    for node in _top_nodes(workflow):
        if node.get("type") != SHEET_TYPE:
            continue
        for slot in node.get("inputs") or []:
            name = slot.get("name") if isinstance(slot, Mapping) else None
            if name in DOCUMENT_KINDS and slot.get("link") is not None:
                owners.setdefault(str(name), int(node["id"]))
    return owners


def switch_nodes(workflow: Mapping[str, Any], switch: str) -> list[Mapping[str, Any]]:
    return [n for n in _top_nodes(workflow) if (n.get("properties") or {}).get("plenio_switch") == switch]


def api_templates(workflows: Mapping[str, Mapping[str, Any]]) -> dict[str, tuple[str, Mapping[str, Any]]]:
    """The workflows the API runs, by template id: ``id -> (workflow name, workflow)``."""
    found: dict[str, tuple[str, Mapping[str, Any]]] = {}
    for name, workflow in workflows.items():
        marker = (workflow.get("extra") or {}).get(MARKER)
        if isinstance(marker, Mapping) and marker.get("id") and brief_node(workflow) is not None:
            found[str(marker["id"])] = (name, workflow)
    return found


# --- a request ----------------------------------------------------------------------------------------------


@dataclass
class Prepared:
    """A request made ready: the workflow to keep, the prompt to queue, what was set."""

    template: Template
    workflow: dict[str, Any]
    prompt: dict[str, dict[str, Any]]
    fields: dict[str, Any]
    release: dict[str, Any]
    seeds: dict[str, int]
    warnings: list[str] = field(default_factory=list)
    documents: list[str] = field(default_factory=list)
    """The documents given (kept as manual in the sheets)."""


def _coerce(field: Field, value: Any) -> Any:
    """``value`` checked (and made exact: a choice's case, a length in seconds) for ``field``; raises."""

    def wrong(message: str, hint: str = "") -> SongApiError:
        return SongApiError("invalid_value", message, hint=hint, field=field.id)

    if field.type in ("string", "text", "upload"):
        if not isinstance(value, str):
            raise wrong(f"The field {field.id!r} takes text.")
        limit = TEXT_LIMIT if field.type == "text" else LINE_LIMIT
        if len(value) > limit:
            raise wrong(f"The field {field.id!r} takes at most {limit} characters.")
        if any(ord(c) < 32 and c not in "\n\t\r" for c in value) or (
            field.type != "text" and "\n" in value.strip()
        ):
            raise wrong(f"The field {field.id!r} takes one line of text without control characters.")
        return value
    if field.type == "boolean":
        if isinstance(value, bool):
            return value
        if isinstance(value, str) and value.strip().lower() in ("true", "false"):
            return value.strip().lower() == "true"
        raise wrong(f"The field {field.id!r} takes true or false.")
    if field.type in ("integer", "number"):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise wrong(f"The field {field.id!r} takes a number.")
        if field.type == "integer":
            if float(value) != int(value):
                raise wrong(f"The field {field.id!r} takes a whole number.")
            value = int(value)
        if (
            field.minimum is not None
            and value < field.minimum
            or field.maximum is not None
            and value > field.maximum
        ):
            raise wrong(
                f"The field {field.id!r} takes a number from {field.minimum:g} to {field.maximum:g}."
                if field.minimum is not None and field.maximum is not None
                else f"The field {field.id!r} is out of range."
            )
        return value
    if field.type == "choice":
        if field.node_type == "PlenioSongBrief" and field.input == "length" and not isinstance(value, bool):
            if isinstance(value, (int, float)):
                value = f"{value} s"
            if isinstance(value, str) and value not in field.choices:
                try:
                    value = brief_rules.resolve_length(value)[0]
                except PlenioUserError as error:
                    raise wrong(error.message, hint=f"One of {list(field.choices)}, or seconds.") from error
        if not isinstance(value, str):
            raise wrong(
                f"The field {field.id!r} takes one of its choices.",
                hint=f"Choices: {list(field.choices)[:40]}",
            )
        if field.choices and value not in field.choices:
            exact = next((c for c in field.choices if c.casefold() == value.casefold()), None)
            if exact is None:
                raise wrong(
                    f"{value!r} is not a choice of the field {field.id!r}.",
                    hint=f"Choices: {list(field.choices)[:40]}",
                )
            value = exact
        return value
    return value


def _release_folder(value: str) -> str:
    """The release folder: a path below ComfyUI's output folder, never outside it."""
    text = value.strip().replace("\\", "/")
    if (
        not text
        or text.startswith("/")
        or re.match(r"^[A-Za-z]:", text)
        or any(p in ("..", ".") for p in text.split("/"))
    ):
        raise SongApiError(
            "invalid_value",
            "The release folder is a folder below ComfyUI's output folder, like 'plenio/Party-Songs'.",
            field="release.folder",
        )
    return text.strip("/")


def _set_widgets(workflow: dict[str, Any], node_id: int, info: NodeInfo, changes: Mapping[str, Any]) -> None:
    """Write ``changes`` (input name -> value) into the node's ``widgets_values``; a DynamicCombo's new choice gets
    its own widgets, and the node's input slots follow (the workflow opens in ComfyUI as it ran)."""
    node = next(n for n in workflow["nodes"] if int(n.get("id", -1)) == node_id)
    before = list(node.get("widgets_values") or [])
    named = decode_widgets(info, before)
    # a DynamicCombo set to another choice: its new widgets start from their defaults (as the frontend makes them)
    for widget in widget_layout(info, before):
        if (
            widget.spec_type == DYNAMIC_COMBO
            and widget.name in changes
            and changes[widget.name] != named.get(widget.name)
        ):
            for key in [k for k in named if k.startswith(widget.name + ".") and k not in changes]:
                del named[key]
    named.update(changes)
    after = encode_widgets(info, named)
    node["widgets_values"] = after
    old = {w.name for w in widget_layout(info, before) if not w.control}
    new_layout = [w for w in widget_layout(info, after) if not w.control]
    new = {w.name for w in new_layout}
    if old == new:
        return
    # the input slots of a DynamicCombo's widgets: the old choice's out, the new choice's in after the combo
    slots = [
        s
        for s in node.get("inputs") or []
        if not (isinstance(s, Mapping) and s.get("widget") and s.get("name") in old - new)
    ]
    names = {str(s.get("name")) for s in slots if isinstance(s, Mapping)}
    for widget in new_layout:
        if widget.name in names or widget.name not in new - old:
            continue
        parent = widget.name.rsplit(".", 1)[0]
        at = next(
            (k for k, s in enumerate(slots) if isinstance(s, Mapping) and s.get("name") == parent),
            len(slots) - 1,
        )
        while at + 1 < len(slots) and str(slots[at + 1].get("name", "")).startswith(parent + "."):
            at += 1
        spec_type = widget.spec_type if isinstance(widget.spec_type, str) else "COMBO"
        slots.insert(
            at + 1,
            {
                "localized_name": widget.name,
                "name": widget.name,
                "type": spec_type,
                "widget": {"name": widget.name},
                "link": None,
            },
        )
        names.add(widget.name)
    node["inputs"] = slots


BRIEF_TEXT_INPUTS = {
    "description": "description",
    "genre": "genre",
    "mood": "mood",
    "tempo": "tempo",
    "key": "key",
    "meter": "meter",
    "language": "vocals.language",
    "voice": "vocals.voice",
    "theme": "vocals.theme",
    "lyrics": "vocals.lyrics",
    "lead_instrument": "vocals.lead_instrument",
}
"""A brief's text fields and their widgets (a vocals choice's inputs are named ``vocals.<input>``)."""

StyleLookup = Callable[[str], brief_rules.Template | None]


def _fill_from_template(
    workflow: dict[str, Any],
    brief: Mapping[str, Any],
    brief_info: NodeInfo,
    before: Mapping[str, Any],
    given: Mapping[str, Any],
    styles: StyleLookup,
) -> None:
    """The brief's text fields as ComfyUI shows them (1.5.0, owner's request 2026-10-31): a field left empty holds the
    style template's value, and another template (or none) replaces the values the old one had filled - a value the
    request gives stays. The run reads the same either way (an empty field takes the template's value); the workflow kept
    with the song shows what it was made of. Own lyrics are never filled."""
    named = decode_widgets(brief_info, list(brief.get("widgets_values") or []))
    style = styles(str(named.get("template") or "none"))
    old = (
        styles(str(before.get("template") or "none"))
        if before.get("template") != named.get("template")
        else None
    )
    if style is None and old is None:
        return
    cover = brief.get("type") == "PlenioCoverBrief"
    names = (
        brief_rules.cover_text_fields(str(named.get("vocals") or "")) if cover else tuple(BRIEF_TEXT_INPUTS)
    )
    fills: dict[str, Any] = {}
    for name in names:
        widget = BRIEF_TEXT_INPUTS.get(name)
        if widget is None or widget not in named or str(given.get(widget) or "").strip():
            continue
        if name == "lyrics" and named.get("vocals.lyrics_from") == brief_rules.OWN_LYRICS:
            continue
        value = str(named[widget] or "")
        if value.strip() and (old is None or value != old.fields.get(name)):
            continue
        filled = style.fields.get(name, "") if style is not None else ""
        if filled != value:
            fills[widget] = filled
    if fills:
        _set_widgets(workflow, int(brief.get("id", -1)), brief_info, fills)


def _effective(field: Field, given: Mapping[str, Any]) -> Any:
    return given[field.id] if field.id in given else field.default


def prepare(
    template: Template,
    request: Mapping[str, Any],
    info: InfoLookup,
    *,
    rng: random.Random | None = None,
    styles: StyleLookup | None = None,
) -> Prepared:
    """Check a job request (``fields``, ``release``, ``seeds``, ``strict``) and make the workflow and the prompt.
    ``styles`` finds a style template by its id: the brief's empty text fields then show its values, as ComfyUI does."""
    rng = rng or random.Random()
    strict = request.get("strict", True) is not False
    warnings: list[str] = []
    raw_fields = request.get("fields") or {}
    raw_release = request.get("release") or {}
    raw_seeds = request.get("seeds") or {}
    raw_documents = request.get("documents") or {}
    for name, value in (
        ("fields", raw_fields),
        ("release", raw_release),
        ("seeds", raw_seeds),
        ("documents", raw_documents),
    ):
        if not isinstance(value, Mapping):
            raise SongApiError("bad_request", f"'{name}' is an object of names and values.", field=name)
    aliases = FIELD_ALIASES.get(template.id, {})
    by_id = {f.id: f for f in template.fields}
    given: dict[str, Any] = {}
    for name, value in raw_fields.items():
        key = aliases.get(str(name), str(name))
        found = by_id.get(key)
        if found is None:
            if strict:
                raise SongApiError(
                    "unknown_field",
                    f"The template {template.id!r} has no field {name!r}.",
                    hint=f"Its fields: {', '.join(sorted(by_id))}.",
                    field=str(name),
                )
            warnings.append(f"no field {name!r} - left out")
            continue
        if found.fixed:
            if value != found.default:
                raise SongApiError(
                    "not_supported",
                    f"The field {name!r} is {found.default!r} in API v1.",
                    hint="Review stops (a run that waits at the Song Sheets) are not supported by the API yet.",
                    field=str(name),
                )
            continue
        given[key] = _coerce(found, value)
    release_by_id = {f.id: f for f in template.release}
    release: dict[str, Any] = {}
    for name, value in raw_release.items():
        found = release_by_id.get(str(name))
        if found is None:
            if strict:
                raise SongApiError(
                    "unknown_field",
                    f"The release has no field {name!r}.",
                    hint=f"Its fields: {', '.join(sorted(release_by_id))}.",
                    field=f"release.{name}",
                )
            warnings.append(f"no release field {name!r} - left out")
            continue
        coerced = _coerce(found, value)
        release[found.id] = _release_folder(coerced) if found.input == "folder" else coerced
    # the fields that do not apply to the choices made (a voice for an instrumental) are left out
    for field_id in list(given):
        found = by_id[field_id]
        for parent, choices in found.when:
            chosen = _effective(by_id[parent], given) if parent in by_id else None
            if chosen is not None and chosen not in choices:
                warnings.append(f"{field_id!r} does not apply when {parent!r} is {chosen!r} - left out")
                given.pop(field_id)
                break
    for field_id in list(release):
        found = release_by_id[field_id]
        for parent, choices in found.when:
            if (
                parent not in release
                and release_by_id.get(parent)
                and release_by_id[parent].default not in choices
            ):
                release[parent] = choices[0]
                warnings.append(f"release {parent!r} set to {choices[0]!r} for {field_id!r}")
    documents = _documents(template, raw_documents, strict, warnings)
    missing = [f.id for f in template.fields if f.required and not str(given.get(f.id) or "").strip()]
    if missing:
        raise SongApiError(
            "missing_field",
            f"The template {template.id!r} needs {', '.join(repr(m) for m in missing)}.",
            hint="A cover needs its source recording: upload it (POST /uploads) and name it in 'source.audio'.",
            field=missing[0],
        )
    workflow = copy.deepcopy(dict(template.workflow))
    # the widgets, node by node (a node's fields together: a DynamicCombo's choice with its inputs)
    per_node: dict[int, dict[str, Any]] = {}
    for found in template.fields:
        if found.kind == "fixed":
            per_node.setdefault(found.node, {})[found.input] = found.default
        if found.kind != "widget" or found.id not in given:
            continue
        # a field of several inputs (two DynamicCombos with an input of one name): every one of them - the
        # node's layout takes those of the choices made
        for name in found.inputs:
            per_node.setdefault(found.node, {})[name] = given[found.id]
    for found in template.release:
        if found.id in release:
            per_node.setdefault(found.node, {})[found.input] = release[found.id]
    brief = brief_node(workflow)
    brief_info = info(str(brief.get("type"))) if brief is not None else None
    before = (
        decode_widgets(brief_info, list(brief.get("widgets_values") or [])) if brief and brief_info else {}
    )
    for node_id, changes in per_node.items():
        node = next(n for n in workflow["nodes"] if int(n.get("id", -1)) == node_id)
        node_info = info(str(node.get("type")))
        if node_info is not None:
            _set_widgets(workflow, node_id, node_info, changes)
    if styles is not None and brief is not None and brief_info is not None:
        given_brief = per_node.get(int(brief.get("id", -1))) or {}
        _fill_from_template(workflow, brief, brief_info, before, given_brief, styles)
    # the documents given: manual in the sheets that keep them (the run keeps them instead of drafting anew)
    sheet_info = info(SHEET_TYPE) if documents else None
    for kind, node_id in template.sheets:
        if kind not in documents or sheet_info is None:
            continue
        node = next(n for n in workflow["nodes"] if int(n.get("id", -1)) == node_id)
        state = _sheet_state(
            decode_widgets(sheet_info, list(node.get("widgets_values") or [])).get("sheet_state")
        )
        state["docs"][kind] = {"state": "manual", "text": documents[kind]}
        _set_widgets(
            workflow,
            node_id,
            sheet_info,
            {"sheet_state": json.dumps(state, ensure_ascii=False, separators=(",", ":"))},
        )
    # switches and optional nodes: run (0) or bypassed (4)
    for found in template.fields:
        if found.kind not in ("switch", "enabled") or found.id not in given:
            continue
        mode = 0 if given[found.id] else BYPASS
        targets = (
            switch_nodes(workflow, found.switch)
            if found.kind == "switch"
            else [n for n in workflow["nodes"] if int(n.get("id", -1)) == found.node]
        )
        for node in targets:
            if isinstance(node, dict):
                node["mode"] = mode
    # the seeds: given, drawn anew (a seed set to a new one every run), or kept
    by_seed = {s.id: s for s in template.seeds}
    seeds: dict[str, int] = {}
    for name, value in raw_seeds.items():
        if name not in by_seed:
            raise SongApiError(
                "unknown_field",
                f"The template has no seed {name!r}.",
                hint=f"Its seeds: {sorted(by_seed)}.",
                field=f"seeds.{name}",
            )
        if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value < SEED_LIMIT:
            raise SongApiError(
                "invalid_value",
                f"The seed {name!r} is a whole number from 0 to {SEED_LIMIT - 1}.",
                field=f"seeds.{name}",
            )
    for seed in template.seeds:
        node = next(n for n in workflow["nodes"] if int(n.get("id", -1)) == seed.node)
        values = list(node.get("widgets_values") or [0, False])
        if seed.id in raw_seeds:
            values[0] = int(raw_seeds[seed.id])
        elif not seed.keep and not _seed_linked(node):
            values[0] = rng.randrange(SEED_LIMIT)
        node["widgets_values"] = values
        seeds[seed.id] = int(values[0])
    randomise_controls(workflow, info, rng)
    prompt = to_prompt(workflow, info, rng=rng)
    return Prepared(
        template=template,
        workflow=workflow,
        prompt=prompt,
        fields={**{f.id: f.default for f in template.fields if f.kind != "fixed"}, **given},
        release=release,
        seeds=seeds,
        warnings=warnings,
        documents=sorted(documents, key=DOCUMENT_KINDS.index),
    )


def _documents(
    template: Template, raw: Mapping[str, Any], strict: bool, warnings: list[str]
) -> dict[str, str]:
    """The documents of a request, checked: kinds the template's sheets keep, text (an empty one is left to the
    sheet)."""
    kept = dict(template.sheets)
    out: dict[str, str] = {}
    for kind, text in raw.items():
        if kind not in kept:
            if strict:
                raise SongApiError(
                    "unknown_field",
                    f"The template {template.id!r} keeps no document {kind!r}.",
                    hint=f"Its documents: {', '.join(template.documents)}.",
                    field=f"documents.{kind}",
                )
            warnings.append(f"no document {kind!r} - left out")
            continue
        if not isinstance(text, str):
            raise SongApiError("invalid_value", f"The document {kind!r} is text.", field=f"documents.{kind}")
        if len(text) > DOCUMENT_LIMIT:
            raise SongApiError(
                "invalid_value",
                f"The document {kind!r} takes at most {DOCUMENT_LIMIT} characters.",
                field=f"documents.{kind}",
            )
        if any(ord(c) < 32 and c not in "\n\t\r" for c in text):
            raise SongApiError(
                "invalid_value",
                f"The document {kind!r} has control characters.",
                field=f"documents.{kind}",
            )
        if text.strip():
            out[str(kind)] = text
    return out


def _sheet_state(value: Any) -> dict[str, Any]:
    """A Song Sheet's state as the template has it (an empty one: none yet), ready to take documents."""
    try:
        state = json.loads(value) if isinstance(value, str) and value.strip() else {}
    except ValueError:
        state = {}
    state = dict(state) if isinstance(state, Mapping) else {}
    state["schema"] = SHEET_STATE_SCHEMA
    docs = state.get("docs")
    state["docs"] = dict(docs) if isinstance(docs, Mapping) else {}
    return state


# --- a record back into a request -----------------------------------------------------------------------


def _is_link(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 2
        and isinstance(value[0], str)
        and isinstance(value[1], int)
        and not isinstance(value[1], bool)
    )


def _prompt_node(
    prompt: Mapping[str, Any], node_type: str, title: str, *, unique: bool = True
) -> Mapping[str, Any] | None:
    """The prompt's node of a template node: the one of its class and title - one of the workflow's own (not inside
    a block) first; by its class alone only when the template has one node of that class (``unique``: a seed is
    one of several - a bypassed one is not in the prompt, and another must not stand in for it)."""
    found = [
        (str(node_id), node)
        for node_id, node in prompt.items()
        if isinstance(node, Mapping) and node.get("class_type") == node_type
    ]
    titled = [(i, n) for i, n in found if str((n.get("_meta") or {}).get("title") or "") == title]
    pools = [[n for i, n in titled if ":" not in i], [n for _, n in titled]]
    if unique:
        pools += [[n for i, n in found if ":" not in i]]
    for pool in pools:
        if pool:
            return pool[0]
    return None


def _unique(template: Template, node_type: str) -> bool:
    return sum(1 for n in _top_nodes(template.workflow) if n.get("type") == node_type) <= 1


def _prompt_value(node: Mapping[str, Any] | None, names: Iterable[str]) -> tuple[bool, Any]:
    inputs = (node or {}).get("inputs") or {}
    for name in names:
        if name in inputs and not _is_link(inputs[name]):
            return True, inputs[name]
    return False, None


def model_of(record: Mapping[str, Any]) -> str:
    """The music model a record's song was made with (``""``: none - a file finished, not made)."""
    classes = {
        str(n.get("class_type") or "")
        for n in (record.get("prompt") or {}).values()
        if isinstance(n, Mapping)
    }
    for start, name in MODELS:
        if any(c.startswith(start) for c in classes):
            return name
    return ""


def template_for_record(templates: Mapping[str, Template], record: Mapping[str, Any]) -> Template | None:
    """The API's template for a record: the one its workflow names, else one of its brief's kind."""
    marker = ((record.get("workflow") or {}).get("extra") or {}).get(MARKER)
    if isinstance(marker, Mapping) and str(marker.get("id")) in templates:
        return templates[str(marker["id"])]
    classes = {n.get("class_type") for n in (record.get("prompt") or {}).values() if isinstance(n, Mapping)}
    kind = next((k for brief, k in BRIEF_TYPES.items() if brief in classes), None)
    if kind is None:
        return None
    return next((t for t in templates.values() if t.kind == kind), None)


def request_from_record(template: Template, record: Mapping[str, Any]) -> dict[str, Any]:
    """The request that makes a record's song again with ``template``: the fields, release fields and seeds as the
    record's prompt has them, and its documents. A value the template no longer takes is left out (said in
    ``warnings``); ``take`` says whether the documents make a new take with this template.

    Sent as it is, the request makes the song again (the same documents, seeds and settings); without ``seeds.take``
    a new take of it; without the documents and the seeds a new song of the same brief."""
    found_prompt = record.get("prompt")
    prompt: Mapping[str, Any] = found_prompt if isinstance(found_prompt, Mapping) else {}
    warnings: list[str] = []
    fields: dict[str, Any] = {}
    files = [f for f in record.get("files") or [] if isinstance(f, Mapping)]
    for found in template.fields:
        if found.kind == "fixed":
            continue
        value: Any
        if found.kind == "switch":
            members = switch_nodes(template.workflow, found.switch)
            ran = any(
                _prompt_node(
                    prompt,
                    str(m.get("type")),
                    str(m.get("title") or ""),
                    unique=_unique(template, str(m.get("type"))),
                )
                is not None
                for m in members
            )
            value = ran or (found.switch == "cover" and any(f.get("role") == "cover" for f in files))
        elif found.kind == "enabled":
            value = (
                _prompt_node(
                    prompt, found.node_type, found.node_title, unique=_unique(template, found.node_type)
                )
                is not None
            )
        else:
            node = _prompt_node(
                prompt, found.node_type, found.node_title, unique=_unique(template, found.node_type)
            )
            has, value = _prompt_value(node, found.inputs)
            if not has:
                continue
        try:
            fields[found.id] = _coerce(found, value)
        except SongApiError as error:
            warnings.append(f"{found.id}: {error.message} - the template's value instead")
    release: dict[str, Any] = {}
    export = _prompt_node(prompt, EXPORT_TYPE, "")
    for found in template.release:
        has, value = _prompt_value(export, found.inputs)
        if not has:
            continue
        try:
            release[found.id] = _coerce(found, value)
        except SongApiError as error:
            warnings.append(f"release {found.id}: {error.message} - the template's value instead")
    seeds: dict[str, int] = {}
    for seed in template.seeds:
        has, value = _prompt_value(
            _prompt_node(prompt, SEED_TYPE, seed.title, unique=_unique(template, SEED_TYPE)), ("seed",)
        )
        if has and isinstance(value, int) and not isinstance(value, bool) and 0 <= value < SEED_LIMIT:
            seeds[seed.id] = value
    texts = {
        str(kind): str(doc["text"])
        for kind, doc in (record.get("documents") or {}).items()
        if isinstance(doc, Mapping) and isinstance(doc.get("text"), str) and doc["text"].strip()
    }
    documents = {kind: texts[kind] for kind in template.documents if kind in texts}
    model = model_of(record)
    needed = [kind for kind in ("style", "lyrics", "score") if kind in template.documents]
    why = ""
    if model != "YuE2":
        why = (
            f"It was made with {model} - a new take here is YuE2's."
            if model
            else "It was not made by a music model - it was finished from a file."
        )
    elif lacking := [kind for kind in needed if kind not in documents]:
        why = f"Its record has no {' and no '.join(lacking)}."
    elif template.field("source.audio") is not None and not str(fields.get("source.audio") or "").strip():
        why = "Its record names no original recording."
    return {
        "template": template.id,
        "kind": template.kind,
        "title": str(record.get("title") or ""),
        "model": model,
        "fields": fields,
        "release": release,
        "seeds": seeds,
        "documents": documents,
        "take": {"possible": not why, "why": why},
        "warnings": warnings,
    }


def _seed_linked(node: Mapping[str, Any]) -> bool:
    return any(
        isinstance(slot, Mapping) and slot.get("name") == "seed" and slot.get("link") is not None
        for slot in node.get("inputs") or []
    )


# --- the stages of a run ----------------------------------------------------------------------------------


def stage_of(workflow: Mapping[str, Any], node_id: Any) -> str:
    """The template group of the node that runs (``"4:501"`` -> the group of node 4): where the run is."""
    head = str(node_id or "").split(":", 1)[0]
    node = next((n for n in _top_nodes(workflow) if str(n.get("id")) == head), None)
    return group_of(workflow, node) if node is not None else ""


# --- the style templates' values (the lists of a simple form) ---------------------------------------------


def brief_values(templates: Iterable[brief_rules.Template], names: Sequence[str]) -> dict[str, list[str]]:
    """Per field, every value the style templates have (once, sorted), for a form's lists."""
    found: dict[str, dict[str, str]] = {name: {} for name in names}
    for template in templates:
        for name in names:
            value = " ".join(str(template.fields.get(name) or "").split())
            if value and name != "description":
                found[name].setdefault(value.casefold(), value)
    return {name: sorted(values.values(), key=str.casefold) for name, values in found.items()}


def control_key(name: str) -> str:
    return name + CONTROL


__all__ = [
    "API_NAME",
    "API_VERSION",
    "Field",
    "Prepared",
    "Seed",
    "SongApiError",
    "Template",
    "api_templates",
    "brief_values",
    "default_choice",
    "group_of",
    "load_template",
    "model_of",
    "prepare",
    "request_from_record",
    "sheet_owners",
    "song_nodes",
    "stage_of",
    "template_for_record",
]
