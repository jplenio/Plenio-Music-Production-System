import { api as ln } from "../../../../scripts/api.js";
import { app as cn } from "../../../../scripts/app.js";
function de(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Ct extends Error {
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
    throw new Ct(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function qi(e, t) {
  return oe(e, "/plenio/sheet/resolve", t);
}
async function $i(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Mi(e, t) {
  return oe(e, "/plenio/score/analyze", { abc: t });
}
function Li(e, t, n) {
  return oe(e, "/plenio/score/transform", { abc: t, operation: n });
}
function Ni(e, t) {
  return oe(e, "/plenio/score/midi/export", t);
}
function Ci(e, t) {
  return oe(e, "/plenio/score/midi/import", t);
}
function zi(e, t) {
  return oe(e, "/plenio/lyrics/analyze", t);
}
function Bi(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function at(e, t, n, i = 200) {
  return oe(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function dn(e, t) {
  return oe(e, "/plenio/brief/fields", t);
}
async function un(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Ct(`Request failed (${t.status})`);
  return await t.json();
}
const xe = [
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
], pn = ["length", "vocals", "melody"], Je = {
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
}, fn = "custom";
function zt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === fn;
}
function he(e, t) {
  const n = Je[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function mn(e) {
  const t = {};
  for (const n of [...xe, ...pn]) {
    const i = he(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function lt(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!xe.includes(i.field)) continue;
    const r = he(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function ct(e) {
  const t = [];
  for (const n of xe) {
    const i = he(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Ve(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function hn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${yn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function gn(e) {
  const t = e ? Ve(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function bn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function yn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function dt(e, t) {
  for (const n of t) {
    const i = he(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function vn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Bt(e) {
  const t = [];
  for (const n of xe) {
    const i = he(e, n);
    !i || !zt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const ut = "plenio_brief_template", xn = 400;
function wn(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const y = document.createElement("div");
  y.className = "line";
  const b = document.createElement("div");
  b.className = "hint";
  const w = document.createElement("div");
  w.className = "actions", c.append(y, b, w);
  const q = (p, u, f) => {
    const m = document.createElement("button");
    return m.textContent = p, m.title = u, m.addEventListener("click", ($) => {
      $.stopPropagation(), f();
    }), w.append(m), m;
  }, M = q("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (dt(e, lt(e, n).map((p) => ({ field: p.field, value: p.value }))), R());
  }), O = q("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (dt(e, Ve(n)), R());
  }), k = q("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = ct(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (vn(e, p), R());
  }), j = q("↻", "Ask again what the template fills", () => {
    x();
  }), R = () => {
    const p = hn(n, i);
    y.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", y.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const u = gn(n), f = bn(n);
    b.textContent = [u, f].filter(Boolean).join(" · "), b.style.display = b.textContent ? "" : "none", w.style.display = i && n && n.template !== "none" ? "" : "none", M.disabled = !n || !lt(e, n).length, O.disabled = !n || !Ve(n).length, k.disabled = !ct(e).length, j.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, I = /* @__PURE__ */ new WeakSet(), K = () => {
    for (const p of ["template", ...Object.keys(Je)]) {
      const u = p === "template" ? e.widgets?.find((f) => f.name === "template") : he(e, p);
      !u || I.has(u) || (I.add(u), u.callback = de(u.callback, () => {
        K(), x();
      }));
    }
  }, a = async () => {
    K();
    const p = String(e.widgets?.find((u) => u.name === "template")?.value ?? "none");
    try {
      n = await dn(t, { fields: mn(e), template: p }), r = null;
    } catch (u) {
      n = null, r = `The template fields could not be read: ${u instanceof Error ? u.message : String(u)}`;
    }
    i = !0, R();
  };
  function x() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, xn);
  }
  K();
  const P = e.addDOMWidget(ut, ut, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return P.serialize = !1, Bt(e), R(), x(), {
    widget: P,
    refresh: x,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const _n = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function En(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, wn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), Bt(this), n.get(this)?.refresh();
  };
}
const kn = "COMFY_DYNAMICCOMBO_V3";
function Sn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function An(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function qn(e, t) {
  const n = An(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function $n(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Mn(e, t, n) {
  if (!t || !e.widgets || qn(e, t)) return !1;
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
    if (n.has(s.name) && !$n(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function Ln(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === kn && t.add(i);
  return t;
}
const Ot = "plenio.eq/1", $e = 8, se = 20, Nn = 2e4, me = 12, Rt = 15, pe = ["peak", "low_shelf", "high_shelf"], Pt = ["peak", "notch", "highpass", "lowpass"], pt = [0.2, 10], ft = [0.25, 1];
function ye() {
  return { schema: Ot, preamp_db: 0, bands: [] };
}
function Cn(e) {
  if (typeof e != "string" || !e.trim()) return ye();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Ot,
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
function ue(e) {
  return JSON.stringify(e);
}
const U = (e, t) => Number(e.toFixed(t));
function F(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Dt(e) {
  return e.db ?? Rt;
}
const mt = [6, 12, 18], zn = { 6: 8, 12: 14, 18: 20 };
function Bn(e, t) {
  return { ...e, db: zn[t] ?? Rt };
}
function ce(e, t) {
  return Math.log(F(t, se, e.maxHz) / se) / Math.log(e.maxHz / se) * e.width;
}
function ht(e, t) {
  return se * (e.maxHz / se) ** F(t / e.width, 0, 1);
}
function re(e, t) {
  const n = Dt(e);
  return (1 - (F(t, -n, n) + n) / (2 * n)) * e.height;
}
function gt(e, t) {
  const n = Dt(e);
  return (1 - F(t / e.height, 0, 1)) * 2 * n - n;
}
function bt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function yt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${ce(e, i).toFixed(1)},${re(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function Ke(e) {
  return Math.min(Nn, 0.45 * e);
}
function On(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Rn(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= $e) return null;
  const r = {
    id: On(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(F(t, se, Ke(i)), 1),
    gain_db: U(F(n, -me, me), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function ge(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: U(F(n, se, Ke(r)), 1),
        gain_db: pe.includes(s.type) ? U(F(i, -me, me), 1) : s.gain_db
      }
    )
  };
}
function Te(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(F(i.q * n, 0.2, 10), 3) } : i)
  };
}
function He(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function be(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = pe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function Pn(e, t) {
  const n = Tt[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = pe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = Pt.includes(e.type) ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const Tt = {
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
function ke(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Me(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: U(F(ke(s.frequency_hz, r.frequency_hz), se, Ke(i)), 1),
        gain_db: U(F(ke(s.gain_db, r.gain_db), -me, me), 1),
        q: U(F(ke(s.q, r.q), pt[0], pt[1]), 3),
        slope: U(F(ke(s.slope, r.slope), ft[0], ft[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function vt(e, t) {
  return Me(e, t, { gain_db: 0 });
}
function xt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((M) => Number.isFinite(M));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), y = Math.max(s - c, 1e-6), b = e.height - 4, w = b - Math.max(12, e.height * F(i, 0.1, 0.95));
  return `M${t.map((M, O) => {
    const k = n[O], j = Number.isFinite(k) ? (k - c) / y : 0;
    return `${ce(e, M).toFixed(1)},${(b - j * (b - w)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${b.toFixed(1)} L0,${b.toFixed(1)} Z`;
}
class Dn {
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
    ue(t) !== ue(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Tn = "http://www.w3.org/2000/svg", wt = "plenio_eq_panel", Se = "mode.bands", ne = { capture: !0 }, Y = { width: 560, height: 260 }, Ae = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let je = null;
function ee(e, t) {
  const n = document.createElementNS(Tn, e);
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
function Hn(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function Fn(e, t) {
  const n = B("div", "plenio-eq"), i = B("div", "plenio-eq-tools"), r = B("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = B("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of mt) s.append(new Option(`±${o} dB`, String(o)));
  const c = le("", "↶", "Undo the last band change"), y = le("", "↷", "Redo the last band change"), b = le("", "reset", "Remove every band"), w = le("", "compare", "Show the curve without the EQ (bypass)"), q = le("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), M = B("span", "plenio-eq-info");
  M.setAttribute("aria-live", "polite"), M.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, c, y, b, w, q, M);
  const O = B("div", "plenio-eq-mode"), k = ee("svg", {
    viewBox: `0 0 ${Y.width} ${Y.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  k.setAttribute("aria-label", "EQ response curve"), k.setAttribute("tabindex", "0"), k.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const j = B("div", "plenio-eq-strip"), R = B("div", "plenio-eq-editor"), I = B("div", "plenio-eq-fields");
  R.append(I), n.append(i, O, k, j, R);
  const K = e.addDOMWidget(wt, wt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  K.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: ye(), readonly: !0, note: "" }, x = null, P = !1, p = 12, u = null, f = [], m = 0, $, v, T = null, C = !1;
  const H = /* @__PURE__ */ new Map();
  let D = null;
  const N = new Dn(ye()), W = () => te(e, Se), ze = () => p, z = () => Bn({ ...Y, maxHz: Math.min(2e4, a.sampleRate / 2) }, ze());
  function _(o, { record: d = !0 } = {}) {
    const l = W();
    if (!l) return;
    const h = ue(o);
    l.value = h, l.callback?.(h), d && N.push(o), a = { ...a, settings: o }, X(), G(0);
  }
  async function G(o = 120) {
    clearTimeout($), $ = setTimeout(async () => {
      const d = String(te(e, "mode")?.value ?? "flat");
      if (d !== "manual") {
        d === "flat" ? a = {
          ...a,
          settings: ye(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : a = { ...a, readonly: !0 }, X();
        return;
      }
      const l = Cn(W()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, X();
        return;
      }
      ue(l) !== ue(N.current) && N.reset(l);
      const h = ++m;
      try {
        const E = await at(t, l, a.sampleRate);
        if (h !== m) return;
        a = {
          ...a,
          frequencies: E.frequency_hz,
          response: E.response_db,
          settings: E.settings,
          readonly: !1,
          note: ""
        };
      } catch (E) {
        a = { ...a, readonly: !1, note: E instanceof Error ? E.message : String(E) };
      }
      X();
    }, o);
  }
  const tt = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, $e)
  });
  function nt() {
    if (!u) return "";
    const o = f.find((d) => d.name === u);
    return o && Hn(tt(o), a.settings) ? u : "";
  }
  function X() {
    k.replaceChildren(), H.clear(), D = null;
    const o = z();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      k.append(
        ee("line", { x1: 0, x2: o.width, y1: re(o, l), y2: re(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      k.append(ee("line", { x1: ce(o, l), x2: ce(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && k.append(ee("path", { d: xt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && k.append(ee("path", { d: xt(o, a.frequencies, a.afterDb), class: "spectrum after" })), P ? k.append(ee("line", { x1: 0, x2: o.width, y1: re(o, 0), y2: re(o, 0), class: "curve flat" })) : a.frequencies.length && (D = ee("path", { d: yt(o, a.frequencies, a.response), class: "curve" }), k.append(D)), !a.readonly && !P && a.settings.bands.forEach((l, h) => {
      const E = Ae[h % Ae.length], S = pe.includes(l.type) ? l.gain_db : 0, g = ee("circle", {
        cx: ce(o, l.frequency_hz),
        cy: re(o, S),
        r: l.id === x ? 9 : 7,
        class: l.id === x ? "handle selected" : "handle",
        style: `stroke: ${E}`,
        tabindex: 0,
        "data-band": l.id
      });
      g.setAttribute("aria-label", `Band ${h + 1}: ${be(l)}`), l.enabled || g.classList.add("disabled"), g.append(ee("title", {})), g.lastChild.textContent = `Band ${h + 1}: ${be(l)}`, g.addEventListener("pointerdown", (L) => Kt(L, l.id)), g.addEventListener("dblclick", (L) => {
        L.stopPropagation(), _(vt(a.settings, l.id));
      }), g.addEventListener("focus", () => Yt(l.id)), g.addEventListener("keydown", (L) => it(L, l.id)), g.addEventListener("wheel", (L) => {
        L.preventDefault();
        const ae = L.deltaY < 0 ? 1.15 : 1 / 1.15;
        _(Te(a.settings, l.id, ae));
      }), g.addEventListener("contextmenu", (L) => {
        L.preventDefault(), _(He(a.settings, l.id));
      }), k.append(g), H.set(l.id, g);
    }), Qt(), Vt(), Xt();
    const d = a.settings.bands.find((l) => l.id === x);
    M.textContent = a.note || (P ? "compare: the curve is off (the node still applies it)" : d ? be(d) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${$e}`), r.disabled = a.readonly, c.disabled = !N.canUndo, y.disabled = !N.canRedo, b.disabled = a.readonly || !a.settings.bands.length, C && (C = !1, x && H.get(x)?.focus({ preventScroll: !0 })), s.value = String(p), r.value = nt(), w.classList.toggle("active", P), q.classList.toggle("active", Oe()), e.setDirtyCanvas?.(!0, !0);
  }
  function Qt() {
    if (j.replaceChildren(), a.readonly && !a.settings.bands.length) {
      j.append(B("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, d) => {
      const l = B("button", "plenio-eq-chip", Pn(o, d));
      l.style.borderLeftColor = Ae[d % Ae.length], l.classList.toggle("selected", o.id === x), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${d + 1}`), l.title = `Band ${d + 1}: ${be(o)} - click to open its fields`, l.addEventListener("click", (h) => {
        h.stopPropagation(), x = x === o.id ? null : o.id, X();
      }), j.append(l);
    });
  }
  function Vt() {
    I.replaceChildren();
    const o = a.settings.bands.find((g) => g.id === x);
    if (!o || a.readonly) {
      R.style.display = "none";
      return;
    }
    R.style.display = "";
    const d = B("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    d.title = "The selected band";
    const l = B("select");
    l.setAttribute("aria-label", "Band type"), l.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [g, L] of Object.entries(Tt)) l.append(new Option(L, g));
    l.value = o.type, l.addEventListener("change", () => _(Me(a.settings, o.id, { type: l.value })));
    const h = B("input");
    h.type = "checkbox", h.checked = o.enabled, h.setAttribute("aria-label", "Band enabled"), h.title = "Band enabled: off keeps the band in the list but out of the response", h.addEventListener("change", () => _(Me(a.settings, o.id, { enabled: h.checked })));
    const E = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (g) => Pe(o.id, "frequency_hz", Fe(g, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (g) => Pe(o.id, "gain_db", Fe(g))],
      ["Q", `${o.q}`, 60, (g) => Pe(o.id, "q", Fe(g))]
    ];
    I.append(d, l, h);
    for (const [g, L, ae, we] of E) {
      const Q = B("input", "number");
      Q.value = L, Q.style.width = `${ae}px`, Q.setAttribute("aria-label", `Band ${g}`), Q.title = g === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : g === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const _e = () => {
        we(Q.value) || (Q.value = L);
      };
      Q.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && _e();
      }), Q.addEventListener("blur", _e), (g === "dB" && !pe.includes(o.type) || g === "Q" && !Pt.includes(o.type)) && (Q.disabled = !0), I.append(Q);
    }
    const S = le("", "remove", "Remove this band");
    S.addEventListener("click", (g) => {
      g.stopPropagation(), x = null, _(He(a.settings, o.id));
    }), I.append(S);
  }
  function Xt() {
    O.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      B("span", "plenio-eq-hint", `applied proposal (${a.settings.bands.length} band(s), ${o})`)
    );
    const d = le("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    d.disabled = !a.settings.bands.length, d.addEventListener("click", (l) => {
      l.stopPropagation();
      const h = te(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const E = W();
      if (E) {
        const S = ue(a.settings);
        E.value = S, E.callback?.(S);
      }
      N.reset(a.settings), De(), G(0);
    }), O.append(d);
  }
  function Yt(o) {
    x = o, C = !0, X();
  }
  function Ut(o) {
    x = o, Be();
  }
  function Be() {
    const o = z();
    a.settings.bands.forEach((l) => {
      const h = H.get(l.id);
      if (!h) return;
      const E = pe.includes(l.type) ? l.gain_db : 0;
      h.setAttribute("cx", String(ce(o, l.frequency_hz))), h.setAttribute("cy", String(re(o, E))), h.classList.toggle("selected", l.id === x), h.setAttribute("r", l.id === x ? "9" : "7");
    }), D && a.frequencies.length && D.setAttribute("d", yt(o, a.frequencies, a.response));
    const d = a.settings.bands.find((l) => l.id === x);
    d && (M.textContent = be(d));
  }
  function Jt() {
    clearTimeout(v), v = setTimeout(async () => {
      const o = a.settings, d = ++m;
      try {
        const l = await at(t, o, a.sampleRate);
        if (d !== m) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Be();
      } catch {
      }
    }, 60);
  }
  function Oe() {
    return !te(e, Se)?.plenioHidden;
  }
  function Re(o) {
    const d = te(e, Se);
    d && (d.plenioHidden = !o, o ? delete d.computeSize : d.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Pe(o, d, l) {
    if (l === null) return !1;
    const h = a.settings.bands.find((E) => E.id === o);
    return h && h[d] === l || _(Me(a.settings, o, { [d]: l })), !0;
  }
  function Kt(o, d) {
    o.preventDefault(), o.stopPropagation(), x !== d && Ut(d);
    const l = a.settings.bands.find((V) => V.id === d);
    if (!l) return;
    T = { hz: l.frequency_hz, db: l.gain_db };
    let h = !1, E = !1;
    const S = o.currentTarget;
    try {
      S?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const g = k.getBoundingClientRect(), L = g.width ? g.left : 0, ae = g.height ? g.top : 0, we = g.width || Y.width, Q = g.height || Y.height, _e = (V, Ee) => V >= L - 1 && V <= L + we + 1 && Ee >= ae - 1 && Ee <= ae + Q + 1;
    function Z() {
      if (!E) {
        E = !0;
        try {
          S?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", ot, ne), window.removeEventListener("pointerup", Z, ne), window.removeEventListener("pointercancel", Z, ne), window.removeEventListener("blur", Z, ne), T = null, h && _(a.settings);
      }
    }
    const ot = (V) => {
      if (E || !T) return;
      if (V.buttons === 0) {
        Z();
        return;
      }
      if (!_e(V.clientX, V.clientY)) return;
      const Ee = Y.width / we, en = Y.height / Q, tn = (V.clientX - L) * Ee, nn = (V.clientY - ae) * en, rn = ce(z(), T.hz), sn = re(z(), T.db), on = ht(z(), bt(rn, tn, V.shiftKey)), an = gt(z(), bt(sn, nn, V.shiftKey));
      a = { ...a, settings: ge(a.settings, d, on, an, a.sampleRate) }, h = !0, Be(), Jt();
    };
    window.addEventListener("pointermove", ot, ne), window.addEventListener("pointerup", Z, ne), window.addEventListener("pointercancel", Z, ne), window.addEventListener("blur", Z, ne);
  }
  function it(o, d) {
    const l = a.settings.bands.find((g) => g.id === d);
    if (!l) return;
    const h = o.shiftKey ? 0.1 : 0.5, E = o.shiftKey ? 1.01 : 1.06;
    let S = null;
    o.key === "ArrowUp" ? S = ge(a.settings, d, l.frequency_hz, l.gain_db + h, a.sampleRate) : o.key === "ArrowDown" ? S = ge(a.settings, d, l.frequency_hz, l.gain_db - h, a.sampleRate) : o.key === "ArrowRight" ? S = ge(a.settings, d, l.frequency_hz * E, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? S = ge(a.settings, d, l.frequency_hz / E, l.gain_db, a.sampleRate) : o.key === "+" ? S = Te(a.settings, d, 1.15) : o.key === "-" ? S = Te(a.settings, d, 1 / 1.15) : o.key === "0" ? S = vt(a.settings, d) : (o.key === "Delete" || o.key === "Backspace") && (S = He(a.settings, d)), S && (o.preventDefault(), _(S));
  }
  k.addEventListener("keydown", (o) => {
    x && o.target === k && it(o, x);
  }), k.addEventListener("dblclick", (o) => {
    if (a.readonly || P) return;
    const d = k.getBoundingClientRect(), l = Y.width / (d.width || Y.width), h = Y.height / (d.height || Y.height), E = (o.clientX - d.left) * l, S = (o.clientY - d.top) * h, g = Rn(a.settings, ht(z(), E), gt(z(), S), a.sampleRate);
    g ? (x = g.bands[g.bands.length - 1].id, _(g)) : (a = { ...a, note: `the EQ has at most ${$e} bands` }, X());
  }), r.append(new Option("preset…", "")), je ??= un(t).then((o) => o.manual).catch(() => []), je.then((o) => {
    f = o;
    for (const d of o) r.append(new Option(d.name, d.name));
    r.value = nt();
  }), r.addEventListener("change", async () => {
    const o = (await je)?.find((d) => d.name === r.value);
    o && (u = o.name, _(tt(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    p = mt.find((d) => d === o) ?? 12, X();
  }), c.addEventListener("click", () => {
    const o = N.undo();
    o && _(o, { record: !1 });
  }), y.addEventListener("click", () => {
    const o = N.redo();
    o && _(o, { record: !1 });
  }), b.addEventListener("click", () => {
    x = null, _(ye());
  }), w.addEventListener("click", () => {
    P = !P, X();
  }), q.addEventListener("click", () => {
    Re(!Oe()), X();
  });
  function De() {
    for (const o of ["mode", Se]) {
      const d = te(e, o);
      if (!d || d.plenioWatched) continue;
      d.plenioWatched = !0;
      const l = d.callback;
      d.callback = (h) => {
        l?.(h), setTimeout(() => {
          Oe() || Re(!1), G();
        });
      };
    }
  }
  De(), Re(!1), G(0);
  let rt = null, st = null;
  const Zt = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(Zt);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), d = String(W()?.value ?? "");
    o === rt && d === st || (rt = o, st = d, De(), G(0));
  }, 700);
  return {
    showExecuted(o) {
      const d = o?.plenio_eq, l = d?.[d.length - 1];
      if (!l) return;
      const h = String(te(e, "mode")?.value ?? "flat") === "manual";
      a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !h,
        note: h ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, h ? G(0) : X();
    }
  };
}
const Ze = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, jn = new Set(xe.map((e) => Je[e]));
function In(e, t) {
  return !(e in Ze) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => jn.has(n) && zt(i)).map(([n]) => n);
}
function Wn(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function Gn(e, t) {
  const n = Ze[e.name];
  if (!n || !t) return t;
  const i = Wn(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const y = In(e.name, c.widgets_values_named);
  if (y.length) {
    const b = { ...c.widgets_values_named };
    for (const w of y) b[w] = "";
    c = { ...c, widgets_values_named: b };
  }
  return c;
}
const Ht = /* @__PURE__ */ new Map(), Xe = /* @__PURE__ */ new Set();
function _t(e, t) {
  Ht.set(e, t);
  for (const n of Xe) n(e);
}
function Et(e) {
  return Ht.get(e) ?? null;
}
function Qn(e) {
  return Xe.add(e), () => Xe.delete(e);
}
const Ft = /* @__PURE__ */ new Map();
function Vn(e) {
  e?.draft_sha256 && Ft.set(e.draft_sha256, e);
}
function Xn(e) {
  return e ? Ft.get(e) ?? null : null;
}
const et = "plenio.sheet_state/1", Ce = ["title", "style", "lyrics", "score", "artwork_prompt"];
function jt() {
  return { schema: et, docs: {} };
}
function kt(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return jt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== et || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Yn(e) {
  const t = {};
  for (const i of Ce) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: et, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Ie(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Un(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ce.filter((i) => Ie(e, i) !== "auto").map(
    (i) => i === "lyrics" && Ie(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${Ie(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function St(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function Oi(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: St(r?.[0] ?? 0), end: St(s?.[1] ?? e.duration_s) };
  }) : [];
}
function We(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Jn(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Ri(e, t, n) {
  return n.map((i) => ({ kind: i, text: Jn(e, t, i), intent: "keep" }));
}
function Pi(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], y = t?.docs[s.kind], b = We(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: b };
    else if (s.intent === "rebase")
      y?.upstream_sha256 ? i[s.kind] = { state: "edited", text: b, base_sha256: y.upstream_sha256 } : i[s.kind] = { state: "manual", text: b };
    else if (c)
      We(c.text) !== b && (i[s.kind] = { ...c, text: b });
    else {
      const w = We(y?.upstream ?? "");
      if (b === w) continue;
      i[s.kind] = y?.upstream_sha256 ? { state: "edited", text: b, base_sha256: y.upstream_sha256 } : { state: "manual", text: b };
    }
  }
  const r = { ...jt(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Di(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Kn(e, t) {
  return Ce.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Ti(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const It = "PLENIO_SHEET_STATE";
let Ye = null;
function Zn(e) {
  Ye = e;
}
const ei = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…", r.append(c, s);
  const y = () => {
    const w = Et(String(e.id)), q = w ? ` · ${w.status}` : "";
    s.textContent = Un(kt(i)) + q;
  }, b = e.addDOMWidget(t, It, r, {
    getValue: () => i,
    setValue: (w) => {
      i = typeof w == "string" ? w : "", y();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return c.addEventListener("click", async (w) => {
    w.stopPropagation();
    const q = kt(i);
    q === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const M = Et(String(e.id)), k = (e.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), j = q ?? { schema: "plenio.sheet_state/1", docs: {} }, R = M?.owned ?? Kn(k, j), I = String(e.widgets?.find((p) => p.name === "review")?.value ?? "continue"), K = I === "as the brief says" ? M?.review ?? "continue" : I, { openSheetDialog: a } = await import("./open-BC4vgX2L.mjs"), { parseGuide: x, serializeGuide: P } = await import("./tracks-DEywwRcM.mjs");
    if (!Ye) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: j,
      payload: M,
      asrNote: Xn(M?.docs.lyrics?.upstream_sha256),
      owned: R.length ? R : [...Ce],
      review: K,
      fetcher: Ye,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: x(e.properties?.plenio_guide),
      onApply: (p, u) => {
        b.value = Yn(p), e.properties = { ...e.properties ?? {}, plenio_guide: P(u) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Qn((w) => {
    w === String(e.id) && y();
  }), y(), { widget: b };
}, ve = "plenio.stem_mix/1", fe = "rest", ti = ["reverb", "delay"], Wt = -60, ni = 12;
function ii() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function J(e, t) {
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
function Gt(e) {
  const t = ii();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const ri = ["vocals", "drums", "bass", "other"];
function si() {
  return [...ri, fe];
}
function oi(e) {
  if (typeof e != "string" || !e.trim()) return { schema: ve, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== ve || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function ai(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || Gt(J(e, i))) continue;
    const r = {}, s = J(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: ve, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Ne(e, t, n) {
  const i = { ...e.strips };
  return Gt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function li(e, t, n) {
  const i = n.some((s) => J(e, s).solo), r = J(e, t);
  return i ? r.solo : !r.mute;
}
function At(e) {
  return e <= Wt ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function ci(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function di(e, t, n) {
  return ci([...e, [t, n]]);
}
function ui(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function pi(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function fi(e, t, n, i) {
  const r = J(e, t);
  return Ne(e, t, { ...r, muted: di(r.muted, n, i) });
}
function mi(e, t, n) {
  const i = J(e, t), r = ui(i.muted, n);
  return r < 0 ? e : Ne(e, t, { ...i, muted: pi(i.muted, r) });
}
function hi(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function gi(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function qt(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : si()).filter((s) => s !== fe), r = Object.keys(e?.strips ?? {}).filter((s) => s !== fe && !i.includes(s));
  return [...i, ...r, fe];
}
const $t = "plenio_stem_mixer", Mt = "mix", ie = 200, bi = ["room", "plate", "hall"];
function A(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function qe(e, t, n, i, r) {
  const s = A("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function yi(e) {
  const t = A("div", "plenio-mix"), n = A("div", "plenio-mix-strips"), i = A("div", "plenio-mix-buses"), r = A("div", "plenio-mix-info"), s = A("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: ve, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: qt(null, null),
    peaks: {},
    seconds: 0
  }, y = !1;
  const b = () => e.widgets?.find((p) => p.name === Mt);
  function w(p, { draw: u = !0 } = {}) {
    const f = b();
    if (!f) return;
    const m = ai(p);
    f.value = m, f.callback?.(m), c = { ...c, mix: p }, u && k();
  }
  function q(p, u, f = {}) {
    w(Ne(c.mix, p, { ...J(c.mix, p), ...u }), f);
  }
  function M(p, u, f, m = {}) {
    const $ = J(c.mix, p);
    let v = Ne(c.mix, p, { ...$, [u]: f });
    f > 0 && !(v[u] && Object.keys(v[u]).length) && (v = u === "reverb" ? { ...v, reverb: { preset: "room" } } : { ...v, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), w(v, m);
  }
  function O(p, u, f) {
    const m = { ...c.mix[p] ?? {} };
    w({ ...c.mix, [p]: { ...m, [u]: f } });
  }
  function k() {
    n.replaceChildren();
    const p = c.names;
    for (const u of c.names) {
      const f = J(c.mix, u), m = A("div", "plenio-mix-strip");
      m.dataset.strip = u;
      const $ = A("span", "name", u === fe ? `${u} (missed)` : u);
      $.title = u === fe ? "What the separator missed: keeps a neutral mix exact" : "";
      const v = qe(Wt, ni, 0.5, f.gain_db, `${u} gain`), T = A("span", "gain", `${At(f.gain_db)} dB`);
      v.addEventListener("input", () => {
        T.textContent = `${At(Number(v.value))} dB`, q(u, { gain_db: Number(v.value) }, { draw: !1 });
      }), v.addEventListener("change", () => q(u, { gain_db: Number(v.value) }));
      const C = A("button", f.mute ? "toggle active" : "toggle", "M");
      C.setAttribute("aria-label", `${u} mute`), C.addEventListener("click", (_) => {
        _.stopPropagation(), q(u, { mute: !f.mute });
      });
      const H = A("button", f.solo ? "toggle active" : "toggle", "S");
      H.setAttribute("aria-label", `${u} solo`), H.addEventListener("click", (_) => {
        _.stopPropagation(), q(u, { solo: !f.solo });
      });
      const D = qe(0, 1, 0.05, f.compression, `${u} compression`);
      D.title = "Compression amount: one knob for the master compressor (threshold and ratio)", D.addEventListener("input", () => q(u, { compression: Number(D.value) }, { draw: !1 })), D.addEventListener("change", () => q(u, { compression: Number(D.value) }));
      const N = ti.map((_) => {
        const G = qe(0, 1, 0.05, f[_], `${u} ${_} send`);
        return G.title = `${_} send: how much of this stem goes to the shared ${_} bus`, G.addEventListener("input", () => M(u, _, Number(G.value), { draw: !1 })), G.addEventListener("change", () => M(u, _, Number(G.value))), G;
      }), W = A("button", f.save ? "toggle active" : "toggle", "save");
      W.setAttribute("aria-label", `${u} save as its own file`), W.setAttribute("aria-pressed", String(f.save)), W.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", W.addEventListener("click", (_) => {
        _.stopPropagation(), q(u, { save: !f.save });
      });
      const ze = li(c.mix, u, p);
      m.classList.toggle("silent", !ze);
      const z = A("canvas", "plenio-mix-wave");
      z.width = ie, z.height = 26, z.setAttribute("aria-label", `${u} waveform (drag to mute a time range)`), j(z, f, gi(c.peaks, u, ie)), z.addEventListener("pointerdown", (_) => R(_, z, u)), m.append(
        $,
        v,
        T,
        C,
        H,
        A("span", "label", "comp"),
        D,
        A("span", "label", "verb"),
        N[0],
        A("span", "label", "delay"),
        N[1],
        W,
        z
      ), n.append(m);
    }
    I(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function j(p, u, f) {
    const m = p.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, ie, p.height);
    const $ = p.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let v = 0; v < f.length; v++) {
      const T = Math.max(1, f[v] * ($ - 1));
      m.moveTo(v + 0.5, $ - T), m.lineTo(v + 0.5, $ + T);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [v, T] of u.muted) {
      const C = Math.max(0, Math.min(ie, v / Math.max(c.seconds, 1e-6) * ie)), H = Math.max(0, Math.min(ie, T / Math.max(c.seconds, 1e-6) * ie));
      m.fillRect(C, 0, Math.max(1, H - C), p.height), m.strokeRect(C + 0.5, 0.5, Math.max(1, H - C) - 1, p.height - 1);
    }
  }
  function R(p, u, f) {
    if (p.preventDefault(), p.stopPropagation(), !c.seconds) return;
    const m = u.getBoundingClientRect(), $ = (N) => Math.max(0, Math.min(1, (N - m.left) / (m.width || ie))) * c.seconds, v = $(p.clientX);
    if (J(c.mix, f).muted.some(([N, W]) => N <= v && v <= W)) {
      w(mi(c.mix, f, v));
      return;
    }
    let C = v;
    const H = (N) => {
      C = $(N.clientX);
    }, D = () => {
      window.removeEventListener("pointermove", H), window.removeEventListener("pointerup", D), w(fi(c.mix, f, Math.min(v, C), Math.max(v, C)));
    };
    window.addEventListener("pointermove", H), window.addEventListener("pointerup", D);
  }
  function I() {
    i.replaceChildren();
    const p = { preset: "room", ...c.mix.reverb ?? {} }, u = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = A("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const v of bi) f.append(new Option(v, v));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => O("reverb", "preset", f.value));
    const m = A("input");
    m.type = "number", m.value = String(u.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => O("delay", "time_ms", Number(m.value)));
    const $ = qe(0, 0.8, 0.05, Number(u.feedback ?? 0.35), "Delay feedback");
    $.title = "Delay feedback: how much of each echo returns into the delay line", $.addEventListener("input", () => O("delay", "feedback", Number($.value))), i.append(
      A("span", "label", "reverb bus"),
      f,
      A("span", "label", "delay bus"),
      m,
      A("span", "label", "ms, feedback"),
      $
    ), i.style.display = "flex";
  }
  const K = e.addDOMWidget($t, $t, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  K.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Mt), x = A("button", "toggle", "JSON");
  x.title = "Show or hide the raw mixer value", x.addEventListener("click", (p) => {
    p.stopPropagation(), y = !y, x.classList.toggle("active", y), a && (a.plenioHidden = !y, y ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(A("span", "label", "Advanced"), x), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function P() {
    const p = oi(b()?.value);
    c = { ...c, mix: p ?? { schema: ve, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), k();
  }
  return P(), {
    showExecuted(p) {
      const u = p?.plenio_stems?.at(-1), f = hi(p), m = qt(c.mix, u ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(u?.seconds ?? c.seconds) || 0 }, P();
    }
  };
}
const vi = `
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
.plenio-brief-template .actions { display: flex; gap: 4px; }
.plenio-brief-template button { padding: 1px 6px; border-radius: 5px; border: 1px solid var(--border-color, #555);
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
function xi() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = vi, document.head.append(e);
}
function Ue(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ge(e) {
  return Ue(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function wi(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${Ue(i.join(`
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
      t.push(`<h${b}>${Ge(c[2])}</h${b}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(s);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Ge(y[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${Ge(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${Ue(i.join(`
`))}</code></pre>`), t.join("");
}
const Qe = "plenio_summary", Lt = "plenio_summary";
function _i(e) {
  const t = e.widgets?.find((r) => r.name === Lt);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(Lt, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function Nt(e, t) {
  if (!t.markdown) return;
  const n = _i(e);
  n.dataset.status = t.status ?? "", n.innerHTML = wi(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function Ei(e) {
  e.prototype.onExecuted = de(e.prototype.onExecuted, function(t) {
    const n = t?.[Qe], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Qe] = { markdown: i.markdown, status: i.status ?? "" }, Nt(this, i));
  }), e.prototype.onConfigure = de(e.prototype.onConfigure, function() {
    const t = this.properties?.[Qe];
    t?.markdown && Nt(this, t);
  });
}
const ki = "Plenio.Core", Le = ln;
Zn(Le);
cn.registerExtension({
  name: ki,
  getCustomWidgets: () => ({ [It]: ei }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ei(e);
    const n = Ln(t.input);
    if (n.size || t.name in Ze) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = Gn(t, r), c = Sn(s), y = i?.call(this, s);
        return Mn(this, c, n), y;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = de(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) Vn(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, Fn(this, Le));
      }, e.prototype.onExecuted = de(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (_n.has(t.name) && En(e, Le), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, yi(this));
      }, e.prototype.onExecuted = de(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = de(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && _t(String(this.id), s);
    }));
  },
  setup() {
    xi(), Le.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && _t(String(t.node_id), t);
    });
  }
});
export {
  ki as E,
  Ct as P,
  zi as a,
  Mi as b,
  Oi as c,
  Yn as d,
  Ni as e,
  We as f,
  $i as g,
  Ci as i,
  Pi as n,
  qi as r,
  Ri as s,
  Li as t,
  Ti as u,
  Bi as v,
  Di as w
};
