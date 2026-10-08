// Tutorial 7 · YuE2 · Cover · Creative modes (0.4.5, experimental): a cover re-arranged by the writer
// model, with new lyrics that keep the original's story. The Cover Brief's arrangement, song flow
// closeness and lyrics closeness, the Writer model, Arrange and its seed; one cover with its review stops
// - the arranged score against the original (A/B), the new words over the original melody - the rendered
// cover and its sheet music. The source is the repository's sample song.

import path from 'node:path'
import { arrangementDemo, sheetMusicSaved, showApproved } from './lib/scenes.mjs'
import { DIALOG, approve, maximize, openSheet, scrollToVoice, tab } from './lib/sheet.mjs'

export const meta = {
  name: 'Plenio tutorial 7 - YuE2 Cover creative modes',
  template: '2 · YuE2 · Cover',
}

const SOURCE_FILE = ['assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3']

// the template's nodes by title or type (example_workflows/2 · YuE2 · Cover.json)
const SOURCE = 'Source recording', BRIEF = 'PlenioCoverBrief', TRANSCRIBE = 'Plenio · Transcribe Score'
const SUNG = 'Sung Pitch (for the editor)', ARRANGE = 'Arrange', SEED = 'Arrangement seed', SCORE = 'Song Sheet · Score'
const LYRICS = 'Transcribe Lyrics', WRITE = 'Plenio · Write Song', WRITER = 'Writer model', TEXT = 'Song Sheet · Text'
const TAKES = 'YuE2 Takes', CHECK = 'PlenioVocalCheck', MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)'
const EXPORT = 'PlenioExportRelease'
const GROUPS = {
  [TRANSCRIBE]: '3 · SCORE', PlenioScoreTools: '3 · SCORE', [SUNG]: '3 · SCORE', [ARRANGE]: '3 · SCORE', [SCORE]: '3 · SCORE',
  [LYRICS]: '4 · LYRICS', [WRITE]: '4 · LYRICS', [TEXT]: '5 · TEXT', [TAKES]: '6 · RENDER', [CHECK]: '6 · RENDER',
  [MASTER]: '7 · FINISH', [PREVIEW]: '7 · FINISH', [EXPORT]: '7 · FINISH',
}
const STAGES = {
  [TRANSCRIBE]: 'SheetSage2 transcribes the recording into a score: melody, chords, sections and tempo.',
  [SUNG]: 'Sung Pitch separates the vocals once, for the curve in the editor.',
  [ARRANGE]: 'Arrange: the writer plans the sections anew, Plenio writes the notes - the melody stays.',
  [LYRICS]: 'The original words are transcribed - for the writer, who keeps their story.',
  [WRITE]: 'The writer drafts the new lyrics on the original melody.',
  [TAKES]: 'YuE2 renders the cover from the arranged score and the new lyrics.',
  [CHECK]: 'Check Vocals listens to the take.',
  [MASTER]: 'Master and Export finish the cover.',
}

export default async function coverCreative(s, { project }) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">7 ·</span> YuE2 · Cover · Creative modes',
    subtitle: 'A new arrangement of a recording, with new lyrics that keep its story - an experimental feature to play with',
    foot: 'Plenio Music Production System 0.4.5 for ComfyUI',
  }, 5)
  s.card('chapter', {
    kicker: 'Before we start', part: 'Experimental', title: 'Made for experimenting',
    subtitle: 'Creative modes are new in 0.4.5 and can give unexpected results - try a mode, listen, keep what you like',
    steps: ['Choose a mode', 'Set the sliders', 'Listen', 'Keep what you like'],
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
  s.caption('2 · YuE2 · Cover - the template from tutorial 2, now with creative modes.')
  await s.hover(card, { fy: -4 })
  await s.wait(2400)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioCoverBrief'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the source ---------------------------------------------------------------------------------
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
  s.caption('The example from tutorial 2: a 4-minute synth-pop song, sung in English.')
  await s.wait(3400)

  // --- the creative parts -------------------------------------------------------------------------
  s.chapter('The creative parts of the template')
  await s.flyNodes([BRIEF], 1200, 0.94)
  s.caption('In the Cover Brief: arrangement, marked experimental. simple, the default, keeps the transcribed score as it is.')
  await s.spotlight(await s.widgetBox(BRIEF, 'arrangement'), { ms: 3000 })
  await s.read('In the Cover Brief: arrangement, marked experimental. simple, the default, keeps the transcribed score as it is.', 6000)
  s.caption('A creative mode lets the writer model re-arrange every section. We take “many instruments”: a full ensemble.')
  await s.chooseCombo(BRIEF, 'arrangement', 'many instruments', { read: 2200 })
  await s.read('A creative mode lets the writer model re-arrange every section. We take “many instruments”: a full ensemble.', 3000)
  s.caption('song flow closeness: how close the music stays to the original - 100 exactly, 80 chords and key stay, 50 recognisable, 20 a free version.')
  await s.slide(BRIEF, 'song_flow_closeness', 50)
  await s.read('song flow closeness: how close the music stays to the original - 100 exactly, 80 chords and key stay, 50 recognisable, 20 a free version.', 7400)
  s.caption('Whatever the slider says: the melody and the form always stay - they make it a cover.')
  await s.read('Whatever the slider says: the melody and the form always stay - they make it a cover.', 4600)
  s.caption('vocals: “new lyrics” - YuE2 sings new words on the original melody.')
  await s.chooseCombo(BRIEF, 'vocals', 'new lyrics', { read: 2200 })
  await s.wait(900)
  s.caption('voice: describe the singer.')
  await s.click(await s.widgetBox(BRIEF, 'vocals.voice'), { fx: 0.5 })
  await s.wait(500)
  await s.type('warm male voice', { delay: 60 })
  await s.keys('Enter', { labels: ['Enter'] })
  await s.wait(1200)
  s.caption('lyrics closeness: how close the new words stay to the original’s - 0 not at all, 30 its mood, 60 its story in new words, 90 its meaning line by line.')
  await s.slide(BRIEF, 'lyrics_closeness', 70)
  await s.read('lyrics closeness: how close the new words stay to the original’s - 0 not at all, 30 its mood, 60 its story in new words, 90 its meaning line by line.', 7800)
  s.caption('harmony: “keep original chords” - the arrangement recolours them, and YuE2 follows the chords.')
  await s.spotlight(await s.widgetBox(BRIEF, 'harmony'), { ms: 2600 })
  await s.read('harmony: “keep original chords” - the arrangement recolours them, and YuE2 follows the chords.', 5200)

  await s.flyNodes([ARRANGE, SEED, SUNG], 1100, 0.9)
  s.caption('In SCORE, the new block Arrange: the writer answers with a plan for every section, Plenio writes the notes and checks the score.')
  await s.read('In SCORE, the new block Arrange: the writer answers with a plan for every section, Plenio writes the notes and checks the score.', 7000)
  await s.flyNodes([WRITER], 1100, 0.9)
  s.caption('Writer model: the same writer for the new lyrics and the arrangement - Gemma 4, or a local LLM.')
  await s.spotlight(await s.widgetBox(WRITER, 'model'), { ms: 2600 })
  await s.read('Writer model: the same writer for the new lyrics and the arrangement - Gemma 4, or a local LLM.', 5600)

  // --- the cover ----------------------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'An arranged cover',
    subtitle: 'One cover with its review stops: the arranged score, then the new words',
    steps: ['Transcribe', 'Arrange', 'Stop: score', 'Lyrics', 'Stop: text', 'Render', 'Export'],
  }, 4.5)
  s.chapter('Part 1 · An arranged cover')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one cover, stop to review” - the default: the run stops at both Song Sheets.')
  await s.spotlight(await s.widgetBox(BRIEF, 'mode'), { ms: 2400 })
  await s.read('mode: “one cover, stop to review” - the default: the run stops at both Song Sheets.', 4600)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TRANSCRIBE]: STAGES[TRANSCRIBE], [SUNG]: STAGES[SUNG], [ARRANGE]: STAGES[ARRANGE] }, groups: GROUPS })
  s.caption('Stop 1: Song Sheet · Score - the arranged transcription.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 1: Song Sheet · Score - the arranged transcription.', 3600)

  await openSheet(s, SCORE, 'Open it.')
  await maximize(s, '⛶ gives the editor the whole window.')
  s.chapter('Part 1 · The arranged score')
  const status = await arrangementDemo(s, { cover: true })
  if (status === 'fallback' || status === 'unchanged') {
    const again = 'That is what experimental means: sometimes a plan does not fit. Approve the transcription - or run again with another arrangement seed.'
    s.caption(again)
    await s.read(again, 6400)
  }
  await abAgainstSource(s)
  await approve(s, 'Approve: the new lyrics are written for this score.')
  await showApproved(s, SCORE, '✓ approved. Run again: the original words are transcribed, the writer writes the new ones.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [LYRICS]: STAGES[LYRICS], [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · Text - the new lyrics.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Text - the new lyrics.', 3000)

  await openSheet(s, TEXT, 'Open it.')
  await tab(s, 'Lyrics', 'Lyrics: new words, section by section - with lyrics closeness 70 they tell the original’s story in their own way.', { min: 7000 })
  await tab(s, 'Score', 'The Score tab: the new words over the original melody, each line where it is sung.', { min: 4800 })
  await scrollToVoice(s, 'vocal')
  await s.wait(1600)
  await tab(s, 'Style', 'Style: the mode asked for a full ensemble, with the voice from the brief.', { min: 5000 })
  await approve(s, 'Approve.')
  await showApproved(s, TEXT, '✓ approved. Run again: YuE2 renders the cover.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TAKES]: STAGES[TAKES], [CHECK]: STAGES[CHECK], [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The arranged cover, with its new lyrics. Listen for the fuller arrangement.')
  await sheetMusicSaved(s, EXPORT, 'Export saved the sheet music too: the arranged score with the new lyrics, as a PDF next to the cover.')

  // --- the close ----------------------------------------------------------------------------------
  s.chapter('Tips')
  await s.flyNodes([BRIEF], 1100, 0.94)
  await s.say('Creative modes are experimental: the plan can surprise. Try other modes, other closeness values, another arrangement seed - and keep what you like.', 7600)
  await s.say('song flow closeness 100 keeps the original exactly: the writer is not even asked. And lyrics closeness 0 writes new lyrics as before, without the original’s.', 7600)
  await s.say('Above 90, lyrics closeness keeps the meaning line by line - a singable translation, when you choose another language.', 6400)
  s.card('end', {
    title: 'Make it yours',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

// A/B against the original: the transcribed (and arranged) notes and the source, bar by bar.
async function abAgainstSource(s) {
  const d = s.page.locator(DIALOG)
  const both = d.locator('.transport .hear button', { hasText: 'both' }).first()
  if (!(await both.count())) return
  const text = 'Compare with the original: “both” plays the source under the notes, A/B switches between them at once.'
  s.caption(text)
  await s.click(both, { pause: 300 })
  const play = d.locator('button', { hasText: '▶ play' }).first()
  const at = await s.click(play, { pause: 300 })
  await s.wait(4000)
  await s.click(d.locator('.transport button', { hasText: 'A/B' }).first(), { pause: 300 })
  await s.wait(3500)
  await s.click({ x: at.x, y: at.y, width: 0, height: 0 }, { pause: 200 })
  await s.read(text, 2000)
}

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['7 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
    await s.listen(PREVIEW, { seconds: 22 })
  }
  await s.read(text, 4200)
}
