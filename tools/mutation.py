"""Mutation runs on the modules where a silent fault costs a song (phase 9.3, PD 10.1).

A mutant is a small change of one line (``<`` for ``<=``, ``+ 1`` for ``- 1``, a constant changed); a mutant the
tests do not notice ("survived") names a line no test would miss. For each surviving mutant a test is added, or the
line is dead and removed, or the reason is written down.

mutmut 2 changes the source in place, so the run happens in an export of the commit (``git archive HEAD``) in a
temporary folder - never in the working tree, never while host tests copy the package::

    PYTHONPATH=.devdeps <python> tools/mutation.py                     # every module, about hours
    PYTHONPATH=.devdeps <python> tools/mutation.py plenio/core/access.py
    PYTHONPATH=.devdeps <python> tools/mutation.py --show <module>     # the survivors of a module, as diffs

It writes ``docs/test-reports/data/mutation-<date>.json``: per module the mutants killed, survived, timed out and
suspicious, and the survivors' ids. Needs ``mutmut==2.5.1`` in ``.devdeps`` (the owner's permission, 2026-11-12).
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
DEVDEPS = PROJECT / ".devdeps"

MODULES: dict[str, tuple[str, ...]] = {
    "plenio/core/access.py": ("test_route_access.py", "test_route_classes.py"),
    "plenio/core/modelplan.py": ("test_modelplan.py", "test_dependencies_system.py"),
    "plenio/core/assets/fetch.py": ("test_assets.py", "test_downloads.py"),
    "plenio/core/audio/loudness.py": ("test_audio.py", "test_refine.py", "test_quality.py"),
    "plenio/core/audio/dynamics.py": ("test_audio.py", "test_stems.py"),
    "plenio/core/release.py": (
        "test_release_formats.py",
        "test_sheet_release.py",
        "test_titles_and_times.py",
        "test_variables.py",
        "test_audit_regressions.py",
        "test_continuation.py",
        "test_timings.py",
    ),
    "plenio/core/lyrics_fit.py": ("test_lyrics_fit.py",),
    "plenio/core/score/note_repair.py": ("test_note_repair.py",),
    "plenio/core/score/ops.py": (
        "test_score_ops.py",
        "test_score_arrange.py",
        "test_arrangement.py",
        "test_fit_length.py",
    ),
}
"""The modules of PD 10.1 and the unit tests that exercise them (a mutant is run against these only)."""


def export(target: Path) -> None:
    """The commit's files (``git archive HEAD``) in ``target``."""
    target.mkdir(parents=True, exist_ok=True)
    archive = target.parent / "head.tar"
    subprocess.run(["git", "archive", "--format=tar", "-o", str(archive), "HEAD"], cwd=PROJECT, check=True)
    with tarfile.open(archive) as tar:
        tar.extractall(target, filter="data")
    archive.unlink()


def run_module(root: Path, module: str, python: str) -> dict[str, object]:
    tests = " ".join(f"tests/unit/{name}" for name in MODULES[module])
    # a wall-clock limit per run: a mutant can make a test hang, and mutmut's timeout does not end it on Windows
    limiter = PROJECT / "tools" / "mutation_runner.py"
    runner = f'"{python}" "{limiter}" 180 -x -q -p no:randomly -p no:cacheprovider -m "not io and not process" {tests}'
    env = {**os.environ, "PYTHONPATH": str(DEVDEPS), "HYPOTHESIS_PROFILE": "push", "PYTHONUTF8": "1"}
    cache = root / ".mutmut-cache"
    cache.unlink(missing_ok=True)
    subprocess.run(
        [
            python,
            "-m",
            "mutmut",
            "run",
            "--paths-to-mutate",
            module,
            "--runner",
            runner,
            "--no-progress",
            "--simple-output",
        ],
        cwd=root,
        env=env,
        check=False,
    )
    out = subprocess.run(
        [python, "-m", "mutmut", "junitxml"],
        cwd=root,
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    ).stdout
    survived = [int(n) for n in re.findall(r'<testcase[^>]*name="Mutant #(\d+)"[^>]*>\s*<failure', out)]
    total = len(re.findall(r'<testcase[^>]*name="Mutant #\d+"', out))
    results = subprocess.run(
        [python, "-m", "mutmut", "results"],
        cwd=root,
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    ).stdout
    counts = {}
    for label, key in (("Survived", "survived"), ("Timed out", "timed_out"), ("Suspicious", "suspicious")):
        part = re.search(rf"{label}[^\n]*\((\d+)\)", results)
        counts[key] = int(part.group(1)) if part else 0
    rate = round(100 * counts["survived"] / total, 1) if total else 0.0
    # each survivor as its diff, while this module's cache is there (the next module's run replaces it)
    diffs = {}
    for number in survived:
        shown = subprocess.run(
            [python, "-m", "mutmut", "show", str(number)],
            cwd=root,
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        ).stdout
        kept = [
            line
            for line in shown.splitlines()
            if line.startswith(("@@", "-", "+")) and not line.startswith(("---", "+++"))
        ]
        diffs[str(number)] = "\n".join(kept)
    return {
        "mutants": total,
        **counts,
        "killed": total - counts["survived"] - counts["timed_out"] - counts["suspicious"],
        "survived_percent": rate,
        "survivors": diffs or None,
        "results": results,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("modules", nargs="*", help=f"of: {', '.join(MODULES)} (default: all)")
    parser.add_argument("--root", type=Path, help="run in this export (kept); default: a new temporary one")
    parser.add_argument("--label", default=datetime.date.today().isoformat())
    args = parser.parse_args(argv)
    modules = args.modules or list(MODULES)
    unknown = [m for m in modules if m not in MODULES]
    if unknown:
        parser.error(f"not a listed module: {', '.join(unknown)}")
    root = (
        args.root or Path(tempfile.mkdtemp(prefix="plenio-mutation-")) / "plenio-export"
    )  # not a package name: pytest must not import its __init__.py
    if not (root / "plenio").is_dir():
        export(root)
    report: dict[str, object] = {
        "schema": "plenio.mutation/1",
        "label": args.label,
        "tool": "mutmut 2.5.1",
        "modules": {},
    }
    target = PROJECT / "docs" / "test-reports" / "data" / f"mutation-{args.label}.json"
    if target.exists():
        report = json.loads(target.read_text(encoding="utf-8"))
    for module in modules:
        print(f"== {module}", flush=True)
        found = run_module(root, module, sys.executable)
        found.pop("results", None)
        report["modules"][module] = found  # type: ignore[index]
        target.write_bytes((json.dumps(report, indent=1) + "\n").encode())
        print(
            f"   {found['mutants']} mutants, {found['survived']} survived ({found['survived_percent']} %)",
            flush=True,
        )
    print(f"written: {target.relative_to(PROJECT)}; the export stays in {root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
