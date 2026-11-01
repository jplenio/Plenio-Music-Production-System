import { api as zs } from "../../../../scripts/api.js";
import { app as Mo } from "../../../../scripts/app.js";
class Q extends Error {
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
    throw new Q(r.message ?? `Request failed (${o.status})`, r.hint ?? null);
  }
  return s;
}
function Bs(e, t) {
  return oe(e, "/plenio/sheet/resolve", t);
}
async function Cc(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
function pn(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Nc(e, t, n, o) {
  return oe(e, "/plenio/score/analyze", pn({ abc: t }, n, o));
}
function Tc(e, t, n, o, s) {
  return oe(e, "/plenio/score/transform", pn({ abc: t, operation: n }, o, s));
}
function Pc(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return oe(e, "/plenio/score/musicxml/export", pn(s, n, o));
}
function Oc(e, t) {
  const { lyrics: n, ...o } = t;
  return oe(e, "/plenio/score/musicxml/import", n ? { ...o, lyrics: n } : o);
}
function Ic(e, t) {
  return oe(e, "/plenio/score/midi/export", t);
}
function Rc(e, t) {
  return oe(e, "/plenio/score/midi/import", t);
}
function qc(e, t) {
  return oe(e, "/plenio/lyrics/analyze", t);
}
function zc(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function kn(e, t, n, o = 200) {
  return oe(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function Ds(e, t) {
  return oe(e, "/plenio/brief/fields", t);
}
async function Hs(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Q(`Request failed (${t.status})`);
  return await t.json();
}
async function Bc(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new Q(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function Fs(e, t) {
  return oe(e, "/plenio/records/continue", t);
}
function js(e, t) {
  return oe(e, "/plenio/workflow/blocks", { workflow: t });
}
function U(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const Xt = "Plenio · ", Ws = /* @__PURE__ */ new Set(["YuE2GenerateABC", "YuE2GenerateMusic", "PlenioComposePrompt", "PlenioComposeArrangement"]), Gs = "PlenioCreativity";
function Vs(e) {
  const t = e?.definitions?.subgraphs;
  return Array.isArray(t) ? t : [];
}
function Us(e) {
  return Vs(e).some((t) => {
    if (typeof t?.name != "string" || !t.name.startsWith(Xt)) return !1;
    const n = new Set((t.nodes ?? []).map((o) => o?.type));
    return !n.has(Gs) && [...n].some((o) => Ws.has(String(o)));
  });
}
async function Ys(e, t) {
  if (!e || typeof e != "object" || !Us(e)) return null;
  const n = await js(t, e);
  if (n.workflow) {
    const o = e;
    for (const s of Object.keys(o)) delete o[s];
    Object.assign(o, n.workflow);
  }
  return n;
}
const Kt = (e) => e.startsWith(Xt) ? e.slice(Xt.length) : e, En = (e) => e.map(Kt).join(", ");
function Xs(e) {
  if (!e) return [];
  const t = [];
  if (e.updated.length) {
    const o = e.linked.length ? ` The creativity of ${En(e.linked)} now comes from the brief.` : "";
    t.push({
      severity: "info",
      summary: "Plenio blocks brought up to date",
      detail: `This workflow was saved before its blocks followed the brief's creativity: ${En(e.updated)} are the current blocks now.${o} At creativity 50 they work exactly as before. Save the workflow to keep it.`
    });
  }
  const n = [
    ...e.kept.map(([o, s]) => `${Kt(o)} was kept as it was (${s}) - its sampling stays fixed`),
    ...e.unlinked.map(([o, s]) => `${Kt(o)} has its own creativity slider (${s})`)
  ];
  return n.length && t.push({
    severity: "warn",
    summary: "The brief's creativity does not reach every block",
    detail: `${n.join("; ")}. The template, opened again from the template browser, has the current blocks.`
  }), t;
}
const Ks = "Plenio · ", Qt = 16384, Qs = 24576, Mn = [1024, 2048, 6144], Js = [8192, 12288], Zs = {
  TextGenerate: [[1, Mn, Qt]],
  PlenioLocalLLM: [
    [4, Mn, Qt],
    [7, Js, Qs]
  ]
};
function er(e) {
  const t = e?.definitions?.subgraphs;
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    if (typeof o?.name != "string" || !o.name.startsWith(Ks)) continue;
    let s = !1;
    for (const r of o.nodes ?? []) {
      const i = r?.widgets_values, a = Zs[String(r?.type)];
      if (!(!a || !Array.isArray(i)))
        for (const [c, d, p] of a)
          typeof i[c] == "number" && d.includes(i[c]) && (i[c] = p, s = !0);
    }
    s && n.push(o.name);
  }
  return n;
}
const mt = "✎ type your own …", $o = ["genre", "mood", "tempo", "key", "meter", "language", "voice", "theme", "lead_instrument"], tr = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].flatMap((e) => [`${e} major`]), nr = ["A", "E", "B", "F#", "C#", "G#", "D", "G", "C", "F", "Bb", "Eb"].map((e) => `${e} minor`), or = {
  key: [...tr, ...nr],
  meter: ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"],
  language: ["English", "German", "Spanish", "French", "Italian", "Portuguese", "Dutch", "Japanese", "Korean", "Chinese"],
  tempo: ["60 BPM", "80 BPM", "90 BPM", "100 BPM", "110 BPM", "120 BPM", "128 BPM", "140 BPM", "174 BPM"]
};
function sr(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of [...t[e] ?? [], ...or[e] ?? []]) {
    const r = String(s).replace(/\s+/g, " ").trim();
    r && !n.has(r.toLowerCase()) && n.set(r.toLowerCase(), r);
  }
  const o = [...n.values()].sort((s, r) => s.localeCompare(r, void 0, { sensitivity: "base" }));
  return ["", mt, ...o];
}
function rr(e, t) {
  if (!Array.isArray(e) || e[0] !== "STRING") return e;
  const n = e[1] ?? {};
  return n.multiline ? e : ["COMBO", { ...n, options: t, default: typeof n.default == "string" ? n.default : "" }];
}
function ir(e, t) {
  const n = [], o = (s, r) => {
    if (s)
      for (const [i, a] of Object.entries(s)) {
        if ($o.includes(i)) {
          const p = rr(a, sr(i, t));
          p !== a && (s[i] = p, n.push(r + i));
          continue;
        }
        const d = (Array.isArray(a) ? a[1] : void 0)?.options;
        if (Array.isArray(d))
          for (const p of d) {
            const h = p?.inputs;
            o(h?.required, `${i}.`), o(h?.optional, `${i}.`);
          }
      }
  };
  return o(e.input?.required, ""), o(e.input?.optional, ""), [...new Set(n)];
}
const Ao = (e) => e.name.split(".").pop() ?? e.name;
function ar(e) {
  return $o.includes(Ao(e)) && Array.isArray(e.options?.values);
}
function $n(e) {
  const t = e.options.values, n = typeof e.value == "string" ? e.value : "";
  n && n !== mt && !t.includes(n) && t.splice(2, 0, n);
}
function Jt(e, t) {
  Lo.set(e, t);
  const n = An.get(e) ?? /* @__PURE__ */ new WeakSet();
  An.set(e, n);
  for (const o of e.widgets ?? []) {
    if (!ar(o) || ($n(o), n.has(o))) continue;
    n.add(o);
    let s = typeof o.value == "string" && o.value !== mt ? o.value : "";
    const r = o.callback;
    o.callback = function(i) {
      if (i !== mt) {
        s = typeof i == "string" ? i : "", r?.call(this, i);
        return;
      }
      o.value = s, t(Ao(o), s).then((a) => {
        const c = a?.replace(/\s+/g, " ").trim();
        c && (o.value = c, $n(o), o.callback?.(c), e.setDirtyCanvas?.(!0, !0));
      });
    };
  }
}
const An = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap();
function cr(e) {
  const t = Lo.get(e);
  t && Jt(e, t);
}
let Ln = null;
const lr = 8e3;
function ur(e) {
  const t = e.fetchApi("/plenio/api/v1/briefs").then(async (n) => n.ok ? (await n.json()).values ?? {} : {}).catch(() => ({}));
  return Ln ??= Promise.race([t, new Promise((n) => setTimeout(() => n({}), lr))]), Ln;
}
async function dr(e, t, n, o) {
  const s = await ur(n);
  if (!Object.keys(s).length) return;
  ir(t, s);
  const r = e.prototype;
  r.onNodeCreated = U(r.onNodeCreated, function() {
    Jt(this, o);
  }), r.onConfigure = U(r.onConfigure, function() {
    Jt(this, o);
  });
}
const xt = [
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
], Co = ["length", "vocals", "melody"], hn = {
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
}, fr = "my own, sung as written below", pr = "custom";
function No(e) {
  return typeof e == "string" && e.trim().toLowerCase() === pr;
}
function ae(e, t) {
  const n = hn[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function hr(e) {
  const t = {};
  for (const n of [...xt, ...Co, "lyrics_from"]) {
    const o = ae(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function Cn(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
const _e = (e) => typeof e == "string" ? e : String(e ?? "");
function St(e) {
  return Object.keys(e.sources).filter((t) => xt.includes(t));
}
function mr(e, t, n = {}) {
  const o = [];
  for (const i of St(t)) {
    const a = ae(e, i);
    if (!a) continue;
    const c = _e(a.value), d = t.fields[i] ?? "", p = (n[i] ?? []).includes(c);
    (!c.trim() || p) && c !== d && o.push({ field: i, value: d });
  }
  const s = ae(e, "lyrics"), r = [...n.lyrics ?? [], t.fields.lyrics ?? ""].filter(Boolean);
  return s && _e(ae(e, "lyrics_from")?.value) === fr && r.includes(_e(s.value)) && o.push({ field: "lyrics", value: "" }), o;
}
function Nn(e, t) {
  const n = [];
  for (const o of St(t)) {
    const s = ae(e, o), r = t.fields[o] ?? "";
    s && _e(s.value) !== r && n.push({ field: o, value: r });
  }
  return n;
}
function gr(e, t) {
  const n = { template: [], own: [] };
  for (const o of St(t)) {
    const s = _e(ae(e, o)?.value).trim();
    s && n[s === (t.fields[o] ?? "").trim() ? "template" : "own"].push(o);
  }
  return n;
}
function lt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function wr(e, t, n) {
  if (!n || !t || t.template === "none") return null;
  const { template: o, own: s } = gr(e, t), r = [
    o.length ? `From the template: ${o.join(", ")}` : "",
    s.length ? `your own: ${s.join(", ")}` : ""
  ].filter(Boolean);
  return r.length ? r.join(" · ") : "The template has no text for these fields.";
}
function yr(e) {
  const t = e ? lt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function br(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function vr(e) {
  const t = e?.mode;
  return t?.description ? `Creative mode ${t.name} (experimental): ${t.description}` : null;
}
function Qe(e, t) {
  for (const n of t) {
    const o = ae(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function To(e) {
  const t = [];
  for (const n of xt) {
    const o = ae(e, n);
    !o || !No(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Tn = "plenio_brief_template", xr = 400;
function Sr(e, t) {
  let n = null, o = null;
  const s = {};
  let r = !1, i = null, a;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const d = document.createElement("div");
  d.className = "line";
  const p = document.createElement("div");
  p.className = "hint";
  const h = document.createElement("div");
  h.className = "mode";
  const S = document.createElement("div");
  S.className = "actions", c.append(d, p, h, S);
  const y = (g, _, x) => {
    const T = document.createElement("button");
    return T.textContent = g, T.title = _, T.addEventListener("click", (N) => {
      N.stopPropagation(), x();
    }), S.append(T), T;
  }, M = y("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (Qe(e, lt(n)), G());
  }), P = y("Refill from template", "Put the template’s value back into every text field you changed", () => {
    if (!n) return;
    const g = Nn(e, n);
    if (!g.length) return;
    const _ = g.map((x) => x.field).join(", ");
    window.confirm(`Replace your values in ${_} with the template's?`) && (Qe(e, g), G());
  }), B = y("↻", "Ask again what the template fills", () => {
    w();
  }), G = () => {
    d.textContent = i ?? wr(e, n, r) ?? "No template: the fields hold your values only.", d.dataset.state = i ? "error" : r && n ? "ok" : "empty";
    const g = yr(n), _ = br(n);
    p.textContent = [g, _].filter(Boolean).join(" · "), p.style.display = p.textContent ? "" : "none", h.textContent = vr(n) ?? "", h.style.display = h.textContent ? "" : "none", S.style.display = r && n && n.template !== "none" ? "" : "none", M.disabled = !n || !lt(n).length, P.disabled = !n || !Nn(e, n).length, B.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, l = (g) => {
    const _ = String(e.widgets?.find((T) => T.name === "template")?.value ?? "none");
    if (g.template !== (_ || "none")) return;
    if (o !== null && o !== g.template) {
      const T = Cn(e) === "cover", N = (D) => T || (s[D] ?? []).includes(_e(ae(e, D)?.value));
      Qe(e, lt(g).filter((D) => N(D.field)));
    }
    const x = mr(e, g, s);
    x.length && Qe(e, x);
    for (const T of [...St(g), ...Co]) {
      const N = _e(ae(e, T)?.value);
      N && N === (g.fields[T] ?? "") && !(s[T] ??= []).includes(N) && s[T].push(N);
    }
    o = g.template;
  }, A = /* @__PURE__ */ new WeakSet(), C = () => {
    kr(e);
    for (const g of ["template", "arrangement", ...Object.keys(hn)]) {
      const _ = g === "template" || g === "arrangement" ? e.widgets?.find((x) => x.name === g) : ae(e, g);
      !_ || A.has(_) || (A.add(_), _.callback = U(_.callback, () => {
        C(), w();
      }));
    }
    cr(e);
  }, b = async () => {
    C();
    const g = String(e.widgets?.find((_) => _.name === "template")?.value ?? "none");
    try {
      const _ = String(e.widgets?.find((x) => x.name === "arrangement")?.value ?? "");
      n = await Ds(t, { fields: hr(e), template: g, kind: Cn(e), arrangement: _ }), i = null, l(n);
    } catch (_) {
      n = null, i = `The template fields could not be read: ${_ instanceof Error ? _.message : String(_)}`;
    }
    r = !0, G();
  };
  function w() {
    clearTimeout(a), a = setTimeout(() => {
      b();
    }, xr);
  }
  C();
  const v = e.addDOMWidget(Tn, Tn, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 128
  });
  return v.serialize = !1, To(e), G(), w(), {
    widget: v,
    refresh: w,
    answer: () => n,
    dispose: () => clearTimeout(a)
  };
}
const _r = {
  "vocals.lyrics_from": "lyrics",
  "vocals.lyrics": "lyrics idea or text"
};
function kr(e) {
  for (const t of e.widgets ?? []) {
    const n = _r[t.name];
    n && t.label !== n && (t.label = n);
  }
}
const Pn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Er(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, Sr(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), To(this), n.get(this)?.refresh();
  };
}
const On = "plenio.record/1", Mr = 2, $r = "PLNO", Je = new TextEncoder().encode(`${$r}plenio.project/1\0`), In = 32 * 2 ** 20;
class pe extends Error {
}
async function Nt(e, t, n) {
  return new Uint8Array(await e.slice(t, t + n).arrayBuffer());
}
function Tt(e, t) {
  return e.length >= t.length && t.every((n, o) => e[o] === n);
}
async function Ar(e) {
  const t = e.stream().pipeThrough(new DecompressionStream("gzip")).getReader(), n = [];
  let o = 0;
  for (; ; ) {
    const { done: i, value: a } = await t.read();
    if (i) break;
    if (o += a.length, o > In)
      throw await t.cancel(), new pe(`its Plenio project is larger than ${In / 2 ** 20} MB`);
    n.push(a);
  }
  const s = new Uint8Array(o);
  let r = 0;
  for (const i of n)
    s.set(i, r), r += i.length;
  return new TextDecoder().decode(s);
}
async function Po(e) {
  if (!Tt(await Nt(e, 0, 4), new TextEncoder().encode("fLaC"))) throw new pe("it is not a FLAC file");
  let t = 4;
  for (; ; ) {
    const n = await Nt(e, t, 4);
    if (n.length < 4) throw new pe("the file ends inside its metadata");
    const o = n[1] << 16 | n[2] << 8 | n[3];
    if ((n[0] & 127) === Mr && o >= 4) {
      const s = await Nt(e, t + 4, Math.min(o, Je.length));
      if (Tt(s, Je.subarray(0, 4))) {
        if (!Tt(s, Je)) throw new pe("it holds a Plenio project of an unknown layout (made by a newer Plenio)");
        let r;
        try {
          r = await Ar(e.slice(t + 4 + Je.length, t + 4 + o));
        } catch (a) {
          throw a instanceof pe ? a : new pe(`its Plenio project is damaged (${a instanceof Error ? a.message : String(a)})`);
        }
        let i;
        try {
          i = JSON.parse(r);
        } catch {
          throw new pe("its Plenio project is damaged (no JSON)");
        }
        if (i?.schema !== On)
          throw new pe(`its Plenio project is no release record (${On})`);
        return i;
      }
    }
    if (n[0] & 128) return null;
    t += 4 + o;
  }
}
function Oo(e) {
  return /\.flac$/i.test(e.name ?? "") || e.type === "audio/flac" || e.type === "audio/x-flac";
}
const mn = "plenio.sheet_state/1", Ge = ["title", "style", "lyrics", "score", "artwork_prompt"];
function _t() {
  return { schema: mn, docs: {} };
}
function Ee(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return _t();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== mn || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function He(e) {
  const t = {};
  for (const o of Ge) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: mn, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Pt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function Lr(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ge.filter((o) => Pt(e, o) !== "auto").map(
    (o) => o === "lyrics" && Pt(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${Pt(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function Dc(e) {
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
const Hc = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function Fc(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function jc(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function Rn(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function Wc(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: Rn(s?.[0] ?? 0), end: Rn(r?.[1] ?? e.duration_s) };
  }) : [];
}
function ke(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, o = t.length;
  for (; n < o && !t[n]; ) n++;
  for (; o > n && !t[o - 1]; ) o--;
  return t.slice(n, o).join(`
`);
}
function Cr(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function Gc(e, t, n) {
  return n.map((o) => ({ kind: o, text: Cr(e, t, o), intent: "keep" }));
}
function Io(e, t, n) {
  const o = { ...e.docs };
  for (const r of n) {
    const i = e.docs[r.kind], a = t?.docs[r.kind], c = ke(r.text);
    if (r.intent === "auto")
      delete o[r.kind];
    else if (r.intent === "manual")
      o[r.kind] = { state: "manual", text: c };
    else if (r.intent === "rebase")
      a?.upstream_sha256 ? o[r.kind] = { state: "edited", text: c, base_sha256: a.upstream_sha256 } : o[r.kind] = { state: "manual", text: c };
    else if (i)
      ke(i.text) !== c && (o[r.kind] = { ...i, text: c });
    else {
      const d = ke(a?.upstream ?? "");
      if (c === d) continue;
      o[r.kind] = a?.upstream_sha256 ? { state: "edited", text: c, base_sha256: a.upstream_sha256 } : { state: "manual", text: c };
    }
  }
  const s = { ..._t(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function Nr(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Ro(e, t) {
  return Ge.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function Tr(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const Pr = "PlenioSongSheet";
function qo(e) {
  return e.nodes ?? e._nodes ?? [];
}
function Or(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? qo(e).find((o) => String(o.id) === t) ?? null;
}
function Ot(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = Or(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function Ir(e, t) {
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
function Rr(e, t) {
  const n = { values: 0, missing: [], sheets: 0, activated: 0 };
  for (const o of t.activate) {
    const s = Ot(e, o);
    s && s.mode !== 0 && (s.mode = 0, n.activated++);
  }
  for (const [o, s] of Object.entries(t.values)) {
    const r = Ot(e, o);
    if (!r) {
      n.missing.push(...Object.keys(s).map((a) => `${o}: ${a}`));
      continue;
    }
    const i = Ir(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = Ot(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function qr(e, t) {
  let n = 0;
  for (const o of qo(e)) {
    if (o.type !== Pr) continue;
    const s = o.widgets?.find((h) => h.name === "sheet_state");
    if (!s) continue;
    const r = Ee(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((h) => h.link != null).map((h) => h.name), a = Ro(i, r), c = (a.length ? a : [...Ge]).filter((h) => !!t[h]);
    if (!c.length) continue;
    const d = { ...r.docs };
    for (const h of c) d[h] = { state: "manual", text: t[h] };
    const p = He({ ...r, docs: d, review: void 0 });
    s.value = p, s.callback?.(p), n++;
  }
  return n;
}
function zr(e, t) {
  return (e.split(/[\\/]/).pop() ?? "").replace(/\.plenio\.json$/i, "").replace(/\.(json|flac)$/i, "") || t || "Plenio song";
}
function It(e, t) {
  const n = [e.plenio && `Plenio ${e.plenio}`, e.created.slice(0, 10)].filter(Boolean).join(", "), o = t?.sheets ? " Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again." : "";
  if (e.from === "record") return `"${e.title}" opened in the workflow it was made with (${n}).${o}`;
  if (e.from === "template") {
    const s = e.unplaced.length ? ` ${e.unplaced.length} node(s) of the song have no place in today's template: ${e.unplaced.join(", ")}.` : "";
    return `"${e.title}" (${n}) opened in today's template "${e.template}" with the song's settings.${o}${s}`;
  }
  return `The workflow "${e.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`;
}
const Zt = "Plenio was updated while this page was open: reload the page (F5).";
function Br(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function Dr(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function gn(e, t) {
  const n = Br(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? Dr(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function wn(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Be(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${Zt} ${n}` : Zt) : o;
  }
}
const Rt = "Plenio.ContinueSong", Hr = "plenio.record/1";
function en(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function gt(e, t) {
  const n = await Fs(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, zr("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = Rr(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), en(e, "success", "Song opened", It(n, i));
    return;
  }
  const o = e.app.graph, s = o ? qr(o, n.documents) : 0;
  if (!s)
    throw new Q(
      It(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  en(e, "success", "Song texts taken", `${It(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function Fr(e) {
  if (Oo(e)) return Po(e);
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === Hr ? t : null;
  } catch {
    return null;
  }
}
function qn(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function jr(e, t) {
  const n = [...e.dataTransfer?.files ?? []];
  if (n.length !== 1 || !Oo(n[0]) || e.shiftKey) return null;
  const o = t.canvas, s = t.graph;
  if (!o?.canvas || e.target !== o.canvas || !o.convertEventToCanvasOffset || !s?.getNodeOnPos) return null;
  const [r, i] = o.convertEventToCanvasOffset(e);
  return s.getNodeOnPos(r, i) ? null : n[0];
}
function Wr(e, t = window) {
  const n = (o) => {
    const s = qn(o) ? null : jr(o, e.app), r = s ?? qn(o);
    r && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      if (s) {
        const a = await Po(s);
        if (a) return gt(e, { record: a, name: s.name });
        if (!e.app.handleFile) throw new Q(`${s.name} carries no Plenio project.`, "Drop it with Shift held to give it to ComfyUI.");
        return e.app.handleFile(s);
      }
      const i = await Fr(r);
      if (!i) throw new Q(`${r.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await gt(e, { record: i, name: r.name });
    })().catch((i) => {
      const a = i instanceof pe ? `${r.name}: ${i.message}.` : i instanceof Q && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
      en(e, "error", "Song not opened", a, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function Gr(e) {
  const t = () => gn(import.meta.url, wn), { openContinueDialog: n } = await Be(() => import("./openContinue-BweLuOjQ.mjs"), t);
  n(e.fetcher, (o) => gt(e, o));
}
const Vr = "COMFY_DYNAMICCOMBO_V3";
function Ur(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function Yr(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Xr(e, t) {
  const n = Yr(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function Kr(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function Qr(e, t, n) {
  if (!t || !e.widgets || Xr(e, t)) return !1;
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
    if (n.has(r.name) && !Kr(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function Jr(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === Vr && t.add(o);
  return t;
}
const zo = "plenio.eq/1", ut = 8, be = 20, Zr = 2e4, Ie = 12, Bo = 15, Ne = ["peak", "low_shelf", "high_shelf"], Do = ["peak", "notch", "highpass", "lowpass"], zn = [0.2, 10], Bn = [0.25, 1];
function Le() {
  return { schema: zo, preamp_db: 0, bands: [] };
}
function ei(e) {
  if (typeof e != "string" || !e.trim()) return Le();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: zo,
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
function Ce(e) {
  return JSON.stringify(e);
}
const ee = (e, t) => Number(e.toFixed(t));
function K(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ho(e) {
  return e.db ?? Bo;
}
const Dn = [6, 12, 18], ti = { 6: 8, 12: 14, 18: 20 };
function ni(e, t) {
  return { ...e, db: ti[t] ?? Bo };
}
function Se(e, t) {
  return Math.log(K(t, be, e.maxHz) / be) / Math.log(e.maxHz / be) * e.width;
}
function Hn(e, t) {
  return be * (e.maxHz / be) ** K(t / e.width, 0, 1);
}
function ye(e, t) {
  const n = Ho(e);
  return (1 - (K(t, -n, n) + n) / (2 * n)) * e.height;
}
function Fn(e, t) {
  const n = Ho(e);
  return (1 - K(t / e.height, 0, 1)) * 2 * n - n;
}
function jn(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function Wn(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${Se(e, o).toFixed(1)},${ye(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function yn(e) {
  return Math.min(Zr, 0.45 * e);
}
function oi(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function si(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= ut) return null;
  const s = {
    id: oi(e),
    enabled: !0,
    type: "peak",
    frequency_hz: ee(K(t, be, yn(o)), 1),
    gain_db: ee(K(n, -Ie, Ie), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function Re(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: ee(K(n, be, yn(s)), 1),
        gain_db: Ne.includes(r.type) ? ee(K(o, -Ie, Ie), 1) : r.gain_db
      }
    )
  };
}
function qt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: ee(K(o.q * n, 0.2, 10), 3) } : o)
  };
}
function zt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function qe(e) {
  const t = e.frequency_hz >= 1e3 ? `${ee(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Ne.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${ee(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${ee(e.q, 2)}`;
}
function ri(e, t) {
  const n = Fo[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Ne.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = Do.includes(e.type) ? ` Q ${ee(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const Fo = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Bt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), o = 1;
  if (t && /k$/i.test(n) && (o = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const s = Number(n) * o;
  return Number.isFinite(s) ? s : null;
}
function Ze(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function dt(e, t, n, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: ee(K(Ze(r.frequency_hz, s.frequency_hz), be, yn(o)), 1),
        gain_db: ee(K(Ze(r.gain_db, s.gain_db), -Ie, Ie), 1),
        q: ee(K(Ze(r.q, s.q), zn[0], zn[1]), 3),
        slope: ee(K(Ze(r.slope, s.slope), Bn[0], Bn[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function Gn(e, t) {
  return dt(e, t, { gain_db: 0 });
}
function Vn(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((h) => Number.isFinite(h));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), c = e.height - 4, d = c - Math.max(12, e.height * K(o, 0.1, 0.95));
  return `M${t.map((h, S) => {
    const y = n[S], M = Number.isFinite(y) ? (y - i) / a : 0;
    return `${Se(e, h).toFixed(1)},${(c - M * (c - d)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${c.toFixed(1)} L0,${c.toFixed(1)} Z`;
}
class ii {
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
    Ce(t) !== Ce(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const ai = "http://www.w3.org/2000/svg", Un = "plenio_eq_panel", et = "mode.bands", me = { capture: !0 }, re = { width: 560, height: 260 }, tt = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Dt = null;
function de(e, t) {
  const n = document.createElementNS(ai, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function W(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function xe(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function fe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function ci(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function li(e, t) {
  const n = W("div", "plenio-eq"), o = W("div", "plenio-eq-tools"), s = W("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = W("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const u of Dn) r.append(new Option(`±${u} dB`, String(u)));
  const i = xe("", "↶", "Undo the last band change"), a = xe("", "↷", "Redo the last band change"), c = xe("", "reset", "Remove every band"), d = xe("", "compare", "Show the curve without the EQ (bypass)"), p = xe("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), h = W("span", "plenio-eq-info");
  h.setAttribute("aria-live", "polite"), h.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, c, d, p, h);
  const S = W("div", "plenio-eq-mode"), y = de("svg", {
    viewBox: `0 0 ${re.width} ${re.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  y.setAttribute("aria-label", "EQ response curve"), y.setAttribute("tabindex", "0"), y.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const M = W("div", "plenio-eq-strip"), P = W("div", "plenio-eq-editor"), B = W("div", "plenio-eq-fields");
  P.append(B), n.append(o, S, y, M, P);
  const G = e.addDOMWidget(Un, Un, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  G.serialize = !1;
  let l = { sampleRate: 48e3, frequencies: [], response: [], settings: Le(), readonly: !0, note: "" }, A = null, C = null, b = !1, w = 12, v = null, g = [], _ = 0, x, T, N = null, D = !1;
  const F = /* @__PURE__ */ new Map();
  let j = null;
  const I = new ii(Le()), te = () => fe(e, et), se = () => w, $ = () => ni({ ...re, maxHz: Math.min(2e4, l.sampleRate / 2) }, se());
  function R(u, { record: m = !0 } = {}) {
    const f = te();
    if (!f) return;
    const k = Ce(u);
    f.value = k, f.callback?.(k), m && I.push(u), l = { ...l, settings: u }, Y(), le(0);
  }
  async function le(u = 120) {
    clearTimeout(x), x = setTimeout(async () => {
      const m = String(fe(e, "mode")?.value ?? "flat");
      if (m !== "manual") {
        m === "flat" ? l = {
          ...l,
          settings: Le(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : A !== m ? l = {
          ...l,
          settings: Le(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: `${m}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : l = { ...l, readonly: !0 }, Y();
        return;
      }
      const f = ei(te()?.value);
      if (!f) {
        l = { ...l, readonly: !0, note: "the bands are not valid JSON" }, Y();
        return;
      }
      Ce(f) !== Ce(I.current) && I.reset(f);
      const k = ++_;
      try {
        const L = await kn(t, f, l.sampleRate);
        if (k !== _) return;
        l = {
          ...l,
          frequencies: L.frequency_hz,
          response: L.response_db,
          settings: L.settings,
          readonly: !1,
          note: ""
        };
      } catch (L) {
        l = { ...l, readonly: !1, note: L instanceof Error ? L.message : String(L) };
      }
      Y();
    }, u);
  }
  const $e = (u) => ({
    ...u.settings,
    bands: u.settings.bands.slice(0, ut)
  });
  function Ue() {
    if (!v) return "";
    const u = g.find((m) => m.name === v);
    return u && ci($e(u), l.settings) ? v : "";
  }
  function Y() {
    y.replaceChildren(), F.clear(), j = null;
    const u = $();
    for (const f of [-u.db, -u.db / 2, 0, u.db / 2, u.db])
      y.append(
        de("line", { x1: 0, x2: u.width, y1: ye(u, f), y2: ye(u, f), class: f ? "grid" : "grid zero" })
      );
    for (const f of [100, 1e3, 1e4])
      y.append(de("line", { x1: Se(u, f), x2: Se(u, f), y1: 0, y2: u.height, class: "grid" }));
    l.beforeDb?.length === l.frequencies.length && y.append(de("path", { d: Vn(u, l.frequencies, l.beforeDb), class: "spectrum before" })), l.afterDb?.length === l.frequencies.length && y.append(de("path", { d: Vn(u, l.frequencies, l.afterDb), class: "spectrum after" })), b ? y.append(de("line", { x1: 0, x2: u.width, y1: ye(u, 0), y2: ye(u, 0), class: "curve flat" })) : l.frequencies.length && (j = de("path", { d: Wn(u, l.frequencies, l.response), class: "curve" }), y.append(j)), !l.readonly && !b && l.settings.bands.forEach((f, k) => {
      const L = tt[k % tt.length], q = Ne.includes(f.type) ? f.gain_db : 0, E = de("circle", {
        cx: Se(u, f.frequency_hz),
        cy: ye(u, q),
        r: f.id === C ? 9 : 7,
        class: f.id === C ? "handle selected" : "handle",
        style: `stroke: ${L}`,
        tabindex: 0,
        "data-band": f.id
      });
      E.setAttribute("aria-label", `Band ${k + 1}: ${qe(f)}`), f.enabled || E.classList.add("disabled"), E.append(de("title", {})), E.lastChild.textContent = `Band ${k + 1}: ${qe(f)}`, E.addEventListener("pointerdown", (H) => Ls(H, f.id)), E.addEventListener("dblclick", (H) => {
        H.stopPropagation(), R(Gn(l.settings, f.id));
      }), E.addEventListener("focus", () => Ms(f.id)), E.addEventListener("keydown", (H) => vn(H, f.id)), E.addEventListener("wheel", (H) => {
        H.preventDefault();
        const ve = H.deltaY < 0 ? 1.15 : 1 / 1.15;
        R(qt(l.settings, f.id, ve));
      }), E.addEventListener("contextmenu", (H) => {
        H.preventDefault(), R(zt(l.settings, f.id));
      }), y.append(E), F.set(f.id, E);
    }), kt(), he(), Et();
    const m = l.settings.bands.find((f) => f.id === C);
    h.textContent = l.note || (b ? "compare: the curve is off (the node still applies it)" : m ? qe(m) : l.readonly ? `${l.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${l.settings.bands.length}/${ut}`), s.disabled = l.readonly, i.disabled = !I.canUndo, a.disabled = !I.canRedo, c.disabled = l.readonly || !l.settings.bands.length, D && (D = !1, C && F.get(C)?.focus({ preventScroll: !0 })), r.value = String(w), s.value = Ue(), d.classList.toggle("active", b), p.classList.toggle("active", $t()), e.setDirtyCanvas?.(!0, !0);
  }
  function kt() {
    if (M.replaceChildren(), l.readonly && !l.settings.bands.length) {
      M.append(W("span", "plenio-eq-hint", l.note || "no bands"));
      return;
    }
    l.settings.bands.forEach((u, m) => {
      const f = W("button", "plenio-eq-chip", ri(u, m));
      f.style.borderLeftColor = tt[m % tt.length], f.classList.toggle("selected", u.id === C), f.classList.toggle("disabled", !u.enabled), f.setAttribute("aria-label", `Edit band ${m + 1}`), f.title = `Band ${m + 1}: ${qe(u)} - click to open its fields`, f.addEventListener("click", (k) => {
        k.stopPropagation(), C = C === u.id ? null : u.id, Y();
      }), M.append(f);
    });
  }
  function he() {
    B.replaceChildren();
    const u = l.settings.bands.find((E) => E.id === C);
    if (!u || l.readonly) {
      P.style.display = "none";
      return;
    }
    P.style.display = "";
    const m = W("span", "name", `Band ${l.settings.bands.indexOf(u) + 1}`);
    m.title = "The selected band";
    const f = W("select");
    f.setAttribute("aria-label", "Band type"), f.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [E, H] of Object.entries(Fo)) f.append(new Option(H, E));
    f.value = u.type, f.addEventListener("change", () => R(dt(l.settings, u.id, { type: f.value })));
    const k = W("input");
    k.type = "checkbox", k.checked = u.enabled, k.setAttribute("aria-label", "Band enabled"), k.title = "Band enabled: off keeps the band in the list but out of the response", k.addEventListener("change", () => R(dt(l.settings, u.id, { enabled: k.checked })));
    const L = [
      [
        "Hz",
        `${u.frequency_hz}`,
        70,
        (E) => Lt(u.id, "frequency_hz", Bt(E, { kilo: !0 }))
      ],
      ["dB", `${u.gain_db}`, 60, (E) => Lt(u.id, "gain_db", Bt(E))],
      ["Q", `${u.q}`, 60, (E) => Lt(u.id, "q", Bt(E))]
    ];
    B.append(m, f, k);
    for (const [E, H, ve, Ye] of L) {
      const J = W("input", "number");
      J.value = H, J.style.width = `${ve}px`, J.setAttribute("aria-label", `Band ${E}`), J.title = E === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : E === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const Xe = () => {
        Ye(J.value) || (J.value = H);
      };
      J.addEventListener("keydown", (ue) => {
        ue.key === "Enter" && Xe();
      }), J.addEventListener("blur", Xe), (E === "dB" && !Ne.includes(u.type) || E === "Q" && !Do.includes(u.type)) && (J.disabled = !0), B.append(J);
    }
    const q = xe("", "remove", "Remove this band");
    q.addEventListener("click", (E) => {
      E.stopPropagation(), C = null, R(zt(l.settings, u.id));
    }), B.append(q);
  }
  function Et() {
    S.replaceChildren();
    const u = String(fe(e, "mode")?.value ?? "flat");
    if (u === "manual" || u === "flat") {
      S.style.display = "none";
      return;
    }
    S.style.display = "", S.append(
      W(
        "span",
        "plenio-eq-hint",
        A === u ? `applied proposal (${l.settings.bands.length} band(s), ${u})` : `${u}: no proposal yet - it is computed on the next run`
      )
    );
    const m = xe("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    m.disabled = !l.settings.bands.length, m.addEventListener("click", (f) => {
      f.stopPropagation();
      const k = fe(e, "mode");
      if (!k) return;
      k.value = "manual", k.callback?.("manual");
      const L = te();
      if (L) {
        const q = Ce(l.settings);
        L.value = q, L.callback?.(q);
      }
      I.reset(l.settings), Ct(), le(0);
    }), S.append(m);
  }
  function Ms(u) {
    C = u, D = !0, Y();
  }
  function $s(u) {
    C = u, Mt();
  }
  function Mt() {
    const u = $();
    l.settings.bands.forEach((f) => {
      const k = F.get(f.id);
      if (!k) return;
      const L = Ne.includes(f.type) ? f.gain_db : 0;
      k.setAttribute("cx", String(Se(u, f.frequency_hz))), k.setAttribute("cy", String(ye(u, L))), k.classList.toggle("selected", f.id === C), k.setAttribute("r", f.id === C ? "9" : "7");
    }), j && l.frequencies.length && j.setAttribute("d", Wn(u, l.frequencies, l.response));
    const m = l.settings.bands.find((f) => f.id === C);
    m && (h.textContent = qe(m));
  }
  function As() {
    clearTimeout(T), T = setTimeout(async () => {
      const u = l.settings, m = ++_;
      try {
        const f = await kn(t, u, l.sampleRate);
        if (m !== _) return;
        l = { ...l, frequencies: f.frequency_hz, response: f.response_db }, Mt();
      } catch {
      }
    }, 60);
  }
  function $t() {
    return !fe(e, et)?.plenioHidden;
  }
  function At(u) {
    const m = fe(e, et);
    m && (m.plenioHidden = !u, u ? delete m.computeSize : m.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Lt(u, m, f) {
    if (f === null) return !1;
    const k = l.settings.bands.find((L) => L.id === u);
    return k && k[m] === f || R(dt(l.settings, u, { [m]: f })), !0;
  }
  function Ls(u, m) {
    u.preventDefault(), u.stopPropagation(), C !== m && $s(m);
    const f = l.settings.bands.find((ne) => ne.id === m);
    if (!f) return;
    N = { hz: f.frequency_hz, db: f.gain_db };
    let k = !1, L = !1;
    const q = u.currentTarget;
    try {
      q?.setPointerCapture?.(u.pointerId);
    } catch {
    }
    const E = y.getBoundingClientRect(), H = E.width ? E.left : 0, ve = E.height ? E.top : 0, Ye = E.width || re.width, J = E.height || re.height, Xe = (ne, Ke) => ne >= H - 1 && ne <= H + Ye + 1 && Ke >= ve - 1 && Ke <= ve + J + 1;
    function ue() {
      if (!L) {
        L = !0;
        try {
          q?.releasePointerCapture?.(u.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", _n, me), window.removeEventListener("pointerup", ue, me), window.removeEventListener("pointercancel", ue, me), window.removeEventListener("blur", ue, me), N = null, k && R(l.settings);
      }
    }
    const _n = (ne) => {
      if (L || !N) return;
      if (ne.buttons === 0) {
        ue();
        return;
      }
      if (!Xe(ne.clientX, ne.clientY)) return;
      const Ke = re.width / Ye, Ns = re.height / J, Ts = (ne.clientX - H) * Ke, Ps = (ne.clientY - ve) * Ns, Os = Se($(), N.hz), Is = ye($(), N.db), Rs = Hn($(), jn(Os, Ts, ne.shiftKey)), qs = Fn($(), jn(Is, Ps, ne.shiftKey));
      l = { ...l, settings: Re(l.settings, m, Rs, qs, l.sampleRate) }, k = !0, Mt(), As();
    };
    window.addEventListener("pointermove", _n, me), window.addEventListener("pointerup", ue, me), window.addEventListener("pointercancel", ue, me), window.addEventListener("blur", ue, me);
  }
  function vn(u, m) {
    const f = l.settings.bands.find((E) => E.id === m);
    if (!f) return;
    const k = u.shiftKey ? 0.1 : 0.5, L = u.shiftKey ? 1.01 : 1.06;
    let q = null;
    u.key === "ArrowUp" ? q = Re(l.settings, m, f.frequency_hz, f.gain_db + k, l.sampleRate) : u.key === "ArrowDown" ? q = Re(l.settings, m, f.frequency_hz, f.gain_db - k, l.sampleRate) : u.key === "ArrowRight" ? q = Re(l.settings, m, f.frequency_hz * L, f.gain_db, l.sampleRate) : u.key === "ArrowLeft" ? q = Re(l.settings, m, f.frequency_hz / L, f.gain_db, l.sampleRate) : u.key === "+" ? q = qt(l.settings, m, 1.15) : u.key === "-" ? q = qt(l.settings, m, 1 / 1.15) : u.key === "0" ? q = Gn(l.settings, m) : (u.key === "Delete" || u.key === "Backspace") && (q = zt(l.settings, m)), q && (u.preventDefault(), R(q));
  }
  y.addEventListener("keydown", (u) => {
    C && u.target === y && vn(u, C);
  }), y.addEventListener("dblclick", (u) => {
    if (l.readonly || b) return;
    const m = y.getBoundingClientRect(), f = re.width / (m.width || re.width), k = re.height / (m.height || re.height), L = (u.clientX - m.left) * f, q = (u.clientY - m.top) * k, E = si(l.settings, Hn($(), L), Fn($(), q), l.sampleRate);
    E ? (C = E.bands[E.bands.length - 1].id, R(E)) : (l = { ...l, note: `the EQ has at most ${ut} bands` }, Y());
  }), s.append(new Option("preset…", "")), Dt ??= Hs(t).then((u) => u.manual).catch(() => []), Dt.then((u) => {
    g = u;
    for (const m of u) s.append(new Option(m.name, m.name));
    s.value = Ue();
  }), s.addEventListener("change", async () => {
    const u = (await Dt)?.find((m) => m.name === s.value);
    u && (v = u.name, R($e(u)));
  }), r.addEventListener("change", () => {
    const u = Number(r.value);
    w = Dn.find((m) => m === u) ?? 12, Y();
  }), i.addEventListener("click", () => {
    const u = I.undo();
    u && R(u, { record: !1 });
  }), a.addEventListener("click", () => {
    const u = I.redo();
    u && R(u, { record: !1 });
  }), c.addEventListener("click", () => {
    C = null, R(Le());
  }), d.addEventListener("click", () => {
    b = !b, Y();
  }), p.addEventListener("click", () => {
    At(!$t()), Y();
  });
  function Ct() {
    for (const u of ["mode", et]) {
      const m = fe(e, u);
      if (!m || m.plenioWatched) continue;
      m.plenioWatched = !0;
      const f = m.callback;
      m.callback = (k) => {
        f?.(k), setTimeout(() => {
          $t() || At(!1), le();
        });
      };
    }
  }
  Ct(), At(!1), le(0);
  let xn = null, Sn = null;
  const Cs = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(Cs);
      return;
    }
    const u = String(fe(e, "mode")?.value ?? "flat"), m = String(te()?.value ?? "");
    u === xn && m === Sn || (xn = u, Sn = m, Ct(), le(0));
  }, 700);
  return {
    showExecuted(u) {
      const m = u?.plenio_eq, f = m?.[m.length - 1];
      if (!f) return;
      const k = String(fe(e, "mode")?.value ?? "flat"), L = k === "manual";
      A = L || k === "flat" ? null : k, l = {
        sampleRate: f.sample_rate,
        frequencies: f.frequency_hz,
        response: f.response_db,
        settings: f.settings,
        readonly: !L,
        note: L ? "" : `applied: ${f.settings.bands.length} band(s)`,
        beforeDb: f.spectrum_before_db,
        afterDb: f.spectrum_after_db
      }, L ? le(0) : Y();
    }
  };
}
const bn = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, ui = new Set(xt.map((e) => hn[e]));
function di(e, t) {
  return !(e in bn) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => ui.has(n) && No(o)).map(([n]) => n);
}
const Yn = ["written from the idea below", "my own, sung as written below"], jo = 7, Ht = jo + 4;
function fi(e) {
  return !["sung", "sparse vocals"].includes(String(e[jo])) || Yn.includes(e[Ht]) ? e : [...e.slice(0, Ht), Yn[0], "", ...e.slice(Ht)];
}
function pi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const hi = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function mi(e, t) {
  const n = hi[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
const Xn = 6, gi = 8, wi = 18;
function yi(e) {
  if (e[Xn] !== "tags" || e.length > wi) return e;
  const t = Xn + 1 + gi;
  return [...e.slice(0, t), "", ...e.slice(t)];
}
function bi(e, t) {
  if (e.name === "PlenioExportRelease" && t && Array.isArray(t.widgets_values)) {
    const c = yi(t.widgets_values);
    return c === t.widgets_values ? t : { ...t, widgets_values: c };
  }
  const n = bn[e.name];
  if (!n || !t) return t;
  const o = pi(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = di(e.name, i.widgets_values_named);
  if (a.length) {
    const c = { ...i.widgets_values_named };
    for (const d of a) c[d] = "";
    i = { ...i, widgets_values_named: c };
  }
  if (e.name === "PlenioSongBrief" && Array.isArray(i.widgets_values)) {
    const c = fi(i.widgets_values);
    c !== i.widgets_values && (i = { ...i, widgets_values: c });
  }
  return i;
}
const Wo = /* @__PURE__ */ new Map(), tn = /* @__PURE__ */ new Set();
function Kn(e, t) {
  Wo.set(e, t);
  for (const n of tn) n(e);
}
function Ae(e) {
  return Wo.get(e) ?? null;
}
function vi(e) {
  return tn.add(e), () => tn.delete(e);
}
const Go = /* @__PURE__ */ new Map();
function xi(e) {
  e?.draft_sha256 && Go.set(e.draft_sha256, e);
}
function Si(e) {
  return e ? Go.get(e) ?? null : null;
}
const Qn = "Plenio.OpenPlayer", Jn = "plenio-player", _i = "▶ Open in the Plenio Player";
function nn(e, t, n, o, s = 12e3) {
  e.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function ki(e) {
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
function Zn(e, t) {
  const n = e.endsWith("/") ? e : `${e}/`;
  return t ? `${n}#/record/${encodeURIComponent(t)}` : `${n}#/`;
}
async function on(e, t = null, n = window) {
  const o = n.open("", Jn);
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
    const r = await ki(e.fetcher);
    o ? ((s || t) && (o.location.href = Zn(r.url, t)), o.focus()) : n.open(Zn(r.url, t), Jn), r.started && nn(e.app, "success", "Plenio Player started", `${r.url} - it keeps running when ComfyUI stops; stop it on its Settings page.`);
  } catch (r) {
    o && s && o.close();
    const i = r instanceof Q && r.hint ? ` ${r.hint}` : "";
    nn(e.app, "error", "Plenio Player", `${r instanceof Error ? r.message : String(r)}${i}`, 2e4);
  }
}
function Ei(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this);
    const i = this.addWidget?.("button", _i, null, () => {
      on(t, n.get(this) ?? null);
    }, { serialize: !1 });
    i && (i.serialize = !1);
  }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
    const i = r?.plenio_player, a = i?.[i.length - 1]?.record;
    a && n.set(this, a);
  });
}
const Mi = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
function $i(e, t) {
  if (e === t) return !0;
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? !1 : Mi.has(n.hostname) || n.hostname === new URL(t).hostname;
  } catch {
    return !1;
  }
}
function Ai(e, t = window, n = 1500) {
  const o = new URLSearchParams(t.location.search);
  if (o.get("plenio") !== "continue") return !1;
  o.delete("plenio");
  const s = o.toString();
  t.history.replaceState(t.history.state, "", `${t.location.pathname}${s ? `?${s}` : ""}${t.location.hash}`);
  const r = t.opener;
  if (!r) return !0;
  const i = (a) => {
    const c = a.data;
    c?.type !== "plenio-continue" || a.source !== r || !$i(a.origin, t.location.origin) || (t.removeEventListener("message", i), gt(e, { record: c.record, name: String(c.name || "the Plenio Player") }).catch((d) => {
      const p = d instanceof Q && d.hint ? ` ${d.hint}` : "";
      nn(e.app, "error", "Continue a song", `${d instanceof Error ? d.message : String(d)}${p}`, 2e4);
    }));
  };
  return t.addEventListener("message", i), t.setTimeout(() => r.postMessage({ type: "plenio-ready" }, "*"), n), !0;
}
const Li = {
  "one song, stop to review": "new song every run",
  "one cover, stop to review": "new cover every run"
}, Ci = 2e3, Ni = 3e4;
function Ti(e, t, n, o) {
  const s = Li[t];
  return !s || n <= 0 && o <= 1 ? null : {
    summary: "These runs stop for your review",
    detail: `${e}: "${t}" - each run waits at the Song Sheets until you press Approve, so queued runs render nothing by themselves. For runs that go through, choose "${s}" in the brief's mode.`
  };
}
class Pi {
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
    this.recent = [...this.recent.filter((r) => o - r < Ci), o];
    const s = Ti(t, n, this.queued, this.recent.length);
    !s || o - this.lastNotice < Ni || (this.lastNotice = o, this.notify(s));
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
const Ft = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function Oi(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function Ii(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function Vo(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function Ri(e) {
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
const wt = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new Set();
function Uo(e) {
  return wt.get(e) ?? null;
}
function Te(e, t) {
  t ? wt.set(e, t) : wt.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Fe) n(e);
}
function qi(e) {
  for (const t of e) wt.delete(t);
  for (const t of Fe) t(null);
}
function zi() {
  for (const e of Fe) e(null);
}
function Bi(e) {
  return Fe.add(e), () => Fe.delete(e);
}
const eo = "600 12px sans-serif", nt = 20, jt = 7;
function Di(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function Hi(e) {
  const t = e ? Di(e) : "";
  return {
    height: e ? nt : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = eo;
      const o = n.measureText(t).width + 2 * jt;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = eo;
      const r = n.measureText(t).width + 2 * jt;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, nt, 5) : n.rect(o, s, r, nt), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + jt, s + nt / 2 + 0.5), n.restore();
    }
  };
}
const Fi = "PlenioSongSheet", ji = 30;
function Yo(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function Wi(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? Yo(n, "mode") : null;
  } catch {
    return null;
  }
}
function sn(e) {
  const t = Uo(e);
  return t || (e.type !== Fi ? null : Ii(Yo(e, "review") ?? "continue", Wi(e)) ? "stop" : null);
}
function Gi(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return Vo(n);
  const o = e?.plenio_summary;
  return Oi(o?.[o.length - 1]?.status);
}
function Vi(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = sn(s);
      return Hi(r ? Ft[r] : null);
    });
  }, n.onDrawForeground = U(n.onDrawForeground, function(s) {
    const r = sn(this);
    !r || !Ft[r].frame || this.flags?.collapsed || !this.size || Ui(s, Ft[r], this.size, ji, t.scale());
  }), n.onExecuted = U(n.onExecuted, function(s) {
    const r = Gi(s);
    r && (Te(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      "Waiting for your approval: open it with its Edit button, check the documents, press Approve, then run again."
    ));
  });
}
function Ui(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function Vc(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, c = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: c, source: a }), o += c;
  }), n;
}
function Xo(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + Z) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Me(e, t) {
  const n = Xo(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function Yi(e, t) {
  const n = Xo(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function Uc(e, t, n) {
  const o = Me(e, t), s = n == null ? 1 / 0 : Me(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, c = Math.max(i.realStart, o), d = Math.min(a, s);
    if (d <= c + Z) continue;
    let p = i.source[0] + (c - i.realStart) / i.realDur * (i.source[1] - i.source[0]), h = c - o, S = d - c;
    if (p < 0 && (h -= p, S += p, p = 0, S <= Z))
      continue;
    const y = r.at(-1);
    y && Math.abs(y.at + y.duration - h) < Z && Math.abs(y.offset + y.duration - p) < 0.01 ? y.duration += S : r.push({ at: h, offset: p, duration: S });
  }
  return r;
}
const Ko = 0.04, Z = 1e-3, Xi = 0.25, Ki = 2;
function yt(e) {
  return Math.min(Ki, Math.max(Xi, Number.isFinite(e) ? e : 1));
}
function Yc(e, t) {
  const n = yt(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Me(r, t.from) : t.from, a = (c) => (r ? Me(r, c) : c) - i;
  for (const c of ["Vocal", "Ins"])
    if (t.voices[c])
      for (const d of e.notes?.[c] ?? []) {
        if (d.start_s < t.from - Z || d.start_s >= o - Z) continue;
        const p = Math.min(d.start_s + d.duration_s, o), h = Math.max(0, a(d.start_s));
        s.push({ at: h / n, duration: (a(p) - h) / n, midi: d.midi, part: c });
      }
  if (t.voices.chords)
    for (const c of e.chords ?? []) {
      const d = Math.min(c.start_s + c.duration_s, o), p = Math.max(c.start_s, t.from);
      if (!(d <= p + Z))
        for (const h of c.pitches)
          s.push({ at: a(p) / n, duration: (a(d) - a(p)) / n, midi: h, part: "chord" });
    }
  if (t.voices.guide)
    for (const c of t.guide ?? []) {
      if (c.start_s < t.from - Z || c.start_s >= o - Z) continue;
      const d = Math.min(c.start_s + c.duration_s, o), p = Math.max(0, a(c.start_s));
      s.push({ at: p / n, duration: (a(d) - p) / n, midi: c.midi, part: "guide" });
    }
  if (t.metronome)
    for (const c of e.bars) {
      const d = Number(c.meter.split("/")[0]) || 1;
      for (let p = 0; p < d; p++) {
        const h = c.start_s + p * c.duration_s / d;
        h < t.from - Z || h >= o - Z || s.push({
          at: Math.max(0, a(h)) / n,
          duration: Ko,
          midi: p === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((c, d) => c.at - d.at || c.midi - d.midi);
}
function Xc(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Me(o, n) - Me(o, t.from) : n - t.from;
  return Math.max(0, s) / yt(t.speed);
}
function Kc(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, c = i > 0 ? Math.floor(a / i + 1e-6) : 0, d = i > 0 ? (a - c * i) / i * r : 0, p = d > 1e-3 ? 0 : 1, h = Math.max(0, o * t);
  return Array.from({ length: h }, (S, y) => {
    const M = p + h - 1 - y, P = ((c - M) % t + t) % t === 0;
    return { at: Math.max(0, s - d - M * r), duration: Ko, midi: P ? 96 : 89, part: "click" };
  });
}
function Qc(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? Yi(n, Me(n, e.from) + t * yt(e.speed)) : e.from + t * yt(e.speed);
}
function Jc(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + Z && t < o.start_s + o.duration_s - Z
  ).map((o) => o.id);
}
function Qi(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const Ji = [
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
], Zc = {
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
function ot(e) {
  return typeof e == "string" && Ji.includes(e);
}
function Qo() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Zi(e) {
  const t = Qo(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: ot(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: ot(n.Ins) ? n.Ins : t.Ins,
    chord: ot(n.chord) ? n.chord : t.chord,
    guide: ot(n.guide) ? n.guide : t.guide
  };
}
const ea = {
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
}, to = /* @__PURE__ */ new WeakMap();
function Wt(e, t, n) {
  let o = to.get(e);
  o || to.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, c) => i[c + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const no = /* @__PURE__ */ new WeakMap();
function Jo(e) {
  let t = no.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    no.set(e, t);
  }
  return t;
}
function O(e, t, n, o = 0) {
  const s = e.createOscillator();
  return typeof t == "string" ? s.type = t : s.setPeriodicWave(t), s.frequency.value = n, s.detune.value = o, s;
}
function ge(e, t) {
  const n = e.createGain();
  return n.gain.value = t, n;
}
function ie(e, t, n, o = 0.7) {
  const s = e.createBiquadFilter();
  return s.type = t, s.frequency.value = Math.min(n, e.sampleRate / 2 - 100), s.Q.value = o, s;
}
function ze(e, t, n, o, s, r) {
  const i = O(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const c of t) a.connect(c.detune);
  return i;
}
function Gt(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = Jo(e);
  const a = ie(e, "bandpass", o, 1.2), c = e.createGain();
  return c.gain.setValueAtTime(s, n), c.gain.setTargetAtTime(0, n, r), i.connect(a).connect(c).connect(t), i;
}
const ft = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), oo = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [so(O(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [so(O(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = Wt(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ie(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, ft(r, 0.35)), a.connect(t);
      const c = O(e, i, n, -1.5), d = O(e, i, n, 1.5), p = ge(e, 0.5);
      c.connect(p), d.connect(p), p.connect(a);
      const h = Gt(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [c, d, h];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = O(e, "sine", n), a = O(e, "sine", n), c = e.createGain(), d = n * (1.2 + 2.2 * s);
      c.gain.setValueAtTime(d, o), c.gain.setTargetAtTime(n * 0.25, o, ft(r, 0.25)), a.connect(c).connect(i.frequency);
      const p = ie(e, "highpass", 25, 0.7);
      p.connect(t);
      const h = O(e, "sine", n * 4), S = e.createGain();
      return S.gain.setValueAtTime(0.18 * s, o), S.gain.setTargetAtTime(0, o, 0.06), h.connect(S).connect(p), i.connect(p), [i, a, h];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(e, t, n, o) {
      const s = ie(e, "lowpass", Math.min(n * 5 + 800, 6e3), 0.6);
      s.connect(t);
      const r = [-9, 0, 8].map((a) => O(e, "sawtooth", n, a));
      for (const a of r) a.connect(s);
      const i = ze(e, r, o, 5.3, 7, 0.3);
      return [...r, i];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(e, t, n, o) {
      const s = Math.min(n * 3 + 500, 4500), r = ie(e, "lowpass", s, 0.8);
      r.connect(t);
      const i = O(e, "sine", 0.25), a = ge(e, s * 0.3);
      i.connect(a).connect(r.frequency);
      const c = [O(e, "sawtooth", n, -12), O(e, "sawtooth", n, 11), O(e, "triangle", n / 2)];
      for (const d of c) d.connect(r);
      return [...c, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, o) {
      const s = Wt(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = O(e, s, n), i = O(e, "sine", n / 2), a = ge(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const c = ze(e, [r, i], o, 6.6, 4, 0), d = Gt(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, c, d];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = Wt(e, "flute", [1, 0.13, 0.06, 0.02]), r = O(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = Jo(e), i.loop = !0;
      const a = ie(e, "bandpass", Math.min(n * 2, 8e3), 1.5), c = ge(e, 0.06);
      i.connect(a).connect(c).connect(t);
      const d = ze(e, [r], o, 4.9, 9, 0.25);
      return [r, i, d];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(e, t, n, o) {
      const s = O(e, "sawtooth", n), r = ie(e, "lowpass", 5e3, 0.5);
      s.connect(r);
      for (const [c, d, p] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const h = ie(e, "bandpass", c, d), S = ge(e, p);
        r.connect(h).connect(S).connect(t);
      }
      const i = ge(e, 0.15);
      r.connect(i).connect(t);
      const a = ze(e, [s], o, 5.4, 18, 0.22);
      return [s, a];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(e, t, n, o, s, r) {
      const i = ie(e, "lowpass", Math.min(n * (6 + 6 * s), 9e3), 0.9);
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, ft(r, 0.12)), i.connect(t);
      const a = O(e, "sawtooth", n), c = O(e, "triangle", n, 4);
      a.connect(i), c.connect(i);
      const d = Gt(e, t, o, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
      return [a, c, d];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(e, t, n, o) {
      const s = ie(e, "lowpass", Math.min(n * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(n * 4, 4e3), o + 0.02, 0.2), s.connect(t);
      const r = O(e, "square", n), i = O(e, "sawtooth", n, 6);
      r.connect(s), i.connect(s);
      const a = ze(e, [r, i], o, 5.6, 10, 0.3);
      return [r, i, a];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = O(e, "sine", n), r = O(e, "triangle", n), i = ge(e, 0.5);
      s.connect(t), r.connect(i).connect(t);
      const a = O(e, "sawtooth", n), c = ie(e, "lowpass", Math.min(n * 6, 2500), 1);
      c.frequency.setTargetAtTime(n * 2, o + 0.01, 0.12);
      const d = ge(e, 0.25);
      return a.connect(c).connect(d).connect(t), [s, r, a];
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
function so(e, t) {
  return e.connect(t), e;
}
function el(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = oo[n] ?? oo.plain, c = Qi(o), d = a.sustain === 0 ? ft(o, a.decay) : a.decay, p = i * ea[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), h = e.createGain();
  h.gain.setValueAtTime(0, s), h.gain.linearRampToValueAtTime(p, s + a.attack), h.gain.setTargetAtTime(p * a.sustain, s + a.attack, d), h.connect(t);
  const S = a.build(e, h, c, s, r, o);
  for (const B of S) B.start(s);
  let y = !1, M = !1;
  const P = (B) => {
    for (const G of S)
      try {
        G.stop(B);
      } catch {
      }
  };
  return S[0].onended = () => {
    M = !0, h.disconnect();
  }, a.sustain === 0 && P(s + a.attack + d * 7), {
    release(B) {
      if (y || M) return;
      y = !0;
      const G = Math.max(B, s + a.attack);
      h.gain.setTargetAtTime(0, G, a.release), P(G + a.release * 7);
    },
    stop() {
      if (M) return;
      M = !0, y = !0;
      const B = e.currentTime;
      try {
        h.gain.cancelScheduledValues(B), h.gain.setValueAtTime(0, B);
      } catch {
      }
      P(B), h.disconnect();
    }
  };
}
const tl = 12, st = { width: 640, height: 420 }, ta = { width: 1280, height: 900 }, Zo = 120, es = 720, ts = 0.25, ns = 0.85, os = 160, ss = 460, rs = "plenio.sheet.dialog";
function je(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function na(e, t) {
  const n = je(e.width, st.width, Math.max(st.width, t.width - 16)), o = je(e.height, st.height, Math.max(st.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function nl(e, t) {
  return Math.round(je(e + t, Zo, es));
}
function ol(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? ro(e) : ro(e + t / n);
}
function ro(e) {
  return Math.round(je(e, ts, ns) * 1e3) / 1e3;
}
function sl(e, t) {
  return Math.round(je(e + t, os, ss));
}
function rl(e, t, n) {
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
  }, c = (d) => {
    if (d.buttons === 0) {
      a();
      return;
    }
    t({ dx: d.clientX - o, dy: d.clientY - s });
  };
  window.addEventListener("pointermove", c), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function oa() {
  return { ...ta, maximized: !1 };
}
function il(e = is()) {
  const t = oa();
  try {
    const n = e?.getItem(rs);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...na(
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
function al(e, t = is()) {
  try {
    t?.setItem(rs, JSON.stringify(e));
  } catch {
  }
}
function is() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function as(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function cs() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function sa(e) {
  const t = cs(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const ls = "plenio.score-editor.prefs";
function ra() {
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
    sounds: Qo(),
    paper: "a4",
    notationSize: "standard",
    record: cs(),
    midiInput: "all"
  };
}
function ia(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function cl(e = us()) {
  const t = ra();
  try {
    const n = e?.getItem(ls);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...ia(o),
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
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= Zo && o.rollHeight <= es ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= ts && o.notationShare <= ns ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= os && o.sideWidth <= ss ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: Zi(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: as(o.notationSize) ? o.notationSize : t.notationSize,
      record: sa(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function ll(e, t = us()) {
  try {
    t?.setItem(ls, JSON.stringify(e));
  } catch {
  }
}
function us() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function ds(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: as(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function aa(e) {
  return ds(e?.plenio_notation);
}
async function ca(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return ds(n.jobs);
}
async function la(e, t) {
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
let io = Promise.resolve();
function ua(e) {
  const t = io.then(e, e);
  return io = t.catch(() => {
  }), t;
}
class da {
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
        ua(() => la(s, this.host)).then(
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
      t = await ca(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const fs = "PlenioSeed", fa = 2 ** 32, ps = "plenio_part", pt = "plenio_seed_hint", ao = 56, co = {
  fresh: { color: "#7a5418", bgcolor: "#3b2a10" },
  keep: { color: "#1f4e6e", bgcolor: "#14304a" }
};
function pa(e = Math.random) {
  return Math.floor(e() * fa);
}
function ha(e, t) {
  const n = t.trim() || "result";
  return e ? `🔒 Every run uses this seed again: the same ${n}.` : `🎲 Every run draws a new seed: a new ${n}. Liked it? Switch to 🔒.`;
}
function Pe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function hs(e) {
  const t = e.inputs?.find((n) => n.name === "seed");
  return t?.link !== void 0 && t?.link !== null;
}
function bt(e) {
  const t = !!Pe(e, "keep_seed")?.value, n = e, o = t ? co.keep : co.fresh;
  n.color = o.color, n.bgcolor = o.bgcolor;
  const s = Pe(e, pt)?.element;
  s && (s.textContent = ha(t, String(e.properties?.[ps] ?? ""))), e.setDirtyCanvas?.(!0, !0);
}
function lo(e, t = Math.random) {
  const n = Pe(e, "seed");
  !n || hs(e) || (n.value = pa(t), n.callback?.(n.value), e.setDirtyCanvas?.(!0, !0));
}
function ma(e, t = Math.random) {
  const n = Pe(e, "seed"), o = Pe(e, "keep_seed");
  if (!n || !o) return;
  n.beforeQueued = () => {
    o.value || lo(e, t);
  }, o.callback = U(o.callback, () => bt(e));
  const r = e.addWidget?.("button", "🎲 new seed now", null, () => lo(e, t), { serialize: !1 });
  if (r && (r.serialize = !1), !Pe(e, pt)) {
    const i = document.createElement("div");
    i.className = "plenio-seed-hint";
    const a = e.addDOMWidget(pt, pt, i, {
      serialize: !1,
      getValue: () => "",
      setValue: () => {
      },
      // two lines of text and the frontend's margin of 10 px above and below a DOM widget
      getMinHeight: () => ao,
      getMaxHeight: () => ao
    });
    a.serialize = !1;
  }
  bt(e);
}
function ga(e) {
  const t = e.prototype, n = t.onNodeCreated;
  t.onNodeCreated = function() {
    n?.call(this), ma(this);
  }, e.prototype.onConfigure = U(e.prototype.onConfigure, function() {
    bt(this);
  });
}
const ms = /* @__PURE__ */ new Set(["new song every run", "new cover every run"]), wa = /* @__PURE__ */ new Set(["one song, stop to review", "one cover, stop to review"]);
function ya(e, t) {
  return ms.has(e) ? !1 : wa.has(e) ? t.trim() !== "take" : null;
}
function ba(e, t) {
  let n = 0;
  for (const o of e) {
    if (o.type !== fs || hs(o)) continue;
    const s = ya(t, String(o.properties?.[ps] ?? "")), r = o.widgets?.find((i) => i.name === "keep_seed");
    s === null || !r || !!r.value === s || (r.value = s, bt(o), n++);
  }
  return n;
}
function va(e, t) {
  const n = `${t} seed${t === 1 ? "" : "s"}`;
  return ms.has(e) ? { summary: `${n} now 🎲 new seed`, detail: `"${e}": every run draws all its seeds anew - a new song each time. Switch a seed to 🔒 to keep that part.` } : { summary: `${n} now 🔒 same seed`, detail: `"${e}": the song's draft, plan, arrangement and cover stay while you review it; the take seed still draws anew.` };
}
function xa(e, t) {
  const n = e.widgets?.find((o) => o.name === "mode");
  n && (n.callback = U(n.callback, (o) => {
    const s = e.graph, r = String(o ?? n.value ?? ""), i = ba(s?.nodes ?? s?._nodes ?? [], r);
    if (i) {
      const a = va(r, i);
      t(a.summary, a.detail);
    }
  }));
}
const Sa = "PlenioSongSheet";
function Ve(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function gs(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function ws(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : gs(e, n);
}
function ys(e, t) {
  const n = ws(e, t);
  return n && (n.comfyClass ?? n.type) === Sa && Ve(n) ? n : null;
}
function _a(e) {
  return ys(e, "context_lyrics");
}
function ka(e) {
  return ys(e, "context_score");
}
function Ea(e, t, n) {
  const o = [], s = ws(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((c, d) => {
        const p = gs(i, d);
        p && o.push(p);
      });
    }
  }
  return !1;
}
function Ma(e, t, n) {
  const o = _a(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = Ee(Ve(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && ke(a) !== ke(s) && (c = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: c, replans: Ea(o, e, "score") } };
}
function $a(e, t, n) {
  const o = Ve(e);
  if (!o) return;
  const s = Ee(o.value) ?? _t();
  o.value = He(Io(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function Aa(e, t, n) {
  const o = ka(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = Ee(Ve(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && ke(a) !== ke(s) && (c = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: c } };
}
function La(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Ca(e, t, n, o = null) {
  const s = Ve(e);
  if (!s) return null;
  const r = Ee(s.value) ?? _t(), i = Io(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = He(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await Bs(o.fetcher, {
      sheet_state: i,
      upstream: Tr(n),
      owned: n.owned,
      review: La(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null,
      sparse: n.sparse ?? !1
    });
    if (!!a.findings.some((p) => p.severity === "error") || !a.fingerprint) return i;
    const d = Nr(i, a.fingerprint);
    return s.value = He(d), e.setDirtyCanvas?.(!0, !0), d;
  } catch {
    return i;
  }
}
const Na = {
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
function Ta(e) {
  return e.properties?.plenio_editor_layout === "daw" ? "daw" : (e.inputs ?? []).some((n) => n.name === "score" && n.link != null) ? "score" : "text";
}
const bs = "PLENIO_SHEET_STATE", uo = 128;
let ht = null;
function Pa(e) {
  ht = e;
}
const Oa = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const r = document.createElement("div");
  r.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.type = "button", i.className = "plenio-sheet-open", i.innerHTML = '<span class="icon"></span><span class="text"><span class="name"></span><span class="what"></span></span><span class="go">Edit</span>';
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", s.append(i, r, a);
  let c = !1, d = null;
  const p = () => {
    const l = Ta(e);
    if (l === d) return;
    d = l;
    const A = Na[l];
    i.dataset.kind = l, i.title = `${A.name} - opens the Song Sheet editor (${A.what.toLowerCase()})`, i.querySelector(".icon").innerHTML = A.icon, i.querySelector(".name").textContent = A.name, i.querySelector(".what").textContent = A.what;
  }, h = () => {
    p();
    const l = Ae(String(e.id)), A = sn(e);
    r.textContent = Lr(Ee(o)) + (l && A !== "approved" ? ` · ${l.status}` : ""), a.textContent = Ri(A), a.dataset.state = A ?? "";
    const C = c ? null : e.widgets?.find((b) => b.name === "review");
    if (C) {
      c = !0;
      const b = C.callback;
      C.callback = (w) => {
        b?.(w), h();
      };
    }
  }, S = e.addDOMWidget(t, bs, s, {
    getValue: () => o,
    setValue: (l) => {
      o = typeof l == "string" ? l : "", h();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => uo,
    getMaxHeight: () => uo
  });
  i.addEventListener("click", (l) => {
    l.stopPropagation(), y().catch((A) => {
      console.error("Plenio: the Song Sheet editor could not open", A), r.textContent = `The editor could not open: ${A instanceof Error ? A.message : String(A)}`;
    });
  });
  async function y() {
    const l = Ee(o);
    l === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const A = Ae(String(e.id)), b = (e.inputs ?? []).filter(($) => $.link != null).map(($) => $.name), w = l ?? { schema: "plenio.sheet_state/1", docs: {} }, v = A?.owned ?? Ro(b, w), g = String(e.widgets?.find(($) => $.name === "review")?.value ?? "continue"), _ = g === "as the brief says" ? A?.review ?? "continue" : g, x = () => gn(import.meta.url, wn), { openSheetDialog: T } = await Be(() => import("./open-Z9CwDD_Z.mjs"), x), { parseGuide: N, serializeGuide: D } = await Be(() => import("./tracks-ClAVjvds.mjs"), x), { parseShift: F, parseSpans: j } = await Be(() => import("./lyricPlacement-DGoRXeqW.mjs"), x);
    if (!ht) throw new Error("Plenio: API not initialised");
    let I = null;
    try {
      I = Ma(e, A, Ae);
    } catch ($) {
      console.warn("Plenio: the lyrics sheet of this score was not found", $);
    }
    let te = null;
    try {
      te = Aa(e, A, Ae);
    } catch ($) {
      console.warn("Plenio: the score sheet of these lyrics was not found", $);
    }
    const se = ht;
    T({
      title: e.title || "Song Sheet",
      state: w,
      payload: A,
      asrNote: Si(A?.docs.lyrics?.upstream_sha256),
      owned: v.length ? v : [...Ge],
      review: _,
      fetcher: ht,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: N(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: j(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: F(e.properties?.plenio_source_shift),
      lyricsTarget: I?.target ?? null,
      scoreTarget: te?.target ?? null,
      onApply: ($, R, le, $e, Ue, Y) => {
        const kt = String(S.value ?? "");
        if (S.value = He($), e.properties = {
          ...e.properties ?? {},
          plenio_guide: D(R),
          plenio_lyric_spans: (Y?.lyricSpans ?? []).map((he) => [...he]),
          plenio_source_shift: Y?.sourceShift ?? 0
        }, Ue ? Te(e, "approved") : String(S.value) !== kt && M(e), le !== null && I && !I.target.blocked && ($a(I.owner, le, Ae(String(I.owner.id))), M(I.owner)), $e && te && !te.target.blocked) {
          const he = te.owner;
          Ca(he, $e.text, Ae(String(he.id)), $e.approved ? { fetcher: se } : null).then(
            (Et) => {
              Et?.review?.approved_fingerprint ? Te(he, "approved") : M(he);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function M(l) {
    Uo(l) === "approved" && Te(l, null);
  }
  const P = [
    vi((l) => {
      l === String(e.id) && h();
    }),
    Bi((l) => {
      (l === null || l === e) && h();
    })
  ], B = e.onDrawForeground;
  e.onDrawForeground = function(l) {
    B?.call(this, l), p();
  };
  const G = e.onRemoved;
  return e.onRemoved = function() {
    for (const l of P) l();
    G?.call(this);
  }, h(), { widget: S };
}, vs = "PLENIO_FINISH_SWITCH", Ia = "plenio_switch", fo = 148, rn = 0, Ra = 4, Vt = [
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
function qa(e) {
  return e?.nodes ?? e?._nodes ?? [];
}
function xs(e) {
  return qa(e).filter((t) => t.properties?.[Ia] === "cover");
}
function rt(e) {
  const t = xs(e);
  return t.length ? t.some((n) => (n.mode ?? rn) === rn) : null;
}
function za(e, t) {
  for (const n of xs(e)) n.mode = t ? rn : Ra;
  e?.setDirtyCanvas?.(!0, !0);
}
function po(e) {
  return e === !0 || typeof e == "string" && ["true", "1", "on"].includes(e.trim().toLowerCase());
}
const an = /* @__PURE__ */ new Set();
function Ba() {
  for (const e of an) e();
}
const Da = (e, t, n) => {
  let o = po(n?.[1]?.default);
  const s = e, r = document.createElement("div");
  r.className = "plenio-switches";
  const i = /* @__PURE__ */ new Map();
  for (const y of Vt) {
    const M = document.createElement("button");
    M.type = "button", M.className = "plenio-switch", M.dataset.switch = y.id, M.innerHTML = `<span class="icon">${y.icon}</span><span class="text"><span class="name"></span><span class="what"></span></span><span class="pill"></span>`, M.addEventListener("click", (P) => {
      P.stopPropagation(), y.id === "hq" ? (o = !o, d.value = o, d.callback?.(o)) : za(s.graph, !rt(s.graph)), c();
    }), i.set(y.id, M), r.append(M);
  }
  function a(y, M) {
    const P = i.get(y.id);
    P && (P.hidden = M === null, P.classList.toggle("on", !!M), P.setAttribute("aria-pressed", String(!!M)), P.title = `${y.name}: ${M ? "on" : "off"} - click to switch it ${M ? "off" : "on"}`, P.querySelector(".name").textContent = y.name, P.querySelector(".what").textContent = M ? y.on : y.off, P.querySelector(".pill").textContent = M ? "ON" : "OFF");
  }
  function c() {
    a(Vt[0], o), a(Vt[1], rt(s.graph));
  }
  const d = e.addDOMWidget(t, vs, r, {
    getValue: () => o,
    setValue: (y) => {
      o = po(y), c();
    },
    getMinHeight: () => fo,
    getMaxHeight: () => fo
  });
  an.add(c);
  let p = rt(s.graph);
  const h = e.onDrawForeground;
  e.onDrawForeground = function(y) {
    h?.call(this, y);
    const M = rt(s.graph);
    M !== p && (p = M, c());
  };
  const S = e.onRemoved;
  return e.onRemoved = function() {
    an.delete(c), S?.call(this);
  }, c(), { widget: d };
}, We = "plenio.stem_mix/1", Oe = "rest", Ha = ["reverb", "delay"], Ss = -60, Fa = 12;
function ja() {
  return { gain_db: 0, mute: !1, solo: !1, compression: 0, muted: [], reverb: 0, delay: 0, save: !1 };
}
function ce(e, t) {
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
function _s(e) {
  const t = ja();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const Wa = ["vocals", "drums", "bass", "other"];
function Ga() {
  return [...Wa, Oe];
}
function Va(e) {
  if (typeof e != "string" || !e.trim()) return { schema: We, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== We || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function Ua(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || _s(ce(e, o))) continue;
    const s = {}, r = ce(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: We, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function vt(e, t, n) {
  const o = { ...e.strips };
  return _s(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function Ya(e, t, n) {
  const o = n.some((r) => ce(e, r).solo), s = ce(e, t);
  return o ? s.solo : !s.mute;
}
function ho(e) {
  return e <= Ss ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function Xa(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function Ka(e, t, n) {
  return Xa([...e, [t, n]]);
}
function Qa(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function Ja(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function Za(e, t, n, o) {
  const s = ce(e, t);
  return vt(e, t, { ...s, muted: Ka(s.muted, n, o) });
}
function ec(e, t, n) {
  const o = ce(e, t), s = Qa(o.muted, n);
  return s < 0 ? e : vt(e, t, { ...o, muted: Ja(o.muted, s) });
}
function tc(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function nc(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function mo(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : Ga()).filter((r) => r !== Oe), s = Object.keys(e?.strips ?? {}).filter((r) => r !== Oe && !o.includes(r));
  return [...o, ...s, Oe];
}
const go = "plenio_stem_mixer", wo = "mix", we = 200, oc = ["room", "plate", "hall"];
function z(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function it(e, t, n, o, s) {
  const r = z("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function sc(e) {
  const t = z("div", "plenio-mix"), n = z("div", "plenio-mix-strips"), o = z("div", "plenio-mix-buses"), s = z("div", "plenio-mix-info"), r = z("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: We, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: mo(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const c = () => e.widgets?.find((b) => b.name === wo);
  function d(b, { draw: w = !0 } = {}) {
    const v = c();
    if (!v) return;
    const g = Ua(b);
    v.value = g, v.callback?.(g), i = { ...i, mix: b }, w && y();
  }
  function p(b, w, v = {}) {
    d(vt(i.mix, b, { ...ce(i.mix, b), ...w }), v);
  }
  function h(b, w, v, g = {}) {
    const _ = ce(i.mix, b);
    let x = vt(i.mix, b, { ..._, [w]: v });
    v > 0 && !(x[w] && Object.keys(x[w]).length) && (x = w === "reverb" ? { ...x, reverb: { preset: "room" } } : { ...x, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), d(x, g);
  }
  function S(b, w, v) {
    const g = { ...i.mix[b] ?? {} };
    d({ ...i.mix, [b]: { ...g, [w]: v } });
  }
  function y() {
    n.replaceChildren();
    const b = i.names;
    for (const w of i.names) {
      const v = ce(i.mix, w), g = z("div", "plenio-mix-strip");
      g.dataset.strip = w;
      const _ = z("span", "name", w === Oe ? `${w} (missed)` : w);
      _.title = w === Oe ? "What the separator missed: keeps a neutral mix exact" : "";
      const x = it(Ss, Fa, 0.5, v.gain_db, `${w} gain`), T = z("span", "gain", `${ho(v.gain_db)} dB`);
      x.addEventListener("input", () => {
        T.textContent = `${ho(Number(x.value))} dB`, p(w, { gain_db: Number(x.value) }, { draw: !1 });
      }), x.addEventListener("change", () => p(w, { gain_db: Number(x.value) }));
      const N = z("button", v.mute ? "toggle active" : "toggle", "M");
      N.setAttribute("aria-label", `${w} mute`), N.addEventListener("click", ($) => {
        $.stopPropagation(), p(w, { mute: !v.mute });
      });
      const D = z("button", v.solo ? "toggle active" : "toggle", "S");
      D.setAttribute("aria-label", `${w} solo`), D.addEventListener("click", ($) => {
        $.stopPropagation(), p(w, { solo: !v.solo });
      });
      const F = it(0, 1, 0.05, v.compression, `${w} compression`);
      F.title = "Compression amount: one knob for the master compressor (threshold and ratio)", F.addEventListener("input", () => p(w, { compression: Number(F.value) }, { draw: !1 })), F.addEventListener("change", () => p(w, { compression: Number(F.value) }));
      const j = Ha.map(($) => {
        const R = it(0, 1, 0.05, v[$], `${w} ${$} send`);
        return R.title = `${$} send: how much of this stem goes to the shared ${$} bus`, R.addEventListener("input", () => h(w, $, Number(R.value), { draw: !1 })), R.addEventListener("change", () => h(w, $, Number(R.value))), R;
      }), I = z("button", v.save ? "toggle active" : "toggle", "save");
      I.setAttribute("aria-label", `${w} save as its own file`), I.setAttribute("aria-pressed", String(v.save)), I.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', I.addEventListener("click", ($) => {
        $.stopPropagation(), p(w, { save: !v.save });
      });
      const te = Ya(i.mix, w, b);
      g.classList.toggle("silent", !te);
      const se = z("canvas", "plenio-mix-wave");
      se.width = we, se.height = 26, se.setAttribute("aria-label", `${w} waveform (drag to mute a time range)`), M(se, v, nc(i.peaks, w, we)), se.addEventListener("pointerdown", ($) => P($, se, w)), g.append(
        _,
        x,
        T,
        N,
        D,
        z("span", "label", "comp"),
        F,
        z("span", "label", "verb"),
        j[0],
        z("span", "label", "delay"),
        j[1],
        I,
        se
      ), n.append(g);
    }
    B(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function M(b, w, v) {
    const g = b.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, we, b.height);
    const _ = b.height / 2;
    g.strokeStyle = "rgba(180, 190, 205, 0.8)", g.beginPath();
    for (let x = 0; x < v.length; x++) {
      const T = Math.max(1, v[x] * (_ - 1));
      g.moveTo(x + 0.5, _ - T), g.lineTo(x + 0.5, _ + T);
    }
    g.stroke(), g.fillStyle = "rgba(224, 104, 94, 0.35)", g.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [x, T] of w.muted) {
      const N = Math.max(0, Math.min(we, x / Math.max(i.seconds, 1e-6) * we)), D = Math.max(0, Math.min(we, T / Math.max(i.seconds, 1e-6) * we));
      g.fillRect(N, 0, Math.max(1, D - N), b.height), g.strokeRect(N + 0.5, 0.5, Math.max(1, D - N) - 1, b.height - 1);
    }
  }
  function P(b, w, v) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const g = w.getBoundingClientRect(), _ = (j) => Math.max(0, Math.min(1, (j - g.left) / (g.width || we))) * i.seconds, x = _(b.clientX);
    if (ce(i.mix, v).muted.some(([j, I]) => j <= x && x <= I)) {
      d(ec(i.mix, v, x));
      return;
    }
    let N = x;
    const D = (j) => {
      N = _(j.clientX);
    }, F = () => {
      window.removeEventListener("pointermove", D), window.removeEventListener("pointerup", F), d(Za(i.mix, v, Math.min(x, N), Math.max(x, N)));
    };
    window.addEventListener("pointermove", D), window.addEventListener("pointerup", F);
  }
  function B() {
    o.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, w = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, v = z("select");
    v.setAttribute("aria-label", "Reverb preset"), v.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const x of oc) v.append(new Option(x, x));
    v.value = String(b.preset ?? "room"), v.addEventListener("change", () => S("reverb", "preset", v.value));
    const g = z("input");
    g.type = "number", g.value = String(w.time_ms ?? 375), g.setAttribute("aria-label", "Delay time in ms"), g.title = "Delay time in ms: where the first echo of the delay bus sits", g.addEventListener("change", () => S("delay", "time_ms", Number(g.value)));
    const _ = it(0, 0.8, 0.05, Number(w.feedback ?? 0.35), "Delay feedback");
    _.title = "Delay feedback: how much of each echo returns into the delay line", _.addEventListener("input", () => S("delay", "feedback", Number(_.value))), o.append(
      z("span", "label", "reverb bus"),
      v,
      z("span", "label", "delay bus"),
      g,
      z("span", "label", "ms, feedback"),
      _
    ), o.style.display = "flex";
  }
  const G = e.addDOMWidget(go, go, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  G.serialize = !1;
  const l = e.widgets?.find((b) => b.name === wo), A = z("button", "toggle", "JSON");
  A.title = "Show or hide the raw mixer value", A.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, A.classList.toggle("active", a), l && (l.plenioHidden = !a, a ? delete l.computeSize : l.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(z("span", "label", "Advanced"), A), l && (l.plenioHidden = !0, l.computeSize = () => [0, -4]);
  function C() {
    const b = Va(c()?.value);
    i = { ...i, mix: b ?? { schema: We, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), y();
  }
  return C(), {
    showExecuted(b) {
      const w = b?.plenio_stems?.at(-1), v = tc(b), g = mo(i.mix, w ?? null);
      i = { ...i, names: g, peaks: v, seconds: Number(w?.seconds ?? i.seconds) || 0 }, C();
    }
  };
}
const cn = "plenio-tip", yo = 12, at = 8;
function rc(e, t, n, o) {
  let s = e.right + yo;
  if (s + n.width > o.width - at && (s = e.left - yo - n.width), s < at) return null;
  const r = Math.max(at, Math.min(t - 14, o.height - at - n.height));
  return { x: s, y: r };
}
function ic(e) {
  return !!e && (String(e.type ?? "").startsWith("Plenio") || String(e.title ?? "").startsWith("Plenio"));
}
const ac = 30;
function cc(e) {
  const t = e.node_over, n = e.ds, o = e.canvas;
  if (!t || !n || !o) return null;
  const s = o.getBoundingClientRect(), r = t.flags?.collapsed ? 0 : t.size[1];
  return {
    left: s.left + (t.pos[0] + n.offset[0]) * n.scale,
    top: s.top + (t.pos[1] - ac + n.offset[1]) * n.scale,
    right: s.left + (t.pos[0] + t.size[0] + n.offset[0]) * n.scale,
    bottom: s.top + (t.pos[1] + r + n.offset[1]) * n.scale
  };
}
function lc(e) {
  const t = document.body, n = () => t.classList.remove(cn);
  let o = 0, s = null;
  const r = (a) => {
    const c = e();
    if (a.style.display === "none" || !a.textContent?.trim() || !c || !ic(c.node_over)) return n();
    const d = cc(c), p = a.getBoundingClientRect(), h = d && rc(d, o, p, { width: window.innerWidth, height: window.innerHeight });
    if (!h) return n();
    const S = a.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    t.style.setProperty("--plenio-tip-x", `${Math.round(h.x - S.left)}px`), t.style.setProperty("--plenio-tip-y", `${Math.round(h.y - S.top)}px`), t.classList.add(cn);
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
const uc = `
body.${cn} .node-tooltip { left: var(--plenio-tip-x) !important; top: var(--plenio-tip-y) !important;
  transform: none !important; }
`, dc = `
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
` + uc;
function fc() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = dc, document.head.append(e);
}
function ln(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ct(e) {
  return ln(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function pc(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function hc(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...c] = s, d = (p, h) => `<tr>${p.map((S) => `<${h}>${ct(S)}</${h}>`).join("")}</tr>`;
      t.push(`<table><thead>${d(a, "th")}</thead><tbody>${c.map((p) => d(p, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${ln(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const p = pc(a);
      p && (s ??= []).push(p);
      continue;
    }
    if (i(), a.startsWith("```")) {
      r(), o = [];
      continue;
    }
    const c = /^(#{1,4})\s+(.*)$/.exec(a);
    if (c) {
      r();
      const p = Math.min(c[1].length + 2, 6);
      t.push(`<h${p}>${ct(c[2])}</h${p}>`);
      continue;
    }
    const d = /^\s*[-*]\s+(.*)$/.exec(a);
    if (d) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${ct(d[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${ct(a)}</p>`);
  }
  return r(), i(), o !== null && t.push(`<pre><code>${ln(o.join(`
`))}</code></pre>`), t.join("");
}
const De = "plenio_summary", bo = "plenio_summary", vo = 84, mc = 18, gc = 55, wc = 16, xo = 10;
function yc(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / gc)), 0);
  return wc + t * mc;
}
function bc(e, t) {
  const n = e.widgets?.find((i) => i.name === bo);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  let s = xo;
  const r = e.addDOMWidget(bo, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => vo,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets. The margins
    // count too - without them the element stayed 20 px short of its text and hid the last line
    getMaxHeight: () => Math.max(vo, (o.scrollHeight ? o.scrollHeight + 2 : yc(t.markdown)) + 2 * s)
  });
  return s = r.margin ?? xo, r.serialize = !1, o;
}
function vc(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const So = /* @__PURE__ */ new WeakMap();
function un(e, t) {
  if (!t.markdown) return;
  const n = So.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, So.set(e, n);
  const o = bc(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = hc(t.markdown), vc(e), e.setDirtyCanvas?.(!0, !0);
}
function _o(e, t, n, o) {
  const s = e.properties?.[De], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((c) => c.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[De] = a, un(e, a);
}
function xc(e) {
  e.prototype.onExecuted = U(e.prototype.onExecuted, function(t) {
    const n = t?.[De], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[De] = { markdown: o.markdown, status: o.status ?? "" }, un(this, o));
  }), e.prototype.onConfigure = U(e.prototype.onConfigure, function() {
    const t = this.properties?.[De];
    t?.markdown && un(this, t);
  });
}
const Sc = "Plenio.Core", X = zs;
Pa(X);
const V = Mo, Ut = { app: V, fetcher: X }, Yt = { app: V, fetcher: X }, ks = () => V.graph;
function dn(e) {
  if (e == null) return null;
  const t = String(e);
  return ks()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
async function _c(e, t) {
  const n = `Your own ${e.replace("_", " ")} - any text; the list holds the style templates' values.`, o = V.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: "Plenio · your own value", message: n, defaultValue: t }) : window.prompt(n, t);
}
const ko = new Pi(
  (e) => V.extensionManager?.toast?.add({ severity: "warn", summary: e.summary, detail: e.detail, life: 2e4 })
), kc = {
  scale: () => V.canvas?.ds?.scale ?? 1,
  toast: (e, t) => V.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, Es = () => gn(import.meta.url, wn), Ec = {
  fetcher: X,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Be(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      Es,
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
function Mc(e, t) {
  const n = dn(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function $c(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = Mc(t, e.job.file);
  if ("saved" in e) {
    o && _o(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), V.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof Q && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && _o(o, n, `${n} - not saved: ${r}`, "warning"), V.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const fn = /* @__PURE__ */ new Map(), Eo = new da(Ec, (e) => {
  $c(e, fn.get(e.job.token)), fn.delete(e.job.token);
});
Mo.registerExtension({
  name: Sc,
  getCustomWidgets: () => ({ [bs]: Oa, [vs]: Da }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: Rt,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => Gr(Ut).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), V.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    },
    { id: Qn, label: "Plenio Player", icon: "pi pi-play-circle", function: () => on(Yt) }
  ],
  menuCommands: [
    { path: ["File"], commands: [Rt] },
    { path: ["Plenio"], commands: [Qn, Rt] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: "pi pi-play-circle",
      label: "Plenio Player",
      tooltip: "Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)",
      onClick: () => {
        on(Yt);
      }
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(e) {
    const t = er(e);
    t.length && console.info(`Plenio: longer LLM answers (${Qt} tokens) in ${t.join(", ")}`);
    try {
      const n = await Ys(e, X);
      for (const o of Xs(n)) V.extensionManager?.toast?.add({ ...o, life: 2e4 });
    } catch (n) {
      console.error("Plenio: the blocks of this workflow could not be brought up to date", n);
      const o = n instanceof Q && n.hint ? `${n.message} ${n.hint}` : String(n instanceof Error ? n.message : n);
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
    zi(), Ba();
  },
  async beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Pn.has(t.name) && await dr(e, t, X, _c), xc(e), Vi(e, kc);
    const n = Jr(t.input);
    if (n.size || t.name in bn) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = bi(t, s), i = Ur(r), a = o?.call(this, r);
        return Qr(this, i, n), mi(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = U(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) xi(s);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, li(this, X));
      }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (t.name === "PlenioExportRelease" && Ei(e, Yt), t.name === fs && ga(e), Pn.has(t.name)) {
      Er(e, X);
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), ko.watch(this), xa(
          this,
          (s, r) => V.extensionManager?.toast?.add({ severity: "info", summary: s, detail: r, life: 1e4 })
        );
      };
    }
    if (t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, sc(this));
      }, e.prototype.onExecuted = U(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = U(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && Kn(String(this.id), r);
    }));
  },
  setup() {
    fc(), lc(() => V.canvas), Wr(Ut), Ai(Ut), X.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      Kn(String(o.node_id), o);
      const s = dn(o.node_id);
      s && Te(s, Vo(o));
    }), X.addEventListener("status", (n) => {
      ko.status(n.detail?.exec_info?.queue_remaining);
    }), X.addEventListener("execution_start", () => {
      qi(ks()?.nodes ?? []);
    }), X.addEventListener("execution_error", (n) => {
      const o = dn(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Te(o, "error");
    }), X.addEventListener("executed", (n) => {
      const o = n.detail, s = aa(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) fn.set(i.token, r);
      Eo.take(s);
    });
    const e = () => {
      Eo.recover();
    };
    let t = !1;
    X.addEventListener("reconnected", () => {
      Es().then((n) => {
        n ? t || (t = !0, V.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: Zt })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  Wc as $,
  as as A,
  cl as B,
  Zo as C,
  os as D,
  ts as E,
  ke as F,
  rl as G,
  nl as H,
  Ji as I,
  ro as J,
  sl as K,
  Ic as L,
  Pc as M,
  ns as N,
  Oc as O,
  Q as P,
  ll as Q,
  es as R,
  ss as S,
  Z as T,
  ol as U,
  Gc as V,
  il as W,
  Cc as X,
  Hc as Y,
  jc as Z,
  Dc as _,
  qc as a,
  He as a0,
  Fc as a1,
  Bs as a2,
  Tr as a3,
  Nr as a4,
  tl as a5,
  na as a6,
  al as a7,
  Io as a8,
  Sc as a9,
  Nc as b,
  Rc as c,
  Qo as d,
  Vc as e,
  Qi as f,
  Yc as g,
  Uc as h,
  Oo as i,
  Qc as j,
  Jc as k,
  Bc as l,
  Xc as m,
  Kc as n,
  yt as o,
  Po as p,
  Yi as q,
  Me as r,
  el as s,
  Tc as t,
  Zc as u,
  zc as v,
  cs as w,
  ot as x,
  Zi as y,
  sa as z
};
