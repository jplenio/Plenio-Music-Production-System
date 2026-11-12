"""The Registry watcher (phase R2): every status read, the changes found, no name or address printed."""

from __future__ import annotations

from typing import Any

import registry_status


def fake(pages: dict[str, list[dict[str, Any]]]) -> Any:
    def get(url: str) -> dict[str, Any]:
        status = next(s for s in registry_status.STATUSES if f"statuses={s}" in url)
        return {"versions": pages.get(status, []), "totalPages": 1}

    return get


def test_every_status_is_read_and_a_reason_keeps_its_labels_only() -> None:
    pages = {
        "NodeVersionStatusActive": [{"version": "2.0.0", "status_reason": ""}],
        "NodeVersionStatusFlagged": [
            {
                "version": "1.6.0",
                "status_reason": "policy-v0.8: arbitrary-file-launch (reviewer: someone@example.org)",
            }
        ],
    }
    found = registry_status.fetch(fake(pages))
    assert found == {
        "2.0.0": {"status": "Active", "reasons": []},
        "1.6.0": {"status": "Flagged", "reasons": ["arbitrary-file-launch", "policy-v0.8"]},
    }
    assert "example.org" not in str(found)


def test_only_what_changed_is_said() -> None:
    before = {"1.6.0": {"status": "Pending", "reasons": []}}
    now = {
        "1.6.0": {"status": "Flagged", "reasons": ["arbitrary-file-launch"]},
        "2.0.0": {"status": "Pending", "reasons": []},
    }
    assert registry_status.changes(before, now) == [
        "1.6.0: Pending -> Flagged arbitrary-file-launch",
        "2.0.0: Pending (new)",
    ]
    assert registry_status.changes(now, now) == []
