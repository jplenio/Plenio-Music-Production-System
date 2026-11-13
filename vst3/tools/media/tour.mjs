// The plug-in's tour, for the tutorial's animations and the videos: a pointer moves through the plug-in's window,
// clicks and types, and every moment is kept as a frame (JPEG) with its time. Drives the real plug-in over the
// DevTools protocol (tools/dev/editorhost.ps1, or a DAW started with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS).
//
//   node tools/media/tour.mjs <out> <scene> [<scene> …]      scenes: new-song takes lyrics notes daw cover library,
//                                                             reaper-put (in REAPER, its DAW tab open: Put on tracks)
//   node tools/media/tour.mjs <out> timelapse [seconds] [interval]   a frame every interval (s) while takes are made
//
// Writes <out>/<scene>/frame-00001.jpg … and frames.txt, an ffmpeg concat list with every frame's duration
// (tools/media/make_media.py turns them into animations and clips).

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { connect } from '../dev/cdp-lib.mjs'

const [, , out, ...args] = process.argv
if (!out || args.length === 0) {
  console.log('usage: node tools/media/tour.mjs <out> <scene> [<scene> …] | timelapse [seconds] [interval]')
  process.exit(1)
}
const cdp = await connect()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const js = (v) => JSON.stringify(v)

// ---------------------------------------------------------------------------------------------------------------
// The pointer: drawn into the page (a screenshot has no system cursor), moved with the mouse events it sends

await cdp.evaluate(`(() => {
  if (window.__tour) return true
  const style = document.createElement('style')
  style.textContent = '#tour-pointer{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:28px;height:28px;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 5px rgba(0,0,0,.65))}' +
    '.tour-ripple{position:fixed;z-index:2147483646;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid #ff5aa0;animation:tour-ripple .6s ease-out forwards}' +
    '@keyframes tour-ripple{from{transform:scale(.25);opacity:1}to{transform:scale(1.3);opacity:0}}'
  document.head.appendChild(style)
  const p = document.createElement('div')
  p.id = 'tour-pointer'
  p.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M4 2l15 11-6.6 1.3L16 21l-3 1.4-3.7-6.9L4 20z" fill="#fff" stroke="#14121c" stroke-width="1.4" stroke-linejoin="round"/></svg>'
  document.body.appendChild(p)
  window.__tour = {
    move(x, y) { p.style.transform = 'translate(' + (x - 4.5) + 'px,' + (y - 2.3) + 'px)' },
    ripple(x, y) { const r = document.createElement('div'); r.className = 'tour-ripple'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 800) },
    hide() { p.style.transform = 'translate(-100px,-100px)' }
  }
  return true
})()`)

const pointer = { x: 560, y: 420 }

/** The middle of an element: "selector", "selector|text it starts with", "selector|=its whole text", or "field:<label>". */
async function centerOf(spec) {
  const r = await cdp.evaluate(`(() => {
    const spec = ${js(spec)}
    let el
    if (spec.startsWith('field:')) {
      const label = spec.slice(6)
      const field = [...document.querySelectorAll('.field')].find((f) => f.querySelector('.field-label')?.innerText.trim().startsWith(label))
      el = field?.querySelector('input, select, textarea')
    } else if (spec.endsWith('@middle')) {
      // of all that are in sight, the one nearest the middle of the window
      const mid = innerWidth / 2
      el = [...document.querySelectorAll(spec.slice(0, -7))]
        .map((e) => ({ e, b: e.getBoundingClientRect() }))
        .filter(({ b }) => b.width > 0 && b.left > 40 && b.right < innerWidth - 40)
        .sort((a, b) => Math.abs(a.b.left - mid) - Math.abs(b.b.left - mid))[0]?.e
      if (el) { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }
    } else {
      const [sel, text] = spec.split('|')
      const all = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || e.getClientRects().length)
      el = !text ? all[0] : text.startsWith('=') ? all.find((e) => e.innerText.trim() === text.slice(1)) : all.find((e) => e.innerText.trim().startsWith(text))
    }
    if (!el) return null
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const b = el.getBoundingClientRect()
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 }
  })()`)
  if (!r) throw new Error('not found: ' + spec)
  return r
}

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)

async function moveTo(target, ms = 650, buttons = 0) {
  const to = typeof target === 'string' ? await centerOf(target) : target
  const from = { ...pointer }
  const steps = Math.max(1, Math.round(ms / 22))
  for (let i = 1; i <= steps; i++) {
    const e = buttons ? i / steps : ease(i / steps)
    pointer.x = from.x + (to.x - from.x) * e
    pointer.y = from.y + (to.y - from.y) * e
    await cdp.evaluate(`__tour.move(${pointer.x}, ${pointer.y})`)
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pointer.x, y: pointer.y, button: buttons ? 'left' : 'none', buttons })
    await sleep(22)
  }
}

async function click(target, { count = 1, pause = 300, ms = 650 } = {}) {
  if (target) await moveTo(target, ms)
  await cdp.evaluate(`__tour.ripple(${pointer.x}, ${pointer.y})`)
  for (let c = 1; c <= count; c++) {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pointer.x, y: pointer.y, button: 'left', clickCount: c, buttons: 1 })
    await sleep(40)
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pointer.x, y: pointer.y, button: 'left', clickCount: c, buttons: 0 })
  }
  await sleep(pause)
}

async function drag(from, to, ms = 800) {
  await moveTo(from)
  await cdp.evaluate(`__tour.ripple(${pointer.x}, ${pointer.y})`)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pointer.x, y: pointer.y, button: 'left', clickCount: 1, buttons: 1 })
  await sleep(120)
  await moveTo(to, ms, 1)
  await sleep(120)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pointer.x, y: pointer.y, button: 'left', clickCount: 1, buttons: 0 })
}

async function type(text, cps = 24) {
  for (const ch of text) {
    await cdp.send('Input.insertText', { text: ch })
    await sleep(1000 / cps)
  }
}

/** Selects text in a field (by label) or a textarea (selector), from `from` (text) or all of it. */
async function select(spec, from) {
  await cdp.evaluate(`(() => {
    const spec = ${js(spec)}
    const el = spec.startsWith('field:')
      ? [...document.querySelectorAll('.field')].find((f) => f.querySelector('.field-label')?.innerText.trim().startsWith(spec.slice(6)))?.querySelector('input, textarea')
      : document.querySelector(spec)
    el.focus()
    const at = ${js(from ?? null)} === null ? 0 : el.value.indexOf(${js(from ?? '')})
    const end = ${js(from ?? null)} === null ? el.value.length : at + ${js((from ?? '').length)}
    el.setSelectionRange(at, end)
    return at
  })()`)
}

// ---------------------------------------------------------------------------------------------------------------
// Recording: frames as fast as the page gives them, each with its time

let recording = null

async function start(name) {
  const dir = join(out, name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  recording = { dir, frames: [], running: true }
  recording.done = (async () => {
    while (recording.running) {
      const t = performance.now()
      const answer = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 })
      if (answer.result?.data) recording.frames.push({ t, data: answer.result.data })
    }
  })()
  await sleep(500) // the scene's first look
}

async function stop() {
  await sleep(700) // the scene's last look
  recording.running = false
  await recording.done
  const { dir, frames } = recording
  recording = null
  let list = ''
  for (let i = 0; i < frames.length; i++) {
    const name = `frame-${String(i + 1).padStart(5, '0')}.jpg`
    await writeFile(join(dir, name), Buffer.from(frames[i].data, 'base64'))
    const next = frames[i + 1]?.t ?? frames[i].t + 100
    list += `file '${name}'\nduration ${((next - frames[i].t) / 1000).toFixed(3)}\n`
  }
  list += `file 'frame-${String(frames.length).padStart(5, '0')}.jpg'\n`
  await writeFile(join(dir, 'frames.txt'), list)
  console.log(`${dir}: ${frames.length} frames, ${((frames.at(-1).t - frames[0].t) / 1000).toFixed(1)} s`)
}

// ---------------------------------------------------------------------------------------------------------------
// The scenes

/** A melody note near the middle of the piano roll, from the canvas itself (its pink start). */
async function aNote() {
  return cdp.evaluate(`(() => {
    const c = document.querySelector('canvas.roll')
    const g = c.getContext('2d')
    const { data, width, height } = g.getImageData(0, 0, c.width, c.height)
    const box = c.getBoundingClientRect(), sx = c.width / box.width, sy = c.height / box.height
    let best = null
    for (let y = 2; y < height - 2; y += 2)
      for (let x = Math.floor(width * 0.3); x < width * 0.7; x += 2) {
        const i = (y * width + x) * 4
        if (data[i] > 235 && data[i + 1] < 120 && data[i + 2] > 130 && data[i + 2] < 200) {
          const d = Math.abs(x - width / 2) + Math.abs(y - height * 0.55)
          if (!best || d < best.d) best = { x, y, d }
        }
      }
    if (!best) return null
    return { x: box.left + (best.x + 6) / sx, y: box.top + best.y / sy, row: box.height / 40 }
  })()`)
}

const scenes = {
  async 'new-song'() {
    await start('new-song')
    await click('.bar button|New')
    await sleep(800)
    await click('.dialog.new-song .search input')
    await type('dance pop')
    await sleep(500)
    await click('.dialog.new-song .style|Dance pop')
    await sleep(1100)
    await cdp.evaluate(`(() => { const f = [...document.querySelectorAll('.dialog.new-song .field')].find((x) => x.querySelector('.field-label')?.innerText.trim().startsWith('Length')); const s = f.querySelector('select'); s.value = 'short (about 1:30)'; s.dispatchEvent(new Event('change', { bubbles: true })); return true })()`)
    await click('field:An idea for the words')
    await select('field:An idea for the words')
    await type('Summer on a rooftop: friends, one speaker and a song nobody wants to end.')
    await sleep(500)
    await click('.dialog.new-song button|More settings')
    await sleep(700)
    await click('.dialog.new-song label|Cover Art')
    await sleep(500)
    await click('.dialog.new-song .runs .segmented button|2')
    await sleep(300)
    await click('.dialog.new-song .make', { pause: 1800 })
    await stop()
  },

  async takes() {
    await start('takes')
    await click('.row.take .take-name|Take 2', { pause: 1400 })
    await click('.row.stem .ms.solo', { pause: 900 })
    await click('.row.stem .ms.solo', { pause: 600 })
    await click('.row.take .take-name|Take 1', { pause: 1200 })
    await stop()
  },

  async lyrics() {
    await start('lyrics')
    await click('.side button|Words', { pause: 600 })
    const area = '.pane textarea'
    await click(area)
    await select(area, 'Catch the spark before the colors drain')
    await sleep(500)
    await type('Catch the spark before the city wakes')
    await sleep(1600)
    await moveTo('.generate .go', 700)
    await sleep(1200)
    await stop()
  },

  async notes() {
    await start('notes')
    for (let i = 0; i < 3; i++) await click('button[title="Zoom in"]', { pause: 250, ms: i ? 300 : 650 })
    await sleep(600)
    const note = await aNote()
    if (!note) throw new Error('no note in the piano roll')
    await click(note, { pause: 400 })
    await drag(note, { x: note.x + 4, y: note.y - 2.2 * Math.max(6, note.row) }, 700)
    await sleep(1400)
    await click('.lane .chord@middle', { pause: 700 })
    await click('.picker .roots button|=A', { pause: 300 })
    await click('.picker .qualities button|=m', { pause: 400 })
    await click('.picker .btn.primary|Use', { pause: 1400 })
    await stop()
  },

  async daw() {
    await start('daw')
    await click('.side button|DAW', { pause: 700 })
    for (const tile of ['Take', 'Stems', 'MIDI', 'Tempo map', 'Click']) await moveTo(`.tiles .tile|${tile}`, 500).then(() => sleep(450))
    await moveTo('.guide .pick', 700)
    await sleep(1600)
    await stop()
  },

  async cover() {
    await start('cover')
    await click('.header .cover', { pause: 2600 })
    await click('.cover-view .btn|Close', { pause: 600 })
    await stop()
  },

  // REAPER (the plug-in in REAPER, its DAW tab open): Put on tracks
  async 'reaper-put'() {
    await start('reaper-put')
    await moveTo('.card.reaper .btn.primary', 900)
    await sleep(500)
    await click('.card.reaper .btn.primary', { pause: 2500 })
    await stop()
  },

  async library() {
    await start('library')
    await click('.bar button|Songs', { pause: 1200 })
    await moveTo('.library .row', 600)
    await sleep(1600)
    await click('.library button|Close', { pause: 500 })
    await stop()
  }
}

// ---------------------------------------------------------------------------------------------------------------

if (args[0] === 'timelapse') {
  // a frame every `interval` seconds while takes are made (or for `seconds`), the pointer out of sight
  const seconds = Number(args[1] ?? 900)
  const interval = Number(args[2] ?? 1.5)
  await cdp.evaluate('__tour.hide()')
  const dir = join(out, 'timelapse')
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  const until = Date.now() + seconds * 1000
  let n = 0
  let after = 0
  while (Date.now() < until) {
    const answer = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 })
    n += 1
    await writeFile(join(dir, `frame-${String(n).padStart(5, '0')}.jpg`), Buffer.from(answer.result.data, 'base64'))
    const busy = await cdp.evaluate(`!!document.querySelector('.header .jobs .job')`)
    if (!busy && ++after > 4) break // the takes are here: a few frames of them, then done
    await sleep(interval * 1000)
  }
  console.log(`${dir}: ${n} frames`)
} else {
  for (const name of args) {
    if (!scenes[name]) throw new Error('no scene ' + name)
    await scenes[name]()
  }
}
await cdp.evaluate('__tour.hide()')
cdp.close()
