/**
 * Plenio Drop: visuals in the spirit of Winamp's MilkDrop, drawn by a renderer of our own on WebGL2.
 *
 * What makes MilkDrop is a feedback loop, and that is what this draws. Every frame:
 *  1. warp - the last frame drawn again through a warp field: zoom (with a curve over the radius), rotation,
 *     one of twelve families (plain, swirl, waves, tunnel, kaleidoscope, ripple - and since 2026-10-23, after
 *     MilkDrop's per-pixel classics, twist, fold, lens, tiles, spiral, drain), a sine warp field, stretch and
 *     drift around a centre - and faded (decay), its middle darkened if asked, its colours slowly turning;
 *  2. draw - pictures (sprites: the song's cover, its title, the line sung, the word sung - owner's request
 *     2026-10-18: text and covers in the visual), then the waveform (circle, scope, line, spectrum, dots ...),
 *     shapes and motion vectors on top, as thick additive strips, so what is drawn now becomes tomorrow's smoke;
 *  3. composite - to the screen with gamma, a video echo, symmetry and colour effects.
 * A preset (presets.ts) sets the parameters every frame from the music. A change of preset glides: the
 * feedback stays, the old and the new parameters are mixed over two seconds.
 *
 * One renderer (one WebGL context) is shared by every Drop visual; it draws into an offscreen canvas at a
 * fraction of the visual's size (``dropOptions.scale``), which the visual then draws scaled into its own.
 */
import { drawFormat } from '../gpu'
import type { Frame } from '../analysis'

/** What a preset sees of the music, per frame - MilkDrop's names where it has them. */
export interface Music {
  /** The bands relative to their long average (about 1 is usual, 2 loud), and their smoothed values. */
  bass: number
  mid: number
  treb: number
  bassAtt: number
  midAtt: number
  trebAtt: number
  /** 0..1, the level. */
  vol: number
  beat: boolean
  /** 1 at a beat, falling to 0. */
  pulse: number
  time: number
  dt: number
  frame: number
  /** The picture's width over its height. */
  aspect: number
  /** Seconds into the song; whether a lyrics line is sung now (0/1) and since when (seconds) - for pictures of
   * the title at the start and of the line sung (``story``). */
  songTime: number
  lineOn: number
  lineAge: number
  /** The waveform (the mix, left, right) as -1..1, and the spectrum in 128 log bins as 0..1. */
  wave: Float32Array
  left: Float32Array
  right: Float32Array
  spec: Float32Array
}

export interface Wave {
  /** 0 circle, 1 XY scope, 2 line, 3 spectrum line, 4 two lines (left, right), 5 dot ring, 6 vertical line,
   * 7 spectrum spiral. */
  mode: number
  scale: number
  x: number
  y: number
  thick: number
  alpha: number
  /** Where on the colour scheme (0..1, it wraps). */
  hue: number
  additive?: boolean
}

export interface Shape {
  sides: number
  radius: number
  x: number
  y: number
  angle: number
  hue: number
  /** The edge's and the centre's alpha (a soft glow when the centre is brighter). */
  alpha: number
  inner: number
}

/** A picture drawn into the feedback: ``source`` names it (``cover``, ``title``, ``line``, ``word``); x, y in
 * -1..1 across the screen, ``size`` its half height in screen heights, ``tint`` 0 (its own colours) .. 1 (the
 * colour scheme's at ``hue``), ``additive``: light added (else laid over). */
export interface Sprite {
  source: string
  x: number
  y: number
  size: number
  angle: number
  alpha: number
  tint: number
  hue: number
  additive: number
}

export interface DropParams {
  zoom: number
  zoomExp: number
  rot: number
  warp: number
  warpSpeed: number
  warpScale: number
  cx: number
  cy: number
  dx: number
  dy: number
  sx: number
  sy: number
  decay: number
  /** 0 plain, 1 swirl, 2 waves, 3 tunnel, 4 kaleidoscope, 5 ripple, 6 twist (the turn grows with the radius),
   * 7 fold (mirror folds: a fractal grows in the feedback), 8 lens (a breathing fisheye), 9 tiles (the last
   * frame repeated, smaller, in a grid), 10 spiral (a log-polar twist: arms that wind in for ever), 11 drain
   * (the middle turns fastest). */
  family: number
  famA: number
  famB: number
  wrap: number
  hueShift: number
  /** MilkDrop's darken_center: the middle darkened a little every frame (a zoom that piles light there). */
  darkenCenter: number
  echoAlpha: number
  echoZoom: number
  echoOrient: number
  gamma: number
  invert: number
  solarize: number
  /** 0 none, 1 left-right, 2 top-bottom, 3 both. */
  mirror: number
  vignette: number
  /** Motion vectors: a grid this many across (0: none), and their alpha. */
  mvec: number
  mvAlpha: number
  waves: Wave[]
  shapes: Shape[]
  sprites: Sprite[]
}

export const DEFAULTS: DropParams = {
  zoom: 1,
  zoomExp: 1,
  rot: 0,
  warp: 0,
  warpSpeed: 1,
  warpScale: 1,
  cx: 0.5,
  cy: 0.5,
  dx: 0,
  dy: 0,
  sx: 1,
  sy: 1,
  decay: 0.97,
  family: 0,
  famA: 0,
  famB: 1,
  wrap: 0,
  hueShift: 0,
  darkenCenter: 0,
  echoAlpha: 0,
  echoZoom: 1,
  echoOrient: 0,
  gamma: 1.5,
  invert: 0,
  solarize: 0,
  mirror: 0,
  vignette: 0.35,
  mvec: 0,
  mvAlpha: 0.5,
  waves: [],
  shapes: [],
  sprites: [],
}

/** A Drop preset: a name and what it does every frame (the per-frame equations, as code). ``vars`` keeps
 * whatever the preset wants between frames (MilkDrop's q variables). */
export interface DropDef {
  id: string
  name: string
  blurb: string
  suits: string[]
  frame(m: Music, vars: Record<string, number>): Partial<DropParams>
}

/** How the renderer works: ``scale`` is the feedback's size against the visual (0.5 low .. 1 full). */
export const dropOptions = { scale: 0.75 }

// --- shaders ------------------------------------------------------------------------------------------

const QUAD_VS = `#version 300 es
in vec2 a;
out vec2 uv;
void main() { uv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`

const WARP_FS = `#version 300 es
precision highp float;
uniform sampler2D prev;
uniform float aspect, zoom, zoomExp, rot, warp, warpTime, warpScale, decay, famA, famB, hueShift, wrap, darkenCenter;
uniform vec2 center, drift, stretch;
uniform int family;
in vec2 uv;
out vec4 o;
mat2 r2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 hueRot(vec3 c, float a) {
  const vec3 k = vec3(0.57735027);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}
void main() {
  vec2 p = uv - center;
  p.x *= aspect;
  float rn = length(p) / (0.5 * max(aspect, 1.0));
  float z = pow(max(zoom, 0.01), pow(max(rn, 0.001), zoomExp));
  vec2 q = r2(rot) * (p / z);
  if (family == 1) {
    q = r2(famA * pow(max(0.0, 1.0 - rn / max(famB, 0.05)), 2.0)) * q;
  } else if (family == 2) {
    q += famA * vec2(sin(q.y * famB + warpTime), sin(q.x * famB * 1.17 - warpTime * 1.31));
  } else if (family == 3) {
    q *= 1.0 + famA * sin(rn * famB - warpTime * 2.5);
  } else if (family == 4) {
    float n = max(2.0, famB);
    float seg = 6.2831853 / n;
    float a = mod(atan(q.y, q.x) + 3.1415927, seg);
    a = abs(a - seg * 0.5) + famA * 0.05;
    q = length(q) * vec2(cos(a), sin(a));
  } else if (family == 5) {
    float d = length(q);
    q += (q / max(d, 1e-4)) * famA * sin(d * famB - warpTime * 4.0) * exp(-d * 2.0);
  } else if (family == 6) {
    q = r2(famA * pow(rn, max(famB, 0.1))) * q;
  } else if (family == 7) {
    q = r2(famB) * (abs(q) - famA);
  } else if (family == 8) {
    q *= 1.0 + famA * (rn * rn - famB);
  } else if (family == 9) {
    vec2 t = q;
    t.x /= aspect;
    t = fract(t * max(famB, 1.0) + 0.5) - 0.5;
    t.x *= aspect;
    q = mix(q, t, clamp(famA, 0.0, 1.0));
  } else if (family == 10) {
    q = r2(famA * log(max(rn, 0.002)) * max(famB, 0.1)) * q;
  } else if (family == 11) {
    q = r2(famA / (rn + max(famB, 0.02))) * q;
  }
  q += warp * 0.0035 * vec2(
    sin(warpTime * 0.333 + q.y * warpScale * 8.0) + sin(warpTime * 0.753 - q.x * warpScale * 5.3),
    cos(warpTime * 0.375 - q.x * warpScale * 7.1) + cos(warpTime * 0.825 + q.y * warpScale * 4.7));
  q /= stretch;
  q.x /= aspect;
  vec2 src = q + center - drift;
  if (wrap > 0.5) src = fract(src);
  vec3 c = texture(prev, src).rgb;
  c *= 1.0 - darkenCenter * exp(-rn * rn * 30.0);
  o = vec4(max(hueRot(c, hueShift) * decay, 0.0), 1.0);
}`

const COMP_FS = `#version 300 es
precision highp float;
uniform sampler2D cur;
uniform float aspect, gamma, echoAlpha, echoZoom, invert, solarize, vignette;
uniform int echoOrient, mirror;
in vec2 uv;
out vec4 o;
vec2 fold(vec2 u) {
  if (mirror == 1 || mirror == 3) u.x = 0.5 - abs(u.x - 0.5);
  if (mirror == 2 || mirror == 3) u.y = 0.5 - abs(u.y - 0.5);
  return u;
}
void main() {
  vec2 u = fold(uv);
  vec3 c = texture(cur, u).rgb;
  if (echoAlpha > 0.001) {
    vec2 e = (u - 0.5) / max(echoZoom, 0.05) + 0.5;
    if (echoOrient == 1 || echoOrient == 3) e.x = 1.0 - e.x;
    if (echoOrient >= 2) e.y = 1.0 - e.y;
    c = mix(c, max(c, texture(cur, e).rgb), echoAlpha);
  }
  c *= gamma;
  c = mix(c, 1.0 - clamp(c, 0.0, 1.0), invert);
  vec3 s = clamp(c, 0.0, 1.0);
  c = mix(c, s * (1.0 - s) * 4.0, solarize);
  float v = length((uv - 0.5) * vec2(aspect, 1.0));
  c *= 1.0 - vignette * smoothstep(0.35, 1.05, v);
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`

const DRAW_VS = `#version 300 es
in vec2 pos;
in vec4 color;
uniform float aspect;
out vec4 vc;
void main() { vc = color; gl_Position = vec4(pos.x / aspect, pos.y, 0.0, 1.0); }`

const DRAW_FS = `#version 300 es
precision mediump float;
in vec4 vc;
out vec4 o;
void main() { o = vc; }`

const SPRITE_VS = `#version 300 es
in vec2 pos;
in vec2 tex;
uniform float aspect;
out vec2 st;
void main() { st = tex; gl_Position = vec4(pos.x / aspect, pos.y, 0.0, 1.0); }`

const SPRITE_FS = `#version 300 es
precision mediump float;
uniform sampler2D image;
uniform vec4 tint;
uniform float mixTint;
in vec2 st;
out vec4 o;
void main() {
  vec4 c = texture(image, st);
  float light = max(max(c.r, c.g), c.b);
  o = vec4(mix(c.rgb, tint.rgb * light, mixTint), c.a * tint.a);
}`

// --- the music, as the presets see it -----------------------------------------------------------------

const SPEC_BINS = 128
const WAVE_POINTS = 512

class Listener {
  /** What the song is doing now (set by the visual or the video every frame). */
  story = { songTime: 0, lineOn: 0, lineAge: 0 }
  private avg = { bass: 0.25, mid: 0.2, treb: 0.15 }
  private att = { bass: 1, mid: 1, treb: 1 }
  private frames = 0
  readonly music: Music = {
    bass: 1, mid: 1, treb: 1, bassAtt: 1, midAtt: 1, trebAtt: 1, vol: 0, beat: false, pulse: 0, time: 0, dt: 0.016, frame: 0, aspect: 16 / 9, songTime: 0, lineOn: 0, lineAge: 0,
    wave: new Float32Array(WAVE_POINTS), left: new Float32Array(WAVE_POINTS), right: new Float32Array(WAVE_POINTS), spec: new Float32Array(SPEC_BINS),
  } // prettier-ignore

  update(f: Frame): Music {
    const m = this.music
    const dt = Math.max(0.001, Math.min(0.1, f.dt || 0.016))
    // relative to the long average, as MilkDrop's bass/mid/treb (about 1 at the usual level)
    const slow = 1 - Math.exp(-dt / 6)
    const att = 1 - Math.exp(-dt / 0.35)
    for (const [key, value] of [['bass', f.bass], ['mid', f.mid], ['treb', f.treble]] as const) {
      this.avg[key] += (Math.max(value, 0.02) - this.avg[key]) * slow
      const rel = Math.min(3, value / Math.max(this.avg[key], 0.04))
      this.att[key] += (rel - this.att[key]) * att
      m[key] = rel
    }
    m.bassAtt = this.att.bass
    m.midAtt = this.att.mid
    m.trebAtt = this.att.treb
    m.vol = f.level
    m.songTime = this.story.songTime
    m.lineOn = this.story.lineOn
    m.lineAge = this.story.lineAge
    m.beat = f.beat
    m.pulse = f.pulse
    m.time = f.time
    m.dt = dt
    m.frame = ++this.frames
    const step = f.wave.length / WAVE_POINTS
    for (let i = 0; i < WAVE_POINTS; i++) {
      const k = Math.floor(i * step)
      m.wave[i] = (f.wave[k] - 128) / 128
      m.left[i] = (f.left[k] - 128) / 128
      m.right[i] = (f.right[k] - 128) / 128
    }
    const high = Math.min(f.freq.length - 1, 700)
    for (let i = 0; i < SPEC_BINS; i++) {
      const a = Math.floor(2 * Math.pow(high / 2, i / SPEC_BINS))
      const b = Math.max(a + 1, Math.floor(2 * Math.pow(high / 2, (i + 1) / SPEC_BINS)))
      let peak = 0
      for (let k = a; k < b; k++) peak = Math.max(peak, f.freq[k])
      m.spec[i] = peak / 255
    }
    return m
  }
}

// --- the renderer -------------------------------------------------------------------------------------

const MAX_VERTICES = 60000
const FLOATS = 6 // x, y, r, g, b, a

type Rgb = [number, number, number]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** The parameters of two presets mixed (``t`` 0 old .. 1 new). Families, symmetry and the echo's turn switch
 * half way, when the outgoing family's strength has faded to nothing and the incoming one starts from it. */
export function mixParams(a: DropParams, b: DropParams, t: number): DropParams {
  const out = { ...b }
  for (const key of Object.keys(DEFAULTS) as (keyof DropParams)[]) {
    const x = a[key]
    const y = b[key]
    if (typeof x === 'number' && typeof y === 'number') (out[key] as number) = lerp(x, y, t)
  }
  if (a.family !== b.family) {
    out.family = t < 0.5 ? a.family : b.family
    out.famA = t < 0.5 ? a.famA * (1 - 2 * t) : b.famA * (2 * t - 1)
    out.famB = t < 0.5 ? a.famB : b.famB
  } else out.family = b.family
  out.mirror = t < 0.5 ? a.mirror : b.mirror
  out.echoOrient = t < 0.5 ? a.echoOrient : b.echoOrient
  out.wrap = t < 0.5 ? a.wrap : b.wrap
  out.waves = [...a.waves.map((w) => ({ ...w, alpha: w.alpha * (1 - t) })), ...b.waves.map((w) => ({ ...w, alpha: w.alpha * t }))]
  out.shapes = [...a.shapes.map((s) => ({ ...s, alpha: s.alpha * (1 - t), inner: s.inner * (1 - t) })), ...b.shapes.map((s) => ({ ...s, alpha: s.alpha * t, inner: s.inner * t }))]
  out.sprites = [...a.sprites.map((s) => ({ ...s, alpha: s.alpha * (1 - t) })), ...b.sprites.map((s) => ({ ...s, alpha: s.alpha * t }))]
  out.mvAlpha = a.mvec && b.mvec ? lerp(a.mvAlpha, b.mvAlpha, t) : b.mvec ? b.mvAlpha * t : a.mvAlpha * (1 - t)
  out.mvec = t < 0.5 ? a.mvec || b.mvec : b.mvec || a.mvec
  return out
}

/** A preset's motion is per frame at 60 frames a second (as MilkDrop's); at another frame rate the same
 * motion per second: zoom, turn, drift, fading, the colours' turn and the families' pull scaled by it. */
export function perFrame(p: DropParams, dt: number): DropParams {
  const k = Math.max(0.25, Math.min(4, dt * 60))
  if (Math.abs(k - 1) < 0.02) return p
  const out = { ...p }
  out.zoom = Math.pow(Math.max(p.zoom, 0.01), k)
  out.decay = Math.pow(Math.max(p.decay, 0), k)
  out.sx = Math.pow(Math.max(p.sx, 0.01), k)
  out.sy = Math.pow(Math.max(p.sy, 0.01), k)
  out.rot = p.rot * k
  out.dx = p.dx * k
  out.dy = p.dy * k
  out.hueShift = p.hueShift * k
  out.warp = p.warp * k
  // the kaleidoscope, the fold and the tiles place; the others pull a little every frame
  if (![4, 7, 9].includes(Math.round(p.family))) out.famA = p.famA * k
  out.darkenCenter = 1 - Math.pow(Math.max(0, 1 - p.darkenCenter), k)
  return out
}

export function paramsOf(def: DropDef, m: Music, vars: Record<string, number>): DropParams {
  return { ...DEFAULTS, ...def.frame(m, vars) }
}

/** How long a change of preset glides when nothing else says (the visuals' crossfade sets it). */
const BLEND_SECONDS = 3

export class DropRenderer {
  readonly canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private warp: WebGLProgram
  private comp: WebGLProgram
  private draw: WebGLProgram
  private quad: WebGLVertexArrayObject
  private lines: WebGLVertexArrayObject
  private lineBuffer: WebGLBuffer
  private verts = new Float32Array(MAX_VERTICES * FLOATS)
  private count = 0
  private textures: WebGLTexture[] = []
  private buffers: WebGLFramebuffer[] = []
  private width = 0
  private height = 0
  private current = 0
  private half: boolean
  private warpTime = 0
  private listener = new Listener()
  private def: DropDef | null = null
  private vars: Record<string, number> = {}
  private previous: { def: DropDef; vars: Record<string, number> } | null = null
  private blendStart = 0
  /** The time of the last frame drawn: a preset that starts after a pause starts from black, not from an old
   * picture left in the feedback. */
  private lastTime = -1
  /** How long a change of preset glides (owner's request 2026-10-18: soft, and set with the crossfade). */
  blendSeconds = BLEND_SECONDS
  /** Pictures drawn into every preset's feedback, besides its own (a video's title, lyrics and cover). */
  extraSprites: Sprite[] = []
  private sprite: WebGLProgram
  private spriteVao: WebGLVertexArrayObject
  private spriteBuffer: WebGLBuffer
  private sources = new Map<string, { texture: WebGLTexture; aspect: number; key: string }>()
  private uniforms = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>()

  /** The graphics card took the context back (too many at once, a driver reset): this renderer draws nothing more. */
  lost = false

  constructor() {
    this.canvas = document.createElement('canvas')
    const gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true, premultipliedAlpha: false })
    if (!gl) throw new Error('WebGL2 is not available')
    this.gl = gl
    this.canvas.addEventListener('webglcontextlost', () => (this.lost = true))
    this.half = drawFormat(gl) === 'half'
    this.warp = this.program(QUAD_VS, WARP_FS)
    this.comp = this.program(QUAD_VS, COMP_FS)
    this.draw = this.program(DRAW_VS, DRAW_FS)
    // the screen-filling quad
    this.quad = gl.createVertexArray() as WebGLVertexArrayObject
    gl.bindVertexArray(this.quad)
    const quadBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    for (const program of [this.warp, this.comp]) {
      const at = gl.getAttribLocation(program, 'a')
      gl.enableVertexAttribArray(at)
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
    }
    // the strips, fans and dots drawn on top
    this.lines = gl.createVertexArray() as WebGLVertexArrayObject
    gl.bindVertexArray(this.lines)
    this.lineBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.verts.byteLength, gl.DYNAMIC_DRAW)
    const pos = gl.getAttribLocation(this.draw, 'pos')
    const color = gl.getAttribLocation(this.draw, 'color')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, FLOATS * 4, 0)
    gl.enableVertexAttribArray(color)
    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, FLOATS * 4, 8)
    // the pictures: a textured quad each
    this.sprite = this.program(SPRITE_VS, SPRITE_FS)
    this.spriteVao = gl.createVertexArray() as WebGLVertexArrayObject
    gl.bindVertexArray(this.spriteVao)
    this.spriteBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 4, gl.DYNAMIC_DRAW)
    const spritePos = gl.getAttribLocation(this.sprite, 'pos')
    const spriteTex = gl.getAttribLocation(this.sprite, 'tex')
    gl.enableVertexAttribArray(spritePos)
    gl.vertexAttribPointer(spritePos, 2, gl.FLOAT, false, 16, 0)
    gl.enableVertexAttribArray(spriteTex)
    gl.vertexAttribPointer(spriteTex, 2, gl.FLOAT, false, 16, 8)
    gl.bindVertexArray(null)
  }

  /** What the song is doing now: seconds into it, whether a line is sung and since when (the formulas'
   * ``songtime``, ``line_on``, ``line_age``). */
  get story(): { songTime: number; lineOn: number; lineAge: number } {
    return this.listener.story
  }

  /** A picture the presets may draw (``cover``, ``title``, ``line``, ``word``): uploaded again only when
   * ``key`` changes; ``null`` takes it away. */
  /** Give the graphics memory back now (a video's or a preview's renderer when it is done): the context is let go
   * on purpose, not left to the garbage collector - a browser keeps only so many, and each holds frames of the video's
   * size. */
  dispose(): void {
    this.sources.clear()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
    this.lost = true
    this.canvas.width = 0
    this.canvas.height = 0
  }

  setSource(name: string, image: TexImageSource | null, key: string, aspect: number): void {
    const gl = this.gl
    const known = this.sources.get(name)
    if (!image) {
      if (known) gl.deleteTexture(known.texture)
      this.sources.delete(name)
      return
    }
    if (known?.key === key) return
    const texture = known?.texture ?? (gl.createTexture() as WebGLTexture)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.sources.set(name, { texture, aspect, key })
  }

  /** The pictures, into the feedback (before the strips: the waves stay on top). */
  private drawSprites(sprites: Sprite[], aspect: number, lut: Uint8ClampedArray): void {
    const gl = this.gl
    const shown = sprites.filter((s) => s.alpha > 0.005 && s.size > 0 && this.sources.has(s.source))
    if (!shown.length) return
    gl.enable(gl.BLEND)
    gl.useProgram(this.sprite)
    gl.uniform1f(this.u(this.sprite, 'aspect'), aspect)
    gl.uniform1i(this.u(this.sprite, 'image'), 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindVertexArray(this.spriteVao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer)
    const corners = new Float32Array(16)
    for (const s of shown) {
      const source = this.sources.get(s.source)!
      const hh = s.size
      const hw = s.size * source.aspect
      const cos = Math.cos(s.angle)
      const sin = Math.sin(s.angle)
      const x = s.x * aspect
      let k = 0
      for (const [u, v, dx, dy] of [[0, 0, -hw, -hh], [1, 0, hw, -hh], [0, 1, -hw, hh], [1, 1, hw, hh]]) {
        corners[k++] = x + dx * cos - dy * sin
        corners[k++] = s.y + dx * sin + dy * cos
        corners[k++] = u
        corners[k++] = v
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, corners)
      const c = this.colour(lut, s.hue)
      gl.uniform4f(this.u(this.sprite, 'tint'), c[0], c[1], c[2], Math.min(1, s.alpha))
      gl.uniform1f(this.u(this.sprite, 'mixTint'), Math.min(1, Math.max(0, s.tint)))
      gl.blendFunc(gl.SRC_ALPHA, s.additive > 0.5 ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA)
      gl.bindTexture(gl.TEXTURE_2D, source.texture)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    gl.disable(gl.BLEND)
    gl.bindVertexArray(null)
  }

  private program(vs: string, fs: string): WebGLProgram {
    const gl = this.gl
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type) as WebGLShader
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`Drop shader: ${gl.getShaderInfoLog(shader)}`)
      return shader
    }
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Drop program: ${gl.getProgramInfoLog(program)}`)
    return program
  }

  private u(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    let table = this.uniforms.get(program)
    if (!table) this.uniforms.set(program, (table = new Map()))
    if (!table.has(name)) table.set(name, this.gl.getUniformLocation(program, name))
    return table.get(name) ?? null
  }

  private resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return
    const gl = this.gl
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
    for (const t of this.textures) gl.deleteTexture(t)
    for (const b of this.buffers) gl.deleteFramebuffer(b)
    this.textures = []
    this.buffers = []
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture() as WebGLTexture
      gl.bindTexture(gl.TEXTURE_2D, texture)
      if (this.half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      const buffer = gl.createFramebuffer() as WebGLFramebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.textures.push(texture)
      this.buffers.push(buffer)
    }
  }

  /** Play this preset from now on: the parameters glide from the one before (``blendSeconds``) - unless the
   * renderer drew nothing for a while, then it starts afresh from black. */
  use(def: DropDef, time: number): void {
    if (def === this.def) return
    const fresh = !this.def || this.lastTime < 0 || time < this.lastTime || time - this.lastTime > 1
    this.previous = fresh || !this.def ? null : { def: this.def, vars: this.vars }
    if (fresh) this.clear()
    this.def = def
    this.vars = {}
    this.blendStart = time
  }

  /** The feedback to black. */
  private clear(): void {
    const gl = this.gl
    for (const buffer of this.buffers) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  /** One frame: warp, draw, composite. Returns the canvas to draw (at ``scale`` of width x height). */
  render(frame: Frame, colors: { palette(): Uint8ClampedArray }, width: number, height: number, quality?: number): HTMLCanvasElement {
    const gl = this.gl
    const scale = Math.max(0.35, Math.min(1, quality ?? dropOptions.scale))
    // the feedback at most 1920 across (2560 for a video in 4K): beyond that it is only drawn larger
    const w = Math.max(2, Math.min(quality ? 2560 : 1920, Math.round(width * scale)))
    const h = Math.max(2, Math.min(quality ? 2560 : 1200, Math.round(height * scale)))
    this.resize(w, h)
    const m = this.listener.update(frame)
    m.aspect = w / h
    this.lastTime = m.time
    if (!this.def) return this.canvas
    let p = paramsOf(this.def, m, this.vars)
    if (this.previous) {
      const t = (m.time - this.blendStart) / Math.max(0.05, this.blendSeconds)
      if (t >= 1 || t < 0) this.previous = null
      else {
        const eased = t * t * (3 - 2 * t)
        p = mixParams(paramsOf(this.previous.def, m, this.previous.vars), p, eased)
      }
    }
    p = perFrame(p, m.dt)
    this.warpTime += m.dt * p.warpSpeed
    const aspect = w / h
    const next = 1 - this.current
    gl.viewport(0, 0, w, h)
    gl.disable(gl.BLEND)

    // 1. warp the last frame into the next one
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[next])
    gl.useProgram(this.warp)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.current])
    const wu = (name: string) => this.u(this.warp, name)
    gl.uniform1i(wu('prev'), 0)
    gl.uniform1f(wu('aspect'), aspect)
    gl.uniform1f(wu('zoom'), p.zoom)
    gl.uniform1f(wu('zoomExp'), p.zoomExp)
    gl.uniform1f(wu('rot'), p.rot)
    gl.uniform1f(wu('warp'), p.warp)
    gl.uniform1f(wu('warpTime'), this.warpTime)
    gl.uniform1f(wu('warpScale'), p.warpScale)
    gl.uniform1f(wu('decay'), p.decay)
    gl.uniform1f(wu('famA'), p.famA)
    gl.uniform1f(wu('famB'), p.famB)
    gl.uniform1f(wu('hueShift'), p.hueShift)
    gl.uniform1f(wu('wrap'), p.wrap)
    gl.uniform1f(wu('darkenCenter'), Math.min(1, Math.max(0, p.darkenCenter)))
    gl.uniform2f(wu('center'), p.cx, p.cy)
    gl.uniform2f(wu('drift'), p.dx, p.dy)
    gl.uniform2f(wu('stretch'), p.sx, p.sy)
    gl.uniform1i(wu('family'), Math.round(p.family))
    gl.bindVertexArray(this.quad)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // 2. draw on top: pictures, then motion vectors, shapes, waves (additive)
    const lut = colors.palette()
    this.drawSprites([...p.sprites, ...this.extraSprites], aspect, lut)
    this.count = 0
    if (p.mvec > 0 && p.mvAlpha > 0.01) this.motionVectors(p, aspect, lut)
    for (const shape of p.shapes) this.shape(shape, aspect, lut)
    for (const wave of p.waves) if (wave.alpha > 0.01) this.wave(wave, m, aspect, lut)
    if (this.count) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      gl.useProgram(this.draw)
      gl.uniform1f(this.u(this.draw, 'aspect'), aspect)
      gl.bindVertexArray(this.lines)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verts, 0, this.count * FLOATS)
      gl.drawArrays(gl.TRIANGLES, 0, this.count)
      gl.disable(gl.BLEND)
    }

    // 3. composite to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.useProgram(this.comp)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[next])
    const cu = (name: string) => this.u(this.comp, name)
    gl.uniform1i(cu('cur'), 0)
    gl.uniform1f(cu('aspect'), aspect)
    gl.uniform1f(cu('gamma'), p.gamma)
    gl.uniform1f(cu('echoAlpha'), p.echoAlpha)
    gl.uniform1f(cu('echoZoom'), p.echoZoom)
    gl.uniform1f(cu('invert'), p.invert)
    gl.uniform1f(cu('solarize'), p.solarize)
    gl.uniform1f(cu('vignette'), p.vignette)
    gl.uniform1i(cu('echoOrient'), Math.round(p.echoOrient))
    gl.uniform1i(cu('mirror'), Math.round(p.mirror))
    gl.bindVertexArray(this.quad)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
    this.current = next
    return this.canvas
  }

  // --- what is drawn on top ---------------------------------------------------------------------------

  private colour(lut: Uint8ClampedArray, hue: number): Rgb {
    const i = Math.floor((((hue % 1) + 1) % 1) * 255) * 3
    return [lut[i] / 255, lut[i + 1] / 255, lut[i + 2] / 255]
  }

  private vertex(x: number, y: number, c: Rgb, a: number): void {
    if (this.count >= MAX_VERTICES) return
    const o = this.count * FLOATS
    this.verts[o] = x
    this.verts[o + 1] = y
    this.verts[o + 2] = c[0]
    this.verts[o + 3] = c[1]
    this.verts[o + 4] = c[2]
    this.verts[o + 5] = a
    this.count++
  }

  /** A thick polyline as triangles (``closed``: back to the start). */
  private strip(xs: Float32Array, ys: Float32Array, n: number, thick: number, c: Rgb, a: number, closed: boolean): void {
    const half = thick / 2
    let px = 0
    let py = 0
    let qx = 0
    let qy = 0
    for (let i = 0; i < n; i++) {
      const j0 = closed ? (i - 1 + n) % n : Math.max(0, i - 1)
      const j1 = closed ? (i + 1) % n : Math.min(n - 1, i + 1)
      let nx = -(ys[j1] - ys[j0])
      let ny = xs[j1] - xs[j0]
      const len = Math.hypot(nx, ny) || 1
      nx = (nx / len) * half
      ny = (ny / len) * half
      const ax = xs[i] + nx
      const ay = ys[i] + ny
      const bx = xs[i] - nx
      const by = ys[i] - ny
      if (i > 0) {
        this.vertex(px, py, c, a)
        this.vertex(qx, qy, c, a)
        this.vertex(ax, ay, c, a)
        this.vertex(qx, qy, c, a)
        this.vertex(bx, by, c, a)
        this.vertex(ax, ay, c, a)
      }
      px = ax
      py = ay
      qx = bx
      qy = by
    }
    if (closed && n > 2) {
      const ax = xs[0] + (px - xs[n - 1])
      const ay = ys[0] + (py - ys[n - 1])
      const bx = xs[0] + (qx - xs[n - 1])
      const by = ys[0] + (qy - ys[n - 1])
      this.vertex(px, py, c, a)
      this.vertex(qx, qy, c, a)
      this.vertex(ax, ay, c, a)
      this.vertex(qx, qy, c, a)
      this.vertex(bx, by, c, a)
      this.vertex(ax, ay, c, a)
    }
  }

  private xs = new Float32Array(WAVE_POINTS)
  private ys = new Float32Array(WAVE_POINTS)

  private wave(w: Wave, m: Music, aspect: number, lut: Uint8ClampedArray): void {
    const c = this.colour(lut, w.hue)
    const n = w.mode === 5 ? 96 : w.mode === 3 || w.mode === 7 ? SPEC_BINS : 256
    const xs = this.xs
    const ys = this.ys
    const s = w.scale
    const span = aspect
    switch (w.mode) {
      case 0: // a circle the waveform swells
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const r = s * 0.5 * (0.7 + 0.45 * m.wave[i * 2])
          xs[i] = w.x * span + Math.cos(a) * r
          ys[i] = w.y + Math.sin(a) * r
        }
        this.strip(xs, ys, n, w.thick, c, w.alpha, true)
        return
      case 1: // left against right - and, as most songs are nearly mono there, the sound against itself a
        // moment later, which draws loops where left against right would be a line
        for (let i = 0; i < n; i++) {
          const l = m.left[i * 2]
          const r = m.right[i * 2]
          const later = m.wave[(i * 2 + 37) % WAVE_POINTS]
          const a = (l - r) * 0.7071 + m.wave[i * 2] * 0.5
          const b = (l + r) * 0.3535 + later * 0.5
          xs[i] = w.x * span + (a - b) * 0.7071 * s
          ys[i] = w.y + (a + b) * 0.7071 * s
        }
        this.strip(xs, ys, n, w.thick, c, w.alpha, false)
        return
      case 2: // across
      case 4: // two lines, left and right
        for (let line = 0; line < (w.mode === 4 ? 2 : 1); line++) {
          const source = w.mode === 4 ? (line ? m.right : m.left) : m.wave
          const y0 = w.mode === 4 ? w.y + (line ? -0.3 : 0.3) * s : w.y
          for (let i = 0; i < n; i++) {
            xs[i] = (i / (n - 1) * 2 - 1) * span
            ys[i] = y0 + source[i * 2] * s * 0.45
          }
          this.strip(xs, ys, n, w.thick, line ? this.colour(lut, w.hue + 0.25) : c, w.alpha, false)
        }
        return
      case 3: // the spectrum as a line, mirrored
        for (let i = 0; i < n; i++) {
          xs[i] = (i / (n - 1) * 2 - 1) * span
          ys[i] = w.y + m.spec[i] * s * 0.7
        }
        this.strip(xs, ys, n, w.thick, c, w.alpha, false)
        for (let i = 0; i < n; i++) ys[i] = w.y - m.spec[i] * s * 0.7
        this.strip(xs, ys, n, w.thick, this.colour(lut, w.hue + 0.15), w.alpha * 0.7, false)
        return
      case 5: // a ring of dots, the spectrum pushing them out
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + m.time * 0.2
          const r = s * 0.45 * (0.55 + m.spec[Math.floor((i / n) * SPEC_BINS * 0.8)])
          this.square(w.x * span + Math.cos(a) * r, w.y + Math.sin(a) * r, w.thick * 1.8, this.colour(lut, w.hue + i / n * 0.3), w.alpha)
        }
        return
      case 6: // standing
        for (let i = 0; i < n; i++) {
          ys[i] = i / (n - 1) * 2 - 1
          xs[i] = w.x * span + m.wave[i * 2] * s * 0.45
        }
        this.strip(xs, ys, n, w.thick, c, w.alpha, false)
        return
      case 7: // a spiral of the spectrum
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 6 + m.time * 0.6
          const r = (i / n) * s * 0.6 + m.spec[i] * 0.12
          xs[i] = w.x * span + Math.cos(a) * r
          ys[i] = w.y + Math.sin(a) * r
        }
        this.strip(xs, ys, n, w.thick, c, w.alpha, false)
        return
    }
  }

  private square(x: number, y: number, size: number, c: Rgb, a: number): void {
    const h = size / 2
    this.vertex(x - h, y - h, c, a)
    this.vertex(x + h, y - h, c, a)
    this.vertex(x - h, y + h, c, a)
    this.vertex(x + h, y - h, c, a)
    this.vertex(x + h, y + h, c, a)
    this.vertex(x - h, y + h, c, a)
  }

  /** A filled polygon (x, y in -1..1 across the screen; the radius in screen heights). */
  private shape(s: Shape, aspect: number, lut: Uint8ClampedArray): void {
    if (s.alpha < 0.01 && s.inner < 0.01) return
    const sides = Math.max(3, Math.min(64, Math.round(s.sides)))
    const c = this.colour(lut, s.hue)
    const edge = this.colour(lut, s.hue + 0.12)
    const x = s.x * aspect
    for (let i = 0; i < sides; i++) {
      const a0 = s.angle + (i / sides) * Math.PI * 2
      const a1 = s.angle + ((i + 1) / sides) * Math.PI * 2
      this.vertex(x, s.y, c, s.inner)
      this.vertex(x + Math.cos(a0) * s.radius, s.y + Math.sin(a0) * s.radius, edge, s.alpha)
      this.vertex(x + Math.cos(a1) * s.radius, s.y + Math.sin(a1) * s.radius, edge, s.alpha)
    }
  }

  /** A grid of short strokes along the flow: where each point moves next frame (zoom, rotation, drift). */
  private motionVectors(p: DropParams, aspect: number, lut: Uint8ClampedArray): void {
    const nx = Math.max(4, Math.round(p.mvec))
    const ny = Math.max(3, Math.round(nx / aspect))
    const c = this.colour(lut, 0.6)
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = ((i + 0.5) / nx * 2 - 1) * aspect
        const y = (j + 0.5) / ny * 2 - 1
        const dx = x - (p.cx * 2 - 1) * aspect
        const dy = y - (p.cy * 2 - 1)
        const z = Math.max(0.01, p.zoom)
        let fx = dx * z - dx + (-dy * p.rot) + p.dx * 2 * aspect
        let fy = dy * z - dy + (dx * p.rot) + p.dy * 2
        const len = Math.hypot(fx, fy)
        if (len < 1e-5) continue
        const k = Math.min(0.06, len * 6) / len
        fx *= k
        fy *= k
        const t = 0.0035
        const ox = (-fy / Math.hypot(fx, fy)) * t
        const oy = (fx / Math.hypot(fx, fy)) * t
        this.vertex(x - ox, y - oy, c, p.mvAlpha)
        this.vertex(x + ox, y + oy, c, p.mvAlpha)
        this.vertex(x + fx, y + fy, c, 0)
      }
    }
  }
}

let shared: DropRenderer | null | undefined
/** The one renderer every Drop visual shares (``null``: this browser has no WebGL2). */
export function dropRenderer(): DropRenderer | null {
  // a context the graphics card took back (a driver reset, too many at once): made anew
  if (shared?.lost) shared = undefined
  if (shared === undefined) {
    try {
      shared = new DropRenderer()
    } catch (error) {
      console.warn('Plenio Drop:', error)
      shared = null
    }
  }
  return shared
}
