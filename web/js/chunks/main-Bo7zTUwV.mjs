import { api as Xt } from "../../../../scripts/api.js";
import { app as Qt } from "../../../../scripts/app.js";
function ee(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class wt extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function se(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), s = await i.json();
  if (!i.ok) {
    const r = s?.error ?? {};
    throw new wt(r.message ?? `Request failed (${i.status})`, r.hint ?? null);
  }
  return s;
}
function fi(e, t) {
  return se(e, "/plenio/sheet/resolve", t);
}
async function mi(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function hi(e, t) {
  return se(e, "/plenio/score/analyze", { abc: t });
}
function gi(e, t, n) {
  return se(e, "/plenio/score/transform", { abc: t, operation: n });
}
function bi(e, t) {
  return se(e, "/plenio/score/midi/export", t);
}
function yi(e, t) {
  return se(e, "/plenio/score/midi/import", t);
}
function vi(e, t) {
  return se(e, "/plenio/lyrics/analyze", t);
}
function xi(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function Ke(e, t, n, i = 200) {
  return se(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function Yt(e, t) {
  return se(e, "/plenio/brief/fields", t);
}
async function Ut(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new wt(`Request failed (${t.status})`);
  return await t.json();
}
const ye = [
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
], Jt = ["length", "vocals", "melody"], _t = {
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
}, Kt = "custom";
function Et(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Kt;
}
function ae(e, t) {
  const n = _t[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Zt(e) {
  const t = {};
  for (const n of [...ye, ...Jt]) {
    const i = ae(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function Ze(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!ye.includes(i.field)) continue;
    const s = ae(e, i.field);
    s && !String(s.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function et(e) {
  const t = [];
  for (const n of ye) {
    const i = ae(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function He(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function en(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${sn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function tn(e) {
  const t = e ? He(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function nn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function sn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function tt(e, t) {
  for (const n of t) {
    const i = ae(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function rn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function kt(e) {
  const t = [];
  for (const n of ye) {
    const i = ae(e, n);
    !i || !Et(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const nt = "plenio_brief_template", on = 400;
function an(e, t) {
  let n = null, i = !1, s = null, r;
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
  }, N = A("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (tt(e, Ze(e, n).map((p) => ({ field: p.field, value: p.value }))), R());
  }), O = A("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (tt(e, He(n)), R());
  }), E = A("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = et(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (rn(e, p), R());
  }), I = A("↻", "Ask again what the template fills", () => {
    V();
  }), R = () => {
    const p = en(n, i);
    y.textContent = s ?? p ?? "The template fills nothing: every text field has your value.", y.dataset.state = s ? "error" : i && n ? "ok" : "empty";
    const u = tn(n), f = nn(n);
    b.textContent = [u, f].filter(Boolean).join(" · "), b.style.display = b.textContent ? "" : "none", _.style.display = i && n && n.template !== "none" ? "" : "none", N.disabled = !n || !Ze(e, n).length, O.disabled = !n || !He(n).length, E.disabled = !et(e).length, I.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, G = async () => {
    const p = String(e.widgets?.find((u) => u.name === "template")?.value ?? "none");
    try {
      n = await Yt(t, { fields: Zt(e), template: p }), s = null;
    } catch (u) {
      n = null, s = `The template fields could not be read: ${u instanceof Error ? u.message : String(u)}`;
    }
    i = !0, R();
  };
  function V() {
    clearTimeout(r), r = setTimeout(() => {
      G();
    }, on);
  }
  const a = e.widgets?.find((p) => p.name === "template");
  a && (a.callback = ee(a.callback, () => V()));
  for (const p of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const u = ae(e, p);
    u && (u.callback = ee(u.callback, () => V()));
  }
  const x = ae(e, "vocals");
  x && (x.callback = ee(x.callback, () => V()));
  const P = e.addDOMWidget(nt, nt, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return P.serialize = !1, kt(e), R(), V(), {
    widget: P,
    refresh: V,
    answer: () => n,
    dispose: () => clearTimeout(r)
  };
}
const ln = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function cn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, s = i.onNodeCreated;
  i.onNodeCreated = function() {
    s?.call(this), n.set(this, an(this, t));
  };
  const r = i.onConfigure;
  i.onConfigure = function(c) {
    r?.call(this, c), kt(this), n.get(this)?.refresh();
  };
}
const dn = "COMFY_DYNAMICCOMBO_V3";
function un(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function pn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function fn(e, t) {
  const n = pn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, s) => i.value === t[s]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function mn(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function hn(e, t, n) {
  if (!t || !e.widgets || fn(e, t)) return !1;
  let i = 0;
  for (let s = 0; s < e.widgets.length; s++) {
    const r = e.widgets[s];
    if (r.serialize === !1) continue;
    let c;
    if (Array.isArray(t)) {
      if (i >= t.length) break;
      c = t[i++];
    } else if (r.name in t)
      c = t[r.name];
    else
      continue;
    if (n.has(r.name) && !mn(r, c)) return !0;
    r.value !== c && (r.value = c);
  }
  return !0;
}
function gn(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === dn && t.add(i);
  return t;
}
const St = "plenio.eq/1", Ee = 8, ie = 20, bn = 2e4, pe = 12, qt = 15, de = ["peak", "low_shelf", "high_shelf"];
function ge() {
  return { schema: St, preamp_db: 0, bands: [] };
}
function yn(e) {
  if (typeof e != "string" || !e.trim()) return ge();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: St,
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
function ce(e) {
  return JSON.stringify(e);
}
const U = (e, t) => Number(e.toFixed(t));
function H(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function At(e) {
  return e.db ?? qt;
}
const it = [6, 12, 18], vn = { 6: 8, 12: 14, 18: 20 };
function xn(e, t) {
  return { ...e, db: vn[t] ?? qt };
}
function oe(e, t) {
  return Math.log(H(t, ie, e.maxHz) / ie) / Math.log(e.maxHz / ie) * e.width;
}
function st(e, t) {
  return ie * (e.maxHz / ie) ** H(t / e.width, 0, 1);
}
function ne(e, t) {
  const n = At(e);
  return (1 - (H(t, -n, n) + n) / (2 * n)) * e.height;
}
function rt(e, t) {
  const n = At(e);
  return (1 - H(t / e.height, 0, 1)) * 2 * n - n;
}
function ot(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function at(e, t, n) {
  return t.map((i, s) => `${s ? "L" : "M"}${oe(e, i).toFixed(1)},${ne(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function Fe(e) {
  return Math.min(bn, 0.45 * e);
}
function wn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function _n(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Ee) return null;
  const s = {
    id: wn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(H(t, ie, Fe(i)), 1),
    gain_db: U(H(n, -pe, pe), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function me(e, t, n, i, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: U(H(n, ie, Fe(s)), 1),
        gain_db: de.includes(r.type) ? U(H(i, -pe, pe), 1) : r.gain_db
      }
    )
  };
}
function ze(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(H(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Be(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function he(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = de.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function En(e, t) {
  const n = $t[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = de.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = e.type === "peak" || e.type === "notch" ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const $t = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function le(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: U(H(Number(r.frequency_hz ?? s.frequency_hz), ie, Fe(i)), 1),
        gain_db: U(H(Number(r.gain_db ?? s.gain_db), -pe, pe), 1),
        q: U(H(Number(r.q ?? s.q), 0.2, 10), 3),
        slope: U(H(Number(r.slope ?? s.slope), 0.1, 4), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function lt(e, t) {
  return le(e, t, { gain_db: 0 });
}
function ct(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((N) => Number.isFinite(N));
  if (!s.length) return "";
  const r = Math.max(...s), c = Math.min(...s), y = Math.max(r - c, 1e-6), b = e.height - 4, _ = b - Math.max(12, e.height * H(i, 0.1, 0.95));
  return `M${t.map((N, O) => {
    const E = n[O], I = Number.isFinite(E) ? (E - c) / y : 0;
    return `${oe(e, N).toFixed(1)},${(b - I * (b - _)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${b.toFixed(1)} L0,${b.toFixed(1)} Z`;
}
class kn {
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
    ce(t) !== ce(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Sn = "http://www.w3.org/2000/svg", dt = "plenio_eq_panel", xe = "mode.bands", Y = { width: 560, height: 260 }, we = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Oe = null;
function K(e, t) {
  const n = document.createElementNS(Sn, e);
  for (const [i, s] of Object.entries(t)) n.setAttribute(i, String(s));
  return n;
}
function B(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function re(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function Z(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function qn(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const s = t.bands[i];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function An(e, t) {
  const n = B("div", "plenio-eq"), i = B("div", "plenio-eq-tools"), s = B("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = B("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of it) r.append(new Option(`±${o} dB`, String(o)));
  const c = re("", "↶", "Undo the last band change"), y = re("", "↷", "Redo the last band change"), b = re("", "reset", "Remove every band"), _ = re("", "compare", "Show the curve without the EQ (bypass)"), A = re("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), N = B("span", "plenio-eq-info");
  N.setAttribute("aria-live", "polite"), N.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(s, r, c, y, b, _, A, N);
  const O = B("div", "plenio-eq-mode"), E = K("svg", {
    viewBox: `0 0 ${Y.width} ${Y.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  E.setAttribute("aria-label", "EQ response curve"), E.setAttribute("tabindex", "0"), E.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const I = B("div", "plenio-eq-strip"), R = B("div", "plenio-eq-editor"), G = B("div", "plenio-eq-fields");
  R.append(G), n.append(i, O, E, I, R);
  const V = e.addDOMWidget(dt, dt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: ge(), readonly: !0, note: "" }, x = null, P = !1, p = 12, u = null, f = [], m = 0, $, v, j = null, C = !1;
  const T = /* @__PURE__ */ new Map();
  let D = null;
  const L = new kn(ge()), W = () => Z(e, xe), Ae = () => p, z = () => xn({ ...Y, maxHz: Math.min(2e4, a.sampleRate / 2) }, Ae());
  function w(o, { record: d = !0 } = {}) {
    const l = W();
    if (!l) return;
    const h = ce(o);
    l.value = h, l.callback?.(h), d && L.push(o), a = { ...a, settings: o }, Q(), F(0);
  }
  async function F(o = 120) {
    clearTimeout($), $ = setTimeout(async () => {
      const d = String(Z(e, "mode")?.value ?? "flat");
      if (d !== "manual") {
        d === "flat" ? a = {
          ...a,
          settings: ge(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : a = { ...a, readonly: !0 }, Q();
        return;
      }
      const l = yn(W()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      ce(l) !== ce(L.current) && L.reset(l);
      const h = ++m;
      try {
        const k = await Ke(t, l, a.sampleRate);
        if (h !== m) return;
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
  const Xe = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Ee)
  });
  function Qe() {
    if (!u) return "";
    const o = f.find((d) => d.name === u);
    return o && qn(Xe(o), a.settings) ? u : "";
  }
  function Q() {
    E.replaceChildren(), T.clear(), D = null;
    const o = z();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      E.append(
        K("line", { x1: 0, x2: o.width, y1: ne(o, l), y2: ne(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      E.append(K("line", { x1: oe(o, l), x2: oe(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && E.append(K("path", { d: ct(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && E.append(K("path", { d: ct(o, a.frequencies, a.afterDb), class: "spectrum after" })), P ? E.append(K("line", { x1: 0, x2: o.width, y1: ne(o, 0), y2: ne(o, 0), class: "curve flat" })) : a.frequencies.length && (D = K("path", { d: at(o, a.frequencies, a.response), class: "curve" }), E.append(D)), !a.readonly && !P && a.settings.bands.forEach((l, h) => {
      const k = we[h % we.length], S = de.includes(l.type) ? l.gain_db : 0, g = K("circle", {
        cx: oe(o, l.frequency_hz),
        cy: ne(o, S),
        r: l.id === x ? 9 : 7,
        class: l.id === x ? "handle selected" : "handle",
        style: `stroke: ${k}`,
        tabindex: 0,
        "data-band": l.id
      });
      g.setAttribute("aria-label", `Band ${h + 1}: ${he(l)}`), l.enabled || g.classList.add("disabled"), g.append(K("title", {})), g.lastChild.textContent = `Band ${h + 1}: ${he(l)}`, g.addEventListener("pointerdown", (M) => It(M, l.id)), g.addEventListener("dblclick", (M) => {
        M.stopPropagation(), w(lt(a.settings, l.id));
      }), g.addEventListener("focus", () => Dt(l.id)), g.addEventListener("keydown", (M) => Ye(M, l.id)), g.addEventListener("wheel", (M) => {
        M.preventDefault();
        const fe = M.deltaY < 0 ? 1.15 : 1 / 1.15;
        w(ze(a.settings, l.id, fe));
      }), g.addEventListener("contextmenu", (M) => {
        M.preventDefault(), w(Be(a.settings, l.id));
      }), E.append(g), T.set(l.id, g);
    }), Ot(), Rt(), Pt();
    const d = a.settings.bands.find((l) => l.id === x);
    N.textContent = a.note || (P ? "compare: the curve is off (the node still applies it)" : d ? he(d) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Ee}`), s.disabled = a.readonly, c.disabled = !L.canUndo, y.disabled = !L.canRedo, b.disabled = a.readonly || !a.settings.bands.length, C && (C = !1, x && T.get(x)?.focus({ preventScroll: !0 })), r.value = String(p), s.value = Qe(), _.classList.toggle("active", P), A.classList.toggle("active", Me()), e.setDirtyCanvas?.(!0, !0);
  }
  function Ot() {
    if (I.replaceChildren(), a.readonly && !a.settings.bands.length) {
      I.append(B("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, d) => {
      const l = B("button", "plenio-eq-chip", En(o, d));
      l.style.borderLeftColor = we[d % we.length], l.classList.toggle("selected", o.id === x), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${d + 1}`), l.title = `Band ${d + 1}: ${he(o)} - click to open its fields`, l.addEventListener("click", (h) => {
        h.stopPropagation(), x = x === o.id ? null : o.id, Q();
      }), I.append(l);
    });
  }
  function Rt() {
    G.replaceChildren();
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
    for (const [g, M] of Object.entries($t)) l.append(new Option(M, g));
    l.value = o.type, l.addEventListener("change", () => w(le(a.settings, o.id, { type: l.value })));
    const h = B("input");
    h.type = "checkbox", h.checked = o.enabled, h.setAttribute("aria-label", "Band enabled"), h.title = "Band enabled: off keeps the band in the list but out of the response", h.addEventListener("change", () => w(le(a.settings, o.id, { enabled: h.checked })));
    const k = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (g) => w(le(a.settings, o.id, { frequency_hz: Number(g) }))
      ],
      ["dB", `${o.gain_db}`, 60, (g) => w(le(a.settings, o.id, { gain_db: Number(g) }))],
      ["Q", `${o.q}`, 60, (g) => w(le(a.settings, o.id, { q: Number(g) }))]
    ];
    G.append(d, l, h);
    for (const [g, M, fe, ve] of k) {
      const X = B("input", "number");
      X.value = M, X.style.width = `${fe}px`, X.setAttribute("aria-label", `Band ${g}`), X.title = g === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : g === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range", X.addEventListener("keydown", (Ce) => {
        Ce.key === "Enter" && ve(X.value);
      }), X.addEventListener("blur", () => ve(X.value)), g !== "Hz" && !de.includes(o.type) && (X.disabled = !0), G.append(X);
    }
    const S = re("", "remove", "Remove this band");
    S.addEventListener("click", (g) => {
      g.stopPropagation(), x = null, w(Be(a.settings, o.id));
    }), G.append(S);
  }
  function Pt() {
    O.replaceChildren();
    const o = String(Z(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      B("span", "plenio-eq-hint", `applied proposal (${a.settings.bands.length} band(s), ${o})`)
    );
    const d = re("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    d.disabled = !a.settings.bands.length, d.addEventListener("click", (l) => {
      l.stopPropagation();
      const h = Z(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const k = W();
      if (k) {
        const S = ce(a.settings);
        k.value = S, k.callback?.(S);
      }
      L.reset(a.settings), Le(), F(0);
    }), O.append(d);
  }
  function Dt(o) {
    x = o, C = !0, Q();
  }
  function Tt(o) {
    x = o, $e();
  }
  function $e() {
    const o = z();
    a.settings.bands.forEach((l) => {
      const h = T.get(l.id);
      if (!h) return;
      const k = de.includes(l.type) ? l.gain_db : 0;
      h.setAttribute("cx", String(oe(o, l.frequency_hz))), h.setAttribute("cy", String(ne(o, k))), h.classList.toggle("selected", l.id === x), h.setAttribute("r", l.id === x ? "9" : "7");
    }), D && a.frequencies.length && D.setAttribute("d", at(o, a.frequencies, a.response));
    const d = a.settings.bands.find((l) => l.id === x);
    d && (N.textContent = he(d));
  }
  function Ht() {
    clearTimeout(v), v = setTimeout(async () => {
      const o = a.settings, d = ++m;
      try {
        const l = await Ke(t, o, a.sampleRate);
        if (d !== m) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, $e();
      } catch {
      }
    }, 60);
  }
  function Me() {
    return !Z(e, xe)?.plenioHidden;
  }
  function Ne(o) {
    const d = Z(e, xe);
    d && (d.plenioHidden = !o, o ? delete d.computeSize : d.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function It(o, d) {
    o.preventDefault(), o.stopPropagation(), x !== d && Tt(d);
    const l = a.settings.bands.find((M) => M.id === d);
    if (!l) return;
    j = { hz: l.frequency_hz, db: l.gain_db };
    const h = o.currentTarget;
    try {
      h?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const k = E.getBoundingClientRect(), S = (M) => {
      const fe = Y.width / (k.width || Y.width), ve = Y.height / (k.height || Y.height), X = (M.clientX - k.left) * fe, Ce = (M.clientY - k.top) * ve, Wt = oe(z(), j.hz), Ft = ne(z(), j.db), Gt = st(z(), ot(Wt, X, M.shiftKey)), Vt = rt(z(), ot(Ft, Ce, M.shiftKey));
      a = { ...a, settings: me(a.settings, d, Gt, Vt, a.sampleRate) }, $e(), Ht();
    }, g = () => {
      try {
        h?.releasePointerCapture?.(o.pointerId);
      } catch {
      }
      window.removeEventListener("pointermove", S), window.removeEventListener("pointerup", g), j = null, w(a.settings);
    };
    window.addEventListener("pointermove", S), window.addEventListener("pointerup", g);
  }
  function Ye(o, d) {
    const l = a.settings.bands.find((g) => g.id === d);
    if (!l) return;
    const h = o.shiftKey ? 0.1 : 0.5, k = o.shiftKey ? 1.01 : 1.06;
    let S = null;
    o.key === "ArrowUp" ? S = me(a.settings, d, l.frequency_hz, l.gain_db + h, a.sampleRate) : o.key === "ArrowDown" ? S = me(a.settings, d, l.frequency_hz, l.gain_db - h, a.sampleRate) : o.key === "ArrowRight" ? S = me(a.settings, d, l.frequency_hz * k, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? S = me(a.settings, d, l.frequency_hz / k, l.gain_db, a.sampleRate) : o.key === "+" ? S = ze(a.settings, d, 1.15) : o.key === "-" ? S = ze(a.settings, d, 1 / 1.15) : o.key === "0" ? S = lt(a.settings, d) : (o.key === "Delete" || o.key === "Backspace") && (S = Be(a.settings, d)), S && (o.preventDefault(), w(S));
  }
  E.addEventListener("keydown", (o) => {
    x && o.target === E && Ye(o, x);
  }), E.addEventListener("dblclick", (o) => {
    if (a.readonly || P) return;
    const d = E.getBoundingClientRect(), l = Y.width / (d.width || Y.width), h = Y.height / (d.height || Y.height), k = (o.clientX - d.left) * l, S = (o.clientY - d.top) * h, g = _n(a.settings, st(z(), k), rt(z(), S), a.sampleRate);
    g ? (x = g.bands[g.bands.length - 1].id, w(g)) : (a = { ...a, note: `the EQ has at most ${Ee} bands` }, Q());
  }), s.append(new Option("preset…", "")), Oe ??= Ut(t).then((o) => o.manual).catch(() => []), Oe.then((o) => {
    f = o;
    for (const d of o) s.append(new Option(d.name, d.name));
    s.value = Qe();
  }), s.addEventListener("change", async () => {
    const o = (await Oe)?.find((d) => d.name === s.value);
    o && (u = o.name, w(Xe(o)));
  }), r.addEventListener("change", () => {
    const o = Number(r.value);
    p = it.find((d) => d === o) ?? 12, Q();
  }), c.addEventListener("click", () => {
    const o = L.undo();
    o && w(o, { record: !1 });
  }), y.addEventListener("click", () => {
    const o = L.redo();
    o && w(o, { record: !1 });
  }), b.addEventListener("click", () => {
    x = null, w(ge());
  }), _.addEventListener("click", () => {
    P = !P, Q();
  }), A.addEventListener("click", () => {
    Ne(!Me()), Q();
  });
  function Le() {
    for (const o of ["mode", xe]) {
      const d = Z(e, o);
      if (!d || d.plenioWatched) continue;
      d.plenioWatched = !0;
      const l = d.callback;
      d.callback = (h) => {
        l?.(h), setTimeout(() => {
          Me() || Ne(!1), F();
        });
      };
    }
  }
  Le(), Ne(!1), F(0);
  let Ue = null, Je = null;
  const jt = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(jt);
      return;
    }
    const o = String(Z(e, "mode")?.value ?? "flat"), d = String(W()?.value ?? "");
    o === Ue && d === Je || (Ue = o, Je = d, Le(), F(0));
  }, 700);
  return {
    showExecuted(o) {
      const d = o?.plenio_eq, l = d?.[d.length - 1];
      if (!l) return;
      const h = String(Z(e, "mode")?.value ?? "flat") === "manual";
      a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !h,
        note: h ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, h ? F(0) : Q();
    }
  };
}
const Ge = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, $n = new Set(ye.map((e) => _t[e]));
function Mn(e, t) {
  return !(e in Ge) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => $n.has(n) && Et(i)).map(([n]) => n);
}
function Nn(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const s = i[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
function Ln(e, t) {
  const n = Ge[e.name];
  if (!n || !t) return t;
  const i = Nn(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let c = t;
  Array.isArray(s) && s.length && !i.includes(s[0]) && (c = { ...c, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (c = { ...c, widgets_values_named: { mode: n, ...r } });
  const y = Mn(e.name, c.widgets_values_named);
  if (y.length) {
    const b = { ...c.widgets_values_named };
    for (const _ of y) b[_] = "";
    c = { ...c, widgets_values_named: b };
  }
  return c;
}
const Mt = /* @__PURE__ */ new Map(), Ie = /* @__PURE__ */ new Set();
function ut(e, t) {
  Mt.set(e, t);
  for (const n of Ie) n(e);
}
function pt(e) {
  return Mt.get(e) ?? null;
}
function Cn(e) {
  return Ie.add(e), () => Ie.delete(e);
}
const Nt = /* @__PURE__ */ new Map();
function zn(e) {
  e?.draft_sha256 && Nt.set(e.draft_sha256, e);
}
function Bn(e) {
  return e ? Nt.get(e) ?? null : null;
}
const Ve = "plenio.sheet_state/1", qe = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Lt() {
  return { schema: Ve, docs: {} };
}
function ft(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Lt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ve || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function On(e) {
  const t = {};
  for (const i of qe) {
    const s = e.docs[i];
    s && (t[i] = s);
  }
  const n = { schema: Ve, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Re(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Rn(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = qe.filter((i) => Re(e, i) !== "auto").map(
    (i) => i === "lyrics" && Re(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${Re(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function mt(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function wi(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: mt(s?.[0] ?? 0), end: mt(r?.[1] ?? e.duration_s) };
  }) : [];
}
function Pe(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Pn(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function _i(e, t, n) {
  return n.map((i) => ({ kind: i, text: Pn(e, t, i), intent: "keep" }));
}
function Ei(e, t, n) {
  const i = { ...e.docs };
  for (const r of n) {
    const c = e.docs[r.kind], y = t?.docs[r.kind], b = Pe(r.text);
    if (r.intent === "auto")
      delete i[r.kind];
    else if (r.intent === "manual")
      i[r.kind] = { state: "manual", text: b };
    else if (r.intent === "rebase")
      y?.upstream_sha256 ? i[r.kind] = { state: "edited", text: b, base_sha256: y.upstream_sha256 } : i[r.kind] = { state: "manual", text: b };
    else if (c)
      Pe(c.text) !== b && (i[r.kind] = { ...c, text: b });
    else {
      const _ = Pe(y?.upstream ?? "");
      if (b === _) continue;
      i[r.kind] = y?.upstream_sha256 ? { state: "edited", text: b, base_sha256: y.upstream_sha256 } : { state: "manual", text: b };
    }
  }
  const s = { ...Lt(), docs: i };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function ki(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Dn(e, t) {
  return qe.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Si(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ct = "PLENIO_SHEET_STATE";
let je = null;
function Tn(e) {
  je = e;
}
const Hn = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const r = document.createElement("span");
  r.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…", s.append(c, r);
  const y = () => {
    const _ = pt(String(e.id)), A = _ ? ` · ${_.status}` : "";
    r.textContent = Rn(ft(i)) + A;
  }, b = e.addDOMWidget(t, Ct, s, {
    getValue: () => i,
    setValue: (_) => {
      i = typeof _ == "string" ? _ : "", y();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return c.addEventListener("click", async (_) => {
    _.stopPropagation();
    const A = ft(i);
    A === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const N = pt(String(e.id)), E = (e.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), I = A ?? { schema: "plenio.sheet_state/1", docs: {} }, R = N?.owned ?? Dn(E, I), G = String(e.widgets?.find((p) => p.name === "review")?.value ?? "continue"), V = G === "as the brief says" ? N?.review ?? "continue" : G, { openSheetDialog: a } = await import("./open-DSlNzVQc.mjs"), { parseGuide: x, serializeGuide: P } = await import("./tracks-DEywwRcM.mjs");
    if (!je) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: I,
      payload: N,
      asrNote: Bn(N?.docs.lyrics?.upstream_sha256),
      owned: R.length ? R : [...qe],
      review: V,
      fetcher: je,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: x(e.properties?.plenio_guide),
      onApply: (p, u) => {
        b.value = On(p), e.properties = { ...e.properties ?? {}, plenio_guide: P(u) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Cn((_) => {
    _ === String(e.id) && y();
  }), y(), { widget: b };
}, be = "plenio.stem_mix/1", ue = "rest", In = ["reverb", "delay"], zt = -60, jn = 12;
function Wn() {
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
function Bt(e) {
  const t = Wn();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Fn = ["vocals", "drums", "bass", "other"];
function Gn() {
  return [...Fn, ue];
}
function Vn(e) {
  if (typeof e != "string" || !e.trim()) return { schema: be, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== be || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Xn(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || Bt(J(e, i))) continue;
    const s = {}, r = J(e, i);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[i] = s;
  }
  const n = { schema: be, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Se(e, t, n) {
  const i = { ...e.strips };
  return Bt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function Qn(e, t, n) {
  const i = n.some((r) => J(e, r).solo), s = J(e, t);
  return i ? s.solo : !s.mute;
}
function ht(e) {
  return e <= zt ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Yn(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), i = [];
  for (const s of n) {
    const r = i[i.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : i.push([...s]);
  }
  return t !== null && t > 0 ? i.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : i;
}
function Un(e, t, n) {
  return Yn([...e, [t, n]]);
}
function Jn(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function Kn(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function Zn(e, t, n, i) {
  const s = J(e, t);
  return Se(e, t, { ...s, muted: Un(s.muted, n, i) });
}
function ei(e, t, n) {
  const i = J(e, t), s = Jn(i.muted, n);
  return s < 0 ? e : Se(e, t, { ...i, muted: Kn(i.muted, s) });
}
function ti(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (i[s] = r.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function ni(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (s, r) => i[Math.floor(r * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function gt(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Gn()).filter((r) => r !== ue), s = Object.keys(e?.strips ?? {}).filter((r) => r !== ue && !i.includes(r));
  return [...i, ...s, ue];
}
const bt = "plenio_stem_mixer", yt = "mix", te = 200, ii = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function _e(e, t, n, i, s) {
  const r = q("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(i), r.setAttribute("aria-label", s), r;
}
function si(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), s = q("div", "plenio-mix-info"), r = q("div", "plenio-mix-advanced");
  t.append(n, i, r, s);
  let c = {
    mix: { schema: be, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: gt(null, null),
    peaks: {},
    seconds: 0
  }, y = !1;
  const b = () => e.widgets?.find((p) => p.name === yt);
  function _(p, { draw: u = !0 } = {}) {
    const f = b();
    if (!f) return;
    const m = Xn(p);
    f.value = m, f.callback?.(m), c = { ...c, mix: p }, u && E();
  }
  function A(p, u, f = {}) {
    _(Se(c.mix, p, { ...J(c.mix, p), ...u }), f);
  }
  function N(p, u, f, m = {}) {
    const $ = J(c.mix, p);
    let v = Se(c.mix, p, { ...$, [u]: f });
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
      const f = J(c.mix, u), m = q("div", "plenio-mix-strip");
      m.dataset.strip = u;
      const $ = q("span", "name", u === ue ? `${u} (missed)` : u);
      $.title = u === ue ? "What the separator missed: keeps a neutral mix exact" : "";
      const v = _e(zt, jn, 0.5, f.gain_db, `${u} gain`), j = q("span", "gain", `${ht(f.gain_db)} dB`);
      v.addEventListener("input", () => {
        j.textContent = `${ht(Number(v.value))} dB`, A(u, { gain_db: Number(v.value) }, { draw: !1 });
      }), v.addEventListener("change", () => A(u, { gain_db: Number(v.value) }));
      const C = q("button", f.mute ? "toggle active" : "toggle", "M");
      C.setAttribute("aria-label", `${u} mute`), C.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { mute: !f.mute });
      });
      const T = q("button", f.solo ? "toggle active" : "toggle", "S");
      T.setAttribute("aria-label", `${u} solo`), T.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { solo: !f.solo });
      });
      const D = _e(0, 1, 0.05, f.compression, `${u} compression`);
      D.title = "Compression amount: one knob for the master compressor (threshold and ratio)", D.addEventListener("input", () => A(u, { compression: Number(D.value) }, { draw: !1 })), D.addEventListener("change", () => A(u, { compression: Number(D.value) }));
      const L = In.map((w) => {
        const F = _e(0, 1, 0.05, f[w], `${u} ${w} send`);
        return F.title = `${w} send: how much of this stem goes to the shared ${w} bus`, F.addEventListener("input", () => N(u, w, Number(F.value), { draw: !1 })), F.addEventListener("change", () => N(u, w, Number(F.value))), F;
      }), W = q("button", f.save ? "toggle active" : "toggle", "save");
      W.setAttribute("aria-label", `${u} save as its own file`), W.setAttribute("aria-pressed", String(f.save)), W.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", W.addEventListener("click", (w) => {
        w.stopPropagation(), A(u, { save: !f.save });
      });
      const Ae = Qn(c.mix, u, p);
      m.classList.toggle("silent", !Ae);
      const z = q("canvas", "plenio-mix-wave");
      z.width = te, z.height = 26, z.setAttribute("aria-label", `${u} waveform (drag to mute a time range)`), I(z, f, ni(c.peaks, u, te)), z.addEventListener("pointerdown", (w) => R(w, z, u)), m.append(
        $,
        v,
        j,
        C,
        T,
        q("span", "label", "comp"),
        D,
        q("span", "label", "verb"),
        L[0],
        q("span", "label", "delay"),
        L[1],
        W,
        z
      ), n.append(m);
    }
    G(), s.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function I(p, u, f) {
    const m = p.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, te, p.height);
    const $ = p.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let v = 0; v < f.length; v++) {
      const j = Math.max(1, f[v] * ($ - 1));
      m.moveTo(v + 0.5, $ - j), m.lineTo(v + 0.5, $ + j);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [v, j] of u.muted) {
      const C = Math.max(0, Math.min(te, v / Math.max(c.seconds, 1e-6) * te)), T = Math.max(0, Math.min(te, j / Math.max(c.seconds, 1e-6) * te));
      m.fillRect(C, 0, Math.max(1, T - C), p.height), m.strokeRect(C + 0.5, 0.5, Math.max(1, T - C) - 1, p.height - 1);
    }
  }
  function R(p, u, f) {
    if (p.preventDefault(), p.stopPropagation(), !c.seconds) return;
    const m = u.getBoundingClientRect(), $ = (L) => Math.max(0, Math.min(1, (L - m.left) / (m.width || te))) * c.seconds, v = $(p.clientX);
    if (J(c.mix, f).muted.some(([L, W]) => L <= v && v <= W)) {
      _(ei(c.mix, f, v));
      return;
    }
    let C = v;
    const T = (L) => {
      C = $(L.clientX);
    }, D = () => {
      window.removeEventListener("pointermove", T), window.removeEventListener("pointerup", D), _(Zn(c.mix, f, Math.min(v, C), Math.max(v, C)));
    };
    window.addEventListener("pointermove", T), window.addEventListener("pointerup", D);
  }
  function G() {
    i.replaceChildren();
    const p = { preset: "room", ...c.mix.reverb ?? {} }, u = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = q("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const v of ii) f.append(new Option(v, v));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => O("reverb", "preset", f.value));
    const m = q("input");
    m.type = "number", m.value = String(u.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => O("delay", "time_ms", Number(m.value)));
    const $ = _e(0, 0.8, 0.05, Number(u.feedback ?? 0.35), "Delay feedback");
    $.title = "Delay feedback: how much of each echo returns into the delay line", $.addEventListener("input", () => O("delay", "feedback", Number($.value))), i.append(
      q("span", "label", "reverb bus"),
      f,
      q("span", "label", "delay bus"),
      m,
      q("span", "label", "ms, feedback"),
      $
    ), i.style.display = "flex";
  }
  const V = e.addDOMWidget(bt, bt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  const a = e.widgets?.find((p) => p.name === yt), x = q("button", "toggle", "JSON");
  x.title = "Show or hide the raw mixer value", x.addEventListener("click", (p) => {
    p.stopPropagation(), y = !y, x.classList.toggle("active", y), a && (a.plenioHidden = !y, y ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(q("span", "label", "Advanced"), x), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function P() {
    const p = Vn(b()?.value);
    c = { ...c, mix: p ?? { schema: be, strips: {} } }, p || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), E();
  }
  return P(), {
    showExecuted(p) {
      const u = p?.plenio_stems?.at(-1), f = ti(p), m = gt(c.mix, u ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(u?.seconds ?? c.seconds) || 0 }, P();
    }
  };
}
const ri = `
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
function oi() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = ri, document.head.append(e);
}
function We(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function De(e) {
  return We(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function ai(e) {
  const t = [];
  let n = !1, i = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const r of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      r.startsWith("```") ? (t.push(`<pre><code>${We(i.join(`
`))}</code></pre>`), i = null) : i.push(r);
      continue;
    }
    if (r.startsWith("```")) {
      s(), i = [];
      continue;
    }
    const c = /^(#{1,4})\s+(.*)$/.exec(r);
    if (c) {
      s();
      const b = Math.min(c[1].length + 2, 6);
      t.push(`<h${b}>${De(c[2])}</h${b}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(r);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${De(y[1])}</li>`);
      continue;
    }
    s(), r.trim() && t.push(`<p>${De(r)}</p>`);
  }
  return s(), i !== null && t.push(`<pre><code>${We(i.join(`
`))}</code></pre>`), t.join("");
}
const Te = "plenio_summary", vt = "plenio_summary";
function li(e) {
  const t = e.widgets?.find((s) => s.name === vt);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(vt, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function xt(e, t) {
  if (!t.markdown) return;
  const n = li(e);
  n.dataset.status = t.status ?? "", n.innerHTML = ai(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function ci(e) {
  e.prototype.onExecuted = ee(e.prototype.onExecuted, function(t) {
    const n = t?.[Te], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Te] = { markdown: i.markdown, status: i.status ?? "" }, xt(this, i));
  }), e.prototype.onConfigure = ee(e.prototype.onConfigure, function() {
    const t = this.properties?.[Te];
    t?.markdown && xt(this, t);
  });
}
const di = "Plenio.Core", ke = Xt;
Tn(ke);
Qt.registerExtension({
  name: di,
  getCustomWidgets: () => ({ [Ct]: Hn }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    ci(e);
    const n = gn(t.input);
    if (n.size || t.name in Ge) {
      const i = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = Ln(t, s), c = un(r), y = i?.call(this, r);
        return hn(this, c, n), y;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ee(e.prototype.onExecuted, function(i) {
      for (const s of i?.plenio_asr ?? []) zn(s);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), i.set(this, An(this, ke));
      }, e.prototype.onExecuted = ee(e.prototype.onExecuted, function(r) {
        i.get(this)?.showExecuted(r);
      });
    }
    if (ln.has(t.name) && cn(e, ke), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), i.set(this, si(this));
      }, e.prototype.onExecuted = ee(e.prototype.onExecuted, function(r) {
        i.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = ee(e.prototype.onExecuted, function(i) {
      const s = i?.plenio_sheet, r = s?.[s.length - 1];
      r && ut(String(this.id), r);
    }));
  },
  setup() {
    oi(), ke.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && ut(String(t.node_id), t);
    });
  }
});
export {
  di as E,
  wt as P,
  vi as a,
  hi as b,
  wi as c,
  On as d,
  bi as e,
  Pe as f,
  mi as g,
  yi as i,
  Ei as n,
  fi as r,
  _i as s,
  gi as t,
  Si as u,
  xi as v,
  ki as w
};
