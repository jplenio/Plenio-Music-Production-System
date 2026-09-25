# Usability review of the templates (Phase 8)

| | |
|---|---|
| Date | 2026-09-25 |
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
| 2 · YuE2 · Cover | source file; excerpt start/duration (optional); Cover Brief: template, description, genre, mood, vocals (+ options), harmony, title; review + editor (both sheets); Transcribe Lyrics: engine, *language (Cover Brief decides)*, device; writer controls; take seed, takes, Check Vocals tolerance; Master, Export; adapter file and strengths; checkpoint; optional: check sung lyrics, Cover Art |
| 3 · MiniMax · Song | as template 1 without the score; tiled decode (RENDER); model, text encoder, vae (MUSIC MODEL) |
| 4 · Enhance & Master | source file; EQ (+ preset or bands); loudness target, compression, sample rate; Export |

No MiniMax control appears in a YuE2 template and no cover control in a song template (per-path templates, D-01).

## 3. Ownership (who decides what)

| Parameter | Owner | Notes |
|---|---|---|
| intent, vocals, length | Song Brief / Cover Brief | the brief is the request; the sheets hold the final documents |
| a fixed cover title | Cover Brief *title* (request) | the final title is the Song Sheet · Text document (A2) |
| lyrics language of a cover | Cover Brief | Transcribe Lyrics' own widget is ignored when the brief is linked; labelled so in the template (F4) |
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
| F4 | Cover template: Transcribe Lyrics shows a *language* widget that the linked Cover Brief overrides | labelled *language (Cover Brief decides)* |
| F5 | The collapsed model block kept a group sized for the expanded node | groups use the collapsed size |

Accepted:

| # | Item | Why |
|---|---|---|
| A1 | The Cover template has two adapter loaders: the visible *Instrumental adapter* (on for instrumental covers) and the optional one inside the collapsed YuE2 Model block (bypassed) | the model block is shared by both YuE2 templates; the inner adapter is hidden, bypassed and documented in the template note and the guide |
| A2 | *title* in the Cover Brief and in Song Sheet · Text | request vs final document, like the brief's other fields |
| A3 | App mode shows only the sung options of *vocals* | a frontend limit (unselected DynamicCombo options are dropped); instrumental options are set in the graph, documented |

Open (owner's machine): the same browser check in frontend 1.53.6 (`tools/browser_check.mjs --channel msedge`); a first-time use of each template following only the About note; keyboard-only use and the light theme.
