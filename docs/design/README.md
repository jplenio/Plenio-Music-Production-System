# Plenio design documents

Engineering source of truth for the Plenio Music Production System. Later phases implement these documents; evidence that contradicts them is recorded here before the implementation deviates.

| Document | Phase | Content |
|---|---|---|
| [current-system-analysis.md](current-system-analysis.md) | 1A | legacy analysis and upstream research |
| [target-architecture.md](target-architecture.md) | 1B | owner decisions, rules, layers, contracts, nodes, subgraphs, UX, resources, dependencies, docs, migration, repository layout, design review, assumptions |
| [migration-map.md](migration-map.md) | 1B | legacy component → problem → new solution → classification |
| [yue2-design.md](yue2-design.md) | 1B | YuE2 engine and the YuE2 Song path |
| [yue2-cover-design.md](yue2-cover-design.md) | 1B, final 4A, **implemented 4B** (§21) | YuE2 Cover path: data flow, lyrics/score precedence, modes, contracts, validation, test matrix |
| [instrumental-strategy.md](instrumental-strategy.md) | 1B, final 4A, **implemented 4B** (§13) | defense-in-depth instrumental strategy per model, adapter verdict, detectors |
| [score-editor-design.md](score-editor-design.md) | 1B, **in progress 5** (§15) | reusable notation/ABC editor |
| [testing-strategy.md](testing-strategy.md) | 1B | verification levels, test layers, matrices, smoke tests |
| [implementation-roadmap.md](implementation-roadmap.md) | 1B | phases 2–10 with scope, tests, completion criteria, effort |
| [CURRENT_STATUS.md](CURRENT_STATUS.md) | checkpoint | **where the project stands now**: phase, done, open, known issues, tests, next action (handoff checkpoint 2026-09-25) |
| `data/legacy-node-inventory.json` | 1A | machine-readable legacy node inventory |

Status: Phase 1 complete; D-01 … D-09 confirmed by the owner on 2026-09-25 (ADR-0001 … ADR-0009 in `docs/adr`). Phase 2 (Foundation) and Phase 3 (YuE2 Core) implemented. Phase 4A (design gate) complete. Phase 4B (YuE2 Cover) implemented on 2026-09-25; where the implementation extends the specification, the design documents record it (yue2-cover-design §21, instrumental-strategy §13). Phase 5 (score editor) is in progress; see [CURRENT_STATUS.md](CURRENT_STATUS.md). Spike and study results are recorded in the assumptions register (target-architecture.md §18), yue2-design.md §5.1/§7 and the phase reports in `docs/test-reports/`.
