"""The Song API v1 with Model Choice (review after 3.5, C2): a job whose model file is not on this computer is refused
before it is queued, as 1.6 refused it through ComfyUI's check, and ``GET /models`` says whether a template runs by
the files its Model Choices take - not by the catalogue's defaults."""

from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

pytestmark = pytest.mark.comfy
ROOT = Path(__file__).resolve().parents[2]


def pick(file: str, installed: bool, variant: str | None = "v", size: int = 1000) -> Any:
    found = SimpleNamespace(
        file=file,
        installed=installed,
        variant=SimpleNamespace(id=variant) if variant else None,
        download_bytes=0 if installed else size,
    )
    return SimpleNamespace(pick=found, component=SimpleNamespace(folder="checkpoints"))


PROMPT = {
    "3:101": {
        "class_type": "PlenioModelChoice",
        "inputs": {"component": "yue2", "component.file": "auto"},
        "_meta": {"title": "Music model"},
    },
    "3:102": {
        "class_type": "PlenioModelChoice",
        "inputs": {"component": "yue2-instrumental-adapter", "component.file": "auto"},
    },
    "3:103": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": ["3:101", 0]}},
}
"""The adapter's Model Choice feeds nothing (its LoRA is bypassed): it is not asked about."""


def test_a_job_whose_model_file_is_not_here_is_refused_before_it_is_queued(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.comfy import host, setup, song_api

    monkeypatch.setattr(host, "locate_model", lambda folder, file: None)
    asked: list[str] = []

    def choose(component: str, file: str) -> Any:
        asked.append(component)
        return pick("yue2_3b_int8_convrot.safetensors", installed=False)

    monkeypatch.setattr(setup, "choose", choose)
    errors = song_api.model_choice_errors(PROMPT)
    assert asked == ["yue2"]
    assert errors == [
        {
            "node": "3:101",
            "title": "Music model",
            "type": "PlenioModelChoice",
            "message": "Value not in list",
            "details": "file: 'yue2_3b_int8_convrot.safetensors' not in the model folder",
        }
    ]
    assert song_api._missing_files(errors) == ["yue2_3b_int8_convrot.safetensors (Music model)"]
    monkeypatch.setattr(
        setup, "choose", lambda c, f: pick("yue2_3b_int8_convrot.safetensors", installed=True)
    )
    assert song_api.model_choice_errors(PROMPT) == []
    # a file of the name is there (of another size): ComfyUI's own check of 1.6 let it through, and so does this
    monkeypatch.setattr(
        setup, "choose", lambda c, f: pick("yue2_3b_int8_convrot.safetensors", installed=False)
    )
    monkeypatch.setattr(host, "locate_model", lambda folder, file: Path(file))
    assert song_api.model_choice_errors(PROMPT) == []


def test_models_says_whether_a_template_runs_by_the_files_auto_takes(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.comfy import host, setup, song_api
    from plenio.comfy.shared import model_catalogue

    template = SimpleNamespace(
        id="yue2-song",
        name="1 · YuE2 · Song",
        workflow=json.loads(
            (ROOT / "example_workflows" / "1 · YuE2 · Song.json").read_text(encoding="utf-8")
        ),
    )
    catalogue = model_catalogue()
    components = setup.components()
    needed = {c.id for c in components.values() if template.name in c.templates}
    # every catalogue default is there; auto takes them all, except the FLUX.2 encoder's fp4 file it wants here
    defaults = {c.default.file: c.default.bytes for c in components.values()}
    monkeypatch.setattr(host, "locate_model", lambda folder, file: Path(file) if file in defaults else None)
    monkeypatch.setattr(Path, "stat", lambda self, **_: SimpleNamespace(st_size=defaults.get(self.name, 0)))

    def choose(component: str, file: str) -> Any:
        if component == "flux2-text-encoder":
            return pick(
                "qwen_3_4b_fp4_flux2.safetensors",
                installed=False,
                variant="flux2-text-encoder-fp4",
                size=3_800,
            )
        return pick(components[component].default.file, installed=True)

    monkeypatch.setattr(setup, "choose", choose)
    found = song_api._plan_readiness([template], catalogue)["yue2-song"]
    assert found == {
        "ready": False,
        "missing": ["flux2-text-encoder-fp4"],
        "incomplete": [],
        "missing_bytes": 3_800,
    }
    assert needed == {"yue2", "flux2-klein", "flux2-text-encoder", "flux2-vae"}  # all decided by Model Choice
