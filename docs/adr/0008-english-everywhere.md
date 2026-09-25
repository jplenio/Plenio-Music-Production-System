# ADR-0008: English everywhere

- Status: accepted
- Date: 2026-09-25
- Design reference: D-08

## Context

ComfyUI's custom-node locale list has no German; the owner wants everything in English.

## Decision

UI texts, tooltips, node help, templates, code, comments and documentation are English. English text lives in the node schemas; `locales/` is used only for translations.

## Consequences

One source of truth for every string (no duplicate English copies in `locales/en`).
