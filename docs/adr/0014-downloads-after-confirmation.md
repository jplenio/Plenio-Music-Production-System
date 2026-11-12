# ADR-0014: Plenio downloads catalogue model files after the user's confirmation

Date: 2026-11-12. Status: accepted (owner's decisions D-4 and D-5, [2.0 product design](../design/v2-product-design.md) sections 5 and 12).

## Context

Up to 1.6 a template named its model files and ComfyUI's dialog offered the missing ones, one by one, with no idea
of the card they had to run on; the writer's GGUF was the only file Plenio fetched itself. Newcomers stopped at the
first red node, and a 16 GB card was offered files that do not fit it. A program that downloads by itself is also
what a package reviewer looks at first: what it fetches, from where, and who decided.

## Decision

- **The catalogue decides what can be fetched**: `resources/models.toml` lists every component with its variants,
  each pinned to a commit of its repository, with its size and SHA-256 (schema 2). Nothing outside the catalogue is
  downloaded, and a file is put in place only after its size and hash match (`plenio/core/assets/downloads.py`).
- **The plan decides which file**: `plenio/core/modelplan.py` picks per component the variant that runs on the
  user's card, keeping an installed file that is nearly as good; `[models] prefer` and `[models.pins]` change it.
- **The user decides when**: Plenio Setup shows the plan - each file, why, where it goes, its licence, the total
  size and whether it fits on its drive - and fetches nothing before *Download all*. `[models] downloads` is
  `"ask"` by default (a run that lacks a file names it and opens Setup), `"auto"` lets a run fetch what it lacks,
  `"off"` never fetches.
- **Hosts**: the files' own Hugging Face repositories, or the mirror the user set in `HF_ENDPOINT`; a token is sent
  to huggingface.co only. A model whose makers ask for an agreement is shown with the steps to take; Plenio never
  accepts an agreement for the user.
- The routes that start, pause or cancel a download answer this computer only (`local`).

## Consequences

- A newcomer gets from an empty models folder to a first song in one place, and every file they get runs on their
  card.
- Every download is a file the catalogue names, by a hash that a weekly check (`tools/catalogue_check.py --check`)
  holds to its host; a changed file on a host is a failed check, not a different download.
- A file the catalogue does not know (a finetune, an own model) is used where it lies and never fetched; pins name it.
- The download code is part of the package and of every security review since 1.5.1; this decision adds no new
  kind of network access, only more files of the same kind.
