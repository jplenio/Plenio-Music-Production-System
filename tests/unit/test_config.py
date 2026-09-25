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
