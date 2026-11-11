"""The access classes of Plenio's routes in ComfyUI (``core.access``): what a route record accepts. The routes
themselves are walked in ``tests/host/test_route_classes.py`` (they need aiohttp and a ComfyUI)."""

from __future__ import annotations

import pytest

from plenio.core.access import CLASSES, Route


def handler() -> None:
    return None


def test_there_are_four_classes_and_each_says_what_it_means() -> None:
    assert list(CLASSES) == ["local", "compute", "data", "api"]
    assert all(len(meaning) > 40 for meaning in CLASSES.values())


def test_a_route_has_one_of_the_classes() -> None:
    assert Route("GET", "/plenio/presets/{kind}", handler, "data").access == "data"
    for wrong in ("", "public", "Local", "admin"):
        with pytest.raises(ValueError, match="no access class"):
            Route("GET", "/plenio/x", handler, wrong)


def test_a_local_route_says_what_it_refuses_and_what_to_do_instead() -> None:
    with pytest.raises(ValueError, match="says what it is and gives a hint"):
        Route("GET", "/plenio/system", handler, "local")
    with pytest.raises(ValueError, match="says what it is and gives a hint"):
        Route("GET", "/plenio/system", handler, "local", what="The report names folders")
    route = Route(
        "GET", "/plenio/system", handler, "local", what="The report names folders", hint="Run the node."
    )
    assert (route.what, route.hint) == ("The report names folders", "Run the node.")
