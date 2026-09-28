"""The UniverSR adapter behind Load Audio Model (Phase 11C M5/D9).

Pure parts and plumbing with a fake model; the host suite runs the vendored engine code with a tiny
real checkpoint. No test here needs a GPU or the released weights.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from plenio.comfy import universr
from plenio.core.errors import PlenioModelError
from plenio.third_party.universr import _compat

torch = pytest.importorskip("torch", reason="the adapter needs PyTorch (ComfyUI provides it)")


def test_matches_recognises_the_released_file_names() -> None:
    for name in universr.FILE_NAMES:
        assert universr.matches(name)
    assert universr.matches("sub/universr_audio.bin")
    assert universr.matches("my-universr-checkpoint.safetensors")
    assert not universr.matches("flashsr.safetensors")
    assert not universr.matches("unknown-sr.safetensors")


def test_the_engine_follows_the_refine_contract() -> None:
    engine = universr.UniverSREngine(model=None)
    assert engine.name == "UniverSR"
    assert engine.input_rate == 24000  # the 24 kHz input condition (plan §4.4)
    assert engine.condition_hz == 12000  # ... low-passed at 12 kHz for the model
    assert engine.chunk_seconds == universr.CHUNK_SECONDS and engine.overlap_seconds > 0
    assert universr.CONDITIONS_HZ == (8000, 12000, 16000, 24000)


class FakeModel:
    """A model that returns a known transform, so the plumbing can be checked without weights."""

    def __init__(self) -> None:
        self.calls: list[tuple[int, int, int]] = []

    def enhance(self, audio: Any, *, input_sr: int, ode_steps: int, guidance_scale: float, seed: int) -> Any:
        frames = int(audio.shape[-1])
        self.calls.append((frames, seed, input_sr))
        return torch.full((1, 1, frames * 2), 0.25, dtype=torch.float32)


def test_upsample_runs_every_channel_and_keeps_the_length_contract() -> None:
    model = FakeModel()
    engine = universr.UniverSREngine(model=model, input_rate_hz=24000)
    chunk = np.zeros((2, 2400), dtype=np.float64)  # 0.1 s at 24 kHz
    out = engine.upsample(chunk, seed=11)
    assert out.shape == (2, 4800)  # 0.1 s at 48 kHz
    assert out.dtype == np.float64
    assert np.allclose(out, 0.25)
    # the mono model runs per channel, with the chunk's seed (Refine derives one per chunk)
    assert model.calls == [(2400, 11, 24000), (2400, 11, 24000)] or model.calls == [(2400, 11, 24000)] * 2


def test_upsample_pads_a_short_answer_and_trims_a_long_one() -> None:
    class Short(FakeModel):
        def enhance(self, audio: Any, **_kwargs: Any) -> Any:
            return torch.ones((1, 1, 10), dtype=torch.float32)

    engine = universr.UniverSREngine(model=Short(), input_rate_hz=24000)
    out = engine.upsample(np.zeros((1, 480), dtype=np.float64), seed=0)
    assert out.shape == (1, 960) and np.allclose(out[:, :10], 1.0) and np.allclose(out[:, 10:], 0.0)


def test_a_file_that_is_not_a_checkpoint_is_refused_with_a_hint(tmp_path: Path) -> None:
    broken = tmp_path / "pytorch_model.bin"
    broken.write_text("this is not a checkpoint", encoding="utf-8")
    with pytest.raises(PlenioModelError) as error:
        universr.load(broken)
    assert "could not be read" in error.value.message
    assert "missing-model dialog" in (error.value.hint or "")


def test_a_checkpoint_without_a_config_uses_the_released_architecture(tmp_path: Path) -> None:
    from plenio.third_party.universr.models.unet import ConvNeXtUNetCond

    config = _released_config()
    model = ConvNeXtUNetCond(
        **{
            **config["model"],
            "dims": [16, 32],
            "depths": [1, 1],
            "time_dim": 32,
            "cond_dim": 32,
            "feature_enc_layers": 2,
        }
    )
    path = tmp_path / "pytorch_model.bin"
    torch.save(model.state_dict(), path)
    state, resolved = universr._config_for(path, torch)
    assert isinstance(state, dict)
    assert resolved == config  # the released audio_config.yaml next to the vendored code
    assert resolved["transform"]["n_fft"] == 1024


def test_a_checkpoint_can_carry_its_own_config(tmp_path: Path) -> None:
    config = _released_config()
    path = tmp_path / "tiny.bin"
    torch.save({"state_dict": {"a": torch.zeros(1)}, "config": config}, path)
    state, resolved = universr._config_for(path, torch)
    assert list(state) == ["a"] and resolved == config


def test_a_safetensors_file_is_read_without_pickle(tmp_path: Path) -> None:
    """The names the adapter claims (``universr_audio.safetensors``) are really readable."""
    save_file = pytest.importorskip("safetensors.torch").save_file
    path = tmp_path / "universr_audio.safetensors"
    save_file({"a": torch.zeros(3)}, str(path))
    assert universr.matches(path.name)
    state, resolved = universr._config_for(path, torch)
    assert list(state) == ["a"] and resolved == _released_config()


def _released_config() -> dict[str, Any]:
    yaml = pytest.importorskip("yaml")
    return dict(yaml.safe_load((universr.VENDOR / universr.CONFIG_NAME).read_text(encoding="utf-8")))


# --- the vendored stand-ins ---------------------------------------------------------------------


def test_the_vendored_integrator_matches_the_analytic_solution() -> None:
    import numpy as np

    def func(_t: Any, x: Any) -> Any:
        return -x

    for method, tolerance in (("euler", 0.08), ("midpoint", 0.01), ("rk4", 1e-4)):
        states = _compat.odeint(func=func, y0=torch.ones(1), t=torch.linspace(0, 1, 5), method=method)
        assert states.shape == (5, 1)
        assert float(states[-1]) == pytest.approx(float(np.exp(-1.0)), abs=tolerance), method
    with pytest.raises(ValueError, match="euler, midpoint and rk4"):
        _compat.odeint(func=func, y0=torch.ones(1), t=torch.linspace(0, 1, 3), method="dopri5")


def test_the_stand_ins_are_installed_only_when_the_packages_are_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    saved = {
        name: sys.modules.get(name) for name in ("timm", "timm.models", "timm.models.layers", "torchdiffeq")
    }
    try:
        for name in saved:
            sys.modules.pop(name, None)
        monkeypatch.setattr(_compat, "_havable", lambda _name: False)
        used = _compat.ensure_dependencies()
        assert set(used) == {"timm", "torchdiffeq"}
        import timm.models.layers as layers  # the stand-in, not the real package

        block = layers.DropPath(0.5)
        block.train()
        dropped = block(torch.ones(8, 3))
        # every sample survives (1/keep = 2) or is dropped (0): stochastic depth with the keep scaling
        assert dropped.shape == (8, 3)
        assert set(dropped.reshape(-1).tolist()) <= {0.0, 2.0}
        # trunc_normal_ fills in place with values in [-2, 2] (mean 0, std 1)
        filled = layers.trunc_normal_(torch.zeros(64, 64))
        assert float(filled.abs().max()) <= 2.0
        assert 0.5 < float(filled.std()) < 1.5
        import torchdiffeq

        assert callable(torchdiffeq.odeint)
        # the vendored UNet imports with the stand-ins in place
        from plenio.third_party.universr.models.unet import ConvNeXtUNetCond

        assert ConvNeXtUNetCond is not None
    finally:
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module


def test_the_adapter_does_not_import_torch_at_module_level() -> None:
    """The node registers without torch; only loading a model imports it (plan §12: lazy)."""
    import subprocess
    import sys as system

    code = (
        "import sys, types\n"
        "sys.modules['torch'] = types.ModuleType('torch')\n"  # a poisoned module: any use fails loudly
        "del sys.modules['torch']\n"
        "import plenio.comfy.audio_models as m\n"
        "assert [a.name for a in m.adapters('super-resolution')] == ['UniverSR']\n"
        "assert 'torch' not in sys.modules\n"
    )
    result = subprocess.run(
        [system.executable, "-c", code],
        capture_output=True,
        text=True,
        cwd=str(Path(__file__).resolve().parents[2]),
    )
    assert result.returncode == 0, result.stderr
