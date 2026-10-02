// Tutorial 5 · YuE2 · DAW: the writer drafts the words, you bring the music. One song with its two review
// stops - Song Sheet · Text (the lyrics, Approve) and Song Sheet · DAW, where a sketch from a DAW comes in
// with Import MIDI… (melody, second voice, chords, sections and a bass on the Guide track, which YuE2 never
// gets), plays from the cursor and is saved as a project - and the song YuE2 renders from exactly that
// score. The sketch is assets/Open Window Sketch.mid (an original 18-bar song in C made for this video;
// assets/Open Window Sketch.abc is its score), or $PLENIO_TUTORIAL_MIDI.

import path from 'node:path'
import { barsDemo, cursorDemo, overview, showApproved } from './lib/scenes.mjs'
import { DIALOG, approve, fixSections, maximize, openSheet, scrollToVoice, tab, trimSections } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 5 - YuE2 DAW',
  template: '5 · YuE2 · DAW',
}

// the template's nodes by title or type (example_workflows/5 · YuE2 · DAW.json)
const BRIEF = 'PlenioSongBrief', WRITE = 'Plenio · Write Song', TEXT = 'Song Sheet · Text'
const TOOLS = 'Score Tools · new score from brief', DAW = 'Song Sheet · DAW', RENDER = 'Plenio · YuE2 Render'
const MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const GROUPS = {
  [WRITE]: '2 · WRITE', [TEXT]: '3 · TEXT', [TOOLS]: '4 · DAW', [DAW]: '4 · DAW',
  'Take seed': '5 · RENDER', [RENDER]: '5 · RENDER', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH', [EXPORT]: '6 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the title, the style and the lyrics.',
  [TOOLS]: 'Score Tools builds an empty score from the brief.',
  [RENDER]: 'YuE2 renders exactly the approved score.',
  [MASTER]: 'Master and Export finish the song.',
}
const DESCRIPTION = 'A bright, hopeful pop song about opening the window on the first warm morning of spring.'

export default async function daw(s, { project }) {
  const page = s.page
  const sketch = process.env.PLENIO_TUTORIAL_MIDI || path.join(project, 'tools', 'tutorials', 'assets', 'Open Window Sketch.mid')
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">5 ·</span> YuE2 · DAW',
    subtitle: 'The writer drafts the words, you bring the music - YuE2 renders exactly your score',
    foot: 'Plenio Music Production System 0.4 for ComfyUI',
  }, 5)

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  s.caption('Open the template browser: Templates.')
  await s.click(page.getByRole('button', { name: 'Templates' }), { pause: 500 })
  await s.wait(2400)
  s.caption('Plenio’s templates: Extensions → Plenio-Music-Production-System.')
  await s.hover(page.getByText('Node Basics', { exact: true }).first())
  await page.mouse.wheel(0, 600)
  await s.wait(900)
  await s.click(page.getByText('Plenio-Music-Production-System', { exact: true }).first(), { pause: 400 })
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="DAW"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('5 · YuE2 · DAW', { exact: true }).first()
  s.caption('5 · YuE2 · DAW: you compose the score - or bring it from your DAW.')
  await s.hover(card, { fy: -4 })
  await s.wait(2600)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.title === 'Song Sheet · DAW'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the tour -----------------------------------------------------------------------------------
  const all = ['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · DAW', '5 · RENDER', '6 · FINISH']
  await s.flyGroups(all, 1400)
  await s.say('The template reads from left to right, in numbered groups.', 3000)
  const tour = [
    ['1 · SONG', 'SONG - the Song Brief.'],
    ['2 · WRITE', 'WRITE - the writer drafts the title, the style and the lyrics.'],
    ['3 · TEXT', 'TEXT - Song Sheet · Text: the words YuE2 will sing.'],
    ['4 · DAW', 'DAW - Score Tools builds an empty score from the brief; you write the music in Song Sheet · DAW.'],
    ['5 · RENDER', 'RENDER - YuE2 renders exactly that score.'],
    ['6 · FINISH', 'FINISH - Master and Export.'],
  ]
  for (const [group, text] of tour) {
    s.caption(text)
    await s.flyGroups([group], 1000, 0.9)
    await s.read(text, 2600)
  }

  // --- the brief and the first run ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'The words',
    subtitle: 'The brief, the writer, and the first stop',
    steps: ['Brief', 'Write', 'Stop: text', 'Approve'],
  }, 4)
  s.chapter('Part 1 · The words')
  await s.flyNodes([BRIEF], 1200, 0.94)
  s.caption('The brief: the mode is “one song, stop to review” here - the run stops at each sheet.')
  await s.spotlight(await s.widgetBox(BRIEF, 'mode'), { ms: 2400 })
  await s.wait(3600)
  s.caption('Describe the song.')
  await s.click(await s.widgetBox(BRIEF, 'description'), { fx: 0.3, fy: 0.15 })
  await s.type(DESCRIPTION, { delay: 36 })
  await s.wait(1200)
  s.caption('length: short. Tempo, key and meter come from the brief - or later from your sketch.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400 })
  await s.wait(1200)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at Song Sheet · Text: ⏸ waiting for your approval.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('The run stopped at Song Sheet · Text: ⏸ waiting for your approval.', 3800)

  await openSheet(s, TEXT, 'First the words: open Song Sheet · Text.')
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
    steps: ['Tracks', 'Import MIDI', 'Guide', 'Play', 'Save', 'Approve'],
  }, 4.5)
  s.chapter('Part 2 · The music')
  await openSheet(s, DAW, 'Open Song Sheet · DAW.')
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

  s.chapter('Score editor · The sketch')
  await s.say('The sketch is in: the melody, a second voice, the chords, the sections - in its own tempo and key.', 5600)
  await overview(s, { lyrics: true })
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
  s.chapter('Score editor · Files')
  const save = d.locator('.midi-tools button', { hasText: 'Save project' }).first()
  if (await save.count()) {
    s.caption('Save project keeps the score, the Guide notes and the lyrics in one file - Open project… brings them back, in any DAW sheet.')
    await s.spotlight(d.locator('.midi-tools').first(), { ms: 2600, pad: 4 })
    await s.hover(save)
    await s.read('Save project keeps the score, the Guide notes and the lyrics in one file - Open project… brings them back, in any DAW sheet.', 6000)
  }
  s.chapter('Part 2 · The music')
  await approve(s, 'Approve: exactly this score is what YuE2 gets - two voices and the chords. The Guide stays here.')
  await showApproved(s, DAW, '✓ approved. Press Run: YuE2 renders the song.')

  // --- part 3: the song ---------------------------------------------------------------------------
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'Done: your melody, your chords - sung by YuE2.')
  s.caption('Every further Run renders a new take of the same score.')
  await s.flyGroups(all, 1600)
  await s.read('Every further Run renders a new take of the same score.', 3800)
  s.card('end', {
    title: 'Make it yours',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['6 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
    await s.listen(PREVIEW)
  }
  await s.read(text, 4200)
}

