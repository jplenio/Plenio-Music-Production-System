"""The model plan: which file of each component a machine should use, and why.

``pick`` chooses one variant of a component (``plenio.core.models``) for a graphics card; ``plan`` does it for
every component a template needs and adds up what is missing. Three properties matter more than the ranking:

- **Stable.** The choice follows the card's *total* memory, never what is free at the moment, and does not
  depend on the order the variants are listed in - it does not flip between runs.
- **Explained.** Every pick carries its reason in words; Setup, a node's summary and the API show that sentence.
- **Overridable.** A pinned file wins, whatever it is - a file of the catalogue or a finetune of one's own.

Pure and standard library only: the host passes in the card's memory and what is installed.
"""

from __future__ import annotations

import hashlib
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

from .models import Component, Variant

PREFERENCES = ("balanced", "quality", "speed", "small")
"""``balanced``: the best file that runs on the card, but an installed one that is nearly as good is kept;
``quality``: the best that runs on the card; ``speed``: the fastest; ``small``: the smallest download."""
AUTO = "auto"
"""A component's choice that follows the plan (anything else is a file name: a pin)."""
_KEEP_WITHIN = {"quality": 0, "balanced": 1, "speed": 1, "small": 1}
"""How many quality ranks below the best an installed file may be and still be kept - nobody downloads
gigabytes for one rank."""


@dataclass(frozen=True)
class Pick:
    """The file chosen for one component."""

    component: str
    variant: Variant | None
    """``None``: a pinned file the catalogue does not know (a finetune)."""
    file: str
    installed: bool
    reason: str
    alternatives: tuple[Variant, ...] = ()
    warning: str = ""

    @property
    def download_bytes(self) -> int:
        return 0 if self.installed or self.variant is None else self.variant.bytes


def _card(vram_gib: float | None) -> str:
    return f"{vram_gib:.1f} GB of graphics memory" if vram_gib else "no graphics card"


def _order(prefer: str, variant: Variant) -> tuple[float, ...]:
    # the file name last: two variants that tie in every rank still order the same way everywhere
    if prefer == "speed":
        return (variant.speed, variant.quality, -variant.bytes)
    if prefer == "small":
        return (-variant.bytes, variant.quality, variant.speed)
    return (variant.quality, variant.speed, -variant.bytes)


def _best(prefer: str, pool: Sequence[Variant]) -> Variant:
    return max(sorted(pool, key=lambda v: v.id), key=lambda v: _order(prefer, v))


def is_installed(variant: Variant, installed: Mapping[str, int]) -> bool:
    """The variant's file is there, with the catalogue's size (another size: an interrupted download)."""
    size = installed.get(variant.file)
    return size is not None and (not variant.bytes or size == variant.bytes)


def pick(
    component: Component,
    *,
    vram_gib: float | None,
    installed: Mapping[str, int],
    prefer: str = "balanced",
    pinned: str | None = None,
) -> Pick:
    """The variant of ``component`` for a machine with ``vram_gib`` GiB on the card ComfyUI uses (``None``: no
    card). ``installed`` maps file names to sizes on disk.

    1. A pin wins: the user's file - with a warning when the card is below what it needs.
    2. Variants that run fully on the card are candidates; if none does, those that run at all; if none, the
       one that needs the least (it will be slow, and the reason says so).
    3. Among the candidates the preference orders them.
    4. A candidate that is installed is kept when it is at most one quality rank below the best (``quality``:
       only when it is the best).
    """
    if prefer not in PREFERENCES:
        raise ValueError(f"unknown preference {prefer!r}: one of {', '.join(PREFERENCES)}")
    variants = component.variants
    if pinned and pinned != AUTO:
        known = next((v for v in variants if v.file == pinned), None)
        low = known is not None and vram_gib is not None and vram_gib < known.vram_min_gib
        warning = (
            f"{pinned} needs about {known.vram_min_gib:g} GB of graphics memory; this card has {vram_gib:.1f}"
            if known is not None and low
            else ""
        )
        there = pinned in installed if known is None else is_installed(known, installed)
        return Pick(
            component.id,
            known,
            pinned,
            there,
            "your choice"
            if known is not None
            else "your choice (a file of your own, not in Plenio's catalogue)",
            tuple(v for v in variants if v is not known),
            warning,
        )
    vram = vram_gib or 0.0
    full = [v for v in variants if vram >= v.vram_full_gib]
    runs = [v for v in variants if vram >= v.vram_min_gib]
    pool = (
        full or runs or [min(sorted(variants, key=lambda v: v.id), key=lambda v: (v.vram_min_gib, v.bytes))]
    )
    best = _best(prefer, pool)
    have = [v for v in pool if is_installed(v, installed)]
    kept = False
    if have:
        candidate = _best(prefer, have)
        if candidate is best or candidate.quality >= best.quality - _KEEP_WITHIN[prefer]:
            kept = candidate is not best
            best = candidate
    if best in full:
        where = "runs on the card"
    elif best in runs:
        where = "runs with offloading: slower"
    else:
        where = "too large for this card: very slow"
    reason = f"{_card(vram_gib)}: {where}"
    if is_installed(best, installed):
        reason += ", installed" + (" (kept: nearly as good as the best for this card)" if kept else "")
    warning = ""
    if best not in full and best in runs:
        warning = f"{best.file} runs partly in the computer's memory on this card - expect it to be slower."
    elif best not in runs:
        warning = (
            f"{best.file} needs about {best.vram_min_gib:g} GB of graphics memory; this machine has "
            f"{'none' if not vram_gib else f'{vram_gib:.1f}'} - expect it to be very slow."
        )
    return Pick(
        component.id,
        best,
        best.file,
        is_installed(best, installed),
        reason,
        tuple(v for v in variants if v is not best),
        warning,
    )


@dataclass(frozen=True)
class Plan:
    """The picks for a template: what it needs, what only its optional blocks use, and what is missing."""

    template: str
    needed: tuple[Pick, ...]
    optional: tuple[Pick, ...]

    @property
    def missing(self) -> tuple[Pick, ...]:
        return tuple(p for p in self.needed if not p.installed)

    @property
    def ready(self) -> bool:
        return not self.missing

    @property
    def download_bytes(self) -> int:
        """What the needed files still to fetch weigh - the room the download needs."""
        return sum(p.download_bytes for p in self.missing)

    @property
    def licences(self) -> tuple[str, ...]:
        return tuple(dict.fromkeys(p.variant.licence for p in self.needed if p.variant is not None))

    @property
    def warnings(self) -> tuple[str, ...]:
        return tuple(p.warning for p in (*self.needed, *self.optional) if p.warning)


def plan(
    template: str,
    components: Mapping[str, Component],
    *,
    vram_gib: float | None,
    installed: Mapping[str, int],
    prefer: str = "balanced",
    pins: Mapping[str, str] | None = None,
) -> Plan:
    """The picks for ``template`` (a workflow's title, as the catalogue's components name it). ``pins`` maps
    component ids to file names (``auto`` or absent: the plan chooses)."""
    chosen = dict(pins or {})

    def of(component: Component) -> Pick:
        return pick(
            component, vram_gib=vram_gib, installed=installed, prefer=prefer, pinned=chosen.get(component.id)
        )

    return Plan(
        template,
        tuple(of(c) for c in components.values() if template in c.templates),
        tuple(of(c) for c in components.values() if template in c.optional_templates),
    )


def fingerprint(picks: Sequence[Pick]) -> str:
    """A short hash of what was picked and whether it is there: a node's input that changes when a file is
    installed or the plan changes, so ComfyUI runs the node again."""
    text = "|".join(
        f"{p.component}={p.file}:{int(p.installed)}" for p in sorted(picks, key=lambda p: p.component)
    )
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
