# ADR-0003: Native TextGenerate instead of llama.cpp

- Status: accepted
- Date: 2026-09-25
- Design reference: D-03

## Context

The legacy toolkit ran a llama.cpp GGUF model next to ComfyUI, which required reaching into ComfyUI's memory management.

## Decision

Lyrics and style drafts are written by ComfyUI's native `TextGenerate` node with ComfyUI-format text models (Gemma 4, Qwen 3.5). Remote or other LLMs replace that one node in the *Write Song* blueprint.

## Consequences

ComfyUI owns all GPU memory; no co-residency hacks. Draft quality versus the legacy GGUF models is checked in Phase 3 (AS-01).

## Amendment (2026-10-07)

[ADR-0010](0010-local-llm.md): GGUF files and the models of local apps through the **Local LLM** node. Files run in a llama.cpp server process of their own (started for the call, memory requested from ComfyUI first, freed when it ends), not inside ComfyUI's process; the templates keep native `TextGenerate`.
