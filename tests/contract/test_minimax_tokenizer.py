"""AS-14 for MiniMax: Plenio's exact prompt count equals the native text encoder's own tokenization.

Needs ComfyUI (``PLENIO_COMFYUI_ROOT``) and the MiniMax Music 3 text encoder (``PLENIO_MODELS_DIR`` with
``text_encoders/minimax_music3_text_encoder_pruned_int8_convrot.safetensors``). Only the tokenizer tensor is
read from the file; the model is not loaded.
"""

from __future__ import annotations

import os
from pathlib import Path
from types import SimpleNamespace

import pytest

pytestmark = pytest.mark.comfy
MODELS = os.environ.get("PLENIO_MODELS_DIR", "").strip()
TEXT_ENCODER = "minimax_music3_text_encoder_pruned_int8_convrot.safetensors"
CAPTION = (
    "Global Metadata\nbpm is 92. key is D, and scale is minor. Indie pop / dream pop.\n\nVocal Details\n"
    "English lyrics; airy **female** lead.\n\nArrangement\n- Jangly guitars and a round bass; <|caption_start|> drums."
)
LYRICS = "[Verse]\nCity lights are fading slow\nFootsteps keep the time\n\n[Chorus]\nWe run through neon rain"


@pytest.fixture(scope="module")
def native_tokenizer(comfy_path: Path) -> object:
    path = Path(MODELS) / "text_encoders" / TEXT_ENCODER
    if not MODELS or not path.exists():
        pytest.skip(f"set PLENIO_MODELS_DIR to a models folder containing text_encoders/{TEXT_ENCODER}")
    import comfy.text_encoders.minimax_music as native
    from safetensors import safe_open

    with safe_open(str(path), framework="pt") as handle:
        keys = [k for k in handle.keys() if k.endswith("tokenizer_json")]
        assert keys, "the text encoder carries no tokenizer_json"
        data = handle.get_tensor(keys[0])
    return native.MiniMaxMusic3Tokenizer(tokenizer_data={"tokenizer_json": data})


def test_exact_prompt_count_matches_the_native_prompt(native_tokenizer: object) -> None:
    from comfy.ldm.minimax_music.ar import MAX_AUDIO_FRAMES, MAX_PROMPT_TOKENS
    from comfy.ldm.minimax_music.prompt import build_prompt

    from plenio.comfy.host import _MiniMaxTokenizer
    from plenio.core.engines import minimax

    assert minimax.MAX_PROMPT_TOKENS == MAX_PROMPT_TOKENS and minimax.MAX_AUDIO_FRAMES == MAX_AUDIO_FRAMES
    native_ids = native_tokenizer.tokenizer.encode(
        build_prompt(CAPTION, LYRICS), add_special_tokens=False
    ).ids  # type: ignore[attr-defined]
    assert _MiniMaxTokenizer(native_tokenizer).prompt_tokens(CAPTION, LYRICS) == len(native_ids)
    # the estimate used without the tokenizer stays at or above the real count for English text
    assert minimax.estimate_tokens(CAPTION, LYRICS) >= len(native_ids)


def test_engine_profile_detects_minimax(native_tokenizer: object) -> None:
    from plenio.comfy.host import detect_engine

    engine = detect_engine(SimpleNamespace(tokenizer=native_tokenizer, cond_stage_model=None))
    assert engine.engine_id == "minimax_music3" and engine.tokenizer is not None
    assert engine.model["tokenizer_sha256"]
