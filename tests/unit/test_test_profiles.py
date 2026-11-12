"""The property tests run by profile (PD 10.1): 25 examples on a push, 300 weekly; no test fixes its own number."""

from __future__ import annotations

import re
from pathlib import Path

from hypothesis import settings

TESTS = Path(__file__).resolve().parents[1]


def test_the_push_profile_is_loaded_and_the_weekly_one_is_registered() -> None:
    assert settings.get_profile("push").max_examples == 25
    assert settings.get_profile("weekly").max_examples == 300
    assert settings.default.max_examples in (25, 300)


def test_no_property_test_sets_its_own_number_of_examples() -> None:
    fixed = [
        f"{path.relative_to(TESTS)}:{n}"
        for path in TESTS.rglob("*.py")
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1)
        if re.search(r"max_examples\s*=\s*\d", line) and path.name not in ("conftest.py", Path(__file__).name)
    ]
    assert fixed == []
