import pytest

from plenio.core.dependencies import OptionalPackage, probe, require
from plenio.core.errors import PlenioDependencyError
from plenio.core.reports import Status
from plenio.core.system import GIB, Device, SystemFacts, check_system, parse_version, to_markdown

MISSING = OptionalPackage(
    "plenio_surely_missing_pkg", "plenio-missing", "Demo feature", "python -m pip install x"
)


def test_probe_reports_missing_and_present_packages() -> None:
    result = probe((MISSING, OptionalPackage("json", "json", "stdlib", "")))
    assert result["plenio_surely_missing_pkg"] is None
    assert result["json"] is not None


def test_require_missing_package_is_actionable() -> None:
    with pytest.raises(PlenioDependencyError) as error:
        require("plenio_surely_missing_pkg", (MISSING,))
    assert "Demo feature" in str(error.value)
    assert "python -m pip install x" in str(error.value)
    assert require("json").dumps({}) == "{}"


def facts(**overrides: object) -> SystemFacts:
    values: dict[str, object] = dict(
        plenio_version="0.1.0",
        comfyui_version="0.37.0",
        frontend_version="1.53.6",
        python_version="3.12.9",
        platform="Windows 11",
        torch_version="2.9.1",
        active_device="cuda:0",
        devices=(
            Device(0, "RTX 5060 Ti", "cuda", 16 * GIB, 15 * GIB),
            Device(1, "RTX 5060 Ti", "cuda", 16 * GIB, 16 * GIB),
        ),
        ram_total_bytes=64 * GIB,
        packages={"av": "18.1.0"},
        config={"offline": False, "auto_download": True},
    )
    values.update(overrides)
    return SystemFacts(**values)  # type: ignore[arg-type]


def test_healthy_system() -> None:
    report = check_system(facts())
    assert report.status is Status.OK
    assert any("int8_convrot" in rule for rule in report.data["recommendations"])
    assert any("Several GPUs" in rule for rule in report.data["recommendations"])
    markdown = to_markdown(report)
    assert "RTX 5060 Ti" in markdown and "### Recommendations" in markdown


def test_warnings_for_old_comfyui_cpu_only_and_missing_packages() -> None:
    report = check_system(
        facts(comfyui_version="0.34.1", devices=(Device(0, "CPU", "cpu"),), packages={"av": None})
    )
    assert report.status is Status.WARNING
    text = " ".join(report.messages)
    assert "older than the supported 0.37.0" in text
    assert "'av' is not installed" in text
    assert "No GPU detected" in report.data["recommendations"][0]


def test_parse_version() -> None:
    assert parse_version("0.37.0") == (0, 37, 0)
    assert parse_version("v1.53") == (1, 53, 0)
    assert parse_version("unknown") is None
