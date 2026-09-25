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
    recommendations = report.data["recommendations"]
    assert "row '16-24 GB'" in recommendations[0]  # a 16 GB card reports just under 16 GiB
    assert any("Several GPUs" in rule for rule in recommendations)
    marked = [row["vram"] for row in report.data["rules"] if row["this_machine"]]
    assert marked == ["16-24 GB"]
    markdown = to_markdown(report)
    assert "RTX 5060 Ti" in markdown and "### Recommendations" in markdown
    assert "| **this machine** - 16-24 GB |" in markdown and "### Templates" not in markdown


@pytest.mark.parametrize(
    ("gib", "row"),
    [(6.0, "below 8 GB"), (7.9, "8-12 GB"), (11.9, "12-16 GB"), (15.9, "16-24 GB"), (23.6, "24 GB and more")],
)
def test_rule_rows_follow_the_reported_vram(gib: float, row: str) -> None:
    report = check_system(facts(devices=(Device(0, "GPU", "cuda", int(gib * GIB), None),)))
    assert [r["vram"] for r in report.data["rules"] if r["this_machine"]] == [row]
    assert len(report.data["rules"]) == 5 and all(r["basis"] for r in report.data["rules"])


def test_template_inventory_and_optional_packages() -> None:
    from pathlib import Path

    from plenio.core.models import load_catalogue

    catalogue = load_catalogue(Path(__file__).resolve().parents[2] / "resources" / "models.toml")
    installed = {
        "yue2_3b_int8_convrot.safetensors": 3960938800,
        "gemma4_e4b_it_fp8_scaled.safetensors": 1,
        "minimax_music3_dav.safetensors": 1000,  # interrupted download
    }
    report = check_system(
        facts(
            models=installed,
            packages={"av": "18.1.0", "mutagen": None},
            assets={"faster-whisper-large-v3": "not downloaded (fetched on first use, 3.1 GB)"},
        ),
        catalogue,
    )
    assert report.status is Status.OK  # an optional package or a missing model is no warning
    rows = {row["template"]: row for row in report.data["templates"]}
    assert list(rows) == sorted(rows) and set(rows) == {
        "0 · System Check",
        "1 · YuE2 · Song",
        "2 · YuE2 · Cover",
        "3 · MiniMax · Song",
        "4 · Enhance & Master",
    }
    assert rows["1 · YuE2 · Song"]["ready"] and rows["4 · Enhance & Master"]["ready"]
    assert not rows["3 · MiniMax · Song"]["ready"] and rows["3 · MiniMax · Song"]["missing_size"] == "14.1 GB"
    assert "flux-2-klein-4b.safetensors" in rows["1 · YuE2 · Song"]["optional_missing"]
    status = {row["file"]: row["status"] for row in report.data["models"]}
    assert status["yue2_3b_int8_convrot.safetensors"] == "installed"
    assert status["sheetsage2_bf16.safetensors"] == "missing"
    assert "yue2_3b_bf16.safetensors" not in status  # alternatives appear in the rule table only
    markdown = to_markdown(report)
    assert "| 1 · YuE2 · Song | all installed; optional blocks: 4 not installed |" in markdown
    assert (
        "1 with an unexpected size (an interrupted download?): `minimax_music3_dav.safetensors`" in markdown
    )
    assert "Optional package 'mutagen' is not installed." in markdown
    assert "faster-whisper-large-v3': not downloaded" in markdown
    assert "| `sheetsage2_bf16.safetensors` | audio_encoders | 1.4 GB | CC BY-NC 4.0 | missing |" in markdown


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


def test_a_configuration_error_is_reported_not_fatal() -> None:
    """Audit AUD-06: an invalid config.toml made the System Check itself fail."""
    report = check_system(
        facts(
            config={"offline": False, "auto_download": True, "error": "config.toml: unknown settings ['x']"}
        )
    )
    assert report.status is Status.WARNING
    assert any("Plenio configuration error" in m and "unknown settings" in m for m in report.messages)
