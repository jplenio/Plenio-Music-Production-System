// The voice-over of a tutorial: the narration file (what is said at which caption or card), the lexicon
// (spellings a TTS pronounces right) and the speech itself, made with OmniVoice through TTS Audio Suite on
// a ComfyUI server (--tts-url) and cached by text, so a re-cut synthesises only changed lines.
//
// Narration file (tools/tutorials/narration/<script>.txt):
//
//   # a comment
//   @ <cue>                    the caption whose text starts with <cue> (spaces and case do not matter)
//   @ card <title start>       a card (title, chapter or end card), by its title
//   @ <cue> | +1.2 | seed 3    options: quiet seconds after the line (time to look), another TTS seed;
//                              `optional`: a scene the script may skip (the line goes with it)
//   The spoken text, on one or more lines. [pause:0.6s] makes a pause inside it.
//   (a blank line ends the block)
//
// Cues are matched in order: each one finds the next caption (or card) after the previous cue's. A cue
// that matches nothing is an error, so a changed caption cannot silently lose its line.

import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const VOICE = {
  // the narrator: a voice designed once with OmniVoice ("male, middle-aged, low pitch, american accent",
  // seed 44) and cloned for every line, so all videos have the same voice
  reference: 'narrator.wav',
  speed: 0.9,
  steps: 32,
  seed: 1,
}

const norm = (s) => s.toLowerCase().replace(/[\s ]+/g, ' ').replace(/[’‘]/g, "'").trim()

export function parseNarration(file) {
  const lines = []
  let block = null
  const close = () => {
    if (block) {
      block.text = block.text.join(' ').replace(/\s+/g, ' ').trim()
      if (!block.text) throw new Error(`${path.basename(file)}: cue "${block.cue}" has no text`)
      lines.push(block)
    }
    block = null
  }
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('#')) continue
    if (!line) { close(); continue }
    if (line.startsWith('@')) {
      close()
      const [head, ...opts] = line.slice(1).split('|').map((x) => x.trim())
      block = { cue: head, card: false, text: [], after: 0, seed: null, optional: false }
      if (/^card\s/i.test(head)) { block.card = true; block.cue = head.replace(/^card\s+/i, '') }
      for (const o of opts) {
        if (/^\+\d/.test(o)) block.after = parseFloat(o.slice(1))
        else if (/^seed\s+\d+$/.test(o)) block.seed = parseInt(o.split(/\s+/)[1], 10)
        else if (o === 'optional') block.optional = true
        else throw new Error(`${path.basename(file)}: unknown option "${o}" at "${head}"`)
      }
      continue
    }
    if (!block) throw new Error(`${path.basename(file)}: text without a cue: "${line}"`)
    block.text.push(line)
  }
  close()
  return lines
}

// "Plenio => Pleh-nee-oh" per line; whole words, case-sensitive, applied in order
export function parseLexicon(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [from, to] = l.split('=>').map((x) => x.trim())
      const esc = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return { re: new RegExp(`(?<![\\w-])${esc}(?![\\w-])`, 'g'), to }
    })
}

export const speakable = (text, lexicon) => lexicon.reduce((t, { re, to }) => t.replace(re, to), text)

// cues -> anchors: { kind: 'caption', t } (raw time) or { kind: 'card', index } (into markers.cards)
export function anchorNarration(lines, markers, file = 'narration') {
  const captions = markers.captions
  const cards = markers.cards.map((c, index) => ({ ...c, index })).sort((a, b) => a.t - b.t)
  const title = (c) => norm(String(c.data?.title ?? '').replace(/<[^>]+>/g, ''))
  let t = -Infinity
  const anchored = lines.map((line) => {
    const cue = norm(line.cue)
    if (line.card) {
      const card = cards.find((c) => c.t >= t - 1e-6 && title(c).startsWith(cue))
      if (!card) throw new Error(`${file}: no card "${line.cue}" after ${t.toFixed(1)} s`)
      t = card.t
      return { ...line, anchor: { kind: 'card', index: card.index, t: card.t } }
    }
    const caption = captions.find((c) => c.t0 >= t - 1e-6 && norm(c.text).startsWith(cue))
    if (!caption && line.optional) return null
    if (!caption) throw new Error(`${file}: no caption "${line.cue}" after ${t.toFixed(1)} s`)
    t = caption.t0 + 1e-3
    return { ...line, anchor: { kind: 'caption', t: caption.t0 } }
  })
  return anchored.filter(Boolean)
}

// --- speech -----------------------------------------------------------------------------------------

function engine(speed, steps) {
  return {
    class_type: 'OmniVoiceEngineNode',
    inputs: {
      model_variant: 'OmniVoice', device: 'auto', language: 'English', num_step: steps, guidance_scale: 2.0,
      t_shift: 0.1, speed, duration: 0.0, dtype: 'auto', instruct: '', layer_penalty_factor: 5.0,
      position_temperature: 5.0, class_temperature: 0.0, denoise: true, preprocess_prompt: true,
      postprocess_output: true, audio_chunk_duration: 15.0, audio_chunk_threshold: 30.0, mode: 'Text to Speech',
    },
  }
}

async function upload(url, file) {
  const form = new FormData()
  form.append('image', new Blob([fs.readFileSync(file)]), path.basename(file))
  form.append('type', 'input')
  form.append('overwrite', 'true')
  const r = await fetch(`${url}/upload/image`, { method: 'POST', body: form })
  if (!r.ok) throw new Error(`upload of ${file} to ${url} failed: ${r.status}`)
  return (await r.json()).name
}

async function generate(url, { text, reference, referenceText, speed, steps, seed }) {
  const prompt = {
    1: engine(speed, steps),
    2: { class_type: 'LoadAudio', inputs: { audio: reference } },
    3: { class_type: 'CharacterVoicesNode', inputs: { voice_name: 'none', reference_text: referenceText, trim_start: 0, trim_end: 0, customized: true, opt_audio_input: ['2', 0] } },
    4: {
      class_type: 'UnifiedTTSTextNode',
      inputs: {
        TTS_engine: ['1', 0], text, narrator_voice: 'none', seed, opt_narrator: ['3', 0], enable_chunking: true,
        max_chars_per_chunk: 400, chunk_combination_method: 'auto', silence_between_chunks_ms: 100, enable_audio_cache: false, batch_size: 0,
      },
    },
    5: { class_type: 'SaveAudio', inputs: { audio: ['4', 0], filename_prefix: 'tutorial-voice/line' } },
  }
  const r = await fetch(`${url}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
  if (!r.ok) throw new Error(`TTS prompt failed: ${r.status} ${await r.text()}`)
  const { prompt_id: id } = await r.json()
  for (let i = 0; i < 1800; i++) {
    const h = await (await fetch(`${url}/history/${id}`)).json()
    const run = h[id]
    if (run?.status?.status_str === 'error') throw new Error(`TTS failed for "${text}": ${JSON.stringify(run.status.messages).slice(-1500)}`)
    if (run?.status?.completed) {
      const item = run.outputs['5'].audio[0]
      const q = new URLSearchParams({ filename: item.filename, subfolder: item.subfolder, type: item.type })
      return Buffer.from(await (await fetch(`${url}/view?${q}`)).arrayBuffer())
    }
    await new Promise((res) => setTimeout(res, 500))
  }
  throw new Error(`TTS timed out for "${text}"`)
}

export const duration = (file) => {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' })
  return parseFloat(r.stdout)
}

// every line's speech file and length; missing ones are made on the TTS server
export async function synthesize(lines, { url, cache, voiceDir, log = console.log }) {
  fs.mkdirSync(cache, { recursive: true })
  const reference = path.join(voiceDir, VOICE.reference)
  const referenceText = fs.readFileSync(reference.replace(/\.wav$/, '.txt'), 'utf8').trim()
  const voiceId = crypto.createHash('sha256').update(fs.readFileSync(reference)).digest('hex').slice(0, 12)
  let uploaded = null
  for (const line of lines) {
    const seed = line.seed ?? VOICE.seed
    const key = crypto.createHash('sha256').update(JSON.stringify([line.spoken, voiceId, VOICE.speed, VOICE.steps, seed])).digest('hex').slice(0, 20)
    line.audio = path.join(cache, `${key}.flac`)
    if (!fs.existsSync(line.audio)) {
      if (!url) throw new Error(`no speech for "${line.spoken}" in the cache - start the TTS server and pass --tts-url`)
      uploaded ??= await upload(url, reference)
      fs.writeFileSync(line.audio, await generate(url, { text: line.spoken, reference: uploaded, referenceText, speed: VOICE.speed, steps: VOICE.steps, seed }))
      log(`  voice: ${line.spoken.slice(0, 70)}`)
    }
    line.seconds = duration(line.audio)
  }
  return lines
}

// all lines mixed into one mono track (48 kHz) at their start times, levelled for speech
export function mixVoice(lines, total, file, work) {
  const RATE = 48000
  const mix = new Float32Array(Math.ceil((total + 1) * RATE))
  for (const line of lines) {
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', line.audio, '-f', 'f32le', '-ac', '1', '-ar', String(RATE), '-'], { maxBuffer: 1 << 28 })
    if (r.status !== 0) throw new Error(`could not decode ${line.audio}`)
    const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)
    const at = Math.round(line.start * RATE)
    for (let i = 0; i < pcm.length && at + i < mix.length; i++) mix[at + i] += pcm[i]
  }
  const raw = path.join(work, 'voice.f32')
  fs.writeFileSync(raw, Buffer.from(mix.buffer))
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', raw,
    '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', String(RATE), '-c:a', 'pcm_s16le', file], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`voice mix failed: ${r.stderr}`)
  fs.rmSync(raw)
}
