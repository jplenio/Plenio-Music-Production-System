import { api as zn } from "../../../../scripts/api.js";
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
function Rn(e, t) {
  return ie(e, "/plenio/sheet/resolve", t);
}
async function Nr(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Lr(e, t, n) {
  return ie(e, "/plenio/score/analyze", n ? { abc: t, lyrics: n } : { abc: t });
}
function Cr(e, t, n, i) {
  return ie(e, "/plenio/score/transform", i ? { abc: t, operation: n, lyrics: i } : { abc: t, operation: n });
}
function zr(e, t) {
  const { lyrics: n, ...i } = t;
  return ie(e, "/plenio/score/musicxml/export", n ? { ...i, lyrics: n } : i);
}
function Rr(e, t) {
  return ie(e, "/plenio/score/midi/export", t);
}
function Or(e, t) {
  return ie(e, "/plenio/score/midi/import", t);
}
function Tr(e, t) {
  return ie(e, "/plenio/lyrics/analyze", t);
}
function Br(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function xt(e, t, n, i = 200) {
  return ie(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function On(e, t) {
  return ie(e, "/plenio/brief/fields", t);
}
async function Tn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Ut(`Request failed (${t.status})`);
  return await t.json();
}
const Me = [
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
], Bn = ["length", "vocals", "melody"], dt = {
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
}, Pn = "custom";
function Jt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Pn;
}
function Se(e, t) {
  const n = dt[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Dn(e) {
  const t = {};
  for (const n of [...Me, ...Bn]) {
    const i = Se(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function Hn(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function _t(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!Me.includes(i.field)) continue;
    const r = Se(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function St(e) {
  const t = [];
  for (const n of Me) {
    const i = Se(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function ot(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function In(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${jn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Wn(e) {
  const t = e ? ot(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Fn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function jn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Et(e, t) {
  for (const n of t) {
    const i = Se(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Gn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Kt(e) {
  const t = [];
  for (const n of Me) {
    const i = Se(e, n);
    !i || !Jt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const kt = "plenio_brief_template", Vn = 400;
function Yn(e, t) {
  let n = null, i = !1, r = null, s;
  const l = document.createElement("div");
  l.className = "plenio-brief-template";
  const f = document.createElement("div");
  f.className = "line";
  const m = document.createElement("div");
  m.className = "hint";
  const w = document.createElement("div");
  w.className = "actions", l.append(f, m, w);
  const x = (p, d, h) => {
    const g = document.createElement("button");
    return g.textContent = p, g.title = d, g.addEventListener("click", (M) => {
      M.stopPropagation(), h();
    }), w.append(g), g;
  }, T = x("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Et(e, _t(e, n).map((p) => ({ field: p.field, value: p.value }))), _());
  }), R = x("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Et(e, ot(n)), _());
  }), $ = x("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = St(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (Gn(e, p), _());
  }), V = x("↻", "Ask again what the template fills", () => {
    P();
  }), _ = () => {
    const p = In(n, i);
    f.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", f.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const d = Wn(n), h = Fn(n);
    m.textContent = [d, h].filter(Boolean).join(" · "), m.style.display = m.textContent ? "" : "none", w.style.display = i && n && n.template !== "none" ? "" : "none", T.disabled = !n || !_t(e, n).length, R.disabled = !n || !ot(n).length, $.disabled = !St(e).length, V.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, A = /* @__PURE__ */ new WeakSet(), Y = () => {
    for (const p of ["template", ...Object.keys(dt)]) {
      const d = p === "template" ? e.widgets?.find((h) => h.name === "template") : Se(e, p);
      !d || A.has(d) || (A.add(d), d.callback = ne(d.callback, () => {
        Y(), P();
      }));
    }
  }, a = async () => {
    Y();
    const p = String(e.widgets?.find((d) => d.name === "template")?.value ?? "none");
    try {
      n = await On(t, { fields: Dn(e), template: p, kind: Hn(e) }), r = null;
    } catch (d) {
      n = null, r = `The template fields could not be read: ${d instanceof Error ? d.message : String(d)}`;
    }
    i = !0, _();
  };
  function P() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, Vn);
  }
  Y();
  const E = e.addDOMWidget(kt, kt, l, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return E.serialize = !1, Kt(e), _(), P(), {
    widget: E,
    refresh: P,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Qn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Xn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Yn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(l) {
    s?.call(this, l), Kt(this), n.get(this)?.refresh();
  };
}
const Un = "COMFY_DYNAMICCOMBO_V3";
function Jn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Kn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Zn(e, t) {
  const n = Kn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function ei(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ti(e, t, n) {
  if (!t || !e.widgets || Zn(e, t)) return !1;
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
    if (n.has(s.name) && !ei(s, l)) return !0;
    s.value !== l && (s.value = l);
  }
  return !0;
}
function ni(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === Un && t.add(i);
  return t;
}
const Zt = "plenio.eq/1", De = 8, le = 20, ii = 2e4, xe = 12, en = 15, ve = ["peak", "low_shelf", "high_shelf"], tn = ["peak", "notch", "highpass", "lowpass"], $t = [0.2, 10], At = [0.25, 1];
function me() {
  return { schema: Zt, preamp_db: 0, bands: [] };
}
function ri(e) {
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
const G = (e, t) => Number(e.toFixed(t));
function F(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function nn(e) {
  return e.db ?? en;
}
const Mt = [6, 12, 18], si = { 6: 8, 12: 14, 18: 20 };
function oi(e, t) {
  return { ...e, db: si[t] ?? en };
}
function de(e, t) {
  return Math.log(F(t, le, e.maxHz) / le) / Math.log(e.maxHz / le) * e.width;
}
function qt(e, t) {
  return le * (e.maxHz / le) ** F(t / e.width, 0, 1);
}
function ae(e, t) {
  const n = nn(e);
  return (1 - (F(t, -n, n) + n) / (2 * n)) * e.height;
}
function Nt(e, t) {
  const n = nn(e);
  return (1 - F(t / e.height, 0, 1)) * 2 * n - n;
}
function Lt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Ct(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${de(e, i).toFixed(1)},${ae(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function pt(e) {
  return Math.min(ii, 0.45 * e);
}
function ai(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function li(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= De) return null;
  const r = {
    id: ai(e),
    enabled: !0,
    type: "peak",
    frequency_hz: G(F(t, le, pt(i)), 1),
    gain_db: G(F(n, -xe, xe), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function Ee(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: G(F(n, le, pt(r)), 1),
        gain_db: ve.includes(s.type) ? G(F(i, -xe, xe), 1) : s.gain_db
      }
    )
  };
}
function Ke(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: G(F(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Ze(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function ke(e) {
  const t = e.frequency_hz >= 1e3 ? `${G(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ve.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${G(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${G(e.q, 2)}`;
}
function ci(e, t) {
  const n = rn[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = ve.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = tn.includes(e.type) ? ` Q ${G(e.q, 2)}` : "";
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
function et(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function ze(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function He(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: G(F(ze(s.frequency_hz, r.frequency_hz), le, pt(i)), 1),
        gain_db: G(F(ze(s.gain_db, r.gain_db), -xe, xe), 1),
        q: G(F(ze(s.q, r.q), $t[0], $t[1]), 3),
        slope: G(F(ze(s.slope, r.slope), At[0], At[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function zt(e, t) {
  return He(e, t, { gain_db: 0 });
}
function Rt(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((T) => Number.isFinite(T));
  if (!r.length) return "";
  const s = Math.max(...r), l = Math.min(...r), f = Math.max(s - l, 1e-6), m = e.height - 4, w = m - Math.max(12, e.height * F(i, 0.1, 0.95));
  return `M${t.map((T, R) => {
    const $ = n[R], V = Number.isFinite($) ? ($ - l) / f : 0;
    return `${de(e, T).toFixed(1)},${(m - V * (m - w)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${m.toFixed(1)} L0,${m.toFixed(1)} Z`;
}
class ui {
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
const di = "http://www.w3.org/2000/svg", Ot = "plenio_eq_panel", Re = "mode.bands", se = { capture: !0 }, J = { width: 560, height: 260 }, Oe = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let tt = null;
function ee(e, t) {
  const n = document.createElementNS(di, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function W(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function ue(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function te(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function pi(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function fi(e, t) {
  const n = W("div", "plenio-eq"), i = W("div", "plenio-eq-tools"), r = W("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = W("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of Mt) s.append(new Option(`±${o} dB`, String(o)));
  const l = ue("", "↶", "Undo the last band change"), f = ue("", "↷", "Redo the last band change"), m = ue("", "reset", "Remove every band"), w = ue("", "compare", "Show the curve without the EQ (bypass)"), x = ue("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), T = W("span", "plenio-eq-info");
  T.setAttribute("aria-live", "polite"), T.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, l, f, m, w, x, T);
  const R = W("div", "plenio-eq-mode"), $ = ee("svg", {
    viewBox: `0 0 ${J.width} ${J.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  $.setAttribute("aria-label", "EQ response curve"), $.setAttribute("tabindex", "0"), $.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const V = W("div", "plenio-eq-strip"), _ = W("div", "plenio-eq-editor"), A = W("div", "plenio-eq-fields");
  _.append(A), n.append(i, R, $, V, _);
  const Y = e.addDOMWidget(Ot, Ot, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: me(), readonly: !0, note: "" }, P = null, E = null, p = !1, d = 12, h = null, g = [], M = 0, y, D, O = null, q = !1;
  const I = /* @__PURE__ */ new Map();
  let H = null;
  const z = new ui(me()), re = () => te(e, Re), X = () => d, k = () => oi({ ...J, maxHz: Math.min(2e4, a.sampleRate / 2) }, X());
  function N(o, { record: u = !0 } = {}) {
    const c = re();
    if (!c) return;
    const b = be(o);
    c.value = b, c.callback?.(b), u && z.push(o), a = { ...a, settings: o }, U(), fe(0);
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
        } : a = { ...a, readonly: !0 }, U();
        return;
      }
      const c = ri(re()?.value);
      if (!c) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, U();
        return;
      }
      be(c) !== be(z.current) && z.reset(c);
      const b = ++M;
      try {
        const S = await xt(t, c, a.sampleRate);
        if (b !== M) return;
        a = {
          ...a,
          frequencies: S.frequency_hz,
          response: S.response_db,
          settings: S.settings,
          readonly: !1,
          note: ""
        };
      } catch (S) {
        a = { ...a, readonly: !1, note: S instanceof Error ? S.message : String(S) };
      }
      U();
    }, o);
  }
  const mt = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, De)
  });
  function gt() {
    if (!h) return "";
    const o = g.find((u) => u.name === h);
    return o && pi(mt(o), a.settings) ? h : "";
  }
  function U() {
    $.replaceChildren(), I.clear(), H = null;
    const o = k();
    for (const c of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      $.append(
        ee("line", { x1: 0, x2: o.width, y1: ae(o, c), y2: ae(o, c), class: c ? "grid" : "grid zero" })
      );
    for (const c of [100, 1e3, 1e4])
      $.append(ee("line", { x1: de(o, c), x2: de(o, c), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && $.append(ee("path", { d: Rt(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && $.append(ee("path", { d: Rt(o, a.frequencies, a.afterDb), class: "spectrum after" })), p ? $.append(ee("line", { x1: 0, x2: o.width, y1: ae(o, 0), y2: ae(o, 0), class: "curve flat" })) : a.frequencies.length && (H = ee("path", { d: Ct(o, a.frequencies, a.response), class: "curve" }), $.append(H)), !a.readonly && !p && a.settings.bands.forEach((c, b) => {
      const S = Oe[b % Oe.length], L = ve.includes(c.type) ? c.gain_db : 0, v = ee("circle", {
        cx: de(o, c.frequency_hz),
        cy: ae(o, L),
        r: c.id === E ? 9 : 7,
        class: c.id === E ? "handle selected" : "handle",
        style: `stroke: ${S}`,
        tabindex: 0,
        "data-band": c.id
      });
      v.setAttribute("aria-label", `Band ${b + 1}: ${ke(c)}`), c.enabled || v.classList.add("disabled"), v.append(ee("title", {})), v.lastChild.textContent = `Band ${b + 1}: ${ke(c)}`, v.addEventListener("pointerdown", (B) => En(B, c.id)), v.addEventListener("dblclick", (B) => {
        B.stopPropagation(), N(zt(a.settings, c.id));
      }), v.addEventListener("focus", () => xn(c.id)), v.addEventListener("keydown", (B) => bt(B, c.id)), v.addEventListener("wheel", (B) => {
        B.preventDefault();
        const ce = B.deltaY < 0 ? 1.15 : 1 / 1.15;
        N(Ke(a.settings, c.id, ce));
      }), v.addEventListener("contextmenu", (B) => {
        B.preventDefault(), N(Ze(a.settings, c.id));
      }), $.append(v), I.set(c.id, v);
    }), vn(), yn(), wn();
    const u = a.settings.bands.find((c) => c.id === E);
    T.textContent = a.note || (p ? "compare: the curve is off (the node still applies it)" : u ? ke(u) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${De}`), r.disabled = a.readonly, l.disabled = !z.canUndo, f.disabled = !z.canRedo, m.disabled = a.readonly || !a.settings.bands.length, q && (q = !1, E && I.get(E)?.focus({ preventScroll: !0 })), s.value = String(d), r.value = gt(), w.classList.toggle("active", p), x.classList.toggle("active", Qe()), e.setDirtyCanvas?.(!0, !0);
  }
  function vn() {
    if (V.replaceChildren(), a.readonly && !a.settings.bands.length) {
      V.append(W("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, u) => {
      const c = W("button", "plenio-eq-chip", ci(o, u));
      c.style.borderLeftColor = Oe[u % Oe.length], c.classList.toggle("selected", o.id === E), c.classList.toggle("disabled", !o.enabled), c.setAttribute("aria-label", `Edit band ${u + 1}`), c.title = `Band ${u + 1}: ${ke(o)} - click to open its fields`, c.addEventListener("click", (b) => {
        b.stopPropagation(), E = E === o.id ? null : o.id, U();
      }), V.append(c);
    });
  }
  function yn() {
    A.replaceChildren();
    const o = a.settings.bands.find((v) => v.id === E);
    if (!o || a.readonly) {
      _.style.display = "none";
      return;
    }
    _.style.display = "";
    const u = W("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    u.title = "The selected band";
    const c = W("select");
    c.setAttribute("aria-label", "Band type"), c.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [v, B] of Object.entries(rn)) c.append(new Option(B, v));
    c.value = o.type, c.addEventListener("change", () => N(He(a.settings, o.id, { type: c.value })));
    const b = W("input");
    b.type = "checkbox", b.checked = o.enabled, b.setAttribute("aria-label", "Band enabled"), b.title = "Band enabled: off keeps the band in the list but out of the response", b.addEventListener("change", () => N(He(a.settings, o.id, { enabled: b.checked })));
    const S = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (v) => Ue(o.id, "frequency_hz", et(v, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (v) => Ue(o.id, "gain_db", et(v))],
      ["Q", `${o.q}`, 60, (v) => Ue(o.id, "q", et(v))]
    ];
    A.append(u, c, b);
    for (const [v, B, ce, Ne] of S) {
      const j = W("input", "number");
      j.value = B, j.style.width = `${ce}px`, j.setAttribute("aria-label", `Band ${v}`), j.title = v === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : v === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Le = () => {
        Ne(j.value) || (j.value = B);
      };
      j.addEventListener("keydown", (Z) => {
        Z.key === "Enter" && Le();
      }), j.addEventListener("blur", Le), (v === "dB" && !ve.includes(o.type) || v === "Q" && !tn.includes(o.type)) && (j.disabled = !0), A.append(j);
    }
    const L = ue("", "remove", "Remove this band");
    L.addEventListener("click", (v) => {
      v.stopPropagation(), E = null, N(Ze(a.settings, o.id));
    }), A.append(L);
  }
  function wn() {
    R.replaceChildren();
    const o = String(te(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      R.style.display = "none";
      return;
    }
    R.style.display = "", R.append(
      W(
        "span",
        "plenio-eq-hint",
        P === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const u = ue("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    u.disabled = !a.settings.bands.length, u.addEventListener("click", (c) => {
      c.stopPropagation();
      const b = te(e, "mode");
      if (!b) return;
      b.value = "manual", b.callback?.("manual");
      const S = re();
      if (S) {
        const L = be(a.settings);
        S.value = L, S.callback?.(L);
      }
      z.reset(a.settings), Je(), fe(0);
    }), R.append(u);
  }
  function xn(o) {
    E = o, q = !0, U();
  }
  function _n(o) {
    E = o, Ye();
  }
  function Ye() {
    const o = k();
    a.settings.bands.forEach((c) => {
      const b = I.get(c.id);
      if (!b) return;
      const S = ve.includes(c.type) ? c.gain_db : 0;
      b.setAttribute("cx", String(de(o, c.frequency_hz))), b.setAttribute("cy", String(ae(o, S))), b.classList.toggle("selected", c.id === E), b.setAttribute("r", c.id === E ? "9" : "7");
    }), H && a.frequencies.length && H.setAttribute("d", Ct(o, a.frequencies, a.response));
    const u = a.settings.bands.find((c) => c.id === E);
    u && (T.textContent = ke(u));
  }
  function Sn() {
    clearTimeout(D), D = setTimeout(async () => {
      const o = a.settings, u = ++M;
      try {
        const c = await xt(t, o, a.sampleRate);
        if (u !== M) return;
        a = { ...a, frequencies: c.frequency_hz, response: c.response_db }, Ye();
      } catch {
      }
    }, 60);
  }
  function Qe() {
    return !te(e, Re)?.plenioHidden;
  }
  function Xe(o) {
    const u = te(e, Re);
    u && (u.plenioHidden = !o, o ? delete u.computeSize : u.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Ue(o, u, c) {
    if (c === null) return !1;
    const b = a.settings.bands.find((S) => S.id === o);
    return b && b[u] === c || N(He(a.settings, o, { [u]: c })), !0;
  }
  function En(o, u) {
    o.preventDefault(), o.stopPropagation(), E !== u && _n(u);
    const c = a.settings.bands.find((Q) => Q.id === u);
    if (!c) return;
    O = { hz: c.frequency_hz, db: c.gain_db };
    let b = !1, S = !1;
    const L = o.currentTarget;
    try {
      L?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const v = $.getBoundingClientRect(), B = v.width ? v.left : 0, ce = v.height ? v.top : 0, Ne = v.width || J.width, j = v.height || J.height, Le = (Q, Ce) => Q >= B - 1 && Q <= B + Ne + 1 && Ce >= ce - 1 && Ce <= ce + j + 1;
    function Z() {
      if (!S) {
        S = !0;
        try {
          L?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", wt, se), window.removeEventListener("pointerup", Z, se), window.removeEventListener("pointercancel", Z, se), window.removeEventListener("blur", Z, se), O = null, b && N(a.settings);
      }
    }
    const wt = (Q) => {
      if (S || !O) return;
      if (Q.buttons === 0) {
        Z();
        return;
      }
      if (!Le(Q.clientX, Q.clientY)) return;
      const Ce = J.width / Ne, $n = J.height / j, An = (Q.clientX - B) * Ce, Mn = (Q.clientY - ce) * $n, qn = de(k(), O.hz), Nn = ae(k(), O.db), Ln = qt(k(), Lt(qn, An, Q.shiftKey)), Cn = Nt(k(), Lt(Nn, Mn, Q.shiftKey));
      a = { ...a, settings: Ee(a.settings, u, Ln, Cn, a.sampleRate) }, b = !0, Ye(), Sn();
    };
    window.addEventListener("pointermove", wt, se), window.addEventListener("pointerup", Z, se), window.addEventListener("pointercancel", Z, se), window.addEventListener("blur", Z, se);
  }
  function bt(o, u) {
    const c = a.settings.bands.find((v) => v.id === u);
    if (!c) return;
    const b = o.shiftKey ? 0.1 : 0.5, S = o.shiftKey ? 1.01 : 1.06;
    let L = null;
    o.key === "ArrowUp" ? L = Ee(a.settings, u, c.frequency_hz, c.gain_db + b, a.sampleRate) : o.key === "ArrowDown" ? L = Ee(a.settings, u, c.frequency_hz, c.gain_db - b, a.sampleRate) : o.key === "ArrowRight" ? L = Ee(a.settings, u, c.frequency_hz * S, c.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? L = Ee(a.settings, u, c.frequency_hz / S, c.gain_db, a.sampleRate) : o.key === "+" ? L = Ke(a.settings, u, 1.15) : o.key === "-" ? L = Ke(a.settings, u, 1 / 1.15) : o.key === "0" ? L = zt(a.settings, u) : (o.key === "Delete" || o.key === "Backspace") && (L = Ze(a.settings, u)), L && (o.preventDefault(), N(L));
  }
  $.addEventListener("keydown", (o) => {
    E && o.target === $ && bt(o, E);
  }), $.addEventListener("dblclick", (o) => {
    if (a.readonly || p) return;
    const u = $.getBoundingClientRect(), c = J.width / (u.width || J.width), b = J.height / (u.height || J.height), S = (o.clientX - u.left) * c, L = (o.clientY - u.top) * b, v = li(a.settings, qt(k(), S), Nt(k(), L), a.sampleRate);
    v ? (E = v.bands[v.bands.length - 1].id, N(v)) : (a = { ...a, note: `the EQ has at most ${De} bands` }, U());
  }), r.append(new Option("preset…", "")), tt ??= Tn(t).then((o) => o.manual).catch(() => []), tt.then((o) => {
    g = o;
    for (const u of o) r.append(new Option(u.name, u.name));
    r.value = gt();
  }), r.addEventListener("change", async () => {
    const o = (await tt)?.find((u) => u.name === r.value);
    o && (h = o.name, N(mt(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = Mt.find((u) => u === o) ?? 12, U();
  }), l.addEventListener("click", () => {
    const o = z.undo();
    o && N(o, { record: !1 });
  }), f.addEventListener("click", () => {
    const o = z.redo();
    o && N(o, { record: !1 });
  }), m.addEventListener("click", () => {
    E = null, N(me());
  }), w.addEventListener("click", () => {
    p = !p, U();
  }), x.addEventListener("click", () => {
    Xe(!Qe()), U();
  });
  function Je() {
    for (const o of ["mode", Re]) {
      const u = te(e, o);
      if (!u || u.plenioWatched) continue;
      u.plenioWatched = !0;
      const c = u.callback;
      u.callback = (b) => {
        c?.(b), setTimeout(() => {
          Qe() || Xe(!1), fe();
        });
      };
    }
  }
  Je(), Xe(!1), fe(0);
  let vt = null, yt = null;
  const kn = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(kn);
      return;
    }
    const o = String(te(e, "mode")?.value ?? "flat"), u = String(re()?.value ?? "");
    o === vt && u === yt || (vt = o, yt = u, Je(), fe(0));
  }, 700);
  return {
    showExecuted(o) {
      const u = o?.plenio_eq, c = u?.[u.length - 1];
      if (!c) return;
      const b = String(te(e, "mode")?.value ?? "flat"), S = b === "manual";
      P = S || b === "flat" ? null : b, a = {
        sampleRate: c.sample_rate,
        frequencies: c.frequency_hz,
        response: c.response_db,
        settings: c.settings,
        readonly: !S,
        note: S ? "" : `applied: ${c.settings.bands.length} band(s)`,
        beforeDb: c.spectrum_before_db,
        afterDb: c.spectrum_after_db
      }, S ? fe(0) : U();
    }
  };
}
const ft = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, hi = new Set(Me.map((e) => dt[e]));
function mi(e, t) {
  return !(e in ft) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => hi.has(n) && Jt(i)).map(([n]) => n);
}
function gi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function bi(e, t) {
  const n = ft[e.name];
  if (!n || !t) return t;
  const i = gi(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let l = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (l = { ...l, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (l = { ...l, widgets_values_named: { mode: n, ...s } });
  const f = mi(e.name, l.widgets_values_named);
  if (f.length) {
    const m = { ...l.widgets_values_named };
    for (const w of f) m[w] = "";
    l = { ...l, widgets_values_named: m };
  }
  return l;
}
const sn = /* @__PURE__ */ new Map(), at = /* @__PURE__ */ new Set();
function Tt(e, t) {
  sn.set(e, t);
  for (const n of at) n(e);
}
function he(e) {
  return sn.get(e) ?? null;
}
function vi(e) {
  return at.add(e), () => at.delete(e);
}
const on = /* @__PURE__ */ new Map();
function yi(e) {
  e?.draft_sha256 && on.set(e.draft_sha256, e);
}
function wi(e) {
  return e ? on.get(e) ?? null : null;
}
const nt = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function xi(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function _i(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function an(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Si(e) {
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
const We = /* @__PURE__ */ new WeakMap(), $e = /* @__PURE__ */ new Set();
function ln(e) {
  return We.get(e) ?? null;
}
function ye(e, t) {
  t ? We.set(e, t) : We.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of $e) n(e);
}
function Ei(e) {
  for (const t of e) We.delete(t);
  for (const t of $e) t(null);
}
function ki() {
  for (const e of $e) e(null);
}
function $i(e) {
  return $e.add(e), () => $e.delete(e);
}
const Bt = "600 12px sans-serif", Te = 20, it = 7;
function Ai(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Mi(e) {
  const t = e ? Ai(e) : "";
  return {
    height: e ? Te : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Bt;
      const i = n.measureText(t).width + 2 * it;
      return n.restore(), i;
    },
    draw(n, i, r) {
      if (!e) return;
      n.save(), n.font = Bt;
      const s = n.measureText(t).width + 2 * it;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(i, r, s, Te, 5) : n.rect(i, r, s, Te), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, i + it, r + Te / 2 + 0.5), n.restore();
    }
  };
}
const qi = "PlenioSongSheet", Ni = 30;
function cn(e, t) {
  const n = e.widgets?.find((i) => i.name === t);
  return n ? String(n.value ?? "") : null;
}
function Li(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? cn(n, "mode") : null;
  } catch {
    return null;
  }
}
function lt(e) {
  const t = ln(e);
  return t || (e.type !== qi ? null : _i(cn(e, "review") ?? "continue", Li(e)) ? "stop" : null);
}
function Ci(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return an(n);
  const i = e?.plenio_summary;
  return xi(i?.[i.length - 1]?.status);
}
function zi(e, t) {
  const n = e.prototype, i = n.onNodeCreated;
  n.onNodeCreated = function() {
    i?.call(this);
    const r = this;
    r.badges?.push(() => {
      const s = lt(r);
      return Mi(s ? nt[s] : null);
    });
  }, n.onDrawForeground = ne(n.onDrawForeground, function(r) {
    const s = lt(this);
    !s || !nt[s].frame || this.flags?.collapsed || !this.size || Ri(r, nt[s], this.size, Ni, t.scale());
  }), n.onExecuted = ne(n.onExecuted, function(r) {
    const s = Ci(r);
    s && (ye(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function Ri(e, t, n, i, r) {
  const s = Math.max(3, 3 / Math.max(r, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const l = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l, 10) : e.rect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l), e.stroke(), e.restore();
}
const ht = "plenio.sheet_state/1", Ge = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Ve() {
  return { schema: ht, docs: {} };
}
function _e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Ve();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== ht || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Fe(e) {
  const t = {};
  for (const i of Ge) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: ht, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function rt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Oi(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ge.filter((i) => rt(e, i) !== "auto").map(
    (i) => i === "lyrics" && rt(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${rt(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Pt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), i = Math.round(t - n * 60);
  return `${n}:${String(i).padStart(2, "0")}`;
}
function Pr(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Pt(r?.[0] ?? 0), end: Pt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function pe(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Ti(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Dr(e, t, n) {
  return n.map((i) => ({ kind: i, text: Ti(e, t, i), intent: "keep" }));
}
function un(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const l = e.docs[s.kind], f = t?.docs[s.kind], m = pe(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: m };
    else if (s.intent === "rebase")
      f?.upstream_sha256 ? i[s.kind] = { state: "edited", text: m, base_sha256: f.upstream_sha256 } : i[s.kind] = { state: "manual", text: m };
    else if (l)
      pe(l.text) !== m && (i[s.kind] = { ...l, text: m });
    else {
      const w = pe(f?.upstream ?? "");
      if (m === w) continue;
      i[s.kind] = f?.upstream_sha256 ? { state: "edited", text: m, base_sha256: f.upstream_sha256 } : { state: "manual", text: m };
    }
  }
  const r = { ...Ve(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Bi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Pi(e, t) {
  return Ge.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Di(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Hi = "PlenioSongSheet";
function qe(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function dn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const i = e.graph, r = i?.links, s = i?.getLink?.(n) ?? (r instanceof Map ? r.get(n) : r?.[String(n)]);
    return s && i?.getNodeById ? i.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function pn(e, t) {
  const n = (e.inputs ?? []).findIndex((i) => i.name === t && i.link != null);
  return n < 0 ? null : dn(e, n);
}
function fn(e, t) {
  const n = pn(e, t);
  return n && (n.comfyClass ?? n.type) === Hi && qe(n) ? n : null;
}
function Ii(e) {
  return fn(e, "context_lyrics");
}
function Wi(e) {
  return fn(e, "context_score");
}
function Fi(e, t, n) {
  const i = [], r = pn(t, n);
  r && i.push(r);
  const s = /* @__PURE__ */ new Set();
  for (; i.length && s.size < 1e3; ) {
    const l = i.shift(), f = String(l.id);
    if (!s.has(f)) {
      if (s.add(f), l === e || f === String(e.id)) return !0;
      (l.inputs ?? []).forEach((m, w) => {
        const x = dn(l, w);
        x && i.push(x);
      });
    }
  }
  return !1;
}
function ji(e, t, n) {
  const i = Ii(e), r = t?.context?.lyrics;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = _e(qe(i)?.value), f = l?.docs.lyrics?.text ?? n(String(i.id))?.docs.lyrics?.upstream ?? null;
  let m = null;
  return l === null ? m = `The state of ${s} is unreadable - open that sheet and apply it first.` : f !== null && pe(f) !== pe(r) && (m = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: i, target: { title: s, blocked: m, replans: Fi(i, e, "score") } };
}
function Gi(e, t, n) {
  const i = qe(e);
  if (!i) return;
  const r = _e(i.value) ?? Ve();
  i.value = Fe(un(r, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Vi(e, t, n) {
  const i = Wi(e), r = t?.context?.score;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = _e(qe(i)?.value), f = l?.docs.score?.text ?? n(String(i.id))?.docs.score?.upstream ?? null;
  let m = null;
  return l === null ? m = `The state of ${s} is unreadable - open that sheet and apply it first.` : f !== null && pe(f) !== pe(r) && (m = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: i, target: { title: s, blocked: m } };
}
function Yi(e, t) {
  const n = String(e.widgets?.find((i) => i.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Qi(e, t, n, i = null) {
  const r = qe(e);
  if (!r) return null;
  const s = _e(r.value) ?? Ve(), l = un(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (r.value = Fe(l), e.setDirtyCanvas?.(!0, !0), !i || !n) return l;
  try {
    const f = await Rn(i.fetcher, {
      sheet_state: l,
      upstream: Di(n),
      owned: n.owned,
      review: Yi(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!f.findings.some((x) => x.severity === "error") || !f.fingerprint) return l;
    const w = Bi(l, f.fingerprint);
    return r.value = Fe(w), e.setDirtyCanvas?.(!0, !0), w;
  } catch {
    return l;
  }
}
const hn = "PLENIO_SHEET_STATE", Dt = 68;
let Ie = null;
function Xi(e) {
  Ie = e;
}
const Ui = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const l = document.createElement("button");
  l.className = "plenio-sheet-open", l.textContent = "Edit Song Sheet…";
  const f = document.createElement("div");
  f.className = "plenio-sheet-status", r.append(l, s, f);
  let m = !1;
  const w = () => {
    const _ = he(String(e.id)), A = lt(e);
    s.textContent = Oi(_e(i)) + (_ && A !== "approved" ? ` · ${_.status}` : ""), f.textContent = Si(A), f.dataset.state = A ?? "";
    const Y = m ? null : e.widgets?.find((a) => a.name === "review");
    if (Y) {
      m = !0;
      const a = Y.callback;
      Y.callback = (P) => {
        a?.(P), w();
      };
    }
  }, x = e.addDOMWidget(t, hn, r, {
    getValue: () => i,
    setValue: (_) => {
      i = typeof _ == "string" ? _ : "", w();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Dt,
    getMaxHeight: () => Dt
  });
  l.addEventListener("click", (_) => {
    _.stopPropagation(), T().catch((A) => {
      console.error("Plenio: the Song Sheet editor could not open", A), s.textContent = `The editor could not open: ${A instanceof Error ? A.message : String(A)}`;
    });
  });
  async function T() {
    const _ = _e(i);
    _ === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const A = he(String(e.id)), a = (e.inputs ?? []).filter((q) => q.link != null).map((q) => q.name), P = _ ?? { schema: "plenio.sheet_state/1", docs: {} }, E = A?.owned ?? Pi(a, P), p = String(e.widgets?.find((q) => q.name === "review")?.value ?? "continue"), d = p === "as the brief says" ? A?.review ?? "continue" : p, { openSheetDialog: h } = await import("./open-D78_qaCP.mjs"), { parseGuide: g, serializeGuide: M } = await import("./tracks-DxmZeggM.mjs");
    if (!Ie) throw new Error("Plenio: API not initialised");
    let y = null;
    try {
      y = ji(e, A, he);
    } catch (q) {
      console.warn("Plenio: the lyrics sheet of this score was not found", q);
    }
    let D = null;
    try {
      D = Vi(e, A, he);
    } catch (q) {
      console.warn("Plenio: the score sheet of these lyrics was not found", q);
    }
    const O = Ie;
    h({
      title: e.title || "Song Sheet",
      state: P,
      payload: A,
      asrNote: wi(A?.docs.lyrics?.upstream_sha256),
      owned: E.length ? E : [...Ge],
      review: d,
      fetcher: Ie,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: g(e.properties?.plenio_guide),
      lyricsTarget: y?.target ?? null,
      scoreTarget: D?.target ?? null,
      onApply: (q, I, H, z, re) => {
        const X = String(x.value ?? "");
        if (x.value = Fe(q), e.properties = { ...e.properties ?? {}, plenio_guide: M(I) }, re ? ye(e, "approved") : String(x.value) !== X && R(e), H !== null && y && !y.target.blocked && (Gi(y.owner, H, he(String(y.owner.id))), R(y.owner)), z && D && !D.target.blocked) {
          const k = D.owner;
          Qi(k, z.text, he(String(k.id)), z.approved ? { fetcher: O } : null).then(
            (N) => {
              N?.review?.approved_fingerprint ? ye(k, "approved") : R(k);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function R(_) {
    ln(_) === "approved" && ye(_, null);
  }
  const $ = [
    vi((_) => {
      _ === String(e.id) && w();
    }),
    $i((_) => {
      (_ === null || _ === e) && w();
    })
  ], V = e.onRemoved;
  return e.onRemoved = function() {
    for (const _ of $) _();
    V?.call(this);
  }, w(), { widget: x };
}, Ae = "plenio.stem_mix/1", we = "rest", Ji = ["reverb", "delay"], mn = -60, Ki = 12;
function Zi() {
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
function gn(e) {
  const t = Zi();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const er = ["vocals", "drums", "bass", "other"];
function tr() {
  return [...er, we];
}
function nr(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Ae, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ae || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function ir(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || gn(K(e, i))) continue;
    const r = {}, s = K(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: Ae, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function je(e, t, n) {
  const i = { ...e.strips };
  return gn(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function rr(e, t, n) {
  const i = n.some((s) => K(e, s).solo), r = K(e, t);
  return i ? r.solo : !r.mute;
}
function Ht(e) {
  return e <= mn ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function sr(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function or(e, t, n) {
  return sr([...e, [t, n]]);
}
function ar(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function lr(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function cr(e, t, n, i) {
  const r = K(e, t);
  return je(e, t, { ...r, muted: or(r.muted, n, i) });
}
function ur(e, t, n) {
  const i = K(e, t), r = ar(i.muted, n);
  return r < 0 ? e : je(e, t, { ...i, muted: lr(i.muted, r) });
}
function dr(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((l) => Math.abs(Number(l) || 0)));
  return i;
}
function pr(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function It(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : tr()).filter((s) => s !== we), r = Object.keys(e?.strips ?? {}).filter((s) => s !== we && !i.includes(s));
  return [...i, ...r, we];
}
const Wt = "plenio_stem_mixer", Ft = "mix", oe = 200, fr = ["room", "plate", "hall"];
function C(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function Be(e, t, n, i, r) {
  const s = C("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function hr(e) {
  const t = C("div", "plenio-mix"), n = C("div", "plenio-mix-strips"), i = C("div", "plenio-mix-buses"), r = C("div", "plenio-mix-info"), s = C("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let l = {
    mix: { schema: Ae, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: It(null, null),
    peaks: {},
    seconds: 0
  }, f = !1;
  const m = () => e.widgets?.find((p) => p.name === Ft);
  function w(p, { draw: d = !0 } = {}) {
    const h = m();
    if (!h) return;
    const g = ir(p);
    h.value = g, h.callback?.(g), l = { ...l, mix: p }, d && $();
  }
  function x(p, d, h = {}) {
    w(je(l.mix, p, { ...K(l.mix, p), ...d }), h);
  }
  function T(p, d, h, g = {}) {
    const M = K(l.mix, p);
    let y = je(l.mix, p, { ...M, [d]: h });
    h > 0 && !(y[d] && Object.keys(y[d]).length) && (y = d === "reverb" ? { ...y, reverb: { preset: "room" } } : { ...y, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), w(y, g);
  }
  function R(p, d, h) {
    const g = { ...l.mix[p] ?? {} };
    w({ ...l.mix, [p]: { ...g, [d]: h } });
  }
  function $() {
    n.replaceChildren();
    const p = l.names;
    for (const d of l.names) {
      const h = K(l.mix, d), g = C("div", "plenio-mix-strip");
      g.dataset.strip = d;
      const M = C("span", "name", d === we ? `${d} (missed)` : d);
      M.title = d === we ? "What the separator missed: keeps a neutral mix exact" : "";
      const y = Be(mn, Ki, 0.5, h.gain_db, `${d} gain`), D = C("span", "gain", `${Ht(h.gain_db)} dB`);
      y.addEventListener("input", () => {
        D.textContent = `${Ht(Number(y.value))} dB`, x(d, { gain_db: Number(y.value) }, { draw: !1 });
      }), y.addEventListener("change", () => x(d, { gain_db: Number(y.value) }));
      const O = C("button", h.mute ? "toggle active" : "toggle", "M");
      O.setAttribute("aria-label", `${d} mute`), O.addEventListener("click", (k) => {
        k.stopPropagation(), x(d, { mute: !h.mute });
      });
      const q = C("button", h.solo ? "toggle active" : "toggle", "S");
      q.setAttribute("aria-label", `${d} solo`), q.addEventListener("click", (k) => {
        k.stopPropagation(), x(d, { solo: !h.solo });
      });
      const I = Be(0, 1, 0.05, h.compression, `${d} compression`);
      I.title = "Compression amount: one knob for the master compressor (threshold and ratio)", I.addEventListener("input", () => x(d, { compression: Number(I.value) }, { draw: !1 })), I.addEventListener("change", () => x(d, { compression: Number(I.value) }));
      const H = Ji.map((k) => {
        const N = Be(0, 1, 0.05, h[k], `${d} ${k} send`);
        return N.title = `${k} send: how much of this stem goes to the shared ${k} bus`, N.addEventListener("input", () => T(d, k, Number(N.value), { draw: !1 })), N.addEventListener("change", () => T(d, k, Number(N.value))), N;
      }), z = C("button", h.save ? "toggle active" : "toggle", "save");
      z.setAttribute("aria-label", `${d} save as its own file`), z.setAttribute("aria-pressed", String(h.save)), z.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", z.addEventListener("click", (k) => {
        k.stopPropagation(), x(d, { save: !h.save });
      });
      const re = rr(l.mix, d, p);
      g.classList.toggle("silent", !re);
      const X = C("canvas", "plenio-mix-wave");
      X.width = oe, X.height = 26, X.setAttribute("aria-label", `${d} waveform (drag to mute a time range)`), V(X, h, pr(l.peaks, d, oe)), X.addEventListener("pointerdown", (k) => _(k, X, d)), g.append(
        M,
        y,
        D,
        O,
        q,
        C("span", "label", "comp"),
        I,
        C("span", "label", "verb"),
        H[0],
        C("span", "label", "delay"),
        H[1],
        z,
        X
      ), n.append(g);
    }
    A(), r.textContent = l.seconds ? `last run: ${l.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function V(p, d, h) {
    const g = p.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, oe, p.height);
    const M = p.height / 2;
    g.strokeStyle = "rgba(180, 190, 205, 0.8)", g.beginPath();
    for (let y = 0; y < h.length; y++) {
      const D = Math.max(1, h[y] * (M - 1));
      g.moveTo(y + 0.5, M - D), g.lineTo(y + 0.5, M + D);
    }
    g.stroke(), g.fillStyle = "rgba(224, 104, 94, 0.35)", g.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [y, D] of d.muted) {
      const O = Math.max(0, Math.min(oe, y / Math.max(l.seconds, 1e-6) * oe)), q = Math.max(0, Math.min(oe, D / Math.max(l.seconds, 1e-6) * oe));
      g.fillRect(O, 0, Math.max(1, q - O), p.height), g.strokeRect(O + 0.5, 0.5, Math.max(1, q - O) - 1, p.height - 1);
    }
  }
  function _(p, d, h) {
    if (p.preventDefault(), p.stopPropagation(), !l.seconds) return;
    const g = d.getBoundingClientRect(), M = (H) => Math.max(0, Math.min(1, (H - g.left) / (g.width || oe))) * l.seconds, y = M(p.clientX);
    if (K(l.mix, h).muted.some(([H, z]) => H <= y && y <= z)) {
      w(ur(l.mix, h, y));
      return;
    }
    let O = y;
    const q = (H) => {
      O = M(H.clientX);
    }, I = () => {
      window.removeEventListener("pointermove", q), window.removeEventListener("pointerup", I), w(cr(l.mix, h, Math.min(y, O), Math.max(y, O)));
    };
    window.addEventListener("pointermove", q), window.addEventListener("pointerup", I);
  }
  function A() {
    i.replaceChildren();
    const p = { preset: "room", ...l.mix.reverb ?? {} }, d = { time_ms: 375, feedback: 0.35, ...l.mix.delay ?? {} }, h = C("select");
    h.setAttribute("aria-label", "Reverb preset"), h.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const y of fr) h.append(new Option(y, y));
    h.value = String(p.preset ?? "room"), h.addEventListener("change", () => R("reverb", "preset", h.value));
    const g = C("input");
    g.type = "number", g.value = String(d.time_ms ?? 375), g.setAttribute("aria-label", "Delay time in ms"), g.title = "Delay time in ms: where the first echo of the delay bus sits", g.addEventListener("change", () => R("delay", "time_ms", Number(g.value)));
    const M = Be(0, 0.8, 0.05, Number(d.feedback ?? 0.35), "Delay feedback");
    M.title = "Delay feedback: how much of each echo returns into the delay line", M.addEventListener("input", () => R("delay", "feedback", Number(M.value))), i.append(
      C("span", "label", "reverb bus"),
      h,
      C("span", "label", "delay bus"),
      g,
      C("span", "label", "ms, feedback"),
      M
    ), i.style.display = "flex";
  }
  const Y = e.addDOMWidget(Wt, Wt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  Y.serialize = !1;
  const a = e.widgets?.find((p) => p.name === Ft), P = C("button", "toggle", "JSON");
  P.title = "Show or hide the raw mixer value", P.addEventListener("click", (p) => {
    p.stopPropagation(), f = !f, P.classList.toggle("active", f), a && (a.plenioHidden = !f, f ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(C("span", "label", "Advanced"), P), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function E() {
    const p = nr(m()?.value);
    l = { ...l, mix: p ?? { schema: Ae, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), $();
  }
  return E(), {
    showExecuted(p) {
      const d = p?.plenio_stems?.at(-1), h = dr(p), g = It(l.mix, d ?? null);
      l = { ...l, names: g, peaks: h, seconds: Number(d?.seconds ?? l.seconds) || 0 }, E();
    }
  };
}
const mr = `
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
function gr() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = mr, document.head.append(e);
}
function ct(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Pe(e) {
  return ct(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function br(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function vr(e) {
  const t = [];
  let n = !1, i = null, r = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  }, l = () => {
    if (r) {
      const [f, ...m] = r, w = (x, T) => `<tr>${x.map((R) => `<${T}>${Pe(R)}</${T}>`).join("")}</tr>`;
      t.push(`<table><thead>${w(f, "th")}</thead><tbody>${m.map((x) => w(x, "td")).join("")}</tbody></table>`), r = null;
    }
  };
  for (const f of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      f.startsWith("```") ? (t.push(`<pre><code>${ct(i.join(`
`))}</code></pre>`), i = null) : i.push(f);
      continue;
    }
    if (f.trim().startsWith("|")) {
      s();
      const x = br(f);
      x && (r ??= []).push(x);
      continue;
    }
    if (l(), f.startsWith("```")) {
      s(), i = [];
      continue;
    }
    const m = /^(#{1,4})\s+(.*)$/.exec(f);
    if (m) {
      s();
      const x = Math.min(m[1].length + 2, 6);
      t.push(`<h${x}>${Pe(m[2])}</h${x}>`);
      continue;
    }
    const w = /^\s*[-*]\s+(.*)$/.exec(f);
    if (w) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Pe(w[1])}</li>`);
      continue;
    }
    s(), f.trim() && t.push(`<p>${Pe(f)}</p>`);
  }
  return s(), l(), i !== null && t.push(`<pre><code>${ct(i.join(`
`))}</code></pre>`), t.join("");
}
const st = "plenio_summary", jt = "plenio_summary", Gt = 84, yr = 18, wr = 55, xr = 16;
function _r(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / wr)), 0);
  return xr + t * yr;
}
function Sr(e, t) {
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
    getMaxHeight: () => Math.max(Gt, i.scrollHeight ? i.scrollHeight + 2 : _r(t.markdown))
  });
  return r.serialize = !1, i;
}
function Er(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Vt = /* @__PURE__ */ new WeakMap();
function Yt(e, t) {
  if (!t.markdown) return;
  const n = Vt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Vt.set(e, n);
  const i = Sr(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = vr(t.markdown), Er(e), e.setDirtyCanvas?.(!0, !0);
}
function kr(e) {
  e.prototype.onExecuted = ne(e.prototype.onExecuted, function(t) {
    const n = t?.[st], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[st] = { markdown: i.markdown, status: i.status ?? "" }, Yt(this, i));
  }), e.prototype.onConfigure = ne(e.prototype.onConfigure, function() {
    const t = this.properties?.[st];
    t?.markdown && Yt(this, t);
  });
}
const $r = "Plenio.Core", ge = zn;
Xi(ge);
const ut = Xt, bn = () => ut.graph;
function Qt(e) {
  if (e == null) return null;
  const t = String(e);
  return bn()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Ar = {
  scale: () => ut.canvas?.ds?.scale ?? 1,
  toast: (e, t) => ut.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
};
Xt.registerExtension({
  name: $r,
  getCustomWidgets: () => ({ [hn]: Ui }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => ki(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    kr(e), zi(e, Ar);
    const n = ni(t.input);
    if (n.size || t.name in ft) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = bi(t, r), l = Jn(s), f = i?.call(this, s);
        return ti(this, l, n), f;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ne(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) yi(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, fi(this, ge));
      }, e.prototype.onExecuted = ne(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Qn.has(t.name) && Xn(e, ge), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, hr(this));
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
    gr(), ge.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Tt(String(t.node_id), t);
      const n = Qt(t.node_id);
      n && ye(n, an(t));
    }), ge.addEventListener("execution_start", () => {
      Ei(bn()?.nodes ?? []);
    }), ge.addEventListener("execution_error", (e) => {
      const t = Qt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && ye(t, "error");
    });
  }
});
export {
  $r as E,
  Ut as P,
  Tr as a,
  Lr as b,
  zr as c,
  Pr as d,
  Rr as e,
  un as f,
  Nr as g,
  Fe as h,
  Or as i,
  pe as n,
  Rn as r,
  Dr as s,
  Cr as t,
  Di as u,
  Br as v,
  Bi as w
};
