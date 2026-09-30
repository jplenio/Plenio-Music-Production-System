// Tutorial 1 · YuE2 · Song: open the template, one run straight through (new song every run), then
// one song with its two review stops (Song Sheet · Text: the tabs, Approve; Song Sheet · Score: the
// editing tools on an example, Approve) and the finished song.

import { approve, maximize, openSheet, scoreDemo, tab } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 1 - YuE2 Song',
  template: '1 · YuE2 · Song',
}

// the template's nodes by title or type (example_workflows/1 · YuE2 · Song.json)
const BRIEF = 'PlenioSongBrief', TEXT = 'Song Sheet · Text', SCORE = 'Song Sheet · Score'
const WRITE = 'Plenio · Write Song', PLAN = 'Plenio · YuE2 Plan', RENDER = 'Plenio · YuE2 Render', MASTER = 'Plenio · Master'
const PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const GROUPS = {
  [WRITE]: '2 · WRITE', [TEXT]: '3 · TEXT', [PLAN]: '4 · SCORE', 'PlenioScoreTools': '4 · SCORE', [SCORE]: '4 · SCORE',
  'Take seed': '5 · RENDER', [RENDER]: '5 · RENDER', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH', [EXPORT]: '6 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the title, the style and the lyrics.',
  [PLAN]: 'YuE2 plans the melody and the chords as a score.',
  [RENDER]: 'YuE2 renders the song from the lyrics and the score.',
  [MASTER]: 'Master and Export finish the song.',
}
const DESCRIPTION = 'A hopeful song about leaving a small town at sunrise, with the whole road still ahead.'

export default async function song(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">1 ·</span> YuE2 · Song',
    subtitle: 'Write, review and render a song with YuE2 - in one run, or with two review stops',
    foot: 'Plenio Music Production System 0.3 for ComfyUI',
  }, 5)

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  s.caption('Plenio adds six ready-made templates to ComfyUI. Open the template browser: Templates.')
  await s.click(page.getByRole('button', { name: 'Templates' }), { pause: 500 })
  await s.wait(2600)
  const plenio = page.getByText('Plenio-Music-Production-System', { exact: true }).first()
  s.caption('Plenio’s templates are listed under Extensions → Plenio-Music-Production-System.')
  await s.hover(page.getByText('Node Basics', { exact: true }).first())
  await page.mouse.wheel(0, 600)
  await s.wait(900)
  await s.click(plenio, { pause: 400 })
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="YuE2"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('1 · YuE2 · Song', { exact: true }).first()
  s.caption('1 · YuE2 · Song writes a new song and renders it with YuE2.')
  await s.hover(card, { fy: -4 })
  await s.wait(2200)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioSongBrief'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the tour -----------------------------------------------------------------------------------
  await s.flyGroups(['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · SCORE', '5 · RENDER', '6 · FINISH'], 1400)
  await s.say('The template reads from left to right, in numbered groups.', 3000)
  const tour = [
    ['1 · SONG', 'SONG - the Song Brief: what the song should be.'],
    ['2 · WRITE', 'WRITE - a local language model writes the title, the style and the lyrics.'],
    ['3 · TEXT', 'TEXT - Song Sheet · Text shows exactly what YuE2 will sing.'],
    ['4 · SCORE', 'SCORE - YuE2 plans the melody as a score; Song Sheet · Score shows it.'],
    ['5 · RENDER', 'RENDER - YuE2 renders the song.'],
    ['6 · FINISH', 'FINISH - Master brings it to -14 LUFS, Export writes the files.'],
  ]
  for (const [group, text] of tour) {
    s.caption(text)
    await s.flyGroups([group], 1000, 0.9)
    await s.read(text, 2600)
  }
  s.caption('Optional blocks - Stems, Refine and Cover Art - stay switched off until you need them.')
  await s.flyGroups(['STEMS (optional)', 'REFINE (optional)', 'COVER ART (optional)'], 1000, 0.9)
  await s.read('Optional blocks - Stems, Refine and Cover Art - stay switched off until you need them.')

  // --- part 1: a new song every run ------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new song every run',
    subtitle: 'The run goes straight through - no stops',
    steps: ['Brief', 'Write', 'Plan', 'Render', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new song every run')
  await s.flyNodes([BRIEF], 1200, 0.94)
  await s.say('Everything starts in the Song Brief.', 2400)
  s.caption('mode: “new song every run” - every run writes and renders a different song, without stops.')
  await s.chooseCombo(BRIEF, 'mode', 'new song every run', { read: 2600 })
  await s.wait(1200)
  s.caption('template: a starting point. Fields you leave empty are taken from it.')
  await s.spotlight(await s.widgetBox(BRIEF, 'template'), { ms: 2200 })
  await s.hover(await s.widgetBox(BRIEF, 'template'), { fx: 0.7 })
  await s.wait(3000)
  s.caption('Describe the song in your own words.')
  await s.click(await s.widgetBox(BRIEF, 'description'), { fx: 0.3, fy: 0.15 })
  await s.type(DESCRIPTION, { delay: 38 })
  await s.wait(1200)
  s.caption('length: from about 1:00 up to 6:00.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400 })
  await s.wait(900)
  s.caption('vocals: a sung song - or an instrumental.')
  await s.hover(await s.widgetBox(BRIEF, 'vocals'), { fx: 0.7 })
  await s.wait(2600)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the finished song is in Preview (mastered).')
  s.caption('Export wrote the mastered FLAC, the unmastered take and a release record to output/plenio.')
  await s.flyNodes([EXPORT], 1000, 0.9)
  await s.read('Export wrote the mastered FLAC, the unmastered take and a release record to output/plenio.', 4200)
  s.caption('Press Run again for another, different song - or set a number next to Run for a whole series.')
  const batch = page.locator('.actionbar input, .queue-button-group input, [data-testid="batch-count-edit"] input').first()
  if (await batch.count()) await s.spotlight(batch, { ms: 2600, pad: 10 })
  await s.hover(page.locator('button', { hasText: /^\s*Run\s*$/ }).first())
  await s.wait(3600)

  // --- part 2: one song, stop to review ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'One song, stop to review',
    subtitle: 'The run stops twice - you check and approve before anything is rendered',
    steps: ['Brief', 'Write', 'Stop: text', 'Plan', 'Stop: score', 'Render', 'Master', 'Export'],
  }, 4.5)
  s.chapter('Part 2 · One song, stop to review')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one song, stop to review” - the run stops at both Song Sheets.')
  await s.chooseCombo(BRIEF, 'mode', 'one song, stop to review', { read: 2400 })
  await s.wait(1400)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at Song Sheet · Text: ⏸ waiting for your approval. Nothing is rendered yet.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('The run stopped at Song Sheet · Text: ⏸ waiting for your approval. Nothing is rendered yet.', 4600)

  // stop 1: the text
  await openSheet(s, TEXT, 'Open it with “Edit Song Sheet…”.')
  await tab(s, 'Lyrics', 'Lyrics: the words YuE2 will sing, section by section ([Verse], [Chorus] …). Edit anything - your edit wins.', { min: 5200 })
  await tab(s, 'Style', 'Style: the genre, the instruments and the voice YuE2 is given.', { min: 4200 })
  await tab(s, 'Title & artwork', 'Title & artwork: the song’s title and the prompt for the optional cover art.', { min: 4200 })
  await approve(s, 'Approve: exactly these documents go on to the music model.')
  s.caption('Approved. Press Run again: YuE2 plans the score, and the run stops at the next sheet.')
  await s.wait(2600)
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [PLAN]: STAGES[PLAN] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · Score waits for your approval.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Score waits for your approval.', 3200)

  // stop 2: the score
  await openSheet(s, SCORE, 'Open the score.')
  await maximize(s, '⛶ gives the editor the whole window.')
  await scoreDemo(s)
  s.caption('We undid our experiments - the melody stays as YuE2 planned it. The Lyrics and Style tabs are here too.')
  await s.wait(4200)
  await approve(s, 'Approve: this score is what YuE2 will render.')
  s.caption('Run again: YuE2 renders the approved song.')
  await s.wait(2200)
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The approved song is finished and exported.')
  s.caption('Every further Run renders a new take of the same approved song.')
  await s.flyGroups(['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · SCORE', '5 · RENDER', '6 · FINISH'], 1600)
  await s.read('Every further Run renders a new take of the same approved song.', 3800)
  s.card('end', {
    title: 'Next: 2 · YuE2 · Cover',
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
  }
  await s.read(text, 4200)
}
