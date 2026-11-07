import { api as lr } from "../../../../scripts/api.js";
import { app as Go } from "../../../../scripts/app.js";
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
function ur(e, t) {
  return re(e, "/plenio/sheet/resolve", t);
}
async function Gl(e, t) {
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const n = await e.fetchApi(`/plenio/asr/notes/${t}`);
  return n.ok ? (await n.json())?.note ?? null : null;
}
const Vo = "Plenio.SectionTags";
async function Vl(e) {
  try {
    const t = await e.fetchApi(`/settings/${Vo}`);
    if (!t.ok) return [];
    const n = await t.json();
    return Array.isArray(n) ? n.filter((o) => typeof o == "string") : [];
  } catch {
    return [];
  }
}
async function Ul(e, t) {
  const n = await e.fetchApi(`/settings/${Vo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  if (!n.ok) throw new Q(`Your section tags could not be kept (HTTP ${n.status}).`);
}
function An(e, t, n) {
  return t ? n?.length ? { ...e, lyrics: t, lyric_spans: n } : { ...e, lyrics: t } : e;
}
function Yl(e, t, n, o) {
  return re(e, "/plenio/score/analyze", An({ abc: t }, n, o));
}
function Xl(e, t, n, o, s) {
  return re(e, "/plenio/score/transform", An({ abc: t, operation: n }, o, s));
}
function Kl(e, t) {
  const { lyrics: n, spans: o, ...s } = t;
  return re(e, "/plenio/score/musicxml/export", An(s, n, o));
}
function Ql(e, t) {
  const { lyrics: n, ...o } = t;
  return re(e, "/plenio/score/musicxml/import", n ? { ...o, lyrics: n } : o);
}
function Jl(e, t) {
  return re(e, "/plenio/score/midi/export", t);
}
function Zl(e, t) {
  return re(e, "/plenio/score/midi/import", t);
}
function eu(e, t) {
  return re(e, "/plenio/lyrics/analyze", t);
}
function tu(e, t) {
  const o = `/view?${new URLSearchParams({ filename: t.filename, subfolder: t.subfolder, type: t.type }).toString()}`;
  return e.apiURL ? e.apiURL(o) : `/api${o}`;
}
function Hn(e, t, n, o = 200) {
  return re(e, "/plenio/eq/response", { settings: t, sample_rate: n, points: o });
}
function dr(e, t) {
  return re(e, "/plenio/brief/fields", t);
}
async function fr(e) {
  const t = await e.fetchApi("/plenio/presets/eq");
  if (!t.ok) throw new Q(`Request failed (${t.status})`);
  return await t.json();
}
async function nu(e) {
  const t = await e.fetchApi("/plenio/records"), n = await t.json();
  if (!t.ok) {
    const o = n?.error ?? {};
    throw new Q(o.message ?? `Request failed (${t.status})`, o.hint ?? null);
  }
  return n?.records ?? [];
}
function pr(e, t) {
  return re(e, "/plenio/records/continue", t);
}
function hr(e, t) {
  return re(e, "/plenio/workflow/blocks", { workflow: t });
}
function K(e, t) {
  return function(...n) {
    e?.apply(this, n), t.apply(this, n);
  };
}
const ln = "Plenio · ", mr = /* @__PURE__ */ new Set(["YuE2GenerateABC", "YuE2GenerateMusic", "PlenioComposePrompt", "PlenioComposeArrangement"]), gr = "PlenioCreativity";
function wr(e) {
  const t = e?.definitions?.subgraphs;
  return Array.isArray(t) ? t : [];
}
function yr(e) {
  return wr(e).some((t) => {
    if (typeof t?.name != "string" || !t.name.startsWith(ln)) return !1;
    const n = new Set((t.nodes ?? []).map((o) => o?.type));
    return !n.has(gr) && [...n].some((o) => mr.has(String(o)));
  });
}
async function br(e, t) {
  if (!e || typeof e != "object" || !yr(e)) return null;
  const n = await hr(t, e);
  if (n.workflow) {
    const o = e;
    for (const s of Object.keys(o)) delete o[s];
    Object.assign(o, n.workflow);
  }
  return n;
}
const un = (e) => e.startsWith(ln) ? e.slice(ln.length) : e, Fn = (e) => e.map(un).join(", ");
function vr(e) {
  if (!e) return [];
  const t = [];
  if (e.updated.length) {
    const o = e.linked.length ? ` The creativity of ${Fn(e.linked)} now comes from the brief.` : "";
    t.push({
      severity: "info",
      summary: "Plenio blocks brought up to date",
      detail: `This workflow was saved before its blocks followed the brief's creativity: ${Fn(e.updated)} are the current blocks now.${o} At creativity 50 they work exactly as before. Save the workflow to keep it.`
    });
  }
  const n = [
    ...e.kept.map(([o, s]) => `${un(o)} was kept as it was (${s}) - its sampling stays fixed`),
    ...e.unlinked.map(([o, s]) => `${un(o)} has its own creativity slider (${s})`)
  ];
  return n.length && t.push({
    severity: "warn",
    summary: "The brief's creativity does not reach every block",
    detail: `${n.join("; ")}. The template, opened again from the template browser, has the current blocks.`
  }), t;
}
const xr = "Plenio · ", dn = 16384, kr = 24576, jn = [1024, 2048, 6144], _r = [8192, 12288], Sr = {
  TextGenerate: [[1, jn, dn]],
  PlenioLocalLLM: [
    [4, jn, dn],
    [7, _r, kr]
  ]
};
function Mr(e) {
  const t = e?.definitions?.subgraphs;
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    if (typeof o?.name != "string" || !o.name.startsWith(xr)) continue;
    let s = !1;
    for (const r of o.nodes ?? []) {
      const i = r?.widgets_values, a = Sr[String(r?.type)];
      if (!(!a || !Array.isArray(i)))
        for (const [c, u, d] of a)
          typeof i[c] == "number" && u.includes(i[c]) && (i[c] = d, s = !0);
    }
    s && n.push(o.name);
  }
  return n;
}
const _t = "✎ type your own …", Uo = ["genre", "mood", "tempo", "key", "meter", "language", "voice", "theme", "lead_instrument"], Er = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"].flatMap((e) => [`${e} major`]), Ar = ["A", "E", "B", "F#", "C#", "G#", "D", "G", "C", "F", "Bb", "Eb"].map((e) => `${e} minor`), $r = {
  key: [...Er, ...Ar],
  meter: ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"],
  language: ["English", "German", "Spanish", "French", "Italian", "Portuguese", "Dutch", "Japanese", "Korean", "Chinese"],
  tempo: ["60 BPM", "80 BPM", "90 BPM", "100 BPM", "110 BPM", "120 BPM", "128 BPM", "140 BPM", "174 BPM"]
};
function Lr(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of [...t[e] ?? [], ...$r[e] ?? []]) {
    const r = String(s).replace(/\s+/g, " ").trim();
    r && !n.has(r.toLowerCase()) && n.set(r.toLowerCase(), r);
  }
  const o = [...n.values()].sort((s, r) => s.localeCompare(r, void 0, { sensitivity: "base" }));
  return ["", _t, ...o];
}
function Nr(e, t) {
  if (!Array.isArray(e) || e[0] !== "STRING") return e;
  const n = e[1] ?? {};
  return n.multiline ? e : ["COMBO", { ...n, options: t, default: typeof n.default == "string" ? n.default : "" }];
}
function Tr(e, t) {
  const n = [], o = (s, r) => {
    if (s)
      for (const [i, a] of Object.entries(s)) {
        if (Uo.includes(i)) {
          const d = Nr(a, Lr(i, t));
          d !== a && (s[i] = d, n.push(r + i));
          continue;
        }
        const u = (Array.isArray(a) ? a[1] : void 0)?.options;
        if (Array.isArray(u))
          for (const d of u) {
            const p = d?.inputs;
            o(p?.required, `${i}.`), o(p?.optional, `${i}.`);
          }
      }
  };
  return o(e.input?.required, ""), o(e.input?.optional, ""), [...new Set(n)];
}
const Yo = (e) => e.name.split(".").pop() ?? e.name;
function Or(e) {
  return Uo.includes(Yo(e)) && Array.isArray(e.options?.values);
}
function Wn(e) {
  const t = e.options.values, n = typeof e.value == "string" ? e.value : "";
  n && n !== _t && !t.includes(n) && t.splice(2, 0, n);
}
function fn(e, t) {
  Xo.set(e, t);
  const n = Gn.get(e) ?? /* @__PURE__ */ new WeakSet();
  Gn.set(e, n);
  for (const o of e.widgets ?? []) {
    if (!Or(o) || (Wn(o), n.has(o))) continue;
    n.add(o);
    let s = typeof o.value == "string" && o.value !== _t ? o.value : "";
    const r = o.callback;
    o.callback = function(i) {
      if (i !== _t) {
        s = typeof i == "string" ? i : "", r?.call(this, i);
        return;
      }
      o.value = s, t(Yo(o), s).then((a) => {
        const c = a?.replace(/\s+/g, " ").trim();
        c && (o.value = c, Wn(o), o.callback?.(c), e.setDirtyCanvas?.(!0, !0));
      });
    };
  }
}
const Gn = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap();
function Cr(e) {
  const t = Xo.get(e);
  t && fn(e, t);
}
let Vn = null;
const Pr = 8e3;
function Ir(e) {
  const t = e.fetchApi("/plenio/api/v1/briefs").then(async (n) => n.ok ? (await n.json()).values ?? {} : {}).catch(() => ({}));
  return Vn ??= Promise.race([t, new Promise((n) => setTimeout(() => n({}), Pr))]), Vn;
}
async function Rr(e, t, n, o) {
  const s = await Ir(n);
  if (!Object.keys(s).length) return;
  Tr(t, s);
  const r = e.prototype;
  r.onNodeCreated = K(r.onNodeCreated, function() {
    fn(this, o);
  }), r.onConfigure = K(r.onConfigure, function() {
    fn(this, o);
  });
}
const Tt = [
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
], Ko = ["length", "vocals", "melody"], $n = {
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
}, qr = "my own, sung as written below", zr = "custom";
function Qo(e) {
  return typeof e == "string" && e.trim().toLowerCase() === zr;
}
function ce(e, t) {
  const n = $n[t];
  if (n)
    return (e.widgets ?? []).find((o) => o.name === n);
}
function Br(e) {
  const t = {};
  for (const n of [...Tt, ...Ko, "lyrics_from"]) {
    const o = ce(e, n);
    o && (t[n] = typeof o.value == "string" ? o.value : String(o.value ?? ""));
  }
  return t;
}
function Un(e) {
  return (e.comfyClass ?? e.type) === "PlenioCoverBrief" ? "cover" : "song";
}
const Se = (e) => typeof e == "string" ? e : String(e ?? "");
function Ot(e) {
  return Object.keys(e.sources).filter((t) => Tt.includes(t));
}
function Dr(e, t, n = {}) {
  const o = [];
  for (const i of Ot(t)) {
    const a = ce(e, i);
    if (!a) continue;
    const c = Se(a.value), u = t.fields[i] ?? "", d = (n[i] ?? []).includes(c);
    (!c.trim() || d) && c !== u && o.push({ field: i, value: u });
  }
  const s = ce(e, "lyrics"), r = [...n.lyrics ?? [], t.fields.lyrics ?? ""].filter(Boolean);
  return s && Se(ce(e, "lyrics_from")?.value) === qr && r.includes(Se(s.value)) && o.push({ field: "lyrics", value: "" }), o;
}
function Yn(e, t) {
  const n = [];
  for (const o of Ot(t)) {
    const s = ce(e, o), r = t.fields[o] ?? "";
    s && Se(s.value) !== r && n.push({ field: o, value: r });
  }
  return n;
}
function Hr(e, t) {
  const n = { template: [], own: [] };
  for (const o of Ot(t)) {
    const s = Se(ce(e, o)?.value).trim();
    s && n[s === (t.fields[o] ?? "").trim() ? "template" : "own"].push(o);
  }
  return n;
}
function gt(e) {
  return e.choices.filter((t) => t.suggested && t.suggested !== t.current).map((t) => ({ field: t.field, value: t.suggested }));
}
function Fr(e, t, n) {
  if (!n || !t || t.template === "none") return null;
  const { template: o, own: s } = Hr(e, t), r = [
    o.length ? `From the template: ${o.join(", ")}` : "",
    s.length ? `your own: ${s.join(", ")}` : ""
  ].filter(Boolean);
  return r.length ? r.join(" · ") : "The template has no text for these fields.";
}
function jr(e) {
  const t = e ? gt(e) : [];
  return t.length ? `The template suggests: ${t.map((n) => `${n.field} = ${n.value}`).join(", ")}` : null;
}
function Wr(e) {
  return e?.notes.length ? e.notes.join("; ") : null;
}
function Gr(e) {
  const t = e?.mode;
  return t?.description ? `Creative mode ${t.name} (experimental): ${t.description}` : null;
}
function ot(e, t) {
  for (const n of t) {
    const o = ce(e, n.field);
    o && (o.value = n.value, o.callback?.(n.value));
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Jo(e) {
  const t = [];
  for (const n of Tt) {
    const o = ce(e, n);
    !o || !Qo(o.value) || (o.value = "", o.callback?.(""), t.push(n));
  }
  return t.length && e.setDirtyCanvas?.(!0, !0), t;
}
const Xn = "plenio_brief_template", Vr = 400;
function Ur(e, t) {
  let n = null, o = null;
  const s = {};
  let r = !1, i = null, a;
  const c = document.createElement("div");
  c.className = "plenio-brief-template";
  const u = document.createElement("div");
  u.className = "line";
  const d = document.createElement("div");
  d.className = "hint";
  const p = document.createElement("div");
  p.className = "mode";
  const h = document.createElement("div");
  h.className = "actions", c.append(u, d, p, h);
  const g = (y, E, _) => {
    const T = document.createElement("button");
    return T.textContent = y, T.title = E, T.addEventListener("click", (O) => {
      O.stopPropagation(), _();
    }), h.append(T), T;
  }, x = g("Use template choices", "Set length, vocals and melody to the template’s choices", () => {
    n && (ot(e, gt(n)), W());
  }), S = g("Refill from template", "Put the template’s value back into every text field you changed", () => {
    if (!n) return;
    const y = Yn(e, n);
    if (!y.length) return;
    const E = y.map((_) => _.field).join(", ");
    window.confirm(`Replace your values in ${E} with the template's?`) && (ot(e, y), W());
  }), C = g("↻", "Ask again what the template fills", () => {
    v();
  }), W = () => {
    u.textContent = i ?? Fr(e, n, r) ?? "No template: the fields hold your values only.", u.dataset.state = i ? "error" : r && n ? "ok" : "empty";
    const y = jr(n), E = Wr(n);
    d.textContent = [y, E].filter(Boolean).join(" · "), d.style.display = d.textContent ? "" : "none", p.textContent = Gr(n) ?? "", p.style.display = p.textContent ? "" : "none", h.style.display = r && n && n.template !== "none" ? "" : "none", x.disabled = !n || !gt(n).length, S.disabled = !n || !Yn(e, n).length, C.disabled = !1, e.setDirtyCanvas?.(!0, !0);
  }, l = (y) => {
    const E = String(e.widgets?.find((T) => T.name === "template")?.value ?? "none");
    if (y.template !== (E || "none")) return;
    if (o !== null && o !== y.template) {
      const T = Un(e) === "cover", O = (q) => T || (s[q] ?? []).includes(Se(ce(e, q)?.value));
      ot(e, gt(y).filter((q) => O(q.field)));
    }
    const _ = Dr(e, y, s);
    _.length && ot(e, _);
    for (const T of [...Ot(y), ...Ko]) {
      const O = Se(ce(e, T)?.value);
      O && O === (y.fields[T] ?? "") && !(s[T] ??= []).includes(O) && s[T].push(O);
    }
    o = y.template;
  }, k = /* @__PURE__ */ new WeakSet(), L = () => {
    Xr(e);
    for (const y of ["template", "arrangement", ...Object.keys($n)]) {
      const E = y === "template" || y === "arrangement" ? e.widgets?.find((_) => _.name === y) : ce(e, y);
      !E || k.has(E) || (k.add(E), E.callback = K(E.callback, () => {
        L(), v();
      }));
    }
    Cr(e);
  }, b = async () => {
    L();
    const y = String(e.widgets?.find((E) => E.name === "template")?.value ?? "none");
    try {
      const E = String(e.widgets?.find((_) => _.name === "arrangement")?.value ?? "");
      n = await dr(t, { fields: Br(e), template: y, kind: Un(e), arrangement: E }), i = null, l(n);
    } catch (E) {
      n = null, i = `The template fields could not be read: ${E instanceof Error ? E.message : String(E)}`;
    }
    r = !0, W();
  };
  function v() {
    clearTimeout(a), a = setTimeout(() => {
      b();
    }, Vr);
  }
  L();
  const M = e.addDOMWidget(Xn, Xn, c, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 64,
    getMaxHeight: () => 128
  });
  return M.serialize = !1, Jo(e), W(), v(), {
    widget: M,
    refresh: v,
    answer: () => n,
    dispose: () => clearTimeout(a)
  };
}
const Yr = {
  "vocals.lyrics_from": "lyrics",
  "vocals.lyrics": "lyrics idea or text"
};
function Xr(e) {
  for (const t of e.widgets ?? []) {
    const n = Yr[t.name];
    n && t.label !== n && (t.label = n);
  }
}
const Kn = /* @__PURE__ */ new Set(["PlenioSongBrief", "PlenioCoverBrief"]);
function Kr(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this), n.set(this, Ur(this, t));
  };
  const r = o.onConfigure;
  o.onConfigure = function(i) {
    r?.call(this, i), Jo(this), n.get(this)?.refresh();
  };
}
const Qn = "plenio.record/1", Qr = 2, Jr = "PLNO", st = new TextEncoder().encode(`${Jr}plenio.project/1\0`), Jn = 32 * 2 ** 20;
class pe extends Error {
}
async function Wt(e, t, n) {
  return new Uint8Array(await e.slice(t, t + n).arrayBuffer());
}
function Gt(e, t) {
  return e.length >= t.length && t.every((n, o) => e[o] === n);
}
async function Zr(e) {
  const t = e.stream().pipeThrough(new DecompressionStream("gzip")).getReader(), n = [];
  let o = 0;
  for (; ; ) {
    const { done: i, value: a } = await t.read();
    if (i) break;
    if (o += a.length, o > Jn)
      throw await t.cancel(), new pe(`its Plenio project is larger than ${Jn / 2 ** 20} MB`);
    n.push(a);
  }
  const s = new Uint8Array(o);
  let r = 0;
  for (const i of n)
    s.set(i, r), r += i.length;
  return new TextDecoder().decode(s);
}
async function Zo(e) {
  if (!Gt(await Wt(e, 0, 4), new TextEncoder().encode("fLaC"))) throw new pe("it is not a FLAC file");
  let t = 4;
  for (; ; ) {
    const n = await Wt(e, t, 4);
    if (n.length < 4) throw new pe("the file ends inside its metadata");
    const o = n[1] << 16 | n[2] << 8 | n[3];
    if ((n[0] & 127) === Qr && o >= 4) {
      const s = await Wt(e, t + 4, Math.min(o, st.length));
      if (Gt(s, st.subarray(0, 4))) {
        if (!Gt(s, st)) throw new pe("it holds a Plenio project of an unknown layout (made by a newer Plenio)");
        let r;
        try {
          r = await Zr(e.slice(t + 4 + st.length, t + 4 + o));
        } catch (a) {
          throw a instanceof pe ? a : new pe(`its Plenio project is damaged (${a instanceof Error ? a.message : String(a)})`);
        }
        let i;
        try {
          i = JSON.parse(r);
        } catch {
          throw new pe("its Plenio project is damaged (no JSON)");
        }
        if (i?.schema !== Qn)
          throw new pe(`its Plenio project is no release record (${Qn})`);
        return i;
      }
    }
    if (n[0] & 128) return null;
    t += 4 + o;
  }
}
function es(e) {
  return /\.flac$/i.test(e.name ?? "") || e.type === "audio/flac" || e.type === "audio/x-flac";
}
const Ln = "plenio.sheet_state/1", Ke = ["title", "style", "lyrics", "score", "artwork_prompt"];
function Ct() {
  return { schema: Ln, docs: {} };
}
function Ee(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return Ct();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== Ln || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function Ve(e) {
  const t = {};
  for (const o of Ke) {
    const s = e.docs[o];
    s && (t[o] = s);
  }
  const n = { schema: Ln, docs: t };
  return e.review?.approved_fingerprint && (n.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(n);
}
function Vt(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function ei(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = Ke.filter((o) => Vt(e, o) !== "auto").map(
    (o) => o === "lyrics" && Vt(e, o) === "manual" ? "lyrics: yours (manual)" : `${o.replace("_", " ")} ${Vt(e, o)}`
  ), n = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + n;
}
function ou(e) {
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
const su = "Creative modes are experimental: the writer’s plan can surprise - listen, change the score here, or run again with another arrangement seed; arrangement off keeps the music model’s own plan.";
function ru(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) t.set(n, (t.get(n) ?? 0) + 1);
  return [...t].map(([n, o]) => o > 1 ? `${n} (${o} times)` : n);
}
function iu(e) {
  const t = e.kind === "cover" ? "song flow closeness" : "genre closeness";
  return `${e.mode} (${t} ${e.closeness})`;
}
function Zn(e) {
  const t = Math.max(0, e), n = Math.floor(t / 60), o = Math.round(t - n * 60);
  return `${n}:${String(o).padStart(2, "0")}`;
}
function au(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, n, o]) => {
    const s = e.bars[Math.max(0, n - 1)], r = e.bars[Math.min(e.bars.length - 1, n - 1 + o - 1)];
    return { label: t, bars: o, start: Zn(s?.[0] ?? 0), end: Zn(r?.[1] ?? e.duration_s) };
  }) : [];
}
function Me(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let n = 0, o = t.length;
  for (; n < o && !t[n]; ) n++;
  for (; o > n && !t[o - 1]; ) o--;
  return t.slice(n, o).join(`
`);
}
function ti(e, t, n) {
  const o = e.docs[n];
  return o ? o.text : t?.docs[n]?.upstream ?? "";
}
function cu(e, t, n) {
  return n.map((o) => ({ kind: o, text: ti(e, t, o), intent: "keep" }));
}
function ts(e, t, n) {
  const o = { ...e.docs };
  for (const r of n) {
    const i = e.docs[r.kind], a = t?.docs[r.kind], c = Me(r.text);
    if (r.intent === "auto")
      delete o[r.kind];
    else if (r.intent === "manual")
      o[r.kind] = { state: "manual", text: c };
    else if (r.intent === "rebase")
      a?.upstream_sha256 ? o[r.kind] = { state: "edited", text: c, base_sha256: a.upstream_sha256 } : o[r.kind] = { state: "manual", text: c };
    else if (i)
      Me(i.text) !== c && (o[r.kind] = { ...i, text: c });
    else {
      const u = Me(a?.upstream ?? "");
      if (c === u) continue;
      o[r.kind] = a?.upstream_sha256 ? { state: "edited", text: c, base_sha256: a.upstream_sha256 } : { state: "manual", text: c };
    }
  }
  const s = { ...Ct(), docs: o };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function ni(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function ns(e, t) {
  return Ke.filter((n) => e.includes(n) || t.docs[n]?.state === "manual");
}
function oi(e) {
  const t = {};
  for (const n of e?.owned ?? []) t[n] = e?.docs[n]?.upstream ?? null;
  return t;
}
const si = "PlenioSongSheet";
function os(e) {
  return e.nodes ?? e._nodes ?? [];
}
function ri(e, t) {
  return e.getNodeById?.(t) ?? e.getNodeById?.(Number(t)) ?? os(e).find((o) => String(o.id) === t) ?? null;
}
function Ut(e, t) {
  let n = e, o = null;
  for (const s of t.split(":")) {
    if (!n || (o = ri(n, s), !o)) return null;
    n = o.subgraph;
  }
  return o;
}
function ii(e, t) {
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
function ai(e, t) {
  const n = { values: 0, missing: [], sheets: 0, activated: 0 };
  for (const o of t.activate) {
    const s = Ut(e, o);
    s && s.mode !== 0 && (s.mode = 0, n.activated++);
  }
  for (const [o, s] of Object.entries(t.values)) {
    const r = Ut(e, o);
    if (!r) {
      n.missing.push(...Object.keys(s).map((a) => `${o}: ${a}`));
      continue;
    }
    const i = ii(r, s);
    n.values += Object.keys(s).length - i.length, n.missing.push(...i.map((a) => `${r.type}: ${a}`));
  }
  for (const [o, s] of Object.entries(t.sheets)) {
    const r = Ut(e, o)?.widgets?.find((i) => i.name === "sheet_state");
    r && (r.value = s, r.callback?.(s), n.sheets++);
  }
  return n;
}
function ci(e, t) {
  let n = 0;
  for (const o of os(e)) {
    if (o.type !== si) continue;
    const s = o.widgets?.find((p) => p.name === "sheet_state");
    if (!s) continue;
    const r = Ee(s.value) ?? { schema: "plenio.sheet_state/1", docs: {} }, i = (o.inputs ?? []).filter((p) => p.link != null).map((p) => p.name), a = ns(i, r), c = (a.length ? a : [...Ke]).filter((p) => !!t[p]);
    if (!c.length) continue;
    const u = { ...r.docs };
    for (const p of c) u[p] = { state: "manual", text: t[p] };
    const d = Ve({ ...r, docs: u, review: void 0 });
    s.value = d, s.callback?.(d), n++;
  }
  return n;
}
function li(e, t) {
  return (e.split(/[\\/]/).pop() ?? "").replace(/\.plenio\.json$/i, "").replace(/\.(json|flac)$/i, "") || t || "Plenio song";
}
function Yt(e, t) {
  const n = [e.plenio && `Plenio ${e.plenio}`, e.created.slice(0, 10)].filter(Boolean).join(", "), o = t?.sheets ? " Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again." : "";
  if (e.from === "record") return `"${e.title}" opened in the workflow it was made with (${n}).${o}`;
  if (e.from === "template") {
    const s = e.unplaced.length ? ` ${e.unplaced.length} node(s) of the song have no place in today's template: ${e.unplaced.join(", ")}.` : "";
    return `"${e.title}" (${n}) opened in today's template "${e.template}" with the song's settings.${o}${s}`;
  }
  return `The workflow "${e.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`;
}
const pn = "Plenio was updated while this page was open: reload the page (F5).";
function ui(e) {
  const t = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(e);
  return t ? t[1] : null;
}
function di(e) {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(e)?.[1] ?? null;
}
async function Nn(e, t) {
  const n = ui(e);
  if (!n) return !1;
  try {
    const o = await t(new URL("../plenio.js", e).href), s = o ? di(o) : null;
    return s !== null && s !== n;
  } catch {
    return !1;
  }
}
async function Tn(e) {
  const t = await fetch(e, { cache: "no-store" });
  return t.ok ? await t.text() : null;
}
async function Te(e, t, n = "") {
  try {
    return await e();
  } catch (o) {
    throw await t() ? new Error(n ? `${pn} ${n}` : pn) : o;
  }
}
const Xt = "Plenio.ContinueSong", fi = "plenio.record/1";
function hn(e, t, n, o, s = 2e4) {
  e.app.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function St(e, t) {
  const n = await pr(e.fetcher, t);
  if (n.workflow) {
    if (!e.app.loadGraphData) throw new Error("This ComfyUI frontend cannot load a workflow for Plenio.");
    await e.app.loadGraphData(n.workflow, !0, !0, li("path" in t ? t.path : t.name, n.title));
    const r = e.app.graph;
    if (!r) throw new Error("The workflow did not load.");
    const i = ai(r, n);
    r.setDirtyCanvas?.(!0, !0), i.missing.length && console.warn("Plenio: settings of the song without a field in this workflow", i.missing), hn(e, "success", "Song opened", Yt(n, i));
    return;
  }
  const o = e.app.graph, s = o ? ci(o, n.documents) : 0;
  if (!s)
    throw new Q(
      Yt(n, null),
      "Open a workflow with a Song Sheet (a Plenio template) and continue again: the song's texts and score then go into its Song Sheets."
    );
  hn(e, "success", "Song texts taken", `${Yt(n, null)} Its texts and score went into this workflow's Song Sheets (${s}, manual).`);
}
async function pi(e) {
  if (es(e)) return Zo(e);
  if (!/\.json$/i.test(e.name ?? "")) return null;
  try {
    const t = JSON.parse(await e.text());
    return t?.schema === fi ? t : null;
  } catch {
    return null;
  }
}
function eo(e) {
  const t = [...e.dataTransfer?.files ?? []];
  return t.length === 1 && /\.plenio\.json$/i.test(t[0].name) ? t[0] : null;
}
function hi(e, t) {
  const n = [...e.dataTransfer?.files ?? []];
  if (n.length !== 1 || !es(n[0]) || e.shiftKey) return null;
  const o = t.canvas, s = t.graph;
  if (!o?.canvas || e.target !== o.canvas || !o.convertEventToCanvasOffset || !s?.getNodeOnPos) return null;
  const [r, i] = o.convertEventToCanvasOffset(e);
  return s.getNodeOnPos(r, i) ? null : n[0];
}
function mi(e, t = window) {
  const n = (o) => {
    const s = eo(o) ? null : hi(o, e.app), r = s ?? eo(o);
    r && (o.preventDefault(), o.stopImmediatePropagation(), (async () => {
      if (s) {
        const a = await Zo(s);
        if (a) return St(e, { record: a, name: s.name });
        if (!e.app.handleFile) throw new Q(`${s.name} carries no Plenio project.`, "Drop it with Shift held to give it to ComfyUI.");
        return e.app.handleFile(s);
      }
      const i = await pi(r);
      if (!i) throw new Q(`${r.name} is no Plenio release record.`, "Drop the <name>.plenio.json that Export Release wrote next to the song.");
      await St(e, { record: i, name: r.name });
    })().catch((i) => {
      const a = i instanceof pe ? `${r.name}: ${i.message}.` : i instanceof Q && i.hint ? `${i.message} ${i.hint}` : String(i instanceof Error ? i.message : i);
      hn(e, "error", "Song not opened", a, 3e4);
    }));
  };
  return t.addEventListener("drop", n, !0), () => t.removeEventListener("drop", n, !0);
}
async function gi(e) {
  const t = () => Nn(import.meta.url, Tn), { openContinueDialog: n } = await Te(() => import("./openContinue-QgHIGsdG.mjs"), t);
  n(e.fetcher, (o) => St(e, o));
}
const wi = "COMFY_DYNAMICCOMBO_V3";
function yi(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function bi(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function vi(e, t) {
  const n = bi(e);
  return Array.isArray(t) ? n.length === t.length && n.every((o, s) => o.value === t[s]) : n.every((o) => !(o.name in t) || o.value === t[o.name]);
}
function xi(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function ki(e, t, n) {
  if (!t || !e.widgets || vi(e, t)) return !1;
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
    if (n.has(r.name) && !xi(r, i)) return !0;
    r.value !== i && (r.value = i);
  }
  return !0;
}
function _i(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of Object.values(e ?? {}))
    for (const [o, s] of Object.entries(n ?? {}))
      Array.isArray(s) && s[0] === wi && t.add(o);
  return t;
}
const ss = "plenio.eq/1", wt = 8, ve = 20, Si = 2e4, qe = 12, rs = 15, Ce = ["peak", "low_shelf", "high_shelf"], is = ["peak", "notch", "highpass", "lowpass"], to = [0.2, 10], no = [0.25, 1];
function Ne() {
  return { schema: ss, preamp_db: 0, bands: [] };
}
function Mi(e) {
  if (typeof e != "string" || !e.trim()) return Ne();
  try {
    const t = JSON.parse(e);
    return typeof t != "object" || t === null || !Array.isArray(t.bands) ? null : {
      schema: ss,
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
function Oe(e) {
  return JSON.stringify(e);
}
const oe = (e, t) => Number(e.toFixed(t));
function ee(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function as(e) {
  return e.db ?? rs;
}
const oo = [6, 12, 18], Ei = { 6: 8, 12: 14, 18: 20 };
function Ai(e, t) {
  return { ...e, db: Ei[t] ?? rs };
}
function _e(e, t) {
  return Math.log(ee(t, ve, e.maxHz) / ve) / Math.log(e.maxHz / ve) * e.width;
}
function so(e, t) {
  return ve * (e.maxHz / ve) ** ee(t / e.width, 0, 1);
}
function ye(e, t) {
  const n = as(e);
  return (1 - (ee(t, -n, n) + n) / (2 * n)) * e.height;
}
function ro(e, t) {
  const n = as(e);
  return (1 - ee(t / e.height, 0, 1)) * 2 * n - n;
}
function io(e, t, n) {
  return n ? e + (t - e) * 0.2 : t;
}
function ao(e, t, n) {
  return t.map((o, s) => `${s ? "L" : "M"}${_e(e, o).toFixed(1)},${ye(e, n[s] ?? 0).toFixed(1)}`).join(" ");
}
function On(e) {
  return Math.min(Si, 0.45 * e);
}
function $i(e) {
  const t = new Set(e.bands.map((o) => o.id));
  let n = e.bands.length + 1;
  for (; t.has(`band-${n}`); ) n++;
  return `band-${n}`;
}
function Li(e, t, n = 0, o = 48e3) {
  if (e.bands.length >= wt) return null;
  const s = {
    id: $i(e),
    enabled: !0,
    type: "peak",
    frequency_hz: oe(ee(t, ve, On(o)), 1),
    gain_db: oe(ee(n, -qe, qe), 1),
    q: 1,
    slope: 1
  };
  return { ...e, bands: [...e.bands, s] };
}
function De(e, t, n, o, s = 48e3) {
  return {
    ...e,
    bands: e.bands.map(
      (r) => r.id !== t ? r : {
        ...r,
        frequency_hz: oe(ee(n, ve, On(s)), 1),
        gain_db: Ce.includes(r.type) ? oe(ee(o, -qe, qe), 1) : r.gain_db
      }
    )
  };
}
function Kt(e, t, n) {
  return {
    ...e,
    bands: e.bands.map((o) => o.id === t ? { ...o, q: oe(ee(o.q * n, 0.2, 10), 3) } : o)
  };
}
function Qt(e, t) {
  return { ...e, bands: e.bands.filter((n) => n.id !== t) };
}
function He(e) {
  const t = e.frequency_hz >= 1e3 ? `${oe(e.frequency_hz / 1e3, 2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, n = Ce.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${oe(e.gain_db, 1)} dB` : "";
  return `${e.type.replace("_", " ")} ${t}${n}, Q ${oe(e.q, 2)}`;
}
function Ni(e, t) {
  const n = cs[e.type] ?? e.type, o = e.frequency_hz >= 1e3 ? `${(e.frequency_hz / 1e3).toFixed(2)} kHz` : `${Math.round(e.frequency_hz)} Hz`, s = Ce.includes(e.type) ? ` ${e.gain_db > 0 ? "+" : ""}${e.gain_db.toFixed(1)} dB` : "", r = is.includes(e.type) ? ` Q ${oe(e.q, 2)}` : "";
  return `● ${t + 1} ${n} ${o}${s}${r}${e.enabled ? "" : " (off)"}`;
}
const cs = {
  peak: "Bell",
  low_shelf: "Low shelf",
  high_shelf: "High shelf",
  highpass: "Low cut",
  lowpass: "High cut",
  notch: "Notch"
};
function Jt(e, { kilo: t = !1 } = {}) {
  let n = e.trim().replace(",", ".").replace(/\s*(hz|db)$/i, ""), o = 1;
  if (t && /k$/i.test(n) && (o = 1e3, n = n.slice(0, -1).trim()), !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(n)) return null;
  const s = Number(n) * o;
  return Number.isFinite(s) ? s : null;
}
function rt(e, t) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function yt(e, t, n, o = 48e3) {
  return {
    ...e,
    bands: e.bands.map((s) => {
      if (s.id !== t) return s;
      const r = { ...s, ...n };
      return {
        ...r,
        frequency_hz: oe(ee(rt(r.frequency_hz, s.frequency_hz), ve, On(o)), 1),
        gain_db: oe(ee(rt(r.gain_db, s.gain_db), -qe, qe), 1),
        q: oe(ee(rt(r.q, s.q), to[0], to[1]), 3),
        slope: oe(ee(rt(r.slope, s.slope), no[0], no[1]), 2),
        enabled: r.enabled !== !1
      };
    })
  };
}
function co(e, t) {
  return yt(e, t, { gain_db: 0 });
}
function lo(e, t, n, { heightFraction: o = 0.7 } = {}) {
  if (!t.length || t.length !== n.length) return "";
  const s = n.filter((p) => Number.isFinite(p));
  if (!s.length) return "";
  const r = Math.max(...s), i = Math.min(...s), a = Math.max(r - i, 1e-6), c = e.height - 4, u = c - Math.max(12, e.height * ee(o, 0.1, 0.95));
  return `M${t.map((p, h) => {
    const g = n[h], x = Number.isFinite(g) ? (g - i) / a : 0;
    return `${_e(e, p).toFixed(1)},${(c - x * (c - u)).toFixed(1)}`;
  }).join(" L")} L${e.width.toFixed(1)},${c.toFixed(1)} L0,${c.toFixed(1)} Z`;
}
class Ti {
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
    Oe(t) !== Oe(this.current) && (this.entries = this.entries.slice(0, this.index + 1), this.entries.push(t), this.entries.length > this.limit && this.entries.shift(), this.index = this.entries.length - 1);
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
const Oi = "http://www.w3.org/2000/svg", uo = "plenio_eq_panel", it = "mode.bands", me = { capture: !0 }, ie = { width: 560, height: 260 }, at = ["#4aa3ff", "#f0a35e", "#6fbf73", "#d873c8", "#e0c65a", "#5ac8c8", "#b28df0", "#e08a8a"];
let Zt = null;
function de(e, t) {
  const n = document.createElementNS(Oi, e);
  for (const [o, s] of Object.entries(t)) n.setAttribute(o, String(s));
  return n;
}
function U(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function ke(e, t, n) {
  const o = document.createElement("button");
  return o.className = e, o.textContent = t, o.setAttribute("aria-label", n), o.title = n, o;
}
function fe(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Ci(e, t) {
  return e.bands.length === t.bands.length && e.bands.every((n, o) => {
    const s = t.bands[o];
    return s !== void 0 && n.type === s.type && n.enabled === s.enabled && Math.abs(n.frequency_hz - s.frequency_hz) < 0.5 && Math.abs(n.gain_db - s.gain_db) < 0.05 && Math.abs(n.q - s.q) < 0.01;
  });
}
function Pi(e, t) {
  const n = U("div", "plenio-eq"), o = U("div", "plenio-eq-tools"), s = U("select");
  s.setAttribute("aria-label", "EQ preset"), s.title = "EQ preset: sets every band at once (the list comes from resources/presets/eq.json)";
  const r = U("select");
  r.setAttribute("aria-label", "Gain range"), r.title = "Gain range: the dB axis of the curve and how far a drag may go";
  for (const f of oo) r.append(new Option(`±${f} dB`, String(f)));
  const i = ke("", "↶", "Undo the last band change"), a = ke("", "↷", "Redo the last band change"), c = ke("", "reset", "Remove every band"), u = ke("", "compare", "Show the curve without the EQ (bypass)"), d = ke("", "bands as text", "Show or hide the plenio.eq/1 JSON widget"), p = U("span", "plenio-eq-info");
  p.setAttribute("aria-live", "polite"), p.title = "What the panel is showing right now (the selected band, a note, or a hint)", o.append(s, r, i, a, c, u, d, p);
  const h = U("div", "plenio-eq-mode"), g = de("svg", {
    viewBox: `0 0 ${ie.width} ${ie.height}`,
    class: "plenio-eq-plot",
    role: "img",
    preserveAspectRatio: "none"
  });
  g.setAttribute("aria-label", "EQ response curve"), g.setAttribute("tabindex", "0"), g.setAttribute("title", "Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove");
  const x = U("div", "plenio-eq-strip"), S = U("div", "plenio-eq-editor"), C = U("div", "plenio-eq-fields");
  S.append(C), n.append(o, h, g, x, S);
  const W = e.addDOMWidget(uo, uo, n, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  let l = { sampleRate: 48e3, frequencies: [], response: [], settings: Ne(), readonly: !0, note: "" }, k = null, L = null, b = !1, v = 12, M = null, y = [], E = 0, _, T, O = null, q = !1;
  const F = /* @__PURE__ */ new Map();
  let V = null;
  const D = new Ti(Ne()), J = () => fe(e, it), G = () => v, I = () => Ai({ ...ie, maxHz: Math.min(2e4, l.sampleRate / 2) }, G());
  function R(f, { record: w = !0 } = {}) {
    const m = J();
    if (!m) return;
    const A = Oe(f);
    m.value = A, m.callback?.(A), w && D.push(f), l = { ...l, settings: f }, Y(), j(0);
  }
  async function j(f = 120) {
    clearTimeout(_), _ = setTimeout(async () => {
      const w = String(fe(e, "mode")?.value ?? "flat");
      if (w !== "manual") {
        w === "flat" ? l = {
          ...l,
          settings: Ne(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: "flat: no change"
        } : k !== w ? l = {
          ...l,
          settings: Ne(),
          response: l.frequencies.map(() => 0),
          readonly: !0,
          note: `${w}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
        } : l = { ...l, readonly: !0 }, Y();
        return;
      }
      const m = Mi(J()?.value);
      if (!m) {
        l = { ...l, readonly: !0, note: "the bands are not valid JSON" }, Y();
        return;
      }
      Oe(m) !== Oe(D.current) && D.reset(m);
      const A = ++E;
      try {
        const N = await Hn(t, m, l.sampleRate);
        if (A !== E) return;
        l = {
          ...l,
          frequencies: N.frequency_hz,
          response: N.response_db,
          settings: N.settings,
          readonly: !1,
          note: ""
        };
      } catch (N) {
        l = { ...l, readonly: !1, note: N instanceof Error ? N.message : String(N) };
      }
      Y();
    }, f);
  }
  const Ze = (f) => ({
    ...f.settings,
    bands: f.settings.bands.slice(0, wt)
  });
  function Be() {
    if (!M) return "";
    const f = y.find((w) => w.name === M);
    return f && Ci(Ze(f), l.settings) ? M : "";
  }
  function Y() {
    g.replaceChildren(), F.clear(), V = null;
    const f = I();
    for (const m of [-f.db, -f.db / 2, 0, f.db / 2, f.db])
      g.append(
        de("line", { x1: 0, x2: f.width, y1: ye(f, m), y2: ye(f, m), class: m ? "grid" : "grid zero" })
      );
    for (const m of [100, 1e3, 1e4])
      g.append(de("line", { x1: _e(f, m), x2: _e(f, m), y1: 0, y2: f.height, class: "grid" }));
    l.beforeDb?.length === l.frequencies.length && g.append(de("path", { d: lo(f, l.frequencies, l.beforeDb), class: "spectrum before" })), l.afterDb?.length === l.frequencies.length && g.append(de("path", { d: lo(f, l.frequencies, l.afterDb), class: "spectrum after" })), b ? g.append(de("line", { x1: 0, x2: f.width, y1: ye(f, 0), y2: ye(f, 0), class: "curve flat" })) : l.frequencies.length && (V = de("path", { d: ao(f, l.frequencies, l.response), class: "curve" }), g.append(V)), !l.readonly && !b && l.settings.bands.forEach((m, A) => {
      const N = at[A % at.length], z = Ce.includes(m.type) ? m.gain_db : 0, $ = de("circle", {
        cx: _e(f, m.frequency_hz),
        cy: ye(f, z),
        r: m.id === L ? 9 : 7,
        class: m.id === L ? "handle selected" : "handle",
        style: `stroke: ${N}`,
        tabindex: 0,
        "data-band": m.id
      });
      $.setAttribute("aria-label", `Band ${A + 1}: ${He(m)}`), m.enabled || $.classList.add("disabled"), $.append(de("title", {})), $.lastChild.textContent = `Band ${A + 1}: ${He(m)}`, $.addEventListener("pointerdown", (H) => er(H, m.id)), $.addEventListener("dblclick", (H) => {
        H.stopPropagation(), R(co(l.settings, m.id));
      }), $.addEventListener("focus", () => he(m.id)), $.addEventListener("keydown", (H) => qn(H, m.id)), $.addEventListener("wheel", (H) => {
        H.preventDefault();
        const xe = H.deltaY < 0 ? 1.15 : 1 / 1.15;
        R(Kt(l.settings, m.id, xe));
      }), $.addEventListener("contextmenu", (H) => {
        H.preventDefault(), R(Qt(l.settings, m.id));
      }), g.append($), F.set(m.id, $);
    }), Rt(), $e(), qt();
    const w = l.settings.bands.find((m) => m.id === L);
    p.textContent = l.note || (b ? "compare: the curve is off (the node still applies it)" : w ? He(w) : l.readonly ? `${l.settings.bands.length} band(s)` : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${l.settings.bands.length}/${wt}`), s.disabled = l.readonly, i.disabled = !D.canUndo, a.disabled = !D.canRedo, c.disabled = l.readonly || !l.settings.bands.length, q && (q = !1, L && F.get(L)?.focus({ preventScroll: !0 })), r.value = String(v), s.value = Be(), u.classList.toggle("active", b), d.classList.toggle("active", Dt()), e.setDirtyCanvas?.(!0, !0);
  }
  function Rt() {
    if (x.replaceChildren(), l.readonly && !l.settings.bands.length) {
      x.append(U("span", "plenio-eq-hint", l.note || "no bands"));
      return;
    }
    l.settings.bands.forEach((f, w) => {
      const m = U("button", "plenio-eq-chip", Ni(f, w));
      m.style.borderLeftColor = at[w % at.length], m.classList.toggle("selected", f.id === L), m.classList.toggle("disabled", !f.enabled), m.setAttribute("aria-label", `Edit band ${w + 1}`), m.title = `Band ${w + 1}: ${He(f)} - click to open its fields`, m.addEventListener("click", (A) => {
        A.stopPropagation(), L = L === f.id ? null : f.id, Y();
      }), x.append(m);
    });
  }
  function $e() {
    C.replaceChildren();
    const f = l.settings.bands.find(($) => $.id === L);
    if (!f || l.readonly) {
      S.style.display = "none";
      return;
    }
    S.style.display = "";
    const w = U("span", "name", `Band ${l.settings.bands.indexOf(f) + 1}`);
    w.title = "The selected band";
    const m = U("select");
    m.setAttribute("aria-label", "Band type"), m.title = "Band type: bell and shelves change the gain, the cuts and the notch do not";
    for (const [$, H] of Object.entries(cs)) m.append(new Option(H, $));
    m.value = f.type, m.addEventListener("change", () => R(yt(l.settings, f.id, { type: m.value })));
    const A = U("input");
    A.type = "checkbox", A.checked = f.enabled, A.setAttribute("aria-label", "Band enabled"), A.title = "Band enabled: off keeps the band in the list but out of the response", A.addEventListener("change", () => R(yt(l.settings, f.id, { enabled: A.checked })));
    const N = [
      [
        "Hz",
        `${f.frequency_hz}`,
        70,
        ($) => Ft(f.id, "frequency_hz", Jt($, { kilo: !0 }))
      ],
      ["dB", `${f.gain_db}`, 60, ($) => Ft(f.id, "gain_db", Jt($))],
      ["Q", `${f.q}`, 60, ($) => Ft(f.id, "q", Jt($))]
    ];
    C.append(w, m, A);
    for (const [$, H, xe, et] of N) {
      const te = U("input", "number");
      te.value = H, te.style.width = `${xe}px`, te.setAttribute("aria-label", `Band ${$}`), te.title = $ === "Hz" ? "Frequency of the band in Hz (the centre of a bell, the corner of a shelf)" : $ === "dB" ? "Gain in dB (bell and shelves; the cuts and the notch have none)" : "Q: how narrow the band is - higher Q, smaller range";
      const tt = () => {
        et(te.value) || (te.value = H);
      };
      te.addEventListener("keydown", (ue) => {
        ue.key === "Enter" && tt();
      }), te.addEventListener("blur", tt), ($ === "dB" && !Ce.includes(f.type) || $ === "Q" && !is.includes(f.type)) && (te.disabled = !0), C.append(te);
    }
    const z = ke("", "remove", "Remove this band");
    z.addEventListener("click", ($) => {
      $.stopPropagation(), L = null, R(Qt(l.settings, f.id));
    }), C.append(z);
  }
  function qt() {
    h.replaceChildren();
    const f = String(fe(e, "mode")?.value ?? "flat");
    if (f === "manual" || f === "flat") {
      h.style.display = "none";
      return;
    }
    h.style.display = "", h.append(
      U(
        "span",
        "plenio-eq-hint",
        k === f ? `applied proposal (${l.settings.bands.length} band(s), ${f})` : `${f}: no proposal yet - it is computed on the next run`
      )
    );
    const w = ke("", "Edit these bands", "Copy the proposal into manual bands and edit it");
    w.disabled = !l.settings.bands.length, w.addEventListener("click", (m) => {
      m.stopPropagation();
      const A = fe(e, "mode");
      if (!A) return;
      A.value = "manual", A.callback?.("manual");
      const N = J();
      if (N) {
        const z = Oe(l.settings);
        N.value = z, N.callback?.(z);
      }
      D.reset(l.settings), jt(), j(0);
    }), h.append(w);
  }
  function he(f) {
    L = f, q = !0, Y();
  }
  function zt(f) {
    L = f, Bt();
  }
  function Bt() {
    const f = I();
    l.settings.bands.forEach((m) => {
      const A = F.get(m.id);
      if (!A) return;
      const N = Ce.includes(m.type) ? m.gain_db : 0;
      A.setAttribute("cx", String(_e(f, m.frequency_hz))), A.setAttribute("cy", String(ye(f, N))), A.classList.toggle("selected", m.id === L), A.setAttribute("r", m.id === L ? "9" : "7");
    }), V && l.frequencies.length && V.setAttribute("d", ao(f, l.frequencies, l.response));
    const w = l.settings.bands.find((m) => m.id === L);
    w && (p.textContent = He(w));
  }
  function Zs() {
    clearTimeout(T), T = setTimeout(async () => {
      const f = l.settings, w = ++E;
      try {
        const m = await Hn(t, f, l.sampleRate);
        if (w !== E) return;
        l = { ...l, frequencies: m.frequency_hz, response: m.response_db }, Bt();
      } catch {
      }
    }, 60);
  }
  function Dt() {
    return !fe(e, it)?.plenioHidden;
  }
  function Ht(f) {
    const w = fe(e, it);
    w && (w.plenioHidden = !f, f ? delete w.computeSize : w.computeSize = () => [0, -4], e.setDirtyCanvas?.(!0, !0));
  }
  function Ft(f, w, m) {
    if (m === null) return !1;
    const A = l.settings.bands.find((N) => N.id === f);
    return A && A[w] === m || R(yt(l.settings, f, { [w]: m })), !0;
  }
  function er(f, w) {
    f.preventDefault(), f.stopPropagation(), L !== w && zt(w);
    const m = l.settings.bands.find((se) => se.id === w);
    if (!m) return;
    O = { hz: m.frequency_hz, db: m.gain_db };
    let A = !1, N = !1;
    const z = f.currentTarget;
    try {
      z?.setPointerCapture?.(f.pointerId);
    } catch {
    }
    const $ = g.getBoundingClientRect(), H = $.width ? $.left : 0, xe = $.height ? $.top : 0, et = $.width || ie.width, te = $.height || ie.height, tt = (se, nt) => se >= H - 1 && se <= H + et + 1 && nt >= xe - 1 && nt <= xe + te + 1;
    function ue() {
      if (!N) {
        N = !0;
        try {
          z?.releasePointerCapture?.(f.pointerId);
        } catch {
        }
        window.removeEventListener("pointermove", Dn, me), window.removeEventListener("pointerup", ue, me), window.removeEventListener("pointercancel", ue, me), window.removeEventListener("blur", ue, me), O = null, A && R(l.settings);
      }
    }
    const Dn = (se) => {
      if (N || !O) return;
      if (se.buttons === 0) {
        ue();
        return;
      }
      if (!tt(se.clientX, se.clientY)) return;
      const nt = ie.width / et, nr = ie.height / te, or = (se.clientX - H) * nt, sr = (se.clientY - xe) * nr, rr = _e(I(), O.hz), ir = ye(I(), O.db), ar = so(I(), io(rr, or, se.shiftKey)), cr = ro(I(), io(ir, sr, se.shiftKey));
      l = { ...l, settings: De(l.settings, w, ar, cr, l.sampleRate) }, A = !0, Bt(), Zs();
    };
    window.addEventListener("pointermove", Dn, me), window.addEventListener("pointerup", ue, me), window.addEventListener("pointercancel", ue, me), window.addEventListener("blur", ue, me);
  }
  function qn(f, w) {
    const m = l.settings.bands.find(($) => $.id === w);
    if (!m) return;
    const A = f.shiftKey ? 0.1 : 0.5, N = f.shiftKey ? 1.01 : 1.06;
    let z = null;
    f.key === "ArrowUp" ? z = De(l.settings, w, m.frequency_hz, m.gain_db + A, l.sampleRate) : f.key === "ArrowDown" ? z = De(l.settings, w, m.frequency_hz, m.gain_db - A, l.sampleRate) : f.key === "ArrowRight" ? z = De(l.settings, w, m.frequency_hz * N, m.gain_db, l.sampleRate) : f.key === "ArrowLeft" ? z = De(l.settings, w, m.frequency_hz / N, m.gain_db, l.sampleRate) : f.key === "+" ? z = Kt(l.settings, w, 1.15) : f.key === "-" ? z = Kt(l.settings, w, 1 / 1.15) : f.key === "0" ? z = co(l.settings, w) : (f.key === "Delete" || f.key === "Backspace") && (z = Qt(l.settings, w)), z && (f.preventDefault(), R(z));
  }
  g.addEventListener("keydown", (f) => {
    L && f.target === g && qn(f, L);
  }), g.addEventListener("dblclick", (f) => {
    if (l.readonly || b) return;
    const w = g.getBoundingClientRect(), m = ie.width / (w.width || ie.width), A = ie.height / (w.height || ie.height), N = (f.clientX - w.left) * m, z = (f.clientY - w.top) * A, $ = Li(l.settings, so(I(), N), ro(I(), z), l.sampleRate);
    $ ? (L = $.bands[$.bands.length - 1].id, R($)) : (l = { ...l, note: `the EQ has at most ${wt} bands` }, Y());
  }), s.append(new Option("preset…", "")), Zt ??= fr(t).then((f) => f.manual).catch(() => []), Zt.then((f) => {
    y = f;
    for (const w of f) s.append(new Option(w.name, w.name));
    s.value = Be();
  }), s.addEventListener("change", async () => {
    const f = (await Zt)?.find((w) => w.name === s.value);
    f && (M = f.name, R(Ze(f)));
  }), r.addEventListener("change", () => {
    const f = Number(r.value);
    v = oo.find((w) => w === f) ?? 12, Y();
  }), i.addEventListener("click", () => {
    const f = D.undo();
    f && R(f, { record: !1 });
  }), a.addEventListener("click", () => {
    const f = D.redo();
    f && R(f, { record: !1 });
  }), c.addEventListener("click", () => {
    L = null, R(Ne());
  }), u.addEventListener("click", () => {
    b = !b, Y();
  }), d.addEventListener("click", () => {
    Ht(!Dt()), Y();
  });
  function jt() {
    for (const f of ["mode", it]) {
      const w = fe(e, f);
      if (!w || w.plenioWatched) continue;
      w.plenioWatched = !0;
      const m = w.callback;
      w.callback = (A) => {
        m?.(A), setTimeout(() => {
          Dt() || Ht(!1), j();
        });
      };
    }
  }
  jt(), Ht(!1), j(0);
  let zn = null, Bn = null;
  const tr = setInterval(() => {
    if (!n.isConnected) {
      clearInterval(tr);
      return;
    }
    const f = String(fe(e, "mode")?.value ?? "flat"), w = String(J()?.value ?? "");
    f === zn && w === Bn || (zn = f, Bn = w, jt(), j(0));
  }, 700);
  return {
    showExecuted(f) {
      const w = f?.plenio_eq, m = w?.[w.length - 1];
      if (!m) return;
      const A = String(fe(e, "mode")?.value ?? "flat"), N = A === "manual";
      k = N || A === "flat" ? null : A, l = {
        sampleRate: m.sample_rate,
        frequencies: m.frequency_hz,
        response: m.response_db,
        settings: m.settings,
        readonly: !N,
        note: N ? "" : `applied: ${m.settings.bands.length} band(s)`,
        beforeDb: m.spectrum_before_db,
        afterDb: m.spectrum_after_db
      }, N ? j(0) : Y();
    }
  };
}
const Cn = {
  PlenioSongBrief: "one song, stop to review",
  PlenioCoverBrief: "one cover, stop to review"
}, Ii = new Set(Tt.map((e) => $n[e]));
function Ri(e, t) {
  return !(e in Cn) || !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(([n, o]) => Ii.has(n) && Qo(o)).map(([n]) => n);
}
const fo = ["written from the idea below", "my own, sung as written below"], ls = 7, en = ls + 4;
function qi(e) {
  return !["sung", "sparse vocals"].includes(String(e[ls])) || fo.includes(e[en]) ? e : [...e.slice(0, en), fo[0], "", ...e.slice(en)];
}
function zi(e, t) {
  for (const n of Object.values(e.input ?? {})) {
    const o = n?.[t];
    if (!Array.isArray(o)) continue;
    if (Array.isArray(o[0])) return o[0];
    const s = o[1]?.options;
    return Array.isArray(s) ? s : [];
  }
  return [];
}
const Bi = {
  PlenioSongBrief: { arrangement: { simple: "off" } },
  PlenioCoverBrief: { arrangement: { simple: "off" } }
};
function Di(e, t) {
  const n = Bi[e];
  if (!n) return [];
  const o = [];
  for (const s of t ?? []) {
    const r = n[s.name]?.[String(s.value)];
    r !== void 0 && (s.value = r, o.push(s.name));
  }
  return o;
}
const po = 6, Hi = 8, Fi = 18;
function ji(e) {
  if (e[po] !== "tags" || e.length > Fi) return e;
  const t = po + 1 + Hi;
  return [...e.slice(0, t), "", ...e.slice(t)];
}
function Wi(e, t) {
  if (e.name === "PlenioExportRelease" && t && Array.isArray(t.widgets_values)) {
    const c = ji(t.widgets_values);
    return c === t.widgets_values ? t : { ...t, widgets_values: c };
  }
  const n = Cn[e.name];
  if (!n || !t) return t;
  const o = zi(e, "mode"), s = t.widgets_values, r = t.widgets_values_named;
  let i = t;
  Array.isArray(s) && s.length && !o.includes(s[0]) && (i = { ...i, widgets_values: [n, ...s] }), r && typeof r == "object" && !Array.isArray(r) && !("mode" in r) && (i = { ...i, widgets_values_named: { mode: n, ...r } });
  const a = Ri(e.name, i.widgets_values_named);
  if (a.length) {
    const c = { ...i.widgets_values_named };
    for (const u of a) c[u] = "";
    i = { ...i, widgets_values_named: c };
  }
  if (e.name === "PlenioSongBrief" && Array.isArray(i.widgets_values)) {
    const c = qi(i.widgets_values);
    c !== i.widgets_values && (i = { ...i, widgets_values: c });
  }
  return i;
}
const us = /* @__PURE__ */ new Map(), mn = /* @__PURE__ */ new Set();
function ho(e, t) {
  us.set(e, t);
  for (const n of mn) n(e);
}
function Le(e) {
  return us.get(e) ?? null;
}
function Gi(e) {
  return mn.add(e), () => mn.delete(e);
}
const ds = /* @__PURE__ */ new Map();
function Vi(e) {
  e?.draft_sha256 && ds.set(e.draft_sha256, e);
}
function Ui(e) {
  return e ? ds.get(e) ?? null : null;
}
const mo = "Plenio.OpenPlayer", go = "plenio-player", Yi = "▶ Open in the Plenio Player";
function gn(e, t, n, o, s = 12e3) {
  e.extensionManager?.toast?.add({ severity: t, summary: n, detail: o, life: s });
}
async function Xi(e) {
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
function wo(e, t) {
  const n = e.endsWith("/") ? e : `${e}/`;
  return t ? `${n}#/record/${encodeURIComponent(t)}` : `${n}#/`;
}
async function wn(e, t = null, n = window) {
  const o = n.open("", go);
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
    const r = await Xi(e.fetcher);
    o ? ((s || t) && (o.location.href = wo(r.url, t)), o.focus()) : n.open(wo(r.url, t), go), r.started && gn(e.app, "success", "Plenio Player started", `${r.url} - it keeps running when ComfyUI stops; stop it on its Settings page.`);
  } catch (r) {
    o && s && o.close();
    const i = r instanceof Q && r.hint ? ` ${r.hint}` : "";
    gn(e.app, "error", "Plenio Player", `${r instanceof Error ? r.message : String(r)}${i}`, 2e4);
  }
}
function Ki(e, t) {
  const n = /* @__PURE__ */ new WeakMap(), o = e.prototype, s = o.onNodeCreated;
  o.onNodeCreated = function() {
    s?.call(this);
    const i = this.addWidget?.("button", Yi, null, () => {
      wn(t, n.get(this) ?? null);
    }, { serialize: !1 });
    i && (i.serialize = !1);
  }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
    const i = r?.plenio_player, a = i?.[i.length - 1]?.record;
    a && n.set(this, a);
  });
}
const Qi = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "[::1]"]);
function Ji(e, t) {
  if (e === t) return !0;
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? !1 : Qi.has(n.hostname) || n.hostname === new URL(t).hostname;
  } catch {
    return !1;
  }
}
function Zi(e, t = window, n = 1500) {
  const o = new URLSearchParams(t.location.search);
  if (o.get("plenio") !== "continue") return !1;
  o.delete("plenio");
  const s = o.toString();
  t.history.replaceState(t.history.state, "", `${t.location.pathname}${s ? `?${s}` : ""}${t.location.hash}`);
  const r = t.opener;
  if (!r) return !0;
  const i = (a) => {
    const c = a.data;
    c?.type !== "plenio-continue" || a.source !== r || !Ji(a.origin, t.location.origin) || (t.removeEventListener("message", i), St(e, { record: c.record, name: String(c.name || "the Plenio Player") }).catch((u) => {
      const d = u instanceof Q && u.hint ? ` ${u.hint}` : "";
      gn(e.app, "error", "Continue a song", `${u instanceof Error ? u.message : String(u)}${d}`, 2e4);
    }));
  };
  return t.addEventListener("message", i), t.setTimeout(() => r.postMessage({ type: "plenio-ready" }, "*"), n), !0;
}
const ea = {
  "one song, stop to review": "new song every run",
  "one cover, stop to review": "new cover every run"
}, ta = 2e3, na = 3e4;
function oa(e, t, n, o) {
  const s = ea[t];
  return !s || n <= 0 && o <= 1 ? null : {
    summary: "These runs stop for your review",
    detail: `${e}: "${t}" - each run waits at the Song Sheets until you press Approve, so queued runs render nothing by themselves. For runs that go through, choose "${s}" in the brief's mode.`
  };
}
class sa {
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
    this.recent = [...this.recent.filter((r) => o - r < ta), o];
    const s = oa(t, n, this.queued, this.recent.length);
    !s || o - this.lastNotice < na || (this.lastNotice = o, this.notify(s));
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
const tn = {
  stop: { icon: "⏸", label: "review stop", color: "#2f6fb0", frame: !1 },
  waiting: { icon: "⏸", label: "waiting for your approval", color: "#c98a12", frame: !0 },
  approved: { icon: "✓", label: "approved", color: "#2f8a55", frame: !1 },
  ok: { icon: "✓", label: "", color: "#2f8a55", frame: !1 },
  warning: { icon: "⚠", label: "warning", color: "#b87a0a", frame: !1 },
  error: { icon: "✖", label: "error", color: "#c0392b", frame: !0 },
  skipped: { icon: "–", label: "not needed", color: "#5d6b80", frame: !1 }
};
function ra(e) {
  return e === "ok" || e === "warning" || e === "error" || e === "skipped" ? e : null;
}
function ia(e, t) {
  return e === "stop for review" ? !0 : e === "as the brief says" ? !!t && t.includes("stop to review") : !1;
}
function fs(e) {
  if (/^(conflict|invalid)/.test(e.status)) return "error";
  if (e.waiting) return "waiting";
  if (e.review === "stop for review" && e.approved) return "approved";
  const t = new Set(e.findings.map((n) => n.severity));
  return t.has("error") ? "error" : t.has("warning") ? "warning" : "ok";
}
function aa(e) {
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
const Mt = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new Set();
function ps(e) {
  return Mt.get(e) ?? null;
}
function Pe(e, t) {
  t ? Mt.set(e, t) : Mt.delete(e), e.setDirtyCanvas?.(!0, !0);
  for (const n of Ue) n(e);
}
function ca(e) {
  for (const t of e) Mt.delete(t);
  for (const t of Ue) t(null);
}
function la() {
  for (const e of Ue) e(null);
}
function ua(e) {
  return Ue.add(e), () => Ue.delete(e);
}
const yo = "600 12px sans-serif", ct = 20, nn = 7;
function da(e) {
  return e.label ? `${e.icon} ${e.label}` : e.icon;
}
function fa(e) {
  const t = e ? da(e) : "";
  return {
    height: e ? ct : 0,
    getWidth(n) {
      if (!e) return 0;
      n.save(), n.font = yo;
      const o = n.measureText(t).width + 2 * nn;
      return n.restore(), o;
    },
    draw(n, o, s) {
      if (!e) return;
      n.save(), n.font = yo;
      const r = n.measureText(t).width + 2 * nn;
      n.fillStyle = e.color, n.beginPath(), typeof n.roundRect == "function" ? n.roundRect(o, s, r, ct, 5) : n.rect(o, s, r, ct), n.fill(), n.fillStyle = "#ffffff", n.textBaseline = "middle", n.fillText(t, o + nn, s + ct / 2 + 0.5), n.restore();
    }
  };
}
const pa = "PlenioSongSheet", ha = 30;
function hs(e, t) {
  const n = e.widgets?.find((o) => o.name === t);
  return n ? String(n.value ?? "") : null;
}
function ma(e) {
  const t = e.inputs?.findIndex((n) => n.name === "brief") ?? -1;
  if (t < 0) return null;
  try {
    const n = e.getInputNode?.(t);
    return n ? hs(n, "mode") : null;
  } catch {
    return null;
  }
}
function yn(e) {
  const t = ps(e);
  return t || (e.type !== pa ? null : ia(hs(e, "review") ?? "continue", ma(e)) ? "stop" : null);
}
function ga(e) {
  const t = e?.plenio_sheet, n = t?.[t.length - 1];
  if (n) return fs(n);
  const o = e?.plenio_summary;
  return ra(o?.[o.length - 1]?.status);
}
function wa(e, t) {
  const n = e.prototype, o = n.onNodeCreated;
  n.onNodeCreated = function() {
    o?.call(this);
    const s = this;
    s.badges?.push(() => {
      const r = yn(s);
      return fa(r ? tn[r] : null);
    });
  }, n.onDrawForeground = K(n.onDrawForeground, function(s) {
    const r = yn(this);
    !r || !tn[r].frame || this.flags?.collapsed || !this.size || ya(s, tn[r], this.size, ha, t.scale());
  }), n.onExecuted = K(n.onExecuted, function(s) {
    const r = ga(s);
    r && (Pe(this, r), r === "waiting" && t.toast(
      `Stopped at ${this.title || "the Song Sheet"}`,
      "Waiting for your approval: open it with its Edit button, check the documents, press Approve, then run again."
    ));
  });
}
function ya(e, t, n, o, s) {
  const r = Math.max(3, 3 / Math.max(s, 0.05));
  e.save(), e.strokeStyle = t.color, e.lineWidth = r, e.beginPath();
  const i = r / 2 + 3;
  typeof e.roundRect == "function" ? e.roundRect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i, 10) : e.rect(-i, -o - i, n[0] + 2 * i, n[1] + o + 2 * i), e.stroke(), e.restore();
}
function lu(e, t) {
  const n = [];
  let o = 0;
  return e.bars.forEach((s, r) => {
    const i = t?.[r] ?? null, a = i && i[1] > i[0] ? [i[0], i[1]] : null, c = a ? a[1] - a[0] : s.duration_s;
    n.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: o, realDur: c, source: a }), o += c;
  }), n;
}
function ms(e, t, n) {
  let o = null;
  for (const s of e)
    if (s[n] <= t + ne) o = s;
    else break;
  return o ?? e[0] ?? null;
}
function Ae(e, t) {
  const n = ms(e, t, "scoreStart");
  if (!n) return t;
  const o = n.scoreDur > 0 ? (t - n.scoreStart) / n.scoreDur : 0;
  return n.realStart + o * n.realDur;
}
function ba(e, t) {
  const n = ms(e, t, "realStart");
  if (!n) return t;
  const o = n.realDur > 0 ? (t - n.realStart) / n.realDur : 0;
  return n.scoreStart + o * n.scoreDur;
}
function uu(e, t, n) {
  const o = Ae(e, t), s = n == null ? 1 / 0 : Ae(e, n), r = [];
  for (const i of e) {
    if (!i.source) continue;
    const a = i.realStart + i.realDur, c = Math.max(i.realStart, o), u = Math.min(a, s);
    if (u <= c + ne) continue;
    let d = i.source[0] + (c - i.realStart) / i.realDur * (i.source[1] - i.source[0]), p = c - o, h = u - c;
    if (d < 0 && (p -= d, h += d, d = 0, h <= ne))
      continue;
    const g = r.at(-1);
    g && Math.abs(g.at + g.duration - p) < ne && Math.abs(g.offset + g.duration - d) < 0.01 ? g.duration += h : r.push({ at: p, offset: d, duration: h });
  }
  return r;
}
const gs = 0.04, ne = 1e-3, va = 0.25, xa = 2;
function Et(e) {
  return Math.min(xa, Math.max(va, Number.isFinite(e) ? e : 1));
}
function du(e, t) {
  const n = Et(t.speed), o = t.to ?? e.duration_s, s = [], r = t.clock?.length ? t.clock : null, i = r ? Ae(r, t.from) : t.from, a = (c) => (r ? Ae(r, c) : c) - i;
  for (const c of ["Vocal", "Ins"])
    if (t.voices[c])
      for (const u of e.notes?.[c] ?? []) {
        if (u.start_s < t.from - ne || u.start_s >= o - ne) continue;
        const d = Math.min(u.start_s + u.duration_s, o), p = Math.max(0, a(u.start_s));
        s.push({ at: p / n, duration: (a(d) - p) / n, midi: u.midi, part: c });
      }
  if (t.voices.chords)
    for (const c of e.chords ?? []) {
      const u = Math.min(c.start_s + c.duration_s, o), d = Math.max(c.start_s, t.from);
      if (!(u <= d + ne))
        for (const p of c.pitches)
          s.push({ at: a(d) / n, duration: (a(u) - a(d)) / n, midi: p, part: "chord" });
    }
  if (t.voices.guide)
    for (const c of t.guide ?? []) {
      if (c.start_s < t.from - ne || c.start_s >= o - ne) continue;
      const u = Math.min(c.start_s + c.duration_s, o), d = Math.max(0, a(c.start_s));
      s.push({ at: d / n, duration: (a(u) - d) / n, midi: c.midi, part: "guide" });
    }
  if (t.metronome)
    for (const c of e.bars) {
      const u = Number(c.meter.split("/")[0]) || 1;
      for (let d = 0; d < u; d++) {
        const p = c.start_s + d * c.duration_s / u;
        p < t.from - ne || p >= o - ne || s.push({
          at: Math.max(0, a(p)) / n,
          duration: gs,
          midi: d === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((c, u) => c.at - u.at || c.midi - u.midi);
}
function fu(e, t) {
  const n = Math.max(t.from, t.to ?? e.duration_s), o = t.clock?.length ? t.clock : null, s = o ? Ae(o, n) - Ae(o, t.from) : n - t.from;
  return Math.max(0, s) / Et(t.speed);
}
function pu(e, t, n, o, s, r) {
  const i = e && t > 0 ? e.duration_s / t : 0, a = e && i > 0 ? Math.max(0, n - e.start_s) : 0, c = i > 0 ? Math.floor(a / i + 1e-6) : 0, u = i > 0 ? (a - c * i) / i * r : 0, d = u > 1e-3 ? 0 : 1, p = Math.max(0, o * t);
  return Array.from({ length: p }, (h, g) => {
    const x = d + p - 1 - g, S = ((c - x) % t + t) % t === 0;
    return { at: Math.max(0, s - u - x * r), duration: gs, midi: S ? 96 : 89, part: "click" };
  });
}
function hu(e, t) {
  const n = e.clock?.length ? e.clock : null;
  return n ? ba(n, Ae(n, e.from) + t * Et(e.speed)) : e.from + t * Et(e.speed);
}
function mu(e, t, n) {
  return (e.elements ?? []).filter(
    (o) => o.kind === "note" && n[o.voice] && o.start_s <= t + ne && t < o.start_s + o.duration_s - ne
  ).map((o) => o.id);
}
function ka(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
const _a = [
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
], gu = {
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
function lt(e) {
  return typeof e == "string" && _a.includes(e);
}
function ws() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function Sa(e) {
  const t = ws(), n = typeof e == "object" && e !== null ? e : {};
  return {
    Vocal: lt(n.Vocal) ? n.Vocal : t.Vocal,
    Ins: lt(n.Ins) ? n.Ins : t.Ins,
    chord: lt(n.chord) ? n.chord : t.chord,
    guide: lt(n.guide) ? n.guide : t.guide
  };
}
const Ma = {
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
}, bo = /* @__PURE__ */ new WeakMap();
function on(e, t, n) {
  let o = bo.get(e);
  o || bo.set(e, o = /* @__PURE__ */ new Map());
  let s = o.get(t);
  if (!s) {
    const r = new Float32Array(n.length + 1), i = new Float32Array(n.length + 1);
    n.forEach((a, c) => i[c + 1] = a), s = e.createPeriodicWave(r, i), o.set(t, s);
  }
  return s;
}
const vo = /* @__PURE__ */ new WeakMap();
function ys(e) {
  let t = vo.get(e);
  if (!t) {
    t = e.createBuffer(1, e.sampleRate, e.sampleRate);
    const n = t.getChannelData(0);
    let o = 1;
    for (let s = 0; s < n.length; s++)
      o = o * 16807 % 2147483647, n[s] = o / 2147483647 * 2 - 1;
    vo.set(e, t);
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
function Fe(e, t, n, o, s, r) {
  const i = P(e, "sine", o), a = e.createGain();
  a.gain.setValueAtTime(0, n), a.gain.setValueAtTime(0, n + r), a.gain.linearRampToValueAtTime(s, n + r + 0.4), i.connect(a);
  for (const c of t) a.connect(c.detune);
  return i;
}
function sn(e, t, n, o, s, r) {
  const i = e.createBufferSource();
  i.buffer = ys(e);
  const a = ae(e, "bandpass", o, 1.2), c = e.createGain();
  return c.gain.setValueAtTime(s, n), c.gain.setTargetAtTime(0, n, r), i.connect(a).connect(c).connect(t), i;
}
const bt = (e, t) => Math.min(t * 2.5, Math.max(t * 0.3, t * 2 ** ((60 - e) / 24))), xo = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [ko(P(e, "sine", n), t)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (e, t, n) => [ko(P(e, "triangle", n), t)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(e, t, n, o, s, r) {
      const i = on(e, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), a = ae(e, "lowpass", Math.min(n * (5 + 7 * s), 14e3), 0.5);
      a.frequency.setTargetAtTime(Math.max(n * 2.2, 400), o + 0.01, bt(r, 0.35)), a.connect(t);
      const c = P(e, i, n, -1.5), u = P(e, i, n, 1.5), d = ge(e, 0.5);
      c.connect(d), u.connect(d), d.connect(a);
      const p = sn(e, t, o, Math.min(n * 6, 7e3), 0.12 * s, 8e-3);
      return [c, u, p];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(e, t, n, o, s, r) {
      const i = P(e, "sine", n), a = P(e, "sine", n), c = e.createGain(), u = n * (1.2 + 2.2 * s);
      c.gain.setValueAtTime(u, o), c.gain.setTargetAtTime(n * 0.25, o, bt(r, 0.25)), a.connect(c).connect(i.frequency);
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
      const i = Fe(e, r, o, 5.3, 7, 0.3);
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
      for (const u of c) u.connect(r);
      return [...c, i];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(e, t, n, o) {
      const s = on(e, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), r = P(e, s, n), i = P(e, "sine", n / 2), a = ge(e, 0.35);
      i.connect(a).connect(t), r.connect(t);
      const c = Fe(e, [r, i], o, 6.6, 4, 0), u = sn(e, t, o, 3e3, 0.05, 4e-3);
      return [r, i, c, u];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(e, t, n, o) {
      const s = on(e, "flute", [1, 0.13, 0.06, 0.02]), r = P(e, s, n);
      r.connect(t);
      const i = e.createBufferSource();
      i.buffer = ys(e), i.loop = !0;
      const a = ae(e, "bandpass", Math.min(n * 2, 8e3), 1.5), c = ge(e, 0.06);
      i.connect(a).connect(c).connect(t);
      const u = Fe(e, [r], o, 4.9, 9, 0.25);
      return [r, i, u];
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
      for (const [c, u, d] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const p = ae(e, "bandpass", c, u), h = ge(e, d);
        r.connect(p).connect(h).connect(t);
      }
      const i = ge(e, 0.15);
      r.connect(i).connect(t);
      const a = Fe(e, [s], o, 5.4, 18, 0.22);
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
      i.frequency.setTargetAtTime(Math.max(n * 1.5, 250), o + 5e-3, bt(r, 0.12)), i.connect(t);
      const a = P(e, "sawtooth", n), c = P(e, "triangle", n, 4);
      a.connect(i), c.connect(i);
      const u = sn(e, t, o, Math.min(n * 8, 8e3), 0.1 * s, 5e-3);
      return [a, c, u];
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
      const a = Fe(e, [r, i], o, 5.6, 10, 0.3);
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
      const u = ge(e, 0.25);
      return a.connect(c).connect(u).connect(t), [s, r, a];
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
function ko(e, t) {
  return e.connect(t), e;
}
function wu(e, t, n, o, s, { velocity: r = 0.8, level: i = 1 } = {}) {
  const a = xo[n] ?? xo.plain, c = ka(o), u = a.sustain === 0 ? bt(o, a.decay) : a.decay, d = i * Ma[n] * (0.55 + 0.45 * Math.max(0, Math.min(1, r))), p = e.createGain();
  p.gain.setValueAtTime(0, s), p.gain.linearRampToValueAtTime(d, s + a.attack), p.gain.setTargetAtTime(d * a.sustain, s + a.attack, u), p.connect(t);
  const h = a.build(e, p, c, s, r, o);
  for (const C of h) C.start(s);
  let g = !1, x = !1;
  const S = (C) => {
    for (const W of h)
      try {
        W.stop(C);
      } catch {
      }
  };
  return h[0].onended = () => {
    x = !0, p.disconnect();
  }, a.sustain === 0 && S(s + a.attack + u * 7), {
    release(C) {
      if (g || x) return;
      g = !0;
      const W = Math.max(C, s + a.attack);
      p.gain.setTargetAtTime(0, W, a.release), S(W + a.release * 7);
    },
    stop() {
      if (x) return;
      x = !0, g = !0;
      const C = e.currentTime;
      try {
        p.gain.cancelScheduledValues(C), p.gain.setValueAtTime(0, C);
      } catch {
      }
      S(C), p.disconnect();
    }
  };
}
function Ea(e) {
  return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 10 ? Math.round(e * 1e3) / 1e3 : 0;
}
function ze(e, t) {
  return `${e}:${t}`;
}
function Aa(e) {
  const t = /^(\d+):(\d+)$/.exec(e);
  return t ? { block: Number(t[1]), line: Number(t[2]) } : null;
}
const $a = 512;
function Pt(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length === 3 || n.length < 2 || n.length > 4 + $a || !n.every((a) => Number.isInteger(a) && a >= 0)) continue;
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
function La(e, t) {
  return e.length === t.length && e.every((n, o) => n.length === t[o].length && n.every((s, r) => s === t[o][r]));
}
function bs(e, t) {
  return e.parts.find((n) => n.block === t);
}
function vs(e, t) {
  return e.parts.find((n) => t >= n.start && t < n.end);
}
function It(e) {
  return e.syllables.length > 0 || e.pinned;
}
function xs(e, t, n) {
  let o = 0, s = n;
  for (const r of e.parts) {
    const i = r.lines.filter(It);
    !i.length || r.block === t || (r.block < t ? o = Math.max(o, ...i.map((a) => Math.max(a.end, a.start + 1))) : s = Math.min(s, ...i.map((a) => a.start)));
  }
  return [o, Math.max(s, o + 1)];
}
function Na(e, t, n, o, s) {
  const r = bs(e, t), [i, a] = o, c = new Map((r?.lines ?? []).map((p) => [p.line, p])), u = [];
  let d = r ? Math.max(r.start, i) : i;
  return n.forEach((p, h) => {
    const g = c.get(h);
    if (g && It(g)) {
      const x = Math.min(Math.max(g.start, i), a - 1), S = Math.min(Math.max(g.end, x + 1), a);
      u.push({ id: String(h), text: p, start: x, end: S }), d = S;
    } else {
      const x = Math.min(Math.max(d, i), a);
      u.push({ id: String(h), text: p, start: x, end: x });
    }
  }), u;
}
function Ta(e, t) {
  const [n, o] = t, r = e.map((i, a) => {
    const c = Math.min(Math.max(i.start, n), Math.max(n, o - 1)), u = i.end > i.start ? Math.min(Math.max(i.end, c + 1), o) : c;
    return { line: { ...i, start: c, end: u }, index: a, placed: i.id.startsWith("*") };
  }).sort((i, a) => i.line.start - a.line.start || Number(a.placed) - Number(i.placed) || i.index - a.index).map((i) => i.line);
  for (let i = 0; i + 1 < r.length; i++) {
    const a = r[i + 1];
    r[i].end > a.start && (r[i].end = Math.max(a.start, r[i].start));
  }
  return r;
}
function Pn(e) {
  return (e?.parts ?? []).flatMap(
    (t) => t.lines.filter((n) => It(n) && n.end > n.start).map((n) => ({ key: ze(n.block, n.line), block: n.block, line: n.line, start: n.start, end: n.end, text: n.text }))
  ).sort((t, n) => t.start - n.start || t.block - n.block || t.line - n.line);
}
function Oa(e, t, n = /* @__PURE__ */ new Set()) {
  for (const o of t) {
    const s = e.find((r) => !n.has(r.key) && r.start < o.end && o.start < r.end);
    if (s) return s;
  }
  return null;
}
function Ca(e, t, n, o = 1) {
  const s = e.parts.flatMap((l) => l.lines.map((k) => ({ ...k, key: ze(k.block, k.line) }))), r = t.kind === "move" ? new Set(t.keys) : /* @__PURE__ */ new Set([t.key]), i = s.filter((l) => r.has(l.key) && l.text).map((l) => ({ key: l.key, block: l.block, start: l.start, end: l.end > l.start ? l.end : Math.min(n, l.start + Math.max(1, o)) })), a = Pn(e).filter((l) => !r.has(l.key)), c = { moves: [], free: !0, stoppedAt: null };
  if (!i.length) return c;
  const u = (l) => {
    let k = 0, L = n;
    for (const b of a)
      b.block < l ? k = Math.max(k, b.end) : b.block > l && (L = Math.min(L, b.start));
    return [k, Math.max(k, L)];
  };
  if (t.kind !== "move") {
    const l = i[0], [k, L] = u(l.block);
    if (t.kind === "end") {
      const E = a.filter((q) => q.start >= l.start).sort((q, F) => q.start - F.start)[0], _ = Math.min(L, E ? E.start : n), T = l.end + t.delta, O = Math.max(l.start + 1, Math.min(T, _));
      return { moves: [{ key: l.key, start: l.start, end: O }], free: O === T, stoppedAt: T > _ && E && E.start === _ ? E : null };
    }
    const b = a.filter((E) => E.end <= l.end).sort((E, _) => _.end - E.end)[0], v = Math.max(k, b ? b.end : 0), M = l.start + t.delta, y = Math.min(l.end - 1, Math.max(M, v));
    return {
      moves: [{ key: l.key, start: y, end: l.end }],
      free: y === M,
      stoppedAt: M < v && b && b.end === v ? b : null
    };
  }
  let d = -1 / 0, p = 1 / 0;
  for (const l of i) {
    const [k, L] = u(l.block);
    d = Math.max(d, k - l.start), p = Math.min(p, L - l.end);
  }
  const h = a.flatMap((l) => i.map((k) => ({ other: l, from: l.start - k.end, to: l.end - k.start }))), g = (l) => l >= d && l <= p && !h.some((k) => l > k.from && l < k.to), x = t.delta, S = [x, 0, d, p, ...h.flatMap((l) => [l.from, l.to])].filter((l) => Number.isFinite(l) && g(l));
  if (!S.length) return { moves: [], free: !1, stoppedAt: null };
  const C = S.reduce((l, k) => {
    const L = Math.abs(k - x) - Math.abs(l - x);
    return L < 0 || L === 0 && Math.abs(k) < Math.abs(l) ? k : l;
  }), W = C === x ? null : h.find((l) => x > l.from && x < l.to)?.other ?? null;
  return {
    moves: C ? i.map((l) => ({ key: l.key, start: l.start + C, end: l.end + C })) : [],
    free: C === x,
    stoppedAt: W
  };
}
function Pa(e, t, n, o, s = 4 * Math.max(1, n)) {
  const r = vs(e, Math.min(Math.max(0, t), Math.max(0, o - 1)));
  if (!r) return null;
  const i = Pn(e);
  if (i.some((S) => t >= S.start && t < S.end)) return null;
  const a = [
    Math.max(0, ...i.filter((S) => S.end <= t).map((S) => S.end)),
    Math.min(o, ...i.filter((S) => S.start > t).map((S) => S.start))
  ], [, c] = xs(e, r.block, o), u = Math.max(1, n);
  let d = Math.max(a[0], Math.floor(t / u) * u);
  const p = r.phrases.find(([S, C]) => t >= S && t < C);
  p && !i.some((S) => S.start < p[1] && S.end > p[0]) && (d = Math.max(a[0], p[0]));
  const h = r.phrases.find(([S, C]) => C > d && S <= d) ?? r.phrases.find(([S]) => S > d), g = Math.min(h ? h[1] : d + Math.max(1, s), a[1], c, o);
  if (g <= d) return null;
  const x = r.lines.length ? Math.max(...r.lines.map((S) => S.line)) + 1 : 0;
  return { block: r.block, line: x, start: d, end: g };
}
function Ia(e, t, n, o = !1) {
  const s = e.filter((u) => u.length >= 4 && !n.has(u[2])), r = new Set(s.map((u) => ze(u[2], u[3]))), i = o || e.some((u) => u.length === 2) ? t.parts.flatMap(
    (u) => u.lines.filter((d) => (o ? It(d) : d.pinned) && d.end > d.start && !n.has(d.block) && !r.has(ze(d.block, d.line))).map((d) => [d.start, d.end, d.block, d.line])
  ) : [], a = new Map(e.filter((u) => u.length > 4).map((u) => [`${u[0]}:${u[1]}:${u[2]}`, u.slice(4)])), c = [...n].flatMap(
    ([u, d]) => d.map((p, h) => [p.start, p.end, u, h, ...a.get(`${p.start}:${p.end}:${u}`) ?? []])
  );
  return Pt([...s, ...i, ...c]);
}
function Ra(e, t) {
  const n = [];
  for (const o of e) {
    const [s, r] = o;
    for (const [i, a, c] of t) {
      if (s < i || s >= a) continue;
      const u = c - i, d = o.slice(4), p = d.every((g) => g >= i && g < a) ? d.map((g) => g + u) : [], h = o.length >= 4 ? [s + u, Math.min(r, a) + u, o[2], o[3], ...p] : [s + u, Math.min(r, a) + u];
      n.push(h);
    }
  }
  return Pt(n);
}
function qa(e, t, n, o, s) {
  const r = [];
  for (const i of e) {
    if (i.length < 4) {
      r.push(i);
      continue;
    }
    const a = n[i[2]], c = o.map((d, p) => ({ index: d, block: p })).filter(({ index: d }) => a !== void 0 && t[d] === a);
    if (!c.length) continue;
    const u = c.reduce((d, p) => Math.abs(s[p.index] - i[0]) < Math.abs(s[d.index] - i[0]) ? p : d);
    r.push([i[0], i[1], u.block, i[3], ...i.slice(4)]);
  }
  return Pt(r);
}
function za(e) {
  const t = [...e].sort((o, s) => o.start - s.start), n = t[0]?.start ?? 0;
  return t.map((o) => ({ text: o.text, offset: o.start - n, length: Math.max(1, o.end - o.start) }));
}
const Ba = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clipOfLines: za,
  editRange: xs,
  fitLyricGesture: Ca,
  followSpans: qa,
  laneLines: Pn,
  lineKey: ze,
  newLineAt: Pa,
  overlap: Oa,
  parseLineKey: Aa,
  parseShift: Ea,
  parseSpans: Pt,
  partAt: vs,
  partOf: bs,
  placedLines: Na,
  remapSpans: Ra,
  sameSpans: La,
  settle: Ta,
  withBlockSpans: Ia
}, Symbol.toStringTag, { value: "Module" })), ks = 18, Da = 24, At = ks + Da, Ha = 22, Fa = 34, Qe = 36, ja = 6, yu = 3, Wa = 12, Ga = 6, Va = 28, Ua = 21, Ya = 108;
function Xa(e) {
  return [
    ...e.tracks.vocal.map((t) => ({ ...t, track: "vocal" })),
    ...e.tracks.ins.map((t) => ({ ...t, track: "ins" }))
  ];
}
function Ka(e) {
  const t = Number(e.unit.split("/")[1]);
  return Number.isFinite(t) && t > 0 ? t : 32;
}
function Qa(e, t) {
  return t === "auto" ? Math.max(1, e.grid.snap) : Math.max(1, Math.round(Ka(e) / t));
}
function Ja(e, t = 4, n = 24) {
  let o = e.length ? Math.min(...e.map((r) => r.pitch)) - t : 60, s = e.length ? Math.max(...e.map((r) => r.pitch)) + t : 79;
  if (s - o + 1 < n) {
    const r = n - (s - o + 1);
    o -= Math.floor(r / 2), s += Math.ceil(r / 2);
  }
  return o < 0 && ([o, s] = [0, Math.min(127, s - o)]), s > 127 && ([o, s] = [Math.max(0, o - (s - 127)), 127]), [o, s];
}
function Za(e) {
  const t = e.map((s) => s.pitch), n = Math.max(0, Math.min(Ua, ...t.map((s) => s - 2))), o = Math.min(127, Math.max(Ya, ...t.map((s) => s + 2)));
  return [n, o];
}
function bu(e, t) {
  const n = At + (t.lyrics ? Ha : 0), o = n + (t.source ? Fa : 0), s = Xa(e), [r, i] = Za(s), a = i - r + 1, c = t.pxPerQuarter / Math.max(e.grid.units_per_quarter, 1e-9), u = Math.max(Ga, Math.min(Va, Math.round(t.rowHeight ?? Wa))), d = Qa(e, t.snap), p = Math.max(1, Math.round(e.grid.units_per_quarter));
  return {
    pxPerUnit: c,
    rowHeight: u,
    high: i,
    low: r,
    focus: Ja(s),
    total: e.total,
    snap: d,
    drawLength: Math.max(d, Math.round(p / d) * d),
    width: Qe + e.total * c + 40,
    height: o + a * u,
    top: o,
    sourceTop: t.source ? n : null
  };
}
const In = (e, t) => Qe + e * t.pxPerUnit, ec = (e, t) => (e - Qe) / t.pxPerUnit, $t = (e, t) => t.top + (t.high - e) * t.rowHeight;
function tc(e, t, n, o) {
  const s = ($t(o, e) + $t(n, e) + e.rowHeight) / 2, r = Math.max(0, t - e.top), i = s - e.top - r / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, e.height - t), i)));
}
function vu(e, t, n, o) {
  const s = $t(o, e);
  return s >= t + e.top && s + e.rowHeight <= t + n ? null : tc(e, n, o, o);
}
function _o(e, t) {
  const n = t.high - Math.floor((e - t.top) / t.rowHeight);
  return Math.max(t.low, Math.min(t.high, n));
}
const nc = (e, t) => Math.floor(e / t) * t, ut = (e, t) => Math.round(e / t) * t;
function bn(e, t) {
  return {
    x: In(e.onset, t),
    y: $t(e.pitch, t) + 0.5,
    width: Math.max(2, e.duration * t.pxPerUnit - 1),
    height: Math.max(2, t.rowHeight - 1)
  };
}
function _s(e, t, n) {
  const o = e.name.length * 7 + 10, s = t ? (t.onset - e.onset) * n.pxPerUnit - 2 : o;
  return Math.max(12, Math.min(o, s));
}
const xu = (e) => [1, 3, 6, 8, 10].includes((e % 12 + 12) % 12);
function ku(e) {
  return `C${Math.floor(e / 12) - 1}`;
}
function _u(e) {
  const t = [];
  for (const n of e.measures) {
    t.push({ unit: n.onset, kind: "bar", bar: n.n });
    const o = Number(n.meter.split("/")[0]) || 1, s = n.length / o;
    for (let r = 1; r < o; r++) t.push({ unit: n.onset + r * s, kind: "beat" });
  }
  return t;
}
function Su(e, t, n, o, s, r, i = 0, a = 0) {
  const c = Math.max(0, Math.min(s.total, ec(e, s))), u = t - i;
  if (u < ks) return { area: "header", unit: c };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: c };
  if (u >= At && u < s.top) return { area: "lyrics", unit: c };
  if (u < At) {
    for (let h = o.length - 1; h >= 0; h--) {
      const g = o[h], x = In(g.onset, s);
      if (e >= x && e <= x + _s(g, o[h + 1], s)) return { area: "chord", chord: g };
    }
    return { area: "lane", unit: c };
  }
  if (e - a < Qe) return { area: "keys", pitch: _o(t, s) };
  const d = n.filter((h) => {
    const g = bn(h, s);
    return e >= g.x && e <= g.x + g.width && t >= g.y - 0.5 && t <= g.y + g.height + 0.5;
  }), p = d.find((h) => h.track === r) ?? d[0];
  if (p) {
    const h = bn(p, s), g = e >= h.x + h.width - Math.min(ja, h.width / 3) ? "end" : "body";
    return { area: "note", note: p, edge: g };
  }
  return { area: "grid", unit: c, pitch: _o(t, s) };
}
function Ss(e, t, n) {
  return e.y0 < (e.from?.scrollTop ?? n) + t || e.y1 < n + t;
}
function oc(e, t, n = 0, o = 0) {
  const s = e.from?.scrollTop ?? n, r = e.from?.scrollLeft ?? o, i = (h, g) => Math.max(g + Qe, Math.min(t.width, h)), a = (h, g) => Math.max(g + t.top, Math.min(t.height, h)), c = [i(e.x0, r), i(e.x1, o)], u = [a(e.y0, s), a(e.y1, n)], d = Math.min(...c), p = Math.min(...u);
  return { x: d, y: p, width: Math.max(...c) - d, height: Math.max(...u) - p };
}
function Mu(e, t = 0, n = At) {
  return Ss(e, n, t);
}
function Eu(e, t, n) {
  return t.width <= 0 || t.height <= 0 ? [] : e.filter((o) => {
    const s = bn(o, n);
    return s.x < t.x + t.width && s.x + s.width > t.x && s.y < t.y + t.height && s.y + s.height > t.y;
  });
}
function Au(e, t, n, o = 0, s = 0) {
  if (!Ss(t, n.top, o)) return [];
  const r = oc(t, n, o, s);
  return r.width <= 0 ? [] : e.filter((i, a) => {
    const c = In(i.onset, n);
    return c < r.x + r.width && c + _s(i, e[a + 1], n) > r.x;
  });
}
function $u(e, t, n, o) {
  return { kind: "move", notes: e, anchor: t, fromUnit: n, fromPitch: o, delta: 0, semitones: 0 };
}
function Lu(e, t = [], n = 1 / 0) {
  const o = t.filter((r) => r.track === e.track && r.onset > e.onset).map((r) => r.onset), s = Math.min(n, ...o);
  return { kind: "resize", note: e, end: e.onset + e.duration, overwrite: !1, limit: s };
}
function Nu(e, t, n, o) {
  const s = Math.max(0, Math.min(nc(t, o.snap), o.total - 1));
  return { kind: "draw", track: e, start: s, end: Math.min(o.total, s + o.snap), pitch: n };
}
function Tu(e, t = e.onset) {
  return { kind: "chord", chord: e, fromUnit: t, to: e.onset };
}
const je = (e, t, n) => Math.max(t, Math.min(n, e));
function Ou(e, t, n, o, s) {
  switch (e.kind) {
    case "move": {
      const r = e.anchor.onset + (t - e.fromUnit), i = Math.min(...e.notes.map((h) => h.onset)), a = Math.max(...e.notes.map((h) => h.onset + h.duration)), c = je(ut(r, o.snap) - e.anchor.onset, -i, o.total - a), u = Math.min(...e.notes.map((h) => h.pitch)), d = Math.max(...e.notes.map((h) => h.pitch)), p = je(n - e.fromPitch, -u, 127 - d);
      return { ...e, delta: c, semitones: p, copy: s.alt };
    }
    case "resize": {
      const r = Math.min(o.snap, o.total - e.note.onset), i = s.alt ? o.total : Math.max(e.note.onset + e.note.duration, Math.min(o.total, e.limit)), a = je(ut(t, o.snap), e.note.onset + Math.max(1, r), i);
      return { ...e, end: Math.min(a, i), overwrite: s.alt };
    }
    case "draw": {
      const r = t <= e.start ? e.start + o.snap : Math.max(e.start + o.snap, ut(t, o.snap));
      return { ...e, end: Math.min(o.total, r) };
    }
    case "chord":
      return { ...e, to: je(ut(e.chord.onset + t - e.fromUnit, o.snap), 0, o.total - 1) };
  }
}
function Cu(e, t) {
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
function Pu(e) {
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
function Iu(e) {
  return e ? e.kind === "move" ? e.copy ? /* @__PURE__ */ new Set() : new Set(e.notes.map((t) => t.id)) : e.kind === "resize" ? /* @__PURE__ */ new Set([e.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Ru(e, t, n, o, s, r) {
  const i = n.map((a) => a.id);
  switch (e) {
    case "ArrowUp":
    case "ArrowDown": {
      if (!n.length && !o.length) return;
      const a = (t.shift ? 12 : 1) * (e === "ArrowUp" ? 1 : -1), c = n.map((u) => u.pitch + a);
      return c.length && (Math.min(...c) < 0 || Math.max(...c) > 127) ? null : { op: "set_note_pitch", ids: [...i, ...o.map((u) => u.id)], semitones: a };
    }
    case "ArrowLeft":
    case "ArrowRight": {
      if (!n.length) return;
      const a = e === "ArrowRight" ? 1 : -1;
      if (t.alt) {
        const h = n[0], g = h.duration + a * s.snap;
        return g < 1 || h.onset + g > s.total ? null : { op: "resize_note", id: h.id, duration: g, mode: r };
      }
      const c = t.shift ? s.drawLength : s.snap, u = Math.min(...n.map((h) => h.onset)), d = Math.max(...n.map((h) => h.onset + h.duration)), p = je(a * c, -u, s.total - d);
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
const sc = /^(vocal|ins):\d+$/;
function rc(e, t) {
  const n = e?.model?.tracks, o = /* @__PURE__ */ new Set();
  if (!n) return o;
  const s = /* @__PURE__ */ new Map();
  for (const r of [...n.vocal, ...n.ins]) for (const i of r.segments) s.set(i, r.id);
  for (const r of t)
    if (sc.test(r)) o.add(r);
    else {
      const i = s.get(r);
      i && o.add(i);
    }
  return o;
}
function qu(e) {
  return new Set(e.filter((t) => t.startsWith("chord:")));
}
function zu(e, t = []) {
  return [...e.flatMap((n) => n.segments.length ? n.segments : [n.id]), ...t.map((n) => n.id)];
}
const ic = ["auto", "omit", "ins"];
function Ms(e) {
  return e.wanted ? e.wanted - (new Set(e.syllables.map((t) => t.onset)).size + e.holds.length) : 0;
}
function Bu(e) {
  return (e?.parts ?? []).flatMap((t) => t.lines.filter((n) => Ms(n) !== 0));
}
function Du(e) {
  return e > 0 ? `+${e}` : `−${-e}`;
}
function Hu(e) {
  const t = Ms(e);
  if (!t) return "";
  const n = e.wanted === 1 ? "1 syllable" : `${e.wanted} syllables`, o = e.wanted - t;
  return `${n} on ${o === 1 ? "1 note" : `${o} notes`}`;
}
function Fu(e, t, n) {
  const o = [], s = rc(e ?? null, t);
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
const ac = { vocal: !1, ins: !1 }, cc = { vocal: "Vocal", ins: "Instrument" }, lc = { Vocal: "vocal", Ins: "ins" };
function uc(e) {
  const t = typeof e == "object" && e !== null ? e : {};
  return { vocal: t.vocal === !0, ins: t.ins === !0 };
}
const We = (e) => `The ${cc[e]} track is locked: unlock it to edit it.`;
function Rn(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (!t.vocal && !t.ins) return n;
  for (const o of ["vocal", "ins"])
    if (t[o])
      for (const s of e?.model?.tracks[o] ?? []) {
        n.add(s.id);
        for (const r of s.segments) n.add(r);
      }
  for (const o of e?.elements ?? []) {
    const s = lc[o.voice];
    s && t[s] && n.add(o.id);
  }
  return n;
}
function dc(e, t, n) {
  const o = Rn(e, n);
  return o.size ? t.filter((s) => !o.has(s)) : [...t];
}
function vt(e) {
  const t = String(e ?? "").toLowerCase();
  return t === "vocal" ? "vocal" : t === "ins" ? "ins" : null;
}
const fc = /* @__PURE__ */ new Set(["delete", "delete_close_gap", "move_notes", "set_note_pitch", "join_notes", "quantize", "set_pitch", "shift_pitch", "note_to_rest"]), pc = /* @__PURE__ */ new Set(["resize_note", "split_note", "set_duration", "rest_to_note"]), hc = /* @__PURE__ */ new Set(["insert_note", "fill_rest", "place_notes", "shift_track"]);
function be(e) {
  return { operation: e, note: null };
}
function ju(e, t, n) {
  if (!n.vocal && !n.ins) return be(e);
  const o = e.op, s = (u) => ({ operation: null, note: We(u) }), r = n.vocal ? "vocal" : "ins";
  if (hc.has(o)) {
    const u = vt(e.track);
    if (u && n[u]) return s(u);
  }
  if (o === "silence_voice") {
    const u = vt(e.voice ?? "Vocal");
    return u && n[u] ? s(u) : be(e);
  }
  if (o === "move_vocal_to_ins") return s(r);
  if (o === "fit_notes")
    return n.vocal ? s("vocal") : !n.ins || e.surplus === "omit" ? be(e) : { operation: { ...e, surplus: "omit" }, note: `${We("ins")} Surplus notes were left out instead of moved there.` };
  if (o === "paste") return mc(e, n);
  if (pc.has(o)) {
    const u = String(e.id ?? (Array.isArray(e.ids) ? e.ids[0] : ""));
    return Rn(t, n).has(u) ? s(So(u, t, n)) : be(e);
  }
  if (!fc.has(o) || !Array.isArray(e.ids)) return be(e);
  const i = vt(e.track);
  if (o === "move_notes" && i && n[i]) return s(i);
  const a = e.ids, c = dc(t, a, n);
  return c.length === a.length ? be(e) : c.length ? { operation: { ...e, ids: c }, note: `${We(r)} Its selected notes stayed as they are.` } : s(So(a[0], t, n));
}
function So(e, t, n) {
  return n.vocal && Rn(t, { vocal: !0, ins: !1 }).has(e) ? "vocal" : n.ins ? "ins" : "vocal";
}
function mc(e, t) {
  if (e.mode === "insert") return be(e);
  const n = Array.isArray(e.notes) ? e.notes : [], o = (u) => {
    const d = vt(u);
    return !d || !t[d];
  }, s = n.filter((u) => o(u.track)), r = Array.isArray(e.tracks) ? e.tracks.filter(o) : e.tracks, i = Array.isArray(e.chords) ? e.chords.length : 0;
  if (!(s.length !== n.length || Array.isArray(e.tracks) && r.length !== e.tracks.length)) return be(e);
  const c = t.vocal ? "vocal" : "ins";
  return !s.length && !i ? { operation: null, note: We(c) } : { operation: { ...e, notes: s, tracks: r }, note: `${We(c)} Only the other notes were pasted.` };
}
const Wu = 12, dt = { width: 640, height: 420 }, gc = { width: 1280, height: 900 }, Es = 120, As = 720, $s = 0.25, Ls = 0.85, Ns = 160, Ts = 460, Os = "plenio.sheet.dialog";
function Ye(e, t, n) {
  return Number.isFinite(e) ? Math.min(Math.max(e, t), Math.max(t, n)) : t;
}
function wc(e, t) {
  const n = Ye(e.width, dt.width, Math.max(dt.width, t.width - 16)), o = Ye(e.height, dt.height, Math.max(dt.height, t.height - 16));
  return { width: Math.round(n), height: Math.round(o) };
}
function Gu(e, t) {
  return Math.round(Ye(e + t, Es, As));
}
function Vu(e, t, n) {
  return !Number.isFinite(n) || n <= 0 ? Mo(e) : Mo(e + t / n);
}
function Mo(e) {
  return Math.round(Ye(e, $s, Ls) * 1e3) / 1e3;
}
function Uu(e, t) {
  return Math.round(Ye(e + t, Ns, Ts));
}
function Yu(e, t, n) {
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
  }, c = (u) => {
    if (u.buttons === 0) {
      a();
      return;
    }
    t({ dx: u.clientX - o, dy: u.clientY - s });
  };
  window.addEventListener("pointermove", c), window.addEventListener("pointerup", a), window.addEventListener("pointercancel", a), window.addEventListener("blur", a);
}
function yc() {
  return { ...gc, maximized: !1 };
}
function Xu(e = Cs()) {
  const t = yc();
  try {
    const n = e?.getItem(Os);
    if (!n) return t;
    const o = JSON.parse(n);
    return { ...wc(
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
function Ku(e, t = Cs()) {
  try {
    t?.setItem(Os, JSON.stringify(e));
  } catch {
  }
}
function Cs() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Ps(e) {
  return e === "large" || e === "standard" || e === "smaller" || e === "compact";
}
function Is() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function bc(e) {
  const t = Is(), n = typeof e == "object" && e !== null ? e : {}, o = (s, r, i) => r.includes(s) ? s : i;
  return {
    countIn: o(n.countIn, [0, 1, 2], t.countIn),
    quantize: o(n.quantize, [0, 4, 8, 16, 32], t.quantize),
    mode: o(n.mode, ["replace", "merge"], t.mode),
    mute: typeof n.mute == "boolean" ? n.mute : t.mute,
    thru: typeof n.thru == "boolean" ? n.thru : t.thru,
    stepLength: o(n.stepLength, [1, 2, 4, 8, 16], t.stepLength)
  };
}
const Rs = "plenio.score-editor.prefs";
function vc() {
  return {
    layout: "review",
    advanced: !1,
    zoom: 1,
    voices: { Vocal: !0, Ins: !0, chords: !0, guide: !0 },
    locks: { ...ac },
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
    sounds: ws(),
    paper: "a4",
    notationSize: "standard",
    record: Is(),
    midiInput: "all"
  };
}
function xc(e) {
  const t = e.layout;
  return t === "text" ? { layout: "text", advanced: e.advanced === !0 } : t === "daw" ? { layout: "daw", advanced: e.advanced === !0 } : t === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: e.advanced === !0 };
}
function Qu(e = qs()) {
  const t = vc();
  try {
    const n = e?.getItem(Rs);
    if (!n) return t;
    const o = JSON.parse(n);
    return {
      ...xc(o),
      zoom: typeof o.zoom == "number" && o.zoom >= 0.6 && o.zoom <= 1.8 ? o.zoom : t.zoom,
      locks: uc(o.locks),
      fitSurplus: ic.includes(o.fitSurplus) ? o.fitSurplus : t.fitSurplus,
      voices: {
        Vocal: o.voices?.Vocal !== !1,
        Ins: o.voices?.Ins !== !1,
        chords: o.voices?.chords !== !1,
        guide: o.voices?.guide !== !1
      },
      speed: typeof o.speed == "number" && o.speed >= 0.25 && o.speed <= 2 ? o.speed : t.speed,
      roll: o.roll !== !1,
      rollZoom: typeof o.rollZoom == "number" && o.rollZoom >= 12 && o.rollZoom <= 240 ? o.rollZoom : t.rollZoom,
      rollHeight: typeof o.rollHeight == "number" && o.rollHeight >= Es && o.rollHeight <= As ? Math.round(o.rollHeight) : t.rollHeight,
      notationShare: typeof o.notationShare == "number" && o.notationShare >= $s && o.notationShare <= Ls ? o.notationShare : t.notationShare,
      sideWidth: typeof o.sideWidth == "number" && o.sideWidth >= Ns && o.sideWidth <= Ts ? Math.round(o.sideWidth) : t.sideWidth,
      metronome: o.metronome === !0,
      hear: o.hear === "notes" || o.hear === "source" ? o.hear : t.hear,
      sourceLevel: typeof o.sourceLevel == "number" && o.sourceLevel >= 0 && o.sourceLevel <= 1 ? o.sourceLevel : t.sourceLevel,
      audition: o.audition !== !1,
      rowHeight: typeof o.rowHeight == "number" && o.rowHeight >= 6 && o.rowHeight <= 28 ? Math.round(o.rowHeight) : t.rowHeight,
      follow: o.follow !== !1,
      sung: o.sung !== !1,
      wave: o.wave !== !1,
      sounds: Sa(o.sounds),
      paper: o.paper === "letter" ? "letter" : "a4",
      notationSize: Ps(o.notationSize) ? o.notationSize : t.notationSize,
      record: bc(o.record),
      midiInput: typeof o.midiInput == "string" && o.midiInput ? o.midiInput : "all"
    };
  } catch {
    return t;
  }
}
function Ju(e, t = qs()) {
  try {
    t?.setItem(Rs, JSON.stringify(e));
  } catch {
  }
}
function qs() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function zs(e) {
  if (!Array.isArray(e)) return [];
  const t = (n) => typeof n == "string" ? n : "";
  return e.filter((n) => !!n && typeof n == "object").map((n) => ({
    token: t(n.token),
    file: t(n.file),
    title: t(n.title),
    paper: n.paper === "letter" ? "letter" : "a4",
    size: Ps(n.size) ? n.size : "standard",
    display_abc: t(n.display_abc)
  })).filter((n) => n.token && n.file && n.display_abc);
}
function kc(e) {
  return zs(e?.plenio_notation);
}
async function _c(e) {
  const t = await e.fetchApi("/plenio/export/sheet-music/pending", { cache: "no-store" });
  if (!t.ok) return [];
  const n = await t.json().catch(() => ({}));
  return zs(n.jobs);
}
async function Sc(e, t) {
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
let Eo = Promise.resolve();
function Mc(e) {
  const t = Eo.then(e, e);
  return Eo = t.catch(() => {
  }), t;
}
class Ec {
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
        Mc(() => Sc(s, this.host)).then(
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
      t = await _c(this.host.fetcher);
    } catch {
      return;
    }
    await Promise.all(this.take(t, !0));
  }
}
const Bs = "PlenioSeed", Ac = 2 ** 32, Ds = "plenio_part", xt = "plenio_seed_hint", Ao = 56, $o = {
  fresh: { color: "#7a5418", bgcolor: "#3b2a10" },
  keep: { color: "#1f4e6e", bgcolor: "#14304a" }
};
function $c(e = Math.random) {
  return Math.floor(e() * Ac);
}
function Lc(e, t) {
  const n = t.trim() || "result";
  return e ? `🔒 Every run uses this seed again: the same ${n}.` : `🎲 Every run draws a new seed: a new ${n}. Liked it? Switch to 🔒.`;
}
function Ie(e, t) {
  return e.widgets?.find((n) => n.name === t);
}
function Hs(e) {
  const t = e.inputs?.find((n) => n.name === "seed");
  return t?.link !== void 0 && t?.link !== null;
}
function Lt(e) {
  const t = !!Ie(e, "keep_seed")?.value, n = e, o = t ? $o.keep : $o.fresh;
  n.color = o.color, n.bgcolor = o.bgcolor;
  const s = Ie(e, xt)?.element;
  s && (s.textContent = Lc(t, String(e.properties?.[Ds] ?? ""))), e.setDirtyCanvas?.(!0, !0);
}
function Lo(e, t = Math.random) {
  const n = Ie(e, "seed");
  !n || Hs(e) || (n.value = $c(t), n.callback?.(n.value), e.setDirtyCanvas?.(!0, !0));
}
function Nc(e, t = Math.random) {
  const n = Ie(e, "seed"), o = Ie(e, "keep_seed");
  if (!n || !o) return;
  n.beforeQueued = () => {
    o.value || Lo(e, t);
  }, o.callback = K(o.callback, () => Lt(e));
  const r = e.addWidget?.("button", "🎲 new seed now", null, () => Lo(e, t), { serialize: !1 });
  if (r && (r.serialize = !1), !Ie(e, xt)) {
    const i = document.createElement("div");
    i.className = "plenio-seed-hint";
    const a = e.addDOMWidget(xt, xt, i, {
      serialize: !1,
      getValue: () => "",
      setValue: () => {
      },
      // two lines of text and the frontend's margin of 10 px above and below a DOM widget
      getMinHeight: () => Ao,
      getMaxHeight: () => Ao
    });
    a.serialize = !1;
  }
  Lt(e);
}
function Tc(e) {
  const t = e.prototype, n = t.onNodeCreated;
  t.onNodeCreated = function() {
    n?.call(this), Nc(this);
  }, e.prototype.onConfigure = K(e.prototype.onConfigure, function() {
    Lt(this);
  });
}
const Fs = /* @__PURE__ */ new Set(["new song every run", "new cover every run"]), Oc = /* @__PURE__ */ new Set(["one song, stop to review", "one cover, stop to review"]);
function Cc(e, t) {
  return Fs.has(e) ? !1 : Oc.has(e) ? t.trim() !== "take" : null;
}
function Pc(e, t) {
  let n = 0;
  for (const o of e) {
    if (o.type !== Bs || Hs(o)) continue;
    const s = Cc(t, String(o.properties?.[Ds] ?? "")), r = o.widgets?.find((i) => i.name === "keep_seed");
    s === null || !r || !!r.value === s || (r.value = s, Lt(o), n++);
  }
  return n;
}
function Ic(e, t) {
  const n = `${t} seed${t === 1 ? "" : "s"}`;
  return Fs.has(e) ? { summary: `${n} now 🎲 new seed`, detail: `"${e}": every run draws all its seeds anew - a new song each time. Switch a seed to 🔒 to keep that part.` } : { summary: `${n} now 🔒 same seed`, detail: `"${e}": the song's draft, plan, arrangement and cover stay while you review it; the take seed still draws anew.` };
}
function Rc(e, t) {
  const n = e.widgets?.find((o) => o.name === "mode");
  n && (n.callback = K(n.callback, (o) => {
    const s = e.graph, r = String(o ?? n.value ?? ""), i = Pc(s?.nodes ?? s?._nodes ?? [], r);
    if (i) {
      const a = Ic(r, i);
      t(a.summary, a.detail);
    }
  }));
}
const qc = "PlenioSongSheet";
function Je(e) {
  return e.widgets?.find((t) => t.name === "sheet_state") ?? null;
}
function js(e, t) {
  const n = e.inputs?.[t]?.link;
  if (n == null) return null;
  try {
    const o = e.graph, s = o?.links, r = o?.getLink?.(n) ?? (s instanceof Map ? s.get(n) : s?.[String(n)]);
    return r && o?.getNodeById ? o.getNodeById(r.origin_id) ?? null : e.getInputNode?.(t) ?? null;
  } catch {
    return null;
  }
}
function Ws(e, t) {
  const n = (e.inputs ?? []).findIndex((o) => o.name === t && o.link != null);
  return n < 0 ? null : js(e, n);
}
function Gs(e, t) {
  const n = Ws(e, t);
  return n && (n.comfyClass ?? n.type) === qc && Je(n) ? n : null;
}
function zc(e) {
  return Gs(e, "context_lyrics");
}
function Bc(e) {
  return Gs(e, "context_score");
}
function Dc(e, t, n) {
  const o = [], s = Ws(t, n);
  s && o.push(s);
  const r = /* @__PURE__ */ new Set();
  for (; o.length && r.size < 1e3; ) {
    const i = o.shift(), a = String(i.id);
    if (!r.has(a)) {
      if (r.add(a), i === e || a === String(e.id)) return !0;
      (i.inputs ?? []).forEach((c, u) => {
        const d = js(i, u);
        d && o.push(d);
      });
    }
  }
  return !1;
}
function Hc(e, t, n) {
  const o = zc(e), s = t?.context?.lyrics;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = Ee(Je(o)?.value), a = i?.docs.lyrics?.text ?? n(String(o.id))?.docs.lyrics?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Me(a) !== Me(s) && (c = `The lyrics in ${r} changed after the last run. Run the workflow again; then they can follow the sections.`), { owner: o, target: { title: r, blocked: c, replans: Dc(o, e, "score") } };
}
function Fc(e, t, n) {
  const o = Je(e);
  if (!o) return;
  const s = Ee(o.value) ?? Ct();
  o.value = Ve(ts(s, n, [{ kind: "lyrics", text: t, intent: "keep" }])), e.setDirtyCanvas?.(!0, !0);
}
function jc(e, t, n) {
  const o = Bc(e), s = t?.context?.score;
  if (!o || !s) return null;
  const r = o.title || "Song Sheet", i = Ee(Je(o)?.value), a = i?.docs.score?.text ?? n(String(o.id))?.docs.score?.upstream ?? null;
  let c = null;
  return i === null ? c = `The state of ${r} is unreadable - open that sheet and apply it first.` : a !== null && Me(a) !== Me(s) && (c = `The score in ${r} changed after the last run. Run the workflow again; then it can be edited here.`), { owner: o, target: { title: r, blocked: c } };
}
function Wc(e, t) {
  const n = String(e.widgets?.find((o) => o.name === "review")?.value ?? "continue");
  return n === "as the brief says" ? t?.review ?? "continue" : n;
}
async function Gc(e, t, n, o = null) {
  const s = Je(e);
  if (!s) return null;
  const r = Ee(s.value) ?? Ct(), i = ts(r, n, [{ kind: "score", text: t, intent: "keep" }]);
  if (s.value = Ve(i), e.setDirtyCanvas?.(!0, !0), !o || !n) return i;
  try {
    const a = await ur(o.fetcher, {
      sheet_state: i,
      upstream: oi(n),
      owned: n.owned,
      review: Wc(e, n),
      engine: n.engine,
      instrumental: n.instrumental,
      context: n.context,
      target_seconds: n.target_seconds ?? null,
      sparse: n.sparse ?? !1
    });
    if (!!a.findings.some((d) => d.severity === "error") || !a.fingerprint) return i;
    const u = ni(i, a.fingerprint);
    return s.value = Ve(u), e.setDirtyCanvas?.(!0, !0), u;
  } catch {
    return i;
  }
}
const Vc = {
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
function Uc(e) {
  return e.properties?.plenio_editor_layout === "daw" ? "daw" : (e.inputs ?? []).some((n) => n.name === "score" && n.link != null) ? "score" : "text";
}
const Vs = "PLENIO_SHEET_STATE", No = 128;
let kt = null;
function Yc(e) {
  kt = e;
}
const Xc = (e, t, n) => {
  let o = typeof n?.[1]?.default == "string" ? n[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const r = document.createElement("div");
  r.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.type = "button", i.className = "plenio-sheet-open", i.innerHTML = '<span class="icon"></span><span class="text"><span class="name"></span><span class="what"></span></span><span class="go">Edit</span>';
  const a = document.createElement("div");
  a.className = "plenio-sheet-status", s.append(i, r, a);
  let c = !1, u = null;
  const d = () => {
    const l = Uc(e);
    if (l === u) return;
    u = l;
    const k = Vc[l];
    i.dataset.kind = l, i.title = `${k.name} - opens the Song Sheet editor (${k.what.toLowerCase()})`, i.querySelector(".icon").innerHTML = k.icon, i.querySelector(".name").textContent = k.name, i.querySelector(".what").textContent = k.what;
  }, p = () => {
    d();
    const l = Le(String(e.id)), k = yn(e);
    r.textContent = ei(Ee(o)) + (l && k !== "approved" ? ` · ${l.status}` : ""), a.textContent = aa(k), a.dataset.state = k ?? "";
    const L = c ? null : e.widgets?.find((b) => b.name === "review");
    if (L) {
      c = !0;
      const b = L.callback;
      L.callback = (v) => {
        b?.(v), p();
      };
    }
  }, h = e.addDOMWidget(t, Vs, s, {
    getValue: () => o,
    setValue: (l) => {
      o = typeof l == "string" ? l : "", p();
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => No,
    getMaxHeight: () => No
  });
  i.addEventListener("click", (l) => {
    l.stopPropagation(), g().catch((k) => {
      console.error("Plenio: the Song Sheet editor could not open", k), r.textContent = `The editor could not open: ${k instanceof Error ? k.message : String(k)}`;
    });
  });
  async function g() {
    const l = Ee(o);
    l === null && (r.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const k = Le(String(e.id)), b = (e.inputs ?? []).filter((j) => j.link != null).map((j) => j.name), v = l ?? { schema: "plenio.sheet_state/1", docs: {} }, M = k?.owned ?? ns(b, v), y = String(e.widgets?.find((j) => j.name === "review")?.value ?? "continue"), E = y === "as the brief says" ? k?.review ?? "continue" : y, _ = () => Nn(import.meta.url, Tn), { openSheetDialog: T } = await Te(() => import("./open-DEefLWvy.mjs"), _), { parseGuide: O, serializeGuide: q } = await Te(() => import("./tracks-ClAVjvds.mjs"), _), { parseShift: F, parseSpans: V } = await Te(() => Promise.resolve().then(() => Ba), _), { parseBarSources: D } = await Te(() => import("./barSources-Cq3VGvmq.mjs"), _);
    if (!kt) throw new Error("Plenio: API not initialised");
    let J = null;
    try {
      J = Hc(e, k, Le);
    } catch (j) {
      console.warn("Plenio: the lyrics sheet of this score was not found", j);
    }
    let G = null;
    try {
      G = jc(e, k, Le);
    } catch (j) {
      console.warn("Plenio: the score sheet of these lyrics was not found", j);
    }
    const I = kt, R = G?.owner ?? e;
    T({
      title: e.title || "Song Sheet",
      state: v,
      payload: k,
      asrNote: Ui(k?.docs.lyrics?.upstream_sha256),
      owned: M.length ? M : [...Ke],
      review: E,
      fetcher: kt,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof e.properties?.plenio_editor_layout == "string" ? e.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: O(e.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: V(e.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: F(e.properties?.plenio_source_shift),
      barSources: D(R.properties?.plenio_bar_sources),
      lyricsTarget: J?.target ?? null,
      scoreTarget: G?.target ?? null,
      onApply: (j, Ze, Be, Y, Rt, $e) => {
        const qt = String(h.value ?? "");
        if (h.value = Ve(j), e.properties = {
          ...e.properties ?? {},
          plenio_guide: q(Ze),
          plenio_lyric_spans: ($e?.lyricSpans ?? []).map((he) => [...he]),
          plenio_source_shift: $e?.sourceShift ?? 0
        }, $e?.barSources && !G?.target.blocked && (R.properties = { ...R.properties ?? {}, plenio_bar_sources: $e.barSources }), Rt ? Pe(e, "approved") : String(h.value) !== qt && x(e), Be !== null && J && !J.target.blocked && (Fc(J.owner, Be, Le(String(J.owner.id))), x(J.owner)), Y && G && !G.target.blocked) {
          const he = G.owner;
          Gc(he, Y.text, Le(String(he.id)), Y.approved ? { fetcher: I } : null).then(
            (zt) => {
              zt?.review?.approved_fingerprint ? Pe(he, "approved") : x(he);
            }
          );
        }
        e.setDirtyCanvas?.(!0, !0);
      }
    });
  }
  function x(l) {
    ps(l) === "approved" && Pe(l, null);
  }
  const S = [
    Gi((l) => {
      l === String(e.id) && p();
    }),
    ua((l) => {
      (l === null || l === e) && p();
    })
  ], C = e.onDrawForeground;
  e.onDrawForeground = function(l) {
    C?.call(this, l), d();
  };
  const W = e.onRemoved;
  return e.onRemoved = function() {
    for (const l of S) l();
    W?.call(this);
  }, p(), { widget: h };
}, Us = "PLENIO_FINISH_SWITCH", Kc = "plenio_switch", To = 148, vn = 0, Qc = 4, rn = [
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
function Jc(e) {
  return e?.nodes ?? e?._nodes ?? [];
}
function Ys(e) {
  return Jc(e).filter((t) => t.properties?.[Kc] === "cover");
}
function ft(e) {
  const t = Ys(e);
  return t.length ? t.some((n) => (n.mode ?? vn) === vn) : null;
}
function Zc(e, t) {
  for (const n of Ys(e)) n.mode = t ? vn : Qc;
  e?.setDirtyCanvas?.(!0, !0);
}
function Oo(e) {
  return e === !0 || typeof e == "string" && ["true", "1", "on"].includes(e.trim().toLowerCase());
}
const xn = /* @__PURE__ */ new Set();
function el() {
  for (const e of xn) e();
}
const tl = (e, t, n) => {
  let o = Oo(n?.[1]?.default);
  const s = e, r = document.createElement("div");
  r.className = "plenio-switches";
  const i = /* @__PURE__ */ new Map();
  for (const g of rn) {
    const x = document.createElement("button");
    x.type = "button", x.className = "plenio-switch", x.dataset.switch = g.id, x.innerHTML = `<span class="icon">${g.icon}</span><span class="text"><span class="name"></span><span class="what"></span></span><span class="pill"></span>`, x.addEventListener("click", (S) => {
      S.stopPropagation(), g.id === "hq" ? (o = !o, u.value = o, u.callback?.(o)) : Zc(s.graph, !ft(s.graph)), c();
    }), i.set(g.id, x), r.append(x);
  }
  function a(g, x) {
    const S = i.get(g.id);
    S && (S.hidden = x === null, S.classList.toggle("on", !!x), S.setAttribute("aria-pressed", String(!!x)), S.title = `${g.name}: ${x ? "on" : "off"} - click to switch it ${x ? "off" : "on"}`, S.querySelector(".name").textContent = g.name, S.querySelector(".what").textContent = x ? g.on : g.off, S.querySelector(".pill").textContent = x ? "ON" : "OFF");
  }
  function c() {
    a(rn[0], o), a(rn[1], ft(s.graph));
  }
  const u = e.addDOMWidget(t, Us, r, {
    getValue: () => o,
    setValue: (g) => {
      o = Oo(g), c();
    },
    getMinHeight: () => To,
    getMaxHeight: () => To
  });
  xn.add(c);
  let d = ft(s.graph);
  const p = e.onDrawForeground;
  e.onDrawForeground = function(g) {
    p?.call(this, g);
    const x = ft(s.graph);
    x !== d && (d = x, c());
  };
  const h = e.onRemoved;
  return e.onRemoved = function() {
    xn.delete(c), h?.call(this);
  }, c(), { widget: u };
}, Xe = "plenio.stem_mix/1", Re = "rest", nl = ["reverb", "delay"], Xs = -60, ol = 12;
function sl() {
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
function Ks(e) {
  const t = sl();
  return e.gain_db === t.gain_db && e.mute === t.mute && e.solo === t.solo && e.compression === t.compression && e.muted.length === 0 && e.reverb === t.reverb && e.delay === t.delay && e.save === t.save;
}
const rl = ["vocals", "drums", "bass", "other"];
function il() {
  return [...rl, Re];
}
function al(e) {
  if (typeof e != "string" || !e.trim()) return { schema: Xe, strips: {} };
  try {
    const t = JSON.parse(e);
    return t?.schema !== Xe || typeof t.strips != "object" || t.strips === null ? null : t;
  } catch {
    return null;
  }
}
function cl(e) {
  const t = {};
  for (const o of Object.keys(e.strips)) {
    if (!o || Ks(le(e, o))) continue;
    const s = {}, r = le(e, o);
    r.gain_db && (s.gain_db = r.gain_db), r.mute && (s.mute = !0), r.solo && (s.solo = !0), r.compression && (s.compression = r.compression), r.muted.length && (s.muted = r.muted), r.reverb && (s.reverb = r.reverb), r.delay && (s.delay = r.delay), r.save && (s.save = !0), t[o] = s;
  }
  const n = { schema: Xe, strips: t };
  return e.reverb && Object.keys(e.reverb).length && (n.reverb = e.reverb), e.delay && Object.keys(e.delay).length && (n.delay = e.delay), JSON.stringify(n);
}
function Nt(e, t, n) {
  const o = { ...e.strips };
  return Ks(n) ? delete o[t] : o[t] = n, { ...e, strips: o };
}
function ll(e, t, n) {
  const o = n.some((r) => le(e, r).solo), s = le(e, t);
  return o ? s.solo : !s.mute;
}
function Co(e) {
  return e <= Xs ? "-∞" : `${e > 0 ? "+" : ""}${e.toFixed(1)}`;
}
function ul(e, t = null) {
  const n = e.filter((s) => Array.isArray(s) && s.length === 2 && Number.isFinite(s[0]) && Number.isFinite(s[1])).map((s) => [Math.max(0, Math.min(s[0], s[1])), Math.max(s[0], s[1])]).filter((s) => s[1] - s[0] > 1e-6).sort((s, r) => s[0] - r[0]), o = [];
  for (const s of n) {
    const r = o[o.length - 1];
    r && s[0] <= r[1] + 1e-6 ? r[1] = Math.max(r[1], s[1]) : o.push([...s]);
  }
  return t !== null && t > 0 ? o.map(([s, r]) => [Math.min(s, t), Math.min(r, t)]).filter(([s, r]) => r - s > 1e-6) : o;
}
function dl(e, t, n) {
  return ul([...e, [t, n]]);
}
function fl(e, t) {
  return e.findIndex(([n, o]) => n <= t && t <= o);
}
function pl(e, t) {
  return t < 0 ? e : e.filter((n, o) => o !== t);
}
function hl(e, t, n, o) {
  const s = le(e, t);
  return Nt(e, t, { ...s, muted: dl(s.muted, n, o) });
}
function ml(e, t, n) {
  const o = le(e, t), s = fl(o.muted, n);
  return s < 0 ? e : Nt(e, t, { ...o, muted: pl(o.muted, s) });
}
function gl(e) {
  const t = e?.plenio_stems, n = t?.[t.length - 1];
  if (!n?.peaks) return {};
  const o = {};
  for (const [s, r] of Object.entries(n.peaks))
    Array.isArray(r) && r.length && (o[s] = r.map((i) => Math.abs(Number(i) || 0)));
  return o;
}
function wl(e, t, n = 200) {
  const o = e[t];
  return o?.length ? o.length === n ? o : Array.from({ length: n }, (s, r) => o[Math.floor(r * o.length / n)] ?? 0) : new Array(n).fill(0);
}
function Po(e, t) {
  const o = (Array.isArray(t?.stems) && t.stems.length ? t.stems : il()).filter((r) => r !== Re), s = Object.keys(e?.strips ?? {}).filter((r) => r !== Re && !o.includes(r));
  return [...o, ...s, Re];
}
const Io = "plenio_stem_mixer", Ro = "mix", we = 200, yl = ["room", "plate", "hall"];
function B(e, t, n) {
  const o = document.createElement(e);
  return t && (o.className = t), n !== void 0 && (o.textContent = n), o;
}
function pt(e, t, n, o, s) {
  const r = B("input");
  return r.type = "range", r.min = String(e), r.max = String(t), r.step = String(n), r.value = String(o), r.setAttribute("aria-label", s), r;
}
function bl(e) {
  const t = B("div", "plenio-mix"), n = B("div", "plenio-mix-strips"), o = B("div", "plenio-mix-buses"), s = B("div", "plenio-mix-info"), r = B("div", "plenio-mix-advanced");
  t.append(n, o, r, s);
  let i = {
    mix: { schema: Xe, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: Po(null, null),
    peaks: {},
    seconds: 0
  }, a = !1;
  const c = () => e.widgets?.find((b) => b.name === Ro);
  function u(b, { draw: v = !0 } = {}) {
    const M = c();
    if (!M) return;
    const y = cl(b);
    M.value = y, M.callback?.(y), i = { ...i, mix: b }, v && g();
  }
  function d(b, v, M = {}) {
    u(Nt(i.mix, b, { ...le(i.mix, b), ...v }), M);
  }
  function p(b, v, M, y = {}) {
    const E = le(i.mix, b);
    let _ = Nt(i.mix, b, { ...E, [v]: M });
    M > 0 && !(_[v] && Object.keys(_[v]).length) && (_ = v === "reverb" ? { ..._, reverb: { preset: "room" } } : { ..._, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4e3 } }), u(_, y);
  }
  function h(b, v, M) {
    const y = { ...i.mix[b] ?? {} };
    u({ ...i.mix, [b]: { ...y, [v]: M } });
  }
  function g() {
    n.replaceChildren();
    const b = i.names;
    for (const v of i.names) {
      const M = le(i.mix, v), y = B("div", "plenio-mix-strip");
      y.dataset.strip = v;
      const E = B("span", "name", v === Re ? `${v} (missed)` : v);
      E.title = v === Re ? "What the separator missed: keeps a neutral mix exact" : "";
      const _ = pt(Xs, ol, 0.5, M.gain_db, `${v} gain`), T = B("span", "gain", `${Co(M.gain_db)} dB`);
      _.addEventListener("input", () => {
        T.textContent = `${Co(Number(_.value))} dB`, d(v, { gain_db: Number(_.value) }, { draw: !1 });
      }), _.addEventListener("change", () => d(v, { gain_db: Number(_.value) }));
      const O = B("button", M.mute ? "toggle active" : "toggle", "M");
      O.setAttribute("aria-label", `${v} mute`), O.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { mute: !M.mute });
      });
      const q = B("button", M.solo ? "toggle active" : "toggle", "S");
      q.setAttribute("aria-label", `${v} solo`), q.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { solo: !M.solo });
      });
      const F = pt(0, 1, 0.05, M.compression, `${v} compression`);
      F.title = "Compression amount: one knob for the master compressor (threshold and ratio)", F.addEventListener("input", () => d(v, { compression: Number(F.value) }, { draw: !1 })), F.addEventListener("change", () => d(v, { compression: Number(F.value) }));
      const V = nl.map((I) => {
        const R = pt(0, 1, 0.05, M[I], `${v} ${I} send`);
        return R.title = `${I} send: how much of this stem goes to the shared ${I} bus`, R.addEventListener("input", () => p(v, I, Number(R.value), { draw: !1 })), R.addEventListener("change", () => p(v, I, Number(R.value))), R;
      }), D = B("button", M.save ? "toggle active" : "toggle", "save");
      D.setAttribute("aria-label", `${v} save as its own file`), D.setAttribute("aria-pressed", String(M.save)), D.title = 'Save this stem as its own 24-bit FLAC file on the next run - next to the song, in the folder "<name>-stems" (without an Export Release: output/plenio/stems); its gain, compression and muted ranges are applied, mute/solo and the buses are not', D.addEventListener("click", (I) => {
        I.stopPropagation(), d(v, { save: !M.save });
      });
      const J = ll(i.mix, v, b);
      y.classList.toggle("silent", !J);
      const G = B("canvas", "plenio-mix-wave");
      G.width = we, G.height = 26, G.setAttribute("aria-label", `${v} waveform (drag to mute a time range)`), x(G, M, wl(i.peaks, v, we)), G.addEventListener("pointerdown", (I) => S(I, G, v)), y.append(
        E,
        _,
        T,
        O,
        q,
        B("span", "label", "comp"),
        F,
        B("span", "label", "verb"),
        V[0],
        B("span", "label", "delay"),
        V[1],
        D,
        G
      ), n.append(y);
    }
    C(), s.textContent = i.seconds ? `last run: ${i.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it` : "no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them", e.setDirtyCanvas?.(!0, !0);
  }
  function x(b, v, M) {
    const y = b.getContext("2d");
    if (!y) return;
    y.clearRect(0, 0, we, b.height);
    const E = b.height / 2;
    y.strokeStyle = "rgba(180, 190, 205, 0.8)", y.beginPath();
    for (let _ = 0; _ < M.length; _++) {
      const T = Math.max(1, M[_] * (E - 1));
      y.moveTo(_ + 0.5, E - T), y.lineTo(_ + 0.5, E + T);
    }
    y.stroke(), y.fillStyle = "rgba(224, 104, 94, 0.35)", y.strokeStyle = "rgba(224, 104, 94, 0.9)";
    for (const [_, T] of v.muted) {
      const O = Math.max(0, Math.min(we, _ / Math.max(i.seconds, 1e-6) * we)), q = Math.max(0, Math.min(we, T / Math.max(i.seconds, 1e-6) * we));
      y.fillRect(O, 0, Math.max(1, q - O), b.height), y.strokeRect(O + 0.5, 0.5, Math.max(1, q - O) - 1, b.height - 1);
    }
  }
  function S(b, v, M) {
    if (b.preventDefault(), b.stopPropagation(), !i.seconds) return;
    const y = v.getBoundingClientRect(), E = (V) => Math.max(0, Math.min(1, (V - y.left) / (y.width || we))) * i.seconds, _ = E(b.clientX);
    if (le(i.mix, M).muted.some(([V, D]) => V <= _ && _ <= D)) {
      u(ml(i.mix, M, _));
      return;
    }
    let O = _;
    const q = (V) => {
      O = E(V.clientX);
    }, F = () => {
      window.removeEventListener("pointermove", q), window.removeEventListener("pointerup", F), u(hl(i.mix, M, Math.min(_, O), Math.max(_, O)));
    };
    window.addEventListener("pointermove", q), window.addEventListener("pointerup", F);
  }
  function C() {
    o.replaceChildren();
    const b = { preset: "room", ...i.mix.reverb ?? {} }, v = { time_ms: 375, feedback: 0.35, ...i.mix.delay ?? {} }, M = B("select");
    M.setAttribute("aria-label", "Reverb preset"), M.title = "The room the reverb bus adds; the amount per stem is its verb send";
    for (const _ of yl) M.append(new Option(_, _));
    M.value = String(b.preset ?? "room"), M.addEventListener("change", () => h("reverb", "preset", M.value));
    const y = B("input");
    y.type = "number", y.value = String(v.time_ms ?? 375), y.setAttribute("aria-label", "Delay time in ms"), y.title = "Delay time in ms: where the first echo of the delay bus sits", y.addEventListener("change", () => h("delay", "time_ms", Number(y.value)));
    const E = pt(0, 0.8, 0.05, Number(v.feedback ?? 0.35), "Delay feedback");
    E.title = "Delay feedback: how much of each echo returns into the delay line", E.addEventListener("input", () => h("delay", "feedback", Number(E.value))), o.append(
      B("span", "label", "reverb bus"),
      M,
      B("span", "label", "delay bus"),
      y,
      B("span", "label", "ms, feedback"),
      E
    ), o.style.display = "flex";
  }
  const W = e.addDOMWidget(Io, Io, t, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => 260,
    getMaxHeight: () => 620
  });
  W.serialize = !1;
  const l = e.widgets?.find((b) => b.name === Ro), k = B("button", "toggle", "JSON");
  k.title = "Show or hide the raw mixer value", k.addEventListener("click", (b) => {
    b.stopPropagation(), a = !a, k.classList.toggle("active", a), l && (l.plenioHidden = !a, a ? delete l.computeSize : l.computeSize = () => [0, -4]), e.setDirtyCanvas?.(!0, !0);
  }), r.append(B("span", "label", "Advanced"), k), l && (l.plenioHidden = !0, l.computeSize = () => [0, -4]);
  function L() {
    const b = al(c()?.value);
    i = { ...i, mix: b ?? { schema: Xe, strips: {} } }, b || (s.textContent = "the mixer value is not readable; it will be replaced on the next edit"), g();
  }
  return L(), {
    showExecuted(b) {
      const v = b?.plenio_stems?.at(-1), M = gl(b), y = Po(i.mix, v ?? null);
      i = { ...i, names: y, peaks: M, seconds: Number(v?.seconds ?? i.seconds) || 0 }, L();
    }
  };
}
const kn = "plenio-tip", qo = 12, ht = 8;
function vl(e, t, n, o) {
  let s = e.right + qo;
  if (s + n.width > o.width - ht && (s = e.left - qo - n.width), s < ht) return null;
  const r = Math.max(ht, Math.min(t - 14, o.height - ht - n.height));
  return { x: s, y: r };
}
function xl(e) {
  return !!e && (String(e.type ?? "").startsWith("Plenio") || String(e.title ?? "").startsWith("Plenio"));
}
const kl = 30;
function _l(e) {
  const t = e.node_over, n = e.ds, o = e.canvas;
  if (!t || !n || !o) return null;
  const s = o.getBoundingClientRect(), r = t.flags?.collapsed ? 0 : t.size[1];
  return {
    left: s.left + (t.pos[0] + n.offset[0]) * n.scale,
    top: s.top + (t.pos[1] - kl + n.offset[1]) * n.scale,
    right: s.left + (t.pos[0] + t.size[0] + n.offset[0]) * n.scale,
    bottom: s.top + (t.pos[1] + r + n.offset[1]) * n.scale
  };
}
function Sl(e) {
  const t = document.body, n = () => t.classList.remove(kn);
  let o = 0, s = null;
  const r = (a) => {
    const c = e();
    if (a.style.display === "none" || !a.textContent?.trim() || !c || !xl(c.node_over)) return n();
    const u = _l(c), d = a.getBoundingClientRect(), p = u && vl(u, o, d, { width: window.innerWidth, height: window.innerHeight });
    if (!p) return n();
    const h = a.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    t.style.setProperty("--plenio-tip-x", `${Math.round(p.x - h.left)}px`), t.style.setProperty("--plenio-tip-y", `${Math.round(p.y - h.top)}px`), t.classList.add(kn);
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
const Ml = `
body.${kn} .node-tooltip { left: var(--plenio-tip-x) !important; top: var(--plenio-tip-y) !important;
  transform: none !important; }
`, El = `
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
` + Ml;
function Al() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = El, document.head.append(e);
}
function _n(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function mt(e) {
  return _n(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function $l(e) {
  const t = e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((n) => n.trim());
  return t.every((n) => /^:?-{3,}:?$/.test(n)) ? null : t;
}
function Ll(e) {
  const t = [];
  let n = !1, o = null, s = null;
  const r = () => {
    n && (t.push("</ul>"), n = !1);
  }, i = () => {
    if (s) {
      const [a, ...c] = s, u = (d, p) => `<tr>${d.map((h) => `<${p}>${mt(h)}</${p}>`).join("")}</tr>`;
      t.push(`<table><thead>${u(a, "th")}</thead><tbody>${c.map((d) => u(d, "td")).join("")}</tbody></table>`), s = null;
    }
  };
  for (const a of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (o !== null) {
      a.startsWith("```") ? (t.push(`<pre><code>${_n(o.join(`
`))}</code></pre>`), o = null) : o.push(a);
      continue;
    }
    if (a.trim().startsWith("|")) {
      r();
      const d = $l(a);
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
      t.push(`<h${d}>${mt(c[2])}</h${d}>`);
      continue;
    }
    const u = /^\s*[-*]\s+(.*)$/.exec(a);
    if (u) {
      n || (t.push("<ul>"), n = !0), t.push(`<li>${mt(u[1])}</li>`);
      continue;
    }
    r(), a.trim() && t.push(`<p>${mt(a)}</p>`);
  }
  return r(), i(), o !== null && t.push(`<pre><code>${_n(o.join(`
`))}</code></pre>`), t.join("");
}
const Ge = "plenio_summary", zo = "plenio_summary", Bo = 84, Nl = 18, Tl = 55, Ol = 16, Do = 10;
function Cl(e) {
  const t = e.split(`
`).filter((n) => n.trim()).reduce((n, o) => n + Math.max(1, Math.ceil(o.length / Tl)), 0);
  return Ol + t * Nl;
}
function Pl(e, t) {
  const n = e.widgets?.find((i) => i.name === zo);
  if (n?.element) return n.element;
  const o = document.createElement("div");
  o.className = "plenio-summary";
  let s = Do;
  const r = e.addDOMWidget(zo, "plenio_summary", o, {
    serialize: !1,
    getValue: () => "",
    setValue: () => {
    },
    getMinHeight: () => Bo,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets. The margins
    // count too - without them the element stayed 20 px short of its text and hid the last line
    getMaxHeight: () => Math.max(Bo, (o.scrollHeight ? o.scrollHeight + 2 : Cl(t.markdown)) + 2 * s)
  });
  return s = r.margin ?? Do, r.serialize = !1, o;
}
function Il(e) {
  const t = e.computeSize?.();
  t && e.size && e.size[1] < t[1] && e.setSize?.([e.size[0], t[1]]);
}
const Ho = /* @__PURE__ */ new WeakMap();
function Sn(e, t) {
  if (!t.markdown) return;
  const n = Ho.get(e) ?? { markdown: "" };
  n.markdown = t.markdown, Ho.set(e, n);
  const o = Pl(e, n);
  o.dataset.status = t.status ?? "", o.innerHTML = Ll(t.markdown), Il(e), e.setDirtyCanvas?.(!0, !0);
}
function Fo(e, t, n, o) {
  const s = e.properties?.[Ge], r = (s?.markdown ?? "").split(`
`), i = r.findIndex((c) => c.startsWith(t));
  i >= 0 ? r[i] = n : r.push(n);
  const a = { markdown: r.join(`
`).trim(), status: o ?? s?.status ?? "" };
  e.properties = e.properties ?? {}, e.properties[Ge] = a, Sn(e, a);
}
function Rl(e) {
  e.prototype.onExecuted = K(e.prototype.onExecuted, function(t) {
    const n = t?.[Ge], o = n?.[n.length - 1];
    o?.markdown && (this.properties = this.properties ?? {}, this.properties[Ge] = { markdown: o.markdown, status: o.status ?? "" }, Sn(this, o));
  }), e.prototype.onConfigure = K(e.prototype.onConfigure, function() {
    const t = this.properties?.[Ge];
    t?.markdown && Sn(this, t);
  });
}
const ql = "Plenio.Core", Z = lr;
Yc(Z);
const X = Go, an = { app: X, fetcher: Z }, cn = { app: X, fetcher: Z }, Qs = () => X.graph;
function Mn(e) {
  if (e == null) return null;
  const t = String(e);
  return Qs()?.getNodeById?.(t.includes(":") ? t : Number(t)) ?? null;
}
async function zl(e, t) {
  const n = `Your own ${e.replace("_", " ")} - any text; the list holds the style templates' values.`, o = X.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: "Plenio · your own value", message: n, defaultValue: t }) : window.prompt(n, t);
}
const jo = new sa(
  (e) => X.extensionManager?.toast?.add({ severity: "warn", summary: e.summary, detail: e.detail, life: 2e4 })
), Bl = {
  scale: () => X.canvas?.ds?.scale ?? 1,
  toast: (e, t) => X.extensionManager?.toast?.add({ severity: "info", summary: e, detail: t, life: 12e3 })
}, Js = () => Nn(import.meta.url, Tn), Dl = {
  fetcher: Z,
  async draw(e, t, n, o) {
    const { notationPdf: s, renderLines: r } = await Te(
      () => import("./notationExport-DkCMgjck.mjs").then((a) => a.c),
      Js,
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
function Hl(e, t) {
  const n = Mn(e), o = n?.properties?.plenio_summary;
  return n?.type === "PlenioExportRelease" && o?.markdown?.includes(`- sheet music: ${t}`) ? n : null;
}
function Fl(e, t) {
  const n = `- sheet music: ${e.job.file}`, o = Hl(t, e.job.file);
  if ("saved" in e) {
    o && Fo(o, n, `${n} - saved (${Math.max(1, Math.round(e.saved.bytes / 1024))} KB)`), X.extensionManager?.toast?.add({ severity: "success", summary: "Sheet music saved", detail: e.saved.file, life: 6e3 });
    return;
  }
  const { error: s } = e, r = s instanceof Q && s.hint ? `${s.message} ${s.hint}` : String(s instanceof Error ? s.message : s);
  if (e.quiet) {
    console.info(`Plenio: ${e.job.file} was saved by another page`);
    return;
  }
  o && Fo(o, n, `${n} - not saved: ${r}`, "warning"), X.extensionManager?.toast?.add({ severity: "error", summary: "Sheet music not saved", detail: `${e.job.file}: ${r}`, life: 15e3 });
}
const En = /* @__PURE__ */ new Map(), Wo = new Ec(Dl, (e) => {
  Fl(e, En.get(e.job.token)), En.delete(e.job.token);
});
Go.registerExtension({
  name: ql,
  getCustomWidgets: () => ({ [Vs]: Xc, [Us]: tl }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: Xt,
      label: "Continue a Plenio song…",
      icon: "pi pi-history",
      function: () => gi(an).catch((e) => {
        console.error("Plenio: the Continue a song dialog could not open", e), X.extensionManager?.toast?.add({
          severity: "error",
          summary: "Continue a song",
          detail: String(e instanceof Error ? e.message : e),
          life: 15e3
        });
      })
    },
    { id: mo, label: "Plenio Player", icon: "pi pi-play-circle", function: () => wn(cn) }
  ],
  menuCommands: [
    { path: ["File"], commands: [Xt] },
    { path: ["Plenio"], commands: [mo, Xt] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: "pi pi-play-circle",
      label: "Plenio Player",
      tooltip: "Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)",
      onClick: () => {
        wn(cn);
      }
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(e) {
    const t = Mr(e);
    t.length && console.info(`Plenio: longer LLM answers (${dn} tokens) in ${t.join(", ")}`);
    try {
      const n = await br(e, Z);
      for (const o of vr(n)) X.extensionManager?.toast?.add({ ...o, life: 2e4 });
    } catch (n) {
      console.error("Plenio: the blocks of this workflow could not be brought up to date", n);
      const o = n instanceof Q && n.hint ? `${n.message} ${n.hint}` : String(n instanceof Error ? n.message : n);
      X.extensionManager?.toast?.add({
        severity: "warn",
        summary: "Plenio blocks not brought up to date - the brief's creativity may not reach their sampling",
        detail: o,
        life: 2e4
      });
    }
  },
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => {
    la(), el();
  },
  async beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    Kn.has(t.name) && await Rr(e, t, Z, zl), Rl(e), wa(e, Bl);
    const n = _i(t.input);
    if (n.size || t.name in Cn) {
      const o = e.prototype.configure;
      e.prototype.configure = function(s) {
        const r = Wi(t, s), i = yi(r), a = o?.call(this, r);
        return ki(this, i, n), Di(t.name, this.widgets), a;
      };
    }
    if (t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(o) {
      for (const s of o?.plenio_asr ?? []) Vi(s);
    })), t.name === "PlenioEQ") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, Pi(this, Z));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    if (t.name === "PlenioExportRelease" && Ki(e, cn), t.name === Bs && Tc(e), Kn.has(t.name)) {
      Kr(e, Z);
      const o = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        o?.call(this), jo.watch(this), Rc(
          this,
          (s, r) => X.extensionManager?.toast?.add({ severity: "info", summary: s, detail: r, life: 1e4 })
        );
      };
    }
    if (t.name === "PlenioStemMixer") {
      const o = /* @__PURE__ */ new WeakMap(), s = e.prototype.onNodeCreated;
      e.prototype.onNodeCreated = function() {
        s?.call(this), o.set(this, bl(this));
      }, e.prototype.onExecuted = K(e.prototype.onExecuted, function(r) {
        o.get(this)?.showExecuted(r);
      });
    }
    t.name === "PlenioSongSheet" && (e.prototype.onExecuted = K(e.prototype.onExecuted, function(o) {
      const s = o?.plenio_sheet, r = s?.[s.length - 1];
      r && ho(String(this.id), r);
    }));
  },
  setup() {
    Al(), Sl(() => X.canvas), mi(an), Zi(an), Z.addEventListener("plenio.sheet", (n) => {
      const o = n.detail;
      if (!o?.node_id) return;
      ho(String(o.node_id), o);
      const s = Mn(o.node_id);
      s && Pe(s, fs(o));
    }), Z.addEventListener("status", (n) => {
      jo.status(n.detail?.exec_info?.queue_remaining);
    }), Z.addEventListener("execution_start", () => {
      ca(Qs()?.nodes ?? []);
    }), Z.addEventListener("execution_error", (n) => {
      const o = Mn(n.detail?.node_id);
      o && String(o.type).startsWith("Plenio") && Pe(o, "error");
    }), Z.addEventListener("executed", (n) => {
      const o = n.detail, s = kc(o?.output), r = o?.display_node ?? o?.node;
      for (const i of s) En.set(i.token, r);
      Wo.take(s);
    });
    const e = () => {
      Wo.recover();
    };
    let t = !1;
    Z.addEventListener("reconnected", () => {
      Js().then((n) => {
        n ? t || (t = !0, X.extensionManager?.toast?.add({ severity: "warn", summary: "Plenio was updated", detail: pn })) : e();
      });
    }), document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" && e();
    }), window.setTimeout(e, 3e3);
  }
});
export {
  tc as $,
  oc as A,
  Eu as B,
  Au as C,
  Mu as D,
  ze as E,
  Hu as F,
  Ms as G,
  ks as H,
  _u as I,
  Su as J,
  Qe as K,
  Da as L,
  ec as M,
  zu as N,
  Lu as O,
  Q as P,
  $u as Q,
  _o as R,
  Fa as S,
  ne as T,
  Tu as U,
  Nu as V,
  yu as W,
  Ou as X,
  Cu as Y,
  nc as Z,
  Ru as _,
  eu as a,
  ou as a$,
  Ga as a0,
  Va as a1,
  Iu as a2,
  Ca as a3,
  Pa as a4,
  vu as a5,
  lu as a6,
  du as a7,
  uu as a8,
  hu as a9,
  Gu as aA,
  Mo as aB,
  Uu as aC,
  Jl as aD,
  Kl as aE,
  Ql as aF,
  La as aG,
  Ta as aH,
  Na as aI,
  Ia as aJ,
  Aa as aK,
  za as aL,
  vs as aM,
  Oa as aN,
  Pn as aO,
  Ra as aP,
  qa as aQ,
  dc as aR,
  ju as aS,
  Ju as aT,
  Vu as aU,
  cu as aV,
  Vl as aW,
  Xu as aX,
  Gl as aY,
  su as aZ,
  iu as a_,
  mu as aa,
  fu as ab,
  pu as ac,
  Et as ad,
  ba as ae,
  Ae as af,
  _a as ag,
  gu as ah,
  Is as ai,
  lt as aj,
  Sa as ak,
  bc as al,
  Ps as am,
  Pt as an,
  Qu as ao,
  As as ap,
  Es as aq,
  Ts as ar,
  Ns as as,
  Ls as at,
  $s as au,
  Me as av,
  Fu as aw,
  Bu as ax,
  xs as ay,
  Yu as az,
  qu as b,
  au as b0,
  Ve as b1,
  ru as b2,
  ur as b3,
  oi as b4,
  ni as b5,
  Wu as b6,
  wc as b7,
  Ku as b8,
  Ul as b9,
  ts as ba,
  ql as bb,
  Yl as c,
  Zl as d,
  ws as e,
  wu as f,
  ka as g,
  xu as h,
  es as i,
  bn as j,
  ku as k,
  nu as l,
  Ha as m,
  Xa as n,
  At as o,
  Zo as p,
  Du as q,
  _s as r,
  rc as s,
  Xl as t,
  Ka as u,
  tu as v,
  bu as w,
  In as x,
  $t as y,
  Pu as z
};
