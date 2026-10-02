// Tutorial 2 · YuE2 · Cover (0.4): open the template, load a recording, one run straight through (new
// cover every run, instrumental), then one cover with its two review stops - Song Sheet · Score (the score
// editor: notes, the cursor with A/B against the source, a copied section that is kept, the files) and
// Song Sheet · Text (the transcribed words over their notes - the copied section sings them again - the
// score still editable there) - and the finished cover. The source is the repository's sample song.

import path from 'node:path'
import { arrangeDemo, cursorDemo, filesDemo, overview, showApproved } from './lib/scenes.mjs'
import { DIALOG, approve, maximize, noteEditing, openSheet, scrollToVoice, tab } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 2 - YuE2 Cover',
  template: '2 · YuE2 · Cover',
}

const SOURCE_FILE = ['assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3']

// the template's nodes by title or type (example_workflows/2 · YuE2 · Cover.json)
const SOURCE = 'Source recording', EXCERPT = 'Excerpt (optional)', BRIEF = 'PlenioCoverBrief'
const TRANSCRIBE = 'Plenio · Transcribe Score', SCORE = 'Song Sheet · Score', LYRICS = 'Transcribe Lyrics', WRITE = 'Plenio · Write Song'
const TEXT = 'Song Sheet · Text', TAKES = 'YuE2 Takes', CHECK = 'PlenioVocalCheck', MASTER = 'Plenio · Master'
const PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const GROUPS = {
  [TRANSCRIBE]: '3 · SCORE', PlenioScoreTools: '3 · SCORE', [SCORE]: '3 · SCORE',
  [LYRICS]: '4 · LYRICS', [WRITE]: '4 · LYRICS', [TEXT]: '5 · TEXT',
  [TAKES]: '6 · RENDER', [CHECK]: '6 · RENDER', [MASTER]: '7 · FINISH', [PREVIEW]: '7 · FINISH', [EXPORT]: '7 · FINISH',
}
const STAGES = {
  [TRANSCRIBE]: 'SheetSage2 transcribes the recording into a score: melody, chords, sections and tempo.',
  [LYRICS]: 'faster-whisper transcribes the sung words and places them into the score’s sections.',
  [TAKES]: 'YuE2 renders the cover from the score.',
  [CHECK]: 'Check Vocals listens to the take.',
  [MASTER]: 'Master and Export finish the cover.',
}

export default async function cover(s, { project }) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">2 ·</span> YuE2 · Cover',
    subtitle: 'A new version of a recording - transcribed, reviewed and rendered by YuE2',
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
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="YuE2"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('2 · YuE2 · Cover', { exact: true }).first()
  s.caption('2 · YuE2 · Cover makes a new version of a recording you own or may use.')
  await s.hover(card, { fy: -4 })
  await s.wait(2400)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioCoverBrief'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the tour -----------------------------------------------------------------------------------
  const all = ['1 · SOURCE', '2 · COVER', '3 · SCORE', '4 · LYRICS', '5 · TEXT', '6 · RENDER', '7 · FINISH']
  await s.flyGroups(all, 1400)
  await s.say('The template reads from left to right, in numbered groups.', 3000)
  const tour = [
    ['1 · SOURCE', 'SOURCE - the recording to cover.'],
    ['2 · COVER', 'COVER - the Cover Brief: the new style, and what happens to the vocals.'],
    ['3 · SCORE', 'SCORE - SheetSage2 transcribes the music into a score; Song Sheet · Score shows it.'],
    ['4 · LYRICS', 'LYRICS - the original words (speech recognition), new lyrics (the writer) or section tags.'],
    ['5 · TEXT', 'TEXT - Song Sheet · Text shows the lyrics and the style YuE2 gets.'],
    ['6 · RENDER', 'RENDER - YuE2 renders the cover; Check Vocals picks the best take.'],
    ['7 · FINISH', 'FINISH - Master brings it to -14 LUFS, Export writes the files.'],
  ]
  for (const [group, text] of tour) {
    s.caption(text)
    await s.flyGroups([group], 1000, 0.9)
    await s.read(text, 2600)
  }

  // --- the source ---------------------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new cover every run',
    subtitle: 'An instrumental version - the run goes straight through',
    steps: ['Source', 'Brief', 'Transcribe', 'Render', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new cover every run')
  await s.flyGroups(['1 · SOURCE'], 1200, 0.9)
  s.caption('Load the recording: “choose file to upload” in Source recording.')
  const upload = await s.widgetBox(SOURCE, 'upload')
  await s.spotlight(upload, { ms: 1800 })
  await s.wait(900)
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), s.click(upload, { pause: 400 })])
  await chooser.setFiles(path.join(project, ...SOURCE_FILE))
  await page.waitForFunction((key) => {
    const w = window.__tut.node(key).widgets.find((x) => x.name === 'audio')
    return w && String(w.value).includes('A Feeling With No Address')
  }, SOURCE, { timeout: 60000 })
  await s.wait(1500)
  s.caption('Our example: a 4-minute synth-pop song. Up to 5:00 works in one pass.')
  await s.wait(3600)
  s.caption('Longer songs: switch on Excerpt (select it, Ctrl+B) and cover one part at a time.')
  await s.spotlight(async () => s.page.evaluate((key) => {
    const r = window.__tut.nodeRect(key)
    const a = window.__tut.toScreen(r.x, r.y), b = window.__tut.toScreen(r.x + r.w, r.y + r.h)
    return { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y }
  }, EXCERPT), { ms: 2600 })
  await s.wait(4200)

  // --- the brief ----------------------------------------------------------------------------------
  await s.flyNodes([BRIEF], 1200, 0.94)
  await s.say('The Cover Brief says what the new version should be.', 2600)
  s.caption('mode: “new cover every run” - every run makes a different version, without stops.')
  await s.chooseCombo(BRIEF, 'mode', 'new cover every run', { read: 2600 })
  await s.wait(1200)
  s.caption('genre and mood: the new style.')
  await s.spotlight(await s.widgetBox(BRIEF, 'genre'), { ms: 2400 })
  await s.wait(2800)
  s.caption('vocals: “instrumental” - an instrument plays the melody.')
  await s.hover(await s.widgetBox(BRIEF, 'vocals'), { fx: 0.7 })
  await s.wait(3000)
  s.caption('harmony: keep the original chords, or let YuE2 re-harmonise.')
  await s.hover(await s.widgetBox(BRIEF, 'harmony'), { fx: 0.7 })
  await s.wait(3000)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the instrumental cover is in Preview (mastered).')
  s.caption('Press Run again for another version - the transcription is reused, only the new version renders.')
  await s.hover(page.locator('button', { hasText: /^\s*Run\s*$/ }).first())
  await s.wait(4200)

  // --- part 2: one cover, stop to review ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'One cover, stop to review',
    subtitle: 'With the original lyrics - you check the score and the words before anything is rendered',
    steps: ['Transcribe', 'Stop: score', 'Lyrics', 'Stop: text', 'Render', 'Master', 'Export'],
  }, 4.5)
  s.chapter('Part 2 · One cover, stop to review')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one cover, stop to review” - the run stops at both Song Sheets.')
  await s.chooseCombo(BRIEF, 'mode', 'one cover, stop to review', { read: 2400 })
  await s.wait(1000)
  s.caption('vocals: “original lyrics” - YuE2 sings the words of the recording.')
  await s.chooseCombo(BRIEF, 'vocals', 'original lyrics', { read: 2400 })
  await s.wait(1400)
  s.caption('voice: describe the singer.')
  await s.click(await s.widgetBox(BRIEF, 'vocals.voice'), { fx: 0.5 })
  await s.wait(500)
  await s.type('warm female voice', { delay: 60 })
  await s.keys('Enter', { labels: ['Enter'] })
  await s.wait(1400)

  s.caption('Press Run. The transcription from part 1 is reused.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TRANSCRIBE]: STAGES[TRANSCRIBE] }, groups: GROUPS })
  s.caption('Stop 1: Song Sheet · Score - ⏸ waiting for your approval.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 1: Song Sheet · Score - ⏸ waiting for your approval.', 3400)

  // stop 1: the score - the score editor
  await openSheet(s, SCORE, 'Open it with “Edit Song Sheet…”.')
  await maximize(s, '⛶ gives the editor the whole window.')
  await s.say('This sheet holds the score SheetSage2 transcribed: melody, chords, sections. The words come at the next stop - they follow the score.', 6400)
  s.chapter('Score editor · Overview')
  await overview(s)
  s.chapter('Score editor · Notes')
  await noteEditing(s)
  s.chapter('Score editor · Cursor and A/B')
  await cursorDemo(s, { source: true })
  s.chapter('Score editor · Arrange sections')
  await arrangeDemo(s)
  await s.say('With the original lyrics, the words follow their bars: the copied section will sing the same words again - you will see it at the next stop.', 6400)
  s.chapter('Score editor · Files')
  await filesDemo(s)
  s.chapter('Part 2 · One cover, stop to review')
  await approve(s, 'Approve: this score - with the extra section - is what the words are placed into, and what YuE2 renders.')
  await showApproved(s, SCORE, 'The node says ✓ approved at once. Run again: the words are transcribed, and the run stops at Song Sheet · Text.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [LYRICS]: STAGES[LYRICS] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · Text - ⏸ waiting for your approval.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Text - ⏸ waiting for your approval.', 3400)

  // stop 2: the text - the words over their notes, the score still editable
  await openSheet(s, TEXT, 'Open the text.')
  await tab(s, 'Score', 'The Score tab shows the transcribed words over the notes they are sung on.', { min: 4200 })
  await scrollToVoice(s, 'vocal')
  const lane = s.page.locator(DIALOG).locator('.lyrics-lane').first()
  if (await lane.count()) {
    const sung = 'Each line over its phrase - and the copied section sings the same words again. Double-click a line to correct it.'
    s.caption(sung)
    await s.spotlight(lane, { ms: 3600, pad: 2 })
    await s.read(sung, 5600)
  }
  const owner = s.page.locator(DIALOG).locator('.score-owner').first()
  if (await owner.count()) {
    const note = 'New: the score can still be changed here. Apply writes it into Song Sheet · Score and keeps these words with it.'
    s.caption(note)
    await s.spotlight(owner, { ms: 3400, pad: 4 })
    await s.read(note, 5400)
  }
  await tab(s, 'Lyrics', 'Lyrics: the transcribed words, section by section. Unsure words are marked - correct anything; your text wins.', { min: 6200 })
  await tab(s, 'Style', 'Style: the new style, with the voice from the brief.', { min: 4200 })
  await tab(s, 'Title & artwork', 'Title & artwork: the title and the prompt for the optional cover art.', { min: 4200 })
  await approve(s, 'Approve: exactly these words go to YuE2.')
  await showApproved(s, TEXT, '✓ approved at once. Run again: YuE2 renders the cover.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TAKES]: STAGES[TAKES], [CHECK]: STAGES[CHECK], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The approved cover is finished and exported.')
  s.caption('Every further Run renders a new take of the same approved cover.')
  await s.flyGroups(all, 1600)
  await s.read('Every further Run renders a new take of the same approved cover.', 3800)
  s.card('end', {
    title: 'Make it yours',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['7 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
  }
  await s.read(text, 4200)
}
