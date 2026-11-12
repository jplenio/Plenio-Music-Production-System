"""The documentation against the code (phase D3)."""

from __future__ import annotations

import doc_check


def test_links_variables_config_and_routes_hold() -> None:
    assert doc_check.main() == 0


def test_a_broken_link_and_code_are_told_apart() -> None:
    text = "see [a](missing.md) and `[b](not-a-link.md)`\n```\n[c](also-not.md)\n```\n"
    kept = doc_check.outside_code(text)
    assert "missing.md" in kept and "not-a-link.md" not in kept and "also-not.md" not in kept


def test_the_variables_plenio_reads_are_found() -> None:
    read = doc_check.read_variables()
    assert {"PLENIO_OFFLINE", "PLENIO_API_REMOTE", "PLENIO_ADDONS", "HF_ENDPOINT"} <= read
    assert "PLENIO_BRIEF" not in read  # a type name, not a variable
