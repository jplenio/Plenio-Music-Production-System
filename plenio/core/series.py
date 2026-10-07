"""A series from one brief ("new song every run"): which song a run works on.

Every run of a series writes a new song (a new *variation* of the brief, which also gives the song its own
draft and plan seeds) - unless a Song Sheet stopped the current song for review. Then the following runs
keep that song until a run lets it through the review (approved, on to the render); the run after that
writes the next song. Without this, a review stop in a series never ends: every run brought a new song,
and every approval was for the previous one.

The state lives in the running server (one instance per process); a restart forgets a held song and the
next run starts a new one.
"""

from __future__ import annotations

import threading
from collections import OrderedDict
from collections.abc import Callable, Mapping
from typing import Any

from .hashing import sha256_json

LIMIT = 64
"""Briefs remembered at most (each is one series; the oldest are forgotten first)."""


def series_key(kind: str, inputs: Mapping[str, Any]) -> str:
    """The identity of a series: the brief node's kind and its inputs (any change starts a new series)."""
    return sha256_json({"kind": kind, "inputs": {name: inputs[name] for name in sorted(inputs)}})


class Series:
    def __init__(self, draw: Callable[[], int], limit: int = LIMIT):
        self._draw = draw
        self._limit = limit
        self._current: OrderedDict[str, int] = OrderedDict()
        self._held: OrderedDict[str, int] = OrderedDict()
        self._lock = threading.Lock()

    def song(self, key: str) -> int:
        """The variation of this run for the series ``key``: the song held for review, else a new one."""
        with self._lock:
            variation = self._held[key] if key in self._held else self._draw()
            self._remember(self._current, key, variation)
            return variation

    def current(self, key: str) -> int:
        """The variation ``song`` chose last for ``key`` (a new one if there is none yet)."""
        with self._lock:
            if key not in self._current:
                self._remember(self._current, key, self._held.get(key, self._draw()))
            return self._current[key]

    def hold(self, key: str, variation: int) -> None:
        """A Song Sheet stopped this song for review: the next runs keep it."""
        with self._lock:
            self._remember(self._held, key, variation)

    def release(self, key: str, variation: int) -> None:
        """A Song Sheet let this song through: the next run writes a new song (unless another sheet of the
        same run holds it again)."""
        with self._lock:
            if self._held.get(key) == variation:
                del self._held[key]

    def is_held(self, key: str) -> bool:
        with self._lock:
            return key in self._held

    def _remember(self, table: OrderedDict[str, int], key: str, variation: int) -> None:
        table[key] = variation
        table.move_to_end(key)
        while len(table) > self._limit:
            table.popitem(last=False)
