import { api as xe } from "../../../../scripts/api.js";
import { app as Ee } from "../../../../scripts/app.js";
function N(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const Se = "COMFY_DYNAMICCOMBO_V3";
function Ae(e) {
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
function Me(e, t, n) {
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
function $e(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [r, o] of Object.entries(n ?? {}))
      Array.isArray(o) && o[0] === Se && t.add(r);
  return t;
}
class pe extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function S(e, t, n) {
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
function at(e, t) {
  return S(e, "/plenio/sheet/resolve", t);
}
async function lt(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function ct(e, t) {
  return S(e, "/plenio/score/analyze", { abc: t });
}
function ut(e, t, n) {
  return S(e, "/plenio/score/transform", { abc: t, operation: n });
}
function pt(e, t) {
  return S(e, "/plenio/score/midi/export", t);
}
function dt(e, t) {
  return S(e, "/plenio/score/midi/import", t);
}
function ft(e, t) {
  return S(e, "/plenio/lyrics/analyze", t);
}
function mt(e, t) {
  const r = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(r) : `/api${r}`;
}
function Ne(e, t, n, r = 200) {
  return S(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: r });
}
async function Oe(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new pe(`Request failed (${t.status})`);
  return await t.json();
}
const de = "plenio.eq/1", Ce = 8, E = 20, Le = 2e4, P = 12, A = 15, fe = ["peak", "low_shelf", "high_shelf"];
function Y() {
  return { schema: de, preamp_db: 0, bands: [] };
}
function Pe(e) {
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
const k = (e, t) => Number(e.toFixed(t));
function w(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function C(e, t) {
  return Math.log(w(t, E, e.maxHz) / E) / Math.log(e.maxHz / E) * e.width;
}
function K(e, t) {
  return E * (e.maxHz / E) ** w(t / e.width, 0, 1);
}
function L(e, t) {
  return (1 - (w(t, -A, A) + A) / (2 * A)) * e.height;
}
function Z(e, t) {
  return (1 - w(t / e.height, 0, 1)) * 2 * A - A;
}
function He(e, t, n) {
  return t.map((r, o) => `${o ? "L" : "M"}${C(e, r).toFixed(1)},${L(e, n[o] ?? 0).toFixed(1)}`).join(" ");
}
function me(e) {
  return Math.min(Le, 0.45 * e);
}
function Be(e) {
  const t = new Set(e.bands.map((r) => r.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function je(e, t, n = 0, r = 48e3) {
  if (e.bands.length >= Ce) return null;
  const o = {
    id: Be(e),
    enabled: !0,
    type: "peak",
    frequency_hz: k(w(t, E, me(r)), 1),
    gain_db: k(w(n, -P, P), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, o] };
}
function M(e, t, n, r, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (i) => i.id !== t ? i : {
        ...i,
        frequency_hz: k(w(n, E, me(o)), 1),
        gain_db: fe.includes(i.type) ? k(w(r, -P, P), 1) : i.gain_db
      }
    )
  };
}
function D(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((r) => r.id === t ? { ...r, q: k(w(r.q * n, 0.2, 10), 3) } : r)
  };
}
function ee(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function te(e) {
  const t = e.frequency_hz >= 1e3 ? `${k(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = fe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${e.q}`;
}
const De = "http://www.w3.org/2000/svg", ne = "plenio_eq_curve", g = { width: 360, height: 150, maxHz: 2e4 };
let T = null;
function $(e, t) {
  const n = document.createElementNS(De, e);
  for (const [r, o] of Object.entries(t)) n.setAttribute(r, String(o));
  return n;
}
function Q(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function re(e) {
  return String(Q(e, "mode")?.value ?? "flat");
}
function Te(e, t) {
  const n = document.createElement("div");
  n.className = "plenio-eq";
  const r = document.createElement("div");
  r.className = "plenio-eq-tools";
  const o = document.createElement("select");
  o.setAttribute("aria-label", "EQ preset");
  const i = document.createElement("span");
  i.className = "plenio-eq-info", i.setAttribute("aria-live", "polite"), r.append(o, i);
  const u = $("svg", { viewBox: `0 0 ${g.width} ${g.height}`, class: "plenio-eq-plot", role: "img" });
  u.setAttribute("aria-label", "EQ response curve"), n.append(r, u);
  const h = e.addDOMWidget(ne, ne, n, { serialize: !1, getValue: () => "", setValue: () => {
  }, getMinHeight: () => 200 });
  h.serialize = !1;
  let s = { sampleRate: 48e3, frequencies: [], response: [], settings: Y(), readonly: !0, note: "" }, f = null, v = 0, _;
  const H = () => Q(e, "mode.bands");
  function b(l) {
    const c = H();
    if (!c) return;
    const a = Re(l);
    c.value = a, c.callback?.(a), s = { ...s, settings: l }, y(), x(0);
  }
  async function x(l = 120) {
    clearTimeout(_), _ = setTimeout(async () => {
      const c = re(e);
      if (c !== "manual") {
        s = c === "flat" ? { ...s, settings: Y(), response: s.frequencies.map(() => 0), readonly: !0, note: "flat: no change" } : { ...s, readonly: !0, note: s.note || "the applied proposal appears here after a run" }, y();
        return;
      }
      const a = Pe(H()?.value);
      if (!a) {
        s = { ...s, readonly: !0, note: "the bands are not valid JSON" }, y();
        return;
      }
      const p = ++v;
      try {
        const d = await Ne(t, a, s.sampleRate);
        if (p !== v) return;
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
      u.append($("line", { x1: 0, x2: g.width, y1: L(l, a), y2: L(l, a), class: a ? "grid" : "grid zero" }));
    for (const a of [100, 1e3, 1e4])
      u.append($("line", { x1: C(l, a), x2: C(l, a), y1: 0, y2: g.height, class: "grid" }));
    if (s.frequencies.length && u.append($("path", { d: He(l, s.frequencies, s.response), class: "curve" })), !s.readonly)
      for (const a of s.settings.bands) {
        const p = $("circle", {
          cx: C(l, a.frequency_hz),
          cy: L(l, ["peak", "low_shelf", "high_shelf"].includes(a.type) ? a.gain_db : 0),
          r: a.id === f ? 7 : 5.5,
          class: a.id === f ? "handle selected" : "handle",
          tabindex: 0
        });
        p.setAttribute("aria-label", te(a)), p.addEventListener("pointerdown", (d) => B(d, a.id, l)), p.addEventListener("focus", () => q(a.id)), p.addEventListener("keydown", (d) => j(d, a.id)), p.addEventListener("wheel", (d) => {
          d.preventDefault(), b(D(s.settings, a.id, d.deltaY < 0 ? 1.15 : 1 / 1.15));
        }), p.addEventListener("contextmenu", (d) => {
          d.preventDefault(), b(ee(s.settings, a.id));
        }), u.append(p);
      }
    const c = s.settings.bands.find((a) => a.id === f);
    i.textContent = s.note || (c ? te(c) : s.readonly ? `${s.settings.bands.length} band(s)` : "double-click to add a band; drag, wheel = Q, right-click = remove"), o.disabled = s.readonly, e.setDirtyCanvas?.(!0, !0);
  }
  function q(l) {
    f = l, y();
  }
  function B(l, c, a) {
    l.preventDefault(), l.stopPropagation(), q(c);
    const p = u.getBoundingClientRect(), d = (O) => {
      const ve = (O.clientX - p.left) / p.width * g.width, _e = (O.clientY - p.top) / p.height * g.height;
      s = { ...s, settings: M(s.settings, c, K(a, ve), Z(a, _e), s.sampleRate) }, y();
    }, m = () => {
      window.removeEventListener("pointermove", d), window.removeEventListener("pointerup", m), b(s.settings);
    };
    window.addEventListener("pointermove", d), window.addEventListener("pointerup", m);
  }
  function j(l, c) {
    const a = s.settings.bands.find((O) => O.id === c);
    if (!a) return;
    const p = l.shiftKey ? 0.1 : 0.5, d = l.shiftKey ? 1.01 : 1.06;
    let m = null;
    l.key === "ArrowUp" ? m = M(s.settings, c, a.frequency_hz, a.gain_db + p, s.sampleRate) : l.key === "ArrowDown" ? m = M(s.settings, c, a.frequency_hz, a.gain_db - p, s.sampleRate) : l.key === "ArrowRight" ? m = M(s.settings, c, a.frequency_hz * d, a.gain_db, s.sampleRate) : l.key === "ArrowLeft" ? m = M(s.settings, c, a.frequency_hz / d, a.gain_db, s.sampleRate) : l.key === "+" ? m = D(s.settings, c, 1.15) : l.key === "-" ? m = D(s.settings, c, 1 / 1.15) : (l.key === "Delete" || l.key === "Backspace") && (m = ee(s.settings, c)), m && (l.preventDefault(), b(m));
  }
  u.addEventListener("dblclick", (l) => {
    if (s.readonly) return;
    const c = u.getBoundingClientRect(), a = { ...g, maxHz: Math.min(g.maxHz, s.sampleRate / 2) }, p = (l.clientX - c.left) / c.width * g.width, d = (l.clientY - c.top) / c.height * g.height, m = je(s.settings, K(a, p), Z(a, d), s.sampleRate);
    m ? (f = m.bands[m.bands.length - 1].id, b(m)) : (s = { ...s, note: "the EQ has at most 8 bands" }, y());
  }), o.append(new Option("preset…", "")), T ??= Oe(t).then((l) => l.manual).catch(() => []), T.then((l) => {
    for (const c of l) o.append(new Option(c.name, c.name));
  }), o.addEventListener("change", async () => {
    const l = (await T)?.find((c) => c.name === o.value);
    o.value = "", l && b({ ...l.settings, bands: l.settings.bands.slice(0, 8) });
  });
  const z = (l) => {
    const c = Q(e, l);
    if (!c) return;
    const a = c.callback;
    c.callback = (p) => {
      a?.(p), setTimeout(() => {
        z("mode.bands"), x();
      });
    };
  };
  return z("mode"), z("mode.bands"), x(0), {
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
      }, p ? x(0) : y();
    }
  };
}
const he = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
};
function We(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const r = n?.[t];
    if (!Array.isArray(r)) continue;
    if (Array.isArray(r[0])) return r[0];
    const o = r[1]?.options;
    return Array.isArray(o) ? o : [];
  }
  return [];
}
function Ie(e, t) {
  const n = he[e.name];
  if (!n || !t) return t;
  const r = We(e, "mode"), o = t.widgets_values, i = t.widgets_values_named;
  let u = t;
  return Array.isArray(o) && o.length && !r.includes(o[0]) && (u = { ...u, widgets_values: [n, ...o] }), i && typeof i == "object" && !Array.isArray(i) && !("mode" in i) && (u = { ...u, widgets_values_named: { mode: n, ...i } }), u;
}
const ge = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
function oe(e, t) {
  ge.set(e, t);
  for (const n of G) n(e);
}
function se(e) {
  return ge.get(e) ?? null;
}
function Ve(e) {
  return G.add(e), () => G.delete(e);
}
const ye = /* @__PURE__ */ new Map();
function Ye(e) {
  e?.draft_sha256 && ye.set(e.draft_sha256, e);
}
function Qe(e) {
  return e ? ye.get(e) ?? null : null;
}
const X = "plenio.sheet_state/1", R = ["title", "style", "lyrics", "score", "artwork_prompt"];
function we() {
  return { schema: X, docs: {} };
}
function ie(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return we();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== X || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ge(e) {
  const t = {};
  for (const r of R) {
    const o = e.docs[r];
    o && (t[r] = o);
  }
  const n = { schema: X, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function ae(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Ue(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = R.filter((r) => ae(e, r) !== "auto").map(
    (r) => `${r.replace("_", " ")} ${ae(e, r)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function le(e) {
  const t = Math.floor(e / 60), n = Math.round(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
function ht(e) {
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
function Fe(e, t, n) {
  const r = e.docs[n];
  return r ? r.text : t?.docs[n]?.upstream ?? "";
}
function gt(e, t, n) {
  return n.map((r) => ({ kind: r, text: Fe(e, t, r), intent: "keep" }));
}
function yt(e, t, n) {
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
  const o = { ...we(), docs: r };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), o;
}
function wt(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Je(e, t) {
  return R.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function bt(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const be = "PLENIO_SHEET_STATE";
let U = null;
function Xe(e) {
  U = e;
}
const Ke = (e, t, n) => {
  let r = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const o = document.createElement("div");
  o.className = "plenio-sheet-state";
  const i = document.createElement("span");
  i.className = "plenio-sheet-summary";
  const u = document.createElement("button");
  u.className = "plenio-sheet-open", u.textContent = "Edit Song Sheet…", o.append(u, i);
  const h = () => {
    const f = se(String(e.id)), v = f ? ` · ${f.status}` : "";
    i.textContent = Ue(ie(r)) + v;
  }, s = e.addDOMWidget(t, be, o, {
    getValue: () => r,
    setValue: (f) => {
      r = typeof f == "string" ? f : "", h();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return u.addEventListener("click", async (f) => {
    f.stopPropagation();
    const v = ie(r);
    v === null && (i.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const _ = se(String(e.id)), b = (e.inputs ?? []).filter((c) => c.link != null).map((c) => c.name), x = v ?? { schema: "plenio.sheet_state/1", docs: {} }, y = _?.owned ?? Je(b, x), q = String(e.widgets?.find((c) => c.name === "review")?.value ?? "continue"), B = q === "as the brief says" ? _?.review ?? "continue" : q, { openSheetDialog: j } = await import("./open-Bfs9lurG.mjs"), { parseGuide: z, serializeGuide: l } = await import("./tracks-DEywwRcM.mjs");
    if (!U) throw new Error("Plenio: API not initialised");
    j({
      title: e.title || "Song Sheet",
      state: x,
      payload: _,
      asrNote: Qe(_?.docs.lyrics?.upstream_sha256),
      owned: y.length ? y : [...R],
      review: B,
      fetcher: U,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: z(e.properties?.plenio_guide),
      onApply: (c, a) => {
        s.value = Ge(c), e.properties = { ...e.properties ?? {}, plenio_guide: l(a) }, e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), Ve((f) => {
    f === String(e.id) && h();
  }), h(), { widget: s };
}, Ze = `
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
function et() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Ze, document.head.append(e);
}
function F(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function I(e) {
  return F(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function tt(e) {
  const t = [];
  let n = !1, r = null;
  const o = () => {
    n && (t.push("</ul>"), n = !1);
  };
  for (const i of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (r !== null) {
      i.startsWith("```") ? (t.push(`<pre><code>${F(r.join(`
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
  return o(), r !== null && t.push(`<pre><code>${F(r.join(`
`))}</code></pre>`), t.join("");
}
const V = "plenio_summary", ce = "plenio_summary";
function nt(e) {
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
  const n = nt(e);
  n.dataset.status = t.status ?? "", n.innerHTML = tt(t.markdown), e.setDirtyCanvas?.(!0, !0);
}
function rt(e) {
  e.prototype.onExecuted = N(e.prototype.onExecuted, function(t) {
    const n = t?.[V], r = n?.[n.length - 1];
    r?.markdown && (this.properties = this.properties ?? {}, this.properties[V] = { markdown: r.markdown, status: r.status ?? "" }, ue(this, r));
  }), e.prototype.onConfigure = N(e.prototype.onConfigure, function() {
    const t = this.properties?.[V];
    t?.markdown && ue(this, t);
  });
}
const ot = "Plenio.Core", J = xe;
Xe(J);
Ee.registerExtension({
  name: ot,
  getCustomWidgets: () => ({ [be]: Ke }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    rt(e);
    const n = $e(t.input);
    if (n.size || t.name in he) {
      const r = e.prototype.configure;
      e.prototype.configure = function(o) {
        const i = Ie(t, o), u = Ae(i), h = r?.call(this, i);
        return Me(this, u, n), h;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = N(e.prototype.onExecuted, function(r) {
      for (const o of r?.plenio_asr ?? []) Ye(o);
    })), t.name === "PlenioEQ") {
      const r = /* @__PURE__ */ new WeakMap(), o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), r.set(this, Te(this, J));
      }, e.prototype.onExecuted = N(e.prototype.onExecuted, function(i) {
        r.get(this)?.showExecuted(i);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = N(e.prototype.onExecuted, function(r) {
      const o = r?.plenio_sheet, i = o?.[o.length - 1];
      i && oe(String(this.id), i);
    }));
  },
  setup() {
    et(), J.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && oe(String(t.node_id), t);
    });
  }
});
export {
  ot as E,
  pe as P,
  ft as a,
  ct as b,
  ht as c,
  Ge as d,
  pt as e,
  W as f,
  lt as g,
  dt as i,
  yt as n,
  at as r,
  gt as s,
  ut as t,
  bt as u,
  mt as v,
  wt as w
};
