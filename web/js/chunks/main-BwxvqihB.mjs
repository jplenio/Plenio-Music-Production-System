import { api as un } from "../../../../scripts/api.js";
import { app as pn } from "../../../../scripts/app.js";
function de(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Ot extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function oe(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await i.json();
  if (!i.ok) {
    const s = r?.error ?? {};
    throw new Ot(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function Oi(e, t) {
  return oe(e, "/plenio/sheet/resolve", t);
}
async function Ri(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Pi(e, t) {
  return oe(e, "/plenio/score/analyze", { abc: t });
}
function Di(e, t, n) {
  return oe(e, "/plenio/score/transform", { abc: t, operation: n });
}
function Hi(e, t) {
  return oe(e, "/plenio/score/midi/export", t);
}
function Ti(e, t) {
  return oe(e, "/plenio/score/midi/import", t);
}
function Ii(e, t) {
  return oe(e, "/plenio/lyrics/analyze", t);
}
function Fi(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function lt(e, t, n, i = 200) {
  return oe(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function fn(e, t) {
  return oe(e, "/plenio/brief/fields", t);
}
async function mn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Ot(`Request failed (${t.status})`);
  return await t.json();
}
const _e = [
  "description",
  "genre",
  "mood",
  "tempo",
  "key",
  "meter",
  "language",
  "voice",
  "theme",
  "lead_instrument"
], hn = ["length", "vocals", "melody"], Ke = {
  description: "description",
  genre: "genre",
  mood: "mood",
  tempo: "tempo",
  key: "key",
  meter: "meter",
  length: "length",
  vocals: "vocals",
  language: "vocals.language",
  voice: "vocals.voice",
  theme: "vocals.theme",
  melody: "vocals.melody",
  lead_instrument: "vocals.lead_instrument"
}, gn = "custom";
function Rt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === gn;
}
function ye(e, t) {
  const n = Ke[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function bn(e) {
  const t = {};
  for (const n of [..._e, ...hn]) {
    const i = ye(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function ct(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!_e.includes(i.field)) continue;
    const r = ye(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function dt(e) {
  const t = [];
  for (const n of _e) {
    const i = ye(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Ye(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function yn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${wn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function vn(e) {
  const t = e ? Ye(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function xn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function wn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function ut(e, t) {
  for (const n of t) {
    const i = ye(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function _n(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Pt(e) {
  const t = [];
  for (const n of _e) {
    const i = ye(e, n);
    !i || !Rt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const pt = "plenio_brief_template", En = 400;
function kn(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const y = document.createElement("div");
  y.className = "line";
  const b = document.createElement("div");
  b.className = "hint";
  const w = document.createElement("div");
  w.className = "actions", c.append(y, b, w);
  const $ = (u, p, f) => {
    const m = document.createElement("button");
    return m.textContent = u, m.title = p, m.addEventListener("click", (k) => {
      k.stopPropagation(), f();
    }), w.append(m), m;
  }, L = $("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (ut(e, ct(e, n).map((u) => ({ field: u.field, value: u.value }))), R());
  }), O = $("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (ut(e, Ye(n)), R());
  }), E = $("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const u = dt(e);
    u.length && window.confirm(`Clear ${u.length} text field(s)? The template's values apply again.`) && (_n(e, u), R());
  }), I = $("↻", "Ask again what the template fills", () => {
    P();
  }), R = () => {
    const u = yn(n, i);
    y.textContent = r ?? u ?? "The template fills nothing: every text field has your value.", y.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const p = vn(n), f = xn(n);
    b.textContent = [p, f].filter(Boolean).join(" · "), b.style.display = b.textContent ? "" : "none", w.style.display = i && n && n.template !== "none" ? "" : "none", L.disabled = !n || !ct(e, n).length, O.disabled = !n || !Ye(n).length, E.disabled = !dt(e).length, I.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, F = /* @__PURE__ */ new WeakSet(), J = () => {
    for (const u of ["template", ...Object.keys(Ke)]) {
      const p = u === "template" ? e.widgets?.find((f) => f.name === "template") : ye(e, u);
      !p || F.has(p) || (F.add(p), p.callback = de(p.callback, () => {
        J(), P();
      }));
    }
  }, a = async () => {
    J();
    const u = String(e.widgets?.find((p) => p.name === "template")?.value ?? "none");
    try {
      n = await fn(t, { fields: bn(e), template: u }), r = null;
    } catch (p) {
      n = null, r = `The template fields could not be read: ${p instanceof Error ? p.message : String(p)}`;
    }
    i = !0, R();
  };
  function P() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, En);
  }
  J();
  const _ = e.addDOMWidget(pt, pt, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return _.serialize = !1, Pt(e), R(), P(), {
    widget: _,
    refresh: P,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Sn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function An(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, kn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), Pt(this), n.get(this)?.refresh();
  };
}
const qn = "COMFY_DYNAMICCOMBO_V3";
function $n(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Mn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Ln(e, t) {
  const n = Mn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Nn(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function zn(e, t, n) {
  if (!t || !e.widgets || Ln(e, t)) return !1;
  let i = 0;
  for (let r = 0; r < e.widgets.length; r++) {
    const s = e.widgets[r];
    if (s.serialize === !1) continue;
    let c;
    if (Array.isArray(t)) {
      if (i >= t.length) break;
      c = t[i++];
    } else if (s.name in t)
      c = t[s.name];
    else
      continue;
    if (n.has(s.name) && !Nn(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function Cn(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === qn && t.add(i);
  return t;
}
const Dt = "plenio.eq/1", Le = 8, se = 20, Bn = 2e4, be = 12, Ht = 15, he = ["peak", "low_shelf", "high_shelf"], Tt = ["peak", "notch", "highpass", "lowpass"], ft = [0.2, 10], mt = [0.25, 1];
function fe() {
  return { schema: Dt, preamp_db: 0, bands: [] };
}
function On(e) {
  if (typeof e != "string" || !e.trim()) return fe();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Dt,
      preamp_db: typeof t.preamp_db == "number" ? t.preamp_db : 0,
      bands: t.bands.map((n, i) => ({
        id: typeof n.id == "string" && n.id ? n.id : `band-${i + 1}`,
        enabled: n.enabled !== !1,
        type: n.type ?? "peak",
        frequency_hz: Number(n.frequency_hz ?? 1e3),
        gain_db: Number(n.gain_db ?? 0),
        q: Number(n.q ?? Math.SQRT1_2),
        slope: Number(n.slope ?? 1)
      }))
    };
  } catch {
    return null;
  }
}
function me(e) {
  return JSON.stringify(e);
}
const X = (e, t) => Number(e.toFixed(t));
function T(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function It(e) {
  return e.db ?? Ht;
}
const ht = [6, 12, 18], Rn = { 6: 8, 12: 14, 18: 20 };
function Pn(e, t) {
  return { ...e, db: Rn[t] ?? Ht };
}
function ce(e, t) {
  return Math.log(T(t, se, e.maxHz) / se) / Math.log(e.maxHz / se) * e.width;
}
function gt(e, t) {
  return se * (e.maxHz / se) ** T(t / e.width, 0, 1);
}
function re(e, t) {
  const n = It(e);
  return (1 - (T(t, -n, n) + n) / (2 * n)) * e.height;
}
function bt(e, t) {
  const n = It(e);
  return (1 - T(t / e.height, 0, 1)) * 2 * n - n;
}
function yt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function vt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${ce(e, i).toFixed(1)},${re(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function Ze(e) {
  return Math.min(Bn, 0.45 * e);
}
function Dn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Hn(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Le) return null;
  const r = {
    id: Dn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: X(T(t, se, Ze(i)), 1),
    gain_db: X(T(n, -be, be), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function ve(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: X(T(n, se, Ze(r)), 1),
        gain_db: he.includes(s.type) ? X(T(i, -be, be), 1) : s.gain_db
      }
    )
  };
}
function Te(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: X(T(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Ie(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function xe(e) {
  const t = e.frequency_hz >= 1e3 ? `${X(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = he.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function Tn(e, t) {
  const n = Ft[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = he.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = Tt.includes(e.type) ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const Ft = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Fe(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function Ae(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Ne(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: X(T(Ae(s.frequency_hz, r.frequency_hz), se, Ze(i)), 1),
        gain_db: X(T(Ae(s.gain_db, r.gain_db), -be, be), 1),
        q: X(T(Ae(s.q, r.q), ft[0], ft[1]), 3),
        slope: X(T(Ae(s.slope, r.slope), mt[0], mt[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function xt(e, t) {
  return Ne(e, t, { gain_db: 0 });
}
function wt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((L) => Number.isFinite(L));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), y = Math.max(s - c, 1e-6), b = e.height - 4, w = b - Math.max(12, e.height * T(i, 0.1, 0.95));
  return `M${t.map((L, O) => {
    const E = n[O], I = Number.isFinite(E) ? (E - c) / y : 0;
    return `${ce(e, L).toFixed(1)},${(b - I * (b - w)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${b.toFixed(1)} L0,${b.toFixed(1)} Z`;
}
class In {
  constructor(t, n = 50) {
    this.limit = n, this.entries = [t];
  }
  limit;
  entries;
  index = 0;
  get current() {
    return this.entries[this.index];
  }
  get canUndo() {
    return this.index > 0;
  }
  get canRedo() {
    return this.index < this.entries.length - 1;
  }
  /** Record a new state (a duplicate of the current one is ignored). */
  push(t) {
    me(t) !== me(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
  }
  undo() {
    return this.canUndo ? (this.index -= 1, this.current) : null;
  }
  redo() {
    return this.canRedo ? (this.index += 1, this.current) : null;
  }
  reset(t) {
    this.entries = [t], this.index = 0;
  }
}
const Fn = "http://www.w3.org/2000/svg", _t = "plenio_eq_panel", qe = "mode.bands", ne = { capture: !0 }, Y = { width: 560, height: 260 }, $e = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let je = null;
function ee(e, t) {
  const n = document.createElementNS(Fn, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function B(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function le(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function te(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function jn(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function Wn(e, t) {
  const n = B("div", "plenio-eq"), i = B("div", "plenio-eq-tools"), r = B("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = B("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of ht) s.append(new Option(`±${o} dB`, String(o)));
  const c = le("", "↶", "Undo the last band change"), y = le("", "↷", "Redo the last band change"), b = le("", "reset", "Remove every band"), w = le("", "compare", "Show the curve without the EQ (bypass)"), $ = le("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), L = B("span", "plenio-eq-info");
  L.setAttribute("aria-live", "polite"), L.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, c, y, b, w, $, L);
  const O = B("div", "plenio-eq-mode"), E = ee("svg", {
    viewBox: `0 0 ${Y.width} ${Y.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  E.setAttribute("aria-label", "EQ response curve"), E.setAttribute("tabindex", "0"), E.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const I = B("div", "plenio-eq-strip"), R = B("div", "plenio-eq-editor"), F = B("div", "plenio-eq-fields");
  R.append(F), n.append(i, O, E, I, R);
  const J = e.addDOMWidget(_t, _t, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  J.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: fe(), readonly: !0, note: "" }, P = null, _ = null, u = !1, p = 12, f = null, m = [], k = 0, v, Q, z = null, j = !1;
  const D = /* @__PURE__ */ new Map();
  let H = null;
  const C = new In(fe()), ue = () => te(e, qe), K = () => p, S = () => Pn({ ...Y, maxHz: Math.min(2e4, a.sampleRate / 2) }, K());
  function M(o, { record: d = !0 } = {}) {
    const l = ue();
    if (!l) return;
    const h = me(o);
    l.value = h, l.callback?.(h), d && C.push(o), a = { ...a, settings: o }, V(), pe(0);
  }
  async function pe(o = 120) {
    clearTimeout(v), v = setTimeout(async () => {
      const d = String(te(e, "mode")?.value ?? "flat");
      if (d !== "manual") {
        d === "flat" ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : P !== d ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: `${d}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : a = { ...a, readonly: !0 }, V();
        return;
      }
      const l = On(ue()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, V();
        return;
      }
      me(l) !== me(C.current) && C.reset(l);
      const h = ++k;
      try {
        const x = await lt(t, l, a.sampleRate);
        if (h !== k) return;
        a = {
          ...a,
          frequencies: x.frequency_hz,
          response: x.response_db,
          settings: x.settings,
          readonly: !1,
          note: ""
        };
      } catch (x) {
        a = { ...a, readonly: !1, note: x instanceof Error ? x.message : String(x) };
      }
      V();
    }, o);
  }
  const nt = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Le)
  });
  function it() {
    if (!f) return "";
    const o = m.find((d) => d.name === f);
    return o && jn(nt(o), a.settings) ? f : "";
  }
  function V() {
    E.replaceChildren(), D.clear(), H = null;
    const o = S();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      E.append(
        ee("line", { x1: 0, x2: o.width, y1: re(o, l), y2: re(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      E.append(ee("line", { x1: ce(o, l), x2: ce(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && E.append(ee("path", { d: wt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && E.append(ee("path", { d: wt(o, a.frequencies, a.afterDb), class: "spectrum after" })), u ? E.append(ee("line", { x1: 0, x2: o.width, y1: re(o, 0), y2: re(o, 0), class: "curve flat" })) : a.frequencies.length && (H = ee("path", { d: vt(o, a.frequencies, a.response), class: "curve" }), E.append(H)), !a.readonly && !u && a.settings.bands.forEach((l, h) => {
      const x = $e[h % $e.length], A = he.includes(l.type) ? l.gain_db : 0, g = ee("circle", {
        cx: ce(o, l.frequency_hz),
        cy: re(o, A),
        r: l.id === _ ? 9 : 7,
        class: l.id === _ ? "handle selected" : "handle",
        style: `stroke: ${x}`,
        tabindex: 0,
        "data-band": l.id
      });
      g.setAttribute("aria-label", `Band ${h + 1}: ${xe(l)}`), l.enabled || g.classList.add("disabled"), g.append(ee("title", {})), g.lastChild.textContent = `Band ${h + 1}: ${xe(l)}`, g.addEventListener("pointerdown", (N) => tn(N, l.id)), g.addEventListener("dblclick", (N) => {
        N.stopPropagation(), M(xt(a.settings, l.id));
      }), g.addEventListener("focus", () => Kt(l.id)), g.addEventListener("keydown", (N) => rt(N, l.id)), g.addEventListener("wheel", (N) => {
        N.preventDefault();
        const ae = N.deltaY < 0 ? 1.15 : 1 / 1.15;
        M(Te(a.settings, l.id, ae));
      }), g.addEventListener("contextmenu", (N) => {
        N.preventDefault(), M(Ie(a.settings, l.id));
      }), E.append(g), D.set(l.id, g);
    }), Xt(), Ut(), Jt();
    const d = a.settings.bands.find((l) => l.id === _);
    L.textContent = a.note || (u ? "compare: the curve is off (the node still applies it)" : d ? xe(d) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Le}`), r.disabled = a.readonly, c.disabled = !C.canUndo, y.disabled = !C.canRedo, b.disabled = a.readonly || !a.settings.bands.length, j && (j = !1, _ && D.get(_)?.focus({ preventScroll: !0 })), s.value = String(p), r.value = it(), w.classList.toggle("active", u), $.classList.toggle("active", Re()), e.setDirtyCanvas?.(!0, !0);
  }
  function Xt() {
    if (I.replaceChildren(), a.readonly && !a.settings.bands.length) {
      I.append(B("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, d) => {
      const l = B("button", "plenio-eq-chip", Tn(o, d));
      l.style.borderLeftColor = $e[d % $e.length], l.classList.toggle("selected", o.id === _), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${d + 1}`), l.title = `Band ${d + 1}: ${xe(o)} - click to open its fields`, l.addEventListener("click", (h) => {
        h.stopPropagation(), _ = _ === o.id ? null : o.id, V();
      }), I.append(l);
    });
  }
  function Ut() {
    F.replaceChildren();
    const o = a.settings.bands.find((g) => g.id === _);
    if (!o || a.readonly) {
      R.style.display = "none";
      return;
    }
    R.style.display = "";
    const d = B("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    d.title = "The selected band";
    const l = B("select");
    l.setAttribute("aria-label", "Band type"), l.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [g, N] of Object.entries(Ft)) l.append(new Option(N, g));
    l.value = o.type, l.addEventListener("change", () => M(Ne(a.settings, o.id, { type: l.value })));
    const h = B("input");
    h.type = "checkbox", h.checked = o.enabled, h.setAttribute("aria-label", "Band enabled"), h.title = "Band enabled: off keeps the band in the list but out of the response", h.addEventListener("change", () => M(Ne(a.settings, o.id, { enabled: h.checked })));
    const x = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (g) => De(o.id, "frequency_hz", Fe(g, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (g) => De(o.id, "gain_db", Fe(g))],
      ["Q", `${o.q}`, 60, (g) => De(o.id, "q", Fe(g))]
    ];
    F.append(d, l, h);
    for (const [g, N, ae, Ee] of x) {
      const W = B("input", "number");
      W.value = N, W.style.width = `${ae}px`, W.setAttribute("aria-label", `Band ${g}`), W.title = g === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : g === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const ke = () => {
        Ee(W.value) || (W.value = N);
      };
      W.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && ke();
      }), W.addEventListener("blur", ke), (g === "dB" && !he.includes(o.type) || g === "Q" && !Tt.includes(o.type)) && (W.disabled = !0), F.append(W);
    }
    const A = le("", "remove", "Remove this band");
    A.addEventListener("click", (g) => {
      g.stopPropagation(), _ = null, M(Ie(a.settings, o.id));
    }), F.append(A);
  }
  function Jt() {
    O.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      B(
        "span",
        "plenio-eq-hint",
        P === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const d = le("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    d.disabled = !a.settings.bands.length, d.addEventListener("click", (l) => {
      l.stopPropagation();
      const h = te(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const x = ue();
      if (x) {
        const A = me(a.settings);
        x.value = A, x.callback?.(A);
      }
      C.reset(a.settings), He(), pe(0);
    }), O.append(d);
  }
  function Kt(o) {
    _ = o, j = !0, V();
  }
  function Zt(o) {
    _ = o, Oe();
  }
  function Oe() {
    const o = S();
    a.settings.bands.forEach((l) => {
      const h = D.get(l.id);
      if (!h) return;
      const x = he.includes(l.type) ? l.gain_db : 0;
      h.setAttribute("cx", String(ce(o, l.frequency_hz))), h.setAttribute("cy", String(re(o, x))), h.classList.toggle("selected", l.id === _), h.setAttribute("r", l.id === _ ? "9" : "7");
    }), H && a.frequencies.length && H.setAttribute("d", vt(o, a.frequencies, a.response));
    const d = a.settings.bands.find((l) => l.id === _);
    d && (L.textContent = xe(d));
  }
  function en() {
    clearTimeout(Q), Q = setTimeout(async () => {
      const o = a.settings, d = ++k;
      try {
        const l = await lt(t, o, a.sampleRate);
        if (d !== k) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Oe();
      } catch {
      }
    }, 60);
  }
  function Re() {
    return !te(e, qe)?.plenioHidden;
  }
  function Pe(o) {
    const d = te(e, qe);
    d && (d.plenioHidden = !o, o ? delete d.computeSize : d.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function De(o, d, l) {
    if (l === null) return !1;
    const h = a.settings.bands.find((x) => x.id === o);
    return h && h[d] === l || M(Ne(a.settings, o, { [d]: l })), !0;
  }
  function tn(o, d) {
    o.preventDefault(), o.stopPropagation(), _ !== d && Zt(d);
    const l = a.settings.bands.find((G) => G.id === d);
    if (!l) return;
    z = { hz: l.frequency_hz, db: l.gain_db };
    let h = !1, x = !1;
    const A = o.currentTarget;
    try {
      A?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const g = E.getBoundingClientRect(), N = g.width ? g.left : 0, ae = g.height ? g.top : 0, Ee = g.width || Y.width, W = g.height || Y.height, ke = (G, Se) => G >= N - 1 && G <= N + Ee + 1 && Se >= ae - 1 && Se <= ae + W + 1;
    function Z() {
      if (!x) {
        x = !0;
        try {
          A?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", at, ne), window.removeEventListener("pointerup", Z, ne), window.removeEventListener("pointercancel", Z, ne), window.removeEventListener("blur", Z, ne), z = null, h && M(a.settings);
      }
    }
    const at = (G) => {
      if (x || !z) return;
      if (G.buttons === 0) {
        Z();
        return;
      }
      if (!ke(G.clientX, G.clientY)) return;
      const Se = Y.width / Ee, rn = Y.height / W, sn = (G.clientX - N) * Se, on = (G.clientY - ae) * rn, an = ce(S(), z.hz), ln = re(S(), z.db), cn = gt(S(), yt(an, sn, G.shiftKey)), dn = bt(S(), yt(ln, on, G.shiftKey));
      a = { ...a, settings: ve(a.settings, d, cn, dn, a.sampleRate) }, h = !0, Oe(), en();
    };
    window.addEventListener("pointermove", at, ne), window.addEventListener("pointerup", Z, ne), window.addEventListener("pointercancel", Z, ne), window.addEventListener("blur", Z, ne);
  }
  function rt(o, d) {
    const l = a.settings.bands.find((g) => g.id === d);
    if (!l) return;
    const h = o.shiftKey ? 0.1 : 0.5, x = o.shiftKey ? 1.01 : 1.06;
    let A = null;
    o.key === "ArrowUp" ? A = ve(a.settings, d, l.frequency_hz, l.gain_db + h, a.sampleRate) : o.key === "ArrowDown" ? A = ve(a.settings, d, l.frequency_hz, l.gain_db - h, a.sampleRate) : o.key === "ArrowRight" ? A = ve(a.settings, d, l.frequency_hz * x, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? A = ve(a.settings, d, l.frequency_hz / x, l.gain_db, a.sampleRate) : o.key === "+" ? A = Te(a.settings, d, 1.15) : o.key === "-" ? A = Te(a.settings, d, 1 / 1.15) : o.key === "0" ? A = xt(a.settings, d) : (o.key === "Delete" || o.key === "Backspace") && (A = Ie(a.settings, d)), A && (o.preventDefault(), M(A));
  }
  E.addEventListener("keydown", (o) => {
    _ && o.target === E && rt(o, _);
  }), E.addEventListener("dblclick", (o) => {
    if (a.readonly || u) return;
    const d = E.getBoundingClientRect(), l = Y.width / (d.width || Y.width), h = Y.height / (d.height || Y.height), x = (o.clientX - d.left) * l, A = (o.clientY - d.top) * h, g = Hn(a.settings, gt(S(), x), bt(S(), A), a.sampleRate);
    g ? (_ = g.bands[g.bands.length - 1].id, M(g)) : (a = { ...a, note: `the EQ has at most ${Le} bands` }, V());
  }), r.append(new Option("preset…", "")), je ??= mn(t).then((o) => o.manual).catch(() => []), je.then((o) => {
    m = o;
    for (const d of o) r.append(new Option(d.name, d.name));
    r.value = it();
  }), r.addEventListener("change", async () => {
    const o = (await je)?.find((d) => d.name === r.value);
    o && (f = o.name, M(nt(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    p = ht.find((d) => d === o) ?? 12, V();
  }), c.addEventListener("click", () => {
    const o = C.undo();
    o && M(o, { record: !1 });
  }), y.addEventListener("click", () => {
    const o = C.redo();
    o && M(o, { record: !1 });
  }), b.addEventListener("click", () => {
    _ = null, M(fe());
  }), w.addEventListener("click", () => {
    u = !u, V();
  }), $.addEventListener("click", () => {
    Pe(!Re()), V();
  });
  function He() {
    for (const o of ["mode", qe]) {
      const d = te(e, o);
      if (!d || d.plenioWatched) continue;
      d.plenioWatched = !0;
      const l = d.callback;
      d.callback = (h) => {
        l?.(h), setTimeout(() => {
          Re() || Pe(!1), pe();
        });
      };
    }
  }
  He(), Pe(!1), pe(0);
  let st = null, ot = null;
  const nn = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(nn);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), d = String(ue()?.value ?? "");
    o === st && d === ot || (st = o, ot = d, He(), pe(0));
  }, 700);
  return {
    showExecuted(o) {
      const d = o?.plenio_eq, l = d?.[d.length - 1];
      if (!l) return;
      const h = String(te(e, "mode")?.value ?? "flat"), x = h === "manual";
      P = x || h === "flat" ? null : h, a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !x,
        note: x ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, x ? pe(0) : V();
    }
  };
}
const et = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Gn = new Set(_e.map((e) => Ke[e]));
function Qn(e, t) {
  return !(e in et) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => Gn.has(n) && Rt(i)).map(([n]) => n);
}
function Vn(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function Yn(e, t) {
  const n = et[e.name];
  if (!n || !t) return t;
  const i = Vn(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const y = Qn(e.name, c.widgets_values_named);
  if (y.length) {
    const b = { ...c.widgets_values_named };
    for (const w of y) b[w] = "";
    c = { ...c, widgets_values_named: b };
  }
  return c;
}
const jt = /* @__PURE__ */ new Map(), Xe = /* @__PURE__ */ new Set();
function Et(e, t) {
  jt.set(e, t);
  for (const n of Xe) n(e);
}
function kt(e) {
  return jt.get(e) ?? null;
}
function Xn(e) {
  return Xe.add(e), () => Xe.delete(e);
}
const Wt = /* @__PURE__ */ new Map();
function Un(e) {
  e?.draft_sha256 && Wt.set(e.draft_sha256, e);
}
function Jn(e) {
  return e ? Wt.get(e) ?? null : null;
}
const tt = "plenio.sheet_state/1", Be = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Gt() {
  return { schema: tt, docs: {} };
}
function St(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Gt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== tt || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Kn(e) {
  const t = {};
  for (const i of Be) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: tt, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function We(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Zn(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Be.filter((i) => We(e, i) !== "auto").map(
    (i) => i === "lyrics" && We(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${We(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function At(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function ji(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: At(r?.[0] ?? 0), end: At(s?.[1] ?? e.duration_s) };
  }) : [];
}
function Ge(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function ei(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Wi(e, t, n) {
  return n.map((i) => ({ kind: i, text: ei(e, t, i), intent: "keep" }));
}
function Gi(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], y = t?.docs[s.kind], b = Ge(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: b };
    else if (s.intent === "rebase")
      y?.upstream_sha256 ? i[s.kind] = { state: "edited", text: b, base_sha256: y.upstream_sha256 } : i[s.kind] = { state: "manual", text: b };
    else if (c)
      Ge(c.text) !== b && (i[s.kind] = { ...c, text: b });
    else {
      const w = Ge(y?.upstream ?? "");
      if (b === w) continue;
      i[s.kind] = y?.upstream_sha256 ? { state: "edited", text: b, base_sha256: y.upstream_sha256 } : { state: "manual", text: b };
    }
  }
  const r = { ...Gt(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Qi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function ti(e, t) {
  return Be.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Vi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Qt = "PLENIO_SHEET_STATE";
let Ue = null;
function ni(e) {
  Ue = e;
}
const ii = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…", r.append(c, s);
  const y = () => {
    const w = kt(String(e.id)), $ = w ? ` · ${w.status}` : "";
    s.textContent = Zn(St(i)) + $;
  }, b = e.addDOMWidget(t, Qt, r, {
    getValue: () => i,
    setValue: (w) => {
      i = typeof w == "string" ? w : "", y();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return c.addEventListener("click", async (w) => {
    w.stopPropagation();
    const $ = St(i);
    $ === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const L = kt(String(e.id)), E = (e.inputs ?? []).filter((u) => u.link != null).map((u) => u.name), I = $ ?? { schema: "plenio.sheet_state/1", docs: {} }, R = L?.owned ?? ti(E, I), F = String(e.widgets?.find((u) => u.name === "review")?.value ?? "continue"), J = F === "as the brief says" ? L?.review ?? "continue" : F, { openSheetDialog: a } = await import("./open-DwWNO9rW.mjs"), { parseGuide: P, serializeGuide: _ } = await import("./tracks-DEywwRcM.mjs");
    if (!Ue) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: I,
      payload: L,
      asrNote: Jn(L?.docs.lyrics?.upstream_sha256),
      owned: R.length ? R : [...Be],
      review: J,
      fetcher: Ue,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: P(e.properties?.plenio_guide),
      onApply: (u, p) => {
        b.value = Kn(u), e.properties = { ...e.properties ?? {}, plenio_guide: _(p) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Xn((w) => {
    w === String(e.id) && y();
  }), y(), { widget: b };
}, we = "plenio.stem_mix/1", ge = "rest", ri = ["reverb", "delay"], Vt = -60, si = 12;
function oi() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function U(e, t) {
  const n = e?.strips?.[t] ?? {};
  return {
    gain_db: typeof n.gain_db == "number" ? n.gain_db : 0,
    mute: n.mute === !0,
    solo: n.solo === !0,
    compression: typeof n.compression == "number" ? n.compression : 0,
    muted: Array.isArray(n.muted) ? n.muted.map((i) => [i[0], i[1]]) : [],
    reverb: typeof n.reverb == "number" ? n.reverb : 0,
    delay: typeof n.delay == "number" ? n.delay : 0,
    save: n.save === !0
  };
}
function Yt(e) {
  const t = oi();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const ai = ["vocals", "drums", "bass", "other"];
function li() {
  return [...ai, ge];
}
function ci(e) {
  if (typeof e != "string" || !e.trim()) return { schema: we, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== we || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function di(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || Yt(U(e, i))) continue;
    const r = {}, s = U(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: we, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Ce(e, t, n) {
  const i = { ...e.strips };
  return Yt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function ui(e, t, n) {
  const i = n.some((s) => U(e, s).solo), r = U(e, t);
  return i ? r.solo : !r.mute;
}
function qt(e) {
  return e <= Vt ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function pi(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function fi(e, t, n) {
  return pi([...e, [t, n]]);
}
function mi(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function hi(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function gi(e, t, n, i) {
  const r = U(e, t);
  return Ce(e, t, { ...r, muted: fi(r.muted, n, i) });
}
function bi(e, t, n) {
  const i = U(e, t), r = mi(i.muted, n);
  return r < 0 ? e : Ce(e, t, { ...i, muted: hi(i.muted, r) });
}
function yi(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function vi(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function $t(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : li()).filter((s) => s !== ge), r = Object.keys(e?.strips ?? {}).filter((s) => s !== ge && !i.includes(s));
  return [...i, ...r, ge];
}
const Mt = "plenio_stem_mixer", Lt = "mix", ie = 200, xi = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function Me(e, t, n, i, r) {
  const s = q("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function wi(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), r = q("div", "plenio-mix-info"), s = q("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: we, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: $t(null, null),
    peaks: {},
    seconds: 0
  }, y = !1;
  const b = () => e.widgets?.find((u) => u.name === Lt);
  function w(u, { draw: p = !0 } = {}) {
    const f = b();
    if (!f) return;
    const m = di(u);
    f.value = m, f.callback?.(m), c = { ...c, mix: u }, p && E();
  }
  function $(u, p, f = {}) {
    w(Ce(c.mix, u, { ...U(c.mix, u), ...p }), f);
  }
  function L(u, p, f, m = {}) {
    const k = U(c.mix, u);
    let v = Ce(c.mix, u, { ...k, [p]: f });
    f > 0 && !(v[p] && Object.keys(v[p]).length) && (v = p === "reverb" ? { ...v, reverb: { preset: "room" } } : { ...v, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), w(v, m);
  }
  function O(u, p, f) {
    const m = { ...c.mix[u] ?? {} };
    w({ ...c.mix, [u]: { ...m, [p]: f } });
  }
  function E() {
    n.replaceChildren();
    const u = c.names;
    for (const p of c.names) {
      const f = U(c.mix, p), m = q("div", "plenio-mix-strip");
      m.dataset.strip = p;
      const k = q("span", "name", p === ge ? `${p} (missed)` : p);
      k.title = p === ge ? "What the separator missed: keeps a neutral mix exact" : "";
      const v = Me(Vt, si, 0.5, f.gain_db, `${p} gain`), Q = q("span", "gain", `${qt(f.gain_db)} dB`);
      v.addEventListener("input", () => {
        Q.textContent = `${qt(Number(v.value))} dB`, $(p, { gain_db: Number(v.value) }, { draw: !1 });
      }), v.addEventListener("change", () => $(p, { gain_db: Number(v.value) }));
      const z = q("button", f.mute ? "toggle active" : "toggle", "M");
      z.setAttribute("aria-label", `${p} mute`), z.addEventListener("click", (S) => {
        S.stopPropagation(), $(p, { mute: !f.mute });
      });
      const j = q("button", f.solo ? "toggle active" : "toggle", "S");
      j.setAttribute("aria-label", `${p} solo`), j.addEventListener("click", (S) => {
        S.stopPropagation(), $(p, { solo: !f.solo });
      });
      const D = Me(0, 1, 0.05, f.compression, `${p} compression`);
      D.title = "Compression amount: one knob for the master compressor (threshold and ratio)", D.addEventListener("input", () => $(p, { compression: Number(D.value) }, { draw: !1 })), D.addEventListener("change", () => $(p, { compression: Number(D.value) }));
      const H = ri.map((S) => {
        const M = Me(0, 1, 0.05, f[S], `${p} ${S} send`);
        return M.title = `${S} send: how much of this stem goes to the shared ${S} bus`, M.addEventListener("input", () => L(p, S, Number(M.value), { draw: !1 })), M.addEventListener("change", () => L(p, S, Number(M.value))), M;
      }), C = q("button", f.save ? "toggle active" : "toggle", "save");
      C.setAttribute("aria-label", `${p} save as its own file`), C.setAttribute("aria-pressed", String(f.save)), C.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", C.addEventListener("click", (S) => {
        S.stopPropagation(), $(p, { save: !f.save });
      });
      const ue = ui(c.mix, p, u);
      m.classList.toggle("silent", !ue);
      const K = q("canvas", "plenio-mix-wave");
      K.width = ie, K.height = 26, K.setAttribute("aria-label", `${p} waveform (drag to mute a time range)`), I(K, f, vi(c.peaks, p, ie)), K.addEventListener("pointerdown", (S) => R(S, K, p)), m.append(
        k,
        v,
        Q,
        z,
        j,
        q("span", "label", "comp"),
        D,
        q("span", "label", "verb"),
        H[0],
        q("span", "label", "delay"),
        H[1],
        C,
        K
      ), n.append(m);
    }
    F(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function I(u, p, f) {
    const m = u.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, ie, u.height);
    const k = u.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let v = 0; v < f.length; v++) {
      const Q = Math.max(1, f[v] * (k - 1));
      m.moveTo(v + 0.5, k - Q), m.lineTo(v + 0.5, k + Q);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [v, Q] of p.muted) {
      const z = Math.max(0, Math.min(ie, v / Math.max(c.seconds, 1e-6) * ie)), j = Math.max(0, Math.min(ie, Q / Math.max(c.seconds, 1e-6) * ie));
      m.fillRect(z, 0, Math.max(1, j - z), u.height), m.strokeRect(z + 0.5, 0.5, Math.max(1, j - z) - 1, u.height - 1);
    }
  }
  function R(u, p, f) {
    if (u.preventDefault(), u.stopPropagation(), !c.seconds) return;
    const m = p.getBoundingClientRect(), k = (H) => Math.max(0, Math.min(1, (H - m.left) / (m.width || ie))) * c.seconds, v = k(u.clientX);
    if (U(c.mix, f).muted.some(([H, C]) => H <= v && v <= C)) {
      w(bi(c.mix, f, v));
      return;
    }
    let z = v;
    const j = (H) => {
      z = k(H.clientX);
    }, D = () => {
      window.removeEventListener("pointermove", j), window.removeEventListener("pointerup", D), w(gi(c.mix, f, Math.min(v, z), Math.max(v, z)));
    };
    window.addEventListener("pointermove", j), window.addEventListener("pointerup", D);
  }
  function F() {
    i.replaceChildren();
    const u = { preset: "room", ...c.mix.reverb ?? {} }, p = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = q("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const v of xi) f.append(new Option(v, v));
    f.value = String(u.preset ?? "room"), f.addEventListener("change", () => O("reverb", "preset", f.value));
    const m = q("input");
    m.type = "number", m.value = String(p.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => O("delay", "time_ms", Number(m.value)));
    const k = Me(0, 0.8, 0.05, Number(p.feedback ?? 0.35), "Delay feedback");
    k.title = "Delay feedback: how much of each echo returns into the delay line", k.addEventListener("input", () => O("delay", "feedback", Number(k.value))), i.append(
      q("span", "label", "reverb bus"),
      f,
      q("span", "label", "delay bus"),
      m,
      q("span", "label", "ms, feedback"),
      k
    ), i.style.display = "flex";
  }
  const J = e.addDOMWidget(Mt, Mt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  J.serialize = !1;
  const a = e.widgets?.find((u) => u.name === Lt), P = q("button", "toggle", "JSON");
  P.title = "Show or hide the raw mixer value", P.addEventListener("click", (u) => {
    u.stopPropagation(), y = !y, P.classList.toggle("active", y), a && (a.plenioHidden = !y, y ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(q("span", "label", "Advanced"), P), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function _() {
    const u = ci(b()?.value);
    c = { ...c, mix: u ?? { schema: we, strips: {} } }, u || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), E();
  }
  return _(), {
    showExecuted(u) {
      const p = u?.plenio_stems?.at(-1), f = yi(u), m = $t(c.mix, p ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(p?.seconds ?? c.seconds) || 0 }, _();
    }
  };
}
const _i = `
.plenio-sheet-state { display: flex; align-items: center; gap: 8px; font: 12px/28px var(--font-family, sans-serif);
  color: var(--descrip-text, #999); padding: 0 4px; white-space: nowrap; overflow: hidden; }
.plenio-sheet-summary { overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-open { flex: none; padding: 2px 10px; border-radius: 6px; border: 1px solid var(--border-color, #555);
  background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd); cursor: pointer; font: inherit; line-height: 20px; }
.plenio-sheet-open:hover { background: #2f6fb0; color: #fff; }
.plenio-summary { font: 12px/1.45 var(--font-family, sans-serif); color: var(--input-text, #ddd);
  background: var(--comfy-input-bg, #222); border-radius: 6px; padding: 6px 10px; overflow: auto; }
.plenio-summary[data-status="warning"] { border-left: 3px solid #d8a31a; }
.plenio-summary[data-status="error"] { border-left: 3px solid #d0453b; }
.plenio-summary h3, .plenio-summary h4, .plenio-summary h5 { margin: 6px 0 4px; font-size: 13px; }
.plenio-summary ul { margin: 2px 0 6px 16px; padding: 0; }
.plenio-summary p { margin: 4px 0; }
.plenio-summary pre { white-space: pre-wrap; font-size: 11px; }
.plenio-summary code { font-family: var(--code-font, monospace); }
.plenio-eq { display: flex; flex-direction: column; gap: 4px; font: 11px/1.4 var(--font-family, sans-serif);
  color: var(--descrip-text, #999); }
.plenio-eq-tools { display: flex; gap: 6px; align-items: center; min-width: 0; }
.plenio-eq-tools select { max-width: 45%; background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd);
  border: 1px solid var(--border-color, #555); border-radius: 4px; font: inherit; }
.plenio-eq-info { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plenio-eq-plot { width: 100%; height: auto; background: var(--comfy-input-bg, #222); border-radius: 6px; touch-action: none; }
.plenio-eq-plot .grid { stroke: var(--border-color, #444); stroke-width: 0.6; }
.plenio-eq-plot .grid.zero { stroke-width: 1.2; }
.plenio-eq-plot .curve { fill: none; stroke: #4aa3ff; stroke-width: 2; }
.plenio-eq-plot .handle { fill: var(--comfy-menu-bg, #1a1a1a); stroke: #4aa3ff; stroke-width: 2; cursor: grab; }
.plenio-eq-plot .handle.selected, .plenio-eq-plot .handle:focus { fill: #4aa3ff; outline: none; }
.plenio-eq-plot .handle.disabled { opacity: 0.35; }
.plenio-eq-plot { min-height: 260px; }
.plenio-eq-plot .spectrum { stroke: none; }
.plenio-eq-plot .spectrum.before { fill: rgba(160, 170, 185, 0.25); }
.plenio-eq-plot .spectrum.after { fill: rgba(76, 163, 255, 0.28); }
.plenio-eq-plot .curve.flat { stroke: var(--descrip-text, #999); stroke-dasharray: 4 3; }
.plenio-eq-tools button { padding: 1px 6px; border-radius: 5px; border: 1px solid var(--border-color, #555);
  background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd); cursor: pointer; font: inherit; }
.plenio-eq-tools button:disabled { opacity: 0.45; cursor: default; }
.plenio-eq-tools button.active { background: #2d5d9f; color: #fff; }
.plenio-eq-strip { display: flex; flex-wrap: wrap; gap: 4px; }
.plenio-eq-chip { padding: 1px 6px; border-radius: 5px; border: 1px solid var(--border-color, #555);
  border-left-width: 3px; background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd);
  cursor: pointer; font: inherit; text-align: left; }
.plenio-eq-chip.selected { background: #2d5d9f; color: #fff; }
.plenio-eq-chip.disabled { opacity: 0.5; text-decoration: line-through; }
.plenio-eq-mode { display: flex; align-items: center; gap: 6px; }
.plenio-eq-mode button { padding: 1px 8px; border-radius: 5px; border: 1px solid var(--border-color, #555);
  background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd); cursor: pointer; font: inherit; }
.plenio-eq-editor .plenio-eq-fields { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.plenio-eq-editor .plenio-eq-fields .name { color: var(--descrip-text, #999); }
.plenio-eq-editor input.number { background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd);
  border: 1px solid var(--border-color, #555); border-radius: 4px; font: inherit; }
.plenio-eq-hint { color: var(--descrip-text, #999); }
.plenio-brief-template { display: flex; flex-direction: column; gap: 3px; font: 11px/1.35 var(--font-family, sans-serif);
  color: var(--descrip-text, #999); padding: 2px 4px; overflow: hidden; }
.plenio-brief-template .line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plenio-brief-template .line[data-state="ok"] { color: #8fb6d9; }
.plenio-brief-template .line[data-state="error"] { color: #d0453b; }
.plenio-brief-template .hint { color: #c79a3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plenio-brief-template .actions { display: flex; flex-wrap: wrap; gap: 4px; }
.plenio-brief-template button { white-space: nowrap; padding: 1px 6px; border-radius: 5px; border: 1px solid var(--border-color, #555);
  background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd); cursor: pointer; font: inherit; }
.plenio-brief-template button:disabled { opacity: 0.45; cursor: default; }
.plenio-mix { display: flex; flex-direction: column; gap: 4px; font: 11px/1.4 var(--font-family, sans-serif);
  color: var(--descrip-text, #999); overflow-y: auto; }
.plenio-mix-strips { display: flex; flex-direction: column; gap: 3px; }
.plenio-mix-strip { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 2px 4px;
  border-radius: 5px; background: rgba(127, 127, 127, 0.08); }
.plenio-mix-strip .name { flex: 0 0 62px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--input-text, #ddd); }
.plenio-mix-strip .gain { flex: 0 0 54px; text-align: right; font-variant-numeric: tabular-nums; }
.plenio-mix-strip .label, .plenio-mix-buses .label, .plenio-mix-advanced .label { opacity: 0.8; }
.plenio-mix-strip input[type="range"] { width: 84px; height: 14px; accent-color: #4aa3ff; }
.plenio-mix .toggle { padding: 1px 6px; min-width: 22px; text-align: center; border-radius: 5px;
  border: 1px solid var(--border-color, #555); background: var(--comfy-input-bg, #333);
  color: var(--input-text, #ddd); cursor: pointer; font: inherit; }
.plenio-mix .toggle.active { background: #2d5d9f; color: #fff; }
.plenio-mix-strip.silent { opacity: 0.5; }
.plenio-mix-wave { flex: 1 0 160px; max-width: 320px; height: 26px; background: var(--comfy-input-bg, #222);
  border-radius: 4px; cursor: crosshair; touch-action: none; }
.plenio-mix-buses { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.plenio-mix-buses select, .plenio-mix-buses input[type="number"] { background: var(--comfy-input-bg, #333);
  color: var(--input-text, #ddd); border: 1px solid var(--border-color, #555); border-radius: 4px;
  font: inherit; }
.plenio-mix-buses input[type="number"] { width: 64px; }
.plenio-mix-buses input[type="range"] { width: 84px; accent-color: #4aa3ff; }
.plenio-mix-advanced { display: flex; align-items: center; gap: 6px; }
.plenio-mix-info { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
function Ei() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = _i, document.head.append(e);
}
function Je(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Qe(e) {
  return Je(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function ki(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${Je(i.join(`
`))}</code></pre>`), i = null) : i.push(s);
      continue;
    }
    if (s.startsWith("```")) {
      r(), i = [];
      continue;
    }
    const c = /^(#{1,4})\s+(.*)$/.exec(s);
    if (c) {
      r();
      const b = Math.min(c[1].length + 2, 6);
      t.push(`<h${b}>${Qe(c[2])}</h${b}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(s);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Qe(y[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${Qe(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${Je(i.join(`
`))}</code></pre>`), t.join("");
}
const Ve = "plenio_summary", Nt = "plenio_summary", zt = 84, Si = 18, Ai = 55, qi = 16;
function $i(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / Ai)), 0);
  return qi + t * Si;
}
function Mi(e, t) {
  const n = e.widgets?.find((s) => s.name === Nt);
  if (n?.element) return n.element;
  const i = document.createElement("div");
  i.className = "plenio-summary";
  const r = e.addDOMWidget(Nt, "plenio_summary", i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => zt,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(zt, i.scrollHeight ? i.scrollHeight + 2 : $i(t.markdown))
  });
  return r.serialize = !1, i;
}
function Li(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Ct = /* @__PURE__ */ new WeakMap();
function Bt(e, t) {
  if (!t.markdown) return;
  const n = Ct.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Ct.set(e, n);
  const i = Mi(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = ki(t.markdown), Li(e), e.setDirtyCanvas?.(!0, !0);
}
function Ni(e) {
  e.prototype.onExecuted = de(e.prototype.onExecuted, function(t) {
    const n = t?.[Ve], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Ve] = { markdown: i.markdown, status: i.status ?? "" }, Bt(this, i));
  }), e.prototype.onConfigure = de(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ve];
    t?.markdown && Bt(this, t);
  });
}
const zi = "Plenio.Core", ze = un;
ni(ze);
pn.registerExtension({
  name: zi,
  getCustomWidgets: () => ({ [Qt]: ii }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ni(e);
    const n = Cn(t.input);
    if (n.size || t.name in et) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = Yn(t, r), c = $n(s), y = i?.call(this, s);
        return zn(this, c, n), y;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = de(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) Un(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, Wn(this, ze));
      }, e.prototype.onExecuted = de(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Sn.has(t.name) && An(e, ze), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, wi(this));
      }, e.prototype.onExecuted = de(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = de(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && Et(String(this.id), s);
    }));
  },
  setup() {
    Ei(), ze.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && Et(String(t.node_id), t);
    });
  }
});
export {
  zi as E,
  Ot as P,
  Ii as a,
  Pi as b,
  ji as c,
  Kn as d,
  Hi as e,
  Ge as f,
  Ri as g,
  Ti as i,
  Gi as n,
  Oi as r,
  Wi as s,
  Di as t,
  Vi as u,
  Fi as v,
  Qi as w
};
