// The promo video: about 75 seconds of shots from the tutorial recordings and a narrator - in the same
// kind of folder as the tutorials (<out>/<name>/). No music: the owner adds his own; `--music` puts a song
// Plenio rendered under the voice (MUSIC).
//
//   node tools/tutorials/promo.mjs [--out dist/tutorials] [--tts-url http://127.0.0.1:8191] [--music]
//
// It needs the recordings of the six tutorials in <out>/<script>/ (record.mjs). A shot is a stretch of a
// recording, found by a caption of its script (`at`) and an offset; each shot lasts as long as its line
// needs (and at least its `seconds`). The picture fills the frame (no band).

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderCards } from './lib/render.mjs'
import { VOICE, mixVoice, parseLexicon, speakable, synthesize } from './lib/voice.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PROJECT = path.resolve(HERE, '..', '..')
const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const out = path.resolve(option('out', path.join(PROJECT, 'dist', 'tutorials')))
const NAME = 'Plenio - Music production in ComfyUI (promo)'
const FPS = 30
const W = 1920, H = 1080
const LEAD = 0.25, TAIL = 0.45

// the music bed: a song from a recording (sound-N of its folder), from `from` seconds
const MUSIC = args.includes('--music') ? { video: 'yue2-daw', file: 'sound-1.flac', from: null } : null

const SHOTS = [
  { card: 'title', data: { kicker: 'Plenio Music Production System', title: 'Music production<br>inside ComfyUI', subtitle: 'Write · Plan · Edit · Render · Master', foot: 'Version 0.4 · free and open source · runs on your own GPU' }, seconds: 4,
    say: 'Meet Plenio: a complete music production system, right inside ComfyUI.' },
  { video: 'yue2-song', at: '1 · YuE2 · Song writes', offset: -3, seconds: 4,
    say: 'Six ready-made templates take you from a first idea to a finished, mastered song.' },
  { video: 'yue2-song', at: 'Describe the song in your own words', offset: 0.5, seconds: 4,
    say: 'Describe your song in plain words. A local language model writes the lyrics.' },
  { video: 'yue2-song', at: 'Lyrics: the words YuE2 will sing', offset: 0.3, seconds: 4,
    say: 'And every step can stop for your review. You check, you change, you approve.' },
  { video: 'yue2-song', at: 'Under it, the lyrics lane', offset: 0.8, seconds: 4,
    say: 'YuE2 plans the melody as a real score, with the lyrics right over the notes.' },
  { video: 'yue2-song', at: 'Arrange the song', offset: 0.5, seconds: 4,
    say: 'Edit it like in your DAW: arrange sections, copy, paste, and play from the cursor.' },
  { video: 'yue2-cover', at: 'The original recording plays right under the notes', offset: 1.2, seconds: 4,
    say: 'Turn a recording into a brand-new cover, and compare it with the original, bar by bar.' },
  { video: 'yue2-daw', at: 'Nothing changes yet:', offset: 0.3, seconds: 4,
    say: 'Bring your own sketch from any DAW, and let YuE2 sing it.' },
  { video: 'minimax-song', at: 'Caption: MiniMax reads it in three parts', offset: 0.5, seconds: 4,
    say: 'Or render with MiniMax Music 3.' },
  { video: 'enhance-master', at: 'The match: gentle bands', offset: 0.3, seconds: 4,
    say: 'Master any track: a gentle tone match, measured loudness, and a release export.' },
  { video: 'system-check', at: 'The templates: for each one', offset: 0.3, seconds: 3.5,
    say: 'A system check tells you what is ready, before you start.' },
  { video: 'yue2-song', at: 'The approved song is finished', offset: 0.5, seconds: 4,
    say: 'Everything runs locally, on your own graphics card. [pause:0.3s] Your songs, your way.' },
  { card: 'end', data: { title: 'Plenio Music Production System', lines: ['Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'] }, seconds: 5,
    // "Plenio" alone at the start of a sentence came out as "Plinio"; in the middle of one it keeps its "e"
    say: 'Install Plenio from the ComfyUI Manager, and make your first song today.', seed: 2 },
]

function ffmpeg(cmd, cwd) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...cmd], { cwd, encoding: 'utf8', maxBuffer: 1 << 26 })
  if (r.status !== 0) throw new Error(`ffmpeg ${cmd.join(' ')}\n${r.stderr}`)
}

// the raw time of a caption of a recording (the first that starts with `cue`)
function rawTime(video, cue) {
  const markers = JSON.parse(fs.readFileSync(path.join(out, video, 'markers.json'), 'utf8'))
  const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[’‘]/g, "'").trim()
  const caption = markers.captions.find((c) => norm(c.text).startsWith(norm(cue)))
  if (!caption) throw new Error(`no caption "${cue}" in ${video}`)
  return caption.t0
}

// the loudest ten seconds in the first two thirds of a song: where the bed starts (minus a little)
function liveliest(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'asetnsamples=48000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 })
  const levels = [...r.stderr.matchAll(/RMS_level=(-?[\d.inf]+)/g)].map((m) => (m[1].includes('inf') ? -120 : parseFloat(m[1])))
  let best = 0, bestSum = -Infinity
  for (let i = 0; i + 10 < levels.length * 0.66; i++) {
    const sum = levels.slice(i, i + 10).reduce((a, b) => a + b, 0)
    if (sum > bestSum) { bestSum = sum; best = i }
  }
  return Math.max(0, best - 4)
}

const dir = path.join(out, '.promo')
const work = path.join(dir, 'work')
fs.rmSync(dir, { recursive: true, force: true })
fs.mkdirSync(work, { recursive: true })

// the speech first: it sets every shot's length
const lexicon = parseLexicon(path.join(HERE, 'narration', 'lexicon.txt'))
const lines = SHOTS.map((shot) => ({ text: shot.say, spoken: speakable(shot.say, lexicon), seed: shot.seed ?? null }))
await synthesize(lines, { url: option('tts-url', null), cache: path.join(out, 'voice-cache'), voiceDir: path.join(HERE, 'voice') })
let t = 0
const pieces = SHOTS.map((shot, i) => {
  const seconds = Math.max(shot.seconds, LEAD + lines[i].seconds + TAIL)
  lines[i].start = t + LEAD
  const piece = { ...shot, start: t, seconds }
  t += seconds
  return piece
})
const total = t

const cards = pieces.filter((p) => p.card).map((p) => ({ kind: p.card, data: p.data }))
await renderCards(cards, work, path.join(PROJECT, 'assets', 'branding', 'banner.png'))
const list = []
let card = 0
for (const [i, p] of pieces.entries()) {
  const file = `shot-${String(i).padStart(2, '0')}.mp4`
  const enc = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file]
  const fade = `fade=t=in:st=0:d=0.3,fade=t=out:st=${(p.seconds - 0.3).toFixed(2)}:d=0.3`
  if (p.card) {
    ffmpeg(['-loop', '1', '-t', p.seconds.toFixed(3), '-i', cards[card++].png, '-vf', `fps=${FPS},format=yuv420p,${fade}`, ...enc], work)
  } else {
    const from = rawTime(p.video, p.at) + p.offset
    // the recording is 1920 x 1000: scaled to fill the frame, the edges cropped evenly
    const vf = `scale=${Math.round(1920 * H / 1000)}:${H}:flags=lanczos,crop=${W}:${H},fps=${FPS},${fade}`
    ffmpeg(['-ss', Math.max(0, from).toFixed(3), '-t', p.seconds.toFixed(3), '-i', path.join(out, p.video, 'raw.mp4'), '-vf', vf, ...enc], work)
  }
  list.push(`file '${file}'`)
}
fs.writeFileSync(path.join(work, 'list.txt'), list.join('\n') + '\n')
ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'picture.mp4'], work)

// the voice, and the song under it (faded in and out, ducked while the narrator speaks)
mixVoice(lines, total, path.join(work, 'voice.wav'), work)
const song = MUSIC && path.join(out, MUSIC.video, MUSIC.file)
const from = MUSIC ? (MUSIC.from ?? liveliest(song)) : null
if (!MUSIC) ffmpeg(['-i', 'voice.wav', '-af', 'aformat=sample_rates=48000:channel_layouts=stereo', '-c:a', 'pcm_s16le', 'mix.wav'], work)
else ffmpeg(['-ss', String(from), '-t', total.toFixed(3), '-i', song, '-af', `aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=1.5,afade=t=out:st=${(total - 3).toFixed(2)}:d=3,volume=0.8`, 'music.wav'], work)
if (MUSIC) ffmpeg(['-i', 'voice.wav', '-i', 'music.wav', '-filter_complex',
  '[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[v1][v2];[1:a][v1]sidechaincompress=threshold=0.02:ratio=5:attack=40:release=500[bed];[bed][v2]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95[out]',
  '-map', '[out]', '-c:a', 'pcm_s16le', 'mix.wav'], work)

const pkg = path.join(out, NAME)
fs.rmSync(pkg, { recursive: true, force: true })
fs.mkdirSync(path.join(pkg, 'audio', 'lines'), { recursive: true })
fs.mkdirSync(path.join(pkg, 'voice'), { recursive: true })
ffmpeg(['-i', path.join(work, 'picture.mp4'), '-i', path.join(work, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(pkg, `${NAME}.mp4`)], work)
ffmpeg(['-i', path.join(work, 'picture.mp4'), '-c:v', 'copy', '-movflags', '+faststart', path.join(pkg, `${NAME} (no sound).mp4`)], work)
ffmpeg(['-ss', '1.5', '-i', path.join(work, 'picture.mp4'), '-frames:v', '1', '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', path.join(pkg, 'thumbnail.jpg')], work)
const stamp = (s) => {
  const ms = Math.round(s * 1000)
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`
}
const srt = (key) => lines.map((l, i) => `${i + 1}\n${stamp(l.start)} --> ${stamp(l.start + l.seconds)}\n${key(l)}\n`).join('\n')
fs.writeFileSync(path.join(pkg, `${NAME}.srt`), srt((l) => l.spoken))
fs.writeFileSync(path.join(pkg, `${NAME} (written).srt`), srt((l) => l.text.replace(/\s*\[pause:[^\]]*\]\s*/g, ' ').trim()))
for (const f of MUSIC ? ['voice.wav', 'music.wav', 'mix.wav'] : ['voice.wav']) fs.copyFileSync(path.join(work, f), path.join(pkg, 'audio', f))
lines.forEach((l, i) => fs.copyFileSync(l.audio, path.join(pkg, 'audio', 'lines', `${String(i + 1).padStart(3, '0')}.flac`)))
for (const f of fs.readdirSync(path.join(HERE, 'voice'))) fs.copyFileSync(path.join(HERE, 'voice', f), path.join(pkg, 'voice', f))
fs.writeFileSync(path.join(pkg, 'README.md'), `# ${NAME}

A promo of about ${Math.round(total)} seconds, cut from the tutorial recordings (tools/tutorials/promo.mjs).

| File | What it is |
|---|---|
| \`${NAME}.mp4\` | the promo: picture and narrator${MUSIC ? ' and the music bed' : ' (no music - add your own)'} |
| \`${NAME} (no sound).mp4\` | the picture alone |
| \`${NAME}.srt\` / \`(written).srt\` | the narration, for a TTS (spoken spellings, pause tags) / as subtitles |
| \`audio/voice.wav\` | the narrator alone (-16 LUFS) |
${MUSIC ? `| \`audio/music.wav\` | the music bed alone: "${MUSIC.file}" of the ${MUSIC.video} recording - a song rendered with Plenio - from ${from} s, faded |
| \`audio/mix.wav\` | the soundtrack (the bed ducked under the voice) |
` : ''}| \`audio/lines/NNN.flac\` | every line as its own file |
| \`voice/\` | the narrator's reference voice (see voice/VOICE.md) |

Every shot lasts as long as its line needs; the shots, their source recordings and the lines are in
promo.mjs. The OmniVoice settings: speed ${VOICE.speed}, ${VOICE.steps} steps, seed ${VOICE.seed}.
`)
console.log(`${pkg}: ${total.toFixed(1)} s, ${lines.length} lines, ${MUSIC ? `music from ${from} s of ${MUSIC.video}/${MUSIC.file}` : 'no music'}`)
