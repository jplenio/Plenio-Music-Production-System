import { d as xt, m as Ie, a as _n, i as b, c as w, b as p, t as I, F as de, r as be, n as Ne, j as ue, e as U, g as W, h as O, o as ts, u as B, w as Le, v as ot, p as et, f as Fe, q as It, s as oi, x as Ss, y as qi, z as nn, A as rt, B as Yi, C as io, D as Zt, E as np, G as Vn, H as Nn, I as ip, k as sp, l as op } from "./dialog-C0Bo_5xe.mjs";
import { a as rp, P as eh, b as lp, t as ap, c as up, T as Lo, d as cp, s as Fo, f as hp, e as dp, g as fp, h as pp, j as mp, k as gp, m as vp, n as yp, o as ja, q as bp, r as kp, I as th, u as Ko, w as wp, x as xp, y as Sp, z as Cp, A as Mp, B as Ap, R as Tp, C as $p, S as Dp, D as Lp, N as Bp, E as Op, F as jt, v as Ep, G as Bo, H as qa, J as Ip, K as Ya, L as Rp, M as Pp, O as Np, Q as Vp, U as Hp, V as Xa, W as zp, X as Wp, Y as Fp, Z as Rr, _ as Ja, $ as Za, a0 as Kp, a1 as Qa, a2 as _p, a3 as Up, a4 as Gp, a5 as eu, a6 as tu, a7 as nu, a8 as Pr, a9 as jp, aa as qp } from "./main-ETFi82r9.mjs";
import { a as Yp, r as Xp, n as Jp, e as Nr, b as Zp, s as Qp, p as em } from "./notationExport-DkCMgjck.mjs";
import { lineKey as _o, parseSpans as oa, editRange as so, sameSpans as Oo, partOf as tm, settle as nm, placedLines as iu, withBlockSpans as im, parseLineKey as sm, clipOfLines as su, partAt as om, remapSpans as rm, followSpans as lm } from "./lyricPlacement-DGoRXeqW.mjs";
import { SHIFTABLE as Xn, shiftBlock as Cs, notesLabel as am, trackRows as um, parseGuide as cm, sameGuide as Ms, guideNotes as hm, remapGuide as dm } from "./tracks-ClAVjvds.mjs";
const ou = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Interlude", "Instrumental", "Outro"], fm = ["Post-Chorus", "Hook", "Refrain", "Solo", "Break", "Breakdown", "Drop", "Build"], pm = /* @__PURE__ */ new Set(["intro", "interlude", "instrumental", "solo", "break", "outro"]), cl = 30, nh = 40;
function ih(i) {
  return i.replace(/[[\]\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, nh).trim() || null;
}
function mm(i, e = []) {
  if (!Array.isArray(i)) return [];
  const t = new Set(e.map((s) => s.toLowerCase())), n = [];
  for (const s of i) {
    const o = typeof s == "string" ? ih(s) : null;
    if (!(!o || t.has(o.toLowerCase())) && (t.add(o.toLowerCase()), n.push(o), n.length === cl))
      break;
  }
  return n;
}
function Vr(i, e) {
  const t = pm.has(i.toLowerCase());
  return e ? `Insert [${i}] at the cursor - a section YuE2 learned (${t ? "usually without words - an instrumental part" : "sung: its words beneath it"})` : `Insert [${i}] at the cursor - ${t ? "without words: an instrumental part" : "with words it is sung on a related section's melody, without words it is an instrumental part"}`;
}
function gm(i, e, t = i.length) {
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
const Hs = `
`;
function ru(i) {
  const e = [];
  return i.replace(/\r\n?/g, `
`).split(`
`).forEach((t, n) => {
    n > 0 && e.push(Hs), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function vm(i, e) {
  const t = ru(i), n = ru(e), s = t.length + 1, o = n.length + 1, r = new Array(s * o).fill(0);
  for (let d = t.length - 1; d >= 0; d--)
    for (let h = n.length - 1; h >= 0; h--)
      r[d * o + h] = t[d] === n[h] ? r[(d + 1) * o + h + 1] + 1 : Math.max(r[(d + 1) * o + h], r[d * o + h + 1]);
  const l = [], a = (d, h) => {
    const f = l[l.length - 1];
    f && f.op === d && h !== Hs && !f.text.endsWith(Hs) ? f.text += ` ${h}` : l.push({ op: d, text: h });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < n.length; )
    u < t.length && c < n.length && t[u] === n[c] ? (a("same", t[u]), u++, c++) : c < n.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", n[c++]) : a("removed", t[u++]);
  return l;
}
function ym(i) {
  return i.filter((e) => e.op !== "same" && e.text !== Hs).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const bm = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, km = {
  key: 0,
  class: "error"
}, wm = { key: 1 }, xm = {
  key: 0,
  class: "bad"
}, sh = /* @__PURE__ */ xt({
  __name: "LyricsFit",
  props: {
    lyrics: {},
    abc: {},
    fetcher: {},
    engine: {},
    instrumental: { type: Boolean }
  },
  setup(i) {
    const e = i, t = W(null), n = W(null);
    let s, o = 0;
    async function r() {
      const a = ++o;
      try {
        const u = await rp(e.fetcher, {
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
    Ie(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), _n(() => clearTimeout(s));
    const l = O(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", d = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: d };
      })
    );
    return (a, u) => i.abc ? (b(), w("section", bm, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      n.value ? (b(), w("p", km, I(n.value), 1)) : l.value.length ? (b(), w("table", wm, [
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
          (b(!0), w(de, null, be(l.value, (c, d) => (b(), w("tr", {
            key: d,
            class: Ne({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + I(c.tag) + "]", 1),
            p("td", null, [
              ue(I(c.score_section ?? "—"), 1),
              c.mismatch ? (b(), w("span", xm, " ≠")) : U("", !0)
            ]),
            p("td", null, I(c.lines), 1),
            p("td", null, I(c.syllables), 1),
            p("td", null, I(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: Ne({ bad: c.fit && c.fit !== "fits" })
            }, I(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : U("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : U("", !0);
  }
});
function Sm(i) {
  const e = new Set((i.elements ?? []).map((n) => n.id)), t = i.model?.tracks;
  if (t) for (const n of [...t.vocal, ...t.ins, ...t.chords]) e.add(n.id);
  return e;
}
function Cm(i, e) {
  const t = i?.model?.tracks, n = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = n.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const lu = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function hl(i, e) {
  const t = lu.indexOf(i);
  return t < 0 ? null : lu[t + e] ?? null;
}
function Mm(i, e, t) {
  const n = i.elements ?? [], s = n.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of n) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function Am(i, e) {
  const t = i.elements ?? [];
  return t.find((n) => n.source[0] <= e && e < n.source[1]) ?? t.find((n) => n.source[1] === e) ?? null;
}
function Mi(i, e) {
  return !i || !e ? null : (i.elements ?? []).find((t) => t.id === e) ?? null;
}
function Tm(i, e, t) {
  const n = Mi(i, e);
  if (!n) return null;
  const s = (i.elements ?? []).filter((r) => r.voice === n.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function $m(i, e) {
  const t = Mi(i, e);
  if (!t) return null;
  const n = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (i.elements ?? []).find(
    (s) => s.voice === n && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function Dm(i, e, t = "Vocal") {
  return (i.elements ?? []).find((n) => n.bar === e && n.voice === t) ?? null;
}
function dl(i, e) {
  const t = i.sections.findIndex((n) => n.start_bar <= e && e < n.start_bar + n.bars);
  return t < 0 ? 0 : t;
}
const Lm = {
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
function Bm(i, e = "1/16") {
  if (!i) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), n = Lm[i.units * t] ?? `${i.units} units`, s = i.kind === "note" ? `${i.name}${i.tie_out ? " (tied)" : ""}` : "rest", o = i.chord ? `, chord ${i.chord}` : "";
  return `${i.voice} bar ${i.bar}: ${s}, ${i.kind === "bar_rest" ? "whole bar" : n}${o}`;
}
function Eo(i) {
  const e = Math.max(0, i), t = Math.floor(e / 60), n = Math.floor(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
let fl = [], oh = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? oh : fl).push(t = t + i[e]);
})();
function Om(i) {
  if (i < 768) return !1;
  for (let e = 0, t = fl.length; ; ) {
    let n = e + t >> 1;
    if (i < fl[n]) t = n;
    else if (i >= oh[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function au(i) {
  return i >= 127462 && i <= 127487;
}
const uu = 8205;
function Em(i, e, t = !0, n = !0) {
  return (t ? rh : Im)(i, e, n);
}
function rh(i, e, t) {
  if (e == i.length) return e;
  e && lh(i.charCodeAt(e)) && ah(i.charCodeAt(e - 1)) && e--;
  let n = Hr(i, e);
  for (e += cu(n); e < i.length; ) {
    let s = Hr(i, e);
    if (n == uu || s == uu || t && Om(s))
      e += cu(s), n = s;
    else if (au(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && au(Hr(i, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Im(i, e, t) {
  for (; e > 1; ) {
    let n = rh(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Hr(i, e) {
  let t = i.charCodeAt(e);
  if (!ah(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return lh(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function lh(i) {
  return i >= 56320 && i < 57344;
}
function ah(i) {
  return i >= 55296 && i < 56320;
}
function cu(i) {
  return i < 65536 ? 1 : 2;
}
class Ve {
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
    [e, t] = ns(this, e, t);
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
    ), Mn.from(s, this.length - (t - e) + n.length);
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
    [e, t] = ns(this, e, t);
    let n = [];
    return this.decompose(e, t, n, 0), Mn.from(n, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Bs(this), o = new Bs(e);
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
    return new Bs(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new uh(this, e, t);
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
    return new ch(n);
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
    return e.length == 1 && !e[0] ? Ve.empty : e.length <= 32 ? new nt(e) : Mn.from(nt.split(e, []));
  }
}
class nt extends Ve {
  constructor(e, t = Rm(e)) {
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
        return new Pm(s, l, n, r);
      s = l + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let o = e <= 0 && t >= this.length ? this : new nt(hu(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = n.pop(), l = Io(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        n.push(new nt(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        n.push(new nt(l.slice(0, a)), new nt(l.slice(a)));
      }
    } else
      n.push(o);
  }
  replace(e, t, n) {
    if (!(n instanceof nt))
      return super.replace(e, t, n);
    [e, t] = ns(this, e, t);
    let s = Io(this.text, Io(n.text, hu(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return s.length <= 32 ? new nt(s, o) : Mn.from(nt.split(s, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = ns(this, e, t);
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
      n.push(o), s += o.length + 1, n.length == 32 && (t.push(new nt(n, s)), n = [], s = -1);
    return s > -1 && t.push(new nt(n, s)), t;
  }
}
class Mn extends Ve {
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
    if ([e, t] = ns(this, e, t), n.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, n), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new Mn(c, this.length - (t - e) + n.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, n);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = ns(this, e, t);
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
    if (!(e instanceof Mn))
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
      return new nt(f, t);
    }
    let s = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function d(f) {
      let m;
      if (f.lines > o && f instanceof Mn)
        for (let y of f.children)
          d(y);
      else f.lines > r && (a > r || !a) ? (h(), l.push(f)) : f instanceof nt && a && (m = c[c.length - 1]) instanceof nt && f.lines + m.lines <= 32 ? (a += f.lines, u += f.length + 1, c[c.length - 1] = new nt(m.text.concat(f.text), m.length + 1 + f.length)) : (a + f.lines > s && h(), a += f.lines, u += f.length + 1, c.push(f));
    }
    function h() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Mn.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let f of e)
      d(f);
    return h(), l.length == 1 ? l[0] : new Mn(l, t);
  }
}
Ve.empty = /* @__PURE__ */ new nt([""], 0);
function Rm(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function Io(i, e, t = 0, n = 1e9) {
  for (let s = 0, o = 0, r = !0; o < i.length && s <= n; o++) {
    let l = i[o], a = s + l.length;
    a >= t && (a > n && (l = l.slice(0, n - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function hu(i, e, t) {
  return Io(i, [""], e, t);
}
class Bs {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof nt ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, s = this.nodes[n], o = this.offsets[n], r = o >> 1, l = s instanceof nt ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof nt) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof nt ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class uh {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Bs(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
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
class ch {
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
typeof Symbol < "u" && (Ve.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Bs.prototype[Symbol.iterator] = uh.prototype[Symbol.iterator] = ch.prototype[Symbol.iterator] = function() {
  return this;
});
class Pm {
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
function ns(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function kt(i, e, t = !0, n = !0) {
  return Em(i, e, t, n);
}
function Nm(i) {
  return i >= 56320 && i < 57344;
}
function Vm(i) {
  return i >= 55296 && i < 56320;
}
function Hm(i, e) {
  let t = i.charCodeAt(e);
  if (!Vm(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return Nm(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function zm(i) {
  return i < 65536 ? 1 : 2;
}
const pl = /\r\n?|\n/;
var Rt = /* @__PURE__ */ (function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
})(Rt || (Rt = {}));
class Fn {
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
    ml(this, e, t);
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
    return new Fn(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : hh(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : gl(this, e, t);
  }
  mapPos(e, t = -1, n = Rt.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (n != Rt.Simple && u >= e && (n == Rt.TrackDel && s < e && u > e || n == Rt.TrackBefore && s < e || n == Rt.TrackAfter && u > e))
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
    return new Fn(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Fn(e);
  }
}
class ut extends Fn {
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
    return ml(this, (t, n, s, o, r) => e = e.replace(s, s + (n - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return gl(this, e, t, !0);
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
          n.push(Ve.empty);
        n.push(r ? e.slice(o, o + r) : Ve.empty);
      }
      o += r;
    }
    return new ut(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : hh(this, e, !0);
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
    return e.empty ? this : gl(this, e, t, !0);
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
    ml(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Fn.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], o = new zs(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        bt(s, c, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        bt(t, c, d), d > 0 && ii(n, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        bt(t, c, -1), bt(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new ut(t, n),
      filtered: Fn.create(s)
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
      r < t && bt(s, t - r, -1);
      let d = new ut(s, o);
      l = l ? l.compose(d.map(l)) : d, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let d of c)
          u(d);
      else if (c instanceof ut) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: d, to: h = d, insert: f } = c;
        if (d > h || d < 0 || h > t)
          throw new RangeError(`Invalid change range ${d} to ${h} (in doc of length ${t})`);
        let m = f ? typeof f == "string" ? Ve.of(f.split(n || pl)) : f : Ve.empty, y = m.length;
        if (d == h && y == 0)
          return;
        d < r && a(), d > r && bt(s, d - r, -1), bt(s, h - d, y), ii(o, s, m), r = h;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new ut(e ? [e, -1] : [], []);
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
            n.push(Ve.empty);
          n[s] = Ve.of(o.slice(1)), t.push(o[0], n[s].length);
        }
      }
    }
    return new ut(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new ut(e, t);
  }
}
function bt(i, e, t, n = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = i.length - 2;
  s >= 0 && t <= 0 && t == i[s + 1] ? i[s] += e : s >= 0 && e == 0 && i[s] == 0 ? i[s + 1] += t : n ? (i[s] += e, i[s + 1] += t) : i.push(e, t);
}
function ii(i, e, t) {
  if (t.length == 0)
    return;
  let n = e.length - 2 >> 1;
  if (n < i.length)
    i[i.length - 1] = i[i.length - 1].append(t);
  else {
    for (; i.length < n; )
      i.push(Ve.empty);
    i.push(t);
  }
}
function ml(i, e, t) {
  let n = i.inserted;
  for (let s = 0, o = 0, r = 0; r < i.sections.length; ) {
    let l = i.sections[r++], a = i.sections[r++];
    if (a < 0)
      s += l, o += l;
    else {
      let u = s, c = o, d = Ve.empty;
      for (; u += l, c += a, a && n && (d = d.append(n[r - 2 >> 1])), !(t || r == i.sections.length || i.sections[r + 1] < 0); )
        l = i.sections[r++], a = i.sections[r++];
      e(s, u, o, c, d), s = u, o = c;
    }
  }
}
function gl(i, e, t, n = !1) {
  let s = [], o = n ? [] : null, r = new zs(i), l = new zs(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      bt(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (bt(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (bt(s, 0, r.ins), o && ii(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      bt(s, u, a < r.i ? r.ins : 0), o && a < r.i && ii(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? ut.createSet(s, o) : Fn.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function hh(i, e, t = !1) {
  let n = [], s = t ? [] : null, o = new zs(i), r = new zs(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? ut.createSet(n, s) : Fn.create(n);
    if (o.ins == 0)
      bt(n, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      bt(n, 0, r.ins, l), s && ii(s, n, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = n.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          bt(n, a, c, l), s && c && ii(s, n, r.text);
        } else r.ins == -1 ? (bt(n, o.off ? 0 : o.len, a, l), s && ii(s, n, o.textBit(a))) : (bt(n, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && ii(s, n, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || n.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class zs {
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
    return t >= e.length ? Ve.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? Ve.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class ei {
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
    return this.empty ? n = s = e.mapPos(this.from, t) : (n = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), n == this.from && s == this.to ? this : new ei(n, s, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, n = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return Q.range(e, t, void 0, void 0, n);
    let s = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return Q.range(this.anchor, s, void 0, void 0, n);
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
    return Q.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new ei(e, t, n, s);
  }
}
class Q {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : Q.create(this.ranges.map((n) => n.map(e, t)), this.mainIndex);
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
    return this.ranges.length == 1 ? this : new Q([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return Q.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let n = this.ranges.slice();
    return n[t] = e, Q.create(n, this.mainIndex);
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
    return new Q(e.ranges.map((t) => ei.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new Q([Q.range(e, t)], 0);
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
        return Q.normalized(e.slice(), t);
      n = o.to;
    }
    return new Q(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, n, s) {
    return ei.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (n == null ? 7 : Math.min(6, n)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, n, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? ei.create(t, e, r | 32, n) : ei.create(e, t, r, n);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return ei.create(e, t, 64, void 0);
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
        s <= t && t--, e.splice(--s, 2, o.anchor > o.head ? Q.range(a, l) : Q.range(l, a));
      }
    }
    return new Q(e, t);
  }
}
function dh(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let ra = 0;
class pe {
  constructor(e, t, n, s, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = ra++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new pe(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : la), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Ro([], this, 0, e);
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
    return new Ro(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Ro(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function la(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class Ro {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = ra++;
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
        if (a && h.docChanged || u && (h.docChanged || h.selection) || vl(d, c)) {
          let f = n(d);
          if (l ? !du(f, d.values[r], s) : !s(f, d.values[r]))
            return d.values[r] = f, 1;
        }
        return 0;
      },
      reconfigure: (d, h) => {
        let f, m = h.config.address[o];
        if (m != null) {
          let y = Go(h, m);
          if (this.dependencies.every((v) => v instanceof pe ? h.facet(v) === d.facet(v) : v instanceof cn ? h.field(v, !1) == d.field(v, !1) : !0) || (l ? du(f = n(d), y, s) : s(f = n(d), y)))
            return d.values[r] = y, 0;
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
function du(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function vl(i, e) {
  let t = !1;
  for (let n of e)
    Os(i, n) & 1 && (t = !0);
  return t;
}
function Wm(i, e, t) {
  let n = t.map((a) => i[a.id]), s = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), r = i[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < n.length; c++) {
      let d = Go(a, n[c]);
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
        Os(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!vl(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = vl(a, n), d = u.config.facets[e.id], h = u.facet(e);
      if (d && !c && la(t, d))
        return a.values[r] = h, 0;
      let f = l(a);
      return e.compare(f, h) ? (a.values[r] = h, 0) : (a.values[r] = f, 1);
    }
  };
}
const oo = /* @__PURE__ */ pe.define({ static: !0 });
class cn {
  constructor(e, t, n, s, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new cn(ra++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(oo).find((n) => n.field == this);
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
        let o = n.facet(oo), r = s.facet(oo), l;
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
    return [this, oo.of({ field: this, create: e })];
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
const wi = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function vs(i) {
  return (e) => new fh(e, i);
}
const dr = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ vs(wi.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ vs(wi.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ vs(wi.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ vs(wi.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ vs(wi.lowest)
};
class fh {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class fr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new yl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return fr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class yl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Uo {
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
    for (let h of Fm(e, t, r))
      h instanceof cn ? s.push(h) : (o[h.facet.id] || (o[h.facet.id] = [])).push(h);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let h of s)
      l[h.id] = u.length << 1, u.push((f) => h.slot(f));
    let c = n?.config.facets;
    for (let h in o) {
      let f = o[h], m = f[0].facet, y = c && c[h] || [];
      if (f.every(
        (v) => v.type == 0
        /* Provider.Static */
      ))
        if (l[m.id] = a.length << 1 | 1, la(y, f))
          a.push(n.facet(m));
        else {
          let v = m.combine(f.map((x) => x.value));
          a.push(n && m.compare(v, n.facet(m)) ? n.facet(m) : v);
        }
      else {
        for (let v of f)
          v.type == 0 ? (l[v.id] = a.length << 1 | 1, a.push(v.value)) : (l[v.id] = u.length << 1, u.push((x) => v.dynamicSlot(x)));
        l[m.id] = u.length << 1, u.push((v) => Wm(v, m, f));
      }
    }
    let d = u.map((h) => h(l));
    return new Uo(e, r, d, l, a, o);
  }
}
function Fm(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = n[a].indexOf(r);
      u > -1 && n[a].splice(u, 1), r instanceof yl && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof yl) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof fh)
      o(r.inner, r.prec);
    else if (r instanceof cn)
      n[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof Ro)
      n[l].push(r), r.facet.extensions && o(r.facet.extensions, wi.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(i, wi.default), n.reduce((r, l) => r.concat(l));
}
function Os(i, e) {
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
function Go(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const ph = /* @__PURE__ */ pe.define(), bl = /* @__PURE__ */ pe.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), mh = /* @__PURE__ */ pe.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), gh = /* @__PURE__ */ pe.define(), vh = /* @__PURE__ */ pe.define(), yh = /* @__PURE__ */ pe.define(), bh = /* @__PURE__ */ pe.define({
  combine: (i) => i.length ? i[0] : !1
});
class fs {
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
    return new Km();
  }
}
class Km {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new fs(this, e);
  }
}
class _m {
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
    return new Ge(this, e);
  }
}
class Ge {
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
    return t === void 0 ? void 0 : t == this.value ? this : new Ge(this.type, t);
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
    return new _m(e.map || ((t) => t));
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
Ge.reconfigure = /* @__PURE__ */ Ge.define();
Ge.appendConfig = /* @__PURE__ */ Ge.define();
class wt {
  constructor(e, t, n, s, o, r) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, n && dh(n, t.newLength), o.some((l) => l.type == wt.time) || (this.annotations = o.concat(wt.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, s, o, r) {
    return new wt(e, t, n, s, o, r);
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
    let t = this.annotation(wt.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
wt.time = /* @__PURE__ */ fs.define();
wt.userEvent = /* @__PURE__ */ fs.define();
wt.addToHistory = /* @__PURE__ */ fs.define();
wt.remote = /* @__PURE__ */ fs.define();
function Um(i, e) {
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
function kh(i, e, t) {
  var n;
  let s, o, r;
  return t ? (s = e.changes, o = ut.empty(e.changes.length), r = i.changes.compose(e.changes)) : (s = e.changes.map(i.changes), o = i.changes.mapDesc(e.changes, !0), r = i.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (n = i.selection) === null || n === void 0 ? void 0 : n.map(s),
    effects: Ge.mapEffects(i.effects, s).concat(Ge.mapEffects(e.effects, o)),
    annotations: i.annotations.length ? i.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: i.scrollIntoView || e.scrollIntoView
  };
}
function kl(i, e, t) {
  let n = e.selection, s = Xi(e.annotations);
  return e.userEvent && (s = s.concat(wt.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof ut ? e.changes : ut.of(e.changes || [], t, i.facet(mh)),
    selection: n && (n instanceof Q ? n : Q.single(n.anchor, n.head)),
    effects: Xi(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function wh(i, e, t) {
  let n = kl(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    n = kh(n, kl(i, e[o], r ? n.changes.newLength : i.doc.length), r);
  }
  let s = wt.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return jm(t ? Gm(s) : s);
}
function Gm(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(gh)) {
    let o = s(i);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : Um(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = i.changes.invertedDesc, s = ut.empty(e.doc.length);
    else {
      let r = i.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    i = wt.create(e, s, i.selection && i.selection.map(o), Ge.mapEffects(i.effects, o), i.annotations, i.scrollIntoView);
  }
  let n = e.facet(vh);
  for (let s = n.length - 1; s >= 0; s--) {
    let o = n[s](i);
    o instanceof wt ? i = o : Array.isArray(o) && o.length == 1 && o[0] instanceof wt ? i = o[0] : i = wh(e, Xi(o), !1);
  }
  return i;
}
function jm(i) {
  let e = i.startState, t = e.facet(yh), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](i);
    o && Object.keys(o).length && (n = kh(n, kl(e, o, i.changes.newLength), !0));
  }
  return n == i ? i : wt.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const qm = [];
function Xi(i) {
  return i == null ? qm : Array.isArray(i) ? i : [i];
}
var Wn = /* @__PURE__ */ (function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
})(Wn || (Wn = {}));
const Ym = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let wl;
try {
  wl = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Xm(i) {
  if (wl)
    return wl.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || Ym.test(t)))
      return !0;
  }
  return !1;
}
function Jm(i) {
  return (e) => {
    if (!/\S/.test(e))
      return Wn.Space;
    if (Xm(e))
      return Wn.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return Wn.Word;
    return Wn.Other;
  };
}
class We {
  constructor(e, t, n, s, o, r) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Os(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Os(this, n), Go(this, n);
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
    return wh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let l of e.effects)
      l.is(fr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(Ge.reconfigure) ? (t = null, n = l.value) : l.is(Ge.appendConfig) && (t = null, n = Xi(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Uo.resolve(n, s, this), o = new We(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(bl) ? e.newSelection : e.newSelection.asSingle();
    new We(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: Q.cursor(t.from + e.length, -1)
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
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), o = [n.range], r = Xi(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let h = 0; h < l; h++)
        o[h] = o[h].map(c);
      let d = s.mapDesc(u, !0);
      o.push(a.range.map(d)), s = s.compose(c), r = Ge.mapEffects(r, c).concat(Ge.mapEffects(Xi(a.effects), d));
    }
    return {
      changes: s,
      selection: Q.create(o, t.mainIndex),
      effects: r
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof ut ? e : ut.of(e, this.doc.length, this.facet(We.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return Ve.of(e.split(this.facet(We.lineSeparator) || pl));
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
    return t == null ? e.default : (Os(this, t), Go(this, t));
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
        s instanceof cn && this.config.address[s.id] != null && (t[n] = s.spec.toJSON(this.field(e[n]), this));
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
    return We.create({
      doc: e.doc,
      selection: Q.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Uo.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof Ve ? e.doc : Ve.of((e.doc || "").split(t.staticFacet(We.lineSeparator) || pl)), s = e.selection ? e.selection instanceof Q ? e.selection : Q.single(e.selection.anchor, e.selection.head) : Q.single(0);
    return dh(s, n.length), t.staticFacet(bl) || (s = s.asSingle()), new We(t, n, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(We.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(We.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(bh);
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
    for (let n of this.facet(We.phrases))
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
    for (let o of this.facet(ph))
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
    return Jm(t.length ? t[0] : "");
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
      let a = kt(t, r, !1);
      if (o(t.slice(a, r)) != Wn.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = kt(t, l);
      if (o(t.slice(l, a)) != Wn.Word)
        break;
      l = a;
    }
    return r == l ? null : Q.range(r + n, l + n);
  }
}
We.allowMultipleSelections = bl;
We.tabSize = /* @__PURE__ */ pe.define({
  combine: (i) => i.length ? i[0] : 4
});
We.lineSeparator = mh;
We.readOnly = bh;
We.phrases = /* @__PURE__ */ pe.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
We.languageData = ph;
We.changeFilter = gh;
We.transactionFilter = vh;
We.transactionExtender = yh;
fr.reconfigure = /* @__PURE__ */ Ge.define();
function pr(i, e, t = {}) {
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
class Di {
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
    return xl.create(e, t, this);
  }
}
Di.prototype.startSide = Di.prototype.endSide = 0;
Di.prototype.point = !1;
Di.prototype.mapMode = Rt.TrackDel;
function aa(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let xl = class xh {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new xh(e, t, n);
  }
};
function Sl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class ua {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return Fi(this.to);
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
      let h = this.value[d], f = this.from[d] + e, m = this.to[d] + e, y, v;
      if (f == m) {
        let x = t.mapPos(f, h.startSide, h.mapMode);
        if (x == null || (y = v = x, h.startSide != h.endSide && (v = t.mapPos(f, h.endSide), v < y)))
          continue;
      } else if (y = t.mapPos(f, h.startSide), v = t.mapPos(m, h.endSide), y > v || y == v && h.startSide > 0 && h.endSide <= 0)
        continue;
      if (!((v - y || h.endSide - h.startSide) < 0))
        if (u < 0 && (u = y), h.point && (c = Math.max(c, v - y)), (y - n || h.startSide - s) >= 0)
          r.push(h), l.push(y - u), a.push(v - u), n = v, s = h.endSide;
        else {
          if (y == v)
            for (let x = r.length; x > 0; x--) {
              if ((y - (a[x - 1] + u) || h.startSide - r[x - 1].endSide) >= 0) {
                r.splice(x, 0, h), l.splice(x, 0, y - u), a.splice(x, 0, v - u);
                continue e;
              }
              if ((y - (l[x - 1] + u) || h.endSide - r[x - 1].startSide) > 0)
                break;
            }
          o(y, v, h);
        }
    }
    return { mapped: r.length ? new ua(l, a, r, c) : null, pos: u };
  }
}
class Re {
  constructor(e, t, n, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new Re(e, t, n, s);
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
    if (n && (t = t.slice().sort(Sl)), this.isEmpty)
      return t.length ? Re.of(t) : this;
    let l = new Sh(this, null, -1).goto(0), a = 0, u = [], c = new Ai();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        c.addInner(d.from, d.to, d.value, !1) || u.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(xl.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Re.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], s = -1, o, r = (a, u, c) => {
      o || (o = new Ai()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], d = e.touchesRange(u, u + c.length);
      if (d === !1)
        s = Math.max(s, c.maxPoint), t.push(c), n.push(e.mapPos(u));
      else if (d === !0) {
        let [h, f] = t.length ? [Fi(n) + Fi(t).length, Fi(Fi(t).value).endSide] : [-1, -1], { mapped: m, pos: y } = c.map(u, e, h, f, r);
        m && (s = Math.max(s, m.maxPoint), t.push(m), n.push(y));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Re(n, t, l || Re.empty, s);
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
    return Ws.from([this]).goto(e);
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
    return Ws.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, o = -1) {
    let r = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = fu(r, l, n), u = new ys(r, a, o), c = new ys(l, a, o);
    n.iterGaps((d, h, f) => pu(u, d, c, h, f, s)), n.empty && n.length == 0 && pu(u, 0, c, 0, 0, s);
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
    let l = fu(o, r), a = new ys(o, l, 0).goto(n), u = new ys(r, l, 0).goto(n);
    for (; ; ) {
      if (a.to != u.to || !Cl(a.active, u.active) || a.point && (!u.point || !aa(a.point, u.point)))
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
    let r = new ys(e, null, o).goto(t), l = t, a = r.openStart;
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
    let n = new Ai();
    for (let s of e instanceof xl ? [e] : t ? Zm(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Re.empty;
    let t = Fi(e);
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != Re.empty; s = s.nextLayer)
        t = new Re(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Re.empty = /* @__PURE__ */ new Re([], [], null, -1);
function Fi(i) {
  return i[i.length - 1];
}
function Zm(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (Sl(e, n) > 0)
        return i.slice().sort(Sl);
      e = n;
    }
  return i;
}
Re.empty.nextLayer = Re.empty;
class Ai {
  finishChunk(e) {
    this.chunks.push(new ua(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
    this.addInner(e, t, n, s) || (this.nextLayer || (this.nextLayer = new Ai())).addRange(e, t, n, s);
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
    return this.finishInner(Re.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Re.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function fu(i, e, t) {
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
class Sh {
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
class Ws {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= n && s.push(new Sh(r, t, n, o));
    return s.length == 1 ? s[0] : new Ws(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      zr(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      zr(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), zr(this.heap, 0);
    }
  }
}
function zr(i, e) {
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
class ys {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Ws.from(e, t, n);
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
    ro(this.active, e), ro(this.activeTo, e), ro(this.activeRank, e), this.minActive = mu(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    lo(this.active, t, n), lo(this.activeTo, t, s), lo(this.activeRank, t, o), e && lo(e, t, this.cursor.from), this.minActive = mu(this.active, this.activeTo);
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
        this.removeActive(s), n && ro(n, s);
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
function pu(i, e, t, n, s, o) {
  i.goto(e), t.goto(n);
  let r = n + s, l = n, a = n - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let d = i.to + a - t.to, h = d || i.endSide - t.endSide, f = h < 0 ? i.to + a : t.to, m = Math.min(f, r);
    if (i.point || t.point ? (i.point && t.point && aa(i.point, t.point) && Cl(i.activeForPoint(i.to), t.activeForPoint(t.to)) || o.comparePoint(l, m, i.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), m > l && !Cl(i.active, t.active) && o.compareRange(l, m, i.active, t.active), u && m < r && (d || i.openEnd(f) != t.openEnd(f)) && (c = !0)), f > r)
      break;
    l = f, h <= 0 && i.next(), h >= 0 && t.next();
  }
}
function Cl(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !aa(i[t], e[t]))
      return !1;
  return !0;
}
function ro(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function lo(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function mu(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function mr(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = kt(i, s));
  return n;
}
function Qm(i, e, t, n) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == i.length)
      break;
    o += i.charCodeAt(s) == 9 ? t - o % t : 1, s = kt(i, s);
  }
  return i.length;
}
const Ml = "ͼ", gu = typeof Symbol > "u" ? "__" + Ml : Symbol.for(Ml), Al = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), vu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class ri {
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
            f.split(/,\s*/).map((y) => r.map((v) => y.replace(/&/, v))).reduce((y, v) => y.concat(v)),
            m,
            a
          );
        else if (m && typeof m == "object") {
          if (!d) throw new RangeError("The value of a property (" + f + ") should be a primitive value.");
          o(s(f), m, c, h);
        } else m != null && c.push(f.replace(/_.*/, "").replace(/[A-Z]/g, (y) => "-" + y.toLowerCase()) + ": " + m + ";");
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
    let e = vu[gu] || 1;
    return vu[gu] = e + 1, Ml + e.toString(36);
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
    let s = e[Al], o = n && n.nonce;
    s ? o && s.setNonce(o) : s = new eg(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let yu = /* @__PURE__ */ new Map();
class eg {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = yu.get(n);
      if (o) return e[Al] = o;
      this.sheet = new s.CSSStyleSheet(), yu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Al] = this;
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
var li = {
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
}, Fs = {
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
}, tg = typeof navigator < "u" && /Mac/.test(navigator.platform), ng = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var mt = 0; mt < 10; mt++) li[48 + mt] = li[96 + mt] = String(mt);
for (var mt = 1; mt <= 24; mt++) li[mt + 111] = "F" + mt;
for (var mt = 65; mt <= 90; mt++)
  li[mt] = String.fromCharCode(mt + 32), Fs[mt] = String.fromCharCode(mt);
for (var Wr in li) Fs.hasOwnProperty(Wr) || (Fs[Wr] = li[Wr]);
function ig(i) {
  var e = tg && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || ng && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? Fs : li)[i.keyCode] || i.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function An() {
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
  for (; e < arguments.length; e++) Ch(i, arguments[e]);
  return i;
}
function Ch(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) Ch(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let Tt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Tl = typeof document < "u" ? document : { documentElement: { style: {} } };
const $l = /* @__PURE__ */ /Edge\/(\d+)/.exec(Tt.userAgent), Mh = /* @__PURE__ */ /MSIE \d/.test(Tt.userAgent), Dl = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Tt.userAgent), gr = !!(Mh || Dl || $l), bu = !gr && /* @__PURE__ */ /gecko\/(\d+)/i.test(Tt.userAgent), Fr = !gr && /* @__PURE__ */ /Chrome\/(\d+)/.exec(Tt.userAgent), ku = "webkitFontSmoothing" in Tl.documentElement.style, Ll = !gr && /* @__PURE__ */ /Apple Computer/.test(Tt.vendor), wu = Ll && (/* @__PURE__ */ /Mobile\/\w+/.test(Tt.userAgent) || Tt.maxTouchPoints > 2);
var le = {
  mac: wu || /* @__PURE__ */ /Mac/.test(Tt.platform),
  windows: /* @__PURE__ */ /Win/.test(Tt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(Tt.platform),
  ie: gr,
  ie_version: Mh ? Tl.documentMode || 6 : Dl ? +Dl[1] : $l ? +$l[1] : 0,
  gecko: bu,
  gecko_version: bu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  chrome: !!Fr,
  chrome_version: Fr ? +Fr[1] : 0,
  ios: wu,
  android: /* @__PURE__ */ /Android\b/.test(Tt.userAgent),
  webkit: ku,
  webkit_version: ku ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  safari: Ll,
  safari_version: Ll ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  tabSize: Tl.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function ca(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const jo = /* @__PURE__ */ Object.create(null);
function ha(i, e, t) {
  if (i == e)
    return !0;
  i || (i = jo), e || (e = jo);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (s.indexOf(o) == -1 || i[o] !== e[o]))
      return !1;
  return !0;
}
function sg(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function xu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function og(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class Zs {
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
var gt = /* @__PURE__ */ (function(i) {
  return i[i.Text = 0] = "Text", i[i.WidgetBefore = 1] = "WidgetBefore", i[i.WidgetAfter = 2] = "WidgetAfter", i[i.WidgetRange = 3] = "WidgetRange", i;
})(gt || (gt = {}));
class qe extends Di {
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
    return new Qs(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Li(e, t, t, n, e.widget || null, !1);
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
      let { start: o, end: r } = Ah(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Li(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new eo(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Re.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
qe.none = Re.empty;
class Qs extends qe {
  constructor(e) {
    let { start: t, end: n } = Ah(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? ca(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || jo;
  }
  eq(e) {
    return this == e || e instanceof Qs && this.tagName == e.tagName && ha(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Qs.prototype.point = !1;
class eo extends qe {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof eo && this.spec.class == e.spec.class && ha(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
eo.prototype.mapMode = Rt.TrackBefore;
eo.prototype.point = !0;
class Li extends qe {
  constructor(e, t, n, s, o, r) {
    super(t, n, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? Rt.TrackBefore : Rt.TrackAfter : Rt.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? gt.WidgetRange : this.startSide <= 0 ? gt.WidgetBefore : gt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Li && rg(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Li.prototype.point = !0;
function Ah(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function rg(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function Ji(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Ks extends Di {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof Ks && this.tagName == e.tagName && ha(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Ks(e.tagName, e.attributes || jo, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Re.of(e, t);
  }
}
Ks.prototype.startSide = Ks.prototype.endSide = -1;
function _s(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Bl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Es(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Bl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function Po(i) {
  return i.nodeType == 3 ? Us(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Is(i, e, t, n) {
  return t ? Su(i, e, t, n, -1) || Su(i, e, t, n, 1) : !1;
}
function ai(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function qo(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function Su(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : Un(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let o = i.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ai(i) + (s < 0 ? 0 : 1), i = o;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? Un(i) : 0;
    } else
      return !1;
  }
}
function Un(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function Yo(i, e) {
  let { left: t, right: n } = i;
  if (t == n)
    return i;
  let s = e ? t : n;
  return { left: s, right: s, top: i.top, bottom: i.bottom };
}
function lg(i) {
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
function Th(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function ag(i, e, t, n, s, o, r, l) {
  let a = i.ownerDocument, u = a.defaultView || window;
  for (let c = i, d = !1; c && !d; )
    if (c.nodeType == 1) {
      let h, f = c == a.body, m = 1, y = 1;
      if (f)
        h = lg(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (d = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let S = c.getBoundingClientRect();
        ({ scaleX: m, scaleY: y } = Th(c, S)), h = {
          left: S.left,
          right: S.left + c.clientWidth * m,
          top: S.top,
          bottom: S.top + c.clientHeight * y
        };
      }
      let v = 0, x = 0;
      if (s == "nearest")
        e.top < h.top + r ? (x = e.top - (h.top + r), t > 0 && e.bottom > h.bottom + x && (x = e.bottom - h.bottom + r)) : e.bottom > h.bottom - r && (x = e.bottom - h.bottom + r, t < 0 && e.top - x < h.top && (x = e.top - (h.top + r)));
      else {
        let S = e.bottom - e.top, $ = h.bottom - h.top;
        x = (s == "center" && S <= $ ? e.top + S / 2 - $ / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - $ + r) - h.top;
      }
      if (n == "nearest" ? e.left < h.left + o ? (v = e.left - (h.left + o), t > 0 && e.right > h.right + v && (v = e.right - h.right + o)) : e.right > h.right - o && (v = e.right - h.right + o, t < 0 && e.left < h.left + v && (v = e.left - (h.left + o))) : v = (n == "center" ? e.left + (e.right - e.left) / 2 - (h.right - h.left) / 2 : n == "start" == l ? e.left - o : e.right - (h.right - h.left) + o) - h.left, v || x)
        if (f)
          u.scrollBy(v, x);
        else {
          let S = 0, $ = 0;
          if (x) {
            let N = c.scrollTop;
            c.scrollTop += x / y, $ = (c.scrollTop - N) * y;
          }
          if (v) {
            let N = c.scrollLeft;
            c.scrollLeft += v / m, S = (c.scrollLeft - N) * m;
          }
          e = {
            left: e.left - S,
            top: e.top - $,
            right: e.right - S,
            bottom: e.bottom - $
          }, S && Math.abs(S - v) < 1 && (n = "nearest"), $ && Math.abs($ - x) < 1 && (s = "nearest");
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
function $h(i, e = !0) {
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
class ug {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Un(t) : 0), n, Math.min(e.focusOffset, n ? Un(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
function Dh(i) {
  let e = [];
  for (let t = i; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Lh(i, e = !0) {
  for (let { node: t, left: n, top: s } of i)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != n && (t.scrollLeft = n);
}
let bi = null;
le.safari && le.safari_version >= 26 && (bi = !1);
function Bh(i) {
  if (i.setActive)
    return i.setActive();
  if (bi)
    return i.focus(bi);
  let e = Dh(i);
  i.focus(bi == null ? {
    get preventScroll() {
      return bi = { preventScroll: !0 }, !0;
    }
  } : void 0), bi || (bi = !1, Lh(e));
}
let Cu;
function Us(i, e, t = e) {
  let n = Cu || (Cu = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function Zi(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, i.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, i.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function cg(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function hg(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, Un(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = Un(t));
    } else {
      if (t == i)
        return !0;
      n = ai(t), t = t.parentNode;
    }
}
function Oh(i) {
  return i instanceof Window ? i.pageYOffset > Math.max(0, i.document.documentElement.scrollHeight - i.innerHeight - 4) : i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function Eh(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = Un(t);
    } else if (t.parentNode && !qo(t))
      n = ai(t), t = t.parentNode;
    else
      return null;
  }
}
function Ih(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !qo(t))
      n = ai(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class on {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new on(e.parentNode, ai(e), t);
  }
  static after(e, t) {
    return new on(e.parentNode, ai(e) + 1, t);
  }
}
var je = /* @__PURE__ */ (function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
})(je || (je = {}));
const Bi = je.LTR, da = je.RTL;
function Rh(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const dg = /* @__PURE__ */ Rh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), fg = /* @__PURE__ */ Rh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Ol = /* @__PURE__ */ Object.create(null), yn = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  Ol[e] = t, Ol[t] = -e;
}
function Ph(i) {
  return i <= 247 ? dg[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? fg[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const pg = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class $n {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? da : Bi;
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
function Nh(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !Nh(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const _e = [];
function mg(i, e, t, n, s) {
  for (let o = 0; o <= n.length; o++) {
    let r = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Ph(i.charCodeAt(u));
      h == 512 ? h = c : h == 8 && d == 4 && (h = 16), _e[u] = h == 4 ? 2 : h, h & 7 && (d = h), c = h;
    }
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = _e[u];
      if (h == 128)
        u < l - 1 && c == _e[u + 1] && c & 24 ? h = _e[u] = c : _e[u] = 256;
      else if (h == 64) {
        let f = u + 1;
        for (; f < l && _e[f] == 64; )
          f++;
        let m = u && c == 8 || f < t && _e[f] == 8 ? d == 1 ? 1 : 8 : 256;
        for (let y = u; y < f; y++)
          _e[y] = m;
        u = f - 1;
      } else h == 8 && d == 1 && (_e[u] = 1);
      c = h, h & 7 && (d = h);
    }
  }
}
function gg(i, e, t, n, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= n.length; r++) {
    let u = r ? n[r - 1].to : e, c = r < n.length ? n[r].from : t;
    for (let d = u, h, f, m; d < c; d++)
      if (f = Ol[h = i.charCodeAt(d)])
        if (f < 0) {
          for (let y = l - 3; y >= 0; y -= 3)
            if (yn[y + 1] == -f) {
              let v = yn[y + 2], x = v & 2 ? s : v & 4 ? v & 1 ? o : s : 0;
              x && (_e[d] = _e[yn[y]] = x), l = y;
              break;
            }
        } else {
          if (yn.length == 189)
            break;
          yn[l++] = d, yn[l++] = h, yn[l++] = a;
        }
      else if ((m = _e[d]) == 2 || m == 1) {
        let y = m == s;
        a = y ? 0 : 1;
        for (let v = l - 3; v >= 0; v -= 3) {
          let x = yn[v + 2];
          if (x & 2)
            break;
          if (y)
            yn[v + 2] |= 2;
          else {
            if (x & 4)
              break;
            yn[v + 2] |= 4;
          }
        }
      }
  }
}
function vg(i, e, t, n) {
  for (let s = 0, o = n; s <= t.length; s++) {
    let r = s ? t[s - 1].to : i, l = s < t.length ? t[s].from : e;
    for (let a = r; a < l; ) {
      let u = _e[a];
      if (u == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (s == t.length)
              break;
            c = t[s++].to, l = s < t.length ? t[s].from : e;
          } else if (_e[c] == 256)
            c++;
          else
            break;
        let d = o == 1, h = (c < e ? _e[c] : n) == 1, f = d == h ? d ? 1 : 2 : n;
        for (let m = c, y = s, v = y ? t[y - 1].to : i; m > a; )
          m == v && (m = t[--y].from, v = y ? t[y - 1].to : i), _e[--m] = f;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function El(i, e, t, n, s, o, r) {
  let l = n % 2 ? 2 : 1;
  if (n % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, d = !1;
      if (u == o.length || a < o[u].from) {
        let y = _e[a];
        y != l && (c = !1, d = y == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u < o.length && m == o[u].from) {
          if (d)
            break e;
          let y = o[u];
          if (!c)
            for (let v = y.to, x = u + 1; ; ) {
              if (v == t)
                break e;
              if (x < o.length && o[x].from == v)
                v = o[x++].to;
              else {
                if (_e[v] == l)
                  break e;
                break;
              }
            }
          if (u++, h)
            h.push(y);
          else {
            y.from > a && r.push(new $n(a, y.from, f));
            let v = y.direction == Bi != !(f % 2);
            Il(i, v ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.to;
          }
          m = y.to;
        } else {
          if (m == t || (c ? _e[m] != l : _e[m] == l))
            break;
          m++;
        }
      h ? El(i, a, m, n + 1, s, h, r) : a < m && r.push(new $n(a, m, f)), a = m;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, d = !1;
      if (!u || a > o[u - 1].to) {
        let y = _e[a - 1];
        y != l && (c = !1, d = y == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u && m == o[u - 1].to) {
          if (d)
            break e;
          let y = o[--u];
          if (!c)
            for (let v = y.from, x = u; ; ) {
              if (v == e)
                break e;
              if (x && o[x - 1].to == v)
                v = o[--x].from;
              else {
                if (_e[v - 1] == l)
                  break e;
                break;
              }
            }
          if (h)
            h.push(y);
          else {
            y.to < a && r.push(new $n(y.to, a, f));
            let v = y.direction == Bi != !(f % 2);
            Il(i, v ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.from;
          }
          m = y.from;
        } else {
          if (m == e || (c ? _e[m - 1] != l : _e[m - 1] == l))
            break;
          m--;
        }
      h ? El(i, m, a, n + 1, s, h, r) : m < a && r.push(new $n(m, a, f)), a = m;
    }
}
function Il(i, e, t, n, s, o, r) {
  let l = e % 2 ? 2 : 1;
  mg(i, s, o, n, l), gg(i, s, o, n, l), vg(s, o, n, l), El(i, s, o, e, t, n, r);
}
function yg(i, e, t) {
  if (!i)
    return [new $n(0, 0, e == da ? 1 : 0)];
  if (e == Bi && !t.length && !pg.test(i))
    return Vh(i.length);
  if (t.length)
    for (; i.length > _e.length; )
      _e[_e.length] = 256;
  let n = [], s = e == Bi ? 0 : 1;
  return Il(i, s, s, t, 0, i.length, n), n;
}
function Vh(i) {
  return [new $n(0, i, 0)];
}
let Hh = "";
function bg(i, e, t, n, s) {
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
    l = $n.find(e, r, (o = n.bidiLevel) !== null && o !== void 0 ? o : -1, n.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let h = l += s ? 1 : -1;
    if (h < 0 || h >= e.length)
      return null;
    a = e[l = h], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = kt(i.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Hh = i.text.slice(Math.min(r, c), Math.max(r, c));
  let d = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!d)
      return s ? Q.cursor(i.to, 1) : Q.cursor(i.from, -1);
    if (d.level + (s ? 0 : 1) < a.level)
      return Q.cursor(d.side(!s, t) + i.from, d.forward(s, t) ? 1 : -1, d.level);
  }
  return Q.cursor(c + i.from, a.forward(s, t) ? -1 : 1, a.level);
}
function kg(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Ph(i.charCodeAt(n));
    if (s == 1)
      return Bi;
    if (s == 2 || s == 4)
      return da;
  }
  return Bi;
}
const zh = /* @__PURE__ */ pe.define(), Wh = /* @__PURE__ */ pe.define(), Fh = /* @__PURE__ */ pe.define(), Kh = /* @__PURE__ */ pe.define(), Rl = /* @__PURE__ */ pe.define(), _h = /* @__PURE__ */ pe.define(), Uh = /* @__PURE__ */ pe.define(), fa = /* @__PURE__ */ pe.define(), pa = /* @__PURE__ */ pe.define(), Gh = /* @__PURE__ */ pe.define({
  combine: (i) => i.some((e) => e)
}), jh = /* @__PURE__ */ pe.define({
  combine: (i) => i.some((e) => e)
}), qh = /* @__PURE__ */ pe.define();
class Qi {
  constructor(e, t, n, s, o, r = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new Qi(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Qi(Q.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const ao = /* @__PURE__ */ Ge.define({ map: (i, e) => i.map(e) }), Yh = /* @__PURE__ */ Ge.define();
function rn(i, e, t) {
  let n = i.facet(Kh);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const Hn = /* @__PURE__ */ pe.define({ combine: (i) => i.length ? i[0] : !0 });
let wg = 0;
const _i = /* @__PURE__ */ pe.define({
  combine(i) {
    return i.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (i[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class Wt {
  constructor(e, t, n, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(_i.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(_i.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: o, decorations: r } = t || {};
    return new Wt(wg++, e, n, s, (l) => {
      let a = [];
      return r && a.push(vr.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : qe.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return Wt.define((n, s) => new e(n, s), t);
  }
}
class Kr {
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
            if (rn(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
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
        rn(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        rn(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Xh = /* @__PURE__ */ pe.define(), ma = /* @__PURE__ */ pe.define(), vr = /* @__PURE__ */ pe.define(), Jh = /* @__PURE__ */ pe.define(), ga = /* @__PURE__ */ pe.define(), to = /* @__PURE__ */ pe.define(), Zh = /* @__PURE__ */ pe.define();
function Mu(i, e) {
  let t = i.state.facet(Zh);
  if (!t.length)
    return t;
  let n = t.map((o) => o instanceof Function ? o(i) : o), s = [];
  return Re.spans(n, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, d = s;
      for (let h = l.length - 1; h >= 0; h--, a--) {
        let f = l[h].spec.bidiIsolate, m;
        if (f == null && (f = kg(e.text, u, c)), a > 0 && d.length && (m = d[d.length - 1]).to == u && m.direction == f)
          m.to = c, d = m.inner;
        else {
          let y = { from: u, to: c, direction: f, inner: [] };
          d.push(y), d = y.inner;
        }
      }
    }
  }), s;
}
const Qh = /* @__PURE__ */ pe.define();
function va(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let o of i.state.facet(Qh)) {
    let r = o(i);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (n = Math.max(n, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const As = /* @__PURE__ */ pe.define();
class Xt {
  constructor(e, t, n, s) {
    this.fromA = e, this.toA = t, this.fromB = n, this.toB = s;
  }
  join(e) {
    return new Xt(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
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
      n.push(new Xt(c, h, u, d));
    }
    return n;
  }
}
class Xo {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = ut.empty(this.startState.doc.length);
    for (let o of n)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Xt(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Xo(e, t, n);
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
const xg = [];
class tt {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return xg;
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
      t && sg(this.dom, t);
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
    let n = ai(this.dom), s = this.length ? e > 0 : t > 0;
    return new on(this.parent.dom, n + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof br)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class yr extends tt {
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
          s = Au(s);
      else
        t.insertBefore(l.dom, s);
      n = l.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = Au(s);
    this.length = r;
  }
}
function Au(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class br extends yr {
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
      let t = tt.get(e);
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
class Kn extends yr {
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
class is extends yr {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new is(t || document.createElement("div"), e);
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
        let m = c.children[h], y = f + m.length;
        y >= d && (m.isComposite() ? a(m, d - f) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || n && Cg(r, m))) && (y > d || m.flags & 32 && t <= 1) ? (r = m, l = d - f) : (f < d || m.flags & 16 && !m.isHidden && t >= -1) && (s = m, o = d - f)), f = y;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, n) : Sg(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: s, offset: o } = n;
      if (this.dom.contains(s.dom))
        return s.isText() ? new on(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = n.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new on(a.dom, 0);
        a == n.tile && (l = !0);
      }
    }
    return new on(this.dom, 0);
  }
}
function Sg(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = Po(e);
  return t[t.length - 1] || null;
}
function Cg(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Pt extends yr {
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
class Si extends tt {
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
    e == 0 && t < 0 || e == s && t >= 0 ? le.chrome || le.gecko || (e ? (o--, l = 1) : r < s && (r++, l = -1)) : t < 0 ? o-- : r < s && r++;
    let a = Us(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return le.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), n == null ? u : Yo(u, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new Si(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class Oi extends tt {
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
      return Yo(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return Yo(r, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return Ve.empty;
    let { root: e } = this;
    if (!e)
      return Ve.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, n, s, o) {
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Oi(o, n, e, s);
  }
}
class Jo extends tt {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return Ve.empty;
  }
  coordsIn(e, t, n) {
    let s = this.dom.getBoundingClientRect();
    return n == null ? s : Yo(s, t > 0 == n);
  }
}
class Mg {
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
class Ag {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class Tg {
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
      let a = r.children[r.children.length - 1] = new Si(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || Si.of(e, (o = this.cache.find(Si)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? _r(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof Pt && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(_r(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && tt.get(a.dom) && (c = _r(a.dom));
        let d = Pt.of(a.mark, c);
        s.append(d), s = d;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = tt.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new Si(e.text, e.text.nodeValue);
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
    e || (e = ed);
    let s = is.start(e, t || ((n = this.cache.find(is)) === null || n === void 0 ? void 0 : n.dom), !!t);
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
      (!e || !Tu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(le.ios && Tu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        Ur,
        0,
        32
        /* TileFlag.After */
      ) || new Oi(
        Ur.toDOM(),
        0,
        Ur,
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
        let t = e.rank * 102 + e.value.rank, n = new Ag(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      Jo,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new Jo(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class $g {
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
const Zo = [Oi, is, Si, Pt, Jo, Kn, br];
for (let i = 0; i < Zo.length; i++)
  Zo[i].bucket = i;
class Dg {
  constructor(e) {
    this.view = e, this.buckets = Zo.map(() => []), this.index = Zo.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
          ), new Oi(l.dom, t, e, l.flags & -498 | n));
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
class Lg {
  constructor(e, t, n, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Dg(e), this.text = new $g(e.state.doc), this.builder = new Tg(this.cache, new br(e, e.contentDOM), Re.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Mg(t), this.reuseWalker = {
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
    let s = Eg(this.old), o = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Oi.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof Jo)
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
    let n = null, s = this.builder, o = -1, r = Re.spans(this.decorations, e, t, {
      point: (l, a, u, c, d, h) => {
        if (u instanceof Li) {
          if (this.disallowBlockEffectsFor[h]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, d > c.length)
            s.continueWidget(a - l);
          else {
            let f = u.widget || (u.block ? ss.block : ss.inline), m = Bg(u), y = this.cache.findWidget(f, a - l, m) || Oi.of(f, this.view, a - l, m);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(y)) : (s.ensureLine(n), s.addInlineWidget(y, c, d));
          }
          n = null;
        } else
          n = Og(n, u);
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
      let o = tt.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof Pt ? t.push(o) : o?.isLine() ? n = o : o instanceof Kn || (s.nodeName == "DIV" && !n ? n = new is(s, ed) : n || t.push(Pt.of(new Qs({ tagName: s.nodeName.toLowerCase(), attributes: og(s) }), s)));
    }
    return n ? { line: n, marks: t } : null;
  }
}
function Tu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function Bg(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const ed = { class: "cm-line" };
function Og(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && ca(t, i), n && (i.class += " " + n)), i;
}
function Eg(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Pt && e.push(n.mark);
  }
  return e;
}
function _r(i) {
  let e = tt.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class ss extends Zs {
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
ss.inline = /* @__PURE__ */ new ss("span");
ss.block = /* @__PURE__ */ new ss("div");
const Ur = /* @__PURE__ */ new class extends Zs {
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
class $u {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = qe.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new br(e, e.contentDOM), this.updateInner([new Xt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: d }) => d < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Fg(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Rg(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: d } = this.hasComposition;
      n = new Xt(c, d, e.changes.mapPos(c, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (le.ie || le.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Vg(r, this.decorations, e.changes);
    a.length && (n = Xt.extendWithRanges(n, a));
    let u = zg(l, this.blockWrappers, e.changes);
    return u.length && (n = Xt.extendWithRanges(n, u)), o && !n.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new Lg(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && tt.get(t.text) && l.cache.reused.set(
          tt.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), Pl(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = le.chrome || le.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Gr && s.push(o.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(Yh) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, o = s == n, r = !o && !(this.view.state.facet(Hn) || n.tabIndex > -1) && Es(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), le.gecko && a.empty && !this.hasComposition && Ig(u)) {
      let h = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(h, u.node.childNodes[u.offset] || null)), u = c = new on(h, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Is(u.node, u.offset, d.anchorNode, d.anchorOffset) || !Is(c.node, c.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      le.android && le.chrome && n.contains(d.focusNode) && Wg(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let h = _s(this.view.root);
      if (h) if (a.empty) {
        if (le.gecko) {
          let f = Pg(u.node, u.offset);
          if (f && f != 3) {
            let m = (f == 1 ? Eh : Ih)(u.node, u.offset);
            m && (u = new on(m.node, m.offset));
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
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new on(d.anchorNode, d.anchorOffset), this.impreciseHead = c.precise ? null : new on(d.focusNode, d.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Is(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = _s(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = Un(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
      for (; o && !tt.get(o); )
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
    return s.isWidget() ? s.widget instanceof Gr ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, n);
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
        let l = kt(o.text, r);
        if (l == r)
          return null;
        let a = Us(o.dom, r, l).getClientRects();
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
    let t = [], { from: n, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == je.LTR, u = 0, c = (d, h, f) => {
      for (let m = 0; m < d.children.length && !(h > s); m++) {
        let y = d.children[m], v = h + y.length, x = y.dom.getBoundingClientRect(), { height: S } = x;
        if (f && !m && (u += x.top - f.top), y instanceof Kn)
          v > n && c(y, h, x);
        else if (h >= n && (u > 0 && t.push(-u), t.push(S + u), u = 0, r)) {
          let $ = y.dom.lastChild, N = $ ? Po($) : [];
          if (N.length) {
            let P = N[N.length - 1], z = a ? P.right - x.left : x.right - P.left;
            z > l && (l = z, this.minWidth = o, this.minWidthFrom = h, this.minWidthTo = v);
          }
        }
        f && m == d.children.length - 1 && (u += f.bottom - x.bottom), h = v + y.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? je.RTL : je.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = Po(u.dom);
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
      let r = Po(t.firstChild)[0];
      n = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : n, t.remove();
    }), { lineHeight: n, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let n = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > n) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(n).top) / this.view.scaleY;
        e.push(qe.replace({
          widget: new Gr(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(n, r));
      }
      if (!o)
        break;
      n = o.to + 1;
    }
    return qe.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(vr).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, s = this.view.state.facet(ga).map((o, r) => {
      let l = typeof o == "function";
      return l && (n = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = n, t.push(Re.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Jh).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(qh))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        rn(this.view.state, c, "scroll handler");
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
    let o = va(this.view), r = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (ag(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == je.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Dh(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), Lh(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    Pl(this.tile);
  }
}
function Pl(i, e) {
  let t = e?.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      Pl(n, e);
  }
}
function Ig(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function td(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = Eh(t.focusNode, t.focusOffset), s = Ih(t.focusNode, t.focusOffset), o = n || s;
  if (s && n && s.node != n.node) {
    let l = tt.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (i.docView.lastCompositionAfterCursor) {
      let a = tt.get(n.node);
      !a || a.isText() && a.text != n.node.nodeValue || (o = s);
    }
  }
  if (i.docView.lastCompositionAfterCursor = o != n, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Rg(i, e, t) {
  let n = td(i, t);
  if (!n)
    return null;
  let { node: s, from: o, to: r } = n, l = s.nodeValue;
  if (/[\n\r]/.test(l) || i.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Xt(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Pg(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Ng = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Ji(e, t, this.changes);
  }
  comparePoint(e, t) {
    Ji(e, t, this.changes);
  }
  boundChange(e) {
    Ji(e, e, this.changes);
  }
};
function Vg(i, e, t) {
  let n = new Ng();
  return Re.compare(i, e, t, n), n.changes;
}
class Hg {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Ji(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    Ji(e, e, this.changes);
  }
}
function zg(i, e, t) {
  let n = new Hg();
  return Re.compare(i, e, t, n), n.changes;
}
function Wg(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Fg(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Gr extends Zs {
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
function Kg(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return Q.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = kt(s.text, o, !1) : l = kt(s.text, o);
  let a = n(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = kt(s.text, r, !1);
    if (n(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = kt(s.text, l);
    if (n(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return Q.undirectionalRange(r + s.from, l + s.from);
}
function _g(i, e, t, n, s) {
  let o = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let l = i.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (i.defaultLineHeight - l) * 0.5) / l);
    o += a * i.viewState.heightOracle.lineLength;
  }
  let r = i.state.sliceDoc(t.from, t.to);
  return t.from + Qm(r, o, i.state.tabSize);
}
function Nl(i, e, t) {
  let n = i.lineBlockAt(e);
  if (Array.isArray(n.type)) {
    let s;
    for (let o of n.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == gt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || n;
  }
  return n;
}
function Ug(i, e, t, n) {
  let s = Nl(i, e.head, e.assoc || -1), o = !n || s.type != gt.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = i.dom.getBoundingClientRect(), l = i.textDirectionAt(s.from), a = i.posAtCoords({
      x: t == (l == je.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return Q.cursor(a, t ? -1 : 1);
  }
  return Q.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function Du(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), o = i.bidiSpans(s), r = i.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = bg(s, o, r, l, t), c = Hh;
    if (!u) {
      if (s.number == (t ? i.state.doc.lines : 1))
        return l;
      c = `
`, s = i.state.doc.line(s.number + (t ? 1 : -1)), o = i.bidiSpans(s), u = t ? Q.cursor(s.from, -1) : Q.cursor(s.to, 1);
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
function Gg(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (o) => {
    let r = n(o);
    return s == Wn.Space && (s = r), s == r;
  };
}
function jg(i, e, t, n) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? i.state.doc.length : 0))
    return Q.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = i.contentDOM.getBoundingClientRect(), u = i.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = i.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let m = i.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, i.defaultCharacterWidth * (s - m.from))), l = (o < 0 ? m.top : m.bottom) + c;
  }
  let d = a.left + r, h = i.viewState.heightOracle.textHeight >> 1, f = n ?? h;
  for (let m = 0; ; m += h) {
    let y = l + (f + m) * o, v = Vl(i, { x: d, y }, !1, o);
    if (t ? y > a.bottom : y < a.top)
      return Q.cursor(v.pos, v.assoc);
    let x = i.coordsAtPos(v.pos, v.assoc), S = x ? (x.top + x.bottom) / 2 : 0;
    if (!x || (t ? S > l : S < l))
      return Q.cursor(v.pos, v.assoc, void 0, r);
  }
}
function Rs(i, e, t) {
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
function nd(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], o = null;
    if (s.empty) {
      let r = Rs(i, s.from, 0);
      r != s.from && (o = Q.cursor(r, -1));
    } else {
      let r = Rs(i, s.from, -1), l = Rs(i, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = Q.undirectionalRange(s.from, s.to) : o = Q.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? Q.create(t, e.mainIndex) : e;
}
function jr(i, e, t) {
  let n = Rs(i.state.facet(to).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : Q.cursor(n, n < t.from ? 1 : -1);
}
class Tn {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Vl(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), o = s.top + i.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new Tn(0, 1);
    if (a > i.viewState.docHeight)
      return new Tn(i.state.doc.length, -1);
    if (u = i.elementAtHeight(a), n == null)
      break;
    if (u.type == gt.Text) {
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
    if (u.type == gt.Text) {
      let d = _g(i, s, u, r, l);
      return new Tn(d, d == u.from ? 1 : -1);
    }
  }
  if (u.type != gt.Text)
    return a < (u.top + u.bottom) / 2 ? new Tn(u.from, 1) : new Tn(u.to, -1);
  let c = i.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = i.docView.lineAt(u.from, -2)), new qg(i, r, l, i.textDirectionAt(u.from)).scanTile(c, u.from);
}
class qg {
  constructor(e, t, n, s) {
    this.view = e, this.x = t, this.y = n, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[$n.find(s, e - n.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[$n.find(s, e - n.from, -1, t)].dir;
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
      let m = o - s, y = s + o >> 1;
      t: if (r.has(y)) {
        for (let S = 1; S < m; S++) {
          let $ = y + S;
          if ($ >= o && ($ -= m), !r.has($)) {
            y = $;
            break t;
          }
        }
        break e;
      }
      r.add(y);
      let v = t(y), x = 0;
      if (v)
        for (let S = 0; S < v.length; S++) {
          let $ = v[S];
          if (!($.width == 0 && v.length > 1))
            if ($.bottom < this.y)
              (!a || a.bottom < $.bottom) && (a = $), x = 1;
            else if ($.top > this.y)
              (!u || u.top > $.top) && (u = $), x = -1;
            else {
              let N = $.left > this.x ? this.x - $.left : $.right < this.x ? this.x - $.right : 0, P = Math.abs(N);
              P < d && (c = y, d = P, h = $), N && (x = N < 0 == (this.baseDir == je.LTR) ? -1 : 1);
            }
        }
      x == -1 && (!l || this.baseDirAt(e[y], 1)) ? o = y : x == 1 && (!l || this.baseDirAt(e[y + 1], -1)) && (s = y + 1);
    }
    if (!h) {
      if (!u && !a)
        return { i: 0, after: !1 };
      let m = a && (!u || this.y - a.bottom < u.top - this.y) ? a : u;
      return this.y = (m.top + m.bottom) / 2, this.scan(e, t, !0);
    }
    if (d && !n) {
      let { top: m, bottom: y } = h;
      if (a && a.bottom > (m + m + y) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (u && u.top < (m + y + y) / 3)
        return this.y = u.top + 1, this.scan(e, t, !0);
    }
    let f = (l ? this.dirAt(e[c], 1) : this.baseDir) == je.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (h.left + h.right) / 2 == f
    };
  }
  scanText(e, t) {
    let n = [];
    for (let o = 0; o < e.length; o = kt(e.text, o))
      n.push(t + o);
    n.push(t + e.length);
    let s = this.scan(n, (o) => {
      let r = n[o] - t, l = n[o + 1] - t;
      return Us(e.dom, r, l).getClientRects();
    });
    return s.after ? new Tn(n[s.i + 1], -1) : new Tn(n[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new Tn(t, 1);
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : Us(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = n[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new Tn(n[s.i + 1], -1) : new Tn(r, 1);
  }
}
const Ki = "￿";
class Yg {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(We.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Ki;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(n, s);
      let o = this.text.length;
      this.readNode(s);
      let r = tt.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = tt.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : qo(s)) || qo(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !Jg(l, t) && this.lineBreak(), s = l;
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
    let t = tt.get(e), n = t && t.overrideDOMText;
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
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (Xg(e, n.node, n.offset) ? t : 0));
  }
}
function Xg(i, e, t) {
  for (; ; ) {
    if (!e || t < Un(e))
      return !1;
    if (e == i)
      return !0;
    t = ai(e) + 1, e = e.parentNode;
  }
}
function Jg(i, e) {
  let t;
  for (; !(i == e || !i); i = i.nextSibling) {
    let n = tt.get(i);
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
class Lu {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Zg {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = id(e.docView.tile, t, n, 0))) {
      let a = o || r ? [] : ev(e), u = new Yg(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = tv(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Bl(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Bl(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((le.ios || le.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let h = Math.min(u, c), f = Math.max(u, c), m = d.from - h, y = d.to - f;
        (m == 0 || m == 1 || h == 0) && (y == 0 || y == -1 || f == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(Q.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let h = e.coordsAtPos(u, -1), f = 0;
        h && (f = e.inputState.lastTouchY <= h.bottom ? -1 : 1), this.newSel = Q.create([Q.cursor(u, f)]);
      } else
        this.newSel = Q.single(c, u);
    }
  }
}
function id(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = n, c = n; a < i.children.length; a++) {
      let d = i.children[a], h = u + d.length;
      if (u < e && h > t)
        return id(d, e, t, u);
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
function sd(i, e) {
  let t, { newSel: n } = e, { state: s } = i, o = s.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || le.android && e.text.length < a - l) && (u = o.to, c = "end");
    let d = s.doc.sliceString(l, a, Ki), h, f;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(h = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: Ve.of(e.text.slice(o.from - l, h).split(Ki))
    } : (f = od(d, e.text, u - l, c)) && (le.chrome && r == 13 && f.toB == f.from + 2 && e.text.slice(f.from, f.toB) == Ki + Ki && f.toB--, t = {
      from: l + f.from,
      to: l + f.toA,
      insert: Ve.of(e.text.slice(f.from, f.toB).split(Ki))
    });
  } else n && (!i.hasFocus && s.facet(Hn) || Qo(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((le.mac || le.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = Q.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: Ve.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && i.docView.lineHasWidget(o.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(i.inputState.insertingText)
  } : le.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = Q.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: Ve.of([" "]) }), t)
    return ya(i, t, n, r);
  if (n && !Qo(n, o)) {
    let l = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (l = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = nd(s.facet(to).map((u) => u(i)), n))), i.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function ya(i, e, t, n = -1) {
  if (le.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (le.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Zi(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && Zi(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && Zi(i.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let r, l = () => r || (r = Qg(i, e, t));
  return i.state.facet(_h).some((a) => a(i, e.from, e.to, o, l)) || i.dispatch(l()), !0;
}
function Qg(i, e, t) {
  let n, s = i.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Rs(s.facet(to).map((d) => d(i)), u, a);
    e.from == c && (r = c);
  }
  if (r > -1)
    n = {
      changes: e,
      selection: Q.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && i.inputState.composing < 0) {
    let a = o.from < e.from ? s.sliceDoc(o.from, e.from) : "", u = o.to > e.to ? s.sliceDoc(e.to, o.to) : "";
    n = s.replaceSelection(i.state.toText(a + e.insert.sliceString(0, void 0, i.state.lineBreak) + u));
  } else {
    let a = s.changes(e), u = t && t.main.to <= a.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (i.inputState.composing >= 0 || i.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let c = i.state.sliceDoc(e.from, e.to), d, h = t && td(i, t.main.head);
      if (h) {
        let m = e.insert.length - (e.to - e.from);
        d = { from: h.from, to: h.to - m };
      } else
        d = i.state.doc.lineAt(o.head);
      let f = o.to - e.to;
      n = s.changeByRange((m) => {
        if (m.from == o.from && m.to == o.to)
          return { changes: a, range: u || m.map(a) };
        let y = m.to - f, v = y - c.length;
        if (i.state.sliceDoc(v, y) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        y >= d.from && v <= d.to)
          return { range: m };
        let x = s.changes({ from: v, to: y, insert: e.insert }), S = m.to - o.to;
        return {
          changes: x,
          range: u ? Q.range(Math.max(0, u.anchor + S), Math.max(0, u.head + S)) : m.map(x)
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
function od(i, e, t, n) {
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
function ev(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o } = i.observer.selectionRange;
  return t && (e.push(new Lu(t, n)), (s != t || o != n) && e.push(new Lu(s, o))), e;
}
function tv(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t < 0 || n < 0 ? null : t == n ? Q.create([Q.cursor(n + e, -1)]) : Q.single(t + e, n + e);
}
function Qo(i, e) {
  return e.head == i.main.head && e.anchor == i.main.anchor;
}
class nv {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, le.safari && e.contentDOM.addEventListener("input", () => null), le.gecko && yv(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !hv(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = sv(e), n = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && ld.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), le.android && le.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (le.ios && !e.synthetic && !e.altKey && !e.metaKey && (rd.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || ov.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && le.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && iv(this.view.win) && (t.shiftKey = !1);
      let n = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == n && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Zi(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : le.safari && !le.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
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
function iv(i) {
  return i.visualViewport ? i.visualViewport.height * i.visualViewport.scale / i.document.documentElement.clientHeight < 0.85 : !1;
}
function Bu(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      rn(t.state, s);
    }
  };
}
function sv(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Bu(n.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Bu(n.value, a));
      }
  }
  for (let n in un)
    t(n).handlers.push(un[n]);
  for (let n in Dt)
    t(n).observers.push(Dt[n]);
  return e;
}
const rd = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], ov = "dthko", ld = [16, 17, 18, 20, 91, 92, 224, 225], uo = 6;
function co(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function rv(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class lv {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = $h(e.contentDOM), this.atoms = e.state.facet(to).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(We.allowMultipleSelections) && av(e, t), this.dragging = cv(e, t) && cd(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && rv(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = va(this.view);
    e.clientX - a.left <= s + uo ? t = -co(s - e.clientX) : e.clientX + a.right >= r - uo && (t = co(e.clientX - r)), e.clientY - a.top <= o + uo ? n = -co(o - e.clientY) : e.clientY + a.bottom >= l - uo && (n = co(e.clientY - l)), this.setScrollSpeed(t, n);
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
    let { view: t } = this, n = nd(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function av(i, e) {
  let t = i.state.facet(zh);
  return t.length ? t[0](e) : le.mac ? e.metaKey : e.ctrlKey;
}
function uv(i, e) {
  let t = i.state.facet(Wh);
  return t.length ? t[0](e) : le.mac ? !e.altKey : !e.ctrlKey;
}
function cv(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = _s(i.root);
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
function hv(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = tt.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const un = /* @__PURE__ */ Object.create(null), Dt = /* @__PURE__ */ Object.create(null), ad = le.ie && le.ie_version < 15 || le.ios && le.webkit_version < 604;
function dv(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), ud(i, t.value);
  }, 50);
}
function kr(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function ud(i, e) {
  e = kr(i.state, fa, e);
  let { state: t } = i, n, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Hl != null && t.selection.ranges.every((a) => a.empty) && Hl == o.toString()) {
    let a = -1;
    n = t.changeByRange((u) => {
      let c = t.doc.lineAt(u.from);
      if (c.from == a)
        return { range: u };
      a = c.from;
      let d = t.toText((r ? o.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: d },
        range: Q.cursor(u.from + d.length, -1)
      };
    });
  } else r ? n = t.changeByRange((a) => {
    let u = o.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: u.text },
      range: Q.cursor(a.from + u.length, -1)
    };
  }) : n = t.replaceSelection(o);
  i.dispatch(n, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Dt.scroll = (i) => {
  let e = i.inputState;
  e.lastScrollTop = i.scrollDOM.scrollTop, e.lastScrollLeft = i.scrollDOM.scrollLeft, le.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Dt.wheel = Dt.mousewheel = (i) => {
  i.inputState.lastWheelEvent = Date.now();
};
un.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
Dt.touchstart = (i, e) => {
  let t = i.inputState, n = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), n && (t.lastTouchX = n.clientX, t.lastTouchY = n.clientY), t.setSelectionOrigin("select.pointer");
};
Dt.touchmove = (i) => {
  i.inputState.setSelectionOrigin("select.pointer");
};
Dt.touchend = (i, e) => {
  i.inputState.touchActive = !1;
};
un.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(Fh))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = pv(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new lv(i, e, t, n)), n && i.observer.ignore(() => {
      Bh(i.contentDOM);
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
function Ou(i, e, t, n) {
  if (n == 1)
    return Q.cursor(e, t);
  if (n == 2)
    return Kg(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), o = i.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < i.state.doc.length && l == o.to && l++, Q.undirectionalRange(r, l);
  }
}
const fv = le.ie && le.ie_version <= 11;
let Eu = null, Iu = 0, Ru = 0;
function cd(i) {
  if (!fv)
    return i.detail;
  let e = Eu, t = Ru;
  return Eu = i, Ru = Date.now(), Iu = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Iu + 1) % 3 : 1;
}
function pv(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = cd(e), s = i.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = i.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Ou(i, a.pos, a.assoc, n);
      if (t.pos != a.pos && !r) {
        let d = Ou(i, t.pos, t.assoc, n), h = Math.min(d.from, c.from), f = Math.max(d.to, c.to);
        c = h < c.from ? Q.range(h, f, c.assoc) : Q.range(f, h, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && n == 1 && s.ranges.length > 1 && (u = mv(s, a.pos)) ? u : l ? s.addRange(c) : Q.create([c]);
    }
  };
}
function mv(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return Q.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
un.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = Q.undirectionalRange(o, r));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", kr(i.state, pa, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
un.dragend = (i) => (i.inputState.draggedContent = null, !1);
function Pu(i, e, t, n) {
  if (t = kr(i.state, fa, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = i.inputState, r = n && o && uv(i, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = i.state.changes(r ? [r, l] : l);
  i.focus(), i.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), i.inputState.draggedContent = null;
}
un.drop = (i, e) => {
  if (!e.dataTransfer)
    return !1;
  if (i.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), s = 0, o = () => {
      ++s == t.length && Pu(i, e, n.filter((r) => r != null).join(i.state.lineBreak), !1);
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
      return Pu(i, e, n, !0), !0;
  }
  return !1;
};
un.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = ad ? null : e.clipboardData;
  return t ? (ud(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (dv(i), !1);
};
function gv(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function vv(i) {
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
  return { text: kr(i, pa, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let Hl = null;
un.copy = un.cut = (i, e) => {
  if (!Es(i.contentDOM, i.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: s } = vv(i.state);
  if (!t && !s)
    return !1;
  Hl = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = ad ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (gv(i, t), !1);
};
const hd = /* @__PURE__ */ fs.define();
function dd(i, e) {
  let t = [];
  for (let n of i.facet(Uh)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: hd.of(!0) }) : null;
}
function fd(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = dd(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
Dt.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), fd(i);
};
Dt.blur = (i) => {
  i.observer.clearSelectionRange(), fd(i);
};
Dt.compositionstart = Dt.compositionupdate = (i) => {
  if (!i.observer.editContext && (i.inputState.compositionFirstChange == null && (i.inputState.compositionFirstChange = !0), i.inputState.composing < 0)) {
    let { main: e } = i.state.selection;
    !e.empty && i.lineBlockAt(e.from).from != i.lineBlockAt(e.to).from && i.dispatch({
      changes: i.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), i.inputState.composing = 0;
  }
};
Dt.compositionend = (i) => {
  i.observer.editContext || (i.inputState.composing = -1, i.inputState.compositionEndedAt = Date.now(), i.inputState.compositionPendingKey = !0, i.inputState.compositionPendingChange = i.observer.pendingRecords().length > 0, i.inputState.compositionFirstChange = null, le.chrome && le.android ? i.observer.flushSoon() : i.inputState.compositionPendingChange ? Promise.resolve().then(() => i.observer.flush()) : setTimeout(() => {
    i.inputState.composing < 0 && i.docView.hasComposition && i.update([]);
  }, 50));
};
Dt.contextmenu = (i) => {
  i.inputState.lastContextMenu = Date.now();
};
un.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = i.posAtDOM(l.startContainer, l.startOffset), u = i.posAtDOM(l.endContainer, l.endOffset);
      return ya(i, { from: a, to: u, insert: i.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (le.chrome && le.android && (s = rd.find((o) => o.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return le.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), le.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => Dt.compositionend(i, e), 20), !1;
};
const Nu = /* @__PURE__ */ new Set();
function yv(i) {
  Nu.has(i) || (Nu.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Vu = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let os = !1;
function Hu() {
  os = !1;
}
class bv {
  constructor(e) {
    this.lineWrapping = e, this.doc = Ve.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
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
    return Vu.indexOf(e) > -1 != this.lineWrapping;
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
    let l = Vu.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class kv {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class sn {
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
    return typeof this._content == "number" ? gt.Text : Array.isArray(this._content) ? this._content : this._content.type;
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
    return this._content instanceof Li ? this._content.widget : null;
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
    return new sn(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var Ue = /* @__PURE__ */ (function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
})(Ue || (Ue = {}));
const No = 1e-3;
class $t {
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
    this.height != e && (Math.abs(this.height - e) > No && (os = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, n) {
    return $t.of(n);
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
      let { fromA: a, toA: u, fromB: c, toB: d } = s[l], h = o.lineAt(a, Ue.ByPosNoHeight, n.setDoc(t), 0, 0), f = h.to >= u ? h : o.lineAt(u, Ue.ByPosNoHeight, n, 0, 0);
      for (d += f.to - u, u = f.to; l > 0 && h.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < h.from && (h = o.lineAt(a, Ue.ByPosNoHeight, n, 0, 0));
      c += h.from - a, a = h.from;
      let m = ba.build(n.setDoc(r), e, c, d);
      o = er(o, o.replace(a, u, m));
    }
    return o.updateHeight(n, 0);
  }
  static empty() {
    return new zt(0, 0, 0);
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, n++), new xv($t.of(e.slice(0, t)), r, $t.of(e.slice(n)));
  }
}
function er(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (os = !0), e);
}
$t.prototype.size = 1;
const wv = /* @__PURE__ */ qe.replace({});
class pd extends $t {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new sn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new sn(s, 0, n, this.spaceAbove, wv) : this.mainBlock(n, s);
  }
  lineAt(e, t, n, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, n, s, o).join(r) : r;
  }
  forEachLine(e, t, n, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, Ue.ByPos, n, s, o));
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
class zt extends pd {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new sn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let s = n[0];
    return n.length == 1 && (s instanceof zt || s instanceof pt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof pt ? s = new zt(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : $t.of(n);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class pt extends $t {
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
      return new sn(c.from, c.length, h, d, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - n) / l))), { from: c, length: d } = t.doc.line(o + u);
      return new sn(c, d, n + l * u, l, 0);
    }
  }
  lineAt(e, t, n, s, o) {
    if (t == Ue.ByHeight)
      return this.blockAt(e, n, s, o);
    if (t == Ue.ByPosNoHeight) {
      let { from: f, to: m } = n.doc.lineAt(e);
      return new sn(f, m - f, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(n, o), u = n.doc.lineAt(e), c = l + u.length * a, d = u.number - r, h = s + l * d + a * (u.from - o - d);
    return new sn(u.from, u.length, Math.max(s, Math.min(h, s + this.height - c)), c, 0);
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
      r(new sn(h.from, h.length, d, f, 0)), d += f, c = h.to + 1;
    }
  }
  replace(e, t, n) {
    let s = this.length - t;
    if (s > 0) {
      let o = n[n.length - 1];
      o instanceof pt ? n[n.length - 1] = new pt(o.length + s) : n.push(null, new pt(s - 1));
    }
    if (e > 0) {
      let o = n[0];
      o instanceof pt ? n[0] = new pt(e + o.length) : n.unshift(new pt(e - 1), null);
    }
    return $t.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new pt(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new pt(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new pt(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let d = s.heights[s.index++], h = 0;
        d < 0 && (h = -d, d = s.heights[s.index++]), a == -1 ? a = d : Math.abs(d - a) >= No && (a = -2);
        let f = new zt(c, d, h);
        f.outdated = !1, r.push(f), l += c + 1;
      }
      l <= o && r.push(null, new pt(o - l).updateHeight(e, l));
      let u = $t.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= No || Math.abs(a - this.heightMetrics(e, t).perLine) >= No) && (os = !0), er(this, u);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class xv extends $t {
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
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == Ue.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, n, s, o) : this.right.lineAt(e, t, n, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == Ue.ByPosNoHeight ? Ue.ByPosNoHeight : Ue.ByPos;
    return a ? u.join(this.right.lineAt(l, c, n, r, l)) : this.left.lineAt(l, c, n, s, o).join(u);
  }
  forEachLine(e, t, n, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, n, s, o, r), t >= a && this.right.forEachLine(e, t, n, l, a, r);
    else {
      let u = this.lineAt(a, Ue.ByPos, n, s, o);
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
    if (e > 0 && zu(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), zu(o, l);
    }
    return $t.of(o);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? $t.of(this.break ? [e, null, t] : [e, t]) : (this.left = er(this.left, e), this.right = er(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, n, s) : o.updateHeight(e, t, n), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, n, s) : r.updateHeight(e, l, n), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function zu(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof pt && (n = i[e + 1]) instanceof pt && i.splice(e - 1, 3, new pt(t.length + 1 + n.length));
}
const Sv = 5;
class ba {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof zt ? s.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new zt(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let s = n.widget ? n.widget.estimatedHeight : 0, o = n.widget ? n.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      n.block ? this.addBlock(new pd(r, s, n)) : (r || o || s >= Sv) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new zt(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new pt(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof zt)
      return e;
    let t = new zt(0, -1, 0);
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
    this.lineStart > -1 && !(t instanceof zt) && !this.isCovered ? this.nodes.push(new zt(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let s of this.nodes)
      s instanceof zt && s.updateHeight(this.oracle, n), n += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, s) {
    let o = new ba(n, e);
    return Re.spans(t, n, s, o, 0), o.finish(n);
  }
}
function Cv(i, e, t) {
  let n = new Mv();
  return Re.compare(i, e, t, n, 0), n.changes;
}
class Mv {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && Ji(e, t, this.changes, 5);
  }
}
function Av(i, e) {
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
function Tv(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function $v(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class qr {
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
    return qe.replace({
      widget: new Dv(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Dv extends Zs {
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
class Wu {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Fu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = je.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(ma).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new bv(n), this.stateDeco = Ku(t), this.heightMap = $t.empty().applyChanges(this.stateDeco, Ve.empty, this.heightOracle.setDoc(t.doc), [new Xt(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = qe.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let n = 0; n <= 1; n++) {
      let s = n ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new ho(o, r));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Fu : new ka(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Ts(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = Ku(this.state);
    let s = e.changedRanges, o = Xt.extendWithRanges(s, Cv(n, this.stateDeco, e ? e.changes : ut.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Hu(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || os) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(jh) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? je.RTL : je.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: P, scaleY: z } = Th(t, l);
      (P > 5e-3 && Math.abs(this.scaleX - P) > 5e-3 || z > 5e-3 && Math.abs(this.scaleY - z) > 5e-3) && (this.scaleX = P, this.scaleY = z, u |= 16, r = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, h = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != h) && (this.paddingTop = d, this.paddingBottom = h, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let f = $h(this.view.contentDOM, !1).y;
    f != this.scrollParent && (this.scrollParent = f, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let m = this.getScrollOffset();
    this.scrollOffset != m && (this.scrollAnchorHeight = -1, this.scrollOffset = m), this.scrolledToBottom = Oh(this.scrollParent || e.win);
    let y = (this.printing ? $v : Av)(t, this.paddingTop), v = y.top - this.pixelViewport.top, x = y.bottom - this.pixelViewport.bottom;
    this.pixelViewport = y;
    let S = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (S != this.inView && (this.inView = S, S && (a = !0)), !this.inView && !this.scrollTarget && !Tv(e.dom))
      return 0;
    let $ = l.width;
    if ((this.contentDOMWidth != $ || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let P = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(P) && (r = !0), r || s.lineWrapping && Math.abs($ - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: z, charWidth: R, textHeight: Y } = e.docView.measureTextSize();
        r = z > 0 && s.refresh(o, z, R, Y, Math.max(5, $ / R), P), r && (e.docView.minWidth = 0, u |= 16);
      }
      v > 0 && x > 0 ? c = Math.max(v, x) : v < 0 && x < 0 && (c = Math.min(v, x)), Hu();
      for (let z of this.viewports) {
        let R = z.from == this.viewport.from ? P : e.docView.measureVisibleLineHeights(z);
        this.heightMap = (r ? $t.empty().applyChanges(this.stateDeco, Ve.empty, this.heightOracle, [new Xt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new kv(z.from, R));
      }
      os && (u |= 2);
    }
    let N = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return N && (u & 2 && (u |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), u |= this.updateForViewport()), (u & 2 || N) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(r ? [] : this.lineGaps, e)), u |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), u;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new ho(s.lineAt(r - n * 1e3, Ue.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - n) * 1e3, Ue.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = s.lineAt(u, Ue.ByPos, o, 0, 0), h;
        t.y == "center" ? h = (d.top + d.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? h = d.top : h = d.bottom - c, a = new ho(s.lineAt(h - 1e3 / 2, Ue.ByHeight, o, 0, 0).from, s.lineAt(h + c + 1e3 / 2, Ue.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new ho(this.heightMap.lineAt(n, Ue.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, Ue.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, n = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, Ue.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, Ue.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
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
      t.touchesRange(s.from, s.to) || n.push(new qr(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
    if (this.defaultTextDirection != je.LTR && !n)
      return [];
    let l = [], a = (c, d, h, f) => {
      if (d - c < o)
        return;
      let m = this.state.selection.main, y = [m.from];
      m.empty || y.push(m.to);
      for (let x of y)
        if (x > c && x < d) {
          a(c, x - 10, h, f), a(x + 10, d, h, f);
          return;
        }
      let v = Bv(e, (x) => x.from >= h.from && x.to <= h.to && Math.abs(x.from - c) < o && Math.abs(x.to - d) < o && !y.some((S) => x.from < S && x.to > S));
      if (!v) {
        if (d < h.to && t && n && t.visibleRanges.some(($) => $.from <= d && $.to >= d)) {
          let $ = t.moveToLineBoundary(Q.cursor(d), !1, !0).head;
          $ > c && (d = $);
        }
        let x = this.gapSize(h, c, d, f), S = n || x < 2e6 ? x : 2e6;
        v = new qr(c, d, x, S);
      }
      l.push(v);
    }, u = (c) => {
      if (c.length < r || c.type != gt.Text)
        return;
      let d = Lv(c.from, c.to, this.stateDeco);
      if (d.total < r)
        return;
      let h = this.scrollTarget ? this.scrollTarget.range.head : null, f, m;
      if (n) {
        let y = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, v, x;
        if (h != null) {
          let S = po(d, h), $ = ((this.visibleBottom - this.visibleTop) / 2 + y) / c.height;
          v = S - $, x = S + $;
        } else
          v = (this.visibleTop - c.top - y) / c.height, x = (this.visibleBottom - c.top + y) / c.height;
        f = fo(d, v), m = fo(d, x);
      } else {
        let y = d.total * this.heightOracle.charWidth, v = s * this.heightOracle.charWidth, x = 0;
        if (y > 2e6)
          for (let z of e)
            z.from >= c.from && z.from < c.to && z.size != z.displaySize && z.from * this.heightOracle.charWidth + x < this.pixelViewport.left && (x = z.size - z.displaySize);
        let S = this.pixelViewport.left + x, $ = this.pixelViewport.right + x, N, P;
        if (h != null) {
          let z = po(d, h), R = (($ - S) / 2 + v) / y;
          N = z - R, P = z + R;
        } else
          N = (S - v) / y, P = ($ + v) / y;
        f = fo(d, N), m = fo(d, P);
      }
      f > c.from && a(c.from, f, c, d), m < c.to && a(m, c.to, c, d);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, n, s) {
    let o = po(s, n) - po(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    qr.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = qe.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    Re.spans(t, this.viewport.from, this.viewport.to, {
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Ts(this.heightMap.lineAt(e, Ue.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Ts(this.heightMap.lineAt(this.scaler.fromDOM(e), Ue.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Ts(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class ho {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Lv(i, e, t) {
  let n = [], s = i, o = 0;
  return Re.spans(t, i, e, {
    span() {
    },
    point(r, l) {
      r > s && (n.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), o += e - s), { total: o, ranges: n };
}
function fo({ total: i, ranges: e }, t) {
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
function po(i, e) {
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
function Bv(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const Fu = {
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
function Ku(i) {
  let e = i.facet(vr).filter((n) => typeof n != "function"), t = i.facet(ga).filter((n) => typeof n != "function");
  return t.length && e.push(Re.join(t)), e;
}
class ka {
  constructor(e, t, n) {
    let s = 0, o = 0, r = 0;
    this.viewports = n.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, Ue.ByPos, e, 0, 0).top, c = t.lineAt(a, Ue.ByPos, e, 0, 0).bottom;
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
    return e instanceof ka ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Ts(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new sn(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Ts(s, e)) : i._content);
}
const mo = /* @__PURE__ */ pe.define({ combine: (i) => i.join(" ") }), zl = /* @__PURE__ */ pe.define({ combine: (i) => i.indexOf(!0) > -1 }), Wl = /* @__PURE__ */ ri.newName(), md = /* @__PURE__ */ ri.newName(), gd = /* @__PURE__ */ ri.newName(), vd = { "&light": "." + md, "&dark": "." + gd };
function Fl(i, e, t) {
  return new ri(e, {
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
const Ov = /* @__PURE__ */ Fl("." + Wl, {
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
}, vd), Ev = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Yr = le.ie && le.ie_version <= 11;
class Iv {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new ug(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (le.ie && le.ie_version <= 11 || le.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && le.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(le.chrome && le.chrome_version < 126) && (this.editContext = new Pv(e), e.state.facet(Hn) && (e.contentDOM.editContext = this.editContext.editContext)), Yr && (this.onCharData = (t) => {
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
    if (n.state.facet(Hn) ? n.root.activeElement != this.dom : !Es(this.dom, s))
      return;
    let o = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (le.ie && le.ie_version <= 11 || le.android && le.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Is(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = _s(e.root);
    if (!t)
      return !1;
    let n = le.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Rv(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = Es(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && hg(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, Ev), Yr && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), Yr && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && Zi(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && Es(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Zg(this.view, e, t, n);
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
    let n = this.view.state, s = sd(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !Qo(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = _u(t, e.previousSibling || e.target.previousSibling, -1), s = _u(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(Hn) != e.state.facet(Hn) && (e.view.contentDOM.editContext = e.state.facet(Hn) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function _u(i, e, t) {
  for (; e; ) {
    let n = tt.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Uu(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, o = e.endOffset, r = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Is(r.node, r.offset, s, o) && ([t, n, s, o] = [s, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o };
}
function Rv(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return Uu(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? Uu(i, t) : null;
}
class Pv {
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
      let c = od(e.state.sliceDoc(l, a), n.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let h = Q.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        Qo(h, s) || e.dispatch({ selection: h, userEvent: "select" });
        return;
      }
      let d = {
        from: c.from + l,
        to: c.toA + l,
        insert: Ve.of(n.text.slice(c.from, c.toB).split(`
`))
      };
      if ((le.mac || le.android) && d.from == r - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (d = { from: l, to: a, insert: Ve.of([n.text.replace(".", " ")]) }), this.pendingContextChange = d, !e.state.readOnly) {
        let h = this.to - this.from + (d.to - d.from + d.insert.length);
        ya(e, d, Q.single(this.toEditorPos(n.selectionStart, h), this.toEditorPos(n.selectionEnd, h)));
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
            s.push(qe.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: Yh.of(qe.set(s)) });
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
      let s = _s(n.root);
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
class ye {
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
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((o) => n(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || cg(e.parent) || document, this.viewState = new Wu(this, e.state || We.create(e)), e.scrollTo && e.scrollTo.is(ao) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(_i).map((s) => new Kr(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Iv(this), this.inputState = new nv(this), this.inputState.ensureHandlers(this.plugins), this.docView = new $u(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof wt ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
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
    e.some((h) => h.annotation(hd)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = dd(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(We.phrases) != this.state.facet(We.phrases))
      return this.setState(o);
    s = Xo.create(this, o, e), s.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let h of e) {
        if (d && (d = d.map(h.changes)), h.scrollIntoView) {
          let { main: f } = h.state.selection, { x: m, y } = this.state.facet(ye.cursorScrollMargin);
          d = new Qi(f.empty ? f : Q.cursor(f.head, f.head > f.anchor ? -1 : 1), "nearest", "nearest", y, m);
        }
        for (let f of h.effects)
          f.is(ao) && (d = f.value.clip(this.state));
      }
      this.viewState.update(s, d), this.bidiCache = tr.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(As) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((h) => h.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(mo) != s.state.facet(mo) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let h of this.state.facet(Rl))
        try {
          h(s);
        } catch (f) {
          rn(this.state, f, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !sd(this, c) && u.force && Zi(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new Wu(this, e), this.plugins = e.facet(_i).map((n) => new Kr(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new $u(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(_i), n = e.state.facet(_i);
    if (t != n) {
      let s = [];
      for (let o of n) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new Kr(o));
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
          rn(this.state, n, "doc view update listener");
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
          if (Oh(n || this.win))
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
          } catch (y) {
            return rn(this.state, y), Gu;
          }
        }), h = Xo.create(this, this.state, []), f = !1;
        h.flags |= u, t ? t.flags |= u : t = h, this.updateState = 2, h.empty || (this.updatePlugins(h), this.inputState.update(h), this.updateAttrs(), f = this.docView.update(h), f && this.docViewUpdate());
        for (let m = 0; m < c.length; m++)
          if (d[m] != Gu)
            try {
              let y = c[m];
              y.write && y.write(d[m], this);
            } catch (y) {
              rn(this.state, y);
            }
        if (f && this.docView.updateSelection(!0), !h.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, r = -1;
              continue;
            } else {
              let y = (o < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(o).top) / this.viewState.scaleY - r / l;
              if ((y > 1 || y < -1) && !(le.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (n == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                s = s + y, n ? o < 0 ? n.scrollTop = n.scrollHeight : n.scrollTop += y : this.win.scrollBy(0, y), r = -1;
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
      for (let a of this.state.facet(Rl))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return Wl + " " + (this.state.facet(zl) ? gd : md) + " " + this.state.facet(mo);
  }
  updateAttrs() {
    let e = ju(this, Xh, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(Hn) ? "true" : "false",
      class: "cm-content",
      style: `${le.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), ju(this, ma, t);
    let n = this.observer.ignore(() => {
      let s = xu(this.contentDOM, this.contentAttrs, t), o = xu(this.dom, this.editorAttrs, e);
      return s || o;
    });
    return this.editorAttrs = e, this.contentAttrs = t, n;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let n of e)
      for (let s of n.effects)
        if (s.is(ye.announce)) {
          t && (this.announceDOM.textContent = "", this.win.clearTimeout(this.clearAnnouncement), this.clearAnnouncement = this.win.setTimeout(() => {
            this.announceDOM.textContent = " ";
          }, 200), t = !1);
          let o = this.announceDOM.appendChild(document.createElement("div"));
          o.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(As);
    let e = this.state.facet(ye.cspNonce);
    ri.mount(this.root, this.styleModules.concat(Ov).reverse(), e ? { nonce: e } : void 0);
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
    return jr(this, e, Du(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return jr(this, e, Du(this, e, t, (n) => Gg(this, e.head, n)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? Q.cursor(e.to, 1) : Q.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, n = !0) {
    return Ug(this, e, t, n);
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
    return jr(this, e, jg(this, e, t, n));
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
    let n = Vl(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Vl(this, e, t);
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
    let n = this.state.doc.lineAt(e), s = this.bidiSpans(n), o = s[$n.find(s, e - n.from, -1, t)];
    return n.length && (e == n.from && t < 0 || e == n.to && t > 0) && o.dir != this.textDirectionAt(n.from) && (e == n.to ? (e = n.from + o.from, t = 1) : (e = n.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == je.RTL);
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
    return !this.state.facet(Gh) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > Nv)
      return Vh(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || Nh(o.isolates, n = Mu(this, e))))
        return o.order;
    n || (n = Mu(this, e));
    let s = yg(e.text, t, n);
    return this.bidiCache.push(new tr(e.from, e.to, t, n, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || le.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Bh(this.contentDOM), this.docView.updateSelection();
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
    return ao.of(new Qi(typeof e == "number" ? Q.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return ao.of(new Qi(Q.cursor(n.from), "start", "start", n.top - e, t, !0));
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
    return Wt.define(() => ({}), { eventHandlers: e });
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
    return Wt.define(() => ({}), { eventObservers: e });
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
    let n = ri.newName(), s = [mo.of(n), As.of(Fl(`.${n}`, e))];
    return t && t.dark && s.push(zl.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return dr.lowest(As.of(Fl("." + Wl, e, vd)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), s = n && tt.get(n) || tt.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
ye.styleModule = As;
ye.inputHandler = _h;
ye.clipboardInputFilter = fa;
ye.clipboardOutputFilter = pa;
ye.scrollHandler = qh;
ye.focusChangeEffect = Uh;
ye.perLineTextDirection = Gh;
ye.exceptionSink = Kh;
ye.updateListener = Rl;
ye.editable = Hn;
ye.mouseSelectionStyle = Fh;
ye.dragMovesSelection = Wh;
ye.clickAddsSelectionRange = zh;
ye.decorations = vr;
ye.blockWrappers = Jh;
ye.outerDecorations = ga;
ye.atomicRanges = to;
ye.bidiIsolatedRanges = Zh;
ye.cursorScrollMargin = /* @__PURE__ */ pe.define({
  combine: (i) => {
    let e = 5, t = 5;
    for (let n of i)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
ye.scrollMargins = Qh;
ye.darkTheme = zl;
ye.cspNonce = /* @__PURE__ */ pe.define({ combine: (i) => i.length ? i[0] : "" });
ye.contentAttributes = ma;
ye.editorAttributes = Xh;
ye.lineWrapping = /* @__PURE__ */ ye.contentAttributes.of({ class: "cm-lineWrapping" });
ye.announce = /* @__PURE__ */ Ge.define();
const Nv = 4096, Gu = {};
class tr {
  constructor(e, t, n, s, o, r) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : je.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && n.push(new tr(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return n;
  }
}
function ju(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let o = n[s], r = typeof o == "function" ? o(i) : o;
    r && ca(r, t);
  }
  return t;
}
const Vv = le.mac ? "mac" : le.windows ? "win" : le.linux ? "linux" : "key";
function Hv(i, e) {
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
function go(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const zv = /* @__PURE__ */ dr.default(/* @__PURE__ */ ye.domEventHandlers({
  keydown(i, e) {
    return _v(Wv(e.state), i, e, "editor");
  }
})), yd = /* @__PURE__ */ pe.define({ enables: zv }), qu = /* @__PURE__ */ new WeakMap();
function Wv(i) {
  let e = i.facet(yd), t = qu.get(e);
  return t || qu.set(e, t = Kv(e.reduce((n, s) => n.concat(s), []))), t;
}
let ti = null;
const Fv = 4e3;
function Kv(i, e = Vv) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = n[r];
    if (a == null)
      n[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var d, h;
    let f = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), m = l.split(/ (?!$)/).map((x) => Hv(x, e));
    for (let x = 1; x < m.length; x++) {
      let S = m.slice(0, x).join(" ");
      s(S, !0), f[S] || (f[S] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [($) => {
          let N = ti = { view: $, prefix: S, scope: r };
          return setTimeout(() => {
            ti == N && (ti = null);
          }, Fv), !0;
        }]
      });
    }
    let y = m.join(" ");
    s(y, !1);
    let v = f[y] || (f[y] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((h = (d = f._any) === null || d === void 0 ? void 0 : d.run) === null || h === void 0 ? void 0 : h.slice()) || []
    });
    a && v.run.push(a), u && (v.preventDefault = !0), c && (v.stopPropagation = !0);
  };
  for (let r of i) {
    let l = r.scope ? r.scope.split(" ") : ["editor"];
    if (r.any)
      for (let u of l) {
        let c = t[u] || (t[u] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: d } = r;
        for (let h in c)
          c[h].run.push((f) => d(f, Kl));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Kl = null;
function _v(i, e, t, n) {
  Kl = e;
  let s = ig(e), o = Hm(s, 0), r = zm(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  ti && ti.view == t && ti.scope == n && (l = ti.prefix + " ", ld.indexOf(e.keyCode) < 0 && (u = !0, ti = null));
  let d = /* @__PURE__ */ new Set(), h = (v) => {
    if (v) {
      for (let x of v.run)
        if (!d.has(x) && (d.add(x), x(t)))
          return v.stopPropagation && (c = !0), !0;
      v.preventDefault && (v.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, f = i[n], m, y;
  return f && (h(f[l + go(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(le.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(le.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (m = li[e.keyCode]) && m != s ? (h(f[l + go(m, e, !0)]) || e.shiftKey && (y = Fs[e.keyCode]) != s && y != m && h(f[l + go(y, e, !1)])) && (a = !0) : r && e.shiftKey && h(f[l + go(s, e, !0)]) && (a = !0), !a && h(f._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Kl = null, a;
}
class Ti {
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
      let o = bd(e);
      return [new Ti(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Uv(e, t, n);
  }
}
function bd(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == je.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function Yu(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let o = i.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = i.posAtCoords({ x: o.left + 1, y: r }), a = i.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? n : { from: Math.max(n.from, Math.min(l, a)), to: Math.min(n.to, Math.max(l, a)) };
}
function Uv(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), o = i.textDirection == je.LTR, r = i.contentDOM, l = r.getBoundingClientRect(), a = bd(i), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), d = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), h = l.right - (c ? parseInt(c.paddingRight) : 0), f = Nl(i, n, 1), m = Nl(i, s, -1), y = f.type == gt.Text ? f : null, v = m.type == gt.Text ? m : null;
  if (y && (i.lineWrapping || f.widgetLineBreaks) && (y = Yu(i, n, 1, y)), v && (i.lineWrapping || m.widgetLineBreaks) && (v = Yu(i, s, -1, v)), y && v && y.from == v.from && y.to == v.to)
    return S($(t.from, t.to, y));
  {
    let P = y ? $(t.from, null, y) : N(f, !1), z = v ? $(null, t.to, v) : N(m, !0), R = [];
    return (y || f).to < (v || m).from - (y && v ? 1 : 0) || f.widgetLineBreaks > 1 && P.bottom + i.defaultLineHeight / 2 < z.top ? R.push(x(d, P.bottom, h, z.top)) : P.bottom < z.top && i.elementAtHeight((P.bottom + z.top) / 2).type == gt.Text && (P.bottom = z.top = (P.bottom + z.top) / 2), S(P).concat(R).concat(S(z));
  }
  function x(P, z, R, Y) {
    return new Ti(e, P - a.left, z - a.top, Math.max(0, R - P), Y - z);
  }
  function S({ top: P, bottom: z, horizontal: R }) {
    let Y = [];
    for (let H = 0; H < R.length; H += 2)
      Y.push(x(R[H], P, R[H + 1], z));
    return Y;
  }
  function $(P, z, R) {
    let Y = 1e9, H = -1e9, ie = [];
    function K(ge, ve, se, ae, Be) {
      let xe = i.coordsAtPos(ge, ge == R.to ? -2 : 2), De = i.coordsAtPos(se, se == R.from ? 2 : -2);
      !xe || !De || (Y = Math.min(xe.top, De.top, Y), H = Math.max(xe.bottom, De.bottom, H), Be == je.LTR ? ie.push(o && ve ? d : xe.left, o && ae ? h : De.right) : ie.push(!o && ae ? d : De.left, !o && ve ? h : xe.right));
    }
    let T = P ?? R.from, F = z ?? R.to;
    for (let ge of i.visibleRanges)
      if (ge.to > T && ge.from < F)
        for (let ve = Math.max(ge.from, T), se = Math.min(ge.to, F); ; ) {
          let ae = i.state.doc.lineAt(ve);
          for (let Be of i.bidiSpans(ae)) {
            let xe = Be.from + ae.from, De = Be.to + ae.from;
            if (xe >= se)
              break;
            De > ve && K(Math.max(xe, ve), P == null && xe <= T, Math.min(De, se), z == null && De >= F, Be.dir);
          }
          if (ve = ae.to + 1, ve >= se)
            break;
        }
    return ie.length == 0 && K(T, P == null, F, z == null, i.textDirection), { top: Y, bottom: H, horizontal: ie };
  }
  function N(P, z) {
    let R = l.top + (z ? P.top : P.bottom);
    return { top: R, bottom: R, horizontal: [] };
  }
}
function Gv(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class jv {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(Vo) != e.state.facet(Vo) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(Vo);
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
    if (e.length != this.drawn.length || e.some((t, n) => !Gv(t, this.drawn[n]))) {
      let t = this.dom.firstChild, n = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[n].constructor && s.update(t, this.drawn[n]) ? (t = t.nextSibling, n++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, le.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const Vo = /* @__PURE__ */ pe.define();
function kd(i) {
  return [
    Wt.define((e) => new jv(e, i)),
    Vo.of(i)
  ];
}
const rs = /* @__PURE__ */ pe.define({
  combine(i) {
    return pr(i, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function qv(i = {}) {
  return [
    rs.of(i),
    Yv,
    Xv,
    Zv,
    jh.of(!0)
  ];
}
function wd(i) {
  return i.startState.facet(rs) != i.state.facet(rs);
}
const Yv = /* @__PURE__ */ kd({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(rs), n = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && le.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : Q.cursor(s.head, s.assoc);
        for (let a of Ti.forRange(i, r, l))
          n.push(a);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = wd(i);
    return t && Xu(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    Xu(e.state, i);
  },
  class: "cm-cursorLayer"
});
function Xu(i, e) {
  e.style.animationDuration = i.facet(rs).cursorBlinkRate + "ms";
}
const Xv = /* @__PURE__ */ kd({
  above: !1,
  markers(i) {
    let e = [], { main: t, ranges: n } = i.state.selection;
    for (let s of n)
      if (!s.empty)
        for (let o of Ti.forRange(i, "cm-selectionBackground", s))
          e.push(o);
    if (le.ios && !t.empty && i.state.facet(rs).iosSelectionHandles) {
      for (let s of Ti.forRange(i, "cm-selectionHandle cm-selectionHandle-start", Q.cursor(t.from, 1)))
        e.push(s);
      for (let s of Ti.forRange(i, "cm-selectionHandle cm-selectionHandle-end", Q.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || wd(i);
  },
  class: "cm-selectionLayer"
}), Jv = le.gecko && le.gecko_version == 153 ? "#ffffff01" : "transparent", Zv = /* @__PURE__ */ dr.highest(/* @__PURE__ */ ye.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${Jv} !important` },
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
function Qv() {
  return ty;
}
const ey = /* @__PURE__ */ qe.line({ class: "cm-activeLine" }), ty = /* @__PURE__ */ Wt.fromClass(class {
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
      s.from > e && (t.push(ey.range(s.from)), e = s.from);
    }
    return qe.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), vo = "-10000px";
class xd {
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
function ny(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const Xr = /* @__PURE__ */ pe.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: le.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || ny
    };
  }
}), Ju = /* @__PURE__ */ new WeakMap(), Sd = /* @__PURE__ */ Wt.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(Xr);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new xd(i, wa, (t, n) => this.createTooltip(t, n), (t) => {
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
    let t = e || i.geometryChanged, n = i.state.facet(Xr);
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
    return t.dom.style.position = this.position, t.dom.style.top = vo, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
      if (le.safari) {
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
    let n = this.view.scrollDOM.getBoundingClientRect(), s = va(this.view);
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
      space: this.view.state.facet(Xr).tooltipSpace(this.view),
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
        c.style.top = vo;
        continue;
      }
      let f = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, m = f ? 7 : 0, y = h.right - h.left, v = (e = Ju.get(u)) !== null && e !== void 0 ? e : h.bottom - h.top, x = u.offset || sy, S = this.view.textDirection == je.LTR, $ = h.width > n.right - n.left ? S ? n.left : n.right - h.width : S ? Math.max(n.left, Math.min(d.left - (f ? 14 : 0) + x.x, n.right - y)) : Math.min(Math.max(n.left, d.left - y + (f ? 14 : 0) - x.x), n.right - y), N = this.above[l];
      !a.strictSide && (N ? d.top - v - m - x.y < n.top : d.bottom + v + m + x.y > n.bottom) && N == n.bottom - d.bottom > d.top - n.top && (N = this.above[l] = !N);
      let P = (N ? d.top - n.top : n.bottom - d.bottom) - m;
      if (P < v && u.resize !== !1) {
        if (P < this.view.defaultLineHeight) {
          c.style.top = vo;
          continue;
        }
        Ju.set(u, v), c.style.height = (v = P) / o + "px";
      } else c.style.height && (c.style.height = "");
      let z = N ? d.top - v - m - x.y : d.bottom + m + x.y, R = $ + y;
      if (u.overlap !== !0)
        for (let Y of r)
          Y.left < R && Y.right > $ && Y.top < z + v && Y.bottom > z && (z = N ? Y.top - v - 2 - m : Y.bottom + m + 2);
      if (this.position == "absolute" ? (c.style.top = (z - i.parent.top) / o + "px", Zu(c, ($ - i.parent.left) / s)) : (c.style.top = z / o + "px", Zu(c, $ / s)), f) {
        let Y = d.left + (S ? x.x : -x.x) - ($ + 14 - 7);
        f.style.left = Y / s + "px";
      }
      u.overlap !== !0 && r.push({ left: $, top: z, right: R, bottom: z + v }), c.classList.toggle("cm-tooltip-above", N), c.classList.toggle("cm-tooltip-below", !N), u.positioned && u.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = vo;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function Zu(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const iy = /* @__PURE__ */ ye.baseTheme({
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
}), sy = { x: 0, y: 0 }, wa = /* @__PURE__ */ pe.define({
  enables: [Sd, iy]
}), nr = /* @__PURE__ */ pe.define({
  combine: (i) => i.reduce((e, t) => e.concat(t), [])
});
class wr {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new wr(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new xd(e, nr, (t, n) => this.createHostedView(t, n), (t) => t.dom.remove());
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
const oy = /* @__PURE__ */ wa.compute([nr], (i) => {
  let e = i.facet(nr);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var n;
      return (n = t.end) !== null && n !== void 0 ? n : t.pos;
    })),
    create: wr.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), ry = /* @__PURE__ */ pe.define();
class ly {
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
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == je.RTL ? -1 : 1;
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
      }, (a) => rn(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Sd), t = e ? e.manager.tooltips.findIndex((n) => n.create == wr.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, n;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !ay(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (n = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && n !== void 0 ? n : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !uy(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const yo = 4;
function ay(i, e) {
  let { left: t, right: n, top: s, bottom: o } = i.getBoundingClientRect(), r;
  if (r = i.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - yo && e.clientX <= n + yo && e.clientY >= s - yo && e.clientY <= o + yo;
}
function uy(i, e, t, n, s, o) {
  let r = i.scrollDOM.getBoundingClientRect(), l = i.documentTop + i.documentPadding.top + i.contentHeight;
  if (r.left > n || r.right < n || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = i.posAtCoords({ x: n, y: s }, !1);
  return a >= e && a <= t;
}
function cy(i, e = {}) {
  let t = Ge.define(), n = /* @__PURE__ */ new WeakMap(), s = cn.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = n.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let d = l.changes.mapPos(c.pos, -1, Rt.TrackDel);
          if (d != null) {
            let h = Object.assign(/* @__PURE__ */ Object.create(null), c);
            h.pos = d, h.end != null && (h.end = l.changes.mapPos(h.end)), u.push(h);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(hy) && !u.value || u.value == s) && (r = []);
      return r.length && a && n.set(r, a), r;
    },
    provide: (r) => nr.from(r)
  });
  const o = Wt.define((r) => new ly(
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
      ry.of(o),
      oy
    ]
  };
}
const hy = /* @__PURE__ */ Ge.define(), Qu = /* @__PURE__ */ pe.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), dy = /* @__PURE__ */ Wt.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(_l), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(Qu);
    this.top = new bo(i, !0, e.topContainer), this.bottom = new bo(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(Qu);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new bo(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new bo(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(_l);
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
  provide: (i) => ye.scrollMargins.of((e) => {
    let t = e.plugin(i);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class bo {
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
          e = ec(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = ec(e);
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
function ec(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const _l = /* @__PURE__ */ pe.define({
  enables: dy
});
class ui extends Di {
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
ui.prototype.elementClass = "";
ui.prototype.toDOM = void 0;
ui.prototype.mapMode = Rt.TrackBefore;
ui.prototype.startSide = ui.prototype.endSide = -1;
ui.prototype.point = !0;
const Jr = /* @__PURE__ */ pe.define(), fy = /* @__PURE__ */ pe.define(), py = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Re.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, Ps = /* @__PURE__ */ pe.define();
function my(i) {
  return [Cd(), Ps.of({ ...py, ...i })];
}
const tc = /* @__PURE__ */ pe.define({
  combine: (i) => i.some((e) => e)
});
function Cd(i) {
  return [
    gy
  ];
}
const gy = /* @__PURE__ */ Wt.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet(Ps).map((e) => new ic(i, e)), this.fixed = !i.state.facet(tc);
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
    this.view.state.facet(tc) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Re.iter(this.view.state.facet(Jr), this.view.viewport.from), n = [], s = this.gutters.map((o) => new vy(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == gt.Text && r) {
            Ul(t, n, l.from);
            for (let a of s)
              a.line(this.view, l, n);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == gt.Text) {
        Ul(t, n, o.from);
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
    let e = i.startState.facet(Ps), t = i.state.facet(Ps), n = i.docChanged || i.heightChanged || i.viewportChanged || !Re.eq(i.startState.facet(Jr), i.state.facet(Jr), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new ic(this.view, o)) : (this.gutters[r].update(i), s.push(this.gutters[r]));
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
  provide: (i) => ye.scrollMargins.of((e) => {
    let t = e.plugin(i);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let n = t.dom.offsetWidth * e.scaleX, s = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == je.LTR ? { left: n, right: s } : { right: n, left: s };
  })
});
function nc(i) {
  return Array.isArray(i) ? i : [i];
}
function Ul(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class vy {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = Re.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Md(e, r, o, n);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    Ul(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let o of e.state.facet(fy)) {
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
class ic {
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
    this.markers = nc(t.markers(e)), t.initialSpacer && (this.spacer = new Md(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = nc(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let n = e.view.viewport;
    return !Re.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Md {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), yy(this.markers, s) || this.setMarkers(e, s);
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
function yy(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const by = /* @__PURE__ */ pe.define(), ky = /* @__PURE__ */ pe.define(), Ui = /* @__PURE__ */ pe.define({
  combine(i) {
    return pr(i, { formatNumber: String, domEventHandlers: {} }, {
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
class Zr extends ui {
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
function Qr(i, e) {
  return i.state.facet(Ui).formatNumber(e, i.state);
}
const wy = /* @__PURE__ */ Ps.compute([Ui], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(by);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new Zr(Qr(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet(ky)) {
      let o = s(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Ui) != e.state.facet(Ui),
  initialSpacer(e) {
    return new Zr(Qr(e, sc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = Qr(t.view, sc(t.view.state.doc.lines));
    return n == e.number ? e : new Zr(n);
  },
  domEventHandlers: i.facet(Ui).domEventHandlers,
  side: "before"
}));
function xy(i = {}) {
  return [
    Ui.of(i),
    Cd(),
    wy
  ];
}
function sc(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const Sy = 1024;
let Cy = 0;
class el {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Pe {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = Cy++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
Pe.closedBy = new Pe({ deserialize: (i) => i.split(" ") });
Pe.openedBy = new Pe({ deserialize: (i) => i.split(" ") });
Pe.group = new Pe({ deserialize: (i) => i.split(" ") });
Pe.isolate = new Pe({ deserialize: (i) => {
  if (i && i != "rtl" && i != "ltr" && i != "auto")
    throw new RangeError("Invalid value for isolate: " + i);
  return i || "auto";
} });
Pe.contextHash = new Pe({ perNode: !0 });
Pe.lookAhead = new Pe({ perNode: !0 });
Pe.mounted = new Pe({ perNode: !0 });
class Ns {
  constructor(e, t, n, s = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[Pe.mounted.id];
  }
}
const My = /* @__PURE__ */ Object.create(null);
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : My, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new Nt(e.name || "", t, e.id, n);
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
      let t = this.prop(Pe.group);
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
      for (let s = n.prop(Pe.group), o = -1; o < (s ? s.length : 0); o++) {
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
class xa {
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
    return new xa(t);
  }
}
const ko = /* @__PURE__ */ new WeakMap(), oc = /* @__PURE__ */ new WeakMap();
var it;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(it || (it = {}));
class Je {
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
    let e = Ns.get(this);
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
    return new jl(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = ko.get(this) || this.topNode, o = new jl(s);
    return o.moveTo(e, t), ko.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Jt(this, 0, 0, null);
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
    let n = Gs(ko.get(this) || this.topNode, e, t, !1);
    return ko.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = Gs(oc.get(this) || this.topNode, e, t, !0);
    return oc.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return $y(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & it.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | it.IncludeAnonymous); ; ) {
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
    return this.children.length <= 8 ? this : Ma(Nt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new Je(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new Je(Nt.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Dy(e);
  }
}
Je.empty = new Je(Nt.none, [], [], 0);
class Sa {
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
    return new Sa(this.buffer, this.index);
  }
}
class ci {
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
    for (let a = e; a != t && !(Ad(o, s, r[a + 1], r[a + 2]) && (l = a, n > 0)); a = r[a + 3])
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
    return new ci(o, r, this.set);
  }
}
function Ad(i, e, t, n) {
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
function Gs(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let r = !n && i instanceof Jt && i.index < 0 ? null : i.parent;
    if (!r)
      return i;
    i = r;
  }
  let o = n ? 0 : it.IgnoreOverlays;
  if (n)
    for (let r = i, l = r.parent; l; r = l, l = r.parent)
      r instanceof Jt && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (i = l);
  for (; ; ) {
    let r = i.enter(e, t, o);
    if (!r)
      return i;
    i = r;
  }
}
class Td {
  cursor(e = 0) {
    return new jl(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = rc(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return rc(this, e, t, n);
  }
  resolve(e, t = 0) {
    return Gs(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Gs(this, e, t, !0);
  }
  matchContext(e) {
    return Gl(this.parent, e);
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
class Jt extends Td {
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
        if (!(!(o & it.EnterBracketed && c instanceof Je && (h = Ns.get(c)) && !h.overlay && h.bracketed && n >= d && n <= d + c.length) && !Ad(s, n, d, d + c.length))) {
          if (c instanceof ci) {
            if (o & it.ExcludeBuffers)
              continue;
            let f = c.findChild(0, c.buffer.length, t, n - d, s);
            if (f > -1)
              return new si(new Ay(r, c, e, d), null, f);
          } else if (o & it.IncludeAnonymous || !c.type.isAnonymous || Ca(c)) {
            let f;
            if (!(o & it.IgnoreMounts) && (f = Ns.get(c)) && !f.overlay)
              return new Jt(f.tree, d, e, r);
            let m = new Jt(c, d, e, r);
            return o & it.IncludeAnonymous || !m.type.isAnonymous ? m : m.nextChild(t < 0 ? c.children.length - 1 : 0, t, n, s, o);
          }
        }
      }
      if (o & it.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
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
    if (!(n & it.IgnoreOverlays) && (s = Ns.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = n & it.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new Jt(s.tree, s.overlay[0].from + this.from, -1, this);
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
function rc(i, e, t, n) {
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
function Gl(i, e, t = e.length - 1) {
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
class Ay {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class si extends Td {
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
    return o < 0 ? null : new si(this.context, this, o);
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
    if (n & it.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return o < 0 ? null : new si(this.context, this, o);
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
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new si(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new si(this.context, this._parent, e.findChild(
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
    return new Je(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function $d(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let o = 1; o < i.length; o++) {
    let r = i[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let n = t instanceof Jt && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new Ty(s, t);
}
class Ty {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return $d(this.heads);
  }
}
function $y(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let o = n instanceof Jt ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [n])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Ns.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new Jt(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [n])).push(Gs(l, e, t, !1));
      }
    }
  return s ? $d(s) : n;
}
class jl {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~it.EnterBracketed, e instanceof Jt)
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
    return e ? e instanceof Jt ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
    return this.buffer ? n & it.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & it.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & it.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
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
          if (this.mode & it.IncludeAnonymous || l instanceof ci || !l.type.isAnonymous || Ca(l))
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
      t = new si(this.buffer, t, this.stack[s]);
    return this.bufferNode = new si(this.buffer, t, this.index);
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
      return Gl(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return Gl(this._tree, e, s);
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
function Ca(i) {
  return i.children.some((e) => e instanceof ci || !e.type.isAnonymous || Ca(e));
}
function Dy(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = Sy, reused: o = [], minRepeatType: r = n.types.length } = i, l = Array.isArray(t) ? new Sa(t, t.length) : t, a = n.types, u = 0, c = 0;
  function d(P, z, R, Y, H, ie) {
    let { id: K, start: T, end: F, size: ge } = l, ve = c, se = u;
    if (ge < 0)
      if (l.next(), ge == -1) {
        let Me = o[K];
        R.push(Me), Y.push(T - P);
        return;
      } else if (ge == -3) {
        u = K;
        return;
      } else if (ge == -4) {
        c = K;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ge}`);
    let ae = a[K], Be, xe, De = T - P;
    if (F - T <= s && (xe = v(l.pos - z, H))) {
      let Me = new Uint16Array(xe.size - xe.skip), J = l.pos - xe.size, Ye = Me.length;
      for (; l.pos > J; )
        Ye = x(xe.start, Me, Ye);
      Be = new ci(Me, F - xe.start, n), De = xe.start - P;
    } else {
      let Me = l.pos - ge;
      l.next();
      let J = [], Ye = [], he = K >= r ? K : -1, Se = 0, ne = F;
      for (; l.pos > Me; )
        he >= 0 && l.id == he && l.size >= 0 ? (l.end <= ne - s && (m(J, Ye, T, Se, l.end, ne, he, ve, se), Se = J.length, ne = l.end), l.next()) : ie > 2500 ? h(T, Me, J, Ye) : d(T, Me, J, Ye, he, ie + 1);
      if (he >= 0 && Se > 0 && Se < J.length && m(J, Ye, T, Se, T, ne, he, ve, se), J.reverse(), Ye.reverse(), he > -1 && Se > 0) {
        let q = f(ae, se);
        Be = Ma(ae, J, Ye, 0, J.length, 0, F - T, q, q);
      } else
        Be = y(ae, J, Ye, F - T, ve - F, se);
    }
    R.push(Be), Y.push(De);
  }
  function h(P, z, R, Y) {
    let H = [], ie = 0, K = -1;
    for (; l.pos > z; ) {
      let { id: T, start: F, end: ge, size: ve } = l;
      if (ve > 4)
        l.next();
      else {
        if (K > -1 && F < K)
          break;
        K < 0 && (K = ge - s), H.push(T, F, ge), ie++, l.next();
      }
    }
    if (ie) {
      let T = new Uint16Array(ie * 4), F = H[H.length - 2];
      for (let ge = H.length - 3, ve = 0; ge >= 0; ge -= 3)
        T[ve++] = H[ge], T[ve++] = H[ge + 1] - F, T[ve++] = H[ge + 2] - F, T[ve++] = ve;
      R.push(new ci(T, H[2] - F, n)), Y.push(F - P);
    }
  }
  function f(P, z) {
    return (R, Y, H) => {
      let ie = 0, K = R.length - 1, T, F;
      if (K >= 0 && (T = R[K]) instanceof Je) {
        if (!K && T.type == P && T.length == H)
          return T;
        (F = T.prop(Pe.lookAhead)) && (ie = Y[K] + T.length + F);
      }
      return y(P, R, Y, H, ie, z);
    };
  }
  function m(P, z, R, Y, H, ie, K, T, F) {
    let ge = [], ve = [];
    for (; P.length > Y; )
      ge.push(P.pop()), ve.push(z.pop() + R - H);
    P.push(y(n.types[K], ge, ve, ie - H, T - ie, F)), z.push(H - R);
  }
  function y(P, z, R, Y, H, ie, K) {
    if (ie) {
      let T = [Pe.contextHash, ie];
      K = K ? [T].concat(K) : [T];
    }
    if (H > 25) {
      let T = [Pe.lookAhead, H];
      K = K ? [T].concat(K) : [T];
    }
    return new Je(P, z, R, Y, K);
  }
  function v(P, z) {
    let R = l.fork(), Y = 0, H = 0, ie = 0, K = R.end - s, T = { size: 0, start: 0, skip: 0 };
    e: for (let F = R.pos - P; R.pos > F; ) {
      let ge = R.size;
      if (R.id == z && ge >= 0) {
        T.size = Y, T.start = H, T.skip = ie, ie += 4, Y += 4, R.next();
        continue;
      }
      let ve = R.pos - ge;
      if (ge < 0 || ve < F || R.start < K)
        break;
      let se = R.id >= r ? 4 : 0, ae = R.start;
      for (R.next(); R.pos > ve; ) {
        if (R.size < 0)
          if (R.size == -3 || R.size == -4)
            se += 4;
          else
            break e;
        else R.id >= r && (se += 4);
        R.next();
      }
      H = ae, Y += ge, ie += se;
    }
    return (z < 0 || Y == P) && (T.size = Y, T.start = H, T.skip = ie), T.size > 4 ? T : void 0;
  }
  function x(P, z, R) {
    let { id: Y, start: H, end: ie, size: K } = l;
    if (l.next(), K >= 0 && Y < r) {
      let T = R;
      if (K > 4) {
        let F = l.pos - (K - 4);
        for (; l.pos > F; )
          R = x(P, z, R);
      }
      z[--R] = T, z[--R] = ie - P, z[--R] = H - P, z[--R] = Y;
    } else K == -3 ? u = Y : K == -4 && (c = Y);
    return R;
  }
  let S = [], $ = [];
  for (; l.pos > 0; )
    d(i.start || 0, i.bufferStart || 0, S, $, -1, 0);
  let N = (e = i.length) !== null && e !== void 0 ? e : S.length ? $[0] + S[0].length : 0;
  return new Je(a[i.topID], S.reverse(), $.reverse(), N);
}
const lc = /* @__PURE__ */ new WeakMap();
function Ho(i, e) {
  if (!i.isAnonymous || e instanceof ci || e.type != i)
    return 1;
  let t = lc.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof Je)) {
        t = 1;
        break;
      }
      t += Ho(i, n);
    }
    lc.set(e, t);
  }
  return t;
}
function Ma(i, e, t, n, s, o, r, l, a) {
  let u = 0;
  for (let m = n; m < s; m++)
    u += Ho(i, e[m]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], h = [];
  function f(m, y, v, x, S) {
    for (let $ = v; $ < x; ) {
      let N = $, P = y[$], z = Ho(i, m[$]);
      for ($++; $ < x; $++) {
        let R = Ho(i, m[$]);
        if (z + R >= c)
          break;
        z += R;
      }
      if ($ == N + 1) {
        if (z > c) {
          let R = m[N];
          f(R.children, R.positions, 0, R.children.length, y[N] + S);
          continue;
        }
        d.push(m[N]);
      } else {
        let R = y[$ - 1] + m[$ - 1].length - P;
        d.push(Ma(i, m, y, N, $, P, R, null, a));
      }
      h.push(P + S - o);
    }
  }
  return f(e, t, n, s, 0), (l || a)(d, h, r);
}
class $i {
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
    let s = [new $i(0, e.length, e, 0, !1, n)];
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
            h = f >= m ? null : new $i(f, m, h.tree, h.offset + u, l > 0, !!c);
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
class Dd {
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
    return typeof e == "string" && (e = new Ly(e)), n = n ? n.length ? n.map((s) => new el(s.from, s.to)) : [new el(0, 0)] : [new el(0, e.length)], this.createParse(e, t || [], n);
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
class Ly {
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
new Pe({ perNode: !0 });
let By = 0;
class Yt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = By++;
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
    let t = new ir(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : ir.get(n.base || n, n.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let Oy = 0;
class ir {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Oy++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && Ey(t, l.modified));
    if (n)
      return n;
    let s = [], o = new Yt(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Iy(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(ir.get(l, a));
    return o;
  }
}
function Ey(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function Iy(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function Ry(i) {
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
        let c = new js(n, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return Ld.add(e);
}
const Ld = new Pe({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth < e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new js(s.tags, s.mode, s.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class js {
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
js.empty = new js([], 2, null);
function Bd(i, e) {
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
function Py(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function Ny(i, e, t, n = 0, s = i.length) {
  let o = new Vy(n, Array.isArray(e) ? e : [e], t);
  o.highlightRange(i.cursor(), n, s, "", o.highlighters), o.flush(s);
}
class Vy {
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
    let u = s, c = Hy(e) || js.empty, d = Py(o, c.tags);
    if (d && (u && (u += " "), u += d, c.mode == 1 && (s += (s ? " " : "") + d)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let h = e.tree && e.tree.prop(Pe.mounted);
    if (h && h.overlay) {
      let f = e.node.enter(h.overlay[0].from + l, 1), m = this.highlighters.filter((v) => !v.scope || v.scope(h.tree.type)), y = e.firstChild();
      for (let v = 0, x = l; ; v++) {
        let S = v < h.overlay.length ? h.overlay[v] : null, $ = S ? S.from + l : a, N = Math.max(t, x), P = Math.min(n, $);
        if (N < P && y)
          for (; e.from < P && (this.highlightRange(e, N, P, s, o), this.startSpan(Math.min(P, e.to), u), !(e.to >= $ || !e.nextSibling())); )
            ;
        if (!S || $ > n)
          break;
        x = S.to + l, x > t && (this.highlightRange(f.cursor(), Math.max(t, S.from + l), Math.min(n, x), "", m), this.startSpan(Math.min(n, x), u));
      }
      y && e.parent();
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
function Hy(i) {
  let e = i.type.prop(Ld);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const re = Yt.define, wo = re(), Jn = re(), ac = re(Jn), uc = re(Jn), Zn = re(), xo = re(Zn), tl = re(Zn), xn = re(), yi = re(xn), bn = re(), kn = re(), ql = re(), bs = re(ql), So = re(), Te = {
  /**
  A comment.
  */
  comment: wo,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: re(wo),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: re(wo),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: re(wo),
  /**
  Any kind of identifier.
  */
  name: Jn,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: re(Jn),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: ac,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: re(ac),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: uc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: re(uc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: re(Jn),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: re(Jn),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: re(Jn),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: re(Jn),
  /**
  A literal value.
  */
  literal: Zn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: xo,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: re(xo),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: re(xo),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: re(xo),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: tl,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: re(tl),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: re(tl),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: re(Zn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: re(Zn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: re(Zn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: re(Zn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: re(Zn),
  /**
  A language keyword.
  */
  keyword: bn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: re(bn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: re(bn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: re(bn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: re(bn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: re(bn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: re(bn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: re(bn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: re(bn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: re(bn),
  /**
  An operator.
  */
  operator: kn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: re(kn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: re(kn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: re(kn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: re(kn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: re(kn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: re(kn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: re(kn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: re(kn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: re(kn),
  /**
  Program or markup punctuation.
  */
  punctuation: ql,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: re(ql),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: bs,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: re(bs),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: re(bs),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: re(bs),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: re(bs),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: xn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: yi,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: re(yi),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: re(yi),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: re(yi),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: re(yi),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: re(yi),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: re(yi),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: re(xn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: re(xn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: re(xn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: re(xn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: re(xn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: re(xn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: re(xn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: re(xn),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: re(),
  /**
  Deleted text.
  */
  deleted: re(),
  /**
  Changed text.
  */
  changed: re(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: re(),
  /**
  Metadata or meta-instruction.
  */
  meta: So,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: re(So),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: re(So),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: re(So),
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
for (let i in Te) {
  let e = Te[i];
  e instanceof Yt && (e.name = i);
}
Bd([
  { tag: Te.link, class: "tok-link" },
  { tag: Te.heading, class: "tok-heading" },
  { tag: Te.emphasis, class: "tok-emphasis" },
  { tag: Te.strong, class: "tok-strong" },
  { tag: Te.keyword, class: "tok-keyword" },
  { tag: Te.atom, class: "tok-atom" },
  { tag: Te.bool, class: "tok-bool" },
  { tag: Te.url, class: "tok-url" },
  { tag: Te.labelName, class: "tok-labelName" },
  { tag: Te.inserted, class: "tok-inserted" },
  { tag: Te.deleted, class: "tok-deleted" },
  { tag: Te.literal, class: "tok-literal" },
  { tag: Te.string, class: "tok-string" },
  { tag: Te.number, class: "tok-number" },
  { tag: [Te.regexp, Te.escape, Te.special(Te.string)], class: "tok-string2" },
  { tag: Te.variableName, class: "tok-variableName" },
  { tag: Te.local(Te.variableName), class: "tok-variableName tok-local" },
  { tag: Te.definition(Te.variableName), class: "tok-variableName tok-definition" },
  { tag: Te.special(Te.variableName), class: "tok-variableName2" },
  { tag: Te.definition(Te.propertyName), class: "tok-propertyName tok-definition" },
  { tag: Te.typeName, class: "tok-typeName" },
  { tag: Te.namespace, class: "tok-namespace" },
  { tag: Te.className, class: "tok-className" },
  { tag: Te.macroName, class: "tok-macroName" },
  { tag: Te.propertyName, class: "tok-propertyName" },
  { tag: Te.operator, class: "tok-operator" },
  { tag: Te.comment, class: "tok-comment" },
  { tag: Te.meta, class: "tok-meta" },
  { tag: Te.invalid, class: "tok-invalid" },
  { tag: Te.punctuation, class: "tok-punctuation" }
]);
var nl;
const Gi = /* @__PURE__ */ new Pe();
function zy(i) {
  return pe.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const Wy = /* @__PURE__ */ new Pe();
class ln {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, We.prototype.hasOwnProperty("tree") || Object.defineProperty(We.prototype, "tree", { get() {
      return Dn(this);
    } }), this.parser = t, this.extension = [
      us.of(this),
      We.languageData.of((o, r, l) => {
        let a = cc(o, r, l), u = a.type.prop(Gi);
        if (!u)
          return [];
        let c = o.facet(u), d = a.type.prop(Wy);
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
    return cc(e, t, n).type.prop(Gi) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(us);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (o, r) => {
      if (o.prop(Gi) == this.data) {
        n.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Pe.mounted);
      if (l) {
        if (l.tree.prop(Gi) == this.data) {
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
        u instanceof Je && s(u, o.positions[a] + r);
      }
    };
    return s(Dn(e), 0), n;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
ln.setState = /* @__PURE__ */ Ge.define();
function cc(i, e, t) {
  let n = i.facet(us), s = Dn(i).topNode;
  if (!n || n.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, it.ExcludeBuffers | it.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function Dn(i) {
  let e = i.field(ln.state, !1);
  return e ? e.tree : Je.empty;
}
class Fy {
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
let ks = null;
class ls {
  constructor(e, t, n = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new ls(e, t, [], Je.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new Fy(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != Je.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var n;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped($i.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped($i.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = ks;
    ks = this;
    try {
      return e();
    } finally {
      ks = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = hc(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, d, h) => a.push({ fromA: u, toA: c, fromB: d, toB: h })), n = $i.applyChanges(n, a), s = Je.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), d = e.mapPos(u.to, -1);
          c < d && l.push({ from: c, to: d });
        }
      }
    }
    return new ls(this.parser, t, n, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = hc(this.fragments, s, o), this.skipped.splice(n--, 1));
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
    return new class extends Dd {
      createParse(t, n, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = ks;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new Je(Nt.none, [], [], r - o);
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
    return ks;
  }
}
function hc(i, e, t) {
  return $i.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class as {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new as(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = ls.create(e.facet(us).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new as(n);
  }
}
ln.state = /* @__PURE__ */ cn.define({
  create: as.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(ln.setState))
        return t.value;
    return e.startState.facet(us) != e.state.facet(us) ? as.init(e.state) : i.apply(e);
  }
});
let Od = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Od = (i) => {
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
const il = typeof navigator < "u" && (!((nl = navigator.scheduling) === null || nl === void 0) && nl.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Ky = /* @__PURE__ */ Wt.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(ln.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(ln.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Od(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: s } } = this.view, o = n.field(ln.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !il ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && n.doc.length > s + 1e3, a = o.context.work(() => il && il() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: ln.setState.of(new as(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => rn(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), us = /* @__PURE__ */ pe.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    ln.state,
    Ky,
    ye.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), _y = /* @__PURE__ */ pe.define(), Aa = /* @__PURE__ */ pe.define({
  combine: (i) => {
    if (!i.length)
      return "  ";
    let e = i[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(i[0]));
    return e;
  }
});
function Ei(i) {
  let e = i.facet(Aa);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function sr(i, e) {
  let t = "", n = i.tabSize, s = i.facet(Aa)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Ed(i, e) {
  i instanceof We && (i = new xr(i));
  for (let n of i.state.facet(_y)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = Dn(i.state);
  return t.length >= e ? Uy(i, t, e) : null;
}
class xr {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Ei(e);
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
    return mr(e, this.state.tabSize, t);
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
const Id = /* @__PURE__ */ new Pe();
function Uy(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let o = [];
    for (let r = s; r && !(r.from < n.node.from || r.to > n.node.to || r.from == n.node.from && r.type == n.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      n = { node: o[r], next: n };
  }
  return Rd(n, i, t);
}
function Rd(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = jy(n.node);
    if (s)
      return s(Ta.create(e, t, n));
  }
  return 0;
}
function Gy(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function jy(i) {
  let e = i.type.prop(Id);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(Pe.closedBy))) {
    let s = i.lastChild, o = s && n.indexOf(s.name) > -1;
    return (r) => Jy(r, !0, 1, void 0, o && !Gy(r) ? s.from : void 0);
  }
  return i.parent == null ? qy : null;
}
function qy() {
  return 0;
}
class Ta extends xr {
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
    return new Ta(e, t, n);
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
      if (Yy(n, e))
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
    return Rd(this.context.next, this.base, this.pos);
  }
}
function Yy(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function Xy(i) {
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
function Jy(i, e, t, n, s) {
  let o = i.textAfter, r = o.match(/^\s*/)[0].length, l = n && o.slice(r, r + n.length) == n || s == i.pos + r, a = Xy(i);
  return a ? l ? i.column(a.from) : i.column(a.to) : i.baseIndent + (l ? 0 : i.unit * t);
}
class Sr {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(l) {
      let a = ri.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof ln ? (l) => l.prop(Gi) == r.data : r ? (l) => l == r : void 0, this.style = Bd(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = n ? new ri(n) : null, this.themeType = t.themeType;
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
    return new Sr(e, t || {});
  }
}
const Yl = /* @__PURE__ */ pe.define(), Zy = /* @__PURE__ */ pe.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function sl(i) {
  let e = i.facet(Yl);
  return e.length ? e : i.facet(Zy);
}
function Qy(i, e) {
  let t = [t0], n;
  return i instanceof Sr && (i.module && t.push(ye.styleModule.of(i.module)), n = i.themeType), n ? t.push(Yl.computeN([ye.darkTheme], (s) => s.facet(ye.darkTheme) == (n == "dark") ? [i] : [])) : t.push(Yl.of(i)), t;
}
class e0 {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Dn(e.state), this.decorations = this.buildDeco(e, sl(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Dn(e.state), n = sl(e.state), s = n != sl(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return qe.none;
    let n = new Ai();
    for (let { from: s, to: o } of e.visibleRanges)
      Ny(this.tree, t, (r, l, a) => {
        n.add(r, l, this.markCache[a] || (this.markCache[a] = qe.mark({ class: a })));
      }, s, o);
    return n.finish();
  }
}
const t0 = /* @__PURE__ */ dr.high(/* @__PURE__ */ Wt.fromClass(e0, {
  decorations: (i) => i.decorations
})), n0 = 1e4, i0 = "()[]{}", s0 = /* @__PURE__ */ new Pe();
function Xl(i, e, t) {
  let n = i.prop(e < 0 ? Pe.openedBy : Pe.closedBy);
  if (n)
    return n;
  if (i.name.length == 1) {
    let s = t.indexOf(i.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function Jl(i) {
  let e = i.type.prop(s0);
  return e ? e(i.node) : i;
}
function ji(i, e, t, n = {}) {
  let s = n.maxScanDistance || n0, o = n.brackets || i0, r = Dn(i), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = Xl(a.type, t, o);
    if (u && a.from < a.to) {
      let c = Jl(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return o0(i, e, t, a, c, u, o);
    }
  }
  return r0(i, e, t, r, l.type, s, o);
}
function o0(i, e, t, n, s, o, r) {
  let l = n.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let d = Jl(c);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (Xl(c.type, t, r))
          u++;
        else if (Xl(c.type, -t, r)) {
          if (u == 0) {
            let d = Jl(c);
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
function r0(i, e, t, n, s, o, r) {
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
    for (let y = t > 0 ? 0 : f.length - 1, v = t > 0 ? f.length : -1; y != v; y += t) {
      let x = r.indexOf(f[y]);
      if (!(x < 0 || n.resolveInner(m + y, 1).type != s))
        if (x % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: u, end: { from: m + y, to: m + y + 1 }, matched: x >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (h += f.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function dc(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let o = s;
  for (let r = n; r < e; r++)
    i.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Pd {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = dc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : dc(this.string, null, this.tabSize);
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
function l0(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || a0,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || La,
    mergeTokens: i.mergeTokens !== !1
  };
}
function a0(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const fc = /* @__PURE__ */ new WeakMap();
class $a extends ln {
  constructor(e) {
    let t = zy(e.languageData), n = l0(e), s, o = new class extends Dd {
      createParse(r, l, a) {
        return new c0(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = f0(t, this), s = this, this.streamParser = n, this.stateAfter = new Pe({ perNode: !0 }), this.tokenTable = e.tokenTable ? new zd(n.tokenTable) : d0;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new $a(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = fc.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Da(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = n ? n(a.from) : -1, d = new Pd(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; d.pos < u - a.from; )
          Vd(this.streamParser.token, d, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return n && t == null && fc.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Da(i, e, t, n, s) {
  let o = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (o)
    return { state: i.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof Je && a < s && Da(i, l, a, n, s);
    if (u)
      return u;
  }
  return null;
}
function Nd(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < n && l instanceof Je) {
      if (!(a = Nd(i, l, t - r, n - r, s)))
        break;
      return s ? new Je(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function u0(i, e, t, n, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Da(i, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= n && (u = Nd(i, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: i.streamParser.startState(s ? Ei(s) : 4), tree: Je.empty };
}
class c0 {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = ls.get(), r = s[0].from, { state: l, tree: a } = u0(e, n, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Ei(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = ls.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
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
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Pd(t, e ? e.state.tabSize : 4, e ? Ei(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = Vd(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = n, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = Je.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: h0,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new Je(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new Je(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function Vd(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const La = /* @__PURE__ */ Object.create(null), qs = [Nt.none], h0 = /* @__PURE__ */ new xa(qs), pc = [], mc = /* @__PURE__ */ Object.create(null), Hd = /* @__PURE__ */ Object.create(null);
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
  Hd[i] = /* @__PURE__ */ Wd(La, e);
class zd {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Hd);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = Wd(this.extra, e)) : 0;
  }
}
const d0 = /* @__PURE__ */ new zd(La);
function ol(i, e) {
  pc.indexOf(i) > -1 || (pc.push(i), console.warn(e));
}
function Wd(i, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = i[u] || Te[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : ol(u, `Modifier ${u} used at start of tag`) : a.length ? ol(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : ol(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((l) => l.id), o = mc[s];
  if (o)
    return o.id;
  let r = mc[s] = Nt.define({
    id: qs.length,
    name: n,
    props: [Ry({ [n]: t })]
  });
  return qs.push(r), r.id;
}
function f0(i, e) {
  let t = Nt.define({ id: qs.length, name: "Document", props: [
    Gi.add(() => i),
    Id.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return qs.push(t), t;
}
je.RTL, je.LTR;
const p0 = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = Oa(i.state, t.from);
  return n.line ? m0(i) : n.block ? v0(i) : !1;
};
function Ba(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const m0 = /* @__PURE__ */ Ba(
  k0,
  0
  /* CommentOption.Toggle */
), g0 = /* @__PURE__ */ Ba(
  Fd,
  0
  /* CommentOption.Toggle */
), v0 = /* @__PURE__ */ Ba(
  (i, e) => Fd(i, e, b0(e)),
  0
  /* CommentOption.Toggle */
);
function Oa(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const ws = 50;
function y0(i, { open: e, close: t }, n, s) {
  let o = i.sliceDoc(n - ws, n), r = i.sliceDoc(s, s + ws), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, d;
  s - n <= 2 * ws ? c = d = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + ws), d = i.sliceDoc(s - ws, s));
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
function b0(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function Fd(i, e, t = e.selection.ranges) {
  let n = t.map((o) => Oa(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let s = t.map((o, r) => y0(e, n[r], o.from, o.to));
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
function k0(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = n.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let d = e.doc.lineAt(c);
      if (u == null && (u = Oa(e, d.from).line, !u))
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
function ps(i, e) {
  return Q.create(i.ranges.map(e), i.mainIndex);
}
function hn(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function dn({ state: i, dispatch: e }, t) {
  let n = ps(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(hn(i, n)), !0);
}
function Cr(i, e) {
  return Q.cursor(e ? i.to : i.from);
}
function Kd(i, e) {
  return dn(i, (t) => t.empty ? i.moveByChar(t, e) : Cr(t, e));
}
function St(i) {
  return i.textDirectionAt(i.state.selection.main.head) == je.LTR;
}
const _d = (i) => Kd(i, !St(i)), Ud = (i) => Kd(i, St(i));
function Gd(i, e) {
  return dn(i, (t) => t.empty ? i.moveByGroup(t, e) : Cr(t, e));
}
const w0 = (i) => Gd(i, !St(i)), x0 = (i) => Gd(i, St(i));
function S0(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Mr(i, e, t) {
  let n = Dn(i).resolveInner(e.head), s = t ? Pe.closedBy : Pe.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? n.childAfter(a) : n.childBefore(a);
    if (!u)
      break;
    S0(i, u, s) ? n = u : a = t ? u.to : u.from;
  }
  let o = n.type.prop(s), r, l;
  return o && (r = t ? ji(i, n.from, 1) : ji(i, n.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? n.to : n.from, Q.cursor(l, t ? -1 : 1);
}
const C0 = (i) => dn(i, (e) => Mr(i.state, e, !St(i))), M0 = (i) => dn(i, (e) => Mr(i.state, e, St(i)));
function jd(i, e) {
  return dn(i, (t) => {
    if (!t.empty)
      return Cr(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const qd = (i) => jd(i, !1), Yd = (i) => jd(i, !0);
function Xd(i) {
  let e = i.scrollDOM.clientHeight < i.scrollDOM.scrollHeight - 2, t = 0, n = 0, s;
  if (e) {
    for (let o of i.state.facet(ye.scrollMargins)) {
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
function Jd(i, e) {
  let t = Xd(i), { state: n } = i, s = ps(n.selection, (r) => r.empty ? i.moveVertically(r, e, t.height) : Cr(r, e));
  if (s.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = i.coordsAtPos(n.selection.main.head), l = i.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = ye.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return i.dispatch(hn(n, s), { effects: o }), !0;
}
const gc = (i) => Jd(i, !1), Zl = (i) => Jd(i, !0);
function hi(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let o = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (s = Q.cursor(n.from + o));
  }
  return s;
}
const A0 = (i) => dn(i, (e) => hi(i, e, !0)), T0 = (i) => dn(i, (e) => hi(i, e, !1)), $0 = (i) => dn(i, (e) => hi(i, e, !St(i))), D0 = (i) => dn(i, (e) => hi(i, e, St(i))), L0 = (i) => dn(i, (e) => i.moveToLineBoundary(e, !1, !1)), B0 = (i) => dn(i, (e) => i.moveToLineBoundary(e, !0, !1));
function O0(i, e, t) {
  let n = !1, s = ps(i.selection, (o) => {
    let r = ji(i, o.head, -1) || ji(i, o.head, 1) || o.head > 0 && ji(i, o.head - 1, 1) || o.head < i.doc.length && ji(i, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    n = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return Q.cursor(l);
  });
  return n ? (e(hn(i, s)), !0) : !1;
}
const E0 = ({ state: i, dispatch: e }) => O0(i, e);
function Qt(i, e, t) {
  let n = ps(i.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = Q.range(s.head, s.anchor));
    let o = t(s);
    return Q.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(i.state.selection) ? !1 : (i.dispatch(hn(i.state, n)), !0);
}
function Zd(i, e) {
  return Qt(i, e, (t) => i.moveByChar(t, e));
}
const Qd = (i) => Zd(i, !St(i)), ef = (i) => Zd(i, St(i));
function tf(i, e) {
  return Qt(i, e, (t) => i.moveByGroup(t, e));
}
const I0 = (i) => tf(i, !St(i)), R0 = (i) => tf(i, St(i)), P0 = (i) => {
  let e = !St(i);
  return Qt(i, e, (t) => Mr(i.state, t, e));
}, N0 = (i) => {
  let e = St(i);
  return Qt(i, e, (t) => Mr(i.state, t, e));
};
function nf(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e));
}
const sf = (i) => nf(i, !1), of = (i) => nf(i, !0);
function rf(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e, Xd(i).height));
}
const vc = (i) => rf(i, !1), yc = (i) => rf(i, !0), V0 = (i) => Qt(i, !0, (e) => hi(i, e, !0)), H0 = (i) => Qt(i, !1, (e) => hi(i, e, !1)), z0 = (i) => {
  let e = !St(i);
  return Qt(i, e, (t) => hi(i, t, e));
}, W0 = (i) => {
  let e = St(i);
  return Qt(i, e, (t) => hi(i, t, e));
}, F0 = (i) => Qt(i, !1, (e) => Q.cursor(i.lineBlockAt(e.head).from)), K0 = (i) => Qt(i, !0, (e) => Q.cursor(i.lineBlockAt(e.head).to)), bc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: 0 })), !0), kc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.doc.length })), !0), wc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.selection.main.anchor, head: 0 })), !0), xc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), _0 = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), U0 = ({ state: i, dispatch: e }) => {
  let t = Ar(i).map(({ from: n, to: s }) => Q.undirectionalRange(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: Q.create(t), userEvent: "select" })), !0;
}, G0 = ({ state: i, dispatch: e }) => {
  let t = ps(i.selection, (n) => {
    let s = Dn(i), o = s.resolveStack(n.from, 1);
    if (n.empty) {
      let r = s.resolveStack(n.from, -1);
      r.node.from >= o.node.from && r.node.to <= o.node.to && (o = r);
    }
    for (let r = o; r; r = r.next) {
      let { node: l } = r;
      if ((l.from < n.from && l.to >= n.to || l.to > n.to && l.from <= n.from) && r.next)
        return Q.undirectionalRange(l.from, l.to);
    }
    return n;
  });
  return t.eq(i.selection) ? !1 : (e(hn(i, t)), !0);
};
function lf(i, e) {
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
  return s.length == n.ranges.length ? !1 : (i.dispatch(hn(t, Q.create(s, s.length - 1))), !0);
}
const j0 = (i) => lf(i, !1), q0 = (i) => lf(i, !0), Y0 = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = Q.create([t.main]) : t.main.empty || (n = Q.create([Q.cursor(t.main.head)])), n ? (e(hn(i, n)), !0) : !1;
};
function no(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = Co(i, a, !1)) : a > r && (t = "delete.forward", a = Co(i, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = Co(i, r, !1), l = Co(i, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: Q.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? ye.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Co(i, e, t) {
  if (i instanceof ye)
    for (let n of i.state.facet(ye.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const af = (i, e, t) => no(i, (n) => {
  let s = n.from, { state: o } = i, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = mr(l, o.tabSize), c = u % Ei(o) || Ei(o);
    for (let d = 0; d < c && l[l.length - 1 - d] == " "; d++)
      s--;
    a = s;
  } else
    a = kt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = kt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), Ql = (i) => af(i, !1, !0), uf = (i) => af(i, !0, !1), cf = (i, e) => no(i, (t) => {
  let n = t.head, { state: s } = i, o = s.doc.lineAt(n), r = s.charCategorizer(n);
  for (let l = null; ; ) {
    if (n == (e ? o.to : o.from)) {
      n == t.head && o.number != (e ? s.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let a = kt(o.text, n - o.from, e) + o.from, u = o.text.slice(Math.min(n, a) - o.from, Math.max(n, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || n != t.head) && (l = c), n = a;
  }
  return n;
}), hf = (i) => cf(i, !1), X0 = (i) => cf(i, !0), J0 = (i) => no(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), Z0 = (i) => no(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), Q0 = (i) => no(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), eb = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: Ve.of(["", ""]) },
    range: Q.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, tb = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, o = i.doc.lineAt(s), r = s == o.from ? s - 1 : kt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : kt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: i.doc.slice(s, l).append(i.doc.slice(r, s)) },
      range: Q.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(i.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Ar(i) {
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
function df(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [], s = [];
  for (let o of Ar(i)) {
    if (t ? o.to == i.doc.length : o.from == 0)
      continue;
    let r = i.doc.lineAt(t ? o.to + 1 : o.from - 1), l = r.length + 1;
    if (t) {
      n.push({ from: o.to, to: r.to }, { from: o.from, insert: r.text + i.lineBreak });
      for (let a of o.ranges)
        s.push(Q.range(Math.min(i.doc.length, a.anchor + l), Math.min(i.doc.length, a.head + l)));
    } else {
      n.push({ from: r.from, to: o.from }, { from: o.to, insert: i.lineBreak + r.text });
      for (let a of o.ranges)
        s.push(Q.range(a.anchor - l, a.head - l));
    }
  }
  return n.length ? (e(i.update({
    changes: n,
    scrollIntoView: !0,
    selection: Q.create(s, i.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const nb = ({ state: i, dispatch: e }) => df(i, e, !1), ib = ({ state: i, dispatch: e }) => df(i, e, !0);
function ff(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [];
  for (let o of Ar(i))
    t ? n.push({ from: o.from, insert: i.doc.slice(o.from, o.to) + i.lineBreak }) : n.push({ from: o.to, insert: i.lineBreak + i.doc.slice(o.from, o.to) });
  let s = i.changes(n);
  return e(i.update({
    changes: s,
    selection: i.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const sb = ({ state: i, dispatch: e }) => ff(i, e, !1), ob = ({ state: i, dispatch: e }) => ff(i, e, !0), rb = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(Ar(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), n = ps(e.selection, (s) => {
    let o;
    if (i.lineWrapping) {
      let r = i.lineBlockAt(s.head), l = i.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + i.documentTop - l.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, o);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function lb(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Dn(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), o;
  return n && s && n.to <= e && s.from >= e && (o = n.type.prop(Pe.closedBy)) && o.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const Sc = /* @__PURE__ */ pf(!1), ab = /* @__PURE__ */ pf(!0);
function pf(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !i && o == r && lb(e, o);
      i && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new xr(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Ed(u, o);
      for (c == null && (c = mr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", sr(e, c)];
      return a && d.push(sr(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: Ve.of(d) },
        range: Q.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Ea(i, e) {
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
      range: Q.range(o.mapPos(n.anchor, 1), o.mapPos(n.head, 1))
    };
  });
}
const ub = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new xr(i, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = Ea(i, (o, r, l) => {
    let a = Ed(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = sr(i, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, cb = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ea(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(Aa) });
}), { userEvent: "input.indent" })), !0), hb = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ea(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = mr(s, i.tabSize), r = 0, l = sr(i, Math.max(0, o - Ei(i)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  n.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), db = (i) => (i.setTabFocusMode(), !0), fb = [
  { key: "Ctrl-b", run: _d, shift: Qd, preventDefault: !0 },
  { key: "Ctrl-f", run: Ud, shift: ef },
  { key: "Ctrl-p", run: qd, shift: sf },
  { key: "Ctrl-n", run: Yd, shift: of },
  { key: "Ctrl-a", run: L0, shift: F0 },
  { key: "Ctrl-e", run: B0, shift: K0 },
  { key: "Ctrl-d", run: uf },
  { key: "Ctrl-h", run: Ql },
  { key: "Ctrl-k", run: J0 },
  { key: "Ctrl-Alt-h", run: hf },
  { key: "Ctrl-o", run: eb },
  { key: "Ctrl-t", run: tb },
  { key: "Ctrl-v", run: Zl }
], pb = /* @__PURE__ */ [
  { key: "ArrowLeft", run: _d, shift: Qd, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: w0, shift: I0, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: $0, shift: z0, preventDefault: !0 },
  { key: "ArrowRight", run: Ud, shift: ef, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: x0, shift: R0, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: D0, shift: W0, preventDefault: !0 },
  { key: "ArrowUp", run: qd, shift: sf, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: bc, shift: wc },
  { mac: "Ctrl-ArrowUp", run: gc, shift: vc },
  { key: "ArrowDown", run: Yd, shift: of, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: kc, shift: xc },
  { mac: "Ctrl-ArrowDown", run: Zl, shift: yc },
  { key: "PageUp", run: gc, shift: vc },
  { key: "PageDown", run: Zl, shift: yc },
  { key: "Home", run: T0, shift: H0, preventDefault: !0 },
  { key: "Mod-Home", run: bc, shift: wc },
  { key: "End", run: A0, shift: V0, preventDefault: !0 },
  { key: "Mod-End", run: kc, shift: xc },
  { key: "Enter", run: Sc, shift: Sc },
  { key: "Mod-a", run: _0 },
  { key: "Backspace", run: Ql, shift: Ql, preventDefault: !0 },
  { key: "Delete", run: uf, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: hf, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: X0, preventDefault: !0 },
  { mac: "Mod-Backspace", run: Z0, preventDefault: !0 },
  { mac: "Mod-Delete", run: Q0, preventDefault: !0 }
].concat(/* @__PURE__ */ fb.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), mb = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: C0, shift: P0 },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: M0, shift: N0 },
  { key: "Alt-ArrowUp", run: nb },
  { key: "Shift-Alt-ArrowUp", run: sb },
  { key: "Alt-ArrowDown", run: ib },
  { key: "Shift-Alt-ArrowDown", run: ob },
  { key: "Mod-Alt-ArrowUp", run: j0 },
  { key: "Mod-Alt-ArrowDown", run: q0 },
  { key: "Escape", run: Y0 },
  { key: "Mod-Enter", run: ab },
  { key: "Alt-l", mac: "Ctrl-l", run: U0 },
  { key: "Mod-i", run: G0, preventDefault: !0 },
  { key: "Mod-[", run: hb },
  { key: "Mod-]", run: cb },
  { key: "Mod-Alt-\\", run: ub },
  { key: "Shift-Mod-k", run: rb },
  { key: "Shift-Mod-\\", run: E0 },
  { key: "Mod-/", run: p0 },
  { key: "Alt-A", mac: "Ctrl-A", run: g0 },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: db }
].concat(pb);
class Cc {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.diagnostic = n;
  }
}
class xi {
  constructor(e, t, n) {
    this.diagnostics = e, this.panel = t, this.selected = n;
  }
  static init(e, t, n) {
    let s = n.facet(Ys).markerFilter;
    s && (e = s(e, n));
    let o = e.slice().sort((f, m) => f.from - m.from || f.to - m.to), r = new Ai(), l = [], a = 0, u = n.doc.iter(), c = 0, d = n.doc.length;
    for (let f = 0; ; ) {
      let m = f == o.length ? null : o[f];
      if (!m && !l.length)
        break;
      let y, v;
      if (l.length)
        y = a, v = l.reduce(($, N) => Math.min($, N.to), m && m.from > y ? m.from : 1e8);
      else {
        if (y = m.from, y > d)
          break;
        v = m.to, l.push(m), f++;
      }
      for (; f < o.length; ) {
        let $ = o[f];
        if ($.from == y && ($.to > $.from || $.to == y))
          l.push($), f++, v = Math.min($.to, v);
        else {
          v = Math.min($.from, v);
          break;
        }
      }
      v = Math.min(v, d);
      let x = !1;
      if (l.some(($) => $.from == y && ($.to == v || v == d)) && (x = y == v, !x && v - y < 10)) {
        let $ = y - (c + u.value.length);
        $ > 0 && (u.next($), c = y);
        for (let N = y; ; ) {
          if (N >= v) {
            x = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > N)
            break;
          N = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let S = wf(l);
      if (x)
        r.add(y, y, qe.widget({
          widget: new bb(S),
          diagnostics: l.slice()
        }));
      else {
        let $ = l.reduce((N, P) => P.markClass ? N + " " + P.markClass : N, "");
        r.add(y, v, qe.mark({
          class: "cm-lintRange cm-lintRange-" + S + $,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((N) => N.to > v)
        }));
      }
      if (a = v, a == d)
        break;
      for (let $ = 0; $ < l.length; $++)
        l[$].to <= a && l.splice($--, 1);
    }
    let h = r.finish();
    return new xi(h, t, cs(h));
  }
}
function cs(i, e = null, t = 0) {
  let n = null;
  return i.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!n)
        n = new Cc(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(n.diagnostic) < 0)
          return !1;
        n = new Cc(n.from, o, n.diagnostic);
      }
  }), n;
}
function mf(i, e) {
  let t = e.pos, n = e.end || t, s = i.state.facet(Ys).hideOn(i, t, n);
  if (s != null)
    return s;
  let o = i.startState.doc.lineAt(e.pos);
  return !!(i.effects.some((r) => r.is(Tr)) || i.changes.touchesRange(o.from, Math.max(o.to, n)));
}
function gb(i, e) {
  return i.field(an, !1) ? e : e.concat(Ge.appendConfig.of($b));
}
function rl(i, e) {
  return {
    effects: gb(i, [Tr.of(e)])
  };
}
const Tr = /* @__PURE__ */ Ge.define(), gf = /* @__PURE__ */ Ge.define(), vf = /* @__PURE__ */ Ge.define(), an = /* @__PURE__ */ cn.define({
  create() {
    return new xi(qe.none, null, null);
  },
  update(i, e) {
    if (e.docChanged && i.diagnostics.size) {
      let t = i.diagnostics.map(e.changes), n = null, s = i.panel;
      if (i.selected) {
        let o = e.changes.mapPos(i.selected.from, 1);
        n = cs(t, i.selected.diagnostic, o) || cs(t, null, o);
      }
      !t.size && s && e.state.facet(Ys).autoPanel && (s = null), i = new xi(t, s, n);
    }
    for (let t of e.effects)
      if (t.is(Tr)) {
        let n = e.state.facet(Ys).autoPanel ? t.value.length ? or.open : null : i.panel;
        i = xi.init(t.value, n, e.state);
      } else t.is(gf) ? i = new xi(i.diagnostics, t.value ? or.open : null, i.selected) : t.is(vf) && (i = new xi(i.diagnostics, i.panel, t.value));
    return i;
  },
  provide: (i) => [
    _l.from(i, (e) => e.panel),
    ye.decorations.from(i, (e) => e.diagnostics)
  ]
}), vb = /* @__PURE__ */ qe.mark({ class: "cm-lintRange cm-lintRange-active" });
function yb(i, e, t) {
  let { diagnostics: n } = i.state.field(an), s, o = -1, r = -1;
  n.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = i.state.facet(Ys).tooltipFilter;
  return s && l && (s = l(s, i.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: yf(i, s) };
    }
  } : null;
}
function yf(i, e) {
  return An("ul", { class: "cm-tooltip-lint" }, e.map((t) => kf(i, t, !1)));
}
const Mc = (i) => {
  let e = i.state.field(an, !1);
  return !e || !e.panel ? !1 : (i.dispatch({ effects: gf.of(!1) }), !0);
}, Ys = /* @__PURE__ */ pe.define({
  combine(i) {
    return {
      sources: i.map((e) => e.source).filter((e) => e != null),
      ...pr(i.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: Ac,
        tooltipFilter: Ac,
        needsRefresh: (e, t) => e ? t ? (n) => e(n) || t(n) : e : t,
        hideOn: (e, t) => e ? t ? (n, s, o) => e(n, s, o) || t(n, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function Ac(i, e) {
  return i ? e ? (t, n) => e(i(t, n), n) : i : e;
}
function bf(i) {
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
function kf(i, e, t) {
  var n;
  let s = t ? bf(e.actions) : [];
  return An("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, An("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(i) : e.message), (n = e.actions) === null || n === void 0 ? void 0 : n.map((o, r) => {
    let l = !1, a = (f) => {
      if (f.preventDefault(), l)
        return;
      l = !0;
      let m = cs(i.state.field(an).diagnostics, e);
      m && o.apply(i, m.from, m.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, d = c < 0 ? u : [
      u.slice(0, c),
      An("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], h = o.markClass ? " " + o.markClass : "";
    return An("button", {
      type: "button",
      class: "cm-diagnosticAction" + h,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, d);
  }), e.source && An("div", { class: "cm-diagnosticSource" }, e.source));
}
class bb extends Zs {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return An("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class Tc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = kf(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class or {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          Mc(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = bf(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = cs(this.view.state.field(an).diagnostics, o);
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
    this.list = An("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: n
    }), this.dom = An("div", { class: "cm-panel-lint" }, this.list, An("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => Mc(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(an).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(an), n = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
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
        d < 0 ? (h = new Tc(this.view, c), this.items.splice(n, 0, h), s = !0) : (h = this.items[d], d > n && (this.items.splice(n, d - n), s = !0)), t && h.diagnostic == t.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), o = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), n++;
      }
    }); n < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Tc(this.view, {
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
    let t = this.view.state.field(an), n = cs(t.diagnostics, this.items[e].diagnostic);
    n && this.view.dispatch({
      selection: { anchor: n.from, head: n.to },
      scrollIntoView: !0,
      effects: vf.of(n)
    });
  }
  static open(e) {
    return new or(e);
  }
}
function zo(i, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(i)}</svg>')`;
}
function Mo(i) {
  return zo(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${i}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const kb = /* @__PURE__ */ ye.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Mo("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Mo("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Mo("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Mo("#66d") },
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
function wb(i) {
  return i == "error" ? 4 : i == "warning" ? 3 : i == "info" ? 2 : 1;
}
function wf(i) {
  let e = "hint", t = 1;
  for (let n of i) {
    let s = wb(n.severity);
    s > t && (t = s, e = n.severity);
  }
  return e;
}
class xf extends ui {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = wf(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let n = this.diagnostics, s = e.state.facet($r).tooltipFilter;
    return s && (n = s(n, e.state)), n.length && (t.onmouseover = () => Sb(e, t, n)), t;
  }
}
function xb(i, e) {
  let t = (n) => {
    let s = e.getBoundingClientRect();
    if (!(n.clientX > s.left - 10 && n.clientX < s.right + 10 && n.clientY > s.top - 10 && n.clientY < s.bottom + 10)) {
      for (let o = n.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), i.state.field(Sf) && i.dispatch({ effects: Ia.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function Sb(i, e, t) {
  function n() {
    let r = i.elementAtHeight(e.getBoundingClientRect().top + 5 - i.documentTop);
    i.coordsAtPos(r.from) && i.dispatch({ effects: Ia.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: yf(i, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, xb(i, e);
  }
  let { hoverTime: s } = i.state.facet($r), o = setTimeout(n, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(n, s);
  };
}
function Cb(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = i.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let n = [];
  for (let s in t)
    n.push(new xf(t[s]).range(+s));
  return Re.of(n, !0);
}
const Mb = /* @__PURE__ */ my({
  class: "cm-gutter-lint",
  markers: (i) => i.state.field(ea),
  widgetMarker: (i, e, t) => {
    let n = [];
    return i.state.field(ea).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && n.push(...r.diagnostics);
    }), n.length ? new xf(n) : null;
  }
}), ea = /* @__PURE__ */ cn.define({
  create() {
    return Re.empty;
  },
  update(i, e) {
    i = i.map(e.changes);
    let t = e.state.facet($r).markerFilter;
    for (let n of e.effects)
      if (n.is(Tr)) {
        let s = n.value;
        t && (s = t(s || [], e.state)), i = Cb(e.state.doc, s.slice(0));
      }
    return i;
  }
}), Ia = /* @__PURE__ */ Ge.define(), Sf = /* @__PURE__ */ cn.define({
  create() {
    return null;
  },
  update(i, e) {
    return i && e.docChanged && (i = mf(e, i) ? null : { ...i, pos: e.changes.mapPos(i.pos) }), e.effects.reduce((t, n) => n.is(Ia) ? n.value : t, i);
  },
  provide: (i) => wa.from(i)
}), Ab = /* @__PURE__ */ ye.baseTheme({
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
    content: /* @__PURE__ */ zo('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ zo('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ zo('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), Tb = /* @__PURE__ */ cy(yb, { hideOn: mf }), $b = [
  an,
  /* @__PURE__ */ ye.decorations.compute([an], (i) => {
    let { selected: e, panel: t } = i.field(an);
    return !e || !t || e.from == e.to ? qe.none : qe.set([
      vb.range(e.from, e.to)
    ]);
  }),
  Tb,
  kb
], $r = /* @__PURE__ */ pe.define({
  combine(i) {
    return pr(i, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function Db(i = {}) {
  return [$r.of(i), ea, Mb, Ab, Sf];
}
const $c = /* @__PURE__ */ xt({
  __name: "AbcEditor",
  props: {
    text: {},
    diagnostics: {},
    reveal: {},
    readonly: { type: Boolean }
  },
  emits: ["change", "cursor"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = W(null);
    let o = null, r = !1;
    const l = $a.define({
      token(h) {
        return h.sol() && h.match(/^%.*/) ? "comment" : h.sol() && h.match(/^[A-Za-z]:.*/) ? "meta" : h.match(/^"[^"\n]*"/) ? "string" : h.match(/^\[K:[^\]\n]*\]/) ? "meta" : h.eat("|") ? "punctuation" : h.match(/^[zZ][0-9]*/) ? "atom" : h.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (h.next(), null);
      },
      startState: () => null
    }), a = Sr.define([
      { tag: Te.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: Te.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: Te.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: Te.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: Te.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
    ]), u = ye.theme({
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
    ts(() => {
      s.value && (o = new ye({
        parent: s.value,
        state: We.create({
          doc: t.text,
          extensions: [
            xy(),
            qv(),
            Qv(),
            yd.of(mb),
            l,
            Qy(a),
            Db(),
            u,
            ye.lineWrapping,
            We.readOnly.of(!!t.readonly),
            ye.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            ye.updateListener.of((h) => {
              h.docChanged && !r && n("change", h.state.doc.toString()), h.selectionSet && !r && h.transactions.some((f) => f.isUserEvent("select")) && n("cursor", h.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(rl(o.state, c(o.state))));
    }), _n(() => o?.destroy()), Ie(
      () => t.text,
      (h) => {
        if (!o || o.state.doc.toString() === h) return;
        r = !0;
        const f = Math.min(o.state.selection.main.head, h.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: h }, selection: { anchor: f } }), r = !1, o.dispatch(rl(o.state, c(o.state)));
      }
    ), Ie(
      () => t.diagnostics,
      () => {
        o && o.dispatch(rl(o.state, c(o.state)));
      }
    ), Ie(
      () => t.reveal,
      (h) => {
        if (!o || !h) return;
        const f = o.state.doc.length, [m, y] = [Math.min(h[0], f), Math.min(h[1], f)], v = o.state.selection.main;
        v.from === m && v.to === y || (r = !0, o.dispatch({ selection: Q.single(m, y) }), r = !1, d(o, m));
      }
    );
    function d(h, f) {
      const m = h.scrollDOM, y = h.lineBlockAt(f);
      (y.top < m.scrollTop || y.bottom > m.scrollTop + m.clientHeight) && (m.scrollTop = Math.max(0, y.top - m.clientHeight / 3));
    }
    return (h, f) => (b(), w("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), Cn = 18, ki = 24, zn = Cn + ki, $s = 22, Ds = 34, qt = 36, Lb = 6, Dc = 3, Bb = 12, Cf = 6, Mf = 28, Ob = 21, Eb = 108;
function Ra(i) {
  return [
    ...i.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...i.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function Dr(i) {
  const e = Number(i.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function Ib(i, e) {
  return e === "auto" ? Math.max(1, i.grid.snap) : Math.max(1, Math.round(Dr(i) / e));
}
function Rb(i, e = 4, t = 24) {
  let n = i.length ? Math.min(...i.map((o) => o.pitch)) - e : 60, s = i.length ? Math.max(...i.map((o) => o.pitch)) + e : 79;
  if (s - n + 1 < t) {
    const o = t - (s - n + 1);
    n -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return n < 0 && ([n, s] = [0, Math.min(127, s - n)]), s > 127 && ([n, s] = [Math.max(0, n - (s - 127)), 127]), [n, s];
}
function Pb(i) {
  const e = i.map((s) => s.pitch), t = Math.max(0, Math.min(Ob, ...e.map((s) => s - 2))), n = Math.min(127, Math.max(Eb, ...e.map((s) => s + 2)));
  return [t, n];
}
function Nb(i, e) {
  const t = zn + (e.lyrics ? $s : 0), n = t + (e.source ? Ds : 0), s = Ra(i), [o, r] = Pb(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(i.grid.units_per_quarter, 1e-9), u = Math.max(Cf, Math.min(Mf, Math.round(e.rowHeight ?? Bb))), c = Ib(i, e.snap), d = Math.max(1, Math.round(i.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: Rb(s),
    total: i.total,
    snap: c,
    drawLength: Math.max(c, Math.round(d / c) * c),
    width: qt + i.total * a + 40,
    height: n + l * u,
    top: n,
    sourceTop: e.source ? t : null
  };
}
const ze = (i, e) => qt + i * e.pxPerUnit, Sn = (i, e) => (i - qt) / e.pxPerUnit, hs = (i, e) => e.top + (e.high - i) * e.rowHeight;
function Af(i, e, t, n) {
  const s = (hs(n, i) + hs(t, i) + i.rowHeight) / 2, o = Math.max(0, e - i.top), r = s - i.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, i.height - e), r)));
}
function Lc(i, e, t, n) {
  const s = hs(n, i);
  return s >= e + i.top && s + i.rowHeight <= e + t ? null : Af(i, t, n, n);
}
function rr(i, e) {
  const t = e.high - Math.floor((i - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const ta = (i, e) => Math.floor(i / e) * e, Ao = (i, e) => Math.round(i / e) * e;
function ni(i, e) {
  return {
    x: ze(i.onset, e),
    y: hs(i.pitch, e) + 0.5,
    width: Math.max(2, i.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function lr(i, e, t) {
  const n = i.name.length * 7 + 10, s = e ? (e.onset - i.onset) * t.pxPerUnit - 2 : n;
  return Math.max(12, Math.min(n, s));
}
const Vb = (i) => [1, 3, 6, 8, 10].includes((i % 12 + 12) % 12);
function Hb(i) {
  return `C${Math.floor(i / 12) - 1}`;
}
function zb(i) {
  const e = [];
  for (const t of i.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const n = Number(t.meter.split("/")[0]) || 1, s = t.length / n;
    for (let o = 1; o < n; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function Bc(i, e, t, n, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, Sn(i, s))), u = e - r;
  if (u < Cn) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= zn && u < s.top) return { area: "lyrics", unit: a };
  if (u < zn) {
    for (let h = n.length - 1; h >= 0; h--) {
      const f = n[h], m = ze(f.onset, s);
      if (i >= m && i <= m + lr(f, n[h + 1], s)) return { area: "chord", chord: f };
    }
    return { area: "lane", unit: a };
  }
  if (i - l < qt) return { area: "keys", pitch: rr(e, s) };
  const c = t.filter((h) => {
    const f = ni(h, s);
    return i >= f.x && i <= f.x + f.width && e >= f.y - 0.5 && e <= f.y + f.height + 0.5;
  }), d = c.find((h) => h.track === o) ?? c[0];
  if (d) {
    const h = ni(d, s), f = i >= h.x + h.width - Math.min(Lb, h.width / 3) ? "end" : "body";
    return { area: "note", note: d, edge: f };
  }
  return { area: "grid", unit: a, pitch: rr(e, s) };
}
function Tf(i, e, t) {
  return i.y0 < (i.from?.scrollTop ?? t) + e || i.y1 < t + e;
}
function $f(i, e, t = 0, n = 0) {
  const s = i.from?.scrollTop ?? t, o = i.from?.scrollLeft ?? n, r = (h, f) => Math.max(f + qt, Math.min(e.width, h)), l = (h, f) => Math.max(f + e.top, Math.min(e.height, h)), a = [r(i.x0, o), r(i.x1, n)], u = [l(i.y0, s), l(i.y1, t)], c = Math.min(...a), d = Math.min(...u);
  return { x: c, y: d, width: Math.max(...a) - c, height: Math.max(...u) - d };
}
function Wb(i, e = 0, t = zn) {
  return Tf(i, t, e);
}
function Fb(i, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : i.filter((n) => {
    const s = ni(n, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function Kb(i, e, t, n = 0, s = 0) {
  if (!Tf(e, t.top, n)) return [];
  const o = $f(e, t, n, s);
  return o.width <= 0 ? [] : i.filter((r, l) => {
    const a = ze(r.onset, t);
    return a < o.x + o.width && a + lr(r, i[l + 1], t) > o.x;
  });
}
function _b(i, e, t, n) {
  return { kind: "move", notes: i, anchor: e, fromUnit: t, fromPitch: n, delta: 0, semitones: 0 };
}
function Ub(i, e = [], t = 1 / 0) {
  const n = e.filter((o) => o.track === i.track && o.onset > i.onset).map((o) => o.onset), s = Math.min(t, ...n);
  return { kind: "resize", note: i, end: i.onset + i.duration, overwrite: !1, limit: s };
}
function Gb(i, e, t, n) {
  const s = Math.max(0, Math.min(ta(e, n.snap), n.total - 1));
  return { kind: "draw", track: i, start: s, end: Math.min(n.total, s + n.snap), pitch: t };
}
function jb(i, e = i.onset) {
  return { kind: "chord", chord: i, fromUnit: e, to: i.onset };
}
const Ls = (i, e, t) => Math.max(e, Math.min(t, i));
function qb(i, e, t, n, s) {
  switch (i.kind) {
    case "move": {
      const o = i.anchor.onset + (e - i.fromUnit), r = Math.min(...i.notes.map((h) => h.onset)), l = Math.max(...i.notes.map((h) => h.onset + h.duration)), a = Ls(Ao(o, n.snap) - i.anchor.onset, -r, n.total - l), u = Math.min(...i.notes.map((h) => h.pitch)), c = Math.max(...i.notes.map((h) => h.pitch)), d = Ls(t - i.fromPitch, -u, 127 - c);
      return { ...i, delta: a, semitones: d, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(n.snap, n.total - i.note.onset), r = s.alt ? n.total : Math.max(i.note.onset + i.note.duration, Math.min(n.total, i.limit)), l = Ls(Ao(e, n.snap), i.note.onset + Math.max(1, o), r);
      return { ...i, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= i.start ? i.start + n.snap : Math.max(i.start + n.snap, Ao(e, n.snap));
      return { ...i, end: Math.min(n.total, o) };
    }
    case "chord":
      return { ...i, to: Ls(Ao(i.chord.onset + e - i.fromUnit, n.snap), 0, n.total - 1) };
  }
}
function Yb(i, e) {
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
function Xb(i) {
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
function Jb(i) {
  return i ? i.kind === "move" ? i.copy ? /* @__PURE__ */ new Set() : new Set(i.notes.map((e) => e.id)) : i.kind === "resize" ? /* @__PURE__ */ new Set([i.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Zb(i, e, t, n, s, o) {
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
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((h) => h.onset)), c = Math.max(...t.map((h) => h.onset + h.duration)), d = Ls(l * a, -u, s.total - c);
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
const Qb = /^(vocal|ins):\d+$/;
function ds(i, e) {
  const t = i?.model?.tracks, n = /* @__PURE__ */ new Set();
  if (!t) return n;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (Qb.test(o)) n.add(o);
    else {
      const r = s.get(o);
      r && n.add(r);
    }
  return n;
}
function Xs(i) {
  return new Set(i.filter((e) => e.startsWith("chord:")));
}
function To(i, e = []) {
  return [...i.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const Df = [
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
], e1 = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Lf(i, e) {
  let t = null;
  for (const n of i.measures) n.onset <= e && (t = n);
  return t;
}
function Bf(i, e, t) {
  const n = i?.model;
  if (!n) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = ds(i, e), o = Xs(e), r = Ra(n).filter((d) => s.has(d.id)), l = n.tracks.chords.filter((d) => o.has(d.id)), a = r.length === 1 ? n.tracks.chords.find((d) => d.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Lf(n, u) : t ? n.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function t1(i, e) {
  const t = Lf(i, e) ?? i.measures[0], n = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(n / o) + 1, l = n - (r - 1) * o, a = Dr(i), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: n, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function n1(i, e, t) {
  const n = i.measures[e - 1];
  return !n || !Number.isInteger(t) || t < 0 || t >= n.length ? null : n.onset + t;
}
const i1 = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, s1 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function na(i) {
  return `${s1[i % 12]}${Math.floor(i / 12) - 1}`;
}
function o1(i) {
  const e = i.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const n = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + i1[t[1].toUpperCase()] + n;
  return s >= 0 && s <= 127 ? s : null;
}
function r1(i) {
  const e = Dr(i), t = [];
  for (const n of [32, 16, 8, 4, 2, 1]) {
    e % n === 0 && t.push({ label: `1/${n}`, units: e / n });
    const s = e / n * 1.5;
    n >= 2 && n <= 16 && Number.isInteger(s) && t.push({ label: `1/${n}.`, units: s });
  }
  return t.sort((n, s) => n.units - s.units);
}
function l1(i, e) {
  return !i.length || i.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: i.map((t) => t.id), midi: e };
}
function Yn(i, e, t = []) {
  return !i.length && !t.length || i.some((n) => n.pitch + e < 0 || n.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...i.map((n) => n.id), ...t.map((n) => n.id)], semitones: e };
}
function Oc(i, e) {
  return !i.length || i.every((t) => t.track === e) ? null : { op: "move_notes", ids: i.map((t) => t.id), track: e };
}
function a1(i, e, t) {
  return t === null || t === e.onset || t + e.duration > i.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function u1(i, e, t, n) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > i.total ? null : { op: "resize_note", id: e.id, duration: t, mode: n };
}
function c1(i, e, t) {
  const n = e.trim();
  return n ? t?.name === n ? null : { op: "put_chord", onset: i, name: n } : t ? { op: "delete_chord", onset: i } : null;
}
function h1(i, e) {
  return e === null || e === i.onset ? null : { op: "move_chord", onset: i.onset, to: e };
}
function Ec(i, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? i.n : i.n + 1, count: t };
}
function d1(i, e = 1) {
  return { op: "duplicate_measures", bar: i.n, count: e };
}
function f1(i, e, t = 1) {
  return i.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Ic(i, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === i.meter ? null : { op: "change_meter", bar: i.n, count: 1, meter: t };
}
function Of(i, e) {
  return i.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function p1(i, e) {
  return !Df.includes(e) || e === i.key ? null : { op: "put_key", onset: i.onset, key: e };
}
function m1(i, e) {
  const t = Of(i, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function g1(i, e) {
  return i === "text" ? "text" : i === "daw" ? "daw" : i === "review" ? "review" : e;
}
const v1 = {
  class: "inspector",
  "aria-label": "Inspector"
}, y1 = {
  key: 0,
  class: "facts"
}, b1 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, k1 = {
  key: 0,
  class: "facts"
}, w1 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, x1 = ["disabled"], S1 = ["disabled"], C1 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, M1 = ["disabled"], A1 = ["disabled"], T1 = ["disabled", "onKeydown"], $1 = ["disabled"], D1 = ["disabled"], L1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, B1 = ["disabled", "onKeydown"], O1 = ["disabled", "aria-label", "onKeydown"], E1 = { class: "facts" }, I1 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, R1 = ["disabled", "aria-label"], P1 = ["disabled"], N1 = ["value"], V1 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, H1 = ["disabled"], z1 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, W1 = ["disabled", "onKeydown"], F1 = { class: "field" }, K1 = ["disabled"], _1 = ["disabled"], U1 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, G1 = {
  key: 0,
  class: "facts"
}, j1 = { class: "field" }, q1 = ["disabled", "onKeydown"], Y1 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, X1 = ["disabled"], J1 = ["disabled"], Z1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, Q1 = ["disabled", "onKeydown"], ek = ["disabled", "onKeydown"], tk = { class: "field" }, nk = ["disabled"], ik = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, sk = { class: "facts" }, ok = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, rk = ["disabled"], lk = ["disabled"], ak = { class: "field" }, uk = ["disabled"], ck = ["aria-label"], hk = { class: "facts" }, dk = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, fk = ["disabled"], pk = ["disabled"], mk = ["disabled"], gk = ["disabled"], vk = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, yk = ["disabled"], bk = { id: "plenio-meters" }, kk = ["value"], wk = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, xk = ["disabled"], Sk = ["value"], Ck = ["disabled"], Mk = {
  key: 4,
  class: "facts"
}, Ak = {
  key: 5,
  class: "error"
}, Tk = /* @__PURE__ */ xt({
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
    const e = i, t = O(() => e.view?.model ?? null), n = O(() => Bf(e.view, e.selection, e.fallbackBar)), s = O(() => n.value.notes.length === 1 ? n.value.notes[0] : null), o = O(() => n.value.chords.length === 1 && !n.value.notes.length ? n.value.chords[0] : null), r = O(() => n.value.measure), l = O(() => !e.readonly && !e.stale && !e.busy), a = O(() => t.value ? r1(t.value) : []), u = O(() => t.value && r.value ? Of(t.value, r.value) : null), c = O(() => {
      const K = s.value?.onset ?? o.value?.onset;
      return t.value && K !== void 0 ? t1(t.value, K) : null;
    }), d = O(() => {
      const K = new Set(n.value.notes.map((T) => T.track));
      return K.size === 1 ? [...K][0] : K.size ? "mixed" : null;
    }), h = W(""), f = W(1), m = W(0), y = W(1), v = W(!1), x = W(""), S = W("4/4"), $ = W("C");
    Ie(
      [s, o, r, () => n.value.chordAtNote],
      () => {
        const K = s.value;
        h.value = K ? na(K.pitch) : "", y.value = K?.duration ?? 1, f.value = c.value?.bar ?? 1, m.value = c.value?.offset ?? 0, x.value = (K ? n.value.chordAtNote?.name : o.value?.name) ?? "", S.value = r.value?.meter ?? "4/4", $.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const N = W(null);
    async function P(K) {
      !K || !l.value || (N.value = null, await e.operate(K));
    }
    function z() {
      const K = o1(h.value);
      if (K === null) {
        N.value = `"${h.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, h.value = s.value ? na(s.value.pitch) : "";
        return;
      }
      P(l1(n.value.notes, K));
    }
    function R() {
      const K = t.value;
      if (!K) return;
      const T = n1(K, Number(f.value), Number(m.value));
      if (T === null) {
        N.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? P(a1(K, s.value, T)) : o.value && P(h1(o.value, T));
    }
    function Y(K = Number(y.value)) {
      const T = t.value;
      !T || !s.value || P(u1(T, s.value, K, v.value ? "overwrite" : e.resizeMode));
    }
    function H() {
      const K = s.value?.onset ?? o.value?.onset;
      K !== void 0 && P(c1(K, x.value, s.value ? n.value.chordAtNote : o.value));
    }
    function ie(K) {
      const T = [...n.value.notes.map((F) => F.id), ...n.value.chords.map((F) => F.id)];
      T.length && P({ op: K ? "delete_close_gap" : "delete", ids: T });
    }
    return (K, T) => (b(), w("aside", v1, [
      t.value ? (b(), w(de, { key: 1 }, [
        n.value.notes.length ? (b(), w("section", b1, [
          p("h4", null, [
            ue(I(s.value ? `${d.value === "vocal" ? "Vocal" : "Ins"} note` : `${n.value.notes.length} notes`) + " ", 1),
            c.value ? (b(), w("span", k1, I(c.value.text), 1)) : U("", !0)
          ]),
          p("div", w1, [
            T[36] || (T[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: Ne({ active: d.value === "vocal" }),
              disabled: !l.value,
              onClick: T[0] || (T[0] = (F) => P(B(Oc)(n.value.notes, "vocal")))
            }, "Vocal", 10, x1),
            p("button", {
              class: Ne({ active: d.value === "ins" }),
              disabled: !l.value,
              onClick: T[1] || (T[1] = (F) => P(B(Oc)(n.value.notes, "ins")))
            }, "Ins", 10, S1)
          ]),
          p("div", C1, [
            T[37] || (T[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: T[2] || (T[2] = (F) => P(B(Yn)(n.value.notes, -12, n.value.chords)))
            }, "−8va", 8, M1),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: T[3] || (T[3] = (F) => P(B(Yn)(n.value.notes, -1, n.value.chords)))
            }, "−1", 8, A1),
            s.value ? Le((b(), w("input", {
              key: 0,
              "onUpdate:modelValue": T[4] || (T[4] = (F) => h.value = F),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: et(Fe(z, ["prevent"]), ["enter"]),
              onChange: z
            }, null, 40, T1)), [
              [ot, h.value]
            ]) : U("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: T[5] || (T[5] = (F) => P(B(Yn)(n.value.notes, 1, n.value.chords)))
            }, "+1", 8, $1),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: T[6] || (T[6] = (F) => P(B(Yn)(n.value.notes, 12, n.value.chords)))
            }, "+8va", 8, D1)
          ]),
          s.value ? (b(), w(de, { key: 0 }, [
            p("div", L1, [
              T[38] || (T[38] = p("span", { class: "name" }, "start", -1)),
              T[39] || (T[39] = ue(" bar ", -1)),
              Le(p("input", {
                "onUpdate:modelValue": T[7] || (T[7] = (F) => f.value = F),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: et(Fe(R, ["prevent"]), ["enter"]),
                onChange: R
              }, null, 40, B1), [
                [
                  ot,
                  f.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              T[40] || (T[40] = ue(" + ", -1)),
              Le(p("input", {
                "onUpdate:modelValue": T[8] || (T[8] = (F) => m.value = F),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: et(Fe(R, ["prevent"]), ["enter"]),
                onChange: R
              }, null, 40, O1), [
                [
                  ot,
                  m.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", E1, "× " + I(t.value.unit), 1)
            ]),
            p("div", I1, [
              T[42] || (T[42] = p("span", { class: "name" }, "length", -1)),
              Le(p("input", {
                "onUpdate:modelValue": T[9] || (T[9] = (F) => y.value = F),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: T[10] || (T[10] = et(Fe((F) => Y(), ["prevent"]), ["enter"])),
                onChange: T[11] || (T[11] = (F) => Y())
              }, null, 40, R1), [
                [
                  ot,
                  y.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: T[12] || (T[12] = (F) => Y(Number(F.target.value)))
              }, [
                T[41] || (T[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (b(!0), w(de, null, be(a.value, (F) => (b(), w("option", {
                  key: F.label,
                  value: F.units
                }, I(F.label), 9, N1))), 128))
              ], 40, P1)
            ]),
            p("label", V1, [
              Le(p("input", {
                "onUpdate:modelValue": T[13] || (T[13] = (F) => v.value = F),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, H1), [
                [It, v.value]
              ]),
              T[43] || (T[43] = ue(" longer: over the next note ", -1))
            ]),
            p("div", z1, [
              T[44] || (T[44] = p("span", { class: "name" }, "chord", -1)),
              Le(p("input", {
                "onUpdate:modelValue": T[14] || (T[14] = (F) => x.value = F),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: et(Fe(H, ["prevent"]), ["enter"]),
                onChange: H
              }, null, 40, W1), [
                [ot, x.value]
              ])
            ])
          ], 64)) : U("", !0),
          p("div", F1, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: T[15] || (T[15] = (F) => ie(!1))
            }, "→ rest", 8, K1),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: T[16] || (T[16] = (F) => ie(!0))
            }, "close gap", 8, _1)
          ])
        ])) : o.value ? (b(), w("section", U1, [
          p("h4", null, [
            T[45] || (T[45] = ue(" Chord symbol ", -1)),
            c.value ? (b(), w("span", G1, I(c.value.text), 1)) : U("", !0)
          ]),
          p("div", j1, [
            T[46] || (T[46] = p("span", { class: "name" }, "name", -1)),
            Le(p("input", {
              "onUpdate:modelValue": T[17] || (T[17] = (F) => x.value = F),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: et(Fe(H, ["prevent"]), ["enter"]),
              onChange: H
            }, null, 40, q1), [
              [ot, x.value]
            ])
          ]),
          p("div", Y1, [
            T[47] || (T[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: T[18] || (T[18] = (F) => P(B(Yn)([], -1, n.value.chords)))
            }, "−1", 8, X1),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: T[19] || (T[19] = (F) => P(B(Yn)([], 1, n.value.chords)))
            }, "+1", 8, J1)
          ]),
          p("div", Z1, [
            T[48] || (T[48] = p("span", { class: "name" }, "start", -1)),
            T[49] || (T[49] = ue(" bar ", -1)),
            Le(p("input", {
              "onUpdate:modelValue": T[20] || (T[20] = (F) => f.value = F),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: et(Fe(R, ["prevent"]), ["enter"]),
              onChange: R
            }, null, 40, Q1), [
              [
                ot,
                f.value,
                void 0,
                { number: !0 }
              ]
            ]),
            T[50] || (T[50] = ue(" + ", -1)),
            Le(p("input", {
              "onUpdate:modelValue": T[21] || (T[21] = (F) => m.value = F),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: et(Fe(R, ["prevent"]), ["enter"]),
              onChange: R
            }, null, 40, ek), [
              [
                ot,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", tk, [
            p("button", {
              disabled: !l.value,
              onClick: T[22] || (T[22] = (F) => ie(!1))
            }, "remove", 8, nk)
          ])
        ])) : n.value.chords.length > 1 ? (b(), w("section", ik, [
          p("h4", null, [
            ue(I(n.value.chords.length) + " chord symbols ", 1),
            p("span", sk, I(n.value.chords.map((F) => F.name).join(" ")), 1)
          ]),
          p("div", ok, [
            T[51] || (T[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: T[23] || (T[23] = (F) => P(B(Yn)([], -1, n.value.chords)))
            }, "−1", 8, rk),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: T[24] || (T[24] = (F) => P(B(Yn)([], 1, n.value.chords)))
            }, "+1", 8, lk)
          ]),
          p("div", ak, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: T[25] || (T[25] = (F) => ie(!1))
            }, "remove", 8, uk)
          ])
        ])) : U("", !0),
        r.value ? (b(), w("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            ue(" Bar " + I(r.value.n) + " ", 1),
            p("span", hk, I(r.value.meter) + " · " + I(r.value.key), 1)
          ]),
          p("div", dk, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: T[26] || (T[26] = (F) => P(B(Ec)(r.value, "before")))
            }, "+ before", 8, fk),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: T[27] || (T[27] = (F) => P(B(Ec)(r.value, "after")))
            }, "+ after", 8, pk),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: T[28] || (T[28] = (F) => P(B(d1)(r.value)))
            }, "duplicate", 8, mk),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: T[29] || (T[29] = (F) => P(B(f1)(t.value, r.value)))
            }, "delete", 8, gk)
          ]),
          p("div", vk, [
            T[52] || (T[52] = p("span", { class: "name" }, "meter", -1)),
            Le(p("input", {
              "onUpdate:modelValue": T[30] || (T[30] = (F) => S.value = F),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: T[31] || (T[31] = et(Fe((F) => P(B(Ic)(r.value, S.value)), ["prevent"]), ["enter"])),
              onChange: T[32] || (T[32] = (F) => P(B(Ic)(r.value, S.value)))
            }, null, 40, yk), [
              [ot, S.value]
            ]),
            p("datalist", bk, [
              (b(!0), w(de, null, be(B(e1), (F) => (b(), w("option", {
                key: F,
                value: F
              }, null, 8, kk))), 128))
            ])
          ]),
          p("div", wk, [
            T[53] || (T[53] = p("span", { class: "name" }, "key", -1)),
            Le(p("select", {
              "onUpdate:modelValue": T[33] || (T[33] = (F) => $.value = F),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: T[34] || (T[34] = (F) => P(B(p1)(r.value, $.value)))
            }, [
              (b(!0), w(de, null, be(B(Df), (F) => (b(), w("option", {
                key: F,
                value: F
              }, I(F), 9, Sk))), 128))
            ], 40, xk), [
              [oi, $.value]
            ]),
            u.value ? (b(), w("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: T[35] || (T[35] = (F) => P(B(m1)(t.value, r.value)))
            }, "remove change", 8, Ck)) : U("", !0)
          ])
        ], 8, ck)) : U("", !0),
        !n.value.notes.length && !o.value && !r.value ? (b(), w("p", Mk, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : U("", !0),
        N.value ? (b(), w("p", Ak, I(N.value), 1)) : U("", !0)
      ], 64)) : (b(), w("p", y1, I(i.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), $k = { class: "keys-help" }, Dk = ["aria-expanded"], Lk = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, Bk = /* @__PURE__ */ xt({
  __name: "KeysHelp",
  setup(i) {
    const e = W(!1), t = [
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
    return (n, s) => (b(), w("span", $k, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, Dk),
      e.value ? (b(), w("div", Lk, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (b(), w(de, null, be(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, I(o.title), 1),
          p("table", null, [
            (b(!0), w(de, null, be(o.rows, ([r, l]) => (b(), w("tr", { key: r }, [
              p("th", null, I(r), 1),
              p("td", null, I(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : U("", !0)
    ]));
  }
}), Ok = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], ia = [4, 8, 16, 32, 64];
function Ek(i) {
  return i.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function Ik(i) {
  const e = {};
  for (const t of i) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function Rk(i) {
  const e = i?.model?.unit ?? i?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), n = Number.isFinite(t) && t > 0 ? t : 16, s = ia.filter((o) => o <= n);
  return s.length ? s[s.length - 1] : ia[0];
}
function Pk(i) {
  let e = "";
  for (let t = 0; t < i.length; t += 8192)
    e += String.fromCharCode(...i.subarray(t, t + 8192));
  return btoa(e);
}
function Nk(i) {
  const e = atob(i), t = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
  return t;
}
function es(i, e, t = "audio/midi") {
  const n = new ArrayBuffer(e.length);
  new Uint8Array(n).set(e);
  const s = URL.createObjectURL(new Blob([n], { type: t })), o = document.createElement("a");
  o.href = s, o.download = i, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function Vk(i) {
  const e = i.name.trim() || "unnamed";
  return i.notes === 1 ? `${e} · 1 note` : `${e} · ${i.notes} notes`;
}
function Hk(i, e, t, { current: n = 0, keep: s = !0 } = {}) {
  const o = [...i];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && n) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${n} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Rc(i) {
  return typeof i == "object" && i !== null && !Array.isArray(i);
}
class zk {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Rc(t) && Rc(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function Ci(i) {
  return i instanceof eh ? `${i.message}${i.hint ? ` — ${i.hint}` : ""}` : String(i instanceof Error ? i.message : i);
}
function Wk(i) {
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
function Fk(i, e) {
  const t = qi(null), n = qi(null), s = W(null), o = W(!1), r = W(!1), l = W(null), a = W(null), u = W([]), c = W([]), d = new zk(i.text), h = W(0);
  let f = "", m = 0, y, v = !1;
  const x = O(() => t.value && t.value.sha256 && !o.value ? t.value : null), S = O(() => Mi(n.value, c.value[0])), $ = O(() => (h.value, d.canUndo)), N = O(() => (h.value, d.canRedo)), P = O(() => (h.value, d.undoLabel)), z = O(() => (h.value, d.redoLabel)), R = O(
    () => Wk({
      text: i.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), Y = O(
    () => s.value !== null && s.value !== i.text && !!t.value && !t.value.ok
  );
  function H(he, Se) {
    if (t.value = he, a.value = null, he.ok) {
      n.value = he, s.value = Se;
      const ne = Sm(he);
      c.value = c.value.filter((q) => ne.has(q));
    }
  }
  async function ie() {
    const he = i.text, Se = ++m;
    if (f = he, !he.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const ne = await lp(e.fetcher, he, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Se !== m || f !== he || i.text !== he) return;
      H(ne, he), l.value = null;
    } catch (ne) {
      i.text === he && (l.value = Ci(ne), a.value = l.value);
    } finally {
      i.text === he && (o.value = !1);
    }
  }
  function K(he = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(y), y = setTimeout(() => {
      ie();
    }, he);
  }
  function T(he, Se, ne, q) {
    he !== i.text && (v = !0, i.text = he, v = !1, d.record(he, Se, { group: ne, extra: q }), h.value++, e.onEdit?.());
  }
  function F(he) {
    T(he, "typing", "typing"), K();
  }
  function ge(he, Se, ne = null, q) {
    return he === i.text ? !1 : (d.seal(), q && d.annotate(q.before), T(he, Se, void 0, q?.after), d.seal(), clearTimeout(y), f = he, o.value = !1, u.value = [], ne && ne.ok && (ne.lyrics || !e.lyrics?.()) ? (H(ne, he), l.value = null) : K(0), !0);
  }
  async function ve(he) {
    const Se = i.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++m;
      const ne = await ap(e.fetcher, Se, he, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (i.text !== Se)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const q = e.onTransform?.(ne, he);
      return d.seal(), q && d.annotate(q.before), T(ne.abc, ne.changes[0] ?? he.op, void 0, q?.after), d.seal(), clearTimeout(y), o.value = !1, f = ne.abc, H(ne.analysis, ne.abc), u.value = [...ne.changes, ...ne.warnings.map((ee) => `warning: ${ee}`)], ne.select.length && (c.value = Cm(ne.analysis, ne.select)), !0;
    } catch (ne) {
      return l.value = Ci(ne), !1;
    } finally {
      r.value = !1;
    }
  }
  function se(he) {
    he && (v = !0, i.text = he.text, v = !1, he.extra !== void 0 && e.onRestore?.(he.extra), h.value++, e.onEdit?.(), u.value = [], K(0));
  }
  const ae = () => se(d.undo()), Be = () => se(d.redo());
  function xe() {
    const he = s.value;
    return he === null || he === i.text || !n.value ? !1 : (d.seal(), T(he, "revert to the last valid score"), d.seal(), clearTimeout(y), f = he, o.value = !1, t.value = n.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function De(he) {
    c.value = he;
  }
  function Me(he, Se, ne) {
    d.seal(), d.annotate(Se), d.record(i.text, he, { extra: ne, side: !0 }), d.seal(), h.value++;
  }
  function J() {
    r.value ? setTimeout(J, 60) : i.text.trim() && !o.value && ie();
  }
  Ie(
    () => i.text,
    (he) => {
      v || (d.seal(), d.record(he, "document replaced"), d.seal(), h.value++, K(0));
    },
    { flush: "sync" }
  );
  function Ye() {
    clearTimeout(y);
  }
  return K(0), Ss({
    view: t,
    lastValid: n,
    lastValidText: s,
    current: x,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: S,
    canUndo: $,
    canRedo: N,
    undoLabel: P,
    redoLabel: z,
    commitBlock: R,
    canRevert: Y,
    typed: F,
    replaceText: ge,
    operate: ve,
    undo: ae,
    redo: Be,
    revertToLastValid: xe,
    select: De,
    analyze: ie,
    refreshLyrics: J,
    recordSide: Me,
    dispose: Ye
  });
}
const Kk = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, _k = { class: "facts" }, Uk = { class: "body" }, Gk = {
  key: 0,
  class: "hint"
}, jk = {
  key: 1,
  class: "error",
  role: "alert"
}, qk = { class: "tracks" }, Yk = { class: "number" }, Xk = ["onUpdate:modelValue", "aria-label"], Jk = ["value", "title"], Zk = {
  key: 0,
  class: "hint"
}, Qk = { class: "controls" }, ew = { title: "Foreign timing is quantised to this note value" }, tw = ["value"], nw = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, iw = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, sw = { class: "report" }, ow = { key: 0 }, rw = ["disabled"], lw = /* @__PURE__ */ xt({
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
    const t = i, n = e, s = W(!1), o = W(null), r = W(null), l = W([]), a = W(Rk(t.view)), u = W(!1), c = W(t.keepsGuide), d = O(() => l.value.filter((x) => x.notes > 0)), h = O(() => l.value.filter((x) => x.notes === 0)), f = O(
      () => r.value ? Hk(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let m = 0;
    async function y(x) {
      const S = ++m;
      s.value = !0, o.value = null;
      try {
        const $ = await up(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: x ? Ik(l.value) : void 0
        });
        if (S !== m) return;
        r.value = $, x || (l.value = Ek($.tracks));
      } catch ($) {
        S === m && (o.value = Ci($));
      } finally {
        S === m && (s.value = !1);
      }
    }
    function v() {
      y(!0);
    }
    return ts(() => {
      y(!1);
    }), (x, S) => (b(), w("div", {
      class: "plenio-overlay",
      onMousedown: S[9] || (S[9] = Fe(($) => n("close"), ["self"]))
    }, [
      p("div", Kk, [
        p("header", null, [
          S[10] || (S[10] = p("h2", null, "Import MIDI", -1)),
          p("span", _k, I(i.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: S[0] || (S[0] = ($) => n("close"))
          }, "×")
        ]),
        p("div", Uk, [
          s.value ? (b(), w("p", Gk, "Reading the file…")) : U("", !0),
          o.value ? (b(), w("p", jk, I(o.value), 1)) : U("", !0),
          r.value && !o.value ? (b(), w(de, { key: 2 }, [
            p("table", qk, [
              S[11] || (S[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (b(!0), w(de, null, be(d.value, ($) => (b(), w("tr", {
                  key: $.index
                }, [
                  p("td", null, [
                    p("span", Yk, I($.number), 1),
                    ue(" " + I(B(Vk)($)), 1)
                  ]),
                  p("td", null, [
                    Le(p("select", {
                      "onUpdate:modelValue": (N) => $.role = N,
                      "aria-label": `Role of track ${$.number}`,
                      onChange: S[1] || (S[1] = (N) => v())
                    }, [
                      (b(!0), w(de, null, be(B(Ok), (N) => (b(), w("option", {
                        key: N.value,
                        value: N.value,
                        title: N.title
                      }, I(N.label), 9, Jk))), 128))
                    ], 40, Xk), [
                      [oi, $.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            h.value.length ? (b(), w("p", Zk, " Empty track(s) not shown: " + I(h.value.map(($) => $.number).join(", ")) + ". ", 1)) : U("", !0),
            p("p", Qk, [
              p("label", ew, [
                S[12] || (S[12] = ue(" grid ", -1)),
                Le(p("select", {
                  "onUpdate:modelValue": S[2] || (S[2] = ($) => a.value = $),
                  "aria-label": "Import grid",
                  onChange: S[3] || (S[3] = ($) => v())
                }, [
                  (b(!0), w(de, null, be(B(ia), ($) => (b(), w("option", {
                    key: $,
                    value: $
                  }, "1/" + I($), 9, tw))), 128))
                ], 544), [
                  [
                    oi,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", nw, [
                Le(p("input", {
                  "onUpdate:modelValue": S[4] || (S[4] = ($) => u.value = $),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: S[5] || (S[5] = ($) => v())
                }, null, 544), [
                  [It, u.value]
                ]),
                S[13] || (S[13] = ue(" read chords from the notes ", -1))
              ]),
              i.keepsGuide && r.value.guide.length ? (b(), w("label", iw, [
                Le(p("input", {
                  "onUpdate:modelValue": S[6] || (S[6] = ($) => c.value = $),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [It, c.value]
                ]),
                S[14] || (S[14] = ue(" keep the Guide notes ", -1))
              ])) : U("", !0)
            ]),
            S[15] || (S[15] = p("h3", null, "What the import did", -1)),
            p("ul", sw, [
              (b(!0), w(de, null, be(f.value, ($, N) => (b(), w("li", { key: N }, I($), 1))), 128)),
              f.value.length ? U("", !0) : (b(), w("li", ow, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : U("", !0)
        ]),
        p("footer", null, [
          S[16] || (S[16] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            onClick: S[7] || (S[7] = ($) => n("close"))
          }, "Cancel"),
          p("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: S[8] || (S[8] = ($) => r.value && n("insert", r.value, c.value))
          }, " Insert ", 8, rw)
        ])
      ])
    ], 32));
  }
}), aw = {
  key: 0,
  class: "stale-note",
  role: "status"
}, uw = {
  key: 1,
  class: "error"
}, cw = /* @__PURE__ */ xt({
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
    const n = i, s = t, o = W(null), r = W(null);
    let l = /* @__PURE__ */ new Map(), a = {
      "plenio-selected": [],
      "plenio-playing": []
    }, u = !1, c = null, d = 0;
    function h(S) {
      const $ = /* @__PURE__ */ new Map(), N = S.lines ?? [];
      for (const P of N)
        for (const z of P.staff ?? [])
          for (const R of z.voices ?? [])
            for (const Y of R)
              Y.el_type === "note" && typeof Y.endChar == "number" && Y.abselem?.elemset && $.set(Y.endChar, Y.abselem.elemset);
      return $;
    }
    function f(S) {
      const $ = Mi(n.view, S);
      return $ ? l.get($.display[1]) ?? [] : [];
    }
    function m(S, $) {
      for (const N of a[S]) N.classList.remove(S);
      a[S] = $.flatMap(f);
      for (const N of a[S]) N.classList.add(S);
    }
    function y() {
      const S = o.value;
      if (!S) return;
      const $ = n.view?.display_abc;
      if (!$) {
        S.innerHTML = "", l = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const N = getComputedStyle(S).color || "#dddddd";
        d = S.clientWidth;
        const P = Yp.renderAbc(S, $, {
          add_classes: !0,
          responsive: "resize",
          scale: n.zoom,
          foregroundColor: N,
          selectionColor: N,
          staffwidth: Math.max(480, Math.floor(S.clientWidth / n.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (z) => {
            const R = z;
            if (!n.view || typeof R.startChar != "number" || typeof R.endChar != "number") return;
            const Y = Mm(n.view, R.startChar, R.endChar);
            Y && s("select", Y.id, u);
          }
        });
        l = h(P[0]), a = { "plenio-selected": [], "plenio-playing": [] }, m("plenio-selected", n.selection), m("plenio-playing", n.playing), r.value = null;
      } catch (N) {
        r.value = `The notation could not be drawn: ${N instanceof Error ? N.message : String(N)}`;
      }
    }
    function v(S) {
      const [$] = f(S), N = o.value?.parentElement;
      if (!$ || !N) return;
      const P = N.getBoundingClientRect(), z = $.getBoundingClientRect();
      z.top < P.top ? N.scrollTop += z.top - P.top - 8 : z.bottom > P.bottom && (N.scrollTop += z.bottom - P.bottom + 8), z.left < P.left ? N.scrollLeft += z.left - P.left - 8 : z.right > P.right && (N.scrollLeft += z.right - P.right + 8);
    }
    e({ reveal: v }), Ie(() => [n.view?.display_abc, n.zoom], () => nn(y)), Ie(
      () => n.selection,
      (S) => {
        m("plenio-selected", S), S[0] && v(S[0]);
      }
    ), Ie(
      () => n.playing,
      (S) => {
        m("plenio-playing", S), S[0] && v(S[0]);
      }
    ), ts(() => {
      y(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - d) > 40 && y();
      }), o.value && c.observe(o.value);
    }), _n(() => c?.disconnect());
    function x(S) {
      u = S.shiftKey || S.ctrlKey || S.metaKey;
    }
    return (S, $) => (b(), w("div", {
      class: Ne(["notation-wrap", { stale: i.stale }])
    }, [
      i.stale ? (b(), w("p", aw, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : U("", !0),
      r.value ? (b(), w("p", uw, I(r.value), 1)) : U("", !0),
      p("div", {
        ref_key: "host",
        ref: o,
        class: "notation",
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: x
      }, null, 544)
    ], 2));
  }
});
function Vs(i, e) {
  let t = 1;
  for (const n of i.measures) {
    if (n.onset > e) break;
    t = n.n;
  }
  return t;
}
function Pc(i, e) {
  return i.measures[Math.max(0, Math.min(i.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Nc(i, e, t) {
  const n = e > 0 ? Math.round(i / e) * e : Math.round(i);
  return Math.max(0, Math.min(t, n));
}
function Pa(i, e) {
  const t = i.model;
  if (!t) return 0;
  const n = Vs(t, e), s = t.measures[n - 1], o = i.bars[n - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function Na(i, e) {
  const t = i.model;
  if (!t || !i.bars.length || !t.measures.length) return null;
  let n = 0;
  for (let l = 0; l < i.bars.length && !(i.bars[l].start_s > e + Lo); l++)
    n = l;
  const s = i.bars[n], o = t.measures[Math.min(n, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function Ef(i, e) {
  const t = Vs(i, e), n = i.measures[t - 1];
  if (!n) return "1.1.1";
  const s = Number(n.meter.split("/")[0]) || 1, o = n.length / s, r = Math.max(0, e - n.onset), l = Math.min(s - 1, Math.floor(r / o)), a = i.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const hw = 0.25, dw = 30, ll = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, al = 6e-3;
class fw {
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
  sounds = cp();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), dw), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + hw; )
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
        u = Fo(t, o, this.sounds[e.part], e.midi, n, { level: ll[e.part] });
      } catch {
        try {
          u = Fo(t, o, "plain", e.midi, n, { level: ll[e.part] });
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
    r.type = "square", r.frequency.value = hp(e.midi);
    const l = t.createGain(), a = ll.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + al), o.gain.setValueAtTime(1, Math.max(r + al, l - al)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class pw {
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
        s.resume(), this.off(e), this.tones.set(e, Fo(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
let Vc = null;
function sa(i, e = 0.35, t = "soft") {
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      Vc ??= new n();
      const s = Vc;
      s.resume();
      const o = s.currentTime + 0.01;
      Fo(s, s.destination, t, i, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const mw = 200, Wi = /* @__PURE__ */ new Map(), gw = 2;
function vw(i, e) {
  if (i.numberOfChannels === 1) return i;
  const t = new e(1, 1, i.sampleRate).createBuffer(1, i.length, i.sampleRate), n = t.getChannelData(0);
  for (let s = 0; s < i.numberOfChannels; s++) {
    const o = i.getChannelData(s);
    for (let r = 0; r < o.length; r++) n[r] += o[r] / i.numberOfChannels;
  }
  return t;
}
function yw(i, e, t = mw) {
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
function bw(i, e = kw) {
  let t = Wi.get(i);
  if (!t) {
    for (t = (async () => {
      const n = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!n) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(i), o = await new n(1, 1, 48e3).decodeAudioData(s), r = vw(o, n);
      return { buffer: r, envelope: yw(r.getChannelData(0), r.sampleRate) };
    })(), Wi.set(i, t); Wi.size > gw; ) Wi.delete(Wi.keys().next().value);
    t.catch(() => Wi.delete(i));
  }
  return t;
}
async function kw(i) {
  const e = await fetch(i);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function ww(i, e, t, n) {
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
function xw(i) {
  return !i || "problem" in i || !Array.isArray(i.midi) || !(i.rate > 0) ? null : { rate: i.rate, start: i.start ?? 0, midi: i.midi };
}
function Sw(i, e) {
  const t = Math.round((e - i.start) * i.rate);
  return t >= 0 && t < i.midi.length ? i.midi[t] : null;
}
function Cw(i, e, t) {
  let n = 0;
  for (let r = 0; r < i.measures.length; r++) i.measures[r].onset <= t && (n = r);
  const s = i.measures[n], o = e?.[n];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function Mw(i, e, t) {
  const n = [];
  for (const s of i.tracks.vocal) {
    const o = Cw(i, e, s.onset + s.duration / 2), r = o === null ? null : Sw(t, o);
    r !== null && n.push(s.pitch - r);
  }
  return n.length < 6 ? 0 : (n.sort((s, o) => s - o), 12 * Math.round(n[Math.floor(n.length / 2)] / 12));
}
function Aw(i, e, t, n, s, o = 0) {
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
    for (let y = f; y <= m; y++) {
      const v = y >= 0 && y < t.midi.length ? t.midi[y] : null, x = t.start + y * u;
      (v === null || a !== null && Math.abs(x - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = x, v !== null && l.push([d.onset + (x - h[0]) / (h[1] - h[0]) * d.length, v + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const Tw = ["aria-label"], $w = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, Dw = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, Lw = ["aria-pressed"], Bw = ["aria-pressed"], Ow = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, Ew = ["aria-pressed"], Iw = ["aria-pressed"], Rw = { title: "Grid for drawing, moving and resizing" }, Pw = { value: "auto" }, Nw = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, Vw = ["disabled"], Hw = ["disabled"], zw = ["disabled", "title"], Ww = ["disabled", "title"], Fw = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, Kw = ["disabled", "title"], _w = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, Uw = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, Gw = ["title"], jw = ["disabled"], qw = { title: "The roll pages along with the playback line" }, Yw = { class: "hint" }, Xw = {
  key: 0,
  class: "roll-note"
}, Jw = ["width", "height"], Zw = ["y", "width", "height"], Qw = ["x1", "x2", "y1", "y2"], ex = ["x", "y"], tx = ["x", "y"], nx = ["d"], ix = ["x1", "x2", "y1", "y2"], sx = ["x1", "x2", "y1", "y2"], ox = ["transform"], rx = ["y", "width", "height"], lx = ["y"], ax = ["transform"], ux = ["width", "height"], cx = ["x", "width", "height"], hx = ["y", "width", "height"], dx = ["y", "width", "height"], fx = ["x", "y", "width", "height"], px = ["d"], mx = ["x", "y"], gx = ["y", "width", "height"], vx = ["x", "y", "width", "height"], yx = ["x", "y", "height"], bx = ["x", "y"], kx = ["x1", "x2", "y2"], wx = ["x"], xx = ["x"], Sx = ["x", "y", "width", "height"], Cx = ["x", "y"], Mx = {
  key: 2,
  class: "chord ghost"
}, Ax = ["x", "y", "width", "height"], Tx = ["x", "y"], $x = ["x", "y", "width", "height"], Dx = ["x1", "x2", "y2"], Lx = ["transform"], Bx = ["y2"], Ox = ["onKeydown"], Ex = ["onKeydown"], xs = 5, Hc = 6.2, Ix = 26, Rx = /* @__PURE__ */ xt({
  __name: "PianoRoll",
  props: /* @__PURE__ */ Zt({
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
  emits: /* @__PURE__ */ Zt(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, o = rt(i, "lyricSelection"), r = rt(i, "zoom"), l = rt(i, "audition"), a = rt(i, "rowHeight"), u = rt(i, "follow"), c = rt(i, "sungVisible"), d = rt(i, "waveVisible"), h = O(() => !!n.source && d.value), f = W(null), m = W(null), y = W(null), v = W(null), x = rt(i, "track"), S = W("draw"), $ = W("auto"), N = W(null), P = W(null), z = W(!1), R = W(0), Y = W(0), H = W(0), ie = W(0);
    let K = !1;
    const T = W(null), F = W(null), ge = W(null);
    let ve = !1;
    const se = W(null);
    let ae = null, Be = null;
    const xe = O(() => n.view?.model ?? null), De = O(() => xe.value ? Ra(xe.value) : []), Me = O(() => xe.value?.tracks.chords ?? []), J = O(
      () => xe.value ? Nb(xe.value, {
        pxPerQuarter: r.value,
        snap: $.value,
        lyrics: !!n.lyrics,
        source: h.value,
        rowHeight: a.value
      }) : null
    ), Ye = W(null);
    function he(k) {
      l.value && sa(k, 0.35, n.sound);
    }
    const Se = O(() => !n.readonly && !n.stale && !n.busy && !z.value), ne = O(() => ds(n.view, n.selection)), q = O(() => Xs(n.selection)), ee = O(() => ds(n.view, n.playing)), He = O(() => Jb(N.value)), Ze = O(() => Xb(N.value)), Ke = O(() => {
      const k = J.value, A = P.value;
      if (!k || !A) return null;
      const M = $f(A, k, Y.value, R.value), X = new Set(A.keep);
      for (const D of Fb(De.value, M, k)) X.add(D.id);
      const _ = new Set(A.keepChords);
      for (const D of Kb(Me.value, A, k, Y.value, R.value)) _.add(D.id);
      const oe = Wb(A, Y.value);
      return { rect: M, ids: X, chords: _, lane: oe };
    }), vt = O(
      () => S.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), te = O(
      () => n.lyrics && n.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), G = O(() => xe.value && n.locator !== null ? Ef(xe.value, n.locator) : "");
    function fe(k, A, M) {
      const X = se.value;
      return !X || !X.delta ? [A, M] : X.kind === "move" && X.keys.includes(k) ? [A + X.delta, M + X.delta] : X.key !== k ? [A, M] : X.kind === "start" ? [Math.min(A + X.delta, M - 1), M] : X.kind === "end" ? [A, Math.max(M + X.delta, A + 1)] : [A, M];
    }
    function ke(k) {
      const A = se.value;
      return A?.delta ? A.kind === "move" ? A.keys.includes(k) : A.key === k : !1;
    }
    const we = O(() => {
      const k = J.value, A = n.lyrics;
      if (!k || !A) return [];
      const M = A.parts.flatMap(
        (_) => _.lines.filter((oe) => oe.text).map((oe) => {
          const D = _o(oe.block, oe.line), [V, E] = fe(D, oe.start, oe.end);
          return { ...oe, start: V, end: E, key: D };
        })
      ).sort((_, oe) => _.start - oe.start || _.line - oe.line), X = new Set(o.value);
      return M.map((_, oe) => {
        const D = ze(_.start, k), V = M.slice(oe + 1).find((ft) => ft.start > _.start), E = V ? ze(V.start, k) - D - 2 : 640, j = Math.max(16, ze(_.end, k) - D), Ce = Math.max(1, Math.floor((Math.max(j, Math.min(E, _.text.length * Hc + 8)) - 8) / Hc)), at = _.text.length > Ce ? `${_.text.slice(0, Math.max(1, Ce - 1))}…` : _.text;
        return { ..._, x: D, width: j, shown: at, selected: X.has(_.key), dragged: ke(_.key) };
      }).filter((_) => Kt(_.start, Math.max(_.end, _.start + 64)));
    });
    function yt(k) {
      const A = we.value.filter((_) => k >= _.x - xs && k <= _.x + _.width + xs), M = A.find((_) => k >= _.x && k <= _.x + _.width) ?? A[0];
      if (!M) return null;
      const X = k >= M.x + M.width - xs ? "end" : k <= M.x + xs && M.width > 3 * xs ? "start" : "move";
      return { key: M.key, start: M.start, end: M.end, part: X };
    }
    function ct(k) {
      const A = [];
      for (const M of n.lyrics?.parts.flatMap((X) => X.lines.map((_) => ({ ..._, key: _o(_.block, _.line) }))) ?? []) {
        if (!(k.kind === "move" ? k.keys.includes(M.key) : M.key === k.key)) continue;
        const _ = Math.max(M.end, M.start + 1);
        let oe = [M.start, _];
        k.kind === "move" ? oe = [M.start + k.delta, _ + k.delta] : k.kind === "start" ? oe = [Math.min(M.start + k.delta, _ - 1), _] : oe = [M.start, Math.max(_ + k.delta, M.start + 1)], A.push({ key: M.key, start: Math.max(0, oe[0]), end: Math.max(1, oe[1]) });
      }
      return A;
    }
    const Lt = O(() => {
      const k = /* @__PURE__ */ new Map();
      for (const A of n.lyrics?.parts ?? [])
        for (const M of A.lines) for (const X of M.syllables) k.set(X.onset, X.end_of_word ? X.text : `${X.text}-`);
      return k;
    }), Bt = O(() => {
      const k = J.value;
      return k ? pn.value.map((A) => ({ n: A, rect: ni(A, k) })).filter(({ rect: A }) => A.width >= Ix).map(({ n: A, rect: M }) => ({ key: A.id, x: M.x + 2, y: M.y + M.height - 2.5, text: na(A.pitch) })) : [];
    }), Ft = O(() => {
      const k = J.value;
      return !k || !Lt.value.size ? [] : pn.value.filter((A) => A.track === "vocal" && Lt.value.has(A.onset)).map((A) => {
        const M = ni(A, k);
        return { key: A.id, x: M.x + 1, y: M.y - 2, text: Lt.value.get(A.onset) };
      });
    });
    function Ct(k) {
      const M = n.lyrics?.parts.find((E) => k >= E.start && k < E.end);
      if (!M) return null;
      const X = M.lines.length ? Math.max(...M.lines.map((E) => E.line)) + 1 : 0, _ = M.lines.find((E) => E.text && k >= E.start && k < Math.max(E.end, E.start + 1)), oe = (E) => ({
        block: M.block,
        line: E.line,
        text: E.text,
        original: E.text,
        start: E.start
      });
      if (_) return oe(_);
      const D = M.phrases.find(([E, j]) => k >= E && k < j);
      if (D && !M.lines.some((E) => E.syllables.length && E.start < D[1] && E.end > D[0]))
        return oe({ line: X, text: "", start: D[0] });
      const V = [...M.lines].reverse().find((E) => E.text && E.start <= k);
      return oe(V ?? { line: X, text: "", start: M.start });
    }
    function ms(k) {
      const A = Ct(k);
      A && (ve = !1, ge.value = A, nn(() => {
        F.value?.focus(), F.value?.select();
      }));
    }
    function Ln() {
      const k = ge.value;
      if (ge.value = null, !k || ve) {
        ve = !1;
        return;
      }
      f.value?.focus({ preventScroll: !0 }), k.text.trim() !== k.original.trim() && s("lyricEdit", { block: k.block, line: k.line, text: k.text.trim(), at: k.start });
    }
    function di() {
      ve = !0, ge.value = null, f.value?.focus({ preventScroll: !0 });
    }
    const Bn = O(() => xe.value ? `1/${Math.round(Dr(xe.value) / (J.value?.snap ?? 1))}` : ""), fn = O(() => {
      const k = J.value;
      if (!k) return [0, 0];
      const A = H.value || 1e5;
      return [Sn(R.value - 200, k), Sn(R.value + A + 200, k)];
    }), Kt = (k, A) => A >= fn.value[0] && k <= fn.value[1], pn = O(() => De.value.filter((k) => Kt(k.onset, k.onset + k.duration))), Ii = O(
      () => Me.value.map((k, A) => ({ chord: k, next: Me.value[A + 1] })).filter(({ chord: k }) => Kt(k.onset, k.onset + 64))
    ), Vt = O(() => xe.value ? zb(xe.value).filter((k) => Kt(k.unit, k.unit)) : []), mn = O(() => {
      const k = J.value;
      return k ? Array.from({ length: k.high - k.low + 1 }, (A, M) => k.high - M) : [];
    }), en = O(() => {
      const k = xe.value;
      return k ? k.sections.filter((A) => !A.implicit).map((A) => ({ label: A.label, unit: k.measures[A.first_bar - 1]?.onset ?? 0 })).filter((A) => Kt(A.unit, A.unit + 64)) : [];
    });
    function fi(k) {
      const A = y.value?.getBoundingClientRect();
      return [k.clientX - (A?.left ?? 0), k.clientY - (A?.top ?? 0)];
    }
    function gn(k) {
      return {
        note: !0,
        [k.track]: !0,
        selected: (Ke.value?.ids ?? ne.value).has(k.id),
        playing: ee.value.has(k.id),
        dragged: He.value.has(k.id)
      };
    }
    function Ri(k) {
      const A = k.track === "vocal" ? "Vocal" : "Ins";
      let M = 1;
      for (const X of xe.value?.measures ?? []) X.onset <= k.onset && (M = X.n);
      return `${A} bar ${M}: ${k.name}, ${k.duration} units`;
    }
    function lt(k) {
      s("select", k);
    }
    function On(k) {
      const A = J.value;
      if (!A || k.button !== 0) return;
      f.value?.focus({ preventScroll: !0 });
      const [M, X] = fi(k), _ = Bc(M, X, De.value, Me.value, A, x.value, Y.value, R.value);
      if (_.area === "keys") {
        l.value && sa(_.pitch, 0.35, n.sound);
        return;
      }
      if (_.area === "header" || _.area === "source") {
        s("locate", Nc(_.unit, A.snap, A.total)), ae = { x: M, y: X, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, Ht(k);
        return;
      }
      const oe = k.shiftKey || k.ctrlKey || k.metaKey;
      if (_.area === "lyrics") {
        const j = yt(M);
        if (!j) {
          oe || (o.value = []);
          return;
        }
        n.selection.length && lt([]);
        const Ce = o.value, at = Ce.includes(j.key), ft = oe ? at ? Ce.filter((qn) => qn !== j.key) : [...Ce, j.key] : at ? Ce : [j.key];
        if (ft !== Ce && (o.value = ft), n.lyricsEditable && (ft.includes(j.key) || j.part !== "move")) {
          const qn = j.part === "move" ? [...ft] : [j.key];
          ae = { x: M, y: X, start: null, started: !1, clear: !1, keep: null, lyric: { kind: j.part, key: j.key, keys: qn, origin: Sn(M, A), delta: 0 } }, Ht(k);
        }
        return;
      }
      o.value.length && !oe && (o.value = []);
      let D = null, V = !1, E = null;
      if (_.area === "note") {
        const j = ne.value.has(_.note.id);
        let Ce;
        if (oe) {
          const at = new Set(ne.value);
          j ? at.delete(_.note.id) : at.add(_.note.id), Ce = De.value.filter((ft) => at.has(ft.id)), lt(To(Ce, Me.value.filter((ft) => q.value.has(ft.id))));
        } else j ? Ce = De.value.filter((at) => ne.value.has(at.id)) : (Ce = [_.note], lt(To(Ce)));
        Se.value && Ce.some((at) => at.id === _.note.id) && (D = _.edge === "end" && Ce.length === 1 ? Ub(_.note, De.value, A.total) : _b(Ce, _.note, Sn(M, A), rr(X, A))), he(_.note.pitch);
      } else if (_.area === "chord") {
        if (oe) {
          const j = new Set(q.value);
          j.has(_.chord.id) ? j.delete(_.chord.id) : j.add(_.chord.id), lt([...n.selection.filter((Ce) => !Ce.startsWith("chord:")), ...j]);
        } else q.value.has(_.chord.id) || lt([_.chord.id]);
        Se.value && (D = jb(_.chord, Sn(M, A)));
      } else if ((_.area === "grid" || _.area === "lane") && (S.value === "select" || k.shiftKey))
        E = oe ? { notes: [...ne.value], chords: Me.value.filter((j) => q.value.has(j.id)) } : { notes: [], chords: [] }, V = !oe;
      else if (_.area === "grid") {
        const j = !n.selection.length && !o.value.length;
        Se.value && !oe && (D = Gb(x.value, _.unit, _.pitch, A), he(_.pitch)), V = !oe, ae = { x: M, y: X, start: D, started: !1, clear: V, keep: E, insert: Se.value && !oe && j }, Ht(k);
        return;
      } else
        V = !oe;
      ae = { x: M, y: X, start: D, started: !1, clear: V, keep: E, from: { scrollTop: Y.value, scrollLeft: R.value } }, Ht(k);
    }
    function Ht(k) {
      try {
        y.value?.setPointerCapture?.(k.pointerId);
      } catch {
      }
    }
    function En(k) {
      const A = m.value, M = J.value;
      if (!A || !M) return;
      const X = A.getBoundingClientRect();
      if (!X.height) return;
      const _ = M.rowHeight;
      if (k.clientY < X.top + M.top + 12) A.scrollTop = Math.max(0, A.scrollTop - _);
      else if (k.clientY > X.bottom - 16) A.scrollTop = A.scrollTop + _;
      else return;
      Ot();
    }
    function vn(k) {
      const A = J.value;
      if (!ae || !ae.start && !ae.keep && !ae.ruler && !ae.lyric || !A) return;
      const [M, X] = fi(k);
      if (ae.ruler) {
        s("locate", Nc(Sn(M, A), A.snap, A.total));
        return;
      }
      if (ae.lyric) {
        if (!ae.started && Math.abs(M - ae.x) < Dc) return;
        ae.started = !0;
        const _ = Math.round((Sn(M, A) - ae.lyric.origin) / A.snap) * A.snap;
        se.value = { ...ae.lyric, delta: _ };
        return;
      }
      if (ae.started && En(k), !(!ae.started && Math.hypot(M - ae.x, X - ae.y) < Dc)) {
        if (ae.started = !0, ae.keep)
          P.value = {
            x0: ae.x,
            y0: ae.y,
            x1: M,
            y1: X,
            from: ae.from,
            keep: ae.keep.notes,
            keepChords: ae.keep.chords.map((_) => _.id)
          };
        else if (ae.start) {
          const _ = N.value, oe = qb(ae.start, Sn(M, A), rr(X, A), A, { alt: k.altKey });
          oe.kind === "move" && oe.semitones !== (_?.kind === "move" ? _.semitones : 0) && he(oe.anchor.pitch + oe.semitones), N.value = oe;
        }
      }
    }
    async function _t(k) {
      z.value = !0;
      try {
        await n.operate(k);
      } finally {
        z.value = !1, N.value = null;
      }
    }
    function In() {
      const k = ae;
      if (ae = null, !k || k.ruler) return;
      if (k.lyric) {
        const X = se.value;
        se.value = null, k.started && X?.delta && s("lyricPlace", ct(X));
        return;
      }
      if (!k.started) {
        if (N.value = null, k.insert && k.start?.kind === "draw" && J.value) {
          const X = J.value, _ = Math.min(Ye.value ?? X.drawLength, X.total - k.start.start);
          _t({ op: "insert_note", track: k.start.track, onset: k.start.start, duration: _, pitch: k.start.pitch });
          return;
        }
        k.clear && lt([]);
        return;
      }
      if (k.keep) {
        const X = Ke.value?.ids ?? /* @__PURE__ */ new Set(), _ = Ke.value?.chords ?? new Set(k.keep.chords.map((oe) => oe.id));
        P.value = null, lt(To(De.value.filter((oe) => X.has(oe.id)), Me.value.filter((oe) => _.has(oe.id))));
        return;
      }
      const A = N.value, M = A ? Yb(A, n.resizeMode) : null;
      if (!M) {
        N.value = null;
        return;
      }
      A?.kind === "draw" ? Ye.value = A.end - A.start : A?.kind === "resize" && (Ye.value = A.end - A.note.onset), _t(M);
    }
    function Mt() {
      ae = null, N.value = null, P.value = null, se.value = null;
    }
    function Pi(k) {
      const A = J.value;
      if (!A) return;
      const [M, X] = fi(k), _ = Bc(M, X, De.value, Me.value, A, x.value, Y.value, R.value);
      if (_.area === "lyrics") {
        n.lyricsEditable && ms(_.unit);
        return;
      }
      if (Se.value) {
        if (_.area === "grid") {
          if (S.value !== "draw") return;
          const oe = Math.min(ta(_.unit, A.snap), A.total - 1), D = Math.min(A.drawLength, A.total - oe);
          _t({ op: "insert_note", track: x.value, onset: oe, duration: D, pitch: _.pitch });
        } else if (_.area === "lane" || _.area === "chord") {
          const oe = _.area === "chord" ? _.chord : null, D = _.area === "chord" ? _.chord.onset : Math.min(ta(_.unit, A.snap), A.total - 1);
          T.value = { onset: D, name: oe?.name ?? "", original: oe?.name ?? null }, nn(() => {
            v.value?.focus(), v.value?.select();
          });
        }
      }
    }
    function Ni() {
      const k = T.value;
      if (T.value = null, f.value?.focus({ preventScroll: !0 }), !k) return;
      const A = k.name.trim();
      if (A !== (k.original ?? "")) {
        if (!A) {
          k.original !== null && _t({ op: "delete_chord", onset: k.onset });
          return;
        }
        _t({ op: "put_chord", onset: k.onset, name: A });
      }
    }
    function Rn() {
      T.value = null, f.value?.focus({ preventScroll: !0 });
    }
    function ht(k) {
      if (k.target?.closest("input, select, textarea")) return;
      const M = J.value;
      if (!M) return;
      if (o.value.length && !k.ctrlKey && !k.metaKey) {
        const V = k.key === "ArrowLeft" ? -M.snap : k.key === "ArrowRight" ? M.snap : 0;
        if (k.key === "Delete" || k.key === "Backspace" || V || k.key === "Escape") {
          if (k.preventDefault(), k.stopPropagation(), k.key === "Escape") o.value = [];
          else if (n.lyricsEditable) V ? s("lyricPlace", ct({ kind: "move", key: "", keys: [...o.value], delta: V })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (k.key === "Escape") {
        if (ae || N.value || P.value) Mt();
        else if (n.selection.length) lt([]);
        else return;
        k.preventDefault(), k.stopPropagation();
        return;
      }
      const X = k.key.toLowerCase();
      if ((X === "g" || X === "h") && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), k.shiftKey ? Et(X === "h" ? 2 : -2) : At(X === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (X === "q" && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Gt(k.shiftKey);
        return;
      }
      if (k.key.toLowerCase() === "a" && (k.ctrlKey || k.metaKey) && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), lt(To(De.value, Me.value));
        return;
      }
      const _ = De.value.filter((V) => ne.value.has(V.id)), oe = Me.value.filter((V) => q.value.has(V.id)), D = Zb(
        k.key,
        { shift: k.shiftKey, alt: k.altKey },
        _,
        oe,
        M,
        n.resizeMode
      );
      D !== void 0 && (k.preventDefault(), k.stopPropagation(), D && Se.value && _t(D));
    }
    function Ot() {
      R.value = m.value?.scrollLeft ?? 0, Y.value = m.value?.scrollTop ?? 0, H.value = m.value?.clientWidth ?? 0, ie.value = m.value?.clientHeight ?? 0;
    }
    function Ut() {
      const k = J.value, A = m.value;
      K || !k || !A || !A.clientHeight || (K = !0, A.scrollTop = Af(k, A.clientHeight, k.focus[0], k.focus[1]), Ot());
    }
    function pi(k, A = !0) {
      const M = J.value, X = m.value, _ = De.value.find((V) => k.has(V.id));
      if (!M || !X || !_ || !X.clientWidth) return;
      const oe = ze(_.onset, M);
      A && (oe < X.scrollLeft + qt || oe > X.scrollLeft + X.clientWidth - 40) && (X.scrollLeft = Math.max(0, oe - X.clientWidth / 3));
      const D = X.clientHeight ? Lc(M, X.scrollTop, X.clientHeight, _.pitch) : null;
      D !== null && (X.scrollTop = D), Ot();
    }
    function At(k, A) {
      const M = m.value, X = J.value, _ = Math.max(12, Math.min(240, Math.round(r.value * k)));
      if (_ === r.value) return;
      if (!M || !X) {
        r.value = _;
        return;
      }
      const oe = M.getBoundingClientRect(), D = n.locator !== null ? ze(n.locator, X) - M.scrollLeft : null, V = A !== void 0 ? A - oe.left : D !== null && D >= qt && D <= M.clientWidth ? D : M.clientWidth / 2, E = Sn(M.scrollLeft + V, X);
      r.value = _, nn(() => {
        const j = J.value;
        j && (M.scrollLeft = Math.max(0, ze(E, j) - V), Ot());
      });
    }
    function mi(k) {
      const A = k.deltaY || k.deltaX;
      if (k.altKey || (k.ctrlKey || k.metaKey) && k.shiftKey) {
        k.preventDefault(), Et(A < 0 ? 1 : -1, k.clientY);
        return;
      }
      !k.ctrlKey && !k.metaKey || (k.preventDefault(), At(A < 0 ? 1.15 : 1 / 1.15, k.clientX));
    }
    function Et(k, A) {
      const M = m.value, X = J.value, _ = Math.max(Cf, Math.min(Mf, a.value + k));
      if (_ === a.value) return;
      if (!M || !X) {
        a.value = _;
        return;
      }
      const oe = M.getBoundingClientRect(), D = A !== void 0 ? A - oe.top : M.clientHeight / 2, V = X.high - (M.scrollTop + D - X.top) / X.rowHeight;
      a.value = _, nn(() => {
        const E = J.value;
        E && (M.scrollTop = Math.max(0, E.top + (E.high - V) * E.rowHeight - D), Ot());
      });
    }
    function Gt(k) {
      const A = J.value;
      if (!A || !Se.value) return;
      const M = ne.value.size ? De.value.filter((X) => ne.value.has(X.id)) : De.value;
      M.length && _t({ op: "quantize", ids: M.map((X) => X.id), grid: A.snap, lengths: k });
    }
    const dt = O(() => {
      const k = n.source?.envelope;
      if (!k) return 1;
      let A = 0;
      for (let M = 0; M < k.max.length; M++) A = Math.max(A, k.max[M], -k.min[M]);
      return A || 1;
    }), Gn = O(() => {
      const k = J.value, A = xe.value, M = n.sung;
      if (!k || !A || !M?.curve || !c.value) return [];
      const [X, _] = fn.value;
      let oe = 0, D = A.measures.length - 1;
      A.measures.forEach((E, j) => {
        E.onset + E.length < X && (oe = j + 1), E.onset <= _ && (D = j);
      });
      const V = (E) => k.top + (k.high - E) * k.rowHeight + k.rowHeight / 2;
      return Aw(A, M.bars, M.curve, oe, D, M.offset).map((E, j) => ({
        key: `c${oe}-${j}`,
        d: E.map(([Ce, at], ft) => `${ft ? "L" : "M"}${ze(Ce, k).toFixed(1)} ${V(at).toFixed(1)}`).join("")
      }));
    }), gi = O(() => {
      const k = n.sung?.offset ?? 0;
      if (!k) return "sung";
      const A = Math.abs(k / 12);
      return `sung ${k > 0 ? "+" : "−"}${A > 1 ? A : ""}8va`;
    }), Vi = O(() => {
      const k = n.sung;
      if (!k) return "";
      if (k.problem) return `No sung pitch: ${k.problem}`;
      const A = k.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${A ? ` - drawn ${Math.abs(A / 12)} octave${Math.abs(A) > 12 ? "s" : ""} ${A > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), jn = O(() => {
      const k = J.value, A = xe.value, M = n.source;
      if (!k || !A || !M || k.sourceTop === null) return [];
      const X = k.sourceTop + Ds / 2, _ = (Ds / 2 - 3) / dt.value, oe = [];
      return A.measures.forEach((D, V) => {
        if (!Kt(D.onset, D.onset + D.length)) return;
        const E = ze(D.onset, k), j = D.length * k.pxPerUnit, Ce = M.bars?.[V];
        if (!Ce) {
          oe.push({ key: `w${V}`, d: "", missing: !0, x: E, width: j });
          return;
        }
        const at = Math.max(1, Math.floor(j / 2)), ft = [];
        ww(M.envelope, Ce[0], Ce[1], at).forEach(([qn, Pn], Qe) => {
          const tn = (E + (Qe + 0.5) * (j / at)).toFixed(1);
          ft.push(`M${tn} ${(X - Pn * _ - 0.5).toFixed(1)}V${(X - qn * _ + 0.5).toFixed(1)}`);
        }), oe.push({ key: `w${V}`, d: ft.join(""), missing: !1, x: E, width: j });
      }), oe;
    });
    function Oe(k) {
      const A = J.value, M = m.value;
      if (k === null || !A || !M || !M.clientWidth) return;
      const X = ze(k, A);
      X >= M.scrollLeft + qt && X <= M.scrollLeft + M.clientWidth - 24 || (M.scrollLeft = Math.max(0, X - qt - 24), Ot());
    }
    return Ie(ne, (k) => pi(k)), Ie(ee, (k) => {
      n.recorded && n.playhead !== null || (u.value || n.playhead === null) && pi(k, n.playhead === null);
    }), Ie(
      () => n.playhead,
      (k) => {
        u.value && Oe(k);
      }
    ), Ie(() => n.locator, Oe), Ie(
      () => n.recorded?.notes.at(-1)?.pitch,
      (k) => {
        const A = J.value, M = m.value;
        if (k === void 0 || !A || !M?.clientHeight) return;
        const X = Lc(A, M.scrollTop, M.clientHeight, k);
        X !== null && (M.scrollTop = X, Ot());
      }
    ), Ie(
      () => !!xe.value,
      (k) => {
        k ? nn(Ut) : K = !1;
      }
    ), ts(() => {
      Ot(), Ut(), m.value && typeof ResizeObserver < "u" && (Be = new ResizeObserver(() => {
        Ot(), Ut();
      }), Be.observe(m.value));
    }), _n(() => Be?.disconnect()), e({ zoomBy: At, zoomRows: Et }), (k, A) => (b(), w("div", {
      ref_key: "root",
      ref: f,
      class: Ne(["roll", { stale: i.stale, readonly: i.readonly, [`mode-${S.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": S.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: ht
    }, [
      p("div", $w, [
        p("span", Dw, [
          p("button", {
            class: Ne(["mode draw", { active: S.value === "draw" }]),
            "aria-pressed": S.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: A[0] || (A[0] = (M) => S.value = "draw")
          }, [...A[20] || (A[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            ue(" Draw ", -1)
          ])], 10, Lw),
          p("button", {
            class: Ne(["mode select", { active: S.value === "select" }]),
            "aria-pressed": S.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: A[1] || (A[1] = (M) => S.value = "select")
          }, [...A[21] || (A[21] = [
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
            ue(" Select ", -1)
          ])], 10, Bw)
        ]),
        p("span", Ow, [
          A[22] || (A[22] = ue(" draw into ", -1)),
          p("button", {
            class: Ne([{ active: x.value === "vocal" }, "vocal"]),
            "aria-pressed": x.value === "vocal",
            onClick: A[2] || (A[2] = (M) => x.value = "vocal")
          }, " Vocal ", 10, Ew),
          p("button", {
            class: Ne([{ active: x.value === "ins" }, "ins"]),
            "aria-pressed": x.value === "ins",
            onClick: A[3] || (A[3] = (M) => x.value = "ins")
          }, " Ins ", 10, Iw)
        ]),
        p("label", Rw, [
          A[27] || (A[27] = ue(" snap ", -1)),
          Le(p("select", {
            "onUpdate:modelValue": A[4] || (A[4] = (M) => $.value = M),
            "aria-label": "Snap"
          }, [
            p("option", Pw, "auto (" + I($.value === "auto" ? Bn.value : "score") + ")", 1),
            A[23] || (A[23] = p("option", { value: 4 }, "1/4", -1)),
            A[24] || (A[24] = p("option", { value: 8 }, "1/8", -1)),
            A[25] || (A[25] = p("option", { value: 16 }, "1/16", -1)),
            A[26] || (A[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [oi, $.value]
          ])
        ]),
        p("span", Nw, [
          p("button", {
            disabled: !i.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: A[5] || (A[5] = (M) => s("clipboard", "copy"))
          }, " Copy ", 8, Vw),
          p("button", {
            disabled: !i.selection.length || !Se.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: A[6] || (A[6] = (M) => s("clipboard", "cut"))
          }, " Cut ", 8, Hw),
          p("button", {
            disabled: !i.clip || !Se.value || i.locator === null,
            title: i.clip ? `Paste ${i.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: A[7] || (A[7] = (M) => s("clipboard", "paste"))
          }, " Paste ", 8, zw),
          p("button", {
            disabled: !i.clip || !Se.value || i.locator === null,
            title: i.clip ? `Insert ${i.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: A[8] || (A[8] = (M) => s("clipboard", "insert"))
          }, " Insert ", 8, Ww)
        ]),
        p("label", Fw, [
          Le(p("input", {
            "onUpdate:modelValue": A[9] || (A[9] = (M) => l.value = M),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [It, l.value]
          ]),
          A[28] || (A[28] = ue(" hear ", -1))
        ]),
        p("button", {
          disabled: !Se.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${Bn.value}); Shift+Q: their lengths too`,
          onClick: A[10] || (A[10] = (M) => Gt(!1))
        }, " Q ", 8, Kw),
        p("span", _w, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: A[11] || (A[11] = (M) => At(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: A[12] || (A[12] = (M) => At(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: A[13] || (A[13] = (M) => Et(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: A[14] || (A[14] = (M) => Et(2))
          }, "↕+")
        ]),
        i.source ? (b(), w("label", Uw, [
          Le(p("input", {
            "onUpdate:modelValue": A[15] || (A[15] = (M) => d.value = M),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [It, d.value]
          ]),
          A[29] || (A[29] = ue(" wave ", -1))
        ])) : U("", !0),
        i.sung ? (b(), w("label", {
          key: 1,
          title: Vi.value,
          class: Ne({ unavailable: !!i.sung.problem })
        }, [
          Le(p("input", {
            "onUpdate:modelValue": A[16] || (A[16] = (M) => c.value = M),
            type: "checkbox",
            disabled: !!i.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, jw), [
            [It, c.value]
          ]),
          ue(" " + I(gi.value), 1)
        ], 10, Gw)) : U("", !0),
        p("label", qw, [
          Le(p("input", {
            "onUpdate:modelValue": A[17] || (A[17] = (M) => u.value = M),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [It, u.value]
          ]),
          A[30] || (A[30] = ue(" follow ", -1))
        ]),
        p("span", Yw, I(vt.value) + I(te.value), 1)
      ]),
      !xe.value && i.view?.model_error ? (b(), w("p", Xw, I(i.view.model_error.message), 1)) : xe.value && J.value ? (b(), w("div", {
        key: 1,
        ref_key: "scroller",
        ref: m,
        class: "roll-scroll",
        style: Yi({ height: `${Math.min(i.height, J.value.height + 16)}px` }),
        onScroll: Ot,
        onWheel: mi
      }, [
        (b(), w("svg", {
          ref_key: "svg",
          ref: y,
          class: "roll-svg",
          width: J.value.width,
          height: J.value.height,
          onPointerdown: On,
          onPointermove: vn,
          onPointerup: In,
          onPointercancel: Mt,
          onDblclick: Pi
        }, [
          (b(!0), w(de, null, be(mn.value, (M) => (b(), w("rect", {
            key: "row" + M,
            class: Ne(["row", { black: B(Vb)(M), c: M % 12 === 0 }]),
            x: 0,
            y: B(hs)(M, J.value),
            width: J.value.width,
            height: J.value.rowHeight
          }, null, 10, Zw))), 128)),
          (b(!0), w(de, null, be(Vt.value, (M) => (b(), w("line", {
            key: "l" + M.unit,
            class: Ne(M.kind),
            x1: B(ze)(M.unit, J.value),
            x2: B(ze)(M.unit, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 10, Qw))), 128)),
          (b(!0), w(de, null, be(pn.value, (M) => (b(), w("rect", io({
            key: M.id,
            class: gn(M)
          }, { ref_for: !0 }, B(ni)(M, J.value), { rx: "2" }), [
            p("title", null, I(Ri(M)), 1)
          ], 16))), 128)),
          (b(!0), w(de, null, be(Bt.value, (M) => (b(), w("text", {
            key: "p" + M.key,
            class: "note-name",
            x: M.x,
            y: M.y
          }, I(M.text), 9, ex))), 128)),
          (b(!0), w(de, null, be(Ft.value, (M) => (b(), w("text", {
            key: "y" + M.key,
            class: "syllable",
            x: M.x,
            y: M.y
          }, I(M.text), 9, tx))), 128)),
          (b(!0), w(de, null, be(Gn.value, (M) => (b(), w("path", {
            key: M.key,
            class: "sung-pitch",
            d: M.d
          }, null, 8, nx))), 128)),
          i.recorded ? (b(!0), w(de, { key: 0 }, be(i.recorded.notes, (M, X) => (b(), w("rect", io({
            key: "rec" + X,
            class: "rec-note"
          }, { ref_for: !0 }, B(ni)({ onset: M.onset, duration: Math.max(M.duration, 0.5), pitch: M.pitch }, J.value), { rx: "2" }), null, 16))), 128)) : U("", !0),
          (b(!0), w(de, null, be(Ze.value, (M, X) => (b(), w("rect", io({
            key: "ghost" + X,
            class: ["ghost", M.track]
          }, { ref_for: !0 }, B(ni)(M, J.value), { rx: "2" }), null, 16))), 128)),
          Ke.value && Ke.value.rect.height > 0 ? (b(), w("rect", io({
            key: 1,
            class: "band"
          }, Ke.value.rect), null, 16)) : U("", !0),
          i.locator !== null ? (b(), w("line", {
            key: 2,
            class: "locator",
            x1: B(ze)(i.locator, J.value),
            x2: B(ze)(i.locator, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, ix)) : U("", !0),
          i.playhead !== null ? (b(), w("line", {
            key: 3,
            class: "playhead",
            x1: B(ze)(i.playhead, J.value),
            x2: B(ze)(i.playhead, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, sx)) : U("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${R.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: J.value.top,
              width: B(qt) - 2,
              height: J.value.height - J.value.top
            }, [...A[31] || (A[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, rx),
            (b(!0), w(de, null, be(mn.value.filter((M) => M % 12 === 0), (M) => (b(), w("text", {
              key: "k" + M,
              class: "key-label",
              x: 4,
              y: B(hs)(M, J.value) + J.value.rowHeight - 2
            }, I(B(Hb)(M)), 9, lx))), 128))
          ], 8, ox),
          p("g", {
            class: "roll-top",
            transform: `translate(0 ${Y.value})`
          }, [
            p("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: J.value.width,
              height: J.value.top
            }, null, 8, ux),
            p("rect", {
              class: "ruler",
              x: B(qt),
              y: 0,
              width: J.value.width - B(qt),
              height: B(Cn)
            }, [...A[32] || (A[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, cx),
            p("rect", {
              class: "lane",
              x: 0,
              y: B(Cn),
              width: J.value.width,
              height: B(ki)
            }, null, 8, hx),
            i.source && J.value.sourceTop !== null ? (b(), w(de, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: J.value.sourceTop,
                width: J.value.width,
                height: B(Ds)
              }, [...A[33] || (A[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, dx),
              (b(!0), w(de, null, be(jn.value, (M) => (b(), w(de, {
                key: M.key
              }, [
                M.missing ? (b(), w("rect", {
                  key: 0,
                  class: "source-missing",
                  x: M.x,
                  y: J.value.sourceTop + 2,
                  width: M.width,
                  height: B(Ds) - 4
                }, [...A[34] || (A[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, fx)) : (b(), w("path", {
                  key: 1,
                  class: "source-wave",
                  d: M.d
                }, null, 8, px))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: R.value + 3,
                y: J.value.sourceTop + 11
              }, "source", 8, mx)
            ], 64)) : U("", !0),
            i.lyrics ? (b(), w(de, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: B(zn),
                width: J.value.width,
                height: B($s)
              }, null, 8, gx),
              (b(!0), w(de, null, be(we.value, (M) => (b(), w("g", {
                key: M.key,
                class: Ne(["lyric-line", { unsung: !M.syllables.length, selected: M.selected, dragged: M.dragged }])
              }, [
                p("rect", {
                  x: M.x,
                  y: B(zn) + 3,
                  width: M.width,
                  height: B($s) - 6,
                  rx: "3"
                }, null, 8, vx),
                i.lyricsEditable ? (b(), w("rect", {
                  key: 0,
                  class: "edge",
                  x: M.x + M.width - 3,
                  y: B(zn) + 5,
                  width: 3,
                  height: B($s) - 10
                }, null, 8, yx)) : U("", !0),
                p("text", {
                  x: M.x + 4,
                  y: B(zn) + B($s) / 2 + 4
                }, I(M.shown), 9, bx),
                p("title", null, I(M.text) + I(i.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : U("", !0),
            (b(!0), w(de, null, be(Vt.value.filter((M) => M.kind === "bar"), (M) => (b(), w("line", {
              key: "t" + M.unit,
              class: "bar",
              x1: B(ze)(M.unit, J.value),
              x2: B(ze)(M.unit, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, kx))), 128)),
            (b(!0), w(de, null, be(Vt.value.filter((M) => M.bar), (M) => (b(), w("text", {
              key: "n" + M.unit,
              class: "bar-number",
              x: B(ze)(M.unit, J.value) + 3,
              y: 12
            }, I(M.bar), 9, wx))), 128)),
            (b(!0), w(de, null, be(en.value, (M) => (b(), w("text", {
              key: "s" + M.unit,
              class: "section-label",
              x: B(ze)(M.unit, J.value) + 22,
              y: 12
            }, I(M.label), 9, xx))), 128)),
            (b(!0), w(de, null, be(Ii.value, ({ chord: M, next: X }) => (b(), w("g", {
              key: M.id,
              class: Ne(["chord", {
                selected: (Ke.value?.chords ?? q.value).has(M.id),
                dragged: N.value?.kind === "chord" && N.value.chord.id === M.id
              }])
            }, [
              p("rect", {
                x: B(ze)(M.onset, J.value),
                y: B(Cn) + 3,
                width: B(lr)(M, X, J.value),
                height: B(ki) - 6,
                rx: "3"
              }, null, 8, Sx),
              p("text", {
                x: B(ze)(M.onset, J.value) + 4,
                y: B(Cn) + B(ki) / 2 + 4
              }, I(M.name), 9, Cx),
              p("title", null, "chord " + I(M.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            N.value?.kind === "chord" ? (b(), w("g", Mx, [
              p("rect", {
                x: B(ze)(N.value.to, J.value),
                y: B(Cn) + 3,
                width: B(lr)(N.value.chord, void 0, J.value),
                height: B(ki) - 6,
                rx: "3"
              }, null, 8, Ax),
              p("text", {
                x: B(ze)(N.value.to, J.value) + 4,
                y: B(Cn) + B(ki) / 2 + 4
              }, I(N.value.chord.name), 9, Tx)
            ])) : U("", !0),
            Ke.value?.lane && Ke.value.rect.width > 0 ? (b(), w("rect", {
              key: 3,
              class: "band",
              x: Ke.value.rect.x,
              y: B(Cn),
              width: Ke.value.rect.width,
              height: B(ki)
            }, null, 8, $x)) : U("", !0),
            i.playhead !== null ? (b(), w("line", {
              key: 4,
              class: "playhead",
              x1: B(ze)(i.playhead, J.value),
              x2: B(ze)(i.playhead, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, Dx)) : U("", !0),
            i.locator !== null ? (b(), w("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${B(ze)(i.locator, J.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: J.value.top
              }, null, 8, Bx),
              A[35] || (A[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + I(G.value) + " - click or drag in the ruler to move it", 1)
            ], 8, Lx)) : U("", !0)
          ], 8, ax)
        ], 40, Jw)),
        T.value ? Le((b(), w("input", {
          key: 0,
          ref_key: "chordInput",
          ref: v,
          "onUpdate:modelValue": A[18] || (A[18] = (M) => T.value.name = M),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: Yi({ left: `${B(ze)(T.value.onset, J.value)}px`, top: `${B(Cn) + 1 + Y.value}px` }),
          onKeydown: [
            et(Fe(Ni, ["prevent"]), ["enter"]),
            et(Fe(Rn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Rn
        }, null, 44, Ox)), [
          [ot, T.value.name]
        ]) : U("", !0),
        ge.value ? Le((b(), w("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: F,
          "onUpdate:modelValue": A[19] || (A[19] = (M) => ge.value.text = M),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: Yi({ left: `${B(ze)(ge.value.start, J.value)}px`, top: `${B(zn) + 1 + Y.value}px` }),
          onKeydown: [
            et(Fe(Ln, ["prevent"]), ["enter"]),
            et(Fe(di, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Ln
        }, null, 44, Ex)), [
          [ot, ge.value.text]
        ]) : U("", !0)
      ], 36)) : U("", !0)
    ], 42, Tw));
  }
}), ar = (i) => [...new Set(i)].sort((e, t) => e - t);
function zc(i, e, t, n) {
  if (t.range && n !== null) {
    const [s, o] = n <= e ? [n, e] : [e, n], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? ar([...i, ...r]) : r;
  }
  return t.toggle ? i.includes(e) ? i.filter((s) => s !== e) : ar([...i, e]) : [e];
}
function Wc(i, e) {
  const t = new Set(e), n = Array.from({ length: i }, (s, o) => o).filter((s) => !t.has(s));
  return !n.length || n.length === i ? null : { order: n.map((s) => s + 1), selection: [] };
}
function Fc(i, e) {
  const t = ar(e).filter((o) => o >= 0 && o < i);
  if (!t.length) return null;
  const n = t[t.length - 1];
  return { order: [
    ...Array.from({ length: n + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: i - n - 1 }, (o, r) => n + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => n + 1 + r) };
}
function Kc(i, e, t) {
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
function _c(i, e, t, n) {
  const s = ar(e).filter((a) => a >= 0 && a < i);
  if (!s.length || t < 0 || t > i) return null;
  const o = n ? Array.from({ length: i }, (a, u) => u) : Array.from({ length: i }, (a, u) => u).filter((a) => !s.includes(a)), r = n ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !n && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const Qn = W(null);
function ur(i) {
  return i.id.startsWith("ins:") ? "ins" : "vocal";
}
function Px(i, e, t = null) {
  const n = [...new Set(e)].sort((u, c) => u - c).filter((u) => i.sections[u]), s = n.map((u) => i.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const d = i.measures[c.first_bar - 1], h = i.measures[c.first_bar - 1 + c.bars - 1], f = d.onset, m = h.onset + h.length;
    for (const v of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (v.onset >= m || v.onset + v.duration <= f) continue;
      const x = Math.max(v.onset, f);
      o.push({ track: ur(v), onset: x - f + a, duration: Math.min(v.onset + v.duration, m) - x, pitch: v.pitch });
    }
    for (const v of i.tracks.chords) v.onset >= f && v.onset < m && r.push({ onset: v.onset - f + a, name: v.name });
    const y = t?.[n[u]];
    l.push(y ? { onset: a, label: c.label, lyrics: y } : { onset: a, label: c.label }), a += m - f;
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
function Nx(i) {
  const e = [...new Set(i)].sort((n, s) => n - s), t = [];
  for (let n = 0; n < e.length; ) {
    let s = n;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > n ? `${e[n]}-${e[s]}` : `${e[n]}`), n = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function Vx(i, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => i.measures[r]);
  if (!t.length) return null;
  const n = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = i.measures[r], u = l + a;
    for (const c of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const d = Math.max(c.onset, l);
      n.push({ track: ur(c), onset: d - l + o, duration: Math.min(c.onset + c.duration, u) - d, pitch: c.pitch });
    }
    for (const c of i.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: i.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: n, chords: s, sections: [], label: Nx(t.map((r) => r + 1)) };
}
function Uc(i, e, t) {
  if (!e.length && !t.length) return null;
  const n = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => ur(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: i.unit,
    span: s - n,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: ur(l), onset: l.onset - n, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - n, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function Gc(i) {
  const e = /^1\/(\d+)$/.exec(i.trim());
  return e ? Number(e[1]) : NaN;
}
function Hx(i, e) {
  const t = Gc(e) / Gc(i.unit);
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
function zx(i, e) {
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
function jc(i, e, t, n) {
  const s = Hx(i, e.unit);
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
const Wx = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, Fx = { class: "hint" }, Kx = ["disabled"], _x = ["disabled"], Ux = ["disabled"], Gx = ["disabled"], jx = ["disabled"], qx = ["draggable", "aria-selected", "onDragstart", "onDragover"], Yx = ["onClick"], Xx = ["title"], Jx = { key: 0 }, Zx = ["onKeydown", "onBlur"], Qx = { class: "facts" }, eS = {
  key: 0,
  class: "section-tools"
}, tS = ["onClick"], nS = ["onClick"], iS = ["onClick"], sS = ["onClick"], oS = {
  key: 1,
  class: "split"
}, rS = ["disabled"], lS = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, aS = { class: "hint" }, uS = ["disabled"], cS = ["disabled"], hS = ["disabled"], dS = ["disabled"], fS = ["disabled"], pS = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], mS = /* @__PURE__ */ xt({
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
    const t = i, n = e, s = W(null), o = W(""), r = W("bridge"), l = W([]), a = W(null);
    let u = null;
    const c = W(!1), d = W(null), h = W([]), f = W(null);
    let m = null;
    const y = W("sections"), v = W(!1), x = W(null), S = O(() => t.view?.sections ?? []), $ = O(() => t.view?.bars ?? []), N = O(() => t.view && t.bar ? dl(t.view, t.bar) : -1), P = O(() => new Set(t.errorBars)), z = O(() => !t.readonly && !!t.view?.model && S.value.length > 0);
    Ie(S, (te) => {
      l.value = (u ?? l.value).filter((G) => G < te.length), u = null;
    }), Ie($, (te) => {
      h.value = (m ?? h.value).filter((G) => G < te.length), m = null;
    });
    function R(te, G) {
      s.value = te, o.value = G;
    }
    function Y(te) {
      const G = o.value.trim();
      s.value = null, G && G !== S.value[te]?.label && n("operate", { op: "rename_section", section: te + 1, label: G });
    }
    function H(te, G) {
      const fe = S.value[te];
      fe && n("operate", { op: "move_section_boundary", section: te + 1, start_bar: fe.start_bar + G });
    }
    function ie(te) {
      const G = t.sourceStarts?.[te - 1];
      return typeof G == "number" ? Eo(G) : null;
    }
    function K(te, G) {
      y.value = "sections";
      const fe = G.ctrlKey || G.metaKey;
      l.value = zc(l.value, te, { toggle: fe, range: G.shiftKey }, a.value), G.shiftKey || (a.value = te);
      const ke = S.value[te];
      ke && !fe && !G.shiftKey && n("goto", ke.start_bar);
    }
    function T(te) {
      !te || !z.value || (u = te.selection, n("operate", { op: "arrange_sections", order: te.order }));
    }
    const F = () => T(Fc(S.value.length, l.value)), ge = () => T(Wc(S.value.length, l.value)), ve = (te) => T(Kc(S.value.length, l.value, te));
    function se() {
      const te = t.view?.model;
      if (!te || !l.value.length) return;
      const G = Px(te, l.value, t.sectionLyrics ?? null);
      G && (Qn.value = G, n("notice", `copied ${G.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function ae(te, G) {
      y.value = "bars";
      const fe = G.ctrlKey || G.metaKey;
      h.value = zc(h.value, te, { toggle: fe, range: G.shiftKey }, f.value), G.shiftKey || (f.value = te);
      const ke = $.value[te];
      ke && !fe && !G.shiftKey && n("goto", ke.index);
    }
    function Be(te) {
      !te || !z.value || (m = te.selection, n("operate", { op: "arrange_measures", order: te.order.map((G) => G - 1) }));
    }
    const xe = () => Be(Fc($.value.length, h.value)), De = () => Be(Wc($.value.length, h.value)), Me = (te) => Be(Kc($.value.length, h.value, te));
    function J() {
      const te = t.view?.model;
      if (!te || !h.value.length) return;
      const G = Vx(te, h.value);
      G && (Qn.value = G, n("notice", `copied ${G.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function Ye(te) {
      const G = te.ctrlKey || te.metaKey, fe = te.key.toLowerCase();
      if (te.key === "Delete" || te.key === "Backspace") De();
      else if (G && fe === "d") xe();
      else if (G && fe === "c") J();
      else if (G && fe === "x" && h.value.length < $.value.length)
        J(), De();
      else if (G && (te.key === "ArrowLeft" || te.key === "ArrowUp")) Me(-1);
      else if (G && (te.key === "ArrowRight" || te.key === "ArrowDown")) Me(1);
      else if (G && fe === "a") h.value = $.value.map((ke, we) => we);
      else if (te.key === "Escape" && h.value.length) h.value = [];
      else return !1;
      return !0;
    }
    function he(te, G) {
      z.value && (y.value = "bars", h.value.includes(te) || (h.value = [te]), v.value = !0, G.dataTransfer?.setData("text/plain", "plenio-bars"), G.dataTransfer && (G.dataTransfer.effectAllowed = "copyMove"));
    }
    function Se(te, G) {
      if (!v.value) return;
      G.preventDefault();
      const fe = G.currentTarget.getBoundingClientRect();
      x.value = G.clientX < fe.left + fe.width / 2 ? te : te + 1, G.dataTransfer && (G.dataTransfer.dropEffect = G.altKey || G.ctrlKey ? "copy" : "move");
    }
    function ne(te) {
      !v.value || x.value === null || (te.preventDefault(), Be(_c($.value.length, h.value, x.value, te.altKey || te.ctrlKey)), q());
    }
    function q() {
      v.value = !1, x.value = null;
    }
    function ee(te) {
      if (!z.value || te.target?.closest("input, textarea, select")) return;
      if (y.value === "bars") {
        Ye(te) && (te.preventDefault(), te.stopPropagation());
        return;
      }
      const G = te.ctrlKey || te.metaKey, fe = te.key.toLowerCase();
      let ke = !0;
      te.key === "Delete" || te.key === "Backspace" ? ge() : G && fe === "d" ? F() : G && fe === "c" ? se() : G && fe === "x" && l.value.length < S.value.length ? (se(), ge()) : G && te.key === "ArrowUp" ? ve(-1) : G && te.key === "ArrowDown" ? ve(1) : G && fe === "a" ? l.value = S.value.map((we, yt) => yt) : te.key === "Escape" && l.value.length ? l.value = [] : ke = !1, ke && (te.preventDefault(), te.stopPropagation());
    }
    function He(te, G) {
      z.value && (l.value.includes(te) || (l.value = [te]), c.value = !0, G.dataTransfer?.setData("text/plain", "plenio-sections"), G.dataTransfer && (G.dataTransfer.effectAllowed = "copyMove"));
    }
    function Ze(te, G) {
      if (!c.value) return;
      G.preventDefault();
      const fe = G.currentTarget.getBoundingClientRect();
      d.value = G.clientY < fe.top + fe.height / 2 ? te : te + 1, G.dataTransfer && (G.dataTransfer.dropEffect = G.altKey || G.ctrlKey ? "copy" : "move");
    }
    function Ke(te) {
      !c.value || d.value === null || (te.preventDefault(), T(_c(S.value.length, l.value, d.value, te.altKey || te.ctrlKey)), vt());
    }
    function vt() {
      c.value = !1, d.value = null;
    }
    return (te, G) => (b(), w("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: ee
    }, [
      z.value ? (b(), w("div", Wx, [
        p("span", Fx, I(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: F
        }, " Duplicate ", 8, Kx),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: se
        }, " Copy ", 8, _x),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: G[0] || (G[0] = (fe) => ve(-1))
        }, "↑", 8, Ux),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: G[1] || (G[1] = (fe) => ve(1))
        }, "↓", 8, Gx),
        p("button", {
          disabled: !l.value.length || l.value.length >= S.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: ge
        }, " Delete ", 8, jx)
      ])) : U("", !0),
      p("ol", {
        class: "sections",
        onDragleave: G[5] || (G[5] = Fe((fe) => d.value = null, ["self"]))
      }, [
        (b(!0), w(de, null, be(S.value, (fe, ke) => (b(), w("li", {
          key: ke,
          class: Ne({
            current: ke === N.value,
            picked: l.value.includes(ke),
            "drop-before": d.value === ke,
            "drop-after": d.value === ke + 1 && ke === S.value.length - 1
          }),
          draggable: z.value,
          "aria-selected": l.value.includes(ke),
          onDragstart: (we) => He(ke, we),
          onDragover: (we) => Ze(ke, we),
          onDrop: Ke,
          onDragend: vt
        }, [
          p("div", {
            class: "section-head",
            onClick: (we) => K(ke, we)
          }, [
            p("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${fe.start_bar}`
            }, [
              s.value !== ke ? (b(), w("strong", Jx, I(fe.label), 1)) : U("", !0)
            ], 8, Xx),
            s.value === ke ? Le((b(), w("input", {
              key: 0,
              "onUpdate:modelValue": G[2] || (G[2] = (we) => o.value = we),
              class: "rename",
              "aria-label": "Section name",
              onClick: G[3] || (G[3] = Fe(() => {
              }, ["stop"])),
              onKeydown: [
                et(Fe((we) => Y(ke), ["prevent"]), ["enter"]),
                G[4] || (G[4] = et(Fe((we) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (we) => Y(ke)
            }, null, 40, Zx)), [
              [ot, o.value]
            ]) : U("", !0),
            p("span", Qx, [
              ue(" bars " + I(fe.start_bar) + "-" + I(fe.start_bar + fe.bars - 1) + " · " + I(B(Eo)(fe.start_s)) + " ", 1),
              ie(fe.start_bar) ? (b(), w(de, { key: 0 }, [
                ue(" · source " + I(ie(fe.start_bar)), 1)
              ], 64)) : U("", !0)
            ])
          ], 8, Yx),
          i.readonly ? U("", !0) : (b(), w("div", eS, [
            p("button", {
              title: "Rename this section",
              onClick: (we) => R(ke, fe.label)
            }, "Rename", 8, tS),
            ke > 0 ? (b(), w(de, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (we) => H(ke, -1)
              }, "◀ bar", 8, nS),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (we) => H(ke, 1)
              }, "bar ▶", 8, iS),
              p("button", {
                title: "Join this section to the one before",
                onClick: (we) => n("operate", { op: "merge_section", section: ke + 1 })
              }, " Join ↑ ", 8, sS)
            ], 64)) : U("", !0)
          ]))
        ], 42, qx))), 128))
      ], 32),
      !i.readonly && i.bar ? (b(), w("div", oS, [
        p("label", null, [
          ue(" New section at bar " + I(i.bar) + ": ", 1),
          Le(p("input", {
            "onUpdate:modelValue": G[6] || (G[6] = (fe) => r.value = fe),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [ot, r.value]
          ])
        ]),
        p("button", {
          disabled: i.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: G[7] || (G[7] = (fe) => n("operate", { op: "split_section", bar: i.bar, label: r.value }))
        }, " Split ", 8, rS)
      ])) : U("", !0),
      z.value ? (b(), w("div", lS, [
        p("span", aS, I(h.value.length ? `${h.value.length} bar${h.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !h.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: xe
        }, " Duplicate ", 8, uS),
        p("button", {
          disabled: !h.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: J
        }, " Copy ", 8, cS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: G[8] || (G[8] = (fe) => Me(-1))
        }, "←", 8, hS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: G[9] || (G[9] = (fe) => Me(1))
        }, "→", 8, dS),
        p("button", {
          disabled: !h.value.length || h.value.length >= $.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: De
        }, " Delete ", 8, fS)
      ])) : U("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: G[10] || (G[10] = Fe((fe) => x.value = null, ["self"]))
      }, [
        (b(!0), w(de, null, be($.value, (fe, ke) => (b(), w("button", {
          key: fe.index,
          role: "listitem",
          class: Ne(["bar", {
            selected: fe.index === i.bar,
            picked: h.value.includes(ke),
            error: P.value.has(fe.index),
            alt: i.view ? B(dl)(i.view, fe.index) % 2 === 1 : !1,
            "drop-before": x.value === ke,
            "drop-after": x.value === ke + 1 && ke === $.value.length - 1
          }]),
          draggable: z.value,
          "aria-selected": h.value.includes(ke),
          title: `Bar ${fe.index} · ${B(Eo)(fe.start_s)} · ${fe.chords.join(" ") || "no chord"}${z.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (we) => ae(ke, we),
          onDragstart: (we) => he(ke, we),
          onDragover: (we) => Se(ke, we),
          onDrop: ne,
          onDragend: q
        }, I(fe.index), 43, pS))), 128))
      ], 32)
    ], 32));
  }
}), gS = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, vS = {
  class: "group",
  "aria-label": "History"
}, yS = ["disabled", "title"], bS = ["disabled", "title"], kS = {
  class: "group",
  "aria-label": "Pitch"
}, wS = ["disabled"], xS = ["disabled"], SS = ["disabled"], CS = ["disabled"], MS = {
  class: "group",
  "aria-label": "Length"
}, AS = ["disabled"], TS = ["disabled"], $S = ["disabled"], DS = ["disabled"], LS = {
  class: "group",
  "aria-label": "Chord"
}, BS = ["disabled"], OS = ["disabled"], ES = ["disabled"], IS = { class: "group whole" }, RS = { class: "whole-tools" }, PS = ["disabled"], NS = ["disabled"], VS = ["aria-label"], HS = ["disabled", "title", "onClick"], zS = ["disabled", "title", "onClick"], WS = ["disabled"], FS = ["disabled"], KS = ["disabled"], _S = ["disabled"], US = /* @__PURE__ */ xt({
  __name: "ScorePalette",
  props: {
    view: {},
    selection: {},
    primary: {},
    busy: { type: Boolean },
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    undoLabel: {},
    redoLabel: {}
  },
  emits: ["operate", "undo", "redo"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = W(""), o = W(null), r = O(() => t.selection.filter((x) => t.view?.elements?.find((S) => S.id === x)?.kind === "note")), l = O(() => [...Xs(t.selection)]), a = O(() => r.value.length > 0 || l.value.length > 0), u = O(() => t.primary?.kind === "note"), c = O(() => t.primary !== null && t.primary.kind !== "note"), d = O(() => {
      const x = t.primary;
      return !x || !t.view ? null : t.view.chords?.find((S) => S.bar === x.bar && Math.abs(S.start_s - x.start_s) < 1e-6) ?? null;
    }), h = O(() => t.primary && u.value ? hl(t.primary.units, 1) : null), f = O(() => t.primary && u.value ? hl(t.primary.units, -1) : null);
    Ie(
      () => t.view?.header?.tempo_bpm,
      (x) => {
        o.value = x ?? null;
      },
      { immediate: !0 }
    ), Ie(d, (x) => {
      s.value = x?.name ?? "";
    });
    const m = Object.values(Xn).map(({ track: x, name: S }) => [x, S]), y = (x, S) => Cs(t.view, x, S);
    function v(x) {
      l.value.length ? n("operate", { op: "set_note_pitch", ids: [...ds(t.view, t.selection), ...l.value], semitones: x }) : r.value.length && n("operate", { op: "shift_pitch", ids: r.value, semitones: x });
    }
    return (x, S) => (b(), w("div", gS, [
      p("div", vS, [
        p("button", {
          disabled: !i.canUndo || i.busy,
          title: `Undo${i.undoLabel ? ": " + i.undoLabel : ""} (Ctrl+Z)`,
          onClick: S[0] || (S[0] = ($) => n("undo"))
        }, "↶", 8, yS),
        p("button", {
          disabled: !i.canRedo || i.busy,
          title: `Redo${i.redoLabel ? ": " + i.redoLabel : ""} (Ctrl+Y)`,
          onClick: S[1] || (S[1] = ($) => n("redo"))
        }, "↷", 8, bS)
      ]),
      p("div", kS, [
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave down (Shift+↓)",
          onClick: S[2] || (S[2] = ($) => v(-12))
        }, "−8va", 8, wS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: S[3] || (S[3] = ($) => v(-1))
        }, "−1", 8, xS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: S[4] || (S[4] = ($) => v(1))
        }, "+1", 8, SS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave up (Shift+↑)",
          onClick: S[5] || (S[5] = ($) => v(12))
        }, "+8va", 8, CS)
      ]),
      p("div", MS, [
        p("button", {
          disabled: !f.value || i.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: S[6] || (S[6] = ($) => i.primary && f.value && n("operate", { op: "set_duration", id: i.primary.id, units: f.value }))
        }, " shorter ", 8, AS),
        p("button", {
          disabled: !h.value || i.busy,
          title: "Longer, into the rest after the note (])",
          onClick: S[7] || (S[7] = ($) => i.primary && h.value && n("operate", { op: "set_duration", id: i.primary.id, units: h.value }))
        }, " longer ", 8, TS),
        p("button", {
          disabled: !r.value.length || i.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: S[8] || (S[8] = ($) => n("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, $S),
        p("button", {
          disabled: !c.value || i.busy,
          title: "Turn the rest into a note (N)",
          onClick: S[9] || (S[9] = ($) => i.primary && n("operate", { op: "rest_to_note", id: i.primary.id }))
        }, " note ", 8, DS)
      ]),
      p("div", LS, [
        Le(p("input", {
          "onUpdate:modelValue": S[10] || (S[10] = ($) => s.value = $),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !i.primary || i.busy,
          onKeydown: S[11] || (S[11] = et(Fe(($) => i.primary && s.value.trim() && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, BS), [
          [ot, s.value]
        ]),
        p("button", {
          disabled: !i.primary || !s.value.trim() || i.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: S[12] || (S[12] = ($) => i.primary && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }))
        }, " set ", 8, OS),
        p("button", {
          disabled: !d.value || i.busy,
          title: "Remove the chord symbol at the selection",
          onClick: S[13] || (S[13] = ($) => d.value && n("operate", { op: "remove_chord", chord: d.value.id }))
        }, " remove ", 8, ES)
      ]),
      p("details", IS, [
        S[22] || (S[22] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", RS, [
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone down",
            onClick: S[14] || (S[14] = ($) => n("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, PS),
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone up",
            onClick: S[15] || (S[15] = ($) => n("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, NS),
          (b(!0), w(de, null, be(B(m), ([$, N]) => (b(), w("span", {
            key: $,
            class: "track-octave",
            role: "group",
            "aria-label": `${N} track octave`
          }, [
            ue(I(N) + " ", 1),
            p("button", {
              disabled: i.busy || !!y($, -12),
              title: y($, -12) ?? `Every ${N} note an octave down (chord symbols and keys stay)`,
              onClick: (P) => n("operate", { op: "shift_track", track: $, semitones: -12 })
            }, " −8va ", 8, HS),
            p("button", {
              disabled: i.busy || !!y($, 12),
              title: y($, 12) ?? `Every ${N} note an octave up (chord symbols and keys stay)`,
              onClick: (P) => n("operate", { op: "shift_track", track: $, semitones: 12 })
            }, " +8va ", 8, zS)
          ], 8, VS))), 128)),
          p("label", null, [
            S[21] || (S[21] = ue(" tempo ", -1)),
            Le(p("input", {
              "onUpdate:modelValue": S[16] || (S[16] = ($) => o.value = $),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                ot,
                o.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("button", {
            disabled: i.busy || !o.value || o.value === i.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: S[17] || (S[17] = ($) => o.value && n("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, WS),
          p("button", {
            disabled: i.busy || !i.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: S[18] || (S[18] = ($) => n("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, FS),
          p("button", {
            disabled: i.busy,
            title: "Let the instrument play the vocal melody",
            onClick: S[19] || (S[19] = ($) => n("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, KS),
          p("button", {
            disabled: i.busy,
            title: "Replace every Vocal note by rests",
            onClick: S[20] || (S[20] = ($) => n("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, _S)
        ])
      ])
    ]));
  }
}), GS = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, jS = ["disabled", "title"], qS = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, YS = ["aria-checked", "disabled", "title", "onClick"], XS = ["disabled"], JS = ["title"], ZS = ["disabled"], QS = { class: "align" }, eC = ["aria-expanded", "title"], tC = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, nC = ["title"], iC = ["title"], sC = ["disabled"], oC = {
  key: 0,
  class: "facts"
}, rC = ["title"], lC = { title: "A click on every beat (takes effect at the next start)" }, aC = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, uC = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, cC = ["checked"], hC = { title: "Practice speed; the score's tempo is not changed" }, dC = { class: "facts" }, fC = {
  key: 1,
  class: "error"
}, pC = /* @__PURE__ */ xt({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ Zt({
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
  emits: /* @__PURE__ */ Zt(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = rt(i, "voices"), o = rt(i, "speed"), r = rt(i, "metronome"), l = rt(i, "hear"), a = rt(i, "sourceLevel"), u = rt(i, "sourceShift"), c = W(!1);
    function d(ne) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + ne) * 1e3) / 1e3));
    }
    const h = O(() => {
      const ne = Math.round(u.value * 1e3);
      return ne ? `${Math.abs(ne)} ms ${ne > 0 ? "later" : "earlier"}` : "in place";
    }), f = t, m = new fw(), y = W(!1), v = W(!1);
    let x = 0, S = null;
    const $ = W(!1), N = W(0), P = W(null);
    let z = null;
    const R = O(() => n.bar ?? 1), Y = O(() => n.from ?? n.view?.bars[R.value - 1]?.start_s ?? 0), H = O(() => n.position ? `the cursor (${n.position})` : `bar ${R.value}`), ie = O(() => !!n.view?.notes), K = O(() => !!n.reference && !!n.source && o.value === 1), T = O(() => n.reference ? n.sourceProblem ? n.sourceProblem : n.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function F() {
      const ne = K.value ? l.value : "notes";
      return { tones: ne === "source" ? 0 : 1, source: ne === "notes" ? 0 : a.value };
    }
    function ge(ne) {
      const q = n.view?.bars ?? [];
      let ee = 1;
      for (const He of q) He.start_s <= ne + Lo && (ee = He.index);
      return ee;
    }
    function ve(ne) {
      if (n.loopRange) return [n.loopRange.from, n.loopRange.to];
      const q = n.view;
      if (!q) return null;
      const ee = q.sections[dl(q, ge(ne))];
      return ee ? [ee.start_s, ee.end_s] : null;
    }
    function se(ne = Y.value, q = null) {
      const ee = n.view;
      if (!ee) return;
      De(), S = q;
      const He = $.value && !q ? ve(ne) : null, Ze = He && (ne < He[0] - Lo || ne >= He[1] - Lo) ? He[0] : ne, Ke = K.value, vt = Ke ? dp(ee, n.timelineBars) : null, te = { ...s.value };
      q?.mute && (te[q.mute] = !1), z = {
        from: Ze,
        to: He ? He[1] : null,
        voices: te,
        speed: o.value,
        metronome: r.value,
        guide: n.guide ?? [],
        clock: vt
      };
      const G = z;
      x = q ? Be(ee, Ze, q.countIn, vt) : 0;
      const fe = fp(ee, G).map((we) => ({ ...we, at: we.at + x }));
      x && fe.unshift(...xe(ee, Ze, q?.countIn ?? 0, x));
      const ke = Ke && vt && n.source ? pp(vt, Ze, G.to).map((we) => ({ ...we, at: we.at + x })) : [];
      try {
        m.play(fe, {
          source: ke.length && n.source ? { buffer: n.source.buffer, segments: ke } : null,
          levels: F(),
          length: x + vp(ee, G),
          sounds: n.sounds,
          onTick: (we) => {
            v.value = we < x, !(we < x) && (N.value = mp(G, we - x), f("cursor", gp(ee, N.value, G.voices)), f("time", N.value));
          },
          onEnd: () => {
            $.value && y.value && !q ? se(He?.[0] ?? G.from) : Me();
          }
        }), y.value = !0, v.value = x > 0, P.value = null;
      } catch (we) {
        P.value = we instanceof Error ? we.message : String(we);
      }
    }
    function ae(ne, q, ee) {
      const He = ne.bars[ge(q) - 1], Ze = Number(He?.meter.split("/")[0]) || 4;
      return { beat: (ee?.[ge(q) - 1]?.realDur ?? He?.duration_s ?? 2) / Ze / ja(o.value), beats: Ze };
    }
    function Be(ne, q, ee, He) {
      if (ee <= 0) return 0;
      const { beat: Ze, beats: Ke } = ae(ne, q, He);
      return ee * Ke * Ze;
    }
    function xe(ne, q, ee, He) {
      const { beat: Ze, beats: Ke } = ae(ne, q, z?.clock ?? null);
      return yp(ne.bars[ge(q) - 1] ?? null, Ke, q, ee, He, Ze);
    }
    function De() {
      m.stop(), y.value = !1, v.value = !1, S = null;
    }
    function Me() {
      const ne = y.value;
      De(), f("cursor", []), f("time", null), ne && f("stopped");
    }
    function J(ne, q) {
      return se(ne, q), y.value;
    }
    function Ye(ne) {
      const q = z;
      if (!q || !y.value) return null;
      const ee = m.elapsedAt(ne) - x, He = q.clock?.length ? q.clock : null, Ze = ee * ja(q.speed);
      return He ? bp(He, kp(He, q.from) + Ze) : q.from + Ze;
    }
    function he() {
      y.value ? Me() : se();
    }
    function Se() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Ie(
      () => n.sounds,
      (ne) => {
        ne && m.setSounds(ne);
      },
      { deep: !0 }
    ), Ie([l, a], () => {
      y.value && m.setLevels(F());
    }), Ie(
      () => n.from,
      (ne, q) => {
        y.value && !S && ne !== null && ne !== void 0 && ne !== q && se(ne);
      }
    ), e({ toggle: he, stop: Me, swap: Se, playing: y, record: J, scoreSecondAt: Ye, countingIn: v }), _n(() => m.close()), (ne, q) => (b(), w("div", GS, [
      p("button", {
        disabled: !ie.value,
        title: y.value ? "Stop (Space)" : `Play from ${H.value} (Space)`,
        onClick: he
      }, I(y.value ? "■ stop" : "▶ play"), 9, jS),
      np(ne.$slots, "record", {
        playing: y.value,
        countingIn: v.value
      }),
      i.reference ? (b(), w("span", qS, [
        (b(), w(de, null, be(["both", "notes", "source"], (ee) => p("button", {
          key: ee,
          role: "radio",
          "aria-checked": l.value === ee,
          class: Ne({ active: l.value === ee }),
          disabled: !K.value && ee !== "notes",
          title: T.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[ee],
          onClick: (He) => l.value = ee
        }, I(ee), 11, YS)), 64)),
        p("button", {
          disabled: !K.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Se
        }, "A/B", 8, XS),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          q[14] || (q[14] = ue(" source ", -1)),
          Le(p("input", {
            "onUpdate:modelValue": q[0] || (q[0] = (ee) => a.value = ee),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !K.value,
            "aria-label": "Source level"
          }, null, 8, ZS), [
            [
              ot,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, JS),
        p("span", QS, [
          p("button", {
            class: Ne({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${h.value})`,
            onClick: q[1] || (q[1] = (ee) => c.value = !c.value)
          }, " ⇆ align" + I(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, eC),
          c.value ? (b(), w("span", tC, [
            q[15] || (q[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: q[2] || (q[2] = (ee) => d(-(i.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, nC),
            p("button", {
              title: "10 ms earlier",
              onClick: q[3] || (q[3] = (ee) => d(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, I(h.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: q[4] || (q[4] = (ee) => d(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: q[5] || (q[5] = (ee) => d(i.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, iC),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: q[6] || (q[6] = (ee) => u.value = 0)
            }, "reset", 8, sC)
          ])) : U("", !0)
        ]),
        T.value ? (b(), w("span", oC, I(T.value), 1)) : U("", !0)
      ])) : U("", !0),
      p("label", {
        title: i.loopRange ? `Play to the end of the selection (${i.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        Le(p("input", {
          "onUpdate:modelValue": q[7] || (q[7] = (ee) => $.value = ee),
          type: "checkbox"
        }, null, 512), [
          [It, $.value]
        ]),
        ue(" loop " + I(i.loopRange ? i.loopRange.label : "section"), 1)
      ], 8, rC),
      p("label", lC, [
        Le(p("input", {
          "onUpdate:modelValue": q[8] || (q[8] = (ee) => r.value = ee),
          type: "checkbox"
        }, null, 512), [
          [It, r.value]
        ]),
        q[16] || (q[16] = ue(" metronome", -1))
      ]),
      p("span", aC, [
        p("label", null, [
          Le(p("input", {
            "onUpdate:modelValue": q[9] || (q[9] = (ee) => s.value.Vocal = ee),
            type: "checkbox"
          }, null, 512), [
            [It, s.value.Vocal]
          ]),
          q[17] || (q[17] = ue(" Vocal", -1))
        ]),
        p("label", null, [
          Le(p("input", {
            "onUpdate:modelValue": q[10] || (q[10] = (ee) => s.value.Ins = ee),
            type: "checkbox"
          }, null, 512), [
            [It, s.value.Ins]
          ]),
          q[18] || (q[18] = ue(" Ins", -1))
        ]),
        p("label", null, [
          Le(p("input", {
            "onUpdate:modelValue": q[11] || (q[11] = (ee) => s.value.chords = ee),
            type: "checkbox"
          }, null, 512), [
            [It, s.value.chords]
          ]),
          q[19] || (q[19] = ue(" chords", -1))
        ]),
        i.guide?.length ? (b(), w("label", uC, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: q[12] || (q[12] = (ee) => s.value = { ...s.value, guide: ee.target.checked })
          }, null, 40, cC),
          q[20] || (q[20] = ue(" Guide ", -1))
        ])) : U("", !0)
      ]),
      p("label", hC, [
        q[22] || (q[22] = ue(" speed ", -1)),
        Le(p("select", {
          "onUpdate:modelValue": q[13] || (q[13] = (ee) => o.value = ee),
          "aria-label": "Playback speed"
        }, [...q[21] || (q[21] = [
          p("option", { value: 0.5 }, "50 %", -1),
          p("option", { value: 0.75 }, "75 %", -1),
          p("option", { value: 1 }, "100 %", -1),
          p("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            oi,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      p("span", dC, I(y.value ? `▶ ${B(Eo)(N.value)}` : `${i.position ? `cursor ${i.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      P.value ? (b(), w("span", fC, I(P.value), 1)) : U("", !0)
    ]));
  }
}), mC = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, gC = { class: "track-name" }, vC = { class: "count" }, yC = ["value", "aria-label", "title", "onChange"], bC = ["value", "title"], kC = ["title"], wC = ["checked", "aria-label", "onChange"], xC = ["aria-label"], SC = ["disabled", "title", "onClick"], CC = ["disabled", "title", "onClick"], MC = {
  key: 0,
  class: "hint"
}, AC = {
  key: 1,
  class: "hint"
}, TC = /* @__PURE__ */ xt({
  __name: "TrackPanel",
  props: /* @__PURE__ */ Zt({
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
  emits: /* @__PURE__ */ Zt(["clearGuide", "shiftTrack"], ["update:voices", "update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = rt(i, "voices"), s = rt(i, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(d, h) {
      const f = o[d];
      s.value && f && (s.value = { ...s.value, [f]: h });
    }
    const l = e, a = O(
      () => um(t.view, t.guideCount).filter((d) => t.keepsGuide || d.voice !== "guide")
    );
    function u(d) {
      return d === "guide" ? n.value.guide !== !1 : n.value[d] !== !1;
    }
    function c(d, h) {
      d === "guide" ? n.value = { ...n.value, guide: h } : n.value = { ...n.value, [d]: h };
    }
    return (d, h) => (b(), w("div", mC, [
      h[2] || (h[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (b(!0), w(de, null, be(a.value, (f) => (b(), w("li", {
          key: f.voice,
          class: Ne({ guide: f.voice === "guide", active: f.voice === "guide" && i.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: Yi({ background: f.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", gC, I(f.name), 1),
          p("span", {
            class: Ne(["destination", { unsent: !f.sent }])
          }, I(f.destination), 3),
          p("span", vC, I(B(am)(f.notes)), 1),
          s.value && o[f.voice] ? (b(), w("select", {
            key: 0,
            class: "sound",
            value: s.value[o[f.voice]],
            "aria-label": `Sound of the ${f.name} track`,
            title: `The ${f.name} track’s sound in the playback`,
            onChange: (m) => r(f.voice, m.target.value)
          }, [
            (b(!0), w(de, null, be(B(th), (m) => (b(), w("option", {
              key: m,
              value: m,
              title: B(Ko)[m].hint
            }, I(B(Ko)[m].label), 9, bC))), 128))
          ], 40, yC)) : U("", !0),
          p("label", {
            class: "play",
            title: `Play the ${f.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(f.voice),
              "aria-label": `Play the ${f.name} track`,
              onChange: (m) => c(f.voice, m.target.checked)
            }, null, 40, wC)
          ], 8, kC),
          B(Xn)[f.voice] && !i.readonly ? (b(), w("span", {
            key: 1,
            class: "octave",
            role: "group",
            "aria-label": `${f.name} track octave`
          }, [
            p("button", {
              class: "shift",
              disabled: !!B(Cs)(i.view, B(Xn)[f.voice].track, -12),
              title: B(Cs)(i.view, B(Xn)[f.voice].track, -12) ?? `Every ${f.name} note an octave down`,
              onClick: (m) => l("shiftTrack", B(Xn)[f.voice].track, -12)
            }, " −8va ", 8, SC),
            p("button", {
              class: "shift",
              disabled: !!B(Cs)(i.view, B(Xn)[f.voice].track, 12),
              title: B(Cs)(i.view, B(Xn)[f.voice].track, 12) ?? `Every ${f.name} note an octave up`,
              onClick: (m) => l("shiftTrack", B(Xn)[f.voice].track, 12)
            }, " +8va ", 8, CC)
          ], 8, xC)) : U("", !0),
          f.voice === "guide" && f.notes > 0 && !i.readonly ? (b(), w("button", {
            key: 2,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: h[0] || (h[0] = (m) => l("clearGuide"))
          }, " clear ")) : U("", !0)
        ], 2))), 128))
      ]),
      i.keepsGuide ? (b(), w("p", MC, [...h[1] || (h[1] = [
        ue(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        ue(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (b(), w("p", AC, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), $C = /^\[([^[\]\n]{1,40})\]$/;
function Js(i) {
  const e = [], t = [];
  let n = null;
  for (const s of i.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = $C.exec(o);
    r ? (n = { tag: r[1].trim(), lines: [] }, t.push(n)) : o && (n ? n.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function cr(i) {
  return i.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function Va(i, e) {
  return e && cr(e.tag) === cr(i) ? e.tag : i.replace(/(^|[\s-])(\p{L})/gu, (t, n, s) => n + s.toUpperCase());
}
function hr(i) {
  return i.sections.map((e) => i.measures[e.first_bar - 1]?.onset ?? 0);
}
function $o(i, e) {
  if (!i?.trim() || !e) return null;
  const t = Js(i), n = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== n.length || n.some((o, r) => cr(o.label) !== cr(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function DC(i, e) {
  const t = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return e.sections.forEach((n, s) => {
    if (n.implicit) return;
    const o = i.blocks[s] ?? null;
    t.push([`[${Va(n.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function If(i, e) {
  return e?.length ? e : [[0, i.total, 0]];
}
function Rf(i, e, t) {
  const n = If(i, t), s = hr(i), o = (u) => {
    let c = -1;
    return s.forEach((d, h) => {
      d <= u && (c = h);
    }), c;
  }, r = (u) => {
    for (const [c, d, h] of n)
      if (u >= h && u < h + d - c) return c + u - h;
    return null;
  }, l = [], a = [];
  return hr(e).forEach((u, c) => {
    const d = r(u), h = d === null ? -1 : o(d);
    a.push(h), l.push(h >= 0 && d !== null && (d === s[h] || a[c - 1] !== h) ? h : -1);
  }), l;
}
function LC(i, e, t, n, s = () => null) {
  const o = If(e, n), r = hr(e), l = hr(t), a = (f) => {
    for (const [m, y, v] of o)
      if (f >= v && f < v + y - m) return m + f - v;
    return null;
  }, u = (f) => f ? { tag: f.tag, lines: [...f.lines] } : null, c = Rf(e, t, n), d = new Set(c.filter((f) => f >= 0)), h = l.map((f, m) => a(f) === null ? s(f) : c[m] >= 0 ? u(i.blocks[c[m]] ?? null) : null);
  return r.forEach((f, m) => {
    const y = i.blocks[m]?.lines;
    if (!(d.has(m) || !y?.length))
      for (const [v, x, S] of o) {
        if (f < v || f >= x) continue;
        const $ = S + f - v;
        let N = -1;
        l.forEach((z, R) => {
          z <= $ && (N = R);
        });
        const P = N >= 0 && l[N] !== $ ? h[N] : null;
        P && (h[N] = { tag: P.tag, lines: [...P.lines, ...y] });
      }
  }), { preamble: i.preamble, blocks: h };
}
function Pf(i, e, t) {
  const n = [...i], s = t.trim();
  return e >= n.length ? s && n.push(s) : s ? n[e] = s : n.splice(e, 1), n;
}
function BC(i, e, t, n) {
  const s = Js(i);
  if (!s.blocks[e]) return i;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Pf(a.lines, t, n) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function OC(i, e, t, n, s) {
  const o = e.sections[t]?.label ?? "", r = i.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Va(o, null), lines: [] };
    return { tag: u.tag, lines: Pf(u.lines, n, s) };
  });
  return { preamble: i.preamble, blocks: r };
}
function EC(i, e, t) {
  const n = Js(i);
  if (!n.blocks[e]) return i;
  const s = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return n.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function IC(i, e, t, n) {
  const s = e.sections[t]?.label ?? "", o = i.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Va(s, null) }).tag, lines: [...n] } : r
  );
  return { preamble: i.preamble, blocks: o };
}
const RC = 2, PC = 0.5, NC = 32;
function qc(i, e, t, n) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= n) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, n) - l}.${o.pitch}`);
  }
  return `${i}:${s.join(",")}`;
}
function VC(i) {
  return i.measures.map((e) => [
    qc(e.meter, i.tracks.vocal, e.onset, e.onset + e.length),
    qc(e.meter, i.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function HC(i, e) {
  let t = 0;
  for (let n = 0; n < 2; n++) i[n] === e[n] && (t += i[n].endsWith(":") ? PC : RC);
  return t;
}
function zC(i, e) {
  const t = i.map((l) => e.map((a) => HC(l, a))), n = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < NC && l + u < i.length && a + u < e.length && !(n[l + u] <= 0 || t[l + u][a + u] !== n[l + u]); )
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
function WC(i, e) {
  if (e?.bars?.length)
    return !i || !e.bar_prints?.length ? i ? i.measures.map((t, n) => e.bars[n] ?? null) : e.bars : zC(VC(i), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const FC = "1.5.0";
function KC(i) {
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
function Yc(i, e) {
  return {
    ...i,
    ...e,
    sounds: { ...i.sounds, ...e.sounds ?? {} },
    record: { ...i.record, ...e.record ?? {} }
  };
}
function Ha(i) {
  if (typeof i != "object" || i === null) return {};
  const e = i, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const n = e.sounds;
    Object.values(n).some(xp) && (t.sounds = Sp(n));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = Cp(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), Mp(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const wn = (i, e, t, n) => ({ Vocal: i, Ins: e, chord: t, guide: n }), Do = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: wn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: wn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: wn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: wn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: wn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: wn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: wn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: wn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: wn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...wp(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: wn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], _C = "plenio/score-editor-presets.json", UC = "plenio.score_presets/1", Nf = "plenio.score-editor.presets";
function Vf(i) {
  const e = typeof i == "object" && i !== null ? i : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), n.push({ name: r, builtIn: !1, settings: Ha(o.settings) }));
  }
  return n;
}
function Hf(i) {
  return JSON.stringify({ schema: UC, presets: i.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function GC() {
  try {
    return Vf(JSON.parse(window.localStorage.getItem(Nf) ?? "{}"));
  } catch {
    return [];
  }
}
function jC(i) {
  try {
    return window.localStorage.setItem(Nf, Hf(i)), !0;
  } catch {
    return !1;
  }
}
const zf = `/userdata/${encodeURIComponent(_C)}`;
async function qC(i) {
  if (i)
    try {
      const e = await i.fetchApi(zf, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: Vf(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: GC(), where: "browser" };
}
async function Xc(i, e) {
  const t = e.filter((n) => !n.builtIn);
  if (i)
    try {
      if ((await i.fetchApi(`${zf}?overwrite=true`, { method: "POST", body: Hf(t) })).ok) return "comfyui";
    } catch {
    }
  return jC(t) ? "browser" : "failed";
}
function YC(i, e) {
  return [...i.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, n) => t.name.localeCompare(n.name));
}
const Wo = "plenio.score_project/1", Wf = ".plenio.json";
function Jc(i, e = /* @__PURE__ */ new Date()) {
  return {
    schema: Wo,
    app: `Plenio Music Production System ${FC}`,
    saved: e.toISOString(),
    title: (i.title ?? "").trim(),
    score: i.score,
    guide: (i.guide ?? []).map(([t, n, s]) => [t, n, s]),
    lyrics: i.lyrics?.trim() ? i.lyrics : null,
    lyric_spans: i.lyrics?.trim() ? oa(i.lyricSpans ?? []) : [],
    settings: i.settings ? Ha(i.settings) : {}
  };
}
function XC(i) {
  return `${Array.from((i ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${Wf}`;
}
function JC(i) {
  let e;
  try {
    e = JSON.parse(i);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== Wo ? `This file is not a Plenio score project (${Wo}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: Wo,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: cm(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: oa(t.lyric_spans),
    settings: Ha(t.settings)
  };
}
const ZC = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, QC = ["disabled", "title"], e2 = ["disabled", "title"], t2 = ["title"], n2 = { class: "midi-settings" }, i2 = ["aria-expanded"], s2 = ["onKeydown"], o2 = { class: "facts" }, r2 = { key: 0 }, l2 = ["value"], a2 = ["value"], u2 = ["value"], c2 = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, h2 = ["checked"], d2 = ["value"], f2 = { title: "Where the take's starts and ends go" }, p2 = ["value"], m2 = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, g2 = ["value"], v2 = { title: "Silence the old notes of the recorded voice while recording" }, y2 = ["checked"], b2 = ["value"], k2 = /* @__PURE__ */ xt({
  __name: "RecordControls",
  props: /* @__PURE__ */ Zt({
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
  emits: /* @__PURE__ */ Zt(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(i, { emit: e }) {
    const t = i, n = rt(i, "settings"), s = e, o = W(!1), r = W(null);
    function l() {
      o.value = !1, nn(() => r.value?.focus());
    }
    const a = W(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    _n(() => clearInterval(u));
    const c = O(() => {
      const y = t.hub.selected.value;
      if (y === "all") return null;
      const v = t.hub.devices.value.find((x) => x.id === y);
      return v?.connected ? null : v?.name ?? "the chosen keyboard";
    }), d = O(() => a.value - t.hub.activity.value < 250), h = O(() => {
      const y = t.hub;
      if (y.status.value === "ready") {
        const v = y.devices.value.filter((x) => x.connected);
        return v.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${v.length} keyboard${v.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return y.status.value === "asking" ? "asking for MIDI access…" : y.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : y.problem.value ?? "MIDI is not available";
    }), f = O(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${n.value.countIn ? `, after ${n.value.countIn} bar${n.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function m(y, v) {
      n.value = { ...n.value, [y]: v };
    }
    return (y, v) => (b(), w("span", ZC, [
      p("button", {
        class: Ne(["rec", { on: i.recording, counting: i.countingIn }]),
        disabled: !!i.disabled && !i.recording,
        title: f.value,
        onClick: v[0] || (v[0] = (x) => i.recording ? s("stop") : s("record"))
      }, " ● " + I(i.recording && i.countingIn ? "count-in" : "rec"), 11, QC),
      p("button", {
        class: Ne(["step", { on: i.step }]),
        disabled: !!i.disabled || i.recording,
        title: i.disabled ?? (i.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${i.target}: every key writes a note of the step length at the cursor`),
        onClick: v[1] || (v[1] = (x) => s("step"))
      }, " step ", 10, e2),
      i.step ? (b(), w("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: v[2] || (v[2] = (x) => s("rest"))
      }, "rest ▶")) : U("", !0),
      p("span", {
        class: Ne(["midi-light", { active: d.value, ready: i.hub.status.value === "ready" }]),
        title: h.value,
        "aria-hidden": "true"
      }, null, 10, t2),
      p("span", n2, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: v[3] || (v[3] = (x) => o.value ? l() : o.value = !0)
        }, "🎹", 8, i2),
        o.value ? (b(), w("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: et(Fe(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          v[24] || (v[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", o2, I(h.value), 1),
          i.hub.status.value === "ready" ? (b(), w("label", r2, [
            v[13] || (v[13] = ue(" keyboard ", -1)),
            p("select", {
              value: i.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: v[4] || (v[4] = (x) => i.hub.selected.value = x.target.value)
            }, [
              v[12] || (v[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (b(!0), w(de, null, be(i.hub.devices.value.filter((x) => x.connected), (x) => (b(), w("option", {
                key: x.id,
                value: x.id
              }, I(x.name), 9, a2))), 128)),
              c.value ? (b(), w("option", {
                key: 0,
                value: i.hub.selected.value,
                disabled: ""
              }, I(c.value) + " (unplugged)", 9, u2)) : U("", !0)
            ], 40, l2)
          ])) : i.hub.status.value !== "asking" ? (b(), w("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: v[5] || (v[5] = (x) => s("enable"))
          }, "use MIDI")) : U("", !0),
          p("label", c2, [
            p("input", {
              checked: n.value.thru,
              type: "checkbox",
              onChange: v[6] || (v[6] = (x) => m("thru", x.target.checked))
            }, null, 40, h2),
            v[14] || (v[14] = ue(" hear the keys ", -1))
          ]),
          p("strong", null, "Recording into " + I(i.target), 1),
          v[25] || (v[25] = p("span", { class: "facts" }, [
            ue("The voice is the roll's "),
            p("em", null, "draw into"),
            ue("; the take starts at the cursor.")
          ], -1)),
          p("label", null, [
            v[16] || (v[16] = ue(" count-in ", -1)),
            p("select", {
              value: n.value.countIn,
              "aria-label": "Count-in",
              onChange: v[7] || (v[7] = (x) => m("countIn", Number(x.target.value)))
            }, [...v[15] || (v[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, d2)
          ]),
          p("label", f2, [
            v[18] || (v[18] = ue(" quantize ", -1)),
            p("select", {
              value: n.value.quantize,
              "aria-label": "Quantize the take",
              onChange: v[8] || (v[8] = (x) => m("quantize", Number(x.target.value)))
            }, [...v[17] || (v[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, p2)
          ]),
          p("label", m2, [
            v[20] || (v[20] = ue(" mode ", -1)),
            p("select", {
              value: n.value.mode,
              "aria-label": "Replace or merge",
              onChange: v[9] || (v[9] = (x) => m("mode", x.target.value))
            }, [...v[19] || (v[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, g2)
          ]),
          p("label", v2, [
            p("input", {
              checked: n.value.mute,
              type: "checkbox",
              onChange: v[10] || (v[10] = (x) => m("mute", x.target.checked))
            }, null, 40, y2),
            v[21] || (v[21] = ue(" mute its old notes ", -1))
          ]),
          v[26] || (v[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            v[23] || (v[23] = ue(" step ", -1)),
            p("select", {
              value: n.value.stepLength,
              "aria-label": "Step length",
              onChange: v[11] || (v[11] = (x) => m("stepLength", Number(x.target.value)))
            }, [...v[22] || (v[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, b2)
          ])
        ], 40, s2)) : U("", !0)
      ])
    ]));
  }
}), w2 = { class: "notation-export" }, x2 = ["disabled", "aria-expanded", "title"], S2 = ["onKeydown"], C2 = { title: "The paper of the PDF and the print" }, M2 = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, A2 = { class: "formats" }, T2 = ["disabled"], $2 = ["disabled"], D2 = ["disabled"], L2 = ["disabled"], B2 = { class: "facts" }, O2 = /* @__PURE__ */ xt({
  __name: "NotationExport",
  props: /* @__PURE__ */ Zt({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {},
    size: { required: !0 },
    sizeModifiers: {}
  }),
  emits: /* @__PURE__ */ Zt(["done", "failed"], ["update:paper", "update:size"]),
  setup(i, { emit: e }) {
    const t = i, n = rt(i, "paper"), s = rt(i, "size"), o = e, r = W(!1), l = W(!1), a = W(null);
    function u() {
      r.value = !1, nn(() => a.value?.focus());
    }
    async function c(d) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((f) => setTimeout(f, 20));
      let h = null;
      try {
        h = Xp(t.abc, t.title, n.value, s.value);
        const { lines: f } = h;
        if (!f.length) throw new Error("the score has no music to draw");
        const m = n.value === "a4" ? "A4" : "Letter";
        if (d === "pdf") {
          const y = await Jp(f, n.value, t.title);
          es(Nr(t.title, "pdf"), y, "application/pdf"), o("done", `exported the notation as PDF (${m})`);
        } else d === "png" ? (es(Nr(t.title, "png"), await Zp(f), "image/png"), o("done", "exported the notation as PNG")) : d === "svg" ? (es(Nr(t.title, "svg"), new TextEncoder().encode(Qp(f)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (em(f, n.value, t.title), o("done", `printing the notation (${m}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (f) {
        o("failed", `The notation could not be exported: ${f instanceof Error ? f.message : String(f)}`);
      } finally {
        h?.dispose(), l.value = !1;
      }
    }
    return (d, h) => (b(), w("span", w2, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !i.abc,
        "aria-expanded": r.value,
        title: i.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (f) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, x2),
      r.value ? (b(), w("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: et(Fe(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", C2, [
          h[8] || (h[8] = ue(" paper ", -1)),
          Le(p("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (f) => n.value = f),
            "aria-label": "Paper"
          }, [...h[7] || (h[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [oi, n.value]
          ])
        ]),
        p("label", M2, [
          h[10] || (h[10] = ue(" size ", -1)),
          Le(p("select", {
            "onUpdate:modelValue": h[2] || (h[2] = (f) => s.value = f),
            "aria-label": "Notation size"
          }, [...h[9] || (h[9] = [
            p("option", { value: "large" }, "large", -1),
            p("option", { value: "standard" }, "standard", -1),
            p("option", { value: "smaller" }, "smaller", -1),
            p("option", { value: "compact" }, "compact", -1)
          ])], 512), [
            [oi, s.value]
          ])
        ]),
        p("span", A2, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[3] || (h[3] = (f) => c("pdf"))
          }, "PDF", 8, T2),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: h[4] || (h[4] = (f) => c("png"))
          }, "PNG", 8, $2),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[5] || (h[5] = (f) => c("svg"))
          }, "SVG", 8, D2),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[6] || (h[6] = (f) => c("print"))
          }, "Print…", 8, L2)
        ]),
        p("span", B2, I(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, S2)) : U("", !0)
    ]));
  }
}), E2 = { class: "sounds-settings" }, I2 = ["aria-expanded"], R2 = ["onKeydown"], P2 = { class: "row" }, N2 = { label: "Built in" }, V2 = ["value", "title"], H2 = {
  key: 0,
  label: "Yours"
}, z2 = ["value"], W2 = ["disabled"], F2 = {
  key: 0,
  class: "facts"
}, K2 = { class: "row" }, _2 = ["onKeydown"], U2 = ["disabled"], G2 = {
  key: 1,
  class: "facts",
  role: "status"
}, j2 = {
  key: 2,
  class: "facts"
}, q2 = { class: "track" }, Y2 = ["value", "aria-label", "onChange"], X2 = ["value", "title"], J2 = ["title", "aria-label", "onClick"], Z2 = /* @__PURE__ */ xt({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ Zt({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Zt(["apply"], ["update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = rt(i, "sounds"), s = e, o = W(!1), r = W(null), l = W([]), a = W(null), u = W(!1), c = W(""), d = W(!1), h = W(""), f = W(null), m = O(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([R]) => R !== "guide" || t.keepsGuide)
    ), y = O(() => l.value.find((R) => R.name === c.value) ?? null);
    async function v() {
      if (o.value = !0, u.value) return;
      const R = await qC(t.fetcher);
      l.value = R.presets, a.value = R.where, u.value = !0;
    }
    function x() {
      o.value = !1, d.value = !1, nn(() => r.value?.focus());
    }
    function S() {
      const R = [...Do, ...l.value].find((Y) => Y.name === c.value);
      R && (s("apply", R.settings, R.name), f.value = `“${R.name}” is set.`);
    }
    async function $() {
      const R = h.value.trim().slice(0, 60);
      if (!R) return;
      if (Do.some((ie) => ie.name.toLowerCase() === R.toLowerCase())) {
        f.value = `“${R}” is a built-in preset - choose another name.`;
        return;
      }
      const Y = YC(l.value, { name: R, builtIn: !1, settings: structuredClone(t.settings) }), H = await Xc(t.fetcher, Y);
      if (H === "failed") {
        f.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = Y, a.value = H, c.value = R, d.value = !1, h.value = "", f.value = H === "comfyui" ? `Saved “${R}” in ComfyUI’s user data.` : `Saved “${R}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function N() {
      const R = y.value;
      if (!R) return;
      const Y = l.value.filter((ie) => ie !== R);
      if (await Xc(t.fetcher, Y) === "failed") {
        f.value = "The preset could not be deleted.";
        return;
      }
      l.value = Y, c.value = "", f.value = `Deleted “${R.name}”.`;
    }
    function P(R, Y) {
      n.value = { ...n.value, [R]: Y };
    }
    function z(R) {
      const Y = n.value[R], H = R === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : R === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [ie, K, T] of H) setTimeout(() => sa(ie, T, Y), K * 1e3);
    }
    return (R, Y) => (b(), w("span", E2, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: Y[0] || (Y[0] = (H) => o.value ? x() : v())
      }, "♫ sounds", 8, I2),
      o.value ? (b(), w("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: et(Fe(x, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: x
        }, "×"),
        Y[6] || (Y[6] = p("strong", null, "Preset", -1)),
        p("span", P2, [
          Le(p("select", {
            "onUpdate:modelValue": Y[1] || (Y[1] = (H) => c.value = H),
            "aria-label": "Preset"
          }, [
            Y[5] || (Y[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", N2, [
              (b(!0), w(de, null, be(B(Do), (H) => (b(), w("option", {
                key: H.name,
                value: H.name,
                title: H.note
              }, I(H.name), 9, V2))), 128))
            ]),
            l.value.length ? (b(), w("optgroup", H2, [
              (b(!0), w(de, null, be(l.value, (H) => (b(), w("option", {
                key: "own-" + H.name,
                value: H.name
              }, I(H.name), 9, z2))), 128))
            ])) : U("", !0)
          ], 512), [
            [oi, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: S
          }, "use", 8, W2),
          y.value ? (b(), w("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: N
          }, "delete")) : U("", !0)
        ]),
        c.value ? (b(), w("span", F2, I([...B(Do), ...l.value].find((H) => H.name === c.value)?.note ?? "Your preset"), 1)) : U("", !0),
        p("span", K2, [
          d.value ? (b(), w(de, { key: 0 }, [
            Le(p("input", {
              "onUpdate:modelValue": Y[2] || (Y[2] = (H) => h.value = H),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                et(Fe($, ["prevent"]), ["enter"]),
                Y[3] || (Y[3] = et(Fe((H) => d.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, _2), [
              [ot, h.value]
            ]),
            p("button", {
              disabled: !h.value.trim(),
              onClick: $
            }, "save", 8, U2)
          ], 64)) : (b(), w("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: Y[4] || (Y[4] = (H) => d.value = !0)
          }, " save current as preset… "))
        ]),
        f.value ? (b(), w("span", G2, I(f.value), 1)) : a.value === "browser" ? (b(), w("span", j2, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : U("", !0),
        Y[7] || (Y[7] = p("strong", null, "Sounds", -1)),
        (b(!0), w(de, null, be(m.value, ([H, ie]) => (b(), w("label", {
          key: H,
          class: "row"
        }, [
          p("span", q2, I(ie), 1),
          p("select", {
            value: n.value[H],
            "aria-label": `Sound of the ${ie} track`,
            onChange: (K) => P(H, K.target.value)
          }, [
            (b(!0), w(de, null, be(B(th), (K) => (b(), w("option", {
              key: K,
              value: K,
              title: B(Ko)[K].hint
            }, I(B(Ko)[K].label), 9, X2))), 128))
          ], 40, Y2),
          p("button", {
            title: `Hear the ${ie} track’s sound`,
            "aria-label": `Hear the ${ie} sound`,
            onClick: Fe((K) => z(H), ["prevent"])
          }, "▶", 8, J2)
        ]))), 128)),
        Y[8] || (Y[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, R2)) : U("", !0)
    ]));
  }
});
function Q2(i) {
  return i.length >= 3 && (i[0] & 240) === 176 && (i[1] === 120 || i[1] === 123);
}
function eM(i, e, t) {
  if (i.length < 3) return null;
  const n = i[0] & 240, s = i[0] & 15, o = i[1] & 127, r = i[2] & 127;
  return n === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : n === 128 || n === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function tM(i, e) {
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
class nM {
  constructor(e = typeof navigator > "u" ? null : navigator) {
    this.navigatorLike = e;
  }
  navigatorLike;
  status = W("off");
  problem = W(null);
  devices = W([]);
  /** The last note's time (``performance.now()`` ms): the activity light. */
  activity = W(0);
  /** ``'all'`` or an input's id (kept while that keyboard is unplugged: then every one is listened to). */
  selected = W("all");
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
    if (Q2(t.data)) {
      this.letGo(e, n);
      return;
    }
    const s = eM(t.data, n, e);
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
    this.status.value = e, this.problem.value = tM(e, t);
  }
}
let Zc = null;
function iM() {
  return Zc ??= new nM(), Zc;
}
const sM = 0.035;
class oM {
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
function rM(i, e) {
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
    const y = u[d + 1];
    if (y) {
      const x = Math.round((y.start - t) / l) * l + t;
      x > f && (m = Math.min(m, x));
    }
    f = Math.max(0, Math.min(f, s - 1)), m = Math.min(m, s);
    const v = c.at(-1);
    if (v && f <= v.onset) {
      m - f > v.duration && (c[c.length - 1] = { onset: v.onset, duration: m - v.onset, pitch: h.pitch });
      continue;
    }
    v && v.onset + v.duration > f && (v.duration = f - v.onset), v && f - (v.onset + v.duration) <= l && (v.duration = f - v.onset), m > f && c.push({ onset: f, duration: m - f, pitch: h.pitch });
  }
  return c;
}
function lM(i, e, t, n, s) {
  return {
    op: "place_notes",
    track: i,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(n), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function ul(i, e) {
  if (!e) return 1;
  const t = Number(i.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const aM = 40;
function uM(i) {
  const e = W(!1), t = W(!1), n = qi(null), s = W(0), o = new pw();
  let r = !1, l = null, a = null;
  const u = W(0), c = O(() => {
    const H = n.value;
    return !H || !e.value ? [] : (u.value, H.played(s.value).filter((ie) => ie.end !== null && ie.end > ie.start).map((ie) => ({ onset: ie.start, duration: ie.end - ie.start, pitch: ie.pitch })));
  });
  function d() {
    l ??= i.hub.subscribe($);
  }
  async function h() {
    const H = await i.hub.enable();
    return i.problem(H ? null : i.hub.problem.value), H && d(), H;
  }
  function f(H) {
    const ie = i.view();
    return ie ? Na(ie, Math.max(0, H)) : null;
  }
  async function m() {
    if (e.value) return;
    if (i.readonly()) {
      i.problem("This score belongs to the other sheet; record in that sheet.");
      return;
    }
    const H = i.view();
    if (!H?.model || !await h()) return;
    t.value = !1;
    const ie = i.settings(), K = i.track(), T = Math.min(i.locator.value, H.model.total - 1), F = i.transport();
    if (!F) return;
    if (n.value = new oM(T, K), r = !1, e.value = !0, s.value = T, !F.record(Pa(H, T), {
      countIn: ie.countIn,
      mute: ie.mute ? K === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, n.value = null, i.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    i.notify(`recording into ${K === "vocal" ? "Vocal" : "Ins"} from bar ${hM(H, T)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function y() {
    i.transport()?.stop();
  }
  function v() {
    e.value && (r = !0, i.transport()?.stop());
  }
  function x(H) {
    if (!e.value || H === null) return;
    const ie = f(H);
    ie !== null && (s.value = ie);
  }
  async function S() {
    if (!e.value) return;
    const H = n.value, ie = i.view();
    e.value = !1, n.value = null, o.allOff();
    const K = ie?.model;
    if (!H || !K) return;
    if (r) {
      i.notify("recording thrown away");
      return;
    }
    const T = Math.max(s.value, H.start), F = K.measures.find((Be) => Be.onset <= H.start && H.start < Be.onset + Be.length) ?? K.measures[0], ge = ie.bars[(F?.n ?? 1) - 1], ve = F && ge?.duration_s ? F.length / ge.duration_s : 8, se = Number(F?.meter.split("/")[0]) || 4, ae = rM(H.finish(T), {
      start: H.start,
      stop: T,
      total: K.total,
      grid: ul(K.unit, i.settings().quantize),
      chordUnits: sM * ve,
      pickup: (F?.length ?? 16) / se / 2
    });
    if (!ae.length) {
      i.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await i.operate(lM(H.track, ae, H.start, T, i.settings().mode));
  }
  function $(H) {
    if (i.settings().thru && (i.sound && (o.sound = i.sound()), H.kind === "on" ? o.on(H.note, H.velocity) : o.off(H.note)), e.value && n.value) {
      const K = i.transport()?.scoreSecondAt(H.time) ?? null, T = i.view();
      if (K === null || !T) return;
      const F = cM(T, n.value.start, K);
      if (F === null) return;
      H.kind === "on" ? n.value.noteOn(H.note, F) : n.value.noteOff(H.note, F), u.value++;
      return;
    }
    t.value && H.kind === "on" && N(H.note);
  }
  function N(H) {
    if (a) {
      a.pitches.push(H);
      return;
    }
    a = { pitches: [H], timer: setTimeout(() => {
      P();
    }, aM) };
  }
  async function P() {
    const H = a?.pitches ?? [];
    a = null;
    const K = i.view()?.model;
    if (!K || !H.length || i.readonly()) return;
    const T = ul(K.unit, i.settings().stepLength), F = i.locator.value;
    if (F >= K.total) {
      i.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await i.operate({
      op: "place_notes",
      track: i.track(),
      notes: [{ onset: F, duration: Math.min(T, K.total - F), pitch: Math.max(...H) }],
      label: "step"
    }) && (i.locator.value = Math.min(K.total, F + T));
  }
  function z() {
    const H = i.view()?.model;
    H && (i.locator.value = Math.min(H.total, i.locator.value + ul(H.unit, i.settings().stepLength)));
  }
  async function R() {
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
  function Y() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: m, stop: y, cancel: v, onTime: x, onStopped: S, toggleStep: R, rest: z, ready: h, dispose: Y };
}
function cM(i, e, t) {
  const n = i.model;
  if (!n) return null;
  const s = Pa(i, e);
  if (t >= s) return Na(i, t);
  const o = n.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? n.measures[0], r = i.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function hM(i, e) {
  let t = 1;
  for (const n of i.model?.measures ?? []) n.onset <= e && (t = n.n);
  return t;
}
const dM = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, fM = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, pM = ["aria-checked"], mM = ["aria-checked"], gM = ["aria-checked"], vM = { title: "The piano roll and chord lane above the notation" }, yM = { title: "Show the ABC text under the notation" }, bM = { title: "Zoom of the notation" }, kM = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, wM = ["disabled", "title"], xM = ["disabled", "title"], SM = ["disabled"], CM = ["disabled", "title"], MM = ["disabled", "title"], AM = ["disabled", "title"], TM = ["accept"], $M = {
  key: 1,
  class: "facts"
}, DM = {
  key: 2,
  class: "facts ok"
}, LM = {
  key: 3,
  class: "facts bad"
}, BM = {
  key: 4,
  class: "badge"
}, OM = {
  key: 1,
  class: "gate",
  role: "status"
}, EM = {
  key: 2,
  class: "gate",
  role: "status"
}, IM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], RM = ["data-layout", "data-text"], PM = { class: "side" }, NM = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, VM = {
  key: 0,
  class: "hint"
}, HM = {
  key: 0,
  class: "hint changed"
}, zM = {
  key: 1,
  class: "hint"
}, WM = {
  key: 2,
  class: "fit-panel"
}, FM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], KM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], _M = {
  class: "status",
  "aria-live": "polite"
}, UM = {
  key: 5,
  class: "error",
  role: "alert"
}, GM = {
  key: 6,
  class: "error",
  role: "alert"
}, jM = {
  key: 7,
  class: "error",
  role: "alert"
}, qM = {
  key: 9,
  class: "diagnostics"
}, YM = ["data-severity"], XM = ["title", "onClick"], JM = {
  key: 1,
  class: "where"
}, Qc = /* @__PURE__ */ xt({
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
    function s(g) {
      return typeof g == "object" && g !== null && !Array.isArray(g);
    }
    const o = qi(null), r = W(null), l = W(null);
    function a(g) {
      const C = g.op === "paste" && g.mode === "insert" && Array.isArray(g.sections) ? g.sections : [], L = typeof g.at == "number" ? g.at : 0, Z = Qn.value;
      return (ce) => {
        let me = -1;
        C.forEach(($e, Ae) => {
          $e.onset <= ce - L && (me = Ae);
        });
        const Ee = me >= 0 ? Z?.sections[me]?.lyrics : null;
        return Ee ? { tag: Ee.tag, lines: [...Ee.lines] } : null;
      };
    }
    const u = Fk(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => n("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => Bt(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (g) => {
        s(g) && (Array.isArray(g.guide) && t.guide !== void 0 && !Ms(g.guide, t.guide) && n("guideChange", [...g.guide]), "lyrics" in g && (o.value = g.lyrics ?? null), "looseLyrics" in g && (r.value = g.looseLyrics ?? null), Array.isArray(g.spans) && Ft(g.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (g, C) => {
        const L = {}, Z = {}, ce = t.guide;
        if (ce?.length && g.time_map?.length) {
          const Xe = dm(ce, g.time_map);
          Ms(Xe, ce) || (n("guideChange", Xe), L.guide = [...ce], Z.guide = Xe);
        }
        const me = Bt(), Ee = o.value, $e = se.value?.model, Ae = g.analysis.model;
        let st = me.length && g.time_map?.length ? rm(me, g.time_map) : me;
        if (st.length && Ee && $e && Ae) {
          const Xe = (zi) => zi.sections.flatMap((gs, Ir) => gs.implicit ? [] : [Ir]), vi = Ae.sections.map((zi) => Ae.measures[zi.first_bar - 1]?.onset ?? 0);
          st = lm(st, Rf($e, Ae, g.time_map), Xe($e), Xe(Ae), vi);
        }
        if (Oo(st, me) || (Ft(st), L.spans = [...me], Z.spans = st), Ee && $e && Ae) {
          const Xe = LC(Ee, $e, Ae, g.time_map, a(C));
          o.value = Xe, L.lyrics = Ee, Z.lyrics = Xe;
        }
        return Object.keys(Z).length ? { before: L, after: Z } : void 0;
      }
    });
    Ie(
      () => [t.doc.text, u.commitBlock],
      ([g, C]) => {
        t.readonly || n("gate", g, C);
      },
      { immediate: !0 }
    );
    const c = W(Ap()), d = W(g1(t.layoutDefault, c.value.layout));
    function h(g) {
      d.value = g, c.value = { ...c.value, layout: g };
    }
    const f = W([]), m = W(0), y = W(null), v = W(null), x = W(null), S = W(null), $ = W(null), N = W("vocal"), P = O({
      get: () => c.value.sounds,
      set: (g) => c.value = { ...c.value, sounds: g }
    }), z = O(() => KC(c.value));
    function R(g, C) {
      c.value = Yc(c.value, g), u.notes = [`${C}: ${Y(g)}`];
    }
    function Y(g) {
      const C = [];
      return g.sounds && C.push("sounds"), g.metronome !== void 0 && C.push(`metronome ${g.metronome ? "on" : "off"}`), g.hear && C.push(`hear ${g.hear}`), (g.wave !== void 0 || g.sung !== void 0) && C.push("the source view"), g.record && C.push("recording"), g.paper && C.push(`paper ${g.paper === "a4" ? "A4" : "Letter"}`), g.notationSize && C.push(`notation ${g.notationSize}`), C.length ? `${C.join(", ")} set` : "nothing to set";
    }
    const H = O(() => c.value.sounds[N.value === "vocal" ? "Vocal" : "Ins"]);
    Ie(c, (g) => Vp(g), { deep: !0 });
    const ie = iM();
    ie.selected.value = c.value.midiInput, Ie(ie.selected, (g) => c.value = { ...c.value, midiInput: g });
    const K = O({
      get: () => c.value.record,
      set: (g) => c.value = { ...c.value, record: g }
    }), T = uM({
      hub: ie,
      transport: () => x.value,
      view: () => se.value,
      locator: m,
      track: () => N.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: Gn,
      notify: (g) => u.notes = [g],
      problem: (g) => F.value = g,
      sound: () => H.value
    }), F = W(null), ge = O(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : ee.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function ve(g) {
      const C = g.target;
      $.value?.contains(C) || Er(C) || g.ctrlKey || g.metaKey || g.altKey || g.key !== " " && g.key !== "Escape" || (g.preventDefault(), g.stopPropagation(), g.key === " " ? T.stop() : T.cancel());
    }
    Ie(T.recording, (g) => {
      g ? window.addEventListener("keydown", ve, !0) : window.removeEventListener("keydown", ve, !0);
    }), _n(() => {
      window.removeEventListener("keydown", ve, !0), T.cancel(), T.dispose();
    }), _n(() => u.dispose());
    const se = O(() => u.lastValid), ae = O(() => !!u.view && !u.view.ok), Be = O(() => u.view?.diagnostics ?? []), xe = O(
      () => Be.value.filter((g) => g.severity === "error" && g.bar).map((g) => g.bar)
    ), De = O(
      () => Bf(se.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Me = O(() => d.value !== "text"), J = O(() => d.value === "daw"), Ye = O(() => t.guide ?? []), he = O(() => hm(t.guide, se.value?.model)), Se = O(() => J.value ? c.value.voices.guide ?? !0 : !1), ne = O(() => Se.value ? he.value : []), q = O(() => Me.value && c.value.roll && !!(se.value?.model || se.value?.model_error)), ee = O(() => se.value?.model ?? null), He = O(() => ee.value ? Vs(ee.value, m.value) : De.value), Ze = O(() => se.value && ee.value ? Pa(se.value, m.value) : null), Ke = O(() => ee.value ? Ef(ee.value, m.value) : "");
    Ie(
      () => ee.value?.total,
      (g) => {
        g !== void 0 && m.value > g && (m.value = g);
      }
    );
    let vt = null, te = null, G = !1;
    Ie(
      () => [t.lyricsTarget, t.lyrics, ee.value],
      ([g, C, L]) => {
        if (!g || !C?.trim()) {
          o.value = null, r.value = null, vt = null, G = !1;
          return;
        }
        const Z = C === vt || C === te;
        if (vt = C, Z && (G || !L)) {
          if (o.value && L && o.value.blocks.length !== L.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && L) {
            const me = $o(r.value, L);
            me && (o.value = me, r.value = null);
          }
          return;
        }
        const ce = !G && t.lyricsPending || C;
        o.value = L ? $o(ce, L) : null, r.value = o.value ? null : ce, G = !!L;
      },
      { immediate: !0 }
    ), Ie(
      [o, r, ee],
      () => {
        const g = o.value, C = ee.value;
        g ? C && g.blocks.length === C.sections.length && (l.value = DC(g, C)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Ie(
      l,
      (g, C) => {
        te = g, n("lyricsChange", g), C !== void 0 && g !== C && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const fe = O(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), ke = O(
      () => !!l.value && !t.lyricsTarget?.own && jt(l.value) !== jt(t.lyrics ?? "")
    ), we = O(() => l.value ? Js(l.value).blocks.map((g) => g.tag).join(" · ") : ""), yt = O(() => l.value ?? t.lyrics ?? null);
    function ct() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...Bt()] };
    }
    const Lt = qi(null);
    function Bt() {
      return Lt.value ?? t.lyricSpans ?? [];
    }
    function Ft(g) {
      Oo(g, Bt()) || (Lt.value = g, n("lyricSpansChange", g), u.refreshLyrics());
    }
    Ie(
      () => t.lyricSpans,
      (g) => {
        g && Lt.value && Oo(g, Lt.value) || (Lt.value = null, u.refreshLyrics());
      }
    );
    const Ct = W([]);
    Ie(
      () => u.selection,
      (g) => {
        g.length && (Ct.value = []);
      }
    );
    function ms(g) {
      const C = se.value?.lyrics;
      return !!C && !!tm(C, g)?.lines.some((L) => L.pinned);
    }
    function Ln(g) {
      const C = ee.value;
      if (!C) return -1;
      let L = -1;
      return C.sections.findIndex((Z) => !Z.implicit && ++L === g);
    }
    function di(g) {
      if (o.value) {
        const L = Ln(g);
        return L < 0 ? null : [...o.value.blocks[L]?.lines ?? []];
      }
      if (r.value === null) return null;
      const C = Js(r.value).blocks[g];
      return C ? [...C.lines] : null;
    }
    function Bn() {
      return Math.max(1, Math.round(ee.value?.grid.units_per_quarter ?? 1));
    }
    function fn(g, C, L) {
      const Z = ee.value, ce = se.value?.lyrics;
      if (!Z || !ce || !fe.value) return [];
      const me = ct(), Ee = [], $e = /* @__PURE__ */ new Map();
      for (const Ae of [...new Set(g)].sort((st, Xe) => st - Xe)) {
        const st = di(Ae);
        if (st === null) continue;
        const Xe = so(ce, Ae, Z.total), vi = nm(C(Ae, iu(ce, Ae, st, Xe, Bn())), Xe), zi = vi.map((gs) => gs.text);
        if (o.value) o.value = IC(o.value, Z, Ln(Ae), zi);
        else if (r.value !== null) r.value = EC(r.value, Ae, zi);
        else continue;
        vi.forEach((gs, Ir) => {
          gs.id.startsWith("*") && Ee.push(_o(Ae, Ir));
        }), $e.set(Ae, vi);
      }
      return $e.size ? (Ft(im(Bt(), ce, $e)), u.recordSide(L, me, ct()), Ee) : [];
    }
    function Kt(g) {
      const C = /* @__PURE__ */ new Map();
      for (const L of g) {
        const Z = sm(L);
        Z && (C.has(Z.block) || C.set(Z.block, /* @__PURE__ */ new Set()), C.get(Z.block)?.add(Z.line));
      }
      return C;
    }
    function pn(g) {
      const C = new Map(g.map((Z) => [Z.key, Z])), L = g.length;
      Ct.value = fn(
        [...Kt(g.map((Z) => Z.key)).keys()],
        (Z, ce) => ce.map((me, Ee) => {
          const $e = C.get(_o(Z, Ee));
          return $e ? { ...me, id: `*${me.id}`, start: $e.start, end: $e.end } : me;
        }),
        `lyrics: ${L === 1 ? "line" : `${L} lines`} placed`
      );
    }
    function Ii(g) {
      const C = Kt(g);
      C.size && (fn(
        [...C.keys()],
        (L, Z) => Z.filter((ce, me) => !C.get(L)?.has(me)),
        `lyrics: ${g.length === 1 ? "line" : `${g.length} lines`} deleted`
      ), Ct.value = []);
    }
    function Vt() {
      const g = ee.value, C = se.value?.lyrics;
      if (!g || !C) return [];
      const L = [];
      for (const [Z, ce] of Kt(Ct.value)) {
        const me = di(Z);
        me && iu(C, Z, me, so(C, Z, g.total), Bn()).forEach((Ee, $e) => {
          ce.has($e) && L.push(Ee);
        });
      }
      return L;
    }
    function mn() {
      const g = ee.value ? zx(ee.value.unit, su(Vt())) : null;
      return g ? (Qn.value = g, u.error = null, u.notes = [`copied ${g.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function en(g, C, L) {
      const Z = ee.value, ce = se.value?.lyrics;
      if (!Z || !ce) return;
      const me = om(ce, C);
      if (!me || di(me.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, Ee] = so(ce, me.block, Z.total), $e = g.filter((Ae) => C + Ae.offset < Ee);
      $e.length && (Ct.value = fn(
        [me.block],
        (Ae, st) => [
          ...st,
          ...$e.map((Xe, vi) => ({
            id: `*new${vi}`,
            text: Xe.text,
            start: C + Xe.offset,
            end: Math.min(C + Xe.offset + Xe.length, Ee)
          }))
        ],
        L
      ), u.error = null, $e.length < g.length && (u.notes = [`${g.length - $e.length} line(s) did not fit before the next block's first line`]));
    }
    function fi(g) {
      const C = Qn.value;
      if ((g === "paste" || g === "insert") && C?.lyricLines?.length)
        return fe.value ? ee.value && C.unit !== ee.value.unit ? (u.error = `The lines were copied with L:${C.unit} and do not fit this score's L:${ee.value.unit}.`, !0) : (en(C.lyricLines, m.value, `lyrics: ${C.label} pasted`), !0) : !0;
      if (!Ct.value.length) return !1;
      if (g === "copy") mn();
      else if (g === "cut")
        mn() && Ii(Ct.value);
      else if (g === "duplicate") {
        const L = Vt();
        if (L.length) {
          const Z = Math.max(...L.map((ce) => ce.end));
          en(su(L), Z, `lyrics: ${L.length === 1 ? "line" : `${L.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function gn(g) {
      const C = ee.value, L = se.value?.lyrics;
      if (C && L && ms(g.block)) {
        const ce = Bn();
        fn(
          [g.block],
          (me, Ee) => {
            if (g.line < Ee.length)
              return g.text ? Ee.map((Ae, st) => st === g.line ? { ...Ae, text: g.text } : Ae) : Ee.filter((Ae, st) => st !== g.line);
            const $e = g.at ?? Ee[Ee.length - 1]?.end ?? so(L, g.block, C.total)[0];
            return g.text ? [...Ee, { id: "*typed", text: g.text, start: $e, end: $e + ce }] : Ee;
          },
          `lyrics: ${g.text || "line removed"}`
        );
        return;
      }
      const Z = ct();
      if (o.value && C) o.value = OC(o.value, C, Ln(g.block), g.line, g.text);
      else if (r.value !== null) r.value = BC(r.value, g.block, g.line, g.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${g.text || "line removed"}`, Z, ct());
    }
    function Ri() {
      const g = t.lyrics, C = ee.value;
      if (!g) return;
      const L = ct();
      o.value = C ? $o(g, C) : null, r.value = o.value ? null : g, t.readonly || u.recordSide("lyrics reverted", L, ct());
    }
    Ie(ee, (g) => {
      if (!Br || !g || r.value === null) return;
      Br = !1;
      const C = $o(r.value, g);
      C && (o.value = C, r.value = null);
    }), Ie(De, (g) => {
      !q.value && g && ee.value && (m.value = Pc(ee.value, g));
    });
    const lt = O({
      get: () => c.value.metronome,
      set: (g) => c.value = { ...c.value, metronome: g }
    }), On = O(() => t.payload?.reference_audio ? Ep(t.fetcher, t.payload.reference_audio) : null), Ht = qi(null), En = W(null);
    Ie(
      On,
      (g) => {
        Ht.value = null, En.value = null, g && bw(g).then(
          (C) => {
            On.value === g && (Ht.value = C);
          },
          (C) => {
            On.value === g && (En.value = `the source recording could not be read: ${C instanceof Error ? C.message : String(C)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const vn = O({
      get: () => c.value.hear,
      set: (g) => c.value = { ...c.value, hear: g }
    }), _t = O({
      get: () => c.value.sourceLevel,
      set: (g) => c.value = { ...c.value, sourceLevel: g }
    }), In = O(() => {
      const g = se.value, C = g?.model;
      if (!g || !C) return null;
      const L = Oe(), Z = [...L.notes.map((Ae) => [Ae.onset, Ae.onset + Ae.duration]), ...L.chords.map((Ae) => [Ae.onset, Ae.onset + 1])];
      if (!Z.length) return null;
      const ce = Vs(C, Math.min(...Z.map(([Ae]) => Ae))), me = Vs(C, Math.max(...Z.map(([, Ae]) => Ae)) - 1), Ee = g.bars[ce - 1], $e = g.bars[me - 1];
      return !Ee || !$e ? null : { from: Ee.start_s, to: $e.start_s + $e.duration_s, label: ce === me ? `bar ${ce}` : `bars ${ce}-${me}` };
    }), Mt = O(() => {
      const g = WC(se.value?.model, t.payload?.timeline), C = t.sourceShift ?? 0;
      return !g || !C ? g : g.map((L) => L ? [L[0] - C, L[1] - C, L[2]] : null);
    }), Pi = O(() => {
      const g = Mt.value?.[(He.value ?? 1) - 1] ?? Mt.value?.find((L) => L);
      if (!g) return 0.5;
      const C = Number(g[2].split("/")[0]) || 4;
      return (g[1] - g[0]) / C;
    }), Ni = O(() => {
      const g = t.payload?.sung_pitch;
      if (!g) return null;
      const C = xw(g), L = ee.value;
      return !C || !L ? { problem: "problem" in g ? g.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: C, offset: Mw(L, Mt.value, C), bars: Mt.value };
    }), Rn = O({
      get: () => t.sourceShift ?? 0,
      set: (g) => n("sourceShiftChange", Math.round(g * 1e3) / 1e3)
    }), ht = O(() => Mt.value?.map((g) => g?.[0] ?? null) ?? null), Ot = O(() => se.value?.header?.unit ?? "1/16"), Ut = O({
      get: () => c.value.voices,
      set: (g) => c.value = { ...c.value, voices: g }
    }), pi = O({
      get: () => c.value.speed,
      set: (g) => c.value = { ...c.value, speed: g }
    });
    function At(g, C = !1, L = "notation") {
      const Z = C ? u.selection.includes(g) ? u.selection.filter((me) => me !== g) : [...u.selection, g] : [g];
      u.select(Z);
      const ce = Mi(se.value, Z[0]);
      v.value = L !== "text" && ce ? [ce.source[0], ce.source[1]] : v.value;
    }
    function mi(g) {
      if (!se.value || ae.value) return;
      const C = Am(se.value, g);
      C && At(C.id, !1, "text");
    }
    function Et(g) {
      if (!se.value) return;
      se.value.model && (m.value = Pc(se.value.model, g));
      const C = Dm(se.value, g);
      C && At(C.id, !1, "keys");
    }
    function Gt() {
      return T.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function dt(g) {
      t.readonly || Gt() || await u.operate(g);
    }
    function Gn(g) {
      return t.readonly || Gt() ? Promise.resolve(!1) : u.operate(g);
    }
    function gi() {
      Gt() || u.undo();
    }
    function Vi() {
      Gt() || u.redo();
    }
    function jn(g) {
      u.select(g);
      const C = Mi(se.value, g[0]);
      C && (v.value = [C.source[0], C.source[1]]);
    }
    function Oe() {
      const g = ee.value;
      if (!g) return { notes: [], chords: [] };
      const C = ds(se.value, u.selection), L = Xs(u.selection);
      return {
        notes: [...g.tracks.vocal, ...g.tracks.ins].filter((Z) => C.has(Z.id)),
        chords: g.tracks.chords.filter((Z) => L.has(Z.id))
      };
    }
    function k() {
      const g = ee.value, C = Oe(), L = g ? Uc(g, C.notes, C.chords) : null;
      return L ? (Qn.value = L, u.error = null, u.notes = [`copied ${L.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function A(g) {
      if (fi(g)) return;
      const C = ee.value;
      if (g === "copy") {
        k();
        return;
      }
      if (t.readonly || !C) return;
      if (g === "cut") {
        const ce = Oe();
        if (!k()) return;
        await dt({ op: "delete", ids: [...ce.notes.map((me) => me.id), ...ce.chords.map((me) => me.id)] });
        return;
      }
      if (g === "duplicate") {
        const ce = Oe(), me = Uc(C, ce.notes, ce.chords);
        if (!me) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Ee = Math.min(...ce.notes.map((Ae) => Ae.onset), ...ce.chords.map((Ae) => Ae.onset)), $e = jc(me, C, Ee + me.span, "overwrite");
        typeof $e == "string" ? u.error = "There is no room after the selection to duplicate it." : await dt($e);
        return;
      }
      const L = Qn.value;
      if (!L) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const Z = jc(L, C, m.value, g === "insert" ? "insert" : "overwrite");
      typeof Z == "string" ? u.error = Z : await dt(Z);
    }
    function M(g) {
      if (g.altKey) return null;
      switch (g.key.toLowerCase()) {
        case "c":
          return "copy";
        case "x":
          return "cut";
        case "v":
          return g.shiftKey ? "insert" : "paste";
        case "d":
          return "duplicate";
        default:
          return null;
      }
    }
    function X(g) {
      y.value = g === null || !se.value ? null : Na(se.value, g), T.onTime(g);
    }
    function _() {
      t.readonly || !t.guide?.length || n("guideChange", []);
    }
    const oe = O({
      get: () => c.value.rollZoom,
      set: (g) => c.value = { ...c.value, rollZoom: g }
    }), D = O(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function V(g) {
      g.preventDefault();
      const C = c.value.rollHeight;
      Bo(g, ({ dy: L }) => c.value = { ...c.value, rollHeight: qa(C, L) });
    }
    function E(g) {
      const C = g.key === "ArrowUp" ? -16 : g.key === "ArrowDown" ? 16 : 0;
      C && (g.preventDefault(), c.value = { ...c.value, rollHeight: qa(c.value.rollHeight, C) });
    }
    function j(g) {
      g.preventDefault();
      const C = c.value.notationShare, Z = g.currentTarget.parentElement?.clientHeight ?? 0;
      Bo(g, ({ dy: ce }) => c.value = { ...c.value, notationShare: Hp(C, ce, Z) });
    }
    function Ce(g) {
      const C = g.key === "ArrowDown" ? 0.03 : g.key === "ArrowUp" ? -0.03 : 0;
      C && (g.preventDefault(), c.value = { ...c.value, notationShare: Ip(c.value.notationShare + C) });
    }
    function at(g) {
      g.preventDefault();
      const C = c.value.sideWidth;
      Bo(g, ({ dx: L }) => c.value = { ...c.value, sideWidth: Ya(C, L) });
    }
    function ft(g) {
      const C = g.key === "ArrowLeft" ? -16 : g.key === "ArrowRight" ? 16 : 0;
      C && (g.preventDefault(), c.value = { ...c.value, sideWidth: Ya(c.value.sideWidth, C) });
    }
    const qn = W(null), Pn = W(null), Qe = W(null), tn = W(!1), Lr = O(() => t.guide !== void 0), za = O(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && se.value?.display_abc ? null : "There is no score to export yet."), Wa = O({
      get: () => c.value.paper,
      set: (g) => c.value = { ...c.value, paper: g }
    }), Fa = O({
      get: () => c.value.notationSize,
      set: (g) => c.value = { ...c.value, notationSize: g }
    });
    function Ff(g) {
      Qe.value = null, u.notes = [g];
    }
    const Hi = O(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Kf() {
      const g = Hi.value;
      if (g) {
        Qe.value = g;
        return;
      }
      tn.value = !0, Qe.value = null;
      try {
        const C = await Rp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        es(C.filename, Nk(C.data));
      } catch (C) {
        Qe.value = Ci(C);
      } finally {
        tn.value = !1;
      }
    }
    async function _f() {
      const g = Hi.value;
      if (g) {
        Qe.value = g;
        return;
      }
      tn.value = !0, Qe.value = null;
      try {
        const C = await Pp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: Bt()
        });
        es(C.filename, new TextEncoder().encode(C.data), C.type);
      } catch (C) {
        Qe.value = Ci(C);
      } finally {
        tn.value = !1;
      }
    }
    const Ka = W(null);
    function Uf() {
      const g = Jc({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: Bt(),
        settings: z.value
      });
      es(XC(t.title), new TextEncoder().encode(`${JSON.stringify(g, null, 1)}
`), "application/json"), Qe.value = null, u.notes = [`saved the project: score${g.guide.length ? `, ${_a(g.guide.length)}` : ""}${g.lyrics ? ", lyrics" : ""}, settings`];
    }
    function Gf() {
      Qe.value = null, Ka.value?.click();
    }
    async function jf(g) {
      const C = g.target, L = C.files?.[0];
      if (C.value = "", !L) return;
      const Z = JC(await L.text());
      typeof Z == "string" ? Qe.value = Z : Ua(Z, L.name);
    }
    const _a = (g) => g === 1 ? "1 Guide note" : `${g} Guide notes`;
    let Br = !1;
    function Ua(g, C) {
      if (Gt()) return;
      if (t.readonly) {
        Qe.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const L = ["score"], Z = [], ce = ct(), me = {}, Ee = t.guide;
      Ee !== void 0 ? (ce.guide = [...Ee], me.guide = [...g.guide], g.guide.length && L.push(_a(g.guide.length))) : g.guide.length && Z.push("the Guide notes (only the DAW sheet keeps a Guide track)"), g.lyrics && fe.value ? (o.value = null, r.value = g.lyrics, Br = !0, L.push("lyrics"), Ft(g.lyric_spans)) : g.lyrics && Z.push("the lyrics (this sheet cannot change them here)"), Object.assign(me, ct()), Object.keys(g.settings).length && (c.value = Yc(c.value, g.settings), L.push("settings"));
      const $e = `open project (${C})`;
      u.replaceText(g.score, $e, null, { before: ce, after: me }) || u.recordSide($e, ce, me), me.guide && Ee !== void 0 && !Ms(me.guide, Ee) && n("guideChange", me.guide), Qe.value = null, u.notes = [
        `opened ${C}: ${L.join(", ")}${g.title ? ` ("${g.title}")` : ""}`,
        ...Z.map((Ae) => `not opened: ${Ae}`)
      ];
    }
    const Ga = W(null);
    function qf() {
      Qe.value = null, Ga.value?.click();
    }
    async function Yf(g) {
      const C = g.target, L = C.files?.[0];
      if (C.value = "", !(!L || t.readonly || Gt())) {
        tn.value = !0, Qe.value = null;
        try {
          const Z = await Np(t.fetcher, {
            text: await L.text(),
            abc: t.doc.text,
            lyrics: l.value ?? t.lyrics ?? null
          }), ce = Z.lyrics ?? l.value ?? t.lyrics ?? null, me = Jc({
            title: t.title,
            score: Z.abc,
            guide: t.guide ?? [],
            lyrics: ce,
            lyricSpans: oa(Z.lyric_spans)
          });
          Z.lyrics === null && (me.lyric_spans = []), Ua(me, L.name), u.notes = [`imported ${L.name}`, ...Z.report];
        } catch (Z) {
          Qe.value = Ci(Z);
        } finally {
          tn.value = !1;
        }
      }
    }
    function Xf() {
      Qe.value = null, qn.value?.click();
    }
    async function Jf(g) {
      const C = g.target, L = C.files?.[0];
      if (C.value = "", !!L)
        try {
          Pn.value = { data: Pk(new Uint8Array(await L.arrayBuffer())), filename: L.name };
        } catch (Z) {
          Qe.value = Ci(Z);
        }
    }
    function Zf(g, C) {
      if (t.readonly || Gt()) return;
      const L = Pn.value?.filename ?? "file", Z = t.guide, ce = Z === void 0 ? void 0 : C ? [...g.guide] : [], me = Z === void 0 || ce === void 0 ? void 0 : { before: { guide: [...Z] }, after: { guide: ce } };
      u.replaceText(g.abc, `import MIDI (${L})`, g.analysis, me), ce !== void 0 && Z !== void 0 && !Ms(ce, Z) && n("guideChange", ce), Pn.value = null, Qe.value = null;
    }
    function Or(g) {
      const C = g;
      return C ? !!C.closest("input, textarea, select, .cm-editor") : !1;
    }
    const Qf = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Er(g) {
      const C = g;
      if (!C) return !1;
      if (C.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const L = C.closest("input");
      return !!L && !Qf.has(L.type);
    }
    function ep(g) {
      g.key === " " && !Er(g.target) && g.preventDefault();
    }
    function tp(g) {
      const C = g.ctrlKey || g.metaKey;
      if (C && !t.readonly && (g.key === "z" || g.key === "Z" || g.key === "y")) {
        if (Or(g.target) && !g.target.closest(".cm-editor")) return;
        g.preventDefault(), g.key === "y" || g.key.toLowerCase() === "z" && g.shiftKey ? Vi() : gi();
        return;
      }
      const L = C && !Or(g.target) ? M(g) : null;
      if (L) {
        g.preventDefault(), g.stopPropagation(), A(L);
        return;
      }
      if (g.key === " " && !C && !Er(g.target)) {
        g.preventDefault(), x.value?.toggle();
        return;
      }
      if (Or(g.target) || C) return;
      if (g.key === "Escape" && T.recording.value) {
        g.preventDefault(), T.cancel();
        return;
      }
      if (g.key === "R" && g.shiftKey && !g.altKey) {
        g.preventDefault(), T.recording.value ? T.stop() : T.start();
        return;
      }
      if (g.key === "Escape") {
        g.preventDefault(), u.selection.length && u.select([]), Ct.value = [];
        return;
      }
      const Z = se.value, ce = u.primary, me = g.key.toLowerCase();
      if ((me === "g" || me === "h") && !g.altKey && S.value) {
        g.preventDefault(), g.shiftKey ? S.value.zoomRows(me === "h" ? 2 : -2) : S.value.zoomBy(me === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((g.key === "Home" || g.key === "End") && ee.value) {
        g.preventDefault(), m.value = g.key === "Home" ? 0 : ee.value.total;
        return;
      }
      if (!Z || !ce) return;
      (() => {
        switch (g.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const $e = Tm(Z, ce.id, g.key === "ArrowRight" ? 1 : -1);
            return $e && At($e.id, g.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (g.altKey) {
              const Xe = $m(Z, ce.id);
              return Xe && At(Xe.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const $e = u.selection.filter((Xe) => Mi(Z, Xe)?.kind === "note"), Ae = [...Xs(u.selection)], st = (g.shiftKey ? 12 : 1) * (g.key === "ArrowUp" ? 1 : -1);
            return Ae.length ? dt({ op: "set_note_pitch", ids: [...ds(Z, u.selection), ...Ae], semitones: st }) : $e.length && dt({ op: "shift_pitch", ids: $e, semitones: st }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || ce.kind !== "note") return !1;
            const $e = hl(ce.units, g.key === "]" ? 1 : -1);
            return $e && dt({ op: "set_duration", id: ce.id, units: $e }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (ce.kind === "note" && dt({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (ce.kind !== "note" && dt({ op: "rest_to_note", id: ce.id }), !0);
          default:
            return !1;
        }
      })() && (g.preventDefault(), g.stopPropagation());
    }
    return (g, C) => (b(), w("div", {
      ref_key: "tabRoot",
      ref: $,
      class: "score-tab",
      onKeydown: tp,
      onKeyup: ep
    }, [
      i.readonly ? U("", !0) : (b(), Vn(US, {
        key: 0,
        view: se.value,
        selection: B(u).selection,
        primary: B(u).primary,
        busy: B(u).busy,
        "can-undo": B(u).canUndo,
        "can-redo": B(u).canRedo,
        "undo-label": B(u).undoLabel,
        "redo-label": B(u).redoLabel,
        onOperate: dt,
        onUndo: gi,
        onRedo: Vi
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", dM, [
        p("span", fM, [
          p("button", {
            role: "radio",
            "aria-checked": d.value === "review",
            class: Ne({ active: d.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: C[0] || (C[0] = (L) => h("review"))
          }, " Review ", 10, pM),
          p("button", {
            role: "radio",
            "aria-checked": J.value,
            class: Ne({ active: J.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: C[1] || (C[1] = (L) => h("daw"))
          }, " DAW ", 10, mM),
          p("button", {
            role: "radio",
            "aria-checked": d.value === "text",
            class: Ne({ active: d.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: C[2] || (C[2] = (L) => h("text"))
          }, " Text ", 10, gM)
        ]),
        Me.value ? (b(), w(de, { key: 0 }, [
          p("label", vM, [
            Le(p("input", {
              "onUpdate:modelValue": C[3] || (C[3] = (L) => c.value.roll = L),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [It, c.value.roll]
            ]),
            C[35] || (C[35] = ue(" piano roll ", -1))
          ]),
          p("label", yM, [
            Le(p("input", {
              "onUpdate:modelValue": C[4] || (C[4] = (L) => c.value.advanced = L),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [It, c.value.advanced]
            ]),
            C[36] || (C[36] = ue(" ABC text (advanced) ", -1))
          ])
        ], 64)) : U("", !0),
        p("label", bM, [
          C[37] || (C[37] = ue(" zoom ", -1)),
          Le(p("input", {
            "onUpdate:modelValue": C[5] || (C[5] = (L) => c.value.zoom = L),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              ot,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        Nn(Bk),
        p("span", kM, [
          p("button", {
            disabled: tn.value || !!Hi.value,
            title: Hi.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Kf
          }, " Export MIDI ", 8, wM),
          p("button", {
            disabled: tn.value || !!Hi.value,
            title: Hi.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: _f
          }, " Export MusicXML ", 8, xM),
          Nn(O2, {
            paper: Wa.value,
            "onUpdate:paper": C[6] || (C[6] = (L) => Wa.value = L),
            size: Fa.value,
            "onUpdate:size": C[7] || (C[7] = (L) => Fa.value = L),
            abc: za.value ? null : se.value?.display_abc ?? null,
            title: i.title ?? "",
            blocked: za.value,
            onDone: Ff,
            onFailed: C[8] || (C[8] = (L) => Qe.value = L)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !i.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: Uf
          }, " Save project ", 8, SM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: Xf
          }, " Import MIDI… ", 8, CM),
          p("button", {
            disabled: i.readonly || tn.value,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MusicXML file that Export MusicXML wrote - also after a script changed it: its score, lyrics and where they are sung replace these (one undo step). Other MusicXML is refused; use Import MIDI for it.",
            onClick: qf
          }, " Import MusicXML… ", 8, MM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: Gf
          }, " Open project… ", 8, AM),
          p("input", {
            ref_key: "musicXmlFile",
            ref: Ga,
            class: "hidden-file",
            type: "file",
            accept: ".musicxml,.xml,application/vnd.recordare.musicxml+xml,application/xml,text/xml",
            "aria-label": "MusicXML file",
            onChange: Yf
          }, null, 544),
          p("input", {
            ref_key: "midiFile",
            ref: qn,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Jf
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: Ka,
            class: "hidden-file",
            type: "file",
            accept: `${B(Wf)},.json,application/json`,
            "aria-label": "Project file",
            onChange: jf
          }, null, 40, TM)
        ]),
        B(u).pending ? (b(), w("span", $M, "checking…")) : B(u).view?.ok ? (b(), w("span", DM, "✓ valid")) : ae.value ? (b(), w("span", LM, "✖ " + I(Be.value.length) + " error(s)", 1)) : U("", !0),
        i.readonly ? (b(), w("span", BM, "read-only: owned by the other sheet")) : U("", !0)
      ]),
      ae.value && !i.readonly ? (b(), w("p", OM, [
        C[38] || (C[38] = ue(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        B(u).canRevert ? (b(), w("button", {
          key: 0,
          onClick: C[9] || (C[9] = (L) => B(u).revertToLastValid())
        }, "Revert to last valid")) : U("", !0),
        Me.value && !c.value.advanced ? (b(), w("button", {
          key: 1,
          onClick: C[10] || (C[10] = (L) => c.value.advanced = !0)
        }, "Show the ABC text")) : U("", !0)
      ])) : B(u).view?.ok && B(u).view.model_error && !i.readonly ? (b(), w("p", EM, " This score is valid for YuE2 but outside the editor's supported subset (" + I(B(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : U("", !0),
      q.value ? (b(), Vn(Rx, {
        key: 3,
        ref_key: "pianoRoll",
        ref: S,
        zoom: oe.value,
        "onUpdate:zoom": C[11] || (C[11] = (L) => oe.value = L),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": C[12] || (C[12] = (L) => c.value.rowHeight = L),
        follow: c.value.follow,
        "onUpdate:follow": C[13] || (C[13] = (L) => c.value.follow = L),
        track: N.value,
        "onUpdate:track": C[14] || (C[14] = (L) => N.value = L),
        recorded: B(T).recording.value ? { track: N.value, notes: B(T).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": C[15] || (C[15] = (L) => c.value.sung = L),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": C[16] || (C[16] = (L) => c.value.wave = L),
        sound: H.value,
        sung: Ni.value,
        height: c.value.rollHeight,
        view: se.value,
        selection: B(u).selection,
        playing: f.value,
        operate: Gn,
        readonly: i.readonly,
        stale: ae.value,
        busy: B(u).busy,
        locator: ee.value ? m.value : null,
        playhead: y.value,
        clip: B(Qn)?.label ?? null,
        lyrics: se.value?.lyrics ?? null,
        "lyrics-editable": fe.value,
        source: Ht.value ? { envelope: Ht.value.envelope, bars: Mt.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": C[17] || (C[17] = (L) => c.value.audition = L),
        "resize-mode": "rests",
        onSelect: jn,
        onLocate: C[18] || (C[18] = (L) => m.value = L),
        onClipboard: A,
        "lyric-selection": Ct.value,
        "onUpdate:lyricSelection": C[19] || (C[19] = (L) => Ct.value = L),
        onLyricEdit: gn,
        onLyricPlace: pn,
        onLyricDelete: Ii
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : U("", !0),
      q.value && se.value?.model ? (b(), w("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": B($p),
        "aria-valuemax": B(Tp),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: V,
        onKeydown: E
      }, null, 40, IM)) : U("", !0),
      Nn(pC, {
        ref_key: "transport",
        ref: x,
        voices: Ut.value,
        "onUpdate:voices": C[22] || (C[22] = (L) => Ut.value = L),
        speed: pi.value,
        "onUpdate:speed": C[23] || (C[23] = (L) => pi.value = L),
        sounds: c.value.sounds,
        metronome: lt.value,
        "onUpdate:metronome": C[24] || (C[24] = (L) => lt.value = L),
        view: se.value,
        bar: He.value,
        from: Ze.value,
        position: Ke.value,
        reference: On.value,
        hear: vn.value,
        "onUpdate:hear": C[25] || (C[25] = (L) => vn.value = L),
        "source-level": _t.value,
        "onUpdate:sourceLevel": C[26] || (C[26] = (L) => _t.value = L),
        "source-shift": Rn.value,
        "onUpdate:sourceShift": C[27] || (C[27] = (L) => Rn.value = L),
        "source-beat": Pi.value,
        "timeline-bars": Mt.value,
        guide: ne.value,
        source: Ht.value,
        "source-problem": En.value,
        "loop-range": In.value,
        onCursor: C[28] || (C[28] = (L) => f.value = L),
        onTime: X,
        onStopped: B(T).onStopped
      }, {
        record: ip(({ countingIn: L }) => [
          Nn(k2, {
            settings: K.value,
            "onUpdate:settings": C[20] || (C[20] = (Z) => K.value = Z),
            hub: B(ie),
            recording: B(T).recording.value,
            "counting-in": L,
            step: B(T).step.value,
            target: N.value === "vocal" ? "Vocal" : "Ins",
            disabled: ge.value,
            onRecord: B(T).start,
            onStop: B(T).stop,
            onStep: B(T).toggleStep,
            onRest: B(T).rest,
            onEnable: B(T).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          Nn(Z2, {
            sounds: P.value,
            "onUpdate:sounds": C[21] || (C[21] = (Z) => P.value = Z),
            fetcher: i.fetcher,
            settings: z.value,
            "keeps-guide": Lr.value,
            onApply: R
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: Ne(["score-main", { "with-roll": q.value && !!se.value?.model, "with-inspector": Me.value }]),
        "data-layout": d.value,
        "data-text": Me.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: Yi(D.value)
      }, [
        p("div", PM, [
          J.value ? (b(), Vn(TC, {
            key: 0,
            voices: Ut.value,
            "onUpdate:voices": C[29] || (C[29] = (L) => Ut.value = L),
            view: se.value,
            "guide-count": Ye.value.length,
            sounds: P.value,
            "onUpdate:sounds": C[30] || (C[30] = (L) => P.value = L),
            "keeps-guide": Lr.value,
            readonly: i.readonly,
            onClearGuide: _,
            onShiftTrack: C[31] || (C[31] = (L, Z) => dt({ op: "shift_track", track: L, semitones: Z }))
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : U("", !0),
          Nn(mS, {
            view: se.value,
            bar: De.value,
            "error-bars": xe.value,
            "source-starts": ht.value,
            readonly: i.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: Et,
            onOperate: dt,
            onNotice: C[32] || (C[32] = (L) => B(u).notes = [L])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          i.lyricsTarget && l.value !== null ? (b(), w("div", NM, [
            C[39] || (C[39] = p("strong", null, "Lyrics", -1)),
            i.lyricsTarget.blocked ? (b(), w("p", VM, I(i.lyricsTarget.blocked), 1)) : (b(), w(de, { key: 1 }, [
              ke.value ? (b(), w("p", HM, [
                ue(" Apply writes the changed lyrics into " + I(i.lyricsTarget.title) + ": " + I(we.value) + ". That sheet then asks for approval again. ", 1),
                i.lyricsTarget.replans ? (b(), w(de, { key: 0 }, [
                  ue(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : U("", !0)
              ])) : (b(), w("p", zM, [
                ue(I(i.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${i.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !i.readonly ? (b(), w(de, { key: 0 }, [
                  ue("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : U("", !0)
              ])),
              ke.value ? (b(), w("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: Ri
              }, " Revert the lyrics ")) : U("", !0)
            ], 64))
          ])) : U("", !0),
          Me.value && yt.value ? (b(), w("details", WM, [
            C[40] || (C[40] = p("summary", null, "Lyrics fit", -1)),
            Nn(sh, {
              lyrics: yt.value,
              abc: i.doc.text,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : U("", !0)
        ]),
        p("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": B(Lp),
          "aria-valuemax": B(Dp),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: at,
          onKeydown: ft
        }, null, 40, FM),
        p("div", {
          class: Ne(["score-views", { split: Me.value && c.value.advanced }])
        }, [
          Me.value ? U("", !0) : (b(), Vn($c, {
            key: 0,
            text: i.doc.text,
            diagnostics: Be.value,
            reveal: v.value,
            readonly: i.readonly,
            onChange: B(u).typed,
            onCursor: mi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          Nn(cw, {
            view: se.value,
            stale: ae.value,
            selection: B(u).selection,
            playing: f.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: C[33] || (C[33] = (L, Z) => At(L, Z))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Me.value && c.value.advanced ? (b(), w("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": B(Op),
            "aria-valuemax": B(Bp),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: j,
            onKeydown: Ce
          }, null, 40, KM)) : U("", !0),
          Me.value && c.value.advanced ? (b(), Vn($c, {
            key: 2,
            text: i.doc.text,
            diagnostics: Be.value,
            reveal: v.value,
            readonly: i.readonly,
            onChange: B(u).typed,
            onCursor: mi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : U("", !0)
        ], 2),
        Me.value ? (b(), Vn(Tk, {
          key: 0,
          view: se.value,
          selection: B(u).selection,
          operate: Gn,
          "fallback-bar": B(u).primary?.bar ?? null,
          readonly: i.readonly,
          stale: ae.value,
          busy: B(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : U("", !0)
      ], 14, RM),
      p("p", _M, [
        p("span", null, I(B(u).selection.length > 1 ? `${B(u).selection.length} selected · ` : "") + I(B(Bm)(B(u).primary, Ot.value)), 1),
        (b(!0), w(de, null, be(B(u).notes, (L, Z) => (b(), w("span", {
          key: Z,
          class: "change"
        }, I(L), 1))), 128))
      ]),
      B(u).error ? (b(), w("p", UM, I(B(u).error), 1)) : U("", !0),
      Qe.value ? (b(), w("p", GM, I(Qe.value), 1)) : U("", !0),
      F.value ? (b(), w("p", jM, I(F.value), 1)) : U("", !0),
      Pn.value ? (b(), Vn(lw, {
        key: 8,
        fetcher: i.fetcher,
        data: Pn.value.data,
        filename: Pn.value.filename,
        view: se.value,
        "keeps-guide": Lr.value,
        "current-guide": Ye.value.length,
        onClose: C[34] || (C[34] = (L) => Pn.value = null),
        onInsert: Zf
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : U("", !0),
      Be.value.length ? (b(), w("ul", qM, [
        (b(!0), w(de, null, be(Be.value, (L, Z) => (b(), w("li", {
          key: Z,
          "data-severity": L.severity
        }, [
          p("strong", null, I(L.severity), 1),
          L.bar ? (b(), w("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${L.bar}`,
            onClick: (ce) => Et(L.bar)
          }, "bar " + I(L.bar), 9, XM)) : L.line ? (b(), w("span", JM, "line " + I(L.line), 1)) : U("", !0),
          ue(" " + I(L.message), 1)
        ], 8, YM))), 128))
      ])) : U("", !0)
    ], 544));
  }
}), ZM = ["aria-label"], QM = ["title"], eA = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, tA = ["aria-selected", "onClick"], nA = ["title", "aria-label", "aria-pressed"], iA = {
  key: 0,
  class: "hint"
}, sA = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, oA = ["disabled", "title"], rA = {
  class: "body",
  role: "tabpanel"
}, lA = { class: "doc-head" }, aA = ["data-state"], uA = ["disabled", "title", "onClick"], cA = ["disabled", "onClick"], hA = ["onClick"], dA = {
  key: 0,
  class: "conflict"
}, fA = ["onClick"], pA = ["onClick"], mA = ["onClick"], gA = ["onUpdate:modelValue", "rows", "aria-label", "onFocus", "onInput"], vA = {
  key: 3,
  class: "tag-helpers"
}, yA = ["title", "onClick"], bA = ["title", "onClick"], kA = ["aria-expanded"], wA = ["title", "onClick"], xA = ["title", "onClick"], SA = ["maxlength", "onKeydown"], CA = ["onClick"], MA = {
  key: 4,
  class: "error"
}, AA = {
  key: 5,
  class: "facts"
}, TA = {
  key: 4,
  class: "asr"
}, $A = { key: 0 }, DA = { key: 1 }, LA = { key: 2 }, BA = { key: 5 }, OA = {
  key: 0,
  class: "diff"
}, EA = { key: 0 }, IA = { key: 1 }, RA = { key: 2 }, PA = { key: 3 }, NA = {
  key: 0,
  class: "doc context wide"
}, VA = { class: "doc-head" }, HA = ["title"], zA = {
  key: 1,
  class: "badge"
}, WA = {
  key: 0,
  class: "hint score-owner"
}, FA = {
  key: 1,
  class: "hint"
}, KA = {
  key: 1,
  class: "doc sections"
}, _A = {
  key: 0,
  class: "doc context"
}, UA = { class: "doc-head" }, GA = {
  class: "findings",
  "aria-label": "Validation"
}, jA = ["data-status"], qA = { key: 0 }, YA = ["title"], XA = { key: 1 }, JA = ["title"], ZA = { class: "idea" }, QA = {
  key: 0,
  class: "idea"
}, eT = {
  key: 1,
  class: "idea"
}, tT = { class: "where" }, nT = {
  key: 0,
  class: "kept"
}, iT = {
  key: 1,
  class: "error"
}, sT = {
  key: 2,
  class: "error"
}, oT = {
  key: 3,
  class: "error"
}, rT = {
  key: 4,
  class: "error"
}, lT = ["data-severity"], aT = { class: "where" }, uT = {
  key: 0,
  class: "facts"
}, cT = ["disabled"], hT = ["disabled", "title"], dT = ["disabled", "title"], fT = ["aria-valuenow", "title"], pT = /* @__PURE__ */ xt({
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = O(() => t.payload?.style_label === "caption"), u = O(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (D) => D === "style" && a.value ? "Caption" : o[D], d = (D) => D === "style" && a.value ? 14 : l[D], h = Ss(Xa(t.state, t.payload, t.owned)), f = W(t.payload), m = W(null), y = W(!1), v = W(!1), x = W(null), S = O(() => {
      const D = h.find((E) => E.kind === "score"), V = x.value;
      return D && D.intent !== "auto" && V?.reason && V.text === D.text ? V.reason : null;
    }), $ = W(null), N = W(0);
    let P;
    const z = O(() => t.payload?.context?.score ?? null), R = Ss({ kind: "score", text: z.value ?? "", intent: "keep" }), Y = O(
      () => !h.some((D) => D.kind === "score") && !!z.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), H = W(null), ie = O(() => {
      const D = H.value;
      return Y.value && D?.reason && D.text === R.text ? D.reason : null;
    }), K = O(
      () => Y.value && z.value && jt(R.text) !== jt(z.value) ? R.text : null
    );
    function T() {
      if (!K.value) return;
      const D = h.find((V) => V.kind === "lyrics");
      D && D.intent !== "auto" && (D.intent = "manual");
    }
    const F = O(() => {
      const D = new Set(h.map((V) => s[V.kind]));
      for (const V of Object.keys(t.payload?.context ?? {}))
        V in s && D.add(s[V]);
      return ["score", "lyrics", "style", "details"].filter((V) => D.has(V));
    }), ge = h[0] ? s[h[0].kind] : "lyrics", ve = W(ge), se = (D) => t.payload?.docs[D] ?? null, ae = (D) => se(D)?.upstream ?? null, Be = (D) => se(D)?.status === "conflict", xe = (D) => h.filter((V) => s[V.kind] === D), De = O(() => h.find((D) => D.kind === "score") ?? null), Me = O(() => De.value?.text ?? z.value ?? null), J = O(
      () => h.find((D) => D.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), Ye = O(
      () => h.find((D) => D.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), he = O(() => Kp(t.payload?.timeline)), Se = O(() => {
      const D = t.asrNote ?? $.value;
      return D && D.draft_sha256 === se("lyrics")?.upstream_sha256 ? D : null;
    }), ne = (D) => vm(ae(D.kind) ?? "", D.text);
    function q(D) {
      if (D.intent === "auto") return "auto";
      if (D.intent === "manual") return "manual";
      if (D.intent === "rebase") return "edited (merged)";
      if (Be(D.kind)) return "conflict";
      const V = t.state.docs[D.kind]?.state ?? "auto", E = jt(ae(D.kind) ?? "");
      return V === "auto" && jt(D.text) !== E ? E || !t.payload ? "edited" : "manual" : V;
    }
    function ee(D) {
      D.intent = "auto";
      const V = ae(D.kind);
      V !== null && (D.text = V);
    }
    function He(D) {
      return ae(D.kind) !== null || q(D) !== "auto";
    }
    function Ze(D) {
      D.intent = "manual";
    }
    const Ke = /* @__PURE__ */ new Map(), vt = /* @__PURE__ */ new Set();
    function te(D, V) {
      V instanceof HTMLTextAreaElement ? Ke.set(D, V) : Ke.delete(D);
    }
    function G(D, V) {
      const E = Ke.get(D.kind), j = E && vt.has(D.kind) ? E.selectionStart : D.text.length, Ce = gm(D.text, V, j);
      D.text = Ce.text, pn(D), nn(() => {
        E?.isConnected && (E.focus(), E.setSelectionRange(Ce.caret, Ce.caret));
      });
    }
    function fe(D) {
      D.intent = "manual";
    }
    const ke = O(
      () => t.payload?.model_tags?.length ? t.payload.model_tags : [...ou]
    ), we = O(
      () => (t.payload?.section_tags ?? [...ou, ...fm]).filter((D) => !ke.value.includes(D))
    ), yt = W([]), ct = W(!1), Lt = W(!1), Bt = W(""), Ft = W("");
    let Ct = null;
    function ms(D) {
      Ct = D instanceof HTMLInputElement ? D : null;
    }
    ts(async () => {
      yt.value = mm(await zp(t.fetcher), [...ke.value, ...we.value]);
    });
    async function Ln(D) {
      const V = yt.value;
      yt.value = D;
      try {
        await jp(t.fetcher, D), Ft.value = "";
      } catch (E) {
        yt.value = V, Ft.value = E instanceof Error ? E.message : String(E);
      }
    }
    function di() {
      Lt.value = !0, nn(() => Ct?.focus());
    }
    function Bn(D) {
      const V = ih(Bt.value);
      if (Lt.value = !1, Bt.value = "", !V) return;
      const E = [...ke.value, ...we.value, ...yt.value].find(
        (j) => j.toLowerCase() === V.toLowerCase()
      );
      if (!E) {
        if (yt.value.length >= cl) {
          Ft.value = `At most ${cl} tags of your own - remove one first.`;
          return;
        }
        Ln([...yt.value, V]);
      }
      G(D, E ?? V);
    }
    function fn(D) {
      Ln(yt.value.filter((V) => V !== D));
    }
    function Kt(D) {
      D.intent = "rebase";
    }
    function pn(D) {
      D.intent === "auto" && (D.intent = "keep");
    }
    function Ii() {
      Xa(t.state, t.payload, t.owned).forEach((V, E) => Object.assign(h[E], V)), en.value = [...t.guide ?? []], gn.value = [...t.lyricSpans ?? []], lt.value = t.sourceShift ?? 0, R.text = z.value ?? "", N.value++;
    }
    const Vt = O(
      () => h.filter((D) => Be(D.kind) && D.intent === "keep").map((D) => D.kind)
    ), mn = O(() => qp(t.state, t.payload, h)), en = W([...t.guide ?? []]);
    function fi(D) {
      en.value = D;
    }
    const gn = W([...t.lyricSpans ?? []]);
    function Ri(D) {
      gn.value = D;
    }
    const lt = W(t.sourceShift ?? 0);
    function On(D) {
      lt.value = D;
    }
    function Ht() {
      return { lyricSpans: gn.value, sourceShift: lt.value };
    }
    const En = W(null), vn = O(() => h.find((D) => D.kind === "lyrics") ?? null), _t = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, In = O(() => vn.value ? _t : t.lyricsTarget ?? null), Mt = O(() => {
      const D = t.payload?.context?.lyrics, V = En.value;
      return vn.value || !In.value || In.value.blocked || !V || !D ? null : jt(V) !== jt(D) ? V : null;
    });
    function Pi(D) {
      const V = vn.value;
      V ? D !== null && jt(D) !== jt(V.text) && (V.text = D, pn(V)) : En.value = D;
    }
    function Ni() {
      if (!Mt.value || !In.value?.replans) return;
      const D = h.find((V) => V.kind === "score");
      D && D.intent === "keep" && (D.intent = "manual");
    }
    const Rn = O(
      () => Qa(mn.value) !== Qa(t.state) || !Ms(en.value, t.guide ?? []) || !Oo(gn.value, t.lyricSpans ?? []) || lt.value !== (t.sourceShift ?? 0) || Mt.value !== null || K.value !== null
    ), ht = O(() => {
      const D = t.payload?.arrangement;
      return D && D.status !== "skipped" ? D : null;
    }), Ot = O(() => _p(ht.value?.notes ?? [])), Ut = O(() => (f.value?.findings ?? []).filter((D) => D.severity !== "info")), pi = O(() => (f.value?.findings ?? []).filter((D) => D.severity === "info")), At = O(() => Ut.value.some((D) => D.severity === "error")), mi = O(
      () => !y.value && !At.value && !Vt.value.length && !S.value && !ie.value && !!f.value?.fingerprint
    ), Et = O(
      () => Vt.value.length ? "Resolve the conflicts first." : S.value ?? ie.value
    ), Gt = O(() => Vt.value.length ? "⇄ conflict" : At.value ? "✖ errors" : Ut.value.length ? "⚠ warnings" : f.value?.waiting && !Rn.value ? "⏸ waiting for approval" : f.value ? "✓ valid" : "not run yet");
    async function dt() {
      if (t.payload) {
        y.value = !0, m.value = null;
        try {
          f.value = await Up(t.fetcher, {
            sheet_state: mn.value,
            upstream: Gp(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: K.value ? { ...t.payload.context, score: K.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null,
            sparse: t.payload.sparse ?? !1
          });
        } catch (D) {
          m.value = D instanceof eh ? `${D.message}${D.hint ? ` — ${D.hint}` : ""}` : String(D);
        } finally {
          y.value = !1;
        }
      }
    }
    Ie(
      () => [...h.map((D) => D.text + D.intent), K.value ?? ""].join("\0"),
      () => {
        clearTimeout(P), P = setTimeout(dt, 300);
      }
    );
    function Gn(D) {
      return K.value ? { text: K.value, approved: D } : null;
    }
    function gi() {
      Et.value || (Ni(), T(), n(
        "apply",
        eu(mn.value, t.state.review?.approved_fingerprint ?? null),
        en.value,
        Mt.value,
        Gn(!1),
        !1,
        Ht()
      ));
    }
    async function Vi() {
      Ni(), T(), await dt(), mi.value && n(
        "apply",
        eu(mn.value, f.value?.fingerprint ?? null),
        en.value,
        Mt.value,
        Gn(!0),
        !0,
        Ht()
      );
    }
    function jn() {
      Rn.value ? v.value = !0 : n("close");
    }
    const Oe = Ss(Wp()), k = Ss({ width: window.innerWidth, height: window.innerHeight }), A = O(() => {
      const D = Oe.maximized ? k.height - 2 * tu : Oe.height;
      return Oe.maximized ? {
        width: `${k.width - 2 * tu}px`,
        height: `${D}px`,
        "--plenio-dialog-h": `${D}px`
      } : { width: `${Oe.width}px`, height: `${Oe.height}px`, "--plenio-dialog-h": `${D}px` };
    });
    function M() {
      k.width = window.innerWidth, k.height = window.innerHeight;
      const D = nu({ width: Oe.width, height: Oe.height }, k);
      (D.width !== Oe.width || D.height !== Oe.height) && (Oe.width = D.width, Oe.height = D.height, Pr(Oe));
    }
    function X() {
      Oe.maximized = !Oe.maximized, Pr(Oe);
    }
    function _(D) {
      D.preventDefault(), D.stopPropagation();
      const V = { width: Oe.width, height: Oe.height };
      Bo(
        D,
        ({ dx: E, dy: j }) => {
          const Ce = nu(
            { width: V.width + E, height: V.height + j },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Oe.width = Ce.width, Oe.height = Ce.height;
        },
        () => Pr(Oe)
      );
    }
    function oe(D) {
      D.key === "Escape" && !D.defaultPrevented && (D.preventDefault(), v.value ? v.value = !1 : jn());
    }
    return ts(() => {
      window.addEventListener("keydown", oe), window.addEventListener("resize", M), t.payload && dt();
      const D = se("lyrics")?.upstream_sha256;
      !t.asrNote && D && Fp(t.fetcher, D).then((V) => $.value = V).catch(() => {
      });
    }), _n(() => {
      window.removeEventListener("keydown", oe), window.removeEventListener("resize", M), clearTimeout(P);
    }), (D, V) => (b(), w("div", {
      class: "plenio-overlay",
      onMousedown: Fe(jn, ["self"])
    }, [
      p("div", {
        class: Ne(["plenio-dialog", { maximized: Oe.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": i.title,
        style: Yi(A.value)
      }, [
        p("header", {
          onDblclick: Fe(X, ["self"])
        }, [
          p("h2", null, I(i.title), 1),
          p("span", {
            class: Ne(["status", { bad: At.value || Vt.value.length }]),
            title: f.value?.status ?? ""
          }, I(Gt.value), 11, QM),
          p("div", eA, [
            (b(!0), w(de, null, be(F.value, (E) => (b(), w("button", {
              key: E,
              role: "tab",
              "aria-selected": ve.value === E,
              class: Ne({ active: ve.value === E }),
              onClick: (j) => ve.value = E
            }, I(c(E)), 11, tA))), 128))
          ]),
          p("button", {
            class: "icon",
            title: Oe.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Oe.maximized ? "Restore" : "Maximize",
            "aria-pressed": Oe.maximized,
            onClick: X
          }, I(Oe.maximized ? "❐" : "⛶"), 9, nA),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: jn
          }, "×")
        ], 32),
        i.payload ? U("", !0) : (b(), w("p", iA, [...V[7] || (V[7] = [
          ue(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          ue("; ", -1),
          p("em", null, "Back to auto", -1),
          ue(" hands a document back to the workflow. ", -1)
        ])])),
        v.value ? (b(), w("div", sA, [
          V[8] || (V[8] = ue(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!Et.value,
            title: Et.value ?? "Save your documents into the node",
            onClick: gi
          }, " Apply ", 8, oA),
          p("button", {
            onClick: V[0] || (V[0] = (E) => n("close"))
          }, "Discard"),
          p("button", {
            onClick: V[1] || (V[1] = (E) => v.value = !1)
          }, "Keep editing")
        ])) : U("", !0),
        p("div", rA, [
          (b(!0), w(de, null, be(xe(ve.value), (E) => (b(), w("section", {
            key: E.kind + N.value,
            class: Ne(["doc", { wide: E.kind === "score" }])
          }, [
            p("div", lA, [
              p("h3", null, I(u.value[E.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": q(E)
              }, I(q(E)), 9, aA),
              V[9] || (V[9] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: !He(E),
                title: ae(E.kind) !== null ? "Discard your edit and use the draft" : "Discard your text: the next run computes this document again (the writer, the plan or the transcription) and uses it",
                onClick: (j) => ee(E)
              }, I(ae(E.kind) !== null ? "Use draft" : "Back to auto"), 9, uA),
              E.kind === "lyrics" ? (b(), w("button", {
                key: 0,
                disabled: E.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (j) => Ze(E)
              }, " Use my own lyrics ", 8, cA)) : (b(), w("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (j) => Ze(E)
              }, " Make manual ", 8, hA))
            ]),
            Be(E.kind) && E.intent === "keep" ? (b(), w("div", dA, [
              ue(" The draft changed after you edited this document (" + I(se(E.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (j) => fe(E)
              }, "Keep my edit (manual)", 8, fA),
              p("button", {
                onClick: (j) => ee(E)
              }, "Use the new draft", 8, pA),
              p("button", {
                onClick: (j) => Kt(E)
              }, "Merge by hand", 8, mA)
            ])) : U("", !0),
            E.kind === "score" ? (b(), Vn(Qc, {
              key: 1,
              doc: E,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !1,
              "layout-default": i.layout ?? null,
              lyrics: J.value,
              title: Ye.value,
              guide: en.value,
              "lyric-spans": gn.value,
              "source-shift": lt.value,
              "lyrics-target": In.value,
              "lyrics-pending": vn.value ? null : En.value,
              onEdited: (j) => pn(E),
              onGuideChange: fi,
              onLyricSpansChange: Ri,
              onSourceShiftChange: On,
              onLyricsChange: Pi,
              onGate: V[2] || (V[2] = (j, Ce) => x.value = { text: j, reason: Ce })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : Le((b(), w("textarea", {
              key: 2,
              ref_for: !0,
              ref: (j) => te(E.kind, j),
              "onUpdate:modelValue": (j) => E.text = j,
              rows: d(E.kind),
              spellcheck: "false",
              "aria-label": u.value[E.kind],
              onFocus: (j) => B(vt).add(E.kind),
              onInput: (j) => pn(E)
            }, null, 40, gA)), [
              [ot, E.text]
            ]),
            E.kind === "lyrics" ? (b(), w("p", vA, [
              V[10] || (V[10] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (b(!0), w(de, null, be(ke.value, (j) => (b(), w("button", {
                key: j,
                title: B(Vr)(j, !0),
                onClick: (Ce) => G(E, j)
              }, " [" + I(j) + "] ", 9, yA))), 128)),
              ct.value ? (b(!0), w(de, { key: 0 }, be(we.value, (j) => (b(), w("button", {
                key: "more-" + j,
                class: "more",
                title: B(Vr)(j, !1),
                onClick: (Ce) => G(E, j)
              }, " [" + I(j) + "] ", 9, bA))), 128)) : U("", !0),
              we.value.length ? (b(), w("button", {
                key: 1,
                class: "link",
                "aria-expanded": ct.value,
                title: "Tags Plenio knows besides the model's own sections",
                onClick: V[3] || (V[3] = (j) => ct.value = !ct.value)
              }, I(ct.value ? "fewer" : `more (${we.value.length})`), 9, kA)) : U("", !0),
              (b(!0), w(de, null, be(yt.value, (j) => (b(), w("span", {
                key: "own-" + j,
                class: "own"
              }, [
                p("button", {
                  title: `${B(Vr)(j, !1)} - a tag of your own`,
                  onClick: (Ce) => G(E, j)
                }, " [" + I(j) + "] ", 9, wA),
                p("button", {
                  class: "drop",
                  title: `Remove [${j}] from your tags (the lyrics keep it)`,
                  onClick: (Ce) => fn(j)
                }, " × ", 8, xA)
              ]))), 128)),
              Lt.value ? (b(), w(de, { key: 2 }, [
                Le(p("input", {
                  ref_for: !0,
                  ref: ms,
                  "onUpdate:modelValue": V[4] || (V[4] = (j) => Bt.value = j),
                  class: "new-tag",
                  maxlength: B(nh),
                  placeholder: "e.g. Violin Rise",
                  "aria-label": "Your section tag",
                  onKeydown: [
                    et(Fe((j) => Bn(E), ["prevent", "stop"]), ["enter"]),
                    V[5] || (V[5] = et(Fe((j) => Lt.value = !1, ["prevent", "stop"]), ["esc"]))
                  ]
                }, null, 40, SA), [
                  [ot, Bt.value]
                ]),
                p("button", {
                  onClick: (j) => Bn(E)
                }, "Add", 8, CA)
              ], 64)) : (b(), w("button", {
                key: 3,
                class: "link",
                title: "A section tag of your own - kept for your next songs, inserted with one click",
                onClick: di
              }, " + your tag ")),
              Ft.value ? (b(), w("span", MA, I(Ft.value), 1)) : U("", !0),
              E.intent === "manual" ? (b(), w("span", AA, "the writer is not consulted - these are your lyrics")) : U("", !0)
            ])) : U("", !0),
            E.kind === "lyrics" && Se.value ? (b(), w("p", TA, [
              p("span", null, "Transcribed (" + I(Se.value.language) + ").", 1),
              Se.value.corrected?.length ? (b(), w("span", $A, [
                V[11] || (V[11] = ue(" Corrected as misheard: ", -1)),
                (b(!0), w(de, null, be(Se.value.corrected, (j, Ce) => (b(), w("span", {
                  key: "fix-" + Ce,
                  class: "fix"
                }, [
                  p("s", null, I(j.heard), 1),
                  ue(" → " + I(j.word), 1)
                ]))), 128))
              ])) : U("", !0),
              Se.value.low_confidence.length ? (b(), w("span", DA, [
                V[12] || (V[12] = ue(" Check these unsure words: ", -1)),
                (b(!0), w(de, null, be(Se.value.low_confidence, (j, Ce) => (b(), w("mark", {
                  key: "low-" + Ce
                }, I(j), 1))), 128))
              ])) : U("", !0),
              Se.value.left_out.length ? (b(), w("span", LA, [
                V[13] || (V[13] = ue("Left out as not sung: ", -1)),
                p("s", null, I(Se.value.left_out.join(" ")), 1)
              ])) : U("", !0)
            ])) : U("", !0),
            ae(E.kind) !== null && B(jt)(ae(E.kind) ?? "") !== B(jt)(E.text) ? (b(), w("details", BA, [
              p("summary", null, "Changes against the draft (" + I(B(ym)(ne(E))) + " words)", 1),
              E.kind !== "score" ? (b(), w("p", OA, [
                (b(!0), w(de, null, be(ne(E), (j, Ce) => (b(), w(de, { key: Ce }, [
                  j.text === B(Hs) ? (b(), w("br", EA)) : j.op === "added" ? (b(), w("ins", IA, I(j.text + " "), 1)) : j.op === "removed" ? (b(), w("del", RA, I(j.text + " "), 1)) : (b(), w("span", PA, I(j.text + " "), 1))
                ], 64))), 128))
              ])) : U("", !0),
              p("pre", null, I(ae(E.kind)), 1)
            ])) : U("", !0),
            E.kind === "lyrics" ? (b(), Vn(sh, {
              key: 6,
              lyrics: E.text,
              abc: Me.value,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : U("", !0)
          ], 2))), 128)),
          ve.value === "score" && !De.value && z.value ? (b(), w("section", NA, [
            p("div", VA, [
              V[14] || (V[14] = p("h3", null, "Score (ABC)", -1)),
              Y.value ? (b(), w("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${i.scoreTarget?.title}`
              }, " from " + I(i.scoreTarget?.title) + I(K.value ? " · changed" : ""), 9, HA)) : (b(), w("span", zA, "from the other sheet (read-only)"))
            ]),
            Y.value ? (b(), w("p", WA, [
              V[15] || (V[15] = ue(" Changes to the score go into ", -1)),
              p("strong", null, I(i.scoreTarget?.title), 1),
              V[16] || (V[16] = ue(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              V[17] || (V[17] = p("strong", null, "Approve", -1)),
              V[18] || (V[18] = ue(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : i.scoreTarget?.blocked ? (b(), w("p", FA, I(i.scoreTarget.blocked), 1)) : U("", !0),
            Nn(Qc, {
              doc: R,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !Y.value,
              "layout-default": i.layout ?? null,
              lyrics: J.value,
              "lyrics-target": vn.value ? In.value : null,
              "lyric-spans": gn.value,
              "source-shift": lt.value,
              onLyricSpansChange: Ri,
              onSourceShiftChange: On,
              onLyricsChange: Pi,
              onGate: V[6] || (V[6] = (E, j) => H.value = { text: E, reason: j })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : U("", !0),
          ve.value === "lyrics" && he.value.length ? (b(), w("section", KA, [
            V[20] || (V[20] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              V[19] || (V[19] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (b(!0), w(de, null, be(he.value, (E, j) => (b(), w("tr", { key: j }, [
                  p("td", null, I(E.label), 1),
                  p("td", null, I(E.bars), 1),
                  p("td", null, I(E.start), 1),
                  p("td", null, I(E.end), 1)
                ]))), 128))
              ])
            ])
          ])) : U("", !0),
          (b(!0), w(de, null, be(i.payload?.context ?? {}, (E, j) => (b(), w(de, {
            key: "context-" + j
          }, [
            j !== "score" && s[j] === ve.value ? (b(), w("section", _A, [
              p("div", UA, [
                p("h3", null, I(u.value[j] ?? j), 1),
                V[21] || (V[21] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, I(E), 1)
            ])) : U("", !0)
          ], 64))), 128))
        ]),
        p("section", GA, [
          ht.value ? (b(), w("div", {
            key: 0,
            class: "arrangement",
            "data-status": ht.value.status
          }, [
            ht.value.status === "fallback" ? (b(), w("p", qA, [
              V[22] || (V[22] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: B(Rr)
              }, "experimental", 8, YA),
              ue(" - " + I(B(Ja)(ht.value)) + ": " + I(ht.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (b(), w("details", XA, [
              p("summary", null, [
                V[23] || (V[23] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: B(Rr)
                }, "experimental", 8, JA),
                ue(" " + I(B(Ja)(ht.value)) + ": " + I(ht.value.summary), 1)
              ]),
              p("p", ZA, I(B(Rr)), 1),
              B(Za)(ht.value) ? (b(), w("p", QA, I(B(Za)(ht.value)), 1)) : U("", !0),
              ht.value.idea ? (b(), w("p", eT, I(ht.value.idea), 1)) : U("", !0),
              p("ul", null, [
                (b(!0), w(de, null, be(ht.value.sections ?? [], (E) => (b(), w("li", {
                  key: E.index
                }, [
                  p("strong", null, I(E.index) + " " + I(E.label), 1),
                  p("span", tT, "bars " + I(E.bars), 1),
                  ue(" " + I(E.applied.length ? E.applied.join("; ") : "unchanged") + " ", 1),
                  E.kept.length ? (b(), w("span", nT, " - kept: " + I(E.kept.join("; ")), 1)) : U("", !0)
                ]))), 128)),
                (b(!0), w(de, null, be(Ot.value, (E, j) => (b(), w("li", {
                  key: "note" + j,
                  "data-severity": "info"
                }, I(E), 1))), 128))
              ])
            ]))
          ], 8, jA)) : U("", !0),
          m.value ? (b(), w("p", iT, I(m.value), 1)) : U("", !0),
          Vt.value.length ? (b(), w("p", sT, " Resolve the conflict in: " + I(Vt.value.join(", ")) + ". ", 1)) : U("", !0),
          S.value ? (b(), w("p", oT, "Score: " + I(S.value), 1)) : ie.value ? (b(), w("p", rT, "Score: " + I(ie.value), 1)) : U("", !0),
          p("ul", null, [
            (b(!0), w(de, null, be(Ut.value, (E, j) => (b(), w("li", {
              key: j,
              "data-severity": E.severity
            }, [
              p("strong", null, I(E.severity), 1),
              V[24] || (V[24] = ue()),
              p("span", aT, I(E.where), 1),
              ue(" " + I(E.message), 1)
            ], 8, lT))), 128)),
            (b(!0), w(de, null, be(pi.value, (E, j) => (b(), w("li", {
              key: "i" + j,
              "data-severity": "info"
            }, I(E.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          i.owned.includes("score") && f.value ? (b(), w("span", uT, " render: " + I(f.value.planning_mode) + ", ceiling " + I(Math.round(f.value.score_seconds)) + " s ", 1)) : U("", !0),
          V[25] || (V[25] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Rn.value,
            title: "Discard every change made in this editor",
            onClick: Ii
          }, "Revert", 8, cT),
          p("button", { onClick: jn }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!Et.value,
            title: Et.value ?? "Save your documents into the node",
            onClick: gi
          }, " Apply ", 8, hT),
          i.review === "stop for review" ? (b(), w("button", {
            key: 1,
            class: "primary",
            disabled: !mi.value,
            title: S.value ?? "Release exactly these documents for the next run",
            onClick: Vi
          }, " Approve ", 8, dT)) : U("", !0)
        ]),
        Oe.maximized ? U("", !0) : (b(), w("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Oe.width,
          title: `Resize (${Oe.width} × ${Oe.height})`,
          onPointerdown: _
        }, null, 40, fT))
      ], 14, ZM)
    ], 32));
  }
});
function mT() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const i = document.createElement("style");
  i.id = "plenio-dialog-styles", i.textContent = op, document.head.append(i);
}
function ST(i) {
  mT();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    n.unmount(), e.remove();
  }, n = sp(pT, {
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
  ST as openSheetDialog
};
