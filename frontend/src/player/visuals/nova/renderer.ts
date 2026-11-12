/**
 * Plenio Nova: visuals drawn by the graphics card, light worked out for every pixel (owner's request 2026-10-29:
 * more visuals - "creative, innovative, better than the MilkDrop ones").
 *
 * Where Plenio Drop paints into a feedback of smoke, a Nova visual is a scene worked out anew every frame: flights
 * through tunnels, fractal caverns and a city of the spectrum, a black hole that bends the stars, liquid chrome,
 * nebulae, the sea under the moon - most of them ray-marched in 3D - and a few that carry a picture over from frame
 * to frame (ink in water, a reaction growing patterns, the spectrum's history as ridges and as a landscape). The music
 * moves them through a few numbers and two textures (NovaMusic), the colour scheme is their palette (glsl.ts). Every
 * one then goes through the same light: a bloom that makes the bright parts glow, a filmic tone curve, a touch of
 * colour fringing on the beat, a vignette and fine grain.
 *
 * One renderer (one WebGL2 context) draws every Nova visual of the player; a video and the previews have their own.
 * It draws at as many pixels as a visual may have (gpu.ts) and the visual draws the picture scaled into its own canvas.
 */
import type { Frame } from '../analysis'
import { DOWN_FS, FINAL_FS, HEADER, IMAGE_MAIN, PREFILTER_FS, QUAD_VS, STATE_MAIN, UP_FS, withCodec } from './glsl'
import { drawFormat } from '../gpu'
import { type Cue, NO_CUE } from '../conductor'

export interface NovaDef {
  id: string
  name: string
  blurb: string
  /** What music it suits: energetic, calm, acoustic, electronic, dark. */
  suits: string[]
  /** GLSL ``vec3 image(vec2 p, vec2 uv)`` (glsl.ts). */
  image: string
  /** How much the bright parts glow, and how bright the picture is before the tone curve. */
  bloom: number
  exposure: number
  /** Travel's speed: so many units a second, and so many more at full bass. */
  speed: [number, number]
  /** A picture carried from frame to frame: GLSL ``vec4 next(vec2 uv)`` gives the new one from ``state`` (the last),
   * ``rate`` times a second whatever the frame rate, ``height`` pixels high and as wide as the picture's shape (or
   * ``width``); ``wrap``: what leaves one side comes in at the other. */
  state?: { code: string; rate: number; height: number; width?: number; wrap?: boolean }
  /** A signature's answer to the cue (phase 7.9; 0 or none: the scene as it was): ``lean`` - the picture leans in
   * before a strong onset (anticipation), ``flash`` - its light jumps on it (impact), ``build`` - it brightens and
   * saturates across the bars before a louder section (tension). */
  cue?: { lean: number; flash: number; build: number }
}

export const BINS = 128
export const WAVE_POINTS = 512

/**
 * What a Nova visual hears: the music smoothed, so that its light moves softly, and what it adds up over time (the
 * way travelled, the turn made). One for each scene: two visuals in a crossfade keep their own.
 */
export class NovaMusic {
  bass = 0
  mid = 0
  treb = 0
  level = 0
  kick = 0
  pulse = 0
  beats = 0
  travel = 0
  spin = 0
  /** The cue of this frame (conductor.ts): none without a track. */
  cue: Cue = NO_CUE
  /** Seconds since the visual started (going round every hour), and since the last frame. */
  time = 0
  dt = 1 / 60
  /** The spectrum from low to high in 128 bins (log), smoothed, and its peaks falling slowly; the waveform as
   * mix, left, right. */
  readonly spec = new Float32Array(BINS)
  readonly peaks = new Float32Array(BINS)
  readonly wave = new Float32Array(WAVE_POINTS * 3)
  private average = 0.3
  private start = -1

  update(f: Frame, speed: [number, number]): void {
    this.cue = f.cue ?? NO_CUE
    const dt = Math.max(0.001, Math.min(0.1, f.dt || 1 / 60))
    const k = (seconds: number) => 1 - Math.exp(-dt / seconds)
    const follow = (now: number, to: number, up: number, down: number) => now + (to - now) * k(to > now ? up : down)
    this.bass = follow(this.bass, f.bass, 0.035, 0.22)
    this.mid = follow(this.mid, f.mid, 0.05, 0.3)
    this.treb = follow(this.treb, f.treble, 0.03, 0.18)
    this.level = follow(this.level, f.level, 0.05, 0.4)
    // the kick: the bass above its own recent average - at once, and gone in a moment
    this.average += (f.bass - this.average) * k(2.5)
    const jump = (f.bass - this.average * 1.06) / Math.max(0.06, this.average * 0.45)
    this.kick = Math.max(Math.min(1, Math.max(0, jump)), this.kick * Math.exp(-dt / 0.12))
    this.pulse = f.pulse
    if (f.beat) this.beats += 1
    const moving = f.playing ? 1 : 0.3
    this.travel = (this.travel + dt * (speed[0] + speed[1] * this.bass) * moving) % 4096
    this.spin = (this.spin + dt * (0.12 + 0.5 * this.mid) * moving) % 4096
    if (this.start < 0) this.start = f.time
    this.time = Math.max(0, f.time - this.start) % 3600
    this.dt = dt
    // the spectrum: 128 log bins (the loudest in each) from about 45 Hz to 16 kHz, the highs lifted a little
    const high = Math.min(f.freq.length - 1, 700)
    for (let i = 0; i < BINS; i++) {
      const a = Math.floor(2 * Math.pow(high / 2, i / BINS))
      const b = Math.max(a + 1, Math.floor(2 * Math.pow(high / 2, (i + 1) / BINS)))
      let top = 0
      for (let j = a; j < b; j++) top = Math.max(top, f.freq[j] ?? 0)
      const v = Math.min(1, Math.max(0, (top / 255 - 0.18) / 0.7) * (0.9 + (0.5 * i) / BINS))
      this.spec[i] = follow(this.spec[i], v, 0.03, 0.16)
      this.peaks[i] = Math.max(v, this.peaks[i] - dt * 0.6)
    }
    const step = f.wave.length / WAVE_POINTS
    for (let i = 0; i < WAVE_POINTS; i++) {
      const j = Math.floor(i * step)
      this.wave[i * 3] = (f.wave[j] - 128) / 128
      this.wave[i * 3 + 1] = (f.left[j] - 128) / 128
      this.wave[i * 3 + 2] = (f.right[j] - 128) / 128
    }
  }
}

interface Target {
  texture: WebGLTexture
  buffer: WebGLFramebuffer
  width: number
  height: number
}
/** The scene's picture at one size, and the bloom's levels down and back up. */
interface Chain {
  width: number
  height: number
  scene: Target
  down: Target[]
  up: Target[]
  used: number
}
/** A scene's state: two pictures in turn, the steps owed, and when it was last used. */
interface Slot {
  targets: [Target, Target]
  current: number
  owed: number
  fresh: boolean
  used: number
}
interface Programs {
  image: WebGLProgram
  state: WebGLProgram | null
}
interface Compiling extends Programs {
  shaders: WebGLShader[]
}

/** The picture drawn: in ``canvas``, ``width`` x ``height`` from its bottom-left corner. */
export interface NovaPicture {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

/** At most this many steps of a state in one frame (a long pause does not make the next frame wait). */
const MAX_STEPS = 40
/** Picture sizes kept at once (their scene and bloom pictures): two visuals of a crossfade and the timing. */
const CHAINS = 3
/** A picture is drawn at most this much larger than on screen (each way): finer, then scaled down - its edges
 * smoother (the quality *Sharp*, where the graphics card has the time). */
export const MAX_SUPERSAMPLE = 1.5
/** The rows and columns drawn beyond the picture, repeating its edge (FINAL_FS). */
const GUARD = 2

export class NovaRenderer {
  readonly canvas: HTMLCanvasElement
  /** The graphics card took the context back (a driver reset, too many at once): this renderer draws nothing more. */
  lost = false
  /** Visuals that do not compile here, and why. */
  readonly broken = new Map<string, string>()
  private readonly gl: WebGL2RenderingContext
  private readonly half: boolean
  private readonly parallel: KHR_parallel_shader_compile | null
  private readonly quad: WebGLVertexArrayObject
  private readonly ready = new Map<string, Programs>()
  private readonly compiling = new Map<string, Compiling>()
  private readonly post: { prefilter: WebGLProgram; down: WebGLProgram; up: WebGLProgram; final: WebGLProgram }
  private readonly specTexture: WebGLTexture
  private readonly waveTexture: WebGLTexture
  private readonly palTexture: WebGLTexture
  private readonly black: WebGLTexture
  private chains: Chain[] = []
  private readonly slots = new Map<object, Slot>()
  private readonly uniforms = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>()
  /** The quality the visuals draw with, 0.5 .. 1 (their march steps and octaves): the live picture's follows the
   * governor; a video's and a timing's are 1. */
  quality = 1
  /** The cue's weights of the scene being drawn (``NovaDef.cue``). */
  weights = { lean: 0, flash: 0, build: 0 }
  private readonly specBytes = new Uint8ClampedArray(BINS * 4)
  private readonly waveBytes = new Uint8ClampedArray(WAVE_POINTS * 4)
  private readonly palBytes = new Uint8ClampedArray(256 * 4)
  private frames = 0
  /** The largest picture lately, for the canvas (it grows at once and shrinks after a while). */
  private largest = { width: 0, height: 0, since: 0 }

  /** ``live``: the player's own, which compiles a visual in the background and shows it once ready; a video's and the
   * previews' renderer compiles at once (their frames must not be empty). */
  constructor(private readonly live = false) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = 2
    const gl = this.canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL2 is not available')
    this.gl = gl
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      this.lost = true
    })
    this.half = drawFormat(gl) === 'half'
    this.parallel = live ? gl.getExtension('KHR_parallel_shader_compile') : null
    this.quad = gl.createVertexArray() as WebGLVertexArrayObject
    gl.bindVertexArray(this.quad)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    this.post = {
      prefilter: this.linkNow(PREFILTER_FS),
      down: this.linkNow(DOWN_FS),
      up: this.linkNow(UP_FS),
      final: this.linkNow(FINAL_FS),
    }
    this.specTexture = this.dataTexture(BINS, gl.CLAMP_TO_EDGE)
    this.waveTexture = this.dataTexture(WAVE_POINTS, gl.REPEAT)
    this.palTexture = this.dataTexture(256, gl.REPEAT)
    this.black = this.dataTexture(1, gl.CLAMP_TO_EDGE)
    gl.disable(gl.BLEND)
    gl.disable(gl.DEPTH_TEST)
  }

  /** Give the graphics memory back now (a video's or the previews' renderer when it is done). */
  dispose(): void {
    this.slots.clear()
    this.chains = []
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.lost = true
    this.canvas.width = this.canvas.height = 0
  }

  /** Whether ``def`` is ready to draw: ``true``, ``false`` (it does not compile here), or ``null`` (still compiling -
   * the live renderer compiles in the background). Starts compiling it. */
  prepare(def: NovaDef): boolean | null {
    const programs = this.programs(def, false)
    return programs === undefined ? null : programs !== null
  }

  /** One frame of ``def`` for ``slot`` (a scene's own: what it carries over), ``width`` x ``height`` on screen, at
   * ``pixels`` pixels at most (more than the screen's: drawn finer, up to ``MAX_SUPERSAMPLE`` each way). ``null``:
   * nothing to show (compiling still, or it does not work here). */
  render(def: NovaDef, music: NovaMusic, palette: Uint8ClampedArray, width: number, height: number, slot: object, pixels: number): NovaPicture | null {
    this.weights = def.cue ?? { lean: 0, flash: 0, build: 0 }
    if (this.lost) return null
    const programs = this.programs(def, !this.live)
    if (!programs) return null
    const gl = this.gl
    this.frames += 1
    const k = Math.min(MAX_SUPERSAMPLE, Math.sqrt(Math.max(1, pixels) / Math.max(1, width * height)))
    const w = Math.max(2, Math.round(width * k))
    const h = Math.max(2, Math.round(height * k))
    const chain = this.chain(w, h)
    this.upload(music, palette)
    gl.bindVertexArray(this.quad)
    const state = def.state && programs.state ? this.advance(def, programs.state, music, slot, w / h) : { texture: this.black, width: 1, height: 1, lag: 0 }

    // the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, chain.scene.buffer)
    gl.viewport(0, 0, w, h)
    this.useMusic(programs.image, music, w, h)
    gl.uniform2f(this.u(programs.image, 'S'), state.width, state.height)
    gl.uniform1f(this.u(programs.image, 'lag'), state.lag)
    this.bind(3, state.texture)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // its glow
    const glow = this.bloom(chain)

    // to the canvas - with the guard beyond the picture's top and right edge (FINAL_FS)
    this.fit(w + GUARD, h + GUARD)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, w + GUARD, h + GUARD)
    const final = this.post.final
    gl.useProgram(final)
    this.bind(0, chain.scene.texture)
    this.bind(1, glow)
    gl.uniform1i(this.u(final, 'scene'), 0)
    gl.uniform1i(this.u(final, 'glow'), 1)
    gl.uniform2f(this.u(final, 'R'), w, h)
    gl.uniform1f(this.u(final, 'bloom'), def.bloom / Math.max(1, chain.down.length))
    gl.uniform1f(this.u(final, 'exposure'), def.exposure)
    gl.uniform1f(this.u(final, 'pulse'), music.pulse)
    gl.uniform1f(this.u(final, 'T'), music.time)
    gl.uniform1f(this.u(final, 'fringe'), 0.006)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    this.forget()
    return { canvas: this.canvas, width: w, height: h }
  }

  /** How long ``def`` takes here, in nanoseconds per pixel: frames at 640 x 360 timed until the graphics card has
   * finished them, to music that moves - the faster of two rounds, so that a moment the card was busy with something
   * else does not count. ``-1``: it does not compile here; ``null``: still compiling. */
  measure(def: NovaDef, palette: Uint8ClampedArray): number | null {
    const ready = this.prepare(def)
    if (ready === null) return null
    if (!ready) return -1
    const music = new NovaMusic()
    const frame = probeFrame()
    const slot = {}
    const width = 640
    const height = 360
    const draw = (time: number) => {
      frame.time = time
      frame.beat = time % 0.5 < 0.05
      frame.pulse = 1 - (time % 0.5) * 2
      music.update(frame, def.speed)
      this.render(def, music, palette, width, height, slot, width * height)
    }
    // the first frames make the pictures and fill the state; then two rounds of three timed
    draw(0)
    draw(1 / 60)
    this.finish()
    let ms = Infinity
    for (let round = 0; round < 2; round++) {
      const started = performance.now()
      for (let i = 0; i < 3; i++) draw(0.5 + round * 1.3 + i * 0.37)
      this.finish()
      ms = Math.min(ms, (performance.now() - started) / 3)
    }
    const state = this.slots.get(slot)
    if (state) for (const t of state.targets) this.free(t)
    this.slots.delete(slot)
    return (ms * 1e6) / (width * height)
  }

  // --- the programs -----------------------------------------------------------------------------------------------

  private shader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type) as WebGLShader
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    return shader
  }

  private link(fragment: string, shaders: WebGLShader[]): WebGLProgram {
    const gl = this.gl
    const vs = this.shader(gl.VERTEX_SHADER, QUAD_VS)
    const fs = this.shader(gl.FRAGMENT_SHADER, withCodec(fragment, !this.half))
    shaders.push(vs, fs)
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    return program
  }

  /** A program of the renderer's own (the bloom, the tone curve): small, linked at once. */
  private linkNow(fragment: string): WebGLProgram {
    const shaders: WebGLShader[] = []
    const program = this.link(fragment, shaders)
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) throw new Error(`Plenio Nova: ${shaders.map((s) => this.gl.getShaderInfoLog(s)).join(' ')}`)
    return program
  }

  /** A visual's programs: ``undefined`` while compiling in the background, ``null`` when they do not compile here. */
  private programs(def: NovaDef, wait: boolean): Programs | null | undefined {
    const done = this.ready.get(def.id)
    if (done) return done
    if (this.broken.has(def.id)) return null
    const gl = this.gl
    let job = this.compiling.get(def.id)
    if (!job) {
      const shaders: WebGLShader[] = []
      const image = this.link(HEADER + def.image + IMAGE_MAIN, shaders)
      const state = def.state ? this.link(HEADER + def.state.code + STATE_MAIN, shaders) : null
      job = { image, state, shaders }
      this.compiling.set(def.id, job)
    }
    const list = job.state ? [job.image, job.state] : [job.image]
    const parallel = this.parallel
    if (!wait && parallel && !list.every((p) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR))) return undefined
    this.compiling.delete(def.id)
    for (const program of list) {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const why = job.shaders.map((s) => gl.getShaderInfoLog(s) ?? '').filter(Boolean).join('\n') || gl.getProgramInfoLog(program) || 'it does not compile'
        this.broken.set(def.id, why)
        console.warn(`Plenio Nova · ${def.name} does not compile here:`, why)
        return null
      }
    }
    for (const shader of job.shaders) gl.deleteShader(shader)
    const programs = { image: job.image, state: job.state }
    this.ready.set(def.id, programs)
    return programs
  }

  private u(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    let table = this.uniforms.get(program)
    if (!table) this.uniforms.set(program, (table = new Map()))
    if (!table.has(name)) table.set(name, this.gl.getUniformLocation(program, name))
    return table.get(name) ?? null
  }

  /** A program in use with the music: its numbers, and the spectrum, the waveform and the palette on units 0 to 2. */
  private useMusic(program: WebGLProgram, music: NovaMusic, width: number, height: number): void {
    const gl = this.gl
    gl.useProgram(program)
    const set = (name: string, value: number) => gl.uniform1f(this.u(program, name), value)
    gl.uniform2f(this.u(program, 'R'), width, height)
    set('T', music.time)
    set('bass', music.bass)
    set('mid', music.mid)
    set('treb', music.treb)
    set('level', music.level)
    set('kick', music.kick)
    set('pulse', music.pulse)
    set('beats', music.beats)
    set('travel', music.travel)
    set('spin', music.spin)
    set('Q', this.quality)
    set('anticipation', music.cue.anticipation)
    set('impact', music.cue.impact)
    set('tension', music.cue.tension)
    set('beatPhase', music.cue.beatPhase)
    set('barPhase', music.cue.barPhase)
    set('sectionEnergy', music.cue.sectionEnergy)
    set('cueLean', this.weights.lean)
    set('cueFlash', this.weights.flash)
    set('cueBuild', this.weights.build)
    gl.uniform1i(this.u(program, 'specTex'), 0)
    gl.uniform1i(this.u(program, 'waveTex'), 1)
    gl.uniform1i(this.u(program, 'palTex'), 2)
    gl.uniform1i(this.u(program, 'state'), 3)
    this.bind(0, this.specTexture)
    this.bind(1, this.waveTexture)
    this.bind(2, this.palTexture)
  }

  private bind(unit: number, texture: WebGLTexture): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
  }

  // --- the pictures -----------------------------------------------------------------------------------------------

  /** A row of RGBA bytes (the spectrum, the waveform, the palette), filtered. */
  private dataTexture(width: number, wrap: number): WebGLTexture {
    const gl = this.gl
    const texture = gl.createTexture() as WebGLTexture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
  }

  /** A picture to draw into: half floats where the card has them (light above white), else bytes. */
  private target(width: number, height: number, wrap: number = this.gl.CLAMP_TO_EDGE): Target {
    const gl = this.gl
    const texture = gl.createTexture() as WebGLTexture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (this.half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
    const buffer = gl.createFramebuffer() as WebGLFramebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return { texture, buffer, width, height }
  }

  private free(target: Target): void {
    this.gl.deleteTexture(target.texture)
    this.gl.deleteFramebuffer(target.buffer)
  }

  /** The scene's picture and the bloom's levels at this size (three sizes kept: a crossfade between two visuals of
   * different weight draws both every frame, and the timing draws at its own size between them). The chain made now
   * is the newest - the ones let go are the least recently used of the others, never the one this frame draws into. */
  private chain(width: number, height: number): Chain {
    let chain = this.chains.find((c) => c.width === width && c.height === height)
    if (!chain) {
      const down: Target[] = []
      const up: Target[] = []
      let w = width
      let h = height
      while (down.length < 6) {
        w = Math.ceil(w / 2)
        h = Math.ceil(h / 2)
        if (Math.min(w, h) < 3) break
        down.push(this.target(w, h))
      }
      for (let i = 0; i < down.length - 1; i++) up.push(this.target(down[i].width, down[i].height))
      chain = { width, height, scene: this.target(width, height), down, up, used: this.frames }
      this.chains.push(chain)
      if (this.chains.length > CHAINS) {
        this.chains.sort((a, b) => b.used - a.used)
        for (const old of this.chains.splice(CHAINS)) for (const t of [old.scene, ...old.down, ...old.up]) this.free(t)
      }
    }
    chain.used = this.frames
    return chain
  }

  /** The canvas holds the largest picture lately; it grows at once and shrinks after a few seconds. */
  private fit(width: number, height: number): void {
    const big = this.largest
    if (width >= big.width && height >= big.height) Object.assign(big, { width, height, since: this.frames })
    else if (this.frames - big.since > 300) Object.assign(big, { width, height, since: this.frames })
    const w = Math.max(big.width, width)
    const h = Math.max(big.height, height)
    if (this.canvas.width < w || this.canvas.height < h || this.canvas.width > w * 1.25 || this.canvas.height > h * 1.25) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  private upload(music: NovaMusic, palette: Uint8ClampedArray): void {
    const gl = this.gl
    for (let i = 0; i < BINS; i++) {
      this.specBytes[i * 4] = music.spec[i] * 255
      this.specBytes[i * 4 + 1] = music.peaks[i] * 255
    }
    for (let i = 0; i < WAVE_POINTS; i++) {
      this.waveBytes[i * 4] = (music.wave[i * 3] * 0.5 + 0.5) * 255
      this.waveBytes[i * 4 + 1] = (music.wave[i * 3 + 1] * 0.5 + 0.5) * 255
      this.waveBytes[i * 4 + 2] = (music.wave[i * 3 + 2] * 0.5 + 0.5) * 255
    }
    for (let i = 0; i < 256; i++) {
      this.palBytes[i * 4] = palette[i * 3]
      this.palBytes[i * 4 + 1] = palette[i * 3 + 1]
      this.palBytes[i * 4 + 2] = palette[i * 3 + 2]
      this.palBytes[i * 4 + 3] = 255
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    for (const [texture, bytes, width] of [
      [this.specTexture, this.specBytes, BINS],
      [this.waveTexture, this.waveBytes, WAVE_POINTS],
      [this.palTexture, this.palBytes, 256],
    ] as const) {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, 1, gl.RGBA, gl.UNSIGNED_BYTE, bytes)
    }
  }

  /** A visual's state, moved on by as many steps as are owed since its last frame (``rate`` a second); returns the
   * newest, its size and how far the next step is on its way (``lag`` 0..1: a history scrolls smoothly). A new scene,
   * or a new shape of the picture, starts it afresh. */
  private advance(def: NovaDef, program: WebGLProgram, music: NovaMusic, key: object, aspect: number): { texture: WebGLTexture; width: number; height: number; lag: number } {
    const gl = this.gl
    const spec = def.state as NonNullable<NovaDef['state']>
    const height = spec.height
    const width = spec.width ?? Math.max(2, Math.round(height * aspect))
    let slot = this.slots.get(key)
    if (slot && (slot.targets[0].width !== width || slot.targets[0].height !== height)) {
      for (const t of slot.targets) this.free(t)
      slot = undefined
    }
    if (!slot) {
      const wrap = spec.wrap ? gl.REPEAT : gl.CLAMP_TO_EDGE
      slot = { targets: [this.target(width, height, wrap), this.target(width, height, wrap)], current: 0, owed: 0, fresh: true, used: 0 }
      this.slots.set(key, slot)
    }
    slot.used = this.frames
    slot.owed = Math.min(MAX_STEPS, slot.owed + music.dt * spec.rate)
    const steps = slot.fresh ? Math.max(1, Math.floor(slot.owed)) : Math.floor(slot.owed)
    slot.owed = Math.max(0, slot.owed - steps)
    const result = () => ({ texture: slot.targets[slot.current].texture, width, height, lag: Math.min(1, slot.owed) })
    if (!steps) return result()
    this.useMusic(program, music, width, height)
    gl.uniform2f(this.u(program, 'S'), width, height)
    gl.uniform1f(this.u(program, 'stepDt'), 1 / spec.rate)
    gl.viewport(0, 0, width, height)
    for (let i = 0; i < steps; i++) {
      const from = slot.targets[slot.current]
      const to = slot.targets[1 - slot.current]
      gl.uniform1f(this.u(program, 'fresh'), slot.fresh ? 1 : 0)
      this.bind(3, from.texture)
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.buffer)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      slot.current = 1 - slot.current
      slot.fresh = false
    }
    return result()
  }

  private pass(program: WebGLProgram, target: Target, sources: [string, Target][], texel: Target, threshold = 0): void {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer)
    gl.viewport(0, 0, target.width, target.height)
    gl.useProgram(program)
    sources.forEach(([name, source], unit) => {
      this.bind(unit, source.texture)
      gl.uniform1i(this.u(program, name), unit)
    })
    gl.uniform2f(this.u(program, 'texel'), 1 / texel.width, 1 / texel.height)
    if (threshold) gl.uniform1f(this.u(program, 'threshold'), threshold)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  /** The bloom: the bright parts at half size, down level by level, and back up, each level adding the wider glow of
   * the one below. */
  private bloom(chain: Chain): WebGLTexture {
    const { down, up, scene } = chain
    if (!down.length) return this.black
    this.pass(this.post.prefilter, down[0], [['src', scene]], scene, 0.8)
    for (let i = 1; i < down.length; i++) this.pass(this.post.down, down[i], [['src', down[i - 1]]], down[i - 1])
    let low = down[down.length - 1]
    for (let i = down.length - 2; i >= 0; i--) {
      this.pass(this.post.up, up[i], [['src', low], ['add', down[i]]], low)
      low = up[i]
    }
    return low.texture
  }

  /** States of scenes not drawn for a while (a visual gone, a preview done) are let go. */
  private forget(): void {
    if (this.frames % 60) return
    for (const [key, slot] of this.slots) {
      if (this.frames - slot.used > 300) {
        for (const t of slot.targets) this.free(t)
        this.slots.delete(key)
      }
    }
  }

  /** Wait until the graphics card has drawn everything asked so far (reading a pixel back makes it). */
  private finish(): void {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
  }
}

/** A loud frame of music for timing: a full spectrum, a waveform, the bass up. */
function probeFrame(): Frame {
  const freq = new Uint8Array(1024)
  for (let i = 0; i < freq.length; i++) freq[i] = Math.max(0, 230 - i * 0.15)
  const wave = new Uint8Array(2048)
  for (let i = 0; i < wave.length; i++) wave[i] = 128 + Math.round(90 * Math.sin(i * 0.05) * Math.sin(i * 0.0031))
  return { freq, wave, left: wave, right: wave, bass: 0.8, mid: 0.6, treble: 0.5, level: 0.63, beat: false, pulse: 0, time: 0, dt: 1 / 60, playing: true }
}
