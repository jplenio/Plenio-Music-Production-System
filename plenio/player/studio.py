"""The studio - ComfyUI - seen from the player: its settings, whether one answers, and the start.

The player runs on its own; ComfyUI is started only to make songs, and nobody has to open a workflow for it. This
module keeps the admin's settings (``studio.json`` in the player's state folder: ComfyUI's folder, more arguments,
the port, starting by itself, stopping when idle), checks them, knows whether a ComfyUI answers on this computer
and reports all of it to the page.

**Starting and stopping ComfyUI is the Studio add-on's part** (``plenio/addons/studio_launcher.py``: the command,
the process, the log; see ``plenio.core.features``). A ``git clone`` and the release zip carry it. The Comfy
Registry package does not: there the player starts no program, says so, and uses the ComfyUI that runs - the one
that opened the player, or one started the usual way.

Standard library only.
"""

from __future__ import annotations

import json
import os
import shlex
import threading
import time
from collections.abc import Callable
from pathlib import Path
from typing import TYPE_CHECKING, Any

from ..core import features

if TYPE_CHECKING:
    import subprocess

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
FILE = "studio.json"
LOG = "comfyui.log"
DEFAULTS: dict[str, Any] = {"root": "", "args": "", "port": 8188, "auto": False, "idle_stop_min": 0}
"""``root``: ComfyUI's folder (empty: the one Plenio is installed in); ``args``: more arguments for ``main.py``;
``auto``: a song ordered while ComfyUI is not running starts it; ``idle_stop_min``: a ComfyUI the player started is
stopped after so many minutes without a song (0: never)."""
REFUSED = ("--listen", "--enable-cors-header", "--port", "--tls-keyfile", "--tls-certfile")
"""Arguments the player does not pass: ComfyUI stays on this computer, on the port the player knows."""
STARTING_S = 240.0
"""How long a start may take before the player says it did not come up (the first start loads custom nodes)."""
RESTART_AFTER_S = 120.0
"""A ComfyUI started by itself that ended (a port taken, a broken install) is started by itself again only after
so many seconds - not every few seconds while a song waits."""
ARGS_LIMIT = 1000
ADDON = "studio_launcher"
NO_LAUNCHER = (
    "This installation of Plenio does not start ComfyUI (the Comfy Registry package leaves that part out). Start "
    "ComfyUI the way you usually do - the player finds it. Plenio from GitHub (git clone or the release zip) "
    "starts it for you."
)
"""What the page hears where the Studio add-on is not installed."""
START_FILE = "comfyui-start.json"
"""How each ComfyUI with Plenio was last started, kept in the player's state folder by the Studio add-on."""


class StudioLaunchError(ValueError):
    """A start or a setting refused, with the reason (and the HTTP status to answer)."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


COMFYUI_FILES = ("main.py", "folder_paths.py", "execution.py")
"""What a ComfyUI folder holds besides its ``comfy`` package: the player starts no other ``main.py``."""


def is_comfyui(folder: Path) -> bool:
    """``folder`` is ComfyUI's own: its ``main.py`` beside ``folder_paths.py``, ``execution.py`` and ``comfy``."""
    return all((folder / name).is_file() for name in COMFYUI_FILES) and (folder / "comfy").is_dir()


def installed_root() -> Path | None:
    """The ComfyUI Plenio is installed in: ``<ComfyUI>/custom_nodes/<Plenio>``."""
    candidate = PACKAGE_ROOT.parent.parent
    if PACKAGE_ROOT.parent.name == "custom_nodes" and is_comfyui(candidate):
        return candidate
    return None


def parse_args(text: str) -> list[str]:
    """The admin's extra arguments as a list (quotes keep a path with spaces together); refused: what would open
    ComfyUI to the network or move it to another port, and anything that is not an option or its value."""
    if len(text) > ARGS_LIMIT:
        raise StudioLaunchError(f"At most {ARGS_LIMIT} characters of arguments.")
    try:
        parts = shlex.split(text, posix=os.name != "nt")
    except ValueError as error:
        raise StudioLaunchError(f"The arguments: {error}") from error
    if os.name == "nt":
        parts = [p[1:-1] if len(p) > 1 and p[0] == p[-1] == '"' else p for p in parts]
    for part in parts:
        name = part.split("=", 1)[0].lower()
        if name in REFUSED:
            raise StudioLaunchError(
                f"{name} is not passed: ComfyUI stays on this computer, on the port set here "
                "(the network comes in by Settings > In your network)."
            )
        if any(ch in part for ch in "\r\n\0"):
            raise StudioLaunchError("An argument with a line break.")
    if parts and not parts[0].startswith("-"):
        raise StudioLaunchError("The arguments start with an option, such as --models-directory.")
    return parts


class StudioLauncher:
    """The ComfyUI the player uses: its settings (``studio.json`` in the player's state folder), whether one
    answers, and - with the Studio add-on - the process the player started and whether it came up."""

    def __init__(
        self,
        directory: Path,
        reachable: Callable[[str], bool] | None = None,
        clock: Callable[[], float] = time.time,
    ):
        self.directory = directory
        self.path = directory / FILE
        self.lock = threading.Lock()
        self.clock = clock
        self.reachable = reachable or (lambda url: False)
        self.elsewhere: Callable[[], str | None] = lambda: None
        """A ComfyUI on this computer the player did not start - the one that started the player, ComfyUI Desktop
        on 8000 ...: its address, or ``None``. While one answers, the player starts none of its own."""
        self.settings = self._load()
        self.process: subprocess.Popen[bytes] | None = None
        self.started_at = 0.0
        self.last_busy = clock()
        self.error = ""

    # --- settings ---------------------------------------------------------------------------------------------
    def _load(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            data = {}
        out = dict(DEFAULTS)
        if isinstance(data, dict):
            out.update({k: v for k, v in data.items() if k in DEFAULTS})
        return out

    def _save(self) -> None:
        self.directory.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(".tmp")
        temp.write_text(json.dumps(self.settings, indent=1), encoding="utf-8")
        temp.replace(self.path)

    def configure(self, changes: dict[str, Any]) -> dict[str, Any]:
        """The admin's settings, checked: ComfyUI's own folder (empty: the one Plenio is in), the arguments, a port,
        starting by itself, stopping after idle minutes."""
        with self.lock:
            settings = dict(self.settings)
            if "root" in changes:
                root = str(changes["root"] or "").strip()
                if root and not is_comfyui(Path(root)):
                    raise StudioLaunchError(
                        "That is no ComfyUI folder (its main.py, folder_paths.py, execution.py and comfy) - choose "
                        "ComfyUI's own folder."
                    )
                settings["root"] = root
            if "args" in changes:
                text = str(changes["args"] or "").strip()
                parse_args(text)
                settings["args"] = text
            if "port" in changes:
                try:
                    port = int(changes["port"])
                except (TypeError, ValueError) as error:
                    raise StudioLaunchError("The port is a number from 1024 to 65535.") from error
                if not 1024 <= port <= 65535:
                    raise StudioLaunchError("The port is a number from 1024 to 65535.")
                settings["port"] = port
            if "auto" in changes:
                settings["auto"] = bool(changes["auto"])
            if "idle_stop_min" in changes:
                try:
                    minutes = int(changes["idle_stop_min"])
                except (TypeError, ValueError) as error:
                    raise StudioLaunchError("Minutes: 0 (never) to 600.") from error
                settings["idle_stop_min"] = max(0, min(600, minutes))
            self.settings = settings
            self._save()
        return self.status()

    # --- where and how ----------------------------------------------------------------------------------------
    def root(self) -> Path | None:
        """The folder chosen in Settings, else the ComfyUI Plenio is installed in, else the one last started with
        Plenio (ComfyUI Desktop keeps Plenio outside its own folder)."""
        chosen = str(self.settings.get("root") or "").strip()
        if chosen:
            path = Path(chosen)
            return path if is_comfyui(path) else None
        installed = installed_root()
        if installed is not None:
            return installed
        if not self.can_launch():
            return None
        found: Path | None = features.load(ADDON).last_root(self.directory)
        return found

    def can_launch(self) -> bool:
        """This installation carries the part that starts ComfyUI (the Studio add-on)."""
        return features.has(ADDON)

    def arguments(self, root: Path) -> tuple[list[str], str, dict[str, Any] | None]:
        """The arguments for ``main.py``: the ones set in Settings, else those of the last start of this ComfyUI
        (its models folder, its options), else none - and where they come from (``settings``, ``last start`` or
        ``""``), with that last start."""
        if not self.can_launch():
            return [], "", None
        found: tuple[list[str], str, dict[str, Any] | None] = features.load(ADDON).arguments(self, root)
        return found

    def url(self) -> str:
        return f"http://127.0.0.1:{int(self.settings.get('port') or 8188)}"

    def answering(self) -> str | None:
        """The ComfyUI that answers on this computer: on the player's port, or another one found."""
        if self.reachable(self.url()):
            return self.url()
        other = self.elsewhere()
        return other.rstrip("/") if other else None

    def command(self) -> tuple[list[str], Path]:
        """The argument list that starts ComfyUI, and the folder it runs in."""
        if not self.can_launch():
            raise StudioLaunchError(NO_LAUNCHER, 409)
        found: tuple[list[str], Path] = features.load(ADDON).command(self)
        return found

    # --- start, stop ------------------------------------------------------------------------------------------
    def started(self) -> bool:
        """The player's own ComfyUI runs (it started it, and it has not ended)."""
        return self.process is not None and self.process.poll() is None

    def start(self) -> dict[str, Any]:
        """Start ComfyUI in the background - unless one answers already, or the player's own is on its way up."""
        with self.lock:
            if self.answering():
                return self.status()
            if self.started():
                return self.status()
            if not self.can_launch():
                raise StudioLaunchError(NO_LAUNCHER, 409)
            try:
                self.process = features.load(ADDON).start(self)
            except OSError as error:
                self.error = f"ComfyUI did not start: {error}"
                raise StudioLaunchError(self.error, 500) from error
            self.started_at = self.clock()
            self.last_busy = self.clock()
            self.error = ""
        return self.status()

    def stop(self) -> dict[str, Any]:
        """Stop the ComfyUI the player started (one started otherwise is not the player's to stop)."""
        with self.lock:
            process = self.process
            if process is None or process.poll() is not None:
                raise StudioLaunchError(
                    "The player did not start the ComfyUI that runs - stop it where it was started.", 409
                )
            features.load(ADDON).stop(process)
            self.process = None
        return self.status()

    def busy(self) -> None:
        """A song is being made or waits: the idle time starts again."""
        self.last_busy = self.clock()

    def tick(self, waiting: bool) -> None:
        """The party songs' worker asks now and then: start ComfyUI for a song that waits (when the admin wants
        it), stop the player's own after the idle minutes."""
        if waiting:
            self.busy()
            if (
                self.settings.get("auto")
                and self.can_launch()
                and not self.started()
                and self.clock() - self.started_at > RESTART_AFTER_S
                and not self.answering()
            ):
                try:
                    self.start()
                except StudioLaunchError as error:
                    self.error = str(error)
            return
        minutes = int(self.settings.get("idle_stop_min") or 0)
        if minutes and self.started() and self.clock() - self.last_busy > minutes * 60:
            try:
                self.stop()
            except StudioLaunchError:
                pass

    def log_tail(self, lines: int = 14) -> list[str]:
        try:
            with (self.directory / LOG).open("rb") as handle:
                handle.seek(0, os.SEEK_END)
                size = handle.tell()
                handle.seek(max(0, size - 16384))
                text = handle.read().decode("utf-8", errors="replace")
        except OSError:
            return []
        return [line for line in text.splitlines() if line.strip()][-lines:]

    def status(self, *, admin: bool = True) -> dict[str, Any]:
        """What the page shows: whether ComfyUI runs, whether the player started it (and when), whether it can
        (``launcher``: this installation starts ComfyUI at all), and for the admin the folder, the Python, the
        arguments and the end of the log."""
        found = self.answering()
        running = found is not None
        own = self.started()
        starting = own and not running and self.clock() - self.started_at < STARTING_S
        try:
            command, root = self.command()
            can, why = True, ""
        except StudioLaunchError as error:
            command, root, can, why = [], None, False, str(error)
        out: dict[str, Any] = {
            "running": running,
            "own": own,
            "starting": starting,
            "since": self.started_at if own else None,
            "launcher": self.can_launch(),
            "can_start": can,
            "why": why,
            "url": found or self.url(),
            "auto": bool(self.settings.get("auto")),
            "idle_stop_min": int(self.settings.get("idle_stop_min") or 0),
            "error": self.error,
        }
        if own and not running and not starting and not self.error:
            out["error"] = "ComfyUI did not answer in time - its log says why."
        if admin:
            source, used, last_at = "", "", None
            if root is not None:
                try:
                    extra, source, last = self.arguments(root)
                    used = " ".join(extra)
                    last_at = (float(last.get("at") or 0) or None) if last else None
                except StudioLaunchError:
                    source = ""
            out.update(
                args_from=source,
                args_used=used,
                last_start_at=last_at,
                root=str(root or self.settings.get("root") or ""),
                chosen_root=str(self.settings.get("root") or ""),
                installed_root=str(installed_root() or ""),
                python=command[0] if command else "",
                args=str(self.settings.get("args") or ""),
                port=int(self.settings.get("port") or 8188),
                command=" ".join(command),
                log=self.log_tail(),
            )
        return out
