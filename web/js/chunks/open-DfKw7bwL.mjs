import { d as wt, m as Oe, a as Yn, i as C, c as A, b as f, t as R, F as ce, r as ye, n as Ee, j as oe, e as G, g as z, h as O, o as hs, u as D, w as $e, v as lt, p as et, f as Ke, q as Et, s as Xn, x as Is, y as di, z as Qt, A as tt, B as os, C as fo, D as Pt, E as vp, G as Kn, H as _n, I as yp, k as bp, l as kp } from "./dialog-Nn1YgW7k.mjs";
import { a as wp, s as ds, b as fs, n as mh, u as da, P as vh, c as xp, t as Sp, d as Cp, T as Ho, e as Ap, f as js, g as Mp, y as tu, h as Tp, x as Ge, j as Ms, K as Li, k as $p, H as oi, L as Yi, S as po, m as Ts, o as Xi, q as Lp, r as nu, w as Dp, z as Bp, A as Op, B as Ep, C as Ip, D as Rp, E as es, F as Pp, G as Np, I as Vp, J as iu, M as Fn, N as go, O as Hp, Q as Wp, R as su, U as zp, V as Fp, W as ou, X as _p, Y as Kp, Z as ru, _ as Up, $ as Gp, a0 as jp, a1 as qp, a2 as Yp, a3 as Xp, a4 as Jp, a5 as lu, a6 as Zp, a7 as Qp, a8 as eg, a9 as tg, aa as ng, ab as ig, ac as sg, ad as au, ae as og, af as rg, ag as yh, ah as Jo, ai as lg, aj as ag, ak as ug, al as cg, am as hg, an as fa, ao as dg, ap as fg, aq as pg, ar as gg, as as mg, at as vg, au as yg, av as Jt, aw as uu, ax as bg, ay as mo, v as kg, az as Wo, aA as cu, aB as wg, aC as hu, aD as xg, aE as Sg, aF as Cg, aG as zo, aH as Ag, aI as du, aJ as Mg, aK as Tg, aL as fu, aM as $g, aN as Lg, aO as Dg, aP as Bg, aQ as Og, aR as Eg, aS as Ig, aT as Rg, aU as Pg, aV as pu, aW as Ng, aX as Vg, aY as Hg, aZ as Fr, a_ as gu, a$ as mu, b0 as Wg, b1 as vu, b2 as zg, b3 as Fg, b4 as _g, b5 as yu, b6 as bu, b7 as ku, b8 as _r, b9 as Kg, ba as Ug } from "./main-CY5cIrX5.mjs";
import { a as Gg, r as jg, n as qg, e as Kr, b as Yg, s as Xg, p as Jg } from "./notationExport-DkCMgjck.mjs";
import { SHIFTABLE as Kt, shiftBlock as Rs, notesLabel as Zg, trackRows as Qg, parseGuide as em, sameGuide as Ps, guideNotes as tm, remapGuide as nm } from "./tracks-ClAVjvds.mjs";
import { parseBarSources as im, remapBars as sm, keepBars as om, followContent as rm, validBars as lm } from "./barSources-Cq3VGvmq.mjs";
const wu = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Interlude", "Instrumental", "Outro"], am = ["Post-Chorus", "Hook", "Refrain", "Solo", "Break", "Breakdown", "Drop", "Build"], um = /* @__PURE__ */ new Set(["intro", "interlude", "instrumental", "solo", "break", "outro"]), vl = 30, bh = 40;
function kh(i) {
  return i.replace(/[[\]\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, bh).trim() || null;
}
function cm(i, e = []) {
  if (!Array.isArray(i)) return [];
  const t = new Set(e.map((s) => s.toLowerCase())), n = [];
  for (const s of i) {
    const o = typeof s == "string" ? kh(s) : null;
    if (!(!o || t.has(o.toLowerCase())) && (t.add(o.toLowerCase()), n.push(o), n.length === vl))
      break;
  }
  return n;
}
function Ur(i, e) {
  const t = um.has(i.toLowerCase());
  return e ? `Insert [${i}] at the cursor - a section YuE2 learned (${t ? "usually without words - an instrumental part" : "sung: its words beneath it"})` : `Insert [${i}] at the cursor - ${t ? "without words: an instrumental part" : "with words it is sung on a related section's melody, without words it is an instrumental part"}`;
}
function hm(i, e, t = i.length) {
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
const qs = `
`;
function xu(i) {
  const e = [];
  return i.replace(/\r\n?/g, `
`).split(`
`).forEach((t, n) => {
    n > 0 && e.push(qs), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function dm(i, e) {
  const t = xu(i), n = xu(e), s = t.length + 1, o = n.length + 1, r = new Array(s * o).fill(0);
  for (let d = t.length - 1; d >= 0; d--)
    for (let h = n.length - 1; h >= 0; h--)
      r[d * o + h] = t[d] === n[h] ? r[(d + 1) * o + h + 1] + 1 : Math.max(r[(d + 1) * o + h], r[d * o + h + 1]);
  const l = [], a = (d, h) => {
    const p = l[l.length - 1];
    p && p.op === d && h !== qs && !p.text.endsWith(qs) ? p.text += ` ${h}` : l.push({ op: d, text: h });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < n.length; )
    u < t.length && c < n.length && t[u] === n[c] ? (a("same", t[u]), u++, c++) : c < n.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", n[c++]) : a("removed", t[u++]);
  return l;
}
function fm(i) {
  return i.filter((e) => e.op !== "same" && e.text !== qs).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const pm = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, gm = {
  key: 0,
  class: "error"
}, mm = { key: 1 }, vm = {
  key: 0,
  class: "bad"
}, wh = /* @__PURE__ */ wt({
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
        const u = await wp(e.fetcher, {
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
    Oe(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), Yn(() => clearTimeout(s));
    const l = O(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", d = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: d };
      })
    );
    return (a, u) => i.abc ? (C(), A("section", pm, [
      u[1] || (u[1] = f("h4", null, "Lyrics and the score's sections", -1)),
      n.value ? (C(), A("p", gm, R(n.value), 1)) : l.value.length ? (C(), A("table", mm, [
        u[0] || (u[0] = f("thead", null, [
          f("tr", null, [
            f("th", null, "Lyrics"),
            f("th", null, "Score section"),
            f("th", null, "Lines"),
            f("th", null, "Syllables"),
            f("th", null, "Vocal notes"),
            f("th", null, "Fit")
          ])
        ], -1)),
        f("tbody", null, [
          (C(!0), A(ce, null, ye(l.value, (c, d) => (C(), A("tr", {
            key: d,
            class: Ee({ mismatch: c.mismatch })
          }, [
            f("td", null, "[" + R(c.tag) + "]", 1),
            f("td", null, [
              oe(R(c.score_section ?? "—"), 1),
              c.mismatch ? (C(), A("span", vm, " ≠")) : G("", !0)
            ]),
            f("td", null, R(c.lines), 1),
            f("td", null, R(c.syllables), 1),
            f("td", null, R(c.vocal_notes ?? "—"), 1),
            f("td", {
              class: Ee({ bad: c.fit && c.fit !== "fits" })
            }, R(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : G("", !0),
      u[2] || (u[2] = f("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : G("", !0);
  }
});
function ym(i) {
  const e = new Set((i.elements ?? []).map((n) => n.id)), t = i.model?.tracks;
  if (t) for (const n of [...t.vocal, ...t.ins, ...t.chords]) e.add(n.id);
  return e;
}
function bm(i, e) {
  const t = i?.model?.tracks, n = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = n.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
function km(i, e) {
  const t = i?.model?.tracks;
  return t ? [...t.vocal, ...t.ins].find((n) => n.segments.includes(e)) ?? null : null;
}
const Zo = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function wm(i, e) {
  const t = Zo.indexOf(i);
  return t < 0 ? null : Zo[t + e] ?? null;
}
function xm(i, e) {
  return (e < 0 ? [...Zo].reverse().find((n) => n < i) : Zo.find((n) => n > i)) ?? null;
}
function yl(i, e, t) {
  if (!e || e.kind !== "note") return null;
  const n = km(i, e.id);
  if (n && n.segments.length > 1) {
    const o = xm(n.duration, t);
    return o ? { op: "resize_note", id: n.id, duration: o, mode: "rests" } : null;
  }
  const s = wm(e.units, t);
  return s ? { op: "set_duration", id: e.id, units: s } : null;
}
function Sm(i, e, t) {
  const n = i.elements ?? [], s = n.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of n) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function Cm(i, e) {
  const t = i.elements ?? [];
  return t.find((n) => n.source[0] <= e && e < n.source[1]) ?? t.find((n) => n.source[1] === e) ?? null;
}
function Pi(i, e) {
  return !i || !e ? null : (i.elements ?? []).find((t) => t.id === e) ?? null;
}
function Am(i, e, t) {
  const n = Pi(i, e);
  if (!n) return null;
  const s = (i.elements ?? []).filter((r) => r.voice === n.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function Mm(i, e) {
  const t = Pi(i, e);
  if (!t) return null;
  const n = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (i.elements ?? []).find(
    (s) => s.voice === n && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function Tm(i, e, t = "Vocal") {
  return (i.elements ?? []).find((n) => n.bar === e && n.voice === t) ?? null;
}
function bl(i, e) {
  const t = i.sections.findIndex((n) => n.start_bar <= e && e < n.start_bar + n.bars);
  return t < 0 ? 0 : t;
}
const $m = {
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
function Lm(i, e = "1/16") {
  if (!i) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), n = $m[i.units * t] ?? `${i.units} units`, s = i.kind === "note" ? `${i.name}${i.tie_out ? " (tied)" : ""}` : "rest", o = i.chord ? `, chord ${i.chord}` : "";
  return `${i.voice} bar ${i.bar}: ${s}, ${i.kind === "bar_rest" ? "whole bar" : n}${o}`;
}
function Fo(i) {
  const e = Math.max(0, i), t = Math.floor(e / 60), n = Math.floor(e - t * 60);
  return `${t}:${String(n).padStart(2, "0")}`;
}
let kl = [], xh = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? xh : kl).push(t = t + i[e]);
})();
function Dm(i) {
  if (i < 768) return !1;
  for (let e = 0, t = kl.length; ; ) {
    let n = e + t >> 1;
    if (i < kl[n]) t = n;
    else if (i >= xh[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function Su(i) {
  return i >= 127462 && i <= 127487;
}
const Cu = 8205;
function Bm(i, e, t = !0, n = !0) {
  return (t ? Sh : Om)(i, e, n);
}
function Sh(i, e, t) {
  if (e == i.length) return e;
  e && Ch(i.charCodeAt(e)) && Ah(i.charCodeAt(e - 1)) && e--;
  let n = Gr(i, e);
  for (e += Au(n); e < i.length; ) {
    let s = Gr(i, e);
    if (n == Cu || s == Cu || t && Dm(s))
      e += Au(s), n = s;
    else if (Su(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && Su(Gr(i, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Om(i, e, t) {
  for (; e > 1; ) {
    let n = Sh(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Gr(i, e) {
  let t = i.charCodeAt(e);
  if (!Ah(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return Ch(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Ch(i) {
  return i >= 56320 && i < 57344;
}
function Ah(i) {
  return i >= 55296 && i < 56320;
}
function Au(i) {
  return i < 65536 ? 1 : 2;
}
class ze {
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
    [e, t] = ps(this, e, t);
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
    [e, t] = ps(this, e, t);
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
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Hs(this), o = new Hs(e);
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
    return new Hs(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Mh(this, e, t);
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
    return new Th(n);
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
    return e.length == 1 && !e[0] ? ze.empty : e.length <= 32 ? new ot(e) : Tn.from(ot.split(e, []));
  }
}
class ot extends ze {
  constructor(e, t = Em(e)) {
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
        return new Im(s, l, n, r);
      s = l + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let o = e <= 0 && t >= this.length ? this : new ot(Mu(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = n.pop(), l = _o(o.text, r.text.slice(), 0, o.length);
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
    [e, t] = ps(this, e, t);
    let s = _o(this.text, _o(n.text, Mu(this.text, 0, e)), t), o = this.length + n.length - (t - e);
    return s.length <= 32 ? new ot(s, o) : Tn.from(ot.split(s, []), o);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = ps(this, e, t);
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
class Tn extends ze {
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
    if ([e, t] = ps(this, e, t), n.lines < this.lines)
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
    [e, t] = ps(this, e, t);
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
    for (let p of e)
      n += p.lines;
    if (n < 32) {
      let p = [];
      for (let g of e)
        g.flatten(p);
      return new ot(p, t);
    }
    let s = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function d(p) {
      let g;
      if (p.lines > o && p instanceof Tn)
        for (let b of p.children)
          d(b);
      else p.lines > r && (a > r || !a) ? (h(), l.push(p)) : p instanceof ot && a && (g = c[c.length - 1]) instanceof ot && p.lines + g.lines <= 32 ? (a += p.lines, u += p.length + 1, c[c.length - 1] = new ot(g.text.concat(p.text), g.length + 1 + p.length)) : (a + p.lines > s && h(), a += p.lines, u += p.length + 1, c.push(p));
    }
    function h() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Tn.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let p of e)
      d(p);
    return h(), l.length == 1 ? l[0] : new Tn(l, t);
  }
}
ze.empty = /* @__PURE__ */ new ot([""], 0);
function Em(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function _o(i, e, t = 0, n = 1e9) {
  for (let s = 0, o = 0, r = !0; o < i.length && s <= n; o++) {
    let l = i[o], a = s + l.length;
    a >= t && (a > n && (l = l.slice(0, n - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function Mu(i, e, t) {
  return _o(i, [""], e, t);
}
class Hs {
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
class Mh {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Hs(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
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
class Th {
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
typeof Symbol < "u" && (ze.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Hs.prototype[Symbol.iterator] = Mh.prototype[Symbol.iterator] = Th.prototype[Symbol.iterator] = function() {
  return this;
});
class Im {
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
function ps(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function bt(i, e, t = !0, n = !0) {
  return Bm(i, e, t, n);
}
function Rm(i) {
  return i >= 56320 && i < 57344;
}
function Pm(i) {
  return i >= 55296 && i < 56320;
}
function Nm(i, e) {
  let t = i.charCodeAt(e);
  if (!Pm(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return Rm(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Vm(i) {
  return i < 65536 ? 1 : 2;
}
const wl = /\r\n?|\n/;
var It = /* @__PURE__ */ (function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
})(It || (It = {}));
class jn {
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
    xl(this, e, t);
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
    return new jn(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : $h(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Sl(this, e, t);
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
    return new jn(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new jn(e);
  }
}
class ht extends jn {
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
    return xl(this, (t, n, s, o, r) => e = e.replace(s, s + (n - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return Sl(this, e, t, !0);
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
          n.push(ze.empty);
        n.push(r ? e.slice(o, o + r) : ze.empty);
      }
      o += r;
    }
    return new ht(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : $h(this, e, !0);
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
    return e.empty ? this : Sl(this, e, t, !0);
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
    xl(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return jn.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], o = new Ys(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        yt(s, c, -1);
        let d = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        yt(t, c, d), d > 0 && fi(n, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        yt(t, c, -1), yt(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new ht(t, n),
      filtered: jn.create(s)
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
      r < t && yt(s, t - r, -1);
      let d = new ht(s, o);
      l = l ? l.compose(d.map(l)) : d, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let d of c)
          u(d);
      else if (c instanceof ht) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: d, to: h = d, insert: p } = c;
        if (d > h || d < 0 || h > t)
          throw new RangeError(`Invalid change range ${d} to ${h} (in doc of length ${t})`);
        let g = p ? typeof p == "string" ? ze.of(p.split(n || wl)) : p : ze.empty, b = g.length;
        if (d == h && b == 0)
          return;
        d < r && a(), d > r && yt(s, d - r, -1), yt(s, h - d, b), fi(o, s, g), r = h;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new ht(e ? [e, -1] : [], []);
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
            n.push(ze.empty);
          n[s] = ze.of(o.slice(1)), t.push(o[0], n[s].length);
        }
      }
    }
    return new ht(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new ht(e, t);
  }
}
function yt(i, e, t, n = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = i.length - 2;
  s >= 0 && t <= 0 && t == i[s + 1] ? i[s] += e : s >= 0 && e == 0 && i[s] == 0 ? i[s + 1] += t : n ? (i[s] += e, i[s + 1] += t) : i.push(e, t);
}
function fi(i, e, t) {
  if (t.length == 0)
    return;
  let n = e.length - 2 >> 1;
  if (n < i.length)
    i[i.length - 1] = i[i.length - 1].append(t);
  else {
    for (; i.length < n; )
      i.push(ze.empty);
    i.push(t);
  }
}
function xl(i, e, t) {
  let n = i.inserted;
  for (let s = 0, o = 0, r = 0; r < i.sections.length; ) {
    let l = i.sections[r++], a = i.sections[r++];
    if (a < 0)
      s += l, o += l;
    else {
      let u = s, c = o, d = ze.empty;
      for (; u += l, c += a, a && n && (d = d.append(n[r - 2 >> 1])), !(t || r == i.sections.length || i.sections[r + 1] < 0); )
        l = i.sections[r++], a = i.sections[r++];
      e(s, u, o, c, d), s = u, o = c;
    }
  }
}
function Sl(i, e, t, n = !1) {
  let s = [], o = n ? [] : null, r = new Ys(i), l = new Ys(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      yt(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (yt(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (yt(s, 0, r.ins), o && fi(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      yt(s, u, a < r.i ? r.ins : 0), o && a < r.i && fi(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? ht.createSet(s, o) : jn.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function $h(i, e, t = !1) {
  let n = [], s = t ? [] : null, o = new Ys(i), r = new Ys(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? ht.createSet(n, s) : jn.create(n);
    if (o.ins == 0)
      yt(n, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      yt(n, 0, r.ins, l), s && fi(s, n, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = n.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          yt(n, a, c, l), s && c && fi(s, n, r.text);
        } else r.ins == -1 ? (yt(n, o.off ? 0 : o.len, a, l), s && fi(s, n, o.textBit(a))) : (yt(n, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && fi(s, n, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || n.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class Ys {
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
    return t >= e.length ? ze.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? ze.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class ci {
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
    return this.empty ? n = s = e.mapPos(this.from, t) : (n = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), n == this.from && s == this.to ? this : new ci(n, s, this.flags, this.goalColumn);
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
    return new ci(e, t, n, s);
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
    return new X(e.ranges.map((t) => ci.fromJSON(t)), e.main);
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
    return ci.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (n == null ? 7 : Math.min(6, n)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, n, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? ci.create(t, e, r | 32, n) : ci.create(e, t, r, n);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return ci.create(e, t, 64, void 0);
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
function Lh(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let pa = 0;
class de {
  constructor(e, t, n, s, o) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = pa++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new de(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : ga), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Ko([], this, 0, e);
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
    return new Ko(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Ko(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function ga(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class Ko {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = pa++;
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
        if (a && h.docChanged || u && (h.docChanged || h.selection) || Cl(d, c)) {
          let p = n(d);
          if (l ? !Tu(p, d.values[r], s) : !s(p, d.values[r]))
            return d.values[r] = p, 1;
        }
        return 0;
      },
      reconfigure: (d, h) => {
        let p, g = h.config.address[o];
        if (g != null) {
          let b = er(h, g);
          if (this.dependencies.every((k) => k instanceof de ? h.facet(k) === d.facet(k) : k instanceof gn ? h.field(k, !1) == d.field(k, !1) : !0) || (l ? Tu(p = n(d), b, s) : s(p = n(d), b)))
            return d.values[r] = b, 0;
        } else
          p = n(d);
        return d.values[r] = p, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function Tu(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function Cl(i, e) {
  let t = !1;
  for (let n of e)
    Ws(i, n) & 1 && (t = !0);
  return t;
}
function Hm(i, e, t) {
  let n = t.map((a) => i[a.id]), s = t.map((a) => a.type), o = n.filter((a) => !(a & 1)), r = i[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < n.length; c++) {
      let d = er(a, n[c]);
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
        Ws(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!Cl(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = Cl(a, n), d = u.config.facets[e.id], h = u.facet(e);
      if (d && !c && ga(t, d))
        return a.values[r] = h, 0;
      let p = l(a);
      return e.compare(p, h) ? (a.values[r] = h, 0) : (a.values[r] = p, 1);
    }
  };
}
const vo = /* @__PURE__ */ de.define({ static: !0 });
class gn {
  constructor(e, t, n, s, o) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new gn(pa++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(vo).find((n) => n.field == this);
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
        let o = n.facet(vo), r = s.facet(vo), l;
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
    return [this, vo.of({ field: this, create: e })];
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
const Oi = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function $s(i) {
  return (e) => new Dh(e, i);
}
const br = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ $s(Oi.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ $s(Oi.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ $s(Oi.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ $s(Oi.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ $s(Oi.lowest)
};
class Dh {
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
    return new Al(this, e);
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
class Al {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Qo {
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
    for (let h of Wm(e, t, r))
      h instanceof gn ? s.push(h) : (o[h.facet.id] || (o[h.facet.id] = [])).push(h);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let h of s)
      l[h.id] = u.length << 1, u.push((p) => h.slot(p));
    let c = n?.config.facets;
    for (let h in o) {
      let p = o[h], g = p[0].facet, b = c && c[h] || [];
      if (p.every(
        (k) => k.type == 0
        /* Provider.Static */
      ))
        if (l[g.id] = a.length << 1 | 1, ga(b, p))
          a.push(n.facet(g));
        else {
          let k = g.combine(p.map((M) => M.value));
          a.push(n && g.compare(k, n.facet(g)) ? n.facet(g) : k);
        }
      else {
        for (let k of p)
          k.type == 0 ? (l[k.id] = a.length << 1 | 1, a.push(k.value)) : (l[k.id] = u.length << 1, u.push((M) => k.dynamicSlot(M)));
        l[g.id] = u.length << 1, u.push((k) => Hm(k, g, p));
      }
    }
    let d = u.map((h) => h(l));
    return new Qo(e, r, d, l, a, o);
  }
}
function Wm(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = n[a].indexOf(r);
      u > -1 && n[a].splice(u, 1), r instanceof Al && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof Al) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof Dh)
      o(r.inner, r.prec);
    else if (r instanceof gn)
      n[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof Ko)
      n[l].push(r), r.facet.extensions && o(r.facet.extensions, Oi.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(i, Oi.default), n.reduce((r, l) => r.concat(l));
}
function Ws(i, e) {
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
function er(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const Bh = /* @__PURE__ */ de.define(), Ml = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), Oh = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), Eh = /* @__PURE__ */ de.define(), Ih = /* @__PURE__ */ de.define(), Rh = /* @__PURE__ */ de.define(), Ph = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : !1
});
class Ss {
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
    return new zm();
  }
}
class zm {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new Ss(this, e);
  }
}
class Fm {
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
    return new Fm(e.map || ((t) => t));
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
class kt {
  constructor(e, t, n, s, o, r) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, n && Lh(n, t.newLength), o.some((l) => l.type == kt.time) || (this.annotations = o.concat(kt.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, s, o, r) {
    return new kt(e, t, n, s, o, r);
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
    let t = this.annotation(kt.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
kt.time = /* @__PURE__ */ Ss.define();
kt.userEvent = /* @__PURE__ */ Ss.define();
kt.addToHistory = /* @__PURE__ */ Ss.define();
kt.remote = /* @__PURE__ */ Ss.define();
function _m(i, e) {
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
function Nh(i, e, t) {
  var n;
  let s, o, r;
  return t ? (s = e.changes, o = ht.empty(e.changes.length), r = i.changes.compose(e.changes)) : (s = e.changes.map(i.changes), o = i.changes.mapDesc(e.changes, !0), r = i.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (n = i.selection) === null || n === void 0 ? void 0 : n.map(s),
    effects: Xe.mapEffects(i.effects, s).concat(Xe.mapEffects(e.effects, o)),
    annotations: i.annotations.length ? i.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: i.scrollIntoView || e.scrollIntoView
  };
}
function Tl(i, e, t) {
  let n = e.selection, s = rs(e.annotations);
  return e.userEvent && (s = s.concat(kt.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof ht ? e.changes : ht.of(e.changes || [], t, i.facet(Oh)),
    selection: n && (n instanceof X ? n : X.single(n.anchor, n.head)),
    effects: rs(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Vh(i, e, t) {
  let n = Tl(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    n = Nh(n, Tl(i, e[o], r ? n.changes.newLength : i.doc.length), r);
  }
  let s = kt.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return Um(t ? Km(s) : s);
}
function Km(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(Eh)) {
    let o = s(i);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : _m(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = i.changes.invertedDesc, s = ht.empty(e.doc.length);
    else {
      let r = i.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    i = kt.create(e, s, i.selection && i.selection.map(o), Xe.mapEffects(i.effects, o), i.annotations, i.scrollIntoView);
  }
  let n = e.facet(Ih);
  for (let s = n.length - 1; s >= 0; s--) {
    let o = n[s](i);
    o instanceof kt ? i = o : Array.isArray(o) && o.length == 1 && o[0] instanceof kt ? i = o[0] : i = Vh(e, rs(o), !1);
  }
  return i;
}
function Um(i) {
  let e = i.startState, t = e.facet(Rh), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](i);
    o && Object.keys(o).length && (n = Nh(n, Tl(e, o, i.changes.newLength), !0));
  }
  return n == i ? i : kt.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const Gm = [];
function rs(i) {
  return i == null ? Gm : Array.isArray(i) ? i : [i];
}
var Gn = /* @__PURE__ */ (function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
})(Gn || (Gn = {}));
const jm = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let $l;
try {
  $l = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function qm(i) {
  if ($l)
    return $l.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || jm.test(t)))
      return !0;
  }
  return !1;
}
function Ym(i) {
  return (e) => {
    if (!/\S/.test(e))
      return Gn.Space;
    if (qm(e))
      return Gn.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return Gn.Word;
    return Gn.Other;
  };
}
class _e {
  constructor(e, t, n, s, o, r) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Ws(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Ws(this, n), er(this, n);
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
    return Vh(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let l of e.effects)
      l.is(kr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(Xe.reconfigure) ? (t = null, n = l.value) : l.is(Xe.appendConfig) && (t = null, n = rs(n).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Qo.resolve(n, s, this), o = new _e(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(Ml) ? e.newSelection : e.newSelection.asSingle();
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
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), o = [n.range], r = rs(n.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let h = 0; h < l; h++)
        o[h] = o[h].map(c);
      let d = s.mapDesc(u, !0);
      o.push(a.range.map(d)), s = s.compose(c), r = Xe.mapEffects(r, c).concat(Xe.mapEffects(rs(a.effects), d));
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
    return e instanceof ht ? e : ht.of(e, this.doc.length, this.facet(_e.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return ze.of(e.split(this.facet(_e.lineSeparator) || wl));
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
    return t == null ? e.default : (Ws(this, t), er(this, t));
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
        s instanceof gn && this.config.address[s.id] != null && (t[n] = s.spec.toJSON(this.field(e[n]), this));
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
    let t = Qo.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof ze ? e.doc : ze.of((e.doc || "").split(t.staticFacet(_e.lineSeparator) || wl)), s = e.selection ? e.selection instanceof X ? e.selection : X.single(e.selection.anchor, e.selection.head) : X.single(0);
    return Lh(s, n.length), t.staticFacet(Ml) || (s = s.asSingle()), new _e(t, n, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
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
    return this.facet(Ph);
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
    for (let o of this.facet(Bh))
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
    return Ym(t.length ? t[0] : "");
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
      let a = bt(t, r, !1);
      if (o(t.slice(a, r)) != Gn.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = bt(t, l);
      if (o(t.slice(l, a)) != Gn.Word)
        break;
      l = a;
    }
    return r == l ? null : X.range(r + n, l + n);
  }
}
_e.allowMultipleSelections = Ml;
_e.tabSize = /* @__PURE__ */ de.define({
  combine: (i) => i.length ? i[0] : 4
});
_e.lineSeparator = Oh;
_e.readOnly = Ph;
_e.phrases = /* @__PURE__ */ de.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
_e.languageData = Bh;
_e.changeFilter = Eh;
_e.transactionFilter = Ih;
_e.transactionExtender = Rh;
kr.reconfigure = /* @__PURE__ */ Xe.define();
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
class Wi {
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
    return Ll.create(e, t, this);
  }
}
Wi.prototype.startSide = Wi.prototype.endSide = 0;
Wi.prototype.point = !1;
Wi.prototype.mapMode = It.TrackDel;
function ma(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let Ll = class Hh {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Hh(e, t, n);
  }
};
function Dl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class va {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return Zi(this.to);
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
      let h = this.value[d], p = this.from[d] + e, g = this.to[d] + e, b, k;
      if (p == g) {
        let M = t.mapPos(p, h.startSide, h.mapMode);
        if (M == null || (b = k = M, h.startSide != h.endSide && (k = t.mapPos(p, h.endSide), k < b)))
          continue;
      } else if (b = t.mapPos(p, h.startSide), k = t.mapPos(g, h.endSide), b > k || b == k && h.startSide > 0 && h.endSide <= 0)
        continue;
      if (!((k - b || h.endSide - h.startSide) < 0))
        if (u < 0 && (u = b), h.point && (c = Math.max(c, k - b)), (b - n || h.startSide - s) >= 0)
          r.push(h), l.push(b - u), a.push(k - u), n = k, s = h.endSide;
        else {
          if (b == k)
            for (let M = r.length; M > 0; M--) {
              if ((b - (a[M - 1] + u) || h.startSide - r[M - 1].endSide) >= 0) {
                r.splice(M, 0, h), l.splice(M, 0, b - u), a.splice(M, 0, k - u);
                continue e;
              }
              if ((b - (l[M - 1] + u) || h.endSide - r[M - 1].startSide) > 0)
                break;
            }
          o(b, k, h);
        }
    }
    return { mapped: r.length ? new va(l, a, r, c) : null, pos: u };
  }
}
class Ie {
  constructor(e, t, n, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new Ie(e, t, n, s);
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
      return t.length ? Ie.of(t) : this;
    let l = new Wh(this, null, -1).goto(0), a = 0, u = [], c = new Ni();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let d = t[a++];
        c.addInner(d.from, d.to, d.value, !1) || u.push(d);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(Ll.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Ie.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], s = -1, o, r = (a, u, c) => {
      o || (o = new Ni()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], d = e.touchesRange(u, u + c.length);
      if (d === !1)
        s = Math.max(s, c.maxPoint), t.push(c), n.push(e.mapPos(u));
      else if (d === !0) {
        let [h, p] = t.length ? [Zi(n) + Zi(t).length, Zi(Zi(t).value).endSide] : [-1, -1], { mapped: g, pos: b } = c.map(u, e, h, p, r);
        g && (s = Math.max(s, g.maxPoint), t.push(g), n.push(b));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Ie(n, t, l || Ie.empty, s);
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
    return Xs.from([this]).goto(e);
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
    return Xs.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, o = -1) {
    let r = e.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), l = t.filter((d) => d.maxPoint > 0 || !d.isEmpty && d.maxPoint >= o), a = $u(r, l, n), u = new Ls(r, a, o), c = new Ls(l, a, o);
    n.iterGaps((d, h, p) => Lu(u, d, c, h, p, s)), n.empty && n.length == 0 && Lu(u, 0, c, 0, 0, s);
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
    let l = $u(o, r), a = new Ls(o, l, 0).goto(n), u = new Ls(r, l, 0).goto(n);
    for (; ; ) {
      if (a.to != u.to || !Bl(a.active, u.active) || a.point && (!u.point || !ma(a.point, u.point)))
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
    let r = new Ls(e, null, o).goto(t), l = t, a = r.openStart;
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
    let n = new Ni();
    for (let s of e instanceof Ll ? [e] : t ? Xm(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Ie.empty;
    let t = Zi(e);
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != Ie.empty; s = s.nextLayer)
        t = new Ie(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Ie.empty = /* @__PURE__ */ new Ie([], [], null, -1);
function Zi(i) {
  return i[i.length - 1];
}
function Xm(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (Dl(e, n) > 0)
        return i.slice().sort(Dl);
      e = n;
    }
  return i;
}
Ie.empty.nextLayer = Ie.empty;
class Ni {
  finishChunk(e) {
    this.chunks.push(new va(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
    this.addInner(e, t, n, s) || (this.nextLayer || (this.nextLayer = new Ni())).addRange(e, t, n, s);
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
    return this.finishInner(Ie.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Ie.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function $u(i, e, t) {
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
class Wh {
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
class Xs {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= n && s.push(new Wh(r, t, n, o));
    return s.length == 1 ? s[0] : new Xs(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      jr(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      jr(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), jr(this.heap, 0);
    }
  }
}
function jr(i, e) {
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
class Ls {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Xs.from(e, t, n);
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
    yo(this.active, e), yo(this.activeTo, e), yo(this.activeRank, e), this.minActive = Du(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    bo(this.active, t, n), bo(this.activeTo, t, s), bo(this.activeRank, t, o), e && bo(e, t, this.cursor.from), this.minActive = Du(this.active, this.activeTo);
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
        this.removeActive(s), n && yo(n, s);
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
function Lu(i, e, t, n, s, o) {
  i.goto(e), t.goto(n);
  let r = n + s, l = n, a = n - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let d = i.to + a - t.to, h = d || i.endSide - t.endSide, p = h < 0 ? i.to + a : t.to, g = Math.min(p, r);
    if (i.point || t.point ? (i.point && t.point && ma(i.point, t.point) && Bl(i.activeForPoint(i.to), t.activeForPoint(t.to)) || o.comparePoint(l, g, i.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), g > l && !Bl(i.active, t.active) && o.compareRange(l, g, i.active, t.active), u && g < r && (d || i.openEnd(p) != t.openEnd(p)) && (c = !0)), p > r)
      break;
    l = p, h <= 0 && i.next(), h >= 0 && t.next();
  }
}
function Bl(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !ma(i[t], e[t]))
      return !1;
  return !0;
}
function yo(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function bo(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function Du(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function xr(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = bt(i, s));
  return n;
}
function Jm(i, e, t, n) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == i.length)
      break;
    o += i.charCodeAt(s) == 9 ? t - o % t : 1, s = bt(i, s);
  }
  return i.length;
}
const Ol = "ͼ", Bu = typeof Symbol > "u" ? "__" + Ol : Symbol.for(Ol), El = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), Ou = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class gi {
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
      for (let p in l) {
        let g = l[p];
        if (/&/.test(p))
          o(
            p.split(/,\s*/).map((b) => r.map((k) => b.replace(/&/, k))).reduce((b, k) => b.concat(k)),
            g,
            a
          );
        else if (g && typeof g == "object") {
          if (!d) throw new RangeError("The value of a property (" + p + ") should be a primitive value.");
          o(s(p), g, c, h);
        } else g != null && c.push(p.replace(/_.*/, "").replace(/[A-Z]/g, (b) => "-" + b.toLowerCase()) + ": " + g + ";");
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
    let e = Ou[Bu] || 1;
    return Ou[Bu] = e + 1, Ol + e.toString(36);
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
    let s = e[El], o = n && n.nonce;
    s ? o && s.setNonce(o) : s = new Zm(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Eu = /* @__PURE__ */ new Map();
class Zm {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = Eu.get(n);
      if (o) return e[El] = o;
      this.sheet = new s.CSSStyleSheet(), Eu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[El] = this;
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
var mi = {
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
}, Js = {
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
}, Qm = typeof navigator < "u" && /Mac/.test(navigator.platform), ev = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var pt = 0; pt < 10; pt++) mi[48 + pt] = mi[96 + pt] = String(pt);
for (var pt = 1; pt <= 24; pt++) mi[pt + 111] = "F" + pt;
for (var pt = 65; pt <= 90; pt++)
  mi[pt] = String.fromCharCode(pt + 32), Js[pt] = String.fromCharCode(pt);
for (var qr in mi) Js.hasOwnProperty(qr) || (Js[qr] = mi[qr]);
function tv(i) {
  var e = Qm && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || ev && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? Js : mi)[i.keyCode] || i.key || "Unidentified";
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
  for (; e < arguments.length; e++) zh(i, arguments[e]);
  return i;
}
function zh(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) zh(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let Tt = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Il = typeof document < "u" ? document : { documentElement: { style: {} } };
const Rl = /* @__PURE__ */ /Edge\/(\d+)/.exec(Tt.userAgent), Fh = /* @__PURE__ */ /MSIE \d/.test(Tt.userAgent), Pl = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Tt.userAgent), Sr = !!(Fh || Pl || Rl), Iu = !Sr && /* @__PURE__ */ /gecko\/(\d+)/i.test(Tt.userAgent), Yr = !Sr && /* @__PURE__ */ /Chrome\/(\d+)/.exec(Tt.userAgent), Ru = "webkitFontSmoothing" in Il.documentElement.style, Nl = !Sr && /* @__PURE__ */ /Apple Computer/.test(Tt.vendor), Pu = Nl && (/* @__PURE__ */ /Mobile\/\w+/.test(Tt.userAgent) || Tt.maxTouchPoints > 2);
var re = {
  mac: Pu || /* @__PURE__ */ /Mac/.test(Tt.platform),
  windows: /* @__PURE__ */ /Win/.test(Tt.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(Tt.platform),
  ie: Sr,
  ie_version: Fh ? Il.documentMode || 6 : Pl ? +Pl[1] : Rl ? +Rl[1] : 0,
  gecko: Iu,
  gecko_version: Iu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  chrome: !!Yr,
  chrome_version: Yr ? +Yr[1] : 0,
  ios: Pu,
  android: /* @__PURE__ */ /Android\b/.test(Tt.userAgent),
  webkit: Ru,
  webkit_version: Ru ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  safari: Nl,
  safari_version: Nl ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(Tt.userAgent) || [0, 0])[1] : 0,
  tabSize: Il.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function ya(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const tr = /* @__PURE__ */ Object.create(null);
function ba(i, e, t) {
  if (i == e)
    return !0;
  i || (i = tr), e || (e = tr);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let o of n)
    if (o != t && (s.indexOf(o) == -1 || i[o] !== e[o]))
      return !1;
  return !0;
}
function nv(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function Nu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function iv(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class ro {
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
class Ze extends Wi {
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
    return new lo(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new zi(e, t, t, n, e.widget || null, !1);
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
      let { start: o, end: r } = _h(e, t);
      n = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new zi(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new ao(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Ie.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
Ze.none = Ie.empty;
class lo extends Ze {
  constructor(e) {
    let { start: t, end: n } = _h(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? ya(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || tr;
  }
  eq(e) {
    return this == e || e instanceof lo && this.tagName == e.tagName && ba(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
lo.prototype.point = !1;
class ao extends Ze {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof ao && this.spec.class == e.spec.class && ba(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
ao.prototype.mapMode = It.TrackBefore;
ao.prototype.point = !0;
class zi extends Ze {
  constructor(e, t, n, s, o, r) {
    super(t, n, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? It.TrackBefore : It.TrackAfter : It.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? gt.WidgetRange : this.startSide <= 0 ? gt.WidgetBefore : gt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof zi && sv(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
zi.prototype.point = !0;
function _h(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function sv(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function ls(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Zs extends Wi {
  constructor(e, t, n) {
    super(), this.tagName = e, this.attributes = t, this.rank = n;
  }
  eq(e) {
    return e == this || e instanceof Zs && this.tagName == e.tagName && ba(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Zs(e.tagName, e.attributes || tr, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Ie.of(e, t);
  }
}
Zs.prototype.startSide = Zs.prototype.endSide = -1;
function Qs(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Vl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function zs(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Vl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function Uo(i) {
  return i.nodeType == 3 ? eo(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Fs(i, e, t, n) {
  return t ? Vu(i, e, t, n, -1) || Vu(i, e, t, n, 1) : !1;
}
function vi(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function nr(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function Vu(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : Jn(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let o = i.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = vi(i) + (s < 0 ? 0 : 1), i = o;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? Jn(i) : 0;
    } else
      return !1;
  }
}
function Jn(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function ir(i, e) {
  let { left: t, right: n } = i;
  if (t == n)
    return i;
  let s = e ? t : n;
  return { left: s, right: s, top: i.top, bottom: i.bottom };
}
function ov(i) {
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
function Kh(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function rv(i, e, t, n, s, o, r, l) {
  let a = i.ownerDocument, u = a.defaultView || window;
  for (let c = i, d = !1; c && !d; )
    if (c.nodeType == 1) {
      let h, p = c == a.body, g = 1, b = 1;
      if (p)
        h = ov(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (d = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let L = c.getBoundingClientRect();
        ({ scaleX: g, scaleY: b } = Kh(c, L)), h = {
          left: L.left,
          right: L.left + c.clientWidth * g,
          top: L.top,
          bottom: L.top + c.clientHeight * b
        };
      }
      let k = 0, M = 0;
      if (s == "nearest")
        e.top < h.top + r ? (M = e.top - (h.top + r), t > 0 && e.bottom > h.bottom + M && (M = e.bottom - h.bottom + r)) : e.bottom > h.bottom - r && (M = e.bottom - h.bottom + r, t < 0 && e.top - M < h.top && (M = e.top - (h.top + r)));
      else {
        let L = e.bottom - e.top, T = h.bottom - h.top;
        M = (s == "center" && L <= T ? e.top + L / 2 - T / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - T + r) - h.top;
      }
      if (n == "nearest" ? e.left < h.left + o ? (k = e.left - (h.left + o), t > 0 && e.right > h.right + k && (k = e.right - h.right + o)) : e.right > h.right - o && (k = e.right - h.right + o, t < 0 && e.left < h.left + k && (k = e.left - (h.left + o))) : k = (n == "center" ? e.left + (e.right - e.left) / 2 - (h.right - h.left) / 2 : n == "start" == l ? e.left - o : e.right - (h.right - h.left) + o) - h.left, k || M)
        if (p)
          u.scrollBy(k, M);
        else {
          let L = 0, T = 0;
          if (M) {
            let F = c.scrollTop;
            c.scrollTop += M / b, T = (c.scrollTop - F) * b;
          }
          if (k) {
            let F = c.scrollLeft;
            c.scrollLeft += k / g, L = (c.scrollLeft - F) * g;
          }
          e = {
            left: e.left - L,
            top: e.top - T,
            right: e.right - L,
            bottom: e.bottom - T
          }, L && Math.abs(L - k) < 1 && (n = "nearest"), T && Math.abs(T - M) < 1 && (s = "nearest");
        }
      if (p)
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
function Uh(i, e = !0) {
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
class lv {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Jn(t) : 0), n, Math.min(e.focusOffset, n ? Jn(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
function Gh(i) {
  let e = [];
  for (let t = i; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function jh(i, e = !0) {
  for (let { node: t, left: n, top: s } of i)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != n && (t.scrollLeft = n);
}
let Bi = null;
re.safari && re.safari_version >= 26 && (Bi = !1);
function qh(i) {
  if (i.setActive)
    return i.setActive();
  if (Bi)
    return i.focus(Bi);
  let e = Gh(i);
  i.focus(Bi == null ? {
    get preventScroll() {
      return Bi = { preventScroll: !0 }, !0;
    }
  } : void 0), Bi || (Bi = !1, jh(e));
}
let Hu;
function eo(i, e, t = e) {
  let n = Hu || (Hu = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function as(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, i.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, i.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function av(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function uv(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, Jn(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = Jn(t));
    } else {
      if (t == i)
        return !0;
      n = vi(t), t = t.parentNode;
    }
}
function Yh(i) {
  return i instanceof Window ? i.pageYOffset > Math.max(0, i.document.documentElement.scrollHeight - i.innerHeight - 4) : i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function Xh(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = Jn(t);
    } else if (t.parentNode && !nr(t))
      n = vi(t), t = t.parentNode;
    else
      return null;
  }
}
function Jh(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !nr(t))
      n = vi(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class cn {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new cn(e.parentNode, vi(e), t);
  }
  static after(e, t) {
    return new cn(e.parentNode, vi(e) + 1, t);
  }
}
var Je = /* @__PURE__ */ (function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
})(Je || (Je = {}));
const Fi = Je.LTR, ka = Je.RTL;
function Zh(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const cv = /* @__PURE__ */ Zh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), hv = /* @__PURE__ */ Zh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Hl = /* @__PURE__ */ Object.create(null), xn = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  Hl[e] = t, Hl[t] = -e;
}
function Qh(i) {
  return i <= 247 ? cv[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? hv[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const dv = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Dn {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ka : Fi;
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
function ed(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !ed(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const qe = [];
function fv(i, e, t, n, s) {
  for (let o = 0; o <= n.length; o++) {
    let r = o ? n[o - 1].to : e, l = o < n.length ? n[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = Qh(i.charCodeAt(u));
      h == 512 ? h = c : h == 8 && d == 4 && (h = 16), qe[u] = h == 4 ? 2 : h, h & 7 && (d = h), c = h;
    }
    for (let u = r, c = a, d = a; u < l; u++) {
      let h = qe[u];
      if (h == 128)
        u < l - 1 && c == qe[u + 1] && c & 24 ? h = qe[u] = c : qe[u] = 256;
      else if (h == 64) {
        let p = u + 1;
        for (; p < l && qe[p] == 64; )
          p++;
        let g = u && c == 8 || p < t && qe[p] == 8 ? d == 1 ? 1 : 8 : 256;
        for (let b = u; b < p; b++)
          qe[b] = g;
        u = p - 1;
      } else h == 8 && d == 1 && (qe[u] = 1);
      c = h, h & 7 && (d = h);
    }
  }
}
function pv(i, e, t, n, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= n.length; r++) {
    let u = r ? n[r - 1].to : e, c = r < n.length ? n[r].from : t;
    for (let d = u, h, p, g; d < c; d++)
      if (p = Hl[h = i.charCodeAt(d)])
        if (p < 0) {
          for (let b = l - 3; b >= 0; b -= 3)
            if (xn[b + 1] == -p) {
              let k = xn[b + 2], M = k & 2 ? s : k & 4 ? k & 1 ? o : s : 0;
              M && (qe[d] = qe[xn[b]] = M), l = b;
              break;
            }
        } else {
          if (xn.length == 189)
            break;
          xn[l++] = d, xn[l++] = h, xn[l++] = a;
        }
      else if ((g = qe[d]) == 2 || g == 1) {
        let b = g == s;
        a = b ? 0 : 1;
        for (let k = l - 3; k >= 0; k -= 3) {
          let M = xn[k + 2];
          if (M & 2)
            break;
          if (b)
            xn[k + 2] |= 2;
          else {
            if (M & 4)
              break;
            xn[k + 2] |= 4;
          }
        }
      }
  }
}
function gv(i, e, t, n) {
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
        let d = o == 1, h = (c < e ? qe[c] : n) == 1, p = d == h ? d ? 1 : 2 : n;
        for (let g = c, b = s, k = b ? t[b - 1].to : i; g > a; )
          g == k && (g = t[--b].from, k = b ? t[b - 1].to : i), qe[--g] = p;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Wl(i, e, t, n, s, o, r) {
  let l = n % 2 ? 2 : 1;
  if (n % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, d = !1;
      if (u == o.length || a < o[u].from) {
        let b = qe[a];
        b != l && (c = !1, d = b == 16);
      }
      let h = !c && l == 1 ? [] : null, p = c ? n : n + 1, g = a;
      e: for (; ; )
        if (u < o.length && g == o[u].from) {
          if (d)
            break e;
          let b = o[u];
          if (!c)
            for (let k = b.to, M = u + 1; ; ) {
              if (k == t)
                break e;
              if (M < o.length && o[M].from == k)
                k = o[M++].to;
              else {
                if (qe[k] == l)
                  break e;
                break;
              }
            }
          if (u++, h)
            h.push(b);
          else {
            b.from > a && r.push(new Dn(a, b.from, p));
            let k = b.direction == Fi != !(p % 2);
            zl(i, k ? n + 1 : n, s, b.inner, b.from, b.to, r), a = b.to;
          }
          g = b.to;
        } else {
          if (g == t || (c ? qe[g] != l : qe[g] == l))
            break;
          g++;
        }
      h ? Wl(i, a, g, n + 1, s, h, r) : a < g && r.push(new Dn(a, g, p)), a = g;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, d = !1;
      if (!u || a > o[u - 1].to) {
        let b = qe[a - 1];
        b != l && (c = !1, d = b == 16);
      }
      let h = !c && l == 1 ? [] : null, p = c ? n : n + 1, g = a;
      e: for (; ; )
        if (u && g == o[u - 1].to) {
          if (d)
            break e;
          let b = o[--u];
          if (!c)
            for (let k = b.from, M = u; ; ) {
              if (k == e)
                break e;
              if (M && o[M - 1].to == k)
                k = o[--M].from;
              else {
                if (qe[k - 1] == l)
                  break e;
                break;
              }
            }
          if (h)
            h.push(b);
          else {
            b.to < a && r.push(new Dn(b.to, a, p));
            let k = b.direction == Fi != !(p % 2);
            zl(i, k ? n + 1 : n, s, b.inner, b.from, b.to, r), a = b.from;
          }
          g = b.from;
        } else {
          if (g == e || (c ? qe[g - 1] != l : qe[g - 1] == l))
            break;
          g--;
        }
      h ? Wl(i, g, a, n + 1, s, h, r) : g < a && r.push(new Dn(g, a, p)), a = g;
    }
}
function zl(i, e, t, n, s, o, r) {
  let l = e % 2 ? 2 : 1;
  fv(i, s, o, n, l), pv(i, s, o, n, l), gv(s, o, n, l), Wl(i, s, o, e, t, n, r);
}
function mv(i, e, t) {
  if (!i)
    return [new Dn(0, 0, e == ka ? 1 : 0)];
  if (e == Fi && !t.length && !dv.test(i))
    return td(i.length);
  if (t.length)
    for (; i.length > qe.length; )
      qe[qe.length] = 256;
  let n = [], s = e == Fi ? 0 : 1;
  return zl(i, s, s, t, 0, i.length, n), n;
}
function td(i) {
  return [new Dn(0, i, 0)];
}
let nd = "";
function vv(i, e, t, n, s) {
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
    l = Dn.find(e, r, (o = n.bidiLevel) !== null && o !== void 0 ? o : -1, n.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let h = l += s ? 1 : -1;
    if (h < 0 || h >= e.length)
      return null;
    a = e[l = h], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = bt(i.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), nd = i.text.slice(Math.min(r, c), Math.max(r, c));
  let d = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!d)
      return s ? X.cursor(i.to, 1) : X.cursor(i.from, -1);
    if (d.level + (s ? 0 : 1) < a.level)
      return X.cursor(d.side(!s, t) + i.from, d.forward(s, t) ? 1 : -1, d.level);
  }
  return X.cursor(c + i.from, a.forward(s, t) ? -1 : 1, a.level);
}
function yv(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Qh(i.charCodeAt(n));
    if (s == 1)
      return Fi;
    if (s == 2 || s == 4)
      return ka;
  }
  return Fi;
}
const id = /* @__PURE__ */ de.define(), sd = /* @__PURE__ */ de.define(), od = /* @__PURE__ */ de.define(), rd = /* @__PURE__ */ de.define(), Fl = /* @__PURE__ */ de.define(), ld = /* @__PURE__ */ de.define(), ad = /* @__PURE__ */ de.define(), wa = /* @__PURE__ */ de.define(), xa = /* @__PURE__ */ de.define(), ud = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), cd = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
}), hd = /* @__PURE__ */ de.define();
class us {
  constructor(e, t, n, s, o, r = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new us(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new us(X.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const ko = /* @__PURE__ */ Xe.define({ map: (i, e) => i.map(e) }), dd = /* @__PURE__ */ Xe.define();
function hn(i, e, t) {
  let n = i.facet(rd);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const Un = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : !0 });
let bv = 0;
const ts = /* @__PURE__ */ de.define({
  combine(i) {
    return i.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (i[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class Gt {
  constructor(e, t, n, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(ts.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(ts.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: o, decorations: r } = t || {};
    return new Gt(bv++, e, n, s, (l) => {
      let a = [];
      return r && a.push(Cr.of((u) => {
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
    return Gt.define((n, s) => new e(n, s), t);
  }
}
class Xr {
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
            if (hn(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
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
        hn(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        hn(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const fd = /* @__PURE__ */ de.define(), Sa = /* @__PURE__ */ de.define(), Cr = /* @__PURE__ */ de.define(), pd = /* @__PURE__ */ de.define(), Ca = /* @__PURE__ */ de.define(), uo = /* @__PURE__ */ de.define(), gd = /* @__PURE__ */ de.define();
function Wu(i, e) {
  let t = i.state.facet(gd);
  if (!t.length)
    return t;
  let n = t.map((o) => o instanceof Function ? o(i) : o), s = [];
  return Ie.spans(n, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, d = s;
      for (let h = l.length - 1; h >= 0; h--, a--) {
        let p = l[h].spec.bidiIsolate, g;
        if (p == null && (p = yv(e.text, u, c)), a > 0 && d.length && (g = d[d.length - 1]).to == u && g.direction == p)
          g.to = c, d = g.inner;
        else {
          let b = { from: u, to: c, direction: p, inner: [] };
          d.push(b), d = b.inner;
        }
      }
    }
  }), s;
}
const md = /* @__PURE__ */ de.define();
function Aa(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let o of i.state.facet(md)) {
    let r = o(i);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (n = Math.max(n, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const Ns = /* @__PURE__ */ de.define();
class en {
  constructor(e, t, n, s) {
    this.fromA = e, this.toA = t, this.fromB = n, this.toB = s;
  }
  join(e) {
    return new en(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
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
          let p = t[o + 1];
          o += 2, d = Math.max(d, p);
          for (let g = s; g < e.length && e[g].fromB <= d; g++)
            r = e[g].toA - e[g].toB;
          h = Math.max(h, p + r);
        } else if (s < e.length && e[s].fromB <= d) {
          let p = e[s++];
          d = Math.max(d, p.toB), h = Math.max(h, p.toA), r = p.toA - p.toB;
        } else
          break;
      n.push(new en(c, h, u, d));
    }
    return n;
  }
}
class sr {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = ht.empty(this.startState.doc.length);
    for (let o of n)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new en(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new sr(e, t, n);
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
const kv = [];
class nt {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return kv;
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
      t && nv(this.dom, t);
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
    let n = vi(this.dom), s = this.length ? e > 0 : t > 0;
    return new cn(this.parent.dom, n + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof Mr)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class Ar extends nt {
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
          s = zu(s);
      else
        t.insertBefore(l.dom, s);
      n = l.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = zu(s);
    this.length = r;
  }
}
function zu(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class Mr extends Ar {
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
      let t = nt.get(e);
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
        if (r instanceof qn)
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
class qn extends Ar {
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
    let n = new qn(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class gs extends Ar {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new gs(t || document.createElement("div"), e);
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
      for (let h = 0, p = 0; h < c.children.length && p <= d; h++) {
        let g = c.children[h], b = p + g.length;
        b >= d && (g.isComposite() ? a(g, d - p) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || n && xv(r, g))) && (b > d || g.flags & 32 && t <= 1) ? (r = g, l = d - p) : (p < d || g.flags & 16 && !g.isHidden && t >= -1) && (s = g, o = d - p)), p = b;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, n) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, n) : wv(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: s, offset: o } = n;
      if (this.dom.contains(s.dom))
        return s.isText() ? new cn(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = n.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new cn(a.dom, 0);
        a == n.tile && (l = !0);
      }
    }
    return new cn(this.dom, 0);
  }
}
function wv(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = Uo(e);
  return t[t.length - 1] || null;
}
function xv(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Rt extends Ar {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let n = new Rt(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Ii extends nt {
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
    e == 0 && t < 0 || e == s && t >= 0 ? re.chrome || re.gecko || (e ? (o--, l = 1) : r < s && (r++, l = -1)) : t < 0 ? o-- : r < s && r++;
    let a = eo(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return re.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), n == null ? u : ir(u, (l ? l > 0 : t < 0) == n);
  }
  static of(e, t) {
    let n = new Ii(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class _i extends nt {
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
      return ir(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return ir(r, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return ze.empty;
    let { root: e } = this;
    if (!e)
      return ze.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, n, s, o) {
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new _i(o, n, e, s);
  }
}
class or extends nt {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return ze.empty;
  }
  coordsIn(e, t, n) {
    let s = this.dom.getBoundingClientRect();
    return n == null ? s : ir(s, t > 0 == n);
  }
}
class Sv {
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
class Cv {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class Av {
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
      let a = r.children[r.children.length - 1] = new Ii(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || Ii.of(e, (o = this.cache.find(Ii)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Jr(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof Rt && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Jr(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && nt.get(a.dom) && (c = Jr(a.dom));
        let d = Rt.of(a.mark, c);
        s.append(d), s = d;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = nt.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new Ii(e.text, e.text.nodeValue);
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
    e || (e = vd);
    let s = gs.start(e, t || ((n = this.cache.find(gs)) === null || n === void 0 ? void 0 : n.dom), !!t);
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
      if (t > 0 && (l = s.lastChild) && l instanceof Rt && l.mark.eq(r))
        s = l, t--;
      else {
        let a = Rt.of(r, (n = this.cache.find(Rt, (u) => u.mark.eq(r))) === null || n === void 0 ? void 0 : n.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Fu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(re.ios && Fu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        Zr,
        0,
        32
        /* TileFlag.After */
      ) || new _i(
        Zr.toDOM(),
        0,
        Zr,
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
        let t = e.rank * 102 + e.value.rank, n = new Cv(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      if (n.from < this.pos && s instanceof qn && s.wrapper.eq(n.wrapper))
        t = s;
      else {
        let o = qn.of(n.wrapper, (e = this.cache.find(qn, (r) => r.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
      or,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new or(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class Mv {
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
const rr = [_i, gs, Ii, Rt, or, qn, Mr];
for (let i = 0; i < rr.length; i++)
  rr[i].bucket = i;
class Tv {
  constructor(e) {
    this.view = e, this.buckets = rr.map(() => []), this.index = rr.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
          ), new _i(l.dom, t, e, l.flags & -498 | n));
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
class $v {
  constructor(e, t, n, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Tv(e), this.text = new Mv(e.state.doc), this.builder = new Av(this.cache, new Mr(e, e.contentDOM), Ie.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Sv(t), this.reuseWalker = {
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
    let s = Bv(this.old), o = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? _i.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof or)
          this.cache.add(r);
        else if (r instanceof Rt)
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
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof Rt && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof Rt && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let n = null, s = this.builder, o = -1, r = Ie.spans(this.decorations, e, t, {
      point: (l, a, u, c, d, h) => {
        if (u instanceof zi) {
          if (this.disallowBlockEffectsFor[h]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, d > c.length)
            s.continueWidget(a - l);
          else {
            let p = u.widget || (u.block ? ms.block : ms.inline), g = Lv(u), b = this.cache.findWidget(p, a - l, g) || _i.of(p, this.view, a - l, g);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(b)) : (s.ensureLine(n), s.addInlineWidget(b, c, d));
          }
          n = null;
        } else
          n = Dv(n, u);
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
      let o = nt.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof Rt ? t.push(o) : o?.isLine() ? n = o : o instanceof qn || (s.nodeName == "DIV" && !n ? n = new gs(s, vd) : n || t.push(Rt.of(new lo({ tagName: s.nodeName.toLowerCase(), attributes: iv(s) }), s)));
    }
    return n ? { line: n, marks: t } : null;
  }
}
function Fu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function Lv(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const vd = { class: "cm-line" };
function Dv(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && ya(t, i), n && (i.class += " " + n)), i;
}
function Bv(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Rt && e.push(n.mark);
  }
  return e;
}
function Jr(i) {
  let e = nt.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class ms extends ro {
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
ms.inline = /* @__PURE__ */ new ms("span");
ms.block = /* @__PURE__ */ new ms("div");
const Zr = /* @__PURE__ */ new class extends ro {
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
class _u {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Ze.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new Mr(e, e.contentDOM), this.updateInner([new en(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: d }) => d < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Wv(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Ev(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: d } = this.hasComposition;
      n = new en(c, d, e.changes.mapPos(c, -1), e.changes.mapPos(d, 1)).addToSet(n.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (re.ie || re.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Pv(r, this.decorations, e.changes);
    a.length && (n = en.extendWithRanges(n, a));
    let u = Vv(l, this.blockWrappers, e.changes);
    return u.length && (n = en.extendWithRanges(n, u)), o && !n.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (n = o.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new $v(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && nt.get(t.text) && l.cache.reused.set(
          nt.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), _l(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = re.chrome || re.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || n.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Qr && s.push(o.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(dd) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, o = s == n, r = !o && !(this.view.state.facet(Un) || n.tabIndex > -1) && zs(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), re.gecko && a.empty && !this.hasComposition && Ov(u)) {
      let h = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(h, u.node.childNodes[u.offset] || null)), u = c = new cn(h, 0), l = !0;
    }
    let d = this.view.observer.selectionRange;
    (l || !d.focusNode || (!Fs(u.node, u.offset, d.anchorNode, d.anchorOffset) || !Fs(c.node, c.offset, d.focusNode, d.focusOffset)) && !this.suppressWidgetCursorChange(d, a)) && (this.view.observer.ignore(() => {
      re.android && re.chrome && n.contains(d.focusNode) && Hv(d.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let h = Qs(this.view.root);
      if (h) if (a.empty) {
        if (re.gecko) {
          let p = Iv(u.node, u.offset);
          if (p && p != 3) {
            let g = (p == 1 ? Xh : Jh)(u.node, u.offset);
            g && (u = new cn(g.node, g.offset));
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
        let p = document.createRange();
        a.anchor > a.head && ([u, c] = [c, u]), p.setEnd(c.node, c.offset), p.setStart(u.node, u.offset), h.removeAllRanges(), h.addRange(p);
      }
      r && this.view.root.activeElement == n && (n.blur(), s && s.focus());
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new cn(d.anchorNode, d.anchorOffset), this.impreciseHead = c.precise ? null : new cn(d.focusNode, d.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Fs(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = Qs(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = Jn(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
      for (; o && !nt.get(o); )
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
    return s.isWidget() ? s.widget instanceof Qr ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, n);
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
        let l = bt(o.text, r);
        if (l == r)
          return null;
        let a = eo(o.dom, r, l).getClientRects();
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
    let t = [], { from: n, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Je.LTR, u = 0, c = (d, h, p) => {
      for (let g = 0; g < d.children.length && !(h > s); g++) {
        let b = d.children[g], k = h + b.length, M = b.dom.getBoundingClientRect(), { height: L } = M;
        if (p && !g && (u += M.top - p.top), b instanceof qn)
          k > n && c(b, h, M);
        else if (h >= n && (u > 0 && t.push(-u), t.push(L + u), u = 0, r)) {
          let T = b.dom.lastChild, F = T ? Uo(T) : [];
          if (F.length) {
            let B = F[F.length - 1], W = a ? B.right - M.left : M.right - B.left;
            W > l && (l = W, this.minWidth = o, this.minWidthFrom = h, this.minWidthTo = k);
          }
        }
        p && g == d.children.length - 1 && (u += p.bottom - M.bottom), h = k + b.breakAfter;
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
          let c = Uo(u.dom);
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
      let r = Uo(t.firstChild)[0];
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
          widget: new Qr(l),
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
    let e = 1, t = this.view.state.facet(Cr).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), n = !1, s = this.view.state.facet(Ca).map((o, r) => {
      let l = typeof o == "function";
      return l && (n = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = n, t.push(Ie.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(pd).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(hd))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        hn(this.view.state, c, "scroll handler");
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
    let o = Aa(this.view), r = {
      left: n.left - o.left,
      top: n.top - o.top,
      right: n.right + o.right,
      bottom: n.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (rv(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Je.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (n.top > window.visualViewport.offsetTop + window.visualViewport.height || n.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Gh(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), jh(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    _l(this.tile);
  }
}
function _l(i, e) {
  let t = e?.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      _l(n, e);
  }
}
function Ov(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function yd(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = Xh(t.focusNode, t.focusOffset), s = Jh(t.focusNode, t.focusOffset), o = n || s;
  if (s && n && s.node != n.node) {
    let l = nt.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (i.docView.lastCompositionAfterCursor) {
      let a = nt.get(n.node);
      !a || a.isText() && a.text != n.node.nodeValue || (o = s);
    }
  }
  if (i.docView.lastCompositionAfterCursor = o != n, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Ev(i, e, t) {
  let n = yd(i, t);
  if (!n)
    return null;
  let { node: s, from: o, to: r } = n, l = s.nodeValue;
  if (/[\n\r]/.test(l) || i.state.doc.sliceString(n.from, n.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new en(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Iv(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Rv = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ls(e, t, this.changes);
  }
  comparePoint(e, t) {
    ls(e, t, this.changes);
  }
  boundChange(e) {
    ls(e, e, this.changes);
  }
};
function Pv(i, e, t) {
  let n = new Rv();
  return Ie.compare(i, e, t, n), n.changes;
}
class Nv {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ls(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    ls(e, e, this.changes);
  }
}
function Vv(i, e, t) {
  let n = new Nv();
  return Ie.compare(i, e, t, n), n.changes;
}
function Hv(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Wv(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Qr extends ro {
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
function zv(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return X.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = bt(s.text, o, !1) : l = bt(s.text, o);
  let a = n(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = bt(s.text, r, !1);
    if (n(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = bt(s.text, l);
    if (n(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return X.undirectionalRange(r + s.from, l + s.from);
}
function Fv(i, e, t, n, s) {
  let o = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let l = i.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (i.defaultLineHeight - l) * 0.5) / l);
    o += a * i.viewState.heightOracle.lineLength;
  }
  let r = i.state.sliceDoc(t.from, t.to);
  return t.from + Jm(r, o, i.state.tabSize);
}
function Kl(i, e, t) {
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
function _v(i, e, t, n) {
  let s = Kl(i, e.head, e.assoc || -1), o = !n || s.type != gt.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
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
function Ku(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), o = i.bidiSpans(s), r = i.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = vv(s, o, r, l, t), c = nd;
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
function Kv(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (o) => {
    let r = n(o);
    return s == Gn.Space && (s = r), s == r;
  };
}
function Uv(i, e, t, n) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? i.state.doc.length : 0))
    return X.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = i.contentDOM.getBoundingClientRect(), u = i.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = i.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let g = i.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, i.defaultCharacterWidth * (s - g.from))), l = (o < 0 ? g.top : g.bottom) + c;
  }
  let d = a.left + r, h = i.viewState.heightOracle.textHeight >> 1, p = n ?? h;
  for (let g = 0; ; g += h) {
    let b = l + (p + g) * o, k = Ul(i, { x: d, y: b }, !1, o);
    if (t ? b > a.bottom : b < a.top)
      return X.cursor(k.pos, k.assoc);
    let M = i.coordsAtPos(k.pos, k.assoc), L = M ? (M.top + M.bottom) / 2 : 0;
    if (!M || (t ? L > l : L < l))
      return X.cursor(k.pos, k.assoc, void 0, r);
  }
}
function _s(i, e, t) {
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
function bd(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], o = null;
    if (s.empty) {
      let r = _s(i, s.from, 0);
      r != s.from && (o = X.cursor(r, -1));
    } else {
      let r = _s(i, s.from, -1), l = _s(i, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = X.undirectionalRange(s.from, s.to) : o = X.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[n] = o);
  }
  return t ? X.create(t, e.mainIndex) : e;
}
function el(i, e, t) {
  let n = _s(i.state.facet(uo).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : X.cursor(n, n < t.from ? 1 : -1);
}
class Ln {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function Ul(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), o = s.top + i.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new Ln(0, 1);
    if (a > i.viewState.docHeight)
      return new Ln(i.state.doc.length, -1);
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
      let d = Fv(i, s, u, r, l);
      return new Ln(d, d == u.from ? 1 : -1);
    }
  }
  if (u.type != gt.Text)
    return a < (u.top + u.bottom) / 2 ? new Ln(u.from, 1) : new Ln(u.to, -1);
  let c = i.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = i.docView.lineAt(u.from, -2)), new Gv(i, r, l, i.textDirectionAt(u.from)).scanTile(c, u.from);
}
class Gv {
  constructor(e, t, n, s) {
    this.view = e, this.x = t, this.y = n, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Dn.find(s, e - n.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: n, spans: s } = this.bidiSpansAt(e);
    return s[Dn.find(s, e - n.from, -1, t)].dir;
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
      let g = o - s, b = s + o >> 1;
      t: if (r.has(b)) {
        for (let L = 1; L < g; L++) {
          let T = b + L;
          if (T >= o && (T -= g), !r.has(T)) {
            b = T;
            break t;
          }
        }
        break e;
      }
      r.add(b);
      let k = t(b), M = 0;
      if (k)
        for (let L = 0; L < k.length; L++) {
          let T = k[L];
          if (!(T.width == 0 && k.length > 1))
            if (T.bottom < this.y)
              (!a || a.bottom < T.bottom) && (a = T), M = 1;
            else if (T.top > this.y)
              (!u || u.top > T.top) && (u = T), M = -1;
            else {
              let F = T.left > this.x ? this.x - T.left : T.right < this.x ? this.x - T.right : 0, B = Math.abs(F);
              B < d && (c = b, d = B, h = T), F && (M = F < 0 == (this.baseDir == Je.LTR) ? -1 : 1);
            }
        }
      M == -1 && (!l || this.baseDirAt(e[b], 1)) ? o = b : M == 1 && (!l || this.baseDirAt(e[b + 1], -1)) && (s = b + 1);
    }
    if (!h) {
      if (!u && !a)
        return { i: 0, after: !1 };
      let g = a && (!u || this.y - a.bottom < u.top - this.y) ? a : u;
      return this.y = (g.top + g.bottom) / 2, this.scan(e, t, !0);
    }
    if (d && !n) {
      let { top: g, bottom: b } = h;
      if (a && a.bottom > (g + g + b) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (u && u.top < (g + b + b) / 3)
        return this.y = u.top + 1, this.scan(e, t, !0);
    }
    let p = (l ? this.dirAt(e[c], 1) : this.baseDir) == Je.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (h.left + h.right) / 2 == p
    };
  }
  scanText(e, t) {
    let n = [];
    for (let o = 0; o < e.length; o = bt(e.text, o))
      n.push(t + o);
    n.push(t + e.length);
    let s = this.scan(n, (o) => {
      let r = n[o] - t, l = n[o + 1] - t;
      return eo(e.dom, r, l).getClientRects();
    });
    return s.after ? new Ln(n[s.i + 1], -1) : new Ln(n[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new Ln(t, 1);
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : eo(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = n[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new Ln(n[s.i + 1], -1) : new Ln(r, 1);
  }
}
const Qi = "￿";
class jv {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(_e.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Qi;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(n, s);
      let o = this.text.length;
      this.readNode(s);
      let r = nt.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = nt.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : nr(s)) || nr(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !Yv(l, t) && this.lineBreak(), s = l;
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
    let t = nt.get(e), n = t && t.overrideDOMText;
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
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (qv(e, n.node, n.offset) ? t : 0));
  }
}
function qv(i, e, t) {
  for (; ; ) {
    if (!e || t < Jn(e))
      return !1;
    if (e == i)
      return !0;
    t = vi(e) + 1, e = e.parentNode;
  }
}
function Yv(i, e) {
  let t;
  for (; !(i == e || !i); i = i.nextSibling) {
    let n = nt.get(i);
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
class Uu {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Xv {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = kd(e.docView.tile, t, n, 0))) {
      let a = o || r ? [] : Zv(e), u = new jv(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = Qv(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Vl(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Vl(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), d = e.viewport;
      if ((re.ios || re.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (d.from > 0 || d.to < e.state.doc.length)) {
        let h = Math.min(u, c), p = Math.max(u, c), g = d.from - h, b = d.to - p;
        (g == 0 || g == 1 || h == 0) && (b == 0 || b == -1 || p == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(X.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let h = e.coordsAtPos(u, -1), p = 0;
        h && (p = e.inputState.lastTouchY <= h.bottom ? -1 : 1), this.newSel = X.create([X.cursor(u, p)]);
      } else
        this.newSel = X.single(c, u);
    }
  }
}
function kd(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = n, c = n; a < i.children.length; a++) {
      let d = i.children[a], h = u + d.length;
      if (u < e && h > t)
        return kd(d, e, t, u);
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
function wd(i, e) {
  let t, { newSel: n } = e, { state: s } = i, o = s.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || re.android && e.text.length < a - l) && (u = o.to, c = "end");
    let d = s.doc.sliceString(l, a, Qi), h, p;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || d != e.text) && d.slice(0, o.from - l) == e.text.slice(0, o.from - l) && d.slice(o.to - l) == e.text.slice(h = e.text.length - (d.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: ze.of(e.text.slice(o.from - l, h).split(Qi))
    } : (p = xd(d, e.text, u - l, c)) && (re.chrome && r == 13 && p.toB == p.from + 2 && e.text.slice(p.from, p.toB) == Qi + Qi && p.toB--, t = {
      from: l + p.from,
      to: l + p.toA,
      insert: ze.of(e.text.slice(p.from, p.toB).split(Qi))
    });
  } else n && (!i.hasFocus && s.facet(Un) || lr(n, o)) && (n = null);
  if (!t && !n)
    return !1;
  if ((re.mac || re.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = X.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: ze.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && i.docView.lineHasWidget(o.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(i.inputState.insertingText)
  } : re.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = X.single(n.main.anchor - 1, n.main.head - 1)), t = { from: o.from, to: o.to, insert: ze.of([" "]) }), t)
    return Ma(i, t, n, r);
  if (n && !lr(n, o)) {
    let l = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (l = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = bd(s.facet(uo).map((u) => u(i)), n))), i.dispatch({ selection: n, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function Ma(i, e, t, n = -1) {
  if (re.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (re.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && as(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && as(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && as(i.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let r, l = () => r || (r = Jv(i, e, t));
  return i.state.facet(ld).some((a) => a(i, e.from, e.to, o, l)) || i.dispatch(l()), !0;
}
function Jv(i, e, t) {
  let n, s = i.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = _s(s.facet(uo).map((d) => d(i)), u, a);
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
      let c = i.state.sliceDoc(e.from, e.to), d, h = t && yd(i, t.main.head);
      if (h) {
        let g = e.insert.length - (e.to - e.from);
        d = { from: h.from, to: h.to - g };
      } else
        d = i.state.doc.lineAt(o.head);
      let p = o.to - e.to;
      n = s.changeByRange((g) => {
        if (g.from == o.from && g.to == o.to)
          return { changes: a, range: u || g.map(a) };
        let b = g.to - p, k = b - c.length;
        if (i.state.sliceDoc(k, b) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        b >= d.from && k <= d.to)
          return { range: g };
        let M = s.changes({ from: k, to: b, insert: e.insert }), L = g.to - o.to;
        return {
          changes: M,
          range: u ? X.range(Math.max(0, u.anchor + L), Math.max(0, u.head + L)) : g.map(M)
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
function xd(i, e, t, n) {
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
function Zv(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o } = i.observer.selectionRange;
  return t && (e.push(new Uu(t, n)), (s != t || o != n) && e.push(new Uu(s, o))), e;
}
function Qv(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t < 0 || n < 0 ? null : t == n ? X.create([X.cursor(n + e, -1)]) : X.single(t + e, n + e);
}
function lr(i, e) {
  return e.head == i.main.head && e.anchor == i.main.anchor;
}
class ey {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, re.safari && e.contentDOM.addEventListener("input", () => null), re.gecko && my(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !uy(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = ny(e), n = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Cd.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), re.android && re.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (re.ios && !e.synthetic && !e.altKey && !e.metaKey && (Sd.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || iy.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && re.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && ty(this.view.win) && (t.shiftKey = !1);
      let n = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == n && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, as(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : re.safari && !re.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
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
function ty(i) {
  return i.visualViewport ? i.visualViewport.height * i.visualViewport.scale / i.document.documentElement.clientHeight < 0.85 : !1;
}
function Gu(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      hn(t.state, s);
    }
  };
}
function ny(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Gu(n.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Gu(n.value, a));
      }
  }
  for (let n in pn)
    t(n).handlers.push(pn[n]);
  for (let n in Lt)
    t(n).observers.push(Lt[n]);
  return e;
}
const Sd = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], iy = "dthko", Cd = [16, 17, 18, 20, 91, 92, 224, 225], wo = 6;
function xo(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function sy(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class oy {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Uh(e.contentDOM), this.atoms = e.state.facet(uo).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(_e.allowMultipleSelections) && ry(e, t), this.dragging = ay(e, t) && Td(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && sy(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = Aa(this.view);
    e.clientX - a.left <= s + wo ? t = -xo(s - e.clientX) : e.clientX + a.right >= r - wo && (t = xo(e.clientX - r)), e.clientY - a.top <= o + wo ? n = -xo(o - e.clientY) : e.clientY + a.bottom >= l - wo && (n = xo(e.clientY - l)), this.setScrollSpeed(t, n);
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
    let { view: t } = this, n = bd(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function ry(i, e) {
  let t = i.state.facet(id);
  return t.length ? t[0](e) : re.mac ? e.metaKey : e.ctrlKey;
}
function ly(i, e) {
  let t = i.state.facet(sd);
  return t.length ? t[0](e) : re.mac ? !e.altKey : !e.ctrlKey;
}
function ay(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = Qs(i.root);
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
function uy(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = nt.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const pn = /* @__PURE__ */ Object.create(null), Lt = /* @__PURE__ */ Object.create(null), Ad = re.ie && re.ie_version < 15 || re.ios && re.webkit_version < 604;
function cy(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), Md(i, t.value);
  }, 50);
}
function Tr(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function Md(i, e) {
  e = Tr(i.state, wa, e);
  let { state: t } = i, n, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Gl != null && t.selection.ranges.every((a) => a.empty) && Gl == o.toString()) {
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
Lt.scroll = (i) => {
  let e = i.inputState;
  e.lastScrollTop = i.scrollDOM.scrollTop, e.lastScrollLeft = i.scrollDOM.scrollLeft, re.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Lt.wheel = Lt.mousewheel = (i) => {
  i.inputState.lastWheelEvent = Date.now();
};
pn.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
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
pn.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(od))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = dy(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new oy(i, e, t, n)), n && i.observer.ignore(() => {
      qh(i.contentDOM);
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
function ju(i, e, t, n) {
  if (n == 1)
    return X.cursor(e, t);
  if (n == 2)
    return zv(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), o = i.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < i.state.doc.length && l == o.to && l++, X.undirectionalRange(r, l);
  }
}
const hy = re.ie && re.ie_version <= 11;
let qu = null, Yu = 0, Xu = 0;
function Td(i) {
  if (!hy)
    return i.detail;
  let e = qu, t = Xu;
  return qu = i, Xu = Date.now(), Yu = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Yu + 1) % 3 : 1;
}
function dy(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = Td(e), s = i.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = i.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = ju(i, a.pos, a.assoc, n);
      if (t.pos != a.pos && !r) {
        let d = ju(i, t.pos, t.assoc, n), h = Math.min(d.from, c.from), p = Math.max(d.to, c.to);
        c = h < c.from ? X.range(h, p, c.assoc) : X.range(p, h, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && n == 1 && s.ranges.length > 1 && (u = fy(s, a.pos)) ? u : l ? s.addRange(c) : X.create([c]);
    }
  };
}
function fy(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return X.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
pn.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = X.undirectionalRange(o, r));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", Tr(i.state, xa, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
pn.dragend = (i) => (i.inputState.draggedContent = null, !1);
function Ju(i, e, t, n) {
  if (t = Tr(i.state, wa, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = i.inputState, r = n && o && ly(i, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = i.state.changes(r ? [r, l] : l);
  i.focus(), i.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), i.inputState.draggedContent = null;
}
pn.drop = (i, e) => {
  if (!e.dataTransfer)
    return !1;
  if (i.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), s = 0, o = () => {
      ++s == t.length && Ju(i, e, n.filter((r) => r != null).join(i.state.lineBreak), !1);
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
      return Ju(i, e, n, !0), !0;
  }
  return !1;
};
pn.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = Ad ? null : e.clipboardData;
  return t ? (Md(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (cy(i), !1);
};
function py(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function gy(i) {
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
  return { text: Tr(i, xa, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let Gl = null;
pn.copy = pn.cut = (i, e) => {
  if (!zs(i.contentDOM, i.observer.selectionRange))
    return !1;
  let { text: t, ranges: n, linewise: s } = gy(i.state);
  if (!t && !s)
    return !1;
  Gl = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = Ad ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (py(i, t), !1);
};
const $d = /* @__PURE__ */ Ss.define();
function Ld(i, e) {
  let t = [];
  for (let n of i.facet(ad)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: $d.of(!0) }) : null;
}
function Dd(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = Ld(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
Lt.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), Dd(i);
};
Lt.blur = (i) => {
  i.observer.clearSelectionRange(), Dd(i);
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
  i.observer.editContext || (i.inputState.composing = -1, i.inputState.compositionEndedAt = Date.now(), i.inputState.compositionPendingKey = !0, i.inputState.compositionPendingChange = i.observer.pendingRecords().length > 0, i.inputState.compositionFirstChange = null, re.chrome && re.android ? i.observer.flushSoon() : i.inputState.compositionPendingChange ? Promise.resolve().then(() => i.observer.flush()) : setTimeout(() => {
    i.inputState.composing < 0 && i.docView.hasComposition && i.update([]);
  }, 50));
};
Lt.contextmenu = (i) => {
  i.inputState.lastContextMenu = Date.now();
};
pn.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = i.posAtDOM(l.startContainer, l.startOffset), u = i.posAtDOM(l.endContainer, l.endOffset);
      return Ma(i, { from: a, to: u, insert: i.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (re.chrome && re.android && (s = Sd.find((o) => o.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return re.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), re.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => Lt.compositionend(i, e), 20), !1;
};
const Zu = /* @__PURE__ */ new Set();
function my(i) {
  Zu.has(i) || (Zu.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Qu = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let vs = !1;
function ec() {
  vs = !1;
}
class vy {
  constructor(e) {
    this.lineWrapping = e, this.doc = ze.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
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
    return Qu.indexOf(e) > -1 != this.lineWrapping;
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
    let l = Qu.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class yy {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class un {
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
    return this._content instanceof zi ? this._content.widget : null;
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
    return new un(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var Ye = /* @__PURE__ */ (function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
})(Ye || (Ye = {}));
const Go = 1e-3;
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
    this.height != e && (Math.abs(this.height - e) > Go && (vs = !0), this.height = e);
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
      let { fromA: a, toA: u, fromB: c, toB: d } = s[l], h = o.lineAt(a, Ye.ByPosNoHeight, n.setDoc(t), 0, 0), p = h.to >= u ? h : o.lineAt(u, Ye.ByPosNoHeight, n, 0, 0);
      for (d += p.to - u, u = p.to; l > 0 && h.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < h.from && (h = o.lineAt(a, Ye.ByPosNoHeight, n, 0, 0));
      c += h.from - a, a = h.from;
      let g = Ta.build(n.setDoc(r), e, c, d);
      o = ar(o, o.replace(a, u, g));
    }
    return o.updateHeight(n, 0);
  }
  static empty() {
    return new Ut(0, 0, 0);
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, n++), new ky($t.of(e.slice(0, t)), r, $t.of(e.slice(n)));
  }
}
function ar(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (vs = !0), e);
}
$t.prototype.size = 1;
const by = /* @__PURE__ */ Ze.replace({});
class Bd extends $t {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new un(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new un(s, 0, n, this.spaceAbove, by) : this.mainBlock(n, s);
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
class Ut extends Bd {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new un(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let s = n[0];
    return n.length == 1 && (s instanceof Ut || s instanceof ft && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof ft ? s = new Ut(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : $t.of(n);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class ft extends $t {
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
      return new un(c.from, c.length, h, d, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - n) / l))), { from: c, length: d } = t.doc.line(o + u);
      return new un(c, d, n + l * u, l, 0);
    }
  }
  lineAt(e, t, n, s, o) {
    if (t == Ye.ByHeight)
      return this.blockAt(e, n, s, o);
    if (t == Ye.ByPosNoHeight) {
      let { from: p, to: g } = n.doc.lineAt(e);
      return new un(p, g - p, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(n, o), u = n.doc.lineAt(e), c = l + u.length * a, d = u.number - r, h = s + l * d + a * (u.from - o - d);
    return new un(u.from, u.length, Math.max(s, Math.min(h, s + this.height - c)), c, 0);
  }
  forEachLine(e, t, n, s, o, r) {
    e = Math.max(e, o), t = Math.min(t, o + this.length);
    let { firstLine: l, perLine: a, perChar: u } = this.heightMetrics(n, o);
    for (let c = e, d = s; c <= t; ) {
      let h = n.doc.lineAt(c);
      if (c == e) {
        let g = h.number - l;
        d += a * g + u * (e - o - g);
      }
      let p = a + u * h.length;
      r(new un(h.from, h.length, d, p, 0)), d += p, c = h.to + 1;
    }
  }
  replace(e, t, n) {
    let s = this.length - t;
    if (s > 0) {
      let o = n[n.length - 1];
      o instanceof ft ? n[n.length - 1] = new ft(o.length + s) : n.push(null, new ft(s - 1));
    }
    if (e > 0) {
      let o = n[0];
      o instanceof ft ? n[0] = new ft(e + o.length) : n.unshift(new ft(e - 1), null);
    }
    return $t.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new ft(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new ft(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new ft(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let d = s.heights[s.index++], h = 0;
        d < 0 && (h = -d, d = s.heights[s.index++]), a == -1 ? a = d : Math.abs(d - a) >= Go && (a = -2);
        let p = new Ut(c, d, h);
        p.outdated = !1, r.push(p), l += c + 1;
      }
      l <= o && r.push(null, new ft(o - l).updateHeight(e, l));
      let u = $t.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= Go || Math.abs(a - this.heightMetrics(e, t).perLine) >= Go) && (vs = !0), ar(this, u);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class ky extends $t {
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
    if (e > 0 && tc(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), tc(o, l);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? $t.of(this.break ? [e, null, t] : [e, t]) : (this.left = ar(this.left, e), this.right = ar(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, n, s) : o.updateHeight(e, t, n), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, n, s) : r.updateHeight(e, l, n), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function tc(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof ft && (n = i[e + 1]) instanceof ft && i.splice(e - 1, 3, new ft(t.length + 1 + n.length));
}
const wy = 5;
class Ta {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof Ut ? s.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new Ut(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let s = n.widget ? n.widget.estimatedHeight : 0, o = n.widget ? n.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      n.block ? this.addBlock(new Bd(r, s, n)) : (r || o || s >= wy) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Ut(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new ft(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Ut)
      return e;
    let t = new Ut(0, -1, 0);
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
    this.lineStart > -1 && !(t instanceof Ut) && !this.isCovered ? this.nodes.push(new Ut(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let s of this.nodes)
      s instanceof Ut && s.updateHeight(this.oracle, n), n += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, s) {
    let o = new Ta(n, e);
    return Ie.spans(t, n, s, o, 0), o.finish(n);
  }
}
function xy(i, e, t) {
  let n = new Sy();
  return Ie.compare(i, e, t, n, 0), n.changes;
}
class Sy {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && ls(e, t, this.changes, 5);
  }
}
function Cy(i, e) {
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
function Ay(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function My(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class tl {
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
      widget: new Ty(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Ty extends ro {
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
class nc {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = ic, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Je.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let n = t.facet(Sa).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new vy(n), this.stateDeco = sc(t), this.heightMap = $t.empty().applyChanges(this.stateDeco, ze.empty, this.heightOracle.setDoc(t.doc), [new en(0, 0, 0, t.doc.length)]);
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
        e.push(new So(o, r));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? ic : new $a(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Vs(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = sc(this.state);
    let s = e.changedRanges, o = en.extendWithRanges(s, xy(n, this.stateDeco, e ? e.changes : ht.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    ec(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || vs) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(cd) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, o = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? Je.RTL : Je.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: B, scaleY: W } = Kh(t, l);
      (B > 5e-3 && Math.abs(this.scaleX - B) > 5e-3 || W > 5e-3 && Math.abs(this.scaleY - W) > 5e-3) && (this.scaleX = B, this.scaleY = W, u |= 16, r = a = !0);
    }
    let d = (parseInt(n.paddingTop) || 0) * this.scaleY, h = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != d || this.paddingBottom != h) && (this.paddingTop = d, this.paddingBottom = h, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let p = Uh(this.view.contentDOM, !1).y;
    p != this.scrollParent && (this.scrollParent = p, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let g = this.getScrollOffset();
    this.scrollOffset != g && (this.scrollAnchorHeight = -1, this.scrollOffset = g), this.scrolledToBottom = Yh(this.scrollParent || e.win);
    let b = (this.printing ? My : Cy)(t, this.paddingTop), k = b.top - this.pixelViewport.top, M = b.bottom - this.pixelViewport.bottom;
    this.pixelViewport = b;
    let L = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (L != this.inView && (this.inView = L, L && (a = !0)), !this.inView && !this.scrollTarget && !Ay(e.dom))
      return 0;
    let T = l.width;
    if ((this.contentDOMWidth != T || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let B = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(B) && (r = !0), r || s.lineWrapping && Math.abs(T - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: W, charWidth: N, textHeight: j } = e.docView.measureTextSize();
        r = W > 0 && s.refresh(o, W, N, j, Math.max(5, T / N), B), r && (e.docView.minWidth = 0, u |= 16);
      }
      k > 0 && M > 0 ? c = Math.max(k, M) : k < 0 && M < 0 && (c = Math.min(k, M)), ec();
      for (let W of this.viewports) {
        let N = W.from == this.viewport.from ? B : e.docView.measureVisibleLineHeights(W);
        this.heightMap = (r ? $t.empty().applyChanges(this.stateDeco, ze.empty, this.heightOracle, [new en(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new yy(W.from, N));
      }
      vs && (u |= 2);
    }
    let F = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return F && (u & 2 && (u |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), u |= this.updateForViewport()), (u & 2 || F) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(r ? [] : this.lineGaps, e)), u |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), u;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new So(s.lineAt(r - n * 1e3, Ye.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - n) * 1e3, Ye.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), d = s.lineAt(u, Ye.ByPos, o, 0, 0), h;
        t.y == "center" ? h = (d.top + d.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? h = d.top : h = d.bottom - c, a = new So(s.lineAt(h - 1e3 / 2, Ye.ByHeight, o, 0, 0).from, s.lineAt(h + c + 1e3 / 2, Ye.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new So(this.heightMap.lineAt(n, Ye.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, Ye.ByPos, this.heightOracle, 0, 0).to);
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
      t.touchesRange(s.from, s.to) || n.push(new tl(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
    let l = [], a = (c, d, h, p) => {
      if (d - c < o)
        return;
      let g = this.state.selection.main, b = [g.from];
      g.empty || b.push(g.to);
      for (let M of b)
        if (M > c && M < d) {
          a(c, M - 10, h, p), a(M + 10, d, h, p);
          return;
        }
      let k = Ly(e, (M) => M.from >= h.from && M.to <= h.to && Math.abs(M.from - c) < o && Math.abs(M.to - d) < o && !b.some((L) => M.from < L && M.to > L));
      if (!k) {
        if (d < h.to && t && n && t.visibleRanges.some((T) => T.from <= d && T.to >= d)) {
          let T = t.moveToLineBoundary(X.cursor(d), !1, !0).head;
          T > c && (d = T);
        }
        let M = this.gapSize(h, c, d, p), L = n || M < 2e6 ? M : 2e6;
        k = new tl(c, d, M, L);
      }
      l.push(k);
    }, u = (c) => {
      if (c.length < r || c.type != gt.Text)
        return;
      let d = $y(c.from, c.to, this.stateDeco);
      if (d.total < r)
        return;
      let h = this.scrollTarget ? this.scrollTarget.range.head : null, p, g;
      if (n) {
        let b = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, k, M;
        if (h != null) {
          let L = Ao(d, h), T = ((this.visibleBottom - this.visibleTop) / 2 + b) / c.height;
          k = L - T, M = L + T;
        } else
          k = (this.visibleTop - c.top - b) / c.height, M = (this.visibleBottom - c.top + b) / c.height;
        p = Co(d, k), g = Co(d, M);
      } else {
        let b = d.total * this.heightOracle.charWidth, k = s * this.heightOracle.charWidth, M = 0;
        if (b > 2e6)
          for (let W of e)
            W.from >= c.from && W.from < c.to && W.size != W.displaySize && W.from * this.heightOracle.charWidth + M < this.pixelViewport.left && (M = W.size - W.displaySize);
        let L = this.pixelViewport.left + M, T = this.pixelViewport.right + M, F, B;
        if (h != null) {
          let W = Ao(d, h), N = ((T - L) / 2 + k) / b;
          F = W - N, B = W + N;
        } else
          F = (L - k) / b, B = (T + k) / b;
        p = Co(d, F), g = Co(d, B);
      }
      p > c.from && a(c.from, p, c, d), g < c.to && a(g, c.to, c, d);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, n, s) {
    let o = Ao(s, n) - Ao(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    tl.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Ze.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    Ie.spans(t, this.viewport.from, this.viewport.to, {
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Vs(this.heightMap.lineAt(e, Ye.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Vs(this.heightMap.lineAt(this.scaler.fromDOM(e), Ye.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Vs(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class So {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function $y(i, e, t) {
  let n = [], s = i, o = 0;
  return Ie.spans(t, i, e, {
    span() {
    },
    point(r, l) {
      r > s && (n.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), o += e - s), { total: o, ranges: n };
}
function Co({ total: i, ranges: e }, t) {
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
function Ao(i, e) {
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
function Ly(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const ic = {
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
function sc(i) {
  let e = i.facet(Cr).filter((n) => typeof n != "function"), t = i.facet(Ca).filter((n) => typeof n != "function");
  return t.length && e.push(Ie.join(t)), e;
}
class $a {
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
    return e instanceof $a ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Vs(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new un(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Vs(s, e)) : i._content);
}
const Mo = /* @__PURE__ */ de.define({ combine: (i) => i.join(" ") }), jl = /* @__PURE__ */ de.define({ combine: (i) => i.indexOf(!0) > -1 }), ql = /* @__PURE__ */ gi.newName(), Od = /* @__PURE__ */ gi.newName(), Ed = /* @__PURE__ */ gi.newName(), Id = { "&light": "." + Od, "&dark": "." + Ed };
function Yl(i, e, t) {
  return new gi(e, {
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
const Dy = /* @__PURE__ */ Yl("." + ql, {
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
}, Id), By = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, nl = re.ie && re.ie_version <= 11;
class Oy {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new lv(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (re.ie && re.ie_version <= 11 || re.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && re.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(re.chrome && re.chrome_version < 126) && (this.editContext = new Iy(e), e.state.facet(Un) && (e.contentDOM.editContext = this.editContext.editContext)), nl && (this.onCharData = (t) => {
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
    if (n.state.facet(Un) ? n.root.activeElement != this.dom : !zs(this.dom, s))
      return;
    let o = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (re.ie && re.ie_version <= 11 || re.android && re.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Fs(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = Qs(e.root);
    if (!t)
      return !1;
    let n = re.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Ey(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = zs(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && uv(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, By), nl && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), nl && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && as(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && zs(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Xv(this.view, e, t, n);
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
    let n = this.view.state, s = wd(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !lr(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = oc(t, e.previousSibling || e.target.previousSibling, -1), s = oc(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(Un) != e.state.facet(Un) && (e.view.contentDOM.editContext = e.state.facet(Un) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function oc(i, e, t) {
  for (; e; ) {
    let n = nt.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function rc(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, o = e.endOffset, r = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Fs(r.node, r.offset, s, o) && ([t, n, s, o] = [s, o, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: o };
}
function Ey(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return rc(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? rc(i, t) : null;
}
class Iy {
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
      let c = xd(e.state.sliceDoc(l, a), n.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let h = X.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        lr(h, s) || e.dispatch({ selection: h, userEvent: "select" });
        return;
      }
      let d = {
        from: c.from + l,
        to: c.toA + l,
        insert: ze.of(n.text.slice(c.from, c.toB).split(`
`))
      };
      if ((re.mac || re.android) && d.from == r - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (d = { from: l, to: a, insert: ze.of([n.text.replace(".", " ")]) }), this.pendingContextChange = d, !e.state.readOnly) {
        let h = this.to - this.from + (d.to - d.from + d.insert.length);
        Ma(e, d, X.single(this.toEditorPos(n.selectionStart, h), this.toEditorPos(n.selectionEnd, h)));
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
      e.dispatch({ effects: dd.of(Ze.set(s)) });
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
      let s = Qs(n.root);
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
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((o) => n(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || av(e.parent) || document, this.viewState = new nc(this, e.state || _e.create(e)), e.scrollTo && e.scrollTo.is(ko) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(ts).map((s) => new Xr(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Oy(this), this.inputState = new ey(this), this.inputState.ensureHandlers(this.plugins), this.docView = new _u(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof kt ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
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
    e.some((h) => h.annotation($d)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = Ld(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(_e.phrases) != this.state.facet(_e.phrases))
      return this.setState(o);
    s = sr.create(this, o, e), s.flags |= l;
    let d = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let h of e) {
        if (d && (d = d.map(h.changes)), h.scrollIntoView) {
          let { main: p } = h.state.selection, { x: g, y: b } = this.state.facet(me.cursorScrollMargin);
          d = new us(p.empty ? p : X.cursor(p.head, p.head > p.anchor ? -1 : 1), "nearest", "nearest", b, g);
        }
        for (let p of h.effects)
          p.is(ko) && (d = p.value.clip(this.state));
      }
      this.viewState.update(s, d), this.bidiCache = ur.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Ns) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((h) => h.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Mo) != s.state.facet(Mo) && (this.viewState.mustMeasureContent = !0), (t || n || d || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let h of this.state.facet(Fl))
        try {
          h(s);
        } catch (p) {
          hn(this.state, p, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !wd(this, c) && u.force && as(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new nc(this, e), this.plugins = e.facet(ts).map((n) => new Xr(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new _u(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(ts), n = e.state.facet(ts);
    if (t != n) {
      let s = [];
      for (let o of n) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new Xr(o));
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
          hn(this.state, n, "doc view update listener");
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
          if (Yh(n || this.win))
            o = -1, r = this.viewState.heightMap.height / this.viewState.scaleY;
          else {
            let g = this.viewState.scrollAnchorAt(s);
            o = g.from, r = g.top;
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
        let d = c.map((g) => {
          try {
            return g.read(this);
          } catch (b) {
            return hn(this.state, b), lc;
          }
        }), h = sr.create(this, this.state, []), p = !1;
        h.flags |= u, t ? t.flags |= u : t = h, this.updateState = 2, h.empty || (this.updatePlugins(h), this.inputState.update(h), this.updateAttrs(), p = this.docView.update(h), p && this.docViewUpdate());
        for (let g = 0; g < c.length; g++)
          if (d[g] != lc)
            try {
              let b = c[g];
              b.write && b.write(d[g], this);
            } catch (b) {
              hn(this.state, b);
            }
        if (p && this.docView.updateSelection(!0), !h.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, r = -1;
              continue;
            } else {
              let b = (o < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(o).top) / this.viewState.scaleY - r / l;
              if ((b > 1 || b < -1) && !(re.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (n == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                s = s + b, n ? o < 0 ? n.scrollTop = n.scrollHeight : n.scrollTop += b : this.win.scrollBy(0, b), r = -1;
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
      for (let a of this.state.facet(Fl))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return ql + " " + (this.state.facet(jl) ? Ed : Od) + " " + this.state.facet(Mo);
  }
  updateAttrs() {
    let e = ac(this, fd, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(Un) ? "true" : "false",
      class: "cm-content",
      style: `${re.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), ac(this, Sa, t);
    let n = this.observer.ignore(() => {
      let s = Nu(this.contentDOM, this.contentAttrs, t), o = Nu(this.dom, this.editorAttrs, e);
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
    this.styleModules = this.state.facet(Ns);
    let e = this.state.facet(me.cspNonce);
    gi.mount(this.root, this.styleModules.concat(Dy).reverse(), e ? { nonce: e } : void 0);
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
    return el(this, e, Ku(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return el(this, e, Ku(this, e, t, (n) => Kv(this, e.head, n)));
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
    return _v(this, e, t, n);
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
    return el(this, e, Uv(this, e, t, n));
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
    let n = Ul(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), Ul(this, e, t);
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
    let n = this.state.doc.lineAt(e), s = this.bidiSpans(n), o = s[Dn.find(s, e - n.from, -1, t)];
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
    return !this.state.facet(ud) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > Ry)
      return td(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || ed(o.isolates, n = Wu(this, e))))
        return o.order;
    n || (n = Wu(this, e));
    let s = mv(e.text, t, n);
    return this.bidiCache.push(new ur(e.from, e.to, t, n, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || re.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      qh(this.contentDOM), this.docView.updateSelection();
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
    return ko.of(new us(typeof e == "number" ? X.cursor(e) : e, (n = t.y) !== null && n !== void 0 ? n : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return ko.of(new us(X.cursor(n.from), "start", "start", n.top - e, t, !0));
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
    return Gt.define(() => ({}), { eventHandlers: e });
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
    return Gt.define(() => ({}), { eventObservers: e });
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
    let n = gi.newName(), s = [Mo.of(n), Ns.of(Yl(`.${n}`, e))];
    return t && t.dark && s.push(jl.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return br.lowest(Ns.of(Yl("." + ql, e, Id)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), s = n && nt.get(n) || nt.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
me.styleModule = Ns;
me.inputHandler = ld;
me.clipboardInputFilter = wa;
me.clipboardOutputFilter = xa;
me.scrollHandler = hd;
me.focusChangeEffect = ad;
me.perLineTextDirection = ud;
me.exceptionSink = rd;
me.updateListener = Fl;
me.editable = Un;
me.mouseSelectionStyle = od;
me.dragMovesSelection = sd;
me.clickAddsSelectionRange = id;
me.decorations = Cr;
me.blockWrappers = pd;
me.outerDecorations = Ca;
me.atomicRanges = uo;
me.bidiIsolatedRanges = gd;
me.cursorScrollMargin = /* @__PURE__ */ de.define({
  combine: (i) => {
    let e = 5, t = 5;
    for (let n of i)
      typeof n == "number" ? e = t = n : { x: e, y: t } = n;
    return { x: e, y: t };
  }
});
me.scrollMargins = md;
me.darkTheme = jl;
me.cspNonce = /* @__PURE__ */ de.define({ combine: (i) => i.length ? i[0] : "" });
me.contentAttributes = Sa;
me.editorAttributes = fd;
me.lineWrapping = /* @__PURE__ */ me.contentAttributes.of({ class: "cm-lineWrapping" });
me.announce = /* @__PURE__ */ Xe.define();
const Ry = 4096, lc = {};
class ur {
  constructor(e, t, n, s, o, r) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : Je.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && n.push(new ur(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return n;
  }
}
function ac(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let o = n[s], r = typeof o == "function" ? o(i) : o;
    r && ya(r, t);
  }
  return t;
}
const Py = re.mac ? "mac" : re.windows ? "win" : re.linux ? "linux" : "key";
function Ny(i, e) {
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
function To(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const Vy = /* @__PURE__ */ br.default(/* @__PURE__ */ me.domEventHandlers({
  keydown(i, e) {
    return Fy(Hy(e.state), i, e, "editor");
  }
})), Rd = /* @__PURE__ */ de.define({ enables: Vy }), uc = /* @__PURE__ */ new WeakMap();
function Hy(i) {
  let e = i.facet(Rd), t = uc.get(e);
  return t || uc.set(e, t = zy(e.reduce((n, s) => n.concat(s), []))), t;
}
let hi = null;
const Wy = 4e3;
function zy(i, e = Py) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = n[r];
    if (a == null)
      n[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var d, h;
    let p = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), g = l.split(/ (?!$)/).map((M) => Ny(M, e));
    for (let M = 1; M < g.length; M++) {
      let L = g.slice(0, M).join(" ");
      s(L, !0), p[L] || (p[L] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(T) => {
          let F = hi = { view: T, prefix: L, scope: r };
          return setTimeout(() => {
            hi == F && (hi = null);
          }, Wy), !0;
        }]
      });
    }
    let b = g.join(" ");
    s(b, !1);
    let k = p[b] || (p[b] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((h = (d = p._any) === null || d === void 0 ? void 0 : d.run) === null || h === void 0 ? void 0 : h.slice()) || []
    });
    a && k.run.push(a), u && (k.preventDefault = !0), c && (k.stopPropagation = !0);
  };
  for (let r of i) {
    let l = r.scope ? r.scope.split(" ") : ["editor"];
    if (r.any)
      for (let u of l) {
        let c = t[u] || (t[u] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: d } = r;
        for (let h in c)
          c[h].run.push((p) => d(p, Xl));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Xl = null;
function Fy(i, e, t, n) {
  Xl = e;
  let s = tv(e), o = Nm(s, 0), r = Vm(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  hi && hi.view == t && hi.scope == n && (l = hi.prefix + " ", Cd.indexOf(e.keyCode) < 0 && (u = !0, hi = null));
  let d = /* @__PURE__ */ new Set(), h = (k) => {
    if (k) {
      for (let M of k.run)
        if (!d.has(M) && (d.add(M), M(t)))
          return k.stopPropagation && (c = !0), !0;
      k.preventDefault && (k.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, p = i[n], g, b;
  return p && (h(p[l + To(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(re.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(re.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (g = mi[e.keyCode]) && g != s ? (h(p[l + To(g, e, !0)]) || e.shiftKey && (b = Js[e.keyCode]) != s && b != g && h(p[l + To(b, e, !1)])) && (a = !0) : r && e.shiftKey && h(p[l + To(s, e, !0)]) && (a = !0), !a && h(p._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Xl = null, a;
}
class Vi {
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
      let o = Pd(e);
      return [new Vi(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return _y(e, t, n);
  }
}
function Pd(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == Je.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function cc(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let o = i.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = i.posAtCoords({ x: o.left + 1, y: r }), a = i.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? n : { from: Math.max(n.from, Math.min(l, a)), to: Math.min(n.to, Math.max(l, a)) };
}
function _y(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), o = i.textDirection == Je.LTR, r = i.contentDOM, l = r.getBoundingClientRect(), a = Pd(i), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), d = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), h = l.right - (c ? parseInt(c.paddingRight) : 0), p = Kl(i, n, 1), g = Kl(i, s, -1), b = p.type == gt.Text ? p : null, k = g.type == gt.Text ? g : null;
  if (b && (i.lineWrapping || p.widgetLineBreaks) && (b = cc(i, n, 1, b)), k && (i.lineWrapping || g.widgetLineBreaks) && (k = cc(i, s, -1, k)), b && k && b.from == k.from && b.to == k.to)
    return L(T(t.from, t.to, b));
  {
    let B = b ? T(t.from, null, b) : F(p, !1), W = k ? T(null, t.to, k) : F(g, !0), N = [];
    return (b || p).to < (k || g).from - (b && k ? 1 : 0) || p.widgetLineBreaks > 1 && B.bottom + i.defaultLineHeight / 2 < W.top ? N.push(M(d, B.bottom, h, W.top)) : B.bottom < W.top && i.elementAtHeight((B.bottom + W.top) / 2).type == gt.Text && (B.bottom = W.top = (B.bottom + W.top) / 2), L(B).concat(N).concat(L(W));
  }
  function M(B, W, N, j) {
    return new Vi(e, B - a.left, W - a.top, Math.max(0, N - B), j - W);
  }
  function L({ top: B, bottom: W, horizontal: N }) {
    let j = [];
    for (let P = 0; P < N.length; P += 2)
      j.push(M(N[P], B, N[P + 1], W));
    return j;
  }
  function T(B, W, N) {
    let j = 1e9, P = -1e9, Q = [];
    function H(fe, pe, te, xe, ae) {
      let Re = i.coordsAtPos(fe, fe == N.to ? -2 : 2), be = i.coordsAtPos(te, te == N.from ? 2 : -2);
      !Re || !be || (j = Math.min(Re.top, be.top, j), P = Math.max(Re.bottom, be.bottom, P), ae == Je.LTR ? Q.push(o && pe ? d : Re.left, o && xe ? h : be.right) : Q.push(!o && xe ? d : be.left, !o && pe ? h : Re.right));
    }
    let x = B ?? N.from, E = W ?? N.to;
    for (let fe of i.visibleRanges)
      if (fe.to > x && fe.from < E)
        for (let pe = Math.max(fe.from, x), te = Math.min(fe.to, E); ; ) {
          let xe = i.state.doc.lineAt(pe);
          for (let ae of i.bidiSpans(xe)) {
            let Re = ae.from + xe.from, be = ae.to + xe.from;
            if (Re >= te)
              break;
            be > pe && H(Math.max(Re, pe), B == null && Re <= x, Math.min(be, te), W == null && be >= E, ae.dir);
          }
          if (pe = xe.to + 1, pe >= te)
            break;
        }
    return Q.length == 0 && H(x, B == null, E, W == null, i.textDirection), { top: j, bottom: P, horizontal: Q };
  }
  function F(B, W) {
    let N = l.top + (W ? B.top : B.bottom);
    return { top: N, bottom: N, horizontal: [] };
  }
}
function Ky(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class Uy {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(jo) != e.state.facet(jo) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(jo);
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
    if (e.length != this.drawn.length || e.some((t, n) => !Ky(t, this.drawn[n]))) {
      let t = this.dom.firstChild, n = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[n].constructor && s.update(t, this.drawn[n]) ? (t = t.nextSibling, n++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, re.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const jo = /* @__PURE__ */ de.define();
function Nd(i) {
  return [
    Gt.define((e) => new Uy(e, i)),
    jo.of(i)
  ];
}
const ys = /* @__PURE__ */ de.define({
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
function Gy(i = {}) {
  return [
    ys.of(i),
    jy,
    qy,
    Xy,
    cd.of(!0)
  ];
}
function Vd(i) {
  return i.startState.facet(ys) != i.state.facet(ys);
}
const jy = /* @__PURE__ */ Nd({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(ys), n = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && re.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : X.cursor(s.head, s.assoc);
        for (let a of Vi.forRange(i, r, l))
          n.push(a);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = Vd(i);
    return t && hc(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    hc(e.state, i);
  },
  class: "cm-cursorLayer"
});
function hc(i, e) {
  e.style.animationDuration = i.facet(ys).cursorBlinkRate + "ms";
}
const qy = /* @__PURE__ */ Nd({
  above: !1,
  markers(i) {
    let e = [], { main: t, ranges: n } = i.state.selection;
    for (let s of n)
      if (!s.empty)
        for (let o of Vi.forRange(i, "cm-selectionBackground", s))
          e.push(o);
    if (re.ios && !t.empty && i.state.facet(ys).iosSelectionHandles) {
      for (let s of Vi.forRange(i, "cm-selectionHandle cm-selectionHandle-start", X.cursor(t.from, 1)))
        e.push(s);
      for (let s of Vi.forRange(i, "cm-selectionHandle cm-selectionHandle-end", X.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || Vd(i);
  },
  class: "cm-selectionLayer"
}), Yy = re.gecko && re.gecko_version == 153 ? "#ffffff01" : "transparent", Xy = /* @__PURE__ */ br.highest(/* @__PURE__ */ me.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${Yy} !important` },
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
function Jy() {
  return Qy;
}
const Zy = /* @__PURE__ */ Ze.line({ class: "cm-activeLine" }), Qy = /* @__PURE__ */ Gt.fromClass(class {
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
      s.from > e && (t.push(Zy.range(s.from)), e = s.from);
    }
    return Ze.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), $o = "-10000px";
class Hd {
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
function eb(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const il = /* @__PURE__ */ de.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: re.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || eb
    };
  }
}), dc = /* @__PURE__ */ new WeakMap(), Wd = /* @__PURE__ */ Gt.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(il);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new Hd(i, La, (t, n) => this.createTooltip(t, n), (t) => {
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
    let t = e || i.geometryChanged, n = i.state.facet(il);
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
    return t.dom.style.position = this.position, t.dom.style.top = $o, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
      if (re.safari) {
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
    let n = this.view.scrollDOM.getBoundingClientRect(), s = Aa(this.view);
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
      space: this.view.state.facet(il).tooltipSpace(this.view),
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
        c.style.top = $o;
        continue;
      }
      let p = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, g = p ? 7 : 0, b = h.right - h.left, k = (e = dc.get(u)) !== null && e !== void 0 ? e : h.bottom - h.top, M = u.offset || nb, L = this.view.textDirection == Je.LTR, T = h.width > n.right - n.left ? L ? n.left : n.right - h.width : L ? Math.max(n.left, Math.min(d.left - (p ? 14 : 0) + M.x, n.right - b)) : Math.min(Math.max(n.left, d.left - b + (p ? 14 : 0) - M.x), n.right - b), F = this.above[l];
      !a.strictSide && (F ? d.top - k - g - M.y < n.top : d.bottom + k + g + M.y > n.bottom) && F == n.bottom - d.bottom > d.top - n.top && (F = this.above[l] = !F);
      let B = (F ? d.top - n.top : n.bottom - d.bottom) - g;
      if (B < k && u.resize !== !1) {
        if (B < this.view.defaultLineHeight) {
          c.style.top = $o;
          continue;
        }
        dc.set(u, k), c.style.height = (k = B) / o + "px";
      } else c.style.height && (c.style.height = "");
      let W = F ? d.top - k - g - M.y : d.bottom + g + M.y, N = T + b;
      if (u.overlap !== !0)
        for (let j of r)
          j.left < N && j.right > T && j.top < W + k && j.bottom > W && (W = F ? j.top - k - 2 - g : j.bottom + g + 2);
      if (this.position == "absolute" ? (c.style.top = (W - i.parent.top) / o + "px", fc(c, (T - i.parent.left) / s)) : (c.style.top = W / o + "px", fc(c, T / s)), p) {
        let j = d.left + (L ? M.x : -M.x) - (T + 14 - 7);
        p.style.left = j / s + "px";
      }
      u.overlap !== !0 && r.push({ left: T, top: W, right: N, bottom: W + k }), c.classList.toggle("cm-tooltip-above", F), c.classList.toggle("cm-tooltip-below", !F), u.positioned && u.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = $o;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function fc(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const tb = /* @__PURE__ */ me.baseTheme({
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
}), nb = { x: 0, y: 0 }, La = /* @__PURE__ */ de.define({
  enables: [Wd, tb]
}), cr = /* @__PURE__ */ de.define({
  combine: (i) => i.reduce((e, t) => e.concat(t), [])
});
class $r {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new $r(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new Hd(e, cr, (t, n) => this.createHostedView(t, n), (t) => t.dom.remove());
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
const ib = /* @__PURE__ */ La.compute([cr], (i) => {
  let e = i.facet(cr);
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
}), sb = /* @__PURE__ */ de.define();
class ob {
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
      }, (a) => hn(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Wd), t = e ? e.manager.tooltips.findIndex((n) => n.create == $r.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, n;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !rb(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (n = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && n !== void 0 ? n : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !lb(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const Lo = 4;
function rb(i, e) {
  let { left: t, right: n, top: s, bottom: o } = i.getBoundingClientRect(), r;
  if (r = i.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - Lo && e.clientX <= n + Lo && e.clientY >= s - Lo && e.clientY <= o + Lo;
}
function lb(i, e, t, n, s, o) {
  let r = i.scrollDOM.getBoundingClientRect(), l = i.documentTop + i.documentPadding.top + i.contentHeight;
  if (r.left > n || r.right < n || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = i.posAtCoords({ x: n, y: s }, !1);
  return a >= e && a <= t;
}
function ab(i, e = {}) {
  let t = Xe.define(), n = /* @__PURE__ */ new WeakMap(), s = gn.define({
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
        u.is(t) && (r = u.value, a = void 0), (u.is(ub) && !u.value || u.value == s) && (r = []);
      return r.length && a && n.set(r, a), r;
    },
    provide: (r) => cr.from(r)
  });
  const o = Gt.define((r) => new ob(
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
      sb.of(o),
      ib
    ]
  };
}
const ub = /* @__PURE__ */ Xe.define(), pc = /* @__PURE__ */ de.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), cb = /* @__PURE__ */ Gt.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(Jl), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(pc);
    this.top = new Do(i, !0, e.topContainer), this.bottom = new Do(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(pc);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Do(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Do(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(Jl);
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
class Do {
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
          e = gc(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = gc(e);
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
function gc(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const Jl = /* @__PURE__ */ de.define({
  enables: cb
});
class yi extends Wi {
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
yi.prototype.elementClass = "";
yi.prototype.toDOM = void 0;
yi.prototype.mapMode = It.TrackBefore;
yi.prototype.startSide = yi.prototype.endSide = -1;
yi.prototype.point = !0;
const sl = /* @__PURE__ */ de.define(), hb = /* @__PURE__ */ de.define(), db = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Ie.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, Ks = /* @__PURE__ */ de.define();
function fb(i) {
  return [zd(), Ks.of({ ...db, ...i })];
}
const mc = /* @__PURE__ */ de.define({
  combine: (i) => i.some((e) => e)
});
function zd(i) {
  return [
    pb
  ];
}
const pb = /* @__PURE__ */ Gt.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet(Ks).map((e) => new yc(i, e)), this.fixed = !i.state.facet(mc);
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
    this.view.state.facet(mc) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Ie.iter(this.view.state.facet(sl), this.view.viewport.from), n = [], s = this.gutters.map((o) => new gb(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == gt.Text && r) {
            Zl(t, n, l.from);
            for (let a of s)
              a.line(this.view, l, n);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == gt.Text) {
        Zl(t, n, o.from);
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
    let e = i.startState.facet(Ks), t = i.state.facet(Ks), n = i.docChanged || i.heightChanged || i.viewportChanged || !Ie.eq(i.startState.facet(sl), i.state.facet(sl), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new yc(this.view, o)) : (this.gutters[r].update(i), s.push(this.gutters[r]));
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
    return e.textDirection == Je.LTR ? { left: n, right: s } : { right: n, left: s };
  })
});
function vc(i) {
  return Array.isArray(i) ? i : [i];
}
function Zl(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class gb {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = Ie.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Fd(e, r, o, n);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    Zl(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let o of e.state.facet(hb)) {
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
class yc {
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
    this.markers = vc(t.markers(e)), t.initialSpacer && (this.spacer = new Fd(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = vc(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let n = e.view.viewport;
    return !Ie.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Fd {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), mb(this.markers, s) || this.setMarkers(e, s);
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
function mb(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const vb = /* @__PURE__ */ de.define(), yb = /* @__PURE__ */ de.define(), ns = /* @__PURE__ */ de.define({
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
class ol extends yi {
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
function rl(i, e) {
  return i.state.facet(ns).formatNumber(e, i.state);
}
const bb = /* @__PURE__ */ Ks.compute([ns], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(vb);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new ol(rl(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet(yb)) {
      let o = s(e, t, n);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(ns) != e.state.facet(ns),
  initialSpacer(e) {
    return new ol(rl(e, bc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = rl(t.view, bc(t.view.state.doc.lines));
    return n == e.number ? e : new ol(n);
  },
  domEventHandlers: i.facet(ns).domEventHandlers,
  side: "before"
}));
function kb(i = {}) {
  return [
    ns.of(i),
    zd(),
    bb
  ];
}
function bc(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const wb = 1024;
let xb = 0;
class ll {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Ne {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = xb++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
Ne.closedBy = new Ne({ deserialize: (i) => i.split(" ") });
Ne.openedBy = new Ne({ deserialize: (i) => i.split(" ") });
Ne.group = new Ne({ deserialize: (i) => i.split(" ") });
Ne.isolate = new Ne({ deserialize: (i) => {
  if (i && i != "rtl" && i != "ltr" && i != "auto")
    throw new RangeError("Invalid value for isolate: " + i);
  return i || "auto";
} });
Ne.contextHash = new Ne({ perNode: !0 });
Ne.lookAhead = new Ne({ perNode: !0 });
Ne.mounted = new Ne({ perNode: !0 });
class Us {
  constructor(e, t, n, s = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[Ne.mounted.id];
  }
}
const Sb = /* @__PURE__ */ Object.create(null);
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Sb, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new Nt(e.name || "", t, e.id, n);
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
      let t = this.prop(Ne.group);
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
      for (let s = n.prop(Ne.group), o = -1; o < (s ? s.length : 0); o++) {
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
class Da {
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
    return new Da(t);
  }
}
const Bo = /* @__PURE__ */ new WeakMap(), kc = /* @__PURE__ */ new WeakMap();
var rt;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(rt || (rt = {}));
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
    let e = Us.get(this);
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
    return new ea(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = Bo.get(this) || this.topNode, o = new ea(s);
    return o.moveTo(e, t), Bo.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new tn(this, 0, 0, null);
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
    let n = to(Bo.get(this) || this.topNode, e, t, !1);
    return Bo.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = to(kc.get(this) || this.topNode, e, t, !0);
    return kc.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Mb(this, e, t);
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
    return this.children.length <= 8 ? this : Ea(Nt.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new Qe(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new Qe(Nt.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Tb(e);
  }
}
Qe.empty = new Qe(Nt.none, [], [], 0);
class Ba {
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
    return new Ba(this.buffer, this.index);
  }
}
class bi {
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
    for (let a = e; a != t && !(_d(o, s, r[a + 1], r[a + 2]) && (l = a, n > 0)); a = r[a + 3])
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
    return new bi(o, r, this.set);
  }
}
function _d(i, e, t, n) {
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
function to(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let r = !n && i instanceof tn && i.index < 0 ? null : i.parent;
    if (!r)
      return i;
    i = r;
  }
  let o = n ? 0 : rt.IgnoreOverlays;
  if (n)
    for (let r = i, l = r.parent; l; r = l, l = r.parent)
      r instanceof tn && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (i = l);
  for (; ; ) {
    let r = i.enter(e, t, o);
    if (!r)
      return i;
    i = r;
  }
}
class Kd {
  cursor(e = 0) {
    return new ea(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = wc(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return wc(this, e, t, n);
  }
  resolve(e, t = 0) {
    return to(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return to(this, e, t, !0);
  }
  matchContext(e) {
    return Ql(this.parent, e);
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
class tn extends Kd {
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
        if (!(!(o & rt.EnterBracketed && c instanceof Qe && (h = Us.get(c)) && !h.overlay && h.bracketed && n >= d && n <= d + c.length) && !_d(s, n, d, d + c.length))) {
          if (c instanceof bi) {
            if (o & rt.ExcludeBuffers)
              continue;
            let p = c.findChild(0, c.buffer.length, t, n - d, s);
            if (p > -1)
              return new pi(new Cb(r, c, e, d), null, p);
          } else if (o & rt.IncludeAnonymous || !c.type.isAnonymous || Oa(c)) {
            let p;
            if (!(o & rt.IgnoreMounts) && (p = Us.get(c)) && !p.overlay)
              return new tn(p.tree, d, e, r);
            let g = new tn(c, d, e, r);
            return o & rt.IncludeAnonymous || !g.type.isAnonymous ? g : g.nextChild(t < 0 ? c.children.length - 1 : 0, t, n, s, o);
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
    if (!(n & rt.IgnoreOverlays) && (s = Us.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = n & rt.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new tn(s.tree, s.overlay[0].from + this.from, -1, this);
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
function wc(i, e, t, n) {
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
function Ql(i, e, t = e.length - 1) {
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
class Cb {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class pi extends Kd {
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
    return o < 0 ? null : new pi(this.context, this, o);
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
    return o < 0 ? null : new pi(this.context, this, o);
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
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new pi(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new pi(this.context, this._parent, e.findChild(
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
function Ud(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let o = 1; o < i.length; o++) {
    let r = i[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let n = t instanceof tn && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new Ab(s, t);
}
class Ab {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return Ud(this.heads);
  }
}
function Mb(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let o = n instanceof tn ? n : n.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [n])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Us.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new tn(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [n])).push(to(l, e, t, !1));
      }
    }
  return s ? Ud(s) : n;
}
class ea {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~rt.EnterBracketed, e instanceof tn)
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
    return e ? e instanceof tn ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
          if (this.mode & rt.IncludeAnonymous || l instanceof bi || !l.type.isAnonymous || Oa(l))
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
      t = new pi(this.buffer, t, this.stack[s]);
    return this.bufferNode = new pi(this.buffer, t, this.index);
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
      return Ql(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return Ql(this._tree, e, s);
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
function Oa(i) {
  return i.children.some((e) => e instanceof bi || !e.type.isAnonymous || Oa(e));
}
function Tb(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = wb, reused: o = [], minRepeatType: r = n.types.length } = i, l = Array.isArray(t) ? new Ba(t, t.length) : t, a = n.types, u = 0, c = 0;
  function d(B, W, N, j, P, Q) {
    let { id: H, start: x, end: E, size: fe } = l, pe = c, te = u;
    if (fe < 0)
      if (l.next(), fe == -1) {
        let De = o[H];
        N.push(De), j.push(x - B);
        return;
      } else if (fe == -3) {
        u = H;
        return;
      } else if (fe == -4) {
        c = H;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${fe}`);
    let xe = a[H], ae, Re, be = x - B;
    if (E - x <= s && (Re = k(l.pos - W, P))) {
      let De = new Uint16Array(Re.size - Re.skip), Ve = l.pos - Re.size, He = De.length;
      for (; l.pos > Ve; )
        He = M(Re.start, De, He);
      ae = new bi(De, E - Re.start, n), be = Re.start - B;
    } else {
      let De = l.pos - fe;
      l.next();
      let Ve = [], He = [], V = H >= r ? H : -1, we = 0, le = E;
      for (; l.pos > De; )
        V >= 0 && l.id == V && l.size >= 0 ? (l.end <= le - s && (g(Ve, He, x, we, l.end, le, V, pe, te), we = Ve.length, le = l.end), l.next()) : Q > 2500 ? h(x, De, Ve, He) : d(x, De, Ve, He, V, Q + 1);
      if (V >= 0 && we > 0 && we < Ve.length && g(Ve, He, x, we, x, le, V, pe, te), Ve.reverse(), He.reverse(), V > -1 && we > 0) {
        let q = p(xe, te);
        ae = Ea(xe, Ve, He, 0, Ve.length, 0, E - x, q, q);
      } else
        ae = b(xe, Ve, He, E - x, pe - E, te);
    }
    N.push(ae), j.push(be);
  }
  function h(B, W, N, j) {
    let P = [], Q = 0, H = -1;
    for (; l.pos > W; ) {
      let { id: x, start: E, end: fe, size: pe } = l;
      if (pe > 4)
        l.next();
      else {
        if (H > -1 && E < H)
          break;
        H < 0 && (H = fe - s), P.push(x, E, fe), Q++, l.next();
      }
    }
    if (Q) {
      let x = new Uint16Array(Q * 4), E = P[P.length - 2];
      for (let fe = P.length - 3, pe = 0; fe >= 0; fe -= 3)
        x[pe++] = P[fe], x[pe++] = P[fe + 1] - E, x[pe++] = P[fe + 2] - E, x[pe++] = pe;
      N.push(new bi(x, P[2] - E, n)), j.push(E - B);
    }
  }
  function p(B, W) {
    return (N, j, P) => {
      let Q = 0, H = N.length - 1, x, E;
      if (H >= 0 && (x = N[H]) instanceof Qe) {
        if (!H && x.type == B && x.length == P)
          return x;
        (E = x.prop(Ne.lookAhead)) && (Q = j[H] + x.length + E);
      }
      return b(B, N, j, P, Q, W);
    };
  }
  function g(B, W, N, j, P, Q, H, x, E) {
    let fe = [], pe = [];
    for (; B.length > j; )
      fe.push(B.pop()), pe.push(W.pop() + N - P);
    B.push(b(n.types[H], fe, pe, Q - P, x - Q, E)), W.push(P - N);
  }
  function b(B, W, N, j, P, Q, H) {
    if (Q) {
      let x = [Ne.contextHash, Q];
      H = H ? [x].concat(H) : [x];
    }
    if (P > 25) {
      let x = [Ne.lookAhead, P];
      H = H ? [x].concat(H) : [x];
    }
    return new Qe(B, W, N, j, H);
  }
  function k(B, W) {
    let N = l.fork(), j = 0, P = 0, Q = 0, H = N.end - s, x = { size: 0, start: 0, skip: 0 };
    e: for (let E = N.pos - B; N.pos > E; ) {
      let fe = N.size;
      if (N.id == W && fe >= 0) {
        x.size = j, x.start = P, x.skip = Q, Q += 4, j += 4, N.next();
        continue;
      }
      let pe = N.pos - fe;
      if (fe < 0 || pe < E || N.start < H)
        break;
      let te = N.id >= r ? 4 : 0, xe = N.start;
      for (N.next(); N.pos > pe; ) {
        if (N.size < 0)
          if (N.size == -3 || N.size == -4)
            te += 4;
          else
            break e;
        else N.id >= r && (te += 4);
        N.next();
      }
      P = xe, j += fe, Q += te;
    }
    return (W < 0 || j == B) && (x.size = j, x.start = P, x.skip = Q), x.size > 4 ? x : void 0;
  }
  function M(B, W, N) {
    let { id: j, start: P, end: Q, size: H } = l;
    if (l.next(), H >= 0 && j < r) {
      let x = N;
      if (H > 4) {
        let E = l.pos - (H - 4);
        for (; l.pos > E; )
          N = M(B, W, N);
      }
      W[--N] = x, W[--N] = Q - B, W[--N] = P - B, W[--N] = j;
    } else H == -3 ? u = j : H == -4 && (c = j);
    return N;
  }
  let L = [], T = [];
  for (; l.pos > 0; )
    d(i.start || 0, i.bufferStart || 0, L, T, -1, 0);
  let F = (e = i.length) !== null && e !== void 0 ? e : L.length ? T[0] + L[0].length : 0;
  return new Qe(a[i.topID], L.reverse(), T.reverse(), F);
}
const xc = /* @__PURE__ */ new WeakMap();
function qo(i, e) {
  if (!i.isAnonymous || e instanceof bi || e.type != i)
    return 1;
  let t = xc.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof Qe)) {
        t = 1;
        break;
      }
      t += qo(i, n);
    }
    xc.set(e, t);
  }
  return t;
}
function Ea(i, e, t, n, s, o, r, l, a) {
  let u = 0;
  for (let g = n; g < s; g++)
    u += qo(i, e[g]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), d = [], h = [];
  function p(g, b, k, M, L) {
    for (let T = k; T < M; ) {
      let F = T, B = b[T], W = qo(i, g[T]);
      for (T++; T < M; T++) {
        let N = qo(i, g[T]);
        if (W + N >= c)
          break;
        W += N;
      }
      if (T == F + 1) {
        if (W > c) {
          let N = g[F];
          p(N.children, N.positions, 0, N.children.length, b[F] + L);
          continue;
        }
        d.push(g[F]);
      } else {
        let N = b[T - 1] + g[T - 1].length - B;
        d.push(Ea(i, g, b, F, T, B, N, null, a));
      }
      h.push(B + L - o);
    }
  }
  return p(e, t, n, s, 0), (l || a)(d, h, r);
}
class Hi {
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
    let s = [new Hi(0, e.length, e, 0, !1, n)];
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
            let p = Math.max(h.from, a) - u, g = Math.min(h.to, d) - u;
            h = p >= g ? null : new Hi(p, g, h.tree, h.offset + u, l > 0, !!c);
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
class Gd {
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
    return typeof e == "string" && (e = new $b(e)), n = n ? n.length ? n.map((s) => new ll(s.from, s.to)) : [new ll(0, 0)] : [new ll(0, e.length)], this.createParse(e, t || [], n);
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
class $b {
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
new Ne({ perNode: !0 });
let Lb = 0;
class Zt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = Lb++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let n = typeof e == "string" ? e : "?";
    if (e instanceof Zt && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let s = new Zt(n, [], null, []);
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
    let t = new hr(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : hr.get(n.base || n, n.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let Db = 0;
class hr {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Db++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((l) => l.base == e && Bb(t, l.modified));
    if (n)
      return n;
    let s = [], o = new Zt(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Ob(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(hr.get(l, a));
    return o;
  }
}
function Bb(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function Ob(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function Eb(i) {
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
          let p = s[d++];
          if (d == s.length && p == "!") {
            r = 0;
            break;
          }
          if (p != "/")
            throw new RangeError("Invalid path: " + s);
          l = s.slice(d);
        }
        let a = o.length - 1, u = o[a];
        if (!u)
          throw new RangeError("Invalid path: " + s);
        let c = new no(n, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return jd.add(e);
}
const jd = new Ne({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth < e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new no(s.tags, s.mode, s.context);
      t ? t.next = o : n = o, t = o;
    }
    return n;
  }
});
class no {
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
no.empty = new no([], 2, null);
function qd(i, e) {
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
function Ib(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function Rb(i, e, t, n = 0, s = i.length) {
  let o = new Pb(n, Array.isArray(e) ? e : [e], t);
  o.highlightRange(i.cursor(), n, s, "", o.highlighters), o.flush(s);
}
class Pb {
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
    r.isTop && (o = this.highlighters.filter((p) => !p.scope || p.scope(r)));
    let u = s, c = Nb(e) || no.empty, d = Ib(o, c.tags);
    if (d && (u && (u += " "), u += d, c.mode == 1 && (s += (s ? " " : "") + d)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let h = e.tree && e.tree.prop(Ne.mounted);
    if (h && h.overlay) {
      let p = e.node.enter(h.overlay[0].from + l, 1), g = this.highlighters.filter((k) => !k.scope || k.scope(h.tree.type)), b = e.firstChild();
      for (let k = 0, M = l; ; k++) {
        let L = k < h.overlay.length ? h.overlay[k] : null, T = L ? L.from + l : a, F = Math.max(t, M), B = Math.min(n, T);
        if (F < B && b)
          for (; e.from < B && (this.highlightRange(e, F, B, s, o), this.startSpan(Math.min(B, e.to), u), !(e.to >= T || !e.nextSibling())); )
            ;
        if (!L || T > n)
          break;
        M = L.to + l, M > t && (this.highlightRange(p.cursor(), Math.max(t, L.from + l), Math.min(n, M), "", g), this.startSpan(Math.min(n, M), u));
      }
      b && e.parent();
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
function Nb(i) {
  let e = i.type.prop(jd);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const ie = Zt.define, Oo = ie(), li = ie(), Sc = ie(li), Cc = ie(li), ai = ie(), Eo = ie(ai), al = ie(ai), Mn = ie(), Di = ie(Mn), Sn = ie(), Cn = ie(), ta = ie(), Ds = ie(ta), Io = ie(), Me = {
  /**
  A comment.
  */
  comment: Oo,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: ie(Oo),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: ie(Oo),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: ie(Oo),
  /**
  Any kind of identifier.
  */
  name: li,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: ie(li),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: Sc,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: ie(Sc),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: Cc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: ie(Cc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: ie(li),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: ie(li),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: ie(li),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: ie(li),
  /**
  A literal value.
  */
  literal: ai,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Eo,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: ie(Eo),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: ie(Eo),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: ie(Eo),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: al,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: ie(al),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: ie(al),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: ie(ai),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: ie(ai),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: ie(ai),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: ie(ai),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: ie(ai),
  /**
  A language keyword.
  */
  keyword: Sn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: ie(Sn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: ie(Sn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: ie(Sn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: ie(Sn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: ie(Sn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: ie(Sn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: ie(Sn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: ie(Sn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: ie(Sn),
  /**
  An operator.
  */
  operator: Cn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: ie(Cn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: ie(Cn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: ie(Cn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: ie(Cn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: ie(Cn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: ie(Cn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: ie(Cn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: ie(Cn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: ie(Cn),
  /**
  Program or markup punctuation.
  */
  punctuation: ta,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: ie(ta),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Ds,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: ie(Ds),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: ie(Ds),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: ie(Ds),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: ie(Ds),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Mn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: Di,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: ie(Di),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: ie(Di),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: ie(Di),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: ie(Di),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: ie(Di),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: ie(Di),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: ie(Mn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: ie(Mn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: ie(Mn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: ie(Mn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: ie(Mn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: ie(Mn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: ie(Mn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: ie(Mn),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: ie(),
  /**
  Deleted text.
  */
  deleted: ie(),
  /**
  Changed text.
  */
  changed: ie(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: ie(),
  /**
  Metadata or meta-instruction.
  */
  meta: Io,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: ie(Io),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: ie(Io),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: ie(Io),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Zt.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Zt.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Zt.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Zt.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Zt.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Zt.defineModifier("special")
};
for (let i in Me) {
  let e = Me[i];
  e instanceof Zt && (e.name = i);
}
qd([
  { tag: Me.link, class: "tok-link" },
  { tag: Me.heading, class: "tok-heading" },
  { tag: Me.emphasis, class: "tok-emphasis" },
  { tag: Me.strong, class: "tok-strong" },
  { tag: Me.keyword, class: "tok-keyword" },
  { tag: Me.atom, class: "tok-atom" },
  { tag: Me.bool, class: "tok-bool" },
  { tag: Me.url, class: "tok-url" },
  { tag: Me.labelName, class: "tok-labelName" },
  { tag: Me.inserted, class: "tok-inserted" },
  { tag: Me.deleted, class: "tok-deleted" },
  { tag: Me.literal, class: "tok-literal" },
  { tag: Me.string, class: "tok-string" },
  { tag: Me.number, class: "tok-number" },
  { tag: [Me.regexp, Me.escape, Me.special(Me.string)], class: "tok-string2" },
  { tag: Me.variableName, class: "tok-variableName" },
  { tag: Me.local(Me.variableName), class: "tok-variableName tok-local" },
  { tag: Me.definition(Me.variableName), class: "tok-variableName tok-definition" },
  { tag: Me.special(Me.variableName), class: "tok-variableName2" },
  { tag: Me.definition(Me.propertyName), class: "tok-propertyName tok-definition" },
  { tag: Me.typeName, class: "tok-typeName" },
  { tag: Me.namespace, class: "tok-namespace" },
  { tag: Me.className, class: "tok-className" },
  { tag: Me.macroName, class: "tok-macroName" },
  { tag: Me.propertyName, class: "tok-propertyName" },
  { tag: Me.operator, class: "tok-operator" },
  { tag: Me.comment, class: "tok-comment" },
  { tag: Me.meta, class: "tok-meta" },
  { tag: Me.invalid, class: "tok-invalid" },
  { tag: Me.punctuation, class: "tok-punctuation" }
]);
var ul;
const is = /* @__PURE__ */ new Ne();
function Vb(i) {
  return de.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const Hb = /* @__PURE__ */ new Ne();
class dn {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, _e.prototype.hasOwnProperty("tree") || Object.defineProperty(_e.prototype, "tree", { get() {
      return Bn(this);
    } }), this.parser = t, this.extension = [
      ws.of(this),
      _e.languageData.of((o, r, l) => {
        let a = Ac(o, r, l), u = a.type.prop(is);
        if (!u)
          return [];
        let c = o.facet(u), d = a.type.prop(Hb);
        if (d) {
          let h = a.resolve(r - a.from, l);
          for (let p of d)
            if (p.test(h, o)) {
              let g = o.facet(p.facet);
              return p.type == "replace" ? g : g.concat(c);
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
    return Ac(e, t, n).type.prop(is) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(ws);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (o, r) => {
      if (o.prop(is) == this.data) {
        n.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Ne.mounted);
      if (l) {
        if (l.tree.prop(is) == this.data) {
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
dn.setState = /* @__PURE__ */ Xe.define();
function Ac(i, e, t) {
  let n = i.facet(ws), s = Bn(i).topNode;
  if (!n || n.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, rt.ExcludeBuffers | rt.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function Bn(i) {
  let e = i.field(dn.state, !1);
  return e ? e.tree : Qe.empty;
}
class Wb {
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
let Bs = null;
class bs {
  constructor(e, t, n = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new bs(e, t, [], Qe.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new Wb(this.state.doc), this.fragments);
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
          if (this.fragments = this.withoutTempSkipped(Hi.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Hi.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Bs;
    Bs = this;
    try {
      return e();
    } finally {
      Bs = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Mc(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, d, h) => a.push({ fromA: u, toA: c, fromB: d, toB: h })), n = Hi.applyChanges(n, a), s = Qe.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), d = e.mapPos(u.to, -1);
          c < d && l.push({ from: c, to: d });
        }
      }
    }
    return new bs(this.parser, t, n, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = Mc(this.fragments, s, o), this.skipped.splice(n--, 1));
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
    return new class extends Gd {
      createParse(t, n, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = Bs;
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
    return Bs;
  }
}
function Mc(i, e, t) {
  return Hi.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class ks {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new ks(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = bs.create(e.facet(ws).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new ks(n);
  }
}
dn.state = /* @__PURE__ */ gn.define({
  create: ks.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(dn.setState))
        return t.value;
    return e.startState.facet(ws) != e.state.facet(ws) ? ks.init(e.state) : i.apply(e);
  }
});
let Yd = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Yd = (i) => {
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
const cl = typeof navigator < "u" && (!((ul = navigator.scheduling) === null || ul === void 0) && ul.isInputPending) ? () => navigator.scheduling.isInputPending() : null, zb = /* @__PURE__ */ Gt.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(dn.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(dn.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Yd(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: s } } = this.view, o = n.field(dn.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !cl ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && n.doc.length > s + 1e3, a = o.context.work(() => cl && cl() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: dn.setState.of(new ks(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => hn(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), ws = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    dn.state,
    zb,
    me.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Fb = /* @__PURE__ */ de.define(), Ia = /* @__PURE__ */ de.define({
  combine: (i) => {
    if (!i.length)
      return "  ";
    let e = i[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(i[0]));
    return e;
  }
});
function Ki(i) {
  let e = i.facet(Ia);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function dr(i, e) {
  let t = "", n = i.tabSize, s = i.facet(Ia)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Xd(i, e) {
  i instanceof _e && (i = new Lr(i));
  for (let n of i.state.facet(Fb)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = Bn(i.state);
  return t.length >= e ? _b(i, t, e) : null;
}
class Lr {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Ki(e);
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
const Jd = /* @__PURE__ */ new Ne();
function _b(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let o = [];
    for (let r = s; r && !(r.from < n.node.from || r.to > n.node.to || r.from == n.node.from && r.type == n.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      n = { node: o[r], next: n };
  }
  return Zd(n, i, t);
}
function Zd(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = Ub(n.node);
    if (s)
      return s(Ra.create(e, t, n));
  }
  return 0;
}
function Kb(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function Ub(i) {
  let e = i.type.prop(Jd);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(Ne.closedBy))) {
    let s = i.lastChild, o = s && n.indexOf(s.name) > -1;
    return (r) => Yb(r, !0, 1, void 0, o && !Kb(r) ? s.from : void 0);
  }
  return i.parent == null ? Gb : null;
}
function Gb() {
  return 0;
}
class Ra extends Lr {
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
    return new Ra(e, t, n);
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
      if (jb(n, e))
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
    return Zd(this.context.next, this.base, this.pos);
  }
}
function jb(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function qb(i) {
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
function Yb(i, e, t, n, s) {
  let o = i.textAfter, r = o.match(/^\s*/)[0].length, l = n && o.slice(r, r + n.length) == n || s == i.pos + r, a = qb(i);
  return a ? l ? i.column(a.from) : i.column(a.to) : i.baseIndent + (l ? 0 : i.unit * t);
}
class Dr {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(l) {
      let a = gi.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof dn ? (l) => l.prop(is) == r.data : r ? (l) => l == r : void 0, this.style = qd(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = n ? new gi(n) : null, this.themeType = t.themeType;
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
    return new Dr(e, t || {});
  }
}
const na = /* @__PURE__ */ de.define(), Xb = /* @__PURE__ */ de.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function hl(i) {
  let e = i.facet(na);
  return e.length ? e : i.facet(Xb);
}
function Jb(i, e) {
  let t = [Qb], n;
  return i instanceof Dr && (i.module && t.push(me.styleModule.of(i.module)), n = i.themeType), n ? t.push(na.computeN([me.darkTheme], (s) => s.facet(me.darkTheme) == (n == "dark") ? [i] : [])) : t.push(na.of(i)), t;
}
class Zb {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Bn(e.state), this.decorations = this.buildDeco(e, hl(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Bn(e.state), n = hl(e.state), s = n != hl(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Ze.none;
    let n = new Ni();
    for (let { from: s, to: o } of e.visibleRanges)
      Rb(this.tree, t, (r, l, a) => {
        n.add(r, l, this.markCache[a] || (this.markCache[a] = Ze.mark({ class: a })));
      }, s, o);
    return n.finish();
  }
}
const Qb = /* @__PURE__ */ br.high(/* @__PURE__ */ Gt.fromClass(Zb, {
  decorations: (i) => i.decorations
})), e0 = 1e4, t0 = "()[]{}", n0 = /* @__PURE__ */ new Ne();
function ia(i, e, t) {
  let n = i.prop(e < 0 ? Ne.openedBy : Ne.closedBy);
  if (n)
    return n;
  if (i.name.length == 1) {
    let s = t.indexOf(i.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function sa(i) {
  let e = i.type.prop(n0);
  return e ? e(i.node) : i;
}
function ss(i, e, t, n = {}) {
  let s = n.maxScanDistance || e0, o = n.brackets || t0, r = Bn(i), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = ia(a.type, t, o);
    if (u && a.from < a.to) {
      let c = sa(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return i0(i, e, t, a, c, u, o);
    }
  }
  return s0(i, e, t, r, l.type, s, o);
}
function i0(i, e, t, n, s, o, r) {
  let l = n.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let d = sa(c);
          return { start: a, end: d ? { from: d.from, to: d.to } : void 0, matched: !0 };
        } else if (ia(c.type, t, r))
          u++;
        else if (ia(c.type, -t, r)) {
          if (u == 0) {
            let d = sa(c);
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
function s0(i, e, t, n, s, o, r) {
  if (t < 0 ? !e : e == i.doc.length)
    return null;
  let l = t < 0 ? i.sliceDoc(e - 1, e) : i.sliceDoc(e, e + 1), a = r.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let u = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = i.doc.iterRange(e, t > 0 ? i.doc.length : 0), d = 0;
  for (let h = 0; !c.next().done && h <= o; ) {
    let p = c.value;
    t < 0 && (h += p.length);
    let g = e + h * t;
    for (let b = t > 0 ? 0 : p.length - 1, k = t > 0 ? p.length : -1; b != k; b += t) {
      let M = r.indexOf(p[b]);
      if (!(M < 0 || n.resolveInner(g + b, 1).type != s))
        if (M % 2 == 0 == t > 0)
          d++;
        else {
          if (d == 1)
            return { start: u, end: { from: g + b, to: g + b + 1 }, matched: M >> 1 == a >> 1 };
          d--;
        }
    }
    t > 0 && (h += p.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function Tc(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let o = s;
  for (let r = n; r < e; r++)
    i.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Qd {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = Tc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : Tc(this.string, null, this.tabSize);
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
function o0(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || r0,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || Va,
    mergeTokens: i.mergeTokens !== !1
  };
}
function r0(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const $c = /* @__PURE__ */ new WeakMap();
class Pa extends dn {
  constructor(e) {
    let t = Vb(e.languageData), n = o0(e), s, o = new class extends Gd {
      createParse(r, l, a) {
        return new a0(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = h0(t, this), s = this, this.streamParser = n, this.stateAfter = new Ne({ perNode: !0 }), this.tokenTable = e.tokenTable ? new sf(n.tokenTable) : c0;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Pa(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = $c.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Na(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = n ? n(a.from) : -1, d = new Qd(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; d.pos < u - a.from; )
          tf(this.streamParser.token, d, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return n && t == null && $c.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Na(i, e, t, n, s) {
  let o = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (o)
    return { state: i.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof Qe && a < s && Na(i, l, a, n, s);
    if (u)
      return u;
  }
  return null;
}
function ef(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < n && l instanceof Qe) {
      if (!(a = ef(i, l, t - r, n - r, s)))
        break;
      return s ? new Qe(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function l0(i, e, t, n, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Na(i, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= n && (u = ef(i, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: i.streamParser.startState(s ? Ki(s) : 4), tree: Qe.empty };
}
class a0 {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = bs.get(), r = s[0].from, { state: l, tree: a } = l0(e, n, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Ki(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = bs.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
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
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Qd(t, e ? e.state.tabSize : 4, e ? Ki(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = tf(o.token, r, this.state);
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
      nodeSet: u0,
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
function tf(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const Va = /* @__PURE__ */ Object.create(null), io = [Nt.none], u0 = /* @__PURE__ */ new Da(io), Lc = [], Dc = /* @__PURE__ */ Object.create(null), nf = /* @__PURE__ */ Object.create(null);
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
  nf[i] = /* @__PURE__ */ of(Va, e);
class sf {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), nf);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = of(this.extra, e)) : 0;
  }
}
const c0 = /* @__PURE__ */ new sf(Va);
function dl(i, e) {
  Lc.indexOf(i) > -1 || (Lc.push(i), console.warn(e));
}
function of(i, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = i[u] || Me[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : dl(u, `Modifier ${u} used at start of tag`) : a.length ? dl(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : dl(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((l) => l.id), o = Dc[s];
  if (o)
    return o.id;
  let r = Dc[s] = Nt.define({
    id: io.length,
    name: n,
    props: [Eb({ [n]: t })]
  });
  return io.push(r), r.id;
}
function h0(i, e) {
  let t = Nt.define({ id: io.length, name: "Document", props: [
    is.add(() => i),
    Jd.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return io.push(t), t;
}
Je.RTL, Je.LTR;
const d0 = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = Wa(i.state, t.from);
  return n.line ? f0(i) : n.block ? g0(i) : !1;
};
function Ha(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const f0 = /* @__PURE__ */ Ha(
  y0,
  0
  /* CommentOption.Toggle */
), p0 = /* @__PURE__ */ Ha(
  rf,
  0
  /* CommentOption.Toggle */
), g0 = /* @__PURE__ */ Ha(
  (i, e) => rf(i, e, v0(e)),
  0
  /* CommentOption.Toggle */
);
function Wa(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const Os = 50;
function m0(i, { open: e, close: t }, n, s) {
  let o = i.sliceDoc(n - Os, n), r = i.sliceDoc(s, s + Os), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: n - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, d;
  s - n <= 2 * Os ? c = d = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + Os), d = i.sliceDoc(s - Os, s));
  let h = /^\s*/.exec(c)[0].length, p = /\s*$/.exec(d)[0].length, g = d.length - p - t.length;
  return c.slice(h, h + e.length) == e && d.slice(g, g + t.length) == t ? {
    open: {
      pos: n + h + e.length,
      margin: /\s/.test(c.charAt(h + e.length)) ? 1 : 0
    },
    close: {
      pos: s - p - t.length,
      margin: /\s/.test(d.charAt(g - 1)) ? 1 : 0
    }
  } : null;
}
function v0(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > n.from ? e[o].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function rf(i, e, t = e.selection.ranges) {
  let n = t.map((o) => Wa(e, o.from).block);
  if (!n.every((o) => o))
    return null;
  let s = t.map((o, r) => m0(e, n[r], o.from, o.to));
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
function y0(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = n.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let d = e.doc.lineAt(c);
      if (u == null && (u = Wa(e, d.from).line, !u))
        continue e;
      if (d.from > s && (o == r || r > d.from)) {
        s = d.from;
        let h = /^\s*/.exec(d.text)[0].length, p = h == d.length, g = d.text.slice(h, h + u.length) == u ? h : -1;
        h < d.text.length && h < a && (a = h), n.push({ line: d, comment: g, token: u, indent: h, empty: p, single: !1 });
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
function Cs(i, e) {
  return X.create(i.ranges.map(e), i.mainIndex);
}
function mn(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function vn({ state: i, dispatch: e }, t) {
  let n = Cs(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(mn(i, n)), !0);
}
function Br(i, e) {
  return X.cursor(e ? i.to : i.from);
}
function lf(i, e) {
  return vn(i, (t) => t.empty ? i.moveByChar(t, e) : Br(t, e));
}
function xt(i) {
  return i.textDirectionAt(i.state.selection.main.head) == Je.LTR;
}
const af = (i) => lf(i, !xt(i)), uf = (i) => lf(i, xt(i));
function cf(i, e) {
  return vn(i, (t) => t.empty ? i.moveByGroup(t, e) : Br(t, e));
}
const b0 = (i) => cf(i, !xt(i)), k0 = (i) => cf(i, xt(i));
function w0(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Or(i, e, t) {
  let n = Bn(i).resolveInner(e.head), s = t ? Ne.closedBy : Ne.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? n.childAfter(a) : n.childBefore(a);
    if (!u)
      break;
    w0(i, u, s) ? n = u : a = t ? u.to : u.from;
  }
  let o = n.type.prop(s), r, l;
  return o && (r = t ? ss(i, n.from, 1) : ss(i, n.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? n.to : n.from, X.cursor(l, t ? -1 : 1);
}
const x0 = (i) => vn(i, (e) => Or(i.state, e, !xt(i))), S0 = (i) => vn(i, (e) => Or(i.state, e, xt(i)));
function hf(i, e) {
  return vn(i, (t) => {
    if (!t.empty)
      return Br(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const df = (i) => hf(i, !1), ff = (i) => hf(i, !0);
function pf(i) {
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
function gf(i, e) {
  let t = pf(i), { state: n } = i, s = Cs(n.selection, (r) => r.empty ? i.moveVertically(r, e, t.height) : Br(r, e));
  if (s.eq(n.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = i.coordsAtPos(n.selection.main.head), l = i.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = me.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return i.dispatch(mn(n, s), { effects: o }), !0;
}
const Bc = (i) => gf(i, !1), oa = (i) => gf(i, !0);
function ki(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let o = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    o && e.head != n.from + o && (s = X.cursor(n.from + o));
  }
  return s;
}
const C0 = (i) => vn(i, (e) => ki(i, e, !0)), A0 = (i) => vn(i, (e) => ki(i, e, !1)), M0 = (i) => vn(i, (e) => ki(i, e, !xt(i))), T0 = (i) => vn(i, (e) => ki(i, e, xt(i))), $0 = (i) => vn(i, (e) => i.moveToLineBoundary(e, !1, !1)), L0 = (i) => vn(i, (e) => i.moveToLineBoundary(e, !0, !1));
function D0(i, e, t) {
  let n = !1, s = Cs(i.selection, (o) => {
    let r = ss(i, o.head, -1) || ss(i, o.head, 1) || o.head > 0 && ss(i, o.head - 1, 1) || o.head < i.doc.length && ss(i, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    n = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return X.cursor(l);
  });
  return n ? (e(mn(i, s)), !0) : !1;
}
const B0 = ({ state: i, dispatch: e }) => D0(i, e);
function nn(i, e, t) {
  let n = Cs(i.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = X.range(s.head, s.anchor));
    let o = t(s);
    return X.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return n.eq(i.state.selection) ? !1 : (i.dispatch(mn(i.state, n)), !0);
}
function mf(i, e) {
  return nn(i, e, (t) => i.moveByChar(t, e));
}
const vf = (i) => mf(i, !xt(i)), yf = (i) => mf(i, xt(i));
function bf(i, e) {
  return nn(i, e, (t) => i.moveByGroup(t, e));
}
const O0 = (i) => bf(i, !xt(i)), E0 = (i) => bf(i, xt(i)), I0 = (i) => {
  let e = !xt(i);
  return nn(i, e, (t) => Or(i.state, t, e));
}, R0 = (i) => {
  let e = xt(i);
  return nn(i, e, (t) => Or(i.state, t, e));
};
function kf(i, e) {
  return nn(i, e, (t) => i.moveVertically(t, e));
}
const wf = (i) => kf(i, !1), xf = (i) => kf(i, !0);
function Sf(i, e) {
  return nn(i, e, (t) => i.moveVertically(t, e, pf(i).height));
}
const Oc = (i) => Sf(i, !1), Ec = (i) => Sf(i, !0), P0 = (i) => nn(i, !0, (e) => ki(i, e, !0)), N0 = (i) => nn(i, !1, (e) => ki(i, e, !1)), V0 = (i) => {
  let e = !xt(i);
  return nn(i, e, (t) => ki(i, t, e));
}, H0 = (i) => {
  let e = xt(i);
  return nn(i, e, (t) => ki(i, t, e));
}, W0 = (i) => nn(i, !1, (e) => X.cursor(i.lineBlockAt(e.head).from)), z0 = (i) => nn(i, !0, (e) => X.cursor(i.lineBlockAt(e.head).to)), Ic = ({ state: i, dispatch: e }) => (e(mn(i, { anchor: 0 })), !0), Rc = ({ state: i, dispatch: e }) => (e(mn(i, { anchor: i.doc.length })), !0), Pc = ({ state: i, dispatch: e }) => (e(mn(i, { anchor: i.selection.main.anchor, head: 0 })), !0), Nc = ({ state: i, dispatch: e }) => (e(mn(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), F0 = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), _0 = ({ state: i, dispatch: e }) => {
  let t = Er(i).map(({ from: n, to: s }) => X.undirectionalRange(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: X.create(t), userEvent: "select" })), !0;
}, K0 = ({ state: i, dispatch: e }) => {
  let t = Cs(i.selection, (n) => {
    let s = Bn(i), o = s.resolveStack(n.from, 1);
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
  return t.eq(i.selection) ? !1 : (e(mn(i, t)), !0);
};
function Cf(i, e) {
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
  return s.length == n.ranges.length ? !1 : (i.dispatch(mn(t, X.create(s, s.length - 1))), !0);
}
const U0 = (i) => Cf(i, !1), G0 = (i) => Cf(i, !0), j0 = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = X.create([t.main]) : t.main.empty || (n = X.create([X.cursor(t.main.head)])), n ? (e(mn(i, n)), !0) : !1;
};
function co(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = Ro(i, a, !1)) : a > r && (t = "delete.forward", a = Ro(i, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = Ro(i, r, !1), l = Ro(i, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: X.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? me.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Ro(i, e, t) {
  if (i instanceof me)
    for (let n of i.state.facet(me.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const Af = (i, e, t) => co(i, (n) => {
  let s = n.from, { state: o } = i, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = xr(l, o.tabSize), c = u % Ki(o) || Ki(o);
    for (let d = 0; d < c && l[l.length - 1 - d] == " "; d++)
      s--;
    a = s;
  } else
    a = bt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = bt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), ra = (i) => Af(i, !1, !0), Mf = (i) => Af(i, !0, !1), Tf = (i, e) => co(i, (t) => {
  let n = t.head, { state: s } = i, o = s.doc.lineAt(n), r = s.charCategorizer(n);
  for (let l = null; ; ) {
    if (n == (e ? o.to : o.from)) {
      n == t.head && o.number != (e ? s.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let a = bt(o.text, n - o.from, e) + o.from, u = o.text.slice(Math.min(n, a) - o.from, Math.max(n, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || n != t.head) && (l = c), n = a;
  }
  return n;
}), $f = (i) => Tf(i, !1), q0 = (i) => Tf(i, !0), Y0 = (i) => co(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), X0 = (i) => co(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), J0 = (i) => co(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), Z0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: ze.of(["", ""]) },
    range: X.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, Q0 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, o = i.doc.lineAt(s), r = s == o.from ? s - 1 : bt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : bt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: i.doc.slice(s, l).append(i.doc.slice(r, s)) },
      range: X.cursor(l)
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
function Lf(i, e, t) {
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
const e1 = ({ state: i, dispatch: e }) => Lf(i, e, !1), t1 = ({ state: i, dispatch: e }) => Lf(i, e, !0);
function Df(i, e, t) {
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
const n1 = ({ state: i, dispatch: e }) => Df(i, e, !1), i1 = ({ state: i, dispatch: e }) => Df(i, e, !0), s1 = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(Er(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), n = Cs(e.selection, (s) => {
    let o;
    if (i.lineWrapping) {
      let r = i.lineBlockAt(s.head), l = i.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + i.documentTop - l.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, o);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function o1(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Bn(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), o;
  return n && s && n.to <= e && s.from >= e && (o = n.type.prop(Ne.closedBy)) && o.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const Vc = /* @__PURE__ */ Bf(!1), r1 = /* @__PURE__ */ Bf(!0);
function Bf(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !i && o == r && o1(e, o);
      i && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new Lr(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Xd(u, o);
      for (c == null && (c = xr(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let d = ["", dr(e, c)];
      return a && d.push(dr(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: ze.of(d) },
        range: X.cursor(o + 1 + d[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function za(i, e) {
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
const l1 = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new Lr(i, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = za(i, (o, r, l) => {
    let a = Xd(n, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = dr(i, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, a1 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(za(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(Ia) });
}), { userEvent: "input.indent" })), !0), u1 = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(za(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = xr(s, i.tabSize), r = 0, l = dr(i, Math.max(0, o - Ki(i)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  n.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), c1 = (i) => (i.setTabFocusMode(), !0), h1 = [
  { key: "Ctrl-b", run: af, shift: vf, preventDefault: !0 },
  { key: "Ctrl-f", run: uf, shift: yf },
  { key: "Ctrl-p", run: df, shift: wf },
  { key: "Ctrl-n", run: ff, shift: xf },
  { key: "Ctrl-a", run: $0, shift: W0 },
  { key: "Ctrl-e", run: L0, shift: z0 },
  { key: "Ctrl-d", run: Mf },
  { key: "Ctrl-h", run: ra },
  { key: "Ctrl-k", run: Y0 },
  { key: "Ctrl-Alt-h", run: $f },
  { key: "Ctrl-o", run: Z0 },
  { key: "Ctrl-t", run: Q0 },
  { key: "Ctrl-v", run: oa }
], d1 = /* @__PURE__ */ [
  { key: "ArrowLeft", run: af, shift: vf, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: b0, shift: O0, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: M0, shift: V0, preventDefault: !0 },
  { key: "ArrowRight", run: uf, shift: yf, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: k0, shift: E0, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: T0, shift: H0, preventDefault: !0 },
  { key: "ArrowUp", run: df, shift: wf, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Ic, shift: Pc },
  { mac: "Ctrl-ArrowUp", run: Bc, shift: Oc },
  { key: "ArrowDown", run: ff, shift: xf, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Rc, shift: Nc },
  { mac: "Ctrl-ArrowDown", run: oa, shift: Ec },
  { key: "PageUp", run: Bc, shift: Oc },
  { key: "PageDown", run: oa, shift: Ec },
  { key: "Home", run: A0, shift: N0, preventDefault: !0 },
  { key: "Mod-Home", run: Ic, shift: Pc },
  { key: "End", run: C0, shift: P0, preventDefault: !0 },
  { key: "Mod-End", run: Rc, shift: Nc },
  { key: "Enter", run: Vc, shift: Vc },
  { key: "Mod-a", run: F0 },
  { key: "Backspace", run: ra, shift: ra, preventDefault: !0 },
  { key: "Delete", run: Mf, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: $f, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: q0, preventDefault: !0 },
  { mac: "Mod-Backspace", run: X0, preventDefault: !0 },
  { mac: "Mod-Delete", run: J0, preventDefault: !0 }
].concat(/* @__PURE__ */ h1.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), f1 = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: x0, shift: I0 },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: S0, shift: R0 },
  { key: "Alt-ArrowUp", run: e1 },
  { key: "Shift-Alt-ArrowUp", run: n1 },
  { key: "Alt-ArrowDown", run: t1 },
  { key: "Shift-Alt-ArrowDown", run: i1 },
  { key: "Mod-Alt-ArrowUp", run: U0 },
  { key: "Mod-Alt-ArrowDown", run: G0 },
  { key: "Escape", run: j0 },
  { key: "Mod-Enter", run: r1 },
  { key: "Alt-l", mac: "Ctrl-l", run: _0 },
  { key: "Mod-i", run: K0, preventDefault: !0 },
  { key: "Mod-[", run: u1 },
  { key: "Mod-]", run: a1 },
  { key: "Mod-Alt-\\", run: l1 },
  { key: "Shift-Mod-k", run: s1 },
  { key: "Shift-Mod-\\", run: B0 },
  { key: "Mod-/", run: d0 },
  { key: "Alt-A", mac: "Ctrl-A", run: p0 },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: c1 }
].concat(d1);
class Hc {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.diagnostic = n;
  }
}
class Ei {
  constructor(e, t, n) {
    this.diagnostics = e, this.panel = t, this.selected = n;
  }
  static init(e, t, n) {
    let s = n.facet(so).markerFilter;
    s && (e = s(e, n));
    let o = e.slice().sort((p, g) => p.from - g.from || p.to - g.to), r = new Ni(), l = [], a = 0, u = n.doc.iter(), c = 0, d = n.doc.length;
    for (let p = 0; ; ) {
      let g = p == o.length ? null : o[p];
      if (!g && !l.length)
        break;
      let b, k;
      if (l.length)
        b = a, k = l.reduce((T, F) => Math.min(T, F.to), g && g.from > b ? g.from : 1e8);
      else {
        if (b = g.from, b > d)
          break;
        k = g.to, l.push(g), p++;
      }
      for (; p < o.length; ) {
        let T = o[p];
        if (T.from == b && (T.to > T.from || T.to == b))
          l.push(T), p++, k = Math.min(T.to, k);
        else {
          k = Math.min(T.from, k);
          break;
        }
      }
      k = Math.min(k, d);
      let M = !1;
      if (l.some((T) => T.from == b && (T.to == k || k == d)) && (M = b == k, !M && k - b < 10)) {
        let T = b - (c + u.value.length);
        T > 0 && (u.next(T), c = b);
        for (let F = b; ; ) {
          if (F >= k) {
            M = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > F)
            break;
          F = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let L = Vf(l);
      if (M)
        r.add(b, b, Ze.widget({
          widget: new v1(L),
          diagnostics: l.slice()
        }));
      else {
        let T = l.reduce((F, B) => B.markClass ? F + " " + B.markClass : F, "");
        r.add(b, k, Ze.mark({
          class: "cm-lintRange cm-lintRange-" + L + T,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((F) => F.to > k)
        }));
      }
      if (a = k, a == d)
        break;
      for (let T = 0; T < l.length; T++)
        l[T].to <= a && l.splice(T--, 1);
    }
    let h = r.finish();
    return new Ei(h, t, xs(h));
  }
}
function xs(i, e = null, t = 0) {
  let n = null;
  return i.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!n)
        n = new Hc(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(n.diagnostic) < 0)
          return !1;
        n = new Hc(n.from, o, n.diagnostic);
      }
  }), n;
}
function Of(i, e) {
  let t = e.pos, n = e.end || t, s = i.state.facet(so).hideOn(i, t, n);
  if (s != null)
    return s;
  let o = i.startState.doc.lineAt(e.pos);
  return !!(i.effects.some((r) => r.is(Ir)) || i.changes.touchesRange(o.from, Math.max(o.to, n)));
}
function p1(i, e) {
  return i.field(fn, !1) ? e : e.concat(Xe.appendConfig.of(M1));
}
function fl(i, e) {
  return {
    effects: p1(i, [Ir.of(e)])
  };
}
const Ir = /* @__PURE__ */ Xe.define(), Ef = /* @__PURE__ */ Xe.define(), If = /* @__PURE__ */ Xe.define(), fn = /* @__PURE__ */ gn.define({
  create() {
    return new Ei(Ze.none, null, null);
  },
  update(i, e) {
    if (e.docChanged && i.diagnostics.size) {
      let t = i.diagnostics.map(e.changes), n = null, s = i.panel;
      if (i.selected) {
        let o = e.changes.mapPos(i.selected.from, 1);
        n = xs(t, i.selected.diagnostic, o) || xs(t, null, o);
      }
      !t.size && s && e.state.facet(so).autoPanel && (s = null), i = new Ei(t, s, n);
    }
    for (let t of e.effects)
      if (t.is(Ir)) {
        let n = e.state.facet(so).autoPanel ? t.value.length ? fr.open : null : i.panel;
        i = Ei.init(t.value, n, e.state);
      } else t.is(Ef) ? i = new Ei(i.diagnostics, t.value ? fr.open : null, i.selected) : t.is(If) && (i = new Ei(i.diagnostics, i.panel, t.value));
    return i;
  },
  provide: (i) => [
    Jl.from(i, (e) => e.panel),
    me.decorations.from(i, (e) => e.diagnostics)
  ]
}), g1 = /* @__PURE__ */ Ze.mark({ class: "cm-lintRange cm-lintRange-active" });
function m1(i, e, t) {
  let { diagnostics: n } = i.state.field(fn), s, o = -1, r = -1;
  n.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = i.state.facet(so).tooltipFilter;
  return s && l && (s = l(s, i.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: Rf(i, s) };
    }
  } : null;
}
function Rf(i, e) {
  return $n("ul", { class: "cm-tooltip-lint" }, e.map((t) => Nf(i, t, !1)));
}
const Wc = (i) => {
  let e = i.state.field(fn, !1);
  return !e || !e.panel ? !1 : (i.dispatch({ effects: Ef.of(!1) }), !0);
}, so = /* @__PURE__ */ de.define({
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
        markerFilter: zc,
        tooltipFilter: zc,
        needsRefresh: (e, t) => e ? t ? (n) => e(n) || t(n) : e : t,
        hideOn: (e, t) => e ? t ? (n, s, o) => e(n, s, o) || t(n, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function zc(i, e) {
  return i ? e ? (t, n) => e(i(t, n), n) : i : e;
}
function Pf(i) {
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
function Nf(i, e, t) {
  var n;
  let s = t ? Pf(e.actions) : [];
  return $n("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, $n("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(i) : e.message), (n = e.actions) === null || n === void 0 ? void 0 : n.map((o, r) => {
    let l = !1, a = (p) => {
      if (p.preventDefault(), l)
        return;
      l = !0;
      let g = xs(i.state.field(fn).diagnostics, e);
      g && o.apply(i, g.from, g.to);
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
class v1 extends ro {
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
class Fc {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = Nf(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class fr {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          Wc(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = Pf(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = xs(this.view.state.field(fn).diagnostics, o);
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
      onclick: () => Wc(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(fn).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(fn), n = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
    for (e.between(0, this.view.state.doc.length, (l, a, { spec: u }) => {
      for (let c of u.diagnostics) {
        if (r.has(c))
          continue;
        r.add(c);
        let d = -1, h;
        for (let p = n; p < this.items.length; p++)
          if (this.items[p].diagnostic == c) {
            d = p;
            break;
          }
        d < 0 ? (h = new Fc(this.view, c), this.items.splice(n, 0, h), s = !0) : (h = this.items[d], d > n && (this.items.splice(n, d - n), s = !0)), t && h.diagnostic == t.diagnostic ? h.dom.hasAttribute("aria-selected") || (h.dom.setAttribute("aria-selected", "true"), o = h) : h.dom.hasAttribute("aria-selected") && h.dom.removeAttribute("aria-selected"), n++;
      }
    }); n < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Fc(this.view, {
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
    let t = this.view.state.field(fn), n = xs(t.diagnostics, this.items[e].diagnostic);
    n && this.view.dispatch({
      selection: { anchor: n.from, head: n.to },
      scrollIntoView: !0,
      effects: If.of(n)
    });
  }
  static open(e) {
    return new fr(e);
  }
}
function Yo(i, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(i)}</svg>')`;
}
function Po(i) {
  return Yo(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${i}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const y1 = /* @__PURE__ */ me.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Po("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Po("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Po("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Po("#66d") },
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
function b1(i) {
  return i == "error" ? 4 : i == "warning" ? 3 : i == "info" ? 2 : 1;
}
function Vf(i) {
  let e = "hint", t = 1;
  for (let n of i) {
    let s = b1(n.severity);
    s > t && (t = s, e = n.severity);
  }
  return e;
}
class Hf extends yi {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = Vf(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let n = this.diagnostics, s = e.state.facet(Rr).tooltipFilter;
    return s && (n = s(n, e.state)), n.length && (t.onmouseover = () => w1(e, t, n)), t;
  }
}
function k1(i, e) {
  let t = (n) => {
    let s = e.getBoundingClientRect();
    if (!(n.clientX > s.left - 10 && n.clientX < s.right + 10 && n.clientY > s.top - 10 && n.clientY < s.bottom + 10)) {
      for (let o = n.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), i.state.field(Wf) && i.dispatch({ effects: Fa.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function w1(i, e, t) {
  function n() {
    let r = i.elementAtHeight(e.getBoundingClientRect().top + 5 - i.documentTop);
    i.coordsAtPos(r.from) && i.dispatch({ effects: Fa.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: Rf(i, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, k1(i, e);
  }
  let { hoverTime: s } = i.state.facet(Rr), o = setTimeout(n, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(n, s);
  };
}
function x1(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = i.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let n = [];
  for (let s in t)
    n.push(new Hf(t[s]).range(+s));
  return Ie.of(n, !0);
}
const S1 = /* @__PURE__ */ fb({
  class: "cm-gutter-lint",
  markers: (i) => i.state.field(la),
  widgetMarker: (i, e, t) => {
    let n = [];
    return i.state.field(la).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && n.push(...r.diagnostics);
    }), n.length ? new Hf(n) : null;
  }
}), la = /* @__PURE__ */ gn.define({
  create() {
    return Ie.empty;
  },
  update(i, e) {
    i = i.map(e.changes);
    let t = e.state.facet(Rr).markerFilter;
    for (let n of e.effects)
      if (n.is(Ir)) {
        let s = n.value;
        t && (s = t(s || [], e.state)), i = x1(e.state.doc, s.slice(0));
      }
    return i;
  }
}), Fa = /* @__PURE__ */ Xe.define(), Wf = /* @__PURE__ */ gn.define({
  create() {
    return null;
  },
  update(i, e) {
    return i && e.docChanged && (i = Of(e, i) ? null : { ...i, pos: e.changes.mapPos(i.pos) }), e.effects.reduce((t, n) => n.is(Fa) ? n.value : t, i);
  },
  provide: (i) => La.from(i)
}), C1 = /* @__PURE__ */ me.baseTheme({
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
    content: /* @__PURE__ */ Yo('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ Yo('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ Yo('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), A1 = /* @__PURE__ */ ab(m1, { hideOn: Of }), M1 = [
  fn,
  /* @__PURE__ */ me.decorations.compute([fn], (i) => {
    let { selected: e, panel: t } = i.field(fn);
    return !e || !t || e.from == e.to ? Ze.none : Ze.set([
      g1.range(e.from, e.to)
    ]);
  }),
  A1,
  y1
], Rr = /* @__PURE__ */ de.define({
  combine(i) {
    return wr(i, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function T1(i = {}) {
  return [Rr.of(i), la, S1, C1, Wf];
}
const _c = /* @__PURE__ */ wt({
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
    const l = Pa.define({
      token(h) {
        return h.sol() && h.match(/^%.*/) ? "comment" : h.sol() && h.match(/^[A-Za-z]:.*/) ? "meta" : h.match(/^"[^"\n]*"/) ? "string" : h.match(/^\[K:[^\]\n]*\]/) ? "meta" : h.eat("|") ? "punctuation" : h.match(/^[zZ][0-9]*/) ? "atom" : h.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (h.next(), null);
      },
      startState: () => null
    }), a = Dr.define([
      { tag: Me.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: Me.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: Me.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: Me.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: Me.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
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
      const p = h.doc.length;
      return t.diagnostics.filter((g) => typeof g.start == "number" && typeof g.end == "number").map((g) => ({
        from: Math.min(g.start, p),
        to: Math.min(Math.max(g.end, g.start), p),
        severity: g.severity === "error" ? "error" : g.severity === "warning" ? "warning" : "info",
        message: g.message
      }));
    }
    hs(() => {
      s.value && (o = new me({
        parent: s.value,
        state: _e.create({
          doc: t.text,
          extensions: [
            kb(),
            Gy(),
            Jy(),
            Rd.of(f1),
            l,
            Jb(a),
            T1(),
            u,
            me.lineWrapping,
            _e.readOnly.of(!!t.readonly),
            me.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            me.updateListener.of((h) => {
              h.docChanged && !r && n("change", h.state.doc.toString()), h.selectionSet && !r && h.transactions.some((p) => p.isUserEvent("select")) && n("cursor", h.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(fl(o.state, c(o.state))));
    }), Yn(() => o?.destroy()), Oe(
      () => t.text,
      (h) => {
        if (!o || o.state.doc.toString() === h) return;
        r = !0;
        const p = Math.min(o.state.selection.main.head, h.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: h }, selection: { anchor: p } }), r = !1, o.dispatch(fl(o.state, c(o.state)));
      }
    ), Oe(
      () => t.diagnostics,
      () => {
        o && o.dispatch(fl(o.state, c(o.state)));
      }
    ), Oe(
      () => t.reveal,
      (h) => {
        if (!o || !h) return;
        const p = o.state.doc.length, [g, b] = [Math.min(h[0], p), Math.min(h[1], p)], k = o.state.selection.main;
        k.from === g && k.to === b || (r = !0, o.dispatch({ selection: X.single(g, b) }), r = !1, d(o, g));
      }
    );
    function d(h, p) {
      const g = h.scrollDOM, b = h.lineBlockAt(p);
      (b.top < g.scrollTop || b.bottom > g.scrollTop + g.clientHeight) && (g.scrollTop = Math.max(0, b.top - g.clientHeight / 3));
    }
    return (h, p) => (C(), A("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), zf = [
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
], $1 = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Ff(i, e) {
  let t = null;
  for (const n of i.measures) n.onset <= e && (t = n);
  return t;
}
function _f(i, e, t) {
  const n = i?.model;
  if (!n) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = ds(i, e), o = fs(e), r = mh(n).filter((d) => s.has(d.id)), l = n.tracks.chords.filter((d) => o.has(d.id)), a = r.length === 1 ? n.tracks.chords.find((d) => d.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Ff(n, u) : t ? n.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function L1(i, e) {
  const t = Ff(i, e) ?? i.measures[0], n = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(n / o) + 1, l = n - (r - 1) * o, a = da(i), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: n, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function D1(i, e, t) {
  const n = i.measures[e - 1];
  return !n || !Number.isInteger(t) || t < 0 || t >= n.length ? null : n.onset + t;
}
const B1 = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, O1 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function aa(i) {
  return `${O1[i % 12]}${Math.floor(i / 12) - 1}`;
}
function E1(i) {
  const e = i.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const n = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + B1[t[1].toUpperCase()] + n;
  return s >= 0 && s <= 127 ? s : null;
}
function I1(i) {
  const e = da(i), t = [];
  for (const n of [32, 16, 8, 4, 2, 1]) {
    e % n === 0 && t.push({ label: `1/${n}`, units: e / n });
    const s = e / n * 1.5;
    n >= 2 && n <= 16 && Number.isInteger(s) && t.push({ label: `1/${n}.`, units: s });
  }
  return t.sort((n, s) => n.units - s.units);
}
function R1(i, e) {
  return !i.length || i.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: i.map((t) => t.id), midi: e };
}
function ri(i, e, t = []) {
  return !i.length && !t.length || i.some((n) => n.pitch + e < 0 || n.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...i.map((n) => n.id), ...t.map((n) => n.id)], semitones: e };
}
function Kc(i, e) {
  return !i.length || i.every((t) => t.track === e) ? null : { op: "move_notes", ids: i.map((t) => t.id), track: e };
}
function P1(i, e, t) {
  return t === null || t === e.onset || t + e.duration > i.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function N1(i, e, t, n) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > i.total ? null : { op: "resize_note", id: e.id, duration: t, mode: n };
}
function V1(i, e, t) {
  const n = e.trim();
  return n ? t?.name === n ? null : { op: "put_chord", onset: i, name: n } : t ? { op: "delete_chord", onset: i } : null;
}
function H1(i, e) {
  return e === null || e === i.onset ? null : { op: "move_chord", onset: i.onset, to: e };
}
function Uc(i, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? i.n : i.n + 1, count: t };
}
function W1(i, e = 1) {
  return { op: "duplicate_measures", bar: i.n, count: e };
}
function z1(i, e, t = 1) {
  return i.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Gc(i, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === i.meter ? null : { op: "change_meter", bar: i.n, count: 1, meter: t };
}
function Kf(i, e) {
  return i.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function F1(i, e) {
  return !zf.includes(e) || e === i.key ? null : { op: "put_key", onset: i.onset, key: e };
}
function _1(i, e) {
  const t = Kf(i, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function K1(i, e) {
  return i === "text" ? "text" : i === "daw" ? "daw" : i === "review" ? "review" : e;
}
const U1 = {
  class: "inspector",
  "aria-label": "Inspector"
}, G1 = {
  key: 0,
  class: "facts"
}, j1 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, q1 = {
  key: 0,
  class: "facts"
}, Y1 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, X1 = ["disabled"], J1 = ["disabled"], Z1 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, Q1 = ["disabled"], ek = ["disabled"], tk = ["disabled", "onKeydown"], nk = ["disabled"], ik = ["disabled"], sk = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, ok = ["disabled", "onKeydown"], rk = ["disabled", "aria-label", "onKeydown"], lk = { class: "facts" }, ak = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, uk = ["disabled", "aria-label"], ck = ["disabled"], hk = ["value"], dk = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, fk = ["disabled"], pk = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, gk = ["disabled", "onKeydown"], mk = { class: "field" }, vk = ["disabled"], yk = ["disabled"], bk = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, kk = {
  key: 0,
  class: "facts"
}, wk = { class: "field" }, xk = ["disabled", "onKeydown"], Sk = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, Ck = ["disabled"], Ak = ["disabled"], Mk = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, Tk = ["disabled", "onKeydown"], $k = ["disabled", "onKeydown"], Lk = { class: "field" }, Dk = ["disabled"], Bk = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, Ok = { class: "facts" }, Ek = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, Ik = ["disabled"], Rk = ["disabled"], Pk = { class: "field" }, Nk = ["disabled"], Vk = ["aria-label"], Hk = { class: "facts" }, Wk = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, zk = ["disabled"], Fk = ["disabled"], _k = ["disabled"], Kk = ["disabled"], Uk = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, Gk = ["disabled"], jk = { id: "plenio-meters" }, qk = ["value"], Yk = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, Xk = ["disabled"], Jk = ["value"], Zk = ["disabled"], Qk = {
  key: 4,
  class: "facts"
}, ew = {
  key: 5,
  class: "error"
}, tw = /* @__PURE__ */ wt({
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
    const e = i, t = O(() => e.view?.model ?? null), n = O(() => _f(e.view, e.selection, e.fallbackBar)), s = O(() => n.value.notes.length === 1 ? n.value.notes[0] : null), o = O(() => n.value.chords.length === 1 && !n.value.notes.length ? n.value.chords[0] : null), r = O(() => n.value.measure), l = O(() => !e.readonly && !e.stale && !e.busy), a = O(() => t.value ? I1(t.value) : []), u = O(() => t.value && r.value ? Kf(t.value, r.value) : null), c = O(() => {
      const H = s.value?.onset ?? o.value?.onset;
      return t.value && H !== void 0 ? L1(t.value, H) : null;
    }), d = O(() => {
      const H = new Set(n.value.notes.map((x) => x.track));
      return H.size === 1 ? [...H][0] : H.size ? "mixed" : null;
    }), h = z(""), p = z(1), g = z(0), b = z(1), k = z(!1), M = z(""), L = z("4/4"), T = z("C");
    Oe(
      [s, o, r, () => n.value.chordAtNote],
      () => {
        const H = s.value;
        h.value = H ? aa(H.pitch) : "", b.value = H?.duration ?? 1, p.value = c.value?.bar ?? 1, g.value = c.value?.offset ?? 0, M.value = (H ? n.value.chordAtNote?.name : o.value?.name) ?? "", L.value = r.value?.meter ?? "4/4", T.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const F = z(null);
    async function B(H) {
      !H || !l.value || (F.value = null, await e.operate(H));
    }
    function W() {
      const H = E1(h.value);
      if (H === null) {
        F.value = `"${h.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, h.value = s.value ? aa(s.value.pitch) : "";
        return;
      }
      B(R1(n.value.notes, H));
    }
    function N() {
      const H = t.value;
      if (!H) return;
      const x = D1(H, Number(p.value), Number(g.value));
      if (x === null) {
        F.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? B(P1(H, s.value, x)) : o.value && B(H1(o.value, x));
    }
    function j(H = Number(b.value)) {
      const x = t.value;
      !x || !s.value || B(N1(x, s.value, H, k.value ? "overwrite" : e.resizeMode));
    }
    function P() {
      const H = s.value?.onset ?? o.value?.onset;
      H !== void 0 && B(V1(H, M.value, s.value ? n.value.chordAtNote : o.value));
    }
    function Q(H) {
      const x = [...n.value.notes.map((E) => E.id), ...n.value.chords.map((E) => E.id)];
      x.length && B({ op: H ? "delete_close_gap" : "delete", ids: x });
    }
    return (H, x) => (C(), A("aside", U1, [
      t.value ? (C(), A(ce, { key: 1 }, [
        n.value.notes.length ? (C(), A("section", j1, [
          f("h4", null, [
            oe(R(s.value ? `${d.value === "vocal" ? "Vocal" : "Ins"} note` : `${n.value.notes.length} notes`) + " ", 1),
            c.value ? (C(), A("span", q1, R(c.value.text), 1)) : G("", !0)
          ]),
          f("div", Y1, [
            x[36] || (x[36] = f("span", { class: "name" }, "voice", -1)),
            f("button", {
              class: Ee({ active: d.value === "vocal" }),
              disabled: !l.value,
              onClick: x[0] || (x[0] = (E) => B(D(Kc)(n.value.notes, "vocal")))
            }, "Vocal", 10, X1),
            f("button", {
              class: Ee({ active: d.value === "ins" }),
              disabled: !l.value,
              onClick: x[1] || (x[1] = (E) => B(D(Kc)(n.value.notes, "ins")))
            }, "Ins", 10, J1)
          ]),
          f("div", Z1, [
            x[37] || (x[37] = f("span", { class: "name" }, "pitch", -1)),
            f("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: x[2] || (x[2] = (E) => B(D(ri)(n.value.notes, -12, n.value.chords)))
            }, "−8va", 8, Q1),
            f("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: x[3] || (x[3] = (E) => B(D(ri)(n.value.notes, -1, n.value.chords)))
            }, "−1", 8, ek),
            s.value ? $e((C(), A("input", {
              key: 0,
              "onUpdate:modelValue": x[4] || (x[4] = (E) => h.value = E),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: et(Ke(W, ["prevent"]), ["enter"]),
              onChange: W
            }, null, 40, tk)), [
              [lt, h.value]
            ]) : G("", !0),
            f("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: x[5] || (x[5] = (E) => B(D(ri)(n.value.notes, 1, n.value.chords)))
            }, "+1", 8, nk),
            f("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: x[6] || (x[6] = (E) => B(D(ri)(n.value.notes, 12, n.value.chords)))
            }, "+8va", 8, ik)
          ]),
          s.value ? (C(), A(ce, { key: 0 }, [
            f("div", sk, [
              x[38] || (x[38] = f("span", { class: "name" }, "start", -1)),
              x[39] || (x[39] = oe(" bar ", -1)),
              $e(f("input", {
                "onUpdate:modelValue": x[7] || (x[7] = (E) => p.value = E),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: et(Ke(N, ["prevent"]), ["enter"]),
                onChange: N
              }, null, 40, ok), [
                [
                  lt,
                  p.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              x[40] || (x[40] = oe(" + ", -1)),
              $e(f("input", {
                "onUpdate:modelValue": x[8] || (x[8] = (E) => g.value = E),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: et(Ke(N, ["prevent"]), ["enter"]),
                onChange: N
              }, null, 40, rk), [
                [
                  lt,
                  g.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              f("span", lk, "× " + R(t.value.unit), 1)
            ]),
            f("div", ak, [
              x[42] || (x[42] = f("span", { class: "name" }, "length", -1)),
              $e(f("input", {
                "onUpdate:modelValue": x[9] || (x[9] = (E) => b.value = E),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: x[10] || (x[10] = et(Ke((E) => j(), ["prevent"]), ["enter"])),
                onChange: x[11] || (x[11] = (E) => j())
              }, null, 40, uk), [
                [
                  lt,
                  b.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              f("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: x[12] || (x[12] = (E) => j(Number(E.target.value)))
              }, [
                x[41] || (x[41] = f("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (C(!0), A(ce, null, ye(a.value, (E) => (C(), A("option", {
                  key: E.label,
                  value: E.units
                }, R(E.label), 9, hk))), 128))
              ], 40, ck)
            ]),
            f("label", dk, [
              $e(f("input", {
                "onUpdate:modelValue": x[13] || (x[13] = (E) => k.value = E),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, fk), [
                [Et, k.value]
              ]),
              x[43] || (x[43] = oe(" longer: over the next note ", -1))
            ]),
            f("div", pk, [
              x[44] || (x[44] = f("span", { class: "name" }, "chord", -1)),
              $e(f("input", {
                "onUpdate:modelValue": x[14] || (x[14] = (E) => M.value = E),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: et(Ke(P, ["prevent"]), ["enter"]),
                onChange: P
              }, null, 40, gk), [
                [lt, M.value]
              ])
            ])
          ], 64)) : G("", !0),
          f("div", mk, [
            f("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: x[15] || (x[15] = (E) => Q(!1))
            }, "→ rest", 8, vk),
            f("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: x[16] || (x[16] = (E) => Q(!0))
            }, "close gap", 8, yk)
          ])
        ])) : o.value ? (C(), A("section", bk, [
          f("h4", null, [
            x[45] || (x[45] = oe(" Chord symbol ", -1)),
            c.value ? (C(), A("span", kk, R(c.value.text), 1)) : G("", !0)
          ]),
          f("div", wk, [
            x[46] || (x[46] = f("span", { class: "name" }, "name", -1)),
            $e(f("input", {
              "onUpdate:modelValue": x[17] || (x[17] = (E) => M.value = E),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: et(Ke(P, ["prevent"]), ["enter"]),
              onChange: P
            }, null, 40, xk), [
              [lt, M.value]
            ])
          ]),
          f("div", Sk, [
            x[47] || (x[47] = f("span", { class: "name" }, "pitch", -1)),
            f("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: x[18] || (x[18] = (E) => B(D(ri)([], -1, n.value.chords)))
            }, "−1", 8, Ck),
            f("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: x[19] || (x[19] = (E) => B(D(ri)([], 1, n.value.chords)))
            }, "+1", 8, Ak)
          ]),
          f("div", Mk, [
            x[48] || (x[48] = f("span", { class: "name" }, "start", -1)),
            x[49] || (x[49] = oe(" bar ", -1)),
            $e(f("input", {
              "onUpdate:modelValue": x[20] || (x[20] = (E) => p.value = E),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: et(Ke(N, ["prevent"]), ["enter"]),
              onChange: N
            }, null, 40, Tk), [
              [
                lt,
                p.value,
                void 0,
                { number: !0 }
              ]
            ]),
            x[50] || (x[50] = oe(" + ", -1)),
            $e(f("input", {
              "onUpdate:modelValue": x[21] || (x[21] = (E) => g.value = E),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: et(Ke(N, ["prevent"]), ["enter"]),
              onChange: N
            }, null, 40, $k), [
              [
                lt,
                g.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          f("div", Lk, [
            f("button", {
              disabled: !l.value,
              onClick: x[22] || (x[22] = (E) => Q(!1))
            }, "remove", 8, Dk)
          ])
        ])) : n.value.chords.length > 1 ? (C(), A("section", Bk, [
          f("h4", null, [
            oe(R(n.value.chords.length) + " chord symbols ", 1),
            f("span", Ok, R(n.value.chords.map((E) => E.name).join(" ")), 1)
          ]),
          f("div", Ek, [
            x[51] || (x[51] = f("span", { class: "name" }, "pitch", -1)),
            f("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: x[23] || (x[23] = (E) => B(D(ri)([], -1, n.value.chords)))
            }, "−1", 8, Ik),
            f("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: x[24] || (x[24] = (E) => B(D(ri)([], 1, n.value.chords)))
            }, "+1", 8, Rk)
          ]),
          f("div", Pk, [
            f("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: x[25] || (x[25] = (E) => Q(!1))
            }, "remove", 8, Nk)
          ])
        ])) : G("", !0),
        r.value ? (C(), A("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          f("h4", null, [
            oe(" Bar " + R(r.value.n) + " ", 1),
            f("span", Hk, R(r.value.meter) + " · " + R(r.value.key), 1)
          ]),
          f("div", Wk, [
            f("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: x[26] || (x[26] = (E) => B(D(Uc)(r.value, "before")))
            }, "+ before", 8, zk),
            f("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: x[27] || (x[27] = (E) => B(D(Uc)(r.value, "after")))
            }, "+ after", 8, Fk),
            f("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: x[28] || (x[28] = (E) => B(D(W1)(r.value)))
            }, "duplicate", 8, _k),
            f("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: x[29] || (x[29] = (E) => B(D(z1)(t.value, r.value)))
            }, "delete", 8, Kk)
          ]),
          f("div", Uk, [
            x[52] || (x[52] = f("span", { class: "name" }, "meter", -1)),
            $e(f("input", {
              "onUpdate:modelValue": x[30] || (x[30] = (E) => L.value = E),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: x[31] || (x[31] = et(Ke((E) => B(D(Gc)(r.value, L.value)), ["prevent"]), ["enter"])),
              onChange: x[32] || (x[32] = (E) => B(D(Gc)(r.value, L.value)))
            }, null, 40, Gk), [
              [lt, L.value]
            ]),
            f("datalist", jk, [
              (C(!0), A(ce, null, ye(D($1), (E) => (C(), A("option", {
                key: E,
                value: E
              }, null, 8, qk))), 128))
            ])
          ]),
          f("div", Yk, [
            x[53] || (x[53] = f("span", { class: "name" }, "key", -1)),
            $e(f("select", {
              "onUpdate:modelValue": x[33] || (x[33] = (E) => T.value = E),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: x[34] || (x[34] = (E) => B(D(F1)(r.value, T.value)))
            }, [
              (C(!0), A(ce, null, ye(D(zf), (E) => (C(), A("option", {
                key: E,
                value: E
              }, R(E), 9, Jk))), 128))
            ], 40, Xk), [
              [Xn, T.value]
            ]),
            u.value ? (C(), A("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: x[35] || (x[35] = (E) => B(D(_1)(t.value, r.value)))
            }, "remove change", 8, Zk)) : G("", !0)
          ])
        ], 8, Vk)) : G("", !0),
        !n.value.notes.length && !o.value && !r.value ? (C(), A("p", Qk, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : G("", !0),
        F.value ? (C(), A("p", ew, R(F.value), 1)) : G("", !0)
      ], 64)) : (C(), A("p", G1, R(i.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), nw = { class: "keys-help" }, iw = ["aria-expanded"], sw = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, ow = /* @__PURE__ */ wt({
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
    return (n, s) => (C(), A("span", nw, [
      f("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, iw),
      e.value ? (C(), A("div", sw, [
        f("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (C(), A(ce, null, ye(t, (o) => f("section", {
          key: o.title
        }, [
          f("h5", null, R(o.title), 1),
          f("table", null, [
            (C(!0), A(ce, null, ye(o.rows, ([r, l]) => (C(), A("tr", { key: r }, [
              f("th", null, R(r), 1),
              f("td", null, R(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : G("", !0)
    ]));
  }
}), rw = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], ua = [4, 8, 16, 32, 64];
function lw(i) {
  return i.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function aw(i) {
  const e = {};
  for (const t of i) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function uw(i) {
  const e = i?.model?.unit ?? i?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), n = Number.isFinite(t) && t > 0 ? t : 16, s = ua.filter((o) => o <= n);
  return s.length ? s[s.length - 1] : ua[0];
}
function cw(i) {
  let e = "";
  for (let t = 0; t < i.length; t += 8192)
    e += String.fromCharCode(...i.subarray(t, t + 8192));
  return btoa(e);
}
function hw(i) {
  const e = atob(i), t = new Uint8Array(e.length);
  for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
  return t;
}
function cs(i, e, t = "audio/midi") {
  const n = new ArrayBuffer(e.length);
  new Uint8Array(n).set(e);
  const s = URL.createObjectURL(new Blob([n], { type: t })), o = document.createElement("a");
  o.href = s, o.download = i, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function dw(i) {
  const e = i.name.trim() || "unnamed";
  return i.notes === 1 ? `${e} · 1 note` : `${e} · ${i.notes} notes`;
}
function fw(i, e, t, { current: n = 0, keep: s = !0 } = {}) {
  const o = [...i];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && n) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${n} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function jc(i) {
  return typeof i == "object" && i !== null && !Array.isArray(i);
}
class pw {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : jc(t) && jc(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function Ri(i) {
  return i instanceof vh ? `${i.message}${i.hint ? ` — ${i.hint}` : ""}` : String(i instanceof Error ? i.message : i);
}
function gw(i) {
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
function mw(i, e) {
  const t = di(null), n = di(null), s = z(null), o = z(!1), r = z(!1), l = z(null), a = z(null), u = z([]), c = z([]), d = new pw(i.text), h = z(0);
  let p = "", g = 0, b, k = !1;
  const M = O(() => t.value && t.value.sha256 && !o.value ? t.value : null), L = O(() => Pi(n.value, c.value[0])), T = O(() => (h.value, d.canUndo)), F = O(() => (h.value, d.canRedo)), B = O(() => (h.value, d.undoLabel)), W = O(() => (h.value, d.redoLabel)), N = O(
    () => gw({
      text: i.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), j = O(
    () => s.value !== null && s.value !== i.text && !!t.value && !t.value.ok
  );
  function P(V, we) {
    if (t.value = V, a.value = null, V.ok) {
      n.value = V, s.value = we;
      const le = ym(V);
      c.value = c.value.filter((q) => le.has(q));
    }
  }
  async function Q() {
    const V = i.text, we = ++g;
    if (p = V, !V.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const le = await xp(e.fetcher, V, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (we !== g || p !== V || i.text !== V) return;
      P(le, V), l.value = null;
    } catch (le) {
      i.text === V && (l.value = Ri(le), a.value = l.value);
    } finally {
      i.text === V && (o.value = !1);
    }
  }
  function H(V = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(b), b = setTimeout(() => {
      Q();
    }, V);
  }
  function x(V, we, le, q) {
    V !== i.text && (k = !0, i.text = V, k = !1, d.record(V, we, { group: le, extra: q }), h.value++, e.onEdit?.());
  }
  function E(V) {
    x(V, "typing", "typing"), H();
  }
  function fe(V, we, le = null, q) {
    return V === i.text ? !1 : (d.seal(), q && d.annotate(q.before), x(V, we, void 0, q?.after), d.seal(), clearTimeout(b), p = V, o.value = !1, u.value = [], le && le.ok && (le.lyrics || !e.lyrics?.()) ? (P(le, V), l.value = null) : H(0), !0);
  }
  async function pe(V) {
    const we = e.guard?.(V) ?? { operation: V, note: null };
    if (!we.operation)
      return u.value = we.note ? [we.note] : [], !1;
    const le = we.operation, q = i.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++g;
      const J = await Sp(e.fetcher, q, le, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (i.text !== q)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const Ae = e.onTransform?.(J, le);
      return d.seal(), Ae && d.annotate(Ae.before), x(J.abc, J.changes[0] ?? le.op, void 0, Ae?.after), d.seal(), clearTimeout(b), o.value = !1, p = J.abc, P(J.analysis, J.abc), u.value = [...J.changes, ...J.warnings.map((Fe) => `warning: ${Fe}`), ...we.note ? [we.note] : []], J.select.length && be(bm(J.analysis, J.select)), !0;
    } catch (J) {
      return l.value = Ri(J), !1;
    } finally {
      r.value = !1;
    }
  }
  function te(V) {
    V && (k = !0, i.text = V.text, k = !1, V.extra !== void 0 && e.onRestore?.(V.extra), h.value++, e.onEdit?.(), u.value = [], H(0));
  }
  const xe = () => te(d.undo()), ae = () => te(d.redo());
  function Re() {
    const V = s.value;
    return V === null || V === i.text || !n.value ? !1 : (d.seal(), x(V, "revert to the last valid score"), d.seal(), clearTimeout(b), p = V, o.value = !1, t.value = n.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function be(V) {
    c.value = e.selectable ? e.selectable(V) : V;
  }
  function De(V, we, le) {
    d.seal(), d.annotate(we), d.record(i.text, V, { extra: le, side: !0 }), d.seal(), h.value++;
  }
  function Ve() {
    r.value ? setTimeout(Ve, 60) : i.text.trim() && !o.value && Q();
  }
  Oe(
    () => i.text,
    (V) => {
      k || (d.seal(), d.record(V, "document replaced"), d.seal(), h.value++, H(0));
    },
    { flush: "sync" }
  );
  function He() {
    clearTimeout(b);
  }
  return H(0), Is({
    view: t,
    lastValid: n,
    lastValidText: s,
    current: M,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: L,
    canUndo: T,
    canRedo: F,
    undoLabel: B,
    redoLabel: W,
    commitBlock: N,
    canRevert: j,
    typed: E,
    replaceText: fe,
    operate: pe,
    undo: xe,
    redo: ae,
    revertToLastValid: Re,
    select: be,
    analyze: Q,
    refreshLyrics: Ve,
    recordSide: De,
    dispose: He
  });
}
const vw = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, yw = { class: "facts" }, bw = { class: "body" }, kw = {
  key: 0,
  class: "hint"
}, ww = {
  key: 1,
  class: "error",
  role: "alert"
}, xw = { class: "tracks" }, Sw = { class: "number" }, Cw = ["onUpdate:modelValue", "aria-label"], Aw = ["value", "title"], Mw = {
  key: 0,
  class: "hint"
}, Tw = { class: "controls" }, $w = { title: "Foreign timing is quantised to this note value" }, Lw = ["value"], Dw = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, Bw = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, Ow = { class: "report" }, Ew = { key: 0 }, Iw = ["disabled"], Rw = /* @__PURE__ */ wt({
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
    const t = i, n = e, s = z(!1), o = z(null), r = z(null), l = z([]), a = z(uw(t.view)), u = z(!1), c = z(t.keepsGuide), d = O(() => l.value.filter((M) => M.notes > 0)), h = O(() => l.value.filter((M) => M.notes === 0)), p = O(
      () => r.value ? fw(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let g = 0;
    async function b(M) {
      const L = ++g;
      s.value = !0, o.value = null;
      try {
        const T = await Cp(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: M ? aw(l.value) : void 0
        });
        if (L !== g) return;
        r.value = T, M || (l.value = lw(T.tracks));
      } catch (T) {
        L === g && (o.value = Ri(T));
      } finally {
        L === g && (s.value = !1);
      }
    }
    function k() {
      b(!0);
    }
    return hs(() => {
      b(!1);
    }), (M, L) => (C(), A("div", {
      class: "plenio-overlay",
      onMousedown: L[9] || (L[9] = Ke((T) => n("close"), ["self"]))
    }, [
      f("div", vw, [
        f("header", null, [
          L[10] || (L[10] = f("h2", null, "Import MIDI", -1)),
          f("span", yw, R(i.filename), 1),
          f("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: L[0] || (L[0] = (T) => n("close"))
          }, "×")
        ]),
        f("div", bw, [
          s.value ? (C(), A("p", kw, "Reading the file…")) : G("", !0),
          o.value ? (C(), A("p", ww, R(o.value), 1)) : G("", !0),
          r.value && !o.value ? (C(), A(ce, { key: 2 }, [
            f("table", xw, [
              L[11] || (L[11] = f("thead", null, [
                f("tr", null, [
                  f("th", null, "Track"),
                  f("th", null, "Role")
                ])
              ], -1)),
              f("tbody", null, [
                (C(!0), A(ce, null, ye(d.value, (T) => (C(), A("tr", {
                  key: T.index
                }, [
                  f("td", null, [
                    f("span", Sw, R(T.number), 1),
                    oe(" " + R(D(dw)(T)), 1)
                  ]),
                  f("td", null, [
                    $e(f("select", {
                      "onUpdate:modelValue": (F) => T.role = F,
                      "aria-label": `Role of track ${T.number}`,
                      onChange: L[1] || (L[1] = (F) => k())
                    }, [
                      (C(!0), A(ce, null, ye(D(rw), (F) => (C(), A("option", {
                        key: F.value,
                        value: F.value,
                        title: F.title
                      }, R(F.label), 9, Aw))), 128))
                    ], 40, Cw), [
                      [Xn, T.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            h.value.length ? (C(), A("p", Mw, " Empty track(s) not shown: " + R(h.value.map((T) => T.number).join(", ")) + ". ", 1)) : G("", !0),
            f("p", Tw, [
              f("label", $w, [
                L[12] || (L[12] = oe(" grid ", -1)),
                $e(f("select", {
                  "onUpdate:modelValue": L[2] || (L[2] = (T) => a.value = T),
                  "aria-label": "Import grid",
                  onChange: L[3] || (L[3] = (T) => k())
                }, [
                  (C(!0), A(ce, null, ye(D(ua), (T) => (C(), A("option", {
                    key: T,
                    value: T
                  }, "1/" + R(T), 9, Lw))), 128))
                ], 544), [
                  [
                    Xn,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              f("label", Dw, [
                $e(f("input", {
                  "onUpdate:modelValue": L[4] || (L[4] = (T) => u.value = T),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: L[5] || (L[5] = (T) => k())
                }, null, 544), [
                  [Et, u.value]
                ]),
                L[13] || (L[13] = oe(" read chords from the notes ", -1))
              ]),
              i.keepsGuide && r.value.guide.length ? (C(), A("label", Bw, [
                $e(f("input", {
                  "onUpdate:modelValue": L[6] || (L[6] = (T) => c.value = T),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [Et, c.value]
                ]),
                L[14] || (L[14] = oe(" keep the Guide notes ", -1))
              ])) : G("", !0)
            ]),
            L[15] || (L[15] = f("h3", null, "What the import did", -1)),
            f("ul", Ow, [
              (C(!0), A(ce, null, ye(p.value, (T, F) => (C(), A("li", { key: F }, R(T), 1))), 128)),
              p.value.length ? G("", !0) : (C(), A("li", Ew, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : G("", !0)
        ]),
        f("footer", null, [
          L[16] || (L[16] = f("span", { class: "spacer" }, null, -1)),
          f("button", {
            onClick: L[7] || (L[7] = (T) => n("close"))
          }, "Cancel"),
          f("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: L[8] || (L[8] = (T) => r.value && n("insert", r.value, c.value))
          }, " Insert ", 8, Iw)
        ])
      ])
    ], 32));
  }
}), Pw = {
  key: 0,
  class: "stale-note",
  role: "status"
}, Nw = {
  key: 1,
  class: "error"
}, Vw = /* @__PURE__ */ wt({
  __name: "NotationView",
  props: {
    view: {},
    stale: { type: Boolean },
    selection: {},
    playing: {},
    zoom: {},
    locks: {}
  },
  emits: ["select"],
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, o = z(null), r = O(() => [...new Set([...(n.view?.display_abc ?? "").matchAll(/^V:\s*(\S+)/gm)].map((F) => F[1]))].flatMap((F, B) => n.locks?.[F === "Vocal" ? "vocal" : "ins"] ? [`locked-v${B}`] : [])), l = z(null);
    let a = /* @__PURE__ */ new Map(), u = {
      "plenio-selected": [],
      "plenio-playing": []
    }, c = !1, d = null, h = 0;
    function p(T) {
      const F = /* @__PURE__ */ new Map(), B = T.lines ?? [];
      for (const W of B)
        for (const N of W.staff ?? [])
          for (const j of N.voices ?? [])
            for (const P of j)
              P.el_type === "note" && typeof P.endChar == "number" && P.abselem?.elemset && F.set(P.endChar, P.abselem.elemset);
      return F;
    }
    function g(T) {
      const F = Pi(n.view, T);
      return F ? a.get(F.display[1]) ?? [] : [];
    }
    function b(T, F) {
      for (const B of u[T]) B.classList.remove(T);
      u[T] = F.flatMap(g);
      for (const B of u[T]) B.classList.add(T);
    }
    function k() {
      const T = o.value;
      if (!T) return;
      const F = n.view?.display_abc;
      if (!F) {
        T.innerHTML = "", a = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const B = getComputedStyle(T).color || "#dddddd";
        h = T.clientWidth;
        const W = Gg.renderAbc(T, F, {
          add_classes: !0,
          responsive: "resize",
          scale: n.zoom,
          foregroundColor: B,
          selectionColor: B,
          staffwidth: Math.max(480, Math.floor(T.clientWidth / n.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (N) => {
            const j = N;
            if (!n.view || typeof j.startChar != "number" || typeof j.endChar != "number") return;
            const P = Sm(n.view, j.startChar, j.endChar);
            P && s("select", P.id, c);
          }
        });
        a = p(W[0]), u = { "plenio-selected": [], "plenio-playing": [] }, b("plenio-selected", n.selection), b("plenio-playing", n.playing), l.value = null;
      } catch (B) {
        l.value = `The notation could not be drawn: ${B instanceof Error ? B.message : String(B)}`;
      }
    }
    function M(T) {
      const [F] = g(T), B = o.value?.parentElement;
      if (!F || !B) return;
      const W = B.getBoundingClientRect(), N = F.getBoundingClientRect();
      N.top < W.top ? B.scrollTop += N.top - W.top - 8 : N.bottom > W.bottom && (B.scrollTop += N.bottom - W.bottom + 8), N.left < W.left ? B.scrollLeft += N.left - W.left - 8 : N.right > W.right && (B.scrollLeft += N.right - W.right + 8);
    }
    e({ reveal: M }), Oe(() => [n.view?.display_abc, n.zoom], () => Qt(k)), Oe(
      () => n.selection,
      (T) => {
        b("plenio-selected", T), T[0] && M(T[0]);
      }
    ), Oe(
      () => n.playing,
      (T) => {
        b("plenio-playing", T), T[0] && M(T[0]);
      }
    ), hs(() => {
      k(), d = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - h) > 40 && k();
      }), o.value && d.observe(o.value);
    }), Yn(() => d?.disconnect());
    function L(T) {
      c = T.shiftKey || T.ctrlKey || T.metaKey;
    }
    return (T, F) => (C(), A("div", {
      class: Ee(["notation-wrap", { stale: i.stale }])
    }, [
      i.stale ? (C(), A("p", Pw, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : G("", !0),
      l.value ? (C(), A("p", Nw, R(l.value), 1)) : G("", !0),
      f("div", {
        ref_key: "host",
        ref: o,
        class: Ee(["notation", r.value]),
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: L
      }, null, 34)
    ], 2));
  }
});
function Gs(i, e) {
  let t = 1;
  for (const n of i.measures) {
    if (n.onset > e) break;
    t = n.n;
  }
  return t;
}
function qc(i, e) {
  return i.measures[Math.max(0, Math.min(i.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Yc(i, e, t) {
  const n = e > 0 ? Math.round(i / e) * e : Math.round(i);
  return Math.max(0, Math.min(t, n));
}
function _a(i, e) {
  const t = i.model;
  if (!t) return 0;
  const n = Gs(t, e), s = t.measures[n - 1], o = i.bars[n - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function Ka(i, e) {
  const t = i.model;
  if (!t || !i.bars.length || !t.measures.length) return null;
  let n = 0;
  for (let l = 0; l < i.bars.length && !(i.bars[l].start_s > e + Ho); l++)
    n = l;
  const s = i.bars[n], o = t.measures[Math.min(n, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function Uf(i, e) {
  const t = Gs(i, e), n = i.measures[t - 1];
  if (!n) return "1.1.1";
  const s = Number(n.meter.split("/")[0]) || 1, o = n.length / s, r = Math.max(0, e - n.onset), l = Math.min(s - 1, Math.floor(r / o)), a = i.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const Hw = 0.25, Ww = 30, pl = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, gl = 6e-3;
class zw {
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
  sounds = Ap();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), Ww), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + Hw; )
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
        u = js(t, o, this.sounds[e.part], e.midi, n, { level: pl[e.part] });
      } catch {
        try {
          u = js(t, o, "plain", e.midi, n, { level: pl[e.part] });
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
    r.type = "square", r.frequency.value = Mp(e.midi);
    const l = t.createGain(), a = pl.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + gl), o.gain.setValueAtTime(1, Math.max(r + gl, l - gl)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class Fw {
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
        s.resume(), this.off(e), this.tones.set(e, js(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
      js(s, s.destination, t, i, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
function _w(i, e = 0.8, t = "plain") {
  if (!i.length) return;
  const n = window.AudioContext ?? window.webkitAudioContext;
  if (n)
    try {
      pr ??= new n();
      const s = pr;
      s.resume();
      const o = s.currentTime + 0.01, r = 0.2 / Math.sqrt(i.length);
      for (const l of i) js(s, s.destination, t, l, o, { level: r }).release(o + e);
    } catch {
    }
}
const Kw = 200, Ji = /* @__PURE__ */ new Map(), Uw = 2;
function Gw(i, e) {
  if (i.numberOfChannels === 1) return i;
  const t = new e(1, 1, i.sampleRate).createBuffer(1, i.length, i.sampleRate), n = t.getChannelData(0);
  for (let s = 0; s < i.numberOfChannels; s++) {
    const o = i.getChannelData(s);
    for (let r = 0; r < o.length; r++) n[r] += o[r] / i.numberOfChannels;
  }
  return t;
}
function jw(i, e, t = Kw) {
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
function qw(i, e = Yw) {
  let t = Ji.get(i);
  if (!t) {
    for (t = (async () => {
      const n = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!n) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(i), o = await new n(1, 1, 48e3).decodeAudioData(s), r = Gw(o, n);
      return { buffer: r, envelope: jw(r.getChannelData(0), r.sampleRate) };
    })(), Ji.set(i, t); Ji.size > Uw; ) Ji.delete(Ji.keys().next().value);
    t.catch(() => Ji.delete(i));
  }
  return t;
}
async function Yw(i) {
  const e = await fetch(i);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function Xw(i, e, t, n) {
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
function Xc(i) {
  return !i || "problem" in i || !Array.isArray(i.midi) || !(i.rate > 0) ? null : { rate: i.rate, start: i.start ?? 0, midi: i.midi };
}
function Jw(i, e) {
  const t = Math.round((e - i.start) * i.rate);
  return t >= 0 && t < i.midi.length ? i.midi[t] : null;
}
function Zw(i, e, t) {
  let n = 0;
  for (let r = 0; r < i.measures.length; r++) i.measures[r].onset <= t && (n = r);
  const s = i.measures[n], o = e?.[n];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function Jc(i, e, t) {
  const n = [], s = (o) => {
    for (const r of o) {
      const l = Zw(i, e, r.onset + r.duration / 2), a = l === null ? null : Jw(t, l);
      a !== null && n.push(r.pitch - a);
    }
  };
  return s(i.tracks.vocal), n.length < 6 && s(i.tracks.ins), n.length < 6 ? 0 : (n.sort((o, r) => o - r), 12 * Math.round(n[Math.floor(n.length / 2)] / 12));
}
function Qw(i, e, t, n, s, o = 0) {
  const r = [];
  let l = [], a = null;
  const u = 1 / t.rate;
  for (let c = Math.max(0, n); c <= Math.min(s, i.measures.length - 1); c++) {
    const d = i.measures[c], h = e?.[c];
    if (!h || h[1] <= h[0]) {
      l.length > 1 && r.push(l), l = [], a = null;
      continue;
    }
    const p = Math.ceil((h[0] - t.start) * t.rate), g = Math.floor((h[1] - t.start) * t.rate - 1e-9);
    for (let b = p; b <= g; b++) {
      const k = b >= 0 && b < t.midi.length ? t.midi[b] : null, M = t.start + b * u;
      (k === null || a !== null && Math.abs(M - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = M, k !== null && l.push([d.onset + (M - h[0]) / (h[1] - h[0]) * d.length, k + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const ex = ["aria-label"], tx = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, nx = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, ix = ["aria-pressed"], sx = ["aria-pressed"], ox = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, rx = ["aria-pressed", "disabled"], lx = ["aria-pressed", "title"], ax = {
  class: "icon",
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, ux = ["d"], cx = ["aria-pressed", "disabled"], hx = ["aria-pressed", "title"], dx = {
  class: "icon",
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, fx = ["d"], px = { title: "Grid for drawing, moving and resizing" }, gx = { value: "auto" }, mx = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, vx = ["disabled"], yx = ["disabled"], bx = ["disabled", "title"], kx = ["disabled", "title"], wx = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, xx = ["disabled", "title"], Sx = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, Cx = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, Ax = ["title"], Mx = ["disabled"], Tx = { title: "The roll pages along with the playback line" }, $x = { class: "hint" }, Lx = {
  key: 0,
  class: "roll-note"
}, Dx = ["width", "height"], Bx = ["y", "width", "height"], Ox = ["x1", "x2", "y1", "y2"], Ex = ["x", "y"], Ix = ["x", "y"], Rx = ["d"], Px = ["x1", "x2", "y1", "y2"], Nx = ["x1", "x2", "y1", "y2"], Vx = ["transform"], Hx = ["y", "width", "height"], Wx = ["y"], zx = ["transform"], Fx = ["width", "height"], _x = ["x", "width", "height"], Kx = ["y", "width", "height"], Ux = ["y", "width", "height"], Gx = ["x", "y", "width", "height"], jx = ["d"], qx = ["x", "y"], Yx = ["y", "width", "height"], Xx = ["x", "y", "width", "height"], Jx = ["x", "y", "height"], Zx = ["x", "y"], Qx = ["x", "y"], eS = ["x1", "x2", "y2"], tS = ["x"], nS = ["x"], iS = ["x", "y", "width", "height"], sS = ["x", "y"], oS = {
  key: 2,
  class: "chord ghost"
}, rS = ["x", "y", "width", "height"], lS = ["x", "y"], aS = ["x", "y", "width", "height"], uS = ["x1", "x2", "y2"], cS = ["transform"], hS = ["y2"], dS = ["onKeydown"], fS = ["onKeydown"], Es = 5, Zc = 6.2, pS = 26, gS = /* @__PURE__ */ wt({
  __name: "PianoRoll",
  props: /* @__PURE__ */ Pt({
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
    trackModifiers: {},
    locks: { default: () => ({ vocal: !1, ins: !1 }) },
    locksModifiers: {}
  }),
  emits: /* @__PURE__ */ Pt(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete", "lyricAuto", "notice"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track", "update:locks"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, o = tt(i, "lyricSelection"), r = tt(i, "zoom"), l = tt(i, "audition"), a = tt(i, "rowHeight"), u = tt(i, "follow"), c = tt(i, "sungVisible"), d = tt(i, "waveVisible"), h = O(() => !!n.source && d.value), p = z(null), g = z(null), b = z(null), k = z(null), M = tt(i, "track"), L = tt(i, "locks"), T = z("draw"), F = z("auto"), B = z(null), W = z(null), N = z(!1), j = z(0), P = z(0), Q = z(0), H = z(0);
    let x = !1;
    const E = z(null), fe = z(null), pe = z(null);
    let te = !1;
    const xe = z(null);
    let ae = null, Re = null;
    const be = O(() => n.view?.model ?? null), De = O(() => be.value ? mh(be.value) : []), Ve = O(() => De.value.filter((v) => !L.value[v.track])), He = O(() => be.value?.tracks.chords ?? []), V = O(
      () => be.value ? Dp(be.value, {
        pxPerQuarter: r.value,
        snap: F.value,
        lyrics: !!n.lyrics,
        source: h.value,
        rowHeight: a.value
      }) : null
    ), we = z(null);
    function le(v) {
      l.value && ca(v, 0.35, n.sound);
    }
    function q(v) {
      if (l.value) {
        if (!v.pitches?.length) {
          s("notice", `The chord symbol ${v.name} has no pitches Plenio can play.`);
          return;
        }
        _w(v.pitches, 0.8, n.chordSound ?? "plain");
      }
    }
    const J = O(() => !n.readonly && !n.stale && !n.busy && !N.value), Ae = O(() => ds(n.view, n.selection)), Fe = O(() => fs(n.selection)), ut = O(() => ds(n.view, n.playing)), Dt = O(() => Yp(B.value)), Z = O(() => Bp(B.value)), _ = O(() => {
      const v = V.value, y = W.value;
      if (!v || !y) return null;
      const w = Op(y, v, P.value, j.value), U = new Set(y.keep);
      for (const he of Ep(Ve.value, w, v)) U.add(he.id);
      const K = new Set(y.keepChords);
      for (const he of Ip(He.value, y, v, P.value, j.value)) K.add(he.id);
      const ne = Rp(y, P.value);
      return { rect: w, ids: U, chords: K, lane: ne };
    }), ee = O(
      () => T.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), ke = O(
      () => n.lyrics && n.lyricsEditable ? " · lyrics lane: double-click a line: edit its words · double-click free room: a new line there · drag a line: move · drag its start or end: longer / shorter (lines stop at their neighbours, the others stay) · Del · Ctrl+C / Ctrl+V" : ""
    ), Se = O(() => be.value && n.locator !== null ? Uf(be.value, n.locator) : "");
    function St(v, y, w) {
      const U = xe.value?.fitted?.moves.find((K) => K.key === v);
      return U ? [U.start, U.end] : [y, w];
    }
    function sn(v) {
      return !!xe.value?.fitted?.moves.some((y) => y.key === v);
    }
    function On(v) {
      const y = xe.value;
      return !!y?.fitted && !y.fitted.free && (y.kind === "move" ? y.keys.includes(v) : y.key === v);
    }
    const jt = O(() => {
      const v = V.value, y = n.lyrics;
      if (!v || !y) return [];
      const w = y.parts.flatMap(
        (K) => K.lines.filter((ne) => ne.text).map((ne) => {
          const he = es(ne.block, ne.line), [Te, Ue] = St(he, ne.start, ne.end);
          return { ...ne, start: Te, end: Ue, key: he, off: Np(ne), hint: Pp(ne) };
        })
      ).sort((K, ne) => K.start - ne.start || K.line - ne.line), U = new Set(o.value);
      return w.map((K, ne) => {
        const he = Ge(K.start, v), Te = w.slice(ne + 1).find((dt) => dt.start > K.start), Ue = Te ? Ge(Te.start, v) - he - 2 : 640, Le = Math.max(16, Ge(K.end, v) - he), je = Math.max(1, Math.floor((Math.max(Le, Math.min(Ue, K.text.length * Zc + 8)) - 8) / Zc)), at = K.text.length > je ? `${K.text.slice(0, Math.max(1, je - 1))}…` : K.text;
        return { ...K, x: he, width: Le, shown: at, selected: U.has(K.key), dragged: sn(K.key), stopped: On(K.key) };
      }).filter((K) => At(K.start, Math.max(K.end, K.start + 64)));
    }), Vt = O(() => !!n.lyrics?.parts.some((v) => v.lines.some((y) => y.pinned)));
    function wi() {
      p.value?.focus({ preventScroll: !0 }), s("lyricAuto");
    }
    function Ui(v) {
      const y = jt.value.filter((K) => v >= K.x - Es && v <= K.x + K.width + Es), w = y.find((K) => v >= K.x && v <= K.x + K.width) ?? y[0];
      if (!w) return null;
      const U = v >= w.x + w.width - Es ? "end" : v <= w.x + Es && w.width > 3 * Es ? "start" : "move";
      return { key: w.key, start: w.start, end: w.end, part: U };
    }
    function Zn(v) {
      const y = V.value;
      if (!n.lyrics || !y) return { moves: [], free: !0, stoppedAt: null };
      const w = Math.max(1, Math.round(be.value?.grid.units_per_quarter ?? 1));
      return Xp(n.lyrics, v, y.total, w);
    }
    function Ct(v) {
      const y = n.lyrics?.parts.flatMap((K) => K.lines) ?? [], w = v.moves.filter((K) => {
        const ne = y.find((he) => es(he.block, he.line) === K.key);
        return !ne || ne.start !== K.start || ne.end !== K.end;
      }), U = v.free ? void 0 : v.stoppedAt ? `The line stops at "${v.stoppedAt.text}": lyrics lines never overlap - shorten or move that line first.` : "The line stays inside its lyrics block: it stops at the next block's lines (or at the end of the score).";
      (w.length || U) && s("lyricPlace", w, U);
    }
    const qt = O(() => {
      const v = /* @__PURE__ */ new Map();
      for (const y of n.lyrics?.parts ?? [])
        for (const w of y.lines) for (const U of w.syllables) v.set(U.onset, U.end_of_word ? U.text : `${U.text}-`);
      return v;
    }), Ht = O(() => {
      const v = V.value;
      return v ? Qn.value.map((y) => ({ n: y, rect: Ms(y, v) })).filter(({ rect: y }) => y.width >= pS).map(({ n: y, rect: w }) => ({ key: y.id, x: w.x + 2, y: w.y + w.height - 2.5, text: aa(y.pitch) })) : [];
    }), En = O(() => {
      const v = V.value;
      return !v || !qt.value.size ? [] : Qn.value.filter((y) => y.track === "vocal" && qt.value.has(y.onset)).map((y) => {
        const w = Ms(y, v);
        return { key: y.id, x: w.x + 1, y: w.y - 2, text: qt.value.get(y.onset) };
      });
    });
    function it(v, y) {
      const w = n.lyrics, U = V.value;
      if (!w || !U) return null;
      const K = Ui(v);
      if (K && K.part !== "end") {
        const he = w.parts.flatMap((Te) => Te.lines).find((Te) => es(Te.block, Te.line) === K.key);
        if (he) return { block: he.block, line: he.line, text: he.text, original: he.text, start: he.start };
      }
      const ne = Jp(w, y, U.snap, U.total, Math.max(1, Math.round(be.value?.grid.units_per_quarter ?? 1)));
      if (!ne) {
        const he = K && w.parts.flatMap((Te) => Te.lines).find((Te) => es(Te.block, Te.line) === K.key);
        return he ? { block: he.block, line: he.line, text: he.text, original: he.text, start: he.start } : null;
      }
      return { block: ne.block, line: ne.line, text: "", original: "", start: ne.start, at: ne.start, end: ne.end };
    }
    function xi(v, y) {
      const w = it(v, y);
      w && (te = !1, pe.value = w, Qt(() => {
        fe.value?.focus(), fe.value?.select();
      }));
    }
    function Wt() {
      const v = pe.value;
      if (pe.value = null, !v || te) {
        te = !1;
        return;
      }
      p.value?.focus({ preventScroll: !0 }), v.text.trim() !== v.original.trim() && s("lyricEdit", {
        block: v.block,
        line: v.line,
        text: v.text.trim(),
        at: v.start,
        ...v.end !== void 0 ? { end: v.end } : {}
      });
    }
    function yn() {
      te = !0, pe.value = null, p.value?.focus({ preventScroll: !0 });
    }
    const Bt = O(() => be.value ? `1/${Math.round(da(be.value) / (V.value?.snap ?? 1))}` : ""), In = O(() => {
      const v = V.value;
      if (!v) return [0, 0];
      const y = Q.value || 1e5;
      return [Fn(j.value - 200, v), Fn(j.value + y + 200, v)];
    }), At = (v, y) => y >= In.value[0] && v <= In.value[1], Qn = O(() => De.value.filter((v) => At(v.onset, v.onset + v.duration))), on = O(
      () => He.value.map((v, y) => ({ chord: v, next: He.value[y + 1] })).filter(({ chord: v }) => At(v.onset, v.onset + 64))
    ), ei = O(() => be.value ? Vp(be.value).filter((v) => At(v.unit, v.unit)) : []), bn = O(() => {
      const v = V.value;
      return v ? Array.from({ length: v.high - v.low + 1 }, (y, w) => v.high - w) : [];
    }), Si = O(() => {
      const v = be.value;
      return v ? v.sections.filter((y) => !y.implicit).map((y) => ({ label: y.label, unit: v.measures[y.first_bar - 1]?.onset ?? 0 })).filter((y) => At(y.unit, y.unit + 64)) : [];
    });
    function Rn(v) {
      const y = b.value?.getBoundingClientRect();
      return [v.clientX - (y?.left ?? 0), v.clientY - (y?.top ?? 0)];
    }
    function ti(v) {
      return {
        note: !0,
        [v.track]: !0,
        selected: (_.value?.ids ?? Ae.value).has(v.id),
        playing: ut.value.has(v.id),
        dragged: Dt.value.has(v.id),
        locked: L.value[v.track]
      };
    }
    function Pn(v) {
      const y = v.track === "vocal" ? "Vocal" : "Ins";
      let w = 1;
      for (const U of be.value?.measures ?? []) U.onset <= v.onset && (w = U.n);
      return `${y} bar ${w}: ${v.name}, ${v.duration} units`;
    }
    function zt(v) {
      s("select", v);
    }
    const kn = {
      closed: "M4 6.5V4.5a3 3 0 0 1 6 0v2M3 6.5h8v5.5H3z",
      open: "M4 6.5V4.5a3 3 0 0 1 5.8-1M3 6.5h8v5.5H3z"
    };
    function wn(v) {
      L.value = { ...L.value, [v]: !L.value[v] };
    }
    function Nn(v) {
      const y = V.value;
      if (!y || v.button !== 0) return;
      p.value?.focus({ preventScroll: !0 });
      const [w, U] = Rn(v), K = iu(w, U, Ve.value, He.value, y, M.value, P.value, j.value);
      if (K.area === "keys") {
        l.value && ca(K.pitch, 0.35, n.sound);
        return;
      }
      if (K.area === "header" || K.area === "source") {
        s("locate", Yc(K.unit, y.snap, y.total)), ae = { x: w, y: U, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, Ot(v);
        return;
      }
      const ne = v.shiftKey || v.ctrlKey || v.metaKey;
      if (K.area === "lyrics") {
        const Le = Ui(w);
        if (!Le) {
          ne || (o.value = []);
          return;
        }
        n.selection.length && zt([]);
        const je = o.value, at = je.includes(Le.key), dt = ne ? at ? je.filter((Ti) => Ti !== Le.key) : [...je, Le.key] : at ? je : [Le.key];
        if (dt !== je && (o.value = dt), n.lyricsEditable && (dt.includes(Le.key) || Le.part !== "move")) {
          const Ti = Le.part === "move" ? [...dt] : [Le.key];
          ae = { x: w, y: U, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Le.part, key: Le.key, keys: Ti, origin: Fn(w, y), delta: 0 } }, Ot(v);
        }
        return;
      }
      o.value.length && !ne && (o.value = []);
      let he = null, Te = !1, Ue = null;
      if (K.area === "note") {
        const Le = Ae.value.has(K.note.id);
        let je;
        if (ne) {
          const at = new Set(Ae.value);
          Le ? at.delete(K.note.id) : at.add(K.note.id), je = De.value.filter((dt) => at.has(dt.id)), zt(go(je, He.value.filter((dt) => Fe.value.has(dt.id))));
        } else Le ? je = De.value.filter((at) => Ae.value.has(at.id)) : (je = [K.note], zt(go(je)));
        J.value && je.some((at) => at.id === K.note.id) && (he = K.edge === "end" && je.length === 1 ? Hp(K.note, De.value, y.total) : Wp(je, K.note, Fn(w, y), su(U, y))), le(K.note.pitch);
      } else if (K.area === "chord") {
        if (ne) {
          const Le = new Set(Fe.value);
          Le.has(K.chord.id) ? Le.delete(K.chord.id) : Le.add(K.chord.id), zt([...n.selection.filter((je) => !je.startsWith("chord:")), ...Le]);
        } else Fe.value.has(K.chord.id) || zt([K.chord.id]);
        J.value && (he = zp(K.chord, Fn(w, y))), q(K.chord);
      } else if ((K.area === "grid" || K.area === "lane") && (T.value === "select" || v.shiftKey))
        Ue = ne ? { notes: [...Ae.value], chords: He.value.filter((Le) => Fe.value.has(Le.id)) } : { notes: [], chords: [] }, Te = !ne;
      else if (K.area === "grid") {
        const Le = !n.selection.length && !o.value.length;
        J.value && !ne && !L.value[M.value] && (he = Fp(M.value, K.unit, K.pitch, y), le(K.pitch)), Te = !ne, ae = { x: w, y: U, start: he, started: !1, clear: Te, keep: Ue, insert: J.value && !ne && Le && !L.value[M.value] }, Ot(v);
        return;
      } else
        Te = !ne;
      ae = { x: w, y: U, start: he, started: !1, clear: Te, keep: Ue, from: { scrollTop: P.value, scrollLeft: j.value } }, Ot(v);
    }
    function Ot(v) {
      try {
        b.value?.setPointerCapture?.(v.pointerId);
      } catch {
      }
    }
    function Vn(v, y) {
      const w = g.value, U = V.value;
      if (!w || !U || y.start?.kind === "chord") return;
      const K = w.getBoundingClientRect();
      if (!K.height) return;
      const ne = U.rowHeight, he = !!y.keep && y.y - (y.from?.scrollTop ?? 0) < U.top;
      if (v.clientY < K.top + U.top + 12) {
        if (he && v.clientY < K.top + U.top) return;
        w.scrollTop = Math.max(0, w.scrollTop - ne);
      } else if (v.clientY > K.bottom - 16) w.scrollTop = w.scrollTop + ne;
      else return;
      mt();
    }
    function ct(v) {
      const y = V.value;
      if (!ae || !ae.start && !ae.keep && !ae.ruler && !ae.lyric || !y) return;
      const [w, U] = Rn(v);
      if (ae.ruler) {
        s("locate", Yc(Fn(w, y), y.snap, y.total));
        return;
      }
      if (ae.lyric) {
        if (!ae.started && Math.abs(w - ae.x) < ou) return;
        ae.started = !0;
        const K = Math.round((Fn(w, y) - ae.lyric.origin) / y.snap) * y.snap, ne = { ...ae.lyric, delta: K };
        xe.value = { ...ne, fitted: Zn(ne) };
        return;
      }
      if (ae.started && Vn(v, ae), !(!ae.started && Math.hypot(w - ae.x, U - ae.y) < ou)) {
        if (ae.started = !0, ae.keep)
          W.value = {
            x0: ae.x,
            y0: ae.y,
            x1: w,
            y1: U,
            from: ae.from,
            keep: ae.keep.notes,
            keepChords: ae.keep.chords.map((K) => K.id)
          };
        else if (ae.start) {
          const K = B.value, ne = _p(ae.start, Fn(w, y), su(U, y), y, { alt: v.altKey });
          ne.kind === "move" && ne.semitones !== (K?.kind === "move" ? K.semitones : 0) && le(ne.anchor.pitch + ne.semitones), B.value = ne;
        }
      }
    }
    async function Yt(v) {
      N.value = !0;
      try {
        await n.operate(v);
      } finally {
        N.value = !1, B.value = null;
      }
    }
    function Ci() {
      const v = ae;
      if (ae = null, !v || v.ruler) return;
      if (v.lyric) {
        const U = xe.value;
        xe.value = null, v.started && U?.delta && U.fitted && Ct(U.fitted);
        return;
      }
      if (!v.started) {
        if (B.value = null, v.insert && v.start?.kind === "draw" && V.value) {
          const U = V.value, K = Math.min(we.value ?? U.drawLength, U.total - v.start.start);
          Yt({ op: "insert_note", track: v.start.track, onset: v.start.start, duration: K, pitch: v.start.pitch });
          return;
        }
        v.clear && zt([]);
        return;
      }
      if (v.keep) {
        const U = _.value?.ids ?? /* @__PURE__ */ new Set(), K = _.value?.chords ?? new Set(v.keep.chords.map((ne) => ne.id));
        W.value = null, zt(go(De.value.filter((ne) => U.has(ne.id)), He.value.filter((ne) => K.has(ne.id))));
        return;
      }
      const y = B.value, w = y ? Kp(y, n.resizeMode) : null;
      if (!w) {
        B.value = null;
        return;
      }
      y?.kind === "draw" ? we.value = y.end - y.start : y?.kind === "resize" && (we.value = y.end - y.note.onset), Yt(w);
    }
    function Xt() {
      ae = null, B.value = null, W.value = null, xe.value = null;
    }
    function Ai(v) {
      const y = V.value;
      if (!y) return;
      const [w, U] = Rn(v), K = iu(w, U, De.value, He.value, y, M.value, P.value, j.value);
      if (K.area === "lyrics") {
        n.lyricsEditable && xi(w, K.unit);
        return;
      }
      if (J.value) {
        if (K.area === "grid") {
          if (T.value !== "draw") return;
          const ne = Math.min(ru(K.unit, y.snap), y.total - 1), he = Math.min(y.drawLength, y.total - ne);
          Yt({ op: "insert_note", track: M.value, onset: ne, duration: he, pitch: K.pitch });
        } else if (K.area === "lane" || K.area === "chord") {
          const ne = K.area === "chord" ? K.chord : null, he = K.area === "chord" ? K.chord.onset : Math.min(ru(K.unit, y.snap), y.total - 1);
          E.value = { onset: he, name: ne?.name ?? "", original: ne?.name ?? null }, Qt(() => {
            k.value?.focus(), k.value?.select();
          });
        }
      }
    }
    function Gi() {
      const v = E.value;
      if (E.value = null, p.value?.focus({ preventScroll: !0 }), !v) return;
      const y = v.name.trim();
      if (y !== (v.original ?? "")) {
        if (!y) {
          v.original !== null && Yt({ op: "delete_chord", onset: v.onset });
          return;
        }
        Yt({ op: "put_chord", onset: v.onset, name: y });
      }
    }
    function rn() {
      E.value = null, p.value?.focus({ preventScroll: !0 });
    }
    function As(v) {
      if (v.target?.closest("input, select, textarea")) return;
      const w = V.value;
      if (!w) return;
      if (o.value.length && !v.ctrlKey && !v.metaKey) {
        const Te = v.key === "ArrowLeft" ? -w.snap : v.key === "ArrowRight" ? w.snap : 0;
        if (v.key === "Delete" || v.key === "Backspace" || Te || v.key === "Escape") {
          if (v.preventDefault(), v.stopPropagation(), v.key === "Escape") o.value = [];
          else if (n.lyricsEditable) Te ? Ct(Zn({ kind: "move", key: "", keys: [...o.value], delta: Te })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (v.key === "Escape") {
        if (ae || B.value || W.value) Xt();
        else if (n.selection.length) zt([]);
        else return;
        v.preventDefault(), v.stopPropagation();
        return;
      }
      const U = v.key.toLowerCase();
      if ((U === "g" || U === "h") && !v.ctrlKey && !v.metaKey && !v.altKey) {
        v.preventDefault(), v.stopPropagation(), v.shiftKey ? Be(U === "h" ? 2 : -2) : Ft(U === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (U === "q" && !v.ctrlKey && !v.metaKey && !v.altKey) {
        v.preventDefault(), v.stopPropagation(), vt(v.shiftKey);
        return;
      }
      if (v.key.toLowerCase() === "a" && (v.ctrlKey || v.metaKey) && !v.altKey) {
        v.preventDefault(), v.stopPropagation(), zt(go(Ve.value, He.value));
        return;
      }
      const K = De.value.filter((Te) => Ae.value.has(Te.id)), ne = He.value.filter((Te) => Fe.value.has(Te.id)), he = Up(
        v.key,
        { shift: v.shiftKey, alt: v.altKey },
        K,
        ne,
        w,
        n.resizeMode
      );
      he !== void 0 && (v.preventDefault(), v.stopPropagation(), he && J.value && Yt(he));
    }
    function mt() {
      j.value = g.value?.scrollLeft ?? 0, P.value = g.value?.scrollTop ?? 0, Q.value = g.value?.clientWidth ?? 0, H.value = g.value?.clientHeight ?? 0;
    }
    function ln() {
      const v = V.value, y = g.value;
      x || !v || !y || !y.clientHeight || (x = !0, y.scrollTop = Gp(v, y.clientHeight, v.focus[0], v.focus[1]), mt());
    }
    function ni(v, y = !0) {
      const w = V.value, U = g.value, K = De.value.find((Te) => v.has(Te.id));
      if (!w || !U || !K || !U.clientWidth) return;
      const ne = Ge(K.onset, w);
      y && (ne < U.scrollLeft + Li || ne > U.scrollLeft + U.clientWidth - 40) && (U.scrollLeft = Math.max(0, ne - U.clientWidth / 3));
      const he = U.clientHeight ? lu(w, U.scrollTop, U.clientHeight, K.pitch) : null;
      he !== null && (U.scrollTop = he), mt();
    }
    function Ft(v, y) {
      const w = g.value, U = V.value, K = Math.max(12, Math.min(240, Math.round(r.value * v)));
      if (K === r.value) return;
      if (!w || !U) {
        r.value = K;
        return;
      }
      const ne = w.getBoundingClientRect(), he = n.locator !== null ? Ge(n.locator, U) - w.scrollLeft : null, Te = y !== void 0 ? y - ne.left : he !== null && he >= Li && he <= w.clientWidth ? he : w.clientWidth / 2, Ue = Fn(w.scrollLeft + Te, U);
      r.value = K, Qt(() => {
        const Le = V.value;
        Le && (w.scrollLeft = Math.max(0, Ge(Ue, Le) - Te), mt());
      });
    }
    function Hn(v) {
      const y = v.deltaY || v.deltaX;
      if (v.altKey || (v.ctrlKey || v.metaKey) && v.shiftKey) {
        v.preventDefault(), Be(y < 0 ? 1 : -1, v.clientY);
        return;
      }
      !v.ctrlKey && !v.metaKey || (v.preventDefault(), Ft(y < 0 ? 1.15 : 1 / 1.15, v.clientX));
    }
    function Be(v, y) {
      const w = g.value, U = V.value, K = Math.max(jp, Math.min(qp, a.value + v));
      if (K === a.value) return;
      if (!w || !U) {
        a.value = K;
        return;
      }
      const ne = w.getBoundingClientRect(), he = y !== void 0 ? y - ne.top : w.clientHeight / 2, Te = U.high - (w.scrollTop + he - U.top) / U.rowHeight;
      a.value = K, Qt(() => {
        const Ue = V.value;
        Ue && (w.scrollTop = Math.max(0, Ue.top + (Ue.high - Te) * Ue.rowHeight - he), mt());
      });
    }
    function vt(v) {
      const y = V.value;
      if (!y || !J.value) return;
      const w = Ae.value.size ? De.value.filter((U) => Ae.value.has(U.id)) : Ve.value;
      w.length && Yt({ op: "quantize", ids: w.map((U) => U.id), grid: y.snap, lengths: v });
    }
    const Mt = O(() => {
      const v = n.source?.envelope;
      if (!v) return 1;
      let y = 0;
      for (let w = 0; w < v.max.length; w++) y = Math.max(y, v.max[w], -v.min[w]);
      return y || 1;
    }), ii = O(() => {
      const v = V.value, y = be.value, w = n.sung;
      if (!v || !y || !w?.curve || !c.value) return [];
      const [U, K] = In.value;
      let ne = 0, he = y.measures.length - 1;
      y.measures.forEach((Ue, Le) => {
        Ue.onset + Ue.length < U && (ne = Le + 1), Ue.onset <= K && (he = Le);
      });
      const Te = (Ue) => v.top + (v.high - Ue) * v.rowHeight + v.rowHeight / 2;
      return Qw(y, w.bars, w.curve, ne, he, w.offset).map((Ue, Le) => ({
        key: `c${ne}-${Le}`,
        d: Ue.map(([je, at], dt) => `${dt ? "L" : "M"}${Ge(je, v).toFixed(1)} ${Te(at).toFixed(1)}`).join("")
      }));
    }), Mi = O(() => {
      const v = n.sung?.offset ?? 0;
      if (!v) return "sung";
      const y = Math.abs(v / 12);
      return `sung ${v > 0 ? "+" : "−"}${y > 1 ? y : ""}8va`;
    }), ji = O(() => {
      const v = n.sung;
      if (!v) return "";
      if (v.problem) return `No sung pitch: ${v.problem}`;
      const y = v.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${y ? ` - drawn ${Math.abs(y / 12)} octave${Math.abs(y) > 12 ? "s" : ""} ${y > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), si = O(() => {
      const v = V.value, y = be.value, w = n.source;
      if (!v || !y || !w || v.sourceTop === null) return [];
      const U = v.sourceTop + po / 2, K = (po / 2 - 3) / Mt.value, ne = [];
      return y.measures.forEach((he, Te) => {
        if (!At(he.onset, he.onset + he.length)) return;
        const Ue = Ge(he.onset, v), Le = he.length * v.pxPerUnit, je = w.bars?.[Te];
        if (!je) {
          ne.push({ key: `w${Te}`, d: "", missing: !0, x: Ue, width: Le });
          return;
        }
        const at = Math.max(1, Math.floor(Le / 2)), dt = [];
        Xw(w.envelope, je[0], je[1], at).forEach(([Ti, Pr], ho) => {
          const Wn = (Ue + (ho + 0.5) * (Le / at)).toFixed(1);
          dt.push(`M${Wn} ${(U - Pr * K - 0.5).toFixed(1)}V${(U - Ti * K + 0.5).toFixed(1)}`);
        }), ne.push({ key: `w${Te}`, d: dt.join(""), missing: !1, x: Ue, width: Le });
      }), ne;
    });
    function I(v) {
      const y = V.value, w = g.value;
      if (v === null || !y || !w || !w.clientWidth) return;
      const U = Ge(v, y);
      U >= w.scrollLeft + Li && U <= w.scrollLeft + w.clientWidth - 24 || (w.scrollLeft = Math.max(0, U - Li - 24), mt());
    }
    return Oe(Ae, (v) => ni(v)), Oe(ut, (v) => {
      n.recorded && n.playhead !== null || (u.value || n.playhead === null) && ni(v, n.playhead === null);
    }), Oe(
      () => n.playhead,
      (v) => {
        u.value && I(v);
      }
    ), Oe(() => n.locator, I), Oe(
      () => n.recorded?.notes.at(-1)?.pitch,
      (v) => {
        const y = V.value, w = g.value;
        if (v === void 0 || !y || !w?.clientHeight) return;
        const U = lu(y, w.scrollTop, w.clientHeight, v);
        U !== null && (w.scrollTop = U, mt());
      }
    ), Oe(
      () => !!be.value,
      (v) => {
        v ? Qt(ln) : x = !1;
      }
    ), hs(() => {
      mt(), ln(), g.value && typeof ResizeObserver < "u" && (Re = new ResizeObserver(() => {
        mt(), ln();
      }), Re.observe(g.value));
    }), Yn(() => Re?.disconnect()), e({ zoomBy: Ft, zoomRows: Be }), (v, y) => (C(), A("div", {
      ref_key: "root",
      ref: p,
      class: Ee(["roll", { stale: i.stale, readonly: i.readonly, [`mode-${T.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": T.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: As
    }, [
      f("div", tx, [
        f("span", nx, [
          f("button", {
            class: Ee(["mode draw", { active: T.value === "draw" }]),
            "aria-pressed": T.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: y[0] || (y[0] = (w) => T.value = "draw")
          }, [...y[22] || (y[22] = [
            f("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              f("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            oe(" Draw ", -1)
          ])], 10, ix),
          f("button", {
            class: Ee(["mode select", { active: T.value === "select" }]),
            "aria-pressed": T.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: y[1] || (y[1] = (w) => T.value = "select")
          }, [...y[23] || (y[23] = [
            f("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              f("rect", {
                x: "2",
                y: "3",
                width: "10",
                height: "8",
                "stroke-dasharray": "2 1.5"
              })
            ], -1),
            oe(" Select ", -1)
          ])], 10, sx)
        ]),
        f("span", ox, [
          y[24] || (y[24] = oe(" draw into ", -1)),
          f("button", {
            class: Ee([{ active: M.value === "vocal" }, "vocal"]),
            "aria-pressed": M.value === "vocal",
            disabled: L.value.vocal,
            onClick: y[2] || (y[2] = (w) => M.value = "vocal")
          }, " Vocal ", 10, rx),
          f("button", {
            class: Ee(["lock", { on: L.value.vocal }]),
            "aria-pressed": L.value.vocal,
            "aria-label": "Lock the Vocal track",
            "data-testid": "lock-vocal",
            title: L.value.vocal ? "The Vocal notes are locked: click to edit them again" : "Lock the Vocal notes: they stay as they are while the other track is edited (bars added or removed still apply to both)",
            onClick: y[3] || (y[3] = (w) => wn("vocal"))
          }, [
            (C(), A("svg", ax, [
              f("path", {
                d: kn[L.value.vocal ? "closed" : "open"]
              }, null, 8, ux)
            ]))
          ], 10, lx),
          f("button", {
            class: Ee([{ active: M.value === "ins" }, "ins"]),
            "aria-pressed": M.value === "ins",
            disabled: L.value.ins,
            onClick: y[4] || (y[4] = (w) => M.value = "ins")
          }, " Ins ", 10, cx),
          f("button", {
            class: Ee(["lock", { on: L.value.ins }]),
            "aria-pressed": L.value.ins,
            "aria-label": "Lock the Instrument track",
            "data-testid": "lock-ins",
            title: L.value.ins ? "The Instrument notes are locked: click to edit them again" : "Lock the Instrument notes: they stay as they are while the other track is edited (bars added or removed still apply to both)",
            onClick: y[5] || (y[5] = (w) => wn("ins"))
          }, [
            (C(), A("svg", dx, [
              f("path", {
                d: kn[L.value.ins ? "closed" : "open"]
              }, null, 8, fx)
            ]))
          ], 10, hx)
        ]),
        f("label", px, [
          y[29] || (y[29] = oe(" snap ", -1)),
          $e(f("select", {
            "onUpdate:modelValue": y[6] || (y[6] = (w) => F.value = w),
            "aria-label": "Snap"
          }, [
            f("option", gx, "auto (" + R(F.value === "auto" ? Bt.value : "score") + ")", 1),
            y[25] || (y[25] = f("option", { value: 4 }, "1/4", -1)),
            y[26] || (y[26] = f("option", { value: 8 }, "1/8", -1)),
            y[27] || (y[27] = f("option", { value: 16 }, "1/16", -1)),
            y[28] || (y[28] = f("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [Xn, F.value]
          ])
        ]),
        f("span", mx, [
          f("button", {
            disabled: !i.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: y[7] || (y[7] = (w) => s("clipboard", "copy"))
          }, " Copy ", 8, vx),
          f("button", {
            disabled: !i.selection.length || !J.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: y[8] || (y[8] = (w) => s("clipboard", "cut"))
          }, " Cut ", 8, yx),
          f("button", {
            disabled: !i.clip || !J.value || i.locator === null,
            title: i.clip ? `Paste ${i.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: y[9] || (y[9] = (w) => s("clipboard", "paste"))
          }, " Paste ", 8, bx),
          f("button", {
            disabled: !i.clip || !J.value || i.locator === null,
            title: i.clip ? `Insert ${i.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: y[10] || (y[10] = (w) => s("clipboard", "insert"))
          }, " Insert ", 8, kx)
        ]),
        f("label", wx, [
          $e(f("input", {
            "onUpdate:modelValue": y[11] || (y[11] = (w) => l.value = w),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [Et, l.value]
          ]),
          y[30] || (y[30] = oe(" hear ", -1))
        ]),
        f("button", {
          disabled: !J.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${Bt.value}); Shift+Q: their lengths too`,
          onClick: y[12] || (y[12] = (w) => vt(!1))
        }, " Q ", 8, xx),
        f("span", Sx, [
          f("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: y[13] || (y[13] = (w) => Ft(1 / 1.25))
          }, "−"),
          f("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: y[14] || (y[14] = (w) => Ft(1.25))
          }, "+"),
          f("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: y[15] || (y[15] = (w) => Be(-2))
          }, "↕−"),
          f("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: y[16] || (y[16] = (w) => Be(2))
          }, "↕+")
        ]),
        i.source ? (C(), A("label", Cx, [
          $e(f("input", {
            "onUpdate:modelValue": y[17] || (y[17] = (w) => d.value = w),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [Et, d.value]
          ]),
          y[31] || (y[31] = oe(" wave ", -1))
        ])) : G("", !0),
        i.sung ? (C(), A("label", {
          key: 1,
          title: ji.value,
          class: Ee({ unavailable: !!i.sung.problem })
        }, [
          $e(f("input", {
            "onUpdate:modelValue": y[18] || (y[18] = (w) => c.value = w),
            type: "checkbox",
            disabled: !!i.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, Mx), [
            [Et, c.value]
          ]),
          oe(" " + R(Mi.value), 1)
        ], 10, Ax)) : G("", !0),
        f("label", Tx, [
          $e(f("input", {
            "onUpdate:modelValue": y[19] || (y[19] = (w) => u.value = w),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [Et, u.value]
          ]),
          y[32] || (y[32] = oe(" follow ", -1))
        ]),
        i.lyrics && i.lyricsEditable && Vt.value ? (C(), A("button", {
          key: 2,
          title: "Lay the lyrics out on the notes again by the automatic rules: every line lets go of the place it has in the lyrics lane (the words stay; Ctrl+Z brings the places back)",
          onClick: wi
        }, " auto-place lyrics ")) : G("", !0),
        f("span", $x, R(ee.value) + R(ke.value), 1)
      ]),
      !be.value && i.view?.model_error ? (C(), A("p", Lx, R(i.view.model_error.message), 1)) : be.value && V.value ? (C(), A("div", {
        key: 1,
        ref_key: "scroller",
        ref: g,
        class: "roll-scroll",
        style: os({ height: `${Math.min(i.height, V.value.height + 16)}px` }),
        onScroll: mt,
        onWheel: Hn
      }, [
        (C(), A("svg", {
          ref_key: "svg",
          ref: b,
          class: "roll-svg",
          width: V.value.width,
          height: V.value.height,
          onPointerdown: Nn,
          onPointermove: ct,
          onPointerup: Ci,
          onPointercancel: Xt,
          onDblclick: Ai
        }, [
          (C(!0), A(ce, null, ye(bn.value, (w) => (C(), A("rect", {
            key: "row" + w,
            class: Ee(["row", { black: D(Tp)(w), c: w % 12 === 0 }]),
            x: 0,
            y: D(tu)(w, V.value),
            width: V.value.width,
            height: V.value.rowHeight
          }, null, 10, Bx))), 128)),
          (C(!0), A(ce, null, ye(ei.value, (w) => (C(), A("line", {
            key: "l" + w.unit,
            class: Ee(w.kind),
            x1: D(Ge)(w.unit, V.value),
            x2: D(Ge)(w.unit, V.value),
            y1: V.value.top,
            y2: V.value.height
          }, null, 10, Ox))), 128)),
          (C(!0), A(ce, null, ye(Qn.value, (w) => (C(), A("rect", fo({
            key: w.id,
            class: ti(w)
          }, { ref_for: !0 }, D(Ms)(w, V.value), { rx: "2" }), [
            f("title", null, R(Pn(w)), 1)
          ], 16))), 128)),
          (C(!0), A(ce, null, ye(Ht.value, (w) => (C(), A("text", {
            key: "p" + w.key,
            class: "note-name",
            x: w.x,
            y: w.y
          }, R(w.text), 9, Ex))), 128)),
          (C(!0), A(ce, null, ye(En.value, (w) => (C(), A("text", {
            key: "y" + w.key,
            class: "syllable",
            x: w.x,
            y: w.y
          }, R(w.text), 9, Ix))), 128)),
          (C(!0), A(ce, null, ye(ii.value, (w) => (C(), A("path", {
            key: w.key,
            class: "sung-pitch",
            d: w.d
          }, null, 8, Rx))), 128)),
          i.recorded ? (C(!0), A(ce, { key: 0 }, ye(i.recorded.notes, (w, U) => (C(), A("rect", fo({
            key: "rec" + U,
            class: "rec-note"
          }, { ref_for: !0 }, D(Ms)({ onset: w.onset, duration: Math.max(w.duration, 0.5), pitch: w.pitch }, V.value), { rx: "2" }), null, 16))), 128)) : G("", !0),
          (C(!0), A(ce, null, ye(Z.value, (w, U) => (C(), A("rect", fo({
            key: "ghost" + U,
            class: ["ghost", w.track]
          }, { ref_for: !0 }, D(Ms)(w, V.value), { rx: "2" }), null, 16))), 128)),
          _.value && _.value.rect.height > 0 ? (C(), A("rect", fo({
            key: 1,
            class: "band"
          }, _.value.rect), null, 16)) : G("", !0),
          i.locator !== null ? (C(), A("line", {
            key: 2,
            class: "locator",
            x1: D(Ge)(i.locator, V.value),
            x2: D(Ge)(i.locator, V.value),
            y1: V.value.top,
            y2: V.value.height
          }, null, 8, Px)) : G("", !0),
          i.playhead !== null ? (C(), A("line", {
            key: 3,
            class: "playhead",
            x1: D(Ge)(i.playhead, V.value),
            x2: D(Ge)(i.playhead, V.value),
            y1: V.value.top,
            y2: V.value.height
          }, null, 8, Nx)) : G("", !0),
          f("g", {
            class: "keys",
            transform: `translate(${j.value} 0)`
          }, [
            f("rect", {
              class: "keys-bg",
              x: 0,
              y: V.value.top,
              width: D(Li) - 2,
              height: V.value.height - V.value.top
            }, [...y[33] || (y[33] = [
              f("title", null, "Click a key to hear its pitch", -1)
            ])], 8, Hx),
            (C(!0), A(ce, null, ye(bn.value.filter((w) => w % 12 === 0), (w) => (C(), A("text", {
              key: "k" + w,
              class: "key-label",
              x: 4,
              y: D(tu)(w, V.value) + V.value.rowHeight - 2
            }, R(D($p)(w)), 9, Wx))), 128))
          ], 8, Vx),
          f("g", {
            class: "roll-top",
            transform: `translate(0 ${P.value})`
          }, [
            f("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: V.value.width,
              height: V.value.top
            }, null, 8, Fx),
            f("rect", {
              class: "ruler",
              x: D(Li),
              y: 0,
              width: V.value.width - D(Li),
              height: D(oi)
            }, [...y[34] || (y[34] = [
              f("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, _x),
            f("rect", {
              class: "lane",
              x: 0,
              y: D(oi),
              width: V.value.width,
              height: D(Yi)
            }, null, 8, Kx),
            i.source && V.value.sourceTop !== null ? (C(), A(ce, { key: 0 }, [
              f("rect", {
                class: "source-lane",
                x: 0,
                y: V.value.sourceTop,
                width: V.value.width,
                height: D(po)
              }, [...y[35] || (y[35] = [
                f("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, Ux),
              (C(!0), A(ce, null, ye(si.value, (w) => (C(), A(ce, {
                key: w.key
              }, [
                w.missing ? (C(), A("rect", {
                  key: 0,
                  class: "source-missing",
                  x: w.x,
                  y: V.value.sourceTop + 2,
                  width: w.width,
                  height: D(po) - 4
                }, [...y[36] || (y[36] = [
                  f("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, Gx)) : (C(), A("path", {
                  key: 1,
                  class: "source-wave",
                  d: w.d
                }, null, 8, jx))
              ], 64))), 128)),
              f("text", {
                class: "source-label",
                x: j.value + 3,
                y: V.value.sourceTop + 11
              }, "source", 8, qx)
            ], 64)) : G("", !0),
            i.lyrics ? (C(), A(ce, { key: 1 }, [
              f("rect", {
                class: "lyrics-lane",
                x: 0,
                y: D(Xi),
                width: V.value.width,
                height: D(Ts)
              }, null, 8, Yx),
              (C(!0), A(ce, null, ye(jt.value, (w) => (C(), A("g", {
                key: w.key,
                class: Ee(["lyric-line", { unsung: !w.syllables.length, selected: w.selected, dragged: w.dragged, stopped: w.stopped }])
              }, [
                f("rect", {
                  x: w.x,
                  y: D(Xi) + 3,
                  width: w.width,
                  height: D(Ts) - 6,
                  rx: "3"
                }, null, 8, Xx),
                i.lyricsEditable ? (C(), A("rect", {
                  key: 0,
                  class: "edge",
                  x: w.x + w.width - 3,
                  y: D(Xi) + 5,
                  width: 3,
                  height: D(Ts) - 10
                }, null, 8, Jx)) : G("", !0),
                f("text", {
                  x: w.x + 4,
                  y: D(Xi) + D(Ts) / 2 + 4
                }, R(w.shown), 9, Zx),
                w.off ? (C(), A("text", {
                  key: 1,
                  class: "line-off",
                  x: w.x + w.width - 5,
                  y: D(Xi) + D(Ts) / 2 + 4,
                  "text-anchor": "end"
                }, R(D(Lp)(w.off)), 9, Qx)) : G("", !0),
                f("title", null, R(w.text) + R(w.hint ? ` (${w.hint})` : "") + R(i.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter (it stops at the next line) · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : G("", !0),
            (C(!0), A(ce, null, ye(ei.value.filter((w) => w.kind === "bar"), (w) => (C(), A("line", {
              key: "t" + w.unit,
              class: "bar",
              x1: D(Ge)(w.unit, V.value),
              x2: D(Ge)(w.unit, V.value),
              y1: 0,
              y2: V.value.top
            }, null, 8, eS))), 128)),
            (C(!0), A(ce, null, ye(ei.value.filter((w) => w.bar), (w) => (C(), A("text", {
              key: "n" + w.unit,
              class: "bar-number",
              x: D(Ge)(w.unit, V.value) + 3,
              y: 12
            }, R(w.bar), 9, tS))), 128)),
            (C(!0), A(ce, null, ye(Si.value, (w) => (C(), A("text", {
              key: "s" + w.unit,
              class: "section-label",
              x: D(Ge)(w.unit, V.value) + 22,
              y: 12
            }, R(w.label), 9, nS))), 128)),
            (C(!0), A(ce, null, ye(on.value, ({ chord: w, next: U }) => (C(), A("g", {
              key: w.id,
              class: Ee(["chord", {
                selected: (_.value?.chords ?? Fe.value).has(w.id),
                dragged: B.value?.kind === "chord" && B.value.chord.id === w.id
              }])
            }, [
              f("rect", {
                x: D(Ge)(w.onset, V.value),
                y: D(oi) + 3,
                width: D(nu)(w, U, V.value),
                height: D(Yi) - 6,
                rx: "3"
              }, null, 8, iS),
              f("text", {
                x: D(Ge)(w.onset, V.value) + 4,
                y: D(oi) + D(Yi) / 2 + 4
              }, R(w.name), 9, sS),
              f("title", null, "chord " + R(w.name) + " - click to hear it, drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            B.value?.kind === "chord" ? (C(), A("g", oS, [
              f("rect", {
                x: D(Ge)(B.value.to, V.value),
                y: D(oi) + 3,
                width: D(nu)(B.value.chord, void 0, V.value),
                height: D(Yi) - 6,
                rx: "3"
              }, null, 8, rS),
              f("text", {
                x: D(Ge)(B.value.to, V.value) + 4,
                y: D(oi) + D(Yi) / 2 + 4
              }, R(B.value.chord.name), 9, lS)
            ])) : G("", !0),
            _.value?.lane && _.value.rect.width > 0 ? (C(), A("rect", {
              key: 3,
              class: "band",
              x: _.value.rect.x,
              y: D(oi),
              width: _.value.rect.width,
              height: D(Yi)
            }, null, 8, aS)) : G("", !0),
            i.playhead !== null ? (C(), A("line", {
              key: 4,
              class: "playhead",
              x1: D(Ge)(i.playhead, V.value),
              x2: D(Ge)(i.playhead, V.value),
              y1: 0,
              y2: V.value.top
            }, null, 8, uS)) : G("", !0),
            i.locator !== null ? (C(), A("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${D(Ge)(i.locator, V.value)} 0)`
            }, [
              f("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: V.value.top
              }, null, 8, hS),
              y[37] || (y[37] = f("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              f("title", null, "Cursor at " + R(Se.value) + " - click or drag in the ruler to move it", 1)
            ], 8, cS)) : G("", !0)
          ], 8, zx)
        ], 40, Dx)),
        E.value ? $e((C(), A("input", {
          key: 0,
          ref_key: "chordInput",
          ref: k,
          "onUpdate:modelValue": y[20] || (y[20] = (w) => E.value.name = w),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: os({ left: `${D(Ge)(E.value.onset, V.value)}px`, top: `${D(oi) + 1 + P.value}px` }),
          onKeydown: [
            et(Ke(Gi, ["prevent"]), ["enter"]),
            et(Ke(rn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: rn
        }, null, 44, dS)), [
          [lt, E.value.name]
        ]) : G("", !0),
        pe.value ? $e((C(), A("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: fe,
          "onUpdate:modelValue": y[21] || (y[21] = (w) => pe.value.text = w),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: os({ left: `${D(Ge)(pe.value.start, V.value)}px`, top: `${D(Xi) + 1 + P.value}px` }),
          onKeydown: [
            et(Ke(Wt, ["prevent"]), ["enter"]),
            et(Ke(yn, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Wt
        }, null, 44, fS)), [
          [lt, pe.value.text]
        ]) : G("", !0)
      ], 36)) : G("", !0)
    ], 42, ex));
  }
}), gr = (i) => [...new Set(i)].sort((e, t) => e - t);
function Qc(i, e, t, n) {
  if (t.range && n !== null) {
    const [s, o] = n <= e ? [n, e] : [e, n], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? gr([...i, ...r]) : r;
  }
  return t.toggle ? i.includes(e) ? i.filter((s) => s !== e) : gr([...i, e]) : [e];
}
function eh(i, e) {
  const t = new Set(e), n = Array.from({ length: i }, (s, o) => o).filter((s) => !t.has(s));
  return !n.length || n.length === i ? null : { order: n.map((s) => s + 1), selection: [] };
}
function th(i, e) {
  const t = gr(e).filter((o) => o >= 0 && o < i);
  if (!t.length) return null;
  const n = t[t.length - 1];
  return { order: [
    ...Array.from({ length: n + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: i - n - 1 }, (o, r) => n + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => n + 1 + r) };
}
function nh(i, e, t) {
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
function ih(i, e, t, n) {
  const s = gr(e).filter((a) => a >= 0 && a < i);
  if (!s.length || t < 0 || t > i) return null;
  const o = n ? Array.from({ length: i }, (a, u) => u) : Array.from({ length: i }, (a, u) => u).filter((a) => !s.includes(a)), r = n ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !n && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const ui = z(null);
function mr(i) {
  return i.id.startsWith("ins:") ? "ins" : "vocal";
}
function mS(i, e, t = null) {
  const n = [...new Set(e)].sort((u, c) => u - c).filter((u) => i.sections[u]), s = n.map((u) => i.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const d = i.measures[c.first_bar - 1], h = i.measures[c.first_bar - 1 + c.bars - 1], p = d.onset, g = h.onset + h.length;
    for (const k of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (k.onset >= g || k.onset + k.duration <= p) continue;
      const M = Math.max(k.onset, p);
      o.push({ track: mr(k), onset: M - p + a, duration: Math.min(k.onset + k.duration, g) - M, pitch: k.pitch });
    }
    for (const k of i.tracks.chords) k.onset >= p && k.onset < g && r.push({ onset: k.onset - p + a, name: k.name });
    const b = t?.[n[u]];
    l.push(b ? { onset: a, label: c.label, lyrics: b } : { onset: a, label: c.label }), a += g - p;
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
function vS(i) {
  const e = [...new Set(i)].sort((n, s) => n - s), t = [];
  for (let n = 0; n < e.length; ) {
    let s = n;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > n ? `${e[n]}-${e[s]}` : `${e[n]}`), n = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function yS(i, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => i.measures[r]);
  if (!t.length) return null;
  const n = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = i.measures[r], u = l + a;
    for (const c of [...i.tracks.vocal, ...i.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const d = Math.max(c.onset, l);
      n.push({ track: mr(c), onset: d - l + o, duration: Math.min(c.onset + c.duration, u) - d, pitch: c.pitch });
    }
    for (const c of i.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: i.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: n, chords: s, sections: [], label: vS(t.map((r) => r + 1)) };
}
function sh(i, e, t) {
  if (!e.length && !t.length) return null;
  const n = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => mr(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: i.unit,
    span: s - n,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: mr(l), onset: l.onset - n, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - n, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function oh(i) {
  const e = /^1\/(\d+)$/.exec(i.trim());
  return e ? Number(e[1]) : NaN;
}
function bS(i, e) {
  const t = oh(e) / oh(i.unit);
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
function kS(i, e) {
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
function rh(i, e, t, n) {
  const s = bS(i, e.unit);
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
const wS = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, xS = { class: "hint" }, SS = ["disabled"], CS = ["disabled"], AS = ["disabled"], MS = ["disabled"], TS = ["disabled"], $S = ["draggable", "aria-selected", "onDragstart", "onDragover"], LS = ["onClick"], DS = ["title"], BS = { key: 0 }, OS = ["onKeydown", "onBlur"], ES = { class: "facts" }, IS = {
  key: 0,
  class: "section-tools"
}, RS = ["onClick"], PS = ["onClick"], NS = ["onClick"], VS = ["onClick"], HS = {
  key: 1,
  class: "split"
}, WS = ["disabled"], zS = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, FS = { class: "hint" }, _S = ["disabled"], KS = ["disabled"], US = ["disabled"], GS = ["disabled"], jS = ["disabled"], qS = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], YS = /* @__PURE__ */ wt({
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
    const c = z(!1), d = z(null), h = z([]), p = z(null);
    let g = null;
    const b = z("sections"), k = z(!1), M = z(null), L = O(() => t.view?.sections ?? []), T = O(() => t.view?.bars ?? []), F = O(() => t.view && t.bar ? bl(t.view, t.bar) : -1), B = O(() => new Set(t.errorBars)), W = O(() => !t.readonly && !!t.view?.model && L.value.length > 0);
    Oe(L, (Z) => {
      l.value = (u ?? l.value).filter((_) => _ < Z.length), u = null;
    }), Oe(T, (Z) => {
      h.value = (g ?? h.value).filter((_) => _ < Z.length), g = null;
    });
    function N(Z, _) {
      s.value = Z, o.value = _;
    }
    function j(Z) {
      const _ = o.value.trim();
      s.value = null, _ && _ !== L.value[Z]?.label && n("operate", { op: "rename_section", section: Z + 1, label: _ });
    }
    function P(Z, _) {
      const ee = L.value[Z];
      ee && n("operate", { op: "move_section_boundary", section: Z + 1, start_bar: ee.start_bar + _ });
    }
    function Q(Z) {
      const _ = t.sourceStarts?.[Z - 1];
      return typeof _ == "number" ? Fo(_) : null;
    }
    function H(Z, _) {
      b.value = "sections";
      const ee = _.ctrlKey || _.metaKey;
      l.value = Qc(l.value, Z, { toggle: ee, range: _.shiftKey }, a.value), _.shiftKey || (a.value = Z);
      const ke = L.value[Z];
      ke && !ee && !_.shiftKey && n("goto", ke.start_bar);
    }
    function x(Z) {
      !Z || !W.value || (u = Z.selection, n("operate", { op: "arrange_sections", order: Z.order }));
    }
    const E = () => x(th(L.value.length, l.value)), fe = () => x(eh(L.value.length, l.value)), pe = (Z) => x(nh(L.value.length, l.value, Z));
    function te() {
      const Z = t.view?.model;
      if (!Z || !l.value.length) return;
      const _ = mS(Z, l.value, t.sectionLyrics ?? null);
      _ && (ui.value = _, n("notice", `copied ${_.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function xe(Z, _) {
      b.value = "bars";
      const ee = _.ctrlKey || _.metaKey;
      h.value = Qc(h.value, Z, { toggle: ee, range: _.shiftKey }, p.value), _.shiftKey || (p.value = Z);
      const ke = T.value[Z];
      ke && !ee && !_.shiftKey && n("goto", ke.index);
    }
    function ae(Z) {
      !Z || !W.value || (g = Z.selection, n("operate", { op: "arrange_measures", order: Z.order.map((_) => _ - 1) }));
    }
    const Re = () => ae(th(T.value.length, h.value)), be = () => ae(eh(T.value.length, h.value)), De = (Z) => ae(nh(T.value.length, h.value, Z));
    function Ve() {
      const Z = t.view?.model;
      if (!Z || !h.value.length) return;
      const _ = yS(Z, h.value);
      _ && (ui.value = _, n("notice", `copied ${_.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function He(Z) {
      const _ = Z.ctrlKey || Z.metaKey, ee = Z.key.toLowerCase();
      if (Z.key === "Delete" || Z.key === "Backspace") be();
      else if (_ && ee === "d") Re();
      else if (_ && ee === "c") Ve();
      else if (_ && ee === "x" && h.value.length < T.value.length)
        Ve(), be();
      else if (_ && (Z.key === "ArrowLeft" || Z.key === "ArrowUp")) De(-1);
      else if (_ && (Z.key === "ArrowRight" || Z.key === "ArrowDown")) De(1);
      else if (_ && ee === "a") h.value = T.value.map((ke, Se) => Se);
      else if (Z.key === "Escape" && h.value.length) h.value = [];
      else return !1;
      return !0;
    }
    function V(Z, _) {
      W.value && (b.value = "bars", h.value.includes(Z) || (h.value = [Z]), k.value = !0, _.dataTransfer?.setData("text/plain", "plenio-bars"), _.dataTransfer && (_.dataTransfer.effectAllowed = "copyMove"));
    }
    function we(Z, _) {
      if (!k.value) return;
      _.preventDefault();
      const ee = _.currentTarget.getBoundingClientRect();
      M.value = _.clientX < ee.left + ee.width / 2 ? Z : Z + 1, _.dataTransfer && (_.dataTransfer.dropEffect = _.altKey || _.ctrlKey ? "copy" : "move");
    }
    function le(Z) {
      !k.value || M.value === null || (Z.preventDefault(), ae(ih(T.value.length, h.value, M.value, Z.altKey || Z.ctrlKey)), q());
    }
    function q() {
      k.value = !1, M.value = null;
    }
    function J(Z) {
      if (!W.value || Z.target?.closest("input, textarea, select")) return;
      if (b.value === "bars") {
        He(Z) && (Z.preventDefault(), Z.stopPropagation());
        return;
      }
      const _ = Z.ctrlKey || Z.metaKey, ee = Z.key.toLowerCase();
      let ke = !0;
      Z.key === "Delete" || Z.key === "Backspace" ? fe() : _ && ee === "d" ? E() : _ && ee === "c" ? te() : _ && ee === "x" && l.value.length < L.value.length ? (te(), fe()) : _ && Z.key === "ArrowUp" ? pe(-1) : _ && Z.key === "ArrowDown" ? pe(1) : _ && ee === "a" ? l.value = L.value.map((Se, St) => St) : Z.key === "Escape" && l.value.length ? l.value = [] : ke = !1, ke && (Z.preventDefault(), Z.stopPropagation());
    }
    function Ae(Z, _) {
      W.value && (l.value.includes(Z) || (l.value = [Z]), c.value = !0, _.dataTransfer?.setData("text/plain", "plenio-sections"), _.dataTransfer && (_.dataTransfer.effectAllowed = "copyMove"));
    }
    function Fe(Z, _) {
      if (!c.value) return;
      _.preventDefault();
      const ee = _.currentTarget.getBoundingClientRect();
      d.value = _.clientY < ee.top + ee.height / 2 ? Z : Z + 1, _.dataTransfer && (_.dataTransfer.dropEffect = _.altKey || _.ctrlKey ? "copy" : "move");
    }
    function ut(Z) {
      !c.value || d.value === null || (Z.preventDefault(), x(ih(L.value.length, l.value, d.value, Z.altKey || Z.ctrlKey)), Dt());
    }
    function Dt() {
      c.value = !1, d.value = null;
    }
    return (Z, _) => (C(), A("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: J
    }, [
      W.value ? (C(), A("div", wS, [
        f("span", xS, R(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        f("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: E
        }, " Duplicate ", 8, SS),
        f("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: te
        }, " Copy ", 8, CS),
        f("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: _[0] || (_[0] = (ee) => pe(-1))
        }, "↑", 8, AS),
        f("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: _[1] || (_[1] = (ee) => pe(1))
        }, "↓", 8, MS),
        f("button", {
          disabled: !l.value.length || l.value.length >= L.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: fe
        }, " Delete ", 8, TS)
      ])) : G("", !0),
      f("ol", {
        class: "sections",
        onDragleave: _[5] || (_[5] = Ke((ee) => d.value = null, ["self"]))
      }, [
        (C(!0), A(ce, null, ye(L.value, (ee, ke) => (C(), A("li", {
          key: ke,
          class: Ee({
            current: ke === F.value,
            picked: l.value.includes(ke),
            "drop-before": d.value === ke,
            "drop-after": d.value === ke + 1 && ke === L.value.length - 1
          }),
          draggable: W.value,
          "aria-selected": l.value.includes(ke),
          onDragstart: (Se) => Ae(ke, Se),
          onDragover: (Se) => Fe(ke, Se),
          onDrop: ut,
          onDragend: Dt
        }, [
          f("div", {
            class: "section-head",
            onClick: (Se) => H(ke, Se)
          }, [
            f("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${ee.start_bar}`
            }, [
              s.value !== ke ? (C(), A("strong", BS, R(ee.label), 1)) : G("", !0)
            ], 8, DS),
            s.value === ke ? $e((C(), A("input", {
              key: 0,
              "onUpdate:modelValue": _[2] || (_[2] = (Se) => o.value = Se),
              class: "rename",
              "aria-label": "Section name",
              onClick: _[3] || (_[3] = Ke(() => {
              }, ["stop"])),
              onKeydown: [
                et(Ke((Se) => j(ke), ["prevent"]), ["enter"]),
                _[4] || (_[4] = et(Ke((Se) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (Se) => j(ke)
            }, null, 40, OS)), [
              [lt, o.value]
            ]) : G("", !0),
            f("span", ES, [
              oe(" bars " + R(ee.start_bar) + "-" + R(ee.start_bar + ee.bars - 1) + " · " + R(D(Fo)(ee.start_s)) + " ", 1),
              Q(ee.start_bar) ? (C(), A(ce, { key: 0 }, [
                oe(" · source " + R(Q(ee.start_bar)), 1)
              ], 64)) : G("", !0)
            ])
          ], 8, LS),
          i.readonly ? G("", !0) : (C(), A("div", IS, [
            f("button", {
              title: "Rename this section",
              onClick: (Se) => N(ke, ee.label)
            }, "Rename", 8, RS),
            ke > 0 ? (C(), A(ce, { key: 0 }, [
              f("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (Se) => P(ke, -1)
              }, "◀ bar", 8, PS),
              f("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (Se) => P(ke, 1)
              }, "bar ▶", 8, NS),
              f("button", {
                title: "Join this section to the one before",
                onClick: (Se) => n("operate", { op: "merge_section", section: ke + 1 })
              }, " Join ↑ ", 8, VS)
            ], 64)) : G("", !0)
          ]))
        ], 42, $S))), 128))
      ], 32),
      !i.readonly && i.bar ? (C(), A("div", HS, [
        f("label", null, [
          oe(" New section at bar " + R(i.bar) + ": ", 1),
          $e(f("input", {
            "onUpdate:modelValue": _[6] || (_[6] = (ee) => r.value = ee),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [lt, r.value]
          ])
        ]),
        f("button", {
          disabled: i.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: _[7] || (_[7] = (ee) => n("operate", { op: "split_section", bar: i.bar, label: r.value }))
        }, " Split ", 8, WS)
      ])) : G("", !0),
      W.value ? (C(), A("div", zS, [
        f("span", FS, R(h.value.length ? `${h.value.length} bar${h.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        f("button", {
          disabled: !h.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Re
        }, " Duplicate ", 8, _S),
        f("button", {
          disabled: !h.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: Ve
        }, " Copy ", 8, KS),
        f("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: _[8] || (_[8] = (ee) => De(-1))
        }, "←", 8, US),
        f("button", {
          disabled: !h.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: _[9] || (_[9] = (ee) => De(1))
        }, "→", 8, GS),
        f("button", {
          disabled: !h.value.length || h.value.length >= T.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: be
        }, " Delete ", 8, jS)
      ])) : G("", !0),
      f("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: _[10] || (_[10] = Ke((ee) => M.value = null, ["self"]))
      }, [
        (C(!0), A(ce, null, ye(T.value, (ee, ke) => (C(), A("button", {
          key: ee.index,
          role: "listitem",
          class: Ee(["bar", {
            selected: ee.index === i.bar,
            picked: h.value.includes(ke),
            error: B.value.has(ee.index),
            alt: i.view ? D(bl)(i.view, ee.index) % 2 === 1 : !1,
            "drop-before": M.value === ke,
            "drop-after": M.value === ke + 1 && ke === T.value.length - 1
          }]),
          draggable: W.value,
          "aria-selected": h.value.includes(ke),
          title: `Bar ${ee.index} · ${D(Fo)(ee.start_s)} · ${ee.chords.join(" ") || "no chord"}${W.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (Se) => xe(ke, Se),
          onDragstart: (Se) => V(ke, Se),
          onDragover: (Se) => we(ke, Se),
          onDrop: le,
          onDragend: q
        }, R(ee.index), 43, qS))), 128))
      ], 32)
    ], 32));
  }
}), XS = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, JS = {
  class: "group",
  "aria-label": "History"
}, ZS = ["disabled", "title"], QS = ["disabled", "title"], eC = {
  class: "group",
  "aria-label": "Pitch"
}, tC = ["disabled"], nC = ["disabled"], iC = ["disabled"], sC = ["disabled"], oC = {
  class: "group",
  "aria-label": "Length"
}, rC = ["disabled"], lC = ["disabled"], aC = ["disabled"], uC = ["disabled"], cC = {
  class: "group",
  "aria-label": "Chord"
}, hC = ["disabled", "onKeydown"], dC = ["disabled", "title"], fC = ["disabled", "title"], pC = {
  key: 0,
  class: "group fit-notes",
  role: "group",
  "aria-label": "Notes and lyrics"
}, gC = ["disabled", "title"], mC = ["title"], vC = ["disabled", "title"], yC = { class: "group whole" }, bC = { class: "whole-tools" }, kC = ["disabled"], wC = ["disabled"], xC = ["aria-label"], SC = ["disabled", "title", "onClick"], CC = ["disabled", "title", "onClick"], AC = ["disabled"], MC = ["disabled"], TC = ["disabled"], $C = ["disabled"], LC = /* @__PURE__ */ wt({
  __name: "ScorePalette",
  props: /* @__PURE__ */ Pt({
    view: {},
    selection: {},
    primary: {},
    busy: { type: Boolean },
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    undoLabel: {},
    redoLabel: {},
    stale: { type: Boolean },
    fit: {}
  }, {
    fitSurplus: { default: "auto" },
    fitSurplusModifiers: {}
  }),
  emits: /* @__PURE__ */ Pt(["operate", "undo", "redo", "fitNotes"], ["update:fitSurplus"]),
  setup(i, { emit: e }) {
    const t = i, n = tt(i, "fitSurplus"), s = e, o = O(() => t.fit?.lyrics ? t.fit.vocalLocked ? "The Vocal track is locked: unlock it to fit its notes." : null : "This sheet has no lyrics here to fit the notes to."), r = z(""), l = z(null), a = O(() => t.selection.filter((H) => t.view?.elements?.find((x) => x.id === H)?.kind === "note")), u = O(() => [...fs(t.selection)]), c = O(() => a.value.length > 0 || u.value.length > 0), d = O(() => t.primary !== null && t.primary.kind !== "note"), h = O(() => {
      const H = t.primary;
      return !H || !t.view ? null : t.view.chords?.find((x) => x.bar === H.bar && Math.abs(x.start_s - H.start_s) < 1e-6) ?? null;
    }), p = O(() => yl(t.view, t.primary, 1)), g = O(() => yl(t.view, t.primary, -1)), b = O(() => t.busy || !!t.stale), k = O(() => {
      const H = fs(t.selection);
      return (t.view?.model?.tracks.chords ?? []).filter((x) => H.has(x.id));
    }), M = O(() => !t.primary && k.value.length === 1 ? k.value[0] : null), L = O(() => !!t.primary || !!M.value), T = O(() => t.primary ? !!h.value : k.value.length > 0), F = O(
      () => M.value ? `Rename the selected chord symbol ${M.value.name} (Enter in the field)` : k.value.length > 1 ? "Select one chord symbol to rename it (or a note or rest to set one there)" : "Set the chord symbol at the selected note or rest"
    ), B = O(
      () => t.primary ? "Remove the chord symbol at the selection" : k.value.length > 1 ? `Remove the ${k.value.length} selected chord symbols` : "Remove the selected chord symbol"
    );
    function W() {
      const H = r.value.trim();
      !H || b.value || (t.primary ? s("operate", { op: "set_chord", id: t.primary.id, name: H }) : M.value && s("operate", { op: "put_chord", onset: M.value.onset, name: H }));
    }
    function N() {
      b.value || (t.primary ? h.value && s("operate", { op: "remove_chord", chord: h.value.id }) : k.value.length === 1 ? s("operate", { op: "delete_chord", onset: k.value[0].onset }) : k.value.length && s("operate", { op: "delete", ids: k.value.map((H) => H.id) }));
    }
    Oe(
      () => t.view?.header?.tempo_bpm,
      (H) => {
        l.value = H ?? null;
      },
      { immediate: !0 }
    ), Oe(
      () => t.primary ? h.value?.name ?? "" : M.value?.name ?? "",
      (H) => {
        r.value = H;
      },
      { immediate: !0 }
    );
    const j = Object.values(Kt).map(({ track: H, name: x }) => [H, x]), P = (H, x) => Rs(t.view, H, x);
    function Q(H) {
      u.value.length ? s("operate", { op: "set_note_pitch", ids: [...ds(t.view, t.selection), ...u.value], semitones: H }) : a.value.length && s("operate", { op: "shift_pitch", ids: a.value, semitones: H });
    }
    return (H, x) => (C(), A("div", XS, [
      f("div", JS, [
        f("button", {
          disabled: !i.canUndo || i.busy,
          title: `Undo${i.undoLabel ? ": " + i.undoLabel : ""} (Ctrl+Z)`,
          onClick: x[0] || (x[0] = (E) => s("undo"))
        }, "↶", 8, ZS),
        f("button", {
          disabled: !i.canRedo || i.busy,
          title: `Redo${i.redoLabel ? ": " + i.redoLabel : ""} (Ctrl+Y)`,
          onClick: x[1] || (x[1] = (E) => s("redo"))
        }, "↷", 8, QS)
      ]),
      f("div", eC, [
        f("button", {
          disabled: !c.value || i.busy,
          title: "Octave down (Shift+↓)",
          onClick: x[2] || (x[2] = (E) => Q(-12))
        }, "−8va", 8, tC),
        f("button", {
          disabled: !c.value || i.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: x[3] || (x[3] = (E) => Q(-1))
        }, "−1", 8, nC),
        f("button", {
          disabled: !c.value || i.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: x[4] || (x[4] = (E) => Q(1))
        }, "+1", 8, iC),
        f("button", {
          disabled: !c.value || i.busy,
          title: "Octave up (Shift+↑)",
          onClick: x[5] || (x[5] = (E) => Q(12))
        }, "+8va", 8, sC)
      ]),
      f("div", oC, [
        f("button", {
          disabled: !g.value || b.value,
          title: "Shorter from its end - also a note tied over a bar line, as one note; a rest fills the time ([)",
          onClick: x[6] || (x[6] = (E) => g.value && s("operate", g.value))
        }, " shorter ", 8, rC),
        f("button", {
          disabled: !p.value || b.value,
          title: "Longer, into the rest after the note (])",
          onClick: x[7] || (x[7] = (E) => p.value && s("operate", p.value))
        }, " longer ", 8, lC),
        f("button", {
          disabled: !a.value.length || i.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: x[8] || (x[8] = (E) => s("operate", { op: "note_to_rest", ids: a.value }))
        }, " rest ", 8, aC),
        f("button", {
          disabled: !d.value || i.busy,
          title: "Turn the rest into a note (N)",
          onClick: x[9] || (x[9] = (E) => i.primary && s("operate", { op: "rest_to_note", id: i.primary.id }))
        }, " note ", 8, uC)
      ]),
      f("div", cC, [
        $e(f("input", {
          "onUpdate:modelValue": x[10] || (x[10] = (E) => r.value = E),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !L.value || b.value,
          onKeydown: et(Ke(W, ["prevent"]), ["enter"])
        }, null, 40, hC), [
          [lt, r.value]
        ]),
        f("button", {
          disabled: !L.value || !r.value.trim() || b.value,
          title: F.value,
          onClick: W
        }, "set", 8, dC),
        f("button", {
          disabled: !T.value || b.value,
          title: B.value,
          onClick: N
        }, "remove", 8, fC)
      ]),
      i.fit ? (C(), A("div", pC, [
        f("button", {
          "data-testid": "fit-song",
          disabled: b.value || !!o.value,
          title: o.value ?? "As many notes as syllables in every line of the song: the song's own melody first, new notes on its chords, key and rhythm, or the notes that carry least left out. Ctrl+Z takes it back.",
          onClick: x[11] || (x[11] = (E) => s("fitNotes", !0))
        }, [
          x[21] || (x[21] = oe(" fit notes to lyrics", -1)),
          i.fit.off ? (C(), A("span", {
            key: 0,
            class: "off-count",
            title: `${i.fit.off} line(s) do not fit`
          }, R(i.fit.off), 9, mC)) : G("", !0)
        ], 8, gC),
        f("button", {
          "data-testid": "fit-selection",
          disabled: b.value || !!o.value || !i.fit.range,
          title: o.value ?? (i.fit.range ? "The same for the lines of the selected notes or lyrics lines" : "Select notes or lyrics lines first"),
          onClick: x[12] || (x[12] = (E) => s("fitNotes", !1))
        }, " fit selection ", 8, vC),
        $e(f("select", {
          "onUpdate:modelValue": x[13] || (x[13] = (E) => n.value = E),
          "aria-label": "Notes the lyrics do not need",
          title: "What becomes of notes the lyrics do not need"
        }, [...x[22] || (x[22] = [
          f("option", {
            value: "auto",
            title: "A phrase no line sings and a long rest of a line move to the Ins, single notes are left out"
          }, "spare notes: smart", -1),
          f("option", {
            value: "omit",
            title: "Every note the lyrics do not need is left out"
          }, "spare notes: leave out", -1),
          f("option", {
            value: "ins",
            title: "Every note the lyrics do not need moves to the Ins, where it is silent"
          }, "spare notes: to the Ins", -1)
        ])], 512), [
          [Xn, n.value]
        ])
      ])) : G("", !0),
      f("details", yC, [
        x[24] || (x[24] = f("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        f("div", bC, [
          f("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone down",
            onClick: x[14] || (x[14] = (E) => s("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, kC),
          f("button", {
            disabled: i.busy,
            title: "Transpose everything a semitone up",
            onClick: x[15] || (x[15] = (E) => s("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, wC),
          (C(!0), A(ce, null, ye(D(j), ([E, fe]) => (C(), A("span", {
            key: E,
            class: "track-octave",
            role: "group",
            "aria-label": `${fe} track octave`
          }, [
            oe(R(fe) + " ", 1),
            f("button", {
              disabled: i.busy || !!P(E, -12),
              title: P(E, -12) ?? `Every ${fe} note an octave down (chord symbols and keys stay)`,
              onClick: (pe) => s("operate", { op: "shift_track", track: E, semitones: -12 })
            }, " −8va ", 8, SC),
            f("button", {
              disabled: i.busy || !!P(E, 12),
              title: P(E, 12) ?? `Every ${fe} note an octave up (chord symbols and keys stay)`,
              onClick: (pe) => s("operate", { op: "shift_track", track: E, semitones: 12 })
            }, " +8va ", 8, CC)
          ], 8, xC))), 128)),
          f("label", null, [
            x[23] || (x[23] = oe(" tempo ", -1)),
            $e(f("input", {
              "onUpdate:modelValue": x[16] || (x[16] = (E) => l.value = E),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                lt,
                l.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          f("button", {
            disabled: i.busy || !l.value || l.value === i.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: x[17] || (x[17] = (E) => l.value && s("operate", { op: "set_tempo", bpm: l.value }))
          }, " set tempo ", 8, AC),
          f("button", {
            disabled: i.busy || !i.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: x[18] || (x[18] = (E) => s("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, MC),
          f("button", {
            disabled: i.busy,
            title: "Let the instrument play the vocal melody",
            onClick: x[19] || (x[19] = (E) => s("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, TC),
          f("button", {
            disabled: i.busy,
            title: "Replace every Vocal note by rests",
            onClick: x[20] || (x[20] = (E) => s("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, $C)
        ])
      ])
    ]));
  }
}), DC = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, BC = ["disabled", "title"], OC = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, EC = ["aria-checked", "disabled", "title", "onClick"], IC = ["disabled"], RC = ["title"], PC = ["disabled"], NC = { class: "align" }, VC = ["aria-expanded", "title"], HC = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, WC = ["title"], zC = ["title"], FC = ["disabled"], _C = {
  key: 0,
  class: "facts"
}, KC = ["title"], UC = { title: "A click on every beat (takes effect at the next start)" }, GC = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, jC = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, qC = ["checked"], YC = { title: "Practice speed; the score's tempo is not changed" }, XC = { class: "facts" }, JC = {
  key: 1,
  class: "error"
}, ZC = /* @__PURE__ */ wt({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ Pt({
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
  emits: /* @__PURE__ */ Pt(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(i, { expose: e, emit: t }) {
    const n = i, s = tt(i, "voices"), o = tt(i, "speed"), r = tt(i, "metronome"), l = tt(i, "hear"), a = tt(i, "sourceLevel"), u = tt(i, "sourceShift"), c = z(!1);
    function d(le) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + le) * 1e3) / 1e3));
    }
    const h = O(() => {
      const le = Math.round(u.value * 1e3);
      return le ? `${Math.abs(le)} ms ${le > 0 ? "later" : "earlier"}` : "in place";
    }), p = t, g = new zw(), b = z(!1), k = z(!1);
    let M = 0, L = null;
    const T = z(!1), F = z(0), B = z(null);
    let W = null;
    const N = O(() => n.bar ?? 1), j = O(() => n.from ?? n.view?.bars[N.value - 1]?.start_s ?? 0), P = O(() => n.position ? `the cursor (${n.position})` : `bar ${N.value}`), Q = O(() => !!n.view?.notes), H = O(() => !!n.reference && !!n.source && o.value === 1), x = O(() => n.reference ? n.sourceProblem ? n.sourceProblem : n.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function E() {
      const le = H.value ? l.value : "notes";
      return { tones: le === "source" ? 0 : 1, source: le === "notes" ? 0 : a.value };
    }
    function fe(le) {
      const q = n.view?.bars ?? [];
      let J = 1;
      for (const Ae of q) Ae.start_s <= le + Ho && (J = Ae.index);
      return J;
    }
    function pe(le) {
      if (n.loopRange) return [n.loopRange.from, n.loopRange.to];
      const q = n.view;
      if (!q) return null;
      const J = q.sections[bl(q, fe(le))];
      return J ? [J.start_s, J.end_s] : null;
    }
    function te(le = j.value, q = null) {
      const J = n.view;
      if (!J) return;
      be(), L = q;
      const Ae = T.value && !q ? pe(le) : null, Fe = Ae && (le < Ae[0] - Ho || le >= Ae[1] - Ho) ? Ae[0] : le, ut = H.value, Dt = ut ? Zp(J, n.timelineBars) : null, Z = { ...s.value };
      q?.mute && (Z[q.mute] = !1), W = {
        from: Fe,
        to: Ae ? Ae[1] : null,
        voices: Z,
        speed: o.value,
        metronome: r.value,
        guide: n.guide ?? [],
        clock: Dt
      };
      const _ = W;
      M = q ? ae(J, Fe, q.countIn, Dt) : 0;
      const ee = Qp(J, _).map((Se) => ({ ...Se, at: Se.at + M }));
      M && ee.unshift(...Re(J, Fe, q?.countIn ?? 0, M));
      const ke = ut && Dt && n.source ? eg(Dt, Fe, _.to).map((Se) => ({ ...Se, at: Se.at + M })) : [];
      try {
        g.play(ee, {
          source: ke.length && n.source ? { buffer: n.source.buffer, segments: ke } : null,
          levels: E(),
          length: M + ig(J, _),
          sounds: n.sounds,
          onTick: (Se) => {
            k.value = Se < M, !(Se < M) && (F.value = tg(_, Se - M), p("cursor", ng(J, F.value, _.voices)), p("time", F.value));
          },
          onEnd: () => {
            T.value && b.value && !q ? te(Ae?.[0] ?? _.from) : De();
          }
        }), b.value = !0, k.value = M > 0, B.value = null;
      } catch (Se) {
        B.value = Se instanceof Error ? Se.message : String(Se);
      }
    }
    function xe(le, q, J) {
      const Ae = le.bars[fe(q) - 1], Fe = Number(Ae?.meter.split("/")[0]) || 4;
      return { beat: (J?.[fe(q) - 1]?.realDur ?? Ae?.duration_s ?? 2) / Fe / au(o.value), beats: Fe };
    }
    function ae(le, q, J, Ae) {
      if (J <= 0) return 0;
      const { beat: Fe, beats: ut } = xe(le, q, Ae);
      return J * ut * Fe;
    }
    function Re(le, q, J, Ae) {
      const { beat: Fe, beats: ut } = xe(le, q, W?.clock ?? null);
      return sg(le.bars[fe(q) - 1] ?? null, ut, q, J, Ae, Fe);
    }
    function be() {
      g.stop(), b.value = !1, k.value = !1, L = null;
    }
    function De() {
      const le = b.value;
      be(), p("cursor", []), p("time", null), le && p("stopped");
    }
    function Ve(le, q) {
      return te(le, q), b.value;
    }
    function He(le) {
      const q = W;
      if (!q || !b.value) return null;
      const J = g.elapsedAt(le) - M, Ae = q.clock?.length ? q.clock : null, Fe = J * au(q.speed);
      return Ae ? og(Ae, rg(Ae, q.from) + Fe) : q.from + Fe;
    }
    function V() {
      b.value ? De() : te();
    }
    function we() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Oe(
      () => n.sounds,
      (le) => {
        le && g.setSounds(le);
      },
      { deep: !0 }
    ), Oe([l, a], () => {
      b.value && g.setLevels(E());
    }), Oe(
      () => n.from,
      (le, q) => {
        b.value && !L && le !== null && le !== void 0 && le !== q && te(le);
      }
    ), e({ toggle: V, stop: De, swap: we, playing: b, record: Ve, scoreSecondAt: He, countingIn: k }), Yn(() => g.close()), (le, q) => (C(), A("div", DC, [
      f("button", {
        disabled: !Q.value,
        title: b.value ? "Stop (Space)" : `Play from ${P.value} (Space)`,
        onClick: V
      }, R(b.value ? "■ stop" : "▶ play"), 9, BC),
      vp(le.$slots, "record", {
        playing: b.value,
        countingIn: k.value
      }),
      i.reference ? (C(), A("span", OC, [
        (C(), A(ce, null, ye(["both", "notes", "source"], (J) => f("button", {
          key: J,
          role: "radio",
          "aria-checked": l.value === J,
          class: Ee({ active: l.value === J }),
          disabled: !H.value && J !== "notes",
          title: x.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[J],
          onClick: (Ae) => l.value = J
        }, R(J), 11, EC)), 64)),
        f("button", {
          disabled: !H.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: we
        }, "A/B", 8, IC),
        f("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          q[14] || (q[14] = oe(" source ", -1)),
          $e(f("input", {
            "onUpdate:modelValue": q[0] || (q[0] = (J) => a.value = J),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !H.value,
            "aria-label": "Source level"
          }, null, 8, PC), [
            [
              lt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, RC),
        f("span", NC, [
          f("button", {
            class: Ee({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${h.value})`,
            onClick: q[1] || (q[1] = (J) => c.value = !c.value)
          }, " ⇆ align" + R(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, VC),
          c.value ? (C(), A("span", HC, [
            q[15] || (q[15] = f("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            f("button", {
              title: `One beat earlier (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: q[2] || (q[2] = (J) => d(-(i.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, WC),
            f("button", {
              title: "10 ms earlier",
              onClick: q[3] || (q[3] = (J) => d(-0.01))
            }, "◀ 10 ms"),
            f("strong", null, R(h.value), 1),
            f("button", {
              title: "10 ms later",
              onClick: q[4] || (q[4] = (J) => d(0.01))
            }, "10 ms ▶"),
            f("button", {
              title: `One beat later (${Math.round((i.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: q[5] || (q[5] = (J) => d(i.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, zC),
            f("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: q[6] || (q[6] = (J) => u.value = 0)
            }, "reset", 8, FC)
          ])) : G("", !0)
        ]),
        x.value ? (C(), A("span", _C, R(x.value), 1)) : G("", !0)
      ])) : G("", !0),
      f("label", {
        title: i.loopRange ? `Play to the end of the selection (${i.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        $e(f("input", {
          "onUpdate:modelValue": q[7] || (q[7] = (J) => T.value = J),
          type: "checkbox"
        }, null, 512), [
          [Et, T.value]
        ]),
        oe(" loop " + R(i.loopRange ? i.loopRange.label : "section"), 1)
      ], 8, KC),
      f("label", UC, [
        $e(f("input", {
          "onUpdate:modelValue": q[8] || (q[8] = (J) => r.value = J),
          type: "checkbox"
        }, null, 512), [
          [Et, r.value]
        ]),
        q[16] || (q[16] = oe(" metronome", -1))
      ]),
      f("span", GC, [
        f("label", null, [
          $e(f("input", {
            "onUpdate:modelValue": q[9] || (q[9] = (J) => s.value.Vocal = J),
            type: "checkbox"
          }, null, 512), [
            [Et, s.value.Vocal]
          ]),
          q[17] || (q[17] = oe(" Vocal", -1))
        ]),
        f("label", null, [
          $e(f("input", {
            "onUpdate:modelValue": q[10] || (q[10] = (J) => s.value.Ins = J),
            type: "checkbox"
          }, null, 512), [
            [Et, s.value.Ins]
          ]),
          q[18] || (q[18] = oe(" Ins", -1))
        ]),
        f("label", null, [
          $e(f("input", {
            "onUpdate:modelValue": q[11] || (q[11] = (J) => s.value.chords = J),
            type: "checkbox"
          }, null, 512), [
            [Et, s.value.chords]
          ]),
          q[19] || (q[19] = oe(" chords", -1))
        ]),
        i.guide?.length ? (C(), A("label", jC, [
          f("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: q[12] || (q[12] = (J) => s.value = { ...s.value, guide: J.target.checked })
          }, null, 40, qC),
          q[20] || (q[20] = oe(" Guide ", -1))
        ])) : G("", !0)
      ]),
      f("label", YC, [
        q[22] || (q[22] = oe(" speed ", -1)),
        $e(f("select", {
          "onUpdate:modelValue": q[13] || (q[13] = (J) => o.value = J),
          "aria-label": "Playback speed"
        }, [...q[21] || (q[21] = [
          f("option", { value: 0.5 }, "50 %", -1),
          f("option", { value: 0.75 }, "75 %", -1),
          f("option", { value: 1 }, "100 %", -1),
          f("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            Xn,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      f("span", XC, R(b.value ? `▶ ${D(Fo)(F.value)}` : `${i.position ? `cursor ${i.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      B.value ? (C(), A("span", JC, R(B.value), 1)) : G("", !0)
    ]));
  }
}), QC = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, e2 = { class: "track-name" }, t2 = { class: "count" }, n2 = ["value", "aria-label", "title", "onChange"], i2 = ["value", "title"], s2 = ["title"], o2 = ["checked", "aria-label", "onChange"], r2 = ["title"], l2 = ["checked", "aria-label", "onChange"], a2 = ["aria-label"], u2 = ["disabled", "title", "onClick"], c2 = ["disabled", "title", "onClick"], h2 = {
  key: 0,
  class: "hint"
}, d2 = {
  key: 1,
  class: "hint"
}, f2 = /* @__PURE__ */ wt({
  __name: "TrackPanel",
  props: /* @__PURE__ */ Pt({
    view: {},
    guideCount: {},
    keepsGuide: { type: Boolean },
    readonly: { type: Boolean },
    guideActive: { type: Boolean }
  }, {
    voices: { required: !0 },
    voicesModifiers: {},
    locks: { default: () => ({ vocal: !1, ins: !1 }) },
    locksModifiers: {},
    sounds: {},
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Pt(["clearGuide", "shiftTrack"], ["update:voices", "update:locks", "update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = tt(i, "voices"), s = tt(i, "locks"), o = tt(i, "sounds"), r = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function l(h, p) {
      const g = r[h];
      o.value && g && (o.value = { ...o.value, [g]: p });
    }
    const a = e, u = O(
      () => Qg(t.view, t.guideCount).filter((h) => t.keepsGuide || h.voice !== "guide")
    );
    function c(h) {
      return h === "guide" ? n.value.guide !== !1 : n.value[h] !== !1;
    }
    function d(h, p) {
      h === "guide" ? n.value = { ...n.value, guide: p } : n.value = { ...n.value, [h]: p };
    }
    return (h, p) => (C(), A("div", QC, [
      p[3] || (p[3] = f("h4", null, "Tracks", -1)),
      f("ul", null, [
        (C(!0), A(ce, null, ye(u.value, (g) => (C(), A("li", {
          key: g.voice,
          class: Ee({ guide: g.voice === "guide", active: g.voice === "guide" && i.guideActive })
        }, [
          f("span", {
            class: "dot",
            style: os({ background: g.color }),
            "aria-hidden": "true"
          }, null, 4),
          f("span", e2, R(g.name), 1),
          f("span", {
            class: Ee(["destination", { unsent: !g.sent }])
          }, R(g.destination), 3),
          f("span", t2, R(D(Zg)(g.notes)), 1),
          o.value && r[g.voice] ? (C(), A("select", {
            key: 0,
            class: "sound",
            value: o.value[r[g.voice]],
            "aria-label": `Sound of the ${g.name} track`,
            title: `The ${g.name} track’s sound in the playback`,
            onChange: (b) => l(g.voice, b.target.value)
          }, [
            (C(!0), A(ce, null, ye(D(yh), (b) => (C(), A("option", {
              key: b,
              value: b,
              title: D(Jo)[b].hint
            }, R(D(Jo)[b].label), 9, i2))), 128))
          ], 40, n2)) : G("", !0),
          f("label", {
            class: "play",
            title: `Play the ${g.name} track`
          }, [
            f("input", {
              type: "checkbox",
              checked: c(g.voice),
              "aria-label": `Play the ${g.name} track`,
              onChange: (b) => d(g.voice, b.target.checked)
            }, null, 40, o2)
          ], 8, s2),
          D(Kt)[g.voice] && !i.readonly ? (C(), A("label", {
            key: 1,
            class: "lock",
            title: `Lock the ${g.name} notes: they stay as they are (bars added or removed still apply to both tracks)`
          }, [
            f("input", {
              type: "checkbox",
              checked: s.value[D(Kt)[g.voice].track],
              "aria-label": `Lock the ${g.name} track`,
              onChange: (b) => s.value = { ...s.value, [D(Kt)[g.voice].track]: b.target.checked }
            }, null, 40, l2),
            p[1] || (p[1] = oe(" lock ", -1))
          ], 8, r2)) : G("", !0),
          D(Kt)[g.voice] && !i.readonly ? (C(), A("span", {
            key: 2,
            class: "octave",
            role: "group",
            "aria-label": `${g.name} track octave`
          }, [
            f("button", {
              class: "shift",
              disabled: s.value[D(Kt)[g.voice].track] || !!D(Rs)(i.view, D(Kt)[g.voice].track, -12),
              title: D(Rs)(i.view, D(Kt)[g.voice].track, -12) ?? `Every ${g.name} note an octave down`,
              onClick: (b) => a("shiftTrack", D(Kt)[g.voice].track, -12)
            }, " −8va ", 8, u2),
            f("button", {
              class: "shift",
              disabled: s.value[D(Kt)[g.voice].track] || !!D(Rs)(i.view, D(Kt)[g.voice].track, 12),
              title: D(Rs)(i.view, D(Kt)[g.voice].track, 12) ?? `Every ${g.name} note an octave up`,
              onClick: (b) => a("shiftTrack", D(Kt)[g.voice].track, 12)
            }, " +8va ", 8, c2)
          ], 8, a2)) : G("", !0),
          g.voice === "guide" && g.notes > 0 && !i.readonly ? (C(), A("button", {
            key: 3,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: p[0] || (p[0] = (b) => a("clearGuide"))
          }, " clear ")) : G("", !0)
        ], 2))), 128))
      ]),
      i.keepsGuide ? (C(), A("p", h2, [...p[2] || (p[2] = [
        oe(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        f("strong", null, "never sent to YuE2", -1),
        oe(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (C(), A("p", d2, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), p2 = /^\[([^[\]\n]{1,160})\]$/, g2 = /^(pre[- ]?chorus|post[- ]?chorus|intro|verse|chorus|bridge|interlude|instrumental|inst|outro|hook|refrain|solo|breakdown|break|drop|build)(?:\s*\d+)?(?:\s*[-\u2013\u2014:(,/|]|$)/i;
function oo(i) {
  const e = [], t = [];
  let n = null;
  for (const s of i.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = p2.exec(o);
    r ? (n = { tag: r[1].trim(), lines: [] }, t.push(n)) : o && (n ? n.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function vr(i) {
  const e = i.replace(/^\[|\]$/g, "").trim(), t = g2.exec(e);
  if (t) {
    const n = t[1].toLowerCase().replace(/[\s-]+/g, "-");
    return n === "prechorus" ? "pre-chorus" : n === "postchorus" ? "post-chorus" : n;
  }
  return e.replace(/\s*\d+$/, "").toLowerCase();
}
function Ua(i, e) {
  return e && vr(e.tag) === vr(i) ? e.tag : i.replace(/(^|[\s-])(\p{L})/gu, (t, n, s) => n + s.toUpperCase());
}
function yr(i) {
  return i.sections.map((e) => i.measures[e.first_bar - 1]?.onset ?? 0);
}
function No(i, e) {
  if (!i?.trim() || !e) return null;
  const t = oo(i), n = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== n.length || n.some((o, r) => vr(o.label) !== vr(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function m2(i, e) {
  const t = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return e.sections.forEach((n, s) => {
    if (n.implicit) return;
    const o = i.blocks[s] ?? null;
    t.push([`[${Ua(n.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function Gf(i, e) {
  return e?.length ? e : [[0, i.total, 0]];
}
function jf(i, e, t) {
  const n = Gf(i, t), s = yr(i), o = (u) => {
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
function v2(i, e, t, n, s = () => null) {
  const o = Gf(e, n), r = yr(e), l = yr(t), a = (p) => {
    for (const [g, b, k] of o)
      if (p >= k && p < k + b - g) return g + p - k;
    return null;
  }, u = (p) => p ? { tag: p.tag, lines: [...p.lines] } : null, c = jf(e, t, n), d = new Set(c.filter((p) => p >= 0)), h = l.map((p, g) => a(p) === null ? s(p) : c[g] >= 0 ? u(i.blocks[c[g]] ?? null) : null);
  return r.forEach((p, g) => {
    const b = i.blocks[g]?.lines;
    if (!(d.has(g) || !b?.length))
      for (const [k, M, L] of o) {
        if (p < k || p >= M) continue;
        const T = L + p - k;
        let F = -1;
        l.forEach((W, N) => {
          W <= T && (F = N);
        });
        const B = F >= 0 && l[F] !== T ? h[F] : null;
        B && (h[F] = { tag: B.tag, lines: [...B.lines, ...b] });
      }
  }), { preamble: i.preamble, blocks: h };
}
function qf(i, e, t) {
  const n = [...i], s = t.trim();
  return e >= n.length ? s && n.push(s) : s ? n[e] = s : n.splice(e, 1), n;
}
function y2(i, e, t, n) {
  const s = oo(i);
  if (!s.blocks[e]) return i;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: qf(a.lines, t, n) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function b2(i, e, t, n, s) {
  const o = e.sections[t]?.label ?? "", r = i.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Ua(o, null), lines: [] };
    return { tag: u.tag, lines: qf(u.lines, n, s) };
  });
  return { preamble: i.preamble, blocks: r };
}
function k2(i, e, t) {
  const n = oo(i);
  if (!n.blocks[e]) return i;
  const s = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return n.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function w2(i, e, t, n) {
  const s = e.sections[t]?.label ?? "", o = i.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Ua(s, null) }).tag, lines: [...n] } : r
  );
  return { preamble: i.preamble, blocks: o };
}
const Yf = 2, x2 = 0.01, lh = 2.5;
function ah(i, e, t, n) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= n) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, n) - l}.${o.pitch}`);
  }
  return `${i}:${s.join(",")}`;
}
function Ga(i) {
  return i.measures.map((e) => [
    ah(e.meter, i.tracks.vocal, e.onset, e.onset + e.length),
    ah(e.meter, i.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function ha(i, e) {
  let t = 0;
  for (let n = 0; n < 2; n++) i[n] === e[n] && (t += i[n].endsWith(":") ? x2 : Yf);
  return t;
}
function S2(i, e) {
  return ha(i, e) >= Yf || i[0] === e[0] && i[1] === e[1];
}
function uh(i) {
  let e = 0;
  for (let t = 1; t < i.length; t++) i[t] > i[e] && (e = t);
  return e;
}
function Xf(i, e) {
  const t = e.length;
  if (!i.length) return [];
  if (!t) return i.map(() => null);
  const n = t;
  let s = e.map((a, u) => ha(i[0], a) + (u === 0 ? lh : 0));
  s.push(0);
  const o = [];
  for (let a = 1; a < i.length; a++) {
    const u = uh(s), c = s[u] - lh, d = new Array(t + 1).fill(0), h = new Array(t + 1).fill(0);
    for (let g = 0; g < t; g++)
      g > 0 && s[g - 1] >= c ? (d[g] = s[g - 1], h[g] = g - 1) : (d[g] = c, h[g] = u), d[g] += ha(i[a], e[g]);
    const p = s[n] > s[t - 1] ? n : t - 1;
    s[p] >= c ? (d[n] = s[p], h[n] = p) : (d[n] = c, h[n] = u), s = d, o.push(h);
  }
  let r = uh(s);
  const l = [r];
  for (let a = o.length - 1; a >= 0; a--)
    r = o[a][r], l.push(r);
  return l.reverse().map((a) => a === n ? null : a);
}
function ch(i, e, t) {
  if (e?.bars?.length)
    return i && t && t.length === i.measures.length ? t.map((n) => n === null ? null : e.bars[n] ?? null) : !i || !e.bar_prints?.length ? i ? i.measures.map((n, s) => e.bars[s] ?? null) : e.bars : Xf(Ga(i), e.bar_prints).map((n) => n === null ? null : e.bars[n] ?? null);
}
function C2(i, e) {
  return e.bar_prints?.length ? Xf(Ga(i), e.bar_prints) : i.measures.map((t, n) => n < e.bars.length ? n : null);
}
const A2 = "1.5.0";
function M2(i) {
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
function hh(i, e) {
  return {
    ...i,
    ...e,
    sounds: { ...i.sounds, ...e.sounds ?? {} },
    record: { ...i.record, ...e.record ?? {} }
  };
}
function ja(i) {
  if (typeof i != "object" || i === null) return {};
  const e = i, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const n = e.sounds;
    Object.values(n).some(ag) && (t.sounds = ug(n));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = cg(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), hg(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const An = (i, e, t, n) => ({ Vocal: i, Ins: e, chord: t, guide: n }), Vo = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: An("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: An("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: An("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: An("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: An("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: An("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: An("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: An("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: An("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...lg(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: An("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], T2 = "plenio/score-editor-presets.json", $2 = "plenio.score_presets/1", Jf = "plenio.score-editor.presets";
function Zf(i) {
  const e = typeof i == "object" && i !== null ? i : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), n.push({ name: r, builtIn: !1, settings: ja(o.settings) }));
  }
  return n;
}
function Qf(i) {
  return JSON.stringify({ schema: $2, presets: i.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function L2() {
  try {
    return Zf(JSON.parse(window.localStorage.getItem(Jf) ?? "{}"));
  } catch {
    return [];
  }
}
function D2(i) {
  try {
    return window.localStorage.setItem(Jf, Qf(i)), !0;
  } catch {
    return !1;
  }
}
const ep = `/userdata/${encodeURIComponent(T2)}`;
async function B2(i) {
  if (i)
    try {
      const e = await i.fetchApi(ep, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: Zf(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: L2(), where: "browser" };
}
async function dh(i, e) {
  const t = e.filter((n) => !n.builtIn);
  if (i)
    try {
      if ((await i.fetchApi(`${ep}?overwrite=true`, { method: "POST", body: Qf(t) })).ok) return "comfyui";
    } catch {
    }
  return D2(t) ? "browser" : "failed";
}
function O2(i, e) {
  return [...i.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, n) => t.name.localeCompare(n.name));
}
const Xo = "plenio.score_project/1", tp = ".plenio.json";
function fh(i, e = /* @__PURE__ */ new Date()) {
  return {
    schema: Xo,
    app: `Plenio Music Production System ${A2}`,
    saved: e.toISOString(),
    title: (i.title ?? "").trim(),
    score: i.score,
    guide: (i.guide ?? []).map(([t, n, s]) => [t, n, s]),
    lyrics: i.lyrics?.trim() ? i.lyrics : null,
    lyric_spans: i.lyrics?.trim() ? fa(i.lyricSpans ?? []) : [],
    bar_sources: i.barSources ?? null,
    settings: i.settings ? ja(i.settings) : {}
  };
}
function E2(i) {
  return `${Array.from((i ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${tp}`;
}
function I2(i) {
  let e;
  try {
    e = JSON.parse(i);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== Xo ? `This file is not a Plenio score project (${Xo}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: Xo,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: em(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: fa(t.lyric_spans),
    bar_sources: im(t.bar_sources),
    settings: ja(t.settings)
  };
}
const R2 = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, P2 = ["disabled", "title"], N2 = ["disabled", "title"], V2 = ["title"], H2 = { class: "midi-settings" }, W2 = ["aria-expanded"], z2 = ["onKeydown"], F2 = { class: "facts" }, _2 = { key: 0 }, K2 = ["value"], U2 = ["value"], G2 = ["value"], j2 = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, q2 = ["checked"], Y2 = ["value"], X2 = { title: "Where the take's starts and ends go" }, J2 = ["value"], Z2 = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, Q2 = ["value"], eA = { title: "Silence the old notes of the recorded voice while recording" }, tA = ["checked"], nA = ["value"], iA = /* @__PURE__ */ wt({
  __name: "RecordControls",
  props: /* @__PURE__ */ Pt({
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
  emits: /* @__PURE__ */ Pt(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(i, { emit: e }) {
    const t = i, n = tt(i, "settings"), s = e, o = z(!1), r = z(null);
    function l() {
      o.value = !1, Qt(() => r.value?.focus());
    }
    const a = z(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    Yn(() => clearInterval(u));
    const c = O(() => {
      const b = t.hub.selected.value;
      if (b === "all") return null;
      const k = t.hub.devices.value.find((M) => M.id === b);
      return k?.connected ? null : k?.name ?? "the chosen keyboard";
    }), d = O(() => a.value - t.hub.activity.value < 250), h = O(() => {
      const b = t.hub;
      if (b.status.value === "ready") {
        const k = b.devices.value.filter((M) => M.connected);
        return k.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${k.length} keyboard${k.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return b.status.value === "asking" ? "asking for MIDI access…" : b.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : b.problem.value ?? "MIDI is not available";
    }), p = O(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${n.value.countIn ? `, after ${n.value.countIn} bar${n.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function g(b, k) {
      n.value = { ...n.value, [b]: k };
    }
    return (b, k) => (C(), A("span", R2, [
      f("button", {
        class: Ee(["rec", { on: i.recording, counting: i.countingIn }]),
        disabled: !!i.disabled && !i.recording,
        title: p.value,
        onClick: k[0] || (k[0] = (M) => i.recording ? s("stop") : s("record"))
      }, " ● " + R(i.recording && i.countingIn ? "count-in" : "rec"), 11, P2),
      f("button", {
        class: Ee(["step", { on: i.step }]),
        disabled: !!i.disabled || i.recording,
        title: i.disabled ?? (i.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${i.target}: every key writes a note of the step length at the cursor`),
        onClick: k[1] || (k[1] = (M) => s("step"))
      }, " step ", 10, N2),
      i.step ? (C(), A("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: k[2] || (k[2] = (M) => s("rest"))
      }, "rest ▶")) : G("", !0),
      f("span", {
        class: Ee(["midi-light", { active: d.value, ready: i.hub.status.value === "ready" }]),
        title: h.value,
        "aria-hidden": "true"
      }, null, 10, V2),
      f("span", H2, [
        f("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: k[3] || (k[3] = (M) => o.value ? l() : o.value = !0)
        }, "🎹", 8, W2),
        o.value ? (C(), A("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: et(Ke(l, ["stop", "prevent"]), ["esc"])
        }, [
          f("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          k[24] || (k[24] = f("strong", null, "MIDI keyboard", -1)),
          f("span", F2, R(h.value), 1),
          i.hub.status.value === "ready" ? (C(), A("label", _2, [
            k[13] || (k[13] = oe(" keyboard ", -1)),
            f("select", {
              value: i.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: k[4] || (k[4] = (M) => i.hub.selected.value = M.target.value)
            }, [
              k[12] || (k[12] = f("option", { value: "all" }, "all keyboards", -1)),
              (C(!0), A(ce, null, ye(i.hub.devices.value.filter((M) => M.connected), (M) => (C(), A("option", {
                key: M.id,
                value: M.id
              }, R(M.name), 9, U2))), 128)),
              c.value ? (C(), A("option", {
                key: 0,
                value: i.hub.selected.value,
                disabled: ""
              }, R(c.value) + " (unplugged)", 9, G2)) : G("", !0)
            ], 40, K2)
          ])) : i.hub.status.value !== "asking" ? (C(), A("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: k[5] || (k[5] = (M) => s("enable"))
          }, "use MIDI")) : G("", !0),
          f("label", j2, [
            f("input", {
              checked: n.value.thru,
              type: "checkbox",
              onChange: k[6] || (k[6] = (M) => g("thru", M.target.checked))
            }, null, 40, q2),
            k[14] || (k[14] = oe(" hear the keys ", -1))
          ]),
          f("strong", null, "Recording into " + R(i.target), 1),
          k[25] || (k[25] = f("span", { class: "facts" }, [
            oe("The voice is the roll's "),
            f("em", null, "draw into"),
            oe("; the take starts at the cursor.")
          ], -1)),
          f("label", null, [
            k[16] || (k[16] = oe(" count-in ", -1)),
            f("select", {
              value: n.value.countIn,
              "aria-label": "Count-in",
              onChange: k[7] || (k[7] = (M) => g("countIn", Number(M.target.value)))
            }, [...k[15] || (k[15] = [
              f("option", { value: 0 }, "none", -1),
              f("option", { value: 1 }, "1 bar", -1),
              f("option", { value: 2 }, "2 bars", -1)
            ])], 40, Y2)
          ]),
          f("label", X2, [
            k[18] || (k[18] = oe(" quantize ", -1)),
            f("select", {
              value: n.value.quantize,
              "aria-label": "Quantize the take",
              onChange: k[8] || (k[8] = (M) => g("quantize", Number(M.target.value)))
            }, [...k[17] || (k[17] = [
              f("option", { value: 4 }, "1/4", -1),
              f("option", { value: 8 }, "1/8", -1),
              f("option", { value: 16 }, "1/16", -1),
              f("option", { value: 32 }, "1/32", -1),
              f("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, J2)
          ]),
          f("label", Z2, [
            k[20] || (k[20] = oe(" mode ", -1)),
            f("select", {
              value: n.value.mode,
              "aria-label": "Replace or merge",
              onChange: k[9] || (k[9] = (M) => g("mode", M.target.value))
            }, [...k[19] || (k[19] = [
              f("option", { value: "replace" }, "replace", -1),
              f("option", { value: "merge" }, "merge", -1)
            ])], 40, Q2)
          ]),
          f("label", eA, [
            f("input", {
              checked: n.value.mute,
              type: "checkbox",
              onChange: k[10] || (k[10] = (M) => g("mute", M.target.checked))
            }, null, 40, tA),
            k[21] || (k[21] = oe(" mute its old notes ", -1))
          ]),
          k[26] || (k[26] = f("strong", null, "Step input", -1)),
          f("label", null, [
            k[23] || (k[23] = oe(" step ", -1)),
            f("select", {
              value: n.value.stepLength,
              "aria-label": "Step length",
              onChange: k[11] || (k[11] = (M) => g("stepLength", Number(M.target.value)))
            }, [...k[22] || (k[22] = [
              f("option", { value: 1 }, "1/1", -1),
              f("option", { value: 2 }, "1/2", -1),
              f("option", { value: 4 }, "1/4", -1),
              f("option", { value: 8 }, "1/8", -1),
              f("option", { value: 16 }, "1/16", -1)
            ])], 40, nA)
          ])
        ], 40, z2)) : G("", !0)
      ])
    ]));
  }
}), sA = { class: "notation-export" }, oA = ["disabled", "aria-expanded", "title"], rA = ["onKeydown"], lA = { title: "The paper of the PDF and the print" }, aA = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, uA = { class: "formats" }, cA = ["disabled"], hA = ["disabled"], dA = ["disabled"], fA = ["disabled"], pA = { class: "facts" }, gA = /* @__PURE__ */ wt({
  __name: "NotationExport",
  props: /* @__PURE__ */ Pt({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {},
    size: { required: !0 },
    sizeModifiers: {}
  }),
  emits: /* @__PURE__ */ Pt(["done", "failed"], ["update:paper", "update:size"]),
  setup(i, { emit: e }) {
    const t = i, n = tt(i, "paper"), s = tt(i, "size"), o = e, r = z(!1), l = z(!1), a = z(null);
    function u() {
      r.value = !1, Qt(() => a.value?.focus());
    }
    async function c(d) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((p) => setTimeout(p, 20));
      let h = null;
      try {
        h = jg(t.abc, t.title, n.value, s.value);
        const { lines: p } = h;
        if (!p.length) throw new Error("the score has no music to draw");
        const g = n.value === "a4" ? "A4" : "Letter";
        if (d === "pdf") {
          const b = await qg(p, n.value, t.title);
          cs(Kr(t.title, "pdf"), b, "application/pdf"), o("done", `exported the notation as PDF (${g})`);
        } else d === "png" ? (cs(Kr(t.title, "png"), await Yg(p), "image/png"), o("done", "exported the notation as PNG")) : d === "svg" ? (cs(Kr(t.title, "svg"), new TextEncoder().encode(Xg(p)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (Jg(p, n.value, t.title), o("done", `printing the notation (${g}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (p) {
        o("failed", `The notation could not be exported: ${p instanceof Error ? p.message : String(p)}`);
      } finally {
        h?.dispose(), l.value = !1;
      }
    }
    return (d, h) => (C(), A("span", sA, [
      f("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !i.abc,
        "aria-expanded": r.value,
        title: i.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (p) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, oA),
      r.value ? (C(), A("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: et(Ke(u, ["stop", "prevent"]), ["esc"])
      }, [
        f("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        f("label", lA, [
          h[8] || (h[8] = oe(" paper ", -1)),
          $e(f("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (p) => n.value = p),
            "aria-label": "Paper"
          }, [...h[7] || (h[7] = [
            f("option", { value: "a4" }, "A4", -1),
            f("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [Xn, n.value]
          ])
        ]),
        f("label", aA, [
          h[10] || (h[10] = oe(" size ", -1)),
          $e(f("select", {
            "onUpdate:modelValue": h[2] || (h[2] = (p) => s.value = p),
            "aria-label": "Notation size"
          }, [...h[9] || (h[9] = [
            f("option", { value: "large" }, "large", -1),
            f("option", { value: "standard" }, "standard", -1),
            f("option", { value: "smaller" }, "smaller", -1),
            f("option", { value: "compact" }, "compact", -1)
          ])], 512), [
            [Xn, s.value]
          ])
        ]),
        f("span", uA, [
          f("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[3] || (h[3] = (p) => c("pdf"))
          }, "PDF", 8, cA),
          f("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: h[4] || (h[4] = (p) => c("png"))
          }, "PNG", 8, hA),
          f("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[5] || (h[5] = (p) => c("svg"))
          }, "SVG", 8, dA),
          f("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[6] || (h[6] = (p) => c("print"))
          }, "Print…", 8, fA)
        ]),
        f("span", pA, R(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, rA)) : G("", !0)
    ]));
  }
}), mA = { class: "sounds-settings" }, vA = ["aria-expanded"], yA = ["onKeydown"], bA = { class: "row" }, kA = { label: "Built in" }, wA = ["value", "title"], xA = {
  key: 0,
  label: "Yours"
}, SA = ["value"], CA = ["disabled"], AA = {
  key: 0,
  class: "facts"
}, MA = { class: "row" }, TA = ["onKeydown"], $A = ["disabled"], LA = {
  key: 1,
  class: "facts",
  role: "status"
}, DA = {
  key: 2,
  class: "facts"
}, BA = { class: "track" }, OA = ["value", "aria-label", "onChange"], EA = ["value", "title"], IA = ["title", "aria-label", "onClick"], RA = /* @__PURE__ */ wt({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ Pt({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Pt(["apply"], ["update:sounds"]),
  setup(i, { emit: e }) {
    const t = i, n = tt(i, "sounds"), s = e, o = z(!1), r = z(null), l = z([]), a = z(null), u = z(!1), c = z(""), d = z(!1), h = z(""), p = z(null), g = O(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([N]) => N !== "guide" || t.keepsGuide)
    ), b = O(() => l.value.find((N) => N.name === c.value) ?? null);
    async function k() {
      if (o.value = !0, u.value) return;
      const N = await B2(t.fetcher);
      l.value = N.presets, a.value = N.where, u.value = !0;
    }
    function M() {
      o.value = !1, d.value = !1, Qt(() => r.value?.focus());
    }
    function L() {
      const N = [...Vo, ...l.value].find((j) => j.name === c.value);
      N && (s("apply", N.settings, N.name), p.value = `“${N.name}” is set.`);
    }
    async function T() {
      const N = h.value.trim().slice(0, 60);
      if (!N) return;
      if (Vo.some((Q) => Q.name.toLowerCase() === N.toLowerCase())) {
        p.value = `“${N}” is a built-in preset - choose another name.`;
        return;
      }
      const j = O2(l.value, { name: N, builtIn: !1, settings: structuredClone(t.settings) }), P = await dh(t.fetcher, j);
      if (P === "failed") {
        p.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = j, a.value = P, c.value = N, d.value = !1, h.value = "", p.value = P === "comfyui" ? `Saved “${N}” in ComfyUI’s user data.` : `Saved “${N}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function F() {
      const N = b.value;
      if (!N) return;
      const j = l.value.filter((Q) => Q !== N);
      if (await dh(t.fetcher, j) === "failed") {
        p.value = "The preset could not be deleted.";
        return;
      }
      l.value = j, c.value = "", p.value = `Deleted “${N.name}”.`;
    }
    function B(N, j) {
      n.value = { ...n.value, [N]: j };
    }
    function W(N) {
      const j = n.value[N], P = N === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : N === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [Q, H, x] of P) setTimeout(() => ca(Q, x, j), H * 1e3);
    }
    return (N, j) => (C(), A("span", mA, [
      f("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: j[0] || (j[0] = (P) => o.value ? M() : k())
      }, "♫ sounds", 8, vA),
      o.value ? (C(), A("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: et(Ke(M, ["stop", "prevent"]), ["esc"])
      }, [
        f("button", {
          class: "close",
          "aria-label": "Close",
          onClick: M
        }, "×"),
        j[6] || (j[6] = f("strong", null, "Preset", -1)),
        f("span", bA, [
          $e(f("select", {
            "onUpdate:modelValue": j[1] || (j[1] = (P) => c.value = P),
            "aria-label": "Preset"
          }, [
            j[5] || (j[5] = f("option", { value: "" }, "- choose a preset -", -1)),
            f("optgroup", kA, [
              (C(!0), A(ce, null, ye(D(Vo), (P) => (C(), A("option", {
                key: P.name,
                value: P.name,
                title: P.note
              }, R(P.name), 9, wA))), 128))
            ]),
            l.value.length ? (C(), A("optgroup", xA, [
              (C(!0), A(ce, null, ye(l.value, (P) => (C(), A("option", {
                key: "own-" + P.name,
                value: P.name
              }, R(P.name), 9, SA))), 128))
            ])) : G("", !0)
          ], 512), [
            [Xn, c.value]
          ]),
          f("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: L
          }, "use", 8, CA),
          b.value ? (C(), A("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: F
          }, "delete")) : G("", !0)
        ]),
        c.value ? (C(), A("span", AA, R([...D(Vo), ...l.value].find((P) => P.name === c.value)?.note ?? "Your preset"), 1)) : G("", !0),
        f("span", MA, [
          d.value ? (C(), A(ce, { key: 0 }, [
            $e(f("input", {
              "onUpdate:modelValue": j[2] || (j[2] = (P) => h.value = P),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                et(Ke(T, ["prevent"]), ["enter"]),
                j[3] || (j[3] = et(Ke((P) => d.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, TA), [
              [lt, h.value]
            ]),
            f("button", {
              disabled: !h.value.trim(),
              onClick: T
            }, "save", 8, $A)
          ], 64)) : (C(), A("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: j[4] || (j[4] = (P) => d.value = !0)
          }, " save current as preset… "))
        ]),
        p.value ? (C(), A("span", LA, R(p.value), 1)) : a.value === "browser" ? (C(), A("span", DA, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : G("", !0),
        j[7] || (j[7] = f("strong", null, "Sounds", -1)),
        (C(!0), A(ce, null, ye(g.value, ([P, Q]) => (C(), A("label", {
          key: P,
          class: "row"
        }, [
          f("span", BA, R(Q), 1),
          f("select", {
            value: n.value[P],
            "aria-label": `Sound of the ${Q} track`,
            onChange: (H) => B(P, H.target.value)
          }, [
            (C(!0), A(ce, null, ye(D(yh), (H) => (C(), A("option", {
              key: H,
              value: H,
              title: D(Jo)[H].hint
            }, R(D(Jo)[H].label), 9, EA))), 128))
          ], 40, OA),
          f("button", {
            title: `Hear the ${Q} track’s sound`,
            "aria-label": `Hear the ${Q} sound`,
            onClick: Ke((H) => W(P), ["prevent"])
          }, "▶", 8, IA)
        ]))), 128)),
        j[8] || (j[8] = f("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, yA)) : G("", !0)
    ]));
  }
});
function PA(i) {
  return i.length >= 3 && (i[0] & 240) === 176 && (i[1] === 120 || i[1] === 123);
}
function NA(i, e, t) {
  if (i.length < 3) return null;
  const n = i[0] & 240, s = i[0] & 15, o = i[1] & 127, r = i[2] & 127;
  return n === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : n === 128 || n === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function VA(i, e) {
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
class HA {
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
    if (PA(t.data)) {
      this.letGo(e, n);
      return;
    }
    const s = NA(t.data, n, e);
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
    this.status.value = e, this.problem.value = VA(e, t);
  }
}
let ph = null;
function WA() {
  return ph ??= new HA(), ph;
}
const zA = 0.035;
class FA {
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
function _A(i, e) {
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
    let p = Math.round((h.start - t) / l) * l + t, g = Math.round((h.end - t) / l) * l + t;
    g <= p && (g = p + l);
    const b = u[d + 1];
    if (b) {
      const M = Math.round((b.start - t) / l) * l + t;
      M > p && (g = Math.min(g, M));
    }
    p = Math.max(0, Math.min(p, s - 1)), g = Math.min(g, s);
    const k = c.at(-1);
    if (k && p <= k.onset) {
      g - p > k.duration && (c[c.length - 1] = { onset: k.onset, duration: g - k.onset, pitch: h.pitch });
      continue;
    }
    k && k.onset + k.duration > p && (k.duration = p - k.onset), k && p - (k.onset + k.duration) <= l && (k.duration = p - k.onset), g > p && c.push({ onset: p, duration: g - p, pitch: h.pitch });
  }
  return c;
}
function KA(i, e, t, n, s) {
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
const UA = 40;
function GA(i) {
  const e = z(!1), t = z(!1), n = di(null), s = z(0), o = new Fw();
  let r = !1, l = null, a = null;
  const u = z(0), c = O(() => {
    const P = n.value;
    return !P || !e.value ? [] : (u.value, P.played(s.value).filter((Q) => Q.end !== null && Q.end > Q.start).map((Q) => ({ onset: Q.start, duration: Q.end - Q.start, pitch: Q.pitch })));
  });
  function d() {
    l ??= i.hub.subscribe(T);
  }
  async function h() {
    const P = await i.hub.enable();
    return i.problem(P ? null : i.hub.problem.value), P && d(), P;
  }
  function p(P) {
    const Q = i.view();
    return Q ? Ka(Q, Math.max(0, P)) : null;
  }
  async function g() {
    if (e.value) return;
    if (i.readonly()) {
      i.problem("This score belongs to the other sheet; record in that sheet.");
      return;
    }
    const P = i.view();
    if (!P?.model || !await h()) return;
    t.value = !1;
    const Q = i.settings(), H = i.track(), x = Math.min(i.locator.value, P.model.total - 1), E = i.transport();
    if (!E) return;
    if (n.value = new FA(x, H), r = !1, e.value = !0, s.value = x, !E.record(_a(P, x), {
      countIn: Q.countIn,
      mute: Q.mute ? H === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, n.value = null, i.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    i.notify(`recording into ${H === "vocal" ? "Vocal" : "Ins"} from bar ${qA(P, x)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function b() {
    i.transport()?.stop();
  }
  function k() {
    e.value && (r = !0, i.transport()?.stop());
  }
  function M(P) {
    if (!e.value || P === null) return;
    const Q = p(P);
    Q !== null && (s.value = Q);
  }
  async function L() {
    if (!e.value) return;
    const P = n.value, Q = i.view();
    e.value = !1, n.value = null, o.allOff();
    const H = Q?.model;
    if (!P || !H) return;
    if (r) {
      i.notify("recording thrown away");
      return;
    }
    const x = Math.max(s.value, P.start), E = H.measures.find((ae) => ae.onset <= P.start && P.start < ae.onset + ae.length) ?? H.measures[0], fe = Q.bars[(E?.n ?? 1) - 1], pe = E && fe?.duration_s ? E.length / fe.duration_s : 8, te = Number(E?.meter.split("/")[0]) || 4, xe = _A(P.finish(x), {
      start: P.start,
      stop: x,
      total: H.total,
      grid: ml(H.unit, i.settings().quantize),
      chordUnits: zA * pe,
      pickup: (E?.length ?? 16) / te / 2
    });
    if (!xe.length) {
      i.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await i.operate(KA(P.track, xe, P.start, x, i.settings().mode));
  }
  function T(P) {
    if (i.settings().thru && (i.sound && (o.sound = i.sound()), P.kind === "on" ? o.on(P.note, P.velocity) : o.off(P.note)), e.value && n.value) {
      const H = i.transport()?.scoreSecondAt(P.time) ?? null, x = i.view();
      if (H === null || !x) return;
      const E = jA(x, n.value.start, H);
      if (E === null) return;
      P.kind === "on" ? n.value.noteOn(P.note, E) : n.value.noteOff(P.note, E), u.value++;
      return;
    }
    t.value && P.kind === "on" && F(P.note);
  }
  function F(P) {
    if (a) {
      a.pitches.push(P);
      return;
    }
    a = { pitches: [P], timer: setTimeout(() => {
      B();
    }, UA) };
  }
  async function B() {
    const P = a?.pitches ?? [];
    a = null;
    const H = i.view()?.model;
    if (!H || !P.length || i.readonly()) return;
    const x = ml(H.unit, i.settings().stepLength), E = i.locator.value;
    if (E >= H.total) {
      i.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await i.operate({
      op: "place_notes",
      track: i.track(),
      notes: [{ onset: E, duration: Math.min(x, H.total - E), pitch: Math.max(...P) }],
      label: "step"
    }) && (i.locator.value = Math.min(H.total, E + x));
  }
  function W() {
    const P = i.view()?.model;
    P && (i.locator.value = Math.min(P.total, i.locator.value + ml(P.unit, i.settings().stepLength)));
  }
  async function N() {
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
  function j() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: g, stop: b, cancel: k, onTime: M, onStopped: L, toggleStep: N, rest: W, ready: h, dispose: j };
}
function jA(i, e, t) {
  const n = i.model;
  if (!n) return null;
  const s = _a(i, e);
  if (t >= s) return Ka(i, t);
  const o = n.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? n.measures[0], r = i.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function qA(i, e) {
  let t = 1;
  for (const n of i.model?.measures ?? []) n.onset <= e && (t = n.n);
  return t;
}
const YA = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, XA = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, JA = ["aria-checked"], ZA = ["aria-checked"], QA = ["aria-checked"], eM = { title: "The piano roll and chord lane above the notation" }, tM = { title: "Show the ABC text under the notation" }, nM = { title: "Zoom of the notation" }, iM = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, sM = ["disabled", "title"], oM = ["disabled", "title"], rM = ["disabled"], lM = ["disabled", "title"], aM = ["disabled", "title"], uM = ["disabled", "title"], cM = ["accept"], hM = {
  key: 1,
  class: "facts"
}, dM = {
  key: 2,
  class: "facts ok"
}, fM = {
  key: 3,
  class: "facts bad"
}, pM = {
  key: 4,
  class: "badge"
}, gM = {
  key: 1,
  class: "gate",
  role: "status"
}, mM = {
  key: 2,
  class: "gate",
  role: "status"
}, vM = {
  key: 3,
  class: "gate assumed",
  role: "status",
  "data-testid": "assumed-source-bars"
}, yM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], bM = ["data-layout", "data-text"], kM = { class: "side" }, wM = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, xM = {
  key: 0,
  class: "hint"
}, SM = {
  key: 0,
  class: "hint changed"
}, CM = {
  key: 1,
  class: "hint"
}, AM = {
  key: 2,
  class: "fit-panel"
}, MM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], TM = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], $M = {
  class: "status",
  "aria-live": "polite"
}, LM = {
  key: 6,
  class: "error",
  role: "alert"
}, DM = {
  key: 7,
  class: "error",
  role: "alert"
}, BM = {
  key: 8,
  class: "error",
  role: "alert"
}, OM = {
  key: 10,
  class: "diagnostics"
}, EM = ["data-severity"], IM = ["title", "onClick"], RM = {
  key: 1,
  class: "where"
}, gh = /* @__PURE__ */ wt({
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
    barSources: {},
    lyricsTarget: {},
    lyricsPending: {}
  },
  emits: ["edited", "gate", "guideChange", "lyricsChange", "lyricSpansChange", "sourceShiftChange", "barSourcesChange"],
  setup(i, { emit: e }) {
    const t = i, n = e;
    function s(m) {
      return typeof m == "object" && m !== null && !Array.isArray(m);
    }
    const o = di(null), r = z(null), l = z(null);
    function a(m) {
      const S = m.op === "paste" && m.mode === "insert" && Array.isArray(m.sections) ? m.sections : [], $ = typeof m.at == "number" ? m.at : 0, Y = ui.value;
      return (se) => {
        let ue = -1;
        S.forEach((ge, ve) => {
          ge.onset <= se - $ && (ue = ve);
        });
        const Ce = ue >= 0 ? Y?.sections[ue]?.lyrics : null;
        return Ce ? { tag: Ce.tag, lines: [...Ce.lines] } : null;
      };
    }
    const u = mw(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => n("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => Ht(),
      // a locked track stays as it is, whichever way an edit comes
      guard: (m) => Ig(m, te.value, c.value.locks),
      selectable: (m) => Eg(te.value, m, c.value.locks),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (m) => {
        s(m) && (Array.isArray(m.guide) && t.guide !== void 0 && !Ps(m.guide, t.guide) && n("guideChange", [...m.guide]), "lyrics" in m && (o.value = m.lyrics ?? null), "looseLyrics" in m && (r.value = m.looseLyrics ?? null), Array.isArray(m.spans) && En(m.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (m, S) => {
        const $ = {}, Y = {}, se = t.guide;
        if (se?.length && m.time_map?.length) {
          const Pe = nm(se, m.time_map);
          Ps(Pe, se) || (n("guideChange", Pe), $.guide = [...se], Y.guide = Pe);
        }
        const ue = Ht(), Ce = o.value, ge = te.value?.model, ve = m.analysis.model;
        if (ae.value && ge && ve && m.abc !== t.doc.text) {
          const Pe = m.time_map?.length ? sm(ae.value, ge, ve, m.time_map) : om(ae.value, ve.measures.length);
          xe.set(m.abc, Pe), He = ["transpose", "transpose_by", "shift_track"].includes(S.op);
        }
        let We = ue.length && m.time_map?.length ? Bg(ue, m.time_map) : ue;
        if (We.length && Ce && ge && ve) {
          const Pe = (an) => an.sections.flatMap(($i, zr) => $i.implicit ? [] : [zr]), _t = ve.sections.map((an) => ve.measures[an.first_bar - 1]?.onset ?? 0);
          We = Og(We, jf(ge, ve, m.time_map), Pe(ge), Pe(ve), _t);
        }
        if (zo(We, ue) || (En(We), $.spans = [...ue], Y.spans = We), Ce && ge && ve) {
          const Pe = v2(Ce, ge, ve, m.time_map, a(S));
          o.value = Pe, $.lyrics = Ce, Y.lyrics = Pe;
        }
        return Object.keys(Y).length ? { before: $, after: Y } : void 0;
      }
    });
    Oe(
      () => [t.doc.text, u.commitBlock],
      ([m, S]) => {
        t.readonly || n("gate", m, S);
      },
      { immediate: !0 }
    );
    const c = z(dg()), d = z(K1(t.layoutDefault, c.value.layout));
    function h(m) {
      d.value = m, c.value = { ...c.value, layout: m };
    }
    const p = z([]), g = z(0), b = z(null), k = z(null), M = z(null), L = z(null), T = z(null), F = z("vocal"), B = O({
      get: () => c.value.sounds,
      set: (m) => c.value = { ...c.value, sounds: m }
    }), W = O(() => M2(c.value));
    function N(m, S) {
      c.value = hh(c.value, m), u.notes = [`${S}: ${j(m)}`];
    }
    function j(m) {
      const S = [];
      return m.sounds && S.push("sounds"), m.metronome !== void 0 && S.push(`metronome ${m.metronome ? "on" : "off"}`), m.hear && S.push(`hear ${m.hear}`), (m.wave !== void 0 || m.sung !== void 0) && S.push("the source view"), m.record && S.push("recording"), m.paper && S.push(`paper ${m.paper === "a4" ? "A4" : "Letter"}`), m.notationSize && S.push(`notation ${m.notationSize}`), S.length ? `${S.join(", ")} set` : "nothing to set";
    }
    const P = O(() => c.value.sounds[F.value === "vocal" ? "Vocal" : "Ins"]);
    Oe(c, (m) => Rg(m), { deep: !0 });
    const Q = WA();
    Q.selected.value = c.value.midiInput, Oe(Q.selected, (m) => c.value = { ...c.value, midiInput: m });
    const H = O({
      get: () => c.value.record,
      set: (m) => c.value = { ...c.value, record: m }
    }), x = GA({
      hub: Q,
      transport: () => M.value,
      view: () => te.value,
      locator: g,
      track: () => F.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: ii,
      notify: (m) => u.notes = [m],
      problem: (m) => E.value = m,
      sound: () => P.value
    }), E = z(null), fe = O(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : ee.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function pe(m) {
      const S = m.target;
      T.value?.contains(S) || Wr(S) || m.ctrlKey || m.metaKey || m.altKey || m.key !== " " && m.key !== "Escape" || (m.preventDefault(), m.stopPropagation(), m.key === " " ? x.stop() : x.cancel());
    }
    Oe(x.recording, (m) => {
      m ? window.addEventListener("keydown", pe, !0) : window.removeEventListener("keydown", pe, !0);
    }), Yn(() => {
      window.removeEventListener("keydown", pe, !0), x.cancel(), x.dispose();
    }), Yn(() => u.dispose());
    const te = O(() => u.lastValid), xe = /* @__PURE__ */ new Map(), ae = di(null), Re = z(0);
    let be = null;
    const De = z(null), Ve = /* @__PURE__ */ new Map();
    let He = !1;
    Oe(
      () => [u.lastValidText, t.payload?.timeline],
      ([m, S], $) => {
        const Y = te.value, se = Y?.model;
        if (S !== $?.[1] && (xe.clear(), Ve.clear(), ae.value = null, be = null, De.value = null), m === null || !Y || !se || !S?.bars?.length) return;
        const ue = Ga(se);
        let Ce = xe.get(m);
        if (Ce?.length !== ue.length) {
          if (Ce = (ae.value && be && rm(ae.value, be, ue)) ?? void 0, !Ce && (Ce = lm(t.barSources, S.score_sha256, Y.sha256, ue.length) ?? void 0, !Ce)) {
            Ce = C2(se, S);
            const We = S.bar_prints;
            Re.value = We?.length ? Ce.filter((Pe, _t) => Pe !== null && !S2(ue[_t], We[Pe])).length : 0;
          }
          xe.set(m, Ce);
        }
        ae.value = Ce, be = ue;
        const ge = t.payload?.sung_pitch, ve = ge ? Xc(ge) : null;
        if (ve) {
          let We = Ve.get(m);
          We === void 0 && (We = !He && De.value !== null ? De.value : Jc(se, ch(se, S, Ce), ve), Ve.set(m, We)), De.value = We, He = !1;
        }
        !t.readonly && S.score_sha256 && n("barSourcesChange", { timeline: S.score_sha256, score: Y.sha256, bars: Ce });
      },
      { immediate: !0 }
    );
    const V = O(() => !!u.view && !u.view.ok), we = O(() => u.view?.diagnostics ?? []), le = O(
      () => we.value.filter((m) => m.severity === "error" && m.bar).map((m) => m.bar)
    ), q = O(
      () => _f(te.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), J = O(() => d.value !== "text"), Ae = O(() => d.value === "daw"), Fe = O(() => t.guide ?? []), ut = O(() => tm(t.guide, te.value?.model)), Dt = O(() => Ae.value ? c.value.voices.guide ?? !0 : !1), Z = O(() => Dt.value ? ut.value : []), _ = O(() => J.value && c.value.roll && !!(te.value?.model || te.value?.model_error)), ee = O(() => te.value?.model ?? null), ke = O(() => ee.value ? Gs(ee.value, g.value) : q.value), Se = O(() => te.value && ee.value ? _a(te.value, g.value) : null), St = O(() => ee.value ? Uf(ee.value, g.value) : "");
    Oe(
      () => ee.value?.total,
      (m) => {
        m !== void 0 && g.value > m && (g.value = m);
      }
    );
    let sn = null, On = null, jt = !1;
    Oe(
      () => [t.lyricsTarget, t.lyrics, ee.value],
      ([m, S, $]) => {
        if (!m || !S?.trim()) {
          o.value = null, r.value = null, sn = null, jt = !1;
          return;
        }
        const Y = S === sn || S === On;
        if (sn = S, Y && (jt || !$)) {
          if (o.value && $ && o.value.blocks.length !== $.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && $) {
            const ue = No(r.value, $);
            ue && (o.value = ue, r.value = null);
          }
          return;
        }
        const se = !jt && t.lyricsPending || S;
        o.value = $ ? No(se, $) : null, r.value = o.value ? null : se, jt = !!$;
      },
      { immediate: !0 }
    ), Oe(
      [o, r, ee],
      () => {
        const m = o.value, S = ee.value;
        m ? S && m.blocks.length === S.sections.length && (l.value = m2(m, S)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Oe(
      l,
      (m, S) => {
        On = m, n("lyricsChange", m), S !== void 0 && m !== S && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const Vt = O(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), wi = O(
      () => !!l.value && !t.lyricsTarget?.own && Jt(l.value) !== Jt(t.lyrics ?? "")
    ), Ui = O(() => l.value ? oo(l.value).blocks.map((m) => m.tag).join(" · ") : ""), Zn = O(() => l.value ?? t.lyrics ?? null);
    function Ct() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...Ht()] };
    }
    const qt = di(null);
    function Ht() {
      return qt.value ?? t.lyricSpans ?? [];
    }
    function En(m) {
      zo(m, Ht()) || (qt.value = m, n("lyricSpansChange", m), u.refreshLyrics());
    }
    Oe(
      () => t.lyricSpans,
      (m) => {
        m && qt.value && zo(m, qt.value) || (qt.value = null, u.refreshLyrics());
      }
    );
    const it = z([]);
    Oe(
      () => u.selection,
      (m) => {
        m.length && (it.value = []);
      }
    );
    function xi(m) {
      const S = ee.value;
      if (!S) return -1;
      let $ = -1;
      return S.sections.findIndex((Y) => !Y.implicit && ++$ === m);
    }
    function Wt(m) {
      if (o.value) {
        const $ = xi(m);
        return $ < 0 ? null : [...o.value.blocks[$]?.lines ?? []];
      }
      if (r.value === null) return null;
      const S = oo(r.value).blocks[m];
      return S ? [...S.lines] : null;
    }
    function yn() {
      return Math.max(1, Math.round(ee.value?.grid.units_per_quarter ?? 1));
    }
    function Bt(m, S, $) {
      const Y = ee.value, se = te.value?.lyrics;
      if (!Y || !se || !Vt.value) return null;
      const ue = Ct(), Ce = [], ge = /* @__PURE__ */ new Map();
      for (const ve of [...new Set(m)].sort((We, Pe) => We - Pe)) {
        const We = Wt(ve);
        if (We === null) continue;
        const Pe = mo(se, ve, Y.total), _t = Ag(S(ve, du(se, ve, We, Pe, yn())), Pe), an = _t.map(($i) => $i.text);
        if (o.value) o.value = w2(o.value, Y, xi(ve), an);
        else if (r.value !== null) r.value = k2(r.value, ve, an);
        else continue;
        _t.forEach(($i, zr) => {
          $i.id.startsWith("*") && Ce.push(es(ve, zr));
        }), ge.set(ve, _t);
      }
      return ge.size ? (En(Mg(Ht(), se, ge, !0)), u.recordSide($, ue, Ct()), Ce) : null;
    }
    function In(m) {
      const S = /* @__PURE__ */ new Map();
      for (const $ of m) {
        const Y = Tg($);
        Y && (S.has(Y.block) || S.set(Y.block, /* @__PURE__ */ new Set()), S.get(Y.block)?.add(Y.line));
      }
      return S;
    }
    function At(m, S) {
      const $ = new Map(m.map((ue) => [ue.key, ue])), Y = m.length, se = Y ? Bt(
        [...In(m.map((ue) => ue.key)).keys()],
        (ue, Ce) => Ce.map((ge, ve) => {
          const We = $.get(es(ue, ve));
          return We ? { ...ge, id: `*${ge.id}`, start: We.start, end: We.end } : ge;
        }),
        `lyrics: ${Y === 1 ? "line" : `${Y} lines`} placed`
      ) : null;
      se && (it.value = se), S && (u.notes = [S]);
    }
    function Qn() {
      if (!Vt.value || !Ht().length) return;
      const m = Ct();
      En([]), u.recordSide("lyrics: placed automatically", m, Ct()), it.value = [], u.notes = ["the lyrics are placed on the notes automatically again - Ctrl+Z brings the places back"];
    }
    function on(m) {
      const S = In(m);
      S.size && (Bt(
        [...S.keys()],
        ($, Y) => Y.filter((se, ue) => !S.get($)?.has(ue)),
        `lyrics: ${m.length === 1 ? "line" : `${m.length} lines`} deleted`
      ), it.value = []);
    }
    const ei = O(() => ({
      off: bg(te.value?.lyrics).length,
      lyrics: !!(l.value ?? t.lyrics)?.trim(),
      range: !!uu(te.value, u.selection, it.value),
      vocalLocked: c.value.locks.vocal
    }));
    function bn(m) {
      const S = m ? null : uu(te.value, u.selection, it.value);
      !m && !S || I({
        op: "fit_notes",
        lyrics: l.value ?? t.lyrics ?? "",
        spans: Ht(),
        surplus: c.value.fitSurplus,
        style: t.payload?.docs?.style?.upstream ?? t.payload?.context?.style ?? "",
        ...S ? { start: S[0], end: S[1] } : {}
      });
    }
    function Si() {
      const m = ee.value, S = te.value?.lyrics;
      if (!m || !S) return [];
      const $ = [];
      for (const [Y, se] of In(it.value)) {
        const ue = Wt(Y);
        ue && du(S, Y, ue, mo(S, Y, m.total), yn()).forEach((Ce, ge) => {
          se.has(ge) && $.push(Ce);
        });
      }
      return $;
    }
    function Rn() {
      const m = ee.value ? kS(ee.value.unit, fu(Si())) : null;
      return m ? (ui.value = m, u.error = null, u.notes = [`copied ${m.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function ti(m, S, $) {
      const Y = ee.value, se = te.value?.lyrics;
      if (!Y || !se) return;
      const ue = $g(se, S);
      if (!ue || Wt(ue.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, Ce] = mo(se, ue.block, Y.total), ge = m.filter((Pe) => S + Pe.offset < Ce);
      if (!ge.length) return;
      const ve = ge.map((Pe) => ({ start: S + Pe.offset, end: Math.min(S + Pe.offset + Pe.length, Ce) })), We = Lg(Dg(se), ve);
      if (We) {
        u.error = `Not pasted: the lines would overlap "${We.text}" - lyrics lines never overlap. Set the cursor where the lyrics lane is free, or move, shorten or delete that line first.`;
        return;
      }
      it.value = Bt(
        [ue.block],
        (Pe, _t) => [
          ..._t,
          ...ge.map((an, $i) => ({
            id: `*new${$i}`,
            text: an.text,
            start: S + an.offset,
            end: Math.min(S + an.offset + an.length, Ce)
          }))
        ],
        $
      ) ?? [], u.error = null, ge.length < m.length && (u.notes = [`${m.length - ge.length} line(s) did not fit before the next block's first line`]);
    }
    function Pn(m) {
      const S = ui.value;
      if ((m === "paste" || m === "insert") && S?.lyricLines?.length)
        return Vt.value ? ee.value && S.unit !== ee.value.unit ? (u.error = `The lines were copied with L:${S.unit} and do not fit this score's L:${ee.value.unit}.`, !0) : (ti(S.lyricLines, g.value, `lyrics: ${S.label} pasted`), !0) : !0;
      if (!it.value.length) return !1;
      if (m === "copy") Rn();
      else if (m === "cut")
        Rn() && on(it.value);
      else if (m === "duplicate") {
        const $ = Si();
        if ($.length) {
          const Y = Math.max(...$.map((se) => se.end));
          ti(fu($), Y, `lyrics: ${$.length === 1 ? "line" : `${$.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function zt(m) {
      const S = ee.value, $ = te.value?.lyrics;
      if (S && $) {
        const se = yn(), ue = Bt(
          [m.block],
          (Ce, ge) => {
            if (m.line < ge.length)
              return m.text ? ge.map((Pe, _t) => _t === m.line ? { ...Pe, text: m.text } : Pe) : ge.filter((Pe, _t) => _t !== m.line);
            const ve = m.at ?? ge[ge.length - 1]?.end ?? mo($, m.block, S.total)[0], We = Math.max(ve + 1, m.end ?? ve + se);
            return m.text ? [...ge, { id: "*typed", text: m.text, start: ve, end: We }] : ge;
          },
          `lyrics: ${m.text || "line removed"}`
        );
        if (ue) {
          ue.length && (it.value = ue);
          return;
        }
      }
      const Y = Ct();
      if (o.value && S) o.value = b2(o.value, S, xi(m.block), m.line, m.text);
      else if (r.value !== null) r.value = y2(r.value, m.block, m.line, m.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${m.text || "line removed"}`, Y, Ct());
    }
    function kn() {
      const m = t.lyrics, S = ee.value;
      if (!m) return;
      const $ = Ct();
      o.value = S ? No(m, S) : null, r.value = o.value ? null : m, t.readonly || u.recordSide("lyrics reverted", $, Ct());
    }
    Oe(ee, (m) => {
      if (!Vr || !m || r.value === null) return;
      Vr = !1;
      const S = No(r.value, m);
      S && (o.value = S, r.value = null);
    }), Oe(q, (m) => {
      !_.value && m && ee.value && (g.value = qc(ee.value, m));
    });
    const wn = O({
      get: () => c.value.metronome,
      set: (m) => c.value = { ...c.value, metronome: m }
    }), Nn = O(() => t.payload?.reference_audio ? kg(t.fetcher, t.payload.reference_audio) : null), Ot = di(null), Vn = z(null);
    Oe(
      Nn,
      (m) => {
        Ot.value = null, Vn.value = null, m && qw(m).then(
          (S) => {
            Nn.value === m && (Ot.value = S);
          },
          (S) => {
            Nn.value === m && (Vn.value = `the source recording could not be read: ${S instanceof Error ? S.message : String(S)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const ct = O({
      get: () => c.value.hear,
      set: (m) => c.value = { ...c.value, hear: m }
    }), Yt = O({
      get: () => c.value.sourceLevel,
      set: (m) => c.value = { ...c.value, sourceLevel: m }
    }), Ci = O(() => {
      const m = te.value, S = m?.model;
      if (!m || !S) return null;
      const $ = y(), Y = [...$.notes.map((ve) => [ve.onset, ve.onset + ve.duration]), ...$.chords.map((ve) => [ve.onset, ve.onset + 1])];
      if (!Y.length) return null;
      const se = Gs(S, Math.min(...Y.map(([ve]) => ve))), ue = Gs(S, Math.max(...Y.map(([, ve]) => ve)) - 1), Ce = m.bars[se - 1], ge = m.bars[ue - 1];
      return !Ce || !ge ? null : { from: Ce.start_s, to: ge.start_s + ge.duration_s, label: se === ue ? `bar ${se}` : `bars ${se}-${ue}` };
    }), Xt = O(() => {
      const m = ch(te.value?.model, t.payload?.timeline, ae.value), S = t.sourceShift ?? 0;
      return !m || !S ? m : m.map(($) => $ ? [$[0] - S, $[1] - S, $[2]] : null);
    }), Ai = O(() => {
      const m = Xt.value?.[(ke.value ?? 1) - 1] ?? Xt.value?.find(($) => $);
      if (!m) return 0.5;
      const S = Number(m[2].split("/")[0]) || 4;
      return (m[1] - m[0]) / S;
    });
    Oe(
      () => c.value.locks,
      (m) => {
        u.select(u.selection), m[F.value] && !m[F.value === "vocal" ? "ins" : "vocal"] && (F.value = F.value === "vocal" ? "ins" : "vocal");
      }
    );
    const Gi = O(() => {
      const m = t.payload?.sung_pitch;
      if (!m) return null;
      const S = Xc(m), $ = ee.value;
      return !S || !$ ? { problem: "problem" in m ? m.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: S, offset: De.value ?? Jc($, Xt.value, S), bars: Xt.value };
    }), rn = O({
      get: () => t.sourceShift ?? 0,
      set: (m) => n("sourceShiftChange", Math.round(m * 1e3) / 1e3)
    }), As = O(() => Xt.value?.map((m) => m?.[0] ?? null) ?? null), mt = O(() => te.value?.header?.unit ?? "1/16"), ln = O({
      get: () => c.value.voices,
      set: (m) => c.value = { ...c.value, voices: m }
    }), ni = O({
      get: () => c.value.speed,
      set: (m) => c.value = { ...c.value, speed: m }
    });
    function Ft(m, S = !1, $ = "notation") {
      const Y = S ? u.selection.includes(m) ? u.selection.filter((ue) => ue !== m) : [...u.selection, m] : [m];
      u.select(Y);
      const se = Pi(te.value, Y[0]);
      k.value = $ !== "text" && se ? [se.source[0], se.source[1]] : k.value;
    }
    function Hn(m) {
      if (!te.value || V.value) return;
      const S = Cm(te.value, m);
      S && Ft(S.id, !1, "text");
    }
    function Be(m) {
      if (!te.value) return;
      te.value.model && (g.value = qc(te.value.model, m));
      const S = Tm(te.value, m);
      S && Ft(S.id, !1, "keys");
    }
    function vt() {
      return x.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function Mt(m) {
      t.readonly || vt() || await u.operate(m);
    }
    function ii(m) {
      return t.readonly || vt() ? Promise.resolve(!1) : u.operate(m);
    }
    function Mi() {
      vt() || u.undo();
    }
    function ji() {
      vt() || u.redo();
    }
    function si() {
      Qt(() => {
        const m = document.activeElement;
        (!m || m === document.body) && T.value?.querySelector(".roll")?.focus({ preventScroll: !0 });
      });
    }
    async function I(m) {
      await Mt(m), si();
    }
    function v(m) {
      u.select(m);
      const S = Pi(te.value, m[0]);
      S && (k.value = [S.source[0], S.source[1]]);
    }
    function y() {
      const m = ee.value;
      if (!m) return { notes: [], chords: [] };
      const S = ds(te.value, u.selection), $ = fs(u.selection);
      return {
        notes: [...m.tracks.vocal, ...m.tracks.ins].filter((Y) => S.has(Y.id)),
        chords: m.tracks.chords.filter((Y) => $.has(Y.id))
      };
    }
    function w() {
      const m = ee.value, S = y(), $ = m ? sh(m, S.notes, S.chords) : null;
      return $ ? (ui.value = $, u.error = null, u.notes = [`copied ${$.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function U(m) {
      if (Pn(m)) return;
      const S = ee.value;
      if (m === "copy") {
        w();
        return;
      }
      if (t.readonly || !S) return;
      if (m === "cut") {
        const se = y();
        if (!w()) return;
        await Mt({ op: "delete", ids: [...se.notes.map((ue) => ue.id), ...se.chords.map((ue) => ue.id)] });
        return;
      }
      if (m === "duplicate") {
        const se = y(), ue = sh(S, se.notes, se.chords);
        if (!ue) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Ce = Math.min(...se.notes.map((ve) => ve.onset), ...se.chords.map((ve) => ve.onset)), ge = rh(ue, S, Ce + ue.span, "overwrite");
        typeof ge == "string" ? u.error = "There is no room after the selection to duplicate it." : await Mt(ge);
        return;
      }
      const $ = ui.value;
      if (!$) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const Y = rh($, S, g.value, m === "insert" ? "insert" : "overwrite");
      typeof Y == "string" ? u.error = Y : await Mt(Y);
    }
    function K(m) {
      if (m.altKey) return null;
      switch (m.key.toLowerCase()) {
        case "c":
          return "copy";
        case "x":
          return "cut";
        case "v":
          return m.shiftKey ? "insert" : "paste";
        case "d":
          return "duplicate";
        default:
          return null;
      }
    }
    function ne(m) {
      b.value = m === null || !te.value ? null : Ka(te.value, m), x.onTime(m);
    }
    function he() {
      t.readonly || !t.guide?.length || n("guideChange", []);
    }
    const Te = O({
      get: () => c.value.rollZoom,
      set: (m) => c.value = { ...c.value, rollZoom: m }
    }), Ue = O(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function Le(m) {
      m.preventDefault();
      const S = c.value.rollHeight;
      Wo(m, ({ dy: $ }) => c.value = { ...c.value, rollHeight: cu(S, $) });
    }
    function je(m) {
      const S = m.key === "ArrowUp" ? -16 : m.key === "ArrowDown" ? 16 : 0;
      S && (m.preventDefault(), c.value = { ...c.value, rollHeight: cu(c.value.rollHeight, S) });
    }
    function at(m) {
      m.preventDefault();
      const S = c.value.notationShare, Y = m.currentTarget.parentElement?.clientHeight ?? 0;
      Wo(m, ({ dy: se }) => c.value = { ...c.value, notationShare: Pg(S, se, Y) });
    }
    function dt(m) {
      const S = m.key === "ArrowDown" ? 0.03 : m.key === "ArrowUp" ? -0.03 : 0;
      S && (m.preventDefault(), c.value = { ...c.value, notationShare: wg(c.value.notationShare + S) });
    }
    function Ti(m) {
      m.preventDefault();
      const S = c.value.sideWidth;
      Wo(m, ({ dx: $ }) => c.value = { ...c.value, sideWidth: hu(S, $) });
    }
    function Pr(m) {
      const S = m.key === "ArrowLeft" ? -16 : m.key === "ArrowRight" ? 16 : 0;
      S && (m.preventDefault(), c.value = { ...c.value, sideWidth: hu(c.value.sideWidth, S) });
    }
    const ho = z(null), Wn = z(null), st = z(null), zn = z(!1), Nr = O(() => t.guide !== void 0), qa = O(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && te.value?.display_abc ? null : "There is no score to export yet."), Ya = O({
      get: () => c.value.paper,
      set: (m) => c.value = { ...c.value, paper: m }
    }), Xa = O({
      get: () => c.value.notationSize,
      set: (m) => c.value = { ...c.value, notationSize: m }
    });
    function np(m) {
      st.value = null, u.notes = [m];
    }
    const qi = O(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function ip() {
      const m = qi.value;
      if (m) {
        st.value = m;
        return;
      }
      zn.value = !0, st.value = null;
      try {
        const S = await xg(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        cs(S.filename, hw(S.data));
      } catch (S) {
        st.value = Ri(S);
      } finally {
        zn.value = !1;
      }
    }
    async function sp() {
      const m = qi.value;
      if (m) {
        st.value = m;
        return;
      }
      zn.value = !0, st.value = null;
      try {
        const S = await Sg(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: Ht()
        });
        cs(S.filename, new TextEncoder().encode(S.data), S.type);
      } catch (S) {
        st.value = Ri(S);
      } finally {
        zn.value = !1;
      }
    }
    const Ja = z(null);
    function op() {
      const m = t.payload?.timeline?.score_sha256, S = te.value;
      return m && S && ae.value && u.lastValidText === t.doc.text ? { timeline: m, score: S.sha256, bars: ae.value } : null;
    }
    function rp() {
      const m = fh({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: Ht(),
        barSources: op(),
        settings: W.value
      });
      cs(E2(t.title), new TextEncoder().encode(`${JSON.stringify(m, null, 1)}
`), "application/json"), st.value = null, u.notes = [`saved the project: score${m.guide.length ? `, ${Za(m.guide.length)}` : ""}${m.lyrics ? ", lyrics" : ""}, settings`];
    }
    function lp() {
      st.value = null, Ja.value?.click();
    }
    async function ap(m) {
      const S = m.target, $ = S.files?.[0];
      if (S.value = "", !$) return;
      const Y = I2(await $.text());
      typeof Y == "string" ? st.value = Y : Qa(Y, $.name);
    }
    const Za = (m) => m === 1 ? "1 Guide note" : `${m} Guide notes`;
    let Vr = !1;
    function Qa(m, S) {
      if (vt()) return;
      if (t.readonly) {
        st.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const $ = ["score"], Y = [], se = m.bar_sources;
      se && se.timeline === t.payload?.timeline?.score_sha256 && xe.set(m.score, se.bars);
      const ue = Ct(), Ce = {}, ge = t.guide;
      ge !== void 0 ? (ue.guide = [...ge], Ce.guide = [...m.guide], m.guide.length && $.push(Za(m.guide.length))) : m.guide.length && Y.push("the Guide notes (only the DAW sheet keeps a Guide track)"), m.lyrics && Vt.value ? (o.value = null, r.value = m.lyrics, Vr = !0, $.push("lyrics"), En(m.lyric_spans)) : m.lyrics && Y.push("the lyrics (this sheet cannot change them here)"), Object.assign(Ce, Ct()), Object.keys(m.settings).length && (c.value = hh(c.value, m.settings), $.push("settings"));
      const ve = `open project (${S})`;
      u.replaceText(m.score, ve, null, { before: ue, after: Ce }) || u.recordSide(ve, ue, Ce), Ce.guide && ge !== void 0 && !Ps(Ce.guide, ge) && n("guideChange", Ce.guide), st.value = null, u.notes = [
        `opened ${S}: ${$.join(", ")}${m.title ? ` ("${m.title}")` : ""}`,
        ...Y.map((We) => `not opened: ${We}`)
      ];
    }
    const eu = z(null);
    function up() {
      st.value = null, eu.value?.click();
    }
    async function cp(m) {
      const S = m.target, $ = S.files?.[0];
      if (S.value = "", !(!$ || t.readonly || vt())) {
        zn.value = !0, st.value = null;
        try {
          const Y = await Cg(t.fetcher, {
            text: await $.text(),
            abc: t.doc.text,
            lyrics: l.value ?? t.lyrics ?? null
          }), se = Y.lyrics ?? l.value ?? t.lyrics ?? null, ue = fh({
            title: t.title,
            score: Y.abc,
            guide: t.guide ?? [],
            lyrics: se,
            lyricSpans: fa(Y.lyric_spans)
          });
          Y.lyrics === null && (ue.lyric_spans = []), Qa(ue, $.name), u.notes = [`imported ${$.name}`, ...Y.report];
        } catch (Y) {
          st.value = Ri(Y);
        } finally {
          zn.value = !1;
        }
      }
    }
    function hp() {
      st.value = null, ho.value?.click();
    }
    async function dp(m) {
      const S = m.target, $ = S.files?.[0];
      if (S.value = "", !!$)
        try {
          Wn.value = { data: cw(new Uint8Array(await $.arrayBuffer())), filename: $.name };
        } catch (Y) {
          st.value = Ri(Y);
        }
    }
    function fp(m, S) {
      if (t.readonly || vt()) return;
      const $ = Wn.value?.filename ?? "file", Y = t.guide, se = Y === void 0 ? void 0 : S ? [...m.guide] : [], ue = Y === void 0 || se === void 0 ? void 0 : { before: { guide: [...Y] }, after: { guide: se } };
      u.replaceText(m.abc, `import MIDI (${$})`, m.analysis, ue), se !== void 0 && Y !== void 0 && !Ps(se, Y) && n("guideChange", se), Wn.value = null, st.value = null;
    }
    function Hr(m) {
      const S = m;
      return S ? !!S.closest("input, textarea, select, .cm-editor") : !1;
    }
    const pp = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Wr(m) {
      const S = m;
      if (!S) return !1;
      if (S.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const $ = S.closest("input");
      return !!$ && !pp.has($.type);
    }
    function gp(m) {
      m.key === " " && !Wr(m.target) && m.preventDefault();
    }
    function mp(m) {
      const S = m.ctrlKey || m.metaKey;
      if (S && !t.readonly && (m.key === "z" || m.key === "Z" || m.key === "y")) {
        if (Hr(m.target) && !m.target.closest(".cm-editor")) return;
        m.preventDefault(), m.key === "y" || m.key.toLowerCase() === "z" && m.shiftKey ? ji() : Mi();
        return;
      }
      const $ = S && !Hr(m.target) ? K(m) : null;
      if ($) {
        m.preventDefault(), m.stopPropagation(), U($);
        return;
      }
      if (m.key === " " && !S && !Wr(m.target)) {
        m.preventDefault(), M.value?.toggle();
        return;
      }
      if (Hr(m.target) || S) return;
      if (m.key === "Escape" && x.recording.value) {
        m.preventDefault(), x.cancel();
        return;
      }
      if (m.key === "R" && m.shiftKey && !m.altKey) {
        m.preventDefault(), x.recording.value ? x.stop() : x.start();
        return;
      }
      if (m.key === "Escape") {
        m.preventDefault(), u.selection.length && u.select([]), it.value = [];
        return;
      }
      const Y = te.value, se = u.primary, ue = m.key.toLowerCase();
      if ((ue === "g" || ue === "h") && !m.altKey && L.value) {
        m.preventDefault(), m.shiftKey ? L.value.zoomRows(ue === "h" ? 2 : -2) : L.value.zoomBy(ue === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((m.key === "Home" || m.key === "End") && ee.value) {
        m.preventDefault(), g.value = m.key === "Home" ? 0 : ee.value.total;
        return;
      }
      if (!Y || !se) return;
      (() => {
        switch (m.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const ge = Am(Y, se.id, m.key === "ArrowRight" ? 1 : -1);
            return ge && Ft(ge.id, m.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (m.altKey) {
              const Pe = Mm(Y, se.id);
              return Pe && Ft(Pe.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const ge = u.selection.filter((Pe) => Pi(Y, Pe)?.kind === "note"), ve = [...fs(u.selection)], We = (m.shiftKey ? 12 : 1) * (m.key === "ArrowUp" ? 1 : -1);
            return ve.length ? Mt({ op: "set_note_pitch", ids: [...ds(Y, u.selection), ...ve], semitones: We }) : ge.length && Mt({ op: "shift_pitch", ids: ge, semitones: We }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || se.kind !== "note") return !1;
            const ge = yl(Y, se, m.key === "]" ? 1 : -1);
            return ge && Mt(ge), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (se.kind === "note" && Mt({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (se.kind !== "note" && Mt({ op: "rest_to_note", id: se.id }), !0);
          default:
            return !1;
        }
      })() && (m.preventDefault(), m.stopPropagation());
    }
    return (m, S) => (C(), A("div", {
      ref_key: "tabRoot",
      ref: T,
      class: "score-tab",
      onKeydown: mp,
      onKeyup: gp
    }, [
      i.readonly ? G("", !0) : (C(), Kn(LC, {
        key: 0,
        "fit-surplus": c.value.fitSurplus,
        "onUpdate:fitSurplus": S[0] || (S[0] = ($) => c.value.fitSurplus = $),
        fit: ei.value,
        onFitNotes: bn,
        view: te.value,
        selection: D(u).selection,
        primary: D(u).primary,
        busy: D(u).busy,
        stale: V.value,
        "can-undo": D(u).canUndo,
        "can-redo": D(u).canRedo,
        "undo-label": D(u).undoLabel,
        "redo-label": D(u).redoLabel,
        onOperate: I,
        onUndo: S[1] || (S[1] = ($) => (Mi(), si())),
        onRedo: S[2] || (S[2] = ($) => (ji(), si()))
      }, null, 8, ["fit-surplus", "fit", "view", "selection", "primary", "busy", "stale", "can-undo", "can-redo", "undo-label", "redo-label"])),
      f("div", YA, [
        f("span", XA, [
          f("button", {
            role: "radio",
            "aria-checked": d.value === "review",
            class: Ee({ active: d.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: S[3] || (S[3] = ($) => h("review"))
          }, " Review ", 10, JA),
          f("button", {
            role: "radio",
            "aria-checked": Ae.value,
            class: Ee({ active: Ae.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: S[4] || (S[4] = ($) => h("daw"))
          }, " DAW ", 10, ZA),
          f("button", {
            role: "radio",
            "aria-checked": d.value === "text",
            class: Ee({ active: d.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: S[5] || (S[5] = ($) => h("text"))
          }, " Text ", 10, QA)
        ]),
        J.value ? (C(), A(ce, { key: 0 }, [
          f("label", eM, [
            $e(f("input", {
              "onUpdate:modelValue": S[6] || (S[6] = ($) => c.value.roll = $),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [Et, c.value.roll]
            ]),
            S[41] || (S[41] = oe(" piano roll ", -1))
          ]),
          f("label", tM, [
            $e(f("input", {
              "onUpdate:modelValue": S[7] || (S[7] = ($) => c.value.advanced = $),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [Et, c.value.advanced]
            ]),
            S[42] || (S[42] = oe(" ABC text (advanced) ", -1))
          ])
        ], 64)) : G("", !0),
        f("label", nM, [
          S[43] || (S[43] = oe(" zoom ", -1)),
          $e(f("input", {
            "onUpdate:modelValue": S[8] || (S[8] = ($) => c.value.zoom = $),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              lt,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        _n(ow),
        f("span", iM, [
          f("button", {
            disabled: zn.value || !!qi.value,
            title: qi.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: ip
          }, " Export MIDI ", 8, sM),
          f("button", {
            disabled: zn.value || !!qi.value,
            title: qi.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: sp
          }, " Export MusicXML ", 8, oM),
          _n(gA, {
            paper: Ya.value,
            "onUpdate:paper": S[9] || (S[9] = ($) => Ya.value = $),
            size: Xa.value,
            "onUpdate:size": S[10] || (S[10] = ($) => Xa.value = $),
            abc: qa.value ? null : te.value?.display_abc ?? null,
            title: i.title ?? "",
            blocked: qa.value,
            onDone: np,
            onFailed: S[11] || (S[11] = ($) => st.value = $)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          f("button", {
            disabled: !i.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: rp
          }, " Save project ", 8, rM),
          f("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: hp
          }, " Import MIDI… ", 8, lM),
          f("button", {
            disabled: i.readonly || zn.value,
            title: i.readonly ? "This score belongs to the other sheet." : "Read a MusicXML file that Export MusicXML wrote - also after a script changed it: its score, lyrics and where they are sung replace these (one undo step). Other MusicXML is refused; use Import MIDI for it.",
            onClick: up
          }, " Import MusicXML… ", 8, aM),
          f("button", {
            disabled: i.readonly,
            title: i.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: lp
          }, " Open project… ", 8, uM),
          f("input", {
            ref_key: "musicXmlFile",
            ref: eu,
            class: "hidden-file",
            type: "file",
            accept: ".musicxml,.xml,application/vnd.recordare.musicxml+xml,application/xml,text/xml",
            "aria-label": "MusicXML file",
            onChange: cp
          }, null, 544),
          f("input", {
            ref_key: "midiFile",
            ref: ho,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: dp
          }, null, 544),
          f("input", {
            ref_key: "projectFile",
            ref: Ja,
            class: "hidden-file",
            type: "file",
            accept: `${D(tp)},.json,application/json`,
            "aria-label": "Project file",
            onChange: ap
          }, null, 40, cM)
        ]),
        D(u).pending ? (C(), A("span", hM, "checking…")) : D(u).view?.ok ? (C(), A("span", dM, "✓ valid")) : V.value ? (C(), A("span", fM, "✖ " + R(we.value.length) + " error(s)", 1)) : G("", !0),
        i.readonly ? (C(), A("span", pM, "read-only: owned by the other sheet")) : G("", !0)
      ]),
      V.value && !i.readonly ? (C(), A("p", gM, [
        S[44] || (S[44] = oe(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        D(u).canRevert ? (C(), A("button", {
          key: 0,
          onClick: S[12] || (S[12] = ($) => D(u).revertToLastValid())
        }, "Revert to last valid")) : G("", !0),
        J.value && !c.value.advanced ? (C(), A("button", {
          key: 1,
          onClick: S[13] || (S[13] = ($) => c.value.advanced = !0)
        }, "Show the ABC text")) : G("", !0)
      ])) : D(u).view?.ok && D(u).view.model_error && !i.readonly ? (C(), A("p", mM, " This score is valid for YuE2 but outside the editor's supported subset (" + R(D(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : Ot.value && Re.value ? (C(), A("p", vM, R(Re.value === 1 ? "1 bar shares" : `${Re.value} bars share`) + " no notes with the source: placed in the recording's order after the bars before, so that part of the alignment is an assumption. ", 1)) : G("", !0),
      _.value ? (C(), Kn(gS, {
        key: 4,
        ref_key: "pianoRoll",
        ref: L,
        zoom: Te.value,
        "onUpdate:zoom": S[14] || (S[14] = ($) => Te.value = $),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": S[15] || (S[15] = ($) => c.value.rowHeight = $),
        follow: c.value.follow,
        "onUpdate:follow": S[16] || (S[16] = ($) => c.value.follow = $),
        track: F.value,
        "onUpdate:track": S[17] || (S[17] = ($) => F.value = $),
        locks: c.value.locks,
        "onUpdate:locks": S[18] || (S[18] = ($) => c.value.locks = $),
        recorded: D(x).recording.value ? { track: F.value, notes: D(x).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": S[19] || (S[19] = ($) => c.value.sung = $),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": S[20] || (S[20] = ($) => c.value.wave = $),
        sound: P.value,
        "chord-sound": c.value.sounds.chord,
        sung: Gi.value,
        height: c.value.rollHeight,
        view: te.value,
        selection: D(u).selection,
        playing: p.value,
        operate: ii,
        readonly: i.readonly,
        stale: V.value,
        busy: D(u).busy,
        locator: ee.value ? g.value : null,
        playhead: b.value,
        clip: D(ui)?.label ?? null,
        lyrics: te.value?.lyrics ?? null,
        "lyrics-editable": Vt.value,
        source: Ot.value ? { envelope: Ot.value.envelope, bars: Xt.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": S[21] || (S[21] = ($) => c.value.audition = $),
        "resize-mode": "rests",
        onSelect: v,
        onLocate: S[22] || (S[22] = ($) => g.value = $),
        onClipboard: U,
        "lyric-selection": it.value,
        "onUpdate:lyricSelection": S[23] || (S[23] = ($) => it.value = $),
        onLyricEdit: zt,
        onLyricPlace: At,
        onLyricDelete: on,
        onLyricAuto: Qn,
        onNotice: S[24] || (S[24] = ($) => D(u).notes = [$])
      }, null, 8, ["zoom", "row-height", "follow", "track", "locks", "recorded", "sung-visible", "wave-visible", "sound", "chord-sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : G("", !0),
      _.value && te.value?.model ? (C(), A("div", {
        key: 5,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": D(pg),
        "aria-valuemax": D(fg),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: Le,
        onKeydown: je
      }, null, 40, yM)) : G("", !0),
      _n(ZC, {
        ref_key: "transport",
        ref: M,
        voices: ln.value,
        "onUpdate:voices": S[27] || (S[27] = ($) => ln.value = $),
        speed: ni.value,
        "onUpdate:speed": S[28] || (S[28] = ($) => ni.value = $),
        sounds: c.value.sounds,
        metronome: wn.value,
        "onUpdate:metronome": S[29] || (S[29] = ($) => wn.value = $),
        view: te.value,
        bar: ke.value,
        from: Se.value,
        position: St.value,
        reference: Nn.value,
        hear: ct.value,
        "onUpdate:hear": S[30] || (S[30] = ($) => ct.value = $),
        "source-level": Yt.value,
        "onUpdate:sourceLevel": S[31] || (S[31] = ($) => Yt.value = $),
        "source-shift": rn.value,
        "onUpdate:sourceShift": S[32] || (S[32] = ($) => rn.value = $),
        "source-beat": Ai.value,
        "timeline-bars": Xt.value,
        guide: Z.value,
        source: Ot.value,
        "source-problem": Vn.value,
        "loop-range": Ci.value,
        onCursor: S[33] || (S[33] = ($) => p.value = $),
        onTime: ne,
        onStopped: D(x).onStopped
      }, {
        record: yp(({ countingIn: $ }) => [
          _n(iA, {
            settings: H.value,
            "onUpdate:settings": S[25] || (S[25] = (Y) => H.value = Y),
            hub: D(Q),
            recording: D(x).recording.value,
            "counting-in": $,
            step: D(x).step.value,
            target: F.value === "vocal" ? "Vocal" : "Ins",
            disabled: fe.value,
            onRecord: D(x).start,
            onStop: D(x).stop,
            onStep: D(x).toggleStep,
            onRest: D(x).rest,
            onEnable: D(x).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          _n(RA, {
            sounds: B.value,
            "onUpdate:sounds": S[26] || (S[26] = (Y) => B.value = Y),
            fetcher: i.fetcher,
            settings: W.value,
            "keeps-guide": Nr.value,
            onApply: N
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      f("div", {
        class: Ee(["score-main", { "with-roll": _.value && !!te.value?.model, "with-inspector": J.value }]),
        "data-layout": d.value,
        "data-text": J.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: os(Ue.value)
      }, [
        f("div", kM, [
          Ae.value ? (C(), Kn(f2, {
            key: 0,
            voices: ln.value,
            "onUpdate:voices": S[34] || (S[34] = ($) => ln.value = $),
            view: te.value,
            "guide-count": Fe.value.length,
            sounds: B.value,
            "onUpdate:sounds": S[35] || (S[35] = ($) => B.value = $),
            locks: c.value.locks,
            "onUpdate:locks": S[36] || (S[36] = ($) => c.value.locks = $),
            "keeps-guide": Nr.value,
            readonly: i.readonly,
            onClearGuide: he,
            onShiftTrack: S[37] || (S[37] = ($, Y) => Mt({ op: "shift_track", track: $, semitones: Y }))
          }, null, 8, ["voices", "view", "guide-count", "sounds", "locks", "keeps-guide", "readonly"])) : G("", !0),
          _n(YS, {
            view: te.value,
            bar: q.value,
            "error-bars": le.value,
            "source-starts": As.value,
            readonly: i.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: Be,
            onOperate: Mt,
            onNotice: S[38] || (S[38] = ($) => D(u).notes = [$])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          i.lyricsTarget && l.value !== null ? (C(), A("div", wM, [
            S[45] || (S[45] = f("strong", null, "Lyrics", -1)),
            i.lyricsTarget.blocked ? (C(), A("p", xM, R(i.lyricsTarget.blocked), 1)) : (C(), A(ce, { key: 1 }, [
              wi.value ? (C(), A("p", SM, [
                oe(" Apply writes the changed lyrics into " + R(i.lyricsTarget.title) + ": " + R(Ui.value) + ". That sheet then asks for approval again. ", 1),
                i.lyricsTarget.replans ? (C(), A(ce, { key: 0 }, [
                  oe(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : G("", !0)
              ])) : (C(), A("p", CM, [
                oe(R(i.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${i.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !i.readonly ? (C(), A(ce, { key: 0 }, [
                  oe("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : G("", !0)
              ])),
              wi.value ? (C(), A("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: kn
              }, " Revert the lyrics ")) : G("", !0)
            ], 64))
          ])) : G("", !0),
          J.value && Zn.value ? (C(), A("details", AM, [
            S[46] || (S[46] = f("summary", null, "Lyrics fit", -1)),
            _n(wh, {
              lyrics: Zn.value,
              abc: i.doc.text,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : G("", !0)
        ]),
        f("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": D(mg),
          "aria-valuemax": D(gg),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: Ti,
          onKeydown: Pr
        }, null, 40, MM),
        f("div", {
          class: Ee(["score-views", { split: J.value && c.value.advanced }])
        }, [
          J.value ? G("", !0) : (C(), Kn(_c, {
            key: 0,
            text: i.doc.text,
            diagnostics: we.value,
            reveal: k.value,
            readonly: i.readonly,
            onChange: D(u).typed,
            onCursor: Hn
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          _n(Vw, {
            view: te.value,
            locks: c.value.locks,
            stale: V.value,
            selection: D(u).selection,
            playing: p.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: S[39] || (S[39] = ($, Y) => Ft($, Y))
          }, null, 8, ["view", "locks", "stale", "selection", "playing", "zoom"]),
          J.value && c.value.advanced ? (C(), A("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": D(yg),
            "aria-valuemax": D(vg),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: at,
            onKeydown: dt
          }, null, 40, TM)) : G("", !0),
          J.value && c.value.advanced ? (C(), Kn(_c, {
            key: 2,
            text: i.doc.text,
            diagnostics: we.value,
            reveal: k.value,
            readonly: i.readonly,
            onChange: D(u).typed,
            onCursor: Hn
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : G("", !0)
        ], 2),
        J.value ? (C(), Kn(tw, {
          key: 0,
          view: te.value,
          selection: D(u).selection,
          operate: ii,
          "fallback-bar": D(u).primary?.bar ?? null,
          readonly: i.readonly,
          stale: V.value,
          busy: D(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : G("", !0)
      ], 14, bM),
      f("p", $M, [
        f("span", null, R(D(u).selection.length > 1 ? `${D(u).selection.length} selected · ` : "") + R(D(Lm)(D(u).primary, mt.value)), 1),
        (C(!0), A(ce, null, ye(D(u).notes, ($, Y) => (C(), A("span", {
          key: Y,
          class: "change"
        }, R($), 1))), 128))
      ]),
      D(u).error ? (C(), A("p", LM, R(D(u).error), 1)) : G("", !0),
      st.value ? (C(), A("p", DM, R(st.value), 1)) : G("", !0),
      E.value ? (C(), A("p", BM, R(E.value), 1)) : G("", !0),
      Wn.value ? (C(), Kn(Rw, {
        key: 9,
        fetcher: i.fetcher,
        data: Wn.value.data,
        filename: Wn.value.filename,
        view: te.value,
        "keeps-guide": Nr.value,
        "current-guide": Fe.value.length,
        onClose: S[40] || (S[40] = ($) => Wn.value = null),
        onInsert: fp
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : G("", !0),
      we.value.length ? (C(), A("ul", OM, [
        (C(!0), A(ce, null, ye(we.value, ($, Y) => (C(), A("li", {
          key: Y,
          "data-severity": $.severity
        }, [
          f("strong", null, R($.severity), 1),
          $.bar ? (C(), A("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${$.bar}`,
            onClick: (se) => Be($.bar)
          }, "bar " + R($.bar), 9, IM)) : $.line ? (C(), A("span", RM, "line " + R($.line), 1)) : G("", !0),
          oe(" " + R($.message), 1)
        ], 8, EM))), 128))
      ])) : G("", !0)
    ], 544));
  }
}), PM = ["aria-label"], NM = ["title"], VM = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, HM = ["aria-selected", "onClick"], WM = ["title", "aria-label", "aria-pressed"], zM = {
  key: 0,
  class: "hint"
}, FM = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, _M = ["disabled", "title"], KM = {
  class: "body",
  role: "tabpanel"
}, UM = { class: "doc-head" }, GM = ["data-state"], jM = ["disabled", "title", "onClick"], qM = ["disabled", "onClick"], YM = ["onClick"], XM = {
  key: 0,
  class: "conflict"
}, JM = ["onClick"], ZM = ["onClick"], QM = ["onClick"], eT = ["onUpdate:modelValue", "rows", "aria-label", "onFocus", "onInput"], tT = {
  key: 3,
  class: "tag-helpers"
}, nT = ["title", "onClick"], iT = ["title", "onClick"], sT = ["aria-expanded"], oT = ["title", "onClick"], rT = ["title", "onClick"], lT = ["maxlength", "onKeydown"], aT = ["onClick"], uT = {
  key: 4,
  class: "error"
}, cT = {
  key: 5,
  class: "facts"
}, hT = {
  key: 4,
  class: "asr"
}, dT = { key: 0 }, fT = { key: 1 }, pT = { key: 2 }, gT = { key: 5 }, mT = {
  key: 0,
  class: "diff"
}, vT = { key: 0 }, yT = { key: 1 }, bT = { key: 2 }, kT = { key: 3 }, wT = {
  key: 0,
  class: "doc context wide"
}, xT = { class: "doc-head" }, ST = ["title"], CT = {
  key: 1,
  class: "badge"
}, AT = {
  key: 0,
  class: "hint score-owner"
}, MT = {
  key: 1,
  class: "hint"
}, TT = {
  key: 1,
  class: "doc sections"
}, $T = {
  key: 0,
  class: "doc context"
}, LT = { class: "doc-head" }, DT = {
  class: "findings",
  "aria-label": "Validation"
}, BT = ["data-status"], OT = { key: 0 }, ET = ["title"], IT = { key: 1 }, RT = ["title"], PT = { class: "idea" }, NT = {
  key: 0,
  class: "idea"
}, VT = {
  key: 1,
  class: "idea"
}, HT = { class: "where" }, WT = {
  key: 0,
  class: "kept"
}, zT = {
  key: 1,
  class: "error"
}, FT = {
  key: 2,
  class: "error"
}, _T = {
  key: 3,
  class: "error"
}, KT = {
  key: 4,
  class: "error"
}, UT = ["data-severity"], GT = { class: "where" }, jT = {
  key: 0,
  class: "facts"
}, qT = ["disabled"], YT = ["disabled", "title"], XT = ["disabled", "title"], JT = ["aria-valuenow", "title"], ZT = /* @__PURE__ */ wt({
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
    barSources: {},
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = O(() => t.payload?.style_label === "caption"), u = O(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (I) => I === "style" && a.value ? "Caption" : o[I], d = (I) => I === "style" && a.value ? 14 : l[I], h = Is(pu(t.state, t.payload, t.owned)), p = z(t.payload), g = z(null), b = z(!1), k = z(!1), M = z(null), L = O(() => {
      const I = h.find((y) => y.kind === "score"), v = M.value;
      return I && I.intent !== "auto" && v?.reason && v.text === I.text ? v.reason : null;
    }), T = z(null), F = z(0);
    let B;
    const W = O(() => t.payload?.context?.score ?? null), N = Is({ kind: "score", text: W.value ?? "", intent: "keep" }), j = O(
      () => !h.some((I) => I.kind === "score") && !!W.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), P = z(null), Q = O(() => {
      const I = P.value;
      return j.value && I?.reason && I.text === N.text ? I.reason : null;
    }), H = O(
      () => j.value && W.value && Jt(N.text) !== Jt(W.value) ? N.text : null
    );
    function x() {
      if (!H.value) return;
      const I = h.find((v) => v.kind === "lyrics");
      I && I.intent !== "auto" && (I.intent = "manual");
    }
    const E = O(() => {
      const I = new Set(h.map((v) => s[v.kind]));
      for (const v of Object.keys(t.payload?.context ?? {}))
        v in s && I.add(s[v]);
      return ["score", "lyrics", "style", "details"].filter((v) => I.has(v));
    }), fe = h[0] ? s[h[0].kind] : "lyrics", pe = z(fe), te = (I) => t.payload?.docs[I] ?? null, xe = (I) => te(I)?.upstream ?? null, ae = (I) => te(I)?.status === "conflict", Re = (I) => h.filter((v) => s[v.kind] === I), be = O(() => h.find((I) => I.kind === "score") ?? null), De = O(() => be.value?.text ?? W.value ?? null), Ve = O(
      () => h.find((I) => I.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), He = O(
      () => h.find((I) => I.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), V = O(() => Wg(t.payload?.timeline)), we = O(() => {
      const I = t.asrNote ?? T.value;
      return I && I.draft_sha256 === te("lyrics")?.upstream_sha256 ? I : null;
    }), le = (I) => dm(xe(I.kind) ?? "", I.text);
    function q(I) {
      if (I.intent === "auto") return "auto";
      if (I.intent === "manual") return "manual";
      if (I.intent === "rebase") return "edited (merged)";
      if (ae(I.kind)) return "conflict";
      const v = t.state.docs[I.kind]?.state ?? "auto", y = Jt(xe(I.kind) ?? "");
      return v === "auto" && Jt(I.text) !== y ? y || !t.payload ? "edited" : "manual" : v;
    }
    function J(I) {
      I.intent = "auto";
      const v = xe(I.kind);
      v !== null && (I.text = v);
    }
    function Ae(I) {
      return xe(I.kind) !== null || q(I) !== "auto";
    }
    function Fe(I) {
      I.intent = "manual";
    }
    const ut = /* @__PURE__ */ new Map(), Dt = /* @__PURE__ */ new Set();
    function Z(I, v) {
      v instanceof HTMLTextAreaElement ? ut.set(I, v) : ut.delete(I);
    }
    function _(I, v) {
      const y = ut.get(I.kind), w = y && Dt.has(I.kind) ? y.selectionStart : I.text.length, U = hm(I.text, v, w);
      I.text = U.text, it(I), Qt(() => {
        y?.isConnected && (y.focus(), y.setSelectionRange(U.caret, U.caret));
      });
    }
    function ee(I) {
      I.intent = "manual";
    }
    const ke = O(
      () => t.payload?.model_tags?.length ? t.payload.model_tags : [...wu]
    ), Se = O(
      () => (t.payload?.section_tags ?? [...wu, ...am]).filter((I) => !ke.value.includes(I))
    ), St = z([]), sn = z(!1), On = z(!1), jt = z(""), Vt = z("");
    let wi = null;
    function Ui(I) {
      wi = I instanceof HTMLInputElement ? I : null;
    }
    hs(async () => {
      St.value = cm(await Ng(t.fetcher), [...ke.value, ...Se.value]);
    });
    async function Zn(I) {
      const v = St.value;
      St.value = I;
      try {
        await Kg(t.fetcher, I), Vt.value = "";
      } catch (y) {
        St.value = v, Vt.value = y instanceof Error ? y.message : String(y);
      }
    }
    function Ct() {
      On.value = !0, Qt(() => wi?.focus());
    }
    function qt(I) {
      const v = kh(jt.value);
      if (On.value = !1, jt.value = "", !v) return;
      const y = [...ke.value, ...Se.value, ...St.value].find(
        (w) => w.toLowerCase() === v.toLowerCase()
      );
      if (!y) {
        if (St.value.length >= vl) {
          Vt.value = `At most ${vl} tags of your own - remove one first.`;
          return;
        }
        Zn([...St.value, v]);
      }
      _(I, y ?? v);
    }
    function Ht(I) {
      Zn(St.value.filter((v) => v !== I));
    }
    function En(I) {
      I.intent = "rebase";
    }
    function it(I) {
      I.intent === "auto" && (I.intent = "keep");
    }
    function xi() {
      pu(t.state, t.payload, t.owned).forEach((v, y) => Object.assign(h[y], v)), Bt.value = [...t.guide ?? []], At.value = [...t.lyricSpans ?? []], on.value = t.sourceShift ?? 0, bn.value = t.barSources ?? null, N.text = W.value ?? "", F.value++;
    }
    const Wt = O(
      () => h.filter((I) => ae(I.kind) && I.intent === "keep").map((I) => I.kind)
    ), yn = O(() => Ug(t.state, t.payload, h)), Bt = z([...t.guide ?? []]);
    function In(I) {
      Bt.value = I;
    }
    const At = z([...t.lyricSpans ?? []]);
    function Qn(I) {
      At.value = I;
    }
    const on = z(t.sourceShift ?? 0);
    function ei(I) {
      on.value = I;
    }
    const bn = di(t.barSources ?? null);
    function Si(I) {
      bn.value = I;
    }
    function Rn() {
      return { lyricSpans: At.value, sourceShift: on.value, barSources: bn.value };
    }
    const ti = z(null), Pn = O(() => h.find((I) => I.kind === "lyrics") ?? null), zt = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, kn = O(() => Pn.value ? zt : t.lyricsTarget ?? null), wn = O(() => {
      const I = t.payload?.context?.lyrics, v = ti.value;
      return Pn.value || !kn.value || kn.value.blocked || !v || !I ? null : Jt(v) !== Jt(I) ? v : null;
    });
    function Nn(I) {
      const v = Pn.value;
      v ? I !== null && Jt(I) !== Jt(v.text) && (v.text = I, it(v)) : ti.value = I;
    }
    function Ot() {
      if (!wn.value || !kn.value?.replans) return;
      const I = h.find((v) => v.kind === "score");
      I && I.intent === "keep" && (I.intent = "manual");
    }
    const Vn = O(
      () => vu(yn.value) !== vu(t.state) || !Ps(Bt.value, t.guide ?? []) || !zo(At.value, t.lyricSpans ?? []) || on.value !== (t.sourceShift ?? 0) || wn.value !== null || H.value !== null
    ), ct = O(() => {
      const I = t.payload?.arrangement;
      return I && I.status !== "skipped" ? I : null;
    }), Yt = O(() => zg(ct.value?.notes ?? [])), Ci = O(() => (p.value?.findings ?? []).filter((I) => I.severity !== "info")), Xt = O(() => (p.value?.findings ?? []).filter((I) => I.severity === "info")), Ai = O(() => Ci.value.some((I) => I.severity === "error")), Gi = O(
      () => !b.value && !Ai.value && !Wt.value.length && !L.value && !Q.value && !!p.value?.fingerprint
    ), rn = O(
      () => Wt.value.length ? "Resolve the conflicts first." : L.value ?? Q.value
    ), As = O(() => Wt.value.length ? "⇄ conflict" : Ai.value ? "✖ errors" : Ci.value.length ? "⚠ warnings" : p.value?.waiting && !Vn.value ? "⏸ waiting for approval" : p.value ? "✓ valid" : "not run yet");
    async function mt() {
      if (t.payload) {
        b.value = !0, g.value = null;
        try {
          p.value = await Fg(t.fetcher, {
            sheet_state: yn.value,
            upstream: _g(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: H.value ? { ...t.payload.context, score: H.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null,
            sparse: t.payload.sparse ?? !1
          });
        } catch (I) {
          g.value = I instanceof vh ? `${I.message}${I.hint ? ` — ${I.hint}` : ""}` : String(I);
        } finally {
          b.value = !1;
        }
      }
    }
    Oe(
      () => [...h.map((I) => I.text + I.intent), H.value ?? ""].join("\0"),
      () => {
        clearTimeout(B), B = setTimeout(mt, 300);
      }
    );
    function ln(I) {
      return H.value ? { text: H.value, approved: I } : null;
    }
    function ni() {
      rn.value || (Ot(), x(), n(
        "apply",
        yu(yn.value, t.state.review?.approved_fingerprint ?? null),
        Bt.value,
        wn.value,
        ln(!1),
        !1,
        Rn()
      ));
    }
    async function Ft() {
      Ot(), x(), await mt(), Gi.value && n(
        "apply",
        yu(yn.value, p.value?.fingerprint ?? null),
        Bt.value,
        wn.value,
        ln(!0),
        !0,
        Rn()
      );
    }
    function Hn() {
      Vn.value ? k.value = !0 : n("close");
    }
    const Be = Is(Vg()), vt = Is({ width: window.innerWidth, height: window.innerHeight }), Mt = O(() => {
      const I = Be.maximized ? vt.height - 2 * bu : Be.height;
      return Be.maximized ? {
        width: `${vt.width - 2 * bu}px`,
        height: `${I}px`,
        "--plenio-dialog-h": `${I}px`
      } : { width: `${Be.width}px`, height: `${Be.height}px`, "--plenio-dialog-h": `${I}px` };
    });
    function ii() {
      vt.width = window.innerWidth, vt.height = window.innerHeight;
      const I = ku({ width: Be.width, height: Be.height }, vt);
      (I.width !== Be.width || I.height !== Be.height) && (Be.width = I.width, Be.height = I.height, _r(Be));
    }
    function Mi() {
      Be.maximized = !Be.maximized, _r(Be);
    }
    function ji(I) {
      I.preventDefault(), I.stopPropagation();
      const v = { width: Be.width, height: Be.height };
      Wo(
        I,
        ({ dx: y, dy: w }) => {
          const U = ku(
            { width: v.width + y, height: v.height + w },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Be.width = U.width, Be.height = U.height;
        },
        () => _r(Be)
      );
    }
    function si(I) {
      I.key === "Escape" && !I.defaultPrevented && (I.preventDefault(), k.value ? k.value = !1 : Hn());
    }
    return hs(() => {
      window.addEventListener("keydown", si), window.addEventListener("resize", ii), t.payload && mt();
      const I = te("lyrics")?.upstream_sha256;
      !t.asrNote && I && Hg(t.fetcher, I).then((v) => T.value = v).catch(() => {
      });
    }), Yn(() => {
      window.removeEventListener("keydown", si), window.removeEventListener("resize", ii), clearTimeout(B);
    }), (I, v) => (C(), A("div", {
      class: "plenio-overlay",
      onMousedown: Ke(Hn, ["self"])
    }, [
      f("div", {
        class: Ee(["plenio-dialog", { maximized: Be.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": i.title,
        style: os(Mt.value)
      }, [
        f("header", {
          onDblclick: Ke(Mi, ["self"])
        }, [
          f("h2", null, R(i.title), 1),
          f("span", {
            class: Ee(["status", { bad: Ai.value || Wt.value.length }]),
            title: p.value?.status ?? ""
          }, R(As.value), 11, NM),
          f("div", VM, [
            (C(!0), A(ce, null, ye(E.value, (y) => (C(), A("button", {
              key: y,
              role: "tab",
              "aria-selected": pe.value === y,
              class: Ee({ active: pe.value === y }),
              onClick: (w) => pe.value = y
            }, R(c(y)), 11, HM))), 128))
          ]),
          f("button", {
            class: "icon",
            title: Be.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Be.maximized ? "Restore" : "Maximize",
            "aria-pressed": Be.maximized,
            onClick: Mi
          }, R(Be.maximized ? "❐" : "⛶"), 9, WM),
          f("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: Hn
          }, "×")
        ], 32),
        i.payload ? G("", !0) : (C(), A("p", zM, [...v[7] || (v[7] = [
          oe(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          f("em", null, "Make manual", -1),
          oe("; ", -1),
          f("em", null, "Back to auto", -1),
          oe(" hands a document back to the workflow. ", -1)
        ])])),
        k.value ? (C(), A("div", FM, [
          v[8] || (v[8] = oe(" You have changes that are not applied yet. ", -1)),
          f("button", {
            class: "primary",
            disabled: !!rn.value,
            title: rn.value ?? "Save your documents into the node",
            onClick: ni
          }, " Apply ", 8, _M),
          f("button", {
            onClick: v[0] || (v[0] = (y) => n("close"))
          }, "Discard"),
          f("button", {
            onClick: v[1] || (v[1] = (y) => k.value = !1)
          }, "Keep editing")
        ])) : G("", !0),
        f("div", KM, [
          (C(!0), A(ce, null, ye(Re(pe.value), (y) => (C(), A("section", {
            key: y.kind + F.value,
            class: Ee(["doc", { wide: y.kind === "score" }])
          }, [
            f("div", UM, [
              f("h3", null, R(u.value[y.kind]), 1),
              f("span", {
                class: "badge",
                "data-state": q(y)
              }, R(q(y)), 9, GM),
              v[9] || (v[9] = f("span", { class: "spacer" }, null, -1)),
              f("button", {
                disabled: !Ae(y),
                title: xe(y.kind) !== null ? "Discard your edit and use the draft" : "Discard your text: the next run computes this document again (the writer, the plan or the transcription) and uses it",
                onClick: (w) => J(y)
              }, R(xe(y.kind) !== null ? "Use draft" : "Back to auto"), 9, jM),
              y.kind === "lyrics" ? (C(), A("button", {
                key: 0,
                disabled: y.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (w) => Fe(y)
              }, " Use my own lyrics ", 8, qM)) : (C(), A("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (w) => Fe(y)
              }, " Make manual ", 8, YM))
            ]),
            ae(y.kind) && y.intent === "keep" ? (C(), A("div", XM, [
              oe(" The draft changed after you edited this document (" + R(te(y.kind)?.reason) + "). ", 1),
              f("button", {
                onClick: (w) => ee(y)
              }, "Keep my edit (manual)", 8, JM),
              f("button", {
                onClick: (w) => J(y)
              }, "Use the new draft", 8, ZM),
              f("button", {
                onClick: (w) => En(y)
              }, "Merge by hand", 8, QM)
            ])) : G("", !0),
            y.kind === "score" ? (C(), Kn(gh, {
              key: 1,
              doc: y,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !1,
              "layout-default": i.layout ?? null,
              lyrics: Ve.value,
              title: He.value,
              guide: Bt.value,
              "lyric-spans": At.value,
              "source-shift": on.value,
              "bar-sources": bn.value,
              "lyrics-target": kn.value,
              "lyrics-pending": Pn.value ? null : ti.value,
              onEdited: (w) => it(y),
              onGuideChange: In,
              onLyricSpansChange: Qn,
              onSourceShiftChange: ei,
              onBarSourcesChange: Si,
              onLyricsChange: Nn,
              onGate: v[2] || (v[2] = (w, U) => M.value = { text: w, reason: U })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "bar-sources", "lyrics-target", "lyrics-pending", "onEdited"])) : $e((C(), A("textarea", {
              key: 2,
              ref_for: !0,
              ref: (w) => Z(y.kind, w),
              "onUpdate:modelValue": (w) => y.text = w,
              rows: d(y.kind),
              spellcheck: "false",
              "aria-label": u.value[y.kind],
              onFocus: (w) => D(Dt).add(y.kind),
              onInput: (w) => it(y)
            }, null, 40, eT)), [
              [lt, y.text]
            ]),
            y.kind === "lyrics" ? (C(), A("p", tT, [
              v[10] || (v[10] = f("span", null, "Section tags (the model sings section by section):", -1)),
              (C(!0), A(ce, null, ye(ke.value, (w) => (C(), A("button", {
                key: w,
                title: D(Ur)(w, !0),
                onClick: (U) => _(y, w)
              }, " [" + R(w) + "] ", 9, nT))), 128)),
              sn.value ? (C(!0), A(ce, { key: 0 }, ye(Se.value, (w) => (C(), A("button", {
                key: "more-" + w,
                class: "more",
                title: D(Ur)(w, !1),
                onClick: (U) => _(y, w)
              }, " [" + R(w) + "] ", 9, iT))), 128)) : G("", !0),
              Se.value.length ? (C(), A("button", {
                key: 1,
                class: "link",
                "aria-expanded": sn.value,
                title: "Tags Plenio knows besides the model's own sections",
                onClick: v[3] || (v[3] = (w) => sn.value = !sn.value)
              }, R(sn.value ? "fewer" : `more (${Se.value.length})`), 9, sT)) : G("", !0),
              (C(!0), A(ce, null, ye(St.value, (w) => (C(), A("span", {
                key: "own-" + w,
                class: "own"
              }, [
                f("button", {
                  title: `${D(Ur)(w, !1)} - a tag of your own`,
                  onClick: (U) => _(y, w)
                }, " [" + R(w) + "] ", 9, oT),
                f("button", {
                  class: "drop",
                  title: `Remove [${w}] from your tags (the lyrics keep it)`,
                  onClick: (U) => Ht(w)
                }, " × ", 8, rT)
              ]))), 128)),
              On.value ? (C(), A(ce, { key: 2 }, [
                $e(f("input", {
                  ref_for: !0,
                  ref: Ui,
                  "onUpdate:modelValue": v[4] || (v[4] = (w) => jt.value = w),
                  class: "new-tag",
                  maxlength: D(bh),
                  placeholder: "e.g. Violin Rise",
                  "aria-label": "Your section tag",
                  onKeydown: [
                    et(Ke((w) => qt(y), ["prevent", "stop"]), ["enter"]),
                    v[5] || (v[5] = et(Ke((w) => On.value = !1, ["prevent", "stop"]), ["esc"]))
                  ]
                }, null, 40, lT), [
                  [lt, jt.value]
                ]),
                f("button", {
                  onClick: (w) => qt(y)
                }, "Add", 8, aT)
              ], 64)) : (C(), A("button", {
                key: 3,
                class: "link",
                title: "A section tag of your own - kept for your next songs, inserted with one click",
                onClick: Ct
              }, " + your tag ")),
              Vt.value ? (C(), A("span", uT, R(Vt.value), 1)) : G("", !0),
              y.intent === "manual" ? (C(), A("span", cT, "the writer is not consulted - these are your lyrics")) : G("", !0)
            ])) : G("", !0),
            y.kind === "lyrics" && we.value ? (C(), A("p", hT, [
              f("span", null, "Transcribed (" + R(we.value.language) + ").", 1),
              we.value.corrected?.length ? (C(), A("span", dT, [
                v[11] || (v[11] = oe(" Corrected as misheard: ", -1)),
                (C(!0), A(ce, null, ye(we.value.corrected, (w, U) => (C(), A("span", {
                  key: "fix-" + U,
                  class: "fix"
                }, [
                  f("s", null, R(w.heard), 1),
                  oe(" → " + R(w.word), 1)
                ]))), 128))
              ])) : G("", !0),
              we.value.low_confidence.length ? (C(), A("span", fT, [
                v[12] || (v[12] = oe(" Check these unsure words: ", -1)),
                (C(!0), A(ce, null, ye(we.value.low_confidence, (w, U) => (C(), A("mark", {
                  key: "low-" + U
                }, R(w), 1))), 128))
              ])) : G("", !0),
              we.value.left_out.length ? (C(), A("span", pT, [
                v[13] || (v[13] = oe("Left out as not sung: ", -1)),
                f("s", null, R(we.value.left_out.join(" ")), 1)
              ])) : G("", !0)
            ])) : G("", !0),
            xe(y.kind) !== null && D(Jt)(xe(y.kind) ?? "") !== D(Jt)(y.text) ? (C(), A("details", gT, [
              f("summary", null, "Changes against the draft (" + R(D(fm)(le(y))) + " words)", 1),
              y.kind !== "score" ? (C(), A("p", mT, [
                (C(!0), A(ce, null, ye(le(y), (w, U) => (C(), A(ce, { key: U }, [
                  w.text === D(qs) ? (C(), A("br", vT)) : w.op === "added" ? (C(), A("ins", yT, R(w.text + " "), 1)) : w.op === "removed" ? (C(), A("del", bT, R(w.text + " "), 1)) : (C(), A("span", kT, R(w.text + " "), 1))
                ], 64))), 128))
              ])) : G("", !0),
              f("pre", null, R(xe(y.kind)), 1)
            ])) : G("", !0),
            y.kind === "lyrics" ? (C(), Kn(wh, {
              key: 6,
              lyrics: y.text,
              abc: De.value,
              fetcher: i.fetcher,
              engine: i.payload?.engine ?? null,
              instrumental: i.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : G("", !0)
          ], 2))), 128)),
          pe.value === "score" && !be.value && W.value ? (C(), A("section", wT, [
            f("div", xT, [
              v[14] || (v[14] = f("h3", null, "Score (ABC)", -1)),
              j.value ? (C(), A("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${i.scoreTarget?.title}`
              }, " from " + R(i.scoreTarget?.title) + R(H.value ? " · changed" : ""), 9, ST)) : (C(), A("span", CT, "from the other sheet (read-only)"))
            ]),
            j.value ? (C(), A("p", AT, [
              v[15] || (v[15] = oe(" Changes to the score go into ", -1)),
              f("strong", null, R(i.scoreTarget?.title), 1),
              v[16] || (v[16] = oe(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              v[17] || (v[17] = f("strong", null, "Approve", -1)),
              v[18] || (v[18] = oe(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : i.scoreTarget?.blocked ? (C(), A("p", MT, R(i.scoreTarget.blocked), 1)) : G("", !0),
            _n(gh, {
              doc: N,
              fetcher: i.fetcher,
              payload: i.payload,
              readonly: !j.value,
              "layout-default": i.layout ?? null,
              lyrics: Ve.value,
              "lyrics-target": Pn.value ? kn.value : null,
              "lyric-spans": At.value,
              "source-shift": on.value,
              "bar-sources": bn.value,
              onLyricSpansChange: Qn,
              onSourceShiftChange: ei,
              onBarSourcesChange: Si,
              onLyricsChange: Nn,
              onGate: v[6] || (v[6] = (y, w) => P.value = { text: y, reason: w })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift", "bar-sources"])
          ])) : G("", !0),
          pe.value === "lyrics" && V.value.length ? (C(), A("section", TT, [
            v[20] || (v[20] = f("div", { class: "doc-head" }, [
              f("h3", null, "Sections of the source"),
              f("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            f("table", null, [
              v[19] || (v[19] = f("thead", null, [
                f("tr", null, [
                  f("th", null, "Section"),
                  f("th", null, "Bars"),
                  f("th", null, "From"),
                  f("th", null, "To")
                ])
              ], -1)),
              f("tbody", null, [
                (C(!0), A(ce, null, ye(V.value, (y, w) => (C(), A("tr", { key: w }, [
                  f("td", null, R(y.label), 1),
                  f("td", null, R(y.bars), 1),
                  f("td", null, R(y.start), 1),
                  f("td", null, R(y.end), 1)
                ]))), 128))
              ])
            ])
          ])) : G("", !0),
          (C(!0), A(ce, null, ye(i.payload?.context ?? {}, (y, w) => (C(), A(ce, {
            key: "context-" + w
          }, [
            w !== "score" && s[w] === pe.value ? (C(), A("section", $T, [
              f("div", LT, [
                f("h3", null, R(u.value[w] ?? w), 1),
                v[21] || (v[21] = f("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              f("pre", null, R(y), 1)
            ])) : G("", !0)
          ], 64))), 128))
        ]),
        f("section", DT, [
          ct.value ? (C(), A("div", {
            key: 0,
            class: "arrangement",
            "data-status": ct.value.status
          }, [
            ct.value.status === "fallback" ? (C(), A("p", OT, [
              v[22] || (v[22] = f("strong", null, "Arrangement not applied", -1)),
              f("span", {
                class: "experimental",
                title: D(Fr)
              }, "experimental", 8, ET),
              oe(" - " + R(D(gu)(ct.value)) + ": " + R(ct.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (C(), A("details", IT, [
              f("summary", null, [
                v[23] || (v[23] = f("strong", null, "Arrangement", -1)),
                f("span", {
                  class: "experimental",
                  title: D(Fr)
                }, "experimental", 8, RT),
                oe(" " + R(D(gu)(ct.value)) + ": " + R(ct.value.summary), 1)
              ]),
              f("p", PT, R(D(Fr)), 1),
              D(mu)(ct.value) ? (C(), A("p", NT, R(D(mu)(ct.value)), 1)) : G("", !0),
              ct.value.idea ? (C(), A("p", VT, R(ct.value.idea), 1)) : G("", !0),
              f("ul", null, [
                (C(!0), A(ce, null, ye(ct.value.sections ?? [], (y) => (C(), A("li", {
                  key: y.index
                }, [
                  f("strong", null, R(y.index) + " " + R(y.label), 1),
                  f("span", HT, "bars " + R(y.bars), 1),
                  oe(" " + R(y.applied.length ? y.applied.join("; ") : "unchanged") + " ", 1),
                  y.kept.length ? (C(), A("span", WT, " - kept: " + R(y.kept.join("; ")), 1)) : G("", !0)
                ]))), 128)),
                (C(!0), A(ce, null, ye(Yt.value, (y, w) => (C(), A("li", {
                  key: "note" + w,
                  "data-severity": "info"
                }, R(y), 1))), 128))
              ])
            ]))
          ], 8, BT)) : G("", !0),
          g.value ? (C(), A("p", zT, R(g.value), 1)) : G("", !0),
          Wt.value.length ? (C(), A("p", FT, " Resolve the conflict in: " + R(Wt.value.join(", ")) + ". ", 1)) : G("", !0),
          L.value ? (C(), A("p", _T, "Score: " + R(L.value), 1)) : Q.value ? (C(), A("p", KT, "Score: " + R(Q.value), 1)) : G("", !0),
          f("ul", null, [
            (C(!0), A(ce, null, ye(Ci.value, (y, w) => (C(), A("li", {
              key: w,
              "data-severity": y.severity
            }, [
              f("strong", null, R(y.severity), 1),
              v[24] || (v[24] = oe()),
              f("span", GT, R(y.where), 1),
              oe(" " + R(y.message), 1)
            ], 8, UT))), 128)),
            (C(!0), A(ce, null, ye(Xt.value, (y, w) => (C(), A("li", {
              key: "i" + w,
              "data-severity": "info"
            }, R(y.message), 1))), 128))
          ])
        ]),
        f("footer", null, [
          i.owned.includes("score") && p.value ? (C(), A("span", jT, " render: " + R(p.value.planning_mode) + ", ceiling " + R(Math.round(p.value.score_seconds)) + " s ", 1)) : G("", !0),
          v[25] || (v[25] = f("span", { class: "spacer" }, null, -1)),
          f("button", {
            disabled: !Vn.value,
            title: "Discard every change made in this editor",
            onClick: xi
          }, "Revert", 8, qT),
          f("button", { onClick: Hn }, "Close"),
          f("button", {
            class: "primary",
            disabled: !!rn.value,
            title: rn.value ?? "Save your documents into the node",
            onClick: ni
          }, " Apply ", 8, YT),
          i.review === "stop for review" ? (C(), A("button", {
            key: 1,
            class: "primary",
            disabled: !Gi.value,
            title: L.value ?? "Release exactly these documents for the next run",
            onClick: Ft
          }, " Approve ", 8, XT)) : G("", !0)
        ]),
        Be.maximized ? G("", !0) : (C(), A("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Be.width,
          title: `Resize (${Be.width} × ${Be.height})`,
          onPointerdown: ji
        }, null, 40, JT))
      ], 14, PM)
    ], 32));
  }
});
function QT() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const i = document.createElement("style");
  i.id = "plenio-dialog-styles", i.textContent = kp, document.head.append(i);
}
function l$(i) {
  QT();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    n.unmount(), e.remove();
  }, n = bp(ZT, {
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
    barSources: i.barSources ?? null,
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
  l$ as openSheetDialog
};
