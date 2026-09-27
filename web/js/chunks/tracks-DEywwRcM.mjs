const s = {
  Vocal: "#4c9aff",
  Ins: "#f0a35e",
  chords: "#9ecbff",
  guide: "#9aa4b2"
};
function f(n, t = 0) {
  const r = n?.model?.tracks;
  return [
    {
      voice: "Vocal",
      name: "Vocal",
      destination: "V: Vocal",
      notes: r?.vocal.length ?? 0,
      color: s.Vocal,
      sent: !0
    },
    {
      voice: "Ins",
      name: "Instrument",
      destination: "V: Ins",
      notes: r?.ins.length ?? 0,
      color: s.Ins,
      sent: !0
    },
    {
      voice: "chords",
      name: "Chords",
      destination: "chord symbols",
      notes: r?.chords.length ?? 0,
      color: s.chords,
      sent: !0
    },
    {
      voice: "guide",
      name: "Guide",
      destination: "not sent to YuE2",
      notes: t,
      color: s.guide,
      sent: !1
    }
  ];
}
function d(n) {
  return n === 1 ? "1 note" : `${n} notes`;
}
function l(n, t) {
  if (!n?.length || !t) return [];
  const r = t.grid.units_per_quarter, e = 60 / t.tempo;
  return !r || !t.tempo ? [] : n.map(([o, i, c], u) => ({
    id: `guide:${o}:${u}`,
    segments: [],
    midi: c,
    start_s: o / r * e,
    duration_s: i / r * e
  }));
}
function g(n) {
  const t = typeof n == "string" && n.trim() ? a(n) : n;
  if (!Array.isArray(t)) return [];
  const r = [];
  for (const e of t)
    !Array.isArray(e) || e.length !== 3 || !e.every((o) => typeof o == "number" && Number.isInteger(o)) || e[0] < 0 || e[1] < 1 || e[2] < 0 || e[2] > 127 || r.push([e[0], e[1], e[2]]);
  return r.sort((e, o) => e[0] - o[0] || e[2] - o[2]);
}
function a(n) {
  try {
    return JSON.parse(n);
  } catch {
    return null;
  }
}
function h(n) {
  return n.map(([t, r, e]) => [t, r, e]);
}
function m(n, t) {
  return n.length === t.length && n.every((r, e) => r.every((o, i) => o === t[e][i]));
}
export {
  s as TRACK_COLORS,
  l as guideNotes,
  d as notesLabel,
  g as parseGuide,
  m as sameGuide,
  h as serializeGuide,
  f as trackRows
};
