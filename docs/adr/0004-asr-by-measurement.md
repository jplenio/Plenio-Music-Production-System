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

## Outcome (Phase 4A/4B, 2026-09-25)

- Phase 4A measured **faster-whisper large-v3** (host Python, worker process): WER 0.8-1.6 % on a produced pop vocal and 7.6-8.6 % on YuE2 takes over the vocal regions; it is the default.
- Phase 4B measured **Qwen3-ASR-1.7B** (`-hf` checkpoints, now `transformers` >= 5.13; run from an isolated `--target` package folder): lower WER on YuE2 takes (3.7-5.1 %), equal on the MiniMax material, 2-3x slower, section placement equal or slightly worse. Not shipped; a candidate engine once a managed isolated environment exists (yue2-cover-design.md §21.3).
