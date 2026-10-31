import { d as Dt, m as Re, a as zn, i as b, c as C, b as p, t as I, F as he, r as we, n as ze, j as ae, e as U, g as z, h as O, o as Xs, u as L, w as Oe, v as ft, p as ot, f as Ue, q as Nt, s as ri, x as ws, y as Gi, z as Cn, A as ct, B as ji, C as no, D as Zt, E as Jf, G as In, H as En, I as Zf, k as Qf, l as ep } from "./dialog-B4MUL7Ty.mjs";
import { a as tp, P as Jc, b as np, t as ip, c as sp, T as Do, d as op, s as Wo, f as rp, e as lp, g as ap, h as up, j as cp, k as hp, m as dp, n as fp, o as Ua, q as pp, r as mp, I as Zc, u as Fo, w as gp, x as vp, y as yp, z as bp, A as kp, B as wp, R as xp, C as Sp, S as Cp, D as Mp, N as Ap, E as Tp, F as jt, v as $p, G as Lo, H as Ga, J as Dp, K as ja, L as Lp, M as Bp, O as Op, Q as Ep, U as Ip, V as qa, W as Rp, X as Pp, Y as Rr, Z as Ya, _ as Xa, $ as Np, a0 as Ja, a1 as Vp, a2 as Hp, a3 as zp, a4 as Za, a5 as Qa, a6 as eu, a7 as Pr, a8 as Wp } from "./main-BKYoTR7w.mjs";
import { a as Fp, r as Kp, n as _p, e as Nr, b as Up, s as Gp, p as jp } from "./notationExport-DkCMgjck.mjs";
import { lineKey as Ko, parseSpans as ia, editRange as io, sameSpans as Bo, partOf as qp, settle as Yp, placedLines as tu, withBlockSpans as Xp, parseLineKey as Jp, clipOfLines as nu, partAt as Zp, remapSpans as Qp, followSpans as em } from "./lyricPlacement-DGoRXeqW.mjs";
import { SHIFTABLE as Jn, shiftBlock as xs, notesLabel as tm, trackRows as nm, parseGuide as im, sameGuide as Ss, guideNotes as sm, remapGuide as om } from "./tracks-ClAVjvds.mjs";
const rm = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Instrumental", "Outro"];
function lm(i, e, t = i.length) {
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
const Ns = `
`;
function iu(i) {
  const e = [];
  return i.replace(/\r\n?/g, `
`).split(`
`).forEach((t, n) => {
    n > 0 && e.push(Ns), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function am(i, e) {
  const t = iu(i), n = iu(e), s = t.length + 1, o = n.length + 1, r = new Array(s * o).fill(0);
  for (let d = t.length - 1; d >= 0; d--)
    for (let h = n.length - 1; h >= 0; h--)
      r[d * o + h] = t[d] === n[h] ? r[(d + 1) * o + h + 1] + 1 : Math.max(r[(d + 1) * o + h], r[d * o + h + 1]);
  const l = [], a = (d, h) => {
    const f = l[l.length - 1];
    f && f.op === d && h !== Ns && !f.text.endsWith(Ns) ? f.text += ` ${h}` : l.push({ op: d, text: h });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < n.length; )
    u < t.length && c < n.length && t[u] === n[c] ? (a("same", t[u]), u++, c++) : c < n.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", n[c++]) : a("removed", t[u++]);
  return l;
}
function um(i) {
  return i.filter((e) => e.op !== "same" && e.text !== Ns).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const cm = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, hm = {
  key: 0,
  class: "error"
}, dm = { key: 1 }, fm = {
  key: 0,
  class: "bad"
}, Qc = /* @__PURE__ */ Dt({
  __name: "LyricsFit",
  props: {
    lyrics: {},
    abc: {},
    fetcher: {},
    engine: {},
    instrumental: { type: Boolean }
  },
  setup(i) {
    const e = i, t = z(null), n = z(null);
    let s, o = 0;
    async function r() {
      const a = ++o;
      try {
        const u = await tp(e.fetcher, {
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
    Re(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), zn(() => clearTimeout(s));
    const l = O(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", d = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: d };
      })
    );
    return (a, u) => i.abc ? (b(), C("section", cm, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      n.value ? (b(), C("p", hm, I(n.value), 1)) : l.value.length ? (b(), C("table", dm, [
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
          (b(!0), C(he, null, we(l.value, (c, d) => (b(), C("tr", {
            key: d,
            class: ze({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + I(c.tag) + "]", 1),
            p("td", null, [
              ae(I(c.score_section ?? "—"), 1),
              c.mismatch ? (b(), C("span", fm, " ≠")) : U("", !0)
            ]),
            p("td", null, I(c.lines), 1),
            p("td", null, I(c.syllables), 1),
            p("td", null, I(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: ze({ bad: c.fit && c.fit !== "fits" })
            }, I(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : U("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : U("", !0);
  }
});
function pm(i) {
  const e = new Set((i.elements ?? []).map((n) => n.id)), t = i.model?.tracks;
  if (t) for (const n of [...t.vocal, ...t.ins, ...t.chords]) e.add(n.id);
  return e;
}
function mm(i, e) {
  const t = i?.model?.tracks, n = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = n.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const su = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function ul(i, e) {
  const t = su.indexOf(i);
  return t < 0 ? null : su[t + e] ?? null;
}
function gm(i, e, t) {
  const n = i.elements ?? [], s = n.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of n) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function vm(i, e) {
  const t = i.elements ?? [];
  return t.find((n) => n.source[0] <= e && e < n.source[1]) ?? t.find((n) => n.source[1] === e) ?? null;
}
function Mi(i, e) {
  return !i || !e ? null : (i.elements ?? []).find((t) => t.id === e) ?? null;
}
function ym(i, e, t) {
  const n = Mi(i, e);
  if (!n) return null;
  const s = (i.elements ?? []).filter((r) => r.voice === n.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function bm(i, e) {
  const t = Mi(i, e);
  if (!t) return null;
  const n = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (i.elements ?? []).find(
    (s) => s.voice === n && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function km(i, e, t = "Vocal") {
  return (i.elements ?? []).find((n) => n.bar === e && n.voice === t) ?? null;
}
function cl(i, e) {
  const t = i.sections.findIndex((n) => n.start_bar <= e && e < n.start_bar + n.bars);
  return t < 0 ? 0 : t;
}
const wm = {
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
function xm(i, e = "1/16") {
  if (!i) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), n = wm[i.units * t] ?? `${i.units} units`, s = i.kind === "note" ? `${i.name}${i.tie_out ? " (tied)" : ""}` : "rest", o = i.chord ? `, chord ${i.chord}` : "";
  return `${i.voice} bar ${i.bar}: ${s}, ${i.kind === "bar_rest" ? "whole bar" : n}${o}`;
}
function Oo(i) {
  const e = Math.max(0, i), t = Math.floor(e / 60), n = Math.floor(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
let hl = [], eh = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? eh : hl).push(t = t + i[e]);
})();
function Sm(i) {
  if (i < 768) return !1;
  for (let e = 0, t = hl.length; ; ) {
    let n = e + t >> 1;
    if (i < hl[n]) t = n;
    else if (i >= eh[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function ou(i) {
  return i >= 127462 && i <= 127487;
}
const ru = 8205;
function Cm(i, e, t = !0, n = !0) {
  return (t ? th : Mm)(i, e, n);
}
function th(i, e, t) {
  if (e == i.length) return e;
  e && nh(i.charCodeAt(e)) && ih(i.charCodeAt(e - 1)) && e--;
  let n = Vr(i, e);
  for (e += lu(n); e < i.length; ) {
    let s = Vr(i, e);
    if (n == ru || s == ru || t && Sm(s))
      e += lu(s), n = s;
    else if (ou(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && ou(Vr(i, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Mm(i, e, t) {
  for (; e > 1; ) {
    let n = th(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Vr(i, e) {
  let t = i.charCodeAt(e);
  if (!ih(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return nh(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function nh(i) {
  return i >= 56320 && i < 57344;
}
function ih(i) {
  return i >= 55296 && i < 56320;
}
function lu(i) {
  return i < 65536 ? 1 : 2;
}
class We {
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
    [e, t] = Qi(this, e, t);
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
    [e, t] = Qi(this, e, t);
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
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Ds(this), o = new Ds(e);
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
    return new Ds(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new sh(this, e, t);
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
    return new oh(n);
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
    return e.length == 1 && !e[0] ? We.empty : e.length <= 32 ? new rt(e) : Mn.from(rt.split(e, []));
  }
}
class rt extends We {
  constructor(e, t = Am(e)) {
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
        return new Tm(s, l, n, r);
      s = l + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let o = e <= 0 && t >= this.length ? this : new rt(au(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = n.pop(), l = Eo(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        n.push(new rt(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        n.push(new rt(l.slice(0, a)), new rt(l.slice(a)));
      }
    } else
      n.push(o);
  }
  replace(e, t, n) {
    if (!(n instanceof rt))
      return super.replace(e, t, n);
    [e, t] = Qi(this, e, t);
    let s = Eo(this.text, Eo(n.text, au(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return s.length <= 32 ? new rt(s, o) : Mn.from(rt.split(s, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = Qi(this, e, t);
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
      n.push(o), s += o.length + 1, n.length == 32 && (t.push(new rt(n, s)), n = [], s = -1);
    return s > -1 && t.push(new rt(n, s)), t;
  }
}
class Mn extends We {
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
    if ([e, t] = Qi(this, e, t), n.lines < this.lines)
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
    [e, t] = Qi(this, e, t);
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
      return new rt(f, t);
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
      else f.lines > r && (a > r || !a) ? (h(), l.push(f)) : f instanceof rt && a && (m = c[c.length - 1]) instanceof rt && f.lines + m.lines <= 32 ? (a += f.lines, u += f.length + 1, c[c.length - 1] = new rt(m.text.concat(f.text), m.length + 1 + f.length)) : (a + f.lines > s && h(), a += f.lines, u += f.length + 1, c.push(f));
    }
    function h() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Mn.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let f of e)
      d(f);
    return h(), l.length == 1 ? l[0] : new Mn(l, t);
  }
}
We.empty = /* @__PURE__ */ new rt([""], 0);
function Am(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function Eo(i, e, t = 0, n = 1e9) {
  for (let s = 0, o = 0, r = !0; o < i.length && s <= n; o++) {
    let l = i[o], a = s + l.length;
    a >= t && (a > n && (l = l.slice(0, n - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function au(i, e, t) {
  return Eo(i, [""], e, t);
}
class Ds {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof rt ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, s = this.nodes[n], o = this.offsets[n], r = o >> 1, l = s instanceof rt ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof rt) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof rt ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class sh {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Ds(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
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
class oh {
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
typeof Symbol < "u" && (We.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Ds.prototype[Symbol.iterator] = sh.prototype[Symbol.iterator] = oh.prototype[Symbol.iterator] = function() {
  return this;
});
class Tm {
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
function Qi(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function Tt(i, e, t = !0, n = !0) {
  return Cm(i, e, t, n);
}
function $m(i) {
  return i >= 56320 && i < 57344;
}
function Dm(i) {
  return i >= 55296 && i < 56320;
}
function Lm(i, e) {
  let t = i.charCodeAt(e);
  if (!Dm(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return $m(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Bm(i) {
  return i < 65536 ? 1 : 2;
}
const dl = /\r\n?|\n/;
var Vt = /* @__PURE__ */ (function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
})(Vt || (Vt = {}));
class Vn {
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
    fl(this, e, t);
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
    return new Vn(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : rh(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : pl(this, e, t);
  }
  mapPos(e, t = -1, n = Vt.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (n != Vt.Simple && u >= e && (n == Vt.TrackDel && s < e && u > e || n == Vt.TrackBefore && s < e || n == Vt.TrackAfter && u > e))
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
    return new Vn(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Vn(e);
  }
}
class gt extends Vn {
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
    return fl(this, (t, n, s, o, r) => e = e.replace(s, s + (n - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return pl(this, e, t, !0);
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
          n.push(We.empty);
        n.push(r ? e.slice(o, o + r) : We.empty);
      }
      o += r;
    }
    return new gt(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : rh(this, e, !0);
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
    return e.empty ? this : pl(this, e, t, !0);
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
    fl(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Vn.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], o = new Vs(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        At(s, c, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        At(t, c, d), d > 0 && si(n, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        At(t, c, -1), At(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new gt(t, n),
      filtered: Vn.create(s)
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
      r < t && At(s, t - r, -1);
      let d = new gt(s, o);
      l = l ? l.compose(d.map(l)) : d, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let d of c)
          u(d);
      else if (c instanceof gt) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: d, to: h = d, insert: f } = c;
        if (d > h || d < 0 || h > t)
          throw new RangeError(`Invalid change range ${d} to ${h} (in doc of length ${t})`);
        let m = f ? typeof f == "string" ? We.of(f.split(n || dl)) : f : We.empty, y = m.length;
        if (d == h && y == 0)
          return;
        d < r && a(), d > r && At(s, d - r, -1), At(s, h - d, y), si(o, s, m), r = h;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new gt(e ? [e, -1] : [], []);
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
            n.push(We.empty);
          n[s] = We.of(o.slice(1)), t.push(o[0], n[s].length);
        }
      }
    }
    return new gt(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new gt(e, t);
  }
}
function At(i, e, t, n = !1) {
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
      i.push(We.empty);
    i.push(t);
  }
}
function fl(i, e, t) {
  let n = i.inserted;
  for (let s = 0, o = 0, r = 0; r < i.sections.length; ) {
    let l = i.sections[r++], a = i.sections[r++];
    if (a < 0)
      s += l, o += l;
    else {
      let u = s, c = o, d = We.empty;
      for (; u += l, c += a, a && n && (d = d.append(n[r - 2 >> 1])), !(t || r == i.sections.length || i.sections[r + 1] < 0); )
        l = i.sections[r++], a = i.sections[r++];
      e(s, u, o, c, d), s = u, o = c;
    }
  }
}
function pl(i, e, t, n = !1) {
  let s = [], o = n ? [] : null, r = new Vs(i), l = new Vs(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      At(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (At(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (At(s, 0, r.ins), o && si(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      At(s, u, a < r.i ? r.ins : 0), o && a < r.i && si(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? gt.createSet(s, o) : Vn.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function rh(i, e, t = !1) {
  let n = [], s = t ? [] : null, o = new Vs(i), r = new Vs(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? gt.createSet(n, s) : Vn.create(n);
    if (o.ins == 0)
      At(n, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      At(n, 0, r.ins, l), s && si(s, n, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = n.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          At(n, a, c, l), s && c && si(s, n, r.text);
        } else r.ins == -1 ? (At(n, o.off ? 0 : o.len, a, l), s && si(s, n, o.textBit(a))) : (At(n, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && si(s, n, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || n.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class Vs {
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
    return t >= e.length ? We.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? We.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
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
function lh(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let sa = 0;
class fe {
  constructor(e, t, n, s, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = sa++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new fe(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : oa), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Io([], this, 0, e);
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
    return new Io(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Io(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function oa(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class Io {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = sa++;
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
        if (a && h.docChanged || u && (h.docChanged || h.selection) || ml(d, c)) {
          let f = n(d);
          if (l ? !uu(f, d.values[r], s) : !s(f, d.values[r]))
            return d.values[r] = f, 1;
        }
        return 0;
      },
      reconfigure: (d, h) => {
        let f, m = h.config.address[o];
        if (m != null) {
          let y = Uo(h, m);
          if (this.dependencies.every((v) => v instanceof fe ? h.facet(v) === d.facet(v) : v instanceof cn ? h.field(v, !1) == d.field(v, !1) : !0) || (l ? uu(f = n(d), y, s) : s(f = n(d), y)))
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
function uu(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function ml(i, e) {
  let t = !1;
  for (let n of e)
    Ls(i, n) & 1 && (t = !0);
  return t;
}
function Om(i, e, t) {
  let n = t.map((a) => i[a.id]), s = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), r = i[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < n.length; c++) {
      let d = Uo(a, n[c]);
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
        Ls(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!ml(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = ml(a, n), d = u.config.facets[e.id], h = u.facet(e);
      if (d && !c && oa(t, d))
        return a.values[r] = h, 0;
      let f = l(a);
      return e.compare(f, h) ? (a.values[r] = h, 0) : (a.values[r] = f, 1);
    }
  };
}
const so = /* @__PURE__ */ fe.define({ static: !0 });
class cn {
  constructor(e, t, n, s, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new cn(sa++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(so).find((n) => n.field == this);
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
        let o = n.facet(so), r = s.facet(so), l;
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
    return [this, so.of({ field: this, create: e })];
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
function ms(i) {
  return (e) => new ah(e, i);
}
const hr = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ ms(wi.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ ms(wi.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ ms(wi.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ ms(wi.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ ms(wi.lowest)
};
class ah {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class dr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new gl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return dr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class gl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class _o {
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
    for (let h of Em(e, t, r))
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
        if (l[m.id] = a.length << 1 | 1, oa(y, f))
          a.push(n.facet(m));
        else {
          let v = m.combine(f.map((k) => k.value));
          a.push(n && m.compare(v, n.facet(m)) ? n.facet(m) : v);
        }
      else {
        for (let v of f)
          v.type == 0 ? (l[v.id] = a.length << 1 | 1, a.push(v.value)) : (l[v.id] = u.length << 1, u.push((k) => v.dynamicSlot(k)));
        l[m.id] = u.length << 1, u.push((v) => Om(v, m, f));
      }
    }
    let d = u.map((h) => h(l));
    return new _o(e, r, d, l, a, o);
  }
}
function Em(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = n[a].indexOf(r);
      u > -1 && n[a].splice(u, 1), r instanceof gl && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof gl) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof ah)
      o(r.inner, r.prec);
    else if (r instanceof cn)
      n[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof Io)
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
function Ls(i, e) {
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
function Uo(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const uh = /* @__PURE__ */ fe.define(), vl = /* @__PURE__ */ fe.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), ch = /* @__PURE__ */ fe.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), hh = /* @__PURE__ */ fe.define(), dh = /* @__PURE__ */ fe.define(), fh = /* @__PURE__ */ fe.define(), ph = /* @__PURE__ */ fe.define({
  combine: (i) => i.length ? i[0] : !1
});
class cs {
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
    return new Im();
  }
}
class Im {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new cs(this, e);
  }
}
class Rm {
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
    return new Xe(this, e);
  }
}
class Xe {
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
    return t === void 0 ? void 0 : t == this.value ? this : new Xe(this.type, t);
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
    return new Rm(e.map || ((t) => t));
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
Xe.reconfigure = /* @__PURE__ */ Xe.define();
Xe.appendConfig = /* @__PURE__ */ Xe.define();
class $t {
  constructor(e, t, n, s, o, r) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, n && lh(n, t.newLength), o.some((l) => l.type == $t.time) || (this.annotations = o.concat($t.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, s, o, r) {
    return new $t(e, t, n, s, o, r);
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
    let t = this.annotation($t.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
$t.time = /* @__PURE__ */ cs.define();
$t.userEvent = /* @__PURE__ */ cs.define();
$t.addToHistory = /* @__PURE__ */ cs.define();
$t.remote = /* @__PURE__ */ cs.define();
function Pm(i, e) {
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
function mh(i, e, t) {
  var n;
  let s, o, r;
  return t ? (s = e.changes, o = gt.empty(e.changes.length), r = i.changes.compose(e.changes)) : (s = e.changes.map(i.changes), o = i.changes.mapDesc(e.changes, !0), r = i.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (n = i.selection) === null || n === void 0 ? void 0 : n.map(s),
    effects: Xe.mapEffects(i.effects, s).concat(Xe.mapEffects(e.effects, o)),
    annotations: i.annotations.length ? i.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: i.scrollIntoView || e.scrollIntoView
  };
}
function yl(i, e, t) {
  let n = e.selection, s = qi(e.annotations);
  return e.userEvent && (s = s.concat($t.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof gt ? e.changes : gt.of(e.changes || [], t, i.facet(ch)),
    selection: n && (n instanceof J ? n : J.single(n.anchor, n.head)),
    effects: qi(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function gh(i, e, t) {
  let n = yl(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    n = mh(n, yl(i, e[o], r ? n.changes.newLength : i.doc.length), r);
  }
  let s = $t.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return Vm(t ? Nm(s) : s);
}
function Nm(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(hh)) {
    let o = s(i);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : Pm(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = i.changes.invertedDesc, s = gt.empty(e.doc.length);
    else {
      let r = i.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    i = $t.create(e, s, i.selection && i.selection.map(o), Xe.mapEffects(i.effects, o), i.annotations, i.scrollIntoView);
  }
  let n = e.facet(dh);
  for (let s = n.length - 1; s >= 0; s--) {
    let o = n[s](i);
    o instanceof $t ? i = o : Array.isArray(o) && o.length == 1 && o[0] instanceof $t ? i = o[0] : i = gh(e, qi(o), !1);
  }
  return i;
}
function Vm(i) {
  let e = i.startState, t = e.facet(fh), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](i);
    o && Object.keys(o).length && (n = mh(n, yl(e, o, i.changes.newLength), !0));
  }
  return n == i ? i : $t.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const Hm = [];
function qi(i) {
  return i == null ? Hm : Array.isArray(i) ? i : [i];
}
var Nn = /* @__PURE__ */ (function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
})(Nn || (Nn = {}));
const zm = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let bl;
try {
  bl = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Wm(i) {
  if (bl)
    return bl.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || zm.test(t)))
      return !0;
  }
  return !1;
}
function Fm(i) {
  return (e) => {
    if (!/\S/.test(e))
      return Nn.Space;
    if (Wm(e))
      return Nn.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return Nn.Word;
    return Nn.Other;
  };
}
class _e {
  constructor(e, t, n, s, o, r) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Ls(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Ls(this, n), Uo(this, n);
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
    return gh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let l of e.effects)
      l.is(dr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(Xe.reconfigure) ? (t = null, n = l.value) : l.is(Xe.appendConfig) && (t = null, n = qi(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = _o.resolve(n, s, this), o = new _e(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(vl) ? e.newSelection : e.newSelection.asSingle();
    new _e(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
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
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), o = [n.range], r = qi(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let h = 0; h < l; h++)
        o[h] = o[h].map(c);
      let d = s.mapDesc(u, !0);
      o.push(a.range.map(d)), s = s.compose(c), r = Xe.mapEffects(r, c).concat(Xe.mapEffects(qi(a.effects), d));
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
    return e instanceof gt ? e : gt.of(e, this.doc.length, this.facet(_e.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return We.of(e.split(this.facet(_e.lineSeparator) || dl));
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
    return t == null ? e.default : (Ls(this, t), Uo(this, t));
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
    return _e.create({
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
    let t = _o.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof We ? e.doc : We.of((e.doc || "").split(t.staticFacet(_e.lineSeparator) || dl)), s = e.selection ? e.selection instanceof J ? e.selection : J.single(e.selection.anchor, e.selection.head) : J.single(0);
    return lh(s, n.length), t.staticFacet(vl) || (s = s.asSingle()), new _e(t, n, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(_e.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(_e.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(ph);
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
    for (let n of this.facet(_e.phrases))
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
    for (let o of this.facet(uh))
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
    return Fm(t.length ? t[0] : "");
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
      let a = Tt(t, r, !1);
      if (o(t.slice(a, r)) != Nn.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = Tt(t, l);
      if (o(t.slice(l, a)) != Nn.Word)
        break;
      l = a;
    }
    return r == l ? null : J.range(r + n, l + n);
  }
}
_e.allowMultipleSelections = vl;
_e.tabSize = /* @__PURE__ */ fe.define({
  combine: (i) => i.length ? i[0] : 4
});
_e.lineSeparator = ch;
_e.readOnly = ph;
_e.phrases = /* @__PURE__ */ fe.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
_e.languageData = uh;
_e.changeFilter = hh;
_e.transactionFilter = dh;
_e.transactionExtender = fh;
dr.reconfigure = /* @__PURE__ */ Xe.define();
function fr(i, e, t = {}) {
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
    return kl.create(e, t, this);
  }
}
Di.prototype.startSide = Di.prototype.endSide = 0;
Di.prototype.point = !1;
Di.prototype.mapMode = Vt.TrackDel;
function ra(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let kl = class vh {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new vh(e, t, n);
  }
};
function wl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class la {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return zi(this.to);
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
        let k = t.mapPos(f, h.startSide, h.mapMode);
        if (k == null || (y = v = k, h.startSide != h.endSide && (v = t.mapPos(f, h.endSide), v < y)))
          continue;
      } else if (y = t.mapPos(f, h.startSide), v = t.mapPos(m, h.endSide), y > v || y == v && h.startSide > 0 && h.endSide <= 0)
        continue;
      if (!((v - y || h.endSide - h.startSide) < 0))
        if (u < 0 && (u = y), h.point && (c = Math.max(c, v - y)), (y - n || h.startSide - s) >= 0)
          r.push(h), l.push(y - u), a.push(v - u), n = v, s = h.endSide;
        else {
          if (y == v)
            for (let k = r.length; k > 0; k--) {
              if ((y - (a[k - 1] + u) || h.startSide - r[k - 1].endSide) >= 0) {
                r.splice(k, 0, h), l.splice(k, 0, y - u), a.splice(k, 0, v - u);
                continue e;
              }
              if ((y - (l[k - 1] + u) || h.endSide - r[k - 1].startSide) > 0)
                break;
            }
          o(y, v, h);
        }
    }
    return { mapped: r.length ? new la(l, a, r, c) : null, pos: u };
  }
}
class Pe {
  constructor(e, t, n, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new Pe(e, t, n, s);
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
    if (n && (t = t.slice().sort(wl)), this.isEmpty)
      return t.length ? Pe.of(t) : this;
    let l = new yh(this, null, -1).goto(0), a = 0, u = [], c = new Ai();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        c.addInner(d.from, d.to, d.value, !1) || u.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(kl.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Pe.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
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
        let [h, f] = t.length ? [zi(n) + zi(t).length, zi(zi(t).value).endSide] : [-1, -1], { mapped: m, pos: y } = c.map(u, e, h, f, r);
        m && (s = Math.max(s, m.maxPoint), t.push(m), n.push(y));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Pe(n, t, l || Pe.empty, s);
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
    return Hs.from([this]).goto(e);
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
    return Hs.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, o = -1) {
    let r = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = cu(r, l, n), u = new gs(r, a, o), c = new gs(l, a, o);
    n.iterGaps((d, h, f) => hu(u, d, c, h, f, s)), n.empty && n.length == 0 && hu(u, 0, c, 0, 0, s);
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
    let l = cu(o, r), a = new gs(o, l, 0).goto(n), u = new gs(r, l, 0).goto(n);
    for (; ; ) {
      if (a.to != u.to || !xl(a.active, u.active) || a.point && (!u.point || !ra(a.point, u.point)))
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
    let r = new gs(e, null, o).goto(t), l = t, a = r.openStart;
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
    for (let s of e instanceof kl ? [e] : t ? Km(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Pe.empty;
    let t = zi(e);
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != Pe.empty; s = s.nextLayer)
        t = new Pe(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Pe.empty = /* @__PURE__ */ new Pe([], [], null, -1);
function zi(i) {
  return i[i.length - 1];
}
function Km(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (wl(e, n) > 0)
        return i.slice().sort(wl);
      e = n;
    }
  return i;
}
Pe.empty.nextLayer = Pe.empty;
class Ai {
  finishChunk(e) {
    this.chunks.push(new la(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
    return this.finishInner(Pe.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Pe.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function cu(i, e, t) {
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
class yh {
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
class Hs {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= n && s.push(new yh(r, t, n, o));
    return s.length == 1 ? s[0] : new Hs(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Hr(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Hr(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Hr(this.heap, 0);
    }
  }
}
function Hr(i, e) {
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
class gs {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Hs.from(e, t, n);
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
    oo(this.active, e), oo(this.activeTo, e), oo(this.activeRank, e), this.minActive = du(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    ro(this.active, t, n), ro(this.activeTo, t, s), ro(this.activeRank, t, o), e && ro(e, t, this.cursor.from), this.minActive = du(this.active, this.activeTo);
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
        this.removeActive(s), n && oo(n, s);
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
function hu(i, e, t, n, s, o) {
  i.goto(e), t.goto(n);
  let r = n + s, l = n, a = n - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let d = i.to + a - t.to, h = d || i.endSide - t.endSide, f = h < 0 ? i.to + a : t.to, m = Math.min(f, r);
    if (i.point || t.point ? (i.point && t.point && ra(i.point, t.point) && xl(i.activeForPoint(i.to), t.activeForPoint(t.to)) || o.comparePoint(l, m, i.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), m > l && !xl(i.active, t.active) && o.compareRange(l, m, i.active, t.active), u && m < r && (d || i.openEnd(f) != t.openEnd(f)) && (c = !0)), f > r)
      break;
    l = f, h <= 0 && i.next(), h >= 0 && t.next();
  }
}
function xl(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !ra(i[t], e[t]))
      return !1;
  return !0;
}
function oo(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function ro(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function du(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function pr(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = Tt(i, s));
  return n;
}
function _m(i, e, t, n) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == i.length)
      break;
    o += i.charCodeAt(s) == 9 ? t - o % t : 1, s = Tt(i, s);
  }
  return i.length;
}
const Sl = "ͼ", fu = typeof Symbol > "u" ? "__" + Sl : Symbol.for(Sl), Cl = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), pu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
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
    let e = pu[fu] || 1;
    return pu[fu] = e + 1, Sl + e.toString(36);
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
    let s = e[Cl], o = n && n.nonce;
    s ? o && s.setNonce(o) : s = new Um(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let mu = /* @__PURE__ */ new Map();
class Um {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = mu.get(n);
      if (o) return e[Cl] = o;
      this.sheet = new s.CSSStyleSheet(), mu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Cl] = this;
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
}, zs = {
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
}, Gm = typeof navigator < "u" && /Mac/.test(navigator.platform), jm = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var kt = 0; kt < 10; kt++) ai[48 + kt] = ai[96 + kt] = String(kt);
for (var kt = 1; kt <= 24; kt++) ai[kt + 111] = "F" + kt;
for (var kt = 65; kt <= 90; kt++)
  ai[kt] = String.fromCharCode(kt + 32), zs[kt] = String.fromCharCode(kt);
for (var zr in ai) zs.hasOwnProperty(zr) || (zs[zr] = ai[zr]);
function qm(i) {
  var e = Gm && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || jm && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? zs : ai)[i.keyCode] || i.key || "Unidentified";
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
  for (; e < arguments.length; e++) bh(i, arguments[e]);
  return i;
}
function bh(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) bh(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let Bt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Ml = typeof document < "u" ? document : { documentElement: { style: {} } };
const Al = /* @__PURE__ */ /Edge\/(\d+)/.exec(Bt.userAgent), kh = /* @__PURE__ */ /MSIE \d/.test(Bt.userAgent), Tl = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Bt.userAgent), mr = !!(kh || Tl || Al), gu = !mr && /* @__PURE__ */ /gecko\/(\d+)/i.test(Bt.userAgent), Wr = !mr && /* @__PURE__ */ /Chrome\/(\d+)/.exec(Bt.userAgent), vu = "webkitFontSmoothing" in Ml.documentElement.style, $l = !mr && /* @__PURE__ */ /Apple Computer/.test(Bt.vendor), yu = $l && (/* @__PURE__ */ /Mobile\/\w+/.test(Bt.userAgent) || Bt.maxTouchPoints > 2);
var oe = {
  mac: yu || /* @__PURE__ */ /Mac/.test(Bt.platform),
  windows: /* @__PURE__ */ /Win/.test(Bt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(Bt.platform),
  ie: mr,
  ie_version: kh ? Ml.documentMode || 6 : Tl ? +Tl[1] : Al ? +Al[1] : 0,
  gecko: gu,
  gecko_version: gu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  chrome: !!Wr,
  chrome_version: Wr ? +Wr[1] : 0,
  ios: yu,
  android: /* @__PURE__ */ /Android\b/.test(Bt.userAgent),
  webkit: vu,
  webkit_version: vu ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  safari: $l,
  safari_version: $l ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  tabSize: Ml.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function aa(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const Go = /* @__PURE__ */ Object.create(null);
function ua(i, e, t) {
  if (i == e)
    return !0;
  i || (i = Go), e || (e = Go);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (s.indexOf(o) == -1 || i[o] !== e[o]))
      return !1;
  return !0;
}
function Ym(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function bu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function Xm(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class Js {
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
var wt = /* @__PURE__ */ (function(i) {
  return i[i.Text = 0] = "Text", i[i.WidgetBefore = 1] = "WidgetBefore", i[i.WidgetAfter = 2] = "WidgetAfter", i[i.WidgetRange = 3] = "WidgetRange", i;
})(wt || (wt = {}));
class Ze extends Di {
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
    return new Zs(e);
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
      let { start: o, end: r } = wh(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Li(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Qs(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Pe.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
Ze.none = Pe.empty;
class Zs extends Ze {
  constructor(e) {
    let { start: t, end: n } = wh(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? aa(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Go;
  }
  eq(e) {
    return this == e || e instanceof Zs && this.tagName == e.tagName && ua(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Zs.prototype.point = !1;
class Qs extends Ze {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Qs && this.spec.class == e.spec.class && ua(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Qs.prototype.mapMode = Vt.TrackBefore;
Qs.prototype.point = !0;
class Li extends Ze {
  constructor(e, t, n, s, o, r) {
    super(t, n, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? Vt.TrackBefore : Vt.TrackAfter : Vt.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? wt.WidgetRange : this.startSide <= 0 ? wt.WidgetBefore : wt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Li && Jm(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
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
function wh(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function Jm(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function Yi(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Ws extends Di {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof Ws && this.tagName == e.tagName && ua(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Ws(e.tagName, e.attributes || Go, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Pe.of(e, t);
  }
}
Ws.prototype.startSide = Ws.prototype.endSide = -1;
function Fs(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Dl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Bs(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Dl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function Ro(i) {
  return i.nodeType == 3 ? Ks(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Os(i, e, t, n) {
  return t ? ku(i, e, t, n, -1) || ku(i, e, t, n, 1) : !1;
}
function ui(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function jo(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function ku(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : Wn(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let o = i.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ui(i) + (s < 0 ? 0 : 1), i = o;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? Wn(i) : 0;
    } else
      return !1;
  }
}
function Wn(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function qo(i, e) {
  let { left: t, right: n } = i;
  if (t == n)
    return i;
  let s = e ? t : n;
  return { left: s, right: s, top: i.top, bottom: i.bottom };
}
function Zm(i) {
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
function xh(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function Qm(i, e, t, n, s, o, r, l) {
  let a = i.ownerDocument, u = a.defaultView || window;
  for (let c = i, d = !1; c && !d; )
    if (c.nodeType == 1) {
      let h, f = c == a.body, m = 1, y = 1;
      if (f)
        h = Zm(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (d = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let w = c.getBoundingClientRect();
        ({ scaleX: m, scaleY: y } = xh(c, w)), h = {
          left: w.left,
          right: w.left + c.clientWidth * m,
          top: w.top,
          bottom: w.top + c.clientHeight * y
        };
      }
      let v = 0, k = 0;
      if (s == "nearest")
        e.top < h.top + r ? (k = e.top - (h.top + r), t > 0 && e.bottom > h.bottom + k && (k = e.bottom - h.bottom + r)) : e.bottom > h.bottom - r && (k = e.bottom - h.bottom + r, t < 0 && e.top - k < h.top && (k = e.top - (h.top + r)));
      else {
        let w = e.bottom - e.top, $ = h.bottom - h.top;
        k = (s == "center" && w <= $ ? e.top + w / 2 - $ / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - $ + r) - h.top;
      }
      if (n == "nearest" ? e.left < h.left + o ? (v = e.left - (h.left + o), t > 0 && e.right > h.right + v && (v = e.right - h.right + o)) : e.right > h.right - o && (v = e.right - h.right + o, t < 0 && e.left < h.left + v && (v = e.left - (h.left + o))) : v = (n == "center" ? e.left + (e.right - e.left) / 2 - (h.right - h.left) / 2 : n == "start" == l ? e.left - o : e.right - (h.right - h.left) + o) - h.left, v || k)
        if (f)
          u.scrollBy(v, k);
        else {
          let w = 0, $ = 0;
          if (k) {
            let P = c.scrollTop;
            c.scrollTop += k / y, $ = (c.scrollTop - P) * y;
          }
          if (v) {
            let P = c.scrollLeft;
            c.scrollLeft += v / m, w = (c.scrollLeft - P) * m;
          }
          e = {
            left: e.left - w,
            top: e.top - $,
            right: e.right - w,
            bottom: e.bottom - $
          }, w && Math.abs(w - v) < 1 && (n = "nearest"), $ && Math.abs($ - k) < 1 && (s = "nearest");
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
function Sh(i, e = !0) {
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
class eg {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Wn(t) : 0), n, Math.min(e.focusOffset, n ? Wn(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
function Ch(i) {
  let e = [];
  for (let t = i; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Mh(i, e = !0) {
  for (let { node: t, left: n, top: s } of i)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != n && (t.scrollLeft = n);
}
let bi = null;
oe.safari && oe.safari_version >= 26 && (bi = !1);
function Ah(i) {
  if (i.setActive)
    return i.setActive();
  if (bi)
    return i.focus(bi);
  let e = Ch(i);
  i.focus(bi == null ? {
    get preventScroll() {
      return bi = { preventScroll: !0 }, !0;
    }
  } : void 0), bi || (bi = !1, Mh(e));
}
let wu;
function Ks(i, e, t = e) {
  let n = wu || (wu = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function Xi(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, i.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, i.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function tg(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function ng(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, Wn(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = Wn(t));
    } else {
      if (t == i)
        return !0;
      n = ui(t), t = t.parentNode;
    }
}
function Th(i) {
  return i instanceof Window ? i.pageYOffset > Math.max(0, i.document.documentElement.scrollHeight - i.innerHeight - 4) : i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function $h(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = Wn(t);
    } else if (t.parentNode && !jo(t))
      n = ui(t), t = t.parentNode;
    else
      return null;
  }
}
function Dh(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !jo(t))
      n = ui(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class on {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new on(e.parentNode, ui(e), t);
  }
  static after(e, t) {
    return new on(e.parentNode, ui(e) + 1, t);
  }
}
var Je = /* @__PURE__ */ (function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
})(Je || (Je = {}));
const Bi = Je.LTR, ca = Je.RTL;
function Lh(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const ig = /* @__PURE__ */ Lh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), sg = /* @__PURE__ */ Lh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Ll = /* @__PURE__ */ Object.create(null), vn = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  Ll[e] = t, Ll[t] = -e;
}
function Bh(i) {
  return i <= 247 ? ig[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? sg[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const og = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class $n {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ca : Bi;
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
function Oh(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !Oh(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const qe = [];
function rg(i, e, t, n, s) {
  for (let o = 0; o <= n.length; o++) {
    let r = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Bh(i.charCodeAt(u));
      h == 512 ? h = c : h == 8 && d == 4 && (h = 16), qe[u] = h == 4 ? 2 : h, h & 7 && (d = h), c = h;
    }
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = qe[u];
      if (h == 128)
        u < l - 1 && c == qe[u + 1] && c & 24 ? h = qe[u] = c : qe[u] = 256;
      else if (h == 64) {
        let f = u + 1;
        for (; f < l && qe[f] == 64; )
          f++;
        let m = u && c == 8 || f < t && qe[f] == 8 ? d == 1 ? 1 : 8 : 256;
        for (let y = u; y < f; y++)
          qe[y] = m;
        u = f - 1;
      } else h == 8 && d == 1 && (qe[u] = 1);
      c = h, h & 7 && (d = h);
    }
  }
}
function lg(i, e, t, n, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= n.length; r++) {
    let u = r ? n[r - 1].to : e, c = r < n.length ? n[r].from : t;
    for (let d = u, h, f, m; d < c; d++)
      if (f = Ll[h = i.charCodeAt(d)])
        if (f < 0) {
          for (let y = l - 3; y >= 0; y -= 3)
            if (vn[y + 1] == -f) {
              let v = vn[y + 2], k = v & 2 ? s : v & 4 ? v & 1 ? o : s : 0;
              k && (qe[d] = qe[vn[y]] = k), l = y;
              break;
            }
        } else {
          if (vn.length == 189)
            break;
          vn[l++] = d, vn[l++] = h, vn[l++] = a;
        }
      else if ((m = qe[d]) == 2 || m == 1) {
        let y = m == s;
        a = y ? 0 : 1;
        for (let v = l - 3; v >= 0; v -= 3) {
          let k = vn[v + 2];
          if (k & 2)
            break;
          if (y)
            vn[v + 2] |= 2;
          else {
            if (k & 4)
              break;
            vn[v + 2] |= 4;
          }
        }
      }
  }
}
function ag(i, e, t, n) {
  for (let s = 0, o = n; s <= t.length; s++) {
    let r = s ? t[s - 1].to : i, l = s < t.length ? t[s].from : e;
    for (let a = r; a < l; ) {
      let u = qe[a];
      if (u == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (s == t.length)
              break;
            c = t[s++].to, l = s < t.length ? t[s].from : e;
          } else if (qe[c] == 256)
            c++;
          else
            break;
        let d = o == 1, h = (c < e ? qe[c] : n) == 1, f = d == h ? d ? 1 : 2 : n;
        for (let m = c, y = s, v = y ? t[y - 1].to : i; m > a; )
          m == v && (m = t[--y].from, v = y ? t[y - 1].to : i), qe[--m] = f;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Bl(i, e, t, n, s, o, r) {
  let l = n % 2 ? 2 : 1;
  if (n % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, d = !1;
      if (u == o.length || a < o[u].from) {
        let y = qe[a];
        y != l && (c = !1, d = y == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u < o.length && m == o[u].from) {
          if (d)
            break e;
          let y = o[u];
          if (!c)
            for (let v = y.to, k = u + 1; ; ) {
              if (v == t)
                break e;
              if (k < o.length && o[k].from == v)
                v = o[k++].to;
              else {
                if (qe[v] == l)
                  break e;
                break;
              }
            }
          if (u++, h)
            h.push(y);
          else {
            y.from > a && r.push(new $n(a, y.from, f));
            let v = y.direction == Bi != !(f % 2);
            Ol(i, v ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.to;
          }
          m = y.to;
        } else {
          if (m == t || (c ? qe[m] != l : qe[m] == l))
            break;
          m++;
        }
      h ? Bl(i, a, m, n + 1, s, h, r) : a < m && r.push(new $n(a, m, f)), a = m;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, d = !1;
      if (!u || a > o[u - 1].to) {
        let y = qe[a - 1];
        y != l && (c = !1, d = y == 16);
      }
      let h = !c && l == 1 ? [] : null, f = c ? n : n + 1, m = a;
      e: for (; ; )
        if (u && m == o[u - 1].to) {
          if (d)
            break e;
          let y = o[--u];
          if (!c)
            for (let v = y.from, k = u; ; ) {
              if (v == e)
                break e;
              if (k && o[k - 1].to == v)
                v = o[--k].from;
              else {
                if (qe[v - 1] == l)
                  break e;
                break;
              }
            }
          if (h)
            h.push(y);
          else {
            y.to < a && r.push(new $n(y.to, a, f));
            let v = y.direction == Bi != !(f % 2);
            Ol(i, v ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.from;
          }
          m = y.from;
        } else {
          if (m == e || (c ? qe[m - 1] != l : qe[m - 1] == l))
            break;
          m--;
        }
      h ? Bl(i, m, a, n + 1, s, h, r) : m < a && r.push(new $n(m, a, f)), a = m;
    }
}
function Ol(i, e, t, n, s, o, r) {
  let l = e % 2 ? 2 : 1;
  rg(i, s, o, n, l), lg(i, s, o, n, l), ag(s, o, n, l), Bl(i, s, o, e, t, n, r);
}
function ug(i, e, t) {
  if (!i)
    return [new $n(0, 0, e == ca ? 1 : 0)];
  if (e == Bi && !t.length && !og.test(i))
    return Eh(i.length);
  if (t.length)
    for (; i.length > qe.length; )
      qe[qe.length] = 256;
  let n = [], s = e == Bi ? 0 : 1;
  return Ol(i, s, s, t, 0, i.length, n), n;
}
function Eh(i) {
  return [new $n(0, i, 0)];
}
let Ih = "";
function cg(i, e, t, n, s) {
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
  let c = Tt(i.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Ih = i.text.slice(Math.min(r, c), Math.max(r, c));
  let d = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!d)
      return s ? J.cursor(i.to, 1) : J.cursor(i.from, -1);
    if (d.level + (s ? 0 : 1) < a.level)
      return J.cursor(d.side(!s, t) + i.from, d.forward(s, t) ? 1 : -1, d.level);
  }
  return J.cursor(c + i.from, a.forward(s, t) ? -1 : 1, a.level);
}
function hg(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Bh(i.charCodeAt(n));
    if (s == 1)
      return Bi;
    if (s == 2 || s == 4)
      return ca;
  }
  return Bi;
}
const Rh = /* @__PURE__ */ fe.define(), Ph = /* @__PURE__ */ fe.define(), Nh = /* @__PURE__ */ fe.define(), Vh = /* @__PURE__ */ fe.define(), El = /* @__PURE__ */ fe.define(), Hh = /* @__PURE__ */ fe.define(), zh = /* @__PURE__ */ fe.define(), ha = /* @__PURE__ */ fe.define(), da = /* @__PURE__ */ fe.define(), Wh = /* @__PURE__ */ fe.define({
  combine: (i) => i.some((e) => e)
}), Fh = /* @__PURE__ */ fe.define({
  combine: (i) => i.some((e) => e)
}), Kh = /* @__PURE__ */ fe.define();
class Ji {
  constructor(e, t, n, s, o, r = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new Ji(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Ji(J.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const lo = /* @__PURE__ */ Xe.define({ map: (i, e) => i.map(e) }), _h = /* @__PURE__ */ Xe.define();
function rn(i, e, t) {
  let n = i.facet(Vh);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const Rn = /* @__PURE__ */ fe.define({ combine: (i) => i.length ? i[0] : !0 });
let dg = 0;
const Fi = /* @__PURE__ */ fe.define({
  combine(i) {
    return i.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (i[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class _t {
  constructor(e, t, n, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(Fi.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(Fi.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: o, decorations: r } = t || {};
    return new _t(dg++, e, n, s, (l) => {
      let a = [];
      return r && a.push(gr.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : Ze.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return _t.define((n, s) => new e(n, s), t);
  }
}
class Fr {
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
const Uh = /* @__PURE__ */ fe.define(), fa = /* @__PURE__ */ fe.define(), gr = /* @__PURE__ */ fe.define(), Gh = /* @__PURE__ */ fe.define(), pa = /* @__PURE__ */ fe.define(), eo = /* @__PURE__ */ fe.define(), jh = /* @__PURE__ */ fe.define();
function xu(i, e) {
  let t = i.state.facet(jh);
  if (!t.length)
    return t;
  let n = t.map((o) => o instanceof Function ? o(i) : o), s = [];
  return Pe.spans(n, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, d = s;
      for (let h = l.length - 1; h >= 0; h--, a--) {
        let f = l[h].spec.bidiIsolate, m;
        if (f == null && (f = hg(e.text, u, c)), a > 0 && d.length && (m = d[d.length - 1]).to == u && m.direction == f)
          m.to = c, d = m.inner;
        else {
          let y = { from: u, to: c, direction: f, inner: [] };
          d.push(y), d = y.inner;
        }
      }
    }
  }), s;
}
const qh = /* @__PURE__ */ fe.define();
function ma(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let o of i.state.facet(qh)) {
    let r = o(i);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (n = Math.max(n, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const Cs = /* @__PURE__ */ fe.define();
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
class Yo {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = gt.empty(this.startState.doc.length);
    for (let o of n)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Xt(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Yo(e, t, n);
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
const fg = [];
class st {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return fg;
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
      t && Ym(this.dom, t);
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
      if (e instanceof yr)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class vr extends st {
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
          s = Su(s);
      else
        t.insertBefore(l.dom, s);
      n = l.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = Su(s);
    this.length = r;
  }
}
function Su(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class yr extends vr {
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
      let t = st.get(e);
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
        if (r instanceof Hn)
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
class Hn extends vr {
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
    let n = new Hn(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class es extends vr {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new es(t || document.createElement("div"), e);
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
        y >= d && (m.isComposite() ? a(m, d - f) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || n && mg(r, m))) && (y > d || m.flags & 32 && t <= 1) ? (r = m, l = d - f) : (f < d || m.flags & 16 && !m.isHidden && t >= -1) && (s = m, o = d - f)), f = y;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, n) : pg(this);
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
function pg(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = Ro(e);
  return t[t.length - 1] || null;
}
function mg(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Ht extends vr {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let n = new Ht(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Si extends st {
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
    e == 0 && t < 0 || e == s && t >= 0 ? oe.chrome || oe.gecko || (e ? (o--, l = 1) : r < s && (r++, l = -1)) : t < 0 ? o-- : r < s && r++;
    let a = Ks(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return oe.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), n == null ? u : qo(u, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new Si(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class Oi extends st {
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
      return qo(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return qo(r, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return We.empty;
    let { root: e } = this;
    if (!e)
      return We.empty;
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
class Xo extends st {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return We.empty;
  }
  coordsIn(e, t, n) {
    let s = this.dom.getBoundingClientRect();
    return n == null ? s : qo(s, t > 0 == n);
  }
}
class gg {
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
class vg {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class yg {
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
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Kr(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof Ht && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Kr(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && st.get(a.dom) && (c = Kr(a.dom));
        let d = Ht.of(a.mark, c);
        s.append(d), s = d;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = st.get(e.text);
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
    e || (e = Yh);
    let s = es.start(e, t || ((n = this.cache.find(es)) === null || n === void 0 ? void 0 : n.dom), !!t);
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
      if (t > 0 && (l = s.lastChild) && l instanceof Ht && l.mark.eq(r))
        s = l, t--;
      else {
        let a = Ht.of(r, (n = this.cache.find(Ht, (u) => u.mark.eq(r))) === null || n === void 0 ? void 0 : n.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Cu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(oe.ios && Cu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        _r,
        0,
        32
        /* TileFlag.After */
      ) || new Oi(
        _r.toDOM(),
        0,
        _r,
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
        let t = e.rank * 102 + e.value.rank, n = new vg(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      if (n.from < this.pos && s instanceof Hn && s.wrapper.eq(n.wrapper))
        t = s;
      else {
        let o = Hn.of(n.wrapper, (e = this.cache.find(Hn, (r) => r.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
      Xo,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new Xo(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class bg {
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
const Jo = [Oi, es, Si, Ht, Xo, Hn, yr];
for (let i = 0; i < Jo.length; i++)
  Jo[i].bucket = i;
class kg {
  constructor(e) {
    this.view = e, this.buckets = Jo.map(() => []), this.index = Jo.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
class wg {
  constructor(e, t, n, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new kg(e), this.text = new bg(e.state.doc), this.builder = new yg(this.cache, new yr(e, e.contentDOM), Pe.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new gg(t), this.reuseWalker = {
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
    let s = Cg(this.old), o = this.openMarks;
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
        else if (r instanceof Xo)
          this.cache.add(r);
        else if (r instanceof Ht)
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
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof Ht && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof Ht && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let n = null, s = this.builder, o = -1, r = Pe.spans(this.decorations, e, t, {
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
            let f = u.widget || (u.block ? ts.block : ts.inline), m = xg(u), y = this.cache.findWidget(f, a - l, m) || Oi.of(f, this.view, a - l, m);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(y)) : (s.ensureLine(n), s.addInlineWidget(y, c, d));
          }
          n = null;
        } else
          n = Sg(n, u);
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
      let o = st.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof Ht ? t.push(o) : o?.isLine() ? n = o : o instanceof Hn || (s.nodeName == "DIV" && !n ? n = new es(s, Yh) : n || t.push(Ht.of(new Zs({ tagName: s.nodeName.toLowerCase(), attributes: Xm(s) }), s)));
    }
    return n ? { line: n, marks: t } : null;
  }
}
function Cu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function xg(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const Yh = { class: "cm-line" };
function Sg(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && aa(t, i), n && (i.class += " " + n)), i;
}
function Cg(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Ht && e.push(n.mark);
  }
  return e;
}
function Kr(i) {
  let e = st.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class ts extends Js {
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
ts.inline = /* @__PURE__ */ new ts("span");
ts.block = /* @__PURE__ */ new ts("div");
const _r = /* @__PURE__ */ new class extends Js {
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
class Mu {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Ze.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new yr(e, e.contentDOM), this.updateInner([new Xt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: d }) => d < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Eg(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Ag(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: d } = this.hasComposition;
      n = new Xt(c, d, e.changes.mapPos(c, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (oe.ie || oe.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Dg(r, this.decorations, e.changes);
    a.length && (n = Xt.extendWithRanges(n, a));
    let u = Bg(l, this.blockWrappers, e.changes);
    return u.length && (n = Xt.extendWithRanges(n, u)), o && !n.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new wg(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && st.get(t.text) && l.cache.reused.set(
          st.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), Il(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = oe.chrome || oe.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Ur && s.push(o.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(_h) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, o = s == n, r = !o && !(this.view.state.facet(Rn) || n.tabIndex > -1) && Bs(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), oe.gecko && a.empty && !this.hasComposition && Mg(u)) {
      let h = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(h, u.node.childNodes[u.offset] || null)), u = c = new on(h, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Os(u.node, u.offset, d.anchorNode, d.anchorOffset) || !Os(c.node, c.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      oe.android && oe.chrome && n.contains(d.focusNode) && Og(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let h = Fs(this.view.root);
      if (h) if (a.empty) {
        if (oe.gecko) {
          let f = Tg(u.node, u.offset);
          if (f && f != 3) {
            let m = (f == 1 ? $h : Dh)(u.node, u.offset);
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
    return this.hasComposition && t.empty && Os(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = Fs(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = Wn(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
      for (; o && !st.get(o); )
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
    return s.isWidget() ? s.widget instanceof Ur ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, n);
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
        let l = Tt(o.text, r);
        if (l == r)
          return null;
        let a = Ks(o.dom, r, l).getClientRects();
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
    let t = [], { from: n, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Je.LTR, u = 0, c = (d, h, f) => {
      for (let m = 0; m < d.children.length && !(h > s); m++) {
        let y = d.children[m], v = h + y.length, k = y.dom.getBoundingClientRect(), { height: w } = k;
        if (f && !m && (u += k.top - f.top), y instanceof Hn)
          v > n && c(y, h, k);
        else if (h >= n && (u > 0 && t.push(-u), t.push(w + u), u = 0, r)) {
          let $ = y.dom.lastChild, P = $ ? Ro($) : [];
          if (P.length) {
            let R = P[P.length - 1], V = a ? R.right - k.left : k.right - R.left;
            V > l && (l = V, this.minWidth = o, this.minWidthFrom = h, this.minWidthTo = v);
          }
        }
        f && m == d.children.length - 1 && (u += f.bottom - k.bottom), h = v + y.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? Je.RTL : Je.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = Ro(u.dom);
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
      let r = Ro(t.firstChild)[0];
      n = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : n, t.remove();
    }), { lineHeight: n, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let n = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > n) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(n).top) / this.view.scaleY;
        e.push(Ze.replace({
          widget: new Ur(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(n, r));
      }
      if (!o)
        break;
      n = o.to + 1;
    }
    return Ze.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(gr).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, s = this.view.state.facet(pa).map((o, r) => {
      let l = typeof o == "function";
      return l && (n = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = n, t.push(Pe.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Gh).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(Kh))
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
    let o = ma(this.view), r = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (Qm(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Je.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Ch(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), Mh(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    Il(this.tile);
  }
}
function Il(i, e) {
  let t = e?.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      Il(n, e);
  }
}
function Mg(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function Xh(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = $h(t.focusNode, t.focusOffset), s = Dh(t.focusNode, t.focusOffset), o = n || s;
  if (s && n && s.node != n.node) {
    let l = st.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (i.docView.lastCompositionAfterCursor) {
      let a = st.get(n.node);
      !a || a.isText() && a.text != n.node.nodeValue || (o = s);
    }
  }
  if (i.docView.lastCompositionAfterCursor = o != n, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Ag(i, e, t) {
  let n = Xh(i, t);
  if (!n)
    return null;
  let { node: s, from: o, to: r } = n, l = s.nodeValue;
  if (/[\n\r]/.test(l) || i.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Xt(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Tg(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let $g = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Yi(e, t, this.changes);
  }
  comparePoint(e, t) {
    Yi(e, t, this.changes);
  }
  boundChange(e) {
    Yi(e, e, this.changes);
  }
};
function Dg(i, e, t) {
  let n = new $g();
  return Pe.compare(i, e, t, n), n.changes;
}
class Lg {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Yi(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    Yi(e, e, this.changes);
  }
}
function Bg(i, e, t) {
  let n = new Lg();
  return Pe.compare(i, e, t, n), n.changes;
}
function Og(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Eg(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Ur extends Js {
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
function Ig(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return J.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = Tt(s.text, o, !1) : l = Tt(s.text, o);
  let a = n(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = Tt(s.text, r, !1);
    if (n(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = Tt(s.text, l);
    if (n(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return J.undirectionalRange(r + s.from, l + s.from);
}
function Rg(i, e, t, n, s) {
  let o = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let l = i.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (i.defaultLineHeight - l) * 0.5) / l);
    o += a * i.viewState.heightOracle.lineLength;
  }
  let r = i.state.sliceDoc(t.from, t.to);
  return t.from + _m(r, o, i.state.tabSize);
}
function Rl(i, e, t) {
  let n = i.lineBlockAt(e);
  if (Array.isArray(n.type)) {
    let s;
    for (let o of n.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == wt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || n;
  }
  return n;
}
function Pg(i, e, t, n) {
  let s = Rl(i, e.head, e.assoc || -1), o = !n || s.type != wt.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = i.dom.getBoundingClientRect(), l = i.textDirectionAt(s.from), a = i.posAtCoords({
      x: t == (l == Je.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return J.cursor(a, t ? -1 : 1);
  }
  return J.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function Au(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), o = i.bidiSpans(s), r = i.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = cg(s, o, r, l, t), c = Ih;
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
function Ng(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (o) => {
    let r = n(o);
    return s == Nn.Space && (s = r), s == r;
  };
}
function Vg(i, e, t, n) {
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
    let y = l + (f + m) * o, v = Pl(i, { x: d, y }, !1, o);
    if (t ? y > a.bottom : y < a.top)
      return J.cursor(v.pos, v.assoc);
    let k = i.coordsAtPos(v.pos, v.assoc), w = k ? (k.top + k.bottom) / 2 : 0;
    if (!k || (t ? w > l : w < l))
      return J.cursor(v.pos, v.assoc, void 0, r);
  }
}
function Es(i, e, t) {
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
function Jh(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], o = null;
    if (s.empty) {
      let r = Es(i, s.from, 0);
      r != s.from && (o = J.cursor(r, -1));
    } else {
      let r = Es(i, s.from, -1), l = Es(i, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = J.undirectionalRange(s.from, s.to) : o = J.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? J.create(t, e.mainIndex) : e;
}
function Gr(i, e, t) {
  let n = Es(i.state.facet(eo).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : J.cursor(n, n < t.from ? 1 : -1);
}
class Tn {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Pl(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), o = s.top + i.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new Tn(0, 1);
    if (a > i.viewState.docHeight)
      return new Tn(i.state.doc.length, -1);
    if (u = i.elementAtHeight(a), n == null)
      break;
    if (u.type == wt.Text) {
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
    if (u.type == wt.Text) {
      let d = Rg(i, s, u, r, l);
      return new Tn(d, d == u.from ? 1 : -1);
    }
  }
  if (u.type != wt.Text)
    return a < (u.top + u.bottom) / 2 ? new Tn(u.from, 1) : new Tn(u.to, -1);
  let c = i.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = i.docView.lineAt(u.from, -2)), new Hg(i, r, l, i.textDirectionAt(u.from)).scanTile(c, u.from);
}
class Hg {
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
        for (let w = 1; w < m; w++) {
          let $ = y + w;
          if ($ >= o && ($ -= m), !r.has($)) {
            y = $;
            break t;
          }
        }
        break e;
      }
      r.add(y);
      let v = t(y), k = 0;
      if (v)
        for (let w = 0; w < v.length; w++) {
          let $ = v[w];
          if (!($.width == 0 && v.length > 1))
            if ($.bottom < this.y)
              (!a || a.bottom < $.bottom) && (a = $), k = 1;
            else if ($.top > this.y)
              (!u || u.top > $.top) && (u = $), k = -1;
            else {
              let P = $.left > this.x ? this.x - $.left : $.right < this.x ? this.x - $.right : 0, R = Math.abs(P);
              R < d && (c = y, d = R, h = $), P && (k = P < 0 == (this.baseDir == Je.LTR) ? -1 : 1);
            }
        }
      k == -1 && (!l || this.baseDirAt(e[y], 1)) ? o = y : k == 1 && (!l || this.baseDirAt(e[y + 1], -1)) && (s = y + 1);
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
    let f = (l ? this.dirAt(e[c], 1) : this.baseDir) == Je.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (h.left + h.right) / 2 == f
    };
  }
  scanText(e, t) {
    let n = [];
    for (let o = 0; o < e.length; o = Tt(e.text, o))
      n.push(t + o);
    n.push(t + e.length);
    let s = this.scan(n, (o) => {
      let r = n[o] - t, l = n[o + 1] - t;
      return Ks(e.dom, r, l).getClientRects();
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : Ks(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = n[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new Tn(n[s.i + 1], -1) : new Tn(r, 1);
  }
}
const Wi = "￿";
class zg {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(_e.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Wi;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(n, s);
      let o = this.text.length;
      this.readNode(s);
      let r = st.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = st.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : jo(s)) || jo(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !Fg(l, t) && this.lineBreak(), s = l;
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
    let t = st.get(e), n = t && t.overrideDOMText;
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
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (Wg(e, n.node, n.offset) ? t : 0));
  }
}
function Wg(i, e, t) {
  for (; ; ) {
    if (!e || t < Wn(e))
      return !1;
    if (e == i)
      return !0;
    t = ui(e) + 1, e = e.parentNode;
  }
}
function Fg(i, e) {
  let t;
  for (; !(i == e || !i); i = i.nextSibling) {
    let n = st.get(i);
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
class Tu {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Kg {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = Zh(e.docView.tile, t, n, 0))) {
      let a = o || r ? [] : Ug(e), u = new zg(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = Gg(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Dl(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Dl(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((oe.ios || oe.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let h = Math.min(u, c), f = Math.max(u, c), m = d.from - h, y = d.to - f;
        (m == 0 || m == 1 || h == 0) && (y == 0 || y == -1 || f == e.state.doc.length) && (u = 0, c = e.state.doc.length);
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
function Zh(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = n, c = n; a < i.children.length; a++) {
      let d = i.children[a], h = u + d.length;
      if (u < e && h > t)
        return Zh(d, e, t, u);
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
function Qh(i, e) {
  let t, { newSel: n } = e, { state: s } = i, o = s.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || oe.android && e.text.length < a - l) && (u = o.to, c = "end");
    let d = s.doc.sliceString(l, a, Wi), h, f;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(h = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: We.of(e.text.slice(o.from - l, h).split(Wi))
    } : (f = ed(d, e.text, u - l, c)) && (oe.chrome && r == 13 && f.toB == f.from + 2 && e.text.slice(f.from, f.toB) == Wi + Wi && f.toB--, t = {
      from: l + f.from,
      to: l + f.toA,
      insert: We.of(e.text.slice(f.from, f.toB).split(Wi))
    });
  } else n && (!i.hasFocus && s.facet(Rn) || Zo(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((oe.mac || oe.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = J.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: We.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && i.docView.lineHasWidget(o.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(i.inputState.insertingText)
  } : oe.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = J.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: We.of([" "]) }), t)
    return ga(i, t, n, r);
  if (n && !Zo(n, o)) {
    let l = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (l = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = Jh(s.facet(eo).map((u) => u(i)), n))), i.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function ga(i, e, t, n = -1) {
  if (oe.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (oe.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Xi(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && Xi(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && Xi(i.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let r, l = () => r || (r = _g(i, e, t));
  return i.state.facet(Hh).some((a) => a(i, e.from, e.to, o, l)) || i.dispatch(l()), !0;
}
function _g(i, e, t) {
  let n, s = i.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Es(s.facet(eo).map((d) => d(i)), u, a);
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
      let c = i.state.sliceDoc(e.from, e.to), d, h = t && Xh(i, t.main.head);
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
        let k = s.changes({ from: v, to: y, insert: e.insert }), w = m.to - o.to;
        return {
          changes: k,
          range: u ? J.range(Math.max(0, u.anchor + w), Math.max(0, u.head + w)) : m.map(k)
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
function ed(i, e, t, n) {
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
function Ug(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o } = i.observer.selectionRange;
  return t && (e.push(new Tu(t, n)), (s != t || o != n) && e.push(new Tu(s, o))), e;
}
function Gg(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t < 0 || n < 0 ? null : t == n ? J.create([J.cursor(n + e, -1)]) : J.single(t + e, n + e);
}
function Zo(i, e) {
  return e.head == i.main.head && e.anchor == i.main.anchor;
}
class jg {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, oe.safari && e.contentDOM.addEventListener("input", () => null), oe.gecko && uv(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !nv(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = Yg(e), n = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && nd.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), oe.android && oe.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (oe.ios && !e.synthetic && !e.altKey && !e.metaKey && (td.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || Xg.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && oe.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && qg(this.view.win) && (t.shiftKey = !1);
      let n = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == n && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Xi(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : oe.safari && !oe.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
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
function qg(i) {
  return i.visualViewport ? i.visualViewport.height * i.visualViewport.scale / i.document.documentElement.clientHeight < 0.85 : !1;
}
function $u(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      rn(t.state, s);
    }
  };
}
function Yg(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push($u(n.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push($u(n.value, a));
      }
  }
  for (let n in un)
    t(n).handlers.push(un[n]);
  for (let n in Et)
    t(n).observers.push(Et[n]);
  return e;
}
const td = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Xg = "dthko", nd = [16, 17, 18, 20, 91, 92, 224, 225], ao = 6;
function uo(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function Jg(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class Zg {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Sh(e.contentDOM), this.atoms = e.state.facet(eo).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(_e.allowMultipleSelections) && Qg(e, t), this.dragging = tv(e, t) && od(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && Jg(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = ma(this.view);
    e.clientX - a.left <= s + ao ? t = -uo(s - e.clientX) : e.clientX + a.right >= r - ao && (t = uo(e.clientX - r)), e.clientY - a.top <= o + ao ? n = -uo(o - e.clientY) : e.clientY + a.bottom >= l - ao && (n = uo(e.clientY - l)), this.setScrollSpeed(t, n);
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
    let { view: t } = this, n = Jh(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Qg(i, e) {
  let t = i.state.facet(Rh);
  return t.length ? t[0](e) : oe.mac ? e.metaKey : e.ctrlKey;
}
function ev(i, e) {
  let t = i.state.facet(Ph);
  return t.length ? t[0](e) : oe.mac ? !e.altKey : !e.ctrlKey;
}
function tv(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = Fs(i.root);
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
function nv(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = st.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const un = /* @__PURE__ */ Object.create(null), Et = /* @__PURE__ */ Object.create(null), id = oe.ie && oe.ie_version < 15 || oe.ios && oe.webkit_version < 604;
function iv(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), sd(i, t.value);
  }, 50);
}
function br(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function sd(i, e) {
  e = br(i.state, ha, e);
  let { state: t } = i, n, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Nl != null && t.selection.ranges.every((a) => a.empty) && Nl == o.toString()) {
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
Et.scroll = (i) => {
  let e = i.inputState;
  e.lastScrollTop = i.scrollDOM.scrollTop, e.lastScrollLeft = i.scrollDOM.scrollLeft, oe.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Et.wheel = Et.mousewheel = (i) => {
  i.inputState.lastWheelEvent = Date.now();
};
un.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
Et.touchstart = (i, e) => {
  let t = i.inputState, n = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), n && (t.lastTouchX = n.clientX, t.lastTouchY = n.clientY), t.setSelectionOrigin("select.pointer");
};
Et.touchmove = (i) => {
  i.inputState.setSelectionOrigin("select.pointer");
};
Et.touchend = (i, e) => {
  i.inputState.touchActive = !1;
};
un.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(Nh))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = ov(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new Zg(i, e, t, n)), n && i.observer.ignore(() => {
      Ah(i.contentDOM);
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
function Du(i, e, t, n) {
  if (n == 1)
    return J.cursor(e, t);
  if (n == 2)
    return Ig(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), o = i.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < i.state.doc.length && l == o.to && l++, J.undirectionalRange(r, l);
  }
}
const sv = oe.ie && oe.ie_version <= 11;
let Lu = null, Bu = 0, Ou = 0;
function od(i) {
  if (!sv)
    return i.detail;
  let e = Lu, t = Ou;
  return Lu = i, Ou = Date.now(), Bu = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Bu + 1) % 3 : 1;
}
function ov(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = od(e), s = i.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = i.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Du(i, a.pos, a.assoc, n);
      if (t.pos != a.pos && !r) {
        let d = Du(i, t.pos, t.assoc, n), h = Math.min(d.from, c.from), f = Math.max(d.to, c.to);
        c = h < c.from ? J.range(h, f, c.assoc) : J.range(f, h, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && n == 1 && s.ranges.length > 1 && (u = rv(s, a.pos)) ? u : l ? s.addRange(c) : J.create([c]);
    }
  };
}
function rv(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return J.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
un.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = J.undirectionalRange(o, r));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", br(i.state, da, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
un.dragend = (i) => (i.inputState.draggedContent = null, !1);
function Eu(i, e, t, n) {
  if (t = br(i.state, ha, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = i.inputState, r = n && o && ev(i, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = i.state.changes(r ? [r, l] : l);
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
      ++s == t.length && Eu(i, e, n.filter((r) => r != null).join(i.state.lineBreak), !1);
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
      return Eu(i, e, n, !0), !0;
  }
  return !1;
};
un.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = id ? null : e.clipboardData;
  return t ? (sd(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (iv(i), !1);
};
function lv(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function av(i) {
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
  return { text: br(i, da, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let Nl = null;
un.copy = un.cut = (i, e) => {
  if (!Bs(i.contentDOM, i.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: s } = av(i.state);
  if (!t && !s)
    return !1;
  Nl = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = id ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (lv(i, t), !1);
};
const rd = /* @__PURE__ */ cs.define();
function ld(i, e) {
  let t = [];
  for (let n of i.facet(zh)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: rd.of(!0) }) : null;
}
function ad(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = ld(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
Et.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), ad(i);
};
Et.blur = (i) => {
  i.observer.clearSelectionRange(), ad(i);
};
Et.compositionstart = Et.compositionupdate = (i) => {
  if (!i.observer.editContext && (i.inputState.compositionFirstChange == null && (i.inputState.compositionFirstChange = !0), i.inputState.composing < 0)) {
    let { main: e } = i.state.selection;
    !e.empty && i.lineBlockAt(e.from).from != i.lineBlockAt(e.to).from && i.dispatch({
      changes: i.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), i.inputState.composing = 0;
  }
};
Et.compositionend = (i) => {
  i.observer.editContext || (i.inputState.composing = -1, i.inputState.compositionEndedAt = Date.now(), i.inputState.compositionPendingKey = !0, i.inputState.compositionPendingChange = i.observer.pendingRecords().length > 0, i.inputState.compositionFirstChange = null, oe.chrome && oe.android ? i.observer.flushSoon() : i.inputState.compositionPendingChange ? Promise.resolve().then(() => i.observer.flush()) : setTimeout(() => {
    i.inputState.composing < 0 && i.docView.hasComposition && i.update([]);
  }, 50));
};
Et.contextmenu = (i) => {
  i.inputState.lastContextMenu = Date.now();
};
un.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = i.posAtDOM(l.startContainer, l.startOffset), u = i.posAtDOM(l.endContainer, l.endOffset);
      return ga(i, { from: a, to: u, insert: i.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (oe.chrome && oe.android && (s = td.find((o) => o.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return oe.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), oe.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => Et.compositionend(i, e), 20), !1;
};
const Iu = /* @__PURE__ */ new Set();
function uv(i) {
  Iu.has(i) || (Iu.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Ru = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let ns = !1;
function Pu() {
  ns = !1;
}
class cv {
  constructor(e) {
    this.lineWrapping = e, this.doc = We.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
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
    return Ru.indexOf(e) > -1 != this.lineWrapping;
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
    let l = Ru.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class hv {
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
    return typeof this._content == "number" ? wt.Text : Array.isArray(this._content) ? this._content : this._content.type;
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
var Ye = /* @__PURE__ */ (function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
})(Ye || (Ye = {}));
const Po = 1e-3;
class Ot {
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
    this.height != e && (Math.abs(this.height - e) > Po && (ns = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, n) {
    return Ot.of(n);
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
      let { fromA: a, toA: u, fromB: c, toB: d } = s[l], h = o.lineAt(a, Ye.ByPosNoHeight, n.setDoc(t), 0, 0), f = h.to >= u ? h : o.lineAt(u, Ye.ByPosNoHeight, n, 0, 0);
      for (d += f.to - u, u = f.to; l > 0 && h.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < h.from && (h = o.lineAt(a, Ye.ByPosNoHeight, n, 0, 0));
      c += h.from - a, a = h.from;
      let m = va.build(n.setDoc(r), e, c, d);
      o = Qo(o, o.replace(a, u, m));
    }
    return o.updateHeight(n, 0);
  }
  static empty() {
    return new Kt(0, 0, 0);
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, n++), new fv(Ot.of(e.slice(0, t)), r, Ot.of(e.slice(n)));
  }
}
function Qo(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (ns = !0), e);
}
Ot.prototype.size = 1;
const dv = /* @__PURE__ */ Ze.replace({});
class ud extends Ot {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new sn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new sn(s, 0, n, this.spaceAbove, dv) : this.mainBlock(n, s);
  }
  lineAt(e, t, n, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, n, s, o).join(r) : r;
  }
  forEachLine(e, t, n, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, Ye.ByPos, n, s, o));
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
class Kt extends ud {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new sn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let s = n[0];
    return n.length == 1 && (s instanceof Kt || s instanceof bt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof bt ? s = new Kt(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : Ot.of(n);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class bt extends Ot {
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
    if (t == Ye.ByHeight)
      return this.blockAt(e, n, s, o);
    if (t == Ye.ByPosNoHeight) {
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
      o instanceof bt ? n[n.length - 1] = new bt(o.length + s) : n.push(null, new bt(s - 1));
    }
    if (e > 0) {
      let o = n[0];
      o instanceof bt ? n[0] = new bt(e + o.length) : n.unshift(new bt(e - 1), null);
    }
    return Ot.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new bt(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new bt(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new bt(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let d = s.heights[s.index++], h = 0;
        d < 0 && (h = -d, d = s.heights[s.index++]), a == -1 ? a = d : Math.abs(d - a) >= Po && (a = -2);
        let f = new Kt(c, d, h);
        f.outdated = !1, r.push(f), l += c + 1;
      }
      l <= o && r.push(null, new bt(o - l).updateHeight(e, l));
      let u = Ot.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= Po || Math.abs(a - this.heightMetrics(e, t).perLine) >= Po) && (ns = !0), Qo(this, u);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class fv extends Ot {
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
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == Ye.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, n, s, o) : this.right.lineAt(e, t, n, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == Ye.ByPosNoHeight ? Ye.ByPosNoHeight : Ye.ByPos;
    return a ? u.join(this.right.lineAt(l, c, n, r, l)) : this.left.lineAt(l, c, n, s, o).join(u);
  }
  forEachLine(e, t, n, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, n, s, o, r), t >= a && this.right.forEachLine(e, t, n, l, a, r);
    else {
      let u = this.lineAt(a, Ye.ByPos, n, s, o);
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
    if (e > 0 && Nu(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), Nu(o, l);
    }
    return Ot.of(o);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? Ot.of(this.break ? [e, null, t] : [e, t]) : (this.left = Qo(this.left, e), this.right = Qo(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, n, s) : o.updateHeight(e, t, n), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, n, s) : r.updateHeight(e, l, n), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function Nu(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof bt && (n = i[e + 1]) instanceof bt && i.splice(e - 1, 3, new bt(t.length + 1 + n.length));
}
const pv = 5;
class va {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof Kt ? s.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new Kt(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let s = n.widget ? n.widget.estimatedHeight : 0, o = n.widget ? n.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      n.block ? this.addBlock(new ud(r, s, n)) : (r || o || s >= pv) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Kt(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new bt(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Kt)
      return e;
    let t = new Kt(0, -1, 0);
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
    this.lineStart > -1 && !(t instanceof Kt) && !this.isCovered ? this.nodes.push(new Kt(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let s of this.nodes)
      s instanceof Kt && s.updateHeight(this.oracle, n), n += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, s) {
    let o = new va(n, e);
    return Pe.spans(t, n, s, o, 0), o.finish(n);
  }
}
function mv(i, e, t) {
  let n = new gv();
  return Pe.compare(i, e, t, n, 0), n.changes;
}
class gv {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && Yi(e, t, this.changes, 5);
  }
}
function vv(i, e) {
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
function yv(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function bv(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class jr {
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
    return Ze.replace({
      widget: new kv(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class kv extends Js {
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
class Vu {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Hu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Je.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(fa).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new cv(n), this.stateDeco = zu(t), this.heightMap = Ot.empty().applyChanges(this.stateDeco, We.empty, this.heightOracle.setDoc(t.doc), [new Xt(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = Ze.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let n = 0; n <= 1; n++) {
      let s = n ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new co(o, r));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Hu : new ya(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Ms(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = zu(this.state);
    let s = e.changedRanges, o = Xt.extendWithRanges(s, mv(n, this.stateDeco, e ? e.changes : gt.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Pu(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || ns) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Fh) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? Je.RTL : Je.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: R, scaleY: V } = xh(t, l);
      (R > 5e-3 && Math.abs(this.scaleX - R) > 5e-3 || V > 5e-3 && Math.abs(this.scaleY - V) > 5e-3) && (this.scaleX = R, this.scaleY = V, u |= 16, r = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, h = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != h) && (this.paddingTop = d, this.paddingBottom = h, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let f = Sh(this.view.contentDOM, !1).y;
    f != this.scrollParent && (this.scrollParent = f, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let m = this.getScrollOffset();
    this.scrollOffset != m && (this.scrollAnchorHeight = -1, this.scrollOffset = m), this.scrolledToBottom = Th(this.scrollParent || e.win);
    let y = (this.printing ? bv : vv)(t, this.paddingTop), v = y.top - this.pixelViewport.top, k = y.bottom - this.pixelViewport.bottom;
    this.pixelViewport = y;
    let w = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (w != this.inView && (this.inView = w, w && (a = !0)), !this.inView && !this.scrollTarget && !yv(e.dom))
      return 0;
    let $ = l.width;
    if ((this.contentDOMWidth != $ || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let R = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(R) && (r = !0), r || s.lineWrapping && Math.abs($ - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: V, charWidth: E, textHeight: _ } = e.docView.measureTextSize();
        r = V > 0 && s.refresh(o, V, E, _, Math.max(5, $ / E), R), r && (e.docView.minWidth = 0, u |= 16);
      }
      v > 0 && k > 0 ? c = Math.max(v, k) : v < 0 && k < 0 && (c = Math.min(v, k)), Pu();
      for (let V of this.viewports) {
        let E = V.from == this.viewport.from ? R : e.docView.measureVisibleLineHeights(V);
        this.heightMap = (r ? Ot.empty().applyChanges(this.stateDeco, We.empty, this.heightOracle, [new Xt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new hv(V.from, E));
      }
      ns && (u |= 2);
    }
    let P = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return P && (u & 2 && (u |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), u |= this.updateForViewport()), (u & 2 || P) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(r ? [] : this.lineGaps, e)), u |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), u;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new co(s.lineAt(r - n * 1e3, Ye.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - n) * 1e3, Ye.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = s.lineAt(u, Ye.ByPos, o, 0, 0), h;
        t.y == "center" ? h = (d.top + d.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? h = d.top : h = d.bottom - c, a = new co(s.lineAt(h - 1e3 / 2, Ye.ByHeight, o, 0, 0).from, s.lineAt(h + c + 1e3 / 2, Ye.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new co(this.heightMap.lineAt(n, Ye.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, Ye.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, n = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, Ye.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, Ye.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
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
      t.touchesRange(s.from, s.to) || n.push(new jr(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
    if (this.defaultTextDirection != Je.LTR && !n)
      return [];
    let l = [], a = (c, d, h, f) => {
      if (d - c < o)
        return;
      let m = this.state.selection.main, y = [m.from];
      m.empty || y.push(m.to);
      for (let k of y)
        if (k > c && k < d) {
          a(c, k - 10, h, f), a(k + 10, d, h, f);
          return;
        }
      let v = xv(e, (k) => k.from >= h.from && k.to <= h.to && Math.abs(k.from - c) < o && Math.abs(k.to - d) < o && !y.some((w) => k.from < w && k.to > w));
      if (!v) {
        if (d < h.to && t && n && t.visibleRanges.some(($) => $.from <= d && $.to >= d)) {
          let $ = t.moveToLineBoundary(J.cursor(d), !1, !0).head;
          $ > c && (d = $);
        }
        let k = this.gapSize(h, c, d, f), w = n || k < 2e6 ? k : 2e6;
        v = new jr(c, d, k, w);
      }
      l.push(v);
    }, u = (c) => {
      if (c.length < r || c.type != wt.Text)
        return;
      let d = wv(c.from, c.to, this.stateDeco);
      if (d.total < r)
        return;
      let h = this.scrollTarget ? this.scrollTarget.range.head : null, f, m;
      if (n) {
        let y = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, v, k;
        if (h != null) {
          let w = fo(d, h), $ = ((this.visibleBottom - this.visibleTop) / 2 + y) / c.height;
          v = w - $, k = w + $;
        } else
          v = (this.visibleTop - c.top - y) / c.height, k = (this.visibleBottom - c.top + y) / c.height;
        f = ho(d, v), m = ho(d, k);
      } else {
        let y = d.total * this.heightOracle.charWidth, v = s * this.heightOracle.charWidth, k = 0;
        if (y > 2e6)
          for (let V of e)
            V.from >= c.from && V.from < c.to && V.size != V.displaySize && V.from * this.heightOracle.charWidth + k < this.pixelViewport.left && (k = V.size - V.displaySize);
        let w = this.pixelViewport.left + k, $ = this.pixelViewport.right + k, P, R;
        if (h != null) {
          let V = fo(d, h), E = (($ - w) / 2 + v) / y;
          P = V - E, R = V + E;
        } else
          P = (w - v) / y, R = ($ + v) / y;
        f = ho(d, P), m = ho(d, R);
      }
      f > c.from && a(c.from, f, c, d), m < c.to && a(m, c.to, c, d);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, n, s) {
    let o = fo(s, n) - fo(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    jr.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Ze.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    Pe.spans(t, this.viewport.from, this.viewport.to, {
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Ms(this.heightMap.lineAt(e, Ye.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Ms(this.heightMap.lineAt(this.scaler.fromDOM(e), Ye.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Ms(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class co {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function wv(i, e, t) {
  let n = [], s = i, o = 0;
  return Pe.spans(t, i, e, {
    span() {
    },
    point(r, l) {
      r > s && (n.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), o += e - s), { total: o, ranges: n };
}
function ho({ total: i, ranges: e }, t) {
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
function fo(i, e) {
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
function xv(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const Hu = {
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
function zu(i) {
  let e = i.facet(gr).filter((n) => typeof n != "function"), t = i.facet(pa).filter((n) => typeof n != "function");
  return t.length && e.push(Pe.join(t)), e;
}
class ya {
  constructor(e, t, n) {
    let s = 0, o = 0, r = 0;
    this.viewports = n.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, Ye.ByPos, e, 0, 0).top, c = t.lineAt(a, Ye.ByPos, e, 0, 0).bottom;
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
    return e instanceof ya ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Ms(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new sn(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Ms(s, e)) : i._content);
}
const po = /* @__PURE__ */ fe.define({ combine: (i) => i.join(" ") }), Vl = /* @__PURE__ */ fe.define({ combine: (i) => i.indexOf(!0) > -1 }), Hl = /* @__PURE__ */ li.newName(), cd = /* @__PURE__ */ li.newName(), hd = /* @__PURE__ */ li.newName(), dd = { "&light": "." + cd, "&dark": "." + hd };
function zl(i, e, t) {
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
const Sv = /* @__PURE__ */ zl("." + Hl, {
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
}, dd), Cv = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, qr = oe.ie && oe.ie_version <= 11;
class Mv {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new eg(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (oe.ie && oe.ie_version <= 11 || oe.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && oe.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(oe.chrome && oe.chrome_version < 126) && (this.editContext = new Tv(e), e.state.facet(Rn) && (e.contentDOM.editContext = this.editContext.editContext)), qr && (this.onCharData = (t) => {
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
    if (n.state.facet(Rn) ? n.root.activeElement != this.dom : !Bs(this.dom, s))
      return;
    let o = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (oe.ie && oe.ie_version <= 11 || oe.android && oe.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Os(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = Fs(e.root);
    if (!t)
      return !1;
    let n = oe.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Av(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = Bs(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && ng(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, Cv), qr && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), qr && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && Xi(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && Bs(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Kg(this.view, e, t, n);
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
    let n = this.view.state, s = Qh(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !Zo(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = Wu(t, e.previousSibling || e.target.previousSibling, -1), s = Wu(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(Rn) != e.state.facet(Rn) && (e.view.contentDOM.editContext = e.state.facet(Rn) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Wu(i, e, t) {
  for (; e; ) {
    let n = st.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Fu(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, o = e.endOffset, r = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Os(r.node, r.offset, s, o) && ([t, n, s, o] = [s, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o };
}
function Av(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return Fu(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? Fu(i, t) : null;
}
class Tv {
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
      let c = ed(e.state.sliceDoc(l, a), n.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let h = J.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        Zo(h, s) || e.dispatch({ selection: h, userEvent: "select" });
        return;
      }
      let d = {
        from: c.from + l,
        to: c.toA + l,
        insert: We.of(n.text.slice(c.from, c.toB).split(`
`))
      };
      if ((oe.mac || oe.android) && d.from == r - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (d = { from: l, to: a, insert: We.of([n.text.replace(".", " ")]) }), this.pendingContextChange = d, !e.state.readOnly) {
        let h = this.to - this.from + (d.to - d.from + d.insert.length);
        ga(e, d, J.single(this.toEditorPos(n.selectionStart, h), this.toEditorPos(n.selectionEnd, h)));
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
            s.push(Ze.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: _h.of(Ze.set(s)) });
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
      let s = Fs(n.root);
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
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((o) => n(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || tg(e.parent) || document, this.viewState = new Vu(this, e.state || _e.create(e)), e.scrollTo && e.scrollTo.is(lo) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(Fi).map((s) => new Fr(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Mv(this), this.inputState = new jg(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Mu(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof $t ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
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
    e.some((h) => h.annotation(rd)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = ld(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(_e.phrases) != this.state.facet(_e.phrases))
      return this.setState(o);
    s = Yo.create(this, o, e), s.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let h of e) {
        if (d && (d = d.map(h.changes)), h.scrollIntoView) {
          let { main: f } = h.state.selection, { x: m, y } = this.state.facet(ye.cursorScrollMargin);
          d = new Ji(f.empty ? f : J.cursor(f.head, f.head > f.anchor ? -1 : 1), "nearest", "nearest", y, m);
        }
        for (let f of h.effects)
          f.is(lo) && (d = f.value.clip(this.state));
      }
      this.viewState.update(s, d), this.bidiCache = er.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Cs) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((h) => h.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(po) != s.state.facet(po) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let h of this.state.facet(El))
        try {
          h(s);
        } catch (f) {
          rn(this.state, f, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !Qh(this, c) && u.force && Xi(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new Vu(this, e), this.plugins = e.facet(Fi).map((n) => new Fr(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new Mu(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Fi), n = e.state.facet(Fi);
    if (t != n) {
      let s = [];
      for (let o of n) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new Fr(o));
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
          if (Th(n || this.win))
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
            return rn(this.state, y), Ku;
          }
        }), h = Yo.create(this, this.state, []), f = !1;
        h.flags |= u, t ? t.flags |= u : t = h, this.updateState = 2, h.empty || (this.updatePlugins(h), this.inputState.update(h), this.updateAttrs(), f = this.docView.update(h), f && this.docViewUpdate());
        for (let m = 0; m < c.length; m++)
          if (d[m] != Ku)
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
              if ((y > 1 || y < -1) && !(oe.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (n == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
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
      for (let a of this.state.facet(El))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return Hl + " " + (this.state.facet(Vl) ? hd : cd) + " " + this.state.facet(po);
  }
  updateAttrs() {
    let e = _u(this, Uh, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(Rn) ? "true" : "false",
      class: "cm-content",
      style: `${oe.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), _u(this, fa, t);
    let n = this.observer.ignore(() => {
      let s = bu(this.contentDOM, this.contentAttrs, t), o = bu(this.dom, this.editorAttrs, e);
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
    this.styleModules = this.state.facet(Cs);
    let e = this.state.facet(ye.cspNonce);
    li.mount(this.root, this.styleModules.concat(Sv).reverse(), e ? { nonce: e } : void 0);
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
    return Gr(this, e, Au(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return Gr(this, e, Au(this, e, t, (n) => Ng(this, e.head, n)));
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
    return Pg(this, e, t, n);
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
    return Gr(this, e, Vg(this, e, t, n));
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
    let n = Pl(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Pl(this, e, t);
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
    return n.length && (e == n.from && t < 0 || e == n.to && t > 0) && o.dir != this.textDirectionAt(n.from) && (e == n.to ? (e = n.from + o.from, t = 1) : (e = n.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == Je.RTL);
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
    return !this.state.facet(Wh) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > $v)
      return Eh(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || Oh(o.isolates, n = xu(this, e))))
        return o.order;
    n || (n = xu(this, e));
    let s = ug(e.text, t, n);
    return this.bidiCache.push(new er(e.from, e.to, t, n, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || oe.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Ah(this.contentDOM), this.docView.updateSelection();
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
    return lo.of(new Ji(typeof e == "number" ? J.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return lo.of(new Ji(J.cursor(n.from), "start", "start", n.top - e, t, !0));
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
    return _t.define(() => ({}), { eventHandlers: e });
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
    return _t.define(() => ({}), { eventObservers: e });
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
    let n = li.newName(), s = [po.of(n), Cs.of(zl(`.${n}`, e))];
    return t && t.dark && s.push(Vl.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return hr.lowest(Cs.of(zl("." + Hl, e, dd)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), s = n && st.get(n) || st.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
ye.styleModule = Cs;
ye.inputHandler = Hh;
ye.clipboardInputFilter = ha;
ye.clipboardOutputFilter = da;
ye.scrollHandler = Kh;
ye.focusChangeEffect = zh;
ye.perLineTextDirection = Wh;
ye.exceptionSink = Vh;
ye.updateListener = El;
ye.editable = Rn;
ye.mouseSelectionStyle = Nh;
ye.dragMovesSelection = Ph;
ye.clickAddsSelectionRange = Rh;
ye.decorations = gr;
ye.blockWrappers = Gh;
ye.outerDecorations = pa;
ye.atomicRanges = eo;
ye.bidiIsolatedRanges = jh;
ye.cursorScrollMargin = /* @__PURE__ */ fe.define({
  combine: (i) => {
    let e = 5, t = 5;
    for (let n of i)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
ye.scrollMargins = qh;
ye.darkTheme = Vl;
ye.cspNonce = /* @__PURE__ */ fe.define({ combine: (i) => i.length ? i[0] : "" });
ye.contentAttributes = fa;
ye.editorAttributes = Uh;
ye.lineWrapping = /* @__PURE__ */ ye.contentAttributes.of({ class: "cm-lineWrapping" });
ye.announce = /* @__PURE__ */ Xe.define();
const $v = 4096, Ku = {};
class er {
  constructor(e, t, n, s, o, r) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : Je.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && n.push(new er(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return n;
  }
}
function _u(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let o = n[s], r = typeof o == "function" ? o(i) : o;
    r && aa(r, t);
  }
  return t;
}
const Dv = oe.mac ? "mac" : oe.windows ? "win" : oe.linux ? "linux" : "key";
function Lv(i, e) {
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
function mo(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const Bv = /* @__PURE__ */ hr.default(/* @__PURE__ */ ye.domEventHandlers({
  keydown(i, e) {
    return Rv(Ov(e.state), i, e, "editor");
  }
})), fd = /* @__PURE__ */ fe.define({ enables: Bv }), Uu = /* @__PURE__ */ new WeakMap();
function Ov(i) {
  let e = i.facet(fd), t = Uu.get(e);
  return t || Uu.set(e, t = Iv(e.reduce((n, s) => n.concat(s), []))), t;
}
let ni = null;
const Ev = 4e3;
function Iv(i, e = Dv) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = n[r];
    if (a == null)
      n[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var d, h;
    let f = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), m = l.split(/ (?!$)/).map((k) => Lv(k, e));
    for (let k = 1; k < m.length; k++) {
      let w = m.slice(0, k).join(" ");
      s(w, !0), f[w] || (f[w] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [($) => {
          let P = ni = { view: $, prefix: w, scope: r };
          return setTimeout(() => {
            ni == P && (ni = null);
          }, Ev), !0;
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
          c[h].run.push((f) => d(f, Wl));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Wl = null;
function Rv(i, e, t, n) {
  Wl = e;
  let s = qm(e), o = Lm(s, 0), r = Bm(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  ni && ni.view == t && ni.scope == n && (l = ni.prefix + " ", nd.indexOf(e.keyCode) < 0 && (u = !0, ni = null));
  let d = /* @__PURE__ */ new Set(), h = (v) => {
    if (v) {
      for (let k of v.run)
        if (!d.has(k) && (d.add(k), k(t)))
          return v.stopPropagation && (c = !0), !0;
      v.preventDefault && (v.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, f = i[n], m, y;
  return f && (h(f[l + mo(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(oe.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(oe.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (m = ai[e.keyCode]) && m != s ? (h(f[l + mo(m, e, !0)]) || e.shiftKey && (y = zs[e.keyCode]) != s && y != m && h(f[l + mo(y, e, !1)])) && (a = !0) : r && e.shiftKey && h(f[l + mo(s, e, !0)]) && (a = !0), !a && h(f._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Wl = null, a;
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
      let o = pd(e);
      return [new Ti(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Pv(e, t, n);
  }
}
function pd(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == Je.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function Gu(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let o = i.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = i.posAtCoords({ x: o.left + 1, y: r }), a = i.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? n : { from: Math.max(n.from, Math.min(l, a)), to: Math.min(n.to, Math.max(l, a)) };
}
function Pv(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), o = i.textDirection == Je.LTR, r = i.contentDOM, l = r.getBoundingClientRect(), a = pd(i), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), d = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), h = l.right - (c ? parseInt(c.paddingRight) : 0), f = Rl(i, n, 1), m = Rl(i, s, -1), y = f.type == wt.Text ? f : null, v = m.type == wt.Text ? m : null;
  if (y && (i.lineWrapping || f.widgetLineBreaks) && (y = Gu(i, n, 1, y)), v && (i.lineWrapping || m.widgetLineBreaks) && (v = Gu(i, s, -1, v)), y && v && y.from == v.from && y.to == v.to)
    return w($(t.from, t.to, y));
  {
    let R = y ? $(t.from, null, y) : P(f, !1), V = v ? $(null, t.to, v) : P(m, !0), E = [];
    return (y || f).to < (v || m).from - (y && v ? 1 : 0) || f.widgetLineBreaks > 1 && R.bottom + i.defaultLineHeight / 2 < V.top ? E.push(k(d, R.bottom, h, V.top)) : R.bottom < V.top && i.elementAtHeight((R.bottom + V.top) / 2).type == wt.Text && (R.bottom = V.top = (R.bottom + V.top) / 2), w(R).concat(E).concat(w(V));
  }
  function k(R, V, E, _) {
    return new Ti(e, R - a.left, V - a.top, Math.max(0, E - R), _ - V);
  }
  function w({ top: R, bottom: V, horizontal: E }) {
    let _ = [];
    for (let N = 0; N < E.length; N += 2)
      _.push(k(E[N], R, E[N + 1], V));
    return _;
  }
  function $(R, V, E) {
    let _ = 1e9, N = -1e9, ne = [];
    function W(me, ve, ie, le, Ee) {
      let Se = i.coordsAtPos(me, me == E.to ? -2 : 2), Be = i.coordsAtPos(ie, ie == E.from ? 2 : -2);
      !Se || !Be || (_ = Math.min(Se.top, Be.top, _), N = Math.max(Se.bottom, Be.bottom, N), Ee == Je.LTR ? ne.push(o && ve ? d : Se.left, o && le ? h : Be.right) : ne.push(!o && le ? d : Be.left, !o && ve ? h : Se.right));
    }
    let T = R ?? E.from, H = V ?? E.to;
    for (let me of i.visibleRanges)
      if (me.to > T && me.from < H)
        for (let ve = Math.max(me.from, T), ie = Math.min(me.to, H); ; ) {
          let le = i.state.doc.lineAt(ve);
          for (let Ee of i.bidiSpans(le)) {
            let Se = Ee.from + le.from, Be = Ee.to + le.from;
            if (Se >= ie)
              break;
            Be > ve && W(Math.max(Se, ve), R == null && Se <= T, Math.min(Be, ie), V == null && Be >= H, Ee.dir);
          }
          if (ve = le.to + 1, ve >= ie)
            break;
        }
    return ne.length == 0 && W(T, R == null, H, V == null, i.textDirection), { top: _, bottom: N, horizontal: ne };
  }
  function P(R, V) {
    let E = l.top + (V ? R.top : R.bottom);
    return { top: E, bottom: E, horizontal: [] };
  }
}
function Nv(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class Vv {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(No) != e.state.facet(No) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(No);
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
    if (e.length != this.drawn.length || e.some((t, n) => !Nv(t, this.drawn[n]))) {
      let t = this.dom.firstChild, n = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[n].constructor && s.update(t, this.drawn[n]) ? (t = t.nextSibling, n++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, oe.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const No = /* @__PURE__ */ fe.define();
function md(i) {
  return [
    _t.define((e) => new Vv(e, i)),
    No.of(i)
  ];
}
const is = /* @__PURE__ */ fe.define({
  combine(i) {
    return fr(i, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Hv(i = {}) {
  return [
    is.of(i),
    zv,
    Wv,
    Kv,
    Fh.of(!0)
  ];
}
function gd(i) {
  return i.startState.facet(is) != i.state.facet(is);
}
const zv = /* @__PURE__ */ md({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(is), n = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && oe.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : J.cursor(s.head, s.assoc);
        for (let a of Ti.forRange(i, r, l))
          n.push(a);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = gd(i);
    return t && ju(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    ju(e.state, i);
  },
  class: "cm-cursorLayer"
});
function ju(i, e) {
  e.style.animationDuration = i.facet(is).cursorBlinkRate + "ms";
}
const Wv = /* @__PURE__ */ md({
  above: !1,
  markers(i) {
    let e = [], { main: t, ranges: n } = i.state.selection;
    for (let s of n)
      if (!s.empty)
        for (let o of Ti.forRange(i, "cm-selectionBackground", s))
          e.push(o);
    if (oe.ios && !t.empty && i.state.facet(is).iosSelectionHandles) {
      for (let s of Ti.forRange(i, "cm-selectionHandle cm-selectionHandle-start", J.cursor(t.from, 1)))
        e.push(s);
      for (let s of Ti.forRange(i, "cm-selectionHandle cm-selectionHandle-end", J.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || gd(i);
  },
  class: "cm-selectionLayer"
}), Fv = oe.gecko && oe.gecko_version == 153 ? "#ffffff01" : "transparent", Kv = /* @__PURE__ */ hr.highest(/* @__PURE__ */ ye.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${Fv} !important` },
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
function _v() {
  return Gv;
}
const Uv = /* @__PURE__ */ Ze.line({ class: "cm-activeLine" }), Gv = /* @__PURE__ */ _t.fromClass(class {
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
      s.from > e && (t.push(Uv.range(s.from)), e = s.from);
    }
    return Ze.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), go = "-10000px";
class vd {
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
function jv(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const Yr = /* @__PURE__ */ fe.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: oe.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || jv
    };
  }
}), qu = /* @__PURE__ */ new WeakMap(), yd = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(Yr);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new vd(i, ba, (t, n) => this.createTooltip(t, n), (t) => {
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
    let t = e || i.geometryChanged, n = i.state.facet(Yr);
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
    return t.dom.style.position = this.position, t.dom.style.top = go, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
      if (oe.safari) {
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
    let n = this.view.scrollDOM.getBoundingClientRect(), s = ma(this.view);
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
      space: this.view.state.facet(Yr).tooltipSpace(this.view),
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
        c.style.top = go;
        continue;
      }
      let f = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, m = f ? 7 : 0, y = h.right - h.left, v = (e = qu.get(u)) !== null && e !== void 0 ? e : h.bottom - h.top, k = u.offset || Yv, w = this.view.textDirection == Je.LTR, $ = h.width > n.right - n.left ? w ? n.left : n.right - h.width : w ? Math.max(n.left, Math.min(d.left - (f ? 14 : 0) + k.x, n.right - y)) : Math.min(Math.max(n.left, d.left - y + (f ? 14 : 0) - k.x), n.right - y), P = this.above[l];
      !a.strictSide && (P ? d.top - v - m - k.y < n.top : d.bottom + v + m + k.y > n.bottom) && P == n.bottom - d.bottom > d.top - n.top && (P = this.above[l] = !P);
      let R = (P ? d.top - n.top : n.bottom - d.bottom) - m;
      if (R < v && u.resize !== !1) {
        if (R < this.view.defaultLineHeight) {
          c.style.top = go;
          continue;
        }
        qu.set(u, v), c.style.height = (v = R) / o + "px";
      } else c.style.height && (c.style.height = "");
      let V = P ? d.top - v - m - k.y : d.bottom + m + k.y, E = $ + y;
      if (u.overlap !== !0)
        for (let _ of r)
          _.left < E && _.right > $ && _.top < V + v && _.bottom > V && (V = P ? _.top - v - 2 - m : _.bottom + m + 2);
      if (this.position == "absolute" ? (c.style.top = (V - i.parent.top) / o + "px", Yu(c, ($ - i.parent.left) / s)) : (c.style.top = V / o + "px", Yu(c, $ / s)), f) {
        let _ = d.left + (w ? k.x : -k.x) - ($ + 14 - 7);
        f.style.left = _ / s + "px";
      }
      u.overlap !== !0 && r.push({ left: $, top: V, right: E, bottom: V + v }), c.classList.toggle("cm-tooltip-above", P), c.classList.toggle("cm-tooltip-below", !P), u.positioned && u.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = go;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function Yu(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const qv = /* @__PURE__ */ ye.baseTheme({
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
}), Yv = { x: 0, y: 0 }, ba = /* @__PURE__ */ fe.define({
  enables: [yd, qv]
}), tr = /* @__PURE__ */ fe.define({
  combine: (i) => i.reduce((e, t) => e.concat(t), [])
});
class kr {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new kr(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new vd(e, tr, (t, n) => this.createHostedView(t, n), (t) => t.dom.remove());
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
const Xv = /* @__PURE__ */ ba.compute([tr], (i) => {
  let e = i.facet(tr);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var n;
      return (n = t.end) !== null && n !== void 0 ? n : t.pos;
    })),
    create: kr.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), Jv = /* @__PURE__ */ fe.define();
class Zv {
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
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == Je.RTL ? -1 : 1;
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
    let e = this.view.plugin(yd), t = e ? e.manager.tooltips.findIndex((n) => n.create == kr.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, n;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !Qv(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (n = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && n !== void 0 ? n : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !ey(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const vo = 4;
function Qv(i, e) {
  let { left: t, right: n, top: s, bottom: o } = i.getBoundingClientRect(), r;
  if (r = i.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - vo && e.clientX <= n + vo && e.clientY >= s - vo && e.clientY <= o + vo;
}
function ey(i, e, t, n, s, o) {
  let r = i.scrollDOM.getBoundingClientRect(), l = i.documentTop + i.documentPadding.top + i.contentHeight;
  if (r.left > n || r.right < n || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = i.posAtCoords({ x: n, y: s }, !1);
  return a >= e && a <= t;
}
function ty(i, e = {}) {
  let t = Xe.define(), n = /* @__PURE__ */ new WeakMap(), s = cn.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = n.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let d = l.changes.mapPos(c.pos, -1, Vt.TrackDel);
          if (d != null) {
            let h = Object.assign(/* @__PURE__ */ Object.create(null), c);
            h.pos = d, h.end != null && (h.end = l.changes.mapPos(h.end)), u.push(h);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(ny) && !u.value || u.value == s) && (r = []);
      return r.length && a && n.set(r, a), r;
    },
    provide: (r) => tr.from(r)
  });
  const o = _t.define((r) => new Zv(
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
      Jv.of(o),
      Xv
    ]
  };
}
const ny = /* @__PURE__ */ Xe.define(), Xu = /* @__PURE__ */ fe.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), iy = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(Fl), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(Xu);
    this.top = new yo(i, !0, e.topContainer), this.bottom = new yo(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(Xu);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new yo(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new yo(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(Fl);
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
class yo {
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
          e = Ju(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Ju(e);
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
function Ju(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const Fl = /* @__PURE__ */ fe.define({
  enables: iy
});
class ci extends Di {
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
ci.prototype.mapMode = Vt.TrackBefore;
ci.prototype.startSide = ci.prototype.endSide = -1;
ci.prototype.point = !0;
const Xr = /* @__PURE__ */ fe.define(), sy = /* @__PURE__ */ fe.define(), oy = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Pe.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, Is = /* @__PURE__ */ fe.define();
function ry(i) {
  return [bd(), Is.of({ ...oy, ...i })];
}
const Zu = /* @__PURE__ */ fe.define({
  combine: (i) => i.some((e) => e)
});
function bd(i) {
  return [
    ly
  ];
}
const ly = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet(Is).map((e) => new ec(i, e)), this.fixed = !i.state.facet(Zu);
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
    this.view.state.facet(Zu) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Pe.iter(this.view.state.facet(Xr), this.view.viewport.from), n = [], s = this.gutters.map((o) => new ay(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == wt.Text && r) {
            Kl(t, n, l.from);
            for (let a of s)
              a.line(this.view, l, n);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == wt.Text) {
        Kl(t, n, o.from);
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
    let e = i.startState.facet(Is), t = i.state.facet(Is), n = i.docChanged || i.heightChanged || i.viewportChanged || !Pe.eq(i.startState.facet(Xr), i.state.facet(Xr), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new ec(this.view, o)) : (this.gutters[r].update(i), s.push(this.gutters[r]));
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
    return e.textDirection == Je.LTR ? { left: n, right: s } : { right: n, left: s };
  })
});
function Qu(i) {
  return Array.isArray(i) ? i : [i];
}
function Kl(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class ay {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = Pe.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new kd(e, r, o, n);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    Kl(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let o of e.state.facet(sy)) {
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
class ec {
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
    this.markers = Qu(t.markers(e)), t.initialSpacer && (this.spacer = new kd(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = Qu(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let n = e.view.viewport;
    return !Pe.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class kd {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), uy(this.markers, s) || this.setMarkers(e, s);
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
function uy(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const cy = /* @__PURE__ */ fe.define(), hy = /* @__PURE__ */ fe.define(), Ki = /* @__PURE__ */ fe.define({
  combine(i) {
    return fr(i, { formatNumber: String, domEventHandlers: {} }, {
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
class Jr extends ci {
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
function Zr(i, e) {
  return i.state.facet(Ki).formatNumber(e, i.state);
}
const dy = /* @__PURE__ */ Is.compute([Ki], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(cy);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new Jr(Zr(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet(hy)) {
      let o = s(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Ki) != e.state.facet(Ki),
  initialSpacer(e) {
    return new Jr(Zr(e, tc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = Zr(t.view, tc(t.view.state.doc.lines));
    return n == e.number ? e : new Jr(n);
  },
  domEventHandlers: i.facet(Ki).domEventHandlers,
  side: "before"
}));
function fy(i = {}) {
  return [
    Ki.of(i),
    bd(),
    dy
  ];
}
function tc(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const py = 1024;
let my = 0;
class Qr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Ve {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = my++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
    return typeof e != "function" && (e = zt.match(e)), (t) => {
      let n = e(t);
      return n === void 0 ? null : [this, n];
    };
  }
}
Ve.closedBy = new Ve({ deserialize: (i) => i.split(" ") });
Ve.openedBy = new Ve({ deserialize: (i) => i.split(" ") });
Ve.group = new Ve({ deserialize: (i) => i.split(" ") });
Ve.isolate = new Ve({ deserialize: (i) => {
  if (i && i != "rtl" && i != "ltr" && i != "auto")
    throw new RangeError("Invalid value for isolate: " + i);
  return i || "auto";
} });
Ve.contextHash = new Ve({ perNode: !0 });
Ve.lookAhead = new Ve({ perNode: !0 });
Ve.mounted = new Ve({ perNode: !0 });
class Rs {
  constructor(e, t, n, s = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[Ve.mounted.id];
  }
}
const gy = /* @__PURE__ */ Object.create(null);
class zt {
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : gy, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new zt(e.name || "", t, e.id, n);
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
      let t = this.prop(Ve.group);
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
      for (let s = n.prop(Ve.group), o = -1; o < (s ? s.length : 0); o++) {
        let r = t[o < 0 ? n.name : s[o]];
        if (r)
          return r;
      }
    };
  }
}
zt.none = new zt(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class ka {
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
      t.push(s ? new zt(n.name, s, n.id, n.flags) : n);
    }
    return new ka(t);
  }
}
const bo = /* @__PURE__ */ new WeakMap(), nc = /* @__PURE__ */ new WeakMap();
var lt;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(lt || (lt = {}));
class tt {
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
    let e = Rs.get(this);
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
    return new Ul(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = bo.get(this) || this.topNode, o = new Ul(s);
    return o.moveTo(e, t), bo.set(this, o._tree), o;
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
    let n = _s(bo.get(this) || this.topNode, e, t, !1);
    return bo.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = _s(nc.get(this) || this.topNode, e, t, !0);
    return nc.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return by(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & lt.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | lt.IncludeAnonymous); ; ) {
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
    return this.children.length <= 8 ? this : Sa(zt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new tt(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new tt(zt.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return ky(e);
  }
}
tt.empty = new tt(zt.none, [], [], 0);
class wa {
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
    return new wa(this.buffer, this.index);
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
    return zt.none;
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
    for (let a = e; a != t && !(wd(o, s, r[a + 1], r[a + 2]) && (l = a, n > 0)); a = r[a + 3])
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
function wd(i, e, t, n) {
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
function _s(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let r = !n && i instanceof Jt && i.index < 0 ? null : i.parent;
    if (!r)
      return i;
    i = r;
  }
  let o = n ? 0 : lt.IgnoreOverlays;
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
class xd {
  cursor(e = 0) {
    return new Ul(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = ic(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return ic(this, e, t, n);
  }
  resolve(e, t = 0) {
    return _s(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return _s(this, e, t, !0);
  }
  matchContext(e) {
    return _l(this.parent, e);
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
class Jt extends xd {
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
        if (!(!(o & lt.EnterBracketed && c instanceof tt && (h = Rs.get(c)) && !h.overlay && h.bracketed && n >= d && n <= d + c.length) && !wd(s, n, d, d + c.length))) {
          if (c instanceof hi) {
            if (o & lt.ExcludeBuffers)
              continue;
            let f = c.findChild(0, c.buffer.length, t, n - d, s);
            if (f > -1)
              return new oi(new vy(r, c, e, d), null, f);
          } else if (o & lt.IncludeAnonymous || !c.type.isAnonymous || xa(c)) {
            let f;
            if (!(o & lt.IgnoreMounts) && (f = Rs.get(c)) && !f.overlay)
              return new Jt(f.tree, d, e, r);
            let m = new Jt(c, d, e, r);
            return o & lt.IncludeAnonymous || !m.type.isAnonymous ? m : m.nextChild(t < 0 ? c.children.length - 1 : 0, t, n, s, o);
          }
        }
      }
      if (o & lt.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
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
    if (!(n & lt.IgnoreOverlays) && (s = Rs.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = n & lt.EnterBracketed && s.bracketed;
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
function ic(i, e, t, n) {
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
function _l(i, e, t = e.length - 1) {
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
class vy {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class oi extends xd {
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
    if (n & lt.ExcludeBuffers)
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
    return new tt(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function Sd(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let o = 1; o < i.length; o++) {
    let r = i[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let n = t instanceof Jt && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new yy(s, t);
}
class yy {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return Sd(this.heads);
  }
}
function by(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let o = n instanceof Jt ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [n])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Rs.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new Jt(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [n])).push(_s(l, e, t, !1));
      }
    }
  return s ? Sd(s) : n;
}
class Ul {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~lt.EnterBracketed, e instanceof Jt)
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
    return this.buffer ? n & lt.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & lt.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & lt.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
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
          if (this.mode & lt.IncludeAnonymous || l instanceof hi || !l.type.isAnonymous || xa(l))
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
      return _l(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return _l(this._tree, e, s);
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
function xa(i) {
  return i.children.some((e) => e instanceof hi || !e.type.isAnonymous || xa(e));
}
function ky(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = py, reused: o = [], minRepeatType: r = n.types.length } = i, l = Array.isArray(t) ? new wa(t, t.length) : t, a = n.types, u = 0, c = 0;
  function d(R, V, E, _, N, ne) {
    let { id: W, start: T, end: H, size: me } = l, ve = c, ie = u;
    if (me < 0)
      if (l.next(), me == -1) {
        let Ae = o[W];
        E.push(Ae), _.push(T - R);
        return;
      } else if (me == -3) {
        u = W;
        return;
      } else if (me == -4) {
        c = W;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${me}`);
    let le = a[W], Ee, Se, Be = T - R;
    if (H - T <= s && (Se = v(l.pos - V, N))) {
      let Ae = new Uint16Array(Se.size - Se.skip), j = l.pos - Se.size, Qe = Ae.length;
      for (; l.pos > j; )
        Qe = k(Se.start, Ae, Qe);
      Ee = new hi(Ae, H - Se.start, n), Be = Se.start - R;
    } else {
      let Ae = l.pos - me;
      l.next();
      let j = [], Qe = [], ce = W >= r ? W : -1, Ce = 0, te = H;
      for (; l.pos > Ae; )
        ce >= 0 && l.id == ce && l.size >= 0 ? (l.end <= te - s && (m(j, Qe, T, Ce, l.end, te, ce, ve, ie), Ce = j.length, te = l.end), l.next()) : ne > 2500 ? h(T, Ae, j, Qe) : d(T, Ae, j, Qe, ce, ne + 1);
      if (ce >= 0 && Ce > 0 && Ce < j.length && m(j, Qe, T, Ce, T, te, ce, ve, ie), j.reverse(), Qe.reverse(), ce > -1 && Ce > 0) {
        let K = f(le, ie);
        Ee = Sa(le, j, Qe, 0, j.length, 0, H - T, K, K);
      } else
        Ee = y(le, j, Qe, H - T, ve - H, ie);
    }
    E.push(Ee), _.push(Be);
  }
  function h(R, V, E, _) {
    let N = [], ne = 0, W = -1;
    for (; l.pos > V; ) {
      let { id: T, start: H, end: me, size: ve } = l;
      if (ve > 4)
        l.next();
      else {
        if (W > -1 && H < W)
          break;
        W < 0 && (W = me - s), N.push(T, H, me), ne++, l.next();
      }
    }
    if (ne) {
      let T = new Uint16Array(ne * 4), H = N[N.length - 2];
      for (let me = N.length - 3, ve = 0; me >= 0; me -= 3)
        T[ve++] = N[me], T[ve++] = N[me + 1] - H, T[ve++] = N[me + 2] - H, T[ve++] = ve;
      E.push(new hi(T, N[2] - H, n)), _.push(H - R);
    }
  }
  function f(R, V) {
    return (E, _, N) => {
      let ne = 0, W = E.length - 1, T, H;
      if (W >= 0 && (T = E[W]) instanceof tt) {
        if (!W && T.type == R && T.length == N)
          return T;
        (H = T.prop(Ve.lookAhead)) && (ne = _[W] + T.length + H);
      }
      return y(R, E, _, N, ne, V);
    };
  }
  function m(R, V, E, _, N, ne, W, T, H) {
    let me = [], ve = [];
    for (; R.length > _; )
      me.push(R.pop()), ve.push(V.pop() + E - N);
    R.push(y(n.types[W], me, ve, ne - N, T - ne, H)), V.push(N - E);
  }
  function y(R, V, E, _, N, ne, W) {
    if (ne) {
      let T = [Ve.contextHash, ne];
      W = W ? [T].concat(W) : [T];
    }
    if (N > 25) {
      let T = [Ve.lookAhead, N];
      W = W ? [T].concat(W) : [T];
    }
    return new tt(R, V, E, _, W);
  }
  function v(R, V) {
    let E = l.fork(), _ = 0, N = 0, ne = 0, W = E.end - s, T = { size: 0, start: 0, skip: 0 };
    e: for (let H = E.pos - R; E.pos > H; ) {
      let me = E.size;
      if (E.id == V && me >= 0) {
        T.size = _, T.start = N, T.skip = ne, ne += 4, _ += 4, E.next();
        continue;
      }
      let ve = E.pos - me;
      if (me < 0 || ve < H || E.start < W)
        break;
      let ie = E.id >= r ? 4 : 0, le = E.start;
      for (E.next(); E.pos > ve; ) {
        if (E.size < 0)
          if (E.size == -3 || E.size == -4)
            ie += 4;
          else
            break e;
        else E.id >= r && (ie += 4);
        E.next();
      }
      N = le, _ += me, ne += ie;
    }
    return (V < 0 || _ == R) && (T.size = _, T.start = N, T.skip = ne), T.size > 4 ? T : void 0;
  }
  function k(R, V, E) {
    let { id: _, start: N, end: ne, size: W } = l;
    if (l.next(), W >= 0 && _ < r) {
      let T = E;
      if (W > 4) {
        let H = l.pos - (W - 4);
        for (; l.pos > H; )
          E = k(R, V, E);
      }
      V[--E] = T, V[--E] = ne - R, V[--E] = N - R, V[--E] = _;
    } else W == -3 ? u = _ : W == -4 && (c = _);
    return E;
  }
  let w = [], $ = [];
  for (; l.pos > 0; )
    d(i.start || 0, i.bufferStart || 0, w, $, -1, 0);
  let P = (e = i.length) !== null && e !== void 0 ? e : w.length ? $[0] + w[0].length : 0;
  return new tt(a[i.topID], w.reverse(), $.reverse(), P);
}
const sc = /* @__PURE__ */ new WeakMap();
function Vo(i, e) {
  if (!i.isAnonymous || e instanceof hi || e.type != i)
    return 1;
  let t = sc.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof tt)) {
        t = 1;
        break;
      }
      t += Vo(i, n);
    }
    sc.set(e, t);
  }
  return t;
}
function Sa(i, e, t, n, s, o, r, l, a) {
  let u = 0;
  for (let m = n; m < s; m++)
    u += Vo(i, e[m]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], h = [];
  function f(m, y, v, k, w) {
    for (let $ = v; $ < k; ) {
      let P = $, R = y[$], V = Vo(i, m[$]);
      for ($++; $ < k; $++) {
        let E = Vo(i, m[$]);
        if (V + E >= c)
          break;
        V += E;
      }
      if ($ == P + 1) {
        if (V > c) {
          let E = m[P];
          f(E.children, E.positions, 0, E.children.length, y[P] + w);
          continue;
        }
        d.push(m[P]);
      } else {
        let E = y[$ - 1] + m[$ - 1].length - R;
        d.push(Sa(i, m, y, P, $, R, E, null, a));
      }
      h.push(R + w - o);
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
class Cd {
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
    return typeof e == "string" && (e = new wy(e)), n = n ? n.length ? n.map((s) => new Qr(s.from, s.to)) : [new Qr(0, 0)] : [new Qr(0, e.length)], this.createParse(e, t || [], n);
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
class wy {
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
new Ve({ perNode: !0 });
let xy = 0;
class Yt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = xy++;
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
    let t = new nr(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : nr.get(n.base || n, n.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let Sy = 0;
class nr {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Sy++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && Cy(t, l.modified));
    if (n)
      return n;
    let s = [], o = new Yt(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = My(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(nr.get(l, a));
    return o;
  }
}
function Cy(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function My(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function Ay(i) {
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
        let c = new Us(n, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return Md.add(e);
}
const Md = new Ve({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth < e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new Us(s.tags, s.mode, s.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class Us {
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
Us.empty = new Us([], 2, null);
function Ad(i, e) {
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
function Ty(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function $y(i, e, t, n = 0, s = i.length) {
  let o = new Dy(n, Array.isArray(e) ? e : [e], t);
  o.highlightRange(i.cursor(), n, s, "", o.highlighters), o.flush(s);
}
class Dy {
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
    let u = s, c = Ly(e) || Us.empty, d = Ty(o, c.tags);
    if (d && (u && (u += " "), u += d, c.mode == 1 && (s += (s ? " " : "") + d)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let h = e.tree && e.tree.prop(Ve.mounted);
    if (h && h.overlay) {
      let f = e.node.enter(h.overlay[0].from + l, 1), m = this.highlighters.filter((v) => !v.scope || v.scope(h.tree.type)), y = e.firstChild();
      for (let v = 0, k = l; ; v++) {
        let w = v < h.overlay.length ? h.overlay[v] : null, $ = w ? w.from + l : a, P = Math.max(t, k), R = Math.min(n, $);
        if (P < R && y)
          for (; e.from < R && (this.highlightRange(e, P, R, s, o), this.startSpan(Math.min(R, e.to), u), !(e.to >= $ || !e.nextSibling())); )
            ;
        if (!w || $ > n)
          break;
        k = w.to + l, k > t && (this.highlightRange(f.cursor(), Math.max(t, w.from + l), Math.min(n, k), "", m), this.startSpan(Math.min(n, k), u));
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
function Ly(i) {
  let e = i.type.prop(Md);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const se = Yt.define, ko = se(), Zn = se(), oc = se(Zn), rc = se(Zn), Qn = se(), wo = se(Qn), el = se(Qn), wn = se(), yi = se(wn), yn = se(), bn = se(), Gl = se(), vs = se(Gl), xo = se(), $e = {
  /**
  A comment.
  */
  comment: ko,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: se(ko),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: se(ko),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: se(ko),
  /**
  Any kind of identifier.
  */
  name: Zn,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: se(Zn),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: oc,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: se(oc),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: rc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: se(rc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: se(Zn),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: se(Zn),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: se(Zn),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: se(Zn),
  /**
  A literal value.
  */
  literal: Qn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: wo,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: se(wo),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: se(wo),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: se(wo),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: el,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: se(el),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: se(el),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: se(Qn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: se(Qn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: se(Qn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: se(Qn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: se(Qn),
  /**
  A language keyword.
  */
  keyword: yn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: se(yn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: se(yn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: se(yn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: se(yn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: se(yn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: se(yn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: se(yn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: se(yn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: se(yn),
  /**
  An operator.
  */
  operator: bn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: se(bn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: se(bn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: se(bn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: se(bn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: se(bn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: se(bn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: se(bn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: se(bn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: se(bn),
  /**
  Program or markup punctuation.
  */
  punctuation: Gl,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: se(Gl),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: vs,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: se(vs),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: se(vs),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: se(vs),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: se(vs),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: wn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: yi,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: se(yi),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: se(yi),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: se(yi),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: se(yi),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: se(yi),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: se(yi),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: se(wn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: se(wn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: se(wn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: se(wn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: se(wn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: se(wn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: se(wn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: se(wn),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: se(),
  /**
  Deleted text.
  */
  deleted: se(),
  /**
  Changed text.
  */
  changed: se(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: se(),
  /**
  Metadata or meta-instruction.
  */
  meta: xo,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: se(xo),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: se(xo),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: se(xo),
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
for (let i in $e) {
  let e = $e[i];
  e instanceof Yt && (e.name = i);
}
Ad([
  { tag: $e.link, class: "tok-link" },
  { tag: $e.heading, class: "tok-heading" },
  { tag: $e.emphasis, class: "tok-emphasis" },
  { tag: $e.strong, class: "tok-strong" },
  { tag: $e.keyword, class: "tok-keyword" },
  { tag: $e.atom, class: "tok-atom" },
  { tag: $e.bool, class: "tok-bool" },
  { tag: $e.url, class: "tok-url" },
  { tag: $e.labelName, class: "tok-labelName" },
  { tag: $e.inserted, class: "tok-inserted" },
  { tag: $e.deleted, class: "tok-deleted" },
  { tag: $e.literal, class: "tok-literal" },
  { tag: $e.string, class: "tok-string" },
  { tag: $e.number, class: "tok-number" },
  { tag: [$e.regexp, $e.escape, $e.special($e.string)], class: "tok-string2" },
  { tag: $e.variableName, class: "tok-variableName" },
  { tag: $e.local($e.variableName), class: "tok-variableName tok-local" },
  { tag: $e.definition($e.variableName), class: "tok-variableName tok-definition" },
  { tag: $e.special($e.variableName), class: "tok-variableName2" },
  { tag: $e.definition($e.propertyName), class: "tok-propertyName tok-definition" },
  { tag: $e.typeName, class: "tok-typeName" },
  { tag: $e.namespace, class: "tok-namespace" },
  { tag: $e.className, class: "tok-className" },
  { tag: $e.macroName, class: "tok-macroName" },
  { tag: $e.propertyName, class: "tok-propertyName" },
  { tag: $e.operator, class: "tok-operator" },
  { tag: $e.comment, class: "tok-comment" },
  { tag: $e.meta, class: "tok-meta" },
  { tag: $e.invalid, class: "tok-invalid" },
  { tag: $e.punctuation, class: "tok-punctuation" }
]);
var tl;
const _i = /* @__PURE__ */ new Ve();
function By(i) {
  return fe.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const Oy = /* @__PURE__ */ new Ve();
class ln {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, _e.prototype.hasOwnProperty("tree") || Object.defineProperty(_e.prototype, "tree", { get() {
      return Dn(this);
    } }), this.parser = t, this.extension = [
      rs.of(this),
      _e.languageData.of((o, r, l) => {
        let a = lc(o, r, l), u = a.type.prop(_i);
        if (!u)
          return [];
        let c = o.facet(u), d = a.type.prop(Oy);
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
    return lc(e, t, n).type.prop(_i) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(rs);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (o, r) => {
      if (o.prop(_i) == this.data) {
        n.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Ve.mounted);
      if (l) {
        if (l.tree.prop(_i) == this.data) {
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
        u instanceof tt && s(u, o.positions[a] + r);
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
ln.setState = /* @__PURE__ */ Xe.define();
function lc(i, e, t) {
  let n = i.facet(rs), s = Dn(i).topNode;
  if (!n || n.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, lt.ExcludeBuffers | lt.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function Dn(i) {
  let e = i.field(ln.state, !1);
  return e ? e.tree : tt.empty;
}
class Ey {
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
let ys = null;
class ss {
  constructor(e, t, n = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new ss(e, t, [], tt.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new Ey(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != tt.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
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
    let t = ys;
    ys = this;
    try {
      return e();
    } finally {
      ys = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = ac(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, d, h) => a.push({ fromA: u, toA: c, fromB: d, toB: h })), n = $i.applyChanges(n, a), s = tt.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), d = e.mapPos(u.to, -1);
          c < d && l.push({ from: c, to: d });
        }
      }
    }
    return new ss(this.parser, t, n, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = ac(this.fragments, s, o), this.skipped.splice(n--, 1));
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
    return new class extends Cd {
      createParse(t, n, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = ys;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new tt(zt.none, [], [], r - o);
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
    return ys;
  }
}
function ac(i, e, t) {
  return $i.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class os {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new os(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = ss.create(e.facet(rs).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new os(n);
  }
}
ln.state = /* @__PURE__ */ cn.define({
  create: os.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(ln.setState))
        return t.value;
    return e.startState.facet(rs) != e.state.facet(rs) ? os.init(e.state) : i.apply(e);
  }
});
let Td = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Td = (i) => {
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
const nl = typeof navigator < "u" && (!((tl = navigator.scheduling) === null || tl === void 0) && tl.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Iy = /* @__PURE__ */ _t.fromClass(class {
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
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Td(this.work));
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
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !nl ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && n.doc.length > s + 1e3, a = o.context.work(() => nl && nl() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: ln.setState.of(new os(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
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
}), rs = /* @__PURE__ */ fe.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    ln.state,
    Iy,
    ye.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Ry = /* @__PURE__ */ fe.define(), Ca = /* @__PURE__ */ fe.define({
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
  let e = i.facet(Ca);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function ir(i, e) {
  let t = "", n = i.tabSize, s = i.facet(Ca)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function $d(i, e) {
  i instanceof _e && (i = new wr(i));
  for (let n of i.state.facet(Ry)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = Dn(i.state);
  return t.length >= e ? Py(i, t, e) : null;
}
class wr {
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
    return pr(e, this.state.tabSize, t);
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
const Dd = /* @__PURE__ */ new Ve();
function Py(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let o = [];
    for (let r = s; r && !(r.from < n.node.from || r.to > n.node.to || r.from == n.node.from && r.type == n.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      n = { node: o[r], next: n };
  }
  return Ld(n, i, t);
}
function Ld(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = Vy(n.node);
    if (s)
      return s(Ma.create(e, t, n));
  }
  return 0;
}
function Ny(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function Vy(i) {
  let e = i.type.prop(Dd);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(Ve.closedBy))) {
    let s = i.lastChild, o = s && n.indexOf(s.name) > -1;
    return (r) => Fy(r, !0, 1, void 0, o && !Ny(r) ? s.from : void 0);
  }
  return i.parent == null ? Hy : null;
}
function Hy() {
  return 0;
}
class Ma extends wr {
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
    return new Ma(e, t, n);
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
      if (zy(n, e))
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
    return Ld(this.context.next, this.base, this.pos);
  }
}
function zy(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function Wy(i) {
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
function Fy(i, e, t, n, s) {
  let o = i.textAfter, r = o.match(/^\s*/)[0].length, l = n && o.slice(r, r + n.length) == n || s == i.pos + r, a = Wy(i);
  return a ? l ? i.column(a.from) : i.column(a.to) : i.baseIndent + (l ? 0 : i.unit * t);
}
class xr {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(l) {
      let a = li.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof ln ? (l) => l.prop(_i) == r.data : r ? (l) => l == r : void 0, this.style = Ad(e.map((l) => ({
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
    return new xr(e, t || {});
  }
}
const jl = /* @__PURE__ */ fe.define(), Ky = /* @__PURE__ */ fe.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function il(i) {
  let e = i.facet(jl);
  return e.length ? e : i.facet(Ky);
}
function _y(i, e) {
  let t = [Gy], n;
  return i instanceof xr && (i.module && t.push(ye.styleModule.of(i.module)), n = i.themeType), n ? t.push(jl.computeN([ye.darkTheme], (s) => s.facet(ye.darkTheme) == (n == "dark") ? [i] : [])) : t.push(jl.of(i)), t;
}
class Uy {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Dn(e.state), this.decorations = this.buildDeco(e, il(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Dn(e.state), n = il(e.state), s = n != il(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Ze.none;
    let n = new Ai();
    for (let { from: s, to: o } of e.visibleRanges)
      $y(this.tree, t, (r, l, a) => {
        n.add(r, l, this.markCache[a] || (this.markCache[a] = Ze.mark({ class: a })));
      }, s, o);
    return n.finish();
  }
}
const Gy = /* @__PURE__ */ hr.high(/* @__PURE__ */ _t.fromClass(Uy, {
  decorations: (i) => i.decorations
})), jy = 1e4, qy = "()[]{}", Yy = /* @__PURE__ */ new Ve();
function ql(i, e, t) {
  let n = i.prop(e < 0 ? Ve.openedBy : Ve.closedBy);
  if (n)
    return n;
  if (i.name.length == 1) {
    let s = t.indexOf(i.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function Yl(i) {
  let e = i.type.prop(Yy);
  return e ? e(i.node) : i;
}
function Ui(i, e, t, n = {}) {
  let s = n.maxScanDistance || jy, o = n.brackets || qy, r = Dn(i), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = ql(a.type, t, o);
    if (u && a.from < a.to) {
      let c = Yl(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return Xy(i, e, t, a, c, u, o);
    }
  }
  return Jy(i, e, t, r, l.type, s, o);
}
function Xy(i, e, t, n, s, o, r) {
  let l = n.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let d = Yl(c);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (ql(c.type, t, r))
          u++;
        else if (ql(c.type, -t, r)) {
          if (u == 0) {
            let d = Yl(c);
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
function Jy(i, e, t, n, s, o, r) {
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
      let k = r.indexOf(f[y]);
      if (!(k < 0 || n.resolveInner(m + y, 1).type != s))
        if (k % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: u, end: { from: m + y, to: m + y + 1 }, matched: k >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (h += f.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function uc(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let o = s;
  for (let r = n; r < e; r++)
    i.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Bd {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = uc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : uc(this.string, null, this.tabSize);
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
function Zy(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || Qy,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || $a,
    mergeTokens: i.mergeTokens !== !1
  };
}
function Qy(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const cc = /* @__PURE__ */ new WeakMap();
class Aa extends ln {
  constructor(e) {
    let t = By(e.languageData), n = Zy(e), s, o = new class extends Cd {
      createParse(r, l, a) {
        return new t0(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = s0(t, this), s = this, this.streamParser = n, this.stateAfter = new Ve({ perNode: !0 }), this.tokenTable = e.tokenTable ? new Rd(n.tokenTable) : i0;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Aa(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = cc.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Ta(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = n ? n(a.from) : -1, d = new Bd(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; d.pos < u - a.from; )
          Ed(this.streamParser.token, d, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return n && t == null && cc.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Ta(i, e, t, n, s) {
  let o = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (o)
    return { state: i.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof tt && a < s && Ta(i, l, a, n, s);
    if (u)
      return u;
  }
  return null;
}
function Od(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < n && l instanceof tt) {
      if (!(a = Od(i, l, t - r, n - r, s)))
        break;
      return s ? new tt(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function e0(i, e, t, n, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Ta(i, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= n && (u = Od(i, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: i.streamParser.startState(s ? Ei(s) : 4), tree: tt.empty };
}
class t0 {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = ss.get(), r = s[0].from, { state: l, tree: a } = e0(e, n, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Ei(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = ss.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
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
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Bd(t, e ? e.state.tabSize : 4, e ? Ei(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = Ed(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = n, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = tt.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: n0,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new tt(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new tt(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function Ed(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const $a = /* @__PURE__ */ Object.create(null), Gs = [zt.none], n0 = /* @__PURE__ */ new ka(Gs), hc = [], dc = /* @__PURE__ */ Object.create(null), Id = /* @__PURE__ */ Object.create(null);
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
  Id[i] = /* @__PURE__ */ Pd($a, e);
class Rd {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Id);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = Pd(this.extra, e)) : 0;
  }
}
const i0 = /* @__PURE__ */ new Rd($a);
function sl(i, e) {
  hc.indexOf(i) > -1 || (hc.push(i), console.warn(e));
}
function Pd(i, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = i[u] || $e[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : sl(u, `Modifier ${u} used at start of tag`) : a.length ? sl(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : sl(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((l) => l.id), o = dc[s];
  if (o)
    return o.id;
  let r = dc[s] = zt.define({
    id: Gs.length,
    name: n,
    props: [Ay({ [n]: t })]
  });
  return Gs.push(r), r.id;
}
function s0(i, e) {
  let t = zt.define({ id: Gs.length, name: "Document", props: [
    _i.add(() => i),
    Dd.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return Gs.push(t), t;
}
Je.RTL, Je.LTR;
const o0 = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = La(i.state, t.from);
  return n.line ? r0(i) : n.block ? a0(i) : !1;
};
function Da(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const r0 = /* @__PURE__ */ Da(
  h0,
  0
  /* CommentOption.Toggle */
), l0 = /* @__PURE__ */ Da(
  Nd,
  0
  /* CommentOption.Toggle */
), a0 = /* @__PURE__ */ Da(
  (i, e) => Nd(i, e, c0(e)),
  0
  /* CommentOption.Toggle */
);
function La(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const bs = 50;
function u0(i, { open: e, close: t }, n, s) {
  let o = i.sliceDoc(n - bs, n), r = i.sliceDoc(s, s + bs), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, d;
  s - n <= 2 * bs ? c = d = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + bs), d = i.sliceDoc(s - bs, s));
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
function c0(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function Nd(i, e, t = e.selection.ranges) {
  let n = t.map((o) => La(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let s = t.map((o, r) => u0(e, n[r], o.from, o.to));
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
function h0(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = n.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let d = e.doc.lineAt(c);
      if (u == null && (u = La(e, d.from).line, !u))
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
function hs(i, e) {
  return J.create(i.ranges.map(e), i.mainIndex);
}
function hn(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function dn({ state: i, dispatch: e }, t) {
  let n = hs(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(hn(i, n)), !0);
}
function Sr(i, e) {
  return J.cursor(e ? i.to : i.from);
}
function Vd(i, e) {
  return dn(i, (t) => t.empty ? i.moveByChar(t, e) : Sr(t, e));
}
function Lt(i) {
  return i.textDirectionAt(i.state.selection.main.head) == Je.LTR;
}
const Hd = (i) => Vd(i, !Lt(i)), zd = (i) => Vd(i, Lt(i));
function Wd(i, e) {
  return dn(i, (t) => t.empty ? i.moveByGroup(t, e) : Sr(t, e));
}
const d0 = (i) => Wd(i, !Lt(i)), f0 = (i) => Wd(i, Lt(i));
function p0(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Cr(i, e, t) {
  let n = Dn(i).resolveInner(e.head), s = t ? Ve.closedBy : Ve.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? n.childAfter(a) : n.childBefore(a);
    if (!u)
      break;
    p0(i, u, s) ? n = u : a = t ? u.to : u.from;
  }
  let o = n.type.prop(s), r, l;
  return o && (r = t ? Ui(i, n.from, 1) : Ui(i, n.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? n.to : n.from, J.cursor(l, t ? -1 : 1);
}
const m0 = (i) => dn(i, (e) => Cr(i.state, e, !Lt(i))), g0 = (i) => dn(i, (e) => Cr(i.state, e, Lt(i)));
function Fd(i, e) {
  return dn(i, (t) => {
    if (!t.empty)
      return Sr(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const Kd = (i) => Fd(i, !1), _d = (i) => Fd(i, !0);
function Ud(i) {
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
function Gd(i, e) {
  let t = Ud(i), { state: n } = i, s = hs(n.selection, (r) => r.empty ? i.moveVertically(r, e, t.height) : Sr(r, e));
  if (s.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = i.coordsAtPos(n.selection.main.head), l = i.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = ye.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return i.dispatch(hn(n, s), { effects: o }), !0;
}
const fc = (i) => Gd(i, !1), Xl = (i) => Gd(i, !0);
function di(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let o = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (s = J.cursor(n.from + o));
  }
  return s;
}
const v0 = (i) => dn(i, (e) => di(i, e, !0)), y0 = (i) => dn(i, (e) => di(i, e, !1)), b0 = (i) => dn(i, (e) => di(i, e, !Lt(i))), k0 = (i) => dn(i, (e) => di(i, e, Lt(i))), w0 = (i) => dn(i, (e) => i.moveToLineBoundary(e, !1, !1)), x0 = (i) => dn(i, (e) => i.moveToLineBoundary(e, !0, !1));
function S0(i, e, t) {
  let n = !1, s = hs(i.selection, (o) => {
    let r = Ui(i, o.head, -1) || Ui(i, o.head, 1) || o.head > 0 && Ui(i, o.head - 1, 1) || o.head < i.doc.length && Ui(i, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    n = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return J.cursor(l);
  });
  return n ? (e(hn(i, s)), !0) : !1;
}
const C0 = ({ state: i, dispatch: e }) => S0(i, e);
function Qt(i, e, t) {
  let n = hs(i.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = J.range(s.head, s.anchor));
    let o = t(s);
    return J.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(i.state.selection) ? !1 : (i.dispatch(hn(i.state, n)), !0);
}
function jd(i, e) {
  return Qt(i, e, (t) => i.moveByChar(t, e));
}
const qd = (i) => jd(i, !Lt(i)), Yd = (i) => jd(i, Lt(i));
function Xd(i, e) {
  return Qt(i, e, (t) => i.moveByGroup(t, e));
}
const M0 = (i) => Xd(i, !Lt(i)), A0 = (i) => Xd(i, Lt(i)), T0 = (i) => {
  let e = !Lt(i);
  return Qt(i, e, (t) => Cr(i.state, t, e));
}, $0 = (i) => {
  let e = Lt(i);
  return Qt(i, e, (t) => Cr(i.state, t, e));
};
function Jd(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e));
}
const Zd = (i) => Jd(i, !1), Qd = (i) => Jd(i, !0);
function ef(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e, Ud(i).height));
}
const pc = (i) => ef(i, !1), mc = (i) => ef(i, !0), D0 = (i) => Qt(i, !0, (e) => di(i, e, !0)), L0 = (i) => Qt(i, !1, (e) => di(i, e, !1)), B0 = (i) => {
  let e = !Lt(i);
  return Qt(i, e, (t) => di(i, t, e));
}, O0 = (i) => {
  let e = Lt(i);
  return Qt(i, e, (t) => di(i, t, e));
}, E0 = (i) => Qt(i, !1, (e) => J.cursor(i.lineBlockAt(e.head).from)), I0 = (i) => Qt(i, !0, (e) => J.cursor(i.lineBlockAt(e.head).to)), gc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: 0 })), !0), vc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.doc.length })), !0), yc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.selection.main.anchor, head: 0 })), !0), bc = ({ state: i, dispatch: e }) => (e(hn(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), R0 = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), P0 = ({ state: i, dispatch: e }) => {
  let t = Mr(i).map(({ from: n, to: s }) => J.undirectionalRange(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: J.create(t), userEvent: "select" })), !0;
}, N0 = ({ state: i, dispatch: e }) => {
  let t = hs(i.selection, (n) => {
    let s = Dn(i), o = s.resolveStack(n.from, 1);
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
  return t.eq(i.selection) ? !1 : (e(hn(i, t)), !0);
};
function tf(i, e) {
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
  return s.length == n.ranges.length ? !1 : (i.dispatch(hn(t, J.create(s, s.length - 1))), !0);
}
const V0 = (i) => tf(i, !1), H0 = (i) => tf(i, !0), z0 = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = J.create([t.main]) : t.main.empty || (n = J.create([J.cursor(t.main.head)])), n ? (e(hn(i, n)), !0) : !1;
};
function to(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = So(i, a, !1)) : a > r && (t = "delete.forward", a = So(i, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = So(i, r, !1), l = So(i, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: J.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? ye.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function So(i, e, t) {
  if (i instanceof ye)
    for (let n of i.state.facet(ye.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const nf = (i, e, t) => to(i, (n) => {
  let s = n.from, { state: o } = i, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = pr(l, o.tabSize), c = u % Ei(o) || Ei(o);
    for (let d = 0; d < c && l[l.length - 1 - d] == " "; d++)
      s--;
    a = s;
  } else
    a = Tt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = Tt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), Jl = (i) => nf(i, !1, !0), sf = (i) => nf(i, !0, !1), of = (i, e) => to(i, (t) => {
  let n = t.head, { state: s } = i, o = s.doc.lineAt(n), r = s.charCategorizer(n);
  for (let l = null; ; ) {
    if (n == (e ? o.to : o.from)) {
      n == t.head && o.number != (e ? s.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let a = Tt(o.text, n - o.from, e) + o.from, u = o.text.slice(Math.min(n, a) - o.from, Math.max(n, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || n != t.head) && (l = c), n = a;
  }
  return n;
}), rf = (i) => of(i, !1), W0 = (i) => of(i, !0), F0 = (i) => to(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), K0 = (i) => to(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), _0 = (i) => to(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), U0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: We.of(["", ""]) },
    range: J.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, G0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, o = i.doc.lineAt(s), r = s == o.from ? s - 1 : Tt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : Tt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: i.doc.slice(s, l).append(i.doc.slice(r, s)) },
      range: J.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(i.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Mr(i) {
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
function lf(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [], s = [];
  for (let o of Mr(i)) {
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
const j0 = ({ state: i, dispatch: e }) => lf(i, e, !1), q0 = ({ state: i, dispatch: e }) => lf(i, e, !0);
function af(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [];
  for (let o of Mr(i))
    t ? n.push({ from: o.from, insert: i.doc.slice(o.from, o.to) + i.lineBreak }) : n.push({ from: o.to, insert: i.lineBreak + i.doc.slice(o.from, o.to) });
  let s = i.changes(n);
  return e(i.update({
    changes: s,
    selection: i.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const Y0 = ({ state: i, dispatch: e }) => af(i, e, !1), X0 = ({ state: i, dispatch: e }) => af(i, e, !0), J0 = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(Mr(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), n = hs(e.selection, (s) => {
    let o;
    if (i.lineWrapping) {
      let r = i.lineBlockAt(s.head), l = i.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + i.documentTop - l.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, o);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function Z0(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Dn(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), o;
  return n && s && n.to <= e && s.from >= e && (o = n.type.prop(Ve.closedBy)) && o.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const kc = /* @__PURE__ */ uf(!1), Q0 = /* @__PURE__ */ uf(!0);
function uf(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !i && o == r && Z0(e, o);
      i && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new wr(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = $d(u, o);
      for (c == null && (c = pr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", ir(e, c)];
      return a && d.push(ir(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: We.of(d) },
        range: J.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Ba(i, e) {
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
const eb = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new wr(i, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = Ba(i, (o, r, l) => {
    let a = $d(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = ir(i, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, tb = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ba(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(Ca) });
}), { userEvent: "input.indent" })), !0), nb = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(Ba(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = pr(s, i.tabSize), r = 0, l = ir(i, Math.max(0, o - Ei(i)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  n.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), ib = (i) => (i.setTabFocusMode(), !0), sb = [
  { key: "Ctrl-b", run: Hd, shift: qd, preventDefault: !0 },
  { key: "Ctrl-f", run: zd, shift: Yd },
  { key: "Ctrl-p", run: Kd, shift: Zd },
  { key: "Ctrl-n", run: _d, shift: Qd },
  { key: "Ctrl-a", run: w0, shift: E0 },
  { key: "Ctrl-e", run: x0, shift: I0 },
  { key: "Ctrl-d", run: sf },
  { key: "Ctrl-h", run: Jl },
  { key: "Ctrl-k", run: F0 },
  { key: "Ctrl-Alt-h", run: rf },
  { key: "Ctrl-o", run: U0 },
  { key: "Ctrl-t", run: G0 },
  { key: "Ctrl-v", run: Xl }
], ob = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Hd, shift: qd, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: d0, shift: M0, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: b0, shift: B0, preventDefault: !0 },
  { key: "ArrowRight", run: zd, shift: Yd, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: f0, shift: A0, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: k0, shift: O0, preventDefault: !0 },
  { key: "ArrowUp", run: Kd, shift: Zd, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: gc, shift: yc },
  { mac: "Ctrl-ArrowUp", run: fc, shift: pc },
  { key: "ArrowDown", run: _d, shift: Qd, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: vc, shift: bc },
  { mac: "Ctrl-ArrowDown", run: Xl, shift: mc },
  { key: "PageUp", run: fc, shift: pc },
  { key: "PageDown", run: Xl, shift: mc },
  { key: "Home", run: y0, shift: L0, preventDefault: !0 },
  { key: "Mod-Home", run: gc, shift: yc },
  { key: "End", run: v0, shift: D0, preventDefault: !0 },
  { key: "Mod-End", run: vc, shift: bc },
  { key: "Enter", run: kc, shift: kc },
  { key: "Mod-a", run: R0 },
  { key: "Backspace", run: Jl, shift: Jl, preventDefault: !0 },
  { key: "Delete", run: sf, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: rf, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: W0, preventDefault: !0 },
  { mac: "Mod-Backspace", run: K0, preventDefault: !0 },
  { mac: "Mod-Delete", run: _0, preventDefault: !0 }
].concat(/* @__PURE__ */ sb.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), rb = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: m0, shift: T0 },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: g0, shift: $0 },
  { key: "Alt-ArrowUp", run: j0 },
  { key: "Shift-Alt-ArrowUp", run: Y0 },
  { key: "Alt-ArrowDown", run: q0 },
  { key: "Shift-Alt-ArrowDown", run: X0 },
  { key: "Mod-Alt-ArrowUp", run: V0 },
  { key: "Mod-Alt-ArrowDown", run: H0 },
  { key: "Escape", run: z0 },
  { key: "Mod-Enter", run: Q0 },
  { key: "Alt-l", mac: "Ctrl-l", run: P0 },
  { key: "Mod-i", run: N0, preventDefault: !0 },
  { key: "Mod-[", run: nb },
  { key: "Mod-]", run: tb },
  { key: "Mod-Alt-\\", run: eb },
  { key: "Shift-Mod-k", run: J0 },
  { key: "Shift-Mod-\\", run: C0 },
  { key: "Mod-/", run: o0 },
  { key: "Alt-A", mac: "Ctrl-A", run: l0 },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: ib }
].concat(ob);
class wc {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.diagnostic = n;
  }
}
class xi {
  constructor(e, t, n) {
    this.diagnostics = e, this.panel = t, this.selected = n;
  }
  static init(e, t, n) {
    let s = n.facet(js).markerFilter;
    s && (e = s(e, n));
    let o = e.slice().sort((f, m) => f.from - m.from || f.to - m.to), r = new Ai(), l = [], a = 0, u = n.doc.iter(), c = 0, d = n.doc.length;
    for (let f = 0; ; ) {
      let m = f == o.length ? null : o[f];
      if (!m && !l.length)
        break;
      let y, v;
      if (l.length)
        y = a, v = l.reduce(($, P) => Math.min($, P.to), m && m.from > y ? m.from : 1e8);
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
      let k = !1;
      if (l.some(($) => $.from == y && ($.to == v || v == d)) && (k = y == v, !k && v - y < 10)) {
        let $ = y - (c + u.value.length);
        $ > 0 && (u.next($), c = y);
        for (let P = y; ; ) {
          if (P >= v) {
            k = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > P)
            break;
          P = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let w = gf(l);
      if (k)
        r.add(y, y, Ze.widget({
          widget: new cb(w),
          diagnostics: l.slice()
        }));
      else {
        let $ = l.reduce((P, R) => R.markClass ? P + " " + R.markClass : P, "");
        r.add(y, v, Ze.mark({
          class: "cm-lintRange cm-lintRange-" + w + $,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((P) => P.to > v)
        }));
      }
      if (a = v, a == d)
        break;
      for (let $ = 0; $ < l.length; $++)
        l[$].to <= a && l.splice($--, 1);
    }
    let h = r.finish();
    return new xi(h, t, ls(h));
  }
}
function ls(i, e = null, t = 0) {
  let n = null;
  return i.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!n)
        n = new wc(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(n.diagnostic) < 0)
          return !1;
        n = new wc(n.from, o, n.diagnostic);
      }
  }), n;
}
function cf(i, e) {
  let t = e.pos, n = e.end || t, s = i.state.facet(js).hideOn(i, t, n);
  if (s != null)
    return s;
  let o = i.startState.doc.lineAt(e.pos);
  return !!(i.effects.some((r) => r.is(Ar)) || i.changes.touchesRange(o.from, Math.max(o.to, n)));
}
function lb(i, e) {
  return i.field(an, !1) ? e : e.concat(Xe.appendConfig.of(bb));
}
function ol(i, e) {
  return {
    effects: lb(i, [Ar.of(e)])
  };
}
const Ar = /* @__PURE__ */ Xe.define(), hf = /* @__PURE__ */ Xe.define(), df = /* @__PURE__ */ Xe.define(), an = /* @__PURE__ */ cn.define({
  create() {
    return new xi(Ze.none, null, null);
  },
  update(i, e) {
    if (e.docChanged && i.diagnostics.size) {
      let t = i.diagnostics.map(e.changes), n = null, s = i.panel;
      if (i.selected) {
        let o = e.changes.mapPos(i.selected.from, 1);
        n = ls(t, i.selected.diagnostic, o) || ls(t, null, o);
      }
      !t.size && s && e.state.facet(js).autoPanel && (s = null), i = new xi(t, s, n);
    }
    for (let t of e.effects)
      if (t.is(Ar)) {
        let n = e.state.facet(js).autoPanel ? t.value.length ? sr.open : null : i.panel;
        i = xi.init(t.value, n, e.state);
      } else t.is(hf) ? i = new xi(i.diagnostics, t.value ? sr.open : null, i.selected) : t.is(df) && (i = new xi(i.diagnostics, i.panel, t.value));
    return i;
  },
  provide: (i) => [
    Fl.from(i, (e) => e.panel),
    ye.decorations.from(i, (e) => e.diagnostics)
  ]
}), ab = /* @__PURE__ */ Ze.mark({ class: "cm-lintRange cm-lintRange-active" });
function ub(i, e, t) {
  let { diagnostics: n } = i.state.field(an), s, o = -1, r = -1;
  n.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = i.state.facet(js).tooltipFilter;
  return s && l && (s = l(s, i.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: ff(i, s) };
    }
  } : null;
}
function ff(i, e) {
  return An("ul", { class: "cm-tooltip-lint" }, e.map((t) => mf(i, t, !1)));
}
const xc = (i) => {
  let e = i.state.field(an, !1);
  return !e || !e.panel ? !1 : (i.dispatch({ effects: hf.of(!1) }), !0);
}, js = /* @__PURE__ */ fe.define({
  combine(i) {
    return {
      sources: i.map((e) => e.source).filter((e) => e != null),
      ...fr(i.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: Sc,
        tooltipFilter: Sc,
        needsRefresh: (e, t) => e ? t ? (n) => e(n) || t(n) : e : t,
        hideOn: (e, t) => e ? t ? (n, s, o) => e(n, s, o) || t(n, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function Sc(i, e) {
  return i ? e ? (t, n) => e(i(t, n), n) : i : e;
}
function pf(i) {
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
function mf(i, e, t) {
  var n;
  let s = t ? pf(e.actions) : [];
  return An("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, An("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(i) : e.message), (n = e.actions) === null || n === void 0 ? void 0 : n.map((o, r) => {
    let l = !1, a = (f) => {
      if (f.preventDefault(), l)
        return;
      l = !0;
      let m = ls(i.state.field(an).diagnostics, e);
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
class cb extends Js {
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
class Cc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = mf(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class sr {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          xc(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = pf(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = ls(this.view.state.field(an).diagnostics, o);
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
      onclick: () => xc(this.view)
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
        d < 0 ? (h = new Cc(this.view, c), this.items.splice(n, 0, h), s = !0) : (h = this.items[d], d > n && (this.items.splice(n, d - n), s = !0)), t && h.diagnostic == t.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), o = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), n++;
      }
    }); n < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Cc(this.view, {
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
    let t = this.view.state.field(an), n = ls(t.diagnostics, this.items[e].diagnostic);
    n && this.view.dispatch({
      selection: { anchor: n.from, head: n.to },
      scrollIntoView: !0,
      effects: df.of(n)
    });
  }
  static open(e) {
    return new sr(e);
  }
}
function Ho(i, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(i)}</svg>')`;
}
function Co(i) {
  return Ho(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${i}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const hb = /* @__PURE__ */ ye.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Co("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Co("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Co("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Co("#66d") },
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
function db(i) {
  return i == "error" ? 4 : i == "warning" ? 3 : i == "info" ? 2 : 1;
}
function gf(i) {
  let e = "hint", t = 1;
  for (let n of i) {
    let s = db(n.severity);
    s > t && (t = s, e = n.severity);
  }
  return e;
}
class vf extends ci {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = gf(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let n = this.diagnostics, s = e.state.facet(Tr).tooltipFilter;
    return s && (n = s(n, e.state)), n.length && (t.onmouseover = () => pb(e, t, n)), t;
  }
}
function fb(i, e) {
  let t = (n) => {
    let s = e.getBoundingClientRect();
    if (!(n.clientX > s.left - 10 && n.clientX < s.right + 10 && n.clientY > s.top - 10 && n.clientY < s.bottom + 10)) {
      for (let o = n.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), i.state.field(yf) && i.dispatch({ effects: Oa.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function pb(i, e, t) {
  function n() {
    let r = i.elementAtHeight(e.getBoundingClientRect().top + 5 - i.documentTop);
    i.coordsAtPos(r.from) && i.dispatch({ effects: Oa.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: ff(i, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, fb(i, e);
  }
  let { hoverTime: s } = i.state.facet(Tr), o = setTimeout(n, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(n, s);
  };
}
function mb(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = i.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let n = [];
  for (let s in t)
    n.push(new vf(t[s]).range(+s));
  return Pe.of(n, !0);
}
const gb = /* @__PURE__ */ ry({
  class: "cm-gutter-lint",
  markers: (i) => i.state.field(Zl),
  widgetMarker: (i, e, t) => {
    let n = [];
    return i.state.field(Zl).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && n.push(...r.diagnostics);
    }), n.length ? new vf(n) : null;
  }
}), Zl = /* @__PURE__ */ cn.define({
  create() {
    return Pe.empty;
  },
  update(i, e) {
    i = i.map(e.changes);
    let t = e.state.facet(Tr).markerFilter;
    for (let n of e.effects)
      if (n.is(Ar)) {
        let s = n.value;
        t && (s = t(s || [], e.state)), i = mb(e.state.doc, s.slice(0));
      }
    return i;
  }
}), Oa = /* @__PURE__ */ Xe.define(), yf = /* @__PURE__ */ cn.define({
  create() {
    return null;
  },
  update(i, e) {
    return i && e.docChanged && (i = cf(e, i) ? null : { ...i, pos: e.changes.mapPos(i.pos) }), e.effects.reduce((t, n) => n.is(Oa) ? n.value : t, i);
  },
  provide: (i) => ba.from(i)
}), vb = /* @__PURE__ */ ye.baseTheme({
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
    content: /* @__PURE__ */ Ho('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ Ho('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ Ho('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), yb = /* @__PURE__ */ ty(ub, { hideOn: cf }), bb = [
  an,
  /* @__PURE__ */ ye.decorations.compute([an], (i) => {
    let { selected: e, panel: t } = i.field(an);
    return !e || !t || e.from == e.to ? Ze.none : Ze.set([
      ab.range(e.from, e.to)
    ]);
  }),
  yb,
  hb
], Tr = /* @__PURE__ */ fe.define({
  combine(i) {
    return fr(i, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function kb(i = {}) {
  return [Tr.of(i), Zl, gb, vb, yf];
}
const Mc = /* @__PURE__ */ Dt({
  __name: "AbcEditor",
  props: {
    text: {},
    diagnostics: {},
    reveal: {},
    readonly: { type: Boolean }
  },
  emits: ["change", "cursor"],
  setup(i, { emit: e }) {
    const t = i, n = e, s = z(null);
    let o = null, r = !1;
    const l = Aa.define({
      token(h) {
        return h.sol() && h.match(/^%.*/) ? "comment" : h.sol() && h.match(/^[A-Za-z]:.*/) ? "meta" : h.match(/^"[^"\n]*"/) ? "string" : h.match(/^\[K:[^\]\n]*\]/) ? "meta" : h.eat("|") ? "punctuation" : h.match(/^[zZ][0-9]*/) ? "atom" : h.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (h.next(), null);
      },
      startState: () => null
    }), a = xr.define([
      { tag: $e.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: $e.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: $e.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: $e.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: $e.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
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
    Xs(() => {
      s.value && (o = new ye({
        parent: s.value,
        state: _e.create({
          doc: t.text,
          extensions: [
            fy(),
            Hv(),
            _v(),
            fd.of(rb),
            l,
            _y(a),
            kb(),
            u,
            ye.lineWrapping,
            _e.readOnly.of(!!t.readonly),
            ye.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            ye.updateListener.of((h) => {
              h.docChanged && !r && n("change", h.state.doc.toString()), h.selectionSet && !r && h.transactions.some((f) => f.isUserEvent("select")) && n("cursor", h.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(ol(o.state, c(o.state))));
    }), zn(() => o?.destroy()), Re(
      () => t.text,
      (h) => {
        if (!o || o.state.doc.toString() === h) return;
        r = !0;
        const f = Math.min(o.state.selection.main.head, h.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: h }, selection: { anchor: f } }), r = !1, o.dispatch(ol(o.state, c(o.state)));
      }
    ), Re(
      () => t.diagnostics,
      () => {
        o && o.dispatch(ol(o.state, c(o.state)));
      }
    ), Re(
      () => t.reveal,
      (h) => {
        if (!o || !h) return;
        const f = o.state.doc.length, [m, y] = [Math.min(h[0], f), Math.min(h[1], f)], v = o.state.selection.main;
        v.from === m && v.to === y || (r = !0, o.dispatch({ selection: J.single(m, y) }), r = !1, d(o, m));
      }
    );
    function d(h, f) {
      const m = h.scrollDOM, y = h.lineBlockAt(f);
      (y.top < m.scrollTop || y.bottom > m.scrollTop + m.clientHeight) && (m.scrollTop = Math.max(0, y.top - m.clientHeight / 3));
    }
    return (h, f) => (b(), C("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), Sn = 18, ki = 24, Pn = Sn + ki, As = 22, Ts = 34, qt = 36, wb = 6, Ac = 3, xb = 12, bf = 6, kf = 28, Sb = 21, Cb = 108;
function Ea(i) {
  return [
    ...i.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...i.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function $r(i) {
  const e = Number(i.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function Mb(i, e) {
  return e === "auto" ? Math.max(1, i.grid.snap) : Math.max(1, Math.round($r(i) / e));
}
function Ab(i, e = 4, t = 24) {
  let n = i.length ? Math.min(...i.map((o) => o.pitch)) - e : 60, s = i.length ? Math.max(...i.map((o) => o.pitch)) + e : 79;
  if (s - n + 1 < t) {
    const o = t - (s - n + 1);
    n -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return n < 0 && ([n, s] = [0, Math.min(127, s - n)]), s > 127 && ([n, s] = [Math.max(0, n - (s - 127)), 127]), [n, s];
}
function Tb(i) {
  const e = i.map((s) => s.pitch), t = Math.max(0, Math.min(Sb, ...e.map((s) => s - 2))), n = Math.min(127, Math.max(Cb, ...e.map((s) => s + 2)));
  return [t, n];
}
function $b(i, e) {
  const t = Pn + (e.lyrics ? As : 0), n = t + (e.source ? Ts : 0), s = Ea(i), [o, r] = Tb(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(i.grid.units_per_quarter, 1e-9), u = Math.max(bf, Math.min(kf, Math.round(e.rowHeight ?? xb))), c = Mb(i, e.snap), d = Math.max(1, Math.round(i.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: Ab(s),
    total: i.total,
    snap: c,
    drawLength: Math.max(c, Math.round(d / c) * c),
    width: qt + i.total * a + 40,
    height: n + l * u,
    top: n,
    sourceTop: e.source ? t : null
  };
}
const Ke = (i, e) => qt + i * e.pxPerUnit, xn = (i, e) => (i - qt) / e.pxPerUnit, as = (i, e) => e.top + (e.high - i) * e.rowHeight;
function wf(i, e, t, n) {
  const s = (as(n, i) + as(t, i) + i.rowHeight) / 2, o = Math.max(0, e - i.top), r = s - i.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, i.height - e), r)));
}
function Tc(i, e, t, n) {
  const s = as(n, i);
  return s >= e + i.top && s + i.rowHeight <= e + t ? null : wf(i, t, n, n);
}
function or(i, e) {
  const t = e.high - Math.floor((i - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const Ql = (i, e) => Math.floor(i / e) * e, Mo = (i, e) => Math.round(i / e) * e;
function ii(i, e) {
  return {
    x: Ke(i.onset, e),
    y: as(i.pitch, e) + 0.5,
    width: Math.max(2, i.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function rr(i, e, t) {
  const n = i.name.length * 7 + 10, s = e ? (e.onset - i.onset) * t.pxPerUnit - 2 : n;
  return Math.max(12, Math.min(n, s));
}
const Db = (i) => [1, 3, 6, 8, 10].includes((i % 12 + 12) % 12);
function Lb(i) {
  return `C${Math.floor(i / 12) - 1}`;
}
function Bb(i) {
  const e = [];
  for (const t of i.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const n = Number(t.meter.split("/")[0]) || 1, s = t.length / n;
    for (let o = 1; o < n; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function $c(i, e, t, n, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, xn(i, s))), u = e - r;
  if (u < Sn) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= Pn && u < s.top) return { area: "lyrics", unit: a };
  if (u < Pn) {
    for (let h = n.length - 1; h >= 0; h--) {
      const f = n[h], m = Ke(f.onset, s);
      if (i >= m && i <= m + rr(f, n[h + 1], s)) return { area: "chord", chord: f };
    }
    return { area: "lane", unit: a };
  }
  if (i - l < qt) return { area: "keys", pitch: or(e, s) };
  const c = t.filter((h) => {
    const f = ii(h, s);
    return i >= f.x && i <= f.x + f.width && e >= f.y - 0.5 && e <= f.y + f.height + 0.5;
  }), d = c.find((h) => h.track === o) ?? c[0];
  if (d) {
    const h = ii(d, s), f = i >= h.x + h.width - Math.min(wb, h.width / 3) ? "end" : "body";
    return { area: "note", note: d, edge: f };
  }
  return { area: "grid", unit: a, pitch: or(e, s) };
}
function xf(i, e, t) {
  return i.y0 < (i.from?.scrollTop ?? t) + e || i.y1 < t + e;
}
function Sf(i, e, t = 0, n = 0) {
  const s = i.from?.scrollTop ?? t, o = i.from?.scrollLeft ?? n, r = (h, f) => Math.max(f + qt, Math.min(e.width, h)), l = (h, f) => Math.max(f + e.top, Math.min(e.height, h)), a = [r(i.x0, o), r(i.x1, n)], u = [l(i.y0, s), l(i.y1, t)], c = Math.min(...a), d = Math.min(...u);
  return { x: c, y: d, width: Math.max(...a) - c, height: Math.max(...u) - d };
}
function Ob(i, e = 0, t = Pn) {
  return xf(i, t, e);
}
function Eb(i, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : i.filter((n) => {
    const s = ii(n, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function Ib(i, e, t, n = 0, s = 0) {
  if (!xf(e, t.top, n)) return [];
  const o = Sf(e, t, n, s);
  return o.width <= 0 ? [] : i.filter((r, l) => {
    const a = Ke(r.onset, t);
    return a < o.x + o.width && a + rr(r, i[l + 1], t) > o.x;
  });
}
function Rb(i, e, t, n) {
  return { kind: "move", notes: i, anchor: e, fromUnit: t, fromPitch: n, delta: 0, semitones: 0 };
}
function Pb(i, e = [], t = 1 / 0) {
  const n = e.filter((o) => o.track === i.track && o.onset > i.onset).map((o) => o.onset), s = Math.min(t, ...n);
  return { kind: "resize", note: i, end: i.onset + i.duration, overwrite: !1, limit: s };
}
function Nb(i, e, t, n) {
  const s = Math.max(0, Math.min(Ql(e, n.snap), n.total - 1));
  return { kind: "draw", track: i, start: s, end: Math.min(n.total, s + n.snap), pitch: t };
}
function Vb(i, e = i.onset) {
  return { kind: "chord", chord: i, fromUnit: e, to: i.onset };
}
const $s = (i, e, t) => Math.max(e, Math.min(t, i));
function Hb(i, e, t, n, s) {
  switch (i.kind) {
    case "move": {
      const o = i.anchor.onset + (e - i.fromUnit), r = Math.min(...i.notes.map((h) => h.onset)), l = Math.max(...i.notes.map((h) => h.onset + h.duration)), a = $s(Mo(o, n.snap) - i.anchor.onset, -r, n.total - l), u = Math.min(...i.notes.map((h) => h.pitch)), c = Math.max(...i.notes.map((h) => h.pitch)), d = $s(t - i.fromPitch, -u, 127 - c);
      return { ...i, delta: a, semitones: d, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(n.snap, n.total - i.note.onset), r = s.alt ? n.total : Math.max(i.note.onset + i.note.duration, Math.min(n.total, i.limit)), l = $s(Mo(e, n.snap), i.note.onset + Math.max(1, o), r);
      return { ...i, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= i.start ? i.start + n.snap : Math.max(i.start + n.snap, Mo(e, n.snap));
      return { ...i, end: Math.min(n.total, o) };
    }
    case "chord":
      return { ...i, to: $s(Mo(i.chord.onset + e - i.fromUnit, n.snap), 0, n.total - 1) };
  }
}
function zb(i, e) {
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
function Wb(i) {
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
function Fb(i) {
  return i ? i.kind === "move" ? i.copy ? /* @__PURE__ */ new Set() : new Set(i.notes.map((e) => e.id)) : i.kind === "resize" ? /* @__PURE__ */ new Set([i.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Kb(i, e, t, n, s, o) {
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
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((h) => h.onset)), c = Math.max(...t.map((h) => h.onset + h.duration)), d = $s(l * a, -u, s.total - c);
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
const _b = /^(vocal|ins):\d+$/;
function us(i, e) {
  const t = i?.model?.tracks, n = /* @__PURE__ */ new Set();
  if (!t) return n;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (_b.test(o)) n.add(o);
    else {
      const r = s.get(o);
      r && n.add(r);
    }
  return n;
}
function qs(i) {
  return new Set(i.filter((e) => e.startsWith("chord:")));
}
function Ao(i, e = []) {
  return [...i.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const Cf = [
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
], Ub = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Mf(i, e) {
  let t = null;
  for (const n of i.measures) n.onset <= e && (t = n);
  return t;
}
function Af(i, e, t) {
  const n = i?.model;
  if (!n) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = us(i, e), o = qs(e), r = Ea(n).filter((d) => s.has(d.id)), l = n.tracks.chords.filter((d) => o.has(d.id)), a = r.length === 1 ? n.tracks.chords.find((d) => d.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Mf(n, u) : t ? n.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function Gb(i, e) {
  const t = Mf(i, e) ?? i.measures[0], n = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(n / o) + 1, l = n - (r - 1) * o, a = $r(i), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: n, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function jb(i, e, t) {
  const n = i.measures[e - 1];
  return !n || !Number.isInteger(t) || t < 0 || t >= n.length ? null : n.onset + t;
}
const qb = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, Yb = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function ea(i) {
  return `${Yb[i % 12]}${Math.floor(i / 12) - 1}`;
}
function Xb(i) {
  const e = i.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const n = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + qb[t[1].toUpperCase()] + n;
  return s >= 0 && s <= 127 ? s : null;
}
function Jb(i) {
  const e = $r(i), t = [];
  for (const n of [32, 16, 8, 4, 2, 1]) {
    e % n === 0 && t.push({ label: `1/${n}`, units: e / n });
    const s = e / n * 1.5;
    n >= 2 && n <= 16 && Number.isInteger(s) && t.push({ label: `1/${n}.`, units: s });
  }
  return t.sort((n, s) => n.units - s.units);
}
function Zb(i, e) {
  return !i.length || i.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: i.map((t) => t.id), midi: e };
}
function Xn(i, e, t = []) {
  return !i.length && !t.length || i.some((n) => n.pitch + e < 0 || n.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...i.map((n) => n.id), ...t.map((n) => n.id)], semitones: e };
}
function Dc(i, e) {
  return !i.length || i.every((t) => t.track === e) ? null : { op: "move_notes", ids: i.map((t) => t.id), track: e };
}
function Qb(i, e, t) {
  return t === null || t === e.onset || t + e.duration > i.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function e1(i, e, t, n) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > i.total ? null : { op: "resize_note", id: e.id, duration: t, mode: n };
}
function t1(i, e, t) {
  const n = e.trim();
  return n ? t?.name === n ? null : { op: "put_chord", onset: i, name: n } : t ? { op: "delete_chord", onset: i } : null;
}
function n1(i, e) {
  return e === null || e === i.onset ? null : { op: "move_chord", onset: i.onset, to: e };
}
function Lc(i, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? i.n : i.n + 1, count: t };
}
function i1(i, e = 1) {
  return { op: "duplicate_measures", bar: i.n, count: e };
}
function s1(i, e, t = 1) {
  return i.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Bc(i, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === i.meter ? null : { op: "change_meter", bar: i.n, count: 1, meter: t };
}
function Tf(i, e) {
  return i.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function o1(i, e) {
  return !Cf.includes(e) || e === i.key ? null : { op: "put_key", onset: i.onset, key: e };
}
function r1(i, e) {
  const t = Tf(i, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function l1(i, e) {
  return i === "text" ? "text" : i === "daw" ? "daw" : i === "review" ? "review" : e;
}
const a1 = {
  class: "inspector",
  "aria-label": "Inspector"
}, u1 = {
  key: 0,
  class: "facts"
}, c1 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, h1 = {
  key: 0,
  class: "facts"
}, d1 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, f1 = ["disabled"], p1 = ["disabled"], m1 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, g1 = ["disabled"], v1 = ["disabled"], y1 = ["disabled", "onKeydown"], b1 = ["disabled"], k1 = ["disabled"], w1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, x1 = ["disabled", "onKeydown"], S1 = ["disabled", "aria-label", "onKeydown"], C1 = { class: "facts" }, M1 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, A1 = ["disabled", "aria-label"], T1 = ["disabled"], $1 = ["value"], D1 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, L1 = ["disabled"], B1 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, O1 = ["disabled", "onKeydown"], E1 = { class: "field" }, I1 = ["disabled"], R1 = ["disabled"], P1 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, N1 = {
  key: 0,
  class: "facts"
}, V1 = { class: "field" }, H1 = ["disabled", "onKeydown"], z1 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, W1 = ["disabled"], F1 = ["disabled"], K1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, _1 = ["disabled", "onKeydown"], U1 = ["disabled", "onKeydown"], G1 = { class: "field" }, j1 = ["disabled"], q1 = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, Y1 = { class: "facts" }, X1 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, J1 = ["disabled"], Z1 = ["disabled"], Q1 = { class: "field" }, ek = ["disabled"], tk = ["aria-label"], nk = { class: "facts" }, ik = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, sk = ["disabled"], ok = ["disabled"], rk = ["disabled"], lk = ["disabled"], ak = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, uk = ["disabled"], ck = { id: "plenio-meters" }, hk = ["value"], dk = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, fk = ["disabled"], pk = ["value"], mk = ["disabled"], gk = {
  key: 4,
  class: "facts"
}, vk = {
  key: 5,
  class: "error"
}, yk = /* @__PURE__ */ Dt({
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
    const e = i, t = O(() => e.view?.model ?? null), n = O(() => Af(e.view, e.selection, e.fallbackBar)), s = O(() => n.value.notes.length === 1 ? n.value.notes[0] : null), o = O(() => n.value.chords.length === 1 && !n.value.notes.length ? n.value.chords[0] : null), r = O(() => n.value.measure), l = O(() => !e.readonly && !e.stale && !e.busy), a = O(() => t.value ? Jb(t.value) : []), u = O(() => t.value && r.value ? Tf(t.value, r.value) : null), c = O(() => {
      const W = s.value?.onset ?? o.value?.onset;
      return t.value && W !== void 0 ? Gb(t.value, W) : null;
    }), d = O(() => {
      const W = new Set(n.value.notes.map((T) => T.track));
      return W.size === 1 ? [...W][0] : W.size ? "mixed" : null;
    }), h = z(""), f = z(1), m = z(0), y = z(1), v = z(!1), k = z(""), w = z("4/4"), $ = z("C");
    Re(
      [s, o, r, () => n.value.chordAtNote],
      () => {
        const W = s.value;
        h.value = W ? ea(W.pitch) : "", y.value = W?.duration ?? 1, f.value = c.value?.bar ?? 1, m.value = c.value?.offset ?? 0, k.value = (W ? n.value.chordAtNote?.name : o.value?.name) ?? "", w.value = r.value?.meter ?? "4/4", $.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const P = z(null);
    async function R(W) {
      !W || !l.value || (P.value = null, await e.operate(W));
    }
    function V() {
      const W = Xb(h.value);
      if (W === null) {
        P.value = `"${h.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, h.value = s.value ? ea(s.value.pitch) : "";
        return;
      }
      R(Zb(n.value.notes, W));
    }
    function E() {
      const W = t.value;
      if (!W) return;
      const T = jb(W, Number(f.value), Number(m.value));
      if (T === null) {
        P.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? R(Qb(W, s.value, T)) : o.value && R(n1(o.value, T));
    }
    function _(W = Number(y.value)) {
      const T = t.value;
      !T || !s.value || R(e1(T, s.value, W, v.value ? "overwrite" : e.resizeMode));
    }
    function N() {
      const W = s.value?.onset ?? o.value?.onset;
      W !== void 0 && R(t1(W, k.value, s.value ? n.value.chordAtNote : o.value));
    }
    function ne(W) {
      const T = [...n.value.notes.map((H) => H.id), ...n.value.chords.map((H) => H.id)];
      T.length && R({ op: W ? "delete_close_gap" : "delete", ids: T });
    }
    return (W, T) => (b(), C("aside", a1, [
      t.value ? (b(), C(he, { key: 1 }, [
        n.value.notes.length ? (b(), C("section", c1, [
          p("h4", null, [
            ae(I(s.value ? `${d.value === "vocal" ? "Vocal" : "Ins"} note` : `${n.value.notes.length} notes`) + " ", 1),
            c.value ? (b(), C("span", h1, I(c.value.text), 1)) : U("", !0)
          ]),
          p("div", d1, [
            T[36] || (T[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: ze({ active: d.value === "vocal" }),
              disabled: !l.value,
              onClick: T[0] || (T[0] = (H) => R(L(Dc)(n.value.notes, "vocal")))
            }, "Vocal", 10, f1),
            p("button", {
              class: ze({ active: d.value === "ins" }),
              disabled: !l.value,
              onClick: T[1] || (T[1] = (H) => R(L(Dc)(n.value.notes, "ins")))
            }, "Ins", 10, p1)
          ]),
          p("div", m1, [
            T[37] || (T[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: T[2] || (T[2] = (H) => R(L(Xn)(n.value.notes, -12, n.value.chords)))
            }, "−8va", 8, g1),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: T[3] || (T[3] = (H) => R(L(Xn)(n.value.notes, -1, n.value.chords)))
            }, "−1", 8, v1),
            s.value ? Oe((b(), C("input", {
              key: 0,
              "onUpdate:modelValue": T[4] || (T[4] = (H) => h.value = H),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: ot(Ue(V, ["prevent"]), ["enter"]),
              onChange: V
            }, null, 40, y1)), [
              [ft, h.value]
            ]) : U("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: T[5] || (T[5] = (H) => R(L(Xn)(n.value.notes, 1, n.value.chords)))
            }, "+1", 8, b1),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: T[6] || (T[6] = (H) => R(L(Xn)(n.value.notes, 12, n.value.chords)))
            }, "+8va", 8, k1)
          ]),
          s.value ? (b(), C(he, { key: 0 }, [
            p("div", w1, [
              T[38] || (T[38] = p("span", { class: "name" }, "start", -1)),
              T[39] || (T[39] = ae(" bar ", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": T[7] || (T[7] = (H) => f.value = H),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: ot(Ue(E, ["prevent"]), ["enter"]),
                onChange: E
              }, null, 40, x1), [
                [
                  ft,
                  f.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              T[40] || (T[40] = ae(" + ", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": T[8] || (T[8] = (H) => m.value = H),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: ot(Ue(E, ["prevent"]), ["enter"]),
                onChange: E
              }, null, 40, S1), [
                [
                  ft,
                  m.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", C1, "× " + I(t.value.unit), 1)
            ]),
            p("div", M1, [
              T[42] || (T[42] = p("span", { class: "name" }, "length", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": T[9] || (T[9] = (H) => y.value = H),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: T[10] || (T[10] = ot(Ue((H) => _(), ["prevent"]), ["enter"])),
                onChange: T[11] || (T[11] = (H) => _())
              }, null, 40, A1), [
                [
                  ft,
                  y.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: T[12] || (T[12] = (H) => _(Number(H.target.value)))
              }, [
                T[41] || (T[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (b(!0), C(he, null, we(a.value, (H) => (b(), C("option", {
                  key: H.label,
                  value: H.units
                }, I(H.label), 9, $1))), 128))
              ], 40, T1)
            ]),
            p("label", D1, [
              Oe(p("input", {
                "onUpdate:modelValue": T[13] || (T[13] = (H) => v.value = H),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, L1), [
                [Nt, v.value]
              ]),
              T[43] || (T[43] = ae(" longer: over the next note ", -1))
            ]),
            p("div", B1, [
              T[44] || (T[44] = p("span", { class: "name" }, "chord", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": T[14] || (T[14] = (H) => k.value = H),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: ot(Ue(N, ["prevent"]), ["enter"]),
                onChange: N
              }, null, 40, O1), [
                [ft, k.value]
              ])
            ])
          ], 64)) : U("", !0),
          p("div", E1, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: T[15] || (T[15] = (H) => ne(!1))
            }, "→ rest", 8, I1),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: T[16] || (T[16] = (H) => ne(!0))
            }, "close gap", 8, R1)
          ])
        ])) : o.value ? (b(), C("section", P1, [
          p("h4", null, [
            T[45] || (T[45] = ae(" Chord symbol ", -1)),
            c.value ? (b(), C("span", N1, I(c.value.text), 1)) : U("", !0)
          ]),
          p("div", V1, [
            T[46] || (T[46] = p("span", { class: "name" }, "name", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": T[17] || (T[17] = (H) => k.value = H),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: ot(Ue(N, ["prevent"]), ["enter"]),
              onChange: N
            }, null, 40, H1), [
              [ft, k.value]
            ])
          ]),
          p("div", z1, [
            T[47] || (T[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: T[18] || (T[18] = (H) => R(L(Xn)([], -1, n.value.chords)))
            }, "−1", 8, W1),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: T[19] || (T[19] = (H) => R(L(Xn)([], 1, n.value.chords)))
            }, "+1", 8, F1)
          ]),
          p("div", K1, [
            T[48] || (T[48] = p("span", { class: "name" }, "start", -1)),
            T[49] || (T[49] = ae(" bar ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": T[20] || (T[20] = (H) => f.value = H),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: ot(Ue(E, ["prevent"]), ["enter"]),
              onChange: E
            }, null, 40, _1), [
              [
                ft,
                f.value,
                void 0,
                { number: !0 }
              ]
            ]),
            T[50] || (T[50] = ae(" + ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": T[21] || (T[21] = (H) => m.value = H),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: ot(Ue(E, ["prevent"]), ["enter"]),
              onChange: E
            }, null, 40, U1), [
              [
                ft,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", G1, [
            p("button", {
              disabled: !l.value,
              onClick: T[22] || (T[22] = (H) => ne(!1))
            }, "remove", 8, j1)
          ])
        ])) : n.value.chords.length > 1 ? (b(), C("section", q1, [
          p("h4", null, [
            ae(I(n.value.chords.length) + " chord symbols ", 1),
            p("span", Y1, I(n.value.chords.map((H) => H.name).join(" ")), 1)
          ]),
          p("div", X1, [
            T[51] || (T[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: T[23] || (T[23] = (H) => R(L(Xn)([], -1, n.value.chords)))
            }, "−1", 8, J1),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: T[24] || (T[24] = (H) => R(L(Xn)([], 1, n.value.chords)))
            }, "+1", 8, Z1)
          ]),
          p("div", Q1, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: T[25] || (T[25] = (H) => ne(!1))
            }, "remove", 8, ek)
          ])
        ])) : U("", !0),
        r.value ? (b(), C("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            ae(" Bar " + I(r.value.n) + " ", 1),
            p("span", nk, I(r.value.meter) + " · " + I(r.value.key), 1)
          ]),
          p("div", ik, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: T[26] || (T[26] = (H) => R(L(Lc)(r.value, "before")))
            }, "+ before", 8, sk),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: T[27] || (T[27] = (H) => R(L(Lc)(r.value, "after")))
            }, "+ after", 8, ok),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: T[28] || (T[28] = (H) => R(L(i1)(r.value)))
            }, "duplicate", 8, rk),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: T[29] || (T[29] = (H) => R(L(s1)(t.value, r.value)))
            }, "delete", 8, lk)
          ]),
          p("div", ak, [
            T[52] || (T[52] = p("span", { class: "name" }, "meter", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": T[30] || (T[30] = (H) => w.value = H),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: T[31] || (T[31] = ot(Ue((H) => R(L(Bc)(r.value, w.value)), ["prevent"]), ["enter"])),
              onChange: T[32] || (T[32] = (H) => R(L(Bc)(r.value, w.value)))
            }, null, 40, uk), [
              [ft, w.value]
            ]),
            p("datalist", ck, [
              (b(!0), C(he, null, we(L(Ub), (H) => (b(), C("option", {
                key: H,
                value: H
              }, null, 8, hk))), 128))
            ])
          ]),
          p("div", dk, [
            T[53] || (T[53] = p("span", { class: "name" }, "key", -1)),
            Oe(p("select", {
              "onUpdate:modelValue": T[33] || (T[33] = (H) => $.value = H),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: T[34] || (T[34] = (H) => R(L(o1)(r.value, $.value)))
            }, [
              (b(!0), C(he, null, we(L(Cf), (H) => (b(), C("option", {
                key: H,
                value: H
              }, I(H), 9, pk))), 128))
            ], 40, fk), [
              [ri, $.value]
            ]),
            u.value ? (b(), C("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: T[35] || (T[35] = (H) => R(L(r1)(t.value, r.value)))
            }, "remove change", 8, mk)) : U("", !0)
          ])
        ], 8, tk)) : U("", !0),
        !n.value.notes.length && !o.value && !r.value ? (b(), C("p", gk, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : U("", !0),
        P.value ? (b(), C("p", vk, I(P.value), 1)) : U("", !0)
      ], 64)) : (b(), C("p", u1, I(i.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), bk = { class: "keys-help" }, kk = ["aria-expanded"], wk = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, xk = /* @__PURE__ */ Dt({
  __name: "KeysHelp",
  setup(i) {
    const e = z(!1), t = [
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
    return (n, s) => (b(), C("span", bk, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, kk),
      e.value ? (b(), C("div", wk, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (b(), C(he, null, we(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, I(o.title), 1),
          p("table", null, [
            (b(!0), C(he, null, we(o.rows, ([r, l]) => (b(), C("tr", { key: r }, [
              p("th", null, I(r), 1),
              p("td", null, I(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : U("", !0)
    ]));
  }
}), Sk = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], ta = [4, 8, 16, 32, 64];
function Ck(i) {
  return i.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function Mk(i) {
  const e = {};
  for (const t of i) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function Ak(i) {
  const e = i?.model?.unit ?? i?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), n = Number.isFinite(t) && t > 0 ? t : 16, s = ta.filter((o) => o <= n);
  return s.length ? s[s.length - 1] : ta[0];
}
function Tk(i) {
  let e = "";
  for (let t = 0; t < i.length; t += 8192)
    e += String.fromCharCode(...i.subarray(t, t + 8192));
  return btoa(e);
}
function $k(i) {
  const e = atob(i), t = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
  return t;
}
function Zi(i, e, t = "audio/midi") {
  const n = new ArrayBuffer(e.length);
  new Uint8Array(n).set(e);
  const s = URL.createObjectURL(new Blob([n], { type: t })), o = document.createElement("a");
  o.href = s, o.download = i, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function Dk(i) {
  const e = i.name.trim() || "unnamed";
  return i.notes === 1 ? `${e} · 1 note` : `${e} · ${i.notes} notes`;
}
function Lk(i, e, t, { current: n = 0, keep: s = !0 } = {}) {
  const o = [...i];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && n) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${n} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Oc(i) {
  return typeof i == "object" && i !== null && !Array.isArray(i);
}
class Bk {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Oc(t) && Oc(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
  return i instanceof Jc ? `${i.message}${i.hint ? ` — ${i.hint}` : ""}` : String(i instanceof Error ? i.message : i);
}
function Ok(i) {
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
function Ek(i, e) {
  const t = Gi(null), n = Gi(null), s = z(null), o = z(!1), r = z(!1), l = z(null), a = z(null), u = z([]), c = z([]), d = new Bk(i.text), h = z(0);
  let f = "", m = 0, y, v = !1;
  const k = O(() => t.value && t.value.sha256 && !o.value ? t.value : null), w = O(() => Mi(n.value, c.value[0])), $ = O(() => (h.value, d.canUndo)), P = O(() => (h.value, d.canRedo)), R = O(() => (h.value, d.undoLabel)), V = O(() => (h.value, d.redoLabel)), E = O(
    () => Ok({
      text: i.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), _ = O(
    () => s.value !== null && s.value !== i.text && !!t.value && !t.value.ok
  );
  function N(ce, Ce) {
    if (t.value = ce, a.value = null, ce.ok) {
      n.value = ce, s.value = Ce;
      const te = pm(ce);
      c.value = c.value.filter((K) => te.has(K));
    }
  }
  async function ne() {
    const ce = i.text, Ce = ++m;
    if (f = ce, !ce.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const te = await np(e.fetcher, ce, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Ce !== m || f !== ce || i.text !== ce) return;
      N(te, ce), l.value = null;
    } catch (te) {
      i.text === ce && (l.value = Ci(te), a.value = l.value);
    } finally {
      i.text === ce && (o.value = !1);
    }
  }
  function W(ce = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(y), y = setTimeout(() => {
      ne();
    }, ce);
  }
  function T(ce, Ce, te, K) {
    ce !== i.text && (v = !0, i.text = ce, v = !1, d.record(ce, Ce, { group: te, extra: K }), h.value++, e.onEdit?.());
  }
  function H(ce) {
    T(ce, "typing", "typing"), W();
  }
  function me(ce, Ce, te = null, K) {
    return ce === i.text ? !1 : (d.seal(), K && d.annotate(K.before), T(ce, Ce, void 0, K?.after), d.seal(), clearTimeout(y), f = ce, o.value = !1, u.value = [], te && te.ok && (te.lyrics || !e.lyrics?.()) ? (N(te, ce), l.value = null) : W(0), !0);
  }
  async function ve(ce) {
    const Ce = i.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++m;
      const te = await ip(e.fetcher, Ce, ce, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (i.text !== Ce)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const K = e.onTransform?.(te, ce);
      return d.seal(), K && d.annotate(K.before), T(te.abc, te.changes[0] ?? ce.op, void 0, K?.after), d.seal(), clearTimeout(y), o.value = !1, f = te.abc, N(te.analysis, te.abc), u.value = [...te.changes, ...te.warnings.map((Q) => `warning: ${Q}`)], te.select.length && (c.value = mm(te.analysis, te.select)), !0;
    } catch (te) {
      return l.value = Ci(te), !1;
    } finally {
      r.value = !1;
    }
  }
  function ie(ce) {
    ce && (v = !0, i.text = ce.text, v = !1, ce.extra !== void 0 && e.onRestore?.(ce.extra), h.value++, e.onEdit?.(), u.value = [], W(0));
  }
  const le = () => ie(d.undo()), Ee = () => ie(d.redo());
  function Se() {
    const ce = s.value;
    return ce === null || ce === i.text || !n.value ? !1 : (d.seal(), T(ce, "revert to the last valid score"), d.seal(), clearTimeout(y), f = ce, o.value = !1, t.value = n.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Be(ce) {
    c.value = ce;
  }
  function Ae(ce, Ce, te) {
    d.seal(), d.annotate(Ce), d.record(i.text, ce, { extra: te, side: !0 }), d.seal(), h.value++;
  }
  function j() {
    r.value ? setTimeout(j, 60) : i.text.trim() && !o.value && ne();
  }
  Re(
    () => i.text,
    (ce) => {
      v || (d.seal(), d.record(ce, "document replaced"), d.seal(), h.value++, W(0));
    },
    { flush: "sync" }
  );
  function Qe() {
    clearTimeout(y);
  }
  return W(0), ws({
    view: t,
    lastValid: n,
    lastValidText: s,
    current: k,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: w,
    canUndo: $,
    canRedo: P,
    undoLabel: R,
    redoLabel: V,
    commitBlock: E,
    canRevert: _,
    typed: H,
    replaceText: me,
    operate: ve,
    undo: le,
    redo: Ee,
    revertToLastValid: Se,
    select: Be,
    analyze: ne,
    refreshLyrics: j,
    recordSide: Ae,
    dispose: Qe
  });
}
const Ik = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, Rk = { class: "facts" }, Pk = { class: "body" }, Nk = {
  key: 0,
  class: "hint"
}, Vk = {
  key: 1,
  class: "error",
  role: "alert"
}, Hk = { class: "tracks" }, zk = { class: "number" }, Wk = ["onUpdate:modelValue", "aria-label"], Fk = ["value", "title"], Kk = {
  key: 0,
  class: "hint"
}, _k = { class: "controls" }, Uk = { title: "Foreign timing is quantised to this note value" }, Gk = ["value"], jk = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, qk = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, Yk = { class: "report" }, Xk = { key: 0 }, Jk = ["disabled"], Zk = /* @__PURE__ */ Dt({
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
    const t = i, n = e, s = z(!1), o = z(null), r = z(null), l = z([]), a = z(Ak(t.view)), u = z(!1), c = z(t.keepsGuide), d = O(() => l.value.filter((k) => k.notes > 0)), h = O(() => l.value.filter((k) => k.notes === 0)), f = O(
      () => r.value ? Lk(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let m = 0;
    async function y(k) {
      const w = ++m;
      s.value = !0, o.value = null;
      try {
        const $ = await sp(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: k ? Mk(l.value) : void 0
        });
        if (w !== m) return;
        r.value = $, k || (l.value = Ck($.tracks));
      } catch ($) {
        w === m && (o.value = Ci($));
      } finally {
        w === m && (s.value = !1);
      }
    }
    function v() {
      y(!0);
    }
    return Xs(() => {
      y(!1);
    }), (k, w) => (b(), C("div", {
      class: "plenio-overlay",
      onMousedown: w[9] || (w[9] = Ue(($) => n("close"), ["self"]))
    }, [
      p("div", Ik, [
        p("header", null, [
          w[10] || (w[10] = p("h2", null, "Import MIDI", -1)),
          p("span", Rk, I(i.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: w[0] || (w[0] = ($) => n("close"))
          }, "×")
        ]),
        p("div", Pk, [
          s.value ? (b(), C("p", Nk, "Reading the file…")) : U("", !0),
          o.value ? (b(), C("p", Vk, I(o.value), 1)) : U("", !0),
          r.value && !o.value ? (b(), C(he, { key: 2 }, [
            p("table", Hk, [
              w[11] || (w[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (b(!0), C(he, null, we(d.value, ($) => (b(), C("tr", {
                  key: $.index
                }, [
                  p("td", null, [
                    p("span", zk, I($.number), 1),
                    ae(" " + I(L(Dk)($)), 1)
                  ]),
                  p("td", null, [
                    Oe(p("select", {
                      "onUpdate:modelValue": (P) => $.role = P,
                      "aria-label": `Role of track ${$.number}`,
                      onChange: w[1] || (w[1] = (P) => v())
                    }, [
                      (b(!0), C(he, null, we(L(Sk), (P) => (b(), C("option", {
                        key: P.value,
                        value: P.value,
                        title: P.title
                      }, I(P.label), 9, Fk))), 128))
                    ], 40, Wk), [
                      [ri, $.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            h.value.length ? (b(), C("p", Kk, " Empty track(s) not shown: " + I(h.value.map(($) => $.number).join(", ")) + ". ", 1)) : U("", !0),
            p("p", _k, [
              p("label", Uk, [
                w[12] || (w[12] = ae(" grid ", -1)),
                Oe(p("select", {
                  "onUpdate:modelValue": w[2] || (w[2] = ($) => a.value = $),
                  "aria-label": "Import grid",
                  onChange: w[3] || (w[3] = ($) => v())
                }, [
                  (b(!0), C(he, null, we(L(ta), ($) => (b(), C("option", {
                    key: $,
                    value: $
                  }, "1/" + I($), 9, Gk))), 128))
                ], 544), [
                  [
                    ri,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", jk, [
                Oe(p("input", {
                  "onUpdate:modelValue": w[4] || (w[4] = ($) => u.value = $),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: w[5] || (w[5] = ($) => v())
                }, null, 544), [
                  [Nt, u.value]
                ]),
                w[13] || (w[13] = ae(" read chords from the notes ", -1))
              ]),
              i.keepsGuide && r.value.guide.length ? (b(), C("label", qk, [
                Oe(p("input", {
                  "onUpdate:modelValue": w[6] || (w[6] = ($) => c.value = $),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [Nt, c.value]
                ]),
                w[14] || (w[14] = ae(" keep the Guide notes ", -1))
              ])) : U("", !0)
            ]),
            w[15] || (w[15] = p("h3", null, "What the import did", -1)),
            p("ul", Yk, [
              (b(!0), C(he, null, we(f.value, ($, P) => (b(), C("li", { key: P }, I($), 1))), 128)),
              f.value.length ? U("", !0) : (b(), C("li", Xk, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : U("", !0)
        ]),
        p("footer", null, [
          w[16] || (w[16] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            onClick: w[7] || (w[7] = ($) => n("close"))
          }, "Cancel"),
          p("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: w[8] || (w[8] = ($) => r.value && n("insert", r.value, c.value))
          }, " Insert ", 8, Jk)
        ])
      ])
    ], 32));
  }
}), Qk = {
  key: 0,
  class: "stale-note",
  role: "status"
}, ew = {
  key: 1,
  class: "error"
}, tw = /* @__PURE__ */ Dt({
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
    const n = i, s = t, o = z(null), r = z(null);
    let l = /* @__PURE__ */ new Map(), a = {
      "plenio-selected": [],
      "plenio-playing": []
    }, u = !1, c = null, d = 0;
    function h(w) {
      const $ = /* @__PURE__ */ new Map(), P = w.lines ?? [];
      for (const R of P)
        for (const V of R.staff ?? [])
          for (const E of V.voices ?? [])
            for (const _ of E)
              _.el_type === "note" && typeof _.endChar == "number" && _.abselem?.elemset && $.set(_.endChar, _.abselem.elemset);
      return $;
    }
    function f(w) {
      const $ = Mi(n.view, w);
      return $ ? l.get($.display[1]) ?? [] : [];
    }
    function m(w, $) {
      for (const P of a[w]) P.classList.remove(w);
      a[w] = $.flatMap(f);
      for (const P of a[w]) P.classList.add(w);
    }
    function y() {
      const w = o.value;
      if (!w) return;
      const $ = n.view?.display_abc;
      if (!$) {
        w.innerHTML = "", l = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const P = getComputedStyle(w).color || "#dddddd";
        d = w.clientWidth;
        const R = Fp.renderAbc(w, $, {
          add_classes: !0,
          responsive: "resize",
          scale: n.zoom,
          foregroundColor: P,
          selectionColor: P,
          staffwidth: Math.max(480, Math.floor(w.clientWidth / n.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (V) => {
            const E = V;
            if (!n.view || typeof E.startChar != "number" || typeof E.endChar != "number") return;
            const _ = gm(n.view, E.startChar, E.endChar);
            _ && s("select", _.id, u);
          }
        });
        l = h(R[0]), a = { "plenio-selected": [], "plenio-playing": [] }, m("plenio-selected", n.selection), m("plenio-playing", n.playing), r.value = null;
      } catch (P) {
        r.value = `The notation could not be drawn: ${P instanceof Error ? P.message : String(P)}`;
      }
    }
    function v(w) {
      const [$] = f(w), P = o.value?.parentElement;
      if (!$ || !P) return;
      const R = P.getBoundingClientRect(), V = $.getBoundingClientRect();
      V.top < R.top ? P.scrollTop += V.top - R.top - 8 : V.bottom > R.bottom && (P.scrollTop += V.bottom - R.bottom + 8), V.left < R.left ? P.scrollLeft += V.left - R.left - 8 : V.right > R.right && (P.scrollLeft += V.right - R.right + 8);
    }
    e({ reveal: v }), Re(() => [n.view?.display_abc, n.zoom], () => Cn(y)), Re(
      () => n.selection,
      (w) => {
        m("plenio-selected", w), w[0] && v(w[0]);
      }
    ), Re(
      () => n.playing,
      (w) => {
        m("plenio-playing", w), w[0] && v(w[0]);
      }
    ), Xs(() => {
      y(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - d) > 40 && y();
      }), o.value && c.observe(o.value);
    }), zn(() => c?.disconnect());
    function k(w) {
      u = w.shiftKey || w.ctrlKey || w.metaKey;
    }
    return (w, $) => (b(), C("div", {
      class: ze(["notation-wrap", { stale: i.stale }])
    }, [
      i.stale ? (b(), C("p", Qk, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : U("", !0),
      r.value ? (b(), C("p", ew, I(r.value), 1)) : U("", !0),
      p("div", {
        ref_key: "host",
        ref: o,
        class: "notation",
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: k
      }, null, 544)
    ], 2));
  }
});
function Ps(i, e) {
  let t = 1;
  for (const n of i.measures) {
    if (n.onset > e) break;
    t = n.n;
  }
  return t;
}
function Ec(i, e) {
  return i.measures[Math.max(0, Math.min(i.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Ic(i, e, t) {
  const n = e > 0 ? Math.round(i / e) * e : Math.round(i);
  return Math.max(0, Math.min(t, n));
}
function Ia(i, e) {
  const t = i.model;
  if (!t) return 0;
  const n = Ps(t, e), s = t.measures[n - 1], o = i.bars[n - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function Ra(i, e) {
  const t = i.model;
  if (!t || !i.bars.length || !t.measures.length) return null;
  let n = 0;
  for (let l = 0; l < i.bars.length && !(i.bars[l].start_s > e + Do); l++)
    n = l;
  const s = i.bars[n], o = t.measures[Math.min(n, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function $f(i, e) {
  const t = Ps(i, e), n = i.measures[t - 1];
  if (!n) return "1.1.1";
  const s = Number(n.meter.split("/")[0]) || 1, o = n.length / s, r = Math.max(0, e - n.onset), l = Math.min(s - 1, Math.floor(r / o)), a = i.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const nw = 0.25, iw = 30, rl = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, ll = 6e-3;
class sw {
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
  sounds = op();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), iw), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + nw; )
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
        u = Wo(t, o, this.sounds[e.part], e.midi, n, { level: rl[e.part] });
      } catch {
        try {
          u = Wo(t, o, "plain", e.midi, n, { level: rl[e.part] });
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
    r.type = "square", r.frequency.value = rp(e.midi);
    const l = t.createGain(), a = rl.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + ll), o.gain.setValueAtTime(1, Math.max(r + ll, l - ll)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class ow {
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
        s.resume(), this.off(e), this.tones.set(e, Wo(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
let Rc = null;
function na(i, e = 0.35, t = "soft") {
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      Rc ??= new n();
      const s = Rc;
      s.resume();
      const o = s.currentTime + 0.01;
      Wo(s, s.destination, t, i, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const rw = 200, Hi = /* @__PURE__ */ new Map(), lw = 2;
function aw(i, e) {
  if (i.numberOfChannels === 1) return i;
  const t = new e(1, 1, i.sampleRate).createBuffer(1, i.length, i.sampleRate), n = t.getChannelData(0);
  for (let s = 0; s < i.numberOfChannels; s++) {
    const o = i.getChannelData(s);
    for (let r = 0; r < o.length; r++) n[r] += o[r] / i.numberOfChannels;
  }
  return t;
}
function uw(i, e, t = rw) {
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
function cw(i, e = hw) {
  let t = Hi.get(i);
  if (!t) {
    for (t = (async () => {
      const n = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!n) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(i), o = await new n(1, 1, 48e3).decodeAudioData(s), r = aw(o, n);
      return { buffer: r, envelope: uw(r.getChannelData(0), r.sampleRate) };
    })(), Hi.set(i, t); Hi.size > lw; ) Hi.delete(Hi.keys().next().value);
    t.catch(() => Hi.delete(i));
  }
  return t;
}
async function hw(i) {
  const e = await fetch(i);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function dw(i, e, t, n) {
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
function fw(i) {
  return !i || "problem" in i || !Array.isArray(i.midi) || !(i.rate > 0) ? null : { rate: i.rate, start: i.start ?? 0, midi: i.midi };
}
function pw(i, e) {
  const t = Math.round((e - i.start) * i.rate);
  return t >= 0 && t < i.midi.length ? i.midi[t] : null;
}
function mw(i, e, t) {
  let n = 0;
  for (let r = 0; r < i.measures.length; r++) i.measures[r].onset <= t && (n = r);
  const s = i.measures[n], o = e?.[n];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function gw(i, e, t) {
  const n = [];
  for (const s of i.tracks.vocal) {
    const o = mw(i, e, s.onset + s.duration / 2), r = o === null ? null : pw(t, o);
    r !== null && n.push(s.pitch - r);
  }
  return n.length < 6 ? 0 : (n.sort((s, o) => s - o), 12 * Math.round(n[Math.floor(n.length / 2)] / 12));
}
function vw(i, e, t, n, s, o = 0) {
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
      const v = y >= 0 && y < t.midi.length ? t.midi[y] : null, k = t.start + y * u;
      (v === null || a !== null && Math.abs(k - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = k, v !== null && l.push([d.onset + (k - h[0]) / (h[1] - h[0]) * d.length, v + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const yw = ["aria-label"], bw = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, kw = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, ww = ["aria-pressed"], xw = ["aria-pressed"], Sw = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, Cw = ["aria-pressed"], Mw = ["aria-pressed"], Aw = { title: "Grid for drawing, moving and resizing" }, Tw = { value: "auto" }, $w = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, Dw = ["disabled"], Lw = ["disabled"], Bw = ["disabled", "title"], Ow = ["disabled", "title"], Ew = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, Iw = ["disabled", "title"], Rw = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, Pw = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, Nw = ["title"], Vw = ["disabled"], Hw = { title: "The roll pages along with the playback line" }, zw = { class: "hint" }, Ww = {
  key: 0,
  class: "roll-note"
}, Fw = ["width", "height"], Kw = ["y", "width", "height"], _w = ["x1", "x2", "y1", "y2"], Uw = ["x", "y"], Gw = ["x", "y"], jw = ["d"], qw = ["x1", "x2", "y1", "y2"], Yw = ["x1", "x2", "y1", "y2"], Xw = ["transform"], Jw = ["y", "width", "height"], Zw = ["y"], Qw = ["transform"], ex = ["width", "height"], tx = ["x", "width", "height"], nx = ["y", "width", "height"], ix = ["y", "width", "height"], sx = ["x", "y", "width", "height"], ox = ["d"], rx = ["x", "y"], lx = ["y", "width", "height"], ax = ["x", "y", "width", "height"], ux = ["x", "y", "height"], cx = ["x", "y"], hx = ["x1", "x2", "y2"], dx = ["x"], fx = ["x"], px = ["x", "y", "width", "height"], mx = ["x", "y"], gx = {
  key: 2,
  class: "chord ghost"
}, vx = ["x", "y", "width", "height"], yx = ["x", "y"], bx = ["x", "y", "width", "height"], kx = ["x1", "x2", "y2"], wx = ["transform"], xx = ["y2"], Sx = ["onKeydown"], Cx = ["onKeydown"], ks = 5, Pc = 6.2, Mx = 26, Ax = /* @__PURE__ */ Dt({
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
    const n = i, s = t, o = ct(i, "lyricSelection"), r = ct(i, "zoom"), l = ct(i, "audition"), a = ct(i, "rowHeight"), u = ct(i, "follow"), c = ct(i, "sungVisible"), d = ct(i, "waveVisible"), h = O(() => !!n.source && d.value), f = z(null), m = z(null), y = z(null), v = z(null), k = ct(i, "track"), w = z("draw"), $ = z("auto"), P = z(null), R = z(null), V = z(!1), E = z(0), _ = z(0), N = z(0), ne = z(0);
    let W = !1;
    const T = z(null), H = z(null), me = z(null);
    let ve = !1;
    const ie = z(null);
    let le = null, Ee = null;
    const Se = O(() => n.view?.model ?? null), Be = O(() => Se.value ? Ea(Se.value) : []), Ae = O(() => Se.value?.tracks.chords ?? []), j = O(
      () => Se.value ? $b(Se.value, {
        pxPerQuarter: r.value,
        snap: $.value,
        lyrics: !!n.lyrics,
        source: h.value,
        rowHeight: a.value
      }) : null
    ), Qe = z(null);
    function ce(x) {
      l.value && na(x, 0.35, n.sound);
    }
    const Ce = O(() => !n.readonly && !n.stale && !n.busy && !V.value), te = O(() => us(n.view, n.selection)), K = O(() => qs(n.selection)), Q = O(() => us(n.view, n.playing)), Fe = O(() => Fb(P.value)), nt = O(() => Wb(P.value)), Ge = O(() => {
      const x = j.value, A = R.value;
      if (!x || !A) return null;
      const M = Sf(A, x, _.value, E.value), q = new Set(A.keep);
      for (const ke of Eb(Be.value, M, x)) q.add(ke.id);
      const F = new Set(A.keepChords);
      for (const ke of Ib(Ae.value, A, x, _.value, E.value)) F.add(ke.id);
      const re = Ob(A, _.value);
      return { rect: M, ids: q, chords: F, lane: re };
    }), xt = O(
      () => w.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), ee = O(
      () => n.lyrics && n.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), G = O(() => Se.value && n.locator !== null ? $f(Se.value, n.locator) : "");
    function de(x, A, M) {
      const q = ie.value;
      return !q || !q.delta ? [A, M] : q.kind === "move" && q.keys.includes(x) ? [A + q.delta, M + q.delta] : q.key !== x ? [A, M] : q.kind === "start" ? [Math.min(A + q.delta, M - 1), M] : q.kind === "end" ? [A, Math.max(M + q.delta, A + 1)] : [A, M];
    }
    function xe(x) {
      const A = ie.value;
      return A?.delta ? A.kind === "move" ? A.keys.includes(x) : A.key === x : !1;
    }
    const Me = O(() => {
      const x = j.value, A = n.lyrics;
      if (!x || !A) return [];
      const M = A.parts.flatMap(
        (F) => F.lines.filter((re) => re.text).map((re) => {
          const ke = Ko(re.block, re.line), [Ne, be] = de(ke, re.start, re.end);
          return { ...re, start: Ne, end: be, key: ke };
        })
      ).sort((F, re) => F.start - re.start || F.line - re.line), q = new Set(o.value);
      return M.map((F, re) => {
        const ke = Ke(F.start, x), Ne = M.slice(re + 1).find((yt) => yt.start > F.start), be = Ne ? Ke(Ne.start, x) - ke - 2 : 640, Le = Math.max(16, Ke(F.end, x) - ke), je = Math.max(1, Math.floor((Math.max(Le, Math.min(be, F.text.length * Pc + 8)) - 8) / Pc)), dt = F.text.length > je ? `${F.text.slice(0, Math.max(1, je - 1))}…` : F.text;
        return { ...F, x: ke, width: Le, shown: dt, selected: q.has(F.key), dragged: xe(F.key) };
      }).filter((F) => Ct(F.start, Math.max(F.end, F.start + 64)));
    });
    function Fn(x) {
      const A = Me.value.filter((F) => x >= F.x - ks && x <= F.x + F.width + ks), M = A.find((F) => x >= F.x && x <= F.x + F.width) ?? A[0];
      if (!M) return null;
      const q = x >= M.x + M.width - ks ? "end" : x <= M.x + ks && M.width > 3 * ks ? "start" : "move";
      return { key: M.key, start: M.start, end: M.end, part: q };
    }
    function pt(x) {
      const A = [];
      for (const M of n.lyrics?.parts.flatMap((q) => q.lines.map((F) => ({ ...F, key: Ko(F.block, F.line) }))) ?? []) {
        if (!(x.kind === "move" ? x.keys.includes(M.key) : M.key === x.key)) continue;
        const F = Math.max(M.end, M.start + 1);
        let re = [M.start, F];
        x.kind === "move" ? re = [M.start + x.delta, F + x.delta] : x.kind === "start" ? re = [Math.min(M.start + x.delta, F - 1), F] : re = [M.start, Math.max(F + x.delta, M.start + 1)], A.push({ key: M.key, start: Math.max(0, re[0]), end: Math.max(1, re[1]) });
      }
      return A;
    }
    const It = O(() => {
      const x = /* @__PURE__ */ new Map();
      for (const A of n.lyrics?.parts ?? [])
        for (const M of A.lines) for (const q of M.syllables) x.set(q.onset, q.end_of_word ? q.text : `${q.text}-`);
      return x;
    }), St = O(() => {
      const x = j.value;
      return x ? fi.value.map((A) => ({ n: A, rect: ii(A, x) })).filter(({ rect: A }) => A.width >= Mx).map(({ n: A, rect: M }) => ({ key: A.id, x: M.x + 2, y: M.y + M.height - 2.5, text: ea(A.pitch) })) : [];
    }), Kn = O(() => {
      const x = j.value;
      return !x || !It.value.size ? [] : fi.value.filter((A) => A.track === "vocal" && It.value.has(A.onset)).map((A) => {
        const M = ii(A, x);
        return { key: A.id, x: M.x + 1, y: M.y - 2, text: It.value.get(A.onset) };
      });
    });
    function ht(x) {
      const M = n.lyrics?.parts.find((be) => x >= be.start && x < be.end);
      if (!M) return null;
      const q = M.lines.length ? Math.max(...M.lines.map((be) => be.line)) + 1 : 0, F = M.lines.find((be) => be.text && x >= be.start && x < Math.max(be.end, be.start + 1)), re = (be) => ({
        block: M.block,
        line: be.line,
        text: be.text,
        original: be.text,
        start: be.start
      });
      if (F) return re(F);
      const ke = M.phrases.find(([be, Le]) => x >= be && x < Le);
      if (ke && !M.lines.some((be) => be.syllables.length && be.start < ke[1] && be.end > ke[0]))
        return re({ line: q, text: "", start: ke[0] });
      const Ne = [...M.lines].reverse().find((be) => be.text && be.start <= x);
      return re(Ne ?? { line: q, text: "", start: M.start });
    }
    function Ii(x) {
      const A = ht(x);
      A && (ve = !1, me.value = A, Cn(() => {
        H.value?.focus(), H.value?.select();
      }));
    }
    function Wt() {
      const x = me.value;
      if (me.value = null, !x || ve) {
        ve = !1;
        return;
      }
      f.value?.focus({ preventScroll: !0 }), x.text.trim() !== x.original.trim() && s("lyricEdit", { block: x.block, line: x.line, text: x.text.trim(), at: x.start });
    }
    function _n() {
      ve = !0, me.value = null, f.value?.focus({ preventScroll: !0 });
    }
    const Ln = O(() => Se.value ? `1/${Math.round($r(Se.value) / (j.value?.snap ?? 1))}` : ""), Ut = O(() => {
      const x = j.value;
      if (!x) return [0, 0];
      const A = N.value || 1e5;
      return [xn(E.value - 200, x), xn(E.value + A + 200, x)];
    }), Ct = (x, A) => A >= Ut.value[0] && x <= Ut.value[1], fi = O(() => Be.value.filter((x) => Ct(x.onset, x.onset + x.duration))), fn = O(
      () => Ae.value.map((x, A) => ({ chord: x, next: Ae.value[A + 1] })).filter(({ chord: x }) => Ct(x.onset, x.onset + 64))
    ), en = O(() => Se.value ? Bb(Se.value).filter((x) => Ct(x.unit, x.unit)) : []), Un = O(() => {
      const x = j.value;
      return x ? Array.from({ length: x.high - x.low + 1 }, (A, M) => x.high - M) : [];
    }), pi = O(() => {
      const x = Se.value;
      return x ? x.sections.filter((A) => !A.implicit).map((A) => ({ label: A.label, unit: x.measures[A.first_bar - 1]?.onset ?? 0 })).filter((A) => Ct(A.unit, A.unit + 64)) : [];
    });
    function Bn(x) {
      const A = y.value?.getBoundingClientRect();
      return [x.clientX - (A?.left ?? 0), x.clientY - (A?.top ?? 0)];
    }
    function vt(x) {
      return {
        note: !0,
        [x.track]: !0,
        selected: (Ge.value?.ids ?? te.value).has(x.id),
        playing: Q.value.has(x.id),
        dragged: Fe.value.has(x.id)
      };
    }
    function ds(x) {
      const A = x.track === "vocal" ? "Vocal" : "Ins";
      let M = 1;
      for (const q of Se.value?.measures ?? []) q.onset <= x.onset && (M = q.n);
      return `${A} bar ${M}: ${x.name}, ${x.duration} units`;
    }
    function Mt(x) {
      s("select", x);
    }
    function Gn(x) {
      const A = j.value;
      if (!A || x.button !== 0) return;
      f.value?.focus({ preventScroll: !0 });
      const [M, q] = Bn(x), F = $c(M, q, Be.value, Ae.value, A, k.value, _.value, E.value);
      if (F.area === "keys") {
        l.value && na(F.pitch, 0.35, n.sound);
        return;
      }
      if (F.area === "header" || F.area === "source") {
        s("locate", Ic(F.unit, A.snap, A.total)), le = { x: M, y: q, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, Rt(x);
        return;
      }
      const re = x.shiftKey || x.ctrlKey || x.metaKey;
      if (F.area === "lyrics") {
        const Le = Fn(M);
        if (!Le) {
          re || (o.value = []);
          return;
        }
        n.selection.length && Mt([]);
        const je = o.value, dt = je.includes(Le.key), yt = re ? dt ? je.filter((Yn) => Yn !== Le.key) : [...je, Le.key] : dt ? je : [Le.key];
        if (yt !== je && (o.value = yt), n.lyricsEditable && (yt.includes(Le.key) || Le.part !== "move")) {
          const Yn = Le.part === "move" ? [...yt] : [Le.key];
          le = { x: M, y: q, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Le.part, key: Le.key, keys: Yn, origin: xn(M, A), delta: 0 } }, Rt(x);
        }
        return;
      }
      o.value.length && !re && (o.value = []);
      let ke = null, Ne = !1, be = null;
      if (F.area === "note") {
        const Le = te.value.has(F.note.id);
        let je;
        if (re) {
          const dt = new Set(te.value);
          Le ? dt.delete(F.note.id) : dt.add(F.note.id), je = Be.value.filter((yt) => dt.has(yt.id)), Mt(Ao(je, Ae.value.filter((yt) => K.value.has(yt.id))));
        } else Le ? je = Be.value.filter((dt) => te.value.has(dt.id)) : (je = [F.note], Mt(Ao(je)));
        Ce.value && je.some((dt) => dt.id === F.note.id) && (ke = F.edge === "end" && je.length === 1 ? Pb(F.note, Be.value, A.total) : Rb(je, F.note, xn(M, A), or(q, A))), ce(F.note.pitch);
      } else if (F.area === "chord") {
        if (re) {
          const Le = new Set(K.value);
          Le.has(F.chord.id) ? Le.delete(F.chord.id) : Le.add(F.chord.id), Mt([...n.selection.filter((je) => !je.startsWith("chord:")), ...Le]);
        } else K.value.has(F.chord.id) || Mt([F.chord.id]);
        Ce.value && (ke = Vb(F.chord, xn(M, A)));
      } else if ((F.area === "grid" || F.area === "lane") && (w.value === "select" || x.shiftKey))
        be = re ? { notes: [...te.value], chords: Ae.value.filter((Le) => K.value.has(Le.id)) } : { notes: [], chords: [] }, Ne = !re;
      else if (F.area === "grid") {
        const Le = !n.selection.length && !o.value.length;
        Ce.value && !re && (ke = Nb(k.value, F.unit, F.pitch, A), ce(F.pitch)), Ne = !re, le = { x: M, y: q, start: ke, started: !1, clear: Ne, keep: be, insert: Ce.value && !re && Le }, Rt(x);
        return;
      } else
        Ne = !re;
      le = { x: M, y: q, start: ke, started: !1, clear: Ne, keep: be, from: { scrollTop: _.value, scrollLeft: E.value } }, Rt(x);
    }
    function Rt(x) {
      try {
        y.value?.setPointerCapture?.(x.pointerId);
      } catch {
      }
    }
    function jn(x) {
      const A = m.value, M = j.value;
      if (!A || !M) return;
      const q = A.getBoundingClientRect();
      if (!q.height) return;
      const F = M.rowHeight;
      if (x.clientY < q.top + M.top + 12) A.scrollTop = Math.max(0, A.scrollTop - F);
      else if (x.clientY > q.bottom - 16) A.scrollTop = A.scrollTop + F;
      else return;
      mt();
    }
    function pn(x) {
      const A = j.value;
      if (!le || !le.start && !le.keep && !le.ruler && !le.lyric || !A) return;
      const [M, q] = Bn(x);
      if (le.ruler) {
        s("locate", Ic(xn(M, A), A.snap, A.total));
        return;
      }
      if (le.lyric) {
        if (!le.started && Math.abs(M - le.x) < Ac) return;
        le.started = !0;
        const F = Math.round((xn(M, A) - le.lyric.origin) / A.snap) * A.snap;
        ie.value = { ...le.lyric, delta: F };
        return;
      }
      if (le.started && jn(x), !(!le.started && Math.hypot(M - le.x, q - le.y) < Ac)) {
        if (le.started = !0, le.keep)
          R.value = {
            x0: le.x,
            y0: le.y,
            x1: M,
            y1: q,
            from: le.from,
            keep: le.keep.notes,
            keepChords: le.keep.chords.map((F) => F.id)
          };
        else if (le.start) {
          const F = P.value, re = Hb(le.start, xn(M, A), or(q, A), A, { alt: x.altKey });
          re.kind === "move" && re.semitones !== (F?.kind === "move" ? F.semitones : 0) && ce(re.anchor.pitch + re.semitones), P.value = re;
        }
      }
    }
    async function Gt(x) {
      V.value = !0;
      try {
        await n.operate(x);
      } finally {
        V.value = !1, P.value = null;
      }
    }
    function mi() {
      const x = le;
      if (le = null, !x || x.ruler) return;
      if (x.lyric) {
        const q = ie.value;
        ie.value = null, x.started && q?.delta && s("lyricPlace", pt(q));
        return;
      }
      if (!x.started) {
        if (P.value = null, x.insert && x.start?.kind === "draw" && j.value) {
          const q = j.value, F = Math.min(Qe.value ?? q.drawLength, q.total - x.start.start);
          Gt({ op: "insert_note", track: x.start.track, onset: x.start.start, duration: F, pitch: x.start.pitch });
          return;
        }
        x.clear && Mt([]);
        return;
      }
      if (x.keep) {
        const q = Ge.value?.ids ?? /* @__PURE__ */ new Set(), F = Ge.value?.chords ?? new Set(x.keep.chords.map((re) => re.id));
        R.value = null, Mt(Ao(Be.value.filter((re) => q.has(re.id)), Ae.value.filter((re) => F.has(re.id))));
        return;
      }
      const A = P.value, M = A ? zb(A, n.resizeMode) : null;
      if (!M) {
        P.value = null;
        return;
      }
      A?.kind === "draw" ? Qe.value = A.end - A.start : A?.kind === "resize" && (Qe.value = A.end - A.note.onset), Gt(M);
    }
    function Ft() {
      le = null, P.value = null, R.value = null, ie.value = null;
    }
    function Ri(x) {
      const A = j.value;
      if (!A) return;
      const [M, q] = Bn(x), F = $c(M, q, Be.value, Ae.value, A, k.value, _.value, E.value);
      if (F.area === "lyrics") {
        n.lyricsEditable && Ii(F.unit);
        return;
      }
      if (Ce.value) {
        if (F.area === "grid") {
          if (w.value !== "draw") return;
          const re = Math.min(Ql(F.unit, A.snap), A.total - 1), ke = Math.min(A.drawLength, A.total - re);
          Gt({ op: "insert_note", track: k.value, onset: re, duration: ke, pitch: F.pitch });
        } else if (F.area === "lane" || F.area === "chord") {
          const re = F.area === "chord" ? F.chord : null, ke = F.area === "chord" ? F.chord.onset : Math.min(Ql(F.unit, A.snap), A.total - 1);
          T.value = { onset: ke, name: re?.name ?? "", original: re?.name ?? null }, Cn(() => {
            v.value?.focus(), v.value?.select();
          });
        }
      }
    }
    function fs() {
      const x = T.value;
      if (T.value = null, f.value?.focus({ preventScroll: !0 }), !x) return;
      const A = x.name.trim();
      if (A !== (x.original ?? "")) {
        if (!A) {
          x.original !== null && Gt({ op: "delete_chord", onset: x.onset });
          return;
        }
        Gt({ op: "put_chord", onset: x.onset, name: A });
      }
    }
    function mn() {
      T.value = null, f.value?.focus({ preventScroll: !0 });
    }
    function He(x) {
      if (x.target?.closest("input, select, textarea")) return;
      const M = j.value;
      if (!M) return;
      if (o.value.length && !x.ctrlKey && !x.metaKey) {
        const Ne = x.key === "ArrowLeft" ? -M.snap : x.key === "ArrowRight" ? M.snap : 0;
        if (x.key === "Delete" || x.key === "Backspace" || Ne || x.key === "Escape") {
          if (x.preventDefault(), x.stopPropagation(), x.key === "Escape") o.value = [];
          else if (n.lyricsEditable) Ne ? s("lyricPlace", pt({ kind: "move", key: "", keys: [...o.value], delta: Ne })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (x.key === "Escape") {
        if (le || P.value || R.value) Ft();
        else if (n.selection.length) Mt([]);
        else return;
        x.preventDefault(), x.stopPropagation();
        return;
      }
      const q = x.key.toLowerCase();
      if ((q === "g" || q === "h") && !x.ctrlKey && !x.metaKey && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), x.shiftKey ? tn(q === "h" ? 2 : -2) : Pt(q === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (q === "q" && !x.ctrlKey && !x.metaKey && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), B(x.shiftKey);
        return;
      }
      if (x.key.toLowerCase() === "a" && (x.ctrlKey || x.metaKey) && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), Mt(Ao(Be.value, Ae.value));
        return;
      }
      const F = Be.value.filter((Ne) => te.value.has(Ne.id)), re = Ae.value.filter((Ne) => K.value.has(Ne.id)), ke = Kb(
        x.key,
        { shift: x.shiftKey, alt: x.altKey },
        F,
        re,
        M,
        n.resizeMode
      );
      ke !== void 0 && (x.preventDefault(), x.stopPropagation(), ke && Ce.value && Gt(ke));
    }
    function mt() {
      E.value = m.value?.scrollLeft ?? 0, _.value = m.value?.scrollTop ?? 0, N.value = m.value?.clientWidth ?? 0, ne.value = m.value?.clientHeight ?? 0;
    }
    function gn() {
      const x = j.value, A = m.value;
      W || !x || !A || !A.clientHeight || (W = !0, A.scrollTop = wf(x, A.clientHeight, x.focus[0], x.focus[1]), mt());
    }
    function qn(x, A = !0) {
      const M = j.value, q = m.value, F = Be.value.find((Ne) => x.has(Ne.id));
      if (!M || !q || !F || !q.clientWidth) return;
      const re = Ke(F.onset, M);
      A && (re < q.scrollLeft + qt || re > q.scrollLeft + q.clientWidth - 40) && (q.scrollLeft = Math.max(0, re - q.clientWidth / 3));
      const ke = q.clientHeight ? Tc(M, q.scrollTop, q.clientHeight, F.pitch) : null;
      ke !== null && (q.scrollTop = ke), mt();
    }
    function Pt(x, A) {
      const M = m.value, q = j.value, F = Math.max(12, Math.min(240, Math.round(r.value * x)));
      if (F === r.value) return;
      if (!M || !q) {
        r.value = F;
        return;
      }
      const re = M.getBoundingClientRect(), ke = n.locator !== null ? Ke(n.locator, q) - M.scrollLeft : null, Ne = A !== void 0 ? A - re.left : ke !== null && ke >= qt && ke <= M.clientWidth ? ke : M.clientWidth / 2, be = xn(M.scrollLeft + Ne, q);
      r.value = F, Cn(() => {
        const Le = j.value;
        Le && (M.scrollLeft = Math.max(0, Ke(be, Le) - Ne), mt());
      });
    }
    function Pi(x) {
      const A = x.deltaY || x.deltaX;
      if (x.altKey || (x.ctrlKey || x.metaKey) && x.shiftKey) {
        x.preventDefault(), tn(A < 0 ? 1 : -1, x.clientY);
        return;
      }
      !x.ctrlKey && !x.metaKey || (x.preventDefault(), Pt(A < 0 ? 1.15 : 1 / 1.15, x.clientX));
    }
    function tn(x, A) {
      const M = m.value, q = j.value, F = Math.max(bf, Math.min(kf, a.value + x));
      if (F === a.value) return;
      if (!M || !q) {
        a.value = F;
        return;
      }
      const re = M.getBoundingClientRect(), ke = A !== void 0 ? A - re.top : M.clientHeight / 2, Ne = q.high - (M.scrollTop + ke - q.top) / q.rowHeight;
      a.value = F, Cn(() => {
        const be = j.value;
        be && (M.scrollTop = Math.max(0, be.top + (be.high - Ne) * be.rowHeight - ke), mt());
      });
    }
    function B(x) {
      const A = j.value;
      if (!A || !Ce.value) return;
      const M = te.value.size ? Be.value.filter((q) => te.value.has(q.id)) : Be.value;
      M.length && Gt({ op: "quantize", ids: M.map((q) => q.id), grid: A.snap, lengths: x });
    }
    const Y = O(() => {
      const x = n.source?.envelope;
      if (!x) return 1;
      let A = 0;
      for (let M = 0; M < x.max.length; M++) A = Math.max(A, x.max[M], -x.min[M]);
      return A || 1;
    }), Z = O(() => {
      const x = j.value, A = Se.value, M = n.sung;
      if (!x || !A || !M?.curve || !c.value) return [];
      const [q, F] = Ut.value;
      let re = 0, ke = A.measures.length - 1;
      A.measures.forEach((be, Le) => {
        be.onset + be.length < q && (re = Le + 1), be.onset <= F && (ke = Le);
      });
      const Ne = (be) => x.top + (x.high - be) * x.rowHeight + x.rowHeight / 2;
      return vw(A, M.bars, M.curve, re, ke, M.offset).map((be, Le) => ({
        key: `c${re}-${Le}`,
        d: be.map(([je, dt], yt) => `${yt ? "L" : "M"}${Ke(je, x).toFixed(1)} ${Ne(dt).toFixed(1)}`).join("")
      }));
    }), ge = O(() => {
      const x = n.sung?.offset ?? 0;
      if (!x) return "sung";
      const A = Math.abs(x / 12);
      return `sung ${x > 0 ? "+" : "−"}${A > 1 ? A : ""}8va`;
    }), at = O(() => {
      const x = n.sung;
      if (!x) return "";
      if (x.problem) return `No sung pitch: ${x.problem}`;
      const A = x.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${A ? ` - drawn ${Math.abs(A / 12)} octave${Math.abs(A) > 12 ? "s" : ""} ${A > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), Dr = O(() => {
      const x = j.value, A = Se.value, M = n.source;
      if (!x || !A || !M || x.sourceTop === null) return [];
      const q = x.sourceTop + Ts / 2, F = (Ts / 2 - 3) / Y.value, re = [];
      return A.measures.forEach((ke, Ne) => {
        if (!Ct(ke.onset, ke.onset + ke.length)) return;
        const be = Ke(ke.onset, x), Le = ke.length * x.pxPerUnit, je = M.bars?.[Ne];
        if (!je) {
          re.push({ key: `w${Ne}`, d: "", missing: !0, x: be, width: Le });
          return;
        }
        const dt = Math.max(1, Math.floor(Le / 2)), yt = [];
        dw(M.envelope, je[0], je[1], dt).forEach(([Yn, On], it) => {
          const nn = (be + (it + 0.5) * (Le / dt)).toFixed(1);
          yt.push(`M${nn} ${(q - On * F - 0.5).toFixed(1)}V${(q - Yn * F + 0.5).toFixed(1)}`);
        }), re.push({ key: `w${Ne}`, d: yt.join(""), missing: !1, x: be, width: Le });
      }), re;
    });
    function gi(x) {
      const A = j.value, M = m.value;
      if (x === null || !A || !M || !M.clientWidth) return;
      const q = Ke(x, A);
      q >= M.scrollLeft + qt && q <= M.scrollLeft + M.clientWidth - 24 || (M.scrollLeft = Math.max(0, q - qt - 24), mt());
    }
    return Re(te, (x) => qn(x)), Re(Q, (x) => {
      n.recorded && n.playhead !== null || (u.value || n.playhead === null) && qn(x, n.playhead === null);
    }), Re(
      () => n.playhead,
      (x) => {
        u.value && gi(x);
      }
    ), Re(() => n.locator, gi), Re(
      () => n.recorded?.notes.at(-1)?.pitch,
      (x) => {
        const A = j.value, M = m.value;
        if (x === void 0 || !A || !M?.clientHeight) return;
        const q = Tc(A, M.scrollTop, M.clientHeight, x);
        q !== null && (M.scrollTop = q, mt());
      }
    ), Re(
      () => !!Se.value,
      (x) => {
        x ? Cn(gn) : W = !1;
      }
    ), Xs(() => {
      mt(), gn(), m.value && typeof ResizeObserver < "u" && (Ee = new ResizeObserver(() => {
        mt(), gn();
      }), Ee.observe(m.value));
    }), zn(() => Ee?.disconnect()), e({ zoomBy: Pt, zoomRows: tn }), (x, A) => (b(), C("div", {
      ref_key: "root",
      ref: f,
      class: ze(["roll", { stale: i.stale, readonly: i.readonly, [`mode-${w.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": w.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: He
    }, [
      p("div", bw, [
        p("span", kw, [
          p("button", {
            class: ze(["mode draw", { active: w.value === "draw" }]),
            "aria-pressed": w.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: A[0] || (A[0] = (M) => w.value = "draw")
          }, [...A[20] || (A[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            ae(" Draw ", -1)
          ])], 10, ww),
          p("button", {
            class: ze(["mode select", { active: w.value === "select" }]),
            "aria-pressed": w.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: A[1] || (A[1] = (M) => w.value = "select")
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
            ae(" Select ", -1)
          ])], 10, xw)
        ]),
        p("span", Sw, [
          A[22] || (A[22] = ae(" draw into ", -1)),
          p("button", {
            class: ze([{ active: k.value === "vocal" }, "vocal"]),
            "aria-pressed": k.value === "vocal",
            onClick: A[2] || (A[2] = (M) => k.value = "vocal")
          }, " Vocal ", 10, Cw),
          p("button", {
            class: ze([{ active: k.value === "ins" }, "ins"]),
            "aria-pressed": k.value === "ins",
            onClick: A[3] || (A[3] = (M) => k.value = "ins")
          }, " Ins ", 10, Mw)
        ]),
        p("label", Aw, [
          A[27] || (A[27] = ae(" snap ", -1)),
          Oe(p("select", {
            "onUpdate:modelValue": A[4] || (A[4] = (M) => $.value = M),
            "aria-label": "Snap"
          }, [
            p("option", Tw, "auto (" + I($.value === "auto" ? Ln.value : "score") + ")", 1),
            A[23] || (A[23] = p("option", { value: 4 }, "1/4", -1)),
            A[24] || (A[24] = p("option", { value: 8 }, "1/8", -1)),
            A[25] || (A[25] = p("option", { value: 16 }, "1/16", -1)),
            A[26] || (A[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [ri, $.value]
          ])
        ]),
        p("span", $w, [
          p("button", {
            disabled: !i.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: A[5] || (A[5] = (M) => s("clipboard", "copy"))
          }, " Copy ", 8, Dw),
          p("button", {
            disabled: !i.selection.length || !Ce.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: A[6] || (A[6] = (M) => s("clipboard", "cut"))
          }, " Cut ", 8, Lw),
          p("button", {
            disabled: !i.clip || !Ce.value || i.locator === null,
            title: i.clip ? `Paste ${i.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: A[7] || (A[7] = (M) => s("clipboard", "paste"))
          }, " Paste ", 8, Bw),
          p("button", {
            disabled: !i.clip || !Ce.value || i.locator === null,
            title: i.clip ? `Insert ${i.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: A[8] || (A[8] = (M) => s("clipboard", "insert"))
          }, " Insert ", 8, Ow)
        ]),
        p("label", Ew, [
          Oe(p("input", {
            "onUpdate:modelValue": A[9] || (A[9] = (M) => l.value = M),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [Nt, l.value]
          ]),
          A[28] || (A[28] = ae(" hear ", -1))
        ]),
        p("button", {
          disabled: !Ce.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${Ln.value}); Shift+Q: their lengths too`,
          onClick: A[10] || (A[10] = (M) => B(!1))
        }, " Q ", 8, Iw),
        p("span", Rw, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: A[11] || (A[11] = (M) => Pt(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: A[12] || (A[12] = (M) => Pt(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: A[13] || (A[13] = (M) => tn(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: A[14] || (A[14] = (M) => tn(2))
          }, "↕+")
        ]),
        i.source ? (b(), C("label", Pw, [
          Oe(p("input", {
            "onUpdate:modelValue": A[15] || (A[15] = (M) => d.value = M),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [Nt, d.value]
          ]),
          A[29] || (A[29] = ae(" wave ", -1))
        ])) : U("", !0),
        i.sung ? (b(), C("label", {
          key: 1,
          title: at.value,
          class: ze({ unavailable: !!i.sung.problem })
        }, [
          Oe(p("input", {
            "onUpdate:modelValue": A[16] || (A[16] = (M) => c.value = M),
            type: "checkbox",
            disabled: !!i.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, Vw), [
            [Nt, c.value]
          ]),
          ae(" " + I(ge.value), 1)
        ], 10, Nw)) : U("", !0),
        p("label", Hw, [
          Oe(p("input", {
            "onUpdate:modelValue": A[17] || (A[17] = (M) => u.value = M),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [Nt, u.value]
          ]),
          A[30] || (A[30] = ae(" follow ", -1))
        ]),
        p("span", zw, I(xt.value) + I(ee.value), 1)
      ]),
      !Se.value && i.view?.model_error ? (b(), C("p", Ww, I(i.view.model_error.message), 1)) : Se.value && j.value ? (b(), C("div", {
        key: 1,
        ref_key: "scroller",
        ref: m,
        class: "roll-scroll",
        style: ji({ height: `${Math.min(i.height, j.value.height + 16)}px` }),
        onScroll: mt,
        onWheel: Pi
      }, [
        (b(), C("svg", {
          ref_key: "svg",
          ref: y,
          class: "roll-svg",
          width: j.value.width,
          height: j.value.height,
          onPointerdown: Gn,
          onPointermove: pn,
          onPointerup: mi,
          onPointercancel: Ft,
          onDblclick: Ri
        }, [
          (b(!0), C(he, null, we(Un.value, (M) => (b(), C("rect", {
            key: "row" + M,
            class: ze(["row", { black: L(Db)(M), c: M % 12 === 0 }]),
            x: 0,
            y: L(as)(M, j.value),
            width: j.value.width,
            height: j.value.rowHeight
          }, null, 10, Kw))), 128)),
          (b(!0), C(he, null, we(en.value, (M) => (b(), C("line", {
            key: "l" + M.unit,
            class: ze(M.kind),
            x1: L(Ke)(M.unit, j.value),
            x2: L(Ke)(M.unit, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 10, _w))), 128)),
          (b(!0), C(he, null, we(fi.value, (M) => (b(), C("rect", no({
            key: M.id,
            class: vt(M)
          }, { ref_for: !0 }, L(ii)(M, j.value), { rx: "2" }), [
            p("title", null, I(ds(M)), 1)
          ], 16))), 128)),
          (b(!0), C(he, null, we(St.value, (M) => (b(), C("text", {
            key: "p" + M.key,
            class: "note-name",
            x: M.x,
            y: M.y
          }, I(M.text), 9, Uw))), 128)),
          (b(!0), C(he, null, we(Kn.value, (M) => (b(), C("text", {
            key: "y" + M.key,
            class: "syllable",
            x: M.x,
            y: M.y
          }, I(M.text), 9, Gw))), 128)),
          (b(!0), C(he, null, we(Z.value, (M) => (b(), C("path", {
            key: M.key,
            class: "sung-pitch",
            d: M.d
          }, null, 8, jw))), 128)),
          i.recorded ? (b(!0), C(he, { key: 0 }, we(i.recorded.notes, (M, q) => (b(), C("rect", no({
            key: "rec" + q,
            class: "rec-note"
          }, { ref_for: !0 }, L(ii)({ onset: M.onset, duration: Math.max(M.duration, 0.5), pitch: M.pitch }, j.value), { rx: "2" }), null, 16))), 128)) : U("", !0),
          (b(!0), C(he, null, we(nt.value, (M, q) => (b(), C("rect", no({
            key: "ghost" + q,
            class: ["ghost", M.track]
          }, { ref_for: !0 }, L(ii)(M, j.value), { rx: "2" }), null, 16))), 128)),
          Ge.value && Ge.value.rect.height > 0 ? (b(), C("rect", no({
            key: 1,
            class: "band"
          }, Ge.value.rect), null, 16)) : U("", !0),
          i.locator !== null ? (b(), C("line", {
            key: 2,
            class: "locator",
            x1: L(Ke)(i.locator, j.value),
            x2: L(Ke)(i.locator, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 8, qw)) : U("", !0),
          i.playhead !== null ? (b(), C("line", {
            key: 3,
            class: "playhead",
            x1: L(Ke)(i.playhead, j.value),
            x2: L(Ke)(i.playhead, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 8, Yw)) : U("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${E.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: j.value.top,
              width: L(qt) - 2,
              height: j.value.height - j.value.top
            }, [...A[31] || (A[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, Jw),
            (b(!0), C(he, null, we(Un.value.filter((M) => M % 12 === 0), (M) => (b(), C("text", {
              key: "k" + M,
              class: "key-label",
              x: 4,
              y: L(as)(M, j.value) + j.value.rowHeight - 2
            }, I(L(Lb)(M)), 9, Zw))), 128))
          ], 8, Xw),
          p("g", {
            class: "roll-top",
            transform: `translate(0 ${_.value})`
          }, [
            p("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: j.value.width,
              height: j.value.top
            }, null, 8, ex),
            p("rect", {
              class: "ruler",
              x: L(qt),
              y: 0,
              width: j.value.width - L(qt),
              height: L(Sn)
            }, [...A[32] || (A[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, tx),
            p("rect", {
              class: "lane",
              x: 0,
              y: L(Sn),
              width: j.value.width,
              height: L(ki)
            }, null, 8, nx),
            i.source && j.value.sourceTop !== null ? (b(), C(he, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: j.value.sourceTop,
                width: j.value.width,
                height: L(Ts)
              }, [...A[33] || (A[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, ix),
              (b(!0), C(he, null, we(Dr.value, (M) => (b(), C(he, {
                key: M.key
              }, [
                M.missing ? (b(), C("rect", {
                  key: 0,
                  class: "source-missing",
                  x: M.x,
                  y: j.value.sourceTop + 2,
                  width: M.width,
                  height: L(Ts) - 4
                }, [...A[34] || (A[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, sx)) : (b(), C("path", {
                  key: 1,
                  class: "source-wave",
                  d: M.d
                }, null, 8, ox))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: E.value + 3,
                y: j.value.sourceTop + 11
              }, "source", 8, rx)
            ], 64)) : U("", !0),
            i.lyrics ? (b(), C(he, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: L(Pn),
                width: j.value.width,
                height: L(As)
              }, null, 8, lx),
              (b(!0), C(he, null, we(Me.value, (M) => (b(), C("g", {
                key: M.key,
                class: ze(["lyric-line", { unsung: !M.syllables.length, selected: M.selected, dragged: M.dragged }])
              }, [
                p("rect", {
                  x: M.x,
                  y: L(Pn) + 3,
                  width: M.width,
                  height: L(As) - 6,
                  rx: "3"
                }, null, 8, ax),
                i.lyricsEditable ? (b(), C("rect", {
                  key: 0,
                  class: "edge",
                  x: M.x + M.width - 3,
                  y: L(Pn) + 5,
                  width: 3,
                  height: L(As) - 10
                }, null, 8, ux)) : U("", !0),
                p("text", {
                  x: M.x + 4,
                  y: L(Pn) + L(As) / 2 + 4
                }, I(M.shown), 9, cx),
                p("title", null, I(M.text) + I(i.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : U("", !0),
            (b(!0), C(he, null, we(en.value.filter((M) => M.kind === "bar"), (M) => (b(), C("line", {
              key: "t" + M.unit,
              class: "bar",
              x1: L(Ke)(M.unit, j.value),
              x2: L(Ke)(M.unit, j.value),
              y1: 0,
              y2: j.value.top
            }, null, 8, hx))), 128)),
            (b(!0), C(he, null, we(en.value.filter((M) => M.bar), (M) => (b(), C("text", {
              key: "n" + M.unit,
              class: "bar-number",
              x: L(Ke)(M.unit, j.value) + 3,
              y: 12
            }, I(M.bar), 9, dx))), 128)),
            (b(!0), C(he, null, we(pi.value, (M) => (b(), C("text", {
              key: "s" + M.unit,
              class: "section-label",
              x: L(Ke)(M.unit, j.value) + 22,
              y: 12
            }, I(M.label), 9, fx))), 128)),
            (b(!0), C(he, null, we(fn.value, ({ chord: M, next: q }) => (b(), C("g", {
              key: M.id,
              class: ze(["chord", {
                selected: (Ge.value?.chords ?? K.value).has(M.id),
                dragged: P.value?.kind === "chord" && P.value.chord.id === M.id
              }])
            }, [
              p("rect", {
                x: L(Ke)(M.onset, j.value),
                y: L(Sn) + 3,
                width: L(rr)(M, q, j.value),
                height: L(ki) - 6,
                rx: "3"
              }, null, 8, px),
              p("text", {
                x: L(Ke)(M.onset, j.value) + 4,
                y: L(Sn) + L(ki) / 2 + 4
              }, I(M.name), 9, mx),
              p("title", null, "chord " + I(M.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            P.value?.kind === "chord" ? (b(), C("g", gx, [
              p("rect", {
                x: L(Ke)(P.value.to, j.value),
                y: L(Sn) + 3,
                width: L(rr)(P.value.chord, void 0, j.value),
                height: L(ki) - 6,
                rx: "3"
              }, null, 8, vx),
              p("text", {
                x: L(Ke)(P.value.to, j.value) + 4,
                y: L(Sn) + L(ki) / 2 + 4
              }, I(P.value.chord.name), 9, yx)
            ])) : U("", !0),
            Ge.value?.lane && Ge.value.rect.width > 0 ? (b(), C("rect", {
              key: 3,
              class: "band",
              x: Ge.value.rect.x,
              y: L(Sn),
              width: Ge.value.rect.width,
              height: L(ki)
            }, null, 8, bx)) : U("", !0),
            i.playhead !== null ? (b(), C("line", {
              key: 4,
              class: "playhead",
              x1: L(Ke)(i.playhead, j.value),
              x2: L(Ke)(i.playhead, j.value),
              y1: 0,
              y2: j.value.top
            }, null, 8, kx)) : U("", !0),
            i.locator !== null ? (b(), C("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${L(Ke)(i.locator, j.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: j.value.top
              }, null, 8, xx),
              A[35] || (A[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + I(G.value) + " - click or drag in the ruler to move it", 1)
            ], 8, wx)) : U("", !0)
          ], 8, Qw)
        ], 40, Fw)),
        T.value ? Oe((b(), C("input", {
          key: 0,
          ref_key: "chordInput",
          ref: v,
          "onUpdate:modelValue": A[18] || (A[18] = (M) => T.value.name = M),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: ji({ left: `${L(Ke)(T.value.onset, j.value)}px`, top: `${L(Sn) + 1 + _.value}px` }),
          onKeydown: [
            ot(Ue(fs, ["prevent"]), ["enter"]),
            ot(Ue(mn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: mn
        }, null, 44, Sx)), [
          [ft, T.value.name]
        ]) : U("", !0),
        me.value ? Oe((b(), C("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: H,
          "onUpdate:modelValue": A[19] || (A[19] = (M) => me.value.text = M),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: ji({ left: `${L(Ke)(me.value.start, j.value)}px`, top: `${L(Pn) + 1 + _.value}px` }),
          onKeydown: [
            ot(Ue(Wt, ["prevent"]), ["enter"]),
            ot(Ue(_n, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Wt
        }, null, 44, Cx)), [
          [ft, me.value.text]
        ]) : U("", !0)
      ], 36)) : U("", !0)
    ], 42, yw));
  }
}), lr = (i) => [...new Set(i)].sort((e, t) => e - t);
function Nc(i, e, t, n) {
  if (t.range && n !== null) {
    const [s, o] = n <= e ? [n, e] : [e, n], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? lr([...i, ...r]) : r;
  }
  return t.toggle ? i.includes(e) ? i.filter((s) => s !== e) : lr([...i, e]) : [e];
}
function Vc(i, e) {
  const t = new Set(e), n = Array.from({ length: i }, (s, o) => o).filter((s) => !t.has(s));
  return !n.length || n.length === i ? null : { order: n.map((s) => s + 1), selection: [] };
}
function Hc(i, e) {
  const t = lr(e).filter((o) => o >= 0 && o < i);
  if (!t.length) return null;
  const n = t[t.length - 1];
  return { order: [
    ...Array.from({ length: n + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: i - n - 1 }, (o, r) => n + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => n + 1 + r) };
}
function zc(i, e, t) {
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
function Wc(i, e, t, n) {
  const s = lr(e).filter((a) => a >= 0 && a < i);
  if (!s.length || t < 0 || t > i) return null;
  const o = n ? Array.from({ length: i }, (a, u) => u) : Array.from({ length: i }, (a, u) => u).filter((a) => !s.includes(a)), r = n ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !n && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const ei = z(null);
function ar(i) {
  return i.id.startsWith("ins:") ? "ins" : "vocal";
}
function Tx(i, e, t = null) {
  const n = [...new Set(e)].sort((u, c) => u - c).filter((u) => i.sections[u]), s = n.map((u) => i.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const d = i.measures[c.first_bar - 1], h = i.measures[c.first_bar - 1 + c.bars - 1], f = d.onset, m = h.onset + h.length;
    for (const v of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (v.onset >= m || v.onset + v.duration <= f) continue;
      const k = Math.max(v.onset, f);
      o.push({ track: ar(v), onset: k - f + a, duration: Math.min(v.onset + v.duration, m) - k, pitch: v.pitch });
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
function $x(i) {
  const e = [...new Set(i)].sort((n, s) => n - s), t = [];
  for (let n = 0; n < e.length; ) {
    let s = n;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > n ? `${e[n]}-${e[s]}` : `${e[n]}`), n = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function Dx(i, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => i.measures[r]);
  if (!t.length) return null;
  const n = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = i.measures[r], u = l + a;
    for (const c of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const d = Math.max(c.onset, l);
      n.push({ track: ar(c), onset: d - l + o, duration: Math.min(c.onset + c.duration, u) - d, pitch: c.pitch });
    }
    for (const c of i.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: i.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: n, chords: s, sections: [], label: $x(t.map((r) => r + 1)) };
}
function Fc(i, e, t) {
  if (!e.length && !t.length) return null;
  const n = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => ar(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: i.unit,
    span: s - n,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: ar(l), onset: l.onset - n, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - n, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function Kc(i) {
  const e = /^1\/(\d+)$/.exec(i.trim());
  return e ? Number(e[1]) : NaN;
}
function Lx(i, e) {
  const t = Kc(e) / Kc(i.unit);
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
function Bx(i, e) {
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
function _c(i, e, t, n) {
  const s = Lx(i, e.unit);
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
const Ox = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, Ex = { class: "hint" }, Ix = ["disabled"], Rx = ["disabled"], Px = ["disabled"], Nx = ["disabled"], Vx = ["disabled"], Hx = ["draggable", "aria-selected", "onDragstart", "onDragover"], zx = ["onClick"], Wx = ["title"], Fx = { key: 0 }, Kx = ["onKeydown", "onBlur"], _x = { class: "facts" }, Ux = {
  key: 0,
  class: "section-tools"
}, Gx = ["onClick"], jx = ["onClick"], qx = ["onClick"], Yx = ["onClick"], Xx = {
  key: 1,
  class: "split"
}, Jx = ["disabled"], Zx = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, Qx = { class: "hint" }, eS = ["disabled"], tS = ["disabled"], nS = ["disabled"], iS = ["disabled"], sS = ["disabled"], oS = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], rS = /* @__PURE__ */ Dt({
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
    const t = i, n = e, s = z(null), o = z(""), r = z("bridge"), l = z([]), a = z(null);
    let u = null;
    const c = z(!1), d = z(null), h = z([]), f = z(null);
    let m = null;
    const y = z("sections"), v = z(!1), k = z(null), w = O(() => t.view?.sections ?? []), $ = O(() => t.view?.bars ?? []), P = O(() => t.view && t.bar ? cl(t.view, t.bar) : -1), R = O(() => new Set(t.errorBars)), V = O(() => !t.readonly && !!t.view?.model && w.value.length > 0);
    Re(w, (ee) => {
      l.value = (u ?? l.value).filter((G) => G < ee.length), u = null;
    }), Re($, (ee) => {
      h.value = (m ?? h.value).filter((G) => G < ee.length), m = null;
    });
    function E(ee, G) {
      s.value = ee, o.value = G;
    }
    function _(ee) {
      const G = o.value.trim();
      s.value = null, G && G !== w.value[ee]?.label && n("operate", { op: "rename_section", section: ee + 1, label: G });
    }
    function N(ee, G) {
      const de = w.value[ee];
      de && n("operate", { op: "move_section_boundary", section: ee + 1, start_bar: de.start_bar + G });
    }
    function ne(ee) {
      const G = t.sourceStarts?.[ee - 1];
      return typeof G == "number" ? Oo(G) : null;
    }
    function W(ee, G) {
      y.value = "sections";
      const de = G.ctrlKey || G.metaKey;
      l.value = Nc(l.value, ee, { toggle: de, range: G.shiftKey }, a.value), G.shiftKey || (a.value = ee);
      const xe = w.value[ee];
      xe && !de && !G.shiftKey && n("goto", xe.start_bar);
    }
    function T(ee) {
      !ee || !V.value || (u = ee.selection, n("operate", { op: "arrange_sections", order: ee.order }));
    }
    const H = () => T(Hc(w.value.length, l.value)), me = () => T(Vc(w.value.length, l.value)), ve = (ee) => T(zc(w.value.length, l.value, ee));
    function ie() {
      const ee = t.view?.model;
      if (!ee || !l.value.length) return;
      const G = Tx(ee, l.value, t.sectionLyrics ?? null);
      G && (ei.value = G, n("notice", `copied ${G.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function le(ee, G) {
      y.value = "bars";
      const de = G.ctrlKey || G.metaKey;
      h.value = Nc(h.value, ee, { toggle: de, range: G.shiftKey }, f.value), G.shiftKey || (f.value = ee);
      const xe = $.value[ee];
      xe && !de && !G.shiftKey && n("goto", xe.index);
    }
    function Ee(ee) {
      !ee || !V.value || (m = ee.selection, n("operate", { op: "arrange_measures", order: ee.order.map((G) => G - 1) }));
    }
    const Se = () => Ee(Hc($.value.length, h.value)), Be = () => Ee(Vc($.value.length, h.value)), Ae = (ee) => Ee(zc($.value.length, h.value, ee));
    function j() {
      const ee = t.view?.model;
      if (!ee || !h.value.length) return;
      const G = Dx(ee, h.value);
      G && (ei.value = G, n("notice", `copied ${G.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function Qe(ee) {
      const G = ee.ctrlKey || ee.metaKey, de = ee.key.toLowerCase();
      if (ee.key === "Delete" || ee.key === "Backspace") Be();
      else if (G && de === "d") Se();
      else if (G && de === "c") j();
      else if (G && de === "x" && h.value.length < $.value.length)
        j(), Be();
      else if (G && (ee.key === "ArrowLeft" || ee.key === "ArrowUp")) Ae(-1);
      else if (G && (ee.key === "ArrowRight" || ee.key === "ArrowDown")) Ae(1);
      else if (G && de === "a") h.value = $.value.map((xe, Me) => Me);
      else if (ee.key === "Escape" && h.value.length) h.value = [];
      else return !1;
      return !0;
    }
    function ce(ee, G) {
      V.value && (y.value = "bars", h.value.includes(ee) || (h.value = [ee]), v.value = !0, G.dataTransfer?.setData("text/plain", "plenio-bars"), G.dataTransfer && (G.dataTransfer.effectAllowed = "copyMove"));
    }
    function Ce(ee, G) {
      if (!v.value) return;
      G.preventDefault();
      const de = G.currentTarget.getBoundingClientRect();
      k.value = G.clientX < de.left + de.width / 2 ? ee : ee + 1, G.dataTransfer && (G.dataTransfer.dropEffect = G.altKey || G.ctrlKey ? "copy" : "move");
    }
    function te(ee) {
      !v.value || k.value === null || (ee.preventDefault(), Ee(Wc($.value.length, h.value, k.value, ee.altKey || ee.ctrlKey)), K());
    }
    function K() {
      v.value = !1, k.value = null;
    }
    function Q(ee) {
      if (!V.value || ee.target?.closest("input, textarea, select")) return;
      if (y.value === "bars") {
        Qe(ee) && (ee.preventDefault(), ee.stopPropagation());
        return;
      }
      const G = ee.ctrlKey || ee.metaKey, de = ee.key.toLowerCase();
      let xe = !0;
      ee.key === "Delete" || ee.key === "Backspace" ? me() : G && de === "d" ? H() : G && de === "c" ? ie() : G && de === "x" && l.value.length < w.value.length ? (ie(), me()) : G && ee.key === "ArrowUp" ? ve(-1) : G && ee.key === "ArrowDown" ? ve(1) : G && de === "a" ? l.value = w.value.map((Me, Fn) => Fn) : ee.key === "Escape" && l.value.length ? l.value = [] : xe = !1, xe && (ee.preventDefault(), ee.stopPropagation());
    }
    function Fe(ee, G) {
      V.value && (l.value.includes(ee) || (l.value = [ee]), c.value = !0, G.dataTransfer?.setData("text/plain", "plenio-sections"), G.dataTransfer && (G.dataTransfer.effectAllowed = "copyMove"));
    }
    function nt(ee, G) {
      if (!c.value) return;
      G.preventDefault();
      const de = G.currentTarget.getBoundingClientRect();
      d.value = G.clientY < de.top + de.height / 2 ? ee : ee + 1, G.dataTransfer && (G.dataTransfer.dropEffect = G.altKey || G.ctrlKey ? "copy" : "move");
    }
    function Ge(ee) {
      !c.value || d.value === null || (ee.preventDefault(), T(Wc(w.value.length, l.value, d.value, ee.altKey || ee.ctrlKey)), xt());
    }
    function xt() {
      c.value = !1, d.value = null;
    }
    return (ee, G) => (b(), C("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: Q
    }, [
      V.value ? (b(), C("div", Ox, [
        p("span", Ex, I(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: H
        }, " Duplicate ", 8, Ix),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: ie
        }, " Copy ", 8, Rx),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: G[0] || (G[0] = (de) => ve(-1))
        }, "↑", 8, Px),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: G[1] || (G[1] = (de) => ve(1))
        }, "↓", 8, Nx),
        p("button", {
          disabled: !l.value.length || l.value.length >= w.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: me
        }, " Delete ", 8, Vx)
      ])) : U("", !0),
      p("ol", {
        class: "sections",
        onDragleave: G[5] || (G[5] = Ue((de) => d.value = null, ["self"]))
      }, [
        (b(!0), C(he, null, we(w.value, (de, xe) => (b(), C("li", {
          key: xe,
          class: ze({
            current: xe === P.value,
            picked: l.value.includes(xe),
            "drop-before": d.value === xe,
            "drop-after": d.value === xe + 1 && xe === w.value.length - 1
          }),
          draggable: V.value,
          "aria-selected": l.value.includes(xe),
          onDragstart: (Me) => Fe(xe, Me),
          onDragover: (Me) => nt(xe, Me),
          onDrop: Ge,
          onDragend: xt
        }, [
          p("div", {
            class: "section-head",
            onClick: (Me) => W(xe, Me)
          }, [
            p("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${de.start_bar}`
            }, [
              s.value !== xe ? (b(), C("strong", Fx, I(de.label), 1)) : U("", !0)
            ], 8, Wx),
            s.value === xe ? Oe((b(), C("input", {
              key: 0,
              "onUpdate:modelValue": G[2] || (G[2] = (Me) => o.value = Me),
              class: "rename",
              "aria-label": "Section name",
              onClick: G[3] || (G[3] = Ue(() => {
              }, ["stop"])),
              onKeydown: [
                ot(Ue((Me) => _(xe), ["prevent"]), ["enter"]),
                G[4] || (G[4] = ot(Ue((Me) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (Me) => _(xe)
            }, null, 40, Kx)), [
              [ft, o.value]
            ]) : U("", !0),
            p("span", _x, [
              ae(" bars " + I(de.start_bar) + "-" + I(de.start_bar + de.bars - 1) + " · " + I(L(Oo)(de.start_s)) + " ", 1),
              ne(de.start_bar) ? (b(), C(he, { key: 0 }, [
                ae(" · source " + I(ne(de.start_bar)), 1)
              ], 64)) : U("", !0)
            ])
          ], 8, zx),
          i.readonly ? U("", !0) : (b(), C("div", Ux, [
            p("button", {
              title: "Rename this section",
              onClick: (Me) => E(xe, de.label)
            }, "Rename", 8, Gx),
            xe > 0 ? (b(), C(he, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (Me) => N(xe, -1)
              }, "◀ bar", 8, jx),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (Me) => N(xe, 1)
              }, "bar ▶", 8, qx),
              p("button", {
                title: "Join this section to the one before",
                onClick: (Me) => n("operate", { op: "merge_section", section: xe + 1 })
              }, " Join ↑ ", 8, Yx)
            ], 64)) : U("", !0)
          ]))
        ], 42, Hx))), 128))
      ], 32),
      !i.readonly && i.bar ? (b(), C("div", Xx, [
        p("label", null, [
          ae(" New section at bar " + I(i.bar) + ": ", 1),
          Oe(p("input", {
            "onUpdate:modelValue": G[6] || (G[6] = (de) => r.value = de),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [ft, r.value]
          ])
        ]),
        p("button", {
          disabled: i.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: G[7] || (G[7] = (de) => n("operate", { op: "split_section", bar: i.bar, label: r.value }))
        }, " Split ", 8, Jx)
      ])) : U("", !0),
      V.value ? (b(), C("div", Zx, [
        p("span", Qx, I(h.value.length ? `${h.value.length} bar${h.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !h.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Se
        }, " Duplicate ", 8, eS),
        p("button", {
          disabled: !h.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: j
        }, " Copy ", 8, tS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: G[8] || (G[8] = (de) => Ae(-1))
        }, "←", 8, nS),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: G[9] || (G[9] = (de) => Ae(1))
        }, "→", 8, iS),
        p("button", {
          disabled: !h.value.length || h.value.length >= $.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Be
        }, " Delete ", 8, sS)
      ])) : U("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: G[10] || (G[10] = Ue((de) => k.value = null, ["self"]))
      }, [
        (b(!0), C(he, null, we($.value, (de, xe) => (b(), C("button", {
          key: de.index,
          role: "listitem",
          class: ze(["bar", {
            selected: de.index === i.bar,
            picked: h.value.includes(xe),
            error: R.value.has(de.index),
            alt: i.view ? L(cl)(i.view, de.index) % 2 === 1 : !1,
            "drop-before": k.value === xe,
            "drop-after": k.value === xe + 1 && xe === $.value.length - 1
          }]),
          draggable: V.value,
          "aria-selected": h.value.includes(xe),
          title: `Bar ${de.index} · ${L(Oo)(de.start_s)} · ${de.chords.join(" ") || "no chord"}${V.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (Me) => le(xe, Me),
          onDragstart: (Me) => ce(xe, Me),
          onDragover: (Me) => Ce(xe, Me),
          onDrop: te,
          onDragend: K
        }, I(de.index), 43, oS))), 128))
      ], 32)
    ], 32));
  }
}), lS = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, aS = {
  class: "group",
  "aria-label": "History"
}, uS = ["disabled", "title"], cS = ["disabled", "title"], hS = {
  class: "group",
  "aria-label": "Pitch"
}, dS = ["disabled"], fS = ["disabled"], pS = ["disabled"], mS = ["disabled"], gS = {
  class: "group",
  "aria-label": "Length"
}, vS = ["disabled"], yS = ["disabled"], bS = ["disabled"], kS = ["disabled"], wS = {
  class: "group",
  "aria-label": "Chord"
}, xS = ["disabled"], SS = ["disabled"], CS = ["disabled"], MS = { class: "group whole" }, AS = { class: "whole-tools" }, TS = ["disabled"], $S = ["disabled"], DS = ["aria-label"], LS = ["disabled", "title", "onClick"], BS = ["disabled", "title", "onClick"], OS = ["disabled"], ES = ["disabled"], IS = ["disabled"], RS = ["disabled"], PS = /* @__PURE__ */ Dt({
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
    const t = i, n = e, s = z(""), o = z(null), r = O(() => t.selection.filter((k) => t.view?.elements?.find((w) => w.id === k)?.kind === "note")), l = O(() => [...qs(t.selection)]), a = O(() => r.value.length > 0 || l.value.length > 0), u = O(() => t.primary?.kind === "note"), c = O(() => t.primary !== null && t.primary.kind !== "note"), d = O(() => {
      const k = t.primary;
      return !k || !t.view ? null : t.view.chords?.find((w) => w.bar === k.bar && Math.abs(w.start_s - k.start_s) < 1e-6) ?? null;
    }), h = O(() => t.primary && u.value ? ul(t.primary.units, 1) : null), f = O(() => t.primary && u.value ? ul(t.primary.units, -1) : null);
    Re(
      () => t.view?.header?.tempo_bpm,
      (k) => {
        o.value = k ?? null;
      },
      { immediate: !0 }
    ), Re(d, (k) => {
      s.value = k?.name ?? "";
    });
    const m = Object.values(Jn).map(({ track: k, name: w }) => [k, w]), y = (k, w) => xs(t.view, k, w);
    function v(k) {
      l.value.length ? n("operate", { op: "set_note_pitch", ids: [...us(t.view, t.selection), ...l.value], semitones: k }) : r.value.length && n("operate", { op: "shift_pitch", ids: r.value, semitones: k });
    }
    return (k, w) => (b(), C("div", lS, [
      p("div", aS, [
        p("button", {
          disabled: !i.canUndo || i.busy,
          title: `Undo${i.undoLabel ? ": " + i.undoLabel : ""} (Ctrl+Z)`,
          onClick: w[0] || (w[0] = ($) => n("undo"))
        }, "↶", 8, uS),
        p("button", {
          disabled: !i.canRedo || i.busy,
          title: `Redo${i.redoLabel ? ": " + i.redoLabel : ""} (Ctrl+Y)`,
          onClick: w[1] || (w[1] = ($) => n("redo"))
        }, "↷", 8, cS)
      ]),
      p("div", hS, [
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave down (Shift+↓)",
          onClick: w[2] || (w[2] = ($) => v(-12))
        }, "−8va", 8, dS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: w[3] || (w[3] = ($) => v(-1))
        }, "−1", 8, fS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: w[4] || (w[4] = ($) => v(1))
        }, "+1", 8, pS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave up (Shift+↑)",
          onClick: w[5] || (w[5] = ($) => v(12))
        }, "+8va", 8, mS)
      ]),
      p("div", gS, [
        p("button", {
          disabled: !f.value || i.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: w[6] || (w[6] = ($) => i.primary && f.value && n("operate", { op: "set_duration", id: i.primary.id, units: f.value }))
        }, " shorter ", 8, vS),
        p("button", {
          disabled: !h.value || i.busy,
          title: "Longer, into the rest after the note (])",
          onClick: w[7] || (w[7] = ($) => i.primary && h.value && n("operate", { op: "set_duration", id: i.primary.id, units: h.value }))
        }, " longer ", 8, yS),
        p("button", {
          disabled: !r.value.length || i.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: w[8] || (w[8] = ($) => n("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, bS),
        p("button", {
          disabled: !c.value || i.busy,
          title: "Turn the rest into a note (N)",
          onClick: w[9] || (w[9] = ($) => i.primary && n("operate", { op: "rest_to_note", id: i.primary.id }))
        }, " note ", 8, kS)
      ]),
      p("div", wS, [
        Oe(p("input", {
          "onUpdate:modelValue": w[10] || (w[10] = ($) => s.value = $),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !i.primary || i.busy,
          onKeydown: w[11] || (w[11] = ot(Ue(($) => i.primary && s.value.trim() && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, xS), [
          [ft, s.value]
        ]),
        p("button", {
          disabled: !i.primary || !s.value.trim() || i.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: w[12] || (w[12] = ($) => i.primary && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }))
        }, " set ", 8, SS),
        p("button", {
          disabled: !d.value || i.busy,
          title: "Remove the chord symbol at the selection",
          onClick: w[13] || (w[13] = ($) => d.value && n("operate", { op: "remove_chord", chord: d.value.id }))
        }, " remove ", 8, CS)
      ]),
      p("details", MS, [
        w[22] || (w[22] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", AS, [
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone down",
            onClick: w[14] || (w[14] = ($) => n("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, TS),
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone up",
            onClick: w[15] || (w[15] = ($) => n("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, $S),
          (b(!0), C(he, null, we(L(m), ([$, P]) => (b(), C("span", {
            key: $,
            class: "track-octave",
            role: "group",
            "aria-label": `${P} track octave`
          }, [
            ae(I(P) + " ", 1),
            p("button", {
              disabled: i.busy || !!y($, -12),
              title: y($, -12) ?? `Every ${P} note an octave down (chord symbols and keys stay)`,
              onClick: (R) => n("operate", { op: "shift_track", track: $, semitones: -12 })
            }, " −8va ", 8, LS),
            p("button", {
              disabled: i.busy || !!y($, 12),
              title: y($, 12) ?? `Every ${P} note an octave up (chord symbols and keys stay)`,
              onClick: (R) => n("operate", { op: "shift_track", track: $, semitones: 12 })
            }, " +8va ", 8, BS)
          ], 8, DS))), 128)),
          p("label", null, [
            w[21] || (w[21] = ae(" tempo ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": w[16] || (w[16] = ($) => o.value = $),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                ft,
                o.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("button", {
            disabled: i.busy || !o.value || o.value === i.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: w[17] || (w[17] = ($) => o.value && n("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, OS),
          p("button", {
            disabled: i.busy || !i.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: w[18] || (w[18] = ($) => n("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, ES),
          p("button", {
            disabled: i.busy,
            title: "Let the instrument play the vocal melody",
            onClick: w[19] || (w[19] = ($) => n("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, IS),
          p("button", {
            disabled: i.busy,
            title: "Replace every Vocal note by rests",
            onClick: w[20] || (w[20] = ($) => n("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, RS)
        ])
      ])
    ]));
  }
}), NS = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, VS = ["disabled", "title"], HS = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, zS = ["aria-checked", "disabled", "title", "onClick"], WS = ["disabled"], FS = ["title"], KS = ["disabled"], _S = { class: "align" }, US = ["aria-expanded", "title"], GS = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, jS = ["title"], qS = ["title"], YS = ["disabled"], XS = {
  key: 0,
  class: "facts"
}, JS = ["title"], ZS = { title: "A click on every beat (takes effect at the next start)" }, QS = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, eC = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, tC = ["checked"], nC = { title: "Practice speed; the score's tempo is not changed" }, iC = { class: "facts" }, sC = {
  key: 1,
  class: "error"
}, oC = /* @__PURE__ */ Dt({
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
    const n = i, s = ct(i, "voices"), o = ct(i, "speed"), r = ct(i, "metronome"), l = ct(i, "hear"), a = ct(i, "sourceLevel"), u = ct(i, "sourceShift"), c = z(!1);
    function d(te) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + te) * 1e3) / 1e3));
    }
    const h = O(() => {
      const te = Math.round(u.value * 1e3);
      return te ? `${Math.abs(te)} ms ${te > 0 ? "later" : "earlier"}` : "in place";
    }), f = t, m = new sw(), y = z(!1), v = z(!1);
    let k = 0, w = null;
    const $ = z(!1), P = z(0), R = z(null);
    let V = null;
    const E = O(() => n.bar ?? 1), _ = O(() => n.from ?? n.view?.bars[E.value - 1]?.start_s ?? 0), N = O(() => n.position ? `the cursor (${n.position})` : `bar ${E.value}`), ne = O(() => !!n.view?.notes), W = O(() => !!n.reference && !!n.source && o.value === 1), T = O(() => n.reference ? n.sourceProblem ? n.sourceProblem : n.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function H() {
      const te = W.value ? l.value : "notes";
      return { tones: te === "source" ? 0 : 1, source: te === "notes" ? 0 : a.value };
    }
    function me(te) {
      const K = n.view?.bars ?? [];
      let Q = 1;
      for (const Fe of K) Fe.start_s <= te + Do && (Q = Fe.index);
      return Q;
    }
    function ve(te) {
      if (n.loopRange) return [n.loopRange.from, n.loopRange.to];
      const K = n.view;
      if (!K) return null;
      const Q = K.sections[cl(K, me(te))];
      return Q ? [Q.start_s, Q.end_s] : null;
    }
    function ie(te = _.value, K = null) {
      const Q = n.view;
      if (!Q) return;
      Be(), w = K;
      const Fe = $.value && !K ? ve(te) : null, nt = Fe && (te < Fe[0] - Do || te >= Fe[1] - Do) ? Fe[0] : te, Ge = W.value, xt = Ge ? lp(Q, n.timelineBars) : null, ee = { ...s.value };
      K?.mute && (ee[K.mute] = !1), V = {
        from: nt,
        to: Fe ? Fe[1] : null,
        voices: ee,
        speed: o.value,
        metronome: r.value,
        guide: n.guide ?? [],
        clock: xt
      };
      const G = V;
      k = K ? Ee(Q, nt, K.countIn, xt) : 0;
      const de = ap(Q, G).map((Me) => ({ ...Me, at: Me.at + k }));
      k && de.unshift(...Se(Q, nt, K?.countIn ?? 0, k));
      const xe = Ge && xt && n.source ? up(xt, nt, G.to).map((Me) => ({ ...Me, at: Me.at + k })) : [];
      try {
        m.play(de, {
          source: xe.length && n.source ? { buffer: n.source.buffer, segments: xe } : null,
          levels: H(),
          length: k + dp(Q, G),
          sounds: n.sounds,
          onTick: (Me) => {
            v.value = Me < k, !(Me < k) && (P.value = cp(G, Me - k), f("cursor", hp(Q, P.value, G.voices)), f("time", P.value));
          },
          onEnd: () => {
            $.value && y.value && !K ? ie(Fe?.[0] ?? G.from) : Ae();
          }
        }), y.value = !0, v.value = k > 0, R.value = null;
      } catch (Me) {
        R.value = Me instanceof Error ? Me.message : String(Me);
      }
    }
    function le(te, K, Q) {
      const Fe = te.bars[me(K) - 1], nt = Number(Fe?.meter.split("/")[0]) || 4;
      return { beat: (Q?.[me(K) - 1]?.realDur ?? Fe?.duration_s ?? 2) / nt / Ua(o.value), beats: nt };
    }
    function Ee(te, K, Q, Fe) {
      if (Q <= 0) return 0;
      const { beat: nt, beats: Ge } = le(te, K, Fe);
      return Q * Ge * nt;
    }
    function Se(te, K, Q, Fe) {
      const { beat: nt, beats: Ge } = le(te, K, V?.clock ?? null);
      return fp(te.bars[me(K) - 1] ?? null, Ge, K, Q, Fe, nt);
    }
    function Be() {
      m.stop(), y.value = !1, v.value = !1, w = null;
    }
    function Ae() {
      const te = y.value;
      Be(), f("cursor", []), f("time", null), te && f("stopped");
    }
    function j(te, K) {
      return ie(te, K), y.value;
    }
    function Qe(te) {
      const K = V;
      if (!K || !y.value) return null;
      const Q = m.elapsedAt(te) - k, Fe = K.clock?.length ? K.clock : null, nt = Q * Ua(K.speed);
      return Fe ? pp(Fe, mp(Fe, K.from) + nt) : K.from + nt;
    }
    function ce() {
      y.value ? Ae() : ie();
    }
    function Ce() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Re(
      () => n.sounds,
      (te) => {
        te && m.setSounds(te);
      },
      { deep: !0 }
    ), Re([l, a], () => {
      y.value && m.setLevels(H());
    }), Re(
      () => n.from,
      (te, K) => {
        y.value && !w && te !== null && te !== void 0 && te !== K && ie(te);
      }
    ), e({ toggle: ce, stop: Ae, swap: Ce, playing: y, record: j, scoreSecondAt: Qe, countingIn: v }), zn(() => m.close()), (te, K) => (b(), C("div", NS, [
      p("button", {
        disabled: !ne.value,
        title: y.value ? "Stop (Space)" : `Play from ${N.value} (Space)`,
        onClick: ce
      }, I(y.value ? "■ stop" : "▶ play"), 9, VS),
      Jf(te.$slots, "record", {
        playing: y.value,
        countingIn: v.value
      }),
      i.reference ? (b(), C("span", HS, [
        (b(), C(he, null, we(["both", "notes", "source"], (Q) => p("button", {
          key: Q,
          role: "radio",
          "aria-checked": l.value === Q,
          class: ze({ active: l.value === Q }),
          disabled: !W.value && Q !== "notes",
          title: T.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[Q],
          onClick: (Fe) => l.value = Q
        }, I(Q), 11, zS)), 64)),
        p("button", {
          disabled: !W.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Ce
        }, "A/B", 8, WS),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          K[14] || (K[14] = ae(" source ", -1)),
          Oe(p("input", {
            "onUpdate:modelValue": K[0] || (K[0] = (Q) => a.value = Q),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !W.value,
            "aria-label": "Source level"
          }, null, 8, KS), [
            [
              ft,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, FS),
        p("span", _S, [
          p("button", {
            class: ze({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${h.value})`,
            onClick: K[1] || (K[1] = (Q) => c.value = !c.value)
          }, " ⇆ align" + I(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, US),
          c.value ? (b(), C("span", GS, [
            K[15] || (K[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: K[2] || (K[2] = (Q) => d(-(i.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, jS),
            p("button", {
              title: "10 ms earlier",
              onClick: K[3] || (K[3] = (Q) => d(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, I(h.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: K[4] || (K[4] = (Q) => d(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: K[5] || (K[5] = (Q) => d(i.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, qS),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: K[6] || (K[6] = (Q) => u.value = 0)
            }, "reset", 8, YS)
          ])) : U("", !0)
        ]),
        T.value ? (b(), C("span", XS, I(T.value), 1)) : U("", !0)
      ])) : U("", !0),
      p("label", {
        title: i.loopRange ? `Play to the end of the selection (${i.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        Oe(p("input", {
          "onUpdate:modelValue": K[7] || (K[7] = (Q) => $.value = Q),
          type: "checkbox"
        }, null, 512), [
          [Nt, $.value]
        ]),
        ae(" loop " + I(i.loopRange ? i.loopRange.label : "section"), 1)
      ], 8, JS),
      p("label", ZS, [
        Oe(p("input", {
          "onUpdate:modelValue": K[8] || (K[8] = (Q) => r.value = Q),
          type: "checkbox"
        }, null, 512), [
          [Nt, r.value]
        ]),
        K[16] || (K[16] = ae(" metronome", -1))
      ]),
      p("span", QS, [
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[9] || (K[9] = (Q) => s.value.Vocal = Q),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.Vocal]
          ]),
          K[17] || (K[17] = ae(" Vocal", -1))
        ]),
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[10] || (K[10] = (Q) => s.value.Ins = Q),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.Ins]
          ]),
          K[18] || (K[18] = ae(" Ins", -1))
        ]),
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[11] || (K[11] = (Q) => s.value.chords = Q),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.chords]
          ]),
          K[19] || (K[19] = ae(" chords", -1))
        ]),
        i.guide?.length ? (b(), C("label", eC, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: K[12] || (K[12] = (Q) => s.value = { ...s.value, guide: Q.target.checked })
          }, null, 40, tC),
          K[20] || (K[20] = ae(" Guide ", -1))
        ])) : U("", !0)
      ]),
      p("label", nC, [
        K[22] || (K[22] = ae(" speed ", -1)),
        Oe(p("select", {
          "onUpdate:modelValue": K[13] || (K[13] = (Q) => o.value = Q),
          "aria-label": "Playback speed"
        }, [...K[21] || (K[21] = [
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
      p("span", iC, I(y.value ? `▶ ${L(Oo)(P.value)}` : `${i.position ? `cursor ${i.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      R.value ? (b(), C("span", sC, I(R.value), 1)) : U("", !0)
    ]));
  }
}), rC = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, lC = { class: "track-name" }, aC = { class: "count" }, uC = ["value", "aria-label", "title", "onChange"], cC = ["value", "title"], hC = ["title"], dC = ["checked", "aria-label", "onChange"], fC = ["aria-label"], pC = ["disabled", "title", "onClick"], mC = ["disabled", "title", "onClick"], gC = {
  key: 0,
  class: "hint"
}, vC = {
  key: 1,
  class: "hint"
}, yC = /* @__PURE__ */ Dt({
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
    const t = i, n = ct(i, "voices"), s = ct(i, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(d, h) {
      const f = o[d];
      s.value && f && (s.value = { ...s.value, [f]: h });
    }
    const l = e, a = O(
      () => nm(t.view, t.guideCount).filter((d) => t.keepsGuide || d.voice !== "guide")
    );
    function u(d) {
      return d === "guide" ? n.value.guide !== !1 : n.value[d] !== !1;
    }
    function c(d, h) {
      d === "guide" ? n.value = { ...n.value, guide: h } : n.value = { ...n.value, [d]: h };
    }
    return (d, h) => (b(), C("div", rC, [
      h[2] || (h[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (b(!0), C(he, null, we(a.value, (f) => (b(), C("li", {
          key: f.voice,
          class: ze({ guide: f.voice === "guide", active: f.voice === "guide" && i.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: ji({ background: f.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", lC, I(f.name), 1),
          p("span", {
            class: ze(["destination", { unsent: !f.sent }])
          }, I(f.destination), 3),
          p("span", aC, I(L(tm)(f.notes)), 1),
          s.value && o[f.voice] ? (b(), C("select", {
            key: 0,
            class: "sound",
            value: s.value[o[f.voice]],
            "aria-label": `Sound of the ${f.name} track`,
            title: `The ${f.name} track’s sound in the playback`,
            onChange: (m) => r(f.voice, m.target.value)
          }, [
            (b(!0), C(he, null, we(L(Zc), (m) => (b(), C("option", {
              key: m,
              value: m,
              title: L(Fo)[m].hint
            }, I(L(Fo)[m].label), 9, cC))), 128))
          ], 40, uC)) : U("", !0),
          p("label", {
            class: "play",
            title: `Play the ${f.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(f.voice),
              "aria-label": `Play the ${f.name} track`,
              onChange: (m) => c(f.voice, m.target.checked)
            }, null, 40, dC)
          ], 8, hC),
          L(Jn)[f.voice] && !i.readonly ? (b(), C("span", {
            key: 1,
            class: "octave",
            role: "group",
            "aria-label": `${f.name} track octave`
          }, [
            p("button", {
              class: "shift",
              disabled: !!L(xs)(i.view, L(Jn)[f.voice].track, -12),
              title: L(xs)(i.view, L(Jn)[f.voice].track, -12) ?? `Every ${f.name} note an octave down`,
              onClick: (m) => l("shiftTrack", L(Jn)[f.voice].track, -12)
            }, " −8va ", 8, pC),
            p("button", {
              class: "shift",
              disabled: !!L(xs)(i.view, L(Jn)[f.voice].track, 12),
              title: L(xs)(i.view, L(Jn)[f.voice].track, 12) ?? `Every ${f.name} note an octave up`,
              onClick: (m) => l("shiftTrack", L(Jn)[f.voice].track, 12)
            }, " +8va ", 8, mC)
          ], 8, fC)) : U("", !0),
          f.voice === "guide" && f.notes > 0 && !i.readonly ? (b(), C("button", {
            key: 2,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: h[0] || (h[0] = (m) => l("clearGuide"))
          }, " clear ")) : U("", !0)
        ], 2))), 128))
      ]),
      i.keepsGuide ? (b(), C("p", gC, [...h[1] || (h[1] = [
        ae(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        ae(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (b(), C("p", vC, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), bC = /^\[([^[\]\n]{1,40})\]$/;
function Ys(i) {
  const e = [], t = [];
  let n = null;
  for (const s of i.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = bC.exec(o);
    r ? (n = { tag: r[1].trim(), lines: [] }, t.push(n)) : o && (n ? n.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function ur(i) {
  return i.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function Pa(i, e) {
  return e && ur(e.tag) === ur(i) ? e.tag : i.replace(/(^|[\s-])(\p{L})/gu, (t, n, s) => n + s.toUpperCase());
}
function cr(i) {
  return i.sections.map((e) => i.measures[e.first_bar - 1]?.onset ?? 0);
}
function To(i, e) {
  if (!i?.trim() || !e) return null;
  const t = Ys(i), n = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== n.length || n.some((o, r) => ur(o.label) !== ur(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function kC(i, e) {
  const t = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return e.sections.forEach((n, s) => {
    if (n.implicit) return;
    const o = i.blocks[s] ?? null;
    t.push([`[${Pa(n.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function Df(i, e) {
  return e?.length ? e : [[0, i.total, 0]];
}
function Lf(i, e, t) {
  const n = Df(i, t), s = cr(i), o = (u) => {
    let c = -1;
    return s.forEach((d, h) => {
      d <= u && (c = h);
    }), c;
  }, r = (u) => {
    for (const [c, d, h] of n)
      if (u >= h && u < h + d - c) return c + u - h;
    return null;
  }, l = [], a = [];
  return cr(e).forEach((u, c) => {
    const d = r(u), h = d === null ? -1 : o(d);
    a.push(h), l.push(h >= 0 && d !== null && (d === s[h] || a[c - 1] !== h) ? h : -1);
  }), l;
}
function wC(i, e, t, n, s = () => null) {
  const o = Df(e, n), r = cr(e), l = cr(t), a = (f) => {
    for (const [m, y, v] of o)
      if (f >= v && f < v + y - m) return m + f - v;
    return null;
  }, u = (f) => f ? { tag: f.tag, lines: [...f.lines] } : null, c = Lf(e, t, n), d = new Set(c.filter((f) => f >= 0)), h = l.map((f, m) => a(f) === null ? s(f) : c[m] >= 0 ? u(i.blocks[c[m]] ?? null) : null);
  return r.forEach((f, m) => {
    const y = i.blocks[m]?.lines;
    if (!(d.has(m) || !y?.length))
      for (const [v, k, w] of o) {
        if (f < v || f >= k) continue;
        const $ = w + f - v;
        let P = -1;
        l.forEach((V, E) => {
          V <= $ && (P = E);
        });
        const R = P >= 0 && l[P] !== $ ? h[P] : null;
        R && (h[P] = { tag: R.tag, lines: [...R.lines, ...y] });
      }
  }), { preamble: i.preamble, blocks: h };
}
function Bf(i, e, t) {
  const n = [...i], s = t.trim();
  return e >= n.length ? s && n.push(s) : s ? n[e] = s : n.splice(e, 1), n;
}
function xC(i, e, t, n) {
  const s = Ys(i);
  if (!s.blocks[e]) return i;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Bf(a.lines, t, n) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function SC(i, e, t, n, s) {
  const o = e.sections[t]?.label ?? "", r = i.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Pa(o, null), lines: [] };
    return { tag: u.tag, lines: Bf(u.lines, n, s) };
  });
  return { preamble: i.preamble, blocks: r };
}
function CC(i, e, t) {
  const n = Ys(i);
  if (!n.blocks[e]) return i;
  const s = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return n.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function MC(i, e, t, n) {
  const s = e.sections[t]?.label ?? "", o = i.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Pa(s, null) }).tag, lines: [...n] } : r
  );
  return { preamble: i.preamble, blocks: o };
}
const AC = 2, TC = 0.5, $C = 32;
function Uc(i, e, t, n) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= n) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, n) - l}.${o.pitch}`);
  }
  return `${i}:${s.join(",")}`;
}
function DC(i) {
  return i.measures.map((e) => [
    Uc(e.meter, i.tracks.vocal, e.onset, e.onset + e.length),
    Uc(e.meter, i.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function LC(i, e) {
  let t = 0;
  for (let n = 0; n < 2; n++) i[n] === e[n] && (t += i[n].endsWith(":") ? TC : AC);
  return t;
}
function BC(i, e) {
  const t = i.map((l) => e.map((a) => LC(l, a))), n = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < $C && l + u < i.length && a + u < e.length && !(n[l + u] <= 0 || t[l + u][a + u] !== n[l + u]); )
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
function OC(i, e) {
  if (e?.bars?.length)
    return !i || !e.bar_prints?.length ? i ? i.measures.map((t, n) => e.bars[n] ?? null) : e.bars : BC(DC(i), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const EC = "1.4.1";
function IC(i) {
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
function Gc(i, e) {
  return {
    ...i,
    ...e,
    sounds: { ...i.sounds, ...e.sounds ?? {} },
    record: { ...i.record, ...e.record ?? {} }
  };
}
function Na(i) {
  if (typeof i != "object" || i === null) return {};
  const e = i, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const n = e.sounds;
    Object.values(n).some(vp) && (t.sounds = yp(n));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = bp(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), kp(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const kn = (i, e, t, n) => ({ Vocal: i, Ins: e, chord: t, guide: n }), $o = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: kn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: kn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: kn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: kn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: kn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: kn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: kn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: kn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: kn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...gp(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: kn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], RC = "plenio/score-editor-presets.json", PC = "plenio.score_presets/1", Of = "plenio.score-editor.presets";
function Ef(i) {
  const e = typeof i == "object" && i !== null ? i : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), n.push({ name: r, builtIn: !1, settings: Na(o.settings) }));
  }
  return n;
}
function If(i) {
  return JSON.stringify({ schema: PC, presets: i.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function NC() {
  try {
    return Ef(JSON.parse(window.localStorage.getItem(Of) ?? "{}"));
  } catch {
    return [];
  }
}
function VC(i) {
  try {
    return window.localStorage.setItem(Of, If(i)), !0;
  } catch {
    return !1;
  }
}
const Rf = `/userdata/${encodeURIComponent(RC)}`;
async function HC(i) {
  if (i)
    try {
      const e = await i.fetchApi(Rf, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: Ef(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: NC(), where: "browser" };
}
async function jc(i, e) {
  const t = e.filter((n) => !n.builtIn);
  if (i)
    try {
      if ((await i.fetchApi(`${Rf}?overwrite=true`, { method: "POST", body: If(t) })).ok) return "comfyui";
    } catch {
    }
  return VC(t) ? "browser" : "failed";
}
function zC(i, e) {
  return [...i.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, n) => t.name.localeCompare(n.name));
}
const zo = "plenio.score_project/1", Pf = ".plenio.json";
function qc(i, e = /* @__PURE__ */ new Date()) {
  return {
    schema: zo,
    app: `Plenio Music Production System ${EC}`,
    saved: e.toISOString(),
    title: (i.title ?? "").trim(),
    score: i.score,
    guide: (i.guide ?? []).map(([t, n, s]) => [t, n, s]),
    lyrics: i.lyrics?.trim() ? i.lyrics : null,
    lyric_spans: i.lyrics?.trim() ? ia(i.lyricSpans ?? []) : [],
    settings: i.settings ? Na(i.settings) : {}
  };
}
function WC(i) {
  return `${Array.from((i ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${Pf}`;
}
function FC(i) {
  let e;
  try {
    e = JSON.parse(i);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== zo ? `This file is not a Plenio score project (${zo}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: zo,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: im(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: ia(t.lyric_spans),
    settings: Na(t.settings)
  };
}
const KC = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, _C = ["disabled", "title"], UC = ["disabled", "title"], GC = ["title"], jC = { class: "midi-settings" }, qC = ["aria-expanded"], YC = ["onKeydown"], XC = { class: "facts" }, JC = { key: 0 }, ZC = ["value"], QC = ["value"], e2 = ["value"], t2 = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, n2 = ["checked"], i2 = ["value"], s2 = { title: "Where the take's starts and ends go" }, o2 = ["value"], r2 = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, l2 = ["value"], a2 = { title: "Silence the old notes of the recorded voice while recording" }, u2 = ["checked"], c2 = ["value"], h2 = /* @__PURE__ */ Dt({
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
    const t = i, n = ct(i, "settings"), s = e, o = z(!1), r = z(null);
    function l() {
      o.value = !1, Cn(() => r.value?.focus());
    }
    const a = z(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    zn(() => clearInterval(u));
    const c = O(() => {
      const y = t.hub.selected.value;
      if (y === "all") return null;
      const v = t.hub.devices.value.find((k) => k.id === y);
      return v?.connected ? null : v?.name ?? "the chosen keyboard";
    }), d = O(() => a.value - t.hub.activity.value < 250), h = O(() => {
      const y = t.hub;
      if (y.status.value === "ready") {
        const v = y.devices.value.filter((k) => k.connected);
        return v.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${v.length} keyboard${v.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return y.status.value === "asking" ? "asking for MIDI access…" : y.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : y.problem.value ?? "MIDI is not available";
    }), f = O(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${n.value.countIn ? `, after ${n.value.countIn} bar${n.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function m(y, v) {
      n.value = { ...n.value, [y]: v };
    }
    return (y, v) => (b(), C("span", KC, [
      p("button", {
        class: ze(["rec", { on: i.recording, counting: i.countingIn }]),
        disabled: !!i.disabled && !i.recording,
        title: f.value,
        onClick: v[0] || (v[0] = (k) => i.recording ? s("stop") : s("record"))
      }, " ● " + I(i.recording && i.countingIn ? "count-in" : "rec"), 11, _C),
      p("button", {
        class: ze(["step", { on: i.step }]),
        disabled: !!i.disabled || i.recording,
        title: i.disabled ?? (i.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${i.target}: every key writes a note of the step length at the cursor`),
        onClick: v[1] || (v[1] = (k) => s("step"))
      }, " step ", 10, UC),
      i.step ? (b(), C("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: v[2] || (v[2] = (k) => s("rest"))
      }, "rest ▶")) : U("", !0),
      p("span", {
        class: ze(["midi-light", { active: d.value, ready: i.hub.status.value === "ready" }]),
        title: h.value,
        "aria-hidden": "true"
      }, null, 10, GC),
      p("span", jC, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: v[3] || (v[3] = (k) => o.value ? l() : o.value = !0)
        }, "🎹", 8, qC),
        o.value ? (b(), C("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: ot(Ue(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          v[24] || (v[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", XC, I(h.value), 1),
          i.hub.status.value === "ready" ? (b(), C("label", JC, [
            v[13] || (v[13] = ae(" keyboard ", -1)),
            p("select", {
              value: i.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: v[4] || (v[4] = (k) => i.hub.selected.value = k.target.value)
            }, [
              v[12] || (v[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (b(!0), C(he, null, we(i.hub.devices.value.filter((k) => k.connected), (k) => (b(), C("option", {
                key: k.id,
                value: k.id
              }, I(k.name), 9, QC))), 128)),
              c.value ? (b(), C("option", {
                key: 0,
                value: i.hub.selected.value,
                disabled: ""
              }, I(c.value) + " (unplugged)", 9, e2)) : U("", !0)
            ], 40, ZC)
          ])) : i.hub.status.value !== "asking" ? (b(), C("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: v[5] || (v[5] = (k) => s("enable"))
          }, "use MIDI")) : U("", !0),
          p("label", t2, [
            p("input", {
              checked: n.value.thru,
              type: "checkbox",
              onChange: v[6] || (v[6] = (k) => m("thru", k.target.checked))
            }, null, 40, n2),
            v[14] || (v[14] = ae(" hear the keys ", -1))
          ]),
          p("strong", null, "Recording into " + I(i.target), 1),
          v[25] || (v[25] = p("span", { class: "facts" }, [
            ae("The voice is the roll's "),
            p("em", null, "draw into"),
            ae("; the take starts at the cursor.")
          ], -1)),
          p("label", null, [
            v[16] || (v[16] = ae(" count-in ", -1)),
            p("select", {
              value: n.value.countIn,
              "aria-label": "Count-in",
              onChange: v[7] || (v[7] = (k) => m("countIn", Number(k.target.value)))
            }, [...v[15] || (v[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, i2)
          ]),
          p("label", s2, [
            v[18] || (v[18] = ae(" quantize ", -1)),
            p("select", {
              value: n.value.quantize,
              "aria-label": "Quantize the take",
              onChange: v[8] || (v[8] = (k) => m("quantize", Number(k.target.value)))
            }, [...v[17] || (v[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, o2)
          ]),
          p("label", r2, [
            v[20] || (v[20] = ae(" mode ", -1)),
            p("select", {
              value: n.value.mode,
              "aria-label": "Replace or merge",
              onChange: v[9] || (v[9] = (k) => m("mode", k.target.value))
            }, [...v[19] || (v[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, l2)
          ]),
          p("label", a2, [
            p("input", {
              checked: n.value.mute,
              type: "checkbox",
              onChange: v[10] || (v[10] = (k) => m("mute", k.target.checked))
            }, null, 40, u2),
            v[21] || (v[21] = ae(" mute its old notes ", -1))
          ]),
          v[26] || (v[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            v[23] || (v[23] = ae(" step ", -1)),
            p("select", {
              value: n.value.stepLength,
              "aria-label": "Step length",
              onChange: v[11] || (v[11] = (k) => m("stepLength", Number(k.target.value)))
            }, [...v[22] || (v[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, c2)
          ])
        ], 40, YC)) : U("", !0)
      ])
    ]));
  }
}), d2 = { class: "notation-export" }, f2 = ["disabled", "aria-expanded", "title"], p2 = ["onKeydown"], m2 = { title: "The paper of the PDF and the print" }, g2 = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, v2 = { class: "formats" }, y2 = ["disabled"], b2 = ["disabled"], k2 = ["disabled"], w2 = ["disabled"], x2 = { class: "facts" }, S2 = /* @__PURE__ */ Dt({
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
    const t = i, n = ct(i, "paper"), s = ct(i, "size"), o = e, r = z(!1), l = z(!1), a = z(null);
    function u() {
      r.value = !1, Cn(() => a.value?.focus());
    }
    async function c(d) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((f) => setTimeout(f, 20));
      let h = null;
      try {
        h = Kp(t.abc, t.title, n.value, s.value);
        const { lines: f } = h;
        if (!f.length) throw new Error("the score has no music to draw");
        const m = n.value === "a4" ? "A4" : "Letter";
        if (d === "pdf") {
          const y = await _p(f, n.value, t.title);
          Zi(Nr(t.title, "pdf"), y, "application/pdf"), o("done", `exported the notation as PDF (${m})`);
        } else d === "png" ? (Zi(Nr(t.title, "png"), await Up(f), "image/png"), o("done", "exported the notation as PNG")) : d === "svg" ? (Zi(Nr(t.title, "svg"), new TextEncoder().encode(Gp(f)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (jp(f, n.value, t.title), o("done", `printing the notation (${m}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (f) {
        o("failed", `The notation could not be exported: ${f instanceof Error ? f.message : String(f)}`);
      } finally {
        h?.dispose(), l.value = !1;
      }
    }
    return (d, h) => (b(), C("span", d2, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !i.abc,
        "aria-expanded": r.value,
        title: i.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (f) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, f2),
      r.value ? (b(), C("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: ot(Ue(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", m2, [
          h[8] || (h[8] = ae(" paper ", -1)),
          Oe(p("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (f) => n.value = f),
            "aria-label": "Paper"
          }, [...h[7] || (h[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [ri, n.value]
          ])
        ]),
        p("label", g2, [
          h[10] || (h[10] = ae(" size ", -1)),
          Oe(p("select", {
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
        p("span", v2, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[3] || (h[3] = (f) => c("pdf"))
          }, "PDF", 8, y2),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: h[4] || (h[4] = (f) => c("png"))
          }, "PNG", 8, b2),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[5] || (h[5] = (f) => c("svg"))
          }, "SVG", 8, k2),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[6] || (h[6] = (f) => c("print"))
          }, "Print…", 8, w2)
        ]),
        p("span", x2, I(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, p2)) : U("", !0)
    ]));
  }
}), C2 = { class: "sounds-settings" }, M2 = ["aria-expanded"], A2 = ["onKeydown"], T2 = { class: "row" }, $2 = { label: "Built in" }, D2 = ["value", "title"], L2 = {
  key: 0,
  label: "Yours"
}, B2 = ["value"], O2 = ["disabled"], E2 = {
  key: 0,
  class: "facts"
}, I2 = { class: "row" }, R2 = ["onKeydown"], P2 = ["disabled"], N2 = {
  key: 1,
  class: "facts",
  role: "status"
}, V2 = {
  key: 2,
  class: "facts"
}, H2 = { class: "track" }, z2 = ["value", "aria-label", "onChange"], W2 = ["value", "title"], F2 = ["title", "aria-label", "onClick"], K2 = /* @__PURE__ */ Dt({
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
    const t = i, n = ct(i, "sounds"), s = e, o = z(!1), r = z(null), l = z([]), a = z(null), u = z(!1), c = z(""), d = z(!1), h = z(""), f = z(null), m = O(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([E]) => E !== "guide" || t.keepsGuide)
    ), y = O(() => l.value.find((E) => E.name === c.value) ?? null);
    async function v() {
      if (o.value = !0, u.value) return;
      const E = await HC(t.fetcher);
      l.value = E.presets, a.value = E.where, u.value = !0;
    }
    function k() {
      o.value = !1, d.value = !1, Cn(() => r.value?.focus());
    }
    function w() {
      const E = [...$o, ...l.value].find((_) => _.name === c.value);
      E && (s("apply", E.settings, E.name), f.value = `“${E.name}” is set.`);
    }
    async function $() {
      const E = h.value.trim().slice(0, 60);
      if (!E) return;
      if ($o.some((ne) => ne.name.toLowerCase() === E.toLowerCase())) {
        f.value = `“${E}” is a built-in preset - choose another name.`;
        return;
      }
      const _ = zC(l.value, { name: E, builtIn: !1, settings: structuredClone(t.settings) }), N = await jc(t.fetcher, _);
      if (N === "failed") {
        f.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = _, a.value = N, c.value = E, d.value = !1, h.value = "", f.value = N === "comfyui" ? `Saved “${E}” in ComfyUI’s user data.` : `Saved “${E}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function P() {
      const E = y.value;
      if (!E) return;
      const _ = l.value.filter((ne) => ne !== E);
      if (await jc(t.fetcher, _) === "failed") {
        f.value = "The preset could not be deleted.";
        return;
      }
      l.value = _, c.value = "", f.value = `Deleted “${E.name}”.`;
    }
    function R(E, _) {
      n.value = { ...n.value, [E]: _ };
    }
    function V(E) {
      const _ = n.value[E], N = E === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : E === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [ne, W, T] of N) setTimeout(() => na(ne, T, _), W * 1e3);
    }
    return (E, _) => (b(), C("span", C2, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: _[0] || (_[0] = (N) => o.value ? k() : v())
      }, "♫ sounds", 8, M2),
      o.value ? (b(), C("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: ot(Ue(k, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: k
        }, "×"),
        _[6] || (_[6] = p("strong", null, "Preset", -1)),
        p("span", T2, [
          Oe(p("select", {
            "onUpdate:modelValue": _[1] || (_[1] = (N) => c.value = N),
            "aria-label": "Preset"
          }, [
            _[5] || (_[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", $2, [
              (b(!0), C(he, null, we(L($o), (N) => (b(), C("option", {
                key: N.name,
                value: N.name,
                title: N.note
              }, I(N.name), 9, D2))), 128))
            ]),
            l.value.length ? (b(), C("optgroup", L2, [
              (b(!0), C(he, null, we(l.value, (N) => (b(), C("option", {
                key: "own-" + N.name,
                value: N.name
              }, I(N.name), 9, B2))), 128))
            ])) : U("", !0)
          ], 512), [
            [ri, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: w
          }, "use", 8, O2),
          y.value ? (b(), C("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: P
          }, "delete")) : U("", !0)
        ]),
        c.value ? (b(), C("span", E2, I([...L($o), ...l.value].find((N) => N.name === c.value)?.note ?? "Your preset"), 1)) : U("", !0),
        p("span", I2, [
          d.value ? (b(), C(he, { key: 0 }, [
            Oe(p("input", {
              "onUpdate:modelValue": _[2] || (_[2] = (N) => h.value = N),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                ot(Ue($, ["prevent"]), ["enter"]),
                _[3] || (_[3] = ot(Ue((N) => d.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, R2), [
              [ft, h.value]
            ]),
            p("button", {
              disabled: !h.value.trim(),
              onClick: $
            }, "save", 8, P2)
          ], 64)) : (b(), C("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: _[4] || (_[4] = (N) => d.value = !0)
          }, " save current as preset… "))
        ]),
        f.value ? (b(), C("span", N2, I(f.value), 1)) : a.value === "browser" ? (b(), C("span", V2, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : U("", !0),
        _[7] || (_[7] = p("strong", null, "Sounds", -1)),
        (b(!0), C(he, null, we(m.value, ([N, ne]) => (b(), C("label", {
          key: N,
          class: "row"
        }, [
          p("span", H2, I(ne), 1),
          p("select", {
            value: n.value[N],
            "aria-label": `Sound of the ${ne} track`,
            onChange: (W) => R(N, W.target.value)
          }, [
            (b(!0), C(he, null, we(L(Zc), (W) => (b(), C("option", {
              key: W,
              value: W,
              title: L(Fo)[W].hint
            }, I(L(Fo)[W].label), 9, W2))), 128))
          ], 40, z2),
          p("button", {
            title: `Hear the ${ne} track’s sound`,
            "aria-label": `Hear the ${ne} sound`,
            onClick: Ue((W) => V(N), ["prevent"])
          }, "▶", 8, F2)
        ]))), 128)),
        _[8] || (_[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, A2)) : U("", !0)
    ]));
  }
});
function _2(i) {
  return i.length >= 3 && (i[0] & 240) === 176 && (i[1] === 120 || i[1] === 123);
}
function U2(i, e, t) {
  if (i.length < 3) return null;
  const n = i[0] & 240, s = i[0] & 15, o = i[1] & 127, r = i[2] & 127;
  return n === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : n === 128 || n === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function G2(i, e) {
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
class j2 {
  constructor(e = typeof navigator > "u" ? null : navigator) {
    this.navigatorLike = e;
  }
  navigatorLike;
  status = z("off");
  problem = z(null);
  devices = z([]);
  /** The last note's time (``performance.now()`` ms): the activity light. */
  activity = z(0);
  /** ``'all'`` or an input's id (kept while that keyboard is unplugged: then every one is listened to). */
  selected = z("all");
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
    if (_2(t.data)) {
      this.letGo(e, n);
      return;
    }
    const s = U2(t.data, n, e);
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
    this.status.value = e, this.problem.value = G2(e, t);
  }
}
let Yc = null;
function q2() {
  return Yc ??= new j2(), Yc;
}
const Y2 = 0.035;
class X2 {
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
function J2(i, e) {
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
      const k = Math.round((y.start - t) / l) * l + t;
      k > f && (m = Math.min(m, k));
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
function Z2(i, e, t, n, s) {
  return {
    op: "place_notes",
    track: i,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(n), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function al(i, e) {
  if (!e) return 1;
  const t = Number(i.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const Q2 = 40;
function eM(i) {
  const e = z(!1), t = z(!1), n = Gi(null), s = z(0), o = new ow();
  let r = !1, l = null, a = null;
  const u = z(0), c = O(() => {
    const N = n.value;
    return !N || !e.value ? [] : (u.value, N.played(s.value).filter((ne) => ne.end !== null && ne.end > ne.start).map((ne) => ({ onset: ne.start, duration: ne.end - ne.start, pitch: ne.pitch })));
  });
  function d() {
    l ??= i.hub.subscribe($);
  }
  async function h() {
    const N = await i.hub.enable();
    return i.problem(N ? null : i.hub.problem.value), N && d(), N;
  }
  function f(N) {
    const ne = i.view();
    return ne ? Ra(ne, Math.max(0, N)) : null;
  }
  async function m() {
    if (e.value) return;
    if (i.readonly()) {
      i.problem("This score belongs to the other sheet; record in that sheet.");
      return;
    }
    const N = i.view();
    if (!N?.model || !await h()) return;
    t.value = !1;
    const ne = i.settings(), W = i.track(), T = Math.min(i.locator.value, N.model.total - 1), H = i.transport();
    if (!H) return;
    if (n.value = new X2(T, W), r = !1, e.value = !0, s.value = T, !H.record(Ia(N, T), {
      countIn: ne.countIn,
      mute: ne.mute ? W === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, n.value = null, i.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    i.notify(`recording into ${W === "vocal" ? "Vocal" : "Ins"} from bar ${nM(N, T)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function y() {
    i.transport()?.stop();
  }
  function v() {
    e.value && (r = !0, i.transport()?.stop());
  }
  function k(N) {
    if (!e.value || N === null) return;
    const ne = f(N);
    ne !== null && (s.value = ne);
  }
  async function w() {
    if (!e.value) return;
    const N = n.value, ne = i.view();
    e.value = !1, n.value = null, o.allOff();
    const W = ne?.model;
    if (!N || !W) return;
    if (r) {
      i.notify("recording thrown away");
      return;
    }
    const T = Math.max(s.value, N.start), H = W.measures.find((Ee) => Ee.onset <= N.start && N.start < Ee.onset + Ee.length) ?? W.measures[0], me = ne.bars[(H?.n ?? 1) - 1], ve = H && me?.duration_s ? H.length / me.duration_s : 8, ie = Number(H?.meter.split("/")[0]) || 4, le = J2(N.finish(T), {
      start: N.start,
      stop: T,
      total: W.total,
      grid: al(W.unit, i.settings().quantize),
      chordUnits: Y2 * ve,
      pickup: (H?.length ?? 16) / ie / 2
    });
    if (!le.length) {
      i.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await i.operate(Z2(N.track, le, N.start, T, i.settings().mode));
  }
  function $(N) {
    if (i.settings().thru && (i.sound && (o.sound = i.sound()), N.kind === "on" ? o.on(N.note, N.velocity) : o.off(N.note)), e.value && n.value) {
      const W = i.transport()?.scoreSecondAt(N.time) ?? null, T = i.view();
      if (W === null || !T) return;
      const H = tM(T, n.value.start, W);
      if (H === null) return;
      N.kind === "on" ? n.value.noteOn(N.note, H) : n.value.noteOff(N.note, H), u.value++;
      return;
    }
    t.value && N.kind === "on" && P(N.note);
  }
  function P(N) {
    if (a) {
      a.pitches.push(N);
      return;
    }
    a = { pitches: [N], timer: setTimeout(() => {
      R();
    }, Q2) };
  }
  async function R() {
    const N = a?.pitches ?? [];
    a = null;
    const W = i.view()?.model;
    if (!W || !N.length || i.readonly()) return;
    const T = al(W.unit, i.settings().stepLength), H = i.locator.value;
    if (H >= W.total) {
      i.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await i.operate({
      op: "place_notes",
      track: i.track(),
      notes: [{ onset: H, duration: Math.min(T, W.total - H), pitch: Math.max(...N) }],
      label: "step"
    }) && (i.locator.value = Math.min(W.total, H + T));
  }
  function V() {
    const N = i.view()?.model;
    N && (i.locator.value = Math.min(N.total, i.locator.value + al(N.unit, i.settings().stepLength)));
  }
  async function E() {
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
  function _() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: m, stop: y, cancel: v, onTime: k, onStopped: w, toggleStep: E, rest: V, ready: h, dispose: _ };
}
function tM(i, e, t) {
  const n = i.model;
  if (!n) return null;
  const s = Ia(i, e);
  if (t >= s) return Ra(i, t);
  const o = n.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? n.measures[0], r = i.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function nM(i, e) {
  let t = 1;
  for (const n of i.model?.measures ?? []) n.onset <= e && (t = n.n);
  return t;
}
const iM = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, sM = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, oM = ["aria-checked"], rM = ["aria-checked"], lM = ["aria-checked"], aM = { title: "The piano roll and chord lane above the notation" }, uM = { title: "Show the ABC text under the notation" }, cM = { title: "Zoom of the notation" }, hM = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, dM = ["disabled", "title"], fM = ["disabled", "title"], pM = ["disabled"], mM = ["disabled", "title"], gM = ["disabled", "title"], vM = ["disabled", "title"], yM = ["accept"], bM = {
  key: 1,
  class: "facts"
}, kM = {
  key: 2,
  class: "facts ok"
}, wM = {
  key: 3,
  class: "facts bad"
}, xM = {
  key: 4,
  class: "badge"
}, SM = {
  key: 1,
  class: "gate",
  role: "status"
}, CM = {
  key: 2,
  class: "gate",
  role: "status"
}, MM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], AM = ["data-layout", "data-text"], TM = { class: "side" }, $M = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, DM = {
  key: 0,
  class: "hint"
}, LM = {
  key: 0,
  class: "hint changed"
}, BM = {
  key: 1,
  class: "hint"
}, OM = {
  key: 2,
  class: "fit-panel"
}, EM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], IM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], RM = {
  class: "status",
  "aria-live": "polite"
}, PM = {
  key: 5,
  class: "error",
  role: "alert"
}, NM = {
  key: 6,
  class: "error",
  role: "alert"
}, VM = {
  key: 7,
  class: "error",
  role: "alert"
}, HM = {
  key: 9,
  class: "diagnostics"
}, zM = ["data-severity"], WM = ["title", "onClick"], FM = {
  key: 1,
  class: "where"
}, Xc = /* @__PURE__ */ Dt({
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
    const o = Gi(null), r = z(null), l = z(null);
    function a(g) {
      const S = g.op === "paste" && g.mode === "insert" && Array.isArray(g.sections) ? g.sections : [], D = typeof g.at == "number" ? g.at : 0, X = ei.value;
      return (ue) => {
        let pe = -1;
        S.forEach((De, Te) => {
          De.onset <= ue - D && (pe = Te);
        });
        const Ie = pe >= 0 ? X?.sections[pe]?.lyrics : null;
        return Ie ? { tag: Ie.tag, lines: [...Ie.lines] } : null;
      };
    }
    const u = Ek(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => n("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => St(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (g) => {
        s(g) && (Array.isArray(g.guide) && t.guide !== void 0 && !Ss(g.guide, t.guide) && n("guideChange", [...g.guide]), "lyrics" in g && (o.value = g.lyrics ?? null), "looseLyrics" in g && (r.value = g.looseLyrics ?? null), Array.isArray(g.spans) && Kn(g.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (g, S) => {
        const D = {}, X = {}, ue = t.guide;
        if (ue?.length && g.time_map?.length) {
          const et = om(ue, g.time_map);
          Ss(et, ue) || (n("guideChange", et), D.guide = [...ue], X.guide = et);
        }
        const pe = St(), Ie = o.value, De = ie.value?.model, Te = g.analysis.model;
        let ut = pe.length && g.time_map?.length ? Qp(pe, g.time_map) : pe;
        if (ut.length && Ie && De && Te) {
          const et = (Vi) => Vi.sections.flatMap((ps, Ir) => ps.implicit ? [] : [Ir]), vi = Te.sections.map((Vi) => Te.measures[Vi.first_bar - 1]?.onset ?? 0);
          ut = em(ut, Lf(De, Te, g.time_map), et(De), et(Te), vi);
        }
        if (Bo(ut, pe) || (Kn(ut), D.spans = [...pe], X.spans = ut), Ie && De && Te) {
          const et = wC(Ie, De, Te, g.time_map, a(S));
          o.value = et, D.lyrics = Ie, X.lyrics = et;
        }
        return Object.keys(X).length ? { before: D, after: X } : void 0;
      }
    });
    Re(
      () => [t.doc.text, u.commitBlock],
      ([g, S]) => {
        t.readonly || n("gate", g, S);
      },
      { immediate: !0 }
    );
    const c = z(wp()), d = z(l1(t.layoutDefault, c.value.layout));
    function h(g) {
      d.value = g, c.value = { ...c.value, layout: g };
    }
    const f = z([]), m = z(0), y = z(null), v = z(null), k = z(null), w = z(null), $ = z(null), P = z("vocal"), R = O({
      get: () => c.value.sounds,
      set: (g) => c.value = { ...c.value, sounds: g }
    }), V = O(() => IC(c.value));
    function E(g, S) {
      c.value = Gc(c.value, g), u.notes = [`${S}: ${_(g)}`];
    }
    function _(g) {
      const S = [];
      return g.sounds && S.push("sounds"), g.metronome !== void 0 && S.push(`metronome ${g.metronome ? "on" : "off"}`), g.hear && S.push(`hear ${g.hear}`), (g.wave !== void 0 || g.sung !== void 0) && S.push("the source view"), g.record && S.push("recording"), g.paper && S.push(`paper ${g.paper === "a4" ? "A4" : "Letter"}`), g.notationSize && S.push(`notation ${g.notationSize}`), S.length ? `${S.join(", ")} set` : "nothing to set";
    }
    const N = O(() => c.value.sounds[P.value === "vocal" ? "Vocal" : "Ins"]);
    Re(c, (g) => Ep(g), { deep: !0 });
    const ne = q2();
    ne.selected.value = c.value.midiInput, Re(ne.selected, (g) => c.value = { ...c.value, midiInput: g });
    const W = O({
      get: () => c.value.record,
      set: (g) => c.value = { ...c.value, record: g }
    }), T = eM({
      hub: ne,
      transport: () => k.value,
      view: () => ie.value,
      locator: m,
      track: () => P.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: Z,
      notify: (g) => u.notes = [g],
      problem: (g) => H.value = g,
      sound: () => N.value
    }), H = z(null), me = O(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : Q.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function ve(g) {
      const S = g.target;
      $.value?.contains(S) || Er(S) || g.ctrlKey || g.metaKey || g.altKey || g.key !== " " && g.key !== "Escape" || (g.preventDefault(), g.stopPropagation(), g.key === " " ? T.stop() : T.cancel());
    }
    Re(T.recording, (g) => {
      g ? window.addEventListener("keydown", ve, !0) : window.removeEventListener("keydown", ve, !0);
    }), zn(() => {
      window.removeEventListener("keydown", ve, !0), T.cancel(), T.dispose();
    }), zn(() => u.dispose());
    const ie = O(() => u.lastValid), le = O(() => !!u.view && !u.view.ok), Ee = O(() => u.view?.diagnostics ?? []), Se = O(
      () => Ee.value.filter((g) => g.severity === "error" && g.bar).map((g) => g.bar)
    ), Be = O(
      () => Af(ie.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Ae = O(() => d.value !== "text"), j = O(() => d.value === "daw"), Qe = O(() => t.guide ?? []), ce = O(() => sm(t.guide, ie.value?.model)), Ce = O(() => j.value ? c.value.voices.guide ?? !0 : !1), te = O(() => Ce.value ? ce.value : []), K = O(() => Ae.value && c.value.roll && !!(ie.value?.model || ie.value?.model_error)), Q = O(() => ie.value?.model ?? null), Fe = O(() => Q.value ? Ps(Q.value, m.value) : Be.value), nt = O(() => ie.value && Q.value ? Ia(ie.value, m.value) : null), Ge = O(() => Q.value ? $f(Q.value, m.value) : "");
    Re(
      () => Q.value?.total,
      (g) => {
        g !== void 0 && m.value > g && (m.value = g);
      }
    );
    let xt = null, ee = null, G = !1;
    Re(
      () => [t.lyricsTarget, t.lyrics, Q.value],
      ([g, S, D]) => {
        if (!g || !S?.trim()) {
          o.value = null, r.value = null, xt = null, G = !1;
          return;
        }
        const X = S === xt || S === ee;
        if (xt = S, X && (G || !D)) {
          if (o.value && D && o.value.blocks.length !== D.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && D) {
            const pe = To(r.value, D);
            pe && (o.value = pe, r.value = null);
          }
          return;
        }
        const ue = !G && t.lyricsPending || S;
        o.value = D ? To(ue, D) : null, r.value = o.value ? null : ue, G = !!D;
      },
      { immediate: !0 }
    ), Re(
      [o, r, Q],
      () => {
        const g = o.value, S = Q.value;
        g ? S && g.blocks.length === S.sections.length && (l.value = kC(g, S)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Re(
      l,
      (g, S) => {
        ee = g, n("lyricsChange", g), S !== void 0 && g !== S && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const de = O(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), xe = O(
      () => !!l.value && !t.lyricsTarget?.own && jt(l.value) !== jt(t.lyrics ?? "")
    ), Me = O(() => l.value ? Ys(l.value).blocks.map((g) => g.tag).join(" · ") : ""), Fn = O(() => l.value ?? t.lyrics ?? null);
    function pt() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...St()] };
    }
    const It = Gi(null);
    function St() {
      return It.value ?? t.lyricSpans ?? [];
    }
    function Kn(g) {
      Bo(g, St()) || (It.value = g, n("lyricSpansChange", g), u.refreshLyrics());
    }
    Re(
      () => t.lyricSpans,
      (g) => {
        g && It.value && Bo(g, It.value) || (It.value = null, u.refreshLyrics());
      }
    );
    const ht = z([]);
    Re(
      () => u.selection,
      (g) => {
        g.length && (ht.value = []);
      }
    );
    function Ii(g) {
      const S = ie.value?.lyrics;
      return !!S && !!qp(S, g)?.lines.some((D) => D.pinned);
    }
    function Wt(g) {
      const S = Q.value;
      if (!S) return -1;
      let D = -1;
      return S.sections.findIndex((X) => !X.implicit && ++D === g);
    }
    function _n(g) {
      if (o.value) {
        const D = Wt(g);
        return D < 0 ? null : [...o.value.blocks[D]?.lines ?? []];
      }
      if (r.value === null) return null;
      const S = Ys(r.value).blocks[g];
      return S ? [...S.lines] : null;
    }
    function Ln() {
      return Math.max(1, Math.round(Q.value?.grid.units_per_quarter ?? 1));
    }
    function Ut(g, S, D) {
      const X = Q.value, ue = ie.value?.lyrics;
      if (!X || !ue || !de.value) return [];
      const pe = pt(), Ie = [], De = /* @__PURE__ */ new Map();
      for (const Te of [...new Set(g)].sort((ut, et) => ut - et)) {
        const ut = _n(Te);
        if (ut === null) continue;
        const et = io(ue, Te, X.total), vi = Yp(S(Te, tu(ue, Te, ut, et, Ln())), et), Vi = vi.map((ps) => ps.text);
        if (o.value) o.value = MC(o.value, X, Wt(Te), Vi);
        else if (r.value !== null) r.value = CC(r.value, Te, Vi);
        else continue;
        vi.forEach((ps, Ir) => {
          ps.id.startsWith("*") && Ie.push(Ko(Te, Ir));
        }), De.set(Te, vi);
      }
      return De.size ? (Kn(Xp(St(), ue, De)), u.recordSide(D, pe, pt()), Ie) : [];
    }
    function Ct(g) {
      const S = /* @__PURE__ */ new Map();
      for (const D of g) {
        const X = Jp(D);
        X && (S.has(X.block) || S.set(X.block, /* @__PURE__ */ new Set()), S.get(X.block)?.add(X.line));
      }
      return S;
    }
    function fi(g) {
      const S = new Map(g.map((X) => [X.key, X])), D = g.length;
      ht.value = Ut(
        [...Ct(g.map((X) => X.key)).keys()],
        (X, ue) => ue.map((pe, Ie) => {
          const De = S.get(Ko(X, Ie));
          return De ? { ...pe, id: `*${pe.id}`, start: De.start, end: De.end } : pe;
        }),
        `lyrics: ${D === 1 ? "line" : `${D} lines`} placed`
      );
    }
    function fn(g) {
      const S = Ct(g);
      S.size && (Ut(
        [...S.keys()],
        (D, X) => X.filter((ue, pe) => !S.get(D)?.has(pe)),
        `lyrics: ${g.length === 1 ? "line" : `${g.length} lines`} deleted`
      ), ht.value = []);
    }
    function en() {
      const g = Q.value, S = ie.value?.lyrics;
      if (!g || !S) return [];
      const D = [];
      for (const [X, ue] of Ct(ht.value)) {
        const pe = _n(X);
        pe && tu(S, X, pe, io(S, X, g.total), Ln()).forEach((Ie, De) => {
          ue.has(De) && D.push(Ie);
        });
      }
      return D;
    }
    function Un() {
      const g = Q.value ? Bx(Q.value.unit, nu(en())) : null;
      return g ? (ei.value = g, u.error = null, u.notes = [`copied ${g.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function pi(g, S, D) {
      const X = Q.value, ue = ie.value?.lyrics;
      if (!X || !ue) return;
      const pe = Zp(ue, S);
      if (!pe || _n(pe.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, Ie] = io(ue, pe.block, X.total), De = g.filter((Te) => S + Te.offset < Ie);
      De.length && (ht.value = Ut(
        [pe.block],
        (Te, ut) => [
          ...ut,
          ...De.map((et, vi) => ({
            id: `*new${vi}`,
            text: et.text,
            start: S + et.offset,
            end: Math.min(S + et.offset + et.length, Ie)
          }))
        ],
        D
      ), u.error = null, De.length < g.length && (u.notes = [`${g.length - De.length} line(s) did not fit before the next block's first line`]));
    }
    function Bn(g) {
      const S = ei.value;
      if ((g === "paste" || g === "insert") && S?.lyricLines?.length)
        return de.value ? Q.value && S.unit !== Q.value.unit ? (u.error = `The lines were copied with L:${S.unit} and do not fit this score's L:${Q.value.unit}.`, !0) : (pi(S.lyricLines, m.value, `lyrics: ${S.label} pasted`), !0) : !0;
      if (!ht.value.length) return !1;
      if (g === "copy") Un();
      else if (g === "cut")
        Un() && fn(ht.value);
      else if (g === "duplicate") {
        const D = en();
        if (D.length) {
          const X = Math.max(...D.map((ue) => ue.end));
          pi(nu(D), X, `lyrics: ${D.length === 1 ? "line" : `${D.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function vt(g) {
      const S = Q.value, D = ie.value?.lyrics;
      if (S && D && Ii(g.block)) {
        const ue = Ln();
        Ut(
          [g.block],
          (pe, Ie) => {
            if (g.line < Ie.length)
              return g.text ? Ie.map((Te, ut) => ut === g.line ? { ...Te, text: g.text } : Te) : Ie.filter((Te, ut) => ut !== g.line);
            const De = g.at ?? Ie[Ie.length - 1]?.end ?? io(D, g.block, S.total)[0];
            return g.text ? [...Ie, { id: "*typed", text: g.text, start: De, end: De + ue }] : Ie;
          },
          `lyrics: ${g.text || "line removed"}`
        );
        return;
      }
      const X = pt();
      if (o.value && S) o.value = SC(o.value, S, Wt(g.block), g.line, g.text);
      else if (r.value !== null) r.value = xC(r.value, g.block, g.line, g.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${g.text || "line removed"}`, X, pt());
    }
    function ds() {
      const g = t.lyrics, S = Q.value;
      if (!g) return;
      const D = pt();
      o.value = S ? To(g, S) : null, r.value = o.value ? null : g, t.readonly || u.recordSide("lyrics reverted", D, pt());
    }
    Re(Q, (g) => {
      if (!Br || !g || r.value === null) return;
      Br = !1;
      const S = To(r.value, g);
      S && (o.value = S, r.value = null);
    }), Re(Be, (g) => {
      !K.value && g && Q.value && (m.value = Ec(Q.value, g));
    });
    const Mt = O({
      get: () => c.value.metronome,
      set: (g) => c.value = { ...c.value, metronome: g }
    }), Gn = O(() => t.payload?.reference_audio ? $p(t.fetcher, t.payload.reference_audio) : null), Rt = Gi(null), jn = z(null);
    Re(
      Gn,
      (g) => {
        Rt.value = null, jn.value = null, g && cw(g).then(
          (S) => {
            Gn.value === g && (Rt.value = S);
          },
          (S) => {
            Gn.value === g && (jn.value = `the source recording could not be read: ${S instanceof Error ? S.message : String(S)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const pn = O({
      get: () => c.value.hear,
      set: (g) => c.value = { ...c.value, hear: g }
    }), Gt = O({
      get: () => c.value.sourceLevel,
      set: (g) => c.value = { ...c.value, sourceLevel: g }
    }), mi = O(() => {
      const g = ie.value, S = g?.model;
      if (!g || !S) return null;
      const D = gi(), X = [...D.notes.map((Te) => [Te.onset, Te.onset + Te.duration]), ...D.chords.map((Te) => [Te.onset, Te.onset + 1])];
      if (!X.length) return null;
      const ue = Ps(S, Math.min(...X.map(([Te]) => Te))), pe = Ps(S, Math.max(...X.map(([, Te]) => Te)) - 1), Ie = g.bars[ue - 1], De = g.bars[pe - 1];
      return !Ie || !De ? null : { from: Ie.start_s, to: De.start_s + De.duration_s, label: ue === pe ? `bar ${ue}` : `bars ${ue}-${pe}` };
    }), Ft = O(() => {
      const g = OC(ie.value?.model, t.payload?.timeline), S = t.sourceShift ?? 0;
      return !g || !S ? g : g.map((D) => D ? [D[0] - S, D[1] - S, D[2]] : null);
    }), Ri = O(() => {
      const g = Ft.value?.[(Fe.value ?? 1) - 1] ?? Ft.value?.find((D) => D);
      if (!g) return 0.5;
      const S = Number(g[2].split("/")[0]) || 4;
      return (g[1] - g[0]) / S;
    }), fs = O(() => {
      const g = t.payload?.sung_pitch;
      if (!g) return null;
      const S = fw(g), D = Q.value;
      return !S || !D ? { problem: "problem" in g ? g.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: S, offset: gw(D, Ft.value, S), bars: Ft.value };
    }), mn = O({
      get: () => t.sourceShift ?? 0,
      set: (g) => n("sourceShiftChange", Math.round(g * 1e3) / 1e3)
    }), He = O(() => Ft.value?.map((g) => g?.[0] ?? null) ?? null), mt = O(() => ie.value?.header?.unit ?? "1/16"), gn = O({
      get: () => c.value.voices,
      set: (g) => c.value = { ...c.value, voices: g }
    }), qn = O({
      get: () => c.value.speed,
      set: (g) => c.value = { ...c.value, speed: g }
    });
    function Pt(g, S = !1, D = "notation") {
      const X = S ? u.selection.includes(g) ? u.selection.filter((pe) => pe !== g) : [...u.selection, g] : [g];
      u.select(X);
      const ue = Mi(ie.value, X[0]);
      v.value = D !== "text" && ue ? [ue.source[0], ue.source[1]] : v.value;
    }
    function Pi(g) {
      if (!ie.value || le.value) return;
      const S = vm(ie.value, g);
      S && Pt(S.id, !1, "text");
    }
    function tn(g) {
      if (!ie.value) return;
      ie.value.model && (m.value = Ec(ie.value.model, g));
      const S = km(ie.value, g);
      S && Pt(S.id, !1, "keys");
    }
    function B() {
      return T.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function Y(g) {
      t.readonly || B() || await u.operate(g);
    }
    function Z(g) {
      return t.readonly || B() ? Promise.resolve(!1) : u.operate(g);
    }
    function ge() {
      B() || u.undo();
    }
    function at() {
      B() || u.redo();
    }
    function Dr(g) {
      u.select(g);
      const S = Mi(ie.value, g[0]);
      S && (v.value = [S.source[0], S.source[1]]);
    }
    function gi() {
      const g = Q.value;
      if (!g) return { notes: [], chords: [] };
      const S = us(ie.value, u.selection), D = qs(u.selection);
      return {
        notes: [...g.tracks.vocal, ...g.tracks.ins].filter((X) => S.has(X.id)),
        chords: g.tracks.chords.filter((X) => D.has(X.id))
      };
    }
    function x() {
      const g = Q.value, S = gi(), D = g ? Fc(g, S.notes, S.chords) : null;
      return D ? (ei.value = D, u.error = null, u.notes = [`copied ${D.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function A(g) {
      if (Bn(g)) return;
      const S = Q.value;
      if (g === "copy") {
        x();
        return;
      }
      if (t.readonly || !S) return;
      if (g === "cut") {
        const ue = gi();
        if (!x()) return;
        await Y({ op: "delete", ids: [...ue.notes.map((pe) => pe.id), ...ue.chords.map((pe) => pe.id)] });
        return;
      }
      if (g === "duplicate") {
        const ue = gi(), pe = Fc(S, ue.notes, ue.chords);
        if (!pe) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Ie = Math.min(...ue.notes.map((Te) => Te.onset), ...ue.chords.map((Te) => Te.onset)), De = _c(pe, S, Ie + pe.span, "overwrite");
        typeof De == "string" ? u.error = "There is no room after the selection to duplicate it." : await Y(De);
        return;
      }
      const D = ei.value;
      if (!D) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const X = _c(D, S, m.value, g === "insert" ? "insert" : "overwrite");
      typeof X == "string" ? u.error = X : await Y(X);
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
    function q(g) {
      y.value = g === null || !ie.value ? null : Ra(ie.value, g), T.onTime(g);
    }
    function F() {
      t.readonly || !t.guide?.length || n("guideChange", []);
    }
    const re = O({
      get: () => c.value.rollZoom,
      set: (g) => c.value = { ...c.value, rollZoom: g }
    }), ke = O(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function Ne(g) {
      g.preventDefault();
      const S = c.value.rollHeight;
      Lo(g, ({ dy: D }) => c.value = { ...c.value, rollHeight: Ga(S, D) });
    }
    function be(g) {
      const S = g.key === "ArrowUp" ? -16 : g.key === "ArrowDown" ? 16 : 0;
      S && (g.preventDefault(), c.value = { ...c.value, rollHeight: Ga(c.value.rollHeight, S) });
    }
    function Le(g) {
      g.preventDefault();
      const S = c.value.notationShare, X = g.currentTarget.parentElement?.clientHeight ?? 0;
      Lo(g, ({ dy: ue }) => c.value = { ...c.value, notationShare: Ip(S, ue, X) });
    }
    function je(g) {
      const S = g.key === "ArrowDown" ? 0.03 : g.key === "ArrowUp" ? -0.03 : 0;
      S && (g.preventDefault(), c.value = { ...c.value, notationShare: Dp(c.value.notationShare + S) });
    }
    function dt(g) {
      g.preventDefault();
      const S = c.value.sideWidth;
      Lo(g, ({ dx: D }) => c.value = { ...c.value, sideWidth: ja(S, D) });
    }
    function yt(g) {
      const S = g.key === "ArrowLeft" ? -16 : g.key === "ArrowRight" ? 16 : 0;
      S && (g.preventDefault(), c.value = { ...c.value, sideWidth: ja(c.value.sideWidth, S) });
    }
    const Yn = z(null), On = z(null), it = z(null), nn = z(!1), Lr = O(() => t.guide !== void 0), Va = O(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && ie.value?.display_abc ? null : "There is no score to export yet."), Ha = O({
      get: () => c.value.paper,
      set: (g) => c.value = { ...c.value, paper: g }
    }), za = O({
      get: () => c.value.notationSize,
      set: (g) => c.value = { ...c.value, notationSize: g }
    });
    function Nf(g) {
      it.value = null, u.notes = [g];
    }
    const Ni = O(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Vf() {
      const g = Ni.value;
      if (g) {
        it.value = g;
        return;
      }
      nn.value = !0, it.value = null;
      try {
        const S = await Lp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        Zi(S.filename, $k(S.data));
      } catch (S) {
        it.value = Ci(S);
      } finally {
        nn.value = !1;
      }
    }
    async function Hf() {
      const g = Ni.value;
      if (g) {
        it.value = g;
        return;
      }
      nn.value = !0, it.value = null;
      try {
        const S = await Bp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: St()
        });
        Zi(S.filename, new TextEncoder().encode(S.data), S.type);
      } catch (S) {
        it.value = Ci(S);
      } finally {
        nn.value = !1;
      }
    }
    const Wa = z(null);
    function zf() {
      const g = qc({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: St(),
        settings: V.value
      });
      Zi(WC(t.title), new TextEncoder().encode(`${JSON.stringify(g, null, 1)}
`), "application/json"), it.value = null, u.notes = [`saved the project: score${g.guide.length ? `, ${Fa(g.guide.length)}` : ""}${g.lyrics ? ", lyrics" : ""}, settings`];
    }
    function Wf() {
      it.value = null, Wa.value?.click();
    }
    async function Ff(g) {
      const S = g.target, D = S.files?.[0];
      if (S.value = "", !D) return;
      const X = FC(await D.text());
      typeof X == "string" ? it.value = X : Ka(X, D.name);
    }
    const Fa = (g) => g === 1 ? "1 Guide note" : `${g} Guide notes`;
    let Br = !1;
    function Ka(g, S) {
      if (B()) return;
      if (t.readonly) {
        it.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const D = ["score"], X = [], ue = pt(), pe = {}, Ie = t.guide;
      Ie !== void 0 ? (ue.guide = [...Ie], pe.guide = [...g.guide], g.guide.length && D.push(Fa(g.guide.length))) : g.guide.length && X.push("the Guide notes (only the DAW sheet keeps a Guide track)"), g.lyrics && de.value ? (o.value = null, r.value = g.lyrics, Br = !0, D.push("lyrics"), Kn(g.lyric_spans)) : g.lyrics && X.push("the lyrics (this sheet cannot change them here)"), Object.assign(pe, pt()), Object.keys(g.settings).length && (c.value = Gc(c.value, g.settings), D.push("settings"));
      const De = `open project (${S})`;
      u.replaceText(g.score, De, null, { before: ue, after: pe }) || u.recordSide(De, ue, pe), pe.guide && Ie !== void 0 && !Ss(pe.guide, Ie) && n("guideChange", pe.guide), it.value = null, u.notes = [
        `opened ${S}: ${D.join(", ")}${g.title ? ` ("${g.title}")` : ""}`,
        ...X.map((Te) => `not opened: ${Te}`)
      ];
    }
    const _a = z(null);
    function Kf() {
      it.value = null, _a.value?.click();
    }
    async function _f(g) {
      const S = g.target, D = S.files?.[0];
      if (S.value = "", !(!D || t.readonly || B())) {
        nn.value = !0, it.value = null;
        try {
          const X = await Op(t.fetcher, {
            text: await D.text(),
            abc: t.doc.text,
            lyrics: l.value ?? t.lyrics ?? null
          }), ue = X.lyrics ?? l.value ?? t.lyrics ?? null, pe = qc({
            title: t.title,
            score: X.abc,
            guide: t.guide ?? [],
            lyrics: ue,
            lyricSpans: ia(X.lyric_spans)
          });
          X.lyrics === null && (pe.lyric_spans = []), Ka(pe, D.name), u.notes = [`imported ${D.name}`, ...X.report];
        } catch (X) {
          it.value = Ci(X);
        } finally {
          nn.value = !1;
        }
      }
    }
    function Uf() {
      it.value = null, Yn.value?.click();
    }
    async function Gf(g) {
      const S = g.target, D = S.files?.[0];
      if (S.value = "", !!D)
        try {
          On.value = { data: Tk(new Uint8Array(await D.arrayBuffer())), filename: D.name };
        } catch (X) {
          it.value = Ci(X);
        }
    }
    function jf(g, S) {
      if (t.readonly || B()) return;
      const D = On.value?.filename ?? "file", X = t.guide, ue = X === void 0 ? void 0 : S ? [...g.guide] : [], pe = X === void 0 || ue === void 0 ? void 0 : { before: { guide: [...X] }, after: { guide: ue } };
      u.replaceText(g.abc, `import MIDI (${D})`, g.analysis, pe), ue !== void 0 && X !== void 0 && !Ss(ue, X) && n("guideChange", ue), On.value = null, it.value = null;
    }
    function Or(g) {
      const S = g;
      return S ? !!S.closest("input, textarea, select, .cm-editor") : !1;
    }
    const qf = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Er(g) {
      const S = g;
      if (!S) return !1;
      if (S.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const D = S.closest("input");
      return !!D && !qf.has(D.type);
    }
    function Yf(g) {
      g.key === " " && !Er(g.target) && g.preventDefault();
    }
    function Xf(g) {
      const S = g.ctrlKey || g.metaKey;
      if (S && !t.readonly && (g.key === "z" || g.key === "Z" || g.key === "y")) {
        if (Or(g.target) && !g.target.closest(".cm-editor")) return;
        g.preventDefault(), g.key === "y" || g.key.toLowerCase() === "z" && g.shiftKey ? at() : ge();
        return;
      }
      const D = S && !Or(g.target) ? M(g) : null;
      if (D) {
        g.preventDefault(), g.stopPropagation(), A(D);
        return;
      }
      if (g.key === " " && !S && !Er(g.target)) {
        g.preventDefault(), k.value?.toggle();
        return;
      }
      if (Or(g.target) || S) return;
      if (g.key === "Escape" && T.recording.value) {
        g.preventDefault(), T.cancel();
        return;
      }
      if (g.key === "R" && g.shiftKey && !g.altKey) {
        g.preventDefault(), T.recording.value ? T.stop() : T.start();
        return;
      }
      if (g.key === "Escape") {
        g.preventDefault(), u.selection.length && u.select([]), ht.value = [];
        return;
      }
      const X = ie.value, ue = u.primary, pe = g.key.toLowerCase();
      if ((pe === "g" || pe === "h") && !g.altKey && w.value) {
        g.preventDefault(), g.shiftKey ? w.value.zoomRows(pe === "h" ? 2 : -2) : w.value.zoomBy(pe === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((g.key === "Home" || g.key === "End") && Q.value) {
        g.preventDefault(), m.value = g.key === "Home" ? 0 : Q.value.total;
        return;
      }
      if (!X || !ue) return;
      (() => {
        switch (g.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const De = ym(X, ue.id, g.key === "ArrowRight" ? 1 : -1);
            return De && Pt(De.id, g.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (g.altKey) {
              const et = bm(X, ue.id);
              return et && Pt(et.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const De = u.selection.filter((et) => Mi(X, et)?.kind === "note"), Te = [...qs(u.selection)], ut = (g.shiftKey ? 12 : 1) * (g.key === "ArrowUp" ? 1 : -1);
            return Te.length ? Y({ op: "set_note_pitch", ids: [...us(X, u.selection), ...Te], semitones: ut }) : De.length && Y({ op: "shift_pitch", ids: De, semitones: ut }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || ue.kind !== "note") return !1;
            const De = ul(ue.units, g.key === "]" ? 1 : -1);
            return De && Y({ op: "set_duration", id: ue.id, units: De }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (ue.kind === "note" && Y({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (ue.kind !== "note" && Y({ op: "rest_to_note", id: ue.id }), !0);
          default:
            return !1;
        }
      })() && (g.preventDefault(), g.stopPropagation());
    }
    return (g, S) => (b(), C("div", {
      ref_key: "tabRoot",
      ref: $,
      class: "score-tab",
      onKeydown: Xf,
      onKeyup: Yf
    }, [
      i.readonly ? U("", !0) : (b(), In(PS, {
        key: 0,
        view: ie.value,
        selection: L(u).selection,
        primary: L(u).primary,
        busy: L(u).busy,
        "can-undo": L(u).canUndo,
        "can-redo": L(u).canRedo,
        "undo-label": L(u).undoLabel,
        "redo-label": L(u).redoLabel,
        onOperate: Y,
        onUndo: ge,
        onRedo: at
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", iM, [
        p("span", sM, [
          p("button", {
            role: "radio",
            "aria-checked": d.value === "review",
            class: ze({ active: d.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: S[0] || (S[0] = (D) => h("review"))
          }, " Review ", 10, oM),
          p("button", {
            role: "radio",
            "aria-checked": j.value,
            class: ze({ active: j.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: S[1] || (S[1] = (D) => h("daw"))
          }, " DAW ", 10, rM),
          p("button", {
            role: "radio",
            "aria-checked": d.value === "text",
            class: ze({ active: d.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: S[2] || (S[2] = (D) => h("text"))
          }, " Text ", 10, lM)
        ]),
        Ae.value ? (b(), C(he, { key: 0 }, [
          p("label", aM, [
            Oe(p("input", {
              "onUpdate:modelValue": S[3] || (S[3] = (D) => c.value.roll = D),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [Nt, c.value.roll]
            ]),
            S[35] || (S[35] = ae(" piano roll ", -1))
          ]),
          p("label", uM, [
            Oe(p("input", {
              "onUpdate:modelValue": S[4] || (S[4] = (D) => c.value.advanced = D),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [Nt, c.value.advanced]
            ]),
            S[36] || (S[36] = ae(" ABC text (advanced) ", -1))
          ])
        ], 64)) : U("", !0),
        p("label", cM, [
          S[37] || (S[37] = ae(" zoom ", -1)),
          Oe(p("input", {
            "onUpdate:modelValue": S[5] || (S[5] = (D) => c.value.zoom = D),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              ft,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        En(xk),
        p("span", hM, [
          p("button", {
            disabled: nn.value || !!Ni.value,
            title: Ni.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Vf
          }, " Export MIDI ", 8, dM),
          p("button", {
            disabled: nn.value || !!Ni.value,
            title: Ni.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: Hf
          }, " Export MusicXML ", 8, fM),
          En(S2, {
            paper: Ha.value,
            "onUpdate:paper": S[6] || (S[6] = (D) => Ha.value = D),
            size: za.value,
            "onUpdate:size": S[7] || (S[7] = (D) => za.value = D),
            abc: Va.value ? null : ie.value?.display_abc ?? null,
            title: i.title ?? "",
            blocked: Va.value,
            onDone: Nf,
            onFailed: S[8] || (S[8] = (D) => it.value = D)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !i.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: zf
          }, " Save project ", 8, pM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: Uf
          }, " Import MIDI… ", 8, mM),
          p("button", {
            disabled: i.readonly || nn.value,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MusicXML file that Export MusicXML wrote - also after a script changed it: its score, lyrics and where they are sung replace these (one undo step). Other MusicXML is refused; use Import MIDI for it.",
            onClick: Kf
          }, " Import MusicXML… ", 8, gM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: Wf
          }, " Open project… ", 8, vM),
          p("input", {
            ref_key: "musicXmlFile",
            ref: _a,
            class: "hidden-file",
            type: "file",
            accept: ".musicxml,.xml,application/vnd.recordare.musicxml+xml,application/xml,text/xml",
            "aria-label": "MusicXML file",
            onChange: _f
          }, null, 544),
          p("input", {
            ref_key: "midiFile",
            ref: Yn,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Gf
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: Wa,
            class: "hidden-file",
            type: "file",
            accept: `${L(Pf)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Ff
          }, null, 40, yM)
        ]),
        L(u).pending ? (b(), C("span", bM, "checking…")) : L(u).view?.ok ? (b(), C("span", kM, "✓ valid")) : le.value ? (b(), C("span", wM, "✖ " + I(Ee.value.length) + " error(s)", 1)) : U("", !0),
        i.readonly ? (b(), C("span", xM, "read-only: owned by the other sheet")) : U("", !0)
      ]),
      le.value && !i.readonly ? (b(), C("p", SM, [
        S[38] || (S[38] = ae(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        L(u).canRevert ? (b(), C("button", {
          key: 0,
          onClick: S[9] || (S[9] = (D) => L(u).revertToLastValid())
        }, "Revert to last valid")) : U("", !0),
        Ae.value && !c.value.advanced ? (b(), C("button", {
          key: 1,
          onClick: S[10] || (S[10] = (D) => c.value.advanced = !0)
        }, "Show the ABC text")) : U("", !0)
      ])) : L(u).view?.ok && L(u).view.model_error && !i.readonly ? (b(), C("p", CM, " This score is valid for YuE2 but outside the editor's supported subset (" + I(L(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : U("", !0),
      K.value ? (b(), In(Ax, {
        key: 3,
        ref_key: "pianoRoll",
        ref: w,
        zoom: re.value,
        "onUpdate:zoom": S[11] || (S[11] = (D) => re.value = D),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": S[12] || (S[12] = (D) => c.value.rowHeight = D),
        follow: c.value.follow,
        "onUpdate:follow": S[13] || (S[13] = (D) => c.value.follow = D),
        track: P.value,
        "onUpdate:track": S[14] || (S[14] = (D) => P.value = D),
        recorded: L(T).recording.value ? { track: P.value, notes: L(T).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": S[15] || (S[15] = (D) => c.value.sung = D),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": S[16] || (S[16] = (D) => c.value.wave = D),
        sound: N.value,
        sung: fs.value,
        height: c.value.rollHeight,
        view: ie.value,
        selection: L(u).selection,
        playing: f.value,
        operate: Z,
        readonly: i.readonly,
        stale: le.value,
        busy: L(u).busy,
        locator: Q.value ? m.value : null,
        playhead: y.value,
        clip: L(ei)?.label ?? null,
        lyrics: ie.value?.lyrics ?? null,
        "lyrics-editable": de.value,
        source: Rt.value ? { envelope: Rt.value.envelope, bars: Ft.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": S[17] || (S[17] = (D) => c.value.audition = D),
        "resize-mode": "rests",
        onSelect: Dr,
        onLocate: S[18] || (S[18] = (D) => m.value = D),
        onClipboard: A,
        "lyric-selection": ht.value,
        "onUpdate:lyricSelection": S[19] || (S[19] = (D) => ht.value = D),
        onLyricEdit: vt,
        onLyricPlace: fi,
        onLyricDelete: fn
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : U("", !0),
      K.value && ie.value?.model ? (b(), C("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": L(Sp),
        "aria-valuemax": L(xp),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: Ne,
        onKeydown: be
      }, null, 40, MM)) : U("", !0),
      En(oC, {
        ref_key: "transport",
        ref: k,
        voices: gn.value,
        "onUpdate:voices": S[22] || (S[22] = (D) => gn.value = D),
        speed: qn.value,
        "onUpdate:speed": S[23] || (S[23] = (D) => qn.value = D),
        sounds: c.value.sounds,
        metronome: Mt.value,
        "onUpdate:metronome": S[24] || (S[24] = (D) => Mt.value = D),
        view: ie.value,
        bar: Fe.value,
        from: nt.value,
        position: Ge.value,
        reference: Gn.value,
        hear: pn.value,
        "onUpdate:hear": S[25] || (S[25] = (D) => pn.value = D),
        "source-level": Gt.value,
        "onUpdate:sourceLevel": S[26] || (S[26] = (D) => Gt.value = D),
        "source-shift": mn.value,
        "onUpdate:sourceShift": S[27] || (S[27] = (D) => mn.value = D),
        "source-beat": Ri.value,
        "timeline-bars": Ft.value,
        guide: te.value,
        source: Rt.value,
        "source-problem": jn.value,
        "loop-range": mi.value,
        onCursor: S[28] || (S[28] = (D) => f.value = D),
        onTime: q,
        onStopped: L(T).onStopped
      }, {
        record: Zf(({ countingIn: D }) => [
          En(h2, {
            settings: W.value,
            "onUpdate:settings": S[20] || (S[20] = (X) => W.value = X),
            hub: L(ne),
            recording: L(T).recording.value,
            "counting-in": D,
            step: L(T).step.value,
            target: P.value === "vocal" ? "Vocal" : "Ins",
            disabled: me.value,
            onRecord: L(T).start,
            onStop: L(T).stop,
            onStep: L(T).toggleStep,
            onRest: L(T).rest,
            onEnable: L(T).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          En(K2, {
            sounds: R.value,
            "onUpdate:sounds": S[21] || (S[21] = (X) => R.value = X),
            fetcher: i.fetcher,
            settings: V.value,
            "keeps-guide": Lr.value,
            onApply: E
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: ze(["score-main", { "with-roll": K.value && !!ie.value?.model, "with-inspector": Ae.value }]),
        "data-layout": d.value,
        "data-text": Ae.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: ji(ke.value)
      }, [
        p("div", TM, [
          j.value ? (b(), In(yC, {
            key: 0,
            voices: gn.value,
            "onUpdate:voices": S[29] || (S[29] = (D) => gn.value = D),
            view: ie.value,
            "guide-count": Qe.value.length,
            sounds: R.value,
            "onUpdate:sounds": S[30] || (S[30] = (D) => R.value = D),
            "keeps-guide": Lr.value,
            readonly: i.readonly,
            onClearGuide: F,
            onShiftTrack: S[31] || (S[31] = (D, X) => Y({ op: "shift_track", track: D, semitones: X }))
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : U("", !0),
          En(rS, {
            view: ie.value,
            bar: Be.value,
            "error-bars": Se.value,
            "source-starts": He.value,
            readonly: i.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: tn,
            onOperate: Y,
            onNotice: S[32] || (S[32] = (D) => L(u).notes = [D])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          i.lyricsTarget && l.value !== null ? (b(), C("div", $M, [
            S[39] || (S[39] = p("strong", null, "Lyrics", -1)),
            i.lyricsTarget.blocked ? (b(), C("p", DM, I(i.lyricsTarget.blocked), 1)) : (b(), C(he, { key: 1 }, [
              xe.value ? (b(), C("p", LM, [
                ae(" Apply writes the changed lyrics into " + I(i.lyricsTarget.title) + ": " + I(Me.value) + ". That sheet then asks for approval again. ", 1),
                i.lyricsTarget.replans ? (b(), C(he, { key: 0 }, [
                  ae(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : U("", !0)
              ])) : (b(), C("p", BM, [
                ae(I(i.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${i.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !i.readonly ? (b(), C(he, { key: 0 }, [
                  ae("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : U("", !0)
              ])),
              xe.value ? (b(), C("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: ds
              }, " Revert the lyrics ")) : U("", !0)
            ], 64))
          ])) : U("", !0),
          Ae.value && Fn.value ? (b(), C("details", OM, [
            S[40] || (S[40] = p("summary", null, "Lyrics fit", -1)),
            En(Qc, {
              lyrics: Fn.value,
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
          "aria-valuemin": L(Mp),
          "aria-valuemax": L(Cp),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: dt,
          onKeydown: yt
        }, null, 40, EM),
        p("div", {
          class: ze(["score-views", { split: Ae.value && c.value.advanced }])
        }, [
          Ae.value ? U("", !0) : (b(), In(Mc, {
            key: 0,
            text: i.doc.text,
            diagnostics: Ee.value,
            reveal: v.value,
            readonly: i.readonly,
            onChange: L(u).typed,
            onCursor: Pi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          En(tw, {
            view: ie.value,
            stale: le.value,
            selection: L(u).selection,
            playing: f.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: S[33] || (S[33] = (D, X) => Pt(D, X))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Ae.value && c.value.advanced ? (b(), C("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": L(Tp),
            "aria-valuemax": L(Ap),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: Le,
            onKeydown: je
          }, null, 40, IM)) : U("", !0),
          Ae.value && c.value.advanced ? (b(), In(Mc, {
            key: 2,
            text: i.doc.text,
            diagnostics: Ee.value,
            reveal: v.value,
            readonly: i.readonly,
            onChange: L(u).typed,
            onCursor: Pi
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : U("", !0)
        ], 2),
        Ae.value ? (b(), In(yk, {
          key: 0,
          view: ie.value,
          selection: L(u).selection,
          operate: Z,
          "fallback-bar": L(u).primary?.bar ?? null,
          readonly: i.readonly,
          stale: le.value,
          busy: L(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : U("", !0)
      ], 14, AM),
      p("p", RM, [
        p("span", null, I(L(u).selection.length > 1 ? `${L(u).selection.length} selected · ` : "") + I(L(xm)(L(u).primary, mt.value)), 1),
        (b(!0), C(he, null, we(L(u).notes, (D, X) => (b(), C("span", {
          key: X,
          class: "change"
        }, I(D), 1))), 128))
      ]),
      L(u).error ? (b(), C("p", PM, I(L(u).error), 1)) : U("", !0),
      it.value ? (b(), C("p", NM, I(it.value), 1)) : U("", !0),
      H.value ? (b(), C("p", VM, I(H.value), 1)) : U("", !0),
      On.value ? (b(), In(Zk, {
        key: 8,
        fetcher: i.fetcher,
        data: On.value.data,
        filename: On.value.filename,
        view: ie.value,
        "keeps-guide": Lr.value,
        "current-guide": Qe.value.length,
        onClose: S[34] || (S[34] = (D) => On.value = null),
        onInsert: jf
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : U("", !0),
      Ee.value.length ? (b(), C("ul", HM, [
        (b(!0), C(he, null, we(Ee.value, (D, X) => (b(), C("li", {
          key: X,
          "data-severity": D.severity
        }, [
          p("strong", null, I(D.severity), 1),
          D.bar ? (b(), C("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${D.bar}`,
            onClick: (ue) => tn(D.bar)
          }, "bar " + I(D.bar), 9, WM)) : D.line ? (b(), C("span", FM, "line " + I(D.line), 1)) : U("", !0),
          ae(" " + I(D.message), 1)
        ], 8, zM))), 128))
      ])) : U("", !0)
    ], 544));
  }
}), KM = ["aria-label"], _M = ["title"], UM = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, GM = ["aria-selected", "onClick"], jM = ["title", "aria-label", "aria-pressed"], qM = {
  key: 0,
  class: "hint"
}, YM = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, XM = ["disabled", "title"], JM = {
  class: "body",
  role: "tabpanel"
}, ZM = { class: "doc-head" }, QM = ["data-state"], eA = ["disabled", "title", "onClick"], tA = ["disabled", "onClick"], nA = ["onClick"], iA = {
  key: 0,
  class: "conflict"
}, sA = ["onClick"], oA = ["onClick"], rA = ["onClick"], lA = ["onUpdate:modelValue", "rows", "aria-label", "onFocus", "onInput"], aA = {
  key: 3,
  class: "tag-helpers"
}, uA = ["title", "onClick"], cA = {
  key: 0,
  class: "facts"
}, hA = {
  key: 4,
  class: "asr"
}, dA = { key: 0 }, fA = { key: 1 }, pA = { key: 2 }, mA = { key: 5 }, gA = {
  key: 0,
  class: "diff"
}, vA = { key: 0 }, yA = { key: 1 }, bA = { key: 2 }, kA = { key: 3 }, wA = {
  key: 0,
  class: "doc context wide"
}, xA = { class: "doc-head" }, SA = ["title"], CA = {
  key: 1,
  class: "badge"
}, MA = {
  key: 0,
  class: "hint score-owner"
}, AA = {
  key: 1,
  class: "hint"
}, TA = {
  key: 1,
  class: "doc sections"
}, $A = {
  key: 0,
  class: "doc context"
}, DA = { class: "doc-head" }, LA = {
  class: "findings",
  "aria-label": "Validation"
}, BA = ["data-status"], OA = { key: 0 }, EA = ["title"], IA = { key: 1 }, RA = ["title"], PA = { class: "idea" }, NA = {
  key: 0,
  class: "idea"
}, VA = {
  key: 1,
  class: "idea"
}, HA = { class: "where" }, zA = {
  key: 0,
  class: "kept"
}, WA = {
  key: 1,
  class: "error"
}, FA = {
  key: 2,
  class: "error"
}, KA = {
  key: 3,
  class: "error"
}, _A = {
  key: 4,
  class: "error"
}, UA = ["data-severity"], GA = { class: "where" }, jA = {
  key: 0,
  class: "facts"
}, qA = ["disabled"], YA = ["disabled", "title"], XA = ["disabled", "title"], JA = ["aria-valuenow", "title"], ZA = /* @__PURE__ */ Dt({
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = O(() => t.payload?.style_label === "caption"), u = O(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (B) => B === "style" && a.value ? "Caption" : o[B], d = (B) => B === "style" && a.value ? 14 : l[B], h = ws(qa(t.state, t.payload, t.owned)), f = z(t.payload), m = z(null), y = z(!1), v = z(!1), k = z(null), w = O(() => {
      const B = h.find((Z) => Z.kind === "score"), Y = k.value;
      return B && B.intent !== "auto" && Y?.reason && Y.text === B.text ? Y.reason : null;
    }), $ = z(null), P = z(0);
    let R;
    const V = O(() => t.payload?.context?.score ?? null), E = ws({ kind: "score", text: V.value ?? "", intent: "keep" }), _ = O(
      () => !h.some((B) => B.kind === "score") && !!V.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), N = z(null), ne = O(() => {
      const B = N.value;
      return _.value && B?.reason && B.text === E.text ? B.reason : null;
    }), W = O(
      () => _.value && V.value && jt(E.text) !== jt(V.value) ? E.text : null
    );
    function T() {
      if (!W.value) return;
      const B = h.find((Y) => Y.kind === "lyrics");
      B && B.intent !== "auto" && (B.intent = "manual");
    }
    const H = O(() => {
      const B = new Set(h.map((Y) => s[Y.kind]));
      for (const Y of Object.keys(t.payload?.context ?? {}))
        Y in s && B.add(s[Y]);
      return ["score", "lyrics", "style", "details"].filter((Y) => B.has(Y));
    }), me = h[0] ? s[h[0].kind] : "lyrics", ve = z(me), ie = (B) => t.payload?.docs[B] ?? null, le = (B) => ie(B)?.upstream ?? null, Ee = (B) => ie(B)?.status === "conflict", Se = (B) => h.filter((Y) => s[Y.kind] === B), Be = O(() => h.find((B) => B.kind === "score") ?? null), Ae = O(() => Be.value?.text ?? V.value ?? null), j = O(
      () => h.find((B) => B.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), Qe = O(
      () => h.find((B) => B.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), ce = O(() => Np(t.payload?.timeline)), Ce = O(() => {
      const B = t.asrNote ?? $.value;
      return B && B.draft_sha256 === ie("lyrics")?.upstream_sha256 ? B : null;
    }), te = (B) => am(le(B.kind) ?? "", B.text);
    function K(B) {
      if (B.intent === "auto") return "auto";
      if (B.intent === "manual") return "manual";
      if (B.intent === "rebase") return "edited (merged)";
      if (Ee(B.kind)) return "conflict";
      const Y = t.state.docs[B.kind]?.state ?? "auto", Z = jt(le(B.kind) ?? "");
      return Y === "auto" && jt(B.text) !== Z ? Z || !t.payload ? "edited" : "manual" : Y;
    }
    function Q(B) {
      B.intent = "auto";
      const Y = le(B.kind);
      Y !== null && (B.text = Y);
    }
    function Fe(B) {
      return le(B.kind) !== null || K(B) !== "auto";
    }
    function nt(B) {
      B.intent = "manual";
    }
    const Ge = /* @__PURE__ */ new Map(), xt = /* @__PURE__ */ new Set();
    function ee(B, Y) {
      Y instanceof HTMLTextAreaElement ? Ge.set(B, Y) : Ge.delete(B);
    }
    function G(B, Y) {
      const Z = Ge.get(B.kind), ge = Z && xt.has(B.kind) ? Z.selectionStart : B.text.length, at = lm(B.text, Y, ge);
      B.text = at.text, Me(B), Cn(() => {
        Z?.isConnected && (Z.focus(), Z.setSelectionRange(at.caret, at.caret));
      });
    }
    function de(B) {
      B.intent = "manual";
    }
    function xe(B) {
      B.intent = "rebase";
    }
    function Me(B) {
      B.intent === "auto" && (B.intent = "keep");
    }
    function Fn() {
      qa(t.state, t.payload, t.owned).forEach((Y, Z) => Object.assign(h[Z], Y)), St.value = [...t.guide ?? []], ht.value = [...t.lyricSpans ?? []], Wt.value = t.sourceShift ?? 0, E.text = V.value ?? "", P.value++;
    }
    const pt = O(
      () => h.filter((B) => Ee(B.kind) && B.intent === "keep").map((B) => B.kind)
    ), It = O(() => Wp(t.state, t.payload, h)), St = z([...t.guide ?? []]);
    function Kn(B) {
      St.value = B;
    }
    const ht = z([...t.lyricSpans ?? []]);
    function Ii(B) {
      ht.value = B;
    }
    const Wt = z(t.sourceShift ?? 0);
    function _n(B) {
      Wt.value = B;
    }
    function Ln() {
      return { lyricSpans: ht.value, sourceShift: Wt.value };
    }
    const Ut = z(null), Ct = O(() => h.find((B) => B.kind === "lyrics") ?? null), fi = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, fn = O(() => Ct.value ? fi : t.lyricsTarget ?? null), en = O(() => {
      const B = t.payload?.context?.lyrics, Y = Ut.value;
      return Ct.value || !fn.value || fn.value.blocked || !Y || !B ? null : jt(Y) !== jt(B) ? Y : null;
    });
    function Un(B) {
      const Y = Ct.value;
      Y ? B !== null && jt(B) !== jt(Y.text) && (Y.text = B, Me(Y)) : Ut.value = B;
    }
    function pi() {
      if (!en.value || !fn.value?.replans) return;
      const B = h.find((Y) => Y.kind === "score");
      B && B.intent === "keep" && (B.intent = "manual");
    }
    const Bn = O(
      () => Ja(It.value) !== Ja(t.state) || !Ss(St.value, t.guide ?? []) || !Bo(ht.value, t.lyricSpans ?? []) || Wt.value !== (t.sourceShift ?? 0) || en.value !== null || W.value !== null
    ), vt = O(() => {
      const B = t.payload?.arrangement;
      return B && B.status !== "skipped" ? B : null;
    }), ds = O(() => Vp(vt.value?.notes ?? [])), Mt = O(() => (f.value?.findings ?? []).filter((B) => B.severity !== "info")), Gn = O(() => (f.value?.findings ?? []).filter((B) => B.severity === "info")), Rt = O(() => Mt.value.some((B) => B.severity === "error")), jn = O(
      () => !y.value && !Rt.value && !pt.value.length && !w.value && !ne.value && !!f.value?.fingerprint
    ), pn = O(
      () => pt.value.length ? "Resolve the conflicts first." : w.value ?? ne.value
    ), Gt = O(() => pt.value.length ? "⇄ conflict" : Rt.value ? "✖ errors" : Mt.value.length ? "⚠ warnings" : f.value?.waiting && !Bn.value ? "⏸ waiting for approval" : f.value ? "✓ valid" : "not run yet");
    async function mi() {
      if (t.payload) {
        y.value = !0, m.value = null;
        try {
          f.value = await Hp(t.fetcher, {
            sheet_state: It.value,
            upstream: zp(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: W.value ? { ...t.payload.context, score: W.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null,
            sparse: t.payload.sparse ?? !1
          });
        } catch (B) {
          m.value = B instanceof Jc ? `${B.message}${B.hint ? ` — ${B.hint}` : ""}` : String(B);
        } finally {
          y.value = !1;
        }
      }
    }
    Re(
      () => [...h.map((B) => B.text + B.intent), W.value ?? ""].join("\0"),
      () => {
        clearTimeout(R), R = setTimeout(mi, 300);
      }
    );
    function Ft(B) {
      return W.value ? { text: W.value, approved: B } : null;
    }
    function Ri() {
      pn.value || (pi(), T(), n(
        "apply",
        Za(It.value, t.state.review?.approved_fingerprint ?? null),
        St.value,
        en.value,
        Ft(!1),
        !1,
        Ln()
      ));
    }
    async function fs() {
      pi(), T(), await mi(), jn.value && n(
        "apply",
        Za(It.value, f.value?.fingerprint ?? null),
        St.value,
        en.value,
        Ft(!0),
        !0,
        Ln()
      );
    }
    function mn() {
      Bn.value ? v.value = !0 : n("close");
    }
    const He = ws(Rp()), mt = ws({ width: window.innerWidth, height: window.innerHeight }), gn = O(() => {
      const B = He.maximized ? mt.height - 2 * Qa : He.height;
      return He.maximized ? {
        width: `${mt.width - 2 * Qa}px`,
        height: `${B}px`,
        "--plenio-dialog-h": `${B}px`
      } : { width: `${He.width}px`, height: `${He.height}px`, "--plenio-dialog-h": `${B}px` };
    });
    function qn() {
      mt.width = window.innerWidth, mt.height = window.innerHeight;
      const B = eu({ width: He.width, height: He.height }, mt);
      (B.width !== He.width || B.height !== He.height) && (He.width = B.width, He.height = B.height, Pr(He));
    }
    function Pt() {
      He.maximized = !He.maximized, Pr(He);
    }
    function Pi(B) {
      B.preventDefault(), B.stopPropagation();
      const Y = { width: He.width, height: He.height };
      Lo(
        B,
        ({ dx: Z, dy: ge }) => {
          const at = eu(
            { width: Y.width + Z, height: Y.height + ge },
            { width: window.innerWidth, height: window.innerHeight }
          );
          He.width = at.width, He.height = at.height;
        },
        () => Pr(He)
      );
    }
    function tn(B) {
      B.key === "Escape" && !B.defaultPrevented && (B.preventDefault(), v.value ? v.value = !1 : mn());
    }
    return Xs(() => {
      window.addEventListener("keydown", tn), window.addEventListener("resize", qn), t.payload && mi();
      const B = ie("lyrics")?.upstream_sha256;
      !t.asrNote && B && Pp(t.fetcher, B).then((Y) => $.value = Y).catch(() => {
      });
    }), zn(() => {
      window.removeEventListener("keydown", tn), window.removeEventListener("resize", qn), clearTimeout(R);
    }), (B, Y) => (b(), C("div", {
      class: "plenio-overlay",
      onMousedown: Ue(mn, ["self"])
    }, [
      p("div", {
        class: ze(["plenio-dialog", { maximized: He.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": i.title,
        style: ji(gn.value)
      }, [
        p("header", {
          onDblclick: Ue(Pt, ["self"])
        }, [
          p("h2", null, I(i.title), 1),
          p("span", {
            class: ze(["status", { bad: Rt.value || pt.value.length }]),
            title: f.value?.status ?? ""
          }, I(Gt.value), 11, _M),
          p("div", UM, [
            (b(!0), C(he, null, we(H.value, (Z) => (b(), C("button", {
              key: Z,
              role: "tab",
              "aria-selected": ve.value === Z,
              class: ze({ active: ve.value === Z }),
              onClick: (ge) => ve.value = Z
            }, I(c(Z)), 11, GM))), 128))
          ]),
          p("button", {
            class: "icon",
            title: He.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": He.maximized ? "Restore" : "Maximize",
            "aria-pressed": He.maximized,
            onClick: Pt
          }, I(He.maximized ? "❐" : "⛶"), 9, jM),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: mn
          }, "×")
        ], 32),
        i.payload ? U("", !0) : (b(), C("p", qM, [...Y[4] || (Y[4] = [
          ae(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          ae("; ", -1),
          p("em", null, "Back to auto", -1),
          ae(" hands a document back to the workflow. ", -1)
        ])])),
        v.value ? (b(), C("div", YM, [
          Y[5] || (Y[5] = ae(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!pn.value,
            title: pn.value ?? "Save your documents into the node",
            onClick: Ri
          }, " Apply ", 8, XM),
          p("button", {
            onClick: Y[0] || (Y[0] = (Z) => n("close"))
          }, "Discard"),
          p("button", {
            onClick: Y[1] || (Y[1] = (Z) => v.value = !1)
          }, "Keep editing")
        ])) : U("", !0),
        p("div", JM, [
          (b(!0), C(he, null, we(Se(ve.value), (Z) => (b(), C("section", {
            key: Z.kind + P.value,
            class: ze(["doc", { wide: Z.kind === "score" }])
          }, [
            p("div", ZM, [
              p("h3", null, I(u.value[Z.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": K(Z)
              }, I(K(Z)), 9, QM),
              Y[6] || (Y[6] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: !Fe(Z),
                title: le(Z.kind) !== null ? "Discard your edit and use the draft" : "Discard your text: the next run computes this document again (the writer, the plan or the transcription) and uses it",
                onClick: (ge) => Q(Z)
              }, I(le(Z.kind) !== null ? "Use draft" : "Back to auto"), 9, eA),
              Z.kind === "lyrics" ? (b(), C("button", {
                key: 0,
                disabled: Z.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (ge) => nt(Z)
              }, " Use my own lyrics ", 8, tA)) : (b(), C("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (ge) => nt(Z)
              }, " Make manual ", 8, nA))
            ]),
            Ee(Z.kind) && Z.intent === "keep" ? (b(), C("div", iA, [
              ae(" The draft changed after you edited this document (" + I(ie(Z.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (ge) => de(Z)
              }, "Keep my edit (manual)", 8, sA),
              p("button", {
                onClick: (ge) => Q(Z)
              }, "Use the new draft", 8, oA),
              p("button", {
                onClick: (ge) => xe(Z)
              }, "Merge by hand", 8, rA)
            ])) : U("", !0),
            Z.kind === "score" ? (b(), In(Xc, {
              key: 1,
              doc: Z,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !1,
              "layout-default": i.layout ?? null,
              lyrics: j.value,
              title: Qe.value,
              guide: St.value,
              "lyric-spans": ht.value,
              "source-shift": Wt.value,
              "lyrics-target": fn.value,
              "lyrics-pending": Ct.value ? null : Ut.value,
              onEdited: (ge) => Me(Z),
              onGuideChange: Kn,
              onLyricSpansChange: Ii,
              onSourceShiftChange: _n,
              onLyricsChange: Un,
              onGate: Y[2] || (Y[2] = (ge, at) => k.value = { text: ge, reason: at })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : Oe((b(), C("textarea", {
              key: 2,
              ref_for: !0,
              ref: (ge) => ee(Z.kind, ge),
              "onUpdate:modelValue": (ge) => Z.text = ge,
              rows: d(Z.kind),
              spellcheck: "false",
              "aria-label": u.value[Z.kind],
              onFocus: (ge) => L(xt).add(Z.kind),
              onInput: (ge) => Me(Z)
            }, null, 40, lA)), [
              [ft, Z.text]
            ]),
            Z.kind === "lyrics" ? (b(), C("p", aA, [
              Y[7] || (Y[7] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (b(!0), C(he, null, we(L(rm), (ge) => (b(), C("button", {
                key: ge,
                title: ge === "Instrumental" ? "Insert [Instrumental] at the cursor: a section without words (an interlude)" : `Insert [${ge}] at the cursor`,
                onClick: (at) => G(Z, ge)
              }, " [" + I(ge) + "] ", 9, uA))), 128)),
              Z.intent === "manual" ? (b(), C("span", cA, "the writer is not consulted - these are your lyrics")) : U("", !0)
            ])) : U("", !0),
            Z.kind === "lyrics" && Ce.value ? (b(), C("p", hA, [
              p("span", null, "Transcribed (" + I(Ce.value.language) + ").", 1),
              Ce.value.corrected?.length ? (b(), C("span", dA, [
                Y[8] || (Y[8] = ae(" Corrected as misheard: ", -1)),
                (b(!0), C(he, null, we(Ce.value.corrected, (ge, at) => (b(), C("span", {
                  key: "fix-" + at,
                  class: "fix"
                }, [
                  p("s", null, I(ge.heard), 1),
                  ae(" → " + I(ge.word), 1)
                ]))), 128))
              ])) : U("", !0),
              Ce.value.low_confidence.length ? (b(), C("span", fA, [
                Y[9] || (Y[9] = ae(" Check these unsure words: ", -1)),
                (b(!0), C(he, null, we(Ce.value.low_confidence, (ge, at) => (b(), C("mark", {
                  key: "low-" + at
                }, I(ge), 1))), 128))
              ])) : U("", !0),
              Ce.value.left_out.length ? (b(), C("span", pA, [
                Y[10] || (Y[10] = ae("Left out as not sung: ", -1)),
                p("s", null, I(Ce.value.left_out.join(" ")), 1)
              ])) : U("", !0)
            ])) : U("", !0),
            le(Z.kind) !== null && L(jt)(le(Z.kind) ?? "") !== L(jt)(Z.text) ? (b(), C("details", mA, [
              p("summary", null, "Changes against the draft (" + I(L(um)(te(Z))) + " words)", 1),
              Z.kind !== "score" ? (b(), C("p", gA, [
                (b(!0), C(he, null, we(te(Z), (ge, at) => (b(), C(he, { key: at }, [
                  ge.text === L(Ns) ? (b(), C("br", vA)) : ge.op === "added" ? (b(), C("ins", yA, I(ge.text + " "), 1)) : ge.op === "removed" ? (b(), C("del", bA, I(ge.text + " "), 1)) : (b(), C("span", kA, I(ge.text + " "), 1))
                ], 64))), 128))
              ])) : U("", !0),
              p("pre", null, I(le(Z.kind)), 1)
            ])) : U("", !0),
            Z.kind === "lyrics" ? (b(), In(Qc, {
              key: 6,
              lyrics: Z.text,
              abc: Ae.value,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : U("", !0)
          ], 2))), 128)),
          ve.value === "score" && !Be.value && V.value ? (b(), C("section", wA, [
            p("div", xA, [
              Y[11] || (Y[11] = p("h3", null, "Score (ABC)", -1)),
              _.value ? (b(), C("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${i.scoreTarget?.title}`
              }, " from " + I(i.scoreTarget?.title) + I(W.value ? " · changed" : ""), 9, SA)) : (b(), C("span", CA, "from the other sheet (read-only)"))
            ]),
            _.value ? (b(), C("p", MA, [
              Y[12] || (Y[12] = ae(" Changes to the score go into ", -1)),
              p("strong", null, I(i.scoreTarget?.title), 1),
              Y[13] || (Y[13] = ae(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              Y[14] || (Y[14] = p("strong", null, "Approve", -1)),
              Y[15] || (Y[15] = ae(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : i.scoreTarget?.blocked ? (b(), C("p", AA, I(i.scoreTarget.blocked), 1)) : U("", !0),
            En(Xc, {
              doc: E,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !_.value,
              "layout-default": i.layout ?? null,
              lyrics: j.value,
              "lyrics-target": Ct.value ? fn.value : null,
              "lyric-spans": ht.value,
              "source-shift": Wt.value,
              onLyricSpansChange: Ii,
              onSourceShiftChange: _n,
              onLyricsChange: Un,
              onGate: Y[3] || (Y[3] = (Z, ge) => N.value = { text: Z, reason: ge })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : U("", !0),
          ve.value === "lyrics" && ce.value.length ? (b(), C("section", TA, [
            Y[17] || (Y[17] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              Y[16] || (Y[16] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (b(!0), C(he, null, we(ce.value, (Z, ge) => (b(), C("tr", { key: ge }, [
                  p("td", null, I(Z.label), 1),
                  p("td", null, I(Z.bars), 1),
                  p("td", null, I(Z.start), 1),
                  p("td", null, I(Z.end), 1)
                ]))), 128))
              ])
            ])
          ])) : U("", !0),
          (b(!0), C(he, null, we(i.payload?.context ?? {}, (Z, ge) => (b(), C(he, {
            key: "context-" + ge
          }, [
            ge !== "score" && s[ge] === ve.value ? (b(), C("section", $A, [
              p("div", DA, [
                p("h3", null, I(u.value[ge] ?? ge), 1),
                Y[18] || (Y[18] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, I(Z), 1)
            ])) : U("", !0)
          ], 64))), 128))
        ]),
        p("section", LA, [
          vt.value ? (b(), C("div", {
            key: 0,
            class: "arrangement",
            "data-status": vt.value.status
          }, [
            vt.value.status === "fallback" ? (b(), C("p", OA, [
              Y[19] || (Y[19] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: L(Rr)
              }, "experimental", 8, EA),
              ae(" - " + I(L(Ya)(vt.value)) + ": " + I(vt.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (b(), C("details", IA, [
              p("summary", null, [
                Y[20] || (Y[20] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: L(Rr)
                }, "experimental", 8, RA),
                ae(" " + I(L(Ya)(vt.value)) + ": " + I(vt.value.summary), 1)
              ]),
              p("p", PA, I(L(Rr)), 1),
              L(Xa)(vt.value) ? (b(), C("p", NA, I(L(Xa)(vt.value)), 1)) : U("", !0),
              vt.value.idea ? (b(), C("p", VA, I(vt.value.idea), 1)) : U("", !0),
              p("ul", null, [
                (b(!0), C(he, null, we(vt.value.sections ?? [], (Z) => (b(), C("li", {
                  key: Z.index
                }, [
                  p("strong", null, I(Z.index) + " " + I(Z.label), 1),
                  p("span", HA, "bars " + I(Z.bars), 1),
                  ae(" " + I(Z.applied.length ? Z.applied.join("; ") : "unchanged") + " ", 1),
                  Z.kept.length ? (b(), C("span", zA, " - kept: " + I(Z.kept.join("; ")), 1)) : U("", !0)
                ]))), 128)),
                (b(!0), C(he, null, we(ds.value, (Z, ge) => (b(), C("li", {
                  key: "note" + ge,
                  "data-severity": "info"
                }, I(Z), 1))), 128))
              ])
            ]))
          ], 8, BA)) : U("", !0),
          m.value ? (b(), C("p", WA, I(m.value), 1)) : U("", !0),
          pt.value.length ? (b(), C("p", FA, " Resolve the conflict in: " + I(pt.value.join(", ")) + ". ", 1)) : U("", !0),
          w.value ? (b(), C("p", KA, "Score: " + I(w.value), 1)) : ne.value ? (b(), C("p", _A, "Score: " + I(ne.value), 1)) : U("", !0),
          p("ul", null, [
            (b(!0), C(he, null, we(Mt.value, (Z, ge) => (b(), C("li", {
              key: ge,
              "data-severity": Z.severity
            }, [
              p("strong", null, I(Z.severity), 1),
              Y[21] || (Y[21] = ae()),
              p("span", GA, I(Z.where), 1),
              ae(" " + I(Z.message), 1)
            ], 8, UA))), 128)),
            (b(!0), C(he, null, we(Gn.value, (Z, ge) => (b(), C("li", {
              key: "i" + ge,
              "data-severity": "info"
            }, I(Z.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          i.owned.includes("score") && f.value ? (b(), C("span", jA, " render: " + I(f.value.planning_mode) + ", ceiling " + I(Math.round(f.value.score_seconds)) + " s ", 1)) : U("", !0),
          Y[22] || (Y[22] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Bn.value,
            title: "Discard every change made in this editor",
            onClick: Fn
          }, "Revert", 8, qA),
          p("button", { onClick: mn }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!pn.value,
            title: pn.value ?? "Save your documents into the node",
            onClick: Ri
          }, " Apply ", 8, YA),
          i.review === "stop for review" ? (b(), C("button", {
            key: 1,
            class: "primary",
            disabled: !jn.value,
            title: w.value ?? "Release exactly these documents for the next run",
            onClick: fs
          }, " Approve ", 8, XA)) : U("", !0)
        ]),
        He.maximized ? U("", !0) : (b(), C("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": He.width,
          title: `Resize (${He.width} × ${He.height})`,
          onPointerdown: Pi
        }, null, 40, JA))
      ], 14, KM)
    ], 32));
  }
});
function QA() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const i = document.createElement("style");
  i.id = "plenio-dialog-styles", i.textContent = ep, document.head.append(i);
}
function lT(i) {
  QA();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    n.unmount(), e.remove();
  }, n = Qf(ZA, {
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
  lT as openSheetDialog
};
