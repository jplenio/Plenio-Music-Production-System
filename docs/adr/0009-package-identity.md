# ADR-0009: Package identity

- Status: accepted
- Date: 2026-09-25
- Design reference: D-09

## Context

Plenio needs an unambiguous identity next to the legacy toolkit.

## Decision

Registry package `comfyui-plenio-music`, display name *Plenio Music Production System*, publisher `jplenio`, node IDs prefixed `Plenio`, categories `Plenio/...`, routes under `/plenio/`.

## Consequences

No collisions with legacy `MiniMax*`/`Music*` IDs or with ComfyUI core nodes.
