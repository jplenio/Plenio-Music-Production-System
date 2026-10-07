"""Local LLM: one prompt in, one answer out - from a GGUF file or a model of a local LLM app."""

from __future__ import annotations

import logging

from comfy_api.latest import io

from ...core import llm
from ...core.config import PlenioConfig
from ...core.errors import PlenioCancelledError, PlenioError, PlenioUserError
from .. import host
from .. import llm as local

log = logging.getLogger("plenio")
SEED_RANGE = 2**32
"""llama.cpp takes a 32-bit seed; larger seeds (a linked Seed node) are wrapped into it."""


def _config() -> PlenioConfig:
    try:
        return host.load_config()
    except (PlenioError, ImportError, AttributeError) as error:
        log.warning("Plenio Local LLM: using the default settings (%s)", error)
        return PlenioConfig()


def _model_list() -> list[str]:
    try:
        refs = [model.ref for model in local.discovery(_config()).models]
    except Exception as error:  # a broken folder must not take the node definitions down
        log.warning("Plenio Local LLM: listing models failed: %s", error)
        refs = []
    return refs or [llm.CHOOSE]


class PlenioLocalLLM(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioLocalLLM",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Local LLM",
            category="Plenio/Text",
            description=(
                "Answers a prompt with a local language model: a GGUF file from models/LLM (or from LM Studio, "
                "the Hugging Face cache, llama.cpp or GPT4All) run by llama.cpp just for this call, or a model of "
                "a running app (LM Studio, Ollama, llama.cpp, vLLM, Jan, KoboldCpp, ...). Works anywhere a "
                "STRING is needed; in Plenio it replaces Generate Text in Write Song. Press R to refresh the list."
            ),
            inputs=[
                io.String.Input(
                    "prompt",
                    multiline=True,
                    default="",
                    tooltip="The request (connect Compose Writing Prompt, or type).",
                ),
                io.Combo.Input(
                    "model",
                    options=_model_list(),
                    tooltip="'models/LLM · file.gguf' and other '... files' / 'HF cache' entries are GGUF files, "
                    "run by llama.cpp for the call; 'LM Studio · ...', 'Ollama · ...' are models of a running app.",
                ),
                io.Int.Input(
                    "seed",
                    default=0,
                    min=0,
                    max=0xFFFFFFFFFFFFFFFF,
                    control_after_generate=io.ControlAfterGenerate.fixed,
                    tooltip="Same seed, same prompt: the same answer (cached). Change it for a new answer.",
                ),
                io.Int.Input(
                    "max_tokens",
                    default=2048,
                    min=16,
                    max=131072,
                    advanced=True,
                    tooltip="Longest answer in tokens; a cut-off answer stops the run with a message.",
                ),
                io.Float.Input(
                    "temperature",
                    default=0.8,
                    min=0.0,
                    max=2.0,
                    step=0.05,
                    advanced=True,
                    tooltip="0 = always the most likely words; higher = more varied.",
                ),
                io.Boolean.Input(
                    "thinking",
                    default=False,
                    advanced=True,
                    tooltip="Let a reasoning model think first (Qwen, Gemma, DeepSeek ...); the thoughts come out "
                    "separately. Slower; needs more max tokens.",
                ),
                io.Int.Input(
                    "context",
                    default=8192,
                    min=1024,
                    max=262144,
                    step=1024,
                    advanced=True,
                    tooltip="Context length in tokens (prompt + answer) for GGUF files and Ollama. Other apps use "
                    "the length set in the app.",
                ),
                io.Boolean.Input(
                    "keep_loaded",
                    default=False,
                    advanced=True,
                    tooltip="Off: the model's memory is freed after the answer, so ComfyUI's models have the GPU. "
                    "On: the model stays loaded for the next run (faster, needs the memory for both).",
                ),
                io.String.Input(
                    "system_prompt",
                    multiline=True,
                    default="",
                    advanced=True,
                    tooltip="Optional standing instructions sent before the prompt.",
                ),
            ],
            outputs=[
                io.String.Output(display_name="text", tooltip="The answer (thoughts removed)."),
                io.String.Output(display_name="thinking", tooltip="The model's thoughts, if it shared any."),
            ],
        )

    @classmethod
    def validate_inputs(cls, model: str) -> bool | str:
        # A model of another machine or of an app that is not running is not in this machine's list;
        # the run says what to do instead of a bare "value not in list".
        if model == llm.CHOOSE:
            return (
                "Local LLM: choose a model. If the list offers none, put a GGUF file into ComfyUI's models/LLM "
                "folder or start LM Studio, Ollama or another local LLM app, then press R."
            )
        try:
            llm.split_ref(model)
        except PlenioUserError as error:
            return str(error)
        return True

    @classmethod
    def execute(
        cls,
        prompt: str,
        model: str,
        seed: int,
        max_tokens: int = 2048,
        temperature: float = 0.8,
        thinking: bool = False,
        context: int = 8192,
        keep_loaded: bool = False,
        system_prompt: str = "",
    ) -> io.NodeOutput:
        if not prompt.strip():
            raise PlenioUserError(
                "The prompt is empty.", hint="Type a request or connect a text to 'prompt'."
            )
        config = _config()
        target = llm.resolve(model, local.stores(config), local.servers(config))
        settings = llm.Settings(
            max_tokens=max_tokens,
            temperature=temperature,
            seed=seed % SEED_RANGE,
            thinking=thinking,
            system_prompt=system_prompt,
            context=context,
        )
        try:
            result = llm.generate(
                target,
                prompt,
                settings,
                runtimes=local.runtimes(config) if target.path is not None else (),
                keep_loaded=keep_loaded,
                make_room=local.make_room,
                is_cancelled=host.is_interrupted,
            )
        except PlenioCancelledError:
            host.raise_if_interrupted()
            raise
        answer = result.answer
        tokens = f", {answer.completion_tokens} tokens" if answer.completion_tokens else ""
        markdown = "\n".join(
            [
                f"**{llm.describe(target)}**",
                f"answered by {result.runtime} in {answer.seconds:.1f} s: {len(answer.text.split())} words{tokens}"
                + (" (+ thoughts)" if answer.thinking else ""),
            ]
        )
        return io.NodeOutput(
            answer.text, answer.thinking, ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]}
        )
