"""The BS-RoFormer 4-stem adapter behind Load Audio Model (Phase 11C M6/D11).

The released checkpoint (503 MB, MUSDB18-HQ) stays on the owner's machine (L2); these tests cover
the adapter's pure parts and its plumbing with a fake model that mimics the upstream output shape.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from plenio.comfy import msst
from plenio.core.audio.stems import make_stems
from plenio.core.errors import PlenioModelError

torch = pytest.importorskip("torch", reason="the adapter needs PyTorch (ComfyUI provides it)")


def test_matches_recognises_the_released_checkpoint() -> None:
    for name in msst.FILE_NAMES:
        assert msst.matches(name)
    assert msst.matches("sub/model_bs_roformer_ep_17_sdr_9.6568.ckpt")
    assert msst.matches("my-bs-roformer-finetune.ckpt")
    assert not msst.matches("unknown-stems.ckpt")
    assert not msst.matches("htdemucs.safetensors")


def test_the_separator_follows_the_core_contract() -> None:
    separator = msst.BSRoformerSeparator(model=None)
    assert separator.name == "BS-RoFormer 4-stem"
    assert separator.stems == ("vocals", "drums", "bass", "other")
    assert msst.SAMPLE_RATE == 44100


class FakeModel:
    """Mimics the upstream model: ``[batch, stems, channels, samples]``, each stem a known share."""

    def __init__(self, shares: tuple[float, ...] = (0.4, 0.3, 0.2, 0.1)) -> None:
        self.shares = shares
        self.calls = 0
        self.last_shape: tuple[int, ...] | None = None

    def __call__(self, tensor: Any) -> Any:
        self.calls += 1
        self.last_shape = tuple(tensor.shape)
        stems = torch.stack([tensor * share for share in self.shares], dim=1)
        return stems


def test_separate_keeps_the_input_rate_length_and_channels() -> None:
    model = FakeModel()
    separator = msst.BSRoformerSeparator(model=model, chunk_frames=1024, overlap_frames=256)
    rate, seconds = 48000, 0.25
    t = np.arange(int(seconds * rate)) / rate
    tone = (0.3 * np.sin(2 * np.pi * 440 * t)).astype(np.float64)
    audio = np.stack([tone, tone * 0.5])
    stems = separator.separate(audio, rate)
    assert set(stems) == {"vocals", "drums", "bass", "other"}
    for name, stem in stems.items():
        assert stem.shape == audio.shape, name  # the core requires the input's shape
        assert stem.dtype == np.float32
    # the shares add up: a neutral mix with the residual is exactly the input
    mixed = sum(stems.values()).astype(np.float64)
    assert np.allclose(mixed, audio, atol=2e-3)
    container = make_stems(audio, rate, stems, source=separator.name)
    assert container.residual.shape == audio.shape
    assert model.calls >= 2  # 0.25 s at 44.1 kHz is longer than one 1024-frame chunk


def test_separate_handles_mono_and_short_inputs() -> None:
    separator = msst.BSRoformerSeparator(model=FakeModel(), chunk_frames=4096, overlap_frames=1024)
    audio = np.zeros((1, 500), dtype=np.float64)
    stems = separator.separate(audio, 44100)
    assert all(stem.shape == (1, 500) for stem in stems.values())


def test_a_broken_checkpoint_is_refused_with_a_hint(tmp_path: Path) -> None:
    broken = tmp_path / "bs_roformer_broken.ckpt"
    broken.write_text("not a checkpoint", encoding="utf-8")
    with pytest.raises(PlenioModelError) as error:
        msst.load(broken)
    assert "could not be read" in error.value.message
    assert "missing-model dialog" in (error.value.hint or "")


def test_the_released_config_is_used_when_the_checkpoint_has_none(tmp_path: Path) -> None:
    released = json.loads((msst.VENDOR / msst.CONFIG_NAME).read_text(encoding="utf-8"))
    assert released["model"]["num_stems"] == 4 and released["model"]["dim"] == 384
    path = tmp_path / "plain.ckpt"
    torch.save({"state_dict": {"a": torch.zeros(1)}}, path)
    config, state = msst._read_checkpoint(path, torch)
    assert config == released and list(state) == ["a"]


def test_a_checkpoint_can_carry_its_own_config(tmp_path: Path) -> None:
    released = json.loads((msst.VENDOR / msst.CONFIG_NAME).read_text(encoding="utf-8"))
    tiny = {**released, "model": {**released["model"], "num_stems": 4, "dim": 8}}
    path = tmp_path / "tiny.ckpt"
    torch.save({"state_dict": {"a": torch.zeros(1)}, "hyper_parameters": {"config": tiny}}, path)
    config, _state = msst._read_checkpoint(path, torch)
    assert config == tiny


def test_lightning_weight_prefixes_are_stripped() -> None:
    class Model:
        def state_dict(self) -> dict[str, Any]:
            return {"band_split.to_features.0.weight": torch.zeros(1)}

    plain = {"band_split.to_features.0.weight": torch.zeros(1)}
    assert msst._match_state_dict(Model(), plain) == plain  # already plain
    prefixed = {f"model.{key}": value for key, value in plain.items()}
    assert set(msst._match_state_dict(Model(), prefixed)) == set(plain)
    ema = {f"ema_model.{key}": value for key, value in plain.items()}
    assert set(msst._match_state_dict(Model(), ema)) == set(plain)
    # anything else is handed on unchanged: load_state_dict reports the mismatch
    assert set(msst._match_state_dict(Model(), {"other": torch.zeros(1)})) == {"other"}


def test_the_stand_ins_are_installed_only_when_the_packages_are_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import sys

    from plenio.third_party.msst import _compat

    saved = {
        name: sys.modules.get(name) for name in ("beartype", "beartype.typing", "rotary_embedding_torch")
    }
    try:
        for name in saved:
            sys.modules.pop(name, None)
        monkeypatch.setattr(_compat, "_havable", lambda _name: False)
        used = _compat.ensure_dependencies()
        assert set(used) == {"beartype", "rotary_embedding_torch"}
        from beartype import beartype
        from beartype.typing import Optional

        @beartype
        def guarded(value: Optional[int] = None) -> int:
            return 0 if value is None else value

        assert guarded(3) == 3  # no runtime guarding, but the decorator works
        from rotary_embedding_torch import RotaryEmbedding

        rope = RotaryEmbedding(dim=8)
        x = torch.randn(1, 2, 5, 8)
        rotated = rope.rotate_queries_or_keys(x)
        assert rotated.shape == x.shape
        # the rotation preserves the norm of every vector
        assert torch.allclose(rotated.norm(dim=-1), x.norm(dim=-1), atol=1e-5)
        # and it is the identity at position zero
        assert torch.allclose(rotate_zero(rope), torch.zeros(1, 2, 1, 8), atol=1e-6)
    finally:
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module


def rotate_zero(rope: Any) -> Any:
    return rope.rotate_queries_or_keys(torch.zeros(1, 2, 1, 8)) - torch.zeros(1, 2, 1, 8)


def test_the_adapter_does_not_import_torch_at_module_level() -> None:
    import subprocess
    import sys as system

    code = (
        "import sys\n"
        "import plenio.comfy.audio_models as m\n"
        "assert [a.name for a in m.adapters('separation')] == ['BS-RoFormer 4-stem']\n"
        "assert 'torch' not in sys.modules\n"
    )
    result = subprocess.run(
        [system.executable, "-c", code],
        capture_output=True,
        text=True,
        cwd=str(Path(__file__).resolve().parents[2]),
    )
    assert result.returncode == 0, result.stderr
