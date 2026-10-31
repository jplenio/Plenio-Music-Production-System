// The edit of a tutorial recording: raw.mp4 + markers.json (studio.mjs) + the narration -> a 1920 x 1080
// video with a voice-over and an effects track.
//
// - the recording (1920 x 1000) sits above an 80 px band with the chapter name (left) and, while a wait
//   plays faster, the speed (right);
// - waits marked as fast play faster (each piece at most its `seconds`);
// - title, chapter and end cards (HTML rendered by Chromium, animated) are cut in where the script placed
//   them;
// - the narration (narration/<script>.txt, voice.mjs) is spoken at its captions and cards; where a line
//   needs more time than the picture gives it, the edit makes room: a card stays longer, a fast-forwarded
//   wait plays slower, or the picture holds still before the next cue. Where the picture leaves a long
//   silence between two lines, it plays a little faster there (at most MAX_SQUEEZE, never while a song
//   plays), so no pause runs long;
// - what the page played - the score editor's playback, the source recording at A/B, a sound's preview, the
//   keys of a MIDI keyboard (tap.mjs) - is a track of its own, cut like the picture: heard where the
//   picture plays at normal speed, and the picture never plays faster while it sounds;
// - every piece is a whole number of frames, so the picture, the voice and the effects stay in sync to the
//   end and every track is exactly as long as the video;
// - output: a folder <name>/ with the video (with the sound and without), the narration as SRT (for a TTS
//   and as written), the voice, the effects and the songs as WAV (each and together), every line's speech,
//   and the narrator's reference voice - documented in its README.md, for editing by hand.

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { effects, writeWav } from './sfx.mjs'
import { loadPlaywright } from './studio.mjs'
import { VOICE, anchorNarration, mixVoice, parseLexicon, parseNarration, speakable, synthesize } from './voice.mjs'

const FPS = 30
const BAND = 80
const WIDTH = 1920
const HEIGHT = 1080
const RATE = 48000
// the narration's breathing: speech starts this long after its cue, and the next cue waits this long after it
const LEAD = 0.2
const TAIL = 0.4
// a silence between two lines longer than LEAD + ALLOWED_PAUSE + TAIL is played faster (up to MAX_SQUEEZE);
// a fast-forwarded wait may then get as short as MIN_FAST
const ALLOWED_PAUSE = 0.8
const MAX_SQUEEZE = 2.5
// ... and a stretch where nothing is clicked or typed (a run the script waits for) up to this
const MAX_WAIT_SQUEEZE = 6
const MIN_FAST = 1.2

function ffmpeg(args, cwd) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd, encoding: 'utf8', maxBuffer: 1 << 26 })
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`)
}

const frames = (seconds) => Math.max(1, Math.round(seconds * FPS))

// --- the timeline -----------------------------------------------------------------------------------

// `room` makes time for the narration (holds: a still frame at a raw time, before what follows it; fast
// waits played slower: more seconds; cards shown longer) and takes it from long silences (squeeze: raw
// stretches played faster without a speed badge; fast waits played quicker: fewer seconds)
// (`busy`: raw stretches where the page plays sound - never played faster, no hold inside when avoidable)
const roomOf = (busy = []) => ({ holds: new Map(), fast: new Map(), cards: new Map(), squeeze: [], busy })

export function timeline(markers, room = roomOf()) {
  const end = markers.duration
  const segments = [
    ...markers.fast
      .map((f, index) => ({ ...f, index, quiet: false }))
      .filter((f) => f.t1 !== null && f.t1 - f.t0 > 0.05)
      .map((f) => ({ ...f, speed: Math.max(1, (f.t1 - f.t0) / Math.max(Math.min(MIN_FAST, f.seconds), f.seconds + (room.fast.get(f.index) ?? 0))) })),
    ...room.squeeze.map((q) => ({ t0: q.t0, t1: q.t1, index: null, label: '', quiet: true, speed: q.speed })),
  ].sort((a, b) => a.t0 - b.t0)
  const cards = markers.cards.map((c, index) => ({ ...c, index, seconds: c.seconds + (room.cards.get(index) ?? 0) })).sort((a, b) => a.t - b.t)
  const holds = [...room.holds.entries()].map(([t, seconds]) => ({ t: Math.min(end, t), seconds })).sort((a, b) => a.t - b.t)
  // cut points: the segments' bounds, card positions and holds
  const cuts = new Set([0, end])
  for (const f of segments) { cuts.add(Math.min(end, f.t0)); cuts.add(Math.min(end, f.t1)) }
  for (const c of cards) cuts.add(Math.min(end, c.t))
  for (const h of holds) cuts.add(h.t)
  const points = [...cuts].sort((a, b) => a - b)
  const pieces = []
  let out = 0
  // at a cut: the holds first (the picture stops before what comes), then the cards
  const pushStops = (t) => {
    for (const h of holds.filter((x) => !x.done && x.t <= t + 1e-6)) {
      h.done = true
      const duration = frames(h.seconds) / FPS
      pieces.push({ type: 'hold', at: h.t, start: out, duration })
      out += duration
    }
    for (const c of cards.filter((x) => !x.done && x.t <= t + 1e-6)) {
      c.done = true
      const duration = frames(c.seconds) / FPS
      pieces.push({ type: 'card', card: c, start: out, duration })
      out += duration
    }
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    pushStops(a)
    if (b - a < 0.02) continue
    const f = segments.find((x) => a >= x.t0 - 1e-6 && b <= x.t1 + 1e-6)
    // a whole number of frames: the speed gives a little
    const duration = frames((b - a) / (f ? f.speed : 1)) / FPS
    const speed = (b - a) / duration
    pieces.push({ type: 'clip', a, b, speed, fast: f && !f.quiet ? f.index : null, quiet: !!f?.quiet, label: f?.label ?? '', start: out, duration })
    out += duration
  }
  pushStops(end + 1)
  const clips = pieces.filter((p) => p.type === 'clip')
  // raw time -> edit time (a time on a cut maps to the clip after the holds and cards there)
  const map = (t) => {
    for (const p of clips) if (t >= p.a - 1e-6 && t < p.b) return p.start + (t - p.a) / p.speed
    const last = clips[clips.length - 1]
    return last ? last.start + last.duration : 0
  }
  const cardStart = (index) => pieces.find((p) => p.type === 'card' && p.card.index === index)?.start ?? 0
  // out is a sum of whole frames: round away the float dust
  return { pieces, map, cardStart, duration: Math.round(out * FPS) / FPS }
}

// --- the narration's room ---------------------------------------------------------------------------

const startOf = (tl, line) => (line.anchor.kind === 'card' ? tl.cardStart(line.anchor.index) : tl.map(line.anchor.t))

// Where each line starts in the edit, and the room the edit makes so that no line runs into the next:
// one shortfall at a time, then the timeline again, until every line fits.
export function fit(markers, lines, room = roomOf()) {
  for (let guard = 0; guard < lines.length * 6 + 20; guard++) {
    const tl = timeline(markers, room)
    const short = lines.findIndex((line, i) => {
      const next = lines[i + 1]
      const span = (next ? startOf(tl, next) : tl.duration) - startOf(tl, line)
      return LEAD + line.seconds + TAIL + line.after - span > 0.02
    })
    if (short < 0) {
      for (const line of lines) line.start = startOf(tl, line) + LEAD
      return { tl, room }
    }
    const line = lines[short], next = lines[short + 1]
    const deficit = LEAD + line.seconds + TAIL + line.after - ((next ? startOf(tl, next) : tl.duration) - startOf(tl, line))
    // a line on a card: the card stays longer
    if (line.anchor.kind === 'card') {
      room.cards.set(line.anchor.index, (room.cards.get(line.anchor.index) ?? 0) + deficit)
      continue
    }
    // the raw stretch between the two cues: a squeezed stretch plays at normal speed again, its fast waits
    // play slower (never slower than real time) ...
    const ta = line.anchor.t
    const tb = next ? next.anchor.t : markers.duration
    const squeezed = room.squeeze.filter((q) => q.t1 > ta && q.t0 < tb)
    if (squeezed.length) {
      room.squeeze = room.squeeze.filter((q) => !squeezed.includes(q))
      continue
    }
    let left = deficit
    for (const p of tl.pieces.filter((x) => x.type === 'clip' && x.fast !== null && x.b > ta && x.a < tb)) {
      if (left <= 0.02) break
      const f = markers.fast[p.fast]
      const overlap = Math.min(p.b, tb) - Math.max(p.a, ta)
      const now = overlap / p.speed
      const gain = Math.min(left, overlap - now)
      if (gain <= 0.02) continue
      // the piece's speed is one for the whole wait: what this stretch gains, the wait gains in proportion
      const speed = overlap / (now + gain)
      room.fast.set(p.fast, (f.t1 - f.t0) / speed - f.seconds)
      left -= gain
    }
    // ... and the rest: the picture holds still just before the next cue - or, when the page plays sound
    // there, before that sound starts (a hold would cut it)
    if (left > 0.02) {
      let at = Math.max(ta, tb - 0.04)
      const sounding = room.busy.find(([x, y]) => at > x && at < y)
      if (sounding && sounding[0] - 0.05 > ta) at = sounding[0] - 0.05
      room.holds.set(at, (room.holds.get(at) ?? 0) + left)
    }
  }
  throw new Error('the narration does not fit (no stable edit found)')
}

// Long silences between two lines: the picture there plays faster - a stretch at normal speed up to
// MAX_SQUEEZE (no speed badge), a fast-forwarded wait down to MIN_FAST seconds - so the pause between
// the lines is at most about LEAD + ALLOWED_PAUSE + TAIL. Never where a song plays (the listening time
// after a line, `| +6`, is kept), never inside a hold or a card. Returns how many seconds it took out.
function tighten(markers, lines, tl, room) {
  const songs = [...(markers.sounds ?? []).map((s) => [s.t, s.t + s.seconds]), ...room.busy]
  // where the pointer or the keyboard is at work (a click, a drag, keys, typing)
  const hands = (markers.sfx ?? []).flatMap((e) => {
    if (['click', 'press', 'release', 'key'].includes(e.kind)) return [[e.t - 0.7, e.t + 0.7]]
    if (e.kind === 'type') return [[e.t - 0.3, e.t + ((e.chars ?? 0) * (e.delay ?? 45)) / 1000 + 0.5]]
    return []
  })
  // a raw stretch in parts: [start, end, nothing clicked or typed] (parts under 0.3 s join their neighbour)
  const handsOff = (r0, r1) => {
    const parts = []
    for (let t = r0; t < r1 - 1e-6; t += 0.1) {
      const b = Math.min(r1, t + 0.1)
      const free = !hands.some(([x, y]) => b > x && t < y)
      const last = parts[parts.length - 1]
      if (last && last[2] === free) last[1] = b
      else parts.push([t, b, free])
    }
    return parts.filter(([a, b], i) => b - a >= 0.3 || parts.length === 1 || i === 0)
  }
  const playing = (a, b) => songs.some(([x, y]) => b > x && a < y)
  let taken = 0
  lines.forEach((line, i) => {
    const next = lines[i + 1]
    if (!next) return
    const from = line.start + line.seconds + TAIL + line.after + 0.15
    const to = next.start - LEAD - 0.15
    let excess = to - from - ALLOWED_PAUSE + 0.3
    if (excess < 0.3) return
    const overlap = (p) => [Math.max(from, p.start), Math.min(to, p.start + p.duration)]
    // the stretches at normal speed: one speed for all of them
    const stretches = []
    for (const p of tl.pieces) {
      if (p.type !== 'clip' || p.fast !== null || p.quiet) continue
      const [e0, e1] = overlap(p)
      if (e1 - e0 < 0.1) continue
      const r0 = p.a + (e0 - p.start) * p.speed, r1 = p.a + (e1 - p.start) * p.speed
      if (playing(r0, r1)) continue
      stretches.push([r0, r1])
    }
    // the parts where nothing is clicked or typed go first, and faster; then the rest
    const idle = [], handled = []
    for (const [r0, r1] of stretches) for (const [a, b, free] of handsOff(r0, r1)) (free ? idle : handled).push([a, b])
    for (const [list, max] of [[idle, MAX_WAIT_SQUEEZE], [handled, MAX_SQUEEZE]]) {
      const raw = list.reduce((sum, [a, b]) => sum + (b - a), 0)
      if (raw < 0.2 || excess <= 0.05) continue
      const speed = Math.min(max, raw / Math.max(raw / max, raw - excess))
      if (speed <= 1.05) continue
      for (const [t0, t1] of list) room.squeeze.push({ t0, t1, speed })
      excess -= raw - raw / speed
      taken += raw - raw / speed
    }
    // the fast-forwarded waits in the silence: quicker, down to MIN_FAST
    for (const p of tl.pieces) {
      if (excess <= 0.1) break
      if (p.type !== 'clip' || p.fast === null) continue
      const [e0, e1] = overlap(p)
      if (e1 - e0 < 0.1 || playing(p.a, p.b)) continue
      const f = markers.fast[p.fast]
      const whole = (f.t1 - f.t0) / p.speed
      const cut = Math.min(excess, e1 - e0, whole - MIN_FAST)
      if (cut <= 0.05) continue
      room.fast.set(p.fast, whole - cut - f.seconds)
      excess -= cut
      taken += cut
    }
  })
  return taken
}

// The edit's timing: room for every line, then the long silences taken out (twice: a squeeze moves the
// lines after it). Sets every line's start.
export function plan(markers, lines, busy = []) {
  let { tl, room } = fit(markers, lines, roomOf(busy))
  let taken = 0
  for (let pass = 0; pass < 2; pass++) {
    taken += tighten(markers, lines, tl, room)
    ;({ tl, room } = fit(markers, lines, room))
  }
  return { tl, room, taken }
}

// --- cards ------------------------------------------------------------------------------------------

const CARD_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; color: #eef1f6; font-family: "Segoe UI", system-ui, sans-serif;
    background: radial-gradient(1200px 700px at 70% 20%, #1c2433 0%, #0e1014 60%) #0e1014; }
  .glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(30px) }
  .glow.a { width: 1300px; height: 900px; left: 38%; top: -28%; background: radial-gradient(closest-side, rgba(106,166,255,.20), transparent); animation: drift 9s ease-in-out both }
  .glow.b { width: 1100px; height: 800px; left: -12%; top: 45%; background: radial-gradient(closest-side, rgba(150,110,255,.12), transparent); animation: drift2 9s ease-in-out both }
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px }
  .banner { position: relative; width: 1180px; border-radius: 18px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.55); margin-bottom: 54px;
    animation: zoomin 1.2s cubic-bezier(.2,.8,.2,1) both }
  .banner img { display: block; width: 100% }
  .banner::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 28%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.20), transparent);
    animation: sweep 1.4s ease-in-out .75s both }
  .kicker { font-size: 30px; letter-spacing: .18em; text-transform: uppercase; color: #8fb8ff; font-weight: 600; margin-bottom: 18px; animation: track 1s cubic-bezier(.2,.8,.2,1) .15s both }
  h1 { font-size: 76px; font-weight: 700; line-height: 1.1; letter-spacing: -.01em; animation: rise .9s cubic-bezier(.2,.8,.2,1) .4s both }
  h1 .num { color: #6aa6ff }
  .rule { width: 220px; height: 3px; margin: 26px auto 0; border-radius: 2px; background: linear-gradient(90deg, transparent, #6aa6ff, transparent); animation: rule .9s cubic-bezier(.2,.8,.2,1) .7s both }
  .sub { font-size: 36px; color: #b9c2d0; margin-top: 22px; font-weight: 400; max-width: 1500px; line-height: 1.35; animation: rise .9s cubic-bezier(.2,.8,.2,1) .75s both }
  .foot { position: absolute; bottom: 44px; left: 0; right: 0; font-size: 24px; color: #7d8796; text-align: center; animation: fade 1s ease 1.2s both }
  .steps { display: flex; gap: 18px; margin-top: 40px; flex-wrap: wrap; justify-content: center }
  .steps span { font-size: 26px; padding: 12px 22px; border: 1px solid #3a4a66; border-radius: 12px; background: rgba(40, 60, 95, .35); color: #dfe8f7; animation: chip .5s cubic-bezier(.2,1.3,.4,1) both }
  .part { font-size: 150px; font-weight: 800; color: #6aa6ff; line-height: 1; margin-bottom: 10px; animation: pop .7s cubic-bezier(.2,1.2,.4,1) .2s both;
    text-shadow: 0 0 40px rgba(106,166,255,.35) }
  .lines { margin-top: 36px; font-size: 32px; color: #c9d2de; line-height: 1.7 }
  .lines div { animation: rise .8s cubic-bezier(.2,.8,.2,1) both }
  .lines b { color: #fff }
  .show { position: absolute; inset: 0; background: #07080b }
  .slide { position: absolute; inset: 0; overflow: hidden; opacity: 0 }
  .slide img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover }
  .slide .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,8,11,0) 52%, rgba(7,8,11,.88) 100%) }
  .slide .label { position: absolute; left: 90px; bottom: 120px; text-align: left }
  .slide .label .k { font-size: 30px; letter-spacing: .2em; text-transform: uppercase; color: #8fb8ff; font-weight: 700 }
  .slide .label .t { font-size: 58px; font-weight: 700; margin-top: 8px; text-shadow: 0 4px 30px rgba(0,0,0,.8) }
  .slide .count { position: absolute; right: 90px; bottom: 128px; font-size: 26px; color: #b9c2d0; font-weight: 600 }
  .final { position: absolute; inset: 0; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
    background: radial-gradient(1200px 700px at 70% 20%, #1c2433 0%, #0e1014 60%) #0e1014 }
  .final .logo { width: 190px; height: 190px; border-radius: 44px; box-shadow: 0 0 90px rgba(106,166,255,.45), 0 24px 60px rgba(0,0,0,.6) }
  .final h1 { font-size: 110px; margin-top: 26px }
  .final .tag { font-size: 44px; color: #dfe8f7; margin-top: 14px; font-weight: 600; max-width: 1500px; line-height: 1.3 }
  .final .chips { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; justify-content: center }
  .final .chips span { font-size: 26px; padding: 12px 24px; border: 1px solid #3a4a66; border-radius: 99px; background: rgba(40, 60, 95, .35); color: #dfe8f7 }
  .items { margin-top: 44px; display: grid; gap: 18px; text-align: left; min-width: 1100px }
  .items div { display: flex; align-items: center; gap: 26px; font-size: 38px; color: #eef1f6; animation: rise .7s cubic-bezier(.2,.8,.2,1) both }
  .items i { font-style: normal; width: 62px; height: 62px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 30px; font-weight: 800;
    color: #0e1014; background: linear-gradient(135deg, #8fb8ff, #6aa6ff); box-shadow: 0 0 26px rgba(106,166,255,.45) }
  @keyframes slide { 0% { opacity: 0 } 9% { opacity: 1 } 91% { opacity: 1 } 100% { opacity: 0 } }
  @keyframes kb { from { transform: scale(1.0) translate(0, 0) } to { transform: scale(1.09) translate(-1.5%, -1%) } }
  @keyframes kb2 { from { transform: scale(1.09) translate(1.5%, 1%) } to { transform: scale(1.0) translate(0, 0) } }
  @keyframes rise { from { opacity: 0; transform: translateY(28px); filter: blur(6px) } to { opacity: 1; transform: none; filter: blur(0) } }
  @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes zoomin { from { opacity: 0; transform: scale(1.07) } to { opacity: 1; transform: scale(1) } }
  @keyframes pop { 0% { opacity: 0; transform: scale(.5) } 65% { opacity: 1; transform: scale(1.07) } 100% { opacity: 1; transform: scale(1) } }
  @keyframes track { from { opacity: 0; letter-spacing: .55em } to { opacity: 1; letter-spacing: .18em } }
  @keyframes sweep { from { transform: translateX(-120%) skewX(-18deg) } to { transform: translateX(420%) skewX(-18deg) } }
  @keyframes rule { from { opacity: 0; transform: scaleX(0) } to { opacity: 1; transform: scaleX(1) } }
  @keyframes chip { from { opacity: 0; transform: translateY(16px) scale(.9) } to { opacity: 1; transform: none } }
  @keyframes drift { from { transform: translate(-3%, -2%) scale(1) } to { transform: translate(5%, 4%) scale(1.1) } }
  @keyframes drift2 { from { transform: translate(3%, 2%) scale(1.05) } to { transform: translate(-4%, -3%) scale(1) } }
`

// a picture of the tutorials' folder (or the repository's), inlined: the card page has no files of its own
const TUTORIALS = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const inline = (file) => {
  const full = path.resolve(TUTORIALS, file)
  const type = full.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${type};base64,${fs.readFileSync(full).toString('base64')}`
}

function cardHtml(kind, data, banner) {
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const glow = '<div class="glow a"></div><div class="glow b"></div>'
  // what Plenio is, in pictures: a slide each `step` seconds (slowly zooming, its label rising), then the name and the
  // line that says what it is
  if (kind === 'showcase') {
    const step = data.step ?? 2.8
    const slides = data.slides.map((sl, i) => {
      const d = (i * step).toFixed(2), len = (step + 0.35).toFixed(2)
      return `<div class="slide" style="animation: slide ${len}s linear ${d}s both">
        <img src="${inline(sl.file)}" style="object-position:${sl.pos ?? 'center'}; animation: ${i % 2 ? 'kb2' : 'kb'} ${len}s linear ${d}s both">
        <div class="shade"></div>
        <div class="label" style="animation: rise .7s cubic-bezier(.2,.8,.2,1) ${(i * step + 0.3).toFixed(2)}s both"><div class="k">${esc(sl.kicker)}</div><div class="t">${esc(sl.title)}</div></div>
        <div class="count">${i + 1} / ${data.slides.length}</div></div>`
    }).join('')
    const end = (data.slides.length * step).toFixed(2)
    const chips = (data.chips ?? []).map((c, i) => `<span style="animation: chip .5s cubic-bezier(.2,1.3,.4,1) ${(data.slides.length * step + 1.2 + i * 0.12).toFixed(2)}s both">${esc(c)}</span>`).join('')
    return `<div class="show">${slides}<div class="final" style="animation: fade .6s ease ${end}s both">${glow}
      <img class="logo" src="${inline(data.logo)}" style="animation: pop .7s cubic-bezier(.2,1.2,.4,1) ${end}s both">
      <h1 style="animation: rise .9s cubic-bezier(.2,.8,.2,1) ${(+end + 0.3).toFixed(2)}s both">${esc(data.name)}</h1>
      <div class="tag" style="animation: rise .9s cubic-bezier(.2,.8,.2,1) ${(+end + 0.6).toFixed(2)}s both">${esc(data.tagline)}</div>
      <div class="chips">${chips}</div></div></div>`
  }
  // what this video shows: its tutorial, then the points one after another
  if (kind === 'overview') {
    const items = data.items.map((it, i) => `<div style="animation-delay:${(0.9 + i * 0.45).toFixed(2)}s"><i>${i + 1}</i><span>${esc(it)}</span></div>`).join('')
    return `${glow}<div class="wrap"><div class="kicker">${esc(data.kicker)}</div><h1>${esc(data.title)}</h1><div class="rule"></div>
      <div class="items">${items}</div></div>`
  }
  if (kind === 'title') {
    return `${glow}<div class="wrap"><div class="banner"><img src="${banner}"></div><div class="kicker">${esc(data.kicker)}</div>
      <h1>${data.title}</h1><div class="sub">${esc(data.subtitle)}</div></div><div class="foot">${esc(data.foot)}</div>`
  }
  if (kind === 'chapter') {
    const steps = data.steps ? `<div class="steps">${data.steps.map((s, i) => `<span style="animation-delay:${(0.95 + i * 0.12).toFixed(2)}s">${esc(s)}</span>`).join('')}</div>` : ''
    return `${glow}<div class="wrap"><div class="kicker">${esc(data.kicker)}</div><div class="part">${esc(data.part)}</div><h1>${esc(data.title)}</h1>
      <div class="rule"></div><div class="sub">${esc(data.subtitle)}</div>${steps}</div>`
  }
  const lines = (data.lines ?? []).map((l, i) => `<div style="animation-delay:${(0.8 + i * 0.25).toFixed(2)}s">${l}</div>`).join('')
  return `${glow}<div class="wrap"><div class="banner" style="width: 900px; margin-bottom: 40px"><img src="${banner}"></div><h1>${esc(data.title)}</h1>
    <div class="lines">${lines}</div></div>`
}

// (exported for previews of the cards)
export const cardPage = (kind, data, banner) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>${cardHtml(kind, data, banner)}</body></html>`

// The cards as stills (their last frame) - for the promo.
export async function renderCards(cards, dir, banner) {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
  const bannerUrl = 'data:image/png;base64,' + fs.readFileSync(banner).toString('base64')
  for (const [i, c] of cards.entries()) {
    await page.setContent(cardPage(c.kind, c.data, bannerUrl))
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()))
    await page.waitForTimeout(150)
    c.png = path.join(dir, `card-${i}.png`)
    await page.screenshot({ path: c.png })
  }
  await browser.close()
}

// A card as a clip of exactly `count` frames: its animations stepped frame by frame in Chromium, a short
// fade from and to black.
async function cardClip(page, card, count, banner, file, work) {
  await page.setContent(cardPage(card.kind, card.data, banner))
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = r))))))
  await page.evaluate(() => document.fonts.ready)
  const d = count / FPS
  const enc = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', `format=yuv420p,fade=t=in:st=0:d=0.3,fade=t=out:st=${Math.max(0, d - 0.3).toFixed(3)}:d=0.3`, '-frames:v', String(count),
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { cwd: work, stdio: ['pipe', 'inherit', 'inherit'] })
  const closed = new Promise((resolve, reject) => enc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg (card ${file}) exited ${code}`)))))
  for (let f = 0; f < count; f++) {
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms }), (f / FPS) * 1000)
    const jpeg = await page.screenshot({ type: 'jpeg', quality: 93 })
    if (!enc.stdin.write(jpeg)) await new Promise((r) => enc.stdin.once('drain', r))
  }
  enc.stdin.end()
  await closed
}

// --- the band and the narration file ------------------------------------------------------------------

const stamp = (t, sep) => {
  const ms = Math.max(0, Math.round(t * 1000))
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), r = ms % 1000
  return sep === ','
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`
    : `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(Math.floor(r / 10)).padStart(2, '0')}`
}

// the narration as subtitles for a TTS: each line from where it is spoken for as long as it is spoken
function srt(lines) {
  return lines.map((l, i) => `${i + 1}\n${stamp(l.start, ',')} --> ${stamp(l.start + l.seconds, ',')}\n${l.spoken}\n`).join('\n')
}

function labelsAss(markers, tl) {
  const y = HEIGHT - BAND / 2
  const escape = (s) => s.replace(/\\/g, '\\\\').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\n/g, '\\N')
  const lines = [
    '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${WIDTH}`, `PlayResY: ${HEIGHT}`, 'WrapStyle: 0', 'ScaledBorderAndShadow: yes', '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Chapter,Segoe UI,21,&H00B8A99A,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0.5,0,1,0,0,4,28,0,0,1',
    'Style: Speed,Segoe UI,23,&H003CB4F0,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,6,0,28,0,1',
    '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  const chapters = [...markers.chapters].sort((a, b) => a.t - b.t)
  const chapterAt = (t) => chapters.filter((c) => c.t <= t + 1e-6).pop()
  const label = (from, to, title) => lines.push(`Dialogue: 0,${stamp(from)},${stamp(to)},Chapter,,0,0,0,,{\\pos(28,${y})\\fad(250,0)}${escape(title.toUpperCase())}`)
  for (const p of tl.pieces) {
    if (p.type === 'card') continue
    if (p.type === 'hold') {
      const ch = chapterAt(p.at)
      if (ch) label(p.start, p.start + p.duration, ch.title)
      continue
    }
    // the chapter at the piece's start, then every chapter that begins inside it (raw time -> edit time)
    const at = (t) => p.start + Math.min(p.duration, Math.max(0, (t - p.a) / p.speed))
    const first = chapterAt(p.a)
    const runs = [...(first ? [{ t: p.a, title: first.title }] : []), ...chapters.filter((c) => c.t > p.a + 1e-6 && c.t < p.b)]
    runs.forEach((c, i) => label(at(c.t), i + 1 < runs.length ? at(runs[i + 1].t) : p.start + p.duration, c.title))
    if ((p.fast !== null && p.speed > 1.4) || (p.quiet && p.speed > 2.6)) lines.push(`Dialogue: 1,${stamp(p.start)},${stamp(p.start + p.duration)},Speed,,0,0,0,,{\\pos(${WIDTH - 28},${y})}▶▶ ${Math.round(p.speed)}× faster`)
  }
  return lines.join('\n') + '\n'
}

// --- chapters --------------------------------------------------------------------------------------

// The video's chapters in edit time, for YouTube: a chapter starts at its card when the card comes right
// before it; the title card is "Intro"; a chapter the script returns to is "(continued)"; chapters
// shorter than ten seconds join the one before (YouTube's minimum).
export function chaptersOf(markers, tl) {
  const cards = tl.pieces.filter((p) => p.type === 'card')
  const list = [{ start: 0, title: 'Intro' }]
  const seen = new Set()
  for (const c of [...markers.chapters].sort((a, b) => a.t - b.t)) {
    const card = cards.find((p) => p.card.kind === 'chapter' && p.card.t <= c.t + 1e-6 && c.t - p.card.t < 2.5)
    const start = card ? card.start : tl.map(c.t)
    const title = seen.has(c.title) ? `${c.title} (continued)` : c.title
    seen.add(c.title)
    if (start < 1) list[0].title = title
    else list.push({ start, title })
  }
  const end = cards.find((p) => p.card.kind === 'end')
  if (end) list.push({ start: end.start, title: 'What next' })
  const merged = []
  list.forEach((c, i) => {
    const next = list[i + 1]?.start ?? tl.duration
    if (merged.length && next - c.start < 10) return
    merged.push(c)
  })
  const stamp = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
  return merged.map((c) => `${stamp(c.start)} ${c.title}`).join('\n') + '\n'
}

// --- the effects --------------------------------------------------------------------------------------

// The effects' cue sheet in edit time: the recording's sounds (a click, typing, a camera move ...) where they
// play at normal speed or a little faster (inside a fast-forwarded wait only the end of a run is heard),
// the cards, and a whirr where a wait starts to play faster.
function cues(markers, tl) {
  const events = []
  const clipAt = (t) => tl.pieces.find((p) => p.type === 'clip' && t >= p.a - 1e-6 && t < p.b)
  for (const e of markers.sfx ?? []) {
    const p = clipAt(e.t)
    if (!p) continue
    const always = e.kind === 'done' || e.kind === 'stop'
    if (p.fast !== null && p.speed > 1.6 && !always) continue
    events.push({ ...e, t: tl.map(e.t), speed: p.speed })
  }
  for (const p of tl.pieces) {
    if (p.type === 'card') {
      const data = p.card.data ?? {}
      events.push({ t: p.start, kind: `card-${p.card.kind}`, seconds: p.duration, steps: (data.steps ?? data.slides ?? data.items ?? []).length, step: data.step })
    }
    if (p.type === 'clip' && p.fast !== null && p.speed > 1.4) {
      const before = tl.pieces[tl.pieces.indexOf(p) - 1]
      if (!(before?.type === 'clip' && before.fast !== null && before.speed > 1.4)) events.push({ t: p.start, kind: 'ff' })
    }
  }
  return events
}

// --- what the page played (the score editor) -----------------------------------------------------------

// The page's recordings (studio taps) on the recording's timeline: stereo, 48 kHz, as long as the recording.
// null: the page played nothing.
function rawEditorTrack(markers, dir) {
  const taps = markers.taps ?? []
  if (!taps.length) return null
  const length = Math.ceil(markers.duration * RATE)
  const left = new Float32Array(length), right = new Float32Array(length)
  let any = false
  for (const tap of taps) {
    // the browser sends no audio while nothing plays: the recording has gaps in its time stamps, which the
    // decoder must fill with silence, or every sound after a gap comes too early
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', path.join(dir, tap.file), '-af', 'aresample=async=1:first_pts=0', '-f', 'f32le', '-ac', '2', '-ar', String(RATE), '-'], { maxBuffer: 2 ** 31 })
    if (r.status !== 0) throw new Error(`could not decode ${tap.file}: ${r.stderr}`)
    const bytes = new Uint8Array(r.stdout.length - (r.stdout.length % 8))
    bytes.set(r.stdout.subarray(0, bytes.length))
    const pcm = new Float32Array(bytes.buffer)
    const at = Math.round(tap.t * RATE)
    for (let i = 0; i + 1 < pcm.length; i += 2) {
      const k = at + i / 2
      if (k < 0 || k >= length) continue
      left[k] += pcm[i]
      right[k] += pcm[i + 1]
      if (!any && Math.abs(pcm[i]) > 1e-4) any = true
    }
  }
  return any ? { left, right } : null
}

// Where the page sounds (raw seconds): 50 ms windows above about -55 dBFS, gaps under 0.6 s joined.
function soundingStretches(track) {
  const win = Math.round(0.05 * RATE)
  const out = []
  let start = null, last = 0
  for (let i = 0; i < track.left.length; i += win) {
    const end = Math.min(track.left.length, i + win)
    let sum = 0
    for (let k = i; k < end; k++) sum += track.left[k] * track.left[k] + track.right[k] * track.right[k]
    if (Math.sqrt(sum / (2 * (end - i))) < 0.0018) continue
    const t = i / RATE
    if (start !== null && t - last > 0.6) { out.push([start - 0.3, last + 0.3]); start = null }
    if (start === null) start = t
    last = end / RATE
  }
  if (start !== null) out.push([start - 0.3, last + 0.3])
  return out
}

// The track cut like the picture: what plays at normal speed is heard, a fast-forwarded wait, a quicker
// stretch, a hold and a card are silent; a short fade where the sound is cut.
function cutEditorTrack(track, tl, samples) {
  const left = new Float32Array(samples), right = new Float32Array(samples)
  const heard = (p) => p?.type === 'clip' && p.fast === null && !p.quiet
  const fade = Math.round(0.008 * RATE)
  tl.pieces.forEach((p, index) => {
    if (!heard(p)) return
    const from = Math.round(p.a * RATE), to = Math.round(p.start * RATE), n = Math.round(p.duration * RATE)
    const before = tl.pieces[index - 1], after = tl.pieces[index + 1]
    const fadeIn = !(heard(before) && Math.abs(before.b - p.a) < 1e-6), fadeOut = !(heard(after) && Math.abs(after.a - p.b) < 1e-6)
    for (let i = 0; i < n && to + i < samples; i++) {
      const k = from + i
      if (k >= track.left.length) break
      let g = 1
      if (fadeIn && i < fade) g = i / fade
      if (fadeOut && n - i < fade) g = Math.min(g, (n - i) / fade)
      left[to + i] = track.left[k] * g
      right[to + i] = track.right[k] * g
    }
  })
  return { left, right }
}

// --- the songs ----------------------------------------------------------------------------------------

// The songs the video plays (studio listen(): a preview started at raw time t): each fades in where its
// preview starts and out after its seconds. Written as they are (music.wav), ducked under the voice with
// the score editor's sound (editor.wav, ducked a little) and the effects (effects and music.wav), and as the
// whole soundtrack (mix.wav) - all exactly `samples` long. Returns whether the video has songs.
function mixAudio(sounds, tl, dir, work, samples, editor) {
  const pad = `apad=whole_len=${samples},atrim=end_sample=${samples}`
  const stereo = `aformat=sample_rates=${RATE}:channel_layouts=stereo`
  const wav = ['-c:a', 'pcm_s24le', '-ar', String(RATE)]
  const inputs = ['-i', 'voice.wav', '-i', 'effects.wav', ...(editor ? ['-i', 'editor.wav'] : [])]
  const first = inputs.length / 2
  const chains = []
  sounds.forEach((s, i) => {
    inputs.push('-i', path.join(dir, s.file))
    const at = Math.round(tl.map(s.t) * 1000)
    chains.push(`[${first + i}:a]atrim=start=${s.from}:duration=${s.seconds},asetpts=PTS-STARTPTS,${stereo},` +
      `afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, s.seconds - 2)}:d=2,volume=0.7,adelay=${at}|${at}[s${i}]`)
  })
  const graph = [...chains, `[0:a]${stereo},asplit=4[v1][v2][v3][v4]`, `[1:a]${stereo},asplit=2[e1][e2]`]
  const outs = []
  const beds = []
  if (sounds.length) {
    graph.push(`${sounds.map((_, i) => `[s${i}]`).join('')}amix=inputs=${sounds.length}:normalize=0,${pad},asplit=2[music][bed]`)
    graph.push('[bed][v1]sidechaincompress=threshold=0.015:ratio=10:attack=30:release=600:makeup=1,asplit=2[d1][d2]')
    beds.push(['[d1]', '[d2]'])
    outs.push('-map', '[music]', ...wav, 'music.wav')
  } else graph.push('[v1]anullsink')
  if (editor) {
    // the editor is what the viewer learns from: under the voice, but still clearly there
    graph.push(`[2:a]${stereo},${pad}[ed]`, '[ed][v4]sidechaincompress=threshold=0.03:ratio=3:attack=20:release=400:makeup=1,asplit=2[k1][k2]')
    beds.push(['[k1]', '[k2]'])
  } else graph.push('[v4]anullsink')
  const fx = ['[e1]', ...beds.map((b) => b[0])]
  const all = ['[e2]', ...beds.map((b) => b[1]), '[v2]']
  graph.push(fx.length > 1 ? `${fx.join('')}amix=inputs=${fx.length}:normalize=0,${pad}[fxmusic]` : `[e1]${pad}[fxmusic]`)
  graph.push(`${all.join('')}amix=inputs=${all.length}:normalize=0,alimiter=limit=0.97:level=false,${pad}[mix]`)
  graph.push('[v3]anullsink')
  outs.push('-map', '[fxmusic]', ...wav, 'effects and music.wav', '-map', '[mix]', ...wav, 'mix.wav')
  ffmpeg([...inputs, '-filter_complex', graph.join(';'), ...outs], work)
  return sounds.length > 0
}

// --- the package ----------------------------------------------------------------------------------------

const PACKAGE_README = (name, v) => `# ${name}

Everything this video is made of, for editing by hand. Rendered by \`tools/tutorials/record.mjs\` of the
Plenio repository (\`--render-only\` cuts it again from the recording; see tools/tutorials/README.md).

| File | What it is |
|---|---|
| \`${name}.mp4\` | the finished video: picture, voice-over, effects and the songs (AAC 192k) |
| \`${name} (no voice).mp4\` | the same picture without any sound - for your own soundtrack |
| \`${name}.srt\` | the narration, timed to both videos, **written for a TTS** (spellings like "Yu-eh two", \`[pause:0.4s]\` tags) |
| \`${name} (written).srt\` | the same lines with the normal spellings and no tags - as subtitles |
| \`audio/voice.wav\` | the voice-over alone, 48 kHz mono, levelled to -16 LUFS |
| \`audio/effects and music.wav\` | everything but the voice, as it sounds in the video: the effects, the score editor's sound and the songs (ducked under the voice) |
| \`audio/editor.wav\` | what the score editor plays, not ducked: the notes in the tracks' sounds, the source recording (both, A/B), a sound's preview, the keys of a MIDI keyboard (only when the video plays the editor) |
| \`audio/effects.wav\` | the effects alone: clicks, keys, camera moves, the cards, a run that stops or ends |
| \`audio/music.wav\` | the songs alone, as they play in the video, not ducked (only when the video plays songs) |
| \`audio/mix.wav\` | the soundtrack of the finished video (voice + effects + editor + songs) |
| \`audio/lines/NNN.flac\` | every narration line as its own file (the TTS output, unprocessed) |
| \`audio/lines.tsv\` | per line: number, start, end and length in seconds, the written and the spoken text |
| \`voice/\` | the narrator: the reference recording the voice is cloned from, its transcript, and how it was made |
| \`youtube-chapters.txt\` | the chapters with their times in this video, to paste into a YouTube description |
| \`thumbnail.jpg\` | the title card as a YouTube thumbnail (1280 x 720) |

Every WAV is 48 kHz, 24 bit, and exactly as long as the video (${v.duration} s, ${v.frames} frames at ${FPS} fps =
${v.samples} samples): put \`${name} (no voice).mp4\`, \`audio/voice.wav\` and \`audio/effects and music.wav\` on
three tracks at 0:00 and they play in sync from the first frame to the last - at 0 dB they sound like the
finished video. Your own background music goes on a fourth track.

## Timing

The picture was cut for the voice: each line starts ${v.lead} s after its cue (a caption or a card of the
script), and the next cue waits until ${v.tail} s after the line has ended. Where a line needed more time than
the recording gave it, the edit made room - a card stays longer, a fast-forwarded wait plays slower, or the
picture holds still just before the next cue. Where the recording left a long silence between two lines, the
picture plays a little faster there (at most ${v.squeeze}×, never while a song plays). So the SRT fits the
picture as it is: a new voice that speaks at about the same pace (about 180 words per minute while
speaking) fits the same slots.

## A new voice-over with your own TTS

- **TTS Audio Suite** (ComfyUI): the *TTS SRT* node with the OmniVoice engine, the SRT above as its text,
  and the reference in \`voice/\` (through *Character Voices*, with the transcript as reference text) as the
  narrator. *timing_mode* \`smart_natural\` keeps the speech natural and shifts lines a little where needed;
  \`pad_with_silence\` places every line exactly at its start. The OmniVoice settings of this video:
  speed ${v.speed}, ${v.steps} steps, seed ${v.seed} (per line, unless the narration file sets another).
- **Any other tool**: \`${name} (written).srt\` has the plain text; \`audio/lines.tsv\` the start of every line.
  Put the new voice on \`${name} (no voice).mp4\` and \`audio/effects and music.wav\` underneath.
`

function writePackage({ pkg, name, lines, work, voiceDir, hasMusic, hasEditor, silent, voiced, info }) {
  fs.rmSync(pkg, { recursive: true, force: true })
  fs.mkdirSync(path.join(pkg, 'audio', 'lines'), { recursive: true })
  fs.mkdirSync(path.join(pkg, 'voice'), { recursive: true })
  fs.renameSync(voiced, path.join(pkg, `${name}.mp4`))
  fs.renameSync(silent, path.join(pkg, `${name} (no voice).mp4`))
  fs.writeFileSync(path.join(pkg, `${name}.srt`), srt(lines))
  const written = lines.map((l) => ({ ...l, spoken: l.text.replace(/\s*\[pause:[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim() }))
  fs.writeFileSync(path.join(pkg, `${name} (written).srt`), srt(written))
  for (const f of ['voice.wav', 'effects.wav', 'effects and music.wav', 'mix.wav', ...(hasMusic ? ['music.wav'] : []), ...(hasEditor ? ['editor.wav'] : [])]) {
    fs.copyFileSync(path.join(work, f), path.join(pkg, 'audio', f))
  }
  const rows = ['line\tstart\tend\tseconds\twritten\tspoken']
  lines.forEach((l, i) => {
    const n = String(i + 1).padStart(3, '0')
    fs.copyFileSync(l.audio, path.join(pkg, 'audio', 'lines', `${n}.flac`))
    rows.push([n, l.start.toFixed(3), (l.start + l.seconds).toFixed(3), l.seconds.toFixed(3), written[i].spoken, l.spoken].join('\t'))
  })
  fs.writeFileSync(path.join(pkg, 'audio', 'lines.tsv'), rows.join('\n') + '\n')
  for (const f of fs.readdirSync(voiceDir)) fs.copyFileSync(path.join(voiceDir, f), path.join(pkg, 'voice', f))
  fs.writeFileSync(path.join(pkg, 'README.md'), PACKAGE_README(name, { lead: LEAD, tail: TAIL, squeeze: MAX_SQUEEZE, ...VOICE, ...info }))
}

// --- the render ---------------------------------------------------------------------------------------

export async function renderTutorial({ dir: folder, name, banner, narration, lexicon, voiceDir, ttsUrl, log = console.log }) {
  const dir = path.resolve(folder)
  const markers = JSON.parse(fs.readFileSync(path.join(dir, 'markers.json'), 'utf8'))
  const work = path.join(dir, 'work')
  fs.rmSync(work, { recursive: true, force: true })
  fs.mkdirSync(work, { recursive: true })

  // the narration: anchored at its cues, spoken (cached by text), then the edit makes room for it and
  // takes it out of long silences
  const words = parseLexicon(lexicon)
  const lines = anchorNarration(parseNarration(narration), markers, path.basename(narration))
  for (const line of lines) line.spoken = speakable(line.text, words)
  await synthesize(lines, { url: ttsUrl, cache: path.join(path.dirname(dir), 'voice-cache'), voiceDir, log })
  const raw = rawEditorTrack(markers, dir)
  const busy = raw ? soundingStretches(raw) : []
  const { tl, room, taken } = plan(markers, lines, busy)
  fs.writeFileSync(path.join(work, 'voice-lines.json'), JSON.stringify(lines.map(({ spoken, audio, seconds, start }) => ({ spoken, audio, seconds, start })), null, 1))

  const frame = [`pad=${WIDTH}:${HEIGHT}:0:0:color=0x0e1014`, `drawbox=x=0:y=${HEIGHT - BAND}:w=${WIDTH}:h=2:color=0x2a3140:t=fill`]
  const list = []
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const cardPageView = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
  const bannerUrl = 'data:image/png;base64,' + fs.readFileSync(banner).toString('base64')
  let total = 0
  for (const [i, p] of tl.pieces.entries()) {
    const file = `piece-${String(i).padStart(3, '0')}.mp4`
    const count = Math.round(p.duration * FPS)
    total += count
    const enc = ['-frames:v', String(count), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file]
    if (p.type === 'clip') {
      // exactly `count` frames: the last one repeats if the cut gives one frame too few
      const vf = [`setpts=(PTS-STARTPTS)/${p.speed.toFixed(6)}`, `fps=${FPS}`, 'tpad=stop_mode=clone:stop_duration=1', ...frame].join(',')
      ffmpeg(['-ss', p.a.toFixed(3), '-to', (p.b + 0.2).toFixed(3), '-i', path.join(dir, 'raw.mp4'), '-vf', vf, ...enc], work)
    } else if (p.type === 'hold') {
      const still = `hold-${i}.png`
      ffmpeg(['-ss', Math.max(0, p.at - 1 / FPS).toFixed(3), '-i', path.join(dir, 'raw.mp4'), '-frames:v', '1', still], work)
      ffmpeg(['-loop', '1', '-i', still, '-vf', [`fps=${FPS}`, 'format=yuv420p', ...frame].join(','), ...enc], work)
    } else {
      await cardClip(cardPageView, p.card, count, bannerUrl, file, work)
    }
    list.push(`file '${file}'`)
  }
  await browser.close()
  fs.writeFileSync(path.join(work, 'list.txt'), list.join('\n') + '\n')
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'joined.mp4'], work)
  fs.writeFileSync(path.join(work, 'labels.ass'), labelsAss(markers, tl))
  ffmpeg(['-i', 'joined.mp4', '-vf', 'subtitles=labels.ass', '-frames:v', String(total), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', 'labelled.mp4'], work)

  // the sound: every track exactly as long as the picture
  const duration = total / FPS
  const samples = Math.round(duration * RATE)
  mixVoice(lines, duration, path.join(work, 'voice.wav'), work)
  const fx = effects(cues(markers, tl), duration)
  writeWav(path.join(work, 'effects.wav'), fx.left, fx.right)
  if (raw) {
    const cut = cutEditorTrack(raw, tl, samples)
    writeWav(path.join(work, 'editor.wav'), cut.left, cut.right)
  }
  const hasMusic = mixAudio(markers.sounds ?? [], tl, dir, work, samples, !!raw)

  // everything goes into one folder per video: <out>/<name>/ (see PACKAGE_README)
  const pkg = path.join(path.dirname(dir), name)
  const voiced = path.join(work, 'voiced.mp4')
  const silent = path.join(work, 'silent.mp4')
  ffmpeg(['-i', 'labelled.mp4', '-i', 'mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', voiced], work)
  ffmpeg(['-i', 'labelled.mp4', '-an', '-c:v', 'copy', '-movflags', '+faststart', silent], work)
  writePackage({ pkg, name, lines, work, voiceDir, hasMusic, hasEditor: !!raw, silent, voiced, info: { duration: duration.toFixed(3), frames: total, samples } })
  fs.writeFileSync(path.join(pkg, 'youtube-chapters.txt'), chaptersOf(markers, tl))
  // the YouTube thumbnail: the title card, its animation settled
  ffmpeg(['-ss', '2.6', '-i', path.join(pkg, `${name}.mp4`), '-frames:v', '1', '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', path.join(pkg, 'thumbnail.jpg')], work)
  const held = [...room.holds.values()].reduce((a, b) => a + b, 0)
  log(`${pkg}: ${duration.toFixed(1)} s (${total} frames), ${lines.length} lines (${lines.reduce((a, l) => a + l.seconds, 0).toFixed(0)} s of speech), ` +
    `${room.holds.size} holds (${held.toFixed(1)} s), ${room.fast.size} changed waits, ${room.cards.size} longer cards, ` +
    `${room.squeeze.length} quicker stretches (${taken.toFixed(1)} s of silence taken out), ` +
    `${busy.length} stretches of editor sound (${busy.reduce((a, [x, y]) => a + y - x, 0).toFixed(1)} s)`)
  return { pkg, duration, lines, tl }
}
