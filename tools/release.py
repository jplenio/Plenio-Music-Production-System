"""The release tool (MP 8.2): ``prepare`` makes a version ready to tag, ``verify`` checks the committed tree.

    python tools/release.py version                    # the version the tree says (pyproject.toml)
    python tools/release.py version 2.0.0              # write it everywhere it stands
    python tools/release.py prepare 2.0.0 --bench docs/test-reports/data/bench-<label>.json
    python tools/release.py verify                     # the checks again, nothing written

``prepare`` writes the version into ``pyproject.toml``, ``plenio/__init__.py``, ``frontend/package.json`` and its lock
file; dates the CHANGELOG section (it must have its intro); regenerates the generated files (graphs, API docs,
facts, media links); writes the release notes (``docs/releases/<version>.md``) and the review request with the
gate's delta against the last published version (``docs/security/review-<version>.md``); checks the benchmark
report against the budgets; then runs ``verify``. It stops at the first failure and commits nothing: the result is
the diff to review. Tagging and pushing are the owner's.
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import subprocess
import sys
from collections.abc import Sequence
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tools"))

PREVIOUS = "c307d35"
"""The last published version's commit (1.6.0; no local tag) - the review request's delta is taken against it."""
PREVIOUS_NAME = "1.6.0"
VERSION = re.compile(r"\d+\.\d+\.\d+")


def run(*command: str, cwd: Path = PROJECT) -> None:
    print("$", " ".join(command), flush=True)
    done = subprocess.run(list(command), cwd=cwd, check=False)  # noqa: S603 - the release tool's fixed commands
    if done.returncode != 0:
        raise SystemExit(f"failed: {' '.join(command)}")


def current() -> str:
    match = re.search(r'^version = "([^"]+)"', (PROJECT / "pyproject.toml").read_text(encoding="utf-8"), re.M)
    if not match:
        raise SystemExit("pyproject.toml names no version")
    return match.group(1)


def _sub(path: Path, pattern: str, new: str, count: int = 1) -> None:
    text = path.read_bytes().decode()
    replaced, n = re.subn(pattern, new, text, count=count, flags=re.M)
    if n == 0:
        raise SystemExit(f"{path.relative_to(PROJECT)}: no version found ({pattern})")
    path.write_bytes(replaced.encode())


def set_version(version: str) -> None:
    """The version wherever it stands (the facts follow with ``tools/facts.py --write``)."""
    _sub(PROJECT / "pyproject.toml", r'^version = "[^"]+"', f'version = "{version}"')
    _sub(PROJECT / "plenio" / "__init__.py", r'^__version__ = "[^"]+"', f'__version__ = "{version}"')
    _sub(PROJECT / "frontend" / "package.json", r'^  "version": "[^"]+"', f'  "version": "{version}"')
    lock = PROJECT / "frontend" / "package-lock.json"
    data = json.loads(lock.read_text(encoding="utf-8"))
    data["version"] = version
    data.setdefault("packages", {}).setdefault("", {})["version"] = version
    lock.write_bytes((json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode())


def versions() -> dict[str, str]:
    """Every place the version stands, and what it says there."""
    lock = json.loads((PROJECT / "frontend" / "package-lock.json").read_text(encoding="utf-8"))
    package = json.loads((PROJECT / "frontend" / "package.json").read_text(encoding="utf-8"))
    init = re.search(
        r'^__version__ = "([^"]+)"', (PROJECT / "plenio" / "__init__.py").read_text(encoding="utf-8"), re.M
    )
    facts = json.loads((PROJECT / "docs" / "facts.json").read_text(encoding="utf-8"))
    return {
        "pyproject.toml": current(),
        "plenio/__init__.py": init.group(1) if init else "",
        "frontend/package.json": package.get("version", ""),
        "frontend/package-lock.json": lock.get("version", ""),
        "frontend/package-lock.json (root package)": lock.get("packages", {}).get("", {}).get("version", ""),
        "docs/facts.json": facts.get("version", ""),
    }


def date_changelog(version: str, today: str) -> None:
    """``## <version> - unreleased`` (or an older date) becomes ``## <version> - <today>``; the section must have an
    intro before its first part."""
    from release_notes import parts, section

    path = PROJECT / "CHANGELOG.md"
    text = path.read_bytes().decode()
    if not section(version, text):
        raise SystemExit(f"CHANGELOG.md has no section ## {version}")
    intro, _ = parts(section(version, text))
    if not intro:
        raise SystemExit(f"CHANGELOG.md: write the intro of {version} (a paragraph before its first ###)")
    _sub(path, rf"^## {re.escape(version)}\b[^\n\r]*", f"## {version} - {today}")


def review_request(version: str) -> str:
    """The review request from its template, with the gate's findings and the delta against the last version."""
    import package_gate

    tree = package_gate.read_tree(PROJECT)
    found = package_gate.check(tree)
    before = package_gate.check(package_gate.read_ref(PROJECT, PREVIOUS))
    sites = "\n".join(f"- `{site}`" for site in package_gate.launch_sites(tree)) or "- none"
    changes = package_gate.delta(before, found)
    delta = "\n".join(
        f"- {kind}: [{rule}] `{path}` - {package_gate.RULES[rule]}"
        for rule, change in changes.items()
        for kind in ("removed", "added")
        for path in change[kind]
    )
    template = (PROJECT / "docs" / "security" / "review-template.md").read_text(encoding="utf-8")
    return template.format(
        version=version,
        previous=PREVIOUS_NAME,
        launch_sites=sites,
        findings="no finding" if not found else "\n".join(f"- {f}" for f in found),
        delta=f"{len(before)} finding(s) on {PREVIOUS_NAME}, {len(found)} now:\n\n{delta or '- no change'}",
    )


def verify(version: str | None = None) -> int:
    """The checks on the tree as it is; nothing is written."""
    version = version or current()
    problems = []
    disagree = {place: v for place, v in versions().items() if v != version}
    if disagree:
        problems.append(f"the version is not {version} in: {disagree}")
    changelog = (PROJECT / "CHANGELOG.md").read_text(encoding="utf-8")
    if not re.search(rf"^## {re.escape(version)} - \d{{4}}-\d{{2}}-\d{{2}}\s*$", changelog, re.M):
        problems.append(f"CHANGELOG.md: no dated section ## {version} - <date>")
    for path in (
        PROJECT / "docs" / "releases" / f"{version}.md",
        PROJECT / "docs" / "security" / f"review-{version}.md",
    ):
        rel = path.relative_to(PROJECT).as_posix()
        tracked = subprocess.run(  # noqa: S603, S607 - git, fixed arguments
            ["git", "ls-files", "--error-unmatch", rel], cwd=PROJECT, capture_output=True, check=False
        )
        if not path.exists():
            problems.append(f"{rel} is missing (release.py prepare writes it)")
        elif tracked.returncode != 0:
            # the tag's release job reads them from the commit: a file left untracked fails it after the push
            problems.append(f"{rel} is not committed: git add docs/releases docs/security before the commit")
    python = sys.executable
    for command in (
        [python, "tools/facts.py", "--check"],
        [python, "tools/doc_check.py"],
        [python, "tools/media_links.py", "--check"],
        [python, "tools/release_notes.py", version, "--check"],
        [python, "tools/workflow_validation.py"],
        [python, "tools/package_gate.py", "--tree", "."],
    ):
        done = subprocess.run(  # noqa: S603 - this Python and the repository's own tools
            command,
            cwd=PROJECT,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if done.returncode != 0:
            said = (done.stderr or done.stdout).strip().splitlines()[-8:]
            problems.append(f"failed: {' '.join(command[1:])}" + "".join(f"\n    {line}" for line in said))
    for problem in problems:
        print(problem, file=sys.stderr)
    print(f"verify {version}: {'ok' if not problems else f'{len(problems)} problem(s)'}")
    return 1 if problems else 0


def prepare(version: str, bench: Path | None, today: str) -> int:
    import bench as bench_tool

    if subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=no"],
        cwd=PROJECT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip():  # noqa: S607
        raise SystemExit("prepare needs a clean tree: commit or stash first")
    if bench is None:
        raise SystemExit(
            f"prepare asks for a benchmark report of {version}: --bench docs/test-reports/data/bench-<label>.json"
        )
    report = json.loads(bench.read_text(encoding="utf-8"))
    if not str(report.get("label", "")).startswith(version):
        raise SystemExit(f"{bench.name} is the benchmark of {report.get('label')!r}, not of {version}")
    rows = bench_tool.check_report(bench)
    budgets = set(json.loads(bench_tool.BUDGETS.read_text(encoding="utf-8")).get("briefs", {}))
    missing = sorted(budgets - {row["brief"] for row in rows})
    if missing:
        raise SystemExit(f"the report has no successful run of {missing}: run those briefs of tools/bench.py")
    over = [row for row in rows if row["slower"]]
    if over:
        raise SystemExit(
            f"over budget: {[row['brief'] for row in over]} - give the reason in the release checklist, or fix it"
        )
    set_version(version)
    date_changelog(version, today)
    python = sys.executable
    run(python, "tools/build_graphs.py")
    run(python, "tools/api_docs.py")
    run(python, "tools/facts.py", "--write")
    run(python, "tools/media_links.py", "--write")
    run(python, "tools/release_notes.py", version)
    review = PROJECT / "docs" / "security" / f"review-{version}.md"
    review.write_bytes(review_request(version).encode())
    print(f"wrote {review.relative_to(PROJECT)}")
    status = verify(version)
    print(
        "\nReview the diff (git diff; the notes and the review request are new files), then:\n"
        f'  git add docs/releases docs/security && git commit -am "Release {version}" && python tools/release.py verify\n'
        f"and the owner tags and pushes: git tag v{version} && git push origin main v{version}"
    )
    return status


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    v = sub.add_parser("version", help="print the version, or write a new one everywhere")
    v.add_argument("new", nargs="?")
    p = sub.add_parser("prepare")
    p.add_argument("new")
    p.add_argument("--bench", type=Path, help="the benchmark report of this version (bench.py's JSON)")
    p.add_argument("--date", default=datetime.date.today().isoformat())
    sub.add_parser("verify")
    args = parser.parse_args(argv)
    if args.command == "version":
        if args.new is None:
            print(current())
            return 0
        if not VERSION.fullmatch(args.new):
            raise SystemExit("a version is three numbers: 2.0.0 (no pre-release versions)")
        set_version(args.new)
        run(sys.executable, "tools/facts.py", "--write")
        return 0
    if args.command == "prepare":
        if not VERSION.fullmatch(args.new):
            raise SystemExit("a version is three numbers: 2.0.0 (no pre-release versions)")
        return prepare(args.new, args.bench, args.date)
    return verify()


if __name__ == "__main__":
    raise SystemExit(main())
