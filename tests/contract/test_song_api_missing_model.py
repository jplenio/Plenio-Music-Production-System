"""A run ComfyUI refuses for a model file it does not find names the file, the node and what to do (issue
2026-10-28: the player showed "Load checkpoint: Value not in list")."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

import pytest

pytestmark = pytest.mark.comfy


def test_a_missing_model_file_is_named(comfy_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from plenio.comfy import song_api_v1 as song_api

    refusal = {
        "error": {"type": "prompt_outputs_failed_validation", "message": "Prompt outputs failed validation"},
        "node_errors": {
            "3": {
                "class_type": "CheckpointLoaderSimple",
                "errors": [
                    {
                        "type": "value_not_in_list",
                        "message": "Value not in list",
                        "details": "ckpt_name: 'yue2_3b_bf16.safetensors' not in ['other.safetensors']",
                    }
                ],
            }
        },
    }

    class Answer:
        status = 400

        async def json(self, content_type: Any = None) -> dict[str, Any]:
            return refusal

        async def __aenter__(self) -> Answer:
            return self

        async def __aexit__(self, *_: Any) -> None:
            return None

    class Session:
        def __init__(self, **_: Any) -> None:
            pass

        def post(self, *_: Any, **__: Any) -> Answer:
            return Answer()

        async def __aenter__(self) -> Session:
            return self

        async def __aexit__(self, *_: Any) -> None:
            return None

    monkeypatch.setattr(song_api, "ClientSession", Session)
    monkeypatch.setattr(song_api, "_self_url", lambda: "http://127.0.0.1:8188")
    prompt = {
        "3": {"class_type": "CheckpointLoaderSimple", "_meta": {"title": "Load checkpoint"}, "inputs": {}}
    }
    with pytest.raises(song_api.SongApiError) as raised:
        asyncio.run(song_api._post_prompt(prompt, {}, {}))
    error = raised.value
    assert "yue2_3b_bf16.safetensors (Load checkpoint)" in str(error)
    assert "--models-directory" in error.hint and error.details[0]["node"] == "3"
