import { api as Br } from "../../../../scripts/api.js";
import { app as fs } from "../../../../scripts/app.js";
class J extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ie(e, t, n) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), s = await o.json();
  if (!o.ok) {
    const r = s?.error ?? {};
    throw new J(r.message ?? `Request failed (${o.status})`, r.hint ?? null);
  }
  return s;
}
function Dr(e, t) {
  return ie(e, "/plenio/sheet/resolve", t);
}
async function Ku(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
const ps = "Plenio.SectionTags";
async function Qu(e) {
  try {
    const t = await e.fetchApi(`/settings/${ps}`);
    if (!t.ok) return [];
    const n = await t.json();
    return Array.isArray(n) ? n.filter((o) => typeof o == "string") : [];
  } catch {
    return [];
  }
}
async function Ju(e, t) {
  const n = await e.fetchApi(`/settings/${ps}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (!n.ok) throw new J(`Your section tags could not be kept (HTTP ${n.status}).`);
}
function Hn(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Zu(e, t, n, o) {
  return ie(e, "/plenio/score/analyze", Hn({ abc: t }, n, o));
}
function ed(e, t, n, o, s) {
  return ie(e, "/plenio/score/transform", Hn({ abc: t, operation: n }, o, s));
}
function td(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return ie(e, "/plenio/score/musicxml/export", Hn(s, n, o));
}
function nd(e, t) {
  const { lyrics: n, ...o } = t;
  return ie(e, "/plenio/score/musicxml/import", n ? { ...o, lyrics: n } : o);
}
function od(e, t) {
  return ie(e, "/plenio/score/midi/export", t);
}
function sd(e, t) {
  return ie(e, "/plenio/score/midi/import", t);
}
function rd(e, t) {
  return ie(e, "/plenio/lyrics/analyze", t);
}
function id(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function to(e, t, n, o = 200) {
  return ie(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function qr(e, t) {
  return ie(e, "/plenio/brief/fields", t);
}
async function zr(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new J(`Request failed (${t.status})`);
  return await t.json();
}
async function ad(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new J(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function Hr(e, t) {
  return ie(e, "/plenio/records/continue", t);
}
function hs(e, t, n = !1) {
  return ie(e, "/plenio/workflow/blocks", n ? { workflow: t, models: !0 } : { workflow: t });
}
function K(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const kn = "Plenio · ", Fr = /* @__PURE__ */ new Set(["YuE2GenerateABC", "YuE2GenerateMusic", "PlenioComposePrompt", "PlenioComposeArrangement"]), Wr = "PlenioCreativity";
function ms(e) {
  const t = e?.definitions?.subgraphs;
  return Array.isArray(t) ? t : [];
}
function jr(e) {
  return ms(e).some((t) => {
    if (typeof t?.name != "string" || !t.name.startsWith(kn)) return !1;
    const n = new Set((t.nodes ?? []).map((o) => o?.type));
    return !n.has(Wr) && [...n].some((o) => Fr.has(String(o)));
  });
}
async function Gr(e, t) {
  if (!e || typeof e != "object" || !jr(e)) return null;
  const n = await hs(t, e);
  if (n.workflow) {
    const o = e;
    for (const s of Object.keys(o)) delete o[s];
    Object.assign(o, n.workflow);
  }
  return n;
}
const Ct = (e) => e.startsWith(kn) ? e.slice(kn.length) : e, Pt = (e) => e.map(Ct).join(", "), Vr = /* @__PURE__ */ new Set(["Plenio · YuE2 Model", "Plenio · MiniMax Model", "Plenio · Cover Art"]), Zt = "Plenio.ModelBlocksUpToDate";
function Ur(e) {
  return ms(e).filter((t) => typeof t?.name == "string" && Vr.has(t.name)).filter((t) => !(t.nodes ?? []).some((n) => n?.type === "PlenioModelChoice")).map((t) => String(t.name));
}
function Yr(e) {
  const t = Ur(e);
  return t.length ? {
    severity: "info",
    summary: "Model blocks of Plenio 1.x",
    detail: `${Pt(t)} load the files they name, as before. Plenio › Bring the model blocks up to date gives them Model Choice - the field shows what the file is and what auto would take - and keeps your files.`
  } : null;
}
function Xr(e) {
  if (!e) return [];
  const t = [];
  return e.updated.length && t.push({
    severity: "info",
    summary: "Model blocks brought up to date",
    detail: `${Pt(e.updated)} choose their files with Model Choice now; each keeps the file it loaded. Set a field to auto to let Plenio choose for the computer that runs it. Save the workflow to keep it.`
  }), e.kept.length && t.push({
    severity: "warn",
    summary: "Some model blocks were kept as they were",
    detail: `${e.kept.map(([n, o]) => `${Ct(n)} (${o})`).join("; ")}. They load the files they name.`
  }), !e.updated.length && !e.kept.length && t.push({ severity: "info", summary: "Nothing to bring up to date", detail: "The model blocks are the current ones." }), t;
}
function Kr(e) {
  if (!e) return [];
  const t = [];
  if (e.updated.length) {
    const o = e.linked.length ? ` The creativity of ${Pt(e.linked)} now comes from the brief.` : "";
    t.push({
      severity: "info",
      summary: "Plenio blocks brought up to date",
      detail: `This workflow was saved before its blocks followed the brief's creativity: ${Pt(e.updated)} are the current blocks now.${o} At creativity 50 they work exactly as before. Save the workflow to keep it.`
    });
  }
  const n = [
    ...e.kept.map(([o, s]) => `${Ct(o)} was kept as it was (${s}) - its sampling stays fixed`),
    ...e.unlinked.map(([o, s]) => `${Ct(o)} has its own creativity slider (${s})`)
  ];
  return n.length && t.push({
    severity: "warn",
    summary: "The brief's creativity does not reach every block",
    detail: `${n.join("; ")}. The template, opened again from the template browser, has the current blocks.`
  }), t;
}
const Qr = "Plenio · ", Sn = 16384, Jr = 24576, no = [1024, 2048, 6144], Zr = [8192, 12288], ei = {
  TextGenerate: [[1, no, Sn]],
  PlenioLocalLLM: [
    [4, no, Sn],
    [7, Zr, Jr]
  ]
};
function ti(e) {
  const t = e?.definitions?.subgraphs;
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    if (typeof o?.name != "string" || !o.name.startsWith(Qr)) continue;
    let s = !1;
    for (const r of o.nodes ?? []) {
      const i = r?.widgets_values, a = ei[String(r?.type)];
      if (!(!a || !Array.isArray(i)))
        for (const [c, l, d] of a)
          typeof i[c] == "number" && l.includes(i[c]) && (i[c] = d, s = !0);
    }
    s && n.push(o.name);
  }
  return n;
}
const Nt = "✎ type your own …", gs = ["genre", "mood", "tempo", "key", "meter", "language", "voice", "theme", "lead_instrument"], ni = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].flatMap((e) => [`${e} major`]), oi = ["A", "E", "B", "F#", "C#", "G#", "D", "G", "C", "F", "Bb", "Eb"].map((e) => `${e} minor`), si = {
  key: [...ni, ...oi],
  meter: ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"],
  language: ["English", "German", "Spanish", "French", "Italian", "Portuguese", "Dutch", "Japanese", "Korean", "Chinese"],
  tempo: ["60 BPM", "80 BPM", "90 BPM", "100 BPM", "110 BPM", "120 BPM", "128 BPM", "140 BPM", "174 BPM"]
};
function ri(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of [...t[e] ?? [], ...si[e] ?? []]) {
    const r = String(s).replace(/\s+/g, " ").trim();
    r && !n.has(r.toLowerCase()) && n.set(r.toLowerCase(), r);
  }
  const o = [...n.values()].sort((s, r) => s.localeCompare(r, void 0, { sensitivity: "base" }));
  return ["", Nt, ...o];
}
function ii(e, t) {
  if (!Array.isArray(e) || e[0] !== "STRING") return e;
  const n = e[1] ?? {};
  return n.multiline ? e : ["COMBO", { ...n, options: t, default: typeof n.default == "string" ? n.default : "" }];
}
function ai(e, t) {
  const n = [], o = (s, r) => {
    if (s)
      for (const [i, a] of Object.entries(s)) {
        if (gs.includes(i)) {
          const d = ii(a, ri(i, t));
          d !== a && (s[i] = d, n.push(r + i));
          continue;
        }
        const l = (Array.isArray(a) ? a[1] : void 0)?.options;
        if (Array.isArray(l))
          for (const d of l) {
            const p = d?.inputs;
            o(p?.required, `${i}.`), o(p?.optional, `${i}.`);
          }
      }
  };
  return o(e.input?.required, ""), o(e.input?.optional, ""), [...new Set(n)];
}
const ws = (e) => e.name.split(".").pop() ?? e.name;
function ci(e) {
  return gs.includes(ws(e)) && Array.isArray(e.options?.values);
}
function oo(e) {
  const t = e.options.values, n = typeof e.value == "string" ? e.value : "";
  n && n !== Nt && !t.includes(n) && t.splice(2, 0, n);
}
function Mn(e, t) {
  ys.set(e, t);
  const n = so.get(e) ?? /* @__PURE__ */ new WeakSet();
  so.set(e, n);
  for (const o of e.widgets ?? []) {
    if (!ci(o) || (oo(o), n.has(o))) continue;
    n.add(o);
    let s = typeof o.value == "string" && o.value !== Nt ? o.value : "";
    const r = o.callback;
    o.callback = function(i) {
      if (i !== Nt) {
        s = typeof i == "string" ? i : "", r?.call(this, i);
        return;
      }
      o.value = s, t(ws(o), s).then((a) => {
        const c = a?.replace(/\s+/g, " ").trim();
        c && (o.value = c, oo(o), o.callback?.(c), e.setDirtyCanvas?.(!0, !0));
      });
    };
  }
}
const so = /* @__PURE__ */ new WeakMap(), ys = /* @__PURE__ */ new WeakMap();
function li(e) {
  const t = ys.get(e);
  t && Mn(e, t);
}
let ro = null;
const ui = 8e3;
function di(e) {
  const t = e.fetchApi("/plenio/brief/choices").then(async (n) => n.ok ? (await n.json()).values ?? {} : {}).catch(() => ({}));
  return ro ??= Promise.race([t, new Promise((n) => setTimeout(() => n({}), ui))]), ro;
}
async function fi(e, t, n, o) {
  const s = await di(n);
  if (!Object.keys(s).length) return;
  ai(t, s);
  const r = e.prototype;
  r.onNodeCreated = K(r.onNodeCreated, function() {
    Mn(this, o);
  }), r.onConfigure = K(r.onConfigure, function() {
    Mn(this, o);
  });
}
const Ht = [
  "description",
  "genre",
  "mood",
  "tempo",
  "key",
  "meter",
  "language",
  "voice",
  "theme",
  "lyrics",
  "lead_instrument"
], bs = ["length", "vocals", "melody"], Fn = {
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
  lyrics: "vocals.lyrics",
  lyrics_from: "vocals.lyrics_from",
  melody: "vocals.melody",
  lead_instrument: "vocals.lead_instrument"
}, pi = "my own, sung as written below", hi = "custom";
function vs(e) {
  return typeof e == "string" && e.trim().toLowerCase() === hi;
}
function re(e, t) {
  const n = Fn[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function mi(e) {
  const t = {};
  for (const n of [...Ht, ...bs, "lyrics_from"]) {
    const o = re(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function io(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
const xe = (e) => typeof e == "string" ? e : String(e ?? "");
function Ft(e) {
  return Object.keys(e.sources).filter((t) => Ht.includes(t));
}
function gi(e, t, n = {}) {
  const o = [];
  for (const i of Ft(t)) {
    const a = re(e, i);
    if (!a) continue;
    const c = xe(a.value), l = t.fields[i] ?? "", d = (n[i] ?? []).includes(c);
    (!c.trim() || d) && c !== l && o.push({ field: i, value: l });
  }
  const s = re(e, "lyrics"), r = [...n.lyrics ?? [], t.fields.lyrics ?? ""].filter(Boolean);
  return s && xe(re(e, "lyrics_from")?.value) === pi && r.includes(xe(s.value)) && o.push({ field: "lyrics", value: "" }), o;
}
function ao(e, t) {
  const n = [];
  for (const o of Ft(t)) {
    const s = re(e, o), r = t.fields[o] ?? "";
    s && xe(s.value) !== r && n.push({ field: o, value: r });
  }
  return n;
}
function wi(e, t) {
  const n = { template: [], own: [] };
  for (const o of Ft(t)) {
    const s = xe(re(e, o)?.value).trim();
    s && n[s === (t.fields[o] ?? "").trim() ? "template" : "own"].push(o);
  }
  return n;
}
function xt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function yi(e, t, n) {
  if (!n || !t || t.template === "none") return null;
  const { template: o, own: s } = wi(e, t), r = [
    o.length ? `From the template: ${o.join(", ")}` : "",
    s.length ? `your own: ${s.join(", ")}` : ""
  ].filter(Boolean);
  return r.length ? r.join(" · ") : "The template has no text for these fields.";
}
function bi(e) {
  const t = e ? xt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function vi(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function xi(e) {
  const t = e?.mode;
  return t?.description ? `Creative mode ${t.name} (experimental): ${t.description}` : null;
}
function ki(e, t) {
  for (const n of t) {
    const o = re(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function xs(e) {
  const t = [];
  for (const n of Ht) {
    const o = re(e, n);
    !o || !vs(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const co = "plenio_brief_template", Si = 400, Mi = 250;
function _i(e, t) {
  let n = null, o = null;
  const s = {}, r = /* @__PURE__ */ new Set();
  let i = !1;
  const a = {}, c = (k) => {
    i = !0;
    try {
      ki(e, k);
      for (const A of k) a[A.field] = Date.now();
    } finally {
      i = !1;
    }
  }, l = () => Object.fromEntries(Object.entries(s).filter(([k]) => !r.has(k)));
  let d = !1, p = null, m;
  const g = document.createElement("div");
  g.className = "plenio-brief-template";
  const v = document.createElement("div");
  v.className = "line";
  const x = document.createElement("div");
  x.className = "hint";
  const N = document.createElement("div");
  N.className = "mode";
  const X = document.createElement("div");
  X.className = "actions", g.append(v, x, N, X);
  const u = (k, A, R) => {
    const P = document.createElement("button");
    return P.textContent = k, P.title = A, P.addEventListener("click", (H) => {
      H.stopPropagation(), R();
    }), X.append(P), P;
  }, S = u("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    if (!n) return;
    const k = xt(n);
    c(k);
    for (const A of k) r.delete(A.field);
    b();
  }), L = u("Refill from template", "Put the template’s value back into every text field you changed", () => {
    if (!n) return;
    const k = ao(e, n);
    if (!k.length) return;
    const A = k.map((R) => R.field).join(", ");
    if (window.confirm(`Replace your values in ${A} with the template's?`)) {
      c(k);
      for (const R of k) r.delete(R.field);
      b();
    }
  }), y = u("↻", "Ask again what the template fills", () => {
    G();
  }), b = () => {
    v.textContent = p ?? yi(e, n, d) ?? "No template: the fields hold your values only.", v.dataset.state = p ? "error" : d && n ? "ok" : "empty";
    const k = bi(n), A = vi(n);
    x.textContent = [k, A].filter(Boolean).join(" · "), x.style.display = x.textContent ? "" : "none", N.textContent = xi(n) ?? "", N.style.display = N.textContent ? "" : "none", X.style.display = d && n && n.template !== "none" ? "" : "none", S.disabled = !n || !xt(n).length, L.disabled = !n || !ao(e, n).length, y.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, M = (k) => {
    const A = String(e.widgets?.find((P) => P.name === "template")?.value ?? "none");
    if (k.template !== (A || "none")) return;
    if (o !== null && o !== k.template) {
      const P = io(e) === "cover", H = (F) => !r.has(F) && (P || (s[F] ?? []).includes(xe(re(e, F)?.value)));
      c(xt(k).filter((F) => H(F.field)));
    }
    const R = gi(e, k, l()).filter((P) => !r.has(P.field) || !xe(re(e, P.field)?.value).trim());
    R.length && c(R);
    for (const P of [...Ft(k), ...bs]) {
      const H = xe(re(e, P)?.value);
      H && H === (k.fields[P] ?? "") && !(s[P] ??= []).includes(H) && s[P].push(H);
    }
    o = k.template;
  }, _ = /* @__PURE__ */ new WeakSet(), C = () => {
    $i(e);
    for (const k of ["template", "arrangement", ...Object.keys(Fn)]) {
      const A = k === "template" || k === "arrangement" ? e.widgets?.find((R) => R.name === k) : re(e, k);
      !A || _.has(A) || (_.add(A), a[k] = Date.now(), A.callback = K(A.callback, () => {
        const R = Date.now() - (a[k] ?? 0) < Mi;
        !i && !R && k !== "template" && k !== "arrangement" && r.add(k), C(), G();
      }));
    }
    li(e);
  }, E = async () => {
    C();
    const k = String(e.widgets?.find((A) => A.name === "template")?.value ?? "none");
    try {
      const A = String(e.widgets?.find((R) => R.name === "arrangement")?.value ?? "");
      n = await qr(t, { fields: mi(e), template: k, kind: io(e), arrangement: A }), p = null, M(n);
    } catch (A) {
      n = null, p = `The template fields could not be read: ${A instanceof Error ? A.message : String(A)}`;
    }
    d = !0, b();
  };
  function G() {
    clearTimeout(m), m = setTimeout(() => {
      E();
    }, Si);
  }
  C();
  const B = e.addDOMWidget(co, co, g, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 128
  });
  B.serialize = !1, i = !0;
  try {
    xs(e);
  } finally {
    i = !1;
  }
  return b(), G(), {
    widget: B,
    refresh: G,
    answer: () => n,
    dispose: () => clearTimeout(m)
  };
}
const Ei = {
  "vocals.lyrics_from": "lyrics",
  "vocals.lyrics": "lyrics idea or text"
};
function $i(e) {
  for (const t of e.widgets ?? []) {
    const n = Ei[t.name];
    n && t.label !== n && (t.label = n);
  }
}
const lo = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Ai(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, _i(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), xs(this), n.get(this)?.refresh();
  };
}
const uo = "plenio.record/1", Ti = 2, Li = "PLNO", at = new TextEncoder().encode(`${Li}plenio.project/1\0`), fo = 32 * 2 ** 20;
class pe extends Error {
}
async function en(e, t, n) {
  return new Uint8Array(await e.slice(t, t + n).arrayBuffer());
}
function tn(e, t) {
  return e.length >= t.length && t.every((n, o) => e[o] === n);
}
async function Ci(e) {
  const t = e.stream().pipeThrough(new DecompressionStream("gzip")).getReader(), n = [];
  let o = 0;
  for (; ; ) {
    const { done: i, value: a } = await t.read();
    if (i) break;
    if (o += a.length, o > fo)
      throw await t.cancel(), new pe(`its Plenio project is larger than ${fo / 2 ** 20} MB`);
    n.push(a);
  }
  const s = new Uint8Array(o);
  let r = 0;
  for (const i of n)
    s.set(i, r), r += i.length;
  return new TextDecoder().decode(s);
}
async function ks(e) {
  if (!tn(await en(e, 0, 4), new TextEncoder().encode("fLaC"))) throw new pe("it is not a FLAC file");
  let t = 4;
  for (; ; ) {
    const n = await en(e, t, 4);
    if (n.length < 4) throw new pe("the file ends inside its metadata");
    const o = n[1] << 16 | n[2] << 8 | n[3];
    if ((n[0] & 127) === Ti && o >= 4) {
      const s = await en(e, t + 4, Math.min(o, at.length));
      if (tn(s, at.subarray(0, 4))) {
        if (!tn(s, at)) throw new pe("it holds a Plenio project of an unknown layout (made by a newer Plenio)");
        let r;
        try {
          r = await Ci(e.slice(t + 4 + at.length, t + 4 + o));
        } catch (a) {
          throw a instanceof pe ? a : new pe(`its Plenio project is damaged (${a instanceof Error ? a.message : String(a)})`);
        }
        let i;
        try {
          i = JSON.parse(r);
        } catch {
          throw new pe("its Plenio project is damaged (no JSON)");
        }
        if (i?.schema !== uo)
          throw new pe(`its Plenio project is no release record (${uo})`);
        return i;
      }
    }
    if (n[0] & 128) return null;
    t += 4 + o;
  }
}
function Ss(e) {
  return /\.flac$/i.test(e.name ?? "") || e.type === "audio/flac" || e.type === "audio/x-flac";
}
const Wn = "plenio.sheet_state/1", Ze = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Wt() {
  return { schema: Wn, docs: {} };
}
function $e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Wt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Wn || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Xe(e) {
  const t = {};
  for (const o of Ze) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: Wn, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function nn(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Pi(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ze.filter((o) => nn(e, o) !== "auto").map(
    (o) => o === "lyrics" && nn(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${nn(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function cd(e) {
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
const ld = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function ud(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function dd(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function po(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function fd(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: po(s?.[0] ?? 0), end: po(r?.[1] ?? e.duration_s) };
  }) : [];
}
function Ee(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, o = t.length;
  for (; n < o && !t[n]; ) n++;
  for (; o > n && !t[o - 1]; ) o--;
  return t.slice(n, o).join(`
`);
}
function Ni(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function pd(e, t, n) {
  return n.map((o) => ({ kind: o, text: Ni(e, t, o), intent: "keep" }));
}
function Ms(e, t, n) {
  const o = { ...e.docs };
  for (const r of n) {
    const i = e.docs[r.kind], a = t?.docs[r.kind], c = Ee(r.text);
    if (r.intent === "auto")
      delete o[r.kind];
    else if (r.intent === "manual")
      o[r.kind] = { state: "manual", text: c };
    else if (r.intent === "rebase")
      a?.upstream_sha256 ? o[r.kind] = { state: "edited", text: c, base_sha256: a.upstream_sha256 } : o[r.kind] = { state: "manual", text: c };
    else if (i)
      Ee(i.text) !== c && (o[r.kind] = { ...i, text: c });
    else {
      const l = Ee(a?.upstream ?? "");
      if (c === l) continue;
      o[r.kind] = a?.upstream_sha256 ? { state: "edited", text: c, base_sha256: a.upstream_sha256 } : { state: "manual", text: c };
    }
  }
  const s = { ...Wt(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function Oi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function _s(e, t) {
  return Ze.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Ii(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Ri = "PlenioSongSheet";
function Es(e) {
  return e.nodes ?? e._nodes ?? [];
}
function Bi(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? Es(e).find((o) => String(o.id) === t) ?? null;
}
function on(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = Bi(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function Di(e, t) {
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
function qi(e, t) {
  const n = { values: 0, missing: [], sheets: 0, activated: 0 };
  for (const o of t.activate) {
    const s = on(e, o);
    s && s.mode !== 0 && (s.mode = 0, n.activated++);
  }
  for (const [o, s] of Object.entries(t.values)) {
    const r = on(e, o);
    if (!r) {
      n.missing.push(...Object.keys(s).map((a) => `${o}: ${a}`));
      continue;
    }
    const i = Di(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = on(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function zi(e, t) {
  let n = 0;
  for (const o of Es(e)) {
    if (o.type !== Ri) continue;
    const s = o.widgets?.find((p) => p.name === "sheet_state");
    if (!s) continue;
    const r = $e(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), a = _s(i, r), c = (a.length ? a : [...Ze]).filter((p) => !!t[p]);
    if (!c.length) continue;
    const l = { ...r.docs };
    for (const p of c) l[p] = { state: "manual", text: t[p] };
    const d = Xe({ ...r, docs: l, review: void 0 });
    s.value = d, s.callback?.(d), n++;
  }
  return n;
}
function Hi(e, t) {
  return (e.split(/[\\/]/).pop() ?? "").replace(/\.plenio\.json$/i, "").replace(/\.(json|flac)$/i, "") || t || "Plenio song";
}
function sn(e, t) {
  const n = [e.plenio && `Plenio ${e.plenio}`, e.created.slice(0, 10)].filter(Boolean).join(", "), o = t?.sheets ? " Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again." : "";
  if (e.from === "record") return `"${e.title}" opened in the workflow it was made with (${n}).${o}`;
  if (e.from === "template") {
    const s = e.unplaced.length ? ` ${e.unplaced.length} node(s) of the song have no place in today's template: ${e.unplaced.join(", ")}.` : "";
    return `"${e.title}" (${n}) opened in today's template "${e.template}" with the song's settings.${o}${s}`;
  }
  return `The workflow "${e.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`;
}
const _n = "Plenio was updated while this page was open: reload the page (F5).";
function Fi(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function Wi(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function jn(e, t) {
  const n = Fi(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? Wi(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function Gn(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Pe(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${_n} ${n}` : _n) : o;
  }
}
const rn = "Plenio.ContinueSong", ji = "plenio.record/1";
function En(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function Ot(e, t) {
  const n = await Hr(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, Hi("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = qi(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), En(e, "success", "Song opened", sn(n, i));
    return;
  }
  const o = e.app.graph, s = o ? zi(o, n.documents) : 0;
  if (!s)
    throw new J(
      sn(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  En(e, "success", "Song texts taken", `${sn(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function Gi(e) {
  if (Ss(e)) return ks(e);
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === ji ? t : null;
  } catch {
    return null;
  }
}
function ho(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function Vi(e, t) {
  const n = [...e.dataTransfer?.files ?? []];
  if (n.length !== 1 || !Ss(n[0]) || e.shiftKey) return null;
  const o = t.canvas, s = t.graph;
  if (!o?.canvas || e.target !== o.canvas || !o.convertEventToCanvasOffset || !s?.getNodeOnPos) return null;
  const [r, i] = o.convertEventToCanvasOffset(e);
  return s.getNodeOnPos(r, i) ? null : n[0];
}
function Ui(e, t = window) {
  const n = (o) => {
    const s = ho(o) ? null : Vi(o, e.app), r = s ?? ho(o);
    r && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      if (s) {
        const a = await ks(s);
        if (a) return Ot(e, { record: a, name: s.name });
        if (!e.app.handleFile) throw new J(`${s.name} carries no Plenio project.`, "Drop it with Shift held to give it to ComfyUI.");
        return e.app.handleFile(s);
      }
      const i = await Gi(r);
      if (!i) throw new J(`${r.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await Ot(e, { record: i, name: r.name });
    })().catch((i) => {
      const a = i instanceof pe ? `${r.name}: ${i.message}.` : i instanceof J && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
      En(e, "error", "Song not opened", a, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function mo(e) {
  const t = () => jn(import.meta.url, Gn), { openContinueDialog: n } = await Pe(() => import("./openContinue-DmyVmcGn.mjs"), t);
  n(e.fetcher, (o) => Ot(e, o));
}
const Yi = "COMFY_DYNAMICCOMBO_V3";
function Xi(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Ki(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Qi(e, t) {
  const n = Ki(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function Ji(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Zi(e, t, n) {
  if (!t || !e.widgets || Qi(e, t)) return !1;
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
    if (n.has(r.name) && !Ji(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function ea(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === Yi && t.add(o);
  return t;
}
const $s = "plenio.eq/1", kt = 8, ke = 20, ta = 2e4, De = 12, As = 15, Oe = ["peak", "low_shelf", "high_shelf"], Ts = ["peak", "notch", "highpass", "lowpass"], go = [0.2, 10], wo = [0.25, 1];
function Ce() {
  return { schema: $s, preamp_db: 0, bands: [] };
}
function na(e) {
  if (typeof e != "string" || !e.trim()) return Ce();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: $s,
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
function Ne(e) {
  return JSON.stringify(e);
}
const oe = (e, t) => Number(e.toFixed(t));
function ee(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ls(e) {
  return e.db ?? As;
}
const yo = [6, 12, 18], oa = { 6: 8, 12: 14, 18: 20 };
function sa(e, t) {
  return { ...e, db: oa[t] ?? As };
}
function _e(e, t) {
  return Math.log(ee(t, ke, e.maxHz) / ke) / Math.log(e.maxHz / ke) * e.width;
}
function bo(e, t) {
  return ke * (e.maxHz / ke) ** ee(t / e.width, 0, 1);
}
function be(e, t) {
  const n = Ls(e);
  return (1 - (ee(t, -n, n) + n) / (2 * n)) * e.height;
}
function vo(e, t) {
  const n = Ls(e);
  return (1 - ee(t / e.height, 0, 1)) * 2 * n - n;
}
function xo(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function ko(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${_e(e, o).toFixed(1)},${be(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function Vn(e) {
  return Math.min(ta, 0.45 * e);
}
function ra(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function ia(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= kt) return null;
  const s = {
    id: ra(e),
    enabled: !0,
    type: "peak",
    frequency_hz: oe(ee(t, ke, Vn(o)), 1),
    gain_db: oe(ee(n, -De, De), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function We(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: oe(ee(n, ke, Vn(s)), 1),
        gain_db: Oe.includes(r.type) ? oe(ee(o, -De, De), 1) : r.gain_db
      }
    )
  };
}
function an(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: oe(ee(o.q * n, 0.2, 10), 3) } : o)
  };
}
function cn(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function je(e) {
  const t = e.frequency_hz >= 1e3 ? `${oe(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Oe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${oe(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${oe(e.q, 2)}`;
}
function aa(e, t) {
  const n = Cs[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Oe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = Ts.includes(e.type) ? ` Q ${oe(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const Cs = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function ln(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), o = 1;
  if (t && /k$/i.test(n) && (o = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const s = Number(n) * o;
  return Number.isFinite(s) ? s : null;
}
function ct(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function St(e, t, n, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: oe(ee(ct(r.frequency_hz, s.frequency_hz), ke, Vn(o)), 1),
        gain_db: oe(ee(ct(r.gain_db, s.gain_db), -De, De), 1),
        q: oe(ee(ct(r.q, s.q), go[0], go[1]), 3),
        slope: oe(ee(ct(r.slope, s.slope), wo[0], wo[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function So(e, t) {
  return St(e, t, { gain_db: 0 });
}
function Mo(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((p) => Number.isFinite(p));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), c = e.height - 4, l = c - Math.max(12, e.height * ee(o, 0.1, 0.95));
  return `M${t.map((p, m) => {
    const g = n[m], v = Number.isFinite(g) ? (g - i) / a : 0;
    return `${_e(e, p).toFixed(1)},${(c - v * (c - l)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${c.toFixed(1)} L0,${c.toFixed(1)} Z`;
}
class ca {
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
    Ne(t) !== Ne(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const la = "http://www.w3.org/2000/svg", _o = "plenio_eq_panel", lt = "mode.bands", ge = { capture: !0 }, ae = { width: 560, height: 260 }, ut = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let un = null;
function de(e, t) {
  const n = document.createElementNS(la, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function Q(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function Me(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function fe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function ua(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function da(e, t) {
  const n = Q("div", "plenio-eq"), o = Q("div", "plenio-eq-tools"), s = Q("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = Q("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const f of yo) r.append(new Option(`±${f} dB`, String(f)));
  const i = Me("", "↶", "Undo the last band change"), a = Me("", "↷", "Redo the last band change"), c = Me("", "reset", "Remove every band"), l = Me("", "compare", "Show the curve without the EQ (bypass)"), d = Me("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), p = Q("span", "plenio-eq-info");
  p.setAttribute("aria-live", "polite"), p.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, c, l, d, p);
  const m = Q("div", "plenio-eq-mode"), g = de("svg", {
    viewBox: `0 0 ${ae.width} ${ae.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  g.setAttribute("aria-label", "EQ response curve"), g.setAttribute("tabindex", "0"), g.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const v = Q("div", "plenio-eq-strip"), x = Q("div", "plenio-eq-editor"), N = Q("div", "plenio-eq-fields");
  x.append(N), n.append(o, m, g, v, x);
  const X = e.addDOMWidget(_o, _o, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  X.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: Ce(), readonly: !0, note: "" }, S = null, L = null, y = !1, b = 12, M = null, _ = [], C = 0, E, G, B = null, k = !1;
  const A = /* @__PURE__ */ new Map();
  let R = null;
  const P = new ca(Ce()), H = () => fe(e, lt), F = () => b, q = () => sa({ ...ae, maxHz: Math.min(2e4, u.sampleRate / 2) }, F());
  function z(f, { record: w = !0 } = {}) {
    const h = H();
    if (!h) return;
    const $ = Ne(f);
    h.value = $, h.callback?.($), w && P.push(f), u = { ...u, settings: f }, Z(), Y(0);
  }
  async function Y(f = 120) {
    clearTimeout(E), E = setTimeout(async () => {
      const w = String(fe(e, "mode")?.value ?? "flat");
      if (w !== "manual") {
        w === "flat" ? u = {
          ...u,
          settings: Ce(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : S !== w ? u = {
          ...u,
          settings: Ce(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: `${w}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : u = { ...u, readonly: !0 }, Z();
        return;
      }
      const h = na(H()?.value);
      if (!h) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, Z();
        return;
      }
      Ne(h) !== Ne(P.current) && P.reset(h);
      const $ = ++C;
      try {
        const O = await to(t, h, u.sampleRate);
        if ($ !== C) return;
        u = {
          ...u,
          frequencies: O.frequency_hz,
          response: O.response_db,
          settings: O.settings,
          readonly: !1,
          note: ""
        };
      } catch (O) {
        u = { ...u, readonly: !1, note: O instanceof Error ? O.message : String(O) };
      }
      Z();
    }, f);
  }
  const nt = (f) => ({
    ...f.settings,
    bands: f.settings.bands.slice(0, kt)
  });
  function He() {
    if (!M) return "";
    const f = _.find((w) => w.name === M);
    return f && ua(nt(f), u.settings) ? M : "";
  }
  function Z() {
    g.replaceChildren(), A.clear(), R = null;
    const f = q();
    for (const h of [-f.db, -f.db / 2, 0, f.db / 2, f.db])
      g.append(
        de("line", { x1: 0, x2: f.width, y1: be(f, h), y2: be(f, h), class: h ? "grid" : "grid zero" })
      );
    for (const h of [100, 1e3, 1e4])
      g.append(de("line", { x1: _e(f, h), x2: _e(f, h), y1: 0, y2: f.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && g.append(de("path", { d: Mo(f, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && g.append(de("path", { d: Mo(f, u.frequencies, u.afterDb), class: "spectrum after" })), y ? g.append(de("line", { x1: 0, x2: f.width, y1: be(f, 0), y2: be(f, 0), class: "curve flat" })) : u.frequencies.length && (R = de("path", { d: ko(f, u.frequencies, u.response), class: "curve" }), g.append(R)), !u.readonly && !y && u.settings.bands.forEach((h, $) => {
      const O = ut[$ % ut.length], W = Oe.includes(h.type) ? h.gain_db : 0, T = de("circle", {
        cx: _e(f, h.frequency_hz),
        cy: be(f, W),
        r: h.id === L ? 9 : 7,
        class: h.id === L ? "handle selected" : "handle",
        style: `stroke: ${O}`,
        tabindex: 0,
        "data-band": h.id
      });
      T.setAttribute("aria-label", `Band ${$ + 1}: ${je(h)}`), h.enabled || T.classList.add("disabled"), T.append(de("title", {})), T.lastChild.textContent = `Band ${$ + 1}: ${je(h)}`, T.addEventListener("pointerdown", (V) => Ar(V, h.id)), T.addEventListener("dblclick", (V) => {
        V.stopPropagation(), z(So(u.settings, h.id));
      }), T.addEventListener("focus", () => Yt(h.id)), T.addEventListener("keydown", (V) => Qn(V, h.id)), T.addEventListener("wheel", (V) => {
        V.preventDefault();
        const Se = V.deltaY < 0 ? 1.15 : 1 / 1.15;
        z(an(u.settings, h.id, Se));
      }), T.addEventListener("contextmenu", (V) => {
        V.preventDefault(), z(cn(u.settings, h.id));
      }), g.append(T), A.set(h.id, T);
    }), ot(), Te(), Ut();
    const w = u.settings.bands.find((h) => h.id === L);
    p.textContent = u.note || (y ? "compare: the curve is off (the node still applies it)" : w ? je(w) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${kt}`), s.disabled = u.readonly, i.disabled = !P.canUndo, a.disabled = !P.canRedo, c.disabled = u.readonly || !u.settings.bands.length, k && (k = !1, L && A.get(L)?.focus({ preventScroll: !0 })), r.value = String(b), s.value = He(), l.classList.toggle("active", y), d.classList.toggle("active", Xt()), e.setDirtyCanvas?.(!0, !0);
  }
  function ot() {
    if (v.replaceChildren(), u.readonly && !u.settings.bands.length) {
      v.append(Q("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((f, w) => {
      const h = Q("button", "plenio-eq-chip", aa(f, w));
      h.style.borderLeftColor = ut[w % ut.length], h.classList.toggle("selected", f.id === L), h.classList.toggle("disabled", !f.enabled), h.setAttribute("aria-label", `Edit band ${w + 1}`), h.title = `Band ${w + 1}: ${je(f)} - click to open its fields`, h.addEventListener("click", ($) => {
        $.stopPropagation(), L = L === f.id ? null : f.id, Z();
      }), v.append(h);
    });
  }
  function Te() {
    N.replaceChildren();
    const f = u.settings.bands.find((T) => T.id === L);
    if (!f || u.readonly) {
      x.style.display = "none";
      return;
    }
    x.style.display = "";
    const w = Q("span", "name", `Band ${u.settings.bands.indexOf(f) + 1}`);
    w.title = "The selected band";
    const h = Q("select");
    h.setAttribute("aria-label", "Band type"), h.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [T, V] of Object.entries(Cs)) h.append(new Option(V, T));
    h.value = f.type, h.addEventListener("change", () => z(St(u.settings, f.id, { type: h.value })));
    const $ = Q("input");
    $.type = "checkbox", $.checked = f.enabled, $.setAttribute("aria-label", "Band enabled"), $.title = "Band enabled: off keeps the band in the list but out of the response", $.addEventListener("change", () => z(St(u.settings, f.id, { enabled: $.checked })));
    const O = [
      [
        "Hz",
        `${f.frequency_hz}`,
        70,
        (T) => Qt(f.id, "frequency_hz", ln(T, { kilo: !0 }))
      ],
      ["dB", `${f.gain_db}`, 60, (T) => Qt(f.id, "gain_db", ln(T))],
      ["Q", `${f.q}`, 60, (T) => Qt(f.id, "q", ln(T))]
    ];
    N.append(w, h, $);
    for (const [T, V, Se, st] of O) {
      const te = Q("input", "number");
      te.value = V, te.style.width = `${Se}px`, te.setAttribute("aria-label", `Band ${T}`), te.title = T === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : T === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const rt = () => {
        st(te.value) || (te.value = V);
      };
      te.addEventListener("keydown", (ue) => {
        ue.key === "Enter" && rt();
      }), te.addEventListener("blur", rt), (T === "dB" && !Oe.includes(f.type) || T === "Q" && !Ts.includes(f.type)) && (te.disabled = !0), N.append(te);
    }
    const W = Me("", "remove", "Remove this band");
    W.addEventListener("click", (T) => {
      T.stopPropagation(), L = null, z(cn(u.settings, f.id));
    }), N.append(W);
  }
  function Ut() {
    m.replaceChildren();
    const f = String(fe(e, "mode")?.value ?? "flat");
    if (f === "manual" || f === "flat") {
      m.style.display = "none";
      return;
    }
    m.style.display = "", m.append(
      Q(
        "span",
        "plenio-eq-hint",
        S === f ? `applied proposal (${u.settings.bands.length} band(s), ${f})` : `${f}: no proposal yet - it is computed on the next run`
      )
    );
    const w = Me("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    w.disabled = !u.settings.bands.length, w.addEventListener("click", (h) => {
      h.stopPropagation();
      const $ = fe(e, "mode");
      if (!$) return;
      $.value = "manual", $.callback?.("manual");
      const O = H();
      if (O) {
        const W = Ne(u.settings);
        O.value = W, O.callback?.(W);
      }
      P.reset(u.settings), Jt(), Y(0);
    }), m.append(w);
  }
  function Yt(f) {
    L = f, k = !0, Z();
  }
  function me(f) {
    L = f, Fe();
  }
  function Fe() {
    const f = q();
    u.settings.bands.forEach((h) => {
      const $ = A.get(h.id);
      if (!$) return;
      const O = Oe.includes(h.type) ? h.gain_db : 0;
      $.setAttribute("cx", String(_e(f, h.frequency_hz))), $.setAttribute("cy", String(be(f, O))), $.classList.toggle("selected", h.id === L), $.setAttribute("r", h.id === L ? "9" : "7");
    }), R && u.frequencies.length && R.setAttribute("d", ko(f, u.frequencies, u.response));
    const w = u.settings.bands.find((h) => h.id === L);
    w && (p.textContent = je(w));
  }
  function $r() {
    clearTimeout(G), G = setTimeout(async () => {
      const f = u.settings, w = ++C;
      try {
        const h = await to(t, f, u.sampleRate);
        if (w !== C) return;
        u = { ...u, frequencies: h.frequency_hz, response: h.response_db }, Fe();
      } catch {
      }
    }, 60);
  }
  function Xt() {
    return !fe(e, lt)?.plenioHidden;
  }
  function Kt(f) {
    const w = fe(e, lt);
    w && (w.plenioHidden = !f, f ? delete w.computeSize : w.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Qt(f, w, h) {
    if (h === null) return !1;
    const $ = u.settings.bands.find((O) => O.id === f);
    return $ && $[w] === h || z(St(u.settings, f, { [w]: h })), !0;
  }
  function Ar(f, w) {
    f.preventDefault(), f.stopPropagation(), L !== w && me(w);
    const h = u.settings.bands.find((se) => se.id === w);
    if (!h) return;
    B = { hz: h.frequency_hz, db: h.gain_db };
    let $ = !1, O = !1;
    const W = f.currentTarget;
    try {
      W?.setPointerCapture?.(f.pointerId);
    } catch {
    }
    const T = g.getBoundingClientRect(), V = T.width ? T.left : 0, Se = T.height ? T.top : 0, st = T.width || ae.width, te = T.height || ae.height, rt = (se, it) => se >= V - 1 && se <= V + st + 1 && it >= Se - 1 && it <= Se + te + 1;
    function ue() {
      if (!O) {
        O = !0;
        try {
          W?.releasePointerCapture?.(f.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", eo, ge), window.removeEventListener("pointerup", ue, ge), window.removeEventListener("pointercancel", ue, ge), window.removeEventListener("blur", ue, ge), B = null, $ && z(u.settings);
      }
    }
    const eo = (se) => {
      if (O || !B) return;
      if (se.buttons === 0) {
        ue();
        return;
      }
      if (!rt(se.clientX, se.clientY)) return;
      const it = ae.width / st, Lr = ae.height / te, Cr = (se.clientX - V) * it, Pr = (se.clientY - Se) * Lr, Nr = _e(q(), B.hz), Or = be(q(), B.db), Ir = bo(q(), xo(Nr, Cr, se.shiftKey)), Rr = vo(q(), xo(Or, Pr, se.shiftKey));
      u = { ...u, settings: We(u.settings, w, Ir, Rr, u.sampleRate) }, $ = !0, Fe(), $r();
    };
    window.addEventListener("pointermove", eo, ge), window.addEventListener("pointerup", ue, ge), window.addEventListener("pointercancel", ue, ge), window.addEventListener("blur", ue, ge);
  }
  function Qn(f, w) {
    const h = u.settings.bands.find((T) => T.id === w);
    if (!h) return;
    const $ = f.shiftKey ? 0.1 : 0.5, O = f.shiftKey ? 1.01 : 1.06;
    let W = null;
    f.key === "ArrowUp" ? W = We(u.settings, w, h.frequency_hz, h.gain_db + $, u.sampleRate) : f.key === "ArrowDown" ? W = We(u.settings, w, h.frequency_hz, h.gain_db - $, u.sampleRate) : f.key === "ArrowRight" ? W = We(u.settings, w, h.frequency_hz * O, h.gain_db, u.sampleRate) : f.key === "ArrowLeft" ? W = We(u.settings, w, h.frequency_hz / O, h.gain_db, u.sampleRate) : f.key === "+" ? W = an(u.settings, w, 1.15) : f.key === "-" ? W = an(u.settings, w, 1 / 1.15) : f.key === "0" ? W = So(u.settings, w) : (f.key === "Delete" || f.key === "Backspace") && (W = cn(u.settings, w)), W && (f.preventDefault(), z(W));
  }
  g.addEventListener("keydown", (f) => {
    L && f.target === g && Qn(f, L);
  }), g.addEventListener("dblclick", (f) => {
    if (u.readonly || y) return;
    const w = g.getBoundingClientRect(), h = ae.width / (w.width || ae.width), $ = ae.height / (w.height || ae.height), O = (f.clientX - w.left) * h, W = (f.clientY - w.top) * $, T = ia(u.settings, bo(q(), O), vo(q(), W), u.sampleRate);
    T ? (L = T.bands[T.bands.length - 1].id, z(T)) : (u = { ...u, note: `the EQ has at most ${kt} bands` }, Z());
  }), s.append(new Option("preset…", "")), un ??= zr(t).then((f) => f.manual).catch(() => []), un.then((f) => {
    _ = f;
    for (const w of f) s.append(new Option(w.name, w.name));
    s.value = He();
  }), s.addEventListener("change", async () => {
    const f = (await un)?.find((w) => w.name === s.value);
    f && (M = f.name, z(nt(f)));
  }), r.addEventListener("change", () => {
    const f = Number(r.value);
    b = yo.find((w) => w === f) ?? 12, Z();
  }), i.addEventListener("click", () => {
    const f = P.undo();
    f && z(f, { record: !1 });
  }), a.addEventListener("click", () => {
    const f = P.redo();
    f && z(f, { record: !1 });
  }), c.addEventListener("click", () => {
    L = null, z(Ce());
  }), l.addEventListener("click", () => {
    y = !y, Z();
  }), d.addEventListener("click", () => {
    Kt(!Xt()), Z();
  });
  function Jt() {
    for (const f of ["mode", lt]) {
      const w = fe(e, f);
      if (!w || w.plenioWatched) continue;
      w.plenioWatched = !0;
      const h = w.callback;
      w.callback = ($) => {
        h?.($), setTimeout(() => {
          Xt() || Kt(!1), Y();
        });
      };
    }
  }
  Jt(), Kt(!1), Y(0);
  let Jn = null, Zn = null;
  const Tr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(Tr);
      return;
    }
    const f = String(fe(e, "mode")?.value ?? "flat"), w = String(H()?.value ?? "");
    f === Jn && w === Zn || (Jn = f, Zn = w, Jt(), Y(0));
  }, 700);
  return {
    showExecuted(f) {
      const w = f?.plenio_eq, h = w?.[w.length - 1];
      if (!h) return;
      const $ = String(fe(e, "mode")?.value ?? "flat"), O = $ === "manual";
      S = O || $ === "flat" ? null : $, u = {
        sampleRate: h.sample_rate,
        frequencies: h.frequency_hz,
        response: h.response_db,
        settings: h.settings,
        readonly: !O,
        note: O ? "" : `applied: ${h.settings.bands.length} band(s)`,
        beforeDb: h.spectrum_before_db,
        afterDb: h.spectrum_after_db
      }, O ? Y(0) : Z();
    }
  };
}
const Un = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, fa = new Set(Ht.map((e) => Fn[e]));
function pa(e, t) {
  return !(e in Un) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => fa.has(n) && vs(o)).map(([n]) => n);
}
const Eo = ["written from the idea below", "my own, sung as written below"], Ps = 7, dn = Ps + 4;
function ha(e) {
  return !["sung", "sparse vocals"].includes(String(e[Ps])) || Eo.includes(e[dn]) ? e : [...e.slice(0, dn), Eo[0], "", ...e.slice(dn)];
}
function ma(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const ga = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function wa(e, t) {
  const n = ga[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
const $o = 6, ya = 8, ba = 18;
function va(e) {
  if (e[$o] !== "tags" || e.length > ba) return e;
  const t = $o + 1 + ya;
  return [...e.slice(0, t), "", ...e.slice(t)];
}
function xa(e, t) {
  if (e.name === "PlenioExportRelease" && t && Array.isArray(t.widgets_values)) {
    const c = va(t.widgets_values);
    return c === t.widgets_values ? t : { ...t, widgets_values: c };
  }
  const n = Un[e.name];
  if (!n || !t) return t;
  const o = ma(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = pa(e.name, i.widgets_values_named);
  if (a.length) {
    const c = { ...i.widgets_values_named };
    for (const l of a) c[l] = "";
    i = { ...i, widgets_values_named: c };
  }
  if (e.name === "PlenioSongBrief" && Array.isArray(i.widgets_values)) {
    const c = ha(i.widgets_values);
    c !== i.widgets_values && (i = { ...i, widgets_values: c });
  }
  return i;
}
const qe = "PlenioModelChoice", ka = "plenio.models_missing", Mt = "auto", Ao = "component.file";
function Sa(e) {
  return e.replace(/\.(safetensors|ckpt|bin|gguf|pt|pth)$/i, "");
}
function Ma(e) {
  return (e.includes(": ") ? e.slice(e.indexOf(": ") + 2) : e).split(",")[0].trim();
}
function _a(e, t) {
  const n = String(e ?? "");
  if (n === Mt) {
    const s = t?.pick;
    if (!s?.file) return Mt;
    const r = s.source === "config" ? "pinned in config.toml" : Ma(s.reason);
    return `${Mt} · ${Sa(s.file)} · ${r}${s.installed ? "" : " · to download"}`;
  }
  const o = t?.files?.[n];
  return o ? `${n} · does not fit: ${o}` : n;
}
function Ea(e) {
  const t = e.file || "a model file", n = e.folder ? `models/${e.folder}` : "its model folder", o = e.url ? `Download it from ${e.url} into ${n}, then run again.` : `It is a file of your own: put it into ${n}, or set the field to auto.`;
  return { summary: `Model missing: ${t}`, detail: o };
}
function $a(e, t) {
  if (!t) return !1;
  const n = String(e ?? "");
  return n === Mt ? t.pick ? !t.pick.installed : !1 : !(n in t.files);
}
function $n(e) {
  return String(e.widgets?.find((t) => t.name === "component")?.value ?? "");
}
function To(e, t) {
  const n = (o) => _a(o, t());
  if (e.options && typeof e.options == "object")
    try {
      e.options.getOptionLabel = n;
      return;
    } catch {
    }
  try {
    e.options = { ...e.options, getOptionLabel: n };
  } catch {
  }
}
async function Aa(e) {
  try {
    const t = await e.fetchApi("/plenio/models/files");
    return t.ok ? (await t.json()).components ?? {} : {};
  } catch {
    return {};
  }
}
class Ta {
  constructor(t) {
    this.fetcher = t;
  }
  fetcher;
  files = {};
  info(t) {
    return this.files[t];
  }
  async refresh() {
    this.files = await Aa(this.fetcher);
  }
  /** The node's file field shows the labels of its current component (its child widget is made anew when the
   * component changes: called again then). */
  label(t) {
    const n = t.widgets?.find((o) => o.name === Ao);
    n && To(n, () => this.info($n(t)));
  }
  /** A block's promoted fields that show a Model Choice inside it: the field whose list is that node's list. */
  labelBlock(t) {
    const n = (t.subgraph?.nodes ?? []).filter((s) => s.type === qe || s.comfyClass === qe), o = /* @__PURE__ */ new Set();
    for (const s of n) {
      const i = s.widgets?.find((l) => l.name === Ao)?.options?.values;
      if (!Array.isArray(i)) continue;
      const a = (t.widgets ?? []).find(
        (l) => !o.has(l) && l.type === "combo" && La(l.options?.values, i)
      );
      if (!a) continue;
      o.add(a);
      const c = $n(s);
      To(a, () => this.info(c));
    }
  }
}
function La(e, t) {
  return Array.isArray(e) && e.length === t.length && e.every((n, o) => n === t[o]);
}
const Ns = /* @__PURE__ */ new Map(), An = /* @__PURE__ */ new Set();
function Lo(e, t) {
  Ns.set(e, t);
  for (const n of An) n(e);
}
function Le(e) {
  return Ns.get(e) ?? null;
}
function Ca(e) {
  return An.add(e), () => An.delete(e);
}
const Os = /* @__PURE__ */ new Map();
function Pa(e) {
  e?.draft_sha256 && Os.set(e.draft_sha256, e);
}
function Na(e) {
  return e ? Os.get(e) ?? null : null;
}
const Co = "Plenio.OpenPlayer", Po = "plenio-player", Oa = "▶ Open in the Plenio Player";
function Tn(e, t, n, o, s = 12e3) {
  e.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function Ia(e) {
  const t = await e.fetchApi("/plenio/player/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  }), n = await t.json().catch(() => ({}));
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new J(o.message ?? `The Plenio Player did not start (${t.status})`, o.hint ?? null);
  }
  return n;
}
function No(e, t) {
  const n = e.endsWith("/") ? e : `${e}/`;
  return t ? `${n}#/record/${encodeURIComponent(t)}` : `${n}#/`;
}
async function _t(e, t = null, n = window) {
  const o = n.open("", Po);
  let s = !0;
  try {
    s = !o || o.location.href === "about:blank";
  } catch {
    s = !1;
  }
  if (o && s)
    try {
      o.document.title = "Plenio Player", o.document.body.style.cssText = "margin:0;height:100vh;display:grid;place-items:center;background:#0a0910;color:#a99fc0;font:600 18px system-ui,sans-serif", o.document.body.textContent = "Starting the Plenio Player …";
    } catch {
    }
  try {
    const r = await Ia(e.fetcher);
    o ? ((s || t) && (o.location.href = No(r.url, t)), o.focus()) : n.open(No(r.url, t), Po), r.started && Tn(e.app, "success", "Plenio Player started", `${r.url} - it keeps running when ComfyUI stops; stop it on its Settings page.`);
  } catch (r) {
    o && s && o.close();
    const i = r instanceof J && r.hint ? ` ${r.hint}` : "";
    Tn(e.app, "error", "Plenio Player", `${r instanceof Error ? r.message : String(r)}${i}`, 2e4);
  }
}
function Ra(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this);
    const i = this.addWidget?.("button", Oa, null, () => {
      _t(t, n.get(this) ?? null);
    }, { serialize: !1 });
    i && (i.serialize = !1);
  }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
    const i = r?.plenio_player, a = i?.[i.length - 1]?.record;
    a && n.set(this, a);
  });
}
const Ba = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
function Da(e, t) {
  if (e === t) return !0;
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? !1 : Ba.has(n.hostname) || n.hostname === new URL(t).hostname;
  } catch {
    return !1;
  }
}
function qa(e, t = window, n = 1500) {
  const o = new URLSearchParams(t.location.search);
  if (o.get("plenio") !== "continue") return !1;
  o.delete("plenio");
  const s = o.toString();
  t.history.replaceState(t.history.state, "", `${t.location.pathname}${s ? `?${s}` : ""}${t.location.hash}`);
  const r = t.opener;
  if (!r) return !0;
  const i = (a) => {
    const c = a.data;
    c?.type !== "plenio-continue" || a.source !== r || !Da(a.origin, t.location.origin) || (t.removeEventListener("message", i), Ot(e, { record: c.record, name: String(c.name || "the Plenio Player") }).catch((l) => {
      const d = l instanceof J && l.hint ? ` ${l.hint}` : "";
      Tn(e.app, "error", "Continue a song", `${l instanceof Error ? l.message : String(l)}${d}`, 2e4);
    }));
  };
  return t.addEventListener("message", i), t.setTimeout(() => r.postMessage({ type: "plenio-ready" }, "*"), n), !0;
}
const za = {
  "one song, stop to review": "new song every run",
  "one cover, stop to review": "new cover every run"
}, Ha = 2e3, Fa = 3e4;
function Wa(e, t, n, o) {
  const s = za[t];
  return !s || n <= 0 && o <= 1 ? null : {
    summary: "These runs stop for your review",
    detail: `${e}: "${t}" - each run waits at the Song Sheets until you press Approve, so queued runs render nothing by themselves. For runs that go through, choose "${s}" in the brief's mode.`
  };
}
class ja {
  constructor(t, n = Date.now) {
    this.notify = t, this.now = n;
  }
  notify;
  now;
  /** Runs the server has (running and waiting), from its ``status`` events. */
  queued = 0;
  recent = [];
  lastNotice = -1 / 0;
  status(t) {
    typeof t == "number" && Number.isFinite(t) && (this.queued = Math.max(0, t));
  }
  /** A run of a brief in ``mode`` is being queued. */
  queuing(t, n) {
    const o = this.now();
    this.recent = [...this.recent.filter((r) => o - r < Ha), o];
    const s = Wa(t, n, this.queued, this.recent.length);
    !s || o - this.lastNotice < Fa || (this.lastNotice = o, this.notify(s));
  }
  /** Hear of every run queued with this brief node (its *mode* widget's ``beforeQueued``). */
  watch(t) {
    const n = t.widgets?.find((s) => s.name === "mode");
    if (!n) return;
    const o = n.beforeQueued;
    n.beforeQueued = (s) => {
      o?.(s), s?.isPartialExecution || this.queuing(String(t.title || t.type), String(n.value ?? ""));
    };
  }
}
const fn = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function Ga(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function Va(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
let Is = !0;
function Rs(e) {
  Is = e;
}
function Bs(e, t, n) {
  return e === "waiting" && t && n !== !1;
}
function Ds(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Ua(e) {
  switch (e) {
    case "stop":
      return "⏸ stops here for review";
    case "waiting":
      return Is ? "⏸ waiting for your approval: Edit, Approve - the run goes on" : "⏸ waiting for your approval: Edit, Approve, run again";
    case "approved":
      return "✓ approved";
    case "error":
      return "✖ fix the sheet (its Edit button)";
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
const It = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new Set();
function Ln(e) {
  return It.get(e) ?? null;
}
function Ie(e, t) {
  t ? It.set(e, t) : It.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ke) n(e);
}
function Ya(e) {
  for (const t of e) It.delete(t);
  for (const t of Ke) t(null);
}
function Xa() {
  for (const e of Ke) e(null);
}
function Ka(e) {
  return Ke.add(e), () => Ke.delete(e);
}
const Oo = "600 12px sans-serif", dt = 20, pn = 7;
function Qa(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Ja(e) {
  const t = e ? Qa(e) : "";
  return {
    height: e ? dt : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Oo;
      const o = n.measureText(t).width + 2 * pn;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = Oo;
      const r = n.measureText(t).width + 2 * pn;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, dt, 5) : n.rect(o, s, r, dt), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + pn, s + dt / 2 + 0.5), n.restore();
    }
  };
}
const Za = "PlenioSongSheet", ec = 30;
function qs(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function tc(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? qs(n, "mode") : null;
  } catch {
    return null;
  }
}
function Cn(e) {
  const t = Ln(e);
  return t || (e.type !== Za || e.mode === 2 || e.mode === 4 ? null : Va(qs(e, "review") ?? "continue", tc(e)) ? "stop" : null);
}
function nc(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Ds(n);
  const o = e?.plenio_summary;
  return Ga(o?.[o.length - 1]?.status);
}
function oc(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = Cn(s);
      return Ja(r ? fn[r] : null);
    });
  }, n.onDrawForeground = K(n.onDrawForeground, function(s) {
    const r = Cn(this);
    !r || !fn[r].frame || this.flags?.collapsed || !this.size || sc(s, fn[r], this.size, ec, t.scale());
  }), n.onExecuted = K(n.onExecuted, function(s) {
    const r = nc(s);
    r && (Ie(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      "Waiting for your approval: open it with its Edit button, check the documents, press Approve, then run again."
    ));
  });
}
function sc(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function hd(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, c = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: c, source: a }), o += c;
  }), n;
}
function zs(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + ne) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Ae(e, t) {
  const n = zs(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function rc(e, t) {
  const n = zs(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function md(e, t, n) {
  const o = Ae(e, t), s = n == null ? 1 / 0 : Ae(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, c = Math.max(i.realStart, o), l = Math.min(a, s);
    if (l <= c + ne) continue;
    let d = i.source[0] + (c - i.realStart) / i.realDur * (i.source[1] - i.source[0]), p = c - o, m = l - c;
    if (d < 0 && (p -= d, m += d, d = 0, m <= ne))
      continue;
    const g = r.at(-1);
    g && Math.abs(g.at + g.duration - p) < ne && Math.abs(g.offset + g.duration - d) < 0.01 ? g.duration += m : r.push({ at: p, offset: d, duration: m });
  }
  return r;
}
const Hs = 0.04, ne = 1e-3, ic = 0.25, ac = 2;
function Rt(e) {
  return Math.min(ac, Math.max(ic, Number.isFinite(e) ? e : 1));
}
function gd(e, t) {
  const n = Rt(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Ae(r, t.from) : t.from, a = (c) => (r ? Ae(r, c) : c) - i;
  for (const c of ["Vocal", "Ins"])
    if (t.voices[c])
      for (const l of e.notes?.[c] ?? []) {
        if (l.start_s < t.from - ne || l.start_s >= o - ne) continue;
        const d = Math.min(l.start_s + l.duration_s, o), p = Math.max(0, a(l.start_s));
        s.push({ at: p / n, duration: (a(d) - p) / n, midi: l.midi, part: c });
      }
  if (t.voices.chords)
    for (const c of e.chords ?? []) {
      const l = Math.min(c.start_s + c.duration_s, o), d = Math.max(c.start_s, t.from);
      if (!(l <= d + ne))
        for (const p of c.pitches)
          s.push({ at: a(d) / n, duration: (a(l) - a(d)) / n, midi: p, part: "chord" });
    }
  if (t.voices.guide)
    for (const c of t.guide ?? []) {
      if (c.start_s < t.from - ne || c.start_s >= o - ne) continue;
      const l = Math.min(c.start_s + c.duration_s, o), d = Math.max(0, a(c.start_s));
      s.push({ at: d / n, duration: (a(l) - d) / n, midi: c.midi, part: "guide" });
    }
  if (t.metronome)
    for (const c of e.bars) {
      const l = Number(c.meter.split("/")[0]) || 1;
      for (let d = 0; d < l; d++) {
        const p = c.start_s + d * c.duration_s / l;
        p < t.from - ne || p >= o - ne || s.push({
          at: Math.max(0, a(p)) / n,
          duration: Hs,
          midi: d === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((c, l) => c.at - l.at || c.midi - l.midi);
}
function wd(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Ae(o, n) - Ae(o, t.from) : n - t.from;
  return Math.max(0, s) / Rt(t.speed);
}
function yd(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, c = i > 0 ? Math.floor(a / i + 1e-6) : 0, l = i > 0 ? (a - c * i) / i * r : 0, d = l > 1e-3 ? 0 : 1, p = Math.max(0, o * t);
  return Array.from({ length: p }, (m, g) => {
    const v = d + p - 1 - g, x = ((c - v) % t + t) % t === 0;
    return { at: Math.max(0, s - l - v * r), duration: Hs, midi: x ? 96 : 89, part: "click" };
  });
}
function bd(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? rc(n, Ae(n, e.from) + t * Rt(e.speed)) : e.from + t * Rt(e.speed);
}
function vd(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + ne && t < o.start_s + o.duration_s - ne
  ).map((o) => o.id);
}
function cc(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const lc = [
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
], xd = {
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
function ft(e) {
  return typeof e == "string" && lc.includes(e);
}
function Fs() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function uc(e) {
  const t = Fs(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: ft(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: ft(n.Ins) ? n.Ins : t.Ins,
    chord: ft(n.chord) ? n.chord : t.chord,
    guide: ft(n.guide) ? n.guide : t.guide
  };
}
const dc = {
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
}, Io = /* @__PURE__ */ new WeakMap();
function hn(e, t, n) {
  let o = Io.get(e);
  o || Io.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, c) => i[c + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const Ro = /* @__PURE__ */ new WeakMap();
function Ws(e) {
  let t = Ro.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    Ro.set(e, t);
  }
  return t;
}
function D(e, t, n, o = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = o, s;
}
function we(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ce(e, t, n, o = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = o, s;
}
function Ge(e, t, n, o, s, r) {
  const i = D(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const c of t) a.connect(c.detune);
  return i;
}
function mn(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = Ws(e);
  const a = ce(e, "bandpass", o, 1.2), c = e.createGain();
  return c.gain.setValueAtTime(s, n), c.gain.setTargetAtTime(0, n, r), i.connect(a).connect(c).connect(t), i;
}
const Et = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), Bo = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [Do(D(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [Do(D(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = hn(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ce(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, Et(r, 0.35)), a.connect(t);
      const c = D(e, i, n, -1.5), l = D(e, i, n, 1.5), d = we(e, 0.5);
      c.connect(d), l.connect(d), d.connect(a);
      const p = mn(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [c, l, p];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = D(e, "sine", n), a = D(e, "sine", n), c = e.createGain(), l = n * (1.2 + 2.2 * s);
      c.gain.setValueAtTime(l, o), c.gain.setTargetAtTime(n * 0.25, o, Et(r, 0.25)), a.connect(c).connect(i.frequency);
      const d = ce(e, "highpass", 25, 0.7);
      d.connect(t);
      const p = D(e, "sine", n * 4), m = e.createGain();
      return m.gain.setValueAtTime(0.18 * s, o), m.gain.setTargetAtTime(0, o, 0.06), p.connect(m).connect(d), i.connect(d), [i, a, p];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, o) {
      const s = ce(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      s.connect(t);
      const r = [-9, 0, 8].map((a) => D(e, "sawtooth", n, a));
      for (const a of r) a.connect(s);
      const i = Ge(e, r, o, 5.3, 7, 0.3);
      return [...r, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, o) {
      const s = Math.min(n * 3 + 500, 4500), r = ce(e, "lowpass", s, 0.8);
      r.connect(t);
      const i = D(e, "sine", 0.25), a = we(e, s * 0.3);
      i.connect(a).connect(r.frequency);
      const c = [D(e, "sawtooth", n, -12), D(e, "sawtooth", n, 11), D(e, "triangle", n / 2)];
      for (const l of c) l.connect(r);
      return [...c, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, o) {
      const s = hn(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = D(e, s, n), i = D(e, "sine", n / 2), a = we(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const c = Ge(e, [r, i], o, 6.6, 4, 0), l = mn(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, c, l];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = hn(e, "flute", [1, 0.13, 0.06, 0.02]), r = D(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = Ws(e), i.loop = !0;
      const a = ce(e, "bandpass", Math.min(n * 2, 8e3), 1.5), c = we(e, 0.06);
      i.connect(a).connect(c).connect(t);
      const l = Ge(e, [r], o, 4.9, 9, 0.25);
      return [r, i, l];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, o) {
      const s = D(e, "sawtooth", n), r = ce(e, "lowpass", 5e3, 0.5);
      s.connect(r);
      for (const [c, l, d] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const p = ce(e, "bandpass", c, l), m = we(e, d);
        r.connect(p).connect(m).connect(t);
      }
      const i = we(e, 0.15);
      r.connect(i).connect(t);
      const a = Ge(e, [s], o, 5.4, 18, 0.22);
      return [s, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, o, s, r) {
      const i = ce(e, "lowpass", Math.min(n * (6 + 6 * s), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, Et(r, 0.12)), i.connect(t);
      const a = D(e, "sawtooth", n), c = D(e, "triangle", n, 4);
      a.connect(i), c.connect(i);
      const l = mn(e, t, o, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
      return [a, c, l];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(e, t, n, o) {
      const s = ce(e, "lowpass", Math.min(n * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(n * 4, 4e3), o + 0.02, 0.2), s.connect(t);
      const r = D(e, "square", n), i = D(e, "sawtooth", n, 6);
      r.connect(s), i.connect(s);
      const a = Ge(e, [r, i], o, 5.6, 10, 0.3);
      return [r, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = D(e, "sine", n), r = D(e, "triangle", n), i = we(e, 0.5);
      s.connect(t), r.connect(i).connect(t);
      const a = D(e, "sawtooth", n), c = ce(e, "lowpass", Math.min(n * 6, 2500), 1);
      c.frequency.setTargetAtTime(n * 2, o + 0.01, 0.12);
      const l = we(e, 0.25);
      return a.connect(c).connect(l).connect(t), [s, r, a];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(e, t, n, o, s, r) {
      const i = D(e, "sine", n), a = D(e, "sine", n * 3.5), c = e.createGain();
      return c.gain.setValueAtTime(n * (1 + 1.5 * s), o), c.gain.setTargetAtTime(0, o, 0.05), a.connect(c).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function Do(e, t) {
  return e.connect(t), e;
}
function kd(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = Bo[n] ?? Bo.plain, c = cc(o), l = a.sustain === 0 ? Et(o, a.decay) : a.decay, d = i * dc[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), p = e.createGain();
  p.gain.setValueAtTime(0, s), p.gain.linearRampToValueAtTime(d, s + a.attack), p.gain.setTargetAtTime(d * a.sustain, s + a.attack, l), p.connect(t);
  const m = a.build(e, p, c, s, r, o);
  for (const N of m) N.start(s);
  let g = !1, v = !1;
  const x = (N) => {
    for (const X of m)
      try {
        X.stop(N);
      } catch {
      }
  };
  return m[0].onended = () => {
    v = !0, p.disconnect();
  }, a.sustain === 0 && x(s + a.attack + l * 7), {
    release(N) {
      if (g || v) return;
      g = !0;
      const X = Math.max(N, s + a.attack);
      p.gain.setTargetAtTime(0, X, a.release), x(X + a.release * 7);
    },
    stop() {
      if (v) return;
      v = !0, g = !0;
      const N = e.currentTime;
      try {
        p.gain.cancelScheduledValues(N), p.gain.setValueAtTime(0, N);
      } catch {
      }
      x(N), p.disconnect();
    }
  };
}
function fc(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function ze(e, t) {
  return `${e}:${t}`;
}
function pc(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { block: Number(t[1]), line: Number(t[2]) } : null;
}
const hc = 512;
function jt(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length === 3 || n.length < 2 || n.length > 4 + hc || !n.every((a) => Number.isInteger(a) && a >= 0)) continue;
    const [o, s] = n;
    if (s <= o) continue;
    if (n.length === 2) {
      t.push([o, s]);
      continue;
    }
    const r = n.slice(4), i = r.every((a, c) => a >= o && a < s && (c === 0 || a >= r[c - 1]));
    t.push([o, s, n[2], n[3], ...i ? r : []]);
  }
  return t.sort((n, o) => n[0] - o[0] || n[1] - o[1] || (n[2] ?? -1) - (o[2] ?? -1) || (n[3] ?? -1) - (o[3] ?? -1));
}
function mc(e, t) {
  return e.length === t.length && e.every((n, o) => n.length === t[o].length && n.every((s, r) => s === t[o][r]));
}
function js(e, t) {
  return e.parts.find((n) => n.block === t);
}
function Gs(e, t) {
  return e.parts.find((n) => t >= n.start && t < n.end);
}
function Gt(e) {
  return e.syllables.length > 0 || e.pinned;
}
function Vs(e, t, n) {
  let o = 0, s = n;
  for (const r of e.parts) {
    const i = r.lines.filter(Gt);
    !i.length || r.block === t || (r.block < t ? o = Math.max(o, ...i.map((a) => Math.max(a.end, a.start + 1))) : s = Math.min(s, ...i.map((a) => a.start)));
  }
  return [o, Math.max(s, o + 1)];
}
function gc(e, t, n, o, s) {
  const r = js(e, t), [i, a] = o, c = new Map((r?.lines ?? []).map((p) => [p.line, p])), l = [];
  let d = r ? Math.max(r.start, i) : i;
  return n.forEach((p, m) => {
    const g = c.get(m);
    if (g && Gt(g)) {
      const v = Math.min(Math.max(g.start, i), a - 1), x = Math.min(Math.max(g.end, v + 1), a);
      l.push({ id: String(m), text: p, start: v, end: x }), d = x;
    } else {
      const v = Math.min(Math.max(d, i), a);
      l.push({ id: String(m), text: p, start: v, end: v });
    }
  }), l;
}
function wc(e, t) {
  const [n, o] = t, r = e.map((i, a) => {
    const c = Math.min(Math.max(i.start, n), Math.max(n, o - 1)), l = i.end > i.start ? Math.min(Math.max(i.end, c + 1), o) : c;
    return { line: { ...i, start: c, end: l }, index: a, placed: i.id.startsWith("*") };
  }).sort((i, a) => i.line.start - a.line.start || Number(a.placed) - Number(i.placed) || i.index - a.index).map((i) => i.line);
  for (let i = 0; i + 1 < r.length; i++) {
    const a = r[i + 1];
    r[i].end > a.start && (r[i].end = Math.max(a.start, r[i].start));
  }
  return r;
}
function Yn(e) {
  return (e?.parts ?? []).flatMap(
    (t) => t.lines.filter((n) => Gt(n) && n.end > n.start).map((n) => ({ key: ze(n.block, n.line), block: n.block, line: n.line, start: n.start, end: n.end, text: n.text }))
  ).sort((t, n) => t.start - n.start || t.block - n.block || t.line - n.line);
}
function yc(e, t, n = /* @__PURE__ */ new Set()) {
  for (const o of t) {
    const s = e.find((r) => !n.has(r.key) && r.start < o.end && o.start < r.end);
    if (s) return s;
  }
  return null;
}
function bc(e, t, n, o = 1) {
  const s = e.parts.flatMap((u) => u.lines.map((S) => ({ ...S, key: ze(S.block, S.line) }))), r = t.kind === "move" ? new Set(t.keys) : /* @__PURE__ */ new Set([t.key]), i = s.filter((u) => r.has(u.key) && u.text).map((u) => ({ key: u.key, block: u.block, start: u.start, end: u.end > u.start ? u.end : Math.min(n, u.start + Math.max(1, o)) })), a = Yn(e).filter((u) => !r.has(u.key)), c = { moves: [], free: !0, stoppedAt: null };
  if (!i.length) return c;
  const l = (u) => {
    let S = 0, L = n;
    for (const y of a)
      y.block < u ? S = Math.max(S, y.end) : y.block > u && (L = Math.min(L, y.start));
    return [S, Math.max(S, L)];
  };
  if (t.kind !== "move") {
    const u = i[0], [S, L] = l(u.block);
    if (t.kind === "end") {
      const C = a.filter((k) => k.start >= u.start).sort((k, A) => k.start - A.start)[0], E = Math.min(L, C ? C.start : n), G = u.end + t.delta, B = Math.max(u.start + 1, Math.min(G, E));
      return { moves: [{ key: u.key, start: u.start, end: B }], free: B === G, stoppedAt: G > E && C && C.start === E ? C : null };
    }
    const y = a.filter((C) => C.end <= u.end).sort((C, E) => E.end - C.end)[0], b = Math.max(S, y ? y.end : 0), M = u.start + t.delta, _ = Math.min(u.end - 1, Math.max(M, b));
    return {
      moves: [{ key: u.key, start: _, end: u.end }],
      free: _ === M,
      stoppedAt: M < b && y && y.end === b ? y : null
    };
  }
  let d = -1 / 0, p = 1 / 0;
  for (const u of i) {
    const [S, L] = l(u.block);
    d = Math.max(d, S - u.start), p = Math.min(p, L - u.end);
  }
  const m = a.flatMap((u) => i.map((S) => ({ other: u, from: u.start - S.end, to: u.end - S.start }))), g = (u) => u >= d && u <= p && !m.some((S) => u > S.from && u < S.to), v = t.delta, x = [v, 0, d, p, ...m.flatMap((u) => [u.from, u.to])].filter((u) => Number.isFinite(u) && g(u));
  if (!x.length) return { moves: [], free: !1, stoppedAt: null };
  const N = x.reduce((u, S) => {
    const L = Math.abs(S - v) - Math.abs(u - v);
    return L < 0 || L === 0 && Math.abs(S) < Math.abs(u) ? S : u;
  }), X = N === v ? null : m.find((u) => v > u.from && v < u.to)?.other ?? null;
  return {
    moves: N ? i.map((u) => ({ key: u.key, start: u.start + N, end: u.end + N })) : [],
    free: N === v,
    stoppedAt: X
  };
}
function vc(e, t, n, o, s = 4 * Math.max(1, n)) {
  const r = Gs(e, Math.min(Math.max(0, t), Math.max(0, o - 1)));
  if (!r) return null;
  const i = Yn(e);
  if (i.some((x) => t >= x.start && t < x.end)) return null;
  const a = [
    Math.max(0, ...i.filter((x) => x.end <= t).map((x) => x.end)),
    Math.min(o, ...i.filter((x) => x.start > t).map((x) => x.start))
  ], [, c] = Vs(e, r.block, o), l = Math.max(1, n);
  let d = Math.max(a[0], Math.floor(t / l) * l);
  const p = r.phrases.find(([x, N]) => t >= x && t < N);
  p && !i.some((x) => x.start < p[1] && x.end > p[0]) && (d = Math.max(a[0], p[0]));
  const m = r.phrases.find(([x, N]) => N > d && x <= d) ?? r.phrases.find(([x]) => x > d), g = Math.min(m ? m[1] : d + Math.max(1, s), a[1], c, o);
  if (g <= d) return null;
  const v = r.lines.length ? Math.max(...r.lines.map((x) => x.line)) + 1 : 0;
  return { block: r.block, line: v, start: d, end: g };
}
function xc(e, t, n, o = !1) {
  const s = e.filter((l) => l.length >= 4 && !n.has(l[2])), r = new Set(s.map((l) => ze(l[2], l[3]))), i = o || e.some((l) => l.length === 2) ? t.parts.flatMap(
    (l) => l.lines.filter((d) => (o ? Gt(d) : d.pinned) && d.end > d.start && !n.has(d.block) && !r.has(ze(d.block, d.line))).map((d) => [d.start, d.end, d.block, d.line])
  ) : [], a = new Map(e.filter((l) => l.length > 4).map((l) => [`${l[0]}:${l[1]}:${l[2]}`, l.slice(4)])), c = [...n].flatMap(
    ([l, d]) => d.map((p, m) => [p.start, p.end, l, m, ...a.get(`${p.start}:${p.end}:${l}`) ?? []])
  );
  return jt([...s, ...i, ...c]);
}
function kc(e, t) {
  const n = [];
  for (const o of e) {
    const [s, r] = o;
    for (const [i, a, c] of t) {
      if (s < i || s >= a) continue;
      const l = c - i, d = o.slice(4), p = d.every((g) => g >= i && g < a) ? d.map((g) => g + l) : [], m = o.length >= 4 ? [s + l, Math.min(r, a) + l, o[2], o[3], ...p] : [s + l, Math.min(r, a) + l];
      n.push(m);
    }
  }
  return jt(n);
}
function Sc(e, t, n, o, s) {
  const r = [];
  for (const i of e) {
    if (i.length < 4) {
      r.push(i);
      continue;
    }
    const a = n[i[2]], c = o.map((d, p) => ({ index: d, block: p })).filter(({ index: d }) => a !== void 0 && t[d] === a);
    if (!c.length) continue;
    const l = c.reduce((d, p) => Math.abs(s[p.index] - i[0]) < Math.abs(s[d.index] - i[0]) ? p : d);
    r.push([i[0], i[1], l.block, i[3], ...i.slice(4)]);
  }
  return jt(r);
}
function Mc(e) {
  const t = [...e].sort((o, s) => o.start - s.start), n = t[0]?.start ?? 0;
  return t.map((o) => ({ text: o.text, offset: o.start - n, length: Math.max(1, o.end - o.start) }));
}
const _c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: Mc,
  editRange: Vs,
  fitLyricGesture: bc,
  followSpans: Sc,
  laneLines: Yn,
  lineKey: ze,
  newLineAt: vc,
  overlap: yc,
  parseLineKey: pc,
  parseShift: fc,
  parseSpans: jt,
  partAt: Gs,
  partOf: js,
  placedLines: gc,
  remapSpans: kc,
  sameSpans: mc,
  settle: wc,
  withBlockSpans: xc
}, Symbol.toStringTag, { value: "Module" })), Us = 18, Ec = 24, Bt = Us + Ec, $c = 22, Ac = 34, et = 36, Tc = 6, Sd = 3, Lc = 12, Cc = 6, Pc = 28, Nc = 21, Oc = 108;
function Ic(e) {
  return [
    ...e.tracks.vocal.map((t) => ({ ...t, track: "vocal" })),
    ...e.tracks.ins.map((t) => ({ ...t, track: "ins" }))
  ];
}
function Rc(e) {
  const t = Number(e.unit.split("/")[1]);
  return Number.isFinite(t) && t > 0 ? t : 32;
}
function Bc(e, t) {
  return t === "auto" ? Math.max(1, e.grid.snap) : Math.max(1, Math.round(Rc(e) / t));
}
function Dc(e, t = 4, n = 24) {
  let o = e.length ? Math.min(...e.map((r) => r.pitch)) - t : 60, s = e.length ? Math.max(...e.map((r) => r.pitch)) + t : 79;
  if (s - o + 1 < n) {
    const r = n - (s - o + 1);
    o -= Math.floor(r / 2), s += Math.ceil(r / 2);
  }
  return o < 0 && ([o, s] = [0, Math.min(127, s - o)]), s > 127 && ([o, s] = [Math.max(0, o - (s - 127)), 127]), [o, s];
}
function qc(e) {
  const t = e.map((s) => s.pitch), n = Math.max(0, Math.min(Nc, ...t.map((s) => s - 2))), o = Math.min(127, Math.max(Oc, ...t.map((s) => s + 2)));
  return [n, o];
}
function Md(e, t) {
  const n = Bt + (t.lyrics ? $c : 0), o = n + (t.source ? Ac : 0), s = Ic(e), [r, i] = qc(s), a = i - r + 1, c = t.pxPerQuarter / Math.max(e.grid.units_per_quarter, 1e-9), l = Math.max(Cc, Math.min(Pc, Math.round(t.rowHeight ?? Lc))), d = Bc(e, t.snap), p = Math.max(1, Math.round(e.grid.units_per_quarter));
  return {
    pxPerUnit: c,
    rowHeight: l,
    high: i,
    low: r,
    focus: Dc(s),
    total: e.total,
    snap: d,
    drawLength: Math.max(d, Math.round(p / d) * d),
    width: et + e.total * c + 40,
    height: o + a * l,
    top: o,
    sourceTop: t.source ? n : null
  };
}
const Xn = (e, t) => et + e * t.pxPerUnit, zc = (e, t) => (e - et) / t.pxPerUnit, Dt = (e, t) => t.top + (t.high - e) * t.rowHeight;
function Hc(e, t, n, o) {
  const s = (Dt(o, e) + Dt(n, e) + e.rowHeight) / 2, r = Math.max(0, t - e.top), i = s - e.top - r / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, e.height - t), i)));
}
function _d(e, t, n, o) {
  const s = Dt(o, e);
  return s >= t + e.top && s + e.rowHeight <= t + n ? null : Hc(e, n, o, o);
}
function qo(e, t) {
  const n = t.high - Math.floor((e - t.top) / t.rowHeight);
  return Math.max(t.low, Math.min(t.high, n));
}
const Fc = (e, t) => Math.floor(e / t) * t, pt = (e, t) => Math.round(e / t) * t;
function Pn(e, t) {
  return {
    x: Xn(e.onset, t),
    y: Dt(e.pitch, t) + 0.5,
    width: Math.max(2, e.duration * t.pxPerUnit - 1),
    height: Math.max(2, t.rowHeight - 1)
  };
}
function Ys(e, t, n) {
  const o = e.name.length * 7 + 10, s = t ? (t.onset - e.onset) * n.pxPerUnit - 2 : o;
  return Math.max(12, Math.min(o, s));
}
const Ed = (e) => [1, 3, 6, 8, 10].includes((e % 12 + 12) % 12);
function $d(e) {
  return `C${Math.floor(e / 12) - 1}`;
}
function Ad(e) {
  const t = [];
  for (const n of e.measures) {
    t.push({ unit: n.onset, kind: "bar", bar: n.n });
    const o = Number(n.meter.split("/")[0]) || 1, s = n.length / o;
    for (let r = 1; r < o; r++) t.push({ unit: n.onset + r * s, kind: "beat" });
  }
  return t;
}
function Td(e, t, n, o, s, r, i = 0, a = 0) {
  const c = Math.max(0, Math.min(s.total, zc(e, s))), l = t - i;
  if (l < Us) return { area: "header", unit: c };
  if (s.sourceTop !== null && l >= s.sourceTop && l < s.top) return { area: "source", unit: c };
  if (l >= Bt && l < s.top) return { area: "lyrics", unit: c };
  if (l < Bt) {
    for (let m = o.length - 1; m >= 0; m--) {
      const g = o[m], v = Xn(g.onset, s);
      if (e >= v && e <= v + Ys(g, o[m + 1], s)) return { area: "chord", chord: g };
    }
    return { area: "lane", unit: c };
  }
  if (e - a < et) return { area: "keys", pitch: qo(t, s) };
  const d = n.filter((m) => {
    const g = Pn(m, s);
    return e >= g.x && e <= g.x + g.width && t >= g.y - 0.5 && t <= g.y + g.height + 0.5;
  }), p = d.find((m) => m.track === r) ?? d[0];
  if (p) {
    const m = Pn(p, s), g = e >= m.x + m.width - Math.min(Tc, m.width / 3) ? "end" : "body";
    return { area: "note", note: p, edge: g };
  }
  return { area: "grid", unit: c, pitch: qo(t, s) };
}
function Xs(e, t, n) {
  return e.y0 < (e.from?.scrollTop ?? n) + t || e.y1 < n + t;
}
function Wc(e, t, n = 0, o = 0) {
  const s = e.from?.scrollTop ?? n, r = e.from?.scrollLeft ?? o, i = (m, g) => Math.max(g + et, Math.min(t.width, m)), a = (m, g) => Math.max(g + t.top, Math.min(t.height, m)), c = [i(e.x0, r), i(e.x1, o)], l = [a(e.y0, s), a(e.y1, n)], d = Math.min(...c), p = Math.min(...l);
  return { x: d, y: p, width: Math.max(...c) - d, height: Math.max(...l) - p };
}
function Ld(e, t = 0, n = Bt) {
  return Xs(e, n, t);
}
function Cd(e, t, n) {
  return t.width <= 0 || t.height <= 0 ? [] : e.filter((o) => {
    const s = Pn(o, n);
    return s.x < t.x + t.width && s.x + s.width > t.x && s.y < t.y + t.height && s.y + s.height > t.y;
  });
}
function Pd(e, t, n, o = 0, s = 0) {
  if (!Xs(t, n.top, o)) return [];
  const r = Wc(t, n, o, s);
  return r.width <= 0 ? [] : e.filter((i, a) => {
    const c = Xn(i.onset, n);
    return c < r.x + r.width && c + Ys(i, e[a + 1], n) > r.x;
  });
}
function Nd(e, t, n, o) {
  return { kind: "move", notes: e, anchor: t, fromUnit: n, fromPitch: o, delta: 0, semitones: 0 };
}
function Od(e, t = [], n = 1 / 0) {
  const o = t.filter((r) => r.track === e.track && r.onset > e.onset).map((r) => r.onset), s = Math.min(n, ...o);
  return { kind: "resize", note: e, end: e.onset + e.duration, overwrite: !1, limit: s };
}
function Id(e, t, n, o) {
  const s = Math.max(0, Math.min(Fc(t, o.snap), o.total - 1));
  return { kind: "draw", track: e, start: s, end: Math.min(o.total, s + o.snap), pitch: n };
}
function Rd(e, t = e.onset) {
  return { kind: "chord", chord: e, fromUnit: t, to: e.onset };
}
const Ve = (e, t, n) => Math.max(t, Math.min(n, e));
function Bd(e, t, n, o, s) {
  switch (e.kind) {
    case "move": {
      const r = e.anchor.onset + (t - e.fromUnit), i = Math.min(...e.notes.map((m) => m.onset)), a = Math.max(...e.notes.map((m) => m.onset + m.duration)), c = Ve(pt(r, o.snap) - e.anchor.onset, -i, o.total - a), l = Math.min(...e.notes.map((m) => m.pitch)), d = Math.max(...e.notes.map((m) => m.pitch)), p = Ve(n - e.fromPitch, -l, 127 - d);
      return { ...e, delta: c, semitones: p, copy: s.alt };
    }
    case "resize": {
      const r = Math.min(o.snap, o.total - e.note.onset), i = s.alt ? o.total : Math.max(e.note.onset + e.note.duration, Math.min(o.total, e.limit)), a = Ve(pt(t, o.snap), e.note.onset + Math.max(1, r), i);
      return { ...e, end: Math.min(a, i), overwrite: s.alt };
    }
    case "draw": {
      const r = t <= e.start ? e.start + o.snap : Math.max(e.start + o.snap, pt(t, o.snap));
      return { ...e, end: Math.min(o.total, r) };
    }
    case "chord":
      return { ...e, to: Ve(pt(e.chord.onset + t - e.fromUnit, o.snap), 0, o.total - 1) };
  }
}
function Dd(e, t) {
  switch (e.kind) {
    case "move": {
      if (e.copy) {
        const n = Math.min(...e.notes.map((s) => s.onset)), o = Math.max(...e.notes.map((s) => s.onset + s.duration));
        return !e.delta && !e.semitones ? null : {
          op: "paste",
          at: n + e.delta,
          mode: "overwrite",
          span: o - n,
          tracks: [...new Set(e.notes.map((s) => s.track))],
          with_chords: !1,
          notes: e.notes.map((s) => ({ track: s.track, onset: s.onset - n, duration: s.duration, pitch: s.pitch + e.semitones })),
          chords: [],
          sections: []
        };
      }
      return !e.delta && !e.semitones ? null : { op: "move_notes", ids: e.notes.map((n) => n.id), delta: e.delta, semitones: e.semitones };
    }
    case "resize": {
      const n = e.end - e.note.onset;
      return n === e.note.duration ? null : { op: "resize_note", id: e.note.id, duration: n, mode: e.overwrite ? "overwrite" : t };
    }
    case "draw":
      return { op: "insert_note", track: e.track, onset: e.start, duration: e.end - e.start, pitch: e.pitch };
    case "chord":
      return e.to === e.chord.onset ? null : { op: "move_chord", onset: e.chord.onset, to: e.to };
  }
}
function qd(e) {
  if (!e) return [];
  switch (e.kind) {
    case "move":
      return e.notes.map((t) => ({
        track: t.track,
        onset: t.onset + e.delta,
        duration: t.duration,
        pitch: t.pitch + e.semitones
      }));
    case "resize":
      return [{ track: e.note.track, onset: e.note.onset, duration: e.end - e.note.onset, pitch: e.note.pitch }];
    case "draw":
      return [{ track: e.track, onset: e.start, duration: e.end - e.start, pitch: e.pitch }];
    case "chord":
      return [];
  }
}
function zd(e) {
  return e ? e.kind === "move" ? e.copy ? /* @__PURE__ */ new Set() : new Set(e.notes.map((t) => t.id)) : e.kind === "resize" ? /* @__PURE__ */ new Set([e.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Hd(e, t, n, o, s, r) {
  const i = n.map((a) => a.id);
  switch (e) {
    case "ArrowUp":
    case "ArrowDown": {
      if (!n.length && !o.length) return;
      const a = (t.shift ? 12 : 1) * (e === "ArrowUp" ? 1 : -1), c = n.map((l) => l.pitch + a);
      return c.length && (Math.min(...c) < 0 || Math.max(...c) > 127) ? null : { op: "set_note_pitch", ids: [...i, ...o.map((l) => l.id)], semitones: a };
    }
    case "ArrowLeft":
    case "ArrowRight": {
      if (!n.length) return;
      const a = e === "ArrowRight" ? 1 : -1;
      if (t.alt) {
        const m = n[0], g = m.duration + a * s.snap;
        return g < 1 || m.onset + g > s.total ? null : { op: "resize_note", id: m.id, duration: g, mode: r };
      }
      const c = t.shift ? s.drawLength : s.snap, l = Math.min(...n.map((m) => m.onset)), d = Math.max(...n.map((m) => m.onset + m.duration)), p = Ve(a * c, -l, s.total - d);
      return p ? { op: "move_notes", ids: i, delta: p } : null;
    }
    case "Delete":
    case "Backspace": {
      const a = [...i, ...o.map((c) => c.id)];
      return a.length ? { op: t.shift ? "delete_close_gap" : "delete", ids: a } : void 0;
    }
    default:
      return;
  }
}
const jc = /^(vocal|ins):\d+$/;
function Gc(e, t) {
  const n = e?.model?.tracks, o = /* @__PURE__ */ new Set();
  if (!n) return o;
  const s = /* @__PURE__ */ new Map();
  for (const r of [...n.vocal, ...n.ins]) for (const i of r.segments) s.set(i, r.id);
  for (const r of t)
    if (jc.test(r)) o.add(r);
    else {
      const i = s.get(r);
      i && o.add(i);
    }
  return o;
}
function Fd(e) {
  return new Set(e.filter((t) => t.startsWith("chord:")));
}
function Wd(e, t = []) {
  return [...e.flatMap((n) => n.segments.length ? n.segments : [n.id]), ...t.map((n) => n.id)];
}
const Vc = ["auto", "omit", "ins"];
function Ks(e) {
  return e.wanted ? e.wanted - (new Set(e.syllables.map((t) => t.onset)).size + e.holds.length) : 0;
}
function jd(e) {
  return (e?.parts ?? []).flatMap((t) => t.lines.filter((n) => Ks(n) !== 0));
}
function Gd(e) {
  return e > 0 ? `+${e}` : `−${-e}`;
}
function Vd(e) {
  const t = Ks(e);
  if (!t) return "";
  const n = e.wanted === 1 ? "1 syllable" : `${e.wanted} syllables`, o = e.wanted - t;
  return `${n} on ${o === 1 ? "1 note" : `${o} notes`}`;
}
function Ud(e, t, n) {
  const o = [], s = Gc(e ?? null, t);
  for (const r of [...e?.model?.tracks.vocal ?? [], ...e?.model?.tracks.ins ?? []])
    s.has(r.id) && o.push([r.onset, r.onset + r.duration]);
  if (n.length) {
    const r = new Set(n);
    for (const i of e?.lyrics?.parts ?? [])
      for (const a of i.lines)
        r.has(ze(a.block, a.line)) && o.push([a.start, Math.max(a.end, a.start + 1)]);
  }
  return o.length ? [Math.min(...o.map((r) => r[0])), Math.max(...o.map((r) => r[1]))] : null;
}
const Uc = { vocal: !1, ins: !1 }, Yc = { vocal: "Vocal", ins: "Instrument" }, Xc = { Vocal: "vocal", Ins: "ins" };
function Kc(e) {
  const t = typeof e == "object" && e !== null ? e : {};
  return { vocal: t.vocal === !0, ins: t.ins === !0 };
}
const Ue = (e) => `The ${Yc[e]} track is locked: unlock it to edit it.`;
function Kn(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (!t.vocal && !t.ins) return n;
  for (const o of ["vocal", "ins"])
    if (t[o])
      for (const s of e?.model?.tracks[o] ?? []) {
        n.add(s.id);
        for (const r of s.segments) n.add(r);
      }
  for (const o of e?.elements ?? []) {
    const s = Xc[o.voice];
    s && t[s] && n.add(o.id);
  }
  return n;
}
function Qc(e, t, n) {
  const o = Kn(e, n);
  return o.size ? t.filter((s) => !o.has(s)) : [...t];
}
function $t(e) {
  const t = String(e ?? "").toLowerCase();
  return t === "vocal" ? "vocal" : t === "ins" ? "ins" : null;
}
const Jc = /* @__PURE__ */ new Set(["delete", "delete_close_gap", "move_notes", "set_note_pitch", "join_notes", "quantize", "set_pitch", "shift_pitch", "note_to_rest"]), Zc = /* @__PURE__ */ new Set(["resize_note", "split_note", "set_duration", "rest_to_note"]), el = /* @__PURE__ */ new Set(["insert_note", "fill_rest", "place_notes", "shift_track"]);
function ve(e) {
  return { operation: e, note: null };
}
function Yd(e, t, n) {
  if (!n.vocal && !n.ins) return ve(e);
  const o = e.op, s = (l) => ({ operation: null, note: Ue(l) }), r = n.vocal ? "vocal" : "ins";
  if (el.has(o)) {
    const l = $t(e.track);
    if (l && n[l]) return s(l);
  }
  if (o === "silence_voice") {
    const l = $t(e.voice ?? "Vocal");
    return l && n[l] ? s(l) : ve(e);
  }
  if (o === "move_vocal_to_ins") return s(r);
  if (o === "fit_notes")
    return n.vocal ? s("vocal") : !n.ins || e.surplus === "omit" ? ve(e) : { operation: { ...e, surplus: "omit" }, note: `${Ue("ins")} Surplus notes were left out instead of moved there.` };
  if (o === "paste") return tl(e, n);
  if (Zc.has(o)) {
    const l = String(e.id ?? (Array.isArray(e.ids) ? e.ids[0] : ""));
    return Kn(t, n).has(l) ? s(zo(l, t, n)) : ve(e);
  }
  if (!Jc.has(o) || !Array.isArray(e.ids)) return ve(e);
  const i = $t(e.track);
  if (o === "move_notes" && i && n[i]) return s(i);
  const a = e.ids, c = Qc(t, a, n);
  return c.length === a.length ? ve(e) : c.length ? { operation: { ...e, ids: c }, note: `${Ue(r)} Its selected notes stayed as they are.` } : s(zo(a[0], t, n));
}
function zo(e, t, n) {
  return n.vocal && Kn(t, { vocal: !0, ins: !1 }).has(e) ? "vocal" : n.ins ? "ins" : "vocal";
}
function tl(e, t) {
  if (e.mode === "insert") return ve(e);
  const n = Array.isArray(e.notes) ? e.notes : [], o = (l) => {
    const d = $t(l);
    return !d || !t[d];
  }, s = n.filter((l) => o(l.track)), r = Array.isArray(e.tracks) ? e.tracks.filter(o) : e.tracks, i = Array.isArray(e.chords) ? e.chords.length : 0;
  if (!(s.length !== n.length || Array.isArray(e.tracks) && r.length !== e.tracks.length)) return ve(e);
  const c = t.vocal ? "vocal" : "ins";
  return !s.length && !i ? { operation: null, note: Ue(c) } : { operation: { ...e, notes: s, tracks: r }, note: `${Ue(c)} Only the other notes were pasted.` };
}
const Xd = 12, ht = { width: 640, height: 420 }, nl = { width: 1280, height: 900 }, Qs = 120, Js = 720, Zs = 0.25, er = 0.85, tr = 160, nr = 460, or = "plenio.sheet.dialog";
function Qe(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function ol(e, t) {
  const n = Qe(e.width, ht.width, Math.max(ht.width, t.width - 16)), o = Qe(e.height, ht.height, Math.max(ht.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function Kd(e, t) {
  return Math.round(Qe(e + t, Qs, Js));
}
function Qd(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? Ho(e) : Ho(e + t / n);
}
function Ho(e) {
  return Math.round(Qe(e, Zs, er) * 1e3) / 1e3;
}
function Jd(e, t) {
  return Math.round(Qe(e + t, tr, nr));
}
function Zd(e, t, n) {
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
      window.removeEventListener("pointermove", c), window.removeEventListener("pointerup", a), window.removeEventListener("pointercancel", a), window.removeEventListener("blur", a), n?.();
    }
  }, c = (l) => {
    if (l.buttons === 0) {
      a();
      return;
    }
    t({ dx: l.clientX - o, dy: l.clientY - s });
  };
  window.addEventListener("pointermove", c), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function sl() {
  return { ...nl, maximized: !1 };
}
function ef(e = sr()) {
  const t = sl();
  try {
    const n = e?.getItem(or);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...ol(
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
function tf(e, t = sr()) {
  try {
    t?.setItem(or, JSON.stringify(e));
  } catch {
  }
}
function sr() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function rr(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function ir() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function rl(e) {
  const t = ir(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const ar = "plenio.score-editor.prefs";
function il() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    locks: { ...Uc },
    fitSurplus: "auto",
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
    sounds: Fs(),
    paper: "a4",
    notationSize: "standard",
    record: ir(),
    midiInput: "all"
  };
}
function al(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function nf(e = cr()) {
  const t = il();
  try {
    const n = e?.getItem(ar);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...al(o),
      zoom: typeof o.zoom == "number" && o.zoom >= 0.6 && o.zoom <= 1.8 ? o.zoom : t.zoom,
      locks: Kc(o.locks),
      fitSurplus: Vc.includes(o.fitSurplus) ? o.fitSurplus : t.fitSurplus,
      voices: {
        Vocal: o.voices?.Vocal !== !1,
        Ins: o.voices?.Ins !== !1,
        chords: o.voices?.chords !== !1,
        guide: o.voices?.guide !== !1
      },
      speed: typeof o.speed == "number" && o.speed >= 0.25 && o.speed <= 2 ? o.speed : t.speed,
      roll: o.roll !== !1,
      rollZoom: typeof o.rollZoom == "number" && o.rollZoom >= 12 && o.rollZoom <= 240 ? o.rollZoom : t.rollZoom,
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= Qs && o.rollHeight <= Js ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= Zs && o.notationShare <= er ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= tr && o.sideWidth <= nr ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: uc(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: rr(o.notationSize) ? o.notationSize : t.notationSize,
      record: rl(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function of(e, t = cr()) {
  try {
    t?.setItem(ar, JSON.stringify(e));
  } catch {
  }
}
function cr() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function lr(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: rr(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function cl(e) {
  return lr(e?.plenio_notation);
}
async function ll(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return lr(n.jobs);
}
async function ul(e, t) {
  const n = await t.draw(e.display_abc, e.title, e.paper, e.size), o = new ArrayBuffer(n.length);
  new Uint8Array(o).set(n);
  const s = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([o], { type: "application/pdf" })
  }), r = await s.json().catch(() => ({}));
  if (!s.ok)
    throw new J(r.error?.message ?? `Saving the sheet music failed (${s.status})`, r.error?.hint ?? null);
  return { file: r.file ?? e.file, bytes: r.bytes ?? n.length };
}
let Fo = Promise.resolve();
function dl(e) {
  const t = Fo.then(e, e);
  return Fo = t.catch(() => {
  }), t;
}
class fl {
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
        dl(() => ul(s, this.host)).then(
          (r) => this.report({ job: s, saved: r }),
          (r) => {
            const i = r instanceof J && /can no longer be saved/.test(r.message);
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
      t = await ll(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const ur = "PlenioSeed", pl = 2 ** 32, dr = "plenio_part", At = "plenio_seed_hint", Wo = 56, jo = {
  fresh: { color: "#7a5418", bgcolor: "#3b2a10" },
  keep: { color: "#1f4e6e", bgcolor: "#14304a" }
};
function hl(e = Math.random) {
  return Math.floor(e() * pl);
}
function ml(e, t) {
  const n = t.trim() || "result";
  return e ? `🔒 Every run uses this seed again: the same ${n}.` : `🎲 Every run draws a new seed: a new ${n}. Liked it? Switch to 🔒.`;
}
function Re(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function fr(e) {
  const t = e.inputs?.find((n) => n.name === "seed");
  return t?.link !== void 0 && t?.link !== null;
}
function qt(e) {
  const t = !!Re(e, "keep_seed")?.value, n = e, o = t ? jo.keep : jo.fresh;
  n.color = o.color, n.bgcolor = o.bgcolor;
  const s = Re(e, At)?.element;
  s && (s.textContent = ml(t, String(e.properties?.[dr] ?? ""))), e.setDirtyCanvas?.(!0, !0);
}
function Go(e, t = Math.random) {
  const n = Re(e, "seed");
  !n || fr(e) || (n.value = hl(t), n.callback?.(n.value), e.setDirtyCanvas?.(!0, !0));
}
function gl(e, t = Math.random) {
  const n = Re(e, "seed"), o = Re(e, "keep_seed");
  if (!n || !o) return;
  n.beforeQueued = () => {
    o.value || Go(e, t);
  }, o.callback = K(o.callback, () => qt(e));
  const r = e.addWidget?.("button", "🎲 new seed now", null, () => Go(e, t), { serialize: !1 });
  if (r && (r.serialize = !1), !Re(e, At)) {
    const i = document.createElement("div");
    i.className = "plenio-seed-hint";
    const a = e.addDOMWidget(At, At, i, {
      serialize: !1,
      getValue: () => "",
      setValue: () => {
      },
      // two lines of text and the frontend's margin of 10 px above and below a DOM widget
      getMinHeight: () => Wo,
      getMaxHeight: () => Wo
    });
    a.serialize = !1;
  }
  qt(e);
}
function wl(e) {
  const t = e.prototype, n = t.onNodeCreated;
  t.onNodeCreated = function() {
    n?.call(this), gl(this);
  }, e.prototype.onConfigure = K(e.prototype.onConfigure, function() {
    qt(this);
  });
}
const sf = ["computer", "wants", "plan", "downloads", "test", "go"], rf = {
  computer: "This computer",
  wants: "What do you want?",
  plan: "Your plan",
  downloads: "Downloading",
  test: "Test song",
  go: "Go"
}, yl = "1 · YuE2 · Song", bl = [
  { id: "cover-art", label: "Cover art", components: ["flux2-klein", "flux2-text-encoder", "flux2-vae"] },
  { id: "hq", label: "HQ mastering", components: ["audio-sr"] },
  { id: "stems", label: "Stems", components: ["stems"] }
];
function gn(e) {
  return e > 0 ? e >= 1e9 ? `${(e / 1e9).toFixed(1)} GB` : `${Math.round(e / 1e6)} MB` : "0 MB";
}
function pr(e) {
  if (e === null || !Number.isFinite(e)) return "";
  const t = Math.max(0, Math.round(e));
  return t >= 3600 ? `${Math.floor(t / 3600)} h ${Math.round(t % 3600 / 60)} min` : t >= 60 ? `${Math.floor(t / 60)} min ${t % 60} s` : `${t} s`;
}
function vl(e) {
  return e.templates.length ? e.templates : [yl];
}
function af(e, t, n, o = {}) {
  const s = new Set(bl.filter((i) => n.includes(i.id)).flatMap((i) => i.components)), r = /* @__PURE__ */ new Map();
  for (const i of e.templates)
    if (t.includes(i.template))
      for (const a of i.picks) {
        if (a.optional && !s.has(a.component)) continue;
        const c = r.get(a.component);
        if (c) {
          c.templates.includes(i.template) || c.templates.push(i.template), c.optional = c.optional && a.optional;
          continue;
        }
        const l = o[a.component], d = a.variants.find((p) => p.id === l) ?? a.variants.find((p) => p.id === a.variant) ?? null;
        d && r.set(a.component, {
          component: a.component,
          title: a.title,
          folder: a.folder,
          variant: d,
          variants: a.variants,
          planned: a.variant,
          reason: d.id === a.variant ? a.reason : "your choice",
          warning: d.id === a.variant ? a.warning : "",
          templates: [i.template],
          optional: a.optional
        });
      }
  return [...r.values()];
}
function cf(e) {
  const t = e.filter((n) => !n.variant.installed);
  return {
    files: t.length,
    bytes: t.reduce((n, o) => n + o.variant.bytes, 0),
    nonCommercial: e.filter((n) => n.variant.non_commercial).map((n) => n.title)
  };
}
const xl = /* @__PURE__ */ new Set(["gated", "pending", "token"]);
function lf(e, t) {
  if (t?.state === "installed" || e && !t)
    return { status: "Installed ✓", progress: null, detail: "verified", actions: [], tone: "ok" };
  if (!t || t.state === "cancelled")
    return { status: "Not installed", progress: null, detail: "", actions: ["download"], tone: "idle" };
  const n = t.bytes > 0 ? Math.min(1, t.done / t.bytes) : 0, o = `${gn(t.done)} of ${gn(t.bytes)}`;
  switch (t.state) {
    case "queued":
      return { status: "Waiting", progress: n, detail: o, actions: ["cancel"], tone: "busy" };
    case "downloading": {
      const s = t.speed > 0 ? ` · ${gn(t.speed)}/s` : "", r = t.seconds_left !== null ? ` · ${pr(t.seconds_left)} left` : "";
      return { status: "Downloading", progress: n, detail: `${o}${s}${r}`, actions: ["pause", "cancel"], tone: "busy" };
    }
    case "paused":
      return { status: "Paused", progress: n, detail: o, actions: ["resume", "cancel"], tone: "idle" };
    case "verifying":
      return { status: "Checking the file", progress: 1, detail: "size and SHA-256", actions: [], tone: "busy" };
    case "blocked": {
      const s = t.refusal, r = s && xl.has(s.kind) ? ["access", "retry"] : ["retry"];
      return { status: "Needs you", progress: n || null, detail: Vo(s), actions: r, tone: "warn" };
    }
    case "failed":
      return { status: "Failed", progress: null, detail: Vo(t.refusal), actions: ["retry"], tone: "error" };
    default:
      return { status: t.state, progress: n, detail: o, actions: [], tone: "idle" };
  }
}
function Vo(e) {
  return e ? e.fix ? `${e.message} ${e.fix}` : e.message : "";
}
function kl(e, t, n) {
  if (e.opened_for === t) return !1;
  const o = vl(e);
  return n.templates.some((s) => o.includes(s.template) && !s.ready);
}
function uf(e, t) {
  return e.done ? "go" : (e.step === "plan" || e.step === "downloads") && t.length && t.every((n) => n.variant.installed) ? "test" : e.step;
}
function df(e) {
  if (!e) return { accept: null, token: null, pending: !1 };
  switch (e.step) {
    case "ready":
      return { accept: !0, token: !0, pending: !1 };
    case "accept":
      return { accept: !1, token: null, pending: !1 };
    case "pending":
      return { accept: !0, token: !0, pending: !0 };
    case "token":
      return { accept: null, token: !1, pending: !1 };
    default:
      return { accept: null, token: null, pending: !1 };
  }
}
function ff(e, t = null) {
  if (t)
    return {
      state: "failed",
      text: "The test song did not start.",
      audio: null,
      finding: {
        id: "test.model",
        severity: "error",
        text: t.hint ? `${t.message} ${t.hint}` : t.message,
        fix: { label: "Show the plan", action: "refresh", payload: {} }
      }
    };
  if (!e) return { state: "idle", text: "", audio: null, finding: null };
  if (e.status === "succeeded") {
    const o = e.started_at && e.finished_at ? Math.round(e.finished_at - e.started_at) : null, s = e.result?.files?.find((r) => /\.(flac|mp3|wav)$/i.test(r.name))?.url ?? null;
    return { state: "ok", text: `It works ✓${o !== null ? ` - the test song took ${pr(o)}` : ""}`, audio: s, finding: null };
  }
  if (e.status === "failed" || e.status === "cancelled") {
    const o = e.error, s = /model|not on this computer|does not find/i.test(`${o?.type ?? ""} ${o?.message ?? ""}`);
    return {
      state: "failed",
      text: e.status === "cancelled" ? "The test song was cancelled." : "The test song failed.",
      audio: null,
      finding: {
        id: s ? "test.model" : "test.failed",
        severity: "error",
        text: `${o?.title ? `${o.title}: ` : ""}${o?.message ?? "the run stopped"}`,
        fix: s ? { label: "Show the plan", action: "refresh", payload: {} } : null
      }
    };
  }
  const n = e.stage?.text ? ` - ${e.stage.text}` : "";
  return { state: "running", text: `${e.status === "queued" ? "Waiting in the queue" : "Making the test song"}${n}`, audio: null, finding: null };
}
const pf = [
  { label: "Make a song", template: "1 · YuE2 · Song" },
  { label: "Cover a recording", template: "2 · YuE2 · Cover" },
  { label: "A song with MiniMax", template: "3 · MiniMax · Song" },
  { label: "Compose it yourself", template: "5 · YuE2 · DAW" },
  { label: "Master a file", template: "4 · Enhance & Master" }
], wn = "https://github.com/jplenio/Plenio-Music-Production-System", hf = [
  { label: "New in 2.0", url: `${wn}/blob/main/CHANGELOG.md` },
  { label: "Tutorials", url: "https://www.youtube.com/playlist?list=PLAFqTtP59fgE" },
  { label: "Documentation", url: `${wn}/blob/main/docs/user/getting-started.md` },
  { label: "Where to report it", url: `${wn}/issues` }
];
function mf(e, t) {
  const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const a of e.templates)
    if (t.includes(a.template))
      for (const c of a.picks) {
        const l = c.optional ? o : n;
        l.set(c.component, (l.get(c.component) ?? !1) || c.installed);
      }
  for (const a of n.keys()) o.delete(a);
  const s = [...n.values()].filter(Boolean).length, r = [...o.values()].filter((a) => !a).length;
  return { line: `${s} of ${n.size} files for your templates` + (r ? ` · ${r} optional not installed` : ""), ready: s === n.size };
}
const yn = "plenio-setup", Uo = "Plenio.OpenSetup", Sl = "plenio.download";
async function Ml(e, t) {
  const n = await e.fetchApi("/workflow_templates");
  if (!n.ok) return null;
  const o = await n.json();
  for (const [s, r] of Object.entries(o))
    if (r.includes(t)) return `/workflow_templates/${encodeURIComponent(s)}/${encodeURIComponent(t)}.json`;
  return null;
}
async function _l(e, t) {
  const n = await Ml(e.fetcher, t);
  if (!n) throw new Error(`ComfyUI does not list the template ${t}.`);
  const o = await e.fetcher.fetchApi(n);
  if (!o.ok) throw new Error(`The template ${t} could not be read (${o.status}).`);
  await e.app.loadGraphData?.(await o.json(), !0, !0, t);
}
async function El(e) {
  const [t, n] = await Promise.all([
    e.fetchApi("/plenio/setup/state"),
    e.fetchApi("/plenio/setup/plan")
  ]);
  if (!t.ok || !n.ok) return !1;
  const { state: o, version: s } = await t.json(), r = await n.json();
  return kl(o, s, r) ? (await e.fetchApi("/plenio/setup/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opened_for: s })
  }), !0) : !1;
}
function $l(e) {
  let t = null, n = null;
  const o = /* @__PURE__ */ new Set();
  e.fetcher.addEventListener(Sl, (a) => {
    for (const c of o) c(a.detail);
  });
  const s = {
    fetcher: e.fetcher,
    onDownloads: (a) => (o.add(a), () => o.delete(a)),
    openTemplate: (a) => {
      _l(e, a).catch(
        (c) => e.app.extensionManager?.toast?.add({
          severity: "error",
          summary: "Plenio Setup",
          detail: String(c instanceof Error ? c.message : c),
          life: 12e3
        })
      );
    },
    openPlayer: e.openPlayer,
    openContinue: e.openContinue,
    problemContext: e.problemContext
  }, r = e.app.extensionManager;
  r?.registerSidebarTab?.({
    id: yn,
    icon: "pi pi-box",
    title: "Plenio",
    tooltip: "Plenio Setup: the model files for your card, downloads, your first song",
    type: "custom",
    iconBadge: () => e.lacksFiles() ? "•" : null,
    render: (a) => {
      import("./mount-6qlSj3uM.mjs").then(({ mountSetup: c }) => {
        t = c(a, s, n);
      });
    },
    destroy: () => {
      t?.unmount(), t = null;
    }
  });
  const i = (a = null) => {
    n = a, t?.focus(a), r?.sidebarTab?.activeSidebarTabId !== yn && r?.command?.execute(`Workspace.ToggleSidebarTab.${yn}`);
  };
  return El(e.fetcher).then((a) => {
    a && i();
  }).catch((a) => console.warn("Plenio: Setup could not check the plan", a)), { open: i };
}
const hr = /* @__PURE__ */ new Set(["new song every run", "new cover every run"]), Al = /* @__PURE__ */ new Set(["one song, stop to review", "one cover, stop to review"]);
function Tl(e, t) {
  return hr.has(e) ? !1 : Al.has(e) ? t.trim() !== "take" : null;
}
function Ll(e, t) {
  let n = 0;
  for (const o of e) {
    if (o.type !== ur || fr(o)) continue;
    const s = Tl(t, String(o.properties?.[dr] ?? "")), r = o.widgets?.find((i) => i.name === "keep_seed");
    s === null || !r || !!r.value === s || (r.value = s, qt(o), n++);
  }
  return n;
}
function Cl(e, t) {
  const n = `${t} seed${t === 1 ? "" : "s"}`;
  return hr.has(e) ? { summary: `${n} now 🎲 new seed`, detail: `"${e}": every run draws all its seeds anew - a new song each time. Switch a seed to 🔒 to keep that part.` } : { summary: `${n} now 🔒 same seed`, detail: `"${e}": the song's draft, plan, arrangement and cover stay while you review it; the take seed still draws anew.` };
}
function Pl(e, t) {
  const n = e.widgets?.find((o) => o.name === "mode");
  n && (n.callback = K(n.callback, (o) => {
    const s = e.graph, r = String(o ?? n.value ?? ""), i = Ll(s?.nodes ?? s?._nodes ?? [], r);
    if (i) {
      const a = Cl(r, i);
      t(a.summary, a.detail);
    }
  }));
}
const Nl = "PlenioSongSheet";
function tt(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function mr(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function gr(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : mr(e, n);
}
function wr(e, t) {
  const n = gr(e, t);
  return n && (n.comfyClass ?? n.type) === Nl && tt(n) ? n : null;
}
function Ol(e) {
  return wr(e, "context_lyrics");
}
function Il(e) {
  return wr(e, "context_score");
}
function Rl(e, t, n) {
  const o = [], s = gr(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((c, l) => {
        const d = mr(i, l);
        d && o.push(d);
      });
    }
  }
  return !1;
}
function Bl(e, t, n) {
  const o = Ol(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(tt(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: c, replans: Rl(o, e, "score") } };
}
function Dl(e, t, n) {
  const o = tt(e);
  if (!o) return;
  const s = $e(o.value) ?? Wt();
  o.value = Xe(Ms(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function ql(e, t, n) {
  const o = Il(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(tt(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: c } };
}
function zl(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Hl(e, t, n, o = null) {
  const s = tt(e);
  if (!s) return null;
  const r = $e(s.value) ?? Wt(), i = Ms(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = Xe(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await Dr(o.fetcher, {
      sheet_state: i,
      upstream: Ii(n),
      owned: n.owned,
      review: zl(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null,
      sparse: n.sparse ?? !1
    });
    if (!!a.findings.some((d) => d.severity === "error") || !a.fingerprint) return i;
    const l = Oi(i, a.fingerprint);
    return s.value = Xe(l), e.setDirtyCanvas?.(!0, !0), l;
  } catch {
    return i;
  }
}
const Fl = {
  text: {
    name: "Edit lyrics & text",
    what: "Title · style · lyrics · cover prompt",
    // a written page and a pen
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8.2L18.5 7v4.6l-2 2V8h-4V4.5H6v15h5.4l-.5 2H6a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z"/><path d="M7.6 10h7v1.7h-7zM7.6 13.4h5.6v1.7H7.6zM7.6 16.8h3.2v1.7H7.6z"/><path d="M20.3 12.6l1.6 1.6-6.7 6.7-2.6.9.9-2.6z"/></svg>'
  },
  score: {
    name: "Edit the score",
    what: "Melody · chords · sections · listen and compare",
    // notes on a staff
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h20M2 9.5h20M2 13h20M2 16.5h20" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/><path d="M8.6 5.2l11-2.6v12.6a2.9 2.3 0 1 1-1.8-2.1V6.2l-7.4 1.8v9.4a2.9 2.3 0 1 1-1.8-2.1z"/></svg>'
  },
  daw: {
    name: "Compose the score",
    what: "Piano roll · chords · sections · MIDI",
    // the piano roll: keys and notes
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3.5h5v17H2z" opacity=".5"/><path d="M2 7.6h3.2v1.4H2zM2 12h3.2v1.4H2zM2 16.4h3.2v1.4H2z"/><rect x="9" y="4.5" width="6.5" height="2.8" rx="1.1"/><rect x="12.5" y="9" width="9" height="2.8" rx="1.1"/><rect x="9" y="13.5" width="4.5" height="2.8" rx="1.1"/><rect x="15" y="18" width="6.5" height="2.8" rx="1.1"/></svg>'
  }
};
function Wl(e) {
  return e.properties?.plenio_editor_layout === "daw" ? "daw" : (e.inputs ?? []).some((n) => n.name === "score" && n.link != null) ? "score" : "text";
}
let Yo = !1;
function jl(e, t) {
  return Yo ? !1 : (Yo = !0, (globalThis.requestIdleCallback?.bind(globalThis) ?? ((o) => setTimeout(o, 2e3)))(() => {
    e().catch(() => {
    });
  }, { timeout: 1e4 }), !0);
}
const yr = "PLENIO_SHEET_STATE", Xo = 128;
let Tt = null, br = null;
function Gl(e) {
  br = e;
}
function Vl(e) {
  Tt = e;
}
const Ul = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
  jl(() => import("./open-BZM69xvs.mjs"));
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const r = document.createElement("div");
  r.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.type = "button", i.className = "plenio-sheet-open", i.innerHTML = '<span class="icon"></span><span class="text"><span class="name"></span><span class="what"></span></span><span class="go">Edit</span>';
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", s.append(i, r, a);
  let c = !1, l = null;
  const d = () => {
    const u = Wl(e);
    if (u === l) return;
    l = u;
    const S = Fl[u];
    i.dataset.kind = u, i.title = `${S.name} - opens the Song Sheet editor (${S.what.toLowerCase()})`, i.querySelector(".icon").innerHTML = S.icon, i.querySelector(".name").textContent = S.name, i.querySelector(".what").textContent = S.what;
  }, p = () => {
    d();
    const u = Le(String(e.id)), S = Cn(e);
    r.textContent = Pi($e(o)) + (u && S !== "approved" ? ` · ${u.status}` : ""), a.textContent = Ua(S), a.dataset.state = S ?? "";
    const L = c ? null : e.widgets?.find((y) => y.name === "review");
    if (L) {
      c = !0;
      const y = L.callback;
      L.callback = (b) => {
        y?.(b), p();
      };
    }
  }, m = e.addDOMWidget(t, yr, s, {
    getValue: () => o,
    setValue: (u) => {
      o = typeof u == "string" ? u : "", p();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Xo,
    getMaxHeight: () => Xo
  });
  i.addEventListener("click", (u) => {
    u.stopPropagation(), g().catch((S) => {
      console.error("Plenio: the Song Sheet editor could not open", S), r.textContent = `The editor could not open: ${S instanceof Error ? S.message : String(S)}`;
    });
  });
  async function g() {
    const u = $e(o);
    u === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const S = Le(String(e.id)), y = (e.inputs ?? []).filter((Y) => Y.link != null).map((Y) => Y.name), b = u ?? { schema: "plenio.sheet_state/1", docs: {} }, M = S?.owned ?? _s(y, b), _ = String(e.widgets?.find((Y) => Y.name === "review")?.value ?? "continue"), C = _ === "as the brief says" ? S?.review ?? "continue" : _, E = () => jn(import.meta.url, Gn), { openSheetDialog: G } = await Pe(() => import("./open-BZM69xvs.mjs"), E), { parseGuide: B, serializeGuide: k } = await Pe(() => import("./tracks-ClAVjvds.mjs"), E), { parseShift: A, parseSpans: R } = await Pe(() => Promise.resolve().then(() => _c), E), { parseBarSources: P } = await Pe(() => import("./barSources-Cq3VGvmq.mjs"), E);
    if (!Tt) throw new Error("Plenio: API not initialised");
    let H = null;
    try {
      H = Bl(e, S, Le);
    } catch (Y) {
      console.warn("Plenio: the lyrics sheet of this score was not found", Y);
    }
    let F = null;
    try {
      F = ql(e, S, Le);
    } catch (Y) {
      console.warn("Plenio: the score sheet of these lyrics was not found", Y);
    }
    const q = Tt, z = F?.owner ?? e;
    G({
      title: e.title || "Song Sheet",
      state: b,
      payload: S,
      asrNote: Na(S?.docs.lyrics?.upstream_sha256),
      owned: M.length ? M : [...Ze],
      review: C,
      fetcher: Tt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: B(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: R(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: A(e.properties?.plenio_source_shift),
      barSources: P(z.properties?.plenio_bar_sources),
      lyricsTarget: H?.target ?? null,
      scoreTarget: F?.target ?? null,
      onApply: (Y, nt, He, Z, ot, Te) => {
        const Ut = String(m.value ?? ""), Yt = Ln(e);
        if (m.value = Xe(Y), e.properties = {
          ...e.properties ?? {},
          plenio_guide: k(nt),
          plenio_lyric_spans: (Te?.lyricSpans ?? []).map((me) => [...me]),
          plenio_source_shift: Te?.sourceShift ?? 0
        }, Te?.barSources && !F?.target.blocked && (z.properties = { ...z.properties ?? {}, plenio_bar_sources: Te.barSources }), ot ? Ie(e, "approved") : String(m.value) !== Ut && v(e), He !== null && H && !H.target.blocked && (Dl(H.owner, He, Le(String(H.owner.id))), v(H.owner)), Z && F && !F.target.blocked) {
          const me = F.owner;
          Hl(me, Z.text, Le(String(me.id)), Z.approved ? { fetcher: q } : null).then(
            (Fe) => {
              Fe?.review?.approved_fingerprint ? Ie(me, "approved") : v(me);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0), Bs(Yt, ot, !0) && br?.(e);
      }
    });
  }
  function v(u) {
    Ln(u) === "approved" && Ie(u, null);
  }
  const x = [
    Ca((u) => {
      u === String(e.id) && p();
    }),
    Ka((u) => {
      (u === null || u === e) && p();
    })
  ], N = e.onDrawForeground;
  e.onDrawForeground = function(u) {
    N?.call(this, u), d();
  };
  const X = e.onRemoved;
  return e.onRemoved = function() {
    for (const u of x) u();
    X?.call(this);
  }, p(), { widget: m };
}, vr = "PLENIO_FINISH_SWITCH", Yl = "plenio_switch", Ko = 148, Nn = 0, Xl = 4, bn = [
  {
    id: "hq",
    name: "HQ Mastering",
    on: "UniverSR regenerates the highs: less AI shimmer · about 2× the time",
    off: "Faster, without UniverSR · switch on for the best sound",
    // sparkles
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l1.9 5.1 5.1 1.9-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9z"/><path d="M19 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9zM5 15.5l.7 1.8 1.8.7-1.8.7L5 20.5l-.7-1.8-1.8-.7 1.8-.7z"/></svg>'
  },
  {
    id: "cover",
    name: "Cover Art",
    on: "Paints the cover from the artwork prompt · embedded in the files",
    off: "No cover · no image model needed",
    // a picture: frame, sun and hills
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="M4.5 18l5-5.5 3.5 3.5 2.5-2.5 4 4.5z"/></svg>'
  }
];
function Kl(e) {
  return e?.nodes ?? e?._nodes ?? [];
}
function xr(e) {
  return Kl(e).filter((t) => t.properties?.[Yl] === "cover");
}
function mt(e) {
  const t = xr(e);
  return t.length ? t.some((n) => (n.mode ?? Nn) === Nn) : null;
}
function kr(e, t) {
  for (const n of xr(e)) n.mode = t ? Nn : Xl;
  e?.setDirtyCanvas?.(!0, !0);
}
function Qo(e) {
  return e === !0 || typeof e == "string" && ["true", "1", "on"].includes(e.trim().toLowerCase());
}
const On = /* @__PURE__ */ new Set();
function Sr() {
  for (const e of On) e();
}
const Ql = (e, t, n) => {
  let o = Qo(n?.[1]?.default);
  const s = e, r = document.createElement("div");
  r.className = "plenio-switches";
  const i = /* @__PURE__ */ new Map();
  for (const g of bn) {
    const v = document.createElement("button");
    v.type = "button", v.className = "plenio-switch", v.dataset.switch = g.id, v.innerHTML = `<span class="icon">${g.icon}</span><span class="text"><span class="name"></span><span class="what"></span></span><span class="pill"></span>`, v.addEventListener("click", (x) => {
      x.stopPropagation(), g.id === "hq" ? (o = !o, l.value = o, l.callback?.(o)) : kr(s.graph, !mt(s.graph)), c();
    }), i.set(g.id, v), r.append(v);
  }
  function a(g, v) {
    const x = i.get(g.id);
    x && (x.hidden = v === null, x.classList.toggle("on", !!v), x.setAttribute("aria-pressed", String(!!v)), x.title = `${g.name}: ${v ? "on" : "off"} - click to switch it ${v ? "off" : "on"}`, x.querySelector(".name").textContent = g.name, x.querySelector(".what").textContent = v ? g.on : g.off, x.querySelector(".pill").textContent = v ? "ON" : "OFF");
  }
  function c() {
    a(bn[0], o), a(bn[1], mt(s.graph));
  }
  const l = e.addDOMWidget(t, vr, r, {
    getValue: () => o,
    setValue: (g) => {
      o = Qo(g), c();
    },
    getMinHeight: () => Ko,
    getMaxHeight: () => Ko
  });
  On.add(c);
  let d = mt(s.graph);
  const p = e.onDrawForeground;
  e.onDrawForeground = function(g) {
    p?.call(this, g);
    const v = mt(s.graph);
    v !== d && (d = v, c());
  };
  const m = e.onRemoved;
  return e.onRemoved = function() {
    On.delete(c), m?.call(this);
  }, c(), { widget: l };
}, Jl = "PlenioPreset", Zl = "none";
function eu(e, t, n) {
  const o = [];
  for (const s of t) {
    if (s.switch) {
      n(s.switch, !!s.value), o.push(s.field);
      continue;
    }
    if (s.node === void 0 || !s.input) continue;
    const i = (e.getNodeById?.(s.node) ?? e.nodes?.find((a) => a.id === s.node))?.widgets?.find((a) => a.name === s.input);
    i && i.value !== s.value && (i.value = s.value, i.callback?.(s.value), o.push(s.field));
  }
  return o;
}
const vn = /* @__PURE__ */ new Map();
function tu(e, t) {
  let n = vn.get(t);
  return n || (n = e.fetchApi(`/plenio/presets?template=${encodeURIComponent(t)}`).then(async (o) => o.ok ? (await o.json()).changes ?? {} : {}), vn.set(t, n), n.catch(() => vn.delete(t))), n;
}
const Je = "plenio.stem_mix/1", Be = "rest", nu = ["reverb", "delay"], Mr = -60, ou = 12;
function su() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function le(e, t) {
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
function _r(e) {
  const t = su();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const ru = ["vocals", "drums", "bass", "other"];
function iu() {
  return [...ru, Be];
}
function au(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Je, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Je || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function cu(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || _r(le(e, o))) continue;
    const s = {}, r = le(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: Je, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function zt(e, t, n) {
  const o = { ...e.strips };
  return _r(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function lu(e, t, n) {
  const o = n.some((r) => le(e, r).solo), s = le(e, t);
  return o ? s.solo : !s.mute;
}
function Jo(e) {
  return e <= Mr ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function uu(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function du(e, t, n) {
  return uu([...e, [t, n]]);
}
function fu(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function pu(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function hu(e, t, n, o) {
  const s = le(e, t);
  return zt(e, t, { ...s, muted: du(s.muted, n, o) });
}
function mu(e, t, n) {
  const o = le(e, t), s = fu(o.muted, n);
  return s < 0 ? e : zt(e, t, { ...o, muted: pu(o.muted, s) });
}
function gu(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function wu(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function Zo(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : iu()).filter((r) => r !== Be), s = Object.keys(e?.strips ?? {}).filter((r) => r !== Be && !o.includes(r));
  return [...o, ...s, Be];
}
const es = "plenio_stem_mixer", ts = "mix", ye = 200, yu = ["room", "plate", "hall"];
function j(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function gt(e, t, n, o, s) {
  const r = j("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function bu(e) {
  const t = j("div", "plenio-mix"), n = j("div", "plenio-mix-strips"), o = j("div", "plenio-mix-buses"), s = j("div", "plenio-mix-info"), r = j("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: Je, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Zo(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const c = () => e.widgets?.find((y) => y.name === ts);
  function l(y, { draw: b = !0 } = {}) {
    const M = c();
    if (!M) return;
    const _ = cu(y);
    M.value = _, M.callback?.(_), i = { ...i, mix: y }, b && g();
  }
  function d(y, b, M = {}) {
    l(zt(i.mix, y, { ...le(i.mix, y), ...b }), M);
  }
  function p(y, b, M, _ = {}) {
    const C = le(i.mix, y);
    let E = zt(i.mix, y, { ...C, [b]: M });
    M > 0 && !(E[b] && Object.keys(E[b]).length) && (E = b === "reverb" ? { ...E, reverb: { preset: "room" } } : { ...E, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), l(E, _);
  }
  function m(y, b, M) {
    const _ = { ...i.mix[y] ?? {} };
    l({ ...i.mix, [y]: { ..._, [b]: M } });
  }
  function g() {
    n.replaceChildren();
    const y = i.names;
    for (const b of i.names) {
      const M = le(i.mix, b), _ = j("div", "plenio-mix-strip");
      _.dataset.strip = b;
      const C = j("span", "name", b === Be ? `${b} (missed)` : b);
      C.title = b === Be ? "What the separator missed: keeps a neutral mix exact" : "";
      const E = gt(Mr, ou, 0.5, M.gain_db, `${b} gain`), G = j("span", "gain", `${Jo(M.gain_db)} dB`);
      E.addEventListener("input", () => {
        G.textContent = `${Jo(Number(E.value))} dB`, d(b, { gain_db: Number(E.value) }, { draw: !1 });
      }), E.addEventListener("change", () => d(b, { gain_db: Number(E.value) }));
      const B = j("button", M.mute ? "toggle active" : "toggle", "M");
      B.setAttribute("aria-label", `${b} mute`), B.addEventListener("click", (q) => {
        q.stopPropagation(), d(b, { mute: !M.mute });
      });
      const k = j("button", M.solo ? "toggle active" : "toggle", "S");
      k.setAttribute("aria-label", `${b} solo`), k.addEventListener("click", (q) => {
        q.stopPropagation(), d(b, { solo: !M.solo });
      });
      const A = gt(0, 1, 0.05, M.compression, `${b} compression`);
      A.title = "Compression amount: one knob for the master compressor (threshold and ratio)", A.addEventListener("input", () => d(b, { compression: Number(A.value) }, { draw: !1 })), A.addEventListener("change", () => d(b, { compression: Number(A.value) }));
      const R = nu.map((q) => {
        const z = gt(0, 1, 0.05, M[q], `${b} ${q} send`);
        return z.title = `${q} send: how much of this stem goes to the shared ${q} bus`, z.addEventListener("input", () => p(b, q, Number(z.value), { draw: !1 })), z.addEventListener("change", () => p(b, q, Number(z.value))), z;
      }), P = j("button", M.save ? "toggle active" : "toggle", "save");
      P.setAttribute("aria-label", `${b} save as its own file`), P.setAttribute("aria-pressed", String(M.save)), P.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', P.addEventListener("click", (q) => {
        q.stopPropagation(), d(b, { save: !M.save });
      });
      const H = lu(i.mix, b, y);
      _.classList.toggle("silent", !H);
      const F = j("canvas", "plenio-mix-wave");
      F.width = ye, F.height = 26, F.setAttribute("aria-label", `${b} waveform (drag to mute a time range)`), v(F, M, wu(i.peaks, b, ye)), F.addEventListener("pointerdown", (q) => x(q, F, b)), _.append(
        C,
        E,
        G,
        B,
        k,
        j("span", "label", "comp"),
        A,
        j("span", "label", "verb"),
        R[0],
        j("span", "label", "delay"),
        R[1],
        P,
        F
      ), n.append(_);
    }
    N(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function v(y, b, M) {
    const _ = y.getContext("2d");
    if (!_) return;
    _.clearRect(0, 0, ye, y.height);
    const C = y.height / 2;
    _.strokeStyle = "rgba(180, 190, 205, 0.8)", _.beginPath();
    for (let E = 0; E < M.length; E++) {
      const G = Math.max(1, M[E] * (C - 1));
      _.moveTo(E + 0.5, C - G), _.lineTo(E + 0.5, C + G);
    }
    _.stroke(), _.fillStyle = "rgba(224, 104, 94, 0.35)", _.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [E, G] of b.muted) {
      const B = Math.max(0, Math.min(ye, E / Math.max(i.seconds, 1e-6) * ye)), k = Math.max(0, Math.min(ye, G / Math.max(i.seconds, 1e-6) * ye));
      _.fillRect(B, 0, Math.max(1, k - B), y.height), _.strokeRect(B + 0.5, 0.5, Math.max(1, k - B) - 1, y.height - 1);
    }
  }
  function x(y, b, M) {
    if (y.preventDefault(), y.stopPropagation(), !i.seconds) return;
    const _ = b.getBoundingClientRect(), C = (R) => Math.max(0, Math.min(1, (R - _.left) / (_.width || ye))) * i.seconds, E = C(y.clientX);
    if (le(i.mix, M).muted.some(([R, P]) => R <= E && E <= P)) {
      l(mu(i.mix, M, E));
      return;
    }
    let B = E;
    const k = (R) => {
      B = C(R.clientX);
    }, A = () => {
      window.removeEventListener("pointermove", k), window.removeEventListener("pointerup", A), l(hu(i.mix, M, Math.min(E, B), Math.max(E, B)));
    };
    window.addEventListener("pointermove", k), window.addEventListener("pointerup", A);
  }
  function N() {
    o.replaceChildren();
    const y = { preset: "room", ...i.mix.reverb ?? {} }, b = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, M = j("select");
    M.setAttribute("aria-label", "Reverb preset"), M.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const E of yu) M.append(new Option(E, E));
    M.value = String(y.preset ?? "room"), M.addEventListener("change", () => m("reverb", "preset", M.value));
    const _ = j("input");
    _.type = "number", _.value = String(b.time_ms ?? 375), _.setAttribute("aria-label", "Delay time in ms"), _.title = "Delay time in ms: where the first echo of the delay bus sits", _.addEventListener("change", () => m("delay", "time_ms", Number(_.value)));
    const C = gt(0, 0.8, 0.05, Number(b.feedback ?? 0.35), "Delay feedback");
    C.title = "Delay feedback: how much of each echo returns into the delay line", C.addEventListener("input", () => m("delay", "feedback", Number(C.value))), o.append(
      j("span", "label", "reverb bus"),
      M,
      j("span", "label", "delay bus"),
      _,
      j("span", "label", "ms, feedback"),
      C
    ), o.style.display = "flex";
  }
  const X = e.addDOMWidget(es, es, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  X.serialize = !1;
  const u = e.widgets?.find((y) => y.name === ts), S = j("button", "toggle", "JSON");
  S.title = "Show or hide the raw mixer value", S.addEventListener("click", (y) => {
    y.stopPropagation(), a = !a, S.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(j("span", "label", "Advanced"), S), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function L() {
    const y = au(c()?.value);
    i = { ...i, mix: y ?? { schema: Je, strips: {} } }, y || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), g();
  }
  return L(), {
    showExecuted(y) {
      const b = y?.plenio_stems?.at(-1), M = gu(y), _ = Zo(i.mix, b ?? null);
      i = { ...i, names: _, peaks: M, seconds: Number(b?.seconds ?? i.seconds) || 0 }, L();
    }
  };
}
const In = "plenio-tip", ns = 12, wt = 8;
function vu(e, t, n, o) {
  let s = e.right + ns;
  if (s + n.width > o.width - wt && (s = e.left - ns - n.width), s < wt) return null;
  const r = Math.max(wt, Math.min(t - 14, o.height - wt - n.height));
  return { x: s, y: r };
}
function xu(e) {
  return !!e && (String(e.type ?? "").startsWith("Plenio") || String(e.title ?? "").startsWith("Plenio"));
}
const ku = 30;
function Su(e) {
  const t = e.node_over, n = e.ds, o = e.canvas;
  if (!t || !n || !o) return null;
  const s = o.getBoundingClientRect(), r = t.flags?.collapsed ? 0 : t.size[1];
  return {
    left: s.left + (t.pos[0] + n.offset[0]) * n.scale,
    top: s.top + (t.pos[1] - ku + n.offset[1]) * n.scale,
    right: s.left + (t.pos[0] + t.size[0] + n.offset[0]) * n.scale,
    bottom: s.top + (t.pos[1] + r + n.offset[1]) * n.scale
  };
}
function Mu(e) {
  const t = document.body, n = () => t.classList.remove(In);
  let o = 0, s = null;
  const r = (a) => {
    const c = e();
    if (a.style.display === "none" || !a.textContent?.trim() || !c || !xu(c.node_over)) return n();
    const l = Su(c), d = a.getBoundingClientRect(), p = l && vu(l, o, d, { width: window.innerWidth, height: window.innerHeight });
    if (!p) return n();
    const m = a.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    t.style.setProperty("--plenio-tip-x", `${Math.round(p.x - m.left)}px`), t.style.setProperty("--plenio-tip-y", `${Math.round(p.y - m.top)}px`), t.classList.add(In);
  }, i = () => {
    const a = document.querySelector(".node-tooltip");
    a && (s = a, new MutationObserver(() => r(a)).observe(a, {
      attributes: !0,
      attributeFilter: ["style"],
      childList: !0,
      characterData: !0,
      subtree: !0
    }));
  };
  window.addEventListener("mousemove", (a) => {
    o = a.clientY, s?.isConnected || i();
  });
}
const _u = `
body.${In} .node-tooltip { left: var(--plenio-tip-x) !important; top: var(--plenio-tip-y) !important;
  transform: none !important; }
`, Eu = `
.plenio-sheet-state { display: flex; flex-direction: column; gap: 4px; font: 12px/18px var(--font-family, sans-serif);
  color: var(--descrip-text, #999); padding: 0 2px; white-space: nowrap; overflow: hidden; }
.plenio-sheet-summary { min-width: 0; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
.plenio-sheet-status { font-weight: 600; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
.plenio-sheet-status[data-state="stop"] { color: #8fa3bf; }
.plenio-sheet-status[data-state="waiting"] { color: #e3a82b; }
.plenio-sheet-status[data-state="approved"], .plenio-sheet-status[data-state="ok"] { color: #4fbf7f; }
.plenio-sheet-status[data-state="warning"] { color: #d8a31a; }
.plenio-sheet-status[data-state="error"] { color: #e0574a; }
.plenio-sheet-open { --accent: 63,191,166; display: flex; align-items: center; gap: 12px; width: 100%; height: 62px; padding: 8px 10px 8px 9px;
  border-radius: 12px; border: 1px solid rgba(var(--accent), .65); color: var(--input-text, #eee); cursor: pointer; text-align: left;
  font: 12px/1.3 var(--font-family, sans-serif); background: linear-gradient(135deg, rgba(var(--accent), .26), rgba(var(--accent), .07));
  box-shadow: 0 0 0 1px rgba(var(--accent), .18) inset; transition: background .15s, box-shadow .15s; }
.plenio-sheet-open:hover { background: linear-gradient(135deg, rgba(var(--accent), .42), rgba(var(--accent), .14));
  box-shadow: 0 0 0 1px rgba(var(--accent), .45) inset, 0 2px 10px rgba(var(--accent), .25); }
.plenio-sheet-open[data-kind="score"] { --accent: 160,124,240; }
.plenio-sheet-open[data-kind="daw"] { --accent: 90,167,240; }
.plenio-sheet-open .icon { flex: none; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 11px; color: #0d2420;
  background: linear-gradient(135deg, #8fe8d4, #2fa38b); box-shadow: 0 1px 4px rgba(0,0,0,.35); }
.plenio-sheet-open[data-kind="score"] .icon { color: #1c1033; background: linear-gradient(135deg, #d2bdff, #7d55d9); }
.plenio-sheet-open[data-kind="daw"] .icon { color: #08182b; background: linear-gradient(135deg, #a9d4ff, #3b84c4); }
.plenio-sheet-open .icon svg { width: 26px; height: 26px; fill: currentColor; }
.plenio-sheet-open .text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.plenio-sheet-open .name { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-open .what { color: var(--descrip-text, #aaa); overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-open .go { flex: none; padding: 3px 10px; border-radius: 999px; font-weight: 800; font-size: 11px; letter-spacing: .02em;
  color: #0d1a17; background: rgb(var(--accent)); }
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
.plenio-brief-template .mode { color: #b9a3d9; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; }
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
.plenio-switches { display: flex; flex-direction: column; gap: 8px; padding: 0 2px; }
.plenio-switch { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 8px 12px; border-radius: 12px;
  border: 1px solid var(--border-color, #4a4a4a); background: var(--comfy-input-bg, #262626); color: var(--input-text, #ddd);
  font: 12px/1.3 var(--font-family, sans-serif); text-align: left; cursor: pointer; transition: background .15s, border-color .15s, box-shadow .15s; }
.plenio-switch:hover { border-color: #7a8ca8; }
.plenio-switch[hidden] { display: none; }
.plenio-switch .icon { flex: none; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: #3a3a3a; color: #9a9a9a; }
.plenio-switch .icon svg { width: 22px; height: 22px; fill: currentColor; }
.plenio-switch .text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.plenio-switch .name { font-size: 14px; font-weight: 700; color: var(--input-text, #eee); }
.plenio-switch .what { color: var(--descrip-text, #aaa); white-space: normal; }
.plenio-switch .pill { flex: none; min-width: 44px; padding: 3px 0; border-radius: 999px; text-align: center; font-weight: 800; font-size: 11px;
  letter-spacing: .06em; background: #444; color: #bbb; }
.plenio-switch.on { border-color: #d9a43a; background: linear-gradient(135deg, rgba(217,164,58,.22), rgba(217,164,58,.06)); box-shadow: 0 0 0 1px rgba(217,164,58,.25) inset; }
.plenio-switch.on .icon { background: linear-gradient(135deg, #f2c35b, #d58a2a); color: #2a1c05; }
.plenio-switch.on .pill { background: #e0a83c; color: #261a05; }
.plenio-switch[data-switch="cover"].on { border-color: #4fa3d9; background: linear-gradient(135deg, rgba(79,163,217,.22), rgba(79,163,217,.06)); box-shadow: 0 0 0 1px rgba(79,163,217,.25) inset; }
.plenio-switch[data-switch="cover"].on .icon { background: linear-gradient(135deg, #7cc4f0, #3b84c4); color: #071a2a; }
.plenio-switch[data-switch="cover"].on .pill { background: #5bb0e6; color: #071a2a; }
.plenio-seed-hint { font: 11px/1.35 var(--font-family, sans-serif); color: var(--descrip-text, #aaa); padding: 2px 6px; white-space: normal; overflow-wrap: anywhere;
  overflow: hidden; }
` + _u;
function $u() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Eu, document.head.append(e);
}
function Rn(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function yt(e) {
  return Rn(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Au(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Tu(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...c] = s, l = (d, p) => `<tr>${d.map((m) => `<${p}>${yt(m)}</${p}>`).join("")}</tr>`;
      t.push(`<table><thead>${l(a, "th")}</thead><tbody>${c.map((d) => l(d, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${Rn(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const d = Au(a);
      d && (s ??= []).push(d);
      continue;
    }
    if (i(), a.startsWith("```")) {
      r(), o = [];
      continue;
    }
    const c = /^(#{1,4})\s+(.*)$/.exec(a);
    if (c) {
      r();
      const d = Math.min(c[1].length + 2, 6);
      t.push(`<h${d}>${yt(c[2])}</h${d}>`);
      continue;
    }
    const l = /^\s*[-*]\s+(.*)$/.exec(a);
    if (l) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${yt(l[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${yt(a)}</p>`);
  }
  return r(), i(), o !== null && t.push(`<pre><code>${Rn(o.join(`
`))}</code></pre>`), t.join("");
}
const Ye = "plenio_summary", os = "plenio_summary", ss = 84, Lu = 18, Cu = 55, Pu = 16, rs = 10;
function Nu(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / Cu)), 0);
  return Pu + t * Lu;
}
function Ou(e, t) {
  const n = e.widgets?.find((i) => i.name === os);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  let s = rs;
  const r = e.addDOMWidget(os, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => ss,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets. The margins
    // count too - without them the element stayed 20 px short of its text and hid the last line
    getMaxHeight: () => Math.max(ss, (o.scrollHeight ? o.scrollHeight + 2 : Nu(t.markdown)) + 2 * s)
  });
  return s = r.margin ?? rs, r.serialize = !1, o;
}
function Iu(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const is = /* @__PURE__ */ new WeakMap();
function Bn(e, t) {
  if (!t.markdown) return;
  const n = is.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, is.set(e, n);
  const o = Ou(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = Tu(t.markdown), Iu(e), e.setDirtyCanvas?.(!0, !0);
}
function as(e, t, n, o) {
  const s = e.properties?.[Ye], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((c) => c.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ye] = a, Bn(e, a);
}
function Ru(e) {
  e.prototype.onExecuted = K(e.prototype.onExecuted, function(t) {
    const n = t?.[Ye], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[Ye] = { markdown: o.markdown, status: o.status ?? "" }, Bn(this, o));
  }), e.prototype.onConfigure = K(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ye];
    t?.markdown && Bn(this, t);
  });
}
const Bu = "Plenio.Core", U = Br;
Vl(U);
const I = fs, bt = { app: I, fetcher: U }, vt = { app: I, fetcher: U }, Vt = () => I.graph;
async function Du() {
  const e = (t) => I.extensionManager?.toast?.add({ ...t, life: 2e4 });
  try {
    const t = I.graph?.serialize?.();
    if (!t) return;
    const n = await hs(U, t, !0), o = I.extensionManager?.workflow?.activeWorkflow ?? null;
    n.workflow && I.loadGraphData && await I.loadGraphData(n.workflow, !1, !0, o);
    for (const s of Xr(n)) e(s);
  } catch (t) {
    const n = t instanceof J && t.hint ? `${t.message} ${t.hint}` : String(t);
    e({ severity: "error", summary: "Model blocks not brought up to date", detail: n });
  }
}
const he = new Ta(U);
let cs;
function qu() {
  window.clearTimeout(cs), cs = window.setTimeout(() => {
    he.refresh().then(Lt);
  }, 1500);
}
function Lt() {
  for (const e of Vt()?.nodes ?? []) {
    e.type === qe && he.label(e);
    for (const t of e.subgraph?.nodes ?? []) t.type === qe && he.label(t);
    e.subgraph && he.labelBlock(e);
  }
  I.graph?.setDirtyCanvas?.(!0, !0);
}
function zu() {
  for (const e of Vt()?.nodes ?? [])
    for (const t of [e, ...e.subgraph?.nodes ?? []]) {
      if (t.type !== qe) continue;
      const n = t.widgets?.find((o) => o.name === "component.file")?.value;
      if ($a(n, he.info($n(t)))) return !0;
    }
  return !1;
}
let xn = null;
const Dn = "Plenio.Sheet.ApproveContinues";
function Hu() {
  const e = I.extensionManager?.setting?.get(Dn);
  Rs(e !== !1), Bs("waiting", !0, e) && (I.queuePrompt?.(0, 1)?.catch((t) => console.error("Plenio: the run could not go on", t)), I.extensionManager?.toast?.add({ severity: "info", summary: "Approved", detail: "The run goes on.", life: 5e3 }));
}
async function Fu(e) {
  if (e === Zl) return;
  const t = I.graph, n = t?.extra?.plenio_api?.id, o = I.extensionManager?.toast;
  if (!t || !n) {
    o?.add({ severity: "info", summary: "Preset", detail: "This workflow is not a Plenio template: the preset sets nothing here.", life: 8e3 });
    return;
  }
  try {
    const s = (await tu(U, n))[e] ?? [], r = eu(t, s, (a, c) => {
      a === "cover" && kr(t, c);
    });
    Sr(), I.graph?.setDirtyCanvas?.(!0, !0), I.extensionManager?.workflow?.activeWorkflow?.changeTracker?.checkState?.(), o?.add({ severity: "success", summary: "Preset", detail: r.length ? `Set: ${r.join(", ")} (Ctrl+Z takes it back)` : "Everything was set already.", life: 6e3 });
  } catch (s) {
    console.error("Plenio: the preset could not be applied", s);
  }
}
let ls = null;
function qn(e) {
  if (e == null) return null;
  const t = String(e);
  return Vt()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
async function Wu(e, t) {
  const n = `Your own ${e.replace("_", " ")} - any text; the list holds the style templates' values.`, o = I.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: "Plenio · your own value", message: n, defaultValue: t }) : window.prompt(n, t);
}
const us = new ja(
  (e) => I.extensionManager?.toast?.add({ severity: "warn", summary: e.summary, detail: e.detail, life: 2e4 })
), ju = {
  scale: () => I.canvas?.ds?.scale ?? 1,
  toast: (e, t) => I.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, Er = () => jn(import.meta.url, Gn), Gu = {
  fetcher: U,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Pe(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      Er,
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
function Vu(e, t) {
  const n = qn(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function Uu(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = Vu(t, e.job.file);
  if ("saved" in e) {
    o && as(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), I.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof J && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && as(o, n, `${n} - not saved: ${r}`, "warning"), I.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const zn = /* @__PURE__ */ new Map(), ds = new fl(Gu, (e) => {
  Uu(e, zn.get(e.job.token)), zn.delete(e.job.token);
});
fs.registerExtension({
  name: Bu,
  getCustomWidgets: () => ({ [yr]: Ul, [vr]: Ql }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: rn,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => mo(bt).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), I.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    },
    { id: Co, label: "Plenio Player", icon: "pi pi-play-circle", function: () => _t(vt) },
    { id: Uo, label: "Plenio Setup", icon: "pi pi-box", function: () => xn?.open() },
    {
      id: Zt,
      label: "Bring the model blocks up to date",
      icon: "pi pi-sync",
      function: () => {
        Du();
      }
    }
  ],
  settings: [
    {
      id: Dn,
      name: "Approve goes on with the run",
      type: "boolean",
      defaultValue: !0,
      category: ["Plenio", "Song Sheet", "Approve"],
      tooltip: "On: Approve on a Song Sheet the run stopped at queues the continuing run. Off: approve, then press Run (as before 2.0)."
    }
  ],
  menuCommands: [
    { path: ["File"], commands: [rn, Zt] },
    { path: ["Plenio"], commands: [Uo, Co, rn, Zt] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: "pi pi-play-circle",
      label: "Plenio Player",
      tooltip: "Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)",
      onClick: () => {
        _t(vt);
      }
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(e) {
    const t = ti(e);
    t.length && console.info(`Plenio: longer LLM answers (${Sn} tokens) in ${t.join(", ")}`);
    const n = Yr(e);
    n && I.extensionManager?.toast?.add({ ...n, life: 2e4 });
    try {
      const o = await Gr(e, U);
      for (const s of Kr(o)) I.extensionManager?.toast?.add({ ...s, life: 2e4 });
    } catch (o) {
      console.error("Plenio: the blocks of this workflow could not be brought up to date", o);
      const s = o instanceof J && o.hint ? `${o.message} ${o.hint}` : String(o instanceof Error ? o.message : o);
      I.extensionManager?.toast?.add({
        severity: "warn",
        summary: "Plenio blocks not brought up to date - the brief's creativity may not reach their sampling",
        detail: s,
        life: 2e4
      });
    }
  },
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => {
    Lt(), Xa(), Sr();
  },
  async beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    lo.has(t.name) && await fi(e, t, U, Wu), Ru(e), oc(e, ju);
    const n = ea(t.input);
    if (n.size || t.name in Un) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = xa(t, s), i = Xi(r), a = o?.call(this, r);
        return Zi(this, i, n), wa(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) Pa(s);
    })), t.name === Jl) {
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this);
        const s = this.widgets?.find((i) => i.name === "preset");
        if (!s) return;
        const r = s.callback;
        s.callback = (i) => {
          r?.(i), Fu(String(i));
        };
      };
    }
    if (t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, da(this, U));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (t.name === qe) {
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), he.label(this);
        const s = this.widgets?.find((r) => r.name === "component");
        s && (s.callback = K(s.callback, () => window.setTimeout(() => he.label(this), 0)));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function() {
        qu();
      });
    }
    if (t.name === "PlenioExportRelease" && Ra(e, vt), t.name === ur && wl(e), lo.has(t.name)) {
      Ai(e, U);
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), us.watch(this), Pl(
          this,
          (s, r) => I.extensionManager?.toast?.add({ severity: "info", summary: s, detail: r, life: 1e4 })
        );
      };
    }
    if (t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, bu(this));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && Lo(String(this.id), r);
    }));
  },
  // R: the lists are read again - and the facts behind the labels (ComfyUI then copies the inner fields' options,
  // labels included, to the blocks' promoted fields)
  async refreshComboInNodes() {
    await he.refresh(), Lt();
  },
  setup() {
    $u(), Gl(Hu), Rs(I.extensionManager?.setting?.get(Dn) !== !1), he.refresh().then(Lt), xn = $l({
      app: I,
      fetcher: U,
      openPlayer: (n) => {
        _t(vt, n ?? null);
      },
      openContinue: () => {
        mo(bt).catch(
          (n) => console.error("Plenio: the Continue a song dialog could not open", n)
        );
      },
      problemContext: () => ({
        workflow: I.graph?.serialize?.() ?? null,
        error: ls
      }),
      lacksFiles: zu
    }), U.addEventListener(ka, (n) => {
      const o = n.detail ?? {};
      I.extensionManager?.toast?.add({ severity: "warn", ...Ea(o), life: 3e4 }), o.variant && xn?.open(o.component ?? null);
    }), Mu(() => I.canvas), Ui(bt), qa(bt), U.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      Lo(String(o.node_id), o);
      const s = qn(o.node_id);
      s && Ie(s, Ds(o));
    }), U.addEventListener("status", (n) => {
      us.status(n.detail?.exec_info?.queue_remaining);
    }), U.addEventListener("execution_start", () => {
      Ya(Vt()?.nodes ?? []);
    }), U.addEventListener("execution_error", (n) => {
      ls = n.detail ?? null;
      const o = qn(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Ie(o, "error");
    }), U.addEventListener("executed", (n) => {
      const o = n.detail, s = cl(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) zn.set(i.token, r);
      ds.take(s);
    });
    const e = () => {
      ds.recover();
    };
    let t = !1;
    U.addEventListener("reconnected", () => {
      Er().then((n) => {
        n ? t || (t = !0, I.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: _n })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  Ks as $,
  _d as A,
  Dt as B,
  Ed as C,
  Xn as D,
  bl as E,
  Pn as F,
  $d as G,
  pf as H,
  Us as I,
  Ac as J,
  et as K,
  Ec as L,
  $c as M,
  Bt as N,
  Gd as O,
  J as P,
  Ys as Q,
  Md as R,
  rf as S,
  ne as T,
  qd as U,
  Wc as V,
  Cd as W,
  Pd as X,
  Ld as Y,
  ze as Z,
  Vd as _,
  df as a,
  Gs as a$,
  Ad as a0,
  Td as a1,
  zc as a2,
  Wd as a3,
  Od as a4,
  Nd as a5,
  qo as a6,
  Rd as a7,
  Id as a8,
  Sd as a9,
  rr as aA,
  jt as aB,
  nf as aC,
  of as aD,
  mc as aE,
  Js as aF,
  Qs as aG,
  nr as aH,
  tr as aI,
  er as aJ,
  Zs as aK,
  Ee as aL,
  Ud as aM,
  jd as aN,
  Vs as aO,
  Zd as aP,
  Kd as aQ,
  Ho as aR,
  Jd as aS,
  od as aT,
  td as aU,
  nd as aV,
  wc as aW,
  gc as aX,
  xc as aY,
  pc as aZ,
  Mc as a_,
  Bd as aa,
  Dd as ab,
  Fc as ac,
  Hd as ad,
  Hc as ae,
  Cc as af,
  Pc as ag,
  zd as ah,
  bc as ai,
  vc as aj,
  hd as ak,
  gd as al,
  md as am,
  bd as an,
  vd as ao,
  wd as ap,
  yd as aq,
  Rt as ar,
  rc as as,
  Ae as at,
  lc as au,
  xd as av,
  ir as aw,
  ft as ax,
  uc as ay,
  rl as az,
  af as b,
  yc as b0,
  Yn as b1,
  kc as b2,
  Sc as b3,
  Qc as b4,
  Yd as b5,
  Qd as b6,
  pd as b7,
  Qu as b8,
  ef as b9,
  Ku as ba,
  ld as bb,
  dd as bc,
  cd as bd,
  fd as be,
  Xe as bf,
  ud as bg,
  Dr as bh,
  Ii as bi,
  Oi as bj,
  Xd as bk,
  ol as bl,
  tf as bm,
  Ju as bn,
  Ms as bo,
  Bu as bp,
  cf as c,
  sf as d,
  hf as e,
  gn as f,
  rd as g,
  mf as h,
  Ss as i,
  Gc as j,
  Fd as k,
  ad as l,
  Zu as m,
  Ic as n,
  ed as o,
  ks as p,
  sd as q,
  lf as r,
  uf as s,
  ff as t,
  Rc as u,
  id as v,
  vl as w,
  Fs as x,
  kd as y,
  cc as z
};
