"""Continue a song from its release record (``<name>.plenio.json``; owner's request 2026-10-11).

Export Release writes a record next to every song: the documents it was made with (title, style, lyrics,
score, artwork prompt), the reports and the API prompt it was queued with - and, since 0.6.0, the
workflow itself. Opening a record again restores the workflow the song came from and puts the song's
documents into its Song Sheets as *manual*: the next run keeps them instead of writing and planning anew, so
work goes on where it stopped - new takes with another take seed, the score edited in the editor, the
lyrics given back to the writer with *Back to auto*.

The workflow is the record's own (exact: every setting, the editor's lyrics lines and Guide notes) or, for
records made before it was stored, the shipped template whose nodes the prompt matches, with the prompt's
settings to apply by node and input name. A workflow of one's own without a stored copy cannot be rebuilt;
its documents can still go into the Song Sheets of the open workflow. The frontend applies the result
(``frontend/src/extension/continueSong.ts``); this module decides what it is, without ComfyUI.
"""

from __future__ import annotations

import json
import re
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .errors import PlenioUserError
from .release import RECORD_SCHEMA, redact, secret_inputs
from .sheet import DOCUMENT_KINDS, SHEET_STATE_SCHEMA

CONTINUATION_SCHEMA = "plenio.continuation/1"
REDACTED = "<redacted>"
MIN_PLACED = 0.6
"""The share of the prompt's nodes a template must hold to rebuild a record from it (a template changes
between versions: an old record's nodes that are no longer there are named, not guessed)."""
SHEET_NODE = "PlenioSongSheet"
_EXECUTION_ID = re.compile(r"^\d+(?::\d+)*$")


def is_link(value: Any) -> bool:
    """An input of the API prompt that comes from another node: ``[node id, output slot]``."""
    return (
        isinstance(value, list)
        and len(value) == 2
        and isinstance(value[0], str)
        and isinstance(value[1], int)
        and not isinstance(value[1], bool)
    )


def literal_inputs(prompt: Mapping[str, Any]) -> dict[str, dict[str, Any]]:
    """The settings of every node of the prompt: its inputs that are values, not links (by execution id).

    Redacted secrets are left out (the workflow keeps its own), and so is the Song Sheet's state: the
    documents come from the record (:func:`sheet_states`).
    """
    values: dict[str, dict[str, Any]] = {}
    for node_id, node in prompt.items():
        if not isinstance(node, Mapping) or not isinstance(node.get("inputs"), Mapping):
            continue
        sheet = node.get("class_type") == SHEET_NODE
        kept = {
            name: value
            for name, value in node["inputs"].items()
            if not is_link(value)
            and not (sheet and name == "sheet_state")
            and not (isinstance(value, str) and REDACTED in value)
        }
        if kept:
            values[str(node_id)] = kept
    return values


@dataclass(frozen=True)
class WorkflowNode:
    id: str
    """The execution id (``"4"``, ``"4:501"``: node 501 of the subgraph that node 4 is an instance of)."""
    type: str
    """The node's class; a subgraph instance has the subgraph's id."""
    title: str | None
    """The title the workflow gives it (``None``: the node type's display name)."""
    mode: int
    """0 runs; 2 muted, 4 bypassed."""
    block: bool
    """A subgraph instance (it does not run itself; its inner nodes do)."""


def _subgraphs(workflow: Mapping[str, Any]) -> dict[str, Mapping[str, Any]]:
    definitions = workflow.get("definitions") or {}
    return {
        str(sub.get("id")): sub
        for sub in (definitions.get("subgraphs") or [])
        if isinstance(sub, Mapping) and isinstance(sub.get("nodes"), list)
    }


def workflow_nodes(workflow: Mapping[str, Any]) -> dict[str, WorkflowNode]:
    """Every node of a workflow by execution id, the nodes inside its subgraphs included."""
    subgraphs = _subgraphs(workflow)
    nodes: dict[str, WorkflowNode] = {}

    def walk(items: Iterable[Any], prefix: str, depth: int) -> None:
        for node in items:
            if not isinstance(node, Mapping) or "id" not in node:
                continue
            node_id = f"{prefix}{node['id']}"
            kind = str(node.get("type", ""))
            title = node.get("title")
            block = kind in subgraphs
            nodes[node_id] = WorkflowNode(
                node_id,
                kind,
                str(title) if isinstance(title, str) else None,
                int(node.get("mode") or 0),
                block,
            )
            if block and depth < 8:
                walk(subgraphs[kind]["nodes"], f"{node_id}:", depth + 1)

    walk(workflow.get("nodes") or [], "", 0)
    return nodes


def _prompt_nodes(prompt: Mapping[str, Any]) -> dict[str, tuple[str, str | None]]:
    """Execution id -> (class, title) of the prompt's nodes."""
    nodes: dict[str, tuple[str, str | None]] = {}
    for node_id, node in prompt.items():
        if isinstance(node, Mapping) and _EXECUTION_ID.match(str(node_id)):
            title = (node.get("_meta") or {}).get("title")
            nodes[str(node_id)] = (
                str(node.get("class_type", "")),
                str(title) if isinstance(title, str) else None,
            )
    return nodes


def _assign(
    wanted: Mapping[str, tuple[str, str | None, str]],
    pool: Mapping[str, WorkflowNode],
    mapping: dict[str, str],
) -> None:
    """Map prompt nodes (id -> class, title, the id they would have in ``pool``) onto ``pool``'s nodes of the
    same class, best evidence first: the same explicit title; the same id; the only node of the class
    without a title of its own (the prompt names it by the class's display name); the only one of the class."""
    used = set(mapping.values())

    def free(kind: str) -> list[str]:
        return [i for i, n in pool.items() if n.type == kind and not n.block and i not in used]

    def candidates(rule: int, kind: str, title: str | None, same: str) -> list[str]:
        nodes = free(kind)
        if rule == 0:
            return [i for i in nodes if title is not None and pool[i].title == title]
        if rule == 1:
            return [i for i in nodes if i == same and pool[i].title in (None, title)]
        if rule == 2:
            return [i for i in nodes if pool[i].title is None]
        return nodes

    for rule in range(4):
        for prompt_id, (kind, title, same) in wanted.items():
            if prompt_id in mapping:
                continue
            found = candidates(rule, kind, title, same)
            if len(found) == 1:
                mapping[prompt_id] = found[0]
                used.add(found[0])


def _held(
    nodes: Mapping[str, WorkflowNode], block: str, members: Mapping[str, tuple[str, str | None]]
) -> int:
    """How many of a prompt block's nodes (inner id -> class, title) the workflow's block holds."""
    return sum(
        1
        for rest, (kind, _title) in members.items()
        if (n := nodes.get(f"{block}:{rest}")) and n.type == kind
    )


def map_nodes(prompt: Mapping[str, Any], workflow: Mapping[str, Any]) -> dict[str, str]:
    """Prompt execution id -> the workflow node with the same role (its execution id).

    A template's node ids change between versions while its nodes keep their class and title (*Take seed*,
    *Song Sheet · Text*): the top-level nodes are found by those. The nodes of a block (``"12:501"``) go to
    the block instance of the workflow that holds most of them by inner id and class - the blocks' inner ids
    are fixed (501 ... in *Plenio · Write Song*) - and inside it by the same rules.
    """
    nodes = workflow_nodes(workflow)
    wanted = _prompt_nodes(prompt)
    mapping: dict[str, str] = {}
    top = {i: n for i, n in nodes.items() if ":" not in i}
    _assign({i: (kind, title, i) for i, (kind, title) in wanted.items() if ":" not in i}, top, mapping)
    groups: dict[str, dict[str, tuple[str, str | None]]] = {}
    for node_id, value in wanted.items():
        if ":" in node_id:
            prefix, rest = node_id.split(":", 1)
            groups.setdefault(prefix, {})[rest] = value
    taken: set[str] = set()
    for prefix in sorted(groups, key=lambda p: -len(groups[p])):
        members = groups[prefix]
        blocks = [i for i, n in top.items() if n.block and i not in taken]
        held = {block: _held(nodes, block, members) for block in blocks}
        scored = sorted(blocks, key=lambda b: (-held[b], b != prefix))
        if not scored or held[scored[0]] == 0:
            continue
        block = scored[0]
        taken.add(block)
        pool = {i: n for i, n in nodes.items() if i.startswith(f"{block}:")}
        _assign(
            {f"{prefix}:{rest}": (kind, title, f"{block}:{rest}") for rest, (kind, title) in members.items()},
            pool,
            mapping,
        )
    return mapping


def _link(value: Any) -> tuple[int, int, int, int] | None:
    """A subgraph link (origin id, origin slot, target id, target slot), stored as an object or a list."""
    if isinstance(value, Mapping):
        fields = [
            value.get("origin_id"),
            value.get("origin_slot"),
            value.get("target_id"),
            value.get("target_slot"),
        ]
    elif isinstance(value, list) and len(value) >= 5:
        fields = list(value[1:5])
    else:
        return None
    numbers = [f for f in fields if isinstance(f, int)]
    if len(numbers) != 4:
        return None
    return (numbers[0], numbers[1], numbers[2], numbers[3])


SUBGRAPH_INPUT_NODE = -10
"""The origin id of a link from a subgraph's inputs (LiteGraph)."""


def widget_inputs(workflow: Mapping[str, Any]) -> dict[tuple[str, str], tuple[str, str]]:
    """(inner execution id, input name) -> (block instance id, widget name) for the inner inputs whose value is
    a widget on their block's instance: a subgraph input shown as a widget and linked to nothing outside.
    Such an input takes the instance's value when the prompt is made - setting the inner node changes nothing
    (frontend 1.53.6, measured) - so a value for it is set on the instance."""
    subgraphs = _subgraphs(workflow)
    result: dict[tuple[str, str], tuple[str, str]] = {}
    for instance in workflow.get("nodes") or []:
        if not isinstance(instance, Mapping) or str(instance.get("type")) not in subgraphs:
            continue
        sub = subgraphs[str(instance["type"])]
        widgets = {
            str(slot.get("name"))
            for slot in instance.get("inputs") or []
            if isinstance(slot, Mapping) and slot.get("widget") and slot.get("link") is None
        }
        inner = {n.get("id"): n for n in sub["nodes"] if isinstance(n, Mapping)}
        links = {}
        for raw in sub.get("links") or []:
            parsed = _link(raw)
            link_id = (
                raw.get("id")
                if isinstance(raw, Mapping)
                else (raw[0] if isinstance(raw, list) and raw else None)
            )
            if parsed is not None and isinstance(link_id, int):
                links[link_id] = parsed
        for sub_input in sub.get("inputs") or []:
            name = str(sub_input.get("name")) if isinstance(sub_input, Mapping) else ""
            if name not in widgets:
                continue
            for link_id in sub_input.get("linkIds") or []:
                link = links.get(link_id)
                if link is None or link[0] != SUBGRAPH_INPUT_NODE or link[2] not in inner:
                    continue
                slots = inner[link[2]].get("inputs") or []
                if 0 <= link[3] < len(slots) and isinstance(slots[link[3]], Mapping):
                    target = f"{instance['id']}:{link[2]}"
                    result[(target, str(slots[link[3]].get("name")))] = (str(instance["id"]), name)
    return result


def place_values(
    values: Mapping[str, Mapping[str, Any]], workflow: Mapping[str, Any]
) -> dict[str, dict[str, Any]]:
    """The settings by the node (and input) that holds them in ``workflow``: an inner input fed by a widget
    of its block's instance (:func:`widget_inputs`) is set there."""
    fed = widget_inputs(workflow)
    placed: dict[str, dict[str, Any]] = {}
    for node_id, inputs in values.items():
        for name, value in inputs.items():
            holder, widget = fed.get((node_id, name), (node_id, name))
            placed.setdefault(holder, {})[widget] = value
    return placed


@dataclass(frozen=True)
class TemplateMatch:
    name: str
    mapping: Mapping[str, str]
    """Prompt execution id -> the template's node with the same role."""
    unplaced: tuple[str, ...]
    """The prompt's nodes the template has no place for (changed or removed since the record was made)."""


def match_template(
    prompt: Mapping[str, Any], templates: Mapping[str, Mapping[str, Any]]
) -> TemplateMatch | None:
    """The shipped template the prompt was queued from: the one with a place for most of its nodes, every
    Song Sheet and brief among them (``None`` when none has :data:`MIN_PLACED` of them - a workflow of one's
    own). On a tie the template listed first wins."""
    wanted = _prompt_nodes(prompt)
    if not wanted:
        return None
    essential = {i for i, (kind, _t) in wanted.items() if kind == SHEET_NODE or kind.endswith("Brief")}
    best: TemplateMatch | None = None
    for name in sorted(templates):
        mapping = map_nodes(prompt, templates[name])
        if not essential <= set(mapping) or len(mapping) < MIN_PLACED * len(wanted):
            continue
        if best is None or len(mapping) > len(best.mapping):
            best = TemplateMatch(name, mapping, tuple(i for i in wanted if i not in mapping))
    return best


def _queued_state(prompt: Mapping[str, Any], node_id: str) -> Mapping[str, Any]:
    node = prompt.get(node_id)
    value = node.get("inputs", {}).get("sheet_state") if isinstance(node, Mapping) else None
    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, Mapping) else {}
    return value if isinstance(value, Mapping) else {}


def documents(record: Mapping[str, Any]) -> dict[str, str]:
    """The record's documents by kind (for a workflow that cannot be rebuilt: the open workflow's sheets)."""
    return {
        kind: str(doc["text"])
        for kind, doc in (record.get("documents") or {}).items()
        if isinstance(doc, Mapping) and isinstance(doc.get("text"), str) and doc["text"].strip()
    }


def sheet_documents(record: Mapping[str, Any]) -> dict[str, dict[str, str]]:
    """The documents of each Song Sheet of the record's prompt (its execution id): those its report names
    (reports carry the sheet's id since 0.4.5), otherwise those it owned by its inputs - a document input
    that was linked, or a document of the state it was queued with."""
    prompt = record.get("prompt") or {}
    texts = documents(record)
    reported: dict[str, dict[str, str]] = {}
    for report in record.get("reports") or []:
        if not isinstance(report, Mapping) or report.get("kind") != "song_sheet":
            continue
        data = report.get("data") or {}
        docs = data.get("documents") or {}
        if data.get("node_id") and isinstance(docs, Mapping):
            reported[str(data["node_id"])] = {
                kind: str(doc["text"])
                for kind, doc in docs.items()
                if isinstance(doc, Mapping) and isinstance(doc.get("text"), str) and doc["text"].strip()
            }
    result: dict[str, dict[str, str]] = {}
    for node_id, node in prompt.items():
        if not isinstance(node, Mapping) or node.get("class_type") != SHEET_NODE:
            continue
        if str(node_id) in reported:
            result[str(node_id)] = reported[str(node_id)]
            continue
        inputs = node.get("inputs") or {}
        queued = _queued_state(prompt, str(node_id)).get("docs") or {}
        owned = [kind for kind in DOCUMENT_KINDS if is_link(inputs.get(kind)) or kind in queued]
        result[str(node_id)] = {kind: texts[kind] for kind in owned if kind in texts}
    return result


def sheet_states(record: Mapping[str, Any], mapping: Mapping[str, str] | None = None) -> dict[str, str]:
    """The Song Sheets' states that keep the song's documents, by the workflow node they go to (``mapping``;
    ``None``: the record's own workflow, the same ids): every document of the sheet as *manual*. The approval
    the sheet was queued with stays - it holds while the documents are the ones approved (the backend
    compares the fingerprint)."""
    prompt = record.get("prompt") or {}
    states: dict[str, str] = {}
    for node_id, docs in sheet_documents(record).items():
        target = node_id if mapping is None else mapping.get(node_id)
        if target is None or not docs:
            continue
        state: dict[str, Any] = {
            "schema": SHEET_STATE_SCHEMA,
            "docs": {kind: {"state": "manual", "text": text} for kind, text in docs.items()},
        }
        review = _queued_state(prompt, node_id).get("review")
        if isinstance(review, Mapping) and isinstance(review.get("approved_fingerprint"), str):
            state["review"] = {"approved_fingerprint": review["approved_fingerprint"]}
        states[target] = json.dumps(state, ensure_ascii=False, separators=(",", ":"))
    return states


def _activated(workflow: Mapping[str, Any], targets: Iterable[str]) -> list[str]:
    """The workflow's top-level nodes that are off (bypassed or muted) although the record ran them: the
    user had turned a block on (Stems, Refine, Cover Art ...). A block counts by its inner nodes."""
    ran = {target.split(":")[0] for target in targets}
    nodes = workflow_nodes(workflow)
    return sorted((i for i, n in nodes.items() if ":" not in i and n.mode != 0 and i in ran), key=int)


def workflow_for_record(
    workflow: Mapping[str, Any] | None, prompt: Mapping[str, Any] | None
) -> dict[str, Any] | None:
    """The workflow a run was queued with (``extra_pnginfo['workflow']``), with the secrets of the prompt
    redacted: a value the record's prompt redacts by its input name is replaced wherever the workflow holds
    it (widget values are a list, without names), then token-like strings as everywhere in the record."""
    if not isinstance(workflow, Mapping) or not isinstance(workflow.get("nodes"), list):
        return None
    secrets = secret_inputs(prompt or {})

    def scrub(value: Any) -> Any:
        if isinstance(value, Mapping):
            return {key: scrub(item) for key, item in value.items()}
        if isinstance(value, list):
            return [scrub(item) for item in value]
        if isinstance(value, str) and value in secrets:
            return REDACTED
        return value

    return dict(redact(scrub(workflow)))


def continuation(
    record: Mapping[str, Any], templates: Mapping[str, Mapping[str, Any]], *, source: str = ""
) -> dict[str, Any]:
    """What opening ``record`` restores (schema ``plenio.continuation/1``).

    ``workflow`` is the graph to load (``None``: none can be rebuilt - the documents go into the open
    workflow's Song Sheets); ``values`` the settings to set on it, by execution id and input name (only for a
    template: the record's own workflow has them); ``sheets`` the Song Sheets' states by execution id;
    ``activate`` the blocks to turn on; ``unplaced`` the record's nodes the template has no place for.
    """
    if not isinstance(record, Mapping) or record.get("schema") != RECORD_SCHEMA:
        raise PlenioUserError(
            f"{source or 'This file'} is no Plenio release record (schema {RECORD_SCHEMA}).",
            hint="Open the <name>.plenio.json that Export Release wrote next to the song.",
        )
    prompt = record.get("prompt")
    prompt = prompt if isinstance(prompt, Mapping) else {}
    versions = record.get("versions") or {}
    result: dict[str, Any] = {
        "schema": CONTINUATION_SCHEMA,
        "title": str(record.get("title") or "Untitled"),
        "created": str(record.get("created") or ""),
        "plenio": str(versions.get("plenio") or ""),
        "source": source,
        "documents": documents(record),
        "files": [
            str(f.get("name")) for f in record.get("files") or [] if isinstance(f, Mapping) and f.get("name")
        ],
        "workflow": None,
        "from": "none",
        "template": None,
        "sheets": {},
        "values": {},
        "activate": [],
        "unplaced": [],
    }
    stored = record.get("workflow")
    if isinstance(stored, Mapping) and isinstance(stored.get("nodes"), list):
        result.update({"workflow": dict(stored), "from": "record", "sheets": sheet_states(record)})
        return result
    match = match_template(prompt, templates)
    if match is None:
        return result
    workflow = templates[match.name]
    values = literal_inputs(prompt)
    result.update(
        {
            "workflow": dict(workflow),
            "from": "template",
            "template": match.name,
            "sheets": sheet_states(record, match.mapping),
            "values": place_values(
                {match.mapping[i]: inputs for i, inputs in values.items() if i in match.mapping}, workflow
            ),
            "activate": _activated(workflow, match.mapping.values()),
            "unplaced": sorted(
                {
                    str((prompt[i].get("_meta") or {}).get("title") or prompt[i].get("class_type"))
                    for i in match.unplaced
                }
            ),
        }
    )
    return result


# --- the records of the output folder ------------------------------------------------------

RECORD_SUFFIX = ".plenio.json"
MAX_RECORD_BYTES = 32 * 2**20
_SUMMARIES: dict[str, tuple[tuple[int, int], dict[str, Any] | None]] = {}


def summary(record: Mapping[str, Any], path: str) -> dict[str, Any]:
    """One row of the *Continue a song* list: what the song is and where its files are (``path``: the
    record's path relative to the output folder, ``/``-separated)."""
    folder = path.rsplit("/", 1)[0] if "/" in path else ""
    files = [f for f in record.get("files") or [] if isinstance(f, Mapping) and f.get("name")]

    def first(*roles: str | None) -> str | None:
        name = next((str(f["name"]) for f in files if f.get("role") in roles), None)
        return f"{folder}/{name}" if name and folder else name

    audio = record.get("audio") or {}
    return {
        "path": path,
        "title": str(record.get("title") or "Untitled"),
        "created": str(record.get("created") or ""),
        "plenio": str((record.get("versions") or {}).get("plenio") or ""),
        "seconds": audio.get("seconds") if isinstance(audio, Mapping) else None,
        "audio": first(None),
        "cover": first("cover"),
        "workflow": isinstance(record.get("workflow"), Mapping),
    }


def list_records(root: Path, *, limit: int = 1000) -> list[dict[str, Any]]:
    """The release records under ``root`` (the output folder), newest first. A file that is no record is
    left out; summaries are kept while a file's size and time stay the same."""
    found: list[tuple[int, Path]] = []
    for path in root.rglob(f"*{RECORD_SUFFIX}"):
        try:
            stat = path.stat()
        except OSError:
            continue
        found.append((stat.st_mtime_ns, path))
    found.sort(key=lambda item: item[0], reverse=True)
    rows: list[dict[str, Any]] = []
    for mtime, path in found:
        if len(rows) >= limit:
            break
        key = str(path)
        size = path.stat().st_size if path.exists() else 0
        cached = _SUMMARIES.get(key)
        if cached is None or cached[0] != (mtime, size):
            try:
                record = json.loads(path.read_text(encoding="utf-8")) if size <= MAX_RECORD_BYTES else None
            except (OSError, ValueError):
                record = None
            relative = path.relative_to(root).as_posix()
            row = (
                summary(record, relative)
                if isinstance(record, Mapping) and record.get("schema") == RECORD_SCHEMA
                else None
            )
            cached = ((mtime, size), row)
            _SUMMARIES[key] = cached
        if cached[1] is not None:
            rows.append(cached[1])
    return rows


def record_path(root: Path, relative: str) -> Path:
    """The record ``relative`` (as :func:`list_records` names it) inside ``root``; anything else is refused."""
    if not relative.endswith(RECORD_SUFFIX):
        raise PlenioUserError(f"{relative!r} is no release record (<name>{RECORD_SUFFIX}).")
    path = (root / relative).resolve()
    base = root.resolve()
    if base not in path.parents:
        raise PlenioUserError(f"The record {relative!r} lies outside the ComfyUI output folder.")
    if not path.is_file():
        raise PlenioUserError(f"The record {relative!r} does not exist (any more).")
    return path


def read_record(path: Path) -> dict[str, Any]:
    if path.stat().st_size > MAX_RECORD_BYTES:
        raise PlenioUserError(
            f"{path.name} is larger than {MAX_RECORD_BYTES // 2**20} MB; no release record is."
        )
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise PlenioUserError(f"{path.name} could not be read as JSON: {error}") from error
    if not isinstance(data, dict):
        raise PlenioUserError(f"{path.name} is no Plenio release record.")
    return data
