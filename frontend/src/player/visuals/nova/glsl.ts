/**
 * Plenio Nova's GLSL (ES 3.00): what every visual has - the music, the colour scheme and a few tools - and the light
 * every picture goes through afterwards (the bloom, the tone curve, the lens).
 *
 * A visual writes ``vec3 image(vec2 p, vec2 uv)``: the light at a pixel, ``p`` centred (y from -1 to 1, x as far as
 * the picture is wide), ``uv`` 0..1 across it; in linear light, above 1 where it should glow. A visual that carries a
 * picture over writes ``vec4 next(vec2 uv)`` too: the new state from ``state``, the last one.
 *
 * The music (NovaMusic): ``bass``, ``mid``, ``treb``, ``level`` 0..1 (smoothed; 0 is silence, 0.8 loud); ``kick`` 0..1
 * when the bass jumps above its own recent average, gone in a moment; ``pulse`` 1 at a beat, falling to 0; ``beats``
 * counted; ``travel`` the way come (faster with the bass) and ``spin`` the turn made (faster with the mids); ``T`` the
 * seconds since the visual started. ``spec(x)`` and ``peak(x)``: the spectrum from low (0) to high (1), smoothed and
 * its peaks; ``wave(x)`` the waveform -1..1 (it goes round). ``pal(t)``: the colour scheme going round, in linear
 * light.
 */

/** The light in a picture of bytes (``LOW8``, no half floats): stored as the square root of an eighth, dithered;
 * read back squared. With half floats both are the light itself. */
export const CODEC = `
#ifdef LOW8
float ditherAt() { return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5; }
vec3 enc(vec3 c) { return sqrt(clamp(c, 0.0, 8.0) * 0.125) + ditherAt() / 255.0; }
vec3 dec(vec3 c) { return c * c * 8.0; }
float dec(float c) { return c * c * 8.0; }
#else
vec3 enc(vec3 c) { return c; }
vec3 dec(vec3 c) { return c; }
float dec(float c) { return c; }
#endif
`

/** The 8-bit path's define and the codec, put into a shader after its ``out vec4 o;``. */
export function withCodec(source: string, low8: boolean): string {
  const lines = source.split('\n')
  if (low8) lines.splice(1, 0, '#define LOW8 1')
  return lines.join('\n').replace('out vec4 o;', `out vec4 o;\n${CODEC}`)
}

export const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 a;
out vec2 uv;
void main() { uv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`

export const HEADER = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 R;
uniform float T, bass, mid, treb, level, kick, pulse, beats, travel, spin;
uniform sampler2D specTex, waveTex, palTex, state;
uniform vec2 S;
uniform float fresh, stepDt, lag;
// the cue (conductor.ts; 0 without a track): anticipation and impact around a strong onset, tension before a louder
// section, the beat's and the bar's phase, the section's energy
uniform float anticipation, impact, tension, beatPhase, barPhase, sectionEnergy;
// Q: the quality, 0.5 .. 1 (phase 7.2) - the march steps and the octaves a visual takes; the governor lowers it
// before it takes pixels away
uniform float Q;
#define QSTEPS(n) max(1, int(float(n) * Q + 0.5))
out vec4 o;
#define PI 3.14159265
#define TAU 6.28318531
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
vec3 pal(float t) { vec3 c = textureLod(palTex, vec2(t, 0.5), 0.0).rgb; return c * c; }
float spec(float x) { return textureLod(specTex, vec2(clamp(x, 0.0, 1.0) * 0.9921875 + 0.00390625, 0.5), 0.0).r; }
float peak(float x) { return textureLod(specTex, vec2(clamp(x, 0.0, 1.0) * 0.9921875 + 0.00390625, 0.5), 0.0).g; }
float wave(float x) { return textureLod(waveTex, vec2(x, 0.5), 0.0).r * 2.0 - 1.0; }
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 hash22(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec3 hash33(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
             mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { if (i >= 3 + int(2.0 * Q + 0.01)) break; s += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }
float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { if (i >= 2 + int(2.0 * Q + 0.01)) break; s += a * noise3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
vec3 look(vec3 from, vec3 to, vec2 p, float lens) {
  vec3 f = normalize(to - from), r = normalize(cross(vec3(0.0, 1.0, 0.0), f)), u = cross(f, r);
  return normalize(f * lens + r * p.x + u * p.y);
}
// A pixel's size in p (2 / the picture's height), and in a ray's angle through a lens of that length.
#define PX (2.0 / R.y)
// A star of a grid: f the pixel's place from the star's (in cells), r its size and px a pixel's (in cells). Soft and
// at least about a pixel wide, its light the same however small it is on screen - so it neither blinks nor hops from
// pixel to pixel as it moves; a grid finer than about two pixels a cell fades instead of sparkling. (A star sits at
// most 0.15 of a cell off its centre, so that its glow is not cut at the cell's edge.)
float starDot(vec2 f, float r, float px) {
  float w = max(r, 0.7 * px);
  return exp(-2.0 * dot(f, f) / (w * w)) * (r * r) / (w * w) * smoothstep(0.65, 0.45, px);
}
float starDot3(vec3 f, float r, float px) {
  float w = max(r, 0.7 * px);
  return exp(-2.0 * dot(f, f) / (w * w)) * (r * r) / (w * w) * smoothstep(0.65, 0.45, px);
}
`

/** After ``image``: the pixel's light, never NaN or endless (one bad pixel would spread through the bloom). */
export const IMAGE_MAIN = `
void main() {
  vec2 uv = gl_FragCoord.xy / R;
  vec2 p = (gl_FragCoord.xy * 2.0 - R) / R.y;
  vec3 c = image(p, uv);
  bvec3 bad = bvec3(isnan(c.x) || isinf(c.x), isnan(c.y) || isinf(c.y), isnan(c.z) || isinf(c.z));
  if (any(bad)) c = vec3(0.0);
  o = vec4(enc(clamp(c, 0.0, 64.0)), 1.0);
}`

export const STATE_MAIN = `
void main() {
  vec4 c = next(gl_FragCoord.xy / S);
  if (isnan(c.x) || isnan(c.y) || isnan(c.z) || isnan(c.w)) c = vec4(0.0);
  o = c;
}`

/** The bright parts at half size (a soft threshold), the first step of the bloom. The four pixels are weighed by
 * 1 / (1 + their brightness) (Karis): one tiny bright pixel - a star, a glint - does not make a glow that blinks as
 * it moves between pixels. */
export const PREFILTER_FS = `#version 300 es
precision highp float;
uniform sampler2D src;
uniform vec2 texel;
uniform float threshold;
in vec2 uv;
out vec4 o;
vec3 tap(vec2 at, inout float weight) {
  vec3 c = dec(texture(src, at).rgb);
  float w = 1.0 / (1.0 + max(c.r, max(c.g, c.b)));
  weight += w;
  return c * w;
}
void main() {
  float weight = 0.0;
  vec3 c = tap(uv + texel * vec2(-0.5, -0.5), weight) + tap(uv + texel * vec2(0.5, -0.5), weight)
         + tap(uv + texel * vec2(-0.5, 0.5), weight) + tap(uv + texel * vec2(0.5, 0.5), weight);
  c /= max(weight, 1e-4);
  float b = max(c.r, max(c.g, c.b));
  float knee = threshold * 0.6;
  float soft = clamp(b - threshold + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee + 1e-4);
  o = vec4(enc(c * max(soft, b - threshold) / max(b, 1e-4)), 1.0);
}`

/** Down a level: half the size, softly. */
export const DOWN_FS = `#version 300 es
precision highp float;
uniform sampler2D src;
uniform vec2 texel;
in vec2 uv;
out vec4 o;
void main() {
  vec3 c = dec(texture(src, uv).rgb) * 4.0;
  c += dec(texture(src, uv - texel).rgb) + dec(texture(src, uv + texel).rgb);
  c += dec(texture(src, uv + vec2(texel.x, -texel.y)).rgb) + dec(texture(src, uv - vec2(texel.x, -texel.y)).rgb);
  o = vec4(enc(c / 8.0), 1.0);
}`

/** Up a level: the smaller one spread wide, added to this one. */
export const UP_FS = `#version 300 es
precision highp float;
uniform sampler2D src, add;
uniform vec2 texel;
in vec2 uv;
out vec4 o;
void main() {
  vec3 c = dec(texture(src, uv + vec2(-2.0 * texel.x, 0.0)).rgb) + dec(texture(src, uv + vec2(2.0 * texel.x, 0.0)).rgb)
         + dec(texture(src, uv + vec2(0.0, -2.0 * texel.y)).rgb) + dec(texture(src, uv + vec2(0.0, 2.0 * texel.y)).rgb);
  c += 2.0 * (dec(texture(src, uv + vec2(-texel.x, texel.y)).rgb) + dec(texture(src, uv + vec2(texel.x, texel.y)).rgb)
            + dec(texture(src, uv + vec2(-texel.x, -texel.y)).rgb) + dec(texture(src, uv + vec2(texel.x, -texel.y)).rgb));
  o = vec4(enc(c / 12.0 + dec(texture(add, uv).rgb)), 1.0);
}`

/** To the screen: the picture with its glow, exposed, through a filmic tone curve (ACES), a touch of colour fringing
 * towards the edges that grows on the beat, a vignette, and fine grain against banding (still, so it does not crawl).
 * It is drawn two pixels wider and higher than the picture, those repeating its last column and row: the picture is
 * then scaled onto the screen from a larger canvas, and its edge pixels blend with these - never with what another
 * picture left beside it there. */
export const FINAL_FS = `#version 300 es
precision highp float;
uniform sampler2D scene, glow;
uniform vec2 R;
uniform float bloom, exposure, pulse, T, fringe;
out vec4 o;
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec2 at = min(gl_FragCoord.xy, R - 0.5);
  vec2 uv = at / R;
  vec2 d = uv - 0.5;
  float f = fringe * (0.35 + pulse) * dot(d, d);
  vec3 c = vec3(dec(texture(scene, uv - d * f).r), dec(texture(scene, uv).g), dec(texture(scene, uv + d * f).b));
  c += dec(texture(glow, uv).rgb) * bloom;
  c *= exposure * (1.0 + 0.1 * pulse);
  c = aces(c);
  float v = length(d * vec2(R.x / R.y, 1.0));
  c *= 1.0 - 0.32 * smoothstep(0.45, 1.15, v);
  c = pow(c, vec3(1.0 / 2.2));
  float n = fract(sin(dot(at, vec2(12.9898, 78.233))) * 43758.5453);
  o = vec4(c + (n - 0.5) * (1.5 / 255.0), 1.0);
}`
