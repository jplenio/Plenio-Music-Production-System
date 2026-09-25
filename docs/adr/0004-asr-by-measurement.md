# ADR-0004: Choose the lyrics ASR engine by measurement

- Status: accepted
- Date: 2026-09-25
- Design reference: D-04

## Context

Qwen3-ASR is recommended upstream but pins `transformers==4.57.6` while ComfyUI uses 5.x; faster-whisper installs cleanly.

## Decision

The default ASR engine is decided in Phase 4A by word error rate on real songs. Engines with conflicting dependencies run only in an isolated worker environment created by an explicit setup command.

## Consequences

No dependency conflicts in ComfyUI's environment; the worker protocol (`plenio.core.workers`) is built in Phase 2.
