import { api as Cn } from "../../../../scripts/api.js";
import { app as Xt } from "../../../../scripts/app.js";
function ne(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Ut extends Error {
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
    throw new Ut(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function zn(e, t) {
  return ie(e, "/plenio/sheet/resolve", t);
}
async function Mr(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function qr(e, t, n) {
  return ie(e, "/plenio/score/analyze", n ? { abc: t, lyrics: n } : { abc: t });
}
function Nr(e, t, n, i) {
  return ie(e, "/plenio/score/transform", i ? { abc: t, operation: n, lyrics: i } : { abc: t, operation: n });
}
function Lr(e, t) {
  const { lyrics: n, ...i } = t;
  return ie(e, "/plenio/score/musicxml/export", n ? { ...i, lyrics: n } : i);
}
function Cr(e, t) {
  return ie(e, "/plenio/score/midi/export", t);
}
function zr(e, t) {
  return ie(e, "/plenio/score/midi/import", t);
}
function Rr(e, t) {
  return ie(e, "/plenio/lyrics/analyze", t);
}
function Or(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function xt(e, t, n, i = 200) {
  return ie(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function Rn(e, t) {
  return ie(e, "/plenio/brief/fields", t);
}
async function On(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Ut(`Request failed (${t.status})`);
  return await t.json();
}
const Ae = [
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
], Tn = ["length", "vocals", "melody"], dt = {
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
}, Bn = "custom";
function Jt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Bn;
}
function _e(e, t) {
  const n = dt[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Dn(e) {
  const t = {};
  for (const n of [...Ae, ...Tn]) {
    const i = _e(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function _t(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!Ae.includes(i.field)) continue;
    const r = _e(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function St(e) {
  const t = [];
  for (const n of Ae) {
    const i = _e(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function st(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Pn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${Fn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Hn(e) {
  const t = e ? st(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function In(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Fn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Et(e, t) {
  for (const n of t) {
    const i = _e(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Wn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Kt(e) {
  const t = [];
  for (const n of Ae) {
    const i = _e(e, n);
    !i || !Jt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const kt = "plenio_brief_template", jn = 400;
function Gn(e, t) {
  let n = null, i = !1, r = null, s;
  const l = document.createElement("div");
  l.className = "plenio-brief-template";
  const h = document.createElement("div");
  h.className = "line";
  const g = document.createElement("div");
  g.className = "hint";
  const x = document.createElement("div");
  x.className = "actions", l.append(h, g, x);
  const M = (p, d, f) => {
    const m = document.createElement("button");
    return m.textContent = p, m.title = d, m.addEventListener("click", (_) => {
      _.stopPropagation(), f();
    }), x.append(m), m;
  }, B = M("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Et(e, _t(e, n).map((p) => ({ field: p.field, value: p.value }))), A());
  }), D = M("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Et(e, st(n)), A());
  }), $ = M("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = St(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (Wn(e, p), A());
  }), k = M("↻", "Ask again what the template fills", () => {
    P();
  }), A = () => {
    const p = Pn(n, i);
    h.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", h.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const d = Hn(n), f = In(n);
    g.textContent = [d, f].filter(Boolean).join(" · "), g.style.display = g.textContent ? "" : "none", x.style.display = i && n && n.template !== "none" ? "" : "none", B.disabled = !n || !_t(e, n).length, D.disabled = !n || !st(n).length, $.disabled = !St(e).length, k.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, I = /* @__PURE__ */ new WeakSet(), j = () => {
    for (const p of ["template", ...Object.keys(dt)]) {
      const d = p === "template" ? e.widgets?.find((f) => f.name === "template") : _e(e, p);
      !d || I.has(d) || (I.add(d), d.callback = ne(d.callback, () => {
        j(), P();
      }));
    }
  }, a = async () => {
    j();
    const p = String(e.widgets?.find((d) => d.name === "template")?.value ?? "none");
    try {
      n = await Rn(t, { fields: Dn(e), template: p }), r = null;
    } catch (d) {
      n = null, r = `The template fields could not be read: ${d instanceof Error ? d.message : String(d)}`;
    }
    i = !0, A();
  };
  function P() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, jn);
  }
  j();
  const E = e.addDOMWidget(kt, kt, l, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return E.serialize = !1, Kt(e), A(), P(), {
    widget: E,
    refresh: P,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Vn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Yn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Gn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(l) {
    s?.call(this, l), Kt(this), n.get(this)?.refresh();
  };
}
const Qn = "COMFY_DYNAMICCOMBO_V3";
function Xn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Un(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Jn(e, t) {
  const n = Un(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Kn(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Zn(e, t, n) {
  if (!t || !e.widgets || Jn(e, t)) return !1;
  let i = 0;
  for (let r = 0; r < e.widgets.length; r++) {
    const s = e.widgets[r];
    if (s.serialize === !1) continue;
    let l;
    if (Array.isArray(t)) {
      if (i >= t.length) break;
      l = t[i++];
    } else if (s.name in t)
      l = t[s.name];
    else
      continue;
    if (n.has(s.name) && !Kn(s, l)) return !0;
    s.value !== l && (s.value = l);
  }
  return !0;
}
function ei(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === Qn && t.add(i);
  return t;
}
const Zt = "plenio.eq/1", Be = 8, ae = 20, ti = 2e4, we = 12, en = 15, ve = ["peak", "low_shelf", "high_shelf"], tn = ["peak", "notch", "highpass", "lowpass"], $t = [0.2, 10], At = [0.25, 1];
function me() {
  return { schema: Zt, preamp_db: 0, bands: [] };
}
function ni(e) {
  if (typeof e != "string" || !e.trim()) return me();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Zt,
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
function be(e) {
  return JSON.stringify(e);
}
const U = (e, t) => Number(e.toFixed(t));
function W(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function nn(e) {
  return e.db ?? en;
}
const Mt = [6, 12, 18], ii = { 6: 8, 12: 14, 18: 20 };
function ri(e, t) {
  return { ...e, db: ii[t] ?? en };
}
function ue(e, t) {
  return Math.log(W(t, ae, e.maxHz) / ae) / Math.log(e.maxHz / ae) * e.width;
}
function qt(e, t) {
  return ae * (e.maxHz / ae) ** W(t / e.width, 0, 1);
}
function oe(e, t) {
  const n = nn(e);
  return (1 - (W(t, -n, n) + n) / (2 * n)) * e.height;
}
function Nt(e, t) {
  const n = nn(e);
  return (1 - W(t / e.height, 0, 1)) * 2 * n - n;
}
function Lt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Ct(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${ue(e, i).toFixed(1)},${oe(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function pt(e) {
  return Math.min(ti, 0.45 * e);
}
function si(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function oi(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Be) return null;
  const r = {
    id: si(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(W(t, ae, pt(i)), 1),
    gain_db: U(W(n, -we, we), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function Se(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: U(W(n, ae, pt(r)), 1),
        gain_db: ve.includes(s.type) ? U(W(i, -we, we), 1) : s.gain_db
      }
    )
  };
}
function Ue(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(W(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Je(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Ee(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ve.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function ai(e, t) {
  const n = rn[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = ve.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = tn.includes(e.type) ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const rn = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Ke(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function Ce(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function De(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: U(W(Ce(s.frequency_hz, r.frequency_hz), ae, pt(i)), 1),
        gain_db: U(W(Ce(s.gain_db, r.gain_db), -we, we), 1),
        q: U(W(Ce(s.q, r.q), $t[0], $t[1]), 3),
        slope: U(W(Ce(s.slope, r.slope), At[0], At[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function zt(e, t) {
  return De(e, t, { gain_db: 0 });
}
function Rt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((B) => Number.isFinite(B));
  if (!r.length) return "";
  const s = Math.max(...r), l = Math.min(...r), h = Math.max(s - l, 1e-6), g = e.height - 4, x = g - Math.max(12, e.height * W(i, 0.1, 0.95));
  return `M${t.map((B, D) => {
    const $ = n[D], k = Number.isFinite($) ? ($ - l) / h : 0;
    return `${ue(e, B).toFixed(1)},${(g - k * (g - x)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${g.toFixed(1)} L0,${g.toFixed(1)} Z`;
}
class li {
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
    be(t) !== be(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const ci = "http://www.w3.org/2000/svg", Ot = "plenio_eq_panel", ze = "mode.bands", re = { capture: !0 }, X = { width: 560, height: 260 }, Re = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Ze = null;
function ee(e, t) {
  const n = document.createElementNS(ci, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function H(e, t, n) {
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
function ui(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function di(e, t) {
  const n = H("div", "plenio-eq"), i = H("div", "plenio-eq-tools"), r = H("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = H("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of Mt) s.append(new Option(`±${o} dB`, String(o)));
  const l = ce("", "↶", "Undo the last band change"), h = ce("", "↷", "Redo the last band change"), g = ce("", "reset", "Remove every band"), x = ce("", "compare", "Show the curve without the EQ (bypass)"), M = ce("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), B = H("span", "plenio-eq-info");
  B.setAttribute("aria-live", "polite"), B.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, l, h, g, x, M, B);
  const D = H("div", "plenio-eq-mode"), $ = ee("svg", {
    viewBox: `0 0 ${X.width} ${X.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  $.setAttribute("aria-label", "EQ response curve"), $.setAttribute("tabindex", "0"), $.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const k = H("div", "plenio-eq-strip"), A = H("div", "plenio-eq-editor"), I = H("div", "plenio-eq-fields");
  A.append(I), n.append(i, D, $, k, A);
  const j = e.addDOMWidget(Ot, Ot, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: me(), readonly: !0, note: "" }, P = null, E = null, p = !1, d = 12, f = null, m = [], _ = 0, y, G, S = null, F = !1;
  const T = /* @__PURE__ */ new Map();
  let O = null;
  const z = new li(me()), pe = () => te(e, ze), K = () => d, q = () => ri({ ...X, maxHz: Math.min(2e4, a.sampleRate / 2) }, K());
  function C(o, { record: u = !0 } = {}) {
    const c = pe();
    if (!c) return;
    const b = be(o);
    c.value = b, c.callback?.(b), u && z.push(o), a = { ...a, settings: o }, Q(), fe(0);
  }
  async function fe(o = 120) {
    clearTimeout(y), y = setTimeout(async () => {
      const u = String(te(e, "mode")?.value ?? "flat");
      if (u !== "manual") {
        u === "flat" ? a = {
          ...a,
          settings: me(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : P !== u ? a = {
          ...a,
          settings: me(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: `${u}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : a = { ...a, readonly: !0 }, Q();
        return;
      }
      const c = ni(pe()?.value);
      if (!c) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      be(c) !== be(z.current) && z.reset(c);
      const b = ++_;
      try {
        const w = await xt(t, c, a.sampleRate);
        if (b !== _) return;
        a = {
          ...a,
          frequencies: w.frequency_hz,
          response: w.response_db,
          settings: w.settings,
          readonly: !1,
          note: ""
        };
      } catch (w) {
        a = { ...a, readonly: !1, note: w instanceof Error ? w.message : String(w) };
      }
      Q();
    }, o);
  }
  const mt = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Be)
  });
  function gt() {
    if (!f) return "";
    const o = m.find((u) => u.name === f);
    return o && ui(mt(o), a.settings) ? f : "";
  }
  function Q() {
    $.replaceChildren(), T.clear(), O = null;
    const o = q();
    for (const c of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      $.append(
        ee("line", { x1: 0, x2: o.width, y1: oe(o, c), y2: oe(o, c), class: c ? "grid" : "grid zero" })
      );
    for (const c of [100, 1e3, 1e4])
      $.append(ee("line", { x1: ue(o, c), x2: ue(o, c), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && $.append(ee("path", { d: Rt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && $.append(ee("path", { d: Rt(o, a.frequencies, a.afterDb), class: "spectrum after" })), p ? $.append(ee("line", { x1: 0, x2: o.width, y1: oe(o, 0), y2: oe(o, 0), class: "curve flat" })) : a.frequencies.length && (O = ee("path", { d: Ct(o, a.frequencies, a.response), class: "curve" }), $.append(O)), !a.readonly && !p && a.settings.bands.forEach((c, b) => {
      const w = Re[b % Re.length], N = ve.includes(c.type) ? c.gain_db : 0, v = ee("circle", {
        cx: ue(o, c.frequency_hz),
        cy: oe(o, N),
        r: c.id === E ? 9 : 7,
        class: c.id === E ? "handle selected" : "handle",
        style: `stroke: ${w}`,
        tabindex: 0,
        "data-band": c.id
      });
      v.setAttribute("aria-label", `Band ${b + 1}: ${Ee(c)}`), c.enabled || v.classList.add("disabled"), v.append(ee("title", {})), v.lastChild.textContent = `Band ${b + 1}: ${Ee(c)}`, v.addEventListener("pointerdown", (R) => Sn(R, c.id)), v.addEventListener("dblclick", (R) => {
        R.stopPropagation(), C(zt(a.settings, c.id));
      }), v.addEventListener("focus", () => wn(c.id)), v.addEventListener("keydown", (R) => bt(R, c.id)), v.addEventListener("wheel", (R) => {
        R.preventDefault();
        const le = R.deltaY < 0 ? 1.15 : 1 / 1.15;
        C(Ue(a.settings, c.id, le));
      }), v.addEventListener("contextmenu", (R) => {
        R.preventDefault(), C(Je(a.settings, c.id));
      }), $.append(v), T.set(c.id, v);
    }), bn(), vn(), yn();
    const u = a.settings.bands.find((c) => c.id === E);
    B.textContent = a.note || (p ? "compare: the curve is off (the node still applies it)" : u ? Ee(u) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Be}`), r.disabled = a.readonly, l.disabled = !z.canUndo, h.disabled = !z.canRedo, g.disabled = a.readonly || !a.settings.bands.length, F && (F = !1, E && T.get(E)?.focus({ preventScroll: !0 })), s.value = String(d), r.value = gt(), x.classList.toggle("active", p), M.classList.toggle("active", Ve()), e.setDirtyCanvas?.(!0, !0);
  }
  function bn() {
    if (k.replaceChildren(), a.readonly && !a.settings.bands.length) {
      k.append(H("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, u) => {
      const c = H("button", "plenio-eq-chip", ai(o, u));
      c.style.borderLeftColor = Re[u % Re.length], c.classList.toggle("selected", o.id === E), c.classList.toggle("disabled", !o.enabled), c.setAttribute("aria-label", `Edit band ${u + 1}`), c.title = `Band ${u + 1}: ${Ee(o)} - click to open its fields`, c.addEventListener("click", (b) => {
        b.stopPropagation(), E = E === o.id ? null : o.id, Q();
      }), k.append(c);
    });
  }
  function vn() {
    I.replaceChildren();
    const o = a.settings.bands.find((v) => v.id === E);
    if (!o || a.readonly) {
      A.style.display = "none";
      return;
    }
    A.style.display = "";
    const u = H("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    u.title = "The selected band";
    const c = H("select");
    c.setAttribute("aria-label", "Band type"), c.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [v, R] of Object.entries(rn)) c.append(new Option(R, v));
    c.value = o.type, c.addEventListener("change", () => C(De(a.settings, o.id, { type: c.value })));
    const b = H("input");
    b.type = "checkbox", b.checked = o.enabled, b.setAttribute("aria-label", "Band enabled"), b.title = "Band enabled: off keeps the band in the list but out of the response", b.addEventListener("change", () => C(De(a.settings, o.id, { enabled: b.checked })));
    const w = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (v) => Qe(o.id, "frequency_hz", Ke(v, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (v) => Qe(o.id, "gain_db", Ke(v))],
      ["Q", `${o.q}`, 60, (v) => Qe(o.id, "q", Ke(v))]
    ];
    I.append(u, c, b);
    for (const [v, R, le, qe] of w) {
      const V = H("input", "number");
      V.value = R, V.style.width = `${le}px`, V.setAttribute("aria-label", `Band ${v}`), V.title = v === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : v === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Ne = () => {
        qe(V.value) || (V.value = R);
      };
      V.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && Ne();
      }), V.addEventListener("blur", Ne), (v === "dB" && !ve.includes(o.type) || v === "Q" && !tn.includes(o.type)) && (V.disabled = !0), I.append(V);
    }
    const N = ce("", "remove", "Remove this band");
    N.addEventListener("click", (v) => {
      v.stopPropagation(), E = null, C(Je(a.settings, o.id));
    }), I.append(N);
  }
  function yn() {
    D.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      D.style.display = "none";
      return;
    }
    D.style.display = "", D.append(
      H(
        "span",
        "plenio-eq-hint",
        P === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const u = ce("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    u.disabled = !a.settings.bands.length, u.addEventListener("click", (c) => {
      c.stopPropagation();
      const b = te(e, "mode");
      if (!b) return;
      b.value = "manual", b.callback?.("manual");
      const w = pe();
      if (w) {
        const N = be(a.settings);
        w.value = N, w.callback?.(N);
      }
      z.reset(a.settings), Xe(), fe(0);
    }), D.append(u);
  }
  function wn(o) {
    E = o, F = !0, Q();
  }
  function xn(o) {
    E = o, Ge();
  }
  function Ge() {
    const o = q();
    a.settings.bands.forEach((c) => {
      const b = T.get(c.id);
      if (!b) return;
      const w = ve.includes(c.type) ? c.gain_db : 0;
      b.setAttribute("cx", String(ue(o, c.frequency_hz))), b.setAttribute("cy", String(oe(o, w))), b.classList.toggle("selected", c.id === E), b.setAttribute("r", c.id === E ? "9" : "7");
    }), O && a.frequencies.length && O.setAttribute("d", Ct(o, a.frequencies, a.response));
    const u = a.settings.bands.find((c) => c.id === E);
    u && (B.textContent = Ee(u));
  }
  function _n() {
    clearTimeout(G), G = setTimeout(async () => {
      const o = a.settings, u = ++_;
      try {
        const c = await xt(t, o, a.sampleRate);
        if (u !== _) return;
        a = { ...a, frequencies: c.frequency_hz, response: c.response_db }, Ge();
      } catch {
      }
    }, 60);
  }
  function Ve() {
    return !te(e, ze)?.plenioHidden;
  }
  function Ye(o) {
    const u = te(e, ze);
    u && (u.plenioHidden = !o, o ? delete u.computeSize : u.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Qe(o, u, c) {
    if (c === null) return !1;
    const b = a.settings.bands.find((w) => w.id === o);
    return b && b[u] === c || C(De(a.settings, o, { [u]: c })), !0;
  }
  function Sn(o, u) {
    o.preventDefault(), o.stopPropagation(), E !== u && xn(u);
    const c = a.settings.bands.find((Y) => Y.id === u);
    if (!c) return;
    S = { hz: c.frequency_hz, db: c.gain_db };
    let b = !1, w = !1;
    const N = o.currentTarget;
    try {
      N?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const v = $.getBoundingClientRect(), R = v.width ? v.left : 0, le = v.height ? v.top : 0, qe = v.width || X.width, V = v.height || X.height, Ne = (Y, Le) => Y >= R - 1 && Y <= R + qe + 1 && Le >= le - 1 && Le <= le + V + 1;
    function Z() {
      if (!w) {
        w = !0;
        try {
          N?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", wt, re), window.removeEventListener("pointerup", Z, re), window.removeEventListener("pointercancel", Z, re), window.removeEventListener("blur", Z, re), S = null, b && C(a.settings);
      }
    }
    const wt = (Y) => {
      if (w || !S) return;
      if (Y.buttons === 0) {
        Z();
        return;
      }
      if (!Ne(Y.clientX, Y.clientY)) return;
      const Le = X.width / qe, kn = X.height / V, $n = (Y.clientX - R) * Le, An = (Y.clientY - le) * kn, Mn = ue(q(), S.hz), qn = oe(q(), S.db), Nn = qt(q(), Lt(Mn, $n, Y.shiftKey)), Ln = Nt(q(), Lt(qn, An, Y.shiftKey));
      a = { ...a, settings: Se(a.settings, u, Nn, Ln, a.sampleRate) }, b = !0, Ge(), _n();
    };
    window.addEventListener("pointermove", wt, re), window.addEventListener("pointerup", Z, re), window.addEventListener("pointercancel", Z, re), window.addEventListener("blur", Z, re);
  }
  function bt(o, u) {
    const c = a.settings.bands.find((v) => v.id === u);
    if (!c) return;
    const b = o.shiftKey ? 0.1 : 0.5, w = o.shiftKey ? 1.01 : 1.06;
    let N = null;
    o.key === "ArrowUp" ? N = Se(a.settings, u, c.frequency_hz, c.gain_db + b, a.sampleRate) : o.key === "ArrowDown" ? N = Se(a.settings, u, c.frequency_hz, c.gain_db - b, a.sampleRate) : o.key === "ArrowRight" ? N = Se(a.settings, u, c.frequency_hz * w, c.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? N = Se(a.settings, u, c.frequency_hz / w, c.gain_db, a.sampleRate) : o.key === "+" ? N = Ue(a.settings, u, 1.15) : o.key === "-" ? N = Ue(a.settings, u, 1 / 1.15) : o.key === "0" ? N = zt(a.settings, u) : (o.key === "Delete" || o.key === "Backspace") && (N = Je(a.settings, u)), N && (o.preventDefault(), C(N));
  }
  $.addEventListener("keydown", (o) => {
    E && o.target === $ && bt(o, E);
  }), $.addEventListener("dblclick", (o) => {
    if (a.readonly || p) return;
    const u = $.getBoundingClientRect(), c = X.width / (u.width || X.width), b = X.height / (u.height || X.height), w = (o.clientX - u.left) * c, N = (o.clientY - u.top) * b, v = oi(a.settings, qt(q(), w), Nt(q(), N), a.sampleRate);
    v ? (E = v.bands[v.bands.length - 1].id, C(v)) : (a = { ...a, note: `the EQ has at most ${Be} bands` }, Q());
  }), r.append(new Option("preset…", "")), Ze ??= On(t).then((o) => o.manual).catch(() => []), Ze.then((o) => {
    m = o;
    for (const u of o) r.append(new Option(u.name, u.name));
    r.value = gt();
  }), r.addEventListener("change", async () => {
    const o = (await Ze)?.find((u) => u.name === r.value);
    o && (f = o.name, C(mt(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = Mt.find((u) => u === o) ?? 12, Q();
  }), l.addEventListener("click", () => {
    const o = z.undo();
    o && C(o, { record: !1 });
  }), h.addEventListener("click", () => {
    const o = z.redo();
    o && C(o, { record: !1 });
  }), g.addEventListener("click", () => {
    E = null, C(me());
  }), x.addEventListener("click", () => {
    p = !p, Q();
  }), M.addEventListener("click", () => {
    Ye(!Ve()), Q();
  });
  function Xe() {
    for (const o of ["mode", ze]) {
      const u = te(e, o);
      if (!u || u.plenioWatched) continue;
      u.plenioWatched = !0;
      const c = u.callback;
      u.callback = (b) => {
        c?.(b), setTimeout(() => {
          Ve() || Ye(!1), fe();
        });
      };
    }
  }
  Xe(), Ye(!1), fe(0);
  let vt = null, yt = null;
  const En = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(En);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), u = String(pe()?.value ?? "");
    o === vt && u === yt || (vt = o, yt = u, Xe(), fe(0));
  }, 700);
  return {
    showExecuted(o) {
      const u = o?.plenio_eq, c = u?.[u.length - 1];
      if (!c) return;
      const b = String(te(e, "mode")?.value ?? "flat"), w = b === "manual";
      P = w || b === "flat" ? null : b, a = {
        sampleRate: c.sample_rate,
        frequencies: c.frequency_hz,
        response: c.response_db,
        settings: c.settings,
        readonly: !w,
        note: w ? "" : `applied: ${c.settings.bands.length} band(s)`,
        beforeDb: c.spectrum_before_db,
        afterDb: c.spectrum_after_db
      }, w ? fe(0) : Q();
    }
  };
}
const ft = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, pi = new Set(Ae.map((e) => dt[e]));
function fi(e, t) {
  return !(e in ft) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => pi.has(n) && Jt(i)).map(([n]) => n);
}
function hi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function mi(e, t) {
  const n = ft[e.name];
  if (!n || !t) return t;
  const i = hi(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let l = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (l = { ...l, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (l = { ...l, widgets_values_named: { mode: n, ...s } });
  const h = fi(e.name, l.widgets_values_named);
  if (h.length) {
    const g = { ...l.widgets_values_named };
    for (const x of h) g[x] = "";
    l = { ...l, widgets_values_named: g };
  }
  return l;
}
const sn = /* @__PURE__ */ new Map(), ot = /* @__PURE__ */ new Set();
function Tt(e, t) {
  sn.set(e, t);
  for (const n of ot) n(e);
}
function he(e) {
  return sn.get(e) ?? null;
}
function gi(e) {
  return ot.add(e), () => ot.delete(e);
}
const on = /* @__PURE__ */ new Map();
function bi(e) {
  e?.draft_sha256 && on.set(e.draft_sha256, e);
}
function vi(e) {
  return e ? on.get(e) ?? null : null;
}
const et = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function yi(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function wi(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function an(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function xi(e) {
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
const He = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new Set();
function _i(e) {
  return He.get(e) ?? null;
}
function at(e, t) {
  t ? He.set(e, t) : He.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of ke) n(e);
}
function Si(e) {
  for (const t of e) He.delete(t);
  for (const t of ke) t(null);
}
function Ei() {
  for (const e of ke) e(null);
}
function ki(e) {
  return ke.add(e), () => ke.delete(e);
}
const Bt = "600 12px sans-serif", Oe = 20, tt = 7;
function $i(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Ai(e) {
  const t = e ? $i(e) : "";
  return {
    height: e ? Oe : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Bt;
      const i = n.measureText(t).width + 2 * tt;
      return n.restore(), i;
    },
    draw(n, i, r) {
      if (!e) return;
      n.save(), n.font = Bt;
      const s = n.measureText(t).width + 2 * tt;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(i, r, s, Oe, 5) : n.rect(i, r, s, Oe), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, i + tt, r + Oe / 2 + 0.5), n.restore();
    }
  };
}
const Mi = "PlenioSongSheet", qi = 30;
function ln(e, t) {
  const n = e.widgets?.find((i) => i.name === t);
  return n ? String(n.value ?? "") : null;
}
function Ni(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? ln(n, "mode") : null;
  } catch {
    return null;
  }
}
function lt(e) {
  const t = _i(e);
  return t || (e.type !== Mi ? null : wi(ln(e, "review") ?? "continue", Ni(e)) ? "stop" : null);
}
function Li(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return an(n);
  const i = e?.plenio_summary;
  return yi(i?.[i.length - 1]?.status);
}
function Ci(e, t) {
  const n = e.prototype, i = n.onNodeCreated;
  n.onNodeCreated = function() {
    i?.call(this);
    const r = this;
    r.badges?.push(() => {
      const s = lt(r);
      return Ai(s ? et[s] : null);
    });
  }, n.onDrawForeground = ne(n.onDrawForeground, function(r) {
    const s = lt(this);
    !s || !et[s].frame || this.flags?.collapsed || !this.size || zi(r, et[s], this.size, qi, t.scale());
  }), n.onExecuted = ne(n.onExecuted, function(r) {
    const s = Li(r);
    s && (at(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function zi(e, t, n, i, r) {
  const s = Math.max(3, 3 / Math.max(r, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const l = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l, 10) : e.rect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l), e.stroke(), e.restore();
}
const ht = "plenio.sheet_state/1", We = ["title", "style", "lyrics", "score", "artwork_prompt"];
function je() {
  return { schema: ht, docs: {} };
}
function xe(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return je();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== ht || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ie(e) {
  const t = {};
  for (const i of We) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: ht, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function nt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ri(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = We.filter((i) => nt(e, i) !== "auto").map(
    (i) => i === "lyrics" && nt(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${nt(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Dt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), i = Math.round(t - n * 60);
  return `${n}:${String(i).padStart(2, "0")}`;
}
function Tr(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Dt(r?.[0] ?? 0), end: Dt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function de(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Oi(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Br(e, t, n) {
  return n.map((i) => ({ kind: i, text: Oi(e, t, i), intent: "keep" }));
}
function cn(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const l = e.docs[s.kind], h = t?.docs[s.kind], g = de(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: g };
    else if (s.intent === "rebase")
      h?.upstream_sha256 ? i[s.kind] = { state: "edited", text: g, base_sha256: h.upstream_sha256 } : i[s.kind] = { state: "manual", text: g };
    else if (l)
      de(l.text) !== g && (i[s.kind] = { ...l, text: g });
    else {
      const x = de(h?.upstream ?? "");
      if (g === x) continue;
      i[s.kind] = h?.upstream_sha256 ? { state: "edited", text: g, base_sha256: h.upstream_sha256 } : { state: "manual", text: g };
    }
  }
  const r = { ...je(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Ti(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Bi(e, t) {
  return We.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Di(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Pi = "PlenioSongSheet";
function Me(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function un(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const i = e.graph, r = i?.links, s = i?.getLink?.(n) ?? (r instanceof Map ? r.get(n) : r?.[String(n)]);
    return s && i?.getNodeById ? i.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function dn(e, t) {
  const n = (e.inputs ?? []).findIndex((i) => i.name === t && i.link != null);
  return n < 0 ? null : un(e, n);
}
function pn(e, t) {
  const n = dn(e, t);
  return n && (n.comfyClass ?? n.type) === Pi && Me(n) ? n : null;
}
function Hi(e) {
  return pn(e, "context_lyrics");
}
function Ii(e) {
  return pn(e, "context_score");
}
function Fi(e, t, n) {
  const i = [], r = dn(t, n);
  r && i.push(r);
  const s = /* @__PURE__ */ new Set();
  for (; i.length && s.size < 1e3; ) {
    const l = i.shift(), h = String(l.id);
    if (!s.has(h)) {
      if (s.add(h), l === e || h === String(e.id)) return !0;
      (l.inputs ?? []).forEach((g, x) => {
        const M = un(l, x);
        M && i.push(M);
      });
    }
  }
  return !1;
}
function Wi(e, t, n) {
  const i = Hi(e), r = t?.context?.lyrics;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = xe(Me(i)?.value), h = l?.docs.lyrics?.text ?? n(String(i.id))?.docs.lyrics?.upstream ?? null;
  let g = null;
  return l === null ? g = `The state of ${s} is unreadable - open that sheet and apply it first.` : h !== null && de(h) !== de(r) && (g = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: i, target: { title: s, blocked: g, replans: Fi(i, e, "score") } };
}
function ji(e, t, n) {
  const i = Me(e);
  if (!i) return;
  const r = xe(i.value) ?? je();
  i.value = Ie(cn(r, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Gi(e, t, n) {
  const i = Ii(e), r = t?.context?.score;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = xe(Me(i)?.value), h = l?.docs.score?.text ?? n(String(i.id))?.docs.score?.upstream ?? null;
  let g = null;
  return l === null ? g = `The state of ${s} is unreadable - open that sheet and apply it first.` : h !== null && de(h) !== de(r) && (g = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: i, target: { title: s, blocked: g } };
}
function Vi(e, t) {
  const n = String(e.widgets?.find((i) => i.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Yi(e, t, n, i = null) {
  const r = Me(e);
  if (!r) return null;
  const s = xe(r.value) ?? je(), l = cn(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (r.value = Ie(l), e.setDirtyCanvas?.(!0, !0), !i || !n) return l;
  try {
    const h = await zn(i.fetcher, {
      sheet_state: l,
      upstream: Di(n),
      owned: n.owned,
      review: Vi(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!h.findings.some((M) => M.severity === "error") || !h.fingerprint) return l;
    const x = Ti(l, h.fingerprint);
    return r.value = Ie(x), e.setDirtyCanvas?.(!0, !0), x;
  } catch {
    return l;
  }
}
const fn = "PLENIO_SHEET_STATE", Pt = 68;
let Pe = null;
function Qi(e) {
  Pe = e;
}
const Xi = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const l = document.createElement("button");
  l.className = "plenio-sheet-open", l.textContent = "Edit Song Sheet…";
  const h = document.createElement("div");
  h.className = "plenio-sheet-status", r.append(l, s, h);
  let g = !1;
  const x = () => {
    const k = he(String(e.id));
    s.textContent = Ri(xe(i)) + (k ? ` · ${k.status}` : "");
    const A = lt(e);
    h.textContent = xi(A), h.dataset.state = A ?? "";
    const I = g ? null : e.widgets?.find((j) => j.name === "review");
    if (I) {
      g = !0;
      const j = I.callback;
      I.callback = (a) => {
        j?.(a), x();
      };
    }
  }, M = e.addDOMWidget(t, fn, r, {
    getValue: () => i,
    setValue: (k) => {
      i = typeof k == "string" ? k : "", x();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Pt,
    getMaxHeight: () => Pt
  });
  l.addEventListener("click", (k) => {
    k.stopPropagation(), B().catch((A) => {
      console.error("Plenio: the Song Sheet editor could not open", A), s.textContent = `The editor could not open: ${A instanceof Error ? A.message : String(A)}`;
    });
  });
  async function B() {
    const k = xe(i);
    k === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const A = he(String(e.id)), j = (e.inputs ?? []).filter((S) => S.link != null).map((S) => S.name), a = k ?? { schema: "plenio.sheet_state/1", docs: {} }, P = A?.owned ?? Bi(j, a), E = String(e.widgets?.find((S) => S.name === "review")?.value ?? "continue"), p = E === "as the brief says" ? A?.review ?? "continue" : E, { openSheetDialog: d } = await import("./open-DZzXFfgD.mjs"), { parseGuide: f, serializeGuide: m } = await import("./tracks-DxmZeggM.mjs");
    if (!Pe) throw new Error("Plenio: API not initialised");
    let _ = null;
    try {
      _ = Wi(e, A, he);
    } catch (S) {
      console.warn("Plenio: the lyrics sheet of this score was not found", S);
    }
    let y = null;
    try {
      y = Gi(e, A, he);
    } catch (S) {
      console.warn("Plenio: the score sheet of these lyrics was not found", S);
    }
    const G = Pe;
    d({
      title: e.title || "Song Sheet",
      state: a,
      payload: A,
      asrNote: vi(A?.docs.lyrics?.upstream_sha256),
      owned: P.length ? P : [...We],
      review: p,
      fetcher: Pe,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: f(e.properties?.plenio_guide),
      lyricsTarget: _?.target ?? null,
      scoreTarget: y?.target ?? null,
      onApply: (S, F, T, O) => {
        if (M.value = Ie(S), e.properties = { ...e.properties ?? {}, plenio_guide: m(F) }, T !== null && _ && !_.target.blocked && ji(_.owner, T, he(String(_.owner.id))), O && y && !y.target.blocked) {
          const z = y.owner;
          Yi(z, O.text, he(String(z.id)), O.approved ? { fetcher: G } : null);
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  const D = [
    gi((k) => {
      k === String(e.id) && x();
    }),
    ki((k) => {
      (k === null || k === e) && x();
    })
  ], $ = e.onRemoved;
  return e.onRemoved = function() {
    for (const k of D) k();
    $?.call(this);
  }, x(), { widget: M };
}, $e = "plenio.stem_mix/1", ye = "rest", Ui = ["reverb", "delay"], hn = -60, Ji = 12;
function Ki() {
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
function mn(e) {
  const t = Ki();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Zi = ["vocals", "drums", "bass", "other"];
function er() {
  return [...Zi, ye];
}
function tr(e) {
  if (typeof e != "string" || !e.trim()) return { schema: $e, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== $e || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function nr(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || mn(J(e, i))) continue;
    const r = {}, s = J(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: $e, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Fe(e, t, n) {
  const i = { ...e.strips };
  return mn(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function ir(e, t, n) {
  const i = n.some((s) => J(e, s).solo), r = J(e, t);
  return i ? r.solo : !r.mute;
}
function Ht(e) {
  return e <= hn ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function rr(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function sr(e, t, n) {
  return rr([...e, [t, n]]);
}
function or(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function ar(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function lr(e, t, n, i) {
  const r = J(e, t);
  return Fe(e, t, { ...r, muted: sr(r.muted, n, i) });
}
function cr(e, t, n) {
  const i = J(e, t), r = or(i.muted, n);
  return r < 0 ? e : Fe(e, t, { ...i, muted: ar(i.muted, r) });
}
function ur(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((l) => Math.abs(Number(l) || 0)));
  return i;
}
function dr(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function It(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : er()).filter((s) => s !== ye), r = Object.keys(e?.strips ?? {}).filter((s) => s !== ye && !i.includes(s));
  return [...i, ...r, ye];
}
const Ft = "plenio_stem_mixer", Wt = "mix", se = 200, pr = ["room", "plate", "hall"];
function L(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function Te(e, t, n, i, r) {
  const s = L("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function fr(e) {
  const t = L("div", "plenio-mix"), n = L("div", "plenio-mix-strips"), i = L("div", "plenio-mix-buses"), r = L("div", "plenio-mix-info"), s = L("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let l = {
    mix: { schema: $e, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: It(null, null),
    peaks: {},
    seconds: 0
  }, h = !1;
  const g = () => e.widgets?.find((p) => p.name === Wt);
  function x(p, { draw: d = !0 } = {}) {
    const f = g();
    if (!f) return;
    const m = nr(p);
    f.value = m, f.callback?.(m), l = { ...l, mix: p }, d && $();
  }
  function M(p, d, f = {}) {
    x(Fe(l.mix, p, { ...J(l.mix, p), ...d }), f);
  }
  function B(p, d, f, m = {}) {
    const _ = J(l.mix, p);
    let y = Fe(l.mix, p, { ..._, [d]: f });
    f > 0 && !(y[d] && Object.keys(y[d]).length) && (y = d === "reverb" ? { ...y, reverb: { preset: "room" } } : { ...y, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), x(y, m);
  }
  function D(p, d, f) {
    const m = { ...l.mix[p] ?? {} };
    x({ ...l.mix, [p]: { ...m, [d]: f } });
  }
  function $() {
    n.replaceChildren();
    const p = l.names;
    for (const d of l.names) {
      const f = J(l.mix, d), m = L("div", "plenio-mix-strip");
      m.dataset.strip = d;
      const _ = L("span", "name", d === ye ? `${d} (missed)` : d);
      _.title = d === ye ? "What the separator missed: keeps a neutral mix exact" : "";
      const y = Te(hn, Ji, 0.5, f.gain_db, `${d} gain`), G = L("span", "gain", `${Ht(f.gain_db)} dB`);
      y.addEventListener("input", () => {
        G.textContent = `${Ht(Number(y.value))} dB`, M(d, { gain_db: Number(y.value) }, { draw: !1 });
      }), y.addEventListener("change", () => M(d, { gain_db: Number(y.value) }));
      const S = L("button", f.mute ? "toggle active" : "toggle", "M");
      S.setAttribute("aria-label", `${d} mute`), S.addEventListener("click", (q) => {
        q.stopPropagation(), M(d, { mute: !f.mute });
      });
      const F = L("button", f.solo ? "toggle active" : "toggle", "S");
      F.setAttribute("aria-label", `${d} solo`), F.addEventListener("click", (q) => {
        q.stopPropagation(), M(d, { solo: !f.solo });
      });
      const T = Te(0, 1, 0.05, f.compression, `${d} compression`);
      T.title = "Compression amount: one knob for the master compressor (threshold and ratio)", T.addEventListener("input", () => M(d, { compression: Number(T.value) }, { draw: !1 })), T.addEventListener("change", () => M(d, { compression: Number(T.value) }));
      const O = Ui.map((q) => {
        const C = Te(0, 1, 0.05, f[q], `${d} ${q} send`);
        return C.title = `${q} send: how much of this stem goes to the shared ${q} bus`, C.addEventListener("input", () => B(d, q, Number(C.value), { draw: !1 })), C.addEventListener("change", () => B(d, q, Number(C.value))), C;
      }), z = L("button", f.save ? "toggle active" : "toggle", "save");
      z.setAttribute("aria-label", `${d} save as its own file`), z.setAttribute("aria-pressed", String(f.save)), z.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", z.addEventListener("click", (q) => {
        q.stopPropagation(), M(d, { save: !f.save });
      });
      const pe = ir(l.mix, d, p);
      m.classList.toggle("silent", !pe);
      const K = L("canvas", "plenio-mix-wave");
      K.width = se, K.height = 26, K.setAttribute("aria-label", `${d} waveform (drag to mute a time range)`), k(K, f, dr(l.peaks, d, se)), K.addEventListener("pointerdown", (q) => A(q, K, d)), m.append(
        _,
        y,
        G,
        S,
        F,
        L("span", "label", "comp"),
        T,
        L("span", "label", "verb"),
        O[0],
        L("span", "label", "delay"),
        O[1],
        z,
        K
      ), n.append(m);
    }
    I(), r.textContent = l.seconds ? `last run: ${l.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function k(p, d, f) {
    const m = p.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, se, p.height);
    const _ = p.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let y = 0; y < f.length; y++) {
      const G = Math.max(1, f[y] * (_ - 1));
      m.moveTo(y + 0.5, _ - G), m.lineTo(y + 0.5, _ + G);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [y, G] of d.muted) {
      const S = Math.max(0, Math.min(se, y / Math.max(l.seconds, 1e-6) * se)), F = Math.max(0, Math.min(se, G / Math.max(l.seconds, 1e-6) * se));
      m.fillRect(S, 0, Math.max(1, F - S), p.height), m.strokeRect(S + 0.5, 0.5, Math.max(1, F - S) - 1, p.height - 1);
    }
  }
  function A(p, d, f) {
    if (p.preventDefault(), p.stopPropagation(), !l.seconds) return;
    const m = d.getBoundingClientRect(), _ = (O) => Math.max(0, Math.min(1, (O - m.left) / (m.width || se))) * l.seconds, y = _(p.clientX);
    if (J(l.mix, f).muted.some(([O, z]) => O <= y && y <= z)) {
      x(cr(l.mix, f, y));
      return;
    }
    let S = y;
    const F = (O) => {
      S = _(O.clientX);
    }, T = () => {
      window.removeEventListener("pointermove", F), window.removeEventListener("pointerup", T), x(lr(l.mix, f, Math.min(y, S), Math.max(y, S)));
    };
    window.addEventListener("pointermove", F), window.addEventListener("pointerup", T);
  }
  function I() {
    i.replaceChildren();
    const p = { preset: "room", ...l.mix.reverb ?? {} }, d = { time_ms: 375, feedback: 0.35, ...l.mix.delay ?? {} }, f = L("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const y of pr) f.append(new Option(y, y));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => D("reverb", "preset", f.value));
    const m = L("input");
    m.type = "number", m.value = String(d.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => D("delay", "time_ms", Number(m.value)));
    const _ = Te(0, 0.8, 0.05, Number(d.feedback ?? 0.35), "Delay feedback");
    _.title = "Delay feedback: how much of each echo returns into the delay line", _.addEventListener("input", () => D("delay", "feedback", Number(_.value))), i.append(
      L("span", "label", "reverb bus"),
      f,
      L("span", "label", "delay bus"),
      m,
      L("span", "label", "ms, feedback"),
      _
    ), i.style.display = "flex";
  }
  const j = e.addDOMWidget(Ft, Ft, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Wt), P = L("button", "toggle", "JSON");
  P.title = "Show or hide the raw mixer value", P.addEventListener("click", (p) => {
    p.stopPropagation(), h = !h, P.classList.toggle("active", h), a && (a.plenioHidden = !h, h ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(L("span", "label", "Advanced"), P), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function E() {
    const p = tr(g()?.value);
    l = { ...l, mix: p ?? { schema: $e, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), $();
  }
  return E(), {
    showExecuted(p) {
      const d = p?.plenio_stems?.at(-1), f = ur(p), m = It(l.mix, d ?? null);
      l = { ...l, names: m, peaks: f, seconds: Number(d?.seconds ?? l.seconds) || 0 }, E();
    }
  };
}
const hr = `
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
function mr() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = hr, document.head.append(e);
}
function ct(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function it(e) {
  return ct(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function gr(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${ct(i.join(`
`))}</code></pre>`), i = null) : i.push(s);
      continue;
    }
    if (s.startsWith("```")) {
      r(), i = [];
      continue;
    }
    const l = /^(#{1,4})\s+(.*)$/.exec(s);
    if (l) {
      r();
      const g = Math.min(l[1].length + 2, 6);
      t.push(`<h${g}>${it(l[2])}</h${g}>`);
      continue;
    }
    const h = /^\s*[-*]\s+(.*)$/.exec(s);
    if (h) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${it(h[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${it(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${ct(i.join(`
`))}</code></pre>`), t.join("");
}
const rt = "plenio_summary", jt = "plenio_summary", Gt = 84, br = 18, vr = 55, yr = 16;
function wr(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / vr)), 0);
  return yr + t * br;
}
function xr(e, t) {
  const n = e.widgets?.find((s) => s.name === jt);
  if (n?.element) return n.element;
  const i = document.createElement("div");
  i.className = "plenio-summary";
  const r = e.addDOMWidget(jt, "plenio_summary", i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Gt,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(Gt, i.scrollHeight ? i.scrollHeight + 2 : wr(t.markdown))
  });
  return r.serialize = !1, i;
}
function _r(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Vt = /* @__PURE__ */ new WeakMap();
function Yt(e, t) {
  if (!t.markdown) return;
  const n = Vt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Vt.set(e, n);
  const i = xr(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = gr(t.markdown), _r(e), e.setDirtyCanvas?.(!0, !0);
}
function Sr(e) {
  e.prototype.onExecuted = ne(e.prototype.onExecuted, function(t) {
    const n = t?.[rt], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[rt] = { markdown: i.markdown, status: i.status ?? "" }, Yt(this, i));
  }), e.prototype.onConfigure = ne(e.prototype.onConfigure, function() {
    const t = this.properties?.[rt];
    t?.markdown && Yt(this, t);
  });
}
const Er = "Plenio.Core", ge = Cn;
Qi(ge);
const ut = Xt, gn = () => ut.graph;
function Qt(e) {
  if (e == null) return null;
  const t = String(e);
  return gn()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const kr = {
  scale: () => ut.canvas?.ds?.scale ?? 1,
  toast: (e, t) => ut.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
};
Xt.registerExtension({
  name: Er,
  getCustomWidgets: () => ({ [fn]: Xi }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => Ei(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Sr(e), Ci(e, kr);
    const n = ei(t.input);
    if (n.size || t.name in ft) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = mi(t, r), l = Xn(s), h = i?.call(this, s);
        return Zn(this, l, n), h;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) bi(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, di(this, ge));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Vn.has(t.name) && Yn(e, ge), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, fr(this));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && Tt(String(this.id), s);
    }));
  },
  setup() {
    mr(), ge.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Tt(String(t.node_id), t);
      const n = Qt(t.node_id);
      n && at(n, an(t));
    }), ge.addEventListener("execution_start", () => {
      Si(gn()?.nodes ?? []);
    }), ge.addEventListener("execution_error", (e) => {
      const t = Qt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && at(t, "error");
    });
  }
});
export {
  Er as E,
  Ut as P,
  Rr as a,
  qr as b,
  Lr as c,
  Tr as d,
  Cr as e,
  cn as f,
  Mr as g,
  Ie as h,
  zr as i,
  de as n,
  zn as r,
  Br as s,
  Nr as t,
  Di as u,
  Or as v,
  Ti as w
};
