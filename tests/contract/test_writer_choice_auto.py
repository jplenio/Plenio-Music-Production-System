"""Writer Choice on the default writer ``Gemma 4 12B (auto)``: the node hands on what the machine has (a Local LLM
model, or ComfyUI's own Gemma text model without llama.cpp - and says so), validates the entry, and any other entry
stays as it was. Where the file comes from: tests/unit/test_writer_default.py."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

pytestmark = pytest.mark.comfy


@pytest.fixture
def node(comfy_path: Path, monkeypatch: pytest.MonkeyPatch) -> Any:
    from plenio.comfy import host
    from plenio.comfy.nodes import writer_choice

    monkeypatch.setattr(host, "Progress", lambda: SimpleNamespace(update=lambda fraction: None))
    monkeypatch.setattr(host, "is_interrupted", lambda: False)
    return writer_choice


def _outputs(result: Any) -> tuple[Any, ...]:
    return tuple(result.args)


def test_the_entry_is_valid_and_first_in_the_list(node: Any, monkeypatch: pytest.MonkeyPatch) -> None:
    from plenio.core import llm

    assert node.PlenioWriterChoice.validate_inputs(llm.AUTO) is True
    monkeypatch.setattr(node.local, "writers", lambda config: [llm.AUTO, "models/LLM · x.gguf"])
    assert node._writer_list()[0] == llm.AUTO

    def broken(config: Any) -> list[str]:
        raise OSError("no folder")

    monkeypatch.setattr(node.local, "writers", broken)
    assert node._writer_list() == [llm.AUTO]  # a broken folder leaves the default entry


def test_a_gemma_file_found_goes_to_the_local_llm(node: Any, monkeypatch: pytest.MonkeyPatch) -> None:
    from plenio.core import llm

    choice = SimpleNamespace(blocked=False, model=object(), step="file", detail="")
    monkeypatch.setattr(
        node.local,
        "auto_writer",
        lambda config, **kw: (llm.Route(local_model="LM Studio files · a/gemma.gguf"), choice),
    )
    result = node.PlenioWriterChoice.execute(llm.AUTO)
    text_encoder, local_model, use_local, model = _outputs(result)
    assert (text_encoder, local_model, use_local) == ("", "LM Studio files · a/gemma.gguf", True)
    assert model == llm.AUTO  # as listed: the blocks linked to it take the same entry
    summary = result.ui["plenio_summary"][0]
    assert summary["status"] == "ok" and "found on this machine" in summary["markdown"]


def test_without_llama_cpp_comfyuis_gemma_writes_and_the_summary_says_so(
    node: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.core import llm

    choice = SimpleNamespace(
        blocked=True, model=None, step="native", detail="16.0 GB of graphics memory: installed"
    )
    monkeypatch.setattr(
        node.local,
        "auto_writer",
        lambda config, **kw: (llm.Route(text_encoder="gemma4_e4b_it_fp8_scaled.safetensors"), choice),
    )
    result = node.PlenioWriterChoice.execute(llm.AUTO)
    text_encoder, local_model, use_local, _model = _outputs(result)
    assert (text_encoder, local_model, use_local) == ("gemma4_e4b_it_fp8_scaled.safetensors", "", False)
    summary = result.ui["plenio_summary"][0]
    assert summary["status"] == "warning" and "winget install llama.cpp" in summary["markdown"]


def test_a_chosen_local_model_stays_as_it_is(node: Any, monkeypatch: pytest.MonkeyPatch) -> None:
    def unused(config: Any, **kw: Any) -> Any:
        raise AssertionError("only the auto entry is resolved")

    monkeypatch.setattr(node.local, "auto_writer", unused)
    result = node.PlenioWriterChoice.execute("models/LLM · own.gguf")
    assert _outputs(result)[:3] == ("", "models/LLM · own.gguf", True)
