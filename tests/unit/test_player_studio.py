"""The studio - ComfyUI - started from the player (owner's request 2026-10-26: the player runs on its own, ComfyUI is
started only to make songs): the command it runs, the arguments it refuses, start and stop of its own process, a song
that waits starting it, the idle stop - and the routes, for the admin on this computer only."""

from __future__ import annotations

import http.client
import json
import sys
import threading
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player import studio as studio_module
from plenio.player.library import Library
from plenio.player.server import State, from_this_computer, serve
from plenio.player.studio import StudioLauncher, StudioLaunchError, parse_args


def comfyui(tmp_path: Path, name: str = "ComfyUI") -> Path:
    """A folder that looks like ComfyUI: its main.py waits a while (the test's ComfyUI never answers)."""
    root = tmp_path / name
    (root / "comfy").mkdir(parents=True)
    (root / "main.py").write_text("import time\ntime.sleep(60)\n", encoding="utf-8")
    for other in ("folder_paths.py", "execution.py"):
        (root / other).write_text("", encoding="utf-8")
    return root


class Clock:
    def __init__(self) -> None:
        self.now = 1_800_000_000.0

    def __call__(self) -> float:
        return self.now


def test_the_arguments_keep_comfyui_on_this_computer() -> None:
    assert parse_args('--models-directory "D:/AI models" --cuda-device 1') == [
        "--models-directory",
        "D:/AI models",
        "--cuda-device",
        "1",
    ]
    for wrong in ("--listen", "--listen 0.0.0.0", "--port 9000", "--enable-cors-header *", "--port=9000"):
        with pytest.raises(StudioLaunchError) as refused:
            parse_args(wrong)
        assert "this computer" in str(refused.value)
    with pytest.raises(StudioLaunchError):
        parse_args("rm -rf /")  # not an option
    with pytest.raises(StudioLaunchError):
        parse_args("--x " + "y" * 2000)


def test_comfyui_starts_the_way_it_was_last_started(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Issue 2026-10-28: the player started ComfyUI without the owner's --models-directory, so every song stopped
    at "Load checkpoint: Value not in list". Plenio keeps each start when ComfyUI loads it; with no arguments in
    Settings the player repeats it - without the address, the port and TLS, which it sets itself."""
    from plenio.addons.studio_launcher import remember_start, remembered_start, repeatable

    assert repeatable(
        [
            "--models-directory",
            "F:/models",
            "--listen",
            "--port",
            "8188",
            "--enable-manager",
            "--listen=0.0.0.0",
        ]
    ) == ["--models-directory", "F:/models", "--enable-manager"]
    assert repeatable(["--listen", "0.0.0.0", "--cuda-device", "all", "--windows-standalone-build"]) == [
        "--cuda-device",
        "all",
    ]
    root = comfyui(tmp_path)
    state = tmp_path / "state"
    venv = tmp_path / "venv" / "python.exe"
    venv.parent.mkdir()
    venv.write_bytes(b"")
    remember_start(
        state, [str(root / "main.py"), "--models-directory", "F:/models", "--port", "8000"], str(venv)
    )
    remember_start(state, ["serve.py", "--x"], "python")  # not a ComfyUI: not kept
    entry = remembered_start(state, root)
    assert entry is not None and entry[1]["args"] == ["--models-directory", "F:/models"]
    launcher = StudioLauncher(state)
    launcher.configure({"root": str(root), "port": 8191})
    command, _ = launcher.command()
    assert command == [str(venv), str(root / "main.py"), "--port", "8191", "--models-directory", "F:/models"]
    status = launcher.status()
    assert status["args_from"] == "last start" and status["args_used"] == "--models-directory F:/models"
    # arguments of its own in Settings win
    launcher.configure({"args": "--cuda-device 1"})
    assert launcher.command()[0][-2:] == ["--cuda-device", "1"]
    assert launcher.status()["args_from"] == "settings"
    # no Plenio in custom_nodes (ComfyUI Desktop): the ComfyUI last started with Plenio
    monkeypatch.setattr(studio_module, "installed_root", lambda: None)
    launcher.configure({"root": "", "args": ""})
    assert launcher.root() == root
    # a start file edited by hand still keeps ComfyUI on this computer
    file = state / studio_module.START_FILE
    known = json.loads(file.read_text(encoding="utf-8"))
    known[str((root / "main.py").resolve())]["args"] = [
        "--listen",
        "0.0.0.0",
        "--enable-cors-header",
        "*",
        "--fast",
    ]
    file.write_text(json.dumps(known), encoding="utf-8")
    assert launcher.command()[0][-1:] == ["--fast"] and "--listen" not in launcher.command()[0]
    # ... and starts a Python, whatever program the file names
    other = tmp_path / "tool.exe"
    other.write_bytes(b"")
    known[str((root / "main.py").resolve())]["python"] = str(other)
    file.write_text(json.dumps(known), encoding="utf-8")
    assert launcher.command()[0][0] != str(other)


def test_comfyui_and_the_player_start_without_a_window() -> None:
    """Issue 2026-10-28: with DETACHED_PROCESS a venv's python.exe (a launcher) started the real interpreter in a
    console of its own - a window popped up, in Windows Terminal an error tab when it ended (0x800700e8)."""
    from plenio.player.launch import windowless

    flags = windowless()
    if sys.platform != "win32":
        assert flags == 0
        return
    import subprocess

    assert flags & subprocess.CREATE_NO_WINDOW and flags & subprocess.CREATE_NEW_PROCESS_GROUP
    assert not flags & subprocess.DETACHED_PROCESS


def test_the_command_runs_the_folders_comfyui(tmp_path: Path) -> None:
    root = comfyui(tmp_path)
    launcher = StudioLauncher(tmp_path / "state")
    launcher.configure({"root": str(root), "args": "--cuda-device 1", "port": 8191})
    command, cwd = launcher.command()
    assert cwd == root and command[0] == sys.executable
    assert command[1:] == [str(root / "main.py"), "--port", "8191", "--cuda-device", "1"]
    kept = json.loads((tmp_path / "state" / "studio.json").read_text(encoding="utf-8"))
    assert kept["root"] == str(root) and kept["port"] == 8191
    # the portable build: its embedded Python, as its own .bat starts it
    portable = tmp_path / "portable"
    comfyui(portable)
    (portable / "python_embeded").mkdir()
    (portable / "python_embeded" / "python.exe").write_bytes(b"")
    launcher.configure({"root": str(portable / "ComfyUI"), "args": ""})
    command, _ = launcher.command()
    if sys.platform == "win32":
        assert command[:2] == [str(portable / "python_embeded" / "python.exe"), "-s"]
        assert command[-1] == "--windows-standalone-build"
    # a folder with a main.py of its own is no ComfyUI: the player runs no other program's main.py
    elsewhere = tmp_path / "elsewhere"
    elsewhere.mkdir()
    (elsewhere / "main.py").write_text("", encoding="utf-8")
    for wrong in (
        {"root": str(tmp_path)},
        {"root": str(elsewhere)},
        {"port": 80},
        {"port": "x"},
        {"args": "--listen"},
    ):
        with pytest.raises(StudioLaunchError):
            launcher.configure(wrong)


def test_the_player_starts_its_comfyui_and_stops_only_its_own(tmp_path: Path) -> None:
    root = comfyui(tmp_path)
    launcher = StudioLauncher(tmp_path / "state")
    launcher.configure({"root": str(root)})
    with pytest.raises(StudioLaunchError) as refused:
        launcher.stop()  # nothing of its own runs
    assert refused.value.status == 409
    status = launcher.start()
    try:
        assert status["own"] and status["starting"] and not status["running"]
        assert launcher.process is not None and launcher.process.poll() is None
        assert launcher.start()["own"] and launcher.process is not None  # no second one
        log = (tmp_path / "state" / "comfyui.log").read_text(encoding="utf-8")
        assert "started by the Plenio Player" in log and "main.py" in log
    finally:
        stopped = launcher.stop()
    assert not stopped["own"] and launcher.process is None


def test_a_comfyui_that_answers_already_is_not_started_again(tmp_path: Path) -> None:
    root = comfyui(tmp_path)
    launcher = StudioLauncher(tmp_path / "state", reachable=lambda url: True)
    launcher.configure({"root": str(root)})
    status = launcher.start()
    assert status["running"] and not status["own"] and launcher.process is None


def test_another_comfyui_that_answers_counts_and_none_is_started(tmp_path: Path) -> None:
    # ComfyUI Desktop on 8000, or the ComfyUI that started the player: running, not the player's own
    root = comfyui(tmp_path)
    launcher = StudioLauncher(tmp_path / "state", clock=Clock())
    launcher.configure({"root": str(root), "auto": True})
    launcher.elsewhere = lambda: "http://127.0.0.1:8000/"
    status = launcher.status()
    assert status["running"] and not status["own"] and status["url"] == "http://127.0.0.1:8000"
    launcher.tick(waiting=True)
    assert launcher.process is None
    assert launcher.start()["running"] and launcher.process is None


def test_a_waiting_song_starts_it_and_it_stops_when_idle(tmp_path: Path) -> None:
    root = comfyui(tmp_path)
    clock = Clock()
    launcher = StudioLauncher(tmp_path / "state", clock=clock)
    launcher.configure({"root": str(root), "auto": False, "idle_stop_min": 10})
    launcher.tick(waiting=True)
    assert launcher.process is None  # not wished
    launcher.configure({"auto": True})
    launcher.tick(waiting=True)
    try:
        assert launcher.started()
        clock.now += 9 * 60
        launcher.tick(waiting=False)
        assert launcher.started()  # not idle long enough
        clock.now += 2 * 60
        launcher.tick(waiting=False)
        assert not launcher.started()
    finally:
        if launcher.started():
            launcher.stop()


def test_a_comfyui_that_ends_at_once_is_not_started_again_and_again(tmp_path: Path) -> None:
    root = comfyui(tmp_path)
    (root / "main.py").write_text("raise SystemExit(1)\n", encoding="utf-8")  # a port taken, say
    clock = Clock()
    launcher = StudioLauncher(tmp_path / "state", clock=clock)
    launcher.configure({"root": str(root), "auto": True})
    launcher.tick(waiting=True)
    assert launcher.process is not None
    first = launcher.process
    first.wait(timeout=30)
    clock.now += 30
    launcher.tick(waiting=True)
    assert launcher.process is first  # not again within two minutes
    clock.now += studio_module.RESTART_AFTER_S
    launcher.tick(waiting=True)
    assert launcher.process is not first
    launcher.process.wait(timeout=30)
    log = (tmp_path / "state" / "comfyui.log").read_text(encoding="utf-8")
    assert log.count("started by the Plenio Player") == 2


def test_without_a_comfyui_folder_it_says_why(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(studio_module, "installed_root", lambda: None)
    launcher = StudioLauncher(tmp_path / "state")
    status = launcher.status()
    # what to do: start ComfyUI once the usual way (it is remembered), or choose its folder
    assert not status["can_start"] and "Start ComfyUI once" in status["why"]
    with pytest.raises(StudioLaunchError):
        launcher.start()


@pytest.fixture
def server(tmp_path: Path) -> Iterator[tuple[str, int, StudioLauncher]]:
    root = comfyui(tmp_path)
    launcher = StudioLauncher(tmp_path / "state")
    launcher.configure({"root": str(root)})
    library = Library([tmp_path / "songs"])
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0, launcher=launcher)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield "127.0.0.1", running.server_address[1], launcher
    if launcher.started():
        launcher.stop()
    running.shutdown()
    running.server_close()


def call(
    address: tuple[str, int, Any], method: str, path: str, body: Any = None, **headers: str
) -> tuple[int, Any]:
    host, port, _ = address
    connection = http.client.HTTPConnection(host, port, timeout=10)
    data = json.dumps(body).encode() if body is not None else None
    if data is not None:
        headers.setdefault("Content-Type", "application/json")
    connection.request(method, path, body=data, headers=headers)
    answer = connection.getresponse()
    status, raw = answer.status, answer.read()
    connection.close()
    return status, json.loads(raw) if raw else None


def test_only_a_browser_on_this_computer_itself_starts_the_studio() -> None:
    # a player started with --host answers the network directly: those requests are not this computer's
    assert from_this_computer("127.0.0.1", remote=False) and from_this_computer("::1", remote=False)
    assert not from_this_computer("192.168.178.23", remote=False)
    assert not from_this_computer("127.0.0.1", remote=True)  # by the gateway of In your network


def test_the_routes_are_for_the_admin_on_this_computer(server: Any) -> None:
    status, answer = call(server, "GET", "/api/studio")
    assert status == 200 and answer["can_start"] and answer["root"].endswith("ComfyUI")
    # from the network: whether it runs, nothing of this computer's folders - and no start
    status, remote = call(server, "GET", "/api/studio", **{"X-Plenio-Remote": "1"})
    assert status == 200 and "root" not in remote and "log" not in remote
    assert call(server, "POST", "/api/studio/start", {}, **{"X-Plenio-Remote": "1"})[0] == 403
    # only JSON from the player's page
    assert call(server, "POST", "/api/studio/start", None)[0] == 403
    assert call(server, "POST", "/api/studio/start", {}, Origin="http://evil.example")[0] == 403
    status, set_up = call(server, "PUT", "/api/studio", {"args": "--cuda-device 1", "auto": True})
    assert status == 200 and set_up["args"] == "--cuda-device 1" and set_up["auto"]
    status, refused = call(server, "PUT", "/api/studio", {"args": "--listen"})
    assert status == 400 and "this computer" in refused["error"]
    status, started = call(server, "POST", "/api/studio/start", {})
    assert status == 200 and started["own"]
    deadline = time.monotonic() + 5
    while not server[2].started() and time.monotonic() < deadline:
        time.sleep(0.05)
    status, stopped = call(server, "POST", "/api/studio/stop", {})
    assert status == 200 and not stopped["own"]
