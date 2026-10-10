import { d as Dt, m as Re, a as Hn, i as w, c as C, b as p, t as I, F as fe, r as xe, n as ze, j as ae, e as G, g as W, h as B, o as qs, u as E, w as Oe, v as dt, p as st, f as Ue, q as Nt, s as oi, x as ks, y as _i, z as Sn, A as ut, B as Ui, C as eo, D as Zt, E as Uf, G as En, H as On, I as Gf, k as jf, l as qf } from "./dialog-cQCiTnNN.mjs";
import { a as Yf, P as Uc, b as Xf, t as Jf, i as Zf, T as To, d as Qf, s as Ho, f as ep, p as tp, c as np, e as ip, g as sp, h as op, j as rp, k as lp, m as za, n as ap, o as up, I as Gc, q as zo, r as cp, u as hp, w as dp, x as fp, y as pp, z as mp, R as gp, A as vp, S as yp, B as bp, N as kp, C as wp, D as jt, v as xp, E as $o, F as Wa, G as Sp, H as Fa, J as Cp, K as Mp, L as Ap, M as Tp, O as Ka, Q as $p, U as Dp, V as Er, W as _a, X as Ua, Y as Lp, Z as Ga, _ as Bp, $ as Op, a0 as Ep, a1 as ja, a2 as qa, a3 as Ya, a4 as Ir, a5 as Ip } from "./main-Bdl16y-J.mjs";
import { a as Rp, r as Pp, n as Np, e as Rr, b as Vp, s as Hp, p as zp } from "./notationExport-DkCMgjck.mjs";
import { lineKey as Wo, parseSpans as jc, editRange as to, sameSpans as Do, partOf as Wp, settle as Fp, placedLines as Xa, withBlockSpans as Kp, parseLineKey as _p, clipOfLines as Ja, partAt as Up, remapSpans as Gp, followSpans as jp } from "./lyricPlacement-rAf-x_fn.mjs";
import { notesLabel as qp, trackRows as Yp, parseGuide as Xp, sameGuide as ws, guideNotes as Jp, remapGuide as Zp } from "./tracks-DxmZeggM.mjs";
const Qp = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Instrumental", "Outro"];
function em(i, e, t = i.length) {
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
const Rs = `
`;
function Za(i) {
  const e = [];
  return i.replace(/\r\n?/g, `
`).split(`
`).forEach((t, n) => {
    n > 0 && e.push(Rs), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function tm(i, e) {
  const t = Za(i), n = Za(e), s = t.length + 1, o = n.length + 1, r = new Array(s * o).fill(0);
  for (let d = t.length - 1; d >= 0; d--)
    for (let h = n.length - 1; h >= 0; h--)
      r[d * o + h] = t[d] === n[h] ? r[(d + 1) * o + h + 1] + 1 : Math.max(r[(d + 1) * o + h], r[d * o + h + 1]);
  const l = [], a = (d, h) => {
    const f = l[l.length - 1];
    f && f.op === d && h !== Rs && !f.text.endsWith(Rs) ? f.text += ` ${h}` : l.push({ op: d, text: h });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < n.length; )
    u < t.length && c < n.length && t[u] === n[c] ? (a("same", t[u]), u++, c++) : c < n.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", n[c++]) : a("removed", t[u++]);
  return l;
}
function nm(i) {
  return i.filter((e) => e.op !== "same" && e.text !== Rs).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const im = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, sm = {
  key: 0,
  class: "error"
}, om = { key: 1 }, rm = {
  key: 0,
  class: "bad"
}, qc = /* @__PURE__ */ Dt({
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
        const u = await Yf(e.fetcher, {
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
    ), Hn(() => clearTimeout(s));
    const l = B(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", d = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: d };
      })
    );
    return (a, u) => i.abc ? (w(), C("section", im, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      n.value ? (w(), C("p", sm, I(n.value), 1)) : l.value.length ? (w(), C("table", om, [
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
          (w(!0), C(fe, null, xe(l.value, (c, d) => (w(), C("tr", {
            key: d,
            class: ze({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + I(c.tag) + "]", 1),
            p("td", null, [
              ae(I(c.score_section ?? "—"), 1),
              c.mismatch ? (w(), C("span", rm, " ≠")) : G("", !0)
            ]),
            p("td", null, I(c.lines), 1),
            p("td", null, I(c.syllables), 1),
            p("td", null, I(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: ze({ bad: c.fit && c.fit !== "fits" })
            }, I(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : G("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : G("", !0);
  }
});
function lm(i) {
  const e = new Set((i.elements ?? []).map((n) => n.id)), t = i.model?.tracks;
  if (t) for (const n of [...t.vocal, ...t.ins, ...t.chords]) e.add(n.id);
  return e;
}
function am(i, e) {
  const t = i?.model?.tracks, n = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = n.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const Qa = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function ll(i, e) {
  const t = Qa.indexOf(i);
  return t < 0 ? null : Qa[t + e] ?? null;
}
function um(i, e, t) {
  const n = i.elements ?? [], s = n.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of n) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function cm(i, e) {
  const t = i.elements ?? [];
  return t.find((n) => n.source[0] <= e && e < n.source[1]) ?? t.find((n) => n.source[1] === e) ?? null;
}
function Si(i, e) {
  return !i || !e ? null : (i.elements ?? []).find((t) => t.id === e) ?? null;
}
function hm(i, e, t) {
  const n = Si(i, e);
  if (!n) return null;
  const s = (i.elements ?? []).filter((r) => r.voice === n.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function dm(i, e) {
  const t = Si(i, e);
  if (!t) return null;
  const n = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (i.elements ?? []).find(
    (s) => s.voice === n && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function fm(i, e, t = "Vocal") {
  return (i.elements ?? []).find((n) => n.bar === e && n.voice === t) ?? null;
}
function al(i, e) {
  const t = i.sections.findIndex((n) => n.start_bar <= e && e < n.start_bar + n.bars);
  return t < 0 ? 0 : t;
}
const pm = {
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
function mm(i, e = "1/16") {
  if (!i) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), n = pm[i.units * t] ?? `${i.units} units`, s = i.kind === "note" ? `${i.name}${i.tie_out ? " (tied)" : ""}` : "rest", o = i.chord ? `, chord ${i.chord}` : "";
  return `${i.voice} bar ${i.bar}: ${s}, ${i.kind === "bar_rest" ? "whole bar" : n}${o}`;
}
function Lo(i) {
  const e = Math.max(0, i), t = Math.floor(e / 60), n = Math.floor(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
let ul = [], Yc = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? Yc : ul).push(t = t + i[e]);
})();
function gm(i) {
  if (i < 768) return !1;
  for (let e = 0, t = ul.length; ; ) {
    let n = e + t >> 1;
    if (i < ul[n]) t = n;
    else if (i >= Yc[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function eu(i) {
  return i >= 127462 && i <= 127487;
}
const tu = 8205;
function vm(i, e, t = !0, n = !0) {
  return (t ? Xc : ym)(i, e, n);
}
function Xc(i, e, t) {
  if (e == i.length) return e;
  e && Jc(i.charCodeAt(e)) && Zc(i.charCodeAt(e - 1)) && e--;
  let n = Pr(i, e);
  for (e += nu(n); e < i.length; ) {
    let s = Pr(i, e);
    if (n == tu || s == tu || t && gm(s))
      e += nu(s), n = s;
    else if (eu(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && eu(Pr(i, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function ym(i, e, t) {
  for (; e > 1; ) {
    let n = Xc(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Pr(i, e) {
  let t = i.charCodeAt(e);
  if (!Zc(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return Jc(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Jc(i) {
  return i >= 56320 && i < 57344;
}
function Zc(i) {
  return i >= 55296 && i < 56320;
}
function nu(i) {
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
    [e, t] = Zi(this, e, t);
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
    ), Cn.from(s, this.length - (t - e) + n.length);
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
    [e, t] = Zi(this, e, t);
    let n = [];
    return this.decompose(e, t, n, 0), Cn.from(n, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Ts(this), o = new Ts(e);
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
    return new Ts(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Qc(this, e, t);
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
    return new eh(n);
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
    return e.length == 1 && !e[0] ? We.empty : e.length <= 32 ? new ot(e) : Cn.from(ot.split(e, []));
  }
}
class ot extends We {
  constructor(e, t = bm(e)) {
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
        return new km(s, l, n, r);
      s = l + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let o = e <= 0 && t >= this.length ? this : new ot(iu(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = n.pop(), l = Bo(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        n.push(new ot(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        n.push(new ot(l.slice(0, a)), new ot(l.slice(a)));
      }
    } else
      n.push(o);
  }
  replace(e, t, n) {
    if (!(n instanceof ot))
      return super.replace(e, t, n);
    [e, t] = Zi(this, e, t);
    let s = Bo(this.text, Bo(n.text, iu(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return s.length <= 32 ? new ot(s, o) : Cn.from(ot.split(s, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = Zi(this, e, t);
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
      n.push(o), s += o.length + 1, n.length == 32 && (t.push(new ot(n, s)), n = [], s = -1);
    return s > -1 && t.push(new ot(n, s)), t;
  }
}
class Cn extends We {
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
    if ([e, t] = Zi(this, e, t), n.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, n), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new Cn(c, this.length - (t - e) + n.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, n);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = Zi(this, e, t);
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
    if (!(e instanceof Cn))
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
      return new ot(f, t);
    }
    let s = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function d(f) {
      let m;
      if (f.lines > o && f instanceof Cn)
        for (let y of f.children)
          d(y);
      else f.lines > r && (a > r || !a) ? (h(), l.push(f)) : f instanceof ot && a && (m = c[c.length - 1]) instanceof ot && f.lines + m.lines <= 32 ? (a += f.lines, u += f.length + 1, c[c.length - 1] = new ot(m.text.concat(f.text), m.length + 1 + f.length)) : (a + f.lines > s && h(), a += f.lines, u += f.length + 1, c.push(f));
    }
    function h() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Cn.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let f of e)
      d(f);
    return h(), l.length == 1 ? l[0] : new Cn(l, t);
  }
}
We.empty = /* @__PURE__ */ new ot([""], 0);
function bm(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function Bo(i, e, t = 0, n = 1e9) {
  for (let s = 0, o = 0, r = !0; o < i.length && s <= n; o++) {
    let l = i[o], a = s + l.length;
    a >= t && (a > n && (l = l.slice(0, n - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function iu(i, e, t) {
  return Bo(i, [""], e, t);
}
class Ts {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof ot ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, s = this.nodes[n], o = this.offsets[n], r = o >> 1, l = s instanceof ot ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof ot) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof ot ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Qc {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Ts(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
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
class eh {
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
}, Ts.prototype[Symbol.iterator] = Qc.prototype[Symbol.iterator] = eh.prototype[Symbol.iterator] = function() {
  return this;
});
class km {
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
function Zi(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function Tt(i, e, t = !0, n = !0) {
  return vm(i, e, t, n);
}
function wm(i) {
  return i >= 56320 && i < 57344;
}
function xm(i) {
  return i >= 55296 && i < 56320;
}
function Sm(i, e) {
  let t = i.charCodeAt(e);
  if (!xm(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return wm(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Cm(i) {
  return i < 65536 ? 1 : 2;
}
const cl = /\r\n?|\n/;
var Vt = /* @__PURE__ */ (function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
})(Vt || (Vt = {}));
class Nn {
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
    hl(this, e, t);
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
    return new Nn(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : th(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : dl(this, e, t);
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
    return new Nn(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Nn(e);
  }
}
class gt extends Nn {
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
    return hl(this, (t, n, s, o, r) => e = e.replace(s, s + (n - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return dl(this, e, t, !0);
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
    return this.empty ? e : e.empty ? this : th(this, e, !0);
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
    return e.empty ? this : dl(this, e, t, !0);
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
    hl(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Nn.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], o = new Ps(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        At(s, c, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        At(t, c, d), d > 0 && ii(n, t, o.text), o.forward(c), l += c;
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
      filtered: Nn.create(s)
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
        let m = f ? typeof f == "string" ? We.of(f.split(n || cl)) : f : We.empty, y = m.length;
        if (d == h && y == 0)
          return;
        d < r && a(), d > r && At(s, d - r, -1), At(s, h - d, y), ii(o, s, m), r = h;
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
function ii(i, e, t) {
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
function hl(i, e, t) {
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
function dl(i, e, t, n = !1) {
  let s = [], o = n ? [] : null, r = new Ps(i), l = new Ps(e);
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
        r.ins >= 0 && a < r.i && r.len <= c && (At(s, 0, r.ins), o && ii(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      At(s, u, a < r.i ? r.ins : 0), o && a < r.i && ii(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? gt.createSet(s, o) : Nn.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function th(i, e, t = !1) {
  let n = [], s = t ? [] : null, o = new Ps(i), r = new Ps(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? gt.createSet(n, s) : Nn.create(n);
    if (o.ins == 0)
      At(n, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      At(n, 0, r.ins, l), s && ii(s, n, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = n.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          At(n, a, c, l), s && c && ii(s, n, r.text);
        } else r.ins == -1 ? (At(n, o.off ? 0 : o.len, a, l), s && ii(s, n, o.textBit(a))) : (At(n, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && ii(s, n, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || n.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class Ps {
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
      return X.range(e, t, void 0, void 0, n);
    let s = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return X.range(this.anchor, s, void 0, void 0, n);
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
    return X.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new ei(e, t, n, s);
  }
}
class X {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : X.create(this.ranges.map((n) => n.map(e, t)), this.mainIndex);
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
    return this.ranges.length == 1 ? this : new X([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return X.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let n = this.ranges.slice();
    return n[t] = e, X.create(n, this.mainIndex);
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
    return new X(e.ranges.map((t) => ei.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new X([X.range(e, t)], 0);
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
        return X.normalized(e.slice(), t);
      n = o.to;
    }
    return new X(e, t);
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
        s <= t && t--, e.splice(--s, 2, o.anchor > o.head ? X.range(a, l) : X.range(l, a));
      }
    }
    return new X(e, t);
  }
}
function nh(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let ta = 0;
class de {
  constructor(e, t, n, s, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = ta++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new de(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : na), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Oo([], this, 0, e);
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
    return new Oo(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Oo(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function na(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class Oo {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = ta++;
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
        if (a && h.docChanged || u && (h.docChanged || h.selection) || fl(d, c)) {
          let f = n(d);
          if (l ? !su(f, d.values[r], s) : !s(f, d.values[r]))
            return d.values[r] = f, 1;
        }
        return 0;
      },
      reconfigure: (d, h) => {
        let f, m = h.config.address[o];
        if (m != null) {
          let y = Ko(h, m);
          if (this.dependencies.every((g) => g instanceof de ? h.facet(g) === d.facet(g) : g instanceof un ? h.field(g, !1) == d.field(g, !1) : !0) || (l ? su(f = n(d), y, s) : s(f = n(d), y)))
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
function su(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function fl(i, e) {
  let t = !1;
  for (let n of e)
    $s(i, n) & 1 && (t = !0);
  return t;
}
function Mm(i, e, t) {
  let n = t.map((a) => i[a.id]), s = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), r = i[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < n.length; c++) {
      let d = Ko(a, n[c]);
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
        $s(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!fl(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = fl(a, n), d = u.config.facets[e.id], h = u.facet(e);
      if (d && !c && na(t, d))
        return a.values[r] = h, 0;
      let f = l(a);
      return e.compare(f, h) ? (a.values[r] = h, 0) : (a.values[r] = f, 1);
    }
  };
}
const no = /* @__PURE__ */ de.define({ static: !0 });
class un {
  constructor(e, t, n, s, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new un(ta++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(no).find((n) => n.field == this);
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
        let o = n.facet(no), r = s.facet(no), l;
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
    return [this, no.of({ field: this, create: e })];
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
const ki = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function ps(i) {
  return (e) => new ih(e, i);
}
const ur = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ ps(ki.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ ps(ki.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ ps(ki.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ ps(ki.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ ps(ki.lowest)
};
class ih {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class cr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new pl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return cr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class pl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Fo {
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
    for (let h of Am(e, t, r))
      h instanceof un ? s.push(h) : (o[h.facet.id] || (o[h.facet.id] = [])).push(h);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let h of s)
      l[h.id] = u.length << 1, u.push((f) => h.slot(f));
    let c = n?.config.facets;
    for (let h in o) {
      let f = o[h], m = f[0].facet, y = c && c[h] || [];
      if (f.every(
        (g) => g.type == 0
        /* Provider.Static */
      ))
        if (l[m.id] = a.length << 1 | 1, na(y, f))
          a.push(n.facet(m));
        else {
          let g = m.combine(f.map((b) => b.value));
          a.push(n && m.compare(g, n.facet(m)) ? n.facet(m) : g);
        }
      else {
        for (let g of f)
          g.type == 0 ? (l[g.id] = a.length << 1 | 1, a.push(g.value)) : (l[g.id] = u.length << 1, u.push((b) => g.dynamicSlot(b)));
        l[m.id] = u.length << 1, u.push((g) => Mm(g, m, f));
      }
    }
    let d = u.map((h) => h(l));
    return new Fo(e, r, d, l, a, o);
  }
}
function Am(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = n[a].indexOf(r);
      u > -1 && n[a].splice(u, 1), r instanceof pl && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof pl) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof ih)
      o(r.inner, r.prec);
    else if (r instanceof un)
      n[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof Oo)
      n[l].push(r), r.facet.extensions && o(r.facet.extensions, ki.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(i, ki.default), n.reduce((r, l) => r.concat(l));
}
function $s(i, e) {
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
function Ko(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const sh = /* @__PURE__ */ de.define(), ml = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), oh = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), rh = /* @__PURE__ */ de.define(), lh = /* @__PURE__ */ de.define(), ah = /* @__PURE__ */ de.define(), uh = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : !1
});
class us {
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
    return new Tm();
  }
}
class Tm {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new us(this, e);
  }
}
class $m {
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
    return new $m(e.map || ((t) => t));
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
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, n && nh(n, t.newLength), o.some((l) => l.type == $t.time) || (this.annotations = o.concat($t.time.of(Date.now())));
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
$t.time = /* @__PURE__ */ us.define();
$t.userEvent = /* @__PURE__ */ us.define();
$t.addToHistory = /* @__PURE__ */ us.define();
$t.remote = /* @__PURE__ */ us.define();
function Dm(i, e) {
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
function ch(i, e, t) {
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
function gl(i, e, t) {
  let n = e.selection, s = Gi(e.annotations);
  return e.userEvent && (s = s.concat($t.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof gt ? e.changes : gt.of(e.changes || [], t, i.facet(oh)),
    selection: n && (n instanceof X ? n : X.single(n.anchor, n.head)),
    effects: Gi(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function hh(i, e, t) {
  let n = gl(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    n = ch(n, gl(i, e[o], r ? n.changes.newLength : i.doc.length), r);
  }
  let s = $t.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return Bm(t ? Lm(s) : s);
}
function Lm(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(rh)) {
    let o = s(i);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : Dm(t, o));
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
  let n = e.facet(lh);
  for (let s = n.length - 1; s >= 0; s--) {
    let o = n[s](i);
    o instanceof $t ? i = o : Array.isArray(o) && o.length == 1 && o[0] instanceof $t ? i = o[0] : i = hh(e, Gi(o), !1);
  }
  return i;
}
function Bm(i) {
  let e = i.startState, t = e.facet(ah), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](i);
    o && Object.keys(o).length && (n = ch(n, gl(e, o, i.changes.newLength), !0));
  }
  return n == i ? i : $t.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const Om = [];
function Gi(i) {
  return i == null ? Om : Array.isArray(i) ? i : [i];
}
var Pn = /* @__PURE__ */ (function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
})(Pn || (Pn = {}));
const Em = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let vl;
try {
  vl = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Im(i) {
  if (vl)
    return vl.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || Em.test(t)))
      return !0;
  }
  return !1;
}
function Rm(i) {
  return (e) => {
    if (!/\S/.test(e))
      return Pn.Space;
    if (Im(e))
      return Pn.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return Pn.Word;
    return Pn.Other;
  };
}
class _e {
  constructor(e, t, n, s, o, r) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      $s(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return $s(this, n), Ko(this, n);
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
    return hh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let l of e.effects)
      l.is(cr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(Xe.reconfigure) ? (t = null, n = l.value) : l.is(Xe.appendConfig) && (t = null, n = Gi(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Fo.resolve(n, s, this), o = new _e(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(ml) ? e.newSelection : e.newSelection.asSingle();
    new _e(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: X.cursor(t.from + e.length, -1)
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
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), o = [n.range], r = Gi(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let h = 0; h < l; h++)
        o[h] = o[h].map(c);
      let d = s.mapDesc(u, !0);
      o.push(a.range.map(d)), s = s.compose(c), r = Xe.mapEffects(r, c).concat(Xe.mapEffects(Gi(a.effects), d));
    }
    return {
      changes: s,
      selection: X.create(o, t.mainIndex),
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
    return We.of(e.split(this.facet(_e.lineSeparator) || cl));
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
    return t == null ? e.default : ($s(this, t), Ko(this, t));
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
        s instanceof un && this.config.address[s.id] != null && (t[n] = s.spec.toJSON(this.field(e[n]), this));
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
      selection: X.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Fo.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof We ? e.doc : We.of((e.doc || "").split(t.staticFacet(_e.lineSeparator) || cl)), s = e.selection ? e.selection instanceof X ? e.selection : X.single(e.selection.anchor, e.selection.head) : X.single(0);
    return nh(s, n.length), t.staticFacet(ml) || (s = s.asSingle()), new _e(t, n, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
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
    return this.facet(uh);
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
    for (let o of this.facet(sh))
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
    return Rm(t.length ? t[0] : "");
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
      if (o(t.slice(a, r)) != Pn.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = Tt(t, l);
      if (o(t.slice(l, a)) != Pn.Word)
        break;
      l = a;
    }
    return r == l ? null : X.range(r + n, l + n);
  }
}
_e.allowMultipleSelections = ml;
_e.tabSize = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : 4
});
_e.lineSeparator = oh;
_e.readOnly = uh;
_e.phrases = /* @__PURE__ */ de.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
_e.languageData = sh;
_e.changeFilter = rh;
_e.transactionFilter = lh;
_e.transactionExtender = ah;
cr.reconfigure = /* @__PURE__ */ Xe.define();
function hr(i, e, t = {}) {
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
class Ti {
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
    return yl.create(e, t, this);
  }
}
Ti.prototype.startSide = Ti.prototype.endSide = 0;
Ti.prototype.point = !1;
Ti.prototype.mapMode = Vt.TrackDel;
function ia(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let yl = class dh {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new dh(e, t, n);
  }
};
function bl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class sa {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return Vi(this.to);
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
      let h = this.value[d], f = this.from[d] + e, m = this.to[d] + e, y, g;
      if (f == m) {
        let b = t.mapPos(f, h.startSide, h.mapMode);
        if (b == null || (y = g = b, h.startSide != h.endSide && (g = t.mapPos(f, h.endSide), g < y)))
          continue;
      } else if (y = t.mapPos(f, h.startSide), g = t.mapPos(m, h.endSide), y > g || y == g && h.startSide > 0 && h.endSide <= 0)
        continue;
      if (!((g - y || h.endSide - h.startSide) < 0))
        if (u < 0 && (u = y), h.point && (c = Math.max(c, g - y)), (y - n || h.startSide - s) >= 0)
          r.push(h), l.push(y - u), a.push(g - u), n = g, s = h.endSide;
        else {
          if (y == g)
            for (let b = r.length; b > 0; b--) {
              if ((y - (a[b - 1] + u) || h.startSide - r[b - 1].endSide) >= 0) {
                r.splice(b, 0, h), l.splice(b, 0, y - u), a.splice(b, 0, g - u);
                continue e;
              }
              if ((y - (l[b - 1] + u) || h.endSide - r[b - 1].startSide) > 0)
                break;
            }
          o(y, g, h);
        }
    }
    return { mapped: r.length ? new sa(l, a, r, c) : null, pos: u };
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
    if (n && (t = t.slice().sort(bl)), this.isEmpty)
      return t.length ? Pe.of(t) : this;
    let l = new fh(this, null, -1).goto(0), a = 0, u = [], c = new Ci();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        c.addInner(d.from, d.to, d.value, !1) || u.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(yl.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Pe.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], s = -1, o, r = (a, u, c) => {
      o || (o = new Ci()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], d = e.touchesRange(u, u + c.length);
      if (d === !1)
        s = Math.max(s, c.maxPoint), t.push(c), n.push(e.mapPos(u));
      else if (d === !0) {
        let [h, f] = t.length ? [Vi(n) + Vi(t).length, Vi(Vi(t).value).endSide] : [-1, -1], { mapped: m, pos: y } = c.map(u, e, h, f, r);
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
    return Ns.from([this]).goto(e);
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
    return Ns.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, o = -1) {
    let r = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = ou(r, l, n), u = new ms(r, a, o), c = new ms(l, a, o);
    n.iterGaps((d, h, f) => ru(u, d, c, h, f, s)), n.empty && n.length == 0 && ru(u, 0, c, 0, 0, s);
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
    let l = ou(o, r), a = new ms(o, l, 0).goto(n), u = new ms(r, l, 0).goto(n);
    for (; ; ) {
      if (a.to != u.to || !kl(a.active, u.active) || a.point && (!u.point || !ia(a.point, u.point)))
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
    let r = new ms(e, null, o).goto(t), l = t, a = r.openStart;
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
    let n = new Ci();
    for (let s of e instanceof yl ? [e] : t ? Pm(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Pe.empty;
    let t = Vi(e);
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != Pe.empty; s = s.nextLayer)
        t = new Pe(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Pe.empty = /* @__PURE__ */ new Pe([], [], null, -1);
function Vi(i) {
  return i[i.length - 1];
}
function Pm(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (bl(e, n) > 0)
        return i.slice().sort(bl);
      e = n;
    }
  return i;
}
Pe.empty.nextLayer = Pe.empty;
class Ci {
  finishChunk(e) {
    this.chunks.push(new sa(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
    this.addInner(e, t, n, s) || (this.nextLayer || (this.nextLayer = new Ci())).addRange(e, t, n, s);
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
function ou(i, e, t) {
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
class fh {
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
class Ns {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= n && s.push(new fh(r, t, n, o));
    return s.length == 1 ? s[0] : new Ns(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Nr(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Nr(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Nr(this.heap, 0);
    }
  }
}
function Nr(i, e) {
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
class ms {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Ns.from(e, t, n);
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
    io(this.active, e), io(this.activeTo, e), io(this.activeRank, e), this.minActive = lu(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    so(this.active, t, n), so(this.activeTo, t, s), so(this.activeRank, t, o), e && so(e, t, this.cursor.from), this.minActive = lu(this.active, this.activeTo);
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
        this.removeActive(s), n && io(n, s);
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
function ru(i, e, t, n, s, o) {
  i.goto(e), t.goto(n);
  let r = n + s, l = n, a = n - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let d = i.to + a - t.to, h = d || i.endSide - t.endSide, f = h < 0 ? i.to + a : t.to, m = Math.min(f, r);
    if (i.point || t.point ? (i.point && t.point && ia(i.point, t.point) && kl(i.activeForPoint(i.to), t.activeForPoint(t.to)) || o.comparePoint(l, m, i.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), m > l && !kl(i.active, t.active) && o.compareRange(l, m, i.active, t.active), u && m < r && (d || i.openEnd(f) != t.openEnd(f)) && (c = !0)), f > r)
      break;
    l = f, h <= 0 && i.next(), h >= 0 && t.next();
  }
}
function kl(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !ia(i[t], e[t]))
      return !1;
  return !0;
}
function io(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function so(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function lu(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function dr(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = Tt(i, s));
  return n;
}
function Nm(i, e, t, n) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == i.length)
      break;
    o += i.charCodeAt(s) == 9 ? t - o % t : 1, s = Tt(i, s);
  }
  return i.length;
}
const wl = "ͼ", au = typeof Symbol > "u" ? "__" + wl : Symbol.for(wl), xl = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), uu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
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
            f.split(/,\s*/).map((y) => r.map((g) => y.replace(/&/, g))).reduce((y, g) => y.concat(g)),
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
    let e = uu[au] || 1;
    return uu[au] = e + 1, wl + e.toString(36);
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
    let s = e[xl], o = n && n.nonce;
    s ? o && s.setNonce(o) : s = new Vm(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let cu = /* @__PURE__ */ new Map();
class Vm {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = cu.get(n);
      if (o) return e[xl] = o;
      this.sheet = new s.CSSStyleSheet(), cu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[xl] = this;
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
}, Vs = {
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
}, Hm = typeof navigator < "u" && /Mac/.test(navigator.platform), zm = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var kt = 0; kt < 10; kt++) li[48 + kt] = li[96 + kt] = String(kt);
for (var kt = 1; kt <= 24; kt++) li[kt + 111] = "F" + kt;
for (var kt = 65; kt <= 90; kt++)
  li[kt] = String.fromCharCode(kt + 32), Vs[kt] = String.fromCharCode(kt);
for (var Vr in li) Vs.hasOwnProperty(Vr) || (Vs[Vr] = li[Vr]);
function Wm(i) {
  var e = Hm && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || zm && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? Vs : li)[i.keyCode] || i.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function Mn() {
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
  for (; e < arguments.length; e++) ph(i, arguments[e]);
  return i;
}
function ph(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) ph(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let Bt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Sl = typeof document < "u" ? document : { documentElement: { style: {} } };
const Cl = /* @__PURE__ */ /Edge\/(\d+)/.exec(Bt.userAgent), mh = /* @__PURE__ */ /MSIE \d/.test(Bt.userAgent), Ml = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Bt.userAgent), fr = !!(mh || Ml || Cl), hu = !fr && /* @__PURE__ */ /gecko\/(\d+)/i.test(Bt.userAgent), Hr = !fr && /* @__PURE__ */ /Chrome\/(\d+)/.exec(Bt.userAgent), du = "webkitFontSmoothing" in Sl.documentElement.style, Al = !fr && /* @__PURE__ */ /Apple Computer/.test(Bt.vendor), fu = Al && (/* @__PURE__ */ /Mobile\/\w+/.test(Bt.userAgent) || Bt.maxTouchPoints > 2);
var oe = {
  mac: fu || /* @__PURE__ */ /Mac/.test(Bt.platform),
  windows: /* @__PURE__ */ /Win/.test(Bt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(Bt.platform),
  ie: fr,
  ie_version: mh ? Sl.documentMode || 6 : Ml ? +Ml[1] : Cl ? +Cl[1] : 0,
  gecko: hu,
  gecko_version: hu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  chrome: !!Hr,
  chrome_version: Hr ? +Hr[1] : 0,
  ios: fu,
  android: /* @__PURE__ */ /Android\b/.test(Bt.userAgent),
  webkit: du,
  webkit_version: du ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  safari: Al,
  safari_version: Al ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(Bt.userAgent) || [0, 0])[1] : 0,
  tabSize: Sl.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function oa(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const _o = /* @__PURE__ */ Object.create(null);
function ra(i, e, t) {
  if (i == e)
    return !0;
  i || (i = _o), e || (e = _o);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (s.indexOf(o) == -1 || i[o] !== e[o]))
      return !1;
  return !0;
}
function Fm(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function pu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function Km(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class Ys {
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
class Ze extends Ti {
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
    return new Xs(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new $i(e, t, t, n, e.widget || null, !1);
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
      let { start: o, end: r } = gh(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new $i(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Js(e);
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
class Xs extends Ze {
  constructor(e) {
    let { start: t, end: n } = gh(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? oa(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || _o;
  }
  eq(e) {
    return this == e || e instanceof Xs && this.tagName == e.tagName && ra(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Xs.prototype.point = !1;
class Js extends Ze {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Js && this.spec.class == e.spec.class && ra(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Js.prototype.mapMode = Vt.TrackBefore;
Js.prototype.point = !0;
class $i extends Ze {
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
    return e instanceof $i && _m(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
$i.prototype.point = !0;
function gh(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function _m(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function ji(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Hs extends Ti {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof Hs && this.tagName == e.tagName && ra(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Hs(e.tagName, e.attributes || _o, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Pe.of(e, t);
  }
}
Hs.prototype.startSide = Hs.prototype.endSide = -1;
function zs(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Tl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Ds(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Tl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function Eo(i) {
  return i.nodeType == 3 ? Ws(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Ls(i, e, t, n) {
  return t ? mu(i, e, t, n, -1) || mu(i, e, t, n, 1) : !1;
}
function ai(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function Uo(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function mu(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : zn(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let o = i.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ai(i) + (s < 0 ? 0 : 1), i = o;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? zn(i) : 0;
    } else
      return !1;
  }
}
function zn(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function Go(i, e) {
  let { left: t, right: n } = i;
  if (t == n)
    return i;
  let s = e ? t : n;
  return { left: s, right: s, top: i.top, bottom: i.bottom };
}
function Um(i) {
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
function vh(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function Gm(i, e, t, n, s, o, r, l) {
  let a = i.ownerDocument, u = a.defaultView || window;
  for (let c = i, d = !1; c && !d; )
    if (c.nodeType == 1) {
      let h, f = c == a.body, m = 1, y = 1;
      if (f)
        h = Um(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (d = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let T = c.getBoundingClientRect();
        ({ scaleX: m, scaleY: y } = vh(c, T)), h = {
          left: T.left,
          right: T.left + c.clientWidth * m,
          top: T.top,
          bottom: T.top + c.clientHeight * y
        };
      }
      let g = 0, b = 0;
      if (s == "nearest")
        e.top < h.top + r ? (b = e.top - (h.top + r), t > 0 && e.bottom > h.bottom + b && (b = e.bottom - h.bottom + r)) : e.bottom > h.bottom - r && (b = e.bottom - h.bottom + r, t < 0 && e.top - b < h.top && (b = e.top - (h.top + r)));
      else {
        let T = e.bottom - e.top, $ = h.bottom - h.top;
        b = (s == "center" && T <= $ ? e.top + T / 2 - $ / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - $ + r) - h.top;
      }
      if (n == "nearest" ? e.left < h.left + o ? (g = e.left - (h.left + o), t > 0 && e.right > h.right + g && (g = e.right - h.right + o)) : e.right > h.right - o && (g = e.right - h.right + o, t < 0 && e.left < h.left + g && (g = e.left - (h.left + o))) : g = (n == "center" ? e.left + (e.right - e.left) / 2 - (h.right - h.left) / 2 : n == "start" == l ? e.left - o : e.right - (h.right - h.left) + o) - h.left, g || b)
        if (f)
          u.scrollBy(g, b);
        else {
          let T = 0, $ = 0;
          if (b) {
            let P = c.scrollTop;
            c.scrollTop += b / y, $ = (c.scrollTop - P) * y;
          }
          if (g) {
            let P = c.scrollLeft;
            c.scrollLeft += g / m, T = (c.scrollLeft - P) * m;
          }
          e = {
            left: e.left - T,
            top: e.top - $,
            right: e.right - T,
            bottom: e.bottom - $
          }, T && Math.abs(T - g) < 1 && (n = "nearest"), $ && Math.abs($ - b) < 1 && (s = "nearest");
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
function yh(i, e = !0) {
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
class jm {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? zn(t) : 0), n, Math.min(e.focusOffset, n ? zn(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
function bh(i) {
  let e = [];
  for (let t = i; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function kh(i, e = !0) {
  for (let { node: t, left: n, top: s } of i)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != n && (t.scrollLeft = n);
}
let yi = null;
oe.safari && oe.safari_version >= 26 && (yi = !1);
function wh(i) {
  if (i.setActive)
    return i.setActive();
  if (yi)
    return i.focus(yi);
  let e = bh(i);
  i.focus(yi == null ? {
    get preventScroll() {
      return yi = { preventScroll: !0 }, !0;
    }
  } : void 0), yi || (yi = !1, kh(e));
}
let gu;
function Ws(i, e, t = e) {
  let n = gu || (gu = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function qi(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, i.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, i.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function qm(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function Ym(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, zn(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = zn(t));
    } else {
      if (t == i)
        return !0;
      n = ai(t), t = t.parentNode;
    }
}
function xh(i) {
  return i instanceof Window ? i.pageYOffset > Math.max(0, i.document.documentElement.scrollHeight - i.innerHeight - 4) : i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function Sh(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = zn(t);
    } else if (t.parentNode && !Uo(t))
      n = ai(t), t = t.parentNode;
    else
      return null;
  }
}
function Ch(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !Uo(t))
      n = ai(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class sn {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new sn(e.parentNode, ai(e), t);
  }
  static after(e, t) {
    return new sn(e.parentNode, ai(e) + 1, t);
  }
}
var Je = /* @__PURE__ */ (function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
})(Je || (Je = {}));
const Di = Je.LTR, la = Je.RTL;
function Mh(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const Xm = /* @__PURE__ */ Mh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), Jm = /* @__PURE__ */ Mh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), $l = /* @__PURE__ */ Object.create(null), gn = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  $l[e] = t, $l[t] = -e;
}
function Ah(i) {
  return i <= 247 ? Xm[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? Jm[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const Zm = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Tn {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? la : Di;
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
function Th(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !Th(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const qe = [];
function Qm(i, e, t, n, s) {
  for (let o = 0; o <= n.length; o++) {
    let r = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Ah(i.charCodeAt(u));
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
function eg(i, e, t, n, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= n.length; r++) {
    let u = r ? n[r - 1].to : e, c = r < n.length ? n[r].from : t;
    for (let d = u, h, f, m; d < c; d++)
      if (f = $l[h = i.charCodeAt(d)])
        if (f < 0) {
          for (let y = l - 3; y >= 0; y -= 3)
            if (gn[y + 1] == -f) {
              let g = gn[y + 2], b = g & 2 ? s : g & 4 ? g & 1 ? o : s : 0;
              b && (qe[d] = qe[gn[y]] = b), l = y;
              break;
            }
        } else {
          if (gn.length == 189)
            break;
          gn[l++] = d, gn[l++] = h, gn[l++] = a;
        }
      else if ((m = qe[d]) == 2 || m == 1) {
        let y = m == s;
        a = y ? 0 : 1;
        for (let g = l - 3; g >= 0; g -= 3) {
          let b = gn[g + 2];
          if (b & 2)
            break;
          if (y)
            gn[g + 2] |= 2;
          else {
            if (b & 4)
              break;
            gn[g + 2] |= 4;
          }
        }
      }
  }
}
function tg(i, e, t, n) {
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
        for (let m = c, y = s, g = y ? t[y - 1].to : i; m > a; )
          m == g && (m = t[--y].from, g = y ? t[y - 1].to : i), qe[--m] = f;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Dl(i, e, t, n, s, o, r) {
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
            for (let g = y.to, b = u + 1; ; ) {
              if (g == t)
                break e;
              if (b < o.length && o[b].from == g)
                g = o[b++].to;
              else {
                if (qe[g] == l)
                  break e;
                break;
              }
            }
          if (u++, h)
            h.push(y);
          else {
            y.from > a && r.push(new Tn(a, y.from, f));
            let g = y.direction == Di != !(f % 2);
            Ll(i, g ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.to;
          }
          m = y.to;
        } else {
          if (m == t || (c ? qe[m] != l : qe[m] == l))
            break;
          m++;
        }
      h ? Dl(i, a, m, n + 1, s, h, r) : a < m && r.push(new Tn(a, m, f)), a = m;
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
            for (let g = y.from, b = u; ; ) {
              if (g == e)
                break e;
              if (b && o[b - 1].to == g)
                g = o[--b].from;
              else {
                if (qe[g - 1] == l)
                  break e;
                break;
              }
            }
          if (h)
            h.push(y);
          else {
            y.to < a && r.push(new Tn(y.to, a, f));
            let g = y.direction == Di != !(f % 2);
            Ll(i, g ? n + 1 : n, s, y.inner, y.from, y.to, r), a = y.from;
          }
          m = y.from;
        } else {
          if (m == e || (c ? qe[m - 1] != l : qe[m - 1] == l))
            break;
          m--;
        }
      h ? Dl(i, m, a, n + 1, s, h, r) : m < a && r.push(new Tn(m, a, f)), a = m;
    }
}
function Ll(i, e, t, n, s, o, r) {
  let l = e % 2 ? 2 : 1;
  Qm(i, s, o, n, l), eg(i, s, o, n, l), tg(s, o, n, l), Dl(i, s, o, e, t, n, r);
}
function ng(i, e, t) {
  if (!i)
    return [new Tn(0, 0, e == la ? 1 : 0)];
  if (e == Di && !t.length && !Zm.test(i))
    return $h(i.length);
  if (t.length)
    for (; i.length > qe.length; )
      qe[qe.length] = 256;
  let n = [], s = e == Di ? 0 : 1;
  return Ll(i, s, s, t, 0, i.length, n), n;
}
function $h(i) {
  return [new Tn(0, i, 0)];
}
let Dh = "";
function ig(i, e, t, n, s) {
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
    l = Tn.find(e, r, (o = n.bidiLevel) !== null && o !== void 0 ? o : -1, n.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let h = l += s ? 1 : -1;
    if (h < 0 || h >= e.length)
      return null;
    a = e[l = h], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = Tt(i.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Dh = i.text.slice(Math.min(r, c), Math.max(r, c));
  let d = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!d)
      return s ? X.cursor(i.to, 1) : X.cursor(i.from, -1);
    if (d.level + (s ? 0 : 1) < a.level)
      return X.cursor(d.side(!s, t) + i.from, d.forward(s, t) ? 1 : -1, d.level);
  }
  return X.cursor(c + i.from, a.forward(s, t) ? -1 : 1, a.level);
}
function sg(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Ah(i.charCodeAt(n));
    if (s == 1)
      return Di;
    if (s == 2 || s == 4)
      return la;
  }
  return Di;
}
const Lh = /* @__PURE__ */ de.define(), Bh = /* @__PURE__ */ de.define(), Oh = /* @__PURE__ */ de.define(), Eh = /* @__PURE__ */ de.define(), Bl = /* @__PURE__ */ de.define(), Ih = /* @__PURE__ */ de.define(), Rh = /* @__PURE__ */ de.define(), aa = /* @__PURE__ */ de.define(), ua = /* @__PURE__ */ de.define(), Ph = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), Nh = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), Vh = /* @__PURE__ */ de.define();
class Yi {
  constructor(e, t, n, s, o, r = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new Yi(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Yi(X.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const oo = /* @__PURE__ */ Xe.define({ map: (i, e) => i.map(e) }), Hh = /* @__PURE__ */ Xe.define();
function on(i, e, t) {
  let n = i.facet(Eh);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const In = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : !0 });
let og = 0;
const zi = /* @__PURE__ */ de.define({
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
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(zi.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(zi.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: o, decorations: r } = t || {};
    return new _t(og++, e, n, s, (l) => {
      let a = [];
      return r && a.push(pr.of((u) => {
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
class zr {
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
            if (on(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
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
        on(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        on(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const zh = /* @__PURE__ */ de.define(), ca = /* @__PURE__ */ de.define(), pr = /* @__PURE__ */ de.define(), Wh = /* @__PURE__ */ de.define(), ha = /* @__PURE__ */ de.define(), Zs = /* @__PURE__ */ de.define(), Fh = /* @__PURE__ */ de.define();
function vu(i, e) {
  let t = i.state.facet(Fh);
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
        if (f == null && (f = sg(e.text, u, c)), a > 0 && d.length && (m = d[d.length - 1]).to == u && m.direction == f)
          m.to = c, d = m.inner;
        else {
          let y = { from: u, to: c, direction: f, inner: [] };
          d.push(y), d = y.inner;
        }
      }
    }
  }), s;
}
const Kh = /* @__PURE__ */ de.define();
function da(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let o of i.state.facet(Kh)) {
    let r = o(i);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (n = Math.max(n, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const xs = /* @__PURE__ */ de.define();
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
class jo {
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
    return new jo(e, t, n);
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
const rg = [];
class it {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return rg;
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
      t && Fm(this.dom, t);
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
    return new sn(this.parent.dom, n + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof gr)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class mr extends it {
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
          s = yu(s);
      else
        t.insertBefore(l.dom, s);
      n = l.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = yu(s);
    this.length = r;
  }
}
function yu(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class gr extends mr {
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
        if (r instanceof Vn)
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
class Vn extends mr {
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
    let n = new Vn(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Qi extends mr {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new Qi(t || document.createElement("div"), e);
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
        y >= d && (m.isComposite() ? a(m, d - f) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || n && ag(r, m))) && (y > d || m.flags & 32 && t <= 1) ? (r = m, l = d - f) : (f < d || m.flags & 16 && !m.isHidden && t >= -1) && (s = m, o = d - f)), f = y;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, n) : lg(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: s, offset: o } = n;
      if (this.dom.contains(s.dom))
        return s.isText() ? new sn(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = n.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new sn(a.dom, 0);
        a == n.tile && (l = !0);
      }
    }
    return new sn(this.dom, 0);
  }
}
function lg(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = Eo(e);
  return t[t.length - 1] || null;
}
function ag(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Ht extends mr {
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
class xi extends it {
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
    let a = Ws(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return oe.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), n == null ? u : Go(u, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new xi(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class Li extends it {
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
      return Go(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return Go(r, !l);
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
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Li(o, n, e, s);
  }
}
class qo extends it {
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
    return n == null ? s : Go(s, t > 0 == n);
  }
}
class ug {
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
class cg {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class hg {
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
      let a = r.children[r.children.length - 1] = new xi(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || xi.of(e, (o = this.cache.find(xi)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Wr(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof Ht && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Wr(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && it.get(a.dom) && (c = Wr(a.dom));
        let d = Ht.of(a.mark, c);
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
    let r = new xi(e.text, e.text.nodeValue);
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
    e || (e = _h);
    let s = Qi.start(e, t || ((n = this.cache.find(Qi)) === null || n === void 0 ? void 0 : n.dom), !!t);
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
      (!e || !bu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(oe.ios && bu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        Fr,
        0,
        32
        /* TileFlag.After */
      ) || new Li(
        Fr.toDOM(),
        0,
        Fr,
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
        let t = e.rank * 102 + e.value.rank, n = new cg(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      if (n.from < this.pos && s instanceof Vn && s.wrapper.eq(n.wrapper))
        t = s;
      else {
        let o = Vn.of(n.wrapper, (e = this.cache.find(Vn, (r) => r.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
      qo,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new qo(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class dg {
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
const Yo = [Li, Qi, xi, Ht, qo, Vn, gr];
for (let i = 0; i < Yo.length; i++)
  Yo[i].bucket = i;
class fg {
  constructor(e) {
    this.view = e, this.buckets = Yo.map(() => []), this.index = Yo.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
          ), new Li(l.dom, t, e, l.flags & -498 | n));
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
class pg {
  constructor(e, t, n, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new fg(e), this.text = new dg(e.state.doc), this.builder = new hg(this.cache, new gr(e, e.contentDOM), Pe.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new ug(t), this.reuseWalker = {
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
    let s = vg(this.old), o = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Li.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof qo)
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
        if (u instanceof $i) {
          if (this.disallowBlockEffectsFor[h]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, d > c.length)
            s.continueWidget(a - l);
          else {
            let f = u.widget || (u.block ? es.block : es.inline), m = mg(u), y = this.cache.findWidget(f, a - l, m) || Li.of(f, this.view, a - l, m);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(y)) : (s.ensureLine(n), s.addInlineWidget(y, c, d));
          }
          n = null;
        } else
          n = gg(n, u);
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
      o instanceof Ht ? t.push(o) : o?.isLine() ? n = o : o instanceof Vn || (s.nodeName == "DIV" && !n ? n = new Qi(s, _h) : n || t.push(Ht.of(new Xs({ tagName: s.nodeName.toLowerCase(), attributes: Km(s) }), s)));
    }
    return n ? { line: n, marks: t } : null;
  }
}
function bu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function mg(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const _h = { class: "cm-line" };
function gg(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && oa(t, i), n && (i.class += " " + n)), i;
}
function vg(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Ht && e.push(n.mark);
  }
  return e;
}
function Wr(i) {
  let e = it.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class es extends Ys {
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
es.inline = /* @__PURE__ */ new es("span");
es.block = /* @__PURE__ */ new es("div");
const Fr = /* @__PURE__ */ new class extends Ys {
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
class ku {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Ze.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new gr(e, e.contentDOM), this.updateInner([new Xt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: d }) => d < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Ag(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? bg(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: d } = this.hasComposition;
      n = new Xt(c, d, e.changes.mapPos(c, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (oe.ie || oe.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = xg(r, this.decorations, e.changes);
    a.length && (n = Xt.extendWithRanges(n, a));
    let u = Cg(l, this.blockWrappers, e.changes);
    return u.length && (n = Xt.extendWithRanges(n, u)), o && !n.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new pg(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && it.get(t.text) && l.cache.reused.set(
          it.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), Ol(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = oe.chrome || oe.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Kr && s.push(o.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(Hh) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, o = s == n, r = !o && !(this.view.state.facet(In) || n.tabIndex > -1) && Ds(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), oe.gecko && a.empty && !this.hasComposition && yg(u)) {
      let h = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(h, u.node.childNodes[u.offset] || null)), u = c = new sn(h, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Ls(u.node, u.offset, d.anchorNode, d.anchorOffset) || !Ls(c.node, c.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      oe.android && oe.chrome && n.contains(d.focusNode) && Mg(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let h = zs(this.view.root);
      if (h) if (a.empty) {
        if (oe.gecko) {
          let f = kg(u.node, u.offset);
          if (f && f != 3) {
            let m = (f == 1 ? Sh : Ch)(u.node, u.offset);
            m && (u = new sn(m.node, m.offset));
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
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new sn(d.anchorNode, d.anchorOffset), this.impreciseHead = c.precise ? null : new sn(d.focusNode, d.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Ls(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = zs(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = zn(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
    return s.isWidget() ? s.widget instanceof Kr ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, n);
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
        let a = Ws(o.dom, r, l).getClientRects();
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
        let y = d.children[m], g = h + y.length, b = y.dom.getBoundingClientRect(), { height: T } = b;
        if (f && !m && (u += b.top - f.top), y instanceof Vn)
          g > n && c(y, h, b);
        else if (h >= n && (u > 0 && t.push(-u), t.push(T + u), u = 0, r)) {
          let $ = y.dom.lastChild, P = $ ? Eo($) : [];
          if (P.length) {
            let R = P[P.length - 1], V = a ? R.right - b.left : b.right - R.left;
            V > l && (l = V, this.minWidth = o, this.minWidthFrom = h, this.minWidthTo = g);
          }
        }
        f && m == d.children.length - 1 && (u += f.bottom - b.bottom), h = g + y.breakAfter;
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
          let c = Eo(u.dom);
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
      let r = Eo(t.firstChild)[0];
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
          widget: new Kr(l),
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
    let e = 1, t = this.view.state.facet(pr).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, s = this.view.state.facet(ha).map((o, r) => {
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
    this.blockWrappers = this.view.state.facet(Wh).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(Vh))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        on(this.view.state, c, "scroll handler");
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
    let o = da(this.view), r = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (Gm(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Je.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = bh(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), kh(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    Ol(this.tile);
  }
}
function Ol(i, e) {
  let t = e?.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      Ol(n, e);
  }
}
function yg(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function Uh(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = Sh(t.focusNode, t.focusOffset), s = Ch(t.focusNode, t.focusOffset), o = n || s;
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
function bg(i, e, t) {
  let n = Uh(i, t);
  if (!n)
    return null;
  let { node: s, from: o, to: r } = n, l = s.nodeValue;
  if (/[\n\r]/.test(l) || i.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Xt(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function kg(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let wg = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ji(e, t, this.changes);
  }
  comparePoint(e, t) {
    ji(e, t, this.changes);
  }
  boundChange(e) {
    ji(e, e, this.changes);
  }
};
function xg(i, e, t) {
  let n = new wg();
  return Pe.compare(i, e, t, n), n.changes;
}
class Sg {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ji(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    ji(e, e, this.changes);
  }
}
function Cg(i, e, t) {
  let n = new Sg();
  return Pe.compare(i, e, t, n), n.changes;
}
function Mg(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Ag(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Kr extends Ys {
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
function Tg(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return X.cursor(e);
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
  return X.undirectionalRange(r + s.from, l + s.from);
}
function $g(i, e, t, n, s) {
  let o = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let l = i.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (i.defaultLineHeight - l) * 0.5) / l);
    o += a * i.viewState.heightOracle.lineLength;
  }
  let r = i.state.sliceDoc(t.from, t.to);
  return t.from + Nm(r, o, i.state.tabSize);
}
function El(i, e, t) {
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
function Dg(i, e, t, n) {
  let s = El(i, e.head, e.assoc || -1), o = !n || s.type != wt.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = i.dom.getBoundingClientRect(), l = i.textDirectionAt(s.from), a = i.posAtCoords({
      x: t == (l == Je.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return X.cursor(a, t ? -1 : 1);
  }
  return X.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function wu(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), o = i.bidiSpans(s), r = i.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = ig(s, o, r, l, t), c = Dh;
    if (!u) {
      if (s.number == (t ? i.state.doc.lines : 1))
        return l;
      c = `
`, s = i.state.doc.line(s.number + (t ? 1 : -1)), o = i.bidiSpans(s), u = t ? X.cursor(s.from, -1) : X.cursor(s.to, 1);
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
function Lg(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (o) => {
    let r = n(o);
    return s == Pn.Space && (s = r), s == r;
  };
}
function Bg(i, e, t, n) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? i.state.doc.length : 0))
    return X.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = i.contentDOM.getBoundingClientRect(), u = i.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = i.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let m = i.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, i.defaultCharacterWidth * (s - m.from))), l = (o < 0 ? m.top : m.bottom) + c;
  }
  let d = a.left + r, h = i.viewState.heightOracle.textHeight >> 1, f = n ?? h;
  for (let m = 0; ; m += h) {
    let y = l + (f + m) * o, g = Il(i, { x: d, y }, !1, o);
    if (t ? y > a.bottom : y < a.top)
      return X.cursor(g.pos, g.assoc);
    let b = i.coordsAtPos(g.pos, g.assoc), T = b ? (b.top + b.bottom) / 2 : 0;
    if (!b || (t ? T > l : T < l))
      return X.cursor(g.pos, g.assoc, void 0, r);
  }
}
function Bs(i, e, t) {
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
function Gh(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], o = null;
    if (s.empty) {
      let r = Bs(i, s.from, 0);
      r != s.from && (o = X.cursor(r, -1));
    } else {
      let r = Bs(i, s.from, -1), l = Bs(i, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = X.undirectionalRange(s.from, s.to) : o = X.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? X.create(t, e.mainIndex) : e;
}
function _r(i, e, t) {
  let n = Bs(i.state.facet(Zs).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : X.cursor(n, n < t.from ? 1 : -1);
}
class An {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Il(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), o = s.top + i.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new An(0, 1);
    if (a > i.viewState.docHeight)
      return new An(i.state.doc.length, -1);
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
      let d = $g(i, s, u, r, l);
      return new An(d, d == u.from ? 1 : -1);
    }
  }
  if (u.type != wt.Text)
    return a < (u.top + u.bottom) / 2 ? new An(u.from, 1) : new An(u.to, -1);
  let c = i.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = i.docView.lineAt(u.from, -2)), new Og(i, r, l, i.textDirectionAt(u.from)).scanTile(c, u.from);
}
class Og {
  constructor(e, t, n, s) {
    this.view = e, this.x = t, this.y = n, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Tn.find(s, e - n.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Tn.find(s, e - n.from, -1, t)].dir;
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
        for (let T = 1; T < m; T++) {
          let $ = y + T;
          if ($ >= o && ($ -= m), !r.has($)) {
            y = $;
            break t;
          }
        }
        break e;
      }
      r.add(y);
      let g = t(y), b = 0;
      if (g)
        for (let T = 0; T < g.length; T++) {
          let $ = g[T];
          if (!($.width == 0 && g.length > 1))
            if ($.bottom < this.y)
              (!a || a.bottom < $.bottom) && (a = $), b = 1;
            else if ($.top > this.y)
              (!u || u.top > $.top) && (u = $), b = -1;
            else {
              let P = $.left > this.x ? this.x - $.left : $.right < this.x ? this.x - $.right : 0, R = Math.abs(P);
              R < d && (c = y, d = R, h = $), P && (b = P < 0 == (this.baseDir == Je.LTR) ? -1 : 1);
            }
        }
      b == -1 && (!l || this.baseDirAt(e[y], 1)) ? o = y : b == 1 && (!l || this.baseDirAt(e[y + 1], -1)) && (s = y + 1);
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
      return Ws(e.dom, r, l).getClientRects();
    });
    return s.after ? new An(n[s.i + 1], -1) : new An(n[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new An(t, 1);
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : Ws(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = n[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new An(n[s.i + 1], -1) : new An(r, 1);
  }
}
const Hi = "￿";
class Eg {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(_e.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Hi;
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
      (r && a ? r.breakAfter : (r ? r.breakAfter : Uo(s)) || Uo(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !Rg(l, t) && this.lineBreak(), s = l;
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
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (Ig(e, n.node, n.offset) ? t : 0));
  }
}
function Ig(i, e, t) {
  for (; ; ) {
    if (!e || t < zn(e))
      return !1;
    if (e == i)
      return !0;
    t = ai(e) + 1, e = e.parentNode;
  }
}
function Rg(i, e) {
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
class xu {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Pg {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = jh(e.docView.tile, t, n, 0))) {
      let a = o || r ? [] : Vg(e), u = new Eg(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = Hg(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Tl(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Tl(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((oe.ios || oe.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let h = Math.min(u, c), f = Math.max(u, c), m = d.from - h, y = d.to - f;
        (m == 0 || m == 1 || h == 0) && (y == 0 || y == -1 || f == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(X.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let h = e.coordsAtPos(u, -1), f = 0;
        h && (f = e.inputState.lastTouchY <= h.bottom ? -1 : 1), this.newSel = X.create([X.cursor(u, f)]);
      } else
        this.newSel = X.single(c, u);
    }
  }
}
function jh(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = n, c = n; a < i.children.length; a++) {
      let d = i.children[a], h = u + d.length;
      if (u < e && h > t)
        return jh(d, e, t, u);
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
function qh(i, e) {
  let t, { newSel: n } = e, { state: s } = i, o = s.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || oe.android && e.text.length < a - l) && (u = o.to, c = "end");
    let d = s.doc.sliceString(l, a, Hi), h, f;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(h = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: We.of(e.text.slice(o.from - l, h).split(Hi))
    } : (f = Yh(d, e.text, u - l, c)) && (oe.chrome && r == 13 && f.toB == f.from + 2 && e.text.slice(f.from, f.toB) == Hi + Hi && f.toB--, t = {
      from: l + f.from,
      to: l + f.toA,
      insert: We.of(e.text.slice(f.from, f.toB).split(Hi))
    });
  } else n && (!i.hasFocus && s.facet(In) || Xo(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((oe.mac || oe.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = X.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: We.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && i.docView.lineHasWidget(o.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(i.inputState.insertingText)
  } : oe.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = X.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: We.of([" "]) }), t)
    return fa(i, t, n, r);
  if (n && !Xo(n, o)) {
    let l = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (l = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = Gh(s.facet(Zs).map((u) => u(i)), n))), i.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function fa(i, e, t, n = -1) {
  if (oe.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (oe.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && qi(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && qi(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && qi(i.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let r, l = () => r || (r = Ng(i, e, t));
  return i.state.facet(Ih).some((a) => a(i, e.from, e.to, o, l)) || i.dispatch(l()), !0;
}
function Ng(i, e, t) {
  let n, s = i.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Bs(s.facet(Zs).map((d) => d(i)), u, a);
    e.from == c && (r = c);
  }
  if (r > -1)
    n = {
      changes: e,
      selection: X.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && i.inputState.composing < 0) {
    let a = o.from < e.from ? s.sliceDoc(o.from, e.from) : "", u = o.to > e.to ? s.sliceDoc(e.to, o.to) : "";
    n = s.replaceSelection(i.state.toText(a + e.insert.sliceString(0, void 0, i.state.lineBreak) + u));
  } else {
    let a = s.changes(e), u = t && t.main.to <= a.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (i.inputState.composing >= 0 || i.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let c = i.state.sliceDoc(e.from, e.to), d, h = t && Uh(i, t.main.head);
      if (h) {
        let m = e.insert.length - (e.to - e.from);
        d = { from: h.from, to: h.to - m };
      } else
        d = i.state.doc.lineAt(o.head);
      let f = o.to - e.to;
      n = s.changeByRange((m) => {
        if (m.from == o.from && m.to == o.to)
          return { changes: a, range: u || m.map(a) };
        let y = m.to - f, g = y - c.length;
        if (i.state.sliceDoc(g, y) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        y >= d.from && g <= d.to)
          return { range: m };
        let b = s.changes({ from: g, to: y, insert: e.insert }), T = m.to - o.to;
        return {
          changes: b,
          range: u ? X.range(Math.max(0, u.anchor + T), Math.max(0, u.head + T)) : m.map(b)
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
function Yh(i, e, t, n) {
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
function Vg(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o } = i.observer.selectionRange;
  return t && (e.push(new xu(t, n)), (s != t || o != n) && e.push(new xu(s, o))), e;
}
function Hg(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t < 0 || n < 0 ? null : t == n ? X.create([X.cursor(n + e, -1)]) : X.single(t + e, n + e);
}
function Xo(i, e) {
  return e.head == i.main.head && e.anchor == i.main.anchor;
}
class zg {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, oe.safari && e.contentDOM.addEventListener("input", () => null), oe.gecko && nv(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !Yg(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = Fg(e), n = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Jh.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), oe.android && oe.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (oe.ios && !e.synthetic && !e.altKey && !e.metaKey && (Xh.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || Kg.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && oe.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && Wg(this.view.win) && (t.shiftKey = !1);
      let n = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == n && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, qi(this.view.contentDOM, t.key, t.keyCode, t.mods));
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
function Wg(i) {
  return i.visualViewport ? i.visualViewport.height * i.visualViewport.scale / i.document.documentElement.clientHeight < 0.85 : !1;
}
function Su(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      on(t.state, s);
    }
  };
}
function Fg(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Su(n.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Su(n.value, a));
      }
  }
  for (let n in an)
    t(n).handlers.push(an[n]);
  for (let n in Et)
    t(n).observers.push(Et[n]);
  return e;
}
const Xh = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Kg = "dthko", Jh = [16, 17, 18, 20, 91, 92, 224, 225], ro = 6;
function lo(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function _g(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class Ug {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = yh(e.contentDOM), this.atoms = e.state.facet(Zs).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(_e.allowMultipleSelections) && Gg(e, t), this.dragging = qg(e, t) && ed(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && _g(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = da(this.view);
    e.clientX - a.left <= s + ro ? t = -lo(s - e.clientX) : e.clientX + a.right >= r - ro && (t = lo(e.clientX - r)), e.clientY - a.top <= o + ro ? n = -lo(o - e.clientY) : e.clientY + a.bottom >= l - ro && (n = lo(e.clientY - l)), this.setScrollSpeed(t, n);
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
    let { view: t } = this, n = Gh(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Gg(i, e) {
  let t = i.state.facet(Lh);
  return t.length ? t[0](e) : oe.mac ? e.metaKey : e.ctrlKey;
}
function jg(i, e) {
  let t = i.state.facet(Bh);
  return t.length ? t[0](e) : oe.mac ? !e.altKey : !e.ctrlKey;
}
function qg(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = zs(i.root);
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
function Yg(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = it.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const an = /* @__PURE__ */ Object.create(null), Et = /* @__PURE__ */ Object.create(null), Zh = oe.ie && oe.ie_version < 15 || oe.ios && oe.webkit_version < 604;
function Xg(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), Qh(i, t.value);
  }, 50);
}
function vr(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function Qh(i, e) {
  e = vr(i.state, aa, e);
  let { state: t } = i, n, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Rl != null && t.selection.ranges.every((a) => a.empty) && Rl == o.toString()) {
    let a = -1;
    n = t.changeByRange((u) => {
      let c = t.doc.lineAt(u.from);
      if (c.from == a)
        return { range: u };
      a = c.from;
      let d = t.toText((r ? o.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: d },
        range: X.cursor(u.from + d.length, -1)
      };
    });
  } else r ? n = t.changeByRange((a) => {
    let u = o.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: u.text },
      range: X.cursor(a.from + u.length, -1)
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
an.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
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
an.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(Oh))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = Zg(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new Ug(i, e, t, n)), n && i.observer.ignore(() => {
      wh(i.contentDOM);
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
function Cu(i, e, t, n) {
  if (n == 1)
    return X.cursor(e, t);
  if (n == 2)
    return Tg(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), o = i.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < i.state.doc.length && l == o.to && l++, X.undirectionalRange(r, l);
  }
}
const Jg = oe.ie && oe.ie_version <= 11;
let Mu = null, Au = 0, Tu = 0;
function ed(i) {
  if (!Jg)
    return i.detail;
  let e = Mu, t = Tu;
  return Mu = i, Tu = Date.now(), Au = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Au + 1) % 3 : 1;
}
function Zg(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = ed(e), s = i.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = i.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Cu(i, a.pos, a.assoc, n);
      if (t.pos != a.pos && !r) {
        let d = Cu(i, t.pos, t.assoc, n), h = Math.min(d.from, c.from), f = Math.max(d.to, c.to);
        c = h < c.from ? X.range(h, f, c.assoc) : X.range(f, h, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && n == 1 && s.ranges.length > 1 && (u = Qg(s, a.pos)) ? u : l ? s.addRange(c) : X.create([c]);
    }
  };
}
function Qg(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return X.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
an.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = X.undirectionalRange(o, r));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", vr(i.state, ua, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
an.dragend = (i) => (i.inputState.draggedContent = null, !1);
function $u(i, e, t, n) {
  if (t = vr(i.state, aa, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = i.inputState, r = n && o && jg(i, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = i.state.changes(r ? [r, l] : l);
  i.focus(), i.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), i.inputState.draggedContent = null;
}
an.drop = (i, e) => {
  if (!e.dataTransfer)
    return !1;
  if (i.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), s = 0, o = () => {
      ++s == t.length && $u(i, e, n.filter((r) => r != null).join(i.state.lineBreak), !1);
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
      return $u(i, e, n, !0), !0;
  }
  return !1;
};
an.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = Zh ? null : e.clipboardData;
  return t ? (Qh(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (Xg(i), !1);
};
function ev(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function tv(i) {
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
  return { text: vr(i, ua, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let Rl = null;
an.copy = an.cut = (i, e) => {
  if (!Ds(i.contentDOM, i.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: s } = tv(i.state);
  if (!t && !s)
    return !1;
  Rl = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = Zh ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (ev(i, t), !1);
};
const td = /* @__PURE__ */ us.define();
function nd(i, e) {
  let t = [];
  for (let n of i.facet(Rh)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: td.of(!0) }) : null;
}
function id(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = nd(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
Et.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), id(i);
};
Et.blur = (i) => {
  i.observer.clearSelectionRange(), id(i);
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
an.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = i.posAtDOM(l.startContainer, l.startOffset), u = i.posAtDOM(l.endContainer, l.endOffset);
      return fa(i, { from: a, to: u, insert: i.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (oe.chrome && oe.android && (s = Xh.find((o) => o.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return oe.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), oe.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => Et.compositionend(i, e), 20), !1;
};
const Du = /* @__PURE__ */ new Set();
function nv(i) {
  Du.has(i) || (Du.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Lu = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let ts = !1;
function Bu() {
  ts = !1;
}
class iv {
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
    return Lu.indexOf(e) > -1 != this.lineWrapping;
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
    let l = Lu.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class sv {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class nn {
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
    return this._content instanceof $i ? this._content.widget : null;
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
    return new nn(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var Ye = /* @__PURE__ */ (function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
})(Ye || (Ye = {}));
const Io = 1e-3;
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
    this.height != e && (Math.abs(this.height - e) > Io && (ts = !0), this.height = e);
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
      let m = pa.build(n.setDoc(r), e, c, d);
      o = Jo(o, o.replace(a, u, m));
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, n++), new rv(Ot.of(e.slice(0, t)), r, Ot.of(e.slice(n)));
  }
}
function Jo(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (ts = !0), e);
}
Ot.prototype.size = 1;
const ov = /* @__PURE__ */ Ze.replace({});
class sd extends Ot {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new nn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new nn(s, 0, n, this.spaceAbove, ov) : this.mainBlock(n, s);
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
class Kt extends sd {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new nn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
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
      return new nn(c.from, c.length, h, d, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - n) / l))), { from: c, length: d } = t.doc.line(o + u);
      return new nn(c, d, n + l * u, l, 0);
    }
  }
  lineAt(e, t, n, s, o) {
    if (t == Ye.ByHeight)
      return this.blockAt(e, n, s, o);
    if (t == Ye.ByPosNoHeight) {
      let { from: f, to: m } = n.doc.lineAt(e);
      return new nn(f, m - f, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(n, o), u = n.doc.lineAt(e), c = l + u.length * a, d = u.number - r, h = s + l * d + a * (u.from - o - d);
    return new nn(u.from, u.length, Math.max(s, Math.min(h, s + this.height - c)), c, 0);
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
      r(new nn(h.from, h.length, d, f, 0)), d += f, c = h.to + 1;
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
        d < 0 && (h = -d, d = s.heights[s.index++]), a == -1 ? a = d : Math.abs(d - a) >= Io && (a = -2);
        let f = new Kt(c, d, h);
        f.outdated = !1, r.push(f), l += c + 1;
      }
      l <= o && r.push(null, new bt(o - l).updateHeight(e, l));
      let u = Ot.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= Io || Math.abs(a - this.heightMetrics(e, t).perLine) >= Io) && (ts = !0), Jo(this, u);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class rv extends Ot {
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
    if (e > 0 && Ou(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), Ou(o, l);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? Ot.of(this.break ? [e, null, t] : [e, t]) : (this.left = Jo(this.left, e), this.right = Jo(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, n, s) : o.updateHeight(e, t, n), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, n, s) : r.updateHeight(e, l, n), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function Ou(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof bt && (n = i[e + 1]) instanceof bt && i.splice(e - 1, 3, new bt(t.length + 1 + n.length));
}
const lv = 5;
class pa {
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
      n.block ? this.addBlock(new sd(r, s, n)) : (r || o || s >= lv) && this.addLineDeco(s, o, r);
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
    let o = new pa(n, e);
    return Pe.spans(t, n, s, o, 0), o.finish(n);
  }
}
function av(i, e, t) {
  let n = new uv();
  return Pe.compare(i, e, t, n, 0), n.changes;
}
class uv {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && ji(e, t, this.changes, 5);
  }
}
function cv(i, e) {
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
function hv(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function dv(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Ur {
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
      widget: new fv(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class fv extends Ys {
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
class Eu {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Iu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Je.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(ca).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new iv(n), this.stateDeco = Ru(t), this.heightMap = Ot.empty().applyChanges(this.stateDeco, We.empty, this.heightOracle.setDoc(t.doc), [new Xt(0, 0, 0, t.doc.length)]);
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
        e.push(new ao(o, r));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Iu : new ma(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Ss(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = Ru(this.state);
    let s = e.changedRanges, o = Xt.extendWithRanges(s, av(n, this.stateDeco, e ? e.changes : gt.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Bu(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || ts) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Nh) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? Je.RTL : Je.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: R, scaleY: V } = vh(t, l);
      (R > 5e-3 && Math.abs(this.scaleX - R) > 5e-3 || V > 5e-3 && Math.abs(this.scaleY - V) > 5e-3) && (this.scaleX = R, this.scaleY = V, u |= 16, r = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, h = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != h) && (this.paddingTop = d, this.paddingBottom = h, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let f = yh(this.view.contentDOM, !1).y;
    f != this.scrollParent && (this.scrollParent = f, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let m = this.getScrollOffset();
    this.scrollOffset != m && (this.scrollAnchorHeight = -1, this.scrollOffset = m), this.scrolledToBottom = xh(this.scrollParent || e.win);
    let y = (this.printing ? dv : cv)(t, this.paddingTop), g = y.top - this.pixelViewport.top, b = y.bottom - this.pixelViewport.bottom;
    this.pixelViewport = y;
    let T = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (T != this.inView && (this.inView = T, T && (a = !0)), !this.inView && !this.scrollTarget && !hv(e.dom))
      return 0;
    let $ = l.width;
    if ((this.contentDOMWidth != $ || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let R = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(R) && (r = !0), r || s.lineWrapping && Math.abs($ - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: V, charWidth: O, textHeight: _ } = e.docView.measureTextSize();
        r = V > 0 && s.refresh(o, V, O, _, Math.max(5, $ / O), R), r && (e.docView.minWidth = 0, u |= 16);
      }
      g > 0 && b > 0 ? c = Math.max(g, b) : g < 0 && b < 0 && (c = Math.min(g, b)), Bu();
      for (let V of this.viewports) {
        let O = V.from == this.viewport.from ? R : e.docView.measureVisibleLineHeights(V);
        this.heightMap = (r ? Ot.empty().applyChanges(this.stateDeco, We.empty, this.heightOracle, [new Xt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new sv(V.from, O));
      }
      ts && (u |= 2);
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
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new ao(s.lineAt(r - n * 1e3, Ye.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - n) * 1e3, Ye.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = s.lineAt(u, Ye.ByPos, o, 0, 0), h;
        t.y == "center" ? h = (d.top + d.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? h = d.top : h = d.bottom - c, a = new ao(s.lineAt(h - 1e3 / 2, Ye.ByHeight, o, 0, 0).from, s.lineAt(h + c + 1e3 / 2, Ye.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new ao(this.heightMap.lineAt(n, Ye.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, Ye.ByPos, this.heightOracle, 0, 0).to);
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
      t.touchesRange(s.from, s.to) || n.push(new Ur(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
      for (let b of y)
        if (b > c && b < d) {
          a(c, b - 10, h, f), a(b + 10, d, h, f);
          return;
        }
      let g = mv(e, (b) => b.from >= h.from && b.to <= h.to && Math.abs(b.from - c) < o && Math.abs(b.to - d) < o && !y.some((T) => b.from < T && b.to > T));
      if (!g) {
        if (d < h.to && t && n && t.visibleRanges.some(($) => $.from <= d && $.to >= d)) {
          let $ = t.moveToLineBoundary(X.cursor(d), !1, !0).head;
          $ > c && (d = $);
        }
        let b = this.gapSize(h, c, d, f), T = n || b < 2e6 ? b : 2e6;
        g = new Ur(c, d, b, T);
      }
      l.push(g);
    }, u = (c) => {
      if (c.length < r || c.type != wt.Text)
        return;
      let d = pv(c.from, c.to, this.stateDeco);
      if (d.total < r)
        return;
      let h = this.scrollTarget ? this.scrollTarget.range.head : null, f, m;
      if (n) {
        let y = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, g, b;
        if (h != null) {
          let T = co(d, h), $ = ((this.visibleBottom - this.visibleTop) / 2 + y) / c.height;
          g = T - $, b = T + $;
        } else
          g = (this.visibleTop - c.top - y) / c.height, b = (this.visibleBottom - c.top + y) / c.height;
        f = uo(d, g), m = uo(d, b);
      } else {
        let y = d.total * this.heightOracle.charWidth, g = s * this.heightOracle.charWidth, b = 0;
        if (y > 2e6)
          for (let V of e)
            V.from >= c.from && V.from < c.to && V.size != V.displaySize && V.from * this.heightOracle.charWidth + b < this.pixelViewport.left && (b = V.size - V.displaySize);
        let T = this.pixelViewport.left + b, $ = this.pixelViewport.right + b, P, R;
        if (h != null) {
          let V = co(d, h), O = (($ - T) / 2 + g) / y;
          P = V - O, R = V + O;
        } else
          P = (T - g) / y, R = ($ + g) / y;
        f = uo(d, P), m = uo(d, R);
      }
      f > c.from && a(c.from, f, c, d), m < c.to && a(m, c.to, c, d);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, n, s) {
    let o = co(s, n) - co(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    Ur.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Ze.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Ss(this.heightMap.lineAt(e, Ye.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Ss(this.heightMap.lineAt(this.scaler.fromDOM(e), Ye.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Ss(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class ao {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function pv(i, e, t) {
  let n = [], s = i, o = 0;
  return Pe.spans(t, i, e, {
    span() {
    },
    point(r, l) {
      r > s && (n.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), o += e - s), { total: o, ranges: n };
}
function uo({ total: i, ranges: e }, t) {
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
function co(i, e) {
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
function mv(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const Iu = {
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
function Ru(i) {
  let e = i.facet(pr).filter((n) => typeof n != "function"), t = i.facet(ha).filter((n) => typeof n != "function");
  return t.length && e.push(Pe.join(t)), e;
}
class ma {
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
    return e instanceof ma ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Ss(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new nn(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Ss(s, e)) : i._content);
}
const ho = /* @__PURE__ */ de.define({ combine: (i) => i.join(" ") }), Pl = /* @__PURE__ */ de.define({ combine: (i) => i.indexOf(!0) > -1 }), Nl = /* @__PURE__ */ ri.newName(), od = /* @__PURE__ */ ri.newName(), rd = /* @__PURE__ */ ri.newName(), ld = { "&light": "." + od, "&dark": "." + rd };
function Vl(i, e, t) {
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
const gv = /* @__PURE__ */ Vl("." + Nl, {
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
}, ld), vv = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Gr = oe.ie && oe.ie_version <= 11;
class yv {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new jm(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (oe.ie && oe.ie_version <= 11 || oe.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && oe.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(oe.chrome && oe.chrome_version < 126) && (this.editContext = new kv(e), e.state.facet(In) && (e.contentDOM.editContext = this.editContext.editContext)), Gr && (this.onCharData = (t) => {
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
    if (n.state.facet(In) ? n.root.activeElement != this.dom : !Ds(this.dom, s))
      return;
    let o = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (oe.ie && oe.ie_version <= 11 || oe.android && oe.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Ls(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = zs(e.root);
    if (!t)
      return !1;
    let n = oe.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && bv(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = Ds(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && Ym(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, vv), Gr && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), Gr && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && qi(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && Ds(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Pg(this.view, e, t, n);
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
    let n = this.view.state, s = qh(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !Xo(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = Pu(t, e.previousSibling || e.target.previousSibling, -1), s = Pu(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(In) != e.state.facet(In) && (e.view.contentDOM.editContext = e.state.facet(In) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Pu(i, e, t) {
  for (; e; ) {
    let n = it.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Nu(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, o = e.endOffset, r = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Ls(r.node, r.offset, s, o) && ([t, n, s, o] = [s, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o };
}
function bv(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return Nu(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? Nu(i, t) : null;
}
class kv {
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
      let c = Yh(e.state.sliceDoc(l, a), n.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let h = X.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        Xo(h, s) || e.dispatch({ selection: h, userEvent: "select" });
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
        fa(e, d, X.single(this.toEditorPos(n.selectionStart, h), this.toEditorPos(n.selectionEnd, h)));
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
      e.dispatch({ effects: Hh.of(Ze.set(s)) });
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
      let s = zs(n.root);
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
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((o) => n(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || qm(e.parent) || document, this.viewState = new Eu(this, e.state || _e.create(e)), e.scrollTo && e.scrollTo.is(oo) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(zi).map((s) => new zr(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new yv(this), this.inputState = new zg(this), this.inputState.ensureHandlers(this.plugins), this.docView = new ku(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
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
    e.some((h) => h.annotation(td)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = nd(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(_e.phrases) != this.state.facet(_e.phrases))
      return this.setState(o);
    s = jo.create(this, o, e), s.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let h of e) {
        if (d && (d = d.map(h.changes)), h.scrollIntoView) {
          let { main: f } = h.state.selection, { x: m, y } = this.state.facet(ye.cursorScrollMargin);
          d = new Yi(f.empty ? f : X.cursor(f.head, f.head > f.anchor ? -1 : 1), "nearest", "nearest", y, m);
        }
        for (let f of h.effects)
          f.is(oo) && (d = f.value.clip(this.state));
      }
      this.viewState.update(s, d), this.bidiCache = Zo.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(xs) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((h) => h.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(ho) != s.state.facet(ho) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let h of this.state.facet(Bl))
        try {
          h(s);
        } catch (f) {
          on(this.state, f, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !qh(this, c) && u.force && qi(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new Eu(this, e), this.plugins = e.facet(zi).map((n) => new zr(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new ku(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(zi), n = e.state.facet(zi);
    if (t != n) {
      let s = [];
      for (let o of n) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new zr(o));
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
          on(this.state, n, "doc view update listener");
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
          if (xh(n || this.win))
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
            return on(this.state, y), Vu;
          }
        }), h = jo.create(this, this.state, []), f = !1;
        h.flags |= u, t ? t.flags |= u : t = h, this.updateState = 2, h.empty || (this.updatePlugins(h), this.inputState.update(h), this.updateAttrs(), f = this.docView.update(h), f && this.docViewUpdate());
        for (let m = 0; m < c.length; m++)
          if (d[m] != Vu)
            try {
              let y = c[m];
              y.write && y.write(d[m], this);
            } catch (y) {
              on(this.state, y);
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
      for (let a of this.state.facet(Bl))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return Nl + " " + (this.state.facet(Pl) ? rd : od) + " " + this.state.facet(ho);
  }
  updateAttrs() {
    let e = Hu(this, zh, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(In) ? "true" : "false",
      class: "cm-content",
      style: `${oe.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), Hu(this, ca, t);
    let n = this.observer.ignore(() => {
      let s = pu(this.contentDOM, this.contentAttrs, t), o = pu(this.dom, this.editorAttrs, e);
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
    this.styleModules = this.state.facet(xs);
    let e = this.state.facet(ye.cspNonce);
    ri.mount(this.root, this.styleModules.concat(gv).reverse(), e ? { nonce: e } : void 0);
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
    return _r(this, e, wu(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return _r(this, e, wu(this, e, t, (n) => Lg(this, e.head, n)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? X.cursor(e.to, 1) : X.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, n = !0) {
    return Dg(this, e, t, n);
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
    return _r(this, e, Bg(this, e, t, n));
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
    let n = Il(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Il(this, e, t);
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
    let n = this.state.doc.lineAt(e), s = this.bidiSpans(n), o = s[Tn.find(s, e - n.from, -1, t)];
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
    return !this.state.facet(Ph) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > wv)
      return $h(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || Th(o.isolates, n = vu(this, e))))
        return o.order;
    n || (n = vu(this, e));
    let s = ng(e.text, t, n);
    return this.bidiCache.push(new Zo(e.from, e.to, t, n, !0, s)), s;
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
      wh(this.contentDOM), this.docView.updateSelection();
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
    return oo.of(new Yi(typeof e == "number" ? X.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return oo.of(new Yi(X.cursor(n.from), "start", "start", n.top - e, t, !0));
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
    let n = ri.newName(), s = [ho.of(n), xs.of(Vl(`.${n}`, e))];
    return t && t.dark && s.push(Pl.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return ur.lowest(xs.of(Vl("." + Nl, e, ld)));
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
ye.styleModule = xs;
ye.inputHandler = Ih;
ye.clipboardInputFilter = aa;
ye.clipboardOutputFilter = ua;
ye.scrollHandler = Vh;
ye.focusChangeEffect = Rh;
ye.perLineTextDirection = Ph;
ye.exceptionSink = Eh;
ye.updateListener = Bl;
ye.editable = In;
ye.mouseSelectionStyle = Oh;
ye.dragMovesSelection = Bh;
ye.clickAddsSelectionRange = Lh;
ye.decorations = pr;
ye.blockWrappers = Wh;
ye.outerDecorations = ha;
ye.atomicRanges = Zs;
ye.bidiIsolatedRanges = Fh;
ye.cursorScrollMargin = /* @__PURE__ */ de.define({
  combine: (i) => {
    let e = 5, t = 5;
    for (let n of i)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
ye.scrollMargins = Kh;
ye.darkTheme = Pl;
ye.cspNonce = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : "" });
ye.contentAttributes = ca;
ye.editorAttributes = zh;
ye.lineWrapping = /* @__PURE__ */ ye.contentAttributes.of({ class: "cm-lineWrapping" });
ye.announce = /* @__PURE__ */ Xe.define();
const wv = 4096, Vu = {};
class Zo {
  constructor(e, t, n, s, o, r) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : Je.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && n.push(new Zo(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return n;
  }
}
function Hu(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let o = n[s], r = typeof o == "function" ? o(i) : o;
    r && oa(r, t);
  }
  return t;
}
const xv = oe.mac ? "mac" : oe.windows ? "win" : oe.linux ? "linux" : "key";
function Sv(i, e) {
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
function fo(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const Cv = /* @__PURE__ */ ur.default(/* @__PURE__ */ ye.domEventHandlers({
  keydown(i, e) {
    return $v(Mv(e.state), i, e, "editor");
  }
})), ad = /* @__PURE__ */ de.define({ enables: Cv }), zu = /* @__PURE__ */ new WeakMap();
function Mv(i) {
  let e = i.facet(ad), t = zu.get(e);
  return t || zu.set(e, t = Tv(e.reduce((n, s) => n.concat(s), []))), t;
}
let ti = null;
const Av = 4e3;
function Tv(i, e = xv) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = n[r];
    if (a == null)
      n[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var d, h;
    let f = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), m = l.split(/ (?!$)/).map((b) => Sv(b, e));
    for (let b = 1; b < m.length; b++) {
      let T = m.slice(0, b).join(" ");
      s(T, !0), f[T] || (f[T] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [($) => {
          let P = ti = { view: $, prefix: T, scope: r };
          return setTimeout(() => {
            ti == P && (ti = null);
          }, Av), !0;
        }]
      });
    }
    let y = m.join(" ");
    s(y, !1);
    let g = f[y] || (f[y] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((h = (d = f._any) === null || d === void 0 ? void 0 : d.run) === null || h === void 0 ? void 0 : h.slice()) || []
    });
    a && g.run.push(a), u && (g.preventDefault = !0), c && (g.stopPropagation = !0);
  };
  for (let r of i) {
    let l = r.scope ? r.scope.split(" ") : ["editor"];
    if (r.any)
      for (let u of l) {
        let c = t[u] || (t[u] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: d } = r;
        for (let h in c)
          c[h].run.push((f) => d(f, Hl));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Hl = null;
function $v(i, e, t, n) {
  Hl = e;
  let s = Wm(e), o = Sm(s, 0), r = Cm(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  ti && ti.view == t && ti.scope == n && (l = ti.prefix + " ", Jh.indexOf(e.keyCode) < 0 && (u = !0, ti = null));
  let d = /* @__PURE__ */ new Set(), h = (g) => {
    if (g) {
      for (let b of g.run)
        if (!d.has(b) && (d.add(b), b(t)))
          return g.stopPropagation && (c = !0), !0;
      g.preventDefault && (g.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, f = i[n], m, y;
  return f && (h(f[l + fo(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(oe.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(oe.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (m = li[e.keyCode]) && m != s ? (h(f[l + fo(m, e, !0)]) || e.shiftKey && (y = Vs[e.keyCode]) != s && y != m && h(f[l + fo(y, e, !1)])) && (a = !0) : r && e.shiftKey && h(f[l + fo(s, e, !0)]) && (a = !0), !a && h(f._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Hl = null, a;
}
class Mi {
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
      let o = ud(e);
      return [new Mi(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Dv(e, t, n);
  }
}
function ud(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == Je.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function Wu(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let o = i.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = i.posAtCoords({ x: o.left + 1, y: r }), a = i.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? n : { from: Math.max(n.from, Math.min(l, a)), to: Math.min(n.to, Math.max(l, a)) };
}
function Dv(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), o = i.textDirection == Je.LTR, r = i.contentDOM, l = r.getBoundingClientRect(), a = ud(i), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), d = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), h = l.right - (c ? parseInt(c.paddingRight) : 0), f = El(i, n, 1), m = El(i, s, -1), y = f.type == wt.Text ? f : null, g = m.type == wt.Text ? m : null;
  if (y && (i.lineWrapping || f.widgetLineBreaks) && (y = Wu(i, n, 1, y)), g && (i.lineWrapping || m.widgetLineBreaks) && (g = Wu(i, s, -1, g)), y && g && y.from == g.from && y.to == g.to)
    return T($(t.from, t.to, y));
  {
    let R = y ? $(t.from, null, y) : P(f, !1), V = g ? $(null, t.to, g) : P(m, !0), O = [];
    return (y || f).to < (g || m).from - (y && g ? 1 : 0) || f.widgetLineBreaks > 1 && R.bottom + i.defaultLineHeight / 2 < V.top ? O.push(b(d, R.bottom, h, V.top)) : R.bottom < V.top && i.elementAtHeight((R.bottom + V.top) / 2).type == wt.Text && (R.bottom = V.top = (R.bottom + V.top) / 2), T(R).concat(O).concat(T(V));
  }
  function b(R, V, O, _) {
    return new Mi(e, R - a.left, V - a.top, Math.max(0, O - R), _ - V);
  }
  function T({ top: R, bottom: V, horizontal: O }) {
    let _ = [];
    for (let N = 0; N < O.length; N += 2)
      _.push(b(O[N], R, O[N + 1], V));
    return _;
  }
  function $(R, V, O) {
    let _ = 1e9, N = -1e9, ne = [];
    function z(pe, ve, ie, le, Ee) {
      let Se = i.coordsAtPos(pe, pe == O.to ? -2 : 2), Be = i.coordsAtPos(ie, ie == O.from ? 2 : -2);
      !Se || !Be || (_ = Math.min(Se.top, Be.top, _), N = Math.max(Se.bottom, Be.bottom, N), Ee == Je.LTR ? ne.push(o && ve ? d : Se.left, o && le ? h : Be.right) : ne.push(!o && le ? d : Be.left, !o && ve ? h : Se.right));
    }
    let A = R ?? O.from, H = V ?? O.to;
    for (let pe of i.visibleRanges)
      if (pe.to > A && pe.from < H)
        for (let ve = Math.max(pe.from, A), ie = Math.min(pe.to, H); ; ) {
          let le = i.state.doc.lineAt(ve);
          for (let Ee of i.bidiSpans(le)) {
            let Se = Ee.from + le.from, Be = Ee.to + le.from;
            if (Se >= ie)
              break;
            Be > ve && z(Math.max(Se, ve), R == null && Se <= A, Math.min(Be, ie), V == null && Be >= H, Ee.dir);
          }
          if (ve = le.to + 1, ve >= ie)
            break;
        }
    return ne.length == 0 && z(A, R == null, H, V == null, i.textDirection), { top: _, bottom: N, horizontal: ne };
  }
  function P(R, V) {
    let O = l.top + (V ? R.top : R.bottom);
    return { top: O, bottom: O, horizontal: [] };
  }
}
function Lv(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class Bv {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(Ro) != e.state.facet(Ro) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(Ro);
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
    if (e.length != this.drawn.length || e.some((t, n) => !Lv(t, this.drawn[n]))) {
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
const Ro = /* @__PURE__ */ de.define();
function cd(i) {
  return [
    _t.define((e) => new Bv(e, i)),
    Ro.of(i)
  ];
}
const ns = /* @__PURE__ */ de.define({
  combine(i) {
    return hr(i, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Ov(i = {}) {
  return [
    ns.of(i),
    Ev,
    Iv,
    Pv,
    Nh.of(!0)
  ];
}
function hd(i) {
  return i.startState.facet(ns) != i.state.facet(ns);
}
const Ev = /* @__PURE__ */ cd({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(ns), n = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && oe.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : X.cursor(s.head, s.assoc);
        for (let a of Mi.forRange(i, r, l))
          n.push(a);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = hd(i);
    return t && Fu(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    Fu(e.state, i);
  },
  class: "cm-cursorLayer"
});
function Fu(i, e) {
  e.style.animationDuration = i.facet(ns).cursorBlinkRate + "ms";
}
const Iv = /* @__PURE__ */ cd({
  above: !1,
  markers(i) {
    let e = [], { main: t, ranges: n } = i.state.selection;
    for (let s of n)
      if (!s.empty)
        for (let o of Mi.forRange(i, "cm-selectionBackground", s))
          e.push(o);
    if (oe.ios && !t.empty && i.state.facet(ns).iosSelectionHandles) {
      for (let s of Mi.forRange(i, "cm-selectionHandle cm-selectionHandle-start", X.cursor(t.from, 1)))
        e.push(s);
      for (let s of Mi.forRange(i, "cm-selectionHandle cm-selectionHandle-end", X.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || hd(i);
  },
  class: "cm-selectionLayer"
}), Rv = oe.gecko && oe.gecko_version == 153 ? "#ffffff01" : "transparent", Pv = /* @__PURE__ */ ur.highest(/* @__PURE__ */ ye.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${Rv} !important` },
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
function Nv() {
  return Hv;
}
const Vv = /* @__PURE__ */ Ze.line({ class: "cm-activeLine" }), Hv = /* @__PURE__ */ _t.fromClass(class {
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
      s.from > e && (t.push(Vv.range(s.from)), e = s.from);
    }
    return Ze.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), po = "-10000px";
class dd {
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
function zv(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const jr = /* @__PURE__ */ de.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: oe.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || zv
    };
  }
}), Ku = /* @__PURE__ */ new WeakMap(), fd = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(jr);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new dd(i, ga, (t, n) => this.createTooltip(t, n), (t) => {
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
    let t = e || i.geometryChanged, n = i.state.facet(jr);
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
    return t.dom.style.position = this.position, t.dom.style.top = po, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
    let n = this.view.scrollDOM.getBoundingClientRect(), s = da(this.view);
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
      space: this.view.state.facet(jr).tooltipSpace(this.view),
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
        c.style.top = po;
        continue;
      }
      let f = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, m = f ? 7 : 0, y = h.right - h.left, g = (e = Ku.get(u)) !== null && e !== void 0 ? e : h.bottom - h.top, b = u.offset || Fv, T = this.view.textDirection == Je.LTR, $ = h.width > n.right - n.left ? T ? n.left : n.right - h.width : T ? Math.max(n.left, Math.min(d.left - (f ? 14 : 0) + b.x, n.right - y)) : Math.min(Math.max(n.left, d.left - y + (f ? 14 : 0) - b.x), n.right - y), P = this.above[l];
      !a.strictSide && (P ? d.top - g - m - b.y < n.top : d.bottom + g + m + b.y > n.bottom) && P == n.bottom - d.bottom > d.top - n.top && (P = this.above[l] = !P);
      let R = (P ? d.top - n.top : n.bottom - d.bottom) - m;
      if (R < g && u.resize !== !1) {
        if (R < this.view.defaultLineHeight) {
          c.style.top = po;
          continue;
        }
        Ku.set(u, g), c.style.height = (g = R) / o + "px";
      } else c.style.height && (c.style.height = "");
      let V = P ? d.top - g - m - b.y : d.bottom + m + b.y, O = $ + y;
      if (u.overlap !== !0)
        for (let _ of r)
          _.left < O && _.right > $ && _.top < V + g && _.bottom > V && (V = P ? _.top - g - 2 - m : _.bottom + m + 2);
      if (this.position == "absolute" ? (c.style.top = (V - i.parent.top) / o + "px", _u(c, ($ - i.parent.left) / s)) : (c.style.top = V / o + "px", _u(c, $ / s)), f) {
        let _ = d.left + (T ? b.x : -b.x) - ($ + 14 - 7);
        f.style.left = _ / s + "px";
      }
      u.overlap !== !0 && r.push({ left: $, top: V, right: O, bottom: V + g }), c.classList.toggle("cm-tooltip-above", P), c.classList.toggle("cm-tooltip-below", !P), u.positioned && u.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = po;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function _u(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const Wv = /* @__PURE__ */ ye.baseTheme({
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
}), Fv = { x: 0, y: 0 }, ga = /* @__PURE__ */ de.define({
  enables: [fd, Wv]
}), Qo = /* @__PURE__ */ de.define({
  combine: (i) => i.reduce((e, t) => e.concat(t), [])
});
class yr {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new yr(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new dd(e, Qo, (t, n) => this.createHostedView(t, n), (t) => t.dom.remove());
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
const Kv = /* @__PURE__ */ ga.compute([Qo], (i) => {
  let e = i.facet(Qo);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var n;
      return (n = t.end) !== null && n !== void 0 ? n : t.pos;
    })),
    create: yr.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), _v = /* @__PURE__ */ de.define();
class Uv {
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
      }, (a) => on(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(fd), t = e ? e.manager.tooltips.findIndex((n) => n.create == yr.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, n;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !Gv(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (n = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && n !== void 0 ? n : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !jv(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const mo = 4;
function Gv(i, e) {
  let { left: t, right: n, top: s, bottom: o } = i.getBoundingClientRect(), r;
  if (r = i.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - mo && e.clientX <= n + mo && e.clientY >= s - mo && e.clientY <= o + mo;
}
function jv(i, e, t, n, s, o) {
  let r = i.scrollDOM.getBoundingClientRect(), l = i.documentTop + i.documentPadding.top + i.contentHeight;
  if (r.left > n || r.right < n || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = i.posAtCoords({ x: n, y: s }, !1);
  return a >= e && a <= t;
}
function qv(i, e = {}) {
  let t = Xe.define(), n = /* @__PURE__ */ new WeakMap(), s = un.define({
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
        u.is(t) && (r = u.value, a = void 0), (u.is(Yv) && !u.value || u.value == s) && (r = []);
      return r.length && a && n.set(r, a), r;
    },
    provide: (r) => Qo.from(r)
  });
  const o = _t.define((r) => new Uv(
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
      _v.of(o),
      Kv
    ]
  };
}
const Yv = /* @__PURE__ */ Xe.define(), Uu = /* @__PURE__ */ de.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), Xv = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(zl), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(Uu);
    this.top = new go(i, !0, e.topContainer), this.bottom = new go(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(Uu);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new go(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new go(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(zl);
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
class go {
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
          e = Gu(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Gu(e);
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
function Gu(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const zl = /* @__PURE__ */ de.define({
  enables: Xv
});
class ui extends Ti {
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
ui.prototype.mapMode = Vt.TrackBefore;
ui.prototype.startSide = ui.prototype.endSide = -1;
ui.prototype.point = !0;
const qr = /* @__PURE__ */ de.define(), Jv = /* @__PURE__ */ de.define(), Zv = {
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
}, Os = /* @__PURE__ */ de.define();
function Qv(i) {
  return [pd(), Os.of({ ...Zv, ...i })];
}
const ju = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
});
function pd(i) {
  return [
    ey
  ];
}
const ey = /* @__PURE__ */ _t.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet(Os).map((e) => new Yu(i, e)), this.fixed = !i.state.facet(ju);
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
    this.view.state.facet(ju) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Pe.iter(this.view.state.facet(qr), this.view.viewport.from), n = [], s = this.gutters.map((o) => new ty(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == wt.Text && r) {
            Wl(t, n, l.from);
            for (let a of s)
              a.line(this.view, l, n);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == wt.Text) {
        Wl(t, n, o.from);
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
    let e = i.startState.facet(Os), t = i.state.facet(Os), n = i.docChanged || i.heightChanged || i.viewportChanged || !Pe.eq(i.startState.facet(qr), i.state.facet(qr), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new Yu(this.view, o)) : (this.gutters[r].update(i), s.push(this.gutters[r]));
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
function qu(i) {
  return Array.isArray(i) ? i : [i];
}
function Wl(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class ty {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = Pe.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new md(e, r, o, n);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    Wl(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let o of e.state.facet(Jv)) {
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
class Yu {
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
    this.markers = qu(t.markers(e)), t.initialSpacer && (this.spacer = new md(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = qu(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
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
class md {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), ny(this.markers, s) || this.setMarkers(e, s);
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
function ny(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const iy = /* @__PURE__ */ de.define(), sy = /* @__PURE__ */ de.define(), Wi = /* @__PURE__ */ de.define({
  combine(i) {
    return hr(i, { formatNumber: String, domEventHandlers: {} }, {
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
class Yr extends ui {
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
function Xr(i, e) {
  return i.state.facet(Wi).formatNumber(e, i.state);
}
const oy = /* @__PURE__ */ Os.compute([Wi], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(iy);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new Yr(Xr(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet(sy)) {
      let o = s(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Wi) != e.state.facet(Wi),
  initialSpacer(e) {
    return new Yr(Xr(e, Xu(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = Xr(t.view, Xu(t.view.state.doc.lines));
    return n == e.number ? e : new Yr(n);
  },
  domEventHandlers: i.facet(Wi).domEventHandlers,
  side: "before"
}));
function ry(i = {}) {
  return [
    Wi.of(i),
    pd(),
    oy
  ];
}
function Xu(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const ly = 1024;
let ay = 0;
class Jr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Ve {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = ay++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
class Es {
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
const uy = /* @__PURE__ */ Object.create(null);
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : uy, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new zt(e.name || "", t, e.id, n);
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
class va {
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
    return new va(t);
  }
}
const vo = /* @__PURE__ */ new WeakMap(), Ju = /* @__PURE__ */ new WeakMap();
var rt;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(rt || (rt = {}));
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
    let e = Es.get(this);
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
    return new Kl(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = vo.get(this) || this.topNode, o = new Kl(s);
    return o.moveTo(e, t), vo.set(this, o._tree), o;
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
    let n = Fs(vo.get(this) || this.topNode, e, t, !1);
    return vo.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = Fs(Ju.get(this) || this.topNode, e, t, !0);
    return Ju.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return dy(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & rt.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | rt.IncludeAnonymous); ; ) {
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
    return this.children.length <= 8 ? this : ka(zt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new tt(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new tt(zt.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return fy(e);
  }
}
tt.empty = new tt(zt.none, [], [], 0);
class ya {
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
    return new ya(this.buffer, this.index);
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
    for (let a = e; a != t && !(gd(o, s, r[a + 1], r[a + 2]) && (l = a, n > 0)); a = r[a + 3])
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
function gd(i, e, t, n) {
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
function Fs(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let r = !n && i instanceof Jt && i.index < 0 ? null : i.parent;
    if (!r)
      return i;
    i = r;
  }
  let o = n ? 0 : rt.IgnoreOverlays;
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
class vd {
  cursor(e = 0) {
    return new Kl(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = Zu(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return Zu(this, e, t, n);
  }
  resolve(e, t = 0) {
    return Fs(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Fs(this, e, t, !0);
  }
  matchContext(e) {
    return Fl(this.parent, e);
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
class Jt extends vd {
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
        if (!(!(o & rt.EnterBracketed && c instanceof tt && (h = Es.get(c)) && !h.overlay && h.bracketed && n >= d && n <= d + c.length) && !gd(s, n, d, d + c.length))) {
          if (c instanceof ci) {
            if (o & rt.ExcludeBuffers)
              continue;
            let f = c.findChild(0, c.buffer.length, t, n - d, s);
            if (f > -1)
              return new si(new cy(r, c, e, d), null, f);
          } else if (o & rt.IncludeAnonymous || !c.type.isAnonymous || ba(c)) {
            let f;
            if (!(o & rt.IgnoreMounts) && (f = Es.get(c)) && !f.overlay)
              return new Jt(f.tree, d, e, r);
            let m = new Jt(c, d, e, r);
            return o & rt.IncludeAnonymous || !m.type.isAnonymous ? m : m.nextChild(t < 0 ? c.children.length - 1 : 0, t, n, s, o);
          }
        }
      }
      if (o & rt.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
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
    if (!(n & rt.IgnoreOverlays) && (s = Es.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = n & rt.EnterBracketed && s.bracketed;
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
function Zu(i, e, t, n) {
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
function Fl(i, e, t = e.length - 1) {
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
class cy {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class si extends vd {
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
    if (n & rt.ExcludeBuffers)
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
    return new tt(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function yd(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let o = 1; o < i.length; o++) {
    let r = i[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let n = t instanceof Jt && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new hy(s, t);
}
class hy {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return yd(this.heads);
  }
}
function dy(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let o = n instanceof Jt ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [n])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Es.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new Jt(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [n])).push(Fs(l, e, t, !1));
      }
    }
  return s ? yd(s) : n;
}
class Kl {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~rt.EnterBracketed, e instanceof Jt)
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
    return this.buffer ? n & rt.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & rt.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & rt.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
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
          if (this.mode & rt.IncludeAnonymous || l instanceof ci || !l.type.isAnonymous || ba(l))
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
      return Fl(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return Fl(this._tree, e, s);
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
function ba(i) {
  return i.children.some((e) => e instanceof ci || !e.type.isAnonymous || ba(e));
}
function fy(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = ly, reused: o = [], minRepeatType: r = n.types.length } = i, l = Array.isArray(t) ? new ya(t, t.length) : t, a = n.types, u = 0, c = 0;
  function d(R, V, O, _, N, ne) {
    let { id: z, start: A, end: H, size: pe } = l, ve = c, ie = u;
    if (pe < 0)
      if (l.next(), pe == -1) {
        let Me = o[z];
        O.push(Me), _.push(A - R);
        return;
      } else if (pe == -3) {
        u = z;
        return;
      } else if (pe == -4) {
        c = z;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${pe}`);
    let le = a[z], Ee, Se, Be = A - R;
    if (H - A <= s && (Se = g(l.pos - V, N))) {
      let Me = new Uint16Array(Se.size - Se.skip), j = l.pos - Se.size, Qe = Me.length;
      for (; l.pos > j; )
        Qe = b(Se.start, Me, Qe);
      Ee = new ci(Me, H - Se.start, n), Be = Se.start - R;
    } else {
      let Me = l.pos - pe;
      l.next();
      let j = [], Qe = [], ue = z >= r ? z : -1, Ae = 0, ee = H;
      for (; l.pos > Me; )
        ue >= 0 && l.id == ue && l.size >= 0 ? (l.end <= ee - s && (m(j, Qe, A, Ae, l.end, ee, ue, ve, ie), Ae = j.length, ee = l.end), l.next()) : ne > 2500 ? h(A, Me, j, Qe) : d(A, Me, j, Qe, ue, ne + 1);
      if (ue >= 0 && Ae > 0 && Ae < j.length && m(j, Qe, A, Ae, A, ee, ue, ve, ie), j.reverse(), Qe.reverse(), ue > -1 && Ae > 0) {
        let K = f(le, ie);
        Ee = ka(le, j, Qe, 0, j.length, 0, H - A, K, K);
      } else
        Ee = y(le, j, Qe, H - A, ve - H, ie);
    }
    O.push(Ee), _.push(Be);
  }
  function h(R, V, O, _) {
    let N = [], ne = 0, z = -1;
    for (; l.pos > V; ) {
      let { id: A, start: H, end: pe, size: ve } = l;
      if (ve > 4)
        l.next();
      else {
        if (z > -1 && H < z)
          break;
        z < 0 && (z = pe - s), N.push(A, H, pe), ne++, l.next();
      }
    }
    if (ne) {
      let A = new Uint16Array(ne * 4), H = N[N.length - 2];
      for (let pe = N.length - 3, ve = 0; pe >= 0; pe -= 3)
        A[ve++] = N[pe], A[ve++] = N[pe + 1] - H, A[ve++] = N[pe + 2] - H, A[ve++] = ve;
      O.push(new ci(A, N[2] - H, n)), _.push(H - R);
    }
  }
  function f(R, V) {
    return (O, _, N) => {
      let ne = 0, z = O.length - 1, A, H;
      if (z >= 0 && (A = O[z]) instanceof tt) {
        if (!z && A.type == R && A.length == N)
          return A;
        (H = A.prop(Ve.lookAhead)) && (ne = _[z] + A.length + H);
      }
      return y(R, O, _, N, ne, V);
    };
  }
  function m(R, V, O, _, N, ne, z, A, H) {
    let pe = [], ve = [];
    for (; R.length > _; )
      pe.push(R.pop()), ve.push(V.pop() + O - N);
    R.push(y(n.types[z], pe, ve, ne - N, A - ne, H)), V.push(N - O);
  }
  function y(R, V, O, _, N, ne, z) {
    if (ne) {
      let A = [Ve.contextHash, ne];
      z = z ? [A].concat(z) : [A];
    }
    if (N > 25) {
      let A = [Ve.lookAhead, N];
      z = z ? [A].concat(z) : [A];
    }
    return new tt(R, V, O, _, z);
  }
  function g(R, V) {
    let O = l.fork(), _ = 0, N = 0, ne = 0, z = O.end - s, A = { size: 0, start: 0, skip: 0 };
    e: for (let H = O.pos - R; O.pos > H; ) {
      let pe = O.size;
      if (O.id == V && pe >= 0) {
        A.size = _, A.start = N, A.skip = ne, ne += 4, _ += 4, O.next();
        continue;
      }
      let ve = O.pos - pe;
      if (pe < 0 || ve < H || O.start < z)
        break;
      let ie = O.id >= r ? 4 : 0, le = O.start;
      for (O.next(); O.pos > ve; ) {
        if (O.size < 0)
          if (O.size == -3 || O.size == -4)
            ie += 4;
          else
            break e;
        else O.id >= r && (ie += 4);
        O.next();
      }
      N = le, _ += pe, ne += ie;
    }
    return (V < 0 || _ == R) && (A.size = _, A.start = N, A.skip = ne), A.size > 4 ? A : void 0;
  }
  function b(R, V, O) {
    let { id: _, start: N, end: ne, size: z } = l;
    if (l.next(), z >= 0 && _ < r) {
      let A = O;
      if (z > 4) {
        let H = l.pos - (z - 4);
        for (; l.pos > H; )
          O = b(R, V, O);
      }
      V[--O] = A, V[--O] = ne - R, V[--O] = N - R, V[--O] = _;
    } else z == -3 ? u = _ : z == -4 && (c = _);
    return O;
  }
  let T = [], $ = [];
  for (; l.pos > 0; )
    d(i.start || 0, i.bufferStart || 0, T, $, -1, 0);
  let P = (e = i.length) !== null && e !== void 0 ? e : T.length ? $[0] + T[0].length : 0;
  return new tt(a[i.topID], T.reverse(), $.reverse(), P);
}
const Qu = /* @__PURE__ */ new WeakMap();
function Po(i, e) {
  if (!i.isAnonymous || e instanceof ci || e.type != i)
    return 1;
  let t = Qu.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof tt)) {
        t = 1;
        break;
      }
      t += Po(i, n);
    }
    Qu.set(e, t);
  }
  return t;
}
function ka(i, e, t, n, s, o, r, l, a) {
  let u = 0;
  for (let m = n; m < s; m++)
    u += Po(i, e[m]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], h = [];
  function f(m, y, g, b, T) {
    for (let $ = g; $ < b; ) {
      let P = $, R = y[$], V = Po(i, m[$]);
      for ($++; $ < b; $++) {
        let O = Po(i, m[$]);
        if (V + O >= c)
          break;
        V += O;
      }
      if ($ == P + 1) {
        if (V > c) {
          let O = m[P];
          f(O.children, O.positions, 0, O.children.length, y[P] + T);
          continue;
        }
        d.push(m[P]);
      } else {
        let O = y[$ - 1] + m[$ - 1].length - R;
        d.push(ka(i, m, y, P, $, R, O, null, a));
      }
      h.push(R + T - o);
    }
  }
  return f(e, t, n, s, 0), (l || a)(d, h, r);
}
class Ai {
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
    let s = [new Ai(0, e.length, e, 0, !1, n)];
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
            h = f >= m ? null : new Ai(f, m, h.tree, h.offset + u, l > 0, !!c);
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
class bd {
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
    return typeof e == "string" && (e = new py(e)), n = n ? n.length ? n.map((s) => new Jr(s.from, s.to)) : [new Jr(0, 0)] : [new Jr(0, e.length)], this.createParse(e, t || [], n);
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
class py {
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
let my = 0;
class Yt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = my++;
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
    let t = new er(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : er.get(n.base || n, n.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let gy = 0;
class er {
  constructor(e) {
    this.name = e, this.instances = [], this.id = gy++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && vy(t, l.modified));
    if (n)
      return n;
    let s = [], o = new Yt(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = yy(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(er.get(l, a));
    return o;
  }
}
function vy(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function yy(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function by(i) {
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
        let c = new Ks(n, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return kd.add(e);
}
const kd = new Ve({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth < e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new Ks(s.tags, s.mode, s.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class Ks {
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
Ks.empty = new Ks([], 2, null);
function wd(i, e) {
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
function ky(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function wy(i, e, t, n = 0, s = i.length) {
  let o = new xy(n, Array.isArray(e) ? e : [e], t);
  o.highlightRange(i.cursor(), n, s, "", o.highlighters), o.flush(s);
}
class xy {
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
    let u = s, c = Sy(e) || Ks.empty, d = ky(o, c.tags);
    if (d && (u && (u += " "), u += d, c.mode == 1 && (s += (s ? " " : "") + d)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let h = e.tree && e.tree.prop(Ve.mounted);
    if (h && h.overlay) {
      let f = e.node.enter(h.overlay[0].from + l, 1), m = this.highlighters.filter((g) => !g.scope || g.scope(h.tree.type)), y = e.firstChild();
      for (let g = 0, b = l; ; g++) {
        let T = g < h.overlay.length ? h.overlay[g] : null, $ = T ? T.from + l : a, P = Math.max(t, b), R = Math.min(n, $);
        if (P < R && y)
          for (; e.from < R && (this.highlightRange(e, P, R, s, o), this.startSpan(Math.min(R, e.to), u), !(e.to >= $ || !e.nextSibling())); )
            ;
        if (!T || $ > n)
          break;
        b = T.to + l, b > t && (this.highlightRange(f.cursor(), Math.max(t, T.from + l), Math.min(n, b), "", m), this.startSpan(Math.min(n, b), u));
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
function Sy(i) {
  let e = i.type.prop(kd);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const se = Yt.define, yo = se(), Jn = se(), ec = se(Jn), tc = se(Jn), Zn = se(), bo = se(Zn), Zr = se(Zn), kn = se(), vi = se(kn), vn = se(), yn = se(), _l = se(), gs = se(_l), ko = se(), $e = {
  /**
  A comment.
  */
  comment: yo,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: se(yo),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: se(yo),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: se(yo),
  /**
  Any kind of identifier.
  */
  name: Jn,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: se(Jn),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: ec,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: se(ec),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: tc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: se(tc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: se(Jn),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: se(Jn),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: se(Jn),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: se(Jn),
  /**
  A literal value.
  */
  literal: Zn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: bo,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: se(bo),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: se(bo),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: se(bo),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: Zr,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: se(Zr),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: se(Zr),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: se(Zn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: se(Zn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: se(Zn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: se(Zn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: se(Zn),
  /**
  A language keyword.
  */
  keyword: vn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: se(vn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: se(vn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: se(vn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: se(vn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: se(vn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: se(vn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: se(vn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: se(vn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: se(vn),
  /**
  An operator.
  */
  operator: yn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: se(yn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: se(yn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: se(yn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: se(yn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: se(yn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: se(yn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: se(yn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: se(yn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: se(yn),
  /**
  Program or markup punctuation.
  */
  punctuation: _l,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: se(_l),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: gs,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: se(gs),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: se(gs),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: se(gs),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: se(gs),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: kn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: vi,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: se(vi),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: se(vi),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: se(vi),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: se(vi),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: se(vi),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: se(vi),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: se(kn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: se(kn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: se(kn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: se(kn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: se(kn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: se(kn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: se(kn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: se(kn),
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
  meta: ko,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: se(ko),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: se(ko),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: se(ko),
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
wd([
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
var Qr;
const Fi = /* @__PURE__ */ new Ve();
function Cy(i) {
  return de.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const My = /* @__PURE__ */ new Ve();
class rn {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, _e.prototype.hasOwnProperty("tree") || Object.defineProperty(_e.prototype, "tree", { get() {
      return $n(this);
    } }), this.parser = t, this.extension = [
      os.of(this),
      _e.languageData.of((o, r, l) => {
        let a = nc(o, r, l), u = a.type.prop(Fi);
        if (!u)
          return [];
        let c = o.facet(u), d = a.type.prop(My);
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
    return nc(e, t, n).type.prop(Fi) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(os);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (o, r) => {
      if (o.prop(Fi) == this.data) {
        n.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Ve.mounted);
      if (l) {
        if (l.tree.prop(Fi) == this.data) {
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
    return s($n(e), 0), n;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
rn.setState = /* @__PURE__ */ Xe.define();
function nc(i, e, t) {
  let n = i.facet(os), s = $n(i).topNode;
  if (!n || n.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, rt.ExcludeBuffers | rt.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function $n(i) {
  let e = i.field(rn.state, !1);
  return e ? e.tree : tt.empty;
}
class Ay {
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
let vs = null;
class is {
  constructor(e, t, n = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new is(e, t, [], tt.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new Ay(this.state.doc), this.fragments);
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
          if (this.fragments = this.withoutTempSkipped(Ai.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Ai.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = vs;
    vs = this;
    try {
      return e();
    } finally {
      vs = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = ic(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, d, h) => a.push({ fromA: u, toA: c, fromB: d, toB: h })), n = Ai.applyChanges(n, a), s = tt.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), d = e.mapPos(u.to, -1);
          c < d && l.push({ from: c, to: d });
        }
      }
    }
    return new is(this.parser, t, n, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = ic(this.fragments, s, o), this.skipped.splice(n--, 1));
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
    return new class extends bd {
      createParse(t, n, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = vs;
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
    return vs;
  }
}
function ic(i, e, t) {
  return Ai.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class ss {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new ss(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = is.create(e.facet(os).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new ss(n);
  }
}
rn.state = /* @__PURE__ */ un.define({
  create: ss.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(rn.setState))
        return t.value;
    return e.startState.facet(os) != e.state.facet(os) ? ss.init(e.state) : i.apply(e);
  }
});
let xd = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (xd = (i) => {
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
const el = typeof navigator < "u" && (!((Qr = navigator.scheduling) === null || Qr === void 0) && Qr.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Ty = /* @__PURE__ */ _t.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(rn.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(rn.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = xd(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: s } } = this.view, o = n.field(rn.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !el ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && n.doc.length > s + 1e3, a = o.context.work(() => el && el() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: rn.setState.of(new ss(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => on(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), os = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    rn.state,
    Ty,
    ye.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), $y = /* @__PURE__ */ de.define(), wa = /* @__PURE__ */ de.define({
  combine: (i) => {
    if (!i.length)
      return "  ";
    let e = i[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(i[0]));
    return e;
  }
});
function Bi(i) {
  let e = i.facet(wa);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function tr(i, e) {
  let t = "", n = i.tabSize, s = i.facet(wa)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Sd(i, e) {
  i instanceof _e && (i = new br(i));
  for (let n of i.state.facet($y)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = $n(i.state);
  return t.length >= e ? Dy(i, t, e) : null;
}
class br {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Bi(e);
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
    return dr(e, this.state.tabSize, t);
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
const Cd = /* @__PURE__ */ new Ve();
function Dy(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let o = [];
    for (let r = s; r && !(r.from < n.node.from || r.to > n.node.to || r.from == n.node.from && r.type == n.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      n = { node: o[r], next: n };
  }
  return Md(n, i, t);
}
function Md(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = By(n.node);
    if (s)
      return s(xa.create(e, t, n));
  }
  return 0;
}
function Ly(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function By(i) {
  let e = i.type.prop(Cd);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(Ve.closedBy))) {
    let s = i.lastChild, o = s && n.indexOf(s.name) > -1;
    return (r) => Ry(r, !0, 1, void 0, o && !Ly(r) ? s.from : void 0);
  }
  return i.parent == null ? Oy : null;
}
function Oy() {
  return 0;
}
class xa extends br {
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
    return new xa(e, t, n);
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
      if (Ey(n, e))
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
    return Md(this.context.next, this.base, this.pos);
  }
}
function Ey(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function Iy(i) {
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
function Ry(i, e, t, n, s) {
  let o = i.textAfter, r = o.match(/^\s*/)[0].length, l = n && o.slice(r, r + n.length) == n || s == i.pos + r, a = Iy(i);
  return a ? l ? i.column(a.from) : i.column(a.to) : i.baseIndent + (l ? 0 : i.unit * t);
}
class kr {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(l) {
      let a = ri.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof rn ? (l) => l.prop(Fi) == r.data : r ? (l) => l == r : void 0, this.style = wd(e.map((l) => ({
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
    return new kr(e, t || {});
  }
}
const Ul = /* @__PURE__ */ de.define(), Py = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function tl(i) {
  let e = i.facet(Ul);
  return e.length ? e : i.facet(Py);
}
function Ny(i, e) {
  let t = [Hy], n;
  return i instanceof kr && (i.module && t.push(ye.styleModule.of(i.module)), n = i.themeType), n ? t.push(Ul.computeN([ye.darkTheme], (s) => s.facet(ye.darkTheme) == (n == "dark") ? [i] : [])) : t.push(Ul.of(i)), t;
}
class Vy {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = $n(e.state), this.decorations = this.buildDeco(e, tl(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = $n(e.state), n = tl(e.state), s = n != tl(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Ze.none;
    let n = new Ci();
    for (let { from: s, to: o } of e.visibleRanges)
      wy(this.tree, t, (r, l, a) => {
        n.add(r, l, this.markCache[a] || (this.markCache[a] = Ze.mark({ class: a })));
      }, s, o);
    return n.finish();
  }
}
const Hy = /* @__PURE__ */ ur.high(/* @__PURE__ */ _t.fromClass(Vy, {
  decorations: (i) => i.decorations
})), zy = 1e4, Wy = "()[]{}", Fy = /* @__PURE__ */ new Ve();
function Gl(i, e, t) {
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
function jl(i) {
  let e = i.type.prop(Fy);
  return e ? e(i.node) : i;
}
function Ki(i, e, t, n = {}) {
  let s = n.maxScanDistance || zy, o = n.brackets || Wy, r = $n(i), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = Gl(a.type, t, o);
    if (u && a.from < a.to) {
      let c = jl(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return Ky(i, e, t, a, c, u, o);
    }
  }
  return _y(i, e, t, r, l.type, s, o);
}
function Ky(i, e, t, n, s, o, r) {
  let l = n.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let d = jl(c);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (Gl(c.type, t, r))
          u++;
        else if (Gl(c.type, -t, r)) {
          if (u == 0) {
            let d = jl(c);
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
function _y(i, e, t, n, s, o, r) {
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
    for (let y = t > 0 ? 0 : f.length - 1, g = t > 0 ? f.length : -1; y != g; y += t) {
      let b = r.indexOf(f[y]);
      if (!(b < 0 || n.resolveInner(m + y, 1).type != s))
        if (b % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: u, end: { from: m + y, to: m + y + 1 }, matched: b >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (h += f.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function sc(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let o = s;
  for (let r = n; r < e; r++)
    i.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Ad {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = sc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : sc(this.string, null, this.tabSize);
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
function Uy(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || Gy,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || Ma,
    mergeTokens: i.mergeTokens !== !1
  };
}
function Gy(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const oc = /* @__PURE__ */ new WeakMap();
class Sa extends rn {
  constructor(e) {
    let t = Cy(e.languageData), n = Uy(e), s, o = new class extends bd {
      createParse(r, l, a) {
        return new qy(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = Jy(t, this), s = this, this.streamParser = n, this.stateAfter = new Ve({ perNode: !0 }), this.tokenTable = e.tokenTable ? new Ld(n.tokenTable) : Xy;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Sa(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = oc.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Ca(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = n ? n(a.from) : -1, d = new Ad(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; d.pos < u - a.from; )
          $d(this.streamParser.token, d, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return n && t == null && oc.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Ca(i, e, t, n, s) {
  let o = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (o)
    return { state: i.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof tt && a < s && Ca(i, l, a, n, s);
    if (u)
      return u;
  }
  return null;
}
function Td(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < n && l instanceof tt) {
      if (!(a = Td(i, l, t - r, n - r, s)))
        break;
      return s ? new tt(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function jy(i, e, t, n, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Ca(i, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= n && (u = Td(i, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: i.streamParser.startState(s ? Bi(s) : 4), tree: tt.empty };
}
class qy {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = is.get(), r = s[0].from, { state: l, tree: a } = jy(e, n, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Bi(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = is.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
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
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Ad(t, e ? e.state.tabSize : 4, e ? Bi(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = $d(o.token, r, this.state);
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
      nodeSet: Yy,
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
function $d(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const Ma = /* @__PURE__ */ Object.create(null), _s = [zt.none], Yy = /* @__PURE__ */ new va(_s), rc = [], lc = /* @__PURE__ */ Object.create(null), Dd = /* @__PURE__ */ Object.create(null);
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
  Dd[i] = /* @__PURE__ */ Bd(Ma, e);
class Ld {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Dd);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = Bd(this.extra, e)) : 0;
  }
}
const Xy = /* @__PURE__ */ new Ld(Ma);
function nl(i, e) {
  rc.indexOf(i) > -1 || (rc.push(i), console.warn(e));
}
function Bd(i, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = i[u] || $e[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : nl(u, `Modifier ${u} used at start of tag`) : a.length ? nl(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : nl(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((l) => l.id), o = lc[s];
  if (o)
    return o.id;
  let r = lc[s] = zt.define({
    id: _s.length,
    name: n,
    props: [by({ [n]: t })]
  });
  return _s.push(r), r.id;
}
function Jy(i, e) {
  let t = zt.define({ id: _s.length, name: "Document", props: [
    Fi.add(() => i),
    Cd.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return _s.push(t), t;
}
Je.RTL, Je.LTR;
const Zy = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = Ta(i.state, t.from);
  return n.line ? Qy(i) : n.block ? t0(i) : !1;
};
function Aa(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const Qy = /* @__PURE__ */ Aa(
  s0,
  0
  /* CommentOption.Toggle */
), e0 = /* @__PURE__ */ Aa(
  Od,
  0
  /* CommentOption.Toggle */
), t0 = /* @__PURE__ */ Aa(
  (i, e) => Od(i, e, i0(e)),
  0
  /* CommentOption.Toggle */
);
function Ta(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const ys = 50;
function n0(i, { open: e, close: t }, n, s) {
  let o = i.sliceDoc(n - ys, n), r = i.sliceDoc(s, s + ys), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, d;
  s - n <= 2 * ys ? c = d = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + ys), d = i.sliceDoc(s - ys, s));
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
function i0(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function Od(i, e, t = e.selection.ranges) {
  let n = t.map((o) => Ta(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let s = t.map((o, r) => n0(e, n[r], o.from, o.to));
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
function s0(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = n.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let d = e.doc.lineAt(c);
      if (u == null && (u = Ta(e, d.from).line, !u))
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
function cs(i, e) {
  return X.create(i.ranges.map(e), i.mainIndex);
}
function cn(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function hn({ state: i, dispatch: e }, t) {
  let n = cs(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(cn(i, n)), !0);
}
function wr(i, e) {
  return X.cursor(e ? i.to : i.from);
}
function Ed(i, e) {
  return hn(i, (t) => t.empty ? i.moveByChar(t, e) : wr(t, e));
}
function Lt(i) {
  return i.textDirectionAt(i.state.selection.main.head) == Je.LTR;
}
const Id = (i) => Ed(i, !Lt(i)), Rd = (i) => Ed(i, Lt(i));
function Pd(i, e) {
  return hn(i, (t) => t.empty ? i.moveByGroup(t, e) : wr(t, e));
}
const o0 = (i) => Pd(i, !Lt(i)), r0 = (i) => Pd(i, Lt(i));
function l0(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function xr(i, e, t) {
  let n = $n(i).resolveInner(e.head), s = t ? Ve.closedBy : Ve.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? n.childAfter(a) : n.childBefore(a);
    if (!u)
      break;
    l0(i, u, s) ? n = u : a = t ? u.to : u.from;
  }
  let o = n.type.prop(s), r, l;
  return o && (r = t ? Ki(i, n.from, 1) : Ki(i, n.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? n.to : n.from, X.cursor(l, t ? -1 : 1);
}
const a0 = (i) => hn(i, (e) => xr(i.state, e, !Lt(i))), u0 = (i) => hn(i, (e) => xr(i.state, e, Lt(i)));
function Nd(i, e) {
  return hn(i, (t) => {
    if (!t.empty)
      return wr(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const Vd = (i) => Nd(i, !1), Hd = (i) => Nd(i, !0);
function zd(i) {
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
function Wd(i, e) {
  let t = zd(i), { state: n } = i, s = cs(n.selection, (r) => r.empty ? i.moveVertically(r, e, t.height) : wr(r, e));
  if (s.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = i.coordsAtPos(n.selection.main.head), l = i.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = ye.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return i.dispatch(cn(n, s), { effects: o }), !0;
}
const ac = (i) => Wd(i, !1), ql = (i) => Wd(i, !0);
function hi(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let o = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (s = X.cursor(n.from + o));
  }
  return s;
}
const c0 = (i) => hn(i, (e) => hi(i, e, !0)), h0 = (i) => hn(i, (e) => hi(i, e, !1)), d0 = (i) => hn(i, (e) => hi(i, e, !Lt(i))), f0 = (i) => hn(i, (e) => hi(i, e, Lt(i))), p0 = (i) => hn(i, (e) => i.moveToLineBoundary(e, !1, !1)), m0 = (i) => hn(i, (e) => i.moveToLineBoundary(e, !0, !1));
function g0(i, e, t) {
  let n = !1, s = cs(i.selection, (o) => {
    let r = Ki(i, o.head, -1) || Ki(i, o.head, 1) || o.head > 0 && Ki(i, o.head - 1, 1) || o.head < i.doc.length && Ki(i, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    n = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return X.cursor(l);
  });
  return n ? (e(cn(i, s)), !0) : !1;
}
const v0 = ({ state: i, dispatch: e }) => g0(i, e);
function Qt(i, e, t) {
  let n = cs(i.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = X.range(s.head, s.anchor));
    let o = t(s);
    return X.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(i.state.selection) ? !1 : (i.dispatch(cn(i.state, n)), !0);
}
function Fd(i, e) {
  return Qt(i, e, (t) => i.moveByChar(t, e));
}
const Kd = (i) => Fd(i, !Lt(i)), _d = (i) => Fd(i, Lt(i));
function Ud(i, e) {
  return Qt(i, e, (t) => i.moveByGroup(t, e));
}
const y0 = (i) => Ud(i, !Lt(i)), b0 = (i) => Ud(i, Lt(i)), k0 = (i) => {
  let e = !Lt(i);
  return Qt(i, e, (t) => xr(i.state, t, e));
}, w0 = (i) => {
  let e = Lt(i);
  return Qt(i, e, (t) => xr(i.state, t, e));
};
function Gd(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e));
}
const jd = (i) => Gd(i, !1), qd = (i) => Gd(i, !0);
function Yd(i, e) {
  return Qt(i, e, (t) => i.moveVertically(t, e, zd(i).height));
}
const uc = (i) => Yd(i, !1), cc = (i) => Yd(i, !0), x0 = (i) => Qt(i, !0, (e) => hi(i, e, !0)), S0 = (i) => Qt(i, !1, (e) => hi(i, e, !1)), C0 = (i) => {
  let e = !Lt(i);
  return Qt(i, e, (t) => hi(i, t, e));
}, M0 = (i) => {
  let e = Lt(i);
  return Qt(i, e, (t) => hi(i, t, e));
}, A0 = (i) => Qt(i, !1, (e) => X.cursor(i.lineBlockAt(e.head).from)), T0 = (i) => Qt(i, !0, (e) => X.cursor(i.lineBlockAt(e.head).to)), hc = ({ state: i, dispatch: e }) => (e(cn(i, { anchor: 0 })), !0), dc = ({ state: i, dispatch: e }) => (e(cn(i, { anchor: i.doc.length })), !0), fc = ({ state: i, dispatch: e }) => (e(cn(i, { anchor: i.selection.main.anchor, head: 0 })), !0), pc = ({ state: i, dispatch: e }) => (e(cn(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), $0 = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), D0 = ({ state: i, dispatch: e }) => {
  let t = Sr(i).map(({ from: n, to: s }) => X.undirectionalRange(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: X.create(t), userEvent: "select" })), !0;
}, L0 = ({ state: i, dispatch: e }) => {
  let t = cs(i.selection, (n) => {
    let s = $n(i), o = s.resolveStack(n.from, 1);
    if (n.empty) {
      let r = s.resolveStack(n.from, -1);
      r.node.from >= o.node.from && r.node.to <= o.node.to && (o = r);
    }
    for (let r = o; r; r = r.next) {
      let { node: l } = r;
      if ((l.from < n.from && l.to >= n.to || l.to > n.to && l.from <= n.from) && r.next)
        return X.undirectionalRange(l.from, l.to);
    }
    return n;
  });
  return t.eq(i.selection) ? !1 : (e(cn(i, t)), !0);
};
function Xd(i, e) {
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
  return s.length == n.ranges.length ? !1 : (i.dispatch(cn(t, X.create(s, s.length - 1))), !0);
}
const B0 = (i) => Xd(i, !1), O0 = (i) => Xd(i, !0), E0 = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = X.create([t.main]) : t.main.empty || (n = X.create([X.cursor(t.main.head)])), n ? (e(cn(i, n)), !0) : !1;
};
function Qs(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = wo(i, a, !1)) : a > r && (t = "delete.forward", a = wo(i, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = wo(i, r, !1), l = wo(i, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: X.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? ye.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function wo(i, e, t) {
  if (i instanceof ye)
    for (let n of i.state.facet(ye.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const Jd = (i, e, t) => Qs(i, (n) => {
  let s = n.from, { state: o } = i, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = dr(l, o.tabSize), c = u % Bi(o) || Bi(o);
    for (let d = 0; d < c && l[l.length - 1 - d] == " "; d++)
      s--;
    a = s;
  } else
    a = Tt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = Tt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), Yl = (i) => Jd(i, !1, !0), Zd = (i) => Jd(i, !0, !1), Qd = (i, e) => Qs(i, (t) => {
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
}), ef = (i) => Qd(i, !1), I0 = (i) => Qd(i, !0), R0 = (i) => Qs(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), P0 = (i) => Qs(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), N0 = (i) => Qs(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), V0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: We.of(["", ""]) },
    range: X.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, H0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, o = i.doc.lineAt(s), r = s == o.from ? s - 1 : Tt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : Tt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: i.doc.slice(s, l).append(i.doc.slice(r, s)) },
      range: X.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(i.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Sr(i) {
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
function tf(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [], s = [];
  for (let o of Sr(i)) {
    if (t ? o.to == i.doc.length : o.from == 0)
      continue;
    let r = i.doc.lineAt(t ? o.to + 1 : o.from - 1), l = r.length + 1;
    if (t) {
      n.push({ from: o.to, to: r.to }, { from: o.from, insert: r.text + i.lineBreak });
      for (let a of o.ranges)
        s.push(X.range(Math.min(i.doc.length, a.anchor + l), Math.min(i.doc.length, a.head + l)));
    } else {
      n.push({ from: r.from, to: o.from }, { from: o.to, insert: i.lineBreak + r.text });
      for (let a of o.ranges)
        s.push(X.range(a.anchor - l, a.head - l));
    }
  }
  return n.length ? (e(i.update({
    changes: n,
    scrollIntoView: !0,
    selection: X.create(s, i.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const z0 = ({ state: i, dispatch: e }) => tf(i, e, !1), W0 = ({ state: i, dispatch: e }) => tf(i, e, !0);
function nf(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [];
  for (let o of Sr(i))
    t ? n.push({ from: o.from, insert: i.doc.slice(o.from, o.to) + i.lineBreak }) : n.push({ from: o.to, insert: i.lineBreak + i.doc.slice(o.from, o.to) });
  let s = i.changes(n);
  return e(i.update({
    changes: s,
    selection: i.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const F0 = ({ state: i, dispatch: e }) => nf(i, e, !1), K0 = ({ state: i, dispatch: e }) => nf(i, e, !0), _0 = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(Sr(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), n = cs(e.selection, (s) => {
    let o;
    if (i.lineWrapping) {
      let r = i.lineBlockAt(s.head), l = i.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + i.documentTop - l.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, o);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function U0(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = $n(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), o;
  return n && s && n.to <= e && s.from >= e && (o = n.type.prop(Ve.closedBy)) && o.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const mc = /* @__PURE__ */ sf(!1), G0 = /* @__PURE__ */ sf(!0);
function sf(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !i && o == r && U0(e, o);
      i && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new br(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Sd(u, o);
      for (c == null && (c = dr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", tr(e, c)];
      return a && d.push(tr(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: We.of(d) },
        range: X.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function $a(i, e) {
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
      range: X.range(o.mapPos(n.anchor, 1), o.mapPos(n.head, 1))
    };
  });
}
const j0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new br(i, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = $a(i, (o, r, l) => {
    let a = Sd(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = tr(i, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, q0 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update($a(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(wa) });
}), { userEvent: "input.indent" })), !0), Y0 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update($a(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = dr(s, i.tabSize), r = 0, l = tr(i, Math.max(0, o - Bi(i)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  n.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), X0 = (i) => (i.setTabFocusMode(), !0), J0 = [
  { key: "Ctrl-b", run: Id, shift: Kd, preventDefault: !0 },
  { key: "Ctrl-f", run: Rd, shift: _d },
  { key: "Ctrl-p", run: Vd, shift: jd },
  { key: "Ctrl-n", run: Hd, shift: qd },
  { key: "Ctrl-a", run: p0, shift: A0 },
  { key: "Ctrl-e", run: m0, shift: T0 },
  { key: "Ctrl-d", run: Zd },
  { key: "Ctrl-h", run: Yl },
  { key: "Ctrl-k", run: R0 },
  { key: "Ctrl-Alt-h", run: ef },
  { key: "Ctrl-o", run: V0 },
  { key: "Ctrl-t", run: H0 },
  { key: "Ctrl-v", run: ql }
], Z0 = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Id, shift: Kd, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: o0, shift: y0, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: d0, shift: C0, preventDefault: !0 },
  { key: "ArrowRight", run: Rd, shift: _d, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: r0, shift: b0, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: f0, shift: M0, preventDefault: !0 },
  { key: "ArrowUp", run: Vd, shift: jd, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: hc, shift: fc },
  { mac: "Ctrl-ArrowUp", run: ac, shift: uc },
  { key: "ArrowDown", run: Hd, shift: qd, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: dc, shift: pc },
  { mac: "Ctrl-ArrowDown", run: ql, shift: cc },
  { key: "PageUp", run: ac, shift: uc },
  { key: "PageDown", run: ql, shift: cc },
  { key: "Home", run: h0, shift: S0, preventDefault: !0 },
  { key: "Mod-Home", run: hc, shift: fc },
  { key: "End", run: c0, shift: x0, preventDefault: !0 },
  { key: "Mod-End", run: dc, shift: pc },
  { key: "Enter", run: mc, shift: mc },
  { key: "Mod-a", run: $0 },
  { key: "Backspace", run: Yl, shift: Yl, preventDefault: !0 },
  { key: "Delete", run: Zd, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: ef, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: I0, preventDefault: !0 },
  { mac: "Mod-Backspace", run: P0, preventDefault: !0 },
  { mac: "Mod-Delete", run: N0, preventDefault: !0 }
].concat(/* @__PURE__ */ J0.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), Q0 = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: a0, shift: k0 },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: u0, shift: w0 },
  { key: "Alt-ArrowUp", run: z0 },
  { key: "Shift-Alt-ArrowUp", run: F0 },
  { key: "Alt-ArrowDown", run: W0 },
  { key: "Shift-Alt-ArrowDown", run: K0 },
  { key: "Mod-Alt-ArrowUp", run: B0 },
  { key: "Mod-Alt-ArrowDown", run: O0 },
  { key: "Escape", run: E0 },
  { key: "Mod-Enter", run: G0 },
  { key: "Alt-l", mac: "Ctrl-l", run: D0 },
  { key: "Mod-i", run: L0, preventDefault: !0 },
  { key: "Mod-[", run: Y0 },
  { key: "Mod-]", run: q0 },
  { key: "Mod-Alt-\\", run: j0 },
  { key: "Shift-Mod-k", run: _0 },
  { key: "Shift-Mod-\\", run: v0 },
  { key: "Mod-/", run: Zy },
  { key: "Alt-A", mac: "Ctrl-A", run: e0 },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: X0 }
].concat(Z0);
class gc {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.diagnostic = n;
  }
}
class wi {
  constructor(e, t, n) {
    this.diagnostics = e, this.panel = t, this.selected = n;
  }
  static init(e, t, n) {
    let s = n.facet(Us).markerFilter;
    s && (e = s(e, n));
    let o = e.slice().sort((f, m) => f.from - m.from || f.to - m.to), r = new Ci(), l = [], a = 0, u = n.doc.iter(), c = 0, d = n.doc.length;
    for (let f = 0; ; ) {
      let m = f == o.length ? null : o[f];
      if (!m && !l.length)
        break;
      let y, g;
      if (l.length)
        y = a, g = l.reduce(($, P) => Math.min($, P.to), m && m.from > y ? m.from : 1e8);
      else {
        if (y = m.from, y > d)
          break;
        g = m.to, l.push(m), f++;
      }
      for (; f < o.length; ) {
        let $ = o[f];
        if ($.from == y && ($.to > $.from || $.to == y))
          l.push($), f++, g = Math.min($.to, g);
        else {
          g = Math.min($.from, g);
          break;
        }
      }
      g = Math.min(g, d);
      let b = !1;
      if (l.some(($) => $.from == y && ($.to == g || g == d)) && (b = y == g, !b && g - y < 10)) {
        let $ = y - (c + u.value.length);
        $ > 0 && (u.next($), c = y);
        for (let P = y; ; ) {
          if (P >= g) {
            b = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > P)
            break;
          P = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let T = hf(l);
      if (b)
        r.add(y, y, Ze.widget({
          widget: new ib(T),
          diagnostics: l.slice()
        }));
      else {
        let $ = l.reduce((P, R) => R.markClass ? P + " " + R.markClass : P, "");
        r.add(y, g, Ze.mark({
          class: "cm-lintRange cm-lintRange-" + T + $,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((P) => P.to > g)
        }));
      }
      if (a = g, a == d)
        break;
      for (let $ = 0; $ < l.length; $++)
        l[$].to <= a && l.splice($--, 1);
    }
    let h = r.finish();
    return new wi(h, t, rs(h));
  }
}
function rs(i, e = null, t = 0) {
  let n = null;
  return i.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!n)
        n = new gc(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(n.diagnostic) < 0)
          return !1;
        n = new gc(n.from, o, n.diagnostic);
      }
  }), n;
}
function of(i, e) {
  let t = e.pos, n = e.end || t, s = i.state.facet(Us).hideOn(i, t, n);
  if (s != null)
    return s;
  let o = i.startState.doc.lineAt(e.pos);
  return !!(i.effects.some((r) => r.is(Cr)) || i.changes.touchesRange(o.from, Math.max(o.to, n)));
}
function eb(i, e) {
  return i.field(ln, !1) ? e : e.concat(Xe.appendConfig.of(db));
}
function il(i, e) {
  return {
    effects: eb(i, [Cr.of(e)])
  };
}
const Cr = /* @__PURE__ */ Xe.define(), rf = /* @__PURE__ */ Xe.define(), lf = /* @__PURE__ */ Xe.define(), ln = /* @__PURE__ */ un.define({
  create() {
    return new wi(Ze.none, null, null);
  },
  update(i, e) {
    if (e.docChanged && i.diagnostics.size) {
      let t = i.diagnostics.map(e.changes), n = null, s = i.panel;
      if (i.selected) {
        let o = e.changes.mapPos(i.selected.from, 1);
        n = rs(t, i.selected.diagnostic, o) || rs(t, null, o);
      }
      !t.size && s && e.state.facet(Us).autoPanel && (s = null), i = new wi(t, s, n);
    }
    for (let t of e.effects)
      if (t.is(Cr)) {
        let n = e.state.facet(Us).autoPanel ? t.value.length ? nr.open : null : i.panel;
        i = wi.init(t.value, n, e.state);
      } else t.is(rf) ? i = new wi(i.diagnostics, t.value ? nr.open : null, i.selected) : t.is(lf) && (i = new wi(i.diagnostics, i.panel, t.value));
    return i;
  },
  provide: (i) => [
    zl.from(i, (e) => e.panel),
    ye.decorations.from(i, (e) => e.diagnostics)
  ]
}), tb = /* @__PURE__ */ Ze.mark({ class: "cm-lintRange cm-lintRange-active" });
function nb(i, e, t) {
  let { diagnostics: n } = i.state.field(ln), s, o = -1, r = -1;
  n.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = i.state.facet(Us).tooltipFilter;
  return s && l && (s = l(s, i.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: af(i, s) };
    }
  } : null;
}
function af(i, e) {
  return Mn("ul", { class: "cm-tooltip-lint" }, e.map((t) => cf(i, t, !1)));
}
const vc = (i) => {
  let e = i.state.field(ln, !1);
  return !e || !e.panel ? !1 : (i.dispatch({ effects: rf.of(!1) }), !0);
}, Us = /* @__PURE__ */ de.define({
  combine(i) {
    return {
      sources: i.map((e) => e.source).filter((e) => e != null),
      ...hr(i.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: yc,
        tooltipFilter: yc,
        needsRefresh: (e, t) => e ? t ? (n) => e(n) || t(n) : e : t,
        hideOn: (e, t) => e ? t ? (n, s, o) => e(n, s, o) || t(n, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function yc(i, e) {
  return i ? e ? (t, n) => e(i(t, n), n) : i : e;
}
function uf(i) {
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
function cf(i, e, t) {
  var n;
  let s = t ? uf(e.actions) : [];
  return Mn("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, Mn("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(i) : e.message), (n = e.actions) === null || n === void 0 ? void 0 : n.map((o, r) => {
    let l = !1, a = (f) => {
      if (f.preventDefault(), l)
        return;
      l = !0;
      let m = rs(i.state.field(ln).diagnostics, e);
      m && o.apply(i, m.from, m.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, d = c < 0 ? u : [
      u.slice(0, c),
      Mn("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], h = o.markClass ? " " + o.markClass : "";
    return Mn("button", {
      type: "button",
      class: "cm-diagnosticAction" + h,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, d);
  }), e.source && Mn("div", { class: "cm-diagnosticSource" }, e.source));
}
class ib extends Ys {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return Mn("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class bc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = cf(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class nr {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          vc(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = uf(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = rs(this.view.state.field(ln).diagnostics, o);
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
    this.list = Mn("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: n
    }), this.dom = Mn("div", { class: "cm-panel-lint" }, this.list, Mn("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => vc(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(ln).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(ln), n = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
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
        d < 0 ? (h = new bc(this.view, c), this.items.splice(n, 0, h), s = !0) : (h = this.items[d], d > n && (this.items.splice(n, d - n), s = !0)), t && h.diagnostic == t.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), o = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), n++;
      }
    }); n < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new bc(this.view, {
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
    let t = this.view.state.field(ln), n = rs(t.diagnostics, this.items[e].diagnostic);
    n && this.view.dispatch({
      selection: { anchor: n.from, head: n.to },
      scrollIntoView: !0,
      effects: lf.of(n)
    });
  }
  static open(e) {
    return new nr(e);
  }
}
function No(i, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(i)}</svg>')`;
}
function xo(i) {
  return No(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${i}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const sb = /* @__PURE__ */ ye.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ xo("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ xo("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ xo("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ xo("#66d") },
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
function ob(i) {
  return i == "error" ? 4 : i == "warning" ? 3 : i == "info" ? 2 : 1;
}
function hf(i) {
  let e = "hint", t = 1;
  for (let n of i) {
    let s = ob(n.severity);
    s > t && (t = s, e = n.severity);
  }
  return e;
}
class df extends ui {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = hf(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let n = this.diagnostics, s = e.state.facet(Mr).tooltipFilter;
    return s && (n = s(n, e.state)), n.length && (t.onmouseover = () => lb(e, t, n)), t;
  }
}
function rb(i, e) {
  let t = (n) => {
    let s = e.getBoundingClientRect();
    if (!(n.clientX > s.left - 10 && n.clientX < s.right + 10 && n.clientY > s.top - 10 && n.clientY < s.bottom + 10)) {
      for (let o = n.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), i.state.field(ff) && i.dispatch({ effects: Da.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function lb(i, e, t) {
  function n() {
    let r = i.elementAtHeight(e.getBoundingClientRect().top + 5 - i.documentTop);
    i.coordsAtPos(r.from) && i.dispatch({ effects: Da.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: af(i, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, rb(i, e);
  }
  let { hoverTime: s } = i.state.facet(Mr), o = setTimeout(n, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(n, s);
  };
}
function ab(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = i.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let n = [];
  for (let s in t)
    n.push(new df(t[s]).range(+s));
  return Pe.of(n, !0);
}
const ub = /* @__PURE__ */ Qv({
  class: "cm-gutter-lint",
  markers: (i) => i.state.field(Xl),
  widgetMarker: (i, e, t) => {
    let n = [];
    return i.state.field(Xl).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && n.push(...r.diagnostics);
    }), n.length ? new df(n) : null;
  }
}), Xl = /* @__PURE__ */ un.define({
  create() {
    return Pe.empty;
  },
  update(i, e) {
    i = i.map(e.changes);
    let t = e.state.facet(Mr).markerFilter;
    for (let n of e.effects)
      if (n.is(Cr)) {
        let s = n.value;
        t && (s = t(s || [], e.state)), i = ab(e.state.doc, s.slice(0));
      }
    return i;
  }
}), Da = /* @__PURE__ */ Xe.define(), ff = /* @__PURE__ */ un.define({
  create() {
    return null;
  },
  update(i, e) {
    return i && e.docChanged && (i = of(e, i) ? null : { ...i, pos: e.changes.mapPos(i.pos) }), e.effects.reduce((t, n) => n.is(Da) ? n.value : t, i);
  },
  provide: (i) => ga.from(i)
}), cb = /* @__PURE__ */ ye.baseTheme({
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
    content: /* @__PURE__ */ No('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ No('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ No('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), hb = /* @__PURE__ */ qv(nb, { hideOn: of }), db = [
  ln,
  /* @__PURE__ */ ye.decorations.compute([ln], (i) => {
    let { selected: e, panel: t } = i.field(ln);
    return !e || !t || e.from == e.to ? Ze.none : Ze.set([
      tb.range(e.from, e.to)
    ]);
  }),
  hb,
  sb
], Mr = /* @__PURE__ */ de.define({
  combine(i) {
    return hr(i, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function fb(i = {}) {
  return [Mr.of(i), Xl, ub, cb, ff];
}
const kc = /* @__PURE__ */ Dt({
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
    const l = Sa.define({
      token(h) {
        return h.sol() && h.match(/^%.*/) ? "comment" : h.sol() && h.match(/^[A-Za-z]:.*/) ? "meta" : h.match(/^"[^"\n]*"/) ? "string" : h.match(/^\[K:[^\]\n]*\]/) ? "meta" : h.eat("|") ? "punctuation" : h.match(/^[zZ][0-9]*/) ? "atom" : h.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (h.next(), null);
      },
      startState: () => null
    }), a = kr.define([
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
    qs(() => {
      s.value && (o = new ye({
        parent: s.value,
        state: _e.create({
          doc: t.text,
          extensions: [
            ry(),
            Ov(),
            Nv(),
            ad.of(Q0),
            l,
            Ny(a),
            fb(),
            u,
            ye.lineWrapping,
            _e.readOnly.of(!!t.readonly),
            ye.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            ye.updateListener.of((h) => {
              h.docChanged && !r && n("change", h.state.doc.toString()), h.selectionSet && !r && h.transactions.some((f) => f.isUserEvent("select")) && n("cursor", h.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(il(o.state, c(o.state))));
    }), Hn(() => o?.destroy()), Re(
      () => t.text,
      (h) => {
        if (!o || o.state.doc.toString() === h) return;
        r = !0;
        const f = Math.min(o.state.selection.main.head, h.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: h }, selection: { anchor: f } }), r = !1, o.dispatch(il(o.state, c(o.state)));
      }
    ), Re(
      () => t.diagnostics,
      () => {
        o && o.dispatch(il(o.state, c(o.state)));
      }
    ), Re(
      () => t.reveal,
      (h) => {
        if (!o || !h) return;
        const f = o.state.doc.length, [m, y] = [Math.min(h[0], f), Math.min(h[1], f)], g = o.state.selection.main;
        g.from === m && g.to === y || (r = !0, o.dispatch({ selection: X.single(m, y) }), r = !1, d(o, m));
      }
    );
    function d(h, f) {
      const m = h.scrollDOM, y = h.lineBlockAt(f);
      (y.top < m.scrollTop || y.bottom > m.scrollTop + m.clientHeight) && (m.scrollTop = Math.max(0, y.top - m.clientHeight / 3));
    }
    return (h, f) => (w(), C("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), xn = 18, bi = 24, Rn = xn + bi, Cs = 22, Ms = 34, qt = 36, pb = 6, wc = 3, mb = 12, pf = 6, mf = 28, gb = 21, vb = 108;
function La(i) {
  return [
    ...i.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...i.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function Ar(i) {
  const e = Number(i.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function yb(i, e) {
  return e === "auto" ? Math.max(1, i.grid.snap) : Math.max(1, Math.round(Ar(i) / e));
}
function bb(i, e = 4, t = 24) {
  let n = i.length ? Math.min(...i.map((o) => o.pitch)) - e : 60, s = i.length ? Math.max(...i.map((o) => o.pitch)) + e : 79;
  if (s - n + 1 < t) {
    const o = t - (s - n + 1);
    n -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return n < 0 && ([n, s] = [0, Math.min(127, s - n)]), s > 127 && ([n, s] = [Math.max(0, n - (s - 127)), 127]), [n, s];
}
function kb(i) {
  const e = i.map((s) => s.pitch), t = Math.max(0, Math.min(gb, ...e.map((s) => s - 2))), n = Math.min(127, Math.max(vb, ...e.map((s) => s + 2)));
  return [t, n];
}
function wb(i, e) {
  const t = Rn + (e.lyrics ? Cs : 0), n = t + (e.source ? Ms : 0), s = La(i), [o, r] = kb(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(i.grid.units_per_quarter, 1e-9), u = Math.max(pf, Math.min(mf, Math.round(e.rowHeight ?? mb))), c = yb(i, e.snap), d = Math.max(1, Math.round(i.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: bb(s),
    total: i.total,
    snap: c,
    drawLength: Math.max(c, Math.round(d / c) * c),
    width: qt + i.total * a + 40,
    height: n + l * u,
    top: n,
    sourceTop: e.source ? t : null
  };
}
const Ke = (i, e) => qt + i * e.pxPerUnit, wn = (i, e) => (i - qt) / e.pxPerUnit, ls = (i, e) => e.top + (e.high - i) * e.rowHeight;
function gf(i, e, t, n) {
  const s = (ls(n, i) + ls(t, i) + i.rowHeight) / 2, o = Math.max(0, e - i.top), r = s - i.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, i.height - e), r)));
}
function xc(i, e, t, n) {
  const s = ls(n, i);
  return s >= e + i.top && s + i.rowHeight <= e + t ? null : gf(i, t, n, n);
}
function ir(i, e) {
  const t = e.high - Math.floor((i - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const Jl = (i, e) => Math.floor(i / e) * e, So = (i, e) => Math.round(i / e) * e;
function ni(i, e) {
  return {
    x: Ke(i.onset, e),
    y: ls(i.pitch, e) + 0.5,
    width: Math.max(2, i.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function sr(i, e, t) {
  const n = i.name.length * 7 + 10, s = e ? (e.onset - i.onset) * t.pxPerUnit - 2 : n;
  return Math.max(12, Math.min(n, s));
}
const xb = (i) => [1, 3, 6, 8, 10].includes((i % 12 + 12) % 12);
function Sb(i) {
  return `C${Math.floor(i / 12) - 1}`;
}
function Cb(i) {
  const e = [];
  for (const t of i.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const n = Number(t.meter.split("/")[0]) || 1, s = t.length / n;
    for (let o = 1; o < n; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function Sc(i, e, t, n, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, wn(i, s))), u = e - r;
  if (u < xn) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= Rn && u < s.top) return { area: "lyrics", unit: a };
  if (u < Rn) {
    for (let h = n.length - 1; h >= 0; h--) {
      const f = n[h], m = Ke(f.onset, s);
      if (i >= m && i <= m + sr(f, n[h + 1], s)) return { area: "chord", chord: f };
    }
    return { area: "lane", unit: a };
  }
  if (i - l < qt) return { area: "keys", pitch: ir(e, s) };
  const c = t.filter((h) => {
    const f = ni(h, s);
    return i >= f.x && i <= f.x + f.width && e >= f.y - 0.5 && e <= f.y + f.height + 0.5;
  }), d = c.find((h) => h.track === o) ?? c[0];
  if (d) {
    const h = ni(d, s), f = i >= h.x + h.width - Math.min(pb, h.width / 3) ? "end" : "body";
    return { area: "note", note: d, edge: f };
  }
  return { area: "grid", unit: a, pitch: ir(e, s) };
}
function vf(i, e, t) {
  return i.y0 < (i.from?.scrollTop ?? t) + e || i.y1 < t + e;
}
function yf(i, e, t = 0, n = 0) {
  const s = i.from?.scrollTop ?? t, o = i.from?.scrollLeft ?? n, r = (h, f) => Math.max(f + qt, Math.min(e.width, h)), l = (h, f) => Math.max(f + e.top, Math.min(e.height, h)), a = [r(i.x0, o), r(i.x1, n)], u = [l(i.y0, s), l(i.y1, t)], c = Math.min(...a), d = Math.min(...u);
  return { x: c, y: d, width: Math.max(...a) - c, height: Math.max(...u) - d };
}
function Mb(i, e = 0, t = Rn) {
  return vf(i, t, e);
}
function Ab(i, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : i.filter((n) => {
    const s = ni(n, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function Tb(i, e, t, n = 0, s = 0) {
  if (!vf(e, t.top, n)) return [];
  const o = yf(e, t, n, s);
  return o.width <= 0 ? [] : i.filter((r, l) => {
    const a = Ke(r.onset, t);
    return a < o.x + o.width && a + sr(r, i[l + 1], t) > o.x;
  });
}
function $b(i, e, t, n) {
  return { kind: "move", notes: i, anchor: e, fromUnit: t, fromPitch: n, delta: 0, semitones: 0 };
}
function Db(i, e = [], t = 1 / 0) {
  const n = e.filter((o) => o.track === i.track && o.onset > i.onset).map((o) => o.onset), s = Math.min(t, ...n);
  return { kind: "resize", note: i, end: i.onset + i.duration, overwrite: !1, limit: s };
}
function Lb(i, e, t, n) {
  const s = Math.max(0, Math.min(Jl(e, n.snap), n.total - 1));
  return { kind: "draw", track: i, start: s, end: Math.min(n.total, s + n.snap), pitch: t };
}
function Bb(i, e = i.onset) {
  return { kind: "chord", chord: i, fromUnit: e, to: i.onset };
}
const As = (i, e, t) => Math.max(e, Math.min(t, i));
function Ob(i, e, t, n, s) {
  switch (i.kind) {
    case "move": {
      const o = i.anchor.onset + (e - i.fromUnit), r = Math.min(...i.notes.map((h) => h.onset)), l = Math.max(...i.notes.map((h) => h.onset + h.duration)), a = As(So(o, n.snap) - i.anchor.onset, -r, n.total - l), u = Math.min(...i.notes.map((h) => h.pitch)), c = Math.max(...i.notes.map((h) => h.pitch)), d = As(t - i.fromPitch, -u, 127 - c);
      return { ...i, delta: a, semitones: d, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(n.snap, n.total - i.note.onset), r = s.alt ? n.total : Math.max(i.note.onset + i.note.duration, Math.min(n.total, i.limit)), l = As(So(e, n.snap), i.note.onset + Math.max(1, o), r);
      return { ...i, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= i.start ? i.start + n.snap : Math.max(i.start + n.snap, So(e, n.snap));
      return { ...i, end: Math.min(n.total, o) };
    }
    case "chord":
      return { ...i, to: As(So(i.chord.onset + e - i.fromUnit, n.snap), 0, n.total - 1) };
  }
}
function Eb(i, e) {
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
function Ib(i) {
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
function Rb(i) {
  return i ? i.kind === "move" ? i.copy ? /* @__PURE__ */ new Set() : new Set(i.notes.map((e) => e.id)) : i.kind === "resize" ? /* @__PURE__ */ new Set([i.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function Pb(i, e, t, n, s, o) {
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
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((h) => h.onset)), c = Math.max(...t.map((h) => h.onset + h.duration)), d = As(l * a, -u, s.total - c);
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
const Nb = /^(vocal|ins):\d+$/;
function as(i, e) {
  const t = i?.model?.tracks, n = /* @__PURE__ */ new Set();
  if (!t) return n;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (Nb.test(o)) n.add(o);
    else {
      const r = s.get(o);
      r && n.add(r);
    }
  return n;
}
function Gs(i) {
  return new Set(i.filter((e) => e.startsWith("chord:")));
}
function Co(i, e = []) {
  return [...i.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const bf = [
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
], Vb = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function kf(i, e) {
  let t = null;
  for (const n of i.measures) n.onset <= e && (t = n);
  return t;
}
function wf(i, e, t) {
  const n = i?.model;
  if (!n) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = as(i, e), o = Gs(e), r = La(n).filter((d) => s.has(d.id)), l = n.tracks.chords.filter((d) => o.has(d.id)), a = r.length === 1 ? n.tracks.chords.find((d) => d.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? kf(n, u) : t ? n.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function Hb(i, e) {
  const t = kf(i, e) ?? i.measures[0], n = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(n / o) + 1, l = n - (r - 1) * o, a = Ar(i), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: n, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function zb(i, e, t) {
  const n = i.measures[e - 1];
  return !n || !Number.isInteger(t) || t < 0 || t >= n.length ? null : n.onset + t;
}
const Wb = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, Fb = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function Zl(i) {
  return `${Fb[i % 12]}${Math.floor(i / 12) - 1}`;
}
function Kb(i) {
  const e = i.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const n = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + Wb[t[1].toUpperCase()] + n;
  return s >= 0 && s <= 127 ? s : null;
}
function _b(i) {
  const e = Ar(i), t = [];
  for (const n of [32, 16, 8, 4, 2, 1]) {
    e % n === 0 && t.push({ label: `1/${n}`, units: e / n });
    const s = e / n * 1.5;
    n >= 2 && n <= 16 && Number.isInteger(s) && t.push({ label: `1/${n}.`, units: s });
  }
  return t.sort((n, s) => n.units - s.units);
}
function Ub(i, e) {
  return !i.length || i.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: i.map((t) => t.id), midi: e };
}
function Xn(i, e, t = []) {
  return !i.length && !t.length || i.some((n) => n.pitch + e < 0 || n.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...i.map((n) => n.id), ...t.map((n) => n.id)], semitones: e };
}
function Cc(i, e) {
  return !i.length || i.every((t) => t.track === e) ? null : { op: "move_notes", ids: i.map((t) => t.id), track: e };
}
function Gb(i, e, t) {
  return t === null || t === e.onset || t + e.duration > i.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function jb(i, e, t, n) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > i.total ? null : { op: "resize_note", id: e.id, duration: t, mode: n };
}
function qb(i, e, t) {
  const n = e.trim();
  return n ? t?.name === n ? null : { op: "put_chord", onset: i, name: n } : t ? { op: "delete_chord", onset: i } : null;
}
function Yb(i, e) {
  return e === null || e === i.onset ? null : { op: "move_chord", onset: i.onset, to: e };
}
function Mc(i, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? i.n : i.n + 1, count: t };
}
function Xb(i, e = 1) {
  return { op: "duplicate_measures", bar: i.n, count: e };
}
function Jb(i, e, t = 1) {
  return i.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Ac(i, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === i.meter ? null : { op: "change_meter", bar: i.n, count: 1, meter: t };
}
function xf(i, e) {
  return i.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function Zb(i, e) {
  return !bf.includes(e) || e === i.key ? null : { op: "put_key", onset: i.onset, key: e };
}
function Qb(i, e) {
  const t = xf(i, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function e1(i, e) {
  return i === "text" ? "text" : i === "daw" ? "daw" : i === "review" ? "review" : e;
}
const t1 = {
  class: "inspector",
  "aria-label": "Inspector"
}, n1 = {
  key: 0,
  class: "facts"
}, i1 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, s1 = {
  key: 0,
  class: "facts"
}, o1 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, r1 = ["disabled"], l1 = ["disabled"], a1 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, u1 = ["disabled"], c1 = ["disabled"], h1 = ["disabled", "onKeydown"], d1 = ["disabled"], f1 = ["disabled"], p1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, m1 = ["disabled", "onKeydown"], g1 = ["disabled", "aria-label", "onKeydown"], v1 = { class: "facts" }, y1 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, b1 = ["disabled", "aria-label"], k1 = ["disabled"], w1 = ["value"], x1 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, S1 = ["disabled"], C1 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, M1 = ["disabled", "onKeydown"], A1 = { class: "field" }, T1 = ["disabled"], $1 = ["disabled"], D1 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, L1 = {
  key: 0,
  class: "facts"
}, B1 = { class: "field" }, O1 = ["disabled", "onKeydown"], E1 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, I1 = ["disabled"], R1 = ["disabled"], P1 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, N1 = ["disabled", "onKeydown"], V1 = ["disabled", "onKeydown"], H1 = { class: "field" }, z1 = ["disabled"], W1 = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, F1 = { class: "facts" }, K1 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, _1 = ["disabled"], U1 = ["disabled"], G1 = { class: "field" }, j1 = ["disabled"], q1 = ["aria-label"], Y1 = { class: "facts" }, X1 = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, J1 = ["disabled"], Z1 = ["disabled"], Q1 = ["disabled"], ek = ["disabled"], tk = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, nk = ["disabled"], ik = { id: "plenio-meters" }, sk = ["value"], ok = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, rk = ["disabled"], lk = ["value"], ak = ["disabled"], uk = {
  key: 4,
  class: "facts"
}, ck = {
  key: 5,
  class: "error"
}, hk = /* @__PURE__ */ Dt({
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
    const e = i, t = B(() => e.view?.model ?? null), n = B(() => wf(e.view, e.selection, e.fallbackBar)), s = B(() => n.value.notes.length === 1 ? n.value.notes[0] : null), o = B(() => n.value.chords.length === 1 && !n.value.notes.length ? n.value.chords[0] : null), r = B(() => n.value.measure), l = B(() => !e.readonly && !e.stale && !e.busy), a = B(() => t.value ? _b(t.value) : []), u = B(() => t.value && r.value ? xf(t.value, r.value) : null), c = B(() => {
      const z = s.value?.onset ?? o.value?.onset;
      return t.value && z !== void 0 ? Hb(t.value, z) : null;
    }), d = B(() => {
      const z = new Set(n.value.notes.map((A) => A.track));
      return z.size === 1 ? [...z][0] : z.size ? "mixed" : null;
    }), h = W(""), f = W(1), m = W(0), y = W(1), g = W(!1), b = W(""), T = W("4/4"), $ = W("C");
    Re(
      [s, o, r, () => n.value.chordAtNote],
      () => {
        const z = s.value;
        h.value = z ? Zl(z.pitch) : "", y.value = z?.duration ?? 1, f.value = c.value?.bar ?? 1, m.value = c.value?.offset ?? 0, b.value = (z ? n.value.chordAtNote?.name : o.value?.name) ?? "", T.value = r.value?.meter ?? "4/4", $.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const P = W(null);
    async function R(z) {
      !z || !l.value || (P.value = null, await e.operate(z));
    }
    function V() {
      const z = Kb(h.value);
      if (z === null) {
        P.value = `"${h.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, h.value = s.value ? Zl(s.value.pitch) : "";
        return;
      }
      R(Ub(n.value.notes, z));
    }
    function O() {
      const z = t.value;
      if (!z) return;
      const A = zb(z, Number(f.value), Number(m.value));
      if (A === null) {
        P.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? R(Gb(z, s.value, A)) : o.value && R(Yb(o.value, A));
    }
    function _(z = Number(y.value)) {
      const A = t.value;
      !A || !s.value || R(jb(A, s.value, z, g.value ? "overwrite" : e.resizeMode));
    }
    function N() {
      const z = s.value?.onset ?? o.value?.onset;
      z !== void 0 && R(qb(z, b.value, s.value ? n.value.chordAtNote : o.value));
    }
    function ne(z) {
      const A = [...n.value.notes.map((H) => H.id), ...n.value.chords.map((H) => H.id)];
      A.length && R({ op: z ? "delete_close_gap" : "delete", ids: A });
    }
    return (z, A) => (w(), C("aside", t1, [
      t.value ? (w(), C(fe, { key: 1 }, [
        n.value.notes.length ? (w(), C("section", i1, [
          p("h4", null, [
            ae(I(s.value ? `${d.value === "vocal" ? "Vocal" : "Ins"} note` : `${n.value.notes.length} notes`) + " ", 1),
            c.value ? (w(), C("span", s1, I(c.value.text), 1)) : G("", !0)
          ]),
          p("div", o1, [
            A[36] || (A[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: ze({ active: d.value === "vocal" }),
              disabled: !l.value,
              onClick: A[0] || (A[0] = (H) => R(E(Cc)(n.value.notes, "vocal")))
            }, "Vocal", 10, r1),
            p("button", {
              class: ze({ active: d.value === "ins" }),
              disabled: !l.value,
              onClick: A[1] || (A[1] = (H) => R(E(Cc)(n.value.notes, "ins")))
            }, "Ins", 10, l1)
          ]),
          p("div", a1, [
            A[37] || (A[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: A[2] || (A[2] = (H) => R(E(Xn)(n.value.notes, -12, n.value.chords)))
            }, "−8va", 8, u1),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: A[3] || (A[3] = (H) => R(E(Xn)(n.value.notes, -1, n.value.chords)))
            }, "−1", 8, c1),
            s.value ? Oe((w(), C("input", {
              key: 0,
              "onUpdate:modelValue": A[4] || (A[4] = (H) => h.value = H),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: st(Ue(V, ["prevent"]), ["enter"]),
              onChange: V
            }, null, 40, h1)), [
              [dt, h.value]
            ]) : G("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: A[5] || (A[5] = (H) => R(E(Xn)(n.value.notes, 1, n.value.chords)))
            }, "+1", 8, d1),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: A[6] || (A[6] = (H) => R(E(Xn)(n.value.notes, 12, n.value.chords)))
            }, "+8va", 8, f1)
          ]),
          s.value ? (w(), C(fe, { key: 0 }, [
            p("div", p1, [
              A[38] || (A[38] = p("span", { class: "name" }, "start", -1)),
              A[39] || (A[39] = ae(" bar ", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": A[7] || (A[7] = (H) => f.value = H),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: st(Ue(O, ["prevent"]), ["enter"]),
                onChange: O
              }, null, 40, m1), [
                [
                  dt,
                  f.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              A[40] || (A[40] = ae(" + ", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": A[8] || (A[8] = (H) => m.value = H),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: st(Ue(O, ["prevent"]), ["enter"]),
                onChange: O
              }, null, 40, g1), [
                [
                  dt,
                  m.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", v1, "× " + I(t.value.unit), 1)
            ]),
            p("div", y1, [
              A[42] || (A[42] = p("span", { class: "name" }, "length", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": A[9] || (A[9] = (H) => y.value = H),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: A[10] || (A[10] = st(Ue((H) => _(), ["prevent"]), ["enter"])),
                onChange: A[11] || (A[11] = (H) => _())
              }, null, 40, b1), [
                [
                  dt,
                  y.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: A[12] || (A[12] = (H) => _(Number(H.target.value)))
              }, [
                A[41] || (A[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (w(!0), C(fe, null, xe(a.value, (H) => (w(), C("option", {
                  key: H.label,
                  value: H.units
                }, I(H.label), 9, w1))), 128))
              ], 40, k1)
            ]),
            p("label", x1, [
              Oe(p("input", {
                "onUpdate:modelValue": A[13] || (A[13] = (H) => g.value = H),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, S1), [
                [Nt, g.value]
              ]),
              A[43] || (A[43] = ae(" longer: over the next note ", -1))
            ]),
            p("div", C1, [
              A[44] || (A[44] = p("span", { class: "name" }, "chord", -1)),
              Oe(p("input", {
                "onUpdate:modelValue": A[14] || (A[14] = (H) => b.value = H),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: st(Ue(N, ["prevent"]), ["enter"]),
                onChange: N
              }, null, 40, M1), [
                [dt, b.value]
              ])
            ])
          ], 64)) : G("", !0),
          p("div", A1, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: A[15] || (A[15] = (H) => ne(!1))
            }, "→ rest", 8, T1),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: A[16] || (A[16] = (H) => ne(!0))
            }, "close gap", 8, $1)
          ])
        ])) : o.value ? (w(), C("section", D1, [
          p("h4", null, [
            A[45] || (A[45] = ae(" Chord symbol ", -1)),
            c.value ? (w(), C("span", L1, I(c.value.text), 1)) : G("", !0)
          ]),
          p("div", B1, [
            A[46] || (A[46] = p("span", { class: "name" }, "name", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": A[17] || (A[17] = (H) => b.value = H),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: st(Ue(N, ["prevent"]), ["enter"]),
              onChange: N
            }, null, 40, O1), [
              [dt, b.value]
            ])
          ]),
          p("div", E1, [
            A[47] || (A[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: A[18] || (A[18] = (H) => R(E(Xn)([], -1, n.value.chords)))
            }, "−1", 8, I1),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: A[19] || (A[19] = (H) => R(E(Xn)([], 1, n.value.chords)))
            }, "+1", 8, R1)
          ]),
          p("div", P1, [
            A[48] || (A[48] = p("span", { class: "name" }, "start", -1)),
            A[49] || (A[49] = ae(" bar ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": A[20] || (A[20] = (H) => f.value = H),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: st(Ue(O, ["prevent"]), ["enter"]),
              onChange: O
            }, null, 40, N1), [
              [
                dt,
                f.value,
                void 0,
                { number: !0 }
              ]
            ]),
            A[50] || (A[50] = ae(" + ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": A[21] || (A[21] = (H) => m.value = H),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: st(Ue(O, ["prevent"]), ["enter"]),
              onChange: O
            }, null, 40, V1), [
              [
                dt,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", H1, [
            p("button", {
              disabled: !l.value,
              onClick: A[22] || (A[22] = (H) => ne(!1))
            }, "remove", 8, z1)
          ])
        ])) : n.value.chords.length > 1 ? (w(), C("section", W1, [
          p("h4", null, [
            ae(I(n.value.chords.length) + " chord symbols ", 1),
            p("span", F1, I(n.value.chords.map((H) => H.name).join(" ")), 1)
          ]),
          p("div", K1, [
            A[51] || (A[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: A[23] || (A[23] = (H) => R(E(Xn)([], -1, n.value.chords)))
            }, "−1", 8, _1),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: A[24] || (A[24] = (H) => R(E(Xn)([], 1, n.value.chords)))
            }, "+1", 8, U1)
          ]),
          p("div", G1, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: A[25] || (A[25] = (H) => ne(!1))
            }, "remove", 8, j1)
          ])
        ])) : G("", !0),
        r.value ? (w(), C("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            ae(" Bar " + I(r.value.n) + " ", 1),
            p("span", Y1, I(r.value.meter) + " · " + I(r.value.key), 1)
          ]),
          p("div", X1, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: A[26] || (A[26] = (H) => R(E(Mc)(r.value, "before")))
            }, "+ before", 8, J1),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: A[27] || (A[27] = (H) => R(E(Mc)(r.value, "after")))
            }, "+ after", 8, Z1),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: A[28] || (A[28] = (H) => R(E(Xb)(r.value)))
            }, "duplicate", 8, Q1),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: A[29] || (A[29] = (H) => R(E(Jb)(t.value, r.value)))
            }, "delete", 8, ek)
          ]),
          p("div", tk, [
            A[52] || (A[52] = p("span", { class: "name" }, "meter", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": A[30] || (A[30] = (H) => T.value = H),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: A[31] || (A[31] = st(Ue((H) => R(E(Ac)(r.value, T.value)), ["prevent"]), ["enter"])),
              onChange: A[32] || (A[32] = (H) => R(E(Ac)(r.value, T.value)))
            }, null, 40, nk), [
              [dt, T.value]
            ]),
            p("datalist", ik, [
              (w(!0), C(fe, null, xe(E(Vb), (H) => (w(), C("option", {
                key: H,
                value: H
              }, null, 8, sk))), 128))
            ])
          ]),
          p("div", ok, [
            A[53] || (A[53] = p("span", { class: "name" }, "key", -1)),
            Oe(p("select", {
              "onUpdate:modelValue": A[33] || (A[33] = (H) => $.value = H),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: A[34] || (A[34] = (H) => R(E(Zb)(r.value, $.value)))
            }, [
              (w(!0), C(fe, null, xe(E(bf), (H) => (w(), C("option", {
                key: H,
                value: H
              }, I(H), 9, lk))), 128))
            ], 40, rk), [
              [oi, $.value]
            ]),
            u.value ? (w(), C("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: A[35] || (A[35] = (H) => R(E(Qb)(t.value, r.value)))
            }, "remove change", 8, ak)) : G("", !0)
          ])
        ], 8, q1)) : G("", !0),
        !n.value.notes.length && !o.value && !r.value ? (w(), C("p", uk, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : G("", !0),
        P.value ? (w(), C("p", ck, I(P.value), 1)) : G("", !0)
      ], 64)) : (w(), C("p", n1, I(i.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), dk = { class: "keys-help" }, fk = ["aria-expanded"], pk = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, mk = /* @__PURE__ */ Dt({
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
    return (n, s) => (w(), C("span", dk, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, fk),
      e.value ? (w(), C("div", pk, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (w(), C(fe, null, xe(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, I(o.title), 1),
          p("table", null, [
            (w(!0), C(fe, null, xe(o.rows, ([r, l]) => (w(), C("tr", { key: r }, [
              p("th", null, I(r), 1),
              p("td", null, I(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : G("", !0)
    ]));
  }
}), gk = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], Ql = [4, 8, 16, 32, 64];
function vk(i) {
  return i.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function yk(i) {
  const e = {};
  for (const t of i) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function bk(i) {
  const e = i?.model?.unit ?? i?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), n = Number.isFinite(t) && t > 0 ? t : 16, s = Ql.filter((o) => o <= n);
  return s.length ? s[s.length - 1] : Ql[0];
}
function kk(i) {
  let e = "";
  for (let t = 0; t < i.length; t += 8192)
    e += String.fromCharCode(...i.subarray(t, t + 8192));
  return btoa(e);
}
function wk(i) {
  const e = atob(i), t = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
  return t;
}
function Xi(i, e, t = "audio/midi") {
  const n = new ArrayBuffer(e.length);
  new Uint8Array(n).set(e);
  const s = URL.createObjectURL(new Blob([n], { type: t })), o = document.createElement("a");
  o.href = s, o.download = i, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function xk(i) {
  const e = i.name.trim() || "unnamed";
  return i.notes === 1 ? `${e} · 1 note` : `${e} · ${i.notes} notes`;
}
function Sk(i, e, t, { current: n = 0, keep: s = !0 } = {}) {
  const o = [...i];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && n) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${n} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Tc(i) {
  return typeof i == "object" && i !== null && !Array.isArray(i);
}
class Ck {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Tc(t) && Tc(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function Ji(i) {
  return i instanceof Uc ? `${i.message}${i.hint ? ` — ${i.hint}` : ""}` : String(i instanceof Error ? i.message : i);
}
function Mk(i) {
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
function Ak(i, e) {
  const t = _i(null), n = _i(null), s = W(null), o = W(!1), r = W(!1), l = W(null), a = W(null), u = W([]), c = W([]), d = new Ck(i.text), h = W(0);
  let f = "", m = 0, y, g = !1;
  const b = B(() => t.value && t.value.sha256 && !o.value ? t.value : null), T = B(() => Si(n.value, c.value[0])), $ = B(() => (h.value, d.canUndo)), P = B(() => (h.value, d.canRedo)), R = B(() => (h.value, d.undoLabel)), V = B(() => (h.value, d.redoLabel)), O = B(
    () => Mk({
      text: i.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), _ = B(
    () => s.value !== null && s.value !== i.text && !!t.value && !t.value.ok
  );
  function N(ue, Ae) {
    if (t.value = ue, a.value = null, ue.ok) {
      n.value = ue, s.value = Ae;
      const ee = lm(ue);
      c.value = c.value.filter((K) => ee.has(K));
    }
  }
  async function ne() {
    const ue = i.text, Ae = ++m;
    if (f = ue, !ue.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const ee = await Xf(e.fetcher, ue, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Ae !== m || f !== ue || i.text !== ue) return;
      N(ee, ue), l.value = null;
    } catch (ee) {
      i.text === ue && (l.value = Ji(ee), a.value = l.value);
    } finally {
      i.text === ue && (o.value = !1);
    }
  }
  function z(ue = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(y), y = setTimeout(() => {
      ne();
    }, ue);
  }
  function A(ue, Ae, ee, K) {
    ue !== i.text && (g = !0, i.text = ue, g = !1, d.record(ue, Ae, { group: ee, extra: K }), h.value++, e.onEdit?.());
  }
  function H(ue) {
    A(ue, "typing", "typing"), z();
  }
  function pe(ue, Ae, ee = null, K) {
    return ue === i.text ? !1 : (d.seal(), K && d.annotate(K.before), A(ue, Ae, void 0, K?.after), d.seal(), clearTimeout(y), f = ue, o.value = !1, u.value = [], ee && ee.ok && (ee.lyrics || !e.lyrics?.()) ? (N(ee, ue), l.value = null) : z(0), !0);
  }
  async function ve(ue) {
    const Ae = i.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++m;
      const ee = await Jf(e.fetcher, Ae, ue, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (i.text !== Ae)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const K = e.onTransform?.(ee, ue);
      return d.seal(), K && d.annotate(K.before), A(ee.abc, ee.changes[0] ?? ue.op, void 0, K?.after), d.seal(), clearTimeout(y), o.value = !1, f = ee.abc, N(ee.analysis, ee.abc), u.value = [...ee.changes, ...ee.warnings.map((Z) => `warning: ${Z}`)], ee.select.length && (c.value = am(ee.analysis, ee.select)), !0;
    } catch (ee) {
      return l.value = Ji(ee), !1;
    } finally {
      r.value = !1;
    }
  }
  function ie(ue) {
    ue && (g = !0, i.text = ue.text, g = !1, ue.extra !== void 0 && e.onRestore?.(ue.extra), h.value++, e.onEdit?.(), u.value = [], z(0));
  }
  const le = () => ie(d.undo()), Ee = () => ie(d.redo());
  function Se() {
    const ue = s.value;
    return ue === null || ue === i.text || !n.value ? !1 : (d.seal(), A(ue, "revert to the last valid score"), d.seal(), clearTimeout(y), f = ue, o.value = !1, t.value = n.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Be(ue) {
    c.value = ue;
  }
  function Me(ue, Ae, ee) {
    d.seal(), d.annotate(Ae), d.record(i.text, ue, { extra: ee, side: !0 }), d.seal(), h.value++;
  }
  function j() {
    r.value ? setTimeout(j, 60) : i.text.trim() && !o.value && ne();
  }
  Re(
    () => i.text,
    (ue) => {
      g || (d.seal(), d.record(ue, "document replaced"), d.seal(), h.value++, z(0));
    },
    { flush: "sync" }
  );
  function Qe() {
    clearTimeout(y);
  }
  return z(0), ks({
    view: t,
    lastValid: n,
    lastValidText: s,
    current: b,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: T,
    canUndo: $,
    canRedo: P,
    undoLabel: R,
    redoLabel: V,
    commitBlock: O,
    canRevert: _,
    typed: H,
    replaceText: pe,
    operate: ve,
    undo: le,
    redo: Ee,
    revertToLastValid: Se,
    select: Be,
    analyze: ne,
    refreshLyrics: j,
    recordSide: Me,
    dispose: Qe
  });
}
const Tk = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, $k = { class: "facts" }, Dk = { class: "body" }, Lk = {
  key: 0,
  class: "hint"
}, Bk = {
  key: 1,
  class: "error",
  role: "alert"
}, Ok = { class: "tracks" }, Ek = { class: "number" }, Ik = ["onUpdate:modelValue", "aria-label"], Rk = ["value", "title"], Pk = {
  key: 0,
  class: "hint"
}, Nk = { class: "controls" }, Vk = { title: "Foreign timing is quantised to this note value" }, Hk = ["value"], zk = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, Wk = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, Fk = { class: "report" }, Kk = { key: 0 }, _k = ["disabled"], Uk = /* @__PURE__ */ Dt({
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
    const t = i, n = e, s = W(!1), o = W(null), r = W(null), l = W([]), a = W(bk(t.view)), u = W(!1), c = W(t.keepsGuide), d = B(() => l.value.filter((b) => b.notes > 0)), h = B(() => l.value.filter((b) => b.notes === 0)), f = B(
      () => r.value ? Sk(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let m = 0;
    async function y(b) {
      const T = ++m;
      s.value = !0, o.value = null;
      try {
        const $ = await Zf(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: b ? yk(l.value) : void 0
        });
        if (T !== m) return;
        r.value = $, b || (l.value = vk($.tracks));
      } catch ($) {
        T === m && (o.value = Ji($));
      } finally {
        T === m && (s.value = !1);
      }
    }
    function g() {
      y(!0);
    }
    return qs(() => {
      y(!1);
    }), (b, T) => (w(), C("div", {
      class: "plenio-overlay",
      onMousedown: T[9] || (T[9] = Ue(($) => n("close"), ["self"]))
    }, [
      p("div", Tk, [
        p("header", null, [
          T[10] || (T[10] = p("h2", null, "Import MIDI", -1)),
          p("span", $k, I(i.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: T[0] || (T[0] = ($) => n("close"))
          }, "×")
        ]),
        p("div", Dk, [
          s.value ? (w(), C("p", Lk, "Reading the file…")) : G("", !0),
          o.value ? (w(), C("p", Bk, I(o.value), 1)) : G("", !0),
          r.value && !o.value ? (w(), C(fe, { key: 2 }, [
            p("table", Ok, [
              T[11] || (T[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), C(fe, null, xe(d.value, ($) => (w(), C("tr", {
                  key: $.index
                }, [
                  p("td", null, [
                    p("span", Ek, I($.number), 1),
                    ae(" " + I(E(xk)($)), 1)
                  ]),
                  p("td", null, [
                    Oe(p("select", {
                      "onUpdate:modelValue": (P) => $.role = P,
                      "aria-label": `Role of track ${$.number}`,
                      onChange: T[1] || (T[1] = (P) => g())
                    }, [
                      (w(!0), C(fe, null, xe(E(gk), (P) => (w(), C("option", {
                        key: P.value,
                        value: P.value,
                        title: P.title
                      }, I(P.label), 9, Rk))), 128))
                    ], 40, Ik), [
                      [oi, $.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            h.value.length ? (w(), C("p", Pk, " Empty track(s) not shown: " + I(h.value.map(($) => $.number).join(", ")) + ". ", 1)) : G("", !0),
            p("p", Nk, [
              p("label", Vk, [
                T[12] || (T[12] = ae(" grid ", -1)),
                Oe(p("select", {
                  "onUpdate:modelValue": T[2] || (T[2] = ($) => a.value = $),
                  "aria-label": "Import grid",
                  onChange: T[3] || (T[3] = ($) => g())
                }, [
                  (w(!0), C(fe, null, xe(E(Ql), ($) => (w(), C("option", {
                    key: $,
                    value: $
                  }, "1/" + I($), 9, Hk))), 128))
                ], 544), [
                  [
                    oi,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", zk, [
                Oe(p("input", {
                  "onUpdate:modelValue": T[4] || (T[4] = ($) => u.value = $),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: T[5] || (T[5] = ($) => g())
                }, null, 544), [
                  [Nt, u.value]
                ]),
                T[13] || (T[13] = ae(" read chords from the notes ", -1))
              ]),
              i.keepsGuide && r.value.guide.length ? (w(), C("label", Wk, [
                Oe(p("input", {
                  "onUpdate:modelValue": T[6] || (T[6] = ($) => c.value = $),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [Nt, c.value]
                ]),
                T[14] || (T[14] = ae(" keep the Guide notes ", -1))
              ])) : G("", !0)
            ]),
            T[15] || (T[15] = p("h3", null, "What the import did", -1)),
            p("ul", Fk, [
              (w(!0), C(fe, null, xe(f.value, ($, P) => (w(), C("li", { key: P }, I($), 1))), 128)),
              f.value.length ? G("", !0) : (w(), C("li", Kk, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : G("", !0)
        ]),
        p("footer", null, [
          T[16] || (T[16] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            onClick: T[7] || (T[7] = ($) => n("close"))
          }, "Cancel"),
          p("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: T[8] || (T[8] = ($) => r.value && n("insert", r.value, c.value))
          }, " Insert ", 8, _k)
        ])
      ])
    ], 32));
  }
}), Gk = {
  key: 0,
  class: "stale-note",
  role: "status"
}, jk = {
  key: 1,
  class: "error"
}, qk = /* @__PURE__ */ Dt({
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
    function h(T) {
      const $ = /* @__PURE__ */ new Map(), P = T.lines ?? [];
      for (const R of P)
        for (const V of R.staff ?? [])
          for (const O of V.voices ?? [])
            for (const _ of O)
              _.el_type === "note" && typeof _.endChar == "number" && _.abselem?.elemset && $.set(_.endChar, _.abselem.elemset);
      return $;
    }
    function f(T) {
      const $ = Si(n.view, T);
      return $ ? l.get($.display[1]) ?? [] : [];
    }
    function m(T, $) {
      for (const P of a[T]) P.classList.remove(T);
      a[T] = $.flatMap(f);
      for (const P of a[T]) P.classList.add(T);
    }
    function y() {
      const T = o.value;
      if (!T) return;
      const $ = n.view?.display_abc;
      if (!$) {
        T.innerHTML = "", l = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const P = getComputedStyle(T).color || "#dddddd";
        d = T.clientWidth;
        const R = Rp.renderAbc(T, $, {
          add_classes: !0,
          responsive: "resize",
          scale: n.zoom,
          foregroundColor: P,
          selectionColor: P,
          staffwidth: Math.max(480, Math.floor(T.clientWidth / n.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (V) => {
            const O = V;
            if (!n.view || typeof O.startChar != "number" || typeof O.endChar != "number") return;
            const _ = um(n.view, O.startChar, O.endChar);
            _ && s("select", _.id, u);
          }
        });
        l = h(R[0]), a = { "plenio-selected": [], "plenio-playing": [] }, m("plenio-selected", n.selection), m("plenio-playing", n.playing), r.value = null;
      } catch (P) {
        r.value = `The notation could not be drawn: ${P instanceof Error ? P.message : String(P)}`;
      }
    }
    function g(T) {
      const [$] = f(T), P = o.value?.parentElement;
      if (!$ || !P) return;
      const R = P.getBoundingClientRect(), V = $.getBoundingClientRect();
      V.top < R.top ? P.scrollTop += V.top - R.top - 8 : V.bottom > R.bottom && (P.scrollTop += V.bottom - R.bottom + 8), V.left < R.left ? P.scrollLeft += V.left - R.left - 8 : V.right > R.right && (P.scrollLeft += V.right - R.right + 8);
    }
    e({ reveal: g }), Re(() => [n.view?.display_abc, n.zoom], () => Sn(y)), Re(
      () => n.selection,
      (T) => {
        m("plenio-selected", T), T[0] && g(T[0]);
      }
    ), Re(
      () => n.playing,
      (T) => {
        m("plenio-playing", T), T[0] && g(T[0]);
      }
    ), qs(() => {
      y(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - d) > 40 && y();
      }), o.value && c.observe(o.value);
    }), Hn(() => c?.disconnect());
    function b(T) {
      u = T.shiftKey || T.ctrlKey || T.metaKey;
    }
    return (T, $) => (w(), C("div", {
      class: ze(["notation-wrap", { stale: i.stale }])
    }, [
      i.stale ? (w(), C("p", Gk, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : G("", !0),
      r.value ? (w(), C("p", jk, I(r.value), 1)) : G("", !0),
      p("div", {
        ref_key: "host",
        ref: o,
        class: "notation",
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: b
      }, null, 544)
    ], 2));
  }
});
function Is(i, e) {
  let t = 1;
  for (const n of i.measures) {
    if (n.onset > e) break;
    t = n.n;
  }
  return t;
}
function $c(i, e) {
  return i.measures[Math.max(0, Math.min(i.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Dc(i, e, t) {
  const n = e > 0 ? Math.round(i / e) * e : Math.round(i);
  return Math.max(0, Math.min(t, n));
}
function Ba(i, e) {
  const t = i.model;
  if (!t) return 0;
  const n = Is(t, e), s = t.measures[n - 1], o = i.bars[n - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function Oa(i, e) {
  const t = i.model;
  if (!t || !i.bars.length || !t.measures.length) return null;
  let n = 0;
  for (let l = 0; l < i.bars.length && !(i.bars[l].start_s > e + To); l++)
    n = l;
  const s = i.bars[n], o = t.measures[Math.min(n, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function Sf(i, e) {
  const t = Is(i, e), n = i.measures[t - 1];
  if (!n) return "1.1.1";
  const s = Number(n.meter.split("/")[0]) || 1, o = n.length / s, r = Math.max(0, e - n.onset), l = Math.min(s - 1, Math.floor(r / o)), a = i.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const Yk = 0.25, Xk = 30, sl = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, ol = 6e-3;
class Jk {
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
  sounds = Qf();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), Xk), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + Yk; )
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
        u = Ho(t, o, this.sounds[e.part], e.midi, n, { level: sl[e.part] });
      } catch {
        try {
          u = Ho(t, o, "plain", e.midi, n, { level: sl[e.part] });
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
    r.type = "square", r.frequency.value = ep(e.midi);
    const l = t.createGain(), a = sl.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + ol), o.gain.setValueAtTime(1, Math.max(r + ol, l - ol)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class Zk {
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
        s.resume(), this.off(e), this.tones.set(e, Ho(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
let Lc = null;
function ea(i, e = 0.35, t = "soft") {
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      Lc ??= new n();
      const s = Lc;
      s.resume();
      const o = s.currentTime + 0.01;
      Ho(s, s.destination, t, i, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const Qk = 200, Ni = /* @__PURE__ */ new Map(), ew = 2;
function tw(i, e) {
  if (i.numberOfChannels === 1) return i;
  const t = new e(1, 1, i.sampleRate).createBuffer(1, i.length, i.sampleRate), n = t.getChannelData(0);
  for (let s = 0; s < i.numberOfChannels; s++) {
    const o = i.getChannelData(s);
    for (let r = 0; r < o.length; r++) n[r] += o[r] / i.numberOfChannels;
  }
  return t;
}
function nw(i, e, t = Qk) {
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
function iw(i, e = sw) {
  let t = Ni.get(i);
  if (!t) {
    for (t = (async () => {
      const n = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!n) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(i), o = await new n(1, 1, 48e3).decodeAudioData(s), r = tw(o, n);
      return { buffer: r, envelope: nw(r.getChannelData(0), r.sampleRate) };
    })(), Ni.set(i, t); Ni.size > ew; ) Ni.delete(Ni.keys().next().value);
    t.catch(() => Ni.delete(i));
  }
  return t;
}
async function sw(i) {
  const e = await fetch(i);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function ow(i, e, t, n) {
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
function rw(i) {
  return !i || "problem" in i || !Array.isArray(i.midi) || !(i.rate > 0) ? null : { rate: i.rate, start: i.start ?? 0, midi: i.midi };
}
function lw(i, e) {
  const t = Math.round((e - i.start) * i.rate);
  return t >= 0 && t < i.midi.length ? i.midi[t] : null;
}
function aw(i, e, t) {
  let n = 0;
  for (let r = 0; r < i.measures.length; r++) i.measures[r].onset <= t && (n = r);
  const s = i.measures[n], o = e?.[n];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function uw(i, e, t) {
  const n = [];
  for (const s of i.tracks.vocal) {
    const o = aw(i, e, s.onset + s.duration / 2), r = o === null ? null : lw(t, o);
    r !== null && n.push(s.pitch - r);
  }
  return n.length < 6 ? 0 : (n.sort((s, o) => s - o), 12 * Math.round(n[Math.floor(n.length / 2)] / 12));
}
function cw(i, e, t, n, s, o = 0) {
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
      const g = y >= 0 && y < t.midi.length ? t.midi[y] : null, b = t.start + y * u;
      (g === null || a !== null && Math.abs(b - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = b, g !== null && l.push([d.onset + (b - h[0]) / (h[1] - h[0]) * d.length, g + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const hw = ["aria-label"], dw = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, fw = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, pw = ["aria-pressed"], mw = ["aria-pressed"], gw = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, vw = ["aria-pressed"], yw = ["aria-pressed"], bw = { title: "Grid for drawing, moving and resizing" }, kw = { value: "auto" }, ww = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, xw = ["disabled"], Sw = ["disabled"], Cw = ["disabled", "title"], Mw = ["disabled", "title"], Aw = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, Tw = ["disabled", "title"], $w = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, Dw = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, Lw = ["title"], Bw = ["disabled"], Ow = { title: "The roll pages along with the playback line" }, Ew = { class: "hint" }, Iw = {
  key: 0,
  class: "roll-note"
}, Rw = ["width", "height"], Pw = ["y", "width", "height"], Nw = ["x1", "x2", "y1", "y2"], Vw = ["x", "y"], Hw = ["x", "y"], zw = ["d"], Ww = ["x1", "x2", "y1", "y2"], Fw = ["x1", "x2", "y1", "y2"], Kw = ["transform"], _w = ["y", "width", "height"], Uw = ["y"], Gw = ["transform"], jw = ["width", "height"], qw = ["x", "width", "height"], Yw = ["y", "width", "height"], Xw = ["y", "width", "height"], Jw = ["x", "y", "width", "height"], Zw = ["d"], Qw = ["x", "y"], ex = ["y", "width", "height"], tx = ["x", "y", "width", "height"], nx = ["x", "y", "height"], ix = ["x", "y"], sx = ["x1", "x2", "y2"], ox = ["x"], rx = ["x"], lx = ["x", "y", "width", "height"], ax = ["x", "y"], ux = {
  key: 2,
  class: "chord ghost"
}, cx = ["x", "y", "width", "height"], hx = ["x", "y"], dx = ["x", "y", "width", "height"], fx = ["x1", "x2", "y2"], px = ["transform"], mx = ["y2"], gx = ["onKeydown"], vx = ["onKeydown"], bs = 5, Bc = 6.2, yx = 26, bx = /* @__PURE__ */ Dt({
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
    const n = i, s = t, o = ut(i, "lyricSelection"), r = ut(i, "zoom"), l = ut(i, "audition"), a = ut(i, "rowHeight"), u = ut(i, "follow"), c = ut(i, "sungVisible"), d = ut(i, "waveVisible"), h = B(() => !!n.source && d.value), f = W(null), m = W(null), y = W(null), g = W(null), b = ut(i, "track"), T = W("draw"), $ = W("auto"), P = W(null), R = W(null), V = W(!1), O = W(0), _ = W(0), N = W(0), ne = W(0);
    let z = !1;
    const A = W(null), H = W(null), pe = W(null);
    let ve = !1;
    const ie = W(null);
    let le = null, Ee = null;
    const Se = B(() => n.view?.model ?? null), Be = B(() => Se.value ? La(Se.value) : []), Me = B(() => Se.value?.tracks.chords ?? []), j = B(
      () => Se.value ? wb(Se.value, {
        pxPerQuarter: r.value,
        snap: $.value,
        lyrics: !!n.lyrics,
        source: h.value,
        rowHeight: a.value
      }) : null
    ), Qe = W(null);
    function ue(k) {
      l.value && ea(k, 0.35, n.sound);
    }
    const Ae = B(() => !n.readonly && !n.stale && !n.busy && !V.value), ee = B(() => as(n.view, n.selection)), K = B(() => Gs(n.selection)), Z = B(() => as(n.view, n.playing)), Fe = B(() => Rb(P.value)), nt = B(() => Ib(P.value)), Ge = B(() => {
      const k = j.value, M = R.value;
      if (!k || !M) return null;
      const S = yf(M, k, _.value, O.value), q = new Set(M.keep);
      for (const ke of Ab(Be.value, S, k)) q.add(ke.id);
      const F = new Set(M.keepChords);
      for (const ke of Tb(Me.value, M, k, _.value, O.value)) F.add(ke.id);
      const re = Mb(M, _.value);
      return { rect: S, ids: q, chords: F, lane: re };
    }), xt = B(
      () => T.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), Q = B(
      () => n.lyrics && n.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), U = B(() => Se.value && n.locator !== null ? Sf(Se.value, n.locator) : "");
    function he(k, M, S) {
      const q = ie.value;
      return !q || !q.delta ? [M, S] : q.kind === "move" && q.keys.includes(k) ? [M + q.delta, S + q.delta] : q.key !== k ? [M, S] : q.kind === "start" ? [Math.min(M + q.delta, S - 1), S] : q.kind === "end" ? [M, Math.max(S + q.delta, M + 1)] : [M, S];
    }
    function we(k) {
      const M = ie.value;
      return M?.delta ? M.kind === "move" ? M.keys.includes(k) : M.key === k : !1;
    }
    const Ce = B(() => {
      const k = j.value, M = n.lyrics;
      if (!k || !M) return [];
      const S = M.parts.flatMap(
        (F) => F.lines.filter((re) => re.text).map((re) => {
          const ke = Wo(re.block, re.line), [Ne, be] = he(ke, re.start, re.end);
          return { ...re, start: Ne, end: be, key: ke };
        })
      ).sort((F, re) => F.start - re.start || F.line - re.line), q = new Set(o.value);
      return S.map((F, re) => {
        const ke = Ke(F.start, k), Ne = S.slice(re + 1).find((yt) => yt.start > F.start), be = Ne ? Ke(Ne.start, k) - ke - 2 : 640, Le = Math.max(16, Ke(F.end, k) - ke), je = Math.max(1, Math.floor((Math.max(Le, Math.min(be, F.text.length * Bc + 8)) - 8) / Bc)), ht = F.text.length > je ? `${F.text.slice(0, Math.max(1, je - 1))}…` : F.text;
        return { ...F, x: ke, width: Le, shown: ht, selected: q.has(F.key), dragged: we(F.key) };
      }).filter((F) => Ct(F.start, Math.max(F.end, F.start + 64)));
    });
    function Wn(k) {
      const M = Ce.value.filter((F) => k >= F.x - bs && k <= F.x + F.width + bs), S = M.find((F) => k >= F.x && k <= F.x + F.width) ?? M[0];
      if (!S) return null;
      const q = k >= S.x + S.width - bs ? "end" : k <= S.x + bs && S.width > 3 * bs ? "start" : "move";
      return { key: S.key, start: S.start, end: S.end, part: q };
    }
    function ft(k) {
      const M = [];
      for (const S of n.lyrics?.parts.flatMap((q) => q.lines.map((F) => ({ ...F, key: Wo(F.block, F.line) }))) ?? []) {
        if (!(k.kind === "move" ? k.keys.includes(S.key) : S.key === k.key)) continue;
        const F = Math.max(S.end, S.start + 1);
        let re = [S.start, F];
        k.kind === "move" ? re = [S.start + k.delta, F + k.delta] : k.kind === "start" ? re = [Math.min(S.start + k.delta, F - 1), F] : re = [S.start, Math.max(F + k.delta, S.start + 1)], M.push({ key: S.key, start: Math.max(0, re[0]), end: Math.max(1, re[1]) });
      }
      return M;
    }
    const It = B(() => {
      const k = /* @__PURE__ */ new Map();
      for (const M of n.lyrics?.parts ?? [])
        for (const S of M.lines) for (const q of S.syllables) k.set(q.onset, q.end_of_word ? q.text : `${q.text}-`);
      return k;
    }), St = B(() => {
      const k = j.value;
      return k ? di.value.map((M) => ({ n: M, rect: ni(M, k) })).filter(({ rect: M }) => M.width >= yx).map(({ n: M, rect: S }) => ({ key: M.id, x: S.x + 2, y: S.y + S.height - 2.5, text: Zl(M.pitch) })) : [];
    }), Fn = B(() => {
      const k = j.value;
      return !k || !It.value.size ? [] : di.value.filter((M) => M.track === "vocal" && It.value.has(M.onset)).map((M) => {
        const S = ni(M, k);
        return { key: M.id, x: S.x + 1, y: S.y - 2, text: It.value.get(M.onset) };
      });
    });
    function ct(k) {
      const S = n.lyrics?.parts.find((be) => k >= be.start && k < be.end);
      if (!S) return null;
      const q = S.lines.length ? Math.max(...S.lines.map((be) => be.line)) + 1 : 0, F = S.lines.find((be) => be.text && k >= be.start && k < Math.max(be.end, be.start + 1)), re = (be) => ({
        block: S.block,
        line: be.line,
        text: be.text,
        original: be.text,
        start: be.start
      });
      if (F) return re(F);
      const ke = S.phrases.find(([be, Le]) => k >= be && k < Le);
      if (ke && !S.lines.some((be) => be.syllables.length && be.start < ke[1] && be.end > ke[0]))
        return re({ line: q, text: "", start: ke[0] });
      const Ne = [...S.lines].reverse().find((be) => be.text && be.start <= k);
      return re(Ne ?? { line: q, text: "", start: S.start });
    }
    function Oi(k) {
      const M = ct(k);
      M && (ve = !1, pe.value = M, Sn(() => {
        H.value?.focus(), H.value?.select();
      }));
    }
    function Wt() {
      const k = pe.value;
      if (pe.value = null, !k || ve) {
        ve = !1;
        return;
      }
      f.value?.focus({ preventScroll: !0 }), k.text.trim() !== k.original.trim() && s("lyricEdit", { block: k.block, line: k.line, text: k.text.trim(), at: k.start });
    }
    function Kn() {
      ve = !0, pe.value = null, f.value?.focus({ preventScroll: !0 });
    }
    const Dn = B(() => Se.value ? `1/${Math.round(Ar(Se.value) / (j.value?.snap ?? 1))}` : ""), Ut = B(() => {
      const k = j.value;
      if (!k) return [0, 0];
      const M = N.value || 1e5;
      return [wn(O.value - 200, k), wn(O.value + M + 200, k)];
    }), Ct = (k, M) => M >= Ut.value[0] && k <= Ut.value[1], di = B(() => Be.value.filter((k) => Ct(k.onset, k.onset + k.duration))), dn = B(
      () => Me.value.map((k, M) => ({ chord: k, next: Me.value[M + 1] })).filter(({ chord: k }) => Ct(k.onset, k.onset + 64))
    ), en = B(() => Se.value ? Cb(Se.value).filter((k) => Ct(k.unit, k.unit)) : []), _n = B(() => {
      const k = j.value;
      return k ? Array.from({ length: k.high - k.low + 1 }, (M, S) => k.high - S) : [];
    }), fi = B(() => {
      const k = Se.value;
      return k ? k.sections.filter((M) => !M.implicit).map((M) => ({ label: M.label, unit: k.measures[M.first_bar - 1]?.onset ?? 0 })).filter((M) => Ct(M.unit, M.unit + 64)) : [];
    });
    function Ln(k) {
      const M = y.value?.getBoundingClientRect();
      return [k.clientX - (M?.left ?? 0), k.clientY - (M?.top ?? 0)];
    }
    function vt(k) {
      return {
        note: !0,
        [k.track]: !0,
        selected: (Ge.value?.ids ?? ee.value).has(k.id),
        playing: Z.value.has(k.id),
        dragged: Fe.value.has(k.id)
      };
    }
    function hs(k) {
      const M = k.track === "vocal" ? "Vocal" : "Ins";
      let S = 1;
      for (const q of Se.value?.measures ?? []) q.onset <= k.onset && (S = q.n);
      return `${M} bar ${S}: ${k.name}, ${k.duration} units`;
    }
    function Mt(k) {
      s("select", k);
    }
    function Un(k) {
      const M = j.value;
      if (!M || k.button !== 0) return;
      f.value?.focus({ preventScroll: !0 });
      const [S, q] = Ln(k), F = Sc(S, q, Be.value, Me.value, M, b.value, _.value, O.value);
      if (F.area === "keys") {
        l.value && ea(F.pitch, 0.35, n.sound);
        return;
      }
      if (F.area === "header" || F.area === "source") {
        s("locate", Dc(F.unit, M.snap, M.total)), le = { x: S, y: q, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, Rt(k);
        return;
      }
      const re = k.shiftKey || k.ctrlKey || k.metaKey;
      if (F.area === "lyrics") {
        const Le = Wn(S);
        if (!Le) {
          re || (o.value = []);
          return;
        }
        n.selection.length && Mt([]);
        const je = o.value, ht = je.includes(Le.key), yt = re ? ht ? je.filter((qn) => qn !== Le.key) : [...je, Le.key] : ht ? je : [Le.key];
        if (yt !== je && (o.value = yt), n.lyricsEditable && (yt.includes(Le.key) || Le.part !== "move")) {
          const qn = Le.part === "move" ? [...yt] : [Le.key];
          le = { x: S, y: q, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Le.part, key: Le.key, keys: qn, origin: wn(S, M), delta: 0 } }, Rt(k);
        }
        return;
      }
      o.value.length && !re && (o.value = []);
      let ke = null, Ne = !1, be = null;
      if (F.area === "note") {
        const Le = ee.value.has(F.note.id);
        let je;
        if (re) {
          const ht = new Set(ee.value);
          Le ? ht.delete(F.note.id) : ht.add(F.note.id), je = Be.value.filter((yt) => ht.has(yt.id)), Mt(Co(je, Me.value.filter((yt) => K.value.has(yt.id))));
        } else Le ? je = Be.value.filter((ht) => ee.value.has(ht.id)) : (je = [F.note], Mt(Co(je)));
        Ae.value && je.some((ht) => ht.id === F.note.id) && (ke = F.edge === "end" && je.length === 1 ? Db(F.note, Be.value, M.total) : $b(je, F.note, wn(S, M), ir(q, M))), ue(F.note.pitch);
      } else if (F.area === "chord") {
        if (re) {
          const Le = new Set(K.value);
          Le.has(F.chord.id) ? Le.delete(F.chord.id) : Le.add(F.chord.id), Mt([...n.selection.filter((je) => !je.startsWith("chord:")), ...Le]);
        } else K.value.has(F.chord.id) || Mt([F.chord.id]);
        Ae.value && (ke = Bb(F.chord, wn(S, M)));
      } else if ((F.area === "grid" || F.area === "lane") && (T.value === "select" || k.shiftKey))
        be = re ? { notes: [...ee.value], chords: Me.value.filter((Le) => K.value.has(Le.id)) } : { notes: [], chords: [] }, Ne = !re;
      else if (F.area === "grid") {
        const Le = !n.selection.length && !o.value.length;
        Ae.value && !re && (ke = Lb(b.value, F.unit, F.pitch, M), ue(F.pitch)), Ne = !re, le = { x: S, y: q, start: ke, started: !1, clear: Ne, keep: be, insert: Ae.value && !re && Le }, Rt(k);
        return;
      } else
        Ne = !re;
      le = { x: S, y: q, start: ke, started: !1, clear: Ne, keep: be, from: { scrollTop: _.value, scrollLeft: O.value } }, Rt(k);
    }
    function Rt(k) {
      try {
        y.value?.setPointerCapture?.(k.pointerId);
      } catch {
      }
    }
    function Gn(k) {
      const M = m.value, S = j.value;
      if (!M || !S) return;
      const q = M.getBoundingClientRect();
      if (!q.height) return;
      const F = S.rowHeight;
      if (k.clientY < q.top + S.top + 12) M.scrollTop = Math.max(0, M.scrollTop - F);
      else if (k.clientY > q.bottom - 16) M.scrollTop = M.scrollTop + F;
      else return;
      pt();
    }
    function fn(k) {
      const M = j.value;
      if (!le || !le.start && !le.keep && !le.ruler && !le.lyric || !M) return;
      const [S, q] = Ln(k);
      if (le.ruler) {
        s("locate", Dc(wn(S, M), M.snap, M.total));
        return;
      }
      if (le.lyric) {
        if (!le.started && Math.abs(S - le.x) < wc) return;
        le.started = !0;
        const F = Math.round((wn(S, M) - le.lyric.origin) / M.snap) * M.snap;
        ie.value = { ...le.lyric, delta: F };
        return;
      }
      if (le.started && Gn(k), !(!le.started && Math.hypot(S - le.x, q - le.y) < wc)) {
        if (le.started = !0, le.keep)
          R.value = {
            x0: le.x,
            y0: le.y,
            x1: S,
            y1: q,
            from: le.from,
            keep: le.keep.notes,
            keepChords: le.keep.chords.map((F) => F.id)
          };
        else if (le.start) {
          const F = P.value, re = Ob(le.start, wn(S, M), ir(q, M), M, { alt: k.altKey });
          re.kind === "move" && re.semitones !== (F?.kind === "move" ? F.semitones : 0) && ue(re.anchor.pitch + re.semitones), P.value = re;
        }
      }
    }
    async function Gt(k) {
      V.value = !0;
      try {
        await n.operate(k);
      } finally {
        V.value = !1, P.value = null;
      }
    }
    function pi() {
      const k = le;
      if (le = null, !k || k.ruler) return;
      if (k.lyric) {
        const q = ie.value;
        ie.value = null, k.started && q?.delta && s("lyricPlace", ft(q));
        return;
      }
      if (!k.started) {
        if (P.value = null, k.insert && k.start?.kind === "draw" && j.value) {
          const q = j.value, F = Math.min(Qe.value ?? q.drawLength, q.total - k.start.start);
          Gt({ op: "insert_note", track: k.start.track, onset: k.start.start, duration: F, pitch: k.start.pitch });
          return;
        }
        k.clear && Mt([]);
        return;
      }
      if (k.keep) {
        const q = Ge.value?.ids ?? /* @__PURE__ */ new Set(), F = Ge.value?.chords ?? new Set(k.keep.chords.map((re) => re.id));
        R.value = null, Mt(Co(Be.value.filter((re) => q.has(re.id)), Me.value.filter((re) => F.has(re.id))));
        return;
      }
      const M = P.value, S = M ? Eb(M, n.resizeMode) : null;
      if (!S) {
        P.value = null;
        return;
      }
      M?.kind === "draw" ? Qe.value = M.end - M.start : M?.kind === "resize" && (Qe.value = M.end - M.note.onset), Gt(S);
    }
    function Ft() {
      le = null, P.value = null, R.value = null, ie.value = null;
    }
    function Ei(k) {
      const M = j.value;
      if (!M) return;
      const [S, q] = Ln(k), F = Sc(S, q, Be.value, Me.value, M, b.value, _.value, O.value);
      if (F.area === "lyrics") {
        n.lyricsEditable && Oi(F.unit);
        return;
      }
      if (Ae.value) {
        if (F.area === "grid") {
          if (T.value !== "draw") return;
          const re = Math.min(Jl(F.unit, M.snap), M.total - 1), ke = Math.min(M.drawLength, M.total - re);
          Gt({ op: "insert_note", track: b.value, onset: re, duration: ke, pitch: F.pitch });
        } else if (F.area === "lane" || F.area === "chord") {
          const re = F.area === "chord" ? F.chord : null, ke = F.area === "chord" ? F.chord.onset : Math.min(Jl(F.unit, M.snap), M.total - 1);
          A.value = { onset: ke, name: re?.name ?? "", original: re?.name ?? null }, Sn(() => {
            g.value?.focus(), g.value?.select();
          });
        }
      }
    }
    function ds() {
      const k = A.value;
      if (A.value = null, f.value?.focus({ preventScroll: !0 }), !k) return;
      const M = k.name.trim();
      if (M !== (k.original ?? "")) {
        if (!M) {
          k.original !== null && Gt({ op: "delete_chord", onset: k.onset });
          return;
        }
        Gt({ op: "put_chord", onset: k.onset, name: M });
      }
    }
    function pn() {
      A.value = null, f.value?.focus({ preventScroll: !0 });
    }
    function He(k) {
      if (k.target?.closest("input, select, textarea")) return;
      const S = j.value;
      if (!S) return;
      if (o.value.length && !k.ctrlKey && !k.metaKey) {
        const Ne = k.key === "ArrowLeft" ? -S.snap : k.key === "ArrowRight" ? S.snap : 0;
        if (k.key === "Delete" || k.key === "Backspace" || Ne || k.key === "Escape") {
          if (k.preventDefault(), k.stopPropagation(), k.key === "Escape") o.value = [];
          else if (n.lyricsEditable) Ne ? s("lyricPlace", ft({ kind: "move", key: "", keys: [...o.value], delta: Ne })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (k.key === "Escape") {
        if (le || P.value || R.value) Ft();
        else if (n.selection.length) Mt([]);
        else return;
        k.preventDefault(), k.stopPropagation();
        return;
      }
      const q = k.key.toLowerCase();
      if ((q === "g" || q === "h") && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), k.shiftKey ? tn(q === "h" ? 2 : -2) : Pt(q === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (q === "q" && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), L(k.shiftKey);
        return;
      }
      if (k.key.toLowerCase() === "a" && (k.ctrlKey || k.metaKey) && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Mt(Co(Be.value, Me.value));
        return;
      }
      const F = Be.value.filter((Ne) => ee.value.has(Ne.id)), re = Me.value.filter((Ne) => K.value.has(Ne.id)), ke = Pb(
        k.key,
        { shift: k.shiftKey, alt: k.altKey },
        F,
        re,
        S,
        n.resizeMode
      );
      ke !== void 0 && (k.preventDefault(), k.stopPropagation(), ke && Ae.value && Gt(ke));
    }
    function pt() {
      O.value = m.value?.scrollLeft ?? 0, _.value = m.value?.scrollTop ?? 0, N.value = m.value?.clientWidth ?? 0, ne.value = m.value?.clientHeight ?? 0;
    }
    function mn() {
      const k = j.value, M = m.value;
      z || !k || !M || !M.clientHeight || (z = !0, M.scrollTop = gf(k, M.clientHeight, k.focus[0], k.focus[1]), pt());
    }
    function jn(k, M = !0) {
      const S = j.value, q = m.value, F = Be.value.find((Ne) => k.has(Ne.id));
      if (!S || !q || !F || !q.clientWidth) return;
      const re = Ke(F.onset, S);
      M && (re < q.scrollLeft + qt || re > q.scrollLeft + q.clientWidth - 40) && (q.scrollLeft = Math.max(0, re - q.clientWidth / 3));
      const ke = q.clientHeight ? xc(S, q.scrollTop, q.clientHeight, F.pitch) : null;
      ke !== null && (q.scrollTop = ke), pt();
    }
    function Pt(k, M) {
      const S = m.value, q = j.value, F = Math.max(12, Math.min(240, Math.round(r.value * k)));
      if (F === r.value) return;
      if (!S || !q) {
        r.value = F;
        return;
      }
      const re = S.getBoundingClientRect(), ke = n.locator !== null ? Ke(n.locator, q) - S.scrollLeft : null, Ne = M !== void 0 ? M - re.left : ke !== null && ke >= qt && ke <= S.clientWidth ? ke : S.clientWidth / 2, be = wn(S.scrollLeft + Ne, q);
      r.value = F, Sn(() => {
        const Le = j.value;
        Le && (S.scrollLeft = Math.max(0, Ke(be, Le) - Ne), pt());
      });
    }
    function Ii(k) {
      const M = k.deltaY || k.deltaX;
      if (k.altKey || (k.ctrlKey || k.metaKey) && k.shiftKey) {
        k.preventDefault(), tn(M < 0 ? 1 : -1, k.clientY);
        return;
      }
      !k.ctrlKey && !k.metaKey || (k.preventDefault(), Pt(M < 0 ? 1.15 : 1 / 1.15, k.clientX));
    }
    function tn(k, M) {
      const S = m.value, q = j.value, F = Math.max(pf, Math.min(mf, a.value + k));
      if (F === a.value) return;
      if (!S || !q) {
        a.value = F;
        return;
      }
      const re = S.getBoundingClientRect(), ke = M !== void 0 ? M - re.top : S.clientHeight / 2, Ne = q.high - (S.scrollTop + ke - q.top) / q.rowHeight;
      a.value = F, Sn(() => {
        const be = j.value;
        be && (S.scrollTop = Math.max(0, be.top + (be.high - Ne) * be.rowHeight - ke), pt());
      });
    }
    function L(k) {
      const M = j.value;
      if (!M || !Ae.value) return;
      const S = ee.value.size ? Be.value.filter((q) => ee.value.has(q.id)) : Be.value;
      S.length && Gt({ op: "quantize", ids: S.map((q) => q.id), grid: M.snap, lengths: k });
    }
    const Y = B(() => {
      const k = n.source?.envelope;
      if (!k) return 1;
      let M = 0;
      for (let S = 0; S < k.max.length; S++) M = Math.max(M, k.max[S], -k.min[S]);
      return M || 1;
    }), J = B(() => {
      const k = j.value, M = Se.value, S = n.sung;
      if (!k || !M || !S?.curve || !c.value) return [];
      const [q, F] = Ut.value;
      let re = 0, ke = M.measures.length - 1;
      M.measures.forEach((be, Le) => {
        be.onset + be.length < q && (re = Le + 1), be.onset <= F && (ke = Le);
      });
      const Ne = (be) => k.top + (k.high - be) * k.rowHeight + k.rowHeight / 2;
      return cw(M, S.bars, S.curve, re, ke, S.offset).map((be, Le) => ({
        key: `c${re}-${Le}`,
        d: be.map(([je, ht], yt) => `${yt ? "L" : "M"}${Ke(je, k).toFixed(1)} ${Ne(ht).toFixed(1)}`).join("")
      }));
    }), ge = B(() => {
      const k = n.sung?.offset ?? 0;
      if (!k) return "sung";
      const M = Math.abs(k / 12);
      return `sung ${k > 0 ? "+" : "−"}${M > 1 ? M : ""}8va`;
    }), mt = B(() => {
      const k = n.sung;
      if (!k) return "";
      if (k.problem) return `No sung pitch: ${k.problem}`;
      const M = k.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${M ? ` - drawn ${Math.abs(M / 12)} octave${Math.abs(M) > 12 ? "s" : ""} ${M > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), Tr = B(() => {
      const k = j.value, M = Se.value, S = n.source;
      if (!k || !M || !S || k.sourceTop === null) return [];
      const q = k.sourceTop + Ms / 2, F = (Ms / 2 - 3) / Y.value, re = [];
      return M.measures.forEach((ke, Ne) => {
        if (!Ct(ke.onset, ke.onset + ke.length)) return;
        const be = Ke(ke.onset, k), Le = ke.length * k.pxPerUnit, je = S.bars?.[Ne];
        if (!je) {
          re.push({ key: `w${Ne}`, d: "", missing: !0, x: be, width: Le });
          return;
        }
        const ht = Math.max(1, Math.floor(Le / 2)), yt = [];
        ow(S.envelope, je[0], je[1], ht).forEach(([qn, Bn], lt) => {
          const Yn = (be + (lt + 0.5) * (Le / ht)).toFixed(1);
          yt.push(`M${Yn} ${(q - Bn * F - 0.5).toFixed(1)}V${(q - qn * F + 0.5).toFixed(1)}`);
        }), re.push({ key: `w${Ne}`, d: yt.join(""), missing: !1, x: be, width: Le });
      }), re;
    });
    function mi(k) {
      const M = j.value, S = m.value;
      if (k === null || !M || !S || !S.clientWidth) return;
      const q = Ke(k, M);
      q >= S.scrollLeft + qt && q <= S.scrollLeft + S.clientWidth - 24 || (S.scrollLeft = Math.max(0, q - qt - 24), pt());
    }
    return Re(ee, (k) => jn(k)), Re(Z, (k) => {
      n.recorded && n.playhead !== null || (u.value || n.playhead === null) && jn(k, n.playhead === null);
    }), Re(
      () => n.playhead,
      (k) => {
        u.value && mi(k);
      }
    ), Re(() => n.locator, mi), Re(
      () => n.recorded?.notes.at(-1)?.pitch,
      (k) => {
        const M = j.value, S = m.value;
        if (k === void 0 || !M || !S?.clientHeight) return;
        const q = xc(M, S.scrollTop, S.clientHeight, k);
        q !== null && (S.scrollTop = q, pt());
      }
    ), Re(
      () => !!Se.value,
      (k) => {
        k ? Sn(mn) : z = !1;
      }
    ), qs(() => {
      pt(), mn(), m.value && typeof ResizeObserver < "u" && (Ee = new ResizeObserver(() => {
        pt(), mn();
      }), Ee.observe(m.value));
    }), Hn(() => Ee?.disconnect()), e({ zoomBy: Pt, zoomRows: tn }), (k, M) => (w(), C("div", {
      ref_key: "root",
      ref: f,
      class: ze(["roll", { stale: i.stale, readonly: i.readonly, [`mode-${T.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": T.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: He
    }, [
      p("div", dw, [
        p("span", fw, [
          p("button", {
            class: ze(["mode draw", { active: T.value === "draw" }]),
            "aria-pressed": T.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: M[0] || (M[0] = (S) => T.value = "draw")
          }, [...M[20] || (M[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            ae(" Draw ", -1)
          ])], 10, pw),
          p("button", {
            class: ze(["mode select", { active: T.value === "select" }]),
            "aria-pressed": T.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: M[1] || (M[1] = (S) => T.value = "select")
          }, [...M[21] || (M[21] = [
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
          ])], 10, mw)
        ]),
        p("span", gw, [
          M[22] || (M[22] = ae(" draw into ", -1)),
          p("button", {
            class: ze([{ active: b.value === "vocal" }, "vocal"]),
            "aria-pressed": b.value === "vocal",
            onClick: M[2] || (M[2] = (S) => b.value = "vocal")
          }, " Vocal ", 10, vw),
          p("button", {
            class: ze([{ active: b.value === "ins" }, "ins"]),
            "aria-pressed": b.value === "ins",
            onClick: M[3] || (M[3] = (S) => b.value = "ins")
          }, " Ins ", 10, yw)
        ]),
        p("label", bw, [
          M[27] || (M[27] = ae(" snap ", -1)),
          Oe(p("select", {
            "onUpdate:modelValue": M[4] || (M[4] = (S) => $.value = S),
            "aria-label": "Snap"
          }, [
            p("option", kw, "auto (" + I($.value === "auto" ? Dn.value : "score") + ")", 1),
            M[23] || (M[23] = p("option", { value: 4 }, "1/4", -1)),
            M[24] || (M[24] = p("option", { value: 8 }, "1/8", -1)),
            M[25] || (M[25] = p("option", { value: 16 }, "1/16", -1)),
            M[26] || (M[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [oi, $.value]
          ])
        ]),
        p("span", ww, [
          p("button", {
            disabled: !i.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: M[5] || (M[5] = (S) => s("clipboard", "copy"))
          }, " Copy ", 8, xw),
          p("button", {
            disabled: !i.selection.length || !Ae.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: M[6] || (M[6] = (S) => s("clipboard", "cut"))
          }, " Cut ", 8, Sw),
          p("button", {
            disabled: !i.clip || !Ae.value || i.locator === null,
            title: i.clip ? `Paste ${i.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: M[7] || (M[7] = (S) => s("clipboard", "paste"))
          }, " Paste ", 8, Cw),
          p("button", {
            disabled: !i.clip || !Ae.value || i.locator === null,
            title: i.clip ? `Insert ${i.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: M[8] || (M[8] = (S) => s("clipboard", "insert"))
          }, " Insert ", 8, Mw)
        ]),
        p("label", Aw, [
          Oe(p("input", {
            "onUpdate:modelValue": M[9] || (M[9] = (S) => l.value = S),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [Nt, l.value]
          ]),
          M[28] || (M[28] = ae(" hear ", -1))
        ]),
        p("button", {
          disabled: !Ae.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${Dn.value}); Shift+Q: their lengths too`,
          onClick: M[10] || (M[10] = (S) => L(!1))
        }, " Q ", 8, Tw),
        p("span", $w, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: M[11] || (M[11] = (S) => Pt(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: M[12] || (M[12] = (S) => Pt(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: M[13] || (M[13] = (S) => tn(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: M[14] || (M[14] = (S) => tn(2))
          }, "↕+")
        ]),
        i.source ? (w(), C("label", Dw, [
          Oe(p("input", {
            "onUpdate:modelValue": M[15] || (M[15] = (S) => d.value = S),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [Nt, d.value]
          ]),
          M[29] || (M[29] = ae(" wave ", -1))
        ])) : G("", !0),
        i.sung ? (w(), C("label", {
          key: 1,
          title: mt.value,
          class: ze({ unavailable: !!i.sung.problem })
        }, [
          Oe(p("input", {
            "onUpdate:modelValue": M[16] || (M[16] = (S) => c.value = S),
            type: "checkbox",
            disabled: !!i.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, Bw), [
            [Nt, c.value]
          ]),
          ae(" " + I(ge.value), 1)
        ], 10, Lw)) : G("", !0),
        p("label", Ow, [
          Oe(p("input", {
            "onUpdate:modelValue": M[17] || (M[17] = (S) => u.value = S),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [Nt, u.value]
          ]),
          M[30] || (M[30] = ae(" follow ", -1))
        ]),
        p("span", Ew, I(xt.value) + I(Q.value), 1)
      ]),
      !Se.value && i.view?.model_error ? (w(), C("p", Iw, I(i.view.model_error.message), 1)) : Se.value && j.value ? (w(), C("div", {
        key: 1,
        ref_key: "scroller",
        ref: m,
        class: "roll-scroll",
        style: Ui({ height: `${Math.min(i.height, j.value.height + 16)}px` }),
        onScroll: pt,
        onWheel: Ii
      }, [
        (w(), C("svg", {
          ref_key: "svg",
          ref: y,
          class: "roll-svg",
          width: j.value.width,
          height: j.value.height,
          onPointerdown: Un,
          onPointermove: fn,
          onPointerup: pi,
          onPointercancel: Ft,
          onDblclick: Ei
        }, [
          (w(!0), C(fe, null, xe(_n.value, (S) => (w(), C("rect", {
            key: "row" + S,
            class: ze(["row", { black: E(xb)(S), c: S % 12 === 0 }]),
            x: 0,
            y: E(ls)(S, j.value),
            width: j.value.width,
            height: j.value.rowHeight
          }, null, 10, Pw))), 128)),
          (w(!0), C(fe, null, xe(en.value, (S) => (w(), C("line", {
            key: "l" + S.unit,
            class: ze(S.kind),
            x1: E(Ke)(S.unit, j.value),
            x2: E(Ke)(S.unit, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 10, Nw))), 128)),
          (w(!0), C(fe, null, xe(di.value, (S) => (w(), C("rect", eo({
            key: S.id,
            class: vt(S)
          }, { ref_for: !0 }, E(ni)(S, j.value), { rx: "2" }), [
            p("title", null, I(hs(S)), 1)
          ], 16))), 128)),
          (w(!0), C(fe, null, xe(St.value, (S) => (w(), C("text", {
            key: "p" + S.key,
            class: "note-name",
            x: S.x,
            y: S.y
          }, I(S.text), 9, Vw))), 128)),
          (w(!0), C(fe, null, xe(Fn.value, (S) => (w(), C("text", {
            key: "y" + S.key,
            class: "syllable",
            x: S.x,
            y: S.y
          }, I(S.text), 9, Hw))), 128)),
          (w(!0), C(fe, null, xe(J.value, (S) => (w(), C("path", {
            key: S.key,
            class: "sung-pitch",
            d: S.d
          }, null, 8, zw))), 128)),
          i.recorded ? (w(!0), C(fe, { key: 0 }, xe(i.recorded.notes, (S, q) => (w(), C("rect", eo({
            key: "rec" + q,
            class: "rec-note"
          }, { ref_for: !0 }, E(ni)({ onset: S.onset, duration: Math.max(S.duration, 0.5), pitch: S.pitch }, j.value), { rx: "2" }), null, 16))), 128)) : G("", !0),
          (w(!0), C(fe, null, xe(nt.value, (S, q) => (w(), C("rect", eo({
            key: "ghost" + q,
            class: ["ghost", S.track]
          }, { ref_for: !0 }, E(ni)(S, j.value), { rx: "2" }), null, 16))), 128)),
          Ge.value && Ge.value.rect.height > 0 ? (w(), C("rect", eo({
            key: 1,
            class: "band"
          }, Ge.value.rect), null, 16)) : G("", !0),
          i.locator !== null ? (w(), C("line", {
            key: 2,
            class: "locator",
            x1: E(Ke)(i.locator, j.value),
            x2: E(Ke)(i.locator, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 8, Ww)) : G("", !0),
          i.playhead !== null ? (w(), C("line", {
            key: 3,
            class: "playhead",
            x1: E(Ke)(i.playhead, j.value),
            x2: E(Ke)(i.playhead, j.value),
            y1: j.value.top,
            y2: j.value.height
          }, null, 8, Fw)) : G("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${O.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: j.value.top,
              width: E(qt) - 2,
              height: j.value.height - j.value.top
            }, [...M[31] || (M[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, _w),
            (w(!0), C(fe, null, xe(_n.value.filter((S) => S % 12 === 0), (S) => (w(), C("text", {
              key: "k" + S,
              class: "key-label",
              x: 4,
              y: E(ls)(S, j.value) + j.value.rowHeight - 2
            }, I(E(Sb)(S)), 9, Uw))), 128))
          ], 8, Kw),
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
            }, null, 8, jw),
            p("rect", {
              class: "ruler",
              x: E(qt),
              y: 0,
              width: j.value.width - E(qt),
              height: E(xn)
            }, [...M[32] || (M[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, qw),
            p("rect", {
              class: "lane",
              x: 0,
              y: E(xn),
              width: j.value.width,
              height: E(bi)
            }, null, 8, Yw),
            i.source && j.value.sourceTop !== null ? (w(), C(fe, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: j.value.sourceTop,
                width: j.value.width,
                height: E(Ms)
              }, [...M[33] || (M[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, Xw),
              (w(!0), C(fe, null, xe(Tr.value, (S) => (w(), C(fe, {
                key: S.key
              }, [
                S.missing ? (w(), C("rect", {
                  key: 0,
                  class: "source-missing",
                  x: S.x,
                  y: j.value.sourceTop + 2,
                  width: S.width,
                  height: E(Ms) - 4
                }, [...M[34] || (M[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, Jw)) : (w(), C("path", {
                  key: 1,
                  class: "source-wave",
                  d: S.d
                }, null, 8, Zw))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: O.value + 3,
                y: j.value.sourceTop + 11
              }, "source", 8, Qw)
            ], 64)) : G("", !0),
            i.lyrics ? (w(), C(fe, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: E(Rn),
                width: j.value.width,
                height: E(Cs)
              }, null, 8, ex),
              (w(!0), C(fe, null, xe(Ce.value, (S) => (w(), C("g", {
                key: S.key,
                class: ze(["lyric-line", { unsung: !S.syllables.length, selected: S.selected, dragged: S.dragged }])
              }, [
                p("rect", {
                  x: S.x,
                  y: E(Rn) + 3,
                  width: S.width,
                  height: E(Cs) - 6,
                  rx: "3"
                }, null, 8, tx),
                i.lyricsEditable ? (w(), C("rect", {
                  key: 0,
                  class: "edge",
                  x: S.x + S.width - 3,
                  y: E(Rn) + 5,
                  width: 3,
                  height: E(Cs) - 10
                }, null, 8, nx)) : G("", !0),
                p("text", {
                  x: S.x + 4,
                  y: E(Rn) + E(Cs) / 2 + 4
                }, I(S.shown), 9, ix),
                p("title", null, I(S.text) + I(i.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : G("", !0),
            (w(!0), C(fe, null, xe(en.value.filter((S) => S.kind === "bar"), (S) => (w(), C("line", {
              key: "t" + S.unit,
              class: "bar",
              x1: E(Ke)(S.unit, j.value),
              x2: E(Ke)(S.unit, j.value),
              y1: 0,
              y2: j.value.top
            }, null, 8, sx))), 128)),
            (w(!0), C(fe, null, xe(en.value.filter((S) => S.bar), (S) => (w(), C("text", {
              key: "n" + S.unit,
              class: "bar-number",
              x: E(Ke)(S.unit, j.value) + 3,
              y: 12
            }, I(S.bar), 9, ox))), 128)),
            (w(!0), C(fe, null, xe(fi.value, (S) => (w(), C("text", {
              key: "s" + S.unit,
              class: "section-label",
              x: E(Ke)(S.unit, j.value) + 22,
              y: 12
            }, I(S.label), 9, rx))), 128)),
            (w(!0), C(fe, null, xe(dn.value, ({ chord: S, next: q }) => (w(), C("g", {
              key: S.id,
              class: ze(["chord", {
                selected: (Ge.value?.chords ?? K.value).has(S.id),
                dragged: P.value?.kind === "chord" && P.value.chord.id === S.id
              }])
            }, [
              p("rect", {
                x: E(Ke)(S.onset, j.value),
                y: E(xn) + 3,
                width: E(sr)(S, q, j.value),
                height: E(bi) - 6,
                rx: "3"
              }, null, 8, lx),
              p("text", {
                x: E(Ke)(S.onset, j.value) + 4,
                y: E(xn) + E(bi) / 2 + 4
              }, I(S.name), 9, ax),
              p("title", null, "chord " + I(S.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            P.value?.kind === "chord" ? (w(), C("g", ux, [
              p("rect", {
                x: E(Ke)(P.value.to, j.value),
                y: E(xn) + 3,
                width: E(sr)(P.value.chord, void 0, j.value),
                height: E(bi) - 6,
                rx: "3"
              }, null, 8, cx),
              p("text", {
                x: E(Ke)(P.value.to, j.value) + 4,
                y: E(xn) + E(bi) / 2 + 4
              }, I(P.value.chord.name), 9, hx)
            ])) : G("", !0),
            Ge.value?.lane && Ge.value.rect.width > 0 ? (w(), C("rect", {
              key: 3,
              class: "band",
              x: Ge.value.rect.x,
              y: E(xn),
              width: Ge.value.rect.width,
              height: E(bi)
            }, null, 8, dx)) : G("", !0),
            i.playhead !== null ? (w(), C("line", {
              key: 4,
              class: "playhead",
              x1: E(Ke)(i.playhead, j.value),
              x2: E(Ke)(i.playhead, j.value),
              y1: 0,
              y2: j.value.top
            }, null, 8, fx)) : G("", !0),
            i.locator !== null ? (w(), C("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${E(Ke)(i.locator, j.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: j.value.top
              }, null, 8, mx),
              M[35] || (M[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + I(U.value) + " - click or drag in the ruler to move it", 1)
            ], 8, px)) : G("", !0)
          ], 8, Gw)
        ], 40, Rw)),
        A.value ? Oe((w(), C("input", {
          key: 0,
          ref_key: "chordInput",
          ref: g,
          "onUpdate:modelValue": M[18] || (M[18] = (S) => A.value.name = S),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: Ui({ left: `${E(Ke)(A.value.onset, j.value)}px`, top: `${E(xn) + 1 + _.value}px` }),
          onKeydown: [
            st(Ue(ds, ["prevent"]), ["enter"]),
            st(Ue(pn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: pn
        }, null, 44, gx)), [
          [dt, A.value.name]
        ]) : G("", !0),
        pe.value ? Oe((w(), C("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: H,
          "onUpdate:modelValue": M[19] || (M[19] = (S) => pe.value.text = S),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: Ui({ left: `${E(Ke)(pe.value.start, j.value)}px`, top: `${E(Rn) + 1 + _.value}px` }),
          onKeydown: [
            st(Ue(Wt, ["prevent"]), ["enter"]),
            st(Ue(Kn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Wt
        }, null, 44, vx)), [
          [dt, pe.value.text]
        ]) : G("", !0)
      ], 36)) : G("", !0)
    ], 42, hw));
  }
}), or = (i) => [...new Set(i)].sort((e, t) => e - t);
function Oc(i, e, t, n) {
  if (t.range && n !== null) {
    const [s, o] = n <= e ? [n, e] : [e, n], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? or([...i, ...r]) : r;
  }
  return t.toggle ? i.includes(e) ? i.filter((s) => s !== e) : or([...i, e]) : [e];
}
function Ec(i, e) {
  const t = new Set(e), n = Array.from({ length: i }, (s, o) => o).filter((s) => !t.has(s));
  return !n.length || n.length === i ? null : { order: n.map((s) => s + 1), selection: [] };
}
function Ic(i, e) {
  const t = or(e).filter((o) => o >= 0 && o < i);
  if (!t.length) return null;
  const n = t[t.length - 1];
  return { order: [
    ...Array.from({ length: n + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: i - n - 1 }, (o, r) => n + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => n + 1 + r) };
}
function Rc(i, e, t) {
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
function Pc(i, e, t, n) {
  const s = or(e).filter((a) => a >= 0 && a < i);
  if (!s.length || t < 0 || t > i) return null;
  const o = n ? Array.from({ length: i }, (a, u) => u) : Array.from({ length: i }, (a, u) => u).filter((a) => !s.includes(a)), r = n ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !n && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const Qn = W(null);
function rr(i) {
  return i.id.startsWith("ins:") ? "ins" : "vocal";
}
function kx(i, e, t = null) {
  const n = [...new Set(e)].sort((u, c) => u - c).filter((u) => i.sections[u]), s = n.map((u) => i.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const d = i.measures[c.first_bar - 1], h = i.measures[c.first_bar - 1 + c.bars - 1], f = d.onset, m = h.onset + h.length;
    for (const g of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (g.onset >= m || g.onset + g.duration <= f) continue;
      const b = Math.max(g.onset, f);
      o.push({ track: rr(g), onset: b - f + a, duration: Math.min(g.onset + g.duration, m) - b, pitch: g.pitch });
    }
    for (const g of i.tracks.chords) g.onset >= f && g.onset < m && r.push({ onset: g.onset - f + a, name: g.name });
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
function wx(i) {
  const e = [...new Set(i)].sort((n, s) => n - s), t = [];
  for (let n = 0; n < e.length; ) {
    let s = n;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > n ? `${e[n]}-${e[s]}` : `${e[n]}`), n = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function xx(i, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => i.measures[r]);
  if (!t.length) return null;
  const n = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = i.measures[r], u = l + a;
    for (const c of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const d = Math.max(c.onset, l);
      n.push({ track: rr(c), onset: d - l + o, duration: Math.min(c.onset + c.duration, u) - d, pitch: c.pitch });
    }
    for (const c of i.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: i.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: n, chords: s, sections: [], label: wx(t.map((r) => r + 1)) };
}
function Nc(i, e, t) {
  if (!e.length && !t.length) return null;
  const n = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => rr(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: i.unit,
    span: s - n,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: rr(l), onset: l.onset - n, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - n, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function Vc(i) {
  const e = /^1\/(\d+)$/.exec(i.trim());
  return e ? Number(e[1]) : NaN;
}
function Sx(i, e) {
  const t = Vc(e) / Vc(i.unit);
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
function Cx(i, e) {
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
function Hc(i, e, t, n) {
  const s = Sx(i, e.unit);
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
const Mx = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, Ax = { class: "hint" }, Tx = ["disabled"], $x = ["disabled"], Dx = ["disabled"], Lx = ["disabled"], Bx = ["disabled"], Ox = ["draggable", "aria-selected", "onDragstart", "onDragover"], Ex = ["onClick"], Ix = ["title"], Rx = { key: 0 }, Px = ["onKeydown", "onBlur"], Nx = { class: "facts" }, Vx = {
  key: 0,
  class: "section-tools"
}, Hx = ["onClick"], zx = ["onClick"], Wx = ["onClick"], Fx = ["onClick"], Kx = {
  key: 1,
  class: "split"
}, _x = ["disabled"], Ux = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, Gx = { class: "hint" }, jx = ["disabled"], qx = ["disabled"], Yx = ["disabled"], Xx = ["disabled"], Jx = ["disabled"], Zx = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], Qx = /* @__PURE__ */ Dt({
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
    const y = W("sections"), g = W(!1), b = W(null), T = B(() => t.view?.sections ?? []), $ = B(() => t.view?.bars ?? []), P = B(() => t.view && t.bar ? al(t.view, t.bar) : -1), R = B(() => new Set(t.errorBars)), V = B(() => !t.readonly && !!t.view?.model && T.value.length > 0);
    Re(T, (Q) => {
      l.value = (u ?? l.value).filter((U) => U < Q.length), u = null;
    }), Re($, (Q) => {
      h.value = (m ?? h.value).filter((U) => U < Q.length), m = null;
    });
    function O(Q, U) {
      s.value = Q, o.value = U;
    }
    function _(Q) {
      const U = o.value.trim();
      s.value = null, U && U !== T.value[Q]?.label && n("operate", { op: "rename_section", section: Q + 1, label: U });
    }
    function N(Q, U) {
      const he = T.value[Q];
      he && n("operate", { op: "move_section_boundary", section: Q + 1, start_bar: he.start_bar + U });
    }
    function ne(Q) {
      const U = t.sourceStarts?.[Q - 1];
      return typeof U == "number" ? Lo(U) : null;
    }
    function z(Q, U) {
      y.value = "sections";
      const he = U.ctrlKey || U.metaKey;
      l.value = Oc(l.value, Q, { toggle: he, range: U.shiftKey }, a.value), U.shiftKey || (a.value = Q);
      const we = T.value[Q];
      we && !he && !U.shiftKey && n("goto", we.start_bar);
    }
    function A(Q) {
      !Q || !V.value || (u = Q.selection, n("operate", { op: "arrange_sections", order: Q.order }));
    }
    const H = () => A(Ic(T.value.length, l.value)), pe = () => A(Ec(T.value.length, l.value)), ve = (Q) => A(Rc(T.value.length, l.value, Q));
    function ie() {
      const Q = t.view?.model;
      if (!Q || !l.value.length) return;
      const U = kx(Q, l.value, t.sectionLyrics ?? null);
      U && (Qn.value = U, n("notice", `copied ${U.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function le(Q, U) {
      y.value = "bars";
      const he = U.ctrlKey || U.metaKey;
      h.value = Oc(h.value, Q, { toggle: he, range: U.shiftKey }, f.value), U.shiftKey || (f.value = Q);
      const we = $.value[Q];
      we && !he && !U.shiftKey && n("goto", we.index);
    }
    function Ee(Q) {
      !Q || !V.value || (m = Q.selection, n("operate", { op: "arrange_measures", order: Q.order.map((U) => U - 1) }));
    }
    const Se = () => Ee(Ic($.value.length, h.value)), Be = () => Ee(Ec($.value.length, h.value)), Me = (Q) => Ee(Rc($.value.length, h.value, Q));
    function j() {
      const Q = t.view?.model;
      if (!Q || !h.value.length) return;
      const U = xx(Q, h.value);
      U && (Qn.value = U, n("notice", `copied ${U.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function Qe(Q) {
      const U = Q.ctrlKey || Q.metaKey, he = Q.key.toLowerCase();
      if (Q.key === "Delete" || Q.key === "Backspace") Be();
      else if (U && he === "d") Se();
      else if (U && he === "c") j();
      else if (U && he === "x" && h.value.length < $.value.length)
        j(), Be();
      else if (U && (Q.key === "ArrowLeft" || Q.key === "ArrowUp")) Me(-1);
      else if (U && (Q.key === "ArrowRight" || Q.key === "ArrowDown")) Me(1);
      else if (U && he === "a") h.value = $.value.map((we, Ce) => Ce);
      else if (Q.key === "Escape" && h.value.length) h.value = [];
      else return !1;
      return !0;
    }
    function ue(Q, U) {
      V.value && (y.value = "bars", h.value.includes(Q) || (h.value = [Q]), g.value = !0, U.dataTransfer?.setData("text/plain", "plenio-bars"), U.dataTransfer && (U.dataTransfer.effectAllowed = "copyMove"));
    }
    function Ae(Q, U) {
      if (!g.value) return;
      U.preventDefault();
      const he = U.currentTarget.getBoundingClientRect();
      b.value = U.clientX < he.left + he.width / 2 ? Q : Q + 1, U.dataTransfer && (U.dataTransfer.dropEffect = U.altKey || U.ctrlKey ? "copy" : "move");
    }
    function ee(Q) {
      !g.value || b.value === null || (Q.preventDefault(), Ee(Pc($.value.length, h.value, b.value, Q.altKey || Q.ctrlKey)), K());
    }
    function K() {
      g.value = !1, b.value = null;
    }
    function Z(Q) {
      if (!V.value || Q.target?.closest("input, textarea, select")) return;
      if (y.value === "bars") {
        Qe(Q) && (Q.preventDefault(), Q.stopPropagation());
        return;
      }
      const U = Q.ctrlKey || Q.metaKey, he = Q.key.toLowerCase();
      let we = !0;
      Q.key === "Delete" || Q.key === "Backspace" ? pe() : U && he === "d" ? H() : U && he === "c" ? ie() : U && he === "x" && l.value.length < T.value.length ? (ie(), pe()) : U && Q.key === "ArrowUp" ? ve(-1) : U && Q.key === "ArrowDown" ? ve(1) : U && he === "a" ? l.value = T.value.map((Ce, Wn) => Wn) : Q.key === "Escape" && l.value.length ? l.value = [] : we = !1, we && (Q.preventDefault(), Q.stopPropagation());
    }
    function Fe(Q, U) {
      V.value && (l.value.includes(Q) || (l.value = [Q]), c.value = !0, U.dataTransfer?.setData("text/plain", "plenio-sections"), U.dataTransfer && (U.dataTransfer.effectAllowed = "copyMove"));
    }
    function nt(Q, U) {
      if (!c.value) return;
      U.preventDefault();
      const he = U.currentTarget.getBoundingClientRect();
      d.value = U.clientY < he.top + he.height / 2 ? Q : Q + 1, U.dataTransfer && (U.dataTransfer.dropEffect = U.altKey || U.ctrlKey ? "copy" : "move");
    }
    function Ge(Q) {
      !c.value || d.value === null || (Q.preventDefault(), A(Pc(T.value.length, l.value, d.value, Q.altKey || Q.ctrlKey)), xt());
    }
    function xt() {
      c.value = !1, d.value = null;
    }
    return (Q, U) => (w(), C("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: Z
    }, [
      V.value ? (w(), C("div", Mx, [
        p("span", Ax, I(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: H
        }, " Duplicate ", 8, Tx),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: ie
        }, " Copy ", 8, $x),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: U[0] || (U[0] = (he) => ve(-1))
        }, "↑", 8, Dx),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: U[1] || (U[1] = (he) => ve(1))
        }, "↓", 8, Lx),
        p("button", {
          disabled: !l.value.length || l.value.length >= T.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: pe
        }, " Delete ", 8, Bx)
      ])) : G("", !0),
      p("ol", {
        class: "sections",
        onDragleave: U[5] || (U[5] = Ue((he) => d.value = null, ["self"]))
      }, [
        (w(!0), C(fe, null, xe(T.value, (he, we) => (w(), C("li", {
          key: we,
          class: ze({
            current: we === P.value,
            picked: l.value.includes(we),
            "drop-before": d.value === we,
            "drop-after": d.value === we + 1 && we === T.value.length - 1
          }),
          draggable: V.value,
          "aria-selected": l.value.includes(we),
          onDragstart: (Ce) => Fe(we, Ce),
          onDragover: (Ce) => nt(we, Ce),
          onDrop: Ge,
          onDragend: xt
        }, [
          p("div", {
            class: "section-head",
            onClick: (Ce) => z(we, Ce)
          }, [
            p("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${he.start_bar}`
            }, [
              s.value !== we ? (w(), C("strong", Rx, I(he.label), 1)) : G("", !0)
            ], 8, Ix),
            s.value === we ? Oe((w(), C("input", {
              key: 0,
              "onUpdate:modelValue": U[2] || (U[2] = (Ce) => o.value = Ce),
              class: "rename",
              "aria-label": "Section name",
              onClick: U[3] || (U[3] = Ue(() => {
              }, ["stop"])),
              onKeydown: [
                st(Ue((Ce) => _(we), ["prevent"]), ["enter"]),
                U[4] || (U[4] = st(Ue((Ce) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (Ce) => _(we)
            }, null, 40, Px)), [
              [dt, o.value]
            ]) : G("", !0),
            p("span", Nx, [
              ae(" bars " + I(he.start_bar) + "-" + I(he.start_bar + he.bars - 1) + " · " + I(E(Lo)(he.start_s)) + " ", 1),
              ne(he.start_bar) ? (w(), C(fe, { key: 0 }, [
                ae(" · source " + I(ne(he.start_bar)), 1)
              ], 64)) : G("", !0)
            ])
          ], 8, Ex),
          i.readonly ? G("", !0) : (w(), C("div", Vx, [
            p("button", {
              title: "Rename this section",
              onClick: (Ce) => O(we, he.label)
            }, "Rename", 8, Hx),
            we > 0 ? (w(), C(fe, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (Ce) => N(we, -1)
              }, "◀ bar", 8, zx),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (Ce) => N(we, 1)
              }, "bar ▶", 8, Wx),
              p("button", {
                title: "Join this section to the one before",
                onClick: (Ce) => n("operate", { op: "merge_section", section: we + 1 })
              }, " Join ↑ ", 8, Fx)
            ], 64)) : G("", !0)
          ]))
        ], 42, Ox))), 128))
      ], 32),
      !i.readonly && i.bar ? (w(), C("div", Kx, [
        p("label", null, [
          ae(" New section at bar " + I(i.bar) + ": ", 1),
          Oe(p("input", {
            "onUpdate:modelValue": U[6] || (U[6] = (he) => r.value = he),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [dt, r.value]
          ])
        ]),
        p("button", {
          disabled: i.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: U[7] || (U[7] = (he) => n("operate", { op: "split_section", bar: i.bar, label: r.value }))
        }, " Split ", 8, _x)
      ])) : G("", !0),
      V.value ? (w(), C("div", Ux, [
        p("span", Gx, I(h.value.length ? `${h.value.length} bar${h.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !h.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Se
        }, " Duplicate ", 8, jx),
        p("button", {
          disabled: !h.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: j
        }, " Copy ", 8, qx),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: U[8] || (U[8] = (he) => Me(-1))
        }, "←", 8, Yx),
        p("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: U[9] || (U[9] = (he) => Me(1))
        }, "→", 8, Xx),
        p("button", {
          disabled: !h.value.length || h.value.length >= $.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Be
        }, " Delete ", 8, Jx)
      ])) : G("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: U[10] || (U[10] = Ue((he) => b.value = null, ["self"]))
      }, [
        (w(!0), C(fe, null, xe($.value, (he, we) => (w(), C("button", {
          key: he.index,
          role: "listitem",
          class: ze(["bar", {
            selected: he.index === i.bar,
            picked: h.value.includes(we),
            error: R.value.has(he.index),
            alt: i.view ? E(al)(i.view, he.index) % 2 === 1 : !1,
            "drop-before": b.value === we,
            "drop-after": b.value === we + 1 && we === $.value.length - 1
          }]),
          draggable: V.value,
          "aria-selected": h.value.includes(we),
          title: `Bar ${he.index} · ${E(Lo)(he.start_s)} · ${he.chords.join(" ") || "no chord"}${V.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (Ce) => le(we, Ce),
          onDragstart: (Ce) => ue(we, Ce),
          onDragover: (Ce) => Ae(we, Ce),
          onDrop: ee,
          onDragend: K
        }, I(he.index), 43, Zx))), 128))
      ], 32)
    ], 32));
  }
}), eS = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, tS = {
  class: "group",
  "aria-label": "History"
}, nS = ["disabled", "title"], iS = ["disabled", "title"], sS = {
  class: "group",
  "aria-label": "Pitch"
}, oS = ["disabled"], rS = ["disabled"], lS = ["disabled"], aS = ["disabled"], uS = {
  class: "group",
  "aria-label": "Length"
}, cS = ["disabled"], hS = ["disabled"], dS = ["disabled"], fS = ["disabled"], pS = {
  class: "group",
  "aria-label": "Chord"
}, mS = ["disabled"], gS = ["disabled"], vS = ["disabled"], yS = { class: "group whole" }, bS = { class: "whole-tools" }, kS = ["disabled"], wS = ["disabled"], xS = ["disabled"], SS = ["disabled"], CS = ["disabled"], MS = ["disabled"], AS = /* @__PURE__ */ Dt({
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
    const t = i, n = e, s = W(""), o = W(null), r = B(() => t.selection.filter((y) => t.view?.elements?.find((g) => g.id === y)?.kind === "note")), l = B(() => [...Gs(t.selection)]), a = B(() => r.value.length > 0 || l.value.length > 0), u = B(() => t.primary?.kind === "note"), c = B(() => t.primary !== null && t.primary.kind !== "note"), d = B(() => {
      const y = t.primary;
      return !y || !t.view ? null : t.view.chords?.find((g) => g.bar === y.bar && Math.abs(g.start_s - y.start_s) < 1e-6) ?? null;
    }), h = B(() => t.primary && u.value ? ll(t.primary.units, 1) : null), f = B(() => t.primary && u.value ? ll(t.primary.units, -1) : null);
    Re(
      () => t.view?.header?.tempo_bpm,
      (y) => {
        o.value = y ?? null;
      },
      { immediate: !0 }
    ), Re(d, (y) => {
      s.value = y?.name ?? "";
    });
    function m(y) {
      l.value.length ? n("operate", { op: "set_note_pitch", ids: [...as(t.view, t.selection), ...l.value], semitones: y }) : r.value.length && n("operate", { op: "shift_pitch", ids: r.value, semitones: y });
    }
    return (y, g) => (w(), C("div", eS, [
      p("div", tS, [
        p("button", {
          disabled: !i.canUndo || i.busy,
          title: `Undo${i.undoLabel ? ": " + i.undoLabel : ""} (Ctrl+Z)`,
          onClick: g[0] || (g[0] = (b) => n("undo"))
        }, "↶", 8, nS),
        p("button", {
          disabled: !i.canRedo || i.busy,
          title: `Redo${i.redoLabel ? ": " + i.redoLabel : ""} (Ctrl+Y)`,
          onClick: g[1] || (g[1] = (b) => n("redo"))
        }, "↷", 8, iS)
      ]),
      p("div", sS, [
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave down (Shift+↓)",
          onClick: g[2] || (g[2] = (b) => m(-12))
        }, "−8va", 8, oS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: g[3] || (g[3] = (b) => m(-1))
        }, "−1", 8, rS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: g[4] || (g[4] = (b) => m(1))
        }, "+1", 8, lS),
        p("button", {
          disabled: !a.value || i.busy,
          title: "Octave up (Shift+↑)",
          onClick: g[5] || (g[5] = (b) => m(12))
        }, "+8va", 8, aS)
      ]),
      p("div", uS, [
        p("button", {
          disabled: !f.value || i.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: g[6] || (g[6] = (b) => i.primary && f.value && n("operate", { op: "set_duration", id: i.primary.id, units: f.value }))
        }, " shorter ", 8, cS),
        p("button", {
          disabled: !h.value || i.busy,
          title: "Longer, into the rest after the note (])",
          onClick: g[7] || (g[7] = (b) => i.primary && h.value && n("operate", { op: "set_duration", id: i.primary.id, units: h.value }))
        }, " longer ", 8, hS),
        p("button", {
          disabled: !r.value.length || i.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: g[8] || (g[8] = (b) => n("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, dS),
        p("button", {
          disabled: !c.value || i.busy,
          title: "Turn the rest into a note (N)",
          onClick: g[9] || (g[9] = (b) => i.primary && n("operate", { op: "rest_to_note", id: i.primary.id }))
        }, " note ", 8, fS)
      ]),
      p("div", pS, [
        Oe(p("input", {
          "onUpdate:modelValue": g[10] || (g[10] = (b) => s.value = b),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !i.primary || i.busy,
          onKeydown: g[11] || (g[11] = st(Ue((b) => i.primary && s.value.trim() && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, mS), [
          [dt, s.value]
        ]),
        p("button", {
          disabled: !i.primary || !s.value.trim() || i.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: g[12] || (g[12] = (b) => i.primary && n("operate", { op: "set_chord", id: i.primary.id, name: s.value }))
        }, " set ", 8, gS),
        p("button", {
          disabled: !d.value || i.busy,
          title: "Remove the chord symbol at the selection",
          onClick: g[13] || (g[13] = (b) => d.value && n("operate", { op: "remove_chord", chord: d.value.id }))
        }, " remove ", 8, vS)
      ]),
      p("details", yS, [
        g[22] || (g[22] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", bS, [
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone down",
            onClick: g[14] || (g[14] = (b) => n("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, kS),
          p("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone up",
            onClick: g[15] || (g[15] = (b) => n("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, wS),
          p("label", null, [
            g[21] || (g[21] = ae(" tempo ", -1)),
            Oe(p("input", {
              "onUpdate:modelValue": g[16] || (g[16] = (b) => o.value = b),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                dt,
                o.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("button", {
            disabled: i.busy || !o.value || o.value === i.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: g[17] || (g[17] = (b) => o.value && n("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, xS),
          p("button", {
            disabled: i.busy || !i.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: g[18] || (g[18] = (b) => n("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, SS),
          p("button", {
            disabled: i.busy,
            title: "Let the instrument play the vocal melody",
            onClick: g[19] || (g[19] = (b) => n("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, CS),
          p("button", {
            disabled: i.busy,
            title: "Replace every Vocal note by rests",
            onClick: g[20] || (g[20] = (b) => n("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, MS)
        ])
      ])
    ]));
  }
}), TS = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, $S = ["disabled", "title"], DS = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, LS = ["aria-checked", "disabled", "title", "onClick"], BS = ["disabled"], OS = ["title"], ES = ["disabled"], IS = { class: "align" }, RS = ["aria-expanded", "title"], PS = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, NS = ["title"], VS = ["title"], HS = ["disabled"], zS = {
  key: 0,
  class: "facts"
}, WS = ["title"], FS = { title: "A click on every beat (takes effect at the next start)" }, KS = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, _S = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, US = ["checked"], GS = { title: "Practice speed; the score's tempo is not changed" }, jS = { class: "facts" }, qS = {
  key: 1,
  class: "error"
}, YS = /* @__PURE__ */ Dt({
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
    const n = i, s = ut(i, "voices"), o = ut(i, "speed"), r = ut(i, "metronome"), l = ut(i, "hear"), a = ut(i, "sourceLevel"), u = ut(i, "sourceShift"), c = W(!1);
    function d(ee) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + ee) * 1e3) / 1e3));
    }
    const h = B(() => {
      const ee = Math.round(u.value * 1e3);
      return ee ? `${Math.abs(ee)} ms ${ee > 0 ? "later" : "earlier"}` : "in place";
    }), f = t, m = new Jk(), y = W(!1), g = W(!1);
    let b = 0, T = null;
    const $ = W(!1), P = W(0), R = W(null);
    let V = null;
    const O = B(() => n.bar ?? 1), _ = B(() => n.from ?? n.view?.bars[O.value - 1]?.start_s ?? 0), N = B(() => n.position ? `the cursor (${n.position})` : `bar ${O.value}`), ne = B(() => !!n.view?.notes), z = B(() => !!n.reference && !!n.source && o.value === 1), A = B(() => n.reference ? n.sourceProblem ? n.sourceProblem : n.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function H() {
      const ee = z.value ? l.value : "notes";
      return { tones: ee === "source" ? 0 : 1, source: ee === "notes" ? 0 : a.value };
    }
    function pe(ee) {
      const K = n.view?.bars ?? [];
      let Z = 1;
      for (const Fe of K) Fe.start_s <= ee + To && (Z = Fe.index);
      return Z;
    }
    function ve(ee) {
      if (n.loopRange) return [n.loopRange.from, n.loopRange.to];
      const K = n.view;
      if (!K) return null;
      const Z = K.sections[al(K, pe(ee))];
      return Z ? [Z.start_s, Z.end_s] : null;
    }
    function ie(ee = _.value, K = null) {
      const Z = n.view;
      if (!Z) return;
      Be(), T = K;
      const Fe = $.value && !K ? ve(ee) : null, nt = Fe && (ee < Fe[0] - To || ee >= Fe[1] - To) ? Fe[0] : ee, Ge = z.value, xt = Ge ? tp(Z, n.timelineBars) : null, Q = { ...s.value };
      K?.mute && (Q[K.mute] = !1), V = {
        from: nt,
        to: Fe ? Fe[1] : null,
        voices: Q,
        speed: o.value,
        metronome: r.value,
        guide: n.guide ?? [],
        clock: xt
      };
      const U = V;
      b = K ? Ee(Z, nt, K.countIn, xt) : 0;
      const he = np(Z, U).map((Ce) => ({ ...Ce, at: Ce.at + b }));
      b && he.unshift(...Se(Z, nt, K?.countIn ?? 0, b));
      const we = Ge && xt && n.source ? ip(xt, nt, U.to).map((Ce) => ({ ...Ce, at: Ce.at + b })) : [];
      try {
        m.play(he, {
          source: we.length && n.source ? { buffer: n.source.buffer, segments: we } : null,
          levels: H(),
          length: b + rp(Z, U),
          sounds: n.sounds,
          onTick: (Ce) => {
            g.value = Ce < b, !(Ce < b) && (P.value = sp(U, Ce - b), f("cursor", op(Z, P.value, U.voices)), f("time", P.value));
          },
          onEnd: () => {
            $.value && y.value && !K ? ie(Fe?.[0] ?? U.from) : Me();
          }
        }), y.value = !0, g.value = b > 0, R.value = null;
      } catch (Ce) {
        R.value = Ce instanceof Error ? Ce.message : String(Ce);
      }
    }
    function le(ee, K, Z) {
      const Fe = ee.bars[pe(K) - 1], nt = Number(Fe?.meter.split("/")[0]) || 4;
      return { beat: (Z?.[pe(K) - 1]?.realDur ?? Fe?.duration_s ?? 2) / nt / za(o.value), beats: nt };
    }
    function Ee(ee, K, Z, Fe) {
      if (Z <= 0) return 0;
      const { beat: nt, beats: Ge } = le(ee, K, Fe);
      return Z * Ge * nt;
    }
    function Se(ee, K, Z, Fe) {
      const { beat: nt, beats: Ge } = le(ee, K, V?.clock ?? null);
      return lp(ee.bars[pe(K) - 1] ?? null, Ge, K, Z, Fe, nt);
    }
    function Be() {
      m.stop(), y.value = !1, g.value = !1, T = null;
    }
    function Me() {
      const ee = y.value;
      Be(), f("cursor", []), f("time", null), ee && f("stopped");
    }
    function j(ee, K) {
      return ie(ee, K), y.value;
    }
    function Qe(ee) {
      const K = V;
      if (!K || !y.value) return null;
      const Z = m.elapsedAt(ee) - b, Fe = K.clock?.length ? K.clock : null, nt = Z * za(K.speed);
      return Fe ? ap(Fe, up(Fe, K.from) + nt) : K.from + nt;
    }
    function ue() {
      y.value ? Me() : ie();
    }
    function Ae() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Re(
      () => n.sounds,
      (ee) => {
        ee && m.setSounds(ee);
      },
      { deep: !0 }
    ), Re([l, a], () => {
      y.value && m.setLevels(H());
    }), Re(
      () => n.from,
      (ee, K) => {
        y.value && !T && ee !== null && ee !== void 0 && ee !== K && ie(ee);
      }
    ), e({ toggle: ue, stop: Me, swap: Ae, playing: y, record: j, scoreSecondAt: Qe, countingIn: g }), Hn(() => m.close()), (ee, K) => (w(), C("div", TS, [
      p("button", {
        disabled: !ne.value,
        title: y.value ? "Stop (Space)" : `Play from ${N.value} (Space)`,
        onClick: ue
      }, I(y.value ? "■ stop" : "▶ play"), 9, $S),
      Uf(ee.$slots, "record", {
        playing: y.value,
        countingIn: g.value
      }),
      i.reference ? (w(), C("span", DS, [
        (w(), C(fe, null, xe(["both", "notes", "source"], (Z) => p("button", {
          key: Z,
          role: "radio",
          "aria-checked": l.value === Z,
          class: ze({ active: l.value === Z }),
          disabled: !z.value && Z !== "notes",
          title: A.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[Z],
          onClick: (Fe) => l.value = Z
        }, I(Z), 11, LS)), 64)),
        p("button", {
          disabled: !z.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Ae
        }, "A/B", 8, BS),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          K[14] || (K[14] = ae(" source ", -1)),
          Oe(p("input", {
            "onUpdate:modelValue": K[0] || (K[0] = (Z) => a.value = Z),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !z.value,
            "aria-label": "Source level"
          }, null, 8, ES), [
            [
              dt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, OS),
        p("span", IS, [
          p("button", {
            class: ze({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${h.value})`,
            onClick: K[1] || (K[1] = (Z) => c.value = !c.value)
          }, " ⇆ align" + I(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, RS),
          c.value ? (w(), C("span", PS, [
            K[15] || (K[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: K[2] || (K[2] = (Z) => d(-(i.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, NS),
            p("button", {
              title: "10 ms earlier",
              onClick: K[3] || (K[3] = (Z) => d(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, I(h.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: K[4] || (K[4] = (Z) => d(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: K[5] || (K[5] = (Z) => d(i.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, VS),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: K[6] || (K[6] = (Z) => u.value = 0)
            }, "reset", 8, HS)
          ])) : G("", !0)
        ]),
        A.value ? (w(), C("span", zS, I(A.value), 1)) : G("", !0)
      ])) : G("", !0),
      p("label", {
        title: i.loopRange ? `Play to the end of the selection (${i.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        Oe(p("input", {
          "onUpdate:modelValue": K[7] || (K[7] = (Z) => $.value = Z),
          type: "checkbox"
        }, null, 512), [
          [Nt, $.value]
        ]),
        ae(" loop " + I(i.loopRange ? i.loopRange.label : "section"), 1)
      ], 8, WS),
      p("label", FS, [
        Oe(p("input", {
          "onUpdate:modelValue": K[8] || (K[8] = (Z) => r.value = Z),
          type: "checkbox"
        }, null, 512), [
          [Nt, r.value]
        ]),
        K[16] || (K[16] = ae(" metronome", -1))
      ]),
      p("span", KS, [
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[9] || (K[9] = (Z) => s.value.Vocal = Z),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.Vocal]
          ]),
          K[17] || (K[17] = ae(" Vocal", -1))
        ]),
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[10] || (K[10] = (Z) => s.value.Ins = Z),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.Ins]
          ]),
          K[18] || (K[18] = ae(" Ins", -1))
        ]),
        p("label", null, [
          Oe(p("input", {
            "onUpdate:modelValue": K[11] || (K[11] = (Z) => s.value.chords = Z),
            type: "checkbox"
          }, null, 512), [
            [Nt, s.value.chords]
          ]),
          K[19] || (K[19] = ae(" chords", -1))
        ]),
        i.guide?.length ? (w(), C("label", _S, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: K[12] || (K[12] = (Z) => s.value = { ...s.value, guide: Z.target.checked })
          }, null, 40, US),
          K[20] || (K[20] = ae(" Guide ", -1))
        ])) : G("", !0)
      ]),
      p("label", GS, [
        K[22] || (K[22] = ae(" speed ", -1)),
        Oe(p("select", {
          "onUpdate:modelValue": K[13] || (K[13] = (Z) => o.value = Z),
          "aria-label": "Playback speed"
        }, [...K[21] || (K[21] = [
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
      p("span", jS, I(y.value ? `▶ ${E(Lo)(P.value)}` : `${i.position ? `cursor ${i.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      R.value ? (w(), C("span", qS, I(R.value), 1)) : G("", !0)
    ]));
  }
}), XS = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, JS = { class: "track-name" }, ZS = { class: "count" }, QS = ["value", "aria-label", "title", "onChange"], eC = ["value", "title"], tC = ["title"], nC = ["checked", "aria-label", "onChange"], iC = {
  key: 0,
  class: "hint"
}, sC = {
  key: 1,
  class: "hint"
}, oC = /* @__PURE__ */ Dt({
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
  emits: /* @__PURE__ */ Zt(["clearGuide"], ["update:voices", "update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = ut(i, "voices"), s = ut(i, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(d, h) {
      const f = o[d];
      s.value && f && (s.value = { ...s.value, [f]: h });
    }
    const l = e, a = B(
      () => Yp(t.view, t.guideCount).filter((d) => t.keepsGuide || d.voice !== "guide")
    );
    function u(d) {
      return d === "guide" ? n.value.guide !== !1 : n.value[d] !== !1;
    }
    function c(d, h) {
      d === "guide" ? n.value = { ...n.value, guide: h } : n.value = { ...n.value, [d]: h };
    }
    return (d, h) => (w(), C("div", XS, [
      h[2] || (h[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (w(!0), C(fe, null, xe(a.value, (f) => (w(), C("li", {
          key: f.voice,
          class: ze({ guide: f.voice === "guide", active: f.voice === "guide" && i.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: Ui({ background: f.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", JS, I(f.name), 1),
          p("span", {
            class: ze(["destination", { unsent: !f.sent }])
          }, I(f.destination), 3),
          p("span", ZS, I(E(qp)(f.notes)), 1),
          s.value && o[f.voice] ? (w(), C("select", {
            key: 0,
            class: "sound",
            value: s.value[o[f.voice]],
            "aria-label": `Sound of the ${f.name} track`,
            title: `The ${f.name} track’s sound in the playback`,
            onChange: (m) => r(f.voice, m.target.value)
          }, [
            (w(!0), C(fe, null, xe(E(Gc), (m) => (w(), C("option", {
              key: m,
              value: m,
              title: E(zo)[m].hint
            }, I(E(zo)[m].label), 9, eC))), 128))
          ], 40, QS)) : G("", !0),
          p("label", {
            class: "play",
            title: `Play the ${f.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(f.voice),
              "aria-label": `Play the ${f.name} track`,
              onChange: (m) => c(f.voice, m.target.checked)
            }, null, 40, nC)
          ], 8, tC),
          f.voice === "guide" && f.notes > 0 && !i.readonly ? (w(), C("button", {
            key: 1,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: h[0] || (h[0] = (m) => l("clearGuide"))
          }, " clear ")) : G("", !0)
        ], 2))), 128))
      ]),
      i.keepsGuide ? (w(), C("p", iC, [...h[1] || (h[1] = [
        ae(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        ae(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (w(), C("p", sC, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), rC = /^\[([^[\]\n]{1,40})\]$/;
function js(i) {
  const e = [], t = [];
  let n = null;
  for (const s of i.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = rC.exec(o);
    r ? (n = { tag: r[1].trim(), lines: [] }, t.push(n)) : o && (n ? n.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function lr(i) {
  return i.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function Ea(i, e) {
  return e && lr(e.tag) === lr(i) ? e.tag : i.replace(/(^|[\s-])(\p{L})/gu, (t, n, s) => n + s.toUpperCase());
}
function ar(i) {
  return i.sections.map((e) => i.measures[e.first_bar - 1]?.onset ?? 0);
}
function Mo(i, e) {
  if (!i?.trim() || !e) return null;
  const t = js(i), n = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== n.length || n.some((o, r) => lr(o.label) !== lr(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function lC(i, e) {
  const t = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return e.sections.forEach((n, s) => {
    if (n.implicit) return;
    const o = i.blocks[s] ?? null;
    t.push([`[${Ea(n.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function Cf(i, e) {
  return e?.length ? e : [[0, i.total, 0]];
}
function Mf(i, e, t) {
  const n = Cf(i, t), s = ar(i), o = (u) => {
    let c = -1;
    return s.forEach((d, h) => {
      d <= u && (c = h);
    }), c;
  }, r = (u) => {
    for (const [c, d, h] of n)
      if (u >= h && u < h + d - c) return c + u - h;
    return null;
  }, l = [], a = [];
  return ar(e).forEach((u, c) => {
    const d = r(u), h = d === null ? -1 : o(d);
    a.push(h), l.push(h >= 0 && d !== null && (d === s[h] || a[c - 1] !== h) ? h : -1);
  }), l;
}
function aC(i, e, t, n, s = () => null) {
  const o = Cf(e, n), r = ar(e), l = ar(t), a = (f) => {
    for (const [m, y, g] of o)
      if (f >= g && f < g + y - m) return m + f - g;
    return null;
  }, u = (f) => f ? { tag: f.tag, lines: [...f.lines] } : null, c = Mf(e, t, n), d = new Set(c.filter((f) => f >= 0)), h = l.map((f, m) => a(f) === null ? s(f) : c[m] >= 0 ? u(i.blocks[c[m]] ?? null) : null);
  return r.forEach((f, m) => {
    const y = i.blocks[m]?.lines;
    if (!(d.has(m) || !y?.length))
      for (const [g, b, T] of o) {
        if (f < g || f >= b) continue;
        const $ = T + f - g;
        let P = -1;
        l.forEach((V, O) => {
          V <= $ && (P = O);
        });
        const R = P >= 0 && l[P] !== $ ? h[P] : null;
        R && (h[P] = { tag: R.tag, lines: [...R.lines, ...y] });
      }
  }), { preamble: i.preamble, blocks: h };
}
function Af(i, e, t) {
  const n = [...i], s = t.trim();
  return e >= n.length ? s && n.push(s) : s ? n[e] = s : n.splice(e, 1), n;
}
function uC(i, e, t, n) {
  const s = js(i);
  if (!s.blocks[e]) return i;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Af(a.lines, t, n) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function cC(i, e, t, n, s) {
  const o = e.sections[t]?.label ?? "", r = i.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Ea(o, null), lines: [] };
    return { tag: u.tag, lines: Af(u.lines, n, s) };
  });
  return { preamble: i.preamble, blocks: r };
}
function hC(i, e, t) {
  const n = js(i);
  if (!n.blocks[e]) return i;
  const s = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return n.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function dC(i, e, t, n) {
  const s = e.sections[t]?.label ?? "", o = i.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Ea(s, null) }).tag, lines: [...n] } : r
  );
  return { preamble: i.preamble, blocks: o };
}
const fC = 2, pC = 0.5, mC = 32;
function zc(i, e, t, n) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= n) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, n) - l}.${o.pitch}`);
  }
  return `${i}:${s.join(",")}`;
}
function gC(i) {
  return i.measures.map((e) => [
    zc(e.meter, i.tracks.vocal, e.onset, e.onset + e.length),
    zc(e.meter, i.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function vC(i, e) {
  let t = 0;
  for (let n = 0; n < 2; n++) i[n] === e[n] && (t += i[n].endsWith(":") ? pC : fC);
  return t;
}
function yC(i, e) {
  const t = i.map((l) => e.map((a) => vC(l, a))), n = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < mC && l + u < i.length && a + u < e.length && !(n[l + u] <= 0 || t[l + u][a + u] !== n[l + u]); )
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
function bC(i, e) {
  if (e?.bars?.length)
    return !i || !e.bar_prints?.length ? i ? i.measures.map((t, n) => e.bars[n] ?? null) : e.bars : yC(gC(i), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const kC = "0.5.1";
function wC(i) {
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
function Wc(i, e) {
  return {
    ...i,
    ...e,
    sounds: { ...i.sounds, ...e.sounds ?? {} },
    record: { ...i.record, ...e.record ?? {} }
  };
}
function Ia(i) {
  if (typeof i != "object" || i === null) return {};
  const e = i, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const n = e.sounds;
    Object.values(n).some(hp) && (t.sounds = dp(n));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = fp(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), pp(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const bn = (i, e, t, n) => ({ Vocal: i, Ins: e, chord: t, guide: n }), Ao = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: bn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: bn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: bn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: bn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: bn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: bn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: bn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: bn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: bn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...cp(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: bn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], xC = "plenio/score-editor-presets.json", SC = "plenio.score_presets/1", Tf = "plenio.score-editor.presets";
function $f(i) {
  const e = typeof i == "object" && i !== null ? i : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), n.push({ name: r, builtIn: !1, settings: Ia(o.settings) }));
  }
  return n;
}
function Df(i) {
  return JSON.stringify({ schema: SC, presets: i.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function CC() {
  try {
    return $f(JSON.parse(window.localStorage.getItem(Tf) ?? "{}"));
  } catch {
    return [];
  }
}
function MC(i) {
  try {
    return window.localStorage.setItem(Tf, Df(i)), !0;
  } catch {
    return !1;
  }
}
const Lf = `/userdata/${encodeURIComponent(xC)}`;
async function AC(i) {
  if (i)
    try {
      const e = await i.fetchApi(Lf, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: $f(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: CC(), where: "browser" };
}
async function Fc(i, e) {
  const t = e.filter((n) => !n.builtIn);
  if (i)
    try {
      if ((await i.fetchApi(`${Lf}?overwrite=true`, { method: "POST", body: Df(t) })).ok) return "comfyui";
    } catch {
    }
  return MC(t) ? "browser" : "failed";
}
function TC(i, e) {
  return [...i.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, n) => t.name.localeCompare(n.name));
}
const Vo = "plenio.score_project/1", Bf = ".plenio.json";
function $C(i, e = /* @__PURE__ */ new Date()) {
  return {
    schema: Vo,
    app: `Plenio Music Production System ${kC}`,
    saved: e.toISOString(),
    title: (i.title ?? "").trim(),
    score: i.score,
    guide: (i.guide ?? []).map(([t, n, s]) => [t, n, s]),
    lyrics: i.lyrics?.trim() ? i.lyrics : null,
    lyric_spans: i.lyrics?.trim() ? jc(i.lyricSpans ?? []) : [],
    settings: i.settings ? Ia(i.settings) : {}
  };
}
function DC(i) {
  return `${Array.from((i ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${Bf}`;
}
function LC(i) {
  let e;
  try {
    e = JSON.parse(i);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== Vo ? `This file is not a Plenio score project (${Vo}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: Vo,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: Xp(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: jc(t.lyric_spans),
    settings: Ia(t.settings)
  };
}
const BC = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, OC = ["disabled", "title"], EC = ["disabled", "title"], IC = ["title"], RC = { class: "midi-settings" }, PC = ["aria-expanded"], NC = ["onKeydown"], VC = { class: "facts" }, HC = { key: 0 }, zC = ["value"], WC = ["value"], FC = ["value"], KC = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, _C = ["checked"], UC = ["value"], GC = { title: "Where the take's starts and ends go" }, jC = ["value"], qC = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, YC = ["value"], XC = { title: "Silence the old notes of the recorded voice while recording" }, JC = ["checked"], ZC = ["value"], QC = /* @__PURE__ */ Dt({
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
    const t = i, n = ut(i, "settings"), s = e, o = W(!1), r = W(null);
    function l() {
      o.value = !1, Sn(() => r.value?.focus());
    }
    const a = W(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    Hn(() => clearInterval(u));
    const c = B(() => {
      const y = t.hub.selected.value;
      if (y === "all") return null;
      const g = t.hub.devices.value.find((b) => b.id === y);
      return g?.connected ? null : g?.name ?? "the chosen keyboard";
    }), d = B(() => a.value - t.hub.activity.value < 250), h = B(() => {
      const y = t.hub;
      if (y.status.value === "ready") {
        const g = y.devices.value.filter((b) => b.connected);
        return g.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${g.length} keyboard${g.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return y.status.value === "asking" ? "asking for MIDI access…" : y.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : y.problem.value ?? "MIDI is not available";
    }), f = B(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${n.value.countIn ? `, after ${n.value.countIn} bar${n.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function m(y, g) {
      n.value = { ...n.value, [y]: g };
    }
    return (y, g) => (w(), C("span", BC, [
      p("button", {
        class: ze(["rec", { on: i.recording, counting: i.countingIn }]),
        disabled: !!i.disabled && !i.recording,
        title: f.value,
        onClick: g[0] || (g[0] = (b) => i.recording ? s("stop") : s("record"))
      }, " ● " + I(i.recording && i.countingIn ? "count-in" : "rec"), 11, OC),
      p("button", {
        class: ze(["step", { on: i.step }]),
        disabled: !!i.disabled || i.recording,
        title: i.disabled ?? (i.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${i.target}: every key writes a note of the step length at the cursor`),
        onClick: g[1] || (g[1] = (b) => s("step"))
      }, " step ", 10, EC),
      i.step ? (w(), C("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: g[2] || (g[2] = (b) => s("rest"))
      }, "rest ▶")) : G("", !0),
      p("span", {
        class: ze(["midi-light", { active: d.value, ready: i.hub.status.value === "ready" }]),
        title: h.value,
        "aria-hidden": "true"
      }, null, 10, IC),
      p("span", RC, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: g[3] || (g[3] = (b) => o.value ? l() : o.value = !0)
        }, "🎹", 8, PC),
        o.value ? (w(), C("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: st(Ue(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          g[24] || (g[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", VC, I(h.value), 1),
          i.hub.status.value === "ready" ? (w(), C("label", HC, [
            g[13] || (g[13] = ae(" keyboard ", -1)),
            p("select", {
              value: i.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: g[4] || (g[4] = (b) => i.hub.selected.value = b.target.value)
            }, [
              g[12] || (g[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (w(!0), C(fe, null, xe(i.hub.devices.value.filter((b) => b.connected), (b) => (w(), C("option", {
                key: b.id,
                value: b.id
              }, I(b.name), 9, WC))), 128)),
              c.value ? (w(), C("option", {
                key: 0,
                value: i.hub.selected.value,
                disabled: ""
              }, I(c.value) + " (unplugged)", 9, FC)) : G("", !0)
            ], 40, zC)
          ])) : i.hub.status.value !== "asking" ? (w(), C("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: g[5] || (g[5] = (b) => s("enable"))
          }, "use MIDI")) : G("", !0),
          p("label", KC, [
            p("input", {
              checked: n.value.thru,
              type: "checkbox",
              onChange: g[6] || (g[6] = (b) => m("thru", b.target.checked))
            }, null, 40, _C),
            g[14] || (g[14] = ae(" hear the keys ", -1))
          ]),
          p("strong", null, "Recording into " + I(i.target), 1),
          g[25] || (g[25] = p("span", { class: "facts" }, [
            ae("The voice is the roll's "),
            p("em", null, "draw into"),
            ae("; the take starts at the cursor.")
          ], -1)),
          p("label", null, [
            g[16] || (g[16] = ae(" count-in ", -1)),
            p("select", {
              value: n.value.countIn,
              "aria-label": "Count-in",
              onChange: g[7] || (g[7] = (b) => m("countIn", Number(b.target.value)))
            }, [...g[15] || (g[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, UC)
          ]),
          p("label", GC, [
            g[18] || (g[18] = ae(" quantize ", -1)),
            p("select", {
              value: n.value.quantize,
              "aria-label": "Quantize the take",
              onChange: g[8] || (g[8] = (b) => m("quantize", Number(b.target.value)))
            }, [...g[17] || (g[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, jC)
          ]),
          p("label", qC, [
            g[20] || (g[20] = ae(" mode ", -1)),
            p("select", {
              value: n.value.mode,
              "aria-label": "Replace or merge",
              onChange: g[9] || (g[9] = (b) => m("mode", b.target.value))
            }, [...g[19] || (g[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, YC)
          ]),
          p("label", XC, [
            p("input", {
              checked: n.value.mute,
              type: "checkbox",
              onChange: g[10] || (g[10] = (b) => m("mute", b.target.checked))
            }, null, 40, JC),
            g[21] || (g[21] = ae(" mute its old notes ", -1))
          ]),
          g[26] || (g[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            g[23] || (g[23] = ae(" step ", -1)),
            p("select", {
              value: n.value.stepLength,
              "aria-label": "Step length",
              onChange: g[11] || (g[11] = (b) => m("stepLength", Number(b.target.value)))
            }, [...g[22] || (g[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, ZC)
          ])
        ], 40, NC)) : G("", !0)
      ])
    ]));
  }
}), e2 = { class: "notation-export" }, t2 = ["disabled", "aria-expanded", "title"], n2 = ["onKeydown"], i2 = { title: "The paper of the PDF and the print" }, s2 = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, o2 = { class: "formats" }, r2 = ["disabled"], l2 = ["disabled"], a2 = ["disabled"], u2 = ["disabled"], c2 = { class: "facts" }, h2 = /* @__PURE__ */ Dt({
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
    const t = i, n = ut(i, "paper"), s = ut(i, "size"), o = e, r = W(!1), l = W(!1), a = W(null);
    function u() {
      r.value = !1, Sn(() => a.value?.focus());
    }
    async function c(d) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((f) => setTimeout(f, 20));
      let h = null;
      try {
        h = Pp(t.abc, t.title, n.value, s.value);
        const { lines: f } = h;
        if (!f.length) throw new Error("the score has no music to draw");
        const m = n.value === "a4" ? "A4" : "Letter";
        if (d === "pdf") {
          const y = await Np(f, n.value, t.title);
          Xi(Rr(t.title, "pdf"), y, "application/pdf"), o("done", `exported the notation as PDF (${m})`);
        } else d === "png" ? (Xi(Rr(t.title, "png"), await Vp(f), "image/png"), o("done", "exported the notation as PNG")) : d === "svg" ? (Xi(Rr(t.title, "svg"), new TextEncoder().encode(Hp(f)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (zp(f, n.value, t.title), o("done", `printing the notation (${m}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (f) {
        o("failed", `The notation could not be exported: ${f instanceof Error ? f.message : String(f)}`);
      } finally {
        h?.dispose(), l.value = !1;
      }
    }
    return (d, h) => (w(), C("span", e2, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !i.abc,
        "aria-expanded": r.value,
        title: i.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (f) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, t2),
      r.value ? (w(), C("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: st(Ue(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", i2, [
          h[8] || (h[8] = ae(" paper ", -1)),
          Oe(p("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (f) => n.value = f),
            "aria-label": "Paper"
          }, [...h[7] || (h[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [oi, n.value]
          ])
        ]),
        p("label", s2, [
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
            [oi, s.value]
          ])
        ]),
        p("span", o2, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[3] || (h[3] = (f) => c("pdf"))
          }, "PDF", 8, r2),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: h[4] || (h[4] = (f) => c("png"))
          }, "PNG", 8, l2),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[5] || (h[5] = (f) => c("svg"))
          }, "SVG", 8, a2),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[6] || (h[6] = (f) => c("print"))
          }, "Print…", 8, u2)
        ]),
        p("span", c2, I(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, n2)) : G("", !0)
    ]));
  }
}), d2 = { class: "sounds-settings" }, f2 = ["aria-expanded"], p2 = ["onKeydown"], m2 = { class: "row" }, g2 = { label: "Built in" }, v2 = ["value", "title"], y2 = {
  key: 0,
  label: "Yours"
}, b2 = ["value"], k2 = ["disabled"], w2 = {
  key: 0,
  class: "facts"
}, x2 = { class: "row" }, S2 = ["onKeydown"], C2 = ["disabled"], M2 = {
  key: 1,
  class: "facts",
  role: "status"
}, A2 = {
  key: 2,
  class: "facts"
}, T2 = { class: "track" }, $2 = ["value", "aria-label", "onChange"], D2 = ["value", "title"], L2 = ["title", "aria-label", "onClick"], B2 = /* @__PURE__ */ Dt({
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
    const t = i, n = ut(i, "sounds"), s = e, o = W(!1), r = W(null), l = W([]), a = W(null), u = W(!1), c = W(""), d = W(!1), h = W(""), f = W(null), m = B(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([O]) => O !== "guide" || t.keepsGuide)
    ), y = B(() => l.value.find((O) => O.name === c.value) ?? null);
    async function g() {
      if (o.value = !0, u.value) return;
      const O = await AC(t.fetcher);
      l.value = O.presets, a.value = O.where, u.value = !0;
    }
    function b() {
      o.value = !1, d.value = !1, Sn(() => r.value?.focus());
    }
    function T() {
      const O = [...Ao, ...l.value].find((_) => _.name === c.value);
      O && (s("apply", O.settings, O.name), f.value = `“${O.name}” is set.`);
    }
    async function $() {
      const O = h.value.trim().slice(0, 60);
      if (!O) return;
      if (Ao.some((ne) => ne.name.toLowerCase() === O.toLowerCase())) {
        f.value = `“${O}” is a built-in preset - choose another name.`;
        return;
      }
      const _ = TC(l.value, { name: O, builtIn: !1, settings: structuredClone(t.settings) }), N = await Fc(t.fetcher, _);
      if (N === "failed") {
        f.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = _, a.value = N, c.value = O, d.value = !1, h.value = "", f.value = N === "comfyui" ? `Saved “${O}” in ComfyUI’s user data.` : `Saved “${O}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function P() {
      const O = y.value;
      if (!O) return;
      const _ = l.value.filter((ne) => ne !== O);
      if (await Fc(t.fetcher, _) === "failed") {
        f.value = "The preset could not be deleted.";
        return;
      }
      l.value = _, c.value = "", f.value = `Deleted “${O.name}”.`;
    }
    function R(O, _) {
      n.value = { ...n.value, [O]: _ };
    }
    function V(O) {
      const _ = n.value[O], N = O === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : O === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [ne, z, A] of N) setTimeout(() => ea(ne, A, _), z * 1e3);
    }
    return (O, _) => (w(), C("span", d2, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: _[0] || (_[0] = (N) => o.value ? b() : g())
      }, "♫ sounds", 8, f2),
      o.value ? (w(), C("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: st(Ue(b, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: b
        }, "×"),
        _[6] || (_[6] = p("strong", null, "Preset", -1)),
        p("span", m2, [
          Oe(p("select", {
            "onUpdate:modelValue": _[1] || (_[1] = (N) => c.value = N),
            "aria-label": "Preset"
          }, [
            _[5] || (_[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", g2, [
              (w(!0), C(fe, null, xe(E(Ao), (N) => (w(), C("option", {
                key: N.name,
                value: N.name,
                title: N.note
              }, I(N.name), 9, v2))), 128))
            ]),
            l.value.length ? (w(), C("optgroup", y2, [
              (w(!0), C(fe, null, xe(l.value, (N) => (w(), C("option", {
                key: "own-" + N.name,
                value: N.name
              }, I(N.name), 9, b2))), 128))
            ])) : G("", !0)
          ], 512), [
            [oi, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: T
          }, "use", 8, k2),
          y.value ? (w(), C("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: P
          }, "delete")) : G("", !0)
        ]),
        c.value ? (w(), C("span", w2, I([...E(Ao), ...l.value].find((N) => N.name === c.value)?.note ?? "Your preset"), 1)) : G("", !0),
        p("span", x2, [
          d.value ? (w(), C(fe, { key: 0 }, [
            Oe(p("input", {
              "onUpdate:modelValue": _[2] || (_[2] = (N) => h.value = N),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                st(Ue($, ["prevent"]), ["enter"]),
                _[3] || (_[3] = st(Ue((N) => d.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, S2), [
              [dt, h.value]
            ]),
            p("button", {
              disabled: !h.value.trim(),
              onClick: $
            }, "save", 8, C2)
          ], 64)) : (w(), C("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: _[4] || (_[4] = (N) => d.value = !0)
          }, " save current as preset… "))
        ]),
        f.value ? (w(), C("span", M2, I(f.value), 1)) : a.value === "browser" ? (w(), C("span", A2, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : G("", !0),
        _[7] || (_[7] = p("strong", null, "Sounds", -1)),
        (w(!0), C(fe, null, xe(m.value, ([N, ne]) => (w(), C("label", {
          key: N,
          class: "row"
        }, [
          p("span", T2, I(ne), 1),
          p("select", {
            value: n.value[N],
            "aria-label": `Sound of the ${ne} track`,
            onChange: (z) => R(N, z.target.value)
          }, [
            (w(!0), C(fe, null, xe(E(Gc), (z) => (w(), C("option", {
              key: z,
              value: z,
              title: E(zo)[z].hint
            }, I(E(zo)[z].label), 9, D2))), 128))
          ], 40, $2),
          p("button", {
            title: `Hear the ${ne} track’s sound`,
            "aria-label": `Hear the ${ne} sound`,
            onClick: Ue((z) => V(N), ["prevent"])
          }, "▶", 8, L2)
        ]))), 128)),
        _[8] || (_[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, p2)) : G("", !0)
    ]));
  }
});
function O2(i) {
  return i.length >= 3 && (i[0] & 240) === 176 && (i[1] === 120 || i[1] === 123);
}
function E2(i, e, t) {
  if (i.length < 3) return null;
  const n = i[0] & 240, s = i[0] & 15, o = i[1] & 127, r = i[2] & 127;
  return n === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : n === 128 || n === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function I2(i, e) {
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
class R2 {
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
    if (O2(t.data)) {
      this.letGo(e, n);
      return;
    }
    const s = E2(t.data, n, e);
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
    this.status.value = e, this.problem.value = I2(e, t);
  }
}
let Kc = null;
function P2() {
  return Kc ??= new R2(), Kc;
}
const N2 = 0.035;
class V2 {
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
function H2(i, e) {
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
      const b = Math.round((y.start - t) / l) * l + t;
      b > f && (m = Math.min(m, b));
    }
    f = Math.max(0, Math.min(f, s - 1)), m = Math.min(m, s);
    const g = c.at(-1);
    if (g && f <= g.onset) {
      m - f > g.duration && (c[c.length - 1] = { onset: g.onset, duration: m - g.onset, pitch: h.pitch });
      continue;
    }
    g && g.onset + g.duration > f && (g.duration = f - g.onset), g && f - (g.onset + g.duration) <= l && (g.duration = f - g.onset), m > f && c.push({ onset: f, duration: m - f, pitch: h.pitch });
  }
  return c;
}
function z2(i, e, t, n, s) {
  return {
    op: "place_notes",
    track: i,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(n), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function rl(i, e) {
  if (!e) return 1;
  const t = Number(i.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const W2 = 40;
function F2(i) {
  const e = W(!1), t = W(!1), n = _i(null), s = W(0), o = new Zk();
  let r = !1, l = null, a = null;
  const u = W(0), c = B(() => {
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
    return ne ? Oa(ne, Math.max(0, N)) : null;
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
    const ne = i.settings(), z = i.track(), A = Math.min(i.locator.value, N.model.total - 1), H = i.transport();
    if (!H) return;
    if (n.value = new V2(A, z), r = !1, e.value = !0, s.value = A, !H.record(Ba(N, A), {
      countIn: ne.countIn,
      mute: ne.mute ? z === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, n.value = null, i.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    i.notify(`recording into ${z === "vocal" ? "Vocal" : "Ins"} from bar ${_2(N, A)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function y() {
    i.transport()?.stop();
  }
  function g() {
    e.value && (r = !0, i.transport()?.stop());
  }
  function b(N) {
    if (!e.value || N === null) return;
    const ne = f(N);
    ne !== null && (s.value = ne);
  }
  async function T() {
    if (!e.value) return;
    const N = n.value, ne = i.view();
    e.value = !1, n.value = null, o.allOff();
    const z = ne?.model;
    if (!N || !z) return;
    if (r) {
      i.notify("recording thrown away");
      return;
    }
    const A = Math.max(s.value, N.start), H = z.measures.find((Ee) => Ee.onset <= N.start && N.start < Ee.onset + Ee.length) ?? z.measures[0], pe = ne.bars[(H?.n ?? 1) - 1], ve = H && pe?.duration_s ? H.length / pe.duration_s : 8, ie = Number(H?.meter.split("/")[0]) || 4, le = H2(N.finish(A), {
      start: N.start,
      stop: A,
      total: z.total,
      grid: rl(z.unit, i.settings().quantize),
      chordUnits: N2 * ve,
      pickup: (H?.length ?? 16) / ie / 2
    });
    if (!le.length) {
      i.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await i.operate(z2(N.track, le, N.start, A, i.settings().mode));
  }
  function $(N) {
    if (i.settings().thru && (i.sound && (o.sound = i.sound()), N.kind === "on" ? o.on(N.note, N.velocity) : o.off(N.note)), e.value && n.value) {
      const z = i.transport()?.scoreSecondAt(N.time) ?? null, A = i.view();
      if (z === null || !A) return;
      const H = K2(A, n.value.start, z);
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
    }, W2) };
  }
  async function R() {
    const N = a?.pitches ?? [];
    a = null;
    const z = i.view()?.model;
    if (!z || !N.length || i.readonly()) return;
    const A = rl(z.unit, i.settings().stepLength), H = i.locator.value;
    if (H >= z.total) {
      i.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await i.operate({
      op: "place_notes",
      track: i.track(),
      notes: [{ onset: H, duration: Math.min(A, z.total - H), pitch: Math.max(...N) }],
      label: "step"
    }) && (i.locator.value = Math.min(z.total, H + A));
  }
  function V() {
    const N = i.view()?.model;
    N && (i.locator.value = Math.min(N.total, i.locator.value + rl(N.unit, i.settings().stepLength)));
  }
  async function O() {
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
  return { recording: e, step: t, live: c, start: m, stop: y, cancel: g, onTime: b, onStopped: T, toggleStep: O, rest: V, ready: h, dispose: _ };
}
function K2(i, e, t) {
  const n = i.model;
  if (!n) return null;
  const s = Ba(i, e);
  if (t >= s) return Oa(i, t);
  const o = n.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? n.measures[0], r = i.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function _2(i, e) {
  let t = 1;
  for (const n of i.model?.measures ?? []) n.onset <= e && (t = n.n);
  return t;
}
const U2 = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, G2 = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, j2 = ["aria-checked"], q2 = ["aria-checked"], Y2 = ["aria-checked"], X2 = { title: "The piano roll and chord lane above the notation" }, J2 = { title: "Show the ABC text under the notation" }, Z2 = { title: "Zoom of the notation" }, Q2 = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, eM = ["disabled", "title"], tM = ["disabled", "title"], nM = ["disabled"], iM = ["disabled", "title"], sM = ["disabled", "title"], oM = ["accept"], rM = {
  key: 1,
  class: "facts"
}, lM = {
  key: 2,
  class: "facts ok"
}, aM = {
  key: 3,
  class: "facts bad"
}, uM = {
  key: 4,
  class: "badge"
}, cM = {
  key: 1,
  class: "gate",
  role: "status"
}, hM = {
  key: 2,
  class: "gate",
  role: "status"
}, dM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], fM = ["data-layout", "data-text"], pM = { class: "side" }, mM = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, gM = {
  key: 0,
  class: "hint"
}, vM = {
  key: 0,
  class: "hint changed"
}, yM = {
  key: 1,
  class: "hint"
}, bM = {
  key: 2,
  class: "fit-panel"
}, kM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], wM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], xM = {
  class: "status",
  "aria-live": "polite"
}, SM = {
  key: 5,
  class: "error",
  role: "alert"
}, CM = {
  key: 6,
  class: "error",
  role: "alert"
}, MM = {
  key: 7,
  class: "error",
  role: "alert"
}, AM = {
  key: 9,
  class: "diagnostics"
}, TM = ["data-severity"], $M = ["title", "onClick"], DM = {
  key: 1,
  class: "where"
}, _c = /* @__PURE__ */ Dt({
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
    const o = _i(null), r = W(null), l = W(null);
    function a(v) {
      const x = v.op === "paste" && v.mode === "insert" && Array.isArray(v.sections) ? v.sections : [], D = typeof v.at == "number" ? v.at : 0, te = Qn.value;
      return (ce) => {
        let me = -1;
        x.forEach((De, Te) => {
          De.onset <= ce - D && (me = Te);
        });
        const Ie = me >= 0 ? te?.sections[me]?.lyrics : null;
        return Ie ? { tag: Ie.tag, lines: [...Ie.lines] } : null;
      };
    }
    const u = Ak(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => n("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => St(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (v) => {
        s(v) && (Array.isArray(v.guide) && t.guide !== void 0 && !ws(v.guide, t.guide) && n("guideChange", [...v.guide]), "lyrics" in v && (o.value = v.lyrics ?? null), "looseLyrics" in v && (r.value = v.looseLyrics ?? null), Array.isArray(v.spans) && Fn(v.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (v, x) => {
        const D = {}, te = {}, ce = t.guide;
        if (ce?.length && v.time_map?.length) {
          const et = Zp(ce, v.time_map);
          ws(et, ce) || (n("guideChange", et), D.guide = [...ce], te.guide = et);
        }
        const me = St(), Ie = o.value, De = ie.value?.model, Te = v.analysis.model;
        let at = me.length && v.time_map?.length ? Gp(me, v.time_map) : me;
        if (at.length && Ie && De && Te) {
          const et = (Pi) => Pi.sections.flatMap((fs, Or) => fs.implicit ? [] : [Or]), gi = Te.sections.map((Pi) => Te.measures[Pi.first_bar - 1]?.onset ?? 0);
          at = jp(at, Mf(De, Te, v.time_map), et(De), et(Te), gi);
        }
        if (Do(at, me) || (Fn(at), D.spans = [...me], te.spans = at), Ie && De && Te) {
          const et = aC(Ie, De, Te, v.time_map, a(x));
          o.value = et, D.lyrics = Ie, te.lyrics = et;
        }
        return Object.keys(te).length ? { before: D, after: te } : void 0;
      }
    });
    Re(
      () => [t.doc.text, u.commitBlock],
      ([v, x]) => {
        t.readonly || n("gate", v, x);
      },
      { immediate: !0 }
    );
    const c = W(mp()), d = W(e1(t.layoutDefault, c.value.layout));
    function h(v) {
      d.value = v, c.value = { ...c.value, layout: v };
    }
    const f = W([]), m = W(0), y = W(null), g = W(null), b = W(null), T = W(null), $ = W(null), P = W("vocal"), R = B({
      get: () => c.value.sounds,
      set: (v) => c.value = { ...c.value, sounds: v }
    }), V = B(() => wC(c.value));
    function O(v, x) {
      c.value = Wc(c.value, v), u.notes = [`${x}: ${_(v)}`];
    }
    function _(v) {
      const x = [];
      return v.sounds && x.push("sounds"), v.metronome !== void 0 && x.push(`metronome ${v.metronome ? "on" : "off"}`), v.hear && x.push(`hear ${v.hear}`), (v.wave !== void 0 || v.sung !== void 0) && x.push("the source view"), v.record && x.push("recording"), v.paper && x.push(`paper ${v.paper === "a4" ? "A4" : "Letter"}`), v.notationSize && x.push(`notation ${v.notationSize}`), x.length ? `${x.join(", ")} set` : "nothing to set";
    }
    const N = B(() => c.value.sounds[P.value === "vocal" ? "Vocal" : "Ins"]);
    Re(c, (v) => Ap(v), { deep: !0 });
    const ne = P2();
    ne.selected.value = c.value.midiInput, Re(ne.selected, (v) => c.value = { ...c.value, midiInput: v });
    const z = B({
      get: () => c.value.record,
      set: (v) => c.value = { ...c.value, record: v }
    }), A = F2({
      hub: ne,
      transport: () => b.value,
      view: () => ie.value,
      locator: m,
      track: () => P.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: J,
      notify: (v) => u.notes = [v],
      problem: (v) => H.value = v,
      sound: () => N.value
    }), H = W(null), pe = B(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : Z.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function ve(v) {
      const x = v.target;
      $.value?.contains(x) || Br(x) || v.ctrlKey || v.metaKey || v.altKey || v.key !== " " && v.key !== "Escape" || (v.preventDefault(), v.stopPropagation(), v.key === " " ? A.stop() : A.cancel());
    }
    Re(A.recording, (v) => {
      v ? window.addEventListener("keydown", ve, !0) : window.removeEventListener("keydown", ve, !0);
    }), Hn(() => {
      window.removeEventListener("keydown", ve, !0), A.cancel(), A.dispose();
    }), Hn(() => u.dispose());
    const ie = B(() => u.lastValid), le = B(() => !!u.view && !u.view.ok), Ee = B(() => u.view?.diagnostics ?? []), Se = B(
      () => Ee.value.filter((v) => v.severity === "error" && v.bar).map((v) => v.bar)
    ), Be = B(
      () => wf(ie.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Me = B(() => d.value !== "text"), j = B(() => d.value === "daw"), Qe = B(() => t.guide ?? []), ue = B(() => Jp(t.guide, ie.value?.model)), Ae = B(() => j.value ? c.value.voices.guide ?? !0 : !1), ee = B(() => Ae.value ? ue.value : []), K = B(() => Me.value && c.value.roll && !!(ie.value?.model || ie.value?.model_error)), Z = B(() => ie.value?.model ?? null), Fe = B(() => Z.value ? Is(Z.value, m.value) : Be.value), nt = B(() => ie.value && Z.value ? Ba(ie.value, m.value) : null), Ge = B(() => Z.value ? Sf(Z.value, m.value) : "");
    Re(
      () => Z.value?.total,
      (v) => {
        v !== void 0 && m.value > v && (m.value = v);
      }
    );
    let xt = null, Q = null, U = !1;
    Re(
      () => [t.lyricsTarget, t.lyrics, Z.value],
      ([v, x, D]) => {
        if (!v || !x?.trim()) {
          o.value = null, r.value = null, xt = null, U = !1;
          return;
        }
        const te = x === xt || x === Q;
        if (xt = x, te && (U || !D)) {
          if (o.value && D && o.value.blocks.length !== D.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && D) {
            const me = Mo(r.value, D);
            me && (o.value = me, r.value = null);
          }
          return;
        }
        const ce = !U && t.lyricsPending || x;
        o.value = D ? Mo(ce, D) : null, r.value = o.value ? null : ce, U = !!D;
      },
      { immediate: !0 }
    ), Re(
      [o, r, Z],
      () => {
        const v = o.value, x = Z.value;
        v ? x && v.blocks.length === x.sections.length && (l.value = lC(v, x)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Re(
      l,
      (v, x) => {
        Q = v, n("lyricsChange", v), x !== void 0 && v !== x && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const he = B(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), we = B(
      () => !!l.value && !t.lyricsTarget?.own && jt(l.value) !== jt(t.lyrics ?? "")
    ), Ce = B(() => l.value ? js(l.value).blocks.map((v) => v.tag).join(" · ") : ""), Wn = B(() => l.value ?? t.lyrics ?? null);
    function ft() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...St()] };
    }
    const It = _i(null);
    function St() {
      return It.value ?? t.lyricSpans ?? [];
    }
    function Fn(v) {
      Do(v, St()) || (It.value = v, n("lyricSpansChange", v), u.refreshLyrics());
    }
    Re(
      () => t.lyricSpans,
      (v) => {
        v && It.value && Do(v, It.value) || (It.value = null, u.refreshLyrics());
      }
    );
    const ct = W([]);
    Re(
      () => u.selection,
      (v) => {
        v.length && (ct.value = []);
      }
    );
    function Oi(v) {
      const x = ie.value?.lyrics;
      return !!x && !!Wp(x, v)?.lines.some((D) => D.pinned);
    }
    function Wt(v) {
      const x = Z.value;
      if (!x) return -1;
      let D = -1;
      return x.sections.findIndex((te) => !te.implicit && ++D === v);
    }
    function Kn(v) {
      if (o.value) {
        const D = Wt(v);
        return D < 0 ? null : [...o.value.blocks[D]?.lines ?? []];
      }
      if (r.value === null) return null;
      const x = js(r.value).blocks[v];
      return x ? [...x.lines] : null;
    }
    function Dn() {
      return Math.max(1, Math.round(Z.value?.grid.units_per_quarter ?? 1));
    }
    function Ut(v, x, D) {
      const te = Z.value, ce = ie.value?.lyrics;
      if (!te || !ce || !he.value) return [];
      const me = ft(), Ie = [], De = /* @__PURE__ */ new Map();
      for (const Te of [...new Set(v)].sort((at, et) => at - et)) {
        const at = Kn(Te);
        if (at === null) continue;
        const et = to(ce, Te, te.total), gi = Fp(x(Te, Xa(ce, Te, at, et, Dn())), et), Pi = gi.map((fs) => fs.text);
        if (o.value) o.value = dC(o.value, te, Wt(Te), Pi);
        else if (r.value !== null) r.value = hC(r.value, Te, Pi);
        else continue;
        gi.forEach((fs, Or) => {
          fs.id.startsWith("*") && Ie.push(Wo(Te, Or));
        }), De.set(Te, gi);
      }
      return De.size ? (Fn(Kp(St(), ce, De)), u.recordSide(D, me, ft()), Ie) : [];
    }
    function Ct(v) {
      const x = /* @__PURE__ */ new Map();
      for (const D of v) {
        const te = _p(D);
        te && (x.has(te.block) || x.set(te.block, /* @__PURE__ */ new Set()), x.get(te.block)?.add(te.line));
      }
      return x;
    }
    function di(v) {
      const x = new Map(v.map((te) => [te.key, te])), D = v.length;
      ct.value = Ut(
        [...Ct(v.map((te) => te.key)).keys()],
        (te, ce) => ce.map((me, Ie) => {
          const De = x.get(Wo(te, Ie));
          return De ? { ...me, id: `*${me.id}`, start: De.start, end: De.end } : me;
        }),
        `lyrics: ${D === 1 ? "line" : `${D} lines`} placed`
      );
    }
    function dn(v) {
      const x = Ct(v);
      x.size && (Ut(
        [...x.keys()],
        (D, te) => te.filter((ce, me) => !x.get(D)?.has(me)),
        `lyrics: ${v.length === 1 ? "line" : `${v.length} lines`} deleted`
      ), ct.value = []);
    }
    function en() {
      const v = Z.value, x = ie.value?.lyrics;
      if (!v || !x) return [];
      const D = [];
      for (const [te, ce] of Ct(ct.value)) {
        const me = Kn(te);
        me && Xa(x, te, me, to(x, te, v.total), Dn()).forEach((Ie, De) => {
          ce.has(De) && D.push(Ie);
        });
      }
      return D;
    }
    function _n() {
      const v = Z.value ? Cx(Z.value.unit, Ja(en())) : null;
      return v ? (Qn.value = v, u.error = null, u.notes = [`copied ${v.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function fi(v, x, D) {
      const te = Z.value, ce = ie.value?.lyrics;
      if (!te || !ce) return;
      const me = Up(ce, x);
      if (!me || Kn(me.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, Ie] = to(ce, me.block, te.total), De = v.filter((Te) => x + Te.offset < Ie);
      De.length && (ct.value = Ut(
        [me.block],
        (Te, at) => [
          ...at,
          ...De.map((et, gi) => ({
            id: `*new${gi}`,
            text: et.text,
            start: x + et.offset,
            end: Math.min(x + et.offset + et.length, Ie)
          }))
        ],
        D
      ), u.error = null, De.length < v.length && (u.notes = [`${v.length - De.length} line(s) did not fit before the next block's first line`]));
    }
    function Ln(v) {
      const x = Qn.value;
      if ((v === "paste" || v === "insert") && x?.lyricLines?.length)
        return he.value ? Z.value && x.unit !== Z.value.unit ? (u.error = `The lines were copied with L:${x.unit} and do not fit this score's L:${Z.value.unit}.`, !0) : (fi(x.lyricLines, m.value, `lyrics: ${x.label} pasted`), !0) : !0;
      if (!ct.value.length) return !1;
      if (v === "copy") _n();
      else if (v === "cut")
        _n() && dn(ct.value);
      else if (v === "duplicate") {
        const D = en();
        if (D.length) {
          const te = Math.max(...D.map((ce) => ce.end));
          fi(Ja(D), te, `lyrics: ${D.length === 1 ? "line" : `${D.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function vt(v) {
      const x = Z.value, D = ie.value?.lyrics;
      if (x && D && Oi(v.block)) {
        const ce = Dn();
        Ut(
          [v.block],
          (me, Ie) => {
            if (v.line < Ie.length)
              return v.text ? Ie.map((Te, at) => at === v.line ? { ...Te, text: v.text } : Te) : Ie.filter((Te, at) => at !== v.line);
            const De = v.at ?? Ie[Ie.length - 1]?.end ?? to(D, v.block, x.total)[0];
            return v.text ? [...Ie, { id: "*typed", text: v.text, start: De, end: De + ce }] : Ie;
          },
          `lyrics: ${v.text || "line removed"}`
        );
        return;
      }
      const te = ft();
      if (o.value && x) o.value = cC(o.value, x, Wt(v.block), v.line, v.text);
      else if (r.value !== null) r.value = uC(r.value, v.block, v.line, v.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${v.text || "line removed"}`, te, ft());
    }
    function hs() {
      const v = t.lyrics, x = Z.value;
      if (!v) return;
      const D = ft();
      o.value = x ? Mo(v, x) : null, r.value = o.value ? null : v, t.readonly || u.recordSide("lyrics reverted", D, ft());
    }
    Re(Z, (v) => {
      if (!Dr || !v || r.value === null) return;
      Dr = !1;
      const x = Mo(r.value, v);
      x && (o.value = x, r.value = null);
    }), Re(Be, (v) => {
      !K.value && v && Z.value && (m.value = $c(Z.value, v));
    });
    const Mt = B({
      get: () => c.value.metronome,
      set: (v) => c.value = { ...c.value, metronome: v }
    }), Un = B(() => t.payload?.reference_audio ? xp(t.fetcher, t.payload.reference_audio) : null), Rt = _i(null), Gn = W(null);
    Re(
      Un,
      (v) => {
        Rt.value = null, Gn.value = null, v && iw(v).then(
          (x) => {
            Un.value === v && (Rt.value = x);
          },
          (x) => {
            Un.value === v && (Gn.value = `the source recording could not be read: ${x instanceof Error ? x.message : String(x)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const fn = B({
      get: () => c.value.hear,
      set: (v) => c.value = { ...c.value, hear: v }
    }), Gt = B({
      get: () => c.value.sourceLevel,
      set: (v) => c.value = { ...c.value, sourceLevel: v }
    }), pi = B(() => {
      const v = ie.value, x = v?.model;
      if (!v || !x) return null;
      const D = mi(), te = [...D.notes.map((Te) => [Te.onset, Te.onset + Te.duration]), ...D.chords.map((Te) => [Te.onset, Te.onset + 1])];
      if (!te.length) return null;
      const ce = Is(x, Math.min(...te.map(([Te]) => Te))), me = Is(x, Math.max(...te.map(([, Te]) => Te)) - 1), Ie = v.bars[ce - 1], De = v.bars[me - 1];
      return !Ie || !De ? null : { from: Ie.start_s, to: De.start_s + De.duration_s, label: ce === me ? `bar ${ce}` : `bars ${ce}-${me}` };
    }), Ft = B(() => {
      const v = bC(ie.value?.model, t.payload?.timeline), x = t.sourceShift ?? 0;
      return !v || !x ? v : v.map((D) => D ? [D[0] - x, D[1] - x, D[2]] : null);
    }), Ei = B(() => {
      const v = Ft.value?.[(Fe.value ?? 1) - 1] ?? Ft.value?.find((D) => D);
      if (!v) return 0.5;
      const x = Number(v[2].split("/")[0]) || 4;
      return (v[1] - v[0]) / x;
    }), ds = B(() => {
      const v = t.payload?.sung_pitch;
      if (!v) return null;
      const x = rw(v), D = Z.value;
      return !x || !D ? { problem: "problem" in v ? v.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: x, offset: uw(D, Ft.value, x), bars: Ft.value };
    }), pn = B({
      get: () => t.sourceShift ?? 0,
      set: (v) => n("sourceShiftChange", Math.round(v * 1e3) / 1e3)
    }), He = B(() => Ft.value?.map((v) => v?.[0] ?? null) ?? null), pt = B(() => ie.value?.header?.unit ?? "1/16"), mn = B({
      get: () => c.value.voices,
      set: (v) => c.value = { ...c.value, voices: v }
    }), jn = B({
      get: () => c.value.speed,
      set: (v) => c.value = { ...c.value, speed: v }
    });
    function Pt(v, x = !1, D = "notation") {
      const te = x ? u.selection.includes(v) ? u.selection.filter((me) => me !== v) : [...u.selection, v] : [v];
      u.select(te);
      const ce = Si(ie.value, te[0]);
      g.value = D !== "text" && ce ? [ce.source[0], ce.source[1]] : g.value;
    }
    function Ii(v) {
      if (!ie.value || le.value) return;
      const x = cm(ie.value, v);
      x && Pt(x.id, !1, "text");
    }
    function tn(v) {
      if (!ie.value) return;
      ie.value.model && (m.value = $c(ie.value.model, v));
      const x = fm(ie.value, v);
      x && Pt(x.id, !1, "keys");
    }
    function L() {
      return A.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function Y(v) {
      t.readonly || L() || await u.operate(v);
    }
    function J(v) {
      return t.readonly || L() ? Promise.resolve(!1) : u.operate(v);
    }
    function ge() {
      L() || u.undo();
    }
    function mt() {
      L() || u.redo();
    }
    function Tr(v) {
      u.select(v);
      const x = Si(ie.value, v[0]);
      x && (g.value = [x.source[0], x.source[1]]);
    }
    function mi() {
      const v = Z.value;
      if (!v) return { notes: [], chords: [] };
      const x = as(ie.value, u.selection), D = Gs(u.selection);
      return {
        notes: [...v.tracks.vocal, ...v.tracks.ins].filter((te) => x.has(te.id)),
        chords: v.tracks.chords.filter((te) => D.has(te.id))
      };
    }
    function k() {
      const v = Z.value, x = mi(), D = v ? Nc(v, x.notes, x.chords) : null;
      return D ? (Qn.value = D, u.error = null, u.notes = [`copied ${D.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function M(v) {
      if (Ln(v)) return;
      const x = Z.value;
      if (v === "copy") {
        k();
        return;
      }
      if (t.readonly || !x) return;
      if (v === "cut") {
        const ce = mi();
        if (!k()) return;
        await Y({ op: "delete", ids: [...ce.notes.map((me) => me.id), ...ce.chords.map((me) => me.id)] });
        return;
      }
      if (v === "duplicate") {
        const ce = mi(), me = Nc(x, ce.notes, ce.chords);
        if (!me) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Ie = Math.min(...ce.notes.map((Te) => Te.onset), ...ce.chords.map((Te) => Te.onset)), De = Hc(me, x, Ie + me.span, "overwrite");
        typeof De == "string" ? u.error = "There is no room after the selection to duplicate it." : await Y(De);
        return;
      }
      const D = Qn.value;
      if (!D) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const te = Hc(D, x, m.value, v === "insert" ? "insert" : "overwrite");
      typeof te == "string" ? u.error = te : await Y(te);
    }
    function S(v) {
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
    function q(v) {
      y.value = v === null || !ie.value ? null : Oa(ie.value, v), A.onTime(v);
    }
    function F() {
      t.readonly || !t.guide?.length || n("guideChange", []);
    }
    const re = B({
      get: () => c.value.rollZoom,
      set: (v) => c.value = { ...c.value, rollZoom: v }
    }), ke = B(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function Ne(v) {
      v.preventDefault();
      const x = c.value.rollHeight;
      $o(v, ({ dy: D }) => c.value = { ...c.value, rollHeight: Wa(x, D) });
    }
    function be(v) {
      const x = v.key === "ArrowUp" ? -16 : v.key === "ArrowDown" ? 16 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, rollHeight: Wa(c.value.rollHeight, x) });
    }
    function Le(v) {
      v.preventDefault();
      const x = c.value.notationShare, te = v.currentTarget.parentElement?.clientHeight ?? 0;
      $o(v, ({ dy: ce }) => c.value = { ...c.value, notationShare: Tp(x, ce, te) });
    }
    function je(v) {
      const x = v.key === "ArrowDown" ? 0.03 : v.key === "ArrowUp" ? -0.03 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, notationShare: Sp(c.value.notationShare + x) });
    }
    function ht(v) {
      v.preventDefault();
      const x = c.value.sideWidth;
      $o(v, ({ dx: D }) => c.value = { ...c.value, sideWidth: Fa(x, D) });
    }
    function yt(v) {
      const x = v.key === "ArrowLeft" ? -16 : v.key === "ArrowRight" ? 16 : 0;
      x && (v.preventDefault(), c.value = { ...c.value, sideWidth: Fa(c.value.sideWidth, x) });
    }
    const qn = W(null), Bn = W(null), lt = W(null), Yn = W(!1), $r = B(() => t.guide !== void 0), Ra = B(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && ie.value?.display_abc ? null : "There is no score to export yet."), Pa = B({
      get: () => c.value.paper,
      set: (v) => c.value = { ...c.value, paper: v }
    }), Na = B({
      get: () => c.value.notationSize,
      set: (v) => c.value = { ...c.value, notationSize: v }
    });
    function Of(v) {
      lt.value = null, u.notes = [v];
    }
    const Ri = B(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Ef() {
      const v = Ri.value;
      if (v) {
        lt.value = v;
        return;
      }
      Yn.value = !0, lt.value = null;
      try {
        const x = await Cp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        Xi(x.filename, wk(x.data));
      } catch (x) {
        lt.value = Ji(x);
      } finally {
        Yn.value = !1;
      }
    }
    async function If() {
      const v = Ri.value;
      if (v) {
        lt.value = v;
        return;
      }
      Yn.value = !0, lt.value = null;
      try {
        const x = await Mp(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: St()
        });
        Xi(x.filename, new TextEncoder().encode(x.data), x.type);
      } catch (x) {
        lt.value = Ji(x);
      } finally {
        Yn.value = !1;
      }
    }
    const Va = W(null);
    function Rf() {
      const v = $C({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: St(),
        settings: V.value
      });
      Xi(DC(t.title), new TextEncoder().encode(`${JSON.stringify(v, null, 1)}
`), "application/json"), lt.value = null, u.notes = [`saved the project: score${v.guide.length ? `, ${Ha(v.guide.length)}` : ""}${v.lyrics ? ", lyrics" : ""}, settings`];
    }
    function Pf() {
      lt.value = null, Va.value?.click();
    }
    async function Nf(v) {
      const x = v.target, D = x.files?.[0];
      if (x.value = "", !D) return;
      const te = LC(await D.text());
      typeof te == "string" ? lt.value = te : Vf(te, D.name);
    }
    const Ha = (v) => v === 1 ? "1 Guide note" : `${v} Guide notes`;
    let Dr = !1;
    function Vf(v, x) {
      if (L()) return;
      if (t.readonly) {
        lt.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const D = ["score"], te = [], ce = ft(), me = {}, Ie = t.guide;
      Ie !== void 0 ? (ce.guide = [...Ie], me.guide = [...v.guide], v.guide.length && D.push(Ha(v.guide.length))) : v.guide.length && te.push("the Guide notes (only the DAW sheet keeps a Guide track)"), v.lyrics && he.value ? (o.value = null, r.value = v.lyrics, Dr = !0, D.push("lyrics"), Fn(v.lyric_spans)) : v.lyrics && te.push("the lyrics (this sheet cannot change them here)"), Object.assign(me, ft()), Object.keys(v.settings).length && (c.value = Wc(c.value, v.settings), D.push("settings"));
      const De = `open project (${x})`;
      u.replaceText(v.score, De, null, { before: ce, after: me }) || u.recordSide(De, ce, me), me.guide && Ie !== void 0 && !ws(me.guide, Ie) && n("guideChange", me.guide), lt.value = null, u.notes = [
        `opened ${x}: ${D.join(", ")}${v.title ? ` ("${v.title}")` : ""}`,
        ...te.map((Te) => `not opened: ${Te}`)
      ];
    }
    function Hf() {
      lt.value = null, qn.value?.click();
    }
    async function zf(v) {
      const x = v.target, D = x.files?.[0];
      if (x.value = "", !!D)
        try {
          Bn.value = { data: kk(new Uint8Array(await D.arrayBuffer())), filename: D.name };
        } catch (te) {
          lt.value = Ji(te);
        }
    }
    function Wf(v, x) {
      if (t.readonly || L()) return;
      const D = Bn.value?.filename ?? "file", te = t.guide, ce = te === void 0 ? void 0 : x ? [...v.guide] : [], me = te === void 0 || ce === void 0 ? void 0 : { before: { guide: [...te] }, after: { guide: ce } };
      u.replaceText(v.abc, `import MIDI (${D})`, v.analysis, me), ce !== void 0 && te !== void 0 && !ws(ce, te) && n("guideChange", ce), Bn.value = null, lt.value = null;
    }
    function Lr(v) {
      const x = v;
      return x ? !!x.closest("input, textarea, select, .cm-editor") : !1;
    }
    const Ff = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Br(v) {
      const x = v;
      if (!x) return !1;
      if (x.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const D = x.closest("input");
      return !!D && !Ff.has(D.type);
    }
    function Kf(v) {
      v.key === " " && !Br(v.target) && v.preventDefault();
    }
    function _f(v) {
      const x = v.ctrlKey || v.metaKey;
      if (x && !t.readonly && (v.key === "z" || v.key === "Z" || v.key === "y")) {
        if (Lr(v.target) && !v.target.closest(".cm-editor")) return;
        v.preventDefault(), v.key === "y" || v.key.toLowerCase() === "z" && v.shiftKey ? mt() : ge();
        return;
      }
      const D = x && !Lr(v.target) ? S(v) : null;
      if (D) {
        v.preventDefault(), v.stopPropagation(), M(D);
        return;
      }
      if (v.key === " " && !x && !Br(v.target)) {
        v.preventDefault(), b.value?.toggle();
        return;
      }
      if (Lr(v.target) || x) return;
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
      const te = ie.value, ce = u.primary, me = v.key.toLowerCase();
      if ((me === "g" || me === "h") && !v.altKey && T.value) {
        v.preventDefault(), v.shiftKey ? T.value.zoomRows(me === "h" ? 2 : -2) : T.value.zoomBy(me === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((v.key === "Home" || v.key === "End") && Z.value) {
        v.preventDefault(), m.value = v.key === "Home" ? 0 : Z.value.total;
        return;
      }
      if (!te || !ce) return;
      (() => {
        switch (v.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const De = hm(te, ce.id, v.key === "ArrowRight" ? 1 : -1);
            return De && Pt(De.id, v.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (v.altKey) {
              const et = dm(te, ce.id);
              return et && Pt(et.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const De = u.selection.filter((et) => Si(te, et)?.kind === "note"), Te = [...Gs(u.selection)], at = (v.shiftKey ? 12 : 1) * (v.key === "ArrowUp" ? 1 : -1);
            return Te.length ? Y({ op: "set_note_pitch", ids: [...as(te, u.selection), ...Te], semitones: at }) : De.length && Y({ op: "shift_pitch", ids: De, semitones: at }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || ce.kind !== "note") return !1;
            const De = ll(ce.units, v.key === "]" ? 1 : -1);
            return De && Y({ op: "set_duration", id: ce.id, units: De }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (ce.kind === "note" && Y({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (ce.kind !== "note" && Y({ op: "rest_to_note", id: ce.id }), !0);
          default:
            return !1;
        }
      })() && (v.preventDefault(), v.stopPropagation());
    }
    return (v, x) => (w(), C("div", {
      ref_key: "tabRoot",
      ref: $,
      class: "score-tab",
      onKeydown: _f,
      onKeyup: Kf
    }, [
      i.readonly ? G("", !0) : (w(), En(AS, {
        key: 0,
        view: ie.value,
        selection: E(u).selection,
        primary: E(u).primary,
        busy: E(u).busy,
        "can-undo": E(u).canUndo,
        "can-redo": E(u).canRedo,
        "undo-label": E(u).undoLabel,
        "redo-label": E(u).redoLabel,
        onOperate: Y,
        onUndo: ge,
        onRedo: mt
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", U2, [
        p("span", G2, [
          p("button", {
            role: "radio",
            "aria-checked": d.value === "review",
            class: ze({ active: d.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: x[0] || (x[0] = (D) => h("review"))
          }, " Review ", 10, j2),
          p("button", {
            role: "radio",
            "aria-checked": j.value,
            class: ze({ active: j.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: x[1] || (x[1] = (D) => h("daw"))
          }, " DAW ", 10, q2),
          p("button", {
            role: "radio",
            "aria-checked": d.value === "text",
            class: ze({ active: d.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: x[2] || (x[2] = (D) => h("text"))
          }, " Text ", 10, Y2)
        ]),
        Me.value ? (w(), C(fe, { key: 0 }, [
          p("label", X2, [
            Oe(p("input", {
              "onUpdate:modelValue": x[3] || (x[3] = (D) => c.value.roll = D),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [Nt, c.value.roll]
            ]),
            x[34] || (x[34] = ae(" piano roll ", -1))
          ]),
          p("label", J2, [
            Oe(p("input", {
              "onUpdate:modelValue": x[4] || (x[4] = (D) => c.value.advanced = D),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [Nt, c.value.advanced]
            ]),
            x[35] || (x[35] = ae(" ABC text (advanced) ", -1))
          ])
        ], 64)) : G("", !0),
        p("label", Z2, [
          x[36] || (x[36] = ae(" zoom ", -1)),
          Oe(p("input", {
            "onUpdate:modelValue": x[5] || (x[5] = (D) => c.value.zoom = D),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              dt,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        On(mk),
        p("span", Q2, [
          p("button", {
            disabled: Yn.value || !!Ri.value,
            title: Ri.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Ef
          }, " Export MIDI ", 8, eM),
          p("button", {
            disabled: Yn.value || !!Ri.value,
            title: Ri.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: If
          }, " Export MusicXML ", 8, tM),
          On(h2, {
            paper: Pa.value,
            "onUpdate:paper": x[6] || (x[6] = (D) => Pa.value = D),
            size: Na.value,
            "onUpdate:size": x[7] || (x[7] = (D) => Na.value = D),
            abc: Ra.value ? null : ie.value?.display_abc ?? null,
            title: i.title ?? "",
            blocked: Ra.value,
            onDone: Of,
            onFailed: x[8] || (x[8] = (D) => lt.value = D)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !i.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: Rf
          }, " Save project ", 8, nM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: Hf
          }, " Import MIDI… ", 8, iM),
          p("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: Pf
          }, " Open project… ", 8, sM),
          p("input", {
            ref_key: "midiFile",
            ref: qn,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: zf
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: Va,
            class: "hidden-file",
            type: "file",
            accept: `${E(Bf)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Nf
          }, null, 40, oM)
        ]),
        E(u).pending ? (w(), C("span", rM, "checking…")) : E(u).view?.ok ? (w(), C("span", lM, "✓ valid")) : le.value ? (w(), C("span", aM, "✖ " + I(Ee.value.length) + " error(s)", 1)) : G("", !0),
        i.readonly ? (w(), C("span", uM, "read-only: owned by the other sheet")) : G("", !0)
      ]),
      le.value && !i.readonly ? (w(), C("p", cM, [
        x[37] || (x[37] = ae(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        E(u).canRevert ? (w(), C("button", {
          key: 0,
          onClick: x[9] || (x[9] = (D) => E(u).revertToLastValid())
        }, "Revert to last valid")) : G("", !0),
        Me.value && !c.value.advanced ? (w(), C("button", {
          key: 1,
          onClick: x[10] || (x[10] = (D) => c.value.advanced = !0)
        }, "Show the ABC text")) : G("", !0)
      ])) : E(u).view?.ok && E(u).view.model_error && !i.readonly ? (w(), C("p", hM, " This score is valid for YuE2 but outside the editor's supported subset (" + I(E(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : G("", !0),
      K.value ? (w(), En(bx, {
        key: 3,
        ref_key: "pianoRoll",
        ref: T,
        zoom: re.value,
        "onUpdate:zoom": x[11] || (x[11] = (D) => re.value = D),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": x[12] || (x[12] = (D) => c.value.rowHeight = D),
        follow: c.value.follow,
        "onUpdate:follow": x[13] || (x[13] = (D) => c.value.follow = D),
        track: P.value,
        "onUpdate:track": x[14] || (x[14] = (D) => P.value = D),
        recorded: E(A).recording.value ? { track: P.value, notes: E(A).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": x[15] || (x[15] = (D) => c.value.sung = D),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": x[16] || (x[16] = (D) => c.value.wave = D),
        sound: N.value,
        sung: ds.value,
        height: c.value.rollHeight,
        view: ie.value,
        selection: E(u).selection,
        playing: f.value,
        operate: J,
        readonly: i.readonly,
        stale: le.value,
        busy: E(u).busy,
        locator: Z.value ? m.value : null,
        playhead: y.value,
        clip: E(Qn)?.label ?? null,
        lyrics: ie.value?.lyrics ?? null,
        "lyrics-editable": he.value,
        source: Rt.value ? { envelope: Rt.value.envelope, bars: Ft.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": x[17] || (x[17] = (D) => c.value.audition = D),
        "resize-mode": "rests",
        onSelect: Tr,
        onLocate: x[18] || (x[18] = (D) => m.value = D),
        onClipboard: M,
        "lyric-selection": ct.value,
        "onUpdate:lyricSelection": x[19] || (x[19] = (D) => ct.value = D),
        onLyricEdit: vt,
        onLyricPlace: di,
        onLyricDelete: dn
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : G("", !0),
      K.value && ie.value?.model ? (w(), C("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": E(vp),
        "aria-valuemax": E(gp),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: Ne,
        onKeydown: be
      }, null, 40, dM)) : G("", !0),
      On(YS, {
        ref_key: "transport",
        ref: b,
        voices: mn.value,
        "onUpdate:voices": x[22] || (x[22] = (D) => mn.value = D),
        speed: jn.value,
        "onUpdate:speed": x[23] || (x[23] = (D) => jn.value = D),
        sounds: c.value.sounds,
        metronome: Mt.value,
        "onUpdate:metronome": x[24] || (x[24] = (D) => Mt.value = D),
        view: ie.value,
        bar: Fe.value,
        from: nt.value,
        position: Ge.value,
        reference: Un.value,
        hear: fn.value,
        "onUpdate:hear": x[25] || (x[25] = (D) => fn.value = D),
        "source-level": Gt.value,
        "onUpdate:sourceLevel": x[26] || (x[26] = (D) => Gt.value = D),
        "source-shift": pn.value,
        "onUpdate:sourceShift": x[27] || (x[27] = (D) => pn.value = D),
        "source-beat": Ei.value,
        "timeline-bars": Ft.value,
        guide: ee.value,
        source: Rt.value,
        "source-problem": Gn.value,
        "loop-range": pi.value,
        onCursor: x[28] || (x[28] = (D) => f.value = D),
        onTime: q,
        onStopped: E(A).onStopped
      }, {
        record: Gf(({ countingIn: D }) => [
          On(QC, {
            settings: z.value,
            "onUpdate:settings": x[20] || (x[20] = (te) => z.value = te),
            hub: E(ne),
            recording: E(A).recording.value,
            "counting-in": D,
            step: E(A).step.value,
            target: P.value === "vocal" ? "Vocal" : "Ins",
            disabled: pe.value,
            onRecord: E(A).start,
            onStop: E(A).stop,
            onStep: E(A).toggleStep,
            onRest: E(A).rest,
            onEnable: E(A).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          On(B2, {
            sounds: R.value,
            "onUpdate:sounds": x[21] || (x[21] = (te) => R.value = te),
            fetcher: i.fetcher,
            settings: V.value,
            "keeps-guide": $r.value,
            onApply: O
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: ze(["score-main", { "with-roll": K.value && !!ie.value?.model, "with-inspector": Me.value }]),
        "data-layout": d.value,
        "data-text": Me.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: Ui(ke.value)
      }, [
        p("div", pM, [
          j.value ? (w(), En(oC, {
            key: 0,
            voices: mn.value,
            "onUpdate:voices": x[29] || (x[29] = (D) => mn.value = D),
            view: ie.value,
            "guide-count": Qe.value.length,
            sounds: R.value,
            "onUpdate:sounds": x[30] || (x[30] = (D) => R.value = D),
            "keeps-guide": $r.value,
            readonly: i.readonly,
            onClearGuide: F
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : G("", !0),
          On(Qx, {
            view: ie.value,
            bar: Be.value,
            "error-bars": Se.value,
            "source-starts": He.value,
            readonly: i.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: tn,
            onOperate: Y,
            onNotice: x[31] || (x[31] = (D) => E(u).notes = [D])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          i.lyricsTarget && l.value !== null ? (w(), C("div", mM, [
            x[38] || (x[38] = p("strong", null, "Lyrics", -1)),
            i.lyricsTarget.blocked ? (w(), C("p", gM, I(i.lyricsTarget.blocked), 1)) : (w(), C(fe, { key: 1 }, [
              we.value ? (w(), C("p", vM, [
                ae(" Apply writes the changed lyrics into " + I(i.lyricsTarget.title) + ": " + I(Ce.value) + ". That sheet then asks for approval again. ", 1),
                i.lyricsTarget.replans ? (w(), C(fe, { key: 0 }, [
                  ae(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : G("", !0)
              ])) : (w(), C("p", yM, [
                ae(I(i.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${i.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !i.readonly ? (w(), C(fe, { key: 0 }, [
                  ae("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : G("", !0)
              ])),
              we.value ? (w(), C("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: hs
              }, " Revert the lyrics ")) : G("", !0)
            ], 64))
          ])) : G("", !0),
          Me.value && Wn.value ? (w(), C("details", bM, [
            x[39] || (x[39] = p("summary", null, "Lyrics fit", -1)),
            On(qc, {
              lyrics: Wn.value,
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
          "aria-valuemin": E(bp),
          "aria-valuemax": E(yp),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: ht,
          onKeydown: yt
        }, null, 40, kM),
        p("div", {
          class: ze(["score-views", { split: Me.value && c.value.advanced }])
        }, [
          Me.value ? G("", !0) : (w(), En(kc, {
            key: 0,
            text: i.doc.text,
            diagnostics: Ee.value,
            reveal: g.value,
            readonly: i.readonly,
            onChange: E(u).typed,
            onCursor: Ii
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          On(qk, {
            view: ie.value,
            stale: le.value,
            selection: E(u).selection,
            playing: f.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: x[32] || (x[32] = (D, te) => Pt(D, te))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Me.value && c.value.advanced ? (w(), C("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": E(wp),
            "aria-valuemax": E(kp),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: Le,
            onKeydown: je
          }, null, 40, wM)) : G("", !0),
          Me.value && c.value.advanced ? (w(), En(kc, {
            key: 2,
            text: i.doc.text,
            diagnostics: Ee.value,
            reveal: g.value,
            readonly: i.readonly,
            onChange: E(u).typed,
            onCursor: Ii
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : G("", !0)
        ], 2),
        Me.value ? (w(), En(hk, {
          key: 0,
          view: ie.value,
          selection: E(u).selection,
          operate: J,
          "fallback-bar": E(u).primary?.bar ?? null,
          readonly: i.readonly,
          stale: le.value,
          busy: E(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : G("", !0)
      ], 14, fM),
      p("p", xM, [
        p("span", null, I(E(u).selection.length > 1 ? `${E(u).selection.length} selected · ` : "") + I(E(mm)(E(u).primary, pt.value)), 1),
        (w(!0), C(fe, null, xe(E(u).notes, (D, te) => (w(), C("span", {
          key: te,
          class: "change"
        }, I(D), 1))), 128))
      ]),
      E(u).error ? (w(), C("p", SM, I(E(u).error), 1)) : G("", !0),
      lt.value ? (w(), C("p", CM, I(lt.value), 1)) : G("", !0),
      H.value ? (w(), C("p", MM, I(H.value), 1)) : G("", !0),
      Bn.value ? (w(), En(Uk, {
        key: 8,
        fetcher: i.fetcher,
        data: Bn.value.data,
        filename: Bn.value.filename,
        view: ie.value,
        "keeps-guide": $r.value,
        "current-guide": Qe.value.length,
        onClose: x[33] || (x[33] = (D) => Bn.value = null),
        onInsert: Wf
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : G("", !0),
      Ee.value.length ? (w(), C("ul", AM, [
        (w(!0), C(fe, null, xe(Ee.value, (D, te) => (w(), C("li", {
          key: te,
          "data-severity": D.severity
        }, [
          p("strong", null, I(D.severity), 1),
          D.bar ? (w(), C("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${D.bar}`,
            onClick: (ce) => tn(D.bar)
          }, "bar " + I(D.bar), 9, $M)) : D.line ? (w(), C("span", DM, "line " + I(D.line), 1)) : G("", !0),
          ae(" " + I(D.message), 1)
        ], 8, TM))), 128))
      ])) : G("", !0)
    ], 544));
  }
}), LM = ["aria-label"], BM = ["title"], OM = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, EM = ["aria-selected", "onClick"], IM = ["title", "aria-label", "aria-pressed"], RM = {
  key: 0,
  class: "hint"
}, PM = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, NM = ["disabled", "title"], VM = {
  class: "body",
  role: "tabpanel"
}, HM = { class: "doc-head" }, zM = ["data-state"], WM = ["disabled", "title", "onClick"], FM = ["disabled", "onClick"], KM = ["onClick"], _M = {
  key: 0,
  class: "conflict"
}, UM = ["onClick"], GM = ["onClick"], jM = ["onClick"], qM = ["onUpdate:modelValue", "rows", "aria-label", "onFocus", "onInput"], YM = {
  key: 3,
  class: "tag-helpers"
}, XM = ["title", "onClick"], JM = {
  key: 0,
  class: "facts"
}, ZM = {
  key: 4,
  class: "asr"
}, QM = { key: 0 }, eA = { key: 1 }, tA = { key: 5 }, nA = {
  key: 0,
  class: "diff"
}, iA = { key: 0 }, sA = { key: 1 }, oA = { key: 2 }, rA = { key: 3 }, lA = {
  key: 0,
  class: "doc context wide"
}, aA = { class: "doc-head" }, uA = ["title"], cA = {
  key: 1,
  class: "badge"
}, hA = {
  key: 0,
  class: "hint score-owner"
}, dA = {
  key: 1,
  class: "hint"
}, fA = {
  key: 1,
  class: "doc sections"
}, pA = {
  key: 0,
  class: "doc context"
}, mA = { class: "doc-head" }, gA = {
  class: "findings",
  "aria-label": "Validation"
}, vA = ["data-status"], yA = { key: 0 }, bA = ["title"], kA = { key: 1 }, wA = ["title"], xA = { class: "idea" }, SA = {
  key: 0,
  class: "idea"
}, CA = {
  key: 1,
  class: "idea"
}, MA = { class: "where" }, AA = {
  key: 0,
  class: "kept"
}, TA = {
  key: 1,
  class: "error"
}, $A = {
  key: 2,
  class: "error"
}, DA = {
  key: 3,
  class: "error"
}, LA = {
  key: 4,
  class: "error"
}, BA = ["data-severity"], OA = { class: "where" }, EA = {
  key: 0,
  class: "facts"
}, IA = ["disabled"], RA = ["disabled", "title"], PA = ["disabled", "title"], NA = ["aria-valuenow", "title"], VA = /* @__PURE__ */ Dt({
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = B(() => t.payload?.style_label === "caption"), u = B(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (L) => L === "style" && a.value ? "Caption" : o[L], d = (L) => L === "style" && a.value ? 14 : l[L], h = ks(Ka(t.state, t.payload, t.owned)), f = W(t.payload), m = W(null), y = W(!1), g = W(!1), b = W(null), T = B(() => {
      const L = h.find((J) => J.kind === "score"), Y = b.value;
      return L && L.intent !== "auto" && Y?.reason && Y.text === L.text ? Y.reason : null;
    }), $ = W(null), P = W(0);
    let R;
    const V = B(() => t.payload?.context?.score ?? null), O = ks({ kind: "score", text: V.value ?? "", intent: "keep" }), _ = B(
      () => !h.some((L) => L.kind === "score") && !!V.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), N = W(null), ne = B(() => {
      const L = N.value;
      return _.value && L?.reason && L.text === O.text ? L.reason : null;
    }), z = B(
      () => _.value && V.value && jt(O.text) !== jt(V.value) ? O.text : null
    );
    function A() {
      if (!z.value) return;
      const L = h.find((Y) => Y.kind === "lyrics");
      L && L.intent !== "auto" && (L.intent = "manual");
    }
    const H = B(() => {
      const L = new Set(h.map((Y) => s[Y.kind]));
      for (const Y of Object.keys(t.payload?.context ?? {}))
        Y in s && L.add(s[Y]);
      return ["score", "lyrics", "style", "details"].filter((Y) => L.has(Y));
    }), pe = h[0] ? s[h[0].kind] : "lyrics", ve = W(pe), ie = (L) => t.payload?.docs[L] ?? null, le = (L) => ie(L)?.upstream ?? null, Ee = (L) => ie(L)?.status === "conflict", Se = (L) => h.filter((Y) => s[Y.kind] === L), Be = B(() => h.find((L) => L.kind === "score") ?? null), Me = B(() => Be.value?.text ?? V.value ?? null), j = B(
      () => h.find((L) => L.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), Qe = B(
      () => h.find((L) => L.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), ue = B(() => Lp(t.payload?.timeline)), Ae = B(() => {
      const L = t.asrNote ?? $.value;
      return L && L.draft_sha256 === ie("lyrics")?.upstream_sha256 ? L : null;
    }), ee = (L) => tm(le(L.kind) ?? "", L.text);
    function K(L) {
      if (L.intent === "auto") return "auto";
      if (L.intent === "manual") return "manual";
      if (L.intent === "rebase") return "edited (merged)";
      if (Ee(L.kind)) return "conflict";
      const Y = t.state.docs[L.kind]?.state ?? "auto", J = jt(le(L.kind) ?? "");
      return Y === "auto" && jt(L.text) !== J ? J || !t.payload ? "edited" : "manual" : Y;
    }
    function Z(L) {
      L.intent = "auto";
      const Y = le(L.kind);
      Y !== null && (L.text = Y);
    }
    function Fe(L) {
      return le(L.kind) !== null || K(L) !== "auto";
    }
    function nt(L) {
      L.intent = "manual";
    }
    const Ge = /* @__PURE__ */ new Map(), xt = /* @__PURE__ */ new Set();
    function Q(L, Y) {
      Y instanceof HTMLTextAreaElement ? Ge.set(L, Y) : Ge.delete(L);
    }
    function U(L, Y) {
      const J = Ge.get(L.kind), ge = J && xt.has(L.kind) ? J.selectionStart : L.text.length, mt = em(L.text, Y, ge);
      L.text = mt.text, Ce(L), Sn(() => {
        J?.isConnected && (J.focus(), J.setSelectionRange(mt.caret, mt.caret));
      });
    }
    function he(L) {
      L.intent = "manual";
    }
    function we(L) {
      L.intent = "rebase";
    }
    function Ce(L) {
      L.intent === "auto" && (L.intent = "keep");
    }
    function Wn() {
      Ka(t.state, t.payload, t.owned).forEach((Y, J) => Object.assign(h[J], Y)), St.value = [...t.guide ?? []], ct.value = [...t.lyricSpans ?? []], Wt.value = t.sourceShift ?? 0, O.text = V.value ?? "", P.value++;
    }
    const ft = B(
      () => h.filter((L) => Ee(L.kind) && L.intent === "keep").map((L) => L.kind)
    ), It = B(() => Ip(t.state, t.payload, h)), St = W([...t.guide ?? []]);
    function Fn(L) {
      St.value = L;
    }
    const ct = W([...t.lyricSpans ?? []]);
    function Oi(L) {
      ct.value = L;
    }
    const Wt = W(t.sourceShift ?? 0);
    function Kn(L) {
      Wt.value = L;
    }
    function Dn() {
      return { lyricSpans: ct.value, sourceShift: Wt.value };
    }
    const Ut = W(null), Ct = B(() => h.find((L) => L.kind === "lyrics") ?? null), di = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, dn = B(() => Ct.value ? di : t.lyricsTarget ?? null), en = B(() => {
      const L = t.payload?.context?.lyrics, Y = Ut.value;
      return Ct.value || !dn.value || dn.value.blocked || !Y || !L ? null : jt(Y) !== jt(L) ? Y : null;
    });
    function _n(L) {
      const Y = Ct.value;
      Y ? L !== null && jt(L) !== jt(Y.text) && (Y.text = L, Ce(Y)) : Ut.value = L;
    }
    function fi() {
      if (!en.value || !dn.value?.replans) return;
      const L = h.find((Y) => Y.kind === "score");
      L && L.intent === "keep" && (L.intent = "manual");
    }
    const Ln = B(
      () => Ga(It.value) !== Ga(t.state) || !ws(St.value, t.guide ?? []) || !Do(ct.value, t.lyricSpans ?? []) || Wt.value !== (t.sourceShift ?? 0) || en.value !== null || z.value !== null
    ), vt = B(() => {
      const L = t.payload?.arrangement;
      return L && L.status !== "skipped" ? L : null;
    }), hs = B(() => Bp(vt.value?.notes ?? [])), Mt = B(() => (f.value?.findings ?? []).filter((L) => L.severity !== "info")), Un = B(() => (f.value?.findings ?? []).filter((L) => L.severity === "info")), Rt = B(() => Mt.value.some((L) => L.severity === "error")), Gn = B(
      () => !y.value && !Rt.value && !ft.value.length && !T.value && !ne.value && !!f.value?.fingerprint
    ), fn = B(
      () => ft.value.length ? "Resolve the conflicts first." : T.value ?? ne.value
    ), Gt = B(() => ft.value.length ? "⇄ conflict" : Rt.value ? "✖ errors" : Mt.value.length ? "⚠ warnings" : f.value?.waiting && !Ln.value ? "⏸ waiting for approval" : f.value ? "✓ valid" : "not run yet");
    async function pi() {
      if (t.payload) {
        y.value = !0, m.value = null;
        try {
          f.value = await Op(t.fetcher, {
            sheet_state: It.value,
            upstream: Ep(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: z.value ? { ...t.payload.context, score: z.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null
          });
        } catch (L) {
          m.value = L instanceof Uc ? `${L.message}${L.hint ? ` — ${L.hint}` : ""}` : String(L);
        } finally {
          y.value = !1;
        }
      }
    }
    Re(
      () => [...h.map((L) => L.text + L.intent), z.value ?? ""].join("\0"),
      () => {
        clearTimeout(R), R = setTimeout(pi, 300);
      }
    );
    function Ft(L) {
      return z.value ? { text: z.value, approved: L } : null;
    }
    function Ei() {
      fn.value || (fi(), A(), n(
        "apply",
        ja(It.value, t.state.review?.approved_fingerprint ?? null),
        St.value,
        en.value,
        Ft(!1),
        !1,
        Dn()
      ));
    }
    async function ds() {
      fi(), A(), await pi(), Gn.value && n(
        "apply",
        ja(It.value, f.value?.fingerprint ?? null),
        St.value,
        en.value,
        Ft(!0),
        !0,
        Dn()
      );
    }
    function pn() {
      Ln.value ? g.value = !0 : n("close");
    }
    const He = ks($p()), pt = ks({ width: window.innerWidth, height: window.innerHeight }), mn = B(() => {
      const L = He.maximized ? pt.height - 2 * qa : He.height;
      return He.maximized ? {
        width: `${pt.width - 2 * qa}px`,
        height: `${L}px`,
        "--plenio-dialog-h": `${L}px`
      } : { width: `${He.width}px`, height: `${He.height}px`, "--plenio-dialog-h": `${L}px` };
    });
    function jn() {
      pt.width = window.innerWidth, pt.height = window.innerHeight;
      const L = Ya({ width: He.width, height: He.height }, pt);
      (L.width !== He.width || L.height !== He.height) && (He.width = L.width, He.height = L.height, Ir(He));
    }
    function Pt() {
      He.maximized = !He.maximized, Ir(He);
    }
    function Ii(L) {
      L.preventDefault(), L.stopPropagation();
      const Y = { width: He.width, height: He.height };
      $o(
        L,
        ({ dx: J, dy: ge }) => {
          const mt = Ya(
            { width: Y.width + J, height: Y.height + ge },
            { width: window.innerWidth, height: window.innerHeight }
          );
          He.width = mt.width, He.height = mt.height;
        },
        () => Ir(He)
      );
    }
    function tn(L) {
      L.key === "Escape" && !L.defaultPrevented && (L.preventDefault(), g.value ? g.value = !1 : pn());
    }
    return qs(() => {
      window.addEventListener("keydown", tn), window.addEventListener("resize", jn), t.payload && pi();
      const L = ie("lyrics")?.upstream_sha256;
      !t.asrNote && L && Dp(t.fetcher, L).then((Y) => $.value = Y).catch(() => {
      });
    }), Hn(() => {
      window.removeEventListener("keydown", tn), window.removeEventListener("resize", jn), clearTimeout(R);
    }), (L, Y) => (w(), C("div", {
      class: "plenio-overlay",
      onMousedown: Ue(pn, ["self"])
    }, [
      p("div", {
        class: ze(["plenio-dialog", { maximized: He.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": i.title,
        style: Ui(mn.value)
      }, [
        p("header", {
          onDblclick: Ue(Pt, ["self"])
        }, [
          p("h2", null, I(i.title), 1),
          p("span", {
            class: ze(["status", { bad: Rt.value || ft.value.length }]),
            title: f.value?.status ?? ""
          }, I(Gt.value), 11, BM),
          p("div", OM, [
            (w(!0), C(fe, null, xe(H.value, (J) => (w(), C("button", {
              key: J,
              role: "tab",
              "aria-selected": ve.value === J,
              class: ze({ active: ve.value === J }),
              onClick: (ge) => ve.value = J
            }, I(c(J)), 11, EM))), 128))
          ]),
          p("button", {
            class: "icon",
            title: He.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": He.maximized ? "Restore" : "Maximize",
            "aria-pressed": He.maximized,
            onClick: Pt
          }, I(He.maximized ? "❐" : "⛶"), 9, IM),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: pn
          }, "×")
        ], 32),
        i.payload ? G("", !0) : (w(), C("p", RM, [...Y[4] || (Y[4] = [
          ae(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          ae("; ", -1),
          p("em", null, "Back to auto", -1),
          ae(" hands a document back to the workflow. ", -1)
        ])])),
        g.value ? (w(), C("div", PM, [
          Y[5] || (Y[5] = ae(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!fn.value,
            title: fn.value ?? "Save your documents into the node",
            onClick: Ei
          }, " Apply ", 8, NM),
          p("button", {
            onClick: Y[0] || (Y[0] = (J) => n("close"))
          }, "Discard"),
          p("button", {
            onClick: Y[1] || (Y[1] = (J) => g.value = !1)
          }, "Keep editing")
        ])) : G("", !0),
        p("div", VM, [
          (w(!0), C(fe, null, xe(Se(ve.value), (J) => (w(), C("section", {
            key: J.kind + P.value,
            class: ze(["doc", { wide: J.kind === "score" }])
          }, [
            p("div", HM, [
              p("h3", null, I(u.value[J.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": K(J)
              }, I(K(J)), 9, zM),
              Y[6] || (Y[6] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: !Fe(J),
                title: le(J.kind) !== null ? "Discard your edit and use the draft" : "Discard your text: the next run computes this document again (the writer, the plan or the transcription) and uses it",
                onClick: (ge) => Z(J)
              }, I(le(J.kind) !== null ? "Use draft" : "Back to auto"), 9, WM),
              J.kind === "lyrics" ? (w(), C("button", {
                key: 0,
                disabled: J.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (ge) => nt(J)
              }, " Use my own lyrics ", 8, FM)) : (w(), C("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (ge) => nt(J)
              }, " Make manual ", 8, KM))
            ]),
            Ee(J.kind) && J.intent === "keep" ? (w(), C("div", _M, [
              ae(" The draft changed after you edited this document (" + I(ie(J.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (ge) => he(J)
              }, "Keep my edit (manual)", 8, UM),
              p("button", {
                onClick: (ge) => Z(J)
              }, "Use the new draft", 8, GM),
              p("button", {
                onClick: (ge) => we(J)
              }, "Merge by hand", 8, jM)
            ])) : G("", !0),
            J.kind === "score" ? (w(), En(_c, {
              key: 1,
              doc: J,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !1,
              "layout-default": i.layout ?? null,
              lyrics: j.value,
              title: Qe.value,
              guide: St.value,
              "lyric-spans": ct.value,
              "source-shift": Wt.value,
              "lyrics-target": dn.value,
              "lyrics-pending": Ct.value ? null : Ut.value,
              onEdited: (ge) => Ce(J),
              onGuideChange: Fn,
              onLyricSpansChange: Oi,
              onSourceShiftChange: Kn,
              onLyricsChange: _n,
              onGate: Y[2] || (Y[2] = (ge, mt) => b.value = { text: ge, reason: mt })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : Oe((w(), C("textarea", {
              key: 2,
              ref_for: !0,
              ref: (ge) => Q(J.kind, ge),
              "onUpdate:modelValue": (ge) => J.text = ge,
              rows: d(J.kind),
              spellcheck: "false",
              "aria-label": u.value[J.kind],
              onFocus: (ge) => E(xt).add(J.kind),
              onInput: (ge) => Ce(J)
            }, null, 40, qM)), [
              [dt, J.text]
            ]),
            J.kind === "lyrics" ? (w(), C("p", YM, [
              Y[7] || (Y[7] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (w(!0), C(fe, null, xe(E(Qp), (ge) => (w(), C("button", {
                key: ge,
                title: ge === "Instrumental" ? "Insert [Instrumental] at the cursor: a section without words (an interlude)" : `Insert [${ge}] at the cursor`,
                onClick: (mt) => U(J, ge)
              }, " [" + I(ge) + "] ", 9, XM))), 128)),
              J.intent === "manual" ? (w(), C("span", JM, "the writer is not consulted - these are your lyrics")) : G("", !0)
            ])) : G("", !0),
            J.kind === "lyrics" && Ae.value ? (w(), C("p", ZM, [
              p("span", null, "Transcribed (" + I(Ae.value.language) + ").", 1),
              Ae.value.low_confidence.length ? (w(), C("span", QM, [
                Y[8] || (Y[8] = ae(" Check these unsure words: ", -1)),
                (w(!0), C(fe, null, xe(Ae.value.low_confidence, (ge, mt) => (w(), C("mark", {
                  key: "low-" + mt
                }, I(ge), 1))), 128))
              ])) : G("", !0),
              Ae.value.left_out.length ? (w(), C("span", eA, [
                Y[9] || (Y[9] = ae("Left out as not sung: ", -1)),
                p("s", null, I(Ae.value.left_out.join(" ")), 1)
              ])) : G("", !0)
            ])) : G("", !0),
            le(J.kind) !== null && E(jt)(le(J.kind) ?? "") !== E(jt)(J.text) ? (w(), C("details", tA, [
              p("summary", null, "Changes against the draft (" + I(E(nm)(ee(J))) + " words)", 1),
              J.kind !== "score" ? (w(), C("p", nA, [
                (w(!0), C(fe, null, xe(ee(J), (ge, mt) => (w(), C(fe, { key: mt }, [
                  ge.text === E(Rs) ? (w(), C("br", iA)) : ge.op === "added" ? (w(), C("ins", sA, I(ge.text + " "), 1)) : ge.op === "removed" ? (w(), C("del", oA, I(ge.text + " "), 1)) : (w(), C("span", rA, I(ge.text + " "), 1))
                ], 64))), 128))
              ])) : G("", !0),
              p("pre", null, I(le(J.kind)), 1)
            ])) : G("", !0),
            J.kind === "lyrics" ? (w(), En(qc, {
              key: 6,
              lyrics: J.text,
              abc: Me.value,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : G("", !0)
          ], 2))), 128)),
          ve.value === "score" && !Be.value && V.value ? (w(), C("section", lA, [
            p("div", aA, [
              Y[10] || (Y[10] = p("h3", null, "Score (ABC)", -1)),
              _.value ? (w(), C("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${i.scoreTarget?.title}`
              }, " from " + I(i.scoreTarget?.title) + I(z.value ? " · changed" : ""), 9, uA)) : (w(), C("span", cA, "from the other sheet (read-only)"))
            ]),
            _.value ? (w(), C("p", hA, [
              Y[11] || (Y[11] = ae(" Changes to the score go into ", -1)),
              p("strong", null, I(i.scoreTarget?.title), 1),
              Y[12] || (Y[12] = ae(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              Y[13] || (Y[13] = p("strong", null, "Approve", -1)),
              Y[14] || (Y[14] = ae(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : i.scoreTarget?.blocked ? (w(), C("p", dA, I(i.scoreTarget.blocked), 1)) : G("", !0),
            On(_c, {
              doc: O,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !_.value,
              "layout-default": i.layout ?? null,
              lyrics: j.value,
              "lyrics-target": Ct.value ? dn.value : null,
              "lyric-spans": ct.value,
              "source-shift": Wt.value,
              onLyricSpansChange: Oi,
              onSourceShiftChange: Kn,
              onLyricsChange: _n,
              onGate: Y[3] || (Y[3] = (J, ge) => N.value = { text: J, reason: ge })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : G("", !0),
          ve.value === "lyrics" && ue.value.length ? (w(), C("section", fA, [
            Y[16] || (Y[16] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              Y[15] || (Y[15] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), C(fe, null, xe(ue.value, (J, ge) => (w(), C("tr", { key: ge }, [
                  p("td", null, I(J.label), 1),
                  p("td", null, I(J.bars), 1),
                  p("td", null, I(J.start), 1),
                  p("td", null, I(J.end), 1)
                ]))), 128))
              ])
            ])
          ])) : G("", !0),
          (w(!0), C(fe, null, xe(i.payload?.context ?? {}, (J, ge) => (w(), C(fe, {
            key: "context-" + ge
          }, [
            ge !== "score" && s[ge] === ve.value ? (w(), C("section", pA, [
              p("div", mA, [
                p("h3", null, I(u.value[ge] ?? ge), 1),
                Y[17] || (Y[17] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, I(J), 1)
            ])) : G("", !0)
          ], 64))), 128))
        ]),
        p("section", gA, [
          vt.value ? (w(), C("div", {
            key: 0,
            class: "arrangement",
            "data-status": vt.value.status
          }, [
            vt.value.status === "fallback" ? (w(), C("p", yA, [
              Y[18] || (Y[18] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: E(Er)
              }, "experimental", 8, bA),
              ae(" - " + I(E(_a)(vt.value)) + ": " + I(vt.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (w(), C("details", kA, [
              p("summary", null, [
                Y[19] || (Y[19] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: E(Er)
                }, "experimental", 8, wA),
                ae(" " + I(E(_a)(vt.value)) + ": " + I(vt.value.summary), 1)
              ]),
              p("p", xA, I(E(Er)), 1),
              E(Ua)(vt.value) ? (w(), C("p", SA, I(E(Ua)(vt.value)), 1)) : G("", !0),
              vt.value.idea ? (w(), C("p", CA, I(vt.value.idea), 1)) : G("", !0),
              p("ul", null, [
                (w(!0), C(fe, null, xe(vt.value.sections ?? [], (J) => (w(), C("li", {
                  key: J.index
                }, [
                  p("strong", null, I(J.index) + " " + I(J.label), 1),
                  p("span", MA, "bars " + I(J.bars), 1),
                  ae(" " + I(J.applied.length ? J.applied.join("; ") : "unchanged") + " ", 1),
                  J.kept.length ? (w(), C("span", AA, " - kept: " + I(J.kept.join("; ")), 1)) : G("", !0)
                ]))), 128)),
                (w(!0), C(fe, null, xe(hs.value, (J, ge) => (w(), C("li", {
                  key: "note" + ge,
                  "data-severity": "info"
                }, I(J), 1))), 128))
              ])
            ]))
          ], 8, vA)) : G("", !0),
          m.value ? (w(), C("p", TA, I(m.value), 1)) : G("", !0),
          ft.value.length ? (w(), C("p", $A, " Resolve the conflict in: " + I(ft.value.join(", ")) + ". ", 1)) : G("", !0),
          T.value ? (w(), C("p", DA, "Score: " + I(T.value), 1)) : ne.value ? (w(), C("p", LA, "Score: " + I(ne.value), 1)) : G("", !0),
          p("ul", null, [
            (w(!0), C(fe, null, xe(Mt.value, (J, ge) => (w(), C("li", {
              key: ge,
              "data-severity": J.severity
            }, [
              p("strong", null, I(J.severity), 1),
              Y[20] || (Y[20] = ae()),
              p("span", OA, I(J.where), 1),
              ae(" " + I(J.message), 1)
            ], 8, BA))), 128)),
            (w(!0), C(fe, null, xe(Un.value, (J, ge) => (w(), C("li", {
              key: "i" + ge,
              "data-severity": "info"
            }, I(J.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          i.owned.includes("score") && f.value ? (w(), C("span", EA, " render: " + I(f.value.planning_mode) + ", ceiling " + I(Math.round(f.value.score_seconds)) + " s ", 1)) : G("", !0),
          Y[21] || (Y[21] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Ln.value,
            title: "Discard every change made in this editor",
            onClick: Wn
          }, "Revert", 8, IA),
          p("button", { onClick: pn }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!fn.value,
            title: fn.value ?? "Save your documents into the node",
            onClick: Ei
          }, " Apply ", 8, RA),
          i.review === "stop for review" ? (w(), C("button", {
            key: 1,
            class: "primary",
            disabled: !Gn.value,
            title: T.value ?? "Release exactly these documents for the next run",
            onClick: ds
          }, " Approve ", 8, PA)) : G("", !0)
        ]),
        He.maximized ? G("", !0) : (w(), C("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": He.width,
          title: `Resize (${He.width} × ${He.height})`,
          onPointerdown: Ii
        }, null, 40, NA))
      ], 14, LM)
    ], 32));
  }
});
function HA() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const i = document.createElement("style");
  i.id = "plenio-dialog-styles", i.textContent = qf, document.head.append(i);
}
function jA(i) {
  HA();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    n.unmount(), e.remove();
  }, n = jf(VA, {
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
  jA as openSheetDialog
};
