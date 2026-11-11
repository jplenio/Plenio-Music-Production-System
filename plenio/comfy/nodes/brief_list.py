"""Brief List: one line of a list per run, for a field of the brief (``plenio.core.brief_list``)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.brief_list import entries, input_file, pick, read_list
from .. import host


class PlenioBriefList(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioBriefList",
            display_name="Brief List",
            category="Plenio/Song",
            description=(
                "One line of a list per run: connect *text* to a field of the brief (its description, genre ...). "
                "With the batch count beside Run set to the list's length, one press makes the whole list."
            ),
            inputs=[
                io.String.Input(
                    "entries",
                    multiline=True,
                    default="",
                    tooltip="One entry per line (a brief's description, a genre ...). Lines starting with # are left out.",
                ),
                io.String.Input(
                    "file",
                    default="",
                    tooltip="Or a text file in ComfyUI's input folder, one entry per line (added after the lines above).",
                ),
                io.Int.Input(
                    "index",
                    default=0,
                    min=0,
                    max=100000,
                    control_after_generate=io.ControlAfterGenerate.increment,
                    tooltip="Which entry this run takes, from 0 (it wraps round); increment: the next one every run.",
                ),
            ],
            outputs=[
                io.AnyType.Output(
                    display_name="text",
                    tooltip="This run's entry - for a text field (the brief's description, genre ...) or a file list "
                    "(Load Audio's file).",
                ),
                io.Int.Output(display_name="position", tooltip="Its place in the list, from 1."),
                io.Int.Output(display_name="count", tooltip="How many entries the list has."),
            ],
        )

    @classmethod
    def execute(cls, entries: str = "", file: str = "", index: int = 0, **_: Any) -> io.NodeOutput:  # noqa: A002
        items = [*_entries(entries), *_entries(read_list(host.input_directory(), file))]
        picked = pick(items, int(index))
        line = f"Entry {picked.position + 1} of {picked.count}: {picked.text[:120]}"
        return io.NodeOutput(
            picked.text,
            picked.position + 1,
            picked.count,
            ui={"plenio_summary": [{"status": "ok", "markdown": line}]},
        )


def _entries(text: str) -> list[str]:
    return entries(text)


class PlenioLoadAudioByName(io.ComfyNode):
    """ComfyUI's Load Audio takes its file from a list it shows; this one takes the name as text - from Brief List,
    so that a batch of runs works through a folder's files."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioLoadAudioByName",
            display_name="Load Audio by Name",
            category="Plenio/Audio",
            description=(
                "Loads an audio file of ComfyUI's input folder by its name - connect Brief List's text to work "
                "through a list of files, one per run."
            ),
            inputs=[
                io.String.Input(
                    "file",
                    default="",
                    tooltip="The file's name in ComfyUI's input folder (or a path inside it).",
                )
            ],
            outputs=[io.Audio.Output(display_name="audio", tooltip="The file's audio.")],
        )

    @classmethod
    def execute(cls, file: str = "", **_: Any) -> io.NodeOutput:
        path = input_file(host.input_directory(), file)
        return io.NodeOutput(
            host.load_input_audio(path),
            ui={"plenio_summary": [{"status": "ok", "markdown": f"Loaded **{path.name}**"}]},
        )
