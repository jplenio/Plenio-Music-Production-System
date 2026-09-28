import { api as Nt } from "../../../../scripts/api.js";
import { app as Lt } from "../../../../scripts/app.js";
function Q(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class ut extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ee(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), o = await i.json();
  if (!i.ok) {
    const r = o?.error ?? {};
    throw new ut(r.message ?? `Request failed (${i.status})`, r.hint ?? null);
  }
  return o;
}
function Yn(e, t) {
  return ee(e, "/plenio/sheet/resolve", t);
}
async function Un(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Qn(e, t) {
  return ee(e, "/plenio/score/analyze", { abc: t });
}
function Jn(e, t, n) {
  return ee(e, "/plenio/score/transform", { abc: t, operation: n });
}
function Kn(e, t) {
  return ee(e, "/plenio/score/midi/export", t);
}
function Zn(e, t) {
  return ee(e, "/plenio/score/midi/import", t);
}
function ei(e, t) {
  return ee(e, "/plenio/lyrics/analyze", t);
}
function ti(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function Ct(e, t, n, i = 200) {
  return ee(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function zt(e, t) {
  return ee(e, "/plenio/brief/fields", t);
}
async function Ot(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new ut(`Request failed (${t.status})`);
  return await t.json();
}
const he = [
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
], Bt = ["length", "vocals", "melody"], pt = {
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
}, Rt = "custom";
function ft(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Rt;
}
function oe(e, t) {
  const n = pt[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Pt(e) {
  const t = {};
  for (const n of [...he, ...Bt]) {
    const i = oe(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function Fe(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!he.includes(i.field)) continue;
    const o = oe(e, i.field);
    o && !String(o.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function Ge(e) {
  const t = [];
  for (const n of he) {
    const i = oe(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Re(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Dt(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${jt(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Ht(e) {
  const t = e ? Re(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Tt(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function jt(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Ve(e, t) {
  for (const n of t) {
    const i = oe(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Wt(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function mt(e) {
  const t = [];
  for (const n of he) {
    const i = oe(e, n);
    !i || !ft(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Xe = "plenio_brief_template", It = 400;
function Ft(e, t) {
  let n = null, i = !1, o = null, r;
  const l = document.createElement("div");
  l.className = "plenio-brief-template";
  const y = document.createElement("div");
  y.className = "line";
  const b = document.createElement("div");
  b.className = "hint";
  const x = document.createElement("div");
  x.className = "actions", l.append(y, b, x);
  const N = (d, u, m) => {
    const f = document.createElement("button");
    return f.textContent = d, f.title = u, f.addEventListener("click", (v) => {
      v.stopPropagation(), m();
    }), x.append(f), f;
  }, L = N("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Ve(e, Fe(e, n).map((d) => ({ field: d.field, value: d.value }))), B());
  }), O = N("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Ve(e, Re(n)), B());
  }), E = N("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const d = Ge(e);
    d.length && window.confirm(`Clear ${d.length} text field(s)? The template's values apply again.`) && (Wt(e, d), B());
  }), D = N("↻", "Ask again what the template fills", () => {
    j();
  }), B = () => {
    const d = Dt(n, i);
    y.textContent = o ?? d ?? "The template fills nothing: every text field has your value.", y.dataset.state = o ? "error" : i && n ? "ok" : "empty";
    const u = Ht(n), m = Tt(n);
    b.textContent = [u, m].filter(Boolean).join(" · "), b.style.display = b.textContent ? "" : "none", x.style.display = i && n && n.template !== "none" ? "" : "none", L.disabled = !n || !Fe(e, n).length, O.disabled = !n || !Re(n).length, E.disabled = !Ge(e).length, D.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, T = async () => {
    const d = String(e.widgets?.find((u) => u.name === "template")?.value ?? "none");
    try {
      n = await zt(t, { fields: Pt(e), template: d }), o = null;
    } catch (u) {
      n = null, o = `The template fields could not be read: ${u instanceof Error ? u.message : String(u)}`;
    }
    i = !0, B();
  };
  function j() {
    clearTimeout(r), r = setTimeout(() => {
      T();
    }, It);
  }
  const a = e.widgets?.find((d) => d.name === "template");
  a && (a.callback = Q(a.callback, () => j()));
  for (const d of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const u = oe(e, d);
    u && (u.callback = Q(u.callback, () => j()));
  }
  const $ = oe(e, "vocals");
  $ && ($.callback = Q($.callback, () => j()));
  const R = e.addDOMWidget(Xe, Xe, l, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return R.serialize = !1, mt(e), B(), j(), {
    widget: R,
    refresh: j,
    answer: () => n,
    dispose: () => clearTimeout(r)
  };
}
const Gt = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Vt(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, o = i.onNodeCreated;
  i.onNodeCreated = function() {
    o?.call(this), n.set(this, Ft(this, t));
  };
  const r = i.onConfigure;
  i.onConfigure = function(l) {
    r?.call(this, l), mt(this), n.get(this)?.refresh();
  };
}
const Xt = "COMFY_DYNAMICCOMBO_V3";
function Yt(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Ut(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Qt(e, t) {
  const n = Ut(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, o) => i.value === t[o]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function Jt(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Kt(e, t, n) {
  if (!t || !e.widgets || Qt(e, t)) return !1;
  let i = 0;
  for (let o = 0; o < e.widgets.length; o++) {
    const r = e.widgets[o];
    if (r.serialize === !1) continue;
    let l;
    if (Array.isArray(t)) {
      if (i >= t.length) break;
      l = t[i++];
    } else if (r.name in t)
      l = t[r.name];
    else
      continue;
    if (n.has(r.name) && !Jt(r, l)) return !0;
    r.value !== l && (r.value = l);
  }
  return !0;
}
function Zt(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === Xt && t.add(i);
  return t;
}
const gt = "plenio.eq/1", we = 8, Z = 20, en = 2e4, ce = 12, ht = 15, me = ["peak", "low_shelf", "high_shelf"];
function fe() {
  return { schema: gt, preamp_db: 0, bands: [] };
}
function tn(e) {
  if (typeof e != "string" || !e.trim()) return fe();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: gt,
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
function ae(e) {
  return JSON.stringify(e);
}
const V = (e, t) => Number(e.toFixed(t));
function P(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function bt(e) {
  return e.db ?? ht;
}
const Ye = [6, 12, 18], nn = { 6: 8, 12: 14, 18: 20 };
function on(e, t) {
  return { ...e, db: nn[t] ?? ht };
}
function le(e, t) {
  return Math.log(P(t, Z, e.maxHz) / Z) / Math.log(e.maxHz / Z) * e.width;
}
function Ue(e, t) {
  return Z * (e.maxHz / Z) ** P(t / e.width, 0, 1);
}
function ie(e, t) {
  const n = bt(e);
  return (1 - (P(t, -n, n) + n) / (2 * n)) * e.height;
}
function Qe(e, t) {
  const n = bt(e);
  return (1 - P(t / e.height, 0, 1)) * 2 * n - n;
}
function Je(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function rn(e, t, n) {
  return t.map((i, o) => `${o ? "L" : "M"}${le(e, i).toFixed(1)},${ie(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function Te(e) {
  return Math.min(en, 0.45 * e);
}
function sn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function an(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= we) return null;
  const o = {
    id: sn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: V(P(t, Z, Te(i)), 1),
    gain_db: V(P(n, -ce, ce), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, o] };
}
function ue(e, t, n, i, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: V(P(n, Z, Te(o)), 1),
        gain_db: me.includes(r.type) ? V(P(i, -ce, ce), 1) : r.gain_db
      }
    )
  };
}
function Ae(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: V(P(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Me(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Ne(e) {
  const t = e.frequency_hz >= 1e3 ? `${V(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = me.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function ln(e, t) {
  const n = yt[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, o = me.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = e.type === "peak" || e.type === "notch" ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${o}${r}${e.enabled ? "" : " (off)"}`;
}
const yt = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function se(e, t, n, i = 48e3) {
  return {
    ...e,
    bands: e.bands.map((o) => {
      if (o.id !== t) return o;
      const r = { ...o, ...n };
      return {
        ...r,
        frequency_hz: V(P(Number(r.frequency_hz ?? o.frequency_hz), Z, Te(i)), 1),
        gain_db: V(P(Number(r.gain_db ?? o.gain_db), -ce, ce), 1),
        q: V(P(Number(r.q ?? o.q), 0.2, 10), 3),
        slope: V(P(Number(r.slope ?? o.slope), 0.1, 4), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function Ke(e, t) {
  return se(e, t, { gain_db: 0 });
}
function Ze(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const o = n.filter((L) => Number.isFinite(L));
  if (!o.length) return "";
  const r = Math.max(...o), l = Math.min(...o), y = Math.max(r - l, 1e-6), b = e.height - 4, x = b - Math.max(12, e.height * P(i, 0.1, 0.95));
  return `M${t.map((L, O) => {
    const E = n[O], D = Number.isFinite(E) ? (E - l) / y : 0;
    return `${le(e, L).toFixed(1)},${(b - D * (b - x)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${b.toFixed(1)} L0,${b.toFixed(1)} Z`;
}
class cn {
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
    ae(t) !== ae(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const dn = "http://www.w3.org/2000/svg", et = "plenio_eq_panel", ye = "mode.bands", F = { width: 560, height: 260 }, ve = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Le = null;
function U(e, t) {
  const n = document.createElementNS(dn, e);
  for (const [i, o] of Object.entries(t)) n.setAttribute(i, String(o));
  return n;
}
function z(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function ne(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i;
}
function J(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function un(e, t) {
  const n = z("div", "plenio-eq"), i = z("div", "plenio-eq-tools"), o = z("select");
  o.setAttribute("aria-label", "EQ preset");
  const r = z("select");
  r.setAttribute("aria-label", "Gain range");
  for (const s of Ye) r.append(new Option(`±${s} dB`, String(s)));
  const l = ne("", "↶", "Undo the last band change"), y = ne("", "↷", "Redo the last band change"), b = ne("", "reset", "Remove every band"), x = ne("", "compare", "Show the curve without the EQ (bypass)"), N = ne("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), L = z("span", "plenio-eq-info");
  L.setAttribute("aria-live", "polite"), i.append(o, r, l, y, b, x, N, L);
  const O = z("div", "plenio-eq-mode"), E = U("svg", {
    viewBox: `0 0 ${F.width} ${F.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  E.setAttribute("aria-label", "EQ response curve");
  const D = z("div", "plenio-eq-strip"), B = z("div", "plenio-eq-editor"), T = z("div", "plenio-eq-fields");
  B.append(T), n.append(i, O, E, D, B);
  const j = e.addDOMWidget(et, et, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: fe(), readonly: !0, note: "" }, $ = null, R = !1, d = 12, u = 0, m, f = null;
  const v = new cn(fe()), w = () => J(e, ye), G = () => d, M = () => on({ ...F, maxHz: Math.min(2e4, a.sampleRate / 2) }, G());
  function _(s, { record: p = !0 } = {}) {
    const c = w();
    if (!c) return;
    const h = ae(s);
    c.value = h, c.callback?.(h), p && v.push(s), a = { ...a, settings: s }, A(), H(0);
  }
  async function H(s = 120) {
    clearTimeout(m), m = setTimeout(async () => {
      const p = String(J(e, "mode")?.value ?? "flat");
      if (p !== "manual") {
        p === "flat" ? a = {
          ...a,
          settings: fe(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : a = { ...a, readonly: !0 }, A();
        return;
      }
      const c = tn(w()?.value);
      if (!c) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, A();
        return;
      }
      ae(c) !== ae(v.current) && v.reset(c);
      const h = ++u;
      try {
        const k = await Ct(t, c, a.sampleRate);
        if (h !== u) return;
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
      A();
    }, s);
  }
  function A() {
    E.replaceChildren();
    const s = M();
    for (const c of [-s.db, -s.db / 2, 0, s.db / 2, s.db])
      E.append(
        U("line", { x1: 0, x2: s.width, y1: ie(s, c), y2: ie(s, c), class: c ? "grid" : "grid zero" })
      );
    for (const c of [100, 1e3, 1e4])
      E.append(U("line", { x1: le(s, c), x2: le(s, c), y1: 0, y2: s.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && E.append(U("path", { d: Ze(s, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && E.append(U("path", { d: Ze(s, a.frequencies, a.afterDb), class: "spectrum after" })), R ? E.append(U("line", { x1: 0, x2: s.width, y1: ie(s, 0), y2: ie(s, 0), class: "curve flat" })) : a.frequencies.length && E.append(U("path", { d: rn(s, a.frequencies, a.response), class: "curve" })), !a.readonly && !R && a.settings.bands.forEach((c, h) => {
      const k = ve[h % ve.length], S = me.includes(c.type) ? c.gain_db : 0, g = U("circle", {
        cx: le(s, c.frequency_hz),
        cy: ie(s, S),
        r: c.id === $ ? 9 : 7,
        class: c.id === $ ? "handle selected" : "handle",
        style: `stroke: ${k}`,
        tabindex: 0,
        "data-band": c.id
      });
      g.setAttribute("aria-label", `Band ${h + 1}: ${Ne(c)}`), c.enabled || g.classList.add("disabled"), g.append(U("title", {})), g.lastChild.textContent = `Band ${h + 1}: ${Ne(c)}`, g.addEventListener("pointerdown", (C) => St(C, c.id)), g.addEventListener("dblclick", (C) => {
        C.stopPropagation(), _(Ke(a.settings, c.id));
      }), g.addEventListener("focus", () => te(c.id)), g.addEventListener("keydown", (C) => $t(C, c.id)), g.addEventListener("wheel", (C) => {
        C.preventDefault();
        const de = C.deltaY < 0 ? 1.15 : 1 / 1.15;
        _(Ae(a.settings, c.id, de));
      }), g.addEventListener("contextmenu", (C) => {
        C.preventDefault(), _(Me(a.settings, c.id));
      }), E.append(g);
    }), re(), Y(), W();
    const p = a.settings.bands.find((c) => c.id === $);
    L.textContent = a.note || (R ? "compare: the curve is off (the node still applies it)" : p ? Ne(p) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${we}`), o.disabled = a.readonly, l.disabled = !v.canUndo, y.disabled = !v.canRedo, b.disabled = a.readonly || !a.settings.bands.length, r.value = String(d), x.classList.toggle("active", R), N.classList.toggle("active", Se()), e.setDirtyCanvas?.(!0, !0);
  }
  function re() {
    if (D.replaceChildren(), a.readonly && !a.settings.bands.length) {
      D.append(z("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((s, p) => {
      const c = z("button", "plenio-eq-chip", ln(s, p));
      c.style.borderLeftColor = ve[p % ve.length], c.classList.toggle("selected", s.id === $), c.classList.toggle("disabled", !s.enabled), c.setAttribute("aria-label", `Edit band ${p + 1}`), c.addEventListener("click", (h) => {
        h.stopPropagation(), $ = $ === s.id ? null : s.id, A();
      }), D.append(c);
    });
  }
  function Y() {
    T.replaceChildren();
    const s = a.settings.bands.find((g) => g.id === $);
    if (!s || a.readonly) {
      B.style.display = "none";
      return;
    }
    B.style.display = "";
    const p = z("span", "name", `Band ${a.settings.bands.indexOf(s) + 1}`), c = z("select");
    c.setAttribute("aria-label", "Band type");
    for (const [g, C] of Object.entries(yt)) c.append(new Option(C, g));
    c.value = s.type, c.addEventListener("change", () => _(se(a.settings, s.id, { type: c.value })));
    const h = z("input");
    h.type = "checkbox", h.checked = s.enabled, h.setAttribute("aria-label", "Band enabled"), h.addEventListener("change", () => _(se(a.settings, s.id, { enabled: h.checked })));
    const k = [
      [
        "Hz",
        `${s.frequency_hz}`,
        70,
        (g) => _(se(a.settings, s.id, { frequency_hz: Number(g) }))
      ],
      ["dB", `${s.gain_db}`, 60, (g) => _(se(a.settings, s.id, { gain_db: Number(g) }))],
      ["Q", `${s.q}`, 60, (g) => _(se(a.settings, s.id, { q: Number(g) }))]
    ];
    T.append(p, c, h);
    for (const [g, C, de, be] of k) {
      const I = z("input", "number");
      I.value = C, I.style.width = `${de}px`, I.setAttribute("aria-label", `Band ${g}`), I.addEventListener("keydown", (qe) => {
        qe.key === "Enter" && be(I.value);
      }), I.addEventListener("blur", () => be(I.value)), g !== "Hz" && !me.includes(s.type) && (I.disabled = !0), T.append(I);
    }
    const S = ne("", "remove", "Remove this band");
    S.addEventListener("click", (g) => {
      g.stopPropagation(), $ = null, _(Me(a.settings, s.id));
    }), T.append(S);
  }
  function W() {
    O.replaceChildren();
    const s = String(J(e, "mode")?.value ?? "flat");
    if (s === "manual" || s === "flat") {
      O.style.display = "none";
      return;
    }
    O.style.display = "", O.append(
      z("span", "plenio-eq-hint", `applied proposal (${a.settings.bands.length} band(s), ${s})`)
    );
    const p = ne("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    p.disabled = !a.settings.bands.length, p.addEventListener("click", (c) => {
      c.stopPropagation();
      const h = J(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const k = w();
      if (k) {
        const S = ae(a.settings);
        k.value = S, k.callback?.(S);
      }
      v.reset(a.settings), Ie(), H(0);
    }), O.append(p);
  }
  function te(s) {
    $ = s, A();
  }
  function Se() {
    return !J(e, ye)?.plenioHidden;
  }
  function $e(s) {
    const p = J(e, ye);
    p && (p.plenioHidden = !s, s ? delete p.computeSize : p.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function St(s, p) {
    s.preventDefault(), s.stopPropagation(), te(p);
    const c = a.settings.bands.find((g) => g.id === p);
    if (!c) return;
    f = { hz: c.frequency_hz, db: c.gain_db };
    const h = E.getBoundingClientRect(), k = (g) => {
      const C = F.width / (h.width || F.width), de = F.height / (h.height || F.height), be = (g.clientX - h.left) * C, I = (g.clientY - h.top) * de, qe = le(M(), f.hz), qt = ie(M(), f.db), At = Ue(M(), Je(qe, be, g.shiftKey)), Mt = Qe(M(), Je(qt, I, g.shiftKey));
      a = { ...a, settings: ue(a.settings, p, At, Mt, a.sampleRate) }, A();
    }, S = () => {
      window.removeEventListener("pointermove", k), window.removeEventListener("pointerup", S), f = null, _(a.settings);
    };
    window.addEventListener("pointermove", k), window.addEventListener("pointerup", S);
  }
  function $t(s, p) {
    const c = a.settings.bands.find((g) => g.id === p);
    if (!c) return;
    const h = s.shiftKey ? 0.1 : 0.5, k = s.shiftKey ? 1.01 : 1.06;
    let S = null;
    s.key === "ArrowUp" ? S = ue(a.settings, p, c.frequency_hz, c.gain_db + h, a.sampleRate) : s.key === "ArrowDown" ? S = ue(a.settings, p, c.frequency_hz, c.gain_db - h, a.sampleRate) : s.key === "ArrowRight" ? S = ue(a.settings, p, c.frequency_hz * k, c.gain_db, a.sampleRate) : s.key === "ArrowLeft" ? S = ue(a.settings, p, c.frequency_hz / k, c.gain_db, a.sampleRate) : s.key === "+" ? S = Ae(a.settings, p, 1.15) : s.key === "-" ? S = Ae(a.settings, p, 1 / 1.15) : s.key === "0" ? S = Ke(a.settings, p) : (s.key === "Delete" || s.key === "Backspace") && (S = Me(a.settings, p)), S && (s.preventDefault(), _(S));
  }
  E.addEventListener("dblclick", (s) => {
    if (a.readonly || R) return;
    const p = E.getBoundingClientRect(), c = F.width / (p.width || F.width), h = F.height / (p.height || F.height), k = (s.clientX - p.left) * c, S = (s.clientY - p.top) * h, g = an(a.settings, Ue(M(), k), Qe(M(), S), a.sampleRate);
    g ? ($ = g.bands[g.bands.length - 1].id, _(g)) : (a = { ...a, note: `the EQ has at most ${we} bands` }, A());
  }), o.append(new Option("preset…", "")), Le ??= Ot(t).then((s) => s.manual).catch(() => []), Le.then((s) => {
    for (const p of s) o.append(new Option(p.name, p.name));
  }), o.addEventListener("change", async () => {
    const s = (await Le)?.find((p) => p.name === o.value);
    o.value = "", s && _({ ...s.settings, bands: s.settings.bands.slice(0, we) });
  }), r.addEventListener("change", () => {
    const s = Number(r.value);
    d = Ye.find((p) => p === s) ?? 12, A();
  }), l.addEventListener("click", () => {
    const s = v.undo();
    s && _(s, { record: !1 });
  }), y.addEventListener("click", () => {
    const s = v.redo();
    s && _(s, { record: !1 });
  }), b.addEventListener("click", () => {
    $ = null, _(fe());
  }), x.addEventListener("click", () => {
    R = !R, A();
  }), N.addEventListener("click", () => {
    $e(!Se()), A();
  });
  function Ie() {
    for (const s of ["mode", ye]) {
      const p = J(e, s);
      if (!p || p.plenioWatched) continue;
      p.plenioWatched = !0;
      const c = p.callback;
      p.callback = (h) => {
        c?.(h), setTimeout(() => {
          Se() || $e(!1), H();
        });
      };
    }
  }
  return Ie(), $e(!1), H(0), {
    showExecuted(s) {
      const p = s?.plenio_eq, c = p?.[p.length - 1];
      if (!c) return;
      const h = String(J(e, "mode")?.value ?? "flat") === "manual";
      a = {
        sampleRate: c.sample_rate,
        frequencies: c.frequency_hz,
        response: c.response_db,
        settings: c.settings,
        readonly: !h,
        note: h ? "" : `applied: ${c.settings.bands.length} band(s)`,
        beforeDb: c.spectrum_before_db,
        afterDb: c.spectrum_after_db
      }, h ? H(0) : A();
    }
  };
}
const je = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, pn = new Set(he.map((e) => pt[e]));
function fn(e, t) {
  return !(e in je) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => pn.has(n) && ft(i)).map(([n]) => n);
}
function mn(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const o = i[1]?.options;
    return Array.isArray(o) ? o : [];
  }
  return [];
}
function gn(e, t) {
  const n = je[e.name];
  if (!n || !t) return t;
  const i = mn(e, "mode"), o = t.widgets_values, r = t.widgets_values_named;
  let l = t;
  Array.isArray(o) && o.length && !i.includes(o[0]) && (l = { ...l, widgets_values: [n, ...o] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (l = { ...l, widgets_values_named: { mode: n, ...r } });
  const y = fn(e.name, l.widgets_values_named);
  if (y.length) {
    const b = { ...l.widgets_values_named };
    for (const x of y) b[x] = "";
    l = { ...l, widgets_values_named: b };
  }
  return l;
}
const vt = /* @__PURE__ */ new Map(), Pe = /* @__PURE__ */ new Set();
function tt(e, t) {
  vt.set(e, t);
  for (const n of Pe) n(e);
}
function nt(e) {
  return vt.get(e) ?? null;
}
function hn(e) {
  return Pe.add(e), () => Pe.delete(e);
}
const xt = /* @__PURE__ */ new Map();
function bn(e) {
  e?.draft_sha256 && xt.set(e.draft_sha256, e);
}
function yn(e) {
  return e ? xt.get(e) ?? null : null;
}
const We = "plenio.sheet_state/1", ke = ["title", "style", "lyrics", "score", "artwork_prompt"];
function wt() {
  return { schema: We, docs: {} };
}
function it(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return wt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== We || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function vn(e) {
  const t = {};
  for (const i of ke) {
    const o = e.docs[i];
    o && (t[i] = o);
  }
  const n = { schema: We, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Ce(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function xn(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = ke.filter((i) => Ce(e, i) !== "auto").map(
    (i) => i === "lyrics" && Ce(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${Ce(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function ot(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function ni(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const o = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: ot(o?.[0] ?? 0), end: ot(r?.[1] ?? e.duration_s) };
  }) : [];
}
function ze(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((o) => o.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function wn(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function ii(e, t, n) {
  return n.map((i) => ({ kind: i, text: wn(e, t, i), intent: "keep" }));
}
function oi(e, t, n) {
  const i = { ...e.docs };
  for (const r of n) {
    const l = e.docs[r.kind], y = t?.docs[r.kind], b = ze(r.text);
    if (r.intent === "auto")
      delete i[r.kind];
    else if (r.intent === "manual")
      i[r.kind] = { state: "manual", text: b };
    else if (r.intent === "rebase")
      y?.upstream_sha256 ? i[r.kind] = { state: "edited", text: b, base_sha256: y.upstream_sha256 } : i[r.kind] = { state: "manual", text: b };
    else if (l)
      ze(l.text) !== b && (i[r.kind] = { ...l, text: b });
    else {
      const x = ze(y?.upstream ?? "");
      if (b === x) continue;
      i[r.kind] = y?.upstream_sha256 ? { state: "edited", text: b, base_sha256: y.upstream_sha256 } : { state: "manual", text: b };
    }
  }
  const o = { ...wt(), docs: i };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function ri(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function _n(e, t) {
  return ke.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function si(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const _t = "PLENIO_SHEET_STATE";
let De = null;
function En(e) {
  De = e;
}
const kn = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const r = document.createElement("span");
  r.className = "plenio-sheet-summary";
  const l = document.createElement("button");
  l.className = "plenio-sheet-open", l.textContent = "Edit Song Sheet…", o.append(l, r);
  const y = () => {
    const x = nt(String(e.id)), N = x ? ` · ${x.status}` : "";
    r.textContent = xn(it(i)) + N;
  }, b = e.addDOMWidget(t, _t, o, {
    getValue: () => i,
    setValue: (x) => {
      i = typeof x == "string" ? x : "", y();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return l.addEventListener("click", async (x) => {
    x.stopPropagation();
    const N = it(i);
    N === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const L = nt(String(e.id)), E = (e.inputs ?? []).filter((d) => d.link != null).map((d) => d.name), D = N ?? { schema: "plenio.sheet_state/1", docs: {} }, B = L?.owned ?? _n(E, D), T = String(e.widgets?.find((d) => d.name === "review")?.value ?? "continue"), j = T === "as the brief says" ? L?.review ?? "continue" : T, { openSheetDialog: a } = await import("./open-DqGBGHK2.mjs"), { parseGuide: $, serializeGuide: R } = await import("./tracks-DEywwRcM.mjs");
    if (!De) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: D,
      payload: L,
      asrNote: yn(L?.docs.lyrics?.upstream_sha256),
      owned: B.length ? B : [...ke],
      review: j,
      fetcher: De,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: $(e.properties?.plenio_guide),
      onApply: (d, u) => {
        b.value = vn(d), e.properties = { ...e.properties ?? {}, plenio_guide: R(u) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), hn((x) => {
    x === String(e.id) && y();
  }), y(), { widget: b };
}, ge = "plenio.stem_mix/1", pe = "rest", rt = ["reverb", "delay"], Et = -60, Sn = 12;
function $n() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0 };
}
function X(e, t) {
  const n = e?.strips?.[t] ?? {};
  return {
    gain_db: typeof n.gain_db == "number" ? n.gain_db : 0,
    mute: n.mute === !0,
    solo: n.solo === !0,
    compression: typeof n.compression == "number" ? n.compression : 0,
    muted: Array.isArray(n.muted) ? n.muted.map((i) => [i[0], i[1]]) : [],
    reverb: typeof n.reverb == "number" ? n.reverb : 0,
    delay: typeof n.delay == "number" ? n.delay : 0
  };
}
function kt(e) {
  const t = $n();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay;
}
function qn(e) {
  if (typeof e != "string" || !e.trim()) return { schema: ge, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== ge || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function An(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || kt(X(e, i))) continue;
    const o = {}, r = X(e, i);
    r.gain_db && (o.gain_db = r.gain_db), r.mute && (o.mute = !0), r.solo && (o.solo = !0), r.compression && (o.compression = r.compression), r.muted.length && (o.muted = r.muted), r.reverb && (o.reverb = r.reverb), r.delay && (o.delay = r.delay), t[i] = o;
  }
  const n = { schema: ge, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Ee(e, t, n) {
  const i = { ...e.strips };
  return kt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function Mn(e, t, n) {
  const i = n.some((r) => X(e, r).solo), o = X(e, t);
  return i ? o.solo : !o.mute;
}
function st(e) {
  return e <= Et ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Nn(e, t = null) {
  const n = e.filter((o) => Array.isArray(o) && o.length === 2 && Number.isFinite(o[0]) && Number.isFinite(o[1])).map((o) => [Math.max(0, Math.min(o[0], o[1])), Math.max(o[0], o[1])]).filter((o) => o[1] - o[0] > 1e-6).sort((o, r) => o[0] - r[0]), i = [];
  for (const o of n) {
    const r = i[i.length - 1];
    r && o[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], o[1]) : i.push([...o]);
  }
  return t !== null && t > 0 ? i.map(([o, r]) => [Math.min(o, t), Math.min(r, t)]).filter(([o, r]) => r - o > 1e-6) : i;
}
function Ln(e, t, n) {
  return Nn([...e, [t, n]]);
}
function Cn(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function zn(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function On(e, t, n, i) {
  const o = X(e, t);
  return Ee(e, t, { ...o, muted: Ln(o.muted, n, i) });
}
function Bn(e, t, n) {
  const i = X(e, t), o = Cn(i.muted, n);
  return o < 0 ? e : Ee(e, t, { ...i, muted: zn(i.muted, o) });
}
function Rn(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [o, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (i[o] = r.map((l) => Math.abs(Number(l) || 0)));
  return i;
}
function Pn(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (o, r) => i[Math.floor(r * i.length / n)] ?? 0) : new Array(n).fill(0);
}
const at = "plenio_stem_mixer", lt = "mix", K = 200, Dn = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function xe(e, t, n, i, o) {
  const r = q("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(i), r.setAttribute("aria-label", o), r;
}
function Hn(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), o = q("div", "plenio-mix-info"), r = q("div", "plenio-mix-advanced");
  t.append(n, i, r, o);
  let l = { mix: { schema: ge, strips: {} }, names: [pe], peaks: {}, seconds: 0 }, y = !1;
  const b = () => e.widgets?.find((d) => d.name === lt);
  function x(d) {
    const u = b();
    if (!u) return;
    const m = An(d);
    u.value = m, u.callback?.(m), l = { ...l, mix: d }, E();
  }
  function N(d, u) {
    x(Ee(l.mix, d, { ...X(l.mix, d), ...u }));
  }
  function L(d, u, m) {
    const f = X(l.mix, d);
    let v = Ee(l.mix, d, { ...f, [u]: m });
    m > 0 && !(v[u] && Object.keys(v[u]).length) && (v = u === "reverb" ? { ...v, reverb: { preset: "room" } } : { ...v, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), x(v);
  }
  function O(d, u, m) {
    const f = { ...l.mix[d] ?? {} };
    x({ ...l.mix, [d]: { ...f, [u]: m } });
  }
  function E() {
    n.replaceChildren();
    const d = l.names;
    for (const u of l.names) {
      const m = X(l.mix, u), f = q("div", "plenio-mix-strip");
      f.dataset.strip = u;
      const v = q("span", "name", u === pe ? `${u} (missed)` : u);
      v.title = u === pe ? "What the separator missed: keeps a neutral mix exact" : "";
      const w = xe(Et, Sn, 0.5, m.gain_db, `${u} gain`), G = q("span", "gain", `${st(m.gain_db)} dB`);
      w.addEventListener("input", () => {
        G.textContent = `${st(Number(w.value))} dB`, N(u, { gain_db: Number(w.value) });
      });
      const M = q("button", m.mute ? "toggle active" : "toggle", "M");
      M.setAttribute("aria-label", `${u} mute`), M.addEventListener("click", (W) => {
        W.stopPropagation(), N(u, { mute: !m.mute });
      });
      const _ = q("button", m.solo ? "toggle active" : "toggle", "S");
      _.setAttribute("aria-label", `${u} solo`), _.addEventListener("click", (W) => {
        W.stopPropagation(), N(u, { solo: !m.solo });
      });
      const H = xe(0, 1, 0.05, m.compression, `${u} compression`);
      H.title = "Compression amount", H.addEventListener("input", () => N(u, { compression: Number(H.value) }));
      const A = rt.map((W) => {
        const te = xe(0, 1, 0.05, m[W], `${u} ${W} send`);
        return te.title = `${W} send`, te.addEventListener("input", () => L(u, W, Number(te.value))), te;
      }), re = Mn(l.mix, u, d);
      f.classList.toggle("silent", !re);
      const Y = q("canvas", "plenio-mix-wave");
      Y.width = K, Y.height = 26, Y.setAttribute("aria-label", `${u} waveform (drag to mute a time range)`), D(Y, m, Pn(l.peaks, u, K)), Y.addEventListener("pointerdown", (W) => B(W, Y, u)), f.append(
        v,
        w,
        G,
        M,
        _,
        q("span", "label", "comp"),
        H,
        q("span", "label", "verb"),
        A[0],
        q("span", "label", "delay"),
        A[1],
        Y
      ), n.append(f);
    }
    T(), o.textContent = l.seconds ? `last run: ${l.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips appear after Separate Stems ran (the residual keeps a neutral mix exact)", e.setDirtyCanvas?.(!0, !0);
  }
  function D(d, u, m) {
    const f = d.getContext("2d");
    if (!f) return;
    f.clearRect(0, 0, K, d.height);
    const v = d.height / 2;
    f.strokeStyle = "rgba(180, 190, 205, 0.8)", f.beginPath();
    for (let w = 0; w < m.length; w++) {
      const G = Math.max(1, m[w] * (v - 1));
      f.moveTo(w + 0.5, v - G), f.lineTo(w + 0.5, v + G);
    }
    f.stroke(), f.fillStyle = "rgba(224, 104, 94, 0.35)", f.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [w, G] of u.muted) {
      const M = Math.max(0, Math.min(K, w / Math.max(l.seconds, 1e-6) * K)), _ = Math.max(0, Math.min(K, G / Math.max(l.seconds, 1e-6) * K));
      f.fillRect(M, 0, Math.max(1, _ - M), d.height), f.strokeRect(M + 0.5, 0.5, Math.max(1, _ - M) - 1, d.height - 1);
    }
  }
  function B(d, u, m) {
    if (d.preventDefault(), d.stopPropagation(), !l.seconds) return;
    const f = u.getBoundingClientRect(), v = (A) => Math.max(0, Math.min(1, (A - f.left) / (f.width || K))) * l.seconds, w = v(d.clientX);
    if (X(l.mix, m).muted.some(([A, re]) => A <= w && w <= re)) {
      x(Bn(l.mix, m, w));
      return;
    }
    let M = w;
    const _ = (A) => {
      M = v(A.clientX);
    }, H = () => {
      window.removeEventListener("pointermove", _), window.removeEventListener("pointerup", H), x(On(l.mix, m, Math.min(w, M), Math.max(w, M)));
    };
    window.addEventListener("pointermove", _), window.addEventListener("pointerup", H);
  }
  function T() {
    i.replaceChildren();
    const d = { preset: "room", ...l.mix.reverb ?? {} }, u = { time_ms: 375, feedback: 0.35, ...l.mix.delay ?? {} }, m = q("select");
    m.setAttribute("aria-label", "Reverb preset");
    for (const w of Dn) m.append(new Option(w, w));
    m.value = String(d.preset ?? "room"), m.addEventListener("change", () => O("reverb", "preset", m.value));
    const f = q("input");
    f.type = "number", f.value = String(u.time_ms ?? 375), f.setAttribute("aria-label", "Delay time in ms"), f.addEventListener("change", () => O("delay", "time_ms", Number(f.value)));
    const v = xe(0, 0.8, 0.05, Number(u.feedback ?? 0.35), "Delay feedback");
    v.addEventListener("input", () => O("delay", "feedback", Number(v.value))), i.append(
      q("span", "label", "reverb bus"),
      m,
      q("span", "label", "delay bus"),
      f,
      q("span", "label", "ms, feedback"),
      v
    ), i.style.display = rt.some((w) => l.mix[w]) ? "" : "none";
  }
  const j = e.addDOMWidget(at, at, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 200,
    getMaxHeight: () => 520
  });
  j.serialize = !1;
  const a = e.widgets?.find((d) => d.name === lt), $ = q("button", "toggle", "JSON");
  $.title = "Show or hide the raw mixer value", $.addEventListener("click", (d) => {
    d.stopPropagation(), y = !y, $.classList.toggle("active", y), a && (a.plenioHidden = !y, y ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(q("span", "label", "Advanced"), $), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function R() {
    const d = qn(b()?.value);
    l = { ...l, mix: d ?? { schema: ge, strips: {} } }, d || (o.textContent = "the mixer value is not readable; it will be replaced on the next edit"), E();
  }
  return R(), {
    showExecuted(d) {
      const u = d?.plenio_stems?.at(-1), m = Rn(d), f = u?.stems?.length ? [...u.stems.filter((v) => v !== pe), pe] : l.names;
      l = { ...l, names: f, peaks: m, seconds: Number(u?.seconds ?? l.seconds) || 0 }, R();
    }
  };
}
const Tn = `
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
  color: var(--descrip-text, #999); }
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
function jn() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Tn, document.head.append(e);
}
function He(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Oe(e) {
  return He(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Wn(e) {
  const t = [];
  let n = !1, i = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const r of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      r.startsWith("```") ? (t.push(`<pre><code>${He(i.join(`
`))}</code></pre>`), i = null) : i.push(r);
      continue;
    }
    if (r.startsWith("```")) {
      o(), i = [];
      continue;
    }
    const l = /^(#{1,4})\s+(.*)$/.exec(r);
    if (l) {
      o();
      const b = Math.min(l[1].length + 2, 6);
      t.push(`<h${b}>${Oe(l[2])}</h${b}>`);
      continue;
    }
    const y = /^\s*[-*]\s+(.*)$/.exec(r);
    if (y) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Oe(y[1])}</li>`);
      continue;
    }
    o(), r.trim() && t.push(`<p>${Oe(r)}</p>`);
  }
  return o(), i !== null && t.push(`<pre><code>${He(i.join(`
`))}</code></pre>`), t.join("");
}
const Be = "plenio_summary", ct = "plenio_summary";
function In(e) {
  const t = e.widgets?.find((o) => o.name === ct);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(ct, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function dt(e, t) {
  if (!t.markdown) return;
  const n = In(e);
  n.dataset.status = t.status ?? "", n.innerHTML = Wn(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function Fn(e) {
  e.prototype.onExecuted = Q(e.prototype.onExecuted, function(t) {
    const n = t?.[Be], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Be] = { markdown: i.markdown, status: i.status ?? "" }, dt(this, i));
  }), e.prototype.onConfigure = Q(e.prototype.onConfigure, function() {
    const t = this.properties?.[Be];
    t?.markdown && dt(this, t);
  });
}
const Gn = "Plenio.Core", _e = Nt;
En(_e);
Lt.registerExtension({
  name: Gn,
  getCustomWidgets: () => ({ [_t]: kn }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Fn(e);
    const n = Zt(t.input);
    if (n.size || t.name in je) {
      const i = e.prototype.configure;
      e.prototype.configure = function(o) {
        const r = gn(t, o), l = Yt(r), y = i?.call(this, r);
        return Kt(this, l, n), y;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = Q(e.prototype.onExecuted, function(i) {
      for (const o of i?.plenio_asr ?? []) bn(o);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), i.set(this, un(this, _e));
      }, e.prototype.onExecuted = Q(e.prototype.onExecuted, function(r) {
        i.get(this)?.showExecuted(r);
      });
    }
    if (Gt.has(t.name) && Vt(e, _e), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), i.set(this, Hn(this));
      }, e.prototype.onExecuted = Q(e.prototype.onExecuted, function(r) {
        i.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = Q(e.prototype.onExecuted, function(i) {
      const o = i?.plenio_sheet, r = o?.[o.length - 1];
      r && tt(String(this.id), r);
    }));
  },
  setup() {
    jn(), _e.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && tt(String(t.node_id), t);
    });
  }
});
export {
  Gn as E,
  ut as P,
  ei as a,
  Qn as b,
  ni as c,
  vn as d,
  Kn as e,
  ze as f,
  Un as g,
  Zn as i,
  oi as n,
  Yn as r,
  ii as s,
  Jn as t,
  si as u,
  ti as v,
  ri as w
};
