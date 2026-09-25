# ADR-0005: Vocal separation only for analysis

- Status: accepted
- Date: 2026-09-25
- Design reference: D-05

## Context

Separation can improve ASR and vocal detection, but the owner rejected separating delivered audio.

## Decision

Separation is optional and used only for ASR pre-processing and validation. Delivered audio is never processed by separation unless the user explicitly enables a separate vocal-removal fallback.

## Consequences

The music output stays untouched by default; any processing is visible in the record.
