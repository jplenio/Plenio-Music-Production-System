# Plenio 2.0 - marketing, media pipeline and publishing

Companion of [v2-product-design.md](v2-product-design.md) (the product) and [v2-implementation-plan.md](v2-implementation-plan.md) (the work, phases M and R). Written 2026-11-11 against Plenio 1.6.0.

This document decides **what Plenio says about itself**, **which films and texts exist**, **how they are made by script** so that a new version costs a command and not a week, and **how a release and its videos are published** with as few manual steps as the platforms allow.

Evidence labels used below: **[repo]** read in this repository, **[checked 2026-11-11]** fetched from the named service on that day, **[estimate]** not measured.

---

## 1. The message

### 1.1 The problem with today's message

The README opens with one sentence of 43 words that names YuE2, the score editor, the player and the party, followed by "three things that set it apart", then the party, then the DAW plug-in [repo: `README.md` lines 7 and 36-42]. Every part is true and every part is a strength. Together they answer "what can it do?" before the visitor has an answer to "what is it for?".

### 1.2 One line, one promise

> **Type an idea. Get a finished song. On your own PC.**

This is the five-second line: what goes in, what comes out, where it runs. It is the first line of the README, the first frame of every film, the YouTube channel banner and the Registry description.

The brand line of the two existing spots stays and becomes a system:

> **Your idea. Your song.** + one third beat per audience.

| Audience | Third beat | The one proof shown |
|---|---|---|
| everyone (hero film) | **Your PC.** | an idea typed, a mastered song with cover and lyrics playing 90 seconds later, the network cable unplugged |
| party hosts | **Your party.** (exists, spot v3) | a guest's phone: a style, six words, *Generate* - the song plays on the big screen with the guest's name |
| musicians, producers | **Your control.** (exists, spot v2) | one wrong note dragged in the piano roll, the take sung again with exactly that note |
| DAW users | **Your DAW.** (exists, VST3 teaser) | takes landing on REAPER tracks with stems, MIDI and a tempo map |
| ComfyUI creators | **Your workflow.** | the graph left to right, batch count 10, ten finished songs in the output folder |
| developers | **Your code.** | one `curl`, the job followed, the FLAC downloaded - and an assistant asked for a song through MCP |
| video creators | **Your video.** | a song turned into an upright karaoke video for Shorts, encoded faster than it plays |

Each film makes **one** promise and shows **one** proof. Nothing else from the feature list appears in it. The feature list lives in exactly two places: the README table and the full walkthrough film (section 3.3).

### 1.3 Why Plenio is unique (the message house)

Three pillars, in this order everywhere. The order follows what a newcomer needs to believe first.

1. **Finished, not generated.** One brief becomes a release: mastered to -14 LUFS, cover art, timed lyrics, sheet music, tags. Other local tools stop at an audio file.
2. **Nothing is a black box.** The Song Sheet shows what the model receives; the score editor changes every note and chord before it is sung. No other local AI music tool has real notation between the idea and the singing.
3. **Music is for people.** The player turns the songs into a show, and at a party every guest makes a song from their phone.

Underneath all three, as a footer and never as the headline: **free, open source (Apache-2.0), 100 % local, no account**.

### 1.4 Words

| Say | Instead of | Why |
|---|---|---|
| a finished song | a generation, an output | the product is the release |
| on your own PC | local inference | the newcomer's word |
| see and change every note | editable symbolic conditioning | same |
| the party's phones | multi-client guest gateway | same |
| free | (no price claims against named services) | no comparison Plenio cannot prove |

Honesty rules, carried over from the 1.3-1.5 kits and binding for every text and film:

- Every song heard was made with Plenio and the named model; every screen shown is the real program. Drawn or simulated material is labelled on screen.
- Speed claims carry the hardware and the song length they were measured with.
- Creativity is "up to 200", never "200 %".
- The model licences are stated where songs are shown for download: YuE2 is CC BY-NC 4.0, non-commercial.
- Install lines name the Manager only once the Registry lists the version as active; until then `git clone` and `comfy node install`.
- Public texts say what changed and why it is better, never who asked for it.

---

## 2. The package (what is produced for 2.0)

| # | Asset | Length / size | Formats | Source of truth |
|---|---|---|---|---|
| F1 | Hero film *Your idea. Your song. Your PC.* | 45 s | 16:9, 9:16, 1:1 | `films/hero.yaml` |
| F2 | *Your party.* (spot v3 updated to 2.0 screens) | 54 s | 16:9, 9:16 | `films/party.yaml` |
| F3 | *Your control.* (spot v2 updated) | 54 s | 16:9, 9:16 | `films/control.yaml` |
| F4 | *Your workflow.* | 30 s | 16:9, 1:1 | `films/workflow.yaml` |
| F5 | *Your code.* | 30 s | 16:9, 1:1 | `films/code.yaml` |
| F6 | *Your video.* | 20 s | 9:16 | `films/video.yaml` |
| F7 | *Your DAW.* (the VST3 teaser, relinked) | 72 s | 16:9 | Plenio-VST3 repository |
| F8 | **Install in three minutes** | 3:00 | 16:9 | `films/install.yaml` |
| F9 | **Plenio in five minutes**: the one film that explains everything | 5:00 | 16:9 | `films/tour.yaml` |
| F10 | What is new in 2.0 | 40 s | 16:9, 9:16 | `films/whats-new.yaml` |
| T | Tutorials, rebuilt as chapters (section 5) | 60 s - 6 min each | 16:9 | `tutorials/*.yaml` |
| G | README hero loop, bento pictures, pipeline and architecture diagrams | - | WebP, PNG | `stills/*.yaml` |
| P | Posts: release announcement, Reddit r/comfyui, X thread, LinkedIn, Discord, Mastodon; one variant per audience | - | Markdown | `copy/posts/*.md` |
| S | Store texts: Registry description, GitHub *About*, YouTube channel text, release notes intro | - | Markdown | `copy/store.yaml` |
| K | Press kit page: logo, banner, 12 stills, 3 films, fact sheet, licence notes | - | Artifact page or `docs/press/` | `copy/factsheet.yaml` |

F8 is the film that converts interest into installs; it is produced first and re-recorded for every version that changes Plenio Setup. F9 replaces the retired 75-second promo as the answer to "show me everything".

### 2.1 Storyboards

Timings are in bars of the film's music bed (made with Plenio; 124-126 BPM keeps two bars close to 3.85 s, the cut grid of the existing spots).

**F1 - Hero (45 s, 12 scenes of two bars)**

| Bar | Picture | Text on screen | Sound |
|---|---|---|---|
| 1-2 | black; a cursor types into one field | *a night drive through a rainy city* | room tone, key clicks |
| 3-4 | the field becomes the Song Brief; *Run* is pressed | **Type an idea.** | first hi-hats of the song being made |
| 5-8 | four quick real captures: lyrics appear, notes appear, the waveform grows, the cover fades in (each a real run, fast-forwarded, speed badge) | *written · composed · sung · mastered* | the song's intro builds |
| 9-10 | the Plenio Player, full screen, the lyrics lighting up | **Get a finished song.** | the drop |
| 11-14 | the same song as files: FLAC, cover, lyrics, sheet music PDF - then a hand pulls the network cable, the song keeps playing | **On your own PC.** *No cloud. No account. Free.* | chorus |
| 15-18 | three two-bar flashes: a note dragged in the editor · a phone ordering a song · tracks in a DAW | *Change every note.* · *Let your guests join in.* · *Or work in your DAW.* | chorus continues |
| 19-22 | twelve covers flip through twelve genres | *Any genre. Any language.* | fill |
| 23-24 | logo, the line, the install line | **Your idea. Your song. Your PC.** `comfy node install comfyui-plenio-music` | final chord |

**F8 - Install in three minutes** (voice-over, chapters)

| Time | Chapter | Picture |
|---|---|---|
| 0:00 | What you need | a ComfyUI window, a graphics card named with its memory |
| 0:15 | Install | the Manager search, *Install*, restart (real capture) |
| 0:40 | Plenio Setup opens | the assistant's first page with the detected card |
| 1:00 | Choose what you want to make | *Songs* ticked; the download plan with sizes and licences |
| 1:20 | Download | progress, fast-forwarded with a speed badge; a file that needs an accept on Hugging Face shown once, with the three steps |
| 2:00 | Your first song | *Make a test song*: the one-minute run |
| 2:40 | Listen | the player opens on that song |
| 2:55 | Where next | three cards: Song tutorial, Player tutorial, Party tutorial |

**F9 - Plenio in five minutes** follows the pipeline picture of the README, one chapter per stage, each chapter ending on the link to its tutorial: Brief (0:00) · Write (0:35) · Song Sheet (1:05) · Score (1:35) · Render (2:15) · Master (2:45) · Release (3:10) · Player (3:35) · Party (4:10) · API and DAW (4:35) · Install (4:50).

**F4, F5, F6** are single-proof films: one continuous real capture with three text beats (the promise, the proof, the line).

### 2.2 Post templates

One file per channel in `copy/posts/`, each with front matter the publisher reads:

```markdown
---
channel: reddit
subreddit: comfyui
audience: comfyui
film: workflow
when: T+0
manual: true          # Reddit posts are made by hand (section 7.4)
---
**Plenio 2.0: type an idea, get a finished, mastered song - natively in ComfyUI**

{{fact.one_line}} What is new in 2.0: {{changelog.intro}}

- Setup that picks and downloads the right model files for your card
- {{fact.templates}} templates, {{fact.nodes}} nodes, all on ComfyUI's own loaders
- ...

Install: `{{fact.install_line}}` · Tutorials: {{go.tutorials}} · Code (Apache-2.0): {{fact.repo}}
```

`{{fact.*}}`, `{{go.*}}` and `{{changelog.*}}` are filled by the build from the same sources as the README (product design section 10.3), so a post can never name another node count or another link than the README.

---

## 3. The media pipeline

### 3.1 What exists and what is wrong with it

| Part | Today | Problem |
|---|---|---|
| Tutorial recorder | `tools/tutorials/` in the repository: Playwright scripts, `lib/studio.mjs`, `lib/render.mjs`, TTS, effects [repo] | one script = one take of 2 to 18 minutes; a changed button means the whole video again |
| Spots | HyperFrames project outside the repository (`Plenio-Spot/v3`) [repo: memory notes] | not versioned with the product; data (covers, template names) copied by hand |
| Social clips, cards, carousel | Python and Node scripts in session scratch folders (`compose150.py`, `render.mjs`) | not in any repository; each kit starts from a copy |
| Check scripts (cues, holds, voice, caption grids) | session scratch folders | same |
| YouTube texts | generated into `dist/youtube-tutorials-<version>.md`, pasted by hand | twelve uploads, twelve descriptions, twelve thumbnails, playlist order, then ids typed into `help.ts`, README and docs |
| Video ids | 16 ids in `README.md`, more in `docs/` and `frontend/src/player/help.ts`; `tests/unit/test_tutorial_links.py` checks that they agree [repo] | the test finds a mismatch; it does not remove the need to edit every place |

### 3.2 Decision: one media workspace, in its own repository

**`Plenio-Media`** (a second repository beside `Plenio-VST3`; private or public is the owner's choice, decision D-M1). Reasons: the node package must stay small and free of large binaries; media tools need packages (Playwright, ffmpeg, the Google API client, HyperFrames) that have no place in a ComfyUI custom node; and its history (takes, music beds) is large.

`tools/tutorials/` moves there. The product repository keeps only what its own tests and docs need: `resources/media.toml` (section 6) and the stills checked into `assets/`.

```text
Plenio-Media/
  media.mjs                 the one command (section 3.5)
  product/                  a git submodule or a path to the product checkout (read only)
  data/
    facts.json              generated by the product's tools/facts.py (version, counts, sizes, install line)
    covers.json, templates.json   generated from the demo library and resources/templates
  copy/
    en.yaml                 every sentence shown or spoken, by key
    de.yaml ...             translations (subtitles first, section 5.5)
    posts/, store.yaml, factsheet.yaml
  scenes/                   reusable scenes: one capture recipe + one composition each
    brief-type-idea/        scene.yaml, capture.mjs, comp.html
    player-lyrics/ ...
  films/                    F1-F10: an ordered list of scenes, a music bed, the formats
  tutorials/                the tutorials: an ordered list of chapters (section 5)
  stills/                   README pictures, thumbnails, cards
  music/                    beds made with Plenio, each with its measured beat grid (bars.json)
  lib/                      studio.mjs, render.mjs, sfx.mjs, tap.mjs, voice.mjs (from tools/tutorials/lib), cache.mjs
  checks/                   cue_check, hold_report, voice_check, caption_grids, loudness (from the scratch folders)
  publish/                  youtube.py, plan and apply (section 7)
  out/                      not committed: captures, renders, the kit
```

### 3.3 A scene is the unit of reuse

A film or tutorial is a list of scenes. A scene has a **capture** (how the real program is driven and recorded) and a **composition** (how the capture is framed, titled and animated). Captures are the expensive, fragile part; compositions are cheap.

```yaml
# scenes/brief-type-idea/scene.yaml
id: brief-type-idea
capture:
  target: comfyui            # comfyui | player | guest-phone | terminal | none
  script: capture.mjs        # uses lib/studio.mjs: click, type, fly, follow ...
  needs: [template:yue2-song]
  state: fresh               # fresh | after:<scene id> (a checkpoint, section 5.2)
  models: fake               # fake = the test nodes (seconds), real = the models (minutes)
  viewport: [1920, 1080]
composition: comp.html       # HyperFrames: data-start, data-duration, GSAP timeline
copy: [hero.type_idea]       # keys of copy/<lang>.yaml this scene shows or speaks
layouts:                     # how the composition reframes per format
  "16:9": {capture: full}
  "9:16": {capture: {crop: [460, 0, 1000, 1080]}, title: top}
  "1:1":  {capture: {crop: [420, 0, 1080, 1080]}, title: bottom}
watch:                       # product files whose change invalidates the capture
  - frontend/src/extension/briefTemplate.ts
  - example_workflows/1 · YuE2 · Song.json
```

`models: fake` matters: most UI scenes do not need a real song. The product's host tests already ship fake model nodes [repo: `tests/host/plenio_test_nodes/fakes.py`]; a capture against them takes seconds and never touches a graphics card. Only scenes whose point is the sound (`models: real`) render with the models.

### 3.4 The cache: only what changed is made again

Every stage output is stored under a key that hashes its inputs. This is the mechanism that turns "a new version" from a week into a command.

```js
// lib/cache.mjs
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const h = (...parts) => createHash('sha256').update(parts.join('\0')).digest('hex').slice(0, 16)
const fileHash = (path) => h(readFileSync(path))

/** A capture is valid while its script, the watched product files and the copy it types are unchanged. */
export function captureKey(scene, product, copy) {
  return h(
    'capture/2',
    fileHash(scene.dir + '/' + scene.capture.script),
    ...scene.watch.map((file) => fileHash(product + '/' + file)),
    ...scene.copy.map((key) => copy[key] ?? ''),
    JSON.stringify(scene.capture),
  )
}

/** A render is valid while its capture, composition, layout, copy, music and facts are unchanged. */
export function renderKey(scene, format, lang, captureKeyOf, copy, facts, music) {
  return h('render/2', captureKeyOf, fileHash(scene.dir + '/' + scene.composition),
           JSON.stringify(scene.layouts[format]), lang, ...scene.copy.map((k) => copy[k] ?? ''),
           JSON.stringify(facts), music ?? '')
}
```

`watch` lists are deliberately explicit, not "the whole frontend": a change to the score editor must not invalidate the party scenes. A second safety net catches what a `watch` list misses:

**The drift check.** `media check drift` replays every capture in rehearsal mode (the existing `PLENIO_TUTORIAL_REHEARSE=1`: all pauses under 0.2 s) against the new product version and compares key frames with the stored capture by structural similarity:

```python
# checks/drift.py - a scene whose picture changed although its key did not
from skimage.metrics import structural_similarity as ssim   # the media venv, not ComfyUI's

def drifted(old_frames, new_frames, threshold=0.92):
    scores = [ssim(a, b, channel_axis=2) for a, b in zip(old_frames, new_frames)]
    return min(scores) < threshold, min(scores)
```

A scene that fails to replay (a locator no longer found) or drifts is listed for re-capture; all others are reused. For 1.5.0, seven of twelve tutorials were re-recorded in full and five re-cut [repo: memory notes]; with scenes and the drift check the unit is a chapter of one to two minutes.

### 3.5 One command

```bash
node media.mjs status                       # what is stale: captures, renders, uploads - nothing is run
node media.mjs build films/hero             # capture what is stale, render every format
node media.mjs build tutorials --changed    # only chapters whose key changed
node media.mjs check                        # cues, holds, voice (ASR of the narration), loudness, drift
node media.mjs kit 2.0.0                    # out/kit-2.0.0/: films, stills, posts, store texts, a README
node media.mjs publish youtube --plan       # section 7: what would change on YouTube
node media.mjs publish youtube --apply
```

Rules for the build, each learned in the 1.2-1.5 rounds [repo: memory notes] and now encoded in the tool instead of remembered:

- one GPU job at a time (two parallel jobs were killed for low memory);
- recordings draw WebGL with Playwright's Chromium and GPU flags, never a browser channel that uses the owner's main card;
- a capture never overwrites the last good take: outputs are written under their key, the film points at keys;
- loudness of every film is measured and normalised to one target (-16 LUFS integrated, -1.5 dBTP for YouTube) by `checks/loudness`;
- every film render ends with `checks`: a film that fails a check is not copied into the kit.

### 3.6 State of the art, without a new toolchain

HyperFrames (HTML compositions with a GSAP timeline, rendered frame-exactly by headless Chromium to H.264) made spot v3 and stays: it is scriptable, deterministic, renders without a GPU, and shares its language (HTML, CSS, TypeScript) with the product's frontend, so real components can be shown inside compositions.

What raises the level of the films is not the renderer but four rules for the compositions:

1. **Cut on the measured grid.** Every music bed has its `bars.json` (the product's own bar measurement, API 1.4). Scene starts are bar numbers, not seconds; a new bed re-times the film by itself.
2. **The product's own visuals as backgrounds.** Plenio Nova scenes rendered offline at the film's resolution (the player's video maker already draws every frame from the song's own sound) sit behind titles instead of stock gradients.
3. **Real captures, moved like a camera.** Captures are recorded at twice the output resolution; compositions pan and zoom inside them with eased moves (`fly*` in `lib/studio.mjs` during capture, GSAP in the composition), so no shot is a static screenshot.
4. **One type scale, one motion vocabulary.** `lib/brand.css` and `lib/motion.js` hold the fonts, colours, easings and the four allowed transitions; every composition imports them. A change of the brand is one file.

---

## 4. The README and the store texts

The README is restructured to follow the message house. Nothing is deleted; the order changes and the top becomes short.

```text
banner
# Plenio Music Production System
Type an idea. Get a finished song. On your own PC.            <- the one line
[hero loop: the 12-second version of F1, silent, WebP]
badges
Three sentences: finished, not generated · nothing is a black box · music is for people
Install (three lines) + "Install in three minutes" film
--- everything below is reference ---
Listen · What Plenio does (table) · In ComfyUI · The player · In your DAW · New in 2.0
Under the hood · Hardware · Tutorials · Documentation · Limits · Licences
```

Blocks that repeat facts (node count, template count, test count, model sizes, video links, the hardware table) are generated between markers by the product's `tools/facts.py` (product design section 10.3). The Registry description (`pyproject.toml`), the GitHub *About* line and the YouTube channel text all come from `copy/store.yaml` and start with the one line.

---

## 5. Tutorials 2.0

### 5.1 From twelve long films to chapters

Today: twelve videos of 2:44 to 18:25 [repo: `dist/youtube-tutorials-1.5.0.md`]. A newcomer who wants to know how to add a guest must find minute 11 of an 18-minute film; a changed dialog invalidates the whole take.

Decision: **every tutorial is a list of chapters; every chapter is also a video of its own.**

| Level | What | Length | Where it is used |
|---|---|---|---|
| **Start here** | F8 install, then *Your first song* | 3 min each | README, Setup's last page, the player's first-run card |
| **Path tutorials** | one per template and one each for player, party, API, LoRAs: the chapters joined, with an intro card | 4-8 min | the tutorial playlist, the docs' path pages |
| **How do I ...?** | single chapters: *add a guest*, *fix a wrong note*, *fit notes to lyrics*, *make a video of a song* | 45-120 s | embedded at the matching section of the docs and in the player's help, found by search |

The 18-minute player tutorial becomes a 6-minute path tutorial plus about ten how-to chapters. YouTube favours the short, specific titles ("How to let party guests make songs - Plenio"), the docs can embed exactly the minute that answers the question, and a UI change costs one chapter.

### 5.2 Chapters that do not depend on each other: checkpoints

A long take exists today because chapter 5 needs the song chapter 2 made. Checkpoints remove that dependency:

```yaml
# tutorials/yue2-song.yaml
id: tutorial-yue2-song
title: "1 · YuE2 · Song"
chapters:
  - {scene: song-open-template,  state: fresh}
  - {scene: song-run-series,     state: fresh,                  models: real}
  - {scene: song-review-text,    state: after:song-run-draft}   # a saved checkpoint
  - {scene: score-tour,          state: after:song-run-draft}
  - {scene: score-fit-notes,     state: after:song-run-draft}
  - {scene: song-take,           state: after:song-approved,    models: real}
```

A checkpoint is a folder: the workflow JSON as saved, the ComfyUI user and output folders of the capture server, the player's state folder. `state: after:<scene>` starts a fresh capture server on a copy of that folder. The product makes checkpoints cheap: seeds stay on 🔒 in the recorded templates, the writer's answers are cached by request and seed, the lyrics ASR is cached by audio hash [repo: `docs/user/configuration.md`], so a replay reaches the same lyrics and score without the models.

### 5.3 What the recorder gains

| Change | Effect |
|---|---|
| Captures per scene with cache keys and checkpoints | a UI change re-records minutes, not a whole film |
| `models: fake` for UI-only scenes | most chapters record without a graphics card, in CI-like time |
| Narration per scene in `copy/<lang>.yaml`, voice cached by text and voice (exists) | a changed sentence synthesises one line |
| `media check` runs the existing checks as a gate | no film with a frozen picture, a wrong cue or a mispronounced name leaves the build |
| Title cards without a version number; the version appears only in the description | an unchanged tutorial does not look outdated after a release |
| Thumbnails from one HTML template per series (`stills/thumbnail.html` + title + still) | consistent, regenerated by the build, never edited by hand |
| Chapter markers and the YouTube description generated from the same chapter list | they cannot disagree with the film |

### 5.4 The voice

The narration stays synthetic and labelled as such in every description. Two improvements: the pronunciation lexicon (`narration/lexicon.txt`) moves to `copy/lexicon.yaml` and is checked by `checks/voice_check` (the narration is transcribed and compared with the text; names such as YuE2 and Plenio are whitelisted), and every film gets a loudness-matched bed at a fixed level under the voice (the 1.0 round measured 11 dB of separation as comfortable [repo: memory notes]).

### 5.5 Languages

Step 1 (2.0): **subtitles** in English, German, Spanish, French, Japanese and Chinese, translated from `copy/en.yaml` and uploaded as caption tracks (section 7). The picture and the voice stay English. Step 2 (later, optional): a second audio track per language with the same TTS, since YouTube supports multi-language audio; the pipeline already separates voice from picture.

---

## 6. Links that never break

### 6.1 The cause

YouTube gives a re-uploaded video a new id; a video's file cannot be replaced. Today an id is written into `help.ts`, the README (link and thumbnail URL), several docs and every other video's description.

### 6.2 Decision: a media registry and stable go-links

**One file names every video**, in the product repository because the player ships it:

```toml
# resources/media.toml  (schema plenio.media/1)
[[video]]
key = "tutorial-yue2-song"
title = "1 · YuE2 · Song"
youtube = "PdL7mCKEE1k"
seconds = 1044
kind = "tutorial"          # tutorial | howto | film | song
order = 1

[[video]]
key = "howto-party-guests"
title = "Let party guests make songs"
youtube = "…"
kind = "howto"
docs = ["docs/user/concepts/player.md#party-songs-guests-make-songs"]

[[playlist]]
key = "tutorials"
youtube = "PLAFqTtP59fgE"
```

**Everything else refers to keys.** `tools/media_links.py` (product repository) generates from it:

1. **Go-links on the project's GitHub Pages site**: `docs/go/<key>/index.html`, a redirect page.

   ```html
   <!doctype html><meta charset="utf-8"><title>Plenio · 1 · YuE2 · Song</title>
   <link rel="canonical" href="https://youtu.be/PdL7mCKEE1k">
   <meta http-equiv="refresh" content="0; url=https://youtu.be/PdL7mCKEE1k">
   <script>location.replace("https://youtu.be/PdL7mCKEE1k" + location.hash)</script>
   <a href="https://youtu.be/PdL7mCKEE1k">1 · YuE2 · Song on YouTube</a>
   ```

   The public address is `https://jplenio.github.io/Plenio-Music-Production-System/go/tutorial-yue2-song/`. README, docs, posts, release notes and **the descriptions of the other videos** link there. A re-upload changes one line of `media.toml`; the next push to `main` republishes the redirects.
2. **`plenio/player/static/media.json`** for the player's help, which embeds by id. An installed player of an older version keeps its ids, so the rule in section 7.3 applies: an old upload is set to *unlisted*, never deleted.
3. **Thumbnails at version-free paths**: `assets/media/<key>.jpg`, copied from the media kit. The README no longer loads `i.ytimg.com/vi/<id>/...`.
4. **The README's tutorial table and the docs' "Videos:" lines**, between markers.

`tests/unit/test_tutorial_links.py` is replaced by a stricter rule: outside generated blocks and `media.toml`, no file of the repository contains `youtu.be/` or `youtube.com/watch`.

Trade-off, accepted: a click passes through GitHub Pages first. If Pages is unreachable the link fails, where a direct link would not; in exchange no published text ever needs an edit for a re-upload.

---

## 7. Publishing the videos: YouTube by script

### 7.1 What the API allows [checked 2026-11-11, developers.google.com/youtube/v3]

| Step | Method | Quota |
|---|---|---|
| upload a video with title, description, tags, category, language, privacy, `publishAt`, `containsSyntheticMedia`, `selfDeclaredMadeForKids` | `videos.insert` (resumable) | 1 unit in the *Video Uploads* bucket; 100 uploads a day |
| set the thumbnail | `thumbnails.set` | 50 |
| add to a playlist at a position, move, remove | `playlistItems.insert` / `update` / `delete` | 50 each |
| upload subtitles per language | `captions.insert` | 400 |
| change title, description, tags, privacy of an existing video | `videos.update` | 50 |
| read the channel's videos and playlists | `playlistItems.list`, `videos.list` | 1 |

The default project quota is 10 000 units a day. A full 2.0 round - 40 uploads with thumbnails, playlist entries and six caption tracks each - costs about 40 × (50 + 50 + 6 × 400) = 100 000 units and so spreads over several days, or captions are limited to English and German on day one (40 × 900 = 36 000, four days) and the rest follows. `--plan` prints the cost and splits the work by day; `--apply` resumes where the quota ended. The reference page states that uploads from unverified projects are not restricted to private; confirm on the first upload.

**What the API cannot do**, and the design avoids needing: end screens and cards (the description and the playlist carry the "next" link instead), replacing a video's file (go-links), pinning a comment, chapters as a separate field (chapters are the timestamp lines of the description, which the build writes).

### 7.2 One-time setup (a tutorial for the owner)

1. **Google Cloud project.** console.cloud.google.com → *New project* → name `plenio-media`.
2. **Enable the API.** *APIs & Services → Library* → *YouTube Data API v3* → *Enable*.
3. **Consent screen.** *OAuth consent screen* → user type *External* → app name `Plenio Media`, your address as support and developer contact → scopes: `youtube.upload` and `youtube.force-ssl` → add your own Google account as a test user. Then **Publish app** (status *In production*). A project left in *Testing* gives refresh tokens that expire after seven days, and the script would ask for a login every week. Verification by Google is not needed for an app only you use; the login shows an "unverified app" notice once, which you accept under *Advanced*.
4. **Credentials.** *Credentials → Create credentials → OAuth client ID → Desktop app* → download the JSON as `~/.plenio-media/client_secret.json`. It never goes into a repository.
5. **Log in once.** `node media.mjs publish youtube --auth` opens the browser, you choose the channel, and the refresh token is stored in `~/.plenio-media/youtube-token.json` (readable by your user only).
6. **Check.** `node media.mjs publish youtube --plan` lists the channel's videos against `media.toml` and changes nothing.

### 7.3 Plan and apply

The publisher treats the channel like infrastructure: the wanted state is `films/*.yaml`, `tutorials/*.yaml`, `copy/` and `media.toml`; `--plan` prints the difference; `--apply` makes it so.

```text
$ node media.mjs publish youtube --plan
UPLOAD   howto-party-guests        new                          1:12   thumbnail, 2 captions, playlist tutorials #14
REPLACE  tutorial-yue2-song        render changed (key 3fa9…)   6:40   old PdL7mCKEE1k -> unlisted, description -> go-link
UPDATE   tutorial-system-check     description changed (links)  -
KEEP     tutorial-song-api
quota: 3 250 of 10 000 units today · 2 uploads
```

```python
# publish/youtube.py - the core of plan()
def plan(wanted: list[Video], channel: dict[str, Remote], registry: dict[str, str]) -> list[Action]:
    actions = []
    for video in wanted:
        remote = channel.get(registry.get(video.key, ""))
        if remote is None:
            actions.append(Upload(video))
        elif remote.render_key != video.render_key:        # kept in the description's last line, see below
            actions.append(Replace(video, old=remote))     # upload new, old -> unlisted + pointer, registry updated
        elif remote.description != video.description or remote.title != video.title:
            actions.append(Update(video, remote))
    return actions
```

Details that make it safe:

- **Uploads are private first.** `--apply` uploads as *private* with `publishAt` unset and prints the links; `--release` (or a `publishAt` time in the film's YAML) makes them public. Nothing appears on the channel by accident.
- **The render key is written into the description** as its last line (`plenio-media: tutorial-yue2-song 3fa9c2…`), so the script recognises its own uploads and never touches videos it did not make.
- **Replace never deletes.** The old video becomes *unlisted*, leaves the playlists, and its description gets a first line pointing at the go-link. Embeds in older installed players keep working.
- **After an upload** the script writes the new id into the product checkout's `resources/media.toml` and runs `tools/media_links.py`; the owner reviews the diff and commits. That one commit updates the README, the docs, the player's help and the go-links.
- **Descriptions are templates** (`copy/youtube/description.md`): the summary, the chapter lines, go-links to the playlist and the next tutorial, the install line from `facts.json`, the synthetic-voice note, three hashtags. A change of the install line updates every description with one `--apply` (50 units each).
- **`containsSyntheticMedia`** is set per film in its YAML: `true` for the song videos (the music and the singing are generated), stated in the description as well. Check YouTube's current disclosure rules before the first run; they changed several times.

### 7.4 Other channels

| Channel | Automation | How |
|---|---|---|
| GitHub release, Registry, GitHub Pages | full | section 8 |
| YouTube | full after the one-time setup | section 7.3 |
| Own Discord server | optional, full | a webhook URL in `~/.plenio-media/`; `publish discord --apply` posts the announcement with the film |
| Reddit, X, LinkedIn, Mastodon, other Discords | prepared, posted by hand | `out/kit-<version>/posts/` holds each text with its picture or film, in posting order with the day (T+0, T+2 ...). Posting by script risks the account under these platforms' automation rules and gains minutes; not worth it |
| SoundCloud (demo songs) | by hand | the existing upload checklist (`docs/demo-plenio-upload.md`) stays |

---

## 8. Publishing the product: one tag

### 8.1 Today

Six version strings in five files, release notes generated by a scratch script and pasted into the GitHub release form, a review request edited by hand, the fresh-install check done by hand [repo: `docs/dev/release.md`, memory notes]. The release doc still says "31 nodes, 13 blueprints"; the repository has 37 node help pages and 14 blueprints [repo].

### 8.2 Decision: `tools/release.py` prepares, a tag publishes

```bash
python tools/release.py prepare 2.0.0     # everything below, then stops for review
python tools/release.py verify            # the checks again on the committed tree
git tag v2.0.0 && git push origin main v2.0.0     # the owner's step; it publishes
```

`prepare` does, in order, and stops at the first failure:

1. version into `pyproject.toml`, `plenio/__init__.py`, `frontend/package.json`, `frontend/package-lock.json`; LF line ends enforced on frontend sources before the build (the cause of a failed CI build check in 1.0);
2. `tools/build_graphs.py`, `tools/api_docs.py`, `tools/facts.py --write`, `tools/media_links.py`, `tools/build_thumbnails.py`; frontend builds;
3. the CHANGELOG: the section for this version must exist with today's date; the section two versions back moves out and the header links its tag;
4. `docs/releases/<version>.md`: the release notes, generated from the CHANGELOG section (the logic of the scratch `release_notes.py`, now `tools/release_notes.py`), **committed**, so the release workflow reads them from the tag;
5. `docs/security/review-<version>.md`: the review request with the **delta of findings** against the last published version (product design section 3.4);
6. the checks: ruff, mypy, the test tiers, `comfy node validate`, `comfy node pack`, the package boundary gate on the packed zip, the zip's content list;
7. a summary: what changed, what to read before tagging.

The tag starts `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ["v*"]
permissions:
  contents: write
jobs:
  checks:
    uses: ./.github/workflows/ci.yml            # the whole CI as a reusable workflow
  release:
    needs: checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-python@v6
        with: {python-version: "3.12"}
      - run: python -m pip install comfy-cli
      - run: git config --global core.quotePath false
      - name: The tag is the version
        run: test "v$(python tools/release.py version)" = "${GITHUB_REF_NAME}"
      - run: python tools/build_release_assets.py --out dist
      - name: GitHub release with the committed notes
        run: gh release create "${GITHUB_REF_NAME}" dist/*/* --title "Plenio ${GITHUB_REF_NAME#v}" --notes-file "docs/releases/${GITHUB_REF_NAME#v}.md" --verify-tag
        env: {GH_TOKEN: "${{ github.token }}"}
      - name: Publish to the Comfy Registry
        uses: Comfy-Org/publish-node-action@v1
        with: {personal_access_token: "${{ secrets.REGISTRY_ACCESS_TOKEN }}"}
  verify-published:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with: {repository: Comfy-Org/ComfyUI, ref: v0.44.0, path: ComfyUI}
      - uses: actions/setup-python@v6
        with: {python-version: "3.12"}
      - run: python -m pip install torch --index-url https://download.pytorch.org/whl/cpu && python -m pip install -r ComfyUI/requirements.txt comfy-cli
      - name: Install the published package into a fresh ComfyUI and count what it registers
        run: python tools/verify_install.py --comfyui ComfyUI --package comfyui-plenio-music --version "${GITHUB_REF_NAME#v}"
```

`tools/verify_install.py` starts ComfyUI on the CPU with only the published package, reads `/object_info` and `/workflow_templates`, and compares the node, blueprint and template counts with `facts.json` of the tag. It replaces the manual "install the zip once into a fresh ComfyUI".

Pages (the demo page, the docs site, the go-links, the API reference) deploy from `main` on every push, as today.

### 8.3 What stays manual, on purpose

| Step | Why |
|---|---|
| pushing the tag | the owner publishes; the agent commits locally and never pushes |
| filing the Registry review request | an outward-facing post under the owner's name; `prepare` writes it and prints a link that opens the issue form with the title and text filled in |
| replying to issues | same |
| social posts | section 7.4 |

### 8.4 Watching the Registry

`python tools/registry_status.py` reads the public Registry API and prints every version's status and reason [checked 2026-11-11: `https://api.comfy.org/versions?nodeId=comfyui-plenio-music&statuses=NodeVersionStatusFlagged&include_status_reason=true`]. A scheduled workflow runs it daily after a release and opens an issue in the project's own repository when the newest version's status changes, so a verdict is noticed the day it lands.

---

## 9. Launch plan for 2.0

| When | What | Who |
|---|---|---|
| T-21 | the canary release 1.7.0 with the new package boundary is published; its Registry verdict decides the boundary (product design section 3.5) | owner publishes |
| T-14 | feature freeze; `media status` against the release candidate; captures of drifted scenes | agent |
| T-10 | F8 *Install in three minutes* and *Your first song* recorded on a clean machine profile; reviewed by the owner | agent, owner |
| T-7 | all films and tutorials built, `media check` green; kit folder complete; YouTube `--apply` (private) | agent, owner |
| T-3 | `release.py prepare 2.0.0`; the owner listens and watches; texts frozen | agent, owner |
| T-0 | tag pushed → release, Registry, Pages; YouTube `--release`; `media.toml` commit; announcement post on GitHub Discussions and r/comfyui with F1 | owner |
| T+1 | audience posts: *Your party.* (party communities), *Your control.* (music production), *Your code.* (developers) - one a day, never all at once | owner |
| T+2 | Registry review request filed with the delta report | owner |
| T+7 | the how-to chapters released two a day as Shorts-friendly cuts where a 9:16 layout exists | scheduled by `publishAt` |
| T+14 | review: installs (Registry downloads), watch time per film, the questions asked most - they become the next how-to chapters | owner, agent |

---

## 10. Decisions for the owner

| Id | Decision | Recommendation |
|---|---|---|
| D-M1 | `Plenio-Media` as its own repository; private or public | own repository, **public** without the raw captures (a `.gitignore` for `out/`), so the films' honesty can be checked and others can learn from the pipeline |
| D-M2 | the one line: *Type an idea. Get a finished song. On your own PC.* | adopt; test it on three people who do not know Plenio before the films are cut |
| D-M3 | tutorials as chapters, the long takes retired (set to unlisted, linked from the new ones) | adopt |
| D-M4 | subtitle languages on day one | English and German on day one (quota), the other four within a week |
| D-M5 | go-links through GitHub Pages | adopt; alternative: a short custom domain later, the redirect pages stay the same |
| D-M6 | the hero film's third beat, *Your PC.* | adopt; *Your party.* stays the film for the feature that is unique |
