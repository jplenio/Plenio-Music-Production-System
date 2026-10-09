function g(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function y(e, a) {
  return `${e}:${a}`;
}
function S(e) {
  const a = /^(\d+):(\d+)$/.exec(e);
  return a ? { section: Number(a[1]), line: Number(a[2]) } : null;
}
function M(e) {
  if (!Array.isArray(e)) return [];
  const a = [];
  for (const r of e) {
    if (!Array.isArray(r) || r.length !== 2) continue;
    const [n, i] = r;
    Number.isInteger(n) && Number.isInteger(i) && n >= 0 && i > n && a.push([n, i]);
  }
  return a.sort((r, n) => r[0] - n[0] || r[1] - n[1]);
}
function b(e, a) {
  return e.length === a.length && e.every((r, n) => r[0] === a[n][0] && r[1] === a[n][1]);
}
function x(e, a) {
  const r = e.sections[a];
  if (!r) return [0, 0];
  const n = e.measures[r.first_bar - 1]?.onset ?? 0, i = e.measures[r.first_bar - 1 + r.bars]?.onset ?? e.total;
  return [n, i];
}
function N(e, a) {
  for (let r = 0; r < e.sections.length; r++) {
    const [n, i] = x(e, r);
    if (a >= n && a < i) return r;
  }
  return -1;
}
function w(e, a, r, n) {
  const i = a.sections.find((o) => o.section === r), [h, d] = x(e, r), l = Math.max(1, Math.round(e.grid.units_per_quarter)), c = new Map((i?.lines ?? []).map((o) => [o.line, o])), t = [];
  let s = h;
  return n.forEach((o, f) => {
    const u = c.get(f);
    let m = u ? u.start : s, p = u ? Math.max(u.end, u.start + 1) : m + l;
    u && u.end <= u.start && (p = m + l), m = Math.min(Math.max(m, h), d - 1), p = Math.min(Math.max(p, m + 1), d), t.push({ id: String(f), text: o, start: m, end: p }), s = p;
  }), t;
}
function A(e, a) {
  const [r, n] = a, i = e.map((t, s) => {
    const o = Math.max(1, Math.min(t.end - t.start, n - r)), f = Math.min(Math.max(t.start, r), n - 1);
    return { line: { ...t, start: f, end: Math.min(f + o, n) }, index: s, placed: t.id.startsWith("*") };
  }), h = i.filter((t) => t.placed).sort((t, s) => t.line.start - s.line.start), d = (t) => {
    let s = t;
    for (const o of h) s >= o.line.start && s < o.line.end && (s = o.line.end);
    return s;
  };
  let l = r;
  for (const t of i.filter((s) => !s.placed).sort((s, o) => s.line.start - o.line.start || s.index - o.index)) {
    const { start: s, end: o } = t.line;
    let f = d(Math.max(s, l));
    for (; f !== d(f); ) f = d(f);
    const u = o > f ? o : f + (o - s);
    t.line.start = Math.min(f, n - 1), t.line.end = Math.min(Math.max(u, t.line.start + 1), n), l = t.line.end;
  }
  const c = i.sort((t, s) => t.line.start - s.line.start || Number(s.placed) - Number(t.placed) || t.index - s.index).map((t) => t.line);
  for (let t = 0; t < c.length; t++) {
    const s = c[t + 1];
    s && s.start <= c[t].start && (s.start = Math.min(c[t].start + 1, n - 1)), s && c[t].end > s.start && (c[t].end = s.start), c[t].end <= c[t].start && (c[t].end = Math.min(c[t].start + 1, n));
  }
  return c;
}
function L(e, a, r) {
  const n = e.filter(([i]) => i < a[0] || i >= a[1]);
  return M([...n, ...r.map((i) => [i.start, i.end])]);
}
function _(e, a) {
  const r = [];
  for (const [n, i] of e)
    for (const [h, d, l] of a) {
      if (n < h || n >= d) continue;
      const c = l - h;
      r.push([n + c, Math.min(i, d) + c]);
    }
  return M(r);
}
function E(e) {
  const a = [...e].sort((n, i) => n.start - i.start), r = a[0]?.start ?? 0;
  return a.map((n) => ({ text: n.text, offset: n.start - r, length: n.end - n.start }));
}
export {
  E as clipOfLines,
  y as lineKey,
  S as parseLineKey,
  g as parseShift,
  M as parseSpans,
  w as placedLines,
  _ as remapSpans,
  b as sameSpans,
  N as sectionAt,
  x as sectionRange,
  A as settle,
  L as withSectionSpans
};
