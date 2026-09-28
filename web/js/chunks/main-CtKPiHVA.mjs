import { api as tn } from "../../../../scripts/api.js";
import { app as nn } from "../../../../scripts/app.js";
function te(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class qt extends Error {
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
    throw new qt(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function wi(e, t) {
  return oe(e, "/plenio/sheet/resolve", t);
}
async function _i(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Ei(e, t) {
  return oe(e, "/plenio/score/analyze", { abc: t });
}
function ki(e, t, n) {
  return oe(e, "/plenio/score/transform", { abc: t, operation: n });
}
function Si(e, t) {
  return oe(e, "/plenio/score/midi/export", t);
}
function qi(e, t) {
  return oe(e, "/plenio/score/midi/import", t);
}
function Ai(e, t) {
  return oe(e, "/plenio/lyrics/analyze", t);
}
function $i(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function it(e, t, n, i = 200) {
  return oe(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function rn(e, t) {
  return oe(e, "/plenio/brief/fields", t);
}
async function sn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new qt(`Request failed (${t.status})`);
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
], on = ["length", "vocals", "melody"], At = {
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
}, an = "custom";
function $t(e) {
  return typeof e == "string" && e.trim().toLowerCase() === an;
}
function ue(e, t) {
  const n = At[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function ln(e) {
  const t = {};
  for (const n of [..._e, ...on]) {
    const i = ue(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function rt(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!_e.includes(i.field)) continue;
    const r = ue(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function st(e) {
  const t = [];
  for (const n of _e) {
    const i = ue(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Fe(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function cn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${pn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function dn(e) {
  const t = e ? Fe(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function un(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function pn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function ot(e, t) {
  for (const n of t) {
    const i = ue(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function fn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Mt(e) {
  const t = [];
  for (const n of _e) {
    const i = ue(e, n);
    !i || !$t(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const at = "plenio_brief_template", mn = 400;
function hn(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const y = document.createElement("div");
  y.className = "line";
  const b = document.createElement("div");
  b.className = "hint";
  const _ = document.createElement("div");
  _.className = "actions", c.append(y, b, _);
  const A = (p, u, f) => {
    const m = document.createElement("button");
    return m.textContent = p, m.title = u, m.addEventListener("click", ($) => {
      $.stopPropagation(), f();
    }), _.append(m), m;
  }, M = A("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (ot(e, rt(e, n).map((p) => ({ field: p.field, value: p.value }))), R());
  }), O = A("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (ot(e, Fe(n)), R());
  }), E = A("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = st(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (fn(e, p), R());
  }), j = A("↻", "Ask again what the template fills", () => {
    X();
  }), R = () => {
    const p = cn(n, i);
    y.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", y.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const u = dn(n), f = un(n);
    b.textContent = [u, f].filter(Boolean).join(" · "), b.style.display = b.textContent ? "" : "none", _.style.display = i && n && n.template !== "none" ? "" : "none", M.disabled = !n || !rt(e, n).length, O.disabled = !n || !Fe(n).length, E.disabled = !st(e).length, j.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, V = async () => {
    const p = String(e.widgets?.find((u) => u.name === "template")?.value ?? "none");
    try {
      n = await rn(t, { fields: ln(e), template: p }), r = null;
    } catch (u) {
      n = null, r = `The template fields could not be read: ${u instanceof Error ? u.message : String(u)}`;
    }
    i = !0, R();
  };
  function X() {
    clearTimeout(s), s = setTimeout(() => {
      V();
    }, mn);
  }
  const a = e.widgets?.find((p) => p.name === "template");
  a && (a.callback = te(a.callback, () => X()));
  for (const p of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const u = ue(e, p);
    u && (u.callback = te(u.callback, () => X()));
  }
  const x = ue(e, "vocals");
  x && (x.callback = te(x.callback, () => X()));
  const P = e.addDOMWidget(at, at, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return P.serialize = !1, Mt(e), R(), X(), {
    widget: P,
    refresh: X,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const gn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function bn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, hn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), Mt(this), n.get(this)?.refresh();
  };
}
const yn = "COMFY_DYNAMICCOMBO_V3";
function vn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function xn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function wn(e, t) {
  const n = xn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function _n(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function En(e, t, n) {
  if (!t || !e.widgets || wn(e, t)) return !1;
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
    if (n.has(s.name) && !_n(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function kn(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === yn && t.add(i);
  return t;
}
const Lt = "plenio.eq/1", Ae = 8, se = 20, Sn = 2e4, ge = 12, Nt = 15, me = ["peak", "low_shelf", "high_shelf"];
function xe() {
  return { schema: Lt, preamp_db: 0, bands: [] };
}
function qn(e) {
  if (typeof e != "string" || !e.trim()) return xe();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Lt,
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
function fe(e) {
  return JSON.stringify(e);
}
const J = (e, t) => Number(e.toFixed(t));
function I(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ct(e) {
  return e.db ?? Nt;
}
const lt = [6, 12, 18], An = { 6: 8, 12: 14, 18: 20 };
function $n(e, t) {
  return { ...e, db: An[t] ?? Nt };
}
function de(e, t) {
  return Math.log(I(t, se, e.maxHz) / se) / Math.log(e.maxHz / se) * e.width;
}
function ct(e, t) {
  return se * (e.maxHz / se) ** I(t / e.width, 0, 1);
}
function re(e, t) {
  const n = Ct(e);
  return (1 - (I(t, -n, n) + n) / (2 * n)) * e.height;
}
function dt(e, t) {
  const n = Ct(e);
  return (1 - I(t / e.height, 0, 1)) * 2 * n - n;
}
function ut(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function pt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${de(e, i).toFixed(1)},${re(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function Ye(e) {
  return Math.min(Sn, 0.45 * e);
}
function Mn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Ln(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Ae) return null;
  const r = {
    id: Mn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: J(I(t, se, Ye(i)), 1),
    gain_db: J(I(n, -ge, ge), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function ye(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: J(I(n, se, Ye(r)), 1),
        gain_db: me.includes(s.type) ? J(I(i, -ge, ge), 1) : s.gain_db
      }
    )
  };
}
function Pe(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: J(I(i.q * n, 0.2, 10), 3) } : i)
  };
}
function De(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function ve(e) {
  const t = e.frequency_hz >= 1e3 ? `${J(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = me.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function Nn(e, t) {
  const n = zt[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = me.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = e.type === "peak" || e.type === "notch" ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const zt = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function pe(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: J(I(Number(s.frequency_hz ?? r.frequency_hz), se, Ye(i)), 1),
        gain_db: J(I(Number(s.gain_db ?? r.gain_db), -ge, ge), 1),
        q: J(I(Number(s.q ?? r.q), 0.2, 10), 3),
        slope: J(I(Number(s.slope ?? r.slope), 0.1, 4), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function ft(e, t) {
  return pe(e, t, { gain_db: 0 });
}
function mt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((M) => Number.isFinite(M));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), y = Math.max(s - c, 1e-6), b = e.height - 4, _ = b - Math.max(12, e.height * I(i, 0.1, 0.95));
  return `M${t.map((M, O) => {
    const E = n[O], j = Number.isFinite(E) ? (E - c) / y : 0;
    return `${de(e, M).toFixed(1)},${(b - j * (b - _)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${b.toFixed(1)} L0,${b.toFixed(1)} Z`;
}
class Cn {
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
    fe(t) !== fe(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const zn = "http://www.w3.org/2000/svg", ht = "plenio_eq_panel", ke = "mode.bands", ne = { capture: !0 }, U = { width: 560, height: 260 }, Se = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Te = null;
function Z(e, t) {
  const n = document.createElementNS(zn, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function B(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function ce(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function ee(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Bn(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function On(e, t) {
  const n = B("div", "plenio-eq"), i = B("div", "plenio-eq-tools"), r = B("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = B("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of lt) s.append(new Option(`±${o} dB`, String(o)));
  const c = ce("", "↶", "Undo the last band change"), y = ce("", "↷", "Redo the last band change"), b = ce("", "reset", "Remove every band"), _ = ce("", "compare", "Show the curve without the EQ (bypass)"), A = ce("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), M = B("span", "plenio-eq-info");
  M.setAttribute("aria-live", "polite"), M.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, c, y, b, _, A, M);
  const O = B("div", "plenio-eq-mode"), E = Z("svg", {
    viewBox: `0 0 ${U.width} ${U.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  E.setAttribute("aria-label", "EQ response curve"), E.setAttribute("tabindex", "0"), E.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const j = B("div", "plenio-eq-strip"), R = B("div", "plenio-eq-editor"), V = B("div", "plenio-eq-fields");
  R.append(V), n.append(i, O, E, j, R);
  const X = e.addDOMWidget(ht, ht, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  X.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: xe(), readonly: !0, note: "" }, x = null, P = !1, p = 12, u = null, f = [], m = 0, $, v, T = null, C = !1;
  const H = /* @__PURE__ */ new Map();
  let D = null;
  const N = new Cn(xe()), W = () => ee(e, ke), Ne = () => p, z = () => $n({ ...U, maxHz: Math.min(2e4, a.sampleRate / 2) }, Ne());
  function w(o, { record: d = !0 } = {}) {
    const l = W();
    if (!l) return;
    const g = fe(o);
    l.value = g, l.callback?.(g), d && N.push(o), a = { ...a, settings: o }, Q(), F(0);
  }
  async function F(o = 120) {
    clearTimeout($), $ = setTimeout(async () => {
      const d = String(ee(e, "mode")?.value ?? "flat");
      if (d !== "manual") {
        d === "flat" ? a = {
          ...a,
          settings: xe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : a = { ...a, readonly: !0 }, Q();
        return;
      }
      const l = qn(W()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      fe(l) !== fe(N.current) && N.reset(l);
      const g = ++m;
      try {
        const k = await it(t, l, a.sampleRate);
        if (g !== m) return;
        a = {
          ...a,
          frequencies: k.frequency_hz,
          response: k.response_db,
          settings: k.settings,
          readonly: !1,
          note: ""
        };
      } catch (k) {
        a = { ...a, readonly: !1, note: k instanceof Error ? k.message : String(k) };
      }
      Q();
    }, o);
  }
  const Je = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Ae)
  });
  function Ke() {
    if (!u) return "";
    const o = f.find((d) => d.name === u);
    return o && Bn(Je(o), a.settings) ? u : "";
  }
  function Q() {
    E.replaceChildren(), H.clear(), D = null;
    const o = z();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      E.append(
        Z("line", { x1: 0, x2: o.width, y1: re(o, l), y2: re(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      E.append(Z("line", { x1: de(o, l), x2: de(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && E.append(Z("path", { d: mt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && E.append(Z("path", { d: mt(o, a.frequencies, a.afterDb), class: "spectrum after" })), P ? E.append(Z("line", { x1: 0, x2: o.width, y1: re(o, 0), y2: re(o, 0), class: "curve flat" })) : a.frequencies.length && (D = Z("path", { d: pt(o, a.frequencies, a.response), class: "curve" }), E.append(D)), !a.readonly && !P && a.settings.bands.forEach((l, g) => {
      const k = Se[g % Se.length], S = me.includes(l.type) ? l.gain_db : 0, h = Z("circle", {
        cx: de(o, l.frequency_hz),
        cy: re(o, S),
        r: l.id === x ? 9 : 7,
        class: l.id === x ? "handle selected" : "handle",
        style: `stroke: ${k}`,
        tabindex: 0,
        "data-band": l.id
      });
      h.setAttribute("aria-label", `Band ${g + 1}: ${ve(l)}`), l.enabled || h.classList.add("disabled"), h.append(Z("title", {})), h.lastChild.textContent = `Band ${g + 1}: ${ve(l)}`, h.addEventListener("pointerdown", (L) => Vt(L, l.id)), h.addEventListener("dblclick", (L) => {
        L.stopPropagation(), w(ft(a.settings, l.id));
      }), h.addEventListener("focus", () => Wt(l.id)), h.addEventListener("keydown", (L) => Ze(L, l.id)), h.addEventListener("wheel", (L) => {
        L.preventDefault();
        const ae = L.deltaY < 0 ? 1.15 : 1 / 1.15;
        w(Pe(a.settings, l.id, ae));
      }), h.addEventListener("contextmenu", (L) => {
        L.preventDefault(), w(De(a.settings, l.id));
      }), E.append(h), H.set(l.id, h);
    }), Ht(), It(), jt();
    const d = a.settings.bands.find((l) => l.id === x);
    M.textContent = a.note || (P ? "compare: the curve is off (the node still applies it)" : d ? ve(d) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Ae}`), r.disabled = a.readonly, c.disabled = !N.canUndo, y.disabled = !N.canRedo, b.disabled = a.readonly || !a.settings.bands.length, C && (C = !1, x && H.get(x)?.focus({ preventScroll: !0 })), s.value = String(p), r.value = Ke(), _.classList.toggle("active", P), A.classList.toggle("active", ze()), e.setDirtyCanvas?.(!0, !0);
  }
  function Ht() {
    if (j.replaceChildren(), a.readonly && !a.settings.bands.length) {
      j.append(B("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, d) => {
      const l = B("button", "plenio-eq-chip", Nn(o, d));
      l.style.borderLeftColor = Se[d % Se.length], l.classList.toggle("selected", o.id === x), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${d + 1}`), l.title = `Band ${d + 1}: ${ve(o)} - click to open its fields`, l.addEventListener("click", (g) => {
        g.stopPropagation(), x = x === o.id ? null : o.id, Q();
      }), j.append(l);
    });
  }
  function It() {
    V.replaceChildren();
    const o = a.settings.bands.find((h) => h.id === x);
    if (!o || a.readonly) {
      R.style.display = "none";
      return;
    }
    R.style.display = "";
    const d = B("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    d.title = "The selected band";
    const l = B("select");
    l.setAttribute("aria-label", "Band type"), l.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [h, L] of Object.entries(zt)) l.append(new Option(L, h));
    l.value = o.type, l.addEventListener("change", () => w(pe(a.settings, o.id, { type: l.value })));
    const g = B("input");
    g.type = "checkbox", g.checked = o.enabled, g.setAttribute("aria-label", "Band enabled"), g.title = "Band enabled: off keeps the band in the list but out of the response", g.addEventListener("change", () => w(pe(a.settings, o.id, { enabled: g.checked })));
    const k = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (h) => w(pe(a.settings, o.id, { frequency_hz: Number(h) }))
      ],
      ["dB", `${o.gain_db}`, 60, (h) => w(pe(a.settings, o.id, { gain_db: Number(h) }))],
      ["Q", `${o.q}`, 60, (h) => w(pe(a.settings, o.id, { q: Number(h) }))]
    ];
    V.append(d, l, g);
    for (const [h, L, ae, be] of k) {
      const G = B("input", "number");
      G.value = L, G.style.width = `${ae}px`, G.setAttribute("aria-label", `Band ${h}`), G.title = h === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : h === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range", G.addEventListener("keydown", (Re) => {
        Re.key === "Enter" && be(G.value);
      }), G.addEventListener("blur", () => be(G.value)), h !== "Hz" && !me.includes(o.type) && (G.disabled = !0), V.append(G);
    }
    const S = ce("", "remove", "Remove this band");
    S.addEventListener("click", (h) => {
      h.stopPropagation(), x = null, w(De(a.settings, o.id));
    }), V.append(S);
  }
  function jt() {
    O.replaceChildren();
    const o = String(ee(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      B("span", "plenio-eq-hint", `applied proposal (${a.settings.bands.length} band(s), ${o})`)
    );
    const d = ce("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    d.disabled = !a.settings.bands.length, d.addEventListener("click", (l) => {
      l.stopPropagation();
      const g = ee(e, "mode");
      if (!g) return;
      g.value = "manual", g.callback?.("manual");
      const k = W();
      if (k) {
        const S = fe(a.settings);
        k.value = S, k.callback?.(S);
      }
      N.reset(a.settings), Oe(), F(0);
    }), O.append(d);
  }
  function Wt(o) {
    x = o, C = !0, Q();
  }
  function Ft(o) {
    x = o, Ce();
  }
  function Ce() {
    const o = z();
    a.settings.bands.forEach((l) => {
      const g = H.get(l.id);
      if (!g) return;
      const k = me.includes(l.type) ? l.gain_db : 0;
      g.setAttribute("cx", String(de(o, l.frequency_hz))), g.setAttribute("cy", String(re(o, k))), g.classList.toggle("selected", l.id === x), g.setAttribute("r", l.id === x ? "9" : "7");
    }), D && a.frequencies.length && D.setAttribute("d", pt(o, a.frequencies, a.response));
    const d = a.settings.bands.find((l) => l.id === x);
    d && (M.textContent = ve(d));
  }
  function Gt() {
    clearTimeout(v), v = setTimeout(async () => {
      const o = a.settings, d = ++m;
      try {
        const l = await it(t, o, a.sampleRate);
        if (d !== m) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Ce();
      } catch {
      }
    }, 60);
  }
  function ze() {
    return !ee(e, ke)?.plenioHidden;
  }
  function Be(o) {
    const d = ee(e, ke);
    d && (d.plenioHidden = !o, o ? delete d.computeSize : d.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Vt(o, d) {
    o.preventDefault(), o.stopPropagation(), x !== d && Ft(d);
    const l = a.settings.bands.find((Y) => Y.id === d);
    if (!l) return;
    T = { hz: l.frequency_hz, db: l.gain_db };
    let g = !1, k = !1;
    const S = o.currentTarget;
    try {
      S?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const h = E.getBoundingClientRect(), L = h.width ? h.left : 0, ae = h.height ? h.top : 0, be = h.width || U.width, G = h.height || U.height, Re = (Y, Ee) => Y >= L - 1 && Y <= L + be + 1 && Ee >= ae - 1 && Ee <= ae + G + 1;
    function le() {
      if (!k) {
        k = !0;
        try {
          S?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", nt, ne), window.removeEventListener("pointerup", le, ne), window.removeEventListener("pointercancel", le, ne), window.removeEventListener("blur", le, ne), T = null, g && w(a.settings);
      }
    }
    const nt = (Y) => {
      if (k || !T) return;
      if (Y.buttons === 0) {
        le();
        return;
      }
      if (!Re(Y.clientX, Y.clientY)) return;
      const Ee = U.width / be, Yt = U.height / G, Qt = (Y.clientX - L) * Ee, Ut = (Y.clientY - ae) * Yt, Jt = de(z(), T.hz), Kt = re(z(), T.db), Zt = ct(z(), ut(Jt, Qt, Y.shiftKey)), en = dt(z(), ut(Kt, Ut, Y.shiftKey));
      a = { ...a, settings: ye(a.settings, d, Zt, en, a.sampleRate) }, g = !0, Ce(), Gt();
    };
    window.addEventListener("pointermove", nt, ne), window.addEventListener("pointerup", le, ne), window.addEventListener("pointercancel", le, ne), window.addEventListener("blur", le, ne);
  }
  function Ze(o, d) {
    const l = a.settings.bands.find((h) => h.id === d);
    if (!l) return;
    const g = o.shiftKey ? 0.1 : 0.5, k = o.shiftKey ? 1.01 : 1.06;
    let S = null;
    o.key === "ArrowUp" ? S = ye(a.settings, d, l.frequency_hz, l.gain_db + g, a.sampleRate) : o.key === "ArrowDown" ? S = ye(a.settings, d, l.frequency_hz, l.gain_db - g, a.sampleRate) : o.key === "ArrowRight" ? S = ye(a.settings, d, l.frequency_hz * k, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? S = ye(a.settings, d, l.frequency_hz / k, l.gain_db, a.sampleRate) : o.key === "+" ? S = Pe(a.settings, d, 1.15) : o.key === "-" ? S = Pe(a.settings, d, 1 / 1.15) : o.key === "0" ? S = ft(a.settings, d) : (o.key === "Delete" || o.key === "Backspace") && (S = De(a.settings, d)), S && (o.preventDefault(), w(S));
  }
  E.addEventListener("keydown", (o) => {
    x && o.target === E && Ze(o, x);
  }), E.addEventListener("dblclick", (o) => {
    if (a.readonly || P) return;
    const d = E.getBoundingClientRect(), l = U.width / (d.width || U.width), g = U.height / (d.height || U.height), k = (o.clientX - d.left) * l, S = (o.clientY - d.top) * g, h = Ln(a.settings, ct(z(), k), dt(z(), S), a.sampleRate);
    h ? (x = h.bands[h.bands.length - 1].id, w(h)) : (a = { ...a, note: `the EQ has at most ${Ae} bands` }, Q());
  }), r.append(new Option("preset…", "")), Te ??= sn(t).then((o) => o.manual).catch(() => []), Te.then((o) => {
    f = o;
    for (const d of o) r.append(new Option(d.name, d.name));
    r.value = Ke();
  }), r.addEventListener("change", async () => {
    const o = (await Te)?.find((d) => d.name === r.value);
    o && (u = o.name, w(Je(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    p = lt.find((d) => d === o) ?? 12, Q();
  }), c.addEventListener("click", () => {
    const o = N.undo();
    o && w(o, { record: !1 });
  }), y.addEventListener("click", () => {
    const o = N.redo();
    o && w(o, { record: !1 });
  }), b.addEventListener("click", () => {
    x = null, w(xe());
  }), _.addEventListener("click", () => {
    P = !P, Q();
  }), A.addEventListener("click", () => {
    Be(!ze()), Q();
  });
  function Oe() {
    for (const o of ["mode", ke]) {
      const d = ee(e, o);
      if (!d || d.plenioWatched) continue;
      d.plenioWatched = !0;
      const l = d.callback;
      d.callback = (g) => {
        l?.(g), setTimeout(() => {
          ze() || Be(!1), F();
        });
      };
    }
  }
  Oe(), Be(!1), F(0);
  let et = null, tt = null;
  const Xt = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(Xt);
      return;
    }
    const o = String(ee(e, "mode")?.value ?? "flat"), d = String(W()?.value ?? "");
    o === et && d === tt || (et = o, tt = d, Oe(), F(0));
  }, 700);
  return {
    showExecuted(o) {
      const d = o?.plenio_eq, l = d?.[d.length - 1];
      if (!l) return;
      const g = String(ee(e, "mode")?.value ?? "flat") === "manual";
      a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !g,
        note: g ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, g ? F(0) : Q();
    }
  };
}
const Qe = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Rn = new Set(_e.map((e) => At[e]));
function Pn(e, t) {
  return !(e in Qe) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => Rn.has(n) && $t(i)).map(([n]) => n);
}
function Dn(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function Tn(e, t) {
  const n = Qe[e.name];
  if (!n || !t) return t;
  const i = Dn(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const y = Pn(e.name, c.widgets_values_named);
  if (y.length) {
    const b = { ...c.widgets_values_named };
    for (const _ of y) b[_] = "";
    c = { ...c, widgets_values_named: b };
  }
  return c;
}
const Bt = /* @__PURE__ */ new Map(), Ge = /* @__PURE__ */ new Set();
function gt(e, t) {
  Bt.set(e, t);
  for (const n of Ge) n(e);
}
function bt(e) {
  return Bt.get(e) ?? null;
}
function Hn(e) {
  return Ge.add(e), () => Ge.delete(e);
}
const Ot = /* @__PURE__ */ new Map();
function In(e) {
  e?.draft_sha256 && Ot.set(e.draft_sha256, e);
}
function jn(e) {
  return e ? Ot.get(e) ?? null : null;
}
const Ue = "plenio.sheet_state/1", Le = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Rt() {
  return { schema: Ue, docs: {} };
}
function yt(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Rt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ue || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Wn(e) {
  const t = {};
  for (const i of Le) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: Ue, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function He(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Fn(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Le.filter((i) => He(e, i) !== "auto").map(
    (i) => i === "lyrics" && He(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${He(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function vt(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function Mi(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: vt(r?.[0] ?? 0), end: vt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function Ie(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Gn(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Li(e, t, n) {
  return n.map((i) => ({ kind: i, text: Gn(e, t, i), intent: "keep" }));
}
function Ni(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], y = t?.docs[s.kind], b = Ie(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: b };
    else if (s.intent === "rebase")
      y?.upstream_sha256 ? i[s.kind] = { state: "edited", text: b, base_sha256: y.upstream_sha256 } : i[s.kind] = { state: "manual", text: b };
    else if (c)
      Ie(c.text) !== b && (i[s.kind] = { ...c, text: b });
    else {
      const _ = Ie(y?.upstream ?? "");
      if (b === _) continue;
      i[s.kind] = y?.upstream_sha256 ? { state: "edited", text: b, base_sha256: y.upstream_sha256 } : { state: "manual", text: b };
    }
  }
  const r = { ...Rt(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Ci(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Vn(e, t) {
  return Le.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function zi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Pt = "PLENIO_SHEET_STATE";
let Ve = null;
function Xn(e) {
  Ve = e;
}
const Yn = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…", r.append(c, s);
  const y = () => {
    const _ = bt(String(e.id)), A = _ ? ` · ${_.status}` : "";
    s.textContent = Fn(yt(i)) + A;
  }, b = e.addDOMWidget(t, Pt, r, {
    getValue: () => i,
    setValue: (_) => {
      i = typeof _ == "string" ? _ : "", y();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return c.addEventListener("click", async (_) => {
    _.stopPropagation();
    const A = yt(i);
    A === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const M = bt(String(e.id)), E = (e.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), j = A ?? { schema: "plenio.sheet_state/1", docs: {} }, R = M?.owned ?? Vn(E, j), V = String(e.widgets?.find((p) => p.name === "review")?.value ?? "continue"), X = V === "as the brief says" ? M?.review ?? "continue" : V, { openSheetDialog: a } = await import("./open-D5Klr3Fp.mjs"), { parseGuide: x, serializeGuide: P } = await import("./tracks-DEywwRcM.mjs");
    if (!Ve) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: j,
      payload: M,
      asrNote: jn(M?.docs.lyrics?.upstream_sha256),
      owned: R.length ? R : [...Le],
      review: X,
      fetcher: Ve,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: x(e.properties?.plenio_guide),
      onApply: (p, u) => {
        b.value = Wn(p), e.properties = { ...e.properties ?? {}, plenio_guide: P(u) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Hn((_) => {
    _ === String(e.id) && y();
  }), y(), { widget: b };
}, we = "plenio.stem_mix/1", he = "rest", Qn = ["reverb", "delay"], Dt = -60, Un = 12;
function Jn() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function K(e, t) {
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
function Tt(e) {
  const t = Jn();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Kn = ["vocals", "drums", "bass", "other"];
function Zn() {
  return [...Kn, he];
}
function ei(e) {
  if (typeof e != "string" || !e.trim()) return { schema: we, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== we || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function ti(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || Tt(K(e, i))) continue;
    const r = {}, s = K(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: we, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Me(e, t, n) {
  const i = { ...e.strips };
  return Tt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function ni(e, t, n) {
  const i = n.some((s) => K(e, s).solo), r = K(e, t);
  return i ? r.solo : !r.mute;
}
function xt(e) {
  return e <= Dt ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function ii(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function ri(e, t, n) {
  return ii([...e, [t, n]]);
}
function si(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function oi(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function ai(e, t, n, i) {
  const r = K(e, t);
  return Me(e, t, { ...r, muted: ri(r.muted, n, i) });
}
function li(e, t, n) {
  const i = K(e, t), r = si(i.muted, n);
  return r < 0 ? e : Me(e, t, { ...i, muted: oi(i.muted, r) });
}
function ci(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function di(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function wt(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Zn()).filter((s) => s !== he), r = Object.keys(e?.strips ?? {}).filter((s) => s !== he && !i.includes(s));
  return [...i, ...r, he];
}
const _t = "plenio_stem_mixer", Et = "mix", ie = 200, ui = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function qe(e, t, n, i, r) {
  const s = q("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function pi(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), r = q("div", "plenio-mix-info"), s = q("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: we, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: wt(null, null),
    peaks: {},
    seconds: 0
  }, y = !1;
  const b = () => e.widgets?.find((p) => p.name === Et);
  function _(p, { draw: u = !0 } = {}) {
    const f = b();
    if (!f) return;
    const m = ti(p);
    f.value = m, f.callback?.(m), c = { ...c, mix: p }, u && E();
  }
  function A(p, u, f = {}) {
    _(Me(c.mix, p, { ...K(c.mix, p), ...u }), f);
  }
  function M(p, u, f, m = {}) {
    const $ = K(c.mix, p);
    let v = Me(c.mix, p, { ...$, [u]: f });
    f > 0 && !(v[u] && Object.keys(v[u]).length) && (v = u === "reverb" ? { ...v, reverb: { preset: "room" } } : { ...v, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), _(v, m);
  }
  function O(p, u, f) {
    const m = { ...c.mix[p] ?? {} };
    _({ ...c.mix, [p]: { ...m, [u]: f } });
  }
  function E() {
    n.replaceChildren();
    const p = c.names;
    for (const u of c.names) {
      const f = K(c.mix, u), m = q("div", "plenio-mix-strip");
      m.dataset.strip = u;
      const $ = q("span", "name", u === he ? `${u} (missed)` : u);
      $.title = u === he ? "What the separator missed: keeps a neutral mix exact" : "";
      const v = qe(Dt, Un, 0.5, f.gain_db, `${u} gain`), T = q("span", "gain", `${xt(f.gain_db)} dB`);
      v.addEventListener("input", () => {
        T.textContent = `${xt(Number(v.value))} dB`, A(u, { gain_db: Number(v.value) }, { draw: !1 });
      }), v.addEventListener("change", () => A(u, { gain_db: Number(v.value) }));
      const C = q("button", f.mute ? "toggle active" : "toggle", "M");
      C.setAttribute("aria-label", `${u} mute`), C.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { mute: !f.mute });
      });
      const H = q("button", f.solo ? "toggle active" : "toggle", "S");
      H.setAttribute("aria-label", `${u} solo`), H.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { solo: !f.solo });
      });
      const D = qe(0, 1, 0.05, f.compression, `${u} compression`);
      D.title = "Compression amount: one knob for the master compressor (threshold and ratio)", D.addEventListener("input", () => A(u, { compression: Number(D.value) }, { draw: !1 })), D.addEventListener("change", () => A(u, { compression: Number(D.value) }));
      const N = Qn.map((w) => {
        const F = qe(0, 1, 0.05, f[w], `${u} ${w} send`);
        return F.title = `${w} send: how much of this stem goes to the shared ${w} bus`, F.addEventListener("input", () => M(u, w, Number(F.value), { draw: !1 })), F.addEventListener("change", () => M(u, w, Number(F.value))), F;
      }), W = q("button", f.save ? "toggle active" : "toggle", "save");
      W.setAttribute("aria-label", `${u} save as its own file`), W.setAttribute("aria-pressed", String(f.save)), W.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", W.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { save: !f.save });
      });
      const Ne = ni(c.mix, u, p);
      m.classList.toggle("silent", !Ne);
      const z = q("canvas", "plenio-mix-wave");
      z.width = ie, z.height = 26, z.setAttribute("aria-label", `${u} waveform (drag to mute a time range)`), j(z, f, di(c.peaks, u, ie)), z.addEventListener("pointerdown", (w) => R(w, z, u)), m.append(
        $,
        v,
        T,
        C,
        H,
        q("span", "label", "comp"),
        D,
        q("span", "label", "verb"),
        N[0],
        q("span", "label", "delay"),
        N[1],
        W,
        z
      ), n.append(m);
    }
    V(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
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
    if (K(c.mix, f).muted.some(([N, W]) => N <= v && v <= W)) {
      _(li(c.mix, f, v));
      return;
    }
    let C = v;
    const H = (N) => {
      C = $(N.clientX);
    }, D = () => {
      window.removeEventListener("pointermove", H), window.removeEventListener("pointerup", D), _(ai(c.mix, f, Math.min(v, C), Math.max(v, C)));
    };
    window.addEventListener("pointermove", H), window.addEventListener("pointerup", D);
  }
  function V() {
    i.replaceChildren();
    const p = { preset: "room", ...c.mix.reverb ?? {} }, u = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = q("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const v of ui) f.append(new Option(v, v));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => O("reverb", "preset", f.value));
    const m = q("input");
    m.type = "number", m.value = String(u.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => O("delay", "time_ms", Number(m.value)));
    const $ = qe(0, 0.8, 0.05, Number(u.feedback ?? 0.35), "Delay feedback");
    $.title = "Delay feedback: how much of each echo returns into the delay line", $.addEventListener("input", () => O("delay", "feedback", Number($.value))), i.append(
      q("span", "label", "reverb bus"),
      f,
      q("span", "label", "delay bus"),
      m,
      q("span", "label", "ms, feedback"),
      $
    ), i.style.display = "flex";
  }
  const X = e.addDOMWidget(_t, _t, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  X.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Et), x = q("button", "toggle", "JSON");
  x.title = "Show or hide the raw mixer value", x.addEventListener("click", (p) => {
    p.stopPropagation(), y = !y, x.classList.toggle("active", y), a && (a.plenioHidden = !y, y ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(q("span", "label", "Advanced"), x), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function P() {
    const p = ei(b()?.value);
    c = { ...c, mix: p ?? { schema: we, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), E();
  }
  return P(), {
    showExecuted(p) {
      const u = p?.plenio_stems?.at(-1), f = ci(p), m = wt(c.mix, u ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(u?.seconds ?? c.seconds) || 0 }, P();
    }
  };
}
const fi = `
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
function mi() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = fi, document.head.append(e);
}
function Xe(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function je(e) {
  return Xe(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function hi(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${Xe(i.join(`
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
      t.push(`<h${b}>${je(c[2])}</h${b}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(s);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${je(y[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${je(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${Xe(i.join(`
`))}</code></pre>`), t.join("");
}
const We = "plenio_summary", kt = "plenio_summary";
function gi(e) {
  const t = e.widgets?.find((r) => r.name === kt);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(kt, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function St(e, t) {
  if (!t.markdown) return;
  const n = gi(e);
  n.dataset.status = t.status ?? "", n.innerHTML = hi(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function bi(e) {
  e.prototype.onExecuted = te(e.prototype.onExecuted, function(t) {
    const n = t?.[We], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[We] = { markdown: i.markdown, status: i.status ?? "" }, St(this, i));
  }), e.prototype.onConfigure = te(e.prototype.onConfigure, function() {
    const t = this.properties?.[We];
    t?.markdown && St(this, t);
  });
}
const yi = "Plenio.Core", $e = tn;
Xn($e);
nn.registerExtension({
  name: yi,
  getCustomWidgets: () => ({ [Pt]: Yn }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    bi(e);
    const n = kn(t.input);
    if (n.size || t.name in Qe) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = Tn(t, r), c = vn(s), y = i?.call(this, s);
        return En(this, c, n), y;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = te(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) In(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, On(this, $e));
      }, e.prototype.onExecuted = te(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (gn.has(t.name) && bn(e, $e), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, pi(this));
      }, e.prototype.onExecuted = te(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = te(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && gt(String(this.id), s);
    }));
  },
  setup() {
    mi(), $e.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && gt(String(t.node_id), t);
    });
  }
});
export {
  yi as E,
  qt as P,
  Ai as a,
  Ei as b,
  Mi as c,
  Wn as d,
  Si as e,
  Ie as f,
  _i as g,
  qi as i,
  Ni as n,
  wi as r,
  Li as s,
  ki as t,
  zi as u,
  $i as v,
  Ci as w
};
