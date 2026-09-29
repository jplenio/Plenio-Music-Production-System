import { api as An } from "../../../../scripts/api.js";
import { app as Vt } from "../../../../scripts/app.js";
function ne(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Yt extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ae(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await i.json();
  if (!i.ok) {
    const s = r?.error ?? {};
    throw new Yt(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function dr(e, t) {
  return ae(e, "/plenio/sheet/resolve", t);
}
async function pr(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function fr(e, t) {
  return ae(e, "/plenio/score/analyze", { abc: t });
}
function mr(e, t, n) {
  return ae(e, "/plenio/score/transform", { abc: t, operation: n });
}
function hr(e, t) {
  return ae(e, "/plenio/score/midi/export", t);
}
function gr(e, t) {
  return ae(e, "/plenio/score/midi/import", t);
}
function br(e, t) {
  return ae(e, "/plenio/lyrics/analyze", t);
}
function vr(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function gt(e, t, n, i = 200) {
  return ae(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function $n(e, t) {
  return ae(e, "/plenio/brief/fields", t);
}
async function qn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Yt(`Request failed (${t.status})`);
  return await t.json();
}
const Se = [
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
], Mn = ["length", "vocals", "melody"], ot = {
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
}, Nn = "custom";
function Qt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Nn;
}
function ye(e, t) {
  const n = ot[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Ln(e) {
  const t = {};
  for (const n of [...Se, ...Mn]) {
    const i = ye(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function bt(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!Se.includes(i.field)) continue;
    const r = ye(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function vt(e) {
  const t = [];
  for (const n of Se) {
    const i = ye(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Ze(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Cn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${Bn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function zn(e) {
  const t = e ? Ze(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Rn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Bn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function yt(e, t) {
  for (const n of t) {
    const i = ye(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function On(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Xt(e) {
  const t = [];
  for (const n of Se) {
    const i = ye(e, n);
    !i || !Qt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const wt = "plenio_brief_template", Pn = 400;
function Tn(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const w = document.createElement("div");
  w.className = "line";
  const v = document.createElement("div");
  v.className = "hint";
  const S = document.createElement("div");
  S.className = "actions", c.append(w, v, S);
  const N = (p, d, f) => {
    const m = document.createElement("button");
    return m.textContent = p, m.title = d, m.addEventListener("click", (_) => {
      _.stopPropagation(), f();
    }), S.append(m), m;
  }, R = N("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (yt(e, bt(e, n).map((p) => ({ field: p.field, value: p.value }))), q());
  }), B = N("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (yt(e, Ze(n)), q());
  }), b = N("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = vt(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (On(e, p), q());
  }), O = N("↻", "Ask again what the template fills", () => {
    P();
  }), q = () => {
    const p = Cn(n, i);
    w.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", w.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const d = zn(n), f = Rn(n);
    v.textContent = [d, f].filter(Boolean).join(" · "), v.style.display = v.textContent ? "" : "none", S.style.display = i && n && n.template !== "none" ? "" : "none", R.disabled = !n || !bt(e, n).length, B.disabled = !n || !Ze(n).length, b.disabled = !vt(e).length, O.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, D = /* @__PURE__ */ new WeakSet(), V = () => {
    for (const p of ["template", ...Object.keys(ot)]) {
      const d = p === "template" ? e.widgets?.find((f) => f.name === "template") : ye(e, p);
      !d || D.has(d) || (D.add(d), d.callback = ne(d.callback, () => {
        V(), P();
      }));
    }
  }, a = async () => {
    V();
    const p = String(e.widgets?.find((d) => d.name === "template")?.value ?? "none");
    try {
      n = await $n(t, { fields: Ln(e), template: p }), r = null;
    } catch (d) {
      n = null, r = `The template fields could not be read: ${d instanceof Error ? d.message : String(d)}`;
    }
    i = !0, q();
  };
  function P() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, Pn);
  }
  V();
  const E = e.addDOMWidget(wt, wt, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return E.serialize = !1, Xt(e), q(), P(), {
    widget: E,
    refresh: P,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Dn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Hn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Tn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), Xt(this), n.get(this)?.refresh();
  };
}
const In = "COMFY_DYNAMICCOMBO_V3";
function Fn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Wn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function jn(e, t) {
  const n = Wn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Gn(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Vn(e, t, n) {
  if (!t || !e.widgets || jn(e, t)) return !1;
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
    if (n.has(s.name) && !Gn(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function Yn(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === In && t.add(i);
  return t;
}
const Ut = "plenio.eq/1", ze = 8, oe = 20, Qn = 2e4, ve = 12, Jt = 15, ge = ["peak", "low_shelf", "high_shelf"], Kt = ["peak", "notch", "highpass", "lowpass"], xt = [0.2, 10], _t = [0.25, 1];
function fe() {
  return { schema: Ut, preamp_db: 0, bands: [] };
}
function Xn(e) {
  if (typeof e != "string" || !e.trim()) return fe();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Ut,
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
function he(e) {
  return JSON.stringify(e);
}
const U = (e, t) => Number(e.toFixed(t));
function F(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Zt(e) {
  return e.db ?? Jt;
}
const Et = [6, 12, 18], Un = { 6: 8, 12: 14, 18: 20 };
function Jn(e, t) {
  return { ...e, db: Un[t] ?? Jt };
}
function ue(e, t) {
  return Math.log(F(t, oe, e.maxHz) / oe) / Math.log(e.maxHz / oe) * e.width;
}
function St(e, t) {
  return oe * (e.maxHz / oe) ** F(t / e.width, 0, 1);
}
function se(e, t) {
  const n = Zt(e);
  return (1 - (F(t, -n, n) + n) / (2 * n)) * e.height;
}
function kt(e, t) {
  const n = Zt(e);
  return (1 - F(t / e.height, 0, 1)) * 2 * n - n;
}
function At(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function $t(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${ue(e, i).toFixed(1)},${se(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function at(e) {
  return Math.min(Qn, 0.45 * e);
}
function Kn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Zn(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= ze) return null;
  const r = {
    id: Kn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(F(t, oe, at(i)), 1),
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
        frequency_hz: U(F(n, oe, at(r)), 1),
        gain_db: ge.includes(s.type) ? U(F(i, -ve, ve), 1) : s.gain_db
      }
    )
  };
}
function We(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(F(i.q * n, 0.2, 10), 3) } : i)
  };
}
function je(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function xe(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ge.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function ei(e, t) {
  const n = en[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = ge.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = Kt.includes(e.type) ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const en = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Ge(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function qe(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function Re(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: U(F(qe(s.frequency_hz, r.frequency_hz), oe, at(i)), 1),
        gain_db: U(F(qe(s.gain_db, r.gain_db), -ve, ve), 1),
        q: U(F(qe(s.q, r.q), xt[0], xt[1]), 3),
        slope: U(F(qe(s.slope, r.slope), _t[0], _t[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function qt(e, t) {
  return Re(e, t, { gain_db: 0 });
}
function Mt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((R) => Number.isFinite(R));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), w = Math.max(s - c, 1e-6), v = e.height - 4, S = v - Math.max(12, e.height * F(i, 0.1, 0.95));
  return `M${t.map((R, B) => {
    const b = n[B], O = Number.isFinite(b) ? (b - c) / w : 0;
    return `${ue(e, R).toFixed(1)},${(v - O * (v - S)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${v.toFixed(1)} L0,${v.toFixed(1)} Z`;
}
class ti {
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
    he(t) !== he(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const ni = "http://www.w3.org/2000/svg", Nt = "plenio_eq_panel", Me = "mode.bands", ie = { capture: !0 }, X = { width: 560, height: 260 }, Ne = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Ve = null;
function ee(e, t) {
  const n = document.createElementNS(ni, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function T(e, t, n) {
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
function ii(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function ri(e, t) {
  const n = T("div", "plenio-eq"), i = T("div", "plenio-eq-tools"), r = T("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = T("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of Et) s.append(new Option(`±${o} dB`, String(o)));
  const c = ce("", "↶", "Undo the last band change"), w = ce("", "↷", "Redo the last band change"), v = ce("", "reset", "Remove every band"), S = ce("", "compare", "Show the curve without the EQ (bypass)"), N = ce("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), R = T("span", "plenio-eq-info");
  R.setAttribute("aria-live", "polite"), R.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, c, w, v, S, N, R);
  const B = T("div", "plenio-eq-mode"), b = ee("svg", {
    viewBox: `0 0 ${X.width} ${X.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  b.setAttribute("aria-label", "EQ response curve"), b.setAttribute("tabindex", "0"), b.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const O = T("div", "plenio-eq-strip"), q = T("div", "plenio-eq-editor"), D = T("div", "plenio-eq-fields");
  q.append(D), n.append(i, B, b, O, q);
  const V = e.addDOMWidget(Nt, Nt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: fe(), readonly: !0, note: "" }, P = null, E = null, p = !1, d = 12, f = null, m = [], _ = 0, y, Y, C = null, W = !1;
  const H = /* @__PURE__ */ new Map();
  let I = null;
  const z = new ti(fe()), de = () => te(e, Me), K = () => d, k = () => Jn({ ...X, maxHz: Math.min(2e4, a.sampleRate / 2) }, K());
  function M(o, { record: u = !0 } = {}) {
    const l = de();
    if (!l) return;
    const h = he(o);
    l.value = h, l.callback?.(h), u && z.push(o), a = { ...a, settings: o }, Q(), pe(0);
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
        } : P !== u ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: `${u}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : a = { ...a, readonly: !0 }, Q();
        return;
      }
      const l = Xn(de()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      he(l) !== he(z.current) && z.reset(l);
      const h = ++_;
      try {
        const x = await gt(t, l, a.sampleRate);
        if (h !== _) return;
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
  const ut = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, ze)
  });
  function dt() {
    if (!f) return "";
    const o = m.find((u) => u.name === f);
    return o && ii(ut(o), a.settings) ? f : "";
  }
  function Q() {
    b.replaceChildren(), H.clear(), I = null;
    const o = k();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      b.append(
        ee("line", { x1: 0, x2: o.width, y1: se(o, l), y2: se(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      b.append(ee("line", { x1: ue(o, l), x2: ue(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && b.append(ee("path", { d: Mt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && b.append(ee("path", { d: Mt(o, a.frequencies, a.afterDb), class: "spectrum after" })), p ? b.append(ee("line", { x1: 0, x2: o.width, y1: se(o, 0), y2: se(o, 0), class: "curve flat" })) : a.frequencies.length && (I = ee("path", { d: $t(o, a.frequencies, a.response), class: "curve" }), b.append(I)), !a.readonly && !p && a.settings.bands.forEach((l, h) => {
      const x = Ne[h % Ne.length], A = ge.includes(l.type) ? l.gain_db : 0, g = ee("circle", {
        cx: ue(o, l.frequency_hz),
        cy: se(o, A),
        r: l.id === E ? 9 : 7,
        class: l.id === E ? "handle selected" : "handle",
        style: `stroke: ${x}`,
        tabindex: 0,
        "data-band": l.id
      });
      g.setAttribute("aria-label", `Band ${h + 1}: ${xe(l)}`), l.enabled || g.classList.add("disabled"), g.append(ee("title", {})), g.lastChild.textContent = `Band ${h + 1}: ${xe(l)}`, g.addEventListener("pointerdown", (L) => bn(L, l.id)), g.addEventListener("dblclick", (L) => {
        L.stopPropagation(), M(qt(a.settings, l.id));
      }), g.addEventListener("focus", () => mn(l.id)), g.addEventListener("keydown", (L) => pt(L, l.id)), g.addEventListener("wheel", (L) => {
        L.preventDefault();
        const le = L.deltaY < 0 ? 1.15 : 1 / 1.15;
        M(We(a.settings, l.id, le));
      }), g.addEventListener("contextmenu", (L) => {
        L.preventDefault(), M(je(a.settings, l.id));
      }), b.append(g), H.set(l.id, g);
    }), dn(), pn(), fn();
    const u = a.settings.bands.find((l) => l.id === E);
    R.textContent = a.note || (p ? "compare: the curve is off (the node still applies it)" : u ? xe(u) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${ze}`), r.disabled = a.readonly, c.disabled = !z.canUndo, w.disabled = !z.canRedo, v.disabled = a.readonly || !a.settings.bands.length, W && (W = !1, E && H.get(E)?.focus({ preventScroll: !0 })), s.value = String(d), r.value = dt(), S.classList.toggle("active", p), N.classList.toggle("active", De()), e.setDirtyCanvas?.(!0, !0);
  }
  function dn() {
    if (O.replaceChildren(), a.readonly && !a.settings.bands.length) {
      O.append(T("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, u) => {
      const l = T("button", "plenio-eq-chip", ei(o, u));
      l.style.borderLeftColor = Ne[u % Ne.length], l.classList.toggle("selected", o.id === E), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${u + 1}`), l.title = `Band ${u + 1}: ${xe(o)} - click to open its fields`, l.addEventListener("click", (h) => {
        h.stopPropagation(), E = E === o.id ? null : o.id, Q();
      }), O.append(l);
    });
  }
  function pn() {
    D.replaceChildren();
    const o = a.settings.bands.find((g) => g.id === E);
    if (!o || a.readonly) {
      q.style.display = "none";
      return;
    }
    q.style.display = "";
    const u = T("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    u.title = "The selected band";
    const l = T("select");
    l.setAttribute("aria-label", "Band type"), l.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [g, L] of Object.entries(en)) l.append(new Option(L, g));
    l.value = o.type, l.addEventListener("change", () => M(Re(a.settings, o.id, { type: l.value })));
    const h = T("input");
    h.type = "checkbox", h.checked = o.enabled, h.setAttribute("aria-label", "Band enabled"), h.title = "Band enabled: off keeps the band in the list but out of the response", h.addEventListener("change", () => M(Re(a.settings, o.id, { enabled: h.checked })));
    const x = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (g) => Ie(o.id, "frequency_hz", Ge(g, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (g) => Ie(o.id, "gain_db", Ge(g))],
      ["Q", `${o.q}`, 60, (g) => Ie(o.id, "q", Ge(g))]
    ];
    D.append(u, l, h);
    for (const [g, L, le, ke] of x) {
      const j = T("input", "number");
      j.value = L, j.style.width = `${le}px`, j.setAttribute("aria-label", `Band ${g}`), j.title = g === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : g === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Ae = () => {
        ke(j.value) || (j.value = L);
      };
      j.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && Ae();
      }), j.addEventListener("blur", Ae), (g === "dB" && !ge.includes(o.type) || g === "Q" && !Kt.includes(o.type)) && (j.disabled = !0), D.append(j);
    }
    const A = ce("", "remove", "Remove this band");
    A.addEventListener("click", (g) => {
      g.stopPropagation(), E = null, M(je(a.settings, o.id));
    }), D.append(A);
  }
  function fn() {
    B.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      B.style.display = "none";
      return;
    }
    B.style.display = "", B.append(
      T(
        "span",
        "plenio-eq-hint",
        P === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const u = ce("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    u.disabled = !a.settings.bands.length, u.addEventListener("click", (l) => {
      l.stopPropagation();
      const h = te(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const x = de();
      if (x) {
        const A = he(a.settings);
        x.value = A, x.callback?.(A);
      }
      z.reset(a.settings), Fe(), pe(0);
    }), B.append(u);
  }
  function mn(o) {
    E = o, W = !0, Q();
  }
  function hn(o) {
    E = o, Te();
  }
  function Te() {
    const o = k();
    a.settings.bands.forEach((l) => {
      const h = H.get(l.id);
      if (!h) return;
      const x = ge.includes(l.type) ? l.gain_db : 0;
      h.setAttribute("cx", String(ue(o, l.frequency_hz))), h.setAttribute("cy", String(se(o, x))), h.classList.toggle("selected", l.id === E), h.setAttribute("r", l.id === E ? "9" : "7");
    }), I && a.frequencies.length && I.setAttribute("d", $t(o, a.frequencies, a.response));
    const u = a.settings.bands.find((l) => l.id === E);
    u && (R.textContent = xe(u));
  }
  function gn() {
    clearTimeout(Y), Y = setTimeout(async () => {
      const o = a.settings, u = ++_;
      try {
        const l = await gt(t, o, a.sampleRate);
        if (u !== _) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Te();
      } catch {
      }
    }, 60);
  }
  function De() {
    return !te(e, Me)?.plenioHidden;
  }
  function He(o) {
    const u = te(e, Me);
    u && (u.plenioHidden = !o, o ? delete u.computeSize : u.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Ie(o, u, l) {
    if (l === null) return !1;
    const h = a.settings.bands.find((x) => x.id === o);
    return h && h[u] === l || M(Re(a.settings, o, { [u]: l })), !0;
  }
  function bn(o, u) {
    o.preventDefault(), o.stopPropagation(), E !== u && hn(u);
    const l = a.settings.bands.find((G) => G.id === u);
    if (!l) return;
    C = { hz: l.frequency_hz, db: l.gain_db };
    let h = !1, x = !1;
    const A = o.currentTarget;
    try {
      A?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const g = b.getBoundingClientRect(), L = g.width ? g.left : 0, le = g.height ? g.top : 0, ke = g.width || X.width, j = g.height || X.height, Ae = (G, $e) => G >= L - 1 && G <= L + ke + 1 && $e >= le - 1 && $e <= le + j + 1;
    function Z() {
      if (!x) {
        x = !0;
        try {
          A?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", ht, ie), window.removeEventListener("pointerup", Z, ie), window.removeEventListener("pointercancel", Z, ie), window.removeEventListener("blur", Z, ie), C = null, h && M(a.settings);
      }
    }
    const ht = (G) => {
      if (x || !C) return;
      if (G.buttons === 0) {
        Z();
        return;
      }
      if (!Ae(G.clientX, G.clientY)) return;
      const $e = X.width / ke, yn = X.height / j, wn = (G.clientX - L) * $e, xn = (G.clientY - le) * yn, _n = ue(k(), C.hz), En = se(k(), C.db), Sn = St(k(), At(_n, wn, G.shiftKey)), kn = kt(k(), At(En, xn, G.shiftKey));
      a = { ...a, settings: we(a.settings, u, Sn, kn, a.sampleRate) }, h = !0, Te(), gn();
    };
    window.addEventListener("pointermove", ht, ie), window.addEventListener("pointerup", Z, ie), window.addEventListener("pointercancel", Z, ie), window.addEventListener("blur", Z, ie);
  }
  function pt(o, u) {
    const l = a.settings.bands.find((g) => g.id === u);
    if (!l) return;
    const h = o.shiftKey ? 0.1 : 0.5, x = o.shiftKey ? 1.01 : 1.06;
    let A = null;
    o.key === "ArrowUp" ? A = we(a.settings, u, l.frequency_hz, l.gain_db + h, a.sampleRate) : o.key === "ArrowDown" ? A = we(a.settings, u, l.frequency_hz, l.gain_db - h, a.sampleRate) : o.key === "ArrowRight" ? A = we(a.settings, u, l.frequency_hz * x, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? A = we(a.settings, u, l.frequency_hz / x, l.gain_db, a.sampleRate) : o.key === "+" ? A = We(a.settings, u, 1.15) : o.key === "-" ? A = We(a.settings, u, 1 / 1.15) : o.key === "0" ? A = qt(a.settings, u) : (o.key === "Delete" || o.key === "Backspace") && (A = je(a.settings, u)), A && (o.preventDefault(), M(A));
  }
  b.addEventListener("keydown", (o) => {
    E && o.target === b && pt(o, E);
  }), b.addEventListener("dblclick", (o) => {
    if (a.readonly || p) return;
    const u = b.getBoundingClientRect(), l = X.width / (u.width || X.width), h = X.height / (u.height || X.height), x = (o.clientX - u.left) * l, A = (o.clientY - u.top) * h, g = Zn(a.settings, St(k(), x), kt(k(), A), a.sampleRate);
    g ? (E = g.bands[g.bands.length - 1].id, M(g)) : (a = { ...a, note: `the EQ has at most ${ze} bands` }, Q());
  }), r.append(new Option("preset…", "")), Ve ??= qn(t).then((o) => o.manual).catch(() => []), Ve.then((o) => {
    m = o;
    for (const u of o) r.append(new Option(u.name, u.name));
    r.value = dt();
  }), r.addEventListener("change", async () => {
    const o = (await Ve)?.find((u) => u.name === r.value);
    o && (f = o.name, M(ut(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = Et.find((u) => u === o) ?? 12, Q();
  }), c.addEventListener("click", () => {
    const o = z.undo();
    o && M(o, { record: !1 });
  }), w.addEventListener("click", () => {
    const o = z.redo();
    o && M(o, { record: !1 });
  }), v.addEventListener("click", () => {
    E = null, M(fe());
  }), S.addEventListener("click", () => {
    p = !p, Q();
  }), N.addEventListener("click", () => {
    He(!De()), Q();
  });
  function Fe() {
    for (const o of ["mode", Me]) {
      const u = te(e, o);
      if (!u || u.plenioWatched) continue;
      u.plenioWatched = !0;
      const l = u.callback;
      u.callback = (h) => {
        l?.(h), setTimeout(() => {
          De() || He(!1), pe();
        });
      };
    }
  }
  Fe(), He(!1), pe(0);
  let ft = null, mt = null;
  const vn = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(vn);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), u = String(de()?.value ?? "");
    o === ft && u === mt || (ft = o, mt = u, Fe(), pe(0));
  }, 700);
  return {
    showExecuted(o) {
      const u = o?.plenio_eq, l = u?.[u.length - 1];
      if (!l) return;
      const h = String(te(e, "mode")?.value ?? "flat"), x = h === "manual";
      P = x || h === "flat" ? null : h, a = {
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
const lt = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, si = new Set(Se.map((e) => ot[e]));
function oi(e, t) {
  return !(e in lt) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => si.has(n) && Qt(i)).map(([n]) => n);
}
function ai(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function li(e, t) {
  const n = lt[e.name];
  if (!n || !t) return t;
  const i = ai(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const w = oi(e.name, c.widgets_values_named);
  if (w.length) {
    const v = { ...c.widgets_values_named };
    for (const S of w) v[S] = "";
    c = { ...c, widgets_values_named: v };
  }
  return c;
}
const tn = /* @__PURE__ */ new Map(), et = /* @__PURE__ */ new Set();
function Lt(e, t) {
  tn.set(e, t);
  for (const n of et) n(e);
}
function Ct(e) {
  return tn.get(e) ?? null;
}
function ci(e) {
  return et.add(e), () => et.delete(e);
}
const nn = /* @__PURE__ */ new Map();
function ui(e) {
  e?.draft_sha256 && nn.set(e.draft_sha256, e);
}
function di(e) {
  return e ? nn.get(e) ?? null : null;
}
const Ye = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function pi(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function fi(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function rn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function mi(e) {
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
const Be = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new Set();
function hi(e) {
  return Be.get(e) ?? null;
}
function tt(e, t) {
  t ? Be.set(e, t) : Be.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of _e) n(e);
}
function gi(e) {
  for (const t of e) Be.delete(t);
  for (const t of _e) t(null);
}
function bi() {
  for (const e of _e) e(null);
}
function vi(e) {
  return _e.add(e), () => _e.delete(e);
}
const zt = "600 12px sans-serif", Le = 20, Qe = 7;
function yi(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function wi(e) {
  const t = e ? yi(e) : "";
  return {
    height: e ? Le : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = zt;
      const i = n.measureText(t).width + 2 * Qe;
      return n.restore(), i;
    },
    draw(n, i, r) {
      if (!e) return;
      n.save(), n.font = zt;
      const s = n.measureText(t).width + 2 * Qe;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(i, r, s, Le, 5) : n.rect(i, r, s, Le), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, i + Qe, r + Le / 2 + 0.5), n.restore();
    }
  };
}
const xi = "PlenioSongSheet", _i = 30;
function sn(e, t) {
  const n = e.widgets?.find((i) => i.name === t);
  return n ? String(n.value ?? "") : null;
}
function Ei(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? sn(n, "mode") : null;
  } catch {
    return null;
  }
}
function nt(e) {
  const t = hi(e);
  return t || (e.type !== xi ? null : fi(sn(e, "review") ?? "continue", Ei(e)) ? "stop" : null);
}
function Si(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return rn(n);
  const i = e?.plenio_summary;
  return pi(i?.[i.length - 1]?.status);
}
function ki(e, t) {
  const n = e.prototype, i = n.onNodeCreated;
  n.onNodeCreated = function() {
    i?.call(this);
    const r = this;
    r.badges?.push(() => {
      const s = nt(r);
      return wi(s ? Ye[s] : null);
    });
  }, n.onDrawForeground = ne(n.onDrawForeground, function(r) {
    const s = nt(this);
    !s || !Ye[s].frame || this.flags?.collapsed || !this.size || Ai(r, Ye[s], this.size, _i, t.scale());
  }), n.onExecuted = ne(n.onExecuted, function(r) {
    const s = Si(r);
    s && (tt(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function Ai(e, t, n, i, r) {
  const s = Math.max(3, 3 / Math.max(r, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const c = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-c, -i - c, n[0] + 2 * c, n[1] + i + 2 * c, 10) : e.rect(-c, -i - c, n[0] + 2 * c, n[1] + i + 2 * c), e.stroke(), e.restore();
}
const ct = "plenio.sheet_state/1", Pe = ["title", "style", "lyrics", "score", "artwork_prompt"];
function on() {
  return { schema: ct, docs: {} };
}
function Rt(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return on();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== ct || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function $i(e) {
  const t = {};
  for (const i of Pe) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: ct, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Xe(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function qi(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Pe.filter((i) => Xe(e, i) !== "auto").map(
    (i) => i === "lyrics" && Xe(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${Xe(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Bt(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function yr(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Bt(r?.[0] ?? 0), end: Bt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function Ue(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Mi(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function wr(e, t, n) {
  return n.map((i) => ({ kind: i, text: Mi(e, t, i), intent: "keep" }));
}
function xr(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], w = t?.docs[s.kind], v = Ue(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: v };
    else if (s.intent === "rebase")
      w?.upstream_sha256 ? i[s.kind] = { state: "edited", text: v, base_sha256: w.upstream_sha256 } : i[s.kind] = { state: "manual", text: v };
    else if (c)
      Ue(c.text) !== v && (i[s.kind] = { ...c, text: v });
    else {
      const S = Ue(w?.upstream ?? "");
      if (v === S) continue;
      i[s.kind] = w?.upstream_sha256 ? { state: "edited", text: v, base_sha256: w.upstream_sha256 } : { state: "manual", text: v };
    }
  }
  const r = { ...on(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function _r(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Ni(e, t) {
  return Pe.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Er(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const an = "PLENIO_SHEET_STATE", Ot = 68;
let it = null;
function Li(e) {
  it = e;
}
const Ci = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…";
  const w = document.createElement("div");
  w.className = "plenio-sheet-status", r.append(c, s, w);
  let v = !1;
  const S = () => {
    const b = Ct(String(e.id));
    s.textContent = qi(Rt(i)) + (b ? ` · ${b.status}` : "");
    const O = nt(e);
    w.textContent = mi(O), w.dataset.state = O ?? "";
    const q = v ? null : e.widgets?.find((D) => D.name === "review");
    if (q) {
      v = !0;
      const D = q.callback;
      q.callback = (V) => {
        D?.(V), S();
      };
    }
  }, N = e.addDOMWidget(t, an, r, {
    getValue: () => i,
    setValue: (b) => {
      i = typeof b == "string" ? b : "", S();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Ot,
    getMaxHeight: () => Ot
  });
  c.addEventListener("click", async (b) => {
    b.stopPropagation();
    const O = Rt(i);
    O === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const q = Ct(String(e.id)), V = (e.inputs ?? []).filter((_) => _.link != null).map((_) => _.name), a = O ?? { schema: "plenio.sheet_state/1", docs: {} }, P = q?.owned ?? Ni(V, a), E = String(e.widgets?.find((_) => _.name === "review")?.value ?? "continue"), p = E === "as the brief says" ? q?.review ?? "continue" : E, { openSheetDialog: d } = await import("./open-ClIfd8cY.mjs"), { parseGuide: f, serializeGuide: m } = await import("./tracks-DEywwRcM.mjs");
    if (!it) throw new Error("Plenio: API not initialised");
    d({
      title: e.title || "Song Sheet",
      state: a,
      payload: q,
      asrNote: di(q?.docs.lyrics?.upstream_sha256),
      owned: P.length ? P : [...Pe],
      review: p,
      fetcher: it,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: f(e.properties?.plenio_guide),
      onApply: (_, y) => {
        N.value = $i(_), e.properties = { ...e.properties ?? {}, plenio_guide: m(y) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  });
  const R = [
    ci((b) => {
      b === String(e.id) && S();
    }),
    vi((b) => {
      (b === null || b === e) && S();
    })
  ], B = e.onRemoved;
  return e.onRemoved = function() {
    for (const b of R) b();
    B?.call(this);
  }, S(), { widget: N };
}, Ee = "plenio.stem_mix/1", be = "rest", zi = ["reverb", "delay"], ln = -60, Ri = 12;
function Bi() {
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
function cn(e) {
  const t = Bi();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Oi = ["vocals", "drums", "bass", "other"];
function Pi() {
  return [...Oi, be];
}
function Ti(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Ee, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ee || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Di(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || cn(J(e, i))) continue;
    const r = {}, s = J(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: Ee, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Oe(e, t, n) {
  const i = { ...e.strips };
  return cn(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function Hi(e, t, n) {
  const i = n.some((s) => J(e, s).solo), r = J(e, t);
  return i ? r.solo : !r.mute;
}
function Pt(e) {
  return e <= ln ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Ii(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function Fi(e, t, n) {
  return Ii([...e, [t, n]]);
}
function Wi(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function ji(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function Gi(e, t, n, i) {
  const r = J(e, t);
  return Oe(e, t, { ...r, muted: Fi(r.muted, n, i) });
}
function Vi(e, t, n) {
  const i = J(e, t), r = Wi(i.muted, n);
  return r < 0 ? e : Oe(e, t, { ...i, muted: ji(i.muted, r) });
}
function Yi(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function Qi(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function Tt(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Pi()).filter((s) => s !== be), r = Object.keys(e?.strips ?? {}).filter((s) => s !== be && !i.includes(s));
  return [...i, ...r, be];
}
const Dt = "plenio_stem_mixer", Ht = "mix", re = 200, Xi = ["room", "plate", "hall"];
function $(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function Ce(e, t, n, i, r) {
  const s = $("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function Ui(e) {
  const t = $("div", "plenio-mix"), n = $("div", "plenio-mix-strips"), i = $("div", "plenio-mix-buses"), r = $("div", "plenio-mix-info"), s = $("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: Ee, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Tt(null, null),
    peaks: {},
    seconds: 0
  }, w = !1;
  const v = () => e.widgets?.find((p) => p.name === Ht);
  function S(p, { draw: d = !0 } = {}) {
    const f = v();
    if (!f) return;
    const m = Di(p);
    f.value = m, f.callback?.(m), c = { ...c, mix: p }, d && b();
  }
  function N(p, d, f = {}) {
    S(Oe(c.mix, p, { ...J(c.mix, p), ...d }), f);
  }
  function R(p, d, f, m = {}) {
    const _ = J(c.mix, p);
    let y = Oe(c.mix, p, { ..._, [d]: f });
    f > 0 && !(y[d] && Object.keys(y[d]).length) && (y = d === "reverb" ? { ...y, reverb: { preset: "room" } } : { ...y, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), S(y, m);
  }
  function B(p, d, f) {
    const m = { ...c.mix[p] ?? {} };
    S({ ...c.mix, [p]: { ...m, [d]: f } });
  }
  function b() {
    n.replaceChildren();
    const p = c.names;
    for (const d of c.names) {
      const f = J(c.mix, d), m = $("div", "plenio-mix-strip");
      m.dataset.strip = d;
      const _ = $("span", "name", d === be ? `${d} (missed)` : d);
      _.title = d === be ? "What the separator missed: keeps a neutral mix exact" : "";
      const y = Ce(ln, Ri, 0.5, f.gain_db, `${d} gain`), Y = $("span", "gain", `${Pt(f.gain_db)} dB`);
      y.addEventListener("input", () => {
        Y.textContent = `${Pt(Number(y.value))} dB`, N(d, { gain_db: Number(y.value) }, { draw: !1 });
      }), y.addEventListener("change", () => N(d, { gain_db: Number(y.value) }));
      const C = $("button", f.mute ? "toggle active" : "toggle", "M");
      C.setAttribute("aria-label", `${d} mute`), C.addEventListener("click", (k) => {
        k.stopPropagation(), N(d, { mute: !f.mute });
      });
      const W = $("button", f.solo ? "toggle active" : "toggle", "S");
      W.setAttribute("aria-label", `${d} solo`), W.addEventListener("click", (k) => {
        k.stopPropagation(), N(d, { solo: !f.solo });
      });
      const H = Ce(0, 1, 0.05, f.compression, `${d} compression`);
      H.title = "Compression amount: one knob for the master compressor (threshold and ratio)", H.addEventListener("input", () => N(d, { compression: Number(H.value) }, { draw: !1 })), H.addEventListener("change", () => N(d, { compression: Number(H.value) }));
      const I = zi.map((k) => {
        const M = Ce(0, 1, 0.05, f[k], `${d} ${k} send`);
        return M.title = `${k} send: how much of this stem goes to the shared ${k} bus`, M.addEventListener("input", () => R(d, k, Number(M.value), { draw: !1 })), M.addEventListener("change", () => R(d, k, Number(M.value))), M;
      }), z = $("button", f.save ? "toggle active" : "toggle", "save");
      z.setAttribute("aria-label", `${d} save as its own file`), z.setAttribute("aria-pressed", String(f.save)), z.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", z.addEventListener("click", (k) => {
        k.stopPropagation(), N(d, { save: !f.save });
      });
      const de = Hi(c.mix, d, p);
      m.classList.toggle("silent", !de);
      const K = $("canvas", "plenio-mix-wave");
      K.width = re, K.height = 26, K.setAttribute("aria-label", `${d} waveform (drag to mute a time range)`), O(K, f, Qi(c.peaks, d, re)), K.addEventListener("pointerdown", (k) => q(k, K, d)), m.append(
        _,
        y,
        Y,
        C,
        W,
        $("span", "label", "comp"),
        H,
        $("span", "label", "verb"),
        I[0],
        $("span", "label", "delay"),
        I[1],
        z,
        K
      ), n.append(m);
    }
    D(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function O(p, d, f) {
    const m = p.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, re, p.height);
    const _ = p.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let y = 0; y < f.length; y++) {
      const Y = Math.max(1, f[y] * (_ - 1));
      m.moveTo(y + 0.5, _ - Y), m.lineTo(y + 0.5, _ + Y);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [y, Y] of d.muted) {
      const C = Math.max(0, Math.min(re, y / Math.max(c.seconds, 1e-6) * re)), W = Math.max(0, Math.min(re, Y / Math.max(c.seconds, 1e-6) * re));
      m.fillRect(C, 0, Math.max(1, W - C), p.height), m.strokeRect(C + 0.5, 0.5, Math.max(1, W - C) - 1, p.height - 1);
    }
  }
  function q(p, d, f) {
    if (p.preventDefault(), p.stopPropagation(), !c.seconds) return;
    const m = d.getBoundingClientRect(), _ = (I) => Math.max(0, Math.min(1, (I - m.left) / (m.width || re))) * c.seconds, y = _(p.clientX);
    if (J(c.mix, f).muted.some(([I, z]) => I <= y && y <= z)) {
      S(Vi(c.mix, f, y));
      return;
    }
    let C = y;
    const W = (I) => {
      C = _(I.clientX);
    }, H = () => {
      window.removeEventListener("pointermove", W), window.removeEventListener("pointerup", H), S(Gi(c.mix, f, Math.min(y, C), Math.max(y, C)));
    };
    window.addEventListener("pointermove", W), window.addEventListener("pointerup", H);
  }
  function D() {
    i.replaceChildren();
    const p = { preset: "room", ...c.mix.reverb ?? {} }, d = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = $("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const y of Xi) f.append(new Option(y, y));
    f.value = String(p.preset ?? "room"), f.addEventListener("change", () => B("reverb", "preset", f.value));
    const m = $("input");
    m.type = "number", m.value = String(d.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => B("delay", "time_ms", Number(m.value)));
    const _ = Ce(0, 0.8, 0.05, Number(d.feedback ?? 0.35), "Delay feedback");
    _.title = "Delay feedback: how much of each echo returns into the delay line", _.addEventListener("input", () => B("delay", "feedback", Number(_.value))), i.append(
      $("span", "label", "reverb bus"),
      f,
      $("span", "label", "delay bus"),
      m,
      $("span", "label", "ms, feedback"),
      _
    ), i.style.display = "flex";
  }
  const V = e.addDOMWidget(Dt, Dt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Ht), P = $("button", "toggle", "JSON");
  P.title = "Show or hide the raw mixer value", P.addEventListener("click", (p) => {
    p.stopPropagation(), w = !w, P.classList.toggle("active", w), a && (a.plenioHidden = !w, w ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append($("span", "label", "Advanced"), P), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function E() {
    const p = Ti(v()?.value);
    c = { ...c, mix: p ?? { schema: Ee, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), b();
  }
  return E(), {
    showExecuted(p) {
      const d = p?.plenio_stems?.at(-1), f = Yi(p), m = Tt(c.mix, d ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(d?.seconds ?? c.seconds) || 0 }, E();
    }
  };
}
const Ji = `
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
function Ki() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Ji, document.head.append(e);
}
function rt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Je(e) {
  return rt(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Zi(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${rt(i.join(`
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
      t.push(`<h${v}>${Je(c[2])}</h${v}>`);
      continue;
    }
    const w = /^\s*[-*]\s+(.*)$/.exec(s);
    if (w) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Je(w[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${Je(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${rt(i.join(`
`))}</code></pre>`), t.join("");
}
const Ke = "plenio_summary", It = "plenio_summary", Ft = 84, er = 18, tr = 55, nr = 16;
function ir(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / tr)), 0);
  return nr + t * er;
}
function rr(e, t) {
  const n = e.widgets?.find((s) => s.name === It);
  if (n?.element) return n.element;
  const i = document.createElement("div");
  i.className = "plenio-summary";
  const r = e.addDOMWidget(It, "plenio_summary", i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Ft,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(Ft, i.scrollHeight ? i.scrollHeight + 2 : ir(t.markdown))
  });
  return r.serialize = !1, i;
}
function sr(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Wt = /* @__PURE__ */ new WeakMap();
function jt(e, t) {
  if (!t.markdown) return;
  const n = Wt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Wt.set(e, n);
  const i = rr(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = Zi(t.markdown), sr(e), e.setDirtyCanvas?.(!0, !0);
}
function or(e) {
  e.prototype.onExecuted = ne(e.prototype.onExecuted, function(t) {
    const n = t?.[Ke], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Ke] = { markdown: i.markdown, status: i.status ?? "" }, jt(this, i));
  }), e.prototype.onConfigure = ne(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ke];
    t?.markdown && jt(this, t);
  });
}
const ar = "Plenio.Core", me = An;
Li(me);
const st = Vt, un = () => st.graph;
function Gt(e) {
  if (e == null) return null;
  const t = String(e);
  return un()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const lr = {
  scale: () => st.canvas?.ds?.scale ?? 1,
  toast: (e, t) => st.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
};
Vt.registerExtension({
  name: ar,
  getCustomWidgets: () => ({ [an]: Ci }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => bi(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    or(e), ki(e, lr);
    const n = Yn(t.input);
    if (n.size || t.name in lt) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = li(t, r), c = Fn(s), w = i?.call(this, s);
        return Vn(this, c, n), w;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) ui(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, ri(this, me));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Dn.has(t.name) && Hn(e, me), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, Ui(this));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && Lt(String(this.id), s);
    }));
  },
  setup() {
    Ki(), me.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Lt(String(t.node_id), t);
      const n = Gt(t.node_id);
      n && tt(n, rn(t));
    }), me.addEventListener("execution_start", () => {
      gi(un()?.nodes ?? []);
    }), me.addEventListener("execution_error", (e) => {
      const t = Gt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && tt(t, "error");
    });
  }
});
export {
  ar as E,
  Yt as P,
  br as a,
  fr as b,
  yr as c,
  $i as d,
  hr as e,
  Ue as f,
  pr as g,
  gr as i,
  xr as n,
  dr as r,
  wr as s,
  mr as t,
  Er as u,
  vr as v,
  _r as w
};
