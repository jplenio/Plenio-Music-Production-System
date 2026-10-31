# Creativity - one slider from steady to experimental (design, 2026-10-19, 1.0.2)

The owner's request (2026-10-19): a very simple way to make songs more creative - a slider **creativity**
from 0 (monotonous) to 100 (experimental), with today's behaviour as **50**, and 50 for every workflow
saved before the slider existed. Also: a writer prompt that makes the style the writer produces more varied,
and a look at the other points of two outside analyses (ChatGPT, Argon). Stable above all; no listening
series by Plenio's side - the owner listens, if at all.

User guide: [Creativity](../user/concepts/creativity.md).

> **Since 1.5.0 the slider goes to 200** (§7): 100 is the default, 101-200 goes further, moderately. Up to 100
> everything in §1-§6 still holds.

## 1. What is known (research, 2026-10-19)

| Fact | Source |
|---|---|
| YuE2's native nodes default to ABC temperature 0.70, top-p 0.90, top-k 30, repetition penalty 1.005 (window 100) and music temperature 1.00, top-p 0.95, top-k 100, repetition penalty 1.20 (window 50). | ComfyUI `comfy_extras/nodes_yue2.py` (0.37.0 and 0.41.0 alike) [VF] |
| The sampling is the usual one: repetition penalty on the recent window, temperature, top-k, top-p. | `comfy/text_encoders/yue2.py` `distribution()` [VF] |
| Upstream gives no ranges for other values: "defaults are ready to use, while changing sampling or guidance may change quality". | YuE `docs/generation.md` [UP] |
| The YuE2 model card names no sampling values; standard YuE2 selects from two candidates (best-of-8 from eight) - selection, not a sampler setting. | `m-a-p/YuE2-3B` model card [UP] |
| No public study measures quality against ABC or music temperature, top-p, top-k. ChatGPT's ranges (ABC temperature 0.75-0.85 "more creative", 0.9-1.0 experimental, above 1.0 risky; music temperature 1.05-1.10 more spontaneous, 1.15-1.20 experimental) are practical suggestions, as it says itself. | ChatGPT analysis (owner, 2026-10-19) [EA] |
| YuE2's style is a short comma-separated descriptor list; longer style prose was audibly **sung** by YuE2 (legacy diagnostics); Plenio's rules: about 40 words, one line, no song structure. | yue2-design.md §3.1, current-system-analysis.md [UP]/[RE] |
| MiniMax Music 3's caption has three headed parts; its *Arrangement* part already describes how the song develops section by section. | `core.engines.minimax.writing_rules` [VF] |
| Gemma's recommended sampling is temperature 1.0, top-p 0.95, top-k 64; the templates' writer uses 0.8, the arrangement 0.7, the repairs 0.7. | Google's Gemma guidance [UP], `tools/build_graphs.py` [VF] |

## 2. Decisions

| Question | Decision |
|---|---|
| Where is the slider? | On **Song Brief** and **Cover Brief** (the one place where a song's intent is set), as the last widget - a workflow saved before has no value there and takes the default **50**, an older API prompt too (optional input). Also an output, and the tag variable `{creativity}`. |
| What does 50 mean? | **Exactly the behaviour before the slider**: the writer's prompt is unchanged (40-60 adds no rule), every sampling value is the template's, and the brief's fingerprint is the one it had (the creativity counts only away from 50). So a song continued from an older record writes and plans as before. |
| What does it change? | (1) **The writer's rules** by level: *steady* 0-19, *restrained* 20-39, *balanced* 40-60 (nothing), *varied* 61-80, *experimental* 81-100. (2) **The temperature of the writer's first draft** (0.6 - 0.8 - 1.0) and of a creative mode's **arrangement plan** (0.55 - 0.7 - 0.9); the repairs and re-asks keep 0.7, they fix a form. (3) **YuE2's plan** (ABC) and **take** (music tokens) sampling - temperature, top-p, top-k - see §3. |
| What does it not change? | The repetition penalties (music needs its repetitions; a penalty below 1 invites loops), YuE2's CFG, the audio sampler (steps, sampler, scheduler), the genre closeness, the creative mode, the seeds, MiniMax Music 3's own sampling (no evidence for other values; its writing follows the slider). |
| How do the values reach the native nodes? | A small node **Plenio · Creativity** (`PlenioCreativity`) inside the template blocks turns the creativity into the sampling of one stage (writer, arrangement, plan, take) and is linked to the native nodes' fields. *Write Song* and *Arrange* read it from the brief they already get; *YuE2 Plan*, *YuE2 Render* and *YuE2 Takes* have a new input **creativity**, linked from the brief (unlinked: a slider on the block, 50). |
| Older saved workflows? | ~~They keep their blocks~~ (superseded 2026-10-20, owner's report: creativity 100 through the player on another device, a browser tab restored from before 1.0.2 - the plan and take sampling stayed 50's; the owner: the brief's settings must always count). When a workflow opens, its Plenio blocks without a Creativity node become the current ones and the YuE2 blocks' *creativity* is linked from the brief (`core.blocks`, before the frontend configures the graph - visible in the graph, R3; §5). At 50 they give the numbers they had. |
| Shown and filtered in the player (the owner's follow-up) | The library reads the brief's creativity from the record's prompt (a song made before the slider: 50, marked as the default - it was made as 50 makes it now) and the sampling the song was made with: numbers as written in older records, the Creativity nodes' values (from the brief's creativity) in today's; the writer's temperature from the branch of the chosen writer model. *Details* show both, marked *the reference* at 50's values; a single-choice *Creativity* filter row (the five levels) and `creativity:` in the search. |
| A "more varied prompt" (the owner's point) | Engine-aware. YuE2: **not** the long prose style of the analysis (it would be sung and exceeds the budget), but a *more specific* descriptor line of the same length - named instruments and playing styles, a production colour, one or two descriptors of movement and contrast ("dynamic build-ups", "sparse-to-full contrast", "instrumental fills between phrases") and no stock words; *experimental* adds one unexpected but fitting colour. MiniMax: the caption's *Arrangement* part tells a clear arc of contrasts (an intimate start, a build, a full high point, a contrasting bridge or a breakdown before the last chorus, instruments answering the voice); *experimental* allows one surprising turn (a key lift, a change of rhythm feel, an unusual solo). Lyrics: fresher, concrete images, varied line lengths between sections, a hook that stays; *experimental* may add one contrasting section ([Bridge], or [Break] before the last chorus) when the sections are not fixed by a score. Steady: plain words, regular lines, a chorus that repeats word for word, the genre's usual sound. |

## 3. YuE2's sampling by creativity

Anchors at 0, 50 and 100; straight lines between them (`core.creativity.sampling`).

| Stage | 0 (steady) | 25 | **50 (reference)** | 75 | 100 (experimental) |
|---|---|---|---|---|---|
| plan: temperature / top-p / top-k | 0.55 / 0.85 / 20 | 0.625 / 0.875 / 25 | **0.70 / 0.90 / 30** | 0.81 / 0.925 / 40 | 0.92 / 0.95 / 50 |
| take: temperature / top-p / top-k | 0.90 / 0.92 / 60 | 0.95 / 0.935 / 80 | **1.00 / 0.95 / 100** | 1.05 / 0.96 / 125 | 1.10 / 0.97 / 150 |
| writer (first draft): temperature | 0.60 | 0.70 | **0.80** | 0.90 | 1.00 |
| arrangement plan: temperature | 0.55 | 0.625 | **0.70** | 0.80 | 0.90 |

Why these ends: 100 stays below what the analyses call risky (ABC temperature above 1.0, music temperature
above 1.15) and does not open top-p and top-k to their extremes together; the writer reaches Gemma's own
recommended temperature. 0 stays sampling (no greedy decoding, which loops) with a narrower choice. When a
finished score reaches YuE2 (a creative mode, an edited score, the DAW), the plan's sampling no longer
matters - the score is the plan; the take's sampling still does.

## 4. The other points of the analyses

| Point | Verdict |
|---|---|
| Section contrasts, call and response, a signature motif, a breakdown, a key change | Exist as **creative modes** (*varied*, *call and response*, *signature motif*, *breakdown*, *dramatic*, *key change*, ...). The slider does not switch them on: they are a choice of their own, and stay experimental. |
| Edit the score (ABC) on purpose | Exists: the score editor in Song Sheet · Score. |
| Several candidates, the best one chosen automatically before the render | Not now: worth a design of its own (what makes a plan good can partly be read from the ABC - form, range, harmony, repetition). Plenio has a first step for takes (*YuE2 Takes* + *Check Vocals*). |
| Couple the genre closeness to the slider (Argon) | No: it is a slider of its own for the creative modes; one slider must not overwrite another. |
| Repetition penalty by creativity (Argon: 0.995 to 1.015; 1.1 to 1.3) | No: below 1 it rewards repetition and invites loops; both analyses also advise leaving it. |
| Thinking, detail *rich*, a bigger writer model, key and meter in the brief | Stay the user's choices; documented as tips. |
| Another audio sampler or more steps, the instrumental adapter on sung songs | No: Plenio renders with upstream's reference (32 steps); unverified changes are not defaults. |
| CFG above 1.0 | No: changes the conditioning, costs a second pass, no evidence for better variety. |

## 5. Workflows saved before 1.0.2 (2026-10-20)

ComfyUI keeps each block's inner graph in the workflow (`definitions.subgraphs`); updating the package changes
the blueprints in `subgraphs/`, not the copies in saved workflows. A Song Brief is a node of the package, so an
older workflow shows the slider - and its blocks still had fixed numbers. Measured on the owner's songs of
2026-10-20: creativity 100 on the brief, the record's prompt with the plan at 0.7/0.9/30 and the take at
1.0/0.95/100, the blocks without Creativity nodes and inputs (frontend 1.55.17).

| Question | Decision |
|---|---|
| Where? | In the frontend's `beforeConfigureGraph` (a documented extension hook, R11): the workflow's JSON goes to `/plenio/workflow/blocks` only when it has a Plenio block that samples without a Creativity node; the answer replaces the JSON in place, and the frontend configures that. Checked in frontend 1.55.17: an instance takes the replaced definition, and the API prompt has the Creativity nodes linked to the brief. Not a rewrite of the prompt on the server: the graph would show other numbers than the run uses (R3, R6). |
| What changes? | Each such block becomes the current one, under the id its instances use; the instances get the new inputs (after theirs) and the widget value of the blueprint; the YuE2 blocks' *creativity* is linked from the single brief's *creativity* output (a brief saved before it had one gets the outputs the templates' brief has). A toast names the blocks. |
| What is kept? | A block whose inputs are not the start of the current one's, whose outputs differ, or whose nodes behind the sampling differ from the current block's (a value set by hand inside it, or another layout of a native node) - named in a warning; its numbers stay fixed. Without a single brief the YuE2 blocks keep their own slider (50), also named. |
| 50 | The blocks are only replaced where their sampling nodes equal the current block's, whose Creativity nodes give exactly those numbers at 50 - so an older workflow at 50 runs as before. |
| Shown in the player | `sampling_facts` marks a stage `fixed` when its numbers were written in the workflow; away from 50 the song's page says *fixed in the workflow, not from the creativity* instead of *the reference*. |

## 6. Tests

`tests/unit/test_creativity.py`: 50 gives the reference values exactly; the values rise with the slider and stay
within their ends; levels and clamping; the writer adds nothing at 40-60, its YuE2 rules keep the style's
rules (no section words, no vocal words for an instrumental), lyrics on a melody keep their syllable counts;
the brief's fingerprint at 50 is the one of before. `tests/unit/test_blocks.py`: the 1.0.1 song (as frontend
1.55.17 saved it) and cover template get the current blocks and the brief's creativity, a block changed inside
is kept, nothing more to do afterwards. `tests/workflows`: the templates link the brief's
creativity to every YuE2 block and the blocks' Creativity nodes to the native fields; the App mode shows the
slider.

## 7. 1.5.0: up to 200, and 100 the default (2026-10-31)

The owner's request: 1.4's setting 100 gave the best songs; it should be the default, and there should be room above
it toward experimental - not too far. A first version moved the scale (1.4's 100 at 50); the owner chose instead to
keep every value as it was and extend the slider to 200: "100% behält genau die Einstellungen, die der
Kreativitätswert schon hatte ... 100% ist der neue Default".

| Question | Decision |
|---|---|
| The scale | 0-100 exactly as in 1.0.2-1.4 (values, levels, writer rules, sampling); 101-200 new. The default is 100 (new workflows, the templates, a workflow saved before the slider, an API request without the field). Levels: *steady* 0-19, *restrained* 20-39, *balanced* 40-60, *varied* 61-80, *experimental* 81-150, *adventurous* 151-200. |
| Above 100 | 101-150 keeps the experimental writer rules and samples more freely. *adventurous* asks for a fresh blend with a clear touch of another genre, a signature instrument or sound, and a surprising perspective in the lyrics (an object that speaks, a letter, a dialogue, a story told from its end) - the chorus hook stays singable; the YuE2 style gets two unexpected colours instead of one, the MiniMax caption two surprising turns. The sampling at 200: writer 1.1, arrangement 1.0, plan 1.00 / 0.96 / 64, take 1.15 / 0.98 / 200. |
| Why so moderate | There is no official guidance for YuE2's sampling beyond its defaults (ABC 0.7 / 0.9 / 30 with repetition penalty 1.005, music 1.0 / 0.95 / 100 with 1.2). Community reports (wrapper nodes' option ranges, the YuE issue tracker, the YuE demo app) agree that a plan temperature above 1.0 makes the ABC lose its form and a music temperature above about 1.15-1.2 its coherence, that a higher temperature works better with a narrower top-k, and that a lower repetition penalty buys variety at the cost of loops. So 200 stops at those edges, widens top-p and top-k a little and leaves the repetition penalties and the CFG alone. Sources: comfy.icu (SomoraYuE2GenerationOptions), YuE GitHub issue #45, docs.comfy.org (YuE2), the YuE demo `app.py` on Hugging Face. No listening series by Plenio's side; the owner listens. |
| Old songs and workflows | Nothing to convert: a value means what it meant. A 1.4 workflow saved at 50 stays at 50 (set 100 for the new default). The brief's fingerprint still leaves out a creativity of 50, so a brief keeps the fingerprint it had. |
