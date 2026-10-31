// Tutorial 3 · MiniMax · Song: open the template and walk its sections (one row; the HQ Mastering and Cover
// Art cards and the writer model at the start; Cover Art above the render), one run straight through (new song
// every run: the brief's lists opened, the seeds, the cover, Export, the Master block's stems
// switch), then one song with its review stop - the Song Sheet (the caption in three parts, the lyrics, the
// exact token budget, the title and the cover prompt, Approve) - and the finished song. MiniMax Music 3 takes
// no score, so there is one sheet.

import { afterRun, coverArtShown, exportExtras, intro, masterDemo, openTemplate, sectionTour, seedsDemo, seedsFollowMode, showApproved, switchCards, writerDemo } from './lib/scenes.mjs'
import { approve, maximize, openSheet, tab } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 3 - MiniMax Song',
  template: '3 · MiniMax · Song',
}

// the template's nodes by title or type (example_workflows/3 · MiniMax · Song.json)
const BRIEF = 'PlenioSongBrief', SHEET = 'Song Sheet', WRITE = 'Plenio · Write Song', RENDER = 'Plenio · MiniMax Render'
const MASTER = 'Plenio · Master', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const MODEL = 'Plenio · MiniMax Model', WRITER = 'Writer model', COVER = 'Cover Art'
const SECTIONS = ['1 · SONG', '2 · WRITE', '3 · SHEET', '4 · RENDER', '5 · FINISH']
const GROUPS = {
  [WRITE]: '2 · WRITE', 'Draft seed': '2 · WRITE', [SHEET]: '3 · SHEET', [MODEL]: 'MUSIC MODEL', 'Take seed': '4 · RENDER',
  [RENDER]: '4 · RENDER', [COVER]: 'COVER ART', [MASTER]: '5 · FINISH', [PREVIEW]: '5 · FINISH', [EXPORT]: '5 · FINISH',
}
const STAGES = {
  [WRITE]: 'The writer model drafts the caption and the lyrics, and ten titles to pick from.',
  [RENDER]: 'MiniMax Music 3 renders the song from the caption and the lyrics.',
  [COVER]: '',
  [MASTER]: 'Master and Export finish the song.',
}
const IDEA = 'A warm late-night song about a city that never quite sleeps.'

export default async function minimax(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">3 ·</span> MiniMax · Song',
    subtitle: 'A new song with MiniMax Music 3 - in one run, or with a review stop',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 3 · MiniMax · Song',
    items: [
      'The MiniMax template',
      'Part 1 · A new song every run',
      'Part 2 · One song, stop to review',
    ],
  })

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, { name: '3 · MiniMax · Song', alt: 'MiniMax', what: '3 · MiniMax · Song writes a new song and renders it with MiniMax Music 3.' })

  // --- the tour -----------------------------------------------------------------------------------
  await sectionTour(s, [
    ['1 · SONG', 'SONG - the two switch cards and the Writer model at the top, then the Song Brief: what the song should be.'],
    ['2 · WRITE', 'WRITE - the writer drafts a caption and the lyrics, and ten titles; Plenio picks one no song of yours has yet.'],
    ['3 · SHEET', 'SHEET - the Song Sheet: exactly what MiniMax gets. MiniMax takes no score, so there is one sheet - teal, for the words.'],
    ['4 · RENDER', 'RENDER - MiniMax Music 3 renders the song; Best Take keeps the take that sings its lyrics best.'],
    ['5 · FINISH', 'FINISH - Master brings it to -14 LUFS, and Export writes the files.'],
  ], { intro: 'Five numbered sections, from left to right - one row, side by side.' })
  const art = 'Above the render, COVER ART paints the song’s cover; below the brief, the MUSIC MODEL block holds the MiniMax files.'
  s.caption(art)
  await s.flyGroups(['COVER ART', '4 · RENDER'], 1100, 0.9)
  await s.spotlight(s.groupBox('COVER ART'), { ms: 2400, pad: 2 })
  await s.wait(2200)
  await s.flyGroups(['MUSIC MODEL'], 1000, 0.6)
  await s.read(art, 2600)
  await switchCards(s, {
    hqText: 'HQ Mastering, off by default: on, UniverSR regenerates the highs MiniMax leaves dull - clearly less AI shimmer, but the song takes about twice as long.',
  })

  // --- part 1: a new song every run ------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'A new song every run',
    subtitle: 'The run goes straight through - no stops',
    steps: ['Brief', 'Write', 'Render', 'Cover', 'Master', 'Export'],
  }, 4)
  s.chapter('Part 1 · A new song every run')
  await s.flyNodes([BRIEF], 1200, 0.94)
  s.caption('The Song Brief works as in the YuE2 templates. mode: “new song every run”.')
  await s.chooseCombo(BRIEF, 'mode', 'new song every run', { read: 2600 })
  await s.wait(900)
  s.caption('template: a starting point - its values appear in the fields; change any of them.')
  await s.showCombo(BRIEF, 'template', { read: 2400, browse: 5 })
  s.caption('lyrics idea: say what the song is about.')
  await s.replaceText(BRIEF, 'vocals.lyrics', IDEA, { delay: 36 })
  await s.wait(1200)
  s.caption('length: short. MiniMax may end a song a little earlier than asked.')
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 2400, browse: 5 })
  await s.wait(900)
  s.caption('arrangement: MiniMax takes no score, so a creative mode (experimental) shapes only the writing here - off is fine.')
  await s.showCombo(BRIEF, 'arrangement', { read: 2600, browse: 5 })
  await s.read('arrangement: MiniMax takes no score, so a creative mode (experimental) shapes only the writing here - off is fine.', 2600)
  await writerDemo(s, {
    text: 'Under the cards, the Writer model writes caption and lyrics: Gemma 4 by default - or a local LLM from your machine.',
    uses: [WRITE],
    flows: 'It writes for every block that writes - the caption, the lyrics and the ten titles.',
  })
  await seedsDemo(s, { what: 'caption and lyrics' })

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: the finished song is in Preview (mastered).', { group: '5 · FINISH', preview: PREVIEW })
  await coverArtShown(s)
  await exportExtras(s, EXPORT)
  await masterDemo(s, { open: false })
  s.caption('The stems, Audio HQ and the master are inside the block - tutorial 1 opens it. Run again for another song - or set a number next to Run for a whole series.')
  await s.hover(page.locator('button', { hasText: /^\s*Run\s*$/ }).first())
  await s.wait(5200)

  // --- part 2: one song, stop to review ---------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'One song, stop to review',
    subtitle: 'The run stops at the Song Sheet - you check the caption and the lyrics first',
    steps: ['Brief', 'Write', 'Stop: sheet', 'Render', 'Master', 'Export'],
  }, 4.5)
  s.chapter('Part 2 · One song, stop to review')
  await s.flyNodes([BRIEF], 1100, 0.94)
  s.caption('mode: “one song, stop to review” - the run stops at the Song Sheet.')
  await s.chooseCombo(BRIEF, 'mode', 'one song, stop to review', { read: 2400 })
  await s.wait(900)
  await seedsFollowMode(s)
  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [WRITE]: STAGES[WRITE] }, groups: GROUPS })
  s.caption('The run stopped at the Song Sheet: ⏸ waiting for your approval.')
  await s.flyNodes([SHEET], 1100, 0.9)
  await s.read('The run stopped at the Song Sheet: ⏸ waiting for your approval.', 4200)

  await openSheet(s, SHEET, 'Its card says what you edit here: open it with “Edit lyrics & text”.')
  await maximize(s, '⛶ gives the editor the whole window.')
  await tab(s, 'Caption', 'Caption: MiniMax reads it in three parts - Global Metadata (tempo, key, genre), Vocal Details and Arrangement.', { min: 7600 })
  await tab(s, 'Lyrics', 'Lyrics: section by section. MiniMax sings about one line every five seconds.', { min: 5600 })
  const budget = page.locator('.plenio-overlay').getByText(/token/i).first()
  if (await budget.count()) {
    s.caption('The budget: caption and lyrics share 5,000 tokens. The run counts them exactly and stops before rendering if they do not fit.')
    await s.spotlight(budget, { ms: 3000, pad: 6 })
    await s.read('The budget: caption and lyrics share 5,000 tokens. The run counts them exactly and stops before rendering if they do not fit.', 6400)
  }
  await tab(s, 'Title & artwork', 'Title & artwork: the title, picked from the writer’s ten - and the cover prompt, drawn from the lyrics: their central image, the light, the colours.', { min: 7000 })
  await approve(s, 'Approve: exactly this caption and these lyrics go to MiniMax.')
  await showApproved(s, SHEET, 'The node says ✓ approved at once. Run again: MiniMax renders the approved song.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [RENDER]: STAGES[RENDER], [COVER]: '', [MASTER]: STAGES[MASTER] }, groups: GROUPS })
  await afterRun(s, 'The approved song is finished and exported.', { group: '5 · FINISH', preview: PREVIEW })
  s.caption('Every further Run renders a new take of the same approved song.')
  await s.flyGroups(SECTIONS, 1600)
  await s.read('Every further Run renders a new take of the same approved song.', 3800)
  s.card('end', {
    title: 'Next: 4 · Enhance & Master',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
