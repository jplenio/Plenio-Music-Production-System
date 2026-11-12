/** Plenio Nova (owner's request 2026-10-29: more visuals, better than the MilkDrop ones, the choice compact) and what
 * this device's graphics can draw (owner's request 2026-10-30: no WebGL visual offered where it cannot be drawn,
 * none chosen that would not play smoothly). The shaders themselves are compiled and looked at in a browser; here:
 * that every scene is complete, how the music is heard, and which visuals are offered. */
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Frame } from '../src/player/visuals/analysis'
import { chooseVisual, withDefaults } from '../src/player/visuals/chooser'
import {
  Governor,
  NOVA_DRAW_MS,
  NOVA_FLOOR,
  NOVA_FRAME_MS,
  governor,
  keepTiming,
  leaveOut,
  leftOut,
  loadTimings,
  novaPixels,
  novaSmooth,
  novaTimings,
  offered,
  offeredForVideo,
  setGpuSupport,
  takeBackLeftOut,
} from '../src/player/visuals/gpu'
import { NOVA, NOVA_PRESETS, NOVA_VERSION, novaScaleFor, toTime } from '../src/player/visuals/nova'
import { MAX_SUPERSAMPLE, NovaMusic, NovaRenderer } from '../src/player/visuals/nova/renderer'
import { PRESETS, presetById } from '../src/player/visuals/presets'

const MOODS = ['energetic', 'calm', 'acoustic', 'electronic', 'dark']
const GPU = { webgl: true, float: true, why: '', card: 'Test card' }

function frame(over: Partial<Frame> = {}): Frame {
  const freq = new Uint8Array(1024).fill(over.bass ? 200 : 0)
  const wave = new Uint8Array(2048).fill(128)
  return { freq, wave, left: wave, right: wave, bass: 0, mid: 0, treble: 0, level: 0, beat: false, pulse: 0, time: 0, dt: 1 / 60, playing: true, ...over }
}

/** Every Nova visual timed at so many nanoseconds per pixel. */
function timeAll(ns: number): void {
  for (const def of NOVA) keepTiming(def.id, ns)
}

afterEach(() => {
  setGpuSupport(null)
  novaTimings.value = {}
  takeBackLeftOut()
  governor.fresh()
})

describe('Plenio Nova', () => {
  it('has its scenes, each complete', () => {
    expect(NOVA.length).toBeGreaterThanOrEqual(20)
    expect(new Set(NOVA.map((d) => d.id)).size).toBe(NOVA.length)
    expect(new Set(NOVA.map((d) => d.name)).size).toBe(NOVA.length)
    for (const def of NOVA) {
      expect(def.id, def.name).toMatch(/^nova-[a-z-]+$/)
      expect(def.blurb.length, def.name).toBeGreaterThan(30)
      expect(def.suits.length, def.name).toBeGreaterThan(0)
      for (const s of def.suits) expect(MOODS, def.name).toContain(s)
      expect(def.image, def.name).toMatch(/vec3 image\(vec2 p, vec2 uv\)/)
      // inside the ray-marching loops only textureLod: Windows' shader compiler cannot take gradients there
      expect(def.image, def.name).not.toMatch(/\btexture\(/)
      for (const code of [def.image, def.state?.code ?? '']) {
        expect(code.split('{').length, `${def.name}: braces`).toBe(code.split('}').length)
        expect(code.split('(').length, `${def.name}: parentheses`).toBe(code.split(')').length)
      }
      if (def.state) {
        expect(def.state.code, def.name).toMatch(/vec4 next\(vec2 uv\)/)
        expect(def.state.rate, def.name).toBeGreaterThan(0)
        expect(def.state.height, def.name).toBeGreaterThan(16)
      }
      expect(def.bloom, def.name).toBeGreaterThanOrEqual(0)
      expect(def.exposure, def.name).toBeGreaterThan(0.5)
      expect(def.speed[0], def.name).toBeGreaterThan(0)
    }
    // they are visuals like the others, a group of their own
    for (const def of NOVA) expect(PRESETS.find((p) => p.id === def.id)?.kind).toBe('nova')
    expect(NOVA_PRESETS.map((p) => p.name)).toContain('Nova · Black hole')
    expect(NOVA_VERSION).toMatch(/^-?\d+$/)
  })

  it('draws steady stars: none blinks with the highs or the time (owner’s request 2026-10-30)', () => {
    for (const def of NOVA) {
      expect(def.image, def.name).not.toMatch(/twinkl/i)
      for (const line of def.image.split('\n').filter((l) => /starDot/.test(l))) {
        expect(line, def.name).not.toMatch(/\btreb\b|sin\(T/)
      }
    }
    // the sky scenes all draw their stars so
    for (const id of ['nova-nebula', 'nova-black-hole', 'nova-galaxy', 'nova-aurora', 'nova-ocean', 'nova-city', 'nova-outrun']) {
      expect(NOVA.find((d) => d.id === id)?.image, id).toMatch(/starDot/)
    }
  })

  it('hears the music smoothly and adds up the way and the turn', () => {
    const music = new NovaMusic()
    music.update(frame({ time: 10 }), [1, 2])
    expect(music.time).toBe(0)
    expect(music.bass).toBe(0)
    // a kick: the bass far above its own average - at once; then it is gone in a moment
    for (let k = 1; k <= 30; k++) music.update(frame({ time: 10 + k / 60, bass: 0.2 }), [1, 2])
    music.update(frame({ time: 10.6, bass: 0.9, beat: true, pulse: 1 }), [1, 2])
    expect(music.kick).toBeGreaterThan(0.5)
    expect(music.beats).toBe(1)
    expect(music.bass).toBeGreaterThan(0.2)
    expect(music.bass).toBeLessThan(0.9)
    for (let k = 1; k <= 30; k++) music.update(frame({ time: 10.6 + k / 60, bass: 0.2 }), [1, 2])
    expect(music.kick).toBeLessThan(0.1)
    // the bass pushes the way on
    const calm = new NovaMusic()
    const loud = new NovaMusic()
    for (let k = 0; k < 120; k++) {
      calm.update(frame({ time: k / 60 }), [1, 2])
      loud.update(frame({ time: k / 60, bass: 0.9 }), [1, 2])
    }
    expect(loud.travel).toBeGreaterThan(calm.travel * 1.8)
    expect(calm.travel).toBeCloseTo(2, 1)
    // paused: it drifts on slowly
    const paused = new NovaMusic()
    for (let k = 0; k < 120; k++) paused.update(frame({ time: k / 60, playing: false }), [1, 2])
    expect(paused.travel).toBeLessThan(calm.travel / 2)
    // the spectrum and the waveform within their ranges
    for (const v of loud.spec) expect(v).toBeGreaterThanOrEqual(0)
    for (const v of loud.spec) expect(v).toBeLessThanOrEqual(1)
    expect(Math.max(...loud.spec)).toBeGreaterThan(0.5)
    expect(Math.max(...loud.wave.map(Math.abs))).toBe(0)
  })
})

describe('what this device can draw (owner’s request 2026-10-30)', () => {
  it('offers no Drop or Nova visual where there is no WebGL2 on the graphics card', () => {
    setGpuSupport({ webgl: false, float: false, why: 'This browser has no WebGL2.', card: '' })
    timeAll(1)
    expect(offered(presetById('bars')!)).toBe(true)
    expect(PRESETS.filter((p) => p.kind === 'drop').some(offered)).toBe(false)
    expect(PRESETS.filter((p) => p.kind === 'nova').some(offered)).toBe(false)
    expect(PRESETS.filter((p) => p.kind !== undefined).some(offeredForVideo)).toBe(false)
    // nor are they chosen, whatever the settings say
    const settings = withDefaults(null)
    const song = { id: 's1', genre: 'techno', mood: '', style: '', bpm: 128 }
    for (let turn = 0; turn < 40; turn++) {
      const id = chooseVisual({ settings, song, turn })
      expect(presetById(id)?.kind, id).toBeUndefined()
    }
    expect(chooseVisual({ settings: { ...settings, mode: 'fixed', fixed: 'nova-black-hole' }, song })).toBe('bars')
    expect(chooseVisual({ settings: { ...settings, songs: { s1: 'drop-nebula-swirl' } }, song, random: () => 0 })).not.toBe('drop-nebula-swirl')
    // a pool of only those: one this device draws instead
    const instead = chooseVisual({ settings: { ...settings, mode: 'random', pool: ['drop-nebula-swirl', 'nova-pulsar'] }, song })
    expect(presetById(instead)?.kind, instead).toBeUndefined()
  })

  it('offers Plenio Drop and Nova with WebGL2 - Nova in eight bits where the card has no half floats', () => {
    setGpuSupport({ webgl: true, float: false, why: '', card: 'Old card' })
    timeAll(1)
    expect(offered(presetById('drop-nebula-swirl')!)).toBe(true)
    expect(offered(presetById('nova-pulsar')!)).toBe(true)
    expect(offeredForVideo(presetById('nova-pulsar')!)).toBe(true)
    setGpuSupport({ webgl: false, float: false, why: 'no WebGL2', card: '' })
    expect(offered(presetById('nova-pulsar')!)).toBe(false)
  })

  it('offers a Nova visual for the live picture only once timed smooth on this card', () => {
    setGpuSupport(GPU)
    const pulsar = presetById('nova-pulsar')!
    expect(novaSmooth('nova-pulsar')).toBeNull()
    expect(offered(pulsar)).toBe(false)
    // a video draws ahead of time: offered as soon as the card can draw it at all
    expect(offeredForVideo(pulsar)).toBe(true)
    // smooth: within its share of a frame at the smallest picture
    const limit = (NOVA_FRAME_MS * 1e6) / NOVA_FLOOR
    keepTiming('nova-pulsar', limit * 0.9)
    expect(offered(pulsar)).toBe(true)
    keepTiming('nova-pulsar', limit * 1.2)
    expect(novaSmooth('nova-pulsar')).toBe(false)
    expect(offered(pulsar)).toBe(false)
    expect(offeredForVideo(pulsar)).toBe(true)
    // one that does not compile here is not offered at all
    keepTiming('nova-pulsar', -1)
    expect(offeredForVideo(pulsar)).toBe(false)
    // the chooser takes the smooth ones
    timeAll(2)
    keepTiming('nova-bulb', limit * 3)
    const settings = { ...withDefaults(null), mode: 'random' as const, pool: ['nova-bulb', 'nova-pulsar', 'nova-ink'] }
    for (let i = 0; i < 20; i++) expect(['nova-pulsar', 'nova-ink']).toContain(chooseVisual({ settings, song: null, random: () => i / 20 }))
  })

  it('gives a Nova visual as many pixels as stay smooth', () => {
    setGpuSupport(GPU)
    const screen = 1920 * 1080
    keepTiming('nova-ink', 0.5)
    expect(novaPixels('nova-ink', screen)).toBe(screen)
    keepTiming('nova-bulb', 10)
    expect(novaPixels('nova-bulb', screen)).toBeCloseTo((NOVA_DRAW_MS * 1e6) / 10, 0)
    // a huge screen: no more than the ceiling
    expect(novaPixels('nova-ink', 7680 * 4320)).toBe(2560 * 1440)
    // Sharp: finer than the screen where the card has the time
    expect(novaPixels('nova-ink', 1280 * 720 * MAX_SUPERSAMPLE ** 2)).toBe(1280 * 720 * MAX_SUPERSAMPLE ** 2)
    // frames coming late: fewer
    governor.factor = 0.5
    expect(novaPixels('nova-ink', screen)).toBe(screen * 0.5)
  })

  it('draws Nova at the screen’s own size when balanced, finer when sharp (issue 2026-10-30: blurred edges)', () => {
    expect(novaScaleFor(0.5)).toBe(0.5)
    expect(novaScaleFor(0.75)).toBe(1)
    expect(novaScaleFor(1)).toBe(MAX_SUPERSAMPLE)
  })

  it('times a visual too heavy here once more each session, and every one not timed yet', () => {
    setGpuSupport(GPU)
    const limit = (NOVA_FRAME_MS * 1e6) / NOVA_FLOOR
    const [a, b, c, d] = NOVA
    const timings = { [a.id]: limit * 0.5, [b.id]: limit * 3, [d.id]: -1 }
    expect(toTime([a, b, c, d], timings, new Set()).map((x) => x.id)).toEqual([b.id, c.id])
    expect(toTime([a, b, c, d], timings, new Set([b.id])).map((x) => x.id)).toEqual([c.id])
  })

  it('keeps the timings for this card, and takes them again for another one', () => {
    setGpuSupport(GPU)
    loadTimings(NOVA_VERSION)
    keepTiming('nova-ink', 3)
    novaTimings.value = {}
    setGpuSupport({ ...GPU, card: 'Another card' })
    loadTimings(NOVA_VERSION)
    expect(novaTimings.value['nova-ink']).toBeUndefined()
    setGpuSupport(GPU)
    loadTimings(NOVA_VERSION)
    expect(novaTimings.value['nova-ink']).toBe(3)
    // a changed visual is timed again
    loadTimings(`${NOVA_VERSION}x`)
    expect(novaTimings.value['nova-ink']).toBeUndefined()
  })

  it('leaves out a visual that did not keep up, until asked to try again', () => {
    const fire = presetById('fire')!
    expect(offered(fire)).toBe(true)
    leaveOut('fire')
    expect(offered(fire)).toBe(false)
    expect(leftOut.value.has('fire')).toBe(true)
    expect(chooseVisual({ settings: { ...withDefaults(null), mode: 'fixed', fixed: 'fire' }, song: null })).toBe('bars')
    takeBackLeftOut()
    expect(offered(fire)).toBe(true)
  })
})

describe('the governor', () => {
  const run = (g: Governor, ms: number, seconds: number) => {
    for (let t = 0; t < seconds; t += ms / 1000) g.note(ms / 1000)
  }

  it('takes pixels away while frames come late, and gives them back', () => {
    const g = new Governor()
    run(g, 16.7, 3)
    expect(g.factor).toBe(1)
    run(g, 40, 6) // the quality gives way first (governor.test.ts), then the pixels
    expect(g.factor).toBeLessThan(0.6)
    run(g, 16.7, 15)
    expect(g.factor).toBe(1)
    expect(g.struggling).toBe(0)
  })

  it('holds a 144 Hz screen to its pace only down to smooth, not to 60 Hz', () => {
    const g = new Governor()
    run(g, 6.9, 3)
    run(g, 16.7, 5)
    expect(g.factor).toBe(1)
  })

  it('says a visual struggles once the fewest pixels do not help', () => {
    const g = new Governor()
    run(g, 16.7, 2)
    run(g, 45, 11)
    expect(g.factor).toBeCloseTo(0.35, 2)
    expect(g.struggling).toBeGreaterThan(4)
    g.fresh()
    expect(g.factor).toBe(1)
    expect(g.struggling).toBe(0)
  })
})

/** A WebGL2 context that draws nothing and notes every use of a picture already let go (deleted), and the viewports. */
function fakeWebGl(): { gl: WebGL2RenderingContext; misuse: string[]; viewports: number[][] } {
  const misuse: string[] = []
  const viewports: number[][] = []
  let made = 0
  const object = () => ({ id: ++made, deleted: false })
  const methods: Record<string, (...args: never[]) => unknown> = {
    getExtension: (name: string) => (name === 'EXT_color_buffer_float' ? {} : name === 'WEBGL_lose_context' ? { loseContext() {} } : null),
    getProgramParameter: () => true,
    getShaderParameter: () => true,
    getUniformLocation: () => ({}),
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    deleteTexture: (t: { deleted: boolean }) => void (t.deleted = true),
    deleteFramebuffer: (f: { deleted: boolean }) => void (f.deleted = true),
    bindTexture: (_target: number, t: { id: number; deleted: boolean } | null) => void (t?.deleted && misuse.push(`texture ${t.id}`)),
    bindFramebuffer: (_target: number, f: { id: number; deleted: boolean } | null) => void (f?.deleted && misuse.push(`framebuffer ${f.id}`)),
    viewport: (...args: number[]) => void viewports.push(args),
  }
  for (const name of ['createTexture', 'createFramebuffer', 'createProgram', 'createShader', 'createVertexArray', 'createBuffer']) methods[name] = object
  const gl = new Proxy({} as Record<string, unknown>, {
    get(_target, key: string) {
      if (key in methods) return methods[key]
      if (/^[A-Z0-9_]+$/.test(key)) return 1
      return () => undefined
    },
  })
  return { gl: gl as unknown as WebGL2RenderingContext, misuse, viewports }
}

describe('the Nova renderer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('draws a guard beyond the picture, and finer than the screen when asked (issue 2026-10-30: flickering edges)', () => {
    const { gl, viewports } = fakeWebGl()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => gl as never)
    const renderer = new NovaRenderer()
    const palette = new Uint8ClampedArray(256 * 3)
    // asked for four times the screen's pixels: drawn MAX_SUPERSAMPLE finer each way, no more
    const picture = renderer.render(NOVA[0], new NovaMusic(), palette, 800, 450, {}, 800 * 450 * 4)
    expect(picture).not.toBeNull()
    expect([picture!.width, picture!.height]).toEqual([Math.round(800 * MAX_SUPERSAMPLE), Math.round(450 * MAX_SUPERSAMPLE)])
    // the last pass: two pixels beyond its top and right edge (repeating it), and the canvas large enough for them -
    // scaled onto the screen, the picture's edge blends with itself, never with another picture left there
    expect(viewports.at(-1)).toEqual([0, 0, picture!.width + 2, picture!.height + 2])
    expect(picture!.canvas.width).toBeGreaterThanOrEqual(picture!.width + 2)
    expect(picture!.canvas.height).toBeGreaterThanOrEqual(picture!.height + 2)
  })

  it('never draws into a picture it let go - a crossfade, the timing and the governor ask for several sizes', () => {
    // as on a weaker graphics card: each visual gets the pixels it draws smoothly, so their pictures differ in size
    const { gl, misuse } = fakeWebGl()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => gl as never)
    const renderer = new NovaRenderer()
    const [a, b] = NOVA
    const music = new NovaMusic()
    music.update(frame({ bass: 0.6, time: 1 }), a.speed)
    const palette = new Uint8ClampedArray(256 * 3)
    const [slotA, slotB] = [{}, {}]
    const screen = 1600 * 900
    for (let i = 0; i < 3; i++) {
      expect(renderer.render(a, music, palette, 1600, 900, slotA, screen * 0.5)).not.toBeNull()
      expect(renderer.render(b, music, palette, 1600, 900, slotB, screen * 0.25)).not.toBeNull()
    }
    expect(renderer.measure(a, palette)).toBeGreaterThanOrEqual(0)
    for (let i = 0; i < 3; i++) {
      expect(renderer.render(a, music, palette, 1600, 900, slotA, screen * 0.1)).not.toBeNull()
      expect(renderer.render(b, music, palette, 1600, 900, slotB, screen * 0.25)).not.toBeNull()
    }
    expect(misuse).toEqual([])
  })
})
