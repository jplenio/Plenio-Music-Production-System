// Tutorial 0 · System Check: open the template, run the check and read its report - versions, the GPU,
// which templates are ready, the model files, the download policy and the hardware table.

import { FOOT } from './lib/studio.mjs'
import { intro } from './lib/scenes.mjs'

export const meta = {
  name: 'Plenio tutorial 0 - System Check',
  template: '0 · System Check',
}

const CHECK = 'System Check', ABOUT = 'About this template'

// The report is as tall as its text: the node grows to show all of it (as a drag on its corner would),
// and the camera moves over it, section by section.
async function growNode(s) {
  // the report arrives a moment after the run: wait for its last section
  await s.page.waitForFunction(() => document.querySelector('.plenio-summary')?.textContent.includes('Recommendations'), null, { timeout: 30000 }).catch(() => {})
  await s.page.evaluate(async (key) => {
    const n = window.__tut.node(key)
    const el = document.querySelector('.plenio-summary')
    if (!el) return
    n.setSize([Math.max(n.size[0], 760), n.size[1]])
    // grow until nothing of the report is hidden (its height follows the node a frame later)
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 250))
      const hidden = el.scrollHeight - el.clientHeight
      if (hidden <= 1) break
      n.setSize([n.size[0], n.size[1] + hidden + 4])
      window.app.canvas.setDirty(true, true)
      window.app.canvas.draw(true, true)
    }
  }, CHECK)
  await s.wait(600)
}

// the canvas rect of the report from a heading (or its top) down to the next heading
function sectionRect(s, heading) {
  return s.page.evaluate(([key, title]) => {
    const n = window.__tut.node(key)
    const el = [...document.querySelectorAll('.plenio-summary')].find((x) => x.getBoundingClientRect().width)
    const ds = window.app.canvas.ds, c = window.app.canvas.canvas.getBoundingClientRect()
    const toCanvas = (y) => (y - c.top) / ds.scale - ds.offset[1]
    const heads = [...el.querySelectorAll('h3, h4, h5')]
    const i = title ? heads.findIndex((h) => h.textContent.toLowerCase().startsWith(title)) : -1
    const top = i >= 0 ? heads[i].getBoundingClientRect().top : el.getBoundingClientRect().top
    const next = heads[i + 1]
    const bottom = next ? next.getBoundingClientRect().top : el.getBoundingClientRect().bottom
    return { x: n.pos[0], y: toCanvas(top) - 12, w: n.size[0], h: Math.max(160, toCanvas(bottom) - toCanvas(top) + 16) }
  }, [CHECK, heading])
}

async function showSection(s, heading, ms = 1400) {
  await s.fly(await sectionRect(s, heading), ms, 0.94)
  await s.wait(300)
}

export default async function systemCheck(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">0 ·</span> System Check',
    subtitle: 'Is this ComfyUI ready for Plenio? One run tells you - and changes nothing',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 0 · System Check',
    items: [
      'One run checks this ComfyUI for Plenio - and changes nothing',
      'The models: what is there, what is missing',
      'The report - and what to do about it',
    ],
  })

  s.chapter('Getting started')
  await s.wait(600)
  s.caption('Open the template browser: Templates.')
  await s.click(page.getByRole('button', { name: 'Templates' }), { pause: 500 })
  await s.wait(2600)
  s.caption('Plenio’s templates are listed under Extensions → Plenio-Music-Production-System.')
  await s.hover(page.getByText('Node Basics', { exact: true }).first())
  await page.mouse.wheel(0, 600)
  await s.wait(900)
  await s.click(page.getByText('Plenio-Music-Production-System', { exact: true }).first(), { pause: 400 })
  await page.waitForFunction(() => [...document.querySelectorAll('img[alt*="System"]')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {})
  await s.wait(1600)
  const card = page.getByText('0 · System Check', { exact: true }).first()
  s.caption('0 · System Check: start here, after installing Plenio.')
  await s.hover(card, { fy: -4 })
  await s.wait(2600)
  await s.click(card, { fy: -4, pause: 300 })
  await page.waitForFunction(() => window.app.graph.nodes.some((n) => n.type === 'PlenioSystemCheck'), null, { timeout: 30000 })
  await s.wait(2500)

  s.chapter('The check')
  await s.flyNodes([ABOUT, CHECK], 1300, 0.92)
  await s.say('The template is one node, with a note that explains it.', 3400)
  s.caption('About this template: what the check looks at.')
  await s.flyNodes([ABOUT], 1100, 0.9)
  await s.read('About this template: what the check looks at.', 5200)
  // close to the node's head: the list of its one widget is short and small
  const head = await s.page.evaluate((k) => { const r = window.__tut.nodeRect(k); return { ...r, y: r.y - 40, h: 260 } }, CHECK)
  await s.fly(head, 1100, 0.6)
  s.caption('detail: “summary” is the readable overview; “full” adds the raw facts for a bug report.')
  await s.showCombo(CHECK, 'detail', { read: 2600, browse: 2 })
  await s.wait(800)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: { [CHECK]: 'The check reads the installation - it loads no model and downloads nothing.' } })
  await growNode(s)
  await s.flyNodes([CHECK], 1200, 0.94, 10)
  await s.wait(800)

  s.chapter('The report')
  await showSection(s, null)
  await s.say('The verdict first - then ComfyUI, the frontend, Plenio, Python and torch, with their versions.', 5600)
  await s.say('The GPU with its memory, the system RAM, the Python packages - and the download policy.', 5600)
  await s.say('And the local LLMs Plenio found - GGUF files, LM Studio, Ollama: each can be the writer model for lyrics and arrangements.', 6400)
  await showSection(s, 'templates')
  await s.say('The templates: for each one, whether its model files are installed - or what is missing.', 6000)
  await showSection(s, 'model files')
  await s.say('Every model file the templates load: folder, size, licence and status.', 5600)
  await showSection(s, 'plenio assets')
  await s.say('The Plenio assets: the lyrics ASR - Qwen3-ASR, its forced aligner and the Whisper fallback - with the folder Plenio keeps them in, and whether they are there.', 7200)
  await showSection(s, 'hardware')
  await s.say('The hardware table: which model files suit how much GPU memory - the row for this machine is marked.', 6800)
  await showSection(s, 'recommendations')
  await s.say('And the recommendations for this machine. Nothing is applied on its own: you choose the files in the loader nodes.', 6400)
  await s.flyNodes([CHECK], 1600, 0.94, 10)
  await s.say('The check only reports. It never changes a setting, never loads a model, and never downloads one.', 6000)

  s.card('end', {
    title: 'Next: 1 · YuE2 · Song',
    lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
