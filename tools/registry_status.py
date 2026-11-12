"""The Comfy Registry's status of each published version (phase R2): Active, Pending, Flagged, Banned - and for a
flagged one the class the review named.

    python tools/registry_status.py                 # every version and its status
    python tools/registry_status.py --version 2.0.0 # one version (exit 1 when it is flagged or banned)
    python tools/registry_status.py --json > status.json
    python tools/registry_status.py --since status.json   # print only what changed (the scheduled workflow)

Reads the Registry's public API (no token). Standard library only. The reviewer's own name or address in a status
reason is not printed: only the class labels (for example ``arbitrary-file-launch``) and the policy.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

NODE = "comfyui-plenio-music"
API = "https://api.comfy.org"
STATUSES = (
    "NodeVersionStatusActive",
    "NodeVersionStatusPending",
    "NodeVersionStatusFlagged",
    "NodeVersionStatusBanned",
    "NodeVersionStatusDeleted",
)
LABEL = re.compile(r"\b(policy-v[\d.]+|[a-z]+(?:-[a-z]+)+)\b")


def fetch(get: Any = None) -> dict[str, dict[str, Any]]:
    """Version -> ``{"status", "reasons"}`` for every status (the API is paged; ``statuses=`` is the filter's name)."""
    get = get or _get
    found: dict[str, dict[str, Any]] = {}
    for status in STATUSES:
        page = 1
        while True:
            query = urllib.parse.urlencode(
                {
                    "nodeId": NODE,
                    "statuses": status,
                    "include_status_reason": "true",
                    "limit": 50,
                    "page": page,
                }
            )
            data = get(f"{API}/versions?{query}")
            rows = data.get("versions") or []
            for row in rows:
                version = str(row.get("version", ""))
                if version:
                    found[version] = {
                        "status": status.removeprefix("NodeVersionStatus"),
                        "reasons": labels(str(row.get("status_reason", ""))),
                    }
            if page >= int(data.get("totalPages") or 1) or not rows:
                break
            page += 1
    return found


def labels(reason: str) -> list[str]:
    """The class labels and the policy of a status reason - never a name or an address."""
    text = re.sub(r"\S+@\S+", "", reason)
    return sorted(
        {
            m
            for m in LABEL.findall(text)
            if m.startswith("policy-")
            or m in KNOWN
            or m.endswith(("-launch", "-injection", "-read", "-traversal", "-disclosure", "-execution"))
        }
    )


KNOWN = {
    "reviewed-safe",
    "reflag-pending-review",
    "information-disclosure",
    "arbitrary-file-launch",
    "command-injection",
    "arbitrary-file-read",
    "path-traversal",
    "code-execution",
}


def _get(url: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url, headers={"Accept": "application/json", "User-Agent": "plenio-registry-status"}
    )
    with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - the Registry's fixed https API
        result: dict[str, Any] = json.load(answer)
        return result


def changes(before: dict[str, dict[str, Any]], now: dict[str, dict[str, Any]]) -> list[str]:
    lines = []
    for version in sorted(now, key=_order):
        old = before.get(version)
        if old is None:
            lines.append(
                f"{version}: {now[version]['status']} (new) {' '.join(now[version]['reasons'])}".rstrip()
            )
        elif old != now[version]:
            lines.append(
                f"{version}: {old['status']} -> {now[version]['status']} {' '.join(now[version]['reasons'])}".rstrip()
            )
    return lines


def _order(version: str) -> tuple[int, ...]:
    return tuple(int(x) for x in re.findall(r"\d+", version)) or (0,)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--version")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--since", type=Path, help="an earlier --json output: print only the changes")
    args = parser.parse_args(argv)
    now = fetch()
    if args.json:
        print(json.dumps(now, indent=1, sort_keys=True))
        return 0
    if args.since is not None:
        before = json.loads(args.since.read_text(encoding="utf-8")) if args.since.exists() else {}
        for line in changes(before, now):
            print(line)
        return 0
    if args.version:
        row = now.get(args.version)
        print(
            f"{args.version}: {row['status']} {' '.join(row['reasons'])}".rstrip()
            if row
            else f"{args.version}: not on the Registry"
        )
        return 1 if row and row["status"] in ("Flagged", "Banned") else 0
    for version in sorted(now, key=_order, reverse=True):
        print(f"{version:>8}  {now[version]['status']:<8} {' '.join(now[version]['reasons'])}".rstrip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
