import { api as kr } from "../../../../scripts/api.js";
import { app as _n } from "../../../../scripts/app.js";
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
function Er(e, t) {
  return ce(e, "/plenio/sheet/resolve", t);
}
async function Xs(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Tt(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Ys(e, t, n, r) {
  return ce(e, "/plenio/score/analyze", Tt({ abc: t }, n, r));
}
function Us(e, t, n, r, o) {
  return ce(e, "/plenio/score/transform", Tt({ abc: t, operation: n }, r, o));
}
function Qs(e, t) {
  const { lyrics: n, spans: r, ...o } = t;
  return ce(e, "/plenio/score/musicxml/export", Tt(o, n, r));
}
function Js(e, t) {
  return ce(e, "/plenio/score/midi/export", t);
}
function Ks(e, t) {
  return ce(e, "/plenio/score/midi/import", t);
}
function Zs(e, t) {
  return ce(e, "/plenio/lyrics/analyze", t);
}
function ei(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Ht(e, t, n, r = 200) {
  return ce(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
function Mr(e, t) {
  return ce(e, "/plenio/brief/fields", t);
}
async function Ar(e) {
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
], $r = ["length", "vocals", "melody"], Ct = {
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
}, Lr = "custom";
function Sn(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Lr;
}
function Ne(e, t) {
  const n = Ct[t];
  if (n)
    return (e.widgets ?? []).find((r) => r.name === n);
}
function Nr(e) {
  const t = {};
  for (const n of [...Pe, ...$r]) {
    const r = Ne(e, n);
    r && (t[n] = typeof r.value == "string" ? r.value : String(r.value ?? ""));
  }
  return t;
}
function qr(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function Wt(e, t) {
  const n = [];
  for (const r of t.fills) {
    if (!Pe.includes(r.field)) continue;
    const o = Ne(e, r.field);
    o && !String(o.value ?? "").trim() && r.value && n.push({ field: r.field, value: r.value });
  }
  return n;
}
function Ft(e) {
  const t = [];
  for (const n of Pe) {
    const r = Ne(e, n);
    r && String(r.value ?? "").trim() && t.push(r);
  }
  return t;
}
function kt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Tr(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((r) => `${r.field} (${Ir(r.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Cr(e) {
  const t = e ? kt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function zr(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Ir(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function jt(e, t) {
  for (const n of t) {
    const r = Ne(e, n.field);
    r && (r.value = n.value, r.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Rr(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function kn(e) {
  const t = [];
  for (const n of Pe) {
    const r = Ne(e, n);
    !r || !Sn(r.value) || (r.value = "", r.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Gt = "plenio_brief_template", Or = 400;
function Dr(e, t) {
  let n = null, r = !1, o = null, s;
  const i = document.createElement("div");
  i.className = "plenio-brief-template";
  const a = document.createElement("div");
  a.className = "line";
  const l = document.createElement("div");
  l.className = "hint";
  const f = document.createElement("div");
  f.className = "actions", i.append(a, l, f);
  const h = (g, m, b) => {
    const v = document.createElement("button");
    return v.textContent = g, v.title = m, v.addEventListener("click", (T) => {
      T.stopPropagation(), b();
    }), f.append(v), v;
  }, y = h("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (jt(e, Wt(e, n).map((g) => ({ field: g.field, value: g.value }))), S());
  }), k = h("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (jt(e, kt(n)), S());
  }), _ = h("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const g = Ft(e);
    g.length && window.confirm(`Clear ${g.length} text field(s)? The template's values apply again.`) && (Rr(e, g), S());
  }), O = h("↻", "Ask again what the template fills", () => {
    H();
  }), S = () => {
    const g = Tr(n, r);
    a.textContent = o ?? g ?? "The template fills nothing: every text field has your value.", a.dataset.state = o ? "error" : r && n ? "ok" : "empty";
    const m = Cr(n), b = zr(n);
    l.textContent = [m, b].filter(Boolean).join(" · "), l.style.display = l.textContent ? "" : "none", f.style.display = r && n && n.template !== "none" ? "" : "none", y.disabled = !n || !Wt(e, n).length, k.disabled = !n || !kt(n).length, _.disabled = !Ft(e).length, O.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, E = /* @__PURE__ */ new WeakSet(), W = () => {
    for (const g of ["template", ...Object.keys(Ct)]) {
      const m = g === "template" ? e.widgets?.find((b) => b.name === "template") : Ne(e, g);
      !m || E.has(m) || (E.add(m), m.callback = le(m.callback, () => {
        W(), H();
      }));
    }
  }, u = async () => {
    W();
    const g = String(e.widgets?.find((m) => m.name === "template")?.value ?? "none");
    try {
      n = await Mr(t, { fields: Nr(e), template: g, kind: qr(e) }), o = null;
    } catch (m) {
      n = null, o = `The template fields could not be read: ${m instanceof Error ? m.message : String(m)}`;
    }
    r = !0, S();
  };
  function H() {
    clearTimeout(s), s = setTimeout(() => {
      u();
    }, Or);
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
  return $.serialize = !1, kn(e), S(), H(), {
    widget: $,
    refresh: H,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Pr = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Br(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = e.prototype, o = r.onNodeCreated;
  r.onNodeCreated = function() {
    o?.call(this), n.set(this, Dr(this, t));
  };
  const s = r.onConfigure;
  r.onConfigure = function(i) {
    s?.call(this, i), kn(this), n.get(this)?.refresh();
  };
}
const Hr = "COMFY_DYNAMICCOMBO_V3";
function Wr(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Fr(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function jr(e, t) {
  const n = Fr(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, o) => r.value === t[o]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function Gr(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Vr(e, t, n) {
  if (!t || !e.widgets || jr(e, t)) return !1;
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
    if (n.has(s.name) && !Gr(s, i)) return !0;
    s.value !== i && (s.value = i);
  }
  return !0;
}
function Xr(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === Hr && t.add(r);
  return t;
}
const En = "plenio.eq/1", Ze = 8, me = 20, Yr = 2e4, Ae = 12, Mn = 15, ke = ["peak", "low_shelf", "high_shelf"], An = ["peak", "notch", "highpass", "lowpass"], Vt = [0.2, 10], Xt = [0.25, 1];
function _e() {
  return { schema: En, preamp_db: 0, bands: [] };
}
function Ur(e) {
  if (typeof e != "string" || !e.trim()) return _e();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: En,
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
function G(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function $n(e) {
  return e.db ?? Mn;
}
const Yt = [6, 12, 18], Qr = { 6: 8, 12: 14, 18: 20 };
function Jr(e, t) {
  return { ...e, db: Qr[t] ?? Mn };
}
function ye(e, t) {
  return Math.log(G(t, me, e.maxHz) / me) / Math.log(e.maxHz / me) * e.width;
}
function Ut(e, t) {
  return me * (e.maxHz / me) ** G(t / e.width, 0, 1);
}
function he(e, t) {
  const n = $n(e);
  return (1 - (G(t, -n, n) + n) / (2 * n)) * e.height;
}
function Qt(e, t) {
  const n = $n(e);
  return (1 - G(t / e.height, 0, 1)) * 2 * n - n;
}
function Jt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Kt(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${ye(e, r).toFixed(1)},${he(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function zt(e) {
  return Math.min(Yr, 0.45 * e);
}
function Kr(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Zr(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Ze) return null;
  const o = {
    id: Kr(e),
    enabled: !0,
    type: "peak",
    frequency_hz: Q(G(t, me, zt(r)), 1),
    gain_db: Q(G(n, -Ae, Ae), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, o] };
}
function qe(e, t, n, r, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: Q(G(n, me, zt(o)), 1),
        gain_db: ke.includes(s.type) ? Q(G(r, -Ae, Ae), 1) : s.gain_db
      }
    )
  };
}
function mt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: Q(G(r.q * n, 0.2, 10), 3) } : r)
  };
}
function gt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Te(e) {
  const t = e.frequency_hz >= 1e3 ? `${Q(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ke.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${Q(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${Q(e.q, 2)}`;
}
function eo(e, t) {
  const n = Ln[e.type] ?? e.type, r = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, o = ke.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = An.includes(e.type) ? ` Q ${Q(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${r}${o}${s}${e.enabled ? "" : " (off)"}`;
}
const Ln = {
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
  const o = Number(n) * r;
  return Number.isFinite(o) ? o : null;
}
function Ge(e, t) {
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
        frequency_hz: Q(G(Ge(s.frequency_hz, o.frequency_hz), me, zt(r)), 1),
        gain_db: Q(G(Ge(s.gain_db, o.gain_db), -Ae, Ae), 1),
        q: Q(G(Ge(s.q, o.q), Vt[0], Vt[1]), 3),
        slope: Q(G(Ge(s.slope, o.slope), Xt[0], Xt[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function Zt(e, t) {
  return et(e, t, { gain_db: 0 });
}
function en(e, t, n, { heightFraction: r = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const o = n.filter((y) => Number.isFinite(y));
  if (!o.length) return "";
  const s = Math.max(...o), i = Math.min(...o), a = Math.max(s - i, 1e-6), l = e.height - 4, f = l - Math.max(12, e.height * G(r, 0.1, 0.95));
  return `M${t.map((y, k) => {
    const _ = n[k], O = Number.isFinite(_) ? (_ - i) / a : 0;
    return `${ye(e, y).toFixed(1)},${(l - O * (l - f)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${l.toFixed(1)} L0,${l.toFixed(1)} Z`;
}
class to {
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
const no = "http://www.w3.org/2000/svg", tn = "plenio_eq_panel", Ve = "mode.bands", de = { capture: !0 }, Z = { width: 560, height: 260 }, Xe = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let yt = null;
function se(e, t) {
  const n = document.createElementNS(no, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function j(e, t, n) {
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
function ro(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, r) => {
    const o = t.bands[r];
    return o !== void 0 && n.type === o.type && n.enabled === o.enabled && Math.abs(n.frequency_hz - o.frequency_hz) < 0.5 && Math.abs(n.gain_db - o.gain_db) < 0.05 && Math.abs(n.q - o.q) < 0.01;
  });
}
function oo(e, t) {
  const n = j("div", "plenio-eq"), r = j("div", "plenio-eq-tools"), o = j("select");
  o.setAttribute("aria-label", "EQ preset"), o.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = j("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const c of Yt) s.append(new Option(`±${c} dB`, String(c)));
  const i = be("", "↶", "Undo the last band change"), a = be("", "↷", "Redo the last band change"), l = be("", "reset", "Remove every band"), f = be("", "compare", "Show the curve without the EQ (bypass)"), h = be("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), y = j("span", "plenio-eq-info");
  y.setAttribute("aria-live", "polite"), y.title = "What the panel is showing right now (the selected band, a note, or a hint)", r.append(o, s, i, a, l, f, h, y);
  const k = j("div", "plenio-eq-mode"), _ = se("svg", {
    viewBox: `0 0 ${Z.width} ${Z.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  _.setAttribute("aria-label", "EQ response curve"), _.setAttribute("tabindex", "0"), _.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const O = j("div", "plenio-eq-strip"), S = j("div", "plenio-eq-editor"), E = j("div", "plenio-eq-fields");
  S.append(E), n.append(r, k, _, O, S);
  const W = e.addDOMWidget(tn, tn, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: _e(), readonly: !0, note: "" }, H = null, $ = null, g = !1, m = 12, b = null, v = [], T = 0, M, V, D = null, R = !1;
  const P = /* @__PURE__ */ new Map();
  let F = null;
  const L = new to(_e()), ue = () => ie(e, Ve), J = () => m, N = () => Jr({ ...Z, maxHz: Math.min(2e4, u.sampleRate / 2) }, J());
  function C(c, { record: p = !0 } = {}) {
    const d = ue();
    if (!d) return;
    const w = Se(c);
    d.value = w, d.callback?.(w), p && L.push(c), u = { ...u, settings: c }, X(), ne(0);
  }
  async function ne(c = 120) {
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
        } : u = { ...u, readonly: !0 }, X();
        return;
      }
      const d = Ur(ue()?.value);
      if (!d) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, X();
        return;
      }
      Se(d) !== Se(L.current) && L.reset(d);
      const w = ++T;
      try {
        const A = await Ht(t, d, u.sampleRate);
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
      X();
    }, c);
  }
  const He = (c) => ({
    ...c.settings,
    bands: c.settings.bands.slice(0, Ze)
  });
  function re() {
    if (!b) return "";
    const c = v.find((p) => p.name === b);
    return c && ro(He(c), u.settings) ? b : "";
  }
  function X() {
    _.replaceChildren(), P.clear(), F = null;
    const c = N();
    for (const d of [-c.db, -c.db / 2, 0, c.db / 2, c.db])
      _.append(
        se("line", { x1: 0, x2: c.width, y1: he(c, d), y2: he(c, d), class: d ? "grid" : "grid zero" })
      );
    for (const d of [100, 1e3, 1e4])
      _.append(se("line", { x1: ye(c, d), x2: ye(c, d), y1: 0, y2: c.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && _.append(se("path", { d: en(c, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && _.append(se("path", { d: en(c, u.frequencies, u.afterDb), class: "spectrum after" })), g ? _.append(se("line", { x1: 0, x2: c.width, y1: he(c, 0), y2: he(c, 0), class: "curve flat" })) : u.frequencies.length && (F = se("path", { d: Kt(c, u.frequencies, u.response), class: "curve" }), _.append(F)), !u.readonly && !g && u.settings.bands.forEach((d, w) => {
      const A = Xe[w % Xe.length], z = ke.includes(d.type) ? d.gain_db : 0, x = se("circle", {
        cx: ye(c, d.frequency_hz),
        cy: he(c, z),
        r: d.id === $ ? 9 : 7,
        class: d.id === $ ? "handle selected" : "handle",
        style: `stroke: ${A}`,
        tabindex: 0,
        "data-band": d.id
      });
      x.setAttribute("aria-label", `Band ${w + 1}: ${Te(d)}`), d.enabled || x.classList.add("disabled"), x.append(se("title", {})), x.lastChild.textContent = `Band ${w + 1}: ${Te(d)}`, x.addEventListener("pointerdown", (B) => mr(B, d.id)), x.addEventListener("dblclick", (B) => {
        B.stopPropagation(), C(Zt(u.settings, d.id));
      }), x.addEventListener("focus", () => fr(d.id)), x.addEventListener("keydown", (B) => Ot(B, d.id)), x.addEventListener("wheel", (B) => {
        B.preventDefault();
        const ge = B.deltaY < 0 ? 1.15 : 1 / 1.15;
        C(mt(u.settings, d.id, ge));
      }), x.addEventListener("contextmenu", (B) => {
        B.preventDefault(), C(gt(u.settings, d.id));
      }), _.append(x), P.set(d.id, x);
    }), cr(), ur(), dr();
    const p = u.settings.bands.find((d) => d.id === $);
    y.textContent = u.note || (g ? "compare: the curve is off (the node still applies it)" : p ? Te(p) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${Ze}`), o.disabled = u.readonly, i.disabled = !L.canUndo, a.disabled = !L.canRedo, l.disabled = u.readonly || !u.settings.bands.length, R && (R = !1, $ && P.get($)?.focus({ preventScroll: !0 })), s.value = String(m), o.value = re(), f.classList.toggle("active", g), h.classList.toggle("active", dt()), e.setDirtyCanvas?.(!0, !0);
  }
  function cr() {
    if (O.replaceChildren(), u.readonly && !u.settings.bands.length) {
      O.append(j("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((c, p) => {
      const d = j("button", "plenio-eq-chip", eo(c, p));
      d.style.borderLeftColor = Xe[p % Xe.length], d.classList.toggle("selected", c.id === $), d.classList.toggle("disabled", !c.enabled), d.setAttribute("aria-label", `Edit band ${p + 1}`), d.title = `Band ${p + 1}: ${Te(c)} - click to open its fields`, d.addEventListener("click", (w) => {
        w.stopPropagation(), $ = $ === c.id ? null : c.id, X();
      }), O.append(d);
    });
  }
  function ur() {
    E.replaceChildren();
    const c = u.settings.bands.find((x) => x.id === $);
    if (!c || u.readonly) {
      S.style.display = "none";
      return;
    }
    S.style.display = "";
    const p = j("span", "name", `Band ${u.settings.bands.indexOf(c) + 1}`);
    p.title = "The selected band";
    const d = j("select");
    d.setAttribute("aria-label", "Band type"), d.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [x, B] of Object.entries(Ln)) d.append(new Option(B, x));
    d.value = c.type, d.addEventListener("change", () => C(et(u.settings, c.id, { type: d.value })));
    const w = j("input");
    w.type = "checkbox", w.checked = c.enabled, w.setAttribute("aria-label", "Band enabled"), w.title = "Band enabled: off keeps the band in the list but out of the response", w.addEventListener("change", () => C(et(u.settings, c.id, { enabled: w.checked })));
    const A = [
      [
        "Hz",
        `${c.frequency_hz}`,
        70,
        (x) => pt(c.id, "frequency_hz", bt(x, { kilo: !0 }))
      ],
      ["dB", `${c.gain_db}`, 60, (x) => pt(c.id, "gain_db", bt(x))],
      ["Q", `${c.q}`, 60, (x) => pt(c.id, "q", bt(x))]
    ];
    E.append(p, d, w);
    for (const [x, B, ge, We] of A) {
      const Y = j("input", "number");
      Y.value = B, Y.style.width = `${ge}px`, Y.setAttribute("aria-label", `Band ${x}`), Y.title = x === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : x === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Fe = () => {
        We(Y.value) || (Y.value = B);
      };
      Y.addEventListener("keydown", (oe) => {
        oe.key === "Enter" && Fe();
      }), Y.addEventListener("blur", Fe), (x === "dB" && !ke.includes(c.type) || x === "Q" && !An.includes(c.type)) && (Y.disabled = !0), E.append(Y);
    }
    const z = be("", "remove", "Remove this band");
    z.addEventListener("click", (x) => {
      x.stopPropagation(), $ = null, C(gt(u.settings, c.id));
    }), E.append(z);
  }
  function dr() {
    k.replaceChildren();
    const c = String(ie(e, "mode")?.value ?? "flat");
    if (c === "manual" || c === "flat") {
      k.style.display = "none";
      return;
    }
    k.style.display = "", k.append(
      j(
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
      const A = ue();
      if (A) {
        const z = Se(u.settings);
        A.value = z, A.callback?.(z);
      }
      L.reset(u.settings), ht(), ne(0);
    }), k.append(p);
  }
  function fr(c) {
    $ = c, R = !0, X();
  }
  function pr(c) {
    $ = c, ut();
  }
  function ut() {
    const c = N();
    u.settings.bands.forEach((d) => {
      const w = P.get(d.id);
      if (!w) return;
      const A = ke.includes(d.type) ? d.gain_db : 0;
      w.setAttribute("cx", String(ye(c, d.frequency_hz))), w.setAttribute("cy", String(he(c, A))), w.classList.toggle("selected", d.id === $), w.setAttribute("r", d.id === $ ? "9" : "7");
    }), F && u.frequencies.length && F.setAttribute("d", Kt(c, u.frequencies, u.response));
    const p = u.settings.bands.find((d) => d.id === $);
    p && (y.textContent = Te(p));
  }
  function hr() {
    clearTimeout(V), V = setTimeout(async () => {
      const c = u.settings, p = ++T;
      try {
        const d = await Ht(t, c, u.sampleRate);
        if (p !== T) return;
        u = { ...u, frequencies: d.frequency_hz, response: d.response_db }, ut();
      } catch {
      }
    }, 60);
  }
  function dt() {
    return !ie(e, Ve)?.plenioHidden;
  }
  function ft(c) {
    const p = ie(e, Ve);
    p && (p.plenioHidden = !c, c ? delete p.computeSize : p.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function pt(c, p, d) {
    if (d === null) return !1;
    const w = u.settings.bands.find((A) => A.id === c);
    return w && w[p] === d || C(et(u.settings, c, { [p]: d })), !0;
  }
  function mr(c, p) {
    c.preventDefault(), c.stopPropagation(), $ !== p && pr(p);
    const d = u.settings.bands.find((K) => K.id === p);
    if (!d) return;
    D = { hz: d.frequency_hz, db: d.gain_db };
    let w = !1, A = !1;
    const z = c.currentTarget;
    try {
      z?.setPointerCapture?.(c.pointerId);
    } catch {
    }
    const x = _.getBoundingClientRect(), B = x.width ? x.left : 0, ge = x.height ? x.top : 0, We = x.width || Z.width, Y = x.height || Z.height, Fe = (K, je) => K >= B - 1 && K <= B + We + 1 && je >= ge - 1 && je <= ge + Y + 1;
    function oe() {
      if (!A) {
        A = !0;
        try {
          z?.releasePointerCapture?.(c.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Bt, de), window.removeEventListener("pointerup", oe, de), window.removeEventListener("pointercancel", oe, de), window.removeEventListener("blur", oe, de), D = null, w && C(u.settings);
      }
    }
    const Bt = (K) => {
      if (A || !D) return;
      if (K.buttons === 0) {
        oe();
        return;
      }
      if (!Fe(K.clientX, K.clientY)) return;
      const je = Z.width / We, br = Z.height / Y, yr = (K.clientX - B) * je, vr = (K.clientY - ge) * br, wr = ye(N(), D.hz), xr = he(N(), D.db), _r = Ut(N(), Jt(wr, yr, K.shiftKey)), Sr = Qt(N(), Jt(xr, vr, K.shiftKey));
      u = { ...u, settings: qe(u.settings, p, _r, Sr, u.sampleRate) }, w = !0, ut(), hr();
    };
    window.addEventListener("pointermove", Bt, de), window.addEventListener("pointerup", oe, de), window.addEventListener("pointercancel", oe, de), window.addEventListener("blur", oe, de);
  }
  function Ot(c, p) {
    const d = u.settings.bands.find((x) => x.id === p);
    if (!d) return;
    const w = c.shiftKey ? 0.1 : 0.5, A = c.shiftKey ? 1.01 : 1.06;
    let z = null;
    c.key === "ArrowUp" ? z = qe(u.settings, p, d.frequency_hz, d.gain_db + w, u.sampleRate) : c.key === "ArrowDown" ? z = qe(u.settings, p, d.frequency_hz, d.gain_db - w, u.sampleRate) : c.key === "ArrowRight" ? z = qe(u.settings, p, d.frequency_hz * A, d.gain_db, u.sampleRate) : c.key === "ArrowLeft" ? z = qe(u.settings, p, d.frequency_hz / A, d.gain_db, u.sampleRate) : c.key === "+" ? z = mt(u.settings, p, 1.15) : c.key === "-" ? z = mt(u.settings, p, 1 / 1.15) : c.key === "0" ? z = Zt(u.settings, p) : (c.key === "Delete" || c.key === "Backspace") && (z = gt(u.settings, p)), z && (c.preventDefault(), C(z));
  }
  _.addEventListener("keydown", (c) => {
    $ && c.target === _ && Ot(c, $);
  }), _.addEventListener("dblclick", (c) => {
    if (u.readonly || g) return;
    const p = _.getBoundingClientRect(), d = Z.width / (p.width || Z.width), w = Z.height / (p.height || Z.height), A = (c.clientX - p.left) * d, z = (c.clientY - p.top) * w, x = Zr(u.settings, Ut(N(), A), Qt(N(), z), u.sampleRate);
    x ? ($ = x.bands[x.bands.length - 1].id, C(x)) : (u = { ...u, note: `the EQ has at most ${Ze} bands` }, X());
  }), o.append(new Option("preset…", "")), yt ??= Ar(t).then((c) => c.manual).catch(() => []), yt.then((c) => {
    v = c;
    for (const p of c) o.append(new Option(p.name, p.name));
    o.value = re();
  }), o.addEventListener("change", async () => {
    const c = (await yt)?.find((p) => p.name === o.value);
    c && (b = c.name, C(He(c)));
  }), s.addEventListener("change", () => {
    const c = Number(s.value);
    m = Yt.find((p) => p === c) ?? 12, X();
  }), i.addEventListener("click", () => {
    const c = L.undo();
    c && C(c, { record: !1 });
  }), a.addEventListener("click", () => {
    const c = L.redo();
    c && C(c, { record: !1 });
  }), l.addEventListener("click", () => {
    $ = null, C(_e());
  }), f.addEventListener("click", () => {
    g = !g, X();
  }), h.addEventListener("click", () => {
    ft(!dt()), X();
  });
  function ht() {
    for (const c of ["mode", Ve]) {
      const p = ie(e, c);
      if (!p || p.plenioWatched) continue;
      p.plenioWatched = !0;
      const d = p.callback;
      p.callback = (w) => {
        d?.(w), setTimeout(() => {
          dt() || ft(!1), ne();
        });
      };
    }
  }
  ht(), ft(!1), ne(0);
  let Dt = null, Pt = null;
  const gr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(gr);
      return;
    }
    const c = String(ie(e, "mode")?.value ?? "flat"), p = String(ue()?.value ?? "");
    c === Dt && p === Pt || (Dt = c, Pt = p, ht(), ne(0));
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
      }, A ? ne(0) : X();
    }
  };
}
const It = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, so = new Set(Pe.map((e) => Ct[e]));
function io(e, t) {
  return !(e in It) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, r]) => so.has(n) && Sn(r)).map(([n]) => n);
}
function ao(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const r = n?.[t];
    if (!Array.isArray(r)) continue;
    if (Array.isArray(r[0])) return r[0];
    const o = r[1]?.options;
    return Array.isArray(o) ? o : [];
  }
  return [];
}
const lo = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function co(e, t) {
  const n = lo[e];
  if (!n) return [];
  const r = [];
  for (const o of t ?? []) {
    const s = n[o.name]?.[String(o.value)];
    s !== void 0 && (o.value = s, r.push(o.name));
  }
  return r;
}
function uo(e, t) {
  const n = It[e.name];
  if (!n || !t) return t;
  const r = ao(e, "mode"), o = t.widgets_values, s = t.widgets_values_named;
  let i = t;
  Array.isArray(o) && o.length && !r.includes(o[0]) && (i = { ...i, widgets_values: [n, ...o] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (i = { ...i, widgets_values_named: { mode: n, ...s } });
  const a = io(e.name, i.widgets_values_named);
  if (a.length) {
    const l = { ...i.widgets_values_named };
    for (const f of a) l[f] = "";
    i = { ...i, widgets_values_named: l };
  }
  return i;
}
const Nn = /* @__PURE__ */ new Map(), Et = /* @__PURE__ */ new Set();
function nn(e, t) {
  Nn.set(e, t);
  for (const n of Et) n(e);
}
function xe(e) {
  return Nn.get(e) ?? null;
}
function fo(e) {
  return Et.add(e), () => Et.delete(e);
}
const qn = /* @__PURE__ */ new Map();
function po(e) {
  e?.draft_sha256 && qn.set(e.draft_sha256, e);
}
function ho(e) {
  return e ? qn.get(e) ?? null : null;
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
function mo(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function go(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Tn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function bo(e) {
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
const ot = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new Set();
function Cn(e) {
  return ot.get(e) ?? null;
}
function Ee(e, t) {
  t ? ot.set(e, t) : ot.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ie) n(e);
}
function yo(e) {
  for (const t of e) ot.delete(t);
  for (const t of Ie) t(null);
}
function vo() {
  for (const e of Ie) e(null);
}
function wo(e) {
  return Ie.add(e), () => Ie.delete(e);
}
const rn = "600 12px sans-serif", Ye = 20, wt = 7;
function xo(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function _o(e) {
  const t = e ? xo(e) : "";
  return {
    height: e ? Ye : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = rn;
      const r = n.measureText(t).width + 2 * wt;
      return n.restore(), r;
    },
    draw(n, r, o) {
      if (!e) return;
      n.save(), n.font = rn;
      const s = n.measureText(t).width + 2 * wt;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(r, o, s, Ye, 5) : n.rect(r, o, s, Ye), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, r + wt, o + Ye / 2 + 0.5), n.restore();
    }
  };
}
const So = "PlenioSongSheet", ko = 30;
function zn(e, t) {
  const n = e.widgets?.find((r) => r.name === t);
  return n ? String(n.value ?? "") : null;
}
function Eo(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? zn(n, "mode") : null;
  } catch {
    return null;
  }
}
function Mt(e) {
  const t = Cn(e);
  return t || (e.type !== So ? null : go(zn(e, "review") ?? "continue", Eo(e)) ? "stop" : null);
}
function Mo(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Tn(n);
  const r = e?.plenio_summary;
  return mo(r?.[r.length - 1]?.status);
}
function Ao(e, t) {
  const n = e.prototype, r = n.onNodeCreated;
  n.onNodeCreated = function() {
    r?.call(this);
    const o = this;
    o.badges?.push(() => {
      const s = Mt(o);
      return _o(s ? vt[s] : null);
    });
  }, n.onDrawForeground = le(n.onDrawForeground, function(o) {
    const s = Mt(this);
    !s || !vt[s].frame || this.flags?.collapsed || !this.size || $o(o, vt[s], this.size, ko, t.scale());
  }), n.onExecuted = le(n.onExecuted, function(o) {
    const s = Mo(o);
    s && (Ee(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function $o(e, t, n, r, o) {
  const s = Math.max(3, 3 / Math.max(o, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const i = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i, 10) : e.rect(-i, -r - i, n[0] + 2 * i, n[1] + r + 2 * i), e.stroke(), e.restore();
}
function ti(e, t) {
  const n = [];
  let r = 0;
  return e.bars.forEach((o, s) => {
    const i = t?.[s] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, l = a ? a[1] - a[0] : o.duration_s;
    n.push({ scoreStart: o.start_s, scoreDur: o.duration_s, realStart: r, realDur: l, source: a }), r += l;
  }), n;
}
function In(e, t, n) {
  let r = null;
  for (const o of e)
    if (o[n] <= t + U) r = o;
    else break;
  return r ?? e[0] ?? null;
}
function we(e, t) {
  const n = In(e, t, "scoreStart");
  if (!n) return t;
  const r = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + r * n.realDur;
}
function Lo(e, t) {
  const n = In(e, t, "realStart");
  if (!n) return t;
  const r = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + r * n.scoreDur;
}
function ni(e, t, n) {
  const r = we(e, t), o = n == null ? 1 / 0 : we(e, n), s = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, l = Math.max(i.realStart, r), f = Math.min(a, o);
    if (f <= l + U) continue;
    let h = i.source[0] + (l - i.realStart) / i.realDur * (i.source[1] - i.source[0]), y = l - r, k = f - l;
    if (h < 0 && (y -= h, k += h, h = 0, k <= U))
      continue;
    const _ = s.at(-1);
    _ && Math.abs(_.at + _.duration - y) < U && Math.abs(_.offset + _.duration - h) < 0.01 ? _.duration += k : s.push({ at: y, offset: h, duration: k });
  }
  return s;
}
const Rn = 0.04, U = 1e-3, No = 0.25, qo = 2;
function st(e) {
  return Math.min(qo, Math.max(No, Number.isFinite(e) ? e : 1));
}
function ri(e, t) {
  const n = st(t.speed), r = t.to ?? e.duration_s, o = [], s = t.clock?.length ? t.clock : null, i = s ? we(s, t.from) : t.from, a = (l) => (s ? we(s, l) : l) - i;
  for (const l of ["Vocal", "Ins"])
    if (t.voices[l])
      for (const f of e.notes?.[l] ?? []) {
        if (f.start_s < t.from - U || f.start_s >= r - U) continue;
        const h = Math.min(f.start_s + f.duration_s, r), y = Math.max(0, a(f.start_s));
        o.push({ at: y / n, duration: (a(h) - y) / n, midi: f.midi, part: l });
      }
  if (t.voices.chords)
    for (const l of e.chords ?? []) {
      const f = Math.min(l.start_s + l.duration_s, r), h = Math.max(l.start_s, t.from);
      if (!(f <= h + U))
        for (const y of l.pitches)
          o.push({ at: a(h) / n, duration: (a(f) - a(h)) / n, midi: y, part: "chord" });
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
        const y = l.start_s + h * l.duration_s / f;
        y < t.from - U || y >= r - U || o.push({
          at: Math.max(0, a(y)) / n,
          duration: Rn,
          midi: h === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return o.sort((l, f) => l.at - f.at || l.midi - f.midi);
}
function oi(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), r = t.clock?.length ? t.clock : null, o = r ? we(r, n) - we(r, t.from) : n - t.from;
  return Math.max(0, o) / st(t.speed);
}
function si(e, t, n, r, o, s) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, l = i > 0 ? Math.floor(a / i + 1e-6) : 0, f = i > 0 ? (a - l * i) / i * s : 0, h = f > 1e-3 ? 0 : 1, y = Math.max(0, r * t);
  return Array.from({ length: y }, (k, _) => {
    const O = h + y - 1 - _, S = ((l - O) % t + t) % t === 0;
    return { at: Math.max(0, o - f - O * s), duration: Rn, midi: S ? 96 : 89, part: "click" };
  });
}
function ii(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? Lo(n, we(n, e.from) + t * st(e.speed)) : e.from + t * st(e.speed);
}
function ai(e, t, n) {
  return (e.elements ?? []).filter(
    (r) => r.kind === "note" && n[r.voice] && r.start_s <= t + U && t < r.start_s + r.duration_s - U
  ).map((r) => r.id);
}
function To(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const Co = [
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
], li = {
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
  return typeof e == "string" && Co.includes(e);
}
function On() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function zo(e) {
  const t = On(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: Ue(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: Ue(n.Ins) ? n.Ins : t.Ins,
    chord: Ue(n.chord) ? n.chord : t.chord,
    guide: Ue(n.guide) ? n.guide : t.guide
  };
}
const Io = {
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
}, on = /* @__PURE__ */ new WeakMap();
function xt(e, t, n) {
  let r = on.get(e);
  r || on.set(e, r = /* @__PURE__ */ new Map());
  let o = r.get(t);
  if (!o) {
    const s = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, l) => i[l + 1] = a), o = e.createPeriodicWave(s, i), r.set(t, o);
  }
  return o;
}
const sn = /* @__PURE__ */ new WeakMap();
function Dn(e) {
  let t = sn.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let r = 1;
    for (let o = 0; o < n.length; o++)
      r = r * 16807 % 2147483647, n[o] = r / 2147483647 * 2 - 1;
    sn.set(e, t);
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
function Ce(e, t, n, r, o, s) {
  const i = q(e, "sine", r), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + s), a.gain.linearRampToValueAtTime(o, n + s + 0.4), i.connect(a);
  for (const l of t) a.connect(l.detune);
  return i;
}
function _t(e, t, n, r, o, s) {
  const i = e.createBufferSource();
  i.buffer = Dn(e);
  const a = ee(e, "bandpass", r, 1.2), l = e.createGain();
  return l.gain.setValueAtTime(o, n), l.gain.setTargetAtTime(0, n, s), i.connect(a).connect(l).connect(t), i;
}
const tt = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), an = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [ln(q(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [ln(q(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, r, o, s) {
      const i = xt(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ee(e, "lowpass", Math.min(n * (5 + 7 * o), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), r + 0.01, tt(s, 0.35)), a.connect(t);
      const l = q(e, i, n, -1.5), f = q(e, i, n, 1.5), h = fe(e, 0.5);
      l.connect(h), f.connect(h), h.connect(a);
      const y = _t(e, t, r, Math.min(n * 6, 7e3), 0.12 * o, 8e-3);
      return [l, f, y];
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
      const y = q(e, "sine", n * 4), k = e.createGain();
      return k.gain.setValueAtTime(0.18 * o, r), k.gain.setTargetAtTime(0, r, 0.06), y.connect(k).connect(h), i.connect(h), [i, a, y];
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
      const i = Ce(e, s, r, 5.3, 7, 0.3);
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
      const o = xt(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), s = q(e, o, n), i = q(e, "sine", n / 2), a = fe(e, 0.35);
      i.connect(a).connect(t), s.connect(t);
      const l = Ce(e, [s, i], r, 6.6, 4, 0), f = _t(e, t, r, 3e3, 0.05, 4e-3);
      return [s, i, l, f];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, r) {
      const o = xt(e, "flute", [1, 0.13, 0.06, 0.02]), s = q(e, o, n);
      s.connect(t);
      const i = e.createBufferSource();
      i.buffer = Dn(e), i.loop = !0;
      const a = ee(e, "bandpass", Math.min(n * 2, 8e3), 1.5), l = fe(e, 0.06);
      i.connect(a).connect(l).connect(t);
      const f = Ce(e, [s], r, 4.9, 9, 0.25);
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
        const y = ee(e, "bandpass", l, f), k = fe(e, h);
        s.connect(y).connect(k).connect(t);
      }
      const i = fe(e, 0.15);
      s.connect(i).connect(t);
      const a = Ce(e, [o], r, 5.4, 18, 0.22);
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
      const f = _t(e, t, r, Math.min(n * 8, 8e3), 0.1 * o, 5e-3);
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
      const a = Ce(e, [s, i], r, 5.6, 10, 0.3);
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
function ln(e, t) {
  return e.connect(t), e;
}
function ci(e, t, n, r, o, { velocity: s = 0.8, level: i = 1 } = {}) {
  const a = an[n] ?? an.plain, l = To(r), f = a.sustain === 0 ? tt(r, a.decay) : a.decay, h = i * Io[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, s))), y = e.createGain();
  y.gain.setValueAtTime(0, o), y.gain.linearRampToValueAtTime(h, o + a.attack), y.gain.setTargetAtTime(h * a.sustain, o + a.attack, f), y.connect(t);
  const k = a.build(e, y, l, o, s, r);
  for (const E of k) E.start(o);
  let _ = !1, O = !1;
  const S = (E) => {
    for (const W of k)
      try {
        W.stop(E);
      } catch {
      }
  };
  return k[0].onended = () => {
    O = !0, y.disconnect();
  }, a.sustain === 0 && S(o + a.attack + f * 7), {
    release(E) {
      if (_ || O) return;
      _ = !0;
      const W = Math.max(E, o + a.attack);
      y.gain.setTargetAtTime(0, W, a.release), S(W + a.release * 7);
    },
    stop() {
      if (O) return;
      O = !0, _ = !0;
      const E = e.currentTime;
      try {
        y.gain.cancelScheduledValues(E), y.gain.setValueAtTime(0, E);
      } catch {
      }
      S(E), y.disconnect();
    }
  };
}
const ui = 12, Qe = { width: 640, height: 420 }, Ro = { width: 1280, height: 900 }, Pn = 120, Bn = 720, Hn = 0.25, Wn = 0.85, Fn = 160, jn = 460, Gn = "plenio.sheet.dialog";
function Re(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function Oo(e, t) {
  const n = Re(e.width, Qe.width, Math.max(Qe.width, t.width - 16)), r = Re(e.height, Qe.height, Math.max(Qe.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(r) };
}
function di(e, t) {
  return Math.round(Re(e + t, Pn, Bn));
}
function fi(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? cn(e) : cn(e + t / n);
}
function cn(e) {
  return Math.round(Re(e, Hn, Wn) * 1e3) / 1e3;
}
function pi(e, t) {
  return Math.round(Re(e + t, Fn, jn));
}
function hi(e, t, n) {
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
function Do() {
  return { ...Ro, maximized: !1 };
}
function mi(e = Vn()) {
  const t = Do();
  try {
    const n = e?.getItem(Gn);
    if (!n) return t;
    const r = JSON.parse(n);
    return { ...Oo(
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
function gi(e, t = Vn()) {
  try {
    t?.setItem(Gn, JSON.stringify(e));
  } catch {
  }
}
function Vn() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Xn(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function Yn() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function Po(e) {
  const t = Yn(), n = typeof e == "object" && e !== null ? e : {}, r = (o, s, i) => s.includes(o) ? o : i;
  return {
    countIn: r(n.countIn, [0, 1, 2], t.countIn),
    quantize: r(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: r(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: r(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const Un = "plenio.score-editor.prefs";
function Bo() {
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
    sounds: On(),
    paper: "a4",
    notationSize: "standard",
    record: Yn(),
    midiInput: "all"
  };
}
function Ho(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function bi(e = Qn()) {
  const t = Bo();
  try {
    const n = e?.getItem(Un);
    if (!n) return t;
    const r = JSON.parse(n);
    return {
      ...Ho(r),
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
      rollHeight: typeof r.rollHeight == "number" && r.rollHeight >= Pn && r.rollHeight <= Bn ? Math.round(r.rollHeight) : t.rollHeight,
      notationShare: typeof r.notationShare == "number" && r.notationShare >= Hn && r.notationShare <= Wn ? r.notationShare : t.notationShare,
      sideWidth: typeof r.sideWidth == "number" && r.sideWidth >= Fn && r.sideWidth <= jn ? Math.round(r.sideWidth) : t.sideWidth,
      metronome: r.metronome === !0,
      hear: r.hear === "notes" || r.hear === "source" ? r.hear : t.hear,
      sourceLevel: typeof r.sourceLevel == "number" && r.sourceLevel >= 0 && r.sourceLevel <= 1 ? r.sourceLevel : t.sourceLevel,
      audition: r.audition !== !1,
      rowHeight: typeof r.rowHeight == "number" && r.rowHeight >= 6 && r.rowHeight <= 28 ? Math.round(r.rowHeight) : t.rowHeight,
      follow: r.follow !== !1,
      sung: r.sung !== !1,
      wave: r.wave !== !1,
      sounds: zo(r.sounds),
      paper: r.paper === "letter" ? "letter" : "a4",
      notationSize: Xn(r.notationSize) ? r.notationSize : t.notationSize,
      record: Po(r.record),
      midiInput: typeof r.midiInput == "string" && r.midiInput ? r.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function yi(e, t = Qn()) {
  try {
    t?.setItem(Un, JSON.stringify(e));
  } catch {
  }
}
function Qn() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Jn(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: Xn(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function Wo(e) {
  return Jn(e?.plenio_notation);
}
async function Fo(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return Jn(n.jobs);
}
async function jo(e, t) {
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
let un = Promise.resolve();
function Go(e) {
  const t = un.then(e, e);
  return un = t.catch(() => {
  }), t;
}
class Vo {
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
        Go(() => jo(o, this.host)).then(
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
      t = await Fo(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const Rt = "plenio.sheet_state/1", lt = ["title", "style", "lyrics", "score", "artwork_prompt"];
function ct() {
  return { schema: Rt, docs: {} };
}
function $e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return ct();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Rt || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function it(e) {
  const t = {};
  for (const r of lt) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: Rt, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function St(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Xo(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = lt.filter((r) => St(e, r) !== "auto").map(
    (r) => r === "lyrics" && St(e, r) === "manual" ? "lyrics: yours (manual)" : `${r.replace("_", " ")} ${St(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function vi(e) {
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
const wi = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function xi(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, r]) => r > 1 ? `${n} (${r} times)` : n);
}
function _i(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function dn(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), r = Math.round(t - n * 60);
  return `${n}:${String(r).padStart(2, "0")}`;
}
function Si(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const o = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: dn(o?.[0] ?? 0), end: dn(s?.[1] ?? e.duration_s) };
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
function Yo(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function ki(e, t, n) {
  return n.map((r) => ({ kind: r, text: Yo(e, t, r), intent: "keep" }));
}
function Kn(e, t, n) {
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
  const o = { ...ct(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function Uo(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Qo(e, t) {
  return lt.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Jo(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ko = "PlenioSongSheet";
function Be(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function Zn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const r = e.graph, o = r?.links, s = r?.getLink?.(n) ?? (o instanceof Map ? o.get(n) : o?.[String(n)]);
    return s && r?.getNodeById ? r.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function er(e, t) {
  const n = (e.inputs ?? []).findIndex((r) => r.name === t && r.link != null);
  return n < 0 ? null : Zn(e, n);
}
function tr(e, t) {
  const n = er(e, t);
  return n && (n.comfyClass ?? n.type) === Ko && Be(n) ? n : null;
}
function Zo(e) {
  return tr(e, "context_lyrics");
}
function es(e) {
  return tr(e, "context_score");
}
function ts(e, t, n) {
  const r = [], o = er(t, n);
  o && r.push(o);
  const s = /* @__PURE__ */ new Set();
  for (; r.length && s.size < 1e3; ) {
    const i = r.shift(), a = String(i.id);
    if (!s.has(a)) {
      if (s.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((l, f) => {
        const h = Zn(i, f);
        h && r.push(h);
      });
    }
  }
  return !1;
}
function ns(e, t, n) {
  const r = Zo(e), o = t?.context?.lyrics;
  if (!r || !o) return null;
  const s = r.title || "Song Sheet", i = $e(Be(r)?.value), a = i?.docs.lyrics?.text ?? n(String(r.id))?.docs.lyrics?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${s} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(o) && (l = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: r, target: { title: s, blocked: l, replans: ts(r, e, "score") } };
}
function rs(e, t, n) {
  const r = Be(e);
  if (!r) return;
  const o = $e(r.value) ?? ct();
  r.value = it(Kn(o, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function os(e, t, n) {
  const r = es(e), o = t?.context?.score;
  if (!r || !o) return null;
  const s = r.title || "Song Sheet", i = $e(Be(r)?.value), a = i?.docs.score?.text ?? n(String(r.id))?.docs.score?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${s} is unreadable - open that sheet and apply it first.` : a !== null && ve(a) !== ve(o) && (l = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: r, target: { title: s, blocked: l } };
}
function ss(e, t) {
  const n = String(e.widgets?.find((r) => r.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function is(e, t, n, r = null) {
  const o = Be(e);
  if (!o) return null;
  const s = $e(o.value) ?? ct(), i = Kn(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (o.value = it(i), e.setDirtyCanvas?.(!0, !0), !r || !n) return i;
  try {
    const a = await Er(r.fetcher, {
      sheet_state: i,
      upstream: Jo(n),
      owned: n.owned,
      review: ss(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!a.findings.some((h) => h.severity === "error") || !a.fingerprint) return i;
    const f = Uo(i, a.fingerprint);
    return o.value = it(f), e.setDirtyCanvas?.(!0, !0), f;
  } catch {
    return i;
  }
}
const At = "Plenio was updated while this page was open: reload the page (F5).";
function as(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function ls(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function nr(e, t) {
  const n = as(e);
  if (!n) return !1;
  try {
    const r = await t(new URL("../plenio.js", e).href), o = r ? ls(r) : null;
    return o !== null && o !== n;
  } catch {
    return !1;
  }
}
async function rr(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function nt(e, t, n = "") {
  try {
    return await e();
  } catch (r) {
    throw await t() ? new Error(n ? `${At} ${n}` : At) : r;
  }
}
const or = "PLENIO_SHEET_STATE", fn = 68;
let rt = null;
function cs(e) {
  rt = e;
}
const us = (e, t, n) => {
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
    const S = xe(String(e.id)), E = Mt(e);
    s.textContent = Xo($e(r)) + (S && E !== "approved" ? ` · ${S.status}` : ""), a.textContent = bo(E), a.dataset.state = E ?? "";
    const W = l ? null : e.widgets?.find((u) => u.name === "review");
    if (W) {
      l = !0;
      const u = W.callback;
      W.callback = (H) => {
        u?.(H), f();
      };
    }
  }, h = e.addDOMWidget(t, or, o, {
    getValue: () => r,
    setValue: (S) => {
      r = typeof S == "string" ? S : "", f();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => fn,
    getMaxHeight: () => fn
  });
  i.addEventListener("click", (S) => {
    S.stopPropagation(), y().catch((E) => {
      console.error("Plenio: the Song Sheet editor could not open", E), s.textContent = `The editor could not open: ${E instanceof Error ? E.message : String(E)}`;
    });
  });
  async function y() {
    const S = $e(r);
    S === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const E = xe(String(e.id)), u = (e.inputs ?? []).filter((L) => L.link != null).map((L) => L.name), H = S ?? { schema: "plenio.sheet_state/1", docs: {} }, $ = E?.owned ?? Qo(u, H), g = String(e.widgets?.find((L) => L.name === "review")?.value ?? "continue"), m = g === "as the brief says" ? E?.review ?? "continue" : g, b = () => nr(import.meta.url, rr), { openSheetDialog: v } = await nt(() => import("./open-CqXCztSi.mjs"), b), { parseGuide: T, serializeGuide: M } = await nt(() => import("./tracks-DxmZeggM.mjs"), b), { parseShift: V, parseSpans: D } = await nt(() => import("./lyricPlacement-rAf-x_fn.mjs"), b);
    if (!rt) throw new Error("Plenio: API not initialised");
    let R = null;
    try {
      R = ns(e, E, xe);
    } catch (L) {
      console.warn("Plenio: the lyrics sheet of this score was not found", L);
    }
    let P = null;
    try {
      P = os(e, E, xe);
    } catch (L) {
      console.warn("Plenio: the score sheet of these lyrics was not found", L);
    }
    const F = rt;
    v({
      title: e.title || "Song Sheet",
      state: H,
      payload: E,
      asrNote: ho(E?.docs.lyrics?.upstream_sha256),
      owned: $.length ? $ : [...lt],
      review: m,
      fetcher: rt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: T(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: D(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: V(e.properties?.plenio_source_shift),
      lyricsTarget: R?.target ?? null,
      scoreTarget: P?.target ?? null,
      onApply: (L, ue, J, N, C, ne) => {
        const He = String(h.value ?? "");
        if (h.value = it(L), e.properties = {
          ...e.properties ?? {},
          plenio_guide: M(ue),
          plenio_lyric_spans: (ne?.lyricSpans ?? []).map((re) => [...re]),
          plenio_source_shift: ne?.sourceShift ?? 0
        }, C ? Ee(e, "approved") : String(h.value) !== He && k(e), J !== null && R && !R.target.blocked && (rs(R.owner, J, xe(String(R.owner.id))), k(R.owner)), N && P && !P.target.blocked) {
          const re = P.owner;
          is(re, N.text, xe(String(re.id)), N.approved ? { fetcher: F } : null).then(
            (X) => {
              X?.review?.approved_fingerprint ? Ee(re, "approved") : k(re);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function k(S) {
    Cn(S) === "approved" && Ee(S, null);
  }
  const _ = [
    fo((S) => {
      S === String(e.id) && f();
    }),
    wo((S) => {
      (S === null || S === e) && f();
    })
  ], O = e.onRemoved;
  return e.onRemoved = function() {
    for (const S of _) S();
    O?.call(this);
  }, f(), { widget: h };
}, Oe = "plenio.stem_mix/1", Me = "rest", ds = ["reverb", "delay"], sr = -60, fs = 12;
function ps() {
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
function ir(e) {
  const t = ps();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const hs = ["vocals", "drums", "bass", "other"];
function ms() {
  return [...hs, Me];
}
function gs(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Oe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Oe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function bs(e) {
  const t = {};
  for (const r of Object.keys(e.strips)) {
    if (!r || ir(te(e, r))) continue;
    const o = {}, s = te(e, r);
    s.gain_db && (o.gain_db = s.gain_db), s.mute && (o.mute = !0), s.solo && (o.solo = !0), s.compression && (o.compression = s.compression), s.muted.length && (o.muted = s.muted), s.reverb && (o.reverb = s.reverb), s.delay && (o.delay = s.delay), s.save && (o.save = !0), t[r] = o;
  }
  const n = { schema: Oe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function at(e, t, n) {
  const r = { ...e.strips };
  return ir(n) ? delete r[t] : r[t] = n, { ...e, strips: r };
}
function ys(e, t, n) {
  const r = n.some((s) => te(e, s).solo), o = te(e, t);
  return r ? o.solo : !o.mute;
}
function pn(e) {
  return e <= sr ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function vs(e, t = null) {
  const n = e.filter((o) => Array.isArray(o) && o.length === 2 && Number.isFinite(o[0]) && Number.isFinite(o[1])).map((o) => [Math.max(0, Math.min(o[0], o[1])), Math.max(o[0], o[1])]).filter((o) => o[1] - o[0] > 1e-6).sort((o, s) => o[0] - s[0]), r = [];
  for (const o of n) {
    const s = r[r.length - 1];
    s && o[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], o[1]) : r.push([...o]);
  }
  return t !== null && t > 0 ? r.map(([o, s]) => [Math.min(o, t), Math.min(s, t)]).filter(([o, s]) => s - o > 1e-6) : r;
}
function ws(e, t, n) {
  return vs([...e, [t, n]]);
}
function xs(e, t) {
  return e.findIndex(([n, r]) => n <= t && t <= r);
}
function _s(e, t) {
  return t < 0 ? e : e.filter((n, r) => r !== t);
}
function Ss(e, t, n, r) {
  const o = te(e, t);
  return at(e, t, { ...o, muted: ws(o.muted, n, r) });
}
function ks(e, t, n) {
  const r = te(e, t), o = xs(r.muted, n);
  return o < 0 ? e : at(e, t, { ...r, muted: _s(r.muted, o) });
}
function Es(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const r = {};
  for (const [o, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (r[o] = s.map((i) => Math.abs(Number(i) || 0)));
  return r;
}
function Ms(e, t, n = 200) {
  const r = e[t];
  return r?.length ? r.length === n ? r : Array.from({ length: n }, (o, s) => r[Math.floor(s * r.length / n)] ?? 0) : new Array(n).fill(0);
}
function hn(e, t) {
  const r = (Array.isArray(t?.stems) && t.stems.length ? t.stems : ms()).filter((s) => s !== Me), o = Object.keys(e?.strips ?? {}).filter((s) => s !== Me && !r.includes(s));
  return [...r, ...o, Me];
}
const mn = "plenio_stem_mixer", gn = "mix", pe = 200, As = ["room", "plate", "hall"];
function I(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function Je(e, t, n, r, o) {
  const s = I("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(r), s.setAttribute("aria-label", o), s;
}
function $s(e) {
  const t = I("div", "plenio-mix"), n = I("div", "plenio-mix-strips"), r = I("div", "plenio-mix-buses"), o = I("div", "plenio-mix-info"), s = I("div", "plenio-mix-advanced");
  t.append(n, r, s, o);
  let i = {
    mix: { schema: Oe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: hn(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const l = () => e.widgets?.find((g) => g.name === gn);
  function f(g, { draw: m = !0 } = {}) {
    const b = l();
    if (!b) return;
    const v = bs(g);
    b.value = v, b.callback?.(v), i = { ...i, mix: g }, m && _();
  }
  function h(g, m, b = {}) {
    f(at(i.mix, g, { ...te(i.mix, g), ...m }), b);
  }
  function y(g, m, b, v = {}) {
    const T = te(i.mix, g);
    let M = at(i.mix, g, { ...T, [m]: b });
    b > 0 && !(M[m] && Object.keys(M[m]).length) && (M = m === "reverb" ? { ...M, reverb: { preset: "room" } } : { ...M, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), f(M, v);
  }
  function k(g, m, b) {
    const v = { ...i.mix[g] ?? {} };
    f({ ...i.mix, [g]: { ...v, [m]: b } });
  }
  function _() {
    n.replaceChildren();
    const g = i.names;
    for (const m of i.names) {
      const b = te(i.mix, m), v = I("div", "plenio-mix-strip");
      v.dataset.strip = m;
      const T = I("span", "name", m === Me ? `${m} (missed)` : m);
      T.title = m === Me ? "What the separator missed: keeps a neutral mix exact" : "";
      const M = Je(sr, fs, 0.5, b.gain_db, `${m} gain`), V = I("span", "gain", `${pn(b.gain_db)} dB`);
      M.addEventListener("input", () => {
        V.textContent = `${pn(Number(M.value))} dB`, h(m, { gain_db: Number(M.value) }, { draw: !1 });
      }), M.addEventListener("change", () => h(m, { gain_db: Number(M.value) }));
      const D = I("button", b.mute ? "toggle active" : "toggle", "M");
      D.setAttribute("aria-label", `${m} mute`), D.addEventListener("click", (N) => {
        N.stopPropagation(), h(m, { mute: !b.mute });
      });
      const R = I("button", b.solo ? "toggle active" : "toggle", "S");
      R.setAttribute("aria-label", `${m} solo`), R.addEventListener("click", (N) => {
        N.stopPropagation(), h(m, { solo: !b.solo });
      });
      const P = Je(0, 1, 0.05, b.compression, `${m} compression`);
      P.title = "Compression amount: one knob for the master compressor (threshold and ratio)", P.addEventListener("input", () => h(m, { compression: Number(P.value) }, { draw: !1 })), P.addEventListener("change", () => h(m, { compression: Number(P.value) }));
      const F = ds.map((N) => {
        const C = Je(0, 1, 0.05, b[N], `${m} ${N} send`);
        return C.title = `${N} send: how much of this stem goes to the shared ${N} bus`, C.addEventListener("input", () => y(m, N, Number(C.value), { draw: !1 })), C.addEventListener("change", () => y(m, N, Number(C.value))), C;
      }), L = I("button", b.save ? "toggle active" : "toggle", "save");
      L.setAttribute("aria-label", `${m} save as its own file`), L.setAttribute("aria-pressed", String(b.save)), L.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", L.addEventListener("click", (N) => {
        N.stopPropagation(), h(m, { save: !b.save });
      });
      const ue = ys(i.mix, m, g);
      v.classList.toggle("silent", !ue);
      const J = I("canvas", "plenio-mix-wave");
      J.width = pe, J.height = 26, J.setAttribute("aria-label", `${m} waveform (drag to mute a time range)`), O(J, b, Ms(i.peaks, m, pe)), J.addEventListener("pointerdown", (N) => S(N, J, m)), v.append(
        T,
        M,
        V,
        D,
        R,
        I("span", "label", "comp"),
        P,
        I("span", "label", "verb"),
        F[0],
        I("span", "label", "delay"),
        F[1],
        L,
        J
      ), n.append(v);
    }
    E(), o.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function O(g, m, b) {
    const v = g.getContext("2d");
    if (!v) return;
    v.clearRect(0, 0, pe, g.height);
    const T = g.height / 2;
    v.strokeStyle = "rgba(180, 190, 205, 0.8)", v.beginPath();
    for (let M = 0; M < b.length; M++) {
      const V = Math.max(1, b[M] * (T - 1));
      v.moveTo(M + 0.5, T - V), v.lineTo(M + 0.5, T + V);
    }
    v.stroke(), v.fillStyle = "rgba(224, 104, 94, 0.35)", v.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [M, V] of m.muted) {
      const D = Math.max(0, Math.min(pe, M / Math.max(i.seconds, 1e-6) * pe)), R = Math.max(0, Math.min(pe, V / Math.max(i.seconds, 1e-6) * pe));
      v.fillRect(D, 0, Math.max(1, R - D), g.height), v.strokeRect(D + 0.5, 0.5, Math.max(1, R - D) - 1, g.height - 1);
    }
  }
  function S(g, m, b) {
    if (g.preventDefault(), g.stopPropagation(), !i.seconds) return;
    const v = m.getBoundingClientRect(), T = (F) => Math.max(0, Math.min(1, (F - v.left) / (v.width || pe))) * i.seconds, M = T(g.clientX);
    if (te(i.mix, b).muted.some(([F, L]) => F <= M && M <= L)) {
      f(ks(i.mix, b, M));
      return;
    }
    let D = M;
    const R = (F) => {
      D = T(F.clientX);
    }, P = () => {
      window.removeEventListener("pointermove", R), window.removeEventListener("pointerup", P), f(Ss(i.mix, b, Math.min(M, D), Math.max(M, D)));
    };
    window.addEventListener("pointermove", R), window.addEventListener("pointerup", P);
  }
  function E() {
    r.replaceChildren();
    const g = { preset: "room", ...i.mix.reverb ?? {} }, m = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, b = I("select");
    b.setAttribute("aria-label", "Reverb preset"), b.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const M of As) b.append(new Option(M, M));
    b.value = String(g.preset ?? "room"), b.addEventListener("change", () => k("reverb", "preset", b.value));
    const v = I("input");
    v.type = "number", v.value = String(m.time_ms ?? 375), v.setAttribute("aria-label", "Delay time in ms"), v.title = "Delay time in ms: where the first echo of the delay bus sits", v.addEventListener("change", () => k("delay", "time_ms", Number(v.value)));
    const T = Je(0, 0.8, 0.05, Number(m.feedback ?? 0.35), "Delay feedback");
    T.title = "Delay feedback: how much of each echo returns into the delay line", T.addEventListener("input", () => k("delay", "feedback", Number(T.value))), r.append(
      I("span", "label", "reverb bus"),
      b,
      I("span", "label", "delay bus"),
      v,
      I("span", "label", "ms, feedback"),
      T
    ), r.style.display = "flex";
  }
  const W = e.addDOMWidget(mn, mn, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  const u = e.widgets?.find((g) => g.name === gn), H = I("button", "toggle", "JSON");
  H.title = "Show or hide the raw mixer value", H.addEventListener("click", (g) => {
    g.stopPropagation(), a = !a, H.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(I("span", "label", "Advanced"), H), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function $() {
    const g = gs(l()?.value);
    i = { ...i, mix: g ?? { schema: Oe, strips: {} } }, g || (o.textContent = "the mixer value is not readable; it will be replaced on the next edit"), _();
  }
  return $(), {
    showExecuted(g) {
      const m = g?.plenio_stems?.at(-1), b = Es(g), v = hn(i.mix, m ?? null);
      i = { ...i, names: v, peaks: b, seconds: Number(m?.seconds ?? i.seconds) || 0 }, $();
    }
  };
}
const Ls = `
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
function Ns() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Ls, document.head.append(e);
}
function $t(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ke(e) {
  return $t(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function qs(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Ts(e) {
  const t = [];
  let n = !1, r = null, o = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (o) {
      const [a, ...l] = o, f = (h, y) => `<tr>${h.map((k) => `<${y}>${Ke(k)}</${y}>`).join("")}</tr>`;
      t.push(`<table><thead>${f(a, "th")}</thead><tbody>${l.map((h) => f(h, "td")).join("")}</tbody></table>`), o = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${$t(r.join(`
`))}</code></pre>`), r = null) : r.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      s();
      const h = qs(a);
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
  return s(), i(), r !== null && t.push(`<pre><code>${$t(r.join(`
`))}</code></pre>`), t.join("");
}
const ze = "plenio_summary", bn = "plenio_summary", yn = 84, Cs = 18, zs = 55, Is = 16;
function Rs(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, r) => n + Math.max(1, Math.ceil(r.length / zs)), 0);
  return Is + t * Cs;
}
function Os(e, t) {
  const n = e.widgets?.find((s) => s.name === bn);
  if (n?.element) return n.element;
  const r = document.createElement("div");
  r.className = "plenio-summary";
  const o = e.addDOMWidget(bn, "plenio_summary", r, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => yn,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(yn, r.scrollHeight ? r.scrollHeight + 2 : Rs(t.markdown))
  });
  return o.serialize = !1, r;
}
function Ds(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const vn = /* @__PURE__ */ new WeakMap();
function Lt(e, t) {
  if (!t.markdown) return;
  const n = vn.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, vn.set(e, n);
  const r = Os(e, n);
  r.dataset.status = t.status ?? "", r.innerHTML = Ts(t.markdown), Ds(e), e.setDirtyCanvas?.(!0, !0);
}
function wn(e, t, n, r) {
  const o = e.properties?.[ze], s = (o?.markdown ?? "").split(`
`), i = s.findIndex((l) => l.startsWith(t));
  i >= 0 ? s[i] = n : s.push(n);
  const a = { markdown: s.join(`
`).trim(), status: r ?? o?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[ze] = a, Lt(e, a);
}
function Ps(e) {
  e.prototype.onExecuted = le(e.prototype.onExecuted, function(t) {
    const n = t?.[ze], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[ze] = { markdown: r.markdown, status: r.status ?? "" }, Lt(this, r));
  }), e.prototype.onConfigure = le(e.prototype.onConfigure, function() {
    const t = this.properties?.[ze];
    t?.markdown && Lt(this, t);
  });
}
const Bs = "Plenio.Core", ae = kr;
cs(ae);
const Le = _n, ar = () => Le.graph;
function Nt(e) {
  if (e == null) return null;
  const t = String(e);
  return ar()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Hs = {
  scale: () => Le.canvas?.ds?.scale ?? 1,
  toast: (e, t) => Le.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, lr = () => nr(import.meta.url, rr), Ws = {
  fetcher: ae,
  async draw(e, t, n, r) {
    const { notationPdf: o, renderLines: s } = await nt(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      lr,
      "The sheet music is drawn and saved then."
    ), i = s(e, t, n, r);
    try {
      if (!i.lines.length) throw new Error("the score has no music to draw");
      return await o(i.lines, n, t);
    } finally {
      i.dispose();
    }
  }
};
function Fs(e, t) {
  const n = Nt(e), r = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && r?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function js(e, t) {
  const n = `- sheet music: ${e.job.file}`, r = Fs(t, e.job.file);
  if ("saved" in e) {
    r && wn(r, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), Le.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: o } = e, s = o instanceof De && o.hint ? `${o.message} ${o.hint}` : String(o instanceof Error ? o.message : o);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  r && wn(r, n, `${n} - not saved: ${s}`, "warning"), Le.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${s}`, life: 15e3 });
}
const qt = /* @__PURE__ */ new Map(), xn = new Vo(Ws, (e) => {
  js(e, qt.get(e.job.token)), qt.delete(e.job.token);
});
_n.registerExtension({
  name: Bs,
  getCustomWidgets: () => ({ [or]: us }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => vo(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ps(e), Ao(e, Hs);
    const n = Xr(t.input);
    if (n.size || t.name in It) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const s = uo(t, o), i = Wr(s), a = r?.call(this, s);
        return Vr(this, i, n), co(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = le(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) po(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, oo(this, ae));
      }, e.prototype.onExecuted = le(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    if (Pr.has(t.name) && Br(e, ae), t.name === "PlenioStemMixer") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, $s(this));
      }, e.prototype.onExecuted = le(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = le(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, s = o?.[o.length - 1];
      s && nn(String(this.id), s);
    }));
  },
  setup() {
    Ns(), ae.addEventListener("plenio.sheet", (n) => {
      const r = n.detail;
      if (!r?.node_id) return;
      nn(String(r.node_id), r);
      const o = Nt(r.node_id);
      o && Ee(o, Tn(r));
    }), ae.addEventListener("execution_start", () => {
      yo(ar()?.nodes ?? []);
    }), ae.addEventListener("execution_error", (n) => {
      const r = Nt(n.detail?.node_id);
      r && String(r.type).startsWith("Plenio") && Ee(r, "error");
    }), ae.addEventListener("executed", (n) => {
      const r = n.detail, o = Wo(r?.output), s = r?.display_node ?? r?.node;
      for (const i of o) qt.set(i.token, s);
      xn.take(o);
    });
    const e = () => {
      xn.recover();
    };
    let t = !1;
    ae.addEventListener("reconnected", () => {
      lr().then((n) => {
        n ? t || (t = !0, Le.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: At })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  gi as $,
  Hn as A,
  hi as B,
  di as C,
  cn as D,
  pi as E,
  Js as F,
  Qs as G,
  yi as H,
  Co as I,
  ve as J,
  ei as K,
  fi as L,
  ki as M,
  Wn as N,
  mi as O,
  De as P,
  Xs as Q,
  Bn as R,
  jn as S,
  U as T,
  wi as U,
  _i as V,
  vi as W,
  Er as X,
  Jo as Y,
  Uo as Z,
  Oo as _,
  Zs as a,
  Si as a0,
  Kn as a1,
  it as a2,
  xi as a3,
  ui as a4,
  Bs as a5,
  Ys as b,
  ri as c,
  On as d,
  ni as e,
  To as f,
  ii as g,
  ai as h,
  Ks as i,
  oi as j,
  si as k,
  st as l,
  Lo as m,
  we as n,
  li as o,
  ti as p,
  Yn as q,
  Ue as r,
  ci as s,
  Us as t,
  zo as u,
  Po as v,
  Xn as w,
  bi as x,
  Pn as y,
  Fn as z
};
