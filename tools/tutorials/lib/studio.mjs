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
import { fileURLToPath } from 'node:url'
import { TAP } from './tap.mjs'

// the Plenio version the videos show on their title cards (pyproject.toml of this repository; PLENIO_TUTORIAL_VERSION
// for videos recorded before the release they belong to)
const PYPROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'pyproject.toml')
export const PLENIO_VERSION =
  process.env.PLENIO_TUTORIAL_VERSION || (/^version\s*=\s*"([^"]+)"/m.exec(fs.readFileSync(PYPROJECT, 'utf8'))?.[1] ?? '?')
export const FOOT = `Plenio Music Production System ${PLENIO_VERSION} for ComfyUI`

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
    .tut-callout { position: fixed; z-index: 2147483646; pointer-events: none; font: 600 20px/1.25 "Segoe UI", system-ui, sans-serif; color: #fff;
      background: rgba(16, 22, 34, .95); border: 2px solid #ffc440; border-radius: 12px; padding: 9px 16px; white-space: nowrap;
      box-shadow: 0 6px 22px rgba(0,0,0,.45), 0 0 14px rgba(255,196,64,.35); animation: tut-callout-in .4s cubic-bezier(.2,1.25,.4,1) both; }
    .tut-callout.out { animation: tut-callout-out .3s ease-in forwards }
    .tut-callout::after { content: ""; position: absolute; width: 14px; height: 14px; background: rgba(16, 22, 34, .95); border: 2px solid #ffc440; transform: rotate(45deg); }
    .tut-callout[data-side="right"]::after { left: -9px; top: calc(50% - 8px); border-top: 0; border-right: 0 }
    .tut-callout[data-side="left"]::after { right: -9px; top: calc(50% - 8px); border-bottom: 0; border-left: 0 }
    .tut-callout[data-side="top"]::after { bottom: -9px; left: calc(50% - 8px); border-top: 0; border-left: 0 }
    .tut-callout[data-side="bottom"]::after { top: -9px; left: calc(50% - 8px); border-bottom: 0; border-right: 0 }
    @keyframes tut-callout-in { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: none } }
    @keyframes tut-callout-out { to { opacity: 0; transform: scale(.92) } }
    .tut-pulse { position: fixed; z-index: 2147483645; pointer-events: none; border: 3px solid rgba(255,196,64,.95); border-radius: 50%;
      box-shadow: 0 0 14px rgba(255,196,64,.6); animation: tut-pulse 1.15s ease-out forwards }
    @keyframes tut-pulse { from { transform: scale(.35); opacity: .95 } to { transform: scale(1.5); opacity: 0 } }
    .tut-badge { position: fixed; z-index: 2147483646; pointer-events: none; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 50%;
      display: grid; place-items: center; font: 800 30px/1 "Segoe UI", system-ui, sans-serif; color: #141a26;
      background: linear-gradient(135deg, #ffd978, #f0a53a); border: 3px solid #fff3d6; box-shadow: 0 5px 18px rgba(0,0,0,.5);
      animation: tut-badge-in .55s cubic-bezier(.2,1.5,.4,1) both }
    .tut-badge.out { animation: tut-callout-out .3s ease-in forwards }
    @keyframes tut-badge-in { from { transform: scale(0) rotate(-40deg); opacity: 0 } to { transform: none; opacity: 1 } }
    .tut-arrow { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: 2147483646; pointer-events: none; overflow: visible }
    .tut-arrow path { fill: none; stroke: #ffc440; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 6px rgba(255,196,64,.75)) }
    .tut-arrow.out { transition: opacity .35s; opacity: 0 }
    .tut-select { position: fixed; z-index: 2147483646; overflow: hidden; background: #25272d; color: #e9e9ec; border: 1px solid #6c707a;
      border-radius: 7px; padding: 4px 0; box-shadow: 0 12px 30px rgba(0,0,0,.55); font: 15px/1.25 "Segoe UI", system-ui, sans-serif;
      transform-origin: top; animation: tut-select-in .16s ease-out both }
    .tut-select.up { transform-origin: bottom }
    .tut-select div { position: relative; padding: 6px 18px 6px 30px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
    .tut-select div.on::before { content: "✓"; position: absolute; left: 11px }
    .tut-select div.off { color: #7d7f86 }
    .tut-select div.group { padding-left: 12px; font-weight: 700; color: #a9abb2 }
    .tut-select div.item:hover { background: #3b6fd8; color: #fff }
    .tut-select.out { transition: opacity .18s; opacity: 0 }
    @keyframes tut-select-in { from { opacity: 0; transform: scaleY(.8) } to { opacity: 1; transform: none } }
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
    // LiteGraph's menus (a combo's list) larger, so that the video shows what they hold - as large as fits
    const enlarge = (menu) => {
      const r = menu.getBoundingClientRect()
      if (!r.height) return
      const scale = Math.max(1, Math.min(1.4, (innerHeight - 16) / r.height, (innerWidth - 16) / r.width))
      menu.style.transformOrigin = '0 0'
      menu.style.transform = 'scale(' + scale + ')'
      const b = menu.getBoundingClientRect()
      let left = parseFloat(menu.style.left) || b.left, top = parseFloat(menu.style.top) || b.top
      if (b.right > innerWidth - 8) left -= b.right - (innerWidth - 8)
      if (b.bottom > innerHeight - 8) top -= b.bottom - (innerHeight - 8)
      menu.style.left = Math.max(8, left) + 'px'
      menu.style.top = Math.max(8, top) + 'px'
    }
    new MutationObserver((changes) => {
      for (const c of changes) for (const n of c.addedNodes) if (n.classList?.contains('litecontextmenu')) requestAnimationFrame(() => enlarge(n))
    }).observe(document.documentElement, { childList: true, subtree: true })
    const move = (e) => { cursor.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)' }
    addEventListener('pointermove', move, true)
    addEventListener('mousemove', move, true)
    tut.ripple = (x, y) => {
      const ring = document.createElement('div')
      ring.className = 'tut-ripple'
      ring.style.left = x + 'px'
      ring.style.top = y + 'px'
      document.documentElement.appendChild(ring)
      setTimeout(() => ring.remove(), 700)
    }
    addEventListener('pointerdown', (e) => tut.ripple(e.clientX, e.clientY), true)
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
    const fade = (el, ms) => setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400) }, ms)
    // a label beside a box, pointing at it (side: right, left, top, bottom or auto)
    tut.callout = (r, text, ms, side) => {
      const c = document.createElement('div')
      c.className = 'tut-callout'
      c.textContent = text
      document.documentElement.appendChild(c)
      const w = c.offsetWidth, h = c.offsetHeight, gap = 18
      if (!side || side === 'auto') side = r.x + r.width + gap + w < innerWidth - 20 ? 'right' : r.x - gap - w > 20 ? 'left' : r.y - gap - h > 20 ? 'top' : 'bottom'
      c.dataset.side = side
      const at = {
        right: [r.x + r.width + gap, r.y + r.height / 2 - h / 2],
        left: [r.x - gap - w, r.y + r.height / 2 - h / 2],
        top: [r.x + r.width / 2 - w / 2, r.y - gap - h],
        bottom: [r.x + r.width / 2 - w / 2, r.y + r.height + gap],
      }[side]
      c.style.left = Math.max(8, Math.min(innerWidth - w - 8, at[0])) + 'px'
      c.style.top = Math.max(8, Math.min(innerHeight - h - 8, at[1])) + 'px'
      fade(c, ms)
    }
    // rings that grow out of a box's centre, one after the other
    tut.pulse = (r, times) => {
      const size = Math.max(70, Math.min(260, Math.max(r.width, r.height) * 1.25))
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          const p = document.createElement('div')
          p.className = 'tut-pulse'
          Object.assign(p.style, { left: (r.x + r.width / 2 - size / 2) + 'px', top: (r.y + r.height / 2 - size / 2) + 'px', width: size + 'px', height: size + 'px' })
          document.documentElement.appendChild(p)
          setTimeout(() => p.remove(), 1300)
        }, i * 420)
      }
    }
    // a numbered disc at a box's top left corner
    tut.badge = (r, text, ms) => {
      const b = document.createElement('div')
      b.className = 'tut-badge'
      b.textContent = text
      Object.assign(b.style, { left: Math.max(36, r.x + 6) + 'px', top: Math.max(36, r.y + 6) + 'px' })
      document.documentElement.appendChild(b)
      fade(b, ms)
    }
    // an arrow drawn from one box to another (a soft curve, its head at the target)
    tut.arrow = (a, b, ms, draw) => {
      const NS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(NS, 'svg')
      svg.setAttribute('class', 'tut-arrow')
      const ax = a.x + a.width / 2, ay = a.y + a.height / 2, bx = b.x + b.width / 2, by = b.y + b.height / 2
      // from the edge of the first box towards the second, ending a little before the second's edge
      const edge = (r, tx, ty, out) => {
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2, dx = tx - cx, dy = ty - cy
        const k = Math.min(Math.abs((r.width / 2 + out) / (dx || 1e-6)), Math.abs((r.height / 2 + out) / (dy || 1e-6)))
        return [cx + dx * k, cy + dy * k]
      }
      const [x0, y0] = edge(a, bx, by, 8), [x1, y1] = edge(b, ax, ay, 12)
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, len = Math.hypot(x1 - x0, y1 - y0)
      const bend = Math.min(140, len * 0.22)
      const nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1)
      const cx = mx + nx * bend, cy = my + ny * bend
      const line = document.createElementNS(NS, 'path')
      line.setAttribute('d', 'M' + x0 + ' ' + y0 + ' Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1)
      const angle = Math.atan2(y1 - cy, x1 - cx), hl = 20
      const head = document.createElementNS(NS, 'path')
      head.setAttribute('d', 'M' + (x1 - hl * Math.cos(angle - 0.5)) + ' ' + (y1 - hl * Math.sin(angle - 0.5)) + ' L' + x1 + ' ' + y1 + ' L' + (x1 - hl * Math.cos(angle + 0.5)) + ' ' + (y1 - hl * Math.sin(angle + 0.5)))
      svg.append(line, head)
      document.documentElement.appendChild(svg)
      const total = line.getTotalLength()
      line.style.strokeDasharray = total
      line.animate([{ strokeDashoffset: total }, { strokeDashoffset: 0 }], { duration: draw, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' })
      head.animate([{ opacity: 0 }, { opacity: 0, offset: 0.85 }, { opacity: 1 }], { duration: draw, fill: 'both' })
      setTimeout(() => { svg.classList.add('out'); setTimeout(() => svg.remove(), 450) }, ms)
    }
    // a native <select>'s list drawn in the page (a headless browser draws no popup): under the box, or above
    // it when there is more room there, scrolled so that entry \`focus\` is in the middle
    tut.selectList = (r, items, focus) => {
      tut.selectClose(true)
      const list = document.createElement('div')
      list.className = 'tut-select'
      for (const it of items) {
        const row = document.createElement('div')
        row.textContent = it.group ?? it.text
        row.className = it.group != null ? 'group' : 'item' + (it.on ? ' on' : '') + (it.disabled ? ' off' : '')
        list.appendChild(row)
      }
      list.style.minWidth = Math.max(r.width, 120) + 'px'
      list.style.left = '-9999px'
      list.style.top = '0px'
      document.documentElement.appendChild(list)
      const h = list.offsetHeight, w = list.offsetWidth
      const below = innerHeight - (r.y + r.height) - 12, above = r.y - 12
      const up = h > below && above > below
      const room = Math.max(120, Math.min(420, up ? above : below))
      if (h > room) list.style.maxHeight = room + 'px'
      const hh = list.offsetHeight
      list.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.x)) + 'px'
      list.style.top = (up ? r.y - 2 - hh : r.y + r.height + 2) + 'px'
      if (up) list.classList.add('up')
      const row = list.children[focus]
      if (row) list.scrollTop = Math.max(0, row.offsetTop - hh / 2 + row.offsetHeight / 2)
      tut.selectEl = list
    }
    // the list's entries on the screen (shown: inside the list's box, not scrolled away)
    tut.selectRows = () => {
      const list = tut.selectEl
      if (!list) return []
      const box = list.getBoundingClientRect()
      return [...list.children].map((row) => {
        const b = row.getBoundingClientRect()
        return { x: b.x, y: b.y, width: b.width, height: b.height, shown: b.top >= box.top - 1 && b.bottom <= box.bottom + 1 }
      })
    }
    tut.selectPick = (i) => {
      const list = tut.selectEl
      if (!list) return
      for (const row of list.children) row.classList.remove('on')
      list.children[i]?.classList.add('on')
    }
    tut.selectClose = (now) => {
      const list = tut.selectEl
      tut.selectEl = null
      if (!list) return
      if (now) list.remove()
      else { list.classList.add('out'); setTimeout(() => list.remove(), 200) }
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
    // marks drawn on the screen point at the old view: they go when the camera moves
    document.querySelectorAll('.tut-arrow, .tut-callout, .tut-badge').forEach((el) => el.remove())
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
  // the graph the canvas shows: the workflow, or the block (subgraph) that is open
  tut.graph = () => window.app.canvas?.graph ?? window.app.graph
  tut.groupRect = (title) => {
    const g = (tut.graph()._groups ?? tut.graph().groups).find((x) => x.title === title)
    if (!g) throw new Error('no group ' + title)
    const [x, y, w, h] = g._bounding
    return { x, y, w, h }
  }
  // a node by its id (a template opened from the browser has string ids), its title or its type
  tut.node = (key) => {
    const nodes = tut.graph().nodes
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
  // a graph rectangle on the screen (for the overlays)
  tut.screenRect = (r) => {
    const a = tut.toScreen(r.x, r.y), b = tut.toScreen(r.x + r.w, r.y + r.h)
    return { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y }
  }
  tut.nodeBox = (key) => tut.screenRect(tut.nodeRect(key))
  tut.groupBox = (title) => tut.screenRect(tut.groupRect(title))
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
  // a button inside a node's DOM widgets (the Song Sheet's edit card: "Edit lyrics & text", "Edit the score")
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
  // a review stop: a Song Sheet's output says it waits for approval (the event above comes with a conflict only)
  api.addEventListener('executed', (e) => {
    const sheet = e.detail?.output?.plenio_sheet?.[0]
    if (sheet?.waiting) { tut.stop = sheet; note('sheet', 'waiting') }
  })
})()`

// --- the studio -------------------------------------------------------------------------------------

export async function openStudio({ url, out, width = 1920, height = 1000, scale = 1, fps = 30, headless = true, gpu = false, log = console.log }) {
  fs.mkdirSync(out, { recursive: true })
  const { chromium } = loadPlaywright()
  // sound without a click first: the score editor's playback starts from the script (tap.mjs records it)
  const args = ['--force-color-profile=srgb', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required']
  // ``gpu``: WebGL drawn by the graphics card, also headless - the Plenio Player offers Plenio Drop and Nova only there
  if (gpu) args.push('--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []))
  const browser = await chromium.launch({ headless, args })
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, locale: 'en-US', colorScheme: 'dark' })
  await context.addInitScript(OVERLAY)
  await context.addInitScript(TAP)
  // the page that is recorded; switchTo() follows a tab it opens (ComfyUI's Plenio Player button, the
  // player's Open in ComfyUI)
  let page = await context.newPage()
  // a rehearsal (PLENIO_TUTORIAL_REHEARSE=1): every pause at most a fifth of a second - a quick run through a
  // script, to find what it cannot click before a long take (the take it makes is not for the edit)
  const idle = (ms) => page.waitForTimeout(process.env.PLENIO_TUTORIAL_REHEARSE ? Math.min(ms, 200) : ms)
  context.on('page', (p) => p.on('pageerror', (e) => log('page error:', String(e).slice(0, 300))))
  page.on('pageerror', (e) => log('page error:', String(e).slice(0, 300)))

  const W = Math.round(width * scale), H = Math.round(height * scale)
  const markers = { width: W, height: H, fps, captions: [], chapters: [], cards: [], fast: [], notes: [], sounds: [], sfx: [], taps: [] }
  let t0 = null
  const now = () => (t0 === null ? 0 : (Date.now() - t0) / 1000)
  // what the effects track hears (render.mjs, sfx.mjs): a click, a key, typing, a camera move, a stop ...
  const sfx = (kind, data = {}) => { if (t0 !== null) markers.sfx.push({ t: now(), kind, ...data }) }

  // --- capture: screencast frames -> ffmpeg at a constant frame rate (the latest frame repeats) ---
  let ffmpeg = null, latest = null, written = 0, timer = null, cdp = null, frames = 0
  const rawPath = path.join(out, 'raw.mp4')
  async function screencast(target) {
    const session = await context.newCDPSession(target)
    cdp = session
    session.on('Page.screencastFrame', async ({ data, sessionId }) => {
      if (session === cdp) {
        latest = Buffer.from(data, 'base64')
        frames++
      }
      try { await session.send('Page.screencastFrameAck', { sessionId }) } catch {}
    })
    await session.send('Page.startScreencast', { format: 'jpeg', quality: 94, maxWidth: W, maxHeight: H, everyNthFrame: 1 })
  }
  // Go on in another tab: the recording, the pointer and every helper follow it (the last frame of the old
  // tab stays until the new one draws).
  async function switchTo(next) {
    const old = cdp
    page = next
    await next.bringToFront()
    await next.waitForLoadState('load').catch(() => {})
    if (old) {
      await screencast(next)
      try { await old.send('Page.stopScreencast') } catch {}
      try { await old.detach() } catch {}
    }
  }
  async function startCapture() {
    await screencast(page)
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
    // what the pages played (the score editor's playback, the player's music): one recording per audio
    // context of every tab, placed by its start
    const taps = []
    for (const tab of context.pages()) {
      taps.push(...(await tab.evaluate(() => window.__tutTap?.collect() ?? []).catch((e) => { log('audio tap:', String(e).slice(0, 200)); return [] })))
    }
    for (const tap of taps) {
      const bytes = Buffer.from(tap.data, 'base64')
      if (bytes.length < 2000) continue
      const file = `tap-${markers.taps.length + 1}.webm`
      fs.writeFileSync(path.join(out, file), bytes)
      markers.taps.push({ file, t: (tap.started - t0) / 1000 })
    }
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
      await idle(dur / steps)
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
    await idle(pause)
    sfx('click', { count })
    await page.mouse.click(p.x, p.y, { button, clickCount: count, delay: 60 })
    await idle(250)
    return p
  }
  // a neutral place for the pointer (no hover tooltips, no highlighted buttons)
  const rest = (ms = 700) => moveTo(width * 0.55, height * 0.55, ms)
  async function drag(from, to, { ms = 900, hold = 150 } = {}) {
    await moveTo(from.x, from.y)
    await idle(150)
    sfx('press')
    await page.mouse.down()
    await idle(hold)
    await moveTo(to.x, to.y, ms)
    await idle(hold)
    sfx('release')
    await page.mouse.up()
    await idle(300)
  }
  async function type(text, { delay = 45 } = {}) {
    sfx('type', { chars: text.length, delay })
    await page.keyboard.type(text, { delay })
  }
  // a shortcut with its keys shown on screen
  async function keys(combo, { labels, times = 1, gap = 350 } = {}) {
    const shown = labels ?? combo.split('+').map((k) => ({ Control: 'Ctrl', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', Delete: 'Del' })[k] ?? k)
    for (let i = 0; i < times; i++) {
      await page.evaluate(([l, ms]) => window.__tut.keys(l, ms), [shown, 1400])
      sfx('key', { n: shown.length })
      await page.keyboard.press(combo)
      await idle(gap)
    }
  }
  async function spotlight(target, { ms = 1600, pad = 6 } = {}) {
    const b = await boxOf(target)
    sfx('spot', { ms })
    await page.evaluate(([r, m, p]) => window.__tut.spot(r, m, p), [b, ms, pad])
  }
  // A short label beside a box, pointing at it (a few words: the narration says the rest).
  async function callout(target, text, { ms = 2800, side = 'auto' } = {}) {
    const b = await boxOf(target)
    sfx('spot', { ms: Math.min(ms, 1200) })
    await page.evaluate(([r, t, m, sd]) => window.__tut.callout(r, t, m, sd), [b, text, ms, side])
  }
  // Rings growing out of a box: look here.
  async function pulse(target, { times = 2 } = {}) {
    const b = await boxOf(target)
    sfx('spot', { ms: 900 })
    await page.evaluate(([r, n]) => window.__tut.pulse(r, n), [b, times])
  }
  // A numbered disc at a box's top left corner (the sections of a template, in order).
  async function badge(target, text, { ms = 2600 } = {}) {
    const b = await boxOf(target)
    sfx('spot', { ms: 700 })
    await page.evaluate(([r, t, m]) => window.__tut.badge(r, t, m), [b, String(text), ms])
  }
  // An arrow drawn from one box to another: what goes where.
  async function arrow(from, to, { ms = 2800, draw = 900 } = {}) {
    const a = await boxOf(from), b = await boxOf(to)
    sfx('fly', { ms: draw })
    await page.evaluate(([x, y, m, d]) => window.__tut.arrow(x, y, m, d), [a, b, ms, draw])
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
  const wait = (ms) => idle(ms)
  // read slowly: a pause that scales with the caption's length
  const read = (text, min = 2200) => idle(Math.max(min, 900 + (text?.length ?? 60) * 42))
  async function say(text, min) {
    caption(text)
    await read(text, min)
  }

  // --- another page (the Plenio Player) ---
  async function openPage(route = '') {
    await page.goto(url + route, { waitUntil: 'load' })
    await idle(1500)
  }

  // --- ComfyUI ---
  async function openComfy() {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => window.app && window.app.graph && window.app.api, null, { timeout: 120000 })
    await page.evaluate(CAMERA)
    await idle(1500)
    await page.keyboard.press('Escape')
  }
  const fly = (rect, ms = 1100, pad = 0.94) => {
    sfx('fly', { ms })
    return page.evaluate(([r, m, p]) => window.__tut.fly(r, m, p), [rect, ms, pad])
  }
  const flyGroups = async (titles, ms, pad) => fly(await page.evaluate((t) => window.__tut.unite(t.map((x) => window.__tut.groupRect(x)), 10), titles), ms, pad)
  const flyNodes = async (ids, ms, pad, margin = 30) => fly(await page.evaluate(([i, m]) => window.__tut.unite(i.map((x) => window.__tut.nodeRect(x)), m), [ids, margin]), ms, pad)
  const widgetBox = (nodeId, name) => page.evaluate(([n, w]) => window.__tut.widgetBox(n, w), [nodeId, name])
  const nodeButton = (nodeId, text) => page.evaluate(([n, t]) => window.__tut.nodeButton(n, t), [nodeId, text])
  // a node's or a group's box on the screen, for the overlays (as functions: measured when they are drawn)
  const nodeBox = (key) => () => page.evaluate((k) => window.__tut.nodeBox(k), key)
  const groupBox = (title) => () => page.evaluate((t) => window.__tut.groupBox(t), title)
  const audioBox = (nodeId) => page.evaluate((n) => window.__tut.audioBox(n), nodeId)

  // The entries of the open combo menu (LiteGraph context menu), the pointer passing over some of them so
  // that the list is seen (owner's request 2026-10-24: open the drop-down lists, show what is in them).
  async function browseMenu(count = 4) {
    const menu = page.locator('.litecontextmenu').last()
    await menu.waitFor({ state: 'visible', timeout: 5000 })
    sfx('open')
    const entries = menu.locator('.litemenu-entry')
    const n = await entries.count()
    const steps = Math.min(count, n)
    for (let i = 0; i < steps; i++) {
      const at = steps > 1 ? Math.round((i * Math.min(n - 1, 11)) / (steps - 1)) : 0
      await hover(entries.nth(at), { fx: 0.3, ms: 420 }).catch(() => {})
      await idle(380)
    }
    return { menu, entries }
  }
  const exactEntry = (menu, value) => {
    const esc = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return menu.locator('.litemenu-entry').filter({ hasText: new RegExp('^\\s*' + esc + '\\s*$') }).first()
  }
  // Pick a value of a canvas combo widget through its menu, its list shown first.
  async function chooseCombo(nodeId, name, value, { read: pauseMs = 900, browse = 3 } = {}) {
    await click(() => widgetBox(nodeId, name), { fx: 0.72 })
    const { menu } = await browseMenu(browse)
    let entry = exactEntry(menu, value)
    if (!(await entry.count())) entry = menu.locator('.litemenu-entry', { hasText: value }).first()
    await entry.waitFor({ state: 'visible', timeout: 5000 })
    await idle(pauseMs)
    await click(entry)
    await idle(300)
  }
  // Open a combo's list to show what it offers, then close it on the value it has.
  async function showCombo(nodeId, name, { read: pauseMs = 2400, browse = 5 } = {}) {
    const current = await page.evaluate(([n, w]) => window.__tut.node(n).widgets.find((x) => x.name === w)?.value, [nodeId, name])
    await click(() => widgetBox(nodeId, name), { fx: 0.72 })
    const { menu } = await browseMenu(browse)
    await idle(pauseMs)
    const entry = exactEntry(menu, current)
    if (await entry.count()) await click(entry)
    else await page.keyboard.press('Escape')
    await idle(300)
  }

  // A brief's list field set to a value of one's own (1.5.0): the list's first entry, "✎ type your own …", opens
  // the frontend's prompt dialog, which takes the text.
  async function ownValue(nodeId, name, text, { read: pauseMs = 900, delay = 55 } = {}) {
    await chooseCombo(nodeId, name, '✎ type your own …', { read: pauseMs, browse: 2 })
    const input = page.locator('[role="dialog"] input').first()
    await input.waitFor({ state: 'visible', timeout: 8000 })
    await idle(500)
    await click(input, { fx: 0.4 })
    await keys('Control+a', { labels: ['Ctrl', 'A'] })
    await type(text, { delay })
    await idle(400)
    await keys('Enter')
    await input.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    await idle(500)
  }
  // A text field of a node with new text: clicked, its text selected, typed over.
  async function replaceText(nodeId, name, text, { delay = 36, fx = 0.3, fy = 0.15 } = {}) {
    await click(() => widgetBox(nodeId, name), { fx, fy })
    await idle(250)
    await keys('Control+a', { labels: ['Ctrl', 'A'] })
    await type(text, { delay })
  }

  // A native <select> opened: a headless browser draws no popup, so its list is drawn in the page (owner's
  // request 2026-10-24: show what the lists hold). The pointer passes over a few entries and picks `choose` (an
  // option's value or text), or settles on the current one; `read`: how long the list stays open.
  async function openSelect(target, { choose, browse = 4, read: pauseMs = 1600 } = {}) {
    const box = await boxOf(target)
    const p = await hover(box, { fx: 0.6 })
    await idle(250)
    const items = await target.evaluate((el) => [...el.querySelectorAll('option, optgroup')].map((n) =>
      n.tagName === 'OPTGROUP' ? { group: n.label } : { text: n.text.trim(), value: n.value, disabled: n.disabled, on: n.selected }))
    const options = items.map((it, i) => ({ ...it, i })).filter((it) => it.group == null)
    const wanted = choose == null ? null
      : options.find((it) => it.value === String(choose)) ?? options.find((it) => it.text === String(choose))
        ?? options.find((it) => it.text.toLowerCase().includes(String(choose).toLowerCase()))
    if (choose != null && !wanted) throw new Error(`openSelect: no option ${choose}`)
    const focus = wanted ? wanted.i : (options.find((it) => it.on) ?? options[0])?.i ?? 0
    sfx('click')
    await page.evaluate(([x, y]) => window.__tut.ripple(x, y), [p.x, p.y])
    await page.evaluate(([r, it, f]) => window.__tut.selectList(r, it, f), [box, items, focus])
    sfx('open')
    await idle(260)
    const rows = await page.evaluate(() => window.__tut.selectRows())
    // a few entries on the way to the one it settles on: from the top of what is shown, or below it
    const shown = rows.map((r, i) => ({ ...r, i })).filter((r) => r.shown && items[r.i].group == null && !items[r.i].disabled)
    const end = shown.findIndex((r) => r.i === focus)
    const before = shown.slice(0, Math.max(0, end)), after = shown.slice(end + 1)
    const pool = before.length >= 2 ? before : after
    const n = Math.min(browse, pool.length)
    for (let k = 0; k < n; k++) {
      await hover(pool[Math.round((k * (pool.length - 1)) / Math.max(1, n - 1))], { fx: 0.3, ms: 380 })
      await idle(300)
    }
    const last = rows[focus]
    if (last) await hover(last, { fx: 0.3, ms: 420 })
    await idle(pauseMs)
    if (wanted && last) {
      sfx('click')
      await page.evaluate(([x, y]) => window.__tut.ripple(x, y), [last.x + last.width * 0.3, last.y + last.height / 2])
      await page.evaluate((i) => window.__tut.selectPick(i), wanted.i)
      await idle(260)
    }
    await page.evaluate(() => window.__tut.selectClose())
    if (wanted) await target.selectOption(wanted.value)
    await idle(300)
  }

  // Pull a canvas slider to `value`: the pointer drags along it, then the exact value is set (a canvas
  // slider rounds by the pixel).
  async function slide(nodeId, name, value, { min = 0, max = 100, ms = 1300 } = {}) {
    const box = await widgetBox(nodeId, name)
    const current = await page.evaluate(([n, w]) => window.__tut.node(n).widgets.find((x) => x.name === w).value, [nodeId, name])
    const at = (v) => ({ x: box.x + 12 + (box.width - 24) * ((v - min) / (max - min)), y: box.y + box.height / 2 })
    await drag(at(current), at(value), { ms })
    await page.evaluate(([n, w, v]) => window.__tut.setWidget(n, w, v), [nodeId, name, value])
    await idle(400)
  }
  // A widget's value now.
  const widgetValue = (nodeId, name) => page.evaluate(([n, w]) => window.__tut.node(n).widgets.find((x) => x.name === w)?.value, [nodeId, name])

  // Open a block (a subgraph node) with the icon at the right of its title bar; closeBlock() goes back to the
  // workflow through the breadcrumb at the top of the canvas.
  async function openBlock(key) {
    const r = await page.evaluate((k) => window.__tut.nodeBox(k), key)
    const th = 30 * (await page.evaluate(() => window.app.canvas.ds.scale))
    await spotlight({ x: r.x + r.width - th, y: r.y, width: th, height: th }, { ms: 1200, pad: 2 })
    await click({ x: r.x + r.width - th / 2, y: r.y + th / 2, width: 0, height: 0 }, { pause: 500 })
    await idle(1200)
    const inside = await page.evaluate(() => window.app.canvas.graph !== window.app.graph)
    if (!inside) throw new Error('the block ' + key + ' did not open')
    sfx('open')
  }
  async function closeBlock() {
    const root = page.locator('.p-breadcrumb-item-link').first()
    await spotlight(root, { ms: 1100, pad: 4 })
    await click(root, { pause: 400 })
    await idle(1200)
    if (await page.evaluate(() => window.app.canvas.graph !== window.app.graph)) throw new Error('still inside a block')
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
    // a block's inner nodes run interleaved with others (the writer model between Write Song's steps): each
    // stage gets its piece and its caption once per run
    const seen = new Set()
    const started = Date.now()
    while (true) {
      const state = await page.evaluate(() => ({ running: window.__tut.running, executing: window.__tut.executing, error: window.__tut.error ?? null }))
      const top = state.executing ? String(state.executing).split(':')[0] : null
      if (top && top !== stage) {
        stage = top
        const text = seen.has(top) ? undefined : stages[top]
        seen.add(top)
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
      await idle(250)
    }
    end?.()
    await idle(600)
    const error = await page.evaluate(() => window.__tut.error ?? null)
    if (error) throw new Error('the run failed: ' + JSON.stringify(error).slice(0, 600))
    const stop = await page.evaluate(() => window.__tut.stop)
    // the run ends: at a review stop, or with everything done
    sfx(stop ? 'stop' : 'done')
    return stop
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
    get page() { return page },
    browser, context, markers, now, W, H, switchTo,
    startCapture, stopCapture, saveMarkers,
    moveTo, rest, hover, click, drag, type, keys, spotlight, callout, pulse, badge, arrow, boxOf, centre,
    caption, say, read, chapter, card, fast, wait, sfx,
    openComfy, openPage, fly, flyGroups, flyNodes, widgetBox, nodeButton, nodeBox, groupBox, audioBox, listen, chooseCombo, showCombo, ownValue, replaceText, openSelect, openBlock, closeBlock, slide, widgetValue, run, follow, resetRunState,
    get mouse() { return mouse },
  }
}
