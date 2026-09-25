"""Display of durations."""

from __future__ import annotations


def clock(seconds: float) -> str:
    """``m:ss`` of ``seconds``, rounded to whole seconds (119.6 s is ``2:00``, not ``1:60``)."""
    total = max(0, int(round(seconds)))
    return f"{total // 60}:{total % 60:02d}"
