// Tutorial 4 · Enhance & Master: finish a recording you already have - no music model. The sections in one
// row (the HQ Mastering card on here, the Stems block under Load Audio), part 1 masters an unmastered take
// with the template's defaults (Audio HQ with UniverSR, a warm tone match, -14 LUFS) and reads HQ 2's report,
// the curve, the measured loudness and the files; part 2 edits the match's bands by hand, picks another
// loudness target and runs again; part 3 switches on the Lyrics block: the words as heard stop at a Song Sheet, a
// line heard otherwise than the song sings it is corrected (found against $PLENIO_TUTORIAL_LYRICS, the take's own
// lyrics), approved and released. The source is $PLENIO_TUTORIAL_AUDIO (an unmastered take shows the most), else
// the repository's sample song.

import fs from 'node:fs'
import path from 'node:path'
import { afterRun, intro, openTemplate, sectionTour, switchCards } from './lib/scenes.mjs'
import { DIALOG, approve, openSheet, tab } from './lib/sheet.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 4 - Enhance & Master',
  template: '4 · Enhance & Master',
}

const SAMPLE = ['assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3']
const SOURCE = 'Source', STEMS = 'Stems (optional)', HQ1 = 'PlenioHQStereoCleanup', HQ2 = 'PlenioHQRegenerateHighs'
const HQ3 = 'HQ 3 · De-Reverb (optional)', EQ = 'PlenioEQ', LOUD = 'PlenioLoudness', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const HQ = '2 · AUDIO HQ (before the EQ)'
const GROUPS = { [HQ1]: HQ, [HQ2]: HQ, [EQ]: '3 · MASTER', [LOUD]: '3 · MASTER', [PREVIEW]: '4 · FINISH', [EXPORT]: '4 · FINISH' }
const STAGES = {
  [HQ1]: 'HQ 1 calms the stereo shimmer in the highs.',
  [HQ2]: 'HQ 2: UniverSR generates new highs above 8.2 kHz.',
  [EQ]: 'EQ measures the song and applies the tone match.',
  [LOUD]: 'Loudness & Dynamics brings it to the target and measures the result.',
  [EXPORT]: 'Export writes the files.',
}

// the screen box of a node's summary (the report under it after a run)
const summaryBox = (s, node) => s.widgetBox(node, 'plenio_summary')

const HEAR = 'Transcribe Lyrics (optional)', LYRICS = 'Song Sheet · Lyrics (optional)', LYRICS_GROUP = 'Lyrics (optional)'

/** In the page, on the Song Sheet's lyrics: the first place where the words as heard part from the song's own lyrics
 * by one or two words (a word heard otherwise, left out or added) - not where only the lines break otherwise. Its
 * range in the text, what to type there, and a few words around it as heard and as sung; ``null``: none. */
function misheard(ta, written) {
  const plain = (text) => text.replace(/\[[^\]]*\]/g, (tag) => ' '.repeat(tag.length))
  const words = (text) => {
    const out = []
    const re = /[A-Za-z0-9’']+/g
    let m
    while ((m = re.exec(plain(text)))) out.push({ w: m[0].toLowerCase().replace(/’/g, "'"), i: m.index, j: m.index + m[0].length })
    return out
  }
  const heard = words(ta.value)
  const sung = words(written)
  const n = heard.length, k = sung.length
  const lcs = Array.from({ length: n + 1 }, () => new Int32Array(k + 1))
  for (let a = n - 1; a >= 0; a--)
    for (let b = k - 1; b >= 0; b--) lcs[a][b] = heard[a].w === sung[b].w ? lcs[a + 1][b + 1] + 1 : Math.max(lcs[a + 1][b], lcs[a][b + 1])
  let a = 0, b = 0
  while (a < n && b < k) {
    if (heard[a].w === sung[b].w) { a++; b++; continue }
    // a block that differs: the words up to where they meet again
    let a2 = a, b2 = b
    while (a2 < n && b2 < k && heard[a2].w !== sung[b2].w) {
      if (lcs[a2 + 1][b2] >= lcs[a2][b2 + 1]) a2++
      else b2++
    }
    const gotHeard = a2 - a, gotSung = b2 - b
    const before = a > 0 && b > 0 && a2 < n && b2 < k
    if (before && gotSung >= 1 && gotSung <= 2 && gotHeard <= 2) {
      const span = (list, from, to, text) => text.slice(list[from].i, list[to].j)
      const next = heard[a2]
      const start = gotHeard ? heard[a].i : next.i
      const end = gotHeard ? heard[a2 - 1].j : next.j
      const replace = gotHeard ? span(sung, b, b2 - 1, written) : `${span(sung, b, b2 - 1, written)} ${ta.value.slice(next.i, next.j)}`
      // what it heard and what is sung: the words that differ - a left-out word with the word after it
      const ctxHeard = gotHeard ? span(heard, a, a2 - 1, ta.value) : span(heard, a2, Math.min(n - 1, a2 + 1), ta.value)
      const ctxSung = gotHeard ? span(sung, b, b2 - 1, written) : span(sung, b, Math.min(k - 1, b2 + 1), written)
      return { start, end, replace, heard: ctxHeard.replace(/\s+/g, ' '), sung: ctxSung.replace(/\s+/g, ' ') }
    }
    a = a2
    b = b2
  }
  return null
}

export default async function enhance(s, { project }) {
  const page = s.page
  const source = process.env.PLENIO_TUTORIAL_AUDIO || path.join(project, ...SAMPLE)
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">4 ·</span> Enhance &amp; Master',
    subtitle: 'Finish any recording - Audio HQ, tone, loudness and a release export, without a music model',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 4 · Enhance & Master',
    items: [
      'Part 1 · Master a take: Audio HQ, tone match, loudness',
      'Part 2 · Your own sound',
      'Part 3 · The lyrics, corrected',
    ],
  })

  // --- open the template -------------------------------------------------------------------------
  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, { name: '4 · Enhance & Master', alt: 'Enhance', type: 'PlenioLoudness', what: '4 · Enhance & Master finishes a recording you already have.' })

  // --- the tour -----------------------------------------------------------------------------------
  await sectionTour(s, [
    ['1 · SOURCE', 'SOURCE - the HQ Mastering card at the top, the recording, and Stems under it: off until you rebalance a mix.'],
    [HQ, 'AUDIO HQ - before the EQ: HQ 1 calms the stereo shimmer, HQ 2 regenerates the highs, HQ 3 dries a short room - optional.'],
    ['3 · MASTER', 'MASTER - an EQ for the tone, then Loudness & Dynamics for the level.'],
    ['4 · FINISH', 'FINISH - the preview, and Export Release with tags and the original kept.'],
  ], { intro: 'Four numbered sections, from left to right - every stage of the song templates’ Master block, as nodes you reach directly.' })
  await switchCards(s, { cover: false, hqOn: true })

  // --- part 1: master a take ----------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'Master a take',
    subtitle: 'The defaults: Audio HQ, a warm tone match and streaming loudness',
    steps: ['Load', 'Audio HQ', 'EQ', 'Loudness', 'Run', 'Listen', 'Files'],
  }, 4)
  s.chapter('Part 1 · Master a take')
  await s.flyNodes([SOURCE, STEMS], 1200, 0.85)
  s.caption('Load the recording: “choose file to upload” in Source.')
  const upload = await s.widgetBox(SOURCE, 'upload')
  await s.spotlight(upload, { ms: 1800 })
  await s.wait(900)
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), s.click(upload, { pause: 400 })])
  await chooser.setFiles(source)
  const stem = path.basename(source, path.extname(source)).slice(0, 18)
  await page.waitForFunction(([key, name]) => {
    const w = window.__tut.node(key).widgets.find((x) => x.name === 'audio')
    return w && String(w.value).includes(name)
  }, [SOURCE, stem], { timeout: 60000 })
  await s.wait(1500)
  s.caption('Our example: a YuE2 take, straight from the model - not mastered yet.')
  await s.wait(3600)
  const stems = 'Under it, Stems: select it and press Ctrl+B to rebalance a finished mix - vocals, drums, bass and other; the mixer is inside the block.'
  s.caption(stems)
  await s.spotlight(s.nodeBox(STEMS), { ms: 3000, pad: 4 })
  await s.callout(s.nodeBox(STEMS), 'off · Ctrl+B', { ms: 3000 })
  await s.read(stems, 7000)

  await s.flyGroups([HQ], 1200, 0.9)
  s.caption('Audio HQ: there is no brief here, so the presets say what they are - standard, or gentle, strong or wide for your music.')
  await s.showCombo(HQ1, 'preset', { read: 2600, browse: 5 })
  await s.read('Audio HQ: there is no brief here, so the presets say what they are - standard, or gentle, strong or wide for your music.', 2800)
  const hq2 = 'HQ 2 runs because HQ Mastering is on: the cure for a dull, band-limited file - an old MP3, a take with a soft top end.'
  s.caption(hq2)
  await s.flyNodes([HQ2], 1000, 0.9)
  await s.spotlight(s.nodeBox(HQ2), { ms: 2800, pad: 4 })
  await s.read(hq2, 6000)
  const hq3 = 'HQ 3 is bypassed: it dries a short metallic room, but also dulls the highs - select it and press Ctrl+B to try it.'
  s.caption(hq3)
  await s.flyNodes([HQ3], 1000, 0.9)
  await s.read(hq3, 5600)

  await s.flyNodes([EQ], 1200, 0.94)
  s.caption('EQ: “match preset”, Warm - Plenio measures the song and proposes a few gentle bands.')
  await s.showCombo(EQ, 'mode', { read: 2400, browse: 4 })
  await s.wait(600)
  s.caption('The curve under the node shows them after the run - over the song’s own spectrum.')
  await s.spotlight(page.locator('.plenio-eq-plot').first(), { ms: 2400, pad: 4 })
  await s.wait(3800)

  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('Loudness & Dynamics: streaming, -14 LUFS with a true peak of at most -1 dBTP.')
  await s.showCombo(LOUD, 'target', { read: 2600, browse: 5 })
  await s.wait(400)
  s.caption('compression: Balanced - gentle glue. Or off, for the limiter alone.')
  await s.showCombo(LOUD, 'compression', { read: 2200, browse: 4 })
  await s.wait(400)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })

  await s.flyNodes([HQ2], 1100, 0.9)
  s.caption('HQ 2’s report: the profile, UniverSR from 8 kHz, and how the highs changed.')
  const hqReport = await summaryBox(s, HQ2).catch(() => null)
  if (hqReport) await s.spotlight(hqReport, { ms: 3200, pad: 4 })
  await s.wait(5200)
  await s.flyNodes([EQ], 1200, 0.94)
  s.caption('The match: gentle bands towards a warm tilt - the curve over the spectrum of the take.')
  await s.spotlight(page.locator('.plenio-eq-plot').first(), { ms: 3000, pad: 4 })
  await s.wait(5200)
  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('Measured, not estimated: the loudness and the true peak the song has now.')
  const report = await summaryBox(s, LOUD).catch(() => null)
  if (report) await s.spotlight(report, { ms: 3000, pad: 4 })
  await s.wait(5600)

  await afterRun(s, 'Listen in the preview.', { group: '4 · FINISH', preview: PREVIEW })
  s.caption('Export: FLAC and MP3 with the source’s tags, the unmastered source as (original), a release record - the FLAC carries it too - and subtitles of the words it heard. A recording has no score, so no sheet music.')
  await s.flyNodes([EXPORT], 1000, 0.9)
  const files = await summaryBox(s, EXPORT).catch(() => null)
  if (files) await s.spotlight(files, { ms: 3000, pad: 4 })
  await s.read('Export: FLAC and MP3 with the source’s tags, the unmastered source as (original), a release record - the FLAC carries it too - and subtitles of the words it heard. A recording has no score, so no sheet music.', 6000)

  // --- part 2: your own sound ---------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '2', title: 'Your own sound',
    subtitle: 'Edit the match by hand, pick another loudness target, run again',
    steps: ['Edit the bands', 'Target', 'Run', 'Compare'],
  }, 4)
  s.chapter('Part 2 · Your own sound')
  await s.flyNodes([EQ], 1200, 0.94)
  const edit = page.locator('.plenio-eq-mode button', { hasText: 'Edit these bands' }).first()
  if (await edit.count()) {
    s.caption('“Edit these bands” copies the proposal into manual bands - now they are yours.')
    await s.click(edit, { pause: 500 })
    await s.wait(2600)
  }
  const handles = page.locator('.plenio-eq-plot .handle')
  if (await handles.count()) {
    // the highest band: a little more air
    const boxes = await handles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))
    const top = boxes.reduce((a, b) => (b.x > a.x ? b : a))
    s.caption('Drag a handle: frequency and gain. The wheel changes its width; a double-click adds a band.')
    const from = { x: top.x + top.width / 2, y: top.y + top.height / 2 }
    await s.pulse({ x: from.x - 10, y: from.y - 10, width: 20, height: 20 }, { times: 1 })
    await s.drag(from, { x: from.x - 30, y: from.y - 28 }, { ms: 1400 })
    await s.wait(3000)
  }
  s.caption('The presets menu holds ready-made curves - for example for YuE2’s high end.')
  await s.openSelect(page.locator('.plenio-eq-tools select').first(), { browse: 5, read: 2000 })
  await s.wait(1200)

  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('target: Apple Music and podcasts - a little quieter, -16 LUFS.')
  await s.chooseCombo(LOUD, 'target', 'Apple Music', { read: 2400, browse: 4 })
  await s.wait(1600)

  s.caption('Run again.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('-16 LUFS, measured. When a target would need more limiting than the style allows, the node stops short and says so.')
  const report2 = await summaryBox(s, LOUD).catch(() => null)
  if (report2) await s.spotlight(report2, { ms: 3000, pad: 4 })
  await s.wait(6400)
  await afterRun(s, 'The new master - and the original stays next to it for comparison.', { group: '4 · FINISH', preview: PREVIEW })

  // --- part 3: the lyrics, corrected -------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '3', title: 'The lyrics, corrected',
    subtitle: 'What the ASR misheard - fixed before the release',
    steps: ['Switch on', 'Run', 'Correct', 'Approve', 'Run'],
  }, 4)
  s.chapter('Part 3 · The lyrics')
  await s.flyNodes([HEAR, LYRICS], 1100, 0.85)
  await s.say('The lyrics: Export writes them as subtitles, into the lyrics tag and the record - as the ASR hears them, misheard words included.', 6400)
  // the two nodes: a click on the first's title, a Shift-click on the second's, Ctrl+B
  const titleOf = (key) => page.evaluate((k) => {
    const b = window.__tut.nodeBox(k)
    const z = window.app.canvas.ds.scale
    return { x: b.x + 14 * z, y: b.y + 6 * z, width: Math.min(b.width * 0.5, 160 * z), height: 16 * z }
  }, key)
  const on = 'Select the two nodes of Lyrics (optional) - a click, a Shift-click - and press Ctrl+B: they take part now.'
  s.caption(on)
  await s.click(await titleOf(HEAR), { pause: 300 })
  await page.keyboard.down('Shift')
  await s.click(await titleOf(LYRICS), { pause: 300 })
  await page.keyboard.up('Shift')
  await s.keys('Control+b', { labels: ['Ctrl', 'B'] })
  await s.read(on, 5200)
  await page.mouse.click(40, 500)  // nothing selected any more
  s.caption('Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [HEAR]: 'Transcribe Lyrics hears the words of the song.' }, groups: { [HEAR]: LYRICS_GROUP, [LYRICS]: LYRICS_GROUP } })
  const stop = 'The run stops at the Song Sheet: ⏸ waiting for your approval - nothing is exported yet.'
  s.caption(stop)
  await s.flyNodes([LYRICS], 1000, 0.9)
  await s.read(stop, 4800)
  await openSheet(s, LYRICS, 'Open it: “Edit lyrics & text”.')
  await tab(s, 'Lyrics', 'Lyrics: the words as the ASR heard them, section by section.', { min: 5200 })
  // a few words heard otherwise than the song sings them (against its own lyrics): typed as they are sung
  const written = process.env.PLENIO_TUTORIAL_LYRICS ? fs.readFileSync(process.env.PLENIO_TUTORIAL_LYRICS, 'utf8') : ''
  const box = page.locator(DIALOG).locator('textarea').first()
  const fix = written ? await box.evaluate(misheard, written) : null
  if (fix) {
    const said = `It heard “${fix.heard}” - the song sings “${fix.sung}”. Type it as it is sung.`
    s.caption(said)
    await box.evaluate((ta, at) => {
      ta.focus()
      ta.setSelectionRange(at.start, at.end)
      ta.scrollTop = Math.max(0, ta.scrollHeight * (at.start / Math.max(1, ta.value.length)) - 60)
    }, fix)
    await s.spotlight(box, { ms: 2400, pad: 2 })
    await s.wait(900)
    await s.type(fix.replace, { delay: 85 })
    await s.read(said, 6400)
  } else {
    const right = 'Every line was heard right this time - a word you change here is what Export writes.'
    s.caption(right)
    await s.read(right, 5200)
  }
  await approve(s, 'Approve: these words go into the release.')
  s.caption('Run again: Export times your words to the singing.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [EXPORT]: STAGES[EXPORT] }, groups: GROUPS })
  const done = 'Your words: in the subtitles, the lyrics tag and the record. The sung subtitles keep what was heard.'
  s.caption(done)
  await s.flyNodes([EXPORT], 1000, 0.9)
  const written2 = await summaryBox(s, EXPORT).catch(() => null)
  if (written2) await s.spotlight(written2, { ms: 3000, pad: 4 })
  await s.read(done, 6200)

  s.card('end', {
    title: 'Next: 5 · YuE2 · DAW',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
