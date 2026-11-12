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


def test_every_finding_has_its_row_in_troubleshooting() -> None:
    assert doc_check.finding_problems() == []
    source = (doc_check.PROJECT / "plenio" / "core" / "system.py").read_text(encoding="utf-8")
    assert len(set(__import__("re").findall(r"Finding\(\s*\"([a-z]+\.[a-z_]+)\"", source))) >= 10
