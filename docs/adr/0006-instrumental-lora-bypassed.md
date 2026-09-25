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
