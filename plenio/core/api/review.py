"""Review stops of the Song API v2 (PD 8.1): a job may ask to stop where the templates' Song Sheets stop, and
``approve`` lets it go on - with the documents edited or not.

A stop is the mechanism the templates have: a Song Sheet set to *stop for review* ends the run there, its outputs
blocked, and leaves its documents in the run's UI output (``plenio_sheet``, ``waiting``). The API sets each sheet's
``review`` input in the prompt - *stop for review* where the job wants a stop not approved yet, *continue* elsewhere -
and approving queues the same request again (the same seeds: ComfyUI's cache gives the same drafts) with the
approved stages on *continue* and every edited document as the Song Sheet's manual text.

Standard library only.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

SHEET = "PlenioSongSheet"
STOP = "stop for review"
GO_ON = "continue"


def stage_of(title: str) -> str:
    """A Song Sheet's stage by its title: ``Song Sheet · Text`` -> ``text``."""
    return title.rsplit("·", 1)[-1].strip().lower().split(" ")[0] if "·" in title else title.strip().lower()


def stages(prompt: Mapping[str, Any]) -> dict[str, str]:
    """The prompt's Song Sheets: node id -> stage."""
    return {
        str(node_id): stage_of(str((node.get("_meta") or {}).get("title") or ""))
        for node_id, node in prompt.items()
        if isinstance(node, Mapping) and node.get("class_type") == SHEET
    }


def set_stops(prompt: dict[str, Any], wanted: Iterable[str], approved: Iterable[str]) -> list[str]:
    """Each sheet's ``review`` for the job: a stop where ``wanted`` and not ``approved``, go on elsewhere. Returns
    the stages the prompt still stops at."""
    wanted_set, approved_set = set(wanted), set(approved)
    stopping: list[str] = []
    for node_id, stage in stages(prompt).items():
        stop = stage in wanted_set and stage not in approved_set
        prompt[node_id]["inputs"]["review"] = STOP if stop else GO_ON
        if stop:
            stopping.append(stage)
    return stopping


def unknown_stages(prompt: Mapping[str, Any], wanted: Iterable[str]) -> list[str]:
    known = set(stages(prompt).values())
    return [stage for stage in wanted if stage not in known]


def waiting(history: Mapping[str, Any]) -> dict[str, Any] | None:
    """The stop a finished run waits at: ``stage``, ``node``, ``documents`` (kind -> text) and ``fingerprint`` -
    ``None`` when no sheet waits."""
    prompt = (history.get("prompt") or [None, None, {}])[2] or {}
    by_node = stages(prompt) if isinstance(prompt, Mapping) else {}
    for node_id, output in (history.get("outputs") or {}).items():
        for payload in (output or {}).get("plenio_sheet") or []:
            if not isinstance(payload, Mapping) or not payload.get("waiting"):
                continue
            docs = payload.get("docs") or {}
            return {
                "stage": by_node.get(str(node_id), "sheet"),
                "node": str(node_id),
                "documents": {
                    str(kind): str((doc or {}).get("text") or "")
                    for kind, doc in docs.items()
                    if isinstance(doc, Mapping) and str(kind) in set(payload.get("owned") or docs)
                },
                "fingerprint": payload.get("fingerprint"),
            }
    return None


def edited(shown: Mapping[str, str], given: Any) -> dict[str, str]:
    """The documents an approval changed (kind -> text): those of ``given`` whose text differs from the shown one.
    ``given`` must be an object of texts; a kind the stop did not show is refused by ``prepare`` later."""
    if given is None:
        return {}
    if not isinstance(given, Mapping) or not all(isinstance(v, str) for v in given.values()):
        raise ValueError("'documents' is an object of texts")
    return {str(kind): text for kind, text in given.items() if text != shown.get(str(kind))}
