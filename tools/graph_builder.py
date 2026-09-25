"""Deterministic builder for ComfyUI workflow and blueprint JSON (frontend format 0.4).

Node slots follow the frontend's layout: socket inputs first (optional ones
with ``shape: 7``), then widget inputs in definition order; DynamicCombo
children are named ``parent.child``. Widget values are listed in the same
order, with the extra ``control_after_generate`` value after seed widgets.
Everything is derived from ``tools/data/node_types.json``.
"""

from __future__ import annotations

import copy
import uuid
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from workflow_validation import CUSTOM_WIDGET_TYPES, DYNAMIC_COMBO, WIDGET_TYPES, load_snapshot

NAMESPACE = uuid.UUID("9b2f7c1e-4d3a-5e6f-8a9b-0c1d2e3f4a5b")
AUTOGROW = "COMFY_AUTOGROW_V3"


def stable_uuid(*parts: str) -> str:
    return str(uuid.uuid5(NAMESPACE, "/".join(parts)))


@dataclass
class Slot:
    name: str
    type: str
    widget: bool = False
    optional: bool = False
    label: str | None = None

    def to_json(self, link: int | None) -> dict[str, Any]:
        data: dict[str, Any] = {"localized_name": self.name, "name": self.name}
        if self.label:
            data["label"] = self.label
        if self.optional and not self.widget:
            data["shape"] = 7
        data["type"] = self.type
        if self.widget:
            data["widget"] = {"name": self.name}
        data["link"] = link
        return data


@dataclass
class Node:
    id: int
    type: str
    inputs: list[Slot]
    outputs: list[tuple[str, str]]
    widgets: list[tuple[str, Any]]
    pos: tuple[float, float]
    size: tuple[float, float]
    title: str | None = None
    mode: int = 0
    properties: dict[str, Any] = field(default_factory=dict)
    input_links: dict[str, int] = field(default_factory=dict)
    output_links: dict[int, list[int]] = field(default_factory=dict)
    color: str | None = None
    bgcolor: str | None = None
    collapsed: bool = False

    def slot_index(self, name: str) -> int:
        for index, slot in enumerate(self.inputs):
            if slot.name == name:
                return index
        raise KeyError(f"{self.type} has no input {name!r} ({[s.name for s in self.inputs]})")

    def output_index(self, name: str | int) -> int:
        if isinstance(name, int):
            return name
        for index, (output_name, _type) in enumerate(self.outputs):
            if output_name == name:
                return index
        raise KeyError(f"{self.type} has no output {name!r} ({[o[0] for o in self.outputs]})")

    def to_json(self, order: int) -> dict[str, Any]:
        data: dict[str, Any] = {
            "id": self.id,
            "type": self.type,
            "pos": list(self.pos),
            "size": list(self.size),
            "flags": {"collapsed": True} if self.collapsed else {},
            "order": order,
            "mode": self.mode,
            "inputs": [slot.to_json(self.input_links.get(slot.name)) for slot in self.inputs],
            "outputs": [
                {
                    "localized_name": name,
                    "name": name,
                    "type": kind,
                    "links": self.output_links.get(i) or None,
                }
                for i, (name, kind) in enumerate(self.outputs)
            ],
        }
        if self.title:
            data["title"] = self.title
        if self.color:
            data["color"], data["bgcolor"] = self.color, self.bgcolor
        data["properties"] = (
            {"Node name for S&R": self.type, **self.properties}
            if not _is_subgraph_type(self.type)
            else dict(self.properties)
        )
        values = [value for _name, value in self.widgets]
        data["widgets_values"] = values
        return data


def _is_subgraph_type(node_type: str) -> bool:
    return len(node_type) == 36 and node_type.count("-") == 4


def _is_widget(spec_type: Any, options: Mapping[str, Any]) -> bool:
    if options.get("forceInput"):
        return False
    return isinstance(spec_type, list) or spec_type in WIDGET_TYPES or spec_type in CUSTOM_WIDGET_TYPES


def _widget_type(spec_type: Any) -> str:
    return "COMBO" if isinstance(spec_type, list) else str(spec_type)


class Graph:
    """A graph (top level or subgraph body) under construction."""

    def __init__(self, snapshot: Mapping[str, Any] | None = None, *, first_id: int = 1):
        """``first_id``: blueprint bodies use their own id range, so that no inner node shares an id with
        a template's top-level nodes or another blueprint's (the frontend renumbers such nodes on load)."""
        self.snapshot = snapshot or load_snapshot()
        self.nodes: list[Node] = []
        self.links: list[dict[str, Any]] = []
        self.groups: list[dict[str, Any]] = []
        self._next_node = first_id
        self._next_link = 1

    # --- nodes ------------------------------------------------------------------

    def add(
        self,
        node_type: str,
        pos: tuple[float, float],
        *,
        size: tuple[float, float] = (320, 160),
        title: str | None = None,
        widgets: Mapping[str, Any] | None = None,
        mode: int = 0,
        properties: Mapping[str, Any] | None = None,
        autogrow: Mapping[str, int] | None = None,
        labels: Mapping[str, str] | None = None,
        collapsed: bool = False,
    ) -> Node:
        info = self.snapshot["nodes"].get(node_type)
        if info is None:
            raise KeyError(f"{node_type} is not in the node snapshot")
        values = dict(widgets or {})
        sockets: list[Slot] = []
        widget_slots: list[Slot] = []
        widget_values: list[tuple[str, Any]] = []
        order = info.get("input_order") or {}
        for section in ("required", "optional"):
            for name in order.get(section, []):
                spec_type, options = _spec(info, name)
                optional = section == "optional"
                if spec_type == DYNAMIC_COMBO:
                    selected = values.pop(name, options.get("default") or options["options"][0]["key"])
                    widget_slots.append(Slot(name, DYNAMIC_COMBO, widget=True))
                    widget_values.append((name, selected))
                    option = next(o for o in options["options"] if o["key"] == selected)
                    for nested_section in ("required", "optional"):
                        for child, child_spec in option.get("inputs", {}).get(nested_section, {}).items():
                            child_type, child_options = (
                                child_spec[0],
                                child_spec[1] if len(child_spec) > 1 else {},
                            )
                            full = f"{name}.{child}"
                            if _is_widget(child_type, child_options):
                                widget_slots.append(Slot(full, _widget_type(child_type), widget=True))
                                widget_values.append((full, values.pop(full, child_options.get("default"))))
                                if child_options.get("control_after_generate"):
                                    widget_values.append(
                                        (f"{full}.control", values.pop(f"{full}.control", "fixed"))
                                    )
                            else:
                                sockets.append(Slot(full, str(child_type), optional=True))
                    continue
                if spec_type == AUTOGROW:
                    template = options["template"]
                    count = (autogrow or {}).get(name, template.get("min", 0) or 0)
                    child_type = next(iter(template["input"]["required"].values()))[0]
                    for index in range(count + 1):
                        slot_name = (
                            f"{name}.{template['prefix']}{index}"
                            if "prefix" in template
                            else f"{name}.{template['names'][index]}"
                        )
                        sockets.append(
                            Slot(slot_name, str(child_type), optional=True, label=slot_name.split(".")[-1])
                        )
                    continue
                if _is_widget(spec_type, options):
                    widget_slots.append(Slot(name, _widget_type(spec_type), widget=True, optional=optional))
                    if name in values:
                        value = values.pop(name)
                    else:
                        value = options.get("default")
                        if value is None and isinstance(spec_type, list):
                            value = spec_type[0] if spec_type else ""
                        if value is None and spec_type == "COMBO":
                            value = (options.get("options") or [""])[0]
                    widget_values.append((name, value))
                    if options.get("control_after_generate"):
                        control = options["control_after_generate"]
                        widget_values.append(
                            (
                                f"{name}.control",
                                values.pop(
                                    f"{name}.control", control if isinstance(control, str) else "randomize"
                                ),
                            )
                        )
                else:
                    sockets.append(Slot(name, str(spec_type), optional=optional))
        if values:
            raise KeyError(f"{node_type}: unknown widget values {sorted(values)}")
        slots = sockets + widget_slots
        for name, label in (labels or {}).items():
            slot = next((s for s in slots if s.name == name), None)
            if slot is None:
                raise KeyError(f"{node_type}: no input {name!r} to label")
            slot.label = label
        outputs = list(zip(info.get("output_name") or info["output"], info["output"], strict=True))
        node = Node(
            self._next_node,
            node_type,
            slots,
            outputs,
            widget_values,
            pos,
            size,
            title,
            mode,
            dict(properties or {}),
            collapsed=collapsed,
        )
        self._next_node += 1
        self.nodes.append(node)
        return node

    def add_frontend(
        self,
        node_type: str,
        pos: tuple[float, float],
        *,
        size: tuple[float, float],
        title: str | None = None,
        widgets: list[Any] | None = None,
        color: str | None = None,
        bgcolor: str | None = None,
    ) -> Node:
        """Frontend-only nodes (MarkdownNote, Note): no inputs, no outputs."""
        node = Node(
            self._next_node,
            node_type,
            [],
            [],
            [("text", v) for v in (widgets or [])],
            pos,
            size,
            title,
            color=color,
            bgcolor=bgcolor,
        )
        self._next_node += 1
        self.nodes.append(node)
        return node

    def add_subgraph(
        self,
        blueprint: Blueprint,
        pos: tuple[float, float],
        *,
        size: tuple[float, float] = (340, 200),
        title: str | None = None,
        widgets: Mapping[str, Any] | None = None,
        mode: int = 0,
        collapsed: bool = False,
    ) -> Node:
        values = dict(widgets or {})
        inputs = [Slot(i.name, i.type, widget=i.widget, label=i.label) for i in blueprint.inputs]
        widget_values = [(i.name, values.pop(i.name, i.default)) for i in blueprint.inputs if i.widget]
        if values:
            raise KeyError(f"{blueprint.name}: unknown widget values {sorted(values)}")
        node = Node(
            self._next_node,
            blueprint.id,
            inputs,
            [(o.name, o.type) for o in blueprint.outputs],
            widget_values,
            pos,
            size,
            title or blueprint.name,
            mode,
            collapsed=collapsed,
        )
        self._next_node += 1
        self.nodes.append(node)
        return node

    # --- links ---------------------------------------------------------------------

    def link(self, source: Node, output: str | int, target: Node, input_name: str) -> int:
        out_index = source.output_index(output)
        in_index = target.slot_index(input_name)
        link_id = self._next_link
        self._next_link += 1
        kind = source.outputs[out_index][1]
        target.input_links[input_name] = link_id
        source.output_links.setdefault(out_index, []).append(link_id)
        self.links.append(
            {
                "id": link_id,
                "origin_id": source.id,
                "origin_slot": out_index,
                "target_id": target.id,
                "target_slot": in_index,
                "type": kind,
            }
        )
        return link_id

    def group(self, title: str, nodes: list[Node], *, color: str = "#3f789e", padding: float = 30) -> None:
        def extent(node: Node) -> tuple[float, float]:
            return (min(node.size[0], 260), 30) if node.collapsed else node.size

        left = min(n.pos[0] for n in nodes) - padding
        top = min(n.pos[1] for n in nodes) - padding - 40
        right = max(n.pos[0] + extent(n)[0] for n in nodes) + padding
        bottom = max(n.pos[1] + extent(n)[1] for n in nodes) + padding
        self.groups.append(
            {
                "id": len(self.groups) + 1,
                "title": title,
                "bounding": [left, top, right - left, bottom - top],
                "color": color,
                "font_size": 24,
                "flags": {},
            }
        )


def _spec(info: Mapping[str, Any], name: str) -> tuple[Any, dict[str, Any]]:
    for section in ("required", "optional"):
        entry = (info.get("input") or {}).get(section, {}).get(name)
        if entry is not None:
            return entry[0], (entry[1] if len(entry) > 1 else {}) or {}
    raise KeyError(name)


# --- blueprints ---------------------------------------------------------------------


@dataclass
class BlueprintInput:
    name: str
    type: str
    targets: list[tuple[Node, str]]
    widget: bool = False
    default: Any = None
    label: str | None = None


@dataclass
class BlueprintOutput:
    name: str
    type: str
    source: tuple[Node, str | int]


@dataclass
class Blueprint:
    name: str
    category: str
    description: str
    body: Graph
    inputs: list[BlueprintInput]
    outputs: list[BlueprintOutput]

    def __post_init__(self) -> None:
        # A subgraph input that feeds an inner widget input is a promoted widget on the
        # wrapper node (frontend 1.53), even when it is linked at the top level.
        for item in self.inputs:
            target, input_name = item.targets[0]
            slot = target.inputs[target.slot_index(input_name)]
            item.widget = slot.widget
            if item.widget and item.default is None:
                inner = dict(target.widgets)
                item.default = inner.get(input_name, "")

    @property
    def id(self) -> str:
        return stable_uuid("blueprint", self.name)

    def definition(self) -> dict[str, Any]:
        body = copy.deepcopy(self.body)
        links = list(body.links)
        next_link = max((link["id"] for link in links), default=0) + 1
        node_by_id = {n.id: n for n in body.nodes}
        inputs_json = []
        for index, item in enumerate(self.inputs):
            link_ids = []
            for target, input_name in item.targets:
                node = node_by_id[target.id]
                link_ids.append(next_link)
                node.input_links[input_name] = next_link
                links.append(
                    {
                        "id": next_link,
                        "origin_id": -10,
                        "origin_slot": index,
                        "target_id": node.id,
                        "target_slot": node.slot_index(input_name),
                        "type": item.type,
                    }
                )
                next_link += 1
            entry: dict[str, Any] = {
                "id": stable_uuid(self.name, "in", item.name),
                "name": item.name,
                "type": item.type,
                "linkIds": link_ids,
                "pos": [0, 20 * index],
            }
            if item.label:
                entry["label"] = item.label
            inputs_json.append(entry)
        outputs_json = []
        for index, item in enumerate(self.outputs):
            node = node_by_id[item.source[0].id]
            out_index = node.output_index(item.source[1])
            links.append(
                {
                    "id": next_link,
                    "origin_id": node.id,
                    "origin_slot": out_index,
                    "target_id": -20,
                    "target_slot": index,
                    "type": item.type,
                }
            )
            node.output_links.setdefault(out_index, []).append(next_link)
            outputs_json.append(
                {
                    "id": stable_uuid(self.name, "out", item.name),
                    "name": item.name,
                    "type": item.type,
                    "linkIds": [next_link],
                    "pos": [0, 20 * index],
                }
            )
            next_link += 1
        xs = [n.pos[0] for n in body.nodes]
        right = max(n.pos[0] + n.size[0] for n in body.nodes)
        return {
            "id": self.id,
            "version": 1,
            "state": {
                "lastGroupId": len(body.groups),
                "lastNodeId": max(n.id for n in body.nodes),
                "lastLinkId": next_link - 1,
                "lastRerouteId": 0,
            },
            "revision": 0,
            "config": {},
            "name": self.name,
            "inputNode": {"id": -10, "bounding": [min(xs) - 260, 0, 160, 40 + 20 * len(self.inputs)]},
            "outputNode": {"id": -20, "bounding": [right + 100, 0, 160, 40 + 20 * len(self.outputs)]},
            "inputs": inputs_json,
            "outputs": outputs_json,
            "widgets": [],
            "nodes": [n.to_json(i) for i, n in enumerate(body.nodes)],
            "groups": body.groups,
            "links": sorted(links, key=lambda link: link["id"]),
            "extra": {},
            "category": self.category,
            "description": self.description,
        }


def blueprint_file(blueprint: Blueprint) -> dict[str, Any]:
    """The file served from ``subgraphs/``: one wrapper node plus the definition."""
    graph = Graph()
    wrapper = graph.add_subgraph(blueprint, (0, 0))
    return {
        "revision": 0,
        "last_node_id": wrapper.id,
        "last_link_id": 0,
        "nodes": [wrapper.to_json(0)],
        "links": [],
        "version": 0.4,
        "definitions": {"subgraphs": [blueprint.definition()]},
        "extra": {},
    }


@dataclass
class App:
    """An App Mode configuration (frontend ``extra.linearData``): the widgets shown as the app's
    controls, in order, and the output nodes whose results it shows."""

    inputs: list[tuple[Node, str]]
    outputs: list[Node]

    def to_json(self) -> dict[str, Any]:
        for node, name in self.inputs:
            if not any(slot.name == name and slot.widget for slot in node.inputs):
                raise KeyError(f"App input {name!r} is not a widget of node {node.id} ({node.type})")
        return {
            "inputs": [[node.id, name] for node, name in self.inputs],
            "outputs": [node.id for node in self.outputs],
        }


def workflow(graph: Graph, name: str, blueprints: list[Blueprint], app: App | None = None) -> dict[str, Any]:
    # The view opens on the About note (x = -560) and the first groups.
    extra: dict[str, Any] = {"ds": {"scale": 0.7, "offset": [640, 150]}}
    if app is not None:
        extra["linearData"] = app.to_json()
    return {
        "id": stable_uuid("workflow", name),
        "revision": 0,
        "last_node_id": max(n.id for n in graph.nodes),
        "last_link_id": max((link["id"] for link in graph.links), default=0),
        "nodes": [n.to_json(i) for i, n in enumerate(graph.nodes)],
        "links": [
            [
                link["id"],
                link["origin_id"],
                link["origin_slot"],
                link["target_id"],
                link["target_slot"],
                link["type"],
            ]
            for link in graph.links
        ],
        "groups": graph.groups,
        "definitions": {"subgraphs": [b.definition() for b in blueprints]},
        "config": {},
        "extra": extra,
        "version": 0.4,
    }
