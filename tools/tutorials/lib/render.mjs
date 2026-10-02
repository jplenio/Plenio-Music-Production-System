// The edit of a tutorial recording: raw.mp4 + markers.json (studio.mjs) -> a 1920 x 1080 video.
//
// - the recording (1920 x 1000) sits above an 80 px caption band;
// - waits marked as fast play faster (each piece at most its `seconds`), with a speed badge;
// - title, chapter and end cards (HTML rendered by Chromium) are cut in where the script placed them;
// - the captions are burned into the band (ASS) and also written as an .srt file;
// - the chapter name sits on the left of the band.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { loadPlaywright } from './studio.mjs'

const FPS = 30
const BAND = 80
const WIDTH = 1920
const HEIGHT = 1080

function ffmpeg(args, cwd) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd, encoding: 'utf8', maxBuffer: 1 << 26 })
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`)
}

// --- the timeline -----------------------------------------------------------------------------------

export function timeline(markers) {
  const end = markers.duration
  const fast = markers.fast
    .filter((f) => f.t1 !== null && f.t1 - f.t0 > 0.05)
    .map((f) => ({ ...f, speed: Math.max(1, (f.t1 - f.t0) / f.seconds) }))
    .sort((a, b) => a.t0 - b.t0)
  const cards = [...markers.cards].sort((a, b) => a.t - b.t)
  // cut points: fast pieces' bounds and card positions
  const cuts = new Set([0, end])
  for (const f of fast) { cuts.add(Math.min(end, f.t0)); cuts.add(Math.min(end, f.t1)) }
  for (const c of cards) cuts.add(Math.min(end, c.t))
  const points = [...cuts].sort((a, b) => a - b)
  const pieces = []
  let out = 0
  const pushCards = (t) => {
    for (const c of cards.filter((x) => !x.done && x.t <= t + 1e-6)) {
      c.done = true
      pieces.push({ type: 'card', card: c, start: out, duration: c.seconds })
      out += c.seconds
    }
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    pushCards(a)
    if (b - a < 0.02) continue
    const f = fast.find((x) => a >= x.t0 - 1e-6 && b <= x.t1 + 1e-6)
    const speed = f ? f.speed : 1
    const duration = (b - a) / speed
    pieces.push({ type: 'clip', a, b, speed, label: f?.label ?? '', start: out, duration })
    out += duration
  }
  pushCards(end + 1)
  // raw time -> edit time (a time on a card boundary maps to the clip after the card)
  const map = (t) => {
    const clips = pieces.filter((p) => p.type === 'clip')
    for (const p of clips) if (t >= p.a - 1e-6 && t < p.b) return p.start + (t - p.a) / p.speed
    const last = clips[clips.length - 1]
    return last ? last.start + last.duration : 0
  }
  return { pieces, map, duration: out }
}

// --- cards ------------------------------------------------------------------------------------------

const CARD_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; color: #eef1f6; font-family: "Segoe UI", system-ui, sans-serif;
    background: radial-gradient(1200px 700px at 70% 20%, #1c2433 0%, #0e1014 60%) #0e1014; }
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px }
  .banner { width: 1180px; border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,.55); margin-bottom: 54px }
  .kicker { font-size: 30px; letter-spacing: .18em; text-transform: uppercase; color: #8fb8ff; font-weight: 600; margin-bottom: 18px }
  h1 { font-size: 76px; font-weight: 700; line-height: 1.1; letter-spacing: -.01em }
  h1 .num { color: #6aa6ff }
  .sub { font-size: 36px; color: #b9c2d0; margin-top: 22px; font-weight: 400; max-width: 1500px; line-height: 1.35 }
  .foot { position: absolute; bottom: 44px; left: 0; right: 0; font-size: 24px; color: #7d8796; text-align: center }
  .steps { display: flex; gap: 18px; margin-top: 40px; flex-wrap: wrap; justify-content: center }
  .steps span { font-size: 26px; padding: 12px 22px; border: 1px solid #3a4a66; border-radius: 12px; background: rgba(40, 60, 95, .35); color: #dfe8f7 }
  .part { font-size: 150px; font-weight: 800; color: #6aa6ff; line-height: 1; margin-bottom: 10px }
  .lines { margin-top: 36px; font-size: 32px; color: #c9d2de; line-height: 1.7 }
  .lines b { color: #fff }
`

function cardHtml(kind, data, banner) {
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  if (kind === 'title') {
    return `<div class="wrap"><img class="banner" src="${banner}"><div class="kicker">${esc(data.kicker)}</div>
      <h1>${data.title}</h1><div class="sub">${esc(data.subtitle)}</div></div><div class="foot">${esc(data.foot)}</div>`
  }
  if (kind === 'chapter') {
    return `<div class="wrap"><div class="kicker">${esc(data.kicker)}</div><div class="part">${esc(data.part)}</div><h1>${esc(data.title)}</h1>
      <div class="sub">${esc(data.subtitle)}</div>${data.steps ? `<div class="steps">${data.steps.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}</div>`
  }
  return `<div class="wrap"><img class="banner" style="width: 900px; margin-bottom: 40px" src="${banner}"><h1>${esc(data.title)}</h1>
    <div class="lines">${(data.lines ?? []).join('<br>')}</div></div>`
}

async function renderCards(cards, dir, banner) {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
  const bannerUrl = 'data:image/png;base64,' + fs.readFileSync(banner).toString('base64')
  for (const [i, c] of cards.entries()) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>${cardHtml(c.kind, c.data, bannerUrl)}</body></html>`)
    await page.waitForTimeout(150)
    c.png = path.join(dir, `card-${i}.png`)
    await page.screenshot({ path: c.png })
  }
  await browser.close()
}

// --- captions ---------------------------------------------------------------------------------------

const stamp = (t, sep) => {
  const ms = Math.max(0, Math.round(t * 1000))
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), r = ms % 1000
  return sep === ','
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`
    : `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(Math.floor(r / 10)).padStart(2, '0')}`
}

function captionsOf(markers, tl) {
  const list = markers.captions
    .map((c) => ({ start: tl.map(c.t0), end: tl.map(c.t1 ?? markers.duration), text: c.text }))
    .filter((c) => c.end - c.start > 0.3)
  // never across a card
  for (const c of list) {
    for (const p of tl.pieces.filter((x) => x.type === 'card')) {
      if (c.start < p.start && c.end > p.start) c.end = p.start
    }
  }
  return list.filter((c) => c.end - c.start > 0.3)
}

function srt(captions) {
  return captions.map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${c.text}\n`).join('\n')
}

function ass(captions, markers, tl) {
  const y = HEIGHT - BAND / 2
  const escape = (s) => s.replace(/\\/g, '\\\\').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\n/g, '\\N')
  const lines = [
    '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${WIDTH}`, `PlayResY: ${HEIGHT}`, 'WrapStyle: 0', 'ScaledBorderAndShadow: yes', '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Caption,Segoe UI,31,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,330,330,0,1',
    'Style: Chapter,Segoe UI,21,&H00B8A99A,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0.5,0,1,0,0,4,28,0,0,1',
    'Style: Speed,Segoe UI,23,&H003CB4F0,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,6,0,28,0,1',
    '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  for (const c of captions) lines.push(`Dialogue: 0,${stamp(c.start)},${stamp(c.end)},Caption,,0,0,0,,{\\pos(${WIDTH / 2},${y})}${escape(c.text)}`)
  const chapters = [...markers.chapters].sort((a, b) => a.t - b.t)
  for (const p of tl.pieces.filter((x) => x.type === 'clip')) {
    // the chapter at the piece's start, then every chapter that begins inside it (raw time → edit time)
    const at = (t) => p.start + Math.min(p.duration, Math.max(0, (t - p.a) / p.speed))
    const first = chapters.filter((c) => c.t <= p.a + 1e-6).pop()
    const runs = [...(first ? [{ t: p.a, title: first.title }] : []), ...chapters.filter((c) => c.t > p.a + 1e-6 && c.t < p.b)]
    runs.forEach((c, i) => {
      const end = i + 1 < runs.length ? at(runs[i + 1].t) : p.start + p.duration
      lines.push(`Dialogue: 0,${stamp(at(c.t))},${stamp(end)},Chapter,,0,0,0,,{\\pos(28,${y})}${escape(c.title.toUpperCase())}`)
    })
    if (p.speed > 1.4) lines.push(`Dialogue: 1,${stamp(p.start)},${stamp(p.start + p.duration)},Speed,,0,0,0,,{\\pos(${WIDTH - 28},${y})}▶▶ ${Math.round(p.speed)}× faster`)
  }
  return lines.join('\n') + '\n'
}

// --- the render ---------------------------------------------------------------------------------------

export async function renderTutorial({ dir: folder, name, banner, log = console.log }) {
  const dir = path.resolve(folder)
  const markers = JSON.parse(fs.readFileSync(path.join(dir, 'markers.json'), 'utf8'))
  const tl = timeline(markers)
  const work = path.join(dir, 'work')
  fs.rmSync(work, { recursive: true, force: true })
  fs.mkdirSync(work, { recursive: true })
  const cards = tl.pieces.filter((p) => p.type === 'card').map((p) => p.card)
  await renderCards(cards, work, banner)
  const bandTop = HEIGHT - BAND
  const list = []
  for (const [i, p] of tl.pieces.entries()) {
    const file = `piece-${String(i).padStart(3, '0')}.mp4`
    const enc = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file]
    if (p.type === 'clip') {
      const vf = [`setpts=(PTS-STARTPTS)/${p.speed.toFixed(5)}`, `fps=${FPS}`, `pad=${WIDTH}:${HEIGHT}:0:0:color=0x0e1014`,
        `drawbox=x=0:y=${bandTop}:w=${WIDTH}:h=2:color=0x2a3140:t=fill`].join(',')
      ffmpeg(['-ss', p.a.toFixed(3), '-to', p.b.toFixed(3), '-i', path.join(dir, 'raw.mp4'), '-vf', vf, ...enc], work)
    } else {
      const d = p.duration
      const vf = [`fps=${FPS}`, 'format=yuv420p', 'fade=t=in:st=0:d=0.35', `fade=t=out:st=${(d - 0.35).toFixed(2)}:d=0.35`].join(',')
      ffmpeg(['-loop', '1', '-t', d.toFixed(3), '-i', p.card.png, '-vf', vf, ...enc], work)
    }
    list.push(`file '${file}'`)
  }
  fs.writeFileSync(path.join(work, 'list.txt'), list.join('\n') + '\n')
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'joined.mp4'], work)

  const captions = captionsOf(markers, tl)
  fs.writeFileSync(path.join(work, 'captions.ass'), ass(captions, markers, tl))
  const outDir = path.dirname(dir)
  const final = path.join(outDir, `${name}.mp4`)
  const clean = path.join(outDir, `${name} (no subtitles).mp4`)
  fs.writeFileSync(path.join(outDir, `${name}.en.srt`), srt(captions))
  ffmpeg(['-i', 'joined.mp4', '-vf', 'subtitles=captions.ass', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', final], work)
  // without the burned captions (the band stays empty, the chapter and speed labels too)
  fs.writeFileSync(path.join(work, 'labels.ass'), ass([], markers, tl))
  ffmpeg(['-i', 'joined.mp4', '-vf', 'subtitles=labels.ass', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', clean], work)
  log(`${final}: ${tl.duration.toFixed(1)} s, ${tl.pieces.length} pieces, ${captions.length} captions`)
  return { final, clean, duration: tl.duration }
}
