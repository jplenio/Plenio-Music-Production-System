import { api as yr } from "../../../../scripts/api.js";
import { app as wn } from "../../../../scripts/app.js";
class it extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function le(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), s = await r.json();
  if (!r.ok) {
    const o = s?.error ?? {};
    throw new it(o.message ?? `Request failed (${r.status})`, o.hint ?? null);
  }
  return s;
}
function vr(e, t) {
  return le(e, "/plenio/sheet/resolve", t);
}
async function Qo(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Nt(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function wr(e, t, n, r) {
  return le(e, "/plenio/score/analyze", Nt({ abc: t }, n, r));
}
function Jo(e, t, n, r, s) {
  return le(e, "/plenio/score/transform", Nt({ abc: t, operation: n }, r, s));
}
function Ko(e, t) {
  const { lyrics: n, spans: r, ...s } = t;
  return le(e, "/plenio/score/musicxml/export", Nt(s, n, r));
}
function Zo(e, t) {
  return le(e, "/plenio/score/midi/export", t);
}
function ei(e, t) {
  return le(e, "/plenio/score/midi/import", t);
}
function ti(e, t) {
  return le(e, "/plenio/lyrics/analyze", t);
}
function ni(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Bt(e, t, n, r = 200) {
  return le(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
function xr(e, t) {
  return le(e, "/plenio/brief/fields", t);
}
async function _r(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new it(`Request failed (${t.status})`);
  return await t.json();
}
function te(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const De = [
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
], Sr = ["length", "vocals", "melody"], qt = {
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
}, kr = "custom";
function xn(e) {
  return typeof e == "string" && e.trim().toLowerCase() === kr;
}
function Ne(e, t) {
  const n = qt[t];
  if (n)
    return (e.widgets ?? []).find((r) => r.name === n);
}
function Er(e) {
  const t = {};
  for (const n of [...De, ...Sr]) {
    const r = Ne(e, n);
    r && (t[n] = typeof r.value == "string" ? r.value : String(r.value ?? ""));
  }
  return t;
}
function Mr(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function Ht(e, t) {
  const n = [];
  for (const r of t.fills) {
    if (!De.includes(r.field)) continue;
    const s = Ne(e, r.field);
    s && !String(s.value ?? "").trim() && r.value && n.push({ field: r.field, value: r.value });
  }
  return n;
}
function Wt(e) {
  const t = [];
  for (const n of De) {
    const r = Ne(e, n);
    r && String(r.value ?? "").trim() && t.push(r);
  }
  return t;
}
function kt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Ar(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((r) => `${r.field} (${Nr(r.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function $r(e) {
  const t = e ? kt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Lr(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Nr(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Ft(e, t) {
  for (const n of t) {
    const r = Ne(e, n.field);
    r && (r.value = n.value, r.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function qr(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function _n(e) {
  const t = [];
  for (const n of De) {
    const r = Ne(e, n);
    !r || !xn(r.value) || (r.value = "", r.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Gt = "plenio_brief_template", Tr = 400;
function zr(e, t) {
  let n = null, r = !1, s = null, o;
  const i = document.createElement("div");
  i.className = "plenio-brief-template";
  const a = document.createElement("div");
  a.className = "line";
  const l = document.createElement("div");
  l.className = "hint";
  const u = document.createElement("div");
  u.className = "actions", i.append(a, l, u);
  const f = (b, g, y) => {
    const x = document.createElement("button");
    return x.textContent = b, x.title = g, x.addEventListener("click", (z) => {
      z.stopPropagation(), y();
    }), u.append(x), x;
  }, m = f("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Ft(e, Ht(e, n).map((b) => ({ field: b.field, value: b.value }))), _());
  }), w = f("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Ft(e, kt(n)), _());
  }), v = f("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const b = Wt(e);
    b.length && window.confirm(`Clear ${b.length} text field(s)? The template's values apply again.`) && (qr(e, b), _());
  }), L = f("↻", "Ask again what the template fills", () => {
    H();
  }), _ = () => {
    const b = Ar(n, r);
    a.textContent = s ?? b ?? "The template fills nothing: every text field has your value.", a.dataset.state = s ? "error" : r && n ? "ok" : "empty";
    const g = $r(n), y = Lr(n);
    l.textContent = [g, y].filter(Boolean).join(" · "), l.style.display = l.textContent ? "" : "none", u.style.display = r && n && n.template !== "none" ? "" : "none", m.disabled = !n || !Ht(e, n).length, w.disabled = !n || !kt(n).length, v.disabled = !Wt(e).length, L.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, E = /* @__PURE__ */ new WeakSet(), W = () => {
    for (const b of ["template", ...Object.keys(qt)]) {
      const g = b === "template" ? e.widgets?.find((y) => y.name === "template") : Ne(e, b);
      !g || E.has(g) || (E.add(g), g.callback = te(g.callback, () => {
        W(), H();
      }));
    }
  }, d = async () => {
    W();
    const b = String(e.widgets?.find((g) => g.name === "template")?.value ?? "none");
    try {
      n = await xr(t, { fields: Er(e), template: b, kind: Mr(e) }), s = null;
    } catch (g) {
      n = null, s = `The template fields could not be read: ${g instanceof Error ? g.message : String(g)}`;
    }
    r = !0, _();
  };
  function H() {
    clearTimeout(o), o = setTimeout(() => {
      d();
    }, Tr);
  }
  W();
  const $ = e.addDOMWidget(Gt, Gt, i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return $.serialize = !1, _n(e), _(), H(), {
    widget: $,
    refresh: H,
    answer: () => n,
    dispose: () => clearTimeout(o)
  };
}
const Cr = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Ir(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = e.prototype, s = r.onNodeCreated;
  r.onNodeCreated = function() {
    s?.call(this), n.set(this, zr(this, t));
  };
  const o = r.onConfigure;
  r.onConfigure = function(i) {
    o?.call(this, i), _n(this), n.get(this)?.refresh();
  };
}
const Or = "COMFY_DYNAMICCOMBO_V3";
function Rr(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Pr(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Dr(e, t) {
  const n = Pr(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, s) => r.value === t[s]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function Br(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Hr(e, t, n) {
  if (!t || !e.widgets || Dr(e, t)) return !1;
  let r = 0;
  for (let s = 0; s < e.widgets.length; s++) {
    const o = e.widgets[s];
    if (o.serialize === !1) continue;
    let i;
    if (Array.isArray(t)) {
      if (r >= t.length) break;
      i = t[r++];
    } else if (o.name in t)
      i = t[o.name];
    else
      continue;
    if (n.has(o.name) && !Br(o, i)) return !0;
    o.value !== i && (o.value = i);
  }
  return !0;
}
function Wr(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === Or && t.add(r);
  return t;
}
const Sn = "plenio.eq/1", Ke = 8, he = 20, Fr = 2e4, $e = 12, kn = 15, Ee = ["peak", "low_shelf", "high_shelf"], En = ["peak", "notch", "highpass", "lowpass"], Vt = [0.2, 10], jt = [0.25, 1];
function Se() {
  return { schema: Sn, preamp_db: 0, bands: [] };
}
function Gr(e) {
  if (typeof e != "string" || !e.trim()) return Se();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Sn,
      preamp_db: typeof t.preamp_db == "number" ? t.preamp_db : 0,
      bands: t.bands.map((n, r) => ({
        id: typeof n.id == "string" && n.id ? n.id : `band-${r + 1}`,
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
function ke(e) {
  return JSON.stringify(e);
}
const Q = (e, t) => Number(e.toFixed(t));
function V(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Mn(e) {
  return e.db ?? kn;
}
const Xt = [6, 12, 18], Vr = { 6: 8, 12: 14, 18: 20 };
function jr(e, t) {
  return { ...e, db: Vr[t] ?? kn };
}
function be(e, t) {
  return Math.log(V(t, he, e.maxHz) / he) / Math.log(e.maxHz / he) * e.width;
}
function Yt(e, t) {
  return he * (e.maxHz / he) ** V(t / e.width, 0, 1);
}
function pe(e, t) {
  const n = Mn(e);
  return (1 - (V(t, -n, n) + n) / (2 * n)) * e.height;
}
function Ut(e, t) {
  const n = Mn(e);
  return (1 - V(t / e.height, 0, 1)) * 2 * n - n;
}
function Qt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Jt(e, t, n) {
  return t.map((r, s) => `${s ? "L" : "M"}${be(e, r).toFixed(1)},${pe(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function Tt(e) {
  return Math.min(Fr, 0.45 * e);
}
function Xr(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Yr(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Ke) return null;
  const s = {
    id: Xr(e),
    enabled: !0,
    type: "peak",
    frequency_hz: Q(V(t, he, Tt(r)), 1),
    gain_db: Q(V(n, -$e, $e), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function qe(e, t, n, r, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (o) => o.id !== t ? o : {
        ...o,
        frequency_hz: Q(V(n, he, Tt(s)), 1),
        gain_db: Ee.includes(o.type) ? Q(V(r, -$e, $e), 1) : o.gain_db
      }
    )
  };
}
function mt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: Q(V(r.q * n, 0.2, 10), 3) } : r)
  };
}
function gt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Te(e) {
  const t = e.frequency_hz >= 1e3 ? `${Q(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Ee.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${Q(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${Q(e.q, 2)}`;
}
function Ur(e, t) {
  const n = An[e.type] ?? e.type, r = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Ee.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", o = En.includes(e.type) ? ` Q ${Q(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${r}${s}${o}${e.enabled ? "" : " (off)"}`;
}
const An = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function bt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), r = 1;
  if (t && /k$/i.test(n) && (r = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const s = Number(n) * r;
  return Number.isFinite(s) ? s : null;
}
function Ge(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Ze(e, t, n, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const o = { ...s, ...n };
      return {
        ...o,
        frequency_hz: Q(V(Ge(o.frequency_hz, s.frequency_hz), he, Tt(r)), 1),
        gain_db: Q(V(Ge(o.gain_db, s.gain_db), -$e, $e), 1),
        q: Q(V(Ge(o.q, s.q), Vt[0], Vt[1]), 3),
        slope: Q(V(Ge(o.slope, s.slope), jt[0], jt[1]), 2),
        enabled: o.enabled !== !1
      };
    })
  };
}
function Kt(e, t) {
  return Ze(e, t, { gain_db: 0 });
}
function Zt(e, t, n, { heightFraction: r = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((m) => Number.isFinite(m));
  if (!s.length) return "";
  const o = Math.max(...s), i = Math.min(...s), a = Math.max(o - i, 1e-6), l = e.height - 4, u = l - Math.max(12, e.height * V(r, 0.1, 0.95));
  return `M${t.map((m, w) => {
    const v = n[w], L = Number.isFinite(v) ? (v - i) / a : 0;
    return `${be(e, m).toFixed(1)},${(l - L * (l - u)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${l.toFixed(1)} L0,${l.toFixed(1)} Z`;
}
class Qr {
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
    ke(t) !== ke(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Jr = "http://www.w3.org/2000/svg", en = "plenio_eq_panel", Ve = "mode.bands", ue = { capture: !0 }, Z = { width: 560, height: 260 }, je = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let yt = null;
function ie(e, t) {
  const n = document.createElementNS(Jr, e);
  for (const [r, s] of Object.entries(t)) n.setAttribute(r, String(s));
  return n;
}
function G(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function ge(e, t, n) {
  const r = document.createElement("button");
  return r.className = e, r.textContent = t, r.setAttribute("aria-label", n), r.title = n, r;
}
function ae(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Kr(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, r) => {
    const s = t.bands[r];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function Zr(e, t) {
  const n = G("div", "plenio-eq"), r = G("div", "plenio-eq-tools"), s = G("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const o = G("select");
  o.setAttribute("aria-label", "Gain range"), o.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const c of Xt) o.append(new Option(`±${c} dB`, String(c)));
  const i = ge("", "↶", "Undo the last band change"), a = ge("", "↷", "Redo the last band change"), l = ge("", "reset", "Remove every band"), u = ge("", "compare", "Show the curve without the EQ (bypass)"), f = ge("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), m = G("span", "plenio-eq-info");
  m.setAttribute("aria-live", "polite"), m.title = "What the panel is showing right now (the selected band, a note, or a hint)", r.append(s, o, i, a, l, u, f, m);
  const w = G("div", "plenio-eq-mode"), v = ie("svg", {
    viewBox: `0 0 ${Z.width} ${Z.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  v.setAttribute("aria-label", "EQ response curve"), v.setAttribute("tabindex", "0"), v.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const L = G("div", "plenio-eq-strip"), _ = G("div", "plenio-eq-editor"), E = G("div", "plenio-eq-fields");
  _.append(E), n.append(r, w, v, L, _);
  const W = e.addDOMWidget(en, en, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  let d = { sampleRate: 48e3, frequencies: [], response: [], settings: Se(), readonly: !0, note: "" }, H = null, $ = null, b = !1, g = 12, y = null, x = [], z = 0, M, j, N = null, P = !1;
  const F = /* @__PURE__ */ new Map();
  let q = null;
  const D = new Qr(Se()), re = () => ae(e, Ve), X = () => g, C = () => jr({ ...Z, maxHz: Math.min(2e4, d.sampleRate / 2) }, X());
  function I(c, { record: h = !0 } = {}) {
    const p = re();
    if (!p) return;
    const S = ke(c);
    p.value = S, p.callback?.(S), h && D.push(c), d = { ...d, settings: c }, K(), ce(0);
  }
  async function ce(c = 120) {
    clearTimeout(M), M = setTimeout(async () => {
      const h = String(ae(e, "mode")?.value ?? "flat");
      if (h !== "manual") {
        h === "flat" ? d = {
          ...d,
          settings: Se(),
          response: d.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : H !== h ? d = {
          ...d,
          settings: Se(),
          response: d.frequencies.map(() => 0),
          readonly: !0,
          note: `${h}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : d = { ...d, readonly: !0 }, K();
        return;
      }
      const p = Gr(re()?.value);
      if (!p) {
        d = { ...d, readonly: !0, note: "the bands are not valid JSON" }, K();
        return;
      }
      ke(p) !== ke(D.current) && D.reset(p);
      const S = ++z;
      try {
        const A = await Bt(t, p, d.sampleRate);
        if (S !== z) return;
        d = {
          ...d,
          frequencies: A.frequency_hz,
          response: A.response_db,
          settings: A.settings,
          readonly: !1,
          note: ""
        };
      } catch (A) {
        d = { ...d, readonly: !1, note: A instanceof Error ? A.message : String(A) };
      }
      K();
    }, c);
  }
  const se = (c) => ({
    ...c.settings,
    bands: c.settings.bands.slice(0, Ke)
  });
  function xe() {
    if (!y) return "";
    const c = x.find((h) => h.name === y);
    return c && Kr(se(c), d.settings) ? y : "";
  }
  function K() {
    v.replaceChildren(), F.clear(), q = null;
    const c = C();
    for (const p of [-c.db, -c.db / 2, 0, c.db / 2, c.db])
      v.append(
        ie("line", { x1: 0, x2: c.width, y1: pe(c, p), y2: pe(c, p), class: p ? "grid" : "grid zero" })
      );
    for (const p of [100, 1e3, 1e4])
      v.append(ie("line", { x1: be(c, p), x2: be(c, p), y1: 0, y2: c.height, class: "grid" }));
    d.beforeDb?.length === d.frequencies.length && v.append(ie("path", { d: Zt(c, d.frequencies, d.beforeDb), class: "spectrum before" })), d.afterDb?.length === d.frequencies.length && v.append(ie("path", { d: Zt(c, d.frequencies, d.afterDb), class: "spectrum after" })), b ? v.append(ie("line", { x1: 0, x2: c.width, y1: pe(c, 0), y2: pe(c, 0), class: "curve flat" })) : d.frequencies.length && (q = ie("path", { d: Jt(c, d.frequencies, d.response), class: "curve" }), v.append(q)), !d.readonly && !b && d.settings.bands.forEach((p, S) => {
      const A = je[S % je.length], O = Ee.includes(p.type) ? p.gain_db : 0, k = ie("circle", {
        cx: be(c, p.frequency_hz),
        cy: pe(c, O),
        r: p.id === $ ? 9 : 7,
        class: p.id === $ ? "handle selected" : "handle",
        style: `stroke: ${A}`,
        tabindex: 0,
        "data-band": p.id
      });
      k.setAttribute("aria-label", `Band ${S + 1}: ${Te(p)}`), p.enabled || k.classList.add("disabled"), k.append(ie("title", {})), k.lastChild.textContent = `Band ${S + 1}: ${Te(p)}`, k.addEventListener("pointerdown", (B) => cr(B, p.id)), k.addEventListener("dblclick", (B) => {
        B.stopPropagation(), I(Kt(d.settings, p.id));
      }), k.addEventListener("focus", () => ir(p.id)), k.addEventListener("keydown", (B) => Ot(B, p.id)), k.addEventListener("wheel", (B) => {
        B.preventDefault();
        const me = B.deltaY < 0 ? 1.15 : 1 / 1.15;
        I(mt(d.settings, p.id, me));
      }), k.addEventListener("contextmenu", (B) => {
        B.preventDefault(), I(gt(d.settings, p.id));
      }), v.append(k), F.set(p.id, k);
    }), rr(), sr(), or();
    const h = d.settings.bands.find((p) => p.id === $);
    m.textContent = d.note || (b ? "compare: the curve is off (the node still applies it)" : h ? Te(h) : d.readonly ? `${d.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${d.settings.bands.length}/${Ke}`), s.disabled = d.readonly, i.disabled = !D.canUndo, a.disabled = !D.canRedo, l.disabled = d.readonly || !d.settings.bands.length, P && (P = !1, $ && F.get($)?.focus({ preventScroll: !0 })), o.value = String(g), s.value = xe(), u.classList.toggle("active", b), f.classList.toggle("active", dt()), e.setDirtyCanvas?.(!0, !0);
  }
  function rr() {
    if (L.replaceChildren(), d.readonly && !d.settings.bands.length) {
      L.append(G("span", "plenio-eq-hint", d.note || "no bands"));
      return;
    }
    d.settings.bands.forEach((c, h) => {
      const p = G("button", "plenio-eq-chip", Ur(c, h));
      p.style.borderLeftColor = je[h % je.length], p.classList.toggle("selected", c.id === $), p.classList.toggle("disabled", !c.enabled), p.setAttribute("aria-label", `Edit band ${h + 1}`), p.title = `Band ${h + 1}: ${Te(c)} - click to open its fields`, p.addEventListener("click", (S) => {
        S.stopPropagation(), $ = $ === c.id ? null : c.id, K();
      }), L.append(p);
    });
  }
  function sr() {
    E.replaceChildren();
    const c = d.settings.bands.find((k) => k.id === $);
    if (!c || d.readonly) {
      _.style.display = "none";
      return;
    }
    _.style.display = "";
    const h = G("span", "name", `Band ${d.settings.bands.indexOf(c) + 1}`);
    h.title = "The selected band";
    const p = G("select");
    p.setAttribute("aria-label", "Band type"), p.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [k, B] of Object.entries(An)) p.append(new Option(B, k));
    p.value = c.type, p.addEventListener("change", () => I(Ze(d.settings, c.id, { type: p.value })));
    const S = G("input");
    S.type = "checkbox", S.checked = c.enabled, S.setAttribute("aria-label", "Band enabled"), S.title = "Band enabled: off keeps the band in the list but out of the response", S.addEventListener("change", () => I(Ze(d.settings, c.id, { enabled: S.checked })));
    const A = [
      [
        "Hz",
        `${c.frequency_hz}`,
        70,
        (k) => pt(c.id, "frequency_hz", bt(k, { kilo: !0 }))
      ],
      ["dB", `${c.gain_db}`, 60, (k) => pt(c.id, "gain_db", bt(k))],
      ["Q", `${c.q}`, 60, (k) => pt(c.id, "q", bt(k))]
    ];
    E.append(h, p, S);
    for (const [k, B, me, He] of A) {
      const Y = G("input", "number");
      Y.value = B, Y.style.width = `${me}px`, Y.setAttribute("aria-label", `Band ${k}`), Y.title = k === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : k === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const We = () => {
        He(Y.value) || (Y.value = B);
      };
      Y.addEventListener("keydown", (oe) => {
        oe.key === "Enter" && We();
      }), Y.addEventListener("blur", We), (k === "dB" && !Ee.includes(c.type) || k === "Q" && !En.includes(c.type)) && (Y.disabled = !0), E.append(Y);
    }
    const O = ge("", "remove", "Remove this band");
    O.addEventListener("click", (k) => {
      k.stopPropagation(), $ = null, I(gt(d.settings, c.id));
    }), E.append(O);
  }
  function or() {
    w.replaceChildren();
    const c = String(ae(e, "mode")?.value ?? "flat");
    if (c === "manual" || c === "flat") {
      w.style.display = "none";
      return;
    }
    w.style.display = "", w.append(
      G(
        "span",
        "plenio-eq-hint",
        H === c ? `applied proposal (${d.settings.bands.length} band(s), ${c})` : `${c}: no proposal yet - it is computed on the next run`
      )
    );
    const h = ge("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    h.disabled = !d.settings.bands.length, h.addEventListener("click", (p) => {
      p.stopPropagation();
      const S = ae(e, "mode");
      if (!S) return;
      S.value = "manual", S.callback?.("manual");
      const A = re();
      if (A) {
        const O = ke(d.settings);
        A.value = O, A.callback?.(O);
      }
      D.reset(d.settings), ht(), ce(0);
    }), w.append(h);
  }
  function ir(c) {
    $ = c, P = !0, K();
  }
  function ar(c) {
    $ = c, ut();
  }
  function ut() {
    const c = C();
    d.settings.bands.forEach((p) => {
      const S = F.get(p.id);
      if (!S) return;
      const A = Ee.includes(p.type) ? p.gain_db : 0;
      S.setAttribute("cx", String(be(c, p.frequency_hz))), S.setAttribute("cy", String(pe(c, A))), S.classList.toggle("selected", p.id === $), S.setAttribute("r", p.id === $ ? "9" : "7");
    }), q && d.frequencies.length && q.setAttribute("d", Jt(c, d.frequencies, d.response));
    const h = d.settings.bands.find((p) => p.id === $);
    h && (m.textContent = Te(h));
  }
  function lr() {
    clearTimeout(j), j = setTimeout(async () => {
      const c = d.settings, h = ++z;
      try {
        const p = await Bt(t, c, d.sampleRate);
        if (h !== z) return;
        d = { ...d, frequencies: p.frequency_hz, response: p.response_db }, ut();
      } catch {
      }
    }, 60);
  }
  function dt() {
    return !ae(e, Ve)?.plenioHidden;
  }
  function ft(c) {
    const h = ae(e, Ve);
    h && (h.plenioHidden = !c, c ? delete h.computeSize : h.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function pt(c, h, p) {
    if (p === null) return !1;
    const S = d.settings.bands.find((A) => A.id === c);
    return S && S[h] === p || I(Ze(d.settings, c, { [h]: p })), !0;
  }
  function cr(c, h) {
    c.preventDefault(), c.stopPropagation(), $ !== h && ar(h);
    const p = d.settings.bands.find((J) => J.id === h);
    if (!p) return;
    N = { hz: p.frequency_hz, db: p.gain_db };
    let S = !1, A = !1;
    const O = c.currentTarget;
    try {
      O?.setPointerCapture?.(c.pointerId);
    } catch {
    }
    const k = v.getBoundingClientRect(), B = k.width ? k.left : 0, me = k.height ? k.top : 0, He = k.width || Z.width, Y = k.height || Z.height, We = (J, Fe) => J >= B - 1 && J <= B + He + 1 && Fe >= me - 1 && Fe <= me + Y + 1;
    function oe() {
      if (!A) {
        A = !0;
        try {
          O?.releasePointerCapture?.(c.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Dt, ue), window.removeEventListener("pointerup", oe, ue), window.removeEventListener("pointercancel", oe, ue), window.removeEventListener("blur", oe, ue), N = null, S && I(d.settings);
      }
    }
    const Dt = (J) => {
      if (A || !N) return;
      if (J.buttons === 0) {
        oe();
        return;
      }
      if (!We(J.clientX, J.clientY)) return;
      const Fe = Z.width / He, dr = Z.height / Y, fr = (J.clientX - B) * Fe, pr = (J.clientY - me) * dr, hr = be(C(), N.hz), mr = pe(C(), N.db), gr = Yt(C(), Qt(hr, fr, J.shiftKey)), br = Ut(C(), Qt(mr, pr, J.shiftKey));
      d = { ...d, settings: qe(d.settings, h, gr, br, d.sampleRate) }, S = !0, ut(), lr();
    };
    window.addEventListener("pointermove", Dt, ue), window.addEventListener("pointerup", oe, ue), window.addEventListener("pointercancel", oe, ue), window.addEventListener("blur", oe, ue);
  }
  function Ot(c, h) {
    const p = d.settings.bands.find((k) => k.id === h);
    if (!p) return;
    const S = c.shiftKey ? 0.1 : 0.5, A = c.shiftKey ? 1.01 : 1.06;
    let O = null;
    c.key === "ArrowUp" ? O = qe(d.settings, h, p.frequency_hz, p.gain_db + S, d.sampleRate) : c.key === "ArrowDown" ? O = qe(d.settings, h, p.frequency_hz, p.gain_db - S, d.sampleRate) : c.key === "ArrowRight" ? O = qe(d.settings, h, p.frequency_hz * A, p.gain_db, d.sampleRate) : c.key === "ArrowLeft" ? O = qe(d.settings, h, p.frequency_hz / A, p.gain_db, d.sampleRate) : c.key === "+" ? O = mt(d.settings, h, 1.15) : c.key === "-" ? O = mt(d.settings, h, 1 / 1.15) : c.key === "0" ? O = Kt(d.settings, h) : (c.key === "Delete" || c.key === "Backspace") && (O = gt(d.settings, h)), O && (c.preventDefault(), I(O));
  }
  v.addEventListener("keydown", (c) => {
    $ && c.target === v && Ot(c, $);
  }), v.addEventListener("dblclick", (c) => {
    if (d.readonly || b) return;
    const h = v.getBoundingClientRect(), p = Z.width / (h.width || Z.width), S = Z.height / (h.height || Z.height), A = (c.clientX - h.left) * p, O = (c.clientY - h.top) * S, k = Yr(d.settings, Yt(C(), A), Ut(C(), O), d.sampleRate);
    k ? ($ = k.bands[k.bands.length - 1].id, I(k)) : (d = { ...d, note: `the EQ has at most ${Ke} bands` }, K());
  }), s.append(new Option("preset…", "")), yt ??= _r(t).then((c) => c.manual).catch(() => []), yt.then((c) => {
    x = c;
    for (const h of c) s.append(new Option(h.name, h.name));
    s.value = xe();
  }), s.addEventListener("change", async () => {
    const c = (await yt)?.find((h) => h.name === s.value);
    c && (y = c.name, I(se(c)));
  }), o.addEventListener("change", () => {
    const c = Number(o.value);
    g = Xt.find((h) => h === c) ?? 12, K();
  }), i.addEventListener("click", () => {
    const c = D.undo();
    c && I(c, { record: !1 });
  }), a.addEventListener("click", () => {
    const c = D.redo();
    c && I(c, { record: !1 });
  }), l.addEventListener("click", () => {
    $ = null, I(Se());
  }), u.addEventListener("click", () => {
    b = !b, K();
  }), f.addEventListener("click", () => {
    ft(!dt()), K();
  });
  function ht() {
    for (const c of ["mode", Ve]) {
      const h = ae(e, c);
      if (!h || h.plenioWatched) continue;
      h.plenioWatched = !0;
      const p = h.callback;
      h.callback = (S) => {
        p?.(S), setTimeout(() => {
          dt() || ft(!1), ce();
        });
      };
    }
  }
  ht(), ft(!1), ce(0);
  let Rt = null, Pt = null;
  const ur = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(ur);
      return;
    }
    const c = String(ae(e, "mode")?.value ?? "flat"), h = String(re()?.value ?? "");
    c === Rt && h === Pt || (Rt = c, Pt = h, ht(), ce(0));
  }, 700);
  return {
    showExecuted(c) {
      const h = c?.plenio_eq, p = h?.[h.length - 1];
      if (!p) return;
      const S = String(ae(e, "mode")?.value ?? "flat"), A = S === "manual";
      H = A || S === "flat" ? null : S, d = {
        sampleRate: p.sample_rate,
        frequencies: p.frequency_hz,
        response: p.response_db,
        settings: p.settings,
        readonly: !A,
        note: A ? "" : `applied: ${p.settings.bands.length} band(s)`,
        beforeDb: p.spectrum_before_db,
        afterDb: p.spectrum_after_db
      }, A ? ce(0) : K();
    }
  };
}
const zt = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, es = new Set(De.map((e) => qt[e]));
function ts(e, t) {
  return !(e in zt) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, r]) => es.has(n) && xn(r)).map(([n]) => n);
}
function ns(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const r = n?.[t];
    if (!Array.isArray(r)) continue;
    if (Array.isArray(r[0])) return r[0];
    const s = r[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const rs = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function ss(e, t) {
  const n = rs[e];
  if (!n) return [];
  const r = [];
  for (const s of t ?? []) {
    const o = n[s.name]?.[String(s.value)];
    o !== void 0 && (s.value = o, r.push(s.name));
  }
  return r;
}
function os(e, t) {
  const n = zt[e.name];
  if (!n || !t) return t;
  const r = ns(e, "mode"), s = t.widgets_values, o = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !r.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), o && typeof o == "object" && !Array.isArray(o) && !("mode" in o) && (i = { ...i, widgets_values_named: { mode: n, ...o } });
  const a = ts(e.name, i.widgets_values_named);
  if (a.length) {
    const l = { ...i.widgets_values_named };
    for (const u of a) l[u] = "";
    i = { ...i, widgets_values_named: l };
  }
  return i;
}
const $n = /* @__PURE__ */ new Map(), Et = /* @__PURE__ */ new Set();
function tn(e, t) {
  $n.set(e, t);
  for (const n of Et) n(e);
}
function _e(e) {
  return $n.get(e) ?? null;
}
function is(e) {
  return Et.add(e), () => Et.delete(e);
}
const Ln = /* @__PURE__ */ new Map();
function as(e) {
  e?.draft_sha256 && Ln.set(e.draft_sha256, e);
}
function ls(e) {
  return e ? Ln.get(e) ?? null : null;
}
const vt = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function cs(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function us(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Nn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function ds(e) {
  switch (e) {
    case "stop":
      return "⏸ stops here for review";
    case "waiting":
      return "⏸ waiting for your approval: Edit, Approve, run again";
    case "approved":
      return "✓ approved";
    case "error":
      return "✖ fix the sheet (Edit Song Sheet…)";
    case "warning":
      return "⚠ warnings";
    case "ok":
      return "✓ passed";
    case "skipped":
      return "– not needed";
    default:
      return "▶ runs through, no review stop";
  }
}
const nt = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new Set();
function qn(e) {
  return nt.get(e) ?? null;
}
function Me(e, t) {
  t ? nt.set(e, t) : nt.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ie) n(e);
}
function fs(e) {
  for (const t of e) nt.delete(t);
  for (const t of Ie) t(null);
}
function ps() {
  for (const e of Ie) e(null);
}
function hs(e) {
  return Ie.add(e), () => Ie.delete(e);
}
const nn = "600 12px sans-serif", Xe = 20, wt = 7;
function ms(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function gs(e) {
  const t = e ? ms(e) : "";
  return {
    height: e ? Xe : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = nn;
      const r = n.measureText(t).width + 2 * wt;
      return n.restore(), r;
    },
    draw(n, r, s) {
      if (!e) return;
      n.save(), n.font = nn;
      const o = n.measureText(t).width + 2 * wt;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(r, s, o, Xe, 5) : n.rect(r, s, o, Xe), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, r + wt, s + Xe / 2 + 0.5), n.restore();
    }
  };
}
const bs = "PlenioSongSheet", ys = 30;
function Tn(e, t) {
  const n = e.widgets?.find((r) => r.name === t);
  return n ? String(n.value ?? "") : null;
}
function vs(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? Tn(n, "mode") : null;
  } catch {
    return null;
  }
}
function Mt(e) {
  const t = qn(e);
  return t || (e.type !== bs ? null : us(Tn(e, "review") ?? "continue", vs(e)) ? "stop" : null);
}
function ws(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Nn(n);
  const r = e?.plenio_summary;
  return cs(r?.[r.length - 1]?.status);
}
function xs(e, t) {
  const n = e.prototype, r = n.onNodeCreated;
  n.onNodeCreated = function() {
    r?.call(this);
    const s = this;
    s.badges?.push(() => {
      const o = Mt(s);
      return gs(o ? vt[o] : null);
    });
  }, n.onDrawForeground = te(n.onDrawForeground, function(s) {
    const o = Mt(this);
    !o || !vt[o].frame || this.flags?.collapsed || !this.size || _s(s, vt[o], this.size, ys, t.scale());
  }), n.onExecuted = te(n.onExecuted, function(s) {
    const o = ws(s);
    o && (Me(this, o), o === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function _s(e, t, n, r, s) {
  const o = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = o, e.beginPath();
  const i = o / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i, 10) : e.rect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i), e.stroke(), e.restore();
}
function Ss(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function ks(e, t) {
  return `${e}:${t}`;
}
function Es(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { section: Number(t[1]), line: Number(t[2]) } : null;
}
function at(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length !== 2) continue;
    const [r, s] = n;
    Number.isInteger(r) && Number.isInteger(s) && r >= 0 && s > r && t.push([r, s]);
  }
  return t.sort((n, r) => n[0] - r[0] || n[1] - r[1]);
}
function Ms(e, t) {
  return e.length === t.length && e.every((n, r) => n[0] === t[r][0] && n[1] === t[r][1]);
}
function Ct(e, t) {
  const n = e.sections[t];
  if (!n) return [0, 0];
  const r = e.measures[n.first_bar - 1]?.onset ?? 0, s = e.measures[n.first_bar - 1 + n.bars]?.onset ?? e.total;
  return [r, s];
}
function As(e, t) {
  for (let n = 0; n < e.sections.length; n++) {
    const [r, s] = Ct(e, n);
    if (t >= r && t < s) return n;
  }
  return -1;
}
function $s(e, t, n, r) {
  const s = t.sections.find((m) => m.section === n), [o, i] = Ct(e, n), a = Math.max(1, Math.round(e.grid.units_per_quarter)), l = new Map((s?.lines ?? []).map((m) => [m.line, m])), u = [];
  let f = o;
  return r.forEach((m, w) => {
    const v = l.get(w);
    let L = v ? v.start : f, _ = v ? Math.max(v.end, v.start + 1) : L + a;
    v && v.end <= v.start && (_ = L + a), L = Math.min(Math.max(L, o), i - 1), _ = Math.min(Math.max(_, L + 1), i), u.push({ id: String(w), text: m, start: L, end: _ }), f = _;
  }), u;
}
function Ls(e, t) {
  const [n, r] = t, s = e.map((u, f) => {
    const m = Math.max(1, Math.min(u.end - u.start, r - n)), w = Math.min(Math.max(u.start, n), r - 1);
    return { line: { ...u, start: w, end: Math.min(w + m, r) }, index: f, placed: u.id.startsWith("*") };
  }), o = s.filter((u) => u.placed).sort((u, f) => u.line.start - f.line.start), i = (u) => {
    let f = u;
    for (const m of o) f >= m.line.start && f < m.line.end && (f = m.line.end);
    return f;
  };
  let a = n;
  for (const u of s.filter((f) => !f.placed).sort((f, m) => f.line.start - m.line.start || f.index - m.index)) {
    const { start: f, end: m } = u.line;
    let w = i(Math.max(f, a));
    for (; w !== i(w); ) w = i(w);
    const v = m > w ? m : w + (m - f);
    u.line.start = Math.min(w, r - 1), u.line.end = Math.min(Math.max(v, u.line.start + 1), r), a = u.line.end;
  }
  const l = s.sort((u, f) => u.line.start - f.line.start || Number(f.placed) - Number(u.placed) || u.index - f.index).map((u) => u.line);
  for (let u = 0; u < l.length; u++) {
    const f = l[u + 1];
    f && f.start <= l[u].start && (f.start = Math.min(l[u].start + 1, r - 1)), f && l[u].end > f.start && (l[u].end = f.start), l[u].end <= l[u].start && (l[u].end = Math.min(l[u].start + 1, r));
  }
  return l;
}
function Ns(e, t, n) {
  const r = e.filter(([s]) => s < t[0] || s >= t[1]);
  return at([...r, ...n.map((s) => [s.start, s.end])]);
}
function qs(e, t) {
  const n = [];
  for (const [r, s] of e)
    for (const [o, i, a] of t) {
      if (r < o || r >= i) continue;
      const l = a - o;
      n.push([r + l, Math.min(s, i) + l]);
    }
  return at(n);
}
function Ts(e) {
  const t = [...e].sort((r, s) => r.start - s.start), n = t[0]?.start ?? 0;
  return t.map((r) => ({ text: r.text, offset: r.start - n, length: r.end - r.start }));
}
const zs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: Ts,
  lineKey: ks,
  parseLineKey: Es,
  parseShift: Ss,
  parseSpans: at,
  placedLines: $s,
  remapSpans: qs,
  sameSpans: Ms,
  sectionAt: As,
  sectionRange: Ct,
  settle: Ls,
  withSectionSpans: Ns
}, Symbol.toStringTag, { value: "Module" }));
function ri(e, t) {
  const n = [];
  let r = 0;
  return e.bars.forEach((s, o) => {
    const i = t?.[o] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, l = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: r, realDur: l, source: a }), r += l;
  }), n;
}
function zn(e, t, n) {
  let r = null;
  for (const s of e)
    if (s[n] <= t + U) r = s;
    else break;
  return r ?? e[0] ?? null;
}
function we(e, t) {
  const n = zn(e, t, "scoreStart");
  if (!n) return t;
  const r = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + r * n.realDur;
}
function Cs(e, t) {
  const n = zn(e, t, "realStart");
  if (!n) return t;
  const r = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + r * n.scoreDur;
}
function si(e, t, n) {
  const r = we(e, t), s = n == null ? 1 / 0 : we(e, n), o = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, l = Math.max(i.realStart, r), u = Math.min(a, s);
    if (u <= l + U) continue;
    let f = i.source[0] + (l - i.realStart) / i.realDur * (i.source[1] - i.source[0]), m = l - r, w = u - l;
    if (f < 0 && (m -= f, w += f, f = 0, w <= U))
      continue;
    const v = o.at(-1);
    v && Math.abs(v.at + v.duration - m) < U && Math.abs(v.offset + v.duration - f) < 0.01 ? v.duration += w : o.push({ at: m, offset: f, duration: w });
  }
  return o;
}
const Cn = 0.04, U = 1e-3, Is = 0.25, Os = 2;
function rt(e) {
  return Math.min(Os, Math.max(Is, Number.isFinite(e) ? e : 1));
}
function oi(e, t) {
  const n = rt(t.speed), r = t.to ?? e.duration_s, s = [], o = t.clock?.length ? t.clock : null, i = o ? we(o, t.from) : t.from, a = (l) => (o ? we(o, l) : l) - i;
  for (const l of ["Vocal", "Ins"])
    if (t.voices[l])
      for (const u of e.notes?.[l] ?? []) {
        if (u.start_s < t.from - U || u.start_s >= r - U) continue;
        const f = Math.min(u.start_s + u.duration_s, r), m = Math.max(0, a(u.start_s));
        s.push({ at: m / n, duration: (a(f) - m) / n, midi: u.midi, part: l });
      }
  if (t.voices.chords)
    for (const l of e.chords ?? []) {
      const u = Math.min(l.start_s + l.duration_s, r), f = Math.max(l.start_s, t.from);
      if (!(u <= f + U))
        for (const m of l.pitches)
          s.push({ at: a(f) / n, duration: (a(u) - a(f)) / n, midi: m, part: "chord" });
    }
  if (t.voices.guide)
    for (const l of t.guide ?? []) {
      if (l.start_s < t.from - U || l.start_s >= r - U) continue;
      const u = Math.min(l.start_s + l.duration_s, r), f = Math.max(0, a(l.start_s));
      s.push({ at: f / n, duration: (a(u) - f) / n, midi: l.midi, part: "guide" });
    }
  if (t.metronome)
    for (const l of e.bars) {
      const u = Number(l.meter.split("/")[0]) || 1;
      for (let f = 0; f < u; f++) {
        const m = l.start_s + f * l.duration_s / u;
        m < t.from - U || m >= r - U || s.push({
          at: Math.max(0, a(m)) / n,
          duration: Cn,
          midi: f === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((l, u) => l.at - u.at || l.midi - u.midi);
}
function ii(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), r = t.clock?.length ? t.clock : null, s = r ? we(r, n) - we(r, t.from) : n - t.from;
  return Math.max(0, s) / rt(t.speed);
}
function ai(e, t, n, r, s, o) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, l = i > 0 ? Math.floor(a / i + 1e-6) : 0, u = i > 0 ? (a - l * i) / i * o : 0, f = u > 1e-3 ? 0 : 1, m = Math.max(0, r * t);
  return Array.from({ length: m }, (w, v) => {
    const L = f + m - 1 - v, _ = ((l - L) % t + t) % t === 0;
    return { at: Math.max(0, s - u - L * o), duration: Cn, midi: _ ? 96 : 89, part: "click" };
  });
}
function li(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? Cs(n, we(n, e.from) + t * rt(e.speed)) : e.from + t * rt(e.speed);
}
function ci(e, t, n) {
  return (e.elements ?? []).filter(
    (r) => r.kind === "note" && n[r.voice] && r.start_s <= t + U && t < r.start_s + r.duration_s - U
  ).map((r) => r.id);
}
function Rs(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const Ps = [
  "plain",
  "soft",
  "piano",
  "epiano",
  "strings",
  "pad",
  "organ",
  "flute",
  "voice",
  "pluck",
  "lead",
  "bass",
  "mallets"
], ui = {
  plain: { label: "Plain", hint: "a plain sine tone (the editor’s classic sound)" },
  soft: { label: "Soft lead", hint: "a soft triangle tone" },
  piano: { label: "Piano", hint: "a struck string that fades and darkens" },
  epiano: { label: "Electric piano", hint: "a bell-like electric piano (FM)" },
  strings: { label: "Strings", hint: "a string section: slow bow, vibrato" },
  pad: { label: "Pad", hint: "a slow, wide synth pad" },
  organ: { label: "Organ", hint: "drawbar organ" },
  flute: { label: "Flute", hint: "a breathy flute with vibrato" },
  voice: { label: "Voice “ah”", hint: "a sung “ah” (formants) - good for the Vocal track" },
  pluck: { label: "Pluck", hint: "a plucked string, like a guitar" },
  lead: { label: "Synth lead", hint: "a bright synth lead" },
  bass: { label: "Bass", hint: "a round bass" },
  mallets: { label: "Mallets", hint: "marimba / vibraphone (FM)" }
};
function Ye(e) {
  return typeof e == "string" && Ps.includes(e);
}
function In() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Ds(e) {
  const t = In(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: Ye(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: Ye(n.Ins) ? n.Ins : t.Ins,
    chord: Ye(n.chord) ? n.chord : t.chord,
    guide: Ye(n.guide) ? n.guide : t.guide
  };
}
const Bs = {
  plain: 1,
  soft: 1,
  piano: 1.35,
  epiano: 1.2,
  strings: 0.8,
  pad: 0.75,
  organ: 1.1,
  flute: 0.95,
  voice: 4.1,
  pluck: 0.8,
  lead: 0.75,
  bass: 0.8,
  mallets: 1.15
}, rn = /* @__PURE__ */ new WeakMap();
function xt(e, t, n) {
  let r = rn.get(e);
  r || rn.set(e, r = /* @__PURE__ */ new Map());
  let s = r.get(t);
  if (!s) {
    const o = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, l) => i[l + 1] = a), s = e.createPeriodicWave(o, i), r.set(t, s);
  }
  return s;
}
const sn = /* @__PURE__ */ new WeakMap();
function On(e) {
  let t = sn.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let r = 1;
    for (let s = 0; s < n.length; s++)
      r = r * 16807 % 2147483647, n[s] = r / 2147483647 * 2 - 1;
    sn.set(e, t);
  }
  return t;
}
function T(e, t, n, r = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = r, s;
}
function de(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ee(e, t, n, r = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = r, s;
}
function ze(e, t, n, r, s, o) {
  const i = T(e, "sine", r), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + o), a.gain.linearRampToValueAtTime(s, n + o + 0.4), i.connect(a);
  for (const l of t) a.connect(l.detune);
  return i;
}
function _t(e, t, n, r, s, o) {
  const i = e.createBufferSource();
  i.buffer = On(e);
  const a = ee(e, "bandpass", r, 1.2), l = e.createGain();
  return l.gain.setValueAtTime(s, n), l.gain.setTargetAtTime(0, n, o), i.connect(a).connect(l).connect(t), i;
}
const et = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), on = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [an(T(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [an(T(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, r, s, o) {
      const i = xt(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ee(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), r + 0.01, et(o, 0.35)), a.connect(t);
      const l = T(e, i, n, -1.5), u = T(e, i, n, 1.5), f = de(e, 0.5);
      l.connect(f), u.connect(f), f.connect(a);
      const m = _t(e, t, r, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [l, u, m];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, r, s, o) {
      const i = T(e, "sine", n), a = T(e, "sine", n), l = e.createGain(), u = n * (1.2 + 2.2 * s);
      l.gain.setValueAtTime(u, r), l.gain.setTargetAtTime(n * 0.25, r, et(o, 0.25)), a.connect(l).connect(i.frequency);
      const f = ee(e, "highpass", 25, 0.7);
      f.connect(t);
      const m = T(e, "sine", n * 4), w = e.createGain();
      return w.gain.setValueAtTime(0.18 * s, r), w.gain.setTargetAtTime(0, r, 0.06), m.connect(w).connect(f), i.connect(f), [i, a, m];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, r) {
      const s = ee(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      s.connect(t);
      const o = [-9, 0, 8].map((a) => T(e, "sawtooth", n, a));
      for (const a of o) a.connect(s);
      const i = ze(e, o, r, 5.3, 7, 0.3);
      return [...o, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, r) {
      const s = Math.min(n * 3 + 500, 4500), o = ee(e, "lowpass", s, 0.8);
      o.connect(t);
      const i = T(e, "sine", 0.25), a = de(e, s * 0.3);
      i.connect(a).connect(o.frequency);
      const l = [T(e, "sawtooth", n, -12), T(e, "sawtooth", n, 11), T(e, "triangle", n / 2)];
      for (const u of l) u.connect(o);
      return [...l, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, r) {
      const s = xt(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), o = T(e, s, n), i = T(e, "sine", n / 2), a = de(e, 0.35);
      i.connect(a).connect(t), o.connect(t);
      const l = ze(e, [o, i], r, 6.6, 4, 0), u = _t(e, t, r, 3e3, 0.05, 4e-3);
      return [o, i, l, u];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, r) {
      const s = xt(e, "flute", [1, 0.13, 0.06, 0.02]), o = T(e, s, n);
      o.connect(t);
      const i = e.createBufferSource();
      i.buffer = On(e), i.loop = !0;
      const a = ee(e, "bandpass", Math.min(n * 2, 8e3), 1.5), l = de(e, 0.06);
      i.connect(a).connect(l).connect(t);
      const u = ze(e, [o], r, 4.9, 9, 0.25);
      return [o, i, u];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, r) {
      const s = T(e, "sawtooth", n), o = ee(e, "lowpass", 5e3, 0.5);
      s.connect(o);
      for (const [l, u, f] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const m = ee(e, "bandpass", l, u), w = de(e, f);
        o.connect(m).connect(w).connect(t);
      }
      const i = de(e, 0.15);
      o.connect(i).connect(t);
      const a = ze(e, [s], r, 5.4, 18, 0.22);
      return [s, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, r, s, o) {
      const i = ee(e, "lowpass", Math.min(n * (6 + 6 * s), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), r + 5e-3, et(o, 0.12)), i.connect(t);
      const a = T(e, "sawtooth", n), l = T(e, "triangle", n, 4);
      a.connect(i), l.connect(i);
      const u = _t(e, t, r, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
      return [a, l, u];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(e, t, n, r) {
      const s = ee(e, "lowpass", Math.min(n * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(n * 4, 4e3), r + 0.02, 0.2), s.connect(t);
      const o = T(e, "square", n), i = T(e, "sawtooth", n, 6);
      o.connect(s), i.connect(s);
      const a = ze(e, [o, i], r, 5.6, 10, 0.3);
      return [o, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, r) {
      const s = T(e, "sine", n), o = T(e, "triangle", n), i = de(e, 0.5);
      s.connect(t), o.connect(i).connect(t);
      const a = T(e, "sawtooth", n), l = ee(e, "lowpass", Math.min(n * 6, 2500), 1);
      l.frequency.setTargetAtTime(n * 2, r + 0.01, 0.12);
      const u = de(e, 0.25);
      return a.connect(l).connect(u).connect(t), [s, o, a];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(e, t, n, r, s, o) {
      const i = T(e, "sine", n), a = T(e, "sine", n * 3.5), l = e.createGain();
      return l.gain.setValueAtTime(n * (1 + 1.5 * s), r), l.gain.setTargetAtTime(0, r, 0.05), a.connect(l).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function an(e, t) {
  return e.connect(t), e;
}
function di(e, t, n, r, s, { velocity: o = 0.8, level: i = 1 } = {}) {
  const a = on[n] ?? on.plain, l = Rs(r), u = a.sustain === 0 ? et(r, a.decay) : a.decay, f = i * Bs[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, o))), m = e.createGain();
  m.gain.setValueAtTime(0, s), m.gain.linearRampToValueAtTime(f, s + a.attack), m.gain.setTargetAtTime(f * a.sustain, s + a.attack, u), m.connect(t);
  const w = a.build(e, m, l, s, o, r);
  for (const E of w) E.start(s);
  let v = !1, L = !1;
  const _ = (E) => {
    for (const W of w)
      try {
        W.stop(E);
      } catch {
      }
  };
  return w[0].onended = () => {
    L = !0, m.disconnect();
  }, a.sustain === 0 && _(s + a.attack + u * 7), {
    release(E) {
      if (v || L) return;
      v = !0;
      const W = Math.max(E, s + a.attack);
      m.gain.setTargetAtTime(0, W, a.release), _(W + a.release * 7);
    },
    stop() {
      if (L) return;
      L = !0, v = !0;
      const E = e.currentTime;
      try {
        m.gain.cancelScheduledValues(E), m.gain.setValueAtTime(0, E);
      } catch {
      }
      _(E), m.disconnect();
    }
  };
}
const fi = 12, Ue = { width: 640, height: 420 }, Hs = { width: 1280, height: 900 }, Rn = 120, Pn = 720, Dn = 0.25, Bn = 0.85, Hn = 160, Wn = 460, Fn = "plenio.sheet.dialog";
function Oe(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function Ws(e, t) {
  const n = Oe(e.width, Ue.width, Math.max(Ue.width, t.width - 16)), r = Oe(e.height, Ue.height, Math.max(Ue.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(r) };
}
function pi(e, t) {
  return Math.round(Oe(e + t, Rn, Pn));
}
function hi(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? ln(e) : ln(e + t / n);
}
function ln(e) {
  return Math.round(Oe(e, Dn, Bn) * 1e3) / 1e3;
}
function mi(e, t) {
  return Math.round(Oe(e + t, Hn, Wn));
}
function gi(e, t, n) {
  const r = e.clientX, s = e.clientY, o = e.currentTarget;
  let i = !1;
  try {
    o?.setPointerCapture?.(e.pointerId);
  } catch {
  }
  const a = () => {
    if (!i) {
      i = !0;
      try {
        o?.releasePointerCapture?.(e.pointerId);
      } catch {
      }
      window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", a), window.removeEventListener("pointercancel", a), window.removeEventListener("blur", a), n?.();
    }
  }, l = (u) => {
    if (u.buttons === 0) {
      a();
      return;
    }
    t({ dx: u.clientX - r, dy: u.clientY - s });
  };
  window.addEventListener("pointermove", l), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function Fs() {
  return { ...Hs, maximized: !1 };
}
function bi(e = Gn()) {
  const t = Fs();
  try {
    const n = e?.getItem(Fn);
    if (!n) return t;
    const r = JSON.parse(n);
    return { ...Ws(
      {
        width: typeof r.width == "number" ? r.width : t.width,
        height: typeof r.height == "number" ? r.height : t.height
      },
      { width: window.innerWidth, height: window.innerHeight }
    ), maximized: r.maximized === !0 };
  } catch {
    return t;
  }
}
function yi(e, t = Gn()) {
  try {
    t?.setItem(Fn, JSON.stringify(e));
  } catch {
  }
}
function Gn() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Vn(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function jn() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function Gs(e) {
  const t = jn(), n = typeof e == "object" && e !== null ? e : {}, r = (s, o, i) => o.includes(s) ? s : i;
  return {
    countIn: r(n.countIn, [0, 1, 2], t.countIn),
    quantize: r(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: r(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: r(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const Xn = "plenio.score-editor.prefs";
function Vs() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    speed: 1,
    roll: !0,
    rollZoom: 48,
    rollHeight: 280,
    notationShare: 0.6,
    sideWidth: 230,
    metronome: !1,
    hear: "both",
    sourceLevel: 0.7,
    audition: !0,
    rowHeight: 12,
    follow: !0,
    sung: !0,
    wave: !0,
    sounds: In(),
    paper: "a4",
    notationSize: "standard",
    record: jn(),
    midiInput: "all"
  };
}
function js(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function vi(e = Yn()) {
  const t = Vs();
  try {
    const n = e?.getItem(Xn);
    if (!n) return t;
    const r = JSON.parse(n);
    return {
      ...js(r),
      zoom: typeof r.zoom == "number" && r.zoom >= 0.6 && r.zoom <= 1.8 ? r.zoom : t.zoom,
      voices: {
        Vocal: r.voices?.Vocal !== !1,
        Ins: r.voices?.Ins !== !1,
        chords: r.voices?.chords !== !1,
        guide: r.voices?.guide !== !1
      },
      speed: typeof r.speed == "number" && r.speed >= 0.25 && r.speed <= 2 ? r.speed : t.speed,
      roll: r.roll !== !1,
      rollZoom: typeof r.rollZoom == "number" && r.rollZoom >= 12 && r.rollZoom <= 240 ? r.rollZoom : t.rollZoom,
      rollHeight: typeof r.rollHeight == "number" && r.rollHeight >= Rn && r.rollHeight <= Pn ? Math.round(r.rollHeight) : t.rollHeight,
      notationShare: typeof r.notationShare == "number" && r.notationShare >= Dn && r.notationShare <= Bn ? r.notationShare : t.notationShare,
      sideWidth: typeof r.sideWidth == "number" && r.sideWidth >= Hn && r.sideWidth <= Wn ? Math.round(r.sideWidth) : t.sideWidth,
      metronome: r.metronome === !0,
      hear: r.hear === "notes" || r.hear === "source" ? r.hear : t.hear,
      sourceLevel: typeof r.sourceLevel == "number" && r.sourceLevel >= 0 && r.sourceLevel <= 1 ? r.sourceLevel : t.sourceLevel,
      audition: r.audition !== !1,
      rowHeight: typeof r.rowHeight == "number" && r.rowHeight >= 6 && r.rowHeight <= 28 ? Math.round(r.rowHeight) : t.rowHeight,
      follow: r.follow !== !1,
      sung: r.sung !== !1,
      wave: r.wave !== !1,
      sounds: Ds(r.sounds),
      paper: r.paper === "letter" ? "letter" : "a4",
      notationSize: Vn(r.notationSize) ? r.notationSize : t.notationSize,
      record: Gs(r.record),
      midiInput: typeof r.midiInput == "string" && r.midiInput ? r.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function wi(e, t = Yn()) {
  try {
    t?.setItem(Xn, JSON.stringify(e));
  } catch {
  }
}
function Yn() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Xs(e) {
  const t = e?.plenio_notation;
  if (!Array.isArray(t)) return [];
  const n = (s) => typeof s == "string" ? s : "", r = (s) => s == null || s === "" ? null : String(s);
  return t.filter((s) => !!s && typeof s == "object").map((s) => ({
    token: n(s.token),
    file: n(s.file),
    title: n(s.title),
    paper: s.paper === "letter" ? "letter" : "a4",
    size: Vn(s.size) ? s.size : "standard",
    abc: n(s.abc),
    lyrics: n(s.lyrics),
    display_abc: n(s.display_abc),
    score_sheet: r(s.score_sheet),
    lyrics_sheet: r(s.lyrics_sheet)
  })).filter((s) => s.token && s.file && s.display_abc);
}
function Ys(e, t) {
  for (const n of [e.score_sheet, e.lyrics_sheet]) {
    if (!n) continue;
    const r = at(t.property(n));
    if (r.length) return r;
  }
  return [];
}
async function Us(e, t) {
  const n = e.lyrics.trim() ? Ys(e, t) : [];
  return n.length ? (await wr(t.fetcher, e.abc, e.lyrics, n)).display_abc ?? e.display_abc : e.display_abc;
}
async function Qs(e, t) {
  const n = await t.draw(await Us(e, t), e.title, e.paper, e.size), r = new ArrayBuffer(n.length);
  new Uint8Array(r).set(n);
  const s = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([r], { type: "application/pdf" })
  }), o = await s.json().catch(() => ({}));
  if (!s.ok)
    throw new it(o.error?.message ?? `Saving the sheet music failed (${s.status})`, o.error?.hint ?? null);
  return { file: o.file ?? e.file, bytes: o.bytes ?? n.length };
}
let cn = Promise.resolve();
function Js(e) {
  const t = cn.then(e, e);
  return cn = t.catch(() => {
  }), t;
}
const It = "plenio.sheet_state/1", lt = ["title", "style", "lyrics", "score", "artwork_prompt"];
function ct() {
  return { schema: It, docs: {} };
}
function Le(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return ct();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== It || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function st(e) {
  const t = {};
  for (const r of lt) {
    const s = e.docs[r];
    s && (t[r] = s);
  }
  const n = { schema: It, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function St(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ks(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = lt.filter((r) => St(e, r) !== "auto").map(
    (r) => r === "lyrics" && St(e, r) === "manual" ? "lyrics: yours (manual)" : `${r.replace("_", " ")} ${St(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function xi(e) {
  const t = e.harmony?.after;
  if (!t) return "";
  const n = (s) => `${Math.round(s * 100)} %`, r = [
    `melody ${n(t.melody_on_chord)} on chord tones`,
    `${t.accented_avoid} accented clash${t.accented_avoid === 1 ? "" : "es"} with a chord`,
    `${t.clashes} between voice and line`,
    `chords ${n(t.chords_in_key)} in the key`
  ];
  return `Harmony check (${e.harmony?.genre ?? "pop"}): ${r.join(" · ")}`;
}
const _i = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function Si(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, r]) => r > 1 ? `${n} (${r} times)` : n);
}
function ki(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function un(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), r = Math.round(t - n * 60);
  return `${n}:${String(r).padStart(2, "0")}`;
}
function Ei(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const s = e.bars[Math.max(0, n - 1)], o = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: un(s?.[0] ?? 0), end: un(o?.[1] ?? e.duration_s) };
  }) : [];
}
function ve(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, r = t.length;
  for (; n < r && !t[n]; ) n++;
  for (; r > n && !t[r - 1]; ) r--;
  return t.slice(n, r).join(`
`);
}
function Zs(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function Mi(e, t, n) {
  return n.map((r) => ({ kind: r, text: Zs(e, t, r), intent: "keep" }));
}
function Un(e, t, n) {
  const r = { ...e.docs };
  for (const o of n) {
    const i = e.docs[o.kind], a = t?.docs[o.kind], l = ve(o.text);
    if (o.intent === "auto")
      delete r[o.kind];
    else if (o.intent === "manual")
      r[o.kind] = { state: "manual", text: l };
    else if (o.intent === "rebase")
      a?.upstream_sha256 ? r[o.kind] = { state: "edited", text: l, base_sha256: a.upstream_sha256 } : r[o.kind] = { state: "manual", text: l };
    else if (i)
      ve(i.text) !== l && (r[o.kind] = { ...i, text: l });
    else {
      const u = ve(a?.upstream ?? "");
      if (l === u) continue;
      r[o.kind] = a?.upstream_sha256 ? { state: "edited", text: l, base_sha256: a.upstream_sha256 } : { state: "manual", text: l };
    }
  }
  const s = { ...ct(), docs: r };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function eo(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function to(e, t) {
  return lt.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function no(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const ro = "PlenioSongSheet";
function Be(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function Qn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const r = e.graph, s = r?.links, o = r?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return o && r?.getNodeById ? r.getNodeById(o.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function Jn(e, t) {
  const n = (e.inputs ?? []).findIndex((r) => r.name === t && r.link != null);
  return n < 0 ? null : Qn(e, n);
}
function Kn(e, t) {
  const n = Jn(e, t);
  return n && (n.comfyClass ?? n.type) === ro && Be(n) ? n : null;
}
function so(e) {
  return Kn(e, "context_lyrics");
}
function oo(e) {
  return Kn(e, "context_score");
}
function io(e, t, n) {
  const r = [], s = Jn(t, n);
  s && r.push(s);
  const o = /* @__PURE__ */ new Set();
  for (; r.length && o.size < 1e3; ) {
    const i = r.shift(), a = String(i.id);
    if (!o.has(a)) {
      if (o.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((l, u) => {
        const f = Qn(i, u);
        f && r.push(f);
      });
    }
  }
  return !1;
}
function ao(e, t, n) {
  const r = so(e), s = t?.context?.lyrics;
  if (!r || !s) return null;
  const o = r.title || "Song Sheet", i = Le(Be(r)?.value), a = i?.docs.lyrics?.text ?? n(String(r.id))?.docs.lyrics?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${o} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(s) && (l = `The lyrics in ${o} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: r, target: { title: o, blocked: l, replans: io(r, e, "score") } };
}
function lo(e, t, n) {
  const r = Be(e);
  if (!r) return;
  const s = Le(r.value) ?? ct();
  r.value = st(Un(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function co(e, t, n) {
  const r = oo(e), s = t?.context?.score;
  if (!r || !s) return null;
  const o = r.title || "Song Sheet", i = Le(Be(r)?.value), a = i?.docs.score?.text ?? n(String(r.id))?.docs.score?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${o} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(s) && (l = `The score in ${o} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: r, target: { title: o, blocked: l } };
}
function uo(e, t) {
  const n = String(e.widgets?.find((r) => r.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function fo(e, t, n, r = null) {
  const s = Be(e);
  if (!s) return null;
  const o = Le(s.value) ?? ct(), i = Un(o, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = st(i), e.setDirtyCanvas?.(!0, !0), !r || !n) return i;
  try {
    const a = await vr(r.fetcher, {
      sheet_state: i,
      upstream: no(n),
      owned: n.owned,
      review: uo(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!a.findings.some((f) => f.severity === "error") || !a.fingerprint) return i;
    const u = eo(i, a.fingerprint);
    return s.value = st(u), e.setDirtyCanvas?.(!0, !0), u;
  } catch {
    return i;
  }
}
const Zn = "PLENIO_SHEET_STATE", dn = 68;
let tt = null;
function po(e) {
  tt = e;
}
const ho = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const o = document.createElement("span");
  o.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.className = "plenio-sheet-open", i.textContent = "Edit Song Sheet…";
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", s.append(i, o, a);
  let l = !1;
  const u = () => {
    const _ = _e(String(e.id)), E = Mt(e);
    o.textContent = Ks(Le(r)) + (_ && E !== "approved" ? ` · ${_.status}` : ""), a.textContent = ds(E), a.dataset.state = E ?? "";
    const W = l ? null : e.widgets?.find((d) => d.name === "review");
    if (W) {
      l = !0;
      const d = W.callback;
      W.callback = (H) => {
        d?.(H), u();
      };
    }
  }, f = e.addDOMWidget(t, Zn, s, {
    getValue: () => r,
    setValue: (_) => {
      r = typeof _ == "string" ? _ : "", u();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => dn,
    getMaxHeight: () => dn
  });
  i.addEventListener("click", (_) => {
    _.stopPropagation(), m().catch((E) => {
      console.error("Plenio: the Song Sheet editor could not open", E), o.textContent = `The editor could not open: ${E instanceof Error ? E.message : String(E)}`;
    });
  });
  async function m() {
    const _ = Le(r);
    _ === null && (o.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const E = _e(String(e.id)), d = (e.inputs ?? []).filter((q) => q.link != null).map((q) => q.name), H = _ ?? { schema: "plenio.sheet_state/1", docs: {} }, $ = E?.owned ?? to(d, H), b = String(e.widgets?.find((q) => q.name === "review")?.value ?? "continue"), g = b === "as the brief says" ? E?.review ?? "continue" : b, { openSheetDialog: y } = await import("./open-BuzaFBzx.mjs"), { parseGuide: x, serializeGuide: z } = await import("./tracks-DxmZeggM.mjs"), { parseShift: M, parseSpans: j } = await Promise.resolve().then(() => zs);
    if (!tt) throw new Error("Plenio: API not initialised");
    let N = null;
    try {
      N = ao(e, E, _e);
    } catch (q) {
      console.warn("Plenio: the lyrics sheet of this score was not found", q);
    }
    let P = null;
    try {
      P = co(e, E, _e);
    } catch (q) {
      console.warn("Plenio: the score sheet of these lyrics was not found", q);
    }
    const F = tt;
    y({
      title: e.title || "Song Sheet",
      state: H,
      payload: E,
      asrNote: ls(E?.docs.lyrics?.upstream_sha256),
      owned: $.length ? $ : [...lt],
      review: g,
      fetcher: tt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: x(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: j(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: M(e.properties?.plenio_source_shift),
      lyricsTarget: N?.target ?? null,
      scoreTarget: P?.target ?? null,
      onApply: (q, D, re, X, C, I) => {
        const ce = String(f.value ?? "");
        if (f.value = st(q), e.properties = {
          ...e.properties ?? {},
          plenio_guide: z(D),
          plenio_lyric_spans: (I?.lyricSpans ?? []).map(([se, xe]) => [se, xe]),
          plenio_source_shift: I?.sourceShift ?? 0
        }, C ? Me(e, "approved") : String(f.value) !== ce && w(e), re !== null && N && !N.target.blocked && (lo(N.owner, re, _e(String(N.owner.id))), w(N.owner)), X && P && !P.target.blocked) {
          const se = P.owner;
          fo(se, X.text, _e(String(se.id)), X.approved ? { fetcher: F } : null).then(
            (xe) => {
              xe?.review?.approved_fingerprint ? Me(se, "approved") : w(se);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function w(_) {
    qn(_) === "approved" && Me(_, null);
  }
  const v = [
    is((_) => {
      _ === String(e.id) && u();
    }),
    hs((_) => {
      (_ === null || _ === e) && u();
    })
  ], L = e.onRemoved;
  return e.onRemoved = function() {
    for (const _ of v) _();
    L?.call(this);
  }, u(), { widget: f };
}, Re = "plenio.stem_mix/1", Ae = "rest", mo = ["reverb", "delay"], er = -60, go = 12;
function bo() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function ne(e, t) {
  const n = e?.strips?.[t] ?? {};
  return {
    gain_db: typeof n.gain_db == "number" ? n.gain_db : 0,
    mute: n.mute === !0,
    solo: n.solo === !0,
    compression: typeof n.compression == "number" ? n.compression : 0,
    muted: Array.isArray(n.muted) ? n.muted.map((r) => [r[0], r[1]]) : [],
    reverb: typeof n.reverb == "number" ? n.reverb : 0,
    delay: typeof n.delay == "number" ? n.delay : 0,
    save: n.save === !0
  };
}
function tr(e) {
  const t = bo();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const yo = ["vocals", "drums", "bass", "other"];
function vo() {
  return [...yo, Ae];
}
function wo(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Re, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Re || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function xo(e) {
  const t = {};
  for (const r of Object.keys(e.strips)) {
    if (!r || tr(ne(e, r))) continue;
    const s = {}, o = ne(e, r);
    o.gain_db && (s.gain_db = o.gain_db), o.mute && (s.mute = !0), o.solo && (s.solo = !0), o.compression && (s.compression = o.compression), o.muted.length && (s.muted = o.muted), o.reverb && (s.reverb = o.reverb), o.delay && (s.delay = o.delay), o.save && (s.save = !0), t[r] = s;
  }
  const n = { schema: Re, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function ot(e, t, n) {
  const r = { ...e.strips };
  return tr(n) ? delete r[t] : r[t] = n, { ...e, strips: r };
}
function _o(e, t, n) {
  const r = n.some((o) => ne(e, o).solo), s = ne(e, t);
  return r ? s.solo : !s.mute;
}
function fn(e) {
  return e <= er ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function So(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, o) => s[0] - o[0]), r = [];
  for (const s of n) {
    const o = r[r.length - 1];
    o && s[0] <= o[1] + 1e-6 ? o[1] = Math.max(o[1], s[1]) : r.push([...s]);
  }
  return t !== null && t > 0 ? r.map(([s, o]) => [Math.min(s, t), Math.min(o, t)]).filter(([s, o]) => o - s > 1e-6) : r;
}
function ko(e, t, n) {
  return So([...e, [t, n]]);
}
function Eo(e, t) {
  return e.findIndex(([n, r]) => n <= t && t <= r);
}
function Mo(e, t) {
  return t < 0 ? e : e.filter((n, r) => r !== t);
}
function Ao(e, t, n, r) {
  const s = ne(e, t);
  return ot(e, t, { ...s, muted: ko(s.muted, n, r) });
}
function $o(e, t, n) {
  const r = ne(e, t), s = Eo(r.muted, n);
  return s < 0 ? e : ot(e, t, { ...r, muted: Mo(r.muted, s) });
}
function Lo(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const r = {};
  for (const [s, o] of Object.entries(n.peaks))
    Array.isArray(o) && o.length && (r[s] = o.map((i) => Math.abs(Number(i) || 0)));
  return r;
}
function No(e, t, n = 200) {
  const r = e[t];
  return r?.length ? r.length === n ? r : Array.from({ length: n }, (s, o) => r[Math.floor(o * r.length / n)] ?? 0) : new Array(n).fill(0);
}
function pn(e, t) {
  const r = (Array.isArray(t?.stems) && t.stems.length ? t.stems : vo()).filter((o) => o !== Ae), s = Object.keys(e?.strips ?? {}).filter((o) => o !== Ae && !r.includes(o));
  return [...r, ...s, Ae];
}
const hn = "plenio_stem_mixer", mn = "mix", fe = 200, qo = ["room", "plate", "hall"];
function R(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function Qe(e, t, n, r, s) {
  const o = R("input");
  return o.type = "range", o.min = String(e), o.max = String(t), o.step = String(n), o.value = String(r), o.setAttribute("aria-label", s), o;
}
function To(e) {
  const t = R("div", "plenio-mix"), n = R("div", "plenio-mix-strips"), r = R("div", "plenio-mix-buses"), s = R("div", "plenio-mix-info"), o = R("div", "plenio-mix-advanced");
  t.append(n, r, o, s);
  let i = {
    mix: { schema: Re, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: pn(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const l = () => e.widgets?.find((b) => b.name === mn);
  function u(b, { draw: g = !0 } = {}) {
    const y = l();
    if (!y) return;
    const x = xo(b);
    y.value = x, y.callback?.(x), i = { ...i, mix: b }, g && v();
  }
  function f(b, g, y = {}) {
    u(ot(i.mix, b, { ...ne(i.mix, b), ...g }), y);
  }
  function m(b, g, y, x = {}) {
    const z = ne(i.mix, b);
    let M = ot(i.mix, b, { ...z, [g]: y });
    y > 0 && !(M[g] && Object.keys(M[g]).length) && (M = g === "reverb" ? { ...M, reverb: { preset: "room" } } : { ...M, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), u(M, x);
  }
  function w(b, g, y) {
    const x = { ...i.mix[b] ?? {} };
    u({ ...i.mix, [b]: { ...x, [g]: y } });
  }
  function v() {
    n.replaceChildren();
    const b = i.names;
    for (const g of i.names) {
      const y = ne(i.mix, g), x = R("div", "plenio-mix-strip");
      x.dataset.strip = g;
      const z = R("span", "name", g === Ae ? `${g} (missed)` : g);
      z.title = g === Ae ? "What the separator missed: keeps a neutral mix exact" : "";
      const M = Qe(er, go, 0.5, y.gain_db, `${g} gain`), j = R("span", "gain", `${fn(y.gain_db)} dB`);
      M.addEventListener("input", () => {
        j.textContent = `${fn(Number(M.value))} dB`, f(g, { gain_db: Number(M.value) }, { draw: !1 });
      }), M.addEventListener("change", () => f(g, { gain_db: Number(M.value) }));
      const N = R("button", y.mute ? "toggle active" : "toggle", "M");
      N.setAttribute("aria-label", `${g} mute`), N.addEventListener("click", (C) => {
        C.stopPropagation(), f(g, { mute: !y.mute });
      });
      const P = R("button", y.solo ? "toggle active" : "toggle", "S");
      P.setAttribute("aria-label", `${g} solo`), P.addEventListener("click", (C) => {
        C.stopPropagation(), f(g, { solo: !y.solo });
      });
      const F = Qe(0, 1, 0.05, y.compression, `${g} compression`);
      F.title = "Compression amount: one knob for the master compressor (threshold and ratio)", F.addEventListener("input", () => f(g, { compression: Number(F.value) }, { draw: !1 })), F.addEventListener("change", () => f(g, { compression: Number(F.value) }));
      const q = mo.map((C) => {
        const I = Qe(0, 1, 0.05, y[C], `${g} ${C} send`);
        return I.title = `${C} send: how much of this stem goes to the shared ${C} bus`, I.addEventListener("input", () => m(g, C, Number(I.value), { draw: !1 })), I.addEventListener("change", () => m(g, C, Number(I.value))), I;
      }), D = R("button", y.save ? "toggle active" : "toggle", "save");
      D.setAttribute("aria-label", `${g} save as its own file`), D.setAttribute("aria-pressed", String(y.save)), D.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", D.addEventListener("click", (C) => {
        C.stopPropagation(), f(g, { save: !y.save });
      });
      const re = _o(i.mix, g, b);
      x.classList.toggle("silent", !re);
      const X = R("canvas", "plenio-mix-wave");
      X.width = fe, X.height = 26, X.setAttribute("aria-label", `${g} waveform (drag to mute a time range)`), L(X, y, No(i.peaks, g, fe)), X.addEventListener("pointerdown", (C) => _(C, X, g)), x.append(
        z,
        M,
        j,
        N,
        P,
        R("span", "label", "comp"),
        F,
        R("span", "label", "verb"),
        q[0],
        R("span", "label", "delay"),
        q[1],
        D,
        X
      ), n.append(x);
    }
    E(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function L(b, g, y) {
    const x = b.getContext("2d");
    if (!x) return;
    x.clearRect(0, 0, fe, b.height);
    const z = b.height / 2;
    x.strokeStyle = "rgba(180, 190, 205, 0.8)", x.beginPath();
    for (let M = 0; M < y.length; M++) {
      const j = Math.max(1, y[M] * (z - 1));
      x.moveTo(M + 0.5, z - j), x.lineTo(M + 0.5, z + j);
    }
    x.stroke(), x.fillStyle = "rgba(224, 104, 94, 0.35)", x.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [M, j] of g.muted) {
      const N = Math.max(0, Math.min(fe, M / Math.max(i.seconds, 1e-6) * fe)), P = Math.max(0, Math.min(fe, j / Math.max(i.seconds, 1e-6) * fe));
      x.fillRect(N, 0, Math.max(1, P - N), b.height), x.strokeRect(N + 0.5, 0.5, Math.max(1, P - N) - 1, b.height - 1);
    }
  }
  function _(b, g, y) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const x = g.getBoundingClientRect(), z = (q) => Math.max(0, Math.min(1, (q - x.left) / (x.width || fe))) * i.seconds, M = z(b.clientX);
    if (ne(i.mix, y).muted.some(([q, D]) => q <= M && M <= D)) {
      u($o(i.mix, y, M));
      return;
    }
    let N = M;
    const P = (q) => {
      N = z(q.clientX);
    }, F = () => {
      window.removeEventListener("pointermove", P), window.removeEventListener("pointerup", F), u(Ao(i.mix, y, Math.min(M, N), Math.max(M, N)));
    };
    window.addEventListener("pointermove", P), window.addEventListener("pointerup", F);
  }
  function E() {
    r.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, g = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, y = R("select");
    y.setAttribute("aria-label", "Reverb preset"), y.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const M of qo) y.append(new Option(M, M));
    y.value = String(b.preset ?? "room"), y.addEventListener("change", () => w("reverb", "preset", y.value));
    const x = R("input");
    x.type = "number", x.value = String(g.time_ms ?? 375), x.setAttribute("aria-label", "Delay time in ms"), x.title = "Delay time in ms: where the first echo of the delay bus sits", x.addEventListener("change", () => w("delay", "time_ms", Number(x.value)));
    const z = Qe(0, 0.8, 0.05, Number(g.feedback ?? 0.35), "Delay feedback");
    z.title = "Delay feedback: how much of each echo returns into the delay line", z.addEventListener("input", () => w("delay", "feedback", Number(z.value))), r.append(
      R("span", "label", "reverb bus"),
      y,
      R("span", "label", "delay bus"),
      x,
      R("span", "label", "ms, feedback"),
      z
    ), r.style.display = "flex";
  }
  const W = e.addDOMWidget(hn, hn, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  const d = e.widgets?.find((b) => b.name === mn), H = R("button", "toggle", "JSON");
  H.title = "Show or hide the raw mixer value", H.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, H.classList.toggle("active", a), d && (d.plenioHidden = !a, a ? delete d.computeSize : d.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), o.append(R("span", "label", "Advanced"), H), d && (d.plenioHidden = !0, d.computeSize = () => [0, -4]);
  function $() {
    const b = wo(l()?.value);
    i = { ...i, mix: b ?? { schema: Re, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), v();
  }
  return $(), {
    showExecuted(b) {
      const g = b?.plenio_stems?.at(-1), y = Lo(b), x = pn(i.mix, g ?? null);
      i = { ...i, names: x, peaks: y, seconds: Number(g?.seconds ?? i.seconds) || 0 }, $();
    }
  };
}
const zo = `
.plenio-sheet-state { display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; font: 12px/28px var(--font-family, sans-serif);
  color: var(--descrip-text, #999); padding: 0 4px; white-space: nowrap; overflow: hidden; }
.plenio-sheet-summary { flex: 1 1 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-status { flex: 1 0 100%; font-weight: 600; line-height: 18px; overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-status[data-state="stop"] { color: #8fa3bf; }
.plenio-sheet-status[data-state="waiting"] { color: #e3a82b; }
.plenio-sheet-status[data-state="approved"], .plenio-sheet-status[data-state="ok"] { color: #4fbf7f; }
.plenio-sheet-status[data-state="warning"] { color: #d8a31a; }
.plenio-sheet-status[data-state="error"] { color: #e0574a; }
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
.plenio-summary table { border-collapse: collapse; margin: 2px 0 8px; font-size: 11px; width: 100%; }
.plenio-summary th, .plenio-summary td { text-align: left; vertical-align: top; padding: 2px 6px 2px 0; border-bottom: 1px solid rgba(127, 127, 127, 0.25); }
.plenio-summary th { font-weight: 600; }
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
function Co() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = zo, document.head.append(e);
}
function At(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Je(e) {
  return At(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Io(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Oo(e) {
  const t = [];
  let n = !1, r = null, s = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...l] = s, u = (f, m) => `<tr>${f.map((w) => `<${m}>${Je(w)}</${m}>`).join("")}</tr>`;
      t.push(`<table><thead>${u(a, "th")}</thead><tbody>${l.map((f) => u(f, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${At(r.join(`
`))}</code></pre>`), r = null) : r.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      o();
      const f = Io(a);
      f && (s ??= []).push(f);
      continue;
    }
    if (i(), a.startsWith("```")) {
      o(), r = [];
      continue;
    }
    const l = /^(#{1,4})\s+(.*)$/.exec(a);
    if (l) {
      o();
      const f = Math.min(l[1].length + 2, 6);
      t.push(`<h${f}>${Je(l[2])}</h${f}>`);
      continue;
    }
    const u = /^\s*[-*]\s+(.*)$/.exec(a);
    if (u) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Je(u[1])}</li>`);
      continue;
    }
    o(), a.trim() && t.push(`<p>${Je(a)}</p>`);
  }
  return o(), i(), r !== null && t.push(`<pre><code>${At(r.join(`
`))}</code></pre>`), t.join("");
}
const Ce = "plenio_summary", gn = "plenio_summary", bn = 84, Ro = 18, Po = 55, Do = 16;
function Bo(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, r) => n + Math.max(1, Math.ceil(r.length / Po)), 0);
  return Do + t * Ro;
}
function Ho(e, t) {
  const n = e.widgets?.find((o) => o.name === gn);
  if (n?.element) return n.element;
  const r = document.createElement("div");
  r.className = "plenio-summary";
  const s = e.addDOMWidget(gn, "plenio_summary", r, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => bn,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(bn, r.scrollHeight ? r.scrollHeight + 2 : Bo(t.markdown))
  });
  return s.serialize = !1, r;
}
function Wo(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const yn = /* @__PURE__ */ new WeakMap();
function $t(e, t) {
  if (!t.markdown) return;
  const n = yn.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, yn.set(e, n);
  const r = Ho(e, n);
  r.dataset.status = t.status ?? "", r.innerHTML = Oo(t.markdown), Wo(e), e.setDirtyCanvas?.(!0, !0);
}
function vn(e, t, n, r) {
  const s = e.properties?.[Ce], o = (s?.markdown ?? "").split(`
`), i = o.findIndex((l) => l.startsWith(t));
  i >= 0 ? o[i] = n : o.push(n);
  const a = { markdown: o.join(`
`).trim(), status: r ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ce] = a, $t(e, a);
}
function Fo(e) {
  e.prototype.onExecuted = te(e.prototype.onExecuted, function(t) {
    const n = t?.[Ce], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[Ce] = { markdown: r.markdown, status: r.status ?? "" }, $t(this, r));
  }), e.prototype.onConfigure = te(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ce];
    t?.markdown && $t(this, t);
  });
}
const Go = "Plenio.Core", ye = yr;
po(ye);
const Pe = wn, nr = () => Pe.graph;
function Lt(e) {
  if (e == null) return null;
  const t = String(e);
  return nr()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Vo = {
  scale: () => Pe.canvas?.ds?.scale ?? 1,
  toast: (e, t) => Pe.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, jo = {
  fetcher: ye,
  property: (e) => Lt(e)?.properties?.plenio_lyric_spans,
  async draw(e, t, n, r) {
    const { notationPdf: s, renderLines: o } = await import("./notationExport-D-CL96aB.mjs").then((a) => a.c), i = o(e, t, n, r);
    try {
      if (!i.lines.length) throw new Error("the score has no music to draw");
      return await s(i.lines, n, t);
    } finally {
      i.dispose();
    }
  }
};
function Xo(e, t) {
  for (const n of Xs(t)) {
    const r = `- sheet music: ${n.file}`;
    Js(() => Qs(n, jo)).then(
      (s) => {
        vn(e, r, `${r} - saved (${Math.max(1, Math.round(s.bytes / 1024))} KB)`), Pe.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: s.file, life: 6e3 });
      },
      (s) => {
        const o = s instanceof it && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
        vn(e, r, `${r} - not saved: ${o}`, "warning"), Pe.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: o, life: 15e3 });
      }
    );
  }
}
wn.registerExtension({
  name: Go,
  getCustomWidgets: () => ({ [Zn]: ho }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => ps(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Fo(e), xs(e, Vo);
    const n = Wr(t.input);
    if (n.size || t.name in zt) {
      const r = e.prototype.configure;
      e.prototype.configure = function(s) {
        const o = os(t, s), i = Rr(o), a = r?.call(this, o);
        return Hr(this, i, n), ss(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = te(e.prototype.onExecuted, function(r) {
      for (const s of r?.plenio_asr ?? []) as(s);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), r.set(this, Zr(this, ye));
      }, e.prototype.onExecuted = te(e.prototype.onExecuted, function(o) {
        r.get(this)?.showExecuted(o);
      });
    }
    if (Cr.has(t.name) && Ir(e, ye), t.name === "PlenioStemMixer") {
      const r = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), r.set(this, To(this));
      }, e.prototype.onExecuted = te(e.prototype.onExecuted, function(o) {
        r.get(this)?.showExecuted(o);
      });
    }
    t.name === "PlenioExportRelease" && (e.prototype.onExecuted = te(e.prototype.onExecuted, function(r) {
      Xo(this, r);
    })), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = te(e.prototype.onExecuted, function(r) {
      const s = r?.plenio_sheet, o = s?.[s.length - 1];
      o && tn(String(this.id), o);
    }));
  },
  setup() {
    Co(), ye.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      tn(String(t.node_id), t);
      const n = Lt(t.node_id);
      n && Me(n, Nn(t));
    }), ye.addEventListener("execution_start", () => {
      fs(nr()?.nodes ?? []);
    }), ye.addEventListener("execution_error", (e) => {
      const t = Lt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && Me(t, "error");
    });
  }
});
export {
  hi as $,
  Rn as A,
  Hn as B,
  Dn as C,
  gi as D,
  pi as E,
  ln as F,
  mi as G,
  Zo as H,
  Ps as I,
  Ko as J,
  Ms as K,
  Ts as L,
  As as M,
  Bn as N,
  Ct as O,
  it as P,
  $s as Q,
  Pn as R,
  Wn as S,
  U as T,
  Ls as U,
  Ns as V,
  Es as W,
  qs as X,
  wi as Y,
  ve as Z,
  ni as _,
  ti as a,
  Mi as a0,
  bi as a1,
  Qo as a2,
  _i as a3,
  ki as a4,
  xi as a5,
  vr as a6,
  no as a7,
  eo as a8,
  Ws as a9,
  yi as aa,
  Ei as ab,
  Un as ac,
  st as ad,
  Si as ae,
  fi as af,
  Go as ag,
  wr as b,
  oi as c,
  In as d,
  si as e,
  Rs as f,
  li as g,
  ci as h,
  ei as i,
  ii as j,
  ai as k,
  ks as l,
  rt as m,
  Cs as n,
  we as o,
  ri as p,
  ui as q,
  jn as r,
  di as s,
  Jo as t,
  Ye as u,
  Ds as v,
  Gs as w,
  Vn as x,
  at as y,
  vi as z
};
