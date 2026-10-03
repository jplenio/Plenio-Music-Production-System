# Score editor: notation export, sounds, presets, YuE2 safety (2026-10-03)

The owner's request of 2026-10-03 for the *Edit Score* area, with the research behind each answer, what
was built and what was deliberately not built. The rule given with the request: build only what can be
built in very good quality in reasonable time; document the rest.

| # | Request | Result |
|---|---|---|
| 1 | Export the notation as PDF and as a picture | **built**: PDF (A4 / Letter, 300 dpi pages), PNG, SVG, *Print…* (vector PDF through the browser) |
| 2 | Covers: the original's pitch curve and waveform only optional | **built**: *wave* joins *sung* in the roll's toolbar; remembered, in the project file and in presets |
| 3 | The generated ABC always compatible with YuE2 | **verified and extended**: the guarantee exists; the random-edit test now covers MIDI takes, paste and quantize; a new octave-slip warning |
| 4 | Other sounds for the tracks (piano, strings, pad ...), VSTs if not too complicated | **built**: 13 synthesized sounds per track; **VST: not built** (not possible in a browser; the server route is disproportionate - §4.3) |
| 5 | These settings saved with the project | **built**: optional `settings` in `plenio.score_project/1` |
| 6 | Presets of the basic settings by kind of song; save the current ones as a user preset | **built**: 11 built-in presets; user presets in ComfyUI's user data |

## 1. Notation export

**What exists to draw from.** The notation pane is abcjs 6.7.1 rendering the backend's *display ABC*
(both voices, chord symbols, section names as annotations, the lyrics as `w:` lines). abcjs renders
SVG; its options include `oneSvgPerLine` (one SVG per line of music), `staffwidth`, `scale`,
`foregroundColor` and paddings (checked in `node_modules/abcjs/types/index.d.ts`).

**Options considered for PDF.**

| Option | Quality | Cost | Verdict |
|---|---|---|---|
| jsPDF + svg2pdf.js (vector) | vector, but text in the 14 standard PDF fonts only (WinAnsi): `♯`/`♭` in chord symbols and lyrics in other scripts break unless a Unicode font file (several MB) is embedded | two dependencies + a font | not chosen: the font is the price of correct text |
| Browser print dialog of the pages | vector, exact fonts | none | **built as *Print…*** - but a dialog, not a download |
| Pages rasterized at 300 dpi in a minimal PDF | print quality (300 dpi is the usual print resolution), exact text, any script | ~150 lines, no dependency | **built as PDF** |
| Backend (e.g. MuseScore CLI, LilyPond) | engraved | an external program on the user's machine | not chosen; MusicXML → MuseScore already gives this route |

**Built.** `notationExport.ts` draws the display ABC once more off screen, black on white, with the
song's title in `T:` and as wide as the paper's text block (15 mm margins), one SVG per line. Lines are
laid out on pages without splitting one (`paginate`). PDF: each page is drawn on a canvas at 300 dpi,
converted to 8-bit gray and compressed with the browser's own zlib (`CompressionStream('deflate')` =
FlateDecode); `pdf.ts` writes PDF 1.4 with an exact cross-reference table, the title in the document
information, and page numbers when there are several pages. PNG: the whole score as one picture at 2×
(capped below the canvas limit of ~32 767 px). SVG: the lines nested in one document on white. *Print…*:
a hidden frame with the page sections and `@page { size: A4|letter; margin: 15mm }`.

**Tests.** `tests/notationExport.test.ts`: the title, pagination, file names; a 2-page PDF whose xref
offsets each point at `n 0 obj` and whose image streams inflate back to the exact pixels; PDF string
escaping (ASCII literal, UTF-16BE hex otherwise). In the browser: the four formats from a real sheet
(§7).

## 2. Cover display options

*sung* (the Sung Pitch curve) was already a switch; the waveform lane was always drawn. `PianoRoll`
gets `waveVisible` (a model, like `sungVisible`): off removes the lane from the geometry, so the roll
gains the room. Both are preferences (`wave`, `sung`), part of the settings (§5) and set by the presets
*Cover: check the transcription* (on) and *Cover: free arrangement* (off, with *hear: notes*). The
default stays on: checking the transcription is the first job in a cover.

## 3. YuE2 compatibility

**What guarantees it (research of the code).**

1. Every edit is a backend operation (`plenio/core/score/ops.py`) on the canonical model; `_commit`
   validates the model (`canonical.validate`: tempo, unit, meters, layout groups, keys, sections,
   non-overlapping notes per voice, pitches 0-127, supported chord symbols).
2. `canonical.to_abc` writes the text and re-reads it with the vendored parser of YuE2's dialect
   (`plenio/third_party/yue2_abc_tools.py`: the two voices, the note values `{1,2,3,4,6,8,12,16,24,32,48}`
   in units, ties, keys, chord qualities) and requires the same model back - otherwise the edit is an
   internal error and refused. Durations are decomposed into supported values with ties.
3. Typed text goes through the same parser (analysis after a pause); an invalid text blocks Apply and
   Approve (`commitBlock`).
4. The sheet's engine rules (`plenio/core/engines/yue2.py`, `check_score`): no rests-only score, a
   silent Vocal for instrumentals, sections vs lyrics, length vs brief, register vs voice; the exact
   token budget at run time.

**Gap found.** The dialect accepts any MIDI pitch, so a melody played an octave or two off on a MIDI
keyboard is *valid* but unsingable. New: `check_vocal_range` warns below E2 (40) or above C7 (96) *as
written*. The bounds are deliberately wide: SheetSage2 writes melodies an octave above the singing (found
on the example cover, §0.4.3 session), so C7 written is a soprano's high C; E2 is a bass's lowest note
even before that octave. The fixtures (SheetSage2 transcriptions, YuE2 plans, upstream examples) stay
silent - `test_vocal_range_warns_about_an_octave_slip_only`.

**Test extended.** The stateful property test `EditSession` (Hypothesis, random sequences of edits,
after every step: `problems() == []`, `upstream.parse_abc(text)` succeeds, `to_abc(score) == text`) did
not draw `place_notes`, `paste` and `quantize`. It does now - MIDI takes with pitches 21-108, overlapping
chords, optional clear ranges; clips pasted overwriting or inserting; quantize with lengths. A run with
600 sequences of up to 15 steps passed (163 s); the suite keeps 60 × 12. Arrangements have their own
property test (`test_score_arrange.py`).

## 4. Sounds

### 4.1 Options

| Option | Quality | Cost | Verdict |
|---|---|---|---|
| Sampled instruments (SoundFont / sfz, e.g. FluidR3, MusyngKite via `soundfont-player` / `smplr`) | realistic | several MB per instrument, a download at first use or in the repository; the editor's design is offline and download-free | not chosen |
| Synthesis with Web Audio nodes | sketch-like, but clearly distinct characters | ~400 lines, no dependency, same latency as now | **built** |
| Web Audio Modules (WAM 2.0) plugins | real synths in the browser | a plugin host and per-plugin bundles, few instruments, own UIs | not chosen (disproportionate) |
| VST / VST3 | the user's own instruments | see 4.3 | not possible / disproportionate |

### 4.2 Built

`instruments.ts`: `startVoice(ctx, out, id, midi, at, {velocity, level})` returns a `Voice` with
`release(when)` and `stop()`. Each sound is a small recipe: oscillators or custom waveforms
(`PeriodicWave` from harmonic amplitudes), filters, an envelope (attack, decay to a sustain, release as
time constants) and, where it belongs, vibrato or a noise burst:

| Sound | Recipe |
|---|---|
| Plain / Soft lead | sine / triangle (the sounds of 0.4.3 and before - still the default) |
| Piano | 12-partial waveform, two strings ±1.5 cents, a low-pass that falls towards the low partials, a hammer noise; rings longer low down |
| Electric piano | two-operator FM 1:1 with a falling index, a tine partial; a 25 Hz high-pass removes the 0 Hz sideband of the 1:1 ratio |
| Strings | three detuned saws, low-pass, slow bow, delayed vibrato |
| Pad | two detuned saws and a sub triangle, a breathing low-pass, slow attack and release |
| Organ | drawbar waveform (8', 4', 2 2/3', 2' ...), a 16' sine, light vibrato, key click |
| Flute | near-sine waveform, looping breath noise through a band-pass, vibrato |
| Voice “ah” | a buzz through three formant band-passes (800, 1150, 2900 Hz) plus some direct buzz, vibrato |
| Pluck | saw + triangle through a fast-closing low-pass, a pick noise |
| Synth lead | square + saw, resonant low-pass, vibrato |
| Bass | sine + triangle + a filtered saw edge |
| Mallets | FM with the inharmonic ratio 3.5 and a fast-falling index |

The player (`TonePlayer`) starts a voice per scheduled note with the track's sound and releases it at
the note's end; `setSounds` changes the sounds while it plays (the next notes). A sound that fails falls
back to the plain tone, so playback never stops over a sound. The MIDI keys (`KeyMonitor`) and the
audition of drawn notes use the *draw into* track's sound.

**Levels.** Every sound was rendered with an `OfflineAudioContext` in Chromium (C3, C4, C5 held 1.2 s,
velocity 0.8) and its RMS compared with the plain tone's; `GAIN` levels them. The calibration found two
faults that were fixed: the electric piano's DC offset (0.10 → 0.0001, the high-pass) and a voice that
was 3-5× too quiet and pitch-dependent (wider formants, more direct buzz). Result for C4 (RMS relative to
the plain tone's attack; DC of the whole render):

| Sound | attack (60-300 ms) | held (0.3-1.2 s) | DC |
|---|---|---|---|
| plain | 1.00 | 0.92 | 0.00001 |
| soft | 0.82 | 0.75 | 0.00000 |
| piano | 0.96 | 0.47 (decaying) | -0.00003 |
| epiano | 0.98 | 0.82 | -0.00014 |
| strings | 0.52 (slow bow) | 0.91 | 0.00000 |
| pad | 0.28 (slow attack) | 0.93 | 0.00000 |
| organ | 0.88 | 0.88 | -0.00003 |
| flute | 0.92 | 0.92 | 0.00000 |
| voice | 0.99 | 1.03 | 0.00000 |
| pluck | 0.98 | 0.36 (decaying) | 0.00000 |
| lead | 1.22 | 0.89 | -0.00001 |
| bass | 1.13 | 0.78 | 0.00001 |
| mallets | 1.02 | 0.55 (decaying) | 0.00015 |

**Tests.** `tests/instruments.test.ts`: every sound starts its sources at the note, stops them after
the release (never before the note ends, within seconds), stops at once with the playback; struck sounds
end by themselves while held; unknown ids fall back. The Web Audio stand-in is shared
(`tests/support/fakeAudio.ts`).

### 4.3 VST

A VST/VST3 plugin is native code (a DLL / bundle) for a host process; a browser page cannot load it, and
no browser API bridges to it. The only routes:

1. **A server-side host**: the Python package `pedalboard` (Spotify) loads VST3/AU instruments and
   renders MIDI to audio. This needs a new dependency in the user's ComfyUI environment, the user's
   plugin paths and licences, per-plugin presets without their editors (headless), and an offline render
   of the score for every playback (seconds of delay, no live MIDI keys). Disproportionate for a
   guide-tone player; YuE2 renders the actual song.
2. **A local bridge program** (MIDI out to a running DAW or a plugin host): the browser has Web MIDI
   *output*. Sending the playback to a MIDI output - a DAW or a standalone plugin host playing the
   user's VSTs - is possible in principle; it needs a clock-accurate MIDI scheduler, port choice and
   latency handling. Not built now; it is the sensible route if real instruments are wanted later.

For real instruments today: *Export MIDI* into a DAW.

## 5. Settings in the project file

`EditorSettings` (`editorSettings.ts`): the tracks' sounds, the metronome, the cover's *hear*, source
level, *wave* and *sung*, the MIDI recording settings and the paper. `buildProject` writes them as
`settings`; `parseProject` reads only valid fields (`parseSettings`: unknown sounds fall back, levels are
clamped, unknown fields are dropped). The schema stays `plenio.score_project/1`: the field is optional
and additive, so older versions open new files (they ignore it) and new versions open old files (no
settings). Opening a project applies its settings (`withSettings`: only the named fields change).

## 6. Presets

**Built in** (`BUILT_IN_PRESETS`): *Classic*, *Pop*, *Ballad*, *Rock*, *Electronic / dance*, *Acoustic
/ singer-songwriter*, *Jazz / soul*, *Orchestral / cinematic* (sounds; the electronic one also the
metronome), *Composing with a MIDI keyboard* (piano sounds, metronome, count-in 1 bar, quantize 1/16),
*Cover: check the transcription* and *Cover: free arrangement*. A preset is a partial settings object:
it changes what it names.

**User presets** - where to keep them:

| Store | Scope | Verdict |
|---|---|---|
| the browser's localStorage | this browser only | the fallback |
| the workflow (node properties) | one workflow | wrong scope: a preset is for every song |
| a file in the custom node folder | every user of the installation; lost on updates | no |
| **ComfyUI's user data** (`GET/POST /api/userdata/{file}`, `app/user_manager.py`: per ComfyUI user, parent folders created, atomic write) | the user, every browser, next to the workflows | **chosen** |

The file is `plenio/score-editor-presets.json` (`plenio.score_presets/1`: `{name, settings}` per
preset, names unique case-insensitively, a built-in name cannot be taken). When the store cannot be
reached, the presets are kept in the browser and the panel says so.

**Tests.** `tests/editorSettings.test.ts` (settings, parsing, project round trip, built-in presets
valid, user presets through a fake user-data store, the browser fallback), `tests/soundsPresets.test.ts`
(the panel in the Score tab: a sound remembered, a preset applied, a user preset POSTed to the user data,
the DAW track headers, the export button).

## 7. Checks in the browser

On the CPU dev server (headless Chromium) with the DAW template and the tutorial's 18-bar sketch with
lyrics:

- **PDF** (1.1 s, 228 KB): read back with an independent Python check - every xref offset at its
  object, 2 pages of 2480 × 3508 px (A4 at 300 dpi), the images inflate to exactly width × height bytes,
  title *Open Window*; the extracted pages show title, tempo, chord symbols, sections, both voices, the
  lyrics under the notes and *1 / 2*. **PNG** 1440 × 3078 px on white; **SVG** valid XML with the 9 lines;
  **Print…** (``print()`` caught): 2 page sections, 9 lines, *1 / 2*, `size: A4 portrait`.
- **♫ sounds**: all 13 sounds previewed without an error; *Ballad* set Voice / Piano / Strings / Bass;
  *save current as preset…* wrote `plenio/score-editor-presets.json` to the scratch ComfyUI's user data
  (read back through `/api/userdata`); playback with the new sounds ran.
- **Save project**: the file's `settings` hold the sounds, metronome, cover view, recording and paper.
- The *wave* switch is checked in `tests/rollDawHabits.test.ts` (the lane goes and comes back; the roll
  stays); the GPU server was busy recording the tutorials.

The only console error was ComfyUI's own *graph accessed before initialization* at page load.
