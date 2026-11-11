import { api as _r } from "../../../../scripts/api.js";
import { app as is } from "../../../../scripts/app.js";
class Q extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function re(e, t, n) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), s = await o.json();
  if (!o.ok) {
    const r = s?.error ?? {};
    throw new Q(r.message ?? `Request failed (${o.status})`, r.hint ?? null);
  }
  return s;
}
function Er(e, t) {
  return re(e, "/plenio/sheet/resolve", t);
}
async function Cu(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
const as = "Plenio.SectionTags";
async function Pu(e) {
  try {
    const t = await e.fetchApi(`/settings/${as}`);
    if (!t.ok) return [];
    const n = await t.json();
    return Array.isArray(n) ? n.filter((o) => typeof o == "string") : [];
  } catch {
    return [];
  }
}
async function Ou(e, t) {
  const n = await e.fetchApi(`/settings/${as}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (!n.ok) throw new Q(`Your section tags could not be kept (HTTP ${n.status}).`);
}
function Dn(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Iu(e, t, n, o) {
  return re(e, "/plenio/score/analyze", Dn({ abc: t }, n, o));
}
function Ru(e, t, n, o, s) {
  return re(e, "/plenio/score/transform", Dn({ abc: t, operation: n }, o, s));
}
function Bu(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return re(e, "/plenio/score/musicxml/export", Dn(s, n, o));
}
function Du(e, t) {
  const { lyrics: n, ...o } = t;
  return re(e, "/plenio/score/musicxml/import", n ? { ...o, lyrics: n } : o);
}
function qu(e, t) {
  return re(e, "/plenio/score/midi/export", t);
}
function zu(e, t) {
  return re(e, "/plenio/score/midi/import", t);
}
function Hu(e, t) {
  return re(e, "/plenio/lyrics/analyze", t);
}
function Fu(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function Jn(e, t, n, o = 200) {
  return re(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function $r(e, t) {
  return re(e, "/plenio/brief/fields", t);
}
async function Ar(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Q(`Request failed (${t.status})`);
  return await t.json();
}
async function ju(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new Q(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function Lr(e, t) {
  return re(e, "/plenio/records/continue", t);
}
function cs(e, t, n = !1) {
  return re(e, "/plenio/workflow/blocks", n ? { workflow: t, models: !0 } : { workflow: t });
}
function Y(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const xn = "Plenio · ", Tr = /* @__PURE__ */ new Set(["YuE2GenerateABC", "YuE2GenerateMusic", "PlenioComposePrompt", "PlenioComposeArrangement"]), Nr = "PlenioCreativity";
function ls(e) {
  const t = e?.definitions?.subgraphs;
  return Array.isArray(t) ? t : [];
}
function Cr(e) {
  return ls(e).some((t) => {
    if (typeof t?.name != "string" || !t.name.startsWith(xn)) return !1;
    const n = new Set((t.nodes ?? []).map((o) => o?.type));
    return !n.has(Nr) && [...n].some((o) => Tr.has(String(o)));
  });
}
async function Pr(e, t) {
  if (!e || typeof e != "object" || !Cr(e)) return null;
  const n = await cs(t, e);
  if (n.workflow) {
    const o = e;
    for (const s of Object.keys(o)) delete o[s];
    Object.assign(o, n.workflow);
  }
  return n;
}
const Lt = (e) => e.startsWith(xn) ? e.slice(xn.length) : e, Tt = (e) => e.map(Lt).join(", "), Or = /* @__PURE__ */ new Set(["Plenio · YuE2 Model", "Plenio · MiniMax Model", "Plenio · Cover Art"]), Zt = "Plenio.ModelBlocksUpToDate";
function Ir(e) {
  return ls(e).filter((t) => typeof t?.name == "string" && Or.has(t.name)).filter((t) => !(t.nodes ?? []).some((n) => n?.type === "PlenioModelChoice")).map((t) => String(t.name));
}
function Rr(e) {
  const t = Ir(e);
  return t.length ? {
    severity: "info",
    summary: "Model blocks of Plenio 1.x",
    detail: `${Tt(t)} load the files they name, as before. Plenio › Bring the model blocks up to date gives them Model Choice - the field shows what the file is and what auto would take - and keeps your files.`
  } : null;
}
function Br(e) {
  if (!e) return [];
  const t = [];
  return e.updated.length && t.push({
    severity: "info",
    summary: "Model blocks brought up to date",
    detail: `${Tt(e.updated)} choose their files with Model Choice now; each keeps the file it loaded. Set a field to auto to let Plenio choose for the computer that runs it. Save the workflow to keep it.`
  }), e.kept.length && t.push({
    severity: "warn",
    summary: "Some model blocks were kept as they were",
    detail: `${e.kept.map(([n, o]) => `${Lt(n)} (${o})`).join("; ")}. They load the files they name.`
  }), !e.updated.length && !e.kept.length && t.push({ severity: "info", summary: "Nothing to bring up to date", detail: "The model blocks are the current ones." }), t;
}
function Dr(e) {
  if (!e) return [];
  const t = [];
  if (e.updated.length) {
    const o = e.linked.length ? ` The creativity of ${Tt(e.linked)} now comes from the brief.` : "";
    t.push({
      severity: "info",
      summary: "Plenio blocks brought up to date",
      detail: `This workflow was saved before its blocks followed the brief's creativity: ${Tt(e.updated)} are the current blocks now.${o} At creativity 50 they work exactly as before. Save the workflow to keep it.`
    });
  }
  const n = [
    ...e.kept.map(([o, s]) => `${Lt(o)} was kept as it was (${s}) - its sampling stays fixed`),
    ...e.unlinked.map(([o, s]) => `${Lt(o)} has its own creativity slider (${s})`)
  ];
  return n.length && t.push({
    severity: "warn",
    summary: "The brief's creativity does not reach every block",
    detail: `${n.join("; ")}. The template, opened again from the template browser, has the current blocks.`
  }), t;
}
const qr = "Plenio · ", kn = 16384, zr = 24576, Zn = [1024, 2048, 6144], Hr = [8192, 12288], Fr = {
  TextGenerate: [[1, Zn, kn]],
  PlenioLocalLLM: [
    [4, Zn, kn],
    [7, Hr, zr]
  ]
};
function jr(e) {
  const t = e?.definitions?.subgraphs;
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    if (typeof o?.name != "string" || !o.name.startsWith(qr)) continue;
    let s = !1;
    for (const r of o.nodes ?? []) {
      const i = r?.widgets_values, a = Fr[String(r?.type)];
      if (!(!a || !Array.isArray(i)))
        for (const [c, l, d] of a)
          typeof i[c] == "number" && l.includes(i[c]) && (i[c] = d, s = !0);
    }
    s && n.push(o.name);
  }
  return n;
}
const Nt = "✎ type your own …", us = ["genre", "mood", "tempo", "key", "meter", "language", "voice", "theme", "lead_instrument"], Wr = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].flatMap((e) => [`${e} major`]), Gr = ["A", "E", "B", "F#", "C#", "G#", "D", "G", "C", "F", "Bb", "Eb"].map((e) => `${e} minor`), Vr = {
  key: [...Wr, ...Gr],
  meter: ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"],
  language: ["English", "German", "Spanish", "French", "Italian", "Portuguese", "Dutch", "Japanese", "Korean", "Chinese"],
  tempo: ["60 BPM", "80 BPM", "90 BPM", "100 BPM", "110 BPM", "120 BPM", "128 BPM", "140 BPM", "174 BPM"]
};
function Ur(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of [...t[e] ?? [], ...Vr[e] ?? []]) {
    const r = String(s).replace(/\s+/g, " ").trim();
    r && !n.has(r.toLowerCase()) && n.set(r.toLowerCase(), r);
  }
  const o = [...n.values()].sort((s, r) => s.localeCompare(r, void 0, { sensitivity: "base" }));
  return ["", Nt, ...o];
}
function Yr(e, t) {
  if (!Array.isArray(e) || e[0] !== "STRING") return e;
  const n = e[1] ?? {};
  return n.multiline ? e : ["COMBO", { ...n, options: t, default: typeof n.default == "string" ? n.default : "" }];
}
function Xr(e, t) {
  const n = [], o = (s, r) => {
    if (s)
      for (const [i, a] of Object.entries(s)) {
        if (us.includes(i)) {
          const d = Yr(a, Ur(i, t));
          d !== a && (s[i] = d, n.push(r + i));
          continue;
        }
        const l = (Array.isArray(a) ? a[1] : void 0)?.options;
        if (Array.isArray(l))
          for (const d of l) {
            const f = d?.inputs;
            o(f?.required, `${i}.`), o(f?.optional, `${i}.`);
          }
      }
  };
  return o(e.input?.required, ""), o(e.input?.optional, ""), [...new Set(n)];
}
const ds = (e) => e.name.split(".").pop() ?? e.name;
function Kr(e) {
  return us.includes(ds(e)) && Array.isArray(e.options?.values);
}
function eo(e) {
  const t = e.options.values, n = typeof e.value == "string" ? e.value : "";
  n && n !== Nt && !t.includes(n) && t.splice(2, 0, n);
}
function Sn(e, t) {
  fs.set(e, t);
  const n = to.get(e) ?? /* @__PURE__ */ new WeakSet();
  to.set(e, n);
  for (const o of e.widgets ?? []) {
    if (!Kr(o) || (eo(o), n.has(o))) continue;
    n.add(o);
    let s = typeof o.value == "string" && o.value !== Nt ? o.value : "";
    const r = o.callback;
    o.callback = function(i) {
      if (i !== Nt) {
        s = typeof i == "string" ? i : "", r?.call(this, i);
        return;
      }
      o.value = s, t(ds(o), s).then((a) => {
        const c = a?.replace(/\s+/g, " ").trim();
        c && (o.value = c, eo(o), o.callback?.(c), e.setDirtyCanvas?.(!0, !0));
      });
    };
  }
}
const to = /* @__PURE__ */ new WeakMap(), fs = /* @__PURE__ */ new WeakMap();
function Qr(e) {
  const t = fs.get(e);
  t && Sn(e, t);
}
let no = null;
const Jr = 8e3;
function Zr(e) {
  const t = e.fetchApi("/plenio/api/v1/briefs").then(async (n) => n.ok ? (await n.json()).values ?? {} : {}).catch(() => ({}));
  return no ??= Promise.race([t, new Promise((n) => setTimeout(() => n({}), Jr))]), no;
}
async function ei(e, t, n, o) {
  const s = await Zr(n);
  if (!Object.keys(s).length) return;
  Xr(t, s);
  const r = e.prototype;
  r.onNodeCreated = Y(r.onNodeCreated, function() {
    Sn(this, o);
  }), r.onConfigure = Y(r.onConfigure, function() {
    Sn(this, o);
  });
}
const qt = [
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
], ps = ["length", "vocals", "melody"], qn = {
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
}, ti = "my own, sung as written below", ni = "custom";
function hs(e) {
  return typeof e == "string" && e.trim().toLowerCase() === ni;
}
function ce(e, t) {
  const n = qn[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function oi(e) {
  const t = {};
  for (const n of [...qt, ...ps, "lyrics_from"]) {
    const o = ce(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function oo(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
const _e = (e) => typeof e == "string" ? e : String(e ?? "");
function zt(e) {
  return Object.keys(e.sources).filter((t) => qt.includes(t));
}
function si(e, t, n = {}) {
  const o = [];
  for (const i of zt(t)) {
    const a = ce(e, i);
    if (!a) continue;
    const c = _e(a.value), l = t.fields[i] ?? "", d = (n[i] ?? []).includes(c);
    (!c.trim() || d) && c !== l && o.push({ field: i, value: l });
  }
  const s = ce(e, "lyrics"), r = [...n.lyrics ?? [], t.fields.lyrics ?? ""].filter(Boolean);
  return s && _e(ce(e, "lyrics_from")?.value) === ti && r.includes(_e(s.value)) && o.push({ field: "lyrics", value: "" }), o;
}
function so(e, t) {
  const n = [];
  for (const o of zt(t)) {
    const s = ce(e, o), r = t.fields[o] ?? "";
    s && _e(s.value) !== r && n.push({ field: o, value: r });
  }
  return n;
}
function ri(e, t) {
  const n = { template: [], own: [] };
  for (const o of zt(t)) {
    const s = _e(ce(e, o)?.value).trim();
    s && n[s === (t.fields[o] ?? "").trim() ? "template" : "own"].push(o);
  }
  return n;
}
function bt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function ii(e, t, n) {
  if (!n || !t || t.template === "none") return null;
  const { template: o, own: s } = ri(e, t), r = [
    o.length ? `From the template: ${o.join(", ")}` : "",
    s.length ? `your own: ${s.join(", ")}` : ""
  ].filter(Boolean);
  return r.length ? r.join(" · ") : "The template has no text for these fields.";
}
function ai(e) {
  const t = e ? bt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function ci(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function li(e) {
  const t = e?.mode;
  return t?.description ? `Creative mode ${t.name} (experimental): ${t.description}` : null;
}
function rt(e, t) {
  for (const n of t) {
    const o = ce(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function ms(e) {
  const t = [];
  for (const n of qt) {
    const o = ce(e, n);
    !o || !hs(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const ro = "plenio_brief_template", ui = 400;
function di(e, t) {
  let n = null, o = null;
  const s = {};
  let r = !1, i = null, a;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const l = document.createElement("div");
  l.className = "line";
  const d = document.createElement("div");
  d.className = "hint";
  const f = document.createElement("div");
  f.className = "mode";
  const h = document.createElement("div");
  h.className = "actions", c.append(l, d, f, h);
  const g = (y, E, S) => {
    const N = document.createElement("button");
    return N.textContent = y, N.title = E, N.addEventListener("click", (C) => {
      C.stopPropagation(), S();
    }), h.append(N), N;
  }, x = g("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (rt(e, bt(n)), V());
  }), M = g("Refill from template", "Put the template’s value back into every text field you changed", () => {
    if (!n) return;
    const y = so(e, n);
    if (!y.length) return;
    const E = y.map((S) => S.field).join(", ");
    window.confirm(`Replace your values in ${E} with the template's?`) && (rt(e, y), V());
  }), P = g("↻", "Ask again what the template fills", () => {
    v();
  }), V = () => {
    l.textContent = i ?? ii(e, n, r) ?? "No template: the fields hold your values only.", l.dataset.state = i ? "error" : r && n ? "ok" : "empty";
    const y = ai(n), E = ci(n);
    d.textContent = [y, E].filter(Boolean).join(" · "), d.style.display = d.textContent ? "" : "none", f.textContent = li(n) ?? "", f.style.display = f.textContent ? "" : "none", h.style.display = r && n && n.template !== "none" ? "" : "none", x.disabled = !n || !bt(n).length, M.disabled = !n || !so(e, n).length, P.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, u = (y) => {
    const E = String(e.widgets?.find((N) => N.name === "template")?.value ?? "none");
    if (y.template !== (E || "none")) return;
    if (o !== null && o !== y.template) {
      const N = oo(e) === "cover", C = (B) => N || (s[B] ?? []).includes(_e(ce(e, B)?.value));
      rt(e, bt(y).filter((B) => C(B.field)));
    }
    const S = si(e, y, s);
    S.length && rt(e, S);
    for (const N of [...zt(y), ...ps]) {
      const C = _e(ce(e, N)?.value);
      C && C === (y.fields[N] ?? "") && !(s[N] ??= []).includes(C) && s[N].push(C);
    }
    o = y.template;
  }, k = /* @__PURE__ */ new WeakSet(), L = () => {
    pi(e);
    for (const y of ["template", "arrangement", ...Object.keys(qn)]) {
      const E = y === "template" || y === "arrangement" ? e.widgets?.find((S) => S.name === y) : ce(e, y);
      !E || k.has(E) || (k.add(E), E.callback = Y(E.callback, () => {
        L(), v();
      }));
    }
    Qr(e);
  }, b = async () => {
    L();
    const y = String(e.widgets?.find((E) => E.name === "template")?.value ?? "none");
    try {
      const E = String(e.widgets?.find((S) => S.name === "arrangement")?.value ?? "");
      n = await $r(t, { fields: oi(e), template: y, kind: oo(e), arrangement: E }), i = null, u(n);
    } catch (E) {
      n = null, i = `The template fields could not be read: ${E instanceof Error ? E.message : String(E)}`;
    }
    r = !0, V();
  };
  function v() {
    clearTimeout(a), a = setTimeout(() => {
      b();
    }, ui);
  }
  L();
  const _ = e.addDOMWidget(ro, ro, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 128
  });
  return _.serialize = !1, ms(e), V(), v(), {
    widget: _,
    refresh: v,
    answer: () => n,
    dispose: () => clearTimeout(a)
  };
}
const fi = {
  "vocals.lyrics_from": "lyrics",
  "vocals.lyrics": "lyrics idea or text"
};
function pi(e) {
  for (const t of e.widgets ?? []) {
    const n = fi[t.name];
    n && t.label !== n && (t.label = n);
  }
}
const io = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function hi(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, di(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), ms(this), n.get(this)?.refresh();
  };
}
const ao = "plenio.record/1", mi = 2, gi = "PLNO", it = new TextEncoder().encode(`${gi}plenio.project/1\0`), co = 32 * 2 ** 20;
class pe extends Error {
}
async function en(e, t, n) {
  return new Uint8Array(await e.slice(t, t + n).arrayBuffer());
}
function tn(e, t) {
  return e.length >= t.length && t.every((n, o) => e[o] === n);
}
async function wi(e) {
  const t = e.stream().pipeThrough(new DecompressionStream("gzip")).getReader(), n = [];
  let o = 0;
  for (; ; ) {
    const { done: i, value: a } = await t.read();
    if (i) break;
    if (o += a.length, o > co)
      throw await t.cancel(), new pe(`its Plenio project is larger than ${co / 2 ** 20} MB`);
    n.push(a);
  }
  const s = new Uint8Array(o);
  let r = 0;
  for (const i of n)
    s.set(i, r), r += i.length;
  return new TextDecoder().decode(s);
}
async function gs(e) {
  if (!tn(await en(e, 0, 4), new TextEncoder().encode("fLaC"))) throw new pe("it is not a FLAC file");
  let t = 4;
  for (; ; ) {
    const n = await en(e, t, 4);
    if (n.length < 4) throw new pe("the file ends inside its metadata");
    const o = n[1] << 16 | n[2] << 8 | n[3];
    if ((n[0] & 127) === mi && o >= 4) {
      const s = await en(e, t + 4, Math.min(o, it.length));
      if (tn(s, it.subarray(0, 4))) {
        if (!tn(s, it)) throw new pe("it holds a Plenio project of an unknown layout (made by a newer Plenio)");
        let r;
        try {
          r = await wi(e.slice(t + 4 + it.length, t + 4 + o));
        } catch (a) {
          throw a instanceof pe ? a : new pe(`its Plenio project is damaged (${a instanceof Error ? a.message : String(a)})`);
        }
        let i;
        try {
          i = JSON.parse(r);
        } catch {
          throw new pe("its Plenio project is damaged (no JSON)");
        }
        if (i?.schema !== ao)
          throw new pe(`its Plenio project is no release record (${ao})`);
        return i;
      }
    }
    if (n[0] & 128) return null;
    t += 4 + o;
  }
}
function ws(e) {
  return /\.flac$/i.test(e.name ?? "") || e.type === "audio/flac" || e.type === "audio/x-flac";
}
const zn = "plenio.sheet_state/1", Je = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Ht() {
  return { schema: zn, docs: {} };
}
function $e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Ht();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== zn || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ye(e) {
  const t = {};
  for (const o of Je) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: zn, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function nn(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function yi(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Je.filter((o) => nn(e, o) !== "auto").map(
    (o) => o === "lyrics" && nn(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${nn(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Wu(e) {
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
const Gu = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function Vu(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function Uu(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function lo(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function Yu(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: lo(s?.[0] ?? 0), end: lo(r?.[1] ?? e.duration_s) };
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
function bi(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function Xu(e, t, n) {
  return n.map((o) => ({ kind: o, text: bi(e, t, o), intent: "keep" }));
}
function ys(e, t, n) {
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
  const s = { ...Ht(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function vi(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function bs(e, t) {
  return Je.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function xi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const ki = "PlenioSongSheet";
function vs(e) {
  return e.nodes ?? e._nodes ?? [];
}
function Si(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? vs(e).find((o) => String(o.id) === t) ?? null;
}
function on(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = Si(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function Mi(e, t) {
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
function _i(e, t) {
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
    const i = Mi(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = on(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function Ei(e, t) {
  let n = 0;
  for (const o of vs(e)) {
    if (o.type !== ki) continue;
    const s = o.widgets?.find((f) => f.name === "sheet_state");
    if (!s) continue;
    const r = $e(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((f) => f.link != null).map((f) => f.name), a = bs(i, r), c = (a.length ? a : [...Je]).filter((f) => !!t[f]);
    if (!c.length) continue;
    const l = { ...r.docs };
    for (const f of c) l[f] = { state: "manual", text: t[f] };
    const d = Ye({ ...r, docs: l, review: void 0 });
    s.value = d, s.callback?.(d), n++;
  }
  return n;
}
function $i(e, t) {
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
const Mn = "Plenio was updated while this page was open: reload the page (F5).";
function Ai(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function Li(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function Hn(e, t) {
  const n = Ai(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? Li(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function Fn(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Ce(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${Mn} ${n}` : Mn) : o;
  }
}
const rn = "Plenio.ContinueSong", Ti = "plenio.record/1";
function _n(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function Ct(e, t) {
  const n = await Lr(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, $i("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = _i(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), _n(e, "success", "Song opened", sn(n, i));
    return;
  }
  const o = e.app.graph, s = o ? Ei(o, n.documents) : 0;
  if (!s)
    throw new Q(
      sn(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  _n(e, "success", "Song texts taken", `${sn(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function Ni(e) {
  if (ws(e)) return gs(e);
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === Ti ? t : null;
  } catch {
    return null;
  }
}
function uo(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function Ci(e, t) {
  const n = [...e.dataTransfer?.files ?? []];
  if (n.length !== 1 || !ws(n[0]) || e.shiftKey) return null;
  const o = t.canvas, s = t.graph;
  if (!o?.canvas || e.target !== o.canvas || !o.convertEventToCanvasOffset || !s?.getNodeOnPos) return null;
  const [r, i] = o.convertEventToCanvasOffset(e);
  return s.getNodeOnPos(r, i) ? null : n[0];
}
function Pi(e, t = window) {
  const n = (o) => {
    const s = uo(o) ? null : Ci(o, e.app), r = s ?? uo(o);
    r && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      if (s) {
        const a = await gs(s);
        if (a) return Ct(e, { record: a, name: s.name });
        if (!e.app.handleFile) throw new Q(`${s.name} carries no Plenio project.`, "Drop it with Shift held to give it to ComfyUI.");
        return e.app.handleFile(s);
      }
      const i = await Ni(r);
      if (!i) throw new Q(`${r.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await Ct(e, { record: i, name: r.name });
    })().catch((i) => {
      const a = i instanceof pe ? `${r.name}: ${i.message}.` : i instanceof Q && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
      _n(e, "error", "Song not opened", a, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function Oi(e) {
  const t = () => Hn(import.meta.url, Fn), { openContinueDialog: n } = await Ce(() => import("./openContinue-B_ubU6hY.mjs"), t);
  n(e.fetcher, (o) => Ct(e, o));
}
const Ii = "COMFY_DYNAMICCOMBO_V3";
function Ri(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Bi(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Di(e, t) {
  const n = Bi(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function qi(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function zi(e, t, n) {
  if (!t || !e.widgets || Di(e, t)) return !1;
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
    if (n.has(r.name) && !qi(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function Hi(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === Ii && t.add(o);
  return t;
}
const xs = "plenio.eq/1", vt = 8, xe = 20, Fi = 2e4, De = 12, ks = 15, Oe = ["peak", "low_shelf", "high_shelf"], Ss = ["peak", "notch", "highpass", "lowpass"], fo = [0.2, 10], po = [0.25, 1];
function Ne() {
  return { schema: xs, preamp_db: 0, bands: [] };
}
function ji(e) {
  if (typeof e != "string" || !e.trim()) return Ne();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: xs,
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
function Pe(e) {
  return JSON.stringify(e);
}
const oe = (e, t) => Number(e.toFixed(t));
function ee(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ms(e) {
  return e.db ?? ks;
}
const ho = [6, 12, 18], Wi = { 6: 8, 12: 14, 18: 20 };
function Gi(e, t) {
  return { ...e, db: Wi[t] ?? ks };
}
function Me(e, t) {
  return Math.log(ee(t, xe, e.maxHz) / xe) / Math.log(e.maxHz / xe) * e.width;
}
function mo(e, t) {
  return xe * (e.maxHz / xe) ** ee(t / e.width, 0, 1);
}
function be(e, t) {
  const n = Ms(e);
  return (1 - (ee(t, -n, n) + n) / (2 * n)) * e.height;
}
function go(e, t) {
  const n = Ms(e);
  return (1 - ee(t / e.height, 0, 1)) * 2 * n - n;
}
function wo(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function yo(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${Me(e, o).toFixed(1)},${be(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function jn(e) {
  return Math.min(Fi, 0.45 * e);
}
function Vi(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Ui(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= vt) return null;
  const s = {
    id: Vi(e),
    enabled: !0,
    type: "peak",
    frequency_hz: oe(ee(t, xe, jn(o)), 1),
    gain_db: oe(ee(n, -De, De), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function Fe(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: oe(ee(n, xe, jn(s)), 1),
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
function Yi(e, t) {
  const n = _s[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Oe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = Ss.includes(e.type) ? ` Q ${oe(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const _s = {
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
function at(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function xt(e, t, n, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: oe(ee(at(r.frequency_hz, s.frequency_hz), xe, jn(o)), 1),
        gain_db: oe(ee(at(r.gain_db, s.gain_db), -De, De), 1),
        q: oe(ee(at(r.q, s.q), fo[0], fo[1]), 3),
        slope: oe(ee(at(r.slope, s.slope), po[0], po[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function bo(e, t) {
  return xt(e, t, { gain_db: 0 });
}
function vo(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((f) => Number.isFinite(f));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), c = e.height - 4, l = c - Math.max(12, e.height * ee(o, 0.1, 0.95));
  return `M${t.map((f, h) => {
    const g = n[h], x = Number.isFinite(g) ? (g - i) / a : 0;
    return `${Me(e, f).toFixed(1)},${(c - x * (c - l)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${c.toFixed(1)} L0,${c.toFixed(1)} Z`;
}
class Xi {
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
    Pe(t) !== Pe(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Ki = "http://www.w3.org/2000/svg", xo = "plenio_eq_panel", ct = "mode.bands", ge = { capture: !0 }, ie = { width: 560, height: 260 }, lt = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let un = null;
function de(e, t) {
  const n = document.createElementNS(Ki, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function K(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function Se(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function fe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Qi(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function Ji(e, t) {
  const n = K("div", "plenio-eq"), o = K("div", "plenio-eq-tools"), s = K("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = K("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const p of ho) r.append(new Option(`±${p} dB`, String(p)));
  const i = Se("", "↶", "Undo the last band change"), a = Se("", "↷", "Redo the last band change"), c = Se("", "reset", "Remove every band"), l = Se("", "compare", "Show the curve without the EQ (bypass)"), d = Se("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), f = K("span", "plenio-eq-info");
  f.setAttribute("aria-live", "polite"), f.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, c, l, d, f);
  const h = K("div", "plenio-eq-mode"), g = de("svg", {
    viewBox: `0 0 ${ie.width} ${ie.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  g.setAttribute("aria-label", "EQ response curve"), g.setAttribute("tabindex", "0"), g.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const x = K("div", "plenio-eq-strip"), M = K("div", "plenio-eq-editor"), P = K("div", "plenio-eq-fields");
  M.append(P), n.append(o, h, g, x, M);
  const V = e.addDOMWidget(xo, xo, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: Ne(), readonly: !0, note: "" }, k = null, L = null, b = !1, v = 12, _ = null, y = [], E = 0, S, N, C = null, B = !1;
  const j = /* @__PURE__ */ new Map();
  let X = null;
  const H = new Xi(Ne()), Z = () => fe(e, ct), U = () => v, I = () => Gi({ ...ie, maxHz: Math.min(2e4, u.sampleRate / 2) }, U());
  function R(p, { record: w = !0 } = {}) {
    const m = Z();
    if (!m) return;
    const $ = Pe(p);
    m.value = $, m.callback?.($), w && H.push(p), u = { ...u, settings: p }, J(), W(0);
  }
  async function W(p = 120) {
    clearTimeout(S), S = setTimeout(async () => {
      const w = String(fe(e, "mode")?.value ?? "flat");
      if (w !== "manual") {
        w === "flat" ? u = {
          ...u,
          settings: Ne(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : k !== w ? u = {
          ...u,
          settings: Ne(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: `${w}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : u = { ...u, readonly: !0 }, J();
        return;
      }
      const m = ji(Z()?.value);
      if (!m) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, J();
        return;
      }
      Pe(m) !== Pe(H.current) && H.reset(m);
      const $ = ++E;
      try {
        const T = await Jn(t, m, u.sampleRate);
        if ($ !== E) return;
        u = {
          ...u,
          frequencies: T.frequency_hz,
          response: T.response_db,
          settings: T.settings,
          readonly: !1,
          note: ""
        };
      } catch (T) {
        u = { ...u, readonly: !1, note: T instanceof Error ? T.message : String(T) };
      }
      J();
    }, p);
  }
  const tt = (p) => ({
    ...p.settings,
    bands: p.settings.bands.slice(0, vt)
  });
  function He() {
    if (!_) return "";
    const p = y.find((w) => w.name === _);
    return p && Qi(tt(p), u.settings) ? _ : "";
  }
  function J() {
    g.replaceChildren(), j.clear(), X = null;
    const p = I();
    for (const m of [-p.db, -p.db / 2, 0, p.db / 2, p.db])
      g.append(
        de("line", { x1: 0, x2: p.width, y1: be(p, m), y2: be(p, m), class: m ? "grid" : "grid zero" })
      );
    for (const m of [100, 1e3, 1e4])
      g.append(de("line", { x1: Me(p, m), x2: Me(p, m), y1: 0, y2: p.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && g.append(de("path", { d: vo(p, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && g.append(de("path", { d: vo(p, u.frequencies, u.afterDb), class: "spectrum after" })), b ? g.append(de("line", { x1: 0, x2: p.width, y1: be(p, 0), y2: be(p, 0), class: "curve flat" })) : u.frequencies.length && (X = de("path", { d: yo(p, u.frequencies, u.response), class: "curve" }), g.append(X)), !u.readonly && !b && u.settings.bands.forEach((m, $) => {
      const T = lt[$ % lt.length], q = Oe.includes(m.type) ? m.gain_db : 0, A = de("circle", {
        cx: Me(p, m.frequency_hz),
        cy: be(p, q),
        r: m.id === L ? 9 : 7,
        class: m.id === L ? "handle selected" : "handle",
        style: `stroke: ${T}`,
        tabindex: 0,
        "data-band": m.id
      });
      A.setAttribute("aria-label", `Band ${$ + 1}: ${je(m)}`), m.enabled || A.classList.add("disabled"), A.append(de("title", {})), A.lastChild.textContent = `Band ${$ + 1}: ${je(m)}`, A.addEventListener("pointerdown", (F) => gr(F, m.id)), A.addEventListener("dblclick", (F) => {
        F.stopPropagation(), R(bo(u.settings, m.id));
      }), A.addEventListener("focus", () => me(m.id)), A.addEventListener("keydown", (F) => Yn(F, m.id)), A.addEventListener("wheel", (F) => {
        F.preventDefault();
        const ke = F.deltaY < 0 ? 1.15 : 1 / 1.15;
        R(an(u.settings, m.id, ke));
      }), A.addEventListener("contextmenu", (F) => {
        F.preventDefault(), R(cn(u.settings, m.id));
      }), g.append(A), j.set(m.id, A);
    }), Gt(), Le(), Vt();
    const w = u.settings.bands.find((m) => m.id === L);
    f.textContent = u.note || (b ? "compare: the curve is off (the node still applies it)" : w ? je(w) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${vt}`), s.disabled = u.readonly, i.disabled = !H.canUndo, a.disabled = !H.canRedo, c.disabled = u.readonly || !u.settings.bands.length, B && (B = !1, L && j.get(L)?.focus({ preventScroll: !0 })), r.value = String(v), s.value = He(), l.classList.toggle("active", b), d.classList.toggle("active", Xt()), e.setDirtyCanvas?.(!0, !0);
  }
  function Gt() {
    if (x.replaceChildren(), u.readonly && !u.settings.bands.length) {
      x.append(K("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((p, w) => {
      const m = K("button", "plenio-eq-chip", Yi(p, w));
      m.style.borderLeftColor = lt[w % lt.length], m.classList.toggle("selected", p.id === L), m.classList.toggle("disabled", !p.enabled), m.setAttribute("aria-label", `Edit band ${w + 1}`), m.title = `Band ${w + 1}: ${je(p)} - click to open its fields`, m.addEventListener("click", ($) => {
        $.stopPropagation(), L = L === p.id ? null : p.id, J();
      }), x.append(m);
    });
  }
  function Le() {
    P.replaceChildren();
    const p = u.settings.bands.find((A) => A.id === L);
    if (!p || u.readonly) {
      M.style.display = "none";
      return;
    }
    M.style.display = "";
    const w = K("span", "name", `Band ${u.settings.bands.indexOf(p) + 1}`);
    w.title = "The selected band";
    const m = K("select");
    m.setAttribute("aria-label", "Band type"), m.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [A, F] of Object.entries(_s)) m.append(new Option(F, A));
    m.value = p.type, m.addEventListener("change", () => R(xt(u.settings, p.id, { type: m.value })));
    const $ = K("input");
    $.type = "checkbox", $.checked = p.enabled, $.setAttribute("aria-label", "Band enabled"), $.title = "Band enabled: off keeps the band in the list but out of the response", $.addEventListener("change", () => R(xt(u.settings, p.id, { enabled: $.checked })));
    const T = [
      [
        "Hz",
        `${p.frequency_hz}`,
        70,
        (A) => Qt(p.id, "frequency_hz", ln(A, { kilo: !0 }))
      ],
      ["dB", `${p.gain_db}`, 60, (A) => Qt(p.id, "gain_db", ln(A))],
      ["Q", `${p.q}`, 60, (A) => Qt(p.id, "q", ln(A))]
    ];
    P.append(w, m, $);
    for (const [A, F, ke, nt] of T) {
      const te = K("input", "number");
      te.value = F, te.style.width = `${ke}px`, te.setAttribute("aria-label", `Band ${A}`), te.title = A === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : A === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const ot = () => {
        nt(te.value) || (te.value = F);
      };
      te.addEventListener("keydown", (ue) => {
        ue.key === "Enter" && ot();
      }), te.addEventListener("blur", ot), (A === "dB" && !Oe.includes(p.type) || A === "Q" && !Ss.includes(p.type)) && (te.disabled = !0), P.append(te);
    }
    const q = Se("", "remove", "Remove this band");
    q.addEventListener("click", (A) => {
      A.stopPropagation(), L = null, R(cn(u.settings, p.id));
    }), P.append(q);
  }
  function Vt() {
    h.replaceChildren();
    const p = String(fe(e, "mode")?.value ?? "flat");
    if (p === "manual" || p === "flat") {
      h.style.display = "none";
      return;
    }
    h.style.display = "", h.append(
      K(
        "span",
        "plenio-eq-hint",
        k === p ? `applied proposal (${u.settings.bands.length} band(s), ${p})` : `${p}: no proposal yet - it is computed on the next run`
      )
    );
    const w = Se("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    w.disabled = !u.settings.bands.length, w.addEventListener("click", (m) => {
      m.stopPropagation();
      const $ = fe(e, "mode");
      if (!$) return;
      $.value = "manual", $.callback?.("manual");
      const T = Z();
      if (T) {
        const q = Pe(u.settings);
        T.value = q, T.callback?.(q);
      }
      H.reset(u.settings), Jt(), W(0);
    }), h.append(w);
  }
  function me(p) {
    L = p, B = !0, J();
  }
  function Ut(p) {
    L = p, Yt();
  }
  function Yt() {
    const p = I();
    u.settings.bands.forEach((m) => {
      const $ = j.get(m.id);
      if (!$) return;
      const T = Oe.includes(m.type) ? m.gain_db : 0;
      $.setAttribute("cx", String(Me(p, m.frequency_hz))), $.setAttribute("cy", String(be(p, T))), $.classList.toggle("selected", m.id === L), $.setAttribute("r", m.id === L ? "9" : "7");
    }), X && u.frequencies.length && X.setAttribute("d", yo(p, u.frequencies, u.response));
    const w = u.settings.bands.find((m) => m.id === L);
    w && (f.textContent = je(w));
  }
  function mr() {
    clearTimeout(N), N = setTimeout(async () => {
      const p = u.settings, w = ++E;
      try {
        const m = await Jn(t, p, u.sampleRate);
        if (w !== E) return;
        u = { ...u, frequencies: m.frequency_hz, response: m.response_db }, Yt();
      } catch {
      }
    }, 60);
  }
  function Xt() {
    return !fe(e, ct)?.plenioHidden;
  }
  function Kt(p) {
    const w = fe(e, ct);
    w && (w.plenioHidden = !p, p ? delete w.computeSize : w.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Qt(p, w, m) {
    if (m === null) return !1;
    const $ = u.settings.bands.find((T) => T.id === p);
    return $ && $[w] === m || R(xt(u.settings, p, { [w]: m })), !0;
  }
  function gr(p, w) {
    p.preventDefault(), p.stopPropagation(), L !== w && Ut(w);
    const m = u.settings.bands.find((se) => se.id === w);
    if (!m) return;
    C = { hz: m.frequency_hz, db: m.gain_db };
    let $ = !1, T = !1;
    const q = p.currentTarget;
    try {
      q?.setPointerCapture?.(p.pointerId);
    } catch {
    }
    const A = g.getBoundingClientRect(), F = A.width ? A.left : 0, ke = A.height ? A.top : 0, nt = A.width || ie.width, te = A.height || ie.height, ot = (se, st) => se >= F - 1 && se <= F + nt + 1 && st >= ke - 1 && st <= ke + te + 1;
    function ue() {
      if (!T) {
        T = !0;
        try {
          q?.releasePointerCapture?.(p.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Qn, ge), window.removeEventListener("pointerup", ue, ge), window.removeEventListener("pointercancel", ue, ge), window.removeEventListener("blur", ue, ge), C = null, $ && R(u.settings);
      }
    }
    const Qn = (se) => {
      if (T || !C) return;
      if (se.buttons === 0) {
        ue();
        return;
      }
      if (!ot(se.clientX, se.clientY)) return;
      const st = ie.width / nt, yr = ie.height / te, br = (se.clientX - F) * st, vr = (se.clientY - ke) * yr, xr = Me(I(), C.hz), kr = be(I(), C.db), Sr = mo(I(), wo(xr, br, se.shiftKey)), Mr = go(I(), wo(kr, vr, se.shiftKey));
      u = { ...u, settings: Fe(u.settings, w, Sr, Mr, u.sampleRate) }, $ = !0, Yt(), mr();
    };
    window.addEventListener("pointermove", Qn, ge), window.addEventListener("pointerup", ue, ge), window.addEventListener("pointercancel", ue, ge), window.addEventListener("blur", ue, ge);
  }
  function Yn(p, w) {
    const m = u.settings.bands.find((A) => A.id === w);
    if (!m) return;
    const $ = p.shiftKey ? 0.1 : 0.5, T = p.shiftKey ? 1.01 : 1.06;
    let q = null;
    p.key === "ArrowUp" ? q = Fe(u.settings, w, m.frequency_hz, m.gain_db + $, u.sampleRate) : p.key === "ArrowDown" ? q = Fe(u.settings, w, m.frequency_hz, m.gain_db - $, u.sampleRate) : p.key === "ArrowRight" ? q = Fe(u.settings, w, m.frequency_hz * T, m.gain_db, u.sampleRate) : p.key === "ArrowLeft" ? q = Fe(u.settings, w, m.frequency_hz / T, m.gain_db, u.sampleRate) : p.key === "+" ? q = an(u.settings, w, 1.15) : p.key === "-" ? q = an(u.settings, w, 1 / 1.15) : p.key === "0" ? q = bo(u.settings, w) : (p.key === "Delete" || p.key === "Backspace") && (q = cn(u.settings, w)), q && (p.preventDefault(), R(q));
  }
  g.addEventListener("keydown", (p) => {
    L && p.target === g && Yn(p, L);
  }), g.addEventListener("dblclick", (p) => {
    if (u.readonly || b) return;
    const w = g.getBoundingClientRect(), m = ie.width / (w.width || ie.width), $ = ie.height / (w.height || ie.height), T = (p.clientX - w.left) * m, q = (p.clientY - w.top) * $, A = Ui(u.settings, mo(I(), T), go(I(), q), u.sampleRate);
    A ? (L = A.bands[A.bands.length - 1].id, R(A)) : (u = { ...u, note: `the EQ has at most ${vt} bands` }, J());
  }), s.append(new Option("preset…", "")), un ??= Ar(t).then((p) => p.manual).catch(() => []), un.then((p) => {
    y = p;
    for (const w of p) s.append(new Option(w.name, w.name));
    s.value = He();
  }), s.addEventListener("change", async () => {
    const p = (await un)?.find((w) => w.name === s.value);
    p && (_ = p.name, R(tt(p)));
  }), r.addEventListener("change", () => {
    const p = Number(r.value);
    v = ho.find((w) => w === p) ?? 12, J();
  }), i.addEventListener("click", () => {
    const p = H.undo();
    p && R(p, { record: !1 });
  }), a.addEventListener("click", () => {
    const p = H.redo();
    p && R(p, { record: !1 });
  }), c.addEventListener("click", () => {
    L = null, R(Ne());
  }), l.addEventListener("click", () => {
    b = !b, J();
  }), d.addEventListener("click", () => {
    Kt(!Xt()), J();
  });
  function Jt() {
    for (const p of ["mode", ct]) {
      const w = fe(e, p);
      if (!w || w.plenioWatched) continue;
      w.plenioWatched = !0;
      const m = w.callback;
      w.callback = ($) => {
        m?.($), setTimeout(() => {
          Xt() || Kt(!1), W();
        });
      };
    }
  }
  Jt(), Kt(!1), W(0);
  let Xn = null, Kn = null;
  const wr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(wr);
      return;
    }
    const p = String(fe(e, "mode")?.value ?? "flat"), w = String(Z()?.value ?? "");
    p === Xn && w === Kn || (Xn = p, Kn = w, Jt(), W(0));
  }, 700);
  return {
    showExecuted(p) {
      const w = p?.plenio_eq, m = w?.[w.length - 1];
      if (!m) return;
      const $ = String(fe(e, "mode")?.value ?? "flat"), T = $ === "manual";
      k = T || $ === "flat" ? null : $, u = {
        sampleRate: m.sample_rate,
        frequencies: m.frequency_hz,
        response: m.response_db,
        settings: m.settings,
        readonly: !T,
        note: T ? "" : `applied: ${m.settings.bands.length} band(s)`,
        beforeDb: m.spectrum_before_db,
        afterDb: m.spectrum_after_db
      }, T ? W(0) : J();
    }
  };
}
const Wn = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Zi = new Set(qt.map((e) => qn[e]));
function ea(e, t) {
  return !(e in Wn) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => Zi.has(n) && hs(o)).map(([n]) => n);
}
const ko = ["written from the idea below", "my own, sung as written below"], Es = 7, dn = Es + 4;
function ta(e) {
  return !["sung", "sparse vocals"].includes(String(e[Es])) || ko.includes(e[dn]) ? e : [...e.slice(0, dn), ko[0], "", ...e.slice(dn)];
}
function na(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const oa = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function sa(e, t) {
  const n = oa[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
const So = 6, ra = 8, ia = 18;
function aa(e) {
  if (e[So] !== "tags" || e.length > ia) return e;
  const t = So + 1 + ra;
  return [...e.slice(0, t), "", ...e.slice(t)];
}
function ca(e, t) {
  if (e.name === "PlenioExportRelease" && t && Array.isArray(t.widgets_values)) {
    const c = aa(t.widgets_values);
    return c === t.widgets_values ? t : { ...t, widgets_values: c };
  }
  const n = Wn[e.name];
  if (!n || !t) return t;
  const o = na(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = ea(e.name, i.widgets_values_named);
  if (a.length) {
    const c = { ...i.widgets_values_named };
    for (const l of a) c[l] = "";
    i = { ...i, widgets_values_named: c };
  }
  if (e.name === "PlenioSongBrief" && Array.isArray(i.widgets_values)) {
    const c = ta(i.widgets_values);
    c !== i.widgets_values && (i = { ...i, widgets_values: c });
  }
  return i;
}
const qe = "PlenioModelChoice", la = "plenio.models_missing", kt = "auto", Mo = "component.file";
function ua(e) {
  return e.replace(/\.(safetensors|ckpt|bin|gguf|pt|pth)$/i, "");
}
function da(e) {
  return (e.includes(": ") ? e.slice(e.indexOf(": ") + 2) : e).split(",")[0].trim();
}
function fa(e, t) {
  const n = String(e ?? "");
  if (n === kt) {
    const s = t?.pick;
    if (!s?.file) return kt;
    const r = s.source === "config" ? "pinned in config.toml" : da(s.reason);
    return `${kt} · ${ua(s.file)} · ${r}${s.installed ? "" : " · to download"}`;
  }
  const o = t?.files?.[n];
  return o ? `${n} · does not fit: ${o}` : n;
}
function pa(e) {
  const t = e.file || "a model file", n = e.folder ? `models/${e.folder}` : "its model folder", o = e.url ? `Download it from ${e.url} into ${n}, then run again.` : `It is a file of your own: put it into ${n}, or set the field to auto.`;
  return { summary: `Model missing: ${t}`, detail: o };
}
function ha(e, t) {
  if (!t) return !1;
  const n = String(e ?? "");
  return n === kt ? t.pick ? !t.pick.installed : !1 : !(n in t.files);
}
function En(e) {
  return String(e.widgets?.find((t) => t.name === "component")?.value ?? "");
}
function _o(e, t) {
  e.options = { ...e.options, getOptionLabel: (n) => fa(n, t()) };
}
async function ma(e) {
  try {
    const t = await e.fetchApi("/plenio/models/files");
    return t.ok ? (await t.json()).components ?? {} : {};
  } catch {
    return {};
  }
}
class ga {
  constructor(t) {
    this.fetcher = t;
  }
  fetcher;
  files = {};
  info(t) {
    return this.files[t];
  }
  async refresh() {
    this.files = await ma(this.fetcher);
  }
  /** The node's file field shows the labels of its current component (its child widget is made anew when the
   * component changes: called again then). */
  label(t) {
    const n = t.widgets?.find((o) => o.name === Mo);
    n && _o(n, () => this.info(En(t)));
  }
  /** A block's promoted fields that show a Model Choice inside it: the field whose list is that node's list. */
  labelBlock(t) {
    const n = (t.subgraph?.nodes ?? []).filter((s) => s.type === qe || s.comfyClass === qe), o = /* @__PURE__ */ new Set();
    for (const s of n) {
      const i = s.widgets?.find((l) => l.name === Mo)?.options?.values;
      if (!Array.isArray(i)) continue;
      const a = (t.widgets ?? []).find(
        (l) => !o.has(l) && l.type === "combo" && wa(l.options?.values, i)
      );
      if (!a) continue;
      o.add(a);
      const c = En(s);
      _o(a, () => this.info(c));
    }
  }
}
function wa(e, t) {
  return Array.isArray(e) && e.length === t.length && e.every((n, o) => n === t[o]);
}
const $s = /* @__PURE__ */ new Map(), $n = /* @__PURE__ */ new Set();
function Eo(e, t) {
  $s.set(e, t);
  for (const n of $n) n(e);
}
function Te(e) {
  return $s.get(e) ?? null;
}
function ya(e) {
  return $n.add(e), () => $n.delete(e);
}
const As = /* @__PURE__ */ new Map();
function ba(e) {
  e?.draft_sha256 && As.set(e.draft_sha256, e);
}
function va(e) {
  return e ? As.get(e) ?? null : null;
}
const $o = "Plenio.OpenPlayer", Ao = "plenio-player", xa = "▶ Open in the Plenio Player";
function An(e, t, n, o, s = 12e3) {
  e.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function ka(e) {
  const t = await e.fetchApi("/plenio/player/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  }), n = await t.json().catch(() => ({}));
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new Q(o.message ?? `The Plenio Player did not start (${t.status})`, o.hint ?? null);
  }
  return n;
}
function Lo(e, t) {
  const n = e.endsWith("/") ? e : `${e}/`;
  return t ? `${n}#/record/${encodeURIComponent(t)}` : `${n}#/`;
}
async function St(e, t = null, n = window) {
  const o = n.open("", Ao);
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
    const r = await ka(e.fetcher);
    o ? ((s || t) && (o.location.href = Lo(r.url, t)), o.focus()) : n.open(Lo(r.url, t), Ao), r.started && An(e.app, "success", "Plenio Player started", `${r.url} - it keeps running when ComfyUI stops; stop it on its Settings page.`);
  } catch (r) {
    o && s && o.close();
    const i = r instanceof Q && r.hint ? ` ${r.hint}` : "";
    An(e.app, "error", "Plenio Player", `${r instanceof Error ? r.message : String(r)}${i}`, 2e4);
  }
}
function Sa(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this);
    const i = this.addWidget?.("button", xa, null, () => {
      St(t, n.get(this) ?? null);
    }, { serialize: !1 });
    i && (i.serialize = !1);
  }, e.prototype.onExecuted = Y(e.prototype.onExecuted, function(r) {
    const i = r?.plenio_player, a = i?.[i.length - 1]?.record;
    a && n.set(this, a);
  });
}
const Ma = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
function _a(e, t) {
  if (e === t) return !0;
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? !1 : Ma.has(n.hostname) || n.hostname === new URL(t).hostname;
  } catch {
    return !1;
  }
}
function Ea(e, t = window, n = 1500) {
  const o = new URLSearchParams(t.location.search);
  if (o.get("plenio") !== "continue") return !1;
  o.delete("plenio");
  const s = o.toString();
  t.history.replaceState(t.history.state, "", `${t.location.pathname}${s ? `?${s}` : ""}${t.location.hash}`);
  const r = t.opener;
  if (!r) return !0;
  const i = (a) => {
    const c = a.data;
    c?.type !== "plenio-continue" || a.source !== r || !_a(a.origin, t.location.origin) || (t.removeEventListener("message", i), Ct(e, { record: c.record, name: String(c.name || "the Plenio Player") }).catch((l) => {
      const d = l instanceof Q && l.hint ? ` ${l.hint}` : "";
      An(e.app, "error", "Continue a song", `${l instanceof Error ? l.message : String(l)}${d}`, 2e4);
    }));
  };
  return t.addEventListener("message", i), t.setTimeout(() => r.postMessage({ type: "plenio-ready" }, "*"), n), !0;
}
const $a = {
  "one song, stop to review": "new song every run",
  "one cover, stop to review": "new cover every run"
}, Aa = 2e3, La = 3e4;
function Ta(e, t, n, o) {
  const s = $a[t];
  return !s || n <= 0 && o <= 1 ? null : {
    summary: "These runs stop for your review",
    detail: `${e}: "${t}" - each run waits at the Song Sheets until you press Approve, so queued runs render nothing by themselves. For runs that go through, choose "${s}" in the brief's mode.`
  };
}
class Na {
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
    this.recent = [...this.recent.filter((r) => o - r < Aa), o];
    const s = Ta(t, n, this.queued, this.recent.length);
    !s || o - this.lastNotice < La || (this.lastNotice = o, this.notify(s));
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
function Ca(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function Pa(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Ls(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Oa(e) {
  switch (e) {
    case "stop":
      return "⏸ stops here for review";
    case "waiting":
      return "⏸ waiting for your approval: Edit, Approve, run again";
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
const Pt = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new Set();
function Ts(e) {
  return Pt.get(e) ?? null;
}
function Ie(e, t) {
  t ? Pt.set(e, t) : Pt.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Xe) n(e);
}
function Ia(e) {
  for (const t of e) Pt.delete(t);
  for (const t of Xe) t(null);
}
function Ra() {
  for (const e of Xe) e(null);
}
function Ba(e) {
  return Xe.add(e), () => Xe.delete(e);
}
const To = "600 12px sans-serif", ut = 20, pn = 7;
function Da(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function qa(e) {
  const t = e ? Da(e) : "";
  return {
    height: e ? ut : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = To;
      const o = n.measureText(t).width + 2 * pn;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = To;
      const r = n.measureText(t).width + 2 * pn;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, ut, 5) : n.rect(o, s, r, ut), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + pn, s + ut / 2 + 0.5), n.restore();
    }
  };
}
const za = "PlenioSongSheet", Ha = 30;
function Ns(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function Fa(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? Ns(n, "mode") : null;
  } catch {
    return null;
  }
}
function Ln(e) {
  const t = Ts(e);
  return t || (e.type !== za ? null : Pa(Ns(e, "review") ?? "continue", Fa(e)) ? "stop" : null);
}
function ja(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Ls(n);
  const o = e?.plenio_summary;
  return Ca(o?.[o.length - 1]?.status);
}
function Wa(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = Ln(s);
      return qa(r ? fn[r] : null);
    });
  }, n.onDrawForeground = Y(n.onDrawForeground, function(s) {
    const r = Ln(this);
    !r || !fn[r].frame || this.flags?.collapsed || !this.size || Ga(s, fn[r], this.size, Ha, t.scale());
  }), n.onExecuted = Y(n.onExecuted, function(s) {
    const r = ja(s);
    r && (Ie(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      "Waiting for your approval: open it with its Edit button, check the documents, press Approve, then run again."
    ));
  });
}
function Ga(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function Ku(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, c = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: c, source: a }), o += c;
  }), n;
}
function Cs(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + ne) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Ae(e, t) {
  const n = Cs(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function Va(e, t) {
  const n = Cs(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function Qu(e, t, n) {
  const o = Ae(e, t), s = n == null ? 1 / 0 : Ae(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, c = Math.max(i.realStart, o), l = Math.min(a, s);
    if (l <= c + ne) continue;
    let d = i.source[0] + (c - i.realStart) / i.realDur * (i.source[1] - i.source[0]), f = c - o, h = l - c;
    if (d < 0 && (f -= d, h += d, d = 0, h <= ne))
      continue;
    const g = r.at(-1);
    g && Math.abs(g.at + g.duration - f) < ne && Math.abs(g.offset + g.duration - d) < 0.01 ? g.duration += h : r.push({ at: f, offset: d, duration: h });
  }
  return r;
}
const Ps = 0.04, ne = 1e-3, Ua = 0.25, Ya = 2;
function Ot(e) {
  return Math.min(Ya, Math.max(Ua, Number.isFinite(e) ? e : 1));
}
function Ju(e, t) {
  const n = Ot(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Ae(r, t.from) : t.from, a = (c) => (r ? Ae(r, c) : c) - i;
  for (const c of ["Vocal", "Ins"])
    if (t.voices[c])
      for (const l of e.notes?.[c] ?? []) {
        if (l.start_s < t.from - ne || l.start_s >= o - ne) continue;
        const d = Math.min(l.start_s + l.duration_s, o), f = Math.max(0, a(l.start_s));
        s.push({ at: f / n, duration: (a(d) - f) / n, midi: l.midi, part: c });
      }
  if (t.voices.chords)
    for (const c of e.chords ?? []) {
      const l = Math.min(c.start_s + c.duration_s, o), d = Math.max(c.start_s, t.from);
      if (!(l <= d + ne))
        for (const f of c.pitches)
          s.push({ at: a(d) / n, duration: (a(l) - a(d)) / n, midi: f, part: "chord" });
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
        const f = c.start_s + d * c.duration_s / l;
        f < t.from - ne || f >= o - ne || s.push({
          at: Math.max(0, a(f)) / n,
          duration: Ps,
          midi: d === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((c, l) => c.at - l.at || c.midi - l.midi);
}
function Zu(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Ae(o, n) - Ae(o, t.from) : n - t.from;
  return Math.max(0, s) / Ot(t.speed);
}
function ed(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, c = i > 0 ? Math.floor(a / i + 1e-6) : 0, l = i > 0 ? (a - c * i) / i * r : 0, d = l > 1e-3 ? 0 : 1, f = Math.max(0, o * t);
  return Array.from({ length: f }, (h, g) => {
    const x = d + f - 1 - g, M = ((c - x) % t + t) % t === 0;
    return { at: Math.max(0, s - l - x * r), duration: Ps, midi: M ? 96 : 89, part: "click" };
  });
}
function td(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? Va(n, Ae(n, e.from) + t * Ot(e.speed)) : e.from + t * Ot(e.speed);
}
function nd(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + ne && t < o.start_s + o.duration_s - ne
  ).map((o) => o.id);
}
function Xa(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const Ka = [
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
], od = {
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
function dt(e) {
  return typeof e == "string" && Ka.includes(e);
}
function Os() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Qa(e) {
  const t = Os(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: dt(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: dt(n.Ins) ? n.Ins : t.Ins,
    chord: dt(n.chord) ? n.chord : t.chord,
    guide: dt(n.guide) ? n.guide : t.guide
  };
}
const Ja = {
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
}, No = /* @__PURE__ */ new WeakMap();
function hn(e, t, n) {
  let o = No.get(e);
  o || No.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, c) => i[c + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const Co = /* @__PURE__ */ new WeakMap();
function Is(e) {
  let t = Co.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    Co.set(e, t);
  }
  return t;
}
function O(e, t, n, o = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = o, s;
}
function we(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ae(e, t, n, o = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = o, s;
}
function We(e, t, n, o, s, r) {
  const i = O(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const c of t) a.connect(c.detune);
  return i;
}
function mn(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = Is(e);
  const a = ae(e, "bandpass", o, 1.2), c = e.createGain();
  return c.gain.setValueAtTime(s, n), c.gain.setTargetAtTime(0, n, r), i.connect(a).connect(c).connect(t), i;
}
const Mt = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), Po = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [Oo(O(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [Oo(O(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = hn(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ae(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, Mt(r, 0.35)), a.connect(t);
      const c = O(e, i, n, -1.5), l = O(e, i, n, 1.5), d = we(e, 0.5);
      c.connect(d), l.connect(d), d.connect(a);
      const f = mn(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [c, l, f];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = O(e, "sine", n), a = O(e, "sine", n), c = e.createGain(), l = n * (1.2 + 2.2 * s);
      c.gain.setValueAtTime(l, o), c.gain.setTargetAtTime(n * 0.25, o, Mt(r, 0.25)), a.connect(c).connect(i.frequency);
      const d = ae(e, "highpass", 25, 0.7);
      d.connect(t);
      const f = O(e, "sine", n * 4), h = e.createGain();
      return h.gain.setValueAtTime(0.18 * s, o), h.gain.setTargetAtTime(0, o, 0.06), f.connect(h).connect(d), i.connect(d), [i, a, f];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, o) {
      const s = ae(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      s.connect(t);
      const r = [-9, 0, 8].map((a) => O(e, "sawtooth", n, a));
      for (const a of r) a.connect(s);
      const i = We(e, r, o, 5.3, 7, 0.3);
      return [...r, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, o) {
      const s = Math.min(n * 3 + 500, 4500), r = ae(e, "lowpass", s, 0.8);
      r.connect(t);
      const i = O(e, "sine", 0.25), a = we(e, s * 0.3);
      i.connect(a).connect(r.frequency);
      const c = [O(e, "sawtooth", n, -12), O(e, "sawtooth", n, 11), O(e, "triangle", n / 2)];
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
      const s = hn(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = O(e, s, n), i = O(e, "sine", n / 2), a = we(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const c = We(e, [r, i], o, 6.6, 4, 0), l = mn(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, c, l];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = hn(e, "flute", [1, 0.13, 0.06, 0.02]), r = O(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = Is(e), i.loop = !0;
      const a = ae(e, "bandpass", Math.min(n * 2, 8e3), 1.5), c = we(e, 0.06);
      i.connect(a).connect(c).connect(t);
      const l = We(e, [r], o, 4.9, 9, 0.25);
      return [r, i, l];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, o) {
      const s = O(e, "sawtooth", n), r = ae(e, "lowpass", 5e3, 0.5);
      s.connect(r);
      for (const [c, l, d] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const f = ae(e, "bandpass", c, l), h = we(e, d);
        r.connect(f).connect(h).connect(t);
      }
      const i = we(e, 0.15);
      r.connect(i).connect(t);
      const a = We(e, [s], o, 5.4, 18, 0.22);
      return [s, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, o, s, r) {
      const i = ae(e, "lowpass", Math.min(n * (6 + 6 * s), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, Mt(r, 0.12)), i.connect(t);
      const a = O(e, "sawtooth", n), c = O(e, "triangle", n, 4);
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
      const s = ae(e, "lowpass", Math.min(n * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(n * 4, 4e3), o + 0.02, 0.2), s.connect(t);
      const r = O(e, "square", n), i = O(e, "sawtooth", n, 6);
      r.connect(s), i.connect(s);
      const a = We(e, [r, i], o, 5.6, 10, 0.3);
      return [r, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = O(e, "sine", n), r = O(e, "triangle", n), i = we(e, 0.5);
      s.connect(t), r.connect(i).connect(t);
      const a = O(e, "sawtooth", n), c = ae(e, "lowpass", Math.min(n * 6, 2500), 1);
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
      const i = O(e, "sine", n), a = O(e, "sine", n * 3.5), c = e.createGain();
      return c.gain.setValueAtTime(n * (1 + 1.5 * s), o), c.gain.setTargetAtTime(0, o, 0.05), a.connect(c).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function Oo(e, t) {
  return e.connect(t), e;
}
function sd(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = Po[n] ?? Po.plain, c = Xa(o), l = a.sustain === 0 ? Mt(o, a.decay) : a.decay, d = i * Ja[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), f = e.createGain();
  f.gain.setValueAtTime(0, s), f.gain.linearRampToValueAtTime(d, s + a.attack), f.gain.setTargetAtTime(d * a.sustain, s + a.attack, l), f.connect(t);
  const h = a.build(e, f, c, s, r, o);
  for (const P of h) P.start(s);
  let g = !1, x = !1;
  const M = (P) => {
    for (const V of h)
      try {
        V.stop(P);
      } catch {
      }
  };
  return h[0].onended = () => {
    x = !0, f.disconnect();
  }, a.sustain === 0 && M(s + a.attack + l * 7), {
    release(P) {
      if (g || x) return;
      g = !0;
      const V = Math.max(P, s + a.attack);
      f.gain.setTargetAtTime(0, V, a.release), M(V + a.release * 7);
    },
    stop() {
      if (x) return;
      x = !0, g = !0;
      const P = e.currentTime;
      try {
        f.gain.cancelScheduledValues(P), f.gain.setValueAtTime(0, P);
      } catch {
      }
      M(P), f.disconnect();
    }
  };
}
function Za(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function ze(e, t) {
  return `${e}:${t}`;
}
function ec(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { block: Number(t[1]), line: Number(t[2]) } : null;
}
const tc = 512;
function Ft(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length === 3 || n.length < 2 || n.length > 4 + tc || !n.every((a) => Number.isInteger(a) && a >= 0)) continue;
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
function nc(e, t) {
  return e.length === t.length && e.every((n, o) => n.length === t[o].length && n.every((s, r) => s === t[o][r]));
}
function Rs(e, t) {
  return e.parts.find((n) => n.block === t);
}
function Bs(e, t) {
  return e.parts.find((n) => t >= n.start && t < n.end);
}
function jt(e) {
  return e.syllables.length > 0 || e.pinned;
}
function Ds(e, t, n) {
  let o = 0, s = n;
  for (const r of e.parts) {
    const i = r.lines.filter(jt);
    !i.length || r.block === t || (r.block < t ? o = Math.max(o, ...i.map((a) => Math.max(a.end, a.start + 1))) : s = Math.min(s, ...i.map((a) => a.start)));
  }
  return [o, Math.max(s, o + 1)];
}
function oc(e, t, n, o, s) {
  const r = Rs(e, t), [i, a] = o, c = new Map((r?.lines ?? []).map((f) => [f.line, f])), l = [];
  let d = r ? Math.max(r.start, i) : i;
  return n.forEach((f, h) => {
    const g = c.get(h);
    if (g && jt(g)) {
      const x = Math.min(Math.max(g.start, i), a - 1), M = Math.min(Math.max(g.end, x + 1), a);
      l.push({ id: String(h), text: f, start: x, end: M }), d = M;
    } else {
      const x = Math.min(Math.max(d, i), a);
      l.push({ id: String(h), text: f, start: x, end: x });
    }
  }), l;
}
function sc(e, t) {
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
function Gn(e) {
  return (e?.parts ?? []).flatMap(
    (t) => t.lines.filter((n) => jt(n) && n.end > n.start).map((n) => ({ key: ze(n.block, n.line), block: n.block, line: n.line, start: n.start, end: n.end, text: n.text }))
  ).sort((t, n) => t.start - n.start || t.block - n.block || t.line - n.line);
}
function rc(e, t, n = /* @__PURE__ */ new Set()) {
  for (const o of t) {
    const s = e.find((r) => !n.has(r.key) && r.start < o.end && o.start < r.end);
    if (s) return s;
  }
  return null;
}
function ic(e, t, n, o = 1) {
  const s = e.parts.flatMap((u) => u.lines.map((k) => ({ ...k, key: ze(k.block, k.line) }))), r = t.kind === "move" ? new Set(t.keys) : /* @__PURE__ */ new Set([t.key]), i = s.filter((u) => r.has(u.key) && u.text).map((u) => ({ key: u.key, block: u.block, start: u.start, end: u.end > u.start ? u.end : Math.min(n, u.start + Math.max(1, o)) })), a = Gn(e).filter((u) => !r.has(u.key)), c = { moves: [], free: !0, stoppedAt: null };
  if (!i.length) return c;
  const l = (u) => {
    let k = 0, L = n;
    for (const b of a)
      b.block < u ? k = Math.max(k, b.end) : b.block > u && (L = Math.min(L, b.start));
    return [k, Math.max(k, L)];
  };
  if (t.kind !== "move") {
    const u = i[0], [k, L] = l(u.block);
    if (t.kind === "end") {
      const E = a.filter((B) => B.start >= u.start).sort((B, j) => B.start - j.start)[0], S = Math.min(L, E ? E.start : n), N = u.end + t.delta, C = Math.max(u.start + 1, Math.min(N, S));
      return { moves: [{ key: u.key, start: u.start, end: C }], free: C === N, stoppedAt: N > S && E && E.start === S ? E : null };
    }
    const b = a.filter((E) => E.end <= u.end).sort((E, S) => S.end - E.end)[0], v = Math.max(k, b ? b.end : 0), _ = u.start + t.delta, y = Math.min(u.end - 1, Math.max(_, v));
    return {
      moves: [{ key: u.key, start: y, end: u.end }],
      free: y === _,
      stoppedAt: _ < v && b && b.end === v ? b : null
    };
  }
  let d = -1 / 0, f = 1 / 0;
  for (const u of i) {
    const [k, L] = l(u.block);
    d = Math.max(d, k - u.start), f = Math.min(f, L - u.end);
  }
  const h = a.flatMap((u) => i.map((k) => ({ other: u, from: u.start - k.end, to: u.end - k.start }))), g = (u) => u >= d && u <= f && !h.some((k) => u > k.from && u < k.to), x = t.delta, M = [x, 0, d, f, ...h.flatMap((u) => [u.from, u.to])].filter((u) => Number.isFinite(u) && g(u));
  if (!M.length) return { moves: [], free: !1, stoppedAt: null };
  const P = M.reduce((u, k) => {
    const L = Math.abs(k - x) - Math.abs(u - x);
    return L < 0 || L === 0 && Math.abs(k) < Math.abs(u) ? k : u;
  }), V = P === x ? null : h.find((u) => x > u.from && x < u.to)?.other ?? null;
  return {
    moves: P ? i.map((u) => ({ key: u.key, start: u.start + P, end: u.end + P })) : [],
    free: P === x,
    stoppedAt: V
  };
}
function ac(e, t, n, o, s = 4 * Math.max(1, n)) {
  const r = Bs(e, Math.min(Math.max(0, t), Math.max(0, o - 1)));
  if (!r) return null;
  const i = Gn(e);
  if (i.some((M) => t >= M.start && t < M.end)) return null;
  const a = [
    Math.max(0, ...i.filter((M) => M.end <= t).map((M) => M.end)),
    Math.min(o, ...i.filter((M) => M.start > t).map((M) => M.start))
  ], [, c] = Ds(e, r.block, o), l = Math.max(1, n);
  let d = Math.max(a[0], Math.floor(t / l) * l);
  const f = r.phrases.find(([M, P]) => t >= M && t < P);
  f && !i.some((M) => M.start < f[1] && M.end > f[0]) && (d = Math.max(a[0], f[0]));
  const h = r.phrases.find(([M, P]) => P > d && M <= d) ?? r.phrases.find(([M]) => M > d), g = Math.min(h ? h[1] : d + Math.max(1, s), a[1], c, o);
  if (g <= d) return null;
  const x = r.lines.length ? Math.max(...r.lines.map((M) => M.line)) + 1 : 0;
  return { block: r.block, line: x, start: d, end: g };
}
function cc(e, t, n, o = !1) {
  const s = e.filter((l) => l.length >= 4 && !n.has(l[2])), r = new Set(s.map((l) => ze(l[2], l[3]))), i = o || e.some((l) => l.length === 2) ? t.parts.flatMap(
    (l) => l.lines.filter((d) => (o ? jt(d) : d.pinned) && d.end > d.start && !n.has(d.block) && !r.has(ze(d.block, d.line))).map((d) => [d.start, d.end, d.block, d.line])
  ) : [], a = new Map(e.filter((l) => l.length > 4).map((l) => [`${l[0]}:${l[1]}:${l[2]}`, l.slice(4)])), c = [...n].flatMap(
    ([l, d]) => d.map((f, h) => [f.start, f.end, l, h, ...a.get(`${f.start}:${f.end}:${l}`) ?? []])
  );
  return Ft([...s, ...i, ...c]);
}
function lc(e, t) {
  const n = [];
  for (const o of e) {
    const [s, r] = o;
    for (const [i, a, c] of t) {
      if (s < i || s >= a) continue;
      const l = c - i, d = o.slice(4), f = d.every((g) => g >= i && g < a) ? d.map((g) => g + l) : [], h = o.length >= 4 ? [s + l, Math.min(r, a) + l, o[2], o[3], ...f] : [s + l, Math.min(r, a) + l];
      n.push(h);
    }
  }
  return Ft(n);
}
function uc(e, t, n, o, s) {
  const r = [];
  for (const i of e) {
    if (i.length < 4) {
      r.push(i);
      continue;
    }
    const a = n[i[2]], c = o.map((d, f) => ({ index: d, block: f })).filter(({ index: d }) => a !== void 0 && t[d] === a);
    if (!c.length) continue;
    const l = c.reduce((d, f) => Math.abs(s[f.index] - i[0]) < Math.abs(s[d.index] - i[0]) ? f : d);
    r.push([i[0], i[1], l.block, i[3], ...i.slice(4)]);
  }
  return Ft(r);
}
function dc(e) {
  const t = [...e].sort((o, s) => o.start - s.start), n = t[0]?.start ?? 0;
  return t.map((o) => ({ text: o.text, offset: o.start - n, length: Math.max(1, o.end - o.start) }));
}
const fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: dc,
  editRange: Ds,
  fitLyricGesture: ic,
  followSpans: uc,
  laneLines: Gn,
  lineKey: ze,
  newLineAt: ac,
  overlap: rc,
  parseLineKey: ec,
  parseShift: Za,
  parseSpans: Ft,
  partAt: Bs,
  partOf: Rs,
  placedLines: oc,
  remapSpans: lc,
  sameSpans: nc,
  settle: sc,
  withBlockSpans: cc
}, Symbol.toStringTag, { value: "Module" })), qs = 18, pc = 24, It = qs + pc, hc = 22, mc = 34, Ze = 36, gc = 6, rd = 3, wc = 12, yc = 6, bc = 28, vc = 21, xc = 108;
function kc(e) {
  return [
    ...e.tracks.vocal.map((t) => ({ ...t, track: "vocal" })),
    ...e.tracks.ins.map((t) => ({ ...t, track: "ins" }))
  ];
}
function Sc(e) {
  const t = Number(e.unit.split("/")[1]);
  return Number.isFinite(t) && t > 0 ? t : 32;
}
function Mc(e, t) {
  return t === "auto" ? Math.max(1, e.grid.snap) : Math.max(1, Math.round(Sc(e) / t));
}
function _c(e, t = 4, n = 24) {
  let o = e.length ? Math.min(...e.map((r) => r.pitch)) - t : 60, s = e.length ? Math.max(...e.map((r) => r.pitch)) + t : 79;
  if (s - o + 1 < n) {
    const r = n - (s - o + 1);
    o -= Math.floor(r / 2), s += Math.ceil(r / 2);
  }
  return o < 0 && ([o, s] = [0, Math.min(127, s - o)]), s > 127 && ([o, s] = [Math.max(0, o - (s - 127)), 127]), [o, s];
}
function Ec(e) {
  const t = e.map((s) => s.pitch), n = Math.max(0, Math.min(vc, ...t.map((s) => s - 2))), o = Math.min(127, Math.max(xc, ...t.map((s) => s + 2)));
  return [n, o];
}
function id(e, t) {
  const n = It + (t.lyrics ? hc : 0), o = n + (t.source ? mc : 0), s = kc(e), [r, i] = Ec(s), a = i - r + 1, c = t.pxPerQuarter / Math.max(e.grid.units_per_quarter, 1e-9), l = Math.max(yc, Math.min(bc, Math.round(t.rowHeight ?? wc))), d = Mc(e, t.snap), f = Math.max(1, Math.round(e.grid.units_per_quarter));
  return {
    pxPerUnit: c,
    rowHeight: l,
    high: i,
    low: r,
    focus: _c(s),
    total: e.total,
    snap: d,
    drawLength: Math.max(d, Math.round(f / d) * d),
    width: Ze + e.total * c + 40,
    height: o + a * l,
    top: o,
    sourceTop: t.source ? n : null
  };
}
const Vn = (e, t) => Ze + e * t.pxPerUnit, $c = (e, t) => (e - Ze) / t.pxPerUnit, Rt = (e, t) => t.top + (t.high - e) * t.rowHeight;
function Ac(e, t, n, o) {
  const s = (Rt(o, e) + Rt(n, e) + e.rowHeight) / 2, r = Math.max(0, t - e.top), i = s - e.top - r / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, e.height - t), i)));
}
function ad(e, t, n, o) {
  const s = Rt(o, e);
  return s >= t + e.top && s + e.rowHeight <= t + n ? null : Ac(e, n, o, o);
}
function Io(e, t) {
  const n = t.high - Math.floor((e - t.top) / t.rowHeight);
  return Math.max(t.low, Math.min(t.high, n));
}
const Lc = (e, t) => Math.floor(e / t) * t, ft = (e, t) => Math.round(e / t) * t;
function Tn(e, t) {
  return {
    x: Vn(e.onset, t),
    y: Rt(e.pitch, t) + 0.5,
    width: Math.max(2, e.duration * t.pxPerUnit - 1),
    height: Math.max(2, t.rowHeight - 1)
  };
}
function zs(e, t, n) {
  const o = e.name.length * 7 + 10, s = t ? (t.onset - e.onset) * n.pxPerUnit - 2 : o;
  return Math.max(12, Math.min(o, s));
}
const cd = (e) => [1, 3, 6, 8, 10].includes((e % 12 + 12) % 12);
function ld(e) {
  return `C${Math.floor(e / 12) - 1}`;
}
function ud(e) {
  const t = [];
  for (const n of e.measures) {
    t.push({ unit: n.onset, kind: "bar", bar: n.n });
    const o = Number(n.meter.split("/")[0]) || 1, s = n.length / o;
    for (let r = 1; r < o; r++) t.push({ unit: n.onset + r * s, kind: "beat" });
  }
  return t;
}
function dd(e, t, n, o, s, r, i = 0, a = 0) {
  const c = Math.max(0, Math.min(s.total, $c(e, s))), l = t - i;
  if (l < qs) return { area: "header", unit: c };
  if (s.sourceTop !== null && l >= s.sourceTop && l < s.top) return { area: "source", unit: c };
  if (l >= It && l < s.top) return { area: "lyrics", unit: c };
  if (l < It) {
    for (let h = o.length - 1; h >= 0; h--) {
      const g = o[h], x = Vn(g.onset, s);
      if (e >= x && e <= x + zs(g, o[h + 1], s)) return { area: "chord", chord: g };
    }
    return { area: "lane", unit: c };
  }
  if (e - a < Ze) return { area: "keys", pitch: Io(t, s) };
  const d = n.filter((h) => {
    const g = Tn(h, s);
    return e >= g.x && e <= g.x + g.width && t >= g.y - 0.5 && t <= g.y + g.height + 0.5;
  }), f = d.find((h) => h.track === r) ?? d[0];
  if (f) {
    const h = Tn(f, s), g = e >= h.x + h.width - Math.min(gc, h.width / 3) ? "end" : "body";
    return { area: "note", note: f, edge: g };
  }
  return { area: "grid", unit: c, pitch: Io(t, s) };
}
function Hs(e, t, n) {
  return e.y0 < (e.from?.scrollTop ?? n) + t || e.y1 < n + t;
}
function Tc(e, t, n = 0, o = 0) {
  const s = e.from?.scrollTop ?? n, r = e.from?.scrollLeft ?? o, i = (h, g) => Math.max(g + Ze, Math.min(t.width, h)), a = (h, g) => Math.max(g + t.top, Math.min(t.height, h)), c = [i(e.x0, r), i(e.x1, o)], l = [a(e.y0, s), a(e.y1, n)], d = Math.min(...c), f = Math.min(...l);
  return { x: d, y: f, width: Math.max(...c) - d, height: Math.max(...l) - f };
}
function fd(e, t = 0, n = It) {
  return Hs(e, n, t);
}
function pd(e, t, n) {
  return t.width <= 0 || t.height <= 0 ? [] : e.filter((o) => {
    const s = Tn(o, n);
    return s.x < t.x + t.width && s.x + s.width > t.x && s.y < t.y + t.height && s.y + s.height > t.y;
  });
}
function hd(e, t, n, o = 0, s = 0) {
  if (!Hs(t, n.top, o)) return [];
  const r = Tc(t, n, o, s);
  return r.width <= 0 ? [] : e.filter((i, a) => {
    const c = Vn(i.onset, n);
    return c < r.x + r.width && c + zs(i, e[a + 1], n) > r.x;
  });
}
function md(e, t, n, o) {
  return { kind: "move", notes: e, anchor: t, fromUnit: n, fromPitch: o, delta: 0, semitones: 0 };
}
function gd(e, t = [], n = 1 / 0) {
  const o = t.filter((r) => r.track === e.track && r.onset > e.onset).map((r) => r.onset), s = Math.min(n, ...o);
  return { kind: "resize", note: e, end: e.onset + e.duration, overwrite: !1, limit: s };
}
function wd(e, t, n, o) {
  const s = Math.max(0, Math.min(Lc(t, o.snap), o.total - 1));
  return { kind: "draw", track: e, start: s, end: Math.min(o.total, s + o.snap), pitch: n };
}
function yd(e, t = e.onset) {
  return { kind: "chord", chord: e, fromUnit: t, to: e.onset };
}
const Ge = (e, t, n) => Math.max(t, Math.min(n, e));
function bd(e, t, n, o, s) {
  switch (e.kind) {
    case "move": {
      const r = e.anchor.onset + (t - e.fromUnit), i = Math.min(...e.notes.map((h) => h.onset)), a = Math.max(...e.notes.map((h) => h.onset + h.duration)), c = Ge(ft(r, o.snap) - e.anchor.onset, -i, o.total - a), l = Math.min(...e.notes.map((h) => h.pitch)), d = Math.max(...e.notes.map((h) => h.pitch)), f = Ge(n - e.fromPitch, -l, 127 - d);
      return { ...e, delta: c, semitones: f, copy: s.alt };
    }
    case "resize": {
      const r = Math.min(o.snap, o.total - e.note.onset), i = s.alt ? o.total : Math.max(e.note.onset + e.note.duration, Math.min(o.total, e.limit)), a = Ge(ft(t, o.snap), e.note.onset + Math.max(1, r), i);
      return { ...e, end: Math.min(a, i), overwrite: s.alt };
    }
    case "draw": {
      const r = t <= e.start ? e.start + o.snap : Math.max(e.start + o.snap, ft(t, o.snap));
      return { ...e, end: Math.min(o.total, r) };
    }
    case "chord":
      return { ...e, to: Ge(ft(e.chord.onset + t - e.fromUnit, o.snap), 0, o.total - 1) };
  }
}
function vd(e, t) {
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
function xd(e) {
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
function kd(e) {
  return e ? e.kind === "move" ? e.copy ? /* @__PURE__ */ new Set() : new Set(e.notes.map((t) => t.id)) : e.kind === "resize" ? /* @__PURE__ */ new Set([e.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Sd(e, t, n, o, s, r) {
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
        const h = n[0], g = h.duration + a * s.snap;
        return g < 1 || h.onset + g > s.total ? null : { op: "resize_note", id: h.id, duration: g, mode: r };
      }
      const c = t.shift ? s.drawLength : s.snap, l = Math.min(...n.map((h) => h.onset)), d = Math.max(...n.map((h) => h.onset + h.duration)), f = Ge(a * c, -l, s.total - d);
      return f ? { op: "move_notes", ids: i, delta: f } : null;
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
const Nc = /^(vocal|ins):\d+$/;
function Cc(e, t) {
  const n = e?.model?.tracks, o = /* @__PURE__ */ new Set();
  if (!n) return o;
  const s = /* @__PURE__ */ new Map();
  for (const r of [...n.vocal, ...n.ins]) for (const i of r.segments) s.set(i, r.id);
  for (const r of t)
    if (Nc.test(r)) o.add(r);
    else {
      const i = s.get(r);
      i && o.add(i);
    }
  return o;
}
function Md(e) {
  return new Set(e.filter((t) => t.startsWith("chord:")));
}
function _d(e, t = []) {
  return [...e.flatMap((n) => n.segments.length ? n.segments : [n.id]), ...t.map((n) => n.id)];
}
const Pc = ["auto", "omit", "ins"];
function Fs(e) {
  return e.wanted ? e.wanted - (new Set(e.syllables.map((t) => t.onset)).size + e.holds.length) : 0;
}
function Ed(e) {
  return (e?.parts ?? []).flatMap((t) => t.lines.filter((n) => Fs(n) !== 0));
}
function $d(e) {
  return e > 0 ? `+${e}` : `−${-e}`;
}
function Ad(e) {
  const t = Fs(e);
  if (!t) return "";
  const n = e.wanted === 1 ? "1 syllable" : `${e.wanted} syllables`, o = e.wanted - t;
  return `${n} on ${o === 1 ? "1 note" : `${o} notes`}`;
}
function Ld(e, t, n) {
  const o = [], s = Cc(e ?? null, t);
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
const Oc = { vocal: !1, ins: !1 }, Ic = { vocal: "Vocal", ins: "Instrument" }, Rc = { Vocal: "vocal", Ins: "ins" };
function Bc(e) {
  const t = typeof e == "object" && e !== null ? e : {};
  return { vocal: t.vocal === !0, ins: t.ins === !0 };
}
const Ve = (e) => `The ${Ic[e]} track is locked: unlock it to edit it.`;
function Un(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (!t.vocal && !t.ins) return n;
  for (const o of ["vocal", "ins"])
    if (t[o])
      for (const s of e?.model?.tracks[o] ?? []) {
        n.add(s.id);
        for (const r of s.segments) n.add(r);
      }
  for (const o of e?.elements ?? []) {
    const s = Rc[o.voice];
    s && t[s] && n.add(o.id);
  }
  return n;
}
function Dc(e, t, n) {
  const o = Un(e, n);
  return o.size ? t.filter((s) => !o.has(s)) : [...t];
}
function _t(e) {
  const t = String(e ?? "").toLowerCase();
  return t === "vocal" ? "vocal" : t === "ins" ? "ins" : null;
}
const qc = /* @__PURE__ */ new Set(["delete", "delete_close_gap", "move_notes", "set_note_pitch", "join_notes", "quantize", "set_pitch", "shift_pitch", "note_to_rest"]), zc = /* @__PURE__ */ new Set(["resize_note", "split_note", "set_duration", "rest_to_note"]), Hc = /* @__PURE__ */ new Set(["insert_note", "fill_rest", "place_notes", "shift_track"]);
function ve(e) {
  return { operation: e, note: null };
}
function Td(e, t, n) {
  if (!n.vocal && !n.ins) return ve(e);
  const o = e.op, s = (l) => ({ operation: null, note: Ve(l) }), r = n.vocal ? "vocal" : "ins";
  if (Hc.has(o)) {
    const l = _t(e.track);
    if (l && n[l]) return s(l);
  }
  if (o === "silence_voice") {
    const l = _t(e.voice ?? "Vocal");
    return l && n[l] ? s(l) : ve(e);
  }
  if (o === "move_vocal_to_ins") return s(r);
  if (o === "fit_notes")
    return n.vocal ? s("vocal") : !n.ins || e.surplus === "omit" ? ve(e) : { operation: { ...e, surplus: "omit" }, note: `${Ve("ins")} Surplus notes were left out instead of moved there.` };
  if (o === "paste") return Fc(e, n);
  if (zc.has(o)) {
    const l = String(e.id ?? (Array.isArray(e.ids) ? e.ids[0] : ""));
    return Un(t, n).has(l) ? s(Ro(l, t, n)) : ve(e);
  }
  if (!qc.has(o) || !Array.isArray(e.ids)) return ve(e);
  const i = _t(e.track);
  if (o === "move_notes" && i && n[i]) return s(i);
  const a = e.ids, c = Dc(t, a, n);
  return c.length === a.length ? ve(e) : c.length ? { operation: { ...e, ids: c }, note: `${Ve(r)} Its selected notes stayed as they are.` } : s(Ro(a[0], t, n));
}
function Ro(e, t, n) {
  return n.vocal && Un(t, { vocal: !0, ins: !1 }).has(e) ? "vocal" : n.ins ? "ins" : "vocal";
}
function Fc(e, t) {
  if (e.mode === "insert") return ve(e);
  const n = Array.isArray(e.notes) ? e.notes : [], o = (l) => {
    const d = _t(l);
    return !d || !t[d];
  }, s = n.filter((l) => o(l.track)), r = Array.isArray(e.tracks) ? e.tracks.filter(o) : e.tracks, i = Array.isArray(e.chords) ? e.chords.length : 0;
  if (!(s.length !== n.length || Array.isArray(e.tracks) && r.length !== e.tracks.length)) return ve(e);
  const c = t.vocal ? "vocal" : "ins";
  return !s.length && !i ? { operation: null, note: Ve(c) } : { operation: { ...e, notes: s, tracks: r }, note: `${Ve(c)} Only the other notes were pasted.` };
}
const Nd = 12, pt = { width: 640, height: 420 }, jc = { width: 1280, height: 900 }, js = 120, Ws = 720, Gs = 0.25, Vs = 0.85, Us = 160, Ys = 460, Xs = "plenio.sheet.dialog";
function Ke(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function Wc(e, t) {
  const n = Ke(e.width, pt.width, Math.max(pt.width, t.width - 16)), o = Ke(e.height, pt.height, Math.max(pt.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function Cd(e, t) {
  return Math.round(Ke(e + t, js, Ws));
}
function Pd(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? Bo(e) : Bo(e + t / n);
}
function Bo(e) {
  return Math.round(Ke(e, Gs, Vs) * 1e3) / 1e3;
}
function Od(e, t) {
  return Math.round(Ke(e + t, Us, Ys));
}
function Id(e, t, n) {
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
function Gc() {
  return { ...jc, maximized: !1 };
}
function Rd(e = Ks()) {
  const t = Gc();
  try {
    const n = e?.getItem(Xs);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...Wc(
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
function Bd(e, t = Ks()) {
  try {
    t?.setItem(Xs, JSON.stringify(e));
  } catch {
  }
}
function Ks() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Qs(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function Js() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function Vc(e) {
  const t = Js(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const Zs = "plenio.score-editor.prefs";
function Uc() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    locks: { ...Oc },
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
    sounds: Os(),
    paper: "a4",
    notationSize: "standard",
    record: Js(),
    midiInput: "all"
  };
}
function Yc(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function Dd(e = er()) {
  const t = Uc();
  try {
    const n = e?.getItem(Zs);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...Yc(o),
      zoom: typeof o.zoom == "number" && o.zoom >= 0.6 && o.zoom <= 1.8 ? o.zoom : t.zoom,
      locks: Bc(o.locks),
      fitSurplus: Pc.includes(o.fitSurplus) ? o.fitSurplus : t.fitSurplus,
      voices: {
        Vocal: o.voices?.Vocal !== !1,
        Ins: o.voices?.Ins !== !1,
        chords: o.voices?.chords !== !1,
        guide: o.voices?.guide !== !1
      },
      speed: typeof o.speed == "number" && o.speed >= 0.25 && o.speed <= 2 ? o.speed : t.speed,
      roll: o.roll !== !1,
      rollZoom: typeof o.rollZoom == "number" && o.rollZoom >= 12 && o.rollZoom <= 240 ? o.rollZoom : t.rollZoom,
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= js && o.rollHeight <= Ws ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= Gs && o.notationShare <= Vs ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= Us && o.sideWidth <= Ys ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: Qa(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: Qs(o.notationSize) ? o.notationSize : t.notationSize,
      record: Vc(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function qd(e, t = er()) {
  try {
    t?.setItem(Zs, JSON.stringify(e));
  } catch {
  }
}
function er() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function tr(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: Qs(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function Xc(e) {
  return tr(e?.plenio_notation);
}
async function Kc(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return tr(n.jobs);
}
async function Qc(e, t) {
  const n = await t.draw(e.display_abc, e.title, e.paper, e.size), o = new ArrayBuffer(n.length);
  new Uint8Array(o).set(n);
  const s = await t.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(e.token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: new Blob([o], { type: "application/pdf" })
  }), r = await s.json().catch(() => ({}));
  if (!s.ok)
    throw new Q(r.error?.message ?? `Saving the sheet music failed (${s.status})`, r.error?.hint ?? null);
  return { file: r.file ?? e.file, bytes: r.bytes ?? n.length };
}
let Do = Promise.resolve();
function Jc(e) {
  const t = Do.then(e, e);
  return Do = t.catch(() => {
  }), t;
}
class Zc {
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
        Jc(() => Qc(s, this.host)).then(
          (r) => this.report({ job: s, saved: r }),
          (r) => {
            const i = r instanceof Q && /can no longer be saved/.test(r.message);
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
      t = await Kc(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const nr = "PlenioSeed", el = 2 ** 32, or = "plenio_part", Et = "plenio_seed_hint", qo = 56, zo = {
  fresh: { color: "#7a5418", bgcolor: "#3b2a10" },
  keep: { color: "#1f4e6e", bgcolor: "#14304a" }
};
function tl(e = Math.random) {
  return Math.floor(e() * el);
}
function nl(e, t) {
  const n = t.trim() || "result";
  return e ? `🔒 Every run uses this seed again: the same ${n}.` : `🎲 Every run draws a new seed: a new ${n}. Liked it? Switch to 🔒.`;
}
function Re(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function sr(e) {
  const t = e.inputs?.find((n) => n.name === "seed");
  return t?.link !== void 0 && t?.link !== null;
}
function Bt(e) {
  const t = !!Re(e, "keep_seed")?.value, n = e, o = t ? zo.keep : zo.fresh;
  n.color = o.color, n.bgcolor = o.bgcolor;
  const s = Re(e, Et)?.element;
  s && (s.textContent = nl(t, String(e.properties?.[or] ?? ""))), e.setDirtyCanvas?.(!0, !0);
}
function Ho(e, t = Math.random) {
  const n = Re(e, "seed");
  !n || sr(e) || (n.value = tl(t), n.callback?.(n.value), e.setDirtyCanvas?.(!0, !0));
}
function ol(e, t = Math.random) {
  const n = Re(e, "seed"), o = Re(e, "keep_seed");
  if (!n || !o) return;
  n.beforeQueued = () => {
    o.value || Ho(e, t);
  }, o.callback = Y(o.callback, () => Bt(e));
  const r = e.addWidget?.("button", "🎲 new seed now", null, () => Ho(e, t), { serialize: !1 });
  if (r && (r.serialize = !1), !Re(e, Et)) {
    const i = document.createElement("div");
    i.className = "plenio-seed-hint";
    const a = e.addDOMWidget(Et, Et, i, {
      serialize: !1,
      getValue: () => "",
      setValue: () => {
      },
      // two lines of text and the frontend's margin of 10 px above and below a DOM widget
      getMinHeight: () => qo,
      getMaxHeight: () => qo
    });
    a.serialize = !1;
  }
  Bt(e);
}
function sl(e) {
  const t = e.prototype, n = t.onNodeCreated;
  t.onNodeCreated = function() {
    n?.call(this), ol(this);
  }, e.prototype.onConfigure = Y(e.prototype.onConfigure, function() {
    Bt(this);
  });
}
const zd = ["computer", "wants", "plan", "downloads", "test", "go"], Hd = {
  computer: "This computer",
  wants: "What do you want?",
  plan: "Your plan",
  downloads: "Downloading",
  test: "Test song",
  go: "Go"
}, rl = "1 · YuE2 · Song", il = [
  { id: "cover-art", label: "Cover art", components: ["flux2-klein", "flux2-text-encoder", "flux2-vae"] },
  { id: "hq", label: "HQ mastering", components: ["audio-sr"] },
  { id: "stems", label: "Stems", components: ["stems"] }
];
function gn(e) {
  return e > 0 ? e >= 1e9 ? `${(e / 1e9).toFixed(1)} GB` : `${Math.round(e / 1e6)} MB` : "0 MB";
}
function al(e) {
  if (e === null || !Number.isFinite(e)) return "";
  const t = Math.max(0, Math.round(e));
  return t >= 3600 ? `${Math.floor(t / 3600)} h ${Math.round(t % 3600 / 60)} min` : t >= 60 ? `${Math.floor(t / 60)} min ${t % 60} s` : `${t} s`;
}
function cl(e) {
  return e.templates.length ? e.templates : [rl];
}
function Fd(e, t, n, o = {}) {
  const s = new Set(il.filter((i) => n.includes(i.id)).flatMap((i) => i.components)), r = /* @__PURE__ */ new Map();
  for (const i of e.templates)
    if (t.includes(i.template))
      for (const a of i.picks) {
        if (a.optional && !s.has(a.component)) continue;
        const c = r.get(a.component);
        if (c) {
          c.templates.includes(i.template) || c.templates.push(i.template), c.optional = c.optional && a.optional;
          continue;
        }
        const l = o[a.component], d = a.variants.find((f) => f.id === l) ?? a.variants.find((f) => f.id === a.variant) ?? null;
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
function jd(e) {
  const t = e.filter((n) => !n.variant.installed);
  return {
    files: t.length,
    bytes: t.reduce((n, o) => n + o.variant.bytes, 0),
    nonCommercial: e.filter((n) => n.variant.non_commercial).map((n) => n.title)
  };
}
const ll = /* @__PURE__ */ new Set(["gated", "pending", "token"]);
function Wd(e, t) {
  if (t?.state === "installed" || e && !t)
    return { status: "Installed ✓", progress: null, detail: "verified", actions: [], tone: "ok" };
  if (!t || t.state === "cancelled")
    return { status: "Not installed", progress: null, detail: "", actions: ["download"], tone: "idle" };
  const n = t.bytes > 0 ? Math.min(1, t.done / t.bytes) : 0, o = `${gn(t.done)} of ${gn(t.bytes)}`;
  switch (t.state) {
    case "queued":
      return { status: "Waiting", progress: n, detail: o, actions: ["cancel"], tone: "busy" };
    case "downloading": {
      const s = t.speed > 0 ? ` · ${gn(t.speed)}/s` : "", r = t.seconds_left !== null ? ` · ${al(t.seconds_left)} left` : "";
      return { status: "Downloading", progress: n, detail: `${o}${s}${r}`, actions: ["pause", "cancel"], tone: "busy" };
    }
    case "paused":
      return { status: "Paused", progress: n, detail: o, actions: ["resume", "cancel"], tone: "idle" };
    case "verifying":
      return { status: "Checking the file", progress: 1, detail: "size and SHA-256", actions: [], tone: "busy" };
    case "blocked": {
      const s = t.refusal, r = s && ll.has(s.kind) ? ["access", "retry"] : ["retry"];
      return { status: "Needs you", progress: n || null, detail: Fo(s), actions: r, tone: "warn" };
    }
    case "failed":
      return { status: "Failed", progress: null, detail: Fo(t.refusal), actions: ["retry"], tone: "error" };
    default:
      return { status: t.state, progress: n, detail: o, actions: [], tone: "idle" };
  }
}
function Fo(e) {
  return e ? e.fix ? `${e.message} ${e.fix}` : e.message : "";
}
function ul(e, t, n) {
  if (e.opened_for === t) return !1;
  const o = cl(e);
  return n.templates.some((s) => o.includes(s.template) && !s.ready);
}
function Gd(e, t) {
  return e.done ? "go" : (e.step === "plan" || e.step === "downloads") && t.length && t.every((n) => n.variant.installed) ? "test" : e.step;
}
function Vd(e) {
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
const wn = "plenio-setup", jo = "Plenio.OpenSetup", dl = "plenio.download";
async function fl(e, t) {
  const n = await e.fetchApi("/workflow_templates");
  if (!n.ok) return null;
  const o = await n.json();
  for (const [s, r] of Object.entries(o))
    if (r.includes(t)) return `/workflow_templates/${encodeURIComponent(s)}/${encodeURIComponent(t)}.json`;
  return null;
}
async function pl(e, t) {
  const n = await fl(e.fetcher, t);
  if (!n) throw new Error(`ComfyUI does not list the template ${t}.`);
  const o = await e.fetcher.fetchApi(n);
  if (!o.ok) throw new Error(`The template ${t} could not be read (${o.status}).`);
  await e.app.loadGraphData?.(await o.json(), !0, !0, t);
}
async function hl(e) {
  const [t, n] = await Promise.all([
    e.fetchApi("/plenio/setup/state"),
    e.fetchApi("/plenio/setup/plan")
  ]);
  if (!t.ok || !n.ok) return !1;
  const { state: o, version: s } = await t.json(), r = await n.json();
  return ul(o, s, r) ? (await e.fetchApi("/plenio/setup/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opened_for: s })
  }), !0) : !1;
}
function ml(e) {
  let t = null, n = null;
  const o = /* @__PURE__ */ new Set();
  e.fetcher.addEventListener(dl, (a) => {
    for (const c of o) c(a.detail);
  });
  const s = {
    fetcher: e.fetcher,
    onDownloads: (a) => (o.add(a), () => o.delete(a)),
    openTemplate: (a) => {
      pl(e, a).catch(
        (c) => e.app.extensionManager?.toast?.add({
          severity: "error",
          summary: "Plenio Setup",
          detail: String(c instanceof Error ? c.message : c),
          life: 12e3
        })
      );
    },
    openPlayer: e.openPlayer
  }, r = e.app.extensionManager;
  r?.registerSidebarTab?.({
    id: wn,
    icon: "pi pi-box",
    title: "Plenio",
    tooltip: "Plenio Setup: the model files for your card, downloads, your first song",
    type: "custom",
    iconBadge: () => e.lacksFiles() ? "•" : null,
    render: (a) => {
      import("./mount-DmiDZD4g.mjs").then(({ mountSetup: c }) => {
        t = c(a, s, n);
      });
    },
    destroy: () => {
      t?.unmount(), t = null;
    }
  });
  const i = (a = null) => {
    n = a, t?.focus(a), r?.sidebarTab?.activeSidebarTabId !== wn && r?.command?.execute(`Workspace.ToggleSidebarTab.${wn}`);
  };
  return hl(e.fetcher).then((a) => {
    a && i();
  }).catch((a) => console.warn("Plenio: Setup could not check the plan", a)), { open: i };
}
const rr = /* @__PURE__ */ new Set(["new song every run", "new cover every run"]), gl = /* @__PURE__ */ new Set(["one song, stop to review", "one cover, stop to review"]);
function wl(e, t) {
  return rr.has(e) ? !1 : gl.has(e) ? t.trim() !== "take" : null;
}
function yl(e, t) {
  let n = 0;
  for (const o of e) {
    if (o.type !== nr || sr(o)) continue;
    const s = wl(t, String(o.properties?.[or] ?? "")), r = o.widgets?.find((i) => i.name === "keep_seed");
    s === null || !r || !!r.value === s || (r.value = s, Bt(o), n++);
  }
  return n;
}
function bl(e, t) {
  const n = `${t} seed${t === 1 ? "" : "s"}`;
  return rr.has(e) ? { summary: `${n} now 🎲 new seed`, detail: `"${e}": every run draws all its seeds anew - a new song each time. Switch a seed to 🔒 to keep that part.` } : { summary: `${n} now 🔒 same seed`, detail: `"${e}": the song's draft, plan, arrangement and cover stay while you review it; the take seed still draws anew.` };
}
function vl(e, t) {
  const n = e.widgets?.find((o) => o.name === "mode");
  n && (n.callback = Y(n.callback, (o) => {
    const s = e.graph, r = String(o ?? n.value ?? ""), i = yl(s?.nodes ?? s?._nodes ?? [], r);
    if (i) {
      const a = bl(r, i);
      t(a.summary, a.detail);
    }
  }));
}
const xl = "PlenioSongSheet";
function et(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function ir(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function ar(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : ir(e, n);
}
function cr(e, t) {
  const n = ar(e, t);
  return n && (n.comfyClass ?? n.type) === xl && et(n) ? n : null;
}
function kl(e) {
  return cr(e, "context_lyrics");
}
function Sl(e) {
  return cr(e, "context_score");
}
function Ml(e, t, n) {
  const o = [], s = ar(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((c, l) => {
        const d = ir(i, l);
        d && o.push(d);
      });
    }
  }
  return !1;
}
function _l(e, t, n) {
  const o = kl(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(et(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: c, replans: Ml(o, e, "score") } };
}
function El(e, t, n) {
  const o = et(e);
  if (!o) return;
  const s = $e(o.value) ?? Ht();
  o.value = Ye(ys(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function $l(e, t, n) {
  const o = Sl(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(et(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: c } };
}
function Al(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Ll(e, t, n, o = null) {
  const s = et(e);
  if (!s) return null;
  const r = $e(s.value) ?? Ht(), i = ys(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = Ye(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await Er(o.fetcher, {
      sheet_state: i,
      upstream: xi(n),
      owned: n.owned,
      review: Al(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null,
      sparse: n.sparse ?? !1
    });
    if (!!a.findings.some((d) => d.severity === "error") || !a.fingerprint) return i;
    const l = vi(i, a.fingerprint);
    return s.value = Ye(l), e.setDirtyCanvas?.(!0, !0), l;
  } catch {
    return i;
  }
}
const Tl = {
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
function Nl(e) {
  return e.properties?.plenio_editor_layout === "daw" ? "daw" : (e.inputs ?? []).some((n) => n.name === "score" && n.link != null) ? "score" : "text";
}
const lr = "PLENIO_SHEET_STATE", Wo = 128;
let $t = null;
function Cl(e) {
  $t = e;
}
const Pl = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
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
    const u = Nl(e);
    if (u === l) return;
    l = u;
    const k = Tl[u];
    i.dataset.kind = u, i.title = `${k.name} - opens the Song Sheet editor (${k.what.toLowerCase()})`, i.querySelector(".icon").innerHTML = k.icon, i.querySelector(".name").textContent = k.name, i.querySelector(".what").textContent = k.what;
  }, f = () => {
    d();
    const u = Te(String(e.id)), k = Ln(e);
    r.textContent = yi($e(o)) + (u && k !== "approved" ? ` · ${u.status}` : ""), a.textContent = Oa(k), a.dataset.state = k ?? "";
    const L = c ? null : e.widgets?.find((b) => b.name === "review");
    if (L) {
      c = !0;
      const b = L.callback;
      L.callback = (v) => {
        b?.(v), f();
      };
    }
  }, h = e.addDOMWidget(t, lr, s, {
    getValue: () => o,
    setValue: (u) => {
      o = typeof u == "string" ? u : "", f();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => Wo,
    getMaxHeight: () => Wo
  });
  i.addEventListener("click", (u) => {
    u.stopPropagation(), g().catch((k) => {
      console.error("Plenio: the Song Sheet editor could not open", k), r.textContent = `The editor could not open: ${k instanceof Error ? k.message : String(k)}`;
    });
  });
  async function g() {
    const u = $e(o);
    u === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const k = Te(String(e.id)), b = (e.inputs ?? []).filter((W) => W.link != null).map((W) => W.name), v = u ?? { schema: "plenio.sheet_state/1", docs: {} }, _ = k?.owned ?? bs(b, v), y = String(e.widgets?.find((W) => W.name === "review")?.value ?? "continue"), E = y === "as the brief says" ? k?.review ?? "continue" : y, S = () => Hn(import.meta.url, Fn), { openSheetDialog: N } = await Ce(() => import("./open-DpFrigE4.mjs"), S), { parseGuide: C, serializeGuide: B } = await Ce(() => import("./tracks-ClAVjvds.mjs"), S), { parseShift: j, parseSpans: X } = await Ce(() => Promise.resolve().then(() => fc), S), { parseBarSources: H } = await Ce(() => import("./barSources-Cq3VGvmq.mjs"), S);
    if (!$t) throw new Error("Plenio: API not initialised");
    let Z = null;
    try {
      Z = _l(e, k, Te);
    } catch (W) {
      console.warn("Plenio: the lyrics sheet of this score was not found", W);
    }
    let U = null;
    try {
      U = $l(e, k, Te);
    } catch (W) {
      console.warn("Plenio: the score sheet of these lyrics was not found", W);
    }
    const I = $t, R = U?.owner ?? e;
    N({
      title: e.title || "Song Sheet",
      state: v,
      payload: k,
      asrNote: va(k?.docs.lyrics?.upstream_sha256),
      owned: _.length ? _ : [...Je],
      review: E,
      fetcher: $t,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: C(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: X(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: j(e.properties?.plenio_source_shift),
      barSources: H(R.properties?.plenio_bar_sources),
      lyricsTarget: Z?.target ?? null,
      scoreTarget: U?.target ?? null,
      onApply: (W, tt, He, J, Gt, Le) => {
        const Vt = String(h.value ?? "");
        if (h.value = Ye(W), e.properties = {
          ...e.properties ?? {},
          plenio_guide: B(tt),
          plenio_lyric_spans: (Le?.lyricSpans ?? []).map((me) => [...me]),
          plenio_source_shift: Le?.sourceShift ?? 0
        }, Le?.barSources && !U?.target.blocked && (R.properties = { ...R.properties ?? {}, plenio_bar_sources: Le.barSources }), Gt ? Ie(e, "approved") : String(h.value) !== Vt && x(e), He !== null && Z && !Z.target.blocked && (El(Z.owner, He, Te(String(Z.owner.id))), x(Z.owner)), J && U && !U.target.blocked) {
          const me = U.owner;
          Ll(me, J.text, Te(String(me.id)), J.approved ? { fetcher: I } : null).then(
            (Ut) => {
              Ut?.review?.approved_fingerprint ? Ie(me, "approved") : x(me);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function x(u) {
    Ts(u) === "approved" && Ie(u, null);
  }
  const M = [
    ya((u) => {
      u === String(e.id) && f();
    }),
    Ba((u) => {
      (u === null || u === e) && f();
    })
  ], P = e.onDrawForeground;
  e.onDrawForeground = function(u) {
    P?.call(this, u), d();
  };
  const V = e.onRemoved;
  return e.onRemoved = function() {
    for (const u of M) u();
    V?.call(this);
  }, f(), { widget: h };
}, ur = "PLENIO_FINISH_SWITCH", Ol = "plenio_switch", Go = 148, Nn = 0, Il = 4, yn = [
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
function Rl(e) {
  return e?.nodes ?? e?._nodes ?? [];
}
function dr(e) {
  return Rl(e).filter((t) => t.properties?.[Ol] === "cover");
}
function ht(e) {
  const t = dr(e);
  return t.length ? t.some((n) => (n.mode ?? Nn) === Nn) : null;
}
function Bl(e, t) {
  for (const n of dr(e)) n.mode = t ? Nn : Il;
  e?.setDirtyCanvas?.(!0, !0);
}
function Vo(e) {
  return e === !0 || typeof e == "string" && ["true", "1", "on"].includes(e.trim().toLowerCase());
}
const Cn = /* @__PURE__ */ new Set();
function Dl() {
  for (const e of Cn) e();
}
const ql = (e, t, n) => {
  let o = Vo(n?.[1]?.default);
  const s = e, r = document.createElement("div");
  r.className = "plenio-switches";
  const i = /* @__PURE__ */ new Map();
  for (const g of yn) {
    const x = document.createElement("button");
    x.type = "button", x.className = "plenio-switch", x.dataset.switch = g.id, x.innerHTML = `<span class="icon">${g.icon}</span><span class="text"><span class="name"></span><span class="what"></span></span><span class="pill"></span>`, x.addEventListener("click", (M) => {
      M.stopPropagation(), g.id === "hq" ? (o = !o, l.value = o, l.callback?.(o)) : Bl(s.graph, !ht(s.graph)), c();
    }), i.set(g.id, x), r.append(x);
  }
  function a(g, x) {
    const M = i.get(g.id);
    M && (M.hidden = x === null, M.classList.toggle("on", !!x), M.setAttribute("aria-pressed", String(!!x)), M.title = `${g.name}: ${x ? "on" : "off"} - click to switch it ${x ? "off" : "on"}`, M.querySelector(".name").textContent = g.name, M.querySelector(".what").textContent = x ? g.on : g.off, M.querySelector(".pill").textContent = x ? "ON" : "OFF");
  }
  function c() {
    a(yn[0], o), a(yn[1], ht(s.graph));
  }
  const l = e.addDOMWidget(t, ur, r, {
    getValue: () => o,
    setValue: (g) => {
      o = Vo(g), c();
    },
    getMinHeight: () => Go,
    getMaxHeight: () => Go
  });
  Cn.add(c);
  let d = ht(s.graph);
  const f = e.onDrawForeground;
  e.onDrawForeground = function(g) {
    f?.call(this, g);
    const x = ht(s.graph);
    x !== d && (d = x, c());
  };
  const h = e.onRemoved;
  return e.onRemoved = function() {
    Cn.delete(c), h?.call(this);
  }, c(), { widget: l };
}, Qe = "plenio.stem_mix/1", Be = "rest", zl = ["reverb", "delay"], fr = -60, Hl = 12;
function Fl() {
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
function pr(e) {
  const t = Fl();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const jl = ["vocals", "drums", "bass", "other"];
function Wl() {
  return [...jl, Be];
}
function Gl(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Qe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Qe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Vl(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || pr(le(e, o))) continue;
    const s = {}, r = le(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: Qe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Dt(e, t, n) {
  const o = { ...e.strips };
  return pr(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function Ul(e, t, n) {
  const o = n.some((r) => le(e, r).solo), s = le(e, t);
  return o ? s.solo : !s.mute;
}
function Uo(e) {
  return e <= fr ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Yl(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function Xl(e, t, n) {
  return Yl([...e, [t, n]]);
}
function Kl(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function Ql(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function Jl(e, t, n, o) {
  const s = le(e, t);
  return Dt(e, t, { ...s, muted: Xl(s.muted, n, o) });
}
function Zl(e, t, n) {
  const o = le(e, t), s = Kl(o.muted, n);
  return s < 0 ? e : Dt(e, t, { ...o, muted: Ql(o.muted, s) });
}
function eu(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function tu(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function Yo(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Wl()).filter((r) => r !== Be), s = Object.keys(e?.strips ?? {}).filter((r) => r !== Be && !o.includes(r));
  return [...o, ...s, Be];
}
const Xo = "plenio_stem_mixer", Ko = "mix", ye = 200, nu = ["room", "plate", "hall"];
function z(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function mt(e, t, n, o, s) {
  const r = z("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function ou(e) {
  const t = z("div", "plenio-mix"), n = z("div", "plenio-mix-strips"), o = z("div", "plenio-mix-buses"), s = z("div", "plenio-mix-info"), r = z("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: Qe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Yo(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const c = () => e.widgets?.find((b) => b.name === Ko);
  function l(b, { draw: v = !0 } = {}) {
    const _ = c();
    if (!_) return;
    const y = Vl(b);
    _.value = y, _.callback?.(y), i = { ...i, mix: b }, v && g();
  }
  function d(b, v, _ = {}) {
    l(Dt(i.mix, b, { ...le(i.mix, b), ...v }), _);
  }
  function f(b, v, _, y = {}) {
    const E = le(i.mix, b);
    let S = Dt(i.mix, b, { ...E, [v]: _ });
    _ > 0 && !(S[v] && Object.keys(S[v]).length) && (S = v === "reverb" ? { ...S, reverb: { preset: "room" } } : { ...S, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), l(S, y);
  }
  function h(b, v, _) {
    const y = { ...i.mix[b] ?? {} };
    l({ ...i.mix, [b]: { ...y, [v]: _ } });
  }
  function g() {
    n.replaceChildren();
    const b = i.names;
    for (const v of i.names) {
      const _ = le(i.mix, v), y = z("div", "plenio-mix-strip");
      y.dataset.strip = v;
      const E = z("span", "name", v === Be ? `${v} (missed)` : v);
      E.title = v === Be ? "What the separator missed: keeps a neutral mix exact" : "";
      const S = mt(fr, Hl, 0.5, _.gain_db, `${v} gain`), N = z("span", "gain", `${Uo(_.gain_db)} dB`);
      S.addEventListener("input", () => {
        N.textContent = `${Uo(Number(S.value))} dB`, d(v, { gain_db: Number(S.value) }, { draw: !1 });
      }), S.addEventListener("change", () => d(v, { gain_db: Number(S.value) }));
      const C = z("button", _.mute ? "toggle active" : "toggle", "M");
      C.setAttribute("aria-label", `${v} mute`), C.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { mute: !_.mute });
      });
      const B = z("button", _.solo ? "toggle active" : "toggle", "S");
      B.setAttribute("aria-label", `${v} solo`), B.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { solo: !_.solo });
      });
      const j = mt(0, 1, 0.05, _.compression, `${v} compression`);
      j.title = "Compression amount: one knob for the master compressor (threshold and ratio)", j.addEventListener("input", () => d(v, { compression: Number(j.value) }, { draw: !1 })), j.addEventListener("change", () => d(v, { compression: Number(j.value) }));
      const X = zl.map((I) => {
        const R = mt(0, 1, 0.05, _[I], `${v} ${I} send`);
        return R.title = `${I} send: how much of this stem goes to the shared ${I} bus`, R.addEventListener("input", () => f(v, I, Number(R.value), { draw: !1 })), R.addEventListener("change", () => f(v, I, Number(R.value))), R;
      }), H = z("button", _.save ? "toggle active" : "toggle", "save");
      H.setAttribute("aria-label", `${v} save as its own file`), H.setAttribute("aria-pressed", String(_.save)), H.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', H.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { save: !_.save });
      });
      const Z = Ul(i.mix, v, b);
      y.classList.toggle("silent", !Z);
      const U = z("canvas", "plenio-mix-wave");
      U.width = ye, U.height = 26, U.setAttribute("aria-label", `${v} waveform (drag to mute a time range)`), x(U, _, tu(i.peaks, v, ye)), U.addEventListener("pointerdown", (I) => M(I, U, v)), y.append(
        E,
        S,
        N,
        C,
        B,
        z("span", "label", "comp"),
        j,
        z("span", "label", "verb"),
        X[0],
        z("span", "label", "delay"),
        X[1],
        H,
        U
      ), n.append(y);
    }
    P(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function x(b, v, _) {
    const y = b.getContext("2d");
    if (!y) return;
    y.clearRect(0, 0, ye, b.height);
    const E = b.height / 2;
    y.strokeStyle = "rgba(180, 190, 205, 0.8)", y.beginPath();
    for (let S = 0; S < _.length; S++) {
      const N = Math.max(1, _[S] * (E - 1));
      y.moveTo(S + 0.5, E - N), y.lineTo(S + 0.5, E + N);
    }
    y.stroke(), y.fillStyle = "rgba(224, 104, 94, 0.35)", y.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [S, N] of v.muted) {
      const C = Math.max(0, Math.min(ye, S / Math.max(i.seconds, 1e-6) * ye)), B = Math.max(0, Math.min(ye, N / Math.max(i.seconds, 1e-6) * ye));
      y.fillRect(C, 0, Math.max(1, B - C), b.height), y.strokeRect(C + 0.5, 0.5, Math.max(1, B - C) - 1, b.height - 1);
    }
  }
  function M(b, v, _) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const y = v.getBoundingClientRect(), E = (X) => Math.max(0, Math.min(1, (X - y.left) / (y.width || ye))) * i.seconds, S = E(b.clientX);
    if (le(i.mix, _).muted.some(([X, H]) => X <= S && S <= H)) {
      l(Zl(i.mix, _, S));
      return;
    }
    let C = S;
    const B = (X) => {
      C = E(X.clientX);
    }, j = () => {
      window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", j), l(Jl(i.mix, _, Math.min(S, C), Math.max(S, C)));
    };
    window.addEventListener("pointermove", B), window.addEventListener("pointerup", j);
  }
  function P() {
    o.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, v = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, _ = z("select");
    _.setAttribute("aria-label", "Reverb preset"), _.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const S of nu) _.append(new Option(S, S));
    _.value = String(b.preset ?? "room"), _.addEventListener("change", () => h("reverb", "preset", _.value));
    const y = z("input");
    y.type = "number", y.value = String(v.time_ms ?? 375), y.setAttribute("aria-label", "Delay time in ms"), y.title = "Delay time in ms: where the first echo of the delay bus sits", y.addEventListener("change", () => h("delay", "time_ms", Number(y.value)));
    const E = mt(0, 0.8, 0.05, Number(v.feedback ?? 0.35), "Delay feedback");
    E.title = "Delay feedback: how much of each echo returns into the delay line", E.addEventListener("input", () => h("delay", "feedback", Number(E.value))), o.append(
      z("span", "label", "reverb bus"),
      _,
      z("span", "label", "delay bus"),
      y,
      z("span", "label", "ms, feedback"),
      E
    ), o.style.display = "flex";
  }
  const V = e.addDOMWidget(Xo, Xo, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  V.serialize = !1;
  const u = e.widgets?.find((b) => b.name === Ko), k = z("button", "toggle", "JSON");
  k.title = "Show or hide the raw mixer value", k.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, k.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(z("span", "label", "Advanced"), k), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function L() {
    const b = Gl(c()?.value);
    i = { ...i, mix: b ?? { schema: Qe, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), g();
  }
  return L(), {
    showExecuted(b) {
      const v = b?.plenio_stems?.at(-1), _ = eu(b), y = Yo(i.mix, v ?? null);
      i = { ...i, names: y, peaks: _, seconds: Number(v?.seconds ?? i.seconds) || 0 }, L();
    }
  };
}
const Pn = "plenio-tip", Qo = 12, gt = 8;
function su(e, t, n, o) {
  let s = e.right + Qo;
  if (s + n.width > o.width - gt && (s = e.left - Qo - n.width), s < gt) return null;
  const r = Math.max(gt, Math.min(t - 14, o.height - gt - n.height));
  return { x: s, y: r };
}
function ru(e) {
  return !!e && (String(e.type ?? "").startsWith("Plenio") || String(e.title ?? "").startsWith("Plenio"));
}
const iu = 30;
function au(e) {
  const t = e.node_over, n = e.ds, o = e.canvas;
  if (!t || !n || !o) return null;
  const s = o.getBoundingClientRect(), r = t.flags?.collapsed ? 0 : t.size[1];
  return {
    left: s.left + (t.pos[0] + n.offset[0]) * n.scale,
    top: s.top + (t.pos[1] - iu + n.offset[1]) * n.scale,
    right: s.left + (t.pos[0] + t.size[0] + n.offset[0]) * n.scale,
    bottom: s.top + (t.pos[1] + r + n.offset[1]) * n.scale
  };
}
function cu(e) {
  const t = document.body, n = () => t.classList.remove(Pn);
  let o = 0, s = null;
  const r = (a) => {
    const c = e();
    if (a.style.display === "none" || !a.textContent?.trim() || !c || !ru(c.node_over)) return n();
    const l = au(c), d = a.getBoundingClientRect(), f = l && su(l, o, d, { width: window.innerWidth, height: window.innerHeight });
    if (!f) return n();
    const h = a.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    t.style.setProperty("--plenio-tip-x", `${Math.round(f.x - h.left)}px`), t.style.setProperty("--plenio-tip-y", `${Math.round(f.y - h.top)}px`), t.classList.add(Pn);
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
const lu = `
body.${Pn} .node-tooltip { left: var(--plenio-tip-x) !important; top: var(--plenio-tip-y) !important;
  transform: none !important; }
`, uu = `
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
` + lu;
function du() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = uu, document.head.append(e);
}
function On(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function wt(e) {
  return On(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function fu(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function pu(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...c] = s, l = (d, f) => `<tr>${d.map((h) => `<${f}>${wt(h)}</${f}>`).join("")}</tr>`;
      t.push(`<table><thead>${l(a, "th")}</thead><tbody>${c.map((d) => l(d, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${On(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const d = fu(a);
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
      t.push(`<h${d}>${wt(c[2])}</h${d}>`);
      continue;
    }
    const l = /^\s*[-*]\s+(.*)$/.exec(a);
    if (l) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${wt(l[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${wt(a)}</p>`);
  }
  return r(), i(), o !== null && t.push(`<pre><code>${On(o.join(`
`))}</code></pre>`), t.join("");
}
const Ue = "plenio_summary", Jo = "plenio_summary", Zo = 84, hu = 18, mu = 55, gu = 16, es = 10;
function wu(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / mu)), 0);
  return gu + t * hu;
}
function yu(e, t) {
  const n = e.widgets?.find((i) => i.name === Jo);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  let s = es;
  const r = e.addDOMWidget(Jo, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Zo,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets. The margins
    // count too - without them the element stayed 20 px short of its text and hid the last line
    getMaxHeight: () => Math.max(Zo, (o.scrollHeight ? o.scrollHeight + 2 : wu(t.markdown)) + 2 * s)
  });
  return s = r.margin ?? es, r.serialize = !1, o;
}
function bu(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const ts = /* @__PURE__ */ new WeakMap();
function In(e, t) {
  if (!t.markdown) return;
  const n = ts.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, ts.set(e, n);
  const o = yu(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = pu(t.markdown), bu(e), e.setDirtyCanvas?.(!0, !0);
}
function ns(e, t, n, o) {
  const s = e.properties?.[Ue], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((c) => c.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ue] = a, In(e, a);
}
function vu(e) {
  e.prototype.onExecuted = Y(e.prototype.onExecuted, function(t) {
    const n = t?.[Ue], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[Ue] = { markdown: o.markdown, status: o.status ?? "" }, In(this, o));
  }), e.prototype.onConfigure = Y(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ue];
    t?.markdown && In(this, t);
  });
}
const xu = "Plenio.Core", G = _r;
Cl(G);
const D = is, bn = { app: D, fetcher: G }, yt = { app: D, fetcher: G }, Wt = () => D.graph;
async function ku() {
  const e = (t) => D.extensionManager?.toast?.add({ ...t, life: 2e4 });
  try {
    const t = D.graph?.serialize?.();
    if (!t) return;
    const n = await cs(G, t, !0), o = D.extensionManager?.workflow?.activeWorkflow ?? null;
    n.workflow && D.loadGraphData && await D.loadGraphData(n.workflow, !1, !0, o);
    for (const s of Br(n)) e(s);
  } catch (t) {
    const n = t instanceof Q && t.hint ? `${t.message} ${t.hint}` : String(t);
    e({ severity: "error", summary: "Model blocks not brought up to date", detail: n });
  }
}
const he = new ga(G);
let os;
function Su() {
  window.clearTimeout(os), os = window.setTimeout(() => {
    he.refresh().then(At);
  }, 1500);
}
function At() {
  for (const e of Wt()?.nodes ?? []) {
    e.type === qe && he.label(e);
    for (const t of e.subgraph?.nodes ?? []) t.type === qe && he.label(t);
    e.subgraph && he.labelBlock(e);
  }
  D.graph?.setDirtyCanvas?.(!0, !0);
}
function Mu() {
  for (const e of Wt()?.nodes ?? [])
    for (const t of [e, ...e.subgraph?.nodes ?? []]) {
      if (t.type !== qe) continue;
      const n = t.widgets?.find((o) => o.name === "component.file")?.value;
      if (ha(n, he.info(En(t)))) return !0;
    }
  return !1;
}
let vn = null;
function Rn(e) {
  if (e == null) return null;
  const t = String(e);
  return Wt()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
async function _u(e, t) {
  const n = `Your own ${e.replace("_", " ")} - any text; the list holds the style templates' values.`, o = D.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: "Plenio · your own value", message: n, defaultValue: t }) : window.prompt(n, t);
}
const ss = new Na(
  (e) => D.extensionManager?.toast?.add({ severity: "warn", summary: e.summary, detail: e.detail, life: 2e4 })
), Eu = {
  scale: () => D.canvas?.ds?.scale ?? 1,
  toast: (e, t) => D.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, hr = () => Hn(import.meta.url, Fn), $u = {
  fetcher: G,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Ce(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      hr,
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
function Au(e, t) {
  const n = Rn(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function Lu(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = Au(t, e.job.file);
  if ("saved" in e) {
    o && ns(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), D.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof Q && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && ns(o, n, `${n} - not saved: ${r}`, "warning"), D.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const Bn = /* @__PURE__ */ new Map(), rs = new Zc($u, (e) => {
  Lu(e, Bn.get(e.job.token)), Bn.delete(e.job.token);
});
is.registerExtension({
  name: xu,
  getCustomWidgets: () => ({ [lr]: Pl, [ur]: ql }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: rn,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => Oi(bn).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), D.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    },
    { id: $o, label: "Plenio Player", icon: "pi pi-play-circle", function: () => St(yt) },
    { id: jo, label: "Plenio Setup", icon: "pi pi-box", function: () => vn?.open() },
    {
      id: Zt,
      label: "Bring the model blocks up to date",
      icon: "pi pi-sync",
      function: () => {
        ku();
      }
    }
  ],
  menuCommands: [
    { path: ["File"], commands: [rn, Zt] },
    { path: ["Plenio"], commands: [jo, $o, rn, Zt] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: "pi pi-play-circle",
      label: "Plenio Player",
      tooltip: "Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)",
      onClick: () => {
        St(yt);
      }
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(e) {
    const t = jr(e);
    t.length && console.info(`Plenio: longer LLM answers (${kn} tokens) in ${t.join(", ")}`);
    const n = Rr(e);
    n && D.extensionManager?.toast?.add({ ...n, life: 2e4 });
    try {
      const o = await Pr(e, G);
      for (const s of Dr(o)) D.extensionManager?.toast?.add({ ...s, life: 2e4 });
    } catch (o) {
      console.error("Plenio: the blocks of this workflow could not be brought up to date", o);
      const s = o instanceof Q && o.hint ? `${o.message} ${o.hint}` : String(o instanceof Error ? o.message : o);
      D.extensionManager?.toast?.add({
        severity: "warn",
        summary: "Plenio blocks not brought up to date - the brief's creativity may not reach their sampling",
        detail: s,
        life: 2e4
      });
    }
  },
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => {
    At(), Ra(), Dl();
  },
  async beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    io.has(t.name) && await ei(e, t, G, _u), vu(e), Wa(e, Eu);
    const n = Hi(t.input);
    if (n.size || t.name in Wn) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = ca(t, s), i = Ri(r), a = o?.call(this, r);
        return zi(this, i, n), sa(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = Y(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) ba(s);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Ji(this, G));
      }, e.prototype.onExecuted = Y(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (t.name === qe) {
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), he.label(this);
        const s = this.widgets?.find((r) => r.name === "component");
        s && (s.callback = Y(s.callback, () => window.setTimeout(() => he.label(this), 0)));
      }, e.prototype.onExecuted = Y(e.prototype.onExecuted, function() {
        Su();
      });
    }
    if (t.name === "PlenioExportRelease" && Sa(e, yt), t.name === nr && sl(e), io.has(t.name)) {
      hi(e, G);
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), ss.watch(this), vl(
          this,
          (s, r) => D.extensionManager?.toast?.add({ severity: "info", summary: s, detail: r, life: 1e4 })
        );
      };
    }
    if (t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, ou(this));
      }, e.prototype.onExecuted = Y(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = Y(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && Eo(String(this.id), r);
    }));
  },
  // R: the lists are read again - and the facts behind the labels (ComfyUI then copies the inner fields' options,
  // labels included, to the blocks' promoted fields)
  async refreshComboInNodes() {
    await he.refresh(), At();
  },
  setup() {
    du(), he.refresh().then(At), vn = ml({
      app: D,
      fetcher: G,
      openPlayer: () => {
        St(yt);
      },
      lacksFiles: Mu
    }), G.addEventListener(la, (n) => {
      const o = n.detail ?? {};
      D.extensionManager?.toast?.add({ severity: "warn", ...pa(o), life: 3e4 }), o.variant && vn?.open(o.component ?? null);
    }), cu(() => D.canvas), Pi(bn), Ea(bn), G.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      Eo(String(o.node_id), o);
      const s = Rn(o.node_id);
      s && Ie(s, Ls(o));
    }), G.addEventListener("status", (n) => {
      ss.status(n.detail?.exec_info?.queue_remaining);
    }), G.addEventListener("execution_start", () => {
      Ia(Wt()?.nodes ?? []);
    }), G.addEventListener("execution_error", (n) => {
      const o = Rn(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Ie(o, "error");
    }), G.addEventListener("executed", (n) => {
      const o = n.detail, s = Xc(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) Bn.set(i.token, r);
      rs.take(s);
    });
    const e = () => {
      rs.recover();
    };
    let t = !1;
    G.addEventListener("reconnected", () => {
      hr().then((n) => {
        n ? t || (t = !0, D.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: Mn })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  _d as $,
  Vn as A,
  Tn as B,
  ld as C,
  mc as D,
  il as E,
  hc as F,
  It as G,
  qs as H,
  $d as I,
  zs as J,
  Ze as K,
  pc as L,
  id as M,
  xd as N,
  Tc as O,
  Q as P,
  pd as Q,
  hd as R,
  Hd as S,
  ne as T,
  fd as U,
  ze as V,
  Ad as W,
  Fs as X,
  ud as Y,
  dd as Z,
  $c as _,
  Vd as a,
  uc as a$,
  gd as a0,
  md as a1,
  Io as a2,
  yd as a3,
  wd as a4,
  rd as a5,
  bd as a6,
  vd as a7,
  Lc as a8,
  Sd as a9,
  nc as aA,
  Ws as aB,
  js as aC,
  Ys as aD,
  Us as aE,
  Vs as aF,
  Gs as aG,
  Ee as aH,
  Ld as aI,
  Ed as aJ,
  Ds as aK,
  Id as aL,
  Cd as aM,
  Bo as aN,
  Od as aO,
  qu as aP,
  Bu as aQ,
  Du as aR,
  sc as aS,
  oc as aT,
  cc as aU,
  ec as aV,
  dc as aW,
  Bs as aX,
  rc as aY,
  Gn as aZ,
  lc as a_,
  Ac as aa,
  yc as ab,
  bc as ac,
  kd as ad,
  ic as ae,
  ac as af,
  Ku as ag,
  Ju as ah,
  Qu as ai,
  td as aj,
  nd as ak,
  Zu as al,
  ed as am,
  Ot as an,
  Va as ao,
  Ae as ap,
  Ka as aq,
  od as ar,
  Js as as,
  dt as at,
  Qa as au,
  Vc as av,
  Qs as aw,
  Ft as ax,
  Dd as ay,
  qd as az,
  Fd as b,
  Dc as b0,
  Td as b1,
  Pd as b2,
  Xu as b3,
  Pu as b4,
  Rd as b5,
  Cu as b6,
  Gu as b7,
  Uu as b8,
  Wu as b9,
  Yu as ba,
  Ye as bb,
  Vu as bc,
  Er as bd,
  xi as be,
  vi as bf,
  Nd as bg,
  Wc as bh,
  Bd as bi,
  Ou as bj,
  ys as bk,
  xu as bl,
  jd as c,
  zd as d,
  Hu as e,
  gn as f,
  Cc as g,
  Md as h,
  ws as i,
  Iu as j,
  zu as k,
  ju as l,
  Os as m,
  kc as n,
  sd as o,
  gs as p,
  Xa as q,
  Wd as r,
  Gd as s,
  Ru as t,
  Sc as u,
  Fu as v,
  cl as w,
  ad as x,
  Rt as y,
  cd as z
};
