// Tutorial 3 · MiniMax · Song: open the template, one run straight through (new song every run), then one
// song with its review stop - the Song Sheet (the caption in three parts, the lyrics, the exact token
// budget, Approve) - and the finished song. MiniMax Music 3 takes no score, so there is one sheet.

import { showApproved } from './lib/scenes.mjs'
import { approve, maximize, openSheet, tab } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 3 - MiniMax Song',
  template: '3 · MiniMax · Song',
}

// the template's nodes by title or type (example_workflows/3 · MiniMax · Song.json)
const BRIEF = 'PlenioSongBrief', SHEET = 'Song Sheet', WRITE = 'Plenio · Write Song', RENDER = 'Plenio · MiniMax Render'
const REFINE = 'Refine (48 kHz)', MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const MODEL = 'Plenio · MiniMax Model', WRITER = 'Writer model'
const GROUPS = {
  [WRITE]: '2 · WRITE', 'Draft seed': '2 · WRITE', [SHEET]: '3 · SHEET', [MODEL]: 'MUSIC MODEL', 'Take seed': '4 · RENDER',
  [RENDER]: '4 · RENDER', [REFINE]: 'REFINE (48 kHz)', [MASTER]: '5 · FINISH', [PREVIEW]: '5 · FINISH', [EXPORT]: '5 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the title, the caption and the lyrics.',
  [RENDER]: 'MiniMax Music 3 renders the song from the caption and the lyrics.',
  [REFINE]: 'Refine brings the take to 48 kHz.',
  [MASTER]: 'Master and Export finish the song.',
}
const DESCRIPTION = 'A warm late-night jazz-pop song about a city that never quite sleeps, with soft piano and brushed drums.'

export default async function minimax(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">3 ·</span> MiniMax · Song',
    subtitle: 'A new song with MiniMax Music 3 - in one run, or with a review stop',
    foot: 'Plenio Music Production System 0.4.5 for ComfyUI',
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
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="MiniMax"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('3 · MiniMax · Song', { exact: true }).first()
  s.caption('3 · MiniMax · Song writes a new song and renders it with MiniMax Music 3.')
  await s.hover(card, { fy: -4 })
  await s.wait(2600)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioSongBrief'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the tour -----------------------------------------------------------------------------------
  const all = ['1 · SONG', '2 · WRITE', '3 · SHEET', '4 · RENDER', '5 · FINISH']
  await s.flyGroups(all, 1400)
  await s.say('Five groups, from left to right.', 2600)
  const tour = [
    ['1 · SONG', 'SONG - the Song Brief: what the song should be.'],
    ['2 · WRITE', 'WRITE - the writer drafts the title, a caption and the lyrics.'],
    ['3 · SHEET', 'SHEET - the Song Sheet: exactly what MiniMax gets. MiniMax takes no score, so there is one sheet.'],
    ['4 · RENDER', 'RENDER - MiniMax Music 3 renders the song.'],
    ['MUSIC MODEL', 'MUSIC MODEL - the MiniMax files: diffusion model, text encoder and decoder.'],
    ['REFINE (48 kHz)', 'REFINE - brings the take to 48 kHz.'],
    ['5 · FINISH', 'FINISH - Master brings it to -14 LUFS, Export writes the files.'],
  ]
  for (const [group, text] of tour) {
    s.caption(text)
    await s.flyGroups([group], 1000, 0.9)
    await s.read(text, 2600)
  }

  // --- part 1: a new song every run ------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new song every run',
    subtitle: 'The run goes straight through - no stops',
    steps: ['Brief', 'Write', 'Render', 'Refine', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new song every run')
  await s.flyNodes([BRIEF], 1200, 0.94)
  s.caption('The Song Brief works as in the YuE2 templates. mode: “new song every run”.')
  await s.chooseCombo(BRIEF, 'mode', 'new song every run', { read: 2600 })
  await s.wait(1200)
  s.caption('Describe the song in your own words.')
  await s.click(await s.widgetBox(BRIEF, 'description'), { fx: 0.3, fy: 0.15 })
  await s.type(DESCRIPTION, { delay: 36 })
  await s.wait(1200)
  s.caption('length: short. MiniMax may end a song a little earlier than asked.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400 })
  await s.wait(1200)
  s.caption('arrangement: MiniMax takes no score, so a creative mode (experimental) shapes only the writing here - simple is fine.')
  await s.spotlight(await s.widgetBox(BRIEF, 'arrangement'), { ms: 2600 })
  await s.read('arrangement: MiniMax takes no score, so a creative mode (experimental) shapes only the writing here - simple is fine.', 6000)
  s.caption('The Writer model writes caption and lyrics: Gemma 4 by default - or a local LLM from your machine.')
  await s.flyNodes([WRITER], 1000, 0.9)
  await s.spotlight(await s.widgetBox(WRITER, 'model'), { ms: 2400 })
  await s.read('The Writer model writes caption and lyrics: Gemma 4 by default - or a local LLM from your machine.', 4800)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the finished song is in Preview (mastered).')
  s.caption('Run again for another song - or set a number next to Run for a whole series.')
  await s.hover(page.locator('button', { hasText: /^\s*Run\s*$/ }).first())
  await s.wait(3800)

  // --- part 2: one song, stop to review ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'One song, stop to review',
    subtitle: 'The run stops at the Song Sheet - you check the caption and the lyrics first',
    steps: ['Brief', 'Write', 'Stop: sheet', 'Render', 'Refine', 'Export'],
  }, 4.5)
  s.chapter('Part 2 · One song, stop to review')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one song, stop to review” - the run stops at the Song Sheet.')
  await s.chooseCombo(BRIEF, 'mode', 'one song, stop to review', { read: 2400 })
  await s.wait(1400)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at the Song Sheet: ⏸ waiting for your approval.')
  await s.flyNodes([SHEET], 1100, 0.9)
  await s.read('The run stopped at the Song Sheet: ⏸ waiting for your approval.', 4200)

  await openSheet(s, SHEET, 'Open it with “Edit Song Sheet…”.')
  await maximize(s, '⛶ gives the editor the whole window.')
  await tab(s, 'Caption', 'Caption: MiniMax reads it in three parts - Global Metadata (tempo, key, genre), Vocal Details and Arrangement.', { min: 7600 })
  await tab(s, 'Lyrics', 'Lyrics: section by section. MiniMax sings about one line every five seconds.', { min: 5600 })
  const budget = page.locator('.plenio-overlay').getByText(/token/i).first()
  if (await budget.count()) {
    s.caption('The budget: caption and lyrics share 5,000 tokens. The run counts them exactly and stops before rendering if they do not fit.')
    await s.spotlight(budget, { ms: 3000, pad: 6 })
    await s.read('The budget: caption and lyrics share 5,000 tokens. The run counts them exactly and stops before rendering if they do not fit.', 6400)
  }
  await tab(s, 'Title & artwork', 'Title & artwork: the title and the prompt for the optional cover art.', { min: 4200 })
  await approve(s, 'Approve: exactly this caption and these lyrics go to MiniMax.')
  await showApproved(s, SHEET, 'The node says ✓ approved at once. Run again: MiniMax renders the approved song.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [REFINE]: STAGES[REFINE], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The approved song is finished and exported.')
  s.caption('Every further Run renders a new take of the same approved song.')
  await s.flyGroups(all, 1600)
  await s.read('Every further Run renders a new take of the same approved song.', 3800)
  s.card('end', {
    title: 'Next: 4 · Enhance & Master',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['5 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
    await s.listen(PREVIEW)
  }
  await s.read(text, 4200)
}
