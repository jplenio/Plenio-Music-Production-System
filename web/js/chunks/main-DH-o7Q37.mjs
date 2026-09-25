import { api as we } from "../../../../scripts/api.js";
import { app as be } from "../../../../scripts/app.js";
function O(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const xe = "COMFY_DYNAMICCOMBO_V3";
function ve(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function _e(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Ee(e, t) {
  const n = _e(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, o) => r.value === t[o]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function Se(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function qe(e, t, n) {
  if (!t || !e.widgets || Ee(e, t)) return !1;
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
    if (n.has(i.name) && !Se(i, u)) return !0;
    i.value !== u && (i.value = u);
  }
  return !0;
}
function ke(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === xe && t.add(r);
  return t;
}
class le extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function $(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), o = await r.json();
  if (!r.ok) {
    const i = o?.error ?? {};
    throw new le(i.message ?? `Request failed (${r.status})`, i.hint ?? null);
  }
  return o;
}
function nt(e, t) {
  return $(e, "/plenio/sheet/resolve", t);
}
async function rt(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function st(e, t) {
  return $(e, "/plenio/score/analyze", { abc: t });
}
function ot(e, t, n) {
  return $(e, "/plenio/score/transform", { abc: t, operation: n });
}
function it(e, t) {
  return $(e, "/plenio/lyrics/analyze", t);
}
function at(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Ae(e, t, n, r = 200) {
  return $(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
async function ze(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new le(`Request failed (${t.status})`);
  return await t.json();
}
const ce = "plenio.eq/1", Me = 8, _ = 20, $e = 2e4, R = 12, q = 15, ue = ["peak", "low_shelf", "high_shelf"];
function I() {
  return { schema: ce, preamp_db: 0, bands: [] };
}
function Ne(e) {
  if (typeof e != "string" || !e.trim()) return I();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: ce,
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
function Oe(e) {
  return JSON.stringify(e);
}
const k = (e, t) => Number(e.toFixed(t));
function b(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function C(e, t) {
  return Math.log(b(t, _, e.maxHz) / _) / Math.log(e.maxHz / _) * e.width;
}
function F(e, t) {
  return _ * (e.maxHz / _) ** b(t / e.width, 0, 1);
}
function L(e, t) {
  return (1 - (b(t, -q, q) + q) / (2 * q)) * e.height;
}
function G(e, t) {
  return (1 - b(t / e.height, 0, 1)) * 2 * q - q;
}
function Ce(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${C(e, r).toFixed(1)},${L(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function pe(e) {
  return Math.min($e, 0.45 * e);
}
function Le(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Re(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Me) return null;
  const o = {
    id: Le(e),
    enabled: !0,
    type: "peak",
    frequency_hz: k(b(t, _, pe(r)), 1),
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
        frequency_hz: k(b(n, _, pe(o)), 1),
        gain_db: ue.includes(i.type) ? k(b(r, -R, R), 1) : i.gain_db
      }
    )
  };
}
function B(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: k(b(r.q * n, 0.2, 10), 3) } : r)
  };
}
function K(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Z(e) {
  const t = e.frequency_hz >= 1e3 ? `${k(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = ue.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
const He = "http://www.w3.org/2000/svg", ee = "plenio_eq_curve", g = { width: 360, height: 150, maxHz: 2e4 };
let T = null;
function M(e, t) {
  const n = document.createElementNS(He, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function V(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function te(e) {
  return String(V(e, "mode")?.value ?? "flat");
}
function Pe(e, t) {
  const n = document.createElement("div");
  n.className = "plenio-eq";
  const r = document.createElement("div");
  r.className = "plenio-eq-tools";
  const o = document.createElement("select");
  o.setAttribute("aria-label", "EQ preset");
  const i = document.createElement("span");
  i.className = "plenio-eq-info", i.setAttribute("aria-live", "polite"), r.append(o, i);
  const u = M("svg", { viewBox: `0 0 ${g.width} ${g.height}`, class: "plenio-eq-plot", role: "img" });
  u.setAttribute("aria-label", "EQ response curve"), n.append(r, u), e.addDOMWidget(ee, ee, n, { serialize: !1, getValue: () => "", setValue: () => {
  }, getMinHeight: () => 200 });
  let s = { sampleRate: 48e3, frequencies: [], response: [], settings: I(), readonly: !0, note: "" }, f = null, h = 0, x;
  const E = () => V(e, "mode.bands");
  function v(l) {
    const c = E();
    if (!c) return;
    const a = Oe(l);
    c.value = a, c.callback?.(a), s = { ...s, settings: l }, y(), S(0);
  }
  async function S(l = 120) {
    clearTimeout(x), x = setTimeout(async () => {
      const c = te(e);
      if (c !== "manual") {
        s = c === "flat" ? { ...s, settings: I(), response: s.frequencies.map(() => 0), readonly: !0, note: "flat: no change" } : { ...s, readonly: !0, note: s.note || "the applied proposal appears here after a run" }, y();
        return;
      }
      const a = Ne(E()?.value);
      if (!a) {
        s = { ...s, readonly: !0, note: "the bands are not valid JSON" }, y();
        return;
      }
      const p = ++h;
      try {
        const d = await Ae(t, a, s.sampleRate);
        if (p !== h) return;
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
      u.append(M("line", { x1: 0, x2: g.width, y1: L(l, a), y2: L(l, a), class: a ? "grid" : "grid zero" }));
    for (const a of [100, 1e3, 1e4])
      u.append(M("line", { x1: C(l, a), x2: C(l, a), y1: 0, y2: g.height, class: "grid" }));
    if (s.frequencies.length && u.append(M("path", { d: Ce(l, s.frequencies, s.response), class: "curve" })), !s.readonly)
      for (const a of s.settings.bands) {
        const p = M("circle", {
          cx: C(l, a.frequency_hz),
          cy: L(l, ["peak", "low_shelf", "high_shelf"].includes(a.type) ? a.gain_db : 0),
          r: a.id === f ? 7 : 5.5,
          class: a.id === f ? "handle selected" : "handle",
          tabindex: 0
        });
        p.setAttribute("aria-label", Z(a)), p.addEventListener("pointerdown", (d) => P(d, a.id, l)), p.addEventListener("focus", () => A(a.id)), p.addEventListener("keydown", (d) => D(d, a.id)), p.addEventListener("wheel", (d) => {
          d.preventDefault(), v(B(s.settings, a.id, d.deltaY < 0 ? 1.15 : 1 / 1.15));
        }), p.addEventListener("contextmenu", (d) => {
          d.preventDefault(), v(K(s.settings, a.id));
        }), u.append(p);
      }
    const c = s.settings.bands.find((a) => a.id === f);
    i.textContent = s.note || (c ? Z(c) : s.readonly ? `${s.settings.bands.length} band(s)` : "double-click to add a band; drag, wheel = Q, right-click = remove"), o.disabled = s.readonly, e.setDirtyCanvas?.(!0, !0);
  }
  function A(l) {
    f = l, y();
  }
  function P(l, c, a) {
    l.preventDefault(), l.stopPropagation(), A(c);
    const p = u.getBoundingClientRect(), d = (N) => {
      const ge = (N.clientX - p.left) / p.width * g.width, ye = (N.clientY - p.top) / p.height * g.height;
      s = { ...s, settings: z(s.settings, c, F(a, ge), G(a, ye), s.sampleRate) }, y();
    }, m = () => {
      window.removeEventListener("pointermove", d), window.removeEventListener("pointerup", m), v(s.settings);
    };
    window.addEventListener("pointermove", d), window.addEventListener("pointerup", m);
  }
  function D(l, c) {
    const a = s.settings.bands.find((N) => N.id === c);
    if (!a) return;
    const p = l.shiftKey ? 0.1 : 0.5, d = l.shiftKey ? 1.01 : 1.06;
    let m = null;
    l.key === "ArrowUp" ? m = z(s.settings, c, a.frequency_hz, a.gain_db + p, s.sampleRate) : l.key === "ArrowDown" ? m = z(s.settings, c, a.frequency_hz, a.gain_db - p, s.sampleRate) : l.key === "ArrowRight" ? m = z(s.settings, c, a.frequency_hz * d, a.gain_db, s.sampleRate) : l.key === "ArrowLeft" ? m = z(s.settings, c, a.frequency_hz / d, a.gain_db, s.sampleRate) : l.key === "+" ? m = B(s.settings, c, 1.15) : l.key === "-" ? m = B(s.settings, c, 1 / 1.15) : (l.key === "Delete" || l.key === "Backspace") && (m = K(s.settings, c)), m && (l.preventDefault(), v(m));
  }
  u.addEventListener("dblclick", (l) => {
    if (s.readonly) return;
    const c = u.getBoundingClientRect(), a = { ...g, maxHz: Math.min(g.maxHz, s.sampleRate / 2) }, p = (l.clientX - c.left) / c.width * g.width, d = (l.clientY - c.top) / c.height * g.height, m = Re(s.settings, F(a, p), G(a, d), s.sampleRate);
    m ? (f = m.bands[m.bands.length - 1].id, v(m)) : (s = { ...s, note: "the EQ has at most 8 bands" }, y());
  }), o.append(new Option("preset…", "")), T ??= ze(t).then((l) => l.manual).catch(() => []), T.then((l) => {
    for (const c of l) o.append(new Option(c.name, c.name));
  }), o.addEventListener("change", async () => {
    const l = (await T)?.find((c) => c.name === o.value);
    o.value = "", l && v({ ...l.settings, bands: l.settings.bands.slice(0, 8) });
  });
  const w = (l) => {
    const c = V(e, l);
    if (!c) return;
    const a = c.callback;
    c.callback = (p) => {
      a?.(p), setTimeout(() => {
        w("mode.bands"), S();
      });
    };
  };
  return w("mode"), w("mode.bands"), S(0), {
    showExecuted(l) {
      const c = l?.plenio_eq, a = c?.[c.length - 1];
      if (!a) return;
      const p = te(e) === "manual";
      s = {
        sampleRate: a.sample_rate,
        frequencies: a.frequency_hz,
        response: a.response_db,
        settings: a.settings,
        readonly: !p,
        note: p ? "" : `applied: ${a.settings.bands.length} band(s)`
      }, p ? S(0) : y();
    }
  };
}
const de = /* @__PURE__ */ new Map(), Y = /* @__PURE__ */ new Set();
function ne(e, t) {
  de.set(e, t);
  for (const n of Y) n(e);
}
function re(e) {
  return de.get(e) ?? null;
}
function De(e) {
  return Y.add(e), () => Y.delete(e);
}
const fe = /* @__PURE__ */ new Map();
function Be(e) {
  e?.draft_sha256 && fe.set(e.draft_sha256, e);
}
function Te(e) {
  return e ? fe.get(e) ?? null : null;
}
const X = "plenio.sheet_state/1", H = ["title", "style", "lyrics", "score", "artwork_prompt"];
function me() {
  return { schema: X, docs: {} };
}
function se(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return me();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== X || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function je(e) {
  const t = {};
  for (const r of H) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: X, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function oe(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function We(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = H.filter((r) => oe(e, r) !== "auto").map(
    (r) => `${r.replace("_", " ")} ${oe(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function ie(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function lt(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const o = e.bars[Math.max(0, n - 1)], i = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: ie(o?.[0] ?? 0), end: ie(i?.[1] ?? e.duration_s) };
  }) : [];
}
function j(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((o) => o.replace(/\s+$/, ""));
  let n = 0, r = t.length;
  for (; n < r && !t[n]; ) n++;
  for (; r > n && !t[r - 1]; ) r--;
  return t.slice(n, r).join(`
`);
}
function Ie(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function ct(e, t, n) {
  return n.map((r) => ({ kind: r, text: Ie(e, t, r), intent: "keep" }));
}
function ut(e, t, n) {
  const r = { ...e.docs };
  for (const i of n) {
    const u = e.docs[i.kind], s = t?.docs[i.kind], f = j(i.text);
    if (i.intent === "auto")
      delete r[i.kind];
    else if (i.intent === "manual")
      r[i.kind] = { state: "manual", text: f };
    else if (i.intent === "rebase")
      s?.upstream_sha256 ? r[i.kind] = { state: "edited", text: f, base_sha256: s.upstream_sha256 } : r[i.kind] = { state: "manual", text: f };
    else if (u)
      j(u.text) !== f && (r[i.kind] = { ...u, text: f });
    else {
      const h = j(s?.upstream ?? "");
      if (f === h) continue;
      r[i.kind] = s?.upstream_sha256 ? { state: "edited", text: f, base_sha256: s.upstream_sha256 } : { state: "manual", text: f };
    }
  }
  const o = { ...me(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function pt(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Ve(e, t) {
  return H.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function dt(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const he = "PLENIO_SHEET_STATE";
let Q = null;
function Ye(e) {
  Q = e;
}
const Qe = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const i = document.createElement("span");
  i.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", o.append(u, i);
  const s = () => {
    const h = re(String(e.id)), x = h ? ` · ${h.status}` : "";
    i.textContent = We(se(r)) + x;
  }, f = e.addDOMWidget(t, he, o, {
    getValue: () => r,
    setValue: (h) => {
      r = typeof h == "string" ? h : "", s();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (h) => {
    h.stopPropagation();
    const x = se(r);
    x === null && (i.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const E = re(String(e.id)), S = (e.inputs ?? []).filter((w) => w.link != null).map((w) => w.name), y = x ?? { schema: "plenio.sheet_state/1", docs: {} }, A = E?.owned ?? Ve(S, y), P = String(e.widgets?.find((w) => w.name === "review")?.value ?? "continue"), { openSheetDialog: D } = await import("./open-DrbM_KpL.mjs");
    if (!Q) throw new Error("Plenio: API not initialised");
    D({
      title: e.title || "Song Sheet",
      state: y,
      payload: E,
      asrNote: Te(E?.docs.lyrics?.upstream_sha256),
      owned: A.length ? A : [...H],
      review: P,
      fetcher: Q,
      onApply: (w) => {
        f.value = je(w), e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), De((h) => {
    h === String(e.id) && s();
  }), s(), { widget: f };
}, Ue = `
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
function Je() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Ue, document.head.append(e);
}
function U(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function W(e) {
  return U(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Xe(e) {
  const t = [];
  let n = !1, r = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const i of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      i.startsWith("```") ? (t.push(`<pre><code>${U(r.join(`
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
      const f = Math.min(u[1].length + 2, 6);
      t.push(`<h${f}>${W(u[2])}</h${f}>`);
      continue;
    }
    const s = /^\s*[-*]\s+(.*)$/.exec(i);
    if (s) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${W(s[1])}</li>`);
      continue;
    }
    o(), i.trim() && t.push(`<p>${W(i)}</p>`);
  }
  return o(), r !== null && t.push(`<pre><code>${U(r.join(`
`))}</code></pre>`), t.join("");
}
const Fe = "plenio_summary", ae = "plenio_summary";
function Ge(e) {
  const t = e.widgets?.find((r) => r.name === ae);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  return n.className = "plenio-summary", e.addDOMWidget(ae, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } }), n;
}
function Ke(e) {
  e.prototype.onExecuted = O(e.prototype.onExecuted, function(t) {
    const n = t?.[Fe], r = n?.[n.length - 1];
    if (!r?.markdown) return;
    const o = Ge(this);
    o.dataset.status = r.status ?? "", o.innerHTML = Xe(r.markdown), this.setDirtyCanvas?.(!0, !0);
  });
}
const Ze = "Plenio.Core", J = we;
Ye(J);
be.registerExtension({
  name: Ze,
  getCustomWidgets: () => ({ [he]: Qe }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Ke(e);
    const n = ke(t.input);
    if (n.size) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const i = ve(o), u = r?.call(this, o);
        return qe(this, i, n), u;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = O(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) Be(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, Pe(this, J));
      }, e.prototype.onExecuted = O(e.prototype.onExecuted, function(i) {
        r.get(this)?.showExecuted(i);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = O(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, i = o?.[o.length - 1];
      i && ne(String(this.id), i);
    }));
  },
  setup() {
    Je(), J.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && ne(String(t.node_id), t);
    });
  }
});
export {
  Ze as E,
  le as P,
  it as a,
  st as b,
  lt as c,
  je as d,
  j as e,
  rt as g,
  ut as n,
  nt as r,
  ct as s,
  ot as t,
  dt as u,
  at as v,
  pt as w
};
