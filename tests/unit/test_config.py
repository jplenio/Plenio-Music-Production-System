from pathlib import Path

import pytest

from plenio.core.config import PlenioConfig
from plenio.core.errors import PlenioUserError


def test_defaults() -> None:
    config = PlenioConfig.load(env={})
    assert (config.offline, config.auto_download, config.asset_dir) == (False, True, None)
    assert config.sources == {}


def test_config_file_then_environment(tmp_path: Path) -> None:
    file = tmp_path / "config.toml"
    file.write_text(
        'offline = true\nasset_dir = "~/assets"\n[workers]\ntimeout_seconds = 10\nidle_timeout_seconds = 5\n',
        encoding="utf-8",
    )
    config = PlenioConfig.load(env={}, config_file=file)
    assert config.offline is True
    assert config.asset_dir == Path("~/assets").expanduser()
    assert (config.worker_timeout_s, config.worker_idle_timeout_s) == (10.0, 5.0)
    assert config.sources["offline"] == "file"

    config = PlenioConfig.load(env={"PLENIO_OFFLINE": "0", "PLENIO_WORKER_TIMEOUT": "99"}, config_file=file)
    assert config.offline is False
    assert config.worker_timeout_s == 99.0
    assert config.sources["offline"] == "PLENIO_OFFLINE"


def test_missing_config_file_is_fine(tmp_path: Path) -> None:
    assert PlenioConfig.load(env={}, config_file=tmp_path / "absent.toml") == PlenioConfig()


def test_hf_offline_cannot_be_undone_by_plenio(tmp_path: Path) -> None:
    config = PlenioConfig.load(env={"HF_HUB_OFFLINE": "1", "PLENIO_OFFLINE": "0"})
    assert config.offline is True
    assert config.sources["offline"] == "HF_HUB_OFFLINE"


@pytest.mark.parametrize(
    "env",
    [
        {"PLENIO_OFFLINE": "maybe"},
        {"PLENIO_AUTO_DOWNLOAD": "2"},
        {"PLENIO_WORKER_TIMEOUT": "-1"},
        {"PLENIO_WORKER_IDLE_TIMEOUT": "soon"},
    ],
)
def test_invalid_environment_values_are_errors(env: dict[str, str]) -> None:
    with pytest.raises(PlenioUserError) as error:
        PlenioConfig.load(env=env)
    assert next(iter(env)) in str(error.value)


@pytest.mark.parametrize(
    "content",
    ["offlien = true\n", "offline = 'yes'\n", "[workers]\ntimeout = 3\n", "asset_dir = ''\n", "offline = \n"],
)
def test_invalid_config_files_are_errors(tmp_path: Path, content: str) -> None:
    file = tmp_path / "config.toml"
    file.write_text(content, encoding="utf-8")
    with pytest.raises(PlenioUserError) as error:
        PlenioConfig.load(env={}, config_file=file)
    assert str(file) in str(error.value) or "workers" in str(error.value)


# --- the model plan, downloads, the workers' device (2.0) -----------------------------------------------------


def test_the_model_settings_have_defaults_and_come_from_the_file_and_the_environment(tmp_path: Path) -> None:
    from plenio.core.config import PlenioConfig

    default = PlenioConfig.load(env={})
    assert (default.models_prefer, default.model_downloads, default.worker_device) == (
        "balanced",
        "ask",
        "auto",
    )
    assert default.model_pins == {}
    file = tmp_path / "config.toml"
    file.write_text(
        '[models]\nprefer = "small"\ndownloads = "off"\n\n[models.pins]\nyue2 = "my-finetune.safetensors"\n'
        '"flux2-klein" = "auto"\n\n[workers]\ndevice = "cuda:1"\n',
        encoding="utf-8",
    )
    from_file = PlenioConfig.load(env={}, config_file=file)
    assert (from_file.models_prefer, from_file.model_downloads, from_file.worker_device) == (
        "small",
        "off",
        "cuda:1",
    )
    assert from_file.model_pins == {"yue2": "my-finetune.safetensors", "flux2-klein": "auto"}
    assert from_file.sources["models_prefer"] == "file"
    env = {
        "PLENIO_MODELS_PREFER": "Quality",
        "PLENIO_MODEL_DOWNLOADS": "auto",
        "PLENIO_MODEL_PINS": "flux2-klein=flux-2-klein-4b-fp8.safetensors, stems = x.ckpt",
        "PLENIO_WORKER_DEVICE": "cpu",
    }
    both = PlenioConfig.load(env=env, config_file=file)
    assert (both.models_prefer, both.model_downloads, both.worker_device) == ("quality", "auto", "cpu")
    # the variable's pins join the file's; a component named in both takes the variable's
    assert both.model_pins == {
        "yue2": "my-finetune.safetensors",
        "flux2-klein": "flux-2-klein-4b-fp8.safetensors",
        "stems": "x.ckpt",
    }
    assert both.sources["model_pins"] == "PLENIO_MODEL_PINS" and both.summary()["worker_device"] == "cpu"


@pytest.mark.parametrize(
    ("text", "message"),
    [
        ('[models]\nprefer = "cheap"\n', "is not one of balanced, quality, speed, small"),
        ("[models]\ndownloads = true\n", "is not one of ask, auto, off"),
        ('[models]\nfolder = "x"\n', r"unknown \[models\] settings"),
        ('[models.pins]\nyue2 = "sub/file.safetensors"\n', "must map component ids to file names"),
        ("[models.pins]\nyue2 = 3\n", "must map component ids to file names"),
        ('[workers]\ndevice = "gpu1"\n', "is no device"),
    ],
)
def test_wrong_model_settings_in_the_file_are_errors(tmp_path: Path, text: str, message: str) -> None:
    from plenio.core.config import PlenioConfig
    from plenio.core.errors import PlenioUserError

    file = tmp_path / "config.toml"
    file.write_text(text, encoding="utf-8")
    with pytest.raises(PlenioUserError, match=message):
        PlenioConfig.load(env={}, config_file=file)


@pytest.mark.parametrize(
    ("name", "value", "message"),
    [
        ("PLENIO_MODELS_PREFER", "best", "is not one of"),
        ("PLENIO_MODEL_DOWNLOADS", "yes", "is not one of ask, auto, off"),
        ("PLENIO_MODEL_PINS", "yue2", "not a list of component=file pairs"),
        ("PLENIO_MODEL_PINS", "yue2=models/x.safetensors", "file names"),
        ("PLENIO_WORKER_DEVICE", "cuda", "is no device"),
    ],
)
def test_wrong_model_settings_in_the_environment_are_errors(name: str, value: str, message: str) -> None:
    from plenio.core.config import PlenioConfig
    from plenio.core.errors import PlenioUserError

    with pytest.raises(PlenioUserError, match=message):
        PlenioConfig.load(env={name: value})
