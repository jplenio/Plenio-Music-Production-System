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
| [score-editor-design.md](score-editor-design.md) | 1B, **implemented 5** (§15) | reusable notation/ABC editor |
| [score-editor-sounds-export.md](score-editor-sounds-export.md) | 0.4.4 | the score editor's notation export (PDF, PNG, SVG, print), synthesized track sounds, presets in ComfyUI's user data, settings in the project file, the YuE2-compatibility guarantee and the octave-slip warning - research, options, decisions (VST: why not) |
| [usability-review.md](usability-review.md) | 8 | checklist, control inventory, parameter ownership and findings of the final templates |
| [../audit/2026-09-25-phase-9-audit.md](../audit/2026-09-25-phase-9-audit.md) | 9 | full codebase audit: method, findings by severity and confidence, fixes, deferred items |
| [../audit/2026-09-25-phase-10-acceptance.md](../audit/2026-09-25-phase-10-acceptance.md) | 10 | final architecture acceptance review: verdict (accepted with conditions), evidence, findings, remaining limitations, extension points |
| [testing-strategy.md](testing-strategy.md) | 1B | verification levels, test layers, matrices, smoke tests |
| [implementation-roadmap.md](implementation-roadmap.md) | 1B | phases 2–10 with scope, tests, completion criteria, effort |
| [next-release-plan.md](next-release-plan.md) | 11A, **11B implemented** (§17) | next release (0.3.0) design: audio refinement / super-resolution, EQ UX, optional stems, manual lyrics, brief template precedence, canonical score engine, YuE2 · DAW; OPUS-CRITICAL tasks (done) and the DEEPSEEK-SUITABLE milestones M1-M7 (§16.2) |
| [deepseek-handoff.md](deepseek-handoff.md) | 11C | handoff to DeepSeek 4.1 Flash: binding rules, what exists, milestone order M1/D3 → M7 with acceptance criteria, checks, pitfalls, stop conditions |
| [CURRENT_STATUS.md](CURRENT_STATUS.md) | checkpoint | **where the project stands now**: phase, done, open, known issues, tests, next action (handoff checkpoint 2026-09-27, Phase 11B) |
| `data/legacy-node-inventory.json` | 1A | machine-readable legacy node inventory |

Status: Phase 1 complete; D-01 … D-09 confirmed by the owner on 2026-09-25 (ADR-0001 … ADR-0009 in `docs/adr`). Phases 2 (Foundation), 3 (YuE2 Core), 4A (design gate), 4B (YuE2 Cover) and 5 (score editor) are done; Phases 6 (MiniMax), 7 (audio production chain) and 8 (main workflows and UX) are implemented, with owner-machine checks open; Phase 9 (audit) is done; Phase 10 (acceptance review) is done - accepted with conditions; Phase 11A (next-release design) and Phase 11B (its critical foundations: canonical score engine, MIDI, precedence contracts, refine and stem interfaces) are done; see [CURRENT_STATUS.md](CURRENT_STATUS.md). Where the implementation extends the specification, the design documents record it (yue2-cover-design §21, instrumental-strategy §13, target-architecture §10.5). Spike and study results are recorded in the assumptions register (target-architecture.md §18), yue2-design.md §5.1/§7 and the phase reports in `docs/test-reports/`.
