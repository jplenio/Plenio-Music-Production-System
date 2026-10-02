function g(a, s) {
  return `${a}:${s}`;
}
function y(a) {
  const s = /^(\d+):(\d+)$/.exec(a);
  return s ? { section: Number(s[1]), line: Number(s[2]) } : null;
}
function M(a) {
  if (!Array.isArray(a)) return [];
  const s = [];
  for (const e of a) {
    if (!Array.isArray(e) || e.length !== 2) continue;
    const [n, i] = e;
    Number.isInteger(n) && Number.isInteger(i) && n >= 0 && i > n && s.push([n, i]);
  }
  return s.sort((e, n) => e[0] - n[0] || e[1] - n[1]);
}
function S(a, s) {
  return a.length === s.length && a.every((e, n) => e[0] === s[n][0] && e[1] === s[n][1]);
}
function x(a, s) {
  const e = a.sections[s];
  if (!e) return [0, 0];
  const n = a.measures[e.first_bar - 1]?.onset ?? 0, i = a.measures[e.first_bar - 1 + e.bars]?.onset ?? a.total;
  return [n, i];
}
function N(a, s) {
  for (let e = 0; e < a.sections.length; e++) {
    const [n, i] = x(a, e);
    if (s >= n && s < i) return e;
  }
  return -1;
}
function b(a, s, e, n) {
  const i = s.sections.find((o) => o.section === e), [d, l] = x(a, e), h = Math.max(1, Math.round(a.grid.units_per_quarter)), c = new Map((i?.lines ?? []).map((o) => [o.line, o])), t = [];
  let r = d;
  return n.forEach((o, f) => {
    const u = c.get(f);
    let m = u ? u.start : r, p = u ? Math.max(u.end, u.start + 1) : m + h;
    u && u.end <= u.start && (p = m + h), m = Math.min(Math.max(m, d), l - 1), p = Math.min(Math.max(p, m + 1), l), t.push({ id: String(f), text: o, start: m, end: p }), r = p;
  }), t;
}
function w(a, s) {
  const [e, n] = s, i = a.map((t, r) => {
    const o = Math.max(1, Math.min(t.end - t.start, n - e)), f = Math.min(Math.max(t.start, e), n - 1);
    return { line: { ...t, start: f, end: Math.min(f + o, n) }, index: r, placed: t.id.startsWith("*") };
  }), d = i.filter((t) => t.placed).sort((t, r) => t.line.start - r.line.start), l = (t) => {
    let r = t;
    for (const o of d) r >= o.line.start && r < o.line.end && (r = o.line.end);
    return r;
  };
  let h = e;
  for (const t of i.filter((r) => !r.placed).sort((r, o) => r.line.start - o.line.start || r.index - o.index)) {
    const { start: r, end: o } = t.line;
    let f = l(Math.max(r, h));
    for (; f !== l(f); ) f = l(f);
    const u = o > f ? o : f + (o - r);
    t.line.start = Math.min(f, n - 1), t.line.end = Math.min(Math.max(u, t.line.start + 1), n), h = t.line.end;
  }
  const c = i.sort((t, r) => t.line.start - r.line.start || Number(r.placed) - Number(t.placed) || t.index - r.index).map((t) => t.line);
  for (let t = 0; t < c.length; t++) {
    const r = c[t + 1];
    r && r.start <= c[t].start && (r.start = Math.min(c[t].start + 1, n - 1)), r && c[t].end > r.start && (c[t].end = r.start), c[t].end <= c[t].start && (c[t].end = Math.min(c[t].start + 1, n));
  }
  return c;
}
function A(a, s, e) {
  const n = a.filter(([i]) => i < s[0] || i >= s[1]);
  return M([...n, ...e.map((i) => [i.start, i.end])]);
}
function L(a, s) {
  const e = [];
  for (const [n, i] of a)
    for (const [d, l, h] of s) {
      if (n < d || n >= l) continue;
      const c = h - d;
      e.push([n + c, Math.min(i, l) + c]);
    }
  return M(e);
}
function _(a) {
  const s = [...a].sort((n, i) => n.start - i.start), e = s[0]?.start ?? 0;
  return s.map((n) => ({ text: n.text, offset: n.start - e, length: n.end - n.start }));
}
export {
  _ as clipOfLines,
  g as lineKey,
  y as parseLineKey,
  M as parseSpans,
  b as placedLines,
  L as remapSpans,
  S as sameSpans,
  N as sectionAt,
  x as sectionRange,
  w as settle,
  A as withSectionSpans
};
