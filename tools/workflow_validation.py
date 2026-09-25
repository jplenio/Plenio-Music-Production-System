"""Validation of Plenio's templates (``example_workflows``) and blueprints (``subgraphs``).

Checks against ``tools/data/node_types.json`` (a snapshot of the pinned
ComfyUI's ``/object_info``):

* known node types; unique node ids; links point to existing slots with
  compatible types; top-level graphs are acyclic;
* ``widgets_values`` has exactly the number of widget values the node
  definition produces (incl. seed control values and DynamicCombo options);
* blueprints: one wrapper node, name equal to the file name, a ``Plenio``
  category and a description, no legacy ``proxyWidgets`` entries;
* templates: embedded subgraph definitions equal the blueprint files;
* no absolute local paths, private addresses or secrets in any string.
"""

from __future__ import annotations

import json
import re
from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
SNAPSHOT = PROJECT / "tools" / "data" / "node_types.json"
FRONTEND_ONLY_TYPES = {"MarkdownNote", "Note", "Reroute"}
WIDGET_TYPES = {"INT", "FLOAT", "STRING", "BOOLEAN", "COMBO"}
CUSTOM_WIDGET_TYPES = {"PLENIO_SHEET_STATE"}
DYNAMIC_COMBO = "COMFY_DYNAMICCOMBO_V3"
SUBGRAPH_INPUT, SUBGRAPH_OUTPUT = -10, -20
VOLATILE_DEFINITION_KEYS = {"revision"}
LEAK_PATTERNS = [
    (re.compile(r"(?i)\b[a-z]:[\\/]{1,2}(?:users|daten\d*|comfyui|program files)"), "absolute Windows path"),
    (re.compile(r"(?:^|[\s\"'])/(?:home|Users|mnt)/[\w.-]+/"), "absolute POSIX home path"),
    (
        re.compile(r"\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b"),
        "private IP address",
    ),
    (
        re.compile(r"(?i)\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*[\"']?[A-Za-z0-9_\-]{12,}"),
        "secret-like value",
    ),
    (re.compile(r"\bhf_[A-Za-z0-9]{30,}\b|\bsk-[A-Za-z0-9]{20,}\b"), "access token"),
]


def load_snapshot(path: Path = SNAPSHOT) -> dict[str, Any]:
    data: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    return data


def _spec(info: Mapping[str, Any], name: str) -> tuple[Any, dict[str, Any]]:
    for section in ("required", "optional"):
        entry = (info.get("input") or {}).get(section, {}).get(name)
        if entry is not None:
            return entry[0], (entry[1] if len(entry) > 1 else {}) or {}
    raise KeyError(name)


def _ordered_inputs(info: Mapping[str, Any]) -> list[str]:
    order = info.get("input_order") or {}
    names = list(order.get("required", [])) + list(order.get("optional", []))
    if names:
        return names
    inputs = info.get("input") or {}
    return list(inputs.get("required", {})) + list(inputs.get("optional", {}))


def _widget_count(spec_type: Any, options: Mapping[str, Any]) -> int:
    if options.get("forceInput"):
        return 0
    if isinstance(spec_type, list) or spec_type in WIDGET_TYPES or spec_type in CUSTOM_WIDGET_TYPES:
        return 2 if options.get("control_after_generate") else 1
    return 0


def expected_widget_values(info: Mapping[str, Any], values: list[Any]) -> int:
    """Number of widget values the frontend serialises for ``info`` given ``values``.

    DynamicCombo inputs contribute their own value plus the widgets of the
    selected option, which is read from ``values``.
    """
    count = 0
    for name in _ordered_inputs(info):
        spec_type, options = _spec(info, name)
        if spec_type == DYNAMIC_COMBO:
            selected = values[count] if count < len(values) else None
            count += 1
            option = next((o for o in options.get("options", []) if o.get("key") == selected), None)
            if option is None:
                return -1
            nested = option.get("inputs", {})
            for section in ("required", "optional"):
                for nested_spec in nested.get(section, {}).values():
                    count += _widget_count(nested_spec[0], nested_spec[1] if len(nested_spec) > 1 else {})
            continue
        count += _widget_count(spec_type, options)
    return count


def _types_compatible(output_type: str, input_type: str) -> bool:
    if "*" in (output_type, input_type) or "COMFY_MATCHTYPE_V3" in (output_type, input_type):
        return True
    outputs = set(output_type.split(","))
    inputs = set(input_type.split(","))
    return bool(outputs & inputs)


def _links(graph: Mapping[str, Any]) -> list[dict[str, Any]]:
    result = []
    for link in graph.get("links", []):
        if isinstance(link, list):
            link_id, origin, origin_slot, target, target_slot, link_type = link[:6]
            result.append(
                {
                    "id": link_id,
                    "origin_id": origin,
                    "origin_slot": origin_slot,
                    "target_id": target,
                    "target_slot": target_slot,
                    "type": link_type,
                }
            )
        else:
            result.append(dict(link))
    return result


def _check_leaks(value: Any, where: str, problems: list[str]) -> None:
    if isinstance(value, str):
        for pattern, label in LEAK_PATTERNS:
            if pattern.search(value):
                problems.append(f"{where}: {label} in {value[:60]!r}")
    elif isinstance(value, dict):
        for item in value.values():
            _check_leaks(item, where, problems)
    elif isinstance(value, list):
        for item in value:
            _check_leaks(item, where, problems)


def _check_graph(
    graph: Mapping[str, Any],
    where: str,
    nodes_info: Mapping[str, Any],
    subgraph_ids: set[str],
    problems: list[str],
    *,
    top_level: bool,
) -> None:
    nodes = graph.get("nodes", [])
    ids = [node["id"] for node in nodes]
    if len(ids) != len(set(ids)):
        problems.append(f"{where}: duplicate node ids")
    by_id = {node["id"]: node for node in nodes}
    for node in nodes:
        node_type = node["type"]
        label = f"{where} node {node['id']} ({node_type})"
        if (node.get("properties") or {}).get("proxyWidgets"):
            problems.append(f"{label}: legacy proxyWidgets entry (quarantined by frontend >= 1.53)")
        if node_type in FRONTEND_ONLY_TYPES or node_type in subgraph_ids:
            continue
        info = nodes_info.get(node_type)
        if info is None:
            problems.append(f"{label}: unknown node type (refresh tools/data/node_types.json?)")
            continue
        values = list(node.get("widgets_values") or [])
        expected = expected_widget_values(info, values)
        if expected != len(values):
            problems.append(f"{label}: {len(values)} widget values, the definition produces {expected}")
    inputs_of = {node["id"]: node.get("inputs", []) for node in nodes}
    outputs_of = {node["id"]: node.get("outputs", []) for node in nodes}
    edges: dict[Any, set[Any]] = {node_id: set() for node_id in ids}
    for link in _links(graph):
        origin, target = link["origin_id"], link["target_id"]
        lid = f"{where} link {link['id']}"
        if origin not in by_id and origin != SUBGRAPH_INPUT:
            problems.append(f"{lid}: unknown origin node {origin}")
            continue
        if target not in by_id and target != SUBGRAPH_OUTPUT:
            problems.append(f"{lid}: unknown target node {target}")
            continue
        if origin in by_id:
            outputs = outputs_of[origin]
            if link["origin_slot"] >= len(outputs):
                problems.append(f"{lid}: origin slot {link['origin_slot']} does not exist")
                continue
            if link["id"] not in (outputs[link["origin_slot"]].get("links") or []):
                problems.append(f"{lid}: not listed in the origin output's links")
        if target in by_id:
            inputs = inputs_of[target]
            if link["target_slot"] >= len(inputs):
                problems.append(f"{lid}: target slot {link['target_slot']} does not exist")
                continue
            slot = inputs[link["target_slot"]]
            if slot.get("link") != link["id"]:
                problems.append(f"{lid}: target input {slot.get('name')} does not reference it")
            if not _types_compatible(str(link["type"]), str(slot.get("type"))):
                problems.append(
                    f"{lid}: type {link['type']} into input {slot.get('name')} of type {slot.get('type')}"
                )
        if origin in by_id and target in by_id:
            edges[origin].add(target)
    if top_level and _has_cycle(edges):
        problems.append(f"{where}: the graph has a cycle")


def _has_cycle(edges: Mapping[Any, set[Any]]) -> bool:
    state: dict[Any, int] = {}

    def visit(node: Any) -> bool:
        state[node] = 1
        for nxt in edges.get(node, ()):
            if state.get(nxt) == 1 or (state.get(nxt) is None and visit(nxt)):
                return True
        state[node] = 2
        return False

    return any(state.get(node) is None and visit(node) for node in edges)


def _normalised_definition(definition: Mapping[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in definition.items() if key not in VOLATILE_DEFINITION_KEYS}


def validate_file(
    path: Path, snapshot: Mapping[str, Any], blueprints: Mapping[str, Mapping[str, Any]]
) -> list[str]:
    problems: list[str] = []
    where = path.name
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        return [f"{where}: invalid JSON ({error})"]
    nodes_info = snapshot["nodes"]
    if data.get("version") != 0.4:
        problems.append(f"{where}: expected workflow version 0.4")
    definitions = (data.get("definitions") or {}).get("subgraphs") or []
    subgraph_ids = {definition["id"] for definition in definitions}
    _check_graph(data, where, nodes_info, subgraph_ids, problems, top_level=True)
    for definition in definitions:
        _check_graph(
            definition,
            f"{where} subgraph {definition.get('name')!r}",
            nodes_info,
            subgraph_ids,
            problems,
            top_level=False,
        )
    _check_leaks(data, where, problems)
    is_blueprint = path.parent.name == "subgraphs"
    if is_blueprint:
        if len(definitions) != 1 or len(data.get("nodes", [])) != 1:
            problems.append(f"{where}: a blueprint has exactly one wrapper node and one subgraph definition")
        else:
            definition = definitions[0]
            if data["nodes"][0]["type"] != definition["id"]:
                problems.append(f"{where}: the wrapper node must instantiate the definition")
            if definition.get("name") != path.stem:
                problems.append(
                    f"{where}: definition name {definition.get('name')!r} differs from the file name"
                )
            if not str(definition.get("category", "")).startswith("Plenio"):
                problems.append(f"{where}: category must start with 'Plenio'")
            if not definition.get("description"):
                problems.append(f"{where}: description missing")
    else:
        for definition in definitions:
            blueprint = blueprints.get(definition.get("name", ""))
            if blueprint is not None and _normalised_definition(definition) != _normalised_definition(
                blueprint
            ):
                problems.append(
                    f"{where}: embedded subgraph {definition['name']!r} differs from subgraphs/"
                    f"{definition['name']}.json (re-sync the template)"
                )
    return problems


def load_blueprints(folder: Path) -> dict[str, dict[str, Any]]:
    result = {}
    for path in sorted(folder.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for definition in (data.get("definitions") or {}).get("subgraphs") or []:
            result[definition["name"]] = definition
    return result


def validate_all(
    paths: Iterable[Path], blueprint_folder: Path = PROJECT / "subgraphs"
) -> dict[str, list[str]]:
    snapshot = load_snapshot()
    blueprints = load_blueprints(blueprint_folder)
    return {str(path): validate_file(path, snapshot, blueprints) for path in paths}


def main() -> int:
    paths = sorted((PROJECT / "subgraphs").glob("*.json")) + sorted(
        (PROJECT / "example_workflows").glob("*.json")
    )
    failures = 0
    for path, problems in validate_all(paths).items():
        status = "ok" if not problems else f"{len(problems)} problem(s)"
        print(f"{Path(path).relative_to(PROJECT)}: {status}")
        for problem in problems:
            print(f"  - {problem}")
        failures += bool(problems)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
