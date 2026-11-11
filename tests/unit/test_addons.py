"""The Studio add-on (``plenio/addons``) and an installation without it.

The Comfy Registry package leaves the add-on out: there Plenio starts no program but its own Python with its own
modules. These tests cover the seam (``plenio.core.features``), the add-on's three modules, and what each function
says and does where the add-on is missing - ``PLENIO_ADDONS=0`` makes a full installation behave like the package.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import pytest

from plenio.core import features, llm
from plenio.core.errors import PlenioWorkerError
from plenio.core.llm import runtime
from plenio.player import studio as studio_module
from plenio.player import visuals
from plenio.player.studio import StudioLauncher, StudioLaunchError


@pytest.fixture
def no_addons(monkeypatch: pytest.MonkeyPatch) -> None:
    """This installation as the Comfy Registry package: the Studio add-on is not used."""
    monkeypatch.setenv(features.SWITCH, "0")


def comfyui(tmp_path: Path) -> Path:
    root = tmp_path / "ComfyUI"
    (root / "comfy").mkdir(parents=True, exist_ok=True)
    for name in ("main.py", "folder_paths.py", "execution.py"):
        (root / name).write_text("", encoding="utf-8")
    return root


# --- the seam -------------------------------------------------------------------------------------------------


def test_a_full_installation_has_every_add_on_module() -> None:
    assert features.summary() == {"studio_launcher": True, "llm_server": True, "file_manager": True}
    for addon in features.ADDONS:
        assert features.load(addon).__name__.endswith(f"addons.{addon}")


def test_a_module_that_is_not_there_is_not_had(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    (tmp_path / "llm_server.py").write_text("", encoding="utf-8")
    monkeypatch.setattr(features, "FOLDER", tmp_path)  # a package folder with one module of three
    assert features.summary() == {"studio_launcher": False, "llm_server": True, "file_manager": False}
    with pytest.raises(ModuleNotFoundError, match="not part of this installation"):
        features.load("file_manager")
    assert features.has("anything_else") is False  # only the add-on's own modules are asked for


@pytest.mark.parametrize("value", ["0", "off", "false", "No", " 0 "])
def test_the_switch_turns_the_add_on_off(value: str, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(features.SWITCH, value)
    assert not any(features.summary().values())
    monkeypatch.setenv(features.SWITCH, "1")
    assert all(features.summary().values())


def test_nothing_outside_the_add_on_imports_it_directly() -> None:
    """Callers go through ``features``: a module that imported ``plenio.addons`` at its top would fail to load in
    the Registry package."""
    package = Path(features.__file__).resolve().parents[1]
    offenders = [
        str(path.relative_to(package))
        for path in package.rglob("*.py")
        if "addons" not in path.relative_to(package).parts
        and "third_party" not in path.parts
        and any(
            line.lstrip().startswith(("from", "import")) and "addons" in line
            for line in path.read_text(encoding="utf-8").splitlines()
        )
    ]
    assert offenders == []


# --- the file manager -----------------------------------------------------------------------------------------


def test_explorer_gets_the_folder_as_an_argument_never_as_a_command_line(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    file_manager = features.load("file_manager")
    started: list[Any] = []
    opened: list[str] = []
    monkeypatch.setattr(file_manager.subprocess, "Popen", lambda command, *a, **k: started.append(command))
    monkeypatch.setattr(file_manager.os, "startfile", opened.append, raising=False)
    monkeypatch.setattr(file_manager.sys, "platform", "win32")
    folder = tmp_path / "my videos"
    file_manager.show_folder(folder)
    assert folder.is_dir()
    (program, shown), *rest = started
    assert rest == [] and program.lower().endswith("explorer.exe") and shown == str(folder.resolve())
    # a name a shell would read as a second command stays one argument: there is no shell and no command line
    odd = tmp_path / "my & calc x"
    file_manager.show_folder(odd)
    assert started[1] == [program, str(odd.resolve())] and isinstance(started[1], list)
    # Explorer splits its arguments at commas: such a folder is opened by the shell, without a command line
    comma = tmp_path / "live,2026"
    file_manager.show_folder(comma)
    assert opened == [str(comma.resolve())] and len(started) == 2


@pytest.mark.parametrize(("platform", "program"), [("darwin", "/usr/bin/open"), ("linux", "xdg-open")])
def test_other_systems_open_the_folder_with_their_own_opener(
    platform: str, program: str, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    file_manager = features.load("file_manager")
    started: list[Any] = []
    monkeypatch.setattr(file_manager.subprocess, "Popen", lambda command, *a, **k: started.append(command))
    monkeypatch.setattr(file_manager.sys, "platform", platform)
    file_manager.show_folder(tmp_path / "videos")
    assert started == [[program, str((tmp_path / "videos").resolve())]]


def test_without_the_add_on_the_folder_is_named_not_opened(tmp_path: Path, no_addons: None) -> None:
    answer = visuals.show_folder(tmp_path / "packages")
    assert answer == {"folder": str(tmp_path / "packages"), "opened": False, "hint": visuals.NOT_SHOWN}
    assert (tmp_path / "packages").is_dir()  # the folder is there to put the path to use


# --- the llama-server program ---------------------------------------------------------------------------------


def test_without_the_add_on_no_llama_server_program_is_found(
    tmp_path: Path, no_addons: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    exe = runtime._exe("llama-server", sys.platform)
    configured = tmp_path / "mine" / exe
    configured.parent.mkdir()
    configured.write_bytes(b"")
    monkeypatch.setattr(runtime.importlib.util, "find_spec", lambda name: None)
    assert llm.find_runtimes({"PATH": str(configured.parent)}, tmp_path, configured=configured) == []
    monkeypatch.setattr(runtime.importlib.util, "find_spec", lambda name: object())
    found = llm.find_runtimes({"PATH": str(configured.parent)}, tmp_path, configured=configured)
    # llama-cpp-python inside this Python stays: this interpreter, Plenio's own module
    assert [r.name for r in found] == ["llama-cpp-python"] and runtime.is_shim(found[0])
    assert found[0].command == (sys.executable, "-m", "plenio.workers.llama_http")


def test_without_the_add_on_a_program_is_not_started_and_the_message_names_the_ways(
    tmp_path: Path, no_addons: None
) -> None:
    model = llm.Model("models/LLM", "tiny.gguf", path=tmp_path / "tiny.gguf")
    (tmp_path / "tiny.gguf").write_bytes(b"")
    program = llm.Runtime("llama-server (configured)", (str(tmp_path / "llama-server"),))
    with pytest.raises(PlenioWorkerError) as refused:
        llm.generate(model, "x", runtimes=[program])
    assert str(refused.value).startswith(runtime.NO_PROGRAM)
    for way in ("LM Studio", "Ollama", "llama-cpp-python", "ComfyUI's own Gemma 4", "GitHub"):
        assert way in str(refused.value)
    with pytest.raises(PlenioWorkerError) as none:
        llm.generate(model, "x", runtimes=[])
    assert "winget install" not in str(none.value) and "llama-cpp-python" in str(none.value)


def test_the_shim_is_this_python_with_plenios_module_only() -> None:
    shim = llm.Runtime("llama-cpp-python", (sys.executable, "-m", runtime.SHIM_MODULE))
    assert runtime.is_shim(shim)
    assert not runtime.is_shim(llm.Runtime("x", (sys.executable, "-m", "http.server")))
    assert not runtime.is_shim(llm.Runtime("x", ("python-from-elsewhere", "-m", runtime.SHIM_MODULE)))
    assert not runtime.is_shim(llm.Runtime("x", (sys.executable, "-m", runtime.SHIM_MODULE, "--more")))


# --- the player starts ComfyUI --------------------------------------------------------------------------------


def test_without_the_add_on_the_player_starts_no_comfyui_and_says_what_to_do(
    tmp_path: Path, no_addons: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(studio_module, "installed_root", lambda: comfyui(tmp_path))
    launcher = StudioLauncher(tmp_path / "state")
    status = launcher.status()
    assert status["launcher"] is False and status["can_start"] is False and not status["running"]
    assert status["why"] == studio_module.NO_LAUNCHER and "the way you usually do" in status["why"]
    assert status["command"] == "" and status["python"] == "" and status["args_used"] == ""
    for refused in (launcher.start, launcher.command):
        with pytest.raises(StudioLaunchError) as error:
            refused()
        assert error.value.status == 409 and str(error.value) == studio_module.NO_LAUNCHER
    assert launcher.process is None and not (tmp_path / "state" / "comfyui.log").exists()
    # a song that waits starts nothing either, and leaves no error behind
    launcher.configure({"auto": True})
    launcher.tick(waiting=True)
    assert launcher.process is None and launcher.error == ""
    with pytest.raises(StudioLaunchError, match="did not start the ComfyUI that runs"):
        launcher.stop()


def test_without_the_add_on_a_comfyui_that_runs_is_found_as_before(tmp_path: Path, no_addons: None) -> None:
    launcher = StudioLauncher(tmp_path / "state", reachable=lambda url: url.endswith(":8188"))
    status = launcher.start()  # one answers: nothing to start, no refusal
    assert (
        status["running"] is True and status["url"] == "http://127.0.0.1:8188" and status["launcher"] is False
    )
    # the settings are kept and checked as with the add-on
    assert launcher.configure({"port": 8200, "args": "--lowvram"})["port"] == 8200
    with pytest.raises(StudioLaunchError):
        launcher.configure({"args": "--listen 0.0.0.0"})


def test_without_the_add_on_comfyui_keeps_no_start_line(
    tmp_path: Path, no_addons: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    launcher = StudioLauncher(tmp_path / "state")
    monkeypatch.setattr(studio_module, "installed_root", lambda: None)
    assert launcher.root() is None and launcher.arguments(tmp_path) == ([], "", None)


def test_with_the_add_on_the_status_says_so(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(studio_module, "installed_root", lambda: comfyui(tmp_path))
    status = StudioLauncher(tmp_path / "state").status()
    assert status["launcher"] is True and status["can_start"] is True and status["why"] == ""
    assert status["command"].endswith("--port 8188") and "main.py" in status["command"]


# --- what the writer and the System Check say -----------------------------------------------------------------


def test_the_writers_advice_fits_the_installation(monkeypatch: pytest.MonkeyPatch) -> None:
    from plenio.core.llm import gemma

    assert (
        gemma.how_to_run_files() == gemma.INSTALL_LLAMA_CPP
        and "winget install llama.cpp" in gemma.INSTALL_LLAMA_CPP
    )
    blocked = gemma.Choice(model=None, asset=None, vram_gib=16.0, runs_files=False)  # type: ignore[arg-type]
    assert "winget install llama.cpp" in blocked.describe()
    monkeypatch.setenv(features.SWITCH, "0")
    advice = gemma.how_to_run_files()
    # installing llama.cpp would not help where no llama-server program is started: the advice names what does
    assert (
        advice == gemma.INSTALL_LLAMA_CPP_PYTHON
        and "winget" not in advice
        and "PLENIO_LLAMA_SERVER" not in advice
    )
    for way in ("llama-cpp-python", "LM Studio", "Ollama", "GitHub"):
        assert way in advice
    assert "winget" not in blocked.describe() and "llama-cpp-python" in blocked.describe()


def test_the_system_check_names_the_add_on_and_what_its_absence_means(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plenio.core import system

    assert system._addon_line().startswith("Studio add-on: installed")
    with_files = {"models": {"ComfyUI models/LLM": 1}, "files": 1, "runtimes": []}
    assert "install llama.cpp (winget/brew)" in " ".join(system._llm_lines(with_files))
    monkeypatch.setenv(features.SWITCH, "0")
    line = system._addon_line()
    assert line.startswith("Studio add-on: not part of this installation")
    for part in ("starting ComfyUI", "llama-server", "file manager", "GitHub"):
        assert part in line
    lines = " ".join(system._llm_lines(with_files))
    assert "winget" not in lines and "llama-cpp-python" in lines and "starts no llama-server program" in lines
