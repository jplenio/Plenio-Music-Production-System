// Answers the plug-in's calls in a plain browser, so the UI can be developed, tested and photographed without a DAW:
// a demo song with three takes, stems, a score, measured bars and sung lines. `?state=` picks what it shows first:
// song (default), empty, busy, offline, new.

import { emit } from '../bridge'
import type { AppState, AraState, Chord, Connection, LibrarySong, Line, Measure, Note, ScoreView, Settings, SongView, TakeView } from '../types'
import { BRIEFS, COVER_TEMPLATE, SONG_TEMPLATE, VALUES } from './data'

const params = new URLSearchParams(location.search)
const initial = params.get('state') ?? 'song'

function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const PPQ = 480
const BAR = PPQ * 4
const MEASURES = 32
const BPM = 84

function demoScore(): ScoreView {
  const r = rng(7)
  const scale = [57, 60, 62, 64, 67, 69, 72, 74] // A minor pentatonic around A3 ... D5
  const melody: Note[] = []
  for (let m = 4; m < 28; m++) {
    let t = m * BAR
    const end = (m + 1) * BAR
    let step = Math.floor(r() * scale.length)
    while (t < end) {
      const len = r() < 0.3 ? PPQ : PPQ / 2
      if (r() < 0.82) {
        step = Math.max(0, Math.min(scale.length - 1, step + Math.floor(r() * 5) - 2))
        melody.push([t, Math.min(len, end - t) - 20, scale[step], 90])
      }
      t += len
    }
  }
  const instrument: Note[] = []
  for (let m = 0; m < MEASURES; m++) {
    for (let b = 0; b < 4; b += 2) instrument.push([m * BAR + b * PPQ, PPQ * 2 - 30, [45, 41, 48, 43][m % 4] + (b === 2 ? 7 : 0), 80])
  }
  const names = ['Am', 'F', 'C', 'G']
  const chords: Chord[] = []
  for (let m = 0; m < MEASURES; m++) chords.push([m * BAR, names[m % 4]])
  return {
    ppq: PPQ,
    bpm: BPM,
    key: 'A minor',
    endTick: MEASURES * BAR,
    meters: [[0, 4, 4]],
    sections: [
      [0, 'Intro'],
      [4 * BAR, 'Verse 1'],
      [12 * BAR, 'Chorus'],
      [20 * BAR, 'Verse 2'],
      [28 * BAR, 'Outro']
    ],
    melody,
    instrument,
    chords
  }
}

function demoMeasures(leadIn: number, scoreAt: number): Measure[] {
  const out: Measure[] = []
  let at = scoreAt
  for (let k = 0; k < MEASURES; k++) {
    const tempo = BPM + 1.6 * Math.sin(k / 5) + 0.6 * Math.sin(k * 1.7)
    const length = (4 * 60) / tempo
    out.push({ tick: k * BAR, endTick: (k + 1) * BAR, start: at, end: at + length, number: leadIn + k + 1 })
    at += length
  }
  return out
}

function demoLines(measures: Measure[]): Line[] {
  const words = [
    'Rain on the asphalt, neon in the glass',
    'Every red light tells me to let it pass',
    'Radio whispers what I cannot say',
    'We keep on driving till the night turns grey',
    'Hold on, hold on, the city is ours',
    'Racing the shadows under silver stars',
    'Hold on, hold on, we never look back',
    'Two hearts on fire on an empty track'
  ]
  return words.map((text, i) => {
    const m = measures[4 + i * 2 + (i >= 4 ? 0 : 0)]
    return { start: m.start + 0.2, end: m.start + (m.end - m.start) * 1.85, text }
  })
}

function demoPeaks(seed: number, count: number): number[] {
  const r = rng(seed)
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const x = i / count
    const env = x < 0.04 ? x / 0.04 : x > 0.96 ? (1 - x) / 0.04 : 1
    const section = 0.55 + 0.35 * Math.sin(x * Math.PI * 5.2 + seed) ** 2
    out.push(Math.min(1, env * section * (0.7 + 0.3 * r())))
  }
  return out
}

const leadInBars = 1
const scoreAt = (4 * 60) / BPM
const measures = demoMeasures(leadInBars, scoreAt)
const score = demoScore()
const LYRICS = `[verse]
Rain on the asphalt, neon in the glass
Every red light tells me to let it pass
Radio whispers what I cannot say
We keep on driving till the night turns grey

[chorus]
Hold on, hold on, the city is ours
Racing the shadows under silver stars
Hold on, hold on, we never look back
Two hearts on fire on an empty track`

// a demo cover art: a synthwave sun over a grid, in the hue given (the plug-in serves Plenio's own JPEG)
function coverArt(hue: number): string {
  const ground = `hsl(${hue - 20},60%,8%)`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,12%)"/><stop offset="1" stop-color="hsl(${hue + 40},80%,40%)"/></linearGradient>
<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue + 80},100%,70%)"/><stop offset="1" stop-color="hsl(${hue + 20},100%,62%)"/></linearGradient></defs>
<rect width="100" height="62" fill="url(#s)"/><circle cx="50" cy="58" r="24" fill="url(#m)"/>
<g fill="${ground}"><rect y="45" width="100" height="1.4"/><rect y="50" width="100" height="1.8"/><rect y="54.5" width="100" height="2.2"/><rect y="59" width="100" height="2.6"/></g>
<rect y="62" width="100" height="38" fill="${ground}"/>
<g stroke="hsl(${hue + 40},90%,62%)" stroke-width="0.6" opacity="0.85" fill="none"><path d="M50 62L-10 100M50 62L14 100M50 62L34 100M50 62L50 100M50 62L66 100M50 62L86 100M50 62L110 100"/><path d="M0 66H100M0 71H100M0 78H100M0 88H100"/></g>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** The cover the song shows: the active take's, else the newest take's that has one (as the plug-in does). */
function songCover(s: SongView): string | undefined {
  return s.takes[s.activeTake]?.cover ?? [...s.takes].reverse().find((t) => t.cover)?.cover
}

function take(index: number, number: number, stars: number, seconds: number, stems: boolean, cover?: string): TakeView {
  return {
    cover,
    index,
    number,
    title: 'Night Drive',
    label: `Take ${number} · ${stars} stars`,
    stars,
    seconds,
    created: 1762600000 + index * 200,
    what: index === 0 ? 'write, compose and render the song' : 'render a new take of the same song',
    stems: stems ? ['vocals', 'drums', 'bass', 'other', 'rest'] : [],
    hasAudio: true,
    measured: true,
    audioAt: scoreAt - 0.48 + (index - 1) * 0.07
  }
}

let song: SongView | null = {
  id: 's-0019a2b3c4d5',
  title: 'Night Drive',
  kind: 'song',
  template: 'yue2-song',
  fields: {
    template: 'electronic/synth-pop-vocal',
    description: 'Retro synthwave about a night drive through a rainy city: pulsing analog bass, gated drums, shimmering pads, a warm female vocal.',
    genre: 'synthwave',
    mood: 'nostalgic, hopeful',
    tempo: 'Midtempo (100-120 BPM)',
    length: 'short (about 1:30)',
    vocals: 'sung',
    language: 'English',
    voice: 'warm female vocal',
    theme: 'night & city lights',
    lyrics_from: 'written from the idea below',
    lyrics: 'Two people driving through the city at night, not ready to go home.',
    key: '',
    meter: '4/4',
    'finish.cover_art': false,
    'finish.hq_mastering': false
  },
  documents: {
    title: { text: 'Night Drive', manual: false },
    style: { text: 'synthwave, warm female vocals, driving bass, retro pads', manual: false },
    lyrics: { text: LYRICS, manual: false },
    score: { text: 'X:1\nM:4/4\nL:1/8\nQ:1/4=84\n…', manual: false }
  },
  takesPerRun: 2,
  stems: true,
  activeTake: 1,
  reaper: { available: true, placed: false },
  changes: [],
  plan: { what: 'newTake', label: 'render a new take of the same song' },
  edited: { melody: false, instrument: false, chords: false },
  loading: false,
  loadProblem: '',
  folder: 'C:\\Users\\you\\Documents\\Plenio\\Songs\\Night Drive [s-0019a2b3c4d5]',
  cover: coverArt(296),
  takes: [take(0, 1, 4, 91.4, false, coverArt(262)), take(1, 2, 4.5, 92.1, true, coverArt(296)), take(2, 3, 3.5, 90.8, true)],
  jobs: [],
  layout: { scoreAt, audioAt: scoreAt - 0.48, leadInBars, measured: true, seconds: 92.1, tempo: [82.6, 85.9] },
  lines: demoLines(measures),
  score,
  measures,
  leadIn: [{ start: 0, end: scoreAt, number: 1 }]
}

let connection: Connection = {
  state: 'connected',
  host: '127.0.0.1',
  port: 8188,
  plenio: '2.0.0',
  api: '1.4',
  comfyui: '0.44.2',
  features: ['stems', 'bars', 'models'],
  message: 'Plenio 2.0.0 on ComfyUI 0.44.2'
}

const settings: Settings = {
  library: 'C:\\Users\\you\\Documents\\Plenio\\Songs',
  port: 0,
  startComfyUI: true,
  licenceAccepted: true,
  takesPerRun: 2,
  stems: true,
  flatKeys: false
}

if (initial === 'empty' || initial === 'new') song = null
if (initial === 'offline') {
  connection = { ...connection, state: 'offline', features: [], message: 'ComfyUI with Plenio is not running. Playing and editing work; to make songs, start ComfyUI.' }
}
if (initial === 'busy' && song) {
  song.jobs = [
    { number: 4, index: 0, status: 'running', stage: 'singing and playing', progress: 0.46, what: 'render a new take of the same song' },
    { number: 5, index: 1, status: 'queued', stage: '', progress: 0, what: 'render a new take of the same song', queuePosition: 1 }
  ]
  song.changes = ['lyrics', 'chords']
  song.plan = { what: 'recompose', label: 'compose new notes for the words, then render' }
}

const LIBRARY: LibrarySong[] = [
  { id: 's-0019a2b3c4d5', title: 'Night Drive', kind: 'song', takes: 3, modified: 1762600900, stars: 4.5, cover: coverArt(296) },
  { id: 's-0019a2b3c4d6', title: 'The Unspoken Things', kind: 'song', takes: 1, modified: 1762500000, stars: 4, cover: coverArt(196) },
  { id: 's-0019a2b3c4d7', title: 'Late Bus (jazz cover)', kind: 'cover', takes: 2, modified: 1762400000, stars: 3.5 }
]

// Plenio ARA's window (`?state=ara`): two clips of the demo song
const ara: AraState = {
  bound: true,
  clips: [
    {
      id: '1',
      name: 'C:\\Music\\Night Drive - Take 2.wav',
      song: 'Night Drive',
      stem: '',
      own: 2,
      playing: 2,
      takes: [
        { number: 1, label: 'Take 1 · 4 stars', seconds: 91.4, stars: 4 },
        { number: 2, label: 'Take 2 · 4.5 stars', seconds: 92.1, stars: 4.5 },
        { number: 3, label: 'Take 3 · 3.5 stars', seconds: 90.8, stars: 3.5 }
      ]
    },
    {
      id: '2',
      name: 'C:\\Music\\Night Drive - Take 2 - vocals.wav',
      song: 'Night Drive',
      stem: 'vocals',
      own: 2,
      playing: 3,
      takes: [
        { number: 1, label: 'Take 1 · 4 stars', seconds: 91.4, stars: 4 },
        { number: 2, label: 'Take 2 · 4.5 stars', seconds: 92.1, stars: 4.5 },
        { number: 3, label: 'Take 3 · 3.5 stars', seconds: 90.8, stars: 3.5 }
      ]
    }
  ]
}

function state(): AppState {
  if (initial === 'ara') return { hello: { kind: 'ara', version: '2.0.0', host: 'Browser' }, connection: null, settings: null, song: null, position: 0, ara }
  return { hello: { kind: 'instrument', version: '2.0.0', host: new URLSearchParams(location.search).get('host') ?? 'Browser' }, connection, settings, song, position: 24.3 }
}

let jobTimer: number | undefined

function simulateRun(count: number, what: string): void {
  if (!song) return
  const base = Math.max(0, ...song.takes.map((t) => t.number)) + 1
  song.jobs = Array.from({ length: count }, (_, i) => ({
    number: base + i,
    index: i,
    status: i === 0 ? 'running' : 'queued',
    stage: i === 0 ? 'writing the lyrics' : '',
    progress: 0,
    what,
    queuePosition: i === 0 ? undefined : i
  }))
  const stages = ['writing the lyrics', 'composing', 'singing and playing', 'mastering and saving']
  let tick = 0
  window.clearInterval(jobTimer)
  jobTimer = window.setInterval(() => {
    if (!song || song.jobs.length === 0) return window.clearInterval(jobTimer)
    tick++
    const job = song.jobs[0]
    job.progress = Math.min(1, job.progress + 0.12)
    job.stage = stages[Math.min(stages.length - 1, Math.floor(job.progress * stages.length))]
    if (job.progress >= 1) {
      const t = take(song.takes.length, job.number, 3.5 + ((tick * 7) % 3) * 0.5, 88 + (tick % 5), song.stems)
      song.takes.push(t)
      song.jobs.shift()
      if (song.jobs[0]) {
        song.jobs[0].status = 'running'
        song.jobs[0].queuePosition = undefined
      }
      song.activeTake = song.activeTake < 0 ? 0 : song.activeTake
      emit('peaks', { index: t.index, number: t.number, peaks: demoPeaks(t.number * 13, 1600) })
      emit('toast', { text: `${t.label} of ${song.title} is here.`, problem: false })
      emit('song', song)
    }
    emit('jobs', song.jobs)
  }, 700)
}

export async function mockCall(method: string, p: Record<string, unknown>): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 30))
  switch (method) {
    case 'ui.hello':
      return state().hello
    case 'app.state':
      return state()
    case 'ui.log':
      console.info('[ui.log]', p.message)
      return null
    case 'ui.openUrl':
      window.open(String(p.url), '_blank')
      return null
    case 'api.template':
      return p.id === 'yue2-cover' ? COVER_TEMPLATE : SONG_TEMPLATE
    case 'api.briefs':
      return { kind: p.kind, briefs: BRIEFS, values: VALUES }
    case 'api.models':
      return { models: [], templates: { 'yue2-song': { ready: true, missing: [], incomplete: [], optional_missing: [], missing_bytes: 0 } } }
    case 'library.list':
      return LIBRARY
    case 'studio.refresh':
      return connection
    case 'studio.start':
      connection = { ...connection, state: 'starting', message: 'ComfyUI is starting …' }
      emit('connection', connection)
      setTimeout(() => {
        connection = { ...connection, state: 'connected', features: ['stems', 'bars', 'models'], message: 'Plenio 2.0.0 on ComfyUI 0.44.2' }
        emit('connection', connection)
      }, 2500)
      return { started: true, message: '' }
    case 'settings.set':
      if ('token' in p) {
        settings.hasToken = !!p.token
        delete p.token
      }
      Object.assign(settings, p)
      return state()
    case 'settings.chooseLibrary':
      return 'D:\\Music\\Plenio Songs'
    case 'file.chooseAudio':
      return 'C:\\Users\\you\\Music\\My Song.mp3'
    case 'take.peaks': {
      const t = song?.takes[Number(p.index)]
      if (t) setTimeout(() => emit('peaks', { index: t.index, number: t.number, peaks: demoPeaks(t.number * 13, Number(p.count) || 1600) }), 60)
      return null
    }
    case 'song.new': {
      song = {
        ...(JSON.parse(JSON.stringify(state().song ?? {})) as SongView),
        id: 's-new',
        title: String(p.title || 'New song'),
        kind: p.kind === 'cover' ? 'cover' : 'song',
        fields: (p.fields as Record<string, unknown>) ?? {},
        takes: [],
        activeTake: -1,
        jobs: [],
        takesPerRun: Number(p.takesPerRun) || 1,
        stems: Boolean(p.stems),
        changes: [],
        plan: { what: 'newSong', label: 'write, compose and render the song' },
        documents: {},
        layout: undefined,
        lines: [],
        score: undefined,
        measures: [],
        leadIn: []
      }
      simulateRun(song.takesPerRun, 'write, compose and render the song')
      return song
    }
    case 'song.open':
      return song
    case 'song.close':
      song = null
      return null
    case 'song.generate':
      if (song) simulateRun(song.takesPerRun, song.plan.label)
      return song
    case 'song.cancel':
      if (song) song.jobs = []
      window.clearInterval(jobTimer)
      return song
    case 'take.select':
      if (song) {
        song.activeTake = Number(p.index)
        song.cover = songCover(song)
      }
      return song
    case 'take.delete':
      if (song) {
        song.takes.splice(Number(p.index), 1)
        song.takes.forEach((t, i) => (t.index = i))
        song.activeTake = Math.min(song.activeTake, song.takes.length - 1)
        song.cover = songCover(song)
      }
      return song
    case 'song.document':
      if (song) {
        song.documents[String(p.kind)] = { text: String(p.text), manual: true }
        if (!song.changes.includes(String(p.kind))) song.changes.push(String(p.kind))
        song.plan = { what: 'recompose', label: 'compose new notes for the words, then render' }
      }
      return song
    case 'song.resetDocument':
      if (song) song.changes = song.changes.filter((c) => c !== p.kind)
      return song
    case 'song.notes':
      if (song?.score) {
        if (p.part === 'instrument') song.score.instrument = p.notes as Note[]
        else song.score.melody = p.notes as Note[]
        song.edited = { ...song.edited, [String(p.part)]: true }
        if (!song.changes.includes('notes')) song.changes.push('notes')
        song.plan = { what: 'singYourNotes', label: 'render a take of your notes' }
      }
      return song
    case 'song.chords':
      if (song?.score) {
        song.score.chords = p.chords as Chord[]
        song.edited.chords = true
        if (!song.changes.includes('chords')) song.changes.push('chords')
        song.plan = { what: 'singYourNotes', label: 'render a take of your notes' }
      }
      return song
    case 'song.resetEdits':
      if (song) {
        song.edited = { melody: false, instrument: false, chords: false }
        song.changes = song.changes.filter((c) => c !== 'notes' && c !== 'chords')
        if (song.score) song.score = demoScore()
      }
      return song
    case 'song.fields':
      if (song) {
        Object.assign(song.fields, p.fields)
        if (!song.changes.includes('brief')) song.changes.push('brief')
        song.plan = { what: 'rewrite', label: 'write the song anew from the brief, then render' }
      }
      return song
    case 'song.takesPerRun':
      if (song) song.takesPerRun = Number(p.count)
      return song
    case 'song.stems':
      if (song) song.stems = Boolean(p.on)
      return song
    case 'song.rename':
      if (song) song.title = String(p.title)
      return song
    case 'daw.prepare': {
      const t = song?.takes[Number(p.index)]
      if (t) {
        emit('daw', { number: t.number, state: 'preparing' })
        setTimeout(() => emit('daw', { number: t.number, state: 'ready', stems: t.stems, click: true, folder: 'takes/2/daw' }), 900)
      }
      return null
    }
    case 'ara.state':
      return ara
    case 'ara.playTake': {
      const clip = ara.clips.find((c) => c.id === p.id)
      if (clip) {
        clip.pending = Number(p.number)
        setTimeout(() => {
          clip.playing = Number(p.number)
          clip.pending = undefined
          emit('ara', JSON.parse(JSON.stringify(ara)))
        }, 800)
      }
      return JSON.parse(JSON.stringify(ara))
    }
    case 'reaper.place':
      if (song) song.reaper = { available: true, placed: true }
      emit('toast', { text: 'Night Drive is on REAPER’s tracks.', problem: false })
      return { state: 'placed' }
    case 'reaper.forget':
      if (song) song.reaper = { available: true, placed: false }
      return song
    case 'host.key':
      return { handled: true }
    case 'daw.drag':
      await new Promise((r) => setTimeout(r, 400))
      return { state: 'dropped' }
    case 'daw.reveal':
    case 'song.reveal':
    case 'player.stem':
    case 'player.midiOut':
      return null
    case 'player.preview':
      emit('transport', { seconds: Number(p.seconds), playing: true, preview: true })
      return null
    case 'player.stop':
      emit('transport', { seconds: 24.3, playing: false, preview: false })
      return null
    default:
      throw new Error(`mock: no answer for ${method}`)
  }
}
