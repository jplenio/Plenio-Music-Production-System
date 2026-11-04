function y(t) {
  if (typeof t != "object" || t === null) return null;
  const { timeline: r, score: e, bars: n } = t;
  return typeof r != "string" || typeof e != "string" || !Array.isArray(n) || !n.length || !n.every((o) => o === null || Number.isInteger(o) && o >= 0) ? null : { timeline: r, score: e, bars: n };
}
function A(t, r, e, n) {
  return t && r && t.timeline === r && t.score === e && t.bars.length === n ? t.bars : null;
}
function d(t, r) {
  let e = -1;
  for (let n = 0; n < t.measures.length && !(t.measures[n].onset > r); n++)
    e = n;
  return e;
}
function j(t, r, e, n) {
  return e.measures.map((o) => {
    for (const [i, f, u] of n) {
      const s = o.onset - u;
      if (s < 0 || s >= f - i) continue;
      const a = d(r, i + s);
      return a >= 0 ? t[a] ?? null : null;
    }
    return null;
  });
}
function B(t, r) {
  return Array.from({ length: r }, (e, n) => t[n] ?? null);
}
const m = (t) => t.join("|");
function w(t, r) {
  const e = r.length + 1, n = new Uint16Array((t.length + 1) * e);
  for (let u = t.length - 1; u >= 0; u--)
    for (let s = r.length - 1; s >= 0; s--)
      n[u * e + s] = t[u] === r[s] ? n[(u + 1) * e + s + 1] + 1 : Math.max(n[(u + 1) * e + s], n[u * e + s + 1]);
  const o = [];
  let i = 0, f = 0;
  for (; i < t.length && f < r.length; )
    t[i] === r[f] ? o.push([i++, f++]) : n[(i + 1) * e + f] >= n[i * e + f + 1] ? i++ : f++;
  return o;
}
function S(t, r, e) {
  const n = r.map(m), o = e.map(m), i = w(n, o);
  if (n.length !== o.length && i.length * 2 < Math.min(n.length, o.length)) return null;
  const f = new Array(o.length).fill(null), u = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), a = (l, c) => {
    f[c] = t[l] ?? null, u.add(l), s.add(c);
  };
  for (const [l, c] of i) a(l, c);
  const h = [[-1, -1], ...i, [n.length, o.length]];
  for (let l = 0; l + 1 < h.length; l++) {
    const c = h[l + 1][0] - h[l][0] - 1;
    if (c > 0 && c === h[l + 1][1] - h[l][1] - 1)
      for (let g = 1; g <= c; g++) a(h[l][0] + g, h[l][1] + g);
  }
  for (let l = 0; l < o.length; l++) {
    if (s.has(l)) continue;
    const c = n.findIndex((g, p) => !u.has(p) && g === o[l]);
    c >= 0 && a(c, l);
  }
  return f;
}
export {
  S as followContent,
  B as keepBars,
  y as parseBarSources,
  j as remapBars,
  A as validBars
};
