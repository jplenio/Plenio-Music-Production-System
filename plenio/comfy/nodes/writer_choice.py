"""Writer Choice: one list for ComfyUI's own text models and the local LLMs, routed inside Write Song."""

from __future__ import annotations

from comfy_api.latest import io

from ...core import llm
from ...core.errors import PlenioModelError, PlenioUserError
from .. import host
from .. import llm as local


def _writer_list() -> list[str]:
    try:
        refs = local.writers(local.load_config())
    except Exception as error:  # a broken folder must not take the node definitions down
        local.log.warning("Plenio Writer Choice: listing models failed: %s", error)
        refs = []
    return refs or [llm.CHOOSE]


class PlenioWriterChoice(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioWriterChoice",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Writer Choice",
            category="Plenio/Writing",
            description=(
                "One list for the writing model: ComfyUI's own text models (bare file names from "
                "models/text_encoders, written by the native Generate Text) and every Local LLM model (GGUF "
                "files, LM Studio, Ollama, ...). Inside "
                "Write Song it hands the choice to the right branch; a switch runs only that one, so the other "
                "model is never loaded. Press R to refresh the list."
            ),
            inputs=[
                io.Combo.Input(
                    "model",
                    options=_writer_list(),
                    tooltip="A bare file name (gemma4_e4b_it_fp8_scaled.safetensors): a text model in "
                    "models/text_encoders, written by ComfyUI's Generate Text. 'models/LLM · ...gguf', "
                    "'... files · ...', 'HF cache · ...': a GGUF run by llama.cpp for the draft. "
                    "'LM Studio · ...', 'Ollama · ...': a model of a running app.",
                ),
            ],
            outputs=[
                io.AnyType.Output(
                    display_name="text_encoder",
                    tooltip="The text model's file for CLIPLoader (empty for a Local LLM model).",
                ),
                io.AnyType.Output(
                    display_name="local_model",
                    tooltip="The Local LLM model (empty for a ComfyUI text model).",
                ),
                io.Boolean.Output(
                    display_name="use_local",
                    tooltip="True for a Local LLM model: the switch after the two branches takes its answer.",
                ),
                io.AnyType.Output(
                    display_name="model",
                    tooltip="The chosen entry as listed: link it to another writer (Write Song, Arrange) so that "
                    "every writing step uses the same model.",
                ),
            ],
        )

    @classmethod
    def validate_inputs(cls, model: str | None = None) -> bool | str:
        # A model of another machine is reported when the run starts, with what to do (not "not in list").
        if model is None:
            return True
        if model == llm.CHOOSE:
            return (
                "Write Song: choose a writer model. If the list offers none, download the template's writer "
                "(ComfyUI offers it when the template opens), put a GGUF into models/LLM or start a local LLM app, "
                "then press R."
            )
        try:
            llm.route(model)
        except PlenioUserError as error:
            return str(error)
        return True

    @classmethod
    def execute(cls, model: str) -> io.NodeOutput:
        route = llm.route(model)
        if route.use_local:
            markdown = f"Writer: **{model}** - Local LLM"
        else:
            if host.locate_model("text_encoders", route.text_encoder) is None:
                raise PlenioModelError(
                    f"The writer model {route.text_encoder} is not in models/text_encoders.",
                    hint="Download it with ComfyUI's missing-model dialog (it opens with the template), or choose "
                    "another writer model.",
                )
            markdown = f"Writer: **{route.text_encoder}** - ComfyUI's Generate Text (models/text_encoders)"
        return io.NodeOutput(
            route.text_encoder,
            route.local_model,
            route.use_local,
            model,
            ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]},
        )
