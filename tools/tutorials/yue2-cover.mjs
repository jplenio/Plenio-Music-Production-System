// Tutorial 2 · YuE2 · Cover (0.4): open the template, load a recording, one run straight through (new
// cover every run, instrumental), then one cover with its two review stops - Song Sheet · Score (the score
// editor: notes, the cursor with A/B against the source, a copied section that is kept, the files) and
// Song Sheet · Text (the transcribed words over their notes - the copied section sings them again - the
// score still editable there) - and the finished cover. The source is the repository's sample song.

import path from 'node:path'
import { afterRun, arrangeDemo, coverArtShown, cursorDemo, editorTour, exportExtras, filesDemo, fixMisheardWords, intro, masterDemo, openTemplate, sectionTour, seedsFollowMode, sheetMusicSaved, showApproved, soundsDemo, switchCards, writerDemo } from './lib/scenes.mjs'
import { DIALOG, approve, maximize, noteEditing, openSheet, scrollToVoice, tab } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 2 - YuE2 Cover',
  template: '2 · YuE2 · Cover',
}

const SOURCE_FILE = ['assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3']

// the template's nodes by title or type (example_workflows/2 · YuE2 · Cover.json)
const SOURCE = 'Source recording', EXCERPT = 'Excerpt (optional)', BRIEF = 'PlenioCoverBrief'
const TRANSCRIBE = 'Plenio · Transcribe Score', SCORE = 'Song Sheet · Score', LYRICS = 'Transcribe Lyrics', WRITE = 'Plenio · Write Song'
const TEXT = 'Song Sheet · Text', TAKES = 'YuE2 Takes', CHECK = 'PlenioVocalCheck', MASTER = 'Plenio · Master'
const PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease', ARRANGE = 'Arrange', SUNG = 'Sung Pitch (for the editor)'
const WRITER = 'Writer model', COVER = 'Cover Art', FIX = 'Fix Misheard Words'
const GROUPS = {
  [TRANSCRIBE]: '3 · SCORE', PlenioScoreTools: '3 · SCORE', [SUNG]: '3 · SCORE', [ARRANGE]: '3 · SCORE', [SCORE]: '3 · SCORE',
  [LYRICS]: '4 · LYRICS', [FIX]: '4 · LYRICS', [WRITE]: '4 · LYRICS', [TEXT]: '5 · TEXT', [TAKES]: '6 · RENDER', [CHECK]: '6 · RENDER',
  [COVER]: 'COVER ART', [MASTER]: '7 · FINISH', [PREVIEW]: '7 · FINISH', [EXPORT]: '7 · FINISH',
}
const STAGES = {
  [SUNG]: 'Sung Pitch separates the vocals once, for the curve in the editor.',
  [TRANSCRIBE]: 'SheetSage2 transcribes the recording into a score: melody, chords, sections and tempo.',
  [LYRICS]: 'Qwen3-ASR hears the sung words - in the recording and in its vocal stem - and keeps the surer hearing; the words go into the score’s sections.',
  [FIX]: 'Fix Misheard Words: the writer looks for words the recognition misheard.',
  [TAKES]: 'YuE2 renders the cover from the score.',
  [CHECK]: 'Check Vocals listens to the take.',
  [COVER]: '',
  [MASTER]: 'Master and Export finish the cover.',
}

export default async function cover(s, { project }) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">2 ·</span> YuE2 · Cover',
    subtitle: 'A new version of a recording - transcribed, reviewed and rendered by YuE2',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 2 · YuE2 · Cover',
    items: [
      'Load a recording you may use',
      'The Cover Brief: style, vocals, harmony, original notes',
      'Part 1 · A new cover every run - instrumental',
      'Part 2 · One cover, stop to review - the original lyrics',
    ],
  })

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, { name: '2 · YuE2 · Cover', what: '2 · YuE2 · Cover makes a new version of a recording you own or may use.', type: 'PlenioCoverBrief' })

  // --- the tour -----------------------------------------------------------------------------------
  const all = ['1 · SOURCE', '2 · COVER', '3 · SCORE', '4 · LYRICS', '5 · TEXT', '6 · RENDER', '7 · FINISH']
  await sectionTour(s, [
    ['1 · SOURCE', 'SOURCE - the two switch cards and the Writer model at the top, then the recording to cover.'],
    ['2 · COVER', 'COVER - beside it, the Cover Brief: the new style, and what happens to the vocals.'],
    ['3 · SCORE', 'SCORE - SheetSage2 transcribes the music into a score, Arrange can re-arrange it, Song Sheet · Score - violet - shows it.'],
    ['4 · LYRICS', 'LYRICS - the original words (speech recognition; the writer corrects misheard ones), new lyrics (the writer model) or section tags.'],
    ['5 · TEXT', 'TEXT - Song Sheet · Text, in teal: the lyrics and the style YuE2 gets.'],
    ['6 · RENDER', 'RENDER - YuE2 renders the cover; Check Vocals and Best Take pick the best take.'],
    ['7 · FINISH', 'FINISH - Master brings it to -14 LUFS, Export writes the files.'],
  ])
  const art = 'Above the render, COVER ART paints the cover; below the source, the MUSIC MODEL block holds YuE2 and its instrumental adapter.'
  s.caption(art)
  await s.flyGroups(['COVER ART', '6 · RENDER'], 1100, 0.9)
  await s.spotlight(s.groupBox('COVER ART'), { ms: 2400, pad: 2 })
  await s.wait(2400)
  await s.flyGroups(['MUSIC MODEL'], 1000, 0.6)
  await s.read(art, 2800)
  await switchCards(s)

  // --- the source ---------------------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new cover every run',
    subtitle: 'An instrumental version - the run goes straight through',
    steps: ['Source', 'Brief', 'Transcribe', 'Render', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new cover every run')
  await s.flyGroups(['1 · SOURCE'], 1200, 0.9)
  s.caption('Load the recording: “choose file to upload” in Source recording.')
  await s.flyNodes([SOURCE], 1000, 0.9)
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
  s.caption('mode: “new cover every run” - every run makes a different version, without stops; a queue of covers runs through.')
  await s.chooseCombo(BRIEF, 'mode', 'new cover every run', { read: 2600 })
  await s.wait(900)
  s.caption('template: the new style - its sound, genre and voice appear in the fields; change any of them.')
  await s.showCombo(BRIEF, 'template', { read: 2600, browse: 6 })
  s.caption('vocals: “instrumental” - an instrument plays the melody.')
  await s.chooseCombo(BRIEF, 'vocals', 'instrumental', { read: 2400, browse: 3 })
  await s.wait(600)
  s.caption('harmony: keep the original chords, or let YuE2 re-harmonise.')
  await s.showCombo(BRIEF, 'harmony', { read: 2400, browse: 2 })
  s.caption('arrangement: “off” keeps the transcription as it is. The experimental creative modes, with their sliders, are tutorial 7.')
  await s.showCombo(BRIEF, 'arrangement', { read: 2400, browse: 5 })
  await s.read('arrangement: “off” keeps the transcription as it is. The experimental creative modes, with their sliders, are tutorial 7.', 2400)
  const notes = 'original notes: 100 keeps every note of the original. Lower leaves out notes of the instruments and chords - YuE2 plays more freely.'
  s.caption(notes)
  const notesSlider = await s.widgetBox(BRIEF, 'original_notes')
  await s.spotlight(notesSlider, { ms: 3200, pad: 6 })
  await s.callout(notesSlider, 'down to about a quarter at 0', { ms: 3000 })
  await s.read(notes, 6200)
  await writerDemo(s, { uses: [WRITE, ARRANGE, FIX] })

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the instrumental cover is in Preview (mastered).', { group: '7 · FINISH', preview: PREVIEW })
  await coverArtShown(s)
  await masterDemo(s, { open: false })
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
  await s.wait(900)
  await seedsFollowMode(s)
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('vocals: “original lyrics” - YuE2 sings the words of the recording.')
  await s.chooseCombo(BRIEF, 'vocals', 'original lyrics', { read: 2400, browse: 3 })
  await s.wait(1400)
  s.caption('voice: pick one from the list - or “✎ type your own …”.')
  await s.ownValue(BRIEF, 'vocals.voice', 'warm female voice', { read: 1600 })
  await s.wait(1400)

  s.caption('Press Run. The transcription from part 1 is reused.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TRANSCRIBE]: STAGES[TRANSCRIBE] }, groups: GROUPS })
  s.caption('Stop 1: Song Sheet · Score - ⏸ waiting for your approval.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 1: Song Sheet · Score - ⏸ waiting for your approval.', 3400)

  // stop 1: the score - the score editor
  await openSheet(s, SCORE, 'Its card says what you edit here: open it with “Edit the score”.')
  await maximize(s, '⛶ gives the editor the whole window.')
  await s.say('This sheet holds the score SheetSage2 transcribed: melody, chords, sections. The words come at the next stop - they follow the score.', 6400)
  s.chapter('Score editor · Tour')
  await editorTour(s, { cover: true })
  s.chapter('Score editor · Notes')
  await noteEditing(s)
  s.chapter('Score editor · Cursor and the original')
  await cursorDemo(s, { source: true })
  s.chapter('Score editor · Sounds and presets')
  await soundsDemo(s, { preset: 'Cover: check the transcription' })
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
  await s.follow({ stages: { [LYRICS]: STAGES[LYRICS], [FIX]: STAGES[FIX] }, groups: GROUPS })
  await fixMisheardWords(s, { node: FIX })
  s.caption('Stop 2: Song Sheet · Text - ⏸ waiting for your approval.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Text - ⏸ waiting for your approval.', 3400)

  // stop 2: the text - the words over their notes, the score still editable
  await openSheet(s, TEXT, 'Open the text: “Edit lyrics & text”.')
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
    const note = 'The score can still be changed here. Apply writes it into Song Sheet · Score and keeps these words with it.'
    s.caption(note)
    await s.spotlight(owner, { ms: 3400, pad: 4 })
    await s.read(note, 5400)
  }
  await tab(s, 'Lyrics', 'Lyrics: the transcribed words, section by section. A word the writer corrected stands beside the word heard, unsure ones are marked - your text wins.', { min: 6800 })
  await tab(s, 'Style', 'Style: the new style, with the voice from the brief.', { min: 4200 })
  await tab(s, 'Title & artwork', 'Title & artwork: the title, picked from the writer’s ten - and the cover prompt, drawn from the original lyrics.', { min: 6000 })
  await approve(s, 'Approve: exactly these words go to YuE2.')
  await showApproved(s, TEXT, '✓ approved at once. Run again: YuE2 renders the cover.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TAKES]: STAGES[TAKES], [CHECK]: STAGES[CHECK], [COVER]: '', [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The approved cover is finished and exported.', { group: '7 · FINISH', preview: PREVIEW })
  await sheetMusicSaved(s, EXPORT, 'Export also saved the sheet music: your score with the original words under the notes, as a PDF next to the cover.')
  await exportExtras(s, EXPORT)
  s.caption('Every further Run renders a new take of the same approved cover.')
  await s.flyGroups(all, 1600)
  await s.read('Every further Run renders a new take of the same approved cover.', 3800)
  s.card('end', {
    title: 'Next: 3 · MiniMax · Song',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
