// The recording side of the tutorial videos: a Chromium on a real ComfyUI, a visible cursor, smooth
// mouse moves and canvas camera moves, the screen captured through the DevTools screencast into a
// real-time video, and markers (captions, chapters, cards, fast-forwarded waits) for the edit.
//
// The page is laid out at `width` x `height` CSS pixels and rendered at `scale` (1920 x 1000 at 1: pixel
// sharp). The edit (render.mjs) adds an 80 px caption band below it: 1920 x 1080.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

export function loadPlaywright() {
  const require = createRequire(import.meta.url)
  for (const name of [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean)) {
    try {
      return require(name)
    } catch {}
  }
  throw new Error('Playwright not found: set PLAYWRIGHT_MODULE to its folder (or install playwright)')
}

// --- page overlays: the cursor, the click ripple, a key HUD and a spotlight ---------------------------

const OVERLAY = `(() => {
  if (window.__tut) return
  const tut = (window.__tut = { events: [], running: false, executing: null, stop: null })
  const css = \`
    #tut-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 2147483647;
      pointer-events: none; transform: translate(-100px, -100px); transition: none; filter: drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
    .tut-ripple { position: fixed; z-index: 2147483646; pointer-events: none; width: 44px; height: 44px; margin: -22px 0 0 -22px;
      border-radius: 50%; border: 3px solid rgba(255, 196, 64, .95); animation: tut-ripple .55s ease-out forwards; }
    @keyframes tut-ripple { from { transform: scale(.25); opacity: 1 } to { transform: scale(1.35); opacity: 0 } }
    #tut-keys { position: fixed; left: 50%; top: 12px; transform: translateX(-50%); z-index: 2147483647; pointer-events: none; display: flex; gap: 6px;
      opacity: 0; transition: opacity .2s; }
    #tut-keys.on { opacity: 1 }
    #tut-keys kbd { font: 600 17px/1 "Segoe UI", system-ui, sans-serif; color: #fff; background: rgba(20, 22, 28, .92);
      border: 1px solid rgba(255,255,255,.35); border-bottom-width: 3px; border-radius: 7px; padding: 8px 12px; }
    .tut-spot { position: fixed; z-index: 2147483645; pointer-events: none; border: 3px solid #ffc440; border-radius: 9px;
      box-shadow: 0 0 0 4000px rgba(0,0,0,.28), 0 0 18px rgba(255,196,64,.8); animation: tut-spot 1.2s ease-in-out infinite alternate; }
    @keyframes tut-spot { from { box-shadow: 0 0 0 4000px rgba(0,0,0,.28), 0 0 8px rgba(255,196,64,.6) } to { box-shadow: 0 0 0 4000px rgba(0,0,0,.28), 0 0 24px rgba(255,196,64,1) } }
  \`
  const install = () => {
    const style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)
    const cursor = document.createElement('div')
    cursor.id = 'tut-cursor'
    cursor.innerHTML = '<svg viewBox="0 0 26 26" width="26" height="26"><path d="M3 2 L3 21 L8.2 16.4 L11.6 24 L15 22.5 L11.7 15.1 L18.6 15.1 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    document.documentElement.appendChild(cursor)
    const keys = document.createElement('div')
    keys.id = 'tut-keys'
    document.documentElement.appendChild(keys)
    const move = (e) => { cursor.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)' }
    addEventListener('pointermove', move, true)
    addEventListener('mousemove', move, true)
    addEventListener('pointerdown', (e) => {
      const ring = document.createElement('div')
      ring.className = 'tut-ripple'
      ring.style.left = e.clientX + 'px'
      ring.style.top = e.clientY + 'px'
      document.documentElement.appendChild(ring)
      setTimeout(() => ring.remove(), 700)
    }, true)
    tut.keys = (labels, ms) => {
      keys.innerHTML = labels.map((l) => '<kbd>' + l + '</kbd>').join('')
      keys.classList.add('on')
      clearTimeout(tut.keysTimer)
      tut.keysTimer = setTimeout(() => keys.classList.remove('on'), ms)
    }
    tut.spot = (r, ms, pad) => {
      const s = document.createElement('div')
      s.className = 'tut-spot'
      Object.assign(s.style, { left: (r.x - pad) + 'px', top: (r.y - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px' })
      document.documentElement.appendChild(s)
      setTimeout(() => s.remove(), ms)
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install)
  else install()
})()`

// --- the canvas camera and graph geometry (run in the page) ------------------------------------------

const CAMERA = `(() => {
  const tut = window.__tut
  // the part of the canvas that is not covered by the side bar and the top bar
  tut.safe = () => {
    const c = window.app.canvas.canvas.getBoundingClientRect()
    return { x: c.left + 64, y: c.top + 92, w: c.width - 64 - 16, h: c.height - 92 - 16 }
  }
  tut.target = (r, pad = 0.94) => {
    const safe = tut.safe()
    const scale = Math.min(safe.w / r.w, safe.h / r.h) * pad
    const c = window.app.canvas.canvas.getBoundingClientRect()
    // screen = (graph + offset) * scale + canvas.left  ->  centre of r at centre of the safe area
    const cx = safe.x + safe.w / 2 - c.left, cy = safe.y + safe.h / 2 - c.top
    return { scale, ox: cx / scale - (r.x + r.w / 2), oy: cy / scale - (r.y + r.h / 2) }
  }
  tut.fly = (r, ms, pad) => new Promise((resolve) => {
    const ds = window.app.canvas.ds
    const to = tut.target(r, pad)
    const from = { scale: ds.scale, ox: ds.offset[0], oy: ds.offset[1] }
    // interpolate the visible centre and the zoom (log), not the raw offset: no swinging
    const safe = tut.safe(), c = window.app.canvas.canvas.getBoundingClientRect()
    const cx = safe.x + safe.w / 2 - c.left, cy = safe.y + safe.h / 2 - c.top
    const centre = (s) => ({ x: cx / s.scale - s.ox, y: cy / s.scale - s.oy })
    const a = centre(from), b = centre(to)
    const start = performance.now()
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const step = (now) => {
      const t = Math.min(1, (now - start) / Math.max(1, ms))
      const e = ease(t)
      const scale = Math.exp(Math.log(from.scale) + (Math.log(to.scale) - Math.log(from.scale)) * e)
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e
      ds.scale = scale
      ds.offset[0] = cx / scale - x
      ds.offset[1] = cy / scale - y
      window.app.canvas.setDirty(true, true)
      window.app.canvas.draw(true, true)
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
  tut.groupRect = (title) => {
    const g = window.app.graph._groups.find((x) => x.title === title)
    if (!g) throw new Error('no group ' + title)
    const [x, y, w, h] = g._bounding
    return { x, y, w, h }
  }
  // a node by its id (a template opened from the browser has string ids), its title or its type
  tut.node = (key) => {
    const nodes = window.app.graph.nodes
    const n = nodes.find((x) => String(x.id) === String(key)) ?? nodes.find((x) => x.title === key) ?? nodes.find((x) => x.type === key)
    if (!n) throw new Error('no node ' + key)
    return n
  }
  tut.nodeRect = (idOrTitle) => {
    const n = tut.node(idOrTitle)
    const title = window.LiteGraph?.NODE_TITLE_HEIGHT ?? 30
    return { x: n.pos[0], y: n.pos[1] - title, w: n.size[0], h: n.size[1] + title, id: n.id }
  }
  tut.unite = (rects, margin = 20) => {
    const x0 = Math.min(...rects.map((r) => r.x)) - margin, y0 = Math.min(...rects.map((r) => r.y)) - margin
    const x1 = Math.max(...rects.map((r) => r.x + r.w)) + margin, y1 = Math.max(...rects.map((r) => r.y + r.h)) + margin
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
  }
  tut.toScreen = (x, y) => {
    const ds = window.app.canvas.ds, c = window.app.canvas.canvas.getBoundingClientRect()
    return { x: (x + ds.offset[0]) * ds.scale + c.left, y: (y + ds.offset[1]) * ds.scale + c.top }
  }
  // the screen box of a widget: a DOM widget's element, else the canvas row of the widget
  tut.widgetBox = (nodeId, name) => {
    const n = tut.node(nodeId)
    const w = n?.widgets?.find((x) => x.name === name)
    if (!w) throw new Error('no widget ' + name + ' on ' + nodeId)
    const el = w.element ?? w.inputEl
    if (el && el.getBoundingClientRect().width) return el.getBoundingClientRect().toJSON()
    const y = w.y ?? w.last_y ?? 0
    const h = w.computedHeight ?? window.LiteGraph?.NODE_WIDGET_HEIGHT ?? 20
    const a = tut.toScreen(n.pos[0] + 15, n.pos[1] + y), b = tut.toScreen(n.pos[0] + n.size[0] - 15, n.pos[1] + y + h)
    return { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y }
  }
  // a button inside a node's DOM widgets (the Song Sheet's "Edit Song Sheet...")
  tut.nodeButton = (nodeId, text) => {
    const n = tut.node(nodeId)
    for (const w of n?.widgets ?? []) {
      const b = [...(w.element?.querySelectorAll?.('button') ?? [])].find((x) => x.textContent.includes(text))
      if (b) return b.getBoundingClientRect().toJSON()
    }
    throw new Error('no button ' + text + ' on ' + nodeId)
  }
  // the audio player of a preview node
  tut.audioBox = (nodeId) => {
    const n = tut.node(nodeId)
    for (const w of n?.widgets ?? []) {
      const a = w.element?.querySelector?.('audio') ?? (w.element?.tagName === 'AUDIO' ? w.element : null)
      if (a) return a.getBoundingClientRect().toJSON()
    }
    return null
  }
  tut.audioSrc = (nodeId) => {
    const n = tut.node(nodeId)
    for (const w of n?.widgets ?? []) {
      const a = w.element?.querySelector?.('audio') ?? (w.element?.tagName === 'AUDIO' ? w.element : null)
      if (a) return a.currentSrc || a.src || null
    }
    return null
  }
  tut.ids = (keys) => Object.fromEntries(keys.map((k) => [k, String(tut.node(k).id)]))
  tut.setWidget = (nodeId, name, value) => {
    const n = tut.node(nodeId)
    const w = n.widgets.find((x) => x.name === name)
    w.value = value
    w.callback?.(value)
    window.app.canvas.setDirty(true, true)
  }
  // run state from the server's events
  const api = window.app.api
  const note = (t, d) => tut.events.push({ t, at: Date.now(), d })
  api.addEventListener('execution_start', () => { tut.running = true; tut.executing = null; tut.stop = null; note('start') })
  api.addEventListener('executing', (e) => { const d = e.detail; tut.executing = d == null ? null : String(typeof d === 'object' ? d.node ?? d.display_node ?? '' : d); note('executing', tut.executing) })
  api.addEventListener('execution_success', () => { tut.running = false; tut.executing = null; note('success') })
  api.addEventListener('execution_error', (e) => { tut.running = false; tut.error = e.detail; note('error', JSON.stringify(e.detail).slice(0, 400)) })
  api.addEventListener('execution_interrupted', () => { tut.running = false; note('interrupted') })
  api.addEventListener('plenio.sheet', (e) => { tut.stop = e.detail; note('sheet', JSON.stringify(e.detail).slice(0, 200)) })
})()`

// --- the studio -------------------------------------------------------------------------------------

export async function openStudio({ url, out, width = 1920, height = 1000, scale = 1, fps = 30, headless = true, log = console.log }) {
  fs.mkdirSync(out, { recursive: true })
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch({ headless, args: ['--force-color-profile=srgb', '--hide-scrollbars'] })
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, locale: 'en-US', colorScheme: 'dark' })
  await context.addInitScript(OVERLAY)
  const page = await context.newPage()
  page.on('pageerror', (e) => log('page error:', String(e).slice(0, 300)))

  const W = Math.round(width * scale), H = Math.round(height * scale)
  const markers = { width: W, height: H, fps, captions: [], chapters: [], cards: [], fast: [], notes: [], sounds: [] }
  let t0 = null
  const now = () => (t0 === null ? 0 : (Date.now() - t0) / 1000)

  // --- capture: screencast frames -> ffmpeg at a constant frame rate (the latest frame repeats) ---
  let ffmpeg = null, latest = null, written = 0, timer = null, cdp = null, frames = 0
  const rawPath = path.join(out, 'raw.mp4')
  async function startCapture() {
    cdp = await context.newCDPSession(page)
    cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
      latest = Buffer.from(data, 'base64')
      frames++
      try { await cdp.send('Page.screencastFrameAck', { sessionId }) } catch {}
    })
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 94, maxWidth: W, maxHeight: H, everyNthFrame: 1 })
    while (!latest) await page.waitForTimeout(50)
    ffmpeg = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '10', '-r', String(fps), rawPath], { stdio: ['pipe', 'inherit', 'inherit'] })
    t0 = Date.now()
    written = 0
    const tick = () => {
      const due = Math.floor(((Date.now() - t0) / 1000) * fps) + 1
      while (written < due && latest) {
        ffmpeg.stdin.write(latest)
        written++
      }
    }
    timer = setInterval(tick, 1000 / fps / 2)
  }
  async function stopCapture() {
    clearInterval(timer)
    try { await cdp.send('Page.stopScreencast') } catch {}
    await new Promise((resolve) => { ffmpeg.on('close', resolve); ffmpeg.stdin.end() })
    markers.duration = written / fps
    markers.screencastFrames = frames
  }

  // --- the pointer ---
  let mouse = { x: width * 0.6, y: height * 0.6 }
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
  async function moveTo(x, y, ms) {
    const d = Math.hypot(x - mouse.x, y - mouse.y)
    const dur = ms ?? Math.min(1100, 280 + d * 0.9)
    const steps = Math.max(2, Math.round(dur / 16))
    const from = { ...mouse }
    for (let i = 1; i <= steps; i++) {
      const e = ease(i / steps)
      await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e)
      await page.waitForTimeout(dur / steps)
    }
    mouse = { x, y }
  }
  const centre = (box, fx = 0.5, fy = 0.5) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy })
  async function boxOf(target) {
    if (typeof target === 'function') return target()
    if (target && typeof target.boundingBox === 'function') {
      await target.scrollIntoViewIfNeeded().catch(() => {})
      const b = await target.boundingBox()
      if (!b) throw new Error('target not visible')
      return b
    }
    return target
  }
  async function hover(target, { fx = 0.5, fy = 0.5, ms } = {}) {
    const p = centre(await boxOf(target), fx, fy)
    await moveTo(p.x, p.y, ms)
    return p
  }
  async function click(target, { fx = 0.5, fy = 0.5, ms, pause = 180, button = 'left', count = 1 } = {}) {
    const p = await hover(target, { fx, fy, ms })
    await page.waitForTimeout(pause)
    await page.mouse.click(p.x, p.y, { button, clickCount: count, delay: 60 })
    await page.waitForTimeout(250)
    return p
  }
  // a neutral place for the pointer (no hover tooltips, no highlighted buttons)
  const rest = (ms = 700) => moveTo(width * 0.55, height * 0.55, ms)
  async function drag(from, to, { ms = 900, hold = 150 } = {}) {
    await moveTo(from.x, from.y)
    await page.waitForTimeout(150)
    await page.mouse.down()
    await page.waitForTimeout(hold)
    await moveTo(to.x, to.y, ms)
    await page.waitForTimeout(hold)
    await page.mouse.up()
    await page.waitForTimeout(300)
  }
  async function type(text, { delay = 45 } = {}) {
    await page.keyboard.type(text, { delay })
  }
  // a shortcut with its keys shown on screen
  async function keys(combo, { labels, times = 1, gap = 350 } = {}) {
    const shown = labels ?? combo.split('+').map((k) => ({ Control: 'Ctrl', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', Delete: 'Del' })[k] ?? k)
    for (let i = 0; i < times; i++) {
      await page.evaluate(([l, ms]) => window.__tut.keys(l, ms), [shown, 1400])
      await page.keyboard.press(combo)
      await page.waitForTimeout(gap)
    }
  }
  async function spotlight(target, { ms = 1600, pad = 6 } = {}) {
    const b = await boxOf(target)
    await page.evaluate(([r, m, p]) => window.__tut.spot(r, m, p), [b, ms, pad])
  }

  // --- markers ---
  let currentCaption = null
  function caption(text) {
    const t = now()
    if (currentCaption) currentCaption.t1 = t
    currentCaption = text ? { t0: t, t1: null, text } : null
    if (currentCaption) markers.captions.push(currentCaption)
  }
  const chapter = (title) => markers.chapters.push({ t: now(), title })
  // a still card (title, chapter, end) inserted at this moment of the edit
  const card = (kind, data, seconds = 4) => {
    caption(null)
    markers.cards.push({ t: now(), kind, data, seconds })
  }
  // everything from here to the returned end() plays faster: at most `seconds` long in the edit
  function fast(label = '', seconds = 4) {
    const seg = { t0: now(), t1: null, seconds, label }
    markers.fast.push(seg)
    return () => { seg.t1 = now() }
  }
  const wait = (ms) => page.waitForTimeout(ms)
  // read slowly: a pause that scales with the caption's length
  const read = (text, min = 2200) => page.waitForTimeout(Math.max(min, 900 + (text?.length ?? 60) * 42))
  async function say(text, min) {
    caption(text)
    await read(text, min)
  }

  // --- ComfyUI ---
  async function openComfy() {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => window.app && window.app.graph && window.app.api, null, { timeout: 120000 })
    await page.evaluate(CAMERA)
    await page.waitForTimeout(1500)
    await page.keyboard.press('Escape')
  }
  const fly = (rect, ms = 1100, pad = 0.94) => page.evaluate(([r, m, p]) => window.__tut.fly(r, m, p), [rect, ms, pad])
  const flyGroups = async (titles, ms, pad) => fly(await page.evaluate((t) => window.__tut.unite(t.map((x) => window.__tut.groupRect(x)), 10), titles), ms, pad)
  const flyNodes = async (ids, ms, pad, margin = 30) => fly(await page.evaluate(([i, m]) => window.__tut.unite(i.map((x) => window.__tut.nodeRect(x)), m), [ids, margin]), ms, pad)
  const widgetBox = (nodeId, name) => page.evaluate(([n, w]) => window.__tut.widgetBox(n, w), [nodeId, name])
  const nodeButton = (nodeId, text) => page.evaluate(([n, t]) => window.__tut.nodeButton(n, t), [nodeId, text])
  const audioBox = (nodeId) => page.evaluate((n) => window.__tut.audioBox(n), nodeId)

  // Pick a value of a canvas combo widget through its menu (LiteGraph context menu).
  async function chooseCombo(nodeId, name, value, { read: pauseMs = 900 } = {}) {
    await click(() => widgetBox(nodeId, name), { fx: 0.72 })
    const entry = page.locator('.litecontextmenu .litemenu-entry', { hasText: value }).first()
    await entry.waitFor({ state: 'visible', timeout: 5000 })
    await page.waitForTimeout(pauseMs)
    await click(entry)
    await page.waitForTimeout(300)
  }

  // Queue the workflow with a click on Run.
  async function run() {
    const button = page.locator('button', { hasText: /^\s*Run\s*$/ }).first()
    await spotlight(button, { ms: 1300 })
    await click(button, { pause: 500 })
    // away from the button: its hover shows the queue popover
    await rest()
  }

  // Wait for the run to end. The camera follows the running node (its group); every step of the run
  // becomes a fast-forwarded piece of at most `seconds` with a caption from `stages` (node id -> text).
  async function follow({ stages: stageKeys = {}, groups: groupKeys = {}, seconds = 3.6, onStage } = {}) {
    // the maps are keyed by node title, type or id; the server reports ids
    const ids = await page.evaluate((k) => window.__tut.ids(k), [...new Set([...Object.keys(stageKeys), ...Object.keys(groupKeys)])])
    const stages = Object.fromEntries(Object.entries(stageKeys).map(([k, v]) => [ids[k], v]))
    const groups = Object.fromEntries(Object.entries(groupKeys).map(([k, v]) => [ids[k], v]))
    await page.waitForFunction(() => window.__tut.running || window.__tut.events.some((e) => e.t === 'start'), null, { timeout: 60000 })
    let stage = null, end = null, lastGroup = null
    const started = Date.now()
    while (true) {
      const state = await page.evaluate(() => ({ running: window.__tut.running, executing: window.__tut.executing, error: window.__tut.error ?? null }))
      const top = state.executing ? String(state.executing).split(':')[0] : null
      if (top && top !== stage) {
        stage = top
        const text = stages[top]
        if (text !== undefined) {
          end?.()
          end = fast(text, seconds)
          if (text) caption(text)
        }
        const group = groups[top]
        if (group && group !== lastGroup) {
          lastGroup = group
          await flyGroups(Array.isArray(group) ? group : [group], 700).catch(() => {})
        }
        onStage?.(top)
      }
      if (!state.running && Date.now() - started > 1500) break
      await page.waitForTimeout(250)
    }
    end?.()
    await page.waitForTimeout(600)
    const error = await page.evaluate(() => window.__tut.error ?? null)
    if (error) throw new Error('the run failed: ' + JSON.stringify(error).slice(0, 600))
    return page.evaluate(() => window.__tut.stop)
  }
  // The song a preview node plays from now on: saved next to the recording, the edit mixes it under the
  // voice (the recording itself has no sound).
  async function listen(nodeId, { seconds = 14, from = 0 } = {}) {
    const src = await page.evaluate((n) => window.__tut.audioSrc(n), nodeId)
    if (!src) return
    const name = new URL(src, url).searchParams.get('filename') ?? 'song.flac'
    const file = `sound-${markers.sounds.length + 1}${path.extname(name) || '.flac'}`
    const r = await fetch(new URL(src, url))
    if (!r.ok) throw new Error(`could not fetch the preview's audio: ${r.status}`)
    fs.writeFileSync(path.join(out, file), Buffer.from(await r.arrayBuffer()))
    markers.sounds.push({ t: now(), file, from, seconds })
  }
  async function resetRunState() {
    await page.evaluate(() => { window.__tut.events = []; window.__tut.stop = null; window.__tut.error = null })
  }

  async function saveMarkers() {
    if (currentCaption && currentCaption.t1 === null) currentCaption.t1 = now()
    fs.writeFileSync(path.join(out, 'markers.json'), JSON.stringify(markers, null, 1))
  }

  return {
    page, browser, context, markers, now, W, H,
    startCapture, stopCapture, saveMarkers,
    moveTo, rest, hover, click, drag, type, keys, spotlight, boxOf, centre,
    caption, say, read, chapter, card, fast, wait,
    openComfy, fly, flyGroups, flyNodes, widgetBox, nodeButton, audioBox, listen, chooseCombo, run, follow, resetRunState,
    get mouse() { return mouse },
  }
}
