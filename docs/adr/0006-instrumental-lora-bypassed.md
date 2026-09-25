# ADR-0006: Instrumental LoRA as an optional, bypassed block

- Status: accepted
- Date: 2026-09-25
- Design reference: D-06

## Context

An instrumental AR LoRA for YuE2 exists (CC BY-NC 4.0) but its runtime compatibility and benefit are unmeasured.

## Decision

The adapter lives in the *YuE2 Model* blueprint as a `LoraLoader` that is bypassed by default until Phase 4A verifies it.

## Consequences

Bypassed nodes are removed from the prompt by the frontend, so a missing LoRA file does not block validation (verified in Phase 2, AS-06).

## Outcome (Phase 4A/4B, 2026-09-25)

Verified and measured in Phase 4A; the owner's listening confirmed both defaults: **on for instrumental covers** (a lazy switch in the Cover template; no voice in any adapter cover) and **bypassed on the Song path** (the `LoraLoader` in the *YuE2 Model* block stays bypassed; with it, plans became long, "boring, monotonous loops" with unnatural endings). See instrumental-strategy.md §10 and §13.
