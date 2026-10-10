// Browser checks of the shipped templates in the real ComfyUI frontend (Phase 8, V2).
//
// For every template in example_workflows/:
//   1. load    - loads like the template browser does; Plenio errors in the console fail the check
//   2. reload  - serialize -> load -> serialize: widget values and the API prompt stay identical
//   3. options - each optional block on/off (and Master bypassed): the frontend's API prompt has the
//                expected shape and the server validates it (dummy model files, see below)
//   4. app     - App Mode shows the configured controls and outputs
//   5. summaries - after a run: every node's summary shows at least four lines, no text field
//                shrinks below 60 px to make room, and no two nodes overlap once the nodes grew
//   6. status  - before a run every Song Sheet says whether it stops for review (the brief's mode:
//                *stop to review* templates stop at every sheet, *every run* templates run through)
//
// Needs a running ComfyUI with Plenio (tools/dev_server.py) whose models folder holds files with the
// catalogue's default names (empty files are enough: the server only validates the names; a queued
// prompt then fails at the first loader, which is expected) and the audio files named below in its
// input folder. Usage:
//
//   node tools/browser_check.mjs --url http://127.0.0.1:8190 [--chromium <path> | --channel msedge]
//        [--out <folder for screenshots and results.json>] [--only "<template name>"]
//
// Playwright: the global `playwright` package or `playwright-core` (no browser download) with a
// system browser (--channel chrome / msedge).

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith('--')) pairs.push([value.slice(2), all[index + 1]?.startsWith('--') ? true : all[index + 1] ?? true])
    return pairs
  }, []),
)
const URL = args.url ?? 'http://127.0.0.1:8190'
const OUT = path.resolve(args.out ?? path.join(PROJECT, '.browser-check'))
fs.mkdirSync(OUT, { recursive: true })

function loadPlaywright() {
  const require = createRequire(import.meta.url)
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']
  for (const name of candidates.filter(Boolean)) {
    try {
      return require(name)
    } catch {}
  }
  throw new Error('Playwright not found: npm install -g playwright-core (or set PLAYWRIGHT_MODULE)')
}

// Expectations per template: the optional blocks (by node title) and what the API prompt must show.
const OPTIONAL = {
  '1 · YuE2 · Song': ['Cover Art (optional)', 'Cover preview (optional)'],
  '2 · YuE2 · Cover': ['Cover Art (optional)', 'Cover preview (optional)', 'Check sung lyrics (optional)', 'Excerpt (optional)'],
  '3 · MiniMax · Song': ['Cover Art (optional)', 'Cover preview (optional)'],
}
const INPUT_AUDIO = { '2 · YuE2 · Cover': 'cover_source.flac', '4 · Enhance & Master': 'browser-check.flac' }
// The node classes that send a run summary (``plenio_summary`` in their UI output, plenio/comfy/nodes)
const SUMMARY_TYPES = [
  'PlenioSongBrief', 'PlenioComposePrompt', 'PlenioCoverBrief', 'PlenioEngine', 'PlenioEQ', 'PlenioExportRelease',
  'PlenioLoudness', 'PlenioParseDraft', 'PlenioRefine', 'PlenioScoreTools', 'PlenioSongSheet', 'PlenioSeparateStems',
  'PlenioStemMixer', 'PlenioSystemCheck', 'PlenioTranscribeLyrics', 'PlenioTranscribeScore', 'PlenioVocalCheck',
]
/** JSON with sorted keys: the frontend's autogrow may list the same inputs in another order after a reload. */
const canonical = (value) =>
  JSON.stringify(value, (_key, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v))

const results = []
const record = (template, check, ok, detail = '') => {
  results.push({ template, check, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${template}  ${check}${detail ? `  - ${detail}` : ''}`)
}

const { chromium } = loadPlaywright()
const browser = await chromium.launch({
  ...(args.chromium ? { executablePath: args.chromium } : {}),
  ...(args.channel ? { channel: args.channel } : {}),
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
let consoleErrors = []
/** The song the sheet music check exported (its record keeps the workflow): continued at the end. */
let exported = null
let renumbered = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text())
  if (/duplicate subgraph node ID/.test(m.text())) renumbered.push(m.text())
})
page.on('pageerror', (e) => consoleErrors.push(String(e)))
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.app && window.app.graph, null, { timeout: 90000 })
await page.keyboard.press('Escape')

// --- helpers running in the page ----------------------------------------------------------------

async function load(workflow, name) {
  consoleErrors = []
  renumbered = []
  await page.evaluate(async ([w, n]) => { await window.app.loadGraphData(w, true, true, n) }, [workflow, name])
  await page.waitForTimeout(1200)
  await page.keyboard.press('Escape')
}

const snapshot = () =>
  page.evaluate(async () => {
    const graph = window.app.graph
    const values = {}
    const collect = (g, prefix) => {
      for (const node of g.nodes) {
        values[`${prefix}${node.id}`] = {
          type: node.type,
          mode: node.mode,
          // frontend controls, not values: buttons (Load Audio's upload) and the audio player (random cache URL)
          widgets: (node.widgets ?? []).filter((w) => w.name && w.type !== 'button' && w.name !== 'audioUI' && !w.name.startsWith('$$')).map((w) => [w.name, typeof w.value === 'object' ? JSON.stringify(w.value) : w.value]),
        }
        if (node.subgraph) collect(node.subgraph, `${prefix}${node.id}:`)
      }
    }
    collect(graph, '')
    const { output } = await window.app.graphToPrompt()
    return { values, output, serialized: graph.serialize() }
  })

const setMode = (titles, mode) =>
  page.evaluate(([t, m]) => {
    for (const node of window.app.graph.nodes) if (t.includes(node.title)) node.mode = m
    window.app.graph.setDirtyCanvas(true, true)
  }, [titles, mode])

const setWidget = (nodeType, name, value) =>
  page.evaluate(([t, n, v]) => {
    const node = window.app.graph.nodes.find((x) => x.type === t)
    const widget = node?.widgets?.find((w) => w.name === n)
    if (!widget) return false
    if (widget.options?.values && !widget.options.values.includes(v)) widget.options.values.push(v)
    widget.value = v
    widget.callback?.(v)
    return true
  }, [nodeType, name, value])

async function validate(output) {
  const response = await page.evaluate(async (prompt) => {
    const r = await fetch('/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, client_id: 'plenio-browser-check' }) })
    const body = await r.json().catch(() => ({}))
    await fetch('/interrupt', { method: 'POST' })
    await fetch('/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clear: true }) })
    return { status: r.status, body }
  }, output)
  if (response.status === 200) return ''
  const errors = Object.entries(response.body.node_errors ?? {}).map(([id, e]) => `${id} ${e.class_type}: ${(e.errors ?? []).map((x) => x.message + (x.details ? ` (${x.details})` : '')).join('; ')}`)
  return `${response.body.error?.message ?? response.status} ${errors.join(' | ')}`
}

const byType = (output, type) => Object.entries(output).filter(([, node]) => node.class_type === type)
const plenioErrors = () => consoleErrors.filter((e) => /plenio/i.test(e))

// --- the checks ---------------------------------------------------------------------------------

const names = fs
  .readdirSync(path.join(PROJECT, 'example_workflows'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5))
  .filter((n) => !args.only || n === args.only)
  .sort()

for (const name of names) {
  const template = JSON.parse(fs.readFileSync(path.join(PROJECT, 'example_workflows', `${name}.json`), 'utf8'))
  // 1. load
  await load(template, name)
  const first = await snapshot()
  // Load Audio's frontend adds its player and upload widgets after the file name (as native templates
  // ship; one or two, depending on whether a file is set): only the file name is a shipped value
  const SHIPPED_ONLY = { LoadAudio: 1 }
  const differing = first.serialized.nodes.filter((n) => {
    const shipped = template.nodes.find((t) => t.id === n.id)?.widgets_values ?? []
    const saved = SHIPPED_ONLY[n.type] ? (n.widgets_values ?? []).slice(0, SHIPPED_ONLY[n.type]) : n.widgets_values ?? []
    return JSON.stringify(saved) !== JSON.stringify(SHIPPED_ONLY[n.type] ? shipped.slice(0, SHIPPED_ONLY[n.type]) : shipped)
  })
  record(name, 'load: widget values as shipped', differing.length === 0, differing.map((n) => `${n.id} ${n.type}: ${JSON.stringify(n.widgets_values)}`).join(' | '))
  record(name, 'load: no Plenio console errors', plenioErrors().length === 0, plenioErrors().slice(0, 2).join(' | '))
  record(name, 'load: node ids kept (no renumbering)', renumbered.length === 0, renumbered.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })

  // 2. save / reload
  await load(first.serialized, `${name} (reloaded)`)
  const second = await snapshot()
  const sameValues = JSON.stringify(first.values) === JSON.stringify(second.values)
  const samePrompt = canonical(first.output) === canonical(second.output)
  record(name, 'reload: widget values identical', sameValues)
  record(name, 'reload: API prompt identical', samePrompt)

  // 3. options (and Master bypassed)
  await load(template, name)
  if (INPUT_AUDIO[name]) await setWidget('LoadAudio', 'audio', INPUT_AUDIO[name])
  const defaults = await snapshot()
  const problem = await validate(defaults.output)
  record(name, 'options: defaults validate on the server', problem === '', problem)
  const optional = OPTIONAL[name] ?? []
  if (optional.length) {
    const flux = byType(defaults.output, 'Flux2Scheduler').length
    record(name, 'options: Cover Art off by default (no FLUX nodes in the prompt)', flux === 0)
    const exportNode = byType(defaults.output, 'PlenioExportRelease')[0]?.[1]
    record(name, 'options: Export has no cover when Cover Art is off', exportNode && !('cover' in exportNode.inputs))
    await setMode(optional, 0)
    const all = await snapshot()
    const allProblem = await validate(all.output)
    record(name, 'options: all optional blocks on validate', allProblem === '', allProblem)
    const exportAll = byType(all.output, 'PlenioExportRelease')[0]?.[1]
    record(name, 'options: Cover Art on -> FLUX nodes and Export cover linked', byType(all.output, 'Flux2Scheduler').length === 1 && Array.isArray(exportAll?.inputs?.cover))
    await setMode(optional, 4)
  }
  if (name !== '0 · System Check' && name !== '4 · Enhance & Master') {
    await setMode(['Plenio · Master'], 4)
    const bypassed = await snapshot()
    const exp = byType(bypassed.output, 'PlenioExportRelease')[0]?.[1]
    const noDsp = byType(bypassed.output, 'PlenioLoudness').length === 0
    const linked = Array.isArray(exp?.inputs?.audio) && JSON.stringify(exp.inputs.audio) === JSON.stringify(exp.inputs.original)
    record(name, 'options: Master bypassed -> Export gets the raw take, no DSP nodes', noDsp && linked)
    const bypassProblem = await validate(bypassed.output)
    record(name, 'options: Master bypassed validates', bypassProblem === '', bypassProblem)
    await setMode(['Plenio · Master'], 0)
  }

  // 5. summaries (what a run leaves on the nodes)
  await load(template, name)
  const summaries = await page.evaluate(async (types) => {
    const graph = window.app.graph
    const markdown = '**Summary of this node**\n- note: one\n- note: two\n- note: three\n- note: four'
    const shown = graph.nodes.filter((n) => types.includes(n.type) && typeof n.onExecuted === 'function')
    for (const node of shown) node.onExecuted({ plenio_summary: [{ status: 'ok', markdown }] })
    const problems = []
    const canvas = window.app.canvas
    for (const node of shown) {
      if (node.flags?.collapsed) continue
      const summary = node.widgets?.find((w) => w.name === 'plenio_summary')?.element
      if (!summary) continue
      // DOM widgets are laid out on screen only: bring the node into view at 100 %
      canvas.ds.scale = 1
      canvas.ds.offset[0] = -node.pos[0] + 100
      canvas.ds.offset[1] = -node.pos[1] + 100
      canvas.setDirty(true, true)
      await new Promise((r) => setTimeout(r, 600))
      const label = node.title || node.type
      if (summary.clientHeight < 76) problems.push(`${label}: summary ${summary.clientHeight} px`)
      for (const field of node.widgets ?? []) {
        const area = field.element?.querySelector?.('textarea') ?? (field.element?.tagName === 'TEXTAREA' ? field.element : null)
        if (area && area.clientHeight < 60) problems.push(`${label}: ${field.name} squeezed to ${area.clientHeight} px`)
      }
    }
    const box = (n) => {
      const collapsed = !!n.flags?.collapsed
      return [n.pos[0], n.pos[1] - 30, n.pos[0] + (collapsed ? Math.min(n.size[0], 260) : n.size[0]), n.pos[1] + (collapsed ? 0 : n.size[1])]
    }
    const nodes = graph.nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = box(nodes[i]), b = box(nodes[j])
        if (Math.min(a[2], b[2]) > Math.max(a[0], b[0]) && Math.min(a[3], b[3]) > Math.max(a[1], b[1])) {
          problems.push(`${nodes[i].title} overlaps ${nodes[j].title} after the run`)
        }
      }
    }
    return problems
  }, SUMMARY_TYPES)
  record(name, 'summaries: readable after a run, no squeezed field, no overlap', summaries.length === 0, summaries.slice(0, 4).join(' | '))

  // 6. status (the holding points before a run)
  await load(template, name)
  const holding = await page.evaluate(() =>
    window.app.graph.nodes
      .filter((n) => n.type === 'PlenioSongSheet')
      .map((n) => {
        const brief = n.getInputNode?.(n.inputs.findIndex((s) => s.name === 'brief'))
        const mode = String(brief?.widgets?.find((w) => w.name === 'mode')?.value ?? '')
        const line = n.widgets?.find((w) => w.name === 'sheet_state')?.element?.querySelector('.plenio-sheet-status')?.textContent ?? ''
        return { title: n.title, stops: mode.includes('stop to review'), line, badges: (n.badges ?? []).length }
      })
  )
  const wrong = holding.filter((s) => s.badges < 1 || s.line !== (s.stops ? '⏸ stops here for review' : '▶ runs through, no review stop'))
  if (holding.length) {
    record(name, 'status: every Song Sheet says whether it stops for review', wrong.length === 0, wrong.map((s) => `${s.title}: ${JSON.stringify(s.line)}`).join(' | '))
  }

  // 4. app
  const app = template.extra?.linearData
  if (app) {
    await load(template, name)
    await page.evaluate(async () => { await window.app.extensionManager.command.execute('Comfy.ToggleLinear') })
    await page.waitForTimeout(2000)
    for (const text of ['Skip']) {
      const button = page.getByRole('button', { name: text })
      if (await button.count()) await button.first().click().catch(() => {})
    }
    await page.waitForTimeout(500)
    const labels = await page.evaluate(([inputs]) => {
      const text = document.body.innerText
      const missing = []
      for (const [id, name] of inputs) {
        const node = window.app.graph.getNodeById(id)
        const widget = node?.widgets?.find((w) => w.name === name)
        const label = widget?.label ?? widget?.name ?? name
        if (!widget || !text.includes(label.split('.').pop())) missing.push(`${id}:${name}`)
      }
      return missing
    }, [app.inputs])
    await page.screenshot({ path: path.join(OUT, `${name} - app.png`) })
    record(name, 'app: configured controls shown', labels.length === 0, labels.join(', '))
    const kept = await page.evaluate(() => JSON.stringify(window.app.graph.serialize().extra?.linearData))
    record(name, 'app: configuration kept on save', kept === JSON.stringify(app))
    await page.evaluate(async () => { await window.app.extensionManager.command.execute('Comfy.ToggleLinear') })
    await page.waitForTimeout(800)
  }
}

// 7. sheet music (Export Release, owner's request 2026-10-08): a run started from this page exports a song
// with *sheet music* on; a page draws the PDF the export reserved, Plenio saves it next to the audio and the
// release record lists it - at the chosen *sheet music size* (compact here). Also when another workflow is
// open as the run ends (owner's report 2026-10-09: no PDF then), and when no page heard the run at all (a run
// queued elsewhere): the next page that opens draws it from the list of PDFs still waiting. A page that runs
// older Plenio code than the server's files (updated while it was open) says to reload.
const SHEET_SCORE = fs.readFileSync(path.join(PROJECT, 'tests', 'fixtures', 'abc', 'upstream-score.abc'), 'utf8')
const SHEET_LYRICS = '[verse]\nMorning light on the window\nCoffee warm in my hand\n\n[chorus]\nSing it slow, let it go\nEvery road leads home'

/** Build the export graph in the open workflow; with ``elsewhere`` the prompt is queued for another client. */
const queueSheetExport = (folder, title, elsewhere = false) =>
  page.evaluate(async ([folder, score, lyrics, title, elsewhere]) => {
    const app = window.app
    app.graph.clear()
    const add = (type) => {
      const node = window.LiteGraph.createNode(type)
      app.graph.add(node)
      return node
    }
    const set = (node, name, value) => {
      const widget = node.widgets.find((w) => w.name === name)
      if (!widget) throw new Error(`${node.type} has no widget ${name}`)
      widget.value = value
      widget.callback?.(value)
    }
    const sheet = add('PlenioSongSheet')
    const audio = add('LoadAudio')
    const exporter = add('PlenioExportRelease')
    set(sheet, 'review', 'continue')
    const manual = (text) => ({ state: 'manual', text })
    set(sheet, 'sheet_state', JSON.stringify({ schema: 'plenio.sheet_state/1', docs: { title: manual(title), lyrics: manual(lyrics), score: manual(score) } }))
    set(audio, 'audio', 'browser-check.flac')
    set(exporter, 'folder', folder)
    set(exporter, 'naming', '{title}')
    set(exporter, 'sheet_music', 'PDF (A4)')
    set(exporter, 'sheet_music_size', 'compact')
    const out = (node, name) => node.outputs.findIndex((o) => o.name === name)
    const inp = (node, name) => node.inputs.findIndex((i) => i.name === name)
    audio.connect(out(audio, 'AUDIO'), exporter, inp(exporter, 'audio'))
    sheet.connect(out(sheet, 'title'), exporter, inp(exporter, 'title'))
    sheet.connect(out(sheet, 'report'), exporter, inp(exporter, 'reports.report_0'))
    if (elsewhere) {
      // as a run queued by another page or over the API: this page hears nothing of it
      const { output } = await app.graphToPrompt()
      const response = await fetch('/api/prompt', { method: 'POST', body: JSON.stringify({ prompt: output, client_id: 'browser-check-elsewhere' }) })
      if (!response.ok) throw new Error(`queueing failed: ${response.status}`)
    } else {
      await app.queuePrompt(0, 1)
    }
    return exporter.id
  }, [folder, SHEET_SCORE, SHEET_LYRICS, title, elsewhere])

/** Wait for the release record to say ``status`` (``saved``: and read the PDF). */
const sheetOutcome = (folder, title, exporterId, status = 'saved') =>
  page.evaluate(async ([folder, title, exporterId, status]) => {
    const view = (name) => fetch(`/view?filename=${encodeURIComponent(name)}&type=output&subfolder=${encodeURIComponent(folder)}`)
    const deadline = Date.now() + 120000
    while (Date.now() < deadline) {
      const response = await view(`${title}.plenio.json`)
      if (response.ok) {
        const record = await response.json()
        if (status !== 'saved' && record.sheet_music?.status === status) return { waiting: true }
        if (record.sheet_music?.status === 'saved') {
          const pdf = new Uint8Array(await (await view(`${title}.pdf`)).arrayBuffer())
          const head = new TextDecoder().decode(pdf.slice(0, 5))
          const pages = (new TextDecoder('latin1').decode(pdf).match(/\/Type \/Page\b/g) ?? []).length
          const listed = (record.files ?? []).some((f) => f.name === `${title}.pdf` && f.role === 'sheet_music')
          const node = window.app.graph.getNodeById(exporterId)
          const summary = String(node?.properties?.plenio_summary?.markdown ?? '')
          return { head, bytes: pdf.length, pages, size: record.sheet_music.size, listed, summary: summary.split('\n').find((l) => l.startsWith('- sheet music')) ?? '' }
        }
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    return { timeout: true }
  }, [folder, title, exporterId, status])

const pdfOk = (outcome) => !outcome.timeout && outcome.head === '%PDF-' && outcome.bytes > 10000 && outcome.pages >= 1 && outcome.size === 'compact' && outcome.listed
{
  const check = 'export: the sheet music PDF is saved next to the audio'
  const folder = `browser-check/sheet-music-${Date.now()}`
  const title = 'Browser Check Sheet'
  consoleErrors = []
  const queued = await queueSheetExport(folder, title)
  exported = { folder, title }
  // wait for the record to say the PDF is saved (the page draws it after the export ran)
  const outcome = await sheetOutcome(folder, title, queued)
  const ok = pdfOk(outcome) && /saved/.test(outcome.summary)
  record(
    'Export Release',
    check,
    ok,
    ok ? `${outcome.bytes} bytes, ${outcome.pages} page(s), ${outcome.size}; ${outcome.summary}` : JSON.stringify(outcome) + ' ' + plenioErrors().join(' | ')
  )
}
{
  const check = 'export: the PDF is saved while another workflow is open'
  const folder = `browser-check/sheet-music-other-${Date.now()}`
  const title = 'Browser Check Other Workflow'
  consoleErrors = []
  const queued = await queueSheetExport(folder, title)
  // another workflow opens at once: the export ends while it is shown (ComfyUI calls onExecuted only for a
  // node of the open workflow)
  await page.evaluate(async () => {
    await window.app.loadGraphData({ last_node_id: 0, last_link_id: 0, nodes: [], links: [], groups: [], config: {}, extra: {}, version: 0.4 }, true, true, 'browser-check-other')
  })
  const outcome = await sheetOutcome(folder, title, queued)
  const ok = pdfOk(outcome)
  record('Export Release', check, ok, ok ? `${outcome.bytes} bytes, ${outcome.pages} page(s)` : JSON.stringify(outcome) + ' ' + plenioErrors().join(' | '))
}
{
  const check = 'export: a page that opens later saves the PDF a run left waiting'
  const folder = `browser-check/sheet-music-later-${Date.now()}`
  const title = 'Browser Check Later'
  consoleErrors = []
  const queued = await queueSheetExport(folder, title, true)
  const waiting = await sheetOutcome(folder, title, queued, 'drawn by the browser after the export')
  // the page opens again (as a user coming back the next morning): it asks for the PDFs still waiting
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.app && window.app.graph, null, { timeout: 90000 })
  const outcome = await sheetOutcome(folder, title, -1)
  const ok = !!waiting.waiting && pdfOk(outcome)
  record('Export Release', check, ok, ok ? `${outcome.bytes} bytes, ${outcome.pages} page(s)` : JSON.stringify({ waiting, outcome }) + ' ' + plenioErrors().join(' | '))
}

{
  // owner's report 2026-10-09: Plenio was updated while the page was open - every export said "Failed to fetch
  // dynamically imported module .../notationExport-....mjs". Here the server's entry imports another main chunk
  // and the old notation chunk is gone: the page says to reload, and the reloaded page saves the PDF.
  const check = "export: a page older than the server's Plenio says to reload, then saves the PDF"
  const folder = `browser-check/sheet-music-stale-${Date.now()}`
  const title = 'Browser Check Stale Page'
  consoleErrors = []
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.app && window.app.graph, null, { timeout: 90000 })
  const entry = '**/js/plenio.js'
  const notation = '**/js/chunks/notationExport-*.mjs'
  const newer = 'import { a as t } from "./chunks/main-NewerThanThisPage.mjs";\nexport { t as EXTENSION_NAME };\n'
  await page.route(entry, (route) => route.fulfill({ contentType: 'text/javascript', body: newer }))
  await page.route(notation, (route) => route.fulfill({ status: 404, body: 'gone' }))
  const queued = await queueSheetExport(folder, title)
  const waiting = await sheetOutcome(folder, title, queued, 'drawn by the browser after the export')
  const said = await page
    .waitForFunction(() => document.body.innerText.includes('reload the page (F5)'), null, { timeout: 30000 })
    .then(
      () => true,
      () => false
    )
  await page.screenshot({ path: path.join(OUT, 'Export Release - stale page.png') })
  await page.unroute(entry)
  await page.unroute(notation)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.app && window.app.graph, null, { timeout: 90000 })
  const outcome = await sheetOutcome(folder, title, -1)
  const ok = !!waiting.waiting && said && pdfOk(outcome)
  record(
    'Export Release',
    check,
    ok,
    ok ? `told to reload; then ${outcome.bytes} bytes, ${outcome.pages} page(s)` : JSON.stringify({ waiting, said, outcome }) + ' ' + plenioErrors().join(' | ')
  )
}

{
  // GitHub issue #3: a manual document stayed manual for good (Use draft greyed out without a draft). With
  // Nodes 2.0, as the reporter uses ComfyUI: the editor opens and Back to auto hands the lyrics back.
  const check = 'Song Sheet: a manual document goes back to automatic (Nodes 2.0)'
  consoleErrors = []
  await page.evaluate(async () => {
    await window.app.extensionManager.setting.set('Comfy.VueNodes.Enabled', true)
    await window.app.loadGraphData({ last_node_id: 0, last_link_id: 0, nodes: [], links: [], groups: [], config: {}, extra: {}, version: 0.4 }, true, true, 'browser-check-back-to-auto')
    const node = window.LiteGraph.createNode('PlenioSongSheet')
    node.pos = [200, 150]
    window.app.graph.add(node)
    node.widgets.find((w) => w.name === 'sheet_state').value = JSON.stringify({ schema: 'plenio.sheet_state/1', docs: { lyrics: { state: 'manual', text: '[Verse]\nmy own words' } } })
    window.app.graph.setDirtyCanvas(true, true)
  })
  await page.waitForTimeout(1500)
  await page.locator('button.plenio-sheet-open').first().click()
  const back = page.locator('button', { hasText: 'Back to auto' }).first()
  await back.waitFor({ timeout: 15000 })
  const enabled = await back.isEnabled()
  await back.click()
  await page.getByRole('button', { name: 'Apply', exact: true }).first().click()
  await page.waitForTimeout(800)
  const state = await page.evaluate(() => window.app.graph.nodes.find((n) => n.type === 'PlenioSongSheet').widgets.find((w) => w.name === 'sheet_state').value)
  await page.evaluate(async () => { await window.app.extensionManager.setting.set('Comfy.VueNodes.Enabled', false) })
  const ok = enabled && JSON.parse(state).docs.lyrics === undefined
  record('Song Sheet', check, ok, ok ? 'manual -> auto on Apply' : `enabled ${enabled}, state ${state} ` + plenioErrors().join(' | '))
}

{
  // GitHub issue #3 (follow-up): the section tag buttons insert where the cursor is, not at the end - with a real
  // mouse click, which takes the focus from the text first - and [Instrumental] is one of them.
  const check = 'Song Sheet: section tags go where the cursor is'
  consoleErrors = []
  await page.evaluate(async () => {
    await window.app.loadGraphData({ last_node_id: 0, last_link_id: 0, nodes: [], links: [], groups: [], config: {}, extra: {}, version: 0.4 }, true, true, 'browser-check-tags')
    const node = window.LiteGraph.createNode('PlenioSongSheet')
    node.pos = [200, 150]
    window.app.graph.add(node)
    node.widgets.find((w) => w.name === 'sheet_state').value = JSON.stringify({ schema: 'plenio.sheet_state/1', docs: { lyrics: { state: 'manual', text: '[Verse]\nfirst line\nsecond line\n' } } })
    window.app.graph.setDirtyCanvas(true, true)
  })
  await page.waitForTimeout(1000)
  await page.locator('button.plenio-sheet-open').first().click()
  const box = page.locator('.plenio-dialog textarea').first()
  await box.waitFor({ timeout: 15000 })
  await box.click()
  await box.evaluate((el) => el.setSelectionRange(el.value.indexOf('second'), el.value.indexOf('second')))
  await page.locator('button', { hasText: '[Instrumental]' }).first().click()
  await page.waitForTimeout(300)
  const after = await box.evaluate((el) => ({ value: el.value, rest: el.value.slice(el.selectionStart), focused: document.activeElement === el }))
  await page.locator('.plenio-dialog footer button', { hasText: 'Close' }).first().click()
  await page.locator('.plenio-dialog button', { hasText: 'Discard' }).first().click({ timeout: 5000 }).catch(() => undefined)
  const ok = after.value === '[Verse]\nfirst line\n\n[Instrumental]\nsecond line\n' && after.rest === 'second line\n' && after.focused
  record('Song Sheet', check, ok, ok ? '[Instrumental] before the second line, the cursor after it' : JSON.stringify(after) + ' ' + plenioErrors().join(' | '))
}

// 8. continue a song (owner's request 2026-10-11): a release record opens the workflow the song was made
// with, its documents kept in the Song Sheets - dropped onto ComfyUI, or picked in File > Continue a Plenio song….
// An old record (no workflow inside) opens in today's template with the song's settings: the prompt the
// restored workflow makes is the prompt the song was made with.
{
  const check = 'continue: a dropped record gives back the prompt the song was made with (template and own workflow)'
  consoleErrors = []
  const made = await page.evaluate(async () => {
    const app = window.app
    const name = '1 · YuE2 · Song'
    const wf = await (await fetch(`/api/workflow_templates/Plenio-Music-Production-System/${encodeURIComponent(name)}.json`)).json()
    await app.loadGraphData(wf, true, true, 'browser-check-continue-source')
    const g = app.graph
    const set = (node, name, value) => {
      const widget = node.widgets.find((w) => w.name === name)
      widget.value = value
      widget.callback?.(value)
    }
    // settings at the top, a block's widget, a node inside a block, and a block turned on
    set(g.nodes.find((n) => n.type === 'PlenioSongBrief'), 'description', 'a song to continue')
    set(g.nodes.find((n) => n.title === 'Take seed'), 'seed', 4242)
    set(g.getNodeById(4), 'thinking', true)
    set(g.getNodeById(4).subgraph.getNodeById(505), 'max_tokens', 1234)
    g.nodes.find((n) => String(n.title).startsWith('Stems')).mode = 0
    const { output, workflow } = await app.graphToPrompt()
    return { prompt: output, workflow }
  })
  const songRecord = (withWorkflow) => {
    const texts = { title: 'Continued Song', style: 'pop, warm piano', lyrics: '[Verse]\nwe carry on', score: SHEET_SCORE }
    const doc = (text) => ({ state: 'auto', status: 'auto', sha256: 'a'.repeat(64), text })
    const reports = Object.entries(made.prompt)
      .filter(([, n]) => n.class_type === 'PlenioSongSheet')
      .map(([id, n]) => ({
        schema: 'plenio.report/1',
        kind: 'song_sheet',
        status: 'ok',
        data: { node_id: id, documents: Object.fromEntries(Object.keys(texts).filter((k) => Array.isArray(n.inputs[k])).map((k) => [k, doc(texts[k])])) }
      }))
    return {
      schema: 'plenio.record/1', created: '2026-10-11T10:00:00+0200', title: 'Continued Song', versions: { plenio: '0.5.1' },
      documents: Object.fromEntries(Object.entries(texts).map(([k, v]) => [k, doc(v)])), reports,
      audio: { sample_rate: 44100, items: 1, seconds: 90, loudness: [], tags: {} }, files: [], licences: [],
      prompt: made.prompt, fingerprint: 'f'.repeat(64), ...(withWorkflow ? { workflow: made.workflow } : {})
    }
  }
  const outcomes = []
  for (const withWorkflow of [false, true]) {
    await page.evaluate(async () => {
      await window.app.loadGraphData({ last_node_id: 0, last_link_id: 0, nodes: [], links: [], groups: [], config: {}, extra: {}, version: 0.4 }, true, true, 'browser-check-blank')
    })
    await page.evaluate((json) => {
      const files = new DataTransfer()
      files.items.add(new File([json], 'Continued Song.plenio.json', { type: 'application/json' }))
      document.querySelector('canvas').dispatchEvent(new DragEvent('drop', { dataTransfer: files, bubbles: true, cancelable: true }))
    }, JSON.stringify(songRecord(withWorkflow)))
    // the plan is applied once the workflow is loaded: the sheets then hold the documents
    await page
      .waitForFunction(
        () => {
          const sheets = window.app.graph.nodes.filter((n) => n.type === 'PlenioSongSheet')
          return sheets.length > 0 && sheets.every((n) => String(n.widgets.find((w) => w.name === 'sheet_state')?.value).includes('manual'))
        },
        null,
        { timeout: 30000 }
      )
      .catch(() => undefined)
    outcomes.push(
      await page.evaluate(async (original) => {
        const app = window.app
        const now = (await app.graphToPrompt()).output
        const diffs = []
        for (const [id, node] of Object.entries(original)) {
          if (!now[id]) diffs.push(`${id} ${node.class_type} missing`)
          else
            for (const [name, value] of Object.entries(node.inputs)) {
              if (Array.isArray(value) || name === 'sheet_state') continue
              if (JSON.stringify(now[id].inputs[name]) !== JSON.stringify(value)) diffs.push(`${id}.${name}`)
            }
        }
        const extra = Object.keys(now).filter((id) => !original[id])
        const states = app.graph.nodes.filter((n) => n.type === 'PlenioSongSheet').map((n) => JSON.parse(n.widgets.find((w) => w.name === 'sheet_state').value || '{"docs":{}}'))
        const kept = states.flatMap((s) => Object.entries(s.docs).map(([k, d]) => `${k}:${d.state}`)).sort()
        return { diffs, extra, kept, name: app.extensionManager?.workflow?.activeWorkflow?.filename }
      }, made.prompt)
    )
  }
  const want = ['lyrics:manual', 'score:manual', 'style:manual', 'title:manual']
  const ok = outcomes.every((o) => !o.diffs.length && !o.extra.length && JSON.stringify(o.kept) === JSON.stringify(want) && String(o.name).startsWith('Continued Song'))
  record('Continue a song', check, ok, ok ? 'same prompt both ways; title, style, lyrics and score kept (manual)' : JSON.stringify(outcomes) + ' ' + plenioErrors().join(' | '))
}
{
  const check = 'continue: File > Continue a Plenio song… lists the exported song and opens it'
  consoleErrors = []
  await page.evaluate(async () => {
    await window.app.loadGraphData({ last_node_id: 0, last_link_id: 0, nodes: [], links: [], groups: [], config: {}, extra: {}, version: 0.4 }, true, true, 'browser-check-blank')
  })
  await page.keyboard.press('Escape')
  // the entry in the File menu
  await page.locator('.comfy-menu-button-wrapper').first().click().catch(() => undefined)
  const file = page.locator('[role=menuitem]', { hasText: /^File/ }).first()
  if (await file.count()) await file.hover()
  // a leaf entry: the File entry's own text holds its submenu's
  const entry = page.locator('[role=menuitem]:not(:has([role=menuitem]))', { hasText: 'Continue a Plenio song' }).first()
  const inMenu = (await entry.count()) > 0
  if (inMenu) await entry.click()
  else await page.evaluate(() => window.app.extensionManager.command.execute('Plenio.ContinueSong'))
  const dialog = page.locator('.plenio-continue')
  await dialog.waitFor({ timeout: 15000 })
  const row = dialog.locator('.row', { hasText: exported?.title ?? 'Browser Check Sheet' }).first()
  await row.waitFor({ timeout: 15000 })
  await page.screenshot({ path: path.join(OUT, 'continue a song - dialog.png') })
  // newest first: the rows' dates never rise
  const dates = (await dialog.locator('.row .meta').allTextContents()).map((text) => text.trim().slice(0, 16))
  const newestFirst = dates.length > 1 && dates.every((date, i) => i === 0 || date <= dates[i - 1])
  await row.locator('button.primary').click()
  await dialog.waitFor({ state: 'detached', timeout: 30000 }).catch(() => undefined)
  await page
    .waitForFunction(() => String(window.app.graph.nodes.find((n) => n.type === 'PlenioSongSheet')?.widgets.find((w) => w.name === 'sheet_state')?.value).includes('manual'), null, { timeout: 30000 })
    .catch(() => undefined)
  const restored = await page.evaluate(() => {
    const app = window.app
    const sheet = app.graph.nodes.find((n) => n.type === 'PlenioSongSheet')
    const exporter = app.graph.nodes.find((n) => n.type === 'PlenioExportRelease')
    const state = sheet ? JSON.parse(sheet.widgets.find((w) => w.name === 'sheet_state').value || '{}') : null
    return { lyrics: state?.docs?.lyrics, folder: exporter?.widgets.find((w) => w.name === 'folder')?.value, name: app.extensionManager?.workflow?.activeWorkflow?.filename }
  })
  const ok =
    inMenu &&
    newestFirst &&
    restored.lyrics?.state === 'manual' &&
    restored.lyrics?.text === SHEET_LYRICS &&
    restored.folder === exported?.folder &&
    restored.name === exported?.title
  record('Continue a song', check, ok, ok ? `newest first; opened "${restored.name}" with its lyrics (manual)` : JSON.stringify({ inMenu, newestFirst, dates: dates.slice(0, 5), restored, exported }) + ' ' + plenioErrors().join(' | '))
}

fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1) + '\n')
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed; screenshots and results in ${OUT}`)
await browser.close()
process.exit(failed.length ? 1 : 0)
