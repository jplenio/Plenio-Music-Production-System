"""Host integration (phase 5.6): the examples of docs/api/examples run against a ComfyUI with Plenio - with empty
model files of the catalogue's names, the job is accepted, followed and fails at its first loader, and the example
says so. What a real song makes is not covered here (it needs the models)."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from harness import PROJECT, ComfyServer

pytestmark = pytest.mark.host

EXAMPLES = PROJECT / "docs" / "api" / "examples"


def run(command: list[str], server: ComfyServer, tmp_path: Path) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PLENIO_API": f"{server.url}/plenio/api/v2", "PYTHONUTF8": "1"}
    env.pop("PLENIO_TOKEN", None)
    return subprocess.run(
        command, cwd=tmp_path, env=env, capture_output=True, text=True, encoding="utf-8", timeout=240
    )


def test_the_python_example(server: ComfyServer, fake_models: None, tmp_path: Path) -> None:
    done = run(
        [sys.executable, str(EXAMPLES / "make_song.py"), "a quiet walk by the sea", "--api",
         f"{server.url}/plenio/api/v2", "--review", "text", "--out", str(tmp_path / "songs")],
        server, tmp_path,
    )  # fmt: skip
    assert done.returncode == 1, done.stdout + done.stderr
    assert "plenio-song-api 2.0" in done.stdout and "job job_" in done.stdout, done.stdout
    assert "no song: failed" in done.stdout, done.stdout


def test_the_python_song_list(server: ComfyServer, tmp_path: Path) -> None:
    done = run([sys.executable, str(EXAMPLES / "list_songs.py"), "--files"], server, tmp_path)
    assert done.returncode == 0, done.stdout + done.stderr
    assert done.stdout.strip().endswith("song(s)"), done.stdout


@pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is not installed")
def test_the_javascript_example(server: ComfyServer, fake_models: None, tmp_path: Path) -> None:
    done = run(["node", str(EXAMPLES / "make_song.mjs"), "a quiet walk by the sea"], server, tmp_path)
    assert done.returncode == 1, done.stdout + done.stderr
    assert "job job_" in done.stdout and "no song: failed" in done.stderr, done.stdout + done.stderr


@pytest.mark.skipif(
    shutil.which("sh") is None or shutil.which("jq") is None or shutil.which("curl") is None,
    reason="sh, curl and jq are needed",
)
def test_the_shell_example(server: ComfyServer, fake_models: None, tmp_path: Path) -> None:
    done = run(["sh", str(EXAMPLES / "make_song.sh"), "a quiet walk by the sea"], server, tmp_path)
    assert done.returncode == 1, done.stdout + done.stderr
    assert "job job_" in done.stdout and "\nfailed" in done.stdout, done.stdout


def test_the_mcp_server(server: ComfyServer, fake_models: None, tmp_path: Path) -> None:
    """A scripted JSON-RPC session with plenio_mcp.py: it starts a song through the Song API v2, follows the job to
    its end (failed at the first loader: the model files are empty) and lists the songs."""

    def ask(n: int, method: str, params: dict[str, object] | None = None) -> str:
        return json.dumps({"jsonrpc": "2.0", "id": n, "method": method, "params": params or {}}) + "\n"

    def tool(n: int, name: str, **arguments: object) -> str:
        return ask(n, "tools/call", {"name": name, "arguments": arguments})

    env = {**os.environ, "PLENIO_API": server.url, "PYTHONUTF8": "1"}
    process = subprocess.Popen(
        [sys.executable, str(PROJECT / "plenio_mcp.py")], cwd=tmp_path, env=env, text=True, encoding="utf-8",
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )  # fmt: skip
    assert process.stdin is not None and process.stdout is not None

    def answer(line: str) -> dict[str, object]:
        process.stdin.write(line)
        process.stdin.flush()
        return json.loads(process.stdout.readline())

    try:
        assert (
            answer(ask(1, "initialize", {"protocolVersion": "2025-06-18"}))["result"]["serverInfo"]["name"]
            == "plenio"
        )
        process.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        assert len(answer(ask(2, "tools/list"))["result"]["tools"]) == 5
        made = answer(
            tool(3, "make_song", description="a quiet walk by the sea", length="very short (about 1:00)")
        )
        job = made["result"]["structuredContent"]
        assert job["id"].startswith("job_") and job["status"] in ("queued", "running"), made
        status = job["status"]
        for n in range(4, 20):
            found = answer(tool(n, "job_status", id=job["id"], wait_seconds=10))["result"][
                "structuredContent"
            ]
            status = found["status"]
            if status in ("succeeded", "failed", "cancelled"):
                break
        assert status == "failed" and found["error"]["code"], found
        listed = answer(tool(30, "list_songs"))["result"]
        assert not listed["isError"] and isinstance(listed["structuredContent"]["songs"], list)
    finally:
        process.stdin.close()
        process.wait(timeout=30)
