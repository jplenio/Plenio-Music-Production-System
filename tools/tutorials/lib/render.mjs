// The edit of a tutorial recording: raw.mp4 + markers.json (studio.mjs) + the narration -> a 1920 x 1080
// video with a voice-over.
//
// - the recording (1920 x 1000) sits above an 80 px band with the chapter name (left) and, while a wait
//   plays faster, the speed (right);
// - waits marked as fast play faster (each piece at most its `seconds`);
// - title, chapter and end cards (HTML rendered by Chromium) are cut in where the script placed them;
// - the narration (narration/<script>.txt, voice.mjs) is spoken at its captions and cards; where a line
//   needs more time than the picture gives it, the edit makes room: a card stays longer, a fast-forwarded
//   wait plays slower, or the picture holds still before the next cue;
// - output: a folder <name>/ with the video (with the voice and without), the narration as SRT (for a TTS
//   and as written), the voice, the songs and the mix as WAV, every line's speech, and the narrator's
//   reference voice - documented in its README.md, for editing by hand.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { loadPlaywright } from './studio.mjs'
import { VOICE, anchorNarration, mixVoice, parseLexicon, parseNarration, speakable, synthesize } from './voice.mjs'

const FPS = 30
const BAND = 80
const WIDTH = 1920
const HEIGHT = 1080
// the narration's breathing: speech starts this long after its cue, and the next cue waits this long after it
const LEAD = 0.2
const TAIL = 0.4

function ffmpeg(args, cwd) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd, encoding: 'utf8', maxBuffer: 1 << 26 })
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`)
}

// --- the timeline -----------------------------------------------------------------------------------

const roomOf = () => ({ holds: new Map(), fast: new Map(), cards: new Map() })

// `room` makes time for the narration: holds (a still frame at a raw time, before what follows it), fast
// waits played slower (more seconds) and cards shown longer
export function timeline(markers, room = roomOf()) {
  const end = markers.duration
  const fast = markers.fast
    .map((f, index) => ({ ...f, index }))
    .filter((f) => f.t1 !== null && f.t1 - f.t0 > 0.05)
    .map((f) => ({ ...f, speed: Math.max(1, (f.t1 - f.t0) / (f.seconds + (room.fast.get(f.index) ?? 0))) }))
    .sort((a, b) => a.t0 - b.t0)
  const cards = markers.cards.map((c, index) => ({ ...c, index, seconds: c.seconds + (room.cards.get(index) ?? 0) })).sort((a, b) => a.t - b.t)
  const holds = [...room.holds.entries()].map(([t, seconds]) => ({ t: Math.min(end, t), seconds })).sort((a, b) => a.t - b.t)
  // cut points: fast pieces' bounds, card positions and holds
  const cuts = new Set([0, end])
  for (const f of fast) { cuts.add(Math.min(end, f.t0)); cuts.add(Math.min(end, f.t1)) }
  for (const c of cards) cuts.add(Math.min(end, c.t))
  for (const h of holds) cuts.add(h.t)
  const points = [...cuts].sort((a, b) => a - b)
  const pieces = []
  let out = 0
  // at a cut: the holds first (the picture stops before what comes), then the cards
  const pushStops = (t) => {
    for (const h of holds.filter((x) => !x.done && x.t <= t + 1e-6)) {
      h.done = true
      pieces.push({ type: 'hold', at: h.t, start: out, duration: h.seconds })
      out += h.seconds
    }
    for (const c of cards.filter((x) => !x.done && x.t <= t + 1e-6)) {
      c.done = true
      pieces.push({ type: 'card', card: c, start: out, duration: c.seconds })
      out += c.seconds
    }
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    pushStops(a)
    if (b - a < 0.02) continue
    const f = fast.find((x) => a >= x.t0 - 1e-6 && b <= x.t1 + 1e-6)
    const speed = f ? f.speed : 1
    const duration = (b - a) / speed
    pieces.push({ type: 'clip', a, b, speed, fast: f?.index ?? null, label: f?.label ?? '', start: out, duration })
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
  return { pieces, map, cardStart, duration: out }
}

// --- the narration's room ---------------------------------------------------------------------------

// Where each line starts in the edit, and the room the edit makes so that no line runs into the next:
// one shortfall at a time, then the timeline again, until every line fits.
export function fit(markers, lines) {
  const room = roomOf()
  const startOf = (tl, line) => (line.anchor.kind === 'card' ? tl.cardStart(line.anchor.index) : tl.map(line.anchor.t))
  for (let guard = 0; guard < lines.length * 6 + 20; guard++) {
    const tl = timeline(markers, room)
    const short = lines.findIndex((line, i) => {
      const next = lines[i + 1]
      const room = (next ? startOf(tl, next) : tl.duration) - startOf(tl, line)
      return LEAD + line.seconds + TAIL + line.after - room > 0.02
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
    // the raw stretch between the two cues: its fast waits play slower (never slower than real time) ...
    const ta = line.anchor.t
    const tb = next ? next.anchor.t : markers.duration
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
    // ... and the rest: the picture holds still just before the next cue
    if (left > 0.02) {
      const at = Math.max(ta, tb - 0.04)
      room.holds.set(at, (room.holds.get(at) ?? 0) + left)
    }
  }
  throw new Error('the narration does not fit (no stable edit found)')
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

export async function renderCards(cards, dir, banner) {
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
  const label = (from, to, title) => lines.push(`Dialogue: 0,${stamp(from)},${stamp(to)},Chapter,,0,0,0,,{\\pos(28,${y})}${escape(title.toUpperCase())}`)
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
    if (p.speed > 1.4) lines.push(`Dialogue: 1,${stamp(p.start)},${stamp(p.start + p.duration)},Speed,,0,0,0,,{\\pos(${WIDTH - 28},${y})}▶▶ ${Math.round(p.speed)}× faster`)
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

// --- the songs ----------------------------------------------------------------------------------------

// The songs the video plays (studio listen(): a preview started at raw time t) under the voice: each fades
// in where its preview starts and out after its seconds, and ducks while the narrator speaks.
function mixSongs(sounds, tl, dir, work) {
  if (!sounds.length) {
    fs.copyFileSync(path.join(work, 'voice.wav'), path.join(work, 'audio.wav'))
    return false
  }
  const inputs = ['-i', 'voice.wav']
  const chains = []
  sounds.forEach((s, i) => {
    inputs.push('-i', path.join(dir, s.file))
    const at = Math.round(tl.map(s.t) * 1000)
    chains.push(`[${i + 1}:a]atrim=start=${s.from}:duration=${s.seconds},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,` +
      `afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, s.seconds - 2)}:d=2,volume=0.7,adelay=${at}|${at}[s${i}]`)
  })
  const songs = sounds.map((_, i) => `[s${i}]`).join('')
  const graph = [
    ...chains,
    `${songs}amix=inputs=${sounds.length}:normalize=0,apad,atrim=duration=${tl.duration.toFixed(3)},asplit[music][bed]`,
    '[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[v1][v2]',
    '[music][v1]sidechaincompress=threshold=0.015:ratio=10:attack=30:release=600:makeup=1[ducked]',
    '[ducked][v2]amix=inputs=2:normalize=0:duration=shortest[out]',
  ].join(';')
  ffmpeg([...inputs, '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_s16le', 'audio.wav', '-map', '[bed]', '-c:a', 'pcm_s16le', 'music.wav'], work)
  return true
}

// --- the package ----------------------------------------------------------------------------------------

const PACKAGE_README = (name, v) => `# ${name}

Everything this video is made of, for editing by hand. Rendered by \`tools/tutorials/record.mjs\` of the
Plenio repository (\`--render-only\` cuts it again from the recording; see tools/tutorials/README.md).

| File | What it is |
|---|---|
| \`${name}.mp4\` | the finished video: picture, voice-over and the songs (AAC 192k) |
| \`${name} (no voice).mp4\` | the same picture without any sound - for your own voice-over |
| \`${name}.srt\` | the narration, timed to both videos, **written for a TTS** (spellings like "Yu-eh two", \`[pause:0.4s]\` tags) |
| \`${name} (written).srt\` | the same lines with the normal spellings and no tags - as subtitles |
| \`audio/voice.wav\` | the voice-over alone, 48 kHz mono, levelled to -16 LUFS |
| \`audio/music.wav\` | the songs alone, as they play in the video, not ducked (only when the video plays songs) |
| \`audio/mix.wav\` | the soundtrack of the finished video (voice + songs, ducked under the voice) |
| \`audio/lines/NNN.flac\` | every narration line as its own file (the TTS output, unprocessed) |
| \`audio/lines.tsv\` | per line: number, start, end and length in seconds, the written and the spoken text |
| \`voice/\` | the narrator: the reference recording the voice is cloned from, its transcript, and how it was made |
| \`youtube-chapters.txt\` | the chapters with their times in this video, to paste into a YouTube description |

## Timing

The picture was cut for the voice: each line starts ${v.lead} s after its cue (a caption or a card of the
script), and the next cue waits until ${v.tail} s after the line has ended. Where a line needed more time than
the recording gave it, the edit made room - a card stays longer, a fast-forwarded wait plays slower, or the
picture holds still just before the next cue. So the SRT fits the picture as it is: a new voice that
speaks at about the same pace (about 180 words per minute while speaking) fits the same slots.

## A new voice-over with your own TTS

- **TTS Audio Suite** (ComfyUI): the *TTS SRT* node with the OmniVoice engine, the SRT above as its text,
  and the reference in \`voice/\` (through *Character Voices*, with the transcript as reference text) as the
  narrator. *timing_mode* \`smart_natural\` keeps the speech natural and shifts lines a little where needed;
  \`pad_with_silence\` places every line exactly at its start. The OmniVoice settings of this video:
  speed ${v.speed}, ${v.steps} steps, seed ${v.seed} (per line, unless the narration file sets another).
- **Any other tool**: \`${name} (written).srt\` has the plain text; \`audio/lines.tsv\` the start of every line.
  Put the new voice on \`${name} (no voice).mp4\` and, for the songs, \`audio/music.wav\` underneath
  (about -6 dB under the voice, or ducked).
`

function writePackage({ pkg, name, lines, work, voiceDir, hasMusic, silent, voiced }) {
  fs.rmSync(pkg, { recursive: true, force: true })
  fs.mkdirSync(path.join(pkg, 'audio', 'lines'), { recursive: true })
  fs.mkdirSync(path.join(pkg, 'voice'), { recursive: true })
  fs.renameSync(voiced, path.join(pkg, `${name}.mp4`))
  fs.renameSync(silent, path.join(pkg, `${name} (no voice).mp4`))
  fs.writeFileSync(path.join(pkg, `${name}.srt`), srt(lines))
  const written = lines.map((l) => ({ ...l, spoken: l.text.replace(/\s*\[pause:[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim() }))
  fs.writeFileSync(path.join(pkg, `${name} (written).srt`), srt(written))
  fs.copyFileSync(path.join(work, 'voice.wav'), path.join(pkg, 'audio', 'voice.wav'))
  if (hasMusic) fs.copyFileSync(path.join(work, 'music.wav'), path.join(pkg, 'audio', 'music.wav'))
  fs.copyFileSync(path.join(work, 'audio.wav'), path.join(pkg, 'audio', 'mix.wav'))
  const rows = ['line\tstart\tend\tseconds\twritten\tspoken']
  lines.forEach((l, i) => {
    const n = String(i + 1).padStart(3, '0')
    fs.copyFileSync(l.audio, path.join(pkg, 'audio', 'lines', `${n}.flac`))
    rows.push([n, l.start.toFixed(3), (l.start + l.seconds).toFixed(3), l.seconds.toFixed(3), written[i].spoken, l.spoken].join('\t'))
  })
  fs.writeFileSync(path.join(pkg, 'audio', 'lines.tsv'), rows.join('\n') + '\n')
  for (const f of fs.readdirSync(voiceDir)) fs.copyFileSync(path.join(voiceDir, f), path.join(pkg, 'voice', f))
  fs.writeFileSync(path.join(pkg, 'README.md'), PACKAGE_README(name, { lead: LEAD, tail: TAIL, ...VOICE }))
}

// --- the render ---------------------------------------------------------------------------------------

export async function renderTutorial({ dir: folder, name, banner, narration, lexicon, voiceDir, ttsUrl, log = console.log }) {
  const dir = path.resolve(folder)
  const markers = JSON.parse(fs.readFileSync(path.join(dir, 'markers.json'), 'utf8'))
  const work = path.join(dir, 'work')
  fs.rmSync(work, { recursive: true, force: true })
  fs.mkdirSync(work, { recursive: true })

  // the narration: anchored at its cues, spoken (cached by text), then the edit makes room for it
  const words = parseLexicon(lexicon)
  const lines = anchorNarration(parseNarration(narration), markers, path.basename(narration))
  for (const line of lines) line.spoken = speakable(line.text, words)
  await synthesize(lines, { url: ttsUrl, cache: path.join(path.dirname(dir), 'voice-cache'), voiceDir, log })
  const { tl, room } = fit(markers, lines)
  fs.writeFileSync(path.join(work, 'voice-lines.json'), JSON.stringify(lines.map(({ spoken, audio, seconds, start }) => ({ spoken, audio, seconds, start })), null, 1))

  const cards = tl.pieces.filter((p) => p.type === 'card').map((p) => p.card)
  await renderCards(cards, work, banner)
  const frame = [`pad=${WIDTH}:${HEIGHT}:0:0:color=0x0e1014`, `drawbox=x=0:y=${HEIGHT - BAND}:w=${WIDTH}:h=2:color=0x2a3140:t=fill`]
  const list = []
  for (const [i, p] of tl.pieces.entries()) {
    const file = `piece-${String(i).padStart(3, '0')}.mp4`
    const enc = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file]
    if (p.type === 'clip') {
      const vf = [`setpts=(PTS-STARTPTS)/${p.speed.toFixed(5)}`, `fps=${FPS}`, ...frame].join(',')
      ffmpeg(['-ss', p.a.toFixed(3), '-to', p.b.toFixed(3), '-i', path.join(dir, 'raw.mp4'), '-vf', vf, ...enc], work)
    } else if (p.type === 'hold') {
      const still = `hold-${i}.png`
      ffmpeg(['-ss', Math.max(0, p.at - 1 / FPS).toFixed(3), '-i', path.join(dir, 'raw.mp4'), '-frames:v', '1', still], work)
      ffmpeg(['-loop', '1', '-t', p.duration.toFixed(3), '-i', still, '-vf', [`fps=${FPS}`, 'format=yuv420p', ...frame].join(','), ...enc], work)
    } else {
      const d = p.duration
      const vf = [`fps=${FPS}`, 'format=yuv420p', 'fade=t=in:st=0:d=0.35', `fade=t=out:st=${(d - 0.35).toFixed(2)}:d=0.35`].join(',')
      ffmpeg(['-loop', '1', '-t', d.toFixed(3), '-i', p.card.png, '-vf', vf, ...enc], work)
    }
    list.push(`file '${file}'`)
  }
  fs.writeFileSync(path.join(work, 'list.txt'), list.join('\n') + '\n')
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'joined.mp4'], work)
  fs.writeFileSync(path.join(work, 'labels.ass'), labelsAss(markers, tl))
  ffmpeg(['-i', 'joined.mp4', '-vf', 'subtitles=labels.ass', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', 'labelled.mp4'], work)

  // everything goes into one folder per video: <out>/<name>/ (see PACKAGE_README)
  const pkg = path.join(path.dirname(dir), name)
  const voiced = path.join(work, 'voiced.mp4')
  const silent = path.join(work, 'silent.mp4')
  mixVoice(lines, tl.duration, path.join(work, 'voice.wav'), work)
  const hasMusic = mixSongs(markers.sounds ?? [], tl, dir, work)
  ffmpeg(['-i', 'labelled.mp4', '-i', 'audio.wav','-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', voiced], work)
  ffmpeg(['-i', 'labelled.mp4', '-an', '-c:v', 'copy', '-movflags', '+faststart', silent], work)
  writePackage({ pkg, name, lines, work, voiceDir, hasMusic, silent, voiced })
  fs.writeFileSync(path.join(pkg, 'youtube-chapters.txt'), chaptersOf(markers, tl))
  const held = [...room.holds.values()].reduce((a, b) => a + b, 0)
  log(`${pkg}: ${tl.duration.toFixed(1)} s, ${lines.length} lines (${lines.reduce((a, l) => a + l.seconds, 0).toFixed(0)} s of speech), ` +
    `${room.holds.size} holds (${held.toFixed(1)} s), ${room.fast.size} slower waits, ${room.cards.size} longer cards`)
  return { pkg, duration: tl.duration, lines, tl }
}
