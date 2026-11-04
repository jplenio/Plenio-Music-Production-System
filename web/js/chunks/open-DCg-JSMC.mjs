import { d as Ct, m as Be, a as Un, i as w, c as S, b as p, t as P, F as ae, r as ge, n as Ie, j as oe, e as G, g as _, h as E, o as os, u as O, w as Ae, v as rt, p as nt, f as Fe, q as Rt, s as ri, x as $s, y as Zi, z as Xt, A as lt, B as Qi, C as co, D as Qt, E as sp, G as Hn, H as Vn, I as op, k as rp, l as lp } from "./dialog-CWp4TyLz.mjs";
import { a as ap, P as nh, b as up, t as cp, c as hp, T as No, d as dp, s as Ks, f as fp, e as pp, g as mp, h as gp, j as vp, k as yp, m as bp, n as kp, o as Ja, q as wp, r as xp, I as ih, u as Yo, w as Sp, x as Cp, y as Mp, z as Ap, A as Tp, B as $p, R as Dp, C as Lp, S as Bp, D as Op, N as Ep, E as Rp, F as jt, v as Ip, G as Vo, H as Za, J as Pp, K as Qa, L as Np, M as Vp, O as Hp, Q as zp, U as Wp, V as eu, W as Fp, X as _p, Y as Kp, Z as Wr, _ as tu, $ as nu, a0 as Up, a1 as iu, a2 as Gp, a3 as jp, a4 as qp, a5 as su, a6 as ou, a7 as ru, a8 as Fr, a9 as Yp, aa as Xp } from "./main-B3A_RH5l.mjs";
import { a as Jp, r as Zp, n as Qp, e as _r, b as em, s as tm, p as nm } from "./notationExport-DkCMgjck.mjs";
import { lineKey as ji, fitLyricGesture as im, newLineAt as sm, parseSpans as ha, editRange as ho, sameSpans as Ho, settle as om, placedLines as lu, withBlockSpans as rm, parseLineKey as lm, clipOfLines as au, partAt as am, overlap as um, laneLines as cm, remapSpans as hm, followSpans as dm } from "./lyricPlacement-ikJRWSGi.mjs";
import { SHIFTABLE as Jn, shiftBlock as Ds, notesLabel as fm, trackRows as pm, parseGuide as mm, sameGuide as Ls, guideNotes as gm, remapGuide as vm } from "./tracks-ClAVjvds.mjs";
const uu = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Interlude", "Instrumental", "Outro"], ym = ["Post-Chorus", "Hook", "Refrain", "Solo", "Break", "Breakdown", "Drop", "Build"], bm = /* @__PURE__ */ new Set(["intro", "interlude", "instrumental", "solo", "break", "outro"]), gl = 30, sh = 40;
function oh(i) {
  return i.replace(/[[\]\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, sh).trim() || null;
}
function km(i, e = []) {
  if (!Array.isArray(i)) return [];
  const t = new Set(e.map((s) => s.toLowerCase())), n = [];
  for (const s of i) {
    const o = typeof s == "string" ? oh(s) : null;
    if (!(!o || t.has(o.toLowerCase())) && (t.add(o.toLowerCase()), n.push(o), n.length === gl))
      break;
  }
  return n;
}
function Kr(i, e) {
  const t = bm.has(i.toLowerCase());
  return e ? `Insert [${i}] at the cursor - a section YuE2 learned (${t ? "usually without words - an instrumental part" : "sung: its words beneath it"})` : `Insert [${i}] at the cursor - ${t ? "without words: an instrumental part" : "with words it is sung on a related section's melody, without words it is an instrumental part"}`;
}
function wm(i, e, t = i.length) {
  const n = Math.max(0, Math.min(t, i.length));
  let s = i.slice(0, n), o = i.slice(n);
  s && !s.endsWith(`
`) && (s = s.replace(/[ \t]+$/, "") + `
`, o = o.replace(/^[ \t]+/, ""));
  const r = s.split(`
`), a = (r.length >= 2 ? r[r.length - 2] : "").trim() ? `
` : "", u = `[${e}]`, c = s.length + a.length + u.length + 1;
  return { text: `${s}${a}${u}${o.startsWith(`
`) ? "" : `
`}${o}`, caret: c };
}
const Us = `
`;
function cu(i) {
  const e = [];
  return i.replace(/\r\n?/g, `
`).split(`
`).forEach((t, n) => {
    n > 0 && e.push(Us), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function xm(i, e) {
  const t = cu(i), n = cu(e), s = t.length + 1, o = n.length + 1, r = new Array(s * o).fill(0);
  for (let d = t.length - 1; d >= 0; d--)
    for (let h = n.length - 1; h >= 0; h--)
      r[d * o + h] = t[d] === n[h] ? r[(d + 1) * o + h + 1] + 1 : Math.max(r[(d + 1) * o + h], r[d * o + h + 1]);
  const l = [], a = (d, h) => {
    const f = l[l.length - 1];
    f && f.op === d && h !== Us && !f.text.endsWith(Us) ? f.text += ` ${h}` : l.push({ op: d, text: h });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < n.length; )
    u < t.length && c < n.length && t[u] === n[c] ? (a("same", t[u]), u++, c++) : c < n.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", n[c++]) : a("removed", t[u++]);
  return l;
}
function Sm(i) {
  return i.filter((e) => e.op !== "same" && e.text !== Us).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const Cm = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, Mm = {
  key: 0,
  class: "error"
}, Am = { key: 1 }, Tm = {
  key: 0,
  class: "bad"
}, rh = /* @__PURE__ */ Ct({
  __name: "LyricsFit",
  props: {
    lyrics: {},
    abc: {},
    fetcher: {},
    engine: {},
    instrumental: { type: Boolean }
  },
  setup(i) {
    const e = i, t = _(null), n = _(null);
    let s, o = 0;
    async function r() {
      const a = ++o;
      try {
        const u = await ap(e.fetcher, {
          lyrics: e.lyrics,
          abc: e.abc ?? void 0,
          engine: e.engine,
          instrumental: e.instrumental
        });
        a === o && (t.value = u, n.value = null);
      } catch (u) {
        a === o && (n.value = u instanceof Error ? u.message : String(u));
      }
    }
    Be(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), Un(() => clearTimeout(s));
    const l = E(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", d = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: d };
      })
    );
    return (a, u) => i.abc ? (w(), S("section", Cm, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      n.value ? (w(), S("p", Mm, P(n.value), 1)) : l.value.length ? (w(), S("table", Am, [
        u[0] || (u[0] = p("thead", null, [
          p("tr", null, [
            p("th", null, "Lyrics"),
            p("th", null, "Score section"),
            p("th", null, "Lines"),
            p("th", null, "Syllables"),
            p("th", null, "Vocal notes"),
            p("th", null, "Fit")
          ])
        ], -1)),
        p("tbody", null, [
          (w(!0), S(ae, null, ge(l.value, (c, d) => (w(), S("tr", {
            key: d,
            class: Ie({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + P(c.tag) + "]", 1),
            p("td", null, [
              oe(P(c.score_section ?? "—"), 1),
              c.mismatch ? (w(), S("span", Tm, " ≠")) : G("", !0)
            ]),
            p("td", null, P(c.lines), 1),
            p("td", null, P(c.syllables), 1),
            p("td", null, P(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: Ie({ bad: c.fit && c.fit !== "fits" })
            }, P(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : G("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : G("", !0);
  }
});
function $m(i) {
  const e = new Set((i.elements ?? []).map((n) => n.id)), t = i.model?.tracks;
  if (t) for (const n of [...t.vocal, ...t.ins, ...t.chords]) e.add(n.id);
  return e;
}
function Dm(i, e) {
  const t = i?.model?.tracks, n = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = n.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
function Lm(i, e) {
  const t = i?.model?.tracks;
  return t ? [...t.vocal, ...t.ins].find((n) => n.segments.includes(e)) ?? null : null;
}
const Xo = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function Bm(i, e) {
  const t = Xo.indexOf(i);
  return t < 0 ? null : Xo[t + e] ?? null;
}
function Om(i, e) {
  return (e < 0 ? [...Xo].reverse().find((n) => n < i) : Xo.find((n) => n > i)) ?? null;
}
function vl(i, e, t) {
  if (!e || e.kind !== "note") return null;
  const n = Lm(i, e.id);
  if (n && n.segments.length > 1) {
    const o = Om(n.duration, t);
    return o ? { op: "resize_note", id: n.id, duration: o, mode: "rests" } : null;
  }
  const s = Bm(e.units, t);
  return s ? { op: "set_duration", id: e.id, units: s } : null;
}
function Em(i, e, t) {
  const n = i.elements ?? [], s = n.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of n) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function Rm(i, e) {
  const t = i.elements ?? [];
  return t.find((n) => n.source[0] <= e && e < n.source[1]) ?? t.find((n) => n.source[1] === e) ?? null;
}
function $i(i, e) {
  return !i || !e ? null : (i.elements ?? []).find((t) => t.id === e) ?? null;
}
function Im(i, e, t) {
  const n = $i(i, e);
  if (!n) return null;
  const s = (i.elements ?? []).filter((r) => r.voice === n.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function Pm(i, e) {
  const t = $i(i, e);
  if (!t) return null;
  const n = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (i.elements ?? []).find(
    (s) => s.voice === n && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function Nm(i, e, t = "Vocal") {
  return (i.elements ?? []).find((n) => n.bar === e && n.voice === t) ?? null;
}
function yl(i, e) {
  const t = i.sections.findIndex((n) => n.start_bar <= e && e < n.start_bar + n.bars);
  return t < 0 ? 0 : t;
}
const Vm = {
  1: "sixteenth",
  2: "eighth",
  3: "dotted eighth",
  4: "quarter",
  6: "dotted quarter",
  8: "half",
  12: "dotted half",
  16: "whole",
  24: "dotted whole",
  32: "two whole notes",
  48: "three whole notes"
};
function Hm(i, e = "1/16") {
  if (!i) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), n = Vm[i.units * t] ?? `${i.units} units`, s = i.kind === "note" ? `${i.name}${i.tie_out ? " (tied)" : ""}` : "rest", o = i.chord ? `, chord ${i.chord}` : "";
  return `${i.voice} bar ${i.bar}: ${s}, ${i.kind === "bar_rest" ? "whole bar" : n}${o}`;
}
function zo(i) {
  const e = Math.max(0, i), t = Math.floor(e / 60), n = Math.floor(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
let bl = [], lh = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? lh : bl).push(t = t + i[e]);
})();
function zm(i) {
  if (i < 768) return !1;
  for (let e = 0, t = bl.length; ; ) {
    let n = e + t >> 1;
    if (i < bl[n]) t = n;
    else if (i >= lh[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function hu(i) {
  return i >= 127462 && i <= 127487;
}
const du = 8205;
function Wm(i, e, t = !0, n = !0) {
  return (t ? ah : Fm)(i, e, n);
}
function ah(i, e, t) {
  if (e == i.length) return e;
  e && uh(i.charCodeAt(e)) && ch(i.charCodeAt(e - 1)) && e--;
  let n = Ur(i, e);
  for (e += fu(n); e < i.length; ) {
    let s = Ur(i, e);
    if (n == du || s == du || t && zm(s))
      e += fu(s), n = s;
    else if (hu(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && hu(Ur(i, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Fm(i, e, t) {
  for (; e > 1; ) {
    let n = ah(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Ur(i, e) {
  let t = i.charCodeAt(e);
  if (!ch(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return uh(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function uh(i) {
  return i >= 56320 && i < 57344;
}
function ch(i) {
  return i >= 55296 && i < 56320;
}
function fu(i) {
  return i < 65536 ? 1 : 2;
}
class Pe {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, n) {
    [e, t] = rs(this, e, t);
    let s = [];
    return this.decompose(
      0,
      e,
      s,
      2
      /* Open.To */
    ), n.length && n.decompose(
      0,
      n.length,
      s,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      s,
      1
      /* Open.From */
    ), Tn.from(s, this.length - (t - e) + n.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = rs(this, e, t);
    let n = [];
    return this.decompose(e, t, n, 0), Tn.from(n, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Ps(this), o = new Ps(e);
    for (let r = t, l = t; ; ) {
      if (s.next(r), o.next(r), r = 0, s.lineBreak != o.lineBreak || s.done != o.done || s.value != o.value)
        return !1;
      if (l += s.value.length, s.done || l >= n)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Ps(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new hh(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let n;
    if (e == null)
      n = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let s = this.line(e).from;
      n = this.iterRange(s, Math.max(s, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new dh(n);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? Pe.empty : e.length <= 32 ? new st(e) : Tn.from(st.split(e, []));
  }
}
class st extends Pe {
  constructor(e, t = _m(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, n, s) {
    for (let o = 0; ; o++) {
      let r = this.text[o], l = s + r.length;
      if ((t ? n : l) >= e)
        return new Km(s, l, n, r);
      s = l + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let o = e <= 0 && t >= this.length ? this : new st(pu(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = n.pop(), l = Wo(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        n.push(new st(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        n.push(new st(l.slice(0, a)), new st(l.slice(a)));
      }
    } else
      n.push(o);
  }
  replace(e, t, n) {
    if (!(n instanceof st))
      return super.replace(e, t, n);
    [e, t] = rs(this, e, t);
    let s = Wo(this.text, Wo(n.text, pu(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return s.length <= 32 ? new st(s, o) : Tn.from(st.split(s, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = rs(this, e, t);
    let s = "";
    for (let o = 0, r = 0; o <= t && r < this.text.length; r++) {
      let l = this.text[r], a = o + l.length;
      o > e && r && (s += n), e < a && t > o && (s += l.slice(Math.max(0, e - o), t - o)), o = a + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let n = [], s = -1;
    for (let o of e)
      n.push(o), s += o.length + 1, n.length == 32 && (t.push(new st(n, s)), n = [], s = -1);
    return s > -1 && t.push(new st(n, s)), t;
  }
}
class Tn extends Pe {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let n of e)
      this.lines += n.lines;
  }
  lineInner(e, t, n, s) {
    for (let o = 0; ; o++) {
      let r = this.children[o], l = s + r.length, a = n + r.lines - 1;
      if ((t ? a : l) >= e)
        return r.lineInner(e, t, n, s);
      s = l + 1, n = a + 1;
    }
  }
  decompose(e, t, n, s) {
    for (let o = 0, r = 0; r <= t && o < this.children.length; o++) {
      let l = this.children[o], a = r + l.length;
      if (e <= a && t >= r) {
        let u = s & ((r <= e ? 1 : 0) | (a >= t ? 2 : 0));
        r >= e && a <= t && !u ? n.push(l) : l.decompose(e - r, t - r, n, u);
      }
      r = a + 1;
    }
  }
  replace(e, t, n) {
    if ([e, t] = rs(this, e, t), n.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, n), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new Tn(c, this.length - (t - e) + n.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, n);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = rs(this, e, t);
    let s = "";
    for (let o = 0, r = 0; o < this.children.length && r <= t; o++) {
      let l = this.children[o], a = r + l.length;
      r > e && o && (s += n), e < a && t > r && (s += l.sliceString(e - r, t - r, n)), r = a + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof Tn))
      return 0;
    let n = 0, [s, o, r, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; s += t, o += t) {
      if (s == r || o == l)
        return n;
      let a = this.children[s], u = e.children[o];
      if (a != u)
        return n + a.scanIdentical(u, t);
      n += a.length + 1;
    }
  }
  static from(e, t = e.reduce((n, s) => n + s.length + 1, -1)) {
    let n = 0;
    for (let f of e)
      n += f.lines;
    if (n < 32) {
      let f = [];
      for (let m of e)
        m.flatten(f);
      return new st(f, t);
    }
    let s = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function d(f) {
      let m;
      if (f.lines > o && f instanceof Tn)
        for (let k of f.children)
          d(k);
      else f.lines > r && (a > r || !a) ? (h(), l.push(f)) : f instanceof st && a && (m = c[c.length - 1]) instanceof st && f.lines + m.lines <= 32 ? (a += f.lines, u += f.length + 1, c[c.length - 1] = new st(m.text.concat(f.text), m.length + 1 + f.length)) : (a + f.lines > s && h(), a += f.lines, u += f.length + 1, c.push(f));
    }
    function h() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Tn.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let f of e)
      d(f);
    return h(), l.length == 1 ? l[0] : new Tn(l, t);
  }
}
Pe.empty = /* @__PURE__ */ new st([""], 0);
function _m(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function Wo(i, e, t = 0, n = 1e9) {
  for (let s = 0, o = 0, r = !0; o < i.length && s <= n; o++) {
    let l = i[o], a = s + l.length;
    a >= t && (a > n && (l = l.slice(0, n - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function pu(i, e, t) {
  return Wo(i, [""], e, t);
}
class Ps {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof st ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, s = this.nodes[n], o = this.offsets[n], r = o >> 1, l = s instanceof st ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof st) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof st ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class hh {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Ps(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let n = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > n && (e = n), n -= e;
    let { value: s } = this.cursor.next(e);
    return this.pos += (s.length + e) * t, this.value = s.length <= n ? s : t < 0 ? s.slice(s.length - n) : s.slice(0, n), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class dh {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: n, value: s } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : n ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = s, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (Pe.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Ps.prototype[Symbol.iterator] = hh.prototype[Symbol.iterator] = dh.prototype[Symbol.iterator] = function() {
  return this;
});
class Km {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.number = n, this.text = s;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
function rs(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function xt(i, e, t = !0, n = !0) {
  return Wm(i, e, t, n);
}
function Um(i) {
  return i >= 56320 && i < 57344;
}
function Gm(i) {
  return i >= 55296 && i < 56320;
}
function jm(i, e) {
  let t = i.charCodeAt(e);
  if (!Gm(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return Um(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function qm(i) {
  return i < 65536 ? 1 : 2;
}
const kl = /\r\n?|\n/;
var It = /* @__PURE__ */ (function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
})(It || (It = {}));
class _n {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t + 1];
      e += n < 0 ? this.sections[t] : n;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, n = 0, s = 0; t < this.sections.length; ) {
      let o = this.sections[t++], r = this.sections[t++];
      r < 0 ? (e(n, s, o), s += o) : s += r, n += o;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    wl(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], s = this.sections[t++];
      s < 0 ? e.push(n, s) : e.push(s, n);
    }
    return new _n(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : fh(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : xl(this, e, t);
  }
  mapPos(e, t = -1, n = It.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (n != It.Simple && u >= e && (n == It.TrackDel && s < e && u > e || n == It.TrackBefore && s < e || n == It.TrackAfter && u > e))
          return null;
        if (u > e || u == e && t < 0 && !l)
          return e == s || t < 0 ? o : o + a;
        o += a;
      }
      s = u;
    }
    if (e > s)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${s}`);
    return o;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let n = 0, s = 0; n < this.sections.length && s <= t; ) {
      let o = this.sections[n++], r = this.sections[n++], l = s + o;
      if (r >= 0 && s <= t && l >= e)
        return s < e && l > t ? "cover" : !0;
      s = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], s = this.sections[t++];
      e += (e ? " " : "") + n + (s >= 0 ? ":" + s : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new _n(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new _n(e);
  }
}
class dt extends _n {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return wl(this, (t, n, s, o, r) => e = e.replace(s, s + (n - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return xl(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), n = [];
    for (let s = 0, o = 0; s < t.length; s += 2) {
      let r = t[s], l = t[s + 1];
      if (l >= 0) {
        t[s] = l, t[s + 1] = r;
        let a = s >> 1;
        for (; n.length < a; )
          n.push(Pe.empty);
        n.push(r ? e.slice(o, o + r) : Pe.empty);
      }
      o += r;
    }
    return new dt(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : fh(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : xl(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    wl(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return _n.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], o = new Gs(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        wt(s, c, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        wt(t, c, d), d > 0 && si(n, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        wt(t, c, -1), wt(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new dt(t, n),
      filtered: _n.create(s)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t], s = this.sections[t + 1];
      s < 0 ? e.push(n) : s == 0 ? e.push([n]) : e.push([n].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, n) {
    let s = [], o = [], r = 0, l = null;
    function a(c = !1) {
      if (!c && !s.length)
        return;
      r < t && wt(s, t - r, -1);
      let d = new dt(s, o);
      l = l ? l.compose(d.map(l)) : d, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let d of c)
          u(d);
      else if (c instanceof dt) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: d, to: h = d, insert: f } = c;
        if (d > h || d < 0 || h > t)
          throw new RangeError(`Invalid change range ${d} to ${h} (in doc of length ${t})`);
        let m = f ? typeof f == "string" ? Pe.of(f.split(n || kl)) : f : Pe.empty, k = m.length;
        if (d == h && k == 0)
          return;
        d < r && a(), d > r && wt(s, d - r, -1), wt(s, h - d, k), si(o, s, m), r = h;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new dt(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], n = [];
    for (let s = 0; s < e.length; s++) {
      let o = e[s];
      if (typeof o == "number")
        t.push(o, -1);
      else {
        if (!Array.isArray(o) || typeof o[0] != "number" || o.some((r, l) => l && typeof r != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (o.length == 1)
          t.push(o[0], 0);
        else {
          for (; n.length < s; )
            n.push(Pe.empty);
          n[s] = Pe.of(o.slice(1)), t.push(o[0], n[s].length);
        }
      }
    }
    return new dt(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new dt(e, t);
  }
}
function wt(i, e, t, n = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = i.length - 2;
  s >= 0 && t <= 0 && t == i[s + 1] ? i[s] += e : s >= 0 && e == 0 && i[s] == 0 ? i[s + 1] += t : n ? (i[s] += e, i[s + 1] += t) : i.push(e, t);
}
function si(i, e, t) {
  if (t.length == 0)
    return;
  let n = e.length - 2 >> 1;
  if (n < i.length)
    i[i.length - 1] = i[i.length - 1].append(t);
  else {
    for (; i.length < n; )
      i.push(Pe.empty);
    i.push(t);
  }
}
function wl(i, e, t) {
  let n = i.inserted;
  for (let s = 0, o = 0, r = 0; r < i.sections.length; ) {
    let l = i.sections[r++], a = i.sections[r++];
    if (a < 0)
      s += l, o += l;
    else {
      let u = s, c = o, d = Pe.empty;
      for (; u += l, c += a, a && n && (d = d.append(n[r - 2 >> 1])), !(t || r == i.sections.length || i.sections[r + 1] < 0); )
        l = i.sections[r++], a = i.sections[r++];
      e(s, u, o, c, d), s = u, o = c;
    }
  }
}
function xl(i, e, t, n = !1) {
  let s = [], o = n ? [] : null, r = new Gs(i), l = new Gs(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      wt(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (wt(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (wt(s, 0, r.ins), o && si(o, s, r.text), a = r.i), r.forward(c), u -= c;
      }
      l.next();
    } else if (r.ins >= 0) {
      let u = 0, c = r.len;
      for (; c; )
        if (l.ins == -1) {
          let d = Math.min(c, l.len);
          u += d, c -= d, l.forward(d);
        } else if (l.ins == 0 && l.len < c)
          c -= l.len, l.next();
        else
          break;
      wt(s, u, a < r.i ? r.ins : 0), o && a < r.i && si(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? dt.createSet(s, o) : _n.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function fh(i, e, t = !1) {
  let n = [], s = t ? [] : null, o = new Gs(i), r = new Gs(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? dt.createSet(n, s) : _n.create(n);
    if (o.ins == 0)
      wt(n, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      wt(n, 0, r.ins, l), s && si(s, n, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = n.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          wt(n, a, c, l), s && c && si(s, n, r.text);
        } else r.ins == -1 ? (wt(n, o.off ? 0 : o.len, a, l), s && si(s, n, o.textBit(a))) : (wt(n, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && si(s, n, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || n.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class Gs {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? Pe.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? Pe.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class ti {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.flags = n, this.goalColumn = s;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  A flag that, when set, makes some selection-extending commands
  treat the range's head and anchor as exchangeable, so that for
  example Shift-ArrowUp will make the lower side of the selection
  the anchor, even if that was the head before. Used to implement
  MacOS-style undirectional selections.
  */
  get undirectional() {
    return (this.flags & 64) > 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let n, s;
    return this.empty ? n = s = e.mapPos(this.from, t) : (n = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), n == this.from && s == this.to ? this : new ti(n, s, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, n = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return J.range(e, t, void 0, void 0, n);
    let s = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return J.range(this.anchor, s, void 0, void 0, n);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && this.goalColumn == e.goalColumn && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return J.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new ti(e, t, n, s);
  }
}
class J {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : J.create(this.ranges.map((n) => n.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let n = 0; n < this.ranges.length; n++)
      if (!this.ranges[n].eq(e.ranges[n], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new J([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return J.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let n = this.ranges.slice();
    return n[t] = e, J.create(n, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new J(e.ranges.map((t) => ti.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new J([J.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let n = 0, s = 0; s < e.length; s++) {
      let o = e[s];
      if (o.empty ? o.from <= n : o.from < n)
        return J.normalized(e.slice(), t);
      n = o.to;
    }
    return new J(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, n, s) {
    return ti.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (n == null ? 7 : Math.min(6, n)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, n, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? ti.create(t, e, r | 32, n) : ti.create(e, t, r, n);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return ti.create(e, t, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let n = e[t];
    e.sort((s, o) => s.from - o.from), t = e.indexOf(n);
    for (let s = 1; s < e.length; s++) {
      let o = e[s], r = e[s - 1];
      if (o.empty ? o.from <= r.to : o.from < r.to) {
        let l = r.from, a = Math.max(o.to, r.to);
        s <= t && t--, e.splice(--s, 2, o.anchor > o.head ? J.range(a, l) : J.range(l, a));
      }
    }
    return new J(e, t);
  }
}
function ph(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let da = 0;
class de {
  constructor(e, t, n, s, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = da++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new de(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : fa), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Fo([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Fo(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Fo(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function fa(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class Fo {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = da++;
  }
  dynamicSlot(e) {
    var t;
    let n = this.value, s = this.facet.compareInput, o = this.id, r = e[o] >> 1, l = this.type == 2, a = !1, u = !1, c = [];
    for (let d of this.dependencies)
      d == "doc" ? a = !0 : d == "selection" ? u = !0 : (((t = e[d.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && c.push(e[d.id]);
    return {
      create(d) {
        return d.values[r] = n(d), 1;
      },
      update(d, h) {
        if (a && h.docChanged || u && (h.docChanged || h.selection) || Sl(d, c)) {
          let f = n(d);
          if (l ? !mu(f, d.values[r], s) : !s(f, d.values[r]))
            return d.values[r] = f, 1;
        }
        return 0;
      },
      reconfigure: (d, h) => {
        let f, m = h.config.address[o];
        if (m != null) {
          let k = Zo(h, m);
          if (this.dependencies.every((b) => b instanceof de ? h.facet(b) === d.facet(b) : b instanceof dn ? h.field(b, !1) == d.field(b, !1) : !0) || (l ? mu(f = n(d), k, s) : s(f = n(d), k)))
            return d.values[r] = k, 0;
        } else
          f = n(d);
        return d.values[r] = f, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function mu(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function Sl(i, e) {
  let t = !1;
  for (let n of e)
    Ns(i, n) & 1 && (t = !0);
  return t;
}
function Ym(i, e, t) {
  let n = t.map((a) => i[a.id]), s = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), r = i[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < n.length; c++) {
      let d = Zo(a, n[c]);
      if (s[c] == 2)
        for (let h of d)
          u.push(h);
      else
        u.push(d);
    }
    return e.combine(u);
  }
  return {
    create(a) {
      for (let u of n)
        Ns(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!Sl(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = Sl(a, n), d = u.config.facets[e.id], h = u.facet(e);
      if (d && !c && fa(t, d))
        return a.values[r] = h, 0;
      let f = l(a);
      return e.compare(f, h) ? (a.values[r] = h, 0) : (a.values[r] = f, 1);
    }
  };
}
const fo = /* @__PURE__ */ de.define({ static: !0 });
class dn {
  constructor(e, t, n, s, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new dn(da++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(fo).find((n) => n.field == this);
    return (t?.create || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (n) => (n.values[t] = this.create(n), 1),
      update: (n, s) => {
        let o = n.values[t], r = this.updateF(o, s);
        return this.compareF(o, r) ? 0 : (n.values[t] = r, 1);
      },
      reconfigure: (n, s) => {
        let o = n.facet(fo), r = s.facet(fo), l;
        return (l = o.find((a) => a.field == this)) && l != r.find((a) => a.field == this) ? (n.values[t] = l.create(n), 1) : s.config.address[this.id] != null ? (n.values[t] = s.field(this), 0) : (n.values[t] = this.create(n), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, fo.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const Ci = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function xs(i) {
  return (e) => new mh(e, i);
}
const br = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ xs(Ci.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ xs(Ci.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ xs(Ci.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ xs(Ci.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ xs(Ci.lowest)
};
class mh {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class kr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new Cl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return kr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Cl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Jo {
  constructor(e, t, n, s, o, r) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = n, this.address = s, this.staticValues = o, this.facets = r, this.statusTemplate = []; this.statusTemplate.length < n.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, n) {
    let s = [], o = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ new Map();
    for (let h of Xm(e, t, r))
      h instanceof dn ? s.push(h) : (o[h.facet.id] || (o[h.facet.id] = [])).push(h);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let h of s)
      l[h.id] = u.length << 1, u.push((f) => h.slot(f));
    let c = n?.config.facets;
    for (let h in o) {
      let f = o[h], m = f[0].facet, k = c && c[h] || [];
      if (f.every(
        (b) => b.type == 0
        /* Provider.Static */
      ))
        if (l[m.id] = a.length << 1 | 1, fa(k, f))
          a.push(n.facet(m));
        else {
          let b = m.combine(f.map((M) => M.value));
          a.push(n && m.compare(b, n.facet(m)) ? n.facet(m) : b);
        }
      else {
        for (let b of f)
          b.type == 0 ? (l[b.id] = a.length << 1 | 1, a.push(b.value)) : (l[b.id] = u.length << 1, u.push((M) => b.dynamicSlot(M)));
        l[m.id] = u.length << 1, u.push((b) => Ym(b, m, f));
      }
    }
    let d = u.map((h) => h(l));
    return new Jo(e, r, d, l, a, o);
  }
}
function Xm(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = n[a].indexOf(r);
      u > -1 && n[a].splice(u, 1), r instanceof Cl && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof Cl) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof mh)
      o(r.inner, r.prec);
    else if (r instanceof dn)
      n[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof Fo)
      n[l].push(r), r.facet.extensions && o(r.facet.extensions, Ci.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(i, Ci.default), n.reduce((r, l) => r.concat(l));
}
function Ns(i, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, n = i.status[t];
  if (n == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (n & 2)
    return n;
  i.status[t] = 4;
  let s = i.computeSlot(i, i.config.dynamicSlots[t]);
  return i.status[t] = 2 | s;
}
function Zo(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const gh = /* @__PURE__ */ de.define(), Ml = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), vh = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), yh = /* @__PURE__ */ de.define(), bh = /* @__PURE__ */ de.define(), kh = /* @__PURE__ */ de.define(), wh = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : !1
});
class ys {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new Jm();
  }
}
class Jm {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new ys(this, e);
  }
}
class Zm {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new qe(this, e);
  }
}
class qe {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new qe(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new Zm(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let n = [];
    for (let s of e) {
      let o = s.map(t);
      o && n.push(o);
    }
    return n;
  }
}
qe.reconfigure = /* @__PURE__ */ qe.define();
qe.appendConfig = /* @__PURE__ */ qe.define();
class St {
  constructor(e, t, n, s, o, r) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, n && ph(n, t.newLength), o.some((l) => l.type == St.time) || (this.annotations = o.concat(St.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, s, o, r) {
    return new St(e, t, n, s, o, r);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(St.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
St.time = /* @__PURE__ */ ys.define();
St.userEvent = /* @__PURE__ */ ys.define();
St.addToHistory = /* @__PURE__ */ ys.define();
St.remote = /* @__PURE__ */ ys.define();
function Qm(i, e) {
  let t = [];
  for (let n = 0, s = 0; ; ) {
    let o, r;
    if (n < i.length && (s == e.length || e[s] >= i[n]))
      o = i[n++], r = i[n++];
    else if (s < e.length)
      o = e[s++], r = e[s++];
    else
      return t;
    !t.length || t[t.length - 1] < o ? t.push(o, r) : t[t.length - 1] < r && (t[t.length - 1] = r);
  }
}
function xh(i, e, t) {
  var n;
  let s, o, r;
  return t ? (s = e.changes, o = dt.empty(e.changes.length), r = i.changes.compose(e.changes)) : (s = e.changes.map(i.changes), o = i.changes.mapDesc(e.changes, !0), r = i.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (n = i.selection) === null || n === void 0 ? void 0 : n.map(s),
    effects: qe.mapEffects(i.effects, s).concat(qe.mapEffects(e.effects, o)),
    annotations: i.annotations.length ? i.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: i.scrollIntoView || e.scrollIntoView
  };
}
function Al(i, e, t) {
  let n = e.selection, s = es(e.annotations);
  return e.userEvent && (s = s.concat(St.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof dt ? e.changes : dt.of(e.changes || [], t, i.facet(vh)),
    selection: n && (n instanceof J ? n : J.single(n.anchor, n.head)),
    effects: es(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Sh(i, e, t) {
  let n = Al(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    n = xh(n, Al(i, e[o], r ? n.changes.newLength : i.doc.length), r);
  }
  let s = St.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return tg(t ? eg(s) : s);
}
function eg(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(yh)) {
    let o = s(i);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : Qm(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = i.changes.invertedDesc, s = dt.empty(e.doc.length);
    else {
      let r = i.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    i = St.create(e, s, i.selection && i.selection.map(o), qe.mapEffects(i.effects, o), i.annotations, i.scrollIntoView);
  }
  let n = e.facet(bh);
  for (let s = n.length - 1; s >= 0; s--) {
    let o = n[s](i);
    o instanceof St ? i = o : Array.isArray(o) && o.length == 1 && o[0] instanceof St ? i = o[0] : i = Sh(e, es(o), !1);
  }
  return i;
}
function tg(i) {
  let e = i.startState, t = e.facet(kh), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](i);
    o && Object.keys(o).length && (n = xh(n, Al(e, o, i.changes.newLength), !0));
  }
  return n == i ? i : St.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const ng = [];
function es(i) {
  return i == null ? ng : Array.isArray(i) ? i : [i];
}
var Fn = /* @__PURE__ */ (function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
})(Fn || (Fn = {}));
const ig = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Tl;
try {
  Tl = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function sg(i) {
  if (Tl)
    return Tl.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || ig.test(t)))
      return !0;
  }
  return !1;
}
function og(i) {
  return (e) => {
    if (!/\S/.test(e))
      return Fn.Space;
    if (sg(e))
      return Fn.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return Fn.Word;
    return Fn.Other;
  };
}
class ze {
  constructor(e, t, n, s, o, r) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Ns(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Ns(this, n), Zo(this, n);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return Sh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let l of e.effects)
      l.is(kr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(qe.reconfigure) ? (t = null, n = l.value) : l.is(qe.appendConfig) && (t = null, n = es(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Jo.resolve(n, s, this), o = new ze(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(Ml) ? e.newSelection : e.newSelection.asSingle();
    new ze(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: J.cursor(t.from + e.length, -1)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), o = [n.range], r = es(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let h = 0; h < l; h++)
        o[h] = o[h].map(c);
      let d = s.mapDesc(u, !0);
      o.push(a.range.map(d)), s = s.compose(c), r = qe.mapEffects(r, c).concat(qe.mapEffects(es(a.effects), d));
    }
    return {
      changes: s,
      selection: J.create(o, t.mainIndex),
      effects: r
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof dt ? e : dt.of(e, this.doc.length, this.facet(ze.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return Pe.of(e.split(this.facet(ze.lineSeparator) || kl));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (Ns(this, t), Zo(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let n in e) {
        let s = e[n];
        s instanceof dn && this.config.address[s.id] != null && (t[n] = s.spec.toJSON(this.field(e[n]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, n) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let s = [];
    if (n) {
      for (let o in n)
        if (Object.prototype.hasOwnProperty.call(e, o)) {
          let r = n[o], l = e[o];
          s.push(r.init((a) => r.spec.fromJSON(l, a)));
        }
    }
    return ze.create({
      doc: e.doc,
      selection: J.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Jo.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof Pe ? e.doc : Pe.of((e.doc || "").split(t.staticFacet(ze.lineSeparator) || kl)), s = e.selection ? e.selection instanceof J ? e.selection : J.single(e.selection.anchor, e.selection.head) : J.single(0);
    return ph(s, n.length), t.staticFacet(Ml) || (s = s.asSingle()), new ze(t, n, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(ze.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(ze.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(wh);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let n of this.facet(ze.phrases))
      if (Object.prototype.hasOwnProperty.call(n, e)) {
        e = n[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (n, s) => {
      if (s == "$")
        return "$";
      let o = +(s || 1);
      return !o || o > t.length ? n : t[o - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, n = -1) {
    let s = [];
    for (let o of this.facet(gh))
      for (let r of o(this, t, n))
        Object.prototype.hasOwnProperty.call(r, e) && s.push(r[e]);
    return s;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    let t = this.languageDataAt("wordChars", e);
    return og(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: n, length: s } = this.doc.lineAt(e), o = this.charCategorizer(e), r = e - n, l = e - n;
    for (; r > 0; ) {
      let a = xt(t, r, !1);
      if (o(t.slice(a, r)) != Fn.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = xt(t, l);
      if (o(t.slice(l, a)) != Fn.Word)
        break;
      l = a;
    }
    return r == l ? null : J.range(r + n, l + n);
  }
}
ze.allowMultipleSelections = Ml;
ze.tabSize = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : 4
});
ze.lineSeparator = vh;
ze.readOnly = wh;
ze.phrases = /* @__PURE__ */ de.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
ze.languageData = gh;
ze.changeFilter = yh;
ze.transactionFilter = bh;
ze.transactionExtender = kh;
kr.reconfigure = /* @__PURE__ */ qe.define();
function wr(i, e, t = {}) {
  let n = {};
  for (let s of i)
    for (let o of Object.keys(s)) {
      let r = s[o], l = n[o];
      if (l === void 0)
        n[o] = r;
      else if (!(l === r || r === void 0)) if (Object.hasOwnProperty.call(t, o))
        n[o] = t[o](l, r);
      else
        throw new Error("Config merge conflict for field " + o);
    }
  for (let s in e)
    n[s] === void 0 && (n[s] = e[s]);
  return n;
}
class Oi {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return $l.create(e, t, this);
  }
}
Oi.prototype.startSide = Oi.prototype.endSide = 0;
Oi.prototype.point = !1;
Oi.prototype.mapMode = It.TrackDel;
function pa(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let $l = class Ch {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Ch(e, t, n);
  }
};
function Dl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class ma {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return Ui(this.to);
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, n, s = 0) {
    let o = n ? this.to : this.from;
    for (let r = s, l = o.length; ; ) {
      if (r == l)
        return r;
      let a = r + l >> 1, u = o[a] - e || (n ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == r)
        return u >= 0 ? r : l;
      u >= 0 ? l = a : r = a + 1;
    }
  }
  between(e, t, n, s) {
    for (let o = this.findIndex(t, -1e9, !0), r = this.findIndex(n, 1e9, !1, o); o < r; o++)
      if (s(this.from[o] + e, this.to[o] + e, this.value[o]) === !1)
        return !1;
  }
  map(e, t, n, s, o) {
    let r = [], l = [], a = [], u = -1, c = -1;
    e: for (let d = 0; d < this.value.length; d++) {
      let h = this.value[d], f = this.from[d] + e, m = this.to[d] + e, k, b;
      if (f == m) {
        let M = t.mapPos(f, h.startSide, h.mapMode);
        if (M == null || (k = b = M, h.startSide != h.endSide && (b = t.mapPos(f, h.endSide), b < k)))
          continue;
      } else if (k = t.mapPos(f, h.startSide), b = t.mapPos(m, h.endSide), k > b || k == b && h.startSide > 0 && h.endSide <= 0)
        continue;
      if (!((b - k || h.endSide - h.startSide) < 0))
        if (u < 0 && (u = k), h.point && (c = Math.max(c, b - k)), (k - n || h.startSide - s) >= 0)
          r.push(h), l.push(k - u), a.push(b - u), n = b, s = h.endSide;
        else {
          if (k == b)
            for (let M = r.length; M > 0; M--) {
              if ((k - (a[M - 1] + u) || h.startSide - r[M - 1].endSide) >= 0) {
                r.splice(M, 0, h), l.splice(M, 0, k - u), a.splice(M, 0, b - u);
                continue e;
              }
              if ((k - (l[M - 1] + u) || h.endSide - r[M - 1].startSide) > 0)
                break;
            }
          o(k, b, h);
        }
    }
    return { mapped: r.length ? new ma(l, a, r, c) : null, pos: u };
  }
}
class Oe {
  constructor(e, t, n, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new Oe(e, t, n, s);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: n = !1, filterFrom: s = 0, filterTo: o = this.length } = e, r = e.filter;
    if (t.length == 0 && !r)
      return this;
    if (n && (t = t.slice().sort(Dl)), this.isEmpty)
      return t.length ? Oe.of(t) : this;
    let l = new Mh(this, null, -1).goto(0), a = 0, u = [], c = new Di();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        c.addInner(d.from, d.to, d.value, !1) || u.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push($l.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Oe.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], s = -1, o, r = (a, u, c) => {
      o || (o = new Di()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], d = e.touchesRange(u, u + c.length);
      if (d === !1)
        s = Math.max(s, c.maxPoint), t.push(c), n.push(e.mapPos(u));
      else if (d === !0) {
        let [h, f] = t.length ? [Ui(n) + Ui(t).length, Ui(Ui(t).value).endSide] : [-1, -1], { mapped: m, pos: k } = c.map(u, e, h, f, r);
        m && (s = Math.max(s, m.maxPoint), t.push(m), n.push(k));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Oe(n, t, l || Oe.empty, s);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, n) {
    if (!this.isEmpty) {
      for (let s = 0; s < this.chunk.length; s++) {
        let o = this.chunkPos[s], r = this.chunk[s];
        if (t >= o && e <= o + r.length && r.between(o, e - o, t - o, n) === !1)
          return;
      }
      this.nextLayer.between(e, t, n);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return js.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return js.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, o = -1) {
    let r = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = gu(r, l, n), u = new Ss(r, a, o), c = new Ss(l, a, o);
    n.iterGaps((d, h, f) => vu(u, d, c, h, f, s)), n.empty && n.length == 0 && vu(u, 0, c, 0, 0, s);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, n = 0, s) {
    s == null && (s = 999999999);
    let o = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), r = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (o.length != r.length)
      return !1;
    if (!o.length)
      return !0;
    let l = gu(o, r), a = new Ss(o, l, 0).goto(n), u = new Ss(r, l, 0).goto(n);
    for (; ; ) {
      if (a.to != u.to || !Ll(a.active, u.active) || a.point && (!u.point || !pa(a.point, u.point)))
        return !1;
      if (a.to > s)
        return !0;
      a.next(), u.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, n, s, o = -1) {
    let r = new Ss(e, null, o).goto(t), l = t, a = r.openStart;
    for (; ; ) {
      let u = Math.min(r.to, n);
      if (r.point) {
        let c = r.activeForPoint(r.to), d = r.pointFrom < t ? c.length + 1 : r.point.startSide < 0 ? c.length : Math.min(c.length, a);
        s.point(l, u, r.point, c, d, r.pointRank), a = Math.min(r.openEnd(u), c.length);
      } else u > l && (s.span(l, u, r.active, a), a = r.openEnd(u));
      if (r.to > n)
        return a + (r.point && r.to > n ? 1 : 0);
      l = r.to, r.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let n = new Di();
    for (let s of e instanceof $l ? [e] : t ? rg(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Oe.empty;
    let t = Ui(e);
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != Oe.empty; s = s.nextLayer)
        t = new Oe(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Oe.empty = /* @__PURE__ */ new Oe([], [], null, -1);
function Ui(i) {
  return i[i.length - 1];
}
function rg(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (Dl(e, n) > 0)
        return i.slice().sort(Dl);
      e = n;
    }
  return i;
}
Oe.empty.nextLayer = Oe.empty;
class Di {
  finishChunk(e) {
    this.chunks.push(new ma(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, n) {
    this.addRange(e, t, n, !0);
  }
  /**
  @internal
  */
  addRange(e, t, n, s) {
    this.addInner(e, t, n, s) || (this.nextLayer || (this.nextLayer = new Di())).addRange(e, t, n, s);
  }
  /**
  @internal
  */
  addInner(e, t, n, s) {
    let o = e - this.lastTo || n.startSide - this.last.endSide;
    if (s && o <= 0 && (e - this.lastFrom || n.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return o < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = n, this.lastFrom = e, this.lastTo = t, this.value.push(n), n.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let n = t.value.length - 1;
    return this.last = t.value[n], this.lastFrom = t.from[n] + e, this.lastTo = t.to[n] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(Oe.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Oe.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function gu(i, e, t) {
  let n = /* @__PURE__ */ new Map();
  for (let o of i)
    for (let r = 0; r < o.chunk.length; r++)
      o.chunk[r].maxPoint <= 0 && n.set(o.chunk[r], o.chunkPos[r]);
  let s = /* @__PURE__ */ new Set();
  for (let o of e)
    for (let r = 0; r < o.chunk.length; r++) {
      let l = n.get(o.chunk[r]);
      l != null && (t ? t.mapPos(l) : l) == o.chunkPos[r] && !t?.touchesRange(l, l + o.chunk[r].length) && s.add(o.chunk[r]);
    }
  return s;
}
class Mh {
  constructor(e, t, n, s = 0) {
    this.layer = e, this.skip = t, this.minPoint = n, this.rank = s;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, n) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let s = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(s) || this.layer.chunkEnd(this.chunkIndex) < e || s.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, n = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let s = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!n || this.rangeIndex < s) && this.setRangeIndex(s);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], n = e + t.from[this.rangeIndex];
        if (this.from = n, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class js {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= n && s.push(new Mh(r, t, n, o));
    return s.length == 1 ? s[0] : new js(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Gr(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Gr(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Gr(this.heap, 0);
    }
  }
}
function Gr(i, e) {
  for (let t = i[e]; ; ) {
    let n = (e << 1) + 1;
    if (n >= i.length)
      break;
    let s = i[n];
    if (n + 1 < i.length && s.compare(i[n + 1]) >= 0 && (s = i[n + 1], n++), t.compare(s) < 0)
      break;
    i[n] = t, i[e] = s, e = n;
  }
}
class Ss {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = js.from(e, t, n);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    po(this.active, e), po(this.activeTo, e), po(this.activeRank, e), this.minActive = yu(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    mo(this.active, t, n), mo(this.activeTo, t, s), mo(this.activeRank, t, o), e && mo(e, t, this.cursor.from), this.minActive = yu(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let n = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let s = this.minActive;
      if (s > -1 && (this.activeTo[s] - this.cursor.from || this.active[s].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[s] > e) {
          this.to = this.activeTo[s], this.endSide = this.active[s].endSide;
          break;
        }
        this.removeActive(s), n && po(n, s);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let o = this.cursor.value;
          if (!o.point)
            this.addActive(n), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = o, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = o.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (n) {
      this.openStart = 0;
      for (let s = n.length - 1; s >= 0 && n[s] < e; s--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let n = this.active.length - 1; n >= 0 && !(this.activeRank[n] < this.pointRank); n--)
      (this.activeTo[n] > e || this.activeTo[n] == e && this.active[n].endSide >= this.point.endSide) && t.push(this.active[n]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let n = this.activeTo.length - 1; n >= 0 && this.activeTo[n] > e; n--)
      t++;
    return t;
  }
}
function vu(i, e, t, n, s, o) {
  i.goto(e), t.goto(n);
  let r = n + s, l = n, a = n - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let d = i.to + a - t.to, h = d || i.endSide - t.endSide, f = h < 0 ? i.to + a : t.to, m = Math.min(f, r);
    if (i.point || t.point ? (i.point && t.point && pa(i.point, t.point) && Ll(i.activeForPoint(i.to), t.activeForPoint(t.to)) || o.comparePoint(l, m, i.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), m > l && !Ll(i.active, t.active) && o.compareRange(l, m, i.active, t.active), u && m < r && (d || i.openEnd(f) != t.openEnd(f)) && (c = !0)), f > r)
      break;
    l = f, h <= 0 && i.next(), h >= 0 && t.next();
  }
}
function Ll(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !pa(i[t], e[t]))
      return !1;
  return !0;
}
function po(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function mo(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function yu(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function xr(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = xt(i, s));
  return n;
}
function lg(i, e, t, n) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == i.length)
      break;
    o += i.charCodeAt(s) == 9 ? t - o % t : 1, s = xt(i, s);
  }
  return i.length;
}
const Bl = "ͼ", bu = typeof Symbol > "u" ? "__" + Bl : Symbol.for(Bl), Ol = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), ku = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class li {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: n } = t || {};
    function s(r) {
      return /^@/.test(r) ? [r] : r.split(/,\s*/);
    }
    function o(r, l, a, u) {
      let c = [], d = /^@(\w+)\b/.exec(r[0]), h = d && d[1] == "keyframes";
      if (d && l == null) return a.push(r[0] + ";");
      for (let f in l) {
        let m = l[f];
        if (/&/.test(f))
          o(
            f.split(/,\s*/).map((k) => r.map((b) => k.replace(/&/, b))).reduce((k, b) => k.concat(b)),
            m,
            a
          );
        else if (m && typeof m == "object") {
          if (!d) throw new RangeError("The value of a property (" + f + ") should be a primitive value.");
          o(s(f), m, c, h);
        } else m != null && c.push(f.replace(/_.*/, "").replace(/[A-Z]/g, (k) => "-" + k.toLowerCase()) + ": " + m + ";");
      }
      (c.length || h) && a.push((n && !d && !u ? r.map(n) : r).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let r in e) o(s(r), e[r], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = ku[bu] || 1;
    return ku[bu] = e + 1, Bl + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, n) {
    let s = e[Ol], o = n && n.nonce;
    s ? o && s.setNonce(o) : s = new ag(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let wu = /* @__PURE__ */ new Map();
class ag {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = wu.get(n);
      if (o) return e[Ol] = o;
      this.sheet = new s.CSSStyleSheet(), wu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Ol] = this;
  }
  mount(e, t) {
    let n = this.sheet, s = 0, o = 0, r = !1;
    for (let l = 0; l < e.length; l++) {
      let a = e[l], u = this.modules.indexOf(a);
      if (u < o && u > -1 && (this.modules.splice(u, 1), r = !0, o--, u = -1), u == -1) {
        if (this.modules.splice(o++, 0, a), r = !0, n) for (let c = 0; c < a.rules.length; c++)
          n.insertRule(a.rules[c], s++);
      } else {
        for (; o < u; ) s += this.modules[o++].rules.length;
        s += a.rules.length, o++;
      }
    }
    if (n)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      if (r) {
        let a = "";
        for (let u = 0; u < this.modules.length; u++)
          a += this.modules[u].getRules() + `
`;
        this.styleTag.textContent = a;
      }
      let l = t.head || t;
      this.styleTag.parentNode != l && l.insertBefore(this.styleTag, l.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var ai = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, qs = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, ug = typeof navigator < "u" && /Mac/.test(navigator.platform), cg = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var vt = 0; vt < 10; vt++) ai[48 + vt] = ai[96 + vt] = String(vt);
for (var vt = 1; vt <= 24; vt++) ai[vt + 111] = "F" + vt;
for (var vt = 65; vt <= 90; vt++)
  ai[vt] = String.fromCharCode(vt + 32), qs[vt] = String.fromCharCode(vt);
for (var jr in ai) qs.hasOwnProperty(jr) || (qs[jr] = ai[jr]);
function hg(i) {
  var e = ug && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || cg && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? qs : ai)[i.keyCode] || i.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function $n() {
  var i = arguments[0];
  typeof i == "string" && (i = document.createElement(i));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var n in t) if (Object.prototype.hasOwnProperty.call(t, n)) {
      var s = t[n];
      typeof s == "string" ? i.setAttribute(n, s) : s != null && (i[n] = s);
    }
    e++;
  }
  for (; e < arguments.length; e++) Ah(i, arguments[e]);
  return i;
}
function Ah(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) Ah(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let $t = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, El = typeof document < "u" ? document : { documentElement: { style: {} } };
const Rl = /* @__PURE__ */ /Edge\/(\d+)/.exec($t.userAgent), Th = /* @__PURE__ */ /MSIE \d/.test($t.userAgent), Il = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec($t.userAgent), Sr = !!(Th || Il || Rl), xu = !Sr && /* @__PURE__ */ /gecko\/(\d+)/i.test($t.userAgent), qr = !Sr && /* @__PURE__ */ /Chrome\/(\d+)/.exec($t.userAgent), Su = "webkitFontSmoothing" in El.documentElement.style, Pl = !Sr && /* @__PURE__ */ /Apple Computer/.test($t.vendor), Cu = Pl && (/* @__PURE__ */ /Mobile\/\w+/.test($t.userAgent) || $t.maxTouchPoints > 2);
var se = {
  mac: Cu || /* @__PURE__ */ /Mac/.test($t.platform),
  windows: /* @__PURE__ */ /Win/.test($t.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test($t.platform),
  ie: Sr,
  ie_version: Th ? El.documentMode || 6 : Il ? +Il[1] : Rl ? +Rl[1] : 0,
  gecko: xu,
  gecko_version: xu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec($t.userAgent) || [0, 0])[1] : 0,
  chrome: !!qr,
  chrome_version: qr ? +qr[1] : 0,
  ios: Cu,
  android: /* @__PURE__ */ /Android\b/.test($t.userAgent),
  webkit: Su,
  webkit_version: Su ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec($t.userAgent) || [0, 0])[1] : 0,
  safari: Pl,
  safari_version: Pl ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec($t.userAgent) || [0, 0])[1] : 0,
  tabSize: El.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function ga(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const Qo = /* @__PURE__ */ Object.create(null);
function va(i, e, t) {
  if (i == e)
    return !0;
  i || (i = Qo), e || (e = Qo);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (s.indexOf(o) == -1 || i[o] !== e[o]))
      return !1;
  return !0;
}
function dg(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function Mu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function fg(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class io {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t, n) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, n) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var yt = /* @__PURE__ */ (function(i) {
  return i[i.Text = 0] = "Text", i[i.WidgetBefore = 1] = "WidgetBefore", i[i.WidgetAfter = 2] = "WidgetAfter", i[i.WidgetRange = 3] = "WidgetRange", i;
})(yt || (yt = {}));
class Xe extends Oi {
  constructor(e, t, n, s) {
    super(), this.startSide = e, this.endSide = t, this.widget = n, this.spec = s;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new so(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Ei(e, t, t, n, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, n, s;
    if (e.isBlockGap)
      n = -5e8, s = 4e8;
    else {
      let { start: o, end: r } = $h(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Ei(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new oo(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Oe.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
Xe.none = Oe.empty;
class so extends Xe {
  constructor(e) {
    let { start: t, end: n } = $h(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? ga(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Qo;
  }
  eq(e) {
    return this == e || e instanceof so && this.tagName == e.tagName && va(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
so.prototype.point = !1;
class oo extends Xe {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof oo && this.spec.class == e.spec.class && va(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
oo.prototype.mapMode = It.TrackBefore;
oo.prototype.point = !0;
class Ei extends Xe {
  constructor(e, t, n, s, o, r) {
    super(t, n, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? It.TrackBefore : It.TrackAfter : It.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? yt.WidgetRange : this.startSide <= 0 ? yt.WidgetBefore : yt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Ei && pg(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Ei.prototype.point = !0;
function $h(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function pg(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function ts(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Ys extends Oi {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof Ys && this.tagName == e.tagName && va(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Ys(e.tagName, e.attributes || Qo, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Oe.of(e, t);
  }
}
Ys.prototype.startSide = Ys.prototype.endSide = -1;
function Xs(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Nl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Vs(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Nl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function _o(i) {
  return i.nodeType == 3 ? Js(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Hs(i, e, t, n) {
  return t ? Au(i, e, t, n, -1) || Au(i, e, t, n, 1) : !1;
}
function ui(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function er(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function Au(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : Gn(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let o = i.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ui(i) + (s < 0 ? 0 : 1), i = o;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? Gn(i) : 0;
    } else
      return !1;
  }
}
function Gn(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function tr(i, e) {
  let { left: t, right: n } = i;
  if (t == n)
    return i;
  let s = e ? t : n;
  return { left: s, right: s, top: i.top, bottom: i.bottom };
}
function mg(i) {
  let e = i.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: i.innerWidth,
    top: 0,
    bottom: i.innerHeight
  };
}
function Dh(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function gg(i, e, t, n, s, o, r, l) {
  let a = i.ownerDocument, u = a.defaultView || window;
  for (let c = i, d = !1; c && !d; )
    if (c.nodeType == 1) {
      let h, f = c == a.body, m = 1, k = 1;
      if (f)
        h = mg(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (d = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let $ = c.getBoundingClientRect();
        ({ scaleX: m, scaleY: k } = Dh(c, $)), h = {
          left: $.left,
          right: $.left + c.clientWidth * m,
          top: $.top,
          bottom: $.top + c.clientHeight * k
        };
      }
      let b = 0, M = 0;
      if (s == "nearest")
        e.top < h.top + r ? (M = e.top - (h.top + r), t > 0 && e.bottom > h.bottom + M && (M = e.bottom - h.bottom + r)) : e.bottom > h.bottom - r && (M = e.bottom - h.bottom + r, t < 0 && e.top - M < h.top && (M = e.top - (h.top + r)));
      else {
        let $ = e.bottom - e.top, L = h.bottom - h.top;
        M = (s == "center" && $ <= L ? e.top + $ / 2 - L / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - L + r) - h.top;
      }
      if (n == "nearest" ? e.left < h.left + o ? (b = e.left - (h.left + o), t > 0 && e.right > h.right + b && (b = e.right - h.right + o)) : e.right > h.right - o && (b = e.right - h.right + o, t < 0 && e.left < h.left + b && (b = e.left - (h.left + o))) : b = (n == "center" ? e.left + (e.right - e.left) / 2 - (h.right - h.left) / 2 : n == "start" == l ? e.left - o : e.right - (h.right - h.left) + o) - h.left, b || M)
        if (f)
          u.scrollBy(b, M);
        else {
          let $ = 0, L = 0;
          if (M) {
            let H = c.scrollTop;
            c.scrollTop += M / k, L = (c.scrollTop - H) * k;
          }
          if (b) {
            let H = c.scrollLeft;
            c.scrollLeft += b / m, $ = (c.scrollLeft - H) * m;
          }
          e = {
            left: e.left - $,
            top: e.top - L,
            right: e.right - $,
            bottom: e.bottom - L
          }, $ && Math.abs($ - b) < 1 && (n = "nearest"), L && Math.abs(L - M) < 1 && (s = "nearest");
        }
      if (f)
        break;
      (e.top < h.top || e.bottom > h.bottom || e.left < h.left || e.right > h.right) && (e = {
        left: Math.max(e.left, h.left),
        right: Math.min(e.right, h.right),
        top: Math.max(e.top, h.top),
        bottom: Math.min(e.bottom, h.bottom)
      }), c = c.assignedSlot || c.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
function Lh(i, e = !0) {
  let t = i.ownerDocument, n = null, s = null;
  for (let o = i.parentNode; o && !(o == t.body || (!e || n) && s); )
    if (o.nodeType == 1)
      !s && o.scrollHeight > o.clientHeight && (s = o), e && !n && o.scrollWidth > o.clientWidth && (n = o), o = o.assignedSlot || o.parentNode;
    else if (o.nodeType == 11)
      o = o.host;
    else
      break;
  return { x: n, y: s };
}
class vg {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Gn(t) : 0), n, Math.min(e.focusOffset, n ? Gn(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
function Bh(i) {
  let e = [];
  for (let t = i; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Oh(i, e = !0) {
  for (let { node: t, left: n, top: s } of i)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != n && (t.scrollLeft = n);
}
let xi = null;
se.safari && se.safari_version >= 26 && (xi = !1);
function Eh(i) {
  if (i.setActive)
    return i.setActive();
  if (xi)
    return i.focus(xi);
  let e = Bh(i);
  i.focus(xi == null ? {
    get preventScroll() {
      return xi = { preventScroll: !0 }, !0;
    }
  } : void 0), xi || (xi = !1, Oh(e));
}
let Tu;
function Js(i, e, t = e) {
  let n = Tu || (Tu = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function ns(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, i.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, i.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function yg(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function bg(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, Gn(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = Gn(t));
    } else {
      if (t == i)
        return !0;
      n = ui(t), t = t.parentNode;
    }
}
function Rh(i) {
  return i instanceof Window ? i.pageYOffset > Math.max(0, i.document.documentElement.scrollHeight - i.innerHeight - 4) : i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function Ih(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = Gn(t);
    } else if (t.parentNode && !er(t))
      n = ui(t), t = t.parentNode;
    else
      return null;
  }
}
function Ph(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !er(t))
      n = ui(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class ln {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new ln(e.parentNode, ui(e), t);
  }
  static after(e, t) {
    return new ln(e.parentNode, ui(e) + 1, t);
  }
}
var Ye = /* @__PURE__ */ (function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
})(Ye || (Ye = {}));
const Ri = Ye.LTR, ya = Ye.RTL;
function Nh(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const kg = /* @__PURE__ */ Nh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), wg = /* @__PURE__ */ Nh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Vl = /* @__PURE__ */ Object.create(null), kn = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  Vl[e] = t, Vl[t] = -e;
}
function Vh(i) {
  return i <= 247 ? kg[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? wg[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const xg = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Ln {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ya : Ri;
  }
  /**
  @internal
  */
  constructor(e, t, n) {
    this.from = e, this.to = t, this.level = n;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, n, s) {
    let o = -1;
    for (let r = 0; r < e.length; r++) {
      let l = e[r];
      if (l.from <= t && l.to >= t) {
        if (l.level == n)
          return r;
        (o < 0 || (s != 0 ? s < 0 ? l.from < t : l.to > t : e[o].level > l.level)) && (o = r);
      }
    }
    if (o < 0)
      throw new RangeError("Index out of range");
    return o;
  }
}
function Hh(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !Hh(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const Ue = [];
function Sg(i, e, t, n, s) {
  for (let o = 0; o <= n.length; o++) {
    let r = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Vh(i.charCodeAt(u));
      h == 512 ? h = c : h == 8 && d == 4 && (h = 16), Ue[u] = h == 4 ? 2 : h, h & 7 && (d = h), c = h;
    }
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Ue[u];
      if (h == 128)
        u < l - 1 && c == Ue[u + 1] && c & 24 ? h = Ue[u] = c : Ue[u] = 256;
      else if (h == 64) {
        let f = u + 1;
        for (; f < l && Ue[f] == 64; )
          f++;
        let m = u && c == 8 || f < t && Ue[f] == 8 ? d == 1 ? 1 : 8 : 256;
        for (let k = u; k < f; k++)
          Ue[k] = m;
        u = f - 1;
      } else h == 8 && d == 1 && (Ue[u] = 1);
      c = h, h & 7 && (d = h);
    }
  }
}
function Cg(i, e, t, n, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= n.length; r++) {
    let u = r ? n[r - 1].to : e, c = r < n.length ? n[r].from : t;
    for (let d = u, h, f, m; d < c; d++)
      if (f = Vl[h = i.charCodeAt(d)])
        if (f < 0) {
          for (let k = l - 3; k >= 0; k -= 3)
            if (kn[k + 1] == -f) {
              let b = kn[k + 2], M = b & 2 ? s : b & 4 ? b & 1 ? o : s : 0;
              M && (Ue[d] = Ue[kn[k]] = M), l = k;
              break;
            }
        } else {
          if (kn.length == 189)
            break;
          kn[l++] = d, kn[l++] = h, kn[l++] = a;
        }
      else if ((m = Ue[d]) == 2 || m == 1) {
        let k = m == s;
        a = k ? 0 : 1;
        for (let b = l - 3; b >= 0; b -= 3) {
          let M = kn[b + 2];
          if (M & 2)
            break;
          if (k)
            kn[b + 2] |= 2;
          else {
            if (M & 4)
              break;
            kn[b + 2] |= 4;
          }
        }
      }
  }
}
function Mg(i, e, t, n) {
  for (let s = 0, o = n; s <= t.length; s++) {
    let r = s ? t[s - 1].to : i, l = s < t.length ? t[s].from : e;
    for (let a = r; a < l; ) {
      let u = Ue[a];
      if (u == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (s == t.length)
              break;
            c = t[s++].to, l = s < t.length ? t[s].from : e;
          } else if (Ue[c] == 256)
            c++;
          else
            break;
        let d = o == 1, h = (c < e ? Ue[c] : n) == 1, f = d == h ? d ? 1 : 2 : n;
        for (let m = c, k = s, b = k ? t[k - 1].to : i; m > a; )
          m == b && (m = t[--k].from, b = k ? t[k - 1].to : i), Ue[--m] = f;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Hl(i, e, t, n, s, o, r) {
  let l = n % 2 ? 2 : 1;
  if (n % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, d = !1;
      if (u == o.length || a < o[u].from) {
        let k = Ue[a];
        k != l && (c = !1, d = k == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u < o.length && m == o[u].from) {
          if (d)
            break e;
          let k = o[u];
          if (!c)
            for (let b = k.to, M = u + 1; ; ) {
              if (b == t)
                break e;
              if (M < o.length && o[M].from == b)
                b = o[M++].to;
              else {
                if (Ue[b] == l)
                  break e;
                break;
              }
            }
          if (u++, h)
            h.push(k);
          else {
            k.from > a && r.push(new Ln(a, k.from, f));
            let b = k.direction == Ri != !(f % 2);
            zl(i, b ? n + 1 : n, s, k.inner, k.from, k.to, r), a = k.to;
          }
          m = k.to;
        } else {
          if (m == t || (c ? Ue[m] != l : Ue[m] == l))
            break;
          m++;
        }
      h ? Hl(i, a, m, n + 1, s, h, r) : a < m && r.push(new Ln(a, m, f)), a = m;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, d = !1;
      if (!u || a > o[u - 1].to) {
        let k = Ue[a - 1];
        k != l && (c = !1, d = k == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u && m == o[u - 1].to) {
          if (d)
            break e;
          let k = o[--u];
          if (!c)
            for (let b = k.from, M = u; ; ) {
              if (b == e)
                break e;
              if (M && o[M - 1].to == b)
                b = o[--M].from;
              else {
                if (Ue[b - 1] == l)
                  break e;
                break;
              }
            }
          if (h)
            h.push(k);
          else {
            k.to < a && r.push(new Ln(k.to, a, f));
            let b = k.direction == Ri != !(f % 2);
            zl(i, b ? n + 1 : n, s, k.inner, k.from, k.to, r), a = k.from;
          }
          m = k.from;
        } else {
          if (m == e || (c ? Ue[m - 1] != l : Ue[m - 1] == l))
            break;
          m--;
        }
      h ? Hl(i, m, a, n + 1, s, h, r) : m < a && r.push(new Ln(m, a, f)), a = m;
    }
}
function zl(i, e, t, n, s, o, r) {
  let l = e % 2 ? 2 : 1;
  Sg(i, s, o, n, l), Cg(i, s, o, n, l), Mg(s, o, n, l), Hl(i, s, o, e, t, n, r);
}
function Ag(i, e, t) {
  if (!i)
    return [new Ln(0, 0, e == ya ? 1 : 0)];
  if (e == Ri && !t.length && !xg.test(i))
    return zh(i.length);
  if (t.length)
    for (; i.length > Ue.length; )
      Ue[Ue.length] = 256;
  let n = [], s = e == Ri ? 0 : 1;
  return zl(i, s, s, t, 0, i.length, n), n;
}
function zh(i) {
  return [new Ln(0, i, 0)];
}
let Wh = "";
function Tg(i, e, t, n, s) {
  var o;
  if (!i.length)
    return null;
  let r = n.head - i.from, l;
  if (n.head == i.from && n.assoc < 0) {
    if (!s)
      return null;
    r = e[l = 0].side(!1, t);
  } else if (n.head == i.to && n.assoc > 0) {
    if (s)
      return null;
    r = e[l = e.length - 1].side(!0, t);
  } else
    l = Ln.find(e, r, (o = n.bidiLevel) !== null && o !== void 0 ? o : -1, n.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let h = l += s ? 1 : -1;
    if (h < 0 || h >= e.length)
      return null;
    a = e[l = h], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = xt(i.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Wh = i.text.slice(Math.min(r, c), Math.max(r, c));
  let d = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!d)
      return s ? J.cursor(i.to, 1) : J.cursor(i.from, -1);
    if (d.level + (s ? 0 : 1) < a.level)
      return J.cursor(d.side(!s, t) + i.from, d.forward(s, t) ? 1 : -1, d.level);
  }
  return J.cursor(c + i.from, a.forward(s, t) ? -1 : 1, a.level);
}
function $g(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Vh(i.charCodeAt(n));
    if (s == 1)
      return Ri;
    if (s == 2 || s == 4)
      return ya;
  }
  return Ri;
}
const Fh = /* @__PURE__ */ de.define(), _h = /* @__PURE__ */ de.define(), Kh = /* @__PURE__ */ de.define(), Uh = /* @__PURE__ */ de.define(), Wl = /* @__PURE__ */ de.define(), Gh = /* @__PURE__ */ de.define(), jh = /* @__PURE__ */ de.define(), ba = /* @__PURE__ */ de.define(), ka = /* @__PURE__ */ de.define(), qh = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), Yh = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), Xh = /* @__PURE__ */ de.define();
class is {
  constructor(e, t, n, s, o, r = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new is(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new is(J.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const go = /* @__PURE__ */ qe.define({ map: (i, e) => i.map(e) }), Jh = /* @__PURE__ */ qe.define();
function an(i, e, t) {
  let n = i.facet(Uh);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const zn = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : !0 });
let Dg = 0;
const qi = /* @__PURE__ */ de.define({
  combine(i) {
    return i.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (i[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class zt {
  constructor(e, t, n, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(qi.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(qi.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: o, decorations: r } = t || {};
    return new zt(Dg++, e, n, s, (l) => {
      let a = [];
      return r && a.push(Cr.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : Xe.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return zt.define((n, s) => new e(n, s), t);
  }
}
class Yr {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (n) {
            if (an(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.plugin.create(e, this.spec.arg);
      } catch (t) {
        an(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        an(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Zh = /* @__PURE__ */ de.define(), wa = /* @__PURE__ */ de.define(), Cr = /* @__PURE__ */ de.define(), Qh = /* @__PURE__ */ de.define(), xa = /* @__PURE__ */ de.define(), ro = /* @__PURE__ */ de.define(), ed = /* @__PURE__ */ de.define();
function $u(i, e) {
  let t = i.state.facet(ed);
  if (!t.length)
    return t;
  let n = t.map((o) => o instanceof Function ? o(i) : o), s = [];
  return Oe.spans(n, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, d = s;
      for (let h = l.length - 1; h >= 0; h--, a--) {
        let f = l[h].spec.bidiIsolate, m;
        if (f == null && (f = $g(e.text, u, c)), a > 0 && d.length && (m = d[d.length - 1]).to == u && m.direction == f)
          m.to = c, d = m.inner;
        else {
          let k = { from: u, to: c, direction: f, inner: [] };
          d.push(k), d = k.inner;
        }
      }
    }
  }), s;
}
const td = /* @__PURE__ */ de.define();
function Sa(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let o of i.state.facet(td)) {
    let r = o(i);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (n = Math.max(n, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const Bs = /* @__PURE__ */ de.define();
class Jt {
  constructor(e, t, n, s) {
    this.fromA = e, this.toA = t, this.fromB = n, this.toB = s;
  }
  join(e) {
    return new Jt(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, n = this;
    for (; t > 0; t--) {
      let s = e[t - 1];
      if (!(s.fromA > n.toA)) {
        if (s.toA < n.fromA)
          break;
        n = n.join(s), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, n), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let n = [];
    for (let s = 0, o = 0, r = 0; ; ) {
      let l = s < e.length ? e[s].fromB : 1e9, a = o < t.length ? t[o] : 1e9, u = Math.min(l, a);
      if (u == 1e9)
        break;
      let c = u + r, d = u, h = c;
      for (; ; )
        if (o < t.length && t[o] <= d) {
          let f = t[o + 1];
          o += 2, d = Math.max(d, f);
          for (let m = s; m < e.length && e[m].fromB <= d; m++)
            r = e[m].toA - e[m].toB;
          h = Math.max(h, f + r);
        } else if (s < e.length && e[s].fromB <= d) {
          let f = e[s++];
          d = Math.max(d, f.toB), h = Math.max(h, f.toA), r = f.toA - f.toB;
        } else
          break;
      n.push(new Jt(c, h, u, d));
    }
    return n;
  }
}
class nr {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = dt.empty(this.startState.doc.length);
    for (let o of n)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Jt(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new nr(e, t, n);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 18) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
const Lg = [];
class it {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return Lg;
  }
  isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  isComposite() {
    return !1;
  }
  isLine() {
    return !1;
  }
  isText() {
    return !1;
  }
  isBlock() {
    return !1;
  }
  get domAttrs() {
    return null;
  }
  sync(e) {
    if (this.flags |= 2, this.flags & 4) {
      this.flags &= -5;
      let t = this.domAttrs;
      t && dg(this.dom, t);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(e) {
    this.dom = e, e.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e, t = this.posAtStart) {
    let n = t;
    for (let s of this.children) {
      if (s == e)
        return n;
      n += s.length + s.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t, n) {
    return null;
  }
  domPosFor(e, t) {
    let n = ui(this.dom), s = this.length ? e > 0 : t > 0;
    return new ln(this.parent.dom, n + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof Ar)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class Mr extends it {
  constructor(e) {
    super(e, 0), this._children = [];
  }
  isComposite() {
    return !0;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(e) {
    this.children.push(e), e.parent = this;
  }
  sync(e) {
    if (this.flags & 2)
      return;
    super.sync(e);
    let t = this.dom, n = null, s, o = e?.node == t ? e : null, r = 0;
    for (let l of this.children) {
      if (l.sync(e), r += l.length + l.breakAfter, s = n ? n.nextSibling : t.firstChild, o && s != l.dom && (o.written = !0), l.dom.parentNode == t)
        for (; s && s != l.dom; )
          s = Du(s);
      else
        t.insertBefore(l.dom, s);
      n = l.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = Du(s);
    this.length = r;
  }
}
function Du(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class Ar extends Mr {
  constructor(e, t) {
    super(t), this.view = e;
  }
  owns(e) {
    for (; e; e = e.parent)
      if (e == this)
        return !0;
    return !1;
  }
  isBlock() {
    return !0;
  }
  nearest(e) {
    for (; ; ) {
      if (!e)
        return null;
      let t = it.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], n = this, s = 0, o = 0; ; )
      if (s == n.children.length) {
        if (!t.length)
          return;
        n = n.parent, n.breakAfter && o++, s = t.pop();
      } else {
        let r = n.children[s++];
        if (r instanceof Kn)
          t.push(s), n = r, s = 0;
        else {
          let l = o + r.length, a = e(r, o);
          if (a !== void 0)
            return a;
          o = l + r.breakAfter;
        }
      }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(e, t) {
    let n, s = -1, o, r = -1;
    if (this.blockTiles((l, a) => {
      let u = a + l.length;
      if (e >= a && e <= u) {
        if (l.isWidget() && t >= -1 && t <= 1) {
          if (l.flags & 32)
            return !0;
          l.flags & 16 && (n = void 0);
        }
        (a < e || e == u && (t < -1 ? l.length : l.covers(1))) && (!n || !l.isWidget() && n.isWidget()) && (n = l, s = e - a), (u > e || e == a && (t > 1 ? l.length : l.covers(-1))) && (!o || !l.isWidget() && o.isWidget()) && (o = l, r = e - a);
      }
    }), !n && !o)
      throw new Error("No tile at position " + e);
    return n && t < 0 || !o ? { tile: n, offset: s } : { tile: o, offset: r };
  }
}
class Kn extends Mr {
  constructor(e, t) {
    super(e), this.wrapper = t;
  }
  isBlock() {
    return !0;
  }
  covers(e) {
    return this.children.length ? e < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1) : !1;
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(e, t) {
    let n = new Kn(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class ls extends Mr {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new ls(t || document.createElement("div"), e);
    return (!t || !n) && (s.flags |= 4), s;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  // Side -2/2 is handled specially, in that it allows the position
  // returned to be before (-2) or after (2) widgets that would always
  // be after/before a cursor position.
  resolveInline(e, t, n) {
    let s = null, o = -1, r = null, l = -1;
    function a(c, d) {
      for (let h = 0, f = 0; h < c.children.length && f <= d; h++) {
        let m = c.children[h], k = f + m.length;
        k >= d && (m.isComposite() ? a(m, d - f) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || n && Og(r, m))) && (k > d || m.flags & 32 && t <= 1) ? (r = m, l = d - f) : (f < d || m.flags & 16 && !m.isHidden && t >= -1) && (s = m, o = d - f)), f = k;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, n) : Bg(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: s, offset: o } = n;
      if (this.dom.contains(s.dom))
        return s.isText() ? new ln(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = n.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new ln(a.dom, 0);
        a == n.tile && (l = !0);
      }
    }
    return new ln(this.dom, 0);
  }
}
function Bg(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = _o(e);
  return t[t.length - 1] || null;
}
function Og(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Pt extends Mr {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let n = new Pt(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Ai extends it {
  constructor(e, t) {
    super(e, t.length), this.text = t;
  }
  sync(e) {
    this.flags & 2 || (super.sync(e), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text));
  }
  isText() {
    return !0;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(e, t, n) {
    let s = this.dom.nodeValue.length;
    e > s && (e = s);
    let o = e, r = e, l = 0;
    e == 0 && t < 0 || e == s && t >= 0 ? se.chrome || se.gecko || (e ? (o--, l = 1) : r < s && (r++, l = -1)) : t < 0 ? o-- : r < s && r++;
    let a = Js(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return se.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), n == null ? u : tr(u, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new Ai(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class Ii extends it {
  constructor(e, t, n, s) {
    super(e, t, s), this.widget = n;
  }
  isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(e) {
    return this.flags & 48 ? !1 : (this.flags & (e < 0 ? 64 : 128)) > 0;
  }
  coordsIn(e, t) {
    return this.coordsInWidget(e, t, !1);
  }
  coordsInWidget(e, t, n) {
    let s = this.widget.coordsAt(this.dom, e, t);
    if (s)
      return s;
    if (n)
      return tr(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return tr(r, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return Pe.empty;
    let { root: e } = this;
    if (!e)
      return Pe.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, n, s, o) {
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Ii(o, n, e, s);
  }
}
class ir extends it {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return Pe.empty;
  }
  coordsIn(e, t, n) {
    let s = this.dom.getBoundingClientRect();
    return n == null ? s : tr(s, t > 0 == n);
  }
}
class Eg {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, n) {
    let { tile: s, index: o, beforeBreak: r, parents: l } = this;
    for (; e || t > 0; )
      if (s.isComposite())
        if (r) {
          if (!e)
            break;
          n && n.break(), e--, r = !1;
        } else if (o == s.children.length) {
          if (!e && !l.length)
            break;
          n && n.leave(s), r = !!s.breakAfter, { tile: s, index: o } = l.pop(), o++;
        } else {
          let a = s.children[o], u = a.breakAfter;
          (t > 0 ? a.length <= e : a.length < e) && (!n || n.skip(a, 0, a.length) !== !1 || !a.isComposite) ? (r = !!u, o++, e -= a.length) : (l.push({ tile: s, index: o }), s = a, o = 0, n && a.isComposite() && n.enter(a));
        }
      else {
        let a = s.length;
        if (o < a && e) {
          let u = Math.min(e, a - o);
          n && n.skip(s, o, o + u), e -= u, o += u;
        }
        if (o == a)
          r = !!s.breakAfter, { tile: s, index: o } = l.pop(), o++;
        else if (!e)
          break;
      }
    return this.tile = s, this.index = o, this.beforeBreak = r, this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
}
class Rg {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class Ig {
  constructor(e, t, n) {
    this.cache = e, this.root = t, this.blockWrappers = n, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, n, s) {
    var o;
    this.flushBuffer();
    let r = this.ensureMarks(t, n), l = r.lastChild;
    if (l && l.isText() && !(l.flags & 8) && l.length + e.length < 512) {
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
      let a = r.children[r.children.length - 1] = new Ai(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || Ai.of(e, (o = this.cache.find(Ai)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Xr(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof Pt && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Xr(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && it.get(a.dom) && (c = Xr(a.dom));
        let d = Pt.of(a.mark, c);
        s.append(d), s = d;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = it.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new Ai(e.text, e.text.nodeValue);
    r.flags |= 8, this.pos = e.range.toB, s.append(r);
  }
  addInlineWidget(e, t, n) {
    let s = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    s || this.flushBuffer();
    let o = this.ensureMarks(t, n);
    !s && !(e.flags & 16) && o.append(this.getBuffer(1)), o.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, n) {
    this.flushBuffer(), this.ensureMarks(t, n).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var n;
    e || (e = nd);
    let s = ls.start(e, t || ((n = this.cache.find(ls)) === null || n === void 0 ? void 0 : n.dom), !!t);
    this.getBlockPos().append(this.lastBlock = this.curLine = s);
  }
  addLine(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1, this.endLine(), this.pos++;
  }
  addLineStartIfNotCovered(e) {
    this.blockPosCovered() || this.addLineStart(e);
  }
  ensureLine(e) {
    this.curLine || this.addLineStart(e);
  }
  ensureMarks(e, t) {
    var n;
    let s = this.curLine;
    for (let o = e.length - 1; o >= 0; o--) {
      let r = e[o], l;
      if (t > 0 && (l = s.lastChild) && l instanceof Pt && l.mark.eq(r))
        s = l, t--;
      else {
        let a = Pt.of(r, (n = this.cache.find(Pt, (u) => u.mark.eq(r))) === null || n === void 0 ? void 0 : n.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Lu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(se.ios && Lu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        Jr,
        0,
        32
        /* TileFlag.After */
      ) || new Ii(
        Jr.toDOM(),
        0,
        Jr,
        32
        /* TileFlag.After */
      )), this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    this.wrapperPos > this.pos + 1e4 && (this.blockWrappers.goto(this.pos), this.wrappers.length = 0);
    for (let e = this.wrappers.length - 1; e >= 0; e--)
      this.wrappers[e].to < this.pos && this.wrappers.splice(e, 1);
    for (let e = this.blockWrappers; e.value && e.from <= this.pos; e.next())
      if (e.to >= this.pos) {
        let t = e.rank * 102 + e.value.rank, n = new Rg(e.from, e.to, e.value, t), s = this.wrappers.length;
        for (; s > 0 && (this.wrappers[s - 1].rank - n.rank || this.wrappers[s - 1].to - n.to) < 0; )
          s--;
        this.wrappers.splice(s, 0, n);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let n of this.wrappers) {
      let s = t.lastChild;
      if (n.from < this.pos && s instanceof Kn && s.wrapper.eq(n.wrapper))
        t = s;
      else {
        let o = Kn.of(n.wrapper, (e = this.cache.find(Kn, (r) => r.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
        t.append(o), t = o;
      }
    }
    return t;
  }
  blockPosCovered() {
    let e = this.lastBlock;
    return e != null && !e.breakAfter && (!e.isWidget() || (e.flags & 160) > 0);
  }
  getBuffer(e) {
    let t = 2 | (e < 0 ? 16 : 32), n = this.cache.find(
      ir,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new ir(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class Pg {
  constructor(e) {
    this.skipCount = 0, this.text = "", this.textOff = 0, this.cursor = e.iter();
  }
  skip(e) {
    this.textOff + e <= this.text.length ? this.textOff += e : (this.skipCount += e - (this.text.length - this.textOff), this.text = "", this.textOff = 0);
  }
  next(e) {
    if (this.textOff == this.text.length) {
      let { value: s, lineBreak: o, done: r } = this.cursor.next(this.skipCount);
      if (this.skipCount = 0, r)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = s;
      let l = this.textOff = Math.min(e, s.length);
      return o ? null : s.slice(0, l);
    }
    let t = Math.min(this.text.length, this.textOff + e), n = this.text.slice(this.textOff, t);
    return this.textOff = t, n;
  }
}
const sr = [Ii, ls, Ai, Pt, ir, Kn, Ar];
for (let i = 0; i < sr.length; i++)
  sr[i].bucket = i;
class Ng {
  constructor(e) {
    this.view = e, this.buckets = sr.map(() => []), this.index = sr.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, n = this.buckets[t];
    n.length < 6 ? n.push(e) : n[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, n = 2) {
    let s = e.bucket, o = this.buckets[s], r = this.index[s];
    for (let l = 0; l < o.length; l++) {
      let a = (l + r) % o.length, u = o[a];
      if ((!t || t(u)) && !this.reused.has(u))
        return o.splice(a, 1), a < r && this.index[s]--, this.reused.set(u, n), u;
    }
    return null;
  }
  findWidget(e, t, n) {
    let s = this.buckets[0];
    if (s.length)
      for (let o = 0, r = 0; ; o++) {
        if (o == s.length) {
          if (r)
            return null;
          r = 1, o = 0;
        }
        let l = s[o];
        if (!this.reused.has(l) && (r == 0 ? l.widget.compare(e) : l.widget.constructor == e.constructor && e.updateDOM(l.dom, this.view, l.widget)))
          return s.splice(o, 1), o < this.index[0] && this.index[0]--, l.widget == e && l.length == t && (l.flags & 497) == n ? (this.reused.set(
            l,
            1
            /* Reused.Full */
          ), l) : (this.reused.set(
            l,
            2
            /* Reused.DOM */
          ), new Ii(l.dom, t, e, l.flags & -498 | n));
      }
  }
  reuse(e) {
    return this.reused.set(
      e,
      1
      /* Reused.Full */
    ), e;
  }
  maybeReuse(e, t = 2) {
    if (!this.reused.has(e))
      return this.reused.set(e, t), e.dom;
  }
  clear() {
    for (let e = 0; e < this.buckets.length; e++)
      this.buckets[e].length = this.index[e] = 0;
  }
}
class Vg {
  constructor(e, t, n, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Ng(e), this.text = new Pg(e.state.doc), this.builder = new Ig(this.cache, new Ar(e, e.contentDOM), Oe.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Eg(t), this.reuseWalker = {
      skip: (r, l, a) => {
        if (this.cache.add(r), r.isComposite())
          return !1;
      },
      enter: (r) => this.cache.add(r),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(e, t) {
    let n = t && this.getCompositionContext(t.text);
    for (let s = 0, o = 0, r = 0; ; ) {
      let l = r < e.length ? e[r++] : null, a = l ? l.fromA : this.old.root.length;
      if (a > s) {
        let u = a - s;
        this.preserve(u, !r, !l), s = a, o += u;
      }
      if (!l)
        break;
      t && l.fromA <= t.range.fromA && l.toA >= t.range.toA ? (this.forward(l.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(o, t.range.fromB), this.builder.flushBuffer(), this.cache.clear(), this.builder.addComposition(t, n), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, l.toA), this.emit(t.range.toB, l.toB)) : (this.forward(l.fromA, l.toA), this.emit(o, l.toB)), o = l.toB, s = l.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, n) {
    let s = Wg(this.old), o = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Ii.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
            u.flags & 256 ? (u.flags &= -2, this.builder.addBlockWidget(u)) : (this.builder.ensureLine(null), this.builder.addInlineWidget(u, s, o), o = s.length);
          }
        else if (r.isText())
          this.builder.ensureLine(null), !l && a == r.length && !this.cache.reused.has(r) ? this.builder.addText(r.text, s, o, this.cache.reuse(r)) : (this.cache.add(r), this.builder.addText(r.text.slice(l, a), s, o)), o = s.length;
        else if (r.isLine())
          r.flags &= -2, this.cache.reused.set(
            r,
            1
            /* Reused.Full */
          ), this.builder.addLine(r);
        else if (r instanceof ir)
          this.cache.add(r);
        else if (r instanceof Pt)
          this.builder.ensureLine(null), this.builder.addMark(r, s, o), this.cache.reused.set(
            r,
            1
            /* Reused.Full */
          ), o = s.length;
        else
          return !1;
        this.openWidget = !1;
      },
      enter: (r) => {
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof Pt && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof Pt && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let n = null, s = this.builder, o = -1, r = Oe.spans(this.decorations, e, t, {
      point: (l, a, u, c, d, h) => {
        if (u instanceof Ei) {
          if (this.disallowBlockEffectsFor[h]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, d > c.length)
            s.continueWidget(a - l);
          else {
            let f = u.widget || (u.block ? as.block : as.inline), m = Hg(u), k = this.cache.findWidget(f, a - l, m) || Ii.of(f, this.view, a - l, m);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(k)) : (s.ensureLine(n), s.addInlineWidget(k, c, d));
          }
          n = null;
        } else
          n = zg(n, u);
        a > l && this.text.skip(a - l);
      },
      span: (l, a, u, c) => {
        for (let d = l; d < a; ) {
          let h = this.text.next(Math.min(512, a - d));
          h == null ? (s.addLineStartIfNotCovered(n), s.addBreak(), d++) : (s.ensureLine(n), s.addText(h, u, d == l ? c : u.length), d += h.length), n = null;
        }
        o = u.length;
      }
    });
    o > -1 && (this.openWidget = r > o), this.openWidget || s.addLineStartIfNotCovered(n), this.openMarks = r;
  }
  forward(e, t, n = 1) {
    t - e <= 10 ? this.old.advance(t - e, n, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, n, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], n = null;
    for (let s = e.parentNode; ; s = s.parentNode) {
      let o = it.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof Pt ? t.push(o) : o?.isLine() ? n = o : o instanceof Kn || (s.nodeName == "DIV" && !n ? n = new ls(s, nd) : n || t.push(Pt.of(new so({ tagName: s.nodeName.toLowerCase(), attributes: fg(s) }), s)));
    }
    return n ? { line: n, marks: t } : null;
  }
}
function Lu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function Hg(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const nd = { class: "cm-line" };
function zg(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && ga(t, i), n && (i.class += " " + n)), i;
}
function Wg(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Pt && e.push(n.mark);
  }
  return e;
}
function Xr(i) {
  let e = it.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class as extends io {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
as.inline = /* @__PURE__ */ new as("span");
as.block = /* @__PURE__ */ new as("div");
const Jr = /* @__PURE__ */ new class extends io {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return !0;
  }
  get editable() {
    return !0;
  }
}();
class Bu {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Xe.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new Ar(e, e.contentDOM), this.updateInner([new Jt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: d }) => d < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Xg(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? _g(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: d } = this.hasComposition;
      n = new Jt(c, d, e.changes.mapPos(c, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (se.ie || se.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Gg(r, this.decorations, e.changes);
    a.length && (n = Jt.extendWithRanges(n, a));
    let u = qg(l, this.blockWrappers, e.changes);
    return u.length && (n = Jt.extendWithRanges(n, u)), o && !n.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new Vg(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && it.get(t.text) && l.cache.reused.set(
          it.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), Fl(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = se.chrome || se.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Zr && s.push(o.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(Jh) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, o = s == n, r = !o && !(this.view.state.facet(zn) || n.tabIndex > -1) && Vs(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), se.gecko && a.empty && !this.hasComposition && Fg(u)) {
      let h = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(h, u.node.childNodes[u.offset] || null)), u = c = new ln(h, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Hs(u.node, u.offset, d.anchorNode, d.anchorOffset) || !Hs(c.node, c.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      se.android && se.chrome && n.contains(d.focusNode) && Yg(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let h = Xs(this.view.root);
      if (h) if (a.empty) {
        if (se.gecko) {
          let f = Kg(u.node, u.offset);
          if (f && f != 3) {
            let m = (f == 1 ? Ih : Ph)(u.node, u.offset);
            m && (u = new ln(m.node, m.offset));
          }
        }
        h.collapse(u.node, u.offset), a.bidiLevel != null && h.caretBidiLevel !== void 0 && (h.caretBidiLevel = a.bidiLevel);
      } else if (h.extend) {
        h.collapse(u.node, u.offset);
        try {
          h.extend(c.node, c.offset);
        } catch {
        }
      } else {
        let f = document.createRange();
        a.anchor > a.head && ([u, c] = [c, u]), f.setEnd(c.node, c.offset), f.setStart(u.node, u.offset), h.removeAllRanges(), h.addRange(f);
      }
      r && this.view.root.activeElement == n && (n.blur(), s && s.focus());
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new ln(d.anchorNode, d.anchorOffset), this.impreciseHead = c.precise ? null : new ln(d.focusNode, d.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Hs(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = Xs(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
    if (!n || !t.empty || !t.assoc || !n.modify)
      return;
    let r = this.lineAt(t.head, t.assoc);
    if (!r)
      return;
    let l = r.posAtStart;
    if (t.head == l || t.head == l + r.length)
      return;
    let a = this.coordsAt(t.head, -1), u = this.coordsAt(t.head, 1);
    if (!a || !u || a.bottom > u.top)
      return;
    let c = this.domAtPos(t.head + t.assoc, t.assoc);
    n.collapse(c.node, c.offset), n.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let d = e.observer.selectionRange;
    e.docView.posFromDOM(d.anchorNode, d.anchorOffset) != t.from && n.collapse(s, o);
  }
  posFromDOM(e, t) {
    let n = this.tile.nearest(e);
    if (!n)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let s = n.posAtStart;
    if (n.isComposite()) {
      let o;
      if (e == n.dom)
        o = n.dom.childNodes[t];
      else {
        let r = Gn(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let l = e.parentNode;
          if (l == n.dom)
            break;
          r == 0 && l.firstChild != l.lastChild && (e == l.firstChild ? r = -1 : r = 1), e = l;
        }
        r < 0 ? o = e : o = e.nextSibling;
      }
      if (o == n.dom.firstChild)
        return s;
      for (; o && !it.get(o); )
        o = o.nextSibling;
      if (!o)
        return s + n.length;
      for (let r = 0, l = s; ; r++) {
        let a = n.children[r];
        if (a.dom == o)
          return l;
        l += a.length + a.breakAfter;
      }
    } else return n.isText() ? e == n.dom ? s + t : s + (t ? n.length : 0) : s;
  }
  domAtPos(e, t) {
    let { tile: n, offset: s } = this.tile.resolveBlock(e, t);
    return n.isWidget() ? n.domPosFor(s, t) : n.domIn(s, t);
  }
  inlineDOMNearPos(e, t) {
    let n, s = -1, o = !1, r, l = -1, a = !1;
    return this.tile.blockTiles((u, c) => {
      if (u.isWidget()) {
        if (u.flags & 32 && c >= e)
          return !0;
        u.flags & 16 && (o = !0);
      } else {
        let d = c + u.length;
        if (c <= e && (n = u, s = e - c, o = d < e), d >= e && !r && (r = u, l = e - c, a = c > e), c > e && r)
          return !0;
      }
    }), !n && !r ? this.domAtPos(e, t) : (o && r ? n = null : a && n && (r = null), n && t < 0 || !r ? n.domIn(s, t) : r.domIn(l, t));
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(e, t, n) {
    let { tile: s, offset: o } = this.tile.resolveBlock(e, t);
    return s.isWidget() ? s.widget instanceof Zr ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, n);
  }
  lineAt(e, t) {
    let { tile: n } = this.tile.resolveBlock(e, t);
    return n.isLine() ? n : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: n } = this.tile.resolveBlock(e, 1);
    if (!t.isLine())
      return null;
    function s(o, r) {
      if (o.isComposite())
        for (let l of o.children) {
          if (l.length >= r) {
            let a = s(l, r);
            if (a)
              return a;
          }
          if (r -= l.length, r < 0)
            break;
        }
      else if (o.isText() && r < o.length) {
        let l = xt(o.text, r);
        if (l == r)
          return null;
        let a = Js(o.dom, r, l).getClientRects();
        for (let u = 0; u < a.length; u++) {
          let c = a[u];
          if (u == a.length - 1 || c.top < c.bottom && c.left < c.right)
            return c;
        }
      }
      return null;
    }
    return s(t, n);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: n, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Ye.LTR, u = 0, c = (d, h, f) => {
      for (let m = 0; m < d.children.length && !(h > s); m++) {
        let k = d.children[m], b = h + k.length, M = k.dom.getBoundingClientRect(), { height: $ } = M;
        if (f && !m && (u += M.top - f.top), k instanceof Kn)
          b > n && c(k, h, M);
        else if (h >= n && (u > 0 && t.push(-u), t.push($ + u), u = 0, r)) {
          let L = k.dom.lastChild, H = L ? _o(L) : [];
          if (H.length) {
            let V = H[H.length - 1], W = a ? V.right - M.left : M.right - V.left;
            W > l && (l = W, this.minWidth = o, this.minWidthFrom = h, this.minWidthTo = b);
          }
        }
        f && m == d.children.length - 1 && (u += f.bottom - M.bottom), h = b + k.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? Ye.RTL : Ye.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = _o(u.dom);
          if (c.length != 1)
            return;
          l += c[0].width, a = c[0].height;
        }
        if (l)
          return {
            lineHeight: r.dom.getBoundingClientRect().height,
            charWidth: l / r.length,
            textHeight: a
          };
      }
    });
    if (e)
      return e;
    let t = document.createElement("div"), n, s, o;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let r = _o(t.firstChild)[0];
      n = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : n, t.remove();
    }), { lineHeight: n, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let n = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > n) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(n).top) / this.view.scaleY;
        e.push(Xe.replace({
          widget: new Zr(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(n, r));
      }
      if (!o)
        break;
      n = o.to + 1;
    }
    return Xe.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(Cr).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, s = this.view.state.facet(xa).map((o, r) => {
      let l = typeof o == "function";
      return l && (n = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = n, t.push(Oe.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Qh).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(Xh))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        an(this.view.state, c, "scroll handler");
      }
    let { range: t } = e, n = this.coordsAt(t.head, t.assoc || (t.head > t.anchor ? -1 : 1)), s;
    if (!n)
      return;
    !t.empty && (s = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (n = {
      left: Math.min(n.left, s.left),
      top: Math.min(n.top, s.top),
      right: Math.max(n.right, s.right),
      bottom: Math.max(n.bottom, s.bottom)
    });
    let o = Sa(this.view), r = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (gg(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Ye.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Bh(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), Oh(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    Fl(this.tile);
  }
}
function Fl(i, e) {
  let t = e?.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      Fl(n, e);
  }
}
function Fg(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function id(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = Ih(t.focusNode, t.focusOffset), s = Ph(t.focusNode, t.focusOffset), o = n || s;
  if (s && n && s.node != n.node) {
    let l = it.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (i.docView.lastCompositionAfterCursor) {
      let a = it.get(n.node);
      !a || a.isText() && a.text != n.node.nodeValue || (o = s);
    }
  }
  if (i.docView.lastCompositionAfterCursor = o != n, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function _g(i, e, t) {
  let n = id(i, t);
  if (!n)
    return null;
  let { node: s, from: o, to: r } = n, l = s.nodeValue;
  if (/[\n\r]/.test(l) || i.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Jt(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Kg(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Ug = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ts(e, t, this.changes);
  }
  comparePoint(e, t) {
    ts(e, t, this.changes);
  }
  boundChange(e) {
    ts(e, e, this.changes);
  }
};
function Gg(i, e, t) {
  let n = new Ug();
  return Oe.compare(i, e, t, n), n.changes;
}
class jg {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ts(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    ts(e, e, this.changes);
  }
}
function qg(i, e, t) {
  let n = new jg();
  return Oe.compare(i, e, t, n), n.changes;
}
function Yg(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Xg(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Zr extends io {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function Jg(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return J.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = xt(s.text, o, !1) : l = xt(s.text, o);
  let a = n(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = xt(s.text, r, !1);
    if (n(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = xt(s.text, l);
    if (n(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return J.undirectionalRange(r + s.from, l + s.from);
}
function Zg(i, e, t, n, s) {
  let o = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let l = i.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (i.defaultLineHeight - l) * 0.5) / l);
    o += a * i.viewState.heightOracle.lineLength;
  }
  let r = i.state.sliceDoc(t.from, t.to);
  return t.from + lg(r, o, i.state.tabSize);
}
function _l(i, e, t) {
  let n = i.lineBlockAt(e);
  if (Array.isArray(n.type)) {
    let s;
    for (let o of n.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == yt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || n;
  }
  return n;
}
function Qg(i, e, t, n) {
  let s = _l(i, e.head, e.assoc || -1), o = !n || s.type != yt.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = i.dom.getBoundingClientRect(), l = i.textDirectionAt(s.from), a = i.posAtCoords({
      x: t == (l == Ye.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return J.cursor(a, t ? -1 : 1);
  }
  return J.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function Ou(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), o = i.bidiSpans(s), r = i.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = Tg(s, o, r, l, t), c = Wh;
    if (!u) {
      if (s.number == (t ? i.state.doc.lines : 1))
        return l;
      c = `
`, s = i.state.doc.line(s.number + (t ? 1 : -1)), o = i.bidiSpans(s), u = t ? J.cursor(s.from, -1) : J.cursor(s.to, 1);
    }
    if (a) {
      if (!a(c))
        return l;
    } else {
      if (!n)
        return u;
      a = n(c);
    }
    l = u;
  }
}
function ev(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (o) => {
    let r = n(o);
    return s == Fn.Space && (s = r), s == r;
  };
}
function tv(i, e, t, n) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? i.state.doc.length : 0))
    return J.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = i.contentDOM.getBoundingClientRect(), u = i.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = i.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let m = i.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, i.defaultCharacterWidth * (s - m.from))), l = (o < 0 ? m.top : m.bottom) + c;
  }
  let d = a.left + r, h = i.viewState.heightOracle.textHeight >> 1, f = n ?? h;
  for (let m = 0; ; m += h) {
    let k = l + (f + m) * o, b = Kl(i, { x: d, y: k }, !1, o);
    if (t ? k > a.bottom : k < a.top)
      return J.cursor(b.pos, b.assoc);
    let M = i.coordsAtPos(b.pos, b.assoc), $ = M ? (M.top + M.bottom) / 2 : 0;
    if (!M || (t ? $ > l : $ < l))
      return J.cursor(b.pos, b.assoc, void 0, r);
  }
}
function zs(i, e, t) {
  for (; ; ) {
    let n = 0;
    for (let s of i)
      s.between(e - 1, e + 1, (o, r, l) => {
        if (e > o && e < r) {
          let a = n || t || (e - o < r - e ? -1 : 1);
          e = a < 0 ? o : r, n = a;
        }
      });
    if (!n)
      return e;
  }
}
function sd(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], o = null;
    if (s.empty) {
      let r = zs(i, s.from, 0);
      r != s.from && (o = J.cursor(r, -1));
    } else {
      let r = zs(i, s.from, -1), l = zs(i, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = J.undirectionalRange(s.from, s.to) : o = J.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? J.create(t, e.mainIndex) : e;
}
function Qr(i, e, t) {
  let n = zs(i.state.facet(ro).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : J.cursor(n, n < t.from ? 1 : -1);
}
class Dn {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Kl(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), o = s.top + i.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new Dn(0, 1);
    if (a > i.viewState.docHeight)
      return new Dn(i.state.doc.length, -1);
    if (u = i.elementAtHeight(a), n == null)
      break;
    if (u.type == yt.Text) {
      if (n < 0 ? u.to < i.viewport.from : u.from > i.viewport.to)
        break;
      let h = i.docView.coordsAt(n < 0 ? u.from : u.to, n > 0 ? -1 : 1);
      if (h && (n < 0 ? h.top <= a + o : h.bottom >= a + o))
        break;
    }
    let d = i.viewState.heightOracle.textHeight / 2;
    a = n > 0 ? u.bottom + d : u.top - d;
  }
  if (i.viewport.from >= u.to || i.viewport.to <= u.from) {
    if (t)
      return null;
    if (u.type == yt.Text) {
      let d = Zg(i, s, u, r, l);
      return new Dn(d, d == u.from ? 1 : -1);
    }
  }
  if (u.type != yt.Text)
    return a < (u.top + u.bottom) / 2 ? new Dn(u.from, 1) : new Dn(u.to, -1);
  let c = i.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = i.docView.lineAt(u.from, -2)), new nv(i, r, l, i.textDirectionAt(u.from)).scanTile(c, u.from);
}
class nv {
  constructor(e, t, n, s) {
    this.view = e, this.x = t, this.y = n, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Ln.find(s, e - n.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Ln.find(s, e - n.from, -1, t)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(e, t) {
    let { spans: n, line: s } = this.bidiSpansAt(e);
    return n.length > 1 || n.length && (n[0].level != this.baseDir || n[0].to + s.from < t);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(e, t, n = !1) {
    let s = 0, o = e.length - 1, r = /* @__PURE__ */ new Set(), l = this.bidiIn(e[0], e[o]), a, u, c = -1, d = 1e9, h;
    e: for (; s < o; ) {
      let m = o - s, k = s + o >> 1;
      t: if (r.has(k)) {
        for (let $ = 1; $ < m; $++) {
          let L = k + $;
          if (L >= o && (L -= m), !r.has(L)) {
            k = L;
            break t;
          }
        }
        break e;
      }
      r.add(k);
      let b = t(k), M = 0;
      if (b)
        for (let $ = 0; $ < b.length; $++) {
          let L = b[$];
          if (!(L.width == 0 && b.length > 1))
            if (L.bottom < this.y)
              (!a || a.bottom < L.bottom) && (a = L), M = 1;
            else if (L.top > this.y)
              (!u || u.top > L.top) && (u = L), M = -1;
            else {
              let H = L.left > this.x ? this.x - L.left : L.right < this.x ? this.x - L.right : 0, V = Math.abs(H);
              V < d && (c = k, d = V, h = L), H && (M = H < 0 == (this.baseDir == Ye.LTR) ? -1 : 1);
            }
        }
      M == -1 && (!l || this.baseDirAt(e[k], 1)) ? o = k : M == 1 && (!l || this.baseDirAt(e[k + 1], -1)) && (s = k + 1);
    }
    if (!h) {
      if (!u && !a)
        return { i: 0, after: !1 };
      let m = a && (!u || this.y - a.bottom < u.top - this.y) ? a : u;
      return this.y = (m.top + m.bottom) / 2, this.scan(e, t, !0);
    }
    if (d && !n) {
      let { top: m, bottom: k } = h;
      if (a && a.bottom > (m + m + k) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (u && u.top < (m + k + k) / 3)
        return this.y = u.top + 1, this.scan(e, t, !0);
    }
    let f = (l ? this.dirAt(e[c], 1) : this.baseDir) == Ye.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (h.left + h.right) / 2 == f
    };
  }
  scanText(e, t) {
    let n = [];
    for (let o = 0; o < e.length; o = xt(e.text, o))
      n.push(t + o);
    n.push(t + e.length);
    let s = this.scan(n, (o) => {
      let r = n[o] - t, l = n[o + 1] - t;
      return Js(e.dom, r, l).getClientRects();
    });
    return s.after ? new Dn(n[s.i + 1], -1) : new Dn(n[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new Dn(t, 1);
    if (e.children.length == 1) {
      let l = e.children[0];
      if (l.isText())
        return this.scanText(l, t);
      if (l.isComposite())
        return this.scanTile(l, t);
    }
    let n = [t];
    for (let l = 0, a = t; l < e.children.length; l++)
      n.push(a += e.children[l].length);
    let s = this.scan(n, (l) => {
      let a = e.children[l];
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : Js(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = n[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new Dn(n[s.i + 1], -1) : new Dn(r, 1);
  }
}
const Gi = "￿";
class iv {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(ze.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Gi;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(n, s);
      let o = this.text.length;
      this.readNode(s);
      let r = it.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = it.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : er(s)) || er(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !ov(l, t) && this.lineBreak(), s = l;
    }
    return this.findPointBefore(n, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let n of this.points)
      n.node == e && (n.pos = this.text.length + Math.min(n.offset, t.length));
    for (let n = 0, s = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let o = -1, r = 1, l;
      if (this.lineSeparator ? (o = t.indexOf(this.lineSeparator, n), r = this.lineSeparator.length) : (l = s.exec(t)) && (o = l.index, r = l[0].length), this.append(t.slice(n, o < 0 ? t.length : o)), o < 0)
        break;
      if (this.lineBreak(), r > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= r - 1);
      n = o + r;
    }
  }
  readNode(e) {
    let t = it.get(e), n = t && t.overrideDOMText;
    if (n != null) {
      this.findPointInside(e, n.length);
      for (let s = n.iter(); !s.next().done; )
        s.lineBreak ? this.lineBreak() : this.append(s.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let n of this.points)
      n.node == e && e.childNodes[n.offset] == t && (n.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let n of this.points)
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (sv(e, n.node, n.offset) ? t : 0));
  }
}
function sv(i, e, t) {
  for (; ; ) {
    if (!e || t < Gn(e))
      return !1;
    if (e == i)
      return !0;
    t = ui(e) + 1, e = e.parentNode;
  }
}
function ov(i, e) {
  let t;
  for (; !(i == e || !i); i = i.nextSibling) {
    let n = it.get(i);
    if (!n?.isWidget())
      return !1;
    n && (t || (t = [])).push(n);
  }
  if (t)
    for (let n of t) {
      let s = n.overrideDOMText;
      if (s?.length)
        return !1;
    }
  return !0;
}
class Eu {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class rv {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = od(e.docView.tile, t, n, 0))) {
      let a = o || r ? [] : av(e), u = new iv(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = uv(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Nl(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Nl(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((se.ios || se.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let h = Math.min(u, c), f = Math.max(u, c), m = d.from - h, k = d.to - f;
        (m == 0 || m == 1 || h == 0) && (k == 0 || k == -1 || f == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(J.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let h = e.coordsAtPos(u, -1), f = 0;
        h && (f = e.inputState.lastTouchY <= h.bottom ? -1 : 1), this.newSel = J.create([J.cursor(u, f)]);
      } else
        this.newSel = J.single(c, u);
    }
  }
}
function od(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = n, c = n; a < i.children.length; a++) {
      let d = i.children[a], h = u + d.length;
      if (u < e && h > t)
        return od(d, e, t, u);
      if (h >= e && s == -1 && (s = a, o = u), u > t && d.dom.parentNode == i.dom) {
        r = a, l = c;
        break;
      }
      c = h, u = h + d.breakAfter;
    }
    return {
      from: o,
      to: l < 0 ? n + i.length : l,
      startDOM: (s ? i.children[s - 1].dom.nextSibling : null) || i.dom.firstChild,
      endDOM: r < i.children.length && r >= 0 ? i.children[r].dom : null
    };
  } else return i.isText() ? { from: n, to: n + i.length, startDOM: i.dom, endDOM: i.dom.nextSibling } : null;
}
function rd(i, e) {
  let t, { newSel: n } = e, { state: s } = i, o = s.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || se.android && e.text.length < a - l) && (u = o.to, c = "end");
    let d = s.doc.sliceString(l, a, Gi), h, f;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(h = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: Pe.of(e.text.slice(o.from - l, h).split(Gi))
    } : (f = ld(d, e.text, u - l, c)) && (se.chrome && r == 13 && f.toB == f.from + 2 && e.text.slice(f.from, f.toB) == Gi + Gi && f.toB--, t = {
      from: l + f.from,
      to: l + f.toA,
      insert: Pe.of(e.text.slice(f.from, f.toB).split(Gi))
    });
  } else n && (!i.hasFocus && s.facet(zn) || or(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((se.mac || se.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = J.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: Pe.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && i.docView.lineHasWidget(o.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(i.inputState.insertingText)
  } : se.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = J.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: Pe.of([" "]) }), t)
    return Ca(i, t, n, r);
  if (n && !or(n, o)) {
    let l = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (l = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = sd(s.facet(ro).map((u) => u(i)), n))), i.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function Ca(i, e, t, n = -1) {
  if (se.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (se.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && ns(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && ns(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && ns(i.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let r, l = () => r || (r = lv(i, e, t));
  return i.state.facet(Gh).some((a) => a(i, e.from, e.to, o, l)) || i.dispatch(l()), !0;
}
function lv(i, e, t) {
  let n, s = i.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = zs(s.facet(ro).map((d) => d(i)), u, a);
    e.from == c && (r = c);
  }
  if (r > -1)
    n = {
      changes: e,
      selection: J.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && i.inputState.composing < 0) {
    let a = o.from < e.from ? s.sliceDoc(o.from, e.from) : "", u = o.to > e.to ? s.sliceDoc(e.to, o.to) : "";
    n = s.replaceSelection(i.state.toText(a + e.insert.sliceString(0, void 0, i.state.lineBreak) + u));
  } else {
    let a = s.changes(e), u = t && t.main.to <= a.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (i.inputState.composing >= 0 || i.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let c = i.state.sliceDoc(e.from, e.to), d, h = t && id(i, t.main.head);
      if (h) {
        let m = e.insert.length - (e.to - e.from);
        d = { from: h.from, to: h.to - m };
      } else
        d = i.state.doc.lineAt(o.head);
      let f = o.to - e.to;
      n = s.changeByRange((m) => {
        if (m.from == o.from && m.to == o.to)
          return { changes: a, range: u || m.map(a) };
        let k = m.to - f, b = k - c.length;
        if (i.state.sliceDoc(b, k) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        k >= d.from && b <= d.to)
          return { range: m };
        let M = s.changes({ from: b, to: k, insert: e.insert }), $ = m.to - o.to;
        return {
          changes: M,
          range: u ? J.range(Math.max(0, u.anchor + $), Math.max(0, u.head + $)) : m.map(M)
        };
      });
    } else
      n = {
        changes: a,
        selection: u && s.selection.replaceRange(u)
      };
  }
  let l = "input.type";
  return (i.composing || i.inputState.compositionPendingChange && i.inputState.compositionEndedAt > Date.now() - 50) && (i.inputState.compositionPendingChange = !1, l += ".compose", i.inputState.compositionFirstChange && (l += ".start", i.inputState.compositionFirstChange = !1)), s.update(n, { userEvent: l, scrollIntoView: !0 });
}
function ld(i, e, t, n) {
  let s = Math.min(i.length, e.length), o = 0;
  for (; o < s && i.charCodeAt(o) == e.charCodeAt(o); )
    o++;
  if (o == s && i.length == e.length)
    return null;
  let r = i.length, l = e.length;
  for (; r > 0 && l > 0 && i.charCodeAt(r - 1) == e.charCodeAt(l - 1); )
    r--, l--;
  if (n == "end") {
    let a = Math.max(0, o - Math.min(r, l));
    t -= r + a - o;
  }
  if (r < o && i.length < e.length) {
    let a = t <= o && t >= r ? o - t : 0;
    o -= a, l = o + (l - r), r = o;
  } else if (l < o) {
    let a = t <= o && t >= l ? o - t : 0;
    o -= a, r = o + (r - l), l = o;
  }
  return { from: o, toA: r, toB: l };
}
function av(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o } = i.observer.selectionRange;
  return t && (e.push(new Eu(t, n)), (s != t || o != n) && e.push(new Eu(s, o))), e;
}
function uv(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t < 0 || n < 0 ? null : t == n ? J.create([J.cursor(n + e, -1)]) : J.single(t + e, n + e);
}
function or(i, e) {
  return e.head == i.main.head && e.anchor == i.main.anchor;
}
class cv {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, se.safari && e.contentDOM.addEventListener("input", () => null), se.gecko && Av(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !bv(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let n = this.handlers[e];
    if (n) {
      for (let s of n.observers)
        s(this.view, t);
      for (let s of n.handlers) {
        if (t.defaultPrevented)
          break;
        if (s(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = dv(e), n = this.handlers, s = this.view.contentDOM;
    for (let o in t)
      if (o != "scroll") {
        let r = !t[o].handlers.length, l = n[o];
        l && r != !l.handlers.length && (s.removeEventListener(o, this.handleEvent), l = null), l || s.addEventListener(o, this.handleEvent, { passive: r });
      }
    for (let o in n)
      o != "scroll" && !t[o] && s.removeEventListener(o, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && ud.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), se.android && se.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (se.ios && !e.synthetic && !e.altKey && !e.metaKey && (ad.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || fv.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && se.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && hv(this.view.win) && (t.shiftKey = !1);
      let n = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == n && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, ns(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : se.safari && !se.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function hv(i) {
  return i.visualViewport ? i.visualViewport.height * i.visualViewport.scale / i.document.documentElement.clientHeight < 0.85 : !1;
}
function Ru(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      an(t.state, s);
    }
  };
}
function dv(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Ru(n.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Ru(n.value, a));
      }
  }
  for (let n in hn)
    t(n).handlers.push(hn[n]);
  for (let n in Lt)
    t(n).observers.push(Lt[n]);
  return e;
}
const ad = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], fv = "dthko", ud = [16, 17, 18, 20, 91, 92, 224, 225], vo = 6;
function yo(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function pv(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class mv {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Lh(e.contentDOM), this.atoms = e.state.facet(ro).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(ze.allowMultipleSelections) && gv(e, t), this.dragging = yv(e, t) && dd(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && pv(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = Sa(this.view);
    e.clientX - a.left <= s + vo ? t = -yo(s - e.clientX) : e.clientX + a.right >= r - vo && (t = yo(e.clientX - r)), e.clientY - a.top <= o + vo ? n = -yo(o - e.clientY) : e.clientY + a.bottom >= l - vo && (n = yo(e.clientY - l)), this.setScrollSpeed(t, n);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  select(e) {
    let { view: t } = this, n = sd(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function gv(i, e) {
  let t = i.state.facet(Fh);
  return t.length ? t[0](e) : se.mac ? e.metaKey : e.ctrlKey;
}
function vv(i, e) {
  let t = i.state.facet(_h);
  return t.length ? t[0](e) : se.mac ? !e.altKey : !e.ctrlKey;
}
function yv(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = Xs(i.root);
  if (!n || n.rangeCount == 0)
    return !0;
  let s = n.getRangeAt(0).getClientRects();
  for (let o = 0; o < s.length; o++) {
    let r = s[o];
    if (r.left <= e.clientX && r.right >= e.clientX && r.top <= e.clientY && r.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function bv(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = it.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const hn = /* @__PURE__ */ Object.create(null), Lt = /* @__PURE__ */ Object.create(null), cd = se.ie && se.ie_version < 15 || se.ios && se.webkit_version < 604;
function kv(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), hd(i, t.value);
  }, 50);
}
function Tr(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function hd(i, e) {
  e = Tr(i.state, ba, e);
  let { state: t } = i, n, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Ul != null && t.selection.ranges.every((a) => a.empty) && Ul == o.toString()) {
    let a = -1;
    n = t.changeByRange((u) => {
      let c = t.doc.lineAt(u.from);
      if (c.from == a)
        return { range: u };
      a = c.from;
      let d = t.toText((r ? o.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: d },
        range: J.cursor(u.from + d.length, -1)
      };
    });
  } else r ? n = t.changeByRange((a) => {
    let u = o.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: u.text },
      range: J.cursor(a.from + u.length, -1)
    };
  }) : n = t.replaceSelection(o);
  i.dispatch(n, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Lt.scroll = (i) => {
  let e = i.inputState;
  e.lastScrollTop = i.scrollDOM.scrollTop, e.lastScrollLeft = i.scrollDOM.scrollLeft, se.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Lt.wheel = Lt.mousewheel = (i) => {
  i.inputState.lastWheelEvent = Date.now();
};
hn.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
Lt.touchstart = (i, e) => {
  let t = i.inputState, n = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), n && (t.lastTouchX = n.clientX, t.lastTouchY = n.clientY), t.setSelectionOrigin("select.pointer");
};
Lt.touchmove = (i) => {
  i.inputState.setSelectionOrigin("select.pointer");
};
Lt.touchend = (i, e) => {
  i.inputState.touchActive = !1;
};
hn.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(Kh))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = xv(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new mv(i, e, t, n)), n && i.observer.ignore(() => {
      Eh(i.contentDOM);
      let o = i.root.activeElement;
      o && !o.contains(i.contentDOM) && o.blur();
    });
    let s = i.inputState.mouseSelection;
    if (s)
      return s.start(e), s.dragging === !1;
  } else
    i.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function Iu(i, e, t, n) {
  if (n == 1)
    return J.cursor(e, t);
  if (n == 2)
    return Jg(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), o = i.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < i.state.doc.length && l == o.to && l++, J.undirectionalRange(r, l);
  }
}
const wv = se.ie && se.ie_version <= 11;
let Pu = null, Nu = 0, Vu = 0;
function dd(i) {
  if (!wv)
    return i.detail;
  let e = Pu, t = Vu;
  return Pu = i, Vu = Date.now(), Nu = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Nu + 1) % 3 : 1;
}
function xv(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = dd(e), s = i.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = i.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Iu(i, a.pos, a.assoc, n);
      if (t.pos != a.pos && !r) {
        let d = Iu(i, t.pos, t.assoc, n), h = Math.min(d.from, c.from), f = Math.max(d.to, c.to);
        c = h < c.from ? J.range(h, f, c.assoc) : J.range(f, h, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && n == 1 && s.ranges.length > 1 && (u = Sv(s, a.pos)) ? u : l ? s.addRange(c) : J.create([c]);
    }
  };
}
function Sv(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return J.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
hn.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = J.undirectionalRange(o, r));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", Tr(i.state, ka, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
hn.dragend = (i) => (i.inputState.draggedContent = null, !1);
function Hu(i, e, t, n) {
  if (t = Tr(i.state, ba, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = i.inputState, r = n && o && vv(i, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = i.state.changes(r ? [r, l] : l);
  i.focus(), i.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), i.inputState.draggedContent = null;
}
hn.drop = (i, e) => {
  if (!e.dataTransfer)
    return !1;
  if (i.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), s = 0, o = () => {
      ++s == t.length && Hu(i, e, n.filter((r) => r != null).join(i.state.lineBreak), !1);
    };
    for (let r = 0; r < t.length; r++) {
      let l = new FileReader();
      l.onerror = o, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (n[r] = l.result), o();
      }, l.readAsText(t[r]);
    }
    return !0;
  } else {
    let n = e.dataTransfer.getData("Text");
    if (n)
      return Hu(i, e, n, !0), !0;
  }
  return !1;
};
hn.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = cd ? null : e.clipboardData;
  return t ? (hd(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (kv(i), !1);
};
function Cv(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function Mv(i) {
  let e = [], t = [], n = !1;
  for (let s of i.selection.ranges)
    s.empty || (e.push(i.sliceDoc(s.from, s.to)), t.push(s));
  if (!e.length) {
    let s = -1;
    for (let { from: o } of i.selection.ranges) {
      let r = i.doc.lineAt(o);
      r.number > s && (e.push(r.text), t.push({ from: r.from, to: Math.min(i.doc.length, r.to + 1) })), s = r.number;
    }
    n = !0;
  }
  return { text: Tr(i, ka, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let Ul = null;
hn.copy = hn.cut = (i, e) => {
  if (!Vs(i.contentDOM, i.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: s } = Mv(i.state);
  if (!t && !s)
    return !1;
  Ul = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = cd ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (Cv(i, t), !1);
};
const fd = /* @__PURE__ */ ys.define();
function pd(i, e) {
  let t = [];
  for (let n of i.facet(jh)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: fd.of(!0) }) : null;
}
function md(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = pd(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
Lt.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), md(i);
};
Lt.blur = (i) => {
  i.observer.clearSelectionRange(), md(i);
};
Lt.compositionstart = Lt.compositionupdate = (i) => {
  if (!i.observer.editContext && (i.inputState.compositionFirstChange == null && (i.inputState.compositionFirstChange = !0), i.inputState.composing < 0)) {
    let { main: e } = i.state.selection;
    !e.empty && i.lineBlockAt(e.from).from != i.lineBlockAt(e.to).from && i.dispatch({
      changes: i.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), i.inputState.composing = 0;
  }
};
Lt.compositionend = (i) => {
  i.observer.editContext || (i.inputState.composing = -1, i.inputState.compositionEndedAt = Date.now(), i.inputState.compositionPendingKey = !0, i.inputState.compositionPendingChange = i.observer.pendingRecords().length > 0, i.inputState.compositionFirstChange = null, se.chrome && se.android ? i.observer.flushSoon() : i.inputState.compositionPendingChange ? Promise.resolve().then(() => i.observer.flush()) : setTimeout(() => {
    i.inputState.composing < 0 && i.docView.hasComposition && i.update([]);
  }, 50));
};
Lt.contextmenu = (i) => {
  i.inputState.lastContextMenu = Date.now();
};
hn.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = i.posAtDOM(l.startContainer, l.startOffset), u = i.posAtDOM(l.endContainer, l.endOffset);
      return Ca(i, { from: a, to: u, insert: i.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (se.chrome && se.android && (s = ad.find((o) => o.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return se.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), se.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => Lt.compositionend(i, e), 20), !1;
};
const zu = /* @__PURE__ */ new Set();
function Av(i) {
  zu.has(i) || (zu.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Wu = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let us = !1;
function Fu() {
  us = !1;
}
class Tv {
  constructor(e) {
    this.lineWrapping = e, this.doc = Pe.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let n = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (n += Math.max(0, Math.ceil((t - e - n * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * n;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Wu.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      s < 0 ? n++ : this.heightSamples[Math.floor(s * 10)] || (t = !0, this.heightSamples[Math.floor(s * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, n, s, o, r) {
    let l = Wu.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = t, this.charWidth = n, this.textHeight = s, this.lineLength = o, a) {
      this.heightSamples = {};
      for (let u = 0; u < r.length; u++) {
        let c = r[u];
        c < 0 ? u++ : this.heightSamples[Math.floor(c * 10)] = !0;
      }
    }
    return a;
  }
}
class $v {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class rn {
  /**
  @internal
  */
  constructor(e, t, n, s, o) {
    this.from = e, this.length = t, this.top = n, this.height = s, this._content = o;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? yt.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof Ei ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new rn(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var je = /* @__PURE__ */ (function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
})(je || (je = {}));
const Ko = 1e-3;
class Dt {
  constructor(e, t, n = 2) {
    this.length = e, this.height = t, this.flags = n;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > Ko && (us = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, n) {
    return Dt.of(n);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, n, s) {
    let o = this, r = n.doc;
    for (let l = s.length - 1; l >= 0; l--) {
      let { fromA: a, toA: u, fromB: c, toB: d } = s[l], h = o.lineAt(a, je.ByPosNoHeight, n.setDoc(t), 0, 0), f = h.to >= u ? h : o.lineAt(u, je.ByPosNoHeight, n, 0, 0);
      for (d += f.to - u, u = f.to; l > 0 && h.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < h.from && (h = o.lineAt(a, je.ByPosNoHeight, n, 0, 0));
      c += h.from - a, a = h.from;
      let m = Ma.build(n.setDoc(r), e, c, d);
      o = rr(o, o.replace(a, u, m));
    }
    return o.updateHeight(n, 0);
  }
  static empty() {
    return new Ht(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, n = e.length, s = 0, o = 0;
    for (; ; )
      if (t == n)
        if (s > o * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), n += 1 + l.break, s -= l.size;
        } else if (o > s * 2) {
          let l = e[n];
          l.break ? e.splice(n, 1, l.left, null, l.right) : e.splice(n, 1, l.left, l.right), n += 2 + l.break, o -= l.size;
        } else
          break;
      else if (s < o) {
        let l = e[t++];
        l && (s += l.size);
      } else {
        let l = e[--n];
        l && (o += l.size);
      }
    let r = !1;
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, n++), new Lv(Dt.of(e.slice(0, t)), r, Dt.of(e.slice(n)));
  }
}
function rr(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (us = !0), e);
}
Dt.prototype.size = 1;
const Dv = /* @__PURE__ */ Xe.replace({});
class gd extends Dt {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new rn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new rn(s, 0, n, this.spaceAbove, Dv) : this.mainBlock(n, s);
  }
  lineAt(e, t, n, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, n, s, o).join(r) : r;
  }
  forEachLine(e, t, n, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, je.ByPos, n, s, o));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more && this.setMeasuredHeight(s), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class Ht extends gd {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new rn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let s = n[0];
    return n.length == 1 && (s instanceof Ht || s instanceof gt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof gt ? s = new Ht(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : Dt.of(n);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class gt extends Dt {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let n = e.doc.lineAt(t).number, s = e.doc.lineAt(t + this.length).number, o = s - n + 1, r, l = 0;
    if (e.lineWrapping) {
      let a = Math.min(this.height, e.lineHeight * o);
      r = a / o, this.length > o + 1 && (l = (this.height - a) / (this.length - o - 1));
    } else
      r = this.height / o;
    return { firstLine: n, lastLine: s, perLine: r, perChar: l };
  }
  blockAt(e, t, n, s) {
    let { firstLine: o, lastLine: r, perLine: l, perChar: a } = this.heightMetrics(t, s);
    if (t.lineWrapping) {
      let u = s + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - n) / this.height)) * this.length)), c = t.doc.lineAt(u), d = l + c.length * a, h = Math.max(n, e - d / 2);
      return new rn(c.from, c.length, h, d, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - n) / l))), { from: c, length: d } = t.doc.line(o + u);
      return new rn(c, d, n + l * u, l, 0);
    }
  }
  lineAt(e, t, n, s, o) {
    if (t == je.ByHeight)
      return this.blockAt(e, n, s, o);
    if (t == je.ByPosNoHeight) {
      let { from: f, to: m } = n.doc.lineAt(e);
      return new rn(f, m - f, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(n, o), u = n.doc.lineAt(e), c = l + u.length * a, d = u.number - r, h = s + l * d + a * (u.from - o - d);
    return new rn(u.from, u.length, Math.max(s, Math.min(h, s + this.height - c)), c, 0);
  }
  forEachLine(e, t, n, s, o, r) {
    e = Math.max(e, o), t = Math.min(t, o + this.length);
    let { firstLine: l, perLine: a, perChar: u } = this.heightMetrics(n, o);
    for (let c = e, d = s; c <= t; ) {
      let h = n.doc.lineAt(c);
      if (c == e) {
        let m = h.number - l;
        d += a * m + u * (e - o - m);
      }
      let f = a + u * h.length;
      r(new rn(h.from, h.length, d, f, 0)), d += f, c = h.to + 1;
    }
  }
  replace(e, t, n) {
    let s = this.length - t;
    if (s > 0) {
      let o = n[n.length - 1];
      o instanceof gt ? n[n.length - 1] = new gt(o.length + s) : n.push(null, new gt(s - 1));
    }
    if (e > 0) {
      let o = n[0];
      o instanceof gt ? n[0] = new gt(e + o.length) : n.unshift(new gt(e - 1), null);
    }
    return Dt.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new gt(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new gt(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new gt(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let d = s.heights[s.index++], h = 0;
        d < 0 && (h = -d, d = s.heights[s.index++]), a == -1 ? a = d : Math.abs(d - a) >= Ko && (a = -2);
        let f = new Ht(c, d, h);
        f.outdated = !1, r.push(f), l += c + 1;
      }
      l <= o && r.push(null, new gt(o - l).updateHeight(e, l));
      let u = Dt.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= Ko || Math.abs(a - this.heightMetrics(e, t).perLine) >= Ko) && (us = !0), rr(this, u);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Lv extends Dt {
  constructor(e, t, n) {
    super(e.length + (t ? 1 : 0) + n.length, e.height + n.height, (t ? 1 : 0) | (e.outdated || n.outdated ? 2 : 0)), this.left = e, this.right = n, this.size = e.size + n.size;
  }
  // Returns 1 if there is a line break between this.left and
  // this.right, 0 otherwise.
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, n, s) {
    let o = n + this.left.height;
    return e < o ? this.left.blockAt(e, t, n, s) : this.right.blockAt(e, t, o, s + this.left.length + this.break);
  }
  lineAt(e, t, n, s, o) {
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == je.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, n, s, o) : this.right.lineAt(e, t, n, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == je.ByPosNoHeight ? je.ByPosNoHeight : je.ByPos;
    return a ? u.join(this.right.lineAt(l, c, n, r, l)) : this.left.lineAt(l, c, n, s, o).join(u);
  }
  forEachLine(e, t, n, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, n, s, o, r), t >= a && this.right.forEachLine(e, t, n, l, a, r);
    else {
      let u = this.lineAt(a, je.ByPos, n, s, o);
      e < u.from && this.left.forEachLine(e, Math.min(t, u.from - 1), n, s, o, r), u.to >= e && u.from <= t && r(u), t > u.to && this.right.forEachLine(Math.max(e, u.to + 1), t, n, l, a, r);
    }
  }
  replace(e, t, n) {
    let s = this.left.length + this.break;
    if (t < s)
      return this.balanced(this.left.replace(e, t, n), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - s, t - s, n));
    let o = [];
    e > 0 && this.decomposeLeft(e, o);
    let r = o.length;
    for (let l of n)
      o.push(l);
    if (e > 0 && _u(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), _u(o, l);
    }
    return Dt.of(o);
  }
  decomposeLeft(e, t) {
    let n = this.left.length;
    if (e <= n)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (n++, e >= n && t.push(null)), e > n && this.right.decomposeLeft(e - n, t);
  }
  decomposeRight(e, t) {
    let n = this.left.length, s = n + this.break;
    if (e >= s)
      return this.right.decomposeRight(e - s, t);
    e < n && this.left.decomposeRight(e, t), this.break && e < s && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? Dt.of(this.break ? [e, null, t] : [e, t]) : (this.left = rr(this.left, e), this.right = rr(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, n, s) : o.updateHeight(e, t, n), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, n, s) : r.updateHeight(e, l, n), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function _u(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof gt && (n = i[e + 1]) instanceof gt && i.splice(e - 1, 3, new gt(t.length + 1 + n.length));
}
const Bv = 5;
class Ma {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof Ht ? s.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new Ht(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let s = n.widget ? n.widget.estimatedHeight : 0, o = n.widget ? n.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      n.block ? this.addBlock(new gd(r, s, n)) : (r || o || s >= Bv) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Ht(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new gt(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Ht)
      return e;
    let t = new Ht(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, n) {
    let s = this.ensureLine();
    s.length += n, s.collapsed += n, s.widgetHeight = Math.max(s.widgetHeight, e), s.breaks += t, this.writtenTo = this.pos = this.pos + n;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof Ht) && !this.isCovered ? this.nodes.push(new Ht(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let s of this.nodes)
      s instanceof Ht && s.updateHeight(this.oracle, n), n += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, s) {
    let o = new Ma(n, e);
    return Oe.spans(t, n, s, o, 0), o.finish(n);
  }
}
function Ov(i, e, t) {
  let n = new Ev();
  return Oe.compare(i, e, t, n, 0), n.changes;
}
class Ev {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && ts(e, t, this.changes, 5);
  }
}
function Rv(i, e) {
  let t = i.getBoundingClientRect(), n = i.ownerDocument, s = n.defaultView || window, o = Math.max(0, t.left), r = Math.min(s.innerWidth, t.right), l = Math.max(0, t.top), a = Math.min(s.innerHeight, t.bottom);
  for (let u = i.parentNode; u && u != n.body; )
    if (u.nodeType == 1) {
      let c = u, d = window.getComputedStyle(c);
      if ((c.scrollHeight > c.clientHeight || c.scrollWidth > c.clientWidth) && d.overflow != "visible") {
        let h = c.getBoundingClientRect();
        o = Math.max(o, h.left), r = Math.min(r, h.right), l = Math.max(l, h.top), a = Math.min(u == i.parentNode ? s.innerHeight : a, h.bottom);
      }
      u = d.position == "absolute" || d.position == "fixed" ? c.offsetParent : c.parentNode;
    } else if (u.nodeType == 11)
      u = u.host;
    else
      break;
  return {
    left: o - t.left,
    right: Math.max(o, r) - t.left,
    top: l - (t.top + e),
    bottom: Math.max(l, a) - (t.top + e)
  };
}
function Iv(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function Pv(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class el {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.size = n, this.displaySize = s;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let n = 0; n < e.length; n++) {
      let s = e[n], o = t[n];
      if (s.from != o.from || s.to != o.to || s.size != o.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return Xe.replace({
      widget: new Nv(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Nv extends io {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class Ku {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Uu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Ye.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(wa).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new Tv(n), this.stateDeco = Gu(t), this.heightMap = Dt.empty().applyChanges(this.stateDeco, Pe.empty, this.heightOracle.setDoc(t.doc), [new Jt(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = Xe.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let n = 0; n <= 1; n++) {
      let s = n ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new bo(o, r));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Uu : new Aa(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Os(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = Gu(this.state);
    let s = e.changedRanges, o = Jt.extendWithRanges(s, Ov(n, this.stateDeco, e ? e.changes : dt.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Fu(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || us) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Yh) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? Ye.RTL : Ye.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: V, scaleY: W } = Dh(t, l);
      (V > 5e-3 && Math.abs(this.scaleX - V) > 5e-3 || W > 5e-3 && Math.abs(this.scaleY - W) > 5e-3) && (this.scaleX = V, this.scaleY = W, u |= 16, r = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, h = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != h) && (this.paddingTop = d, this.paddingBottom = h, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let f = Lh(this.view.contentDOM, !1).y;
    f != this.scrollParent && (this.scrollParent = f, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let m = this.getScrollOffset();
    this.scrollOffset != m && (this.scrollAnchorHeight = -1, this.scrollOffset = m), this.scrolledToBottom = Rh(this.scrollParent || e.win);
    let k = (this.printing ? Pv : Rv)(t, this.paddingTop), b = k.top - this.pixelViewport.top, M = k.bottom - this.pixelViewport.bottom;
    this.pixelViewport = k;
    let $ = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if ($ != this.inView && (this.inView = $, $ && (a = !0)), !this.inView && !this.scrollTarget && !Iv(e.dom))
      return 0;
    let L = l.width;
    if ((this.contentDOMWidth != L || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let V = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(V) && (r = !0), r || s.lineWrapping && Math.abs(L - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: W, charWidth: I, textHeight: K } = e.docView.measureTextSize();
        r = W > 0 && s.refresh(o, W, I, K, Math.max(5, L / I), V), r && (e.docView.minWidth = 0, u |= 16);
      }
      b > 0 && M > 0 ? c = Math.max(b, M) : b < 0 && M < 0 && (c = Math.min(b, M)), Fu();
      for (let W of this.viewports) {
        let I = W.from == this.viewport.from ? V : e.docView.measureVisibleLineHeights(W);
        this.heightMap = (r ? Dt.empty().applyChanges(this.stateDeco, Pe.empty, this.heightOracle, [new Jt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new $v(W.from, I));
      }
      us && (u |= 2);
    }
    let H = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return H && (u & 2 && (u |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), u |= this.updateForViewport()), (u & 2 || H) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(r ? [] : this.lineGaps, e)), u |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), u;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new bo(s.lineAt(r - n * 1e3, je.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - n) * 1e3, je.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = s.lineAt(u, je.ByPos, o, 0, 0), h;
        t.y == "center" ? h = (d.top + d.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? h = d.top : h = d.bottom - c, a = new bo(s.lineAt(h - 1e3 / 2, je.ByHeight, o, 0, 0).from, s.lineAt(h + c + 1e3 / 2, je.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new bo(this.heightMap.lineAt(n, je.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, je.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, n = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, je.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, je.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
    return (e == 0 || s <= r - Math.max(10, Math.min(
      -n,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || o >= l + Math.max(10, Math.min(
      n,
      250
      /* VP.MaxCoverMargin */
    ))) && s > r - 2 * 1e3 && o < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let n = [];
    for (let s of e)
      t.touchesRange(s.from, s.to) || n.push(new el(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
    return n;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let n = this.heightOracle.lineWrapping, s = n ? 1e4 : 2e3, o = s >> 1, r = s << 1;
    if (this.defaultTextDirection != Ye.LTR && !n)
      return [];
    let l = [], a = (c, d, h, f) => {
      if (d - c < o)
        return;
      let m = this.state.selection.main, k = [m.from];
      m.empty || k.push(m.to);
      for (let M of k)
        if (M > c && M < d) {
          a(c, M - 10, h, f), a(M + 10, d, h, f);
          return;
        }
      let b = Hv(e, (M) => M.from >= h.from && M.to <= h.to && Math.abs(M.from - c) < o && Math.abs(M.to - d) < o && !k.some(($) => M.from < $ && M.to > $));
      if (!b) {
        if (d < h.to && t && n && t.visibleRanges.some((L) => L.from <= d && L.to >= d)) {
          let L = t.moveToLineBoundary(J.cursor(d), !1, !0).head;
          L > c && (d = L);
        }
        let M = this.gapSize(h, c, d, f), $ = n || M < 2e6 ? M : 2e6;
        b = new el(c, d, M, $);
      }
      l.push(b);
    }, u = (c) => {
      if (c.length < r || c.type != yt.Text)
        return;
      let d = Vv(c.from, c.to, this.stateDeco);
      if (d.total < r)
        return;
      let h = this.scrollTarget ? this.scrollTarget.range.head : null, f, m;
      if (n) {
        let k = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, b, M;
        if (h != null) {
          let $ = wo(d, h), L = ((this.visibleBottom - this.visibleTop) / 2 + k) / c.height;
          b = $ - L, M = $ + L;
        } else
          b = (this.visibleTop - c.top - k) / c.height, M = (this.visibleBottom - c.top + k) / c.height;
        f = ko(d, b), m = ko(d, M);
      } else {
        let k = d.total * this.heightOracle.charWidth, b = s * this.heightOracle.charWidth, M = 0;
        if (k > 2e6)
          for (let W of e)
            W.from >= c.from && W.from < c.to && W.size != W.displaySize && W.from * this.heightOracle.charWidth + M < this.pixelViewport.left && (M = W.size - W.displaySize);
        let $ = this.pixelViewport.left + M, L = this.pixelViewport.right + M, H, V;
        if (h != null) {
          let W = wo(d, h), I = ((L - $) / 2 + b) / k;
          H = W - I, V = W + I;
        } else
          H = ($ - b) / k, V = (L + b) / k;
        f = ko(d, H), m = ko(d, V);
      }
      f > c.from && a(c.from, f, c, d), m < c.to && a(m, c.to, c, d);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, n, s) {
    let o = wo(s, n) - wo(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    el.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Xe.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    Oe.spans(t, this.viewport.from, this.viewport.to, {
      span(o, r) {
        n.push({ from: o, to: r });
      },
      point() {
      }
    }, 20);
    let s = 0;
    if (n.length != this.visibleRanges.length)
      s = 12;
    else
      for (let o = 0; o < n.length && !(s & 8); o++) {
        let r = this.visibleRanges[o], l = n[o];
        (r.from != l.from || r.to != l.to) && (s |= 4, e && e.mapPos(r.from, -1) == l.from && e.mapPos(r.to, 1) == l.to || (s |= 8));
      }
    return this.visibleRanges = n, s;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Os(this.heightMap.lineAt(e, je.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Os(this.heightMap.lineAt(this.scaler.fromDOM(e), je.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Os(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class bo {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Vv(i, e, t) {
  let n = [], s = i, o = 0;
  return Oe.spans(t, i, e, {
    span() {
    },
    point(r, l) {
      r > s && (n.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), o += e - s), { total: o, ranges: n };
}
function ko({ total: i, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let n = Math.floor(i * t);
  for (let s = 0; ; s++) {
    let { from: o, to: r } = e[s], l = r - o;
    if (n <= l)
      return o + n;
    n -= l;
  }
}
function wo(i, e) {
  let t = 0;
  for (let { from: n, to: s } of i.ranges) {
    if (e <= s) {
      t += e - n;
      break;
    }
    t += s - n;
  }
  return t / i.total;
}
function Hv(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const Uu = {
  toDOM(i) {
    return i;
  },
  fromDOM(i) {
    return i;
  },
  scale: 1,
  eq(i) {
    return i == this;
  }
};
function Gu(i) {
  let e = i.facet(Cr).filter((n) => typeof n != "function"), t = i.facet(xa).filter((n) => typeof n != "function");
  return t.length && e.push(Oe.join(t)), e;
}
class Aa {
  constructor(e, t, n) {
    let s = 0, o = 0, r = 0;
    this.viewports = n.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, je.ByPos, e, 0, 0).top, c = t.lineAt(a, je.ByPos, e, 0, 0).bottom;
      return s += c - u, { from: l, to: a, top: u, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - s) / (t.height - s);
    for (let l of this.viewports)
      l.domTop = r + (l.top - o) * this.scale, r = l.domBottom = l.domTop + (l.bottom - l.top), o = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, n = 0, s = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.top)
        return s + (e - n) * this.scale;
      if (e <= o.bottom)
        return o.domTop + (e - o.top);
      n = o.bottom, s = o.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, n = 0, s = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.domTop)
        return n + (e - s) / this.scale;
      if (e <= o.domBottom)
        return o.top + (e - o.domTop);
      n = o.bottom, s = o.domBottom;
    }
  }
  eq(e) {
    return e instanceof Aa ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Os(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new rn(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Os(s, e)) : i._content);
}
const xo = /* @__PURE__ */ de.define({ combine: (i) => i.join(" ") }), Gl = /* @__PURE__ */ de.define({ combine: (i) => i.indexOf(!0) > -1 }), jl = /* @__PURE__ */ li.newName(), vd = /* @__PURE__ */ li.newName(), yd = /* @__PURE__ */ li.newName(), bd = { "&light": "." + vd, "&dark": "." + yd };
function ql(i, e, t) {
  return new li(e, {
    finish(n) {
      return /&/.test(n) ? n.replace(/&\w*/, (s) => {
        if (s == "&")
          return i;
        if (!t || !t[s])
          throw new RangeError(`Unsupported selector: ${s}`);
        return t[s];
      }) : i + " " + n;
    }
  });
}
const zv = /* @__PURE__ */ ql("." + jl, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // Issue #456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    userSelect: "none",
    // #1708
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-selectionHandle": {
    backgroundColor: "currentColor",
    width: "1.5px"
  },
  ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
    content: '""',
    backgroundColor: "inherit",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    position: "absolute",
    left: "-3.25px"
  },
  ".cm-selectionHandle-start::before": { top: "-8px" },
  ".cm-selectionHandle-end::before": { bottom: "-8px" },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  ".cm-panels-top": { top: "0" },
  ".cm-panels-bottom": { bottom: "0" },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    background: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",
    backgroundSize: ".4em",
    backgroundPosition: "calc(min(50%, 0px)) center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, bd), Wv = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, tl = se.ie && se.ie_version <= 11;
class Fv {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new vg(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (se.ie && se.ie_version <= 11 || se.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && se.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(se.chrome && se.chrome_version < 126) && (this.editContext = new Kv(e), e.state.facet(zn) && (e.contentDOM.editContext = this.editContext.editContext)), tl && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, n) => t != e[n]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: n } = this, s = this.selectionRange;
    if (n.state.facet(zn) ? n.root.activeElement != this.dom : !Vs(this.dom, s))
      return;
    let o = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (se.ie && se.ie_version <= 11 || se.android && se.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Hs(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = Xs(e.root);
    if (!t)
      return !1;
    let n = se.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && _v(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = Vs(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && bg(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let n = this.dom; n; )
      if (n.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == n ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(n), n = n.assignedSlot || n.parentNode;
      else if (n.nodeType == 11)
        n = n.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let n of this.scrollTargets)
        n.removeEventListener("scroll", this.onScroll);
      for (let n of this.scrollTargets = t)
        n.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, Wv), tl && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), tl && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var n;
    if (!this.delayedAndroidKey) {
      let s = () => {
        let o = this.delayedAndroidKey;
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && ns(this.dom, o.key, o.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(s);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((n = this.delayedAndroidKey) === null || n === void 0) && n.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, n = -1, s = !1;
    for (let o of e) {
      let r = this.readMutation(o);
      r && (r.typeOver && (s = !0), t == -1 ? { from: t, to: n } = r : (t = Math.min(r.from, t), n = Math.max(r.to, n)));
    }
    return { from: t, to: n, typeOver: s };
  }
  readChange() {
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && Vs(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new rv(this.view, e, t, n);
    return this.view.docView.domChanged = { newSel: o.newSel ? o.newSel.main : null }, o;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.readChange();
    if (!t)
      return this.view.requestMeasure(), !1;
    let n = this.view.state, s = rd(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !or(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = ju(t, e.previousSibling || e.target.previousSibling, -1), s = ju(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: n ? t.posAfter(n) : t.posAtStart,
        to: s ? t.posBefore(s) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(zn) != e.state.facet(zn) && (e.view.contentDOM.editContext = e.state.facet(zn) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function ju(i, e, t) {
  for (; e; ) {
    let n = it.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function qu(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, o = e.endOffset, r = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Hs(r.node, r.offset, s, o) && ([t, n, s, o] = [s, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o };
}
function _v(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return qu(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? qu(i, t) : null;
}
class Kv {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (n) => {
      let s = e.state.selection.main, { anchor: o, head: r } = s, l = this.toEditorPos(n.updateRangeStart), a = this.toEditorPos(n.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: n.updateRangeStart, editorBase: l, drifted: !1 });
      let u = a - l > n.text.length;
      l == this.from && o < this.from ? l = o : a == this.to && o > this.to && (a = o);
      let c = ld(e.state.sliceDoc(l, a), n.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let h = J.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        or(h, s) || e.dispatch({ selection: h, userEvent: "select" });
        return;
      }
      let d = {
        from: c.from + l,
        to: c.toA + l,
        insert: Pe.of(n.text.slice(c.from, c.toB).split(`
`))
      };
      if ((se.mac || se.android) && d.from == r - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (d = { from: l, to: a, insert: Pe.of([n.text.replace(".", " ")]) }), this.pendingContextChange = d, !e.state.readOnly) {
        let h = this.to - this.from + (d.to - d.from + d.insert.length);
        Ca(e, d, J.single(this.toEditorPos(n.selectionStart, h), this.toEditorPos(n.selectionEnd, h)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), d.from < d.to && !d.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, n.updateRangeStart - 1), Math.min(t.text.length, n.updateRangeStart + 1))) && this.handlers.compositionend(n);
    }, this.handlers.characterboundsupdate = (n) => {
      let s = [], o = null;
      for (let r = this.toEditorPos(n.rangeStart), l = this.toEditorPos(n.rangeEnd); r < l; r++) {
        let a = e.coordsForChar(r);
        o = a && new DOMRect(a.left, a.top, a.right - a.left, a.bottom - a.top) || o || new DOMRect(), s.push(o);
      }
      t.updateCharacterBounds(n.rangeStart, s);
    }, this.handlers.textformatupdate = (n) => {
      let s = [];
      for (let o of n.getTextFormats()) {
        let r = o.underlineStyle, l = o.underlineThickness;
        if (!/none/i.test(r) && !/none/i.test(l)) {
          let a = this.toEditorPos(o.rangeStart), u = this.toEditorPos(o.rangeEnd);
          if (a < u) {
            let c = `text-decoration: underline ${/^[a-z]/.test(r) ? r + " " : r == "Dashed" ? "dashed " : r == "Squiggle" ? "wavy " : ""}${/thin/i.test(l) ? 1 : 2}px`;
            s.push(Xe.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: Jh.of(Xe.set(s)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: n } = this.composing;
        this.composing = null, n && this.reset(e.state);
      }
    };
    for (let n in this.handlers)
      t.addEventListener(n, this.handlers[n]);
    this.measureReq = { read: (n) => {
      let s = Xs(n.root);
      s && s.rangeCount && this.editContext.updateSelectionBounds(s.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, n = !1, s = this.pendingContextChange;
    return e.changes.iterChanges((o, r, l, a, u) => {
      if (n)
        return;
      let c = u.length - (r - o);
      if (s && r >= s.to)
        if (s.from == o && s.to == r && s.insert.eq(u)) {
          s = this.pendingContextChange = null, t += c, this.to += c;
          return;
        } else
          s = null, this.revertPending(e.state);
      if (o += t, r += t, r <= this.from)
        this.from += c, this.to += c;
      else if (o < this.to) {
        if (o < this.from || r > this.to || this.to - this.from + u.length > 3e4) {
          n = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(o), this.toContextPos(r), u.toString()), this.to += c;
      }
      t += c;
    }), s && !n && this.revertPending(e.state), !n;
  }
  update(e) {
    let t = this.pendingContextChange, n = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(n.from, n.to) && e.transactions.some((s) => !s.isUserEvent("input.type") && s.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  reset(e) {
    this.resetRange(e), this.editContext.updateText(0, this.editContext.text.length, e.doc.sliceString(this.from, this.to)), this.setSelection(e);
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, n = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), s = this.toContextPos(t.head);
    (this.editContext.selectionStart != n || this.editContext.selectionEnd != s) && this.editContext.updateSelection(n, s);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let n = this.composing;
    return n && n.drifted ? n.editorBase + (e - n.contextBase) : e + this.from;
  }
  toContextPos(e) {
    let t = this.composing;
    return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class me {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    var t;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.clearAnnouncement = -1, this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: n } = e;
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((o) => n(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || yg(e.parent) || document, this.viewState = new Ku(this, e.state || ze.create(e)), e.scrollTo && e.scrollTo.is(go) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(qi).map((s) => new Yr(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Fv(this), this.inputState = new cv(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Bu(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof St ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, n = !1, s, o = this.state;
    for (let h of e) {
      if (h.startState != o)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      o = h.state;
    }
    if (this.destroyed) {
      this.viewState.state = o;
      return;
    }
    let r = this.hasFocus, l = 0, a = null;
    e.some((h) => h.annotation(fd)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = pd(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(ze.phrases) != this.state.facet(ze.phrases))
      return this.setState(o);
    s = nr.create(this, o, e), s.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let h of e) {
        if (d && (d = d.map(h.changes)), h.scrollIntoView) {
          let { main: f } = h.state.selection, { x: m, y: k } = this.state.facet(me.cursorScrollMargin);
          d = new is(f.empty ? f : J.cursor(f.head, f.head > f.anchor ? -1 : 1), "nearest", "nearest", k, m);
        }
        for (let f of h.effects)
          f.is(go) && (d = f.value.clip(this.state));
      }
      this.viewState.update(s, d), this.bidiCache = lr.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Bs) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((h) => h.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(xo) != s.state.facet(xo) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let h of this.state.facet(Wl))
        try {
          h(s);
        } catch (f) {
          an(this.state, f, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !rd(this, c) && u.force && ns(this.contentDOM, u.key, u.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let n of this.plugins)
        n.destroy(this);
      this.viewState = new Ku(this, e), this.plugins = e.facet(qi).map((n) => new Yr(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new Bu(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(qi), n = e.state.facet(qi);
    if (t != n) {
      let s = [];
      for (let o of n) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new Yr(o));
        else {
          let l = this.plugins[r];
          l.mustUpdate = e, s.push(l);
        }
      }
      for (let o of this.plugins)
        o.mustUpdate != e && o.destroy(this);
      this.plugins = s, this.pluginMap.clear();
    } else
      for (let s of this.plugins)
        s.mustUpdate = e;
    for (let s = 0; s < this.plugins.length; s++)
      this.plugins[s].update(this);
    t != n && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (n) {
          an(this.state, n, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, n = this.viewState.scrollParent, s = this.viewState.getScrollOffset(), { scrollAnchorPos: o, scrollAnchorHeight: r, scaleY: l } = this.viewState;
    Math.abs(s - this.viewState.scrollOffset) > 1 && (r = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let a = 0; ; a++) {
        if (r < 0) {
          if (Rh(n || this.win))
            o = -1, r = this.viewState.heightMap.height / this.viewState.scaleY;
          else {
            let m = this.viewState.scrollAnchorAt(s);
            o = m.from, r = m.top;
          }
          l = this.viewState.scaleY;
        }
        this.updateState = 1;
        let u = this.viewState.measure();
        if (!u && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (a > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let c = [];
        u & 4 || ([this.measureRequests, c] = [c, this.measureRequests]);
        let d = c.map((m) => {
          try {
            return m.read(this);
          } catch (k) {
            return an(this.state, k), Yu;
          }
        }), h = nr.create(this, this.state, []), f = !1;
        h.flags |= u, t ? t.flags |= u : t = h, this.updateState = 2, h.empty || (this.updatePlugins(h), this.inputState.update(h), this.updateAttrs(), f = this.docView.update(h), f && this.docViewUpdate());
        for (let m = 0; m < c.length; m++)
          if (d[m] != Yu)
            try {
              let k = c[m];
              k.write && k.write(d[m], this);
            } catch (k) {
              an(this.state, k);
            }
        if (f && this.docView.updateSelection(!0), !h.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, r = -1;
              continue;
            } else {
              let k = (o < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(o).top) / this.viewState.scaleY - r / l;
              if ((k > 1 || k < -1) && !(se.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (n == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                s = s + k, n ? o < 0 ? n.scrollTop = n.scrollHeight : n.scrollTop += k : this.win.scrollBy(0, k), r = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let a of this.state.facet(Wl))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return jl + " " + (this.state.facet(Gl) ? yd : vd) + " " + this.state.facet(xo);
  }
  updateAttrs() {
    let e = Xu(this, Zh, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(zn) ? "true" : "false",
      class: "cm-content",
      style: `${se.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), Xu(this, wa, t);
    let n = this.observer.ignore(() => {
      let s = Mu(this.contentDOM, this.contentAttrs, t), o = Mu(this.dom, this.editorAttrs, e);
      return s || o;
    });
    return this.editorAttrs = e, this.contentAttrs = t, n;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let n of e)
      for (let s of n.effects)
        if (s.is(me.announce)) {
          t && (this.announceDOM.textContent = "", this.win.clearTimeout(this.clearAnnouncement), this.clearAnnouncement = this.win.setTimeout(() => {
            this.announceDOM.textContent = " ";
          }, 200), t = !1);
          let o = this.announceDOM.appendChild(document.createElement("div"));
          o.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Bs);
    let e = this.state.facet(me.cspNonce);
    li.mount(this.root, this.styleModules.concat(zv).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((n) => n.plugin == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, n) {
    return Qr(this, e, Ou(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return Qr(this, e, Ou(this, e, t, (n) => ev(this, e.head, n)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? J.cursor(e.to, 1) : J.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, n = !0) {
    return Qg(this, e, t, n);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, n) {
    return Qr(this, e, tv(this, e, t, n));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e, t = 1) {
    return this.docView.domAtPos(e, t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    this.readMeasured();
    let n = Kl(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Kl(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let n = this.state.doc.lineAt(e), s = this.bidiSpans(n), o = s[Ln.find(s, e - n.from, -1, t)];
    return n.length && (e == n.from && t < 0 || e == n.to && t > 0) && o.dir != this.textDirectionAt(n.from) && (e == n.to ? (e = n.from + o.from, t = 1) : (e = n.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == Ye.RTL);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet(qh) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > Uv)
      return zh(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || Hh(o.isolates, n = $u(this, e))))
        return o.order;
    n || (n = $u(this, e));
    let s = Ag(e.text, t, n);
    return this.bidiCache.push(new lr(e.from, e.to, t, n, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || se.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Eh(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.win.clearTimeout(this.clearAnnouncement), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    var n, s, o, r;
    return go.of(new is(typeof e == "number" ? J.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, n = this.viewState.scrollAnchorAt(e);
    return go.of(new is(J.cursor(n.from), "start", "start", n.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return zt.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return zt.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let n = li.newName(), s = [xo.of(n), Bs.of(ql(`.${n}`, e))];
    return t && t.dark && s.push(Gl.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return br.lowest(Bs.of(ql("." + jl, e, bd)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), s = n && it.get(n) || it.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
me.styleModule = Bs;
me.inputHandler = Gh;
me.clipboardInputFilter = ba;
me.clipboardOutputFilter = ka;
me.scrollHandler = Xh;
me.focusChangeEffect = jh;
me.perLineTextDirection = qh;
me.exceptionSink = Uh;
me.updateListener = Wl;
me.editable = zn;
me.mouseSelectionStyle = Kh;
me.dragMovesSelection = _h;
me.clickAddsSelectionRange = Fh;
me.decorations = Cr;
me.blockWrappers = Qh;
me.outerDecorations = xa;
me.atomicRanges = ro;
me.bidiIsolatedRanges = ed;
me.cursorScrollMargin = /* @__PURE__ */ de.define({
  combine: (i) => {
    let e = 5, t = 5;
    for (let n of i)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
me.scrollMargins = td;
me.darkTheme = Gl;
me.cspNonce = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : "" });
me.contentAttributes = wa;
me.editorAttributes = Zh;
me.lineWrapping = /* @__PURE__ */ me.contentAttributes.of({ class: "cm-lineWrapping" });
me.announce = /* @__PURE__ */ qe.define();
const Uv = 4096, Yu = {};
class lr {
  constructor(e, t, n, s, o, r) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : Ye.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && n.push(new lr(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return n;
  }
}
function Xu(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let o = n[s], r = typeof o == "function" ? o(i) : o;
    r && ga(r, t);
  }
  return t;
}
const Gv = se.mac ? "mac" : se.windows ? "win" : se.linux ? "linux" : "key";
function jv(i, e) {
  const t = i.split(/-(?!$)/);
  let n = t[t.length - 1];
  n == "Space" && (n = " ");
  let s, o, r, l;
  for (let a = 0; a < t.length - 1; ++a) {
    const u = t[a];
    if (/^(cmd|meta|m)$/i.test(u))
      l = !0;
    else if (/^a(lt)?$/i.test(u))
      s = !0;
    else if (/^(c|ctrl|control)$/i.test(u))
      o = !0;
    else if (/^s(hift)?$/i.test(u))
      r = !0;
    else if (/^mod$/i.test(u))
      e == "mac" ? l = !0 : o = !0;
    else
      throw new Error("Unrecognized modifier name: " + u);
  }
  return s && (n = "Alt-" + n), o && (n = "Ctrl-" + n), l && (n = "Meta-" + n), r && (n = "Shift-" + n), n;
}
function So(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const qv = /* @__PURE__ */ br.default(/* @__PURE__ */ me.domEventHandlers({
  keydown(i, e) {
    return Zv(Yv(e.state), i, e, "editor");
  }
})), kd = /* @__PURE__ */ de.define({ enables: qv }), Ju = /* @__PURE__ */ new WeakMap();
function Yv(i) {
  let e = i.facet(kd), t = Ju.get(e);
  return t || Ju.set(e, t = Jv(e.reduce((n, s) => n.concat(s), []))), t;
}
let ni = null;
const Xv = 4e3;
function Jv(i, e = Gv) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = n[r];
    if (a == null)
      n[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var d, h;
    let f = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), m = l.split(/ (?!$)/).map((M) => jv(M, e));
    for (let M = 1; M < m.length; M++) {
      let $ = m.slice(0, M).join(" ");
      s($, !0), f[$] || (f[$] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(L) => {
          let H = ni = { view: L, prefix: $, scope: r };
          return setTimeout(() => {
            ni == H && (ni = null);
          }, Xv), !0;
        }]
      });
    }
    let k = m.join(" ");
    s(k, !1);
    let b = f[k] || (f[k] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((h = (d = f._any) === null || d === void 0 ? void 0 : d.run) === null || h === void 0 ? void 0 : h.slice()) || []
    });
    a && b.run.push(a), u && (b.preventDefault = !0), c && (b.stopPropagation = !0);
  };
  for (let r of i) {
    let l = r.scope ? r.scope.split(" ") : ["editor"];
    if (r.any)
      for (let u of l) {
        let c = t[u] || (t[u] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: d } = r;
        for (let h in c)
          c[h].run.push((f) => d(f, Yl));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Yl = null;
function Zv(i, e, t, n) {
  Yl = e;
  let s = hg(e), o = jm(s, 0), r = qm(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  ni && ni.view == t && ni.scope == n && (l = ni.prefix + " ", ud.indexOf(e.keyCode) < 0 && (u = !0, ni = null));
  let d = /* @__PURE__ */ new Set(), h = (b) => {
    if (b) {
      for (let M of b.run)
        if (!d.has(M) && (d.add(M), M(t)))
          return b.stopPropagation && (c = !0), !0;
      b.preventDefault && (b.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, f = i[n], m, k;
  return f && (h(f[l + So(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(se.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(se.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (m = ai[e.keyCode]) && m != s ? (h(f[l + So(m, e, !0)]) || e.shiftKey && (k = qs[e.keyCode]) != s && k != m && h(f[l + So(k, e, !1)])) && (a = !0) : r && e.shiftKey && h(f[l + So(s, e, !0)]) && (a = !0), !a && h(f._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Yl = null, a;
}
class Li {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(e, t, n, s, o) {
    this.className = e, this.left = t, this.top = n, this.width = s, this.height = o;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  update(e, t) {
    return t.className != this.className ? !1 : (this.adjust(e), !0);
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", this.width != null && (e.style.width = this.width + "px"), e.style.height = this.height + "px";
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.width == e.width && this.height == e.height && this.className == e.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(e, t, n) {
    if (n.empty) {
      let s = e.coordsAtPos(n.head, n.assoc || 1);
      if (!s)
        return [];
      let o = wd(e);
      return [new Li(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Qv(e, t, n);
  }
}
function wd(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == Ye.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function Zu(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let o = i.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = i.posAtCoords({ x: o.left + 1, y: r }), a = i.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? n : { from: Math.max(n.from, Math.min(l, a)), to: Math.min(n.to, Math.max(l, a)) };
}
function Qv(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), o = i.textDirection == Ye.LTR, r = i.contentDOM, l = r.getBoundingClientRect(), a = wd(i), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), d = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), h = l.right - (c ? parseInt(c.paddingRight) : 0), f = _l(i, n, 1), m = _l(i, s, -1), k = f.type == yt.Text ? f : null, b = m.type == yt.Text ? m : null;
  if (k && (i.lineWrapping || f.widgetLineBreaks) && (k = Zu(i, n, 1, k)), b && (i.lineWrapping || m.widgetLineBreaks) && (b = Zu(i, s, -1, b)), k && b && k.from == b.from && k.to == b.to)
    return $(L(t.from, t.to, k));
  {
    let V = k ? L(t.from, null, k) : H(f, !1), W = b ? L(null, t.to, b) : H(m, !0), I = [];
    return (k || f).to < (b || m).from - (k && b ? 1 : 0) || f.widgetLineBreaks > 1 && V.bottom + i.defaultLineHeight / 2 < W.top ? I.push(M(d, V.bottom, h, W.top)) : V.bottom < W.top && i.elementAtHeight((V.bottom + W.top) / 2).type == yt.Text && (V.bottom = W.top = (V.bottom + W.top) / 2), $(V).concat(I).concat($(W));
  }
  function M(V, W, I, K) {
    return new Li(e, V - a.left, W - a.top, Math.max(0, I - V), K - W);
  }
  function $({ top: V, bottom: W, horizontal: I }) {
    let K = [];
    for (let R = 0; R < I.length; R += 2)
      K.push(M(I[R], V, I[R + 1], W));
    return K;
  }
  function L(V, W, I) {
    let K = 1e9, R = -1e9, z = [];
    function N(fe, pe, te, ie, $e) {
      let be = i.coordsAtPos(fe, fe == I.to ? -2 : 2), Me = i.coordsAtPos(te, te == I.from ? 2 : -2);
      !be || !Me || (K = Math.min(be.top, Me.top, K), R = Math.max(be.bottom, Me.bottom, R), $e == Ye.LTR ? z.push(o && pe ? d : be.left, o && ie ? h : Me.right) : z.push(!o && ie ? d : Me.left, !o && pe ? h : be.right));
    }
    let A = V ?? I.from, F = W ?? I.to;
    for (let fe of i.visibleRanges)
      if (fe.to > A && fe.from < F)
        for (let pe = Math.max(fe.from, A), te = Math.min(fe.to, F); ; ) {
          let ie = i.state.doc.lineAt(pe);
          for (let $e of i.bidiSpans(ie)) {
            let be = $e.from + ie.from, Me = $e.to + ie.from;
            if (be >= te)
              break;
            Me > pe && N(Math.max(be, pe), V == null && be <= A, Math.min(Me, te), W == null && Me >= F, $e.dir);
          }
          if (pe = ie.to + 1, pe >= te)
            break;
        }
    return z.length == 0 && N(A, V == null, F, W == null, i.textDirection), { top: K, bottom: R, horizontal: z };
  }
  function H(V, W) {
    let I = l.top + (W ? V.top : V.bottom);
    return { top: I, bottom: I, horizontal: [] };
  }
}
function ey(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class ty {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(Uo) != e.state.facet(Uo) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(Uo);
    for (; t < n.length && n[t] != this.layer; )
      t++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - t);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX: e, scaleY: t } = this.view;
    (e != this.scaleX || t != this.scaleY) && (this.scaleX = e, this.scaleY = t, this.dom.style.transform = `scale(${1 / e}, ${1 / t})`);
  }
  draw(e) {
    if (e.length != this.drawn.length || e.some((t, n) => !ey(t, this.drawn[n]))) {
      let t = this.dom.firstChild, n = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[n].constructor && s.update(t, this.drawn[n]) ? (t = t.nextSibling, n++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, se.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const Uo = /* @__PURE__ */ de.define();
function xd(i) {
  return [
    zt.define((e) => new ty(e, i)),
    Uo.of(i)
  ];
}
const cs = /* @__PURE__ */ de.define({
  combine(i) {
    return wr(i, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function ny(i = {}) {
  return [
    cs.of(i),
    iy,
    sy,
    ry,
    Yh.of(!0)
  ];
}
function Sd(i) {
  return i.startState.facet(cs) != i.state.facet(cs);
}
const iy = /* @__PURE__ */ xd({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(cs), n = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && se.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : J.cursor(s.head, s.assoc);
        for (let a of Li.forRange(i, r, l))
          n.push(a);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = Sd(i);
    return t && Qu(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    Qu(e.state, i);
  },
  class: "cm-cursorLayer"
});
function Qu(i, e) {
  e.style.animationDuration = i.facet(cs).cursorBlinkRate + "ms";
}
const sy = /* @__PURE__ */ xd({
  above: !1,
  markers(i) {
    let e = [], { main: t, ranges: n } = i.state.selection;
    for (let s of n)
      if (!s.empty)
        for (let o of Li.forRange(i, "cm-selectionBackground", s))
          e.push(o);
    if (se.ios && !t.empty && i.state.facet(cs).iosSelectionHandles) {
      for (let s of Li.forRange(i, "cm-selectionHandle cm-selectionHandle-start", J.cursor(t.from, 1)))
        e.push(s);
      for (let s of Li.forRange(i, "cm-selectionHandle cm-selectionHandle-end", J.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || Sd(i);
  },
  class: "cm-selectionLayer"
}), oy = se.gecko && se.gecko_version == 153 ? "#ffffff01" : "transparent", ry = /* @__PURE__ */ br.highest(/* @__PURE__ */ me.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${oy} !important` },
    caretColor: "transparent !important"
  },
  ".cm-content": {
    caretColor: "transparent !important",
    "& :focus": {
      caretColor: "initial !important",
      "&::selection, & ::selection": {
        backgroundColor: "Highlight !important"
      }
    }
  }
}));
function ly() {
  return uy;
}
const ay = /* @__PURE__ */ Xe.line({ class: "cm-activeLine" }), uy = /* @__PURE__ */ zt.fromClass(class {
  constructor(i) {
    this.decorations = this.getDeco(i);
  }
  update(i) {
    (i.docChanged || i.selectionSet) && (this.decorations = this.getDeco(i.view));
  }
  getDeco(i) {
    let e = -1, t = [];
    for (let n of i.state.selection.ranges) {
      let s = i.lineBlockAt(n.head);
      s.from > e && (t.push(ay.range(s.from)), e = s.from);
    }
    return Xe.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), Co = "-10000px";
class Cd {
  constructor(e, t, n, s) {
    this.facet = t, this.createTooltipView = n, this.removeTooltipView = s, this.input = e.state.facet(t), this.tooltips = this.input.filter((r) => r);
    let o = null;
    this.tooltipViews = this.tooltips.map((r) => o = n(r, o));
  }
  update(e, t) {
    var n;
    let s = e.state.facet(this.facet), o = s.filter((a) => a);
    if (s === this.input) {
      for (let a of this.tooltipViews)
        a.update && a.update(e);
      return !1;
    }
    let r = [], l = t ? [] : null;
    for (let a = 0; a < o.length; a++) {
      let u = o[a], c = -1;
      if (u) {
        for (let d = 0; d < this.tooltips.length; d++) {
          let h = this.tooltips[d];
          h && h.create == u.create && (c = d);
        }
        if (c < 0)
          r[a] = this.createTooltipView(u, a ? r[a - 1] : null), l && (l[a] = !!u.above);
        else {
          let d = r[a] = this.tooltipViews[c];
          l && (l[a] = t[c]), d.update && d.update(e);
        }
      }
    }
    for (let a of this.tooltipViews)
      r.indexOf(a) < 0 && (this.removeTooltipView(a), (n = a.destroy) === null || n === void 0 || n.call(a));
    return t && (l.forEach((a, u) => t[u] = a), t.length = l.length), this.input = s, this.tooltips = o, this.tooltipViews = r, !0;
  }
}
function cy(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const nl = /* @__PURE__ */ de.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: se.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || cy
    };
  }
}), ec = /* @__PURE__ */ new WeakMap(), Md = /* @__PURE__ */ zt.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(nl);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new Cd(i, Ta, (t, n) => this.createTooltip(t, n), (t) => {
      this.resizeObserver && this.resizeObserver.unobserve(t.dom), t.dom.remove();
    }), this.above = this.manager.tooltips.map((t) => !!t.above), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((t) => {
      Date.now() > this.lastTransaction - 50 && t.length > 0 && t[t.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), i.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let i of this.manager.tooltipViews)
        this.intersectionObserver.observe(i.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(i) {
    i.transactions.length && (this.lastTransaction = Date.now());
    let e = this.manager.update(i, this.above);
    e && this.observeIntersection();
    let t = e || i.geometryChanged, n = i.state.facet(nl);
    if (n.position != this.position && !this.madeAbsolute) {
      this.position = n.position;
      for (let s of this.manager.tooltipViews)
        s.dom.style.position = this.position;
      t = !0;
    }
    if (n.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = n.parent, this.createContainer();
      for (let s of this.manager.tooltipViews)
        this.container.appendChild(s.dom);
      t = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    t && this.maybeMeasure();
  }
  createTooltip(i, e) {
    let t = i.create(this.view), n = e ? e.dom : null;
    if (t.dom.classList.add("cm-tooltip"), i.arrow && !t.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let s = document.createElement("div");
      s.className = "cm-tooltip-arrow", t.dom.appendChild(s);
    }
    return t.dom.style.position = this.position, t.dom.style.top = Co, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
  }
  destroy() {
    var i, e, t;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let n of this.manager.tooltipViews)
      n.dom.remove(), (i = n.destroy) === null || i === void 0 || i.call(n);
    this.parent && this.container.remove(), (e = this.resizeObserver) === null || e === void 0 || e.disconnect(), (t = this.intersectionObserver) === null || t === void 0 || t.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let i = 1, e = 1, t = !1;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom: o } = this.manager.tooltipViews[0];
      if (se.safari) {
        let r = o.getBoundingClientRect();
        t = Math.abs(r.top + 1e4) > 1 || Math.abs(r.left) > 1;
      } else
        t = !!o.offsetParent && o.offsetParent != this.container.ownerDocument.body;
    }
    if (t || this.position == "absolute")
      if (this.parent) {
        let o = this.parent.getBoundingClientRect();
        o.width && o.height && (i = o.width / this.parent.offsetWidth, e = o.height / this.parent.offsetHeight);
      } else
        ({ scaleX: i, scaleY: e } = this.view.viewState);
    let n = this.view.scrollDOM.getBoundingClientRect(), s = Sa(this.view);
    return {
      visible: {
        left: n.left + s.left,
        top: n.top + s.top,
        right: n.right - s.right,
        bottom: n.bottom - s.bottom
      },
      parent: this.parent ? this.container.getBoundingClientRect() : this.view.dom.getBoundingClientRect(),
      pos: this.manager.tooltips.map((o, r) => {
        let l = this.manager.tooltipViews[r];
        return l.getCoords ? l.getCoords(o.pos) : this.view.coordsAtPos(o.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: o }) => o.getBoundingClientRect()),
      space: this.view.state.facet(nl).tooltipSpace(this.view),
      scaleX: i,
      scaleY: e,
      makeAbsolute: t
    };
  }
  writeMeasure(i) {
    var e;
    if (i.makeAbsolute) {
      this.madeAbsolute = !0, this.position = "absolute";
      for (let l of this.manager.tooltipViews)
        l.dom.style.position = "absolute";
    }
    let { visible: t, space: n, scaleX: s, scaleY: o } = i, r = [];
    for (let l = 0; l < this.manager.tooltips.length; l++) {
      let a = this.manager.tooltips[l], u = this.manager.tooltipViews[l], { dom: c } = u, d = i.pos[l], h = i.size[l];
      if (!d || a.clip !== !1 && (d.bottom <= Math.max(t.top, n.top) || d.top >= Math.min(t.bottom, n.bottom) || d.right < Math.max(t.left, n.left) - 0.1 || d.left > Math.min(t.right, n.right) + 0.1)) {
        c.style.top = Co;
        continue;
      }
      let f = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, m = f ? 7 : 0, k = h.right - h.left, b = (e = ec.get(u)) !== null && e !== void 0 ? e : h.bottom - h.top, M = u.offset || dy, $ = this.view.textDirection == Ye.LTR, L = h.width > n.right - n.left ? $ ? n.left : n.right - h.width : $ ? Math.max(n.left, Math.min(d.left - (f ? 14 : 0) + M.x, n.right - k)) : Math.min(Math.max(n.left, d.left - k + (f ? 14 : 0) - M.x), n.right - k), H = this.above[l];
      !a.strictSide && (H ? d.top - b - m - M.y < n.top : d.bottom + b + m + M.y > n.bottom) && H == n.bottom - d.bottom > d.top - n.top && (H = this.above[l] = !H);
      let V = (H ? d.top - n.top : n.bottom - d.bottom) - m;
      if (V < b && u.resize !== !1) {
        if (V < this.view.defaultLineHeight) {
          c.style.top = Co;
          continue;
        }
        ec.set(u, b), c.style.height = (b = V) / o + "px";
      } else c.style.height && (c.style.height = "");
      let W = H ? d.top - b - m - M.y : d.bottom + m + M.y, I = L + k;
      if (u.overlap !== !0)
        for (let K of r)
          K.left < I && K.right > L && K.top < W + b && K.bottom > W && (W = H ? K.top - b - 2 - m : K.bottom + m + 2);
      if (this.position == "absolute" ? (c.style.top = (W - i.parent.top) / o + "px", tc(c, (L - i.parent.left) / s)) : (c.style.top = W / o + "px", tc(c, L / s)), f) {
        let K = d.left + ($ ? M.x : -M.x) - (L + 14 - 7);
        f.style.left = K / s + "px";
      }
      u.overlap !== !0 && r.push({ left: L, top: W, right: I, bottom: W + b }), c.classList.toggle("cm-tooltip-above", H), c.classList.toggle("cm-tooltip-below", !H), u.positioned && u.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = Co;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function tc(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const hy = /* @__PURE__ */ me.baseTheme({
  ".cm-tooltip": {
    zIndex: 500,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: "7px",
    width: "14px",
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent"
    },
    ".cm-tooltip-above &": {
      bottom: "-7px",
      "&:before": {
        borderTop: "7px solid #bbb"
      },
      "&:after": {
        borderTop: "7px solid #f5f5f5",
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: "-7px",
      "&:before": {
        borderBottom: "7px solid #bbb"
      },
      "&:after": {
        borderBottom: "7px solid #f5f5f5",
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), dy = { x: 0, y: 0 }, Ta = /* @__PURE__ */ de.define({
  enables: [Md, hy]
}), ar = /* @__PURE__ */ de.define({
  combine: (i) => i.reduce((e, t) => e.concat(t), [])
});
class $r {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new $r(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new Cd(e, ar, (t, n) => this.createHostedView(t, n), (t) => t.dom.remove());
  }
  createHostedView(e, t) {
    let n = e.create(this.view);
    return n.dom.classList.add("cm-tooltip-section"), this.dom.insertBefore(n.dom, t ? t.dom.nextSibling : this.dom.firstChild), this.mounted && n.mount && n.mount(this.view), n;
  }
  mount(e) {
    for (let t of this.manager.tooltipViews)
      t.mount && t.mount(e);
    this.mounted = !0;
  }
  positioned(e) {
    for (let t of this.manager.tooltipViews)
      t.positioned && t.positioned(e);
  }
  update(e) {
    this.manager.update(e);
  }
  destroy() {
    var e;
    for (let t of this.manager.tooltipViews)
      (e = t.destroy) === null || e === void 0 || e.call(t);
  }
  passProp(e) {
    let t;
    for (let n of this.manager.tooltipViews) {
      let s = n[e];
      if (s !== void 0) {
        if (t === void 0)
          t = s;
        else if (t !== s)
          return;
      }
    }
    return t;
  }
  get offset() {
    return this.passProp("offset");
  }
  get getCoords() {
    return this.passProp("getCoords");
  }
  get overlap() {
    return this.passProp("overlap");
  }
  get resize() {
    return this.passProp("resize");
  }
}
const fy = /* @__PURE__ */ Ta.compute([ar], (i) => {
  let e = i.facet(ar);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var n;
      return (n = t.end) !== null && n !== void 0 ? n : t.pos;
    })),
    create: $r.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), py = /* @__PURE__ */ de.define();
class my {
  constructor(e, t, n, s, o, r) {
    this.view = e, this.source = t, this.field = n, this.locked = s, this.setHover = o, this.hoverTime = r, this.hoverTimeout = -1, this.restartTimeout = -1, this.pending = null, this.lastMove = { x: 0, y: 0, target: e.dom, time: 0 }, this.checkHover = this.checkHover.bind(this), e.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this)), e.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update(e) {
    this.pending && (this.pending = null, clearTimeout(this.restartTimeout), this.restartTimeout = setTimeout(() => this.startHover(), 20));
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    if (this.hoverTimeout = -1, this.active.length)
      return;
    let e = Date.now() - this.lastMove.time;
    e < this.hoverTime ? this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - e) : this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { view: e, lastMove: t } = this, n = e.docView.tile.nearest(t.target);
    if (!n)
      return;
    let s, o = 1;
    if (n.isWidget())
      s = n.posAtStart;
    else {
      if (s = e.posAtCoords(t), s == null)
        return;
      let r = e.coordsAtPos(s);
      if (!r || t.y < r.top || t.y > r.bottom || t.x < r.left - e.defaultCharacterWidth || t.x > r.right + e.defaultCharacterWidth)
        return;
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == Ye.RTL ? -1 : 1;
      o = t.x < r.left ? -a : a;
    }
    this.activateHover(e, s, o);
  }
  activateHover(e, t, n, s) {
    let o = this.source(e, t, n), r = (l) => {
      if (l && !(Array.isArray(l) && !l.length)) {
        let a = Array.isArray(l) ? l : [l];
        s && this.locked.set(a, s), e.dispatch({ effects: this.setHover.of(a) });
      }
    };
    if (o && "then" in o) {
      let l = this.pending = { pos: t };
      o.then((a) => {
        this.pending == l && (this.pending = null, r(a));
      }, (a) => an(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Md), t = e ? e.manager.tooltips.findIndex((n) => n.create == $r.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, n;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !gy(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (n = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && n !== void 0 ? n : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !vy(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
    }
  }
  mouseleave(e) {
    clearTimeout(this.hoverTimeout), this.hoverTimeout = -1;
    let { active: t } = this;
    if (t.length && !this.locked.has(t)) {
      let { tooltip: n } = this;
      n && n.dom.contains(e.relatedTarget) ? this.watchTooltipLeave(n.dom) : this.view.dispatch({ effects: this.setHover.of([]) });
    }
  }
  watchTooltipLeave(e) {
    let t = (n) => {
      e.removeEventListener("mouseleave", t);
      let { active: s } = this;
      s.length && !this.locked.has(s) && !this.view.dom.contains(n.relatedTarget) && this.view.dispatch({ effects: this.setHover.of([]) });
    };
    e.addEventListener("mouseleave", t);
  }
  destroy() {
    clearTimeout(this.hoverTimeout), clearTimeout(this.restartTimeout), this.view.dom.removeEventListener("mouseleave", this.mouseleave), this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
const Mo = 4;
function gy(i, e) {
  let { left: t, right: n, top: s, bottom: o } = i.getBoundingClientRect(), r;
  if (r = i.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - Mo && e.clientX <= n + Mo && e.clientY >= s - Mo && e.clientY <= o + Mo;
}
function vy(i, e, t, n, s, o) {
  let r = i.scrollDOM.getBoundingClientRect(), l = i.documentTop + i.documentPadding.top + i.contentHeight;
  if (r.left > n || r.right < n || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = i.posAtCoords({ x: n, y: s }, !1);
  return a >= e && a <= t;
}
function yy(i, e = {}) {
  let t = qe.define(), n = /* @__PURE__ */ new WeakMap(), s = dn.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = n.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let d = l.changes.mapPos(c.pos, -1, It.TrackDel);
          if (d != null) {
            let h = Object.assign(/* @__PURE__ */ Object.create(null), c);
            h.pos = d, h.end != null && (h.end = l.changes.mapPos(h.end)), u.push(h);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(by) && !u.value || u.value == s) && (r = []);
      return r.length && a && n.set(r, a), r;
    },
    provide: (r) => ar.from(r)
  });
  const o = zt.define((r) => new my(
    r,
    i,
    s,
    n,
    t,
    e.hoverTime || 300
    /* Hover.Time */
  ));
  return {
    active: s,
    extension: [
      s,
      o,
      py.of(o),
      fy
    ]
  };
}
const by = /* @__PURE__ */ qe.define(), nc = /* @__PURE__ */ de.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), ky = /* @__PURE__ */ zt.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(Xl), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(nc);
    this.top = new Ao(i, !0, e.topContainer), this.bottom = new Ao(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(nc);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Ao(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Ao(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(Xl);
    if (t != this.input) {
      let n = t.filter((a) => a), s = [], o = [], r = [], l = [];
      for (let a of n) {
        let u = this.specs.indexOf(a), c;
        u < 0 ? (c = a(i.view), l.push(c)) : (c = this.panels[u], c.update && c.update(i)), s.push(c), (c.top ? o : r).push(c);
      }
      this.specs = n, this.panels = s, this.top.sync(o), this.bottom.sync(r);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let n of this.panels)
        n.update && n.update(i);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (i) => me.scrollMargins.of((e) => {
    let t = e.plugin(i);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Ao {
  constructor(e, t, n) {
    this.view = e, this.top = t, this.container = n, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = ic(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = ic(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function ic(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const Xl = /* @__PURE__ */ de.define({
  enables: ky
});
class ci extends Oi {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
ci.prototype.elementClass = "";
ci.prototype.toDOM = void 0;
ci.prototype.mapMode = It.TrackBefore;
ci.prototype.startSide = ci.prototype.endSide = -1;
ci.prototype.point = !0;
const il = /* @__PURE__ */ de.define(), wy = /* @__PURE__ */ de.define(), xy = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Oe.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, Ws = /* @__PURE__ */ de.define();
function Sy(i) {
  return [Ad(), Ws.of({ ...xy, ...i })];
}
const sc = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
});
function Ad(i) {
  return [
    Cy
  ];
}
const Cy = /* @__PURE__ */ zt.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet(Ws).map((e) => new rc(i, e)), this.fixed = !i.state.facet(sc);
    for (let e of this.gutters)
      e.config.side == "after" ? this.getDOMAfter().appendChild(e.dom) : this.dom.appendChild(e.dom);
    this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), i.scrollDOM.insertBefore(this.dom, i.contentDOM);
  }
  getDOMAfter() {
    return this.domAfter || (this.domAfter = document.createElement("div"), this.domAfter.className = "cm-gutters cm-gutters-after", this.domAfter.setAttribute("aria-hidden", "true"), this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.domAfter.style.position = this.fixed ? "sticky" : "", this.view.scrollDOM.appendChild(this.domAfter)), this.domAfter;
  }
  update(i) {
    if (this.updateGutters(i)) {
      let e = this.prevViewport, t = i.view.viewport, n = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(n < (t.to - t.from) * 0.8);
    }
    if (i.geometryChanged) {
      let e = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = e, this.domAfter && (this.domAfter.style.minHeight = e);
    }
    this.view.state.facet(sc) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Oe.iter(this.view.state.facet(il), this.view.viewport.from), n = [], s = this.gutters.map((o) => new My(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == yt.Text && r) {
            Jl(t, n, l.from);
            for (let a of s)
              a.line(this.view, l, n);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == yt.Text) {
        Jl(t, n, o.from);
        for (let r of s)
          r.line(this.view, o, n);
      } else if (o.widget)
        for (let r of s)
          r.widget(this.view, o);
    for (let o of s)
      o.finish();
    i && (this.view.scrollDOM.insertBefore(this.dom, e), this.domAfter && this.view.scrollDOM.appendChild(this.domAfter));
  }
  updateGutters(i) {
    let e = i.startState.facet(Ws), t = i.state.facet(Ws), n = i.docChanged || i.heightChanged || i.viewportChanged || !Oe.eq(i.startState.facet(il), i.state.facet(il), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new rc(this.view, o)) : (this.gutters[r].update(i), s.push(this.gutters[r]));
      }
      for (let o of this.gutters)
        o.dom.remove(), s.indexOf(o) < 0 && o.destroy();
      for (let o of s)
        o.config.side == "after" ? this.getDOMAfter().appendChild(o.dom) : this.dom.appendChild(o.dom);
      this.gutters = s;
    }
    return n;
  }
  destroy() {
    for (let i of this.gutters)
      i.destroy();
    this.dom.remove(), this.domAfter && this.domAfter.remove();
  }
}, {
  provide: (i) => me.scrollMargins.of((e) => {
    let t = e.plugin(i);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let n = t.dom.offsetWidth * e.scaleX, s = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == Ye.LTR ? { left: n, right: s } : { right: n, left: s };
  })
});
function oc(i) {
  return Array.isArray(i) ? i : [i];
}
function Jl(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class My {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = Oe.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Td(e, r, o, n);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    Jl(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let o of e.state.facet(wy)) {
      let r = o(e, t.widget, t);
      r && (s || (s = [])).push(r);
    }
    s && this.addElement(e, t, s);
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class rc {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let n in t.domEventHandlers)
      this.dom.addEventListener(n, (s) => {
        let o = s.target, r;
        if (o != this.dom && this.dom.contains(o)) {
          for (; o.parentNode != this.dom; )
            o = o.parentNode;
          let a = o.getBoundingClientRect();
          r = (a.top + a.bottom) / 2;
        } else
          r = s.clientY;
        let l = e.lineBlockAtHeight(r - e.documentTop);
        t.domEventHandlers[n](e, l, s) && s.preventDefault();
      });
    this.markers = oc(t.markers(e)), t.initialSpacer && (this.spacer = new Td(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = oc(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let n = e.view.viewport;
    return !Oe.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Td {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), Ay(this.markers, s) || this.setMarkers(e, s);
  }
  setMarkers(e, t) {
    let n = "cm-gutterElement", s = this.dom.firstChild;
    for (let o = 0, r = 0; ; ) {
      let l = r, a = o < t.length ? t[o++] : null, u = !1;
      if (a) {
        let c = a.elementClass;
        c && (n += " " + c);
        for (let d = r; d < this.markers.length; d++)
          if (this.markers[d].compare(a)) {
            l = d, u = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; r < l; ) {
        let c = this.markers[r++];
        if (c.toDOM) {
          c.destroy(s);
          let d = s.nextSibling;
          s.remove(), s = d;
        }
      }
      if (!a)
        break;
      a.toDOM && (u ? s = s.nextSibling : this.dom.insertBefore(a.toDOM(e), s)), u && r++;
    }
    this.dom.className = n, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function Ay(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const Ty = /* @__PURE__ */ de.define(), $y = /* @__PURE__ */ de.define(), Yi = /* @__PURE__ */ de.define({
  combine(i) {
    return wr(i, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let n = Object.assign({}, e);
        for (let s in t) {
          let o = n[s], r = t[s];
          n[s] = o ? (l, a, u) => o(l, a, u) || r(l, a, u) : r;
        }
        return n;
      }
    });
  }
});
class sl extends ci {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function ol(i, e) {
  return i.state.facet(Yi).formatNumber(e, i.state);
}
const Dy = /* @__PURE__ */ Ws.compute([Yi], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(Ty);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new sl(ol(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet($y)) {
      let o = s(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Yi) != e.state.facet(Yi),
  initialSpacer(e) {
    return new sl(ol(e, lc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = ol(t.view, lc(t.view.state.doc.lines));
    return n == e.number ? e : new sl(n);
  },
  domEventHandlers: i.facet(Yi).domEventHandlers,
  side: "before"
}));
function Ly(i = {}) {
  return [
    Yi.of(i),
    Ad(),
    Dy
  ];
}
function lc(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const By = 1024;
let Oy = 0;
class rl {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Ee {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = Oy++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    }), this.combine = e.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = Nt.match(e)), (t) => {
      let n = e(t);
      return n === void 0 ? null : [this, n];
    };
  }
}
Ee.closedBy = new Ee({ deserialize: (i) => i.split(" ") });
Ee.openedBy = new Ee({ deserialize: (i) => i.split(" ") });
Ee.group = new Ee({ deserialize: (i) => i.split(" ") });
Ee.isolate = new Ee({ deserialize: (i) => {
  if (i && i != "rtl" && i != "ltr" && i != "auto")
    throw new RangeError("Invalid value for isolate: " + i);
  return i || "auto";
} });
Ee.contextHash = new Ee({ perNode: !0 });
Ee.lookAhead = new Ee({ perNode: !0 });
Ee.mounted = new Ee({ perNode: !0 });
class Fs {
  constructor(e, t, n, s = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[Ee.mounted.id];
  }
}
const Ey = /* @__PURE__ */ Object.create(null);
class Nt {
  /**
  @internal
  */
  constructor(e, t, n, s = 0) {
    this.name = e, this.props = t, this.id = n, this.flags = s;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Ey, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new Nt(e.name || "", t, e.id, n);
    if (e.props) {
      for (let o of e.props)
        if (Array.isArray(o) || (o = o(s)), o) {
          if (o[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[o[0].id] = o[1];
        }
    }
    return s;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(Ee.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let n in e)
      for (let s of n.split(" "))
        t[s] = e[n];
    return (n) => {
      for (let s = n.prop(Ee.group), o = -1; o < (s ? s.length : 0); o++) {
        let r = t[o < 0 ? n.name : s[o]];
        if (r)
          return r;
      }
    };
  }
}
Nt.none = new Nt(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class $a {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let t = [];
    for (let n of this.types) {
      let s = null;
      for (let o of e) {
        let r = o(n);
        if (r) {
          s || (s = Object.assign({}, n.props));
          let l = r[1], a = r[0];
          a.combine && a.id in s && (l = a.combine(s[a.id], l)), s[a.id] = l;
        }
      }
      t.push(s ? new Nt(n.name, s, n.id, n.flags) : n);
    }
    return new $a(t);
  }
}
const To = /* @__PURE__ */ new WeakMap(), ac = /* @__PURE__ */ new WeakMap();
var ot;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(ot || (ot = {}));
class Qe {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, n, s, o) {
    if (this.type = e, this.children = t, this.positions = n, this.length = s, this.props = null, o && o.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [r, l] of o)
        this.props[typeof r == "number" ? r : r.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = Fs.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let n of this.children) {
      let s = n.toString();
      s && (t && (t += ","), t += s);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new Ql(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = To.get(this) || this.topNode, o = new Ql(s);
    return o.moveTo(e, t), To.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Zt(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let n = Zs(To.get(this) || this.topNode, e, t, !1);
    return To.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = Zs(ac.get(this) || this.topNode, e, t, !0);
    return ac.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Py(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & ot.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | ot.IncludeAnonymous); ; ) {
      let u = !1;
      if (a.from <= o && a.to >= s && (!l && a.type.isAnonymous || t(a) !== !1)) {
        if (a.firstChild())
          continue;
        u = !0;
      }
      for (; u && n && (l || !a.type.isAnonymous) && n(a), !a.nextSibling(); ) {
        if (!a.parent())
          return;
        u = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : Ba(Nt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new Qe(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new Qe(Nt.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Ny(e);
  }
}
Qe.empty = new Qe(Nt.none, [], [], 0);
class Da {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new Da(this.buffer, this.index);
  }
}
class hi {
  /**
  Create a tree buffer.
  */
  constructor(e, t, n) {
    this.buffer = e, this.length = t, this.set = n;
  }
  /**
  @internal
  */
  get type() {
    return Nt.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], n = this.buffer[e + 3], s = this.set.types[t], o = s.name;
    if (/\W/.test(o) && !s.isError && (o = JSON.stringify(o)), e += 4, n == e)
      return o;
    let r = [];
    for (; e < n; )
      r.push(this.childString(e)), e = this.buffer[e + 3];
    return o + "(" + r.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, n, s, o) {
    let { buffer: r } = this, l = -1;
    for (let a = e; a != t && !($d(o, s, r[a + 1], r[a + 2]) && (l = a, n > 0)); a = r[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(e, t, n) {
    let s = this.buffer, o = new Uint16Array(t - e), r = 0;
    for (let l = e, a = 0; l < t; ) {
      o[a++] = s[l++], o[a++] = s[l++] - n;
      let u = o[a++] = s[l++] - n;
      o[a++] = s[l++] - e, r = Math.max(r, u);
    }
    return new hi(o, r, this.set);
  }
}
function $d(i, e, t, n) {
  switch (i) {
    case -2:
      return t < e;
    case -1:
      return n >= e && t < e;
    case 0:
      return t < e && n > e;
    case 1:
      return t <= e && n > e;
    case 2:
      return n > e;
    case 4:
      return !0;
  }
}
function Zs(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let r = !n && i instanceof Zt && i.index < 0 ? null : i.parent;
    if (!r)
      return i;
    i = r;
  }
  let o = n ? 0 : ot.IgnoreOverlays;
  if (n)
    for (let r = i, l = r.parent; l; r = l, l = r.parent)
      r instanceof Zt && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (i = l);
  for (; ; ) {
    let r = i.enter(e, t, o);
    if (!r)
      return i;
    i = r;
  }
}
class Dd {
  cursor(e = 0) {
    return new Ql(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = uc(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return uc(this, e, t, n);
  }
  resolve(e, t = 0) {
    return Zs(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Zs(this, e, t, !0);
  }
  matchContext(e) {
    return Zl(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), n = this;
    for (; t; ) {
      let s = t.lastChild;
      if (!s || s.to != t.to)
        break;
      s.type.isError && s.from == s.to ? (n = t, t = s.prevSibling) : t = s;
    }
    return n;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class Zt extends Dd {
  constructor(e, t, n, s) {
    super(), this._tree = e, this.from = t, this.index = n, this._parent = s;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, n, s, o = 0) {
    for (let r = this; ; ) {
      for (let { children: l, positions: a } = r._tree, u = t > 0 ? l.length : -1; e != u; e += t) {
        let c = l[e], d = a[e] + r.from, h;
        if (!(!(o & ot.EnterBracketed && c instanceof Qe && (h = Fs.get(c)) && !h.overlay && h.bracketed && n >= d && n <= d + c.length) && !$d(s, n, d, d + c.length))) {
          if (c instanceof hi) {
            if (o & ot.ExcludeBuffers)
              continue;
            let f = c.findChild(0, c.buffer.length, t, n - d, s);
            if (f > -1)
              return new oi(new Ry(r, c, e, d), null, f);
          } else if (o & ot.IncludeAnonymous || !c.type.isAnonymous || La(c)) {
            let f;
            if (!(o & ot.IgnoreMounts) && (f = Fs.get(c)) && !f.overlay)
              return new Zt(f.tree, d, e, r);
            let m = new Zt(c, d, e, r);
            return o & ot.IncludeAnonymous || !m.type.isAnonymous ? m : m.nextChild(t < 0 ? c.children.length - 1 : 0, t, n, s, o);
          }
        }
      }
      if (o & ot.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this._tree.prop(e);
  }
  enter(e, t, n = 0) {
    let s;
    if (!(n & ot.IgnoreOverlays) && (s = Fs.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = n & ot.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new Zt(s.tree, s.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, n);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function uc(i, e, t, n) {
  let s = i.cursor(), o = [];
  if (!s.firstChild())
    return o;
  if (t != null) {
    for (let r = !1; !r; )
      if (r = s.type.is(t), !s.nextSibling())
        return o;
  }
  for (; ; ) {
    if (n != null && s.type.is(n))
      return o;
    if (s.type.is(e) && o.push(s.node), !s.nextSibling())
      return n == null ? o : [];
  }
}
function Zl(i, e, t = e.length - 1) {
  for (let n = i; t >= 0; n = n.parent) {
    if (!n)
      return !1;
    if (!n.type.isAnonymous) {
      if (e[t] && e[t] != n.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class Ry {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class oi extends Dd {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, n) {
    super(), this.context = e, this._parent = t, this.index = n, this.type = e.buffer.set.types[e.buffer.buffer[n]];
  }
  child(e, t, n) {
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.context.start, n);
    return o < 0 ? null : new oi(this.context, this, o);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this.type.prop(e);
  }
  enter(e, t, n = 0) {
    if (n & ot.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return o < 0 ? null : new oi(this.context, this, o);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new oi(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new oi(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: n } = this.context, s = this.index + 4, o = n.buffer[this.index + 3];
    if (o > s) {
      let r = n.buffer[this.index + 1];
      e.push(n.slice(s, o, r)), t.push(0);
    }
    return new Qe(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function Ld(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let o = 1; o < i.length; o++) {
    let r = i[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let n = t instanceof Zt && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new Iy(s, t);
}
class Iy {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return Ld(this.heads);
  }
}
function Py(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let o = n instanceof Zt ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [n])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Fs.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new Zt(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [n])).push(Zs(l, e, t, !1));
      }
    }
  return s ? Ld(s) : n;
}
class Ql {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~ot.EnterBracketed, e instanceof Zt)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let n = e._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: n, buffer: s } = this.buffer;
    return this.type = t || s.set.types[s.buffer[e]], this.from = n + s.buffer[e + 1], this.to = n + s.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof Zt ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, n) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, n, this.mode));
    let { buffer: s } = this.buffer, o = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.buffer.start, n);
    return o < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(o));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, n = this.mode) {
    return this.buffer ? n & ot.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & ot.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & ot.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, n = this.stack.length - 1;
    if (e < 0) {
      let s = n < 0 ? 0 : this.stack[n] + 4;
      if (this.index != s)
        return this.yieldBuf(t.findChild(
          s,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let s = t.buffer[this.index + 3];
      if (s < (n < 0 ? t.buffer.length : t.buffer[this.stack[n] + 3]))
        return this.yieldBuf(s);
    }
    return n < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, n, { buffer: s } = this;
    if (s) {
      if (e > 0) {
        if (this.index < s.buffer.buffer.length)
          return !1;
      } else
        for (let o = 0; o < this.index; o++)
          if (s.buffer.buffer[o + 3] < this.index)
            return !1;
      ({ index: t, parent: n } = s);
    } else
      ({ index: t, _parent: n } = this._tree);
    for (; n; { index: t, _parent: n } = n)
      if (t > -1)
        for (let o = t + e, r = e < 0 ? -1 : n._tree.children.length; o != r; o += e) {
          let l = n._tree.children[o];
          if (this.mode & ot.IncludeAnonymous || l instanceof hi || !l.type.isAnonymous || La(l))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, n = 0;
    if (e && e.context == this.buffer)
      e: for (let s = this.index, o = this.stack.length; o >= 0; ) {
        for (let r = e; r; r = r._parent)
          if (r.index == s) {
            if (s == this.index)
              return r;
            t = r, n = o + 1;
            break e;
          }
        s = this.stack[--o];
      }
    for (let s = n; s < this.stack.length; s++)
      t = new oi(this.buffer, t, this.stack[s]);
    return this.bufferNode = new oi(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let n = 0; ; ) {
      let s = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          n++;
          continue;
        }
        this.type.isAnonymous || (s = !0);
      }
      for (; ; ) {
        if (s && t && t(this), s = this.type.isAnonymous, !n)
          return;
        if (this.nextSibling())
          break;
        this.parent(), n--, s = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return Zl(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return Zl(this._tree, e, s);
      let r = n[t.buffer[this.stack[o]]];
      if (!r.isAnonymous) {
        if (e[s] && e[s] != r.name)
          return !1;
        s--;
      }
    }
    return !0;
  }
}
function La(i) {
  return i.children.some((e) => e instanceof hi || !e.type.isAnonymous || La(e));
}
function Ny(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = By, reused: o = [], minRepeatType: r = n.types.length } = i, l = Array.isArray(t) ? new Da(t, t.length) : t, a = n.types, u = 0, c = 0;
  function d(V, W, I, K, R, z) {
    let { id: N, start: A, end: F, size: fe } = l, pe = c, te = u;
    if (fe < 0)
      if (l.next(), fe == -1) {
        let xe = o[N];
        I.push(xe), K.push(A - V);
        return;
      } else if (fe == -3) {
        u = N;
        return;
      } else if (fe == -4) {
        c = N;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${fe}`);
    let ie = a[N], $e, be, Me = A - V;
    if (F - A <= s && (be = b(l.pos - W, R))) {
      let xe = new Uint16Array(be.size - be.skip), q = l.pos - be.size, Je = xe.length;
      for (; l.pos > q; )
        Je = M(be.start, xe, Je);
      $e = new hi(xe, F - be.start, n), Me = be.start - V;
    } else {
      let xe = l.pos - fe;
      l.next();
      let q = [], Je = [], le = N >= r ? N : -1, De = 0, ee = F;
      for (; l.pos > xe; )
        le >= 0 && l.id == le && l.size >= 0 ? (l.end <= ee - s && (m(q, Je, A, De, l.end, ee, le, pe, te), De = q.length, ee = l.end), l.next()) : z > 2500 ? h(A, xe, q, Je) : d(A, xe, q, Je, le, z + 1);
      if (le >= 0 && De > 0 && De < q.length && m(q, Je, A, De, A, ee, le, pe, te), q.reverse(), Je.reverse(), le > -1 && De > 0) {
        let U = f(ie, te);
        $e = Ba(ie, q, Je, 0, q.length, 0, F - A, U, U);
      } else
        $e = k(ie, q, Je, F - A, pe - F, te);
    }
    I.push($e), K.push(Me);
  }
  function h(V, W, I, K) {
    let R = [], z = 0, N = -1;
    for (; l.pos > W; ) {
      let { id: A, start: F, end: fe, size: pe } = l;
      if (pe > 4)
        l.next();
      else {
        if (N > -1 && F < N)
          break;
        N < 0 && (N = fe - s), R.push(A, F, fe), z++, l.next();
      }
    }
    if (z) {
      let A = new Uint16Array(z * 4), F = R[R.length - 2];
      for (let fe = R.length - 3, pe = 0; fe >= 0; fe -= 3)
        A[pe++] = R[fe], A[pe++] = R[fe + 1] - F, A[pe++] = R[fe + 2] - F, A[pe++] = pe;
      I.push(new hi(A, R[2] - F, n)), K.push(F - V);
    }
  }
  function f(V, W) {
    return (I, K, R) => {
      let z = 0, N = I.length - 1, A, F;
      if (N >= 0 && (A = I[N]) instanceof Qe) {
        if (!N && A.type == V && A.length == R)
          return A;
        (F = A.prop(Ee.lookAhead)) && (z = K[N] + A.length + F);
      }
      return k(V, I, K, R, z, W);
    };
  }
  function m(V, W, I, K, R, z, N, A, F) {
    let fe = [], pe = [];
    for (; V.length > K; )
      fe.push(V.pop()), pe.push(W.pop() + I - R);
    V.push(k(n.types[N], fe, pe, z - R, A - z, F)), W.push(R - I);
  }
  function k(V, W, I, K, R, z, N) {
    if (z) {
      let A = [Ee.contextHash, z];
      N = N ? [A].concat(N) : [A];
    }
    if (R > 25) {
      let A = [Ee.lookAhead, R];
      N = N ? [A].concat(N) : [A];
    }
    return new Qe(V, W, I, K, N);
  }
  function b(V, W) {
    let I = l.fork(), K = 0, R = 0, z = 0, N = I.end - s, A = { size: 0, start: 0, skip: 0 };
    e: for (let F = I.pos - V; I.pos > F; ) {
      let fe = I.size;
      if (I.id == W && fe >= 0) {
        A.size = K, A.start = R, A.skip = z, z += 4, K += 4, I.next();
        continue;
      }
      let pe = I.pos - fe;
      if (fe < 0 || pe < F || I.start < N)
        break;
      let te = I.id >= r ? 4 : 0, ie = I.start;
      for (I.next(); I.pos > pe; ) {
        if (I.size < 0)
          if (I.size == -3 || I.size == -4)
            te += 4;
          else
            break e;
        else I.id >= r && (te += 4);
        I.next();
      }
      R = ie, K += fe, z += te;
    }
    return (W < 0 || K == V) && (A.size = K, A.start = R, A.skip = z), A.size > 4 ? A : void 0;
  }
  function M(V, W, I) {
    let { id: K, start: R, end: z, size: N } = l;
    if (l.next(), N >= 0 && K < r) {
      let A = I;
      if (N > 4) {
        let F = l.pos - (N - 4);
        for (; l.pos > F; )
          I = M(V, W, I);
      }
      W[--I] = A, W[--I] = z - V, W[--I] = R - V, W[--I] = K;
    } else N == -3 ? u = K : N == -4 && (c = K);
    return I;
  }
  let $ = [], L = [];
  for (; l.pos > 0; )
    d(i.start || 0, i.bufferStart || 0, $, L, -1, 0);
  let H = (e = i.length) !== null && e !== void 0 ? e : $.length ? L[0] + $[0].length : 0;
  return new Qe(a[i.topID], $.reverse(), L.reverse(), H);
}
const cc = /* @__PURE__ */ new WeakMap();
function Go(i, e) {
  if (!i.isAnonymous || e instanceof hi || e.type != i)
    return 1;
  let t = cc.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof Qe)) {
        t = 1;
        break;
      }
      t += Go(i, n);
    }
    cc.set(e, t);
  }
  return t;
}
function Ba(i, e, t, n, s, o, r, l, a) {
  let u = 0;
  for (let m = n; m < s; m++)
    u += Go(i, e[m]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], h = [];
  function f(m, k, b, M, $) {
    for (let L = b; L < M; ) {
      let H = L, V = k[L], W = Go(i, m[L]);
      for (L++; L < M; L++) {
        let I = Go(i, m[L]);
        if (W + I >= c)
          break;
        W += I;
      }
      if (L == H + 1) {
        if (W > c) {
          let I = m[H];
          f(I.children, I.positions, 0, I.children.length, k[H] + $);
          continue;
        }
        d.push(m[H]);
      } else {
        let I = k[L - 1] + m[L - 1].length - V;
        d.push(Ba(i, m, k, H, L, V, I, null, a));
      }
      h.push(V + $ - o);
    }
  }
  return f(e, t, n, s, 0), (l || a)(d, h, r);
}
class Bi {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, n, s, o = !1, r = !1) {
    this.from = e, this.to = t, this.tree = n, this.offset = s, this.open = (o ? 1 : 0) | (r ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], n = !1) {
    let s = [new Bi(0, e.length, e, 0, !1, n)];
    for (let o of t)
      o.to > e.length && s.push(o);
    return s;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, n = 128) {
    if (!t.length)
      return e;
    let s = [], o = 1, r = e.length ? e[0] : null;
    for (let l = 0, a = 0, u = 0; ; l++) {
      let c = l < t.length ? t[l] : null, d = c ? c.fromA : 1e9;
      if (d - a >= n)
        for (; r && r.from < d; ) {
          let h = r;
          if (a >= h.from || d <= h.to || u) {
            let f = Math.max(h.from, a) - u, m = Math.min(h.to, d) - u;
            h = f >= m ? null : new Bi(f, m, h.tree, h.offset + u, l > 0, !!c);
          }
          if (h && s.push(h), r.to > d)
            break;
          r = o < e.length ? e[o++] : null;
        }
      if (!c)
        break;
      a = c.toA, u = c.toA - c.toB;
    }
    return s;
  }
}
class Bd {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, n) {
    return typeof e == "string" && (e = new Vy(e)), n = n ? n.length ? n.map((s) => new rl(s.from, s.to)) : [new rl(0, 0)] : [new rl(0, e.length)], this.createParse(e, t || [], n);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, n) {
    let s = this.startParse(e, t, n);
    for (; ; ) {
      let o = s.advance();
      if (o)
        return o;
    }
  }
}
class Vy {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
new Ee({ perNode: !0 });
let Hy = 0;
class Yt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = Hy++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let n = typeof e == "string" ? e : "?";
    if (e instanceof Yt && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let s = new Yt(n, [], null, []);
    if (s.set.push(s), t)
      for (let o of t.set)
        s.set.push(o);
    return s;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(e) {
    let t = new ur(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : ur.get(n.base || n, n.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let zy = 0;
class ur {
  constructor(e) {
    this.name = e, this.instances = [], this.id = zy++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && Wy(t, l.modified));
    if (n)
      return n;
    let s = [], o = new Yt(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Fy(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(ur.get(l, a));
    return o;
  }
}
function Wy(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function Fy(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function _y(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in i) {
    let n = i[t];
    Array.isArray(n) || (n = [n]);
    for (let s of t.split(" "))
      if (s) {
        let o = [], r = 2, l = s;
        for (let d = 0; ; ) {
          if (l == "..." && d > 0 && d + 3 == s.length) {
            r = 1;
            break;
          }
          let h = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!h)
            throw new RangeError("Invalid path: " + s);
          if (o.push(h[0] == "*" ? "" : h[0][0] == '"' ? JSON.parse(h[0]) : h[0]), d += h[0].length, d == s.length)
            break;
          let f = s[d++];
          if (d == s.length && f == "!") {
            r = 0;
            break;
          }
          if (f != "/")
            throw new RangeError("Invalid path: " + s);
          l = s.slice(d);
        }
        let a = o.length - 1, u = o[a];
        if (!u)
          throw new RangeError("Invalid path: " + s);
        let c = new Qs(n, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return Od.add(e);
}
const Od = new Ee({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth < e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new Qs(s.tags, s.mode, s.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class Qs {
  constructor(e, t, n, s) {
    this.tags = e, this.mode = t, this.context = n, this.next = s;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
Qs.empty = new Qs([], 2, null);
function Ed(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let o of i)
    if (!Array.isArray(o.tag))
      t[o.tag.id] = o.class;
    else
      for (let r of o.tag)
        t[r.id] = o.class;
  let { scope: n, all: s = null } = e || {};
  return {
    style: (o) => {
      let r = s;
      for (let l of o)
        for (let a of l.set) {
          let u = t[a.id];
          if (u) {
            r = r ? r + " " + u : u;
            break;
          }
        }
      return r;
    },
    scope: n
  };
}
function Ky(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function Uy(i, e, t, n = 0, s = i.length) {
  let o = new Gy(n, Array.isArray(e) ? e : [e], t);
  o.highlightRange(i.cursor(), n, s, "", o.highlighters), o.flush(s);
}
class Gy {
  constructor(e, t, n) {
    this.at = e, this.highlighters = t, this.span = n, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, n, s, o) {
    let { type: r, from: l, to: a } = e;
    if (l >= n || a <= t)
      return;
    r.isTop && (o = this.highlighters.filter((f) => !f.scope || f.scope(r)));
    let u = s, c = jy(e) || Qs.empty, d = Ky(o, c.tags);
    if (d && (u && (u += " "), u += d, c.mode == 1 && (s += (s ? " " : "") + d)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let h = e.tree && e.tree.prop(Ee.mounted);
    if (h && h.overlay) {
      let f = e.node.enter(h.overlay[0].from + l, 1), m = this.highlighters.filter((b) => !b.scope || b.scope(h.tree.type)), k = e.firstChild();
      for (let b = 0, M = l; ; b++) {
        let $ = b < h.overlay.length ? h.overlay[b] : null, L = $ ? $.from + l : a, H = Math.max(t, M), V = Math.min(n, L);
        if (H < V && k)
          for (; e.from < V && (this.highlightRange(e, H, V, s, o), this.startSpan(Math.min(V, e.to), u), !(e.to >= L || !e.nextSibling())); )
            ;
        if (!$ || L > n)
          break;
        M = $.to + l, M > t && (this.highlightRange(f.cursor(), Math.max(t, $.from + l), Math.min(n, M), "", m), this.startSpan(Math.min(n, M), u));
      }
      k && e.parent();
    } else if (e.firstChild()) {
      h && (s = "");
      do
        if (!(e.to <= t)) {
          if (e.from >= n)
            break;
          this.highlightRange(e, t, n, s, o), this.startSpan(Math.min(n, e.to), u);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function jy(i) {
  let e = i.type.prop(Od);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const ne = Yt.define, $o = ne(), Zn = ne(), hc = ne(Zn), dc = ne(Zn), Qn = ne(), Do = ne(Qn), ll = ne(Qn), Cn = ne(), wi = ne(Cn), wn = ne(), xn = ne(), ea = ne(), Cs = ne(ea), Lo = ne(), Se = {
  /**
  A comment.
  */
  comment: $o,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: ne($o),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: ne($o),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: ne($o),
  /**
  Any kind of identifier.
  */
  name: Zn,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: ne(Zn),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: hc,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: ne(hc),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: dc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: ne(dc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: ne(Zn),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: ne(Zn),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: ne(Zn),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: ne(Zn),
  /**
  A literal value.
  */
  literal: Qn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Do,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: ne(Do),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: ne(Do),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: ne(Do),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: ll,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: ne(ll),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: ne(ll),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: ne(Qn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: ne(Qn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: ne(Qn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: ne(Qn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: ne(Qn),
  /**
  A language keyword.
  */
  keyword: wn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: ne(wn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: ne(wn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: ne(wn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: ne(wn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: ne(wn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: ne(wn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: ne(wn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: ne(wn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: ne(wn),
  /**
  An operator.
  */
  operator: xn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: ne(xn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: ne(xn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: ne(xn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: ne(xn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: ne(xn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: ne(xn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: ne(xn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: ne(xn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: ne(xn),
  /**
  Program or markup punctuation.
  */
  punctuation: ea,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: ne(ea),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Cs,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: ne(Cs),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: ne(Cs),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: ne(Cs),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: ne(Cs),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Cn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: wi,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: ne(wi),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: ne(wi),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: ne(wi),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: ne(wi),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: ne(wi),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: ne(wi),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: ne(Cn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: ne(Cn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: ne(Cn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: ne(Cn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: ne(Cn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: ne(Cn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: ne(Cn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: ne(Cn),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: ne(),
  /**
  Deleted text.
  */
  deleted: ne(),
  /**
  Changed text.
  */
  changed: ne(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: ne(),
  /**
  Metadata or meta-instruction.
  */
  meta: Lo,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: ne(Lo),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: ne(Lo),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: ne(Lo),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Yt.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Yt.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Yt.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Yt.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Yt.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Yt.defineModifier("special")
};
for (let i in Se) {
  let e = Se[i];
  e instanceof Yt && (e.name = i);
}
Ed([
  { tag: Se.link, class: "tok-link" },
  { tag: Se.heading, class: "tok-heading" },
  { tag: Se.emphasis, class: "tok-emphasis" },
  { tag: Se.strong, class: "tok-strong" },
  { tag: Se.keyword, class: "tok-keyword" },
  { tag: Se.atom, class: "tok-atom" },
  { tag: Se.bool, class: "tok-bool" },
  { tag: Se.url, class: "tok-url" },
  { tag: Se.labelName, class: "tok-labelName" },
  { tag: Se.inserted, class: "tok-inserted" },
  { tag: Se.deleted, class: "tok-deleted" },
  { tag: Se.literal, class: "tok-literal" },
  { tag: Se.string, class: "tok-string" },
  { tag: Se.number, class: "tok-number" },
  { tag: [Se.regexp, Se.escape, Se.special(Se.string)], class: "tok-string2" },
  { tag: Se.variableName, class: "tok-variableName" },
  { tag: Se.local(Se.variableName), class: "tok-variableName tok-local" },
  { tag: Se.definition(Se.variableName), class: "tok-variableName tok-definition" },
  { tag: Se.special(Se.variableName), class: "tok-variableName2" },
  { tag: Se.definition(Se.propertyName), class: "tok-propertyName tok-definition" },
  { tag: Se.typeName, class: "tok-typeName" },
  { tag: Se.namespace, class: "tok-namespace" },
  { tag: Se.className, class: "tok-className" },
  { tag: Se.macroName, class: "tok-macroName" },
  { tag: Se.propertyName, class: "tok-propertyName" },
  { tag: Se.operator, class: "tok-operator" },
  { tag: Se.comment, class: "tok-comment" },
  { tag: Se.meta, class: "tok-meta" },
  { tag: Se.invalid, class: "tok-invalid" },
  { tag: Se.punctuation, class: "tok-punctuation" }
]);
var al;
const Xi = /* @__PURE__ */ new Ee();
function qy(i) {
  return de.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const Yy = /* @__PURE__ */ new Ee();
class un {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, ze.prototype.hasOwnProperty("tree") || Object.defineProperty(ze.prototype, "tree", { get() {
      return Bn(this);
    } }), this.parser = t, this.extension = [
      fs.of(this),
      ze.languageData.of((o, r, l) => {
        let a = fc(o, r, l), u = a.type.prop(Xi);
        if (!u)
          return [];
        let c = o.facet(u), d = a.type.prop(Yy);
        if (d) {
          let h = a.resolve(r - a.from, l);
          for (let f of d)
            if (f.test(h, o)) {
              let m = o.facet(f.facet);
              return f.type == "replace" ? m : m.concat(c);
            }
        }
        return c;
      })
    ].concat(n);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, n = -1) {
    return fc(e, t, n).type.prop(Xi) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(fs);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (o, r) => {
      if (o.prop(Xi) == this.data) {
        n.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Ee.mounted);
      if (l) {
        if (l.tree.prop(Xi) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              n.push({ from: a.from + r, to: a.to + r });
          else
            n.push({ from: r, to: r + o.length });
          return;
        } else if (l.overlay) {
          let a = n.length;
          if (s(l.tree, l.overlay[0].from + r), n.length > a)
            return;
        }
      }
      for (let a = 0; a < o.children.length; a++) {
        let u = o.children[a];
        u instanceof Qe && s(u, o.positions[a] + r);
      }
    };
    return s(Bn(e), 0), n;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
un.setState = /* @__PURE__ */ qe.define();
function fc(i, e, t) {
  let n = i.facet(fs), s = Bn(i).topNode;
  if (!n || n.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, ot.ExcludeBuffers | ot.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function Bn(i) {
  let e = i.field(un.state, !1);
  return e ? e.tree : Qe.empty;
}
class Xy {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let n = this.cursorPos - this.string.length;
    return e < n || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - n, t - n);
  }
}
let Ms = null;
class hs {
  constructor(e, t, n = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new hs(e, t, [], Qe.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new Xy(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != Qe.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var n;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(Bi.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Bi.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Ms;
    Ms = this;
    try {
      return e();
    } finally {
      Ms = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = pc(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, d, h) => a.push({ fromA: u, toA: c, fromB: d, toB: h })), n = Bi.applyChanges(n, a), s = Qe.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), d = e.mapPos(u.to, -1);
          c < d && l.push({ from: c, to: d });
        }
      }
    }
    return new hs(this.parser, t, n, s, o, r, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let n = 0; n < this.skipped.length; n++) {
      let { from: s, to: o } = this.skipped[n];
      s < e.to && o > e.from && (this.fragments = pc(this.fragments, s, o), this.skipped.splice(n--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends Bd {
      createParse(t, n, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = Ms;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new Qe(Nt.none, [], [], r - o);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return Ms;
  }
}
function pc(i, e, t) {
  return Bi.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class ds {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new ds(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = hs.create(e.facet(fs).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new ds(n);
  }
}
un.state = /* @__PURE__ */ dn.define({
  create: ds.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(un.setState))
        return t.value;
    return e.startState.facet(fs) != e.state.facet(fs) ? ds.init(e.state) : i.apply(e);
  }
});
let Rd = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Rd = (i) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(i, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const ul = typeof navigator < "u" && (!((al = navigator.scheduling) === null || al === void 0) && al.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Jy = /* @__PURE__ */ zt.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(un.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(un.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Rd(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: s } } = this.view, o = n.field(un.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !ul ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && n.doc.length > s + 1e3, a = o.context.work(() => ul && ul() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: un.setState.of(new ds(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => an(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), fs = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    un.state,
    Jy,
    me.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Zy = /* @__PURE__ */ de.define(), Oa = /* @__PURE__ */ de.define({
  combine: (i) => {
    if (!i.length)
      return "  ";
    let e = i[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(i[0]));
    return e;
  }
});
function Pi(i) {
  let e = i.facet(Oa);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function cr(i, e) {
  let t = "", n = i.tabSize, s = i.facet(Oa)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Id(i, e) {
  i instanceof ze && (i = new Dr(i));
  for (let n of i.state.facet(Zy)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = Bn(i.state);
  return t.length >= e ? Qy(i, t, e) : null;
}
class Dr {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Pi(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let n = this.state.doc.lineAt(e), { simulateBreak: s, simulateDoubleBreak: o } = this.options;
    return s != null && s >= n.from && s <= n.to ? o && s == e ? { text: "", from: e } : (t < 0 ? s < e : s <= e) ? { text: n.text.slice(s - n.from), from: s } : { text: n.text.slice(0, s - n.from), from: n.from } : n;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: n, from: s } = this.lineAt(e, t);
    return n.slice(e - s, Math.min(n.length, e + 100 - s));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: n, from: s } = this.lineAt(e, t), o = this.countColumn(n, e - s), r = this.options.overrideIndentation ? this.options.overrideIndentation(s) : -1;
    return r > -1 && (o += r - this.countColumn(n, n.search(/\S|$/))), o;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return xr(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: n, from: s } = this.lineAt(e, t), o = this.options.overrideIndentation;
    if (o) {
      let r = o(s);
      if (r > -1)
        return r;
    }
    return this.countColumn(n, n.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Pd = /* @__PURE__ */ new Ee();
function Qy(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let o = [];
    for (let r = s; r && !(r.from < n.node.from || r.to > n.node.to || r.from == n.node.from && r.type == n.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      n = { node: o[r], next: n };
  }
  return Nd(n, i, t);
}
function Nd(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = tb(n.node);
    if (s)
      return s(Ea.create(e, t, n));
  }
  return 0;
}
function eb(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function tb(i) {
  let e = i.type.prop(Pd);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(Ee.closedBy))) {
    let s = i.lastChild, o = s && n.indexOf(s.name) > -1;
    return (r) => ob(r, !0, 1, void 0, o && !eb(r) ? s.from : void 0);
  }
  return i.parent == null ? nb : null;
}
function nb() {
  return 0;
}
class Ea extends Dr {
  constructor(e, t, n) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = n;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Ea(e, t, n);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let n = e.resolve(t.from);
      for (; n.parent && n.parent.from == n.from; )
        n = n.parent;
      if (ib(n, e))
        break;
      t = this.state.doc.lineAt(n.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return Nd(this.context.next, this.base, this.pos);
  }
}
function ib(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function sb(i) {
  let e = i.node, t = e.childAfter(e.from), n = e.lastChild;
  if (!t)
    return null;
  let s = i.options.simulateBreak, o = i.state.doc.lineAt(t.from), r = s == null || s <= o.from ? o.to : Math.min(o.to, s);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == n)
      return null;
    if (!a.type.isSkipped) {
      if (a.from >= r)
        return null;
      let u = /^ */.exec(o.text.slice(t.to - o.from))[0].length;
      return { from: t.from, to: t.to + u };
    }
    l = a.to;
  }
}
function ob(i, e, t, n, s) {
  let o = i.textAfter, r = o.match(/^\s*/)[0].length, l = n && o.slice(r, r + n.length) == n || s == i.pos + r, a = sb(i);
  return a ? l ? i.column(a.from) : i.column(a.to) : i.baseIndent + (l ? 0 : i.unit * t);
}
class Lr {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(l) {
      let a = li.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof un ? (l) => l.prop(Xi) == r.data : r ? (l) => l == r : void 0, this.style = Ed(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = n ? new li(n) : null, this.themeType = t.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(e, t) {
    return new Lr(e, t || {});
  }
}
const ta = /* @__PURE__ */ de.define(), rb = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function cl(i) {
  let e = i.facet(ta);
  return e.length ? e : i.facet(rb);
}
function lb(i, e) {
  let t = [ub], n;
  return i instanceof Lr && (i.module && t.push(me.styleModule.of(i.module)), n = i.themeType), n ? t.push(ta.computeN([me.darkTheme], (s) => s.facet(me.darkTheme) == (n == "dark") ? [i] : [])) : t.push(ta.of(i)), t;
}
class ab {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Bn(e.state), this.decorations = this.buildDeco(e, cl(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Bn(e.state), n = cl(e.state), s = n != cl(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Xe.none;
    let n = new Di();
    for (let { from: s, to: o } of e.visibleRanges)
      Uy(this.tree, t, (r, l, a) => {
        n.add(r, l, this.markCache[a] || (this.markCache[a] = Xe.mark({ class: a })));
      }, s, o);
    return n.finish();
  }
}
const ub = /* @__PURE__ */ br.high(/* @__PURE__ */ zt.fromClass(ab, {
  decorations: (i) => i.decorations
})), cb = 1e4, hb = "()[]{}", db = /* @__PURE__ */ new Ee();
function na(i, e, t) {
  let n = i.prop(e < 0 ? Ee.openedBy : Ee.closedBy);
  if (n)
    return n;
  if (i.name.length == 1) {
    let s = t.indexOf(i.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function ia(i) {
  let e = i.type.prop(db);
  return e ? e(i.node) : i;
}
function Ji(i, e, t, n = {}) {
  let s = n.maxScanDistance || cb, o = n.brackets || hb, r = Bn(i), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = na(a.type, t, o);
    if (u && a.from < a.to) {
      let c = ia(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return fb(i, e, t, a, c, u, o);
    }
  }
  return pb(i, e, t, r, l.type, s, o);
}
function fb(i, e, t, n, s, o, r) {
  let l = n.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let d = ia(c);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (na(c.type, t, r))
          u++;
        else if (na(c.type, -t, r)) {
          if (u == 0) {
            let d = ia(c);
            return {
              start: a,
              end: d && d.from < d.to ? { from: d.from, to: d.to } : void 0,
              matched: !1
            };
          }
          u--;
        }
      }
    while (t < 0 ? c.prevSibling() : c.nextSibling());
  return { start: a, matched: !1 };
}
function pb(i, e, t, n, s, o, r) {
  if (t < 0 ? !e : e == i.doc.length)
    return null;
  let l = t < 0 ? i.sliceDoc(e - 1, e) : i.sliceDoc(e, e + 1), a = r.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let u = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = i.doc.iterRange(e, t > 0 ? i.doc.length : 0), d = 0;
  for (let h = 0; !c.next().done && h <= o; ) {
    let f = c.value;
    t < 0 && (h += f.length);
    let m = e + h * t;
    for (let k = t > 0 ? 0 : f.length - 1, b = t > 0 ? f.length : -1; k != b; k += t) {
      let M = r.indexOf(f[k]);
      if (!(M < 0 || n.resolveInner(m + k, 1).type != s))
        if (M % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: u, end: { from: m + k, to: m + k + 1 }, matched: M >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (h += f.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function mc(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let o = s;
  for (let r = n; r < e; r++)
    i.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Vd {
  /**
  Create a stream.
  */
  constructor(e, t, n, s) {
    this.string = e, this.tabSize = t, this.indentUnit = n, this.overrideIndent = s, this.pos = 0, this.start = 0, this.lastColumnPos = 0, this.lastColumnValue = 0;
  }
  /**
  True if we are at the end of the line.
  */
  eol() {
    return this.pos >= this.string.length;
  }
  /**
  True if we are at the start of the line.
  */
  sol() {
    return this.pos == 0;
  }
  /**
  Get the next code unit after the current position, or undefined
  if we're at the end of the line.
  */
  peek() {
    return this.string.charAt(this.pos) || void 0;
  }
  /**
  Read the next code unit and advance `this.pos`.
  */
  next() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  }
  /**
  Match the next character against the given string, regular
  expression, or predicate. Consume and return it if it matches.
  */
  eat(e) {
    let t = this.string.charAt(this.pos), n;
    if (typeof e == "string" ? n = t == e : n = t && (e instanceof RegExp ? e.test(t) : e(t)), n)
      return ++this.pos, t;
  }
  /**
  Continue matching characters that match the given string,
  regular expression, or predicate function. Return true if any
  characters were consumed.
  */
  eatWhile(e) {
    let t = this.pos;
    for (; this.eat(e); )
      ;
    return this.pos > t;
  }
  /**
  Consume whitespace ahead of `this.pos`. Return true if any was
  found.
  */
  eatSpace() {
    let e = this.pos;
    for (; /[\s\u00a0]/.test(this.string.charAt(this.pos)); )
      ++this.pos;
    return this.pos > e;
  }
  /**
  Move to the end of the line.
  */
  skipToEnd() {
    this.pos = this.string.length;
  }
  /**
  Move to directly before the given character, if found on the
  current line.
  */
  skipTo(e) {
    let t = this.string.indexOf(e, this.pos);
    if (t > -1)
      return this.pos = t, !0;
  }
  /**
  Move back `n` characters.
  */
  backUp(e) {
    this.pos -= e;
  }
  /**
  Get the column position at `this.pos`.
  */
  column() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = mc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : mc(this.string, null, this.tabSize);
  }
  /**
  Match the input against the given string or regular expression
  (which should start with a `^`). Return true or the regexp match
  if it matches.
  
  Unless `consume` is set to `false`, this will move `this.pos`
  past the matched text.
  
  When matching a string `caseInsensitive` can be set to true to
  make the match case-insensitive.
  */
  match(e, t, n) {
    if (typeof e == "string") {
      let s = (r) => n ? r.toLowerCase() : r, o = this.string.substr(this.pos, e.length);
      return s(o) == s(e) ? (t !== !1 && (this.pos += e.length), !0) : null;
    } else {
      let s = this.string.slice(this.pos).match(e);
      return s && s.index > 0 ? null : (s && t !== !1 && (this.pos += s[0].length), s);
    }
  }
  /**
  Get the current token.
  */
  current() {
    return this.string.slice(this.start, this.pos);
  }
}
function mb(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || gb,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || Pa,
    mergeTokens: i.mergeTokens !== !1
  };
}
function gb(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const gc = /* @__PURE__ */ new WeakMap();
class Ra extends un {
  constructor(e) {
    let t = qy(e.languageData), n = mb(e), s, o = new class extends Bd {
      createParse(r, l, a) {
        return new yb(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = wb(t, this), s = this, this.streamParser = n, this.stateAfter = new Ee({ perNode: !0 }), this.tokenTable = e.tokenTable ? new Fd(n.tokenTable) : kb;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Ra(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = gc.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Ia(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = n ? n(a.from) : -1, d = new Vd(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; d.pos < u - a.from; )
          zd(this.streamParser.token, d, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return n && t == null && gc.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Ia(i, e, t, n, s) {
  let o = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (o)
    return { state: i.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof Qe && a < s && Ia(i, l, a, n, s);
    if (u)
      return u;
  }
  return null;
}
function Hd(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < n && l instanceof Qe) {
      if (!(a = Hd(i, l, t - r, n - r, s)))
        break;
      return s ? new Qe(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function vb(i, e, t, n, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Ia(i, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= n && (u = Hd(i, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: i.streamParser.startState(s ? Pi(s) : 4), tree: Qe.empty };
}
class yb {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = hs.get(), r = s[0].from, { state: l, tree: a } = vb(e, n, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Pi(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = hs.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
      t,
      this.chunkStart + 512
      /* C.ChunkSize */
    );
    for (e && (n = Math.min(n, e.viewport.to)); this.parsedPos < n; )
      this.parseLine(e);
    return this.chunkStart < this.parsedPos && this.finishChunk(), this.parsedPos >= t ? this.finish() : e && this.parsedPos >= e.viewport.to ? (e.skipUntilInView(this.parsedPos, t), this.finish()) : null;
  }
  stopAt(e) {
    this.stoppedAt = e;
  }
  lineAfter(e) {
    let t = this.input.chunk(e);
    if (this.input.lineChunks)
      t == `
` && (t = "");
    else {
      let n = t.indexOf(`
`);
      n > -1 && (t = t.slice(0, n));
    }
    return e + t.length <= this.to ? t : t.slice(0, this.to - e);
  }
  nextLine() {
    let e = this.parsedPos, t = this.lineAfter(e), n = e + t.length;
    for (let s = this.rangeIndex; ; ) {
      let o = this.ranges[s].to;
      if (o >= n || (t = t.slice(0, o - (n - t.length)), s++, s == this.ranges.length))
        break;
      let r = this.ranges[s].from, l = this.lineAfter(r);
      t += l, n = r + l.length;
    }
    return { line: t, end: n };
  }
  skipGapsTo(e, t, n) {
    for (; ; ) {
      let s = this.ranges[this.rangeIndex].to, o = e + t;
      if (n > 0 ? s > o : s >= o)
        break;
      let r = this.ranges[++this.rangeIndex].from;
      t += r - s;
    }
    return t;
  }
  moveRangeIndex() {
    for (; this.ranges[this.rangeIndex].to < this.parsedPos; )
      this.rangeIndex++;
  }
  emitToken(e, t, n, s) {
    let o = 4;
    if (this.ranges.length > 1) {
      s = this.skipGapsTo(t, s, 1), t += s;
      let l = this.chunk.length;
      s = this.skipGapsTo(n, s, -1), n += s, o += this.chunk.length - l;
    }
    let r = this.chunk.length - 4;
    return this.lang.streamParser.mergeTokens && o == 4 && r >= 0 && this.chunk[r] == e && this.chunk[r + 2] == t ? this.chunk[r + 2] = n : this.chunk.push(e, t, n, o), s;
  }
  parseLine(e) {
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Vd(t, e ? e.state.tabSize : 4, e ? Pi(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = zd(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = n, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = Qe.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: bb,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new Qe(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new Qe(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function zd(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const Pa = /* @__PURE__ */ Object.create(null), eo = [Nt.none], bb = /* @__PURE__ */ new $a(eo), vc = [], yc = /* @__PURE__ */ Object.create(null), Wd = /* @__PURE__ */ Object.create(null);
for (let [i, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  Wd[i] = /* @__PURE__ */ _d(Pa, e);
class Fd {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Wd);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = _d(this.extra, e)) : 0;
  }
}
const kb = /* @__PURE__ */ new Fd(Pa);
function hl(i, e) {
  vc.indexOf(i) > -1 || (vc.push(i), console.warn(e));
}
function _d(i, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = i[u] || Se[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : hl(u, `Modifier ${u} used at start of tag`) : a.length ? hl(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : hl(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((l) => l.id), o = yc[s];
  if (o)
    return o.id;
  let r = yc[s] = Nt.define({
    id: eo.length,
    name: n,
    props: [_y({ [n]: t })]
  });
  return eo.push(r), r.id;
}
function wb(i, e) {
  let t = Nt.define({ id: eo.length, name: "Document", props: [
    Xi.add(() => i),
    Pd.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return eo.push(t), t;
}
Ye.RTL, Ye.LTR;
const xb = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = Va(i.state, t.from);
  return n.line ? Sb(i) : n.block ? Mb(i) : !1;
};
function Na(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const Sb = /* @__PURE__ */ Na(
  $b,
  0
  /* CommentOption.Toggle */
), Cb = /* @__PURE__ */ Na(
  Kd,
  0
  /* CommentOption.Toggle */
), Mb = /* @__PURE__ */ Na(
  (i, e) => Kd(i, e, Tb(e)),
  0
  /* CommentOption.Toggle */
);
function Va(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const As = 50;
function Ab(i, { open: e, close: t }, n, s) {
  let o = i.sliceDoc(n - As, n), r = i.sliceDoc(s, s + As), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, d;
  s - n <= 2 * As ? c = d = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + As), d = i.sliceDoc(s - As, s));
  let h = /^\s*/.exec(c)[0].length, f = /\s*$/.exec(d)[0].length, m = d.length - f - t.length;
  return c.slice(h, h + e.length) == e && d.slice(m, m + t.length) == t ? {
    open: {
      pos: n + h + e.length,
      margin: /\s/.test(c.charAt(h + e.length)) ? 1 : 0
    },
    close: {
      pos: s - f - t.length,
      margin: /\s/.test(d.charAt(m - 1)) ? 1 : 0
    }
  } : null;
}
function Tb(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function Kd(i, e, t = e.selection.ranges) {
  let n = t.map((o) => Va(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let s = t.map((o, r) => Ab(e, n[r], o.from, o.to));
  if (i != 2 && !s.every((o) => o))
    return { changes: e.changes(t.map((o, r) => s[r] ? [] : [{ from: o.from, insert: n[r].open + " " }, { from: o.to, insert: " " + n[r].close }])) };
  if (i != 1 && s.some((o) => o)) {
    let o = [];
    for (let r = 0, l; r < s.length; r++)
      if (l = s[r]) {
        let a = n[r], { open: u, close: c } = l;
        o.push({ from: u.pos - a.open.length, to: u.pos + u.margin }, { from: c.pos - c.margin, to: c.pos + a.close.length });
      }
    return { changes: o };
  }
  return null;
}
function $b(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = n.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let d = e.doc.lineAt(c);
      if (u == null && (u = Va(e, d.from).line, !u))
        continue e;
      if (d.from > s && (o == r || r > d.from)) {
        s = d.from;
        let h = /^\s*/.exec(d.text)[0].length, f = h == d.length, m = d.text.slice(h, h + u.length) == u ? h : -1;
        h < d.text.length && h < a && (a = h), n.push({ line: d, comment: m, token: u, indent: h, empty: f, single: !1 });
      }
      c = d.to + 1;
    }
    if (a < 1e9)
      for (let c = l; c < n.length; c++)
        n[c].indent < n[c].line.text.length && (n[c].indent = a);
    n.length == l + 1 && (n[l].single = !0);
  }
  if (i != 2 && n.some((o) => o.comment < 0 && (!o.empty || o.single))) {
    let o = [];
    for (let { line: l, token: a, indent: u, empty: c, single: d } of n)
      (d || !c) && o.push({ from: l.from + u, insert: a + " " });
    let r = e.changes(o);
    return { changes: r, selection: e.selection.map(r, 1) };
  } else if (i != 1 && n.some((o) => o.comment >= 0)) {
    let o = [];
    for (let { line: r, comment: l, token: a } of n)
      if (l >= 0) {
        let u = r.from + l, c = u + a.length;
        r.text[c - r.from] == " " && c++, o.push({ from: u, to: c });
      }
    return { changes: o };
  }
  return null;
}
function bs(i, e) {
  return J.create(i.ranges.map(e), i.mainIndex);
}
function fn(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function pn({ state: i, dispatch: e }, t) {
  let n = bs(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(fn(i, n)), !0);
}
function Br(i, e) {
  return J.cursor(e ? i.to : i.from);
}
function Ud(i, e) {
  return pn(i, (t) => t.empty ? i.moveByChar(t, e) : Br(t, e));
}
function Mt(i) {
  return i.textDirectionAt(i.state.selection.main.head) == Ye.LTR;
}
const Gd = (i) => Ud(i, !Mt(i)), jd = (i) => Ud(i, Mt(i));
function qd(i, e) {
  return pn(i, (t) => t.empty ? i.moveByGroup(t, e) : Br(t, e));
}
const Db = (i) => qd(i, !Mt(i)), Lb = (i) => qd(i, Mt(i));
function Bb(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Or(i, e, t) {
  let n = Bn(i).resolveInner(e.head), s = t ? Ee.closedBy : Ee.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? n.childAfter(a) : n.childBefore(a);
    if (!u)
      break;
    Bb(i, u, s) ? n = u : a = t ? u.to : u.from;
  }
  let o = n.type.prop(s), r, l;
  return o && (r = t ? Ji(i, n.from, 1) : Ji(i, n.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? n.to : n.from, J.cursor(l, t ? -1 : 1);
}
const Ob = (i) => pn(i, (e) => Or(i.state, e, !Mt(i))), Eb = (i) => pn(i, (e) => Or(i.state, e, Mt(i)));
function Yd(i, e) {
  return pn(i, (t) => {
    if (!t.empty)
      return Br(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const Xd = (i) => Yd(i, !1), Jd = (i) => Yd(i, !0);
function Zd(i) {
  let e = i.scrollDOM.clientHeight < i.scrollDOM.scrollHeight - 2, t = 0, n = 0, s;
  if (e) {
    for (let o of i.state.facet(me.scrollMargins)) {
      let r = o(i);
      r?.top && (t = Math.max(r?.top, t)), r?.bottom && (n = Math.max(r?.bottom, n));
    }
    s = i.scrollDOM.clientHeight - t - n;
  } else
    s = (i.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: n,
    selfScroll: e,
    height: Math.max(i.defaultLineHeight, s - 5)
  };
}
function Qd(i, e) {
  let t = Zd(i), { state: n } = i, s = bs(n.selection, (r) => r.empty ? i.moveVertically(r, e, t.height) : Br(r, e));
  if (s.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = i.coordsAtPos(n.selection.main.head), l = i.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = me.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return i.dispatch(fn(n, s), { effects: o }), !0;
}
const bc = (i) => Qd(i, !1), sa = (i) => Qd(i, !0);
function di(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let o = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (s = J.cursor(n.from + o));
  }
  return s;
}
const Rb = (i) => pn(i, (e) => di(i, e, !0)), Ib = (i) => pn(i, (e) => di(i, e, !1)), Pb = (i) => pn(i, (e) => di(i, e, !Mt(i))), Nb = (i) => pn(i, (e) => di(i, e, Mt(i))), Vb = (i) => pn(i, (e) => i.moveToLineBoundary(e, !1, !1)), Hb = (i) => pn(i, (e) => i.moveToLineBoundary(e, !0, !1));
function zb(i, e, t) {
  let n = !1, s = bs(i.selection, (o) => {
    let r = Ji(i, o.head, -1) || Ji(i, o.head, 1) || o.head > 0 && Ji(i, o.head - 1, 1) || o.head < i.doc.length && Ji(i, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    n = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return J.cursor(l);
  });
  return n ? (e(fn(i, s)), !0) : !1;
}
const Wb = ({ state: i, dispatch: e }) => zb(i, e);
function en(i, e, t) {
  let n = bs(i.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = J.range(s.head, s.anchor));
    let o = t(s);
    return J.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(i.state.selection) ? !1 : (i.dispatch(fn(i.state, n)), !0);
}
function ef(i, e) {
  return en(i, e, (t) => i.moveByChar(t, e));
}
const tf = (i) => ef(i, !Mt(i)), nf = (i) => ef(i, Mt(i));
function sf(i, e) {
  return en(i, e, (t) => i.moveByGroup(t, e));
}
const Fb = (i) => sf(i, !Mt(i)), _b = (i) => sf(i, Mt(i)), Kb = (i) => {
  let e = !Mt(i);
  return en(i, e, (t) => Or(i.state, t, e));
}, Ub = (i) => {
  let e = Mt(i);
  return en(i, e, (t) => Or(i.state, t, e));
};
function of(i, e) {
  return en(i, e, (t) => i.moveVertically(t, e));
}
const rf = (i) => of(i, !1), lf = (i) => of(i, !0);
function af(i, e) {
  return en(i, e, (t) => i.moveVertically(t, e, Zd(i).height));
}
const kc = (i) => af(i, !1), wc = (i) => af(i, !0), Gb = (i) => en(i, !0, (e) => di(i, e, !0)), jb = (i) => en(i, !1, (e) => di(i, e, !1)), qb = (i) => {
  let e = !Mt(i);
  return en(i, e, (t) => di(i, t, e));
}, Yb = (i) => {
  let e = Mt(i);
  return en(i, e, (t) => di(i, t, e));
}, Xb = (i) => en(i, !1, (e) => J.cursor(i.lineBlockAt(e.head).from)), Jb = (i) => en(i, !0, (e) => J.cursor(i.lineBlockAt(e.head).to)), xc = ({ state: i, dispatch: e }) => (e(fn(i, { anchor: 0 })), !0), Sc = ({ state: i, dispatch: e }) => (e(fn(i, { anchor: i.doc.length })), !0), Cc = ({ state: i, dispatch: e }) => (e(fn(i, { anchor: i.selection.main.anchor, head: 0 })), !0), Mc = ({ state: i, dispatch: e }) => (e(fn(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), Zb = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), Qb = ({ state: i, dispatch: e }) => {
  let t = Er(i).map(({ from: n, to: s }) => J.undirectionalRange(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: J.create(t), userEvent: "select" })), !0;
}, e0 = ({ state: i, dispatch: e }) => {
  let t = bs(i.selection, (n) => {
    let s = Bn(i), o = s.resolveStack(n.from, 1);
    if (n.empty) {
      let r = s.resolveStack(n.from, -1);
      r.node.from >= o.node.from && r.node.to <= o.node.to && (o = r);
    }
    for (let r = o; r; r = r.next) {
      let { node: l } = r;
      if ((l.from < n.from && l.to >= n.to || l.to > n.to && l.from <= n.from) && r.next)
        return J.undirectionalRange(l.from, l.to);
    }
    return n;
  });
  return t.eq(i.selection) ? !1 : (e(fn(i, t)), !0);
};
function uf(i, e) {
  let { state: t } = i, n = t.selection, s = t.selection.ranges.slice();
  for (let o of t.selection.ranges) {
    let r = t.doc.lineAt(o.head);
    if (e ? r.to < i.state.doc.length : r.from > 0)
      for (let l = o; ; ) {
        let a = i.moveVertically(l, e);
        if (a.head < r.from || a.head > r.to) {
          s.some((u) => u.head == a.head) || s.push(a);
          break;
        } else {
          if (a.head == l.head)
            break;
          l = a;
        }
      }
  }
  return s.length == n.ranges.length ? !1 : (i.dispatch(fn(t, J.create(s, s.length - 1))), !0);
}
const t0 = (i) => uf(i, !1), n0 = (i) => uf(i, !0), i0 = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = J.create([t.main]) : t.main.empty || (n = J.create([J.cursor(t.main.head)])), n ? (e(fn(i, n)), !0) : !1;
};
function lo(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = Bo(i, a, !1)) : a > r && (t = "delete.forward", a = Bo(i, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = Bo(i, r, !1), l = Bo(i, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: J.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? me.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Bo(i, e, t) {
  if (i instanceof me)
    for (let n of i.state.facet(me.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const cf = (i, e, t) => lo(i, (n) => {
  let s = n.from, { state: o } = i, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = xr(l, o.tabSize), c = u % Pi(o) || Pi(o);
    for (let d = 0; d < c && l[l.length - 1 - d] == " "; d++)
      s--;
    a = s;
  } else
    a = xt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = xt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), oa = (i) => cf(i, !1, !0), hf = (i) => cf(i, !0, !1), df = (i, e) => lo(i, (t) => {
  let n = t.head, { state: s } = i, o = s.doc.lineAt(n), r = s.charCategorizer(n);
  for (let l = null; ; ) {
    if (n == (e ? o.to : o.from)) {
      n == t.head && o.number != (e ? s.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let a = xt(o.text, n - o.from, e) + o.from, u = o.text.slice(Math.min(n, a) - o.from, Math.max(n, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || n != t.head) && (l = c), n = a;
  }
  return n;
}), ff = (i) => df(i, !1), s0 = (i) => df(i, !0), o0 = (i) => lo(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), r0 = (i) => lo(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), l0 = (i) => lo(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), a0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: Pe.of(["", ""]) },
    range: J.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, u0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, o = i.doc.lineAt(s), r = s == o.from ? s - 1 : xt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : xt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: i.doc.slice(s, l).append(i.doc.slice(r, s)) },
      range: J.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(i.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Er(i) {
  let e = [], t = -1;
  for (let n of i.selection.ranges) {
    let s = i.doc.lineAt(n.from), o = i.doc.lineAt(n.to);
    if (!n.empty && n.to == o.from && (o = i.doc.lineAt(n.to - 1)), t >= s.number) {
      let r = e[e.length - 1];
      r.to = o.to, r.ranges.push(n);
    } else
      e.push({ from: s.from, to: o.to, ranges: [n] });
    t = o.number + 1;
  }
  return e;
}
function pf(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [], s = [];
  for (let o of Er(i)) {
    if (t ? o.to == i.doc.length : o.from == 0)
      continue;
    let r = i.doc.lineAt(t ? o.to + 1 : o.from - 1), l = r.length + 1;
    if (t) {
      n.push({ from: o.to, to: r.to }, { from: o.from, insert: r.text + i.lineBreak });
      for (let a of o.ranges)
        s.push(J.range(Math.min(i.doc.length, a.anchor + l), Math.min(i.doc.length, a.head + l)));
    } else {
      n.push({ from: r.from, to: o.from }, { from: o.to, insert: i.lineBreak + r.text });
      for (let a of o.ranges)
        s.push(J.range(a.anchor - l, a.head - l));
    }
  }
  return n.length ? (e(i.update({
    changes: n,
    scrollIntoView: !0,
    selection: J.create(s, i.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const c0 = ({ state: i, dispatch: e }) => pf(i, e, !1), h0 = ({ state: i, dispatch: e }) => pf(i, e, !0);
function mf(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [];
  for (let o of Er(i))
    t ? n.push({ from: o.from, insert: i.doc.slice(o.from, o.to) + i.lineBreak }) : n.push({ from: o.to, insert: i.lineBreak + i.doc.slice(o.from, o.to) });
  let s = i.changes(n);
  return e(i.update({
    changes: s,
    selection: i.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const d0 = ({ state: i, dispatch: e }) => mf(i, e, !1), f0 = ({ state: i, dispatch: e }) => mf(i, e, !0), p0 = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(Er(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), n = bs(e.selection, (s) => {
    let o;
    if (i.lineWrapping) {
      let r = i.lineBlockAt(s.head), l = i.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + i.documentTop - l.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, o);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function m0(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Bn(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), o;
  return n && s && n.to <= e && s.from >= e && (o = n.type.prop(Ee.closedBy)) && o.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const Ac = /* @__PURE__ */ gf(!1), g0 = /* @__PURE__ */ gf(!0);
function gf(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !i && o == r && m0(e, o);
      i && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new Dr(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Id(u, o);
      for (c == null && (c = xr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", cr(e, c)];
      return a && d.push(cr(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: Pe.of(d) },
        range: J.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Ha(i, e) {
  let t = -1;
  return i.changeByRange((n) => {
    let s = [];
    for (let r = n.from; r <= n.to; ) {
      let l = i.doc.lineAt(r);
      l.number > t && (n.empty || n.to > l.from) && (e(l, s, n), t = l.number), r = l.to + 1;
    }
    let o = i.changes(s);
    return {
      changes: s,
      range: J.range(o.mapPos(n.anchor, 1), o.mapPos(n.head, 1))
    };
  });
}
const v0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new Dr(i, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = Ha(i, (o, r, l) => {
    let a = Id(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = cr(i, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, y0 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ha(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(Oa) });
}), { userEvent: "input.indent" })), !0), b0 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ha(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = xr(s, i.tabSize), r = 0, l = cr(i, Math.max(0, o - Pi(i)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  n.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), k0 = (i) => (i.setTabFocusMode(), !0), w0 = [
  { key: "Ctrl-b", run: Gd, shift: tf, preventDefault: !0 },
  { key: "Ctrl-f", run: jd, shift: nf },
  { key: "Ctrl-p", run: Xd, shift: rf },
  { key: "Ctrl-n", run: Jd, shift: lf },
  { key: "Ctrl-a", run: Vb, shift: Xb },
  { key: "Ctrl-e", run: Hb, shift: Jb },
  { key: "Ctrl-d", run: hf },
  { key: "Ctrl-h", run: oa },
  { key: "Ctrl-k", run: o0 },
  { key: "Ctrl-Alt-h", run: ff },
  { key: "Ctrl-o", run: a0 },
  { key: "Ctrl-t", run: u0 },
  { key: "Ctrl-v", run: sa }
], x0 = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Gd, shift: tf, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: Db, shift: Fb, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: Pb, shift: qb, preventDefault: !0 },
  { key: "ArrowRight", run: jd, shift: nf, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: Lb, shift: _b, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: Nb, shift: Yb, preventDefault: !0 },
  { key: "ArrowUp", run: Xd, shift: rf, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: xc, shift: Cc },
  { mac: "Ctrl-ArrowUp", run: bc, shift: kc },
  { key: "ArrowDown", run: Jd, shift: lf, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Sc, shift: Mc },
  { mac: "Ctrl-ArrowDown", run: sa, shift: wc },
  { key: "PageUp", run: bc, shift: kc },
  { key: "PageDown", run: sa, shift: wc },
  { key: "Home", run: Ib, shift: jb, preventDefault: !0 },
  { key: "Mod-Home", run: xc, shift: Cc },
  { key: "End", run: Rb, shift: Gb, preventDefault: !0 },
  { key: "Mod-End", run: Sc, shift: Mc },
  { key: "Enter", run: Ac, shift: Ac },
  { key: "Mod-a", run: Zb },
  { key: "Backspace", run: oa, shift: oa, preventDefault: !0 },
  { key: "Delete", run: hf, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: ff, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: s0, preventDefault: !0 },
  { mac: "Mod-Backspace", run: r0, preventDefault: !0 },
  { mac: "Mod-Delete", run: l0, preventDefault: !0 }
].concat(/* @__PURE__ */ w0.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), S0 = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: Ob, shift: Kb },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: Eb, shift: Ub },
  { key: "Alt-ArrowUp", run: c0 },
  { key: "Shift-Alt-ArrowUp", run: d0 },
  { key: "Alt-ArrowDown", run: h0 },
  { key: "Shift-Alt-ArrowDown", run: f0 },
  { key: "Mod-Alt-ArrowUp", run: t0 },
  { key: "Mod-Alt-ArrowDown", run: n0 },
  { key: "Escape", run: i0 },
  { key: "Mod-Enter", run: g0 },
  { key: "Alt-l", mac: "Ctrl-l", run: Qb },
  { key: "Mod-i", run: e0, preventDefault: !0 },
  { key: "Mod-[", run: b0 },
  { key: "Mod-]", run: y0 },
  { key: "Mod-Alt-\\", run: v0 },
  { key: "Shift-Mod-k", run: p0 },
  { key: "Shift-Mod-\\", run: Wb },
  { key: "Mod-/", run: xb },
  { key: "Alt-A", mac: "Ctrl-A", run: Cb },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: k0 }
].concat(x0);
class Tc {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.diagnostic = n;
  }
}
class Mi {
  constructor(e, t, n) {
    this.diagnostics = e, this.panel = t, this.selected = n;
  }
  static init(e, t, n) {
    let s = n.facet(to).markerFilter;
    s && (e = s(e, n));
    let o = e.slice().sort((f, m) => f.from - m.from || f.to - m.to), r = new Di(), l = [], a = 0, u = n.doc.iter(), c = 0, d = n.doc.length;
    for (let f = 0; ; ) {
      let m = f == o.length ? null : o[f];
      if (!m && !l.length)
        break;
      let k, b;
      if (l.length)
        k = a, b = l.reduce((L, H) => Math.min(L, H.to), m && m.from > k ? m.from : 1e8);
      else {
        if (k = m.from, k > d)
          break;
        b = m.to, l.push(m), f++;
      }
      for (; f < o.length; ) {
        let L = o[f];
        if (L.from == k && (L.to > L.from || L.to == k))
          l.push(L), f++, b = Math.min(L.to, b);
        else {
          b = Math.min(L.from, b);
          break;
        }
      }
      b = Math.min(b, d);
      let M = !1;
      if (l.some((L) => L.from == k && (L.to == b || b == d)) && (M = k == b, !M && b - k < 10)) {
        let L = k - (c + u.value.length);
        L > 0 && (u.next(L), c = k);
        for (let H = k; ; ) {
          if (H >= b) {
            M = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > H)
            break;
          H = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let $ = Sf(l);
      if (M)
        r.add(k, k, Xe.widget({
          widget: new T0($),
          diagnostics: l.slice()
        }));
      else {
        let L = l.reduce((H, V) => V.markClass ? H + " " + V.markClass : H, "");
        r.add(k, b, Xe.mark({
          class: "cm-lintRange cm-lintRange-" + $ + L,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((H) => H.to > b)
        }));
      }
      if (a = b, a == d)
        break;
      for (let L = 0; L < l.length; L++)
        l[L].to <= a && l.splice(L--, 1);
    }
    let h = r.finish();
    return new Mi(h, t, ps(h));
  }
}
function ps(i, e = null, t = 0) {
  let n = null;
  return i.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!n)
        n = new Tc(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(n.diagnostic) < 0)
          return !1;
        n = new Tc(n.from, o, n.diagnostic);
      }
  }), n;
}
function vf(i, e) {
  let t = e.pos, n = e.end || t, s = i.state.facet(to).hideOn(i, t, n);
  if (s != null)
    return s;
  let o = i.startState.doc.lineAt(e.pos);
  return !!(i.effects.some((r) => r.is(Rr)) || i.changes.touchesRange(o.from, Math.max(o.to, n)));
}
function C0(i, e) {
  return i.field(cn, !1) ? e : e.concat(qe.appendConfig.of(P0));
}
function dl(i, e) {
  return {
    effects: C0(i, [Rr.of(e)])
  };
}
const Rr = /* @__PURE__ */ qe.define(), yf = /* @__PURE__ */ qe.define(), bf = /* @__PURE__ */ qe.define(), cn = /* @__PURE__ */ dn.define({
  create() {
    return new Mi(Xe.none, null, null);
  },
  update(i, e) {
    if (e.docChanged && i.diagnostics.size) {
      let t = i.diagnostics.map(e.changes), n = null, s = i.panel;
      if (i.selected) {
        let o = e.changes.mapPos(i.selected.from, 1);
        n = ps(t, i.selected.diagnostic, o) || ps(t, null, o);
      }
      !t.size && s && e.state.facet(to).autoPanel && (s = null), i = new Mi(t, s, n);
    }
    for (let t of e.effects)
      if (t.is(Rr)) {
        let n = e.state.facet(to).autoPanel ? t.value.length ? hr.open : null : i.panel;
        i = Mi.init(t.value, n, e.state);
      } else t.is(yf) ? i = new Mi(i.diagnostics, t.value ? hr.open : null, i.selected) : t.is(bf) && (i = new Mi(i.diagnostics, i.panel, t.value));
    return i;
  },
  provide: (i) => [
    Xl.from(i, (e) => e.panel),
    me.decorations.from(i, (e) => e.diagnostics)
  ]
}), M0 = /* @__PURE__ */ Xe.mark({ class: "cm-lintRange cm-lintRange-active" });
function A0(i, e, t) {
  let { diagnostics: n } = i.state.field(cn), s, o = -1, r = -1;
  n.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = i.state.facet(to).tooltipFilter;
  return s && l && (s = l(s, i.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: kf(i, s) };
    }
  } : null;
}
function kf(i, e) {
  return $n("ul", { class: "cm-tooltip-lint" }, e.map((t) => xf(i, t, !1)));
}
const $c = (i) => {
  let e = i.state.field(cn, !1);
  return !e || !e.panel ? !1 : (i.dispatch({ effects: yf.of(!1) }), !0);
}, to = /* @__PURE__ */ de.define({
  combine(i) {
    return {
      sources: i.map((e) => e.source).filter((e) => e != null),
      ...wr(i.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: Dc,
        tooltipFilter: Dc,
        needsRefresh: (e, t) => e ? t ? (n) => e(n) || t(n) : e : t,
        hideOn: (e, t) => e ? t ? (n, s, o) => e(n, s, o) || t(n, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function Dc(i, e) {
  return i ? e ? (t, n) => e(i(t, n), n) : i : e;
}
function wf(i) {
  let e = [];
  if (i)
    e: for (let { name: t } of i) {
      for (let n = 0; n < t.length; n++) {
        let s = t[n];
        if (/[a-zA-Z]/.test(s) && !e.some((o) => o.toLowerCase() == s.toLowerCase())) {
          e.push(s);
          continue e;
        }
      }
      e.push("");
    }
  return e;
}
function xf(i, e, t) {
  var n;
  let s = t ? wf(e.actions) : [];
  return $n("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, $n("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(i) : e.message), (n = e.actions) === null || n === void 0 ? void 0 : n.map((o, r) => {
    let l = !1, a = (f) => {
      if (f.preventDefault(), l)
        return;
      l = !0;
      let m = ps(i.state.field(cn).diagnostics, e);
      m && o.apply(i, m.from, m.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, d = c < 0 ? u : [
      u.slice(0, c),
      $n("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], h = o.markClass ? " " + o.markClass : "";
    return $n("button", {
      type: "button",
      class: "cm-diagnosticAction" + h,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, d);
  }), e.source && $n("div", { class: "cm-diagnosticSource" }, e.source));
}
class T0 extends io {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return $n("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class Lc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = xf(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class hr {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          $c(this.view), this.view.focus();
        else if (s.keyCode == 38 || s.keyCode == 33)
          this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
        else if (s.keyCode == 40 || s.keyCode == 34)
          this.moveSelection((this.selectedIndex + 1) % this.items.length);
        else if (s.keyCode == 36)
          this.moveSelection(0);
        else if (s.keyCode == 35)
          this.moveSelection(this.items.length - 1);
        else if (s.keyCode == 13)
          this.view.focus();
        else if (s.keyCode >= 65 && s.keyCode <= 90 && this.selectedIndex >= 0) {
          let { diagnostic: o } = this.items[this.selectedIndex], r = wf(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = ps(this.view.state.field(cn).diagnostics, o);
              a && o.actions[l].apply(e, a.from, a.to);
            }
        } else
          return;
        s.preventDefault();
      }
    }, n = (s) => {
      for (let o = 0; o < this.items.length; o++)
        this.items[o].dom.contains(s.target) && this.moveSelection(o);
    };
    this.list = $n("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: n
    }), this.dom = $n("div", { class: "cm-panel-lint" }, this.list, $n("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => $c(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(cn).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(cn), n = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
    for (e.between(0, this.view.state.doc.length, (l, a, { spec: u }) => {
      for (let c of u.diagnostics) {
        if (r.has(c))
          continue;
        r.add(c);
        let d = -1, h;
        for (let f = n; f < this.items.length; f++)
          if (this.items[f].diagnostic == c) {
            d = f;
            break;
          }
        d < 0 ? (h = new Lc(this.view, c), this.items.splice(n, 0, h), s = !0) : (h = this.items[d], d > n && (this.items.splice(n, d - n), s = !0)), t && h.diagnostic == t.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), o = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), n++;
      }
    }); n < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Lc(this.view, {
      from: -1,
      to: -1,
      severity: "info",
      message: this.view.state.phrase("No diagnostics")
    })), s = !0), o ? (this.list.setAttribute("aria-activedescendant", o.id), this.view.requestMeasure({
      key: this,
      read: () => ({ sel: o.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
      write: ({ sel: l, panel: a }) => {
        let u = a.height / this.list.offsetHeight;
        l.top < a.top ? this.list.scrollTop -= (a.top - l.top) / u : l.bottom > a.bottom && (this.list.scrollTop += (l.bottom - a.bottom) / u);
      }
    })) : this.selectedIndex < 0 && this.list.removeAttribute("aria-activedescendant"), s && this.sync();
  }
  sync() {
    let e = this.list.firstChild;
    function t() {
      let n = e;
      e = n.nextSibling, n.remove();
    }
    for (let n of this.items)
      if (n.dom.parentNode == this.list) {
        for (; e != n.dom; )
          t();
        e = n.dom.nextSibling;
      } else
        this.list.insertBefore(n.dom, e);
    for (; e; )
      t();
  }
  moveSelection(e) {
    if (this.selectedIndex < 0)
      return;
    let t = this.view.state.field(cn), n = ps(t.diagnostics, this.items[e].diagnostic);
    n && this.view.dispatch({
      selection: { anchor: n.from, head: n.to },
      scrollIntoView: !0,
      effects: bf.of(n)
    });
  }
  static open(e) {
    return new hr(e);
  }
}
function jo(i, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(i)}</svg>')`;
}
function Oo(i) {
  return jo(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${i}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const $0 = /* @__PURE__ */ me.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
  ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
  ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
  ".cm-diagnostic-hint": { borderLeft: "5px solid #66d" },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Oo("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Oo("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Oo("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Oo("#66d") },
  ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": { borderBottomColor: "orange" }
  },
  ".cm-lintPoint-info": {
    "&:after": { borderBottomColor: "#999" }
  },
  ".cm-lintPoint-hint": {
    "&:after": { borderBottomColor: "#66d" }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": { textDecoration: "underline" }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": { textDecoration: "none" },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  },
  "&dark .cm-lintRange-active": { backgroundColor: "#86714a80" },
  "&dark .cm-panel.cm-panel-lint ul": {
    "& [aria-selected]": {
      backgroundColor: "#2e343e"
    }
  }
});
function D0(i) {
  return i == "error" ? 4 : i == "warning" ? 3 : i == "info" ? 2 : 1;
}
function Sf(i) {
  let e = "hint", t = 1;
  for (let n of i) {
    let s = D0(n.severity);
    s > t && (t = s, e = n.severity);
  }
  return e;
}
class Cf extends ci {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = Sf(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let n = this.diagnostics, s = e.state.facet(Ir).tooltipFilter;
    return s && (n = s(n, e.state)), n.length && (t.onmouseover = () => B0(e, t, n)), t;
  }
}
function L0(i, e) {
  let t = (n) => {
    let s = e.getBoundingClientRect();
    if (!(n.clientX > s.left - 10 && n.clientX < s.right + 10 && n.clientY > s.top - 10 && n.clientY < s.bottom + 10)) {
      for (let o = n.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), i.state.field(Mf) && i.dispatch({ effects: za.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function B0(i, e, t) {
  function n() {
    let r = i.elementAtHeight(e.getBoundingClientRect().top + 5 - i.documentTop);
    i.coordsAtPos(r.from) && i.dispatch({ effects: za.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: kf(i, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, L0(i, e);
  }
  let { hoverTime: s } = i.state.facet(Ir), o = setTimeout(n, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(n, s);
  };
}
function O0(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = i.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let n = [];
  for (let s in t)
    n.push(new Cf(t[s]).range(+s));
  return Oe.of(n, !0);
}
const E0 = /* @__PURE__ */ Sy({
  class: "cm-gutter-lint",
  markers: (i) => i.state.field(ra),
  widgetMarker: (i, e, t) => {
    let n = [];
    return i.state.field(ra).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && n.push(...r.diagnostics);
    }), n.length ? new Cf(n) : null;
  }
}), ra = /* @__PURE__ */ dn.define({
  create() {
    return Oe.empty;
  },
  update(i, e) {
    i = i.map(e.changes);
    let t = e.state.facet(Ir).markerFilter;
    for (let n of e.effects)
      if (n.is(Rr)) {
        let s = n.value;
        t && (s = t(s || [], e.state)), i = O0(e.state.doc, s.slice(0));
      }
    return i;
  }
}), za = /* @__PURE__ */ qe.define(), Mf = /* @__PURE__ */ dn.define({
  create() {
    return null;
  },
  update(i, e) {
    return i && e.docChanged && (i = vf(e, i) ? null : { ...i, pos: e.changes.mapPos(i.pos) }), e.effects.reduce((t, n) => n.is(za) ? n.value : t, i);
  },
  provide: (i) => Ta.from(i)
}), R0 = /* @__PURE__ */ me.baseTheme({
  ".cm-gutter-lint": {
    width: "1.4em",
    "& .cm-gutterElement": {
      padding: ".2em"
    }
  },
  ".cm-lint-marker": {
    width: "1em",
    height: "1em"
  },
  ".cm-lint-marker-info": {
    content: /* @__PURE__ */ jo('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ jo('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ jo('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), I0 = /* @__PURE__ */ yy(A0, { hideOn: vf }), P0 = [
  cn,
  /* @__PURE__ */ me.decorations.compute([cn], (i) => {
    let { selected: e, panel: t } = i.field(cn);
    return !e || !t || e.from == e.to ? Xe.none : Xe.set([
      M0.range(e.from, e.to)
    ]);
  }),
  I0,
  $0
], Ir = /* @__PURE__ */ de.define({
  combine(i) {
    return wr(i, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function N0(i = {}) {
  return [Ir.of(i), ra, E0, R0, Mf];
}
const Bc = /* @__PURE__ */ Ct({
  __name: "AbcEditor",
  props: {
    text: {},
    diagnostics: {},
    reveal: {},
    readonly: { type: Boolean }
  },
  emits: ["change", "cursor"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = _(null);
    let o = null, r = !1;
    const l = Ra.define({
      token(h) {
        return h.sol() && h.match(/^%.*/) ? "comment" : h.sol() && h.match(/^[A-Za-z]:.*/) ? "meta" : h.match(/^"[^"\n]*"/) ? "string" : h.match(/^\[K:[^\]\n]*\]/) ? "meta" : h.eat("|") ? "punctuation" : h.match(/^[zZ][0-9]*/) ? "atom" : h.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (h.next(), null);
      },
      startState: () => null
    }), a = Lr.define([
      { tag: Se.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: Se.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: Se.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: Se.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: Se.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
    ]), u = me.theme({
      "&": {
        backgroundColor: "var(--comfy-input-bg, #1e1e1e)",
        color: "var(--input-text, #dddddd)",
        fontSize: "12px",
        border: "1px solid var(--border-color, #444)",
        borderRadius: "6px",
        height: "100%"
      },
      "&.cm-focused": { outline: "1px solid #2f6fb0" },
      ".cm-content": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", caretColor: "currentColor" },
      ".cm-gutters": { backgroundColor: "transparent", color: "var(--descrip-text, #888)", border: "none" },
      ".cm-activeLine": { backgroundColor: "rgba(127, 127, 127, 0.08)" },
      ".cm-scroller": { overflow: "auto" }
    });
    function c(h) {
      const f = h.doc.length;
      return t.diagnostics.filter((m) => typeof m.start == "number" && typeof m.end == "number").map((m) => ({
        from: Math.min(m.start, f),
        to: Math.min(Math.max(m.end, m.start), f),
        severity: m.severity === "error" ? "error" : m.severity === "warning" ? "warning" : "info",
        message: m.message
      }));
    }
    os(() => {
      s.value && (o = new me({
        parent: s.value,
        state: ze.create({
          doc: t.text,
          extensions: [
            Ly(),
            ny(),
            ly(),
            kd.of(S0),
            l,
            lb(a),
            N0(),
            u,
            me.lineWrapping,
            ze.readOnly.of(!!t.readonly),
            me.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            me.updateListener.of((h) => {
              h.docChanged && !r && n("change", h.state.doc.toString()), h.selectionSet && !r && h.transactions.some((f) => f.isUserEvent("select")) && n("cursor", h.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(dl(o.state, c(o.state))));
    }), Un(() => o?.destroy()), Be(
      () => t.text,
      (h) => {
        if (!o || o.state.doc.toString() === h) return;
        r = !0;
        const f = Math.min(o.state.selection.main.head, h.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: h }, selection: { anchor: f } }), r = !1, o.dispatch(dl(o.state, c(o.state)));
      }
    ), Be(
      () => t.diagnostics,
      () => {
        o && o.dispatch(dl(o.state, c(o.state)));
      }
    ), Be(
      () => t.reveal,
      (h) => {
        if (!o || !h) return;
        const f = o.state.doc.length, [m, k] = [Math.min(h[0], f), Math.min(h[1], f)], b = o.state.selection.main;
        b.from === m && b.to === k || (r = !0, o.dispatch({ selection: J.single(m, k) }), r = !1, d(o, m));
      }
    );
    function d(h, f) {
      const m = h.scrollDOM, k = h.lineBlockAt(f);
      (k.top < m.scrollTop || k.bottom > m.scrollTop + m.clientHeight) && (m.scrollTop = Math.max(0, k.top - m.clientHeight / 3));
    }
    return (h, f) => (w(), S("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), An = 18, Si = 24, Wn = An + Si, Es = 22, Rs = 34, qt = 36, V0 = 6, Oc = 3, H0 = 12, Af = 6, Tf = 28, z0 = 21, W0 = 108;
function Wa(i) {
  return [
    ...i.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...i.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function Pr(i) {
  const e = Number(i.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function F0(i, e) {
  return e === "auto" ? Math.max(1, i.grid.snap) : Math.max(1, Math.round(Pr(i) / e));
}
function _0(i, e = 4, t = 24) {
  let n = i.length ? Math.min(...i.map((o) => o.pitch)) - e : 60, s = i.length ? Math.max(...i.map((o) => o.pitch)) + e : 79;
  if (s - n + 1 < t) {
    const o = t - (s - n + 1);
    n -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return n < 0 && ([n, s] = [0, Math.min(127, s - n)]), s > 127 && ([n, s] = [Math.max(0, n - (s - 127)), 127]), [n, s];
}
function K0(i) {
  const e = i.map((s) => s.pitch), t = Math.max(0, Math.min(z0, ...e.map((s) => s - 2))), n = Math.min(127, Math.max(W0, ...e.map((s) => s + 2)));
  return [t, n];
}
function U0(i, e) {
  const t = Wn + (e.lyrics ? Es : 0), n = t + (e.source ? Rs : 0), s = Wa(i), [o, r] = K0(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(i.grid.units_per_quarter, 1e-9), u = Math.max(Af, Math.min(Tf, Math.round(e.rowHeight ?? H0))), c = F0(i, e.snap), d = Math.max(1, Math.round(i.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: _0(s),
    total: i.total,
    snap: c,
    drawLength: Math.max(c, Math.round(d / c) * c),
    width: qt + i.total * a + 40,
    height: n + l * u,
    top: n,
    sourceTop: e.source ? t : null
  };
}
const He = (i, e) => qt + i * e.pxPerUnit, Mn = (i, e) => (i - qt) / e.pxPerUnit, ms = (i, e) => e.top + (e.high - i) * e.rowHeight;
function $f(i, e, t, n) {
  const s = (ms(n, i) + ms(t, i) + i.rowHeight) / 2, o = Math.max(0, e - i.top), r = s - i.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, i.height - e), r)));
}
function Ec(i, e, t, n) {
  const s = ms(n, i);
  return s >= e + i.top && s + i.rowHeight <= e + t ? null : $f(i, t, n, n);
}
function dr(i, e) {
  const t = e.high - Math.floor((i - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const la = (i, e) => Math.floor(i / e) * e, Eo = (i, e) => Math.round(i / e) * e;
function ii(i, e) {
  return {
    x: He(i.onset, e),
    y: ms(i.pitch, e) + 0.5,
    width: Math.max(2, i.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function fr(i, e, t) {
  const n = i.name.length * 7 + 10, s = e ? (e.onset - i.onset) * t.pxPerUnit - 2 : n;
  return Math.max(12, Math.min(n, s));
}
const G0 = (i) => [1, 3, 6, 8, 10].includes((i % 12 + 12) % 12);
function j0(i) {
  return `C${Math.floor(i / 12) - 1}`;
}
function q0(i) {
  const e = [];
  for (const t of i.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const n = Number(t.meter.split("/")[0]) || 1, s = t.length / n;
    for (let o = 1; o < n; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function Rc(i, e, t, n, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, Mn(i, s))), u = e - r;
  if (u < An) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= Wn && u < s.top) return { area: "lyrics", unit: a };
  if (u < Wn) {
    for (let h = n.length - 1; h >= 0; h--) {
      const f = n[h], m = He(f.onset, s);
      if (i >= m && i <= m + fr(f, n[h + 1], s)) return { area: "chord", chord: f };
    }
    return { area: "lane", unit: a };
  }
  if (i - l < qt) return { area: "keys", pitch: dr(e, s) };
  const c = t.filter((h) => {
    const f = ii(h, s);
    return i >= f.x && i <= f.x + f.width && e >= f.y - 0.5 && e <= f.y + f.height + 0.5;
  }), d = c.find((h) => h.track === o) ?? c[0];
  if (d) {
    const h = ii(d, s), f = i >= h.x + h.width - Math.min(V0, h.width / 3) ? "end" : "body";
    return { area: "note", note: d, edge: f };
  }
  return { area: "grid", unit: a, pitch: dr(e, s) };
}
function Df(i, e, t) {
  return i.y0 < (i.from?.scrollTop ?? t) + e || i.y1 < t + e;
}
function Lf(i, e, t = 0, n = 0) {
  const s = i.from?.scrollTop ?? t, o = i.from?.scrollLeft ?? n, r = (h, f) => Math.max(f + qt, Math.min(e.width, h)), l = (h, f) => Math.max(f + e.top, Math.min(e.height, h)), a = [r(i.x0, o), r(i.x1, n)], u = [l(i.y0, s), l(i.y1, t)], c = Math.min(...a), d = Math.min(...u);
  return { x: c, y: d, width: Math.max(...a) - c, height: Math.max(...u) - d };
}
function Y0(i, e = 0, t = Wn) {
  return Df(i, t, e);
}
function X0(i, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : i.filter((n) => {
    const s = ii(n, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function J0(i, e, t, n = 0, s = 0) {
  if (!Df(e, t.top, n)) return [];
  const o = Lf(e, t, n, s);
  return o.width <= 0 ? [] : i.filter((r, l) => {
    const a = He(r.onset, t);
    return a < o.x + o.width && a + fr(r, i[l + 1], t) > o.x;
  });
}
function Z0(i, e, t, n) {
  return { kind: "move", notes: i, anchor: e, fromUnit: t, fromPitch: n, delta: 0, semitones: 0 };
}
function Q0(i, e = [], t = 1 / 0) {
  const n = e.filter((o) => o.track === i.track && o.onset > i.onset).map((o) => o.onset), s = Math.min(t, ...n);
  return { kind: "resize", note: i, end: i.onset + i.duration, overwrite: !1, limit: s };
}
function e1(i, e, t, n) {
  const s = Math.max(0, Math.min(la(e, n.snap), n.total - 1));
  return { kind: "draw", track: i, start: s, end: Math.min(n.total, s + n.snap), pitch: t };
}
function t1(i, e = i.onset) {
  return { kind: "chord", chord: i, fromUnit: e, to: i.onset };
}
const Is = (i, e, t) => Math.max(e, Math.min(t, i));
function n1(i, e, t, n, s) {
  switch (i.kind) {
    case "move": {
      const o = i.anchor.onset + (e - i.fromUnit), r = Math.min(...i.notes.map((h) => h.onset)), l = Math.max(...i.notes.map((h) => h.onset + h.duration)), a = Is(Eo(o, n.snap) - i.anchor.onset, -r, n.total - l), u = Math.min(...i.notes.map((h) => h.pitch)), c = Math.max(...i.notes.map((h) => h.pitch)), d = Is(t - i.fromPitch, -u, 127 - c);
      return { ...i, delta: a, semitones: d, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(n.snap, n.total - i.note.onset), r = s.alt ? n.total : Math.max(i.note.onset + i.note.duration, Math.min(n.total, i.limit)), l = Is(Eo(e, n.snap), i.note.onset + Math.max(1, o), r);
      return { ...i, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= i.start ? i.start + n.snap : Math.max(i.start + n.snap, Eo(e, n.snap));
      return { ...i, end: Math.min(n.total, o) };
    }
    case "chord":
      return { ...i, to: Is(Eo(i.chord.onset + e - i.fromUnit, n.snap), 0, n.total - 1) };
  }
}
function i1(i, e) {
  switch (i.kind) {
    case "move": {
      if (i.copy) {
        const t = Math.min(...i.notes.map((s) => s.onset)), n = Math.max(...i.notes.map((s) => s.onset + s.duration));
        return !i.delta && !i.semitones ? null : {
          op: "paste",
          at: t + i.delta,
          mode: "overwrite",
          span: n - t,
          tracks: [...new Set(i.notes.map((s) => s.track))],
          with_chords: !1,
          notes: i.notes.map((s) => ({ track: s.track, onset: s.onset - t, duration: s.duration, pitch: s.pitch + i.semitones })),
          chords: [],
          sections: []
        };
      }
      return !i.delta && !i.semitones ? null : { op: "move_notes", ids: i.notes.map((t) => t.id), delta: i.delta, semitones: i.semitones };
    }
    case "resize": {
      const t = i.end - i.note.onset;
      return t === i.note.duration ? null : { op: "resize_note", id: i.note.id, duration: t, mode: i.overwrite ? "overwrite" : e };
    }
    case "draw":
      return { op: "insert_note", track: i.track, onset: i.start, duration: i.end - i.start, pitch: i.pitch };
    case "chord":
      return i.to === i.chord.onset ? null : { op: "move_chord", onset: i.chord.onset, to: i.to };
  }
}
function s1(i) {
  if (!i) return [];
  switch (i.kind) {
    case "move":
      return i.notes.map((e) => ({
        track: e.track,
        onset: e.onset + i.delta,
        duration: e.duration,
        pitch: e.pitch + i.semitones
      }));
    case "resize":
      return [{ track: i.note.track, onset: i.note.onset, duration: i.end - i.note.onset, pitch: i.note.pitch }];
    case "draw":
      return [{ track: i.track, onset: i.start, duration: i.end - i.start, pitch: i.pitch }];
    case "chord":
      return [];
  }
}
function o1(i) {
  return i ? i.kind === "move" ? i.copy ? /* @__PURE__ */ new Set() : new Set(i.notes.map((e) => e.id)) : i.kind === "resize" ? /* @__PURE__ */ new Set([i.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function r1(i, e, t, n, s, o) {
  const r = t.map((l) => l.id);
  switch (i) {
    case "ArrowUp":
    case "ArrowDown": {
      if (!t.length && !n.length) return;
      const l = (e.shift ? 12 : 1) * (i === "ArrowUp" ? 1 : -1), a = t.map((u) => u.pitch + l);
      return a.length && (Math.min(...a) < 0 || Math.max(...a) > 127) ? null : { op: "set_note_pitch", ids: [...r, ...n.map((u) => u.id)], semitones: l };
    }
    case "ArrowLeft":
    case "ArrowRight": {
      if (!t.length) return;
      const l = i === "ArrowRight" ? 1 : -1;
      if (e.alt) {
        const h = t[0], f = h.duration + l * s.snap;
        return f < 1 || h.onset + f > s.total ? null : { op: "resize_note", id: h.id, duration: f, mode: o };
      }
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((h) => h.onset)), c = Math.max(...t.map((h) => h.onset + h.duration)), d = Is(l * a, -u, s.total - c);
      return d ? { op: "move_notes", ids: r, delta: d } : null;
    }
    case "Delete":
    case "Backspace": {
      const l = [...r, ...n.map((a) => a.id)];
      return l.length ? { op: e.shift ? "delete_close_gap" : "delete", ids: l } : void 0;
    }
    default:
      return;
  }
}
const l1 = /^(vocal|ins):\d+$/;
function gs(i, e) {
  const t = i?.model?.tracks, n = /* @__PURE__ */ new Set();
  if (!t) return n;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (l1.test(o)) n.add(o);
    else {
      const r = s.get(o);
      r && n.add(r);
    }
  return n;
}
function vs(i) {
  return new Set(i.filter((e) => e.startsWith("chord:")));
}
function Ro(i, e = []) {
  return [...i.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const Bf = [
  "Cb",
  "Gb",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "Abm",
  "Ebm",
  "Bbm",
  "Fm",
  "Cm",
  "Gm",
  "Dm",
  "Am",
  "Em",
  "Bm",
  "F#m",
  "C#m",
  "G#m",
  "D#m",
  "A#m"
], a1 = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Of(i, e) {
  let t = null;
  for (const n of i.measures) n.onset <= e && (t = n);
  return t;
}
function Ef(i, e, t) {
  const n = i?.model;
  if (!n) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = gs(i, e), o = vs(e), r = Wa(n).filter((d) => s.has(d.id)), l = n.tracks.chords.filter((d) => o.has(d.id)), a = r.length === 1 ? n.tracks.chords.find((d) => d.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Of(n, u) : t ? n.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function u1(i, e) {
  const t = Of(i, e) ?? i.measures[0], n = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(n / o) + 1, l = n - (r - 1) * o, a = Pr(i), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: n, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function c1(i, e, t) {
  const n = i.measures[e - 1];
  return !n || !Number.isInteger(t) || t < 0 || t >= n.length ? null : n.onset + t;
}
const h1 = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, d1 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function aa(i) {
  return `${d1[i % 12]}${Math.floor(i / 12) - 1}`;
}
function f1(i) {
  const e = i.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const n = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + h1[t[1].toUpperCase()] + n;
  return s >= 0 && s <= 127 ? s : null;
}
function p1(i) {
  const e = Pr(i), t = [];
  for (const n of [32, 16, 8, 4, 2, 1]) {
    e % n === 0 && t.push({ label: `1/${n}`, units: e / n });
    const s = e / n * 1.5;
    n >= 2 && n <= 16 && Number.isInteger(s) && t.push({ label: `1/${n}.`, units: s });
  }
  return t.sort((n, s) => n.units - s.units);
}
function m1(i, e) {
  return !i.length || i.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: i.map((t) => t.id), midi: e };
}
function Xn(i, e, t = []) {
  return !i.length && !t.length || i.some((n) => n.pitch + e < 0 || n.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...i.map((n) => n.id), ...t.map((n) => n.id)], semitones: e };
}
function Ic(i, e) {
  return !i.length || i.every((t) => t.track === e) ? null : { op: "move_notes", ids: i.map((t) => t.id), track: e };
}
function g1(i, e, t) {
  return t === null || t === e.onset || t + e.duration > i.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function v1(i, e, t, n) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > i.total ? null : { op: "resize_note", id: e.id, duration: t, mode: n };
}
function y1(i, e, t) {
  const n = e.trim();
  return n ? t?.name === n ? null : { op: "put_chord", onset: i, name: n } : t ? { op: "delete_chord", onset: i } : null;
}
function b1(i, e) {
  return e === null || e === i.onset ? null : { op: "move_chord", onset: i.onset, to: e };
}
function Pc(i, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? i.n : i.n + 1, count: t };
}
function k1(i, e = 1) {
  return { op: "duplicate_measures", bar: i.n, count: e };
}
function w1(i, e, t = 1) {
  return i.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Nc(i, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === i.meter ? null : { op: "change_meter", bar: i.n, count: 1, meter: t };
}
function Rf(i, e) {
  return i.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function x1(i, e) {
  return !Bf.includes(e) || e === i.key ? null : { op: "put_key", onset: i.onset, key: e };
}
function S1(i, e) {
  const t = Rf(i, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function C1(i, e) {
  return i === "text" ? "text" : i === "daw" ? "daw" : i === "review" ? "review" : e;
}
const M1 = {
  class: "inspector",
  "aria-label": "Inspector"
}, A1 = {
  key: 0,
  class: "facts"
}, T1 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, $1 = {
  key: 0,
  class: "facts"
}, D1 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, L1 = ["disabled"], B1 = ["disabled"], O1 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, E1 = ["disabled"], R1 = ["disabled"], I1 = ["disabled", "onKeydown"], P1 = ["disabled"], N1 = ["disabled"], V1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, H1 = ["disabled", "onKeydown"], z1 = ["disabled", "aria-label", "onKeydown"], W1 = { class: "facts" }, F1 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, _1 = ["disabled", "aria-label"], K1 = ["disabled"], U1 = ["value"], G1 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, j1 = ["disabled"], q1 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, Y1 = ["disabled", "onKeydown"], X1 = { class: "field" }, J1 = ["disabled"], Z1 = ["disabled"], Q1 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, ek = {
  key: 0,
  class: "facts"
}, tk = { class: "field" }, nk = ["disabled", "onKeydown"], ik = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, sk = ["disabled"], ok = ["disabled"], rk = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, lk = ["disabled", "onKeydown"], ak = ["disabled", "onKeydown"], uk = { class: "field" }, ck = ["disabled"], hk = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, dk = { class: "facts" }, fk = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, pk = ["disabled"], mk = ["disabled"], gk = { class: "field" }, vk = ["disabled"], yk = ["aria-label"], bk = { class: "facts" }, kk = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, wk = ["disabled"], xk = ["disabled"], Sk = ["disabled"], Ck = ["disabled"], Mk = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, Ak = ["disabled"], Tk = { id: "plenio-meters" }, $k = ["value"], Dk = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, Lk = ["disabled"], Bk = ["value"], Ok = ["disabled"], Ek = {
  key: 4,
  class: "facts"
}, Rk = {
  key: 5,
  class: "error"
}, Ik = /* @__PURE__ */ Ct({
  __name: "Inspector",
  props: {
    view: {},
    selection: {},
    operate: {},
    fallbackBar: { default: null },
    readonly: { type: Boolean, default: !1 },
    stale: { type: Boolean, default: !1 },
    busy: { type: Boolean, default: !1 },
    resizeMode: { default: "rests" }
  },
  setup(i) {
    const e = i, t = E(() => e.view?.model ?? null), n = E(() => Ef(e.view, e.selection, e.fallbackBar)), s = E(() => n.value.notes.length === 1 ? n.value.notes[0] : null), o = E(() => n.value.chords.length === 1 && !n.value.notes.length ? n.value.chords[0] : null), r = E(() => n.value.measure), l = E(() => !e.readonly && !e.stale && !e.busy), a = E(() => t.value ? p1(t.value) : []), u = E(() => t.value && r.value ? Rf(t.value, r.value) : null), c = E(() => {
      const N = s.value?.onset ?? o.value?.onset;
      return t.value && N !== void 0 ? u1(t.value, N) : null;
    }), d = E(() => {
      const N = new Set(n.value.notes.map((A) => A.track));
      return N.size === 1 ? [...N][0] : N.size ? "mixed" : null;
    }), h = _(""), f = _(1), m = _(0), k = _(1), b = _(!1), M = _(""), $ = _("4/4"), L = _("C");
    Be(
      [s, o, r, () => n.value.chordAtNote],
      () => {
        const N = s.value;
        h.value = N ? aa(N.pitch) : "", k.value = N?.duration ?? 1, f.value = c.value?.bar ?? 1, m.value = c.value?.offset ?? 0, M.value = (N ? n.value.chordAtNote?.name : o.value?.name) ?? "", $.value = r.value?.meter ?? "4/4", L.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const H = _(null);
    async function V(N) {
      !N || !l.value || (H.value = null, await e.operate(N));
    }
    function W() {
      const N = f1(h.value);
      if (N === null) {
        H.value = `"${h.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, h.value = s.value ? aa(s.value.pitch) : "";
        return;
      }
      V(m1(n.value.notes, N));
    }
    function I() {
      const N = t.value;
      if (!N) return;
      const A = c1(N, Number(f.value), Number(m.value));
      if (A === null) {
        H.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? V(g1(N, s.value, A)) : o.value && V(b1(o.value, A));
    }
    function K(N = Number(k.value)) {
      const A = t.value;
      !A || !s.value || V(v1(A, s.value, N, b.value ? "overwrite" : e.resizeMode));
    }
    function R() {
      const N = s.value?.onset ?? o.value?.onset;
      N !== void 0 && V(y1(N, M.value, s.value ? n.value.chordAtNote : o.value));
    }
    function z(N) {
      const A = [...n.value.notes.map((F) => F.id), ...n.value.chords.map((F) => F.id)];
      A.length && V({ op: N ? "delete_close_gap" : "delete", ids: A });
    }
    return (N, A) => (w(), S("aside", M1, [
      t.value ? (w(), S(ae, { key: 1 }, [
        n.value.notes.length ? (w(), S("section", T1, [
          p("h4", null, [
            oe(P(s.value ? `${d.value === "vocal" ? "Vocal" : "Ins"} note` : `${n.value.notes.length} notes`) + " ", 1),
            c.value ? (w(), S("span", $1, P(c.value.text), 1)) : G("", !0)
          ]),
          p("div", D1, [
            A[36] || (A[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: Ie({ active: d.value === "vocal" }),
              disabled: !l.value,
              onClick: A[0] || (A[0] = (F) => V(O(Ic)(n.value.notes, "vocal")))
            }, "Vocal", 10, L1),
            p("button", {
              class: Ie({ active: d.value === "ins" }),
              disabled: !l.value,
              onClick: A[1] || (A[1] = (F) => V(O(Ic)(n.value.notes, "ins")))
            }, "Ins", 10, B1)
          ]),
          p("div", O1, [
            A[37] || (A[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: A[2] || (A[2] = (F) => V(O(Xn)(n.value.notes, -12, n.value.chords)))
            }, "−8va", 8, E1),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: A[3] || (A[3] = (F) => V(O(Xn)(n.value.notes, -1, n.value.chords)))
            }, "−1", 8, R1),
            s.value ? Ae((w(), S("input", {
              key: 0,
              "onUpdate:modelValue": A[4] || (A[4] = (F) => h.value = F),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: nt(Fe(W, ["prevent"]), ["enter"]),
              onChange: W
            }, null, 40, I1)), [
              [rt, h.value]
            ]) : G("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: A[5] || (A[5] = (F) => V(O(Xn)(n.value.notes, 1, n.value.chords)))
            }, "+1", 8, P1),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: A[6] || (A[6] = (F) => V(O(Xn)(n.value.notes, 12, n.value.chords)))
            }, "+8va", 8, N1)
          ]),
          s.value ? (w(), S(ae, { key: 0 }, [
            p("div", V1, [
              A[38] || (A[38] = p("span", { class: "name" }, "start", -1)),
              A[39] || (A[39] = oe(" bar ", -1)),
              Ae(p("input", {
                "onUpdate:modelValue": A[7] || (A[7] = (F) => f.value = F),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: nt(Fe(I, ["prevent"]), ["enter"]),
                onChange: I
              }, null, 40, H1), [
                [
                  rt,
                  f.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              A[40] || (A[40] = oe(" + ", -1)),
              Ae(p("input", {
                "onUpdate:modelValue": A[8] || (A[8] = (F) => m.value = F),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: nt(Fe(I, ["prevent"]), ["enter"]),
                onChange: I
              }, null, 40, z1), [
                [
                  rt,
                  m.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", W1, "× " + P(t.value.unit), 1)
            ]),
            p("div", F1, [
              A[42] || (A[42] = p("span", { class: "name" }, "length", -1)),
              Ae(p("input", {
                "onUpdate:modelValue": A[9] || (A[9] = (F) => k.value = F),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: A[10] || (A[10] = nt(Fe((F) => K(), ["prevent"]), ["enter"])),
                onChange: A[11] || (A[11] = (F) => K())
              }, null, 40, _1), [
                [
                  rt,
                  k.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: A[12] || (A[12] = (F) => K(Number(F.target.value)))
              }, [
                A[41] || (A[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (w(!0), S(ae, null, ge(a.value, (F) => (w(), S("option", {
                  key: F.label,
                  value: F.units
                }, P(F.label), 9, U1))), 128))
              ], 40, K1)
            ]),
            p("label", G1, [
              Ae(p("input", {
                "onUpdate:modelValue": A[13] || (A[13] = (F) => b.value = F),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, j1), [
                [Rt, b.value]
              ]),
              A[43] || (A[43] = oe(" longer: over the next note ", -1))
            ]),
            p("div", q1, [
              A[44] || (A[44] = p("span", { class: "name" }, "chord", -1)),
              Ae(p("input", {
                "onUpdate:modelValue": A[14] || (A[14] = (F) => M.value = F),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: nt(Fe(R, ["prevent"]), ["enter"]),
                onChange: R
              }, null, 40, Y1), [
                [rt, M.value]
              ])
            ])
          ], 64)) : G("", !0),
          p("div", X1, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: A[15] || (A[15] = (F) => z(!1))
            }, "→ rest", 8, J1),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: A[16] || (A[16] = (F) => z(!0))
            }, "close gap", 8, Z1)
          ])
        ])) : o.value ? (w(), S("section", Q1, [
          p("h4", null, [
            A[45] || (A[45] = oe(" Chord symbol ", -1)),
            c.value ? (w(), S("span", ek, P(c.value.text), 1)) : G("", !0)
          ]),
          p("div", tk, [
            A[46] || (A[46] = p("span", { class: "name" }, "name", -1)),
            Ae(p("input", {
              "onUpdate:modelValue": A[17] || (A[17] = (F) => M.value = F),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: nt(Fe(R, ["prevent"]), ["enter"]),
              onChange: R
            }, null, 40, nk), [
              [rt, M.value]
            ])
          ]),
          p("div", ik, [
            A[47] || (A[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: A[18] || (A[18] = (F) => V(O(Xn)([], -1, n.value.chords)))
            }, "−1", 8, sk),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: A[19] || (A[19] = (F) => V(O(Xn)([], 1, n.value.chords)))
            }, "+1", 8, ok)
          ]),
          p("div", rk, [
            A[48] || (A[48] = p("span", { class: "name" }, "start", -1)),
            A[49] || (A[49] = oe(" bar ", -1)),
            Ae(p("input", {
              "onUpdate:modelValue": A[20] || (A[20] = (F) => f.value = F),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: nt(Fe(I, ["prevent"]), ["enter"]),
              onChange: I
            }, null, 40, lk), [
              [
                rt,
                f.value,
                void 0,
                { number: !0 }
              ]
            ]),
            A[50] || (A[50] = oe(" + ", -1)),
            Ae(p("input", {
              "onUpdate:modelValue": A[21] || (A[21] = (F) => m.value = F),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: nt(Fe(I, ["prevent"]), ["enter"]),
              onChange: I
            }, null, 40, ak), [
              [
                rt,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", uk, [
            p("button", {
              disabled: !l.value,
              onClick: A[22] || (A[22] = (F) => z(!1))
            }, "remove", 8, ck)
          ])
        ])) : n.value.chords.length > 1 ? (w(), S("section", hk, [
          p("h4", null, [
            oe(P(n.value.chords.length) + " chord symbols ", 1),
            p("span", dk, P(n.value.chords.map((F) => F.name).join(" ")), 1)
          ]),
          p("div", fk, [
            A[51] || (A[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: A[23] || (A[23] = (F) => V(O(Xn)([], -1, n.value.chords)))
            }, "−1", 8, pk),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: A[24] || (A[24] = (F) => V(O(Xn)([], 1, n.value.chords)))
            }, "+1", 8, mk)
          ]),
          p("div", gk, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: A[25] || (A[25] = (F) => z(!1))
            }, "remove", 8, vk)
          ])
        ])) : G("", !0),
        r.value ? (w(), S("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            oe(" Bar " + P(r.value.n) + " ", 1),
            p("span", bk, P(r.value.meter) + " · " + P(r.value.key), 1)
          ]),
          p("div", kk, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: A[26] || (A[26] = (F) => V(O(Pc)(r.value, "before")))
            }, "+ before", 8, wk),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: A[27] || (A[27] = (F) => V(O(Pc)(r.value, "after")))
            }, "+ after", 8, xk),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: A[28] || (A[28] = (F) => V(O(k1)(r.value)))
            }, "duplicate", 8, Sk),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: A[29] || (A[29] = (F) => V(O(w1)(t.value, r.value)))
            }, "delete", 8, Ck)
          ]),
          p("div", Mk, [
            A[52] || (A[52] = p("span", { class: "name" }, "meter", -1)),
            Ae(p("input", {
              "onUpdate:modelValue": A[30] || (A[30] = (F) => $.value = F),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: A[31] || (A[31] = nt(Fe((F) => V(O(Nc)(r.value, $.value)), ["prevent"]), ["enter"])),
              onChange: A[32] || (A[32] = (F) => V(O(Nc)(r.value, $.value)))
            }, null, 40, Ak), [
              [rt, $.value]
            ]),
            p("datalist", Tk, [
              (w(!0), S(ae, null, ge(O(a1), (F) => (w(), S("option", {
                key: F,
                value: F
              }, null, 8, $k))), 128))
            ])
          ]),
          p("div", Dk, [
            A[53] || (A[53] = p("span", { class: "name" }, "key", -1)),
            Ae(p("select", {
              "onUpdate:modelValue": A[33] || (A[33] = (F) => L.value = F),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: A[34] || (A[34] = (F) => V(O(x1)(r.value, L.value)))
            }, [
              (w(!0), S(ae, null, ge(O(Bf), (F) => (w(), S("option", {
                key: F,
                value: F
              }, P(F), 9, Bk))), 128))
            ], 40, Lk), [
              [ri, L.value]
            ]),
            u.value ? (w(), S("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: A[35] || (A[35] = (F) => V(O(S1)(t.value, r.value)))
            }, "remove change", 8, Ok)) : G("", !0)
          ])
        ], 8, yk)) : G("", !0),
        !n.value.notes.length && !o.value && !r.value ? (w(), S("p", Ek, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : G("", !0),
        H.value ? (w(), S("p", Rk, P(H.value), 1)) : G("", !0)
      ], 64)) : (w(), S("p", A1, P(i.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), Pk = { class: "keys-help" }, Nk = ["aria-expanded"], Vk = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, Hk = /* @__PURE__ */ Ct({
  __name: "KeysHelp",
  setup(i) {
    const e = _(!1), t = [
      {
        title: "Transport",
        rows: [
          ["Space", "play / stop from the cursor (also after a click on a button)"],
          ["click / drag in the ruler", "set the cursor - while it plays, playback jumps there"],
          ["Home / End", "cursor to the start / the end"],
          ["loop", "the selected notes' bars, else the cursor's section"],
          ["hear · A/B (covers)", "the notes and the source together, or one of them - switched at once"]
        ]
      },
      {
        title: "MIDI keyboard",
        rows: [
          ["● rec · Shift+R", "record from the cursor into the draw-into voice (after the count-in)"],
          ["Space · ■ stop · rec again", "stop and keep the take (one undo step)"],
          ["Esc while recording", "throw the take away"],
          ["step", "every key writes a note of the step length at the cursor; rest ▶ skips a step"],
          ["🎹", "the keyboard, hear the keys, count-in, quantize, replace / merge, step length"]
        ]
      },
      {
        title: "Piano roll",
        rows: [
          ["click the empty grid (Draw)", "a note of the last drawn length"],
          ["drag / Shift+drag", "draw a note / pull a selection frame"],
          ["drag a note · Alt+drag", "move it (all selected) · copy it"],
          ["drag a note’s end", "longer / shorter - stops at the next note, Alt: over it"],
          ["↑ / ↓ (Shift)", "a semitone (an octave) - selected chord symbols too"],
          ["← / → (Shift) · Alt+← / →", "move by the grid (a beat) · shorter / longer"],
          ["Del · Shift+Del", "rest · delete and close the gap"],
          ["Ctrl+wheel · G / H", "zoom along the bars"],
          ["Alt+wheel · Shift+G / H", "zoom the rows (taller / lower)"],
          ["Q · Shift+Q", "quantize the selection (all notes when none) to the grid · lengths too"],
          ["follow", "the roll pages along with the playback (off: it stays where you look)"],
          ["click a key", "hear its pitch"]
        ]
      },
      {
        title: "Clipboard and history",
        rows: [
          ["Ctrl+C / X / V", "copy / cut / paste at the cursor (overwriting)"],
          ["Ctrl+Shift+V", "insert at the cursor (what follows moves later)"],
          ["Ctrl+D", "duplicate right after itself"],
          ["Ctrl+A · Esc", "select all · let the selection go"],
          ["Ctrl+Z · Ctrl+Y", "undo · redo"]
        ]
      },
      {
        title: "Sections, bars, lyrics",
        rows: [
          ["section list / bar strip", "click, Ctrl+click, Shift+click to select"],
          ["Ctrl+D · Ctrl+↑↓ / ←→ · Del", "duplicate · move · delete sections or bars (drag: move, Alt: copy)"],
          ["lyrics lane", "double-click: edit · drag a line or its ends · Del · Ctrl+C / V"]
        ]
      }
    ];
    return (n, s) => (w(), S("span", Pk, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, Nk),
      e.value ? (w(), S("div", Vk, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (w(), S(ae, null, ge(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, P(o.title), 1),
          p("table", null, [
            (w(!0), S(ae, null, ge(o.rows, ([r, l]) => (w(), S("tr", { key: r }, [
              p("th", null, P(r), 1),
              p("td", null, P(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : G("", !0)
    ]));
  }
}), zk = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], ua = [4, 8, 16, 32, 64];
function Wk(i) {
  return i.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function Fk(i) {
  const e = {};
  for (const t of i) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function _k(i) {
  const e = i?.model?.unit ?? i?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), n = Number.isFinite(t) && t > 0 ? t : 16, s = ua.filter((o) => o <= n);
  return s.length ? s[s.length - 1] : ua[0];
}
function Kk(i) {
  let e = "";
  for (let t = 0; t < i.length; t += 8192)
    e += String.fromCharCode(...i.subarray(t, t + 8192));
  return btoa(e);
}
function Uk(i) {
  const e = atob(i), t = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
  return t;
}
function ss(i, e, t = "audio/midi") {
  const n = new ArrayBuffer(e.length);
  new Uint8Array(n).set(e);
  const s = URL.createObjectURL(new Blob([n], { type: t })), o = document.createElement("a");
  o.href = s, o.download = i, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function Gk(i) {
  const e = i.name.trim() || "unnamed";
  return i.notes === 1 ? `${e} · 1 note` : `${e} · ${i.notes} notes`;
}
function jk(i, e, t, { current: n = 0, keep: s = !0 } = {}) {
  const o = [...i];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && n) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${n} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Vc(i) {
  return typeof i == "object" && i !== null && !Array.isArray(i);
}
class qk {
  constructor(e, t = 200) {
    this.limit = t, this.entries = [{ text: e, label: "start" }];
  }
  limit;
  entries;
  cursor = 0;
  openGroup = null;
  get current() {
    return this.entries[this.cursor];
  }
  get canUndo() {
    return this.cursor > 0;
  }
  get canRedo() {
    return this.cursor < this.entries.length - 1;
  }
  /** The label of the step an undo would revert, for tooltips. */
  get undoLabel() {
    return this.canUndo ? this.entries[this.cursor].label : null;
  }
  get redoLabel() {
    return this.canRedo ? this.entries[this.cursor + 1].label : null;
  }
  /**
   * A new step. ``side``: a step of the side state alone (the lyrics edited over the score) - it is
   * recorded although the text did not change.
   */
  record(e, t, n = {}) {
    if (e === this.current.text && !n.side) return;
    const s = n.group ?? null;
    this.entries = this.entries.slice(0, this.cursor + 1), s !== null && s === this.openGroup && this.cursor > 0 ? this.entries[this.cursor] = { text: e, label: t, extra: this.entries[this.cursor].extra } : (this.entries.push(n.extra === void 0 ? { text: e, label: t } : { text: e, label: t, extra: n.extra }), this.cursor = this.entries.length - 1, this.entries.length > this.limit && (this.entries.shift(), this.cursor--)), this.openGroup = s;
  }
  /**
   * Attach ``extra`` to the current step unless it has its own: the state that belonged to this
   * text before a step changes it, so an undo back to here restores it. Objects are merged key by
   * key - the step keeps what it has and gains what it lacks (an import's Guide notes, then the
   * lyrics of an arrangement).
   */
  annotate(e) {
    const t = this.current.extra;
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Vc(t) && Vc(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
  }
  /** Close the typing group, so the next edit is a separate step. */
  seal() {
    this.openGroup = null;
  }
  undo() {
    return this.canUndo ? (this.cursor--, this.openGroup = null, this.current) : null;
  }
  redo() {
    return this.canRedo ? (this.cursor++, this.openGroup = null, this.current) : null;
  }
}
function Ti(i) {
  return i instanceof nh ? `${i.message}${i.hint ? ` — ${i.hint}` : ""}` : String(i instanceof Error ? i.message : i);
}
function Yk(i) {
  if (!i.text.trim()) return null;
  if (i.pending || i.busy) return "The score is still being checked.";
  if (i.checkFailed) return `The score could not be checked: ${i.checkFailed}`;
  if (!i.view) return "The score has not been checked yet.";
  if (!i.view.ok) {
    const e = i.view.diagnostics.find((n) => n.severity === "error");
    return `The ABC text is not valid${e ? ` (${e.line ? `line ${e.line}` : e.where}: ${e.message})` : ""}. Fix it, or revert to the last valid score.`;
  }
  return null;
}
function Xk(i, e) {
  const t = Zi(null), n = Zi(null), s = _(null), o = _(!1), r = _(!1), l = _(null), a = _(null), u = _([]), c = _([]), d = new qk(i.text), h = _(0);
  let f = "", m = 0, k, b = !1;
  const M = E(() => t.value && t.value.sha256 && !o.value ? t.value : null), $ = E(() => $i(n.value, c.value[0])), L = E(() => (h.value, d.canUndo)), H = E(() => (h.value, d.canRedo)), V = E(() => (h.value, d.undoLabel)), W = E(() => (h.value, d.redoLabel)), I = E(
    () => Yk({
      text: i.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), K = E(
    () => s.value !== null && s.value !== i.text && !!t.value && !t.value.ok
  );
  function R(le, De) {
    if (t.value = le, a.value = null, le.ok) {
      n.value = le, s.value = De;
      const ee = $m(le);
      c.value = c.value.filter((U) => ee.has(U));
    }
  }
  async function z() {
    const le = i.text, De = ++m;
    if (f = le, !le.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const ee = await up(e.fetcher, le, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (De !== m || f !== le || i.text !== le) return;
      R(ee, le), l.value = null;
    } catch (ee) {
      i.text === le && (l.value = Ti(ee), a.value = l.value);
    } finally {
      i.text === le && (o.value = !1);
    }
  }
  function N(le = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(k), k = setTimeout(() => {
      z();
    }, le);
  }
  function A(le, De, ee, U) {
    le !== i.text && (b = !0, i.text = le, b = !1, d.record(le, De, { group: ee, extra: U }), h.value++, e.onEdit?.());
  }
  function F(le) {
    A(le, "typing", "typing"), N();
  }
  function fe(le, De, ee = null, U) {
    return le === i.text ? !1 : (d.seal(), U && d.annotate(U.before), A(le, De, void 0, U?.after), d.seal(), clearTimeout(k), f = le, o.value = !1, u.value = [], ee && ee.ok && (ee.lyrics || !e.lyrics?.()) ? (R(ee, le), l.value = null) : N(0), !0);
  }
  async function pe(le) {
    const De = i.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++m;
      const ee = await cp(e.fetcher, De, le, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (i.text !== De)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const U = e.onTransform?.(ee, le);
      return d.seal(), U && d.annotate(U.before), A(ee.abc, ee.changes[0] ?? le.op, void 0, U?.after), d.seal(), clearTimeout(k), o.value = !1, f = ee.abc, R(ee.analysis, ee.abc), u.value = [...ee.changes, ...ee.warnings.map((Y) => `warning: ${Y}`)], ee.select.length && (c.value = Dm(ee.analysis, ee.select)), !0;
    } catch (ee) {
      return l.value = Ti(ee), !1;
    } finally {
      r.value = !1;
    }
  }
  function te(le) {
    le && (b = !0, i.text = le.text, b = !1, le.extra !== void 0 && e.onRestore?.(le.extra), h.value++, e.onEdit?.(), u.value = [], N(0));
  }
  const ie = () => te(d.undo()), $e = () => te(d.redo());
  function be() {
    const le = s.value;
    return le === null || le === i.text || !n.value ? !1 : (d.seal(), A(le, "revert to the last valid score"), d.seal(), clearTimeout(k), f = le, o.value = !1, t.value = n.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Me(le) {
    c.value = le;
  }
  function xe(le, De, ee) {
    d.seal(), d.annotate(De), d.record(i.text, le, { extra: ee, side: !0 }), d.seal(), h.value++;
  }
  function q() {
    r.value ? setTimeout(q, 60) : i.text.trim() && !o.value && z();
  }
  Be(
    () => i.text,
    (le) => {
      b || (d.seal(), d.record(le, "document replaced"), d.seal(), h.value++, N(0));
    },
    { flush: "sync" }
  );
  function Je() {
    clearTimeout(k);
  }
  return N(0), $s({
    view: t,
    lastValid: n,
    lastValidText: s,
    current: M,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: $,
    canUndo: L,
    canRedo: H,
    undoLabel: V,
    redoLabel: W,
    commitBlock: I,
    canRevert: K,
    typed: F,
    replaceText: fe,
    operate: pe,
    undo: ie,
    redo: $e,
    revertToLastValid: be,
    select: Me,
    analyze: z,
    refreshLyrics: q,
    recordSide: xe,
    dispose: Je
  });
}
const Jk = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, Zk = { class: "facts" }, Qk = { class: "body" }, ew = {
  key: 0,
  class: "hint"
}, tw = {
  key: 1,
  class: "error",
  role: "alert"
}, nw = { class: "tracks" }, iw = { class: "number" }, sw = ["onUpdate:modelValue", "aria-label"], ow = ["value", "title"], rw = {
  key: 0,
  class: "hint"
}, lw = { class: "controls" }, aw = { title: "Foreign timing is quantised to this note value" }, uw = ["value"], cw = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, hw = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, dw = { class: "report" }, fw = { key: 0 }, pw = ["disabled"], mw = /* @__PURE__ */ Ct({
  __name: "MidiDialog",
  props: {
    fetcher: {},
    data: {},
    filename: {},
    view: {},
    keepsGuide: { type: Boolean },
    currentGuide: {}
  },
  emits: ["close", "insert"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = _(!1), o = _(null), r = _(null), l = _([]), a = _(_k(t.view)), u = _(!1), c = _(t.keepsGuide), d = E(() => l.value.filter((M) => M.notes > 0)), h = E(() => l.value.filter((M) => M.notes === 0)), f = E(
      () => r.value ? jk(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let m = 0;
    async function k(M) {
      const $ = ++m;
      s.value = !0, o.value = null;
      try {
        const L = await hp(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: M ? Fk(l.value) : void 0
        });
        if ($ !== m) return;
        r.value = L, M || (l.value = Wk(L.tracks));
      } catch (L) {
        $ === m && (o.value = Ti(L));
      } finally {
        $ === m && (s.value = !1);
      }
    }
    function b() {
      k(!0);
    }
    return os(() => {
      k(!1);
    }), (M, $) => (w(), S("div", {
      class: "plenio-overlay",
      onMousedown: $[9] || ($[9] = Fe((L) => n("close"), ["self"]))
    }, [
      p("div", Jk, [
        p("header", null, [
          $[10] || ($[10] = p("h2", null, "Import MIDI", -1)),
          p("span", Zk, P(i.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: $[0] || ($[0] = (L) => n("close"))
          }, "×")
        ]),
        p("div", Qk, [
          s.value ? (w(), S("p", ew, "Reading the file…")) : G("", !0),
          o.value ? (w(), S("p", tw, P(o.value), 1)) : G("", !0),
          r.value && !o.value ? (w(), S(ae, { key: 2 }, [
            p("table", nw, [
              $[11] || ($[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), S(ae, null, ge(d.value, (L) => (w(), S("tr", {
                  key: L.index
                }, [
                  p("td", null, [
                    p("span", iw, P(L.number), 1),
                    oe(" " + P(O(Gk)(L)), 1)
                  ]),
                  p("td", null, [
                    Ae(p("select", {
                      "onUpdate:modelValue": (H) => L.role = H,
                      "aria-label": `Role of track ${L.number}`,
                      onChange: $[1] || ($[1] = (H) => b())
                    }, [
                      (w(!0), S(ae, null, ge(O(zk), (H) => (w(), S("option", {
                        key: H.value,
                        value: H.value,
                        title: H.title
                      }, P(H.label), 9, ow))), 128))
                    ], 40, sw), [
                      [ri, L.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            h.value.length ? (w(), S("p", rw, " Empty track(s) not shown: " + P(h.value.map((L) => L.number).join(", ")) + ". ", 1)) : G("", !0),
            p("p", lw, [
              p("label", aw, [
                $[12] || ($[12] = oe(" grid ", -1)),
                Ae(p("select", {
                  "onUpdate:modelValue": $[2] || ($[2] = (L) => a.value = L),
                  "aria-label": "Import grid",
                  onChange: $[3] || ($[3] = (L) => b())
                }, [
                  (w(!0), S(ae, null, ge(O(ua), (L) => (w(), S("option", {
                    key: L,
                    value: L
                  }, "1/" + P(L), 9, uw))), 128))
                ], 544), [
                  [
                    ri,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", cw, [
                Ae(p("input", {
                  "onUpdate:modelValue": $[4] || ($[4] = (L) => u.value = L),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: $[5] || ($[5] = (L) => b())
                }, null, 544), [
                  [Rt, u.value]
                ]),
                $[13] || ($[13] = oe(" read chords from the notes ", -1))
              ]),
              i.keepsGuide && r.value.guide.length ? (w(), S("label", hw, [
                Ae(p("input", {
                  "onUpdate:modelValue": $[6] || ($[6] = (L) => c.value = L),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [Rt, c.value]
                ]),
                $[14] || ($[14] = oe(" keep the Guide notes ", -1))
              ])) : G("", !0)
            ]),
            $[15] || ($[15] = p("h3", null, "What the import did", -1)),
            p("ul", dw, [
              (w(!0), S(ae, null, ge(f.value, (L, H) => (w(), S("li", { key: H }, P(L), 1))), 128)),
              f.value.length ? G("", !0) : (w(), S("li", fw, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : G("", !0)
        ]),
        p("footer", null, [
          $[16] || ($[16] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            onClick: $[7] || ($[7] = (L) => n("close"))
          }, "Cancel"),
          p("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: $[8] || ($[8] = (L) => r.value && n("insert", r.value, c.value))
          }, " Insert ", 8, pw)
        ])
      ])
    ], 32));
  }
}), gw = {
  key: 0,
  class: "stale-note",
  role: "status"
}, vw = {
  key: 1,
  class: "error"
}, yw = /* @__PURE__ */ Ct({
  __name: "NotationView",
  props: {
    view: {},
    stale: { type: Boolean },
    selection: {},
    playing: {},
    zoom: {}
  },
  emits: ["select"],
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, o = _(null), r = _(null);
    let l = /* @__PURE__ */ new Map(), a = {
      "plenio-selected": [],
      "plenio-playing": []
    }, u = !1, c = null, d = 0;
    function h($) {
      const L = /* @__PURE__ */ new Map(), H = $.lines ?? [];
      for (const V of H)
        for (const W of V.staff ?? [])
          for (const I of W.voices ?? [])
            for (const K of I)
              K.el_type === "note" && typeof K.endChar == "number" && K.abselem?.elemset && L.set(K.endChar, K.abselem.elemset);
      return L;
    }
    function f($) {
      const L = $i(n.view, $);
      return L ? l.get(L.display[1]) ?? [] : [];
    }
    function m($, L) {
      for (const H of a[$]) H.classList.remove($);
      a[$] = L.flatMap(f);
      for (const H of a[$]) H.classList.add($);
    }
    function k() {
      const $ = o.value;
      if (!$) return;
      const L = n.view?.display_abc;
      if (!L) {
        $.innerHTML = "", l = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const H = getComputedStyle($).color || "#dddddd";
        d = $.clientWidth;
        const V = Jp.renderAbc($, L, {
          add_classes: !0,
          responsive: "resize",
          scale: n.zoom,
          foregroundColor: H,
          selectionColor: H,
          staffwidth: Math.max(480, Math.floor($.clientWidth / n.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (W) => {
            const I = W;
            if (!n.view || typeof I.startChar != "number" || typeof I.endChar != "number") return;
            const K = Em(n.view, I.startChar, I.endChar);
            K && s("select", K.id, u);
          }
        });
        l = h(V[0]), a = { "plenio-selected": [], "plenio-playing": [] }, m("plenio-selected", n.selection), m("plenio-playing", n.playing), r.value = null;
      } catch (H) {
        r.value = `The notation could not be drawn: ${H instanceof Error ? H.message : String(H)}`;
      }
    }
    function b($) {
      const [L] = f($), H = o.value?.parentElement;
      if (!L || !H) return;
      const V = H.getBoundingClientRect(), W = L.getBoundingClientRect();
      W.top < V.top ? H.scrollTop += W.top - V.top - 8 : W.bottom > V.bottom && (H.scrollTop += W.bottom - V.bottom + 8), W.left < V.left ? H.scrollLeft += W.left - V.left - 8 : W.right > V.right && (H.scrollLeft += W.right - V.right + 8);
    }
    e({ reveal: b }), Be(() => [n.view?.display_abc, n.zoom], () => Xt(k)), Be(
      () => n.selection,
      ($) => {
        m("plenio-selected", $), $[0] && b($[0]);
      }
    ), Be(
      () => n.playing,
      ($) => {
        m("plenio-playing", $), $[0] && b($[0]);
      }
    ), os(() => {
      k(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - d) > 40 && k();
      }), o.value && c.observe(o.value);
    }), Un(() => c?.disconnect());
    function M($) {
      u = $.shiftKey || $.ctrlKey || $.metaKey;
    }
    return ($, L) => (w(), S("div", {
      class: Ie(["notation-wrap", { stale: i.stale }])
    }, [
      i.stale ? (w(), S("p", gw, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : G("", !0),
      r.value ? (w(), S("p", vw, P(r.value), 1)) : G("", !0),
      p("div", {
        ref_key: "host",
        ref: o,
        class: "notation",
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: M
      }, null, 544)
    ], 2));
  }
});
function _s(i, e) {
  let t = 1;
  for (const n of i.measures) {
    if (n.onset > e) break;
    t = n.n;
  }
  return t;
}
function Hc(i, e) {
  return i.measures[Math.max(0, Math.min(i.measures.length - 1, e - 1))]?.onset ?? 0;
}
function zc(i, e, t) {
  const n = e > 0 ? Math.round(i / e) * e : Math.round(i);
  return Math.max(0, Math.min(t, n));
}
function Fa(i, e) {
  const t = i.model;
  if (!t) return 0;
  const n = _s(t, e), s = t.measures[n - 1], o = i.bars[n - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function _a(i, e) {
  const t = i.model;
  if (!t || !i.bars.length || !t.measures.length) return null;
  let n = 0;
  for (let l = 0; l < i.bars.length && !(i.bars[l].start_s > e + No); l++)
    n = l;
  const s = i.bars[n], o = t.measures[Math.min(n, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function If(i, e) {
  const t = _s(i, e), n = i.measures[t - 1];
  if (!n) return "1.1.1";
  const s = Number(n.meter.split("/")[0]) || 1, o = n.length / s, r = Math.max(0, e - n.onset), l = Math.min(s - 1, Math.floor(r / o)), a = i.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const bw = 0.25, kw = 30, fl = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, pl = 6e-3;
class ww {
  context = null;
  master = null;
  tones = null;
  sourceGain = null;
  sources = [];
  levels = { tones: 1, source: 1 };
  events = [];
  next = 0;
  startedAt = 0;
  timer = null;
  voices = [];
  clicks = [];
  sounds = dp();
  onTick = null;
  onEnd = null;
  length = 0;
  get playing() {
    return this.timer !== null;
  }
  play(e, t = {}) {
    this.stop();
    const n = window.AudioContext ?? window.webkitAudioContext;
    if (!n) throw new Error("This browser cannot play audio (no Web Audio).");
    this.context ??= new n(), this.context.resume();
    const s = this.context;
    this.master = s.createGain(), this.master.gain.value = 0.8, this.master.connect(s.destination), this.levels = t.levels ?? { tones: 1, source: 1 }, this.sounds = t.sounds ?? this.sounds, this.tones = s.createGain(), this.tones.gain.value = this.levels.tones, this.tones.connect(this.master), this.events = e, this.length = e.reduce((r, l) => Math.max(r, l.at + l.duration), t.length ?? 0), this.next = 0, this.startedAt = s.currentTime + 0.05;
    const o = t.source;
    if (o?.segments.length) {
      this.sourceGain = s.createGain(), this.sourceGain.gain.value = this.levels.source, this.sourceGain.connect(this.master);
      for (const r of o.segments) this.playSegment(o.buffer, r);
      this.length = Math.max(this.length, ...o.segments.map((r) => r.at + r.duration));
    }
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), kw), this.tick();
  }
  /**
   * Seconds since playback started of a moment given in ``performance.now()`` milliseconds (a key of
   * a MIDI keyboard), as the listener heard it: the audio output's latency is taken out, so a key
   * played with a note one hears lands on that note.
   */
  elapsedAt(e) {
    const t = this.context;
    if (!t) return 0;
    const n = typeof t.getOutputTimestamp == "function" ? t.getOutputTimestamp() : null;
    if (n && typeof n.contextTime == "number" && typeof n.performanceTime == "number" && n.performanceTime > 0)
      return n.contextTime + (e - n.performanceTime) / 1e3 - this.startedAt;
    const s = t.outputLatency || t.baseLatency || 0;
    return t.currentTime + (e - performance.now()) / 1e3 - s - this.startedAt;
  }
  /** The tracks' sounds from now on (the notes already scheduled keep theirs). */
  setSounds(e) {
    this.sounds = e;
  }
  /** The layers' levels now (A/B while playing: one of them 0). */
  setLevels(e) {
    this.levels = e;
    const t = this.context?.currentTime ?? 0;
    this.tones?.gain.setTargetAtTime(e.tones, t, 0.01), this.sourceGain?.gain.setTargetAtTime(e.source, t, 0.01);
  }
  stop() {
    this.timer !== null && clearInterval(this.timer), this.timer = null;
    for (const e of this.sources)
      try {
        e.stop();
      } catch {
      }
    this.sources = [], this.sourceGain?.disconnect(), this.sourceGain = null, this.tones?.disconnect(), this.tones = null;
    for (const { voice: e } of this.voices) e.stop();
    this.voices = [];
    for (const e of this.clicks)
      try {
        e.stop();
      } catch {
      }
    this.clicks = [], this.master?.disconnect(), this.master = null;
  }
  close() {
    this.stop(), this.context?.close(), this.context = null;
  }
  tick() {
    const e = this.context;
    if (!e || !this.master) return;
    const t = e.currentTime - this.startedAt;
    for (; this.next < this.events.length && this.events[this.next].at < t + bw; )
      this.sound(this.events[this.next]), this.next++;
    this.onTick?.(Math.max(0, t)), t > this.length + 0.1 && (this.stop(), this.onEnd?.());
  }
  sound(e) {
    const t = this.context;
    if (!t || !this.master) return;
    const n = this.startedAt + e.at, s = n + Math.max(0.05, e.duration), o = this.tones ?? this.master;
    if (e.part !== "click") {
      let u;
      try {
        u = Ks(t, o, this.sounds[e.part], e.midi, n, { level: fl[e.part] });
      } catch {
        try {
          u = Ks(t, o, "plain", e.midi, n, { level: fl[e.part] });
        } catch {
          return;
        }
      }
      u.release(s);
      const c = t.currentTime;
      this.voices = this.voices.filter((d) => d.end > c), this.voices.push({ voice: u, end: s + 2 });
      return;
    }
    const r = t.createOscillator();
    r.type = "square", r.frequency.value = fp(e.midi);
    const l = t.createGain(), a = fl.click;
    l.gain.setValueAtTime(0, n), l.gain.linearRampToValueAtTime(a, n + 2e-3), l.gain.setValueAtTime(a * 0.8, Math.max(n + 3e-3, s - 0.04)), l.gain.linearRampToValueAtTime(0, s), r.connect(l).connect(o), r.start(n), r.stop(s + 0.02), r.onended = () => {
      this.clicks = this.clicks.filter((u) => u !== r), l.disconnect();
    }, this.clicks.push(r);
  }
  playSegment(e, t) {
    const n = this.context;
    if (!n || !this.sourceGain || t.duration <= 0) return;
    const s = n.createBufferSource();
    s.buffer = e;
    const o = n.createGain(), r = this.startedAt + t.at, l = r + t.duration;
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + pl), o.gain.setValueAtTime(1, Math.max(r + pl, l - pl)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class xw {
  context = null;
  tones = /* @__PURE__ */ new Map();
  /** The sound of the keys: the recorded track's. */
  sound = "soft";
  on(e, t = 100) {
    const n = window.AudioContext ?? window.webkitAudioContext;
    if (n)
      try {
        this.context ??= new n();
        const s = this.context;
        s.resume(), this.off(e), this.tones.set(e, Ks(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
      } catch {
      }
  }
  off(e) {
    const t = this.tones.get(e), n = this.context;
    !t || !n || (this.tones.delete(e), t.release(n.currentTime));
  }
  allOff() {
    for (const e of [...this.tones.keys()]) this.off(e);
  }
  close() {
    for (const e of this.tones.values()) e.stop();
    this.tones.clear(), this.context?.close(), this.context = null;
  }
}
let pr = null;
function ca(i, e = 0.35, t = "soft") {
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      pr ??= new n();
      const s = pr;
      s.resume();
      const o = s.currentTime + 0.01;
      Ks(s, s.destination, t, i, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
function Sw(i, e = 0.8, t = "plain") {
  if (!i.length) return;
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      pr ??= new n();
      const s = pr;
      s.resume();
      const o = s.currentTime + 0.01, r = 0.2 / Math.sqrt(i.length);
      for (const l of i) Ks(s, s.destination, t, l, o, { level: r }).release(o + e);
    } catch {
    }
}
const Cw = 200, Ki = /* @__PURE__ */ new Map(), Mw = 2;
function Aw(i, e) {
  if (i.numberOfChannels === 1) return i;
  const t = new e(1, 1, i.sampleRate).createBuffer(1, i.length, i.sampleRate), n = t.getChannelData(0);
  for (let s = 0; s < i.numberOfChannels; s++) {
    const o = i.getChannelData(s);
    for (let r = 0; r < o.length; r++) n[r] += o[r] / i.numberOfChannels;
  }
  return t;
}
function Tw(i, e, t = Cw) {
  const n = Math.max(1, Math.round(e / t)), s = Math.ceil(i.length / n), o = new Float32Array(s), r = new Float32Array(s);
  for (let l = 0; l < s; l++) {
    let a = 0, u = 0;
    const c = Math.min(i.length, (l + 1) * n);
    for (let d = l * n; d < c; d++) {
      const h = i[d];
      h < a && (a = h), h > u && (u = h);
    }
    o[l] = a, r[l] = u;
  }
  return { rate: e / n, min: o, max: r, duration: i.length / e };
}
function $w(i, e = Dw) {
  let t = Ki.get(i);
  if (!t) {
    for (t = (async () => {
      const n = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!n) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(i), o = await new n(1, 1, 48e3).decodeAudioData(s), r = Aw(o, n);
      return { buffer: r, envelope: Tw(r.getChannelData(0), r.sampleRate) };
    })(), Ki.set(i, t); Ki.size > Mw; ) Ki.delete(Ki.keys().next().value);
    t.catch(() => Ki.delete(i));
  }
  return t;
}
async function Dw(i) {
  const e = await fetch(i);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function Lw(i, e, t, n) {
  const s = [];
  if (n <= 0 || t <= e) return s;
  const o = (t - e) / n;
  for (let r = 0; r < n; r++) {
    const l = Math.max(0, Math.floor((e + r * o) * i.rate)), a = Math.min(i.min.length, Math.max(l + 1, Math.ceil((e + (r + 1) * o) * i.rate)));
    let u = 0, c = 0;
    for (let d = l; d < a; d++)
      i.min[d] < u && (u = i.min[d]), i.max[d] > c && (c = i.max[d]);
    s.push([u, c]);
  }
  return s;
}
function Bw(i) {
  return !i || "problem" in i || !Array.isArray(i.midi) || !(i.rate > 0) ? null : { rate: i.rate, start: i.start ?? 0, midi: i.midi };
}
function Ow(i, e) {
  const t = Math.round((e - i.start) * i.rate);
  return t >= 0 && t < i.midi.length ? i.midi[t] : null;
}
function Ew(i, e, t) {
  let n = 0;
  for (let r = 0; r < i.measures.length; r++) i.measures[r].onset <= t && (n = r);
  const s = i.measures[n], o = e?.[n];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function Rw(i, e, t) {
  const n = [];
  for (const s of i.tracks.vocal) {
    const o = Ew(i, e, s.onset + s.duration / 2), r = o === null ? null : Ow(t, o);
    r !== null && n.push(s.pitch - r);
  }
  return n.length < 6 ? 0 : (n.sort((s, o) => s - o), 12 * Math.round(n[Math.floor(n.length / 2)] / 12));
}
function Iw(i, e, t, n, s, o = 0) {
  const r = [];
  let l = [], a = null;
  const u = 1 / t.rate;
  for (let c = Math.max(0, n); c <= Math.min(s, i.measures.length - 1); c++) {
    const d = i.measures[c], h = e?.[c];
    if (!h || h[1] <= h[0]) {
      l.length > 1 && r.push(l), l = [], a = null;
      continue;
    }
    const f = Math.ceil((h[0] - t.start) * t.rate), m = Math.floor((h[1] - t.start) * t.rate - 1e-9);
    for (let k = f; k <= m; k++) {
      const b = k >= 0 && k < t.midi.length ? t.midi[k] : null, M = t.start + k * u;
      (b === null || a !== null && Math.abs(M - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = M, b !== null && l.push([d.onset + (M - h[0]) / (h[1] - h[0]) * d.length, b + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const Pw = ["aria-label"], Nw = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, Vw = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, Hw = ["aria-pressed"], zw = ["aria-pressed"], Ww = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, Fw = ["aria-pressed"], _w = ["aria-pressed"], Kw = { title: "Grid for drawing, moving and resizing" }, Uw = { value: "auto" }, Gw = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, jw = ["disabled"], qw = ["disabled"], Yw = ["disabled", "title"], Xw = ["disabled", "title"], Jw = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, Zw = ["disabled", "title"], Qw = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, ex = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, tx = ["title"], nx = ["disabled"], ix = { title: "The roll pages along with the playback line" }, sx = { class: "hint" }, ox = {
  key: 0,
  class: "roll-note"
}, rx = ["width", "height"], lx = ["y", "width", "height"], ax = ["x1", "x2", "y1", "y2"], ux = ["x", "y"], cx = ["x", "y"], hx = ["d"], dx = ["x1", "x2", "y1", "y2"], fx = ["x1", "x2", "y1", "y2"], px = ["transform"], mx = ["y", "width", "height"], gx = ["y"], vx = ["transform"], yx = ["width", "height"], bx = ["x", "width", "height"], kx = ["y", "width", "height"], wx = ["y", "width", "height"], xx = ["x", "y", "width", "height"], Sx = ["d"], Cx = ["x", "y"], Mx = ["y", "width", "height"], Ax = ["x", "y", "width", "height"], Tx = ["x", "y", "height"], $x = ["x", "y"], Dx = ["x1", "x2", "y2"], Lx = ["x"], Bx = ["x"], Ox = ["x", "y", "width", "height"], Ex = ["x", "y"], Rx = {
  key: 2,
  class: "chord ghost"
}, Ix = ["x", "y", "width", "height"], Px = ["x", "y"], Nx = ["x", "y", "width", "height"], Vx = ["x1", "x2", "y2"], Hx = ["transform"], zx = ["y2"], Wx = ["onKeydown"], Fx = ["onKeydown"], Ts = 5, Wc = 6.2, _x = 26, Kx = /* @__PURE__ */ Ct({
  __name: "PianoRoll",
  props: /* @__PURE__ */ Qt({
    view: {},
    selection: {},
    operate: {},
    playing: { default: () => [] },
    readonly: { type: Boolean, default: !1 },
    stale: { type: Boolean, default: !1 },
    busy: { type: Boolean, default: !1 },
    resizeMode: { default: "rests" },
    height: { default: 280 },
    locator: { default: null },
    playhead: { default: null },
    clip: { default: null },
    lyrics: { default: null },
    lyricsEditable: { type: Boolean, default: !1 },
    source: { default: null },
    sung: { default: null },
    sound: {},
    chordSound: {},
    recorded: { default: null }
  }, {
    lyricSelection: { default: () => [] },
    lyricSelectionModifiers: {},
    zoom: { default: 48 },
    zoomModifiers: {},
    audition: { type: Boolean, default: !0 },
    auditionModifiers: {},
    rowHeight: { default: 12 },
    rowHeightModifiers: {},
    follow: { type: Boolean, default: !0 },
    followModifiers: {},
    sungVisible: { type: Boolean, default: !0 },
    sungVisibleModifiers: {},
    waveVisible: { type: Boolean, default: !0 },
    waveVisibleModifiers: {},
    track: { default: "vocal" },
    trackModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete", "lyricAuto", "notice"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, o = lt(i, "lyricSelection"), r = lt(i, "zoom"), l = lt(i, "audition"), a = lt(i, "rowHeight"), u = lt(i, "follow"), c = lt(i, "sungVisible"), d = lt(i, "waveVisible"), h = E(() => !!n.source && d.value), f = _(null), m = _(null), k = _(null), b = _(null), M = lt(i, "track"), $ = _("draw"), L = _("auto"), H = _(null), V = _(null), W = _(!1), I = _(0), K = _(0), R = _(0), z = _(0);
    let N = !1;
    const A = _(null), F = _(null), fe = _(null);
    let pe = !1;
    const te = _(null);
    let ie = null, $e = null;
    const be = E(() => n.view?.model ?? null), Me = E(() => be.value ? Wa(be.value) : []), xe = E(() => be.value?.tracks.chords ?? []), q = E(
      () => be.value ? U0(be.value, {
        pxPerQuarter: r.value,
        snap: L.value,
        lyrics: !!n.lyrics,
        source: h.value,
        rowHeight: a.value
      }) : null
    ), Je = _(null);
    function le(C) {
      l.value && ca(C, 0.35, n.sound);
    }
    function De(C) {
      if (l.value) {
        if (!C.pitches?.length) {
          s("notice", `The chord symbol ${C.name} has no pitches Plenio can play.`);
          return;
        }
        Sw(C.pitches, 0.8, n.chordSound ?? "plain");
      }
    }
    const ee = E(() => !n.readonly && !n.stale && !n.busy && !W.value), U = E(() => gs(n.view, n.selection)), Y = E(() => vs(n.selection)), Ne = E(() => gs(n.view, n.playing)), et = E(() => o1(H.value)), ft = E(() => s1(H.value)), Ge = E(() => {
      const C = q.value, g = V.value;
      if (!C || !g) return null;
      const y = Lf(g, C, K.value, I.value), T = new Set(g.keep);
      for (const he of X0(Me.value, y, C)) T.add(he.id);
      const D = new Set(g.keepChords);
      for (const he of J0(xe.value, g, C, K.value, I.value)) D.add(he.id);
      const X = Y0(g, K.value);
      return { rect: y, ids: T, chords: D, lane: X };
    }), Q = E(
      () => $.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), j = E(
      () => n.lyrics && n.lyricsEditable ? " · lyrics lane: double-click a line: edit its words · double-click free room: a new line there · drag a line: move · drag its start or end: longer / shorter (lines stop at their neighbours, the others stay) · Del · Ctrl+C / Ctrl+V" : ""
    ), ce = E(() => be.value && n.locator !== null ? If(be.value, n.locator) : "");
    function ve(C, g, y) {
      const T = te.value?.fitted?.moves.find((D) => D.key === C);
      return T ? [T.start, T.end] : [g, y];
    }
    function ke(C) {
      return !!te.value?.fitted?.moves.some((g) => g.key === C);
    }
    function bt(C) {
      const g = te.value;
      return !!g?.fitted && !g.fitted.free && (g.kind === "move" ? g.keys.includes(C) : g.key === C);
    }
    const at = E(() => {
      const C = q.value, g = n.lyrics;
      if (!C || !g) return [];
      const y = g.parts.flatMap(
        (D) => D.lines.filter((X) => X.text).map((X) => {
          const he = ji(X.block, X.line), [Ce, _e] = ve(he, X.start, X.end);
          return { ...X, start: Ce, end: _e, key: he };
        })
      ).sort((D, X) => D.start - X.start || D.line - X.line), T = new Set(o.value);
      return y.map((D, X) => {
        const he = He(D.start, C), Ce = y.slice(X + 1).find((Le) => Le.start > D.start), _e = Ce ? He(Ce.start, C) - he - 2 : 640, Te = Math.max(16, He(D.end, C) - he), Ke = Math.max(1, Math.floor((Math.max(Te, Math.min(_e, D.text.length * Wc + 8)) - 8) / Wc)), Ze = D.text.length > Ke ? `${D.text.slice(0, Math.max(1, Ke - 1))}…` : D.text;
        return { ...D, x: he, width: Te, shown: Ze, selected: T.has(D.key), dragged: ke(D.key), stopped: bt(D.key) };
      }).filter((D) => kt(D.start, Math.max(D.end, D.start + 64)));
    }), Wt = E(() => !!n.lyrics?.parts.some((C) => C.lines.some((g) => g.pinned)));
    function At() {
      f.value?.focus({ preventScroll: !0 }), s("lyricAuto");
    }
    function Bt(C) {
      const g = at.value.filter((D) => C >= D.x - Ts && C <= D.x + D.width + Ts), y = g.find((D) => C >= D.x && C <= D.x + D.width) ?? g[0];
      if (!y) return null;
      const T = C >= y.x + y.width - Ts ? "end" : C <= y.x + Ts && y.width > 3 * Ts ? "start" : "move";
      return { key: y.key, start: y.start, end: y.end, part: T };
    }
    function ct(C) {
      const g = q.value;
      if (!n.lyrics || !g) return { moves: [], free: !0, stoppedAt: null };
      const y = Math.max(1, Math.round(be.value?.grid.units_per_quarter ?? 1));
      return im(n.lyrics, C, g.total, y);
    }
    function jn(C) {
      const g = n.lyrics?.parts.flatMap((D) => D.lines) ?? [], y = C.moves.filter((D) => {
        const X = g.find((he) => ji(he.block, he.line) === D.key);
        return !X || X.start !== D.start || X.end !== D.end;
      }), T = C.free ? void 0 : C.stoppedAt ? `The line stops at "${C.stoppedAt.text}": lyrics lines never overlap - shorten or move that line first.` : "The line stays inside its lyrics block: it stops at the next block's lines (or at the end of the score).";
      (y.length || T) && s("lyricPlace", y, T);
    }
    const mn = E(() => {
      const C = /* @__PURE__ */ new Map();
      for (const g of n.lyrics?.parts ?? [])
        for (const y of g.lines) for (const T of y.syllables) C.set(T.onset, T.end_of_word ? T.text : `${T.text}-`);
      return C;
    }), fi = E(() => {
      const C = q.value;
      return C ? mi.value.map((g) => ({ n: g, rect: ii(g, C) })).filter(({ rect: g }) => g.width >= _x).map(({ n: g, rect: y }) => ({ key: g.id, x: y.x + 2, y: y.y + y.height - 2.5, text: aa(g.pitch) })) : [];
    }), On = E(() => {
      const C = q.value;
      return !C || !mn.value.size ? [] : mi.value.filter((g) => g.track === "vocal" && mn.value.has(g.onset)).map((g) => {
        const y = ii(g, C);
        return { key: g.id, x: y.x + 1, y: y.y - 2, text: mn.value.get(g.onset) };
      });
    });
    function pi(C, g) {
      const y = n.lyrics, T = q.value;
      if (!y || !T) return null;
      const D = Bt(C);
      if (D && D.part !== "end") {
        const he = y.parts.flatMap((Ce) => Ce.lines).find((Ce) => ji(Ce.block, Ce.line) === D.key);
        if (he) return { block: he.block, line: he.line, text: he.text, original: he.text, start: he.start };
      }
      const X = sm(y, g, T.snap, T.total, Math.max(1, Math.round(be.value?.grid.units_per_quarter ?? 1)));
      if (!X) {
        const he = D && y.parts.flatMap((Ce) => Ce.lines).find((Ce) => ji(Ce.block, Ce.line) === D.key);
        return he ? { block: he.block, line: he.line, text: he.text, original: he.text, start: he.start } : null;
      }
      return { block: X.block, line: X.line, text: "", original: "", start: X.start, at: X.start, end: X.end };
    }
    function ks(C, g) {
      const y = pi(C, g);
      y && (pe = !1, fe.value = y, Xt(() => {
        F.value?.focus(), F.value?.select();
      }));
    }
    function En() {
      const C = fe.value;
      if (fe.value = null, !C || pe) {
        pe = !1;
        return;
      }
      f.value?.focus({ preventScroll: !0 }), C.text.trim() !== C.original.trim() && s("lyricEdit", {
        block: C.block,
        line: C.line,
        text: C.text.trim(),
        at: C.start,
        ...C.end !== void 0 ? { end: C.end } : {}
      });
    }
    function Ni() {
      pe = !0, fe.value = null, f.value?.focus({ preventScroll: !0 });
    }
    const Ft = E(() => be.value ? `1/${Math.round(Pr(be.value) / (q.value?.snap ?? 1))}` : ""), tn = E(() => {
      const C = q.value;
      if (!C) return [0, 0];
      const g = R.value || 1e5;
      return [Mn(I.value - 200, C), Mn(I.value + g + 200, C)];
    }), kt = (C, g) => g >= tn.value[0] && C <= tn.value[1], mi = E(() => Me.value.filter((C) => kt(C.onset, C.onset + C.duration))), gn = E(
      () => xe.value.map((C, g) => ({ chord: C, next: xe.value[g + 1] })).filter(({ chord: C }) => kt(C.onset, C.onset + 64))
    ), qn = E(() => be.value ? q0(be.value).filter((C) => kt(C.unit, C.unit)) : []), _t = E(() => {
      const C = q.value;
      return C ? Array.from({ length: C.high - C.low + 1 }, (g, y) => C.high - y) : [];
    }), Rn = E(() => {
      const C = be.value;
      return C ? C.sections.filter((g) => !g.implicit).map((g) => ({ label: g.label, unit: C.measures[g.first_bar - 1]?.onset ?? 0 })).filter((g) => kt(g.unit, g.unit + 64)) : [];
    });
    function Kt(C) {
      const g = k.value?.getBoundingClientRect();
      return [C.clientX - (g?.left ?? 0), C.clientY - (g?.top ?? 0)];
    }
    function In(C) {
      return {
        note: !0,
        [C.track]: !0,
        selected: (Ge.value?.ids ?? U.value).has(C.id),
        playing: Ne.value.has(C.id),
        dragged: et.value.has(C.id)
      };
    }
    function vn(C) {
      const g = C.track === "vocal" ? "Vocal" : "Ins";
      let y = 1;
      for (const T of be.value?.measures ?? []) T.onset <= C.onset && (y = T.n);
      return `${g} bar ${y}: ${C.name}, ${C.duration} units`;
    }
    function Ot(C) {
      s("select", C);
    }
    function Pn(C) {
      const g = q.value;
      if (!g || C.button !== 0) return;
      f.value?.focus({ preventScroll: !0 });
      const [y, T] = Kt(C), D = Rc(y, T, Me.value, xe.value, g, M.value, K.value, I.value);
      if (D.area === "keys") {
        l.value && ca(D.pitch, 0.35, n.sound);
        return;
      }
      if (D.area === "header" || D.area === "source") {
        s("locate", zc(D.unit, g.snap, g.total)), ie = { x: y, y: T, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, pt(C);
        return;
      }
      const X = C.shiftKey || C.ctrlKey || C.metaKey;
      if (D.area === "lyrics") {
        const Te = Bt(y);
        if (!Te) {
          X || (o.value = []);
          return;
        }
        n.selection.length && Ot([]);
        const Ke = o.value, Ze = Ke.includes(Te.key), Le = X ? Ze ? Ke.filter((Tt) => Tt !== Te.key) : [...Ke, Te.key] : Ze ? Ke : [Te.key];
        if (Le !== Ke && (o.value = Le), n.lyricsEditable && (Le.includes(Te.key) || Te.part !== "move")) {
          const Tt = Te.part === "move" ? [...Le] : [Te.key];
          ie = { x: y, y: T, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Te.part, key: Te.key, keys: Tt, origin: Mn(y, g), delta: 0 } }, pt(C);
        }
        return;
      }
      o.value.length && !X && (o.value = []);
      let he = null, Ce = !1, _e = null;
      if (D.area === "note") {
        const Te = U.value.has(D.note.id);
        let Ke;
        if (X) {
          const Ze = new Set(U.value);
          Te ? Ze.delete(D.note.id) : Ze.add(D.note.id), Ke = Me.value.filter((Le) => Ze.has(Le.id)), Ot(Ro(Ke, xe.value.filter((Le) => Y.value.has(Le.id))));
        } else Te ? Ke = Me.value.filter((Ze) => U.value.has(Ze.id)) : (Ke = [D.note], Ot(Ro(Ke)));
        ee.value && Ke.some((Ze) => Ze.id === D.note.id) && (he = D.edge === "end" && Ke.length === 1 ? Q0(D.note, Me.value, g.total) : Z0(Ke, D.note, Mn(y, g), dr(T, g))), le(D.note.pitch);
      } else if (D.area === "chord") {
        if (X) {
          const Te = new Set(Y.value);
          Te.has(D.chord.id) ? Te.delete(D.chord.id) : Te.add(D.chord.id), Ot([...n.selection.filter((Ke) => !Ke.startsWith("chord:")), ...Te]);
        } else Y.value.has(D.chord.id) || Ot([D.chord.id]);
        ee.value && (he = t1(D.chord, Mn(y, g))), De(D.chord);
      } else if ((D.area === "grid" || D.area === "lane") && ($.value === "select" || C.shiftKey))
        _e = X ? { notes: [...U.value], chords: xe.value.filter((Te) => Y.value.has(Te.id)) } : { notes: [], chords: [] }, Ce = !X;
      else if (D.area === "grid") {
        const Te = !n.selection.length && !o.value.length;
        ee.value && !X && (he = e1(M.value, D.unit, D.pitch, g), le(D.pitch)), Ce = !X, ie = { x: y, y: T, start: he, started: !1, clear: Ce, keep: _e, insert: ee.value && !X && Te }, pt(C);
        return;
      } else
        Ce = !X;
      ie = { x: y, y: T, start: he, started: !1, clear: Ce, keep: _e, from: { scrollTop: K.value, scrollLeft: I.value } }, pt(C);
    }
    function pt(C) {
      try {
        k.value?.setPointerCapture?.(C.pointerId);
      } catch {
      }
    }
    function Vi(C, g) {
      const y = m.value, T = q.value;
      if (!y || !T || g.start?.kind === "chord") return;
      const D = y.getBoundingClientRect();
      if (!D.height) return;
      const X = T.rowHeight, he = !!g.keep && g.y - (g.from?.scrollTop ?? 0) < T.top;
      if (C.clientY < D.top + T.top + 12) {
        if (he && C.clientY < D.top + T.top) return;
        y.scrollTop = Math.max(0, y.scrollTop - X);
      } else if (C.clientY > D.bottom - 16) y.scrollTop = y.scrollTop + X;
      else return;
      ut();
    }
    function Hi(C) {
      const g = q.value;
      if (!ie || !ie.start && !ie.keep && !ie.ruler && !ie.lyric || !g) return;
      const [y, T] = Kt(C);
      if (ie.ruler) {
        s("locate", zc(Mn(y, g), g.snap, g.total));
        return;
      }
      if (ie.lyric) {
        if (!ie.started && Math.abs(y - ie.x) < Oc) return;
        ie.started = !0;
        const D = Math.round((Mn(y, g) - ie.lyric.origin) / g.snap) * g.snap, X = { ...ie.lyric, delta: D };
        te.value = { ...X, fitted: ct(X) };
        return;
      }
      if (ie.started && Vi(C, ie), !(!ie.started && Math.hypot(y - ie.x, T - ie.y) < Oc)) {
        if (ie.started = !0, ie.keep)
          V.value = {
            x0: ie.x,
            y0: ie.y,
            x1: y,
            y1: T,
            from: ie.from,
            keep: ie.keep.notes,
            keepChords: ie.keep.chords.map((D) => D.id)
          };
        else if (ie.start) {
          const D = H.value, X = n1(ie.start, Mn(y, g), dr(T, g), g, { alt: C.altKey });
          X.kind === "move" && X.semitones !== (D?.kind === "move" ? D.semitones : 0) && le(X.anchor.pitch + X.semitones), H.value = X;
        }
      }
    }
    async function Et(C) {
      W.value = !0;
      try {
        await n.operate(C);
      } finally {
        W.value = !1, H.value = null;
      }
    }
    function mt() {
      const C = ie;
      if (ie = null, !C || C.ruler) return;
      if (C.lyric) {
        const T = te.value;
        te.value = null, C.started && T?.delta && T.fitted && jn(T.fitted);
        return;
      }
      if (!C.started) {
        if (H.value = null, C.insert && C.start?.kind === "draw" && q.value) {
          const T = q.value, D = Math.min(Je.value ?? T.drawLength, T.total - C.start.start);
          Et({ op: "insert_note", track: C.start.track, onset: C.start.start, duration: D, pitch: C.start.pitch });
          return;
        }
        C.clear && Ot([]);
        return;
      }
      if (C.keep) {
        const T = Ge.value?.ids ?? /* @__PURE__ */ new Set(), D = Ge.value?.chords ?? new Set(C.keep.chords.map((X) => X.id));
        V.value = null, Ot(Ro(Me.value.filter((X) => T.has(X.id)), xe.value.filter((X) => D.has(X.id))));
        return;
      }
      const g = H.value, y = g ? i1(g, n.resizeMode) : null;
      if (!y) {
        H.value = null;
        return;
      }
      g?.kind === "draw" ? Je.value = g.end - g.start : g?.kind === "resize" && (Je.value = g.end - g.note.onset), Et(y);
    }
    function zi() {
      ie = null, H.value = null, V.value = null, te.value = null;
    }
    function yn(C) {
      const g = q.value;
      if (!g) return;
      const [y, T] = Kt(C), D = Rc(y, T, Me.value, xe.value, g, M.value, K.value, I.value);
      if (D.area === "lyrics") {
        n.lyricsEditable && ks(y, D.unit);
        return;
      }
      if (ee.value) {
        if (D.area === "grid") {
          if ($.value !== "draw") return;
          const X = Math.min(la(D.unit, g.snap), g.total - 1), he = Math.min(g.drawLength, g.total - X);
          Et({ op: "insert_note", track: M.value, onset: X, duration: he, pitch: D.pitch });
        } else if (D.area === "lane" || D.area === "chord") {
          const X = D.area === "chord" ? D.chord : null, he = D.area === "chord" ? D.chord.onset : Math.min(la(D.unit, g.snap), g.total - 1);
          A.value = { onset: he, name: X?.name ?? "", original: X?.name ?? null }, Xt(() => {
            b.value?.focus(), b.value?.select();
          });
        }
      }
    }
    function Wi() {
      const C = A.value;
      if (A.value = null, f.value?.focus({ preventScroll: !0 }), !C) return;
      const g = C.name.trim();
      if (g !== (C.original ?? "")) {
        if (!g) {
          C.original !== null && Et({ op: "delete_chord", onset: C.onset });
          return;
        }
        Et({ op: "put_chord", onset: C.onset, name: g });
      }
    }
    function Ut() {
      A.value = null, f.value?.focus({ preventScroll: !0 });
    }
    function gi(C) {
      if (C.target?.closest("input, select, textarea")) return;
      const y = q.value;
      if (!y) return;
      if (o.value.length && !C.ctrlKey && !C.metaKey) {
        const Ce = C.key === "ArrowLeft" ? -y.snap : C.key === "ArrowRight" ? y.snap : 0;
        if (C.key === "Delete" || C.key === "Backspace" || Ce || C.key === "Escape") {
          if (C.preventDefault(), C.stopPropagation(), C.key === "Escape") o.value = [];
          else if (n.lyricsEditable) Ce ? jn(ct({ kind: "move", key: "", keys: [...o.value], delta: Ce })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (C.key === "Escape") {
        if (ie || H.value || V.value) zi();
        else if (n.selection.length) Ot([]);
        else return;
        C.preventDefault(), C.stopPropagation();
        return;
      }
      const T = C.key.toLowerCase();
      if ((T === "g" || T === "h") && !C.ctrlKey && !C.metaKey && !C.altKey) {
        C.preventDefault(), C.stopPropagation(), C.shiftKey ? bn(T === "h" ? 2 : -2) : Gt(T === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (T === "q" && !C.ctrlKey && !C.metaKey && !C.altKey) {
        C.preventDefault(), C.stopPropagation(), nn(C.shiftKey);
        return;
      }
      if (C.key.toLowerCase() === "a" && (C.ctrlKey || C.metaKey) && !C.altKey) {
        C.preventDefault(), C.stopPropagation(), Ot(Ro(Me.value, xe.value));
        return;
      }
      const D = Me.value.filter((Ce) => U.value.has(Ce.id)), X = xe.value.filter((Ce) => Y.value.has(Ce.id)), he = r1(
        C.key,
        { shift: C.shiftKey, alt: C.altKey },
        D,
        X,
        y,
        n.resizeMode
      );
      he !== void 0 && (C.preventDefault(), C.stopPropagation(), he && ee.value && Et(he));
    }
    function ut() {
      I.value = m.value?.scrollLeft ?? 0, K.value = m.value?.scrollTop ?? 0, R.value = m.value?.clientWidth ?? 0, z.value = m.value?.clientHeight ?? 0;
    }
    function Vt() {
      const C = q.value, g = m.value;
      N || !C || !g || !g.clientHeight || (N = !0, g.scrollTop = $f(C, g.clientHeight, C.focus[0], C.focus[1]), ut());
    }
    function ht(C, g = !0) {
      const y = q.value, T = m.value, D = Me.value.find((Ce) => C.has(Ce.id));
      if (!y || !T || !D || !T.clientWidth) return;
      const X = He(D.onset, y);
      g && (X < T.scrollLeft + qt || X > T.scrollLeft + T.clientWidth - 40) && (T.scrollLeft = Math.max(0, X - T.clientWidth / 3));
      const he = T.clientHeight ? Ec(y, T.scrollTop, T.clientHeight, D.pitch) : null;
      he !== null && (T.scrollTop = he), ut();
    }
    function Gt(C, g) {
      const y = m.value, T = q.value, D = Math.max(12, Math.min(240, Math.round(r.value * C)));
      if (D === r.value) return;
      if (!y || !T) {
        r.value = D;
        return;
      }
      const X = y.getBoundingClientRect(), he = n.locator !== null ? He(n.locator, T) - y.scrollLeft : null, Ce = g !== void 0 ? g - X.left : he !== null && he >= qt && he <= y.clientWidth ? he : y.clientWidth / 2, _e = Mn(y.scrollLeft + Ce, T);
      r.value = D, Xt(() => {
        const Te = q.value;
        Te && (y.scrollLeft = Math.max(0, He(_e, Te) - Ce), ut());
      });
    }
    function vi(C) {
      const g = C.deltaY || C.deltaX;
      if (C.altKey || (C.ctrlKey || C.metaKey) && C.shiftKey) {
        C.preventDefault(), bn(g < 0 ? 1 : -1, C.clientY);
        return;
      }
      !C.ctrlKey && !C.metaKey || (C.preventDefault(), Gt(g < 0 ? 1.15 : 1 / 1.15, C.clientX));
    }
    function bn(C, g) {
      const y = m.value, T = q.value, D = Math.max(Af, Math.min(Tf, a.value + C));
      if (D === a.value) return;
      if (!y || !T) {
        a.value = D;
        return;
      }
      const X = y.getBoundingClientRect(), he = g !== void 0 ? g - X.top : y.clientHeight / 2, Ce = T.high - (y.scrollTop + he - T.top) / T.rowHeight;
      a.value = D, Xt(() => {
        const _e = q.value;
        _e && (y.scrollTop = Math.max(0, _e.top + (_e.high - Ce) * _e.rowHeight - he), ut());
      });
    }
    function nn(C) {
      const g = q.value;
      if (!g || !ee.value) return;
      const y = U.value.size ? Me.value.filter((T) => U.value.has(T.id)) : Me.value;
      y.length && Et({ op: "quantize", ids: y.map((T) => T.id), grid: g.snap, lengths: C });
    }
    const Re = E(() => {
      const C = n.source?.envelope;
      if (!C) return 1;
      let g = 0;
      for (let y = 0; y < C.max.length; y++) g = Math.max(g, C.max[y], -C.min[y]);
      return g || 1;
    }), Nn = E(() => {
      const C = q.value, g = be.value, y = n.sung;
      if (!C || !g || !y?.curve || !c.value) return [];
      const [T, D] = tn.value;
      let X = 0, he = g.measures.length - 1;
      g.measures.forEach((_e, Te) => {
        _e.onset + _e.length < T && (X = Te + 1), _e.onset <= D && (he = Te);
      });
      const Ce = (_e) => C.top + (C.high - _e) * C.rowHeight + C.rowHeight / 2;
      return Iw(g, y.bars, y.curve, X, he, y.offset).map((_e, Te) => ({
        key: `c${X}-${Te}`,
        d: _e.map(([Ke, Ze], Le) => `${Le ? "L" : "M"}${He(Ke, C).toFixed(1)} ${Ce(Ze).toFixed(1)}`).join("")
      }));
    }), Yn = E(() => {
      const C = n.sung?.offset ?? 0;
      if (!C) return "sung";
      const g = Math.abs(C / 12);
      return `sung ${C > 0 ? "+" : "−"}${g > 1 ? g : ""}8va`;
    }), yi = E(() => {
      const C = n.sung;
      if (!C) return "";
      if (C.problem) return `No sung pitch: ${C.problem}`;
      const g = C.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${g ? ` - drawn ${Math.abs(g / 12)} octave${Math.abs(g) > 12 ? "s" : ""} ${g > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), bi = E(() => {
      const C = q.value, g = be.value, y = n.source;
      if (!C || !g || !y || C.sourceTop === null) return [];
      const T = C.sourceTop + Rs / 2, D = (Rs / 2 - 3) / Re.value, X = [];
      return g.measures.forEach((he, Ce) => {
        if (!kt(he.onset, he.onset + he.length)) return;
        const _e = He(he.onset, C), Te = he.length * C.pxPerUnit, Ke = y.bars?.[Ce];
        if (!Ke) {
          X.push({ key: `w${Ce}`, d: "", missing: !0, x: _e, width: Te });
          return;
        }
        const Ze = Math.max(1, Math.floor(Te / 2)), Le = [];
        Lw(y.envelope, Ke[0], Ke[1], Ze).forEach(([Tt, ws], ao) => {
          const uo = (_e + (ao + 0.5) * (Te / Ze)).toFixed(1);
          Le.push(`M${uo} ${(T - ws * D - 0.5).toFixed(1)}V${(T - Tt * D + 0.5).toFixed(1)}`);
        }), X.push({ key: `w${Ce}`, d: Le.join(""), missing: !1, x: _e, width: Te });
      }), X;
    });
    function Fi(C) {
      const g = q.value, y = m.value;
      if (C === null || !g || !y || !y.clientWidth) return;
      const T = He(C, g);
      T >= y.scrollLeft + qt && T <= y.scrollLeft + y.clientWidth - 24 || (y.scrollLeft = Math.max(0, T - qt - 24), ut());
    }
    return Be(U, (C) => ht(C)), Be(Ne, (C) => {
      n.recorded && n.playhead !== null || (u.value || n.playhead === null) && ht(C, n.playhead === null);
    }), Be(
      () => n.playhead,
      (C) => {
        u.value && Fi(C);
      }
    ), Be(() => n.locator, Fi), Be(
      () => n.recorded?.notes.at(-1)?.pitch,
      (C) => {
        const g = q.value, y = m.value;
        if (C === void 0 || !g || !y?.clientHeight) return;
        const T = Ec(g, y.scrollTop, y.clientHeight, C);
        T !== null && (y.scrollTop = T, ut());
      }
    ), Be(
      () => !!be.value,
      (C) => {
        C ? Xt(Vt) : N = !1;
      }
    ), os(() => {
      ut(), Vt(), m.value && typeof ResizeObserver < "u" && ($e = new ResizeObserver(() => {
        ut(), Vt();
      }), $e.observe(m.value));
    }), Un(() => $e?.disconnect()), e({ zoomBy: Gt, zoomRows: bn }), (C, g) => (w(), S("div", {
      ref_key: "root",
      ref: f,
      class: Ie(["roll", { stale: i.stale, readonly: i.readonly, [`mode-${$.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": $.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: gi
    }, [
      p("div", Nw, [
        p("span", Vw, [
          p("button", {
            class: Ie(["mode draw", { active: $.value === "draw" }]),
            "aria-pressed": $.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: g[0] || (g[0] = (y) => $.value = "draw")
          }, [...g[20] || (g[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            oe(" Draw ", -1)
          ])], 10, Hw),
          p("button", {
            class: Ie(["mode select", { active: $.value === "select" }]),
            "aria-pressed": $.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: g[1] || (g[1] = (y) => $.value = "select")
          }, [...g[21] || (g[21] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("rect", {
                x: "2",
                y: "3",
                width: "10",
                height: "8",
                "stroke-dasharray": "2 1.5"
              })
            ], -1),
            oe(" Select ", -1)
          ])], 10, zw)
        ]),
        p("span", Ww, [
          g[22] || (g[22] = oe(" draw into ", -1)),
          p("button", {
            class: Ie([{ active: M.value === "vocal" }, "vocal"]),
            "aria-pressed": M.value === "vocal",
            onClick: g[2] || (g[2] = (y) => M.value = "vocal")
          }, " Vocal ", 10, Fw),
          p("button", {
            class: Ie([{ active: M.value === "ins" }, "ins"]),
            "aria-pressed": M.value === "ins",
            onClick: g[3] || (g[3] = (y) => M.value = "ins")
          }, " Ins ", 10, _w)
        ]),
        p("label", Kw, [
          g[27] || (g[27] = oe(" snap ", -1)),
          Ae(p("select", {
            "onUpdate:modelValue": g[4] || (g[4] = (y) => L.value = y),
            "aria-label": "Snap"
          }, [
            p("option", Uw, "auto (" + P(L.value === "auto" ? Ft.value : "score") + ")", 1),
            g[23] || (g[23] = p("option", { value: 4 }, "1/4", -1)),
            g[24] || (g[24] = p("option", { value: 8 }, "1/8", -1)),
            g[25] || (g[25] = p("option", { value: 16 }, "1/16", -1)),
            g[26] || (g[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [ri, L.value]
          ])
        ]),
        p("span", Gw, [
          p("button", {
            disabled: !i.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: g[5] || (g[5] = (y) => s("clipboard", "copy"))
          }, " Copy ", 8, jw),
          p("button", {
            disabled: !i.selection.length || !ee.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: g[6] || (g[6] = (y) => s("clipboard", "cut"))
          }, " Cut ", 8, qw),
          p("button", {
            disabled: !i.clip || !ee.value || i.locator === null,
            title: i.clip ? `Paste ${i.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: g[7] || (g[7] = (y) => s("clipboard", "paste"))
          }, " Paste ", 8, Yw),
          p("button", {
            disabled: !i.clip || !ee.value || i.locator === null,
            title: i.clip ? `Insert ${i.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: g[8] || (g[8] = (y) => s("clipboard", "insert"))
          }, " Insert ", 8, Xw)
        ]),
        p("label", Jw, [
          Ae(p("input", {
            "onUpdate:modelValue": g[9] || (g[9] = (y) => l.value = y),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [Rt, l.value]
          ]),
          g[28] || (g[28] = oe(" hear ", -1))
        ]),
        p("button", {
          disabled: !ee.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${Ft.value}); Shift+Q: their lengths too`,
          onClick: g[10] || (g[10] = (y) => nn(!1))
        }, " Q ", 8, Zw),
        p("span", Qw, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: g[11] || (g[11] = (y) => Gt(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: g[12] || (g[12] = (y) => Gt(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: g[13] || (g[13] = (y) => bn(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: g[14] || (g[14] = (y) => bn(2))
          }, "↕+")
        ]),
        i.source ? (w(), S("label", ex, [
          Ae(p("input", {
            "onUpdate:modelValue": g[15] || (g[15] = (y) => d.value = y),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [Rt, d.value]
          ]),
          g[29] || (g[29] = oe(" wave ", -1))
        ])) : G("", !0),
        i.sung ? (w(), S("label", {
          key: 1,
          title: yi.value,
          class: Ie({ unavailable: !!i.sung.problem })
        }, [
          Ae(p("input", {
            "onUpdate:modelValue": g[16] || (g[16] = (y) => c.value = y),
            type: "checkbox",
            disabled: !!i.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, nx), [
            [Rt, c.value]
          ]),
          oe(" " + P(Yn.value), 1)
        ], 10, tx)) : G("", !0),
        p("label", ix, [
          Ae(p("input", {
            "onUpdate:modelValue": g[17] || (g[17] = (y) => u.value = y),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [Rt, u.value]
          ]),
          g[30] || (g[30] = oe(" follow ", -1))
        ]),
        i.lyrics && i.lyricsEditable && Wt.value ? (w(), S("button", {
          key: 2,
          title: "Lay the lyrics out on the notes again by the automatic rules: every line lets go of the place it has in the lyrics lane (the words stay; Ctrl+Z brings the places back)",
          onClick: At
        }, " auto-place lyrics ")) : G("", !0),
        p("span", sx, P(Q.value) + P(j.value), 1)
      ]),
      !be.value && i.view?.model_error ? (w(), S("p", ox, P(i.view.model_error.message), 1)) : be.value && q.value ? (w(), S("div", {
        key: 1,
        ref_key: "scroller",
        ref: m,
        class: "roll-scroll",
        style: Qi({ height: `${Math.min(i.height, q.value.height + 16)}px` }),
        onScroll: ut,
        onWheel: vi
      }, [
        (w(), S("svg", {
          ref_key: "svg",
          ref: k,
          class: "roll-svg",
          width: q.value.width,
          height: q.value.height,
          onPointerdown: Pn,
          onPointermove: Hi,
          onPointerup: mt,
          onPointercancel: zi,
          onDblclick: yn
        }, [
          (w(!0), S(ae, null, ge(_t.value, (y) => (w(), S("rect", {
            key: "row" + y,
            class: Ie(["row", { black: O(G0)(y), c: y % 12 === 0 }]),
            x: 0,
            y: O(ms)(y, q.value),
            width: q.value.width,
            height: q.value.rowHeight
          }, null, 10, lx))), 128)),
          (w(!0), S(ae, null, ge(qn.value, (y) => (w(), S("line", {
            key: "l" + y.unit,
            class: Ie(y.kind),
            x1: O(He)(y.unit, q.value),
            x2: O(He)(y.unit, q.value),
            y1: q.value.top,
            y2: q.value.height
          }, null, 10, ax))), 128)),
          (w(!0), S(ae, null, ge(mi.value, (y) => (w(), S("rect", co({
            key: y.id,
            class: In(y)
          }, { ref_for: !0 }, O(ii)(y, q.value), { rx: "2" }), [
            p("title", null, P(vn(y)), 1)
          ], 16))), 128)),
          (w(!0), S(ae, null, ge(fi.value, (y) => (w(), S("text", {
            key: "p" + y.key,
            class: "note-name",
            x: y.x,
            y: y.y
          }, P(y.text), 9, ux))), 128)),
          (w(!0), S(ae, null, ge(On.value, (y) => (w(), S("text", {
            key: "y" + y.key,
            class: "syllable",
            x: y.x,
            y: y.y
          }, P(y.text), 9, cx))), 128)),
          (w(!0), S(ae, null, ge(Nn.value, (y) => (w(), S("path", {
            key: y.key,
            class: "sung-pitch",
            d: y.d
          }, null, 8, hx))), 128)),
          i.recorded ? (w(!0), S(ae, { key: 0 }, ge(i.recorded.notes, (y, T) => (w(), S("rect", co({
            key: "rec" + T,
            class: "rec-note"
          }, { ref_for: !0 }, O(ii)({ onset: y.onset, duration: Math.max(y.duration, 0.5), pitch: y.pitch }, q.value), { rx: "2" }), null, 16))), 128)) : G("", !0),
          (w(!0), S(ae, null, ge(ft.value, (y, T) => (w(), S("rect", co({
            key: "ghost" + T,
            class: ["ghost", y.track]
          }, { ref_for: !0 }, O(ii)(y, q.value), { rx: "2" }), null, 16))), 128)),
          Ge.value && Ge.value.rect.height > 0 ? (w(), S("rect", co({
            key: 1,
            class: "band"
          }, Ge.value.rect), null, 16)) : G("", !0),
          i.locator !== null ? (w(), S("line", {
            key: 2,
            class: "locator",
            x1: O(He)(i.locator, q.value),
            x2: O(He)(i.locator, q.value),
            y1: q.value.top,
            y2: q.value.height
          }, null, 8, dx)) : G("", !0),
          i.playhead !== null ? (w(), S("line", {
            key: 3,
            class: "playhead",
            x1: O(He)(i.playhead, q.value),
            x2: O(He)(i.playhead, q.value),
            y1: q.value.top,
            y2: q.value.height
          }, null, 8, fx)) : G("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${I.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: q.value.top,
              width: O(qt) - 2,
              height: q.value.height - q.value.top
            }, [...g[31] || (g[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, mx),
            (w(!0), S(ae, null, ge(_t.value.filter((y) => y % 12 === 0), (y) => (w(), S("text", {
              key: "k" + y,
              class: "key-label",
              x: 4,
              y: O(ms)(y, q.value) + q.value.rowHeight - 2
            }, P(O(j0)(y)), 9, gx))), 128))
          ], 8, px),
          p("g", {
            class: "roll-top",
            transform: `translate(0 ${K.value})`
          }, [
            p("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: q.value.width,
              height: q.value.top
            }, null, 8, yx),
            p("rect", {
              class: "ruler",
              x: O(qt),
              y: 0,
              width: q.value.width - O(qt),
              height: O(An)
            }, [...g[32] || (g[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, bx),
            p("rect", {
              class: "lane",
              x: 0,
              y: O(An),
              width: q.value.width,
              height: O(Si)
            }, null, 8, kx),
            i.source && q.value.sourceTop !== null ? (w(), S(ae, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: q.value.sourceTop,
                width: q.value.width,
                height: O(Rs)
              }, [...g[33] || (g[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, wx),
              (w(!0), S(ae, null, ge(bi.value, (y) => (w(), S(ae, {
                key: y.key
              }, [
                y.missing ? (w(), S("rect", {
                  key: 0,
                  class: "source-missing",
                  x: y.x,
                  y: q.value.sourceTop + 2,
                  width: y.width,
                  height: O(Rs) - 4
                }, [...g[34] || (g[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, xx)) : (w(), S("path", {
                  key: 1,
                  class: "source-wave",
                  d: y.d
                }, null, 8, Sx))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: I.value + 3,
                y: q.value.sourceTop + 11
              }, "source", 8, Cx)
            ], 64)) : G("", !0),
            i.lyrics ? (w(), S(ae, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: O(Wn),
                width: q.value.width,
                height: O(Es)
              }, null, 8, Mx),
              (w(!0), S(ae, null, ge(at.value, (y) => (w(), S("g", {
                key: y.key,
                class: Ie(["lyric-line", { unsung: !y.syllables.length, selected: y.selected, dragged: y.dragged, stopped: y.stopped }])
              }, [
                p("rect", {
                  x: y.x,
                  y: O(Wn) + 3,
                  width: y.width,
                  height: O(Es) - 6,
                  rx: "3"
                }, null, 8, Ax),
                i.lyricsEditable ? (w(), S("rect", {
                  key: 0,
                  class: "edge",
                  x: y.x + y.width - 3,
                  y: O(Wn) + 5,
                  width: 3,
                  height: O(Es) - 10
                }, null, 8, Tx)) : G("", !0),
                p("text", {
                  x: y.x + 4,
                  y: O(Wn) + O(Es) / 2 + 4
                }, P(y.shown), 9, $x),
                p("title", null, P(y.text) + P(i.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter (it stops at the next line) · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : G("", !0),
            (w(!0), S(ae, null, ge(qn.value.filter((y) => y.kind === "bar"), (y) => (w(), S("line", {
              key: "t" + y.unit,
              class: "bar",
              x1: O(He)(y.unit, q.value),
              x2: O(He)(y.unit, q.value),
              y1: 0,
              y2: q.value.top
            }, null, 8, Dx))), 128)),
            (w(!0), S(ae, null, ge(qn.value.filter((y) => y.bar), (y) => (w(), S("text", {
              key: "n" + y.unit,
              class: "bar-number",
              x: O(He)(y.unit, q.value) + 3,
              y: 12
            }, P(y.bar), 9, Lx))), 128)),
            (w(!0), S(ae, null, ge(Rn.value, (y) => (w(), S("text", {
              key: "s" + y.unit,
              class: "section-label",
              x: O(He)(y.unit, q.value) + 22,
              y: 12
            }, P(y.label), 9, Bx))), 128)),
            (w(!0), S(ae, null, ge(gn.value, ({ chord: y, next: T }) => (w(), S("g", {
              key: y.id,
              class: Ie(["chord", {
                selected: (Ge.value?.chords ?? Y.value).has(y.id),
                dragged: H.value?.kind === "chord" && H.value.chord.id === y.id
              }])
            }, [
              p("rect", {
                x: O(He)(y.onset, q.value),
                y: O(An) + 3,
                width: O(fr)(y, T, q.value),
                height: O(Si) - 6,
                rx: "3"
              }, null, 8, Ox),
              p("text", {
                x: O(He)(y.onset, q.value) + 4,
                y: O(An) + O(Si) / 2 + 4
              }, P(y.name), 9, Ex),
              p("title", null, "chord " + P(y.name) + " - click to hear it, drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            H.value?.kind === "chord" ? (w(), S("g", Rx, [
              p("rect", {
                x: O(He)(H.value.to, q.value),
                y: O(An) + 3,
                width: O(fr)(H.value.chord, void 0, q.value),
                height: O(Si) - 6,
                rx: "3"
              }, null, 8, Ix),
              p("text", {
                x: O(He)(H.value.to, q.value) + 4,
                y: O(An) + O(Si) / 2 + 4
              }, P(H.value.chord.name), 9, Px)
            ])) : G("", !0),
            Ge.value?.lane && Ge.value.rect.width > 0 ? (w(), S("rect", {
              key: 3,
              class: "band",
              x: Ge.value.rect.x,
              y: O(An),
              width: Ge.value.rect.width,
              height: O(Si)
            }, null, 8, Nx)) : G("", !0),
            i.playhead !== null ? (w(), S("line", {
              key: 4,
              class: "playhead",
              x1: O(He)(i.playhead, q.value),
              x2: O(He)(i.playhead, q.value),
              y1: 0,
              y2: q.value.top
            }, null, 8, Vx)) : G("", !0),
            i.locator !== null ? (w(), S("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${O(He)(i.locator, q.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: q.value.top
              }, null, 8, zx),
              g[35] || (g[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + P(ce.value) + " - click or drag in the ruler to move it", 1)
            ], 8, Hx)) : G("", !0)
          ], 8, vx)
        ], 40, rx)),
        A.value ? Ae((w(), S("input", {
          key: 0,
          ref_key: "chordInput",
          ref: b,
          "onUpdate:modelValue": g[18] || (g[18] = (y) => A.value.name = y),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: Qi({ left: `${O(He)(A.value.onset, q.value)}px`, top: `${O(An) + 1 + K.value}px` }),
          onKeydown: [
            nt(Fe(Wi, ["prevent"]), ["enter"]),
            nt(Fe(Ut, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Ut
        }, null, 44, Wx)), [
          [rt, A.value.name]
        ]) : G("", !0),
        fe.value ? Ae((w(), S("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: F,
          "onUpdate:modelValue": g[19] || (g[19] = (y) => fe.value.text = y),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: Qi({ left: `${O(He)(fe.value.start, q.value)}px`, top: `${O(Wn) + 1 + K.value}px` }),
          onKeydown: [
            nt(Fe(En, ["prevent"]), ["enter"]),
            nt(Fe(Ni, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: En
        }, null, 44, Fx)), [
          [rt, fe.value.text]
        ]) : G("", !0)
      ], 36)) : G("", !0)
    ], 42, Pw));
  }
}), mr = (i) => [...new Set(i)].sort((e, t) => e - t);
function Fc(i, e, t, n) {
  if (t.range && n !== null) {
    const [s, o] = n <= e ? [n, e] : [e, n], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? mr([...i, ...r]) : r;
  }
  return t.toggle ? i.includes(e) ? i.filter((s) => s !== e) : mr([...i, e]) : [e];
}
function _c(i, e) {
  const t = new Set(e), n = Array.from({ length: i }, (s, o) => o).filter((s) => !t.has(s));
  return !n.length || n.length === i ? null : { order: n.map((s) => s + 1), selection: [] };
}
function Kc(i, e) {
  const t = mr(e).filter((o) => o >= 0 && o < i);
  if (!t.length) return null;
  const n = t[t.length - 1];
  return { order: [
    ...Array.from({ length: n + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: i - n - 1 }, (o, r) => n + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => n + 1 + r) };
}
function Uc(i, e, t) {
  const n = new Set(e.filter((l) => l >= 0 && l < i));
  if (!n.size) return null;
  const s = Array.from({ length: i }, (l, a) => a), o = t < 0 ? s : [...s].reverse();
  let r = !1;
  for (const l of o) {
    const a = s[l], u = l + t;
    !n.has(a) || u < 0 || u >= i || n.has(s[u]) || (s[l] = s[u], s[u] = a, r = !0);
  }
  return r ? { order: s.map((l) => l + 1), selection: s.flatMap((l, a) => n.has(l) ? [a] : []) } : null;
}
function Gc(i, e, t, n) {
  const s = mr(e).filter((a) => a >= 0 && a < i);
  if (!s.length || t < 0 || t > i) return null;
  const o = n ? Array.from({ length: i }, (a, u) => u) : Array.from({ length: i }, (a, u) => u).filter((a) => !s.includes(a)), r = n ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !n && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const ei = _(null);
function gr(i) {
  return i.id.startsWith("ins:") ? "ins" : "vocal";
}
function Ux(i, e, t = null) {
  const n = [...new Set(e)].sort((u, c) => u - c).filter((u) => i.sections[u]), s = n.map((u) => i.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const d = i.measures[c.first_bar - 1], h = i.measures[c.first_bar - 1 + c.bars - 1], f = d.onset, m = h.onset + h.length;
    for (const b of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (b.onset >= m || b.onset + b.duration <= f) continue;
      const M = Math.max(b.onset, f);
      o.push({ track: gr(b), onset: M - f + a, duration: Math.min(b.onset + b.duration, m) - M, pitch: b.pitch });
    }
    for (const b of i.tracks.chords) b.onset >= f && b.onset < m && r.push({ onset: b.onset - f + a, name: b.name });
    const k = t?.[n[u]];
    l.push(k ? { onset: a, label: c.label, lyrics: k } : { onset: a, label: c.label }), a += m - f;
  }
  return {
    unit: i.unit,
    span: a,
    tracks: ["vocal", "ins"],
    withChords: !0,
    notes: o,
    chords: r,
    sections: l,
    label: `section${s.length > 1 ? "s" : ""} ${s.map((u) => u.label).join(", ")}`
  };
}
function Gx(i) {
  const e = [...new Set(i)].sort((n, s) => n - s), t = [];
  for (let n = 0; n < e.length; ) {
    let s = n;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > n ? `${e[n]}-${e[s]}` : `${e[n]}`), n = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function jx(i, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => i.measures[r]);
  if (!t.length) return null;
  const n = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = i.measures[r], u = l + a;
    for (const c of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const d = Math.max(c.onset, l);
      n.push({ track: gr(c), onset: d - l + o, duration: Math.min(c.onset + c.duration, u) - d, pitch: c.pitch });
    }
    for (const c of i.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: i.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: n, chords: s, sections: [], label: Gx(t.map((r) => r + 1)) };
}
function jc(i, e, t) {
  if (!e.length && !t.length) return null;
  const n = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => gr(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: i.unit,
    span: s - n,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: gr(l), onset: l.onset - n, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - n, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function qc(i) {
  const e = /^1\/(\d+)$/.exec(i.trim());
  return e ? Number(e[1]) : NaN;
}
function qx(i, e) {
  const t = qc(e) / qc(i.unit);
  if (!Number.isFinite(t) || t <= 0) return null;
  if (t === 1) return i;
  const n = (o) => {
    const r = o * t;
    return Number.isInteger(r) ? r : null;
  };
  return [
    i.span,
    ...i.notes.flatMap((o) => [o.onset, o.duration]),
    ...i.chords.map((o) => o.onset),
    ...i.sections.map((o) => o.onset),
    ...(i.lyricLines ?? []).flatMap((o) => [o.offset, o.length])
  ].some((o) => n(o) === null) ? null : {
    ...i,
    unit: e,
    span: i.span * t,
    notes: i.notes.map((o) => ({ ...o, onset: o.onset * t, duration: o.duration * t })),
    chords: i.chords.map((o) => ({ ...o, onset: o.onset * t })),
    sections: i.sections.map((o) => ({ ...o, onset: o.onset * t })),
    ...i.lyricLines ? { lyricLines: i.lyricLines.map((o) => ({ ...o, offset: o.offset * t, length: o.length * t })) } : {}
  };
}
function Yx(i, e) {
  if (!e.length) return null;
  const t = Math.max(...e.map((n) => n.offset + n.length));
  return {
    unit: i,
    span: t,
    tracks: [],
    withChords: !1,
    notes: [],
    chords: [],
    sections: [],
    lyricLines: e.map((n) => ({ ...n })),
    label: `${e.length} lyrics line${e.length > 1 ? "s" : ""}`
  };
}
function Yc(i, e, t, n) {
  const s = qx(i, e.unit);
  return s ? t < 0 || t >= e.total ? "Set the cursor inside the score first." : {
    op: "paste",
    at: t,
    mode: n,
    span: s.span,
    tracks: s.tracks,
    with_chords: s.withChords,
    notes: s.notes,
    chords: s.chords,
    sections: n === "insert" ? s.sections.map(({ onset: o, label: r }) => ({ onset: o, label: r })) : []
  } : `The clip was copied with L:${i.unit} and does not fit this score's L:${e.unit} grid.`;
}
const Xx = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, Jx = { class: "hint" }, Zx = ["disabled"], Qx = ["disabled"], eS = ["disabled"], tS = ["disabled"], nS = ["disabled"], iS = ["draggable", "aria-selected", "onDragstart", "onDragover"], sS = ["onClick"], oS = ["title"], rS = { key: 0 }, lS = ["onKeydown", "onBlur"], aS = { class: "facts" }, uS = {
  key: 0,
  class: "section-tools"
}, cS = ["onClick"], hS = ["onClick"], dS = ["onClick"], fS = ["onClick"], pS = {
  key: 1,
  class: "split"
}, mS = ["disabled"], gS = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, vS = { class: "hint" }, yS = ["disabled"], bS = ["disabled"], kS = ["disabled"], wS = ["disabled"], xS = ["disabled"], SS = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], CS = /* @__PURE__ */ Ct({
  __name: "ScoreNavigator",
  props: {
    view: {},
    bar: {},
    errorBars: {},
    sourceStarts: {},
    readonly: { type: Boolean },
    sectionLyrics: {}
  },
  emits: ["goto", "operate", "notice"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = _(null), o = _(""), r = _("bridge"), l = _([]), a = _(null);
    let u = null;
    const c = _(!1), d = _(null), h = _([]), f = _(null);
    let m = null;
    const k = _("sections"), b = _(!1), M = _(null), $ = E(() => t.view?.sections ?? []), L = E(() => t.view?.bars ?? []), H = E(() => t.view && t.bar ? yl(t.view, t.bar) : -1), V = E(() => new Set(t.errorBars)), W = E(() => !t.readonly && !!t.view?.model && $.value.length > 0);
    Be($, (Q) => {
      l.value = (u ?? l.value).filter((j) => j < Q.length), u = null;
    }), Be(L, (Q) => {
      h.value = (m ?? h.value).filter((j) => j < Q.length), m = null;
    });
    function I(Q, j) {
      s.value = Q, o.value = j;
    }
    function K(Q) {
      const j = o.value.trim();
      s.value = null, j && j !== $.value[Q]?.label && n("operate", { op: "rename_section", section: Q + 1, label: j });
    }
    function R(Q, j) {
      const ce = $.value[Q];
      ce && n("operate", { op: "move_section_boundary", section: Q + 1, start_bar: ce.start_bar + j });
    }
    function z(Q) {
      const j = t.sourceStarts?.[Q - 1];
      return typeof j == "number" ? zo(j) : null;
    }
    function N(Q, j) {
      k.value = "sections";
      const ce = j.ctrlKey || j.metaKey;
      l.value = Fc(l.value, Q, { toggle: ce, range: j.shiftKey }, a.value), j.shiftKey || (a.value = Q);
      const ve = $.value[Q];
      ve && !ce && !j.shiftKey && n("goto", ve.start_bar);
    }
    function A(Q) {
      !Q || !W.value || (u = Q.selection, n("operate", { op: "arrange_sections", order: Q.order }));
    }
    const F = () => A(Kc($.value.length, l.value)), fe = () => A(_c($.value.length, l.value)), pe = (Q) => A(Uc($.value.length, l.value, Q));
    function te() {
      const Q = t.view?.model;
      if (!Q || !l.value.length) return;
      const j = Ux(Q, l.value, t.sectionLyrics ?? null);
      j && (ei.value = j, n("notice", `copied ${j.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function ie(Q, j) {
      k.value = "bars";
      const ce = j.ctrlKey || j.metaKey;
      h.value = Fc(h.value, Q, { toggle: ce, range: j.shiftKey }, f.value), j.shiftKey || (f.value = Q);
      const ve = L.value[Q];
      ve && !ce && !j.shiftKey && n("goto", ve.index);
    }
    function $e(Q) {
      !Q || !W.value || (m = Q.selection, n("operate", { op: "arrange_measures", order: Q.order.map((j) => j - 1) }));
    }
    const be = () => $e(Kc(L.value.length, h.value)), Me = () => $e(_c(L.value.length, h.value)), xe = (Q) => $e(Uc(L.value.length, h.value, Q));
    function q() {
      const Q = t.view?.model;
      if (!Q || !h.value.length) return;
      const j = jx(Q, h.value);
      j && (ei.value = j, n("notice", `copied ${j.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function Je(Q) {
      const j = Q.ctrlKey || Q.metaKey, ce = Q.key.toLowerCase();
      if (Q.key === "Delete" || Q.key === "Backspace") Me();
      else if (j && ce === "d") be();
      else if (j && ce === "c") q();
      else if (j && ce === "x" && h.value.length < L.value.length)
        q(), Me();
      else if (j && (Q.key === "ArrowLeft" || Q.key === "ArrowUp")) xe(-1);
      else if (j && (Q.key === "ArrowRight" || Q.key === "ArrowDown")) xe(1);
      else if (j && ce === "a") h.value = L.value.map((ve, ke) => ke);
      else if (Q.key === "Escape" && h.value.length) h.value = [];
      else return !1;
      return !0;
    }
    function le(Q, j) {
      W.value && (k.value = "bars", h.value.includes(Q) || (h.value = [Q]), b.value = !0, j.dataTransfer?.setData("text/plain", "plenio-bars"), j.dataTransfer && (j.dataTransfer.effectAllowed = "copyMove"));
    }
    function De(Q, j) {
      if (!b.value) return;
      j.preventDefault();
      const ce = j.currentTarget.getBoundingClientRect();
      M.value = j.clientX < ce.left + ce.width / 2 ? Q : Q + 1, j.dataTransfer && (j.dataTransfer.dropEffect = j.altKey || j.ctrlKey ? "copy" : "move");
    }
    function ee(Q) {
      !b.value || M.value === null || (Q.preventDefault(), $e(Gc(L.value.length, h.value, M.value, Q.altKey || Q.ctrlKey)), U());
    }
    function U() {
      b.value = !1, M.value = null;
    }
    function Y(Q) {
      if (!W.value || Q.target?.closest("input, textarea, select")) return;
      if (k.value === "bars") {
        Je(Q) && (Q.preventDefault(), Q.stopPropagation());
        return;
      }
      const j = Q.ctrlKey || Q.metaKey, ce = Q.key.toLowerCase();
      let ve = !0;
      Q.key === "Delete" || Q.key === "Backspace" ? fe() : j && ce === "d" ? F() : j && ce === "c" ? te() : j && ce === "x" && l.value.length < $.value.length ? (te(), fe()) : j && Q.key === "ArrowUp" ? pe(-1) : j && Q.key === "ArrowDown" ? pe(1) : j && ce === "a" ? l.value = $.value.map((ke, bt) => bt) : Q.key === "Escape" && l.value.length ? l.value = [] : ve = !1, ve && (Q.preventDefault(), Q.stopPropagation());
    }
    function Ne(Q, j) {
      W.value && (l.value.includes(Q) || (l.value = [Q]), c.value = !0, j.dataTransfer?.setData("text/plain", "plenio-sections"), j.dataTransfer && (j.dataTransfer.effectAllowed = "copyMove"));
    }
    function et(Q, j) {
      if (!c.value) return;
      j.preventDefault();
      const ce = j.currentTarget.getBoundingClientRect();
      d.value = j.clientY < ce.top + ce.height / 2 ? Q : Q + 1, j.dataTransfer && (j.dataTransfer.dropEffect = j.altKey || j.ctrlKey ? "copy" : "move");
    }
    function ft(Q) {
      !c.value || d.value === null || (Q.preventDefault(), A(Gc($.value.length, l.value, d.value, Q.altKey || Q.ctrlKey)), Ge());
    }
    function Ge() {
      c.value = !1, d.value = null;
    }
    return (Q, j) => (w(), S("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: Y
    }, [
      W.value ? (w(), S("div", Xx, [
        p("span", Jx, P(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: F
        }, " Duplicate ", 8, Zx),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: te
        }, " Copy ", 8, Qx),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: j[0] || (j[0] = (ce) => pe(-1))
        }, "↑", 8, eS),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: j[1] || (j[1] = (ce) => pe(1))
        }, "↓", 8, tS),
        p("button", {
          disabled: !l.value.length || l.value.length >= $.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: fe
        }, " Delete ", 8, nS)
      ])) : G("", !0),
      p("ol", {
        class: "sections",
        onDragleave: j[5] || (j[5] = Fe((ce) => d.value = null, ["self"]))
      }, [
        (w(!0), S(ae, null, ge($.value, (ce, ve) => (w(), S("li", {
          key: ve,
          class: Ie({
            current: ve === H.value,
            picked: l.value.includes(ve),
            "drop-before": d.value === ve,
            "drop-after": d.value === ve + 1 && ve === $.value.length - 1
          }),
          draggable: W.value,
          "aria-selected": l.value.includes(ve),
          onDragstart: (ke) => Ne(ve, ke),
          onDragover: (ke) => et(ve, ke),
          onDrop: ft,
          onDragend: Ge
        }, [
          p("div", {
            class: "section-head",
            onClick: (ke) => N(ve, ke)
          }, [
            p("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${ce.start_bar}`
            }, [
              s.value !== ve ? (w(), S("strong", rS, P(ce.label), 1)) : G("", !0)
            ], 8, oS),
            s.value === ve ? Ae((w(), S("input", {
              key: 0,
              "onUpdate:modelValue": j[2] || (j[2] = (ke) => o.value = ke),
              class: "rename",
              "aria-label": "Section name",
              onClick: j[3] || (j[3] = Fe(() => {
              }, ["stop"])),
              onKeydown: [
                nt(Fe((ke) => K(ve), ["prevent"]), ["enter"]),
                j[4] || (j[4] = nt(Fe((ke) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (ke) => K(ve)
            }, null, 40, lS)), [
              [rt, o.value]
            ]) : G("", !0),
            p("span", aS, [
              oe(" bars " + P(ce.start_bar) + "-" + P(ce.start_bar + ce.bars - 1) + " · " + P(O(zo)(ce.start_s)) + " ", 1),
              z(ce.start_bar) ? (w(), S(ae, { key: 0 }, [
                oe(" · source " + P(z(ce.start_bar)), 1)
              ], 64)) : G("", !0)
            ])
          ], 8, sS),
          i.readonly ? G("", !0) : (w(), S("div", uS, [
            p("button", {
              title: "Rename this section",
              onClick: (ke) => I(ve, ce.label)
            }, "Rename", 8, cS),
            ve > 0 ? (w(), S(ae, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (ke) => R(ve, -1)
              }, "◀ bar", 8, hS),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (ke) => R(ve, 1)
              }, "bar ▶", 8, dS),
              p("button", {
                title: "Join this section to the one before",
                onClick: (ke) => n("operate", { op: "merge_section", section: ve + 1 })
              }, " Join ↑ ", 8, fS)
            ], 64)) : G("", !0)
          ]))
        ], 42, iS))), 128))
      ], 32),
      !i.readonly && i.bar ? (w(), S("div", pS, [
        p("label", null, [
          oe(" New section at bar " + P(i.bar) + ": ", 1),
          Ae(p("input", {
            "onUpdate:modelValue": j[6] || (j[6] = (ce) => r.value = ce),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [rt, r.value]
          ])
        ]),
        p("button", {
          disabled: i.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: j[7] || (j[7] = (ce) => n("operate", { op: "split_section", bar: i.bar, label: r.value }))
        }, " Split ", 8, mS)
      ])) : G("", !0),
      W.value ? (w(), S("div", gS, [
        p("span", vS, P(h.value.length ? `${h.value.length} bar${h.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !h.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: be
        }, " Duplicate ", 8, yS),
        p("button", {
          disabled: !h.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: q
        }, " Copy ", 8, bS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: j[8] || (j[8] = (ce) => xe(-1))
        }, "←", 8, kS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: j[9] || (j[9] = (ce) => xe(1))
        }, "→", 8, wS),
        p("button", {
          disabled: !h.value.length || h.value.length >= L.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Me
        }, " Delete ", 8, xS)
      ])) : G("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: j[10] || (j[10] = Fe((ce) => M.value = null, ["self"]))
      }, [
        (w(!0), S(ae, null, ge(L.value, (ce, ve) => (w(), S("button", {
          key: ce.index,
          role: "listitem",
          class: Ie(["bar", {
            selected: ce.index === i.bar,
            picked: h.value.includes(ve),
            error: V.value.has(ce.index),
            alt: i.view ? O(yl)(i.view, ce.index) % 2 === 1 : !1,
            "drop-before": M.value === ve,
            "drop-after": M.value === ve + 1 && ve === L.value.length - 1
          }]),
          draggable: W.value,
          "aria-selected": h.value.includes(ve),
          title: `Bar ${ce.index} · ${O(zo)(ce.start_s)} · ${ce.chords.join(" ") || "no chord"}${W.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (ke) => ie(ve, ke),
          onDragstart: (ke) => le(ve, ke),
          onDragover: (ke) => De(ve, ke),
          onDrop: ee,
          onDragend: U
        }, P(ce.index), 43, SS))), 128))
      ], 32)
    ], 32));
  }
}), MS = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, AS = {
  class: "group",
  "aria-label": "History"
}, TS = ["disabled", "title"], $S = ["disabled", "title"], DS = {
  class: "group",
  "aria-label": "Pitch"
}, LS = ["disabled"], BS = ["disabled"], OS = ["disabled"], ES = ["disabled"], RS = {
  class: "group",
  "aria-label": "Length"
}, IS = ["disabled"], PS = ["disabled"], NS = ["disabled"], VS = ["disabled"], HS = {
  class: "group",
  "aria-label": "Chord"
}, zS = ["disabled", "onKeydown"], WS = ["disabled", "title"], FS = ["disabled", "title"], _S = { class: "group whole" }, KS = { class: "whole-tools" }, US = ["disabled"], GS = ["disabled"], jS = ["aria-label"], qS = ["disabled", "title", "onClick"], YS = ["disabled", "title", "onClick"], XS = ["disabled"], JS = ["disabled"], ZS = ["disabled"], QS = ["disabled"], eC = /* @__PURE__ */ Ct({
  __name: "ScorePalette",
  props: {
    view: {},
    selection: {},
    primary: {},
    busy: { type: Boolean },
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    undoLabel: {},
    redoLabel: {},
    stale: { type: Boolean }
  },
  emits: ["operate", "undo", "redo"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = _(""), o = _(null), r = E(() => t.selection.filter((R) => t.view?.elements?.find((z) => z.id === R)?.kind === "note")), l = E(() => [...vs(t.selection)]), a = E(() => r.value.length > 0 || l.value.length > 0), u = E(() => t.primary !== null && t.primary.kind !== "note"), c = E(() => {
      const R = t.primary;
      return !R || !t.view ? null : t.view.chords?.find((z) => z.bar === R.bar && Math.abs(z.start_s - R.start_s) < 1e-6) ?? null;
    }), d = E(() => vl(t.view, t.primary, 1)), h = E(() => vl(t.view, t.primary, -1)), f = E(() => t.busy || !!t.stale), m = E(() => {
      const R = vs(t.selection);
      return (t.view?.model?.tracks.chords ?? []).filter((z) => R.has(z.id));
    }), k = E(() => !t.primary && m.value.length === 1 ? m.value[0] : null), b = E(() => !!t.primary || !!k.value), M = E(() => t.primary ? !!c.value : m.value.length > 0), $ = E(
      () => k.value ? `Rename the selected chord symbol ${k.value.name} (Enter in the field)` : m.value.length > 1 ? "Select one chord symbol to rename it (or a note or rest to set one there)" : "Set the chord symbol at the selected note or rest"
    ), L = E(
      () => t.primary ? "Remove the chord symbol at the selection" : m.value.length > 1 ? `Remove the ${m.value.length} selected chord symbols` : "Remove the selected chord symbol"
    );
    function H() {
      const R = s.value.trim();
      !R || f.value || (t.primary ? n("operate", { op: "set_chord", id: t.primary.id, name: R }) : k.value && n("operate", { op: "put_chord", onset: k.value.onset, name: R }));
    }
    function V() {
      f.value || (t.primary ? c.value && n("operate", { op: "remove_chord", chord: c.value.id }) : m.value.length === 1 ? n("operate", { op: "delete_chord", onset: m.value[0].onset }) : m.value.length && n("operate", { op: "delete", ids: m.value.map((R) => R.id) }));
    }
    Be(
      () => t.view?.header?.tempo_bpm,
      (R) => {
        o.value = R ?? null;
      },
      { immediate: !0 }
    ), Be(
      () => t.primary ? c.value?.name ?? "" : k.value?.name ?? "",
      (R) => {
        s.value = R;
      },
      { immediate: !0 }
    );
    const W = Object.values(Jn).map(({ track: R, name: z }) => [R, z]), I = (R, z) => Ds(t.view, R, z);
    function K(R) {
      l.value.length ? n("operate", { op: "set_note_pitch", ids: [...gs(t.view, t.selection), ...l.value], semitones: R }) : r.value.length && n("operate", { op: "shift_pitch", ids: r.value, semitones: R });
    }
    return (R, z) => (w(), S("div", MS, [
      p("div", AS, [
        p("button", {
          disabled: !i.canUndo || i.busy,
          title: `Undo${i.undoLabel ? ": " + i.undoLabel : ""} (Ctrl+Z)`,
          onClick: z[0] || (z[0] = (N) => n("undo"))
        }, "↶", 8, TS),
        p("button", {
          disabled: !i.canRedo || i.busy,
          title: `Redo${i.redoLabel ? ": " + i.redoLabel : ""} (Ctrl+Y)`,
          onClick: z[1] || (z[1] = (N) => n("redo"))
        }, "↷", 8, $S)
      ]),
      p("div", DS, [
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave down (Shift+↓)",
          onClick: z[2] || (z[2] = (N) => K(-12))
        }, "−8va", 8, LS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: z[3] || (z[3] = (N) => K(-1))
        }, "−1", 8, BS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: z[4] || (z[4] = (N) => K(1))
        }, "+1", 8, OS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave up (Shift+↑)",
          onClick: z[5] || (z[5] = (N) => K(12))
        }, "+8va", 8, ES)
      ]),
      p("div", RS, [
        p("button", {
          disabled: !h.value || f.value,
          title: "Shorter from its end - also a note tied over a bar line, as one note; a rest fills the time ([)",
          onClick: z[6] || (z[6] = (N) => h.value && n("operate", h.value))
        }, " shorter ", 8, IS),
        p("button", {
          disabled: !d.value || f.value,
          title: "Longer, into the rest after the note (])",
          onClick: z[7] || (z[7] = (N) => d.value && n("operate", d.value))
        }, " longer ", 8, PS),
        p("button", {
          disabled: !r.value.length || i.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: z[8] || (z[8] = (N) => n("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, NS),
        p("button", {
          disabled: !u.value || i.busy,
          title: "Turn the rest into a note (N)",
          onClick: z[9] || (z[9] = (N) => i.primary && n("operate", { op: "rest_to_note", id: i.primary.id }))
        }, " note ", 8, VS)
      ]),
      p("div", HS, [
        Ae(p("input", {
          "onUpdate:modelValue": z[10] || (z[10] = (N) => s.value = N),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !b.value || f.value,
          onKeydown: nt(Fe(H, ["prevent"]), ["enter"])
        }, null, 40, zS), [
          [rt, s.value]
        ]),
        p("button", {
          disabled: !b.value || !s.value.trim() || f.value,
          title: $.value,
          onClick: H
        }, "set", 8, WS),
        p("button", {
          disabled: !M.value || f.value,
          title: L.value,
          onClick: V
        }, "remove", 8, FS)
      ]),
      p("details", _S, [
        z[19] || (z[19] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", KS, [
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone down",
            onClick: z[11] || (z[11] = (N) => n("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, US),
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone up",
            onClick: z[12] || (z[12] = (N) => n("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, GS),
          (w(!0), S(ae, null, ge(O(W), ([N, A]) => (w(), S("span", {
            key: N,
            class: "track-octave",
            role: "group",
            "aria-label": `${A} track octave`
          }, [
            oe(P(A) + " ", 1),
            p("button", {
              disabled: i.busy || !!I(N, -12),
              title: I(N, -12) ?? `Every ${A} note an octave down (chord symbols and keys stay)`,
              onClick: (F) => n("operate", { op: "shift_track", track: N, semitones: -12 })
            }, " −8va ", 8, qS),
            p("button", {
              disabled: i.busy || !!I(N, 12),
              title: I(N, 12) ?? `Every ${A} note an octave up (chord symbols and keys stay)`,
              onClick: (F) => n("operate", { op: "shift_track", track: N, semitones: 12 })
            }, " +8va ", 8, YS)
          ], 8, jS))), 128)),
          p("label", null, [
            z[18] || (z[18] = oe(" tempo ", -1)),
            Ae(p("input", {
              "onUpdate:modelValue": z[13] || (z[13] = (N) => o.value = N),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                rt,
                o.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("button", {
            disabled: i.busy || !o.value || o.value === i.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: z[14] || (z[14] = (N) => o.value && n("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, XS),
          p("button", {
            disabled: i.busy || !i.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: z[15] || (z[15] = (N) => n("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, JS),
          p("button", {
            disabled: i.busy,
            title: "Let the instrument play the vocal melody",
            onClick: z[16] || (z[16] = (N) => n("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, ZS),
          p("button", {
            disabled: i.busy,
            title: "Replace every Vocal note by rests",
            onClick: z[17] || (z[17] = (N) => n("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, QS)
        ])
      ])
    ]));
  }
}), tC = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, nC = ["disabled", "title"], iC = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, sC = ["aria-checked", "disabled", "title", "onClick"], oC = ["disabled"], rC = ["title"], lC = ["disabled"], aC = { class: "align" }, uC = ["aria-expanded", "title"], cC = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, hC = ["title"], dC = ["title"], fC = ["disabled"], pC = {
  key: 0,
  class: "facts"
}, mC = ["title"], gC = { title: "A click on every beat (takes effect at the next start)" }, vC = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, yC = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, bC = ["checked"], kC = { title: "Practice speed; the score's tempo is not changed" }, wC = { class: "facts" }, xC = {
  key: 1,
  class: "error"
}, SC = /* @__PURE__ */ Ct({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ Qt({
    view: {},
    sounds: {},
    bar: {},
    from: {},
    position: {},
    reference: {},
    timelineBars: {},
    guide: {},
    source: {},
    sourceProblem: {},
    loopRange: {},
    sourceBeat: {}
  }, {
    voices: { required: !0 },
    voicesModifiers: {},
    speed: { required: !0 },
    speedModifiers: {},
    metronome: { type: Boolean, default: !1 },
    metronomeModifiers: {},
    hear: { default: "both" },
    hearModifiers: {},
    sourceLevel: { default: 0.7 },
    sourceLevelModifiers: {},
    sourceShift: { default: 0 },
    sourceShiftModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = lt(i, "voices"), o = lt(i, "speed"), r = lt(i, "metronome"), l = lt(i, "hear"), a = lt(i, "sourceLevel"), u = lt(i, "sourceShift"), c = _(!1);
    function d(ee) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + ee) * 1e3) / 1e3));
    }
    const h = E(() => {
      const ee = Math.round(u.value * 1e3);
      return ee ? `${Math.abs(ee)} ms ${ee > 0 ? "later" : "earlier"}` : "in place";
    }), f = t, m = new ww(), k = _(!1), b = _(!1);
    let M = 0, $ = null;
    const L = _(!1), H = _(0), V = _(null);
    let W = null;
    const I = E(() => n.bar ?? 1), K = E(() => n.from ?? n.view?.bars[I.value - 1]?.start_s ?? 0), R = E(() => n.position ? `the cursor (${n.position})` : `bar ${I.value}`), z = E(() => !!n.view?.notes), N = E(() => !!n.reference && !!n.source && o.value === 1), A = E(() => n.reference ? n.sourceProblem ? n.sourceProblem : n.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function F() {
      const ee = N.value ? l.value : "notes";
      return { tones: ee === "source" ? 0 : 1, source: ee === "notes" ? 0 : a.value };
    }
    function fe(ee) {
      const U = n.view?.bars ?? [];
      let Y = 1;
      for (const Ne of U) Ne.start_s <= ee + No && (Y = Ne.index);
      return Y;
    }
    function pe(ee) {
      if (n.loopRange) return [n.loopRange.from, n.loopRange.to];
      const U = n.view;
      if (!U) return null;
      const Y = U.sections[yl(U, fe(ee))];
      return Y ? [Y.start_s, Y.end_s] : null;
    }
    function te(ee = K.value, U = null) {
      const Y = n.view;
      if (!Y) return;
      Me(), $ = U;
      const Ne = L.value && !U ? pe(ee) : null, et = Ne && (ee < Ne[0] - No || ee >= Ne[1] - No) ? Ne[0] : ee, ft = N.value, Ge = ft ? pp(Y, n.timelineBars) : null, Q = { ...s.value };
      U?.mute && (Q[U.mute] = !1), W = {
        from: et,
        to: Ne ? Ne[1] : null,
        voices: Q,
        speed: o.value,
        metronome: r.value,
        guide: n.guide ?? [],
        clock: Ge
      };
      const j = W;
      M = U ? $e(Y, et, U.countIn, Ge) : 0;
      const ce = mp(Y, j).map((ke) => ({ ...ke, at: ke.at + M }));
      M && ce.unshift(...be(Y, et, U?.countIn ?? 0, M));
      const ve = ft && Ge && n.source ? gp(Ge, et, j.to).map((ke) => ({ ...ke, at: ke.at + M })) : [];
      try {
        m.play(ce, {
          source: ve.length && n.source ? { buffer: n.source.buffer, segments: ve } : null,
          levels: F(),
          length: M + bp(Y, j),
          sounds: n.sounds,
          onTick: (ke) => {
            b.value = ke < M, !(ke < M) && (H.value = vp(j, ke - M), f("cursor", yp(Y, H.value, j.voices)), f("time", H.value));
          },
          onEnd: () => {
            L.value && k.value && !U ? te(Ne?.[0] ?? j.from) : xe();
          }
        }), k.value = !0, b.value = M > 0, V.value = null;
      } catch (ke) {
        V.value = ke instanceof Error ? ke.message : String(ke);
      }
    }
    function ie(ee, U, Y) {
      const Ne = ee.bars[fe(U) - 1], et = Number(Ne?.meter.split("/")[0]) || 4;
      return { beat: (Y?.[fe(U) - 1]?.realDur ?? Ne?.duration_s ?? 2) / et / Ja(o.value), beats: et };
    }
    function $e(ee, U, Y, Ne) {
      if (Y <= 0) return 0;
      const { beat: et, beats: ft } = ie(ee, U, Ne);
      return Y * ft * et;
    }
    function be(ee, U, Y, Ne) {
      const { beat: et, beats: ft } = ie(ee, U, W?.clock ?? null);
      return kp(ee.bars[fe(U) - 1] ?? null, ft, U, Y, Ne, et);
    }
    function Me() {
      m.stop(), k.value = !1, b.value = !1, $ = null;
    }
    function xe() {
      const ee = k.value;
      Me(), f("cursor", []), f("time", null), ee && f("stopped");
    }
    function q(ee, U) {
      return te(ee, U), k.value;
    }
    function Je(ee) {
      const U = W;
      if (!U || !k.value) return null;
      const Y = m.elapsedAt(ee) - M, Ne = U.clock?.length ? U.clock : null, et = Y * Ja(U.speed);
      return Ne ? wp(Ne, xp(Ne, U.from) + et) : U.from + et;
    }
    function le() {
      k.value ? xe() : te();
    }
    function De() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Be(
      () => n.sounds,
      (ee) => {
        ee && m.setSounds(ee);
      },
      { deep: !0 }
    ), Be([l, a], () => {
      k.value && m.setLevels(F());
    }), Be(
      () => n.from,
      (ee, U) => {
        k.value && !$ && ee !== null && ee !== void 0 && ee !== U && te(ee);
      }
    ), e({ toggle: le, stop: xe, swap: De, playing: k, record: q, scoreSecondAt: Je, countingIn: b }), Un(() => m.close()), (ee, U) => (w(), S("div", tC, [
      p("button", {
        disabled: !z.value,
        title: k.value ? "Stop (Space)" : `Play from ${R.value} (Space)`,
        onClick: le
      }, P(k.value ? "■ stop" : "▶ play"), 9, nC),
      sp(ee.$slots, "record", {
        playing: k.value,
        countingIn: b.value
      }),
      i.reference ? (w(), S("span", iC, [
        (w(), S(ae, null, ge(["both", "notes", "source"], (Y) => p("button", {
          key: Y,
          role: "radio",
          "aria-checked": l.value === Y,
          class: Ie({ active: l.value === Y }),
          disabled: !N.value && Y !== "notes",
          title: A.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[Y],
          onClick: (Ne) => l.value = Y
        }, P(Y), 11, sC)), 64)),
        p("button", {
          disabled: !N.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: De
        }, "A/B", 8, oC),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          U[14] || (U[14] = oe(" source ", -1)),
          Ae(p("input", {
            "onUpdate:modelValue": U[0] || (U[0] = (Y) => a.value = Y),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !N.value,
            "aria-label": "Source level"
          }, null, 8, lC), [
            [
              rt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, rC),
        p("span", aC, [
          p("button", {
            class: Ie({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${h.value})`,
            onClick: U[1] || (U[1] = (Y) => c.value = !c.value)
          }, " ⇆ align" + P(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, uC),
          c.value ? (w(), S("span", cC, [
            U[15] || (U[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: U[2] || (U[2] = (Y) => d(-(i.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, hC),
            p("button", {
              title: "10 ms earlier",
              onClick: U[3] || (U[3] = (Y) => d(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, P(h.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: U[4] || (U[4] = (Y) => d(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: U[5] || (U[5] = (Y) => d(i.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, dC),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: U[6] || (U[6] = (Y) => u.value = 0)
            }, "reset", 8, fC)
          ])) : G("", !0)
        ]),
        A.value ? (w(), S("span", pC, P(A.value), 1)) : G("", !0)
      ])) : G("", !0),
      p("label", {
        title: i.loopRange ? `Play to the end of the selection (${i.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        Ae(p("input", {
          "onUpdate:modelValue": U[7] || (U[7] = (Y) => L.value = Y),
          type: "checkbox"
        }, null, 512), [
          [Rt, L.value]
        ]),
        oe(" loop " + P(i.loopRange ? i.loopRange.label : "section"), 1)
      ], 8, mC),
      p("label", gC, [
        Ae(p("input", {
          "onUpdate:modelValue": U[8] || (U[8] = (Y) => r.value = Y),
          type: "checkbox"
        }, null, 512), [
          [Rt, r.value]
        ]),
        U[16] || (U[16] = oe(" metronome", -1))
      ]),
      p("span", vC, [
        p("label", null, [
          Ae(p("input", {
            "onUpdate:modelValue": U[9] || (U[9] = (Y) => s.value.Vocal = Y),
            type: "checkbox"
          }, null, 512), [
            [Rt, s.value.Vocal]
          ]),
          U[17] || (U[17] = oe(" Vocal", -1))
        ]),
        p("label", null, [
          Ae(p("input", {
            "onUpdate:modelValue": U[10] || (U[10] = (Y) => s.value.Ins = Y),
            type: "checkbox"
          }, null, 512), [
            [Rt, s.value.Ins]
          ]),
          U[18] || (U[18] = oe(" Ins", -1))
        ]),
        p("label", null, [
          Ae(p("input", {
            "onUpdate:modelValue": U[11] || (U[11] = (Y) => s.value.chords = Y),
            type: "checkbox"
          }, null, 512), [
            [Rt, s.value.chords]
          ]),
          U[19] || (U[19] = oe(" chords", -1))
        ]),
        i.guide?.length ? (w(), S("label", yC, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: U[12] || (U[12] = (Y) => s.value = { ...s.value, guide: Y.target.checked })
          }, null, 40, bC),
          U[20] || (U[20] = oe(" Guide ", -1))
        ])) : G("", !0)
      ]),
      p("label", kC, [
        U[22] || (U[22] = oe(" speed ", -1)),
        Ae(p("select", {
          "onUpdate:modelValue": U[13] || (U[13] = (Y) => o.value = Y),
          "aria-label": "Playback speed"
        }, [...U[21] || (U[21] = [
          p("option", { value: 0.5 }, "50 %", -1),
          p("option", { value: 0.75 }, "75 %", -1),
          p("option", { value: 1 }, "100 %", -1),
          p("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            ri,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      p("span", wC, P(k.value ? `▶ ${O(zo)(H.value)}` : `${i.position ? `cursor ${i.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      V.value ? (w(), S("span", xC, P(V.value), 1)) : G("", !0)
    ]));
  }
}), CC = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, MC = { class: "track-name" }, AC = { class: "count" }, TC = ["value", "aria-label", "title", "onChange"], $C = ["value", "title"], DC = ["title"], LC = ["checked", "aria-label", "onChange"], BC = ["aria-label"], OC = ["disabled", "title", "onClick"], EC = ["disabled", "title", "onClick"], RC = {
  key: 0,
  class: "hint"
}, IC = {
  key: 1,
  class: "hint"
}, PC = /* @__PURE__ */ Ct({
  __name: "TrackPanel",
  props: /* @__PURE__ */ Qt({
    view: {},
    guideCount: {},
    keepsGuide: { type: Boolean },
    readonly: { type: Boolean },
    guideActive: { type: Boolean }
  }, {
    voices: { required: !0 },
    voicesModifiers: {},
    sounds: {},
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["clearGuide", "shiftTrack"], ["update:voices", "update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = lt(i, "voices"), s = lt(i, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(d, h) {
      const f = o[d];
      s.value && f && (s.value = { ...s.value, [f]: h });
    }
    const l = e, a = E(
      () => pm(t.view, t.guideCount).filter((d) => t.keepsGuide || d.voice !== "guide")
    );
    function u(d) {
      return d === "guide" ? n.value.guide !== !1 : n.value[d] !== !1;
    }
    function c(d, h) {
      d === "guide" ? n.value = { ...n.value, guide: h } : n.value = { ...n.value, [d]: h };
    }
    return (d, h) => (w(), S("div", CC, [
      h[2] || (h[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (w(!0), S(ae, null, ge(a.value, (f) => (w(), S("li", {
          key: f.voice,
          class: Ie({ guide: f.voice === "guide", active: f.voice === "guide" && i.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: Qi({ background: f.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", MC, P(f.name), 1),
          p("span", {
            class: Ie(["destination", { unsent: !f.sent }])
          }, P(f.destination), 3),
          p("span", AC, P(O(fm)(f.notes)), 1),
          s.value && o[f.voice] ? (w(), S("select", {
            key: 0,
            class: "sound",
            value: s.value[o[f.voice]],
            "aria-label": `Sound of the ${f.name} track`,
            title: `The ${f.name} track’s sound in the playback`,
            onChange: (m) => r(f.voice, m.target.value)
          }, [
            (w(!0), S(ae, null, ge(O(ih), (m) => (w(), S("option", {
              key: m,
              value: m,
              title: O(Yo)[m].hint
            }, P(O(Yo)[m].label), 9, $C))), 128))
          ], 40, TC)) : G("", !0),
          p("label", {
            class: "play",
            title: `Play the ${f.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(f.voice),
              "aria-label": `Play the ${f.name} track`,
              onChange: (m) => c(f.voice, m.target.checked)
            }, null, 40, LC)
          ], 8, DC),
          O(Jn)[f.voice] && !i.readonly ? (w(), S("span", {
            key: 1,
            class: "octave",
            role: "group",
            "aria-label": `${f.name} track octave`
          }, [
            p("button", {
              class: "shift",
              disabled: !!O(Ds)(i.view, O(Jn)[f.voice].track, -12),
              title: O(Ds)(i.view, O(Jn)[f.voice].track, -12) ?? `Every ${f.name} note an octave down`,
              onClick: (m) => l("shiftTrack", O(Jn)[f.voice].track, -12)
            }, " −8va ", 8, OC),
            p("button", {
              class: "shift",
              disabled: !!O(Ds)(i.view, O(Jn)[f.voice].track, 12),
              title: O(Ds)(i.view, O(Jn)[f.voice].track, 12) ?? `Every ${f.name} note an octave up`,
              onClick: (m) => l("shiftTrack", O(Jn)[f.voice].track, 12)
            }, " +8va ", 8, EC)
          ], 8, BC)) : G("", !0),
          f.voice === "guide" && f.notes > 0 && !i.readonly ? (w(), S("button", {
            key: 2,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: h[0] || (h[0] = (m) => l("clearGuide"))
          }, " clear ")) : G("", !0)
        ], 2))), 128))
      ]),
      i.keepsGuide ? (w(), S("p", RC, [...h[1] || (h[1] = [
        oe(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        oe(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (w(), S("p", IC, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), NC = /^\[([^[\]\n]{1,40})\]$/;
function no(i) {
  const e = [], t = [];
  let n = null;
  for (const s of i.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = NC.exec(o);
    r ? (n = { tag: r[1].trim(), lines: [] }, t.push(n)) : o && (n ? n.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function vr(i) {
  return i.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function Ka(i, e) {
  return e && vr(e.tag) === vr(i) ? e.tag : i.replace(/(^|[\s-])(\p{L})/gu, (t, n, s) => n + s.toUpperCase());
}
function yr(i) {
  return i.sections.map((e) => i.measures[e.first_bar - 1]?.onset ?? 0);
}
function Io(i, e) {
  if (!i?.trim() || !e) return null;
  const t = no(i), n = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== n.length || n.some((o, r) => vr(o.label) !== vr(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function VC(i, e) {
  const t = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return e.sections.forEach((n, s) => {
    if (n.implicit) return;
    const o = i.blocks[s] ?? null;
    t.push([`[${Ka(n.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function Pf(i, e) {
  return e?.length ? e : [[0, i.total, 0]];
}
function Nf(i, e, t) {
  const n = Pf(i, t), s = yr(i), o = (u) => {
    let c = -1;
    return s.forEach((d, h) => {
      d <= u && (c = h);
    }), c;
  }, r = (u) => {
    for (const [c, d, h] of n)
      if (u >= h && u < h + d - c) return c + u - h;
    return null;
  }, l = [], a = [];
  return yr(e).forEach((u, c) => {
    const d = r(u), h = d === null ? -1 : o(d);
    a.push(h), l.push(h >= 0 && d !== null && (d === s[h] || a[c - 1] !== h) ? h : -1);
  }), l;
}
function HC(i, e, t, n, s = () => null) {
  const o = Pf(e, n), r = yr(e), l = yr(t), a = (f) => {
    for (const [m, k, b] of o)
      if (f >= b && f < b + k - m) return m + f - b;
    return null;
  }, u = (f) => f ? { tag: f.tag, lines: [...f.lines] } : null, c = Nf(e, t, n), d = new Set(c.filter((f) => f >= 0)), h = l.map((f, m) => a(f) === null ? s(f) : c[m] >= 0 ? u(i.blocks[c[m]] ?? null) : null);
  return r.forEach((f, m) => {
    const k = i.blocks[m]?.lines;
    if (!(d.has(m) || !k?.length))
      for (const [b, M, $] of o) {
        if (f < b || f >= M) continue;
        const L = $ + f - b;
        let H = -1;
        l.forEach((W, I) => {
          W <= L && (H = I);
        });
        const V = H >= 0 && l[H] !== L ? h[H] : null;
        V && (h[H] = { tag: V.tag, lines: [...V.lines, ...k] });
      }
  }), { preamble: i.preamble, blocks: h };
}
function Vf(i, e, t) {
  const n = [...i], s = t.trim();
  return e >= n.length ? s && n.push(s) : s ? n[e] = s : n.splice(e, 1), n;
}
function zC(i, e, t, n) {
  const s = no(i);
  if (!s.blocks[e]) return i;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Vf(a.lines, t, n) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function WC(i, e, t, n, s) {
  const o = e.sections[t]?.label ?? "", r = i.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Ka(o, null), lines: [] };
    return { tag: u.tag, lines: Vf(u.lines, n, s) };
  });
  return { preamble: i.preamble, blocks: r };
}
function FC(i, e, t) {
  const n = no(i);
  if (!n.blocks[e]) return i;
  const s = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return n.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function _C(i, e, t, n) {
  const s = e.sections[t]?.label ?? "", o = i.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Ka(s, null) }).tag, lines: [...n] } : r
  );
  return { preamble: i.preamble, blocks: o };
}
const KC = 2, UC = 0.5, GC = 32;
function Xc(i, e, t, n) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= n) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, n) - l}.${o.pitch}`);
  }
  return `${i}:${s.join(",")}`;
}
function jC(i) {
  return i.measures.map((e) => [
    Xc(e.meter, i.tracks.vocal, e.onset, e.onset + e.length),
    Xc(e.meter, i.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function qC(i, e) {
  let t = 0;
  for (let n = 0; n < 2; n++) i[n] === e[n] && (t += i[n].endsWith(":") ? UC : KC);
  return t;
}
function YC(i, e) {
  const t = i.map((l) => e.map((a) => qC(l, a))), n = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < GC && l + u < i.length && a + u < e.length && !(n[l + u] <= 0 || t[l + u][a + u] !== n[l + u]); )
      u++;
    return u;
  }, o = [];
  let r = -1;
  for (let l = 0; l < i.length; l++) {
    const a = r + 1;
    let u;
    if (n[l] > 0) {
      const c = t[l].flatMap((f, m) => f === n[l] ? [m] : []), d = new Map(c.map((f) => [f, s(l, f)])), h = Math.max(...d.values());
      c.includes(a) && (d.get(a) ?? 0) >= h ? u = a : u = [...c].sort(
        (f, m) => (d.get(m) ?? 0) - (d.get(f) ?? 0) || Math.abs(f - a) - Math.abs(m - a) || f - m
      )[0];
    } else u = a < e.length ? a : null;
    o.push(u), u !== null && (r = u);
  }
  return o;
}
function XC(i, e) {
  if (e?.bars?.length)
    return !i || !e.bar_prints?.length ? i ? i.measures.map((t, n) => e.bars[n] ?? null) : e.bars : YC(jC(i), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const JC = "1.5.0";
function ZC(i) {
  return {
    sounds: { ...i.sounds },
    metronome: i.metronome,
    hear: i.hear,
    sourceLevel: i.sourceLevel,
    wave: i.wave,
    sung: i.sung,
    record: { ...i.record },
    paper: i.paper,
    notationSize: i.notationSize
  };
}
function Jc(i, e) {
  return {
    ...i,
    ...e,
    sounds: { ...i.sounds, ...e.sounds ?? {} },
    record: { ...i.record, ...e.record ?? {} }
  };
}
function Ua(i) {
  if (typeof i != "object" || i === null) return {};
  const e = i, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const n = e.sounds;
    Object.values(n).some(Cp) && (t.sounds = Mp(n));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = Ap(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), Tp(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const Sn = (i, e, t, n) => ({ Vocal: i, Ins: e, chord: t, guide: n }), Po = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: Sn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: Sn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: Sn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: Sn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: Sn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: Sn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: Sn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: Sn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: Sn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...Sp(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: Sn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], QC = "plenio/score-editor-presets.json", e2 = "plenio.score_presets/1", Hf = "plenio.score-editor.presets";
function zf(i) {
  const e = typeof i == "object" && i !== null ? i : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), n.push({ name: r, builtIn: !1, settings: Ua(o.settings) }));
  }
  return n;
}
function Wf(i) {
  return JSON.stringify({ schema: e2, presets: i.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function t2() {
  try {
    return zf(JSON.parse(window.localStorage.getItem(Hf) ?? "{}"));
  } catch {
    return [];
  }
}
function n2(i) {
  try {
    return window.localStorage.setItem(Hf, Wf(i)), !0;
  } catch {
    return !1;
  }
}
const Ff = `/userdata/${encodeURIComponent(QC)}`;
async function i2(i) {
  if (i)
    try {
      const e = await i.fetchApi(Ff, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: zf(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: t2(), where: "browser" };
}
async function Zc(i, e) {
  const t = e.filter((n) => !n.builtIn);
  if (i)
    try {
      if ((await i.fetchApi(`${Ff}?overwrite=true`, { method: "POST", body: Wf(t) })).ok) return "comfyui";
    } catch {
    }
  return n2(t) ? "browser" : "failed";
}
function s2(i, e) {
  return [...i.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, n) => t.name.localeCompare(n.name));
}
const qo = "plenio.score_project/1", _f = ".plenio.json";
function Qc(i, e = /* @__PURE__ */ new Date()) {
  return {
    schema: qo,
    app: `Plenio Music Production System ${JC}`,
    saved: e.toISOString(),
    title: (i.title ?? "").trim(),
    score: i.score,
    guide: (i.guide ?? []).map(([t, n, s]) => [t, n, s]),
    lyrics: i.lyrics?.trim() ? i.lyrics : null,
    lyric_spans: i.lyrics?.trim() ? ha(i.lyricSpans ?? []) : [],
    settings: i.settings ? Ua(i.settings) : {}
  };
}
function o2(i) {
  return `${Array.from((i ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${_f}`;
}
function r2(i) {
  let e;
  try {
    e = JSON.parse(i);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== qo ? `This file is not a Plenio score project (${qo}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: qo,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: mm(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: ha(t.lyric_spans),
    settings: Ua(t.settings)
  };
}
const l2 = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, a2 = ["disabled", "title"], u2 = ["disabled", "title"], c2 = ["title"], h2 = { class: "midi-settings" }, d2 = ["aria-expanded"], f2 = ["onKeydown"], p2 = { class: "facts" }, m2 = { key: 0 }, g2 = ["value"], v2 = ["value"], y2 = ["value"], b2 = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, k2 = ["checked"], w2 = ["value"], x2 = { title: "Where the take's starts and ends go" }, S2 = ["value"], C2 = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, M2 = ["value"], A2 = { title: "Silence the old notes of the recorded voice while recording" }, T2 = ["checked"], $2 = ["value"], D2 = /* @__PURE__ */ Ct({
  __name: "RecordControls",
  props: /* @__PURE__ */ Qt({
    hub: {},
    recording: { type: Boolean },
    countingIn: { type: Boolean },
    step: { type: Boolean },
    target: {},
    disabled: {}
  }, {
    settings: { required: !0 },
    settingsModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(i, { emit: e }) {
    const t = i, n = lt(i, "settings"), s = e, o = _(!1), r = _(null);
    function l() {
      o.value = !1, Xt(() => r.value?.focus());
    }
    const a = _(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    Un(() => clearInterval(u));
    const c = E(() => {
      const k = t.hub.selected.value;
      if (k === "all") return null;
      const b = t.hub.devices.value.find((M) => M.id === k);
      return b?.connected ? null : b?.name ?? "the chosen keyboard";
    }), d = E(() => a.value - t.hub.activity.value < 250), h = E(() => {
      const k = t.hub;
      if (k.status.value === "ready") {
        const b = k.devices.value.filter((M) => M.connected);
        return b.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${b.length} keyboard${b.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return k.status.value === "asking" ? "asking for MIDI access…" : k.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : k.problem.value ?? "MIDI is not available";
    }), f = E(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${n.value.countIn ? `, after ${n.value.countIn} bar${n.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function m(k, b) {
      n.value = { ...n.value, [k]: b };
    }
    return (k, b) => (w(), S("span", l2, [
      p("button", {
        class: Ie(["rec", { on: i.recording, counting: i.countingIn }]),
        disabled: !!i.disabled && !i.recording,
        title: f.value,
        onClick: b[0] || (b[0] = (M) => i.recording ? s("stop") : s("record"))
      }, " ● " + P(i.recording && i.countingIn ? "count-in" : "rec"), 11, a2),
      p("button", {
        class: Ie(["step", { on: i.step }]),
        disabled: !!i.disabled || i.recording,
        title: i.disabled ?? (i.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${i.target}: every key writes a note of the step length at the cursor`),
        onClick: b[1] || (b[1] = (M) => s("step"))
      }, " step ", 10, u2),
      i.step ? (w(), S("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: b[2] || (b[2] = (M) => s("rest"))
      }, "rest ▶")) : G("", !0),
      p("span", {
        class: Ie(["midi-light", { active: d.value, ready: i.hub.status.value === "ready" }]),
        title: h.value,
        "aria-hidden": "true"
      }, null, 10, c2),
      p("span", h2, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: b[3] || (b[3] = (M) => o.value ? l() : o.value = !0)
        }, "🎹", 8, d2),
        o.value ? (w(), S("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: nt(Fe(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          b[24] || (b[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", p2, P(h.value), 1),
          i.hub.status.value === "ready" ? (w(), S("label", m2, [
            b[13] || (b[13] = oe(" keyboard ", -1)),
            p("select", {
              value: i.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: b[4] || (b[4] = (M) => i.hub.selected.value = M.target.value)
            }, [
              b[12] || (b[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (w(!0), S(ae, null, ge(i.hub.devices.value.filter((M) => M.connected), (M) => (w(), S("option", {
                key: M.id,
                value: M.id
              }, P(M.name), 9, v2))), 128)),
              c.value ? (w(), S("option", {
                key: 0,
                value: i.hub.selected.value,
                disabled: ""
              }, P(c.value) + " (unplugged)", 9, y2)) : G("", !0)
            ], 40, g2)
          ])) : i.hub.status.value !== "asking" ? (w(), S("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: b[5] || (b[5] = (M) => s("enable"))
          }, "use MIDI")) : G("", !0),
          p("label", b2, [
            p("input", {
              checked: n.value.thru,
              type: "checkbox",
              onChange: b[6] || (b[6] = (M) => m("thru", M.target.checked))
            }, null, 40, k2),
            b[14] || (b[14] = oe(" hear the keys ", -1))
          ]),
          p("strong", null, "Recording into " + P(i.target), 1),
          b[25] || (b[25] = p("span", { class: "facts" }, [
            oe("The voice is the roll's "),
            p("em", null, "draw into"),
            oe("; the take starts at the cursor.")
          ], -1)),
          p("label", null, [
            b[16] || (b[16] = oe(" count-in ", -1)),
            p("select", {
              value: n.value.countIn,
              "aria-label": "Count-in",
              onChange: b[7] || (b[7] = (M) => m("countIn", Number(M.target.value)))
            }, [...b[15] || (b[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, w2)
          ]),
          p("label", x2, [
            b[18] || (b[18] = oe(" quantize ", -1)),
            p("select", {
              value: n.value.quantize,
              "aria-label": "Quantize the take",
              onChange: b[8] || (b[8] = (M) => m("quantize", Number(M.target.value)))
            }, [...b[17] || (b[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, S2)
          ]),
          p("label", C2, [
            b[20] || (b[20] = oe(" mode ", -1)),
            p("select", {
              value: n.value.mode,
              "aria-label": "Replace or merge",
              onChange: b[9] || (b[9] = (M) => m("mode", M.target.value))
            }, [...b[19] || (b[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, M2)
          ]),
          p("label", A2, [
            p("input", {
              checked: n.value.mute,
              type: "checkbox",
              onChange: b[10] || (b[10] = (M) => m("mute", M.target.checked))
            }, null, 40, T2),
            b[21] || (b[21] = oe(" mute its old notes ", -1))
          ]),
          b[26] || (b[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            b[23] || (b[23] = oe(" step ", -1)),
            p("select", {
              value: n.value.stepLength,
              "aria-label": "Step length",
              onChange: b[11] || (b[11] = (M) => m("stepLength", Number(M.target.value)))
            }, [...b[22] || (b[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, $2)
          ])
        ], 40, f2)) : G("", !0)
      ])
    ]));
  }
}), L2 = { class: "notation-export" }, B2 = ["disabled", "aria-expanded", "title"], O2 = ["onKeydown"], E2 = { title: "The paper of the PDF and the print" }, R2 = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, I2 = { class: "formats" }, P2 = ["disabled"], N2 = ["disabled"], V2 = ["disabled"], H2 = ["disabled"], z2 = { class: "facts" }, W2 = /* @__PURE__ */ Ct({
  __name: "NotationExport",
  props: /* @__PURE__ */ Qt({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {},
    size: { required: !0 },
    sizeModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["done", "failed"], ["update:paper", "update:size"]),
  setup(i, { emit: e }) {
    const t = i, n = lt(i, "paper"), s = lt(i, "size"), o = e, r = _(!1), l = _(!1), a = _(null);
    function u() {
      r.value = !1, Xt(() => a.value?.focus());
    }
    async function c(d) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((f) => setTimeout(f, 20));
      let h = null;
      try {
        h = Zp(t.abc, t.title, n.value, s.value);
        const { lines: f } = h;
        if (!f.length) throw new Error("the score has no music to draw");
        const m = n.value === "a4" ? "A4" : "Letter";
        if (d === "pdf") {
          const k = await Qp(f, n.value, t.title);
          ss(_r(t.title, "pdf"), k, "application/pdf"), o("done", `exported the notation as PDF (${m})`);
        } else d === "png" ? (ss(_r(t.title, "png"), await em(f), "image/png"), o("done", "exported the notation as PNG")) : d === "svg" ? (ss(_r(t.title, "svg"), new TextEncoder().encode(tm(f)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (nm(f, n.value, t.title), o("done", `printing the notation (${m}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (f) {
        o("failed", `The notation could not be exported: ${f instanceof Error ? f.message : String(f)}`);
      } finally {
        h?.dispose(), l.value = !1;
      }
    }
    return (d, h) => (w(), S("span", L2, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !i.abc,
        "aria-expanded": r.value,
        title: i.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (f) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, B2),
      r.value ? (w(), S("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: nt(Fe(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", E2, [
          h[8] || (h[8] = oe(" paper ", -1)),
          Ae(p("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (f) => n.value = f),
            "aria-label": "Paper"
          }, [...h[7] || (h[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [ri, n.value]
          ])
        ]),
        p("label", R2, [
          h[10] || (h[10] = oe(" size ", -1)),
          Ae(p("select", {
            "onUpdate:modelValue": h[2] || (h[2] = (f) => s.value = f),
            "aria-label": "Notation size"
          }, [...h[9] || (h[9] = [
            p("option", { value: "large" }, "large", -1),
            p("option", { value: "standard" }, "standard", -1),
            p("option", { value: "smaller" }, "smaller", -1),
            p("option", { value: "compact" }, "compact", -1)
          ])], 512), [
            [ri, s.value]
          ])
        ]),
        p("span", I2, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[3] || (h[3] = (f) => c("pdf"))
          }, "PDF", 8, P2),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: h[4] || (h[4] = (f) => c("png"))
          }, "PNG", 8, N2),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[5] || (h[5] = (f) => c("svg"))
          }, "SVG", 8, V2),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[6] || (h[6] = (f) => c("print"))
          }, "Print…", 8, H2)
        ]),
        p("span", z2, P(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, O2)) : G("", !0)
    ]));
  }
}), F2 = { class: "sounds-settings" }, _2 = ["aria-expanded"], K2 = ["onKeydown"], U2 = { class: "row" }, G2 = { label: "Built in" }, j2 = ["value", "title"], q2 = {
  key: 0,
  label: "Yours"
}, Y2 = ["value"], X2 = ["disabled"], J2 = {
  key: 0,
  class: "facts"
}, Z2 = { class: "row" }, Q2 = ["onKeydown"], eM = ["disabled"], tM = {
  key: 1,
  class: "facts",
  role: "status"
}, nM = {
  key: 2,
  class: "facts"
}, iM = { class: "track" }, sM = ["value", "aria-label", "onChange"], oM = ["value", "title"], rM = ["title", "aria-label", "onClick"], lM = /* @__PURE__ */ Ct({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ Qt({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Qt(["apply"], ["update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = lt(i, "sounds"), s = e, o = _(!1), r = _(null), l = _([]), a = _(null), u = _(!1), c = _(""), d = _(!1), h = _(""), f = _(null), m = E(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([I]) => I !== "guide" || t.keepsGuide)
    ), k = E(() => l.value.find((I) => I.name === c.value) ?? null);
    async function b() {
      if (o.value = !0, u.value) return;
      const I = await i2(t.fetcher);
      l.value = I.presets, a.value = I.where, u.value = !0;
    }
    function M() {
      o.value = !1, d.value = !1, Xt(() => r.value?.focus());
    }
    function $() {
      const I = [...Po, ...l.value].find((K) => K.name === c.value);
      I && (s("apply", I.settings, I.name), f.value = `“${I.name}” is set.`);
    }
    async function L() {
      const I = h.value.trim().slice(0, 60);
      if (!I) return;
      if (Po.some((z) => z.name.toLowerCase() === I.toLowerCase())) {
        f.value = `“${I}” is a built-in preset - choose another name.`;
        return;
      }
      const K = s2(l.value, { name: I, builtIn: !1, settings: structuredClone(t.settings) }), R = await Zc(t.fetcher, K);
      if (R === "failed") {
        f.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = K, a.value = R, c.value = I, d.value = !1, h.value = "", f.value = R === "comfyui" ? `Saved “${I}” in ComfyUI’s user data.` : `Saved “${I}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function H() {
      const I = k.value;
      if (!I) return;
      const K = l.value.filter((z) => z !== I);
      if (await Zc(t.fetcher, K) === "failed") {
        f.value = "The preset could not be deleted.";
        return;
      }
      l.value = K, c.value = "", f.value = `Deleted “${I.name}”.`;
    }
    function V(I, K) {
      n.value = { ...n.value, [I]: K };
    }
    function W(I) {
      const K = n.value[I], R = I === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : I === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [z, N, A] of R) setTimeout(() => ca(z, A, K), N * 1e3);
    }
    return (I, K) => (w(), S("span", F2, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: K[0] || (K[0] = (R) => o.value ? M() : b())
      }, "♫ sounds", 8, _2),
      o.value ? (w(), S("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: nt(Fe(M, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: M
        }, "×"),
        K[6] || (K[6] = p("strong", null, "Preset", -1)),
        p("span", U2, [
          Ae(p("select", {
            "onUpdate:modelValue": K[1] || (K[1] = (R) => c.value = R),
            "aria-label": "Preset"
          }, [
            K[5] || (K[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", G2, [
              (w(!0), S(ae, null, ge(O(Po), (R) => (w(), S("option", {
                key: R.name,
                value: R.name,
                title: R.note
              }, P(R.name), 9, j2))), 128))
            ]),
            l.value.length ? (w(), S("optgroup", q2, [
              (w(!0), S(ae, null, ge(l.value, (R) => (w(), S("option", {
                key: "own-" + R.name,
                value: R.name
              }, P(R.name), 9, Y2))), 128))
            ])) : G("", !0)
          ], 512), [
            [ri, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: $
          }, "use", 8, X2),
          k.value ? (w(), S("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: H
          }, "delete")) : G("", !0)
        ]),
        c.value ? (w(), S("span", J2, P([...O(Po), ...l.value].find((R) => R.name === c.value)?.note ?? "Your preset"), 1)) : G("", !0),
        p("span", Z2, [
          d.value ? (w(), S(ae, { key: 0 }, [
            Ae(p("input", {
              "onUpdate:modelValue": K[2] || (K[2] = (R) => h.value = R),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                nt(Fe(L, ["prevent"]), ["enter"]),
                K[3] || (K[3] = nt(Fe((R) => d.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, Q2), [
              [rt, h.value]
            ]),
            p("button", {
              disabled: !h.value.trim(),
              onClick: L
            }, "save", 8, eM)
          ], 64)) : (w(), S("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: K[4] || (K[4] = (R) => d.value = !0)
          }, " save current as preset… "))
        ]),
        f.value ? (w(), S("span", tM, P(f.value), 1)) : a.value === "browser" ? (w(), S("span", nM, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : G("", !0),
        K[7] || (K[7] = p("strong", null, "Sounds", -1)),
        (w(!0), S(ae, null, ge(m.value, ([R, z]) => (w(), S("label", {
          key: R,
          class: "row"
        }, [
          p("span", iM, P(z), 1),
          p("select", {
            value: n.value[R],
            "aria-label": `Sound of the ${z} track`,
            onChange: (N) => V(R, N.target.value)
          }, [
            (w(!0), S(ae, null, ge(O(ih), (N) => (w(), S("option", {
              key: N,
              value: N,
              title: O(Yo)[N].hint
            }, P(O(Yo)[N].label), 9, oM))), 128))
          ], 40, sM),
          p("button", {
            title: `Hear the ${z} track’s sound`,
            "aria-label": `Hear the ${z} sound`,
            onClick: Fe((N) => W(R), ["prevent"])
          }, "▶", 8, rM)
        ]))), 128)),
        K[8] || (K[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, K2)) : G("", !0)
    ]));
  }
});
function aM(i) {
  return i.length >= 3 && (i[0] & 240) === 176 && (i[1] === 120 || i[1] === 123);
}
function uM(i, e, t) {
  if (i.length < 3) return null;
  const n = i[0] & 240, s = i[0] & 15, o = i[1] & 127, r = i[2] & 127;
  return n === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : n === 128 || n === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function cM(i, e) {
  switch (i) {
    case "unsupported":
      return "This browser has no Web MIDI. Use Chrome or Edge (in Firefox: allow MIDI for this site); the ComfyUI desktop app may not offer it.";
    case "insecure":
      return "The browser offers MIDI only to a secure page: open ComfyUI at http://127.0.0.1 or localhost (or over https), not by the computer’s network address.";
    case "denied":
      return "MIDI access was refused. Allow it in the browser’s site settings (the icon left of the address), then press rec again.";
    case "failed":
      return `MIDI could not be opened${e instanceof Error ? `: ${e.message}` : ""}.`;
    default:
      return null;
  }
}
class hM {
  constructor(e = typeof navigator > "u" ? null : navigator) {
    this.navigatorLike = e;
  }
  navigatorLike;
  status = _("off");
  problem = _(null);
  devices = _([]);
  /** The last note's time (``performance.now()`` ms): the activity light. */
  activity = _(0);
  /** ``'all'`` or an input's id (kept while that keyboard is unplugged: then every one is listened to). */
  selected = _("all");
  listeners = /* @__PURE__ */ new Set();
  /** The keys held on each input that the listeners heard go down (note -> channel) - let go when the
   * keyboard is unplugged or sends *all notes off*. */
  held = /* @__PURE__ */ new Map();
  access = null;
  pending = null;
  /** Ask for MIDI access (once; again after a refusal). ``true`` when inputs can be read. */
  enable() {
    if (this.status.value === "ready") return Promise.resolve(!0);
    if (this.pending) return this.pending;
    const e = this.navigatorLike?.requestMIDIAccess;
    return e ? (this.status.value = "asking", this.problem.value = null, this.pending = e.call(this.navigatorLike, { sysex: !1 }).then((t) => (this.access = t, this.access.onstatechange = () => this.refresh(), this.refresh(), this.status.value = "ready", !0)).catch((t) => {
      const n = t?.name;
      return this.fail(n === "SecurityError" || n === "NotAllowedError" ? "denied" : "failed", t), !1;
    }).finally(() => {
      this.pending = null;
    }), this.pending) : (this.fail(typeof window < "u" && window.isSecureContext === !1 ? "insecure" : "unsupported"), Promise.resolve(!1));
  }
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  /** The inputs as they are now; every connected one is listened to (a keyboard plugged in later too). */
  refresh() {
    const e = [];
    this.access?.inputs.forEach((t) => {
      const n = t.state !== "disconnected";
      e.push({ id: t.id, name: [t.manufacturer, t.name].filter(Boolean).join(" ") || t.id, connected: n }), t.onmidimessage = n ? (s) => this.receive(t.id, s) : null, n || this.letGo(t.id);
    }), this.devices.value = e;
  }
  /** The keyboard listened to: the chosen one, or every one while it is unplugged. */
  get listening() {
    const e = this.selected.value;
    return e !== "all" && this.devices.value.some((t) => t.id === e && t.connected) ? e : "all";
  }
  receive(e, t) {
    const n = typeof t.timeStamp == "number" && t.timeStamp > 0 ? t.timeStamp : performance.now();
    if (aM(t.data)) {
      this.letGo(e, n);
      return;
    }
    const s = uM(t.data, n, e);
    if (!s) return;
    const o = this.held.get(e) ?? /* @__PURE__ */ new Map();
    if (this.held.set(e, o), s.kind === "off") {
      o.delete(s.note) && this.emit(s);
      return;
    }
    const r = this.listening;
    r !== "all" && r !== e || (o.set(s.note, s.channel), this.activity.value = performance.now(), this.emit(s));
  }
  /** Every key held on ``input`` goes up (a note-off for each). */
  letGo(e, t = performance.now()) {
    const n = this.held.get(e);
    if (n?.size) {
      this.held.delete(e);
      for (const [s, o] of n) this.emit({ kind: "off", note: s, velocity: 0, time: t, input: e, channel: o });
    }
  }
  emit(e) {
    for (const t of [...this.listeners])
      try {
        t(e);
      } catch (n) {
        console.error("Plenio: a MIDI listener failed", n);
      }
  }
  fail(e, t) {
    this.status.value = e, this.problem.value = cM(e, t);
  }
}
let eh = null;
function dM() {
  return eh ??= new hM(), eh;
}
const fM = 0.035;
class pM {
  constructor(e, t) {
    this.start = e, this.track = t;
  }
  start;
  track;
  held = /* @__PURE__ */ new Map();
  done = [];
  noteOn(e, t) {
    const n = this.held.get(e);
    n && this.close(n, t), this.held.set(e, { pitch: e, start: t, end: null });
  }
  noteOff(e, t) {
    const n = this.held.get(e);
    n && this.close(n, t);
  }
  /** Everything played so far; keys still held end at ``now`` (the live picture). */
  played(e) {
    return [...this.done, ...[...this.held.values()].map((t) => ({ ...t, end: e }))];
  }
  /** The take at the stop: keys still held end there. */
  finish(e) {
    for (const t of [...this.held.values()]) this.close(t, e);
    return [...this.done];
  }
  get count() {
    return this.done.length + this.held.size;
  }
  close(e, t) {
    this.held.delete(e.pitch), this.done.push({ ...e, end: Math.max(t, e.start) });
  }
}
function mM(i, e) {
  const { start: t, stop: n, total: s, chordUnits: o, pickup: r } = e, l = Math.max(1, Math.round(e.grid) || 1), a = i.filter((d) => d.start >= t - r && d.start < n).map((d) => ({ pitch: d.pitch, start: Math.max(t, d.start), end: Math.min(n, Math.max(d.end ?? n, d.start)) })).sort((d, h) => d.start - h.start || h.pitch - d.pitch), u = [];
  for (const d of a) {
    const h = u.at(-1);
    if (h && d.start - h.start <= o) {
      d.pitch > h.pitch ? u[u.length - 1] = { ...d, start: h.start, end: Math.max(d.end, h.end) } : h.end = Math.max(h.end, d.end);
      continue;
    }
    u.push({ ...d });
  }
  const c = [];
  for (const [d, h] of u.entries()) {
    let f = Math.round((h.start - t) / l) * l + t, m = Math.round((h.end - t) / l) * l + t;
    m <= f && (m = f + l);
    const k = u[d + 1];
    if (k) {
      const M = Math.round((k.start - t) / l) * l + t;
      M > f && (m = Math.min(m, M));
    }
    f = Math.max(0, Math.min(f, s - 1)), m = Math.min(m, s);
    const b = c.at(-1);
    if (b && f <= b.onset) {
      m - f > b.duration && (c[c.length - 1] = { onset: b.onset, duration: m - b.onset, pitch: h.pitch });
      continue;
    }
    b && b.onset + b.duration > f && (b.duration = f - b.onset), b && f - (b.onset + b.duration) <= l && (b.duration = f - b.onset), m > f && c.push({ onset: f, duration: m - f, pitch: h.pitch });
  }
  return c;
}
function gM(i, e, t, n, s) {
  return {
    op: "place_notes",
    track: i,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(n), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function ml(i, e) {
  if (!e) return 1;
  const t = Number(i.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const vM = 40;
function yM(i) {
  const e = _(!1), t = _(!1), n = Zi(null), s = _(0), o = new xw();
  let r = !1, l = null, a = null;
  const u = _(0), c = E(() => {
    const R = n.value;
    return !R || !e.value ? [] : (u.value, R.played(s.value).filter((z) => z.end !== null && z.end > z.start).map((z) => ({ onset: z.start, duration: z.end - z.start, pitch: z.pitch })));
  });
  function d() {
    l ??= i.hub.subscribe(L);
  }
  async function h() {
    const R = await i.hub.enable();
    return i.problem(R ? null : i.hub.problem.value), R && d(), R;
  }
  function f(R) {
    const z = i.view();
    return z ? _a(z, Math.max(0, R)) : null;
  }
  async function m() {
    if (e.value) return;
    if (i.readonly()) {
      i.problem("This score belongs to the other sheet; record in that sheet.");
      return;
    }
    const R = i.view();
    if (!R?.model || !await h()) return;
    t.value = !1;
    const z = i.settings(), N = i.track(), A = Math.min(i.locator.value, R.model.total - 1), F = i.transport();
    if (!F) return;
    if (n.value = new pM(A, N), r = !1, e.value = !0, s.value = A, !F.record(Fa(R, A), {
      countIn: z.countIn,
      mute: z.mute ? N === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, n.value = null, i.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    i.notify(`recording into ${N === "vocal" ? "Vocal" : "Ins"} from bar ${kM(R, A)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function k() {
    i.transport()?.stop();
  }
  function b() {
    e.value && (r = !0, i.transport()?.stop());
  }
  function M(R) {
    if (!e.value || R === null) return;
    const z = f(R);
    z !== null && (s.value = z);
  }
  async function $() {
    if (!e.value) return;
    const R = n.value, z = i.view();
    e.value = !1, n.value = null, o.allOff();
    const N = z?.model;
    if (!R || !N) return;
    if (r) {
      i.notify("recording thrown away");
      return;
    }
    const A = Math.max(s.value, R.start), F = N.measures.find(($e) => $e.onset <= R.start && R.start < $e.onset + $e.length) ?? N.measures[0], fe = z.bars[(F?.n ?? 1) - 1], pe = F && fe?.duration_s ? F.length / fe.duration_s : 8, te = Number(F?.meter.split("/")[0]) || 4, ie = mM(R.finish(A), {
      start: R.start,
      stop: A,
      total: N.total,
      grid: ml(N.unit, i.settings().quantize),
      chordUnits: fM * pe,
      pickup: (F?.length ?? 16) / te / 2
    });
    if (!ie.length) {
      i.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await i.operate(gM(R.track, ie, R.start, A, i.settings().mode));
  }
  function L(R) {
    if (i.settings().thru && (i.sound && (o.sound = i.sound()), R.kind === "on" ? o.on(R.note, R.velocity) : o.off(R.note)), e.value && n.value) {
      const N = i.transport()?.scoreSecondAt(R.time) ?? null, A = i.view();
      if (N === null || !A) return;
      const F = bM(A, n.value.start, N);
      if (F === null) return;
      R.kind === "on" ? n.value.noteOn(R.note, F) : n.value.noteOff(R.note, F), u.value++;
      return;
    }
    t.value && R.kind === "on" && H(R.note);
  }
  function H(R) {
    if (a) {
      a.pitches.push(R);
      return;
    }
    a = { pitches: [R], timer: setTimeout(() => {
      V();
    }, vM) };
  }
  async function V() {
    const R = a?.pitches ?? [];
    a = null;
    const N = i.view()?.model;
    if (!N || !R.length || i.readonly()) return;
    const A = ml(N.unit, i.settings().stepLength), F = i.locator.value;
    if (F >= N.total) {
      i.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await i.operate({
      op: "place_notes",
      track: i.track(),
      notes: [{ onset: F, duration: Math.min(A, N.total - F), pitch: Math.max(...R) }],
      label: "step"
    }) && (i.locator.value = Math.min(N.total, F + A));
  }
  function W() {
    const R = i.view()?.model;
    R && (i.locator.value = Math.min(R.total, i.locator.value + ml(R.unit, i.settings().stepLength)));
  }
  async function I() {
    if (t.value) {
      t.value = !1;
      return;
    }
    if (i.readonly()) {
      i.problem("This score belongs to the other sheet; enter notes in that sheet.");
      return;
    }
    await h() && (t.value = !0, i.notify(`step input into ${i.track() === "vocal" ? "Vocal" : "Ins"}: a key writes a note at the cursor and moves it on`));
  }
  function K() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: m, stop: k, cancel: b, onTime: M, onStopped: $, toggleStep: I, rest: W, ready: h, dispose: K };
}
function bM(i, e, t) {
  const n = i.model;
  if (!n) return null;
  const s = Fa(i, e);
  if (t >= s) return _a(i, t);
  const o = n.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? n.measures[0], r = i.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function kM(i, e) {
  let t = 1;
  for (const n of i.model?.measures ?? []) n.onset <= e && (t = n.n);
  return t;
}
const wM = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, xM = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, SM = ["aria-checked"], CM = ["aria-checked"], MM = ["aria-checked"], AM = { title: "The piano roll and chord lane above the notation" }, TM = { title: "Show the ABC text under the notation" }, $M = { title: "Zoom of the notation" }, DM = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, LM = ["disabled", "title"], BM = ["disabled", "title"], OM = ["disabled"], EM = ["disabled", "title"], RM = ["disabled", "title"], IM = ["disabled", "title"], PM = ["accept"], NM = {
  key: 1,
  class: "facts"
}, VM = {
  key: 2,
  class: "facts ok"
}, HM = {
  key: 3,
  class: "facts bad"
}, zM = {
  key: 4,
  class: "badge"
}, WM = {
  key: 1,
  class: "gate",
  role: "status"
}, FM = {
  key: 2,
  class: "gate",
  role: "status"
}, _M = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], KM = ["data-layout", "data-text"], UM = { class: "side" }, GM = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, jM = {
  key: 0,
  class: "hint"
}, qM = {
  key: 0,
  class: "hint changed"
}, YM = {
  key: 1,
  class: "hint"
}, XM = {
  key: 2,
  class: "fit-panel"
}, JM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], ZM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], QM = {
  class: "status",
  "aria-live": "polite"
}, eA = {
  key: 5,
  class: "error",
  role: "alert"
}, tA = {
  key: 6,
  class: "error",
  role: "alert"
}, nA = {
  key: 7,
  class: "error",
  role: "alert"
}, iA = {
  key: 9,
  class: "diagnostics"
}, sA = ["data-severity"], oA = ["title", "onClick"], rA = {
  key: 1,
  class: "where"
}, th = /* @__PURE__ */ Ct({
  __name: "ScoreTab",
  props: {
    doc: {},
    fetcher: {},
    payload: {},
    readonly: { type: Boolean },
    layoutDefault: {},
    lyrics: {},
    title: {},
    guide: {},
    lyricSpans: {},
    sourceShift: {},
    lyricsTarget: {},
    lyricsPending: {}
  },
  emits: ["edited", "gate", "guideChange", "lyricsChange", "lyricSpansChange", "sourceShiftChange"],
  setup(i, { emit: e }) {
    const t = i, n = e;
    function s(v) {
      return typeof v == "object" && v !== null && !Array.isArray(v);
    }
    const o = Zi(null), r = _(null), l = _(null);
    function a(v) {
      const x = v.op === "paste" && v.mode === "insert" && Array.isArray(v.sections) ? v.sections : [], B = typeof v.at == "number" ? v.at : 0, Z = ei.value;
      return (re) => {
        let ue = -1;
        x.forEach((ye, we) => {
          ye.onset <= re - B && (ue = we);
        });
        const Ve = ue >= 0 ? Z?.sections[ue]?.lyrics : null;
        return Ve ? { tag: Ve.tag, lines: [...Ve.lines] } : null;
      };
    }
    const u = Xk(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => n("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => At(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (v) => {
        s(v) && (Array.isArray(v.guide) && t.guide !== void 0 && !Ls(v.guide, t.guide) && n("guideChange", [...v.guide]), "lyrics" in v && (o.value = v.lyrics ?? null), "looseLyrics" in v && (r.value = v.looseLyrics ?? null), Array.isArray(v.spans) && Bt(v.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (v, x) => {
        const B = {}, Z = {}, re = t.guide;
        if (re?.length && v.time_map?.length) {
          const We = vm(re, v.time_map);
          Ls(We, re) || (n("guideChange", We), B.guide = [...re], Z.guide = We);
        }
        const ue = At(), Ve = o.value, ye = te.value?.model, we = v.analysis.model;
        let tt = ue.length && v.time_map?.length ? hm(ue, v.time_map) : ue;
        if (tt.length && Ve && ye && we) {
          const We = (on) => on.sections.flatMap((ki, zr) => ki.implicit ? [] : [zr]), sn = we.sections.map((on) => we.measures[on.first_bar - 1]?.onset ?? 0);
          tt = dm(tt, Nf(ye, we, v.time_map), We(ye), We(we), sn);
        }
        if (Ho(tt, ue) || (Bt(tt), B.spans = [...ue], Z.spans = tt), Ve && ye && we) {
          const We = HC(Ve, ye, we, v.time_map, a(x));
          o.value = We, B.lyrics = Ve, Z.lyrics = We;
        }
        return Object.keys(Z).length ? { before: B, after: Z } : void 0;
      }
    });
    Be(
      () => [t.doc.text, u.commitBlock],
      ([v, x]) => {
        t.readonly || n("gate", v, x);
      },
      { immediate: !0 }
    );
    const c = _($p()), d = _(C1(t.layoutDefault, c.value.layout));
    function h(v) {
      d.value = v, c.value = { ...c.value, layout: v };
    }
    const f = _([]), m = _(0), k = _(null), b = _(null), M = _(null), $ = _(null), L = _(null), H = _("vocal"), V = E({
      get: () => c.value.sounds,
      set: (v) => c.value = { ...c.value, sounds: v }
    }), W = E(() => ZC(c.value));
    function I(v, x) {
      c.value = Jc(c.value, v), u.notes = [`${x}: ${K(v)}`];
    }
    function K(v) {
      const x = [];
      return v.sounds && x.push("sounds"), v.metronome !== void 0 && x.push(`metronome ${v.metronome ? "on" : "off"}`), v.hear && x.push(`hear ${v.hear}`), (v.wave !== void 0 || v.sung !== void 0) && x.push("the source view"), v.record && x.push("recording"), v.paper && x.push(`paper ${v.paper === "a4" ? "A4" : "Letter"}`), v.notationSize && x.push(`notation ${v.notationSize}`), x.length ? `${x.join(", ")} set` : "nothing to set";
    }
    const R = E(() => c.value.sounds[H.value === "vocal" ? "Vocal" : "Ins"]);
    Be(c, (v) => zp(v), { deep: !0 });
    const z = dM();
    z.selected.value = c.value.midiInput, Be(z.selected, (v) => c.value = { ...c.value, midiInput: v });
    const N = E({
      get: () => c.value.record,
      set: (v) => c.value = { ...c.value, record: v }
    }), A = yM({
      hub: z,
      transport: () => M.value,
      view: () => te.value,
      locator: m,
      track: () => H.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: Gt,
      notify: (v) => u.notes = [v],
      problem: (v) => F.value = v,
      sound: () => R.value
    }), F = _(null), fe = E(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : Y.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function pe(v) {
      const x = v.target;
      L.value?.contains(x) || Hr(x) || v.ctrlKey || v.metaKey || v.altKey || v.key !== " " && v.key !== "Escape" || (v.preventDefault(), v.stopPropagation(), v.key === " " ? A.stop() : A.cancel());
    }
    Be(A.recording, (v) => {
      v ? window.addEventListener("keydown", pe, !0) : window.removeEventListener("keydown", pe, !0);
    }), Un(() => {
      window.removeEventListener("keydown", pe, !0), A.cancel(), A.dispose();
    }), Un(() => u.dispose());
    const te = E(() => u.lastValid), ie = E(() => !!u.view && !u.view.ok), $e = E(() => u.view?.diagnostics ?? []), be = E(
      () => $e.value.filter((v) => v.severity === "error" && v.bar).map((v) => v.bar)
    ), Me = E(
      () => Ef(te.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), xe = E(() => d.value !== "text"), q = E(() => d.value === "daw"), Je = E(() => t.guide ?? []), le = E(() => gm(t.guide, te.value?.model)), De = E(() => q.value ? c.value.voices.guide ?? !0 : !1), ee = E(() => De.value ? le.value : []), U = E(() => xe.value && c.value.roll && !!(te.value?.model || te.value?.model_error)), Y = E(() => te.value?.model ?? null), Ne = E(() => Y.value ? _s(Y.value, m.value) : Me.value), et = E(() => te.value && Y.value ? Fa(te.value, m.value) : null), ft = E(() => Y.value ? If(Y.value, m.value) : "");
    Be(
      () => Y.value?.total,
      (v) => {
        v !== void 0 && m.value > v && (m.value = v);
      }
    );
    let Ge = null, Q = null, j = !1;
    Be(
      () => [t.lyricsTarget, t.lyrics, Y.value],
      ([v, x, B]) => {
        if (!v || !x?.trim()) {
          o.value = null, r.value = null, Ge = null, j = !1;
          return;
        }
        const Z = x === Ge || x === Q;
        if (Ge = x, Z && (j || !B)) {
          if (o.value && B && o.value.blocks.length !== B.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && B) {
            const ue = Io(r.value, B);
            ue && (o.value = ue, r.value = null);
          }
          return;
        }
        const re = !j && t.lyricsPending || x;
        o.value = B ? Io(re, B) : null, r.value = o.value ? null : re, j = !!B;
      },
      { immediate: !0 }
    ), Be(
      [o, r, Y],
      () => {
        const v = o.value, x = Y.value;
        v ? x && v.blocks.length === x.sections.length && (l.value = VC(v, x)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Be(
      l,
      (v, x) => {
        Q = v, n("lyricsChange", v), x !== void 0 && v !== x && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const ce = E(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), ve = E(
      () => !!l.value && !t.lyricsTarget?.own && jt(l.value) !== jt(t.lyrics ?? "")
    ), ke = E(() => l.value ? no(l.value).blocks.map((v) => v.tag).join(" · ") : ""), bt = E(() => l.value ?? t.lyrics ?? null);
    function at() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...At()] };
    }
    const Wt = Zi(null);
    function At() {
      return Wt.value ?? t.lyricSpans ?? [];
    }
    function Bt(v) {
      Ho(v, At()) || (Wt.value = v, n("lyricSpansChange", v), u.refreshLyrics());
    }
    Be(
      () => t.lyricSpans,
      (v) => {
        v && Wt.value && Ho(v, Wt.value) || (Wt.value = null, u.refreshLyrics());
      }
    );
    const ct = _([]);
    Be(
      () => u.selection,
      (v) => {
        v.length && (ct.value = []);
      }
    );
    function jn(v) {
      const x = Y.value;
      if (!x) return -1;
      let B = -1;
      return x.sections.findIndex((Z) => !Z.implicit && ++B === v);
    }
    function mn(v) {
      if (o.value) {
        const B = jn(v);
        return B < 0 ? null : [...o.value.blocks[B]?.lines ?? []];
      }
      if (r.value === null) return null;
      const x = no(r.value).blocks[v];
      return x ? [...x.lines] : null;
    }
    function fi() {
      return Math.max(1, Math.round(Y.value?.grid.units_per_quarter ?? 1));
    }
    function On(v, x, B) {
      const Z = Y.value, re = te.value?.lyrics;
      if (!Z || !re || !ce.value) return null;
      const ue = at(), Ve = [], ye = /* @__PURE__ */ new Map();
      for (const we of [...new Set(v)].sort((tt, We) => tt - We)) {
        const tt = mn(we);
        if (tt === null) continue;
        const We = ho(re, we, Z.total), sn = om(x(we, lu(re, we, tt, We, fi())), We), on = sn.map((ki) => ki.text);
        if (o.value) o.value = _C(o.value, Z, jn(we), on);
        else if (r.value !== null) r.value = FC(r.value, we, on);
        else continue;
        sn.forEach((ki, zr) => {
          ki.id.startsWith("*") && Ve.push(ji(we, zr));
        }), ye.set(we, sn);
      }
      return ye.size ? (Bt(rm(At(), re, ye, !0)), u.recordSide(B, ue, at()), Ve) : null;
    }
    function pi(v) {
      const x = /* @__PURE__ */ new Map();
      for (const B of v) {
        const Z = lm(B);
        Z && (x.has(Z.block) || x.set(Z.block, /* @__PURE__ */ new Set()), x.get(Z.block)?.add(Z.line));
      }
      return x;
    }
    function ks(v, x) {
      const B = new Map(v.map((ue) => [ue.key, ue])), Z = v.length, re = Z ? On(
        [...pi(v.map((ue) => ue.key)).keys()],
        (ue, Ve) => Ve.map((ye, we) => {
          const tt = B.get(ji(ue, we));
          return tt ? { ...ye, id: `*${ye.id}`, start: tt.start, end: tt.end } : ye;
        }),
        `lyrics: ${Z === 1 ? "line" : `${Z} lines`} placed`
      ) : null;
      re && (ct.value = re), x && (u.notes = [x]);
    }
    function En() {
      if (!ce.value || !At().length) return;
      const v = at();
      Bt([]), u.recordSide("lyrics: placed automatically", v, at()), ct.value = [], u.notes = ["the lyrics are placed on the notes automatically again - Ctrl+Z brings the places back"];
    }
    function Ni(v) {
      const x = pi(v);
      x.size && (On(
        [...x.keys()],
        (B, Z) => Z.filter((re, ue) => !x.get(B)?.has(ue)),
        `lyrics: ${v.length === 1 ? "line" : `${v.length} lines`} deleted`
      ), ct.value = []);
    }
    function Ft() {
      const v = Y.value, x = te.value?.lyrics;
      if (!v || !x) return [];
      const B = [];
      for (const [Z, re] of pi(ct.value)) {
        const ue = mn(Z);
        ue && lu(x, Z, ue, ho(x, Z, v.total), fi()).forEach((Ve, ye) => {
          re.has(ye) && B.push(Ve);
        });
      }
      return B;
    }
    function tn() {
      const v = Y.value ? Yx(Y.value.unit, au(Ft())) : null;
      return v ? (ei.value = v, u.error = null, u.notes = [`copied ${v.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function kt(v, x, B) {
      const Z = Y.value, re = te.value?.lyrics;
      if (!Z || !re) return;
      const ue = am(re, x);
      if (!ue || mn(ue.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, Ve] = ho(re, ue.block, Z.total), ye = v.filter((We) => x + We.offset < Ve);
      if (!ye.length) return;
      const we = ye.map((We) => ({ start: x + We.offset, end: Math.min(x + We.offset + We.length, Ve) })), tt = um(cm(re), we);
      if (tt) {
        u.error = `Not pasted: the lines would overlap "${tt.text}" - lyrics lines never overlap. Set the cursor where the lyrics lane is free, or move, shorten or delete that line first.`;
        return;
      }
      ct.value = On(
        [ue.block],
        (We, sn) => [
          ...sn,
          ...ye.map((on, ki) => ({
            id: `*new${ki}`,
            text: on.text,
            start: x + on.offset,
            end: Math.min(x + on.offset + on.length, Ve)
          }))
        ],
        B
      ) ?? [], u.error = null, ye.length < v.length && (u.notes = [`${v.length - ye.length} line(s) did not fit before the next block's first line`]);
    }
    function mi(v) {
      const x = ei.value;
      if ((v === "paste" || v === "insert") && x?.lyricLines?.length)
        return ce.value ? Y.value && x.unit !== Y.value.unit ? (u.error = `The lines were copied with L:${x.unit} and do not fit this score's L:${Y.value.unit}.`, !0) : (kt(x.lyricLines, m.value, `lyrics: ${x.label} pasted`), !0) : !0;
      if (!ct.value.length) return !1;
      if (v === "copy") tn();
      else if (v === "cut")
        tn() && Ni(ct.value);
      else if (v === "duplicate") {
        const B = Ft();
        if (B.length) {
          const Z = Math.max(...B.map((re) => re.end));
          kt(au(B), Z, `lyrics: ${B.length === 1 ? "line" : `${B.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function gn(v) {
      const x = Y.value, B = te.value?.lyrics;
      if (x && B) {
        const re = fi(), ue = On(
          [v.block],
          (Ve, ye) => {
            if (v.line < ye.length)
              return v.text ? ye.map((We, sn) => sn === v.line ? { ...We, text: v.text } : We) : ye.filter((We, sn) => sn !== v.line);
            const we = v.at ?? ye[ye.length - 1]?.end ?? ho(B, v.block, x.total)[0], tt = Math.max(we + 1, v.end ?? we + re);
            return v.text ? [...ye, { id: "*typed", text: v.text, start: we, end: tt }] : ye;
          },
          `lyrics: ${v.text || "line removed"}`
        );
        if (ue) {
          ue.length && (ct.value = ue);
          return;
        }
      }
      const Z = at();
      if (o.value && x) o.value = WC(o.value, x, jn(v.block), v.line, v.text);
      else if (r.value !== null) r.value = zC(r.value, v.block, v.line, v.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${v.text || "line removed"}`, Z, at());
    }
    function qn() {
      const v = t.lyrics, x = Y.value;
      if (!v) return;
      const B = at();
      o.value = x ? Io(v, x) : null, r.value = o.value ? null : v, t.readonly || u.recordSide("lyrics reverted", B, at());
    }
    Be(Y, (v) => {
      if (!Nr || !v || r.value === null) return;
      Nr = !1;
      const x = Io(r.value, v);
      x && (o.value = x, r.value = null);
    }), Be(Me, (v) => {
      !U.value && v && Y.value && (m.value = Hc(Y.value, v));
    });
    const _t = E({
      get: () => c.value.metronome,
      set: (v) => c.value = { ...c.value, metronome: v }
    }), Rn = E(() => t.payload?.reference_audio ? Ip(t.fetcher, t.payload.reference_audio) : null), Kt = Zi(null), In = _(null);
    Be(
      Rn,
      (v) => {
        Kt.value = null, In.value = null, v && $w(v).then(
          (x) => {
            Rn.value === v && (Kt.value = x);
          },
          (x) => {
            Rn.value === v && (In.value = `the source recording could not be read: ${x instanceof Error ? x.message : String(x)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const vn = E({
      get: () => c.value.hear,
      set: (v) => c.value = { ...c.value, hear: v }
    }), Ot = E({
      get: () => c.value.sourceLevel,
      set: (v) => c.value = { ...c.value, sourceLevel: v }
    }), Pn = E(() => {
      const v = te.value, x = v?.model;
      if (!v || !x) return null;
      const B = Yn(), Z = [...B.notes.map((we) => [we.onset, we.onset + we.duration]), ...B.chords.map((we) => [we.onset, we.onset + 1])];
      if (!Z.length) return null;
      const re = _s(x, Math.min(...Z.map(([we]) => we))), ue = _s(x, Math.max(...Z.map(([, we]) => we)) - 1), Ve = v.bars[re - 1], ye = v.bars[ue - 1];
      return !Ve || !ye ? null : { from: Ve.start_s, to: ye.start_s + ye.duration_s, label: re === ue ? `bar ${re}` : `bars ${re}-${ue}` };
    }), pt = E(() => {
      const v = XC(te.value?.model, t.payload?.timeline), x = t.sourceShift ?? 0;
      return !v || !x ? v : v.map((B) => B ? [B[0] - x, B[1] - x, B[2]] : null);
    }), Vi = E(() => {
      const v = pt.value?.[(Ne.value ?? 1) - 1] ?? pt.value?.find((B) => B);
      if (!v) return 0.5;
      const x = Number(v[2].split("/")[0]) || 4;
      return (v[1] - v[0]) / x;
    }), Hi = E(() => {
      const v = t.payload?.sung_pitch;
      if (!v) return null;
      const x = Bw(v), B = Y.value;
      return !x || !B ? { problem: "problem" in v ? v.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: x, offset: Rw(B, pt.value, x), bars: pt.value };
    }), Et = E({
      get: () => t.sourceShift ?? 0,
      set: (v) => n("sourceShiftChange", Math.round(v * 1e3) / 1e3)
    }), mt = E(() => pt.value?.map((v) => v?.[0] ?? null) ?? null), zi = E(() => te.value?.header?.unit ?? "1/16"), yn = E({
      get: () => c.value.voices,
      set: (v) => c.value = { ...c.value, voices: v }
    }), Wi = E({
      get: () => c.value.speed,
      set: (v) => c.value = { ...c.value, speed: v }
    });
    function Ut(v, x = !1, B = "notation") {
      const Z = x ? u.selection.includes(v) ? u.selection.filter((ue) => ue !== v) : [...u.selection, v] : [v];
      u.select(Z);
      const re = $i(te.value, Z[0]);
      b.value = B !== "text" && re ? [re.source[0], re.source[1]] : b.value;
    }
    function gi(v) {
      if (!te.value || ie.value) return;
      const x = Rm(te.value, v);
      x && Ut(x.id, !1, "text");
    }
    function ut(v) {
      if (!te.value) return;
      te.value.model && (m.value = Hc(te.value.model, v));
      const x = Nm(te.value, v);
      x && Ut(x.id, !1, "keys");
    }
    function Vt() {
      return A.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function ht(v) {
      t.readonly || Vt() || await u.operate(v);
    }
    function Gt(v) {
      return t.readonly || Vt() ? Promise.resolve(!1) : u.operate(v);
    }
    function vi() {
      Vt() || u.undo();
    }
    function bn() {
      Vt() || u.redo();
    }
    function nn() {
      Xt(() => {
        const v = document.activeElement;
        (!v || v === document.body) && L.value?.querySelector(".roll")?.focus({ preventScroll: !0 });
      });
    }
    async function Re(v) {
      await ht(v), nn();
    }
    function Nn(v) {
      u.select(v);
      const x = $i(te.value, v[0]);
      x && (b.value = [x.source[0], x.source[1]]);
    }
    function Yn() {
      const v = Y.value;
      if (!v) return { notes: [], chords: [] };
      const x = gs(te.value, u.selection), B = vs(u.selection);
      return {
        notes: [...v.tracks.vocal, ...v.tracks.ins].filter((Z) => x.has(Z.id)),
        chords: v.tracks.chords.filter((Z) => B.has(Z.id))
      };
    }
    function yi() {
      const v = Y.value, x = Yn(), B = v ? jc(v, x.notes, x.chords) : null;
      return B ? (ei.value = B, u.error = null, u.notes = [`copied ${B.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function bi(v) {
      if (mi(v)) return;
      const x = Y.value;
      if (v === "copy") {
        yi();
        return;
      }
      if (t.readonly || !x) return;
      if (v === "cut") {
        const re = Yn();
        if (!yi()) return;
        await ht({ op: "delete", ids: [...re.notes.map((ue) => ue.id), ...re.chords.map((ue) => ue.id)] });
        return;
      }
      if (v === "duplicate") {
        const re = Yn(), ue = jc(x, re.notes, re.chords);
        if (!ue) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Ve = Math.min(...re.notes.map((we) => we.onset), ...re.chords.map((we) => we.onset)), ye = Yc(ue, x, Ve + ue.span, "overwrite");
        typeof ye == "string" ? u.error = "There is no room after the selection to duplicate it." : await ht(ye);
        return;
      }
      const B = ei.value;
      if (!B) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const Z = Yc(B, x, m.value, v === "insert" ? "insert" : "overwrite");
      typeof Z == "string" ? u.error = Z : await ht(Z);
    }
    function Fi(v) {
      if (v.altKey) return null;
      switch (v.key.toLowerCase()) {
        case "c":
          return "copy";
        case "x":
          return "cut";
        case "v":
          return v.shiftKey ? "insert" : "paste";
        case "d":
          return "duplicate";
        default:
          return null;
      }
    }
    function C(v) {
      k.value = v === null || !te.value ? null : _a(te.value, v), A.onTime(v);
    }
    function g() {
      t.readonly || !t.guide?.length || n("guideChange", []);
    }
    const y = E({
      get: () => c.value.rollZoom,
      set: (v) => c.value = { ...c.value, rollZoom: v }
    }), T = E(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function D(v) {
      v.preventDefault();
      const x = c.value.rollHeight;
      Vo(v, ({ dy: B }) => c.value = { ...c.value, rollHeight: Za(x, B) });
    }
    function X(v) {
      const x = v.key === "ArrowUp" ? -16 : v.key === "ArrowDown" ? 16 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, rollHeight: Za(c.value.rollHeight, x) });
    }
    function he(v) {
      v.preventDefault();
      const x = c.value.notationShare, Z = v.currentTarget.parentElement?.clientHeight ?? 0;
      Vo(v, ({ dy: re }) => c.value = { ...c.value, notationShare: Wp(x, re, Z) });
    }
    function Ce(v) {
      const x = v.key === "ArrowDown" ? 0.03 : v.key === "ArrowUp" ? -0.03 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, notationShare: Pp(c.value.notationShare + x) });
    }
    function _e(v) {
      v.preventDefault();
      const x = c.value.sideWidth;
      Vo(v, ({ dx: B }) => c.value = { ...c.value, sideWidth: Qa(x, B) });
    }
    function Te(v) {
      const x = v.key === "ArrowLeft" ? -16 : v.key === "ArrowRight" ? 16 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, sideWidth: Qa(c.value.sideWidth, x) });
    }
    const Ke = _(null), Ze = _(null), Le = _(null), Tt = _(!1), ws = E(() => t.guide !== void 0), ao = E(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && te.value?.display_abc ? null : "There is no score to export yet."), uo = E({
      get: () => c.value.paper,
      set: (v) => c.value = { ...c.value, paper: v }
    }), Ga = E({
      get: () => c.value.notationSize,
      set: (v) => c.value = { ...c.value, notationSize: v }
    });
    function Kf(v) {
      Le.value = null, u.notes = [v];
    }
    const _i = E(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Uf() {
      const v = _i.value;
      if (v) {
        Le.value = v;
        return;
      }
      Tt.value = !0, Le.value = null;
      try {
        const x = await Np(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        ss(x.filename, Uk(x.data));
      } catch (x) {
        Le.value = Ti(x);
      } finally {
        Tt.value = !1;
      }
    }
    async function Gf() {
      const v = _i.value;
      if (v) {
        Le.value = v;
        return;
      }
      Tt.value = !0, Le.value = null;
      try {
        const x = await Vp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: At()
        });
        ss(x.filename, new TextEncoder().encode(x.data), x.type);
      } catch (x) {
        Le.value = Ti(x);
      } finally {
        Tt.value = !1;
      }
    }
    const ja = _(null);
    function jf() {
      const v = Qc({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: At(),
        settings: W.value
      });
      ss(o2(t.title), new TextEncoder().encode(`${JSON.stringify(v, null, 1)}
`), "application/json"), Le.value = null, u.notes = [`saved the project: score${v.guide.length ? `, ${qa(v.guide.length)}` : ""}${v.lyrics ? ", lyrics" : ""}, settings`];
    }
    function qf() {
      Le.value = null, ja.value?.click();
    }
    async function Yf(v) {
      const x = v.target, B = x.files?.[0];
      if (x.value = "", !B) return;
      const Z = r2(await B.text());
      typeof Z == "string" ? Le.value = Z : Ya(Z, B.name);
    }
    const qa = (v) => v === 1 ? "1 Guide note" : `${v} Guide notes`;
    let Nr = !1;
    function Ya(v, x) {
      if (Vt()) return;
      if (t.readonly) {
        Le.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const B = ["score"], Z = [], re = at(), ue = {}, Ve = t.guide;
      Ve !== void 0 ? (re.guide = [...Ve], ue.guide = [...v.guide], v.guide.length && B.push(qa(v.guide.length))) : v.guide.length && Z.push("the Guide notes (only the DAW sheet keeps a Guide track)"), v.lyrics && ce.value ? (o.value = null, r.value = v.lyrics, Nr = !0, B.push("lyrics"), Bt(v.lyric_spans)) : v.lyrics && Z.push("the lyrics (this sheet cannot change them here)"), Object.assign(ue, at()), Object.keys(v.settings).length && (c.value = Jc(c.value, v.settings), B.push("settings"));
      const ye = `open project (${x})`;
      u.replaceText(v.score, ye, null, { before: re, after: ue }) || u.recordSide(ye, re, ue), ue.guide && Ve !== void 0 && !Ls(ue.guide, Ve) && n("guideChange", ue.guide), Le.value = null, u.notes = [
        `opened ${x}: ${B.join(", ")}${v.title ? ` ("${v.title}")` : ""}`,
        ...Z.map((we) => `not opened: ${we}`)
      ];
    }
    const Xa = _(null);
    function Xf() {
      Le.value = null, Xa.value?.click();
    }
    async function Jf(v) {
      const x = v.target, B = x.files?.[0];
      if (x.value = "", !(!B || t.readonly || Vt())) {
        Tt.value = !0, Le.value = null;
        try {
          const Z = await Hp(t.fetcher, {
            text: await B.text(),
            abc: t.doc.text,
            lyrics: l.value ?? t.lyrics ?? null
          }), re = Z.lyrics ?? l.value ?? t.lyrics ?? null, ue = Qc({
            title: t.title,
            score: Z.abc,
            guide: t.guide ?? [],
            lyrics: re,
            lyricSpans: ha(Z.lyric_spans)
          });
          Z.lyrics === null && (ue.lyric_spans = []), Ya(ue, B.name), u.notes = [`imported ${B.name}`, ...Z.report];
        } catch (Z) {
          Le.value = Ti(Z);
        } finally {
          Tt.value = !1;
        }
      }
    }
    function Zf() {
      Le.value = null, Ke.value?.click();
    }
    async function Qf(v) {
      const x = v.target, B = x.files?.[0];
      if (x.value = "", !!B)
        try {
          Ze.value = { data: Kk(new Uint8Array(await B.arrayBuffer())), filename: B.name };
        } catch (Z) {
          Le.value = Ti(Z);
        }
    }
    function ep(v, x) {
      if (t.readonly || Vt()) return;
      const B = Ze.value?.filename ?? "file", Z = t.guide, re = Z === void 0 ? void 0 : x ? [...v.guide] : [], ue = Z === void 0 || re === void 0 ? void 0 : { before: { guide: [...Z] }, after: { guide: re } };
      u.replaceText(v.abc, `import MIDI (${B})`, v.analysis, ue), re !== void 0 && Z !== void 0 && !Ls(re, Z) && n("guideChange", re), Ze.value = null, Le.value = null;
    }
    function Vr(v) {
      const x = v;
      return x ? !!x.closest("input, textarea, select, .cm-editor") : !1;
    }
    const tp = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Hr(v) {
      const x = v;
      if (!x) return !1;
      if (x.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const B = x.closest("input");
      return !!B && !tp.has(B.type);
    }
    function np(v) {
      v.key === " " && !Hr(v.target) && v.preventDefault();
    }
    function ip(v) {
      const x = v.ctrlKey || v.metaKey;
      if (x && !t.readonly && (v.key === "z" || v.key === "Z" || v.key === "y")) {
        if (Vr(v.target) && !v.target.closest(".cm-editor")) return;
        v.preventDefault(), v.key === "y" || v.key.toLowerCase() === "z" && v.shiftKey ? bn() : vi();
        return;
      }
      const B = x && !Vr(v.target) ? Fi(v) : null;
      if (B) {
        v.preventDefault(), v.stopPropagation(), bi(B);
        return;
      }
      if (v.key === " " && !x && !Hr(v.target)) {
        v.preventDefault(), M.value?.toggle();
        return;
      }
      if (Vr(v.target) || x) return;
      if (v.key === "Escape" && A.recording.value) {
        v.preventDefault(), A.cancel();
        return;
      }
      if (v.key === "R" && v.shiftKey && !v.altKey) {
        v.preventDefault(), A.recording.value ? A.stop() : A.start();
        return;
      }
      if (v.key === "Escape") {
        v.preventDefault(), u.selection.length && u.select([]), ct.value = [];
        return;
      }
      const Z = te.value, re = u.primary, ue = v.key.toLowerCase();
      if ((ue === "g" || ue === "h") && !v.altKey && $.value) {
        v.preventDefault(), v.shiftKey ? $.value.zoomRows(ue === "h" ? 2 : -2) : $.value.zoomBy(ue === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((v.key === "Home" || v.key === "End") && Y.value) {
        v.preventDefault(), m.value = v.key === "Home" ? 0 : Y.value.total;
        return;
      }
      if (!Z || !re) return;
      (() => {
        switch (v.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const ye = Im(Z, re.id, v.key === "ArrowRight" ? 1 : -1);
            return ye && Ut(ye.id, v.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (v.altKey) {
              const We = Pm(Z, re.id);
              return We && Ut(We.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const ye = u.selection.filter((We) => $i(Z, We)?.kind === "note"), we = [...vs(u.selection)], tt = (v.shiftKey ? 12 : 1) * (v.key === "ArrowUp" ? 1 : -1);
            return we.length ? ht({ op: "set_note_pitch", ids: [...gs(Z, u.selection), ...we], semitones: tt }) : ye.length && ht({ op: "shift_pitch", ids: ye, semitones: tt }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || re.kind !== "note") return !1;
            const ye = vl(Z, re, v.key === "]" ? 1 : -1);
            return ye && ht(ye), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (re.kind === "note" && ht({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (re.kind !== "note" && ht({ op: "rest_to_note", id: re.id }), !0);
          default:
            return !1;
        }
      })() && (v.preventDefault(), v.stopPropagation());
    }
    return (v, x) => (w(), S("div", {
      ref_key: "tabRoot",
      ref: L,
      class: "score-tab",
      onKeydown: ip,
      onKeyup: np
    }, [
      i.readonly ? G("", !0) : (w(), Hn(eC, {
        key: 0,
        view: te.value,
        selection: O(u).selection,
        primary: O(u).primary,
        busy: O(u).busy,
        stale: ie.value,
        "can-undo": O(u).canUndo,
        "can-redo": O(u).canRedo,
        "undo-label": O(u).undoLabel,
        "redo-label": O(u).redoLabel,
        onOperate: Re,
        onUndo: x[0] || (x[0] = (B) => (vi(), nn())),
        onRedo: x[1] || (x[1] = (B) => (bn(), nn()))
      }, null, 8, ["view", "selection", "primary", "busy", "stale", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", wM, [
        p("span", xM, [
          p("button", {
            role: "radio",
            "aria-checked": d.value === "review",
            class: Ie({ active: d.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: x[2] || (x[2] = (B) => h("review"))
          }, " Review ", 10, SM),
          p("button", {
            role: "radio",
            "aria-checked": q.value,
            class: Ie({ active: q.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: x[3] || (x[3] = (B) => h("daw"))
          }, " DAW ", 10, CM),
          p("button", {
            role: "radio",
            "aria-checked": d.value === "text",
            class: Ie({ active: d.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: x[4] || (x[4] = (B) => h("text"))
          }, " Text ", 10, MM)
        ]),
        xe.value ? (w(), S(ae, { key: 0 }, [
          p("label", AM, [
            Ae(p("input", {
              "onUpdate:modelValue": x[5] || (x[5] = (B) => c.value.roll = B),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [Rt, c.value.roll]
            ]),
            x[38] || (x[38] = oe(" piano roll ", -1))
          ]),
          p("label", TM, [
            Ae(p("input", {
              "onUpdate:modelValue": x[6] || (x[6] = (B) => c.value.advanced = B),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [Rt, c.value.advanced]
            ]),
            x[39] || (x[39] = oe(" ABC text (advanced) ", -1))
          ])
        ], 64)) : G("", !0),
        p("label", $M, [
          x[40] || (x[40] = oe(" zoom ", -1)),
          Ae(p("input", {
            "onUpdate:modelValue": x[7] || (x[7] = (B) => c.value.zoom = B),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              rt,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        Vn(Hk),
        p("span", DM, [
          p("button", {
            disabled: Tt.value || !!_i.value,
            title: _i.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Uf
          }, " Export MIDI ", 8, LM),
          p("button", {
            disabled: Tt.value || !!_i.value,
            title: _i.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: Gf
          }, " Export MusicXML ", 8, BM),
          Vn(W2, {
            paper: uo.value,
            "onUpdate:paper": x[8] || (x[8] = (B) => uo.value = B),
            size: Ga.value,
            "onUpdate:size": x[9] || (x[9] = (B) => Ga.value = B),
            abc: ao.value ? null : te.value?.display_abc ?? null,
            title: i.title ?? "",
            blocked: ao.value,
            onDone: Kf,
            onFailed: x[10] || (x[10] = (B) => Le.value = B)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !i.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: jf
          }, " Save project ", 8, OM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: Zf
          }, " Import MIDI… ", 8, EM),
          p("button", {
            disabled: i.readonly || Tt.value,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MusicXML file that Export MusicXML wrote - also after a script changed it: its score, lyrics and where they are sung replace these (one undo step). Other MusicXML is refused; use Import MIDI for it.",
            onClick: Xf
          }, " Import MusicXML… ", 8, RM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: qf
          }, " Open project… ", 8, IM),
          p("input", {
            ref_key: "musicXmlFile",
            ref: Xa,
            class: "hidden-file",
            type: "file",
            accept: ".musicxml,.xml,application/vnd.recordare.musicxml+xml,application/xml,text/xml",
            "aria-label": "MusicXML file",
            onChange: Jf
          }, null, 544),
          p("input", {
            ref_key: "midiFile",
            ref: Ke,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Qf
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: ja,
            class: "hidden-file",
            type: "file",
            accept: `${O(_f)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Yf
          }, null, 40, PM)
        ]),
        O(u).pending ? (w(), S("span", NM, "checking…")) : O(u).view?.ok ? (w(), S("span", VM, "✓ valid")) : ie.value ? (w(), S("span", HM, "✖ " + P($e.value.length) + " error(s)", 1)) : G("", !0),
        i.readonly ? (w(), S("span", zM, "read-only: owned by the other sheet")) : G("", !0)
      ]),
      ie.value && !i.readonly ? (w(), S("p", WM, [
        x[41] || (x[41] = oe(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        O(u).canRevert ? (w(), S("button", {
          key: 0,
          onClick: x[11] || (x[11] = (B) => O(u).revertToLastValid())
        }, "Revert to last valid")) : G("", !0),
        xe.value && !c.value.advanced ? (w(), S("button", {
          key: 1,
          onClick: x[12] || (x[12] = (B) => c.value.advanced = !0)
        }, "Show the ABC text")) : G("", !0)
      ])) : O(u).view?.ok && O(u).view.model_error && !i.readonly ? (w(), S("p", FM, " This score is valid for YuE2 but outside the editor's supported subset (" + P(O(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : G("", !0),
      U.value ? (w(), Hn(Kx, {
        key: 3,
        ref_key: "pianoRoll",
        ref: $,
        zoom: y.value,
        "onUpdate:zoom": x[13] || (x[13] = (B) => y.value = B),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": x[14] || (x[14] = (B) => c.value.rowHeight = B),
        follow: c.value.follow,
        "onUpdate:follow": x[15] || (x[15] = (B) => c.value.follow = B),
        track: H.value,
        "onUpdate:track": x[16] || (x[16] = (B) => H.value = B),
        recorded: O(A).recording.value ? { track: H.value, notes: O(A).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": x[17] || (x[17] = (B) => c.value.sung = B),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": x[18] || (x[18] = (B) => c.value.wave = B),
        sound: R.value,
        "chord-sound": c.value.sounds.chord,
        sung: Hi.value,
        height: c.value.rollHeight,
        view: te.value,
        selection: O(u).selection,
        playing: f.value,
        operate: Gt,
        readonly: i.readonly,
        stale: ie.value,
        busy: O(u).busy,
        locator: Y.value ? m.value : null,
        playhead: k.value,
        clip: O(ei)?.label ?? null,
        lyrics: te.value?.lyrics ?? null,
        "lyrics-editable": ce.value,
        source: Kt.value ? { envelope: Kt.value.envelope, bars: pt.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": x[19] || (x[19] = (B) => c.value.audition = B),
        "resize-mode": "rests",
        onSelect: Nn,
        onLocate: x[20] || (x[20] = (B) => m.value = B),
        onClipboard: bi,
        "lyric-selection": ct.value,
        "onUpdate:lyricSelection": x[21] || (x[21] = (B) => ct.value = B),
        onLyricEdit: gn,
        onLyricPlace: ks,
        onLyricDelete: Ni,
        onLyricAuto: En,
        onNotice: x[22] || (x[22] = (B) => O(u).notes = [B])
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "chord-sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : G("", !0),
      U.value && te.value?.model ? (w(), S("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": O(Lp),
        "aria-valuemax": O(Dp),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: D,
        onKeydown: X
      }, null, 40, _M)) : G("", !0),
      Vn(SC, {
        ref_key: "transport",
        ref: M,
        voices: yn.value,
        "onUpdate:voices": x[25] || (x[25] = (B) => yn.value = B),
        speed: Wi.value,
        "onUpdate:speed": x[26] || (x[26] = (B) => Wi.value = B),
        sounds: c.value.sounds,
        metronome: _t.value,
        "onUpdate:metronome": x[27] || (x[27] = (B) => _t.value = B),
        view: te.value,
        bar: Ne.value,
        from: et.value,
        position: ft.value,
        reference: Rn.value,
        hear: vn.value,
        "onUpdate:hear": x[28] || (x[28] = (B) => vn.value = B),
        "source-level": Ot.value,
        "onUpdate:sourceLevel": x[29] || (x[29] = (B) => Ot.value = B),
        "source-shift": Et.value,
        "onUpdate:sourceShift": x[30] || (x[30] = (B) => Et.value = B),
        "source-beat": Vi.value,
        "timeline-bars": pt.value,
        guide: ee.value,
        source: Kt.value,
        "source-problem": In.value,
        "loop-range": Pn.value,
        onCursor: x[31] || (x[31] = (B) => f.value = B),
        onTime: C,
        onStopped: O(A).onStopped
      }, {
        record: op(({ countingIn: B }) => [
          Vn(D2, {
            settings: N.value,
            "onUpdate:settings": x[23] || (x[23] = (Z) => N.value = Z),
            hub: O(z),
            recording: O(A).recording.value,
            "counting-in": B,
            step: O(A).step.value,
            target: H.value === "vocal" ? "Vocal" : "Ins",
            disabled: fe.value,
            onRecord: O(A).start,
            onStop: O(A).stop,
            onStep: O(A).toggleStep,
            onRest: O(A).rest,
            onEnable: O(A).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          Vn(lM, {
            sounds: V.value,
            "onUpdate:sounds": x[24] || (x[24] = (Z) => V.value = Z),
            fetcher: i.fetcher,
            settings: W.value,
            "keeps-guide": ws.value,
            onApply: I
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: Ie(["score-main", { "with-roll": U.value && !!te.value?.model, "with-inspector": xe.value }]),
        "data-layout": d.value,
        "data-text": xe.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: Qi(T.value)
      }, [
        p("div", UM, [
          q.value ? (w(), Hn(PC, {
            key: 0,
            voices: yn.value,
            "onUpdate:voices": x[32] || (x[32] = (B) => yn.value = B),
            view: te.value,
            "guide-count": Je.value.length,
            sounds: V.value,
            "onUpdate:sounds": x[33] || (x[33] = (B) => V.value = B),
            "keeps-guide": ws.value,
            readonly: i.readonly,
            onClearGuide: g,
            onShiftTrack: x[34] || (x[34] = (B, Z) => ht({ op: "shift_track", track: B, semitones: Z }))
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : G("", !0),
          Vn(CS, {
            view: te.value,
            bar: Me.value,
            "error-bars": be.value,
            "source-starts": mt.value,
            readonly: i.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: ut,
            onOperate: ht,
            onNotice: x[35] || (x[35] = (B) => O(u).notes = [B])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          i.lyricsTarget && l.value !== null ? (w(), S("div", GM, [
            x[42] || (x[42] = p("strong", null, "Lyrics", -1)),
            i.lyricsTarget.blocked ? (w(), S("p", jM, P(i.lyricsTarget.blocked), 1)) : (w(), S(ae, { key: 1 }, [
              ve.value ? (w(), S("p", qM, [
                oe(" Apply writes the changed lyrics into " + P(i.lyricsTarget.title) + ": " + P(ke.value) + ". That sheet then asks for approval again. ", 1),
                i.lyricsTarget.replans ? (w(), S(ae, { key: 0 }, [
                  oe(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : G("", !0)
              ])) : (w(), S("p", YM, [
                oe(P(i.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${i.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !i.readonly ? (w(), S(ae, { key: 0 }, [
                  oe("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : G("", !0)
              ])),
              ve.value ? (w(), S("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: qn
              }, " Revert the lyrics ")) : G("", !0)
            ], 64))
          ])) : G("", !0),
          xe.value && bt.value ? (w(), S("details", XM, [
            x[43] || (x[43] = p("summary", null, "Lyrics fit", -1)),
            Vn(rh, {
              lyrics: bt.value,
              abc: i.doc.text,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : G("", !0)
        ]),
        p("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": O(Op),
          "aria-valuemax": O(Bp),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: _e,
          onKeydown: Te
        }, null, 40, JM),
        p("div", {
          class: Ie(["score-views", { split: xe.value && c.value.advanced }])
        }, [
          xe.value ? G("", !0) : (w(), Hn(Bc, {
            key: 0,
            text: i.doc.text,
            diagnostics: $e.value,
            reveal: b.value,
            readonly: i.readonly,
            onChange: O(u).typed,
            onCursor: gi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          Vn(yw, {
            view: te.value,
            stale: ie.value,
            selection: O(u).selection,
            playing: f.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: x[36] || (x[36] = (B, Z) => Ut(B, Z))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          xe.value && c.value.advanced ? (w(), S("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": O(Rp),
            "aria-valuemax": O(Ep),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: he,
            onKeydown: Ce
          }, null, 40, ZM)) : G("", !0),
          xe.value && c.value.advanced ? (w(), Hn(Bc, {
            key: 2,
            text: i.doc.text,
            diagnostics: $e.value,
            reveal: b.value,
            readonly: i.readonly,
            onChange: O(u).typed,
            onCursor: gi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : G("", !0)
        ], 2),
        xe.value ? (w(), Hn(Ik, {
          key: 0,
          view: te.value,
          selection: O(u).selection,
          operate: Gt,
          "fallback-bar": O(u).primary?.bar ?? null,
          readonly: i.readonly,
          stale: ie.value,
          busy: O(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : G("", !0)
      ], 14, KM),
      p("p", QM, [
        p("span", null, P(O(u).selection.length > 1 ? `${O(u).selection.length} selected · ` : "") + P(O(Hm)(O(u).primary, zi.value)), 1),
        (w(!0), S(ae, null, ge(O(u).notes, (B, Z) => (w(), S("span", {
          key: Z,
          class: "change"
        }, P(B), 1))), 128))
      ]),
      O(u).error ? (w(), S("p", eA, P(O(u).error), 1)) : G("", !0),
      Le.value ? (w(), S("p", tA, P(Le.value), 1)) : G("", !0),
      F.value ? (w(), S("p", nA, P(F.value), 1)) : G("", !0),
      Ze.value ? (w(), Hn(mw, {
        key: 8,
        fetcher: i.fetcher,
        data: Ze.value.data,
        filename: Ze.value.filename,
        view: te.value,
        "keeps-guide": ws.value,
        "current-guide": Je.value.length,
        onClose: x[37] || (x[37] = (B) => Ze.value = null),
        onInsert: ep
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : G("", !0),
      $e.value.length ? (w(), S("ul", iA, [
        (w(!0), S(ae, null, ge($e.value, (B, Z) => (w(), S("li", {
          key: Z,
          "data-severity": B.severity
        }, [
          p("strong", null, P(B.severity), 1),
          B.bar ? (w(), S("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${B.bar}`,
            onClick: (re) => ut(B.bar)
          }, "bar " + P(B.bar), 9, oA)) : B.line ? (w(), S("span", rA, "line " + P(B.line), 1)) : G("", !0),
          oe(" " + P(B.message), 1)
        ], 8, sA))), 128))
      ])) : G("", !0)
    ], 544));
  }
}), lA = ["aria-label"], aA = ["title"], uA = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, cA = ["aria-selected", "onClick"], hA = ["title", "aria-label", "aria-pressed"], dA = {
  key: 0,
  class: "hint"
}, fA = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, pA = ["disabled", "title"], mA = {
  class: "body",
  role: "tabpanel"
}, gA = { class: "doc-head" }, vA = ["data-state"], yA = ["disabled", "title", "onClick"], bA = ["disabled", "onClick"], kA = ["onClick"], wA = {
  key: 0,
  class: "conflict"
}, xA = ["onClick"], SA = ["onClick"], CA = ["onClick"], MA = ["onUpdate:modelValue", "rows", "aria-label", "onFocus", "onInput"], AA = {
  key: 3,
  class: "tag-helpers"
}, TA = ["title", "onClick"], $A = ["title", "onClick"], DA = ["aria-expanded"], LA = ["title", "onClick"], BA = ["title", "onClick"], OA = ["maxlength", "onKeydown"], EA = ["onClick"], RA = {
  key: 4,
  class: "error"
}, IA = {
  key: 5,
  class: "facts"
}, PA = {
  key: 4,
  class: "asr"
}, NA = { key: 0 }, VA = { key: 1 }, HA = { key: 2 }, zA = { key: 5 }, WA = {
  key: 0,
  class: "diff"
}, FA = { key: 0 }, _A = { key: 1 }, KA = { key: 2 }, UA = { key: 3 }, GA = {
  key: 0,
  class: "doc context wide"
}, jA = { class: "doc-head" }, qA = ["title"], YA = {
  key: 1,
  class: "badge"
}, XA = {
  key: 0,
  class: "hint score-owner"
}, JA = {
  key: 1,
  class: "hint"
}, ZA = {
  key: 1,
  class: "doc sections"
}, QA = {
  key: 0,
  class: "doc context"
}, eT = { class: "doc-head" }, tT = {
  class: "findings",
  "aria-label": "Validation"
}, nT = ["data-status"], iT = { key: 0 }, sT = ["title"], oT = { key: 1 }, rT = ["title"], lT = { class: "idea" }, aT = {
  key: 0,
  class: "idea"
}, uT = {
  key: 1,
  class: "idea"
}, cT = { class: "where" }, hT = {
  key: 0,
  class: "kept"
}, dT = {
  key: 1,
  class: "error"
}, fT = {
  key: 2,
  class: "error"
}, pT = {
  key: 3,
  class: "error"
}, mT = {
  key: 4,
  class: "error"
}, gT = ["data-severity"], vT = { class: "where" }, yT = {
  key: 0,
  class: "facts"
}, bT = ["disabled"], kT = ["disabled", "title"], wT = ["disabled", "title"], xT = ["aria-valuenow", "title"], ST = /* @__PURE__ */ Ct({
  __name: "SheetDialog",
  props: {
    title: {},
    state: {},
    payload: {},
    asrNote: {},
    owned: {},
    review: {},
    fetcher: {},
    layout: {},
    guide: {},
    lyricSpans: {},
    sourceShift: {},
    lyricsTarget: {},
    scoreTarget: {}
  },
  emits: ["apply", "close"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = {
      lyrics: "lyrics",
      score: "score",
      style: "style",
      title: "details",
      artwork_prompt: "details"
    }, o = { lyrics: "Lyrics", score: "Score", style: "Style", details: "Title & artwork" }, r = {
      title: "Title",
      style: "Style",
      lyrics: "Lyrics",
      score: "Score (ABC)",
      artwork_prompt: "Artwork prompt"
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = E(() => t.payload?.style_label === "caption"), u = E(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (g) => g === "style" && a.value ? "Caption" : o[g], d = (g) => g === "style" && a.value ? 14 : l[g], h = $s(eu(t.state, t.payload, t.owned)), f = _(t.payload), m = _(null), k = _(!1), b = _(!1), M = _(null), $ = E(() => {
      const g = h.find((T) => T.kind === "score"), y = M.value;
      return g && g.intent !== "auto" && y?.reason && y.text === g.text ? y.reason : null;
    }), L = _(null), H = _(0);
    let V;
    const W = E(() => t.payload?.context?.score ?? null), I = $s({ kind: "score", text: W.value ?? "", intent: "keep" }), K = E(
      () => !h.some((g) => g.kind === "score") && !!W.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), R = _(null), z = E(() => {
      const g = R.value;
      return K.value && g?.reason && g.text === I.text ? g.reason : null;
    }), N = E(
      () => K.value && W.value && jt(I.text) !== jt(W.value) ? I.text : null
    );
    function A() {
      if (!N.value) return;
      const g = h.find((y) => y.kind === "lyrics");
      g && g.intent !== "auto" && (g.intent = "manual");
    }
    const F = E(() => {
      const g = new Set(h.map((y) => s[y.kind]));
      for (const y of Object.keys(t.payload?.context ?? {}))
        y in s && g.add(s[y]);
      return ["score", "lyrics", "style", "details"].filter((y) => g.has(y));
    }), fe = h[0] ? s[h[0].kind] : "lyrics", pe = _(fe), te = (g) => t.payload?.docs[g] ?? null, ie = (g) => te(g)?.upstream ?? null, $e = (g) => te(g)?.status === "conflict", be = (g) => h.filter((y) => s[y.kind] === g), Me = E(() => h.find((g) => g.kind === "score") ?? null), xe = E(() => Me.value?.text ?? W.value ?? null), q = E(
      () => h.find((g) => g.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), Je = E(
      () => h.find((g) => g.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), le = E(() => Up(t.payload?.timeline)), De = E(() => {
      const g = t.asrNote ?? L.value;
      return g && g.draft_sha256 === te("lyrics")?.upstream_sha256 ? g : null;
    }), ee = (g) => xm(ie(g.kind) ?? "", g.text);
    function U(g) {
      if (g.intent === "auto") return "auto";
      if (g.intent === "manual") return "manual";
      if (g.intent === "rebase") return "edited (merged)";
      if ($e(g.kind)) return "conflict";
      const y = t.state.docs[g.kind]?.state ?? "auto", T = jt(ie(g.kind) ?? "");
      return y === "auto" && jt(g.text) !== T ? T || !t.payload ? "edited" : "manual" : y;
    }
    function Y(g) {
      g.intent = "auto";
      const y = ie(g.kind);
      y !== null && (g.text = y);
    }
    function Ne(g) {
      return ie(g.kind) !== null || U(g) !== "auto";
    }
    function et(g) {
      g.intent = "manual";
    }
    const ft = /* @__PURE__ */ new Map(), Ge = /* @__PURE__ */ new Set();
    function Q(g, y) {
      y instanceof HTMLTextAreaElement ? ft.set(g, y) : ft.delete(g);
    }
    function j(g, y) {
      const T = ft.get(g.kind), D = T && Ge.has(g.kind) ? T.selectionStart : g.text.length, X = wm(g.text, y, D);
      g.text = X.text, En(g), Xt(() => {
        T?.isConnected && (T.focus(), T.setSelectionRange(X.caret, X.caret));
      });
    }
    function ce(g) {
      g.intent = "manual";
    }
    const ve = E(
      () => t.payload?.model_tags?.length ? t.payload.model_tags : [...uu]
    ), ke = E(
      () => (t.payload?.section_tags ?? [...uu, ...ym]).filter((g) => !ve.value.includes(g))
    ), bt = _([]), at = _(!1), Wt = _(!1), At = _(""), Bt = _("");
    let ct = null;
    function jn(g) {
      ct = g instanceof HTMLInputElement ? g : null;
    }
    os(async () => {
      bt.value = km(await Fp(t.fetcher), [...ve.value, ...ke.value]);
    });
    async function mn(g) {
      const y = bt.value;
      bt.value = g;
      try {
        await Yp(t.fetcher, g), Bt.value = "";
      } catch (T) {
        bt.value = y, Bt.value = T instanceof Error ? T.message : String(T);
      }
    }
    function fi() {
      Wt.value = !0, Xt(() => ct?.focus());
    }
    function On(g) {
      const y = oh(At.value);
      if (Wt.value = !1, At.value = "", !y) return;
      const T = [...ve.value, ...ke.value, ...bt.value].find(
        (D) => D.toLowerCase() === y.toLowerCase()
      );
      if (!T) {
        if (bt.value.length >= gl) {
          Bt.value = `At most ${gl} tags of your own - remove one first.`;
          return;
        }
        mn([...bt.value, y]);
      }
      j(g, T ?? y);
    }
    function pi(g) {
      mn(bt.value.filter((y) => y !== g));
    }
    function ks(g) {
      g.intent = "rebase";
    }
    function En(g) {
      g.intent === "auto" && (g.intent = "keep");
    }
    function Ni() {
      eu(t.state, t.payload, t.owned).forEach((y, T) => Object.assign(h[T], y)), kt.value = [...t.guide ?? []], gn.value = [...t.lyricSpans ?? []], _t.value = t.sourceShift ?? 0, I.text = W.value ?? "", H.value++;
    }
    const Ft = E(
      () => h.filter((g) => $e(g.kind) && g.intent === "keep").map((g) => g.kind)
    ), tn = E(() => Xp(t.state, t.payload, h)), kt = _([...t.guide ?? []]);
    function mi(g) {
      kt.value = g;
    }
    const gn = _([...t.lyricSpans ?? []]);
    function qn(g) {
      gn.value = g;
    }
    const _t = _(t.sourceShift ?? 0);
    function Rn(g) {
      _t.value = g;
    }
    function Kt() {
      return { lyricSpans: gn.value, sourceShift: _t.value };
    }
    const In = _(null), vn = E(() => h.find((g) => g.kind === "lyrics") ?? null), Ot = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, Pn = E(() => vn.value ? Ot : t.lyricsTarget ?? null), pt = E(() => {
      const g = t.payload?.context?.lyrics, y = In.value;
      return vn.value || !Pn.value || Pn.value.blocked || !y || !g ? null : jt(y) !== jt(g) ? y : null;
    });
    function Vi(g) {
      const y = vn.value;
      y ? g !== null && jt(g) !== jt(y.text) && (y.text = g, En(y)) : In.value = g;
    }
    function Hi() {
      if (!pt.value || !Pn.value?.replans) return;
      const g = h.find((y) => y.kind === "score");
      g && g.intent === "keep" && (g.intent = "manual");
    }
    const Et = E(
      () => iu(tn.value) !== iu(t.state) || !Ls(kt.value, t.guide ?? []) || !Ho(gn.value, t.lyricSpans ?? []) || _t.value !== (t.sourceShift ?? 0) || pt.value !== null || N.value !== null
    ), mt = E(() => {
      const g = t.payload?.arrangement;
      return g && g.status !== "skipped" ? g : null;
    }), zi = E(() => Gp(mt.value?.notes ?? [])), yn = E(() => (f.value?.findings ?? []).filter((g) => g.severity !== "info")), Wi = E(() => (f.value?.findings ?? []).filter((g) => g.severity === "info")), Ut = E(() => yn.value.some((g) => g.severity === "error")), gi = E(
      () => !k.value && !Ut.value && !Ft.value.length && !$.value && !z.value && !!f.value?.fingerprint
    ), ut = E(
      () => Ft.value.length ? "Resolve the conflicts first." : $.value ?? z.value
    ), Vt = E(() => Ft.value.length ? "⇄ conflict" : Ut.value ? "✖ errors" : yn.value.length ? "⚠ warnings" : f.value?.waiting && !Et.value ? "⏸ waiting for approval" : f.value ? "✓ valid" : "not run yet");
    async function ht() {
      if (t.payload) {
        k.value = !0, m.value = null;
        try {
          f.value = await jp(t.fetcher, {
            sheet_state: tn.value,
            upstream: qp(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: N.value ? { ...t.payload.context, score: N.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null,
            sparse: t.payload.sparse ?? !1
          });
        } catch (g) {
          m.value = g instanceof nh ? `${g.message}${g.hint ? ` — ${g.hint}` : ""}` : String(g);
        } finally {
          k.value = !1;
        }
      }
    }
    Be(
      () => [...h.map((g) => g.text + g.intent), N.value ?? ""].join("\0"),
      () => {
        clearTimeout(V), V = setTimeout(ht, 300);
      }
    );
    function Gt(g) {
      return N.value ? { text: N.value, approved: g } : null;
    }
    function vi() {
      ut.value || (Hi(), A(), n(
        "apply",
        su(tn.value, t.state.review?.approved_fingerprint ?? null),
        kt.value,
        pt.value,
        Gt(!1),
        !1,
        Kt()
      ));
    }
    async function bn() {
      Hi(), A(), await ht(), gi.value && n(
        "apply",
        su(tn.value, f.value?.fingerprint ?? null),
        kt.value,
        pt.value,
        Gt(!0),
        !0,
        Kt()
      );
    }
    function nn() {
      Et.value ? b.value = !0 : n("close");
    }
    const Re = $s(_p()), Nn = $s({ width: window.innerWidth, height: window.innerHeight }), Yn = E(() => {
      const g = Re.maximized ? Nn.height - 2 * ou : Re.height;
      return Re.maximized ? {
        width: `${Nn.width - 2 * ou}px`,
        height: `${g}px`,
        "--plenio-dialog-h": `${g}px`
      } : { width: `${Re.width}px`, height: `${Re.height}px`, "--plenio-dialog-h": `${g}px` };
    });
    function yi() {
      Nn.width = window.innerWidth, Nn.height = window.innerHeight;
      const g = ru({ width: Re.width, height: Re.height }, Nn);
      (g.width !== Re.width || g.height !== Re.height) && (Re.width = g.width, Re.height = g.height, Fr(Re));
    }
    function bi() {
      Re.maximized = !Re.maximized, Fr(Re);
    }
    function Fi(g) {
      g.preventDefault(), g.stopPropagation();
      const y = { width: Re.width, height: Re.height };
      Vo(
        g,
        ({ dx: T, dy: D }) => {
          const X = ru(
            { width: y.width + T, height: y.height + D },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Re.width = X.width, Re.height = X.height;
        },
        () => Fr(Re)
      );
    }
    function C(g) {
      g.key === "Escape" && !g.defaultPrevented && (g.preventDefault(), b.value ? b.value = !1 : nn());
    }
    return os(() => {
      window.addEventListener("keydown", C), window.addEventListener("resize", yi), t.payload && ht();
      const g = te("lyrics")?.upstream_sha256;
      !t.asrNote && g && Kp(t.fetcher, g).then((y) => L.value = y).catch(() => {
      });
    }), Un(() => {
      window.removeEventListener("keydown", C), window.removeEventListener("resize", yi), clearTimeout(V);
    }), (g, y) => (w(), S("div", {
      class: "plenio-overlay",
      onMousedown: Fe(nn, ["self"])
    }, [
      p("div", {
        class: Ie(["plenio-dialog", { maximized: Re.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": i.title,
        style: Qi(Yn.value)
      }, [
        p("header", {
          onDblclick: Fe(bi, ["self"])
        }, [
          p("h2", null, P(i.title), 1),
          p("span", {
            class: Ie(["status", { bad: Ut.value || Ft.value.length }]),
            title: f.value?.status ?? ""
          }, P(Vt.value), 11, aA),
          p("div", uA, [
            (w(!0), S(ae, null, ge(F.value, (T) => (w(), S("button", {
              key: T,
              role: "tab",
              "aria-selected": pe.value === T,
              class: Ie({ active: pe.value === T }),
              onClick: (D) => pe.value = T
            }, P(c(T)), 11, cA))), 128))
          ]),
          p("button", {
            class: "icon",
            title: Re.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Re.maximized ? "Restore" : "Maximize",
            "aria-pressed": Re.maximized,
            onClick: bi
          }, P(Re.maximized ? "❐" : "⛶"), 9, hA),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: nn
          }, "×")
        ], 32),
        i.payload ? G("", !0) : (w(), S("p", dA, [...y[7] || (y[7] = [
          oe(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          oe("; ", -1),
          p("em", null, "Back to auto", -1),
          oe(" hands a document back to the workflow. ", -1)
        ])])),
        b.value ? (w(), S("div", fA, [
          y[8] || (y[8] = oe(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!ut.value,
            title: ut.value ?? "Save your documents into the node",
            onClick: vi
          }, " Apply ", 8, pA),
          p("button", {
            onClick: y[0] || (y[0] = (T) => n("close"))
          }, "Discard"),
          p("button", {
            onClick: y[1] || (y[1] = (T) => b.value = !1)
          }, "Keep editing")
        ])) : G("", !0),
        p("div", mA, [
          (w(!0), S(ae, null, ge(be(pe.value), (T) => (w(), S("section", {
            key: T.kind + H.value,
            class: Ie(["doc", { wide: T.kind === "score" }])
          }, [
            p("div", gA, [
              p("h3", null, P(u.value[T.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": U(T)
              }, P(U(T)), 9, vA),
              y[9] || (y[9] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: !Ne(T),
                title: ie(T.kind) !== null ? "Discard your edit and use the draft" : "Discard your text: the next run computes this document again (the writer, the plan or the transcription) and uses it",
                onClick: (D) => Y(T)
              }, P(ie(T.kind) !== null ? "Use draft" : "Back to auto"), 9, yA),
              T.kind === "lyrics" ? (w(), S("button", {
                key: 0,
                disabled: T.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (D) => et(T)
              }, " Use my own lyrics ", 8, bA)) : (w(), S("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (D) => et(T)
              }, " Make manual ", 8, kA))
            ]),
            $e(T.kind) && T.intent === "keep" ? (w(), S("div", wA, [
              oe(" The draft changed after you edited this document (" + P(te(T.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (D) => ce(T)
              }, "Keep my edit (manual)", 8, xA),
              p("button", {
                onClick: (D) => Y(T)
              }, "Use the new draft", 8, SA),
              p("button", {
                onClick: (D) => ks(T)
              }, "Merge by hand", 8, CA)
            ])) : G("", !0),
            T.kind === "score" ? (w(), Hn(th, {
              key: 1,
              doc: T,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !1,
              "layout-default": i.layout ?? null,
              lyrics: q.value,
              title: Je.value,
              guide: kt.value,
              "lyric-spans": gn.value,
              "source-shift": _t.value,
              "lyrics-target": Pn.value,
              "lyrics-pending": vn.value ? null : In.value,
              onEdited: (D) => En(T),
              onGuideChange: mi,
              onLyricSpansChange: qn,
              onSourceShiftChange: Rn,
              onLyricsChange: Vi,
              onGate: y[2] || (y[2] = (D, X) => M.value = { text: D, reason: X })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : Ae((w(), S("textarea", {
              key: 2,
              ref_for: !0,
              ref: (D) => Q(T.kind, D),
              "onUpdate:modelValue": (D) => T.text = D,
              rows: d(T.kind),
              spellcheck: "false",
              "aria-label": u.value[T.kind],
              onFocus: (D) => O(Ge).add(T.kind),
              onInput: (D) => En(T)
            }, null, 40, MA)), [
              [rt, T.text]
            ]),
            T.kind === "lyrics" ? (w(), S("p", AA, [
              y[10] || (y[10] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (w(!0), S(ae, null, ge(ve.value, (D) => (w(), S("button", {
                key: D,
                title: O(Kr)(D, !0),
                onClick: (X) => j(T, D)
              }, " [" + P(D) + "] ", 9, TA))), 128)),
              at.value ? (w(!0), S(ae, { key: 0 }, ge(ke.value, (D) => (w(), S("button", {
                key: "more-" + D,
                class: "more",
                title: O(Kr)(D, !1),
                onClick: (X) => j(T, D)
              }, " [" + P(D) + "] ", 9, $A))), 128)) : G("", !0),
              ke.value.length ? (w(), S("button", {
                key: 1,
                class: "link",
                "aria-expanded": at.value,
                title: "Tags Plenio knows besides the model's own sections",
                onClick: y[3] || (y[3] = (D) => at.value = !at.value)
              }, P(at.value ? "fewer" : `more (${ke.value.length})`), 9, DA)) : G("", !0),
              (w(!0), S(ae, null, ge(bt.value, (D) => (w(), S("span", {
                key: "own-" + D,
                class: "own"
              }, [
                p("button", {
                  title: `${O(Kr)(D, !1)} - a tag of your own`,
                  onClick: (X) => j(T, D)
                }, " [" + P(D) + "] ", 9, LA),
                p("button", {
                  class: "drop",
                  title: `Remove [${D}] from your tags (the lyrics keep it)`,
                  onClick: (X) => pi(D)
                }, " × ", 8, BA)
              ]))), 128)),
              Wt.value ? (w(), S(ae, { key: 2 }, [
                Ae(p("input", {
                  ref_for: !0,
                  ref: jn,
                  "onUpdate:modelValue": y[4] || (y[4] = (D) => At.value = D),
                  class: "new-tag",
                  maxlength: O(sh),
                  placeholder: "e.g. Violin Rise",
                  "aria-label": "Your section tag",
                  onKeydown: [
                    nt(Fe((D) => On(T), ["prevent", "stop"]), ["enter"]),
                    y[5] || (y[5] = nt(Fe((D) => Wt.value = !1, ["prevent", "stop"]), ["esc"]))
                  ]
                }, null, 40, OA), [
                  [rt, At.value]
                ]),
                p("button", {
                  onClick: (D) => On(T)
                }, "Add", 8, EA)
              ], 64)) : (w(), S("button", {
                key: 3,
                class: "link",
                title: "A section tag of your own - kept for your next songs, inserted with one click",
                onClick: fi
              }, " + your tag ")),
              Bt.value ? (w(), S("span", RA, P(Bt.value), 1)) : G("", !0),
              T.intent === "manual" ? (w(), S("span", IA, "the writer is not consulted - these are your lyrics")) : G("", !0)
            ])) : G("", !0),
            T.kind === "lyrics" && De.value ? (w(), S("p", PA, [
              p("span", null, "Transcribed (" + P(De.value.language) + ").", 1),
              De.value.corrected?.length ? (w(), S("span", NA, [
                y[11] || (y[11] = oe(" Corrected as misheard: ", -1)),
                (w(!0), S(ae, null, ge(De.value.corrected, (D, X) => (w(), S("span", {
                  key: "fix-" + X,
                  class: "fix"
                }, [
                  p("s", null, P(D.heard), 1),
                  oe(" → " + P(D.word), 1)
                ]))), 128))
              ])) : G("", !0),
              De.value.low_confidence.length ? (w(), S("span", VA, [
                y[12] || (y[12] = oe(" Check these unsure words: ", -1)),
                (w(!0), S(ae, null, ge(De.value.low_confidence, (D, X) => (w(), S("mark", {
                  key: "low-" + X
                }, P(D), 1))), 128))
              ])) : G("", !0),
              De.value.left_out.length ? (w(), S("span", HA, [
                y[13] || (y[13] = oe("Left out as not sung: ", -1)),
                p("s", null, P(De.value.left_out.join(" ")), 1)
              ])) : G("", !0)
            ])) : G("", !0),
            ie(T.kind) !== null && O(jt)(ie(T.kind) ?? "") !== O(jt)(T.text) ? (w(), S("details", zA, [
              p("summary", null, "Changes against the draft (" + P(O(Sm)(ee(T))) + " words)", 1),
              T.kind !== "score" ? (w(), S("p", WA, [
                (w(!0), S(ae, null, ge(ee(T), (D, X) => (w(), S(ae, { key: X }, [
                  D.text === O(Us) ? (w(), S("br", FA)) : D.op === "added" ? (w(), S("ins", _A, P(D.text + " "), 1)) : D.op === "removed" ? (w(), S("del", KA, P(D.text + " "), 1)) : (w(), S("span", UA, P(D.text + " "), 1))
                ], 64))), 128))
              ])) : G("", !0),
              p("pre", null, P(ie(T.kind)), 1)
            ])) : G("", !0),
            T.kind === "lyrics" ? (w(), Hn(rh, {
              key: 6,
              lyrics: T.text,
              abc: xe.value,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : G("", !0)
          ], 2))), 128)),
          pe.value === "score" && !Me.value && W.value ? (w(), S("section", GA, [
            p("div", jA, [
              y[14] || (y[14] = p("h3", null, "Score (ABC)", -1)),
              K.value ? (w(), S("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${i.scoreTarget?.title}`
              }, " from " + P(i.scoreTarget?.title) + P(N.value ? " · changed" : ""), 9, qA)) : (w(), S("span", YA, "from the other sheet (read-only)"))
            ]),
            K.value ? (w(), S("p", XA, [
              y[15] || (y[15] = oe(" Changes to the score go into ", -1)),
              p("strong", null, P(i.scoreTarget?.title), 1),
              y[16] || (y[16] = oe(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              y[17] || (y[17] = p("strong", null, "Approve", -1)),
              y[18] || (y[18] = oe(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : i.scoreTarget?.blocked ? (w(), S("p", JA, P(i.scoreTarget.blocked), 1)) : G("", !0),
            Vn(th, {
              doc: I,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !K.value,
              "layout-default": i.layout ?? null,
              lyrics: q.value,
              "lyrics-target": vn.value ? Pn.value : null,
              "lyric-spans": gn.value,
              "source-shift": _t.value,
              onLyricSpansChange: qn,
              onSourceShiftChange: Rn,
              onLyricsChange: Vi,
              onGate: y[6] || (y[6] = (T, D) => R.value = { text: T, reason: D })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : G("", !0),
          pe.value === "lyrics" && le.value.length ? (w(), S("section", ZA, [
            y[20] || (y[20] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              y[19] || (y[19] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), S(ae, null, ge(le.value, (T, D) => (w(), S("tr", { key: D }, [
                  p("td", null, P(T.label), 1),
                  p("td", null, P(T.bars), 1),
                  p("td", null, P(T.start), 1),
                  p("td", null, P(T.end), 1)
                ]))), 128))
              ])
            ])
          ])) : G("", !0),
          (w(!0), S(ae, null, ge(i.payload?.context ?? {}, (T, D) => (w(), S(ae, {
            key: "context-" + D
          }, [
            D !== "score" && s[D] === pe.value ? (w(), S("section", QA, [
              p("div", eT, [
                p("h3", null, P(u.value[D] ?? D), 1),
                y[21] || (y[21] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, P(T), 1)
            ])) : G("", !0)
          ], 64))), 128))
        ]),
        p("section", tT, [
          mt.value ? (w(), S("div", {
            key: 0,
            class: "arrangement",
            "data-status": mt.value.status
          }, [
            mt.value.status === "fallback" ? (w(), S("p", iT, [
              y[22] || (y[22] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: O(Wr)
              }, "experimental", 8, sT),
              oe(" - " + P(O(tu)(mt.value)) + ": " + P(mt.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (w(), S("details", oT, [
              p("summary", null, [
                y[23] || (y[23] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: O(Wr)
                }, "experimental", 8, rT),
                oe(" " + P(O(tu)(mt.value)) + ": " + P(mt.value.summary), 1)
              ]),
              p("p", lT, P(O(Wr)), 1),
              O(nu)(mt.value) ? (w(), S("p", aT, P(O(nu)(mt.value)), 1)) : G("", !0),
              mt.value.idea ? (w(), S("p", uT, P(mt.value.idea), 1)) : G("", !0),
              p("ul", null, [
                (w(!0), S(ae, null, ge(mt.value.sections ?? [], (T) => (w(), S("li", {
                  key: T.index
                }, [
                  p("strong", null, P(T.index) + " " + P(T.label), 1),
                  p("span", cT, "bars " + P(T.bars), 1),
                  oe(" " + P(T.applied.length ? T.applied.join("; ") : "unchanged") + " ", 1),
                  T.kept.length ? (w(), S("span", hT, " - kept: " + P(T.kept.join("; ")), 1)) : G("", !0)
                ]))), 128)),
                (w(!0), S(ae, null, ge(zi.value, (T, D) => (w(), S("li", {
                  key: "note" + D,
                  "data-severity": "info"
                }, P(T), 1))), 128))
              ])
            ]))
          ], 8, nT)) : G("", !0),
          m.value ? (w(), S("p", dT, P(m.value), 1)) : G("", !0),
          Ft.value.length ? (w(), S("p", fT, " Resolve the conflict in: " + P(Ft.value.join(", ")) + ". ", 1)) : G("", !0),
          $.value ? (w(), S("p", pT, "Score: " + P($.value), 1)) : z.value ? (w(), S("p", mT, "Score: " + P(z.value), 1)) : G("", !0),
          p("ul", null, [
            (w(!0), S(ae, null, ge(yn.value, (T, D) => (w(), S("li", {
              key: D,
              "data-severity": T.severity
            }, [
              p("strong", null, P(T.severity), 1),
              y[24] || (y[24] = oe()),
              p("span", vT, P(T.where), 1),
              oe(" " + P(T.message), 1)
            ], 8, gT))), 128)),
            (w(!0), S(ae, null, ge(Wi.value, (T, D) => (w(), S("li", {
              key: "i" + D,
              "data-severity": "info"
            }, P(T.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          i.owned.includes("score") && f.value ? (w(), S("span", yT, " render: " + P(f.value.planning_mode) + ", ceiling " + P(Math.round(f.value.score_seconds)) + " s ", 1)) : G("", !0),
          y[25] || (y[25] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Et.value,
            title: "Discard every change made in this editor",
            onClick: Ni
          }, "Revert", 8, bT),
          p("button", { onClick: nn }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!ut.value,
            title: ut.value ?? "Save your documents into the node",
            onClick: vi
          }, " Apply ", 8, kT),
          i.review === "stop for review" ? (w(), S("button", {
            key: 1,
            class: "primary",
            disabled: !gi.value,
            title: $.value ?? "Release exactly these documents for the next run",
            onClick: bn
          }, " Approve ", 8, wT)) : G("", !0)
        ]),
        Re.maximized ? G("", !0) : (w(), S("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Re.width,
          title: `Resize (${Re.width} × ${Re.height})`,
          onPointerdown: Fi
        }, null, 40, xT))
      ], 14, lA)
    ], 32));
  }
});
function CT() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const i = document.createElement("style");
  i.id = "plenio-dialog-styles", i.textContent = lp, document.head.append(i);
}
function OT(i) {
  CT();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    n.unmount(), e.remove();
  }, n = rp(ST, {
    title: i.title,
    state: i.state,
    payload: i.payload,
    asrNote: i.asrNote ?? null,
    owned: i.owned,
    review: i.review,
    fetcher: i.fetcher,
    layout: i.layout ?? null,
    guide: i.guide ?? [],
    lyricSpans: i.lyricSpans ?? [],
    sourceShift: i.sourceShift ?? 0,
    lyricsTarget: i.lyricsTarget ?? null,
    scoreTarget: i.scoreTarget ?? null,
    onApply: (s, o, r, l, a, u) => {
      i.onApply(s, o, r, l, a, u), t();
    },
    onClose: t
  });
  return n.mount(e), t;
}
export {
  OT as openSheetDialog
};
