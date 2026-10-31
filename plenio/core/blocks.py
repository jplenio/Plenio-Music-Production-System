"""Plenio blocks saved in a workflow before they followed the brief's creativity, brought up to date when the
workflow opens (owner's report 2026-10-20: creativity 100, and the song's plan and take sampling were 50's).

ComfyUI keeps the inner graph of every block in the workflow that uses it (``definitions.subgraphs``). A
workflow saved before 1.0.2 - a tab the browser restores, a file, a release record - keeps blocks whose
writer, plan and take sampling are fixed numbers, while its Song Brief, a node of the package, already has
the creativity slider: the slider then changed the writer's rules and nothing else. When such a workflow
opens, the frontend (``frontend/src/extension/blocks.ts``) has it brought up to date here: each such block
becomes the current one (the definition the package ships in ``subgraphs/``, under the id its instances use),
its instances get the new inputs, and the YuE2 blocks' *creativity* is linked from the brief - in the graph,
exactly as the current templates have it. At 50 the Creativity nodes give the numbers the blocks had.

A block is kept as it is, and named, when the current one does not fit in its place: other inputs or
outputs (inputs and outputs it adds after the old ones are fine), or a node behind the sampling that differs from the current block's (a value set by hand inside
the block, which would be lost - or a block of a ComfyUI whose nodes have other fields).
"""

from __future__ import annotations

import copy
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from typing import Any

CREATIVITY_NODE = "PlenioCreativity"
BRIEF_NODES = ("PlenioSongBrief", "PlenioCoverBrief")
CREATIVITY = "creativity"
"""The brief's output and the YuE2 blocks' input that carry the creativity."""


@dataclass(frozen=True)
class Block:
    """A current block: its definition and its instance as the blueprint file has it."""

    definition: Mapping[str, Any]
    instance: Mapping[str, Any]

    @property
    def name(self) -> str:
        return str(self.definition.get("name") or self.definition.get("id"))


@dataclass(frozen=True)
class Upgrade:
    workflow: dict[str, Any]
    updated: tuple[str, ...] = ()
    """The blocks brought up to date (by name)."""
    kept: tuple[tuple[str, str], ...] = ()
    """The blocks left as they were: (name, why)."""
    linked: tuple[str, ...] = ()
    """The blocks whose creativity now comes from the brief."""
    unlinked: tuple[tuple[str, str], ...] = ()
    """The blocks whose creativity could not be linked from the brief: (name, why) - their own slider counts."""


def _nodes(definition: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    return [node for node in definition.get("nodes") or [] if isinstance(node, Mapping)]


def _names(slots: Any) -> list[str]:
    return [str(slot.get("name")) for slot in slots or [] if isinstance(slot, Mapping)]


def has_creativity(definition: Mapping[str, Any]) -> bool:
    return any(node.get("type") == CREATIVITY_NODE for node in _nodes(definition))


def current_blocks(files: Iterable[Mapping[str, Any]]) -> dict[str, Block]:
    """The blocks of the blueprint files (``subgraphs/*.json``) that have Creativity nodes, by definition id."""
    blocks: dict[str, Block] = {}
    for data in files:
        definitions = (data.get("definitions") or {}).get("subgraphs") or []
        for definition in definitions:
            if not isinstance(definition, Mapping) or not has_creativity(definition):
                continue
            instance = next(
                (
                    node
                    for node in data.get("nodes") or []
                    if isinstance(node, Mapping) and node.get("type") == definition.get("id")
                ),
                {},
            )
            blocks[str(definition.get("id"))] = Block(definition, instance)
    return blocks


def brief_outputs(templates: Iterable[Mapping[str, Any]]) -> dict[str, list[Mapping[str, Any]]]:
    """The outputs of each brief as the current templates have them (the most complete one of each kind)."""
    found: dict[str, list[Mapping[str, Any]]] = {}
    for workflow in templates:
        for node in workflow.get("nodes") or []:
            if not isinstance(node, Mapping) or node.get("type") not in BRIEF_NODES:
                continue
            outputs = [slot for slot in node.get("outputs") or [] if isinstance(slot, Mapping)]
            if len(outputs) > len(found.get(str(node["type"]), [])):
                found[str(node["type"])] = outputs
    return found


def _block_for(definition: Mapping[str, Any], blocks: Mapping[str, Block]) -> Block | None:
    block = blocks.get(str(definition.get("id")))
    if block is None:
        block = next((b for b in blocks.values() if b.name == definition.get("name")), None)
    return block


def outdated(workflow: Mapping[str, Any], blocks: Mapping[str, Block]) -> list[str]:
    """The workflow's blocks that have no Creativity node while the current block has (by name)."""
    return [
        str(definition.get("name") or definition.get("id"))
        for definition in (workflow.get("definitions") or {}).get("subgraphs") or []
        if isinstance(definition, Mapping)
        and not has_creativity(definition)
        and _block_for(definition, blocks) is not None
    ]


def _same(a: Any, b: Any) -> bool:
    """Values equal as a workflow stores them: an empty text and nothing alike (a field fed by a link), a
    whole number and the same float alike (``360`` and ``360.0``)."""
    if a in (None, "") and b in (None, ""):
        return True
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    if isinstance(a, int | float) and isinstance(b, int | float):
        return abs(float(a) - float(b)) < 1e-9
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_same(x, y) for x, y in zip(a, b, strict=True))
    return bool(a == b)


def sampled_nodes(definition: Mapping[str, Any]) -> set[int]:
    """The ids of the nodes a block's Creativity nodes feed (the sampling fields)."""
    sources = {node.get("id") for node in _nodes(definition) if node.get("type") == CREATIVITY_NODE}
    return {
        int(link["target_id"])
        for link in definition.get("links") or []
        if isinstance(link, Mapping)
        and link.get("origin_id") in sources
        and isinstance(link.get("target_id"), int)
    }


def misfit(old: Mapping[str, Any], current: Mapping[str, Any]) -> str | None:
    """Why the current block cannot take the place of ``old`` (``None``: it can)."""
    old_inputs, new_inputs = _names(old.get("inputs")), _names(current.get("inputs"))
    if new_inputs[: len(old_inputs)] != old_inputs:
        return "its inputs differ from the current block's"
    old_outputs, new_outputs = _names(old.get("outputs")), _names(current.get("outputs"))
    if new_outputs[: len(old_outputs)] != old_outputs:
        return "its outputs differ from the current block's"
    inner = {node.get("id"): node for node in _nodes(old)}
    fresh = {node.get("id"): node for node in _nodes(current)}
    last = max((i for i in inner if isinstance(i, int)), default=0)
    for node_id in sorted(sampled_nodes(current)):
        before, now = inner.get(node_id), fresh[node_id]
        if before is None and node_id > last:
            continue  # a node the current block adds after the old ones (the render blocks' retakes)
        if before is None or before.get("type") != now.get("type"):
            return "its sampling nodes differ from the current block's"
        if not _same(before.get("widgets_values"), now.get("widgets_values")):
            return f"its node {now.get('title') or now.get('type')} was changed inside the block"
    return None


def _next_link_id(workflow: dict[str, Any]) -> int:
    ids = [workflow.get("last_link_id") or 0, (workflow.get("state") or {}).get("lastLinkId") or 0]
    for link in workflow.get("links") or []:
        ids.append(
            link[0]
            if isinstance(link, list) and link
            else (link.get("id") if isinstance(link, Mapping) else 0)
        )
    number = max(int(i) for i in ids if isinstance(i, int) and not isinstance(i, bool)) + 1
    workflow["last_link_id"] = number
    if isinstance(workflow.get("state"), dict) and "lastLinkId" in workflow["state"]:
        workflow["state"]["lastLinkId"] = number
    return number


def _brief_output(brief: dict[str, Any], known: Sequence[Mapping[str, Any]]) -> int | None:
    """The slot of the brief's creativity output; a brief saved before it had one gets the outputs it lacks
    (as the current templates have them) - ``None`` when its outputs are not the start of those."""
    outputs = brief.get("outputs")
    if not isinstance(outputs, list):
        outputs = brief["outputs"] = []
    names = _names(outputs)
    if CREATIVITY in names:
        return names.index(CREATIVITY)
    known_names = _names(known)
    if CREATIVITY not in known_names or known_names[: len(names)] != names:
        return None
    for slot in known[len(outputs) :]:
        outputs.append({**copy.deepcopy(dict(slot)), "links": None})
    return known_names.index(CREATIVITY)


def _link_creativity(
    workflow: dict[str, Any],
    brief: dict[str, Any],
    output: int,
    instance: dict[str, Any],
    slot: int,
) -> None:
    link_id = _next_link_id(workflow)
    links = workflow.setdefault("links", [])
    if links and isinstance(links[0], Mapping):
        links.append(
            {
                "id": link_id,
                "origin_id": brief["id"],
                "origin_slot": output,
                "target_id": instance["id"],
                "target_slot": slot,
                "type": "INT",
            }
        )
    else:
        links.append([link_id, brief["id"], output, instance["id"], slot, "INT"])
    out = brief["outputs"][output]
    out["links"] = [*(out.get("links") or []), link_id]
    instance["inputs"][slot]["link"] = link_id


def upgrade(
    workflow: Mapping[str, Any],
    blocks: Mapping[str, Block],
    briefs: Mapping[str, Sequence[Mapping[str, Any]]],
) -> Upgrade:
    """``workflow`` with its blocks brought up to date (a copy; ``briefs``: :func:`brief_outputs`)."""
    result: dict[str, Any] = copy.deepcopy(dict(workflow))
    definitions = (result.get("definitions") or {}).get("subgraphs")
    if not isinstance(definitions, list):
        return Upgrade(result)
    updated: list[str] = []
    kept: list[tuple[str, str]] = []
    replaced: dict[str, tuple[Block, list[str], list[str]]] = {}
    for index, old in enumerate(definitions):
        if not isinstance(old, Mapping) or has_creativity(old):
            continue
        block = _block_for(old, blocks)
        if block is None:
            continue
        name = str(old.get("name") or block.name)
        why = misfit(old, block.definition)
        if why:
            kept.append((name, why))
            continue
        definitions[index] = {**copy.deepcopy(dict(block.definition)), "id": old.get("id")}
        replaced[str(old.get("id"))] = (
            block,
            _names(old.get("inputs")),
            _names(block.definition.get("inputs")),
        )
        updated.append(name)
    linked: list[str] = []
    unlinked: list[tuple[str, str]] = []
    nodes = [node for node in result.get("nodes") or [] if isinstance(node, dict)]
    brief_nodes = [node for node in nodes if node.get("type") in BRIEF_NODES]
    for node in nodes:
        entry = replaced.get(str(node.get("type")))
        if entry is None:
            continue
        block, before, after = entry
        inputs = node.get("inputs")
        if not isinstance(inputs, list):
            inputs = node["inputs"] = []
        names = _names(inputs)
        if (
            after[: len(names)] == names
        ):  # the instance's inputs in its block's order: the missing ones after them
            fresh = {str(slot.get("name")): slot for slot in block.instance.get("inputs") or []}
            for name in after[len(names) :]:
                inputs.append({**copy.deepcopy(dict(fresh.get(name) or {"name": name})), "link": None})
            values, defaults = node.get("widgets_values"), block.instance.get("widgets_values")
            if isinstance(values, list) and isinstance(defaults, list) and len(values) < len(defaults):
                values.extend(copy.deepcopy(defaults[len(values) :]))
        # outputs the current block adds after the old ones (the render blocks' retakes, 2026-10-24)
        outputs = node.get("outputs")
        current_outputs = [slot for slot in block.instance.get("outputs") or [] if isinstance(slot, Mapping)]
        if isinstance(outputs, list) and _names(current_outputs)[: len(outputs)] == _names(outputs):
            for added in current_outputs[len(outputs) :]:
                outputs.append({**copy.deepcopy(dict(added)), "links": None})
        if CREATIVITY not in after[len(before) :]:
            continue
        label = str(node.get("title") or block.name)
        names = _names(inputs)
        if CREATIVITY not in names:
            unlinked.append((label, "its inputs are not in the order of its block"))
            continue
        slot = names.index(CREATIVITY)
        if inputs[slot].get("link") is not None:
            continue
        if len(brief_nodes) != 1:
            unlinked.append((label, "the workflow has no single brief to link it from"))
            continue
        brief = brief_nodes[0]
        output = _brief_output(brief, briefs.get(str(brief.get("type"))) or [])
        if output is None:
            unlinked.append((label, "the brief is from a version without the creativity output"))
            continue
        _link_creativity(result, brief, output, node, slot)
        linked.append(label)
    return Upgrade(result, tuple(updated), tuple(kept), tuple(linked), tuple(unlinked))
