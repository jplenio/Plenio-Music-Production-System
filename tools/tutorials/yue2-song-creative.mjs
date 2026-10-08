// Tutorial 6 · YuE2 · Song · Creative modes (0.4.5, experimental): the writer model plans the
// arrangement. The brief's arrangement and genre closeness, the Writer model, Arrange and its seed; one
// song with its review stops - the style the mode wrote, the arrangement in Song Sheet · Score (its line
// with the badge, the details, the instrument line in the roll) - the rendered song and its sheet music;
// then another arrangement of the same song from the arrangement seed.

import { arrangementDemo, sheetMusicSaved, showApproved } from './lib/scenes.mjs'
import { approve, maximize, openSheet, tab } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 6 - YuE2 Song creative modes',
  template: '1 · YuE2 · Song',
}

// the template's nodes by title or type (example_workflows/1 · YuE2 · Song.json)
const BRIEF = 'PlenioSongBrief', TEXT = 'Song Sheet · Text', SCORE = 'Song Sheet · Score', WRITER = 'Writer model'
const WRITE = 'Plenio · Write Song', PLAN = 'Plenio · YuE2 Plan', ARRANGE = 'Arrange', SEED = 'Arrangement seed'
const RENDER = 'Plenio · YuE2 Render', MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const GROUPS = {
  [WRITE]: '2 · WRITE', [TEXT]: '3 · TEXT', [PLAN]: '4 · SCORE', PlenioScoreTools: '4 · SCORE', [ARRANGE]: '4 · SCORE',
  [SCORE]: '4 · SCORE', 'Take seed': '5 · RENDER', [RENDER]: '5 · RENDER', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH',
  [EXPORT]: '6 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer drafts title, style and lyrics - with the hints of the dramatic mode.',
  [PLAN]: 'YuE2 plans the melody and the chords as a score.',
  [ARRANGE]: 'Arrange: the writer answers with a section plan, Plenio writes the notes and checks the score.',
  [RENDER]: 'YuE2 renders the song from the lyrics and the arranged score.',
  [MASTER]: 'Master and Export finish the song.',
}
const DESCRIPTION = 'A night drive along the coast after a long goodbye, from quiet doubt to a chorus that opens up like the sea.'

export default async function songCreative(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">6 ·</span> YuE2 · Song · Creative modes',
    subtitle: 'The writer model plans the arrangement, Plenio writes the notes - an experimental feature to play with',
    foot: 'Plenio Music Production System 0.4.5 for ComfyUI',
  }, 5)
  s.card('chapter', {
    kicker: 'Before we start', part: 'Experimental', title: 'Made for experimenting',
    subtitle: 'Creative modes are new in 0.4.5 and can give unexpected results - try a mode, listen, keep what you like',
    steps: ['Choose a mode', 'Listen', 'Edit or run again', 'Keep what you like'],
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
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="YuE2"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('1 · YuE2 · Song', { exact: true }).first()
  s.caption('Creative modes live in the song templates - here 1 · YuE2 · Song, where they reach furthest.')
  await s.hover(card, { fy: -4 })
  await s.wait(2400)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioSongBrief'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- what is new --------------------------------------------------------------------------------
  s.chapter('The creative parts of the template')
  await s.flyGroups(['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · SCORE', '5 · RENDER', '6 · FINISH'], 1400)
  await s.say('The template is the one from tutorial 1. Three parts make the creative modes.', 4000)
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('In the Song Brief: arrangement - marked experimental. simple, the default, lets YuE2 plan everything itself.')
  await s.spotlight(await s.widgetBox(BRIEF, 'arrangement'), { ms: 3000 })
  await s.read('In the Song Brief: arrangement - marked experimental. simple, the default, lets YuE2 plan everything itself.', 6000)
  s.caption('The creative modes: standard, varied, fantasy, sterile, many instruments, dramatic - or your own Markdown file.')
  await s.click(() => s.widgetBox(BRIEF, 'arrangement'), { fx: 0.72 })
  const menu = page.locator('.litecontextmenu').first()
  await menu.waitFor({ state: 'visible', timeout: 5000 })
  for (const name of ['standard', 'varied', 'fantasy', 'sterile', 'many instruments']) {
    await s.hover(page.locator('.litecontextmenu .litemenu-entry', { hasText: name }).first())
    await s.wait(650)
  }
  await s.read('The creative modes: standard, varied, fantasy, sterile, many instruments, dramatic - or your own Markdown file.', 4200)
  s.caption('We take “dramatic”: one long arc, from a quiet start to a big last chorus.')
  await s.click(page.locator('.litecontextmenu .litemenu-entry', { hasText: 'dramatic' }).first(), { pause: 400 })
  await s.read('We take “dramatic”: one long arc, from a quiet start to a big last chorus.', 4600)
  s.caption('genre closeness: how typical the song stays - 100 strictly typical, 70 with personal touches, 40 free within the genre, 0 any style.')
  await s.slide(BRIEF, 'genre_closeness', 55)
  await s.read('genre closeness: how typical the song stays - 100 strictly typical, 70 with personal touches, 40 free within the genre, 0 any style.', 7000)

  await s.flyNodes([WRITER], 1100, 0.9)
  s.caption('Writer model: one choice for every writing step - the lyrics and the arrangement. Gemma 4 by default, or any local LLM.')
  await s.spotlight(await s.widgetBox(WRITER, 'model'), { ms: 2800 })
  await s.read('Writer model: one choice for every writing step - the lyrics and the arrangement. Gemma 4 by default, or any local LLM.', 6400)

  await s.flyNodes([ARRANGE, SEED], 1100, 0.9)
  s.caption('In SCORE, the new block Arrange: after YuE2’s plan it asks the writer for a section plan - chords, the instrument line, energy, a key lift.')
  await s.read('In SCORE, the new block Arrange: after YuE2’s plan it asks the writer for a section plan - chords, the instrument line, energy, a key lift.', 7400)
  s.caption('The writer never writes notes: Plenio writes every note itself and checks the score. A plan it cannot use leaves the score as it was.')
  await s.read('The writer never writes notes: Plenio writes every note itself and checks the score. A plan it cannot use leaves the score as it was.', 7200)
  s.caption('Arrangement seed: another arrangement of the same song.')
  await s.spotlight(await s.widgetBox(SEED, 'seed'), { ms: 2400 })
  await s.read('Arrangement seed: another arrangement of the same song.', 3600)

  // --- part 1: one song, stop to review -------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A dramatic song',
    subtitle: 'One song with its review stops - the text, then the arranged score',
    steps: ['Brief', 'Write', 'Stop: text', 'Plan', 'Arrange', 'Stop: score', 'Render', 'Export'],
  }, 4.5)
  s.chapter('Part 1 · A dramatic song')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one song, stop to review” - we want to see what the mode does before anything is rendered.')
  await s.chooseCombo(BRIEF, 'mode', 'one song, stop to review', { read: 2400 })
  await s.wait(900)
  s.caption('Describe the song.')
  await s.click(await s.widgetBox(BRIEF, 'description'), { fx: 0.3, fy: 0.15 })
  await s.type(DESCRIPTION, { delay: 36 })
  await s.wait(1200)
  s.caption('length: short - about 1:30.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 1800 })
  await s.wait(900)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('Stop 1: Song Sheet · Text.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('Stop 1: Song Sheet · Text.', 2600)
  await openSheet(s, TEXT, 'Open it.')
  await tab(s, 'Style', 'Style: the sound YuE2 is asked for. The dramatic mode’s hints went into the writer’s prompt - the template keeps the song acoustic here.', { min: 6600 })
  await tab(s, 'Lyrics', 'Lyrics: the words YuE2 will sing - edit anything, your edit wins.', { min: 4400 })
  await approve(s, 'Approve.')
  await showApproved(s, TEXT, '✓ approved. Run again: YuE2 plans the score, and Arrange arranges it.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [PLAN]: STAGES[PLAN], [ARRANGE]: STAGES[ARRANGE] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · Score - the arranged score waits for your approval.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Score - the arranged score waits for your approval.', 4000)

  await openSheet(s, SCORE, 'Open the score.')
  await maximize(s, '⛶ gives the editor the whole window.')
  s.chapter('Part 1 · The arranged score')
  const status = await arrangementDemo(s)
  const sections = page.locator('.plenio-overlay .plenio-dialog li', { hasText: 'lyrics have sections' }).first()
  if (await sections.count()) {
    const warn = 'The sheet also warns: YuE2’s plan has fewer sections than the lyrics. Tutorial 1 shows how to fix sections - here we keep the plan.'
    s.caption(warn)
    await s.spotlight(sections, { ms: 3400, pad: 4 })
    await s.read(warn, 6600)
  }
  if (status === 'fallback' || status === 'unchanged') {
    const again = 'That is what experimental means: sometimes a plan does not fit. Approve YuE2’s score - or run Arrange again with another seed.'
    s.caption(again)
    await s.read(again, 6400)
  } else {
    const edit = 'Everything stays editable: chords, notes, sections - the arrangement is a starting point, not the last word.'
    s.caption(edit)
    await s.spotlight(page.locator('.plenio-overlay .plenio-dialog .roll-scroll').first(), { ms: 3000, pad: 2 })
    await s.read(edit, 5600)
  }
  await approve(s, 'Approve: this arranged score is what YuE2 renders.')
  await showApproved(s, SCORE, '✓ approved. Run again: YuE2 renders the song.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The dramatic song - listen to how it builds.')
  await sheetMusicSaved(s, EXPORT, 'Export also saved the sheet music: the arranged score with the lyrics as a PDF, next to the song.')

  // --- part 2: another arrangement ------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'Another arrangement',
    subtitle: 'The same song, the same melody - a new plan from the arrangement seed',
    steps: ['Seed + 1', 'Arrange', 'Stop: score', 'Render'],
  }, 4.5)
  s.chapter('Part 2 · Another arrangement')
  await s.flyNodes([ARRANGE, SEED], 1100, 0.9)
  s.caption('Not your taste? Change the arrangement seed: only Arrange and what follows run again - the lyrics and YuE2’s plan stay.')
  const seed = await s.widgetBox(SEED, 'seed')
  await s.spotlight(seed, { ms: 1800 })
  await s.click(seed, { fx: 0.96, pause: 400 })
  await s.wait(900)
  await s.read('Not your taste? Change the arrangement seed: only Arrange and what follows run again - the lyrics and YuE2’s plan stay.', 6400)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [ARRANGE]: 'The writer plans again, with the new seed.' }, groups: GROUPS })
  s.caption('The new score stops for review again.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('The new score stops for review again.', 3000)
  await openSheet(s, SCORE, 'Open it: a different arrangement of the same melody.')
  await maximize(s)
  const second = d(page).locator('.arrangement').first()
  if (await second.count()) {
    const text = 'Another plan from the same mode: open it and compare the sections with the first one - keep what you like, edit the rest.'
    s.caption(text)
    const summary = second.locator('summary').first()
    if (await summary.count()) await s.click(summary, { fx: 0.05, pause: 300 })
    await s.wait(700)
    await s.spotlight(second, { ms: 5200, pad: 4 })
    await s.read(text, 7600)
    if (await summary.count()) await s.click(summary, { fx: 0.05, pause: 200 })
  }
  await approve(s, 'Approve.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The same song with its new arrangement.')

  // --- the close ------------------------------------------------------------------------------------
  s.chapter('Tips')
  await s.flyNodes([BRIEF], 1100, 0.94)
  await s.say('Creative modes are experimental: try several modes and closeness values, and keep the takes you like. simple stays the dependable choice.', 7400)
  await s.say('Your own modes are Markdown files in user/plenio/arrangement: the instruments, the lines and the key changes a mode allows.', 6600)
  await s.say('A local LLM as the writer model is held to the plan’s format exactly - and answers from its cache when nothing changed.', 6400)
  s.card('end', {
    title: 'Next: 7 · YuE2 · Cover · Creative modes',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

const d = (page) => page.locator('.plenio-overlay .plenio-dialog')

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['6 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
    await s.listen(PREVIEW, { seconds: 20 })
  }
  await s.read(text, 4200)
}
