"""The documentation against the code (phase D3, PD 10.3): every relative link resolves, every environment variable
Plenio reads is documented (and every documented one is read), every section of the config file is described, every
HTTP route is named in a reference.

    python tools/doc_check.py      # exit 1 with the list of what does not hold

Standard library only; reads files, imports nothing of Plenio.
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]

PAGES = ("README.md", "SECURITY.md", "CHANGELOG.md", "CONTRIBUTING.md", "docs")
"""Where relative links are checked (a folder: every Markdown file in it)."""

LINK = re.compile(
    r"(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)|<img[^>]+src=\"([^\"]+)\"|<a[^>]+href=\"([^\"]+)\""
)
FENCE = re.compile(r"^(```|~~~)")

OTHER_ENVIRONMENT = ("HF_ENDPOINT", "HF_TOKEN")
"""Variables of other programs Plenio reads (Hugging Face's mirror and token)."""

REFERENCES = ("docs/api", "docs/security", "SECURITY.md", "docs/user", "docs/dev")
"""Where a route counts as documented."""

INTERNAL = "internal"
"""A route whose table entry says so is the frontend's own and needs no reference."""


def markdown_files() -> Iterator[Path]:
    for name in PAGES:
        path = PROJECT / name
        if path.is_dir():
            yield from sorted(path.rglob("*.md"))
        elif path.is_file():
            yield path


def outside_code(text: str) -> str:
    """``text`` without fenced code blocks and inline code (a path there is an example, not a link)."""
    kept, fenced = [], False
    for line in text.splitlines():
        if FENCE.match(line.strip()):
            fenced = not fenced
            continue
        if not fenced:
            kept.append(re.sub(r"`[^`]*`", "", line))
    return "\n".join(kept)


def broken_links() -> list[str]:
    found = []
    for page in markdown_files():
        text = outside_code(page.read_text(encoding="utf-8"))
        for match in LINK.finditer(text):
            target = next(group for group in match.groups() if group)
            if re.match(r"^[a-z][a-z0-9+.-]*:", target) or target.startswith(("#", "//")):
                continue  # another site, an e-mail, a place on the same page
            path = target.split("#", 1)[0].split("?", 1)[0]
            if not path:
                continue
            resolved = (page.parent / path) if not path.startswith("/") else PROJECT / path.lstrip("/")
            if not resolved.exists():
                found.append(f"{page.relative_to(PROJECT).as_posix()}: no {target}")
    return found


def read_variables() -> set[str]:
    """The environment variables Plenio's shipped code reads."""
    names: set[str] = set(OTHER_ENVIRONMENT)
    for path in (PROJECT / "plenio").rglob("*.py"):
        if "third_party" in path.parts:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if re.search(r"environ|\benv\[|\benv\.get|getenv|\bin env\b|SWITCH = ", line):
                names.update(re.findall(r"\bPLENIO_[A-Z0-9_]+\b", line))
    return names


def variable_problems() -> list[str]:
    read = read_variables()
    user = "\n".join(p.read_text(encoding="utf-8") for p in sorted((PROJECT / "docs" / "user").rglob("*.md")))
    configuration = (PROJECT / "docs" / "user" / "configuration.md").read_text(encoding="utf-8")
    code = "\n".join(
        p.read_text(encoding="utf-8")
        for p in (PROJECT / "plenio").rglob("*.py")
        if "third_party" not in p.parts
    )
    problems = [
        f"{name}: read by Plenio, documented nowhere in docs/user"
        for name in sorted(read)
        if name not in user
    ]
    documented = set(re.findall(r"^\| `(PLENIO_[A-Z0-9_]+)`", configuration, re.M))
    problems += [
        f"{name}: in docs/user/configuration.md, read nowhere"
        for name in sorted(documented)
        if name not in code
    ]
    return problems


def config_sections() -> list[str]:
    """Every section the config file may have (``core/config.py``) is in the guide's example."""
    source = (PROJECT / "plenio" / "core" / "config.py").read_text(encoding="utf-8")
    sections = set(re.findall(r"values\.get\(\"([a-z_]+)\"\)", source)) | set(
        re.findall(r"_table\(values, \"([a-z_.]+)\"", source)
    )
    guide = (PROJECT / "docs" / "user" / "configuration.md").read_text(encoding="utf-8")
    return [
        f"[{name}]: read from the config file, not in docs/user/configuration.md"
        for name in sorted(sections)
        if f"[{name}]" not in guide
    ]


def routes() -> list[tuple[str, str, str]]:
    """``(method, path, the line)`` of every route in Plenio's tables (``Route("GET", "/plenio/...", ...)``)."""
    found = []
    for path in sorted((PROJECT / "plenio").rglob("*.py")):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(
            r"Route\(\s*\"([A-Z]+)\",\s*(?:f?\"([^\"]+)\"|([A-Z_]+)\s*\+\s*\"([^\"]*)\")", text
        ):
            method, literal, base, rest = match.groups()
            route = literal if literal else f"{{{base}}}{rest}"
            end = text.find("\n    Route(", match.end())
            found.append((method, route, text[match.start() : end if end > 0 else match.end() + 400]))
    return found


def route_problems() -> list[str]:
    references = "\n".join(
        p.read_text(encoding="utf-8")
        for name in REFERENCES
        for p in ((PROJECT / name).rglob("*") if (PROJECT / name).is_dir() else [PROJECT / name])
        if p.is_file() and p.suffix in (".md", ".json")
    )
    problems = []
    for method, path, entry in routes():
        if INTERNAL in entry.split(")", 1)[0] or "{" in path:
            continue  # the frontend's own, or one under the API's base the OpenAPI document lists by itself
        tail = re.sub(r"\{[^}]+\}", "", path).rstrip("/")
        # a reference may name a family: `/plenio/score/*`, `/plenio/templates*`
        families = {f.rstrip("*").rstrip("/") for f in re.findall(r"(/plenio/[\w/.-]*)\*", references)}
        if tail not in references and not any(tail.startswith(family) for family in families):
            problems.append(f"{method} {path}: in no reference ({', '.join(REFERENCES)})")
    return problems


def main() -> int:
    problems = broken_links() + variable_problems() + config_sections() + route_problems()
    for problem in problems:
        print(problem)
    print(f"doc check: {len(problems)} problem(s)" if problems else "doc check: no problem")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
