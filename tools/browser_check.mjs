// Browser checks of the shipped templates in the real ComfyUI frontend (Phase 8, V2).
//
// For every template in example_workflows/:
//   1. load    - loads like the template browser does; Plenio errors in the console fail the check
//   2. reload  - serialize -> load -> serialize: widget values and the API prompt stay identical
//   3. options - each optional block on/off (and Master bypassed): the frontend's API prompt has the
//                expected shape and the server validates it (dummy model files, see below)
//   4. app     - App Mode shows the configured controls and outputs
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
  // Load Audio's frontend adds its player and upload widgets after the file name (as native templates ship)
  const FRONTEND_EXTRAS = { LoadAudio: 2 }
  const differing = first.serialized.nodes.filter((n) => {
    const shipped = template.nodes.find((t) => t.id === n.id)?.widgets_values ?? []
    const saved = (n.widgets_values ?? []).slice(0, (n.widgets_values ?? []).length - (FRONTEND_EXTRAS[n.type] ?? 0))
    return JSON.stringify(saved) !== JSON.stringify(shipped)
  })
  record(name, 'load: widget values as shipped', differing.length === 0, differing.map((n) => `${n.id} ${n.type}: ${JSON.stringify(n.widgets_values)}`).join(' | '))
  record(name, 'load: no Plenio console errors', plenioErrors().length === 0, plenioErrors().slice(0, 2).join(' | '))
  record(name, 'load: node ids kept (no renumbering)', renumbered.length === 0, renumbered.slice(0, 2).join(' | '))
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })

  // 2. save / reload
  await load(first.serialized, `${name} (reloaded)`)
  const second = await snapshot()
  const sameValues = JSON.stringify(first.values) === JSON.stringify(second.values)
  const samePrompt = JSON.stringify(first.output) === JSON.stringify(second.output)
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

fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1) + '\n')
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed; screenshots and results in ${OUT}`)
await browser.close()
process.exit(failed.length ? 1 : 0)
