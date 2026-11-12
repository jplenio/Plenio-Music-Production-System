/**
 * One light (phase 7.7, PD §9.6): the finishing Plenio Nova gives its own pictures - a soft glow from the bright
 * parts, a tone curve that leaves the picture as drawn up to near white and rounds what would clip, a vignette and a fine still grain against
 * banding - as the last pass of every visual, so the classics, Plenio Drop and Nova look like one family.
 *
 * WebGL2 on a canvas of its own: the mixed picture goes in as a texture (its mipmaps are the glow), the finished one
 * comes out to be drawn over it. Nova's own scenes are already finished and pass by. Switched off in the visuals'
 * settings (*One light*), or where WebGL2 is missing, the picture stays as it was.
 */

const VS = `#version 300 es
layout(location = 0) in vec2 a;
out vec2 uv;
void main() { uv = a * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(a, 0.0, 1.0); }`

export const FINISH_FS = `#version 300 es
precision highp float;
uniform sampler2D picture;
uniform vec2 R;
uniform float glow, vignette, grain;
in vec2 uv;
out vec4 o;
vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toScreen(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main() {
  vec3 c = toLinear(texture(picture, uv).rgb);
  // the glow: the picture blurred (two of its smaller levels), only its bright parts
  vec3 soft = 0.5 * (toLinear(textureLod(picture, uv, 3.0).rgb) + toLinear(textureLod(picture, uv, 5.0).rgb));
  c += soft * glow * smoothstep(0.35, 0.9, luma(soft));
  // a shoulder above 0.8: what is below stays as drawn, what the glow pushes past white is rounded towards it
  vec3 over = max(c - 0.8, 0.0);
  c = min(c, vec3(0.8)) + 0.2 * (1.0 - exp(-over / 0.2));
  vec2 d = uv - 0.5;
  c *= 1.0 - vignette * smoothstep(0.35, 0.95, length(d * vec2(R.x / R.y, 1.0)));
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  o = vec4(toScreen(c) + n * grain / 255.0, 1.0);
}`

export interface FinishLook {
  glow: number
  vignette: number
  grain: number
}

/** The look of every visual: as Nova's, a little gentler (the classics were not drawn for a glow). */
export const ONE_LIGHT: FinishLook = { glow: 0.35, vignette: 0.22, grain: 1.5 }

export class Finisher {
  readonly canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext | null
  private program: WebGLProgram | null = null
  private texture: WebGLTexture | null = null
  lost = false

  constructor() {
    this.canvas = document.createElement('canvas')
    this.gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: false, antialias: false })
    if (!this.gl) return
    const gl = this.gl
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      this.lost = true
    })
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type) as WebGLShader
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VS))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FINISH_FS))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      this.gl = null
      return
    }
    this.program = program
    const quad = gl.createVertexArray()
    gl.bindVertexArray(quad)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    this.texture = gl.createTexture()
  }

  get ready(): boolean {
    return !!this.gl && !!this.program && !this.lost
  }

  /** The finished picture of ``source`` (``null``: it cannot be finished here - draw the source as it is). */
  finish(source: CanvasImageSource, w: number, h: number, look: FinishLook = ONE_LIGHT): HTMLCanvasElement | null {
    const gl = this.gl
    if (!gl || !this.program || this.lost || w < 2 || h < 2) return null
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.useProgram(this.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source as TexImageSource)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(this.program, 'picture'), 0)
    gl.uniform2f(gl.getUniformLocation(this.program, 'R'), w, h)
    gl.uniform1f(gl.getUniformLocation(this.program, 'glow'), look.glow)
    gl.uniform1f(gl.getUniformLocation(this.program, 'vignette'), look.vignette)
    gl.uniform1f(gl.getUniformLocation(this.program, 'grain'), look.grain)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    return this.canvas
  }
}

let shared: Finisher | null | undefined
/** The finisher the live picture shares (``null``: this browser has no WebGL2 for it). */
export function finisher(): Finisher | null {
  if (shared?.lost) shared = undefined
  if (shared === undefined) {
    try {
      const made = typeof document === 'undefined' ? null : new Finisher()
      shared = made?.ready ? made : null
    } catch {
      shared = null
    }
  }
  return shared
}

/** Whether the live picture gets the one light: on in the settings, and not a Nova scene alone (already finished). */
export function finishes(on: boolean, kind: string | undefined, mixing: boolean): boolean {
  return on && (kind !== 'nova' || mixing)
}
