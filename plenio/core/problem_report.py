"""A problem report to attach to an issue (PD 4.3): the system report, the ComfyUI log lines that mention Plenio,
the failing node's error and the workflow with its text fields emptied - cleaned of this computer's places and of
the user's name before anyone sees it.

Every path in the texts keeps only its last two parts (``…/models/checkpoints``): enough to tell a wrong folder,
nothing about where the user keeps things. The user's name - from the home folder - becomes ``<user>`` wherever it
stands. The page shows the files before they are saved.

Standard library only.
"""

from __future__ import annotations

import io
import json
import re
import zipfile
from collections.abc import Iterable, Mapping
from typing import Any

LOG_LINES = 200
"""The ComfyUI log lines that mention Plenio, at most this many - the newest."""
USER = "<user>"

# a Windows path (C:\… or C:/…, also \\server\share\…) or an absolute POSIX path of two parts or more
_PATH = re.compile(
    # separators may come doubled: a path quoted in a Python message reads C:\\Users\\...
    r"(?:(?<![\w])[A-Za-z]:[\\/]+|(?<![\w])~[\\/]+|\\\\+[^\\/\s]+[\\/]+)(?:[^\\/\s\"'<>|:*?]+[\\/]+)*[^\\/\s\"'<>|:*?]*"
    r"|(?<![\w.:/])/(?:[^/\s\"'<>]+/)+[^/\s\"'<>]*"
)


def _short(path: str) -> str:
    trail = path.rstrip("\\/")
    parts = [part for part in re.split(r"[\\/]+", trail) if part and not part.endswith(":")]
    if len(parts) <= 2:
        return "…/" + "/".join(parts) if parts else "…"
    return "…/" + "/".join(parts[-2:])


def clean_text(text: str, names: Iterable[str] = (), home: str = "") -> str:
    """``text`` with every path cut to its last two parts and each of ``names`` (the user's name) replaced. The home
    folder is taken out first: its name may hold a space, which ends a path in free text."""
    base = home.rstrip("\\/")
    if base:
        for form in {base, base.replace("\\", "/")}:
            text = re.sub(re.escape(form) + r"(?=[\\/]|\s|$)", "~", text, flags=re.IGNORECASE)
    cleaned = _PATH.sub(lambda match: _short(match.group(0)), text)
    for name in sorted({n for n in names if n and len(n) >= 2}, key=len, reverse=True):
        cleaned = re.sub(rf"(?<![\w]){re.escape(name)}(?![\w])", USER, cleaned, flags=re.IGNORECASE)
    return cleaned


def user_names(home: str) -> list[str]:
    """The user's name as the home folder gives it (``C:\\Users\\Ana`` -> ``Ana``)."""
    name = re.split(r"[\\/]+", home.rstrip("\\/"))[-1] if home else ""
    return [name] if name and name.lower() not in ("root", "home", "users") else []


def _emptied(value: Any) -> Any:
    """A widget value as the report keeps it: words a user typed (text with a space or a line) become empty."""
    if isinstance(value, str) and (" " in value.strip() or "\n" in value):
        return ""
    if isinstance(value, list):
        return [_emptied(item) for item in value]
    if isinstance(value, dict):
        return {key: _emptied(item) for key, item in value.items()}
    return value


def empty_workflow(workflow: Mapping[str, Any]) -> dict[str, Any]:
    """The workflow without what the user wrote: every text field emptied, in the graph and in its blocks; the
    nodes, links, choices and numbers stay (they show how the run was set up)."""
    out: dict[str, Any] = json.loads(json.dumps(workflow))

    def nodes(container: Any) -> None:
        for node in container.get("nodes", []) if isinstance(container, dict) else []:
            if isinstance(node, dict) and "widgets_values" in node:
                node["widgets_values"] = _emptied(node["widgets_values"])

    nodes(out)
    for subgraph in (out.get("definitions") or {}).get("subgraphs", []) or []:
        nodes(subgraph)
    for key in ("extra",):
        if isinstance(out.get(key), dict):
            out[key].pop("plenio_api", None)
    return out


def _cleaned(data: Any, names: list[str], home: str) -> Any:
    """``clean_text`` for every text in JSON data (before it is written: escaped backslashes hide a path)."""
    if isinstance(data, str):
        return clean_text(data, names, home)
    if isinstance(data, list):
        return [_cleaned(item, names, home) for item in data]
    if isinstance(data, dict):
        return {clean_text(str(key), names, home): _cleaned(item, names, home) for key, item in data.items()}
    return data


def report_files(
    *,
    system: str,
    log: Iterable[str],
    error: Mapping[str, Any] | None,
    workflow: Mapping[str, Any] | None,
    home: str,
    version: str,
) -> dict[str, str]:
    """The files of the report, cleaned: name -> text."""
    names = user_names(home)
    lines = [line.rstrip("\n") for line in log if "plenio" in line.lower()][-LOG_LINES:]
    files = {
        "README.txt": (
            f"A problem report of Plenio {version}. Paths are cut to their last two parts and the user's name is "
            f"replaced by {USER}; the workflow's text fields are empty.\n"
        ),
        "system-check.md": clean_text(system, names, home),
        "comfyui-log.txt": clean_text("\n".join(lines), names) + ("\n" if lines else ""),
    }
    if error:
        files["error.json"] = json.dumps(_cleaned(dict(error), names, home), indent=1, ensure_ascii=False)
    if workflow:
        files["workflow.json"] = json.dumps(
            _cleaned(empty_workflow(workflow), names, home), indent=1, ensure_ascii=False
        )
    return files


def zip_bytes(files: Mapping[str, str]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, text in files.items():
            archive.writestr(f"plenio-report/{name}", text)
    return buffer.getvalue()
