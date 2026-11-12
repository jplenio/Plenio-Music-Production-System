/** Plenio Nova's matter and light: liquid chrome, a sphere the spectrum shapes, ink in water, a reaction growing
 * patterns, a plasma globe, stained glass, lasers in smoke, a kaleidoscope, silk. */
import type { NovaDef } from './renderer'

const chrome: NovaDef = {
  id: 'nova-chrome',
  name: 'Liquid chrome',
  blurb: 'Blobs of liquid metal melting into each other in a studio of lights - the low ones swell with the bass, the others with the mids and highs',
  suits: ['electronic', 'energetic'],
  bloom: 0.9,
  exposure: 1.05,
  speed: [0.5, 1],
  image: `
float map(vec3 p) {
  float d = 1e9;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec3 c = vec3(sin(T * (0.31 + fi * 0.07) + fi * 1.7) * 1.5, cos(T * (0.27 + fi * 0.05) + fi * 2.3) * 0.9, sin(T * (0.23 + fi * 0.06) + fi) * 0.9);
    float band = fi < 2.0 ? bass : (fi < 4.0 ? mid : treb);
    float r = 0.42 + 0.38 * band + 0.18 * kick * step(fi, 1.5);
    d = smin(d, length(p - c) - r, 0.6);
  }
  return d;
}
vec3 env(vec3 d) {
  vec3 sky = mix(pal(0.6) * 0.7, vec3(1.3), smoothstep(0.05, 1.0, d.y));
  vec3 floor_ = mix(pal(0.75) * 0.1, pal(0.75) * 0.015, smoothstep(0.0, -0.8, d.y));
  vec3 c = mix(floor_, sky, smoothstep(-0.015, 0.015, d.y));
  float az = atan(d.z, d.x) / TAU + T * 0.01;
  c += mix(vec3(3.0), pal(floor(az * 4.0) * 0.25) * 4.0, 0.35) * smoothstep(0.1, 0.07, abs(fract(az * 4.0) - 0.5)) * smoothstep(0.1, 0.25, d.y) * smoothstep(0.75, 0.55, d.y);
  c += pal(0.08) * 3.0 * smoothstep(0.03, 0.0, abs(d.y - 0.02));
  return c;
}
vec3 image(vec2 p, vec2 uv) {
  float ang = T * 0.1 + spin * 0.1;
  vec3 ro = vec3(sin(ang) * 5.0, 0.6 + 0.4 * sin(T * 0.07), cos(ang) * 5.0);
  vec3 rd = look(ro, vec3(0.0), p, 1.9);
  vec3 col = env(rd) * 0.08 * exp(-dot(p, p) * 0.4);
  float t = 0.0;
  for (int i = 0; i < 80; i++) { if (i >= QSTEPS(80)) break;
    vec3 q = ro + rd * t;
    float d = map(q);
    if (d < 0.001) {
      vec2 e = vec2(0.001, -0.001);
      vec3 n = normalize(e.xyy * map(q + e.xyy) + e.yyx * map(q + e.yyx) + e.yxy * map(q + e.yxy) + e.xxx * map(q + e.xxx));
      float fres = 0.55 + 0.45 * pow(1.0 - max(0.0, dot(n, -rd)), 5.0);
      vec3 film = pal(dot(n, rd) * 0.6 + T * 0.03);
      col = env(reflect(rd, n)) * fres * mix(vec3(1.0), film * 1.5, 0.12) + film * 0.02;
      break;
    }
    t += d;
    if (t > 12.0) break;
  }
  return col;
}`,
}

const sphere: NovaDef = {
  id: 'nova-sphere',
  name: 'Sound sphere',
  blurb: 'A pearly sphere the spectrum shapes - the bass bulging its middle, the highs its poles - inside a ring of the waveform',
  suits: ['electronic', 'calm'],
  bloom: 0.9,
  exposure: 1.05,
  speed: [0.5, 1],
  image: `
float B[8];
float bands(float x) {
  float s = 0.0;
  float w = 0.0;
  for (int i = 0; i < 8; i++) { if (i >= QSTEPS(8)) break;
    float k = exp(-pow((x - float(i) / 7.0) * 6.0, 2.0));
    s += B[i] * k;
    w += k;
  }
  return s / w;
}
float map(vec3 p) {
  float r = length(p);
  vec3 n = p / max(r, 1e-4);
  float lat = acos(clamp(n.y, -1.0, 1.0)) / PI;
  float lon = atan(n.z, n.x);
  float band = bands(abs(lat - 0.5) * 2.0);
  float ripple = 0.5 + 0.5 * sin(lon * 5.0 + T * 1.3 + lat * 6.0) * sin(lat * 9.0 - T * 0.8);
  return (r - 1.0 - band * (0.15 + 0.18 * ripple) - 0.07 * kick) * 0.4;
}
vec3 image(vec2 p, vec2 uv) {
  for (int i = 0; i < 8; i++) B[i] = spec(float(i) / 7.0 * 0.78 + 0.02);
  float ang = T * 0.12 + spin * 0.15;
  vec3 ro = vec3(sin(ang) * 4.2, 0.9 * sin(T * 0.09), cos(ang) * 4.2);
  vec3 rd = look(ro, vec3(0.0), p, 1.9);
  float r = length(p);
  float w = wave(atan(p.y, p.x) / TAU + 0.5) * 0.08 * (0.5 + level);
  vec3 col = pal(0.62) * 0.03 * exp(-r) + pal(0.1) * smoothstep(0.012, 0.0, abs(r - 0.95 - w)) * (0.6 + 1.5 * pulse);
  float t = 2.0;
  for (int i = 0; i < 130; i++) { if (i >= QSTEPS(130)) break;
    vec3 q = ro + rd * t;
    float d = map(q);
    if (d < 0.001) {
      vec2 e = vec2(0.002, -0.002);
      vec3 n = normalize(e.xyy * map(q + e.xyy) + e.yyx * map(q + e.yyx) + e.yxy * map(q + e.yxy) + e.xxx * map(q + e.xxx));
      float ndv = max(0.0, dot(n, -rd));
      vec3 film = 0.5 + 0.5 * cos(TAU * (ndv * 1.6 + vec3(0.0, 0.33, 0.67) + T * 0.05));
      vec3 base = mix(pal(0.6 + 0.3 * length(q)), film * film, 0.5);
      vec3 light = normalize(vec3(0.5, 0.8, 0.3));
      float diff = max(0.0, dot(n, light));
      float shine = pow(max(0.0, dot(reflect(rd, n), light)), 40.0);
      col = base * (0.12 + 0.9 * diff) + vec3(1.0) * shine * 1.2 + pal(0.1) * pow(1.0 - ndv, 3.0) * (0.6 + 1.2 * mid);
      break;
    }
    t += d;
    if (t > 9.0) break;
  }
  return col;
}`,
}

const ink: NovaDef = {
  id: 'nova-ink',
  name: 'Ink in water',
  blurb: 'Three inks poured into swirling water - one fed by the bass, one by the mids, one by the highs - mixing for as long as the song plays',
  suits: ['calm', 'acoustic'],
  bloom: 0.6,
  exposure: 1,
  speed: [0.5, 1],
  state: {
    rate: 60,
    height: 360,
    code: `
float pot(vec2 q) { return noise(q) + 0.5 * noise(q * 2.1 + 3.3) + 0.25 * noise(q * 4.3 - 1.7); }
vec2 flow(vec2 q) {
  float e = 0.02;
  float a = pot(q + vec2(0.0, e));
  float b = pot(q - vec2(0.0, e));
  float c = pot(q + vec2(e, 0.0));
  float d = pot(q - vec2(e, 0.0));
  return vec2(a - b, d - c) / (2.0 * e);
}
vec4 next(vec2 uv) {
  if (fresh > 0.5) return vec4(0.0, 0.0, 0.0, 1.0);
  float aspect = S.x / S.y;
  vec2 q = vec2(uv.x * aspect, uv.y);
  vec2 v = flow(q * 2.2 + vec2(0.0, T * 0.04)) * (0.05 + 0.12 * mid + 0.1 * kick);
  vec2 back = uv - vec2(v.x / aspect, v.y) * stepDt;
  vec3 c = textureLod(state, back, 0.0).rgb * exp(-stepDt * 0.25);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 src = vec2(0.5 * aspect + 0.33 * aspect * sin(T * (0.13 + fi * 0.05) + fi * 2.1), 0.5 + 0.3 * cos(T * (0.11 + fi * 0.07) + fi * 1.3));
    float amount = i == 0 ? bass + kick : (i == 1 ? mid : treb * 1.3);
    float rad = 0.02 + 0.05 * amount;
    vec2 d = q - src;
    c += pal(fi * 0.33 + T * 0.01) * exp(-dot(d, d) / (rad * rad)) * amount * stepDt * 7.0;
  }
  return vec4(min(c, vec3(6.0)), 1.0);
}`,
  },
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec2 e = 1.0 / S;
  vec3 c = textureLod(state, uv, 0.0).rgb;
  float l = dot(textureLod(state, uv + vec2(e.x, 0.0), 0.0).rgb - textureLod(state, uv - vec2(e.x, 0.0), 0.0).rgb, vec3(0.333));
  float m = dot(textureLod(state, uv + vec2(0.0, e.y), 0.0).rgb - textureLod(state, uv - vec2(0.0, e.y), 0.0).rgb, vec3(0.333));
  vec3 n = normalize(vec3(-l * 3.0, -m * 3.0, 1.0));
  float sheen = pow(max(0.0, dot(n, normalize(vec3(0.35, 0.45, 1.0)))), 30.0);
  return (1.0 - exp(-c * 1.4)) * 1.2 + vec3(sheen) * 0.5 * min(1.0, length(c)) + pal(0.62) * 0.012;
}`,
}

const turing: NovaDef = {
  id: 'nova-turing',
  name: 'Living patterns',
  blurb: 'Spots, stripes and coral growing by themselves as in nature’s own chemistry - the mids feed them, every beat sows new ones',
  suits: ['calm', 'dark', 'electronic'],
  bloom: 0.6,
  exposure: 1,
  speed: [0.5, 1],
  state: {
    rate: 420,
    height: 256,
    wrap: true,
    code: `
vec4 next(vec2 uv) {
  vec2 e = 1.0 / S;
  if (fresh > 0.5) {
    float seed = step(0.86, hash12(floor(uv * S / 7.0)));
    return vec4(1.0, seed * 0.9, 0.0, 1.0);
  }
  vec2 c = textureLod(state, uv, 0.0).rg;
  vec2 lap = -c;
  lap += 0.2 * (textureLod(state, uv + vec2(e.x, 0.0), 0.0).rg + textureLod(state, uv - vec2(e.x, 0.0), 0.0).rg + textureLod(state, uv + vec2(0.0, e.y), 0.0).rg + textureLod(state, uv - vec2(0.0, e.y), 0.0).rg);
  lap += 0.05 * (textureLod(state, uv + e, 0.0).rg + textureLod(state, uv - e, 0.0).rg + textureLod(state, uv + vec2(e.x, -e.y), 0.0).rg + textureLod(state, uv - vec2(e.x, -e.y), 0.0).rg);
  float a = c.r;
  float b = c.g;
  float feed = 0.034 + 0.012 * uv.y + 0.006 * mid;
  float kill = 0.0605 + 0.004 * uv.x;
  float abb = a * b * b;
  a += lap.x - abb + feed * (1.0 - a);
  b += 0.5 * lap.y + abb - (kill + feed) * b;
  vec2 drop = hash22(vec2(beats, 3.7));
  vec2 d = (uv - drop) * vec2(S.x / S.y, 1.0);
  b = max(b, smoothstep(0.03, 0.0, length(d)) * pulse * 0.9);
  return vec4(clamp(a, 0.0, 1.0), clamp(b, 0.0, 1.0), 0.0, 1.0);
}`,
  },
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec2 e = 1.0 / S;
  float b = textureLod(state, uv, 0.0).g;
  float bx = textureLod(state, uv + vec2(e.x, 0.0), 0.0).g - textureLod(state, uv - vec2(e.x, 0.0), 0.0).g;
  float by = textureLod(state, uv + vec2(0.0, e.y), 0.0).g - textureLod(state, uv - vec2(0.0, e.y), 0.0).g;
  vec3 n = normalize(vec3(-bx * 6.0, -by * 6.0, 1.0));
  vec3 light = normalize(vec3(-0.4, 0.6, 0.7));
  float diff = max(0.0, dot(n, light));
  float shine = pow(max(0.0, dot(reflect(-light, n), vec3(0.0, 0.0, 1.0))), 20.0);
  float m = smoothstep(0.12, 0.35, b);
  vec3 base = mix(pal(0.62) * 0.03, pal(0.08 + b * 0.5 + 0.05 * sin(T * 0.1)), m);
  return base * (0.35 + 0.9 * diff) + vec3(1.0) * shine * m * 0.5 + pal(0.1) * m * pulse * 0.4;
}`,
}

const tesla: NovaDef = {
  id: 'nova-tesla',
  name: 'Plasma globe',
  blurb: 'Lightning crawling from the core to the glass of a plasma globe - each arc a band of the spectrum, wilder with the highs',
  suits: ['energetic', 'dark'],
  bloom: 1.1,
  exposure: 1,
  speed: [0.5, 1],
  image: `
vec3 image(vec2 p, vec2 uv) {
  float r = length(p);
  float a = atan(p.y, p.x);
  float R0 = 0.82;
  float inside = smoothstep(R0 + 0.01, R0 - 0.01, r);
  vec3 col = pal(0.62) * (smoothstep(0.025, 0.0, abs(r - R0)) * 0.5 + pow(clamp(r / R0, 0.0, 1.0), 6.0) * inside * 0.15);
  col += vec3(1.0) * smoothstep(0.06, 0.0, length(p - vec2(-0.32, 0.38)) - 0.03) * 0.25;
  for (int i = 0; i < 9; i++) { if (i >= QSTEPS(9)) break;
    float fi = float(i);
    float energy = spec(fi / 9.0 * 0.75 + 0.03);
    float base = fi / 9.0 * TAU + 0.7 * sin(T * (0.21 + 0.05 * fi) + fi * 1.9) + spin * 0.3;
    float wob = (fbm(vec2(r * 3.5 - T * 1.8 - fi * 0.37, fi * 7.3 + T * 0.4)) - 0.5) * (1.4 + 2.2 * treb) * r;
    float da = abs(mod(a - base - wob + PI, TAU) - PI);
    float d = da * max(r, 0.05);
    float strength = (0.35 + 1.6 * energy * energy + 0.8 * kick) * inside;
    col += mix(pal(0.55 + fi * 0.04), vec3(1.0), 0.55) * strength * 0.0022 / (d + 0.0018);
  }
  col += mix(pal(0.5), vec3(1.0), 0.6) * 0.008 / (r * r + 0.008) * (0.5 + level + pulse);
  return col;
}`,
}

const glass: NovaDef = {
  id: 'nova-glass',
  name: 'Stained glass',
  blurb: 'A window of living stained glass - every pane lights up with its own band of the spectrum, the lead glowing on the beat',
  suits: ['energetic', 'electronic', 'acoustic'],
  bloom: 0.8,
  exposure: 1,
  speed: [0.6, 1.2],
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec2 q = p * (2.4 + 0.3 * sin(T * 0.05)) + vec2(0.0, travel * 0.12);
  vec2 g = floor(q);
  vec2 f = fract(q);
  float d1 = 8.0;
  float d2 = 8.0;
  vec2 best = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash22(g + o);
      vec2 pt = o + 0.5 + 0.4 * sin(T * 0.4 + TAU * h);
      float d = length(pt - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        best = g + o;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  float edge = d2 - d1;
  float h = hash12(best);
  float e = spec(h * 0.85);
  vec3 pane = pal(h + 0.08 * sin(T * 0.1)) * (0.08 + 1.9 * e * e);
  float bevel = smoothstep(0.0, 0.22, edge);
  vec3 col = pane * (0.55 + 0.45 * bevel) + pane * pow(1.0 - bevel, 4.0) * 0.8;
  col *= smoothstep(0.03, 0.07, edge);
  col += mix(pal(0.1), vec3(1.0), 0.3) * (1.0 - smoothstep(0.0, 0.025, edge)) * (0.03 + 0.9 * pulse);
  return col;
}`,
}

const lasers: NovaDef = {
  id: 'nova-lasers',
  // a signature (phase 7.9): tuned for the Director's cue
  cue: { lean: 0.06, flash: 0.6, build: 0.3 },
  name: 'Laser show',
  blurb: 'Laser fans sweeping through stage smoke, each beam a band of the spectrum - a new formation every eight beats',
  suits: ['energetic', 'electronic'],
  bloom: 1.1,
  exposure: 1,
  speed: [0.5, 1],
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec3 col = vec3(0.0);
  float smoke = 0.35 + 0.9 * fbm(p * 1.4 + vec2(T * 0.07, -T * 0.12));
  float formation = floor(beats / 8.0);
  float wide = R.x / R.y;
  for (int s = 0; s < 3; s++) {
    float fs = float(s);
    vec2 src = vec2((fs - 1.0) * 0.55 * wide, -1.05);
    vec3 c = pal(fs * 0.33 + formation * 0.17);
    for (int j = 0; j < 6; j++) {
      float fj = float(j);
      float h = hash12(vec2(fj + fs * 7.0, formation));
      float spread = 0.12 + 0.06 * sin(T * 0.5 + fs);
      float angle = 1.5708 + (fj - 2.5) * spread + 0.45 * sin(T * (0.35 + 0.5 * h) + h * 6.28 + fs);
      vec2 dir = vec2(cos(angle), sin(angle));
      vec2 rel = p - src;
      float along = dot(rel, dir);
      float d = abs(rel.x * dir.y - rel.y * dir.x);
      float energy = spec(fract(h + fs * 0.31) * 0.8 + 0.05);
      float beam = (0.00045 / (d * d + 0.00045) * 0.5 + 0.004 / (d + 0.004) * 0.25 * smoke) * step(0.0, along) * exp(-along * 0.35);
      col += c * beam * (0.3 + 2.2 * energy * energy) * (0.8 + 0.6 * treb);
    }
    col += c * 0.02 / (dot(p - src, p - src) + 0.02) * (0.4 + pulse);
  }
  return col + pal(0.6) * smoke * 0.03 * (0.4 + bass);
}`,
}

const mandala: NovaDef = {
  id: 'nova-mandala',
  // a signature (phase 7.9): tuned for the Director's cue
  cue: { lean: 0.08, flash: 0.35, build: 0.3 },
  name: 'Mandala',
  blurb: 'An endless kaleidoscope of fractal lace, folding and blooming with the bass, its finest threads lit by the highs',
  suits: ['calm', 'electronic'],
  bloom: 0.8,
  exposure: 1,
  speed: [0.5, 1],
  image: `
vec3 kali(vec2 q) {
  q = rot(spin * 0.25) * q;
  float n = 8.0;
  float a = mod(atan(q.y, q.x), TAU / n);
  a = abs(a - PI / n);
  q = length(q) * vec2(cos(a), sin(a));
  // breathing with the bass (smoothed) - a jump on every kick made the whole lace shiver
  float zoom = 1.15 - 0.08 * bass;
  q *= zoom;
  // a pixel's size here, followed through the folds: the lace that grows finer than a pixel gives its average light
  // instead of a noise that crawls from frame to frame, and the threads are never thinner than a pixel
  float fp = PX * 0.5 * zoom;
  vec2 c = vec2(0.82 + 0.05 * sin(T * 0.07), 0.62 + 0.05 * cos(T * 0.05) + 0.06 * bass);
  float acc = 0.0;
  float trap = 1e3;
  float trapPx = 0.0;
  for (int i = 0; i < 11; i++) { if (i >= QSTEPS(11)) break;
    float m = max(dot(q, q), 1e-4);
    q = abs(q) / m - c;
    fp /= m;
    acc += mix(0.12, exp(-length(q) * 3.0), smoothstep(0.5, 0.12, fp));
    float y = abs(q.y);
    if (y < trap) {
      trap = y;
      trapPx = fp;
    }
  }
  vec3 col = pal(acc * 0.11 + T * 0.02) * pow(acc * 0.1, 1.6);
  float w = max(0.025, trapPx);
  return col + mix(pal(0.1 + trap), vec3(1.0), 0.4) * exp(-trap / w) * (0.025 / w) * (0.15 + 0.9 * treb);
}
vec3 image(vec2 p, vec2 uv) {
  vec2 o = vec2(0.5) / R.y;
  return (kali(p + o * vec2(-1.0, -1.0)) + kali(p + o * vec2(1.0, -1.0)) + kali(p + o * vec2(-1.0, 1.0)) + kali(p + o)) * 0.25;
}`,
}

const silk: NovaDef = {
  id: 'nova-silk',
  // a signature (phase 7.9): tuned for the Director's cue
  cue: { lean: 0.05, flash: 0.25, build: 0.25 },
  name: 'Silk',
  blurb: 'Ribbons of silk drifting in the dark, catching the light as they turn - soft and slow, rippling with the spectrum',
  suits: ['calm', 'acoustic'],
  bloom: 0.8,
  exposure: 1.1,
  speed: [0.5, 1],
  image: `
vec3 image(vec2 p, vec2 uv) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float phase = T * (0.25 + fi * 0.04) + fi * 1.9;
    float amp = 0.25 + 0.2 * sin(fi * 2.3 + T * 0.1);
    float k = 1.3 + fi * 0.21;
    float y = amp * sin(p.x * k + phase) + 0.12 * sin(p.x * (3.1 + fi * 0.4) - phase * 1.3) * (0.4 + spec(fi / 7.0 * 0.7 + 0.05) * 1.6) + (fi - 3.0) * 0.07;
    float width = 0.03 + 0.06 * (0.5 + 0.5 * sin(p.x * 1.7 + phase * 0.7)) * (0.6 + mid);
    float d = abs(p.y - y);
    float body = smoothstep(width, 0.0, d);
    float sheen = pow(0.5 + 0.5 * cos(p.x * k + phase), 3.0);
    vec3 c = pal(fi * 0.11 + T * 0.015);
    col += c * body * (0.25 + 1.4 * sheen) * 0.6 + c * 0.004 / (d + 0.004) * 0.08 * (0.5 + level);
  }
  return col;
}`,
}

export const MATTER: NovaDef[] = [chrome, sphere, ink, turing, tesla, glass, lasers, mandala, silk]
