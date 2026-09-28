import { api as Ht } from "../../../../scripts/api.js";
import { app as jt } from "../../../../scripts/app.js";
function K(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class yt extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function re(e, t, n) {
  const i = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await i.json();
  if (!i.ok) {
    const s = r?.error ?? {};
    throw new yt(s.message ?? `Request failed (${i.status})`, s.hint ?? null);
  }
  return r;
}
function ri(e, t) {
  return re(e, "/plenio/sheet/resolve", t);
}
async function si(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function oi(e, t) {
  return re(e, "/plenio/score/analyze", { abc: t });
}
function ai(e, t, n) {
  return re(e, "/plenio/score/transform", { abc: t, operation: n });
}
function li(e, t) {
  return re(e, "/plenio/score/midi/export", t);
}
function ci(e, t) {
  return re(e, "/plenio/score/midi/import", t);
}
function ui(e, t) {
  return re(e, "/plenio/lyrics/analyze", t);
}
function di(e, t) {
  const i = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(i) : `/api${i}`;
}
function Ye(e, t, n, i = 200) {
  return re(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: i });
}
function Wt(e, t) {
  return re(e, "/plenio/brief/fields", t);
}
async function Ft(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new yt(`Request failed (${t.status})`);
  return await t.json();
}
const be = [
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
], It = ["length", "vocals", "melody"], vt = {
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
}, Gt = "custom";
function xt(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Gt;
}
function ae(e, t) {
  const n = vt[t];
  if (n)
    return (e.widgets ?? []).find((i) => i.name === n);
}
function Vt(e) {
  const t = {};
  for (const n of [...be, ...It]) {
    const i = ae(e, n);
    i && (t[n] = typeof i.value == "string" ? i.value : String(i.value ?? ""));
  }
  return t;
}
function Ue(e, t) {
  const n = [];
  for (const i of t.fills) {
    if (!be.includes(i.field)) continue;
    const r = ae(e, i.field);
    r && !String(r.value ?? "").trim() && i.value && n.push({ field: i.field, value: i.value });
  }
  return n;
}
function Qe(e) {
  const t = [];
  for (const n of be) {
    const i = ae(e, n);
    i && String(i.value ?? "").trim() && t.push(i);
  }
  return t;
}
function Pe(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Xt(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((i) => `${i.field} (${Qt(i.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Yt(e) {
  const t = e ? Pe(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Ut(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Qt(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Je(e, t) {
  for (const n of t) {
    const i = ae(e, n.field);
    i && (i.value = n.value, i.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Jt(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function wt(e) {
  const t = [];
  for (const n of be) {
    const i = ae(e, n);
    !i || !xt(i.value) || (i.value = "", i.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Ke = "plenio_brief_template", Kt = 400;
function Zt(e, t) {
  let n = null, i = !1, r = null, s;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const v = document.createElement("div");
  v.className = "line";
  const y = document.createElement("div");
  y.className = "hint";
  const x = document.createElement("div");
  x.className = "actions", c.append(v, y, x);
  const $ = (d, u, f) => {
    const m = document.createElement("button");
    return m.textContent = d, m.title = u, m.addEventListener("click", (S) => {
      S.stopPropagation(), f();
    }), x.append(m), m;
  }, N = $("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Je(e, Ue(e, n).map((d) => ({ field: d.field, value: d.value }))), P());
  }), B = $("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Je(e, Pe(n)), P());
  }), E = $("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const d = Qe(e);
    d.length && window.confirm(`Clear ${d.length} text field(s)? The template's values apply again.`) && (Jt(e, d), P());
  }), H = $("↻", "Ask again what the template fills", () => {
    G();
  }), P = () => {
    const d = Xt(n, i);
    v.textContent = r ?? d ?? "The template fills nothing: every text field has your value.", v.dataset.state = r ? "error" : i && n ? "ok" : "empty";
    const u = Yt(n), f = Ut(n);
    y.textContent = [u, f].filter(Boolean).join(" · "), y.style.display = y.textContent ? "" : "none", x.style.display = i && n && n.template !== "none" ? "" : "none", N.disabled = !n || !Ue(e, n).length, B.disabled = !n || !Pe(n).length, E.disabled = !Qe(e).length, H.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, I = async () => {
    const d = String(e.widgets?.find((u) => u.name === "template")?.value ?? "none");
    try {
      n = await Wt(t, { fields: Vt(e), template: d }), r = null;
    } catch (u) {
      n = null, r = `The template fields could not be read: ${u instanceof Error ? u.message : String(u)}`;
    }
    i = !0, P();
  };
  function G() {
    clearTimeout(s), s = setTimeout(() => {
      I();
    }, Kt);
  }
  const a = e.widgets?.find((d) => d.name === "template");
  a && (a.callback = K(a.callback, () => G()));
  for (const d of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const u = ae(e, d);
    u && (u.callback = K(u.callback, () => G()));
  }
  const w = ae(e, "vocals");
  w && (w.callback = K(w.callback, () => G()));
  const D = e.addDOMWidget(Ke, Ke, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return D.serialize = !1, wt(e), P(), G(), {
    widget: D,
    refresh: G,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const en = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function tn(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = e.prototype, r = i.onNodeCreated;
  i.onNodeCreated = function() {
    r?.call(this), n.set(this, Zt(this, t));
  };
  const s = i.onConfigure;
  i.onConfigure = function(c) {
    s?.call(this, c), wt(this), n.get(this)?.refresh();
  };
}
const nn = "COMFY_DYNAMICCOMBO_V3";
function rn(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function sn(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function on(e, t) {
  const n = sn(e);
  return Array.isArray(t) ? n.length === t.length && n.every((i, r) => i.value === t[r]) : n.every((i) => !(i.name in t) || i.value === t[i.name]);
}
function an(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ln(e, t, n) {
  if (!t || !e.widgets || on(e, t)) return !1;
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
    if (n.has(s.name) && !an(s, c)) return !0;
    s.value !== c && (s.value = c);
  }
  return !0;
}
function cn(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [i, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === nn && t.add(i);
  return t;
}
const _t = "plenio.eq/1", Ee = 8, ie = 20, un = 2e4, pe = 12, Et = 15, ue = ["peak", "low_shelf", "high_shelf"];
function he() {
  return { schema: _t, preamp_db: 0, bands: [] };
}
function dn(e) {
  if (typeof e != "string" || !e.trim()) return he();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: _t,
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
function T(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function kt(e) {
  return e.db ?? Et;
}
const Ze = [6, 12, 18], pn = { 6: 8, 12: 14, 18: 20 };
function fn(e, t) {
  return { ...e, db: pn[t] ?? Et };
}
function oe(e, t) {
  return Math.log(T(t, ie, e.maxHz) / ie) / Math.log(e.maxHz / ie) * e.width;
}
function et(e, t) {
  return ie * (e.maxHz / ie) ** T(t / e.width, 0, 1);
}
function ne(e, t) {
  const n = kt(e);
  return (1 - (T(t, -n, n) + n) / (2 * n)) * e.height;
}
function tt(e, t) {
  const n = kt(e);
  return (1 - T(t / e.height, 0, 1)) * 2 * n - n;
}
function nt(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function it(e, t, n) {
  return t.map((i, r) => `${r ? "L" : "M"}${oe(e, i).toFixed(1)},${ne(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function je(e) {
  return Math.min(un, 0.45 * e);
}
function mn(e) {
  const t = new Set(e.bands.map((i) => i.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function hn(e, t, n = 0, i = 48e3) {
  if (e.bands.length >= Ee) return null;
  const r = {
    id: mn(e),
    enabled: !0,
    type: "peak",
    frequency_hz: U(T(t, ie, je(i)), 1),
    gain_db: U(T(n, -pe, pe), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function me(e, t, n, i, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: U(T(n, ie, je(r)), 1),
        gain_db: ue.includes(s.type) ? U(T(i, -pe, pe), 1) : s.gain_db
      }
    )
  };
}
function Ne(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((i) => i.id === t ? { ...i, q: U(T(i.q * n, 0.2, 10), 3) } : i)
  };
}
function Le(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function ve(e) {
  const t = e.frequency_hz >= 1e3 ? `${U(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ue.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
function gn(e, t) {
  const n = St[e.type] ?? e.type, i = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, r = ue.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", s = e.type === "peak" || e.type === "notch" ? ` Q ${e.q}` : "";
  return `● ${t + 1} ${n} ${i}${r}${s}${e.enabled ? "" : " (off)"}`;
}
const St = {
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
    bands: e.bands.map((r) => {
      if (r.id !== t) return r;
      const s = { ...r, ...n };
      return {
        ...s,
        frequency_hz: U(T(Number(s.frequency_hz ?? r.frequency_hz), ie, je(i)), 1),
        gain_db: U(T(Number(s.gain_db ?? r.gain_db), -pe, pe), 1),
        q: U(T(Number(s.q ?? r.q), 0.2, 10), 3),
        slope: U(T(Number(s.slope ?? r.slope), 0.1, 4), 2),
        enabled: s.enabled !== !1
      };
    })
  };
}
function rt(e, t) {
  return le(e, t, { gain_db: 0 });
}
function st(e, t, n, { heightFraction: i = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const r = n.filter((N) => Number.isFinite(N));
  if (!r.length) return "";
  const s = Math.max(...r), c = Math.min(...r), v = Math.max(s - c, 1e-6), y = e.height - 4, x = y - Math.max(12, e.height * T(i, 0.1, 0.95));
  return `M${t.map((N, B) => {
    const E = n[B], H = Number.isFinite(E) ? (E - c) / v : 0;
    return `${oe(e, N).toFixed(1)},${(y - H * (y - x)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${y.toFixed(1)} L0,${y.toFixed(1)} Z`;
}
class bn {
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
const yn = "http://www.w3.org/2000/svg", ot = "plenio_eq_panel", xe = "mode.bands", X = { width: 560, height: 260 }, we = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Ce = null;
function J(e, t) {
  const n = document.createElementNS(yn, e);
  for (const [i, r] of Object.entries(t)) n.setAttribute(i, String(r));
  return n;
}
function R(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function se(e, t, n) {
  const i = document.createElement("button");
  return i.className = e, i.textContent = t, i.setAttribute("aria-label", n), i;
}
function ee(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function vn(e, t) {
  const n = R("div", "plenio-eq"), i = R("div", "plenio-eq-tools"), r = R("select");
  r.setAttribute("aria-label", "EQ preset");
  const s = R("select");
  s.setAttribute("aria-label", "Gain range");
  for (const o of Ze) s.append(new Option(`±${o} dB`, String(o)));
  const c = se("", "↶", "Undo the last band change"), v = se("", "↷", "Redo the last band change"), y = se("", "reset", "Remove every band"), x = se("", "compare", "Show the curve without the EQ (bypass)"), $ = se("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), N = R("span", "plenio-eq-info");
  N.setAttribute("aria-live", "polite"), i.append(r, s, c, v, y, x, $, N);
  const B = R("div", "plenio-eq-mode"), E = J("svg", {
    viewBox: `0 0 ${X.width} ${X.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  E.setAttribute("aria-label", "EQ response curve"), E.setAttribute("tabindex", "0");
  const H = R("div", "plenio-eq-strip"), P = R("div", "plenio-eq-editor"), I = R("div", "plenio-eq-fields");
  P.append(I), n.append(i, B, E, H, P);
  const G = e.addDOMWidget(ot, ot, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  G.serialize = !1;
  let a = { sampleRate: 48e3, frequencies: [], response: [], settings: he(), readonly: !0, note: "" }, w = null, D = !1, d = 12, u = 0, f, m, S = null, g = !1;
  const j = /* @__PURE__ */ new Map();
  let L = null;
  const C = new bn(he()), W = () => ee(e, xe), Y = () => d, O = () => fn({ ...X, maxHz: Math.min(2e4, a.sampleRate / 2) }, Y());
  function z(o, { record: p = !0 } = {}) {
    const l = W();
    if (!l) return;
    const h = ce(o);
    l.value = h, l.callback?.(h), p && C.push(o), a = { ...a, settings: o }, k(), F(0);
  }
  async function F(o = 120) {
    clearTimeout(f), f = setTimeout(async () => {
      const p = String(ee(e, "mode")?.value ?? "flat");
      if (p !== "manual") {
        p === "flat" ? a = {
          ...a,
          settings: he(),
          response: a.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : a = { ...a, readonly: !0 }, k();
        return;
      }
      const l = dn(W()?.value);
      if (!l) {
        a = { ...a, readonly: !0, note: "the bands are not valid JSON" }, k();
        return;
      }
      ce(l) !== ce(C.current) && C.reset(l);
      const h = ++u;
      try {
        const _ = await Ye(t, l, a.sampleRate);
        if (h !== u) return;
        a = {
          ...a,
          frequencies: _.frequency_hz,
          response: _.response_db,
          settings: _.settings,
          readonly: !1,
          note: ""
        };
      } catch (_) {
        a = { ...a, readonly: !1, note: _ instanceof Error ? _.message : String(_) };
      }
      k();
    }, o);
  }
  function k() {
    E.replaceChildren(), j.clear(), L = null;
    const o = O();
    for (const l of [-o.db, -o.db / 2, 0, o.db / 2, o.db])
      E.append(
        J("line", { x1: 0, x2: o.width, y1: ne(o, l), y2: ne(o, l), class: l ? "grid" : "grid zero" })
      );
    for (const l of [100, 1e3, 1e4])
      E.append(J("line", { x1: oe(o, l), x2: oe(o, l), y1: 0, y2: o.height, class: "grid" }));
    a.beforeDb?.length === a.frequencies.length && E.append(J("path", { d: st(o, a.frequencies, a.beforeDb), class: "spectrum before" })), a.afterDb?.length === a.frequencies.length && E.append(J("path", { d: st(o, a.frequencies, a.afterDb), class: "spectrum after" })), D ? E.append(J("line", { x1: 0, x2: o.width, y1: ne(o, 0), y2: ne(o, 0), class: "curve flat" })) : a.frequencies.length && (L = J("path", { d: it(o, a.frequencies, a.response), class: "curve" }), E.append(L)), !a.readonly && !D && a.settings.bands.forEach((l, h) => {
      const _ = we[h % we.length], A = ue.includes(l.type) ? l.gain_db : 0, b = J("circle", {
        cx: oe(o, l.frequency_hz),
        cy: ne(o, A),
        r: l.id === w ? 9 : 7,
        class: l.id === w ? "handle selected" : "handle",
        style: `stroke: ${_}`,
        tabindex: 0,
        "data-band": l.id
      });
      b.setAttribute("aria-label", `Band ${h + 1}: ${ve(l)}`), l.enabled || b.classList.add("disabled"), b.append(J("title", {})), b.lastChild.textContent = `Band ${h + 1}: ${ve(l)}`, b.addEventListener("pointerdown", (M) => Rt(M, l.id)), b.addEventListener("dblclick", (M) => {
        M.stopPropagation(), z(rt(a.settings, l.id));
      }), b.addEventListener("focus", () => Ie(l.id)), b.addEventListener("keydown", (M) => Ve(M, l.id)), b.addEventListener("wheel", (M) => {
        M.preventDefault();
        const fe = M.deltaY < 0 ? 1.15 : 1 / 1.15;
        z(Ne(a.settings, l.id, fe));
      }), b.addEventListener("contextmenu", (M) => {
        M.preventDefault(), z(Le(a.settings, l.id));
      }), E.append(b), j.set(l.id, b);
    }), Z(), Ct(), zt();
    const p = a.settings.bands.find((l) => l.id === w);
    N.textContent = a.note || (D ? "compare: the curve is off (the node still applies it)" : p ? ve(p) : a.readonly ? `${a.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${a.settings.bands.length}/${Ee}`), r.disabled = a.readonly, c.disabled = !C.canUndo, v.disabled = !C.canRedo, y.disabled = a.readonly || !a.settings.bands.length, g && (g = !1, w && j.get(w)?.focus({ preventScroll: !0 })), s.value = String(d), x.classList.toggle("active", D), $.classList.toggle("active", qe()), e.setDirtyCanvas?.(!0, !0);
  }
  function Z() {
    if (H.replaceChildren(), a.readonly && !a.settings.bands.length) {
      H.append(R("span", "plenio-eq-hint", a.note || "no bands"));
      return;
    }
    a.settings.bands.forEach((o, p) => {
      const l = R("button", "plenio-eq-chip", gn(o, p));
      l.style.borderLeftColor = we[p % we.length], l.classList.toggle("selected", o.id === w), l.classList.toggle("disabled", !o.enabled), l.setAttribute("aria-label", `Edit band ${p + 1}`), l.addEventListener("click", (h) => {
        h.stopPropagation(), w = w === o.id ? null : o.id, k();
      }), H.append(l);
    });
  }
  function Ct() {
    I.replaceChildren();
    const o = a.settings.bands.find((b) => b.id === w);
    if (!o || a.readonly) {
      P.style.display = "none";
      return;
    }
    P.style.display = "";
    const p = R("span", "name", `Band ${a.settings.bands.indexOf(o) + 1}`), l = R("select");
    l.setAttribute("aria-label", "Band type");
    for (const [b, M] of Object.entries(St)) l.append(new Option(M, b));
    l.value = o.type, l.addEventListener("change", () => z(le(a.settings, o.id, { type: l.value })));
    const h = R("input");
    h.type = "checkbox", h.checked = o.enabled, h.setAttribute("aria-label", "Band enabled"), h.addEventListener("change", () => z(le(a.settings, o.id, { enabled: h.checked })));
    const _ = [
      [
        "Hz",
        `${o.frequency_hz}`,
        70,
        (b) => z(le(a.settings, o.id, { frequency_hz: Number(b) }))
      ],
      ["dB", `${o.gain_db}`, 60, (b) => z(le(a.settings, o.id, { gain_db: Number(b) }))],
      ["Q", `${o.q}`, 60, (b) => z(le(a.settings, o.id, { q: Number(b) }))]
    ];
    I.append(p, l, h);
    for (const [b, M, fe, ye] of _) {
      const V = R("input", "number");
      V.value = M, V.style.width = `${fe}px`, V.setAttribute("aria-label", `Band ${b}`), V.addEventListener("keydown", (Me) => {
        Me.key === "Enter" && ye(V.value);
      }), V.addEventListener("blur", () => ye(V.value)), b !== "Hz" && !ue.includes(o.type) && (V.disabled = !0), I.append(V);
    }
    const A = se("", "remove", "Remove this band");
    A.addEventListener("click", (b) => {
      b.stopPropagation(), w = null, z(Le(a.settings, o.id));
    }), I.append(A);
  }
  function zt() {
    B.replaceChildren();
    const o = String(ee(e, "mode")?.value ?? "flat");
    if (o === "manual" || o === "flat") {
      B.style.display = "none";
      return;
    }
    B.style.display = "", B.append(
      R("span", "plenio-eq-hint", `applied proposal (${a.settings.bands.length} band(s), ${o})`)
    );
    const p = se("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    p.disabled = !a.settings.bands.length, p.addEventListener("click", (l) => {
      l.stopPropagation();
      const h = ee(e, "mode");
      if (!h) return;
      h.value = "manual", h.callback?.("manual");
      const _ = W();
      if (_) {
        const A = ce(a.settings);
        _.value = A, _.callback?.(A);
      }
      C.reset(a.settings), Xe(), F(0);
    }), B.append(p);
  }
  function Ie(o) {
    w = o, g = !0, k();
  }
  function Ge() {
    const o = O();
    a.settings.bands.forEach((l) => {
      const h = j.get(l.id);
      if (!h) return;
      const _ = ue.includes(l.type) ? l.gain_db : 0;
      h.setAttribute("cx", String(oe(o, l.frequency_hz))), h.setAttribute("cy", String(ne(o, _))), h.classList.toggle("selected", l.id === w), h.setAttribute("r", l.id === w ? "9" : "7");
    }), L && a.frequencies.length && L.setAttribute("d", it(o, a.frequencies, a.response));
    const p = a.settings.bands.find((l) => l.id === w);
    p && (N.textContent = ve(p));
  }
  function Ot() {
    clearTimeout(m), m = setTimeout(async () => {
      const o = a.settings, p = ++u;
      try {
        const l = await Ye(t, o, a.sampleRate);
        if (p !== u) return;
        a = { ...a, frequencies: l.frequency_hz, response: l.response_db }, Ge();
      } catch {
      }
    }, 60);
  }
  function qe() {
    return !ee(e, xe)?.plenioHidden;
  }
  function $e(o) {
    const p = ee(e, xe);
    p && (p.plenioHidden = !o, o ? delete p.computeSize : p.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Rt(o, p) {
    o.preventDefault(), o.stopPropagation(), Ie(p);
    const l = a.settings.bands.find((M) => M.id === p);
    if (!l) return;
    S = { hz: l.frequency_hz, db: l.gain_db };
    const h = o.currentTarget;
    h?.setPointerCapture?.(o.pointerId);
    const _ = E.getBoundingClientRect(), A = (M) => {
      const fe = X.width / (_.width || X.width), ye = X.height / (_.height || X.height), V = (M.clientX - _.left) * fe, Me = (M.clientY - _.top) * ye, Bt = oe(O(), S.hz), Pt = ne(O(), S.db), Dt = et(O(), nt(Bt, V, M.shiftKey)), Tt = tt(O(), nt(Pt, Me, M.shiftKey));
      a = { ...a, settings: me(a.settings, p, Dt, Tt, a.sampleRate) }, Ge(), Ot();
    }, b = () => {
      h?.releasePointerCapture?.(o.pointerId), window.removeEventListener("pointermove", A), window.removeEventListener("pointerup", b), S = null, z(a.settings);
    };
    window.addEventListener("pointermove", A), window.addEventListener("pointerup", b);
  }
  function Ve(o, p) {
    const l = a.settings.bands.find((b) => b.id === p);
    if (!l) return;
    const h = o.shiftKey ? 0.1 : 0.5, _ = o.shiftKey ? 1.01 : 1.06;
    let A = null;
    o.key === "ArrowUp" ? A = me(a.settings, p, l.frequency_hz, l.gain_db + h, a.sampleRate) : o.key === "ArrowDown" ? A = me(a.settings, p, l.frequency_hz, l.gain_db - h, a.sampleRate) : o.key === "ArrowRight" ? A = me(a.settings, p, l.frequency_hz * _, l.gain_db, a.sampleRate) : o.key === "ArrowLeft" ? A = me(a.settings, p, l.frequency_hz / _, l.gain_db, a.sampleRate) : o.key === "+" ? A = Ne(a.settings, p, 1.15) : o.key === "-" ? A = Ne(a.settings, p, 1 / 1.15) : o.key === "0" ? A = rt(a.settings, p) : (o.key === "Delete" || o.key === "Backspace") && (A = Le(a.settings, p)), A && (o.preventDefault(), z(A));
  }
  E.addEventListener("keydown", (o) => {
    w && o.target === E && Ve(o, w);
  }), E.addEventListener("dblclick", (o) => {
    if (a.readonly || D) return;
    const p = E.getBoundingClientRect(), l = X.width / (p.width || X.width), h = X.height / (p.height || X.height), _ = (o.clientX - p.left) * l, A = (o.clientY - p.top) * h, b = hn(a.settings, et(O(), _), tt(O(), A), a.sampleRate);
    b ? (w = b.bands[b.bands.length - 1].id, z(b)) : (a = { ...a, note: `the EQ has at most ${Ee} bands` }, k());
  }), r.append(new Option("preset…", "")), Ce ??= Ft(t).then((o) => o.manual).catch(() => []), Ce.then((o) => {
    for (const p of o) r.append(new Option(p.name, p.name));
  }), r.addEventListener("change", async () => {
    const o = (await Ce)?.find((p) => p.name === r.value);
    r.value = "", o && z({ ...o.settings, bands: o.settings.bands.slice(0, Ee) });
  }), s.addEventListener("change", () => {
    const o = Number(s.value);
    d = Ze.find((p) => p === o) ?? 12, k();
  }), c.addEventListener("click", () => {
    const o = C.undo();
    o && z(o, { record: !1 });
  }), v.addEventListener("click", () => {
    const o = C.redo();
    o && z(o, { record: !1 });
  }), y.addEventListener("click", () => {
    w = null, z(he());
  }), x.addEventListener("click", () => {
    D = !D, k();
  }), $.addEventListener("click", () => {
    $e(!qe()), k();
  });
  function Xe() {
    for (const o of ["mode", xe]) {
      const p = ee(e, o);
      if (!p || p.plenioWatched) continue;
      p.plenioWatched = !0;
      const l = p.callback;
      p.callback = (h) => {
        l?.(h), setTimeout(() => {
          qe() || $e(!1), F();
        });
      };
    }
  }
  return Xe(), $e(!1), F(0), {
    showExecuted(o) {
      const p = o?.plenio_eq, l = p?.[p.length - 1];
      if (!l) return;
      const h = String(ee(e, "mode")?.value ?? "flat") === "manual";
      a = {
        sampleRate: l.sample_rate,
        frequencies: l.frequency_hz,
        response: l.response_db,
        settings: l.settings,
        readonly: !h,
        note: h ? "" : `applied: ${l.settings.bands.length} band(s)`,
        beforeDb: l.spectrum_before_db,
        afterDb: l.spectrum_after_db
      }, h ? F(0) : k();
    }
  };
}
const We = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, xn = new Set(be.map((e) => vt[e]));
function wn(e, t) {
  return !(e in We) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, i]) => xn.has(n) && xt(i)).map(([n]) => n);
}
function _n(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const i = n?.[t];
    if (!Array.isArray(i)) continue;
    if (Array.isArray(i[0])) return i[0];
    const r = i[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function En(e, t) {
  const n = We[e.name];
  if (!n || !t) return t;
  const i = _n(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let c = t;
  Array.isArray(r) && r.length && !i.includes(r[0]) && (c = { ...c, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (c = { ...c, widgets_values_named: { mode: n, ...s } });
  const v = wn(e.name, c.widgets_values_named);
  if (v.length) {
    const y = { ...c.widgets_values_named };
    for (const x of v) y[x] = "";
    c = { ...c, widgets_values_named: y };
  }
  return c;
}
const At = /* @__PURE__ */ new Map(), De = /* @__PURE__ */ new Set();
function at(e, t) {
  At.set(e, t);
  for (const n of De) n(e);
}
function lt(e) {
  return At.get(e) ?? null;
}
function kn(e) {
  return De.add(e), () => De.delete(e);
}
const qt = /* @__PURE__ */ new Map();
function Sn(e) {
  e?.draft_sha256 && qt.set(e.draft_sha256, e);
}
function An(e) {
  return e ? qt.get(e) ?? null : null;
}
const Fe = "plenio.sheet_state/1", Ae = ["title", "style", "lyrics", "score", "artwork_prompt"];
function $t() {
  return { schema: Fe, docs: {} };
}
function ct(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return $t();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Fe || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function qn(e) {
  const t = {};
  for (const i of Ae) {
    const r = e.docs[i];
    r && (t[i] = r);
  }
  const n = { schema: Fe, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ze(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function $n(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ae.filter((i) => ze(e, i) !== "auto").map(
    (i) => i === "lyrics" && ze(e, i) === "manual" ? "lyrics: yours (manual)" : `${i.replace("_", " ")} ${ze(e, i)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function ut(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function pi(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, i]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + i - 1)];
    return { label: t, bars: i, start: ut(r?.[0] ?? 0), end: ut(s?.[1] ?? e.duration_s) };
  }) : [];
}
function Oe(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, i = t.length;
  for (; n < i && !t[n]; ) n++;
  for (; i > n && !t[i - 1]; ) i--;
  return t.slice(n, i).join(`
`);
}
function Mn(e, t, n) {
  const i = e.docs[n];
  return i ? i.text : t?.docs[n]?.upstream ?? "";
}
function fi(e, t, n) {
  return n.map((i) => ({ kind: i, text: Mn(e, t, i), intent: "keep" }));
}
function mi(e, t, n) {
  const i = { ...e.docs };
  for (const s of n) {
    const c = e.docs[s.kind], v = t?.docs[s.kind], y = Oe(s.text);
    if (s.intent === "auto")
      delete i[s.kind];
    else if (s.intent === "manual")
      i[s.kind] = { state: "manual", text: y };
    else if (s.intent === "rebase")
      v?.upstream_sha256 ? i[s.kind] = { state: "edited", text: y, base_sha256: v.upstream_sha256 } : i[s.kind] = { state: "manual", text: y };
    else if (c)
      Oe(c.text) !== y && (i[s.kind] = { ...c, text: y });
    else {
      const x = Oe(v?.upstream ?? "");
      if (y === x) continue;
      i[s.kind] = v?.upstream_sha256 ? { state: "edited", text: y, base_sha256: v.upstream_sha256 } : { state: "manual", text: y };
    }
  }
  const r = { ...$t(), docs: i };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function hi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Nn(e, t) {
  return Ae.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function gi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Mt = "PLENIO_SHEET_STATE";
let Te = null;
function Ln(e) {
  Te = e;
}
const Cn = (e, t, n) => {
  let i = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const c = document.createElement("button");
  c.className = "plenio-sheet-open", c.textContent = "Edit Song Sheet…", r.append(c, s);
  const v = () => {
    const x = lt(String(e.id)), $ = x ? ` · ${x.status}` : "";
    s.textContent = $n(ct(i)) + $;
  }, y = e.addDOMWidget(t, Mt, r, {
    getValue: () => i,
    setValue: (x) => {
      i = typeof x == "string" ? x : "", v();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return c.addEventListener("click", async (x) => {
    x.stopPropagation();
    const $ = ct(i);
    $ === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const N = lt(String(e.id)), E = (e.inputs ?? []).filter((d) => d.link != null).map((d) => d.name), H = $ ?? { schema: "plenio.sheet_state/1", docs: {} }, P = N?.owned ?? Nn(E, H), I = String(e.widgets?.find((d) => d.name === "review")?.value ?? "continue"), G = I === "as the brief says" ? N?.review ?? "continue" : I, { openSheetDialog: a } = await import("./open-BGhcYZys.mjs"), { parseGuide: w, serializeGuide: D } = await import("./tracks-DEywwRcM.mjs");
    if (!Te) throw new Error("Plenio: API not initialised");
    a({
      title: e.title || "Song Sheet",
      state: H,
      payload: N,
      asrNote: An(N?.docs.lyrics?.upstream_sha256),
      owned: P.length ? P : [...Ae],
      review: G,
      fetcher: Te,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: w(e.properties?.plenio_guide),
      onApply: (d, u) => {
        y.value = qn(d), e.properties = { ...e.properties ?? {}, plenio_guide: D(u) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), kn((x) => {
    x === String(e.id) && v();
  }), v(), { widget: y };
}, ge = "plenio.stem_mix/1", de = "rest", dt = ["reverb", "delay"], Nt = -60, zn = 12;
function On() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function Q(e, t) {
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
function Lt(e) {
  const t = On();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Rn = ["vocals", "drums", "bass", "other"];
function Bn() {
  return [...Rn, de];
}
function Pn(e) {
  if (typeof e != "string" || !e.trim()) return { schema: ge, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== ge || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Dn(e) {
  const t = {};
  for (const i of Object.keys(e.strips)) {
    if (!i || Lt(Q(e, i))) continue;
    const r = {}, s = Q(e, i);
    s.gain_db && (r.gain_db = s.gain_db), s.mute && (r.mute = !0), s.solo && (r.solo = !0), s.compression && (r.compression = s.compression), s.muted.length && (r.muted = s.muted), s.reverb && (r.reverb = s.reverb), s.delay && (r.delay = s.delay), s.save && (r.save = !0), t[i] = r;
  }
  const n = { schema: ge, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Se(e, t, n) {
  const i = { ...e.strips };
  return Lt(n) ? delete i[t] : i[t] = n, { ...e, strips: i };
}
function Tn(e, t, n) {
  const i = n.some((s) => Q(e, s).solo), r = Q(e, t);
  return i ? r.solo : !r.mute;
}
function pt(e) {
  return e <= Nt ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Hn(e, t = null) {
  const n = e.filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1])).map((r) => [Math.max(0, Math.min(r[0], r[1])), Math.max(r[0], r[1])]).filter((r) => r[1] - r[0] > 1e-6).sort((r, s) => r[0] - s[0]), i = [];
  for (const r of n) {
    const s = i[i.length - 1];
    s && r[0] <= s[1] + 1e-6 ? s[1] = Math.max(s[1], r[1]) : i.push([...r]);
  }
  return t !== null && t > 0 ? i.map(([r, s]) => [Math.min(r, t), Math.min(s, t)]).filter(([r, s]) => s - r > 1e-6) : i;
}
function jn(e, t, n) {
  return Hn([...e, [t, n]]);
}
function Wn(e, t) {
  return e.findIndex(([n, i]) => n <= t && t <= i);
}
function Fn(e, t) {
  return t < 0 ? e : e.filter((n, i) => i !== t);
}
function In(e, t, n, i) {
  const r = Q(e, t);
  return Se(e, t, { ...r, muted: jn(r.muted, n, i) });
}
function Gn(e, t, n) {
  const i = Q(e, t), r = Wn(i.muted, n);
  return r < 0 ? e : Se(e, t, { ...i, muted: Fn(i.muted, r) });
}
function Vn(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const i = {};
  for (const [r, s] of Object.entries(n.peaks))
    Array.isArray(s) && s.length && (i[r] = s.map((c) => Math.abs(Number(c) || 0)));
  return i;
}
function Xn(e, t, n = 200) {
  const i = e[t];
  return i?.length ? i.length === n ? i : Array.from({ length: n }, (r, s) => i[Math.floor(s * i.length / n)] ?? 0) : new Array(n).fill(0);
}
function ft(e, t) {
  const i = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Bn()).filter((s) => s !== de), r = Object.keys(e?.strips ?? {}).filter((s) => s !== de && !i.includes(s));
  return [...i, ...r, de];
}
const mt = "plenio_stem_mixer", ht = "mix", te = 200, Yn = ["room", "plate", "hall"];
function q(e, t, n) {
  const i = document.createElement(e);
  return t && (i.className = t), n !== void 0 && (i.textContent = n), i;
}
function _e(e, t, n, i, r) {
  const s = q("input");
  return s.type = "range", s.min = String(e), s.max = String(t), s.step = String(n), s.value = String(i), s.setAttribute("aria-label", r), s;
}
function Un(e) {
  const t = q("div", "plenio-mix"), n = q("div", "plenio-mix-strips"), i = q("div", "plenio-mix-buses"), r = q("div", "plenio-mix-info"), s = q("div", "plenio-mix-advanced");
  t.append(n, i, s, r);
  let c = {
    mix: { schema: ge, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: ft(null, null),
    peaks: {},
    seconds: 0
  }, v = !1;
  const y = () => e.widgets?.find((d) => d.name === ht);
  function x(d, { draw: u = !0 } = {}) {
    const f = y();
    if (!f) return;
    const m = Dn(d);
    f.value = m, f.callback?.(m), c = { ...c, mix: d }, u && E();
  }
  function $(d, u, f = {}) {
    x(Se(c.mix, d, { ...Q(c.mix, d), ...u }), f);
  }
  function N(d, u, f, m = {}) {
    const S = Q(c.mix, d);
    let g = Se(c.mix, d, { ...S, [u]: f });
    f > 0 && !(g[u] && Object.keys(g[u]).length) && (g = u === "reverb" ? { ...g, reverb: { preset: "room" } } : { ...g, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), x(g, m);
  }
  function B(d, u, f) {
    const m = { ...c.mix[d] ?? {} };
    x({ ...c.mix, [d]: { ...m, [u]: f } });
  }
  function E() {
    n.replaceChildren();
    const d = c.names;
    for (const u of c.names) {
      const f = Q(c.mix, u), m = q("div", "plenio-mix-strip");
      m.dataset.strip = u;
      const S = q("span", "name", u === de ? `${u} (missed)` : u);
      S.title = u === de ? "What the separator missed: keeps a neutral mix exact" : "";
      const g = _e(Nt, zn, 0.5, f.gain_db, `${u} gain`), j = q("span", "gain", `${pt(f.gain_db)} dB`);
      g.addEventListener("input", () => {
        j.textContent = `${pt(Number(g.value))} dB`, $(u, { gain_db: Number(g.value) }, { draw: !1 });
      }), g.addEventListener("change", () => $(u, { gain_db: Number(g.value) }));
      const L = q("button", f.mute ? "toggle active" : "toggle", "M");
      L.setAttribute("aria-label", `${u} mute`), L.addEventListener("click", (k) => {
        k.stopPropagation(), $(u, { mute: !f.mute });
      });
      const C = q("button", f.solo ? "toggle active" : "toggle", "S");
      C.setAttribute("aria-label", `${u} solo`), C.addEventListener("click", (k) => {
        k.stopPropagation(), $(u, { solo: !f.solo });
      });
      const W = _e(0, 1, 0.05, f.compression, `${u} compression`);
      W.title = "Compression amount: one knob for the master compressor (threshold and ratio)", W.addEventListener("input", () => $(u, { compression: Number(W.value) }, { draw: !1 })), W.addEventListener("change", () => $(u, { compression: Number(W.value) }));
      const Y = dt.map((k) => {
        const Z = _e(0, 1, 0.05, f[k], `${u} ${k} send`);
        return Z.title = `${k} send: how much of this stem goes to the shared ${k} bus`, Z.addEventListener("input", () => N(u, k, Number(Z.value), { draw: !1 })), Z.addEventListener("change", () => N(u, k, Number(Z.value))), Z;
      }), O = q("button", f.save ? "toggle active" : "toggle", "save");
      O.setAttribute("aria-label", `${u} save as its own file`), O.setAttribute("aria-pressed", String(f.save)), O.title = "Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; its gain, compression and muted ranges are applied, mute/solo and the buses are not", O.addEventListener("click", (k) => {
        k.stopPropagation(), $(u, { save: !f.save });
      });
      const z = Tn(c.mix, u, d);
      m.classList.toggle("silent", !z);
      const F = q("canvas", "plenio-mix-wave");
      F.width = te, F.height = 26, F.setAttribute("aria-label", `${u} waveform (drag to mute a time range)`), H(F, f, Xn(c.peaks, u, te)), F.addEventListener("pointerdown", (k) => P(k, F, u)), m.append(
        S,
        g,
        j,
        L,
        C,
        q("span", "label", "comp"),
        W,
        q("span", "label", "verb"),
        Y[0],
        q("span", "label", "delay"),
        Y[1],
        O,
        F
      ), n.append(m);
    }
    I(), r.textContent = c.seconds ? `last run: ${c.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function H(d, u, f) {
    const m = d.getContext("2d");
    if (!m) return;
    m.clearRect(0, 0, te, d.height);
    const S = d.height / 2;
    m.strokeStyle = "rgba(180, 190, 205, 0.8)", m.beginPath();
    for (let g = 0; g < f.length; g++) {
      const j = Math.max(1, f[g] * (S - 1));
      m.moveTo(g + 0.5, S - j), m.lineTo(g + 0.5, S + j);
    }
    m.stroke(), m.fillStyle = "rgba(224, 104, 94, 0.35)", m.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [g, j] of u.muted) {
      const L = Math.max(0, Math.min(te, g / Math.max(c.seconds, 1e-6) * te)), C = Math.max(0, Math.min(te, j / Math.max(c.seconds, 1e-6) * te));
      m.fillRect(L, 0, Math.max(1, C - L), d.height), m.strokeRect(L + 0.5, 0.5, Math.max(1, C - L) - 1, d.height - 1);
    }
  }
  function P(d, u, f) {
    if (d.preventDefault(), d.stopPropagation(), !c.seconds) return;
    const m = u.getBoundingClientRect(), S = (Y) => Math.max(0, Math.min(1, (Y - m.left) / (m.width || te))) * c.seconds, g = S(d.clientX);
    if (Q(c.mix, f).muted.some(([Y, O]) => Y <= g && g <= O)) {
      x(Gn(c.mix, f, g));
      return;
    }
    let L = g;
    const C = (Y) => {
      L = S(Y.clientX);
    }, W = () => {
      window.removeEventListener("pointermove", C), window.removeEventListener("pointerup", W), x(In(c.mix, f, Math.min(g, L), Math.max(g, L)));
    };
    window.addEventListener("pointermove", C), window.addEventListener("pointerup", W);
  }
  function I() {
    i.replaceChildren();
    const d = { preset: "room", ...c.mix.reverb ?? {} }, u = { time_ms: 375, feedback: 0.35, ...c.mix.delay ?? {} }, f = q("select");
    f.setAttribute("aria-label", "Reverb preset"), f.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const g of Yn) f.append(new Option(g, g));
    f.value = String(d.preset ?? "room"), f.addEventListener("change", () => B("reverb", "preset", f.value));
    const m = q("input");
    m.type = "number", m.value = String(u.time_ms ?? 375), m.setAttribute("aria-label", "Delay time in ms"), m.title = "Delay time in ms: where the first echo of the delay bus sits", m.addEventListener("change", () => B("delay", "time_ms", Number(m.value)));
    const S = _e(0, 0.8, 0.05, Number(u.feedback ?? 0.35), "Delay feedback");
    S.title = "Delay feedback: how much of each echo returns into the delay line", S.addEventListener("input", () => B("delay", "feedback", Number(S.value))), i.append(
      q("span", "label", "reverb bus"),
      f,
      q("span", "label", "delay bus"),
      m,
      q("span", "label", "ms, feedback"),
      S
    ), i.style.display = dt.some((g) => c.mix[g]) ? "" : "none";
  }
  const G = e.addDOMWidget(mt, mt, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 200,
    getMaxHeight: () => 520
  });
  G.serialize = !1;
  const a = e.widgets?.find((d) => d.name === ht), w = q("button", "toggle", "JSON");
  w.title = "Show or hide the raw mixer value", w.addEventListener("click", (d) => {
    d.stopPropagation(), v = !v, w.classList.toggle("active", v), a && (a.plenioHidden = !v, v ? delete a.computeSize : a.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), s.append(q("span", "label", "Advanced"), w), a && (a.plenioHidden = !0, a.computeSize = () => [0, -4]);
  function D() {
    const d = Pn(y()?.value);
    c = { ...c, mix: d ?? { schema: ge, strips: {} } }, d || (r.textContent = "the mixer value is not readable; it will be replaced on the next edit"), E();
  }
  return D(), {
    showExecuted(d) {
      const u = d?.plenio_stems?.at(-1), f = Vn(d), m = ft(c.mix, u ?? null);
      c = { ...c, names: m, peaks: f, seconds: Number(u?.seconds ?? c.seconds) || 0 }, D();
    }
  };
}
const Qn = `
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
function Jn() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Qn, document.head.append(e);
}
function He(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Re(e) {
  return He(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Kn(e) {
  const t = [];
  let n = !1, i = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (i !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${He(i.join(`
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
      const y = Math.min(c[1].length + 2, 6);
      t.push(`<h${y}>${Re(c[2])}</h${y}>`);
      continue;
    }
    const v = /^\s*[-*]\s+(.*)$/.exec(s);
    if (v) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${Re(v[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${Re(s)}</p>`);
  }
  return r(), i !== null && t.push(`<pre><code>${He(i.join(`
`))}</code></pre>`), t.join("");
}
const Be = "plenio_summary", gt = "plenio_summary";
function Zn(e) {
  const t = e.widgets?.find((r) => r.name === gt);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const i = e.addDOMWidget(gt, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return i.serialize = !1, n;
}
function bt(e, t) {
  if (!t.markdown) return;
  const n = Zn(e);
  n.dataset.status = t.status ?? "", n.innerHTML = Kn(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function ei(e) {
  e.prototype.onExecuted = K(e.prototype.onExecuted, function(t) {
    const n = t?.[Be], i = n?.[n.length - 1];
    i?.markdown && (this.properties = this.properties ?? {}, this.properties[Be] = { markdown: i.markdown, status: i.status ?? "" }, bt(this, i));
  }), e.prototype.onConfigure = K(e.prototype.onConfigure, function() {
    const t = this.properties?.[Be];
    t?.markdown && bt(this, t);
  });
}
const ti = "Plenio.Core", ke = Ht;
Ln(ke);
jt.registerExtension({
  name: ti,
  getCustomWidgets: () => ({ [Mt]: Cn }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    ei(e);
    const n = cn(t.input);
    if (n.size || t.name in We) {
      const i = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = En(t, r), c = rn(s), v = i?.call(this, s);
        return ln(this, c, n), v;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(i) {
      for (const r of i?.plenio_asr ?? []) Sn(r);
    })), t.name === "PlenioEQ") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, vn(this, ke));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    if (en.has(t.name) && tn(e, ke), t.name === "PlenioStemMixer") {
      const i = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), i.set(this, Un(this));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(s) {
        i.get(this)?.showExecuted(s);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(i) {
      const r = i?.plenio_sheet, s = r?.[r.length - 1];
      s && at(String(this.id), s);
    }));
  },
  setup() {
    Jn(), ke.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && at(String(t.node_id), t);
    });
  }
});
export {
  ti as E,
  yt as P,
  ui as a,
  oi as b,
  pi as c,
  qn as d,
  li as e,
  Oe as f,
  si as g,
  ci as i,
  mi as n,
  ri as r,
  fi as s,
  ai as t,
  gi as u,
  di as v,
  hi as w
};
