"""Where a run's time went: seconds per stage, for the release record (``plenio.timings/1``).

A **stage** is a group of the template (the Song API names the same groups as a job's ``stage``). The host notes
when ComfyUI starts each node (``plenio.comfy.host``); the time from one start to the next belongs to the node
that started first, and so to its group. ``load_seconds`` is the part of a stage ComfyUI spent moving model
weights. A node ComfyUI took from its cache starts nothing and costs nothing here.

Standard library only.
"""

from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from typing import Any

SCHEMA = "plenio.timings/1"
OUTSIDE = "(outside the groups)"
"""The stage of a node that stands in no group (a workflow of one's own)."""


def stage_timings(
    starts: Sequence[tuple[str, float]],
    end: float,
    stage_of: Callable[[str], str],
    *,
    began: float | None = None,
    loads: Mapping[str, float] | None = None,
    peak_vram_gib: float | None = None,
) -> dict[str, Any] | None:
    """The timings of a run: ``starts`` are the nodes ComfyUI started, in order, each with its time; ``end`` is
    now; ``stage_of`` names a node's stage (``""``: none); ``began`` is when the run was taken from the queue
    (else the first start); ``loads`` are the seconds of model loading per node. ``None`` when nothing was noted.
    Stages come in the order the run first reached them; a stage reached again adds to its entry."""
    ordered = [(str(node), float(at)) for node, at in starts if at <= end]
    if not ordered:
        return None
    seconds: dict[str, float] = {}
    loading: dict[str, float] = {}
    for index, (node, at) in enumerate(ordered):
        until = ordered[index + 1][1] if index + 1 < len(ordered) else end
        stage = stage_of(node) or OUTSIDE
        seconds[stage] = seconds.get(stage, 0.0) + max(0.0, until - at)
        loaded = float((loads or {}).get(node, 0.0))
        if loaded > 0:
            loading[stage] = loading.get(stage, 0.0) + loaded
    stages: list[dict[str, Any]] = []
    for stage, spent in seconds.items():
        entry: dict[str, Any] = {"stage": stage, "seconds": round(spent, 3)}
        if stage in loading:
            entry["load_seconds"] = round(min(loading[stage], spent), 3)
        stages.append(entry)
    first = ordered[0][1] if began is None or began > ordered[0][1] else began
    out: dict[str, Any] = {
        "schema": SCHEMA,
        "total_seconds": round(max(0.0, end - first), 3),
        "stages": stages,
    }
    if peak_vram_gib is not None and peak_vram_gib > 0:
        out["peak_vram_gib"] = round(peak_vram_gib, 2)
    return out
