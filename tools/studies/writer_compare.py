"""Phase 0.4: the song writer on ComfyUI's own Gemma 4 files against GGUF files, on the same briefs.

Usage (ComfyUI's Python; a running isolated ComfyUI with Plenio, ``tools/dev_server.py --gpu``, on the card
named by ``--gpu-index``):

    python tools/studies/writer_compare.py <server url> --native gemma4_12b_int8_convrot.safetensors \
        --gguf QAT-Q4_0 [--briefs 20] [--gpu-index 1] --out <file.json>

Each writer writes the first ``--briefs`` song templates' briefs (YuE2, standard detail, seed 0) the way the
templates ask it: a native file through ``CLIPLoader`` + ``TextGenerate``, a GGUF through Plenio's *Local LLM*
(``keep_loaded`` off, as in the templates). Per answer: seconds, characters, whether ``parse_draft`` takes it,
lines and sections of the lyrics, and whether it looks cut off (unparsed and ending mid-way). The card's memory
is sampled with ``nvidia-smi`` while a writer works (peak minus the level before it started). The JSON holds
measures only - no lyrics, no titles.
"""

from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import threading
import time
import urllib.request
from pathlib import Path
from typing import Any

from _common import PROJECT

from plenio.core.brief import TemplateLibrary, build_song_brief
from plenio.core.engines import EngineInfo, yue2
from plenio.core.writing import compose, parse_draft

TEXT_GENERATE = {
    "max_length": 16384,
    "sampling_mode": "on",
    "sampling_mode.temperature": 0.8,
    "sampling_mode.top_k": 64,
    "sampling_mode.top_p": 0.95,
    "sampling_mode.min_p": 0.05,
    "sampling_mode.repetition_penalty": 1.05,
    "sampling_mode.seed": 0,
    "thinking": False,
    "use_default_template": True,
}


def post(url: str, path: str, body: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        url + path, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=60) as response:  # noqa: S310 - local server
        raw = response.read()
        return json.loads(raw) if raw.strip() else {}


def get(url: str, path: str) -> Any:
    with urllib.request.urlopen(url + path, timeout=60) as response:  # noqa: S310 - local server
        return json.loads(response.read())


class MemorySampler:
    """Peak used memory of one card (MiB), from ``nvidia-smi`` every half second."""

    def __init__(self, index: int):
        self.index = index
        self.peak = 0
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def used(self) -> int:
        out = subprocess.run(  # noqa: S603, S607 - a fixed query of the driver's tool
            ["nvidia-smi", f"--id={self.index}", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
        return int(out.strip().splitlines()[0])

    def _run(self) -> None:
        while not self._stop.is_set():
            self.peak = max(self.peak, self.used())
            self._stop.wait(0.5)

    def __enter__(self) -> MemorySampler:
        self._thread.start()
        return self

    def __exit__(self, *exc: object) -> None:
        self._stop.set()
        self._thread.join()


def gguf_ref(url: str, part: str) -> str:
    options = get(url, "/object_info/PlenioLocalLLM")["PlenioLocalLLM"]["input"]["required"]["model"]
    names = options[0] if isinstance(options[0], list) else options[1].get("options", [])
    found = [name for name in names if part.lower() in name.lower()]
    if not found:
        raise SystemExit(f"no Local LLM model matches {part!r}")
    return found[0]


def run_prompt(url: str, prompt: dict[str, Any], output: str) -> str:
    prompt_id = post(url, "/prompt", {"prompt": prompt})["prompt_id"]
    while True:
        history = get(url, f"/history/{prompt_id}")
        entry = history.get(prompt_id)
        if entry and entry["status"].get("completed"):
            return entry["outputs"][output]["text"][0]
        if entry and entry["status"].get("status_str") == "error":
            raise RuntimeError(json.dumps(entry["status"].get("messages", []))[-2000:])
        time.sleep(0.5)


def measure(text: str, request: Any) -> dict[str, Any]:
    row: dict[str, Any] = {"chars": len(text)}
    try:
        draft = parse_draft(text, request)
    except Exception as error:  # noqa: BLE001 - a study records every failure
        row.update(
            parsed=False, error=type(error).__name__, cut_off=not text.rstrip().endswith(("}", ".", "]"))
        )
        return row
    lines = [line for line in draft.lyrics.splitlines() if line.strip() and not line.lstrip().startswith("[")]
    sections = [line for line in draft.lyrics.splitlines() if line.lstrip().startswith("[")]
    row.update(
        parsed=True, cut_off=False, lines=len(lines), sections=len(sections), fixes=len(draft.enforcements)
    )
    return row


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("url")
    parser.add_argument("--native", action="append", default=[], help="a text_encoders file (repeatable)")
    parser.add_argument(
        "--gguf", action="append", default=[], help="part of a Local LLM model name (repeatable)"
    )
    parser.add_argument("--briefs", type=int, default=20)
    parser.add_argument(
        "--gpu-index", type=int, default=1, help="nvidia-smi's index of the card ComfyUI uses"
    )
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    url = args.url.rstrip("/")

    library = TemplateLibrary(PROJECT / "resources" / "templates")
    engine = EngineInfo("yue2", yue2.RULES_VERSION, yue2.capabilities())
    briefs = []
    for template_id, template in sorted(library.templates().items())[: args.briefs]:
        values = {"vocals": template.fields.get("vocals", "sung"), "length": "short (about 1:30)"}
        briefs.append((template_id, *compose(build_song_brief(values, template), engine)))

    writers = [("native", name) for name in args.native] + [
        ("gguf", gguf_ref(url, part)) for part in args.gguf
    ]
    results: dict[str, Any] = {"server": get(url, "/system_stats")["system"], "writers": []}
    for kind, name in writers:
        post(url, "/free", {"unload_models": True, "free_memory": True})
        time.sleep(3)
        rows = []
        with MemorySampler(args.gpu_index) as memory:
            before = memory.used()
            memory.peak = before
            for template_id, prompt_text, request in briefs:
                if kind == "native":
                    prompt = {
                        "1": {
                            "class_type": "CLIPLoader",
                            "inputs": {"clip_name": name, "type": "stable_diffusion"},
                        },
                        "2": {
                            "class_type": "TextGenerate",
                            "inputs": {"clip": ["1", 0], "prompt": prompt_text, **TEXT_GENERATE},
                        },
                        "3": {"class_type": "PreviewAny", "inputs": {"source": ["2", 0]}},
                    }
                else:
                    prompt = {
                        "1": {
                            "class_type": "PlenioLocalLLM",
                            "inputs": {
                                "prompt": prompt_text,
                                "model": name,
                                "seed": 0,
                                "max_tokens": 16384,
                                "temperature": 0.8,
                                "thinking": False,
                                "context": 24576,
                                "keep_loaded": False,
                                "system_prompt": "",
                                "reuse_answers": False,
                            },
                        },
                        "3": {"class_type": "PreviewAny", "inputs": {"source": ["1", 0]}},
                    }
                started = time.monotonic()
                try:
                    text = run_prompt(url, prompt, "3")
                    row = {"seconds": round(time.monotonic() - started, 2), **measure(text, request)}
                except RuntimeError as error:
                    row = {"seconds": round(time.monotonic() - started, 2), "failed": str(error)[-300:]}
                row["brief"] = template_id
                rows.append(row)
                print(
                    kind,
                    name.rsplit("/", 1)[-1][:40],
                    template_id,
                    {k: row.get(k) for k in ("seconds", "parsed", "lines", "failed")},
                    flush=True,
                )
        seconds = [row["seconds"] for row in rows if "failed" not in row]
        results["writers"].append(
            {
                "kind": kind,
                "file": name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1],
                "answers": rows,
                "first_seconds": rows[0]["seconds"] if rows else None,
                "median_seconds_after_first": round(statistics.median(seconds[1:]), 2)
                if len(seconds) > 1
                else None,
                "parsed": sum(1 for row in rows if row.get("parsed")),
                "cut_off": sum(1 for row in rows if row.get("cut_off")),
                "failed": sum(1 for row in rows if "failed" in row),
                "peak_mib_above_idle": memory.peak - before,
            }
        )
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(results, indent=1), encoding="utf-8")
    for writer in results["writers"]:
        print({k: v for k, v in writer.items() if k != "answers"})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
