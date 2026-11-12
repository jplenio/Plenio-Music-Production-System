/** What a visual draws its light into (phase 7.1): half floats by either extension, else bytes with the light kept
 * as its square root and dithered - and every Nova shader takes the codec. */
import { describe, expect, it } from 'vitest'

import { drawFormat } from '../src/player/visuals/gpu'
import { DOWN_FS, FINAL_FS, HEADER, IMAGE_MAIN, PREFILTER_FS, UP_FS, withCodec } from '../src/player/visuals/nova/glsl'

const context = (has: string[]) => ({ getExtension: (name: string) => (has.includes(name) ? {} : null) })

describe('the light’s pictures', () => {
  it('half floats on a desktop card, half floats on a phone, bytes without either', () => {
    expect(drawFormat(context(['EXT_color_buffer_float']) as never)).toBe('half')
    expect(drawFormat(context(['EXT_color_buffer_half_float']) as never)).toBe('half')
    expect(drawFormat(context([]) as never)).toBe('bytes')
  })

  it('in bytes the light is encoded and dithered; in half floats it is the light itself', () => {
    const low = withCodec(HEADER + 'vec3 image(vec2 p, vec2 uv) { return vec3(1.0); }' + IMAGE_MAIN, true)
    const high = withCodec(HEADER + 'vec3 image(vec2 p, vec2 uv) { return vec3(1.0); }' + IMAGE_MAIN, false)
    expect(low.split('\n')[0]).toBe('#version 300 es')
    expect(low.split('\n')[1]).toBe('#define LOW8 1')
    expect(high).not.toContain('#define LOW8')
    for (const source of [low, high]) expect(source).toContain('vec3 enc(vec3 c)')
    expect(IMAGE_MAIN).toContain('enc(')
    for (const pass of [PREFILTER_FS, DOWN_FS, UP_FS, FINAL_FS]) {
      expect(pass).toContain('out vec4 o;')
      expect(pass).toMatch(/dec\(texture\(/)
      expect(pass.match(/texture\(/g)?.length).toBe(pass.match(/dec\(texture\(/g)?.length)
    }
    for (const pass of [PREFILTER_FS, DOWN_FS, UP_FS]) expect(pass).toMatch(/o = vec4\(enc\(/)
  })

  it('the code is the same light back: sqrt(c / 8) squared times 8', () => {
    for (const c of [0, 0.01, 0.5, 1, 3.7, 8]) expect((Math.sqrt(c / 8) ** 2) * 8).toBeCloseTo(c, 9)
  })
})
