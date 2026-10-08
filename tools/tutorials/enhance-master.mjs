// Tutorial 4 · Enhance & Master: finish a recording you already have - no music model, no GPU. Part 1
// masters an unmastered take with the template's defaults (a warm tone match, -14 LUFS) and reads the
// curve, the measured loudness and the files; part 2 edits the match's bands by hand, picks another
// loudness target and runs again. The source is $PLENIO_TUTORIAL_AUDIO (an unmastered take shows the
// most), else the repository's sample song.

import path from 'node:path'

export const meta = {
  name: 'Plenio tutorial 4 - Enhance & Master',
  template: '4 · Enhance & Master',
}

const SAMPLE = ['assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3']
const SOURCE = 'Source', EQ = 'PlenioEQ', LOUD = 'PlenioLoudness', PREVIEW = 'Preview (mastered)', EXPORT = 'PlenioExportRelease'
const GROUPS = { [EQ]: '2 · MASTER', [LOUD]: '2 · MASTER', [PREVIEW]: '3 · FINISH', [EXPORT]: '3 · FINISH' }
const STAGES = {
  [EQ]: 'EQ measures the song and applies the tone match.',
  [LOUD]: 'Loudness & Dynamics brings it to the target and measures the result.',
  [EXPORT]: 'Export writes the files.',
}

// the screen box of a node's summary (the report under it after a run)
const summaryBox = (s, node) => s.widgetBox(node, 'plenio_summary')

export default async function enhance(s, { project }) {
  const page = s.page
  const source = process.env.PLENIO_TUTORIAL_AUDIO || path.join(project, ...SAMPLE)
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">4 ·</span> Enhance &amp; Master',
    subtitle: 'Finish any recording - tone, loudness and a release export, without a music model or a GPU',
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
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="Enhance"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('4 · Enhance & Master', { exact: true }).first()
  s.caption('4 · Enhance & Master finishes a recording you already have.')
  await s.hover(card, { fy: -4 })
  await s.wait(2600)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioLoudness'), null, { timeout: 30000 })
  await s.wait(2500)

  // --- the tour -----------------------------------------------------------------------------------
  const all = ['1 · SOURCE', '2 · MASTER', '3 · FINISH']
  await s.flyGroups(all, 1400)
  await s.say('Three steps, from left to right.', 2600)
  const tour = [
    ['1 · SOURCE', 'SOURCE - the recording: a take you rendered earlier, or any song file.'],
    ['2 · MASTER', 'MASTER - an EQ for the tone, then Loudness & Dynamics for the level.'],
    ['3 · FINISH', 'FINISH - the preview, and Export Release with tags and the original kept.'],
  ]
  for (const [group, text] of tour) {
    s.caption(text)
    await s.flyGroups([group], 1000, 0.9)
    await s.read(text, 2800)
  }
  s.caption('Optional: Stems rebalances a mix, Refine restores a band-limited file - both switched off.')
  await s.flyGroups(['STEMS (optional)', 'REFINE (optional)'], 1000, 0.9)
  await s.read('Optional: Stems rebalances a mix, Refine restores a band-limited file - both switched off.')

  // --- part 1: master a take ----------------------------------------------------------------------
  s.card('chapter', {
    kicker: 'Part', part: '1', title: 'Master a take',
    subtitle: 'The defaults: a warm tone match and streaming loudness',
    steps: ['Load', 'EQ', 'Loudness', 'Run', 'Listen', 'Files'],
  }, 4)
  s.chapter('Part 1 · Master a take')
  await s.flyGroups(['1 · SOURCE'], 1200, 0.9)
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

  await s.flyNodes([EQ], 1200, 0.94)
  s.caption('EQ: “match preset”, Warm - Plenio measures the song and proposes a few gentle bands.')
  await s.spotlight(await s.widgetBox(EQ, 'mode'), { ms: 2400 })
  await s.wait(4000)
  s.caption('The curve under the node shows them after the run - over the song’s own spectrum.')
  await s.spotlight(page.locator('.plenio-eq-plot').first(), { ms: 2400, pad: 4 })
  await s.wait(3800)

  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('Loudness & Dynamics: streaming, -14 LUFS with a true peak of at most -1 dBTP.')
  await s.hover(await s.widgetBox(LOUD, 'target'), { fx: 0.7 })
  await s.wait(3800)
  s.caption('compression: Balanced - gentle glue. Or off, for the limiter alone.')
  await s.hover(await s.widgetBox(LOUD, 'compression'), { fx: 0.7 })
  await s.wait(3400)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })

  await s.flyNodes([EQ], 1200, 0.94)
  s.caption('The match: gentle bands towards a warm tilt - the curve over the spectrum of the take.')
  await s.spotlight(page.locator('.plenio-eq-plot').first(), { ms: 3000, pad: 4 })
  await s.wait(5200)
  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('Measured, not estimated: the loudness and the true peak the song has now.')
  const report = await summaryBox(s, LOUD).catch(() => null)
  if (report) await s.spotlight(report, { ms: 3000, pad: 4 })
  await s.wait(5600)

  await afterRun(s, 'Listen in the preview.')
  s.caption('Export: FLAC and MP3 with the source’s tags, the unmastered source as (original), and a release record - sheet music stays off, a recording has no score.')
  await s.flyNodes([EXPORT], 1000, 0.9)
  const files = await summaryBox(s, EXPORT).catch(() => null)
  if (files) await s.spotlight(files, { ms: 3000, pad: 4 })
  await s.read('Export: FLAC and MP3 with the source’s tags, the unmastered source as (original), and a release record - sheet music stays off, a recording has no score.', 6000)

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
    await s.drag(from, { x: from.x - 30, y: from.y - 28 }, { ms: 1400 })
    await s.wait(3000)
  }
  s.caption('The presets menu holds ready-made curves - for example for YuE2’s high end.')
  await s.spotlight(page.locator('.plenio-eq-tools select').first(), { ms: 2400, pad: 4 })
  await s.wait(3600)

  await s.flyNodes([LOUD], 1100, 0.9)
  s.caption('target: Apple Music and podcasts - a little quieter, -16 LUFS.')
  await s.chooseCombo(LOUD, 'target', 'Apple Music', { read: 2400 })
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
  await afterRun(s, 'The new master - and the original stays next to it for comparison.')

  s.card('end', {
    title: 'Next: 5 · YuE2 · DAW',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}

async function afterRun(s, text) {
  s.caption(text)
  await s.flyGroups(['3 · FINISH'], 1200, 0.9)
  await s.wait(800)
  const player = await s.audioBox(PREVIEW)
  if (player) {
    await s.spotlight(player, { ms: 2000 })
    await s.click({ x: player.x + 18, y: player.y + player.height / 2, width: 1, height: 1 }, { pause: 400 })
    await s.listen(PREVIEW)
  }
  await s.read(text, 4200)
}
