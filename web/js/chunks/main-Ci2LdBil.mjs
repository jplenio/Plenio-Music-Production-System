import { api as gr } from "../../../../scripts/api.js";
import { app as Zo } from "../../../../scripts/app.js";
class J extends Error {
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
    throw new J(r.message ?? `Request failed (${o.status})`, r.hint ?? null);
  }
  return s;
}
function wr(e, t) {
  return re(e, "/plenio/sheet/resolve", t);
}
async function iu(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
const es = "Plenio.SectionTags";
async function au(e) {
  try {
    const t = await e.fetchApi(`/settings/${es}`);
    if (!t.ok) return [];
    const n = await t.json();
    return Array.isArray(n) ? n.filter((o) => typeof o == "string") : [];
  } catch {
    return [];
  }
}
async function cu(e, t) {
  const n = await e.fetchApi(`/settings/${es}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (!n.ok) throw new J(`Your section tags could not be kept (HTTP ${n.status}).`);
}
function Cn(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function lu(e, t, n, o) {
  return re(e, "/plenio/score/analyze", Cn({ abc: t }, n, o));
}
function uu(e, t, n, o, s) {
  return re(e, "/plenio/score/transform", Cn({ abc: t, operation: n }, o, s));
}
function du(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return re(e, "/plenio/score/musicxml/export", Cn(s, n, o));
}
function fu(e, t) {
  const { lyrics: n, ...o } = t;
  return re(e, "/plenio/score/musicxml/import", n ? { ...o, lyrics: n } : o);
}
function pu(e, t) {
  return re(e, "/plenio/score/midi/export", t);
}
function hu(e, t) {
  return re(e, "/plenio/score/midi/import", t);
}
function mu(e, t) {
  return re(e, "/plenio/lyrics/analyze", t);
}
function gu(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function Vn(e, t, n, o = 200) {
  return re(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function yr(e, t) {
  return re(e, "/plenio/brief/fields", t);
}
async function br(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new J(`Request failed (${t.status})`);
  return await t.json();
}
async function wu(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new J(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function vr(e, t) {
  return re(e, "/plenio/records/continue", t);
}
function xr(e, t) {
  return re(e, "/plenio/workflow/blocks", { workflow: t });
}
function U(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const pn = "Plenio · ", kr = /* @__PURE__ */ new Set(["YuE2GenerateABC", "YuE2GenerateMusic", "PlenioComposePrompt", "PlenioComposeArrangement"]), _r = "PlenioCreativity";
function Sr(e) {
  const t = e?.definitions?.subgraphs;
  return Array.isArray(t) ? t : [];
}
function Mr(e) {
  return Sr(e).some((t) => {
    if (typeof t?.name != "string" || !t.name.startsWith(pn)) return !1;
    const n = new Set((t.nodes ?? []).map((o) => o?.type));
    return !n.has(_r) && [...n].some((o) => kr.has(String(o)));
  });
}
async function Er(e, t) {
  if (!e || typeof e != "object" || !Mr(e)) return null;
  const n = await xr(t, e);
  if (n.workflow) {
    const o = e;
    for (const s of Object.keys(o)) delete o[s];
    Object.assign(o, n.workflow);
  }
  return n;
}
const hn = (e) => e.startsWith(pn) ? e.slice(pn.length) : e, Un = (e) => e.map(hn).join(", ");
function $r(e) {
  if (!e) return [];
  const t = [];
  if (e.updated.length) {
    const o = e.linked.length ? ` The creativity of ${Un(e.linked)} now comes from the brief.` : "";
    t.push({
      severity: "info",
      summary: "Plenio blocks brought up to date",
      detail: `This workflow was saved before its blocks followed the brief's creativity: ${Un(e.updated)} are the current blocks now.${o} At creativity 50 they work exactly as before. Save the workflow to keep it.`
    });
  }
  const n = [
    ...e.kept.map(([o, s]) => `${hn(o)} was kept as it was (${s}) - its sampling stays fixed`),
    ...e.unlinked.map(([o, s]) => `${hn(o)} has its own creativity slider (${s})`)
  ];
  return n.length && t.push({
    severity: "warn",
    summary: "The brief's creativity does not reach every block",
    detail: `${n.join("; ")}. The template, opened again from the template browser, has the current blocks.`
  }), t;
}
const Ar = "Plenio · ", mn = 16384, Lr = 24576, Yn = [1024, 2048, 6144], Nr = [8192, 12288], Cr = {
  TextGenerate: [[1, Yn, mn]],
  PlenioLocalLLM: [
    [4, Yn, mn],
    [7, Nr, Lr]
  ]
};
function Or(e) {
  const t = e?.definitions?.subgraphs;
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    if (typeof o?.name != "string" || !o.name.startsWith(Ar)) continue;
    let s = !1;
    for (const r of o.nodes ?? []) {
      const i = r?.widgets_values, a = Cr[String(r?.type)];
      if (!(!a || !Array.isArray(i)))
        for (const [c, l, d] of a)
          typeof i[c] == "number" && l.includes(i[c]) && (i[c] = d, s = !0);
    }
    s && n.push(o.name);
  }
  return n;
}
const Et = "✎ type your own …", ts = ["genre", "mood", "tempo", "key", "meter", "language", "voice", "theme", "lead_instrument"], Tr = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].flatMap((e) => [`${e} major`]), Pr = ["A", "E", "B", "F#", "C#", "G#", "D", "G", "C", "F", "Bb", "Eb"].map((e) => `${e} minor`), Ir = {
  key: [...Tr, ...Pr],
  meter: ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"],
  language: ["English", "German", "Spanish", "French", "Italian", "Portuguese", "Dutch", "Japanese", "Korean", "Chinese"],
  tempo: ["60 BPM", "80 BPM", "90 BPM", "100 BPM", "110 BPM", "120 BPM", "128 BPM", "140 BPM", "174 BPM"]
};
function Rr(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of [...t[e] ?? [], ...Ir[e] ?? []]) {
    const r = String(s).replace(/\s+/g, " ").trim();
    r && !n.has(r.toLowerCase()) && n.set(r.toLowerCase(), r);
  }
  const o = [...n.values()].sort((s, r) => s.localeCompare(r, void 0, { sensitivity: "base" }));
  return ["", Et, ...o];
}
function qr(e, t) {
  if (!Array.isArray(e) || e[0] !== "STRING") return e;
  const n = e[1] ?? {};
  return n.multiline ? e : ["COMBO", { ...n, options: t, default: typeof n.default == "string" ? n.default : "" }];
}
function zr(e, t) {
  const n = [], o = (s, r) => {
    if (s)
      for (const [i, a] of Object.entries(s)) {
        if (ts.includes(i)) {
          const d = qr(a, Rr(i, t));
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
const ns = (e) => e.name.split(".").pop() ?? e.name;
function Br(e) {
  return ts.includes(ns(e)) && Array.isArray(e.options?.values);
}
function Xn(e) {
  const t = e.options.values, n = typeof e.value == "string" ? e.value : "";
  n && n !== Et && !t.includes(n) && t.splice(2, 0, n);
}
function gn(e, t) {
  os.set(e, t);
  const n = Kn.get(e) ?? /* @__PURE__ */ new WeakSet();
  Kn.set(e, n);
  for (const o of e.widgets ?? []) {
    if (!Br(o) || (Xn(o), n.has(o))) continue;
    n.add(o);
    let s = typeof o.value == "string" && o.value !== Et ? o.value : "";
    const r = o.callback;
    o.callback = function(i) {
      if (i !== Et) {
        s = typeof i == "string" ? i : "", r?.call(this, i);
        return;
      }
      o.value = s, t(ns(o), s).then((a) => {
        const c = a?.replace(/\s+/g, " ").trim();
        c && (o.value = c, Xn(o), o.callback?.(c), e.setDirtyCanvas?.(!0, !0));
      });
    };
  }
}
const Kn = /* @__PURE__ */ new WeakMap(), os = /* @__PURE__ */ new WeakMap();
function Dr(e) {
  const t = os.get(e);
  t && gn(e, t);
}
let Qn = null;
const Hr = 8e3;
function Fr(e) {
  const t = e.fetchApi("/plenio/api/v1/briefs").then(async (n) => n.ok ? (await n.json()).values ?? {} : {}).catch(() => ({}));
  return Qn ??= Promise.race([t, new Promise((n) => setTimeout(() => n({}), Hr))]), Qn;
}
async function Wr(e, t, n, o) {
  const s = await Fr(n);
  if (!Object.keys(s).length) return;
  zr(t, s);
  const r = e.prototype;
  r.onNodeCreated = U(r.onNodeCreated, function() {
    gn(this, o);
  }), r.onConfigure = U(r.onConfigure, function() {
    gn(this, o);
  });
}
const Pt = [
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
], ss = ["length", "vocals", "melody"], On = {
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
}, jr = "my own, sung as written below", Gr = "custom";
function rs(e) {
  return typeof e == "string" && e.trim().toLowerCase() === Gr;
}
function ce(e, t) {
  const n = On[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function Vr(e) {
  const t = {};
  for (const n of [...Pt, ...ss, "lyrics_from"]) {
    const o = ce(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function Jn(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
const Me = (e) => typeof e == "string" ? e : String(e ?? "");
function It(e) {
  return Object.keys(e.sources).filter((t) => Pt.includes(t));
}
function Ur(e, t, n = {}) {
  const o = [];
  for (const i of It(t)) {
    const a = ce(e, i);
    if (!a) continue;
    const c = Me(a.value), l = t.fields[i] ?? "", d = (n[i] ?? []).includes(c);
    (!c.trim() || d) && c !== l && o.push({ field: i, value: l });
  }
  const s = ce(e, "lyrics"), r = [...n.lyrics ?? [], t.fields.lyrics ?? ""].filter(Boolean);
  return s && Me(ce(e, "lyrics_from")?.value) === jr && r.includes(Me(s.value)) && o.push({ field: "lyrics", value: "" }), o;
}
function Zn(e, t) {
  const n = [];
  for (const o of It(t)) {
    const s = ce(e, o), r = t.fields[o] ?? "";
    s && Me(s.value) !== r && n.push({ field: o, value: r });
  }
  return n;
}
function Yr(e, t) {
  const n = { template: [], own: [] };
  for (const o of It(t)) {
    const s = Me(ce(e, o)?.value).trim();
    s && n[s === (t.fields[o] ?? "").trim() ? "template" : "own"].push(o);
  }
  return n;
}
function bt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Xr(e, t, n) {
  if (!n || !t || t.template === "none") return null;
  const { template: o, own: s } = Yr(e, t), r = [
    o.length ? `From the template: ${o.join(", ")}` : "",
    s.length ? `your own: ${s.join(", ")}` : ""
  ].filter(Boolean);
  return r.length ? r.join(" · ") : "The template has no text for these fields.";
}
function Kr(e) {
  const t = e ? bt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Qr(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Jr(e) {
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
function is(e) {
  const t = [];
  for (const n of Pt) {
    const o = ce(e, n);
    !o || !rs(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const eo = "plenio_brief_template", Zr = 400;
function ei(e, t) {
  let n = null, o = null;
  const s = {};
  let r = !1, i = null, a;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const l = document.createElement("div");
  l.className = "line";
  const d = document.createElement("div");
  d.className = "hint";
  const p = document.createElement("div");
  p.className = "mode";
  const h = document.createElement("div");
  h.className = "actions", c.append(l, d, p, h);
  const g = (y, E, _) => {
    const C = document.createElement("button");
    return C.textContent = y, C.title = E, C.addEventListener("click", (O) => {
      O.stopPropagation(), _();
    }), h.append(C), C;
  }, x = g("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (rt(e, bt(n)), j());
  }), S = g("Refill from template", "Put the template’s value back into every text field you changed", () => {
    if (!n) return;
    const y = Zn(e, n);
    if (!y.length) return;
    const E = y.map((_) => _.field).join(", ");
    window.confirm(`Replace your values in ${E} with the template's?`) && (rt(e, y), j());
  }), T = g("↻", "Ask again what the template fills", () => {
    v();
  }), j = () => {
    l.textContent = i ?? Xr(e, n, r) ?? "No template: the fields hold your values only.", l.dataset.state = i ? "error" : r && n ? "ok" : "empty";
    const y = Kr(n), E = Qr(n);
    d.textContent = [y, E].filter(Boolean).join(" · "), d.style.display = d.textContent ? "" : "none", p.textContent = Jr(n) ?? "", p.style.display = p.textContent ? "" : "none", h.style.display = r && n && n.template !== "none" ? "" : "none", x.disabled = !n || !bt(n).length, S.disabled = !n || !Zn(e, n).length, T.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, u = (y) => {
    const E = String(e.widgets?.find((C) => C.name === "template")?.value ?? "none");
    if (y.template !== (E || "none")) return;
    if (o !== null && o !== y.template) {
      const C = Jn(e) === "cover", O = (q) => C || (s[q] ?? []).includes(Me(ce(e, q)?.value));
      rt(e, bt(y).filter((q) => O(q.field)));
    }
    const _ = Ur(e, y, s);
    _.length && rt(e, _);
    for (const C of [...It(y), ...ss]) {
      const O = Me(ce(e, C)?.value);
      O && O === (y.fields[C] ?? "") && !(s[C] ??= []).includes(O) && s[C].push(O);
    }
    o = y.template;
  }, k = /* @__PURE__ */ new WeakSet(), L = () => {
    ni(e);
    for (const y of ["template", "arrangement", ...Object.keys(On)]) {
      const E = y === "template" || y === "arrangement" ? e.widgets?.find((_) => _.name === y) : ce(e, y);
      !E || k.has(E) || (k.add(E), E.callback = U(E.callback, () => {
        L(), v();
      }));
    }
    Dr(e);
  }, b = async () => {
    L();
    const y = String(e.widgets?.find((E) => E.name === "template")?.value ?? "none");
    try {
      const E = String(e.widgets?.find((_) => _.name === "arrangement")?.value ?? "");
      n = await yr(t, { fields: Vr(e), template: y, kind: Jn(e), arrangement: E }), i = null, u(n);
    } catch (E) {
      n = null, i = `The template fields could not be read: ${E instanceof Error ? E.message : String(E)}`;
    }
    r = !0, j();
  };
  function v() {
    clearTimeout(a), a = setTimeout(() => {
      b();
    }, Zr);
  }
  L();
  const M = e.addDOMWidget(eo, eo, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 128
  });
  return M.serialize = !1, is(e), j(), v(), {
    widget: M,
    refresh: v,
    answer: () => n,
    dispose: () => clearTimeout(a)
  };
}
const ti = {
  "vocals.lyrics_from": "lyrics",
  "vocals.lyrics": "lyrics idea or text"
};
function ni(e) {
  for (const t of e.widgets ?? []) {
    const n = ti[t.name];
    n && t.label !== n && (t.label = n);
  }
}
const to = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function oi(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, ei(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), is(this), n.get(this)?.refresh();
  };
}
const no = "plenio.record/1", si = 2, ri = "PLNO", it = new TextEncoder().encode(`${ri}plenio.project/1\0`), oo = 32 * 2 ** 20;
class pe extends Error {
}
async function Ut(e, t, n) {
  return new Uint8Array(await e.slice(t, t + n).arrayBuffer());
}
function Yt(e, t) {
  return e.length >= t.length && t.every((n, o) => e[o] === n);
}
async function ii(e) {
  const t = e.stream().pipeThrough(new DecompressionStream("gzip")).getReader(), n = [];
  let o = 0;
  for (; ; ) {
    const { done: i, value: a } = await t.read();
    if (i) break;
    if (o += a.length, o > oo)
      throw await t.cancel(), new pe(`its Plenio project is larger than ${oo / 2 ** 20} MB`);
    n.push(a);
  }
  const s = new Uint8Array(o);
  let r = 0;
  for (const i of n)
    s.set(i, r), r += i.length;
  return new TextDecoder().decode(s);
}
async function as(e) {
  if (!Yt(await Ut(e, 0, 4), new TextEncoder().encode("fLaC"))) throw new pe("it is not a FLAC file");
  let t = 4;
  for (; ; ) {
    const n = await Ut(e, t, 4);
    if (n.length < 4) throw new pe("the file ends inside its metadata");
    const o = n[1] << 16 | n[2] << 8 | n[3];
    if ((n[0] & 127) === si && o >= 4) {
      const s = await Ut(e, t + 4, Math.min(o, it.length));
      if (Yt(s, it.subarray(0, 4))) {
        if (!Yt(s, it)) throw new pe("it holds a Plenio project of an unknown layout (made by a newer Plenio)");
        let r;
        try {
          r = await ii(e.slice(t + 4 + it.length, t + 4 + o));
        } catch (a) {
          throw a instanceof pe ? a : new pe(`its Plenio project is damaged (${a instanceof Error ? a.message : String(a)})`);
        }
        let i;
        try {
          i = JSON.parse(r);
        } catch {
          throw new pe("its Plenio project is damaged (no JSON)");
        }
        if (i?.schema !== no)
          throw new pe(`its Plenio project is no release record (${no})`);
        return i;
      }
    }
    if (n[0] & 128) return null;
    t += 4 + o;
  }
}
function cs(e) {
  return /\.flac$/i.test(e.name ?? "") || e.type === "audio/flac" || e.type === "audio/x-flac";
}
const Tn = "plenio.sheet_state/1", Je = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Rt() {
  return { schema: Tn, docs: {} };
}
function $e(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Rt();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Tn || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ue(e) {
  const t = {};
  for (const o of Je) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: Tn, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Xt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function ai(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Je.filter((o) => Xt(e, o) !== "auto").map(
    (o) => o === "lyrics" && Xt(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${Xt(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function yu(e) {
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
const bu = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function vu(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function xu(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function so(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function ku(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: so(s?.[0] ?? 0), end: so(r?.[1] ?? e.duration_s) };
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
function ci(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function _u(e, t, n) {
  return n.map((o) => ({ kind: o, text: ci(e, t, o), intent: "keep" }));
}
function ls(e, t, n) {
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
  const s = { ...Rt(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function li(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function us(e, t) {
  return Je.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function ui(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const di = "PlenioSongSheet";
function ds(e) {
  return e.nodes ?? e._nodes ?? [];
}
function fi(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? ds(e).find((o) => String(o.id) === t) ?? null;
}
function Kt(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = fi(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function pi(e, t) {
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
function hi(e, t) {
  const n = { values: 0, missing: [], sheets: 0, activated: 0 };
  for (const o of t.activate) {
    const s = Kt(e, o);
    s && s.mode !== 0 && (s.mode = 0, n.activated++);
  }
  for (const [o, s] of Object.entries(t.values)) {
    const r = Kt(e, o);
    if (!r) {
      n.missing.push(...Object.keys(s).map((a) => `${o}: ${a}`));
      continue;
    }
    const i = pi(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = Kt(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function mi(e, t) {
  let n = 0;
  for (const o of ds(e)) {
    if (o.type !== di) continue;
    const s = o.widgets?.find((p) => p.name === "sheet_state");
    if (!s) continue;
    const r = $e(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), a = us(i, r), c = (a.length ? a : [...Je]).filter((p) => !!t[p]);
    if (!c.length) continue;
    const l = { ...r.docs };
    for (const p of c) l[p] = { state: "manual", text: t[p] };
    const d = Ue({ ...r, docs: l, review: void 0 });
    s.value = d, s.callback?.(d), n++;
  }
  return n;
}
function gi(e, t) {
  return (e.split(/[\\/]/).pop() ?? "").replace(/\.plenio\.json$/i, "").replace(/\.(json|flac)$/i, "") || t || "Plenio song";
}
function Qt(e, t) {
  const n = [e.plenio && `Plenio ${e.plenio}`, e.created.slice(0, 10)].filter(Boolean).join(", "), o = t?.sheets ? " Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again." : "";
  if (e.from === "record") return `"${e.title}" opened in the workflow it was made with (${n}).${o}`;
  if (e.from === "template") {
    const s = e.unplaced.length ? ` ${e.unplaced.length} node(s) of the song have no place in today's template: ${e.unplaced.join(", ")}.` : "";
    return `"${e.title}" (${n}) opened in today's template "${e.template}" with the song's settings.${o}${s}`;
  }
  return `The workflow "${e.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`;
}
const wn = "Plenio was updated while this page was open: reload the page (F5).";
function wi(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function yi(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function Pn(e, t) {
  const n = wi(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? yi(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function In(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Oe(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${wn} ${n}` : wn) : o;
  }
}
const Jt = "Plenio.ContinueSong", bi = "plenio.record/1";
function yn(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function $t(e, t) {
  const n = await vr(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, gi("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = hi(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), yn(e, "success", "Song opened", Qt(n, i));
    return;
  }
  const o = e.app.graph, s = o ? mi(o, n.documents) : 0;
  if (!s)
    throw new J(
      Qt(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  yn(e, "success", "Song texts taken", `${Qt(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function vi(e) {
  if (cs(e)) return as(e);
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === bi ? t : null;
  } catch {
    return null;
  }
}
function ro(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function xi(e, t) {
  const n = [...e.dataTransfer?.files ?? []];
  if (n.length !== 1 || !cs(n[0]) || e.shiftKey) return null;
  const o = t.canvas, s = t.graph;
  if (!o?.canvas || e.target !== o.canvas || !o.convertEventToCanvasOffset || !s?.getNodeOnPos) return null;
  const [r, i] = o.convertEventToCanvasOffset(e);
  return s.getNodeOnPos(r, i) ? null : n[0];
}
function ki(e, t = window) {
  const n = (o) => {
    const s = ro(o) ? null : xi(o, e.app), r = s ?? ro(o);
    r && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      if (s) {
        const a = await as(s);
        if (a) return $t(e, { record: a, name: s.name });
        if (!e.app.handleFile) throw new J(`${s.name} carries no Plenio project.`, "Drop it with Shift held to give it to ComfyUI.");
        return e.app.handleFile(s);
      }
      const i = await vi(r);
      if (!i) throw new J(`${r.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await $t(e, { record: i, name: r.name });
    })().catch((i) => {
      const a = i instanceof pe ? `${r.name}: ${i.message}.` : i instanceof J && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
      yn(e, "error", "Song not opened", a, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function _i(e) {
  const t = () => Pn(import.meta.url, In), { openContinueDialog: n } = await Oe(() => import("./openContinue-Cd583oB6.mjs"), t);
  n(e.fetcher, (o) => $t(e, o));
}
const Si = "COMFY_DYNAMICCOMBO_V3";
function Mi(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Ei(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function $i(e, t) {
  const n = Ei(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function Ai(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Li(e, t, n) {
  if (!t || !e.widgets || $i(e, t)) return !1;
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
    if (n.has(r.name) && !Ai(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function Ni(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === Si && t.add(o);
  return t;
}
const fs = "plenio.eq/1", vt = 8, xe = 20, Ci = 2e4, ze = 12, ps = 15, Pe = ["peak", "low_shelf", "high_shelf"], hs = ["peak", "notch", "highpass", "lowpass"], io = [0.2, 10], ao = [0.25, 1];
function Ce() {
  return { schema: fs, preamp_db: 0, bands: [] };
}
function Oi(e) {
  if (typeof e != "string" || !e.trim()) return Ce();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: fs,
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
function Te(e) {
  return JSON.stringify(e);
}
const oe = (e, t) => Number(e.toFixed(t));
function ee(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function ms(e) {
  return e.db ?? ps;
}
const co = [6, 12, 18], Ti = { 6: 8, 12: 14, 18: 20 };
function Pi(e, t) {
  return { ...e, db: Ti[t] ?? ps };
}
function Se(e, t) {
  return Math.log(ee(t, xe, e.maxHz) / xe) / Math.log(e.maxHz / xe) * e.width;
}
function lo(e, t) {
  return xe * (e.maxHz / xe) ** ee(t / e.width, 0, 1);
}
function ye(e, t) {
  const n = ms(e);
  return (1 - (ee(t, -n, n) + n) / (2 * n)) * e.height;
}
function uo(e, t) {
  const n = ms(e);
  return (1 - ee(t / e.height, 0, 1)) * 2 * n - n;
}
function fo(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function po(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${Se(e, o).toFixed(1)},${ye(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function Rn(e) {
  return Math.min(Ci, 0.45 * e);
}
function Ii(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Ri(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= vt) return null;
  const s = {
    id: Ii(e),
    enabled: !0,
    type: "peak",
    frequency_hz: oe(ee(t, xe, Rn(o)), 1),
    gain_db: oe(ee(n, -ze, ze), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function He(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: oe(ee(n, xe, Rn(s)), 1),
        gain_db: Pe.includes(r.type) ? oe(ee(o, -ze, ze), 1) : r.gain_db
      }
    )
  };
}
function Zt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: oe(ee(o.q * n, 0.2, 10), 3) } : o)
  };
}
function en(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function Fe(e) {
  const t = e.frequency_hz >= 1e3 ? `${oe(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Pe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${oe(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${oe(e.q, 2)}`;
}
function qi(e, t) {
  const n = gs[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Pe.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = hs.includes(e.type) ? ` Q ${oe(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const gs = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function tn(e, { kilo: t = !1 } = {}) {
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
        frequency_hz: oe(ee(at(r.frequency_hz, s.frequency_hz), xe, Rn(o)), 1),
        gain_db: oe(ee(at(r.gain_db, s.gain_db), -ze, ze), 1),
        q: oe(ee(at(r.q, s.q), io[0], io[1]), 3),
        slope: oe(ee(at(r.slope, s.slope), ao[0], ao[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function ho(e, t) {
  return xt(e, t, { gain_db: 0 });
}
function mo(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((p) => Number.isFinite(p));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), c = e.height - 4, l = c - Math.max(12, e.height * ee(o, 0.1, 0.95));
  return `M${t.map((p, h) => {
    const g = n[h], x = Number.isFinite(g) ? (g - i) / a : 0;
    return `${Se(e, p).toFixed(1)},${(c - x * (c - l)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${c.toFixed(1)} L0,${c.toFixed(1)} Z`;
}
class zi {
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
    Te(t) !== Te(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Bi = "http://www.w3.org/2000/svg", go = "plenio_eq_panel", ct = "mode.bands", me = { capture: !0 }, ie = { width: 560, height: 260 }, lt = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let nn = null;
function de(e, t) {
  const n = document.createElementNS(Bi, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function X(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function _e(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function fe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Di(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function Hi(e, t) {
  const n = X("div", "plenio-eq"), o = X("div", "plenio-eq-tools"), s = X("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = X("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const f of co) r.append(new Option(`±${f} dB`, String(f)));
  const i = _e("", "↶", "Undo the last band change"), a = _e("", "↷", "Redo the last band change"), c = _e("", "reset", "Remove every band"), l = _e("", "compare", "Show the curve without the EQ (bypass)"), d = _e("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), p = X("span", "plenio-eq-info");
  p.setAttribute("aria-live", "polite"), p.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, c, l, d, p);
  const h = X("div", "plenio-eq-mode"), g = de("svg", {
    viewBox: `0 0 ${ie.width} ${ie.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  g.setAttribute("aria-label", "EQ response curve"), g.setAttribute("tabindex", "0"), g.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const x = X("div", "plenio-eq-strip"), S = X("div", "plenio-eq-editor"), T = X("div", "plenio-eq-fields");
  S.append(T), n.append(o, h, g, x, S);
  const j = e.addDOMWidget(go, go, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  let u = { sampleRate: 48e3, frequencies: [], response: [], settings: Ce(), readonly: !0, note: "" }, k = null, L = null, b = !1, v = 12, M = null, y = [], E = 0, _, C, O = null, q = !1;
  const F = /* @__PURE__ */ new Map();
  let Y = null;
  const D = new zi(Ce()), Z = () => fe(e, ct), G = () => v, I = () => Pi({ ...ie, maxHz: Math.min(2e4, u.sampleRate / 2) }, G());
  function R(f, { record: w = !0 } = {}) {
    const m = Z();
    if (!m) return;
    const $ = Te(f);
    m.value = $, m.callback?.($), w && D.push(f), u = { ...u, settings: f }, Q(), W(0);
  }
  async function W(f = 120) {
    clearTimeout(_), _ = setTimeout(async () => {
      const w = String(fe(e, "mode")?.value ?? "flat");
      if (w !== "manual") {
        w === "flat" ? u = {
          ...u,
          settings: Ce(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : k !== w ? u = {
          ...u,
          settings: Ce(),
          response: u.frequencies.map(() => 0),
          readonly: !0,
          note: `${w}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : u = { ...u, readonly: !0 }, Q();
        return;
      }
      const m = Oi(Z()?.value);
      if (!m) {
        u = { ...u, readonly: !0, note: "the bands are not valid JSON" }, Q();
        return;
      }
      Te(m) !== Te(D.current) && D.reset(m);
      const $ = ++E;
      try {
        const N = await Vn(t, m, u.sampleRate);
        if ($ !== E) return;
        u = {
          ...u,
          frequencies: N.frequency_hz,
          response: N.response_db,
          settings: N.settings,
          readonly: !1,
          note: ""
        };
      } catch (N) {
        u = { ...u, readonly: !1, note: N instanceof Error ? N.message : String(N) };
      }
      Q();
    }, f);
  }
  const tt = (f) => ({
    ...f.settings,
    bands: f.settings.bands.slice(0, vt)
  });
  function De() {
    if (!M) return "";
    const f = y.find((w) => w.name === M);
    return f && Di(tt(f), u.settings) ? M : "";
  }
  function Q() {
    g.replaceChildren(), F.clear(), Y = null;
    const f = I();
    for (const m of [-f.db, -f.db / 2, 0, f.db / 2, f.db])
      g.append(
        de("line", { x1: 0, x2: f.width, y1: ye(f, m), y2: ye(f, m), class: m ? "grid" : "grid zero" })
      );
    for (const m of [100, 1e3, 1e4])
      g.append(de("line", { x1: Se(f, m), x2: Se(f, m), y1: 0, y2: f.height, class: "grid" }));
    u.beforeDb?.length === u.frequencies.length && g.append(de("path", { d: mo(f, u.frequencies, u.beforeDb), class: "spectrum before" })), u.afterDb?.length === u.frequencies.length && g.append(de("path", { d: mo(f, u.frequencies, u.afterDb), class: "spectrum after" })), b ? g.append(de("line", { x1: 0, x2: f.width, y1: ye(f, 0), y2: ye(f, 0), class: "curve flat" })) : u.frequencies.length && (Y = de("path", { d: po(f, u.frequencies, u.response), class: "curve" }), g.append(Y)), !u.readonly && !b && u.settings.bands.forEach((m, $) => {
      const N = lt[$ % lt.length], z = Pe.includes(m.type) ? m.gain_db : 0, A = de("circle", {
        cx: Se(f, m.frequency_hz),
        cy: ye(f, z),
        r: m.id === L ? 9 : 7,
        class: m.id === L ? "handle selected" : "handle",
        style: `stroke: ${N}`,
        tabindex: 0,
        "data-band": m.id
      });
      A.setAttribute("aria-label", `Band ${$ + 1}: ${Fe(m)}`), m.enabled || A.classList.add("disabled"), A.append(de("title", {})), A.lastChild.textContent = `Band ${$ + 1}: ${Fe(m)}`, A.addEventListener("pointerdown", (H) => ar(H, m.id)), A.addEventListener("dblclick", (H) => {
        H.stopPropagation(), R(ho(u.settings, m.id));
      }), A.addEventListener("focus", () => he(m.id)), A.addEventListener("keydown", (H) => Fn(H, m.id)), A.addEventListener("wheel", (H) => {
        H.preventDefault();
        const ke = H.deltaY < 0 ? 1.15 : 1 / 1.15;
        R(Zt(u.settings, m.id, ke));
      }), A.addEventListener("contextmenu", (H) => {
        H.preventDefault(), R(en(u.settings, m.id));
      }), g.append(A), F.set(m.id, A);
    }), Bt(), Le(), Dt();
    const w = u.settings.bands.find((m) => m.id === L);
    p.textContent = u.note || (b ? "compare: the curve is off (the node still applies it)" : w ? Fe(w) : u.readonly ? `${u.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${u.settings.bands.length}/${vt}`), s.disabled = u.readonly, i.disabled = !D.canUndo, a.disabled = !D.canRedo, c.disabled = u.readonly || !u.settings.bands.length, q && (q = !1, L && F.get(L)?.focus({ preventScroll: !0 })), r.value = String(v), s.value = De(), l.classList.toggle("active", b), d.classList.toggle("active", Wt()), e.setDirtyCanvas?.(!0, !0);
  }
  function Bt() {
    if (x.replaceChildren(), u.readonly && !u.settings.bands.length) {
      x.append(X("span", "plenio-eq-hint", u.note || "no bands"));
      return;
    }
    u.settings.bands.forEach((f, w) => {
      const m = X("button", "plenio-eq-chip", qi(f, w));
      m.style.borderLeftColor = lt[w % lt.length], m.classList.toggle("selected", f.id === L), m.classList.toggle("disabled", !f.enabled), m.setAttribute("aria-label", `Edit band ${w + 1}`), m.title = `Band ${w + 1}: ${Fe(f)} - click to open its fields`, m.addEventListener("click", ($) => {
        $.stopPropagation(), L = L === f.id ? null : f.id, Q();
      }), x.append(m);
    });
  }
  function Le() {
    T.replaceChildren();
    const f = u.settings.bands.find((A) => A.id === L);
    if (!f || u.readonly) {
      S.style.display = "none";
      return;
    }
    S.style.display = "";
    const w = X("span", "name", `Band ${u.settings.bands.indexOf(f) + 1}`);
    w.title = "The selected band";
    const m = X("select");
    m.setAttribute("aria-label", "Band type"), m.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [A, H] of Object.entries(gs)) m.append(new Option(H, A));
    m.value = f.type, m.addEventListener("change", () => R(xt(u.settings, f.id, { type: m.value })));
    const $ = X("input");
    $.type = "checkbox", $.checked = f.enabled, $.setAttribute("aria-label", "Band enabled"), $.title = "Band enabled: off keeps the band in the list but out of the response", $.addEventListener("change", () => R(xt(u.settings, f.id, { enabled: $.checked })));
    const N = [
      [
        "Hz",
        `${f.frequency_hz}`,
        70,
        (A) => Gt(f.id, "frequency_hz", tn(A, { kilo: !0 }))
      ],
      ["dB", `${f.gain_db}`, 60, (A) => Gt(f.id, "gain_db", tn(A))],
      ["Q", `${f.q}`, 60, (A) => Gt(f.id, "q", tn(A))]
    ];
    T.append(w, m, $);
    for (const [A, H, ke, nt] of N) {
      const te = X("input", "number");
      te.value = H, te.style.width = `${ke}px`, te.setAttribute("aria-label", `Band ${A}`), te.title = A === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : A === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const ot = () => {
        nt(te.value) || (te.value = H);
      };
      te.addEventListener("keydown", (ue) => {
        ue.key === "Enter" && ot();
      }), te.addEventListener("blur", ot), (A === "dB" && !Pe.includes(f.type) || A === "Q" && !hs.includes(f.type)) && (te.disabled = !0), T.append(te);
    }
    const z = _e("", "remove", "Remove this band");
    z.addEventListener("click", (A) => {
      A.stopPropagation(), L = null, R(en(u.settings, f.id));
    }), T.append(z);
  }
  function Dt() {
    h.replaceChildren();
    const f = String(fe(e, "mode")?.value ?? "flat");
    if (f === "manual" || f === "flat") {
      h.style.display = "none";
      return;
    }
    h.style.display = "", h.append(
      X(
        "span",
        "plenio-eq-hint",
        k === f ? `applied proposal (${u.settings.bands.length} band(s), ${f})` : `${f}: no proposal yet - it is computed on the next run`
      )
    );
    const w = _e("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    w.disabled = !u.settings.bands.length, w.addEventListener("click", (m) => {
      m.stopPropagation();
      const $ = fe(e, "mode");
      if (!$) return;
      $.value = "manual", $.callback?.("manual");
      const N = Z();
      if (N) {
        const z = Te(u.settings);
        N.value = z, N.callback?.(z);
      }
      D.reset(u.settings), Vt(), W(0);
    }), h.append(w);
  }
  function he(f) {
    L = f, q = !0, Q();
  }
  function Ht(f) {
    L = f, Ft();
  }
  function Ft() {
    const f = I();
    u.settings.bands.forEach((m) => {
      const $ = F.get(m.id);
      if (!$) return;
      const N = Pe.includes(m.type) ? m.gain_db : 0;
      $.setAttribute("cx", String(Se(f, m.frequency_hz))), $.setAttribute("cy", String(ye(f, N))), $.classList.toggle("selected", m.id === L), $.setAttribute("r", m.id === L ? "9" : "7");
    }), Y && u.frequencies.length && Y.setAttribute("d", po(f, u.frequencies, u.response));
    const w = u.settings.bands.find((m) => m.id === L);
    w && (p.textContent = Fe(w));
  }
  function ir() {
    clearTimeout(C), C = setTimeout(async () => {
      const f = u.settings, w = ++E;
      try {
        const m = await Vn(t, f, u.sampleRate);
        if (w !== E) return;
        u = { ...u, frequencies: m.frequency_hz, response: m.response_db }, Ft();
      } catch {
      }
    }, 60);
  }
  function Wt() {
    return !fe(e, ct)?.plenioHidden;
  }
  function jt(f) {
    const w = fe(e, ct);
    w && (w.plenioHidden = !f, f ? delete w.computeSize : w.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Gt(f, w, m) {
    if (m === null) return !1;
    const $ = u.settings.bands.find((N) => N.id === f);
    return $ && $[w] === m || R(xt(u.settings, f, { [w]: m })), !0;
  }
  function ar(f, w) {
    f.preventDefault(), f.stopPropagation(), L !== w && Ht(w);
    const m = u.settings.bands.find((se) => se.id === w);
    if (!m) return;
    O = { hz: m.frequency_hz, db: m.gain_db };
    let $ = !1, N = !1;
    const z = f.currentTarget;
    try {
      z?.setPointerCapture?.(f.pointerId);
    } catch {
    }
    const A = g.getBoundingClientRect(), H = A.width ? A.left : 0, ke = A.height ? A.top : 0, nt = A.width || ie.width, te = A.height || ie.height, ot = (se, st) => se >= H - 1 && se <= H + nt + 1 && st >= ke - 1 && st <= ke + te + 1;
    function ue() {
      if (!N) {
        N = !0;
        try {
          z?.releasePointerCapture?.(f.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Gn, me), window.removeEventListener("pointerup", ue, me), window.removeEventListener("pointercancel", ue, me), window.removeEventListener("blur", ue, me), O = null, $ && R(u.settings);
      }
    }
    const Gn = (se) => {
      if (N || !O) return;
      if (se.buttons === 0) {
        ue();
        return;
      }
      if (!ot(se.clientX, se.clientY)) return;
      const st = ie.width / nt, lr = ie.height / te, ur = (se.clientX - H) * st, dr = (se.clientY - ke) * lr, fr = Se(I(), O.hz), pr = ye(I(), O.db), hr = lo(I(), fo(fr, ur, se.shiftKey)), mr = uo(I(), fo(pr, dr, se.shiftKey));
      u = { ...u, settings: He(u.settings, w, hr, mr, u.sampleRate) }, $ = !0, Ft(), ir();
    };
    window.addEventListener("pointermove", Gn, me), window.addEventListener("pointerup", ue, me), window.addEventListener("pointercancel", ue, me), window.addEventListener("blur", ue, me);
  }
  function Fn(f, w) {
    const m = u.settings.bands.find((A) => A.id === w);
    if (!m) return;
    const $ = f.shiftKey ? 0.1 : 0.5, N = f.shiftKey ? 1.01 : 1.06;
    let z = null;
    f.key === "ArrowUp" ? z = He(u.settings, w, m.frequency_hz, m.gain_db + $, u.sampleRate) : f.key === "ArrowDown" ? z = He(u.settings, w, m.frequency_hz, m.gain_db - $, u.sampleRate) : f.key === "ArrowRight" ? z = He(u.settings, w, m.frequency_hz * N, m.gain_db, u.sampleRate) : f.key === "ArrowLeft" ? z = He(u.settings, w, m.frequency_hz / N, m.gain_db, u.sampleRate) : f.key === "+" ? z = Zt(u.settings, w, 1.15) : f.key === "-" ? z = Zt(u.settings, w, 1 / 1.15) : f.key === "0" ? z = ho(u.settings, w) : (f.key === "Delete" || f.key === "Backspace") && (z = en(u.settings, w)), z && (f.preventDefault(), R(z));
  }
  g.addEventListener("keydown", (f) => {
    L && f.target === g && Fn(f, L);
  }), g.addEventListener("dblclick", (f) => {
    if (u.readonly || b) return;
    const w = g.getBoundingClientRect(), m = ie.width / (w.width || ie.width), $ = ie.height / (w.height || ie.height), N = (f.clientX - w.left) * m, z = (f.clientY - w.top) * $, A = Ri(u.settings, lo(I(), N), uo(I(), z), u.sampleRate);
    A ? (L = A.bands[A.bands.length - 1].id, R(A)) : (u = { ...u, note: `the EQ has at most ${vt} bands` }, Q());
  }), s.append(new Option("preset…", "")), nn ??= br(t).then((f) => f.manual).catch(() => []), nn.then((f) => {
    y = f;
    for (const w of f) s.append(new Option(w.name, w.name));
    s.value = De();
  }), s.addEventListener("change", async () => {
    const f = (await nn)?.find((w) => w.name === s.value);
    f && (M = f.name, R(tt(f)));
  }), r.addEventListener("change", () => {
    const f = Number(r.value);
    v = co.find((w) => w === f) ?? 12, Q();
  }), i.addEventListener("click", () => {
    const f = D.undo();
    f && R(f, { record: !1 });
  }), a.addEventListener("click", () => {
    const f = D.redo();
    f && R(f, { record: !1 });
  }), c.addEventListener("click", () => {
    L = null, R(Ce());
  }), l.addEventListener("click", () => {
    b = !b, Q();
  }), d.addEventListener("click", () => {
    jt(!Wt()), Q();
  });
  function Vt() {
    for (const f of ["mode", ct]) {
      const w = fe(e, f);
      if (!w || w.plenioWatched) continue;
      w.plenioWatched = !0;
      const m = w.callback;
      w.callback = ($) => {
        m?.($), setTimeout(() => {
          Wt() || jt(!1), W();
        });
      };
    }
  }
  Vt(), jt(!1), W(0);
  let Wn = null, jn = null;
  const cr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(cr);
      return;
    }
    const f = String(fe(e, "mode")?.value ?? "flat"), w = String(Z()?.value ?? "");
    f === Wn && w === jn || (Wn = f, jn = w, Vt(), W(0));
  }, 700);
  return {
    showExecuted(f) {
      const w = f?.plenio_eq, m = w?.[w.length - 1];
      if (!m) return;
      const $ = String(fe(e, "mode")?.value ?? "flat"), N = $ === "manual";
      k = N || $ === "flat" ? null : $, u = {
        sampleRate: m.sample_rate,
        frequencies: m.frequency_hz,
        response: m.response_db,
        settings: m.settings,
        readonly: !N,
        note: N ? "" : `applied: ${m.settings.bands.length} band(s)`,
        beforeDb: m.spectrum_before_db,
        afterDb: m.spectrum_after_db
      }, N ? W(0) : Q();
    }
  };
}
const qn = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Fi = new Set(Pt.map((e) => On[e]));
function Wi(e, t) {
  return !(e in qn) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => Fi.has(n) && rs(o)).map(([n]) => n);
}
const wo = ["written from the idea below", "my own, sung as written below"], ws = 7, on = ws + 4;
function ji(e) {
  return !["sung", "sparse vocals"].includes(String(e[ws])) || wo.includes(e[on]) ? e : [...e.slice(0, on), wo[0], "", ...e.slice(on)];
}
function Gi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const Vi = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function Ui(e, t) {
  const n = Vi[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
const yo = 6, Yi = 8, Xi = 18;
function Ki(e) {
  if (e[yo] !== "tags" || e.length > Xi) return e;
  const t = yo + 1 + Yi;
  return [...e.slice(0, t), "", ...e.slice(t)];
}
function Qi(e, t) {
  if (e.name === "PlenioExportRelease" && t && Array.isArray(t.widgets_values)) {
    const c = Ki(t.widgets_values);
    return c === t.widgets_values ? t : { ...t, widgets_values: c };
  }
  const n = qn[e.name];
  if (!n || !t) return t;
  const o = Gi(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = Wi(e.name, i.widgets_values_named);
  if (a.length) {
    const c = { ...i.widgets_values_named };
    for (const l of a) c[l] = "";
    i = { ...i, widgets_values_named: c };
  }
  if (e.name === "PlenioSongBrief" && Array.isArray(i.widgets_values)) {
    const c = ji(i.widgets_values);
    c !== i.widgets_values && (i = { ...i, widgets_values: c });
  }
  return i;
}
const Ye = "PlenioModelChoice", Ji = "plenio.models_missing", sn = "auto", bo = "component.file";
function Zi(e) {
  return e.replace(/\.(safetensors|ckpt|bin|gguf|pt|pth)$/i, "");
}
function ea(e) {
  return (e.includes(": ") ? e.slice(e.indexOf(": ") + 2) : e).split(",")[0].trim();
}
function ta(e, t) {
  const n = String(e ?? "");
  if (n === sn) {
    const s = t?.pick;
    if (!s?.file) return sn;
    const r = s.source === "config" ? "pinned in config.toml" : ea(s.reason);
    return `${sn} · ${Zi(s.file)} · ${r}${s.installed ? "" : " · to download"}`;
  }
  const o = t?.files?.[n];
  return o ? `${n} · does not fit: ${o}` : n;
}
function na(e) {
  const t = e.file || "a model file", n = e.folder ? `models/${e.folder}` : "its model folder", o = e.url ? `Download it from ${e.url} into ${n}, then run again.` : `It is a file of your own: put it into ${n}, or set the field to auto.`;
  return { summary: `Model missing: ${t}`, detail: o };
}
function vo(e) {
  return String(e.widgets?.find((t) => t.name === "component")?.value ?? "");
}
function xo(e, t) {
  e.options = { ...e.options, getOptionLabel: (n) => ta(n, t()) };
}
async function oa(e) {
  try {
    const t = await e.fetchApi("/plenio/models/files");
    return t.ok ? (await t.json()).components ?? {} : {};
  } catch {
    return {};
  }
}
class sa {
  constructor(t) {
    this.fetcher = t;
  }
  fetcher;
  files = {};
  info(t) {
    return this.files[t];
  }
  async refresh() {
    this.files = await oa(this.fetcher);
  }
  /** The node's file field shows the labels of its current component (its child widget is made anew when the
   * component changes: called again then). */
  label(t) {
    const n = t.widgets?.find((o) => o.name === bo);
    n && xo(n, () => this.info(vo(t)));
  }
  /** A block's promoted fields that show a Model Choice inside it: the field whose list is that node's list. */
  labelBlock(t) {
    const n = (t.subgraph?.nodes ?? []).filter((s) => s.type === Ye || s.comfyClass === Ye), o = /* @__PURE__ */ new Set();
    for (const s of n) {
      const i = s.widgets?.find((l) => l.name === bo)?.options?.values;
      if (!Array.isArray(i)) continue;
      const a = (t.widgets ?? []).find(
        (l) => !o.has(l) && l.type === "combo" && ra(l.options?.values, i)
      );
      if (!a) continue;
      o.add(a);
      const c = vo(s);
      xo(a, () => this.info(c));
    }
  }
}
function ra(e, t) {
  return Array.isArray(e) && e.length === t.length && e.every((n, o) => n === t[o]);
}
const ys = /* @__PURE__ */ new Map(), bn = /* @__PURE__ */ new Set();
function ko(e, t) {
  ys.set(e, t);
  for (const n of bn) n(e);
}
function Ne(e) {
  return ys.get(e) ?? null;
}
function ia(e) {
  return bn.add(e), () => bn.delete(e);
}
const bs = /* @__PURE__ */ new Map();
function aa(e) {
  e?.draft_sha256 && bs.set(e.draft_sha256, e);
}
function ca(e) {
  return e ? bs.get(e) ?? null : null;
}
const _o = "Plenio.OpenPlayer", So = "plenio-player", la = "▶ Open in the Plenio Player";
function vn(e, t, n, o, s = 12e3) {
  e.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function ua(e) {
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
function Mo(e, t) {
  const n = e.endsWith("/") ? e : `${e}/`;
  return t ? `${n}#/record/${encodeURIComponent(t)}` : `${n}#/`;
}
async function xn(e, t = null, n = window) {
  const o = n.open("", So);
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
    const r = await ua(e.fetcher);
    o ? ((s || t) && (o.location.href = Mo(r.url, t)), o.focus()) : n.open(Mo(r.url, t), So), r.started && vn(e.app, "success", "Plenio Player started", `${r.url} - it keeps running when ComfyUI stops; stop it on its Settings page.`);
  } catch (r) {
    o && s && o.close();
    const i = r instanceof J && r.hint ? ` ${r.hint}` : "";
    vn(e.app, "error", "Plenio Player", `${r instanceof Error ? r.message : String(r)}${i}`, 2e4);
  }
}
function da(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this);
    const i = this.addWidget?.("button", la, null, () => {
      xn(t, n.get(this) ?? null);
    }, { serialize: !1 });
    i && (i.serialize = !1);
  }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
    const i = r?.plenio_player, a = i?.[i.length - 1]?.record;
    a && n.set(this, a);
  });
}
const fa = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
function pa(e, t) {
  if (e === t) return !0;
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? !1 : fa.has(n.hostname) || n.hostname === new URL(t).hostname;
  } catch {
    return !1;
  }
}
function ha(e, t = window, n = 1500) {
  const o = new URLSearchParams(t.location.search);
  if (o.get("plenio") !== "continue") return !1;
  o.delete("plenio");
  const s = o.toString();
  t.history.replaceState(t.history.state, "", `${t.location.pathname}${s ? `?${s}` : ""}${t.location.hash}`);
  const r = t.opener;
  if (!r) return !0;
  const i = (a) => {
    const c = a.data;
    c?.type !== "plenio-continue" || a.source !== r || !pa(a.origin, t.location.origin) || (t.removeEventListener("message", i), $t(e, { record: c.record, name: String(c.name || "the Plenio Player") }).catch((l) => {
      const d = l instanceof J && l.hint ? ` ${l.hint}` : "";
      vn(e.app, "error", "Continue a song", `${l instanceof Error ? l.message : String(l)}${d}`, 2e4);
    }));
  };
  return t.addEventListener("message", i), t.setTimeout(() => r.postMessage({ type: "plenio-ready" }, "*"), n), !0;
}
const ma = {
  "one song, stop to review": "new song every run",
  "one cover, stop to review": "new cover every run"
}, ga = 2e3, wa = 3e4;
function ya(e, t, n, o) {
  const s = ma[t];
  return !s || n <= 0 && o <= 1 ? null : {
    summary: "These runs stop for your review",
    detail: `${e}: "${t}" - each run waits at the Song Sheets until you press Approve, so queued runs render nothing by themselves. For runs that go through, choose "${s}" in the brief's mode.`
  };
}
class ba {
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
    this.recent = [...this.recent.filter((r) => o - r < ga), o];
    const s = ya(t, n, this.queued, this.recent.length);
    !s || o - this.lastNotice < wa || (this.lastNotice = o, this.notify(s));
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
const rn = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function va(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function xa(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function vs(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function ka(e) {
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
const At = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new Set();
function xs(e) {
  return At.get(e) ?? null;
}
function Ie(e, t) {
  t ? At.set(e, t) : At.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Xe) n(e);
}
function _a(e) {
  for (const t of e) At.delete(t);
  for (const t of Xe) t(null);
}
function Sa() {
  for (const e of Xe) e(null);
}
function Ma(e) {
  return Xe.add(e), () => Xe.delete(e);
}
const Eo = "600 12px sans-serif", ut = 20, an = 7;
function Ea(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function $a(e) {
  const t = e ? Ea(e) : "";
  return {
    height: e ? ut : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = Eo;
      const o = n.measureText(t).width + 2 * an;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = Eo;
      const r = n.measureText(t).width + 2 * an;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, ut, 5) : n.rect(o, s, r, ut), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + an, s + ut / 2 + 0.5), n.restore();
    }
  };
}
const Aa = "PlenioSongSheet", La = 30;
function ks(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function Na(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? ks(n, "mode") : null;
  } catch {
    return null;
  }
}
function kn(e) {
  const t = xs(e);
  return t || (e.type !== Aa ? null : xa(ks(e, "review") ?? "continue", Na(e)) ? "stop" : null);
}
function Ca(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return vs(n);
  const o = e?.plenio_summary;
  return va(o?.[o.length - 1]?.status);
}
function Oa(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = kn(s);
      return $a(r ? rn[r] : null);
    });
  }, n.onDrawForeground = U(n.onDrawForeground, function(s) {
    const r = kn(this);
    !r || !rn[r].frame || this.flags?.collapsed || !this.size || Ta(s, rn[r], this.size, La, t.scale());
  }), n.onExecuted = U(n.onExecuted, function(s) {
    const r = Ca(s);
    r && (Ie(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      "Waiting for your approval: open it with its Edit button, check the documents, press Approve, then run again."
    ));
  });
}
function Ta(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function Su(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, c = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: c, source: a }), o += c;
  }), n;
}
function _s(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + ne) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Ae(e, t) {
  const n = _s(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function Pa(e, t) {
  const n = _s(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function Mu(e, t, n) {
  const o = Ae(e, t), s = n == null ? 1 / 0 : Ae(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, c = Math.max(i.realStart, o), l = Math.min(a, s);
    if (l <= c + ne) continue;
    let d = i.source[0] + (c - i.realStart) / i.realDur * (i.source[1] - i.source[0]), p = c - o, h = l - c;
    if (d < 0 && (p -= d, h += d, d = 0, h <= ne))
      continue;
    const g = r.at(-1);
    g && Math.abs(g.at + g.duration - p) < ne && Math.abs(g.offset + g.duration - d) < 0.01 ? g.duration += h : r.push({ at: p, offset: d, duration: h });
  }
  return r;
}
const Ss = 0.04, ne = 1e-3, Ia = 0.25, Ra = 2;
function Lt(e) {
  return Math.min(Ra, Math.max(Ia, Number.isFinite(e) ? e : 1));
}
function Eu(e, t) {
  const n = Lt(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Ae(r, t.from) : t.from, a = (c) => (r ? Ae(r, c) : c) - i;
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
          duration: Ss,
          midi: d === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((c, l) => c.at - l.at || c.midi - l.midi);
}
function $u(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Ae(o, n) - Ae(o, t.from) : n - t.from;
  return Math.max(0, s) / Lt(t.speed);
}
function Au(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, c = i > 0 ? Math.floor(a / i + 1e-6) : 0, l = i > 0 ? (a - c * i) / i * r : 0, d = l > 1e-3 ? 0 : 1, p = Math.max(0, o * t);
  return Array.from({ length: p }, (h, g) => {
    const x = d + p - 1 - g, S = ((c - x) % t + t) % t === 0;
    return { at: Math.max(0, s - l - x * r), duration: Ss, midi: S ? 96 : 89, part: "click" };
  });
}
function Lu(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? Pa(n, Ae(n, e.from) + t * Lt(e.speed)) : e.from + t * Lt(e.speed);
}
function Nu(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + ne && t < o.start_s + o.duration_s - ne
  ).map((o) => o.id);
}
function qa(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const za = [
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
], Cu = {
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
  return typeof e == "string" && za.includes(e);
}
function Ms() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Ba(e) {
  const t = Ms(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: dt(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: dt(n.Ins) ? n.Ins : t.Ins,
    chord: dt(n.chord) ? n.chord : t.chord,
    guide: dt(n.guide) ? n.guide : t.guide
  };
}
const Da = {
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
}, $o = /* @__PURE__ */ new WeakMap();
function cn(e, t, n) {
  let o = $o.get(e);
  o || $o.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, c) => i[c + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const Ao = /* @__PURE__ */ new WeakMap();
function Es(e) {
  let t = Ao.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    Ao.set(e, t);
  }
  return t;
}
function P(e, t, n, o = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = o, s;
}
function ge(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ae(e, t, n, o = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = o, s;
}
function We(e, t, n, o, s, r) {
  const i = P(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const c of t) a.connect(c.detune);
  return i;
}
function ln(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = Es(e);
  const a = ae(e, "bandpass", o, 1.2), c = e.createGain();
  return c.gain.setValueAtTime(s, n), c.gain.setTargetAtTime(0, n, r), i.connect(a).connect(c).connect(t), i;
}
const kt = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), Lo = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [No(P(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [No(P(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = cn(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ae(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, kt(r, 0.35)), a.connect(t);
      const c = P(e, i, n, -1.5), l = P(e, i, n, 1.5), d = ge(e, 0.5);
      c.connect(d), l.connect(d), d.connect(a);
      const p = ln(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [c, l, p];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = P(e, "sine", n), a = P(e, "sine", n), c = e.createGain(), l = n * (1.2 + 2.2 * s);
      c.gain.setValueAtTime(l, o), c.gain.setTargetAtTime(n * 0.25, o, kt(r, 0.25)), a.connect(c).connect(i.frequency);
      const d = ae(e, "highpass", 25, 0.7);
      d.connect(t);
      const p = P(e, "sine", n * 4), h = e.createGain();
      return h.gain.setValueAtTime(0.18 * s, o), h.gain.setTargetAtTime(0, o, 0.06), p.connect(h).connect(d), i.connect(d), [i, a, p];
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
      const r = [-9, 0, 8].map((a) => P(e, "sawtooth", n, a));
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
      const i = P(e, "sine", 0.25), a = ge(e, s * 0.3);
      i.connect(a).connect(r.frequency);
      const c = [P(e, "sawtooth", n, -12), P(e, "sawtooth", n, 11), P(e, "triangle", n / 2)];
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
      const s = cn(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = P(e, s, n), i = P(e, "sine", n / 2), a = ge(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const c = We(e, [r, i], o, 6.6, 4, 0), l = ln(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, c, l];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = cn(e, "flute", [1, 0.13, 0.06, 0.02]), r = P(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = Es(e), i.loop = !0;
      const a = ae(e, "bandpass", Math.min(n * 2, 8e3), 1.5), c = ge(e, 0.06);
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
      const s = P(e, "sawtooth", n), r = ae(e, "lowpass", 5e3, 0.5);
      s.connect(r);
      for (const [c, l, d] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const p = ae(e, "bandpass", c, l), h = ge(e, d);
        r.connect(p).connect(h).connect(t);
      }
      const i = ge(e, 0.15);
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
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, kt(r, 0.12)), i.connect(t);
      const a = P(e, "sawtooth", n), c = P(e, "triangle", n, 4);
      a.connect(i), c.connect(i);
      const l = ln(e, t, o, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
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
      const r = P(e, "square", n), i = P(e, "sawtooth", n, 6);
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
      const s = P(e, "sine", n), r = P(e, "triangle", n), i = ge(e, 0.5);
      s.connect(t), r.connect(i).connect(t);
      const a = P(e, "sawtooth", n), c = ae(e, "lowpass", Math.min(n * 6, 2500), 1);
      c.frequency.setTargetAtTime(n * 2, o + 0.01, 0.12);
      const l = ge(e, 0.25);
      return a.connect(c).connect(l).connect(t), [s, r, a];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(e, t, n, o, s, r) {
      const i = P(e, "sine", n), a = P(e, "sine", n * 3.5), c = e.createGain();
      return c.gain.setValueAtTime(n * (1 + 1.5 * s), o), c.gain.setTargetAtTime(0, o, 0.05), a.connect(c).connect(i.frequency), i.connect(t), [i, a];
    }
  }
};
function No(e, t) {
  return e.connect(t), e;
}
function Ou(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = Lo[n] ?? Lo.plain, c = qa(o), l = a.sustain === 0 ? kt(o, a.decay) : a.decay, d = i * Da[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), p = e.createGain();
  p.gain.setValueAtTime(0, s), p.gain.linearRampToValueAtTime(d, s + a.attack), p.gain.setTargetAtTime(d * a.sustain, s + a.attack, l), p.connect(t);
  const h = a.build(e, p, c, s, r, o);
  for (const T of h) T.start(s);
  let g = !1, x = !1;
  const S = (T) => {
    for (const j of h)
      try {
        j.stop(T);
      } catch {
      }
  };
  return h[0].onended = () => {
    x = !0, p.disconnect();
  }, a.sustain === 0 && S(s + a.attack + l * 7), {
    release(T) {
      if (g || x) return;
      g = !0;
      const j = Math.max(T, s + a.attack);
      p.gain.setTargetAtTime(0, j, a.release), S(j + a.release * 7);
    },
    stop() {
      if (x) return;
      x = !0, g = !0;
      const T = e.currentTime;
      try {
        p.gain.cancelScheduledValues(T), p.gain.setValueAtTime(0, T);
      } catch {
      }
      S(T), p.disconnect();
    }
  };
}
function Ha(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function Be(e, t) {
  return `${e}:${t}`;
}
function Fa(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { block: Number(t[1]), line: Number(t[2]) } : null;
}
const Wa = 512;
function qt(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length === 3 || n.length < 2 || n.length > 4 + Wa || !n.every((a) => Number.isInteger(a) && a >= 0)) continue;
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
function ja(e, t) {
  return e.length === t.length && e.every((n, o) => n.length === t[o].length && n.every((s, r) => s === t[o][r]));
}
function $s(e, t) {
  return e.parts.find((n) => n.block === t);
}
function As(e, t) {
  return e.parts.find((n) => t >= n.start && t < n.end);
}
function zt(e) {
  return e.syllables.length > 0 || e.pinned;
}
function Ls(e, t, n) {
  let o = 0, s = n;
  for (const r of e.parts) {
    const i = r.lines.filter(zt);
    !i.length || r.block === t || (r.block < t ? o = Math.max(o, ...i.map((a) => Math.max(a.end, a.start + 1))) : s = Math.min(s, ...i.map((a) => a.start)));
  }
  return [o, Math.max(s, o + 1)];
}
function Ga(e, t, n, o, s) {
  const r = $s(e, t), [i, a] = o, c = new Map((r?.lines ?? []).map((p) => [p.line, p])), l = [];
  let d = r ? Math.max(r.start, i) : i;
  return n.forEach((p, h) => {
    const g = c.get(h);
    if (g && zt(g)) {
      const x = Math.min(Math.max(g.start, i), a - 1), S = Math.min(Math.max(g.end, x + 1), a);
      l.push({ id: String(h), text: p, start: x, end: S }), d = S;
    } else {
      const x = Math.min(Math.max(d, i), a);
      l.push({ id: String(h), text: p, start: x, end: x });
    }
  }), l;
}
function Va(e, t) {
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
function zn(e) {
  return (e?.parts ?? []).flatMap(
    (t) => t.lines.filter((n) => zt(n) && n.end > n.start).map((n) => ({ key: Be(n.block, n.line), block: n.block, line: n.line, start: n.start, end: n.end, text: n.text }))
  ).sort((t, n) => t.start - n.start || t.block - n.block || t.line - n.line);
}
function Ua(e, t, n = /* @__PURE__ */ new Set()) {
  for (const o of t) {
    const s = e.find((r) => !n.has(r.key) && r.start < o.end && o.start < r.end);
    if (s) return s;
  }
  return null;
}
function Ya(e, t, n, o = 1) {
  const s = e.parts.flatMap((u) => u.lines.map((k) => ({ ...k, key: Be(k.block, k.line) }))), r = t.kind === "move" ? new Set(t.keys) : /* @__PURE__ */ new Set([t.key]), i = s.filter((u) => r.has(u.key) && u.text).map((u) => ({ key: u.key, block: u.block, start: u.start, end: u.end > u.start ? u.end : Math.min(n, u.start + Math.max(1, o)) })), a = zn(e).filter((u) => !r.has(u.key)), c = { moves: [], free: !0, stoppedAt: null };
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
      const E = a.filter((q) => q.start >= u.start).sort((q, F) => q.start - F.start)[0], _ = Math.min(L, E ? E.start : n), C = u.end + t.delta, O = Math.max(u.start + 1, Math.min(C, _));
      return { moves: [{ key: u.key, start: u.start, end: O }], free: O === C, stoppedAt: C > _ && E && E.start === _ ? E : null };
    }
    const b = a.filter((E) => E.end <= u.end).sort((E, _) => _.end - E.end)[0], v = Math.max(k, b ? b.end : 0), M = u.start + t.delta, y = Math.min(u.end - 1, Math.max(M, v));
    return {
      moves: [{ key: u.key, start: y, end: u.end }],
      free: y === M,
      stoppedAt: M < v && b && b.end === v ? b : null
    };
  }
  let d = -1 / 0, p = 1 / 0;
  for (const u of i) {
    const [k, L] = l(u.block);
    d = Math.max(d, k - u.start), p = Math.min(p, L - u.end);
  }
  const h = a.flatMap((u) => i.map((k) => ({ other: u, from: u.start - k.end, to: u.end - k.start }))), g = (u) => u >= d && u <= p && !h.some((k) => u > k.from && u < k.to), x = t.delta, S = [x, 0, d, p, ...h.flatMap((u) => [u.from, u.to])].filter((u) => Number.isFinite(u) && g(u));
  if (!S.length) return { moves: [], free: !1, stoppedAt: null };
  const T = S.reduce((u, k) => {
    const L = Math.abs(k - x) - Math.abs(u - x);
    return L < 0 || L === 0 && Math.abs(k) < Math.abs(u) ? k : u;
  }), j = T === x ? null : h.find((u) => x > u.from && x < u.to)?.other ?? null;
  return {
    moves: T ? i.map((u) => ({ key: u.key, start: u.start + T, end: u.end + T })) : [],
    free: T === x,
    stoppedAt: j
  };
}
function Xa(e, t, n, o, s = 4 * Math.max(1, n)) {
  const r = As(e, Math.min(Math.max(0, t), Math.max(0, o - 1)));
  if (!r) return null;
  const i = zn(e);
  if (i.some((S) => t >= S.start && t < S.end)) return null;
  const a = [
    Math.max(0, ...i.filter((S) => S.end <= t).map((S) => S.end)),
    Math.min(o, ...i.filter((S) => S.start > t).map((S) => S.start))
  ], [, c] = Ls(e, r.block, o), l = Math.max(1, n);
  let d = Math.max(a[0], Math.floor(t / l) * l);
  const p = r.phrases.find(([S, T]) => t >= S && t < T);
  p && !i.some((S) => S.start < p[1] && S.end > p[0]) && (d = Math.max(a[0], p[0]));
  const h = r.phrases.find(([S, T]) => T > d && S <= d) ?? r.phrases.find(([S]) => S > d), g = Math.min(h ? h[1] : d + Math.max(1, s), a[1], c, o);
  if (g <= d) return null;
  const x = r.lines.length ? Math.max(...r.lines.map((S) => S.line)) + 1 : 0;
  return { block: r.block, line: x, start: d, end: g };
}
function Ka(e, t, n, o = !1) {
  const s = e.filter((l) => l.length >= 4 && !n.has(l[2])), r = new Set(s.map((l) => Be(l[2], l[3]))), i = o || e.some((l) => l.length === 2) ? t.parts.flatMap(
    (l) => l.lines.filter((d) => (o ? zt(d) : d.pinned) && d.end > d.start && !n.has(d.block) && !r.has(Be(d.block, d.line))).map((d) => [d.start, d.end, d.block, d.line])
  ) : [], a = new Map(e.filter((l) => l.length > 4).map((l) => [`${l[0]}:${l[1]}:${l[2]}`, l.slice(4)])), c = [...n].flatMap(
    ([l, d]) => d.map((p, h) => [p.start, p.end, l, h, ...a.get(`${p.start}:${p.end}:${l}`) ?? []])
  );
  return qt([...s, ...i, ...c]);
}
function Qa(e, t) {
  const n = [];
  for (const o of e) {
    const [s, r] = o;
    for (const [i, a, c] of t) {
      if (s < i || s >= a) continue;
      const l = c - i, d = o.slice(4), p = d.every((g) => g >= i && g < a) ? d.map((g) => g + l) : [], h = o.length >= 4 ? [s + l, Math.min(r, a) + l, o[2], o[3], ...p] : [s + l, Math.min(r, a) + l];
      n.push(h);
    }
  }
  return qt(n);
}
function Ja(e, t, n, o, s) {
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
  return qt(r);
}
function Za(e) {
  const t = [...e].sort((o, s) => o.start - s.start), n = t[0]?.start ?? 0;
  return t.map((o) => ({ text: o.text, offset: o.start - n, length: Math.max(1, o.end - o.start) }));
}
const ec = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: Za,
  editRange: Ls,
  fitLyricGesture: Ya,
  followSpans: Ja,
  laneLines: zn,
  lineKey: Be,
  newLineAt: Xa,
  overlap: Ua,
  parseLineKey: Fa,
  parseShift: Ha,
  parseSpans: qt,
  partAt: As,
  partOf: $s,
  placedLines: Ga,
  remapSpans: Qa,
  sameSpans: ja,
  settle: Va,
  withBlockSpans: Ka
}, Symbol.toStringTag, { value: "Module" })), Ns = 18, tc = 24, Nt = Ns + tc, nc = 22, oc = 34, Ze = 36, sc = 6, Tu = 3, rc = 12, ic = 6, ac = 28, cc = 21, lc = 108;
function uc(e) {
  return [
    ...e.tracks.vocal.map((t) => ({ ...t, track: "vocal" })),
    ...e.tracks.ins.map((t) => ({ ...t, track: "ins" }))
  ];
}
function dc(e) {
  const t = Number(e.unit.split("/")[1]);
  return Number.isFinite(t) && t > 0 ? t : 32;
}
function fc(e, t) {
  return t === "auto" ? Math.max(1, e.grid.snap) : Math.max(1, Math.round(dc(e) / t));
}
function pc(e, t = 4, n = 24) {
  let o = e.length ? Math.min(...e.map((r) => r.pitch)) - t : 60, s = e.length ? Math.max(...e.map((r) => r.pitch)) + t : 79;
  if (s - o + 1 < n) {
    const r = n - (s - o + 1);
    o -= Math.floor(r / 2), s += Math.ceil(r / 2);
  }
  return o < 0 && ([o, s] = [0, Math.min(127, s - o)]), s > 127 && ([o, s] = [Math.max(0, o - (s - 127)), 127]), [o, s];
}
function hc(e) {
  const t = e.map((s) => s.pitch), n = Math.max(0, Math.min(cc, ...t.map((s) => s - 2))), o = Math.min(127, Math.max(lc, ...t.map((s) => s + 2)));
  return [n, o];
}
function Pu(e, t) {
  const n = Nt + (t.lyrics ? nc : 0), o = n + (t.source ? oc : 0), s = uc(e), [r, i] = hc(s), a = i - r + 1, c = t.pxPerQuarter / Math.max(e.grid.units_per_quarter, 1e-9), l = Math.max(ic, Math.min(ac, Math.round(t.rowHeight ?? rc))), d = fc(e, t.snap), p = Math.max(1, Math.round(e.grid.units_per_quarter));
  return {
    pxPerUnit: c,
    rowHeight: l,
    high: i,
    low: r,
    focus: pc(s),
    total: e.total,
    snap: d,
    drawLength: Math.max(d, Math.round(p / d) * d),
    width: Ze + e.total * c + 40,
    height: o + a * l,
    top: o,
    sourceTop: t.source ? n : null
  };
}
const Bn = (e, t) => Ze + e * t.pxPerUnit, mc = (e, t) => (e - Ze) / t.pxPerUnit, Ct = (e, t) => t.top + (t.high - e) * t.rowHeight;
function gc(e, t, n, o) {
  const s = (Ct(o, e) + Ct(n, e) + e.rowHeight) / 2, r = Math.max(0, t - e.top), i = s - e.top - r / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, e.height - t), i)));
}
function Iu(e, t, n, o) {
  const s = Ct(o, e);
  return s >= t + e.top && s + e.rowHeight <= t + n ? null : gc(e, n, o, o);
}
function Co(e, t) {
  const n = t.high - Math.floor((e - t.top) / t.rowHeight);
  return Math.max(t.low, Math.min(t.high, n));
}
const wc = (e, t) => Math.floor(e / t) * t, ft = (e, t) => Math.round(e / t) * t;
function _n(e, t) {
  return {
    x: Bn(e.onset, t),
    y: Ct(e.pitch, t) + 0.5,
    width: Math.max(2, e.duration * t.pxPerUnit - 1),
    height: Math.max(2, t.rowHeight - 1)
  };
}
function Cs(e, t, n) {
  const o = e.name.length * 7 + 10, s = t ? (t.onset - e.onset) * n.pxPerUnit - 2 : o;
  return Math.max(12, Math.min(o, s));
}
const Ru = (e) => [1, 3, 6, 8, 10].includes((e % 12 + 12) % 12);
function qu(e) {
  return `C${Math.floor(e / 12) - 1}`;
}
function zu(e) {
  const t = [];
  for (const n of e.measures) {
    t.push({ unit: n.onset, kind: "bar", bar: n.n });
    const o = Number(n.meter.split("/")[0]) || 1, s = n.length / o;
    for (let r = 1; r < o; r++) t.push({ unit: n.onset + r * s, kind: "beat" });
  }
  return t;
}
function Bu(e, t, n, o, s, r, i = 0, a = 0) {
  const c = Math.max(0, Math.min(s.total, mc(e, s))), l = t - i;
  if (l < Ns) return { area: "header", unit: c };
  if (s.sourceTop !== null && l >= s.sourceTop && l < s.top) return { area: "source", unit: c };
  if (l >= Nt && l < s.top) return { area: "lyrics", unit: c };
  if (l < Nt) {
    for (let h = o.length - 1; h >= 0; h--) {
      const g = o[h], x = Bn(g.onset, s);
      if (e >= x && e <= x + Cs(g, o[h + 1], s)) return { area: "chord", chord: g };
    }
    return { area: "lane", unit: c };
  }
  if (e - a < Ze) return { area: "keys", pitch: Co(t, s) };
  const d = n.filter((h) => {
    const g = _n(h, s);
    return e >= g.x && e <= g.x + g.width && t >= g.y - 0.5 && t <= g.y + g.height + 0.5;
  }), p = d.find((h) => h.track === r) ?? d[0];
  if (p) {
    const h = _n(p, s), g = e >= h.x + h.width - Math.min(sc, h.width / 3) ? "end" : "body";
    return { area: "note", note: p, edge: g };
  }
  return { area: "grid", unit: c, pitch: Co(t, s) };
}
function Os(e, t, n) {
  return e.y0 < (e.from?.scrollTop ?? n) + t || e.y1 < n + t;
}
function yc(e, t, n = 0, o = 0) {
  const s = e.from?.scrollTop ?? n, r = e.from?.scrollLeft ?? o, i = (h, g) => Math.max(g + Ze, Math.min(t.width, h)), a = (h, g) => Math.max(g + t.top, Math.min(t.height, h)), c = [i(e.x0, r), i(e.x1, o)], l = [a(e.y0, s), a(e.y1, n)], d = Math.min(...c), p = Math.min(...l);
  return { x: d, y: p, width: Math.max(...c) - d, height: Math.max(...l) - p };
}
function Du(e, t = 0, n = Nt) {
  return Os(e, n, t);
}
function Hu(e, t, n) {
  return t.width <= 0 || t.height <= 0 ? [] : e.filter((o) => {
    const s = _n(o, n);
    return s.x < t.x + t.width && s.x + s.width > t.x && s.y < t.y + t.height && s.y + s.height > t.y;
  });
}
function Fu(e, t, n, o = 0, s = 0) {
  if (!Os(t, n.top, o)) return [];
  const r = yc(t, n, o, s);
  return r.width <= 0 ? [] : e.filter((i, a) => {
    const c = Bn(i.onset, n);
    return c < r.x + r.width && c + Cs(i, e[a + 1], n) > r.x;
  });
}
function Wu(e, t, n, o) {
  return { kind: "move", notes: e, anchor: t, fromUnit: n, fromPitch: o, delta: 0, semitones: 0 };
}
function ju(e, t = [], n = 1 / 0) {
  const o = t.filter((r) => r.track === e.track && r.onset > e.onset).map((r) => r.onset), s = Math.min(n, ...o);
  return { kind: "resize", note: e, end: e.onset + e.duration, overwrite: !1, limit: s };
}
function Gu(e, t, n, o) {
  const s = Math.max(0, Math.min(wc(t, o.snap), o.total - 1));
  return { kind: "draw", track: e, start: s, end: Math.min(o.total, s + o.snap), pitch: n };
}
function Vu(e, t = e.onset) {
  return { kind: "chord", chord: e, fromUnit: t, to: e.onset };
}
const je = (e, t, n) => Math.max(t, Math.min(n, e));
function Uu(e, t, n, o, s) {
  switch (e.kind) {
    case "move": {
      const r = e.anchor.onset + (t - e.fromUnit), i = Math.min(...e.notes.map((h) => h.onset)), a = Math.max(...e.notes.map((h) => h.onset + h.duration)), c = je(ft(r, o.snap) - e.anchor.onset, -i, o.total - a), l = Math.min(...e.notes.map((h) => h.pitch)), d = Math.max(...e.notes.map((h) => h.pitch)), p = je(n - e.fromPitch, -l, 127 - d);
      return { ...e, delta: c, semitones: p, copy: s.alt };
    }
    case "resize": {
      const r = Math.min(o.snap, o.total - e.note.onset), i = s.alt ? o.total : Math.max(e.note.onset + e.note.duration, Math.min(o.total, e.limit)), a = je(ft(t, o.snap), e.note.onset + Math.max(1, r), i);
      return { ...e, end: Math.min(a, i), overwrite: s.alt };
    }
    case "draw": {
      const r = t <= e.start ? e.start + o.snap : Math.max(e.start + o.snap, ft(t, o.snap));
      return { ...e, end: Math.min(o.total, r) };
    }
    case "chord":
      return { ...e, to: je(ft(e.chord.onset + t - e.fromUnit, o.snap), 0, o.total - 1) };
  }
}
function Yu(e, t) {
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
function Xu(e) {
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
function Ku(e) {
  return e ? e.kind === "move" ? e.copy ? /* @__PURE__ */ new Set() : new Set(e.notes.map((t) => t.id)) : e.kind === "resize" ? /* @__PURE__ */ new Set([e.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Qu(e, t, n, o, s, r) {
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
      const c = t.shift ? s.drawLength : s.snap, l = Math.min(...n.map((h) => h.onset)), d = Math.max(...n.map((h) => h.onset + h.duration)), p = je(a * c, -l, s.total - d);
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
const bc = /^(vocal|ins):\d+$/;
function vc(e, t) {
  const n = e?.model?.tracks, o = /* @__PURE__ */ new Set();
  if (!n) return o;
  const s = /* @__PURE__ */ new Map();
  for (const r of [...n.vocal, ...n.ins]) for (const i of r.segments) s.set(i, r.id);
  for (const r of t)
    if (bc.test(r)) o.add(r);
    else {
      const i = s.get(r);
      i && o.add(i);
    }
  return o;
}
function Ju(e) {
  return new Set(e.filter((t) => t.startsWith("chord:")));
}
function Zu(e, t = []) {
  return [...e.flatMap((n) => n.segments.length ? n.segments : [n.id]), ...t.map((n) => n.id)];
}
const xc = ["auto", "omit", "ins"];
function Ts(e) {
  return e.wanted ? e.wanted - (new Set(e.syllables.map((t) => t.onset)).size + e.holds.length) : 0;
}
function ed(e) {
  return (e?.parts ?? []).flatMap((t) => t.lines.filter((n) => Ts(n) !== 0));
}
function td(e) {
  return e > 0 ? `+${e}` : `−${-e}`;
}
function nd(e) {
  const t = Ts(e);
  if (!t) return "";
  const n = e.wanted === 1 ? "1 syllable" : `${e.wanted} syllables`, o = e.wanted - t;
  return `${n} on ${o === 1 ? "1 note" : `${o} notes`}`;
}
function od(e, t, n) {
  const o = [], s = vc(e ?? null, t);
  for (const r of [...e?.model?.tracks.vocal ?? [], ...e?.model?.tracks.ins ?? []])
    s.has(r.id) && o.push([r.onset, r.onset + r.duration]);
  if (n.length) {
    const r = new Set(n);
    for (const i of e?.lyrics?.parts ?? [])
      for (const a of i.lines)
        r.has(Be(a.block, a.line)) && o.push([a.start, Math.max(a.end, a.start + 1)]);
  }
  return o.length ? [Math.min(...o.map((r) => r[0])), Math.max(...o.map((r) => r[1]))] : null;
}
const kc = { vocal: !1, ins: !1 }, _c = { vocal: "Vocal", ins: "Instrument" }, Sc = { Vocal: "vocal", Ins: "ins" };
function Mc(e) {
  const t = typeof e == "object" && e !== null ? e : {};
  return { vocal: t.vocal === !0, ins: t.ins === !0 };
}
const Ge = (e) => `The ${_c[e]} track is locked: unlock it to edit it.`;
function Dn(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (!t.vocal && !t.ins) return n;
  for (const o of ["vocal", "ins"])
    if (t[o])
      for (const s of e?.model?.tracks[o] ?? []) {
        n.add(s.id);
        for (const r of s.segments) n.add(r);
      }
  for (const o of e?.elements ?? []) {
    const s = Sc[o.voice];
    s && t[s] && n.add(o.id);
  }
  return n;
}
function Ec(e, t, n) {
  const o = Dn(e, n);
  return o.size ? t.filter((s) => !o.has(s)) : [...t];
}
function _t(e) {
  const t = String(e ?? "").toLowerCase();
  return t === "vocal" ? "vocal" : t === "ins" ? "ins" : null;
}
const $c = /* @__PURE__ */ new Set(["delete", "delete_close_gap", "move_notes", "set_note_pitch", "join_notes", "quantize", "set_pitch", "shift_pitch", "note_to_rest"]), Ac = /* @__PURE__ */ new Set(["resize_note", "split_note", "set_duration", "rest_to_note"]), Lc = /* @__PURE__ */ new Set(["insert_note", "fill_rest", "place_notes", "shift_track"]);
function be(e) {
  return { operation: e, note: null };
}
function sd(e, t, n) {
  if (!n.vocal && !n.ins) return be(e);
  const o = e.op, s = (l) => ({ operation: null, note: Ge(l) }), r = n.vocal ? "vocal" : "ins";
  if (Lc.has(o)) {
    const l = _t(e.track);
    if (l && n[l]) return s(l);
  }
  if (o === "silence_voice") {
    const l = _t(e.voice ?? "Vocal");
    return l && n[l] ? s(l) : be(e);
  }
  if (o === "move_vocal_to_ins") return s(r);
  if (o === "fit_notes")
    return n.vocal ? s("vocal") : !n.ins || e.surplus === "omit" ? be(e) : { operation: { ...e, surplus: "omit" }, note: `${Ge("ins")} Surplus notes were left out instead of moved there.` };
  if (o === "paste") return Nc(e, n);
  if (Ac.has(o)) {
    const l = String(e.id ?? (Array.isArray(e.ids) ? e.ids[0] : ""));
    return Dn(t, n).has(l) ? s(Oo(l, t, n)) : be(e);
  }
  if (!$c.has(o) || !Array.isArray(e.ids)) return be(e);
  const i = _t(e.track);
  if (o === "move_notes" && i && n[i]) return s(i);
  const a = e.ids, c = Ec(t, a, n);
  return c.length === a.length ? be(e) : c.length ? { operation: { ...e, ids: c }, note: `${Ge(r)} Its selected notes stayed as they are.` } : s(Oo(a[0], t, n));
}
function Oo(e, t, n) {
  return n.vocal && Dn(t, { vocal: !0, ins: !1 }).has(e) ? "vocal" : n.ins ? "ins" : "vocal";
}
function Nc(e, t) {
  if (e.mode === "insert") return be(e);
  const n = Array.isArray(e.notes) ? e.notes : [], o = (l) => {
    const d = _t(l);
    return !d || !t[d];
  }, s = n.filter((l) => o(l.track)), r = Array.isArray(e.tracks) ? e.tracks.filter(o) : e.tracks, i = Array.isArray(e.chords) ? e.chords.length : 0;
  if (!(s.length !== n.length || Array.isArray(e.tracks) && r.length !== e.tracks.length)) return be(e);
  const c = t.vocal ? "vocal" : "ins";
  return !s.length && !i ? { operation: null, note: Ge(c) } : { operation: { ...e, notes: s, tracks: r }, note: `${Ge(c)} Only the other notes were pasted.` };
}
const rd = 12, pt = { width: 640, height: 420 }, Cc = { width: 1280, height: 900 }, Ps = 120, Is = 720, Rs = 0.25, qs = 0.85, zs = 160, Bs = 460, Ds = "plenio.sheet.dialog";
function Ke(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function Oc(e, t) {
  const n = Ke(e.width, pt.width, Math.max(pt.width, t.width - 16)), o = Ke(e.height, pt.height, Math.max(pt.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function id(e, t) {
  return Math.round(Ke(e + t, Ps, Is));
}
function ad(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? To(e) : To(e + t / n);
}
function To(e) {
  return Math.round(Ke(e, Rs, qs) * 1e3) / 1e3;
}
function cd(e, t) {
  return Math.round(Ke(e + t, zs, Bs));
}
function ld(e, t, n) {
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
function Tc() {
  return { ...Cc, maximized: !1 };
}
function ud(e = Hs()) {
  const t = Tc();
  try {
    const n = e?.getItem(Ds);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...Oc(
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
function dd(e, t = Hs()) {
  try {
    t?.setItem(Ds, JSON.stringify(e));
  } catch {
  }
}
function Hs() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Fs(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function Ws() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function Pc(e) {
  const t = Ws(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const js = "plenio.score-editor.prefs";
function Ic() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    locks: { ...kc },
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
    sounds: Ms(),
    paper: "a4",
    notationSize: "standard",
    record: Ws(),
    midiInput: "all"
  };
}
function Rc(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function fd(e = Gs()) {
  const t = Ic();
  try {
    const n = e?.getItem(js);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...Rc(o),
      zoom: typeof o.zoom == "number" && o.zoom >= 0.6 && o.zoom <= 1.8 ? o.zoom : t.zoom,
      locks: Mc(o.locks),
      fitSurplus: xc.includes(o.fitSurplus) ? o.fitSurplus : t.fitSurplus,
      voices: {
        Vocal: o.voices?.Vocal !== !1,
        Ins: o.voices?.Ins !== !1,
        chords: o.voices?.chords !== !1,
        guide: o.voices?.guide !== !1
      },
      speed: typeof o.speed == "number" && o.speed >= 0.25 && o.speed <= 2 ? o.speed : t.speed,
      roll: o.roll !== !1,
      rollZoom: typeof o.rollZoom == "number" && o.rollZoom >= 12 && o.rollZoom <= 240 ? o.rollZoom : t.rollZoom,
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= Ps && o.rollHeight <= Is ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= Rs && o.notationShare <= qs ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= zs && o.sideWidth <= Bs ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: Ba(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: Fs(o.notationSize) ? o.notationSize : t.notationSize,
      record: Pc(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function pd(e, t = Gs()) {
  try {
    t?.setItem(js, JSON.stringify(e));
  } catch {
  }
}
function Gs() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Vs(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: Fs(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function qc(e) {
  return Vs(e?.plenio_notation);
}
async function zc(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return Vs(n.jobs);
}
async function Bc(e, t) {
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
let Po = Promise.resolve();
function Dc(e) {
  const t = Po.then(e, e);
  return Po = t.catch(() => {
  }), t;
}
class Hc {
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
        Dc(() => Bc(s, this.host)).then(
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
      t = await zc(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const Us = "PlenioSeed", Fc = 2 ** 32, Ys = "plenio_part", St = "plenio_seed_hint", Io = 56, Ro = {
  fresh: { color: "#7a5418", bgcolor: "#3b2a10" },
  keep: { color: "#1f4e6e", bgcolor: "#14304a" }
};
function Wc(e = Math.random) {
  return Math.floor(e() * Fc);
}
function jc(e, t) {
  const n = t.trim() || "result";
  return e ? `🔒 Every run uses this seed again: the same ${n}.` : `🎲 Every run draws a new seed: a new ${n}. Liked it? Switch to 🔒.`;
}
function Re(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Xs(e) {
  const t = e.inputs?.find((n) => n.name === "seed");
  return t?.link !== void 0 && t?.link !== null;
}
function Ot(e) {
  const t = !!Re(e, "keep_seed")?.value, n = e, o = t ? Ro.keep : Ro.fresh;
  n.color = o.color, n.bgcolor = o.bgcolor;
  const s = Re(e, St)?.element;
  s && (s.textContent = jc(t, String(e.properties?.[Ys] ?? ""))), e.setDirtyCanvas?.(!0, !0);
}
function qo(e, t = Math.random) {
  const n = Re(e, "seed");
  !n || Xs(e) || (n.value = Wc(t), n.callback?.(n.value), e.setDirtyCanvas?.(!0, !0));
}
function Gc(e, t = Math.random) {
  const n = Re(e, "seed"), o = Re(e, "keep_seed");
  if (!n || !o) return;
  n.beforeQueued = () => {
    o.value || qo(e, t);
  }, o.callback = U(o.callback, () => Ot(e));
  const r = e.addWidget?.("button", "🎲 new seed now", null, () => qo(e, t), { serialize: !1 });
  if (r && (r.serialize = !1), !Re(e, St)) {
    const i = document.createElement("div");
    i.className = "plenio-seed-hint";
    const a = e.addDOMWidget(St, St, i, {
      serialize: !1,
      getValue: () => "",
      setValue: () => {
      },
      // two lines of text and the frontend's margin of 10 px above and below a DOM widget
      getMinHeight: () => Io,
      getMaxHeight: () => Io
    });
    a.serialize = !1;
  }
  Ot(e);
}
function Vc(e) {
  const t = e.prototype, n = t.onNodeCreated;
  t.onNodeCreated = function() {
    n?.call(this), Gc(this);
  }, e.prototype.onConfigure = U(e.prototype.onConfigure, function() {
    Ot(this);
  });
}
const Ks = /* @__PURE__ */ new Set(["new song every run", "new cover every run"]), Uc = /* @__PURE__ */ new Set(["one song, stop to review", "one cover, stop to review"]);
function Yc(e, t) {
  return Ks.has(e) ? !1 : Uc.has(e) ? t.trim() !== "take" : null;
}
function Xc(e, t) {
  let n = 0;
  for (const o of e) {
    if (o.type !== Us || Xs(o)) continue;
    const s = Yc(t, String(o.properties?.[Ys] ?? "")), r = o.widgets?.find((i) => i.name === "keep_seed");
    s === null || !r || !!r.value === s || (r.value = s, Ot(o), n++);
  }
  return n;
}
function Kc(e, t) {
  const n = `${t} seed${t === 1 ? "" : "s"}`;
  return Ks.has(e) ? { summary: `${n} now 🎲 new seed`, detail: `"${e}": every run draws all its seeds anew - a new song each time. Switch a seed to 🔒 to keep that part.` } : { summary: `${n} now 🔒 same seed`, detail: `"${e}": the song's draft, plan, arrangement and cover stay while you review it; the take seed still draws anew.` };
}
function Qc(e, t) {
  const n = e.widgets?.find((o) => o.name === "mode");
  n && (n.callback = U(n.callback, (o) => {
    const s = e.graph, r = String(o ?? n.value ?? ""), i = Xc(s?.nodes ?? s?._nodes ?? [], r);
    if (i) {
      const a = Kc(r, i);
      t(a.summary, a.detail);
    }
  }));
}
const Jc = "PlenioSongSheet";
function et(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function Qs(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function Js(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : Qs(e, n);
}
function Zs(e, t) {
  const n = Js(e, t);
  return n && (n.comfyClass ?? n.type) === Jc && et(n) ? n : null;
}
function Zc(e) {
  return Zs(e, "context_lyrics");
}
function el(e) {
  return Zs(e, "context_score");
}
function tl(e, t, n) {
  const o = [], s = Js(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((c, l) => {
        const d = Qs(i, l);
        d && o.push(d);
      });
    }
  }
  return !1;
}
function nl(e, t, n) {
  const o = Zc(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(et(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: c, replans: tl(o, e, "score") } };
}
function ol(e, t, n) {
  const o = et(e);
  if (!o) return;
  const s = $e(o.value) ?? Rt();
  o.value = Ue(ls(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function sl(e, t, n) {
  const o = el(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = $e(et(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Ee(a) !== Ee(s) && (c = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: c } };
}
function rl(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function il(e, t, n, o = null) {
  const s = et(e);
  if (!s) return null;
  const r = $e(s.value) ?? Rt(), i = ls(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = Ue(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await wr(o.fetcher, {
      sheet_state: i,
      upstream: ui(n),
      owned: n.owned,
      review: rl(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null,
      sparse: n.sparse ?? !1
    });
    if (!!a.findings.some((d) => d.severity === "error") || !a.fingerprint) return i;
    const l = li(i, a.fingerprint);
    return s.value = Ue(l), e.setDirtyCanvas?.(!0, !0), l;
  } catch {
    return i;
  }
}
const al = {
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
function cl(e) {
  return e.properties?.plenio_editor_layout === "daw" ? "daw" : (e.inputs ?? []).some((n) => n.name === "score" && n.link != null) ? "score" : "text";
}
const er = "PLENIO_SHEET_STATE", zo = 128;
let Mt = null;
function ll(e) {
  Mt = e;
}
const ul = (e, t, n) => {
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
    const u = cl(e);
    if (u === l) return;
    l = u;
    const k = al[u];
    i.dataset.kind = u, i.title = `${k.name} - opens the Song Sheet editor (${k.what.toLowerCase()})`, i.querySelector(".icon").innerHTML = k.icon, i.querySelector(".name").textContent = k.name, i.querySelector(".what").textContent = k.what;
  }, p = () => {
    d();
    const u = Ne(String(e.id)), k = kn(e);
    r.textContent = ai($e(o)) + (u && k !== "approved" ? ` · ${u.status}` : ""), a.textContent = ka(k), a.dataset.state = k ?? "";
    const L = c ? null : e.widgets?.find((b) => b.name === "review");
    if (L) {
      c = !0;
      const b = L.callback;
      L.callback = (v) => {
        b?.(v), p();
      };
    }
  }, h = e.addDOMWidget(t, er, s, {
    getValue: () => o,
    setValue: (u) => {
      o = typeof u == "string" ? u : "", p();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => zo,
    getMaxHeight: () => zo
  });
  i.addEventListener("click", (u) => {
    u.stopPropagation(), g().catch((k) => {
      console.error("Plenio: the Song Sheet editor could not open", k), r.textContent = `The editor could not open: ${k instanceof Error ? k.message : String(k)}`;
    });
  });
  async function g() {
    const u = $e(o);
    u === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const k = Ne(String(e.id)), b = (e.inputs ?? []).filter((W) => W.link != null).map((W) => W.name), v = u ?? { schema: "plenio.sheet_state/1", docs: {} }, M = k?.owned ?? us(b, v), y = String(e.widgets?.find((W) => W.name === "review")?.value ?? "continue"), E = y === "as the brief says" ? k?.review ?? "continue" : y, _ = () => Pn(import.meta.url, In), { openSheetDialog: C } = await Oe(() => import("./open-BurXn_qv.mjs"), _), { parseGuide: O, serializeGuide: q } = await Oe(() => import("./tracks-ClAVjvds.mjs"), _), { parseShift: F, parseSpans: Y } = await Oe(() => Promise.resolve().then(() => ec), _), { parseBarSources: D } = await Oe(() => import("./barSources-Cq3VGvmq.mjs"), _);
    if (!Mt) throw new Error("Plenio: API not initialised");
    let Z = null;
    try {
      Z = nl(e, k, Ne);
    } catch (W) {
      console.warn("Plenio: the lyrics sheet of this score was not found", W);
    }
    let G = null;
    try {
      G = sl(e, k, Ne);
    } catch (W) {
      console.warn("Plenio: the score sheet of these lyrics was not found", W);
    }
    const I = Mt, R = G?.owner ?? e;
    C({
      title: e.title || "Song Sheet",
      state: v,
      payload: k,
      asrNote: ca(k?.docs.lyrics?.upstream_sha256),
      owned: M.length ? M : [...Je],
      review: E,
      fetcher: Mt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: O(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: Y(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: F(e.properties?.plenio_source_shift),
      barSources: D(R.properties?.plenio_bar_sources),
      lyricsTarget: Z?.target ?? null,
      scoreTarget: G?.target ?? null,
      onApply: (W, tt, De, Q, Bt, Le) => {
        const Dt = String(h.value ?? "");
        if (h.value = Ue(W), e.properties = {
          ...e.properties ?? {},
          plenio_guide: q(tt),
          plenio_lyric_spans: (Le?.lyricSpans ?? []).map((he) => [...he]),
          plenio_source_shift: Le?.sourceShift ?? 0
        }, Le?.barSources && !G?.target.blocked && (R.properties = { ...R.properties ?? {}, plenio_bar_sources: Le.barSources }), Bt ? Ie(e, "approved") : String(h.value) !== Dt && x(e), De !== null && Z && !Z.target.blocked && (ol(Z.owner, De, Ne(String(Z.owner.id))), x(Z.owner)), Q && G && !G.target.blocked) {
          const he = G.owner;
          il(he, Q.text, Ne(String(he.id)), Q.approved ? { fetcher: I } : null).then(
            (Ht) => {
              Ht?.review?.approved_fingerprint ? Ie(he, "approved") : x(he);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function x(u) {
    xs(u) === "approved" && Ie(u, null);
  }
  const S = [
    ia((u) => {
      u === String(e.id) && p();
    }),
    Ma((u) => {
      (u === null || u === e) && p();
    })
  ], T = e.onDrawForeground;
  e.onDrawForeground = function(u) {
    T?.call(this, u), d();
  };
  const j = e.onRemoved;
  return e.onRemoved = function() {
    for (const u of S) u();
    j?.call(this);
  }, p(), { widget: h };
}, tr = "PLENIO_FINISH_SWITCH", dl = "plenio_switch", Bo = 148, Sn = 0, fl = 4, un = [
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
function pl(e) {
  return e?.nodes ?? e?._nodes ?? [];
}
function nr(e) {
  return pl(e).filter((t) => t.properties?.[dl] === "cover");
}
function ht(e) {
  const t = nr(e);
  return t.length ? t.some((n) => (n.mode ?? Sn) === Sn) : null;
}
function hl(e, t) {
  for (const n of nr(e)) n.mode = t ? Sn : fl;
  e?.setDirtyCanvas?.(!0, !0);
}
function Do(e) {
  return e === !0 || typeof e == "string" && ["true", "1", "on"].includes(e.trim().toLowerCase());
}
const Mn = /* @__PURE__ */ new Set();
function ml() {
  for (const e of Mn) e();
}
const gl = (e, t, n) => {
  let o = Do(n?.[1]?.default);
  const s = e, r = document.createElement("div");
  r.className = "plenio-switches";
  const i = /* @__PURE__ */ new Map();
  for (const g of un) {
    const x = document.createElement("button");
    x.type = "button", x.className = "plenio-switch", x.dataset.switch = g.id, x.innerHTML = `<span class="icon">${g.icon}</span><span class="text"><span class="name"></span><span class="what"></span></span><span class="pill"></span>`, x.addEventListener("click", (S) => {
      S.stopPropagation(), g.id === "hq" ? (o = !o, l.value = o, l.callback?.(o)) : hl(s.graph, !ht(s.graph)), c();
    }), i.set(g.id, x), r.append(x);
  }
  function a(g, x) {
    const S = i.get(g.id);
    S && (S.hidden = x === null, S.classList.toggle("on", !!x), S.setAttribute("aria-pressed", String(!!x)), S.title = `${g.name}: ${x ? "on" : "off"} - click to switch it ${x ? "off" : "on"}`, S.querySelector(".name").textContent = g.name, S.querySelector(".what").textContent = x ? g.on : g.off, S.querySelector(".pill").textContent = x ? "ON" : "OFF");
  }
  function c() {
    a(un[0], o), a(un[1], ht(s.graph));
  }
  const l = e.addDOMWidget(t, tr, r, {
    getValue: () => o,
    setValue: (g) => {
      o = Do(g), c();
    },
    getMinHeight: () => Bo,
    getMaxHeight: () => Bo
  });
  Mn.add(c);
  let d = ht(s.graph);
  const p = e.onDrawForeground;
  e.onDrawForeground = function(g) {
    p?.call(this, g);
    const x = ht(s.graph);
    x !== d && (d = x, c());
  };
  const h = e.onRemoved;
  return e.onRemoved = function() {
    Mn.delete(c), h?.call(this);
  }, c(), { widget: l };
}, Qe = "plenio.stem_mix/1", qe = "rest", wl = ["reverb", "delay"], or = -60, yl = 12;
function bl() {
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
function sr(e) {
  const t = bl();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const vl = ["vocals", "drums", "bass", "other"];
function xl() {
  return [...vl, qe];
}
function kl(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Qe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Qe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function _l(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || sr(le(e, o))) continue;
    const s = {}, r = le(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: Qe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Tt(e, t, n) {
  const o = { ...e.strips };
  return sr(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function Sl(e, t, n) {
  const o = n.some((r) => le(e, r).solo), s = le(e, t);
  return o ? s.solo : !s.mute;
}
function Ho(e) {
  return e <= or ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Ml(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function El(e, t, n) {
  return Ml([...e, [t, n]]);
}
function $l(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function Al(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function Ll(e, t, n, o) {
  const s = le(e, t);
  return Tt(e, t, { ...s, muted: El(s.muted, n, o) });
}
function Nl(e, t, n) {
  const o = le(e, t), s = $l(o.muted, n);
  return s < 0 ? e : Tt(e, t, { ...o, muted: Al(o.muted, s) });
}
function Cl(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function Ol(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function Fo(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : xl()).filter((r) => r !== qe), s = Object.keys(e?.strips ?? {}).filter((r) => r !== qe && !o.includes(r));
  return [...o, ...s, qe];
}
const Wo = "plenio_stem_mixer", jo = "mix", we = 200, Tl = ["room", "plate", "hall"];
function B(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function mt(e, t, n, o, s) {
  const r = B("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function Pl(e) {
  const t = B("div", "plenio-mix"), n = B("div", "plenio-mix-strips"), o = B("div", "plenio-mix-buses"), s = B("div", "plenio-mix-info"), r = B("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: Qe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Fo(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const c = () => e.widgets?.find((b) => b.name === jo);
  function l(b, { draw: v = !0 } = {}) {
    const M = c();
    if (!M) return;
    const y = _l(b);
    M.value = y, M.callback?.(y), i = { ...i, mix: b }, v && g();
  }
  function d(b, v, M = {}) {
    l(Tt(i.mix, b, { ...le(i.mix, b), ...v }), M);
  }
  function p(b, v, M, y = {}) {
    const E = le(i.mix, b);
    let _ = Tt(i.mix, b, { ...E, [v]: M });
    M > 0 && !(_[v] && Object.keys(_[v]).length) && (_ = v === "reverb" ? { ..._, reverb: { preset: "room" } } : { ..._, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), l(_, y);
  }
  function h(b, v, M) {
    const y = { ...i.mix[b] ?? {} };
    l({ ...i.mix, [b]: { ...y, [v]: M } });
  }
  function g() {
    n.replaceChildren();
    const b = i.names;
    for (const v of i.names) {
      const M = le(i.mix, v), y = B("div", "plenio-mix-strip");
      y.dataset.strip = v;
      const E = B("span", "name", v === qe ? `${v} (missed)` : v);
      E.title = v === qe ? "What the separator missed: keeps a neutral mix exact" : "";
      const _ = mt(or, yl, 0.5, M.gain_db, `${v} gain`), C = B("span", "gain", `${Ho(M.gain_db)} dB`);
      _.addEventListener("input", () => {
        C.textContent = `${Ho(Number(_.value))} dB`, d(v, { gain_db: Number(_.value) }, { draw: !1 });
      }), _.addEventListener("change", () => d(v, { gain_db: Number(_.value) }));
      const O = B("button", M.mute ? "toggle active" : "toggle", "M");
      O.setAttribute("aria-label", `${v} mute`), O.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { mute: !M.mute });
      });
      const q = B("button", M.solo ? "toggle active" : "toggle", "S");
      q.setAttribute("aria-label", `${v} solo`), q.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { solo: !M.solo });
      });
      const F = mt(0, 1, 0.05, M.compression, `${v} compression`);
      F.title = "Compression amount: one knob for the master compressor (threshold and ratio)", F.addEventListener("input", () => d(v, { compression: Number(F.value) }, { draw: !1 })), F.addEventListener("change", () => d(v, { compression: Number(F.value) }));
      const Y = wl.map((I) => {
        const R = mt(0, 1, 0.05, M[I], `${v} ${I} send`);
        return R.title = `${I} send: how much of this stem goes to the shared ${I} bus`, R.addEventListener("input", () => p(v, I, Number(R.value), { draw: !1 })), R.addEventListener("change", () => p(v, I, Number(R.value))), R;
      }), D = B("button", M.save ? "toggle active" : "toggle", "save");
      D.setAttribute("aria-label", `${v} save as its own file`), D.setAttribute("aria-pressed", String(M.save)), D.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', D.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { save: !M.save });
      });
      const Z = Sl(i.mix, v, b);
      y.classList.toggle("silent", !Z);
      const G = B("canvas", "plenio-mix-wave");
      G.width = we, G.height = 26, G.setAttribute("aria-label", `${v} waveform (drag to mute a time range)`), x(G, M, Ol(i.peaks, v, we)), G.addEventListener("pointerdown", (I) => S(I, G, v)), y.append(
        E,
        _,
        C,
        O,
        q,
        B("span", "label", "comp"),
        F,
        B("span", "label", "verb"),
        Y[0],
        B("span", "label", "delay"),
        Y[1],
        D,
        G
      ), n.append(y);
    }
    T(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function x(b, v, M) {
    const y = b.getContext("2d");
    if (!y) return;
    y.clearRect(0, 0, we, b.height);
    const E = b.height / 2;
    y.strokeStyle = "rgba(180, 190, 205, 0.8)", y.beginPath();
    for (let _ = 0; _ < M.length; _++) {
      const C = Math.max(1, M[_] * (E - 1));
      y.moveTo(_ + 0.5, E - C), y.lineTo(_ + 0.5, E + C);
    }
    y.stroke(), y.fillStyle = "rgba(224, 104, 94, 0.35)", y.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [_, C] of v.muted) {
      const O = Math.max(0, Math.min(we, _ / Math.max(i.seconds, 1e-6) * we)), q = Math.max(0, Math.min(we, C / Math.max(i.seconds, 1e-6) * we));
      y.fillRect(O, 0, Math.max(1, q - O), b.height), y.strokeRect(O + 0.5, 0.5, Math.max(1, q - O) - 1, b.height - 1);
    }
  }
  function S(b, v, M) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const y = v.getBoundingClientRect(), E = (Y) => Math.max(0, Math.min(1, (Y - y.left) / (y.width || we))) * i.seconds, _ = E(b.clientX);
    if (le(i.mix, M).muted.some(([Y, D]) => Y <= _ && _ <= D)) {
      l(Nl(i.mix, M, _));
      return;
    }
    let O = _;
    const q = (Y) => {
      O = E(Y.clientX);
    }, F = () => {
      window.removeEventListener("pointermove", q), window.removeEventListener("pointerup", F), l(Ll(i.mix, M, Math.min(_, O), Math.max(_, O)));
    };
    window.addEventListener("pointermove", q), window.addEventListener("pointerup", F);
  }
  function T() {
    o.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, v = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, M = B("select");
    M.setAttribute("aria-label", "Reverb preset"), M.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const _ of Tl) M.append(new Option(_, _));
    M.value = String(b.preset ?? "room"), M.addEventListener("change", () => h("reverb", "preset", M.value));
    const y = B("input");
    y.type = "number", y.value = String(v.time_ms ?? 375), y.setAttribute("aria-label", "Delay time in ms"), y.title = "Delay time in ms: where the first echo of the delay bus sits", y.addEventListener("change", () => h("delay", "time_ms", Number(y.value)));
    const E = mt(0, 0.8, 0.05, Number(v.feedback ?? 0.35), "Delay feedback");
    E.title = "Delay feedback: how much of each echo returns into the delay line", E.addEventListener("input", () => h("delay", "feedback", Number(E.value))), o.append(
      B("span", "label", "reverb bus"),
      M,
      B("span", "label", "delay bus"),
      y,
      B("span", "label", "ms, feedback"),
      E
    ), o.style.display = "flex";
  }
  const j = e.addDOMWidget(Wo, Wo, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  j.serialize = !1;
  const u = e.widgets?.find((b) => b.name === jo), k = B("button", "toggle", "JSON");
  k.title = "Show or hide the raw mixer value", k.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, k.classList.toggle("active", a), u && (u.plenioHidden = !a, a ? delete u.computeSize : u.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(B("span", "label", "Advanced"), k), u && (u.plenioHidden = !0, u.computeSize = () => [0, -4]);
  function L() {
    const b = kl(c()?.value);
    i = { ...i, mix: b ?? { schema: Qe, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), g();
  }
  return L(), {
    showExecuted(b) {
      const v = b?.plenio_stems?.at(-1), M = Cl(b), y = Fo(i.mix, v ?? null);
      i = { ...i, names: y, peaks: M, seconds: Number(v?.seconds ?? i.seconds) || 0 }, L();
    }
  };
}
const En = "plenio-tip", Go = 12, gt = 8;
function Il(e, t, n, o) {
  let s = e.right + Go;
  if (s + n.width > o.width - gt && (s = e.left - Go - n.width), s < gt) return null;
  const r = Math.max(gt, Math.min(t - 14, o.height - gt - n.height));
  return { x: s, y: r };
}
function Rl(e) {
  return !!e && (String(e.type ?? "").startsWith("Plenio") || String(e.title ?? "").startsWith("Plenio"));
}
const ql = 30;
function zl(e) {
  const t = e.node_over, n = e.ds, o = e.canvas;
  if (!t || !n || !o) return null;
  const s = o.getBoundingClientRect(), r = t.flags?.collapsed ? 0 : t.size[1];
  return {
    left: s.left + (t.pos[0] + n.offset[0]) * n.scale,
    top: s.top + (t.pos[1] - ql + n.offset[1]) * n.scale,
    right: s.left + (t.pos[0] + t.size[0] + n.offset[0]) * n.scale,
    bottom: s.top + (t.pos[1] + r + n.offset[1]) * n.scale
  };
}
function Bl(e) {
  const t = document.body, n = () => t.classList.remove(En);
  let o = 0, s = null;
  const r = (a) => {
    const c = e();
    if (a.style.display === "none" || !a.textContent?.trim() || !c || !Rl(c.node_over)) return n();
    const l = zl(c), d = a.getBoundingClientRect(), p = l && Il(l, o, d, { width: window.innerWidth, height: window.innerHeight });
    if (!p) return n();
    const h = a.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    t.style.setProperty("--plenio-tip-x", `${Math.round(p.x - h.left)}px`), t.style.setProperty("--plenio-tip-y", `${Math.round(p.y - h.top)}px`), t.classList.add(En);
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
const Dl = `
body.${En} .node-tooltip { left: var(--plenio-tip-x) !important; top: var(--plenio-tip-y) !important;
  transform: none !important; }
`, Hl = `
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
` + Dl;
function Fl() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = Hl, document.head.append(e);
}
function $n(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function wt(e) {
  return $n(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function Wl(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function jl(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...c] = s, l = (d, p) => `<tr>${d.map((h) => `<${p}>${wt(h)}</${p}>`).join("")}</tr>`;
      t.push(`<table><thead>${l(a, "th")}</thead><tbody>${c.map((d) => l(d, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${$n(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const d = Wl(a);
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
  return r(), i(), o !== null && t.push(`<pre><code>${$n(o.join(`
`))}</code></pre>`), t.join("");
}
const Ve = "plenio_summary", Vo = "plenio_summary", Uo = 84, Gl = 18, Vl = 55, Ul = 16, Yo = 10;
function Yl(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / Vl)), 0);
  return Ul + t * Gl;
}
function Xl(e, t) {
  const n = e.widgets?.find((i) => i.name === Vo);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  let s = Yo;
  const r = e.addDOMWidget(Vo, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Uo,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets. The margins
    // count too - without them the element stayed 20 px short of its text and hid the last line
    getMaxHeight: () => Math.max(Uo, (o.scrollHeight ? o.scrollHeight + 2 : Yl(t.markdown)) + 2 * s)
  });
  return s = r.margin ?? Yo, r.serialize = !1, o;
}
function Kl(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Xo = /* @__PURE__ */ new WeakMap();
function An(e, t) {
  if (!t.markdown) return;
  const n = Xo.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Xo.set(e, n);
  const o = Xl(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = jl(t.markdown), Kl(e), e.setDirtyCanvas?.(!0, !0);
}
function Ko(e, t, n, o) {
  const s = e.properties?.[Ve], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((c) => c.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ve] = a, An(e, a);
}
function Ql(e) {
  e.prototype.onExecuted = U(e.prototype.onExecuted, function(t) {
    const n = t?.[Ve], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[Ve] = { markdown: o.markdown, status: o.status ?? "" }, An(this, o));
  }), e.prototype.onConfigure = U(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ve];
    t?.markdown && An(this, t);
  });
}
const Jl = "Plenio.Core", K = gr;
ll(K);
const V = Zo, dn = { app: V, fetcher: K }, fn = { app: V, fetcher: K }, Hn = () => V.graph, ve = new sa(K);
function yt() {
  for (const e of Hn()?.nodes ?? []) {
    e.type === Ye && ve.label(e);
    for (const t of e.subgraph?.nodes ?? []) t.type === Ye && ve.label(t);
    e.subgraph && ve.labelBlock(e);
  }
  V.graph?.setDirtyCanvas?.(!0, !0);
}
function Ln(e) {
  if (e == null) return null;
  const t = String(e);
  return Hn()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
async function Zl(e, t) {
  const n = `Your own ${e.replace("_", " ")} - any text; the list holds the style templates' values.`, o = V.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: "Plenio · your own value", message: n, defaultValue: t }) : window.prompt(n, t);
}
const Qo = new ba(
  (e) => V.extensionManager?.toast?.add({ severity: "warn", summary: e.summary, detail: e.detail, life: 2e4 })
), eu = {
  scale: () => V.canvas?.ds?.scale ?? 1,
  toast: (e, t) => V.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, rr = () => Pn(import.meta.url, In), tu = {
  fetcher: K,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Oe(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      rr,
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
function nu(e, t) {
  const n = Ln(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function ou(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = nu(t, e.job.file);
  if ("saved" in e) {
    o && Ko(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), V.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof J && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && Ko(o, n, `${n} - not saved: ${r}`, "warning"), V.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const Nn = /* @__PURE__ */ new Map(), Jo = new Hc(tu, (e) => {
  ou(e, Nn.get(e.job.token)), Nn.delete(e.job.token);
});
Zo.registerExtension({
  name: Jl,
  getCustomWidgets: () => ({ [er]: ul, [tr]: gl }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: Jt,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => _i(dn).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), V.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    },
    { id: _o, label: "Plenio Player", icon: "pi pi-play-circle", function: () => xn(fn) }
  ],
  menuCommands: [
    { path: ["File"], commands: [Jt] },
    { path: ["Plenio"], commands: [_o, Jt] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: "pi pi-play-circle",
      label: "Plenio Player",
      tooltip: "Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)",
      onClick: () => {
        xn(fn);
      }
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(e) {
    const t = Or(e);
    t.length && console.info(`Plenio: longer LLM answers (${mn} tokens) in ${t.join(", ")}`);
    try {
      const n = await Er(e, K);
      for (const o of $r(n)) V.extensionManager?.toast?.add({ ...o, life: 2e4 });
    } catch (n) {
      console.error("Plenio: the blocks of this workflow could not be brought up to date", n);
      const o = n instanceof J && n.hint ? `${n.message} ${n.hint}` : String(n instanceof Error ? n.message : n);
      V.extensionManager?.toast?.add({
        severity: "warn",
        summary: "Plenio blocks not brought up to date - the brief's creativity may not reach their sampling",
        detail: o,
        life: 2e4
      });
    }
  },
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => {
    yt(), Sa(), ml();
  },
  async beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    to.has(t.name) && await Wr(e, t, K, Zl), Ql(e), Oa(e, eu);
    const n = Ni(t.input);
    if (n.size || t.name in qn) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = Qi(t, s), i = Mi(r), a = o?.call(this, r);
        return Li(this, i, n), Ui(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = U(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) aa(s);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Hi(this, K));
      }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (t.name === Ye) {
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), ve.label(this);
        const s = this.widgets?.find((r) => r.name === "component");
        s && (s.callback = U(s.callback, () => window.setTimeout(() => ve.label(this), 0)));
      }, e.prototype.onExecuted = U(e.prototype.onExecuted, function() {
        ve.refresh().then(yt);
      });
    }
    if (t.name === "PlenioExportRelease" && da(e, fn), t.name === Us && Vc(e), to.has(t.name)) {
      oi(e, K);
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), Qo.watch(this), Qc(
          this,
          (s, r) => V.extensionManager?.toast?.add({ severity: "info", summary: s, detail: r, life: 1e4 })
        );
      };
    }
    if (t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Pl(this));
      }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = U(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && ko(String(this.id), r);
    }));
  },
  // R: the lists are read again - and the facts behind the labels (ComfyUI then copies the inner fields' options,
  // labels included, to the blocks' promoted fields)
  async refreshComboInNodes() {
    await ve.refresh(), yt();
  },
  setup() {
    Fl(), ve.refresh().then(yt), K.addEventListener(Ji, (n) => {
      const o = na(n.detail ?? {});
      V.extensionManager?.toast?.add({ severity: "warn", ...o, life: 3e4 });
    }), Bl(() => V.canvas), ki(dn), ha(dn), K.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      ko(String(o.node_id), o);
      const s = Ln(o.node_id);
      s && Ie(s, vs(o));
    }), K.addEventListener("status", (n) => {
      Qo.status(n.detail?.exec_info?.queue_remaining);
    }), K.addEventListener("execution_start", () => {
      _a(Hn()?.nodes ?? []);
    }), K.addEventListener("execution_error", (n) => {
      const o = Ln(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Ie(o, "error");
    }), K.addEventListener("executed", (n) => {
      const o = n.detail, s = qc(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) Nn.set(i.token, r);
      Jo.take(s);
    });
    const e = () => {
      Jo.recover();
    };
    let t = !1;
    K.addEventListener("reconnected", () => {
      rr().then((n) => {
        n ? t || (t = !0, V.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: wn })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  gc as $,
  yc as A,
  Hu as B,
  Fu as C,
  Du as D,
  Be as E,
  nd as F,
  Ts as G,
  Ns as H,
  zu as I,
  Bu as J,
  Ze as K,
  tc as L,
  mc as M,
  Zu as N,
  ju as O,
  J as P,
  Wu as Q,
  Co as R,
  oc as S,
  ne as T,
  Vu as U,
  Gu as V,
  Tu as W,
  Uu as X,
  Yu as Y,
  wc as Z,
  Qu as _,
  mu as a,
  yu as a$,
  ic as a0,
  ac as a1,
  Ku as a2,
  Ya as a3,
  Xa as a4,
  Iu as a5,
  Su as a6,
  Eu as a7,
  Mu as a8,
  Lu as a9,
  id as aA,
  To as aB,
  cd as aC,
  pu as aD,
  du as aE,
  fu as aF,
  ja as aG,
  Va as aH,
  Ga as aI,
  Ka as aJ,
  Fa as aK,
  Za as aL,
  As as aM,
  Ua as aN,
  zn as aO,
  Qa as aP,
  Ja as aQ,
  Ec as aR,
  sd as aS,
  pd as aT,
  ad as aU,
  _u as aV,
  au as aW,
  ud as aX,
  iu as aY,
  bu as aZ,
  xu as a_,
  Nu as aa,
  $u as ab,
  Au as ac,
  Lt as ad,
  Pa as ae,
  Ae as af,
  za as ag,
  Cu as ah,
  Ws as ai,
  dt as aj,
  Ba as ak,
  Pc as al,
  Fs as am,
  qt as an,
  fd as ao,
  Is as ap,
  Ps as aq,
  Bs as ar,
  zs as as,
  qs as at,
  Rs as au,
  Ee as av,
  od as aw,
  ed as ax,
  Ls as ay,
  ld as az,
  Ju as b,
  ku as b0,
  Ue as b1,
  vu as b2,
  wr as b3,
  ui as b4,
  li as b5,
  rd as b6,
  Oc as b7,
  dd as b8,
  cu as b9,
  ls as ba,
  Jl as bb,
  lu as c,
  hu as d,
  Ms as e,
  Ou as f,
  qa as g,
  Ru as h,
  cs as i,
  _n as j,
  qu as k,
  wu as l,
  nc as m,
  uc as n,
  Nt as o,
  as as p,
  td as q,
  Cs as r,
  vc as s,
  uu as t,
  dc as u,
  gu as v,
  Pu as w,
  Bn as x,
  Ct as y,
  Xu as z
};
