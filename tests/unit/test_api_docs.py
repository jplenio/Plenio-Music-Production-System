"""The Song API's reference in docs/api: the OpenAPI copies (v2 in docs/api, v1 frozen in docs/api/v1) and the
field tables are made from the shipped templates by tools/api_docs.py - and current, like the templates themselves."""

from __future__ import annotations

import json
from pathlib import Path

import api_docs
import pytest

ROOT = Path(__file__).resolve().parents[2]
API = ROOT / "docs" / "api"


def test_the_api_reference_in_the_docs_is_current() -> None:
    stale = [
        path.relative_to(ROOT).as_posix()
        for path, text in api_docs.outputs().items()
        if not path.is_file() or path.read_text(encoding="utf-8") != text
    ]
    assert stale == [], f"run tools/api_docs.py: {stale}"


@pytest.mark.parametrize("folder", [API, API / "v1"], ids=["v2", "v1"])
def test_the_guide_names_every_endpoint_of_the_api(folder: Path) -> None:
    guide = (folder / "README.md").read_text(encoding="utf-8")
    document = json.loads((folder / "openapi.json").read_text(encoding="utf-8"))
    for path, operations in document["paths"].items():
        for method in operations:
            shown = path.rstrip("/") or "/"
            assert f"`{method.upper()} {shown}" in guide, f"{method.upper()} {path}"
    # the examples are there and use the calls the guide describes
    for example in ("make_song.py", "make_song.mjs", "make_song.sh"):
        text = (folder / "examples" / example).read_text(encoding="utf-8")
        if "from plenio_client import" in text:  # v2's Python examples call the client
            text = (folder / "examples" / "plenio_client.py").read_text(encoding="utf-8")
        assert "Idempotency-Key" in text and "wait=30" in text, example


def test_v2_documents_every_route_it_serves() -> None:
    """The OpenAPI document of v2 has a path for every route of ``song_api_v2.ROUTES`` (and nothing else)."""
    import re

    source = (ROOT / "plenio" / "comfy" / "song_api_v2.py").read_text(encoding="utf-8")
    served = {
        (method.lower(), re.sub(r"\{(\w+)(:[^}]*)?\}", lambda m: "{id}" if m.group(1).endswith("_id") else
                                "{" + m.group(1) + "}", path) or "/")
        for method, path in re.findall(r'_route\("(\w+)", "([^"]*)"', source)
    }  # fmt: skip
    document = json.loads((API / "openapi.json").read_text(encoding="utf-8"))
    documented = {(method, path) for path, operations in document["paths"].items() for method in operations}
    assert served == documented
    assert document["info"]["version"] == "2.0" and document["servers"][0]["url"].endswith("/plenio/api/v2")
    names = [op["operationId"] for operations in document["paths"].values() for op in operations.values()]
    assert len(names) == len(set(names))
    assert {"JobRequest_yue2_daw", "JobRequest_enhance_master"} <= set(document["components"]["schemas"])
    assert "v1" not in json.dumps(document["components"]["schemas"]["JobRequest_yue2_song"])


def test_the_v1_reference_is_frozen() -> None:
    document = json.loads((API / "v1" / "openapi.json").read_text(encoding="utf-8"))
    assert document["servers"][0]["url"].endswith("/plenio/api/v1")
    assert set(document["components"]["schemas"]) >= {"JobRequest_yue2_song", "JobRequest_yue2_cover"}
    assert "JobRequest_yue2_daw" not in document["components"]["schemas"]
