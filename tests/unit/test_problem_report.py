"""The problem report (phase 4.5): nothing of the user's places or name in the zip."""

import io
import json
import re
import zipfile

from plenio.core.problem_report import clean_text, empty_workflow, report_files, zip_bytes

HOME = "C:\\Users\\Ana Example"
SYSTEM = (
    "## Plenio System Check\n"
    "- Model file 'x.safetensors' is in C:\\Users\\Ana Example\\AI\\models\\audio_encoders, but ...\n"
    "- models folder: D:/Stuff/ComfyUI/models\n"
    "- config: /home/ana/.config/plenio/config.toml\n"
)


def names_in_zip(data: bytes) -> dict[str, str]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        return {name: archive.read(name).decode("utf-8") for name in archive.namelist()}


def test_the_zip_holds_neither_the_user_nor_a_path_longer_than_two_parts() -> None:
    files = report_files(
        system=SYSTEM,
        log=[
            "[INFO] Plenio: loaded from C:\\Users\\Ana Example\\ComfyUI\\custom_nodes\\plenio",
            "other line",
        ],
        error={"message": "File D:\\Stuff\\ComfyUI\\models\\checkpoints\\a.safetensors is broken"},
        workflow={
            "nodes": [{"type": "PlenioSongBrief", "widgets_values": ["my secret song idea", "pop", 3]}]
        },
        home=HOME,
        version="2.0.0",
    )
    text = "\n".join(names_in_zip(zip_bytes(files)).values())
    assert "Ana" not in text and "ana" not in text
    for drive in ("C:\\", "D:\\", "C:/", "D:/", "/home/"):
        assert drive not in text
    assert (
        "…/models/audio_encoders" in text and "…/models/checkpoints" not in text
    )  # the file is the last part
    assert "…/checkpoints/a.safetensors" in text
    deep = re.findall(r"…/[^\s'\"]+", text)
    assert deep and all(part.count("/") <= 2 for part in deep), deep
    assert "other line" not in text  # only the lines that mention Plenio
    assert "secret" not in text


def test_the_workflow_keeps_choices_and_numbers_and_loses_the_words() -> None:
    workflow = {
        "nodes": [
            {
                "widgets_values": [
                    "a long idea for a song",
                    "pop",
                    "yue2_3b.safetensors",
                    70,
                    {"x": "two words"},
                ]
            }
        ],
        "definitions": {
            "subgraphs": [{"nodes": [{"widgets_values": ["Lyrics line one\nline two", "auto"]}]}]
        },
    }
    out = empty_workflow(workflow)
    assert out["nodes"][0]["widgets_values"] == ["", "pop", "yue2_3b.safetensors", 70, {"x": ""}]
    assert out["definitions"]["subgraphs"][0]["nodes"][0]["widgets_values"] == ["", "auto"]
    assert (
        workflow["nodes"][0]["widgets_values"][0] == "a long idea for a song"
    )  # the page's own is untouched
    json.dumps(out)


def test_clean_text_cuts_posix_and_unc_paths() -> None:
    assert clean_text("at /Users/ana/Music/x.flac", ["ana"]) == "at …/Music/x.flac"
    assert clean_text("share \\\\server\\songs\\a\\b.flac") == "share …/a/b.flac"
    assert clean_text("a 1/2 bar and http://127.0.0.1:8188/x") == "a 1/2 bar and http://127.0.0.1:8188/x"
