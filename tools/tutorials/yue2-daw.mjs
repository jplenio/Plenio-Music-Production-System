// Tutorial 5 · YuE2 · DAW: the writer drafts the words, you bring the music. One song with its two review
// stops - Song Sheet · Text (the lyrics, Approve) and Song Sheet · DAW, where a sketch from a DAW comes in
// with Import MIDI… (melody, second voice, chords, sections and a bass on the Guide track, which YuE2 never
// gets), plays from the cursor, takes a counter-line from a MIDI keyboard (simulated, undone again) and is
// saved as a project - and the song YuE2 renders from exactly that score. The sketch is assets/Open Window Sketch.mid (an original 18-bar song in C made for this video;
// assets/Open Window Sketch.abc is its score), or $PLENIO_TUTORIAL_MIDI.

import path from 'node:path'
import { afterRun, barsDemo, coverArtShown, cursorDemo, editorTour, exportExtras, filesDemo, intro, openTemplate, recordDemo, sectionTour, sheetMusicSaved, showApproved, simulateKeyboard, soundsDemo, switchCards, writerDemo } from './lib/scenes.mjs'
import { DIALOG, approve, fixSections, maximize, openSheet, scrollToVoice, tab, trimSections } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 5 - YuE2 DAW',
  template: '5 · YuE2 · DAW',
}

// the template's nodes by title or type (example_workflows/5 · YuE2 · DAW.json)
const BRIEF = 'PlenioSongBrief', WRITE = 'Plenio · Write Song', TEXT = 'Song Sheet · Text'
const TOOLS = 'Score Tools · new score from brief', DAW = 'Song Sheet · DAW', RENDER = 'Plenio · YuE2 Render'
const MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease', WRITER = 'Writer model'
const COVER = 'Cover Art'
const SECTIONS = ['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · DAW', '5 · RENDER', '6 · FINISH']
const GROUPS = {
  [WRITE]: '2 · WRITE', [TEXT]: '3 · TEXT', [TOOLS]: '4 · DAW', [DAW]: '4 · DAW', 'Take seed': '5 · RENDER', [RENDER]: '5 · RENDER',
  [COVER]: 'COVER ART', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH', [EXPORT]: '6 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the style and the lyrics, and ten titles to pick from.',
  [TOOLS]: 'Score Tools builds an empty score from the brief.',
  [RENDER]: 'YuE2 renders exactly the approved score.',
  [COVER]: '',
  [MASTER]: 'Master and Export finish the song.',
}
const IDEA = 'A hopeful song about opening the window on the first warm morning of spring.'

export default async function daw(s, { project }) {
  const page = s.page
  const sketch = process.env.PLENIO_TUTORIAL_MIDI || path.join(project, 'tools', 'tutorials', 'assets', 'Open Window Sketch.mid')
  await simulateKeyboard(s)
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">5 ·</span> YuE2 · DAW',
    subtitle: 'The writer drafts the words, you bring the music - YuE2 renders exactly your score',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 5 · YuE2 · DAW',
    items: [
      'Part 1 · The words: the brief, the writer, the first stop',
      'Part 2 · The music: a sketch from your DAW',
      'YuE2 renders exactly your score',
    ],
  })

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, { name: '5 · YuE2 · DAW', alt: 'DAW', what: '5 · YuE2 · DAW: you compose the score - or bring it from your DAW.' })

  // --- the tour -----------------------------------------------------------------------------------
  await sectionTour(s, [
    ['1 · SONG', 'SONG - the two switch cards and the Writer model at the top, then the Song Brief.'],
    ['2 · WRITE', 'WRITE - the writer drafts the style and the lyrics, and ten titles; Plenio picks one no song of yours has yet.'],
    ['3 · TEXT', 'TEXT - Song Sheet · Text, in teal: the words YuE2 will sing.'],
    ['4 · DAW', 'DAW - Score Tools builds an empty score from the brief; you write the music in Song Sheet · DAW, in blue.'],
    ['5 · RENDER', 'RENDER - YuE2 renders exactly that score; Best Take keeps the take that sings its lyrics best.'],
    ['6 · FINISH', 'FINISH - Master and Export.'],
  ])
  const art = 'Above the render, COVER ART paints the song’s cover.'
  s.caption(art)
  await s.flyGroups(['COVER ART', '5 · RENDER'], 1100, 0.9)
  await s.spotlight(s.groupBox('COVER ART'), { ms: 2400, pad: 2 })
  await s.read(art, 3400)
  await switchCards(s)

  // --- the brief and the first run ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'The words',
    subtitle: 'The brief, the writer, and the first stop',
    steps: ['Brief', 'Write', 'Stop: text', 'Approve'],
  }, 4)
  s.chapter('Part 1 · The words')
  await s.flyNodes([BRIEF], 1200, 0.94)
  s.caption('The brief: the mode is “one song, stop to review” here - the run stops at each sheet.')
  await s.showCombo(BRIEF, 'mode', { read: 2600, browse: 2 })
  await s.wait(600)
  s.caption('lyrics idea: say what the song is about - the template gives its sound.')
  await s.replaceText(BRIEF, 'vocals.lyrics', IDEA, { delay: 36 })
  await s.wait(1200)
  s.caption('length: short. Tempo, key and meter come from the brief - or later from your sketch.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400, browse: 5 })
  await s.wait(900)
  await writerDemo(s, {
    text: 'Under the cards, the Writer model writes the words: Gemma 4 by default - or a local LLM from your machine.',
    uses: [WRITE],
    flows: 'It writes the style and the lyrics - and after the export it checks the words that were sung.',
  })
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at Song Sheet · Text: ⏸ waiting for your approval.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('The run stopped at Song Sheet · Text: ⏸ waiting for your approval.', 3800)

  await openSheet(s, TEXT, 'First the words: Song Sheet · Text’s card says “Edit lyrics & text”.')
  await tab(s, 'Lyrics', 'The lyrics, section by section. Edit anything you like.', { min: 5600 })
  await approve(s, 'Approve.')
  await showApproved(s, TEXT, '✓ approved. Run again: Score Tools builds an empty score from the brief, and the run stops at Song Sheet · DAW.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TOOLS]: STAGES[TOOLS] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · DAW - ⏸ waiting for your music.')
  await s.flyNodes([DAW], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · DAW - ⏸ waiting for your music.', 3400)

  // --- part 2: the music -------------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'The music',
    subtitle: 'A sketch from your DAW comes in - then it is yours to edit',
    steps: ['Tracks', 'Import MIDI', 'Tour', 'Play & sounds', 'Record', 'Files', 'Approve'],
  }, 4.5)
  s.chapter('Part 2 · The music')
  await openSheet(s, DAW, 'Song Sheet · DAW’s card: “Compose the score” - piano roll, chords, MIDI.')
  await maximize(s, '⛶ gives the editor the whole window.')
  const d = page.locator(DIALOG)
  const tracks = d.locator('.track-panel').first()
  if (await tracks.count()) {
    s.caption('Four tracks: Vocal and Instrument - the two melodies YuE2 reads - the Chords, and a Guide.')
    await s.spotlight(tracks, { ms: 3200, pad: 4 })
    await s.read('Four tracks: Vocal and Instrument - the two melodies YuE2 reads - the Chords, and a Guide.', 6000)
  }
  await s.say('The score from Score Tools is empty: one verse of rests, in the brief’s tempo and key.', 4600)

  s.caption('Write it here - or bring a sketch from your DAW: Import MIDI…')
  const importButton = d.locator('button', { hasText: 'Import MIDI' }).first()
  await s.spotlight(importButton, { ms: 1800, pad: 4 })
  await s.wait(1200)
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), s.click(importButton, { pause: 400 })])
  await chooser.setFiles(sketch)
  const dialog = page.locator('.midi-dialog')
  await dialog.waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForFunction(() => !document.querySelector('.midi-dialog .hint')?.textContent?.includes('Reading'), null, { timeout: 30000 })
  await s.wait(1200)
  s.caption('Nothing changes yet: the import shows what it found - every track of the file, with a role.')
  await s.spotlight(dialog.locator('table.tracks').first(), { ms: 3000, pad: 4 })
  await s.read('Nothing changes yet: the import shows what it found - every track of the file, with a role.', 5600)
  s.caption('Our sketch’s bass goes to the Guide: you hear it while you work, it is exported to MIDI - and never sent to YuE2.')
  const guideRow = dialog.locator('table.tracks tr', { hasText: 'Guide' }).first()
  if (await guideRow.count()) await s.spotlight(guideRow, { ms: 3000, pad: 4 })
  await s.read('Our sketch’s bass goes to the Guide: you hear it while you work, it is exported to MIDI - and never sent to YuE2.', 6400)
  const report = dialog.locator('ul.report').first()
  if (await report.count()) {
    s.caption('“What the import did” lists every change - quantising, chords, sections.')
    await s.spotlight(report, { ms: 2600, pad: 4 })
    await s.read('“What the import did” lists every change - quantising, chords, sections.', 4600)
  }
  s.caption('Insert: one undo step.')
  await s.click(dialog.locator('button', { hasText: 'Insert' }).first(), { pause: 500 })
  await dialog.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {})
  await s.wait(1800)

  s.chapter('Score editor · Tour')
  await s.say('The sketch is in: the melody, a second voice, the chords, the sections - in its own tempo and key.', 5600)
  await editorTour(s, { daw: true })
  s.chapter('Score editor · Fit the words')
  await fixSections(s)
  if (await trimSections(s)) {
    const lane = d.locator('.lyrics-lane').first()
    if (await lane.count()) {
      await scrollToVoice(s, 'vocal')
      const text = 'The lyrics lane: each line of the Text sheet over its phrase, each syllable over its note.'
      s.caption(text)
      await s.spotlight(lane, { ms: 3400, pad: 2 })
      await s.read(text, 5600)
    }
  }
  s.chapter('Score editor · Arrange bars')
  await barsDemo(s)
  s.chapter('Score editor · Playback')
  await cursorDemo(s)
  s.chapter('Score editor · Sounds and presets')
  await soundsDemo(s, { preset: 'Composing with a MIDI keyboard', daw: true })
  s.chapter('Score editor · Record with a MIDI keyboard')
  await recordDemo(s)
  s.chapter('Score editor · Files')
  await filesDemo(s)
  s.chapter('Part 2 · The music')
  await approve(s, 'Approve: exactly this score is what YuE2 gets - two voices and the chords. The Guide stays here.')
  await showApproved(s, DAW, '✓ approved. Press Run: YuE2 renders the song.')

  // --- part 3: the song ---------------------------------------------------------------------------
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [COVER]: '', [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'Done: your melody, your chords - sung by YuE2.', { group: '6 · FINISH', preview: PREVIEW })
  await coverArtShown(s)
  await sheetMusicSaved(s, EXPORT, 'Export also saved your score as sheet music - both voices, the chords and the lyrics, as a PDF next to the song.')
  await exportExtras(s, EXPORT)
  s.caption('Every further Run renders a new take of the same score.')
  await s.flyGroups(SECTIONS, 1600)
  await s.read('Every further Run renders a new take of the same score.', 3800)
  s.card('end', {
    title: 'Next: 6 · YuE2 · Song · Creative modes',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
