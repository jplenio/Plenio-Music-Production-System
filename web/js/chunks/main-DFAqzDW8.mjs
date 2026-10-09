import { api as vr } from "../../../../scripts/api.js";
import { app as wn } from "../../../../scripts/app.js";
class De extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ce(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), o = await r.json();
  if (!r.ok) {
    const s = o?.error ?? {};
    throw new De(s.message ?? `Request failed (${r.status})`, s.hint ?? null);
  }
  return o;
}
function wr(e, t) {
  return ce(e, "/plenio/sheet/resolve", t);
}
async function Bs(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Nt(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Hs(e, t, n, r) {
  return ce(e, "/plenio/score/analyze", Nt({ abc: t }, n, r));
}
function Ws(e, t, n, r, o) {
  return ce(e, "/plenio/score/transform", Nt({ abc: t, operation: n }, r, o));
}
function Fs(e, t) {
  const { lyrics: n, spans: r, ...o } = t;
  return ce(e, "/plenio/score/musicxml/export", Nt(o, n, r));
}
function Gs(e, t) {
  return ce(e, "/plenio/score/midi/export", t);
}
function js(e, t) {
  return ce(e, "/plenio/score/midi/import", t);
}
function Vs(e, t) {
  return ce(e, "/plenio/lyrics/analyze", t);
}
function Xs(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Pt(e, t, n, r = 200) {
  return ce(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
function xr(e, t) {
  return ce(e, "/plenio/brief/fields", t);
}
async function _r(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new De(`Request failed (${t.status})`);
  return await t.json();
}
function le(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const Pe = [
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
function Le(e, t) {
  const n = qt[t];
  if (n)
    return (e.widgets ?? []).find((r) => r.name === n);
}
function Er(e) {
  const t = {};
  for (const n of [...Pe, ...Sr]) {
    const r = Le(e, n);
    r && (t[n] = typeof r.value == "string" ? r.value : String(r.value ?? ""));
  }
  return t;
}
function Mr(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function Bt(e, t) {
  const n = [];
  for (const r of t.fills) {
    if (!Pe.includes(r.field)) continue;
    const o = Le(e, r.field);
    o && !String(o.value ?? "").trim() && r.value && n.push({ field: r.field, value: r.value });
  }
  return n;
}
function Ht(e) {
  const t = [];
  for (const n of Pe) {
    const r = Le(e, n);
    r && String(r.value ?? "").trim() && t.push(r);
  }
  return t;
}
function St(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Ar(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((r) => `${r.field} (${Nr(r.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function $r(e) {
  const t = e ? St(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Lr(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Nr(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Wt(e, t) {
  for (const n of t) {
    const r = Le(e, n.field);
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
  for (const n of Pe) {
    const r = Le(e, n);
    !r || !xn(r.value) || (r.value = "", r.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Ft = "plenio_brief_template", Tr = 400;
function zr(e, t) {
  let n = null, r = !1, o = null, s;
  const i = document.createElement("div");
  i.className = "plenio-brief-template";
  const a = document.createElement("div");
  a.className = "line";
  const l = document.createElement("div");
  l.className = "hint";
  const f = document.createElement("div");
  f.className = "actions", i.append(a, l, f);
  const h = (g, m, y) => {
    const v = document.createElement("button");
    return v.textContent = g, v.title = m, v.addEventListener("click", (T) => {
      T.stopPropagation(), y();
    }), f.append(v), v;
  }, b = h("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Wt(e, Bt(e, n).map((g) => ({ field: g.field, value: g.value }))), S());
  }), k = h("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Wt(e, St(n)), S());
  }), _ = h("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const g = Ht(e);
    g.length && window.confirm(`Clear ${g.length} text field(s)? The template's values apply again.`) && (qr(e, g), S());
  }), R = h("↻", "Ask again what the template fills", () => {
    H();
  }), S = () => {
    const g = Ar(n, r);
    a.textContent = o ?? g ?? "The template fills nothing: every text field has your value.", a.dataset.state = o ? "error" : r && n ? "ok" : "empty";
    const m = $r(n), y = Lr(n);
    l.textContent = [m, y].filter(Boolean).join(" · "), l.style.display = l.textContent ? "" : "none", f.style.display = r && n && n.template !== "none" ? "" : "none", b.disabled = !n || !Bt(e, n).length, k.disabled = !n || !St(n).length, _.disabled = !Ht(e).length, R.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, E = /* @__PURE__ */ new WeakSet(), W = () => {
    for (const g of ["template", ...Object.keys(qt)]) {
      const m = g === "template" ? e.widgets?.find((y) => y.name === "template") : Le(e, g);
      !m || E.has(m) || (E.add(m), m.callback = le(m.callback, () => {
        W(), H();
      }));
    }
  }, u = async () => {
    W();
    const g = String(e.widgets?.find((m) => m.name === "template")?.value ?? "none");
    try {
      n = await xr(t, { fields: Er(e), template: g, kind: Mr(e) }), o = null;
    } catch (m) {
      n = null, o = `The template fields could not be read: ${m instanceof Error ? m.message : String(m)}`;
    }
    r = !0, S();
  };
  function H() {
    clearTimeout(s), s = setTimeout(() => {
      u();
    }, Tr);
  }
  W();
  const $ = e.addDOMWidget(Ft, Ft, i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return $.serialize = !1, _n(e), S(), H(), {
    widget: $,
    refresh: H,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Cr = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Ir(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = e.prototype, o = r.onNodeCreated;
  r.onNodeCreated = function() {
    o?.call(this), n.set(this, zr(this, t));
  };
  const s = r.onConfigure;
  r.onConfigure = function(i) {
    s?.call(this, i), _n(this), n.get(this)?.refresh();
  };
}
const Or = "COMFY_DYNAMICCOMBO_V3";
function Rr(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Dr(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Pr(e, t) {
  const n = Dr(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, o) => r.value === t[o]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function Br(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Hr(e, t, n) {
  if (!t || !e.widgets || Pr(e, t)) return !1;
  let r = 0;
  for (let o = 0; o < e.widgets.length; o++) {
    const s = e.widgets[o];
    if (s.serialize === !1) continue;
    let i;
    if (Array.isArray(t)) {
      if (r >= t.length) break;
      i = t[r++];
    } else if (s.name in t)
      i = t[s.name];
    else
      continue;
    if (n.has(s.name) && !Br(s, i)) return !0;
    s.value !== i && (s.value = i);
  }
  return !0;
}
function Wr(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === Or && t.add(r);
  return t;
}
const Sn = "plenio.eq/1", Ze = 8, me = 20, Fr = 2e4, Ae = 12, kn = 15, ke = ["peak", "low_shelf", "high_shelf"], En = ["peak", "notch", "highpass", "lowpass"], Gt = [0.2, 10], jt = [0.25, 1];
function _e() {
  return { schema: Sn, preamp_db: 0, bands: [] };
}
function Gr(e) {
  if (typeof e != "string" || !e.trim()) return _e();
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
function Se(e) {
  return JSON.stringify(e);
}
const Q = (e, t) => Number(e.toFixed(t));
function j(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Mn(e) {
  return e.db ?? kn;
}
const Vt = [6, 12, 18], jr = { 6: 8, 12: 14, 18: 20 };
function Vr(e, t) {
  return { ...e, db: jr[t] ?? kn };
}
function ye(e, t) {
  return Math.log(j(t, me, e.maxHz) / me) / Math.log(e.maxHz / me) * e.width;
}
function Xt(e, t) {
  return me * (e.maxHz / me) ** j(t / e.width, 0, 1);
}
function he(e, t) {
  const n = Mn(e);
  return (1 - (j(t, -n, n) + n) / (2 * n)) * e.height;
}
function Yt(e, t) {
  const n = Mn(e);
  return (1 - j(t / e.height, 0, 1)) * 2 * n - n;
}
function Ut(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Qt(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${ye(e, r).toFixed(1)},${he(e, n[o] ?? 0).toFixed(1)}`).join(" ");
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
  if (e.bands.length >= Ze) return null;
  const o = {
    id: Xr(e),
    enabled: !0,
    type: "peak",
    frequency_hz: Q(j(t, me, Tt(r)), 1),
    gain_db: Q(j(n, -Ae, Ae), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, o] };
}
function Ne(e, t, n, r, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: Q(j(n, me, Tt(o)), 1),
        gain_db: ke.includes(s.type) ? Q(j(r, -Ae, Ae), 1) : s.gain_db
      }
    )
  };
}
function ht(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: Q(j(r.q * n, 0.2, 10), 3) } : r)
  };
}
function mt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function qe(e) {
  const t = e.frequency_hz >= 1e3 ? `${Q(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ke.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${Q(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${Q(e.q, 2)}`;
}
function Ur(e, t) {
  const n = An[e.type] ?? e.type, r = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, o = ke.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = En.includes(e.type) ? ` Q ${Q(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${r}${o}${s}${e.enabled ? "" : " (off)"}`;
}
const An = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function gt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), r = 1;
  if (t && /k$/i.test(n) && (r = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const o = Number(n) * r;
  return Number.isFinite(o) ? o : null;
}
function je(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function et(e, t, n, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map((o) => {
      if (o.id !== t) return o;
      const s = { ...o, ...n };
      return {
        ...s,
        frequency_hz: Q(j(je(s.frequency_hz, o.frequency_hz), me, Tt(r)), 1),
        gain_db: Q(j(je(s.gain_db, o.gain_db), -Ae, Ae), 1),
        q: Q(j(je(s.q, o.q), Gt[0], Gt[1]), 3),
        slope: Q(j(je(s.slope, o.slope), jt[0], jt[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function Jt(e, t) {
  return et(e, t, { gain_db: 0 });
}
function Kt(e, t, n, { heightFraction: r = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const o = n.filter((b) => Number.isFinite(b));
  if (!o.length) return "";
  const s = Math.max(...o), i = Math.min(...o), a = Math.max(s - i, 1e-6), l = e.height - 4, f = l - Math.max(12, e.height * j(r, 0.1, 0.95));
  return `M${t.map((b, k) => {
    const _ = n[k], R = Number.isFinite(_) ? (_ - i) / a : 0;
    return `${ye(e, b).toFixed(1)},${(l - R * (l - f)).toFixed(1)}`;
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
    Se(t) !== Se(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Jr = "http://www.w3.org/2000/svg", Zt = "plenio_eq_panel", Ve = "mode.bands", de = { capture: !0 }, Z = { width: 560, height: 260 }, Xe = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let bt = null;
function se(e, t) {
  const n = document.createElementNS(Jr, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function G(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function be(e, t, n) {
  const r = document.createElement("button");
  return r.className = e, r.textContent = t, r.setAttribute("aria-label", n), r.title = n, r;
}
function ie(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Kr(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, r) => {
    const o = t.bands[r];
    return o !== void 0 && n.type === o.type && n.enabled === o.enabled && Math.abs(n.frequency_hz - o.frequency_hz) < 0.5 && Math.abs(n.gain_db - o.gain_db) < 0.05 && Math.abs(n.q - o.q) < 0.01;
  });
}
function Zr(e, t) {
  const n = G("div", "plenio-eq"), r = G("div", "plenio-eq-tools"), o = G("select");
  o.setAttribute("aria-label", "EQ preset"), o.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = G("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const c of Vt) s.append(new Option(`±${c} dB`, String(c)));
  const i = be("", "↶", "Undo the last band change"), a = be("", "↷", "Redo the last band change"), l = be("", "reset", "Remove every band"), f = be("", "compare", "Show the curve without the EQ (bypass)"), h = be("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), b = G("span", "plenio-eq-info");
  b.setAttribute("aria-live", "polite"), b.title = "What the panel is showing right now (the selected band, a note, or a hint)", r.append(o, s, i, a, l, f, h, b);
  const k = G("div", "plenio-eq-mode"), _ = se("svg", {
    viewBox: `0 0 ${Z.width} ${Z.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  _.setAttribute("aria-label", "EQ response curve"), _.setAttribute("tabindex", "0"), _.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const R = G("div", "plenio-eq-strip"), S = G("div", "plenio-eq-editor"), E = G("div", "plenio-eq-fields");
  S.append(E), n.append(r, k, _, R, S);
  const W = e.addDOMWidget(Zt, Zt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: _e(), readonly: !0, note: "" }, H = null, $ = null, g = !1, m = 12, y = null, v = [], T = 0, M, V, L = null, D = !1;
  const F = /* @__PURE__ */ new Map();
  let N = null;
  const P = new Qr(_e()), ne = () => ie(e, Ve), X = () => m, z = () => Vr({ ...Z, maxHz: Math.min(2e4, u.sampleRate / 2) }, X());
  function C(c, { record: p = !0 } = {}) {
    const d = ne();
    if (!d) return;
    const w = Se(c);
    d.value = w, d.callback?.(w), p && P.push(c), u = { ...u, settings: c }, K(), ue(0);
  }
  async function ue(c = 120) {
    clearTimeout(M), M = setTimeout(async () => {
      const p = String(ie(e, "mode")?.value ?? "flat");
      if (p !== "manual") {
        p === "flat" ? u = {
          ...u,
          settings: _e(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : H !== p ? u = {
          ...u,
          settings: _e(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: `${p}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : u = { ...u, readonly: !0 }, K();
        return;
      }
      const d = Gr(ne()?.value);
      if (!d) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, K();
        return;
      }
      Se(d) !== Se(P.current) && P.reset(d);
      const w = ++T;
      try {
        const A = await Pt(t, d, u.sampleRate);
        if (w !== T) return;
        u = {
          ...u,
          frequencies: A.frequency_hz,
          response: A.response_db,
          settings: A.settings,
          readonly: !1,
          note: ""
        };
      } catch (A) {
        u = { ...u, readonly: !1, note: A instanceof Error ? A.message : String(A) };
      }
      K();
    }, c);
  }
  const re = (c) => ({
    ...c.settings,
    bands: c.settings.bands.slice(0, Ze)
  });
  function He() {
    if (!y) return "";
    const c = v.find((p) => p.name === y);
    return c && Kr(re(c), u.settings) ? y : "";
  }
  function K() {
    _.replaceChildren(), F.clear(), N = null;
    const c = z();
    for (const d of [-c.db, -c.db / 2, 0, c.db / 2, c.db])
      _.append(
        se("line", { x1: 0, x2: c.width, y1: he(c, d), y2: he(c, d), class: d ? "grid" : "grid zero" })
      );
    for (const d of [100, 1e3, 1e4])
      _.append(se("line", { x1: ye(c, d), x2: ye(c, d), y1: 0, y2: c.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && _.append(se("path", { d: Kt(c, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && _.append(se("path", { d: Kt(c, u.frequencies, u.afterDb), class: "spectrum after" })), g ? _.append(se("line", { x1: 0, x2: c.width, y1: he(c, 0), y2: he(c, 0), class: "curve flat" })) : u.frequencies.length && (N = se("path", { d: Qt(c, u.frequencies, u.response), class: "curve" }), _.append(N)), !u.readonly && !g && u.settings.bands.forEach((d, w) => {
      const A = Xe[w % Xe.length], I = ke.includes(d.type) ? d.gain_db : 0, x = se("circle", {
        cx: ye(c, d.frequency_hz),
        cy: he(c, I),
        r: d.id === $ ? 9 : 7,
        class: d.id === $ ? "handle selected" : "handle",
        style: `stroke: ${A}`,
        tabindex: 0,
        "data-band": d.id
      });
      x.setAttribute("aria-label", `Band ${w + 1}: ${qe(d)}`), d.enabled || x.classList.add("disabled"), x.append(se("title", {})), x.lastChild.textContent = `Band ${w + 1}: ${qe(d)}`, x.addEventListener("pointerdown", (B) => ur(B, d.id)), x.addEventListener("dblclick", (B) => {
        B.stopPropagation(), C(Jt(u.settings, d.id));
      }), x.addEventListener("focus", () => ar(d.id)), x.addEventListener("keydown", (B) => It(B, d.id)), x.addEventListener("wheel", (B) => {
        B.preventDefault();
        const ge = B.deltaY < 0 ? 1.15 : 1 / 1.15;
        C(ht(u.settings, d.id, ge));
      }), x.addEventListener("contextmenu", (B) => {
        B.preventDefault(), C(mt(u.settings, d.id));
      }), _.append(x), F.set(d.id, x);
    }), or(), sr(), ir();
    const p = u.settings.bands.find((d) => d.id === $);
    b.textContent = u.note || (g ? "compare: the curve is off (the node still applies it)" : p ? qe(p) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${Ze}`), o.disabled = u.readonly, i.disabled = !P.canUndo, a.disabled = !P.canRedo, l.disabled = u.readonly || !u.settings.bands.length, D && (D = !1, $ && F.get($)?.focus({ preventScroll: !0 })), s.value = String(m), o.value = He(), f.classList.toggle("active", g), h.classList.toggle("active", ut()), e.setDirtyCanvas?.(!0, !0);
  }
  function or() {
    if (R.replaceChildren(), u.readonly && !u.settings.bands.length) {
      R.append(G("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((c, p) => {
      const d = G("button", "plenio-eq-chip", Ur(c, p));
      d.style.borderLeftColor = Xe[p % Xe.length], d.classList.toggle("selected", c.id === $), d.classList.toggle("disabled", !c.enabled), d.setAttribute("aria-label", `Edit band ${p + 1}`), d.title = `Band ${p + 1}: ${qe(c)} - click to open its fields`, d.addEventListener("click", (w) => {
        w.stopPropagation(), $ = $ === c.id ? null : c.id, K();
      }), R.append(d);
    });
  }
  function sr() {
    E.replaceChildren();
    const c = u.settings.bands.find((x) => x.id === $);
    if (!c || u.readonly) {
      S.style.display = "none";
      return;
    }
    S.style.display = "";
    const p = G("span", "name", `Band ${u.settings.bands.indexOf(c) + 1}`);
    p.title = "The selected band";
    const d = G("select");
    d.setAttribute("aria-label", "Band type"), d.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [x, B] of Object.entries(An)) d.append(new Option(B, x));
    d.value = c.type, d.addEventListener("change", () => C(et(u.settings, c.id, { type: d.value })));
    const w = G("input");
    w.type = "checkbox", w.checked = c.enabled, w.setAttribute("aria-label", "Band enabled"), w.title = "Band enabled: off keeps the band in the list but out of the response", w.addEventListener("change", () => C(et(u.settings, c.id, { enabled: w.checked })));
    const A = [
      [
        "Hz",
        `${c.frequency_hz}`,
        70,
        (x) => ft(c.id, "frequency_hz", gt(x, { kilo: !0 }))
      ],
      ["dB", `${c.gain_db}`, 60, (x) => ft(c.id, "gain_db", gt(x))],
      ["Q", `${c.q}`, 60, (x) => ft(c.id, "q", gt(x))]
    ];
    E.append(p, d, w);
    for (const [x, B, ge, We] of A) {
      const Y = G("input", "number");
      Y.value = B, Y.style.width = `${ge}px`, Y.setAttribute("aria-label", `Band ${x}`), Y.title = x === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : x === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Fe = () => {
        We(Y.value) || (Y.value = B);
      };
      Y.addEventListener("keydown", (oe) => {
        oe.key === "Enter" && Fe();
      }), Y.addEventListener("blur", Fe), (x === "dB" && !ke.includes(c.type) || x === "Q" && !En.includes(c.type)) && (Y.disabled = !0), E.append(Y);
    }
    const I = be("", "remove", "Remove this band");
    I.addEventListener("click", (x) => {
      x.stopPropagation(), $ = null, C(mt(u.settings, c.id));
    }), E.append(I);
  }
  function ir() {
    k.replaceChildren();
    const c = String(ie(e, "mode")?.value ?? "flat");
    if (c === "manual" || c === "flat") {
      k.style.display = "none";
      return;
    }
    k.style.display = "", k.append(
      G(
        "span",
        "plenio-eq-hint",
        H === c ? `applied proposal (${u.settings.bands.length} band(s), ${c})` : `${c}: no proposal yet - it is computed on the next run`
      )
    );
    const p = be("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    p.disabled = !u.settings.bands.length, p.addEventListener("click", (d) => {
      d.stopPropagation();
      const w = ie(e, "mode");
      if (!w) return;
      w.value = "manual", w.callback?.("manual");
      const A = ne();
      if (A) {
        const I = Se(u.settings);
        A.value = I, A.callback?.(I);
      }
      P.reset(u.settings), pt(), ue(0);
    }), k.append(p);
  }
  function ar(c) {
    $ = c, D = !0, K();
  }
  function lr(c) {
    $ = c, ct();
  }
  function ct() {
    const c = z();
    u.settings.bands.forEach((d) => {
      const w = F.get(d.id);
      if (!w) return;
      const A = ke.includes(d.type) ? d.gain_db : 0;
      w.setAttribute("cx", String(ye(c, d.frequency_hz))), w.setAttribute("cy", String(he(c, A))), w.classList.toggle("selected", d.id === $), w.setAttribute("r", d.id === $ ? "9" : "7");
    }), N && u.frequencies.length && N.setAttribute("d", Qt(c, u.frequencies, u.response));
    const p = u.settings.bands.find((d) => d.id === $);
    p && (b.textContent = qe(p));
  }
  function cr() {
    clearTimeout(V), V = setTimeout(async () => {
      const c = u.settings, p = ++T;
      try {
        const d = await Pt(t, c, u.sampleRate);
        if (p !== T) return;
        u = { ...u, frequencies: d.frequency_hz, response: d.response_db }, ct();
      } catch {
      }
    }, 60);
  }
  function ut() {
    return !ie(e, Ve)?.plenioHidden;
  }
  function dt(c) {
    const p = ie(e, Ve);
    p && (p.plenioHidden = !c, c ? delete p.computeSize : p.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function ft(c, p, d) {
    if (d === null) return !1;
    const w = u.settings.bands.find((A) => A.id === c);
    return w && w[p] === d || C(et(u.settings, c, { [p]: d })), !0;
  }
  function ur(c, p) {
    c.preventDefault(), c.stopPropagation(), $ !== p && lr(p);
    const d = u.settings.bands.find((J) => J.id === p);
    if (!d) return;
    L = { hz: d.frequency_hz, db: d.gain_db };
    let w = !1, A = !1;
    const I = c.currentTarget;
    try {
      I?.setPointerCapture?.(c.pointerId);
    } catch {
    }
    const x = _.getBoundingClientRect(), B = x.width ? x.left : 0, ge = x.height ? x.top : 0, We = x.width || Z.width, Y = x.height || Z.height, Fe = (J, Ge) => J >= B - 1 && J <= B + We + 1 && Ge >= ge - 1 && Ge <= ge + Y + 1;
    function oe() {
      if (!A) {
        A = !0;
        try {
          I?.releasePointerCapture?.(c.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Dt, de), window.removeEventListener("pointerup", oe, de), window.removeEventListener("pointercancel", oe, de), window.removeEventListener("blur", oe, de), L = null, w && C(u.settings);
      }
    }
    const Dt = (J) => {
      if (A || !L) return;
      if (J.buttons === 0) {
        oe();
        return;
      }
      if (!Fe(J.clientX, J.clientY)) return;
      const Ge = Z.width / We, fr = Z.height / Y, pr = (J.clientX - B) * Ge, hr = (J.clientY - ge) * fr, mr = ye(z(), L.hz), gr = he(z(), L.db), br = Xt(z(), Ut(mr, pr, J.shiftKey)), yr = Yt(z(), Ut(gr, hr, J.shiftKey));
      u = { ...u, settings: Ne(u.settings, p, br, yr, u.sampleRate) }, w = !0, ct(), cr();
    };
    window.addEventListener("pointermove", Dt, de), window.addEventListener("pointerup", oe, de), window.addEventListener("pointercancel", oe, de), window.addEventListener("blur", oe, de);
  }
  function It(c, p) {
    const d = u.settings.bands.find((x) => x.id === p);
    if (!d) return;
    const w = c.shiftKey ? 0.1 : 0.5, A = c.shiftKey ? 1.01 : 1.06;
    let I = null;
    c.key === "ArrowUp" ? I = Ne(u.settings, p, d.frequency_hz, d.gain_db + w, u.sampleRate) : c.key === "ArrowDown" ? I = Ne(u.settings, p, d.frequency_hz, d.gain_db - w, u.sampleRate) : c.key === "ArrowRight" ? I = Ne(u.settings, p, d.frequency_hz * A, d.gain_db, u.sampleRate) : c.key === "ArrowLeft" ? I = Ne(u.settings, p, d.frequency_hz / A, d.gain_db, u.sampleRate) : c.key === "+" ? I = ht(u.settings, p, 1.15) : c.key === "-" ? I = ht(u.settings, p, 1 / 1.15) : c.key === "0" ? I = Jt(u.settings, p) : (c.key === "Delete" || c.key === "Backspace") && (I = mt(u.settings, p)), I && (c.preventDefault(), C(I));
  }
  _.addEventListener("keydown", (c) => {
    $ && c.target === _ && It(c, $);
  }), _.addEventListener("dblclick", (c) => {
    if (u.readonly || g) return;
    const p = _.getBoundingClientRect(), d = Z.width / (p.width || Z.width), w = Z.height / (p.height || Z.height), A = (c.clientX - p.left) * d, I = (c.clientY - p.top) * w, x = Yr(u.settings, Xt(z(), A), Yt(z(), I), u.sampleRate);
    x ? ($ = x.bands[x.bands.length - 1].id, C(x)) : (u = { ...u, note: `the EQ has at most ${Ze} bands` }, K());
  }), o.append(new Option("preset…", "")), bt ??= _r(t).then((c) => c.manual).catch(() => []), bt.then((c) => {
    v = c;
    for (const p of c) o.append(new Option(p.name, p.name));
    o.value = He();
  }), o.addEventListener("change", async () => {
    const c = (await bt)?.find((p) => p.name === o.value);
    c && (y = c.name, C(re(c)));
  }), s.addEventListener("change", () => {
    const c = Number(s.value);
    m = Vt.find((p) => p === c) ?? 12, K();
  }), i.addEventListener("click", () => {
    const c = P.undo();
    c && C(c, { record: !1 });
  }), a.addEventListener("click", () => {
    const c = P.redo();
    c && C(c, { record: !1 });
  }), l.addEventListener("click", () => {
    $ = null, C(_e());
  }), f.addEventListener("click", () => {
    g = !g, K();
  }), h.addEventListener("click", () => {
    dt(!ut()), K();
  });
  function pt() {
    for (const c of ["mode", Ve]) {
      const p = ie(e, c);
      if (!p || p.plenioWatched) continue;
      p.plenioWatched = !0;
      const d = p.callback;
      p.callback = (w) => {
        d?.(w), setTimeout(() => {
          ut() || dt(!1), ue();
        });
      };
    }
  }
  pt(), dt(!1), ue(0);
  let Ot = null, Rt = null;
  const dr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(dr);
      return;
    }
    const c = String(ie(e, "mode")?.value ?? "flat"), p = String(ne()?.value ?? "");
    c === Ot && p === Rt || (Ot = c, Rt = p, pt(), ue(0));
  }, 700);
  return {
    showExecuted(c) {
      const p = c?.plenio_eq, d = p?.[p.length - 1];
      if (!d) return;
      const w = String(ie(e, "mode")?.value ?? "flat"), A = w === "manual";
      H = A || w === "flat" ? null : w, u = {
        sampleRate: d.sample_rate,
        frequencies: d.frequency_hz,
        response: d.response_db,
        settings: d.settings,
        readonly: !A,
        note: A ? "" : `applied: ${d.settings.bands.length} band(s)`,
        beforeDb: d.spectrum_before_db,
        afterDb: d.spectrum_after_db
      }, A ? ue(0) : K();
    }
  };
}
const zt = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, eo = new Set(Pe.map((e) => qt[e]));
function to(e, t) {
  return !(e in zt) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, r]) => eo.has(n) && xn(r)).map(([n]) => n);
}
function no(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const r = n?.[t];
    if (!Array.isArray(r)) continue;
    if (Array.isArray(r[0])) return r[0];
    const o = r[1]?.options;
    return Array.isArray(o) ? o : [];
  }
  return [];
}
const ro = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function oo(e, t) {
  const n = ro[e];
  if (!n) return [];
  const r = [];
  for (const o of t ?? []) {
    const s = n[o.name]?.[String(o.value)];
    s !== void 0 && (o.value = s, r.push(o.name));
  }
  return r;
}
function so(e, t) {
  const n = zt[e.name];
  if (!n || !t) return t;
  const r = no(e, "mode"), o = t.widgets_values, s = t.widgets_values_named;
  let i = t;
  Array.isArray(o) && o.length && !r.includes(o[0]) && (i = { ...i, widgets_values: [n, ...o] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (i = { ...i, widgets_values_named: { mode: n, ...s } });
  const a = to(e.name, i.widgets_values_named);
  if (a.length) {
    const l = { ...i.widgets_values_named };
    for (const f of a) l[f] = "";
    i = { ...i, widgets_values_named: l };
  }
  return i;
}
const $n = /* @__PURE__ */ new Map(), kt = /* @__PURE__ */ new Set();
function en(e, t) {
  $n.set(e, t);
  for (const n of kt) n(e);
}
function xe(e) {
  return $n.get(e) ?? null;
}
function io(e) {
  return kt.add(e), () => kt.delete(e);
}
const Ln = /* @__PURE__ */ new Map();
function ao(e) {
  e?.draft_sha256 && Ln.set(e.draft_sha256, e);
}
function lo(e) {
  return e ? Ln.get(e) ?? null : null;
}
const yt = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function co(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function uo(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Nn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function fo(e) {
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
const rt = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new Set();
function qn(e) {
  return rt.get(e) ?? null;
}
function Ee(e, t) {
  t ? rt.set(e, t) : rt.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ce) n(e);
}
function po(e) {
  for (const t of e) rt.delete(t);
  for (const t of Ce) t(null);
}
function ho() {
  for (const e of Ce) e(null);
}
function mo(e) {
  return Ce.add(e), () => Ce.delete(e);
}
const tn = "600 12px sans-serif", Ye = 20, vt = 7;
function go(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function bo(e) {
  const t = e ? go(e) : "";
  return {
    height: e ? Ye : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = tn;
      const r = n.measureText(t).width + 2 * vt;
      return n.restore(), r;
    },
    draw(n, r, o) {
      if (!e) return;
      n.save(), n.font = tn;
      const s = n.measureText(t).width + 2 * vt;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(r, o, s, Ye, 5) : n.rect(r, o, s, Ye), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, r + vt, o + Ye / 2 + 0.5), n.restore();
    }
  };
}
const yo = "PlenioSongSheet", vo = 30;
function Tn(e, t) {
  const n = e.widgets?.find((r) => r.name === t);
  return n ? String(n.value ?? "") : null;
}
function wo(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? Tn(n, "mode") : null;
  } catch {
    return null;
  }
}
function Et(e) {
  const t = qn(e);
  return t || (e.type !== yo ? null : uo(Tn(e, "review") ?? "continue", wo(e)) ? "stop" : null);
}
function xo(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Nn(n);
  const r = e?.plenio_summary;
  return co(r?.[r.length - 1]?.status);
}
function _o(e, t) {
  const n = e.prototype, r = n.onNodeCreated;
  n.onNodeCreated = function() {
    r?.call(this);
    const o = this;
    o.badges?.push(() => {
      const s = Et(o);
      return bo(s ? yt[s] : null);
    });
  }, n.onDrawForeground = le(n.onDrawForeground, function(o) {
    const s = Et(this);
    !s || !yt[s].frame || this.flags?.collapsed || !this.size || So(o, yt[s], this.size, vo, t.scale());
  }), n.onExecuted = le(n.onExecuted, function(o) {
    const s = xo(o);
    s && (Ee(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function So(e, t, n, r, o) {
  const s = Math.max(3, 3 / Math.max(o, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const i = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i, 10) : e.rect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i), e.stroke(), e.restore();
}
function Ys(e, t) {
  const n = [];
  let r = 0;
  return e.bars.forEach((o, s) => {
    const i = t?.[s] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, l = a ? a[1] - a[0] : o.duration_s;
    n.push({ scoreStart: o.start_s, scoreDur: o.duration_s, realStart: r, realDur: l, source: a }), r += l;
  }), n;
}
function zn(e, t, n) {
  let r = null;
  for (const o of e)
    if (o[n] <= t + U) r = o;
    else break;
  return r ?? e[0] ?? null;
}
function we(e, t) {
  const n = zn(e, t, "scoreStart");
  if (!n) return t;
  const r = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + r * n.realDur;
}
function ko(e, t) {
  const n = zn(e, t, "realStart");
  if (!n) return t;
  const r = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + r * n.scoreDur;
}
function Us(e, t, n) {
  const r = we(e, t), o = n == null ? 1 / 0 : we(e, n), s = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, l = Math.max(i.realStart, r), f = Math.min(a, o);
    if (f <= l + U) continue;
    let h = i.source[0] + (l - i.realStart) / i.realDur * (i.source[1] - i.source[0]), b = l - r, k = f - l;
    if (h < 0 && (b -= h, k += h, h = 0, k <= U))
      continue;
    const _ = s.at(-1);
    _ && Math.abs(_.at + _.duration - b) < U && Math.abs(_.offset + _.duration - h) < 0.01 ? _.duration += k : s.push({ at: b, offset: h, duration: k });
  }
  return s;
}
const Cn = 0.04, U = 1e-3, Eo = 0.25, Mo = 2;
function ot(e) {
  return Math.min(Mo, Math.max(Eo, Number.isFinite(e) ? e : 1));
}
function Qs(e, t) {
  const n = ot(t.speed), r = t.to ?? e.duration_s, o = [], s = t.clock?.length ? t.clock : null, i = s ? we(s, t.from) : t.from, a = (l) => (s ? we(s, l) : l) - i;
  for (const l of ["Vocal", "Ins"])
    if (t.voices[l])
      for (const f of e.notes?.[l] ?? []) {
        if (f.start_s < t.from - U || f.start_s >= r - U) continue;
        const h = Math.min(f.start_s + f.duration_s, r), b = Math.max(0, a(f.start_s));
        o.push({ at: b / n, duration: (a(h) - b) / n, midi: f.midi, part: l });
      }
  if (t.voices.chords)
    for (const l of e.chords ?? []) {
      const f = Math.min(l.start_s + l.duration_s, r), h = Math.max(l.start_s, t.from);
      if (!(f <= h + U))
        for (const b of l.pitches)
          o.push({ at: a(h) / n, duration: (a(f) - a(h)) / n, midi: b, part: "chord" });
    }
  if (t.voices.guide)
    for (const l of t.guide ?? []) {
      if (l.start_s < t.from - U || l.start_s >= r - U) continue;
      const f = Math.min(l.start_s + l.duration_s, r), h = Math.max(0, a(l.start_s));
      o.push({ at: h / n, duration: (a(f) - h) / n, midi: l.midi, part: "guide" });
    }
  if (t.metronome)
    for (const l of e.bars) {
      const f = Number(l.meter.split("/")[0]) || 1;
      for (let h = 0; h < f; h++) {
        const b = l.start_s + h * l.duration_s / f;
        b < t.from - U || b >= r - U || o.push({
          at: Math.max(0, a(b)) / n,
          duration: Cn,
          midi: h === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return o.sort((l, f) => l.at - f.at || l.midi - f.midi);
}
function Js(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), r = t.clock?.length ? t.clock : null, o = r ? we(r, n) - we(r, t.from) : n - t.from;
  return Math.max(0, o) / ot(t.speed);
}
function Ks(e, t, n, r, o, s) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, l = i > 0 ? Math.floor(a / i + 1e-6) : 0, f = i > 0 ? (a - l * i) / i * s : 0, h = f > 1e-3 ? 0 : 1, b = Math.max(0, r * t);
  return Array.from({ length: b }, (k, _) => {
    const R = h + b - 1 - _, S = ((l - R) % t + t) % t === 0;
    return { at: Math.max(0, o - f - R * s), duration: Cn, midi: S ? 96 : 89, part: "click" };
  });
}
function Zs(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? ko(n, we(n, e.from) + t * ot(e.speed)) : e.from + t * ot(e.speed);
}
function ei(e, t, n) {
  return (e.elements ?? []).filter(
    (r) => r.kind === "note" && n[r.voice] && r.start_s <= t + U && t < r.start_s + r.duration_s - U
  ).map((r) => r.id);
}
function Ao(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const $o = [
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
], ti = {
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
function Ue(e) {
  return typeof e == "string" && $o.includes(e);
}
function In() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Lo(e) {
  const t = In(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: Ue(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: Ue(n.Ins) ? n.Ins : t.Ins,
    chord: Ue(n.chord) ? n.chord : t.chord,
    guide: Ue(n.guide) ? n.guide : t.guide
  };
}
const No = {
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
}, nn = /* @__PURE__ */ new WeakMap();
function wt(e, t, n) {
  let r = nn.get(e);
  r || nn.set(e, r = /* @__PURE__ */ new Map());
  let o = r.get(t);
  if (!o) {
    const s = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, l) => i[l + 1] = a), o = e.createPeriodicWave(s, i), r.set(t, o);
  }
  return o;
}
const rn = /* @__PURE__ */ new WeakMap();
function On(e) {
  let t = rn.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let r = 1;
    for (let o = 0; o < n.length; o++)
      r = r * 16807 % 2147483647, n[o] = r / 2147483647 * 2 - 1;
    rn.set(e, t);
  }
  return t;
}
function q(e, t, n, r = 0) {
  const o = e.createOscillator();
  return typeof t == "string" ? o.type = t : o.setPeriodicWave(t), o.frequency.value = n, o.detune.value = r, o;
}
function fe(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ee(e, t, n, r = 0.7) {
  const o = e.createBiquadFilter();
  return o.type = t, o.frequency.value = Math.min(n, e.sampleRate / 2 - 100), o.Q.value = r, o;
}
function Te(e, t, n, r, o, s) {
  const i = q(e, "sine", r), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + s), a.gain.linearRampToValueAtTime(o, n + s + 0.4), i.connect(a);
  for (const l of t) a.connect(l.detune);
  return i;
}
function xt(e, t, n, r, o, s) {
  const i = e.createBufferSource();
  i.buffer = On(e);
  const a = ee(e, "bandpass", r, 1.2), l = e.createGain();
  return l.gain.setValueAtTime(o, n), l.gain.setTargetAtTime(0, n, s), i.connect(a).connect(l).connect(t), i;
}
const tt = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), on = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [sn(q(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [sn(q(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, r, o, s) {
      const i = wt(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ee(e, "lowpass", Math.min(n * (5 + 7 * o), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), r + 0.01, tt(s, 0.35)), a.connect(t);
      const l = q(e, i, n, -1.5), f = q(e, i, n, 1.5), h = fe(e, 0.5);
      l.connect(h), f.connect(h), h.connect(a);
      const b = xt(e, t, r, Math.min(n * 6, 7e3), 0.12 * o, 8e-3);
      return [l, f, b];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, r, o, s) {
      const i = q(e, "sine", n), a = q(e, "sine", n), l = e.createGain(), f = n * (1.2 + 2.2 * o);
      l.gain.setValueAtTime(f, r), l.gain.setTargetAtTime(n * 0.25, r, tt(s, 0.25)), a.connect(l).connect(i.frequency);
      const h = ee(e, "highpass", 25, 0.7);
      h.connect(t);
      const b = q(e, "sine", n * 4), k = e.createGain();
      return k.gain.setValueAtTime(0.18 * o, r), k.gain.setTargetAtTime(0, r, 0.06), b.connect(k).connect(h), i.connect(h), [i, a, b];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, r) {
      const o = ee(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      o.connect(t);
      const s = [-9, 0, 8].map((a) => q(e, "sawtooth", n, a));
      for (const a of s) a.connect(o);
      const i = Te(e, s, r, 5.3, 7, 0.3);
      return [...s, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, r) {
      const o = Math.min(n * 3 + 500, 4500), s = ee(e, "lowpass", o, 0.8);
      s.connect(t);
      const i = q(e, "sine", 0.25), a = fe(e, o * 0.3);
      i.connect(a).connect(s.frequency);
      const l = [q(e, "sawtooth", n, -12), q(e, "sawtooth", n, 11), q(e, "triangle", n / 2)];
      for (const f of l) f.connect(s);
      return [...l, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, r) {
      const o = wt(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), s = q(e, o, n), i = q(e, "sine", n / 2), a = fe(e, 0.35);
      i.connect(a).connect(t), s.connect(t);
      const l = Te(e, [s, i], r, 6.6, 4, 0), f = xt(e, t, r, 3e3, 0.05, 4e-3);
      return [s, i, l, f];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, r) {
      const o = wt(e, "flute", [1, 0.13, 0.06, 0.02]), s = q(e, o, n);
      s.connect(t);
      const i = e.createBufferSource();
      i.buffer = On(e), i.loop = !0;
      const a = ee(e, "bandpass", Math.min(n * 2, 8e3), 1.5), l = fe(e, 0.06);
      i.connect(a).connect(l).connect(t);
      const f = Te(e, [s], r, 4.9, 9, 0.25);
      return [s, i, f];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, r) {
      const o = q(e, "sawtooth", n), s = ee(e, "lowpass", 5e3, 0.5);
      o.connect(s);
      for (const [l, f, h] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const b = ee(e, "bandpass", l, f), k = fe(e, h);
        s.connect(b).connect(k).connect(t);
      }
      const i = fe(e, 0.15);
      s.connect(i).connect(t);
      const a = Te(e, [o], r, 5.4, 18, 0.22);
      return [o, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, r, o, s) {
      const i = ee(e, "lowpass", Math.min(n * (6 + 6 * o), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), r + 5e-3, tt(s, 0.12)), i.connect(t);
      const a = q(e, "sawtooth", n), l = q(e, "triangle", n, 4);
      a.connect(i), l.connect(i);
      const f = xt(e, t, r, Math.min(n * 8, 8e3), 0.1 * o, 5e-3);
      return [a, l, f];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(e, t, n, r) {
      const o = ee(e, "lowpass", Math.min(n * 8, 7e3), 2);
      o.frequency.setTargetAtTime(Math.min(n * 4, 4e3), r + 0.02, 0.2), o.connect(t);
      const s = q(e, "square", n), i = q(e, "sawtooth", n, 6);
      s.connect(o), i.connect(o);
      const a = Te(e, [s, i], r, 5.6, 10, 0.3);
      return [s, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, r) {
      const o = q(e, "sine", n), s = q(e, "triangle", n), i = fe(e, 0.5);
      o.connect(t), s.connect(i).connect(t);
      const a = q(e, "sawtooth", n), l = ee(e, "lowpass", Math.min(n * 6, 2500), 1);
      l.frequency.setTargetAtTime(n * 2, r + 0.01, 0.12);
      const f = fe(e, 0.25);
      return a.connect(l).connect(f).connect(t), [o, s, a];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(e, t, n, r, o, s) {
      const i = q(e, "sine", n), a = q(e, "sine", n * 3.5), l = e.createGain();
      return l.gain.setValueAtTime(n * (1 + 1.5 * o), r), l.gain.setTargetAtTime(0, r, 0.05), a.connect(l).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function sn(e, t) {
  return e.connect(t), e;
}
function ni(e, t, n, r, o, { velocity: s = 0.8, level: i = 1 } = {}) {
  const a = on[n] ?? on.plain, l = Ao(r), f = a.sustain === 0 ? tt(r, a.decay) : a.decay, h = i * No[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, s))), b = e.createGain();
  b.gain.setValueAtTime(0, o), b.gain.linearRampToValueAtTime(h, o + a.attack), b.gain.setTargetAtTime(h * a.sustain, o + a.attack, f), b.connect(t);
  const k = a.build(e, b, l, o, s, r);
  for (const E of k) E.start(o);
  let _ = !1, R = !1;
  const S = (E) => {
    for (const W of k)
      try {
        W.stop(E);
      } catch {
      }
  };
  return k[0].onended = () => {
    R = !0, b.disconnect();
  }, a.sustain === 0 && S(o + a.attack + f * 7), {
    release(E) {
      if (_ || R) return;
      _ = !0;
      const W = Math.max(E, o + a.attack);
      b.gain.setTargetAtTime(0, W, a.release), S(W + a.release * 7);
    },
    stop() {
      if (R) return;
      R = !0, _ = !0;
      const E = e.currentTime;
      try {
        b.gain.cancelScheduledValues(E), b.gain.setValueAtTime(0, E);
      } catch {
      }
      S(E), b.disconnect();
    }
  };
}
const ri = 12, Qe = { width: 640, height: 420 }, qo = { width: 1280, height: 900 }, Rn = 120, Dn = 720, Pn = 0.25, Bn = 0.85, Hn = 160, Wn = 460, Fn = "plenio.sheet.dialog";
function Ie(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function To(e, t) {
  const n = Ie(e.width, Qe.width, Math.max(Qe.width, t.width - 16)), r = Ie(e.height, Qe.height, Math.max(Qe.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(r) };
}
function oi(e, t) {
  return Math.round(Ie(e + t, Rn, Dn));
}
function si(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? an(e) : an(e + t / n);
}
function an(e) {
  return Math.round(Ie(e, Pn, Bn) * 1e3) / 1e3;
}
function ii(e, t) {
  return Math.round(Ie(e + t, Hn, Wn));
}
function ai(e, t, n) {
  const r = e.clientX, o = e.clientY, s = e.currentTarget;
  let i = !1;
  try {
    s?.setPointerCapture?.(e.pointerId);
  } catch {
  }
  const a = () => {
    if (!i) {
      i = !0;
      try {
        s?.releasePointerCapture?.(e.pointerId);
      } catch {
      }
      window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", a), window.removeEventListener("pointercancel", a), window.removeEventListener("blur", a), n?.();
    }
  }, l = (f) => {
    if (f.buttons === 0) {
      a();
      return;
    }
    t({ dx: f.clientX - r, dy: f.clientY - o });
  };
  window.addEventListener("pointermove", l), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function zo() {
  return { ...qo, maximized: !1 };
}
function li(e = Gn()) {
  const t = zo();
  try {
    const n = e?.getItem(Fn);
    if (!n) return t;
    const r = JSON.parse(n);
    return { ...To(
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
function ci(e, t = Gn()) {
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
function jn(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function Vn() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function Co(e) {
  const t = Vn(), n = typeof e == "object" && e !== null ? e : {}, r = (o, s, i) => s.includes(o) ? o : i;
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
function Io() {
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
    record: Vn(),
    midiInput: "all"
  };
}
function Oo(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function ui(e = Yn()) {
  const t = Io();
  try {
    const n = e?.getItem(Xn);
    if (!n) return t;
    const r = JSON.parse(n);
    return {
      ...Oo(r),
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
      rollHeight: typeof r.rollHeight == "number" && r.rollHeight >= Rn && r.rollHeight <= Dn ? Math.round(r.rollHeight) : t.rollHeight,
      notationShare: typeof r.notationShare == "number" && r.notationShare >= Pn && r.notationShare <= Bn ? r.notationShare : t.notationShare,
      sideWidth: typeof r.sideWidth == "number" && r.sideWidth >= Hn && r.sideWidth <= Wn ? Math.round(r.sideWidth) : t.sideWidth,
      metronome: r.metronome === !0,
      hear: r.hear === "notes" || r.hear === "source" ? r.hear : t.hear,
      sourceLevel: typeof r.sourceLevel == "number" && r.sourceLevel >= 0 && r.sourceLevel <= 1 ? r.sourceLevel : t.sourceLevel,
      audition: r.audition !== !1,
      rowHeight: typeof r.rowHeight == "number" && r.rowHeight >= 6 && r.rowHeight <= 28 ? Math.round(r.rowHeight) : t.rowHeight,
      follow: r.follow !== !1,
      sung: r.sung !== !1,
      wave: r.wave !== !1,
      sounds: Lo(r.sounds),
      paper: r.paper === "letter" ? "letter" : "a4",
      notationSize: jn(r.notationSize) ? r.notationSize : t.notationSize,
      record: Co(r.record),
      midiInput: typeof r.midiInput == "string" && r.midiInput ? r.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function di(e, t = Yn()) {
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
function Un(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: jn(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function Ro(e) {
  return Un(e?.plenio_notation);
}
async function Do(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return Un(n.jobs);
}
async function Po(e, t) {
  const n = await t.draw(e.display_abc, e.title, e.paper, e.size), r = new ArrayBuffer(n.length);
  new Uint8Array(r).set(n);
  const o = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([r], { type: "application/pdf" })
  }), s = await o.json().catch(() => ({}));
  if (!o.ok)
    throw new De(s.error?.message ?? `Saving the sheet music failed (${o.status})`, s.error?.hint ?? null);
  return { file: s.file ?? e.file, bytes: s.bytes ?? n.length };
}
let ln = Promise.resolve();
function Bo(e) {
  const t = ln.then(e, e);
  return ln = t.catch(() => {
  }), t;
}
class Ho {
  constructor(t, n) {
    this.host = t, this.report = n;
  }
  host;
  report;
  seen = /* @__PURE__ */ new Set();
  take(t, n = !1) {
    const r = [];
    for (const o of t)
      this.seen.has(o.token) || (this.seen.add(o.token), r.push(
        Bo(() => Po(o, this.host)).then(
          (s) => this.report({ job: o, saved: s }),
          (s) => {
            const i = s instanceof De && /can no longer be saved/.test(s.message);
            this.report({ job: o, error: s, quiet: n && i });
          }
        )
      ));
    return r;
  }
  /** Ask the server for the jobs still waiting and draw the new ones (a failed request draws nothing). */
  async recover() {
    let t = [];
    try {
      t = await Do(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const Ct = "plenio.sheet_state/1", at = ["title", "style", "lyrics", "score", "artwork_prompt"];
function lt() {
  return { schema: Ct, docs: {} };
}
function $e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return lt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ct || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function st(e) {
  const t = {};
  for (const r of at) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: Ct, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function _t(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Wo(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = at.filter((r) => _t(e, r) !== "auto").map(
    (r) => r === "lyrics" && _t(e, r) === "manual" ? "lyrics: yours (manual)" : `${r.replace("_", " ")} ${_t(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function fi(e) {
  const t = e.harmony?.after;
  if (!t) return "";
  const n = (o) => `${Math.round(o * 100)} %`, r = [
    `melody ${n(t.melody_on_chord)} on chord tones`,
    `${t.accented_avoid} accented clash${t.accented_avoid === 1 ? "" : "es"} with a chord`,
    `${t.clashes} between voice and line`,
    `chords ${n(t.chords_in_key)} in the key`
  ];
  return `Harmony check (${e.harmony?.genre ?? "pop"}): ${r.join(" · ")}`;
}
const pi = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function hi(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, r]) => r > 1 ? `${n} (${r} times)` : n);
}
function mi(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function cn(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), r = Math.round(t - n * 60);
  return `${n}:${String(r).padStart(2, "0")}`;
}
function gi(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const o = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: cn(o?.[0] ?? 0), end: cn(s?.[1] ?? e.duration_s) };
  }) : [];
}
function ve(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((o) => o.replace(/\s+$/, ""));
  let n = 0, r = t.length;
  for (; n < r && !t[n]; ) n++;
  for (; r > n && !t[r - 1]; ) r--;
  return t.slice(n, r).join(`
`);
}
function Fo(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function bi(e, t, n) {
  return n.map((r) => ({ kind: r, text: Fo(e, t, r), intent: "keep" }));
}
function Qn(e, t, n) {
  const r = { ...e.docs };
  for (const s of n) {
    const i = e.docs[s.kind], a = t?.docs[s.kind], l = ve(s.text);
    if (s.intent === "auto")
      delete r[s.kind];
    else if (s.intent === "manual")
      r[s.kind] = { state: "manual", text: l };
    else if (s.intent === "rebase")
      a?.upstream_sha256 ? r[s.kind] = { state: "edited", text: l, base_sha256: a.upstream_sha256 } : r[s.kind] = { state: "manual", text: l };
    else if (i)
      ve(i.text) !== l && (r[s.kind] = { ...i, text: l });
    else {
      const f = ve(a?.upstream ?? "");
      if (l === f) continue;
      r[s.kind] = a?.upstream_sha256 ? { state: "edited", text: l, base_sha256: a.upstream_sha256 } : { state: "manual", text: l };
    }
  }
  const o = { ...lt(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function Go(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function jo(e, t) {
  return at.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Vo(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Xo = "PlenioSongSheet";
function Be(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function Jn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const r = e.graph, o = r?.links, s = r?.getLink?.(n) ?? (o instanceof Map ? o.get(n) : o?.[String(n)]);
    return s && r?.getNodeById ? r.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function Kn(e, t) {
  const n = (e.inputs ?? []).findIndex((r) => r.name === t && r.link != null);
  return n < 0 ? null : Jn(e, n);
}
function Zn(e, t) {
  const n = Kn(e, t);
  return n && (n.comfyClass ?? n.type) === Xo && Be(n) ? n : null;
}
function Yo(e) {
  return Zn(e, "context_lyrics");
}
function Uo(e) {
  return Zn(e, "context_score");
}
function Qo(e, t, n) {
  const r = [], o = Kn(t, n);
  o && r.push(o);
  const s = /* @__PURE__ */ new Set();
  for (; r.length && s.size < 1e3; ) {
    const i = r.shift(), a = String(i.id);
    if (!s.has(a)) {
      if (s.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((l, f) => {
        const h = Jn(i, f);
        h && r.push(h);
      });
    }
  }
  return !1;
}
function Jo(e, t, n) {
  const r = Yo(e), o = t?.context?.lyrics;
  if (!r || !o) return null;
  const s = r.title || "Song Sheet", i = $e(Be(r)?.value), a = i?.docs.lyrics?.text ?? n(String(r.id))?.docs.lyrics?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${s} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(o) && (l = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: r, target: { title: s, blocked: l, replans: Qo(r, e, "score") } };
}
function Ko(e, t, n) {
  const r = Be(e);
  if (!r) return;
  const o = $e(r.value) ?? lt();
  r.value = st(Qn(o, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Zo(e, t, n) {
  const r = Uo(e), o = t?.context?.score;
  if (!r || !o) return null;
  const s = r.title || "Song Sheet", i = $e(Be(r)?.value), a = i?.docs.score?.text ?? n(String(r.id))?.docs.score?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${s} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(o) && (l = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: r, target: { title: s, blocked: l } };
}
function es(e, t) {
  const n = String(e.widgets?.find((r) => r.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function ts(e, t, n, r = null) {
  const o = Be(e);
  if (!o) return null;
  const s = $e(o.value) ?? lt(), i = Qn(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (o.value = st(i), e.setDirtyCanvas?.(!0, !0), !r || !n) return i;
  try {
    const a = await wr(r.fetcher, {
      sheet_state: i,
      upstream: Vo(n),
      owned: n.owned,
      review: es(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!a.findings.some((h) => h.severity === "error") || !a.fingerprint) return i;
    const f = Go(i, a.fingerprint);
    return o.value = st(f), e.setDirtyCanvas?.(!0, !0), f;
  } catch {
    return i;
  }
}
const er = "PLENIO_SHEET_STATE", un = 68;
let nt = null;
function ns(e) {
  nt = e;
}
const rs = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.className = "plenio-sheet-open", i.textContent = "Edit Song Sheet…";
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", o.append(i, s, a);
  let l = !1;
  const f = () => {
    const S = xe(String(e.id)), E = Et(e);
    s.textContent = Wo($e(r)) + (S && E !== "approved" ? ` · ${S.status}` : ""), a.textContent = fo(E), a.dataset.state = E ?? "";
    const W = l ? null : e.widgets?.find((u) => u.name === "review");
    if (W) {
      l = !0;
      const u = W.callback;
      W.callback = (H) => {
        u?.(H), f();
      };
    }
  }, h = e.addDOMWidget(t, er, o, {
    getValue: () => r,
    setValue: (S) => {
      r = typeof S == "string" ? S : "", f();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => un,
    getMaxHeight: () => un
  });
  i.addEventListener("click", (S) => {
    S.stopPropagation(), b().catch((E) => {
      console.error("Plenio: the Song Sheet editor could not open", E), s.textContent = `The editor could not open: ${E instanceof Error ? E.message : String(E)}`;
    });
  });
  async function b() {
    const S = $e(r);
    S === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const E = xe(String(e.id)), u = (e.inputs ?? []).filter((N) => N.link != null).map((N) => N.name), H = S ?? { schema: "plenio.sheet_state/1", docs: {} }, $ = E?.owned ?? jo(u, H), g = String(e.widgets?.find((N) => N.name === "review")?.value ?? "continue"), m = g === "as the brief says" ? E?.review ?? "continue" : g, { openSheetDialog: y } = await import("./open-D8w0w_G1.mjs"), { parseGuide: v, serializeGuide: T } = await import("./tracks-DxmZeggM.mjs"), { parseShift: M, parseSpans: V } = await import("./lyricPlacement-rAf-x_fn.mjs");
    if (!nt) throw new Error("Plenio: API not initialised");
    let L = null;
    try {
      L = Jo(e, E, xe);
    } catch (N) {
      console.warn("Plenio: the lyrics sheet of this score was not found", N);
    }
    let D = null;
    try {
      D = Zo(e, E, xe);
    } catch (N) {
      console.warn("Plenio: the score sheet of these lyrics was not found", N);
    }
    const F = nt;
    y({
      title: e.title || "Song Sheet",
      state: H,
      payload: E,
      asrNote: lo(E?.docs.lyrics?.upstream_sha256),
      owned: $.length ? $ : [...at],
      review: m,
      fetcher: nt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: v(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: V(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: M(e.properties?.plenio_source_shift),
      lyricsTarget: L?.target ?? null,
      scoreTarget: D?.target ?? null,
      onApply: (N, P, ne, X, z, C) => {
        const ue = String(h.value ?? "");
        if (h.value = st(N), e.properties = {
          ...e.properties ?? {},
          plenio_guide: T(P),
          plenio_lyric_spans: (C?.lyricSpans ?? []).map((re) => [...re]),
          plenio_source_shift: C?.sourceShift ?? 0
        }, z ? Ee(e, "approved") : String(h.value) !== ue && k(e), ne !== null && L && !L.target.blocked && (Ko(L.owner, ne, xe(String(L.owner.id))), k(L.owner)), X && D && !D.target.blocked) {
          const re = D.owner;
          ts(re, X.text, xe(String(re.id)), X.approved ? { fetcher: F } : null).then(
            (He) => {
              He?.review?.approved_fingerprint ? Ee(re, "approved") : k(re);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function k(S) {
    qn(S) === "approved" && Ee(S, null);
  }
  const _ = [
    io((S) => {
      S === String(e.id) && f();
    }),
    mo((S) => {
      (S === null || S === e) && f();
    })
  ], R = e.onRemoved;
  return e.onRemoved = function() {
    for (const S of _) S();
    R?.call(this);
  }, f(), { widget: h };
}, Oe = "plenio.stem_mix/1", Me = "rest", os = ["reverb", "delay"], tr = -60, ss = 12;
function is() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function te(e, t) {
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
function nr(e) {
  const t = is();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const as = ["vocals", "drums", "bass", "other"];
function ls() {
  return [...as, Me];
}
function cs(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Oe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Oe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function us(e) {
  const t = {};
  for (const r of Object.keys(e.strips)) {
    if (!r || nr(te(e, r))) continue;
    const o = {}, s = te(e, r);
    s.gain_db && (o.gain_db = s.gain_db), s.mute && (o.mute = !0), s.solo && (o.solo = !0), s.compression && (o.compression = s.compression), s.muted.length && (o.muted = s.muted), s.reverb && (o.reverb = s.reverb), s.delay && (o.delay = s.delay), s.save && (o.save = !0), t[r] = o;
  }
  const n = { schema: Oe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function it(e, t, n) {
  const r = { ...e.strips };
  return nr(n) ? delete r[t] : r[t] = n, { ...e, strips: r };
}
function ds(e, t, n) {
  const r = n.some((s) => te(e, s).solo), o = te(e, t);
  return r ? o.solo : !o.mute;
}
function dn(e) {
  return e <= tr ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function fs(e, t = null) {
  const n = e.filter((o) => Array.isArray(o) && o.length === 2 && Number.isFinite(o[0]) && Number.isFinite(o[1])).map((o) => [Math.max(0, Math.min(o[0], o[1])), Math.max(o[0], o[1])]).filter((o) => o[1] - o[0] > 1e-6).sort((o, s) => o[0] - s[0]), r = [];
  for (const o of n) {
    const s = r[r.length - 1];
    s && o[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], o[1]) : r.push([...o]);
  }
  return t !== null && t > 0 ? r.map(([o, s]) => [Math.min(o, t), Math.min(s, t)]).filter(([o, s]) => s - o > 1e-6) : r;
}
function ps(e, t, n) {
  return fs([...e, [t, n]]);
}
function hs(e, t) {
  return e.findIndex(([n, r]) => n <= t && t <= r);
}
function ms(e, t) {
  return t < 0 ? e : e.filter((n, r) => r !== t);
}
function gs(e, t, n, r) {
  const o = te(e, t);
  return it(e, t, { ...o, muted: ps(o.muted, n, r) });
}
function bs(e, t, n) {
  const r = te(e, t), o = hs(r.muted, n);
  return o < 0 ? e : it(e, t, { ...r, muted: ms(r.muted, o) });
}
function ys(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const r = {};
  for (const [o, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (r[o] = s.map((i) => Math.abs(Number(i) || 0)));
  return r;
}
function vs(e, t, n = 200) {
  const r = e[t];
  return r?.length ? r.length === n ? r : Array.from({ length: n }, (o, s) => r[Math.floor(s * r.length / n)] ?? 0) : new Array(n).fill(0);
}
function fn(e, t) {
  const r = (Array.isArray(t?.stems) && t.stems.length ? t.stems : ls()).filter((s) => s !== Me), o = Object.keys(e?.strips ?? {}).filter((s) => s !== Me && !r.includes(s));
  return [...r, ...o, Me];
}
const pn = "plenio_stem_mixer", hn = "mix", pe = 200, ws = ["room", "plate", "hall"];
function O(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function Je(e, t, n, r, o) {
  const s = O("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(r), s.setAttribute("aria-label", o), s;
}
function xs(e) {
  const t = O("div", "plenio-mix"), n = O("div", "plenio-mix-strips"), r = O("div", "plenio-mix-buses"), o = O("div", "plenio-mix-info"), s = O("div", "plenio-mix-advanced");
  t.append(n, r, s, o);
  let i = {
    mix: { schema: Oe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: fn(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const l = () => e.widgets?.find((g) => g.name === hn);
  function f(g, { draw: m = !0 } = {}) {
    const y = l();
    if (!y) return;
    const v = us(g);
    y.value = v, y.callback?.(v), i = { ...i, mix: g }, m && _();
  }
  function h(g, m, y = {}) {
    f(it(i.mix, g, { ...te(i.mix, g), ...m }), y);
  }
  function b(g, m, y, v = {}) {
    const T = te(i.mix, g);
    let M = it(i.mix, g, { ...T, [m]: y });
    y > 0 && !(M[m] && Object.keys(M[m]).length) && (M = m === "reverb" ? { ...M, reverb: { preset: "room" } } : { ...M, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), f(M, v);
  }
  function k(g, m, y) {
    const v = { ...i.mix[g] ?? {} };
    f({ ...i.mix, [g]: { ...v, [m]: y } });
  }
  function _() {
    n.replaceChildren();
    const g = i.names;
    for (const m of i.names) {
      const y = te(i.mix, m), v = O("div", "plenio-mix-strip");
      v.dataset.strip = m;
      const T = O("span", "name", m === Me ? `${m} (missed)` : m);
      T.title = m === Me ? "What the separator missed: keeps a neutral mix exact" : "";
      const M = Je(tr, ss, 0.5, y.gain_db, `${m} gain`), V = O("span", "gain", `${dn(y.gain_db)} dB`);
      M.addEventListener("input", () => {
        V.textContent = `${dn(Number(M.value))} dB`, h(m, { gain_db: Number(M.value) }, { draw: !1 });
      }), M.addEventListener("change", () => h(m, { gain_db: Number(M.value) }));
      const L = O("button", y.mute ? "toggle active" : "toggle", "M");
      L.setAttribute("aria-label", `${m} mute`), L.addEventListener("click", (z) => {
        z.stopPropagation(), h(m, { mute: !y.mute });
      });
      const D = O("button", y.solo ? "toggle active" : "toggle", "S");
      D.setAttribute("aria-label", `${m} solo`), D.addEventListener("click", (z) => {
        z.stopPropagation(), h(m, { solo: !y.solo });
      });
      const F = Je(0, 1, 0.05, y.compression, `${m} compression`);
      F.title = "Compression amount: one knob for the master compressor (threshold and ratio)", F.addEventListener("input", () => h(m, { compression: Number(F.value) }, { draw: !1 })), F.addEventListener("change", () => h(m, { compression: Number(F.value) }));
      const N = os.map((z) => {
        const C = Je(0, 1, 0.05, y[z], `${m} ${z} send`);
        return C.title = `${z} send: how much of this stem goes to the shared ${z} bus`, C.addEventListener("input", () => b(m, z, Number(C.value), { draw: !1 })), C.addEventListener("change", () => b(m, z, Number(C.value))), C;
      }), P = O("button", y.save ? "toggle active" : "toggle", "save");
      P.setAttribute("aria-label", `${m} save as its own file`), P.setAttribute("aria-pressed", String(y.save)), P.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", P.addEventListener("click", (z) => {
        z.stopPropagation(), h(m, { save: !y.save });
      });
      const ne = ds(i.mix, m, g);
      v.classList.toggle("silent", !ne);
      const X = O("canvas", "plenio-mix-wave");
      X.width = pe, X.height = 26, X.setAttribute("aria-label", `${m} waveform (drag to mute a time range)`), R(X, y, vs(i.peaks, m, pe)), X.addEventListener("pointerdown", (z) => S(z, X, m)), v.append(
        T,
        M,
        V,
        L,
        D,
        O("span", "label", "comp"),
        F,
        O("span", "label", "verb"),
        N[0],
        O("span", "label", "delay"),
        N[1],
        P,
        X
      ), n.append(v);
    }
    E(), o.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function R(g, m, y) {
    const v = g.getContext("2d");
    if (!v) return;
    v.clearRect(0, 0, pe, g.height);
    const T = g.height / 2;
    v.strokeStyle = "rgba(180, 190, 205, 0.8)", v.beginPath();
    for (let M = 0; M < y.length; M++) {
      const V = Math.max(1, y[M] * (T - 1));
      v.moveTo(M + 0.5, T - V), v.lineTo(M + 0.5, T + V);
    }
    v.stroke(), v.fillStyle = "rgba(224, 104, 94, 0.35)", v.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [M, V] of m.muted) {
      const L = Math.max(0, Math.min(pe, M / Math.max(i.seconds, 1e-6) * pe)), D = Math.max(0, Math.min(pe, V / Math.max(i.seconds, 1e-6) * pe));
      v.fillRect(L, 0, Math.max(1, D - L), g.height), v.strokeRect(L + 0.5, 0.5, Math.max(1, D - L) - 1, g.height - 1);
    }
  }
  function S(g, m, y) {
    if (g.preventDefault(), g.stopPropagation(), !i.seconds) return;
    const v = m.getBoundingClientRect(), T = (N) => Math.max(0, Math.min(1, (N - v.left) / (v.width || pe))) * i.seconds, M = T(g.clientX);
    if (te(i.mix, y).muted.some(([N, P]) => N <= M && M <= P)) {
      f(bs(i.mix, y, M));
      return;
    }
    let L = M;
    const D = (N) => {
      L = T(N.clientX);
    }, F = () => {
      window.removeEventListener("pointermove", D), window.removeEventListener("pointerup", F), f(gs(i.mix, y, Math.min(M, L), Math.max(M, L)));
    };
    window.addEventListener("pointermove", D), window.addEventListener("pointerup", F);
  }
  function E() {
    r.replaceChildren();
    const g = { preset: "room", ...i.mix.reverb ?? {} }, m = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, y = O("select");
    y.setAttribute("aria-label", "Reverb preset"), y.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const M of ws) y.append(new Option(M, M));
    y.value = String(g.preset ?? "room"), y.addEventListener("change", () => k("reverb", "preset", y.value));
    const v = O("input");
    v.type = "number", v.value = String(m.time_ms ?? 375), v.setAttribute("aria-label", "Delay time in ms"), v.title = "Delay time in ms: where the first echo of the delay bus sits", v.addEventListener("change", () => k("delay", "time_ms", Number(v.value)));
    const T = Je(0, 0.8, 0.05, Number(m.feedback ?? 0.35), "Delay feedback");
    T.title = "Delay feedback: how much of each echo returns into the delay line", T.addEventListener("input", () => k("delay", "feedback", Number(T.value))), r.append(
      O("span", "label", "reverb bus"),
      y,
      O("span", "label", "delay bus"),
      v,
      O("span", "label", "ms, feedback"),
      T
    ), r.style.display = "flex";
  }
  const W = e.addDOMWidget(pn, pn, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  const u = e.widgets?.find((g) => g.name === hn), H = O("button", "toggle", "JSON");
  H.title = "Show or hide the raw mixer value", H.addEventListener("click", (g) => {
    g.stopPropagation(), a = !a, H.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(O("span", "label", "Advanced"), H), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function $() {
    const g = cs(l()?.value);
    i = { ...i, mix: g ?? { schema: Oe, strips: {} } }, g || (o.textContent = "the mixer value is not readable; it will be replaced on the next edit"), _();
  }
  return $(), {
    showExecuted(g) {
      const m = g?.plenio_stems?.at(-1), y = ys(g), v = fn(i.mix, m ?? null);
      i = { ...i, names: v, peaks: y, seconds: Number(m?.seconds ?? i.seconds) || 0 }, $();
    }
  };
}
const _s = `
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
function Ss() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = _s, document.head.append(e);
}
function Mt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ke(e) {
  return Mt(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function ks(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Es(e) {
  const t = [];
  let n = !1, r = null, o = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (o) {
      const [a, ...l] = o, f = (h, b) => `<tr>${h.map((k) => `<${b}>${Ke(k)}</${b}>`).join("")}</tr>`;
      t.push(`<table><thead>${f(a, "th")}</thead><tbody>${l.map((h) => f(h, "td")).join("")}</tbody></table>`), o = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${Mt(r.join(`
`))}</code></pre>`), r = null) : r.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      s();
      const h = ks(a);
      h && (o ??= []).push(h);
      continue;
    }
    if (i(), a.startsWith("```")) {
      s(), r = [];
      continue;
    }
    const l = /^(#{1,4})\s+(.*)$/.exec(a);
    if (l) {
      s();
      const h = Math.min(l[1].length + 2, 6);
      t.push(`<h${h}>${Ke(l[2])}</h${h}>`);
      continue;
    }
    const f = /^\s*[-*]\s+(.*)$/.exec(a);
    if (f) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Ke(f[1])}</li>`);
      continue;
    }
    s(), a.trim() && t.push(`<p>${Ke(a)}</p>`);
  }
  return s(), i(), r !== null && t.push(`<pre><code>${Mt(r.join(`
`))}</code></pre>`), t.join("");
}
const ze = "plenio_summary", mn = "plenio_summary", gn = 84, Ms = 18, As = 55, $s = 16;
function Ls(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, r) => n + Math.max(1, Math.ceil(r.length / As)), 0);
  return $s + t * Ms;
}
function Ns(e, t) {
  const n = e.widgets?.find((s) => s.name === mn);
  if (n?.element) return n.element;
  const r = document.createElement("div");
  r.className = "plenio-summary";
  const o = e.addDOMWidget(mn, "plenio_summary", r, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => gn,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(gn, r.scrollHeight ? r.scrollHeight + 2 : Ls(t.markdown))
  });
  return o.serialize = !1, r;
}
function qs(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const bn = /* @__PURE__ */ new WeakMap();
function At(e, t) {
  if (!t.markdown) return;
  const n = bn.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, bn.set(e, n);
  const r = Ns(e, n);
  r.dataset.status = t.status ?? "", r.innerHTML = Es(t.markdown), qs(e), e.setDirtyCanvas?.(!0, !0);
}
function yn(e, t, n, r) {
  const o = e.properties?.[ze], s = (o?.markdown ?? "").split(`
`), i = s.findIndex((l) => l.startsWith(t));
  i >= 0 ? s[i] = n : s.push(n);
  const a = { markdown: s.join(`
`).trim(), status: r ?? o?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[ze] = a, At(e, a);
}
function Ts(e) {
  e.prototype.onExecuted = le(e.prototype.onExecuted, function(t) {
    const n = t?.[ze], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[ze] = { markdown: r.markdown, status: r.status ?? "" }, At(this, r));
  }), e.prototype.onConfigure = le(e.prototype.onConfigure, function() {
    const t = this.properties?.[ze];
    t?.markdown && At(this, t);
  });
}
const zs = "Plenio.Core", ae = vr;
ns(ae);
const Re = wn, rr = () => Re.graph;
function $t(e) {
  if (e == null) return null;
  const t = String(e);
  return rr()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Cs = {
  scale: () => Re.canvas?.ds?.scale ?? 1,
  toast: (e, t) => Re.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, Is = {
  fetcher: ae,
  async draw(e, t, n, r) {
    const { notationPdf: o, renderLines: s } = await import("./notationExport-DkCMgjck.mjs").then((a) => a.c), i = s(e, t, n, r);
    try {
      if (!i.lines.length) throw new Error("the score has no music to draw");
      return await o(i.lines, n, t);
    } finally {
      i.dispose();
    }
  }
};
function Os(e, t) {
  const n = $t(e), r = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && r?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function Rs(e, t) {
  const n = `- sheet music: ${e.job.file}`, r = Os(t, e.job.file);
  if ("saved" in e) {
    r && yn(r, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), Re.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: o } = e, s = o instanceof De && o.hint ? `${o.message} ${o.hint}` : String(o instanceof Error ? o.message : o);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  r && yn(r, n, `${n} - not saved: ${s}`, "warning"), Re.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${s}`, life: 15e3 });
}
const Lt = /* @__PURE__ */ new Map(), vn = new Ho(Is, (e) => {
  Rs(e, Lt.get(e.job.token)), Lt.delete(e.job.token);
});
wn.registerExtension({
  name: zs,
  getCustomWidgets: () => ({ [er]: rs }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => ho(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ts(e), _o(e, Cs);
    const n = Wr(t.input);
    if (n.size || t.name in zt) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const s = so(t, o), i = Rr(s), a = r?.call(this, s);
        return Hr(this, i, n), oo(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = le(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) ao(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, Zr(this, ae));
      }, e.prototype.onExecuted = le(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    if (Cr.has(t.name) && Ir(e, ae), t.name === "PlenioStemMixer") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, xs(this));
      }, e.prototype.onExecuted = le(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = le(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, s = o?.[o.length - 1];
      s && en(String(this.id), s);
    }));
  },
  setup() {
    Ss(), ae.addEventListener("plenio.sheet", (t) => {
      const n = t.detail;
      if (!n?.node_id) return;
      en(String(n.node_id), n);
      const r = $t(n.node_id);
      r && Ee(r, Nn(n));
    }), ae.addEventListener("execution_start", () => {
      po(rr()?.nodes ?? []);
    }), ae.addEventListener("execution_error", (t) => {
      const n = $t(t.detail?.node_id);
      n && String(n.type).startsWith("Plenio") && Ee(n, "error");
    }), ae.addEventListener("executed", (t) => {
      const n = t.detail, r = Ro(n?.output), o = n?.display_node ?? n?.node;
      for (const s of r) Lt.set(s.token, o);
      vn.take(r);
    });
    const e = () => {
      vn.recover();
    };
    ae.addEventListener("reconnected", e), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  ci as $,
  Pn as A,
  ai as B,
  oi as C,
  an as D,
  ii as E,
  Gs as F,
  Fs as G,
  di as H,
  $o as I,
  ve as J,
  Xs as K,
  si as L,
  bi as M,
  Bn as N,
  li as O,
  De as P,
  Bs as Q,
  Dn as R,
  Wn as S,
  U as T,
  pi as U,
  mi as V,
  fi as W,
  wr as X,
  Vo as Y,
  Go as Z,
  To as _,
  Vs as a,
  gi as a0,
  Qn as a1,
  st as a2,
  hi as a3,
  ri as a4,
  zs as a5,
  Hs as b,
  Qs as c,
  In as d,
  Us as e,
  Ao as f,
  Zs as g,
  ei as h,
  js as i,
  Js as j,
  Ks as k,
  ot as l,
  ko as m,
  we as n,
  ti as o,
  Ys as p,
  Vn as q,
  Ue as r,
  ni as s,
  Ws as t,
  Lo as u,
  Co as v,
  jn as w,
  ui as x,
  Rn as y,
  Hn as z
};
