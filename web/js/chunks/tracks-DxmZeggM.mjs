const u = {
  Vocal: "#4c9aff",
  Ins: "#f0a35e",
  chords: "#9ecbff",
  guide: "#9aa4b2"
};
function g(n, o = 0) {
  const e = n?.model?.tracks;
  return [
    {
      voice: "Vocal",
      name: "Vocal",
      destination: "V: Vocal",
      notes: e?.vocal.length ?? 0,
      color: u.Vocal,
      sent: !0
    },
    {
      voice: "Ins",
      name: "Instrument",
      destination: "V: Ins",
      notes: e?.ins.length ?? 0,
      color: u.Ins,
      sent: !0
    },
    {
      voice: "chords",
      name: "Chords",
      destination: "chord symbols",
      notes: e?.chords.length ?? 0,
      color: u.chords,
      sent: !0
    },
    {
      voice: "guide",
      name: "Guide",
      destination: "not sent to YuE2",
      notes: o,
      color: u.guide,
      sent: !1
    }
  ];
}
function y(n) {
  return n === 1 ? "1 note" : `${n} notes`;
}
function V(n, o) {
  if (!n?.length || !o) return [];
  const e = o.grid.units_per_quarter, t = 60 / o.tempo;
  return !e || !o.tempo ? [] : n.map(([s, a, f], d) => ({
    id: `guide:${s}:${d}`,
    segments: [],
    midi: f,
    start_s: s / e * t,
    duration_s: a / e * t
  }));
}
function I(n) {
  const o = typeof n == "string" && n.trim() ? p(n) : n;
  if (!Array.isArray(o)) return [];
  const e = [];
  for (const t of o)
    !Array.isArray(t) || t.length !== 3 || !t.every((s) => typeof s == "number" && Number.isInteger(s)) || t[0] < 0 || t[1] < 1 || t[2] < 0 || t[2] > 127 || e.push([t[0], t[1], t[2]]);
  return e.sort((t, s) => t[0] - s[0] || t[2] - s[2]);
}
function p(n) {
  try {
    return JSON.parse(n);
  } catch {
    return null;
  }
}
function v(n) {
  return n.map(([o, e, t]) => [o, e, t]);
}
function A(n, o) {
  const e = [];
  for (const [t, s, a] of n) {
    const f = t + s, d = o.map(([r, i, m]) => {
      const l = Math.max(t, r), h = Math.min(f, i);
      return h > l ? { start: m + l - r, end: m + h - r, from: l, to: h } : null;
    }).filter((r) => r !== null).sort((r, i) => r.start - i.start), c = [];
    for (const r of d) {
      const i = c[c.length - 1];
      i && i.end === r.start && i.to === r.from ? c[c.length - 1] = { ...i, end: r.end, to: r.to } : c.push(r);
    }
    for (const r of c) e.push([r.start, r.end - r.start, a]);
  }
  return e.sort((t, s) => t[0] - s[0] || t[2] - s[2]);
}
function G(n, o) {
  return n.length === o.length && n.every((e, t) => e.every((s, a) => s === o[t][a]));
}
export {
  u as TRACK_COLORS,
  V as guideNotes,
  y as notesLabel,
  I as parseGuide,
  A as remapGuide,
  G as sameGuide,
  v as serializeGuide,
  g as trackRows
};
