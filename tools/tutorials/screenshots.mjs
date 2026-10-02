// The README's screenshots, made again on a running ComfyUI with Plenio (the dev server of README.md), at
// twice the screen resolution: the template graphs after a real run (cropped to the groups), three
// templates in App mode, the System Check report, the EQ panel and the Stem Mixer.
//
//   node tools/tutorials/screenshots.mjs [--url http://127.0.0.1:8190] [--out assets/branding/<version>]
//        [--audio <an unmastered song for Enhance & Master>] [--only name,name] [--headed]
//
// The runs are real (on an RTX 5060 Ti: YuE2 about two minutes, a cover about six, MiniMax about eight).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openStudio } from './lib/studio.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PROJECT = path.resolve(HERE, '..', '..')
const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const url = option('url', 'http://127.0.0.1:8190')
const version = JSON.parse(fs.readFileSync(path.join(PROJECT, 'frontend', 'package.json'), 'utf8')).version
const out = path.resolve(option('out', path.join(PROJECT, 'assets', 'branding', version)))
const SAMPLE = path.join(PROJECT, 'assets', 'sound-samples', 'Example Album - A Feeling With No Address.mp3')
const audio = option('audio', SAMPLE)
const only = option('only', null)?.split(',')
const want = (name) => !only || only.includes(name)
const headless = !args.includes('--headed')
fs.mkdirSync(out, { recursive: true })

// --- helpers on a studio session -----------------------------------------------------------------------

function helpers(s) {
  const page = s.page
  const open = async (template) => {
    await page.evaluate(async (name) => {
      const wf = await (await fetch('/api/workflow_templates/Plenio-Music-Production-System/' + encodeURIComponent(`${name}.json`))).json()
      await window.app.loadGraphData(wf, true, true, name) // the tab is named after the template
    }, template)
    await s.wait(2500)
  }
  const shot = async (file, clip) => {
    // no pointer in the picture (the recording's drawn cursor)
    await page.evaluate(() => { const c = document.getElementById('tut-cursor'); if (c) c.style.display = 'none' })
    await s.wait(200)
    await page.screenshot({ path: path.join(out, file), ...(clip ? { clip } : {}) })
    console.log(file)
  }
  // the screen rectangle of canvas rect r, inside the viewport
  const toClip = (r, margin = 12) => page.evaluate(([rect, m]) => {
    const a = window.__tut.toScreen(rect.x, rect.y), b = window.__tut.toScreen(rect.x + rect.w, rect.y + rect.h)
    const x = Math.max(0, a.x - m), y = Math.max(0, a.y - m)
    return { x, y, width: Math.min(window.innerWidth, b.x + m) - x, height: Math.min(window.innerHeight, b.y + m) - y }
  }, [r, margin])
  // the whole graph (every group and the note), framed and cropped
  const graphShot = async (file) => {
    const rect = await page.evaluate(() => {
      const rects = window.app.graph._groups.map((g) => window.__tut.groupRect(g.title))
      const note = window.app.graph.nodes.find((n) => n.title === 'About this template')
      if (note) rects.push(window.__tut.nodeRect(note.id))
      return window.__tut.unite(rects, 10)
    })
    await s.fly(rect, 10, 0.99)
    await s.wait(1500)
    await shot(file, await toClip(rect))
  }
  const nodeShot = async (file, key, margin = 14) => {
    await s.flyNodes([key], 10, 0.96, 10)
    await s.wait(1500)
    await shot(file, await toClip(await page.evaluate((k) => window.__tut.nodeRect(k), key), margin))
  }
  const run = async () => {
    await page.evaluate(() => { window.__tut.events = []; window.__tut.error = null })
    await page.evaluate(() => window.app.queuePrompt(0, 1))
    await page.waitForFunction(() => window.__tut.running || window.__tut.events.some((e) => e.t === 'start'), null, { timeout: 60000 })
    await page.waitForFunction(() => !window.__tut.running, null, { timeout: 40 * 60000, polling: 1000 })
    const error = await page.evaluate(() => window.__tut.error ?? null)
    if (error) throw new Error('the run failed: ' + JSON.stringify(error).slice(0, 500))
    await s.wait(2500)
  }
  const upload = async (node, file) => {
    const name = await page.evaluate(async ([base, data]) => {
      const form = new FormData()
      form.append('image', new Blob([Uint8Array.from(atob(data), (c) => c.charCodeAt(0))]), base)
      form.append('type', 'input')
      form.append('overwrite', 'true')
      return (await (await fetch('/upload/image', { method: 'POST', body: form })).json()).name
    }, [path.basename(file), fs.readFileSync(file).toString('base64')])
    await page.evaluate(([key, value]) => window.__tut.setWidget(key, 'audio', value), [node, name])
  }
  return { open, shot, graphShot, nodeShot, run, upload, toClip }
}

// --- the graphs, the reports and the panels (1920 x 1000 at twice the resolution) ------------------------

if (['YuE2-graph', 'YuE2-cover-graph', 'Minimax-graph', 'SoundEnhance-graph', 'YuE2-DAW-graph', '0-System Check', 'graphical-EQ', 'Stems'].some((n) => want(`Screenshot ${n}.png`))) {
  const s = await openStudio({ url, out: path.join(out, '.session'), headless, scale: 2 })
  const h = helpers(s)
  const page = s.page
  try {
    await s.openComfy()
    if (want('Screenshot 0-System Check.png')) {
      await h.open('0 · System Check')
      await h.run()
      await page.evaluate(() => {
        const n = window.__tut.node('System Check')
        const el = [...document.querySelectorAll('.plenio-summary')].find((x) => x.getBoundingClientRect().width)
        n.setSize([Math.max(n.size[0], 760), n.size[1] + Math.max(0, el.scrollHeight - el.clientHeight) + 24])
        window.app.canvas.setDirty(true, true)
      })
      await h.nodeShot('Screenshot 0-System Check.png', 'System Check')
    }
    for (const [template, name, prepare] of [
      ['1 · YuE2 · Song', 'YuE2-graph'],
      ['2 · YuE2 · Cover', 'YuE2-cover-graph', () => h.upload('Source recording', SAMPLE)],
      ['3 · MiniMax · Song', 'Minimax-graph'],
    ]) {
      if (!want(`Screenshot ${name}.png`)) continue
      await h.open(template)
      await prepare?.()
      await h.run()
      await h.graphShot(`Screenshot ${name}.png`)
    }
    if (want('Screenshot YuE2-DAW-graph.png')) {
      await h.open('5 · YuE2 · DAW')
      await h.graphShot('Screenshot YuE2-DAW-graph.png')
    }
    if (['SoundEnhance-graph', 'graphical-EQ', 'Stems'].some((n) => want(`Screenshot ${n}.png`))) {
      await h.open('4 · Enhance & Master')
      await h.upload('Source', audio)
      const stems = want('Screenshot Stems.png')
      if (stems) await page.evaluate(() => { window.__tut.node('Stems (optional)').mode = 0; window.app.canvas.setDirty(true, true) })
      await h.run()
      if (want('Screenshot SoundEnhance-graph.png')) await h.graphShot('Screenshot SoundEnhance-graph.png')
      if (want('Screenshot graphical-EQ.png')) {
        await s.flyNodes(['PlenioEQ'], 10, 0.95)
        // the match as the run left it: the proposed bands over the song's spectrum
        await h.nodeShot('Screenshot graphical-EQ.png', 'PlenioEQ')
      }
      if (stems) {
        // into the Stems subgraph: the Stem Mixer with the strips of the run
        await page.evaluate(() => {
          const n = window.__tut.node('Stems (optional)')
          window.app.canvas.openSubgraph(n.subgraph, n)
        })
        await s.wait(2000)
        // every strip in view: the panel scrolls above 620 px; for the picture it may be as tall as it is
        await page.evaluate(() => {
          const n = window.app.canvas.graph.nodes.find((x) => x.type === 'PlenioStemMixer')
          const w = n.widgets.find((x) => x.element?.classList?.contains('plenio-mix'))
          if (!w) return
          const extra = w.element.scrollHeight - w.element.clientHeight
          w.options.getMaxHeight = () => 4000
          w.options.getMinHeight = () => w.element.scrollHeight
          n.setSize([n.size[0], n.size[1] + Math.max(0, extra) + 20])
          window.app.canvas.setDirty(true, true)
        })
        await s.wait(1500)
        const rect = await page.evaluate(() => {
          const n = window.app.canvas.graph.nodes.find((x) => x.type === 'PlenioStemMixer')
          const title = window.LiteGraph?.NODE_TITLE_HEIGHT ?? 30
          return { x: n.pos[0], y: n.pos[1] - title, w: n.size[0], h: n.size[1] + title }
        })
        await s.fly(rect, 10, 0.96)
        await s.wait(1500)
        await h.shot('Screenshot Stems.png', await h.toClip(rect, 14))
      }
    }
  } finally {
    await s.browser.close()
  }
}

// --- App mode (a smaller window, as a user would have it) ------------------------------------------------

if (['YuE2-appmode', 'Minimax-appmode', 'SoundEnhance-appmode'].some((n) => want(`Screenshot ${n}.png`))) {
  const s = await openStudio({ url, out: path.join(out, '.session'), headless, scale: 2, width: 1260, height: 870 })
  const h = helpers(s)
  const page = s.page
  try {
    await s.openComfy()
    for (const [template, name] of [['1 · YuE2 · Song', 'YuE2-appmode'], ['3 · MiniMax · Song', 'Minimax-appmode'], ['4 · Enhance & Master', 'SoundEnhance-appmode']]) {
      if (!want(`Screenshot ${name}.png`)) continue
      await h.open(template)
      if (!(await page.locator('button', { hasText: 'Build an app' }).count())) await page.mouse.click(84, 65)
      await s.wait(1800)
      const skip = page.getByRole('button', { name: 'Skip', exact: true })
      if (await skip.count()) { await skip.click(); await s.wait(1000) }
      await h.shot(`Screenshot ${name}.png`)
      await page.mouse.click(84, 65)
      await s.wait(1200)
    }
  } finally {
    await s.browser.close()
  }
}
fs.rmSync(path.join(out, '.session'), { recursive: true, force: true })
