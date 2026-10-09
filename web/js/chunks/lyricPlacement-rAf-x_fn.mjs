function k(s) {
  return typeof s == "number" && Number.isFinite(s) && Math.abs(s) <= 10 ? Math.round(s * 1e3) / 1e3 : 0;
}
function x(s, a) {
  return `${s}:${a}`;
}
function S(s) {
  const a = /^(\d+):(\d+)$/.exec(s);
  return a ? { block: Number(a[1]), line: Number(a[2]) } : null;
}
function M(s) {
  if (!Array.isArray(s)) return [];
  const a = [];
  for (const r of s) {
    if (!Array.isArray(r) || r.length !== 2 && r.length !== 4 || !r.every((f) => Number.isInteger(f) && f >= 0)) continue;
    const [n, c] = r;
    c <= n || a.push(r.length === 4 ? [n, c, r[2], r[3]] : [n, c]);
  }
  return a.sort((r, n) => r[0] - n[0] || r[1] - n[1] || (r[2] ?? -1) - (n[2] ?? -1) || (r[3] ?? -1) - (n[3] ?? -1));
}
function w(s, a) {
  return s.length === a.length && s.every((r, n) => r.length === a[n].length && r.every((c, f) => c === a[n][f]));
}
function b(s, a) {
  return s.parts.find((r) => r.block === a);
}
function N(s, a) {
  return s.parts.find((r) => a >= r.start && a < r.end);
}
function y(s) {
  return s.syllables.length > 0 || s.pinned;
}
function A(s, a, r) {
  let n = 0, c = r;
  for (const f of s.parts) {
    const l = f.lines.filter(y);
    !l.length || f.block === a || (f.block < a ? n = Math.max(n, ...l.map((i) => Math.max(i.end, i.start + 1))) : c = Math.min(c, ...l.map((i) => i.start)));
  }
  return [n, Math.max(c, n + 1)];
}
function L(s, a, r, n, c) {
  const f = b(s, a), [l, i] = n, o = new Map((f?.lines ?? []).map((h) => [h.line, h])), t = [];
  let e = f ? Math.max(f.start, l) : l;
  return r.forEach((h, d) => {
    const u = o.get(d), g = u && y(u);
    let p = g ? u.start : e, m = g ? Math.max(u.end, u.start + 1) : p + c;
    p = Math.min(Math.max(p, l), i - 1), m = Math.min(Math.max(m, p + 1), i), t.push({ id: String(d), text: h, start: p, end: m }), e = m;
  }), t;
}
function E(s, a) {
  const [r, n] = a, c = s.map((t, e) => {
    const h = Math.max(1, Math.min(t.end - t.start, n - r)), d = Math.min(Math.max(t.start, r), n - 1);
    return { line: { ...t, start: d, end: Math.min(d + h, n) }, index: e, placed: t.id.startsWith("*") };
  }), f = c.filter((t) => t.placed).sort((t, e) => t.line.start - e.line.start), l = (t) => {
    let e = t;
    for (const h of f) e >= h.line.start && e < h.line.end && (e = h.line.end);
    return e;
  };
  let i = r;
  for (const t of c.filter((e) => !e.placed).sort((e, h) => e.line.start - h.line.start || e.index - h.index)) {
    const { start: e, end: h } = t.line;
    let d = l(Math.max(e, i));
    for (; d !== l(d); ) d = l(d);
    const u = h > d ? h : d + (h - e);
    t.line.start = Math.min(d, n - 1), t.line.end = Math.min(Math.max(u, t.line.start + 1), n), i = t.line.end;
  }
  const o = c.sort((t, e) => t.line.start - e.line.start || Number(e.placed) - Number(t.placed) || t.index - e.index).map((t) => t.line);
  for (let t = 0; t < o.length; t++) {
    const e = o[t + 1];
    e && e.start <= o[t].start && (e.start = Math.min(o[t].start + 1, n - 1)), e && o[t].end > e.start && (o[t].end = e.start), o[t].end <= o[t].start && (o[t].end = Math.min(o[t].start + 1, n));
  }
  return o;
}
function $(s, a, r) {
  const n = s.filter((i) => i.length === 4 && !r.has(i[2])), c = new Set(n.map((i) => x(i[2], i[3]))), f = s.some((i) => i.length === 2) ? a.parts.flatMap(
    (i) => i.lines.filter((o) => o.pinned && !r.has(o.block) && !c.has(x(o.block, o.line))).map((o) => [o.start, o.end, o.block, o.line])
  ) : [], l = [...r].flatMap(([i, o]) => o.map((t, e) => [t.start, t.end, i, e]));
  return M([...n, ...f, ...l]);
}
function v(s, a) {
  const r = [];
  for (const n of s) {
    const [c, f] = n;
    for (const [l, i, o] of a) {
      if (c < l || c >= i) continue;
      const t = o - l, e = n.length === 4 ? [c + t, Math.min(f, i) + t, n[2], n[3]] : [c + t, Math.min(f, i) + t];
      r.push(e);
    }
  }
  return M(r);
}
function K(s, a, r, n, c) {
  const f = [];
  for (const l of s) {
    if (l.length !== 4) {
      f.push(l);
      continue;
    }
    const i = r[l[2]], o = n.map((e, h) => ({ index: e, block: h })).filter(({ index: e }) => i !== void 0 && a[e] === i);
    if (!o.length) continue;
    const t = o.reduce((e, h) => Math.abs(c[h.index] - l[0]) < Math.abs(c[e.index] - l[0]) ? h : e);
    f.push([l[0], l[1], t.block, l[3]]);
  }
  return M(f);
}
function O(s) {
  const a = [...s].sort((n, c) => n.start - c.start), r = a[0]?.start ?? 0;
  return a.map((n) => ({ text: n.text, offset: n.start - r, length: n.end - n.start }));
}
export {
  O as clipOfLines,
  A as editRange,
  K as followSpans,
  x as lineKey,
  S as parseLineKey,
  k as parseShift,
  M as parseSpans,
  N as partAt,
  b as partOf,
  L as placedLines,
  v as remapSpans,
  w as sameSpans,
  E as settle,
  $ as withBlockSpans
};
