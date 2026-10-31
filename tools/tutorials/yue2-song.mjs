// Tutorial 1 · YuE2 · Song: open the template and walk its sections - one row of numbered sections, the
// HQ Mastering and Cover Art cards, the writer model at the start, Cover Art above the render -, one run
// straight through (new song every run: the brief's lists opened, the seeds, the cover, Export and the Master
// block with its stems), then one song with its review stops - Song Sheet · Text
// (the tabs, Approve), Song Sheet · Score (the score editor: a tour of every area, then the lyrics lane,
// notes, the cursor and playback, the sounds and presets, copy and paste, arranging - a copied chorus is
// kept - recording with a (simulated) MIDI keyboard and the files), the text sheet again with the lyrics
// that followed the chorus, the song - and continuing it later.

import { afterRun, arrangeDemo, barsDemo, clipboardDemo, continueDemo, coverArtShown, cursorDemo, editorTour, exportExtras, filesDemo, intro, lyricsDemo, masterDemo, openTemplate, recordDemo, sectionTour, seedsDemo, seedsFollowMode, sheetMusicSaved, showApproved, simulateKeyboard, soundsDemo, switchCards, writerDemo } from './lib/scenes.mjs'
import { alignSections, approve, fixSections, maximize, noteEditing, openSheet, tab } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 1 - YuE2 Song',
  template: '1 · YuE2 · Song',
}

// the template's nodes by title or type (example_workflows/1 · YuE2 · Song.json)
const BRIEF = 'PlenioSongBrief', TEXT = 'Song Sheet · Text', SCORE = 'Song Sheet · Score'
const WRITE = 'Plenio · Write Song', PLAN = 'Plenio · YuE2 Plan', RENDER = 'Plenio · YuE2 Render', MASTER = 'Plenio · Master'
const PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease', WRITER = 'Writer model', ARRANGE = 'Arrange'
const COVER = 'Cover Art', BEST = 'Best Take · lyrics fidelity'
const SECTIONS = ['1 · SONG', '2 · WRITE', '3 · TEXT', '4 · SCORE', '5 · RENDER', '6 · FINISH']
const GROUPS = {
  [WRITE]: '2 · WRITE', [TEXT]: '3 · TEXT', [PLAN]: '4 · SCORE', 'PlenioScoreTools': '4 · SCORE', [ARRANGE]: '4 · SCORE', [SCORE]: '4 · SCORE',
  'Take seed': '5 · RENDER', [RENDER]: '5 · RENDER', [COVER]: 'COVER ART', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH',
  [EXPORT]: '6 · FINISH', [BEST]: '5 · RENDER',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the style and the lyrics, and ten titles to pick from.',
  [PLAN]: 'YuE2 plans the melody and the chords as a score.',
  [RENDER]: 'YuE2 renders the song from the lyrics and the score.',
  [BEST]: 'Best Take hears both takes and keeps the one that sings more of its lyrics.',
  [COVER]: '',
  [MASTER]: 'Master and Export finish the song.',
}
const IDEA = 'A hopeful song about leaving a small town at sunrise, with the whole road still ahead.'

export default async function song(s) {
  const page = s.page
  await simulateKeyboard(s)
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">1 ·</span> YuE2 · Song',
    subtitle: 'Write, review and render a song with YuE2 - in one run, or with two review stops',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 1 · YuE2 · Song',
    items: [
      'The template, section by section',
      'The Song Brief: template, lists, lyrics, creativity',
      'Part 1 · A new song every run',
      'Part 2 · One song, stop to review',
      'Part 3 · The score editor',
    ],
  })

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, {
    name: '1 · YuE2 · Song',
    intro: 'Plenio adds six ready-made templates to ComfyUI. Open the template browser: Templates.',
    what: '1 · YuE2 · Song writes a new song and renders it with YuE2.',
  })

  // --- the tour -----------------------------------------------------------------------------------
  await sectionTour(s, [
    ['1 · SONG', 'SONG - at the top two switch cards and the Writer model, then the Song Brief: what the song should be.'],
    ['2 · WRITE', 'WRITE - the writer drafts the style and the lyrics, and ten titles; Plenio picks one no song of yours has yet.'],
    ['3 · TEXT', 'TEXT - Song Sheet · Text, in teal: exactly what YuE2 will sing. Here you edit the words.'],
    ['4 · SCORE', 'SCORE - YuE2 plans the melody as a score, Arrange can re-arrange it, and Song Sheet · Score shows it - violet: here you edit the score.'],
    ['5 · RENDER', 'RENDER - YuE2 renders the song; Best Take keeps the take that sings its lyrics best.'],
    ['6 · FINISH', 'FINISH - Master brings it to -14 LUFS, and Export writes the files.'],
  ])
  const art = 'Above the render, COVER ART paints the song’s cover - with a seed of its own.'
  s.caption(art)
  await s.flyGroups(['COVER ART', '5 · RENDER'], 1100, 0.9)
  await s.spotlight(s.groupBox('COVER ART'), { ms: 2800, pad: 2 })
  await s.read(art, 4200)
  await switchCards(s)

  // --- part 1: a new song every run ------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new song every run',
    subtitle: 'The run goes straight through - no stops',
    steps: ['Brief', 'Write', 'Plan', 'Render', 'Cover', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new song every run')
  await s.flyNodes([BRIEF], 1200, 0.94)
  await s.say('Everything starts in the Song Brief.', 2400)
  s.caption('mode: “new song every run” - every run writes and renders a different song, without stops.')
  await s.chooseCombo(BRIEF, 'mode', 'new song every run', { read: 2600 })
  await s.wait(900)
  s.caption('template: a starting point - its sound, genre, tempo, voice and an idea for the lyrics appear in the fields below.')
  await s.showCombo(BRIEF, 'template', { read: 3000, browse: 6 })
  await s.wait(400)
  const yours = 'Change any field: each list holds the values of all 250 templates - and “✎ type your own …” takes anything else.'
  s.caption(yours)
  await s.showCombo(BRIEF, 'genre', { read: 3200, browse: 4 })
  await s.read(yours, 2400)
  s.caption('description: how the song sounds - the template’s, yours to change.')
  await s.spotlight(await s.widgetBox(BRIEF, 'description'), { ms: 3000, pad: 6 })
  await s.wait(600)
  s.caption('length: from about 1:00 up to 6:00.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400, browse: 5 })
  await s.wait(700)
  s.caption('vocals: a sung song - or an instrumental.')
  await s.showCombo(BRIEF, 'vocals', { read: 2000, browse: 2 })
  await s.wait(500)
  const lyricsFrom = 'lyrics: the writer writes them from the idea below - or “my own”: your lyrics, sung exactly as written.'
  s.caption(lyricsFrom)
  await s.showCombo(BRIEF, 'vocals.lyrics_from', { read: 3200, browse: 2 })
  await s.read(lyricsFrom, 2000)
  s.caption('Say what the song is about.')
  await s.replaceText(BRIEF, 'vocals.lyrics', IDEA, { delay: 38 })
  await s.wait(1200)
  s.caption('arrangement: “off” - YuE2 plans melody, chords and instruments itself. The experimental creative modes are tutorial 6.')
  await s.showCombo(BRIEF, 'arrangement', { read: 2600, browse: 6 })
  await s.read('arrangement: “off” - YuE2 plans melody, chords and instruments itself. The experimental creative modes are tutorial 6.', 2600)
  const creativity = 'creativity: 100 is the default - bold, and dependable. Up to 200 dares more: more surprises, and more misses.'
  s.caption(creativity)
  const slider = await s.widgetBox(BRIEF, 'creativity')
  await s.spotlight(slider, { ms: 3000, pad: 6 })
  await s.callout(slider, '100 · the default', { ms: 3000 })
  await s.read(creativity, 5600)
  const fidelity = 'lyrics fidelity: standard renders one take; high a second, and Best Take keeps the one that sings more of the lyrics as written; highest a third, when neither sang 95 %. It takes longer.'
  s.caption(fidelity)
  await s.chooseCombo(BRIEF, 'lyrics_fidelity', 'high - best of 2 takes', { read: 3200, browse: 3 })
  await s.read(fidelity, 6400)
  await writerDemo(s, { uses: [WRITE, ARRANGE] })
  await seedsDemo(s, { plan: 'Plan seed' })

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the finished song is in Preview (mastered).', { group: '6 · FINISH', preview: PREVIEW })
  const kept = 'Best Take: what each take sang of its lyrics, and the one it kept - into the release record too.'
  s.caption(kept)
  await s.flyNodes([BEST], 1100, 0.85)
  await s.spotlight(s.nodeBox(BEST), { ms: 3600, pad: 4 })
  await s.read(kept, 5600)
  await coverArtShown(s)
  await sheetMusicSaved(s, EXPORT, 'Export wrote the mastered FLAC - it carries the whole project - the unmastered take, a release record and the sheet music with the lyrics as a PDF.')
  await exportExtras(s, EXPORT)
  await masterDemo(s)
  s.caption('Press Run again for another, different song - or set a number next to Run for a whole series.')
  const batch = page.locator('.actionbar input, .queue-button-group input, [data-testid="batch-count-edit"] input').first()
  if (await batch.count()) await s.spotlight(batch, { ms: 2600, pad: 10 })
  await s.hover(page.locator('button', { hasText: /^\s*Run\s*$/ }).first())
  await s.wait(3600)

  // --- part 2: one song, stop to review ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'One song, stop to review',
    subtitle: 'The run stops twice - you check and approve before anything is rendered',
    steps: ['Brief', 'Write', 'Stop: text', 'Plan', 'Stop: score', 'Stop: text', 'Render', 'Export'],
  }, 4.5)
  s.chapter('Part 2 · One song, stop to review')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one song, stop to review” - the run stops at both Song Sheets.')
  await s.chooseCombo(BRIEF, 'mode', 'one song, stop to review', { read: 2400 })
  await s.wait(900)
  await seedsFollowMode(s)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at Song Sheet · Text: ⏸ waiting for your approval. Nothing is rendered yet.')
  await s.flyNodes([TEXT], 1100, 0.9)
  await s.read('The run stopped at Song Sheet · Text: ⏸ waiting for your approval. Nothing is rendered yet.', 4600)

  // stop 1: the text
  await openSheet(s, TEXT, 'Its card says what you edit here: open it with “Edit lyrics & text”.')
  await tab(s, 'Lyrics', 'Lyrics: the words YuE2 will sing, section by section ([Verse], [Chorus] …). Edit anything - your edit wins.', { min: 5200 })
  await tab(s, 'Style', 'Style: the genre, the instruments and the voice YuE2 is given.', { min: 4200 })
  await tab(s, 'Title & artwork', 'Title & artwork: the title, picked from the writer’s ten - and the cover prompt, drawn from the lyrics: their central image, the light, the colours.', { min: 7000 })
  await approve(s, 'Approve: exactly these documents go on to the music model.')
  await showApproved(s, TEXT, 'The node says ✓ approved at once. Press Run again: YuE2 plans the score, and the run stops at the next sheet.')
  await s.wait(2600)
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [PLAN]: STAGES[PLAN] }, groups: GROUPS })
  s.caption('Stop 2: Song Sheet · Score waits for your approval.')
  await s.flyNodes([SCORE], 1100, 0.9)
  await s.read('Stop 2: Song Sheet · Score waits for your approval.', 3200)

  // stop 2: the score - the score editor
  await openSheet(s, SCORE, 'Open the score with “Edit the score”.')
  await maximize(s, '⛶ gives the editor the whole window.')
  s.card('chapter', {
    kicker: 'Part', part: '3', title: 'The score editor',
    subtitle: 'A tour of the editor, then the details: lyrics, notes, playback and sounds, arranging, recording, files',
    steps: ['Tour', 'Lyrics', 'Notes', 'Playback & sounds', 'Arranging', 'Recording', 'Files'],
  }, 4.5)
  s.chapter('Score editor · Tour')
  await editorTour(s)
  await fixSections(s)
  s.chapter('Score editor · Lyrics')
  await alignSections(s)
  await lyricsDemo(s)
  s.chapter('Score editor · Notes')
  await noteEditing(s)
  s.chapter('Score editor · Cursor and playback')
  await cursorDemo(s)
  s.chapter('Score editor · Sounds and presets')
  await soundsDemo(s, { preset: 'Pop' })
  s.chapter('Score editor · Copy and paste')
  await clipboardDemo(s)
  s.chapter('Score editor · Arrange sections')
  await arrangeDemo(s, {
    follows: 'The lyrics follow: the copied chorus gets its words. Apply writes them into Song Sheet · Text - and since YuE2 plans from those lyrics, this score is kept as yours (manual).',
  })
  s.chapter('Score editor · Arrange bars')
  await barsDemo(s)
  s.chapter('Score editor · Record with a MIDI keyboard')
  await recordDemo(s)
  s.chapter('Score editor · Files')
  await filesDemo(s)
  s.chapter('Part 2 · One song, stop to review')
  await approve(s, 'Approve: this score - with the extra chorus - is what YuE2 will render.')
  await showApproved(s, SCORE, 'Song Sheet · Score says ✓ approved at once. Song Sheet · Text asks again: its lyrics changed with the chorus.')
  s.caption('Run again: the run stops at Song Sheet · Text, so you see the new lyrics before anything is rendered.')
  await s.wait(2600)
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [TEXT]: 'Song Sheet · Text checks the new lyrics.' }, groups: GROUPS })
  await s.flyNodes([TEXT], 1100, 0.9)
  await openSheet(s, TEXT, 'Open it: the lyrics now have the copied chorus, with its words.')
  await tab(s, 'Lyrics', 'Lyrics: the copied chorus is there, with its words - nobody had to type them.', { min: 5600 })
  await approve(s, 'Approve.')
  await showApproved(s, TEXT, '✓ approved. Run again: YuE2 plans once more for the new lyrics, Song Sheet · Score keeps your score, and the song is rendered.')
  await s.resetRunState()
  await s.run()
  await s.follow({
    stages: {
      [PLAN]: 'YuE2 plans again for the new lyrics - Song Sheet · Score keeps your arranged score.',
      [RENDER]: STAGES[RENDER],
      [COVER]: '',
      [MASTER]: STAGES[MASTER],
    },
    groups: GROUPS,
  })
  await afterRun(s, 'The approved song is finished and exported.', { group: '6 · FINISH', preview: PREVIEW })
  s.caption('Every further Run renders a new take of the same approved song - the amber Take seed draws a new number each time.')
  await s.flyGroups(SECTIONS, 1600)
  await s.read('Every further Run renders a new take of the same approved song - the amber Take seed draws a new number each time.', 5200)
  await continueDemo(s)
  s.card('end', {
    title: 'Next: 2 · YuE2 · Cover',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
