"""Writer Choice: one list for ComfyUI's own text models and the local LLMs, routed inside Write Song.

The list's first entry, ``Gemma 4 12B (auto)``, is the templates' default since 1.5.1: when a run uses it, the
node takes the Gemma 4 12B GGUF this machine has, or downloads the one for its graphics card once into
models/LLM (``plenio.comfy.llm.auto_writer``) - and hands it on as a Local LLM model. Without llama.cpp it hands
on ComfyUI's own Gemma text model when one is installed, and says so.
"""

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
        refs = [llm.AUTO]
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
                "One list for the writing model: Gemma 4 12B (auto, the default: the GGUF on this machine, else the "
                "one for its graphics card, downloaded once), ComfyUI's own text models (bare file names, written "
                "by Generate Text) and every Local LLM model (GGUF files, LM Studio, Ollama, ...). Inside Write Song "
                "a switch runs only the chosen one; the other model is never loaded. Press R to refresh the list."
            ),
            inputs=[
                io.Combo.Input(
                    "model",
                    options=_writer_list(),
                    tooltip="Gemma 4 12B (auto): the one on this machine, else downloaded for its card. A bare file "
                    "name: a text model for ComfyUI's Generate Text. '… · …': a GGUF file ('models/LLM', 'HF cache' "
                    "...) or a running app's model.",
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
        status = "ok"
        if route.auto:
            progress = host.Progress()
            route, choice = local.auto_writer(
                local.load_config(),
                progress=lambda done, total, _message: progress.update(done / max(total, 1)),
                is_cancelled=host.is_interrupted,
            )
            markdown = local.writer_summary(route, choice)
            # ComfyUI's own E4B/E2B writes where the 12B cannot: said, so that llama.cpp or the 12B can be added
            if choice.step == "native" and llm.gemma.NATIVE_12B not in route.text_encoder:
                status = "warning"
        elif route.use_local:
            markdown = f"Writer: **{model}** - Local LLM"
        else:
            if host.locate_model("text_encoders", route.text_encoder) is None:
                raise PlenioModelError(
                    f"The writer model {route.text_encoder} is not in models/text_encoders.",
                    hint=f"Download it (Gemma 4 E4B: {llm.gemma.NATIVE_E4B_URL}) into models/text_encoders, or choose "
                    f"another writer model - {llm.AUTO} is the default.",
                )
            markdown = f"Writer: **{route.text_encoder}** - ComfyUI's Generate Text (models/text_encoders)"
        return io.NodeOutput(
            route.text_encoder,
            route.local_model,
            route.use_local,
            model,
            ui={"plenio_summary": [{"status": status, "markdown": markdown}]},
        )
