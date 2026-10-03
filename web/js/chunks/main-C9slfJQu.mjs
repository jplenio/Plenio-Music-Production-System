import { api as Rn } from "../../../../scripts/api.js";
import { app as Ut } from "../../../../scripts/app.js";
function re(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class Jt extends Error {
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
  }), r = await i.json();
  if (!i.ok) {
    const s = r?.error ?? {};
    throw new Jt(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function On(e, t) {
  return se(e, "/plenio/sheet/resolve", t);
}
async function Lr(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function ft(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Cr(e, t, n, i) {
  return se(e, "/plenio/score/analyze", ft({ abc: t }, n, i));
}
function zr(e, t, n, i, r) {
  return se(e, "/plenio/score/transform", ft({ abc: t, operation: n }, i, r));
}
function Rr(e, t) {
  const { lyrics: n, spans: i, ...r } = t;
  return se(e, "/plenio/score/musicxml/export", ft(r, n, i));
}
function Or(e, t) {
  return se(e, "/plenio/score/midi/export", t);
}
function Tr(e, t) {
  return se(e, "/plenio/score/midi/import", t);
}
function Br(e, t) {
  return se(e, "/plenio/lyrics/analyze", t);
}
function Pr(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function _t(e, t, n, i = 200) {
  return se(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function Tn(e, t) {
  return se(e, "/plenio/brief/fields", t);
}
async function Bn(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Jt(`Request failed (${t.status})`);
  return await t.json();
}
const Ne = [
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
], Pn = ["length", "vocals", "melody"], ht = {
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
}, Dn = "custom";
function Kt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Dn;
}
function ke(e, t) {
  const n = ht[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Hn(e) {
  const t = {};
  for (const n of [...Ne, ...Pn]) {
    const i = ke(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function In(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function St(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!Ne.includes(i.field)) continue;
    const r = ke(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function Et(e) {
  const t = [];
  for (const n of Ne) {
    const i = ke(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function lt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Wn(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${Gn(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Fn(e) {
  const t = e ? lt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function jn(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Gn(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function kt(e, t) {
  for (const n of t) {
    const i = ke(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Vn(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Zt(e) {
  const t = [];
  for (const n of Ne) {
    const i = ke(e, n);
    !i || !Kt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const $t = "plenio_brief_template", Yn = 400;
function Qn(e, t) {
  let n = null, i = !1, r = null, s;
  const l = document.createElement("div");
  l.className = "plenio-brief-template";
  const f = document.createElement("div");
  f.className = "line";
  const m = document.createElement("div");
  m.className = "hint";
  const y = document.createElement("div");
  y.className = "actions", l.append(f, m, y);
  const w = (p, d, h) => {
    const g = document.createElement("button");
    return g.textContent = p, g.title = d, g.addEventListener("click", (q) => {
      q.stopPropagation(), h();
    }), y.append(g), g;
  }, O = w("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (kt(e, St(e, n).map((p) => ({ field: p.field, value: p.value }))), _());
  }), R = w("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (kt(e, lt(n)), _());
  }), k = w("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const p = Et(e);
    p.length && window.confirm(`Clear ${p.length} text field(s)? The template's values apply again.`) && (Vn(e, p), _());
  }), Y = w("↻", "Ask again what the template fills", () => {
    D();
  }), _ = () => {
    const p = Wn(n, i);
    f.textContent = r ?? p ?? "The template fills nothing: every text field has your value.", f.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const d = Fn(n), h = jn(n);
    m.textContent = [d, h].filter(Boolean).join(" · "), m.style.display = m.textContent ? "" : "none", y.style.display = i && n && n.template !== "none" ? "" : "none", O.disabled = !n || !St(e, n).length, R.disabled = !n || !lt(n).length, k.disabled = !Et(e).length, Y.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, $ = /* @__PURE__ */ new WeakSet(), Q = () => {
    for (const p of ["template", ...Object.keys(ht)]) {
      const d = p === "template" ? e.widgets?.find((h) => h.name === "template") : ke(e, p);
      !d || $.has(d) || ($.add(d), d.callback = re(d.callback, () => {
        Q(), D();
      }));
    }
  }, a = async () => {
    Q();
    const p = String(e.widgets?.find((d) => d.name === "template")?.value ?? "none");
    try {
      n = await Tn(t, { fields: Hn(e), template: p, kind: In(e) }), r = null;
    } catch (d) {
      n = null, r = `The template fields could not be read: ${d instanceof Error ? d.message : String(d)}`;
    }
    i = !0, _();
  };
  function D() {
    clearTimeout(s), s = setTimeout(() => {
      a();
    }, Yn);
  }
  Q();
  const E = e.addDOMWidget($t, $t, l, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return E.serialize = !1, Zt(e), _(), D(), {
    widget: E,
    refresh: D,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Xn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Un(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Qn(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(l) {
    s?.call(this, l), Zt(this), n.get(this)?.refresh();
  };
}
const Jn = "COMFY_DYNAMICCOMBO_V3";
function Kn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Zn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function ei(e, t) {
  const n = Zn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function ti(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ni(e, t, n) {
  if (!t || !e.widgets || ei(e, t)) return !1;
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
    if (n.has(s.name) && !ti(s, l)) return !0;
    s.value !== l && (s.value = l);
  }
  return !0;
}
function ii(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === Jn && t.add(i);
  return t;
}
const en = "plenio.eq/1", Ie = 8, ue = 20, ri = 2e4, Se = 12, tn = 15, we = ["peak", "low_shelf", "high_shelf"], nn = ["peak", "notch", "highpass", "lowpass"], At = [0.2, 10], Mt = [0.25, 1];
function be() {
  return { schema: en, preamp_db: 0, bands: [] };
}
function si(e) {
  if (typeof e != "string" || !e.trim()) return be();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: en,
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
function ye(e) {
  return JSON.stringify(e);
}
const V = (e, t) => Number(e.toFixed(t));
function W(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function rn(e) {
  return e.db ?? tn;
}
const qt = [6, 12, 18], oi = { 6: 8, 12: 14, 18: 20 };
function ai(e, t) {
  return { ...e, db: oi[t] ?? tn };
}
function fe(e, t) {
  return Math.log(W(t, ue, e.maxHz) / ue) / Math.log(e.maxHz / ue) * e.width;
}
function Nt(e, t) {
  return ue * (e.maxHz / ue) ** W(t / e.width, 0, 1);
}
function ce(e, t) {
  const n = rn(e);
  return (1 - (W(t, -n, n) + n) / (2 * n)) * e.height;
}
function Lt(e, t) {
  const n = rn(e);
  return (1 - W(t / e.height, 0, 1)) * 2 * n - n;
}
function Ct(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function zt(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${fe(e, i).toFixed(1)},${ce(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function mt(e) {
  return Math.min(ri, 0.45 * e);
}
function li(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function ci(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Ie) return null;
  const r = {
    id: li(e),
    enabled: !0,
    type: "peak",
    frequency_hz: V(W(t, ue, mt(i)), 1),
    gain_db: V(W(n, -Se, Se), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function $e(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: V(W(n, ue, mt(r)), 1),
        gain_db: we.includes(s.type) ? V(W(i, -Se, Se), 1) : s.gain_db
      }
    )
  };
}
function et(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: V(W(i.q * n, 0.2, 10), 3) } : i)
  };
}
function tt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Ae(e) {
  const t = e.frequency_hz >= 1e3 ? `${V(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = we.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${V(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${V(e.q, 2)}`;
}
function ui(e, t) {
  const n = sn[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = we.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = nn.includes(e.type) ? ` Q ${V(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const sn = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function nt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), i = 1;
  if (t && /k$/i.test(n) && (i = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const r = Number(n) * i;
  return Number.isFinite(r) ? r : null;
}
function Oe(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function We(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: V(W(Oe(s.frequency_hz, r.frequency_hz), ue, mt(i)), 1),
        gain_db: V(W(Oe(s.gain_db, r.gain_db), -Se, Se), 1),
        q: V(W(Oe(s.q, r.q), At[0], At[1]), 3),
        slope: V(W(Oe(s.slope, r.slope), Mt[0], Mt[1]), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function Rt(e, t) {
  return We(e, t, { gain_db: 0 });
}
function Ot(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((O) => Number.isFinite(O));
  if (!r.length) return "";
  const s = Math.max(...r), l = Math.min(...r), f = Math.max(s - l, 1e-6), m = e.height - 4, y = m - Math.max(12, e.height * W(i, 0.1, 0.95));
  return `M${t.map((O, R) => {
    const k = n[R], Y = Number.isFinite(k) ? (k - l) / f : 0;
    return `${fe(e, O).toFixed(1)},${(m - Y * (m - y)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${m.toFixed(1)} L0,${m.toFixed(1)} Z`;
}
class di {
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
    ye(t) !== ye(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const pi = "http://www.w3.org/2000/svg", Tt = "plenio_eq_panel", Te = "mode.bands", ae = { capture: !0 }, J = { width: 560, height: 260 }, Be = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let it = null;
function ne(e, t) {
  const n = document.createElementNS(pi, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function I(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function pe(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i.title = n, i;
}
function ie(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function fi(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, i) => {
    const r = t.bands[i];
    return r !== void 0 && n.type === r.type && n.enabled === r.enabled && Math.abs(n.frequency_hz - r.frequency_hz) < 0.5 && Math.abs(n.gain_db - r.gain_db) < 0.05 && Math.abs(n.q - r.q) < 0.01;
  });
}
function hi(e, t) {
  const n = I("div", "plenio-eq"), i = I("div", "plenio-eq-tools"), r = I("select");
  r.setAttribute("aria-label", "EQ preset"), r.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const s = I("select");
  s.setAttribute("aria-label", "Gain range"), s.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const o of qt) s.append(new Option(`±${o} dB`, String(o)));
  const l = pe("", "↶", "Undo the last band change"), f = pe("", "↷", "Redo the last band change"), m = pe("", "reset", "Remove every band"), y = pe("", "compare", "Show the curve without the EQ (bypass)"), w = pe("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), O = I("span", "plenio-eq-info");
  O.setAttribute("aria-live", "polite"), O.title = "What the panel is showing right now (the selected band, a note, or a hint)", i.append(r, s, l, f, m, y, w, O);
  const R = I("div", "plenio-eq-mode"), k = ne("svg", {
    viewBox: `0 0 ${J.width} ${J.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  k.setAttribute("aria-label", "EQ response curve"), k.setAttribute("tabindex", "0"), k.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const Y = I("div", "plenio-eq-strip"), _ = I("div", "plenio-eq-editor"), $ = I("div", "plenio-eq-fields");
  _.append($), n.append(i, R, k, Y, _);
  const Q = e.addDOMWidget(Tt, Tt, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  Q.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: be(), readonly: !0, note: "" }, D = null, E = null, p = !1, d = 12, h = null, g = [], q = 0, x, F, A = null, T = !1;
  const H = /* @__PURE__ */ new Map();
  let M = null;
  const B = new di(be()), Z = () => ie(e, Te), j = () => d, N = () => ai({ ...J, maxHz: Math.min(2e4, a.sampleRate / 2) }, j());
  function L(o, { record: u = !0 } = {}) {
    const c = Z();
    if (!c) return;
    const b = ye(o);
    c.value = b, c.callback?.(b), u && B.push(o), a = { ...a, settings: o }, U(), oe(0);
  }
  async function oe(o = 120) {
    clearTimeout(x), x = setTimeout(async () => {
      const u = String(ie(e, "mode")?.value ?? "flat");
      if (u !== "manual") {
        u === "flat" ? a = {
          ...a,
          settings: be(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : D !== u ? a = {
          ...a,
          settings: be(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: `${u}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : a = { ...a, readonly: !0 }, U();
        return;
      }
      const c = si(Z()?.value);
      if (!c) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, U();
        return;
      }
      ye(c) !== ye(B.current) && B.reset(c);
      const b = ++q;
      try {
        const S = await _t(t, c, a.sampleRate);
        if (b !== q) return;
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
  const ee = (o) => ({
    ...o.settings,
    bands: o.settings.bands.slice(0, Ie)
  });
  function me() {
    if (!h) return "";
    const o = g.find((u) => u.name === h);
    return o && fi(ee(o), a.settings) ? h : "";
  }
  function U() {
    k.replaceChildren(), H.clear(), M = null;
    const o = N();
    for (const c of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      k.append(
        ne("line", { x1: 0, x2: o.width, y1: ce(o, c), y2: ce(o, c), class: c ? "grid" : "grid zero" })
      );
    for (const c of [100, 1e3, 1e4])
      k.append(ne("line", { x1: fe(o, c), x2: fe(o, c), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && k.append(ne("path", { d: Ot(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && k.append(ne("path", { d: Ot(o, a.frequencies, a.afterDb), class: "spectrum after" })), p ? k.append(ne("line", { x1: 0, x2: o.width, y1: ce(o, 0), y2: ce(o, 0), class: "curve flat" })) : a.frequencies.length && (M = ne("path", { d: zt(o, a.frequencies, a.response), class: "curve" }), k.append(M)), !a.readonly && !p && a.settings.bands.forEach((c, b) => {
      const S = Be[b % Be.length], C = we.includes(c.type) ? c.gain_db : 0, v = ne("circle", {
        cx: fe(o, c.frequency_hz),
        cy: ce(o, C),
        r: c.id === E ? 9 : 7,
        class: c.id === E ? "handle selected" : "handle",
        style: `stroke: ${S}`,
        tabindex: 0,
        "data-band": c.id
      });
      v.setAttribute("aria-label", `Band ${b + 1}: ${Ae(c)}`), c.enabled || v.classList.add("disabled"), v.append(ne("title", {})), v.lastChild.textContent = `Band ${b + 1}: ${Ae(c)}`, v.addEventListener("pointerdown", (P) => kn(P, c.id)), v.addEventListener("dblclick", (P) => {
        P.stopPropagation(), L(Rt(a.settings, c.id));
      }), v.addEventListener("focus", () => _n(c.id)), v.addEventListener("keydown", (P) => vt(P, c.id)), v.addEventListener("wheel", (P) => {
        P.preventDefault();
        const de = P.deltaY < 0 ? 1.15 : 1 / 1.15;
        L(et(a.settings, c.id, de));
      }), v.addEventListener("contextmenu", (P) => {
        P.preventDefault(), L(tt(a.settings, c.id));
      }), k.append(v), H.set(c.id, v);
    }), yn(), wn(), xn();
    const u = a.settings.bands.find((c) => c.id === E);
    O.textContent = a.note || (p ? "compare: the curve is off (the node still applies it)" : u ? Ae(u) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Ie}`), r.disabled = a.readonly, l.disabled = !B.canUndo, f.disabled = !B.canRedo, m.disabled = a.readonly || !a.settings.bands.length, T && (T = !1, E && H.get(E)?.focus({ preventScroll: !0 })), s.value = String(d), r.value = me(), y.classList.toggle("active", p), w.classList.toggle("active", Ue()), e.setDirtyCanvas?.(!0, !0);
  }
  function yn() {
    if (Y.replaceChildren(), a.readonly && !a.settings.bands.length) {
      Y.append(I("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, u) => {
      const c = I("button", "plenio-eq-chip", ui(o, u));
      c.style.borderLeftColor = Be[u % Be.length], c.classList.toggle("selected", o.id === E), c.classList.toggle("disabled", !o.enabled), c.setAttribute("aria-label", `Edit band ${u + 1}`), c.title = `Band ${u + 1}: ${Ae(o)} - click to open its fields`, c.addEventListener("click", (b) => {
        b.stopPropagation(), E = E === o.id ? null : o.id, U();
      }), Y.append(c);
    });
  }
  function wn() {
    $.replaceChildren();
    const o = a.settings.bands.find((v) => v.id === E);
    if (!o || a.readonly) {
      _.style.display = "none";
      return;
    }
    _.style.display = "";
    const u = I("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`);
    u.title = "The selected band";
    const c = I("select");
    c.setAttribute("aria-label", "Band type"), c.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [v, P] of Object.entries(sn)) c.append(new Option(P, v));
    c.value = o.type, c.addEventListener("change", () => L(We(a.settings, o.id, { type: c.value })));
    const b = I("input");
    b.type = "checkbox", b.checked = o.enabled, b.setAttribute("aria-label", "Band enabled"), b.title = "Band enabled: off keeps the band in the list but out of the response", b.addEventListener("change", () => L(We(a.settings, o.id, { enabled: b.checked })));
    const S = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (v) => Ke(o.id, "frequency_hz", nt(v, { kilo: !0 }))
      ],
      ["dB", `${o.gain_db}`, 60, (v) => Ke(o.id, "gain_db", nt(v))],
      ["Q", `${o.q}`, 60, (v) => Ke(o.id, "q", nt(v))]
    ];
    $.append(u, c, b);
    for (const [v, P, de, Ce] of S) {
      const G = I("input", "number");
      G.value = P, G.style.width = `${de}px`, G.setAttribute("aria-label", `Band ${v}`), G.title = v === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : v === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const ze = () => {
        Ce(G.value) || (G.value = P);
      };
      G.addEventListener("keydown", (te) => {
        te.key === "Enter" && ze();
      }), G.addEventListener("blur", ze), (v === "dB" && !we.includes(o.type) || v === "Q" && !nn.includes(o.type)) && (G.disabled = !0), $.append(G);
    }
    const C = pe("", "remove", "Remove this band");
    C.addEventListener("click", (v) => {
      v.stopPropagation(), E = null, L(tt(a.settings, o.id));
    }), $.append(C);
  }
  function xn() {
    R.replaceChildren();
    const o = String(ie(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      R.style.display = "none";
      return;
    }
    R.style.display = "", R.append(
      I(
        "span",
        "plenio-eq-hint",
        D === o ? `applied proposal (${a.settings.bands.length} band(s), ${o})` : `${o}: no proposal yet - it is computed on the next run`
      )
    );
    const u = pe("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    u.disabled = !a.settings.bands.length, u.addEventListener("click", (c) => {
      c.stopPropagation();
      const b = ie(e, "mode");
      if (!b) return;
      b.value = "manual", b.callback?.("manual");
      const S = Z();
      if (S) {
        const C = ye(a.settings);
        S.value = C, S.callback?.(C);
      }
      B.reset(a.settings), Ze(), oe(0);
    }), R.append(u);
  }
  function _n(o) {
    E = o, T = !0, U();
  }
  function Sn(o) {
    E = o, Xe();
  }
  function Xe() {
    const o = N();
    a.settings.bands.forEach((c) => {
      const b = H.get(c.id);
      if (!b) return;
      const S = we.includes(c.type) ? c.gain_db : 0;
      b.setAttribute("cx", String(fe(o, c.frequency_hz))), b.setAttribute("cy", String(ce(o, S))), b.classList.toggle("selected", c.id === E), b.setAttribute("r", c.id === E ? "9" : "7");
    }), M && a.frequencies.length && M.setAttribute("d", zt(o, a.frequencies, a.response));
    const u = a.settings.bands.find((c) => c.id === E);
    u && (O.textContent = Ae(u));
  }
  function En() {
    clearTimeout(F), F = setTimeout(async () => {
      const o = a.settings, u = ++q;
      try {
        const c = await _t(t, o, a.sampleRate);
        if (u !== q) return;
        a = { ...a, frequencies: c.frequency_hz, response: c.response_db }, Xe();
      } catch {
      }
    }, 60);
  }
  function Ue() {
    return !ie(e, Te)?.plenioHidden;
  }
  function Je(o) {
    const u = ie(e, Te);
    u && (u.plenioHidden = !o, o ? delete u.computeSize : u.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Ke(o, u, c) {
    if (c === null) return !1;
    const b = a.settings.bands.find((S) => S.id === o);
    return b && b[u] === c || L(We(a.settings, o, { [u]: c })), !0;
  }
  function kn(o, u) {
    o.preventDefault(), o.stopPropagation(), E !== u && Sn(u);
    const c = a.settings.bands.find((X) => X.id === u);
    if (!c) return;
    A = { hz: c.frequency_hz, db: c.gain_db };
    let b = !1, S = !1;
    const C = o.currentTarget;
    try {
      C?.setPointerCapture?.(o.pointerId);
    } catch {
    }
    const v = k.getBoundingClientRect(), P = v.width ? v.left : 0, de = v.height ? v.top : 0, Ce = v.width || J.width, G = v.height || J.height, ze = (X, Re) => X >= P - 1 && X <= P + Ce + 1 && Re >= de - 1 && Re <= de + G + 1;
    function te() {
      if (!S) {
        S = !0;
        try {
          C?.releasePointerCapture?.(o.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", xt, ae), window.removeEventListener("pointerup", te, ae), window.removeEventListener("pointercancel", te, ae), window.removeEventListener("blur", te, ae), A = null, b && L(a.settings);
      }
    }
    const xt = (X) => {
      if (S || !A) return;
      if (X.buttons === 0) {
        te();
        return;
      }
      if (!ze(X.clientX, X.clientY)) return;
      const Re = J.width / Ce, An = J.height / G, Mn = (X.clientX - P) * Re, qn = (X.clientY - de) * An, Nn = fe(N(), A.hz), Ln = ce(N(), A.db), Cn = Nt(N(), Ct(Nn, Mn, X.shiftKey)), zn = Lt(N(), Ct(Ln, qn, X.shiftKey));
      a = { ...a, settings: $e(a.settings, u, Cn, zn, a.sampleRate) }, b = !0, Xe(), En();
    };
    window.addEventListener("pointermove", xt, ae), window.addEventListener("pointerup", te, ae), window.addEventListener("pointercancel", te, ae), window.addEventListener("blur", te, ae);
  }
  function vt(o, u) {
    const c = a.settings.bands.find((v) => v.id === u);
    if (!c) return;
    const b = o.shiftKey ? 0.1 : 0.5, S = o.shiftKey ? 1.01 : 1.06;
    let C = null;
    o.key === "ArrowUp" ? C = $e(a.settings, u, c.frequency_hz, c.gain_db + b, a.sampleRate) : o.key === "ArrowDown" ? C = $e(a.settings, u, c.frequency_hz, c.gain_db - b, a.sampleRate) : o.key === "ArrowRight" ? C = $e(a.settings, u, c.frequency_hz * S, c.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? C = $e(a.settings, u, c.frequency_hz / S, c.gain_db, a.sampleRate) : o.key === "+" ? C = et(a.settings, u, 1.15) : o.key === "-" ? C = et(a.settings, u, 1 / 1.15) : o.key === "0" ? C = Rt(a.settings, u) : (o.key === "Delete" || o.key === "Backspace") && (C = tt(a.settings, u)), C && (o.preventDefault(), L(C));
  }
  k.addEventListener("keydown", (o) => {
    E && o.target === k && vt(o, E);
  }), k.addEventListener("dblclick", (o) => {
    if (a.readonly || p) return;
    const u = k.getBoundingClientRect(), c = J.width / (u.width || J.width), b = J.height / (u.height || J.height), S = (o.clientX - u.left) * c, C = (o.clientY - u.top) * b, v = ci(a.settings, Nt(N(), S), Lt(N(), C), a.sampleRate);
    v ? (E = v.bands[v.bands.length - 1].id, L(v)) : (a = { ...a, note: `the EQ has at most ${Ie} bands` }, U());
  }), r.append(new Option("preset…", "")), it ??= Bn(t).then((o) => o.manual).catch(() => []), it.then((o) => {
    g = o;
    for (const u of o) r.append(new Option(u.name, u.name));
    r.value = me();
  }), r.addEventListener("change", async () => {
    const o = (await it)?.find((u) => u.name === r.value);
    o && (h = o.name, L(ee(o)));
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = qt.find((u) => u === o) ?? 12, U();
  }), l.addEventListener("click", () => {
    const o = B.undo();
    o && L(o, { record: !1 });
  }), f.addEventListener("click", () => {
    const o = B.redo();
    o && L(o, { record: !1 });
  }), m.addEventListener("click", () => {
    E = null, L(be());
  }), y.addEventListener("click", () => {
    p = !p, U();
  }), w.addEventListener("click", () => {
    Je(!Ue()), U();
  });
  function Ze() {
    for (const o of ["mode", Te]) {
      const u = ie(e, o);
      if (!u || u.plenioWatched) continue;
      u.plenioWatched = !0;
      const c = u.callback;
      u.callback = (b) => {
        c?.(b), setTimeout(() => {
          Ue() || Je(!1), oe();
        });
      };
    }
  }
  Ze(), Je(!1), oe(0);
  let yt = null, wt = null;
  const $n = setInterval(() => {
    if (!n.isConnected) {
      clearInterval($n);
      return;
    }
    const o = String(ie(e, "mode")?.value ?? "flat"), u = String(Z()?.value ?? "");
    o === yt && u === wt || (yt = o, wt = u, Ze(), oe(0));
  }, 700);
  return {
    showExecuted(o) {
      const u = o?.plenio_eq, c = u?.[u.length - 1];
      if (!c) return;
      const b = String(ie(e, "mode")?.value ?? "flat"), S = b === "manual";
      D = S || b === "flat" ? null : b, a = {
        sampleRate: c.sample_rate,
        frequencies: c.frequency_hz,
        response: c.response_db,
        settings: c.settings,
        readonly: !S,
        note: S ? "" : `applied: ${c.settings.bands.length} band(s)`,
        beforeDb: c.spectrum_before_db,
        afterDb: c.spectrum_after_db
      }, S ? oe(0) : U();
    }
  };
}
const gt = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, mi = new Set(Ne.map((e) => ht[e]));
function gi(e, t) {
  return !(e in gt) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => mi.has(n) && Kt(i)).map(([n]) => n);
}
function bi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function vi(e, t) {
  const n = gt[e.name];
  if (!n || !t) return t;
  const i = bi(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let l = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (l = { ...l, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (l = { ...l, widgets_values_named: { mode: n, ...s } });
  const f = gi(e.name, l.widgets_values_named);
  if (f.length) {
    const m = { ...l.widgets_values_named };
    for (const y of f) m[y] = "";
    l = { ...l, widgets_values_named: m };
  }
  return l;
}
const on = /* @__PURE__ */ new Map(), ct = /* @__PURE__ */ new Set();
function Bt(e, t) {
  on.set(e, t);
  for (const n of ct) n(e);
}
function ge(e) {
  return on.get(e) ?? null;
}
function yi(e) {
  return ct.add(e), () => ct.delete(e);
}
const an = /* @__PURE__ */ new Map();
function wi(e) {
  e?.draft_sha256 && an.set(e.draft_sha256, e);
}
function xi(e) {
  return e ? an.get(e) ?? null : null;
}
const rt = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function _i(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function Si(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function ln(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Ei(e) {
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
const je = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new Set();
function cn(e) {
  return je.get(e) ?? null;
}
function xe(e, t) {
  t ? je.set(e, t) : je.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Me) n(e);
}
function ki(e) {
  for (const t of e) je.delete(t);
  for (const t of Me) t(null);
}
function $i() {
  for (const e of Me) e(null);
}
function Ai(e) {
  return Me.add(e), () => Me.delete(e);
}
const Pt = "600 12px sans-serif", Pe = 20, st = 7;
function Mi(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function qi(e) {
  const t = e ? Mi(e) : "";
  return {
    height: e ? Pe : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Pt;
      const i = n.measureText(t).width + 2 * st;
      return n.restore(), i;
    },
    draw(n, i, r) {
      if (!e) return;
      n.save(), n.font = Pt;
      const s = n.measureText(t).width + 2 * st;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(i, r, s, Pe, 5) : n.rect(i, r, s, Pe), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, i + st, r + Pe / 2 + 0.5), n.restore();
    }
  };
}
const Ni = "PlenioSongSheet", Li = 30;
function un(e, t) {
  const n = e.widgets?.find((i) => i.name === t);
  return n ? String(n.value ?? "") : null;
}
function Ci(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? un(n, "mode") : null;
  } catch {
    return null;
  }
}
function ut(e) {
  const t = cn(e);
  return t || (e.type !== Ni ? null : Si(un(e, "review") ?? "continue", Ci(e)) ? "stop" : null);
}
function zi(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return ln(n);
  const i = e?.plenio_summary;
  return _i(i?.[i.length - 1]?.status);
}
function Ri(e, t) {
  const n = e.prototype, i = n.onNodeCreated;
  n.onNodeCreated = function() {
    i?.call(this);
    const r = this;
    r.badges?.push(() => {
      const s = ut(r);
      return qi(s ? rt[s] : null);
    });
  }, n.onDrawForeground = re(n.onDrawForeground, function(r) {
    const s = ut(this);
    !s || !rt[s].frame || this.flags?.collapsed || !this.size || Oi(r, rt[s], this.size, Li, t.scale());
  }), n.onExecuted = re(n.onExecuted, function(r) {
    const s = zi(r);
    s && (xe(this, s), s === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function Oi(e, t, n, i, r) {
  const s = Math.max(3, 3 / Math.max(r, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = s, e.beginPath();
  const l = s / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l, 10) : e.rect(-l, -i - l, n[0] + 2 * l, n[1] + i + 2 * l), e.stroke(), e.restore();
}
const bt = "plenio.sheet_state/1", Ye = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Qe() {
  return { schema: bt, docs: {} };
}
function Ee(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Qe();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== bt || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ge(e) {
  const t = {};
  for (const i of Ye) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: bt, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ot(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ti(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ye.filter((i) => ot(e, i) !== "auto").map(
    (i) => i === "lyrics" && ot(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${ot(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Dt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), i = Math.round(t - n * 60);
  return `${n}:${String(i).padStart(2, "0")}`;
}
function Dr(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: Dt(r?.[0] ?? 0), end: Dt(s?.[1] ?? e.duration_s) };
  }) : [];
}
function he(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Bi(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function Hr(e, t, n) {
  return n.map((i) => ({ kind: i, text: Bi(e, t, i), intent: "keep" }));
}
function dn(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const l = e.docs[s.kind], f = t?.docs[s.kind], m = he(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: m };
    else if (s.intent === "rebase")
      f?.upstream_sha256 ? i[s.kind] = { state: "edited", text: m, base_sha256: f.upstream_sha256 } : i[s.kind] = { state: "manual", text: m };
    else if (l)
      he(l.text) !== m && (i[s.kind] = { ...l, text: m });
    else {
      const y = he(f?.upstream ?? "");
      if (m === y) continue;
      i[s.kind] = f?.upstream_sha256 ? { state: "edited", text: m, base_sha256: f.upstream_sha256 } : { state: "manual", text: m };
    }
  }
  const r = { ...Qe(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function Pi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Di(e, t) {
  return Ye.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Hi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ii = "PlenioSongSheet";
function Le(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function pn(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const i = e.graph, r = i?.links, s = i?.getLink?.(n) ?? (r instanceof Map ? r.get(n) : r?.[String(n)]);
    return s && i?.getNodeById ? i.getNodeById(s.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function fn(e, t) {
  const n = (e.inputs ?? []).findIndex((i) => i.name === t && i.link != null);
  return n < 0 ? null : pn(e, n);
}
function hn(e, t) {
  const n = fn(e, t);
  return n && (n.comfyClass ?? n.type) === Ii && Le(n) ? n : null;
}
function Wi(e) {
  return hn(e, "context_lyrics");
}
function Fi(e) {
  return hn(e, "context_score");
}
function ji(e, t, n) {
  const i = [], r = fn(t, n);
  r && i.push(r);
  const s = /* @__PURE__ */ new Set();
  for (; i.length && s.size < 1e3; ) {
    const l = i.shift(), f = String(l.id);
    if (!s.has(f)) {
      if (s.add(f), l === e || f === String(e.id)) return !0;
      (l.inputs ?? []).forEach((m, y) => {
        const w = pn(l, y);
        w && i.push(w);
      });
    }
  }
  return !1;
}
function Gi(e, t, n) {
  const i = Wi(e), r = t?.context?.lyrics;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = Ee(Le(i)?.value), f = l?.docs.lyrics?.text ?? n(String(i.id))?.docs.lyrics?.upstream ?? null;
  let m = null;
  return l === null ? m = `The state of ${s} is unreadable - open that sheet and apply it first.` : f !== null && he(f) !== he(r) && (m = `The lyrics in ${s} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: i, target: { title: s, blocked: m, replans: ji(i, e, "score") } };
}
function Vi(e, t, n) {
  const i = Le(e);
  if (!i) return;
  const r = Ee(i.value) ?? Qe();
  i.value = Ge(dn(r, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Yi(e, t, n) {
  const i = Fi(e), r = t?.context?.score;
  if (!i || !r) return null;
  const s = i.title || "Song Sheet", l = Ee(Le(i)?.value), f = l?.docs.score?.text ?? n(String(i.id))?.docs.score?.upstream ?? null;
  let m = null;
  return l === null ? m = `The state of ${s} is unreadable - open that sheet and apply it first.` : f !== null && he(f) !== he(r) && (m = `The score in ${s} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: i, target: { title: s, blocked: m } };
}
function Qi(e, t) {
  const n = String(e.widgets?.find((i) => i.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Xi(e, t, n, i = null) {
  const r = Le(e);
  if (!r) return null;
  const s = Ee(r.value) ?? Qe(), l = dn(s, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (r.value = Ge(l), e.setDirtyCanvas?.(!0, !0), !i || !n) return l;
  try {
    const f = await On(i.fetcher, {
      sheet_state: l,
      upstream: Hi(n),
      owned: n.owned,
      review: Qi(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!f.findings.some((w) => w.severity === "error") || !f.fingerprint) return l;
    const y = Pi(l, f.fingerprint);
    return r.value = Ge(y), e.setDirtyCanvas?.(!0, !0), y;
  } catch {
    return l;
  }
}
const mn = "PLENIO_SHEET_STATE", Ht = 68;
let Fe = null;
function Ui(e) {
  Fe = e;
}
const Ji = (e, t, n) => {
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
  const y = () => {
    const _ = ge(String(e.id)), $ = ut(e);
    s.textContent = Ti(Ee(i)) + (_ && $ !== "approved" ? ` · ${_.status}` : ""), f.textContent = Ei($), f.dataset.state = $ ?? "";
    const Q = m ? null : e.widgets?.find((a) => a.name === "review");
    if (Q) {
      m = !0;
      const a = Q.callback;
      Q.callback = (D) => {
        a?.(D), y();
      };
    }
  }, w = e.addDOMWidget(t, mn, r, {
    getValue: () => i,
    setValue: (_) => {
      i = typeof _ == "string" ? _ : "", y();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Ht,
    getMaxHeight: () => Ht
  });
  l.addEventListener("click", (_) => {
    _.stopPropagation(), O().catch(($) => {
      console.error("Plenio: the Song Sheet editor could not open", $), s.textContent = `The editor could not open: ${$ instanceof Error ? $.message : String($)}`;
    });
  });
  async function O() {
    const _ = Ee(i);
    _ === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const $ = ge(String(e.id)), a = (e.inputs ?? []).filter((M) => M.link != null).map((M) => M.name), D = _ ?? { schema: "plenio.sheet_state/1", docs: {} }, E = $?.owned ?? Di(a, D), p = String(e.widgets?.find((M) => M.name === "review")?.value ?? "continue"), d = p === "as the brief says" ? $?.review ?? "continue" : p, { openSheetDialog: h } = await import("./open-qPoj0fiW.mjs"), { parseGuide: g, serializeGuide: q } = await import("./tracks-DxmZeggM.mjs"), { parseShift: x, parseSpans: F } = await import("./lyricPlacement-lv7ThC8m.mjs");
    if (!Fe) throw new Error("Plenio: API not initialised");
    let A = null;
    try {
      A = Gi(e, $, ge);
    } catch (M) {
      console.warn("Plenio: the lyrics sheet of this score was not found", M);
    }
    let T = null;
    try {
      T = Yi(e, $, ge);
    } catch (M) {
      console.warn("Plenio: the score sheet of these lyrics was not found", M);
    }
    const H = Fe;
    h({
      title: e.title || "Song Sheet",
      state: D,
      payload: $,
      asrNote: xi($?.docs.lyrics?.upstream_sha256),
      owned: E.length ? E : [...Ye],
      review: d,
      fetcher: Fe,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: g(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: F(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: x(e.properties?.plenio_source_shift),
      lyricsTarget: A?.target ?? null,
      scoreTarget: T?.target ?? null,
      onApply: (M, B, Z, j, N, L) => {
        const oe = String(w.value ?? "");
        if (w.value = Ge(M), e.properties = {
          ...e.properties ?? {},
          plenio_guide: q(B),
          plenio_lyric_spans: (L?.lyricSpans ?? []).map(([ee, me]) => [ee, me]),
          plenio_source_shift: L?.sourceShift ?? 0
        }, N ? xe(e, "approved") : String(w.value) !== oe && R(e), Z !== null && A && !A.target.blocked && (Vi(A.owner, Z, ge(String(A.owner.id))), R(A.owner)), j && T && !T.target.blocked) {
          const ee = T.owner;
          Xi(ee, j.text, ge(String(ee.id)), j.approved ? { fetcher: H } : null).then(
            (me) => {
              me?.review?.approved_fingerprint ? xe(ee, "approved") : R(ee);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function R(_) {
    cn(_) === "approved" && xe(_, null);
  }
  const k = [
    yi((_) => {
      _ === String(e.id) && y();
    }),
    Ai((_) => {
      (_ === null || _ === e) && y();
    })
  ], Y = e.onRemoved;
  return e.onRemoved = function() {
    for (const _ of k) _();
    Y?.call(this);
  }, y(), { widget: w };
}, qe = "plenio.stem_mix/1", _e = "rest", Ki = ["reverb", "delay"], gn = -60, Zi = 12;
function er() {
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
function bn(e) {
  const t = er();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const tr = ["vocals", "drums", "bass", "other"];
function nr() {
  return [...tr, _e];
}
function ir(e) {
  if (typeof e != "string" || !e.trim()) return { schema: qe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== qe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function rr(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || bn(K(e, i))) continue;
    const r = {}, s = K(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: qe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Ve(e, t, n) {
  const i = { ...e.strips };
  return bn(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function sr(e, t, n) {
  const i = n.some((s) => K(e, s).solo), r = K(e, t);
  return i ? r.solo : !r.mute;
}
function It(e) {
  return e <= gn ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function or(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function ar(e, t, n) {
  return or([...e, [t, n]]);
}
function lr(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function cr(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function ur(e, t, n, i) {
  const r = K(e, t);
  return Ve(e, t, { ...r, muted: ar(r.muted, n, i) });
}
function dr(e, t, n) {
  const i = K(e, t), r = lr(i.muted, n);
  return r < 0 ? e : Ve(e, t, { ...i, muted: cr(i.muted, r) });
}
function pr(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((l) => Math.abs(Number(l) || 0)));
  return i;
}
function fr(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function Wt(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : nr()).filter((s) => s !== _e), r = Object.keys(e?.strips ?? {}).filter((s) => s !== _e && !i.includes(s));
  return [...i, ...r, _e];
}
const Ft = "plenio_stem_mixer", jt = "mix", le = 200, hr = ["room", "plate", "hall"];
function z(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function De(e, t, n, i, r) {
  const s = z("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function mr(e) {
  const t = z("div", "plenio-mix"), n = z("div", "plenio-mix-strips"), i = z("div", "plenio-mix-buses"), r = z("div", "plenio-mix-info"), s = z("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let l = {
    mix: { schema: qe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Wt(null, null),
    peaks: {},
    seconds: 0
  }, f = !1;
  const m = () => e.widgets?.find((p) => p.name === jt);
  function y(p, { draw: d = !0 } = {}) {
    const h = m();
    if (!h) return;
    const g = rr(p);
    h.value = g, h.callback?.(g), l = { ...l, mix: p }, d && k();
  }
  function w(p, d, h = {}) {
    y(Ve(l.mix, p, { ...K(l.mix, p), ...d }), h);
  }
  function O(p, d, h, g = {}) {
    const q = K(l.mix, p);
    let x = Ve(l.mix, p, { ...q, [d]: h });
    h > 0 && !(x[d] && Object.keys(x[d]).length) && (x = d === "reverb" ? { ...x, reverb: { preset: "room" } } : { ...x, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), y(x, g);
  }
  function R(p, d, h) {
    const g = { ...l.mix[p] ?? {} };
    y({ ...l.mix, [p]: { ...g, [d]: h } });
  }
  function k() {
    n.replaceChildren();
    const p = l.names;
    for (const d of l.names) {
      const h = K(l.mix, d), g = z("div", "plenio-mix-strip");
      g.dataset.strip = d;
      const q = z("span", "name", d === _e ? `${d} (missed)` : d);
      q.title = d === _e ? "What the separator missed: keeps a neutral mix exact" : "";
      const x = De(gn, Zi, 0.5, h.gain_db, `${d} gain`), F = z("span", "gain", `${It(h.gain_db)} dB`);
      x.addEventListener("input", () => {
        F.textContent = `${It(Number(x.value))} dB`, w(d, { gain_db: Number(x.value) }, { draw: !1 });
      }), x.addEventListener("change", () => w(d, { gain_db: Number(x.value) }));
      const A = z("button", h.mute ? "toggle active" : "toggle", "M");
      A.setAttribute("aria-label", `${d} mute`), A.addEventListener("click", (N) => {
        N.stopPropagation(), w(d, { mute: !h.mute });
      });
      const T = z("button", h.solo ? "toggle active" : "toggle", "S");
      T.setAttribute("aria-label", `${d} solo`), T.addEventListener("click", (N) => {
        N.stopPropagation(), w(d, { solo: !h.solo });
      });
      const H = De(0, 1, 0.05, h.compression, `${d} compression`);
      H.title = "Compression amount: one knob for the master compressor (threshold and ratio)", H.addEventListener("input", () => w(d, { compression: Number(H.value) }, { draw: !1 })), H.addEventListener("change", () => w(d, { compression: Number(H.value) }));
      const M = Ki.map((N) => {
        const L = De(0, 1, 0.05, h[N], `${d} ${N} send`);
        return L.title = `${N} send: how much of this stem goes to the shared ${N} bus`, L.addEventListener("input", () => O(d, N, Number(L.value), { draw: !1 })), L.addEventListener("change", () => O(d, N, Number(L.value))), L;
      }), B = z("button", h.save ? "toggle active" : "toggle", "save");
      B.setAttribute("aria-label", `${d} save as its own file`), B.setAttribute("aria-pressed", String(h.save)), B.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", B.addEventListener("click", (N) => {
        N.stopPropagation(), w(d, { save: !h.save });
      });
      const Z = sr(l.mix, d, p);
      g.classList.toggle("silent", !Z);
      const j = z("canvas", "plenio-mix-wave");
      j.width = le, j.height = 26, j.setAttribute("aria-label", `${d} waveform (drag to mute a time range)`), Y(j, h, fr(l.peaks, d, le)), j.addEventListener("pointerdown", (N) => _(N, j, d)), g.append(
        q,
        x,
        F,
        A,
        T,
        z("span", "label", "comp"),
        H,
        z("span", "label", "verb"),
        M[0],
        z("span", "label", "delay"),
        M[1],
        B,
        j
      ), n.append(g);
    }
    $(), r.textContent = l.seconds ? `last run: ${l.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function Y(p, d, h) {
    const g = p.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, le, p.height);
    const q = p.height / 2;
    g.strokeStyle = "rgba(180, 190, 205, 0.8)", g.beginPath();
    for (let x = 0; x < h.length; x++) {
      const F = Math.max(1, h[x] * (q - 1));
      g.moveTo(x + 0.5, q - F), g.lineTo(x + 0.5, q + F);
    }
    g.stroke(), g.fillStyle = "rgba(224, 104, 94, 0.35)", g.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [x, F] of d.muted) {
      const A = Math.max(0, Math.min(le, x / Math.max(l.seconds, 1e-6) * le)), T = Math.max(0, Math.min(le, F / Math.max(l.seconds, 1e-6) * le));
      g.fillRect(A, 0, Math.max(1, T - A), p.height), g.strokeRect(A + 0.5, 0.5, Math.max(1, T - A) - 1, p.height - 1);
    }
  }
  function _(p, d, h) {
    if (p.preventDefault(), p.stopPropagation(), !l.seconds) return;
    const g = d.getBoundingClientRect(), q = (M) => Math.max(0, Math.min(1, (M - g.left) / (g.width || le))) * l.seconds, x = q(p.clientX);
    if (K(l.mix, h).muted.some(([M, B]) => M <= x && x <= B)) {
      y(dr(l.mix, h, x));
      return;
    }
    let A = x;
    const T = (M) => {
      A = q(M.clientX);
    }, H = () => {
      window.removeEventListener("pointermove", T), window.removeEventListener("pointerup", H), y(ur(l.mix, h, Math.min(x, A), Math.max(x, A)));
    };
    window.addEventListener("pointermove", T), window.addEventListener("pointerup", H);
  }
  function $() {
    i.replaceChildren();
    const p = { preset: "room", ...l.mix.reverb ?? {} }, d = { time_ms: 375, feedback: 0.35, ...l.mix.delay ?? {} }, h = z("select");
    h.setAttribute("aria-label", "Reverb preset"), h.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const x of hr) h.append(new Option(x, x));
    h.value = String(p.preset ?? "room"), h.addEventListener("change", () => R("reverb", "preset", h.value));
    const g = z("input");
    g.type = "number", g.value = String(d.time_ms ?? 375), g.setAttribute("aria-label", "Delay time in ms"), g.title = "Delay time in ms: where the first echo of the delay bus sits", g.addEventListener("change", () => R("delay", "time_ms", Number(g.value)));
    const q = De(0, 0.8, 0.05, Number(d.feedback ?? 0.35), "Delay feedback");
    q.title = "Delay feedback: how much of each echo returns into the delay line", q.addEventListener("input", () => R("delay", "feedback", Number(q.value))), i.append(
      z("span", "label", "reverb bus"),
      h,
      z("span", "label", "delay bus"),
      g,
      z("span", "label", "ms, feedback"),
      q
    ), i.style.display = "flex";
  }
  const Q = e.addDOMWidget(Ft, Ft, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  Q.serialize = !1;
  const a = e.widgets?.find((p) => p.name === jt), D = z("button", "toggle", "JSON");
  D.title = "Show or hide the raw mixer value", D.addEventListener("click", (p) => {
    p.stopPropagation(), f = !f, D.classList.toggle("active", f), a && (a.plenioHidden = !f, f ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(z("span", "label", "Advanced"), D), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function E() {
    const p = ir(m()?.value);
    l = { ...l, mix: p ?? { schema: qe, strips: {} } }, p || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), k();
  }
  return E(), {
    showExecuted(p) {
      const d = p?.plenio_stems?.at(-1), h = pr(p), g = Wt(l.mix, d ?? null);
      l = { ...l, names: g, peaks: h, seconds: Number(d?.seconds ?? l.seconds) || 0 }, E();
    }
  };
}
const gr = `
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
function br() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = gr, document.head.append(e);
}
function dt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function He(e) {
  return dt(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function vr(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function yr(e) {
  const t = [];
  let n = !1, i = null, r = null;
  const s = () => {
    n && (t.push("</ul>"), n = !1);
  }, l = () => {
    if (r) {
      const [f, ...m] = r, y = (w, O) => `<tr>${w.map((R) => `<${O}>${He(R)}</${O}>`).join("")}</tr>`;
      t.push(`<table><thead>${y(f, "th")}</thead><tbody>${m.map((w) => y(w, "td")).join("")}</tbody></table>`), r = null;
    }
  };
  for (const f of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      f.startsWith("```") ? (t.push(`<pre><code>${dt(i.join(`
`))}</code></pre>`), i = null) : i.push(f);
      continue;
    }
    if (f.trim().startsWith("|")) {
      s();
      const w = vr(f);
      w && (r ??= []).push(w);
      continue;
    }
    if (l(), f.startsWith("```")) {
      s(), i = [];
      continue;
    }
    const m = /^(#{1,4})\s+(.*)$/.exec(f);
    if (m) {
      s();
      const w = Math.min(m[1].length + 2, 6);
      t.push(`<h${w}>${He(m[2])}</h${w}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(f);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${He(y[1])}</li>`);
      continue;
    }
    s(), f.trim() && t.push(`<p>${He(f)}</p>`);
  }
  return s(), l(), i !== null && t.push(`<pre><code>${dt(i.join(`
`))}</code></pre>`), t.join("");
}
const at = "plenio_summary", Gt = "plenio_summary", Vt = 84, wr = 18, xr = 55, _r = 16;
function Sr(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, i) => n + Math.max(1, Math.ceil(i.length / xr)), 0);
  return _r + t * wr;
}
function Er(e, t) {
  const n = e.widgets?.find((s) => s.name === Gt);
  if (n?.element) return n.element;
  const i = document.createElement("div");
  i.className = "plenio-summary";
  const r = e.addDOMWidget(Gt, "plenio_summary", i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Vt,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(Vt, i.scrollHeight ? i.scrollHeight + 2 : Sr(t.markdown))
  });
  return r.serialize = !1, i;
}
function kr(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Yt = /* @__PURE__ */ new WeakMap();
function Qt(e, t) {
  if (!t.markdown) return;
  const n = Yt.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Yt.set(e, n);
  const i = Er(e, n);
  i.dataset.status = t.status ?? "", i.innerHTML = yr(t.markdown), kr(e), e.setDirtyCanvas?.(!0, !0);
}
function $r(e) {
  e.prototype.onExecuted = re(e.prototype.onExecuted, function(t) {
    const n = t?.[at], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[at] = { markdown: i.markdown, status: i.status ?? "" }, Qt(this, i));
  }), e.prototype.onConfigure = re(e.prototype.onConfigure, function() {
    const t = this.properties?.[at];
    t?.markdown && Qt(this, t);
  });
}
const Ar = "Plenio.Core", ve = Rn;
Ui(ve);
const pt = Ut, vn = () => pt.graph;
function Xt(e) {
  if (e == null) return null;
  const t = String(e);
  return vn()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const Mr = {
  scale: () => pt.canvas?.ds?.scale ?? 1,
  toast: (e, t) => pt.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
};
Ut.registerExtension({
  name: Ar,
  getCustomWidgets: () => ({ [mn]: Ji }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => $i(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    $r(e), Ri(e, Mr);
    const n = ii(t.input);
    if (n.size || t.name in gt) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = vi(t, r), l = Kn(s), f = i?.call(this, s);
        return ni(this, l, n), f;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = re(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) wi(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, hi(this, ve));
      }, e.prototype.onExecuted = re(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (Xn.has(t.name) && Un(e, ve), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, mr(this));
      }, e.prototype.onExecuted = re(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = re(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && Bt(String(this.id), s);
    }));
  },
  setup() {
    br(), ve.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      if (!t?.node_id) return;
      Bt(String(t.node_id), t);
      const n = Xt(t.node_id);
      n && xe(n, ln(t));
    }), ve.addEventListener("execution_start", () => {
      ki(vn()?.nodes ?? []);
    }), ve.addEventListener("execution_error", (e) => {
      const t = Xt(e.detail?.node_id);
      t && String(t.type).startsWith("Plenio") && xe(t, "error");
    });
  }
});
export {
  Ar as E,
  Jt as P,
  Br as a,
  Cr as b,
  Rr as c,
  Dr as d,
  Or as e,
  dn as f,
  Lr as g,
  Ge as h,
  Tr as i,
  he as n,
  On as r,
  Hr as s,
  zr as t,
  Hi as u,
  Pr as v,
  Pi as w
};
