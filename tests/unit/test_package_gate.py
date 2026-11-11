"""The package gate (``tools/package_gate.py``): the Comfy Registry package starts nothing but this Python with
Plenio's own modules. The gate reads syntax trees of the packed files; these tests feed it one command that passes
and every way a launch site could come back, then run it on this checkout as it would be packed."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

import package_gate as gate

ROOT = Path(__file__).resolve().parents[2]
SITE = "plenio/player/launch.py"  # an accepted launch site
ELSEWHERE = "plenio/player/visuals.py"

PASSING = """
import subprocess, sys

def start(script, port):
    command = [sys.executable, str(script)]
    command += ["--port", str(port)]
    return subprocess.Popen(command, stdin=subprocess.DEVNULL)

def worker(module, job):
    return subprocess.Popen([sys.executable, "-m", module, "--job", str(job)])
"""


def rules(path: str, source: str) -> list[str]:
    return [finding.rule for finding in gate.findings(path, source)]


def test_this_python_with_a_list_written_in_place_passes() -> None:
    assert gate.findings(SITE, PASSING) == []


@pytest.mark.parametrize(
    ("rule", "path", "source"),
    [
        # a command line as one string, whatever guards precede it
        (
            "command-string",
            SITE,
            'import subprocess\ndef f(p):\n    subprocess.Popen(f\'"explorer.exe" "{p}"\')\n',
        ),
        # a shell
        (
            "shell",
            SITE,
            "import subprocess, sys\ndef f():\n    subprocess.run([sys.executable, '-V'], shell=True)\n",
        ),
        ("os-launch", SITE, "import os\nos.system('dir')\n"),
        ("os-launch", ELSEWHERE, "import os\ndef f(p):\n    os.startfile(p)\n"),
        # a launch in a file that is not one of the accepted three
        ("launch-site", ELSEWHERE, "import subprocess, sys\nsubprocess.Popen([sys.executable, '-V'])\n"),
        # a program named by something else than this Python
        (
            "argv0",
            SITE,
            "import subprocess\ndef f(program):\n    subprocess.Popen([str(program), '-m', 'x'])\n",
        ),
        ("argv0", SITE, "import subprocess\ndef f():\n    subprocess.Popen(['llama-server', '-m', 'x'])\n"),
        # a command that comes from elsewhere: a parameter, a call, a list put together by code
        ("command-string", SITE, "import subprocess\ndef f(command):\n    subprocess.Popen(command)\n"),
        ("command-string", SITE, "import subprocess\ndef f():\n    c = build()\n    subprocess.Popen(c)\n"),
        ("command-string", SITE, "import subprocess\ndef f(r):\n    subprocess.Popen(list(r.command))\n"),
        ("argv0", SITE, "import subprocess\ndef f(r):\n    subprocess.Popen([*r.command, '-m', 'x'])\n"),
        # one of two bindings is not this Python
        (
            "argv0",
            SITE,
            "import subprocess, sys\ndef f(x):\n    c = [sys.executable]\n    if x:\n        c = ['other']\n"
            "    subprocess.Popen(c)\n",
        ),
        (
            "asyncio-subprocess",
            ELSEWHERE,
            "import asyncio\nasync def f():\n    await asyncio.create_subprocess_exec('x')\n",
        ),
        ("browser", ELSEWHERE, "import webbrowser\nwebbrowser.open('http://127.0.0.1:1/')\n"),
        ("dynamic-code", ELSEWHERE, "def f(text):\n    return eval(text)\n"),
        ("dynamic-code", ELSEWHERE, "exec('x = 1')\n"),
        ("installer", ELSEWHERE, "import pip\n"),
        ("installer", ELSEWHERE, "from pip._internal import main\n"),
        ("unsafe-load", ELSEWHERE, "import pickle\ndef f(h):\n    return pickle.load(h)\n"),
        ("syntax", ELSEWHERE, "def f(:\n"),
    ],
)
def test_every_way_back_is_a_finding(rule: str, path: str, source: str) -> None:
    assert rule in rules(path, source), gate.findings(path, source)


def test_an_alias_does_not_hide_a_call() -> None:
    assert rules(ELSEWHERE, "import subprocess as sp\nsp.run(['x'])\n") == ["launch-site"]
    assert rules(ELSEWHERE, "from subprocess import Popen as start\nstart(['x'])\n") == ["launch-site"]
    assert rules(ELSEWHERE, "from os import system as run\nrun('x')\n") == ["os-launch"]
    assert rules(ELSEWHERE, "from webbrowser import open as show\nshow('x')\n") == ["browser"]


def test_what_only_looks_like_a_launch_is_none() -> None:
    harmless = '''
"""subprocess.Popen("cmd /c del") in a docstring, os.system in a comment."""
import subprocess  # the type of a process, never a call
text = "eval(x); exec(y); os.system('x')"

class Model:
    def eval(self): return self

def f(process: "subprocess.Popen[bytes]", model: Model) -> None:
    model.eval()          # a method named eval, not the builtin
    process.terminate()   # ending a process starts none
    open("file.txt")      # the builtin open, not webbrowser's
'''
    assert gate.findings(ELSEWHERE, harmless) == []


def test_the_browser_is_opened_in_the_players_start_only() -> None:
    source = "import webbrowser\nwebbrowser.open('http://127.0.0.1:8765/')\n"
    assert gate.findings("plenio/player/__main__.py", source) == []
    assert rules("plenio/player/server.py", source) == ["browser"]


def test_scripts_and_binaries_are_not_part_of_the_package() -> None:
    files = {
        "Plenio Player.bat": b"",
        "plenio_player.sh": b"",
        "plenio/x.pyd": b"",
        "plenio/ok.py": b"x = 1\n",
    }
    assert [(f.path, f.rule) for f in gate.check(files)] == [
        ("Plenio Player.bat", "script-file"),
        ("plenio/x.pyd", "script-file"),
        ("plenio_player.sh", "script-file"),
    ]


def test_comfyignore_patterns_are_read_as_comfy_cli_reads_them() -> None:
    patterns = (ROOT / ".comfyignore").read_text(encoding="utf-8").splitlines()
    left_out = [
        "plenio/addons/__init__.py",
        "plenio/addons/studio_launcher.py",
        "Plenio Player.bat",
        "plenio_player.sh",
        "tests/unit/test_llm.py",
        "tools/package_gate.py",
        "frontend/src/main.ts",
        "assets/branding/icon.png",
        "docs/dev/testing.md",
        ".github/workflows/ci.yml",
    ]
    kept = [
        "plenio/core/assets/fetch.py",  # not caught by /assets/ at the root
        "plenio/core/features.py",
        "plenio/player/studio.py",
        "plenio_player.py",
        "docs/user/getting-started.md",  # !/docs/user/ keeps the user guide
        "web/js/main.js",
        "__init__.py",
        "README.md",
    ]
    assert [p for p in left_out if not gate.ignored(p, patterns)] == []
    assert [p for p in kept if gate.ignored(p, patterns)] == []


def test_the_delta_names_what_went_and_what_came() -> None:
    before = [
        gate.Finding("plenio/player/studio.py", 367, "launch-site", ""),
        gate.Finding("plenio/player/studio.py", 396, "launch-site", ""),
        gate.Finding("plenio/player/visuals.py", 115, "launch-site", ""),
    ]
    after = [gate.Finding("plenio/player/new.py", 3, "os-launch", "")]
    assert gate.delta(before, after) == {
        "launch-site": {
            "removed": ["plenio/player/studio.py", "plenio/player/studio.py", "plenio/player/visuals.py"],
            "added": [],
        },
        "os-launch": {"removed": [], "added": ["plenio/player/new.py"]},
    }
    assert gate.delta(before, before) == {}


def git(*arguments: str) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(["git", "-C", str(ROOT), *arguments], capture_output=True, check=False)  # noqa: S603, S607


def test_this_checkout_as_it_would_be_packed_passes() -> None:
    if git("rev-parse", "--is-inside-work-tree").returncode != 0:
        pytest.skip("no git checkout (the gate reads the tracked files)")
    files = gate.read_tree(ROOT)
    assert not [path for path in files if path.startswith("plenio/addons/")]
    assert {"plenio/core/features.py", "plenio/player/studio.py", "plenio_player.py", "__init__.py"} <= set(
        files
    )
    found = gate.check(files)
    assert found == [], "\n".join(map(str, found))
    # every accepted site exists and holds exactly one process call
    sites = gate.launch_sites(files)
    assert sorted(site.rsplit(":", 1)[0] for site in sites) == sorted(gate.ACCEPTED)
    assert set(gate.BROWSER) <= set(files)


def test_the_last_version_before_the_boundary_fails_the_gate() -> None:
    """1.6.0 as it was packed: the three launchers (and the two start scripts) are what the gate names."""
    if git("cat-file", "-e", "c307d35^{commit}").returncode != 0:
        pytest.skip("the 1.6.0 commit is not in this checkout (a shallow clone)")
    found = gate.check(gate.read_ref(ROOT, "c307d35"))
    named = {finding.path for finding in found}
    assert {"plenio/player/visuals.py", "plenio/core/llm/runtime.py", "plenio/player/studio.py"} <= named
    assert {"Plenio Player.bat", "plenio_player.sh"} <= named
    report = gate.report(gate.read_tree(ROOT), gate.check(gate.read_tree(ROOT)), ("1.6.0", found))
    assert "removed: [launch-site] plenio/player/studio.py" in report and "added:" not in report
