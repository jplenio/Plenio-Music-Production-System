/** Plenio Nova's skies: warp speed, a nebula, a black hole, a galaxy, northern lights over a lake, the sea under the
 * moon. */
import type { NovaDef } from './renderer'

const hyperspace: NovaDef = {
  id: 'nova-hyperspace',
  name: 'Hyperspace',
  blurb: 'Warp speed through a tunnel of stars - the bass on the throttle, a flash at its end on every beat',
  suits: ['energetic', 'electronic'],
  bloom: 1.1,
  exposure: 1,
  speed: [1.1, 2.6],
  image: `
vec3 image(vec2 p, vec2 uv) {
  p *= rot(spin * 0.15);
  float r = length(p);
  float a = atan(p.y, p.x) / TAU + 0.5;
  vec3 col = vec3(0.0);
  float near = smoothstep(0.04, 0.5, r);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float cells = 36.0 + fi * 30.0;
    float z = 0.45 / max(r, 0.002) + travel * (1.0 + 0.35 * fi) + fi * 11.3;
    vec2 g = vec2(a * cells, z * 1.6);
    vec2 id = floor(g);
    vec2 f = fract(g);
    id.x = mod(id.x, cells);
    float h = hash12(id + fi * 57.31);
    float on = step(0.6 - 0.2 * level, h);
    float x = 0.5 + (hash12(id + 3.17) - 0.5) * 0.7;
    float head = hash12(id + 9.71) * 0.6;
    float len = 0.1 + 0.6 * clamp(bass * 0.8 + kick, 0.0, 1.4);
    float t = (f.y - head) / len;
    // a streak no thinner than a pixel (its light kept), its head soft over a pixel - no pixel blinks as it passes
    float pxAcross = PX * cells / (TAU * max(r, 0.002));
    float pxAlong = 1.6 * 0.45 / max(r * r, 1e-4) * PX / len;
    float trail = smoothstep(-pxAlong, pxAlong, t) * pow(max(0.0, 1.0 - t), 1.6);
    float thin = 0.07 + 0.02 * fi;
    float wide = max(thin, 0.7 * pxAcross);
    float across = smoothstep(wide, 0.0, abs(f.x - x)) * thin / wide;
    vec3 c = mix(pal(h * 0.35 + fi * 0.13), vec3(1.0), 0.35 + 0.35 * treb);
    col += c * on * trail * across * (0.8 + 2.2 * treb + 0.8 * kick) * near;
  }
  float core = 0.01 / (r * r + 0.005);
  col += mix(pal(0.08), vec3(1.0), 0.45) * core * (0.25 + 0.5 * level + 1.2 * pulse);
  float z = 0.45 / max(r, 0.03) + travel * 0.7;
  vec2 ring = vec2(cos(a * TAU), sin(a * TAU)) * 1.7;
  float gas = fbm3(vec3(ring, z * 0.3));
  col += pal(0.5 + 0.3 * gas) * pow(gas, 3.5) * 0.45 * smoothstep(0.08, 0.9, r) * (0.4 + bass);
  return col;
}`,
}

const nebula: NovaDef = {
  id: 'nova-nebula',
  name: 'Nebula',
  blurb: 'Glowing gas and dark dust folding slowly into each other, a bright heart breathing with the bass, calm stars behind',
  suits: ['calm', 'dark', 'acoustic'],
  bloom: 0.9,
  exposure: 1.1,
  speed: [0.6, 1.2],
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec2 q = rot(T * 0.012 + spin * 0.02) * p * 0.85;
  float t = travel * 0.04;
  vec2 w1 = vec2(fbm(q * 1.3 + vec2(0.0, t)), fbm(q * 1.3 + vec2(5.2, 1.3 - t)));
  vec2 w2 = vec2(fbm(q * 1.7 + 3.2 * w1 + vec2(1.7, 9.2) + 0.05 * T), fbm(q * 1.7 + 3.2 * w1 + vec2(8.3, 2.8) - 0.04 * T));
  float n = fbm(q * 1.5 + 2.8 * w2);
  float dust = smoothstep(0.35, 0.75, fbm(q * 3.1 + 1.7 * w2 + 4.0));
  vec3 gas = mix(pal(0.62 + 0.25 * w1.x), pal(0.05 + 0.3 * n), smoothstep(0.3, 0.8, n));
  gas *= pow(n, 3.0) * (0.45 + 0.9 * mid) * (1.0 - 0.85 * dust);
  vec2 heart = vec2(0.25 * sin(T * 0.05), 0.15 * cos(T * 0.04));
  float glow = exp(-2.6 * length(q - heart)) * (0.12 + 0.45 * bass + 0.7 * kick);
  vec3 col = gas + mix(pal(0.08), vec3(1.0), 0.5) * glow * smoothstep(0.2, 0.9, n + 0.2);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float k = 40.0 + fi * 50.0;
    vec2 s = (p + vec2(travel * 0.01 * (fi + 1.0), 0.0)) * k;
    vec2 id = floor(s);
    vec2 f = fract(s) - 0.5;
    float h = hash12(id + fi * 17.0);
    vec2 jitter = (hash22(id + 3.0) - 0.5) * 0.3;
    float star = step(0.93, h) * starDot(f - jitter, 0.1, PX * k);
    col += mix(pal(h), vec3(1.0), 0.7) * star * (1.2 - fi * 0.3);
  }
  return col;
}`,
}

const blackHole: NovaDef = {
  id: 'nova-black-hole',
  name: 'Black hole',
  blurb: 'A black hole bends the light of the stars round itself, its glowing disk spinning faster and brighter with the bass',
  suits: ['dark', 'electronic', 'calm'],
  bloom: 1.2,
  exposure: 1,
  speed: [0.5, 1.8],
  image: `
// The stars behind (ang: a pixel's angle on this part of the sky - wider where the hole squeezes the sky together),
// steady: no star blinks with the highs.
vec3 sky(vec3 d, float ang) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float k = 140.0 + fi * 160.0;
    vec3 q = d * k;
    vec3 id = floor(q);
    vec3 f = fract(q) - 0.5;
    float h = hash13(id + fi * 13.0);
    float star = step(0.975, h) * starDot3(f, 0.16, ang * k) * (0.6 + 1.6 * hash13(id + 7.7));
    col += mix(pal(h * 3.0), vec3(1.0), 0.75) * star;
  }
  float band = exp(-pow(d.y * 3.5 + 0.35 * sin(d.x * 3.0 + d.z * 2.0), 2.0));
  col += pal(0.55 + 0.3 * fbm3(d * 2.5)) * band * 0.18 * fbm3(d * 5.0 + 3.0);
  return col * 1.1;
}
// One ray through pixel p, bent round the hole: the light it brings.
vec3 trace(vec2 p) {
  float ang = T * 0.04 + spin * 0.06;
  vec3 ro = vec3(sin(ang) * 11.0, 1.3 + 0.6 * sin(T * 0.031), cos(ang) * 11.0);
  vec3 rd = look(ro, vec3(0.0), p, 1.9);
  vec3 start = rd;
  vec3 pos = ro;
  vec3 col = vec3(0.0);
  float through = 1.0;
  for (int i = 0; i < 220; i++) { if (i >= QSTEPS(220)) break;
    float r = length(pos);
    float dt = clamp(0.06 * r, 0.025, 0.7);
    vec3 hv = cross(pos, rd);
    rd -= 1.5 * dot(hv, hv) * pos / pow(r, 5.0) * dt;
    vec3 next = pos + rd * dt;
    if (pos.y * next.y < 0.0) {
      vec3 hit = mix(pos, next, pos.y / (pos.y - next.y));
      float hr = length(hit.xz);
      if (hr > 2.3 && hr < 9.0) {
        float a = atan(hit.z, hit.x) - travel * 3.0 * pow(hr, -1.5);
        vec2 q = vec2(cos(a), sin(a)) * hr;
        float n = fbm(q * 1.6);
        float rings = 0.5 + 0.5 * sin(hr * 9.0 + n * 4.0);
        float dens = smoothstep(2.3, 3.0, hr) * smoothstep(9.0, 6.0, hr) * (0.35 + 0.65 * n) * (0.6 + 0.4 * rings);
        float temp = pow(3.0 / hr, 1.6);
        vec3 c = mix(pal(0.03 + 0.08 * n), vec3(1.0, 0.92, 0.82), clamp(temp * 0.6, 0.0, 1.0)) * temp * 1.5;
        vec3 vel = normalize(vec3(-hit.z, 0.0, hit.x));
        float dop = 1.0 + 0.55 * dot(vel, -normalize(rd));
        col += through * c * dens * dop * dop * dop * (0.5 + 0.9 * bass + 0.7 * kick);
        through *= 1.0 - clamp(dens * 0.85, 0.0, 0.95);
      }
    }
    pos = next;
    if (r < 1.0) {
      through = 0.0;
      break;
    }
    if (r > 40.0 || through < 0.02) break;
  }
  // the more a ray was bent, the more of the sky one pixel sees: its stars wider and fainter there, not glittering
  vec3 out_ = normalize(rd);
  float bent = 1.0 - dot(out_, start);
  return col + through * sky(out_, PX / 1.9 * (1.0 + 12.0 * bent));
}
vec3 image(vec2 p, vec2 uv) {
  return trace(p);
}`,
}

const galaxy: NovaDef = {
  id: 'nova-galaxy',
  name: 'Galaxy',
  blurb: 'A spiral galaxy turning, its bulge flaring with the bass and its arms brightening with the mids',
  suits: ['calm', 'acoustic'],
  bloom: 1,
  exposure: 1.05,
  speed: [0.5, 1],
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec2 q = rot(0.45 + spin * 0.03) * p;
  q.y /= 0.5 + 0.08 * sin(T * 0.05);
  q *= 1.05 - 0.06 * kick;
  float r = length(q);
  float a = atan(q.y, q.x);
  float turn = travel * 0.12;
  float arm = a - 2.6 * log(r + 0.04) + turn / (0.35 + r);
  float arms = pow(0.5 + 0.5 * cos(2.0 * arm), 4.0);
  float lanes = smoothstep(0.55, 0.85, 0.5 + 0.5 * cos(2.0 * arm - 0.6));
  float n = fbm(q * 4.0 + vec2(turn * 0.3, 0.0));
  float disk = exp(-r * 1.8);
  vec3 col = mix(pal(0.6), pal(0.85), n) * arms * disk * (0.9 + 1.4 * mid) * (0.3 + 1.2 * n * n) * 1.8;
  col *= 1.0 - 0.7 * lanes * smoothstep(0.1, 0.5, r) * n;
  float bulge = exp(-r * r * 22.0);
  col += mix(pal(0.08), vec3(1.0, 0.95, 0.85), 0.6) * (bulge * (1.6 + 2.5 * bass + 2.0 * kick) + exp(-r * 5.0) * 0.4);
  // the star clusters and the stars between them: steady points (a pixel's size in q: the squeeze of y widens it)
  vec2 s = q * 55.0;
  vec2 id = floor(s);
  float h = hash12(id);
  float squeeze = 1.0 / (0.5 + 0.08 * sin(T * 0.05));
  float blob = starDot(fract(s) - 0.5 - (hash22(id) - 0.5) * 0.3, 0.16, PX * 55.0 * squeeze);
  float density = arms * disk;
  col += mix(pal(h + 0.5), vec3(1.0), 0.6) * blob * step(0.975 - 0.7 * density, h) * 1.2 * (0.2 + 2.0 * density);
  vec2 b = p * 90.0;
  vec2 bid = floor(b);
  col += vec3(0.8) * step(0.985, hash12(bid + 9.0)) * starDot(fract(b) - 0.5, 0.18, PX * 90.0);
  return col;
}`,
}

const aurora: NovaDef = {
  id: 'nova-aurora',
  name: 'Northern lights',
  blurb: 'Curtains of light rippling over the stars, mirrored in a still lake below dark mountains - they flare with the mids',
  suits: ['calm', 'acoustic'],
  bloom: 0.8,
  exposure: 1.1,
  speed: [0.4, 0.8],
  image: `
vec3 curtain(vec3 rd) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 32; i++) { if (i >= QSTEPS(32)) break;
    float fi = float(i);
    float t = (1.0 + fi * 0.06) / max(rd.y, 0.04);
    vec2 q = rd.xz * t * 0.22 + vec2(T * 0.015, travel * 0.03);
    float n = noise(q * 1.2 + vec2(0.0, fi * 0.03));
    float m = noise(q * 2.7 - vec2(T * 0.05, fi * 0.02));
    float ribbon = pow(1.0 - abs(n * 2.0 - 1.0), 8.0) * (0.4 + 0.6 * m);
    acc += pal(0.28 + fi * 0.011 + 0.08 * sin(T * 0.07)) * ribbon * exp(-fi * 0.085);
  }
  return acc * 0.24 * (0.45 + 1.4 * mid + 0.6 * kick);
}
// The sky (ang: a pixel's angle - wider in the lake, whose ripples move the stars): steady stars, none blinking.
vec3 sky(vec3 rd, float ang) {
  vec3 col = mix(pal(0.6) * 0.03, vec3(0.002, 0.004, 0.012), smoothstep(0.0, 0.6, rd.y));
  vec3 s = rd * 260.0;
  vec3 id = floor(s);
  float h = hash13(id);
  col += vec3(0.9) * step(0.985, h) * starDot3(fract(s) - 0.5, 0.18, ang * 260.0);
  return col + curtain(rd) * smoothstep(0.0, 0.18, rd.y);
}
vec3 image(vec2 p, vec2 uv) {
  float horizon = -0.28;
  vec3 rd = normalize(vec3(p.x, p.y - horizon, 1.6));
  rd.xz = rot(T * 0.01 + spin * 0.02) * rd.xz;
  vec3 col;
  if (rd.y > 0.0) col = sky(rd, PX / 1.6);
  else {
    vec2 w = rd.xz / max(-rd.y, 0.02) * 0.6;
    vec3 m = vec3(rd.x, -rd.y, rd.z);
    m.xz += (vec2(noise(w * 3.0 + T * 0.3), noise(w * 3.0 - T * 0.25)) - 0.5) * 0.04 * (0.5 + bass);
    col = sky(normalize(m), PX / 1.6 * 3.0) * 0.55;
  }
  float hills = 0.04 + 0.13 * fbm(vec2(p.x * 1.4 + spin * 0.05, 2.0));
  float above = p.y - horizon;
  float land = smoothstep(hills + 0.004, hills - 0.004, abs(above)) * step(-hills - 0.004, above);
  col = mix(col, pal(0.6) * 0.004, land);
  return col;
}`,
}

const ocean: NovaDef = {
  id: 'nova-ocean',
  name: 'Moonlit sea',
  blurb: 'Waves rolling under a big moon, its light a glittering path on the water - the swell rises with the bass',
  suits: ['calm', 'acoustic'],
  bloom: 1,
  exposure: 1.1,
  speed: [0.6, 1],
  image: `
float sea(vec2 q) {
  float h = 0.0;
  float a = 0.22 + 0.28 * bass;
  float f = 0.3;
  vec2 d = vec2(0.8, 0.6);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float w = exp(sin(dot(d, q) * f + T * (0.8 + fi * 0.3) + fi * 1.3) - 1.0);
    h += a * w;
    q += d * w * a * 0.6;
    d = rot(1.27) * d;
    f *= 1.75;
    a *= 0.5;
  }
  return h;
}
// The night sky (ang: a pixel's angle - wider in the waves' reflection, where the stars move).
vec3 skyColor(vec3 rd, vec3 moon, float ang) {
  float y = max(rd.y, 0.0);
  vec3 col = mix(pal(0.62) * 0.15, pal(0.66) * 0.008, pow(y, 0.45));
  float m = dot(rd, moon);
  col += vec3(1.0, 0.96, 0.9) * smoothstep(0.9988, 0.9992, m) * 7.0;
  col += pal(0.1) * pow(max(m, 0.0), 40.0) * (0.3 + 0.5 * level + 0.6 * pulse);
  col += mix(pal(0.1), vec3(1.0), 0.6) * pow(max(m, 0.0), 500.0) * 0.9;
  vec3 s = rd * 220.0;
  vec3 id = floor(s);
  col += vec3(0.8) * step(0.988, hash13(id)) * starDot3(fract(s) - 0.5, 0.18, ang * 220.0) * smoothstep(0.05, 0.3, rd.y);
  float cloud = smoothstep(0.5, 0.9, fbm(rd.xz / max(rd.y, 0.05) * 0.5 + vec2(T * 0.01, 0.0)));
  col = mix(col, pal(0.6) * 0.05 + vec3(0.9) * pow(max(m, 0.0), 8.0) * 0.12, cloud * smoothstep(0.02, 0.2, rd.y) * 0.7);
  return col;
}
vec3 image(vec2 p, vec2 uv) {
  vec3 moon = normalize(vec3(0.0, 0.2, 1.0));
  vec3 ro = vec3(0.0, 2.2, travel * 2.0);
  vec3 rd = normalize(vec3(p.x, p.y - 0.1, 1.5));
  if (rd.y > 0.02) return skyColor(rd, moon, PX / 1.5);
  float t = 0.0;
  for (int i = 0; i < 96; i++) { if (i >= QSTEPS(96)) break;
    vec3 q = ro + rd * t;
    float d = q.y - sea(q.xz);
    if (d < 0.004 * t) break;
    t += max(0.05, d * 0.6);
    if (t > 140.0) break;
  }
  vec3 q = ro + rd * t;
  float e = 0.02 * (1.0 + t * 0.05);
  vec3 n = normalize(vec3(sea(q.xz - vec2(e, 0.0)) - sea(q.xz + vec2(e, 0.0)), 2.0 * e, sea(q.xz - vec2(0.0, e)) - sea(q.xz + vec2(0.0, e))));
  vec3 refl = reflect(rd, n);
  refl.y = abs(refl.y);
  float fres = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(n, -rd)), 5.0);
  vec3 water = pal(0.62) * 0.015 + pal(0.55) * 0.05 * smoothstep(0.1, 0.6, q.y);
  vec3 col = mix(water, skyColor(refl, moon, PX / 1.5 * 4.0), fres);
  col += vec3(1.0, 0.95, 0.85) * pow(max(0.0, dot(refl, moon)), 240.0) * 5.0 * (0.7 + level);
  col += pal(0.1) * pow(max(0.0, dot(refl, moon)), 12.0) * 0.3 * (0.5 + level);
  // the glitter of the moon's path, gone where its ripples are finer than a pixel (there it only crawled)
  float glitter = smoothstep(0.12, 0.04, t * PX / 1.5 / max(-rd.y, 0.02) * 18.0);
  col += vec3(1.0) * smoothstep(0.75, 1.0, noise(q.xz * 18.0 + T * 2.0)) * glitter * (0.3 + treb) * pow(max(0.0, dot(refl, moon)), 90.0) * 3.0;
  col = mix(col, skyColor(normalize(vec3(rd.x, 0.02, rd.z)), moon, PX / 1.5), 1.0 - exp(-t * 0.012));
  return col;
}`,
}

export const SPACE: NovaDef[] = [hyperspace, nebula, blackHole, galaxy, aurora, ocean]
