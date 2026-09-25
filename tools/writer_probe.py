"""Run the writing prompt through a real text model on a running ComfyUI and print the raw answers.

Usage: <python> tools/writer_probe.py <server url> <writer model file> [template id] [runs]

Used for study AS-01 (writer quality) and for checking that the answer format is parsed.
"""

from __future__ import annotations

import json
import sys
import time
import urllib.request
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from plenio.core.brief import TemplateLibrary, build_song_brief  # noqa: E402
from plenio.core.engines import EngineInfo, yue2  # noqa: E402
from plenio.core.writing import compose, parse_draft  # noqa: E402


def post(url: str, path: str, body: dict) -> dict:
    request = urllib.request.Request(
        url + path, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=60) as response:  # noqa: S310 - local server
        return json.loads(response.read())


def get(url: str, path: str) -> dict:
    with urllib.request.urlopen(url + path, timeout=60) as response:  # noqa: S310 - local server
        return json.loads(response.read())


def main() -> int:
    url, writer = sys.argv[1], sys.argv[2]
    template_id = sys.argv[3] if len(sys.argv) > 3 else "pop/singer-songwriter-acoustic-vocal"
    runs = int(sys.argv[4]) if len(sys.argv) > 4 else 1
    library = TemplateLibrary(PROJECT / "resources" / "templates")
    template = library.get(template_id)
    brief = build_song_brief(
        {"vocals": template.fields.get("vocals", "sung"), "length": "short (about 1:30)"}, template
    )
    engine = EngineInfo("yue2", yue2.RULES_VERSION, yue2.capabilities())
    prompt_text, request = compose(brief, engine)
    for seed in range(runs):
        prompt = {
            "1": {
                "class_type": "CLIPLoader",
                "inputs": {"clip_name": writer, "type": "stable_diffusion", "device": "default"},
            },
            "2": {
                "class_type": "TextGenerate",
                "inputs": {
                    "clip": ["1", 0],
                    "prompt": prompt_text,
                    "max_length": 2048,
                    "sampling_mode": "on",
                    "sampling_mode.temperature": 0.8,
                    "sampling_mode.top_k": 64,
                    "sampling_mode.top_p": 0.95,
                    "sampling_mode.min_p": 0.05,
                    "sampling_mode.repetition_penalty": 1.05,
                    "sampling_mode.seed": seed,
                    "thinking": False,
                    "use_default_template": True,
                },
            },
            "3": {"class_type": "PreviewAny", "inputs": {"source": ["2", 0]}},
        }
        started = time.time()
        prompt_id = post(url, "/prompt", {"prompt": prompt})["prompt_id"]
        while True:
            history = get(url, f"/history/{prompt_id}")
            if prompt_id in history and history[prompt_id]["status"].get("completed"):
                break
            time.sleep(1)
        text = history[prompt_id]["outputs"]["3"]["text"][0]
        print(f"=== seed {seed}: {time.time() - started:.1f} s, {len(text)} chars")
        print(text)
        try:
            draft = parse_draft(text, request)
            print("--- parsed:", json.dumps(draft.to_dict(), ensure_ascii=False, indent=1))
        except Exception as error:  # noqa: BLE001 - a probe reports everything
            print("--- parse failed:", error)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
