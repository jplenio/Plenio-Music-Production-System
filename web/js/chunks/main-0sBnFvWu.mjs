import { api as Ne } from "../../../../scripts/api.js";
import { app as Oe } from "../../../../scripts/app.js";
function k(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
class we extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function A(e, t, n) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await o.json();
  if (!o.ok) {
    const s = r?.error ?? {};
    throw new we(s.message ?? `Request failed (${o.status})`, s.hint ?? null);
  }
  return r;
}
function Nt(e, t) {
  return A(e, "/plenio/sheet/resolve", t);
}
async function Ot(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Lt(e, t) {
  return A(e, "/plenio/score/analyze", { abc: t });
}
function Pt(e, t, n) {
  return A(e, "/plenio/score/transform", { abc: t, operation: n });
}
function Tt(e, t) {
  return A(e, "/plenio/score/midi/export", t);
}
function Rt(e, t) {
  return A(e, "/plenio/score/midi/import", t);
}
function Ht(e, t) {
  return A(e, "/plenio/lyrics/analyze", t);
}
function Dt(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function Le(e, t, n, o = 200) {
  return A(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function Pe(e, t) {
  return A(e, "/plenio/brief/fields", t);
}
async function Te(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new we(`Request failed (${t.status})`);
  return await t.json();
}
const T = [
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
], Re = ["length", "vocals", "melody"], be = {
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
}, He = "custom";
function xe(e) {
  return typeof e == "string" && e.trim().toLowerCase() === He;
}
function $(e, t) {
  const n = be[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function De(e) {
  const t = {};
  for (const n of [...T, ...Re]) {
    const o = $(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function oe(e, t) {
  const n = [];
  for (const o of t.fills) {
    if (!T.includes(o.field)) continue;
    const r = $(e, o.field);
    r && !String(r.value ?? "").trim() && o.value && n.push({ field: o.field, value: o.value });
  }
  return n;
}
function re(e) {
  const t = [];
  for (const n of T) {
    const o = $(e, n);
    o && String(o.value ?? "").trim() && t.push(o);
  }
  return t;
}
function U(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Be(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((o) => `${o.field} (${Ie(o.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function je(e) {
  const t = e ? U(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function We(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Ie(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function ie(e, t) {
  for (const n of t) {
    const o = $(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Ve(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function _e(e) {
  const t = [];
  for (const n of T) {
    const o = $(e, n);
    !o || !xe(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const se = "plenio_brief_template", Fe = 400;
function Ye(e, t) {
  let n = null, o = !1, r = null, s;
  const u = document.createElement("div");
  u.className = "plenio-brief-template";
  const f = document.createElement("div");
  f.className = "line";
  const i = document.createElement("div");
  i.className = "hint";
  const m = document.createElement("div");
  m.className = "actions", u.append(f, i, m);
  const y = (l, a, d) => {
    const p = document.createElement("button");
    return p.textContent = l, p.title = a, p.addEventListener("click", (g) => {
      g.stopPropagation(), d();
    }), m.append(p), p;
  }, x = y("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (ie(e, oe(e, n).map((l) => ({ field: l.field, value: l.value }))), h());
  }), O = y("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (ie(e, U(n)), h());
  }), w = y("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const l = re(e);
    l.length && window.confirm(`Clear ${l.length} text field(s)? The template's values apply again.`) && (Ve(e, l), h());
  }), _ = y("↻", "Ask again what the template fills", () => {
    b();
  }), h = () => {
    const l = Be(n, o);
    f.textContent = r ?? l ?? "The template fills nothing: every text field has your value.", f.dataset.state = r ? "error" : o && n ? "ok" : "empty";
    const a = je(n), d = We(n);
    i.textContent = [a, d].filter(Boolean).join(" · "), i.style.display = i.textContent ? "" : "none", m.style.display = o && n && n.template !== "none" ? "" : "none", x.disabled = !n || !oe(e, n).length, O.disabled = !n || !U(n).length, w.disabled = !re(e).length, _.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, q = async () => {
    const l = String(e.widgets?.find((a) => a.name === "template")?.value ?? "none");
    try {
      n = await Pe(t, { fields: De(e), template: l }), r = null;
    } catch (a) {
      n = null, r = `The template fields could not be read: ${a instanceof Error ? a.message : String(a)}`;
    }
    o = !0, h();
  };
  function b() {
    clearTimeout(s), s = setTimeout(() => {
      q();
    }, Fe);
  }
  const z = e.widgets?.find((l) => l.name === "template");
  z && (z.callback = k(z.callback, () => b()));
  for (const l of ["description", "genre", "mood", "tempo", "key", "meter"]) {
    const a = $(e, l);
    a && (a.callback = k(a.callback, () => b()));
  }
  const E = $(e, "vocals");
  E && (E.callback = k(E.callback, () => b()));
  const c = e.addDOMWidget(se, se, u, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return c.serialize = !1, _e(e), h(), b(), {
    widget: c,
    refresh: b,
    answer: () => n,
    dispose: () => clearTimeout(s)
  };
}
const Ge = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Qe(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, r = o.onNodeCreated;
  o.onNodeCreated = function() {
    r?.call(this), n.set(this, Ye(this, t));
  };
  const s = o.onConfigure;
  o.onConfigure = function(u) {
    s?.call(this, u), _e(this), n.get(this)?.refresh();
  };
}
const Ue = "COMFY_DYNAMICCOMBO_V3";
function Xe(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Je(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Ke(e, t) {
  const n = Je(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, r) => o.value === t[r]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function Ze(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function et(e, t, n) {
  if (!t || !e.widgets || Ke(e, t)) return !1;
  let o = 0;
  for (let r = 0; r < e.widgets.length; r++) {
    const s = e.widgets[r];
    if (s.serialize === !1) continue;
    let u;
    if (Array.isArray(t)) {
      if (o >= t.length) break;
      u = t[o++];
    } else if (s.name in t)
      u = t[s.name];
    else
      continue;
    if (n.has(s.name) && !Ze(s, u)) return !0;
    s.value !== u && (s.value = u);
  }
  return !0;
}
function tt(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, r] of Object.entries(n ?? {}))
      Array.isArray(r) && r[0] === Ue && t.add(o);
  return t;
}
const Ee = "plenio.eq/1", nt = 8, C = 20, ot = 2e4, j = 12, M = 15, Se = ["peak", "low_shelf", "high_shelf"];
function X() {
  return { schema: Ee, preamp_db: 0, bands: [] };
}
function rt(e) {
  if (typeof e != "string" || !e.trim()) return X();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: Ee,
      preamp_db: typeof t.preamp_db == "number" ? t.preamp_db : 0,
      bands: t.bands.map((n, o) => ({
        id: typeof n.id == "string" && n.id ? n.id : `band-${o + 1}`,
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
function it(e) {
  return JSON.stringify(e);
}
const N = (e, t) => Number(e.toFixed(t));
function S(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function H(e, t) {
  return Math.log(S(t, C, e.maxHz) / C) / Math.log(e.maxHz / C) * e.width;
}
function ae(e, t) {
  return C * (e.maxHz / C) ** S(t / e.width, 0, 1);
}
function D(e, t) {
  return (1 - (S(t, -M, M) + M) / (2 * M)) * e.height;
}
function le(e, t) {
  return (1 - S(t / e.height, 0, 1)) * 2 * M - M;
}
function st(e, t, n) {
  return t.map((o, r) => `${r ? "L" : "M"}${H(e, o).toFixed(1)},${D(e, n[r] ?? 0).toFixed(1)}`).join(" ");
}
function ke(e) {
  return Math.min(ot, 0.45 * e);
}
function at(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function lt(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= nt) return null;
  const r = {
    id: at(e),
    enabled: !0,
    type: "peak",
    frequency_hz: N(S(t, C, ke(o)), 1),
    gain_db: N(S(n, -j, j), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, r] };
}
function L(e, t, n, o, r = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (s) => s.id !== t ? s : {
        ...s,
        frequency_hz: N(S(n, C, ke(r)), 1),
        gain_db: Se.includes(s.type) ? N(S(o, -j, j), 1) : s.gain_db
      }
    )
  };
}
function I(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: N(S(o.q * n, 0.2, 10), 3) } : o)
  };
}
function ce(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function ue(e) {
  const t = e.frequency_hz >= 1e3 ? `${N(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Se.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
const ct = "http://www.w3.org/2000/svg", pe = "plenio_eq_curve", v = { width: 360, height: 150, maxHz: 2e4 };
let V = null;
function P(e, t) {
  const n = document.createElementNS(ct, e);
  for (const [o, r] of Object.entries(t)) n.setAttribute(o, String(r));
  return n;
}
function J(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function de(e) {
  return String(J(e, "mode")?.value ?? "flat");
}
function ut(e, t) {
  const n = document.createElement("div");
  n.className = "plenio-eq";
  const o = document.createElement("div");
  o.className = "plenio-eq-tools";
  const r = document.createElement("select");
  r.setAttribute("aria-label", "EQ preset");
  const s = document.createElement("span");
  s.className = "plenio-eq-info", s.setAttribute("aria-live", "polite"), o.append(r, s);
  const u = P("svg", { viewBox: `0 0 ${v.width} ${v.height}`, class: "plenio-eq-plot", role: "img" });
  u.setAttribute("aria-label", "EQ response curve"), n.append(o, u);
  const f = e.addDOMWidget(pe, pe, n, { serialize: !1, getValue: () => "", setValue: () => {
  }, getMinHeight: () => 200 });
  f.serialize = !1;
  let i = { sampleRate: 48e3, frequencies: [], response: [], settings: X(), readonly: !0, note: "" }, m = null, y = 0, x;
  const O = () => J(e, "mode.bands");
  function w(c) {
    const l = O();
    if (!l) return;
    const a = it(c);
    l.value = a, l.callback?.(a), i = { ...i, settings: c }, h(), _(0);
  }
  async function _(c = 120) {
    clearTimeout(x), x = setTimeout(async () => {
      const l = de(e);
      if (l !== "manual") {
        i = l === "flat" ? { ...i, settings: X(), response: i.frequencies.map(() => 0), readonly: !0, note: "flat: no change" } : { ...i, readonly: !0, note: i.note || "the applied proposal appears here after a run" }, h();
        return;
      }
      const a = rt(O()?.value);
      if (!a) {
        i = { ...i, readonly: !0, note: "the bands are not valid JSON" }, h();
        return;
      }
      const d = ++y;
      try {
        const p = await Le(t, a, i.sampleRate);
        if (d !== y) return;
        i = {
          ...i,
          frequencies: p.frequency_hz,
          response: p.response_db,
          settings: p.settings,
          readonly: !1,
          note: ""
        };
      } catch (p) {
        i = { ...i, readonly: !1, note: p instanceof Error ? p.message : String(p) };
      }
      h();
    }, c);
  }
  function h() {
    u.replaceChildren();
    const c = { ...v, maxHz: Math.min(v.maxHz, i.sampleRate / 2) };
    for (const a of [-12, -6, 0, 6, 12])
      u.append(P("line", { x1: 0, x2: v.width, y1: D(c, a), y2: D(c, a), class: a ? "grid" : "grid zero" }));
    for (const a of [100, 1e3, 1e4])
      u.append(P("line", { x1: H(c, a), x2: H(c, a), y1: 0, y2: v.height, class: "grid" }));
    if (i.frequencies.length && u.append(P("path", { d: st(c, i.frequencies, i.response), class: "curve" })), !i.readonly)
      for (const a of i.settings.bands) {
        const d = P("circle", {
          cx: H(c, a.frequency_hz),
          cy: D(c, ["peak", "low_shelf", "high_shelf"].includes(a.type) ? a.gain_db : 0),
          r: a.id === m ? 7 : 5.5,
          class: a.id === m ? "handle selected" : "handle",
          tabindex: 0
        });
        d.setAttribute("aria-label", ue(a)), d.addEventListener("pointerdown", (p) => b(p, a.id, c)), d.addEventListener("focus", () => q(a.id)), d.addEventListener("keydown", (p) => z(p, a.id)), d.addEventListener("wheel", (p) => {
          p.preventDefault(), w(I(i.settings, a.id, p.deltaY < 0 ? 1.15 : 1 / 1.15));
        }), d.addEventListener("contextmenu", (p) => {
          p.preventDefault(), w(ce(i.settings, a.id));
        }), u.append(d);
      }
    const l = i.settings.bands.find((a) => a.id === m);
    s.textContent = i.note || (l ? ue(l) : i.readonly ? `${i.settings.bands.length} band(s)` : "double-click to add a band; drag, wheel = Q, right-click = remove"), r.disabled = i.readonly, e.setDirtyCanvas?.(!0, !0);
  }
  function q(c) {
    m = c, h();
  }
  function b(c, l, a) {
    c.preventDefault(), c.stopPropagation(), q(l);
    const d = u.getBoundingClientRect(), p = (R) => {
      const $e = (R.clientX - d.left) / d.width * v.width, Me = (R.clientY - d.top) / d.height * v.height;
      i = { ...i, settings: L(i.settings, l, ae(a, $e), le(a, Me), i.sampleRate) }, h();
    }, g = () => {
      window.removeEventListener("pointermove", p), window.removeEventListener("pointerup", g), w(i.settings);
    };
    window.addEventListener("pointermove", p), window.addEventListener("pointerup", g);
  }
  function z(c, l) {
    const a = i.settings.bands.find((R) => R.id === l);
    if (!a) return;
    const d = c.shiftKey ? 0.1 : 0.5, p = c.shiftKey ? 1.01 : 1.06;
    let g = null;
    c.key === "ArrowUp" ? g = L(i.settings, l, a.frequency_hz, a.gain_db + d, i.sampleRate) : c.key === "ArrowDown" ? g = L(i.settings, l, a.frequency_hz, a.gain_db - d, i.sampleRate) : c.key === "ArrowRight" ? g = L(i.settings, l, a.frequency_hz * p, a.gain_db, i.sampleRate) : c.key === "ArrowLeft" ? g = L(i.settings, l, a.frequency_hz / p, a.gain_db, i.sampleRate) : c.key === "+" ? g = I(i.settings, l, 1.15) : c.key === "-" ? g = I(i.settings, l, 1 / 1.15) : (c.key === "Delete" || c.key === "Backspace") && (g = ce(i.settings, l)), g && (c.preventDefault(), w(g));
  }
  u.addEventListener("dblclick", (c) => {
    if (i.readonly) return;
    const l = u.getBoundingClientRect(), a = { ...v, maxHz: Math.min(v.maxHz, i.sampleRate / 2) }, d = (c.clientX - l.left) / l.width * v.width, p = (c.clientY - l.top) / l.height * v.height, g = lt(i.settings, ae(a, d), le(a, p), i.sampleRate);
    g ? (m = g.bands[g.bands.length - 1].id, w(g)) : (i = { ...i, note: "the EQ has at most 8 bands" }, h());
  }), r.append(new Option("preset…", "")), V ??= Te(t).then((c) => c.manual).catch(() => []), V.then((c) => {
    for (const l of c) r.append(new Option(l.name, l.name));
  }), r.addEventListener("change", async () => {
    const c = (await V)?.find((l) => l.name === r.value);
    r.value = "", c && w({ ...c.settings, bands: c.settings.bands.slice(0, 8) });
  });
  const E = (c) => {
    const l = J(e, c);
    if (!l) return;
    const a = l.callback;
    l.callback = (d) => {
      a?.(d), setTimeout(() => {
        E("mode.bands"), _();
      });
    };
  };
  return E("mode"), E("mode.bands"), _(0), {
    showExecuted(c) {
      const l = c?.plenio_eq, a = l?.[l.length - 1];
      if (!a) return;
      const d = de(e) === "manual";
      i = {
        sampleRate: a.sample_rate,
        frequencies: a.frequency_hz,
        response: a.response_db,
        settings: a.settings,
        readonly: !d,
        note: d ? "" : `applied: ${a.settings.bands.length} band(s)`
      }, d ? _(0) : h();
    }
  };
}
const te = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, pt = new Set(T.map((e) => be[e]));
function dt(e, t) {
  return !(e in te) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => pt.has(n) && xe(o)).map(([n]) => n);
}
function ft(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const r = o[1]?.options;
    return Array.isArray(r) ? r : [];
  }
  return [];
}
function mt(e, t) {
  const n = te[e.name];
  if (!n || !t) return t;
  const o = ft(e, "mode"), r = t.widgets_values, s = t.widgets_values_named;
  let u = t;
  Array.isArray(r) && r.length && !o.includes(r[0]) && (u = { ...u, widgets_values: [n, ...r] }), s && typeof s == "object" && !Array.isArray(s) && !("mode" in s) && (u = { ...u, widgets_values_named: { mode: n, ...s } });
  const f = dt(e.name, u.widgets_values_named);
  if (f.length) {
    const i = { ...u.widgets_values_named };
    for (const m of f) i[m] = "";
    u = { ...u, widgets_values_named: i };
  }
  return u;
}
const Ae = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Set();
function fe(e, t) {
  Ae.set(e, t);
  for (const n of K) n(e);
}
function me(e) {
  return Ae.get(e) ?? null;
}
function gt(e) {
  return K.add(e), () => K.delete(e);
}
const qe = /* @__PURE__ */ new Map();
function ht(e) {
  e?.draft_sha256 && qe.set(e.draft_sha256, e);
}
function yt(e) {
  return e ? qe.get(e) ?? null : null;
}
const ne = "plenio.sheet_state/1", W = ["title", "style", "lyrics", "score", "artwork_prompt"];
function ze() {
  return { schema: ne, docs: {} };
}
function ge(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return ze();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== ne || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function vt(e) {
  const t = {};
  for (const o of W) {
    const r = e.docs[o];
    r && (t[o] = r);
  }
  const n = { schema: ne, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function F(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function wt(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = W.filter((o) => F(e, o) !== "auto").map(
    (o) => o === "lyrics" && F(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${F(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function he(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function Bt(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const r = e.bars[Math.max(0, n - 1)], s = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: he(r?.[0] ?? 0), end: he(s?.[1] ?? e.duration_s) };
  }) : [];
}
function Y(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let n = 0, o = t.length;
  for (; n < o && !t[n]; ) n++;
  for (; o > n && !t[o - 1]; ) o--;
  return t.slice(n, o).join(`
`);
}
function bt(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function jt(e, t, n) {
  return n.map((o) => ({ kind: o, text: bt(e, t, o), intent: "keep" }));
}
function Wt(e, t, n) {
  const o = { ...e.docs };
  for (const s of n) {
    const u = e.docs[s.kind], f = t?.docs[s.kind], i = Y(s.text);
    if (s.intent === "auto")
      delete o[s.kind];
    else if (s.intent === "manual")
      o[s.kind] = { state: "manual", text: i };
    else if (s.intent === "rebase")
      f?.upstream_sha256 ? o[s.kind] = { state: "edited", text: i, base_sha256: f.upstream_sha256 } : o[s.kind] = { state: "manual", text: i };
    else if (u)
      Y(u.text) !== i && (o[s.kind] = { ...u, text: i });
    else {
      const m = Y(f?.upstream ?? "");
      if (i === m) continue;
      o[s.kind] = f?.upstream_sha256 ? { state: "edited", text: i, base_sha256: f.upstream_sha256 } : { state: "manual", text: i };
    }
  }
  const r = { ...ze(), docs: o };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function It(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function xt(e, t) {
  return W.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Vt(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ce = "PLENIO_SHEET_STATE";
let Z = null;
function _t(e) {
  Z = e;
}
const Et = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const s = document.createElement("span");
  s.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", r.append(u, s);
  const f = () => {
    const m = me(String(e.id)), y = m ? ` · ${m.status}` : "";
    s.textContent = wt(ge(o)) + y;
  }, i = e.addDOMWidget(t, Ce, r, {
    getValue: () => o,
    setValue: (m) => {
      o = typeof m == "string" ? m : "", f();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (m) => {
    m.stopPropagation();
    const y = ge(o);
    y === null && (s.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const x = me(String(e.id)), w = (e.inputs ?? []).filter((l) => l.link != null).map((l) => l.name), _ = y ?? { schema: "plenio.sheet_state/1", docs: {} }, h = x?.owned ?? xt(w, _), q = String(e.widgets?.find((l) => l.name === "review")?.value ?? "continue"), b = q === "as the brief says" ? x?.review ?? "continue" : q, { openSheetDialog: z } = await import("./open-CE5OovSz.mjs"), { parseGuide: E, serializeGuide: c } = await import("./tracks-DEywwRcM.mjs");
    if (!Z) throw new Error("Plenio: API not initialised");
    z({
      title: e.title || "Song Sheet",
      state: _,
      payload: x,
      asrNote: yt(x?.docs.lyrics?.upstream_sha256),
      owned: h.length ? h : [...W],
      review: b,
      fetcher: Z,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: E(e.properties?.plenio_guide),
      onApply: (l, a) => {
        i.value = vt(l), e.properties = { ...e.properties ?? {}, plenio_guide: c(a) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), gt((m) => {
    m === String(e.id) && f();
  }), f(), { widget: i };
}, St = `
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
function kt() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = St, document.head.append(e);
}
function ee(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function G(e) {
  return ee(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function At(e) {
  const t = [];
  let n = !1, o = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const s of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      s.startsWith("```") ? (t.push(`<pre><code>${ee(o.join(`
`))}</code></pre>`), o = null) : o.push(s);
      continue;
    }
    if (s.startsWith("```")) {
      r(), o = [];
      continue;
    }
    const u = /^(#{1,4})\s+(.*)$/.exec(s);
    if (u) {
      r();
      const i = Math.min(u[1].length + 2, 6);
      t.push(`<h${i}>${G(u[2])}</h${i}>`);
      continue;
    }
    const f = /^\s*[-*]\s+(.*)$/.exec(s);
    if (f) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${G(f[1])}</li>`);
      continue;
    }
    r(), s.trim() && t.push(`<p>${G(s)}</p>`);
  }
  return r(), o !== null && t.push(`<pre><code>${ee(o.join(`
`))}</code></pre>`), t.join("");
}
const Q = "plenio_summary", ye = "plenio_summary";
function qt(e) {
  const t = e.widgets?.find((r) => r.name === ye);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const o = e.addDOMWidget(ye, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return o.serialize = !1, n;
}
function ve(e, t) {
  if (!t.markdown) return;
  const n = qt(e);
  n.dataset.status = t.status ?? "", n.innerHTML = At(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function zt(e) {
  e.prototype.onExecuted = k(e.prototype.onExecuted, function(t) {
    const n = t?.[Q], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[Q] = { markdown: o.markdown, status: o.status ?? "" }, ve(this, o));
  }), e.prototype.onConfigure = k(e.prototype.onConfigure, function() {
    const t = this.properties?.[Q];
    t?.markdown && ve(this, t);
  });
}
const Ct = "Plenio.Core", B = Ne;
_t(B);
Oe.registerExtension({
  name: Ct,
  getCustomWidgets: () => ({ [Ce]: Et }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    zt(e);
    const n = tt(t.input);
    if (n.size || t.name in te) {
      const o = e.prototype.configure;
      e.prototype.configure = function(r) {
        const s = mt(t, r), u = Xe(s), f = o?.call(this, s);
        return et(this, u, n), f;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = k(e.prototype.onExecuted, function(o) {
      for (const r of o?.plenio_asr ?? []) ht(r);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), r = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        r?.call(this), o.set(this, ut(this, B));
      }, e.prototype.onExecuted = k(e.prototype.onExecuted, function(s) {
        o.get(this)?.showExecuted(s);
      });
    }
    Ge.has(t.name) && Qe(e, B), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = k(e.prototype.onExecuted, function(o) {
      const r = o?.plenio_sheet, s = r?.[r.length - 1];
      s && fe(String(this.id), s);
    }));
  },
  setup() {
    kt(), B.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && fe(String(t.node_id), t);
    });
  }
});
export {
  Ct as E,
  we as P,
  Ht as a,
  Lt as b,
  Bt as c,
  vt as d,
  Tt as e,
  Y as f,
  Ot as g,
  Rt as i,
  Wt as n,
  Nt as r,
  jt as s,
  Pt as t,
  Vt as u,
  Dt as v,
  It as w
};
