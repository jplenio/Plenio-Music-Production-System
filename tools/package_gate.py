"""The package gate: what the Comfy Registry package may start, checked on the package itself.

    python tools/package_gate.py node.zip            # the zip `comfy node pack` wrote
    python tools/package_gate.py --tree .            # this checkout, as it would be packed (git + .comfyignore)
    python tools/package_gate.py --ref v1.6.0        # a tag or commit, as it would be packed
    python tools/package_gate.py node.zip --delta v1.6.0   # also: what changed against that version, by rule

The Registry package starts nothing but **this Python with Plenio's own modules**, at three places (``ACCEPTED``),
and opens the player's own page in the browser at one (``BROWSER``). Everything else that would start a program,
run a shell, build a command as one string, evaluate code or install packages is a finding, and a finding fails
the build. The functions that start other programs live in the Studio add-on (``plenio/addons``), which the package
leaves out.

The gate reads **syntax trees**, not text: a comment, a name or a string cannot hide a call or fake one, and an
alias (``import subprocess as sp``, ``from os import system``) is followed. It is deliberately strict where a
scanner would have to guess: a command must be a list written in the same function, and its first element must be
``sys.executable``.

Standard library only (it runs in the CI's packaging job, which installs nothing else).
"""

from __future__ import annotations

import argparse
import ast
import fnmatch
import io
import json
import subprocess
import sys
import zipfile
from collections import Counter
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path

ACCEPTED: Mapping[str, str] = {
    "plenio/core/workers/protocol.py": "this Python runs one of Plenio's worker modules (the ASR) as a process",
    "plenio/player/launch.py": "this Python runs the Plenio Player (plenio_player.py) when ComfyUI opens it",
    "plenio/core/llm/runtime.py": "this Python runs Plenio's llama-cpp-python server module for a GGUF file",
}
"""The only files of the package in which a process is started, and what each starts. In all three the command is a
list whose first element is ``sys.executable``."""
BROWSER: Mapping[str, str] = {
    "plenio/player/__main__.py": "the player started by hand opens its own page (http://127.0.0.1:<port>/)",
}
"""The only file that opens the web browser."""

SUBPROCESS = frozenset({"Popen", "run", "call", "check_call", "check_output", "getoutput", "getstatusoutput"})
OS_LAUNCH = frozenset(
    {"system", "popen", "startfile", "posix_spawn", "posix_spawnp"}
    | {f"exec{s}" for s in ("l", "le", "lp", "lpe", "v", "ve", "vp", "vpe")}
    | {f"spawn{s}" for s in ("l", "le", "lp", "lpe", "v", "ve", "vp", "vpe")}
)
ASYNCIO = frozenset({"create_subprocess_exec", "create_subprocess_shell"})
BROWSER_CALLS = frozenset({"open", "open_new", "open_new_tab"})
UNSAFE_LOADS = {
    "pickle": {"load", "loads"},
    "marshal": {"load", "loads"},
    "shelve": {"open"},
    "dill": {"load", "loads"},
}
INSTALLERS = frozenset({"pip", "ensurepip"})
DYNAMIC = frozenset({"eval", "exec"})
SCRIPT_SUFFIXES = (
    ".bat",
    ".cmd",
    ".ps1",
    ".sh",
    ".vbs",
    ".exe",
    ".com",
    ".scr",
    ".msi",
    ".dll",
    ".so",
    ".dylib",
    ".pyd",
)
"""Files that are, or carry, programs of their own: the package ships none."""

RULES: Mapping[str, str] = {
    "launch-site": "a process is started outside the accepted files",
    "os-launch": "os.system, os.popen, os.startfile, os.exec* or os.spawn* is called",
    "shell": "shell= is passed to a process call",
    "command-string": "the command is not a list written in the same function",
    "argv0": "the command's first element is not sys.executable",
    "asyncio-subprocess": "asyncio starts a process",
    "browser": "the web browser is opened outside the accepted file",
    "dynamic-code": "eval() or exec() is called",
    "installer": "pip or ensurepip is imported",
    "unsafe-load": "pickle, marshal, shelve or dill reads data",
    "script-file": "the package ships a script or a binary of its own",
    "syntax": "a Python file cannot be parsed",
}


@dataclass(frozen=True, order=True)
class Finding:
    path: str
    line: int
    rule: str
    detail: str

    def __str__(self) -> str:
        where = f"{self.path}:{self.line}" if self.line else self.path
        return f"{where}: [{self.rule}] {self.detail}"


# --- one Python file ----------------------------------------------------------------------------------------------


class _Scan(ast.NodeVisitor):
    def __init__(self, path: str):
        self.path = path
        self.found: list[Finding] = []
        self.modules: dict[str, str] = {}  # local name -> module (import subprocess as sp)
        self.names: dict[
            str, tuple[str, str]
        ] = {}  # local name -> (module, attribute) (from os import system)
        self.scopes: list[ast.AST] = []

    def add(self, node: ast.AST, rule: str, detail: str) -> None:
        self.found.append(Finding(self.path, getattr(node, "lineno", 0), rule, detail))

    # imports: which local names stand for the modules and functions watched
    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            top = alias.name.split(".")[0]
            if top in INSTALLERS:
                self.add(node, "installer", f"import {alias.name}")
            self.modules[alias.asname or top] = alias.name if alias.asname else top

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        module = node.module or ""
        if module.split(".")[0] in INSTALLERS:
            self.add(node, "installer", f"from {module} import ...")
        for alias in node.names:
            self.names[alias.asname or alias.name] = (module, alias.name)

    def _scoped(self, node: ast.AST) -> None:
        self.scopes.append(node)
        self.generic_visit(node)
        self.scopes.pop()

    visit_FunctionDef = visit_AsyncFunctionDef = visit_Lambda = _scoped  # noqa: N815 - ast's visitor names

    def target(self, func: ast.expr) -> tuple[str, str] | None:
        """The (module, function) a call's ``func`` stands for, through this file's imports."""
        if isinstance(func, ast.Attribute):
            base = func.value
            if isinstance(base, ast.Name):
                return self.modules.get(base.id, base.id), func.attr
            if isinstance(base, ast.Attribute) and isinstance(base.value, ast.Name):  # asyncio.subprocess.x
                return f"{self.modules.get(base.value.id, base.value.id)}.{base.attr}", func.attr
            return None
        if isinstance(func, ast.Name):
            if func.id in self.names:
                return self.names[func.id]
            if func.id in DYNAMIC:
                return "builtins", func.id
        return None

    def visit_Call(self, node: ast.Call) -> None:
        target = self.target(node.func)
        if target is not None:
            module, name = target
            shown = f"{module}.{name}"
            if module == "builtins" and name in DYNAMIC:
                self.add(node, "dynamic-code", f"{name}() is called")
            elif module == "os" and name in OS_LAUNCH:
                self.add(node, "os-launch", f"{shown} is called")
            elif module in ("asyncio", "asyncio.subprocess") and name in ASYNCIO:
                self.add(node, "asyncio-subprocess", f"{shown} is called")
            elif module == "webbrowser" and name in BROWSER_CALLS:
                if self.path not in BROWSER:
                    self.add(node, "browser", f"{shown} outside {', '.join(BROWSER)}")
            elif name in UNSAFE_LOADS.get(module, ()):
                self.add(node, "unsafe-load", f"{shown} is called")
            elif module == "subprocess" and name in SUBPROCESS:
                self.process_call(node, shown)
        self.generic_visit(node)

    def process_call(self, node: ast.Call, shown: str) -> None:
        if self.path not in ACCEPTED:
            self.add(node, "launch-site", f"{shown} outside the accepted launch sites")
            return
        for keyword in node.keywords:
            if keyword.arg == "shell":
                self.add(node, "shell", f"{shown} is passed shell=")
        command = (
            node.args[0] if node.args else next((k.value for k in node.keywords if k.arg == "args"), None)
        )
        lists = self.lists_of(command)
        if not lists:
            kind = type(command).__name__ if command is not None else "nothing"
            self.add(
                node, "command-string", f"{shown}: the command must be a list written here (found {kind})"
            )
            return
        for written in lists:
            first = written.elts[0] if written.elts else None
            if not _is_sys_executable(first):
                found = ast.unparse(first) if first is not None else "an empty list"
                self.add(written, "argv0", f"{shown}: the command starts with {found}, not sys.executable")

    def lists_of(self, command: ast.expr | None) -> list[ast.List | ast.Tuple]:
        """The list literals ``command`` can be: itself, or - for a name - every value it is bound to in the
        enclosing function, all of which must be list literals (``+=`` only adds arguments). Empty when the
        command cannot be read that way."""
        if isinstance(command, ast.List | ast.Tuple):
            return [command]
        if not isinstance(command, ast.Name) or not self.scopes:
            return []
        lists: list[ast.List | ast.Tuple] = []
        for node in ast.walk(self.scopes[-1]):
            values: list[ast.expr | None] = []
            if isinstance(node, ast.Assign) and any(_binds(t, command.id) for t in node.targets):
                values.append(node.value)
            elif isinstance(node, ast.AnnAssign) and _binds(node.target, command.id):
                values.append(node.value)
            elif isinstance(node, ast.NamedExpr) and _binds(node.target, command.id):
                values.append(node.value)
            elif isinstance(node, ast.For | ast.AsyncFor | ast.comprehension) and _binds(
                node.target, command.id
            ):
                return []
            elif isinstance(node, ast.arg) and node.arg == command.id:
                return []  # a parameter: the command comes from elsewhere
            for value in values:
                if not isinstance(value, ast.List | ast.Tuple):
                    return []
                lists.append(value)
        return lists


def _binds(target: ast.expr, name: str) -> bool:
    return any(isinstance(node, ast.Name) and node.id == name for node in ast.walk(target))


def _is_sys_executable(node: ast.expr | None) -> bool:
    return (
        isinstance(node, ast.Attribute)
        and node.attr == "executable"
        and isinstance(node.value, ast.Name)
        and node.value.id == "sys"
    )


def findings(path: str, source: str) -> list[Finding]:
    """The findings of one Python file of the package (``path`` as in the zip, with forward slashes)."""
    try:
        tree = ast.parse(source, path)
    except SyntaxError as error:
        return [Finding(path, error.lineno or 0, "syntax", str(error.msg))]
    scan = _Scan(path)
    scan.visit(tree)
    return sorted(scan.found)


# --- a whole package ----------------------------------------------------------------------------------------------


def check(files: Mapping[str, bytes]) -> list[Finding]:
    """The findings of a package given as ``{path: content}``."""
    found: list[Finding] = []
    for path in sorted(files):
        lower = path.lower()
        if lower.endswith(SCRIPT_SUFFIXES):
            found.append(Finding(path, 0, "script-file", "a script or binary is part of the package"))
        elif lower.endswith(".py"):
            found += findings(path, files[path].decode("utf-8", errors="replace"))
    return sorted(found)


def launch_sites(files: Mapping[str, bytes]) -> list[str]:
    """Every process call of the package, accepted or not, as ``path:line`` - for the report a reviewer reads."""
    sites: list[str] = []
    for path in sorted(files):
        if not path.lower().endswith(".py"):
            continue
        try:
            tree = ast.parse(files[path].decode("utf-8", errors="replace"), path)
        except SyntaxError:
            continue
        scan = _Scan(path)
        scan.visit(tree)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                target = scan.target(node.func)
                if target and target[0] == "subprocess" and target[1] in SUBPROCESS:
                    sites.append(f"{path}:{node.lineno}")
    return sites


def read_zip(source: Path | bytes) -> dict[str, bytes]:
    with zipfile.ZipFile(io.BytesIO(source) if isinstance(source, bytes) else source) as archive:
        return {
            info.filename: archive.read(info)
            for info in archive.infolist()
            if not info.filename.endswith("/")
        }


def ignored(path: str, patterns: Iterable[str]) -> bool:
    """Whether ``.comfyignore`` leaves ``path`` out - the subset of gitwildmatch Plenio's file uses: patterns
    anchored at the root (``/tests/``, ``/docs/*``), a trailing slash for a folder, ``!`` to keep again; the last
    match wins."""
    out = False
    for raw in patterns:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        keep = line.startswith("!")
        pattern = line[1:] if keep else line
        anchored = pattern.startswith("/")
        pattern = pattern.lstrip("/")
        if pattern.endswith("/"):
            folder = pattern.rstrip("/")
            hit = path.startswith(folder + "/") if anchored else f"/{folder}/" in f"/{path}"
        elif anchored:
            hit = fnmatch.fnmatchcase(path, pattern) or fnmatch.fnmatchcase(path, pattern + "/*")
        else:
            hit = any(fnmatch.fnmatchcase(part, pattern) for part in path.split("/"))
        if hit:
            out = not keep
    return out


def _git(root: Path, *arguments: str) -> bytes:
    return subprocess.run(["git", "-C", str(root), *arguments], check=True, capture_output=True).stdout  # noqa: S603, S607


def read_ref(root: Path, ref: str) -> dict[str, bytes]:
    """The files of a tag or commit as ``comfy node pack`` would pack them: tracked files without what that
    version's ``.comfyignore`` leaves out."""
    files = read_zip(_git(root, "archive", "--format=zip", ref))
    patterns = files.get(".comfyignore", b"").decode("utf-8").splitlines()
    return {path: data for path, data in files.items() if not ignored(path, patterns)}


def read_tree(root: Path) -> dict[str, bytes]:
    """This checkout as it would be packed: tracked files (as they are on disk) without ``.comfyignore``'s."""
    tracked = _git(root, "ls-files", "-z").decode("utf-8").split("\0")
    patterns = (root / ".comfyignore").read_text(encoding="utf-8").splitlines()
    return {
        path: (root / path).read_bytes()
        for path in tracked
        if path and not ignored(path, patterns) and (root / path).is_file()
    }


# --- the report ---------------------------------------------------------------------------------------------------


def delta(before: list[Finding], after: list[Finding]) -> dict[str, dict[str, list[str]]]:
    """What changed between two packages, by rule: findings that are gone and findings that are new, compared by
    file and rule (line numbers move)."""
    old, new = Counter((f.rule, f.path) for f in before), Counter((f.rule, f.path) for f in after)
    out: dict[str, dict[str, list[str]]] = {}
    for rule in RULES:
        removed = sorted(path for (r, path), n in old.items() if r == rule for _ in range(n - new[(r, path)]))
        added = sorted(path for (r, path), n in new.items() if r == rule for _ in range(n - old[(r, path)]))
        if removed or added:
            out[rule] = {"removed": removed, "added": added}
    return out


def report(
    files: Mapping[str, bytes], found: list[Finding], against: tuple[str, list[Finding]] | None
) -> str:
    lines = [f"package gate: {sum(1 for p in files if p.endswith('.py'))} Python files of {len(files)} files"]
    lines.append("accepted launch sites (this Python, Plenio's own modules):")
    sites = launch_sites(files)
    for path, what in ACCEPTED.items():
        here = [s for s in sites if s.startswith(path + ":")]
        lines.append(f"  {', '.join(here) or path + ' (no call)'} - {what}")
    for path, what in BROWSER.items():
        lines.append(f"  {path} - {what}")
    if found:
        lines.append(f"{len(found)} finding(s):")
        lines += [f"  {finding}" for finding in found]
    else:
        lines.append(
            "no finding: nothing else starts a process, opens a shell, evaluates code or installs packages"
        )
    if against is not None:
        ref, before = against
        changes = delta(before, found)
        lines.append(f"against {ref} ({len(before)} finding(s) there):")
        if not changes:
            lines.append("  no change")
        for rule, change in changes.items():
            for kind in ("removed", "added"):
                for path in change[kind]:
                    lines.append(f"  {kind}: [{rule}] {path} - {RULES[rule]}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("zip", nargs="?", type=Path, help="the packed zip (node.zip)")
    parser.add_argument("--tree", type=Path, help="a checkout, checked as it would be packed")
    parser.add_argument("--ref", help="a tag or commit of this repository, checked as it would be packed")
    parser.add_argument("--delta", metavar="REF", help="also report the changes against this tag or commit")
    parser.add_argument("--json", action="store_true", help="print the findings (and the delta) as JSON")
    args = parser.parse_args(argv)
    root = Path(__file__).resolve().parents[1]
    if sum(x is not None for x in (args.zip, args.tree, args.ref)) != 1:
        parser.error("give one of: a zip, --tree <checkout>, --ref <tag>")
    if args.zip is not None:
        files = read_zip(args.zip)
    elif args.tree is not None:
        files = read_tree(args.tree.resolve())
    else:
        files = read_ref(root, args.ref)
    found = check(files)
    against = (args.delta, check(read_ref(root, args.delta))) if args.delta else None
    if args.json:
        out = {
            "files": len(files),
            "findings": [vars(f) for f in found],
            "delta": delta(against[1], found) if against else None,
        }
        print(json.dumps(out, indent=1))
    else:
        print(report(files, found, against))
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
