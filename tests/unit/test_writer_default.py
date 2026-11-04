"""The default writer since 1.5.1: Gemma 4 12B as a GGUF, the file chosen by the graphics card - one already on
the machine first (any source, its name first), else the pinned download for the card (``plenio.core.llm.gemma``);
and what a cut-off LLM answer says (GitHub issue #26: which limit stopped it, how much was thinking, and whether a
model thought although thinking was off)."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import replace
from pathlib import Path
from typing import Any

import pytest

from plenio.core import llm
from plenio.core.assets import AssetFile, load_catalogue
from plenio.core.errors import PlenioUserError
from plenio.core.llm import client, gemma
from plenio.core.llm.catalog import Model
from plenio.core.system import RULES, Device, SystemFacts, _asset_rows, _llm_lines

ROOT = Path(__file__).resolve().parents[2]
ASSETS = load_catalogue(ROOT / "resources" / "assets.toml")
GIB = 1024**3


def model(name: str, size_gib: float, source: str = "models/LLM", path: bool = True) -> Model:
    return Model(source, name, path=Path("x") / name if path else None, size=int(size_gib * GIB))


@pytest.mark.parametrize(
    ("name", "is_it"),
    [
        ("gemma-4-12b-it-Q6_K.gguf", True),
        ("lmstudio-community/gemma-4-12B-it-GGUF/gemma-4-12B-it-Q6_K.gguf", True),
        ("gemma-4-12B-it-QAT-Q4_0.gguf", True),
        ("unsloth/gemma-4-12B-it-qat-GGUF/gemma-4-12B-it-qat-UD-Q4_K_XL.gguf", True),
        ("Gemma4-12B-Story-Q5_K_M.gguf", True),
        ("gemma-4-12b-it-BF16-00001-of-00002.gguf", True),
        ("gemma-4-12b-it-BF16-00002-of-00002.gguf", False),  # a later shard
        ("mmproj-gemma-4-12B-it-BF16.gguf", False),  # the vision projector
        ("mtp-gemma-4-12b-it.gguf", False),  # the speculative-decoding head
        ("gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf", False),
        ("gemma-4-E4B-it-Q4_K_M.gguf", False),
        ("gemma-3-12b-it-Q4_K_M.gguf", False),
        ("gemma-4-12b-it.safetensors", False),
    ],
)
def test_a_gemma_4_12b_file_is_known_by_its_name(name: str, is_it: bool) -> None:
    assert gemma.is_gemma_12b(name) is is_it


def test_the_card_decides_the_file() -> None:
    assert (
        gemma.wanted(15.9) == gemma.wanted(15.5) == gemma.wanted(23.6) == gemma.LARGE
    )  # a card sold as 16 GB on
    assert gemma.wanted(15.4) == gemma.wanted(11.9) == gemma.wanted(7.8) == gemma.SMALL
    assert gemma.wanted(None) == gemma.SMALL  # no GPU
    large, small = ASSETS[gemma.LARGE], ASSETS[gemma.SMALL]
    assert (large.kind, small.kind) == ("llm", "llm")
    assert gemma.file_of(large) == "gemma-4-12b-it-Q6_K.gguf" and large.repo == "unsloth/gemma-4-12b-it-GGUF"
    assert gemma.file_of(small) == "gemma-4-12B-it-qat-UD-Q4_K_XL.gguf"
    assert all(gemma.is_gemma_12b(gemma.file_of(a)) for a in (large, small))
    # pinned like every asset: revision, size and SHA-256; Apache-2.0
    for asset in (large, small):
        assert len(asset.revision) == 40 and asset.files[0].sha256 and asset.licence == "Apache-2.0"
    # both leave the card room for the context: the file is at least HEADROOM_GIB smaller than the smallest VRAM
    # of its row (16 GB: 15.5 GiB; below: 12 GB cards with 11.5 GiB)
    assert large.total_size / GIB <= gemma.LARGE_FROM_GIB - gemma.HEADROOM_GIB
    assert small.total_size / GIB <= 11.5 - gemma.HEADROOM_GIB


def test_a_file_on_the_machine_is_used_before_anything_is_downloaded() -> None:
    q4_0 = model("gemma-4-12B-it-QAT-Q4_0.gguf", 6.5)
    q6 = model("lmstudio-community/gemma-4-12B-it-GGUF/gemma-4-12B-it-Q6_K.gguf", 9.1, "LM Studio files")
    q8 = model("gemma-4-12b-it-Q8_0.gguf", 11.8)
    others = [model("Qwen_Qwen3.5-9B-Q4_K_M.gguf", 5.7), model("mmproj-gemma-4-12B-it-BF16.gguf", 0.9)]
    app = Model("LM Studio", "google/gemma-4-12b", server=None)  # an app's model: no file to serve
    # the file named like the one this card would get comes first, whatever its folder and letter case
    assert gemma.pick([*others, q4_0, q8, q6, app], 15.9, "gemma-4-12b-it-Q6_K.gguf") is q6
    # else the largest that fits the card ...
    assert gemma.pick([*others, q4_0, q8], 15.9, "gemma-4-12b-it-Q6_K.gguf") is q4_0
    assert gemma.pick([q4_0, q6, q8], 23.6, "gemma-4-12b-it-Q6_K.gguf") is q6  # the name still wins
    assert gemma.pick([q4_0, q8], 23.6, "gemma-4-12b-it-Q6_K.gguf") is q8
    # ... else the smallest (llama.cpp keeps in RAM what does not fit)
    assert gemma.pick([q6, q8], 7.8, "gemma-4-12B-it-qat-UD-Q4_K_XL.gguf") is q6
    assert gemma.pick([q6, q8], None, "gemma-4-12B-it-qat-UD-Q4_K_XL.gguf") is q6
    # none at all: nothing to pick - the run downloads the card's file
    assert gemma.pick([*others, app], 15.9, "gemma-4-12b-it-Q6_K.gguf") is None


def test_the_choice_says_what_it_uses_or_what_it_will_download() -> None:
    q6 = model("lmstudio-community/gemma-4-12B-it-GGUF/gemma-4-12B-it-Q6_K.gguf", 9.1, "LM Studio files")
    found = gemma.choose([q6], ASSETS, 15.9)
    assert not found.download and found.model is q6
    assert (
        "LM Studio files · lmstudio-community/gemma-4-12B-it-GGUF/gemma-4-12B-it-Q6_K.gguf"
        in found.describe()
    )
    missing = gemma.choose([], ASSETS, 11.9)
    assert missing.download and missing.asset.id == gemma.SMALL
    assert (
        "gemma-4-12B-it-qat-UD-Q4_K_XL.gguf" in missing.describe()
        and "downloaded once into models/LLM" in missing.describe()
    )
    assert "no GPU" in gemma.choose([], ASSETS, None).describe()


def test_the_writer_entry_routes_to_a_local_llm_and_the_others_stay_as_they_were() -> None:
    auto = llm.route(llm.AUTO)
    assert auto.use_local and auto.auto and not auto.text_encoder
    native = llm.route("gemma4_e4b_it_fp8_scaled.safetensors")
    assert (
        not native.use_local
        and not native.auto
        and native.text_encoder == "gemma4_e4b_it_fp8_scaled.safetensors"
    )
    local = llm.route("models/LLM · gemma-4-12b-it-Q6_K.gguf")
    assert local.use_local and not local.auto
    assert llm.SEPARATOR not in llm.AUTO  # never read as a "<source> · <name>" reference


def test_the_system_check_names_the_writer_for_each_card_and_where_its_file_goes() -> None:
    writers = {rule.label: rule.writer for rule in RULES}
    assert "Q6_K" in writers["16-24 GB"] and "Q6_K" in writers["24 GB and more"]
    assert all("QAT Q4" in writers[label] for label in ("below 8 GB", "8-12 GB", "12-16 GB"))
    lines = _llm_lines(
        {"runtimes": ["llama-server (PATH)"], "models": {"models/LLM": 1}, "writer": "Gemma 4 12B: x"}
    )
    assert lines[-1] == "Default writer (Gemma 4 12B (auto)) on this machine - Gemma 4 12B: x."
    facts = SystemFacts(
        "1.5.1", "0.41.0", "1.57.1", "3.12", "Windows", "2.9", "cuda:0", models_root="F:/models"
    )
    rows = {row["asset"]: row for row in _asset_rows(ASSETS, facts)}
    assert rows[gemma.LARGE]["folder"] == rows[gemma.SMALL]["folder"] == "F:/models/LLM"
    assert rows["qwen3-asr-1.7b-hf"]["folder"].endswith("/asr/qwen3-asr-1.7b-hf")


# --- a cut-off answer -------------------------------------------------------------------------------


def answer(
    content: str = "", finish: str = "length", usage: dict[str, Any] | None = None, **message: Any
) -> dict[str, Any]:
    return {
        "model": "served",
        "choices": [{"finish_reason": finish, "message": {"content": content, **message}}],
        "usage": usage or {"prompt_tokens": 900, "completion_tokens": 6144},
    }


SERVER = llm.Server("llama-server (PATH)", "http://127.0.0.1:9/v1")


@pytest.fixture
def app(monkeypatch: pytest.MonkeyPatch) -> Callable[[dict[str, Any]], None]:
    """The app's answer to the next chat request (no server: the HTTP call is replaced)."""

    def answer_with(reply: dict[str, Any]) -> None:
        monkeypatch.setattr(client, "_http", lambda *args, **kwargs: reply)

    return answer_with


def cut(
    app: Callable[[dict[str, Any]], None], reply: dict[str, Any], settings: llm.Settings
) -> PlenioUserError:
    app(reply)
    with pytest.raises(PlenioUserError) as error:
        llm.chat(SERVER, "m", "x", settings)
    return error.value


def test_a_thinking_model_that_ignores_the_switch_is_named(app: Callable[..., Any]) -> None:
    # the issue's case: max tokens 6144, thinking off - and the answer was only thoughts
    reply = answer(
        "",
        usage={
            "prompt_tokens": 900,
            "completion_tokens": 6144,
            "completion_tokens_details": {"reasoning_tokens": 6144},
        },
        reasoning_content="Let me think about the verse ...",
    )
    error = cut(app, reply, llm.Settings(max_tokens=6144, context=8192, thinking=False))
    text = str(error)
    assert "cut off at the answer's limit (max tokens: 6144)" in text
    assert "6144 of the tokens were thinking" in text
    assert "Thinking was off for this request, yet the model thought" in text
    assert "LLAMA_ARG_REASONING=off" in text and "Raise max tokens" in text
    assert error.details["reasoning_tokens"] == 6144 and error.details["thinking_requested"] is False


def test_inline_thoughts_without_an_answer_and_a_full_context_are_told_apart(app: Callable[..., Any]) -> None:
    only_thoughts = cut(
        app, answer("<think>a long plan"), llm.Settings(max_tokens=6144, context=8192, thinking=True)
    )
    assert "All of it was thinking" in str(only_thoughts)
    assert "Turn thinking off in the node" in str(only_thoughts)
    assert "ignores the switch" not in str(only_thoughts)
    # the prompt and the answer filled the context before max tokens: the context is the limit
    full = cut(
        app,
        answer("Verse one ...", usage={"prompt_tokens": 7000, "completion_tokens": 1190}),
        llm.Settings(max_tokens=16384, context=8192),
    )
    assert "the context (8192 tokens) was full - the prompt took 7000" in str(full)
    assert "Raise the context length" in str(full)
    # no thoughts at all: the plain advice
    plain = cut(app, answer("Verse one ..."), llm.Settings(max_tokens=6144, context=24576))
    assert "max tokens: 6144" in str(plain) and "thinking" not in plain.message.lower()


def test_an_answer_that_ends_is_still_used(app: Callable[..., Any]) -> None:
    app(answer("<think>plan</think>Title: x", finish="stop"))
    result = llm.chat(SERVER, "m", "x", llm.Settings(max_tokens=6144))
    assert (result.text, result.thinking) == ("Title: x", "plan")


# --- where a run's writer goes ------------------------------------------------------------------------


def test_without_llama_cpp_no_file_is_used_and_nothing_is_downloaded() -> None:
    q6 = model("gemma-4-12b-it-Q6_K.gguf", 9.1)
    blocked = gemma.choose([q6], ASSETS, 15.9, runs_files=False)
    assert blocked.blocked and not blocked.download and blocked.model is None
    assert "needs llama.cpp" in blocked.describe() and "winget install llama.cpp" in blocked.describe()
    # a running app's Gemma 4 12B needs no llama.cpp - and is taken before any download
    app_model = Model("Ollama", "gemma4:12b")
    other_app = Model("Ollama", "qwen3:9b")
    served = gemma.choose([q6, other_app, app_model], ASSETS, 15.9, runs_files=False)
    assert served.model is app_model and not served.blocked
    assert gemma.choose([other_app, app_model], ASSETS, 15.9).model is app_model
    # with llama.cpp, a file comes first
    assert gemma.choose([app_model, q6], ASSETS, 15.9).model is q6


def test_the_native_fallback_is_comfyuis_own_gemma_4() -> None:
    assert (
        gemma.native_fallback(["qwen_3_4b.safetensors", "gemma_2_2b_it_elm_fp8_scaled.safetensors"]) is None
    )
    e4b = "gemma4_e4b_it_fp8_scaled.safetensors"
    e2b = "gemma4_e2b_it_bf16.safetensors"
    assert gemma.native_fallback(["qwen_3_4b.safetensors", e2b, e4b]) == e4b
    assert gemma.native_fallback([e2b]) == e2b
    assert (
        gemma.native_fallback([e2b, e4b, "gemma4_12b_int8_convrot.safetensors"])
        == "gemma4_12b_int8_convrot.safetensors"
    )


@pytest.fixture
def machine(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> dict[str, Any]:
    """A machine for ``plenio.comfy.llm.auto_writer``: its models, runtimes, card and text models - no ComfyUI."""
    from plenio.comfy import host, shared
    from plenio.comfy import llm as local

    state: dict[str, Any] = {
        "models": [],
        "runtimes": ["llama-server"],
        "vram": 15.9,
        "text_encoders": [],
        "folder": tmp_path / "LLM",
    }
    monkeypatch.setattr(local, "discovery", lambda config, fresh=False: llm.Discovery(tuple(state["models"])))
    monkeypatch.setattr(local, "runtimes", lambda config: state["runtimes"])
    monkeypatch.setattr(shared, "asset_catalogue", lambda: ASSETS)
    monkeypatch.setattr(host, "active_vram_gib", lambda: state["vram"])
    monkeypatch.setattr(host, "llm_folders", lambda: [state["folder"]])
    monkeypatch.setattr(host, "model_files", lambda folder: state["text_encoders"])
    calls: list[tuple[str, Path]] = []
    monkeypatch.setattr(
        local, "ensure_asset_in", lambda asset, folder, config, **kwargs: calls.append((asset.id, folder))
    )
    state["downloads"] = calls
    return state


def test_a_run_uses_the_file_on_the_machine(machine: dict[str, Any]) -> None:
    from plenio.comfy import llm as local
    from plenio.core.config import PlenioConfig

    machine["models"] = [model("x/gemma-4-12B-it-Q6_K.gguf", 9.1, "LM Studio files")]
    route, choice = local.auto_writer(PlenioConfig())
    assert route.local_model == "LM Studio files · x/gemma-4-12B-it-Q6_K.gguf" and not route.auto
    assert choice.model is not None and machine["downloads"] == []


@pytest.mark.parametrize(("vram", "asset"), [(15.9, gemma.LARGE), (11.9, gemma.SMALL), (None, gemma.SMALL)])
def test_a_run_downloads_the_file_for_the_card_into_models_llm(
    machine: dict[str, Any], vram: float | None, asset: str
) -> None:
    from plenio.comfy import llm as local
    from plenio.core.config import PlenioConfig

    machine["vram"] = vram
    route, choice = local.auto_writer(PlenioConfig())
    assert machine["downloads"] == [(asset, machine["folder"])]
    assert route.local_model == f"models/LLM · {gemma.file_of(ASSETS[asset])}" and choice.download


def test_without_llama_cpp_a_run_writes_with_comfyuis_gemma_or_says_what_to_do(
    machine: dict[str, Any],
) -> None:
    from plenio.comfy import llm as local
    from plenio.core.config import PlenioConfig
    from plenio.core.errors import PlenioModelError

    machine["runtimes"] = []
    machine["models"] = [model("gemma-4-12b-it-Q6_K.gguf", 9.1)]  # on the disk, but nothing can run it
    machine["text_encoders"] = ["gemma4_e4b_it_fp8_scaled.safetensors", "qwen_3_4b.safetensors"]
    route, choice = local.auto_writer(PlenioConfig())
    assert (
        route.text_encoder == "gemma4_e4b_it_fp8_scaled.safetensors"
        and not route.use_local
        and choice.blocked
    )
    assert machine["downloads"] == []
    # no Gemma text model either: the run stops with what to do, nothing was downloaded that could not run
    machine["text_encoders"] = ["qwen_3_4b.safetensors"]
    with pytest.raises(PlenioModelError) as error:
        local.auto_writer(PlenioConfig())
    text = str(error.value)
    assert (
        "runs on llama.cpp" in text
        and "winget install llama.cpp" in text
        and "brew install llama.cpp" in text
    )
    assert gemma.NATIVE_E4B_URL in text and machine["downloads"] == []


def test_offline_the_download_is_refused_with_the_file_to_place(tmp_path: Path) -> None:
    from plenio.core.assets import ensure_asset_in
    from plenio.core.config import PlenioConfig
    from plenio.core.errors import PlenioAssetError

    with pytest.raises(PlenioAssetError) as error:
        ensure_asset_in(ASSETS[gemma.SMALL], tmp_path, PlenioConfig(offline=True))
    assert "offline mode is on" in str(error.value) and "gemma-4-12B-it-qat-UD-Q4_K_XL.gguf" in str(
        error.value
    )
    assert "huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF/resolve/" in str(error.value)
    assert str(tmp_path) in str(error.value)
    # placed there by hand: nothing to do (a small stand-in - the size counts here, the hash after a download)
    small = replace(ASSETS[gemma.SMALL], files=(AssetFile(gemma.file_of(ASSETS[gemma.SMALL]), 5),))
    (tmp_path / gemma.file_of(small)).write_bytes(b"12345")
    assert ensure_asset_in(small, tmp_path, PlenioConfig(offline=True)) == tmp_path


def test_the_system_check_warns_when_the_default_writer_cannot_run() -> None:
    from plenio.core.reports import Status
    from plenio.core.system import check_system

    def facts(**llm_facts: Any) -> SystemFacts:
        return SystemFacts("1.5.1", "0.41.0", "1.57.1", "3.12", "Windows", "2.9", "cuda:0", llm=llm_facts)

    writer = "Gemma 4 12B needs llama.cpp"
    assert check_system(facts(writer=writer, writer_blocked=True)).status is Status.WARNING
    assert any(
        "needs llama.cpp" in m for m in check_system(facts(writer=writer, writer_blocked=True)).messages
    )


# --- a YuE2 file in models/checkpoints ------------------------------------------------------------------


def _safetensors(path: Path, keys: list[str]) -> Path:
    import json
    import struct

    header = json.dumps({key: {"dtype": "U8", "shape": [0], "data_offsets": [0, 0]} for key in keys}).encode()
    path.write_bytes(struct.pack("<Q", len(header)) + header)
    return path


COMFY_FORMAT = [
    "model.diffusion_model.llm2vae.weight",
    "text_encoders.model.layers.0.weight",
    "text_encoders.yue2_tokenizer_json",
    "vae.decoder.weight",
]


def test_a_yue2_file_is_read_for_what_comfyui_can_load(tmp_path: Path) -> None:
    from plenio.core.models import yue2_checkpoint_problem as problem

    # the layout of Comfy-Org's own files and of the finetunes made for ComfyUI (headers read 2026-11-04)
    assert problem(_safetensors(tmp_path / "finetune.safetensors", COMFY_FORMAT)) is None
    transformers = problem(
        _safetensors(tmp_path / "BF16.safetensors", ["lm_head.weight", "model.layers.0.w", "vae2llm.bias"])
    )
    assert transformers is not None and "Transformers layout" in transformers
    partial = problem(_safetensors(tmp_path / "part.safetensors", ["model.diffusion_model.x", "vae.y"]))
    assert partial is not None and "tokenizer" in partial and "music model" not in partial
    (tmp_path / "broken.safetensors").write_bytes(b"\xff" * 40)
    assert problem(tmp_path / "broken.safetensors") == "not a safetensors file"
    (tmp_path / "text.safetensors").write_bytes(b"\x04\0\0\0\0\0\0\0oops")
    assert problem(tmp_path / "text.safetensors") == "not readable as a safetensors file"
    (tmp_path / "empty.safetensors").write_bytes(b"")
    assert problem(tmp_path / "empty.safetensors") is None  # an interrupted download: the inventory says so
    assert problem(tmp_path / "gone.safetensors") == "not readable as a safetensors file"


def test_the_system_check_says_which_yue2_files_load() -> None:
    from plenio.core.models import load_catalogue as load_models
    from plenio.core.reports import Status
    from plenio.core.system import check_system

    catalogue = load_models(ROOT / "resources" / "models.toml")

    def facts(**checkpoints: str) -> SystemFacts:
        return SystemFacts(
            "1.5.1",
            "0.41.0",
            "1.57.1",
            "3.12",
            "Windows",
            "2.9",
            "cuda:0",
            devices=(Device(0, "RTX", "cuda", 16 * GIB, 8 * GIB),),
            packages={"av": "1", "PIL": "1", "scipy": "1"},
            checkpoints=checkpoints,
        )

    good = check_system(
        facts(**{"yue2_3b_int8_convrot.safetensors": "", "finetune.safetensors": ""}), catalogue
    )
    lines = [m for m in good.messages if "YuE2 checkpoint" in m]
    assert lines == [
        "YuE2 checkpoint 'finetune.safetensors': loads as a finetune - choose it under *checkpoint* in the model block."
    ]
    assert good.status is Status.OK
    bad = check_system(facts(**{"BF16.safetensors": "in m-a-p's Transformers layout"}))
    assert bad.status is Status.WARNING
    assert "YuE2 checkpoint 'BF16.safetensors' will not load: in m-a-p's Transformers layout." in bad.messages
