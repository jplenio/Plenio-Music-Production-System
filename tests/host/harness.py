"""Start a real ComfyUI server in a throw-away base directory.

The server runs ComfyUI's own Python (``PLENIO_COMFYUI_PYTHON`` or the
``.venv`` inside ``PLENIO_COMFYUI_ROOT``) with ``--disable-all-custom-nodes``
and a whitelist, so only Plenio and the given test node packs load. Nothing
of the user's installation (custom nodes, user data, outputs) is touched.
"""

from __future__ import annotations

import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[2]
PACKAGE_PARTS = (
    "__init__.py",
    "pyproject.toml",
    "LICENSE",
    "plenio",
    "web",
    "subgraphs",
    "example_workflows",
    "resources",
    "locales",
)
PACKAGE_NAME = "Plenio-Music-Production-System"


def comfy_python(root: Path) -> Path:
    explicit = os.environ.get("PLENIO_COMFYUI_PYTHON", "").strip()
    if explicit:
        return Path(explicit)
    for candidate in (
        root / ".venv" / "Scripts" / "python.exe",
        root / ".venv" / "bin" / "python",
        root / "venv" / "Scripts" / "python.exe",
        root / "venv" / "bin" / "python",
    ):
        if candidate.exists():
            return candidate
    return Path(sys.executable)


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def copy_package(target: Path, extra_files: Mapping[str, Path] | None = None) -> Path:
    """Copy the runtime parts of Plenio (a snapshot, like an installed release)."""
    destination = target / PACKAGE_NAME
    destination.mkdir(parents=True)
    ignore = shutil.ignore_patterns("__pycache__", "*.pyc")
    for part in PACKAGE_PARTS:
        source = PROJECT / part
        if source.is_dir():
            shutil.copytree(source, destination / part, ignore=ignore)
        elif source.exists():
            shutil.copy2(source, destination / part)
    for relative, source in (extra_files or {}).items():
        (destination / relative).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination / relative)
    return destination


def link_folder(source: Path, destination: Path) -> None:
    """Directory junction on Windows, symlink elsewhere (for large read-only node packs)."""
    if os.name == "nt":
        import _winapi

        _winapi.CreateJunction(str(source), str(destination))
    else:
        destination.symlink_to(source, target_is_directory=True)


class Log:
    def __init__(self, path: Path):
        self.path = path

    def clear(self) -> None:
        self.path.unlink(missing_ok=True)

    def events(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        return [json.loads(line) for line in self.path.read_text(encoding="utf-8").splitlines() if line]

    def nodes(self) -> list[str]:
        return [event["node"] for event in self.events()]


class ExecutionFailedError(AssertionError):
    pass


class ComfyServer:
    def __init__(
        self,
        comfy_root: Path,
        base: Path,
        *,
        node_packs: Iterable[str],
        cpu: bool = True,
        models_dir: Path | None = None,
        extra_env: Mapping[str, str] | None = None,
    ):
        self.root = comfy_root
        self.base = base
        self.node_packs = list(node_packs)
        self.cpu = cpu
        self.models_dir = models_dir
        self.extra_env = dict(extra_env or {})
        self.port = free_port()
        self.url = f"http://127.0.0.1:{self.port}"
        self.process: subprocess.Popen[bytes] | None = None
        self.log_path = base / "server.log"
        self.client_id = uuid.uuid4().hex

    @property
    def custom_nodes(self) -> Path:
        return self.base / "custom_nodes"

    @property
    def output_dir(self) -> Path:
        return self.base / "output"

    def start(self, timeout: float = 240.0) -> None:
        command = [
            str(comfy_python(self.root)),
            "main.py",
            "--listen",
            "127.0.0.1",
            "--port",
            str(self.port),
            "--base-directory",
            str(self.base),
            "--disable-all-custom-nodes",
            "--whitelist-custom-nodes",
            *self.node_packs,
            "--disable-api-nodes",
            "--database-url",
            "sqlite:///:memory:",
        ]
        if self.cpu:
            command.append("--cpu")
        if self.models_dir is not None:
            command += ["--models-directory", str(self.models_dir)]
        env = {k: v for k, v in os.environ.items() if k not in {"PYTHONPATH", "PYTHONHOME"}}
        env.update({"PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"}, **self.extra_env)
        self.base.mkdir(parents=True, exist_ok=True)
        log = self.log_path.open("wb")
        self.process = subprocess.Popen(command, cwd=self.root, stdout=log, stderr=subprocess.STDOUT, env=env)  # noqa: S603
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise RuntimeError(f"ComfyUI exited early ({self.process.returncode}):\n{self.log_tail()}")
            try:
                self.get("/system_stats")
                return
            except (urllib.error.URLError, ConnectionError):
                time.sleep(0.5)
        self.stop()
        raise RuntimeError(f"ComfyUI did not start within {timeout:.0f} s:\n{self.log_tail()}")

    def stop(self) -> None:
        if self.process is not None and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=20)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()

    def log_tail(self, size: int = 6000) -> str:
        if not self.log_path.exists():
            return ""
        return self.log_path.read_bytes()[-size:].decode("utf-8", errors="replace")

    def log_text(self) -> str:
        return self.log_path.read_bytes().decode("utf-8", errors="replace") if self.log_path.exists() else ""

    # --- HTTP ---------------------------------------------------------------

    def request(self, method: str, path: str, body: Any = None) -> tuple[int, Any]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(
            self.url + path, data=data, method=method, headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:  # noqa: S310 - local test server
                raw = response.read()
                status = response.status
        except urllib.error.HTTPError as error:
            raw, status = error.read(), error.code
        text = raw.decode("utf-8")
        try:
            return status, json.loads(text)
        except json.JSONDecodeError:
            return status, text

    def get(self, path: str) -> Any:
        status, data = self.request("GET", path)
        if status != 200:
            raise AssertionError(f"GET {path} -> {status}: {data}")
        return data

    # --- execution ----------------------------------------------------------

    def queue(self, prompt: Mapping[str, Any]) -> str:
        status, data = self.request("POST", "/prompt", {"prompt": prompt, "client_id": self.client_id})
        if status != 200:
            raise ExecutionFailedError(f"prompt rejected ({status}): {json.dumps(data, indent=1)[:4000]}")
        return str(data["prompt_id"])

    def wait(self, prompt_id: str, timeout: float = 600.0) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            history = self.get(f"/history/{prompt_id}")
            if prompt_id in history:
                entry: dict[str, Any] = history[prompt_id]
                status = entry.get("status", {})
                if status.get("completed") or status.get("status_str") in ("success", "error"):
                    return entry
            time.sleep(0.2)
        raise TimeoutError(f"prompt {prompt_id} did not finish:\n{self.log_tail()}")

    def run(self, prompt: Mapping[str, Any], timeout: float = 600.0) -> dict[str, Any]:
        entry = self.wait(self.queue(prompt), timeout)
        if entry["status"].get("status_str") != "success":
            raise ExecutionFailedError(json.dumps(entry["status"], indent=1)[:6000])
        return entry

    def run_expect_error(self, prompt: Mapping[str, Any], timeout: float = 600.0) -> dict[str, Any]:
        entry = self.wait(self.queue(prompt), timeout)
        assert entry["status"].get("status_str") == "error", entry["status"]
        for message_type, payload in entry["status"].get("messages", []):
            if message_type == "execution_error":
                return dict(payload)
        raise AssertionError(f"no execution_error message: {entry['status']}")
