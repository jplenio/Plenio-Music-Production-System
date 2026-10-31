// Tutorial 7 · YuE2 · Cover · Creative modes (0.4.5, recorded again for 0.8.0, experimental): a cover
// re-arranged by the writer model - a free version (song flow closeness 30), whose melody Plenio writes
// anew over the writer's chords in the old rhythm - with new lyrics that keep the original's story. The
// Cover Brief's arrangement, song flow closeness and lyrics closeness, the Writer model, Arrange and its
// seed; one cover with its review stops - the arranged score against the original (A/B), the new words
// over the new melody - the rendered cover and its sheet music. The source is the repository's sample song.

import path from 'node:path'
import { abDemo, afterRun, arrangementDemo, intro, openTemplate, seedsFollowMode, sheetMusicSaved, showApproved, writerDemo } from './lib/scenes.mjs'
import { DIALOG, approve, maximize, openSheet, scrollToVoice, tab } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

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
const EXPORT = 'PlenioExportRelease', COVER = 'Cover Art'
const GROUPS = {
  [COVER]: 'COVER ART',
  [TRANSCRIBE]: '3 · SCORE', PlenioScoreTools: '3 · SCORE', [SUNG]: '3 · SCORE', [ARRANGE]: '3 · SCORE', [SCORE]: '3 · SCORE',
  [LYRICS]: '4 · LYRICS', [WRITE]: '4 · LYRICS', [TEXT]: '5 · TEXT', [TAKES]: '6 · RENDER', [CHECK]: '6 · RENDER',
  [MASTER]: '7 · FINISH', [PREVIEW]: '7 · FINISH', [EXPORT]: '7 · FINISH',
}
const STAGES = {
  [TRANSCRIBE]: 'SheetSage2 transcribes the recording into a score: melody, chords, sections and tempo.',
  [SUNG]: 'Sung Pitch separates the vocals once, for the curve in the editor.',
  [ARRANGE]: 'Arrange: the writer plans the sections anew, Plenio writes the notes and fits the melody to the new chords.',
  [LYRICS]: 'The original words are transcribed - for the writer, who keeps their story.',
  [WRITE]: 'The writer drafts the new lyrics on the cover’s melody - its rhythm is the original’s.',
  [TAKES]: 'YuE2 renders the cover from the arranged score and the new lyrics.',
  [CHECK]: 'Check Vocals listens to the take.',
  [COVER]: '',
  [MASTER]: 'Master and Export finish the cover.',
}

export default async function coverCreative(s, { project }) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">7 ·</span> YuE2 · Cover · Creative modes',
    subtitle: 'A new arrangement of a recording, with new lyrics that keep its story - an experimental feature to play with',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 7 · YuE2 · Cover · Creative modes',
    items: [
      'Creative modes for covers',
      'Part 1 · An arranged cover with new lyrics',
      'Make it yours',
    ],
  })
  s.card('chapter', {
    kicker: 'Before we start', part: 'Experimental', title: 'Made for experimenting',
    subtitle: 'Creative modes are experimental and can give unexpected results - try a mode, listen, keep what you like',
    steps: ['Choose a mode', 'Set the sliders', 'Listen', 'Keep what you like'],
  }, 5)

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, { name: '2 · YuE2 · Cover', what: '2 · YuE2 · Cover - the template from tutorial 2, now with creative modes.', type: 'PlenioCoverBrief' })

  // --- the source ---------------------------------------------------------------------------------
  await s.flyNodes([SOURCE], 1200, 0.9)
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
  s.caption('In the Cover Brief: arrangement, marked experimental. off, the default, keeps the transcribed score as it is.')
  await s.spotlight(await s.widgetBox(BRIEF, 'arrangement'), { ms: 3000 })
  await s.read('In the Cover Brief: arrangement, marked experimental. off, the default, keeps the transcribed score as it is.', 6000)
  s.caption('A creative mode lets the writer model re-arrange every section. We take “many instruments”: a full ensemble.')
  await s.chooseCombo(BRIEF, 'arrangement', 'many instruments', { read: 2200 })
  await s.read('A creative mode lets the writer model re-arrange every section. We take “many instruments”: a full ensemble.', 3000)
  // 1.0.0: the brief's panel says what the chosen mode does
  const modeLine = page.locator('.plenio-brief-template .mode').first()
  await modeLine.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await modeLine.isVisible().catch(() => false)) {
    s.caption('The line under the brief says what the chosen mode does.')
    await s.spotlight(modeLine, { ms: 3200, pad: 6 })
    await s.read('The line under the brief says what the chosen mode does.', 4200)
  }
  s.caption('song flow closeness: how close the music stays to the original - 100 exactly, 80 chords, key and melody stay, 50 recognisable, 20 a free version.')
  await s.read('song flow closeness: how close the music stays to the original - 100 exactly, 80 chords, key and melody stay, 50 recognisable, 20 a free version.', 7400)
  s.caption('Below 80 the melody follows the new chords: from 50 only its notes that clash move, below 50 Plenio writes it anew.')
  await s.read('Below 80 the melody follows the new chords: from 50 only its notes that clash move, below 50 Plenio writes it anew.', 7000)
  s.caption('We take 30: a free version - the writer’s bold chords, and a new melody over them.')
  await s.slide(BRIEF, 'song_flow_closeness', 30)
  await s.read('We take 30: a free version - the writer’s bold chords, and a new melody over them.', 4800)
  s.caption('Whatever the slider says: the form always stays, and the sung melody keeps its rhythm - every syllable keeps its note.')
  await s.read('Whatever the slider says: the form always stays, and the sung melody keeps its rhythm - every syllable keeps its note.', 5600)
  s.caption('vocals: “new lyrics” - YuE2 sings new words on the cover’s melody.')
  await s.chooseCombo(BRIEF, 'vocals', 'new lyrics', { read: 2200, browse: 3 })
  await s.wait(900)
  s.caption('voice: pick one from the list - or “✎ type your own …”.')
  await s.ownValue(BRIEF, 'vocals.voice', 'warm male voice', { read: 1600 })
  await s.wait(1200)
  s.caption('lyrics closeness: how close the new words stay to the original’s - 0 not at all, 30 its mood, 60 its story in new words, 90 its meaning line by line.')
  await s.slide(BRIEF, 'lyrics_closeness', 70)
  await s.read('lyrics closeness: how close the new words stay to the original’s - 0 not at all, 30 its mood, 60 its story in new words, 90 its meaning line by line.', 7800)
  s.caption('harmony: “keep original chords” - the writer builds its new chords on them, and YuE2 follows the chords.')
  await s.showCombo(BRIEF, 'harmony', { read: 2400, browse: 2 })
  await s.read('harmony: “keep original chords” - the writer builds its new chords on them, and YuE2 follows the chords.', 2600)

  await s.flyNodes([ARRANGE, SEED, SUNG], 1100, 0.9)
  s.caption('In SCORE, the block Arrange: the writer answers with a plan for every section, Plenio writes the notes and checks the score.')
  await s.read('In SCORE, the block Arrange: the writer answers with a plan for every section, Plenio writes the notes and checks the score.', 7000)
  await writerDemo(s, {
    text: 'Writer model, at the start under the cards: the same writer for the new lyrics and the arrangement - Gemma 4, or a local LLM.',
    uses: [WRITE, ARRANGE],
    flows: 'It plans the arrangement and writes the new lyrics.',
  })

  // --- the cover ----------------------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'An arranged cover',
    subtitle: 'One cover with its review stops: the arranged score, then the new words',
    steps: ['Transcribe', 'Arrange', 'Stop: score', 'Lyrics', 'Stop: text', 'Render', 'Export'],
  }, 4.5)
  s.chapter('Part 1 · An arranged cover')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one cover, stop to review” - the run stops at both Song Sheets, so we see what the mode did.')
  await s.chooseCombo(BRIEF, 'mode', 'one cover, stop to review', { read: 2400 })
  await s.wait(900)
  await seedsFollowMode(s)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TRANSCRIBE]: STAGES[TRANSCRIBE], [SUNG]: STAGES[SUNG], [ARRANGE]: STAGES[ARRANGE] }, groups: GROUPS })
  s.caption('Stop 1: Song Sheet · Score - the arranged transcription.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 1: Song Sheet · Score - the arranged transcription.', 3600)

  await openSheet(s, SCORE, 'Open it: “Edit the score”.')
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

  await openSheet(s, TEXT, 'Open it: “Edit lyrics & text”.')
  await tab(s, 'Lyrics', 'Lyrics: new words, section by section - with lyrics closeness 70 they tell the original’s story in their own way.', { min: 7000 })
  await tab(s, 'Score', 'The Score tab: the new words over the new melody, each line where it is sung.', { min: 4800 })
  await scrollToVoice(s, 'vocal')
  await s.wait(1600)
  await tab(s, 'Style', 'Style: the mode asked for a full ensemble, with the voice from the brief.', { min: 5000 })
  await approve(s, 'Approve.')
  await showApproved(s, TEXT, '✓ approved. Run again: YuE2 renders the cover.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TAKES]: STAGES[TAKES], [CHECK]: STAGES[CHECK], [COVER]: '', [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The arranged cover, with its new melody and new lyrics. Listen for the fuller arrangement.', { group: '7 · FINISH', preview: PREVIEW, seconds: 22 })
  await sheetMusicSaved(s, EXPORT, 'Export saved the sheet music too: the arranged score with the new lyrics, as a PDF next to the cover.')

  // --- the close ----------------------------------------------------------------------------------
  s.chapter('Tips')
  await s.flyNodes([BRIEF], 1100, 0.94)
  await s.say('Creative modes are experimental: the plan can surprise. Try other modes, other closeness values, another arrangement seed - and keep what you like.', 7600)
  await s.say('Closer to the original? At 50 only the melody notes that clash with a new chord move; from 80 the melody stays as it was.', 7000)
  await s.say('song flow closeness 100 keeps the original exactly: the writer is not even asked. And lyrics closeness 0 writes new lyrics as before, without the original’s.', 7600)
  await s.say('Above 90, lyrics closeness keeps the meaning line by line - a singable translation, when you choose another language.', 6400)
  s.card('end', {
    title: 'Make it yours',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

// A/B against the original: the arranged notes and the source, bar by bar - heard.
async function abAgainstSource(s) {
  await abDemo(s, {
    both: 'Compare with the original: “both” plays the source under the arranged notes.',
    source: 'A/B: the original alone, with its old melody …',
    notes: '… and the new arrangement alone, with the new melody.',
  })
}
