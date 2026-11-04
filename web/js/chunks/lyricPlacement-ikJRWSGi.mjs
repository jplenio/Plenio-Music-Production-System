function T(r) {
  return typeof r == "number" && Number.isFinite(r) && Math.abs(r) <= 10 ? Math.round(r * 1e3) / 1e3 : 0;
}
function S(r, n) {
  return `${r}:${n}`;
}
function W(r) {
  const n = /^(\d+):(\d+)$/.exec(r);
  return n ? { block: Number(n[1]), line: Number(n[2]) } : null;
}
const B = 512;
function E(r) {
  if (!Array.isArray(r)) return [];
  const n = [];
  for (const t of r) {
    if (!Array.isArray(t) || t.length === 3 || t.length < 2 || t.length > 4 + B || !t.every((i) => Number.isInteger(i) && i >= 0)) continue;
    const [a, f] = t;
    if (f <= a) continue;
    if (t.length === 2) {
      n.push([a, f]);
      continue;
    }
    const o = t.slice(4), s = o.every((i, p) => i >= a && i < f && (p === 0 || i >= o[p - 1]));
    n.push([a, f, t[2], t[3], ...s ? o : []]);
  }
  return n.sort((t, a) => t[0] - a[0] || t[1] - a[1] || (t[2] ?? -1) - (a[2] ?? -1) || (t[3] ?? -1) - (a[3] ?? -1));
}
function X(r, n) {
  return r.length === n.length && r.every((t, a) => t.length === n[a].length && t.every((f, o) => f === n[a][o]));
}
function G(r, n) {
  return r.parts.find((t) => t.block === n);
}
function H(r, n) {
  return r.parts.find((t) => n >= t.start && n < t.end);
}
function v(r) {
  return r.syllables.length > 0 || r.pinned;
}
function R(r, n, t) {
  let a = 0, f = t;
  for (const o of r.parts) {
    const s = o.lines.filter(v);
    !s.length || o.block === n || (o.block < n ? a = Math.max(a, ...s.map((i) => Math.max(i.end, i.start + 1))) : f = Math.min(f, ...s.map((i) => i.start)));
  }
  return [a, Math.max(f, a + 1)];
}
function j(r, n, t, a, f) {
  const o = G(r, n), [s, i] = a, p = new Map((o?.lines ?? []).map((l) => [l.line, l])), h = [];
  let c = o ? Math.max(o.start, s) : s;
  return t.forEach((l, M) => {
    const k = p.get(M);
    if (k && v(k)) {
      const u = Math.min(Math.max(k.start, s), i - 1), m = Math.min(Math.max(k.end, u + 1), i);
      h.push({ id: String(M), text: l, start: u, end: m }), c = m;
    } else {
      const u = Math.min(Math.max(c, s), i);
      h.push({ id: String(M), text: l, start: u, end: u });
    }
  }), h;
}
function q(r, n) {
  const [t, a] = n, o = r.map((s, i) => {
    const p = Math.min(Math.max(s.start, t), Math.max(t, a - 1)), h = s.end > s.start ? Math.min(Math.max(s.end, p + 1), a) : p;
    return { line: { ...s, start: p, end: h }, index: i, placed: s.id.startsWith("*") };
  }).sort((s, i) => s.line.start - i.line.start || Number(i.placed) - Number(s.placed) || s.index - i.index).map((s) => s.line);
  for (let s = 0; s + 1 < o.length; s++) {
    const i = o[s + 1];
    o[s].end > i.start && (o[s].end = Math.max(i.start, o[s].start));
  }
  return o;
}
function F(r) {
  return (r?.parts ?? []).flatMap(
    (n) => n.lines.filter((t) => v(t) && t.end > t.start).map((t) => ({ key: S(t.block, t.line), block: t.block, line: t.line, start: t.start, end: t.end, text: t.text }))
  ).sort((n, t) => n.start - t.start || n.block - t.block || n.line - t.line);
}
function z(r, n, t = /* @__PURE__ */ new Set()) {
  for (const a of n) {
    const f = r.find((o) => !t.has(o.key) && o.start < a.end && a.start < o.end);
    if (f) return f;
  }
  return null;
}
function C(r, n, t, a = 1) {
  const f = r.parts.flatMap((e) => e.lines.map((d) => ({ ...d, key: S(d.block, d.line) }))), o = n.kind === "move" ? new Set(n.keys) : /* @__PURE__ */ new Set([n.key]), s = f.filter((e) => o.has(e.key) && e.text).map((e) => ({ key: e.key, block: e.block, start: e.start, end: e.end > e.start ? e.end : Math.min(t, e.start + Math.max(1, a)) })), i = F(r).filter((e) => !o.has(e.key)), p = { moves: [], free: !0, stoppedAt: null };
  if (!s.length) return p;
  const h = (e) => {
    let d = 0, x = t;
    for (const g of i)
      g.block < e ? d = Math.max(d, g.end) : g.block > e && (x = Math.min(x, g.start));
    return [d, Math.max(d, x)];
  };
  if (n.kind !== "move") {
    const e = s[0], [d, x] = h(e.block);
    if (n.kind === "end") {
      const b = i.filter((L) => L.start >= e.start).sort((L, _) => L.start - _.start)[0], w = Math.min(x, b ? b.start : t), N = e.end + n.delta, O = Math.max(e.start + 1, Math.min(N, w));
      return { moves: [{ key: e.key, start: e.start, end: O }], free: O === N, stoppedAt: N > w && b && b.start === w ? b : null };
    }
    const g = i.filter((b) => b.end <= e.end).sort((b, w) => w.end - b.end)[0], A = Math.max(d, g ? g.end : 0), $ = e.start + n.delta, I = Math.min(e.end - 1, Math.max($, A));
    return {
      moves: [{ key: e.key, start: I, end: e.end }],
      free: I === $,
      stoppedAt: $ < A && g && g.end === A ? g : null
    };
  }
  let c = -1 / 0, l = 1 / 0;
  for (const e of s) {
    const [d, x] = h(e.block);
    c = Math.max(c, d - e.start), l = Math.min(l, x - e.end);
  }
  const M = i.flatMap((e) => s.map((d) => ({ other: e, from: e.start - d.end, to: e.end - d.start }))), k = (e) => e >= c && e <= l && !M.some((d) => e > d.from && e < d.to), u = n.delta, m = [u, 0, c, l, ...M.flatMap((e) => [e.from, e.to])].filter((e) => Number.isFinite(e) && k(e));
  if (!m.length) return { moves: [], free: !1, stoppedAt: null };
  const y = m.reduce((e, d) => {
    const x = Math.abs(d - u) - Math.abs(e - u);
    return x < 0 || x === 0 && Math.abs(d) < Math.abs(e) ? d : e;
  }), K = y === u ? null : M.find((e) => u > e.from && u < e.to)?.other ?? null;
  return {
    moves: y ? s.map((e) => ({ key: e.key, start: e.start + y, end: e.end + y })) : [],
    free: y === u,
    stoppedAt: K
  };
}
function D(r, n, t, a, f = 4 * Math.max(1, t)) {
  const o = H(r, Math.min(Math.max(0, n), Math.max(0, a - 1)));
  if (!o) return null;
  const s = F(r);
  if (s.some((m) => n >= m.start && n < m.end)) return null;
  const i = [
    Math.max(0, ...s.filter((m) => m.end <= n).map((m) => m.end)),
    Math.min(a, ...s.filter((m) => m.start > n).map((m) => m.start))
  ], [, p] = R(r, o.block, a), h = Math.max(1, t);
  let c = Math.max(i[0], Math.floor(n / h) * h);
  const l = o.phrases.find(([m, y]) => n >= m && n < y);
  l && !s.some((m) => m.start < l[1] && m.end > l[0]) && (c = Math.max(i[0], l[0]));
  const M = o.phrases.find(([m, y]) => y > c && m <= c) ?? o.phrases.find(([m]) => m > c), k = Math.min(M ? M[1] : c + Math.max(1, f), i[1], p, a);
  if (k <= c) return null;
  const u = o.lines.length ? Math.max(...o.lines.map((m) => m.line)) + 1 : 0;
  return { block: o.block, line: u, start: c, end: k };
}
function J(r, n, t, a = !1) {
  const f = r.filter((h) => h.length >= 4 && !t.has(h[2])), o = new Set(f.map((h) => S(h[2], h[3]))), s = a || r.some((h) => h.length === 2) ? n.parts.flatMap(
    (h) => h.lines.filter((c) => (a ? v(c) : c.pinned) && c.end > c.start && !t.has(c.block) && !o.has(S(c.block, c.line))).map((c) => [c.start, c.end, c.block, c.line])
  ) : [], i = new Map(r.filter((h) => h.length > 4).map((h) => [`${h[0]}:${h[1]}:${h[2]}`, h.slice(4)])), p = [...t].flatMap(
    ([h, c]) => c.map((l, M) => [l.start, l.end, h, M, ...i.get(`${l.start}:${l.end}:${h}`) ?? []])
  );
  return E([...f, ...s, ...p]);
}
function P(r, n) {
  const t = [];
  for (const a of r) {
    const [f, o] = a;
    for (const [s, i, p] of n) {
      if (f < s || f >= i) continue;
      const h = p - s, c = a.slice(4), l = c.every((k) => k >= s && k < i) ? c.map((k) => k + h) : [], M = a.length >= 4 ? [f + h, Math.min(o, i) + h, a[2], a[3], ...l] : [f + h, Math.min(o, i) + h];
      t.push(M);
    }
  }
  return E(t);
}
function Q(r, n, t, a, f) {
  const o = [];
  for (const s of r) {
    if (s.length < 4) {
      o.push(s);
      continue;
    }
    const i = t[s[2]], p = a.map((c, l) => ({ index: c, block: l })).filter(({ index: c }) => i !== void 0 && n[c] === i);
    if (!p.length) continue;
    const h = p.reduce((c, l) => Math.abs(f[l.index] - s[0]) < Math.abs(f[c.index] - s[0]) ? l : c);
    o.push([s[0], s[1], h.block, s[3], ...s.slice(4)]);
  }
  return E(o);
}
function U(r) {
  const n = [...r].sort((a, f) => a.start - f.start), t = n[0]?.start ?? 0;
  return n.map((a) => ({ text: a.text, offset: a.start - t, length: Math.max(1, a.end - a.start) }));
}
export {
  U as clipOfLines,
  R as editRange,
  C as fitLyricGesture,
  Q as followSpans,
  F as laneLines,
  S as lineKey,
  D as newLineAt,
  z as overlap,
  W as parseLineKey,
  T as parseShift,
  E as parseSpans,
  H as partAt,
  G as partOf,
  j as placedLines,
  P as remapSpans,
  X as sameSpans,
  q as settle,
  J as withBlockSpans
};
