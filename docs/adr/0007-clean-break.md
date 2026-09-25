# ADR-0007: Clean break from the legacy toolkit

- Status: accepted
- Date: 2026-09-25
- Design reference: D-07

## Context

Legacy nodes have no one-to-one successors.

## Decision

New package identity, new node IDs, no `NodeReplace` mappings for legacy IDs. Content (prompt templates, presets, algorithms, lessons) is migrated deliberately.

## Consequences

Plenio and the legacy toolkit install side by side without ID collisions (verified in Phase 2). Old workflows keep working with the legacy toolkit.
