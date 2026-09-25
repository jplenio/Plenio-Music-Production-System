"""AS-14: Plenio's exact YuE2 budget matches the native encoder's own token arithmetic.

Needs ComfyUI (``PLENIO_COMFYUI_ROOT``) and the YuE2 checkpoint (``PLENIO_MODELS_DIR``). Only the
tokenizer tensor is read from the checkpoint; the model is not loaded.
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

pytestmark = pytest.mark.comfy
MODELS = os.environ.get("PLENIO_MODELS_DIR", "").strip()
CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
ROOT = Path(__file__).resolve().parents[2]
SONG = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
STYLE = "English, warm piano pop, expressive female voice, acoustic piano, light drums, 88 BPM"
LYRICS = "[Verse]\nNeon fades along the lane\nFootsteps keep the time of rain\n\n[Chorus]\nLet the day come into view"


@pytest.fixture(scope="module")
def native_tokenizer(comfy_path: Path) -> object:
    if not MODELS or not (Path(MODELS) / "checkpoints" / CHECKPOINT).exists():
        pytest.skip(f"set PLENIO_MODELS_DIR to a models folder containing checkpoints/{CHECKPOINT}")
    import comfy.text_encoders.yue2 as native
    from safetensors import safe_open

    with safe_open(str(Path(MODELS) / "checkpoints" / CHECKPOINT), framework="pt") as handle:
        keys = [k for k in handle.keys() if k.endswith("yue2_tokenizer_json")]
        assert keys, "the checkpoint carries no yue2_tokenizer_json"
        data = handle.get_tensor(keys[0])
    return native.YuE2Tokenizer(tokenizer_data={"yue2_tokenizer_json": data})


def test_tokenizer_structure_and_exact_budget(native_tokenizer: object) -> None:
    import comfy.text_encoders.yue2 as native

    from plenio.comfy.host import _YuE2Tokenizer
    from plenio.core.engines import yue2

    handle = _YuE2Tokenizer(native_tokenizer)
    tokens = native_tokenizer.tokenize_with_weights(STYLE, lyrics=LYRICS, cot="full", abc=SONG)  # type: ignore[attr-defined]
    assert {"prefix", "abc_ids", "negative", "cot"} <= set(tokens)
    assert tokens["prefix"][0] == native.EOD and tokens["prefix"][-1] == native.ABC_START
    # The native encoder builds prefix + abc + [ABC_END, MUSIC_START] and grants the rest of the context.
    native_music = native.CONTEXT - (len(tokens["prefix"]) + len(tokens["abc_ids"]) + 2)
    budget = yue2.budget(handle, STYLE, LYRICS, SONG)
    assert budget.music_tokens == native_music
    assert yue2.CONTEXT_TOKENS == native.CONTEXT and yue2.FRAMES_PER_SECOND == native.FRAMES_PER_SECOND
    off = yue2.budget(handle, STYLE, LYRICS, "")
    off_tokens = native_tokenizer.tokenize_with_weights(STYLE, lyrics=LYRICS, cot="off")  # type: ignore[attr-defined]
    assert off.music_tokens == native.CONTEXT - (len(off_tokens["prefix"]) + 2)
