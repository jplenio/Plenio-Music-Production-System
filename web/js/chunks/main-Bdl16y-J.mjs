import { api as Co } from "../../../../scripts/api.js";
import { app as Ln } from "../../../../scripts/app.js";
class ue extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function oe(e, t, n) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), s = await o.json();
  if (!o.ok) {
    const r = s?.error ?? {};
    throw new ue(r.message ?? `Request failed (${o.status})`, r.hint ?? null);
  }
  return s;
}
function Io(e, t) {
  return oe(e, "/plenio/sheet/resolve", t);
}
async function fi(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function Ot(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function pi(e, t, n, o) {
  return oe(e, "/plenio/score/analyze", Ot({ abc: t }, n, o));
}
function hi(e, t, n, o, s) {
  return oe(e, "/plenio/score/transform", Ot({ abc: t, operation: n }, o, s));
}
function mi(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return oe(e, "/plenio/score/musicxml/export", Ot(s, n, o));
}
function gi(e, t) {
  return oe(e, "/plenio/score/midi/export", t);
}
function bi(e, t) {
  return oe(e, "/plenio/score/midi/import", t);
}
function yi(e, t) {
  return oe(e, "/plenio/lyrics/analyze", t);
}
function wi(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function Vt(e, t, n, o = 200) {
  return oe(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function Oo(e, t) {
  return oe(e, "/plenio/brief/fields", t);
}
async function zo(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new ue(`Request failed (${t.status})`);
  return await t.json();
}
async function vi(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new ue(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function Ro(e, t) {
  return oe(e, "/plenio/records/continue", t);
}
function ce(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const He = [
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
], Do = ["length", "vocals", "melody"], zt = {
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
}, Po = "custom";
function Nn(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Po;
}
function Te(e, t) {
  const n = zt[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function Bo(e) {
  const t = {};
  for (const n of [...He, ...Do]) {
    const o = Te(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function Ho(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
function Xt(e, t) {
  const n = [];
  for (const o of t.fills) {
    if (!He.includes(o.field)) continue;
    const s = Te(e, o.field);
    s && !String(s.value ?? "").trim() && o.value && n.push({ field: o.field, value: o.value });
  }
  return n;
}
function Ut(e) {
  const t = [];
  for (const n of He) {
    const o = Te(e, n);
    o && String(o.value ?? "").trim() && t.push(o);
  }
  return t;
}
function Mt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function jo(e, t) {
  return !t || !e || e.template === "none" ? null : e.fills.length ? `Template fills: ${e.fills.map((o) => `${o.field} (${Go(o.value)})`).join(", ")}` : "The template fills nothing: every text field has your value.";
}
function Wo(e) {
  const t = e ? Mt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Fo(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Go(e, t = 44) {
  const n = e.replace(/\s+/g, " ").trim();
  return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Yt(e, t) {
  for (const n of t) {
    const o = Te(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Vo(e, t) {
  for (const n of t)
    n.value = "", n.callback?.("");
  e.setDirtyCanvas?.(!0, !0);
}
function Tn(e) {
  const t = [];
  for (const n of He) {
    const o = Te(e, n);
    !o || !Nn(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Jt = "plenio_brief_template", Xo = 400;
function Uo(e, t) {
  let n = null, o = !1, s = null, r;
  const i = document.createElement("div");
  i.className = "plenio-brief-template";
  const a = document.createElement("div");
  a.className = "line";
  const l = document.createElement("div");
  l.className = "hint";
  const f = document.createElement("div");
  f.className = "actions", i.append(a, l, f);
  const p = (b, m, y) => {
    const w = document.createElement("button");
    return w.textContent = b, w.title = m, w.addEventListener("click", (q) => {
      q.stopPropagation(), y();
    }), f.append(w), w;
  }, g = p("Copy template text", "Fill every empty text field with the template’s text", () => {
    n && (Yt(e, Xt(e, n).map((b) => ({ field: b.field, value: b.value }))), S());
  }), k = p("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Yt(e, Mt(n)), S());
  }), _ = p("Reset all to template", "Clear every text field you typed into (they fall back to the template)", () => {
    const b = Ut(e);
    b.length && window.confirm(`Clear ${b.length} text field(s)? The template's values apply again.`) && (Vo(e, b), S());
  }), R = p("↻", "Ask again what the template fills", () => {
    H();
  }), S = () => {
    const b = jo(n, o);
    a.textContent = s ?? b ?? "The template fills nothing: every text field has your value.", a.dataset.state = s ? "error" : o && n ? "ok" : "empty";
    const m = Wo(n), y = Fo(n);
    l.textContent = [m, y].filter(Boolean).join(" · "), l.style.display = l.textContent ? "" : "none", f.style.display = o && n && n.template !== "none" ? "" : "none", g.disabled = !n || !Xt(e, n).length, k.disabled = !n || !Mt(n).length, _.disabled = !Ut(e).length, R.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, E = /* @__PURE__ */ new WeakSet(), j = () => {
    for (const b of ["template", ...Object.keys(zt)]) {
      const m = b === "template" ? e.widgets?.find((y) => y.name === "template") : Te(e, b);
      !m || E.has(m) || (E.add(m), m.callback = ce(m.callback, () => {
        j(), H();
      }));
    }
  }, u = async () => {
    j();
    const b = String(e.widgets?.find((m) => m.name === "template")?.value ?? "none");
    try {
      n = await Oo(t, { fields: Bo(e), template: b, kind: Ho(e) }), s = null;
    } catch (m) {
      n = null, s = `The template fields could not be read: ${m instanceof Error ? m.message : String(m)}`;
    }
    o = !0, S();
  };
  function H() {
    clearTimeout(r), r = setTimeout(() => {
      u();
    }, Xo);
  }
  j();
  const A = e.addDOMWidget(Jt, Jt, i, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  });
  return A.serialize = !1, Tn(e), S(), H(), {
    widget: A,
    refresh: H,
    answer: () => n,
    dispose: () => clearTimeout(r)
  };
}
const Yo = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Jo(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, Uo(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), Tn(this), n.get(this)?.refresh();
  };
}
const Rt = "plenio.sheet_state/1", je = ["title", "style", "lyrics", "score", "artwork_prompt"];
function ct() {
  return { schema: Rt, docs: {} };
}
function _e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return ct();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Rt || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Re(e) {
  const t = {};
  for (const o of je) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: Rt, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function mt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Qo(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = je.filter((o) => mt(e, o) !== "auto").map(
    (o) => o === "lyrics" && mt(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${mt(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function xi(e) {
  const t = e.harmony?.after;
  if (!t) return "";
  const n = (s) => `${Math.round(s * 100)} %`, o = [
    `melody ${n(t.melody_on_chord)} on chord tones`,
    `${t.accented_avoid} accented clash${t.accented_avoid === 1 ? "" : "es"} with a chord`,
    `${t.clashes} between voice and line`,
    `chords ${n(t.chords_in_key)} in the key`
  ];
  return `Harmony check (${e.harmony?.genre ?? "pop"}): ${o.join(" · ")}`;
}
const _i = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function Si(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function ki(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function Qt(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function Ei(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: Qt(s?.[0] ?? 0), end: Qt(r?.[1] ?? e.duration_s) };
  }) : [];
}
function xe(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, o = t.length;
  for (; n < o && !t[n]; ) n++;
  for (; o > n && !t[o - 1]; ) o--;
  return t.slice(n, o).join(`
`);
}
function Ko(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function Mi(e, t, n) {
  return n.map((o) => ({ kind: o, text: Ko(e, t, o), intent: "keep" }));
}
function qn(e, t, n) {
  const o = { ...e.docs };
  for (const r of n) {
    const i = e.docs[r.kind], a = t?.docs[r.kind], l = xe(r.text);
    if (r.intent === "auto")
      delete o[r.kind];
    else if (r.intent === "manual")
      o[r.kind] = { state: "manual", text: l };
    else if (r.intent === "rebase")
      a?.upstream_sha256 ? o[r.kind] = { state: "edited", text: l, base_sha256: a.upstream_sha256 } : o[r.kind] = { state: "manual", text: l };
    else if (i)
      xe(i.text) !== l && (o[r.kind] = { ...i, text: l });
    else {
      const f = xe(a?.upstream ?? "");
      if (l === f) continue;
      o[r.kind] = a?.upstream_sha256 ? { state: "edited", text: l, base_sha256: a.upstream_sha256 } : { state: "manual", text: l };
    }
  }
  const s = { ...ct(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function Zo(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Cn(e, t) {
  return je.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function es(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const ts = "PlenioSongSheet";
function In(e) {
  return e.nodes ?? e._nodes ?? [];
}
function ns(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? In(e).find((o) => String(o.id) === t) ?? null;
}
function gt(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = ns(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function os(e, t) {
  const n = [], o = Object.keys(t).sort((s, r) => s.split(".").length - r.split(".").length);
  for (const s of o) {
    const r = e.widgets?.find((a) => a.name === s);
    if (!r) {
      n.push(s);
      continue;
    }
    const i = t[s];
    r.value !== i && (r.value = i, r.callback?.(i));
  }
  return n;
}
function ss(e, t) {
  const n = { values: 0, missing: [], sheets: 0, activated: 0 };
  for (const o of t.activate) {
    const s = gt(e, o);
    s && s.mode !== 0 && (s.mode = 0, n.activated++);
  }
  for (const [o, s] of Object.entries(t.values)) {
    const r = gt(e, o);
    if (!r) {
      n.missing.push(...Object.keys(s).map((a) => `${o}: ${a}`));
      continue;
    }
    const i = os(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = gt(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function rs(e, t) {
  let n = 0;
  for (const o of In(e)) {
    if (o.type !== ts) continue;
    const s = o.widgets?.find((g) => g.name === "sheet_state");
    if (!s) continue;
    const r = _e(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((g) => g.link != null).map((g) => g.name), a = Cn(i, r), l = (a.length ? a : [...je]).filter((g) => !!t[g]);
    if (!l.length) continue;
    const f = { ...r.docs };
    for (const g of l) f[g] = { state: "manual", text: t[g] };
    const p = Re({ ...r, docs: f, review: void 0 });
    s.value = p, s.callback?.(p), n++;
  }
  return n;
}
function is(e, t) {
  return (e.split(/[\\/]/).pop() ?? "").replace(/\.plenio\.json$/i, "").replace(/\.json$/i, "") || t || "Plenio song";
}
function bt(e, t) {
  const n = [e.plenio && `Plenio ${e.plenio}`, e.created.slice(0, 10)].filter(Boolean).join(", "), o = t?.sheets ? " Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again." : "";
  if (e.from === "record") return `"${e.title}" opened in the workflow it was made with (${n}).${o}`;
  if (e.from === "template") {
    const s = e.unplaced.length ? ` ${e.unplaced.length} node(s) of the song have no place in today's template: ${e.unplaced.join(", ")}.` : "";
    return `"${e.title}" (${n}) opened in today's template "${e.template}" with the song's settings.${o}${s}`;
  }
  return `The workflow "${e.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`;
}
const $t = "Plenio was updated while this page was open: reload the page (F5).";
function as(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function ls(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function Dt(e, t) {
  const n = as(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? ls(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function Pt(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Oe(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${$t} ${n}` : $t) : o;
  }
}
const Kt = "Plenio.ContinueSong", cs = "plenio.record/1";
function At(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function On(e, t) {
  const n = await Ro(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, is("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = ss(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), At(e, "success", "Song opened", bt(n, i));
    return;
  }
  const o = e.app.graph, s = o ? rs(o, n.documents) : 0;
  if (!s)
    throw new ue(
      bt(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  At(e, "success", "Song texts taken", `${bt(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function us(e) {
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === cs ? t : null;
  } catch {
    return null;
  }
}
function ds(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function fs(e, t = window) {
  const n = (o) => {
    const s = ds(o);
    s && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      const r = await us(s);
      if (!r) throw new ue(`${s.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await On(e, { record: r, name: s.name });
    })().catch((r) => {
      const i = r instanceof ue && r.hint ? `${r.message} ${r.hint}` : String(r instanceof Error ? r.message : r);
      At(e, "error", "Song not opened", i, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function ps(e) {
  const t = () => Dt(import.meta.url, Pt), { openContinueDialog: n } = await Oe(() => import("./openContinue-BXxEHOox.mjs"), t);
  n(e.fetcher, (o) => On(e, o));
}
const hs = "COMFY_DYNAMICCOMBO_V3";
function ms(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function gs(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function bs(e, t) {
  const n = gs(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function ys(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ws(e, t, n) {
  if (!t || !e.widgets || bs(e, t)) return !1;
  let o = 0;
  for (let s = 0; s < e.widgets.length; s++) {
    const r = e.widgets[s];
    if (r.serialize === !1) continue;
    let i;
    if (Array.isArray(t)) {
      if (o >= t.length) break;
      i = t[o++];
    } else if (r.name in t)
      i = t[r.name];
    else
      continue;
    if (n.has(r.name) && !ys(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function vs(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === hs && t.add(o);
  return t;
}
const zn = "plenio.eq/1", nt = 8, ge = 20, xs = 2e4, Ne = 12, Rn = 15, $e = ["peak", "low_shelf", "high_shelf"], Dn = ["peak", "notch", "highpass", "lowpass"], Zt = [0.2, 10], en = [0.25, 1];
function Ee() {
  return { schema: zn, preamp_db: 0, bands: [] };
}
function _s(e) {
  if (typeof e != "string" || !e.trim()) return Ee();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: zn,
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
function Me(e) {
  return JSON.stringify(e);
}
const J = (e, t) => Number(e.toFixed(t));
function G(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Pn(e) {
  return e.db ?? Rn;
}
const tn = [6, 12, 18], Ss = { 6: 8, 12: 14, 18: 20 };
function ks(e, t) {
  return { ...e, db: Ss[t] ?? Rn };
}
function ve(e, t) {
  return Math.log(G(t, ge, e.maxHz) / ge) / Math.log(e.maxHz / ge) * e.width;
}
function nn(e, t) {
  return ge * (e.maxHz / ge) ** G(t / e.width, 0, 1);
}
function me(e, t) {
  const n = Pn(e);
  return (1 - (G(t, -n, n) + n) / (2 * n)) * e.height;
}
function on(e, t) {
  const n = Pn(e);
  return (1 - G(t / e.height, 0, 1)) * 2 * n - n;
}
function sn(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function rn(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${ve(e, o).toFixed(1)},${me(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function Bt(e) {
  return Math.min(xs, 0.45 * e);
}
function Es(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Ms(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= nt) return null;
  const s = {
    id: Es(e),
    enabled: !0,
    type: "peak",
    frequency_hz: J(G(t, ge, Bt(o)), 1),
    gain_db: J(G(n, -Ne, Ne), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function qe(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: J(G(n, ge, Bt(s)), 1),
        gain_db: $e.includes(r.type) ? J(G(o, -Ne, Ne), 1) : r.gain_db
      }
    )
  };
}
function yt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: J(G(o.q * n, 0.2, 10), 3) } : o)
  };
}
function wt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Ce(e) {
  const t = e.frequency_hz >= 1e3 ? `${J(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = $e.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${J(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${J(e.q, 2)}`;
}
function $s(e, t) {
  const n = Bn[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = $e.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = Dn.includes(e.type) ? ` Q ${J(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const Bn = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function vt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), o = 1;
  if (t && /k$/i.test(n) && (o = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const s = Number(n) * o;
  return Number.isFinite(s) ? s : null;
}
function Ue(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function ot(e, t, n, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: J(G(Ue(r.frequency_hz, s.frequency_hz), ge, Bt(o)), 1),
        gain_db: J(G(Ue(r.gain_db, s.gain_db), -Ne, Ne), 1),
        q: J(G(Ue(r.q, s.q), Zt[0], Zt[1]), 3),
        slope: J(G(Ue(r.slope, s.slope), en[0], en[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function an(e, t) {
  return ot(e, t, { gain_db: 0 });
}
function ln(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((g) => Number.isFinite(g));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), l = e.height - 4, f = l - Math.max(12, e.height * G(o, 0.1, 0.95));
  return `M${t.map((g, k) => {
    const _ = n[k], R = Number.isFinite(_) ? (_ - i) / a : 0;
    return `${ve(e, g).toFixed(1)},${(l - R * (l - f)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${l.toFixed(1)} L0,${l.toFixed(1)} Z`;
}
class As {
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
    Me(t) !== Me(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Ls = "http://www.w3.org/2000/svg", cn = "plenio_eq_panel", Ye = "mode.bands", fe = { capture: !0 }, Z = { width: 560, height: 260 }, Je = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let xt = null;
function ae(e, t) {
  const n = document.createElementNS(Ls, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function F(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function we(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function le(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Ns(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function Ts(e, t) {
  const n = F("div", "plenio-eq"), o = F("div", "plenio-eq-tools"), s = F("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = F("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const c of tn) r.append(new Option(`±${c} dB`, String(c)));
  const i = we("", "↶", "Undo the last band change"), a = we("", "↷", "Redo the last band change"), l = we("", "reset", "Remove every band"), f = we("", "compare", "Show the curve without the EQ (bypass)"), p = we("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), g = F("span", "plenio-eq-info");
  g.setAttribute("aria-live", "polite"), g.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, l, f, p, g);
  const k = F("div", "plenio-eq-mode"), _ = ae("svg", {
    viewBox: `0 0 ${Z.width} ${Z.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  _.setAttribute("aria-label", "EQ response curve"), _.setAttribute("tabindex", "0"), _.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const R = F("div", "plenio-eq-strip"), S = F("div", "plenio-eq-editor"), E = F("div", "plenio-eq-fields");
  S.append(E), n.append(o, k, _, R, S);
  const j = e.addDOMWidget(cn, cn, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: Ee(), readonly: !0, note: "" }, H = null, A = null, b = !1, m = 12, y = null, w = [], q = 0, M, V, D = null, z = !1;
  const P = /* @__PURE__ */ new Map();
  let W = null;
  const L = new As(Ee()), de = () => le(e, Ye), Q = () => m, N = () => ks({ ...Z, maxHz: Math.min(2e4, u.sampleRate / 2) }, Q());
  function C(c, { record: h = !0 } = {}) {
    const d = de();
    if (!d) return;
    const v = Me(c);
    d.value = v, d.callback?.(v), h && L.push(c), u = { ...u, settings: c }, X(), se(0);
  }
  async function se(c = 120) {
    clearTimeout(M), M = setTimeout(async () => {
      const h = String(le(e, "mode")?.value ?? "flat");
      if (h !== "manual") {
        h === "flat" ? u = {
          ...u,
          settings: Ee(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : H !== h ? u = {
          ...u,
          settings: Ee(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: `${h}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : u = { ...u, readonly: !0 }, X();
        return;
      }
      const d = _s(de()?.value);
      if (!d) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, X();
        return;
      }
      Me(d) !== Me(L.current) && L.reset(d);
      const v = ++q;
      try {
        const $ = await Vt(t, d, u.sampleRate);
        if (v !== q) return;
        u = {
          ...u,
          frequencies: $.frequency_hz,
          response: $.response_db,
          settings: $.settings,
          readonly: !1,
          note: ""
        };
      } catch ($) {
        u = { ...u, readonly: !1, note: $ instanceof Error ? $.message : String($) };
      }
      X();
    }, c);
  }
  const Fe = (c) => ({
    ...c.settings,
    bands: c.settings.bands.slice(0, nt)
  });
  function re() {
    if (!y) return "";
    const c = w.find((h) => h.name === y);
    return c && Ns(Fe(c), u.settings) ? y : "";
  }
  function X() {
    _.replaceChildren(), P.clear(), W = null;
    const c = N();
    for (const d of [-c.db, -c.db / 2, 0, c.db / 2, c.db])
      _.append(
        ae("line", { x1: 0, x2: c.width, y1: me(c, d), y2: me(c, d), class: d ? "grid" : "grid zero" })
      );
    for (const d of [100, 1e3, 1e4])
      _.append(ae("line", { x1: ve(c, d), x2: ve(c, d), y1: 0, y2: c.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && _.append(ae("path", { d: ln(c, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && _.append(ae("path", { d: ln(c, u.frequencies, u.afterDb), class: "spectrum after" })), b ? _.append(ae("line", { x1: 0, x2: c.width, y1: me(c, 0), y2: me(c, 0), class: "curve flat" })) : u.frequencies.length && (W = ae("path", { d: rn(c, u.frequencies, u.response), class: "curve" }), _.append(W)), !u.readonly && !b && u.settings.bands.forEach((d, v) => {
      const $ = Je[v % Je.length], I = $e.includes(d.type) ? d.gain_db : 0, x = ae("circle", {
        cx: ve(c, d.frequency_hz),
        cy: me(c, I),
        r: d.id === A ? 9 : 7,
        class: d.id === A ? "handle selected" : "handle",
        style: `stroke: ${$}`,
        tabindex: 0,
        "data-band": d.id
      });
      x.setAttribute("aria-label", `Band ${v + 1}: ${Ce(d)}`), d.enabled || x.classList.add("disabled"), x.append(ae("title", {})), x.lastChild.textContent = `Band ${v + 1}: ${Ce(d)}`, x.addEventListener("pointerdown", (B) => ko(B, d.id)), x.addEventListener("dblclick", (B) => {
        B.stopPropagation(), C(an(u.settings, d.id));
      }), x.addEventListener("focus", () => xo(d.id)), x.addEventListener("keydown", (B) => jt(B, d.id)), x.addEventListener("wheel", (B) => {
        B.preventDefault();
        const ye = B.deltaY < 0 ? 1.15 : 1 / 1.15;
        C(yt(u.settings, d.id, ye));
      }), x.addEventListener("contextmenu", (B) => {
        B.preventDefault(), C(wt(u.settings, d.id));
      }), _.append(x), P.set(d.id, x);
    }), yo(), wo(), vo();
    const h = u.settings.bands.find((d) => d.id === A);
    g.textContent = u.note || (b ? "compare: the curve is off (the node still applies it)" : h ? Ce(h) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${nt}`), s.disabled = u.readonly, i.disabled = !L.canUndo, a.disabled = !L.canRedo, l.disabled = u.readonly || !u.settings.bands.length, z && (z = !1, A && P.get(A)?.focus({ preventScroll: !0 })), r.value = String(m), s.value = re(), f.classList.toggle("active", b), p.classList.toggle("active", dt()), e.setDirtyCanvas?.(!0, !0);
  }
  function yo() {
    if (R.replaceChildren(), u.readonly && !u.settings.bands.length) {
      R.append(F("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((c, h) => {
      const d = F("button", "plenio-eq-chip", $s(c, h));
      d.style.borderLeftColor = Je[h % Je.length], d.classList.toggle("selected", c.id === A), d.classList.toggle("disabled", !c.enabled), d.setAttribute("aria-label", `Edit band ${h + 1}`), d.title = `Band ${h + 1}: ${Ce(c)} - click to open its fields`, d.addEventListener("click", (v) => {
        v.stopPropagation(), A = A === c.id ? null : c.id, X();
      }), R.append(d);
    });
  }
  function wo() {
    E.replaceChildren();
    const c = u.settings.bands.find((x) => x.id === A);
    if (!c || u.readonly) {
      S.style.display = "none";
      return;
    }
    S.style.display = "";
    const h = F("span", "name", `Band ${u.settings.bands.indexOf(c) + 1}`);
    h.title = "The selected band";
    const d = F("select");
    d.setAttribute("aria-label", "Band type"), d.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [x, B] of Object.entries(Bn)) d.append(new Option(B, x));
    d.value = c.type, d.addEventListener("change", () => C(ot(u.settings, c.id, { type: d.value })));
    const v = F("input");
    v.type = "checkbox", v.checked = c.enabled, v.setAttribute("aria-label", "Band enabled"), v.title = "Band enabled: off keeps the band in the list but out of the response", v.addEventListener("change", () => C(ot(u.settings, c.id, { enabled: v.checked })));
    const $ = [
      [
        "Hz",
        `${c.frequency_hz}`,
        70,
        (x) => pt(c.id, "frequency_hz", vt(x, { kilo: !0 }))
      ],
      ["dB", `${c.gain_db}`, 60, (x) => pt(c.id, "gain_db", vt(x))],
      ["Q", `${c.q}`, 60, (x) => pt(c.id, "q", vt(x))]
    ];
    E.append(h, d, v);
    for (const [x, B, ye, Ge] of $) {
      const U = F("input", "number");
      U.value = B, U.style.width = `${ye}px`, U.setAttribute("aria-label", `Band ${x}`), U.title = x === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : x === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Ve = () => {
        Ge(U.value) || (U.value = B);
      };
      U.addEventListener("keydown", (ie) => {
        ie.key === "Enter" && Ve();
      }), U.addEventListener("blur", Ve), (x === "dB" && !$e.includes(c.type) || x === "Q" && !Dn.includes(c.type)) && (U.disabled = !0), E.append(U);
    }
    const I = we("", "remove", "Remove this band");
    I.addEventListener("click", (x) => {
      x.stopPropagation(), A = null, C(wt(u.settings, c.id));
    }), E.append(I);
  }
  function vo() {
    k.replaceChildren();
    const c = String(le(e, "mode")?.value ?? "flat");
    if (c === "manual" || c === "flat") {
      k.style.display = "none";
      return;
    }
    k.style.display = "", k.append(
      F(
        "span",
        "plenio-eq-hint",
        H === c ? `applied proposal (${u.settings.bands.length} band(s), ${c})` : `${c}: no proposal yet - it is computed on the next run`
      )
    );
    const h = we("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    h.disabled = !u.settings.bands.length, h.addEventListener("click", (d) => {
      d.stopPropagation();
      const v = le(e, "mode");
      if (!v) return;
      v.value = "manual", v.callback?.("manual");
      const $ = de();
      if ($) {
        const I = Me(u.settings);
        $.value = I, $.callback?.(I);
      }
      L.reset(u.settings), ht(), se(0);
    }), k.append(h);
  }
  function xo(c) {
    A = c, z = !0, X();
  }
  function _o(c) {
    A = c, ut();
  }
  function ut() {
    const c = N();
    u.settings.bands.forEach((d) => {
      const v = P.get(d.id);
      if (!v) return;
      const $ = $e.includes(d.type) ? d.gain_db : 0;
      v.setAttribute("cx", String(ve(c, d.frequency_hz))), v.setAttribute("cy", String(me(c, $))), v.classList.toggle("selected", d.id === A), v.setAttribute("r", d.id === A ? "9" : "7");
    }), W && u.frequencies.length && W.setAttribute("d", rn(c, u.frequencies, u.response));
    const h = u.settings.bands.find((d) => d.id === A);
    h && (g.textContent = Ce(h));
  }
  function So() {
    clearTimeout(V), V = setTimeout(async () => {
      const c = u.settings, h = ++q;
      try {
        const d = await Vt(t, c, u.sampleRate);
        if (h !== q) return;
        u = { ...u, frequencies: d.frequency_hz, response: d.response_db }, ut();
      } catch {
      }
    }, 60);
  }
  function dt() {
    return !le(e, Ye)?.plenioHidden;
  }
  function ft(c) {
    const h = le(e, Ye);
    h && (h.plenioHidden = !c, c ? delete h.computeSize : h.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function pt(c, h, d) {
    if (d === null) return !1;
    const v = u.settings.bands.find(($) => $.id === c);
    return v && v[h] === d || C(ot(u.settings, c, { [h]: d })), !0;
  }
  function ko(c, h) {
    c.preventDefault(), c.stopPropagation(), A !== h && _o(h);
    const d = u.settings.bands.find((K) => K.id === h);
    if (!d) return;
    D = { hz: d.frequency_hz, db: d.gain_db };
    let v = !1, $ = !1;
    const I = c.currentTarget;
    try {
      I?.setPointerCapture?.(c.pointerId);
    } catch {
    }
    const x = _.getBoundingClientRect(), B = x.width ? x.left : 0, ye = x.height ? x.top : 0, Ge = x.width || Z.width, U = x.height || Z.height, Ve = (K, Xe) => K >= B - 1 && K <= B + Ge + 1 && Xe >= ye - 1 && Xe <= ye + U + 1;
    function ie() {
      if (!$) {
        $ = !0;
        try {
          I?.releasePointerCapture?.(c.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Gt, fe), window.removeEventListener("pointerup", ie, fe), window.removeEventListener("pointercancel", ie, fe), window.removeEventListener("blur", ie, fe), D = null, v && C(u.settings);
      }
    }
    const Gt = (K) => {
      if ($ || !D) return;
      if (K.buttons === 0) {
        ie();
        return;
      }
      if (!Ve(K.clientX, K.clientY)) return;
      const Xe = Z.width / Ge, Mo = Z.height / U, $o = (K.clientX - B) * Xe, Ao = (K.clientY - ye) * Mo, Lo = ve(N(), D.hz), No = me(N(), D.db), To = nn(N(), sn(Lo, $o, K.shiftKey)), qo = on(N(), sn(No, Ao, K.shiftKey));
      u = { ...u, settings: qe(u.settings, h, To, qo, u.sampleRate) }, v = !0, ut(), So();
    };
    window.addEventListener("pointermove", Gt, fe), window.addEventListener("pointerup", ie, fe), window.addEventListener("pointercancel", ie, fe), window.addEventListener("blur", ie, fe);
  }
  function jt(c, h) {
    const d = u.settings.bands.find((x) => x.id === h);
    if (!d) return;
    const v = c.shiftKey ? 0.1 : 0.5, $ = c.shiftKey ? 1.01 : 1.06;
    let I = null;
    c.key === "ArrowUp" ? I = qe(u.settings, h, d.frequency_hz, d.gain_db + v, u.sampleRate) : c.key === "ArrowDown" ? I = qe(u.settings, h, d.frequency_hz, d.gain_db - v, u.sampleRate) : c.key === "ArrowRight" ? I = qe(u.settings, h, d.frequency_hz * $, d.gain_db, u.sampleRate) : c.key === "ArrowLeft" ? I = qe(u.settings, h, d.frequency_hz / $, d.gain_db, u.sampleRate) : c.key === "+" ? I = yt(u.settings, h, 1.15) : c.key === "-" ? I = yt(u.settings, h, 1 / 1.15) : c.key === "0" ? I = an(u.settings, h) : (c.key === "Delete" || c.key === "Backspace") && (I = wt(u.settings, h)), I && (c.preventDefault(), C(I));
  }
  _.addEventListener("keydown", (c) => {
    A && c.target === _ && jt(c, A);
  }), _.addEventListener("dblclick", (c) => {
    if (u.readonly || b) return;
    const h = _.getBoundingClientRect(), d = Z.width / (h.width || Z.width), v = Z.height / (h.height || Z.height), $ = (c.clientX - h.left) * d, I = (c.clientY - h.top) * v, x = Ms(u.settings, nn(N(), $), on(N(), I), u.sampleRate);
    x ? (A = x.bands[x.bands.length - 1].id, C(x)) : (u = { ...u, note: `the EQ has at most ${nt} bands` }, X());
  }), s.append(new Option("preset…", "")), xt ??= zo(t).then((c) => c.manual).catch(() => []), xt.then((c) => {
    w = c;
    for (const h of c) s.append(new Option(h.name, h.name));
    s.value = re();
  }), s.addEventListener("change", async () => {
    const c = (await xt)?.find((h) => h.name === s.value);
    c && (y = c.name, C(Fe(c)));
  }), r.addEventListener("change", () => {
    const c = Number(r.value);
    m = tn.find((h) => h === c) ?? 12, X();
  }), i.addEventListener("click", () => {
    const c = L.undo();
    c && C(c, { record: !1 });
  }), a.addEventListener("click", () => {
    const c = L.redo();
    c && C(c, { record: !1 });
  }), l.addEventListener("click", () => {
    A = null, C(Ee());
  }), f.addEventListener("click", () => {
    b = !b, X();
  }), p.addEventListener("click", () => {
    ft(!dt()), X();
  });
  function ht() {
    for (const c of ["mode", Ye]) {
      const h = le(e, c);
      if (!h || h.plenioWatched) continue;
      h.plenioWatched = !0;
      const d = h.callback;
      h.callback = (v) => {
        d?.(v), setTimeout(() => {
          dt() || ft(!1), se();
        });
      };
    }
  }
  ht(), ft(!1), se(0);
  let Wt = null, Ft = null;
  const Eo = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(Eo);
      return;
    }
    const c = String(le(e, "mode")?.value ?? "flat"), h = String(de()?.value ?? "");
    c === Wt && h === Ft || (Wt = c, Ft = h, ht(), se(0));
  }, 700);
  return {
    showExecuted(c) {
      const h = c?.plenio_eq, d = h?.[h.length - 1];
      if (!d) return;
      const v = String(le(e, "mode")?.value ?? "flat"), $ = v === "manual";
      H = $ || v === "flat" ? null : v, u = {
        sampleRate: d.sample_rate,
        frequencies: d.frequency_hz,
        response: d.response_db,
        settings: d.settings,
        readonly: !$,
        note: $ ? "" : `applied: ${d.settings.bands.length} band(s)`,
        beforeDb: d.spectrum_before_db,
        afterDb: d.spectrum_after_db
      }, $ ? se(0) : X();
    }
  };
}
const Ht = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, qs = new Set(He.map((e) => zt[e]));
function Cs(e, t) {
  return !(e in Ht) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => qs.has(n) && Nn(o)).map(([n]) => n);
}
function Is(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const Os = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function zs(e, t) {
  const n = Os[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
function Rs(e, t) {
  const n = Ht[e.name];
  if (!n || !t) return t;
  const o = Is(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = Cs(e.name, i.widgets_values_named);
  if (a.length) {
    const l = { ...i.widgets_values_named };
    for (const f of a) l[f] = "";
    i = { ...i, widgets_values_named: l };
  }
  return i;
}
const Hn = /* @__PURE__ */ new Map(), Lt = /* @__PURE__ */ new Set();
function un(e, t) {
  Hn.set(e, t);
  for (const n of Lt) n(e);
}
function ke(e) {
  return Hn.get(e) ?? null;
}
function Ds(e) {
  return Lt.add(e), () => Lt.delete(e);
}
const jn = /* @__PURE__ */ new Map();
function Ps(e) {
  e?.draft_sha256 && jn.set(e.draft_sha256, e);
}
function Bs(e) {
  return e ? jn.get(e) ?? null : null;
}
const _t = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function Hs(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function js(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Wn(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Ws(e) {
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
const it = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new Set();
function Fn(e) {
  return it.get(e) ?? null;
}
function Ae(e, t) {
  t ? it.set(e, t) : it.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of De) n(e);
}
function Fs(e) {
  for (const t of e) it.delete(t);
  for (const t of De) t(null);
}
function Gs() {
  for (const e of De) e(null);
}
function Vs(e) {
  return De.add(e), () => De.delete(e);
}
const dn = "600 12px sans-serif", Qe = 20, St = 7;
function Xs(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Us(e) {
  const t = e ? Xs(e) : "";
  return {
    height: e ? Qe : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = dn;
      const o = n.measureText(t).width + 2 * St;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = dn;
      const r = n.measureText(t).width + 2 * St;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, Qe, 5) : n.rect(o, s, r, Qe), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + St, s + Qe / 2 + 0.5), n.restore();
    }
  };
}
const Ys = "PlenioSongSheet", Js = 30;
function Gn(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function Qs(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? Gn(n, "mode") : null;
  } catch {
    return null;
  }
}
function Nt(e) {
  const t = Fn(e);
  return t || (e.type !== Ys ? null : js(Gn(e, "review") ?? "continue", Qs(e)) ? "stop" : null);
}
function Ks(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Wn(n);
  const o = e?.plenio_summary;
  return Hs(o?.[o.length - 1]?.status);
}
function Zs(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = Nt(s);
      return Us(r ? _t[r] : null);
    });
  }, n.onDrawForeground = ce(n.onDrawForeground, function(s) {
    const r = Nt(this);
    !r || !_t[r].frame || this.flags?.collapsed || !this.size || er(s, _t[r], this.size, Js, t.scale());
  }), n.onExecuted = ce(n.onExecuted, function(s) {
    const r = Ks(s);
    r && (Ae(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
    ));
  });
}
function er(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function $i(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, l = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: l, source: a }), o += l;
  }), n;
}
function Vn(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + Y) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Se(e, t) {
  const n = Vn(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function tr(e, t) {
  const n = Vn(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function Ai(e, t, n) {
  const o = Se(e, t), s = n == null ? 1 / 0 : Se(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, l = Math.max(i.realStart, o), f = Math.min(a, s);
    if (f <= l + Y) continue;
    let p = i.source[0] + (l - i.realStart) / i.realDur * (i.source[1] - i.source[0]), g = l - o, k = f - l;
    if (p < 0 && (g -= p, k += p, p = 0, k <= Y))
      continue;
    const _ = r.at(-1);
    _ && Math.abs(_.at + _.duration - g) < Y && Math.abs(_.offset + _.duration - p) < 0.01 ? _.duration += k : r.push({ at: g, offset: p, duration: k });
  }
  return r;
}
const Xn = 0.04, Y = 1e-3, nr = 0.25, or = 2;
function at(e) {
  return Math.min(or, Math.max(nr, Number.isFinite(e) ? e : 1));
}
function Li(e, t) {
  const n = at(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Se(r, t.from) : t.from, a = (l) => (r ? Se(r, l) : l) - i;
  for (const l of ["Vocal", "Ins"])
    if (t.voices[l])
      for (const f of e.notes?.[l] ?? []) {
        if (f.start_s < t.from - Y || f.start_s >= o - Y) continue;
        const p = Math.min(f.start_s + f.duration_s, o), g = Math.max(0, a(f.start_s));
        s.push({ at: g / n, duration: (a(p) - g) / n, midi: f.midi, part: l });
      }
  if (t.voices.chords)
    for (const l of e.chords ?? []) {
      const f = Math.min(l.start_s + l.duration_s, o), p = Math.max(l.start_s, t.from);
      if (!(f <= p + Y))
        for (const g of l.pitches)
          s.push({ at: a(p) / n, duration: (a(f) - a(p)) / n, midi: g, part: "chord" });
    }
  if (t.voices.guide)
    for (const l of t.guide ?? []) {
      if (l.start_s < t.from - Y || l.start_s >= o - Y) continue;
      const f = Math.min(l.start_s + l.duration_s, o), p = Math.max(0, a(l.start_s));
      s.push({ at: p / n, duration: (a(f) - p) / n, midi: l.midi, part: "guide" });
    }
  if (t.metronome)
    for (const l of e.bars) {
      const f = Number(l.meter.split("/")[0]) || 1;
      for (let p = 0; p < f; p++) {
        const g = l.start_s + p * l.duration_s / f;
        g < t.from - Y || g >= o - Y || s.push({
          at: Math.max(0, a(g)) / n,
          duration: Xn,
          midi: p === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((l, f) => l.at - f.at || l.midi - f.midi);
}
function Ni(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Se(o, n) - Se(o, t.from) : n - t.from;
  return Math.max(0, s) / at(t.speed);
}
function Ti(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, l = i > 0 ? Math.floor(a / i + 1e-6) : 0, f = i > 0 ? (a - l * i) / i * r : 0, p = f > 1e-3 ? 0 : 1, g = Math.max(0, o * t);
  return Array.from({ length: g }, (k, _) => {
    const R = p + g - 1 - _, S = ((l - R) % t + t) % t === 0;
    return { at: Math.max(0, s - f - R * r), duration: Xn, midi: S ? 96 : 89, part: "click" };
  });
}
function qi(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? tr(n, Se(n, e.from) + t * at(e.speed)) : e.from + t * at(e.speed);
}
function Ci(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + Y && t < o.start_s + o.duration_s - Y
  ).map((o) => o.id);
}
function sr(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const rr = [
  "plain",
  "soft",
  "piano",
  "epiano",
  "strings",
  "pad",
  "organ",
  "flute",
  "voice",
  "pluck",
  "lead",
  "bass",
  "mallets"
], Ii = {
  plain: { label: "Plain", hint: "a plain sine tone (the editor’s classic sound)" },
  soft: { label: "Soft lead", hint: "a soft triangle tone" },
  piano: { label: "Piano", hint: "a struck string that fades and darkens" },
  epiano: { label: "Electric piano", hint: "a bell-like electric piano (FM)" },
  strings: { label: "Strings", hint: "a string section: slow bow, vibrato" },
  pad: { label: "Pad", hint: "a slow, wide synth pad" },
  organ: { label: "Organ", hint: "drawbar organ" },
  flute: { label: "Flute", hint: "a breathy flute with vibrato" },
  voice: { label: "Voice “ah”", hint: "a sung “ah” (formants) - good for the Vocal track" },
  pluck: { label: "Pluck", hint: "a plucked string, like a guitar" },
  lead: { label: "Synth lead", hint: "a bright synth lead" },
  bass: { label: "Bass", hint: "a round bass" },
  mallets: { label: "Mallets", hint: "marimba / vibraphone (FM)" }
};
function Ke(e) {
  return typeof e == "string" && rr.includes(e);
}
function Un() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function ir(e) {
  const t = Un(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: Ke(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: Ke(n.Ins) ? n.Ins : t.Ins,
    chord: Ke(n.chord) ? n.chord : t.chord,
    guide: Ke(n.guide) ? n.guide : t.guide
  };
}
const ar = {
  plain: 1,
  soft: 1,
  piano: 1.35,
  epiano: 1.2,
  strings: 0.8,
  pad: 0.75,
  organ: 1.1,
  flute: 0.95,
  voice: 4.1,
  pluck: 0.8,
  lead: 0.75,
  bass: 0.8,
  mallets: 1.15
}, fn = /* @__PURE__ */ new WeakMap();
function kt(e, t, n) {
  let o = fn.get(e);
  o || fn.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, l) => i[l + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const pn = /* @__PURE__ */ new WeakMap();
function Yn(e) {
  let t = pn.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    pn.set(e, t);
  }
  return t;
}
function T(e, t, n, o = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = o, s;
}
function pe(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ee(e, t, n, o = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = o, s;
}
function Ie(e, t, n, o, s, r) {
  const i = T(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const l of t) a.connect(l.detune);
  return i;
}
function Et(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = Yn(e);
  const a = ee(e, "bandpass", o, 1.2), l = e.createGain();
  return l.gain.setValueAtTime(s, n), l.gain.setTargetAtTime(0, n, r), i.connect(a).connect(l).connect(t), i;
}
const st = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), hn = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [mn(T(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [mn(T(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = kt(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ee(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, st(r, 0.35)), a.connect(t);
      const l = T(e, i, n, -1.5), f = T(e, i, n, 1.5), p = pe(e, 0.5);
      l.connect(p), f.connect(p), p.connect(a);
      const g = Et(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [l, f, g];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = T(e, "sine", n), a = T(e, "sine", n), l = e.createGain(), f = n * (1.2 + 2.2 * s);
      l.gain.setValueAtTime(f, o), l.gain.setTargetAtTime(n * 0.25, o, st(r, 0.25)), a.connect(l).connect(i.frequency);
      const p = ee(e, "highpass", 25, 0.7);
      p.connect(t);
      const g = T(e, "sine", n * 4), k = e.createGain();
      return k.gain.setValueAtTime(0.18 * s, o), k.gain.setTargetAtTime(0, o, 0.06), g.connect(k).connect(p), i.connect(p), [i, a, g];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, o) {
      const s = ee(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      s.connect(t);
      const r = [-9, 0, 8].map((a) => T(e, "sawtooth", n, a));
      for (const a of r) a.connect(s);
      const i = Ie(e, r, o, 5.3, 7, 0.3);
      return [...r, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, o) {
      const s = Math.min(n * 3 + 500, 4500), r = ee(e, "lowpass", s, 0.8);
      r.connect(t);
      const i = T(e, "sine", 0.25), a = pe(e, s * 0.3);
      i.connect(a).connect(r.frequency);
      const l = [T(e, "sawtooth", n, -12), T(e, "sawtooth", n, 11), T(e, "triangle", n / 2)];
      for (const f of l) f.connect(r);
      return [...l, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, o) {
      const s = kt(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = T(e, s, n), i = T(e, "sine", n / 2), a = pe(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const l = Ie(e, [r, i], o, 6.6, 4, 0), f = Et(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, l, f];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = kt(e, "flute", [1, 0.13, 0.06, 0.02]), r = T(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = Yn(e), i.loop = !0;
      const a = ee(e, "bandpass", Math.min(n * 2, 8e3), 1.5), l = pe(e, 0.06);
      i.connect(a).connect(l).connect(t);
      const f = Ie(e, [r], o, 4.9, 9, 0.25);
      return [r, i, f];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, o) {
      const s = T(e, "sawtooth", n), r = ee(e, "lowpass", 5e3, 0.5);
      s.connect(r);
      for (const [l, f, p] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const g = ee(e, "bandpass", l, f), k = pe(e, p);
        r.connect(g).connect(k).connect(t);
      }
      const i = pe(e, 0.15);
      r.connect(i).connect(t);
      const a = Ie(e, [s], o, 5.4, 18, 0.22);
      return [s, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, o, s, r) {
      const i = ee(e, "lowpass", Math.min(n * (6 + 6 * s), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, st(r, 0.12)), i.connect(t);
      const a = T(e, "sawtooth", n), l = T(e, "triangle", n, 4);
      a.connect(i), l.connect(i);
      const f = Et(e, t, o, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
      return [a, l, f];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(e, t, n, o) {
      const s = ee(e, "lowpass", Math.min(n * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(n * 4, 4e3), o + 0.02, 0.2), s.connect(t);
      const r = T(e, "square", n), i = T(e, "sawtooth", n, 6);
      r.connect(s), i.connect(s);
      const a = Ie(e, [r, i], o, 5.6, 10, 0.3);
      return [r, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = T(e, "sine", n), r = T(e, "triangle", n), i = pe(e, 0.5);
      s.connect(t), r.connect(i).connect(t);
      const a = T(e, "sawtooth", n), l = ee(e, "lowpass", Math.min(n * 6, 2500), 1);
      l.frequency.setTargetAtTime(n * 2, o + 0.01, 0.12);
      const f = pe(e, 0.25);
      return a.connect(l).connect(f).connect(t), [s, r, a];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(e, t, n, o, s, r) {
      const i = T(e, "sine", n), a = T(e, "sine", n * 3.5), l = e.createGain();
      return l.gain.setValueAtTime(n * (1 + 1.5 * s), o), l.gain.setTargetAtTime(0, o, 0.05), a.connect(l).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function mn(e, t) {
  return e.connect(t), e;
}
function Oi(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = hn[n] ?? hn.plain, l = sr(o), f = a.sustain === 0 ? st(o, a.decay) : a.decay, p = i * ar[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), g = e.createGain();
  g.gain.setValueAtTime(0, s), g.gain.linearRampToValueAtTime(p, s + a.attack), g.gain.setTargetAtTime(p * a.sustain, s + a.attack, f), g.connect(t);
  const k = a.build(e, g, l, s, r, o);
  for (const E of k) E.start(s);
  let _ = !1, R = !1;
  const S = (E) => {
    for (const j of k)
      try {
        j.stop(E);
      } catch {
      }
  };
  return k[0].onended = () => {
    R = !0, g.disconnect();
  }, a.sustain === 0 && S(s + a.attack + f * 7), {
    release(E) {
      if (_ || R) return;
      _ = !0;
      const j = Math.max(E, s + a.attack);
      g.gain.setTargetAtTime(0, j, a.release), S(j + a.release * 7);
    },
    stop() {
      if (R) return;
      R = !0, _ = !0;
      const E = e.currentTime;
      try {
        g.gain.cancelScheduledValues(E), g.gain.setValueAtTime(0, E);
      } catch {
      }
      S(E), g.disconnect();
    }
  };
}
const zi = 12, Ze = { width: 640, height: 420 }, lr = { width: 1280, height: 900 }, Jn = 120, Qn = 720, Kn = 0.25, Zn = 0.85, eo = 160, to = 460, no = "plenio.sheet.dialog";
function Pe(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function cr(e, t) {
  const n = Pe(e.width, Ze.width, Math.max(Ze.width, t.width - 16)), o = Pe(e.height, Ze.height, Math.max(Ze.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function Ri(e, t) {
  return Math.round(Pe(e + t, Jn, Qn));
}
function Di(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? gn(e) : gn(e + t / n);
}
function gn(e) {
  return Math.round(Pe(e, Kn, Zn) * 1e3) / 1e3;
}
function Pi(e, t) {
  return Math.round(Pe(e + t, eo, to));
}
function Bi(e, t, n) {
  const o = e.clientX, s = e.clientY, r = e.currentTarget;
  let i = !1;
  try {
    r?.setPointerCapture?.(e.pointerId);
  } catch {
  }
  const a = () => {
    if (!i) {
      i = !0;
      try {
        r?.releasePointerCapture?.(e.pointerId);
      } catch {
      }
      window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", a), window.removeEventListener("pointercancel", a), window.removeEventListener("blur", a), n?.();
    }
  }, l = (f) => {
    if (f.buttons === 0) {
      a();
      return;
    }
    t({ dx: f.clientX - o, dy: f.clientY - s });
  };
  window.addEventListener("pointermove", l), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function ur() {
  return { ...lr, maximized: !1 };
}
function Hi(e = oo()) {
  const t = ur();
  try {
    const n = e?.getItem(no);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...cr(
      {
        width: typeof o.width == "number" ? o.width : t.width,
        height: typeof o.height == "number" ? o.height : t.height
      },
      { width: window.innerWidth, height: window.innerHeight }
    ), maximized: o.maximized === !0 };
  } catch {
    return t;
  }
}
function ji(e, t = oo()) {
  try {
    t?.setItem(no, JSON.stringify(e));
  } catch {
  }
}
function oo() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function so(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function ro() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function dr(e) {
  const t = ro(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const io = "plenio.score-editor.prefs";
function fr() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    speed: 1,
    roll: !0,
    rollZoom: 48,
    rollHeight: 280,
    notationShare: 0.6,
    sideWidth: 230,
    metronome: !1,
    hear: "both",
    sourceLevel: 0.7,
    audition: !0,
    rowHeight: 12,
    follow: !0,
    sung: !0,
    wave: !0,
    sounds: Un(),
    paper: "a4",
    notationSize: "standard",
    record: ro(),
    midiInput: "all"
  };
}
function pr(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function Wi(e = ao()) {
  const t = fr();
  try {
    const n = e?.getItem(io);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...pr(o),
      zoom: typeof o.zoom == "number" && o.zoom >= 0.6 && o.zoom <= 1.8 ? o.zoom : t.zoom,
      voices: {
        Vocal: o.voices?.Vocal !== !1,
        Ins: o.voices?.Ins !== !1,
        chords: o.voices?.chords !== !1,
        guide: o.voices?.guide !== !1
      },
      speed: typeof o.speed == "number" && o.speed >= 0.25 && o.speed <= 2 ? o.speed : t.speed,
      roll: o.roll !== !1,
      rollZoom: typeof o.rollZoom == "number" && o.rollZoom >= 12 && o.rollZoom <= 240 ? o.rollZoom : t.rollZoom,
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= Jn && o.rollHeight <= Qn ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= Kn && o.notationShare <= Zn ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= eo && o.sideWidth <= to ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: ir(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: so(o.notationSize) ? o.notationSize : t.notationSize,
      record: dr(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function Fi(e, t = ao()) {
  try {
    t?.setItem(io, JSON.stringify(e));
  } catch {
  }
}
function ao() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function lo(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: so(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function hr(e) {
  return lo(e?.plenio_notation);
}
async function mr(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return lo(n.jobs);
}
async function gr(e, t) {
  const n = await t.draw(e.display_abc, e.title, e.paper, e.size), o = new ArrayBuffer(n.length);
  new Uint8Array(o).set(n);
  const s = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([o], { type: "application/pdf" })
  }), r = await s.json().catch(() => ({}));
  if (!s.ok)
    throw new ue(r.error?.message ?? `Saving the sheet music failed (${s.status})`, r.error?.hint ?? null);
  return { file: r.file ?? e.file, bytes: r.bytes ?? n.length };
}
let bn = Promise.resolve();
function br(e) {
  const t = bn.then(e, e);
  return bn = t.catch(() => {
  }), t;
}
class yr {
  constructor(t, n) {
    this.host = t, this.report = n;
  }
  host;
  report;
  seen = /* @__PURE__ */ new Set();
  take(t, n = !1) {
    const o = [];
    for (const s of t)
      this.seen.has(s.token) || (this.seen.add(s.token), o.push(
        br(() => gr(s, this.host)).then(
          (r) => this.report({ job: s, saved: r }),
          (r) => {
            const i = r instanceof ue && /can no longer be saved/.test(r.message);
            this.report({ job: s, error: r, quiet: n && i });
          }
        )
      ));
    return o;
  }
  /** Ask the server for the jobs still waiting and draw the new ones (a failed request draws nothing). */
  async recover() {
    let t = [];
    try {
      t = await mr(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const wr = "PlenioSongSheet";
function We(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function co(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function uo(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : co(e, n);
}
function fo(e, t) {
  const n = uo(e, t);
  return n && (n.comfyClass ?? n.type) === wr && We(n) ? n : null;
}
function vr(e) {
  return fo(e, "context_lyrics");
}
function xr(e) {
  return fo(e, "context_score");
}
function _r(e, t, n) {
  const o = [], s = uo(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((l, f) => {
        const p = co(i, f);
        p && o.push(p);
      });
    }
  }
  return !1;
}
function Sr(e, t, n) {
  const o = vr(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = _e(We(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && xe(a) !== xe(s) && (l = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: l, replans: _r(o, e, "score") } };
}
function kr(e, t, n) {
  const o = We(e);
  if (!o) return;
  const s = _e(o.value) ?? ct();
  o.value = Re(qn(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Er(e, t, n) {
  const o = xr(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = _e(We(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let l = null;
  return i === null ? l = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && xe(a) !== xe(s) && (l = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: l } };
}
function Mr(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function $r(e, t, n, o = null) {
  const s = We(e);
  if (!s) return null;
  const r = _e(s.value) ?? ct(), i = qn(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = Re(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await Io(o.fetcher, {
      sheet_state: i,
      upstream: es(n),
      owned: n.owned,
      review: Mr(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null
    });
    if (!!a.findings.some((p) => p.severity === "error") || !a.fingerprint) return i;
    const f = Zo(i, a.fingerprint);
    return s.value = Re(f), e.setDirtyCanvas?.(!0, !0), f;
  } catch {
    return i;
  }
}
const po = "PLENIO_SHEET_STATE", yn = 68;
let rt = null;
function Ar(e) {
  rt = e;
}
const Lr = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const r = document.createElement("span");
  r.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.className = "plenio-sheet-open", i.textContent = "Edit Song Sheet…";
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", s.append(i, r, a);
  let l = !1;
  const f = () => {
    const S = ke(String(e.id)), E = Nt(e);
    r.textContent = Qo(_e(o)) + (S && E !== "approved" ? ` · ${S.status}` : ""), a.textContent = Ws(E), a.dataset.state = E ?? "";
    const j = l ? null : e.widgets?.find((u) => u.name === "review");
    if (j) {
      l = !0;
      const u = j.callback;
      j.callback = (H) => {
        u?.(H), f();
      };
    }
  }, p = e.addDOMWidget(t, po, s, {
    getValue: () => o,
    setValue: (S) => {
      o = typeof S == "string" ? S : "", f();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => yn,
    getMaxHeight: () => yn
  });
  i.addEventListener("click", (S) => {
    S.stopPropagation(), g().catch((E) => {
      console.error("Plenio: the Song Sheet editor could not open", E), r.textContent = `The editor could not open: ${E instanceof Error ? E.message : String(E)}`;
    });
  });
  async function g() {
    const S = _e(o);
    S === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const E = ke(String(e.id)), u = (e.inputs ?? []).filter((L) => L.link != null).map((L) => L.name), H = S ?? { schema: "plenio.sheet_state/1", docs: {} }, A = E?.owned ?? Cn(u, H), b = String(e.widgets?.find((L) => L.name === "review")?.value ?? "continue"), m = b === "as the brief says" ? E?.review ?? "continue" : b, y = () => Dt(import.meta.url, Pt), { openSheetDialog: w } = await Oe(() => import("./open-DT7YxZQS.mjs"), y), { parseGuide: q, serializeGuide: M } = await Oe(() => import("./tracks-DxmZeggM.mjs"), y), { parseShift: V, parseSpans: D } = await Oe(() => import("./lyricPlacement-rAf-x_fn.mjs"), y);
    if (!rt) throw new Error("Plenio: API not initialised");
    let z = null;
    try {
      z = Sr(e, E, ke);
    } catch (L) {
      console.warn("Plenio: the lyrics sheet of this score was not found", L);
    }
    let P = null;
    try {
      P = Er(e, E, ke);
    } catch (L) {
      console.warn("Plenio: the score sheet of these lyrics was not found", L);
    }
    const W = rt;
    w({
      title: e.title || "Song Sheet",
      state: H,
      payload: E,
      asrNote: Bs(E?.docs.lyrics?.upstream_sha256),
      owned: A.length ? A : [...je],
      review: m,
      fetcher: rt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: q(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: D(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: V(e.properties?.plenio_source_shift),
      lyricsTarget: z?.target ?? null,
      scoreTarget: P?.target ?? null,
      onApply: (L, de, Q, N, C, se) => {
        const Fe = String(p.value ?? "");
        if (p.value = Re(L), e.properties = {
          ...e.properties ?? {},
          plenio_guide: M(de),
          plenio_lyric_spans: (se?.lyricSpans ?? []).map((re) => [...re]),
          plenio_source_shift: se?.sourceShift ?? 0
        }, C ? Ae(e, "approved") : String(p.value) !== Fe && k(e), Q !== null && z && !z.target.blocked && (kr(z.owner, Q, ke(String(z.owner.id))), k(z.owner)), N && P && !P.target.blocked) {
          const re = P.owner;
          $r(re, N.text, ke(String(re.id)), N.approved ? { fetcher: W } : null).then(
            (X) => {
              X?.review?.approved_fingerprint ? Ae(re, "approved") : k(re);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function k(S) {
    Fn(S) === "approved" && Ae(S, null);
  }
  const _ = [
    Ds((S) => {
      S === String(e.id) && f();
    }),
    Vs((S) => {
      (S === null || S === e) && f();
    })
  ], R = e.onRemoved;
  return e.onRemoved = function() {
    for (const S of _) S();
    R?.call(this);
  }, f(), { widget: p };
}, Be = "plenio.stem_mix/1", Le = "rest", Nr = ["reverb", "delay"], ho = -60, Tr = 12;
function qr() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function ne(e, t) {
  const n = e?.strips?.[t] ?? {};
  return {
    gain_db: typeof n.gain_db == "number" ? n.gain_db : 0,
    mute: n.mute === !0,
    solo: n.solo === !0,
    compression: typeof n.compression == "number" ? n.compression : 0,
    muted: Array.isArray(n.muted) ? n.muted.map((o) => [o[0], o[1]]) : [],
    reverb: typeof n.reverb == "number" ? n.reverb : 0,
    delay: typeof n.delay == "number" ? n.delay : 0,
    save: n.save === !0
  };
}
function mo(e) {
  const t = qr();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Cr = ["vocals", "drums", "bass", "other"];
function Ir() {
  return [...Cr, Le];
}
function Or(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Be, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Be || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function zr(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || mo(ne(e, o))) continue;
    const s = {}, r = ne(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: Be, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function lt(e, t, n) {
  const o = { ...e.strips };
  return mo(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function Rr(e, t, n) {
  const o = n.some((r) => ne(e, r).solo), s = ne(e, t);
  return o ? s.solo : !s.mute;
}
function wn(e) {
  return e <= ho ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Dr(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function Pr(e, t, n) {
  return Dr([...e, [t, n]]);
}
function Br(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function Hr(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function jr(e, t, n, o) {
  const s = ne(e, t);
  return lt(e, t, { ...s, muted: Pr(s.muted, n, o) });
}
function Wr(e, t, n) {
  const o = ne(e, t), s = Br(o.muted, n);
  return s < 0 ? e : lt(e, t, { ...o, muted: Hr(o.muted, s) });
}
function Fr(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function Gr(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function vn(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Ir()).filter((r) => r !== Le), s = Object.keys(e?.strips ?? {}).filter((r) => r !== Le && !o.includes(r));
  return [...o, ...s, Le];
}
const xn = "plenio_stem_mixer", _n = "mix", he = 200, Vr = ["room", "plate", "hall"];
function O(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function et(e, t, n, o, s) {
  const r = O("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function Xr(e) {
  const t = O("div", "plenio-mix"), n = O("div", "plenio-mix-strips"), o = O("div", "plenio-mix-buses"), s = O("div", "plenio-mix-info"), r = O("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: Be, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: vn(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const l = () => e.widgets?.find((b) => b.name === _n);
  function f(b, { draw: m = !0 } = {}) {
    const y = l();
    if (!y) return;
    const w = zr(b);
    y.value = w, y.callback?.(w), i = { ...i, mix: b }, m && _();
  }
  function p(b, m, y = {}) {
    f(lt(i.mix, b, { ...ne(i.mix, b), ...m }), y);
  }
  function g(b, m, y, w = {}) {
    const q = ne(i.mix, b);
    let M = lt(i.mix, b, { ...q, [m]: y });
    y > 0 && !(M[m] && Object.keys(M[m]).length) && (M = m === "reverb" ? { ...M, reverb: { preset: "room" } } : { ...M, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), f(M, w);
  }
  function k(b, m, y) {
    const w = { ...i.mix[b] ?? {} };
    f({ ...i.mix, [b]: { ...w, [m]: y } });
  }
  function _() {
    n.replaceChildren();
    const b = i.names;
    for (const m of i.names) {
      const y = ne(i.mix, m), w = O("div", "plenio-mix-strip");
      w.dataset.strip = m;
      const q = O("span", "name", m === Le ? `${m} (missed)` : m);
      q.title = m === Le ? "What the separator missed: keeps a neutral mix exact" : "";
      const M = et(ho, Tr, 0.5, y.gain_db, `${m} gain`), V = O("span", "gain", `${wn(y.gain_db)} dB`);
      M.addEventListener("input", () => {
        V.textContent = `${wn(Number(M.value))} dB`, p(m, { gain_db: Number(M.value) }, { draw: !1 });
      }), M.addEventListener("change", () => p(m, { gain_db: Number(M.value) }));
      const D = O("button", y.mute ? "toggle active" : "toggle", "M");
      D.setAttribute("aria-label", `${m} mute`), D.addEventListener("click", (N) => {
        N.stopPropagation(), p(m, { mute: !y.mute });
      });
      const z = O("button", y.solo ? "toggle active" : "toggle", "S");
      z.setAttribute("aria-label", `${m} solo`), z.addEventListener("click", (N) => {
        N.stopPropagation(), p(m, { solo: !y.solo });
      });
      const P = et(0, 1, 0.05, y.compression, `${m} compression`);
      P.title = "Compression amount: one knob for the master compressor (threshold and ratio)", P.addEventListener("input", () => p(m, { compression: Number(P.value) }, { draw: !1 })), P.addEventListener("change", () => p(m, { compression: Number(P.value) }));
      const W = Nr.map((N) => {
        const C = et(0, 1, 0.05, y[N], `${m} ${N} send`);
        return C.title = `${N} send: how much of this stem goes to the shared ${N} bus`, C.addEventListener("input", () => g(m, N, Number(C.value), { draw: !1 })), C.addEventListener("change", () => g(m, N, Number(C.value))), C;
      }), L = O("button", y.save ? "toggle active" : "toggle", "save");
      L.setAttribute("aria-label", `${m} save as its own file`), L.setAttribute("aria-pressed", String(y.save)), L.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', L.addEventListener("click", (N) => {
        N.stopPropagation(), p(m, { save: !y.save });
      });
      const de = Rr(i.mix, m, b);
      w.classList.toggle("silent", !de);
      const Q = O("canvas", "plenio-mix-wave");
      Q.width = he, Q.height = 26, Q.setAttribute("aria-label", `${m} waveform (drag to mute a time range)`), R(Q, y, Gr(i.peaks, m, he)), Q.addEventListener("pointerdown", (N) => S(N, Q, m)), w.append(
        q,
        M,
        V,
        D,
        z,
        O("span", "label", "comp"),
        P,
        O("span", "label", "verb"),
        W[0],
        O("span", "label", "delay"),
        W[1],
        L,
        Q
      ), n.append(w);
    }
    E(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function R(b, m, y) {
    const w = b.getContext("2d");
    if (!w) return;
    w.clearRect(0, 0, he, b.height);
    const q = b.height / 2;
    w.strokeStyle = "rgba(180, 190, 205, 0.8)", w.beginPath();
    for (let M = 0; M < y.length; M++) {
      const V = Math.max(1, y[M] * (q - 1));
      w.moveTo(M + 0.5, q - V), w.lineTo(M + 0.5, q + V);
    }
    w.stroke(), w.fillStyle = "rgba(224, 104, 94, 0.35)", w.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [M, V] of m.muted) {
      const D = Math.max(0, Math.min(he, M / Math.max(i.seconds, 1e-6) * he)), z = Math.max(0, Math.min(he, V / Math.max(i.seconds, 1e-6) * he));
      w.fillRect(D, 0, Math.max(1, z - D), b.height), w.strokeRect(D + 0.5, 0.5, Math.max(1, z - D) - 1, b.height - 1);
    }
  }
  function S(b, m, y) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const w = m.getBoundingClientRect(), q = (W) => Math.max(0, Math.min(1, (W - w.left) / (w.width || he))) * i.seconds, M = q(b.clientX);
    if (ne(i.mix, y).muted.some(([W, L]) => W <= M && M <= L)) {
      f(Wr(i.mix, y, M));
      return;
    }
    let D = M;
    const z = (W) => {
      D = q(W.clientX);
    }, P = () => {
      window.removeEventListener("pointermove", z), window.removeEventListener("pointerup", P), f(jr(i.mix, y, Math.min(M, D), Math.max(M, D)));
    };
    window.addEventListener("pointermove", z), window.addEventListener("pointerup", P);
  }
  function E() {
    o.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, m = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, y = O("select");
    y.setAttribute("aria-label", "Reverb preset"), y.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const M of Vr) y.append(new Option(M, M));
    y.value = String(b.preset ?? "room"), y.addEventListener("change", () => k("reverb", "preset", y.value));
    const w = O("input");
    w.type = "number", w.value = String(m.time_ms ?? 375), w.setAttribute("aria-label", "Delay time in ms"), w.title = "Delay time in ms: where the first echo of the delay bus sits", w.addEventListener("change", () => k("delay", "time_ms", Number(w.value)));
    const q = et(0, 0.8, 0.05, Number(m.feedback ?? 0.35), "Delay feedback");
    q.title = "Delay feedback: how much of each echo returns into the delay line", q.addEventListener("input", () => k("delay", "feedback", Number(q.value))), o.append(
      O("span", "label", "reverb bus"),
      y,
      O("span", "label", "delay bus"),
      w,
      O("span", "label", "ms, feedback"),
      q
    ), o.style.display = "flex";
  }
  const j = e.addDOMWidget(xn, xn, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  const u = e.widgets?.find((b) => b.name === _n), H = O("button", "toggle", "JSON");
  H.title = "Show or hide the raw mixer value", H.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, H.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(O("span", "label", "Advanced"), H), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function A() {
    const b = Or(l()?.value);
    i = { ...i, mix: b ?? { schema: Be, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), _();
  }
  return A(), {
    showExecuted(b) {
      const m = b?.plenio_stems?.at(-1), y = Fr(b), w = vn(i.mix, m ?? null);
      i = { ...i, names: w, peaks: y, seconds: Number(m?.seconds ?? i.seconds) || 0 }, A();
    }
  };
}
const Ur = `
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
function Yr() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Ur, document.head.append(e);
}
function Tt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function tt(e) {
  return Tt(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Jr(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Qr(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...l] = s, f = (p, g) => `<tr>${p.map((k) => `<${g}>${tt(k)}</${g}>`).join("")}</tr>`;
      t.push(`<table><thead>${f(a, "th")}</thead><tbody>${l.map((p) => f(p, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${Tt(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const p = Jr(a);
      p && (s ??= []).push(p);
      continue;
    }
    if (i(), a.startsWith("```")) {
      r(), o = [];
      continue;
    }
    const l = /^(#{1,4})\s+(.*)$/.exec(a);
    if (l) {
      r();
      const p = Math.min(l[1].length + 2, 6);
      t.push(`<h${p}>${tt(l[2])}</h${p}>`);
      continue;
    }
    const f = /^\s*[-*]\s+(.*)$/.exec(a);
    if (f) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${tt(f[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${tt(a)}</p>`);
  }
  return r(), i(), o !== null && t.push(`<pre><code>${Tt(o.join(`
`))}</code></pre>`), t.join("");
}
const ze = "plenio_summary", Sn = "plenio_summary", kn = 84, Kr = 18, Zr = 55, ei = 16;
function ti(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / Zr)), 0);
  return ei + t * Kr;
}
function ni(e, t) {
  const n = e.widgets?.find((r) => r.name === Sn);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  const s = e.addDOMWidget(Sn, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => kn,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () => Math.max(kn, o.scrollHeight ? o.scrollHeight + 2 : ti(t.markdown))
  });
  return s.serialize = !1, o;
}
function oi(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const En = /* @__PURE__ */ new WeakMap();
function qt(e, t) {
  if (!t.markdown) return;
  const n = En.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, En.set(e, n);
  const o = ni(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = Qr(t.markdown), oi(e), e.setDirtyCanvas?.(!0, !0);
}
function Mn(e, t, n, o) {
  const s = e.properties?.[ze], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((l) => l.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[ze] = a, qt(e, a);
}
function si(e) {
  e.prototype.onExecuted = ce(e.prototype.onExecuted, function(t) {
    const n = t?.[ze], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[ze] = { markdown: o.markdown, status: o.status ?? "" }, qt(this, o));
  }), e.prototype.onConfigure = ce(e.prototype.onConfigure, function() {
    const t = this.properties?.[ze];
    t?.markdown && qt(this, t);
  });
}
const ri = "Plenio.Core", te = Co;
Ar(te);
const be = Ln, $n = { app: be, fetcher: te }, go = () => be.graph;
function Ct(e) {
  if (e == null) return null;
  const t = String(e);
  return go()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
const ii = {
  scale: () => be.canvas?.ds?.scale ?? 1,
  toast: (e, t) => be.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, bo = () => Dt(import.meta.url, Pt), ai = {
  fetcher: te,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Oe(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      bo,
      "The sheet music is drawn and saved then."
    ), i = r(e, t, n, o);
    try {
      if (!i.lines.length) throw new Error("the score has no music to draw");
      return await s(i.lines, n, t);
    } finally {
      i.dispose();
    }
  }
};
function li(e, t) {
  const n = Ct(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function ci(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = li(t, e.job.file);
  if ("saved" in e) {
    o && Mn(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), be.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof ue && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && Mn(o, n, `${n} - not saved: ${r}`, "warning"), be.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const It = /* @__PURE__ */ new Map(), An = new yr(ai, (e) => {
  ci(e, It.get(e.job.token)), It.delete(e.job.token);
});
Ln.registerExtension({
  name: ri,
  getCustomWidgets: () => ({ [po]: Lr }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: Kt,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => ps($n).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), be.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    }
  ],
  menuCommands: [{ path: ["File"], commands: [Kt] }],
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => Gs(),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    si(e), Zs(e, ii);
    const n = vs(t.input);
    if (n.size || t.name in Ht) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = Rs(t, s), i = ms(r), a = o?.call(this, r);
        return ws(this, i, n), zs(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = ce(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) Ps(s);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Ts(this, te));
      }, e.prototype.onExecuted = ce(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (Yo.has(t.name) && Jo(e, te), t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Xr(this));
      }, e.prototype.onExecuted = ce(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = ce(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && un(String(this.id), r);
    }));
  },
  setup() {
    Yr(), fs($n), te.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      un(String(o.node_id), o);
      const s = Ct(o.node_id);
      s && Ae(s, Wn(o));
    }), te.addEventListener("execution_start", () => {
      Fs(go()?.nodes ?? []);
    }), te.addEventListener("execution_error", (n) => {
      const o = Ct(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Ae(o, "error");
    }), te.addEventListener("executed", (n) => {
      const o = n.detail, s = hr(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) It.set(i.token, r);
      An.take(s);
    });
    const e = () => {
      An.recover();
    };
    let t = !1;
    te.addEventListener("reconnected", () => {
      bo().then((n) => {
        n ? t || (t = !0, be.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: $t })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  Io as $,
  Jn as A,
  eo as B,
  Kn as C,
  xe as D,
  Bi as E,
  Ri as F,
  gn as G,
  Pi as H,
  rr as I,
  gi as J,
  mi as K,
  Fi as L,
  Di as M,
  Zn as N,
  Mi as O,
  ue as P,
  Hi as Q,
  Qn as R,
  to as S,
  Y as T,
  fi as U,
  _i as V,
  ki as W,
  xi as X,
  Ei as Y,
  Re as Z,
  Si as _,
  yi as a,
  es as a0,
  Zo as a1,
  zi as a2,
  cr as a3,
  ji as a4,
  qn as a5,
  ri as a6,
  pi as b,
  Li as c,
  Un as d,
  Ai as e,
  sr as f,
  qi as g,
  Ci as h,
  bi as i,
  Ni as j,
  Ti as k,
  vi as l,
  at as m,
  tr as n,
  Se as o,
  $i as p,
  Ii as q,
  ro as r,
  Oi as s,
  hi as t,
  Ke as u,
  wi as v,
  ir as w,
  dr as x,
  so as y,
  Wi as z
};
