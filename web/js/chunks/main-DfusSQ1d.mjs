import { api as Mn } from "../../../../scripts/api.js";
import { app as Qt } from "../../../../scripts/app.js";
function ne(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Xt extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ie(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await i.json();
  if (!i.ok) {
    const s = r?.error ?? {};
    throw new Xt(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function yr(e, t) {
  return ie(e, "/plenio/sheet/resolve", t);
}
async function wr(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function xr(e, t, n) {
  return ie(e, "/plenio/score/analyze", n ? { abc: t, lyrics: n } : { abc: t });
}
function _r(e, t, n, i) {
  return ie(e, "/plenio/score/transform", i ? { abc: t, operation: n, lyrics: i } : { abc: t, operation: n });
}
function Er(e, t) {
  const { lyrics: n, ...i } = t;
  return ie(e, "/plenio/score/musicxml/export", n ? { ...i, lyrics: n } : i);
}
function Sr(e, t) {
  return ie(e, "/plenio/score/midi/export", t);
}
function kr(e, t) {
  return ie(e, "/plenio/score/midi/import", t);
}
function Ar(e, t) {
  return ie(e, "/plenio/lyrics/analyze", t);
}
function $r(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function wt(e, t, n, i = 200) {
  return ie(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function Nn(e, t) {
  return ie(e, "/plenio/brief/fields", t);
}
async function Ln(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Xt(`Request failed (${t.status})`);
  return await t.json();
}
const ke = [
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
], Cn = ["length", "vocals", "melody"], lt = {
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
}, zn = "custom";
function Ut(e) {
  return typeof e == "string" && e.trim().toLowerCase() === zn;
}
function ye(e, t) {
  const n = lt[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Rn(e) {
  const t = {};
  for (const n of [...ke, ...Cn]) {
    const i = ye(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function xt(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!ke.includes(i.field)) continue;
    const r = ye(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function _t(e) {
  const t = [];
  for (const n of ke) {
    const i = ye(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function tt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function On(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${Pn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Bn(e) {
  const t = e ? tt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Tn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Pn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Et(e, t) {
  for (const n of t) {
    const i = ye(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Dn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Jt(e) {
  const t = [];
  for (const n of ke) {
    const i = ye(e, n);
    !i || !Ut(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const St = "plenio_brief_template", Hn = 400;
function In(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const b = document.createElement("div");
  b.className = "line";
  const v = document.createElement("div");
  v.className = "hint";
  const S = document.createElement("div");
  S.className = "actions", c.append(b, v, S);
  const k = (p, d, f) => {
    const h = document.createElement("button");
    return h.textContent = p, h.title = d, h.addEventListener("click", (E) => {
      E.stopPropagation(), f();
    }), S.append(h), h;
  }, R = k("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Et(e, xt(e, n).map((p) => ({ field: p.field, value: p.value }))), M());
  }), O = k("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Et(e, tt(n)), M());
  }), w = k("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = _t(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (Dn(e, p), M());
  }), B = k("↻", "Ask again what the template fills", () => {
    T();
  }), M = () => {
    const p = On(n, i);
    b.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", b.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const d = Bn(n), f = Tn(n);
    v.textContent = [d, f].filter(Boolean).join(" · "), v.style.display = v.textContent ? "" : "none", S.style.display = i && n && n.template !== "none" ? "" : "none", R.disabled = !n || !xt(e, n).length, O.disabled = !n || !tt(n).length, w.disabled = !_t(e).length, B.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, D = /* @__PURE__ */ new WeakSet(), Y = () => {
    for (const p of ["template", ...Object.keys(lt)]) {
      const d = p === "template" ? e.widgets?.find((f) => f.name === "template") : ye(e, p);
      !d || D.has(d) || (D.add(d), d.callback = ne(d.callback, () => {
        Y(), T();
      }));
    }
  }, a = async () => {
    Y();
    const p = String(e.widgets?.find((d) => d.name === "template")?.value ?? "none");
    try {
      n = await Nn(t, { fields: Rn(e), template: p }), r = null;
    } catch (d) {
      n = null, r = `The template fields could not be read: ${d instanceof Error ? d.message : String(d)}`;
    }
    i = !0, M();
  };
  function T() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, Hn);
  }
  Y();
  const _ = e.addDOMWidget(St, St, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return _.serialize = !1, Jt(e), M(), T(), {
    widget: _,
    refresh: T,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Fn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Wn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, In(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), Jt(this), n.get(this)?.refresh();
  };
}
const jn = "COMFY_DYNAMICCOMBO_V3";
function Gn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Vn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Yn(e, t) {
  const n = Vn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Qn(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Xn(e, t, n) {
  if (!t || !e.widgets || Yn(e, t)) return !1;
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
    if (n.has(s.name) && !Qn(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function Un(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === jn && t.add(i);
  return t;
}
const Kt = "plenio.eq/1", Oe = 8, ae = 20, Jn = 2e4, ve = 12, Zt = 15, ge = ["peak", "low_shelf", "high_shelf"], en = ["peak", "notch", "highpass", "lowpass"], kt = [0.2, 10], At = [0.25, 1];
function fe() {
  return { schema: Kt, preamp_db: 0, bands: [] };
}
function Kn(e) {
  if (typeof e != "string" || !e.trim()) return fe();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Kt,
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
const U = (e, t) => Number(e.toFixed(t));
function F(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function tn(e) {
  return e.db ?? Zt;
}
const $t = [6, 12, 18], Zn = { 6: 8, 12: 14, 18: 20 };
function ei(e, t) {
  return { ...e, db: Zn[t] ?? Zt };
}
function ue(e, t) {
  return Math.log(F(t, ae, e.maxHz) / ae) / Math.log(e.maxHz / ae) * e.width;
}
function qt(e, t) {
  return ae * (e.maxHz / ae) ** F(t / e.width, 0, 1);
}
function oe(e, t) {
  const n = tn(e);
  return (1 - (F(t, -n, n) + n) / (2 * n)) * e.height;
}
function Mt(e, t) {
  const n = tn(e);
  return (1 - F(t / e.height, 0, 1)) * 2 * n - n;
}
function Nt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Lt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${ue(e, i).toFixed(1)},${oe(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function ct(e) {
  return Math.min(Jn, 0.45 * e);
}
function ti(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function ni(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Oe) return null;
  const r = {
    id: ti(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(F(t, ae, ct(i)), 1),
    gain_db: U(F(n, -ve, ve), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function we(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: U(F(n, ae, ct(r)), 1),
        gain_db: ge.includes(s.type) ? U(F(i, -ve, ve), 1) : s.gain_db
      }
    )
  };
}
function Ve(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(F(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Ye(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function xe(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ge.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function ii(e, t) {
  const n = nn[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = ge.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = en.includes(e.type) ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const nn = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Qe(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function Me(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Be(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: U(F(Me(s.frequency_hz, r.frequency_hz), ae, ct(i)), 1),
        gain_db: U(F(Me(s.gain_db, r.gain_db), -ve, ve), 1),
        q: U(F(Me(s.q, r.q), kt[0], kt[1]), 3),
        slope: U(F(Me(s.slope, r.slope), At[0], At[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function Ct(e, t) {
  return Be(e, t, { gain_db: 0 });
}
function zt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((R) => Number.isFinite(R));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), b = Math.max(s - c, 1e-6), v = e.height - 4, S = v - Math.max(12, e.height * F(i, 0.1, 0.95));
  return `M${t.map((R, O) => {
    const w = n[O], B = Number.isFinite(w) ? (w - c) / b : 0;
    return `${ue(e, R).toFixed(1)},${(v - B * (v - S)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${v.toFixed(1)} L0,${v.toFixed(1)} Z`;
}
class ri {
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
const si = "http://www.w3.org/2000/svg", Rt = "plenio_eq_panel", Ne = "mode.bands", re = { capture: !0 }, X = { width: 560, height: 260 }, Le = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Xe = null;
function ee(e, t) {
  const n = document.createElementNS(si, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function P(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function ce(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function te(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function oi(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function ai(e, t) {
  const n = P("div", "plenio-eq"), i = P("div", "plenio-eq-tools"), r = P("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = P("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of $t) s.append(new Option(`±${o} dB`, String(o)));
  const c = ce("", "↶", "Undo the last band change"), b = ce("", "↷", "Redo the last band change"), v = ce("", "reset", "Remove every band"), S = ce("", "compare", "Show the curve without the EQ (bypass)"), k = ce("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), R = P("span", "plenio-eq-info");
  R.setAttribute("aria-live", "polite"), R.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, c, b, v, S, k, R);
  const O = P("div", "plenio-eq-mode"), w = ee("svg", {
    viewBox: `0 0 ${X.width} ${X.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  w.setAttribute("aria-label", "EQ response curve"), w.setAttribute("tabindex", "0"), w.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const B = P("div", "plenio-eq-strip"), M = P("div", "plenio-eq-editor"), D = P("div", "plenio-eq-fields");
  M.append(D), n.append(i, O, w, B, M);
  const Y = e.addDOMWidget(Rt, Rt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: fe(), readonly: !0, note: "" }, T = null, _ = null, p = !1, d = 12, f = null, h = [], E = 0, y, W, N = null, j = !1;
  const H = /* @__PURE__ */ new Map();
  let I = null;
  const z = new ri(fe()), de = () => te(e, Ne), K = () => d, A = () => ei({ ...X, maxHz: Math.min(2e4, a.sampleRate / 2) }, K());
  function L(o, { record: u = !0 } = {}) {
    const l = de();
    if (!l) return;
    const m = me(o);
    l.value = m, l.callback?.(m), u && z.push(o), a = { ...a, settings: o }, Q(), pe(0);
  }
  async function pe(o = 120) {
    clearTimeout(y), y = setTimeout(async () => {
      const u = String(te(e, "mode")?.value ?? "flat");
      if (u !== "manual") {
        u === "flat" ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : T !== u ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: `${u}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : a = { ...a, readonly: !0 }, Q();
        return;
      }
      const l = Kn(de()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      me(l) !== me(z.current) && z.reset(l);
      const m = ++E;
      try {
        const x = await wt(t, l, a.sampleRate);
        if (m !== E) return;
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
      Q();
    }, o);
  }
  const ht = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Oe)
  });
  function mt() {
    if (!f) return "";
    const o = h.find((u) => u.name === f);
    return o && oi(ht(o), a.settings) ? f : "";
  }
  function Q() {
    w.replaceChildren(), H.clear(), I = null;
    const o = A();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      w.append(
        ee("line", { x1: 0, x2: o.width, y1: oe(o, l), y2: oe(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      w.append(ee("line", { x1: ue(o, l), x2: ue(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && w.append(ee("path", { d: zt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && w.append(ee("path", { d: zt(o, a.frequencies, a.afterDb), class: "spectrum after" })), p ? w.append(ee("line", { x1: 0, x2: o.width, y1: oe(o, 0), y2: oe(o, 0), class: "curve flat" })) : a.frequencies.length && (I = ee("path", { d: Lt(o, a.frequencies, a.response), class: "curve" }), w.append(I)), !a.readonly && !p && a.settings.bands.forEach((l, m) => {
      const x = Le[m % Le.length], $ = ge.includes(l.type) ? l.gain_db : 0, g = ee("circle", {
        cx: ue(o, l.frequency_hz),
        cy: oe(o, $),
        r: l.id === _ ? 9 : 7,
        class: l.id === _ ? "handle selected" : "handle",
        style: `stroke: ${x}`,
        tabindex: 0,
        "data-band": l.id
      });
      g.setAttribute("aria-label", `Band ${m + 1}: ${xe(l)}`), l.enabled || g.classList.add("disabled"), g.append(ee("title", {})), g.lastChild.textContent = `Band ${m + 1}: ${xe(l)}`, g.addEventListener("pointerdown", (C) => wn(C, l.id)), g.addEventListener("dblclick", (C) => {
        C.stopPropagation(), L(Ct(a.settings, l.id));
      }), g.addEventListener("focus", () => bn(l.id)), g.addEventListener("keydown", (C) => gt(C, l.id)), g.addEventListener("wheel", (C) => {
        C.preventDefault();
        const le = C.deltaY < 0 ? 1.15 : 1 / 1.15;
        L(Ve(a.settings, l.id, le));
      }), g.addEventListener("contextmenu", (C) => {
        C.preventDefault(), L(Ye(a.settings, l.id));
      }), w.append(g), H.set(l.id, g);
    }), hn(), mn(), gn();
    const u = a.settings.bands.find((l) => l.id === _);
    R.textContent = a.note || (p ? "compare: the curve is off (the node still applies it)" : u ? xe(u) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Oe}`), r.disabled = a.readonly, c.disabled = !z.canUndo, b.disabled = !z.canRedo, v.disabled = a.readonly || !a.settings.bands.length, j && (j = !1, _ && H.get(_)?.focus({ preventScroll: !0 })), s.value = String(d), r.value = mt(), S.classList.toggle("active", p), k.classList.toggle("active", Fe()), e.setDirtyCanvas?.(!0, !0);
  }
  function hn() {
    if (B.replaceChildren(), a.readonly && !a.settings.bands.length) {
      B.append(P("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, u) => {
      const l = P("button", "plenio-eq-chip", ii(o, u));
      l.style.borderLeftColor = Le[u % Le.length], l.classList.toggle("selected", o.id === _), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${u + 1}`), l.title = `Band ${u + 1}: ${xe(o)} - click to open its fields`, l.addEventListener("click", (m) => {
        m.stopPropagation(), _ = _ === o.id ? null : o.id, Q();
      }), B.append(l);
    });
  }
  function mn() {
    D.replaceChildren();
    const o = a.settings.bands.find((g) => g.id === _);
    if (!o || a.readonly) {
      M.style.display = "none";
      return;
    }
    M.style.display = "";
    const u = P("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    u.title = "The selected band";
    const l = P("select");
    l.setAttribute("aria-label", "Band type"), l.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [g, C] of Object.entries(nn)) l.append(new Option(C, g));
    l.value = o.type, l.addEventListener("change", () => L(Be(a.settings, o.id, { type: l.value })));
    const m = P("input");
    m.type = "checkbox", m.checked = o.enabled, m.setAttribute("aria-label", "Band enabled"), m.title = "Band enabled: off keeps the band in the list but out of the response", m.addEventListener("change", () => L(Be(a.settings, o.id, { enabled: m.checked })));
    const x = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (g) => je(o.id, "frequency_hz", Qe(g, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (g) => je(o.id, "gain_db", Qe(g))],
      ["Q", `${o.q}`, 60, (g) => je(o.id, "q", Qe(g))]
    ];
    D.append(u, l, m);
    for (const [g, C, le, Ae] of x) {
      const G = P("input", "number");
      G.value = C, G.style.width = `${le}px`, G.setAttribute("aria-label", `Band ${g}`), G.title = g === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : g === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const $e = () => {
        Ae(G.value) || (G.value = C);
      };
      G.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && $e();
      }), G.addEventListener("blur", $e), (g === "dB" && !ge.includes(o.type) || g === "Q" && !en.includes(o.type)) && (G.disabled = !0), D.append(G);
    }
    const $ = ce("", "remove", "Remove this band");
    $.addEventListener("click", (g) => {
      g.stopPropagation(), _ = null, L(Ye(a.settings, o.id));
    }), D.append($);
  }
  function gn() {
    O.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      P(
        "span",
        "plenio-eq-hint",
        T === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const u = ce("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    u.disabled = !a.settings.bands.length, u.addEventListener("click", (l) => {
      l.stopPropagation();
      const m = te(e, "mode");
      if (!m) return;
      m.value = "manual", m.callback?.("manual");
      const x = de();
      if (x) {
        const $ = me(a.settings);
        x.value = $, x.callback?.($);
      }
      z.reset(a.settings), Ge(), pe(0);
    }), O.append(u);
  }
  function bn(o) {
    _ = o, j = !0, Q();
  }
  function vn(o) {
    _ = o, Ie();
  }
  function Ie() {
    const o = A();
    a.settings.bands.forEach((l) => {
      const m = H.get(l.id);
      if (!m) return;
      const x = ge.includes(l.type) ? l.gain_db : 0;
      m.setAttribute("cx", String(ue(o, l.frequency_hz))), m.setAttribute("cy", String(oe(o, x))), m.classList.toggle("selected", l.id === _), m.setAttribute("r", l.id === _ ? "9" : "7");
    }), I && a.frequencies.length && I.setAttribute("d", Lt(o, a.frequencies, a.response));
    const u = a.settings.bands.find((l) => l.id === _);
    u && (R.textContent = xe(u));
  }
  function yn() {
    clearTimeout(W), W = setTimeout(async () => {
      const o = a.settings, u = ++E;
      try {
        const l = await wt(t, o, a.sampleRate);
        if (u !== E) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Ie();
      } catch {
      }
    }, 60);
  }
  function Fe() {
    return !te(e, Ne)?.plenioHidden;
  }
  function We(o) {
    const u = te(e, Ne);
    u && (u.plenioHidden = !o, o ? delete u.computeSize : u.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function je(o, u, l) {
    if (l === null) return !1;
    const m = a.settings.bands.find((x) => x.id === o);
    return m && m[u] === l || L(Be(a.settings, o, { [u]: l })), !0;
  }
  function wn(o, u) {
    o.preventDefault(), o.stopPropagation(), _ !== u && vn(u);
    const l = a.settings.bands.find((V) => V.id === u);
    if (!l) return;
    N = { hz: l.frequency_hz, db: l.gain_db };
    let m = !1, x = !1;
    const $ = o.currentTarget;
    try {
      $?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const g = w.getBoundingClientRect(), C = g.width ? g.left : 0, le = g.height ? g.top : 0, Ae = g.width || X.width, G = g.height || X.height, $e = (V, qe) => V >= C - 1 && V <= C + Ae + 1 && qe >= le - 1 && qe <= le + G + 1;
    function Z() {
      if (!x) {
        x = !0;
        try {
          $?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", yt, re), window.removeEventListener("pointerup", Z, re), window.removeEventListener("pointercancel", Z, re), window.removeEventListener("blur", Z, re), N = null, m && L(a.settings);
      }
    }
    const yt = (V) => {
      if (x || !N) return;
      if (V.buttons === 0) {
        Z();
        return;
      }
      if (!$e(V.clientX, V.clientY)) return;
      const qe = X.width / Ae, _n = X.height / G, En = (V.clientX - C) * qe, Sn = (V.clientY - le) * _n, kn = ue(A(), N.hz), An = oe(A(), N.db), $n = qt(A(), Nt(kn, En, V.shiftKey)), qn = Mt(A(), Nt(An, Sn, V.shiftKey));
      a = { ...a, settings: we(a.settings, u, $n, qn, a.sampleRate) }, m = !0, Ie(), yn();
    };
    window.addEventListener("pointermove", yt, re), window.addEventListener("pointerup", Z, re), window.addEventListener("pointercancel", Z, re), window.addEventListener("blur", Z, re);
  }
  function gt(o, u) {
    const l = a.settings.bands.find((g) => g.id === u);
    if (!l) return;
    const m = o.shiftKey ? 0.1 : 0.5, x = o.shiftKey ? 1.01 : 1.06;
    let $ = null;
    o.key === "ArrowUp" ? $ = we(a.settings, u, l.frequency_hz, l.gain_db + m, a.sampleRate) : o.key === "ArrowDown" ? $ = we(a.settings, u, l.frequency_hz, l.gain_db - m, a.sampleRate) : o.key === "ArrowRight" ? $ = we(a.settings, u, l.frequency_hz * x, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? $ = we(a.settings, u, l.frequency_hz / x, l.gain_db, a.sampleRate) : o.key === "+" ? $ = Ve(a.settings, u, 1.15) : o.key === "-" ? $ = Ve(a.settings, u, 1 / 1.15) : o.key === "0" ? $ = Ct(a.settings, u) : (o.key === "Delete" || o.key === "Backspace") && ($ = Ye(a.settings, u)), $ && (o.preventDefault(), L($));
  }
  w.addEventListener("keydown", (o) => {
    _ && o.target === w && gt(o, _);
  }), w.addEventListener("dblclick", (o) => {
    if (a.readonly || p) return;
    const u = w.getBoundingClientRect(), l = X.width / (u.width || X.width), m = X.height / (u.height || X.height), x = (o.clientX - u.left) * l, $ = (o.clientY - u.top) * m, g = ni(a.settings, qt(A(), x), Mt(A(), $), a.sampleRate);
    g ? (_ = g.bands[g.bands.length - 1].id, L(g)) : (a = { ...a, note: `the EQ has at most ${Oe} bands` }, Q());
  }), r.append(new Option("preset…", "")), Xe ??= Ln(t).then((o) => o.manual).catch(() => []), Xe.then((o) => {
    h = o;
    for (const u of o) r.append(new Option(u.name, u.name));
    r.value = mt();
  }), r.addEventListener("change", async () => {
    const o = (await Xe)?.find((u) => u.name === r.value);
    o && (f = o.name, L(ht(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = $t.find((u) => u === o) ?? 12, Q();
  }), c.addEventListener("click", () => {
    const o = z.undo();
    o && L(o, { record: !1 });
  }), b.addEventListener("click", () => {
    const o = z.redo();
    o && L(o, { record: !1 });
  }), v.addEventListener("click", () => {
    _ = null, L(fe());
  }), S.addEventListener("click", () => {
    p = !p, Q();
  }), k.addEventListener("click", () => {
    We(!Fe()), Q();
  });
  function Ge() {
    for (const o of ["mode", Ne]) {
      const u = te(e, o);
      if (!u || u.plenioWatched) continue;
      u.plenioWatched = !0;
      const l = u.callback;
      u.callback = (m) => {
        l?.(m), setTimeout(() => {
          Fe() || We(!1), pe();
        });
      };
    }
  }
  Ge(), We(!1), pe(0);
  let bt = null, vt = null;
  const xn = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(xn);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), u = String(de()?.value ?? "");
    o === bt && u === vt || (bt = o, vt = u, Ge(), pe(0));
  }, 700);
  return {
    showExecuted(o) {
      const u = o?.plenio_eq, l = u?.[u.length - 1];
      if (!l) return;
      const m = String(te(e, "mode")?.value ?? "flat"), x = m === "manual";
      T = x || m === "flat" ? null : m, a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !x,
        note: x ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, x ? pe(0) : Q();
    }
  };
}
const ut = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, li = new Set(ke.map((e) => lt[e]));
function ci(e, t) {
  return !(e in ut) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => li.has(n) && Ut(i)).map(([n]) => n);
}
function ui(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function di(e, t) {
  const n = ut[e.name];
  if (!n || !t) return t;
  const i = ui(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const b = ci(e.name, c.widgets_values_named);
  if (b.length) {
    const v = { ...c.widgets_values_named };
    for (const S of b) v[S] = "";
    c = { ...c, widgets_values_named: v };
  }
  return c;
}
const rn = /* @__PURE__ */ new Map(), nt = /* @__PURE__ */ new Set();
function Ot(e, t) {
  rn.set(e, t);
  for (const n of nt) n(e);
}
function Ce(e) {
  return rn.get(e) ?? null;
}
function pi(e) {
  return nt.add(e), () => nt.delete(e);
}
const sn = /* @__PURE__ */ new Map();
function fi(e) {
  e?.draft_sha256 && sn.set(e.draft_sha256, e);
}
function hi(e) {
  return e ? sn.get(e) ?? null : null;
}
const Ue = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function mi(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function gi(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function on(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function bi(e) {
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
const Te = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new Set();
function vi(e) {
  return Te.get(e) ?? null;
}
function it(e, t) {
  t ? Te.set(e, t) : Te.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ee) n(e);
}
function yi(e) {
  for (const t of e) Te.delete(t);
  for (const t of Ee) t(null);
}
function wi() {
  for (const e of Ee) e(null);
}
function xi(e) {
  return Ee.add(e), () => Ee.delete(e);
}
const Bt = "600 12px sans-serif", ze = 20, Je = 7;
function _i(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Ei(e) {
  const t = e ? _i(e) : "";
  return {
    height: e ? ze : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Bt;
      const i = n.measureText(t).width + 2 * Je;
      return n.restore(), i;
    },
    draw(n, i, r) {
      if (!e) return;
      n.save(), n.font = Bt;
      const s = n.measureText(t).width + 2 * Je;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(i, r, s, ze, 5) : n.rect(i, r, s, ze), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, i + Je, r + ze / 2 + 0.5), n.restore();
    }
  };
}
const Si = "PlenioSongSheet", ki = 30;
function an(e, t) {
  const n = e.widgets?.find((i) => i.name === t);
  return n ? String(n.value ?? "") : null;
}
function Ai(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? an(n, "mode") : null;
  } catch {
    return null;
  }
}
function rt(e) {
  const t = vi(e);
  return t || (e.type !== Si ? null : gi(an(e, "review") ?? "continue", Ai(e)) ? "stop" : null);
}
function $i(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return on(n);
  const i = e?.plenio_summary;
  return mi(i?.[i.length - 1]?.status);
}
function qi(e, t) {
  const n = e.prototype, i = n.onNodeCreated;
  n.onNodeCreated = function() {
    i?.call(this);
    const r = this;
    r.badges?.push(() => {
      const s = rt(r);
      return Ei(s ? Ue[s] : null);
    });
  }, n.onDrawForeground = ne(n.onDrawForeground, function(r) {
    const s = rt(this);
    !s || !Ue[s].frame || this.flags?.collapsed || !this.size || Mi(r, Ue[s], this.size, ki, t.scale());
  }), n.onExecuted = ne(n.onExecuted, function(r) {
    const s = $i(r);
    s && (it(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function Mi(e, t, n, i, r) {
  const s = Math.max(3, 3 / Math.max(r, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const c = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-c, -i - c, n[0] + 2 * c, n[1] + i + 2 * c, 10) : e.rect(-c, -i - c, n[0] + 2 * c, n[1] + i + 2 * c), e.stroke(), e.restore();
}
const dt = "plenio.sheet_state/1", He = ["title", "style", "lyrics", "score", "artwork_prompt"];
function pt() {
  return { schema: dt, docs: {} };
}
function Pe(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return pt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== dt || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function ln(e) {
  const t = {};
  for (const i of He) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: dt, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Ke(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ni(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = He.filter((i) => Ke(e, i) !== "auto").map(
    (i) => i === "lyrics" && Ke(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${Ke(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Tt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), i = Math.round(t - n * 60);
  return `${n}:${String(i).padStart(2, "0")}`;
}
function qr(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Tt(r?.[0] ?? 0), end: Tt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function _e(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Li(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Mr(e, t, n) {
  return n.map((i) => ({ kind: i, text: Li(e, t, i), intent: "keep" }));
}
function Ci(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], b = t?.docs[s.kind], v = _e(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: v };
    else if (s.intent === "rebase")
      b?.upstream_sha256 ? i[s.kind] = { state: "edited", text: v, base_sha256: b.upstream_sha256 } : i[s.kind] = { state: "manual", text: v };
    else if (c)
      _e(c.text) !== v && (i[s.kind] = { ...c, text: v });
    else {
      const S = _e(b?.upstream ?? "");
      if (v === S) continue;
      i[s.kind] = b?.upstream_sha256 ? { state: "edited", text: v, base_sha256: b.upstream_sha256 } : { state: "manual", text: v };
    }
  }
  const r = { ...pt(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Nr(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function zi(e, t) {
  return He.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Lr(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ri = "PlenioSongSheet";
function ft(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function cn(e, t) {
  const n = (e.inputs ?? []).findIndex((i) => i.name === t && i.link != null);
  return n < 0 ? null : e.getInputNode?.(n) ?? null;
}
function Oi(e) {
  const t = cn(e, "context_lyrics");
  return t && (t.comfyClass ?? t.type) === Ri && ft(t) ? t : null;
}
function Bi(e, t, n) {
  const i = [], r = cn(t, n);
  r && i.push(r);
  const s = /* @__PURE__ */ new Set();
  for (; i.length && s.size < 1e3; ) {
    const c = i.shift(), b = String(c.id);
    if (!s.has(b)) {
      if (s.add(b), c === e || b === String(e.id)) return !0;
      (c.inputs ?? []).forEach((v, S) => {
        const k = v.link != null ? c.getInputNode?.(S) : null;
        k && i.push(k);
      });
    }
  }
  return !1;
}
function Ti(e, t, n) {
  const i = Oi(e), r = t?.context?.lyrics;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", c = Pe(ft(i)?.value), b = c?.docs.lyrics?.text ?? n(String(i.id))?.docs.lyrics?.upstream ?? null;
  let v = null;
  return c === null ? v = `The state of ${s} is unreadable - open that sheet and apply it first.` : b !== null && _e(b) !== _e(r) && (v = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: i, target: { title: s, blocked: v, replans: Bi(i, e, "score") } };
}
function Pi(e, t, n) {
  const i = ft(e);
  if (!i) return;
  const r = Pe(i.value) ?? pt();
  i.value = ln(Ci(r, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
const un = "PLENIO_SHEET_STATE", Pt = 68;
let st = null;
function Di(e) {
  st = e;
}
const Hi = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…";
  const b = document.createElement("div");
  b.className = "plenio-sheet-status", r.append(c, s, b);
  let v = !1;
  const S = () => {
    const w = Ce(String(e.id));
    s.textContent = Ni(Pe(i)) + (w ? ` · ${w.status}` : "");
    const B = rt(e);
    b.textContent = bi(B), b.dataset.state = B ?? "";
    const M = v ? null : e.widgets?.find((D) => D.name === "review");
    if (M) {
      v = !0;
      const D = M.callback;
      M.callback = (Y) => {
        D?.(Y), S();
      };
    }
  }, k = e.addDOMWidget(t, un, r, {
    getValue: () => i,
    setValue: (w) => {
      i = typeof w == "string" ? w : "", S();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Pt,
    getMaxHeight: () => Pt
  });
  c.addEventListener("click", async (w) => {
    w.stopPropagation();
    const B = Pe(i);
    B === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const M = Ce(String(e.id)), Y = (e.inputs ?? []).filter((y) => y.link != null).map((y) => y.name), a = B ?? { schema: "plenio.sheet_state/1", docs: {} }, T = M?.owned ?? zi(Y, a), _ = String(e.widgets?.find((y) => y.name === "review")?.value ?? "continue"), p = _ === "as the brief says" ? M?.review ?? "continue" : _, { openSheetDialog: d } = await import("./open-DFA1W9s5.mjs"), { parseGuide: f, serializeGuide: h } = await import("./tracks-DxmZeggM.mjs");
    if (!st) throw new Error("Plenio: API not initialised");
    const E = Ti(e, M, Ce);
    d({
      title: e.title || "Song Sheet",
      state: a,
      payload: M,
      asrNote: hi(M?.docs.lyrics?.upstream_sha256),
      owned: T.length ? T : [...He],
      review: p,
      fetcher: st,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: f(e.properties?.plenio_guide),
      lyricsTarget: E?.target ?? null,
      onApply: (y, W, N) => {
        k.value = ln(y), e.properties = { ...e.properties ?? {}, plenio_guide: h(W) }, N !== null && E && !E.target.blocked && Pi(E.owner, N, Ce(String(E.owner.id))), e.setDirtyCanvas?.(!0, !0);
      }
    });
  });
  const R = [
    pi((w) => {
      w === String(e.id) && S();
    }),
    xi((w) => {
      (w === null || w === e) && S();
    })
  ], O = e.onRemoved;
  return e.onRemoved = function() {
    for (const w of R) w();
    O?.call(this);
  }, S(), { widget: k };
}, Se = "plenio.stem_mix/1", be = "rest", Ii = ["reverb", "delay"], dn = -60, Fi = 12;
function Wi() {
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
function pn(e) {
  const t = Wi();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const ji = ["vocals", "drums", "bass", "other"];
function Gi() {
  return [...ji, be];
}
function Vi(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Se, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Se || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Yi(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || pn(J(e, i))) continue;
    const r = {}, s = J(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: Se, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function De(e, t, n) {
  const i = { ...e.strips };
  return pn(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function Qi(e, t, n) {
  const i = n.some((s) => J(e, s).solo), r = J(e, t);
  return i ? r.solo : !r.mute;
}
function Dt(e) {
  return e <= dn ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Xi(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function Ui(e, t, n) {
  return Xi([...e, [t, n]]);
}
function Ji(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function Ki(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function Zi(e, t, n, i) {
  const r = J(e, t);
  return De(e, t, { ...r, muted: Ui(r.muted, n, i) });
}
function er(e, t, n) {
  const i = J(e, t), r = Ji(i.muted, n);
  return r < 0 ? e : De(e, t, { ...i, muted: Ki(i.muted, r) });
}
function tr(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function nr(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function Ht(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Gi()).filter((s) => s !== be), r = Object.keys(e?.strips ?? {}).filter((s) => s !== be && !i.includes(s));
  return [...i, ...r, be];
}
const It = "plenio_stem_mixer", Ft = "mix", se = 200, ir = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function Re(e, t, n, i, r) {
  const s = q("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function rr(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), r = q("div", "plenio-mix-info"), s = q("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: Se, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Ht(null, null),
    peaks: {},
    seconds: 0
  }, b = !1;
  const v = () => e.widgets?.find((p) => p.name === Ft);
  function S(p, { draw: d = !0 } = {}) {
    const f = v();
    if (!f) return;
    const h = Yi(p);
    f.value = h, f.callback?.(h), c = { ...c, mix: p }, d && w();
  }
  function k(p, d, f = {}) {
    S(De(c.mix, p, { ...J(c.mix, p), ...d }), f);
  }
  function R(p, d, f, h = {}) {
    const E = J(c.mix, p);
    let y = De(c.mix, p, { ...E, [d]: f });
    f > 0 && !(y[d] && Object.keys(y[d]).length) && (y = d === "reverb" ? { ...y, reverb: { preset: "room" } } : { ...y, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), S(y, h);
  }
  function O(p, d, f) {
    const h = { ...c.mix[p] ?? {} };
    S({ ...c.mix, [p]: { ...h, [d]: f } });
  }
  function w() {
    n.replaceChildren();
    const p = c.names;
    for (const d of c.names) {
      const f = J(c.mix, d), h = q("div", "plenio-mix-strip");
      h.dataset.strip = d;
      const E = q("span", "name", d === be ? `${d} (missed)` : d);
      E.title = d === be ? "What the separator missed: keeps a neutral mix exact" : "";
      const y = Re(dn, Fi, 0.5, f.gain_db, `${d} gain`), W = q("span", "gain", `${Dt(f.gain_db)} dB`);
      y.addEventListener("input", () => {
        W.textContent = `${Dt(Number(y.value))} dB`, k(d, { gain_db: Number(y.value) }, { draw: !1 });
      }), y.addEventListener("change", () => k(d, { gain_db: Number(y.value) }));
      const N = q("button", f.mute ? "toggle active" : "toggle", "M");
      N.setAttribute("aria-label", `${d} mute`), N.addEventListener("click", (A) => {
        A.stopPropagation(), k(d, { mute: !f.mute });
      });
      const j = q("button", f.solo ? "toggle active" : "toggle", "S");
      j.setAttribute("aria-label", `${d} solo`), j.addEventListener("click", (A) => {
        A.stopPropagation(), k(d, { solo: !f.solo });
      });
      const H = Re(0, 1, 0.05, f.compression, `${d} compression`);
      H.title = "Compression amount: one knob for the master compressor (threshold and ratio)", H.addEventListener("input", () => k(d, { compression: Number(H.value) }, { draw: !1 })), H.addEventListener("change", () => k(d, { compression: Number(H.value) }));
      const I = Ii.map((A) => {
        const L = Re(0, 1, 0.05, f[A], `${d} ${A} send`);
        return L.title = `${A} send: how much of this stem goes to the shared ${A} bus`, L.addEventListener("input", () => R(d, A, Number(L.value), { draw: !1 })), L.addEventListener("change", () => R(d, A, Number(L.value))), L;
      }), z = q("button", f.save ? "toggle active" : "toggle", "save");
      z.setAttribute("aria-label", `${d} save as its own file`), z.setAttribute("aria-pressed", String(f.save)), z.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", z.addEventListener("click", (A) => {
        A.stopPropagation(), k(d, { save: !f.save });
      });
      const de = Qi(c.mix, d, p);
      h.classList.toggle("silent", !de);
      const K = q("canvas", "plenio-mix-wave");
      K.width = se, K.height = 26, K.setAttribute("aria-label", `${d} waveform (drag to mute a time range)`), B(K, f, nr(c.peaks, d, se)), K.addEventListener("pointerdown", (A) => M(A, K, d)), h.append(
        E,
        y,
        W,
        N,
        j,
        q("span", "label", "comp"),
        H,
        q("span", "label", "verb"),
        I[0],
        q("span", "label", "delay"),
        I[1],
        z,
        K
      ), n.append(h);
    }
    D(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function B(p, d, f) {
    const h = p.getContext("2d");
    if (!h) return;
    h.clearRect(0, 0, se, p.height);
    const E = p.height / 2;
    h.strokeStyle = "rgba(180, 190, 205, 0.8)", h.beginPath();
    for (let y = 0; y < f.length; y++) {
      const W = Math.max(1, f[y] * (E - 1));
      h.moveTo(y + 0.5, E - W), h.lineTo(y + 0.5, E + W);
    }
    h.stroke(), h.fillStyle = "rgba(224, 104, 94, 0.35)", h.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [y, W] of d.muted) {
      const N = Math.max(0, Math.min(se, y / Math.max(c.seconds, 1e-6) * se)), j = Math.max(0, Math.min(se, W / Math.max(c.seconds, 1e-6) * se));
      h.fillRect(N, 0, Math.max(1, j - N), p.height), h.strokeRect(N + 0.5, 0.5, Math.max(1, j - N) - 1, p.height - 1);
    }
  }
  function M(p, d, f) {
    if (p.preventDefault(), p.stopPropagation(), !c.seconds) return;
    const h = d.getBoundingClientRect(), E = (I) => Math.max(0, Math.min(1, (I - h.left) / (h.width || se))) * c.seconds, y = E(p.clientX);
    if (J(c.mix, f).muted.some(([I, z]) => I <= y && y <= z)) {
      S(er(c.mix, f, y));
      return;
    }
    let N = y;
    const j = (I) => {
      N = E(I.clientX);
    }, H = () => {
      window.removeEventListener("pointermove", j), window.removeEventListener("pointerup", H), S(Zi(c.mix, f, Math.min(y, N), Math.max(y, N)));
    };
    window.addEventListener("pointermove", j), window.addEventListener("pointerup", H);
  }
  function D() {
    i.replaceChildren();
    const p = { preset: "room", ...c.mix.reverb ?? {} }, d = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = q("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const y of ir) f.append(new Option(y, y));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => O("reverb", "preset", f.value));
    const h = q("input");
    h.type = "number", h.value = String(d.time_ms ?? 375), h.setAttribute("aria-label", "Delay time in ms"), h.title = "Delay time in ms: where the first echo of the delay bus sits", h.addEventListener("change", () => O("delay", "time_ms", Number(h.value)));
    const E = Re(0, 0.8, 0.05, Number(d.feedback ?? 0.35), "Delay feedback");
    E.title = "Delay feedback: how much of each echo returns into the delay line", E.addEventListener("input", () => O("delay", "feedback", Number(E.value))), i.append(
      q("span", "label", "reverb bus"),
      f,
      q("span", "label", "delay bus"),
      h,
      q("span", "label", "ms, feedback"),
      E
    ), i.style.display = "flex";
  }
  const Y = e.addDOMWidget(It, It, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Ft), T = q("button", "toggle", "JSON");
  T.title = "Show or hide the raw mixer value", T.addEventListener("click", (p) => {
    p.stopPropagation(), b = !b, T.classList.toggle("active", b), a && (a.plenioHidden = !b, b ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(q("span", "label", "Advanced"), T), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function _() {
    const p = Vi(v()?.value);
    c = { ...c, mix: p ?? { schema: Se, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), w();
  }
  return _(), {
    showExecuted(p) {
      const d = p?.plenio_stems?.at(-1), f = tr(p), h = Ht(c.mix, d ?? null);
      c = { ...c, names: h, peaks: f, seconds: Number(d?.seconds ?? c.seconds) || 0 }, _();
    }
  };
}
const sr = `
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
function or() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = sr, document.head.append(e);
}
function ot(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ze(e) {
  return ot(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function ar(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${ot(i.join(`
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
      const v = Math.min(c[1].length + 2, 6);
      t.push(`<h${v}>${Ze(c[2])}</h${v}>`);
      continue;
    }
    const b = /^\s*[-*]\s+(.*)$/.exec(s);
    if (b) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Ze(b[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${Ze(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${ot(i.join(`
`))}</code></pre>`), t.join("");
}
const et = "plenio_summary", Wt = "plenio_summary", jt = 84, lr = 18, cr = 55, ur = 16;
function dr(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / cr)), 0);
  return ur + t * lr;
}
function pr(e, t) {
  const n = e.widgets?.find((s) => s.name === Wt);
  if (n?.element) return n.element;
  const i = document.createElement("div");
  i.className = "plenio-summary";
  const r = e.addDOMWidget(Wt, "plenio_summary", i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => jt,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(jt, i.scrollHeight ? i.scrollHeight + 2 : dr(t.markdown))
  });
  return r.serialize = !1, i;
}
function fr(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Gt = /* @__PURE__ */ new WeakMap();
function Vt(e, t) {
  if (!t.markdown) return;
  const n = Gt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Gt.set(e, n);
  const i = pr(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = ar(t.markdown), fr(e), e.setDirtyCanvas?.(!0, !0);
}
function hr(e) {
  e.prototype.onExecuted = ne(e.prototype.onExecuted, function(t) {
    const n = t?.[et], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[et] = { markdown: i.markdown, status: i.status ?? "" }, Vt(this, i));
  }), e.prototype.onConfigure = ne(e.prototype.onConfigure, function() {
    const t = this.properties?.[et];
    t?.markdown && Vt(this, t);
  });
}
const mr = "Plenio.Core", he = Mn;
Di(he);
const at = Qt, fn = () => at.graph;
function Yt(e) {
  if (e == null) return null;
  const t = String(e);
  return fn()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const gr = {
  scale: () => at.canvas?.ds?.scale ?? 1,
  toast: (e, t) => at.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
};
Qt.registerExtension({
  name: mr,
  getCustomWidgets: () => ({ [un]: Hi }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => wi(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    hr(e), qi(e, gr);
    const n = Un(t.input);
    if (n.size || t.name in ut) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = di(t, r), c = Gn(s), b = i?.call(this, s);
        return Xn(this, c, n), b;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) fi(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, ai(this, he));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Fn.has(t.name) && Wn(e, he), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, rr(this));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && Ot(String(this.id), s);
    }));
  },
  setup() {
    or(), he.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Ot(String(t.node_id), t);
      const n = Yt(t.node_id);
      n && it(n, on(t));
    }), he.addEventListener("execution_start", () => {
      yi(fn()?.nodes ?? []);
    }), he.addEventListener("execution_error", (e) => {
      const t = Yt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && it(t, "error");
    });
  }
});
export {
  mr as E,
  Xt as P,
  Ar as a,
  xr as b,
  Er as c,
  qr as d,
  Sr as e,
  Ci as f,
  wr as g,
  ln as h,
  kr as i,
  _e as n,
  yr as r,
  Mr as s,
  _r as t,
  Lr as u,
  $r as v,
  Nr as w
};
