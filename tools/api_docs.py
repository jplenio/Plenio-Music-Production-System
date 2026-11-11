"""Write the Song API's reference for reading without a running ComfyUI: ``docs/api/openapi.json`` and
``docs/api/fields.md``.

A running ComfyUI describes its API itself (``GET /plenio/api/v1/openapi.json``, ``GET /plenio/api/v1/templates/{id}``),
made from its templates and node definitions. These copies are made the same way from the shipped templates and the
node types of the ComfyUI version Plenio is tested against (``tools/data/node_types.json``) - for docs/api/index.html,
for client generators, for readers who have no ComfyUI at hand. A test checks that they are current.

    python tools/api_docs.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from plenio import __version__  # noqa: E402
from plenio.core.song_api import V1_TEMPLATES, Field, Template, api_templates, load_template  # noqa: E402
from plenio.core.song_api_doc import openapi  # noqa: E402

FOLDER = PROJECT / "docs" / "api"
LIST_SHOWN = 12
"""A field's values shown in the table; a longer list (240 style templates) is cut, with how many there are."""


def _snapshot() -> dict[str, Any]:
    data: dict[str, Any] = json.loads(
        (PROJECT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8")
    )
    return data


def _comfyui(snapshot: dict[str, Any]) -> str:
    return str(snapshot.get("comfyui_ref") or snapshot.get("comfyui_version") or "").lstrip("v")


def templates() -> list[Template]:
    nodes: dict[str, Any] = _snapshot()["nodes"]
    workflows = {
        path.stem: json.loads(path.read_text(encoding="utf-8"))
        for path in sorted((PROJECT / "example_workflows").glob("*.json"))
    }
    return [
        load_template(name, workflow, nodes.get)
        for name, workflow in api_templates(workflows, V1_TEMPLATES).values()
    ]


def document() -> dict[str, Any]:
    data = openapi(templates(), plenio=__version__, comfyui=_comfyui(_snapshot()))
    # the copy describes the API of a ComfyUI on this computer: the full address, as a program would use it
    data["servers"] = [
        {
            "url": "http://127.0.0.1:8188/plenio/api/v1",
            "description": "ComfyUI on this computer (its default port)",
        },
        {"url": "http://127.0.0.1:8000/plenio/api/v1", "description": "ComfyUI Desktop"},
    ]
    return data


def _cell(text: Any) -> str:
    return str(text).replace("|", "\\|").replace("\n", " ").strip()


def _values(field: Field) -> str:
    if field.choices:
        shown = [f"`{c}`" for c in field.choices[:LIST_SHOWN]]
        more = len(field.choices) - LIST_SHOWN
        return ", ".join(shown) + (f" … ({len(field.choices)} in all)" if more > 0 else "")
    if field.minimum is not None or field.maximum is not None:
        return f"{field.minimum if field.minimum is not None else ''} … {field.maximum if field.maximum is not None else ''}"
    return ""


def _when(field: Field) -> str:
    return "; ".join(f"`{parent}` is {', '.join(f'`{v}`' for v in values)}" for parent, values in field.when)


def _rows(fields: tuple[Field, ...]) -> list[str]:
    rows = ["| Field | Type | Default | Values | Only when | What it does |", "|---|---|---|---|---|---|"]
    for field in fields:
        name = (
            f"`{field.id}`"
            + (" (fixed)" if field.fixed else "")
            + (" **required**" if field.required else "")
        )
        default = json.dumps(field.default, ensure_ascii=False) if field.default not in ("", None) else ""
        rows.append(
            f"| {name} | {field.type} | {_cell(default)} | {_cell(_values(field))} | {_cell(_when(field))} | "
            f"{_cell(field.description)} |"
        )
    return rows


def fields_text() -> str:
    snapshot = _snapshot()
    lines = [
        "# Song API: the fields of each template",
        "",
        "*Made by `tools/api_docs.py` from the shipped templates and the node definitions of ComfyUI "
        f"{_comfyui(snapshot)} - do not edit by hand.* A running ComfyUI tells its own, current list: "
        "`GET /plenio/api/v1/templates/{id}`. The guide: [README.md](README.md).",
        "",
        "Every field you leave out keeps the template's value (the *Default*). A field with *Only when* applies only "
        "while that field has one of those values; given otherwise, it is left out with a warning.",
    ]
    for template in templates():
        lines += [
            "",
            f"## `{template.id}` - {template.name}",
            "",
            f"Kind: **{template.kind}** · seeds: {', '.join(f'`{s.id}`' for s in template.seeds)} · documents: "
            f"{', '.join(f'`{d}`' for d in template.documents)}"
            + (f" · needs: {', '.join(f'`{n}`' for n in template.needs())}" if template.needs() else ""),
            "",
            "### `fields`",
            "",
            *_rows(template.fields),
            "",
            "### `release`",
            "",
            *_rows(template.release),
        ]
    return "\n".join(lines) + "\n"


def outputs() -> dict[Path, str]:
    return {
        FOLDER / "openapi.json": json.dumps(document(), ensure_ascii=False, indent=1) + "\n",
        FOLDER / "fields.md": fields_text(),
    }


def main() -> int:
    FOLDER.mkdir(parents=True, exist_ok=True)
    for path, text in outputs().items():
        path.write_bytes(text.encode("utf-8"))
        print(f"wrote {path.relative_to(PROJECT).as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
