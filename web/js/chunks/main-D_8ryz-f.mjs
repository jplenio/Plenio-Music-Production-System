import { api as yt } from "../../../../scripts/api.js";
import { app as bt } from "../../../../scripts/app.js";
function F(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Xe extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function I(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await i.json();
  if (!i.ok) {
    const a = r?.error ?? {};
    throw new Xe(a.message ?? `Request failed (${i.status})`, a.hint ?? null);
  }
  return r;
}
function wn(e, t) {
  return I(e, "/plenio/sheet/resolve", t);
}
async function xn(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function _n(e, t) {
  return I(e, "/plenio/score/analyze", { abc: t });
}
function En(e, t, n) {
  return I(e, "/plenio/score/transform", { abc: t, operation: n });
}
function kn(e, t) {
  return I(e, "/plenio/score/midi/export", t);
}
function qn(e, t) {
  return I(e, "/plenio/score/midi/import", t);
}
function Sn(e, t) {
  return I(e, "/plenio/lyrics/analyze", t);
}
function $n(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function vt(e, t, n, i = 200) {
  return I(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function wt(e, t) {
  return I(e, "/plenio/brief/fields", t);
}
async function xt(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Xe(`Request failed (${t.status})`);
  return await t.json();
}
const re = [
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
], _t = ["length", "vocals", "melody"], Je = {
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
}, Et = "custom";
function Ke(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Et;
}
function U(e, t) {
  const n = Je[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function kt(e) {
  const t = {};
  for (const n of [...re, ..._t]) {
    const i = U(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function Me(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!re.includes(i.field)) continue;
    const r = U(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function Oe(e) {
  const t = [];
  for (const n of re) {
    const i = U(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function ke(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function qt(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${At(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function St(e) {
  const t = e ? ke(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function $t(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function At(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Be(e, t) {
  for (const n of t) {
    const i = U(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function zt(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Ze(e) {
  const t = [];
  for (const n of re) {
    const i = U(e, n);
    !i || !Ke(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Pe = "plenio_brief_template", Nt = 400;
function Lt(e, t) {
  let n = null, i = !1, r = null, a;
  const u = document.createElement("div");
  u.className = "plenio-brief-template";
  const h = document.createElement("div");
  h.className = "line";
  const f = document.createElement("div");
  f.className = "hint";
  const m = document.createElement("div");
  m.className = "actions", u.append(h, f, m);
  const q = (g, w, Q) => {
    const R = document.createElement("button");
    return R.textContent = g, R.title = w, R.addEventListener("click", (D) => {
      D.stopPropagation(), Q();
    }), m.append(R), R;
  }, S = q("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Be(e, Me(e, n).map((g) => ({ field: g.field, value: g.value }))), A());
  }), L = q("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Be(e, ke(n)), A());
  }), v = q("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const g = Oe(e);
    g.length && window.confirm(`Clear ${g.length} text field(s)? The template's values apply again.`) && (zt(e, g), A());
  }), C = q("↻", "Ask again what the template fills", () => {
    P();
  }), A = () => {
    const g = qt(n, i);
    h.textContent = r ?? g ?? "The template fills nothing: every text field has your value.", h.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const w = St(n), Q = $t(n);
    f.textContent = [w, Q].filter(Boolean).join(" · "), f.style.display = f.textContent ? "" : "none", m.style.display = i && n && n.template !== "none" ? "" : "none", S.disabled = !n || !Me(e, n).length, L.disabled = !n || !ke(n).length, v.disabled = !Oe(e).length, C.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, B = async () => {
    const g = String(e.widgets?.find((w) => w.name === "template")?.value ?? "none");
    try {
      n = await wt(t, { fields: kt(e), template: g }), r = null;
    } catch (w) {
      n = null, r = `The template fields could not be read: ${w instanceof Error ? w.message : String(w)}`;
    }
    i = !0, A();
  };
  function P() {
    clearTimeout(a), a = setTimeout(() => {
      B();
    }, Nt);
  }
  const s = e.widgets?.find((g) => g.name === "template");
  s && (s.callback = F(s.callback, () => P()));
  for (const g of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const w = U(e, g);
    w && (w.callback = F(w.callback, () => P()));
  }
  const x = U(e, "vocals");
  x && (x.callback = F(x.callback, () => P()));
  const z = e.addDOMWidget(Pe, Pe, u, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return z.serialize = !1, Ze(e), A(), P(), {
    widget: z,
    refresh: P,
    answer: () => n,
    dispose: () => clearTimeout(a)
  };
}
const Ct = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Mt(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Lt(this, t));
  };
  const a = i.onConfigure;
  i.onConfigure = function(u) {
    a?.call(this, u), Ze(this), n.get(this)?.refresh();
  };
}
const Ot = "COMFY_DYNAMICCOMBO_V3";
function Bt(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Pt(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Rt(e, t) {
  const n = Pt(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Dt(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Tt(e, t, n) {
  if (!t || !e.widgets || Rt(e, t)) return !1;
  let i = 0;
  for (let r = 0; r < e.widgets.length; r++) {
    const a = e.widgets[r];
    if (a.serialize === !1) continue;
    let u;
    if (Array.isArray(t)) {
      if (i >= t.length) break;
      u = t[i++];
    } else if (a.name in t)
      u = t[a.name];
    else
      continue;
    if (n.has(a.name) && !Dt(a, u)) return !0;
    a.value !== u && (a.value = u);
  }
  return !0;
}
function Ht(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === Ot && t.add(i);
  return t;
}
const et = "plenio.eq/1", ce = 8, W = 20, jt = 2e4, Z = 12, tt = 15, oe = ["peak", "low_shelf", "high_shelf"];
function ie() {
  return { schema: et, preamp_db: 0, bands: [] };
}
function Ft(e) {
  if (typeof e != "string" || !e.trim()) return ie();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: et,
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
function J(e) {
  return JSON.stringify(e);
}
const T = (e, t) => Number(e.toFixed(t));
function $(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function nt(e) {
  return e.db ?? tt;
}
const Re = [6, 12, 18], Wt = { 6: 8, 12: 14, 18: 20 };
function It(e, t) {
  return { ...e, db: Wt[t] ?? tt };
}
function K(e, t) {
  return Math.log($(t, W, e.maxHz) / W) / Math.log(e.maxHz / W) * e.width;
}
function De(e, t) {
  return W * (e.maxHz / W) ** $(t / e.width, 0, 1);
}
function Y(e, t) {
  const n = nt(e);
  return (1 - ($(t, -n, n) + n) / (2 * n)) * e.height;
}
function Te(e, t) {
  const n = nt(e);
  return (1 - $(t / e.height, 0, 1)) * 2 * n - n;
}
function He(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Gt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${K(e, i).toFixed(1)},${Y(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function Ae(e) {
  return Math.min(jt, 0.45 * e);
}
function Vt(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Yt(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= ce) return null;
  const r = {
    id: Vt(e),
    enabled: !0,
    type: "peak",
    frequency_hz: T($(t, W, Ae(i)), 1),
    gain_db: T($(n, -Z, Z), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function ne(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (a) => a.id !== t ? a : {
        ...a,
        frequency_hz: T($(n, W, Ae(r)), 1),
        gain_db: oe.includes(a.type) ? T($(i, -Z, Z), 1) : a.gain_db
      }
    )
  };
}
function me(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: T($(i.q * n, 0.2, 10), 3) } : i)
  };
}
function ye(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function be(e) {
  const t = e.frequency_hz >= 1e3 ? `${T(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = oe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function Ut(e, t) {
  const n = it[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = oe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", a = e.type === "peak" || e.type === "notch" ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${a}${e.enabled ? "" : " (off)"}`;
}
const it = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function X(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const a = { ...r, ...n };
      return {
        ...a,
        frequency_hz: T($(Number(a.frequency_hz ?? r.frequency_hz), W, Ae(i)), 1),
        gain_db: T($(Number(a.gain_db ?? r.gain_db), -Z, Z), 1),
        q: T($(Number(a.q ?? r.q), 0.2, 10), 3),
        slope: T($(Number(a.slope ?? r.slope), 0.1, 4), 2),
        enabled: a.enabled !== !1
      };
    })
  };
}
function je(e, t) {
  return X(e, t, { gain_db: 0 });
}
function Fe(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((S) => Number.isFinite(S));
  if (!r.length) return "";
  const a = Math.max(...r), u = Math.min(...r), h = Math.max(a - u, 1e-6), f = e.height - 4, m = f - Math.max(12, e.height * $(i, 0.1, 0.95));
  return `M${t.map((S, L) => {
    const v = n[L], C = Number.isFinite(v) ? (v - u) / h : 0;
    return `${K(e, S).toFixed(1)},${(f - C * (f - m)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${f.toFixed(1)} L0,${f.toFixed(1)} Z`;
}
class Qt {
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
    J(t) !== J(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Xt = "http://www.w3.org/2000/svg", We = "plenio_eq_panel", ae = "mode.bands", O = { width: 560, height: 260 }, le = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let ve = null;
function H(e, t) {
  const n = document.createElementNS(Xt, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function k(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function V(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i;
}
function j(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Jt(e, t) {
  const n = k("div", "plenio-eq"), i = k("div", "plenio-eq-tools"), r = k("select");
  r.setAttribute("aria-label", "EQ preset");
  const a = k("select");
  a.setAttribute("aria-label", "Gain range");
  for (const o of Re) a.append(new Option(`±${o} dB`, String(o)));
  const u = V("", "↶", "Undo the last band change"), h = V("", "↷", "Redo the last band change"), f = V("", "reset", "Remove every band"), m = V("", "compare", "Show the curve without the EQ (bypass)"), q = V("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), S = k("span", "plenio-eq-info");
  S.setAttribute("aria-live", "polite"), i.append(r, a, u, h, f, m, q, S);
  const L = k("div", "plenio-eq-mode"), v = H("svg", {
    viewBox: `0 0 ${O.width} ${O.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  v.setAttribute("aria-label", "EQ response curve");
  const C = k("div", "plenio-eq-strip"), A = k("div", "plenio-eq-editor"), B = k("div", "plenio-eq-fields");
  A.append(B), n.append(i, L, v, C, A);
  const P = e.addDOMWidget(We, We, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  P.serialize = !1;
  let s = { sampleRate: 48e3, frequencies: [], response: [], settings: ie(), readonly: !0, note: "" }, x = null, z = !1, g = 12, w = 0, Q, R = null;
  const D = new Qt(ie()), pe = () => j(e, ae), lt = () => g, G = () => It({ ...O, maxHz: Math.min(2e4, s.sampleRate / 2) }, lt());
  function _(o, { record: c = !0 } = {}) {
    const l = pe();
    if (!l) return;
    const p = J(o);
    l.value = p, l.callback?.(p), c && D.push(o), s = { ...s, settings: o }, N(), ee(0);
  }
  async function ee(o = 120) {
    clearTimeout(Q), Q = setTimeout(async () => {
      const c = String(j(e, "mode")?.value ?? "flat");
      if (c !== "manual") {
        c === "flat" ? s = {
          ...s,
          settings: ie(),
          response: s.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : s = { ...s, readonly: !0 }, N();
        return;
      }
      const l = Ft(pe()?.value);
      if (!l) {
        s = { ...s, readonly: !0, note: "the bands are not valid JSON" }, N();
        return;
      }
      J(l) !== J(D.current) && D.reset(l);
      const p = ++w;
      try {
        const y = await vt(t, l, s.sampleRate);
        if (p !== w) return;
        s = {
          ...s,
          frequencies: y.frequency_hz,
          response: y.response_db,
          settings: y.settings,
          readonly: !1,
          note: ""
        };
      } catch (y) {
        s = { ...s, readonly: !1, note: y instanceof Error ? y.message : String(y) };
      }
      N();
    }, o);
  }
  function N() {
    v.replaceChildren();
    const o = G();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      v.append(
        H("line", { x1: 0, x2: o.width, y1: Y(o, l), y2: Y(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      v.append(H("line", { x1: K(o, l), x2: K(o, l), y1: 0, y2: o.height, class: "grid" }));
    s.beforeDb?.length === s.frequencies.length && v.append(H("path", { d: Fe(o, s.frequencies, s.beforeDb), class: "spectrum before" })), s.afterDb?.length === s.frequencies.length && v.append(H("path", { d: Fe(o, s.frequencies, s.afterDb), class: "spectrum after" })), z ? v.append(H("line", { x1: 0, x2: o.width, y1: Y(o, 0), y2: Y(o, 0), class: "curve flat" })) : s.frequencies.length && v.append(H("path", { d: Gt(o, s.frequencies, s.response), class: "curve" })), !s.readonly && !z && s.settings.bands.forEach((l, p) => {
      const y = le[p % le.length], b = oe.includes(l.type) ? l.gain_db : 0, d = H("circle", {
        cx: K(o, l.frequency_hz),
        cy: Y(o, b),
        r: l.id === x ? 9 : 7,
        class: l.id === x ? "handle selected" : "handle",
        style: `stroke: ${y}`,
        tabindex: 0,
        "data-band": l.id
      });
      d.setAttribute("aria-label", `Band ${p + 1}: ${be(l)}`), l.enabled || d.classList.add("disabled"), d.append(H("title", {})), d.lastChild.textContent = `Band ${p + 1}: ${be(l)}`, d.addEventListener("pointerdown", (E) => pt(E, l.id)), d.addEventListener("dblclick", (E) => {
        E.stopPropagation(), _(je(s.settings, l.id));
      }), d.addEventListener("focus", () => Le(l.id)), d.addEventListener("keydown", (E) => ft(E, l.id)), d.addEventListener("wheel", (E) => {
        E.preventDefault();
        const te = E.deltaY < 0 ? 1.15 : 1 / 1.15;
        _(me(s.settings, l.id, te));
      }), d.addEventListener("contextmenu", (E) => {
        E.preventDefault(), _(ye(s.settings, l.id));
      }), v.append(d);
    }), ct(), ut(), dt();
    const c = s.settings.bands.find((l) => l.id === x);
    S.textContent = s.note || (z ? "compare: the curve is off (the node still applies it)" : c ? be(c) : s.readonly ? `${s.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${s.settings.bands.length}/${ce}`), r.disabled = s.readonly, u.disabled = !D.canUndo, h.disabled = !D.canRedo, f.disabled = s.readonly || !s.settings.bands.length, a.value = String(g), m.classList.toggle("active", z), q.classList.toggle("active", fe()), e.setDirtyCanvas?.(!0, !0);
  }
  function ct() {
    if (C.replaceChildren(), s.readonly && !s.settings.bands.length) {
      C.append(k("span", "plenio-eq-hint", s.note || "no bands"));
      return;
    }
    s.settings.bands.forEach((o, c) => {
      const l = k("button", "plenio-eq-chip", Ut(o, c));
      l.style.borderLeftColor = le[c % le.length], l.classList.toggle("selected", o.id === x), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${c + 1}`), l.addEventListener("click", (p) => {
        p.stopPropagation(), x = x === o.id ? null : o.id, N();
      }), C.append(l);
    });
  }
  function ut() {
    B.replaceChildren();
    const o = s.settings.bands.find((d) => d.id === x);
    if (!o || s.readonly) {
      A.style.display = "none";
      return;
    }
    A.style.display = "";
    const c = k("span", "name", `Band ${s.settings.bands.indexOf(o) + 1}`), l = k("select");
    l.setAttribute("aria-label", "Band type");
    for (const [d, E] of Object.entries(it)) l.append(new Option(E, d));
    l.value = o.type, l.addEventListener("change", () => _(X(s.settings, o.id, { type: l.value })));
    const p = k("input");
    p.type = "checkbox", p.checked = o.enabled, p.setAttribute("aria-label", "Band enabled"), p.addEventListener("change", () => _(X(s.settings, o.id, { enabled: p.checked })));
    const y = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (d) => _(X(s.settings, o.id, { frequency_hz: Number(d) }))
      ],
      ["dB", `${o.gain_db}`, 60, (d) => _(X(s.settings, o.id, { gain_db: Number(d) }))],
      ["Q", `${o.q}`, 60, (d) => _(X(s.settings, o.id, { q: Number(d) }))]
    ];
    B.append(c, l, p);
    for (const [d, E, te, se] of y) {
      const M = k("input", "number");
      M.value = E, M.style.width = `${te}px`, M.setAttribute("aria-label", `Band ${d}`), M.addEventListener("keydown", (ge) => {
        ge.key === "Enter" && se(M.value);
      }), M.addEventListener("blur", () => se(M.value)), d !== "Hz" && !oe.includes(o.type) && (M.disabled = !0), B.append(M);
    }
    const b = V("", "remove", "Remove this band");
    b.addEventListener("click", (d) => {
      d.stopPropagation(), x = null, _(ye(s.settings, o.id));
    }), B.append(b);
  }
  function dt() {
    L.replaceChildren();
    const o = String(j(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      L.style.display = "none";
      return;
    }
    L.style.display = "", L.append(
      k("span", "plenio-eq-hint", `applied proposal (${s.settings.bands.length} band(s), ${o})`)
    );
    const c = V("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    c.disabled = !s.settings.bands.length, c.addEventListener("click", (l) => {
      l.stopPropagation();
      const p = j(e, "mode");
      if (!p) return;
      p.value = "manual", p.callback?.("manual");
      const y = pe();
      if (y) {
        const b = J(s.settings);
        y.value = b, y.callback?.(b);
      }
      D.reset(s.settings), Ce(), ee(0);
    }), L.append(c);
  }
  function Le(o) {
    x = o, N();
  }
  function fe() {
    return !j(e, ae)?.plenioHidden;
  }
  function he(o) {
    const c = j(e, ae);
    c && (c.plenioHidden = !o, o ? delete c.computeSize : c.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function pt(o, c) {
    o.preventDefault(), o.stopPropagation(), Le(c);
    const l = s.settings.bands.find((d) => d.id === c);
    if (!l) return;
    R = { hz: l.frequency_hz, db: l.gain_db };
    const p = v.getBoundingClientRect(), y = (d) => {
      const E = O.width / (p.width || O.width), te = O.height / (p.height || O.height), se = (d.clientX - p.left) * E, M = (d.clientY - p.top) * te, ge = K(G(), R.hz), ht = Y(G(), R.db), gt = De(G(), He(ge, se, d.shiftKey)), mt = Te(G(), He(ht, M, d.shiftKey));
      s = { ...s, settings: ne(s.settings, c, gt, mt, s.sampleRate) }, N();
    }, b = () => {
      window.removeEventListener("pointermove", y), window.removeEventListener("pointerup", b), R = null, _(s.settings);
    };
    window.addEventListener("pointermove", y), window.addEventListener("pointerup", b);
  }
  function ft(o, c) {
    const l = s.settings.bands.find((d) => d.id === c);
    if (!l) return;
    const p = o.shiftKey ? 0.1 : 0.5, y = o.shiftKey ? 1.01 : 1.06;
    let b = null;
    o.key === "ArrowUp" ? b = ne(s.settings, c, l.frequency_hz, l.gain_db + p, s.sampleRate) : o.key === "ArrowDown" ? b = ne(s.settings, c, l.frequency_hz, l.gain_db - p, s.sampleRate) : o.key === "ArrowRight" ? b = ne(s.settings, c, l.frequency_hz * y, l.gain_db, s.sampleRate) : o.key === "ArrowLeft" ? b = ne(s.settings, c, l.frequency_hz / y, l.gain_db, s.sampleRate) : o.key === "+" ? b = me(s.settings, c, 1.15) : o.key === "-" ? b = me(s.settings, c, 1 / 1.15) : o.key === "0" ? b = je(s.settings, c) : (o.key === "Delete" || o.key === "Backspace") && (b = ye(s.settings, c)), b && (o.preventDefault(), _(b));
  }
  v.addEventListener("dblclick", (o) => {
    if (s.readonly || z) return;
    const c = v.getBoundingClientRect(), l = O.width / (c.width || O.width), p = O.height / (c.height || O.height), y = (o.clientX - c.left) * l, b = (o.clientY - c.top) * p, d = Yt(s.settings, De(G(), y), Te(G(), b), s.sampleRate);
    d ? (x = d.bands[d.bands.length - 1].id, _(d)) : (s = { ...s, note: `the EQ has at most ${ce} bands` }, N());
  }), r.append(new Option("preset…", "")), ve ??= xt(t).then((o) => o.manual).catch(() => []), ve.then((o) => {
    for (const c of o) r.append(new Option(c.name, c.name));
  }), r.addEventListener("change", async () => {
    const o = (await ve)?.find((c) => c.name === r.value);
    r.value = "", o && _({ ...o.settings, bands: o.settings.bands.slice(0, ce) });
  }), a.addEventListener("change", () => {
    const o = Number(a.value);
    g = Re.find((c) => c === o) ?? 12, N();
  }), u.addEventListener("click", () => {
    const o = D.undo();
    o && _(o, { record: !1 });
  }), h.addEventListener("click", () => {
    const o = D.redo();
    o && _(o, { record: !1 });
  }), f.addEventListener("click", () => {
    x = null, _(ie());
  }), m.addEventListener("click", () => {
    z = !z, N();
  }), q.addEventListener("click", () => {
    he(!fe()), N();
  });
  function Ce() {
    for (const o of ["mode", ae]) {
      const c = j(e, o);
      if (!c || c.plenioWatched) continue;
      c.plenioWatched = !0;
      const l = c.callback;
      c.callback = (p) => {
        l?.(p), setTimeout(() => {
          fe() || he(!1), ee();
        });
      };
    }
  }
  return Ce(), he(!1), ee(0), {
    showExecuted(o) {
      const c = o?.plenio_eq, l = c?.[c.length - 1];
      if (!l) return;
      const p = String(j(e, "mode")?.value ?? "flat") === "manual";
      s = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !p,
        note: p ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, p ? ee(0) : N();
    }
  };
}
const ze = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Kt = new Set(re.map((e) => Je[e]));
function Zt(e, t) {
  return !(e in ze) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => Kt.has(n) && Ke(i)).map(([n]) => n);
}
function en(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function tn(e, t) {
  const n = ze[e.name];
  if (!n || !t) return t;
  const i = en(e, "mode"), r = t.widgets_values, a = t.widgets_values_named;
  let u = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (u = { ...u, widgets_values: [n, ...r] }), a && typeof a == "object" && !Array.isArray(a) && !("mode" in a) && (u = { ...u, widgets_values_named: { mode: n, ...a } });
  const h = Zt(e.name, u.widgets_values_named);
  if (h.length) {
    const f = { ...u.widgets_values_named };
    for (const m of h) f[m] = "";
    u = { ...u, widgets_values_named: f };
  }
  return u;
}
const ot = /* @__PURE__ */ new Map(), qe = /* @__PURE__ */ new Set();
function Ie(e, t) {
  ot.set(e, t);
  for (const n of qe) n(e);
}
function Ge(e) {
  return ot.get(e) ?? null;
}
function nn(e) {
  return qe.add(e), () => qe.delete(e);
}
const rt = /* @__PURE__ */ new Map();
function on(e) {
  e?.draft_sha256 && rt.set(e.draft_sha256, e);
}
function rn(e) {
  return e ? rt.get(e) ?? null : null;
}
const Ne = "plenio.sheet_state/1", de = ["title", "style", "lyrics", "score", "artwork_prompt"];
function st() {
  return { schema: Ne, docs: {} };
}
function Ve(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return st();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ne || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function sn(e) {
  const t = {};
  for (const i of de) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: Ne, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function we(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function an(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = de.filter((i) => we(e, i) !== "auto").map(
    (i) => i === "lyrics" && we(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${we(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Ye(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function An(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], a = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Ye(r?.[0] ?? 0), end: Ye(a?.[1] ?? e.duration_s) };
  }) : [];
}
function xe(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function ln(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function zn(e, t, n) {
  return n.map((i) => ({ kind: i, text: ln(e, t, i), intent: "keep" }));
}
function Nn(e, t, n) {
  const i = { ...e.docs };
  for (const a of n) {
    const u = e.docs[a.kind], h = t?.docs[a.kind], f = xe(a.text);
    if (a.intent === "auto")
      delete i[a.kind];
    else if (a.intent === "manual")
      i[a.kind] = { state: "manual", text: f };
    else if (a.intent === "rebase")
      h?.upstream_sha256 ? i[a.kind] = { state: "edited", text: f, base_sha256: h.upstream_sha256 } : i[a.kind] = { state: "manual", text: f };
    else if (u)
      xe(u.text) !== f && (i[a.kind] = { ...u, text: f });
    else {
      const m = xe(h?.upstream ?? "");
      if (f === m) continue;
      i[a.kind] = h?.upstream_sha256 ? { state: "edited", text: f, base_sha256: h.upstream_sha256 } : { state: "manual", text: f };
    }
  }
  const r = { ...st(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Ln(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function cn(e, t) {
  return de.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Cn(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const at = "PLENIO_SHEET_STATE";
let Se = null;
function un(e) {
  Se = e;
}
const dn = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const a = document.createElement("span");
  a.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", r.append(u, a);
  const h = () => {
    const m = Ge(String(e.id)), q = m ? ` · ${m.status}` : "";
    a.textContent = an(Ve(i)) + q;
  }, f = e.addDOMWidget(t, at, r, {
    getValue: () => i,
    setValue: (m) => {
      i = typeof m == "string" ? m : "", h();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (m) => {
    m.stopPropagation();
    const q = Ve(i);
    q === null && (a.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const S = Ge(String(e.id)), v = (e.inputs ?? []).filter((g) => g.link != null).map((g) => g.name), C = q ?? { schema: "plenio.sheet_state/1", docs: {} }, A = S?.owned ?? cn(v, C), B = String(e.widgets?.find((g) => g.name === "review")?.value ?? "continue"), P = B === "as the brief says" ? S?.review ?? "continue" : B, { openSheetDialog: s } = await import("./open-_lYJCX8v.mjs"), { parseGuide: x, serializeGuide: z } = await import("./tracks-DEywwRcM.mjs");
    if (!Se) throw new Error("Plenio: API not initialised");
    s({
      title: e.title || "Song Sheet",
      state: C,
      payload: S,
      asrNote: rn(S?.docs.lyrics?.upstream_sha256),
      owned: A.length ? A : [...de],
      review: P,
      fetcher: Se,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: x(e.properties?.plenio_guide),
      onApply: (g, w) => {
        f.value = sn(g), e.properties = { ...e.properties ?? {}, plenio_guide: z(w) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), nn((m) => {
    m === String(e.id) && h();
  }), h(), { widget: f };
}, pn = `
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
`;
function fn() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = pn, document.head.append(e);
}
function $e(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function _e(e) {
  return $e(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function hn(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${$e(i.join(`
`))}</code></pre>`), i = null) : i.push(a);
      continue;
    }
    if (a.startsWith("```")) {
      r(), i = [];
      continue;
    }
    const u = /^(#{1,4})\s+(.*)$/.exec(a);
    if (u) {
      r();
      const f = Math.min(u[1].length + 2, 6);
      t.push(`<h${f}>${_e(u[2])}</h${f}>`);
      continue;
    }
    const h = /^\s*[-*]\s+(.*)$/.exec(a);
    if (h) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${_e(h[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${_e(a)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${$e(i.join(`
`))}</code></pre>`), t.join("");
}
const Ee = "plenio_summary", Ue = "plenio_summary";
function gn(e) {
  const t = e.widgets?.find((r) => r.name === Ue);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(Ue, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function Qe(e, t) {
  if (!t.markdown) return;
  const n = gn(e);
  n.dataset.status = t.status ?? "", n.innerHTML = hn(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function mn(e) {
  e.prototype.onExecuted = F(e.prototype.onExecuted, function(t) {
    const n = t?.[Ee], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Ee] = { markdown: i.markdown, status: i.status ?? "" }, Qe(this, i));
  }), e.prototype.onConfigure = F(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ee];
    t?.markdown && Qe(this, t);
  });
}
const yn = "Plenio.Core", ue = yt;
un(ue);
bt.registerExtension({
  name: yn,
  getCustomWidgets: () => ({ [at]: dn }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    mn(e);
    const n = Ht(t.input);
    if (n.size || t.name in ze) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const a = tn(t, r), u = Bt(a), h = i?.call(this, a);
        return Tt(this, u, n), h;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = F(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) on(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, Jt(this, ue));
      }, e.prototype.onExecuted = F(e.prototype.onExecuted, function(a) {
        i.get(this)?.showExecuted(a);
      });
    }
    Ct.has(t.name) && Mt(e, ue), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = F(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, a = r?.[r.length - 1];
      a && Ie(String(this.id), a);
    }));
  },
  setup() {
    fn(), ue.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && Ie(String(t.node_id), t);
    });
  }
});
export {
  yn as E,
  Xe as P,
  Sn as a,
  _n as b,
  An as c,
  sn as d,
  kn as e,
  xe as f,
  xn as g,
  qn as i,
  Nn as n,
  wn as r,
  zn as s,
  En as t,
  Cn as u,
  $n as v,
  Ln as w
};
