import { api as xe } from "../../../../scripts/api.js";
import { app as _e } from "../../../../scripts/app.js";
function M(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const Ee = "COMFY_DYNAMICCOMBO_V3";
function Se(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function ke(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function qe(e, t) {
  const n = ke(e);
  return Array.isArray(t) ? n.length === t.length && n.every((r, o) => r.value === t[o]) : n.every((r) => !(r.name in t) || r.value === t[r.name]);
}
function ze(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Ae(e, t, n) {
  if (!t || !e.widgets || qe(e, t)) return !1;
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
    if (n.has(i.name) && !ze(i, u)) return !0;
    i.value !== u && (i.value = u);
  }
  return !0;
}
function Me(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === Ee && t.add(r);
  return t;
}
class pe extends Error {
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
    throw new pe(i.message ?? `Request failed (${r.status})`, i.hint ?? null);
  }
  return o;
}
function st(e, t) {
  return $(e, "/plenio/sheet/resolve", t);
}
async function ot(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function it(e, t) {
  return $(e, "/plenio/score/analyze", { abc: t });
}
function at(e, t, n) {
  return $(e, "/plenio/score/transform", { abc: t, operation: n });
}
function lt(e, t) {
  return $(e, "/plenio/lyrics/analyze", t);
}
function ct(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function $e(e, t, n, r = 200) {
  return $(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
async function Ne(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new pe(`Request failed (${t.status})`);
  return await t.json();
}
const de = "plenio.eq/1", Oe = 8, E = 20, Ce = 2e4, R = 12, k = 15, fe = ["peak", "low_shelf", "high_shelf"];
function Y() {
  return { schema: de, preamp_db: 0, bands: [] };
}
function Le(e) {
  if (typeof e != "string" || !e.trim()) return Y();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: de,
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
function Re(e) {
  return JSON.stringify(e);
}
const q = (e, t) => Number(e.toFixed(t));
function b(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function C(e, t) {
  return Math.log(b(t, E, e.maxHz) / E) / Math.log(e.maxHz / E) * e.width;
}
function K(e, t) {
  return E * (e.maxHz / E) ** b(t / e.width, 0, 1);
}
function L(e, t) {
  return (1 - (b(t, -k, k) + k) / (2 * k)) * e.height;
}
function Z(e, t) {
  return (1 - b(t / e.height, 0, 1)) * 2 * k - k;
}
function He(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${C(e, r).toFixed(1)},${L(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function me(e) {
  return Math.min(Ce, 0.45 * e);
}
function Pe(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function De(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Oe) return null;
  const o = {
    id: Pe(e),
    enabled: !0,
    type: "peak",
    frequency_hz: q(b(t, E, me(r)), 1),
    gain_db: q(b(n, -R, R), 1),
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
        frequency_hz: q(b(n, E, me(o)), 1),
        gain_db: fe.includes(i.type) ? q(b(r, -R, R), 1) : i.gain_db
      }
    )
  };
}
function j(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: q(b(r.q * n, 0.2, 10), 3) } : r)
  };
}
function ee(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function te(e) {
  const t = e.frequency_hz >= 1e3 ? `${q(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = fe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
const Be = "http://www.w3.org/2000/svg", ne = "plenio_eq_curve", g = { width: 360, height: 150, maxHz: 2e4 };
let T = null;
function A(e, t) {
  const n = document.createElementNS(Be, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function Q(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function re(e) {
  return String(Q(e, "mode")?.value ?? "flat");
}
function je(e, t) {
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
  const h = e.addDOMWidget(ne, ne, n, { serialize: !1, getValue: () => "", setValue: () => {
  }, getMinHeight: () => 200 });
  h.serialize = !1;
  let s = { sampleRate: 48e3, frequencies: [], response: [], settings: Y(), readonly: !0, note: "" }, f = null, x = 0, S;
  const P = () => Q(e, "mode.bands");
  function v(l) {
    const c = P();
    if (!c) return;
    const a = Re(l);
    c.value = a, c.callback?.(a), s = { ...s, settings: l }, y(), _(0);
  }
  async function _(l = 120) {
    clearTimeout(S), S = setTimeout(async () => {
      const c = re(e);
      if (c !== "manual") {
        s = c === "flat" ? { ...s, settings: Y(), response: s.frequencies.map(() => 0), readonly: !0, note: "flat: no change" } : { ...s, readonly: !0, note: s.note || "the applied proposal appears here after a run" }, y();
        return;
      }
      const a = Le(P()?.value);
      if (!a) {
        s = { ...s, readonly: !0, note: "the bands are not valid JSON" }, y();
        return;
      }
      const p = ++x;
      try {
        const d = await $e(t, a, s.sampleRate);
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
    if (s.frequencies.length && u.append(A("path", { d: He(l, s.frequencies, s.response), class: "curve" })), !s.readonly)
      for (const a of s.settings.bands) {
        const p = A("circle", {
          cx: C(l, a.frequency_hz),
          cy: L(l, ["peak", "low_shelf", "high_shelf"].includes(a.type) ? a.gain_db : 0),
          r: a.id === f ? 7 : 5.5,
          class: a.id === f ? "handle selected" : "handle",
          tabindex: 0
        });
        p.setAttribute("aria-label", te(a)), p.addEventListener("pointerdown", (d) => D(d, a.id, l)), p.addEventListener("focus", () => N(a.id)), p.addEventListener("keydown", (d) => w(d, a.id)), p.addEventListener("wheel", (d) => {
          d.preventDefault(), v(j(s.settings, a.id, d.deltaY < 0 ? 1.15 : 1 / 1.15));
        }), p.addEventListener("contextmenu", (d) => {
          d.preventDefault(), v(ee(s.settings, a.id));
        }), u.append(p);
      }
    const c = s.settings.bands.find((a) => a.id === f);
    i.textContent = s.note || (c ? te(c) : s.readonly ? `${s.settings.bands.length} band(s)` : "double-click to add a band; drag, wheel = Q, right-click = remove"), o.disabled = s.readonly, e.setDirtyCanvas?.(!0, !0);
  }
  function N(l) {
    f = l, y();
  }
  function D(l, c, a) {
    l.preventDefault(), l.stopPropagation(), N(c);
    const p = u.getBoundingClientRect(), d = (O) => {
      const be = (O.clientX - p.left) / p.width * g.width, ve = (O.clientY - p.top) / p.height * g.height;
      s = { ...s, settings: z(s.settings, c, K(a, be), Z(a, ve), s.sampleRate) }, y();
    }, m = () => {
      window.removeEventListener("pointermove", d), window.removeEventListener("pointerup", m), v(s.settings);
    };
    window.addEventListener("pointermove", d), window.addEventListener("pointerup", m);
  }
  function w(l, c) {
    const a = s.settings.bands.find((O) => O.id === c);
    if (!a) return;
    const p = l.shiftKey ? 0.1 : 0.5, d = l.shiftKey ? 1.01 : 1.06;
    let m = null;
    l.key === "ArrowUp" ? m = z(s.settings, c, a.frequency_hz, a.gain_db + p, s.sampleRate) : l.key === "ArrowDown" ? m = z(s.settings, c, a.frequency_hz, a.gain_db - p, s.sampleRate) : l.key === "ArrowRight" ? m = z(s.settings, c, a.frequency_hz * d, a.gain_db, s.sampleRate) : l.key === "ArrowLeft" ? m = z(s.settings, c, a.frequency_hz / d, a.gain_db, s.sampleRate) : l.key === "+" ? m = j(s.settings, c, 1.15) : l.key === "-" ? m = j(s.settings, c, 1 / 1.15) : (l.key === "Delete" || l.key === "Backspace") && (m = ee(s.settings, c)), m && (l.preventDefault(), v(m));
  }
  u.addEventListener("dblclick", (l) => {
    if (s.readonly) return;
    const c = u.getBoundingClientRect(), a = { ...g, maxHz: Math.min(g.maxHz, s.sampleRate / 2) }, p = (l.clientX - c.left) / c.width * g.width, d = (l.clientY - c.top) / c.height * g.height, m = De(s.settings, K(a, p), Z(a, d), s.sampleRate);
    m ? (f = m.bands[m.bands.length - 1].id, v(m)) : (s = { ...s, note: "the EQ has at most 8 bands" }, y());
  }), o.append(new Option("preset…", "")), T ??= Ne(t).then((l) => l.manual).catch(() => []), T.then((l) => {
    for (const c of l) o.append(new Option(c.name, c.name));
  }), o.addEventListener("change", async () => {
    const l = (await T)?.find((c) => c.name === o.value);
    o.value = "", l && v({ ...l.settings, bands: l.settings.bands.slice(0, 8) });
  });
  const B = (l) => {
    const c = Q(e, l);
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
      const p = re(e) === "manual";
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
const he = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Set();
function se(e, t) {
  he.set(e, t);
  for (const n of U) n(e);
}
function oe(e) {
  return he.get(e) ?? null;
}
function Te(e) {
  return U.add(e), () => U.delete(e);
}
const ge = /* @__PURE__ */ new Map();
function We(e) {
  e?.draft_sha256 && ge.set(e.draft_sha256, e);
}
function Ie(e) {
  return e ? ge.get(e) ?? null : null;
}
const G = "plenio.sheet_state/1", H = ["title", "style", "lyrics", "score", "artwork_prompt"];
function ye() {
  return { schema: G, docs: {} };
}
function ie(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return ye();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== G || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ve(e) {
  const t = {};
  for (const r of H) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: G, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ae(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ye(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = H.filter((r) => ae(e, r) !== "auto").map(
    (r) => `${r.replace("_", " ")} ${ae(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function le(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function ut(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, r]) => {
    const o = e.bars[Math.max(0, n - 1)], i = e.bars[Math.min(e.bars.length - 1, n - 1 + r - 1)];
    return { label: t, bars: r, start: le(o?.[0] ?? 0), end: le(i?.[1] ?? e.duration_s) };
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
function Qe(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function pt(e, t, n) {
  return n.map((r) => ({ kind: r, text: Qe(e, t, r), intent: "keep" }));
}
function dt(e, t, n) {
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
  const o = { ...ye(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function ft(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Ue(e, t) {
  return H.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function mt(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const we = "PLENIO_SHEET_STATE";
let J = null;
function Je(e) {
  J = e;
}
const Xe = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const i = document.createElement("span");
  i.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", o.append(u, i);
  const h = () => {
    const f = oe(String(e.id)), x = f ? ` · ${f.status}` : "";
    i.textContent = Ye(ie(r)) + x;
  }, s = e.addDOMWidget(t, we, o, {
    getValue: () => r,
    setValue: (f) => {
      r = typeof f == "string" ? f : "", h();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (f) => {
    f.stopPropagation();
    const x = ie(r);
    x === null && (i.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const S = oe(String(e.id)), v = (e.inputs ?? []).filter((w) => w.link != null).map((w) => w.name), _ = x ?? { schema: "plenio.sheet_state/1", docs: {} }, y = S?.owned ?? Ue(v, _), N = String(e.widgets?.find((w) => w.name === "review")?.value ?? "continue"), { openSheetDialog: D } = await import("./open-EEV6IL3x.mjs");
    if (!J) throw new Error("Plenio: API not initialised");
    D({
      title: e.title || "Song Sheet",
      state: _,
      payload: S,
      asrNote: Ie(S?.docs.lyrics?.upstream_sha256),
      owned: y.length ? y : [...H],
      review: N,
      fetcher: J,
      onApply: (w) => {
        s.value = Ve(w), e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Te((f) => {
    f === String(e.id) && h();
  }), h(), { widget: s };
}, Fe = `
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
function Ge() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Fe, document.head.append(e);
}
function X(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function I(e) {
  return X(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Ke(e) {
  const t = [];
  let n = !1, r = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const i of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      i.startsWith("```") ? (t.push(`<pre><code>${X(r.join(`
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
  return o(), r !== null && t.push(`<pre><code>${X(r.join(`
`))}</code></pre>`), t.join("");
}
const V = "plenio_summary", ce = "plenio_summary";
function Ze(e) {
  const t = e.widgets?.find((o) => o.name === ce);
  if (t?.element) return t.element;
  const n = document.createElement("div");
  n.className = "plenio-summary";
  const r = e.addDOMWidget(ce, "plenio_summary", n, { serialize: !1, getValue: () => "", setValue: () => {
  } });
  return r.serialize = !1, n;
}
function ue(e, t) {
  if (!t.markdown) return;
  const n = Ze(e);
  n.dataset.status = t.status ?? "", n.innerHTML = Ke(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function et(e) {
  e.prototype.onExecuted = M(e.prototype.onExecuted, function(t) {
    const n = t?.[V], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[V] = { markdown: r.markdown, status: r.status ?? "" }, ue(this, r));
  }), e.prototype.onConfigure = M(e.prototype.onConfigure, function() {
    const t = this.properties?.[V];
    t?.markdown && ue(this, t);
  });
}
const tt = "Plenio.Core", F = xe;
Je(F);
_e.registerExtension({
  name: tt,
  getCustomWidgets: () => ({ [we]: Xe }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    et(e);
    const n = Me(t.input);
    if (n.size) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const i = Se(o), u = r?.call(this, o);
        return Ae(this, i, n), u;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = M(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) We(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, je(this, F));
      }, e.prototype.onExecuted = M(e.prototype.onExecuted, function(i) {
        r.get(this)?.showExecuted(i);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = M(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, i = o?.[o.length - 1];
      i && se(String(this.id), i);
    }));
  },
  setup() {
    Ge(), F.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && se(String(t.node_id), t);
    });
  }
});
export {
  tt as E,
  pe as P,
  lt as a,
  it as b,
  ut as c,
  Ve as d,
  W as e,
  ot as g,
  dt as n,
  st as r,
  pt as s,
  at as t,
  mt as u,
  ct as v,
  ft as w
};
