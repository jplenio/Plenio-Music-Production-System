# Usability review of the templates (Phase 8, reviewed again before 0.3.0 - §5)

| | |
|---|---|
| Date | 2026-09-25; §5: 2026-09-29 |
| Scope | the five shipped templates (`example_workflows/`), their blueprints and App configurations |
| Method | checklist below against the generated templates (visible controls per node, from the template JSON), the automated checks (`tools/workflow_validation.py`, `tests/workflows`, `tools/browser_check.mjs`) and screenshots of every template and App view in the ComfyUI frontend 1.52.7 |
| Not covered | a session with a new user; keyboard-only use and the light theme; the owner's frontend 1.53.6 (open, see §4) |

Completion criterion (roadmap Phase 8): *a new user can choose the music model, make a song/cover, inspect and edit lyrics and score, and export - without seeing irrelevant controls; every parameter has one visible owner.*

## 1. Checklist

| # | Check | Result | Evidence |
|---|---|---|---|
| U1 | The first decision is the music model | pass | template names `<n> · <model> · <path>`; one template per model and path (D-01); thumbnails name model and licence |
| U2 | The path reads left to right in numbered groups | pass | groups `1 · ...` to `5/6/7 · FINISH`; validator: every node inside a group |
| U3 | One explanation per template, visible when it opens | pass (after fix F1) | validator: exactly one *About this template* note; the initial view shows it |
| U4 | Optional blocks are off and say so | pass | validator: every bypassed node's title says *(optional)*; grey groups; tests: Cover Art bypassed, no FLUX nodes in the default prompt |
| U5 | Optional blocks can be switched on without rewiring | pass | browser check: all optional blocks on -> the server validates; Cover Art on -> Export gets the cover |
| U6 | Model files are out of the way but reachable | pass | the MUSIC MODEL block is collapsed below the main row; its file choices are promoted on the block |
| U7 | Inspect and edit lyrics and score | pass | Song Sheet(s) in every song template (Phases 3-6) |
| U8 | Every song is finished and exported | pass | Master -> Export in templates 1-3, the unmastered take as `(original).flac`; test: Export's audio comes from Master, original from the render |
| U9 | No irrelevant controls | pass (after fix F4, accepted A1) | control inventory §2 |
| U10 | Every parameter has one visible owner | pass (accepted A1, A2) | ownership table §3 |
| U11 | Save and reload keep everything | pass | browser check: widget values as shipped, identical after reload, identical API prompt, no node renumbering (after fixes F2, F3) |
| U12 | A no-review use without the graph | pass for 0, 1, 3, 4 | App configurations; browser check: controls shown, kept on save; the Cover has none (review stops) |
| U13 | Every Plenio node explains itself | pass | a help page per node (`web/docs/`, 14 nodes); tooltips on every input and output (contract test); blueprint descriptions (validator) |
| U14 | Messages say what to do | pass | errors carry hints (tests of Phases 2-7); [troubleshooting guide](../user/troubleshooting.md) |
| U15 | The machine's readiness is visible before a run | pass | System Check: installed/missing files per template, rule table with this machine's row |

## 2. Control inventory (visible, unlinked widgets)

| Template | Controls a user sees (group) |
|---|---|
| 0 · System Check | detail |
| 1 · YuE2 · Song | Song Brief: template, description, genre, mood, tempo, length, vocals (+ language, voice, theme or melody, lead instrument), key, meter (SONG); writer model, draft seed, thinking (WRITE); review + editor (TEXT, SCORE); plan seed, planning, plan type; Score Tools operation (SCORE); take seed (RENDER); sample rate (Master), folder, naming, formats, tags (FINISH); checkpoint (MUSIC MODEL, collapsed); cover seed, size (COVER ART, optional) |
| 2 · YuE2 · Cover | source file; excerpt start/duration (optional); Cover Brief: template, description, genre, mood, vocals (+ options), harmony, title; review + editor (both sheets); Transcribe Lyrics: engine, *source language (original lyrics: Cover Brief)*, device; writer controls; take seed, takes, Check Vocals tolerance; Master, Export; adapter file and strengths; checkpoint; optional: check sung lyrics, Cover Art |
| 3 · MiniMax · Song | as template 1 without the score; tiled decode (RENDER); model, text encoder, vae (MUSIC MODEL) |
| 4 · Enhance & Master | source file; EQ (+ preset or bands); loudness target, compression, sample rate; Export |

No MiniMax control appears in a YuE2 template and no cover control in a song template (per-path templates, D-01).

## 3. Ownership (who decides what)

| Parameter | Owner | Notes |
|---|---|---|
| intent, vocals, length | Song Brief / Cover Brief | the brief is the request; the sheets hold the final documents |
| a fixed cover title | Cover Brief *title* (request) | the final title is the Song Sheet · Text document (A2) |
| language of the source's singing | Cover Brief for original-lyrics covers, otherwise Transcribe Lyrics' *source language* | new-lyrics covers: the brief's language is that of the new text (AUD-02) |
| writer model, draft seed | Write Song block | |
| title / style (caption) / lyrics / artwork prompt | Song Sheet · Text (MiniMax: Song Sheet) | auto / edited / manual |
| score, planning mode, render ceiling | Song Sheet · Score (YuE2) | |
| take seed | Take seed node | |
| model files | MUSIC MODEL block (collapsed) | Cover: plus the *Instrumental adapter* node (A1) |
| mastering (EQ, loudness, compression, sample rate) | Plenio · Master (Enhance: the EQ and Loudness nodes) | |
| cover picture | Cover Art block (optional) | prompt from the sheet's artwork prompt |
| folder, naming, formats, tags | Export Release | |

## 4. Findings

Fixed in Phase 8:

| # | Finding | Fix |
|---|---|---|
| F1 | Templates opened scrolled so far that the About note and the first group title were hidden (toolbar overlap) | initial view offset shows the note and group titles |
| F2 | The frontend renumbered nodes on load because blueprint bodies and templates shared node ids | each blueprint body has its own id range; the browser check fails on renumbering |
| F3 | The EQ curve and the node summaries (display-only widgets) wrote an extra value into saved workflows | the widgets opt out of serialisation |
| F4 | Cover template: Transcribe Lyrics shows a *language* widget that the linked Cover Brief overrides | labelled; corrected in the Phase 9 audit (AUD-02): the brief overrides it only for original-lyrics covers, the label now reads *source language (original lyrics: Cover Brief)* |
| F5 | The collapsed model block kept a group sized for the expanded node | groups use the collapsed size |

Accepted:

| # | Item | Why |
|---|---|---|
| A1 | The Cover template has two adapter loaders: the visible *Instrumental adapter* (on for instrumental covers) and the optional one inside the collapsed YuE2 Model block (bypassed) | the model block is shared by both YuE2 templates; the inner adapter is hidden, bypassed and documented in the template note and the guide |
| A2 | *title* in the Cover Brief and in Song Sheet · Text | request vs final document, like the brief's other fields |
| A3 | App mode shows only the sung options of *vocals* | a frontend limit (unselected DynamicCombo options are dropped); instrumental options are set in the graph, documented |

Open (owner's machine): the same browser check in frontend 1.53.6 (`tools/browser_check.mjs --channel msedge`); a first-time use of each template following only the About note; keyboard-only use and the light theme.

## 5. Review before 0.3.0 (2026-09-29)

Scope: the six templates of 0.3.0 (with REFINE, STEMS and *5 · YuE2 · DAW*), in the **real frontend 1.53.6** of
ComfyUI 0.37.0 (the isolated `tools/dev_server.py`, headless Chromium through Playwright): screenshots of every
template at 2400 x 1350, before and after a simulated run (a five-line summary on every node that sends one; a run
that stops at a Song Sheet), App mode, measured node boxes, group boxes and summary heights, and the full
`tools/browser_check.mjs`. The owner asked for the holding points and the run's position to be visible (F16) and
for App mode to be current (F17).

| # | Finding | Fix |
|---|---|---|
| F6 | Refine's *seed* had a *control after generate* the frontend adds to every input named `seed`, defaulting to **randomize**: every queue re-ran UniverSR with a new seed (no cache, a different result), against the tooltip's *same seed, same result*; the templates shipped seven widget values, the frontend saved eight | the input declares `control_after_generate=fixed`; the templates ship the value; the browser check's *widget values as shipped* passes again |
| F7 | The *Stems* blueprint used the node ids of *YuE2 Render* (801-803), the *Refine* blueprint those of *YuE2 Plan* (701): the frontend renumbered the Stems nodes when templates 1 and 5 loaded (F2 had fixed exactly this in Phase 8) | ranges 1101+ (Stems) and 1201+ (Refine); `tools/workflow_validation.py` now refuses shared ids between embedded definitions and between blueprint files - offline, in CI, not only in the browser check |
| F8 | The super-resolution loader overlapped the Refine node (15 px) in every template; the REFINE group overlapped COVER ART in templates 1 and 5 | layout fixed; the validator refuses overlapping nodes (title bar included, collapsed = title bar) and overlapping groups |
| F9 | After a run the summaries were squeezed into what was left of a node: one clipped line on Score Tools and the EQ, two on the briefs - whose *description* field shrank to make room | the summary keeps about four lines (`SUMMARY_MIN_HEIGHT`) and asks for its text's height (estimated while the node is off screen, where the DOM reports 0); a node that is too small grows, never shrinks; the templates reserve the room (`SUMMARY_ROOM`), so none of them grows; browser check step 5 measures it |
| F10 | The bypassed Refine block was expanded and large (a purple 360 x 380 node), unlike the collapsed Stems block | collapsed while bypassed, expanded where it is on (MiniMax); the About notes say how to expand it |
| F11 | *2 · YuE2 · Cover* opened with a red **Media input missing** toast: its source shipped a file name no fresh install has | the source starts empty, like *4 · Enhance & Master* |
| F12 | The EQ in a match mode showed an empty grid and *applied proposal (0 band(s))* before the first run - and after a switch from *manual*, the manual bands as if they were the proposal | the panel says the bands are fitted to the audio when the workflow runs; a proposal is shown only for the mode it came from |
| F13 | The About notes did not explain Refine in templates 1, 2 and 5 (MiniMax named it only in the path), the DAW note lacked Cover Art, and no note said that the Stem Mixer is **inside** the Stems block | a Refine paragraph in every note (MiniMax: the preset and how to bypass it), Cover Art in the DAW note, *open the block with the icon at the top right* in the Stems paragraph and guide |
| F14 | The brief panel's three buttons wrapped their labels onto two lines each | one line per button; the row wraps instead |
| F15 | The browser check counted Load Audio's extra widgets wrongly for an empty file and compared API prompts as strings - the frontend's autogrow lists Export's report inputs in another order after a reload (the links and the backend's numeric order are unchanged). It had not run since M6, which let F6 and F7 through | only the file name counts; prompts compare with sorted keys; `docs/dev/testing.md` says to run it after every template, blueprint or widget change |
| F16 | The review stops were visible only in a node's *review* widget and the brief's mode; after a run nothing on the canvas said where it stopped (the sheet's line read *waiting for approval* in grey) or how far it got | run status on the nodes (`frontend/src/extension/runStatus.ts`): **⏸ review stop** on every sheet that will stop, ✓ / ⚠ / ✖ per Plenio node after a run, **⏸ waiting for your approval** / **✓ approved** on the sheets, an amber or red frame where the run stopped or failed (visible zoomed out), a toast; a new run clears the badges; the sheet's line says the same in colour (App mode) |
| F17 | In App mode the brief's *key* and *meter* were labels without fields (*advanced* widgets), although the DAW's empty score follows them; MiniMax's app had no Refine setting although the stage is on there | *key* and *meter* are regular widgets; the song apps show them; MiniMax's app shows Refine's *preset*; a workflow test refuses an advanced widget in any app |
| F18 | The Song Sheet widget kept listening after its node was removed (another workflow loaded): a status refresh then followed a link of a node without a graph and the frontend reported an extension error | the widget unsubscribes in `onRemoved`; the lookup of the brief is guarded; Vitest and browser check step 6 cover it |

Accepted:

| # | Item | Why |
|---|---|---|
| A4 | Export Release shows a report input that is linked from a subgraph (*Transcribe Score* in the Cover template) at the end of its report list after loading | the frontend's autogrow places it; the link, the API prompt's content and the order in the release record (the backend reads the inputs by number) are unaffected |
| A5 | The Stem Mixer is reached by opening the Stems block (a subgraph) | as a subgraph the block stays one collapsed node in five templates; the About notes and the guide say how to open it. Making it plain nodes like REFINE is an option if the owner prefers the mixer on the canvas |

Result: `tools/browser_check.mjs` **78/78** (frontend 1.53.6, with step 6: status), `tools/workflow_validation.py` clean with the new
layout and id checks.
