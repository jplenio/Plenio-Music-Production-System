import { api as be } from "../../../../scripts/api.js";
import { app as ve } from "../../../../scripts/app.js";
function O(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const xe = "COMFY_DYNAMICCOMBO_V3";
function _e(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Ee(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Se(e, t) {
  const n = Ee(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, o) => r.value === t[o]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function qe(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ke(e, t, n) {
  if (!t || !e.widgets || Se(e, t)) return !1;
  let r = 0;
  for (let o = 0; o < e.widgets.length; o++) {
    const i = e.widgets[o];
    if (i.serialize === !1) continue;
    let u;
    if (Array.isArray(t)) {
      if (r >= t.length) break;
      u = t[r++];
    } else if (i.name in t)
      u = t[i.name];
    else
      continue;
    if (n.has(i.name) && !qe(i, u)) return !0;
    i.value !== u && (i.value = u);
  }
  return !0;
}
function ze(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === xe && t.add(r);
  return t;
}
class ce extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function M(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), o = await r.json();
  if (!r.ok) {
    const i = o?.error ?? {};
    throw new ce(i.message ?? `Request failed (${r.status})`, i.hint ?? null);
  }
  return o;
}
function rt(e, t) {
  return M(e, "/plenio/sheet/resolve", t);
}
async function st(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function ot(e, t) {
  return M(e, "/plenio/score/analyze", { abc: t });
}
function it(e, t, n) {
  return M(e, "/plenio/score/transform", { abc: t, operation: n });
}
function at(e, t) {
  return M(e, "/plenio/lyrics/analyze", t);
}
function lt(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Ae(e, t, n, r = 200) {
  return M(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
async function Me(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new ce(`Request failed (${t.status})`);
  return await t.json();
}
const ue = "plenio.eq/1", $e = 8, E = 20, Ne = 2e4, R = 12, q = 15, pe = ["peak", "low_shelf", "high_shelf"];
function V() {
  return { schema: ue, preamp_db: 0, bands: [] };
}
function Oe(e) {
  if (typeof e != "string" || !e.trim()) return V();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: ue,
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
function Ce(e) {
  return JSON.stringify(e);
}
const k = (e, t) => Number(e.toFixed(t));
function b(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function C(e, t) {
  return Math.log(b(t, E, e.maxHz) / E) / Math.log(e.maxHz / E) * e.width;
}
function G(e, t) {
  return E * (e.maxHz / E) ** b(t / e.width, 0, 1);
}
function L(e, t) {
  return (1 - (b(t, -q, q) + q) / (2 * q)) * e.height;
}
function K(e, t) {
  return (1 - b(t / e.height, 0, 1)) * 2 * q - q;
}
function Le(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${C(e, r).toFixed(1)},${L(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function de(e) {
  return Math.min(Ne, 0.45 * e);
}
function Re(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function He(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= $e) return null;
  const o = {
    id: Re(e),
    enabled: !0,
    type: "peak",
    frequency_hz: k(b(t, E, de(r)), 1),
    gain_db: k(b(n, -R, R), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, o] };
}
function z(e, t, n, r, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (i) => i.id !== t ? i : {
        ...i,
        frequency_hz: k(b(n, E, de(o)), 1),
        gain_db: pe.includes(i.type) ? k(b(r, -R, R), 1) : i.gain_db
      }
    )
  };
}
function T(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: k(b(r.q * n, 0.2, 10), 3) } : r)
  };
}
function Z(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function ee(e) {
  const t = e.frequency_hz >= 1e3 ? `${k(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = pe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
const Pe = "http://www.w3.org/2000/svg", te = "plenio_eq_curve", g = { width: 360, height: 150, maxHz: 2e4 };
let j = null;
function A(e, t) {
  const n = document.createElementNS(Pe, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function Y(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function ne(e) {
  return String(Y(e, "mode")?.value ?? "flat");
}
function De(e, t) {
  const n = document.createElement("div");
  n.className = "plenio-eq";
  const r = document.createElement("div");
  r.className = "plenio-eq-tools";
  const o = document.createElement("select");
  o.setAttribute("aria-label", "EQ preset");
  const i = document.createElement("span");
  i.className = "plenio-eq-info", i.setAttribute("aria-live", "polite"), r.append(o, i);
  const u = A("svg", { viewBox: `0 0 ${g.width} ${g.height}`, class: "plenio-eq-plot", role: "img" });
  u.setAttribute("aria-label", "EQ response curve"), n.append(r, u);
  const h = e.addDOMWidget(te, te, n, { serialize: !1, getValue: () => "", setValue: () => {
  }, getMinHeight: () => 200 });
  h.serialize = !1;
  let s = { sampleRate: 48e3, frequencies: [], response: [], settings: V(), readonly: !0, note: "" }, f = null, x = 0, S;
  const P = () => Y(e, "mode.bands");
  function v(l) {
    const c = P();
    if (!c) return;
    const a = Ce(l);
    c.value = a, c.callback?.(a), s = { ...s, settings: l }, y(), _(0);
  }
  async function _(l = 120) {
    clearTimeout(S), S = setTimeout(async () => {
      const c = ne(e);
      if (c !== "manual") {
        s = c === "flat" ? { ...s, settings: V(), response: s.frequencies.map(() => 0), readonly: !0, note: "flat: no change" } : { ...s, readonly: !0, note: s.note || "the applied proposal appears here after a run" }, y();
        return;
      }
      const a = Oe(P()?.value);
      if (!a) {
        s = { ...s, readonly: !0, note: "the bands are not valid JSON" }, y();
        return;
      }
      const p = ++x;
      try {
        const d = await Ae(t, a, s.sampleRate);
        if (p !== x) return;
        s = {
          ...s,
          frequencies: d.frequency_hz,
          response: d.response_db,
          settings: d.settings,
          readonly: !1,
          note: ""
        };
      } catch (d) {
        s = { ...s, readonly: !1, note: d instanceof Error ? d.message : String(d) };
      }
      y();
    }, l);
  }
  function y() {
    u.replaceChildren();
    const l = { ...g, maxHz: Math.min(g.maxHz, s.sampleRate / 2) };
    for (const a of [-12, -6, 0, 6, 12])
      u.append(A("line", { x1: 0, x2: g.width, y1: L(l, a), y2: L(l, a), class: a ? "grid" : "grid zero" }));
    for (const a of [100, 1e3, 1e4])
      u.append(A("line", { x1: C(l, a), x2: C(l, a), y1: 0, y2: g.height, class: "grid" }));
    if (s.frequencies.length && u.append(A("path", { d: Le(l, s.frequencies, s.response), class: "curve" })), !s.readonly)
      for (const a of s.settings.bands) {
        const p = A("circle", {
          cx: C(l, a.frequency_hz),
          cy: L(l, ["peak", "low_shelf", "high_shelf"].includes(a.type) ? a.gain_db : 0),
          r: a.id === f ? 7 : 5.5,
          class: a.id === f ? "handle selected" : "handle",
          tabindex: 0
        });
        p.setAttribute("aria-label", ee(a)), p.addEventListener("pointerdown", (d) => D(d, a.id, l)), p.addEventListener("focus", () => $(a.id)), p.addEventListener("keydown", (d) => w(d, a.id)), p.addEventListener("wheel", (d) => {
          d.preventDefault(), v(T(s.settings, a.id, d.deltaY < 0 ? 1.15 : 1 / 1.15));
        }), p.addEventListener("contextmenu", (d) => {
          d.preventDefault(), v(Z(s.settings, a.id));
        }), u.append(p);
      }
    const c = s.settings.bands.find((a) => a.id === f);
    i.textContent = s.note || (c ? ee(c) : s.readonly ? `${s.settings.bands.length} band(s)` : "double-click to add a band; drag, wheel = Q, right-click = remove"), o.disabled = s.readonly, e.setDirtyCanvas?.(!0, !0);
  }
  function $(l) {
    f = l, y();
  }
  function D(l, c, a) {
    l.preventDefault(), l.stopPropagation(), $(c);
    const p = u.getBoundingClientRect(), d = (N) => {
      const ye = (N.clientX - p.left) / p.width * g.width, we = (N.clientY - p.top) / p.height * g.height;
      s = { ...s, settings: z(s.settings, c, G(a, ye), K(a, we), s.sampleRate) }, y();
    }, m = () => {
      window.removeEventListener("pointermove", d), window.removeEventListener("pointerup", m), v(s.settings);
    };
    window.addEventListener("pointermove", d), window.addEventListener("pointerup", m);
  }
  function w(l, c) {
    const a = s.settings.bands.find((N) => N.id === c);
    if (!a) return;
    const p = l.shiftKey ? 0.1 : 0.5, d = l.shiftKey ? 1.01 : 1.06;
    let m = null;
    l.key === "ArrowUp" ? m = z(s.settings, c, a.frequency_hz, a.gain_db + p, s.sampleRate) : l.key === "ArrowDown" ? m = z(s.settings, c, a.frequency_hz, a.gain_db - p, s.sampleRate) : l.key === "ArrowRight" ? m = z(s.settings, c, a.frequency_hz * d, a.gain_db, s.sampleRate) : l.key === "ArrowLeft" ? m = z(s.settings, c, a.frequency_hz / d, a.gain_db, s.sampleRate) : l.key === "+" ? m = T(s.settings, c, 1.15) : l.key === "-" ? m = T(s.settings, c, 1 / 1.15) : (l.key === "Delete" || l.key === "Backspace") && (m = Z(s.settings, c)), m && (l.preventDefault(), v(m));
  }
  u.addEventListener("dblclick", (l) => {
    if (s.readonly) return;
    const c = u.getBoundingClientRect(), a = { ...g, maxHz: Math.min(g.maxHz, s.sampleRate / 2) }, p = (l.clientX - c.left) / c.width * g.width, d = (l.clientY - c.top) / c.height * g.height, m = He(s.settings, G(a, p), K(a, d), s.sampleRate);
    m ? (f = m.bands[m.bands.length - 1].id, v(m)) : (s = { ...s, note: "the EQ has at most 8 bands" }, y());
  }), o.append(new Option("preset…", "")), j ??= Me(t).then((l) => l.manual).catch(() => []), j.then((l) => {
    for (const c of l) o.append(new Option(c.name, c.name));
  }), o.addEventListener("change", async () => {
    const l = (await j)?.find((c) => c.name === o.value);
    o.value = "", l && v({ ...l.settings, bands: l.settings.bands.slice(0, 8) });
  });
  const B = (l) => {
    const c = Y(e, l);
    if (!c) return;
    const a = c.callback;
    c.callback = (p) => {
      a?.(p), setTimeout(() => {
        B("mode.bands"), _();
      });
    };
  };
  return B("mode"), B("mode.bands"), _(0), {
    showExecuted(l) {
      const c = l?.plenio_eq, a = c?.[c.length - 1];
      if (!a) return;
      const p = ne(e) === "manual";
      s = {
        sampleRate: a.sample_rate,
        frequencies: a.frequency_hz,
        response: a.response_db,
        settings: a.settings,
        readonly: !p,
        note: p ? "" : `applied: ${a.settings.bands.length} band(s)`
      }, p ? _(0) : y();
    }
  };
}
const fe = /* @__PURE__ */ new Map(), Q = /* @__PURE__ */ new Set();
function re(e, t) {
  fe.set(e, t);
  for (const n of Q) n(e);
}
function se(e) {
  return fe.get(e) ?? null;
}
function Be(e) {
  return Q.add(e), () => Q.delete(e);
}
const me = /* @__PURE__ */ new Map();
function Te(e) {
  e?.draft_sha256 && me.set(e.draft_sha256, e);
}
function je(e) {
  return e ? me.get(e) ?? null : null;
}
const F = "plenio.sheet_state/1", H = ["title", "style", "lyrics", "score", "artwork_prompt"];
function he() {
  return { schema: F, docs: {} };
}
function oe(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return he();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== F || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function We(e) {
  const t = {};
  for (const r of H) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: F, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ie(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ie(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = H.filter((r) => ie(e, r) !== "auto").map(
    (r) => `${r.replace("_", " ")} ${ie(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function ae(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function ct(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const o = e.bars[Math.max(0, n - 1)], i = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: ae(o?.[0] ?? 0), end: ae(i?.[1] ?? e.duration_s) };
  }) : [];
}
function W(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((o) => o.replace(/\s+$/, ""));
  let n = 0, r = t.length;
  for (; n < r && !t[n]; ) n++;
  for (; r > n && !t[r - 1]; ) r--;
  return t.slice(n, r).join(`
`);
}
function Ve(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function ut(e, t, n) {
  return n.map((r) => ({ kind: r, text: Ve(e, t, r), intent: "keep" }));
}
function pt(e, t, n) {
  const r = { ...e.docs };
  for (const i of n) {
    const u = e.docs[i.kind], h = t?.docs[i.kind], s = W(i.text);
    if (i.intent === "auto")
      delete r[i.kind];
    else if (i.intent === "manual")
      r[i.kind] = { state: "manual", text: s };
    else if (i.intent === "rebase")
      h?.upstream_sha256 ? r[i.kind] = { state: "edited", text: s, base_sha256: h.upstream_sha256 } : r[i.kind] = { state: "manual", text: s };
    else if (u)
      W(u.text) !== s && (r[i.kind] = { ...u, text: s });
    else {
      const f = W(h?.upstream ?? "");
      if (s === f) continue;
      r[i.kind] = h?.upstream_sha256 ? { state: "edited", text: s, base_sha256: h.upstream_sha256 } : { state: "manual", text: s };
    }
  }
  const o = { ...he(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function dt(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Ye(e, t) {
  return H.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function ft(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const ge = "PLENIO_SHEET_STATE";
let U = null;
function Qe(e) {
  U = e;
}
const Ue = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const i = document.createElement("span");
  i.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", o.append(u, i);
  const h = () => {
    const f = se(String(e.id)), x = f ? ` · ${f.status}` : "";
    i.textContent = Ie(oe(r)) + x;
  }, s = e.addDOMWidget(t, ge, o, {
    getValue: () => r,
    setValue: (f) => {
      r = typeof f == "string" ? f : "", h();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (f) => {
    f.stopPropagation();
    const x = oe(r);
    x === null && (i.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const S = se(String(e.id)), v = (e.inputs ?? []).filter((w) => w.link != null).map((w) => w.name), _ = x ?? { schema: "plenio.sheet_state/1", docs: {} }, y = S?.owned ?? Ye(v, _), $ = String(e.widgets?.find((w) => w.name === "review")?.value ?? "continue"), { openSheetDialog: D } = await import("./open-B9pAvrwh.mjs");
    if (!U) throw new Error("Plenio: API not initialised");
    D({
      title: e.title || "Song Sheet",
      state: _,
      payload: S,
      asrNote: je(S?.docs.lyrics?.upstream_sha256),
      owned: y.length ? y : [...H],
      review: $,
      fetcher: U,
      onApply: (w) => {
        s.value = We(w), e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Be((f) => {
    f === String(e.id) && h();
  }), h(), { widget: s };
}, Je = `
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
`;
function Xe() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Je, document.head.append(e);
}
function J(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function I(e) {
  return J(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Fe(e) {
  const t = [];
  let n = !1, r = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const i of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      i.startsWith("```") ? (t.push(`<pre><code>${J(r.join(`
`))}</code></pre>`), r = null) : r.push(i);
      continue;
    }
    if (i.startsWith("```")) {
      o(), r = [];
      continue;
    }
    const u = /^(#{1,4})\s+(.*)$/.exec(i);
    if (u) {
      o();
      const s = Math.min(u[1].length + 2, 6);
      t.push(`<h${s}>${I(u[2])}</h${s}>`);
      continue;
    }
    const h = /^\s*[-*]\s+(.*)$/.exec(i);
    if (h) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${I(h[1])}</li>`);
      continue;
    }
    o(), i.trim() && t.push(`<p>${I(i)}</p>`);
  }
  return o(), r !== null && t.push(`<pre><code>${J(r.join(`
`))}</code></pre>`), t.join("");
}
const Ge = "plenio_summary", le = "plenio_summary";
function Ke(e) {
  const t = e.widgets?.find((o) => o.name === le);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const r = e.addDOMWidget(le, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return r.serialize = !1, n;
}
function Ze(e) {
  e.prototype.onExecuted = O(e.prototype.onExecuted, function(t) {
    const n = t?.[Ge], r = n?.[n.length - 1];
    if (!r?.markdown) return;
    const o = Ke(this);
    o.dataset.status = r.status ?? "", o.innerHTML = Fe(r.markdown), this.setDirtyCanvas?.(!0, !0);
  });
}
const et = "Plenio.Core", X = be;
Qe(X);
ve.registerExtension({
  name: et,
  getCustomWidgets: () => ({ [ge]: Ue }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ze(e);
    const n = ze(t.input);
    if (n.size) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const i = _e(o), u = r?.call(this, o);
        return ke(this, i, n), u;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = O(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) Te(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, De(this, X));
      }, e.prototype.onExecuted = O(e.prototype.onExecuted, function(i) {
        r.get(this)?.showExecuted(i);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = O(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, i = o?.[o.length - 1];
      i && re(String(this.id), i);
    }));
  },
  setup() {
    Xe(), X.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && re(String(t.node_id), t);
    });
  }
});
export {
  et as E,
  ce as P,
  at as a,
  ot as b,
  ct as c,
  We as d,
  W as e,
  st as g,
  pt as n,
  rt as r,
  ut as s,
  it as t,
  ft as u,
  lt as v,
  dt as w
};
