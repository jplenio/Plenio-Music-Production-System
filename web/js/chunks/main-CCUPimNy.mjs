import { api as Pn } from "../../../../scripts/api.js";
import { app as tn } from "../../../../scripts/app.js";
class Qe extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function se(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), i = await r.json();
  if (!r.ok) {
    const s = i?.error ?? {};
    throw new Qe(s.message ?? `Request failed (${r.status})`, s.hint ?? null);
  }
  return i;
}
function Dn(e, t) {
  return se(e, "/plenio/sheet/resolve", t);
}
async function es(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function bt(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function In(e, t, n, r) {
  return se(e, "/plenio/score/analyze", bt({ abc: t }, n, r));
}
function ts(e, t, n, r, i) {
  return se(e, "/plenio/score/transform", bt({ abc: t, operation: n }, r, i));
}
function ns(e, t) {
  const { lyrics: n, spans: r, ...i } = t;
  return se(e, "/plenio/score/musicxml/export", bt(i, n, r));
}
function rs(e, t) {
  return se(e, "/plenio/score/midi/export", t);
}
function is(e, t) {
  return se(e, "/plenio/score/midi/import", t);
}
function ss(e, t) {
  return se(e, "/plenio/lyrics/analyze", t);
}
function os(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function $t(e, t, n, r = 200) {
  return se(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
function Hn(e, t) {
  return se(e, "/plenio/brief/fields", t);
}
async function Wn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Qe(`Request failed (${t.status})`);
  return await t.json();
}
function J(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const Ce = [
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
], Fn = ["length", "vocals", "melody"], yt = {
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
}, Gn = "custom";
function nn(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Gn;
}
function ke(e, t) {
  const n = yt[t];
  if (n)
    return (e.widgets ?? []).find((r) => r.name === n);
}
function jn(e) {
  const t = {};
  for (const n of [...Ce, ...Fn]) {
    const r = ke(e, n);
    r && (t[n] = typeof r.value == "string" ? r.value : String(r.value ?? ""));
  }
  return t;
}
function Vn(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function At(e, t) {
  const n = [];
  for (const r of t.fills) {
    if (!Ce.includes(r.field)) continue;
    const i = ke(e, r.field);
    i && !String(i.value ?? "").trim() && r.value && n.push({ field: r.field, value: r.value });
  }
  return n;
}
function Nt(e) {
  const t = [];
  for (const n of Ce) {
    const r = ke(e, n);
    r && String(r.value ?? "").trim() && t.push(r);
  }
  return t;
}
function dt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Xn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((r) => `${r.field} (${Un(r.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Yn(e) {
  const t = e ? dt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Qn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Un(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function qt(e, t) {
  for (const n of t) {
    const r = ke(e, n.field);
    r && (r.value = n.value, r.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Kn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function rn(e) {
  const t = [];
  for (const n of Ce) {
    const r = ke(e, n);
    !r || !nn(r.value) || (r.value = "", r.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Lt = "plenio_brief_template", Jn = 400;
function Zn(e, t) {
  let n = null, r = !1, i = null, s;
  const a = document.createElement("div");
  a.className = "plenio-brief-template";
  const p = document.createElement("div");
  p.className = "line";
  const f = document.createElement("div");
  f.className = "hint";
  const u = document.createElement("div");
  u.className = "actions", a.append(p, f, u);
  const h = (g, m, b) => {
    const y = document.createElement("button");
    return y.textContent = g, y.title = m, y.addEventListener("click", (L) => {
      L.stopPropagation(), b();
    }), u.append(y), y;
  }, x = h("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (qt(e, At(e, n).map((g) => ({ field: g.field, value: g.value }))), _());
  }), k = h("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (qt(e, dt(n)), _());
  }), S = h("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const g = Nt(e);
    g.length && window.confirm(`Clear ${g.length} text field(s)? The template's values apply again.`) && (Kn(e, g), _());
  }), T = h("↻", "Ask again what the template fills", () => {
    I();
  }), _ = () => {
    const g = Xn(n, r);
    p.textContent = i ?? g ?? "The template fills nothing: every text field has your value.", p.dataset.state = i ? "error" : r && n ? "ok" : "empty";
    const m = Yn(n), b = Qn(n);
    f.textContent = [m, b].filter(Boolean).join(" · "), f.style.display = f.textContent ? "" : "none", u.style.display = r && n && n.template !== "none" ? "" : "none", x.disabled = !n || !At(e, n).length, k.disabled = !n || !dt(n).length, S.disabled = !Nt(e).length, T.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, A = /* @__PURE__ */ new WeakSet(), Y = () => {
    for (const g of ["template", ...Object.keys(yt)]) {
      const m = g === "template" ? e.widgets?.find((b) => b.name === "template") : ke(e, g);
      !m || A.has(m) || (A.add(m), m.callback = J(m.callback, () => {
        Y(), I();
      }));
    }
  }, l = async () => {
    Y();
    const g = String(e.widgets?.find((m) => m.name === "template")?.value ?? "none");
    try {
      n = await Hn(t, { fields: jn(e), template: g, kind: Vn(e) }), i = null;
    } catch (m) {
      n = null, i = `The template fields could not be read: ${m instanceof Error ? m.message : String(m)}`;
    }
    r = !0, _();
  };
  function I() {
    clearTimeout(s), s = setTimeout(() => {
      l();
    }, Jn);
  }
  Y();
  const $ = e.addDOMWidget(Lt, Lt, a, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return $.serialize = !1, rn(e), _(), I(), {
    widget: $,
    refresh: I,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const er = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function tr(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = e.prototype, i = r.onNodeCreated;
  r.onNodeCreated = function() {
    i?.call(this), n.set(this, Zn(this, t));
  };
  const s = r.onConfigure;
  r.onConfigure = function(a) {
    s?.call(this, a), rn(this), n.get(this)?.refresh();
  };
}
const nr = "COMFY_DYNAMICCOMBO_V3";
function rr(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function ir(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function sr(e, t) {
  const n = ir(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, i) => r.value === t[i]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function or(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ar(e, t, n) {
  if (!t || !e.widgets || sr(e, t)) return !1;
  let r = 0;
  for (let i = 0; i < e.widgets.length; i++) {
    const s = e.widgets[i];
    if (s.serialize === !1) continue;
    let a;
    if (Array.isArray(t)) {
      if (r >= t.length) break;
      a = t[r++];
    } else if (s.name in t)
      a = t[s.name];
    else
      continue;
    if (n.has(s.name) && !or(s, a)) return !0;
    s.value !== a && (s.value = a);
  }
  return !0;
}
function lr(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, i] of Object.entries(n ?? {}))
      Array.isArray(i) && i[0] === nr && t.add(r);
  return t;
}
const sn = "plenio.eq/1", Fe = 8, ue = 20, cr = 2e4, Se = 12, on = 15, we = ["peak", "low_shelf", "high_shelf"], an = ["peak", "notch", "highpass", "lowpass"], Ct = [0.2, 10], zt = [0.25, 1];
function ye() {
  return { schema: sn, preamp_db: 0, bands: [] };
}
function ur(e) {
  if (typeof e != "string" || !e.trim()) return ye();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: sn,
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
function ve(e) {
  return JSON.stringify(e);
}
const X = (e, t) => Number(e.toFixed(t));
function F(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function ln(e) {
  return e.db ?? on;
}
const Rt = [6, 12, 18], dr = { 6: 8, 12: 14, 18: 20 };
function pr(e, t) {
  return { ...e, db: dr[t] ?? on };
}
function fe(e, t) {
  return Math.log(F(t, ue, e.maxHz) / ue) / Math.log(e.maxHz / ue) * e.width;
}
function Ot(e, t) {
  return ue * (e.maxHz / ue) ** F(t / e.width, 0, 1);
}
function ce(e, t) {
  const n = ln(e);
  return (1 - (F(t, -n, n) + n) / (2 * n)) * e.height;
}
function Tt(e, t) {
  const n = ln(e);
  return (1 - F(t / e.height, 0, 1)) * 2 * n - n;
}
function Bt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Pt(e, t, n) {
  return t.map((r, i) => `${i ? "L" : "M"}${fe(e, r).toFixed(1)},${ce(e, n[i] ?? 0).toFixed(1)}`).join(" ");
}
function vt(e) {
  return Math.min(cr, 0.45 * e);
}
function fr(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function hr(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Fe) return null;
  const i = {
    id: fr(e),
    enabled: !0,
    type: "peak",
    frequency_hz: X(F(t, ue, vt(r)), 1),
    gain_db: X(F(n, -Se, Se), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, i] };
}
function Me(e, t, n, r, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: X(F(n, ue, vt(i)), 1),
        gain_db: we.includes(s.type) ? X(F(r, -Se, Se), 1) : s.gain_db
      }
    )
  };
}
function it(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: X(F(r.q * n, 0.2, 10), 3) } : r)
  };
}
function st(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function $e(e) {
  const t = e.frequency_hz >= 1e3 ? `${X(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = we.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${X(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${X(e.q, 2)}`;
}
function mr(e, t) {
  const n = cn[e.type] ?? e.type, r = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, i = we.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = an.includes(e.type) ? ` Q ${X(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${r}${i}${s}${e.enabled ? "" : " (off)"}`;
}
const cn = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function ot(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), r = 1;
  if (t && /k$/i.test(n) && (r = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const i = Number(n) * r;
  return Number.isFinite(i) ? i : null;
}
function Be(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Ge(e, t, n, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map((i) => {
      if (i.id !== t) return i;
      const s = { ...i, ...n };
      return {
        ...s,
        frequency_hz: X(F(Be(s.frequency_hz, i.frequency_hz), ue, vt(r)), 1),
        gain_db: X(F(Be(s.gain_db, i.gain_db), -Se, Se), 1),
        q: X(F(Be(s.q, i.q), Ct[0], Ct[1]), 3),
        slope: X(F(Be(s.slope, i.slope), zt[0], zt[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function Dt(e, t) {
  return Ge(e, t, { gain_db: 0 });
}
function It(e, t, n, { heightFraction: r = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const i = n.filter((x) => Number.isFinite(x));
  if (!i.length) return "";
  const s = Math.max(...i), a = Math.min(...i), p = Math.max(s - a, 1e-6), f = e.height - 4, u = f - Math.max(12, e.height * F(r, 0.1, 0.95));
  return `M${t.map((x, k) => {
    const S = n[k], T = Number.isFinite(S) ? (S - a) / p : 0;
    return `${fe(e, x).toFixed(1)},${(f - T * (f - u)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${f.toFixed(1)} L0,${f.toFixed(1)} Z`;
}
class gr {
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
    ve(t) !== ve(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const br = "http://www.w3.org/2000/svg", Ht = "plenio_eq_panel", Pe = "mode.bands", ae = { capture: !0 }, K = { width: 560, height: 260 }, De = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let at = null;
function re(e, t) {
  const n = document.createElementNS(br, e);
  for (const [r, i] of Object.entries(t)) n.setAttribute(r, String(i));
  return n;
}
function W(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function pe(e, t, n) {
  const r = document.createElement("button");
  return r.className = e, r.textContent = t, r.setAttribute("aria-label", n), r.title = n, r;
}
function ie(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function yr(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, r) => {
    const i = t.bands[r];
    return i !== void 0 && n.type === i.type && n.enabled === i.enabled && Math.abs(n.frequency_hz - i.frequency_hz) < 0.5 && Math.abs(n.gain_db - i.gain_db) < 0.05 && Math.abs(n.q - i.q) < 0.01;
  });
}
function vr(e, t) {
  const n = W("div", "plenio-eq"), r = W("div", "plenio-eq-tools"), i = W("select");
  i.setAttribute("aria-label", "EQ preset"), i.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = W("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of Rt) s.append(new Option(`±${o} dB`, String(o)));
  const a = pe("", "↶", "Undo the last band change"), p = pe("", "↷", "Redo the last band change"), f = pe("", "reset", "Remove every band"), u = pe("", "compare", "Show the curve without the EQ (bypass)"), h = pe("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), x = W("span", "plenio-eq-info");
  x.setAttribute("aria-live", "polite"), x.title = "What the panel is showing right now (the selected band, a note, or a hint)", r.append(i, s, a, p, f, u, h, x);
  const k = W("div", "plenio-eq-mode"), S = re("svg", {
    viewBox: `0 0 ${K.width} ${K.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  S.setAttribute("aria-label", "EQ response curve"), S.setAttribute("tabindex", "0"), S.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const T = W("div", "plenio-eq-strip"), _ = W("div", "plenio-eq-editor"), A = W("div", "plenio-eq-fields");
  _.append(A), n.append(r, k, S, T, _);
  const Y = e.addDOMWidget(Ht, Ht, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  let l = { sampleRate: 48e3, frequencies: [], response: [], settings: ye(), readonly: !0, note: "" }, I = null, $ = null, g = !1, m = 12, b = null, y = [], L = 0, E, G, N = null, B = !1;
  const H = /* @__PURE__ */ new Map();
  let q = null;
  const P = new gr(ye()), ee = () => ie(e, Pe), j = () => m, C = () => pr({ ...K, maxHz: Math.min(2e4, l.sampleRate / 2) }, j());
  function z(o, { record: d = !0 } = {}) {
    const c = ee();
    if (!c) return;
    const v = ve(o);
    c.value = v, c.callback?.(v), d && P.push(o), l = { ...l, settings: o }, U(), oe(0);
  }
  async function oe(o = 120) {
    clearTimeout(E), E = setTimeout(async () => {
      const d = String(ie(e, "mode")?.value ?? "flat");
      if (d !== "manual") {
        d === "flat" ? l = {
          ...l,
          settings: ye(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : I !== d ? l = {
          ...l,
          settings: ye(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: `${d}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : l = { ...l, readonly: !0 }, U();
        return;
      }
      const c = ur(ee()?.value);
      if (!c) {
        l = { ...l, readonly: !0, note: "the bands are not valid JSON" }, U();
        return;
      }
      ve(c) !== ve(P.current) && P.reset(c);
      const v = ++L;
      try {
        const M = await $t(t, c, l.sampleRate);
        if (v !== L) return;
        l = {
          ...l,
          frequencies: M.frequency_hz,
          response: M.response_db,
          settings: M.settings,
          readonly: !1,
          note: ""
        };
      } catch (M) {
        l = { ...l, readonly: !1, note: M instanceof Error ? M.message : String(M) };
      }
      U();
    }, o);
  }
  const te = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Fe)
  });
  function ge() {
    if (!b) return "";
    const o = y.find((d) => d.name === b);
    return o && yr(te(o), l.settings) ? b : "";
  }
  function U() {
    S.replaceChildren(), H.clear(), q = null;
    const o = C();
    for (const c of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      S.append(
        re("line", { x1: 0, x2: o.width, y1: ce(o, c), y2: ce(o, c), class: c ? "grid" : "grid zero" })
      );
    for (const c of [100, 1e3, 1e4])
      S.append(re("line", { x1: fe(o, c), x2: fe(o, c), y1: 0, y2: o.height, class: "grid" }));
    l.beforeDb?.length === l.frequencies.length && S.append(re("path", { d: It(o, l.frequencies, l.beforeDb), class: "spectrum before" })), l.afterDb?.length === l.frequencies.length && S.append(re("path", { d: It(o, l.frequencies, l.afterDb), class: "spectrum after" })), g ? S.append(re("line", { x1: 0, x2: o.width, y1: ce(o, 0), y2: ce(o, 0), class: "curve flat" })) : l.frequencies.length && (q = re("path", { d: Pt(o, l.frequencies, l.response), class: "curve" }), S.append(q)), !l.readonly && !g && l.settings.bands.forEach((c, v) => {
      const M = De[v % De.length], R = we.includes(c.type) ? c.gain_db : 0, w = re("circle", {
        cx: fe(o, c.frequency_hz),
        cy: ce(o, R),
        r: c.id === $ ? 9 : 7,
        class: c.id === $ ? "handle selected" : "handle",
        style: `stroke: ${M}`,
        tabindex: 0,
        "data-band": c.id
      });
      w.setAttribute("aria-label", `Band ${v + 1}: ${$e(c)}`), c.enabled || w.classList.add("disabled"), w.append(re("title", {})), w.lastChild.textContent = `Band ${v + 1}: ${$e(c)}`, w.addEventListener("pointerdown", (D) => Nn(D, c.id)), w.addEventListener("dblclick", (D) => {
        D.stopPropagation(), z(Dt(l.settings, c.id));
      }), w.addEventListener("focus", () => Mn(c.id)), w.addEventListener("keydown", (D) => St(D, c.id)), w.addEventListener("wheel", (D) => {
        D.preventDefault();
        const de = D.deltaY < 0 ? 1.15 : 1 / 1.15;
        z(it(l.settings, c.id, de));
      }), w.addEventListener("contextmenu", (D) => {
        D.preventDefault(), z(st(l.settings, c.id));
      }), S.append(w), H.set(c.id, w);
    }), Sn(), En(), kn();
    const d = l.settings.bands.find((c) => c.id === $);
    x.textContent = l.note || (g ? "compare: the curve is off (the node still applies it)" : d ? $e(d) : l.readonly ? `${l.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${l.settings.bands.length}/${Fe}`), i.disabled = l.readonly, a.disabled = !P.canUndo, p.disabled = !P.canRedo, f.disabled = l.readonly || !l.settings.bands.length, B && (B = !1, $ && H.get($)?.focus({ preventScroll: !0 })), s.value = String(m), i.value = ge(), u.classList.toggle("active", g), h.classList.toggle("active", et()), e.setDirtyCanvas?.(!0, !0);
  }
  function Sn() {
    if (T.replaceChildren(), l.readonly && !l.settings.bands.length) {
      T.append(W("span", "plenio-eq-hint", l.note || "no bands"));
      return;
    }
    l.settings.bands.forEach((o, d) => {
      const c = W("button", "plenio-eq-chip", mr(o, d));
      c.style.borderLeftColor = De[d % De.length], c.classList.toggle("selected", o.id === $), c.classList.toggle("disabled", !o.enabled), c.setAttribute("aria-label", `Edit band ${d + 1}`), c.title = `Band ${d + 1}: ${$e(o)} - click to open its fields`, c.addEventListener("click", (v) => {
        v.stopPropagation(), $ = $ === o.id ? null : o.id, U();
      }), T.append(c);
    });
  }
  function En() {
    A.replaceChildren();
    const o = l.settings.bands.find((w) => w.id === $);
    if (!o || l.readonly) {
      _.style.display = "none";
      return;
    }
    _.style.display = "";
    const d = W("span", "name", `Band ${l.settings.bands.indexOf(o) + 1}`);
    d.title = "The selected band";
    const c = W("select");
    c.setAttribute("aria-label", "Band type"), c.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [w, D] of Object.entries(cn)) c.append(new Option(D, w));
    c.value = o.type, c.addEventListener("change", () => z(Ge(l.settings, o.id, { type: c.value })));
    const v = W("input");
    v.type = "checkbox", v.checked = o.enabled, v.setAttribute("aria-label", "Band enabled"), v.title = "Band enabled: off keeps the band in the list but out of the response", v.addEventListener("change", () => z(Ge(l.settings, o.id, { enabled: v.checked })));
    const M = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (w) => nt(o.id, "frequency_hz", ot(w, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (w) => nt(o.id, "gain_db", ot(w))],
      ["Q", `${o.q}`, 60, (w) => nt(o.id, "q", ot(w))]
    ];
    A.append(d, c, v);
    for (const [w, D, de, Re] of M) {
      const V = W("input", "number");
      V.value = D, V.style.width = `${de}px`, V.setAttribute("aria-label", `Band ${w}`), V.title = w === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : w === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Oe = () => {
        Re(V.value) || (V.value = D);
      };
      V.addEventListener("keydown", (ne) => {
        ne.key === "Enter" && Oe();
      }), V.addEventListener("blur", Oe), (w === "dB" && !we.includes(o.type) || w === "Q" && !an.includes(o.type)) && (V.disabled = !0), A.append(V);
    }
    const R = pe("", "remove", "Remove this band");
    R.addEventListener("click", (w) => {
      w.stopPropagation(), $ = null, z(st(l.settings, o.id));
    }), A.append(R);
  }
  function kn() {
    k.replaceChildren();
    const o = String(ie(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      k.style.display = "none";
      return;
    }
    k.style.display = "", k.append(
      W(
        "span",
        "plenio-eq-hint",
        I === o ? `applied proposal (${l.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const d = pe("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    d.disabled = !l.settings.bands.length, d.addEventListener("click", (c) => {
      c.stopPropagation();
      const v = ie(e, "mode");
      if (!v) return;
      v.value = "manual", v.callback?.("manual");
      const M = ee();
      if (M) {
        const R = ve(l.settings);
        M.value = R, M.callback?.(R);
      }
      P.reset(l.settings), rt(), oe(0);
    }), k.append(d);
  }
  function Mn(o) {
    $ = o, B = !0, U();
  }
  function $n(o) {
    $ = o, Ze();
  }
  function Ze() {
    const o = C();
    l.settings.bands.forEach((c) => {
      const v = H.get(c.id);
      if (!v) return;
      const M = we.includes(c.type) ? c.gain_db : 0;
      v.setAttribute("cx", String(fe(o, c.frequency_hz))), v.setAttribute("cy", String(ce(o, M))), v.classList.toggle("selected", c.id === $), v.setAttribute("r", c.id === $ ? "9" : "7");
    }), q && l.frequencies.length && q.setAttribute("d", Pt(o, l.frequencies, l.response));
    const d = l.settings.bands.find((c) => c.id === $);
    d && (x.textContent = $e(d));
  }
  function An() {
    clearTimeout(G), G = setTimeout(async () => {
      const o = l.settings, d = ++L;
      try {
        const c = await $t(t, o, l.sampleRate);
        if (d !== L) return;
        l = { ...l, frequencies: c.frequency_hz, response: c.response_db }, Ze();
      } catch {
      }
    }, 60);
  }
  function et() {
    return !ie(e, Pe)?.plenioHidden;
  }
  function tt(o) {
    const d = ie(e, Pe);
    d && (d.plenioHidden = !o, o ? delete d.computeSize : d.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function nt(o, d, c) {
    if (c === null) return !1;
    const v = l.settings.bands.find((M) => M.id === o);
    return v && v[d] === c || z(Ge(l.settings, o, { [d]: c })), !0;
  }
  function Nn(o, d) {
    o.preventDefault(), o.stopPropagation(), $ !== d && $n(d);
    const c = l.settings.bands.find((Q) => Q.id === d);
    if (!c) return;
    N = { hz: c.frequency_hz, db: c.gain_db };
    let v = !1, M = !1;
    const R = o.currentTarget;
    try {
      R?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const w = S.getBoundingClientRect(), D = w.width ? w.left : 0, de = w.height ? w.top : 0, Re = w.width || K.width, V = w.height || K.height, Oe = (Q, Te) => Q >= D - 1 && Q <= D + Re + 1 && Te >= de - 1 && Te <= de + V + 1;
    function ne() {
      if (!M) {
        M = !0;
        try {
          R?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Mt, ae), window.removeEventListener("pointerup", ne, ae), window.removeEventListener("pointercancel", ne, ae), window.removeEventListener("blur", ne, ae), N = null, v && z(l.settings);
      }
    }
    const Mt = (Q) => {
      if (M || !N) return;
      if (Q.buttons === 0) {
        ne();
        return;
      }
      if (!Oe(Q.clientX, Q.clientY)) return;
      const Te = K.width / Re, Ln = K.height / V, Cn = (Q.clientX - D) * Te, zn = (Q.clientY - de) * Ln, Rn = fe(C(), N.hz), On = ce(C(), N.db), Tn = Ot(C(), Bt(Rn, Cn, Q.shiftKey)), Bn = Tt(C(), Bt(On, zn, Q.shiftKey));
      l = { ...l, settings: Me(l.settings, d, Tn, Bn, l.sampleRate) }, v = !0, Ze(), An();
    };
    window.addEventListener("pointermove", Mt, ae), window.addEventListener("pointerup", ne, ae), window.addEventListener("pointercancel", ne, ae), window.addEventListener("blur", ne, ae);
  }
  function St(o, d) {
    const c = l.settings.bands.find((w) => w.id === d);
    if (!c) return;
    const v = o.shiftKey ? 0.1 : 0.5, M = o.shiftKey ? 1.01 : 1.06;
    let R = null;
    o.key === "ArrowUp" ? R = Me(l.settings, d, c.frequency_hz, c.gain_db + v, l.sampleRate) : o.key === "ArrowDown" ? R = Me(l.settings, d, c.frequency_hz, c.gain_db - v, l.sampleRate) : o.key === "ArrowRight" ? R = Me(l.settings, d, c.frequency_hz * M, c.gain_db, l.sampleRate) : o.key === "ArrowLeft" ? R = Me(l.settings, d, c.frequency_hz / M, c.gain_db, l.sampleRate) : o.key === "+" ? R = it(l.settings, d, 1.15) : o.key === "-" ? R = it(l.settings, d, 1 / 1.15) : o.key === "0" ? R = Dt(l.settings, d) : (o.key === "Delete" || o.key === "Backspace") && (R = st(l.settings, d)), R && (o.preventDefault(), z(R));
  }
  S.addEventListener("keydown", (o) => {
    $ && o.target === S && St(o, $);
  }), S.addEventListener("dblclick", (o) => {
    if (l.readonly || g) return;
    const d = S.getBoundingClientRect(), c = K.width / (d.width || K.width), v = K.height / (d.height || K.height), M = (o.clientX - d.left) * c, R = (o.clientY - d.top) * v, w = hr(l.settings, Ot(C(), M), Tt(C(), R), l.sampleRate);
    w ? ($ = w.bands[w.bands.length - 1].id, z(w)) : (l = { ...l, note: `the EQ has at most ${Fe} bands` }, U());
  }), i.append(new Option("preset…", "")), at ??= Wn(t).then((o) => o.manual).catch(() => []), at.then((o) => {
    y = o;
    for (const d of o) i.append(new Option(d.name, d.name));
    i.value = ge();
  }), i.addEventListener("change", async () => {
    const o = (await at)?.find((d) => d.name === i.value);
    o && (b = o.name, z(te(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    m = Rt.find((d) => d === o) ?? 12, U();
  }), a.addEventListener("click", () => {
    const o = P.undo();
    o && z(o, { record: !1 });
  }), p.addEventListener("click", () => {
    const o = P.redo();
    o && z(o, { record: !1 });
  }), f.addEventListener("click", () => {
    $ = null, z(ye());
  }), u.addEventListener("click", () => {
    g = !g, U();
  }), h.addEventListener("click", () => {
    tt(!et()), U();
  });
  function rt() {
    for (const o of ["mode", Pe]) {
      const d = ie(e, o);
      if (!d || d.plenioWatched) continue;
      d.plenioWatched = !0;
      const c = d.callback;
      d.callback = (v) => {
        c?.(v), setTimeout(() => {
          et() || tt(!1), oe();
        });
      };
    }
  }
  rt(), tt(!1), oe(0);
  let Et = null, kt = null;
  const qn = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(qn);
      return;
    }
    const o = String(ie(e, "mode")?.value ?? "flat"), d = String(ee()?.value ?? "");
    o === Et && d === kt || (Et = o, kt = d, rt(), oe(0));
  }, 700);
  return {
    showExecuted(o) {
      const d = o?.plenio_eq, c = d?.[d.length - 1];
      if (!c) return;
      const v = String(ie(e, "mode")?.value ?? "flat"), M = v === "manual";
      I = M || v === "flat" ? null : v, l = {
        sampleRate: c.sample_rate,
        frequencies: c.frequency_hz,
        response: c.response_db,
        settings: c.settings,
        readonly: !M,
        note: M ? "" : `applied: ${c.settings.bands.length} band(s)`,
        beforeDb: c.spectrum_before_db,
        afterDb: c.spectrum_after_db
      }, M ? oe(0) : U();
    }
  };
}
const wt = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, wr = new Set(Ce.map((e) => yt[e]));
function xr(e, t) {
  return !(e in wt) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, r]) => wr.has(n) && nn(r)).map(([n]) => n);
}
function _r(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const r = n?.[t];
    if (!Array.isArray(r)) continue;
    if (Array.isArray(r[0])) return r[0];
    const i = r[1]?.options;
    return Array.isArray(i) ? i : [];
  }
  return [];
}
function Sr(e, t) {
  const n = wt[e.name];
  if (!n || !t) return t;
  const r = _r(e, "mode"), i = t.widgets_values, s = t.widgets_values_named;
  let a = t;
  Array.isArray(i) && i.length && !r.includes(i[0]) && (a = { ...a, widgets_values: [n, ...i] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (a = { ...a, widgets_values_named: { mode: n, ...s } });
  const p = xr(e.name, a.widgets_values_named);
  if (p.length) {
    const f = { ...a.widgets_values_named };
    for (const u of p) f[u] = "";
    a = { ...a, widgets_values_named: f };
  }
  return a;
}
const un = /* @__PURE__ */ new Map(), pt = /* @__PURE__ */ new Set();
function Wt(e, t) {
  un.set(e, t);
  for (const n of pt) n(e);
}
function be(e) {
  return un.get(e) ?? null;
}
function Er(e) {
  return pt.add(e), () => pt.delete(e);
}
const dn = /* @__PURE__ */ new Map();
function kr(e) {
  e?.draft_sha256 && dn.set(e.draft_sha256, e);
}
function Mr(e) {
  return e ? dn.get(e) ?? null : null;
}
const lt = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function $r(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function Ar(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function pn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Nr(e) {
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
const Ve = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new Set();
function fn(e) {
  return Ve.get(e) ?? null;
}
function xe(e, t) {
  t ? Ve.set(e, t) : Ve.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ne) n(e);
}
function qr(e) {
  for (const t of e) Ve.delete(t);
  for (const t of Ne) t(null);
}
function Lr() {
  for (const e of Ne) e(null);
}
function Cr(e) {
  return Ne.add(e), () => Ne.delete(e);
}
const Ft = "600 12px sans-serif", Ie = 20, ct = 7;
function zr(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Rr(e) {
  const t = e ? zr(e) : "";
  return {
    height: e ? Ie : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Ft;
      const r = n.measureText(t).width + 2 * ct;
      return n.restore(), r;
    },
    draw(n, r, i) {
      if (!e) return;
      n.save(), n.font = Ft;
      const s = n.measureText(t).width + 2 * ct;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(r, i, s, Ie, 5) : n.rect(r, i, s, Ie), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, r + ct, i + Ie / 2 + 0.5), n.restore();
    }
  };
}
const Or = "PlenioSongSheet", Tr = 30;
function hn(e, t) {
  const n = e.widgets?.find((r) => r.name === t);
  return n ? String(n.value ?? "") : null;
}
function Br(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? hn(n, "mode") : null;
  } catch {
    return null;
  }
}
function ft(e) {
  const t = fn(e);
  return t || (e.type !== Or ? null : Ar(hn(e, "review") ?? "continue", Br(e)) ? "stop" : null);
}
function Pr(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return pn(n);
  const r = e?.plenio_summary;
  return $r(r?.[r.length - 1]?.status);
}
function Dr(e, t) {
  const n = e.prototype, r = n.onNodeCreated;
  n.onNodeCreated = function() {
    r?.call(this);
    const i = this;
    i.badges?.push(() => {
      const s = ft(i);
      return Rr(s ? lt[s] : null);
    });
  }, n.onDrawForeground = J(n.onDrawForeground, function(i) {
    const s = ft(this);
    !s || !lt[s].frame || this.flags?.collapsed || !this.size || Ir(i, lt[s], this.size, Tr, t.scale());
  }), n.onExecuted = J(n.onExecuted, function(i) {
    const s = Pr(i);
    s && (xe(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function Ir(e, t, n, r, i) {
  const s = Math.max(3, 3 / Math.max(i, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const a = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-a, -r - a, n[0] + 2 * a, n[1] + r + 2 * a, 10) : e.rect(-a, -r - a, n[0] + 2 * a, n[1] + r + 2 * a), e.stroke(), e.restore();
}
function Hr(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function Wr(e, t) {
  return `${e}:${t}`;
}
function Fr(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { section: Number(t[1]), line: Number(t[2]) } : null;
}
function Ue(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length !== 2) continue;
    const [r, i] = n;
    Number.isInteger(r) && Number.isInteger(i) && r >= 0 && i > r && t.push([r, i]);
  }
  return t.sort((n, r) => n[0] - r[0] || n[1] - r[1]);
}
function Gr(e, t) {
  return e.length === t.length && e.every((n, r) => n[0] === t[r][0] && n[1] === t[r][1]);
}
function xt(e, t) {
  const n = e.sections[t];
  if (!n) return [0, 0];
  const r = e.measures[n.first_bar - 1]?.onset ?? 0, i = e.measures[n.first_bar - 1 + n.bars]?.onset ?? e.total;
  return [r, i];
}
function jr(e, t) {
  for (let n = 0; n < e.sections.length; n++) {
    const [r, i] = xt(e, n);
    if (t >= r && t < i) return n;
  }
  return -1;
}
function Vr(e, t, n, r) {
  const i = t.sections.find((x) => x.section === n), [s, a] = xt(e, n), p = Math.max(1, Math.round(e.grid.units_per_quarter)), f = new Map((i?.lines ?? []).map((x) => [x.line, x])), u = [];
  let h = s;
  return r.forEach((x, k) => {
    const S = f.get(k);
    let T = S ? S.start : h, _ = S ? Math.max(S.end, S.start + 1) : T + p;
    S && S.end <= S.start && (_ = T + p), T = Math.min(Math.max(T, s), a - 1), _ = Math.min(Math.max(_, T + 1), a), u.push({ id: String(k), text: x, start: T, end: _ }), h = _;
  }), u;
}
function Xr(e, t) {
  const [n, r] = t, i = e.map((u, h) => {
    const x = Math.max(1, Math.min(u.end - u.start, r - n)), k = Math.min(Math.max(u.start, n), r - 1);
    return { line: { ...u, start: k, end: Math.min(k + x, r) }, index: h, placed: u.id.startsWith("*") };
  }), s = i.filter((u) => u.placed).sort((u, h) => u.line.start - h.line.start), a = (u) => {
    let h = u;
    for (const x of s) h >= x.line.start && h < x.line.end && (h = x.line.end);
    return h;
  };
  let p = n;
  for (const u of i.filter((h) => !h.placed).sort((h, x) => h.line.start - x.line.start || h.index - x.index)) {
    const { start: h, end: x } = u.line;
    let k = a(Math.max(h, p));
    for (; k !== a(k); ) k = a(k);
    const S = x > k ? x : k + (x - h);
    u.line.start = Math.min(k, r - 1), u.line.end = Math.min(Math.max(S, u.line.start + 1), r), p = u.line.end;
  }
  const f = i.sort((u, h) => u.line.start - h.line.start || Number(h.placed) - Number(u.placed) || u.index - h.index).map((u) => u.line);
  for (let u = 0; u < f.length; u++) {
    const h = f[u + 1];
    h && h.start <= f[u].start && (h.start = Math.min(f[u].start + 1, r - 1)), h && f[u].end > h.start && (f[u].end = h.start), f[u].end <= f[u].start && (f[u].end = Math.min(f[u].start + 1, r));
  }
  return f;
}
function Yr(e, t, n) {
  const r = e.filter(([i]) => i < t[0] || i >= t[1]);
  return Ue([...r, ...n.map((i) => [i.start, i.end])]);
}
function Qr(e, t) {
  const n = [];
  for (const [r, i] of e)
    for (const [s, a, p] of t) {
      if (r < s || r >= a) continue;
      const f = p - s;
      n.push([r + f, Math.min(i, a) + f]);
    }
  return Ue(n);
}
function Ur(e) {
  const t = [...e].sort((r, i) => r.start - i.start), n = t[0]?.start ?? 0;
  return t.map((r) => ({ text: r.text, offset: r.start - n, length: r.end - r.start }));
}
const Kr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: Ur,
  lineKey: Wr,
  parseLineKey: Fr,
  parseShift: Hr,
  parseSpans: Ue,
  placedLines: Vr,
  remapSpans: Qr,
  sameSpans: Gr,
  sectionAt: jr,
  sectionRange: xt,
  settle: Xr,
  withSectionSpans: Yr
}, Symbol.toStringTag, { value: "Module" }));
function Jr(e) {
  const t = e?.plenio_notation;
  if (!Array.isArray(t)) return [];
  const n = (i) => typeof i == "string" ? i : "", r = (i) => i == null || i === "" ? null : String(i);
  return t.filter((i) => !!i && typeof i == "object").map((i) => ({
    token: n(i.token),
    file: n(i.file),
    title: n(i.title),
    paper: i.paper === "letter" ? "letter" : "a4",
    abc: n(i.abc),
    lyrics: n(i.lyrics),
    display_abc: n(i.display_abc),
    score_sheet: r(i.score_sheet),
    lyrics_sheet: r(i.lyrics_sheet)
  })).filter((i) => i.token && i.file && i.display_abc);
}
function Zr(e, t) {
  for (const n of [e.score_sheet, e.lyrics_sheet]) {
    if (!n) continue;
    const r = Ue(t.property(n));
    if (r.length) return r;
  }
  return [];
}
async function ei(e, t) {
  const n = e.lyrics.trim() ? Zr(e, t) : [];
  return n.length ? (await In(t.fetcher, e.abc, e.lyrics, n)).display_abc ?? e.display_abc : e.display_abc;
}
async function ti(e, t) {
  const n = await t.draw(await ei(e, t), e.title, e.paper), r = new ArrayBuffer(n.length);
  new Uint8Array(r).set(n);
  const i = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([r], { type: "application/pdf" })
  }), s = await i.json().catch(() => ({}));
  if (!i.ok)
    throw new Qe(s.error?.message ?? `Saving the sheet music failed (${i.status})`, s.error?.hint ?? null);
  return { file: s.file ?? e.file, bytes: s.bytes ?? n.length };
}
let Gt = Promise.resolve();
function ni(e) {
  const t = Gt.then(e, e);
  return Gt = t.catch(() => {
  }), t;
}
const _t = "plenio.sheet_state/1", Ke = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Je() {
  return { schema: _t, docs: {} };
}
function Ee(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Je();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== _t || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Xe(e) {
  const t = {};
  for (const r of Ke) {
    const i = e.docs[r];
    i && (t[r] = i);
  }
  const n = { schema: _t, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ut(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function ri(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ke.filter((r) => ut(e, r) !== "auto").map(
    (r) => r === "lyrics" && ut(e, r) === "manual" ? "lyrics: yours (manual)" : `${r.replace("_", " ")} ${ut(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
const as = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; simple keeps the music model’s own plan.";
function ls(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function jt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), r = Math.round(t - n * 60);
  return `${n}:${String(r).padStart(2, "0")}`;
}
function cs(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const i = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: jt(i?.[0] ?? 0), end: jt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function me(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((i) => i.replace(/\s+$/, ""));
  let n = 0, r = t.length;
  for (; n < r && !t[n]; ) n++;
  for (; r > n && !t[r - 1]; ) r--;
  return t.slice(n, r).join(`
`);
}
function ii(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function us(e, t, n) {
  return n.map((r) => ({ kind: r, text: ii(e, t, r), intent: "keep" }));
}
function mn(e, t, n) {
  const r = { ...e.docs };
  for (const s of n) {
    const a = e.docs[s.kind], p = t?.docs[s.kind], f = me(s.text);
    if (s.intent === "auto")
      delete r[s.kind];
    else if (s.intent === "manual")
      r[s.kind] = { state: "manual", text: f };
    else if (s.intent === "rebase")
      p?.upstream_sha256 ? r[s.kind] = { state: "edited", text: f, base_sha256: p.upstream_sha256 } : r[s.kind] = { state: "manual", text: f };
    else if (a)
      me(a.text) !== f && (r[s.kind] = { ...a, text: f });
    else {
      const u = me(p?.upstream ?? "");
      if (f === u) continue;
      r[s.kind] = p?.upstream_sha256 ? { state: "edited", text: f, base_sha256: p.upstream_sha256 } : { state: "manual", text: f };
    }
  }
  const i = { ...Je(), docs: r };
  return e.review?.approved_fingerprint && (i.review = { approved_fingerprint: e.review.approved_fingerprint }), i;
}
function si(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function oi(e, t) {
  return Ke.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function ai(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const li = "PlenioSongSheet";
function ze(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function gn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const r = e.graph, i = r?.links, s = r?.getLink?.(n) ?? (i instanceof Map ? i.get(n) : i?.[String(n)]);
    return s && r?.getNodeById ? r.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function bn(e, t) {
  const n = (e.inputs ?? []).findIndex((r) => r.name === t && r.link != null);
  return n < 0 ? null : gn(e, n);
}
function yn(e, t) {
  const n = bn(e, t);
  return n && (n.comfyClass ?? n.type) === li && ze(n) ? n : null;
}
function ci(e) {
  return yn(e, "context_lyrics");
}
function ui(e) {
  return yn(e, "context_score");
}
function di(e, t, n) {
  const r = [], i = bn(t, n);
  i && r.push(i);
  const s = /* @__PURE__ */ new Set();
  for (; r.length && s.size < 1e3; ) {
    const a = r.shift(), p = String(a.id);
    if (!s.has(p)) {
      if (s.add(p), a === e || p === String(e.id)) return !0;
      (a.inputs ?? []).forEach((f, u) => {
        const h = gn(a, u);
        h && r.push(h);
      });
    }
  }
  return !1;
}
function pi(e, t, n) {
  const r = ci(e), i = t?.context?.lyrics;
  if (!r || !i) return null;
  const s = r.title || "Song Sheet", a = Ee(ze(r)?.value), p = a?.docs.lyrics?.text ?? n(String(r.id))?.docs.lyrics?.upstream ?? null;
  let f = null;
  return a === null ? f = `The state of ${s} is unreadable - open that sheet and apply it first.` : p !== null && me(p) !== me(i) && (f = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: r, target: { title: s, blocked: f, replans: di(r, e, "score") } };
}
function fi(e, t, n) {
  const r = ze(e);
  if (!r) return;
  const i = Ee(r.value) ?? Je();
  r.value = Xe(mn(i, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function hi(e, t, n) {
  const r = ui(e), i = t?.context?.score;
  if (!r || !i) return null;
  const s = r.title || "Song Sheet", a = Ee(ze(r)?.value), p = a?.docs.score?.text ?? n(String(r.id))?.docs.score?.upstream ?? null;
  let f = null;
  return a === null ? f = `The state of ${s} is unreadable - open that sheet and apply it first.` : p !== null && me(p) !== me(i) && (f = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: r, target: { title: s, blocked: f } };
}
function mi(e, t) {
  const n = String(e.widgets?.find((r) => r.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function gi(e, t, n, r = null) {
  const i = ze(e);
  if (!i) return null;
  const s = Ee(i.value) ?? Je(), a = mn(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (i.value = Xe(a), e.setDirtyCanvas?.(!0, !0), !r || !n) return a;
  try {
    const p = await Dn(r.fetcher, {
      sheet_state: a,
      upstream: ai(n),
      owned: n.owned,
      review: mi(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!p.findings.some((h) => h.severity === "error") || !p.fingerprint) return a;
    const u = si(a, p.fingerprint);
    return i.value = Xe(u), e.setDirtyCanvas?.(!0, !0), u;
  } catch {
    return a;
  }
}
const vn = "PLENIO_SHEET_STATE", Vt = 68;
let je = null;
function bi(e) {
  je = e;
}
const yi = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const i = document.createElement("div");
  i.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const a = document.createElement("button");
  a.className = "plenio-sheet-open", a.textContent = "Edit Song Sheet…";
  const p = document.createElement("div");
  p.className = "plenio-sheet-status", i.append(a, s, p);
  let f = !1;
  const u = () => {
    const _ = be(String(e.id)), A = ft(e);
    s.textContent = ri(Ee(r)) + (_ && A !== "approved" ? ` · ${_.status}` : ""), p.textContent = Nr(A), p.dataset.state = A ?? "";
    const Y = f ? null : e.widgets?.find((l) => l.name === "review");
    if (Y) {
      f = !0;
      const l = Y.callback;
      Y.callback = (I) => {
        l?.(I), u();
      };
    }
  }, h = e.addDOMWidget(t, vn, i, {
    getValue: () => r,
    setValue: (_) => {
      r = typeof _ == "string" ? _ : "", u();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Vt,
    getMaxHeight: () => Vt
  });
  a.addEventListener("click", (_) => {
    _.stopPropagation(), x().catch((A) => {
      console.error("Plenio: the Song Sheet editor could not open", A), s.textContent = `The editor could not open: ${A instanceof Error ? A.message : String(A)}`;
    });
  });
  async function x() {
    const _ = Ee(r);
    _ === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const A = be(String(e.id)), l = (e.inputs ?? []).filter((q) => q.link != null).map((q) => q.name), I = _ ?? { schema: "plenio.sheet_state/1", docs: {} }, $ = A?.owned ?? oi(l, I), g = String(e.widgets?.find((q) => q.name === "review")?.value ?? "continue"), m = g === "as the brief says" ? A?.review ?? "continue" : g, { openSheetDialog: b } = await import("./open-B8HUZ7ho.mjs"), { parseGuide: y, serializeGuide: L } = await import("./tracks-DxmZeggM.mjs"), { parseShift: E, parseSpans: G } = await Promise.resolve().then(() => Kr);
    if (!je) throw new Error("Plenio: API not initialised");
    let N = null;
    try {
      N = pi(e, A, be);
    } catch (q) {
      console.warn("Plenio: the lyrics sheet of this score was not found", q);
    }
    let B = null;
    try {
      B = hi(e, A, be);
    } catch (q) {
      console.warn("Plenio: the score sheet of these lyrics was not found", q);
    }
    const H = je;
    b({
      title: e.title || "Song Sheet",
      state: I,
      payload: A,
      asrNote: Mr(A?.docs.lyrics?.upstream_sha256),
      owned: $.length ? $ : [...Ke],
      review: m,
      fetcher: je,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: y(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: G(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: E(e.properties?.plenio_source_shift),
      lyricsTarget: N?.target ?? null,
      scoreTarget: B?.target ?? null,
      onApply: (q, P, ee, j, C, z) => {
        const oe = String(h.value ?? "");
        if (h.value = Xe(q), e.properties = {
          ...e.properties ?? {},
          plenio_guide: L(P),
          plenio_lyric_spans: (z?.lyricSpans ?? []).map(([te, ge]) => [te, ge]),
          plenio_source_shift: z?.sourceShift ?? 0
        }, C ? xe(e, "approved") : String(h.value) !== oe && k(e), ee !== null && N && !N.target.blocked && (fi(N.owner, ee, be(String(N.owner.id))), k(N.owner)), j && B && !B.target.blocked) {
          const te = B.owner;
          gi(te, j.text, be(String(te.id)), j.approved ? { fetcher: H } : null).then(
            (ge) => {
              ge?.review?.approved_fingerprint ? xe(te, "approved") : k(te);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function k(_) {
    fn(_) === "approved" && xe(_, null);
  }
  const S = [
    Er((_) => {
      _ === String(e.id) && u();
    }),
    Cr((_) => {
      (_ === null || _ === e) && u();
    })
  ], T = e.onRemoved;
  return e.onRemoved = function() {
    for (const _ of S) _();
    T?.call(this);
  }, u(), { widget: h };
}, qe = "plenio.stem_mix/1", _e = "rest", vi = ["reverb", "delay"], wn = -60, wi = 12;
function xi() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function Z(e, t) {
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
function xn(e) {
  const t = xi();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const _i = ["vocals", "drums", "bass", "other"];
function Si() {
  return [..._i, _e];
}
function Ei(e) {
  if (typeof e != "string" || !e.trim()) return { schema: qe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== qe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function ki(e) {
  const t = {};
  for (const r of Object.keys(e.strips)) {
    if (!r || xn(Z(e, r))) continue;
    const i = {}, s = Z(e, r);
    s.gain_db && (i.gain_db = s.gain_db), s.mute && (i.mute = !0), s.solo && (i.solo = !0), s.compression && (i.compression = s.compression), s.muted.length && (i.muted = s.muted), s.reverb && (i.reverb = s.reverb), s.delay && (i.delay = s.delay), s.save && (i.save = !0), t[r] = i;
  }
  const n = { schema: qe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Ye(e, t, n) {
  const r = { ...e.strips };
  return xn(n) ? delete r[t] : r[t] = n, { ...e, strips: r };
}
function Mi(e, t, n) {
  const r = n.some((s) => Z(e, s).solo), i = Z(e, t);
  return r ? i.solo : !i.mute;
}
function Xt(e) {
  return e <= wn ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function $i(e, t = null) {
  const n = e.filter((i) => Array.isArray(i) && i.length === 2 && Number.isFinite(i[0]) && Number.isFinite(i[1])).map((i) => [Math.max(0, Math.min(i[0], i[1])), Math.max(i[0], i[1])]).filter((i) => i[1] - i[0] > 1e-6).sort((i, s) => i[0] - s[0]), r = [];
  for (const i of n) {
    const s = r[r.length - 1];
    s && i[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], i[1]) : r.push([...i]);
  }
  return t !== null && t > 0 ? r.map(([i, s]) => [Math.min(i, t), Math.min(s, t)]).filter(([i, s]) => s - i > 1e-6) : r;
}
function Ai(e, t, n) {
  return $i([...e, [t, n]]);
}
function Ni(e, t) {
  return e.findIndex(([n, r]) => n <= t && t <= r);
}
function qi(e, t) {
  return t < 0 ? e : e.filter((n, r) => r !== t);
}
function Li(e, t, n, r) {
  const i = Z(e, t);
  return Ye(e, t, { ...i, muted: Ai(i.muted, n, r) });
}
function Ci(e, t, n) {
  const r = Z(e, t), i = Ni(r.muted, n);
  return i < 0 ? e : Ye(e, t, { ...r, muted: qi(r.muted, i) });
}
function zi(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const r = {};
  for (const [i, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (r[i] = s.map((a) => Math.abs(Number(a) || 0)));
  return r;
}
function Ri(e, t, n = 200) {
  const r = e[t];
  return r?.length ? r.length === n ? r : Array.from({ length: n }, (i, s) => r[Math.floor(s * r.length / n)] ?? 0) : new Array(n).fill(0);
}
function Yt(e, t) {
  const r = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Si()).filter((s) => s !== _e), i = Object.keys(e?.strips ?? {}).filter((s) => s !== _e && !r.includes(s));
  return [...r, ...i, _e];
}
const Qt = "plenio_stem_mixer", Ut = "mix", le = 200, Oi = ["room", "plate", "hall"];
function O(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function He(e, t, n, r, i) {
  const s = O("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(r), s.setAttribute("aria-label", i), s;
}
function Ti(e) {
  const t = O("div", "plenio-mix"), n = O("div", "plenio-mix-strips"), r = O("div", "plenio-mix-buses"), i = O("div", "plenio-mix-info"), s = O("div", "plenio-mix-advanced");
  t.append(n, r, s, i);
  let a = {
    mix: { schema: qe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Yt(null, null),
    peaks: {},
    seconds: 0
  }, p = !1;
  const f = () => e.widgets?.find((g) => g.name === Ut);
  function u(g, { draw: m = !0 } = {}) {
    const b = f();
    if (!b) return;
    const y = ki(g);
    b.value = y, b.callback?.(y), a = { ...a, mix: g }, m && S();
  }
  function h(g, m, b = {}) {
    u(Ye(a.mix, g, { ...Z(a.mix, g), ...m }), b);
  }
  function x(g, m, b, y = {}) {
    const L = Z(a.mix, g);
    let E = Ye(a.mix, g, { ...L, [m]: b });
    b > 0 && !(E[m] && Object.keys(E[m]).length) && (E = m === "reverb" ? { ...E, reverb: { preset: "room" } } : { ...E, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), u(E, y);
  }
  function k(g, m, b) {
    const y = { ...a.mix[g] ?? {} };
    u({ ...a.mix, [g]: { ...y, [m]: b } });
  }
  function S() {
    n.replaceChildren();
    const g = a.names;
    for (const m of a.names) {
      const b = Z(a.mix, m), y = O("div", "plenio-mix-strip");
      y.dataset.strip = m;
      const L = O("span", "name", m === _e ? `${m} (missed)` : m);
      L.title = m === _e ? "What the separator missed: keeps a neutral mix exact" : "";
      const E = He(wn, wi, 0.5, b.gain_db, `${m} gain`), G = O("span", "gain", `${Xt(b.gain_db)} dB`);
      E.addEventListener("input", () => {
        G.textContent = `${Xt(Number(E.value))} dB`, h(m, { gain_db: Number(E.value) }, { draw: !1 });
      }), E.addEventListener("change", () => h(m, { gain_db: Number(E.value) }));
      const N = O("button", b.mute ? "toggle active" : "toggle", "M");
      N.setAttribute("aria-label", `${m} mute`), N.addEventListener("click", (C) => {
        C.stopPropagation(), h(m, { mute: !b.mute });
      });
      const B = O("button", b.solo ? "toggle active" : "toggle", "S");
      B.setAttribute("aria-label", `${m} solo`), B.addEventListener("click", (C) => {
        C.stopPropagation(), h(m, { solo: !b.solo });
      });
      const H = He(0, 1, 0.05, b.compression, `${m} compression`);
      H.title = "Compression amount: one knob for the master compressor (threshold and ratio)", H.addEventListener("input", () => h(m, { compression: Number(H.value) }, { draw: !1 })), H.addEventListener("change", () => h(m, { compression: Number(H.value) }));
      const q = vi.map((C) => {
        const z = He(0, 1, 0.05, b[C], `${m} ${C} send`);
        return z.title = `${C} send: how much of this stem goes to the shared ${C} bus`, z.addEventListener("input", () => x(m, C, Number(z.value), { draw: !1 })), z.addEventListener("change", () => x(m, C, Number(z.value))), z;
      }), P = O("button", b.save ? "toggle active" : "toggle", "save");
      P.setAttribute("aria-label", `${m} save as its own file`), P.setAttribute("aria-pressed", String(b.save)), P.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", P.addEventListener("click", (C) => {
        C.stopPropagation(), h(m, { save: !b.save });
      });
      const ee = Mi(a.mix, m, g);
      y.classList.toggle("silent", !ee);
      const j = O("canvas", "plenio-mix-wave");
      j.width = le, j.height = 26, j.setAttribute("aria-label", `${m} waveform (drag to mute a time range)`), T(j, b, Ri(a.peaks, m, le)), j.addEventListener("pointerdown", (C) => _(C, j, m)), y.append(
        L,
        E,
        G,
        N,
        B,
        O("span", "label", "comp"),
        H,
        O("span", "label", "verb"),
        q[0],
        O("span", "label", "delay"),
        q[1],
        P,
        j
      ), n.append(y);
    }
    A(), i.textContent = a.seconds ? `last run: ${a.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function T(g, m, b) {
    const y = g.getContext("2d");
    if (!y) return;
    y.clearRect(0, 0, le, g.height);
    const L = g.height / 2;
    y.strokeStyle = "rgba(180, 190, 205, 0.8)", y.beginPath();
    for (let E = 0; E < b.length; E++) {
      const G = Math.max(1, b[E] * (L - 1));
      y.moveTo(E + 0.5, L - G), y.lineTo(E + 0.5, L + G);
    }
    y.stroke(), y.fillStyle = "rgba(224, 104, 94, 0.35)", y.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [E, G] of m.muted) {
      const N = Math.max(0, Math.min(le, E / Math.max(a.seconds, 1e-6) * le)), B = Math.max(0, Math.min(le, G / Math.max(a.seconds, 1e-6) * le));
      y.fillRect(N, 0, Math.max(1, B - N), g.height), y.strokeRect(N + 0.5, 0.5, Math.max(1, B - N) - 1, g.height - 1);
    }
  }
  function _(g, m, b) {
    if (g.preventDefault(), g.stopPropagation(), !a.seconds) return;
    const y = m.getBoundingClientRect(), L = (q) => Math.max(0, Math.min(1, (q - y.left) / (y.width || le))) * a.seconds, E = L(g.clientX);
    if (Z(a.mix, b).muted.some(([q, P]) => q <= E && E <= P)) {
      u(Ci(a.mix, b, E));
      return;
    }
    let N = E;
    const B = (q) => {
      N = L(q.clientX);
    }, H = () => {
      window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", H), u(Li(a.mix, b, Math.min(E, N), Math.max(E, N)));
    };
    window.addEventListener("pointermove", B), window.addEventListener("pointerup", H);
  }
  function A() {
    r.replaceChildren();
    const g = { preset: "room", ...a.mix.reverb ?? {} }, m = { time_ms: 375, feedback: 0.35, ...a.mix.delay ?? {} }, b = O("select");
    b.setAttribute("aria-label", "Reverb preset"), b.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const E of Oi) b.append(new Option(E, E));
    b.value = String(g.preset ?? "room"), b.addEventListener("change", () => k("reverb", "preset", b.value));
    const y = O("input");
    y.type = "number", y.value = String(m.time_ms ?? 375), y.setAttribute("aria-label", "Delay time in ms"), y.title = "Delay time in ms: where the first echo of the delay bus sits", y.addEventListener("change", () => k("delay", "time_ms", Number(y.value)));
    const L = He(0, 0.8, 0.05, Number(m.feedback ?? 0.35), "Delay feedback");
    L.title = "Delay feedback: how much of each echo returns into the delay line", L.addEventListener("input", () => k("delay", "feedback", Number(L.value))), r.append(
      O("span", "label", "reverb bus"),
      b,
      O("span", "label", "delay bus"),
      y,
      O("span", "label", "ms, feedback"),
      L
    ), r.style.display = "flex";
  }
  const Y = e.addDOMWidget(Qt, Qt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  const l = e.widgets?.find((g) => g.name === Ut), I = O("button", "toggle", "JSON");
  I.title = "Show or hide the raw mixer value", I.addEventListener("click", (g) => {
    g.stopPropagation(), p = !p, I.classList.toggle("active", p), l && (l.plenioHidden = !p, p ? delete l.computeSize : l.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(O("span", "label", "Advanced"), I), l && (l.plenioHidden = !0, l.computeSize = () => [0, -4]);
  function $() {
    const g = Ei(f()?.value);
    a = { ...a, mix: g ?? { schema: qe, strips: {} } }, g || (i.textContent = "the mixer value is not readable; it will be replaced on the next edit"), S();
  }
  return $(), {
    showExecuted(g) {
      const m = g?.plenio_stems?.at(-1), b = zi(g), y = Yt(a.mix, m ?? null);
      a = { ...a, names: y, peaks: b, seconds: Number(m?.seconds ?? a.seconds) || 0 }, $();
    }
  };
}
const Bi = `
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
function Pi() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Bi, document.head.append(e);
}
function ht(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function We(e) {
  return ht(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Di(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Ii(e) {
  const t = [];
  let n = !1, r = null, i = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  }, a = () => {
    if (i) {
      const [p, ...f] = i, u = (h, x) => `<tr>${h.map((k) => `<${x}>${We(k)}</${x}>`).join("")}</tr>`;
      t.push(`<table><thead>${u(p, "th")}</thead><tbody>${f.map((h) => u(h, "td")).join("")}</tbody></table>`), i = null;
    }
  };
  for (const p of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      p.startsWith("```") ? (t.push(`<pre><code>${ht(r.join(`
`))}</code></pre>`), r = null) : r.push(p);
      continue;
    }
    if (p.trim().startsWith("|")) {
      s();
      const h = Di(p);
      h && (i ??= []).push(h);
      continue;
    }
    if (a(), p.startsWith("```")) {
      s(), r = [];
      continue;
    }
    const f = /^(#{1,4})\s+(.*)$/.exec(p);
    if (f) {
      s();
      const h = Math.min(f[1].length + 2, 6);
      t.push(`<h${h}>${We(f[2])}</h${h}>`);
      continue;
    }
    const u = /^\s*[-*]\s+(.*)$/.exec(p);
    if (u) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${We(u[1])}</li>`);
      continue;
    }
    s(), p.trim() && t.push(`<p>${We(p)}</p>`);
  }
  return s(), a(), r !== null && t.push(`<pre><code>${ht(r.join(`
`))}</code></pre>`), t.join("");
}
const Ae = "plenio_summary", Kt = "plenio_summary", Jt = 84, Hi = 18, Wi = 55, Fi = 16;
function Gi(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, r) => n + Math.max(1, Math.ceil(r.length / Wi)), 0);
  return Fi + t * Hi;
}
function ji(e, t) {
  const n = e.widgets?.find((s) => s.name === Kt);
  if (n?.element) return n.element;
  const r = document.createElement("div");
  r.className = "plenio-summary";
  const i = e.addDOMWidget(Kt, "plenio_summary", r, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Jt,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(Jt, r.scrollHeight ? r.scrollHeight + 2 : Gi(t.markdown))
  });
  return i.serialize = !1, r;
}
function Vi(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Zt = /* @__PURE__ */ new WeakMap();
function mt(e, t) {
  if (!t.markdown) return;
  const n = Zt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Zt.set(e, n);
  const r = ji(e, n);
  r.dataset.status = t.status ?? "", r.innerHTML = Ii(t.markdown), Vi(e), e.setDirtyCanvas?.(!0, !0);
}
function en(e, t, n, r) {
  const i = e.properties?.[Ae], s = (i?.markdown ?? "").split(`
`), a = s.findIndex((f) => f.startsWith(t));
  a >= 0 ? s[a] = n : s.push(n);
  const p = { markdown: s.join(`
`).trim(), status: r ?? i?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ae] = p, mt(e, p);
}
function Xi(e) {
  e.prototype.onExecuted = J(e.prototype.onExecuted, function(t) {
    const n = t?.[Ae], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[Ae] = { markdown: r.markdown, status: r.status ?? "" }, mt(this, r));
  }), e.prototype.onConfigure = J(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ae];
    t?.markdown && mt(this, t);
  });
}
const Yi = "Plenio.Core", he = Pn;
bi(he);
const Le = tn, _n = () => Le.graph;
function gt(e) {
  if (e == null) return null;
  const t = String(e);
  return _n()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Qi = {
  scale: () => Le.canvas?.ds?.scale ?? 1,
  toast: (e, t) => Le.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, Ui = {
  fetcher: he,
  property: (e) => gt(e)?.properties?.plenio_lyric_spans,
  async draw(e, t, n) {
    const { notationPdf: r, renderLines: i } = await import("./notationExport-CNhQ8iYZ.mjs").then((a) => a.c), s = i(e, t, n);
    try {
      if (!s.lines.length) throw new Error("the score has no music to draw");
      return await r(s.lines, n, t);
    } finally {
      s.dispose();
    }
  }
};
function Ki(e, t) {
  for (const n of Jr(t)) {
    const r = `- sheet music: ${n.file}`;
    ni(() => ti(n, Ui)).then(
      (i) => {
        en(e, r, `${r} - saved (${Math.max(1, Math.round(i.bytes / 1024))} KB)`), Le.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: i.file, life: 6e3 });
      },
      (i) => {
        const s = i instanceof Qe && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
        en(e, r, `${r} - not saved: ${s}`, "warning"), Le.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: s, life: 15e3 });
      }
    );
  }
}
tn.registerExtension({
  name: Yi,
  getCustomWidgets: () => ({ [vn]: yi }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => Lr(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Xi(e), Dr(e, Qi);
    const n = lr(t.input);
    if (n.size || t.name in wt) {
      const r = e.prototype.configure;
      e.prototype.configure = function(i) {
        const s = Sr(t, i), a = rr(s), p = r?.call(this, s);
        return ar(this, a, n), p;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = J(e.prototype.onExecuted, function(r) {
      for (const i of r?.plenio_asr ?? []) kr(i);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), i = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        i?.call(this), r.set(this, vr(this, he));
      }, e.prototype.onExecuted = J(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    if (er.has(t.name) && tr(e, he), t.name === "PlenioStemMixer") {
      const r = /* @__PURE__ */ new WeakMap(), i = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        i?.call(this), r.set(this, Ti(this));
      }, e.prototype.onExecuted = J(e.prototype.onExecuted, function(s) {
        r.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioExportRelease" && (e.prototype.onExecuted = J(e.prototype.onExecuted, function(r) {
      Ki(this, r);
    })), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = J(e.prototype.onExecuted, function(r) {
      const i = r?.plenio_sheet, s = i?.[i.length - 1];
      s && Wt(String(this.id), s);
    }));
  },
  setup() {
    Pi(), he.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Wt(String(t.node_id), t);
      const n = gt(t.node_id);
      n && xe(n, pn(t));
    }), he.addEventListener("execution_start", () => {
      qr(_n()?.nodes ?? []);
    }), he.addEventListener("execution_error", (e) => {
      const t = gt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && xe(t, "error");
    });
  }
});
export {
  as as A,
  mn as B,
  Xe as C,
  Yi as E,
  Qe as P,
  ss as a,
  In as b,
  ns as c,
  Ur as d,
  rs as e,
  jr as f,
  xt as g,
  Vr as h,
  is as i,
  Xr as j,
  Fr as k,
  Wr as l,
  us as m,
  me as n,
  es as o,
  Ue as p,
  ls as q,
  Qr as r,
  Gr as s,
  ts as t,
  Dn as u,
  os as v,
  Yr as w,
  ai as x,
  si as y,
  cs as z
};
