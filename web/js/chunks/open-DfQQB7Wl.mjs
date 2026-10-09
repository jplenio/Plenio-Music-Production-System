import { a as Zv, P as Jd, b as Qv, t as ey, i as ty, T as el, d as ny, s as pl, f as iy, p as sy, c as oy, e as ry, g as ly, h as ay, j as uy, k as cy, l as ph, m as hy, n as fy, I as Zd, o as gl, q as dy, r as py, u as gy, v as my, w as vy, x as yy, R as by, y as xy, S as wy, z as ky, N as Sy, A as Cy, B as tl, C as gh, D as My, E as mh, F as Ay, G as Ty, H as $y, J as bn, K as Dy, L as Oy, M as vh, O as Ly, Q as Ey, U as Ma, V as yh, W as bh, X as By, Y as Iy, Z as xh, _ as wh, $ as Aa, a0 as Ry, a1 as Py, a2 as kh, a3 as _y, a4 as Sh } from "./main-Bn0Z0Mwj.mjs";
import { a as Ny, r as Vy, n as Hy, e as Ta, b as Fy, s as zy, p as Wy } from "./notationExport-DkCMgjck.mjs";
import { lineKey as ml, parseSpans as Qd, sameSpans as nl, clipOfLines as Ch, sectionAt as Ky, sectionRange as Cr, placedLines as Mh, settle as Uy, withSectionSpans as jy, parseLineKey as Gy, remapSpans as qy } from "./lyricPlacement-lv7ThC8m.mjs";
import { notesLabel as Yy, trackRows as Xy, parseGuide as Jy, sameGuide as Co, remapGuide as Zy, guideNotes as Qy } from "./tracks-DxmZeggM.mjs";
// @__NO_SIDE_EFFECTS__
function dc(n) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const t of n.split(",")) e[t] = 1;
  return (t) => t in e;
}
const ut = {}, gs = [], ys = () => {
}, ep = () => !1, Wl = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // uppercase letter
(n.charCodeAt(2) > 122 || n.charCodeAt(2) < 97), Kl = (n) => n.startsWith("onUpdate:"), Dn = Object.assign, tp = (n, e) => {
  const t = n.indexOf(e);
  t > -1 && n.splice(t, 1);
}, e0 = Object.prototype.hasOwnProperty, gt = (n, e) => e0.call(n, e), Ve = Array.isArray, Ki = (n) => hr(n) === "[object Map]", Ai = (n) => hr(n) === "[object Set]", Ah = (n) => hr(n) === "[object Date]", dt = (n) => typeof n == "function", Rt = (n) => typeof n == "string", Hn = (n) => typeof n == "symbol", Tt = (n) => n !== null && typeof n == "object", np = (n) => (Tt(n) || dt(n)) && dt(n.then) && dt(n.catch), ip = Object.prototype.toString, hr = (n) => ip.call(n), t0 = (n) => hr(n).slice(8, -1), sp = (n) => hr(n) === "[object Object]", pc = (n) => Rt(n) && n !== "NaN" && n[0] !== "-" && "" + parseInt(n, 10) === n, Eo = /* @__PURE__ */ dc(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ul = (n) => {
  const e = /* @__PURE__ */ Object.create(null);
  return ((t) => e[t] || (e[t] = n(t)));
}, n0 = /-\w/g, Cn = Ul(
  (n) => n.replace(n0, (e) => e.slice(1).toUpperCase())
), i0 = /\B([A-Z])/g, Oi = Ul(
  (n) => n.replace(i0, "-$1").toLowerCase()
), op = Ul((n) => n.charAt(0).toUpperCase() + n.slice(1)), $a = Ul(
  (n) => n ? `on${op(n)}` : ""
), Kt = (n, e) => !Object.is(n, e), il = (n, ...e) => {
  for (let t = 0; t < n.length; t++)
    n[t](...e);
}, rp = (n, e, t, i = !1) => {
  Object.defineProperty(n, e, {
    configurable: !0,
    enumerable: !1,
    writable: i,
    value: t
  });
}, jl = (n) => {
  const e = parseFloat(n);
  return isNaN(e) ? n : e;
};
let Th;
const Gl = () => Th || (Th = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ki(n) {
  if (Ve(n)) {
    const e = {};
    for (let t = 0; t < n.length; t++) {
      const i = n[t], s = Rt(i) ? l0(i) : ki(i);
      if (s)
        for (const o in s)
          e[o] = s[o];
    }
    return e;
  } else if (Rt(n) || Tt(n))
    return n;
}
const s0 = /;(?![^(]*\))/g, o0 = /:([^]+)/, r0 = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function l0(n) {
  const e = {};
  return n.replace(r0, (t) => t.startsWith("/*") ? "" : t).split(s0).forEach((t) => {
    if (t) {
      const i = t.split(o0);
      i.length > 1 && (e[i[0].trim()] = i[1].trim());
    }
  }), e;
}
function qe(n) {
  let e = "";
  if (Rt(n))
    e = n;
  else if (Ve(n))
    for (let t = 0; t < n.length; t++) {
      const i = qe(n[t]);
      i && (e += i + " ");
    }
  else if (Tt(n))
    for (const t in n)
      n[t] && (e += t + " ");
  return e.trim();
}
const a0 = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", u0 = /* @__PURE__ */ dc(a0);
function lp(n) {
  return !!n || n === "";
}
function c0(n, e, t) {
  if (n.length !== e.length) return !1;
  let i = !0;
  for (let s = 0; i && s < n.length; s++)
    i = Ti(n[s], e[s], t);
  return i;
}
function $h(n, e, t) {
  if (n.size !== e.size) return !1;
  const i = Array.from(e), s = new Uint8Array(i.length);
  for (const o of n) {
    let r = -1;
    for (let l = 0; l < i.length; l++)
      if (!s[l] && Ti(o, i[l], t)) {
        r = l;
        break;
      }
    if (r < 0) return !1;
    s[r] = 1;
  }
  return !0;
}
function h0(n, e, t) {
  let i = Ki(n), s = Ki(e);
  if (i || s || (i = Ai(n), s = Ai(e), i || s))
    return i && s ? $h(n, e, t) : !1;
  const o = Object.keys(n).length, r = Object.keys(e).length;
  if (o !== r)
    return !1;
  for (const l in n) {
    const a = n.hasOwnProperty(l), u = e.hasOwnProperty(l);
    if (a && !u || !a && u || !Ti(n[l], e[l], t))
      return !1;
  }
  return String(n) === String(e);
}
function Dh(n, e, t, i) {
  t || (t = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [s, o] = t;
  if (s.has(n) || o.has(e))
    return s.get(n) === e && o.get(e) === n;
  s.set(n, e), o.set(e, n);
  const r = i(n, e, t);
  return s.delete(n), o.delete(e), r;
}
function Ti(n, e, t) {
  if (n === e) return !0;
  let i = Ah(n), s = Ah(e);
  return i || s ? i && s ? n.getTime() === e.getTime() : !1 : (i = Hn(n), s = Hn(e), i || s ? n === e : (i = Ve(n), s = Ve(e), i || s ? i && s ? Dh(n, e, t, c0) : !1 : (i = Tt(n), s = Tt(e), i || s ? !i || !s ? !1 : Dh(n, e, t, h0) : String(n) === String(e))));
}
function gc(n, e) {
  return n.findIndex((t) => Ti(t, e));
}
const ap = (n) => !!(n && n.__v_isRef === !0), F = (n) => Rt(n) ? n : n == null ? "" : Ve(n) || Tt(n) && (n.toString === ip || !dt(n.toString)) ? ap(n) ? F(n.value) : JSON.stringify(n, up, 2) : String(n), up = (n, e) => ap(e) ? up(n, e.value) : Ki(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (t, [i, s], o) => (t[Da(i, o) + " =>"] = s, t),
    {}
  )
} : Ai(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((t) => Da(t))
} : Hn(e) ? Da(e) : Tt(e) && !Ve(e) && !sp(e) ? String(e) : e, Da = (n, e = "") => {
  var t;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Hn(n) ? `Symbol(${(t = n.description) != null ? t : e})` : n
  );
};
let zt;
class f0 {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && zt && (zt.active ? (this.parent = zt, this.index = (zt.scopes || (zt.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let e, t;
      if (this.scopes) {
        const i = this.scopes.slice();
        for (e = 0, t = i.length; e < t; e++)
          i[e].pause();
      }
      for (e = 0, t = this.effects.length; e < t; e++)
        this.effects[e].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let e, t;
      if (this.scopes) {
        const s = this.scopes.slice();
        for (e = 0, t = s.length; e < t; e++)
          s[e].resume();
      }
      const i = this.effects.slice();
      for (e = 0, t = i.length; e < t; e++)
        i[e].resume();
    }
  }
  run(e) {
    if (this._active) {
      const t = zt;
      try {
        return zt = this, e();
      } finally {
        zt = t;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = zt, zt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (zt === this)
        zt = this.prevScope;
      else {
        let e = zt;
        for (; e; ) {
          if (e.prevScope === this) {
            e.prevScope = this.prevScope;
            break;
          }
          e = e.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(e) {
    if (this._active) {
      this._active = !1;
      let t, i;
      for (t = 0, i = this.effects.length; t < i; t++)
        this.effects[t].stop();
      for (this.effects.length = 0, t = 0, i = this.cleanups.length; t < i; t++)
        this.cleanups[t]();
      if (this.cleanups.length = 0, this.scopes) {
        const s = this.scopes.slice();
        for (t = 0, i = s.length; t < i; t++)
          s[t].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !e) {
        const s = this.parent.scopes.pop();
        s && s !== this && (this.parent.scopes[this.index] = s, s.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function d0() {
  return zt;
}
let xt;
const Oa = /* @__PURE__ */ new WeakSet();
class cp {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, zt && (zt.active ? zt.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Oa.has(this) && (Oa.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || fp(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Oh(this), dp(this);
    const e = xt, t = Vn;
    xt = this, Vn = !0;
    try {
      return this.fn();
    } finally {
      pp(this), xt = e, Vn = t, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        yc(e);
      this.deps = this.depsTail = void 0, Oh(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Oa.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    hu(this) && this.run();
  }
  get dirty() {
    return hu(this);
  }
}
let hp = 0, Bo, Io;
function fp(n, e = !1) {
  if (n.flags |= 8, e) {
    n.next = Io, Io = n;
    return;
  }
  n.next = Bo, Bo = n;
}
function mc() {
  hp++;
}
function vc() {
  if (--hp > 0)
    return;
  if (Io) {
    let e = Io;
    for (Io = void 0; e; ) {
      const t = e.next;
      e.next = void 0, e.flags &= -9, e = t;
    }
  }
  let n;
  for (; Bo; ) {
    let e = Bo;
    for (Bo = void 0; e; ) {
      const t = e.next;
      if (e.next = void 0, e.flags &= -9, e.flags & 1)
        try {
          e.trigger();
        } catch (i) {
          n || (n = i);
        }
      e = t;
    }
  }
  if (n) throw n;
}
function dp(n) {
  for (let e = n.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function pp(n) {
  let e, t = n.depsTail, i = t;
  for (; i; ) {
    const s = i.prevDep;
    i.version === -1 ? (i === t && (t = s), yc(i), p0(i)) : e = i, i.dep.activeLink = i.prevActiveLink, i.prevActiveLink = void 0, i = s;
  }
  n.deps = e, n.depsTail = t;
}
function hu(n) {
  for (let e = n.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (gp(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!n._dirty;
}
function gp(n) {
  if (n.flags & 4 && !(n.flags & 16) || (n.flags &= -17, n.globalVersion === Uo) || (n.globalVersion = Uo, !n.isSSR && n.flags & 128 && (!n.deps && !n._dirty || !hu(n))))
    return;
  n.flags |= 2;
  const e = n.dep, t = xt, i = Vn;
  xt = n, Vn = !0;
  try {
    dp(n);
    const s = n.fn(n._value);
    (e.version === 0 || Kt(s, n._value)) && (n.flags |= 128, n._value = s, e.version++);
  } catch (s) {
    throw e.version++, s;
  } finally {
    xt = t, Vn = i, pp(n), n.flags &= -3;
  }
}
function yc(n, e = !1) {
  const { dep: t, prevSub: i, nextSub: s } = n;
  if (i && (i.nextSub = s, n.prevSub = void 0), s && (s.prevSub = i, n.nextSub = void 0), t.subs === n && (t.subs = i, !i && t.computed)) {
    t.computed.flags &= -5;
    for (let o = t.computed.deps; o; o = o.nextDep)
      yc(o, !0);
  }
  !e && !--t.sc && t.map && t.map.delete(t.key);
}
function p0(n) {
  const { prevDep: e, nextDep: t } = n;
  e && (e.nextDep = t, n.prevDep = void 0), t && (t.prevDep = e, n.nextDep = void 0);
}
let Vn = !0;
const mp = [];
function ji() {
  mp.push(Vn), Vn = !1;
}
function Gi() {
  const n = mp.pop();
  Vn = n === void 0 ? !0 : n;
}
function Oh(n) {
  const { cleanup: e } = n;
  if (n.cleanup = void 0, e) {
    const t = xt;
    xt = void 0;
    try {
      e();
    } finally {
      xt = t;
    }
  }
}
let Uo = 0;
class g0 {
  constructor(e, t) {
    this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class ql {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!xt || !Vn || xt === this.computed)
      return;
    let t = this.activeLink;
    if (t === void 0 || t.sub !== xt)
      t = this.activeLink = new g0(xt, this), xt.deps ? (t.prevDep = xt.depsTail, xt.depsTail.nextDep = t, xt.depsTail = t) : xt.deps = xt.depsTail = t, vp(t);
    else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
      const i = t.nextDep;
      i.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = i), t.prevDep = xt.depsTail, t.nextDep = void 0, xt.depsTail.nextDep = t, xt.depsTail = t, xt.deps === t && (xt.deps = i);
    }
    return t;
  }
  trigger(e) {
    this.version++, Uo++, this.notify(e);
  }
  notify(e) {
    mc();
    try {
      for (let t = this.subs; t; t = t.prevSub)
        t.sub.notify() && t.sub.dep.notify();
    } finally {
      vc();
    }
  }
}
function vp(n) {
  if (n.dep.sc++, n.sub.flags & 4) {
    const e = n.dep.computed;
    if (e && !n.dep.subs) {
      e.flags |= 20;
      for (let i = e.deps; i; i = i.nextDep)
        vp(i);
    }
    const t = n.dep.subs;
    t !== n && (n.prevSub = t, t && (t.nextSub = n)), n.dep.subs = n;
  }
}
const fu = /* @__PURE__ */ new WeakMap(), bs = /* @__PURE__ */ Symbol(
  ""
), du = /* @__PURE__ */ Symbol(
  ""
), jo = /* @__PURE__ */ Symbol(
  ""
);
function Yt(n, e, t) {
  if (Vn && xt) {
    let i = fu.get(n);
    i || fu.set(n, i = /* @__PURE__ */ new Map());
    let s = i.get(t);
    s || (i.set(t, s = new ql()), s.map = i, s.key = t), s.track();
  }
}
function vi(n, e, t, i, s, o) {
  const r = fu.get(n);
  if (!r) {
    Uo++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (mc(), e === "clear")
    r.forEach(l);
  else {
    const a = Ve(n), u = a && pc(t);
    if (a && t === "length") {
      const c = Number(i);
      r.forEach((h, f) => {
        (f === "length" || f === jo || !Hn(f) && f >= c) && l(h);
      });
    } else
      switch ((t !== void 0 || r.has(void 0)) && l(r.get(t)), u && l(r.get(jo)), e) {
        case "add":
          a ? u && l(r.get("length")) : (l(r.get(bs)), Ki(n) && l(r.get(du)));
          break;
        case "delete":
          a || (l(r.get(bs)), Ki(n) && l(r.get(du)));
          break;
        case "set":
          Ki(n) && l(r.get(bs));
          break;
      }
  }
  vc();
}
function Es(n) {
  const e = /* @__PURE__ */ at(n);
  return e === n || (Yt(e, "iterate", jo), /* @__PURE__ */ Mn(n)) ? e : /* @__PURE__ */ ui(n) ? /* @__PURE__ */ Ui(n) ? e.map((t) => qi(Tn(t))) : e.map(qi) : e.map(Tn);
}
function Yl(n) {
  return Yt(n = /* @__PURE__ */ at(n), "iterate", jo), n;
}
function ni(n, e) {
  return /* @__PURE__ */ ui(n) ? qi(/* @__PURE__ */ Ui(n) ? Tn(e) : e) : Tn(e);
}
const m0 = {
  __proto__: null,
  [Symbol.iterator]() {
    return La(this, Symbol.iterator, (n) => ni(this, n));
  },
  concat(...n) {
    return Es(this).concat(
      ...n.map((e) => Ve(e) ? Es(e) : e)
    );
  },
  entries() {
    return La(this, "entries", (n) => (n[1] = ni(this, n[1]), n));
  },
  every(n, e) {
    return pi(this, "every", n, e, void 0, arguments);
  },
  filter(n, e) {
    return pi(
      this,
      "filter",
      n,
      e,
      (t) => t.map((i) => ni(this, i)),
      arguments
    );
  },
  find(n, e) {
    return pi(
      this,
      "find",
      n,
      e,
      (t) => ni(this, t),
      arguments
    );
  },
  findIndex(n, e) {
    return pi(this, "findIndex", n, e, void 0, arguments);
  },
  findLast(n, e) {
    return pi(
      this,
      "findLast",
      n,
      e,
      (t) => ni(this, t),
      arguments
    );
  },
  findLastIndex(n, e) {
    return pi(this, "findLastIndex", n, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(n, e) {
    return pi(this, "forEach", n, e, void 0, arguments);
  },
  includes(...n) {
    return Ea(this, "includes", n);
  },
  indexOf(...n) {
    return Ea(this, "indexOf", n);
  },
  join(n) {
    return Es(this).join(n);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...n) {
    return Ea(this, "lastIndexOf", n);
  },
  map(n, e) {
    return pi(this, "map", n, e, void 0, arguments);
  },
  pop() {
    return mo(this, "pop");
  },
  push(...n) {
    return mo(this, "push", n);
  },
  reduce(n, ...e) {
    return Lh(this, "reduce", n, e);
  },
  reduceRight(n, ...e) {
    return Lh(this, "reduceRight", n, e);
  },
  shift() {
    return mo(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(n, e) {
    return pi(this, "some", n, e, void 0, arguments);
  },
  splice(...n) {
    return mo(this, "splice", n);
  },
  toReversed() {
    return Es(this).toReversed();
  },
  toSorted(n) {
    return Es(this).toSorted(n);
  },
  toSpliced(...n) {
    return Es(this).toSpliced(...n);
  },
  unshift(...n) {
    return mo(this, "unshift", n);
  },
  values() {
    return La(this, "values", (n) => ni(this, n));
  }
};
function La(n, e, t) {
  const i = Yl(n), s = i[e]();
  return i !== n && !/* @__PURE__ */ Mn(n) && (s._next = s.next, s.next = () => {
    const o = s._next();
    return o.done || (o.value = t(o.value)), o;
  }), s;
}
const v0 = Array.prototype;
function pi(n, e, t, i, s, o) {
  const r = Yl(n), l = r !== n && !/* @__PURE__ */ Mn(n), a = r[e];
  if (a !== v0[e]) {
    const h = a.apply(n, o);
    return l ? Tn(h) : h;
  }
  let u = t;
  r !== n && (l ? u = function(h, f) {
    return t.call(this, ni(n, h), f, n);
  } : t.length > 2 && (u = function(h, f) {
    return t.call(this, h, f, n);
  }));
  const c = a.call(r, u, i);
  return l && s ? s(c) : c;
}
function Lh(n, e, t, i) {
  const s = Yl(n), o = s !== n && !/* @__PURE__ */ Mn(n);
  let r = t, l = !1;
  s !== n && (o ? (l = i.length === 0, r = function(u, c, h) {
    return l && (l = !1, u = ni(n, u)), t.call(this, u, ni(n, c), h, n);
  }) : t.length > 3 && (r = function(u, c, h) {
    return t.call(this, u, c, h, n);
  }));
  const a = s[e](r, ...i);
  return l ? ni(n, a) : a;
}
function Ea(n, e, t) {
  const i = /* @__PURE__ */ at(n);
  Yt(i, "iterate", jo);
  const s = i[e](...t);
  return (s === -1 || s === !1) && /* @__PURE__ */ wc(t[0]) ? (t[0] = /* @__PURE__ */ at(t[0]), i[e](...t)) : s;
}
function mo(n, e, t = []) {
  ji(), mc();
  const i = (/* @__PURE__ */ at(n))[e].apply(n, t);
  return vc(), Gi(), i;
}
const y0 = /* @__PURE__ */ dc("__proto__,__v_isRef,__isVue"), yp = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((n) => n !== "arguments" && n !== "caller").map((n) => Symbol[n]).filter(Hn)
);
function b0(n) {
  Hn(n) || (n = String(n));
  const e = /* @__PURE__ */ at(this);
  return Yt(e, "has", n), e.hasOwnProperty(n);
}
class bp {
  constructor(e = !1, t = !1) {
    this._isReadonly = e, this._isShallow = t;
  }
  get(e, t, i) {
    if (t === "__v_skip") return e.__v_skip;
    const s = this._isReadonly, o = this._isShallow;
    if (t === "__v_isReactive")
      return !s;
    if (t === "__v_isReadonly")
      return s;
    if (t === "__v_isShallow")
      return o;
    if (t === "__v_raw")
      return i === (s ? o ? D0 : Sp : o ? kp : wp).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(i) ? e : void 0;
    const r = Ve(e);
    if (!s) {
      let a;
      if (r && (a = m0[t]))
        return a;
      if (t === "hasOwnProperty")
        return b0;
    }
    const l = Reflect.get(
      e,
      t,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ on(e) ? e : i
    );
    if ((Hn(t) ? yp.has(t) : y0(t)) || (s || Yt(e, "get", t), o))
      return l;
    if (/* @__PURE__ */ on(l)) {
      const a = r && pc(t) ? l : l.value;
      return s && Tt(a) ? /* @__PURE__ */ gu(a) : a;
    }
    return Tt(l) ? s ? /* @__PURE__ */ gu(l) : /* @__PURE__ */ ms(l) : l;
  }
}
class xp extends bp {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, t, i, s) {
    let o = e[t];
    const r = Ve(e) && pc(t);
    if (!this._isShallow) {
      const u = /* @__PURE__ */ ui(o);
      if (!/* @__PURE__ */ Mn(i) && !/* @__PURE__ */ ui(i) && (o = /* @__PURE__ */ at(o), i = /* @__PURE__ */ at(i)), !r && /* @__PURE__ */ on(o) && !/* @__PURE__ */ on(i))
        return u || (o.value = i), !0;
    }
    const l = r ? Number(t) < e.length : gt(e, t), a = Reflect.set(
      e,
      t,
      i,
      /* @__PURE__ */ on(e) ? e : s
    );
    return e === /* @__PURE__ */ at(s) && a && (l ? Kt(i, o) && vi(e, "set", t, i) : vi(e, "add", t, i)), a;
  }
  deleteProperty(e, t) {
    const i = gt(e, t);
    e[t];
    const s = Reflect.deleteProperty(e, t);
    return s && i && vi(e, "delete", t, void 0), s;
  }
  has(e, t) {
    const i = Reflect.has(e, t);
    return (!Hn(t) || !yp.has(t)) && Yt(e, "has", t), i;
  }
  ownKeys(e) {
    return Yt(
      e,
      "iterate",
      Ve(e) ? "length" : bs
    ), Reflect.ownKeys(e);
  }
}
class x0 extends bp {
  constructor(e = !1) {
    super(!0, e);
  }
  set(e, t) {
    return !0;
  }
  deleteProperty(e, t) {
    return !0;
  }
}
const w0 = /* @__PURE__ */ new xp(), k0 = /* @__PURE__ */ new x0(), S0 = /* @__PURE__ */ new xp(!0);
const pu = (n) => n, Mr = (n) => Reflect.getPrototypeOf(n);
function C0(n, e, t) {
  return function(...i) {
    const s = this.__v_raw, o = /* @__PURE__ */ at(s), r = Ki(o), l = n === "entries" || n === Symbol.iterator && r, a = n === "keys" && r, u = s[n](...i), c = t ? pu : e ? qi : Tn;
    return !e && Yt(
      o,
      "iterate",
      a ? du : bs
    ), Dn(
      // inheriting all iterator properties
      Object.create(u),
      {
        // iterator protocol
        next() {
          const { value: h, done: f } = u.next();
          return f ? { value: h, done: f } : {
            value: l ? [c(h[0]), c(h[1])] : c(h),
            done: f
          };
        }
      }
    );
  };
}
function Ar(n) {
  return function(...e) {
    return n === "delete" ? !1 : n === "clear" ? void 0 : this;
  };
}
function M0(n, e) {
  const t = {
    get(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ at(o), l = /* @__PURE__ */ at(s);
      n || (Kt(s, l) && Yt(r, "get", s), Yt(r, "get", l));
      const { has: a } = Mr(r), u = e ? pu : n ? qi : Tn;
      if (a.call(r, s))
        return u(o.get(s));
      if (a.call(r, l))
        return u(o.get(l));
      o !== r && o.get(s);
    },
    get size() {
      const s = this.__v_raw;
      return !n && Yt(/* @__PURE__ */ at(s), "iterate", bs), s.size;
    },
    has(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ at(o), l = /* @__PURE__ */ at(s);
      return n || (Kt(s, l) && Yt(r, "has", s), Yt(r, "has", l)), s === l ? o.has(s) : o.has(s) || o.has(l);
    },
    forEach(s, o) {
      const r = this, l = r.__v_raw, a = /* @__PURE__ */ at(l), u = e ? pu : n ? qi : Tn;
      return !n && Yt(a, "iterate", bs), l.forEach((c, h) => s.call(o, u(c), u(h), r));
    }
  };
  return Dn(
    t,
    n ? {
      add: Ar("add"),
      set: Ar("set"),
      delete: Ar("delete"),
      clear: Ar("clear")
    } : {
      add(s) {
        const o = /* @__PURE__ */ at(this), r = Mr(o), l = /* @__PURE__ */ at(s), a = !e && !/* @__PURE__ */ Mn(s) && !/* @__PURE__ */ ui(s) ? l : s;
        return r.has.call(o, a) || Kt(s, a) && r.has.call(o, s) || Kt(l, a) && r.has.call(o, l) || (o.add(a), vi(o, "add", a, a)), this;
      },
      set(s, o) {
        !e && !/* @__PURE__ */ Mn(o) && !/* @__PURE__ */ ui(o) && (o = /* @__PURE__ */ at(o));
        const r = /* @__PURE__ */ at(this), { has: l, get: a } = Mr(r);
        let u = l.call(r, s);
        u || (s = /* @__PURE__ */ at(s), u = l.call(r, s));
        const c = a.call(r, s);
        return r.set(s, o), u ? Kt(o, c) && vi(r, "set", s, o) : vi(r, "add", s, o), this;
      },
      delete(s) {
        const o = /* @__PURE__ */ at(this), { has: r, get: l } = Mr(o);
        let a = r.call(o, s);
        a || (s = /* @__PURE__ */ at(s), a = r.call(o, s)), l && l.call(o, s);
        const u = o.delete(s);
        return a && vi(o, "delete", s, void 0), u;
      },
      clear() {
        const s = /* @__PURE__ */ at(this), o = s.size !== 0, r = s.clear();
        return o && vi(
          s,
          "clear",
          void 0,
          void 0
        ), r;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((s) => {
    t[s] = C0(s, n, e);
  }), t;
}
function bc(n, e) {
  const t = M0(n, e);
  return (i, s, o) => s === "__v_isReactive" ? !n : s === "__v_isReadonly" ? n : s === "__v_raw" ? i : Reflect.get(
    gt(t, s) && s in i ? t : i,
    s,
    o
  );
}
const A0 = {
  get: /* @__PURE__ */ bc(!1, !1)
}, T0 = {
  get: /* @__PURE__ */ bc(!1, !0)
}, $0 = {
  get: /* @__PURE__ */ bc(!0, !1)
};
const wp = /* @__PURE__ */ new WeakMap(), kp = /* @__PURE__ */ new WeakMap(), Sp = /* @__PURE__ */ new WeakMap(), D0 = /* @__PURE__ */ new WeakMap();
function O0(n) {
  switch (n) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function ms(n) {
  return /* @__PURE__ */ ui(n) ? n : xc(
    n,
    !1,
    w0,
    A0,
    wp
  );
}
// @__NO_SIDE_EFFECTS__
function L0(n) {
  return xc(
    n,
    !1,
    S0,
    T0,
    kp
  );
}
// @__NO_SIDE_EFFECTS__
function gu(n) {
  return xc(
    n,
    !0,
    k0,
    $0,
    Sp
  );
}
function xc(n, e, t, i, s) {
  if (!Tt(n) || n.__v_raw && !(e && n.__v_isReactive) || n.__v_skip || !Object.isExtensible(n))
    return n;
  const o = s.get(n);
  if (o)
    return o;
  const r = O0(t0(n));
  if (r === 0)
    return n;
  const l = new Proxy(
    n,
    r === 2 ? i : t
  );
  return s.set(n, l), l;
}
// @__NO_SIDE_EFFECTS__
function Ui(n) {
  return /* @__PURE__ */ ui(n) ? /* @__PURE__ */ Ui(n.__v_raw) : !!(n && n.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function ui(n) {
  return !!(n && n.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Mn(n) {
  return !!(n && n.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function wc(n) {
  return n ? !!n.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function at(n) {
  const e = n && n.__v_raw;
  return e ? /* @__PURE__ */ at(e) : n;
}
function E0(n) {
  return !gt(n, "__v_skip") && Object.isExtensible(n) && rp(n, "__v_skip", !0), n;
}
const Tn = (n) => Tt(n) ? /* @__PURE__ */ ms(n) : n, qi = (n) => Tt(n) ? /* @__PURE__ */ gu(n) : n;
// @__NO_SIDE_EFFECTS__
function on(n) {
  return n ? n.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function G(n) {
  return Cp(n, !1);
}
// @__NO_SIDE_EFFECTS__
function Fs(n) {
  return Cp(n, !0);
}
function Cp(n, e) {
  return /* @__PURE__ */ on(n) ? n : new B0(n, e);
}
class B0 {
  constructor(e, t) {
    this.dep = new ql(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ at(e), this._value = t ? e : Tn(e), this.__v_isShallow = t;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const t = this._rawValue, i = this.__v_isShallow || /* @__PURE__ */ Mn(e) || /* @__PURE__ */ ui(e);
    e = i ? e : /* @__PURE__ */ at(e), Kt(e, t) && (this._rawValue = e, this._value = i ? e : Tn(e), this.dep.trigger());
  }
}
function V(n) {
  return /* @__PURE__ */ on(n) ? n.value : n;
}
const I0 = {
  get: (n, e, t) => e === "__v_raw" ? n : V(Reflect.get(n, e, t)),
  set: (n, e, t, i) => {
    const s = n[e];
    return /* @__PURE__ */ on(s) && !/* @__PURE__ */ on(t) ? (s.value = t, !0) : Reflect.set(n, e, t, i);
  }
};
function Mp(n) {
  return /* @__PURE__ */ Ui(n) ? n : new Proxy(n, I0);
}
class R0 {
  constructor(e) {
    this.__v_isRef = !0, this._value = void 0;
    const t = this.dep = new ql(), { get: i, set: s } = e(t.track.bind(t), t.trigger.bind(t));
    this._get = i, this._set = s;
  }
  get value() {
    return this._value = this._get();
  }
  set value(e) {
    this._set(e);
  }
}
function P0(n) {
  return new R0(n);
}
class _0 {
  constructor(e, t, i) {
    this.fn = e, this.setter = t, this._value = void 0, this.dep = new ql(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Uo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = i;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    xt !== this)
      return fp(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return gp(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
// @__NO_SIDE_EFFECTS__
function N0(n, e, t = !1) {
  let i, s;
  return dt(n) ? i = n : (i = n.get, s = n.set), new _0(i, s, t);
}
const Tr = {}, vl = /* @__PURE__ */ new WeakMap();
let cs;
function V0(n, e = !1, t = cs) {
  if (t) {
    let i = vl.get(t);
    i || vl.set(t, i = []), i.push(n);
  }
}
function H0(n, e, t = ut) {
  const { immediate: i, deep: s, once: o, scheduler: r, augmentJob: l, call: a } = t, u = (E) => s ? E : /* @__PURE__ */ Mn(E) || s === !1 || s === 0 ? yi(E, 1) : yi(E);
  let c, h, f, d, g = !1, v = !1;
  if (/* @__PURE__ */ on(n) ? (h = () => n.value, g = /* @__PURE__ */ Mn(n)) : /* @__PURE__ */ Ui(n) ? (h = () => u(n), g = !0) : Ve(n) ? (v = !0, g = n.some((E) => /* @__PURE__ */ Ui(E) || /* @__PURE__ */ Mn(E)), h = () => n.map((E) => {
    if (/* @__PURE__ */ on(E))
      return E.value;
    if (/* @__PURE__ */ Ui(E))
      return u(E);
    if (dt(E))
      return a ? a(E, 2) : E();
  })) : dt(n) ? e ? h = a ? () => a(n, 2) : n : h = () => {
    if (f) {
      ji();
      try {
        f();
      } finally {
        Gi();
      }
    }
    const E = cs;
    cs = c;
    try {
      return a ? a(n, 3, [d]) : n(d);
    } finally {
      cs = E;
    }
  } : h = ys, e && s) {
    const E = h, B = s === !0 ? 1 / 0 : s;
    h = () => yi(E(), B);
  }
  const m = d0(), b = () => {
    c.stop(), m && m.active && tp(m.effects, c);
  };
  if (o && e) {
    const E = e;
    e = (...B) => {
      const z = E(...B);
      return b(), z;
    };
  }
  let O = v ? new Array(n.length).fill(Tr) : Tr;
  const L = (E) => {
    if (!(!(c.flags & 1) || !c.dirty && !E))
      if (e) {
        const B = c.run();
        if (E || s || g || (v ? B.some((z, P) => Kt(z, O[P])) : Kt(B, O))) {
          f && f();
          const z = cs;
          cs = c;
          try {
            const P = [
              B,
              // pass undefined as the old value when it's changed for the first time
              O === Tr ? void 0 : v && O[0] === Tr ? [] : O,
              d
            ];
            O = B, a ? a(e, 3, P) : (
              // @ts-expect-error
              e(...P)
            );
          } finally {
            cs = z;
          }
        }
      } else
        c.run();
  };
  return l && l(L), c = new cp(h), c.scheduler = r ? () => r(L, !1) : L, d = (E) => V0(E, !1, c), f = c.onStop = () => {
    const E = vl.get(c);
    if (E) {
      if (a)
        a(E, 4);
      else
        for (const B of E) B();
      vl.delete(c);
    }
  }, e ? i ? L(!0) : O = c.run() : r ? r(L.bind(null, !0), !0) : c.run(), b.pause = c.pause.bind(c), b.resume = c.resume.bind(c), b.stop = b, b;
}
function yi(n, e = 1 / 0, t) {
  if (e <= 0 || !Tt(n) || n.__v_skip || (t = t || /* @__PURE__ */ new Map(), (t.get(n) || 0) >= e))
    return n;
  if (t.set(n, e), e--, /* @__PURE__ */ on(n))
    yi(n.value, e, t);
  else if (Ve(n))
    for (let i = 0; i < n.length; i++)
      yi(n[i], e, t);
  else if (Ai(n) || Ki(n))
    n.forEach((i) => {
      yi(i, e, t);
    });
  else if (sp(n)) {
    for (const i in n)
      yi(n[i], e, t);
    for (const i of Object.getOwnPropertySymbols(n))
      Object.prototype.propertyIsEnumerable.call(n, i) && yi(n[i], e, t);
  }
  return n;
}
function fr(n, e, t, i) {
  try {
    return i ? n(...i) : n();
  } catch (s) {
    Xl(s, e, t);
  }
}
function ci(n, e, t, i) {
  if (dt(n)) {
    const s = fr(n, e, t, i);
    return s && np(s) && s.catch((o) => {
      Xl(o, e, t);
    }), s;
  }
  if (Ve(n)) {
    const s = [];
    for (let o = 0; o < n.length; o++)
      s.push(ci(n[o], e, t, i));
    return s;
  }
}
function Xl(n, e, t, i = !0) {
  const s = e ? e.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: r } = e && e.appContext.config || ut;
  if (e) {
    let l = e.parent;
    const a = e.proxy, u = `https://vuejs.org/error-reference/#runtime-${t}`;
    for (; l; ) {
      const c = l.ec;
      if (c) {
        for (let h = 0; h < c.length; h++)
          if (c[h](n, a, u) === !1)
            return;
      }
      l = l.parent;
    }
    if (o) {
      ji(), fr(o, null, 10, [
        n,
        a,
        u
      ]), Gi();
      return;
    }
  }
  F0(n, t, s, i, r);
}
function F0(n, e, t, i = !0, s = !1) {
  if (s)
    throw n;
  console.error(n);
}
const sn = [];
let ei = -1;
const zs = [];
let Ii = null, Is = 0;
const Ap = /* @__PURE__ */ Promise.resolve();
let yl = null;
function Bn(n) {
  const e = yl || Ap;
  return n ? e.then(this ? n.bind(this) : n) : e;
}
function z0(n) {
  let e = ei + 1, t = sn.length;
  for (; e < t; ) {
    const i = e + t >>> 1, s = sn[i], o = Go(s);
    o < n || o === n && s.flags & 2 ? e = i + 1 : t = i;
  }
  return e;
}
function kc(n) {
  if (!(n.flags & 1)) {
    const e = Go(n), t = sn[sn.length - 1];
    !t || // fast path when the job id is larger than the tail
    !(n.flags & 2) && e >= Go(t) ? sn.push(n) : sn.splice(z0(e), 0, n), n.flags |= 1, Tp();
  }
}
function Tp() {
  yl || (yl = Ap.then(Dp));
}
function W0(n) {
  if (!Ve(n))
    Ii && n.id === -1 ? Ii.splice(Is + 1, 0, n) : n.flags & 1 || (zs.push(n), n.flags |= 1);
  else
    for (let e = 0; e < n.length; e++)
      zs.push(n[e]);
  Tp();
}
function Eh(n, e, t = ei + 1) {
  for (; t < sn.length; t++) {
    const i = sn[t];
    if (i && i.flags & 2) {
      if (n && i.id !== n.uid)
        continue;
      sn.splice(t, 1), t--, i.flags & 4 && (i.flags &= -2), i(), i.flags & 4 || (i.flags &= -2);
    }
  }
}
function $p(n) {
  if (zs.length) {
    const e = [...new Set(zs)].sort(
      (t, i) => Go(t) - Go(i)
    );
    if (zs.length = 0, Ii) {
      for (let t = 0; t < e.length; t++)
        Ii.push(e[t]);
      return;
    }
    for (Ii = e, Is = 0; Is < Ii.length; Is++) {
      const t = Ii[Is];
      t.flags & 4 && (t.flags &= -2), t.flags & 8 || t(), t.flags &= -2;
    }
    Ii = null, Is = 0;
  }
}
const Go = (n) => n.id == null ? n.flags & 2 ? -1 : 1 / 0 : n.id;
function Dp(n) {
  try {
    for (ei = 0; ei < sn.length; ei++) {
      const e = sn[ei];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), fr(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; ei < sn.length; ei++) {
      const e = sn[ei];
      e && (e.flags &= -2);
    }
    ei = -1, sn.length = 0, $p(), yl = null, (sn.length || zs.length) && Dp();
  }
}
let Xt = null, Op = null;
function bl(n) {
  const e = Xt;
  return Xt = n, Op = n && n.type.__scopeId || null, e;
}
function Lp(n, e = Xt, t) {
  if (!e || n._n)
    return n;
  const i = (...s) => {
    i._d && Hh(-1);
    const o = bl(e), r = Si.length;
    let l;
    try {
      l = n(...s);
    } finally {
      for (let a = Si.length; a > r; a--) Ac();
      bl(o), i._d && Hh(1);
    }
    return l;
  };
  return i._n = !0, i._c = !0, i._d = !0, i;
}
function ze(n, e) {
  if (Xt === null)
    return n;
  const t = ea(Xt), i = n.dirs || (n.dirs = []);
  for (let s = 0; s < e.length; s++) {
    let [o, r, l, a = ut] = e[s];
    o && (dt(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && yi(r), i.push({
      dir: o,
      instance: t,
      value: r,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return n;
}
function ls(n, e, t, i) {
  const s = n.dirs, o = e && e.dirs;
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    o && (l.oldValue = o[r].value);
    let a = l.dir[i];
    a && (ji(), ci(a, t, 8, [
      n.el,
      l,
      n,
      e
    ]), Gi());
  }
}
function K0(n, e, t = !1) {
  const i = Qp();
  if (i || Ks) {
    let s = Ks ? Ks._context.provides : i ? i.parent == null || i.ce ? i.vnode.appContext && i.vnode.appContext.provides : i.parent.provides : void 0;
    if (s && n in s)
      return s[n];
    if (arguments.length > 1)
      return t && dt(e) ? e.call(i && i.proxy) : e;
  }
}
const U0 = /* @__PURE__ */ Symbol.for("v-scx"), j0 = () => K0(U0);
function G0(n, e) {
  return Ep(
    n,
    null,
    { flush: "sync" }
  );
}
function Ge(n, e, t) {
  return Ep(n, e, t);
}
function Ep(n, e, t = ut) {
  const { immediate: i, deep: s, flush: o, once: r } = t, l = Dn({}, t), a = e && i || !e && o !== "post";
  let u;
  if (Xo) {
    if (o === "sync") {
      const d = j0();
      u = d.__watcherHandles || (d.__watcherHandles = []);
    } else if (!a) {
      const d = () => {
      };
      return d.stop = ys, d.resume = ys, d.pause = ys, d;
    }
  }
  const c = Yi;
  l.call = (d, g, v) => ci(d, c, g, v);
  let h = !1;
  o === "post" ? l.scheduler = (d) => {
    an(d, c && c.suspense);
  } : o !== "sync" && (h = !0, l.scheduler = (d, g) => {
    g ? d() : kc(d);
  }), l.augmentJob = (d) => {
    e && (d.flags |= 4), h && (d.flags |= 2, c && (d.id = c.uid, d.i = c));
  };
  const f = H0(n, e, l);
  return Xo && (u ? u.push(f) : a && f()), f;
}
const q0 = /* @__PURE__ */ Symbol("_vte"), Jl = (n) => n.__isTeleport, Ba = /* @__PURE__ */ Symbol("_leaveCb");
function Y0(n) {
  let e = n[0];
  if (n.length > 1) {
    for (const t of n)
      if (t.type !== hi) {
        e = t;
        break;
      }
  }
  return e;
}
function Bp(n) {
  if (!Ip(n))
    return Jl(n.type) && n.children ? Y0(n.children) : n;
  if (n.component)
    return n.component.subTree;
  const { shapeFlag: e, children: t } = n;
  if (t) {
    if (e & 16)
      return t[0];
    if (e & 32 && dt(t.default))
      return t.default();
  }
}
function Sc(n, e) {
  if (n.shapeFlag & 6 && n.component) {
    n.transition = e;
    const t = n.component.subTree;
    Sc(
      Jl(t.type) && Bp(t) || t,
      e
    );
  } else n.shapeFlag & 128 ? (n.ssContent.transition = e.clone(n.ssContent), n.ssFallback.transition = e.clone(n.ssFallback)) : n.transition = e;
}
// @__NO_SIDE_EFFECTS__
function Qt(n, e) {
  return dt(n) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Dn({ name: n.name }, e, { setup: n })
  ) : n;
}
function X0(n) {
  n.ids = [n.ids[0] + n.ids[2]++ + "-", 0, 0];
}
function Bh(n, e) {
  let t;
  return !!((t = Object.getOwnPropertyDescriptor(n, e)) && !t.configurable);
}
const xl = /* @__PURE__ */ new WeakMap();
function Ro(n, e, t, i, s = !1) {
  if (Ve(n)) {
    n.forEach(
      (v, m) => Ro(
        v,
        e && (Ve(e) ? e[m] : e),
        t,
        i,
        s
      )
    );
    return;
  }
  if (Ws(i) && !s) {
    i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && Ro(n, e, t, i.component.subTree);
    return;
  }
  const o = i.shapeFlag & 4 ? ea(i.component) : i.el, r = s ? null : o, { i: l, r: a } = n, u = e && e.r, c = l.refs === ut ? l.refs = {} : l.refs, h = l.setupState, f = /* @__PURE__ */ at(h), d = h === ut ? ep : (v) => Bh(c, v) ? !1 : gt(f, v), g = (v, m) => !(m && Bh(c, m));
  if (u != null && u !== a) {
    if (Ih(e), Rt(u))
      c[u] = null, d(u) && (h[u] = null);
    else if (/* @__PURE__ */ on(u)) {
      const v = e;
      g(u, v.k) && (u.value = null), v.k && (c[v.k] = null);
    }
  }
  if (dt(a))
    fr(a, l, 12, [r, c]);
  else {
    const v = Rt(a), m = /* @__PURE__ */ on(a);
    if (v || m) {
      const b = () => {
        if (n.f) {
          const O = v ? d(a) ? h[a] : c[a] : g() || !n.k ? a.value : c[n.k];
          if (s)
            Ve(O) && tp(O, o);
          else if (Ve(O))
            O.includes(o) || O.push(o);
          else if (v)
            c[a] = [o], d(a) && (h[a] = c[a]);
          else {
            const L = [o];
            g(a, n.k) && (a.value = L), n.k && (c[n.k] = L);
          }
        } else v ? (c[a] = r, d(a) && (h[a] = r)) : m && (g(a, n.k) && (a.value = r), n.k && (c[n.k] = r));
      };
      if (r) {
        const O = () => {
          b(), xl.delete(n);
        };
        O.id = -1, xl.set(n, O), an(O, t);
      } else
        Ih(n), b();
    }
  }
}
function Ih(n) {
  const e = xl.get(n);
  e && (e.flags |= 8, xl.delete(n));
}
Gl().requestIdleCallback;
Gl().cancelIdleCallback;
const Ws = (n) => !!n.type.__asyncLoader, Ip = (n) => n.type.__isKeepAlive;
function J0(n, e, t = Yi, i = !1) {
  if (t) {
    const s = t[n] || (t[n] = []), o = e.__weh || (e.__weh = (...r) => {
      ji();
      const l = $c(t), a = ci(e, t, n, r);
      return l(), Gi(), a;
    });
    return i ? s.unshift(o) : s.push(o), o;
  }
}
const Rp = (n) => (e, t = Yi) => {
  (!Xo || n === "sp") && J0(n, (...i) => e(...i), t);
}, dr = Rp("m"), $i = Rp(
  "bum"
), Z0 = /* @__PURE__ */ Symbol.for("v-ndc");
function Be(n, e, t, i) {
  let s;
  const o = t, r = Ve(n);
  if (r || Rt(n)) {
    const l = r && /* @__PURE__ */ Ui(n);
    let a = !1, u = !1;
    l && (a = !/* @__PURE__ */ Mn(n), u = /* @__PURE__ */ ui(n), n = Yl(n)), s = new Array(n.length);
    for (let c = 0, h = n.length; c < h; c++)
      s[c] = e(
        a ? u ? qi(Tn(n[c])) : Tn(n[c]) : n[c],
        c,
        void 0,
        o
      );
  } else if (typeof n == "number") {
    s = new Array(n);
    for (let l = 0; l < n; l++)
      s[l] = e(l + 1, l, void 0, o);
  } else if (Tt(n))
    if (n[Symbol.iterator])
      s = Array.from(
        n,
        (l, a) => e(l, a, void 0, o)
      );
    else {
      const l = Object.keys(n);
      s = new Array(l.length);
      for (let a = 0, u = l.length; a < u; a++) {
        const c = l[a];
        s[a] = e(n[c], c, a, o);
      }
    }
  else
    s = [];
  return s;
}
function Q0(n, e, t, i, s, o) {
  if (t == null && (t = {}), Xt.ce || Xt.parent && Ws(Xt.parent) && Xt.parent.ce) {
    const u = t, c = Object.keys(u).length > 0;
    return u.name = e, w(), xn(
      me,
      null,
      [Vt("slot", u, i)],
      c ? -2 : 64
    );
  }
  let r = n[e];
  r && r._c && (r._d = !1);
  const l = Si.length;
  w();
  let a;
  try {
    const u = r && Pp(r(t)), c = t.key || o || // slot content array of a dynamic conditional slot may have a branch
    // key attached in the `createSlots` helper, respect that
    u && u.key;
    a = xn(
      me,
      {
        key: (c && !Hn(c) ? c : `_${e}`) + // #7256 force differentiate fallback content from actual content
        (!u && i ? "_fb" : "")
      },
      u || (i ? i() : []),
      u && n._ === 1 ? 64 : -2
    );
  } catch (u) {
    for (let c = Si.length; c > l; c--) Ac();
    throw u;
  } finally {
    r && r._c && (r._d = !0);
  }
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), a;
}
function Pp(n) {
  return n.some((e) => Tc(e) ? !(e.type === hi || e.type === me && !Pp(e.children)) : !0) ? n : null;
}
const mu = (n) => n ? eg(n) ? ea(n) : mu(n.parent) : null, Po = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Dn(/* @__PURE__ */ Object.create(null), {
    $: (n) => n,
    $el: (n) => n.vnode.el,
    $data: (n) => n.data,
    $props: (n) => n.props,
    $attrs: (n) => n.attrs,
    $slots: (n) => n.slots,
    $refs: (n) => n.refs,
    $parent: (n) => mu(n.parent),
    $root: (n) => mu(n.root),
    $host: (n) => n.ce,
    $emit: (n) => n.emit,
    $options: (n) => n.type,
    $forceUpdate: (n) => n.f || (n.f = () => {
      kc(n.update);
    }),
    $nextTick: (n) => n.n || (n.n = Bn.bind(n.proxy)),
    $watch: (n) => ys
  })
), Ia = (n, e) => n !== ut && !n.__isScriptSetup && gt(n, e), eb = {
  get({ _: n }, e) {
    if (e === "__v_skip")
      return !0;
    const { ctx: t, setupState: i, data: s, props: o, accessCache: r, type: l, appContext: a } = n;
    if (e[0] !== "$") {
      const f = r[e];
      if (f !== void 0)
        switch (f) {
          case 1:
            return i[e];
          case 2:
            return s[e];
          case 4:
            return t[e];
          case 3:
            return o[e];
        }
      else {
        if (Ia(i, e))
          return r[e] = 1, i[e];
        if (gt(o, e))
          return r[e] = 3, o[e];
        if (t !== ut && gt(t, e))
          return r[e] = 4, t[e];
        r[e] = 0;
      }
    }
    const u = Po[e];
    let c, h;
    if (u)
      return e === "$attrs" && Yt(n.attrs, "get", ""), u(n);
    if (
      // css module (injected by vue-loader)
      (c = l.__cssModules) && (c = c[e])
    )
      return c;
    if (t !== ut && gt(t, e))
      return r[e] = 4, t[e];
    if (
      // global properties
      h = a.config.globalProperties, gt(h, e)
    )
      return h[e];
  },
  set({ _: n }, e, t) {
    const { data: i, setupState: s, ctx: o } = n;
    return Ia(s, e) ? (s[e] = t, !0) : gt(n.props, e) || e[0] === "$" && e.slice(1) in n ? !1 : (o[e] = t, !0);
  },
  has({
    _: { data: n, setupState: e, accessCache: t, ctx: i, appContext: s, props: o, type: r }
  }, l) {
    let a;
    return !!(t[l] || Ia(e, l) || gt(o, l) || gt(i, l) || gt(Po, l) || gt(s.config.globalProperties, l) || (a = r.__cssModules) && a[l]);
  },
  defineProperty(n, e, t) {
    return t.get != null ? n._.accessCache[e] = 0 : gt(t, "value") && this.set(n, e, t.value, null), Reflect.defineProperty(n, e, t);
  }
};
function Rh(n) {
  return Ve(n) ? n.reduce(
    (e, t) => (e[t] = null, e),
    {}
  ) : n;
}
function $n(n, e) {
  return !n || !e ? n || e : Ve(n) && Ve(e) ? n.concat(e) : Dn({}, Rh(n), Rh(e));
}
function _p() {
  return {
    app: null,
    config: {
      isNativeTag: ep,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let tb = 0;
function nb(n, e) {
  return function(i, s = null) {
    dt(i) || (i = Dn({}, i)), s != null && !Tt(s) && (s = null);
    const o = _p(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const u = o.app = {
      _uid: tb++,
      _component: i,
      _props: s,
      _container: null,
      _context: o,
      _instance: null,
      version: Ob,
      get config() {
        return o.config;
      },
      set config(c) {
      },
      use(c, ...h) {
        return r.has(c) || (c && dt(c.install) ? (r.add(c), c.install(u, ...h)) : dt(c) && (r.add(c), c(u, ...h))), u;
      },
      mixin(c) {
        return u;
      },
      component(c, h) {
        return h ? (o.components[c] = h, u) : o.components[c];
      },
      directive(c, h) {
        return h ? (o.directives[c] = h, u) : o.directives[c];
      },
      mount(c, h, f) {
        if (!a) {
          const d = u._ceVNode || Vt(i, s);
          return d.appContext = o, f === !0 ? f = "svg" : f === !1 && (f = void 0), n(d, c, f), a = !0, u._container = c, c.__vue_app__ = u, ea(d.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (ci(
          l,
          u._instance,
          16
        ), n(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, h) {
        return o.provides[c] = h, u;
      },
      runWithContext(c) {
        const h = Ks;
        Ks = u;
        try {
          return c();
        } finally {
          Ks = h;
        }
      }
    };
    return u;
  };
}
let Ks = null;
function It(n, e, t = ut) {
  const i = Qp(), s = Cn(e), o = Oi(e), r = Np(n, s), l = P0((a, u) => {
    let c, h = ut, f;
    return G0(() => {
      const d = n[s];
      Kt(c, d) && (c = d, u());
    }), {
      get() {
        return a(), t.get ? t.get(c) : c;
      },
      set(d) {
        const g = t.set ? t.set(d) : d;
        if (!Kt(g, c) && !(h !== ut && Kt(d, h)))
          return;
        const v = i.vnode.props, m = !!(v && // check if parent has passed v-model
        (e in v || s in v || o in v) && (`onUpdate:${e}` in v || `onUpdate:${s}` in v || `onUpdate:${o}` in v));
        m || (c = d, u()), i.emit(`update:${e}`, g), Kt(d, h) && (Kt(d, g) && !Kt(g, f) || // #13524: browsers differ in when they flush microtasks between
        // event listeners. If a v-model listener emits an intermediate value
        // and a following listener restores the model to its previous prop
        // value before parent updates are flushed, the parent render can be
        // deduped as having no prop change. Force a local update so DOM state
        // such as an input's value is synchronized back to the current model.
        m && h !== ut && !Kt(g, c)) && u(), h = d, f = g;
      }
    };
  });
  return l[Symbol.iterator] = () => {
    let a = 0;
    return {
      next() {
        return a < 2 ? { value: a++ ? r || ut : l, done: !1 } : { done: !0 };
      }
    };
  }, l;
}
const Np = (n, e) => e === "modelValue" || e === "model-value" ? n.modelModifiers : n[`${e}Modifiers`] || n[`${Cn(e)}Modifiers`] || n[`${Oi(e)}Modifiers`];
function ib(n, e, ...t) {
  if (n.isUnmounted) return;
  const i = n.vnode.props || ut;
  let s = t;
  const o = e.startsWith("update:"), r = o && Np(i, e.slice(7));
  r && (r.trim && (s = t.map((c) => Rt(c) ? c.trim() : c)), r.number && (s = s.map(jl)));
  let l, a = i[l = $a(e)] || // also try camelCase event handler (#2249)
  i[l = $a(Cn(e))];
  !a && o && (a = i[l = $a(Oi(e))]), a && ci(
    a,
    n,
    6,
    s
  );
  const u = i[l + "Once"];
  if (u) {
    if (!n.emitted)
      n.emitted = {};
    else if (n.emitted[l])
      return;
    n.emitted[l] = !0, ci(
      u,
      n,
      6,
      s
    );
  }
}
function sb(n, e, t = !1) {
  const i = e.emitsCache, s = i.get(n);
  if (s !== void 0)
    return s;
  const o = n.emits;
  let r = {};
  return o ? (Ve(o) ? o.forEach((l) => r[l] = null) : Dn(r, o), Tt(n) && i.set(n, r), r) : (Tt(n) && i.set(n, null), null);
}
function Zl(n, e) {
  return !n || !Wl(e) ? !1 : (e = e.slice(2), e = e === "Once" ? e : e.replace(/Once$/, ""), gt(n, e[0].toLowerCase() + e.slice(1)) || gt(n, Oi(e)) || gt(n, e));
}
function Ph(n) {
  const {
    type: e,
    vnode: t,
    proxy: i,
    withProxy: s,
    propsOptions: [o],
    slots: r,
    attrs: l,
    emit: a,
    render: u,
    renderCache: c,
    props: h,
    data: f,
    setupState: d,
    ctx: g,
    inheritAttrs: v
  } = n, m = bl(n);
  let b, O;
  try {
    if (t.shapeFlag & 4) {
      const E = s || i, B = E;
      b = ii(
        u.call(
          B,
          E,
          c,
          h,
          d,
          f,
          g
        )
      ), O = l;
    } else {
      const E = e;
      b = ii(
        E.length > 1 ? E(
          h,
          { attrs: l, slots: r, emit: a }
        ) : E(
          h,
          null
        )
      ), O = e.props ? l : ob(l);
    }
  } catch (E) {
    Si.length = 0, Xl(E, n, 1), b = Vt(hi);
  }
  let L = b;
  if (O && v !== !1) {
    const E = Object.keys(O), { shapeFlag: B } = L;
    E.length && B & 7 && (o && E.some(Kl) && (O = rb(
      O,
      o
    )), L = Js(L, O, !1, !0));
  }
  if (t.dirs && (L = Js(L, null, !1, !0), L.dirs = L.dirs ? L.dirs.concat(t.dirs) : t.dirs), t.transition) {
    const E = Jl(L.type) && Bp(L) || L;
    Sc(E, t.transition);
  }
  return b = L, bl(m), b;
}
const ob = (n) => {
  let e;
  for (const t in n)
    (t === "class" || t === "style" || Wl(t)) && ((e || (e = {}))[t] = n[t]);
  return e;
}, rb = (n, e) => {
  const t = {};
  for (const i in n)
    (!Kl(i) || !(i.slice(9) in e)) && (t[i] = n[i]);
  return t;
};
function lb(n, e, t) {
  const { props: i, children: s, component: o } = n, { props: r, children: l, patchFlag: a } = e, u = o.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (t && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return i ? _h(i, r, u) : !!r;
    if (a & 8) {
      const c = e.dynamicProps;
      for (let h = 0; h < c.length; h++) {
        const f = c[h];
        if (Vp(r, i, f) && !Zl(u, f))
          return !0;
      }
    }
  } else
    return (s || l) && (!l || !l.$stable) ? !0 : i === r ? !1 : i ? r ? _h(i, r, u) : !0 : !!r;
  return !1;
}
function _h(n, e, t) {
  const i = Object.keys(e);
  if (i.length !== Object.keys(n).length)
    return !0;
  for (let s = 0; s < i.length; s++) {
    const o = i[s];
    if (Vp(e, n, o) && !Zl(t, o))
      return !0;
  }
  return !1;
}
function Vp(n, e, t) {
  const i = n[t], s = e[t];
  return t === "style" && Tt(i) && Tt(s) ? !Ti(i, s) : i !== s;
}
function ab({ vnode: n, parent: e, suspense: t }, i) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === n && (s.suspense.vnode.el = s.el = i, n = s), s === n)
      (n = e.vnode).el = i, e = e.parent;
    else
      break;
  }
  t && t.activeBranch === n && (t.vnode.el = i);
}
const Hp = {}, Fp = () => Object.create(Hp), zp = (n) => Object.getPrototypeOf(n) === Hp;
function ub(n, e, t, i = !1) {
  const s = {}, o = Fp();
  n.propsDefaults = /* @__PURE__ */ Object.create(null), Wp(n, e, s, o);
  for (const r in n.propsOptions[0])
    r in s || (s[r] = void 0);
  t ? n.props = i ? s : /* @__PURE__ */ L0(s) : n.type.props ? n.props = s : n.props = o, n.attrs = o;
}
function cb(n, e, t, i) {
  const {
    props: s,
    attrs: o,
    vnode: { patchFlag: r }
  } = n, l = /* @__PURE__ */ at(s), [a] = n.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (i || r > 0) && !(r & 16)
  ) {
    if (r & 8) {
      const c = n.vnode.dynamicProps;
      for (let h = 0; h < c.length; h++) {
        let f = c[h];
        if (Zl(n.emitsOptions, f))
          continue;
        const d = e[f];
        if (a)
          if (gt(o, f))
            d !== o[f] && (o[f] = d, u = !0);
          else {
            const g = Cn(f);
            s[g] = vu(
              a,
              l,
              g,
              d,
              n,
              !1
            );
          }
        else
          d !== o[f] && (o[f] = d, u = !0);
      }
    }
  } else {
    Wp(n, e, s, o) && (u = !0);
    let c;
    for (const h in l)
      (!e || // for camelCase
      !gt(e, h) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Oi(h)) === h || !gt(e, c))) && (a ? t && // for camelCase
      (t[h] !== void 0 || // for kebab-case
      t[c] !== void 0) && (s[h] = vu(
        a,
        l,
        h,
        void 0,
        n,
        !0
      )) : delete s[h]);
    if (o !== l)
      for (const h in o)
        (!e || !gt(e, h)) && (delete o[h], u = !0);
  }
  u && vi(n.attrs, "set", "");
}
function Wp(n, e, t, i) {
  const [s, o] = n.propsOptions;
  let r = !1, l;
  if (e)
    for (let a in e) {
      if (Eo(a))
        continue;
      const u = e[a];
      let c;
      s && gt(s, c = Cn(a)) ? !o || !o.includes(c) ? t[c] = u : (l || (l = {}))[c] = u : Zl(n.emitsOptions, a) || (!(a in i) || u !== i[a]) && (i[a] = u, r = !0);
    }
  if (o) {
    const a = /* @__PURE__ */ at(t), u = l || ut;
    for (let c = 0; c < o.length; c++) {
      const h = o[c];
      t[h] = vu(
        s,
        a,
        h,
        u[h],
        n,
        !gt(u, h)
      );
    }
  }
  return r;
}
function vu(n, e, t, i, s, o) {
  const r = n[t];
  if (r != null) {
    const l = gt(r, "default");
    if (l && i === void 0) {
      const a = r.default;
      if (r.type !== Function && !r.skipFactory && dt(a)) {
        const { propsDefaults: u } = s;
        if (t in u)
          i = u[t];
        else {
          const c = $c(s);
          i = u[t] = a.call(
            null,
            e
          ), c();
        }
      } else
        i = a;
      s.ce && s.ce._setProp(t, i);
    }
    r[
      0
      /* shouldCast */
    ] && (o && !l ? i = !1 : r[
      1
      /* shouldCastTrue */
    ] && (i === "" || i === Oi(t)) && (i = !0));
  }
  return i;
}
function hb(n, e, t = !1) {
  const i = e.propsCache, s = i.get(n);
  if (s)
    return s;
  const o = n.props, r = {}, l = [];
  if (!o)
    return Tt(n) && i.set(n, gs), gs;
  if (Ve(o))
    for (let u = 0; u < o.length; u++) {
      const c = Cn(o[u]);
      Nh(c) && (r[c] = ut);
    }
  else if (o)
    for (const u in o) {
      const c = Cn(u);
      if (Nh(c)) {
        const h = o[u], f = r[c] = Ve(h) || dt(h) ? { type: h } : Dn({}, h), d = f.type;
        let g = !1, v = !0;
        if (Ve(d))
          for (let m = 0; m < d.length; ++m) {
            const b = d[m], O = dt(b) && b.name;
            if (O === "Boolean") {
              g = !0;
              break;
            } else O === "String" && (v = !1);
          }
        else
          g = dt(d) && d.name === "Boolean";
        f[
          0
          /* shouldCast */
        ] = g, f[
          1
          /* shouldCastTrue */
        ] = v, (g || gt(f, "default")) && l.push(c);
      }
    }
  const a = [r, l];
  return Tt(n) && i.set(n, a), a;
}
function Nh(n) {
  return n[0] !== "$" && !Eo(n);
}
const Cc = (n) => n === "_" || n === "_ctx" || n === "$stable", Mc = (n) => Ve(n) ? n.map(ii) : [ii(n)], fb = (n, e, t) => {
  if (e._n)
    return e;
  const i = Lp((...s) => Mc(e(...s)), t);
  return i._c = !1, i;
}, Kp = (n, e, t) => {
  const i = n._ctx;
  for (const s in n) {
    if (Cc(s)) continue;
    const o = n[s];
    if (dt(o))
      e[s] = fb(s, o, i);
    else if (o != null) {
      const r = Mc(o);
      e[s] = () => r;
    }
  }
}, Up = (n, e) => {
  const t = Mc(e);
  n.slots.default = () => t;
}, jp = (n, e, t) => {
  for (const i in e)
    (t || !Cc(i)) && (n[i] = e[i]);
}, db = (n, e, t) => {
  const i = n.slots = Fp();
  if (n.vnode.shapeFlag & 32) {
    const s = e._;
    s ? (jp(i, e, t), t && rp(i, "_", s, !0)) : Kp(e, i);
  } else e && Up(n, e);
}, pb = (n, e, t) => {
  const { vnode: i, slots: s } = n;
  let o = !0, r = ut;
  if (i.shapeFlag & 32) {
    const l = e._;
    l ? t && l === 1 ? o = !1 : jp(s, e, t) : (o = !e.$stable, Kp(e, s)), r = e;
  } else e && (Up(n, e), r = { default: 1 });
  if (o)
    for (const l in s)
      !Cc(l) && r[l] == null && delete s[l];
}, an = bb;
function gb(n) {
  return mb(n);
}
function mb(n, e) {
  const t = Gl();
  t.__VUE__ = !0;
  const {
    insert: i,
    remove: s,
    patchProp: o,
    createElement: r,
    createText: l,
    createComment: a,
    setText: u,
    setElementText: c,
    parentNode: h,
    nextSibling: f,
    setScopeId: d = ys,
    insertStaticContent: g
  } = n, v = (S, x, $, I = null, _ = null, H = null, he = void 0, ie = null, oe = !!x.dynamicChildren) => {
    if (S === x)
      return;
    S && !vo(S, x) && (I = Z(S), J(S, _, H, !0), S = null), x.patchFlag === -2 && (oe = !1, x.dynamicChildren = null), x.dynamicChildren && S && S.dynamicChildren && S.dynamicChildren.hasOnce && (x.dynamicChildren === gs && (x.dynamicChildren = []), x.dynamicChildren.hasOnce = !0);
    const { type: X, ref: Ae, shapeFlag: fe } = x;
    switch (X) {
      case Ql:
        m(S, x, $, I);
        break;
      case hi:
        b(S, x, $, I);
        break;
      case Pa:
        S == null && O(x, $, I, he);
        break;
      case me:
        D(
          S,
          x,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        );
        break;
      default:
        fe & 1 ? B(
          S,
          x,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        ) : fe & 6 ? U(
          S,
          x,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        ) : (fe & 64 || fe & 128) && X.process(
          S,
          x,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe,
          ht
        );
    }
    Ae != null && _ ? Ro(Ae, S && S.ref, H, x || S, !x) : Ae == null && S && S.ref != null && Ro(S.ref, null, H, S, !0);
  }, m = (S, x, $, I) => {
    if (S == null)
      i(
        x.el = l(x.children),
        $,
        I
      );
    else {
      const _ = x.el = S.el;
      x.children !== S.children && u(_, x.children);
    }
  }, b = (S, x, $, I) => {
    S == null ? i(
      x.el = a(x.children || ""),
      $,
      I
    ) : x.el = S.el;
  }, O = (S, x, $, I) => {
    [S.el, S.anchor] = g(
      S.children,
      x,
      $,
      I,
      S.el,
      S.anchor
    );
  }, L = ({ el: S, anchor: x }, $, I) => {
    let _;
    for (; S && S !== x; )
      _ = f(S), i(S, $, I), S = _;
    i(x, $, I);
  }, E = ({ el: S, anchor: x }) => {
    let $;
    for (; S && S !== x; )
      $ = f(S), s(S), S = $;
    s(x);
  }, B = (S, x, $, I, _, H, he, ie, oe) => {
    if (x.type === "svg" ? he = "svg" : x.type === "math" && (he = "mathml"), S == null)
      z(
        x,
        $,
        I,
        _,
        H,
        he,
        ie,
        oe
      );
    else {
      const X = S.el && S.el._isVueCE ? S.el : null;
      try {
        X && X._beginPatch(), K(
          S,
          x,
          _,
          H,
          he,
          ie,
          oe
        );
      } finally {
        X && X._endPatch();
      }
    }
  }, z = (S, x, $, I, _, H, he, ie) => {
    let oe, X;
    const { props: Ae, shapeFlag: fe, transition: Ce, dirs: Te } = S;
    if (oe = S.el = r(
      S.type,
      H,
      Ae && Ae.is,
      Ae
    ), fe & 8 ? c(oe, S.children) : fe & 16 && Y(
      S.children,
      oe,
      null,
      I,
      _,
      Ra(S, H),
      he,
      ie
    ), Te && ls(S, null, I, "created"), P(oe, S, S.scopeId, he, I), Ae) {
      for (const We in Ae)
        We !== "value" && !Eo(We) && o(oe, We, null, Ae[We], H, I);
      "value" in Ae && o(oe, "value", null, Ae.value, H), (X = Ae.onVnodeBeforeMount) && Gn(X, I, S);
    }
    Te && ls(S, null, I, "beforeMount");
    const Fe = vb(_, Ce);
    Fe && Ce.beforeEnter(oe), i(oe, x, $), ((X = Ae && Ae.onVnodeMounted) || Fe || Te) && an(() => {
      X && Gn(X, I, S), Fe && Ce.enter(oe), Te && ls(S, null, I, "mounted");
    }, _);
  }, P = (S, x, $, I, _) => {
    if ($ && d(S, $), I)
      for (let H = 0; H < I.length; H++)
        d(S, I[H]);
    if (_) {
      let H = _.subTree;
      if (x === H || Xp(H.type) && (H.ssContent === x || H.ssFallback === x)) {
        const he = _.vnode;
        P(
          S,
          he,
          he.scopeId,
          he.slotScopeIds,
          _.parent
        );
      }
    }
  }, Y = (S, x, $, I, _, H, he, ie, oe = 0) => {
    for (let X = oe; X < S.length; X++) {
      const Ae = S[X] = ie ? mi(S[X]) : ii(S[X]);
      v(
        null,
        Ae,
        x,
        $,
        I,
        _,
        H,
        he,
        ie
      );
    }
  }, K = (S, x, $, I, _, H, he) => {
    const ie = x.el = S.el;
    let { patchFlag: oe, dynamicChildren: X, dirs: Ae } = x;
    oe |= S.patchFlag & 16;
    const fe = S.props || ut, Ce = x.props || ut;
    let Te;
    if ($ && as($, !1), (Te = Ce.onVnodeBeforeUpdate) && Gn(Te, $, x, S), Ae && ls(x, S, $, "beforeUpdate"), $ && as($, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    X && (!S.dynamicChildren || S.dynamicChildren.length !== X.length) && (oe = 0, he = !1, X = null), (fe.innerHTML && Ce.innerHTML == null || fe.textContent && Ce.textContent == null) && c(ie, ""), X ? re(
      S.dynamicChildren,
      X,
      ie,
      $,
      I,
      Ra(x, _),
      H
    ) : he || He(
      S,
      x,
      ie,
      null,
      $,
      I,
      Ra(x, _),
      H,
      !1
    ), oe > 0) {
      if (oe & 16)
        j(ie, fe, Ce, $, _);
      else if (oe & 2 && fe.class !== Ce.class && o(ie, "class", null, Ce.class, _), oe & 4 && o(ie, "style", fe.style, Ce.style, _), oe & 8) {
        const Fe = x.dynamicProps;
        for (let We = 0; We < Fe.length; We++) {
          const Ke = Fe[We], et = fe[Ke], pt = Ce[Ke];
          (pt !== et || Ke === "value") && o(ie, Ke, et, pt, _, $);
        }
      }
      oe & 1 && S.children !== x.children && c(ie, x.children);
    } else !he && X == null && j(ie, fe, Ce, $, _);
    ((Te = Ce.onVnodeUpdated) || Ae) && an(() => {
      Te && Gn(Te, $, x, S), Ae && ls(x, S, $, "updated");
    }, I);
  }, re = (S, x, $, I, _, H, he) => {
    for (let ie = 0; ie < x.length; ie++) {
      const oe = S[ie], X = x[ie], Ae = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oe.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oe.type === me || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !vo(oe, X) || // - In the case of a component, it could contain anything.
        oe.shapeFlag & 198) ? h(oe.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          $
        )
      );
      v(
        oe,
        X,
        Ae,
        null,
        I,
        _,
        H,
        he,
        !0
      );
    }
  }, j = (S, x, $, I, _) => {
    if (x !== $) {
      if (x !== ut)
        for (const H in x)
          !Eo(H) && !(H in $) && o(
            S,
            H,
            x[H],
            null,
            _,
            I
          );
      for (const H in $) {
        if (Eo(H)) continue;
        const he = $[H], ie = x[H];
        he !== ie && H !== "value" && o(S, H, ie, he, _, I);
      }
      "value" in $ && o(S, "value", x.value, $.value, _);
    }
  }, D = (S, x, $, I, _, H, he, ie, oe) => {
    const X = x.el = S ? S.el : l(""), Ae = x.anchor = S ? S.anchor : l("");
    let { patchFlag: fe, dynamicChildren: Ce, slotScopeIds: Te } = x;
    Te && (ie = ie ? ie.concat(Te) : Te), S == null ? (i(X, $, I), i(Ae, $, I), Y(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      x.children || [],
      $,
      Ae,
      _,
      H,
      he,
      ie,
      oe
    )) : fe > 0 && fe & 64 && Ce && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    S.dynamicChildren && S.dynamicChildren.length === Ce.length ? (re(
      S.dynamicChildren,
      Ce,
      $,
      _,
      H,
      he,
      ie
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (x.key != null || _ && x === _.subTree) && Gp(
      S,
      x,
      !0
      /* shallow */
    )) : He(
      S,
      x,
      $,
      Ae,
      _,
      H,
      he,
      ie,
      oe
    );
  }, U = (S, x, $, I, _, H, he, ie, oe) => {
    x.slotScopeIds = ie, S == null ? x.shapeFlag & 512 ? _.ctx.activate(
      x,
      $,
      I,
      he,
      oe
    ) : ke(
      x,
      $,
      I,
      _,
      H,
      he,
      oe
    ) : $e(S, x, oe);
  }, ke = (S, x, $, I, _, H, he) => {
    const ie = S.component = Cb(
      S,
      I,
      _
    );
    if (Ip(S) && (ie.ctx.renderer = ht), Mb(ie, !1, he), ie.asyncDep) {
      if (_ && _.registerDep(ie, ce, he), !S.el) {
        const oe = ie.subTree = Vt(hi);
        b(null, oe, x, $), S.placeholder = oe.el;
      }
    } else
      ce(
        ie,
        S,
        x,
        $,
        _,
        H,
        he
      );
  }, $e = (S, x, $) => {
    const I = x.component = S.component;
    if (lb(S, x, $))
      if (I.asyncDep && !I.asyncResolved) {
        x.el = S.el, pe(I, x, $);
        return;
      } else
        I.next = x, I.update();
    else
      x.el = S.el, I.vnode = x;
  }, ce = (S, x, $, I, _, H, he) => {
    const ie = () => {
      if (S.isMounted) {
        let { next: fe, bu: Ce, u: Te, parent: Fe, vnode: We } = S;
        {
          const st = qp(S);
          if (st) {
            fe && (fe.el = We.el, pe(S, fe, he)), st.asyncDep.then(() => {
              an(() => {
                S.isUnmounted || X();
              }, _);
            });
            return;
          }
        }
        let Ke = fe, et;
        as(S, !1), fe ? (fe.el = We.el, pe(S, fe, he)) : fe = We, Ce && il(Ce), (et = fe.props && fe.props.onVnodeBeforeUpdate) && Gn(et, Fe, fe, We), as(S, !0);
        const pt = Ph(S), Pt = S.subTree;
        S.subTree = pt, v(
          Pt,
          pt,
          // parent may have changed if it's in a teleport
          h(Pt.el),
          // anchor may have changed if it's in a fragment
          Z(Pt),
          S,
          _,
          H
        ), fe.el = pt.el, Ke === null && ab(S, pt.el), Te && an(Te, _), (et = fe.props && fe.props.onVnodeUpdated) && an(
          () => Gn(et, Fe, fe, We),
          _
        );
      } else {
        let fe;
        const { el: Ce, props: Te } = x, { bm: Fe, m: We, parent: Ke, root: et, type: pt } = S, Pt = Ws(x);
        as(S, !1), Fe && il(Fe), !Pt && (fe = Te && Te.onVnodeBeforeMount) && Gn(fe, Ke, x), as(S, !0);
        {
          et.ce && et.ce._hasShadowRoot() && et.ce._injectChildStyle(
            pt,
            S.parent ? S.parent.type : void 0
          );
          const st = S.subTree = Ph(S);
          v(
            null,
            st,
            $,
            I,
            S,
            _,
            H
          ), x.el = st.el;
        }
        if (We && an(We, _), !Pt && (fe = Te && Te.onVnodeMounted)) {
          const st = x;
          an(
            () => Gn(fe, Ke, st),
            _
          );
        }
        (x.shapeFlag & 256 || Ke && Ws(Ke.vnode) && Ke.vnode.shapeFlag & 256) && S.a && an(S.a, _), S.isMounted = !0, x = $ = I = null;
      }
    };
    S.scope.on();
    const oe = S.effect = new cp(ie);
    S.scope.off();
    const X = S.update = oe.run.bind(oe), Ae = S.job = oe.runIfDirty.bind(oe);
    Ae.i = S, Ae.id = S.uid, oe.scheduler = () => kc(Ae), as(S, !0), X();
  }, pe = (S, x, $) => {
    x.component = S;
    const I = S.vnode.props;
    S.vnode = x, S.next = null, cb(S, x.props, I, $), pb(S, x.children, $), ji(), Eh(S), Gi();
  }, He = (S, x, $, I, _, H, he, ie, oe = !1) => {
    const X = S && S.children, Ae = S ? S.shapeFlag : 0, fe = x.children, { patchFlag: Ce, shapeFlag: Te } = x;
    if (Ce > 0) {
      if (Ce & 128) {
        Re(
          X,
          fe,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        );
        return;
      } else if (Ce & 256) {
        Oe(
          X,
          fe,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        );
        return;
      }
    }
    Te & 8 ? (Ae & 16 && se(X, _, H), fe !== X && c($, fe)) : Ae & 16 ? Te & 16 ? Re(
      X,
      fe,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe
    ) : se(X, _, H, !0) : (Ae & 8 && c($, ""), Te & 16 && Y(
      fe,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe
    ));
  }, Oe = (S, x, $, I, _, H, he, ie, oe) => {
    S = S || gs, x = x || gs;
    const X = S.length, Ae = x.length, fe = Math.min(X, Ae);
    let Ce;
    for (Ce = 0; Ce < fe; Ce++) {
      const Te = x[Ce] = oe ? mi(x[Ce]) : ii(x[Ce]);
      v(
        S[Ce],
        Te,
        $,
        null,
        _,
        H,
        he,
        ie,
        oe
      );
    }
    X > Ae ? se(
      S,
      _,
      H,
      !0,
      !1,
      fe
    ) : Y(
      x,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe,
      fe
    );
  }, Re = (S, x, $, I, _, H, he, ie, oe) => {
    let X = 0;
    const Ae = x.length;
    let fe = S.length - 1, Ce = Ae - 1;
    for (; X <= fe && X <= Ce; ) {
      const Te = S[X], Fe = x[X] = oe ? mi(x[X]) : ii(x[X]);
      if (vo(Te, Fe))
        v(
          Te,
          Fe,
          $,
          null,
          _,
          H,
          he,
          ie,
          oe
        );
      else
        break;
      X++;
    }
    for (; X <= fe && X <= Ce; ) {
      const Te = S[fe], Fe = x[Ce] = oe ? mi(x[Ce]) : ii(x[Ce]);
      if (vo(Te, Fe))
        v(
          Te,
          Fe,
          $,
          null,
          _,
          H,
          he,
          ie,
          oe
        );
      else
        break;
      fe--, Ce--;
    }
    if (X > fe) {
      if (X <= Ce) {
        const Te = Ce + 1, Fe = Te < Ae ? x[Te].el : I;
        for (; X <= Ce; )
          v(
            null,
            x[X] = oe ? mi(x[X]) : ii(x[X]),
            $,
            Fe,
            _,
            H,
            he,
            ie,
            oe
          ), X++;
      }
    } else if (X > Ce)
      for (; X <= fe; )
        J(S[X], _, H, !0), X++;
    else {
      const Te = X, Fe = X, We = /* @__PURE__ */ new Map();
      for (X = Fe; X <= Ce; X++) {
        const Ot = x[X] = oe ? mi(x[X]) : ii(x[X]);
        Ot.key != null && We.set(Ot.key, X);
      }
      let Ke, et = 0;
      const pt = Ce - Fe + 1;
      let Pt = !1, st = 0;
      const mn = new Array(pt);
      for (X = 0; X < pt; X++) mn[X] = 0;
      for (X = Te; X <= fe; X++) {
        const Ot = S[X];
        if (et >= pt) {
          J(Ot, _, H, !0);
          continue;
        }
        let _t;
        if (Ot.key != null)
          _t = We.get(Ot.key);
        else
          for (Ke = Fe; Ke <= Ce; Ke++)
            if (mn[Ke - Fe] === 0 && vo(Ot, x[Ke])) {
              _t = Ke;
              break;
            }
        _t === void 0 ? J(Ot, _, H, !0) : (mn[_t - Fe] = X + 1, _t >= st ? st = _t : Pt = !0, v(
          Ot,
          x[_t],
          $,
          null,
          _,
          H,
          he,
          ie,
          oe
        ), et++);
      }
      const Un = Pt ? yb(mn) : gs;
      for (Ke = Un.length - 1, X = pt - 1; X >= 0; X--) {
        const Ot = Fe + X, _t = x[Ot], vn = x[Ot + 1], Mt = Ot + 1 < Ae ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          vn.el || Yp(vn)
        ) : I;
        mn[X] === 0 ? v(
          null,
          _t,
          $,
          Mt,
          _,
          H,
          he,
          ie,
          oe
        ) : Pt && (Ke < 0 || X !== Un[Ke] ? Le(_t, $, Mt, 2) : Ke--);
      }
    }
  }, Le = (S, x, $, I, _ = null) => {
    const { el: H, type: he, transition: ie, children: oe, shapeFlag: X } = S;
    if (X & 6) {
      Le(S.component.subTree, x, $, I);
      return;
    }
    if (X & 128) {
      S.suspense.move(x, $, I);
      return;
    }
    if (X & 64) {
      he.move(S, x, $, ht);
      return;
    }
    if (he === me) {
      i(H, x, $);
      for (let fe = 0; fe < oe.length; fe++)
        Le(oe[fe], x, $, I);
      i(S.anchor, x, $);
      return;
    }
    if (he === Pa) {
      L(S, x, $);
      return;
    }
    if (I !== 2 && X & 1 && ie)
      if (I === 0)
        ie.persisted && !H[Ba] ? i(H, x, $) : (ie.beforeEnter(H), i(H, x, $), an(() => ie.enter(H), _));
      else {
        const { leave: fe, delayLeave: Ce, afterLeave: Te } = ie, Fe = () => {
          S.ctx.isUnmounted ? s(H) : i(H, x, $);
        }, We = () => {
          const Ke = H._isLeaving || !!H[Ba];
          H._isLeaving && H[Ba](
            !0
            /* cancelled */
          ), ie.persisted && !Ke ? Fe() : fe(H, () => {
            Fe(), Te && Te();
          });
        };
        Ce ? Ce(H, Fe, We) : We();
      }
    else
      i(H, x, $);
  }, J = (S, x, $, I = !1, _ = !1) => {
    const {
      type: H,
      props: he,
      ref: ie,
      children: oe,
      dynamicChildren: X,
      shapeFlag: Ae,
      patchFlag: fe,
      dirs: Ce,
      cacheIndex: Te,
      memo: Fe
    } = S;
    if ((fe === -2 || X && X.hasOnce) && (_ = !1), ie != null && (ji(), Ro(ie, null, $, S, !0), Gi()), Te != null && (!S.ctx || S.ctx === x) && (x.renderCache[Te] = void 0), Ae & 256) {
      x.ctx.deactivate(S);
      return;
    }
    const We = Ae & 1 && Ce, Ke = !Ws(S);
    let et;
    if (Ke && (et = he && he.onVnodeBeforeUnmount) && Gn(et, x, S), Ae & 6)
      Ie(S.component, $, I);
    else {
      if (Ae & 128) {
        S.suspense.unmount($, I);
        return;
      }
      We && ls(S, null, x, "beforeUnmount"), Ae & 64 ? S.type.remove(
        S,
        x,
        $,
        ht,
        I
      ) : X && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !X.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (H !== me || fe > 0 && fe & 64) ? se(
        X,
        x,
        $,
        !1,
        !0
      ) : (H === me && fe & 384 || !_ && Ae & 16) && se(oe, x, $), I && ct(S);
    }
    const pt = Fe != null && Te == null;
    (Ke && (et = he && he.onVnodeUnmounted) || We || pt) && an(() => {
      et && Gn(et, x, S), We && ls(S, null, x, "unmounted"), pt && (S.el = null);
    }, $);
  }, ct = (S) => {
    const { type: x, el: $, anchor: I, transition: _ } = S;
    if (x === me) {
      be($, I);
      return;
    }
    if (x === Pa) {
      E(S), _ && !_.persisted && _.afterLeave && _.afterLeave();
      return;
    }
    const H = () => {
      s($), _ && !_.persisted && _.afterLeave && _.afterLeave();
    };
    if (S.shapeFlag & 1 && _ && !_.persisted) {
      const { leave: he, delayLeave: ie } = _, oe = () => he($, H);
      ie ? ie(S.el, H, oe) : oe();
    } else
      H();
  }, be = (S, x) => {
    let $;
    for (; S !== x; )
      $ = f(S), s(S), S = $;
    s(x);
  }, Ie = (S, x, $) => {
    const { bum: I, scope: _, job: H, subTree: he, um: ie, m: oe, a: X } = S;
    Vh(oe), Vh(X), I && il(I), _.stop(), H ? (H.flags |= 8, J(he, S, x, $)) : S.vnode.el && he && (he.transition = S.vnode.transition, J(he, S, x, $)), ie && an(ie, x), an(() => {
      S.isUnmounted = !0;
    }, x);
  }, se = (S, x, $, I = !1, _ = !1, H = 0) => {
    for (let he = H; he < S.length; he++)
      J(S[he], x, $, I, _);
  }, Z = (S) => {
    if (S.shapeFlag & 6)
      return Z(S.component.subTree);
    if (S.shapeFlag & 128)
      return S.suspense.next();
    const x = f(S.anchor || S.el), $ = x && x[q0];
    return $ ? f($) : x;
  };
  let ne = !1;
  const Xe = (S, x, $) => {
    let I;
    S == null ? x._vnode && (J(x._vnode, null, null, !0), I = x._vnode.component) : v(
      x._vnode || null,
      S,
      x,
      null,
      null,
      null,
      $
    ), x._vnode = S, ne || (ne = !0, Eh(I), $p(), ne = !1);
  }, ht = {
    p: v,
    um: J,
    m: Le,
    r: ct,
    mt: ke,
    mc: Y,
    pc: He,
    pbc: re,
    n: Z,
    o: n
  };
  return {
    render: Xe,
    hydrate: void 0,
    createApp: nb(Xe)
  };
}
function Ra({ type: n, props: e }, t) {
  return t === "svg" && n === "foreignObject" || t === "mathml" && n === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : t;
}
function as({ effect: n, job: e }, t) {
  t ? (n.flags |= 32, e.flags |= 4) : (n.flags &= -33, e.flags &= -5);
}
function vb(n, e) {
  return (!n || n && !n.pendingBranch) && e && !e.persisted;
}
function Gp(n, e, t = !1) {
  const i = n.children, s = e.children;
  if (Ve(i) && Ve(s))
    for (let o = 0; o < i.length; o++) {
      const r = i[o];
      let l = s[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[o] = mi(s[o]), l.el = r.el), !t && l.patchFlag !== -2 && Gp(r, l)), l.type === Ql && (l.patchFlag === -1 && (l = s[o] = mi(l)), l.el = r.el), l.type === hi && !l.el && (l.el = r.el);
    }
}
function yb(n) {
  const e = n.slice(), t = [0];
  let i, s, o, r, l;
  const a = n.length;
  for (i = 0; i < a; i++) {
    const u = n[i];
    if (u !== 0) {
      if (s = t[t.length - 1], n[s] < u) {
        e[i] = s, t.push(i);
        continue;
      }
      for (o = 0, r = t.length - 1; o < r; )
        l = o + r >> 1, n[t[l]] < u ? o = l + 1 : r = l;
      u < n[t[o]] && (o > 0 && (e[i] = t[o - 1]), t[o] = i);
    }
  }
  for (o = t.length, r = t[o - 1]; o-- > 0; )
    t[o] = r, r = e[r];
  return t;
}
function qp(n) {
  const e = n.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : qp(e);
}
function Vh(n) {
  if (n)
    for (let e = 0; e < n.length; e++)
      n[e].flags |= 8;
}
function Yp(n) {
  if (n.placeholder)
    return n.placeholder;
  const e = n.component;
  return e ? Yp(e.subTree) : null;
}
const Xp = (n) => n.__isSuspense;
function bb(n, e) {
  e && e.pendingBranch ? Ve(n) ? e.effects.push(...n) : e.effects.push(n) : W0(n);
}
const me = /* @__PURE__ */ Symbol.for("v-fgt"), Ql = /* @__PURE__ */ Symbol.for("v-txt"), hi = /* @__PURE__ */ Symbol.for("v-cmt"), Pa = /* @__PURE__ */ Symbol.for("v-stc"), Si = [];
let pn = null;
function w(n = !1) {
  Si.push(pn = n ? null : []);
}
function Ac() {
  Si.pop(), pn = Si[Si.length - 1] || null;
}
let qo = 1;
function Hh(n, e = !1) {
  qo += n, n < 0 && pn && e && (pn.hasOnce = !0);
}
function Jp(n) {
  return n.dynamicChildren = qo > 0 ? pn || gs : null, Ac(), qo > 0 && pn && pn.push(n), n;
}
function M(n, e, t, i, s, o) {
  return Jp(
    p(
      n,
      e,
      t,
      i,
      s,
      o,
      !0
    )
  );
}
function xn(n, e, t, i, s) {
  return Jp(
    Vt(
      n,
      e,
      t,
      i,
      s,
      !0
    )
  );
}
function Tc(n) {
  return n ? n.__v_isVNode === !0 : !1;
}
function vo(n, e) {
  return n.type === e.type && n.key === e.key;
}
const Zp = ({ key: n }) => n ?? null, sl = ({
  ref: n,
  ref_key: e,
  ref_for: t
}) => (typeof n == "number" && (n = "" + n), n != null ? Rt(n) || /* @__PURE__ */ on(n) || dt(n) ? { i: Xt, r: n, k: e, f: !!t } : n : null);
function p(n, e = null, t = null, i = 0, s = null, o = n === me ? 0 : 1, r = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n,
    props: e,
    key: e && Zp(e),
    ref: e && sl(e),
    scopeId: Op,
    slotScopeIds: null,
    children: t,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: i,
    dynamicProps: s,
    dynamicChildren: null,
    appContext: null,
    ctx: Xt
  };
  return l ? (wl(a, t), o & 128 && n.normalize(a)) : t && (a.shapeFlag |= Rt(t) ? 8 : 16), qo > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  pn && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && pn.push(a), a;
}
const Vt = xb;
function xb(n, e = null, t = null, i = 0, s = null, o = !1) {
  if ((!n || n === Z0) && (n = hi), Tc(n)) {
    const l = Js(
      n,
      e,
      !0
      /* mergeRef: true */
    );
    return t && wl(l, t), qo > 0 && !o && pn && (l.shapeFlag & 6 ? pn[pn.indexOf(n)] = l : pn.push(l)), l.patchFlag = -2, l;
  }
  if (Db(n) && (n = n.__vccOpts), e) {
    e = wb(e);
    let { class: l, style: a } = e;
    l && !Rt(l) && (e.class = qe(l)), Tt(a) && (/* @__PURE__ */ wc(a) && !Ve(a) && (a = Dn({}, a)), e.style = ki(a));
  }
  const r = Rt(n) ? 1 : Xp(n) ? 128 : Jl(n) ? 64 : Tt(n) ? 4 : dt(n) ? 2 : 0;
  return p(
    n,
    e,
    t,
    i,
    s,
    r,
    o,
    !0
  );
}
function wb(n) {
  return n ? /* @__PURE__ */ wc(n) || zp(n) ? Dn({}, n) : n : null;
}
function Js(n, e, t = !1, i = !1) {
  const { props: s, ref: o, patchFlag: r, children: l, transition: a } = n, u = e ? Mo(s || {}, e) : s, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n.type,
    props: u,
    key: u && Zp(u),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      t && o ? Ve(o) ? o.concat(sl(e)) : [o, sl(e)] : sl(e)
    ) : o,
    scopeId: n.scopeId,
    slotScopeIds: n.slotScopeIds,
    children: l,
    target: n.target,
    targetStart: n.targetStart,
    targetAnchor: n.targetAnchor,
    staticCount: n.staticCount,
    shapeFlag: n.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: e && n.type !== me ? r === -1 ? 16 : r | 16 : r,
    dynamicProps: n.dynamicProps,
    dynamicChildren: n.dynamicChildren,
    appContext: n.appContext,
    dirs: n.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: n.component,
    suspense: n.suspense,
    ssContent: n.ssContent && Js(n.ssContent),
    ssFallback: n.ssFallback && Js(n.ssFallback),
    placeholder: n.placeholder,
    el: n.el,
    anchor: n.anchor,
    ctx: n.ctx,
    ce: n.ce,
    cacheIndex: n.cacheIndex
  };
  return a && i && Sc(
    c,
    a.clone(c)
  ), c;
}
function ye(n = " ", e = 0) {
  return Vt(Ql, null, n, e);
}
function ee(n = "", e = !1) {
  return e ? (w(), xn(hi, null, n)) : Vt(hi, null, n);
}
function ii(n) {
  return n == null || typeof n == "boolean" ? Vt(hi) : Ve(n) ? Vt(
    me,
    null,
    // #3666, avoid reference pollution when reusing vnode
    n.slice()
  ) : Tc(n) ? mi(n) : Vt(Ql, null, String(n));
}
function mi(n) {
  return n.el === null && n.patchFlag !== -1 || n.memo ? n : Js(n);
}
function wl(n, e) {
  let t = 0;
  const { shapeFlag: i } = n;
  if (e == null)
    e = null;
  else if (Ve(e))
    t = 16;
  else if (typeof e == "object")
    if (i & 65) {
      const s = e.default;
      s && (s._c && (s._d = !1), wl(n, s()), s._c && (s._d = !0));
      return;
    } else {
      t = 32;
      const s = e._;
      !s && !zp(e) ? e._ctx = Xt : s === 3 && Xt && (Xt.slots._ === 1 ? e._ = 1 : (e._ = 2, n.patchFlag |= 1024));
    }
  else if (dt(e)) {
    if (i & 65) {
      wl(n, { default: e });
      return;
    }
    e = { default: e, _ctx: Xt }, t = 32;
  } else
    e = String(e), i & 64 ? (t = 16, e = [ye(e)]) : t = 8;
  n.children = e, n.shapeFlag |= t;
}
function Mo(...n) {
  const e = {};
  for (let t = 0; t < n.length; t++) {
    const i = n[t];
    for (const s in i)
      if (s === "class")
        e.class !== i.class && (e.class = qe([e.class, i.class]));
      else if (s === "style")
        e.style = ki([e.style, i.style]);
      else if (Wl(s)) {
        const o = e[s], r = i[s];
        r && o !== r && !(Ve(o) && o.includes(r)) ? e[s] = o ? [].concat(o, r) : r : r == null && o == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !Kl(s) && (e[s] = r);
      } else s !== "" && (e[s] = i[s]);
  }
  return e;
}
function Gn(n, e, t, i = null) {
  ci(n, e, 7, [
    t,
    i
  ]);
}
const kb = _p();
let Sb = 0;
function Cb(n, e, t) {
  const i = n.type, s = (e ? e.appContext : n.appContext) || kb, o = {
    uid: Sb++,
    vnode: n,
    type: i,
    parent: e,
    appContext: s,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new f0(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: e ? e.provides : Object.create(s.provides),
    ids: e ? e.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: hb(i, s),
    emitsOptions: sb(i, s),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ut,
    // inheritAttrs
    inheritAttrs: i.inheritAttrs,
    // state
    ctx: ut,
    data: ut,
    props: ut,
    attrs: ut,
    slots: ut,
    refs: ut,
    setupState: ut,
    setupContext: null,
    // suspense related
    suspense: t,
    suspenseId: t ? t.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return o.ctx = { _: o }, o.root = e ? e.root : o, o.emit = ib.bind(null, o), n.ce && n.ce(o), o;
}
let Yi = null;
const Qp = () => Yi || Xt;
let kl, Yo;
{
  const n = Gl(), e = (t, i) => {
    let s;
    return (s = n[t]) || (s = n[t] = []), s.push(i), (o) => {
      s.length > 1 ? s.forEach((r) => r(o)) : s[0](o);
    };
  };
  kl = e(
    "__VUE_INSTANCE_SETTERS__",
    (t) => Yi = t
  ), Yo = e(
    "__VUE_SSR_SETTERS__",
    (t) => Xo = t
  );
}
const $c = (n) => {
  const e = Yi;
  return kl(n), n.scope.on(), () => {
    n.scope.off(), kl(e);
  };
}, Fh = () => {
  Yi && Yi.scope.off(), kl(null);
};
function eg(n) {
  return n.vnode.shapeFlag & 4;
}
let Xo = !1;
function Mb(n, e = !1, t = !1) {
  e && Yo(e);
  const { props: i, children: s } = n.vnode, o = eg(n);
  ub(n, i, o, e), db(n, s, t || e);
  const r = o ? Ab(n, e) : void 0;
  return e && Yo(!1), r;
}
function Ab(n, e) {
  const t = n.type;
  n.accessCache = /* @__PURE__ */ Object.create(null), n.proxy = new Proxy(n.ctx, eb);
  const { setup: i } = t;
  if (i) {
    ji();
    const s = n.setupContext = i.length > 1 ? $b(n) : null, o = $c(n), r = fr(
      i,
      n,
      0,
      [
        n.props,
        s
      ]
    ), l = np(r);
    if (Gi(), o(), (l || n.sp) && !Ws(n) && X0(n), l) {
      if (r.then(Fh, Fh), e)
        return r.then((a) => {
          Yo(!0);
          try {
            zh(n, a, e);
          } finally {
            Yo(!1);
          }
        }).catch((a) => {
          Xl(a, n, 0);
        });
      n.asyncDep = r;
    } else
      zh(n, r);
  } else
    tg(n);
}
function zh(n, e, t) {
  dt(e) ? n.type.__ssrInlineRender ? n.ssrRender = e : n.render = e : Tt(e) && (n.setupState = Mp(e)), tg(n);
}
function tg(n, e, t) {
  const i = n.type;
  n.render || (n.render = i.render || ys);
}
const Tb = {
  get(n, e) {
    return Yt(n, "get", ""), n[e];
  }
};
function $b(n) {
  const e = (t) => {
    n.exposed = t || {};
  };
  return {
    attrs: new Proxy(n.attrs, Tb),
    slots: n.slots,
    emit: n.emit,
    expose: e
  };
}
function ea(n) {
  return n.exposed ? n.exposeProxy || (n.exposeProxy = new Proxy(Mp(E0(n.exposed)), {
    get(e, t) {
      if (t in e)
        return e[t];
      if (t in Po)
        return Po[t](n);
    },
    has(e, t) {
      return t in e || t in Po;
    }
  })) : n.proxy;
}
function Db(n) {
  return dt(n) && "__vccOpts" in n;
}
const N = (n, e) => /* @__PURE__ */ N0(n, e, Xo), Ob = "3.5.43";
let yu;
const Wh = typeof window < "u" && window.trustedTypes;
if (Wh)
  try {
    yu = /* @__PURE__ */ Wh.createPolicy("vue", {
      createHTML: (n) => n
    });
  } catch {
  }
const ng = yu ? (n) => yu.createHTML(n) : (n) => n, Lb = "http://www.w3.org/2000/svg", Eb = "http://www.w3.org/1998/Math/MathML", gi = typeof document < "u" ? document : null, Kh = gi && /* @__PURE__ */ gi.createElement("template"), Bb = {
  insert: (n, e, t) => {
    e.insertBefore(n, t || null);
  },
  remove: (n) => {
    const e = n.parentNode;
    e && e.removeChild(n);
  },
  createElement: (n, e, t, i) => {
    const s = e === "svg" ? gi.createElementNS(Lb, n) : e === "mathml" ? gi.createElementNS(Eb, n) : t ? gi.createElement(n, { is: t }) : gi.createElement(n);
    return n === "select" && i && i.multiple != null && s.setAttribute("multiple", i.multiple), s;
  },
  createText: (n) => gi.createTextNode(n),
  createComment: (n) => gi.createComment(n),
  setText: (n, e) => {
    n.nodeValue = e;
  },
  setElementText: (n, e) => {
    n.textContent = e;
  },
  parentNode: (n) => n.parentNode,
  nextSibling: (n) => n.nextSibling,
  querySelector: (n) => gi.querySelector(n),
  setScopeId(n, e) {
    n.setAttribute(e, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(n, e, t, i, s, o) {
    const r = t ? t.previousSibling : e.lastChild;
    if (s && (s === o || s.nextSibling))
      for (; e.insertBefore(s.cloneNode(!0), t), !(s === o || !(s = s.nextSibling)); )
        ;
    else {
      Kh.innerHTML = ng(
        i === "svg" ? `<svg>${n}</svg>` : i === "mathml" ? `<math>${n}</math>` : n
      );
      const l = Kh.content;
      if (i === "svg" || i === "mathml") {
        const a = l.firstChild;
        for (; a.firstChild; )
          l.appendChild(a.firstChild);
        l.removeChild(a);
      }
      e.insertBefore(l, t);
    }
    return [
      // first
      r ? r.nextSibling : e.firstChild,
      // last
      t ? t.previousSibling : e.lastChild
    ];
  }
}, Ib = /* @__PURE__ */ Symbol("_vtc");
function Rb(n, e, t) {
  const i = n[Ib];
  i && (e = (e ? [e, ...i] : [...i]).join(" ")), e == null ? n.removeAttribute("class") : t ? n.setAttribute("class", e) : n.className = e;
}
const Uh = /* @__PURE__ */ Symbol("_vod"), Pb = /* @__PURE__ */ Symbol("_vsh"), _b = /* @__PURE__ */ Symbol(""), Nb = /(?:^|;)\s*display\s*:/;
function Vb(n, e, t) {
  const i = n.style, s = Rt(t);
  let o = !1;
  if (t && !s) {
    if (e)
      if (Rt(e))
        for (const r of e.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          t[l] == null && Ao(i, l, "");
        }
      else
        for (const r in e)
          t[r] == null && Ao(i, r, "");
    for (const r in t) {
      r === "display" && (o = !0);
      const l = t[r];
      l != null ? Fb(
        n,
        r,
        !Rt(e) && e ? e[r] : void 0,
        l
      ) || Ao(i, r, l) : Ao(i, r, "");
    }
  } else if (s) {
    if (e !== t) {
      const r = i[_b];
      r && (t += ";" + r), i.cssText = t, o = Nb.test(t);
    }
  } else e && n.removeAttribute("style");
  Uh in n && (n[Uh] = o ? i.display : "", n[Pb] && (i.display = "none"));
}
const $r = /\s*!important$/;
function Ao(n, e, t) {
  if (Ve(t))
    t.forEach((i) => Ao(n, e, i));
  else if (t == null && (t = ""), e.startsWith("--"))
    $r.test(t) ? n.setProperty(e, t.replace($r, ""), "important") : n.setProperty(e, t);
  else {
    const i = Hb(n, e);
    $r.test(t) ? n.setProperty(
      Oi(i),
      t.replace($r, ""),
      "important"
    ) : n[i] = t;
  }
}
const jh = ["Webkit", "Moz", "ms"], _a = {};
function Hb(n, e) {
  const t = _a[e];
  if (t)
    return t;
  let i = Cn(e);
  if (i !== "filter" && i in n)
    return _a[e] = i;
  i = op(i);
  for (let s = 0; s < jh.length; s++) {
    const o = jh[s] + i;
    if (o in n)
      return _a[e] = o;
  }
  return e;
}
function Fb(n, e, t, i) {
  return n.tagName === "TEXTAREA" && (e === "width" || e === "height") && Rt(i) && t === i;
}
const Gh = "http://www.w3.org/1999/xlink";
function qh(n, e, t, i, s, o = u0(e)) {
  i && e.startsWith("xlink:") ? t == null ? n.removeAttributeNS(Gh, e.slice(6, e.length)) : n.setAttributeNS(Gh, e, t) : t == null || o && !lp(t) ? n.removeAttribute(e) : n.setAttribute(
    e,
    o ? "" : Hn(t) ? String(t) : t
  );
}
function Yh(n, e, t, i, s) {
  if (e === "innerHTML" || e === "textContent") {
    t != null && (n[e] = e === "innerHTML" ? ng(t) : t);
    return;
  }
  const o = n.tagName;
  if (e === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const l = o === "OPTION" ? n.getAttribute("value") || "" : n.value, a = t == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      n.type === "checkbox" ? "on" : ""
    ) : String(t);
    (l !== a || !("_value" in n)) && (n.value = a), t == null && n.removeAttribute(e), n._value = t;
    return;
  }
  let r = !1;
  if (t === "" || t == null) {
    const l = typeof n[e];
    l === "boolean" ? t = lp(t) : t == null && l === "string" ? (t = "", r = !0) : l === "number" && (t = 0, r = !0);
  }
  try {
    n[e] = t;
  } catch {
  }
  r && n.removeAttribute(s || e);
}
function Ni(n, e, t, i) {
  n.addEventListener(e, t, i);
}
function zb(n, e, t, i) {
  n.removeEventListener(e, t, i);
}
const Xh = /* @__PURE__ */ Symbol("_vei");
function Wb(n, e, t, i, s = null) {
  const o = n[Xh] || (n[Xh] = {}), r = o[e];
  if (i && r)
    r.value = i;
  else {
    const [l, a] = jb(e);
    if (i) {
      const u = o[e] = Yb(
        i,
        s
      );
      Ni(n, l, u, a);
    } else r && (zb(n, l, r, a), o[e] = void 0);
  }
}
const Kb = /(Once|Passive|Capture)$/, Ub = /^on:?(?:Once|Passive|Capture)$/;
function jb(n) {
  let e, t;
  for (; (t = n.match(Kb)) && !Ub.test(n); )
    e || (e = {}), n = n.slice(0, n.length - t[1].length), e[t[1].toLowerCase()] = !0;
  return [n[2] === ":" ? n.slice(3) : Oi(n.slice(2)), e];
}
let Na = 0;
const Gb = /* @__PURE__ */ Promise.resolve(), qb = () => Na || (Gb.then(() => Na = 0), Na = Date.now());
function Yb(n, e) {
  const t = (i) => {
    if (!i._vts)
      i._vts = Date.now();
    else if (i._vts <= t.attached)
      return;
    const s = t.value;
    if (Ve(s)) {
      const o = i.stopImmediatePropagation;
      i.stopImmediatePropagation = () => {
        o.call(i), i._stopped = !0;
      };
      const r = s.slice(), l = [i];
      for (let a = 0; a < r.length && !i._stopped; a++) {
        const u = r[a];
        u && ci(
          u,
          e,
          5,
          l
        );
      }
    } else
      ci(
        s,
        e,
        5,
        [i]
      );
  };
  return t.value = n, t.attached = qb(), t;
}
const Jh = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // lowercase letter
n.charCodeAt(2) > 96 && n.charCodeAt(2) < 123, Xb = (n, e, t, i, s, o) => {
  const r = s === "svg";
  e === "class" ? Rb(n, i, r) : e === "style" ? Vb(n, t, i) : Wl(e) ? Kl(e) || Wb(n, e, t, i, o) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Jb(n, e, i, r)) ? (Yh(n, e, i), !n.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && qh(n, e, i, r, o, e !== "value")) : /* #11081 force set props for possible async custom element */ n._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (Zb(n, e) || // @ts-expect-error _def is private
  n._def.__asyncLoader && (/[A-Z]/.test(e) || !Rt(i))) ? Yh(n, Cn(e), i, o, e) : (e === "true-value" ? n._trueValue = i : e === "false-value" && (n._falseValue = i), qh(n, e, i, r));
};
function Jb(n, e, t, i) {
  if (i)
    return !!(e === "innerHTML" || e === "textContent" || e in n && Jh(e) && dt(t));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && n.tagName === "IFRAME" || e === "form" || e === "list" && n.tagName === "INPUT" || e === "type" && n.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const s = n.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
      return !1;
  }
  return Jh(e) && Rt(t) ? !1 : e in n;
}
function Zb(n, e) {
  const t = (
    // @ts-expect-error _def is private
    n._def.props
  );
  if (!t)
    return !1;
  const i = Cn(e);
  return Array.isArray(t) ? t.some((s) => Cn(s) === i) : Object.keys(t).some((s) => Cn(s) === i);
}
const Zs = (n) => {
  const e = n.props["onUpdate:modelValue"] || !1;
  return Ve(e) ? (t) => il(e, t) : e;
};
function Qb(n) {
  n.target.composing = !0;
}
function Zh(n) {
  const e = n.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const li = /* @__PURE__ */ Symbol("_assign"), Dr = /* @__PURE__ */ Symbol("_initialValue");
function Va(n, e, t) {
  return e && (n = n.trim()), t && (n = jl(n)), n;
}
const Nt = {
  created(n, { modifiers: { lazy: e, trim: t, number: i } }, s) {
    n.parentNode && (n.type === "text" ? n[Dr] = n.defaultValue.replace(/[\r\n]/g, "") : n.type === "textarea" && (n[Dr] = n.defaultValue.replace(/\r\n?/g, `
`))), n[li] = Zs(s);
    const o = i || s.props && s.props.type === "number";
    Ni(n, e ? "change" : "input", (r) => {
      r.target.composing || n[li](Va(n.value, t, o));
    }), (t || o) && Ni(n, "change", () => {
      n.value = Va(n.value, t, o);
    }), e || (Ni(n, "compositionstart", Qb), Ni(n, "compositionend", Zh), Ni(n, "change", Zh));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(n, { value: e, modifiers: { trim: t, number: i } }) {
    const s = e ?? "", o = n[Dr];
    delete n[Dr], o !== void 0 && (n.type === "text" || n.type === "textarea") && n.value !== o ? n[li](Va(n.value, t, i)) : n.value = s;
  },
  beforeUpdate(n, { value: e, oldValue: t, modifiers: { lazy: i, trim: s, number: o } }, r) {
    if (n[li] = Zs(r), n.composing) return;
    const l = (o || n.type === "number") && !/^0\d/.test(n.value) ? jl(n.value) : n.value, a = e ?? "";
    if (l === a)
      return;
    const u = n.getRootNode();
    (u instanceof Document || u instanceof ShadowRoot) && u.activeElement === n && n.type !== "range" && (i && e === t || s && n.value.trim() === a) || (n.value = a);
  }
}, un = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(n, e, t) {
    n[li] = Zs(t), Ni(n, "change", () => {
      const i = n._modelValue, s = Jo(n), o = n.checked, r = n[li];
      if (Ve(i)) {
        const l = gc(i, s), a = l !== -1;
        if (o && !a)
          r(i.concat(s));
        else if (!o && a) {
          const u = [...i];
          u.splice(l, 1), r(u);
        }
      } else if (Ai(i)) {
        const l = new Set(i);
        o ? l.add(s) : l.delete(s), r(l);
      } else
        r(ig(n, o));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: Qh,
  beforeUpdate(n, e, t) {
    n[li] = Zs(t), Qh(n, e, t);
  }
};
function Qh(n, { value: e, oldValue: t }, i) {
  n._modelValue = e;
  let s;
  if (Ve(e))
    s = gc(e, i.props.value) > -1;
  else if (Ai(e))
    s = e.has(i.props.value);
  else {
    if (e === t) return;
    s = Ti(e, ig(n, !0));
  }
  n.checked !== s && (n.checked = s);
}
const Xi = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(n, { value: e, modifiers: { number: t } }, i) {
    n._modelValue = e, Ni(n, "change", () => {
      const s = Array.prototype.filter.call(n.options, (a) => a.selected).map(
        (a) => t ? jl(Jo(a)) : Jo(a)
      ), o = n.multiple, r = o ? Ai(n._modelValue) ? new Set(s) : s : s[0], l = n._pendingValue = [
        o,
        o ? Ve(r) ? s.slice() : s : r
      ];
      try {
        n[li](r);
      } finally {
        Bn(() => {
          n._pendingValue === l && (n._pendingValue = void 0);
        });
      }
    }), n[li] = Zs(i);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(n, { value: e }) {
    ef(n, e);
  },
  beforeUpdate(n, { value: e }, t) {
    n._modelValue = e, n[li] = Zs(t);
  },
  updated(n, { value: e }) {
    const t = n._pendingValue;
    n._pendingValue = void 0, (!t || t[0] !== n.multiple || !e1(e, t[1], t[0])) && ef(n, e);
  }
};
function e1(n, e, t) {
  if (!t || Ve(n)) return Ti(n, e);
  if (Ai(n)) {
    if (n.size !== e.length) return !1;
    for (const i of e)
      if (!n.has(i)) return !1;
    return !0;
  }
  return !1;
}
function ef(n, e) {
  const t = n.multiple, i = Ve(e);
  if (!(t && !i && !Ai(e))) {
    for (let s = 0, o = n.options.length; s < o; s++) {
      const r = n.options[s], l = Jo(r);
      if (t)
        if (i) {
          const a = typeof l;
          a === "string" || a === "number" ? r.selected = e.some((u) => String(u) === String(l)) : r.selected = gc(e, l) > -1;
        } else
          r.selected = e.has(l);
      else if (Ti(Jo(r), e)) {
        n.selectedIndex !== s && (n.selectedIndex = s);
        return;
      }
    }
    !t && n.selectedIndex !== -1 && (n.selectedIndex = -1);
  }
}
function Jo(n) {
  return "_value" in n ? n._value : n.value;
}
function ig(n, e) {
  const t = e ? "_trueValue" : "_falseValue";
  return t in n ? n[t] : e;
}
const t1 = ["ctrl", "shift", "alt", "meta"], n1 = {
  stop: (n) => n.stopPropagation(),
  prevent: (n) => n.preventDefault(),
  self: (n) => n.target !== n.currentTarget,
  ctrl: (n) => !n.ctrlKey,
  shift: (n) => !n.shiftKey,
  alt: (n) => !n.altKey,
  meta: (n) => !n.metaKey,
  left: (n) => "button" in n && n.button !== 0,
  middle: (n) => "button" in n && n.button !== 1,
  right: (n) => "button" in n && n.button !== 2,
  exact: (n, e) => t1.some((t) => n[`${t}Key`] && !e.includes(t))
}, ft = (n, e) => {
  if (!n) return n;
  const t = n._withMods || (n._withMods = {}), i = e.join(".");
  return t[i] || (t[i] = ((s, ...o) => {
    for (let r = 0; r < e.length; r++) {
      const l = n1[e[r]];
      if (l && l(s, e)) return;
    }
    return n(s, ...o);
  }));
}, i1 = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Lt = (n, e) => {
  const t = n._withKeys || (n._withKeys = {}), i = e.join(".");
  return t[i] || (t[i] = ((s) => {
    if (!("key" in s))
      return;
    const o = Oi(s.key);
    if (e.some(
      (r) => r === o || i1[r] === o
    ))
      return n(s);
  }));
}, s1 = /* @__PURE__ */ Dn({ patchProp: Xb }, Bb);
let tf;
function o1() {
  return tf || (tf = gb(s1));
}
const r1 = ((...n) => {
  const e = o1().createApp(...n), { mount: t } = e;
  return e.mount = (i) => {
    const s = a1(i);
    if (!s) return;
    const o = e._component;
    !dt(o) && !o.render && !o.template && (o.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const r = t(s, !1, l1(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), r;
  }, e;
});
function l1(n) {
  if (n instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && n instanceof MathMLElement)
    return "mathml";
}
function a1(n) {
  return Rt(n) ? document.querySelector(n) : n;
}
const u1 = '.plenio-overlay{position:fixed;inset:0;z-index:3000;background:#0000008c;display:flex;align-items:center;justify-content:center;font:13px/1.45 var(--font-family, sans-serif)}.plenio-overlay .plenio-dialog{position:relative;width:min(1280px,96vw);height:min(900px,94vh);max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);--plenio-dialog-h: min(900px, 94vh);display:flex;flex-direction:column;background:var(--comfy-menu-bg, #222);color:var(--fg-color, #ddd);border:1px solid var(--border-color, #444);border-radius:10px;box-shadow:0 12px 40px #0000007f}.plenio-overlay .resize-handle{position:absolute;right:2px;bottom:2px;width:16px;height:16px;cursor:nwse-resize;border-bottom-right-radius:8px;background:linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 0 0 / 8px 8px,linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 4px 4px / 8px 8px;touch-action:none}.plenio-overlay .plenio-dialog.maximized{border-radius:6px}.plenio-overlay .splitter{flex:none;background:transparent;touch-action:none}.plenio-overlay .splitter.horizontal{height:10px;margin:-3px 0;cursor:ns-resize;border-radius:5px}.plenio-overlay .splitter.vertical{width:10px;margin:0 -3px;cursor:ew-resize;border-radius:5px}.plenio-overlay .splitter:hover,.plenio-overlay .splitter:focus-visible{background:#4c9aff59;outline:none}.plenio-overlay .score-views>.splitter.horizontal{grid-row:1;align-self:end;height:10px;margin-bottom:-9px;z-index:2}.plenio-overlay .score-main>.splitter.vertical{grid-column:1;justify-self:end;align-self:stretch;width:10px;margin-right:-10px;z-index:2}.plenio-overlay header,.plenio-overlay footer,.plenio-overlay .doc-head{display:flex;align-items:center;gap:8px}.plenio-overlay header{padding:12px 16px;border-bottom:1px solid var(--border-color, #444)}.plenio-overlay header h2{margin:0;font-size:16px}.plenio-overlay .status{color:var(--descrip-text, #999)}.plenio-overlay .status.bad,.plenio-overlay .error{color:#e0685e}.plenio-overlay .spacer{flex:1}.plenio-overlay .body{overflow:auto;padding:8px 16px;flex:1;min-height:0}.plenio-overlay .hint{margin:8px 16px 0;color:var(--descrip-text, #999)}.plenio-overlay .doc{margin:10px 0 14px}.plenio-overlay .doc h3{margin:0;font-size:13px}.plenio-overlay .badge{font-size:11px;padding:1px 7px;border-radius:9px;background:var(--comfy-input-bg, #333);color:var(--descrip-text, #aaa)}.plenio-overlay .badge[data-state=edited],.plenio-overlay .badge[data-state="edited (merged)"]{background:#2f5f8a;color:#fff}.plenio-overlay .badge[data-state=manual]{background:#7a5a1e;color:#fff}.plenio-overlay .badge[data-state=conflict]{background:#8a2f2f;color:#fff}.plenio-overlay textarea,.plenio-overlay pre{box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border-radius:6px;border:1px solid var(--border-color, #444);background:var(--comfy-input-bg, #1b1b1b);color:var(--input-text, #ddd);font:inherit;resize:vertical}.plenio-overlay pre{white-space:pre-wrap;max-height:220px;overflow:auto}.plenio-overlay .mono,.plenio-overlay pre{font-family:var(--code-font, ui-monospace, monospace);font-size:12px}.plenio-overlay .conflict{margin-top:6px;padding:8px;border-radius:6px;background:#8a2f2f40}.plenio-overlay .findings{padding:4px 16px;max-height:22vh;overflow:auto;border-top:1px solid var(--border-color, #444)}.plenio-overlay .findings ul{margin:6px 0;padding-left:18px}.plenio-overlay .arrangement{margin:6px 0}.plenio-overlay .arrangement p{margin:4px 0}.plenio-overlay .arrangement[data-status=fallback] strong{color:#d8a31a}.plenio-overlay .arrangement summary{cursor:pointer}.plenio-overlay .arrangement .experimental{display:inline-block;margin:0 4px;padding:0 6px;border:1px solid #d8a31a;border-radius:8px;color:#d8a31a;font-size:.85em;line-height:1.5}.plenio-overlay .arrangement .idea,.plenio-overlay .arrangement .kept{color:var(--descrip-text, #999)}.plenio-overlay li[data-severity=error] strong{color:#e0685e}.plenio-overlay li[data-severity=warning] strong{color:#d8a31a}.plenio-overlay li[data-severity=info],.plenio-overlay .where{color:var(--descrip-text, #999)}.plenio-overlay .arrangement .where{margin:0 6px}.plenio-overlay footer{padding:10px 16px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .facts{color:var(--descrip-text, #999)}.plenio-overlay button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);cursor:pointer}.plenio-overlay button:disabled{opacity:.45;cursor:default}.plenio-overlay button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button.icon{margin-left:auto;font-size:18px;line-height:1;padding:2px 8px}.plenio-overlay .asr{margin:4px 0;font-size:12px;color:var(--descrip-text, #aaa);display:flex;flex-wrap:wrap;gap:8px}.plenio-overlay .asr mark{background:#e6b43c4d;color:inherit;border-radius:3px;padding:0 3px;margin-right:3px}.plenio-overlay .diff{font-family:var(--plenio-mono, ui-monospace, monospace);font-size:12px;line-height:1.5;white-space:normal}.plenio-overlay .diff ins{background:#50aa5a4d;text-decoration:none}.plenio-overlay .diff del{background:#c846464d}.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .sections th,.plenio-overlay .sections td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .tabs{display:flex;gap:4px;margin-left:12px;flex:1}.plenio-overlay .tabs button{border-radius:6px 6px 0 0;border-bottom-color:transparent}.plenio-overlay .tabs button.active{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button:focus-visible,.plenio-overlay input:focus-visible,.plenio-overlay select:focus-visible,.plenio-overlay textarea:focus-visible,.plenio-overlay .notation-wrap:focus-visible{outline:2px solid #4c9aff;outline-offset:1px}.plenio-overlay .confirm{margin:8px 16px 0;padding:8px 10px;border:1px solid #c79a3a;border-radius:6px;display:flex;gap:8px;align-items:center}.plenio-overlay .link{border:none;background:none;padding:0 2px;color:#6fa8dc;text-decoration:underline;cursor:pointer}.plenio-overlay .facts.ok{color:#6fbf73}.plenio-overlay .facts.bad,.plenio-overlay .bad{color:#e0685e}.plenio-overlay .score-tab{display:flex;flex-direction:column;gap:6px}.plenio-overlay .palette,.plenio-overlay .view-tools,.plenio-overlay .transport{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.plenio-overlay .score-tab>.transport{padding:4px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #2a2a2a)}.plenio-overlay .score-tab>.transport>button:first-child{min-width:78px;font-weight:600}.plenio-overlay .palette .group{display:flex;align-items:center;gap:3px;padding-right:10px;border-right:1px solid var(--border-color, #444)}.plenio-overlay .palette .group:last-child{border-right:none}.plenio-overlay .palette .whole summary{cursor:pointer}.plenio-overlay .whole-tools{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.plenio-overlay input.chord{width:110px}.plenio-overlay input.tempo{width:60px}.plenio-overlay input,.plenio-overlay select{background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);border:1px solid var(--border-color, #555);border-radius:5px;padding:2px 5px}.plenio-overlay input[type=checkbox],.plenio-overlay input[type=range]{padding:0}.plenio-overlay .score-main{display:grid;grid-template-columns:var(--plenio-side-w, 230px) minmax(0,1fr);gap:10px;height:max(380px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 330px))}.plenio-overlay .score-main>.side{grid-area:1 / 1}.plenio-overlay .score-main>.splitter.vertical{grid-area:1 / 1;justify-self:end}.plenio-overlay .score-main>.score-views{grid-area:1 / 2}.plenio-overlay .score-main>.inspector{grid-area:1 / 3}.plenio-overlay .score-main.with-roll{height:max(260px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 620px))}.plenio-overlay .score-views{display:grid;grid-template-rows:minmax(0,3fr) minmax(0,2fr);gap:8px;min-width:0;min-height:0}.plenio-overlay .score-views.split{grid-template-rows:minmax(0,var(--plenio-notation-fr, 3fr)) minmax(0,var(--plenio-text-fr, 2fr))}.plenio-overlay .score-main[data-text=hidden] .score-views{grid-template-rows:minmax(0,1fr)}.plenio-overlay .score-main.with-inspector{grid-template-columns:var(--plenio-side-w, 210px) minmax(0,1fr) 250px}.plenio-overlay .score-main .side{display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}.plenio-overlay .fit-panel summary{cursor:pointer;color:var(--descrip-text, #aaa)}.plenio-overlay .lyrics-follow{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;font-size:12px}.plenio-overlay .lyrics-follow label{display:flex;gap:6px;align-items:center}.plenio-overlay .lyrics-follow .hint{margin:4px 0 0;color:var(--descrip-text, #999)}.plenio-overlay .lyrics-follow .hint.changed{color:#e8c46a}.plenio-overlay .view-tools .layouts{display:inline-flex;gap:2px}.plenio-overlay .view-tools .layouts button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector{overflow:auto;min-height:0;padding:6px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);display:flex;flex-direction:column;gap:10px}.plenio-overlay .inspector .panel{display:flex;flex-direction:column;gap:5px}.plenio-overlay .inspector .panel+.panel{border-top:1px solid var(--border-color, #444);padding-top:8px}.plenio-overlay .inspector h4{margin:0;font-size:13px}.plenio-overlay .inspector h4 .facts{font-weight:400;margin-left:4px}.plenio-overlay .inspector .field{display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px}.plenio-overlay .inspector .field .name{width:44px;color:var(--descrip-text, #aaa)}.plenio-overlay .inspector button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector input.number{width:56px}.plenio-overlay .inspector input.pitch,.plenio-overlay .inspector input.meter{width:58px}.plenio-overlay .inspector input.chord{width:110px}.plenio-overlay .notation-wrap{position:relative;overflow:auto;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);color:var(--input-text, #e6e6e6);min-height:0}.plenio-overlay .notation-wrap.stale .notation{opacity:.45}.plenio-overlay .stale-note{position:sticky;top:0;margin:0;padding:4px 8px;background:#5a2626;color:#fff;z-index:1}.plenio-overlay .roll{display:flex;flex-direction:column;gap:4px;outline:none}.plenio-overlay .roll:focus-visible .roll-scroll{border-color:#4c9aff}.plenio-overlay .roll-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px}.plenio-overlay .roll-tools .group{display:flex;align-items:center;gap:3px}.plenio-overlay .roll-tools button.active.vocal{background:#2d5d9f;color:#fff}.plenio-overlay .roll-tools button.active.ins{background:#a0612a;color:#fff}.plenio-overlay .roll-tools button.mode{display:inline-flex;align-items:center;gap:4px}.plenio-overlay .roll-tools button.mode .icon{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}.plenio-overlay .roll-tools button.mode.active{background:#4a4f58;color:#fff;box-shadow:inset 0 0 0 1px #9ecbff}.plenio-overlay .roll-tools .hint{color:var(--descrip-text, #999);font-size:11px}.plenio-overlay .roll-scroll{position:relative;overflow:auto;overscroll-behavior:contain;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);user-select:none}.plenio-overlay .roll.stale .roll-svg{opacity:.45}.plenio-overlay .roll-svg{display:block;touch-action:none}.plenio-overlay .roll.mode-draw:not(.readonly,.stale) .roll-svg{cursor:crosshair}.plenio-overlay .roll-svg .roll-top,.plenio-overlay .roll-svg .keys{cursor:default}.plenio-overlay .roll-svg .band{fill:#9ecbff1f;stroke:#9ecbff;stroke-dasharray:4 3;pointer-events:none}.plenio-overlay .roll-svg .ruler{fill:transparent;cursor:pointer}.plenio-overlay .roll-svg .ruler:hover{fill:#ffffff0d}.plenio-overlay .roll-svg line.locator,.plenio-overlay .roll-svg .locator-mark line{stroke:#f4f6fa;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .locator-mark path{fill:#f4f6fa}.plenio-overlay .roll-svg line.playhead{stroke:#57d68d;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .row{fill:#ffffff06}.plenio-overlay .roll-svg .row.black{fill:#00000038}.plenio-overlay .roll-svg .row.c{fill:#ffffff0f}.plenio-overlay .roll-svg .lane{fill:#ffffff0a}.plenio-overlay .roll-svg line.bar{stroke:#ffffff59}.plenio-overlay .roll-svg line.beat{stroke:#ffffff1a}.plenio-overlay .roll-svg text{font-size:10px;fill:var(--descrip-text, #aaa);pointer-events:none}.plenio-overlay .roll-svg .section-label{fill:#9ecbff;font-style:italic}.plenio-overlay .roll-svg .note{cursor:grab;stroke:#00000080}.plenio-overlay .roll-svg .note.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .note.ins{fill:#f0a35e}.plenio-overlay .roll-svg .note.selected{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .note.playing{fill:#ffd84c}.plenio-overlay .roll-svg .note.dragged,.plenio-overlay .roll-svg .chord.dragged{opacity:.3}.plenio-overlay .roll-svg .ghost{fill-opacity:.55;stroke:#fff;stroke-dasharray:3 2;pointer-events:none}.plenio-overlay .roll-svg .ghost.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .ghost.ins{fill:#f0a35e}.plenio-overlay .roll-svg .chord rect{fill:#9ecbff2e;stroke:#9ecbff80;cursor:grab}.plenio-overlay .roll-svg .chord text{fill:var(--input-text, #e6e6e6);font-size:11px}.plenio-overlay .roll-svg .chord.selected rect{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .chord.ghost rect{stroke-dasharray:3 2}.plenio-overlay .roll-svg .keys-bg{fill:var(--comfy-menu-bg, #252525)}.plenio-overlay .roll-svg .top-bg{fill:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .roll.readonly .roll-svg .note,.plenio-overlay .roll.stale .roll-svg .note{cursor:default}.plenio-overlay .roll-scroll .chord-edit{position:absolute;width:80px;height:20px;font-size:11px}.plenio-overlay .roll-svg .lyrics-lane{fill:#4c9aff0f}.plenio-overlay .roll-svg .lyric-line rect{fill:#4c9aff29;stroke:#4c9aff73}.plenio-overlay .roll-svg .lyric-line.unsung rect{fill:transparent;stroke-dasharray:3 2}.plenio-overlay .roll-svg .lyric-line text{fill:var(--input-text, #e6e6e6);font-size:11px;font-style:italic}.plenio-overlay .roll-svg .lyric-line{cursor:grab}.plenio-overlay .roll-svg .lyric-line.selected rect{fill:#4c9aff6b;stroke:#4c9aff;stroke-width:1.5}.plenio-overlay .roll-svg .lyric-line.dragged rect{stroke-dasharray:4 2}.plenio-overlay .roll-svg .lyric-line rect.edge{fill:#4c9aff8c;stroke:none;cursor:ew-resize}.plenio-overlay .roll-svg .source-lane{fill:#96be9612;cursor:pointer}.plenio-overlay .roll-svg .source-wave{stroke:#8cc88cbf;stroke-width:1.2;fill:none;pointer-events:none}.plenio-overlay .roll-svg .source-missing{fill:#e0685e14;stroke:#e0685e59;stroke-dasharray:3 3}.plenio-overlay .roll-svg .source-label{fill:#a0d2a0e6;font-size:9px;pointer-events:none}.plenio-overlay .transport .hear{display:inline-flex;align-items:center;gap:2px}.plenio-overlay .transport .hear button.active{background:#2f6fd0;color:#fff}.plenio-overlay .transport .hear .level input{width:70px;vertical-align:middle}.plenio-overlay .roll-svg text.note-name{fill:#0a121ed9;font-size:8px;font-weight:600;pointer-events:none}.plenio-overlay .roll-svg text.syllable{fill:#9ecbff;font-size:9px;pointer-events:none}.plenio-overlay .roll-scroll .lyric-edit{position:absolute;width:280px;height:20px;font-size:11px}.plenio-overlay .roll-note{margin:0;color:var(--descrip-text, #999)}.plenio-overlay .gate{margin:4px 0;padding:4px 8px;border-left:3px solid #e0685e;background:#e0685e1f}.plenio-overlay .gate button{margin-left:8px}.plenio-overlay .notation svg .plenio-selected,.plenio-overlay .notation svg .plenio-selected path{fill:#4c9aff!important}.plenio-overlay .notation svg .plenio-playing,.plenio-overlay .notation svg .plenio-playing path{fill:#6fbf73!important}.plenio-overlay .notation svg .abcjs-note,.plenio-overlay .notation svg .abcjs-rest{cursor:pointer}.plenio-overlay .notation svg .abcjs-lyric{fill:#9ecbff}.plenio-overlay .abc-editor{min-height:0;overflow:hidden}.plenio-overlay .abc-editor .cm-editor{height:100%}.plenio-overlay .navigator{display:flex;flex-direction:column;gap:8px;flex:none}.plenio-overlay .navigator ol.sections{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.plenio-overlay .navigator li{padding:4px 6px;border-radius:6px;border:1px solid var(--border-color, #444)}.plenio-overlay .navigator li.current{border-color:#2f6fb0}.plenio-overlay .navigator:focus-visible{outline:1px solid #4c9aff}.plenio-overlay .navigator li.picked{background:#4c9aff2e;border-color:#4c9aff}.plenio-overlay .navigator li[draggable=true]{cursor:grab}.plenio-overlay .navigator li.drop-before{box-shadow:0 -3px #ffc440}.plenio-overlay .navigator li.drop-after{box-shadow:0 3px #ffc440}.plenio-overlay .navigator .section-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:2px 0 4px}.plenio-overlay .navigator .section-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .section-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .section-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .navigator .section-head{display:flex;flex-direction:column;cursor:pointer}.plenio-overlay .navigator .section-tools{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.plenio-overlay .navigator .section-tools button,.plenio-overlay .navigator .split button{font-size:11px;padding:1px 6px}.plenio-overlay .navigator input.rename{width:100%}.plenio-overlay .navigator .split input{width:90px}.plenio-overlay .bar-strip{display:flex;flex-wrap:wrap;gap:2px}.plenio-overlay .bar-strip .bar{min-width:26px;font-size:10px;padding:1px 2px;border-radius:3px}.plenio-overlay .bar-strip .bar.alt{background:#2c3440}.plenio-overlay .bar-strip .bar.selected{background:#2f6fb0;color:#fff}.plenio-overlay .bar-strip .bar.picked{background:#4c9aff59;outline:1px solid #4c9aff}.plenio-overlay .bar-strip .bar[draggable=true]{cursor:grab}.plenio-overlay .bar-strip .bar.drop-before{box-shadow:-3px 0 #ffc440}.plenio-overlay .bar-strip .bar.drop-after{box-shadow:3px 0 #ffc440}.plenio-overlay .navigator .bar-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding-top:6px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .navigator .bar-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .bar-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .bar-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .bar-strip .bar.error{border-color:#e0685e;color:#e0685e}.plenio-overlay .status{display:flex;flex-wrap:wrap;gap:10px;margin:0}.plenio-overlay .status .change{color:#6fbf73}.plenio-overlay .diagnostics{margin:0;padding-left:18px}.plenio-overlay .lyrics-fit table,.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .lyrics-fit th,.plenio-overlay .lyrics-fit td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .lyrics-fit tr.mismatch td{color:#e0685e}.plenio-overlay .lyrics-fit h4{margin:8px 0 4px;font-size:12px}.plenio-overlay .midi-dialog{width:min(720px,92vw);height:auto;max-height:min(700px,92vh)}.plenio-overlay .midi-dialog .body h3{margin:14px 0 4px;font-size:13px}.plenio-overlay .midi-dialog .tracks{border-collapse:collapse;width:100%}.plenio-overlay .midi-dialog .tracks th,.plenio-overlay .midi-dialog .tracks td{text-align:left;padding:3px 12px 3px 0;border-bottom:1px solid var(--border-color, #3a3a3a)}.plenio-overlay .midi-dialog .tracks .number{display:inline-block;min-width:18px;color:var(--descrip-text, #999)}.plenio-overlay .midi-dialog .controls{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin:10px 0 0}.plenio-overlay .midi-dialog .report{margin:4px 0;padding-left:18px;color:var(--descrip-text, #bbb)}.plenio-overlay .midi-tools{display:inline-flex;gap:4px}.plenio-overlay .hidden-file{display:none}.plenio-overlay .track-panel{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;background:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .track-panel h4{margin:0 0 4px;font-size:13px}.plenio-overlay .track-panel ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}.plenio-overlay .track-panel li{display:grid;grid-template-columns:8px minmax(0,1fr) auto auto;grid-template-areas:"dot name count play" "dot destination destination clear" "dot sound sound sound";align-items:center;column-gap:6px;row-gap:1px;font-size:12px}.plenio-overlay .track-panel .dot{grid-area:dot;width:8px;height:8px;border-radius:50%}.plenio-overlay .track-panel .track-name{grid-area:name;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-overlay .track-panel .count{grid-area:count}.plenio-overlay .track-panel .play{grid-area:play;display:flex;align-items:center}.plenio-overlay .track-panel .play input{margin:0}.plenio-overlay .track-panel button.link{grid-area:clear}.plenio-overlay .track-panel .destination{grid-area:destination}.plenio-overlay .track-panel .destination,.plenio-overlay .track-panel .count{color:var(--descrip-text, #999);font-size:11px;white-space:nowrap}.plenio-overlay .track-panel select.sound{grid-area:sound;min-width:0;font-size:11px;padding:1px 2px}.plenio-overlay .track-panel .destination.unsent{color:#d8a31a}.plenio-overlay .track-panel li.guide{border-top:1px dashed var(--border-color, #444);padding-top:3px}.plenio-overlay .track-panel .hint{margin:6px 0 0;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .keys-help{position:relative}.plenio-overlay .keys-panel{position:absolute;z-index:30;top:26px;left:0;width:560px;max-height:60vh;overflow:auto;padding:8px 12px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .keys-panel .close{float:right}.plenio-overlay .keys-panel h5{margin:6px 0 2px}.plenio-overlay .keys-panel table{border-collapse:collapse;width:100%;font-size:12px}.plenio-overlay .keys-panel th{width:210px;text-align:left;white-space:nowrap;padding:1px 10px 1px 0;color:var(--input-text, #ddd);font-weight:600}.plenio-overlay .keys-panel td{color:var(--descrip-text, #aaa)}.plenio-overlay .transport .align{position:relative}.plenio-overlay .transport .align>button.active{border-color:#d6a14a;color:#f0c27a}.plenio-overlay .transport .align-panel{position:absolute;z-index:30;bottom:30px;left:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;width:460px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .align-panel .facts{flex-basis:100%;margin-bottom:4px}.plenio-overlay .roll-svg .sung-pitch{fill:none;stroke:#ff5fa2;stroke-width:1.6;stroke-linejoin:round;opacity:.85;pointer-events:none}.plenio-overlay .roll-tools label.unavailable{opacity:.55}.plenio-overlay .transport .record{display:inline-flex;align-items:center;gap:3px;position:relative}.plenio-overlay .transport .record .rec{color:#ff6b6b;font-weight:600}.plenio-overlay .transport .record .rec.on{background:#c62828;color:#fff;border-color:#ff6b6b}.plenio-overlay .transport .record .rec.counting{animation:plenio-blink .5s steps(2,start) infinite}@keyframes plenio-blink{to{opacity:.35}}.plenio-overlay .transport .record .step.on{background:#6a4fb3;color:#fff}.plenio-overlay .transport .midi-light{display:inline-block;width:8px;height:8px;border-radius:50%;background:#555}.plenio-overlay .transport .midi-light.ready{background:#2e7d32}.plenio-overlay .transport .midi-light.active{background:#7cfc00;box-shadow:0 0 6px #7cfc00}.plenio-overlay .transport .midi-settings{position:relative}.plenio-overlay .transport .midi-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:320px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .midi-panel .close{justify-self:end}.plenio-overlay .transport .midi-panel strong{margin-top:4px}.plenio-overlay .notation-export{position:relative;display:inline-flex}.plenio-overlay .notation-export .export-panel{position:absolute;z-index:30;top:calc(100% + 4px);left:0;display:grid;gap:6px;width:260px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .notation-export .export-panel .close{justify-self:end}.plenio-overlay .notation-export .formats{display:flex;gap:6px;flex-wrap:wrap}.plenio-overlay .transport .sounds-settings{position:relative}.plenio-overlay .transport .sounds-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:340px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .transport .sounds-panel .close{justify-self:end}.plenio-overlay .transport .sounds-panel strong{margin-top:4px}.plenio-overlay .transport .sounds-panel .row{display:flex;align-items:center;gap:6px}.plenio-overlay .transport .sounds-panel .row select,.plenio-overlay .transport .sounds-panel .row input{flex:1;min-width:0}.plenio-overlay .transport .sounds-panel .track{width:74px;flex:none}.plenio-overlay .roll-svg .rec-note{fill:#e53935d9;stroke:#ffcdd2;stroke-width:1;pointer-events:none}', c1 = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"];
function h1(n, e) {
  const t = `[${e}]`, i = n.replace(/\s+$/, "");
  return i ? i.split(`
`).some((s) => s.trim() === t) ? n : `${i}

${t}
` : `${t}
`;
}
const Zo = `
`;
function nf(n) {
  const e = [];
  return n.replace(/\r\n?/g, `
`).split(`
`).forEach((t, i) => {
    i > 0 && e.push(Zo), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function f1(n, e) {
  const t = nf(n), i = nf(e), s = t.length + 1, o = i.length + 1, r = new Array(s * o).fill(0);
  for (let h = t.length - 1; h >= 0; h--)
    for (let f = i.length - 1; f >= 0; f--)
      r[h * o + f] = t[h] === i[f] ? r[(h + 1) * o + f + 1] + 1 : Math.max(r[(h + 1) * o + f], r[h * o + f + 1]);
  const l = [], a = (h, f) => {
    const d = l[l.length - 1];
    d && d.op === h && f !== Zo && !d.text.endsWith(Zo) ? d.text += ` ${f}` : l.push({ op: h, text: f });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < i.length; )
    u < t.length && c < i.length && t[u] === i[c] ? (a("same", t[u]), u++, c++) : c < i.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", i[c++]) : a("removed", t[u++]);
  return l;
}
function d1(n) {
  return n.filter((e) => e.op !== "same" && e.text !== Zo).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const p1 = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, g1 = {
  key: 0,
  class: "error"
}, m1 = { key: 1 }, v1 = {
  key: 0,
  class: "bad"
}, sg = /* @__PURE__ */ Qt({
  __name: "LyricsFit",
  props: {
    lyrics: {},
    abc: {},
    fetcher: {},
    engine: {},
    instrumental: { type: Boolean }
  },
  setup(n) {
    const e = n, t = /* @__PURE__ */ G(null), i = /* @__PURE__ */ G(null);
    let s, o = 0;
    async function r() {
      const a = ++o;
      try {
        const u = await Zv(e.fetcher, {
          lyrics: e.lyrics,
          abc: e.abc ?? void 0,
          engine: e.engine,
          instrumental: e.instrumental
        });
        a === o && (t.value = u, i.value = null);
      } catch (u) {
        a === o && (i.value = u instanceof Error ? u.message : String(u));
      }
    }
    Ge(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), $i(() => clearTimeout(s));
    const l = N(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", h = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: h };
      })
    );
    return (a, u) => n.abc ? (w(), M("section", p1, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      i.value ? (w(), M("p", g1, F(i.value), 1)) : l.value.length ? (w(), M("table", m1, [
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
          (w(!0), M(me, null, Be(l.value, (c, h) => (w(), M("tr", {
            key: h,
            class: qe({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + F(c.tag) + "]", 1),
            p("td", null, [
              ye(F(c.score_section ?? "—"), 1),
              c.mismatch ? (w(), M("span", v1, " ≠")) : ee("", !0)
            ]),
            p("td", null, F(c.lines), 1),
            p("td", null, F(c.syllables), 1),
            p("td", null, F(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: qe({ bad: c.fit && c.fit !== "fits" })
            }, F(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : ee("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : ee("", !0);
  }
});
function y1(n) {
  const e = new Set((n.elements ?? []).map((i) => i.id)), t = n.model?.tracks;
  if (t) for (const i of [...t.vocal, ...t.ins, ...t.chords]) e.add(i.id);
  return e;
}
function b1(n, e) {
  const t = n?.model?.tracks, i = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = i.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const sf = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function bu(n, e) {
  const t = sf.indexOf(n);
  return t < 0 ? null : sf[t + e] ?? null;
}
function x1(n, e, t) {
  const i = n.elements ?? [], s = i.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of i) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function w1(n, e) {
  const t = n.elements ?? [];
  return t.find((i) => i.source[0] <= e && e < i.source[1]) ?? t.find((i) => i.source[1] === e) ?? null;
}
function xs(n, e) {
  return !n || !e ? null : (n.elements ?? []).find((t) => t.id === e) ?? null;
}
function k1(n, e, t) {
  const i = xs(n, e);
  if (!i) return null;
  const s = (n.elements ?? []).filter((r) => r.voice === i.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function S1(n, e) {
  const t = xs(n, e);
  if (!t) return null;
  const i = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (n.elements ?? []).find(
    (s) => s.voice === i && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function C1(n, e, t = "Vocal") {
  return (n.elements ?? []).find((i) => i.bar === e && i.voice === t) ?? null;
}
function xu(n, e) {
  const t = n.sections.findIndex((i) => i.start_bar <= e && e < i.start_bar + i.bars);
  return t < 0 ? 0 : t;
}
const M1 = {
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
function A1(n, e = "1/16") {
  if (!n) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), i = M1[n.units * t] ?? `${n.units} units`, s = n.kind === "note" ? `${n.name}${n.tie_out ? " (tied)" : ""}` : "rest", o = n.chord ? `, chord ${n.chord}` : "";
  return `${n.voice} bar ${n.bar}: ${s}, ${n.kind === "bar_rest" ? "whole bar" : i}${o}`;
}
function ol(n) {
  const e = Math.max(0, n), t = Math.floor(e / 60), i = Math.floor(e - t * 60);
  return `${t}:${String(i).padStart(2, "0")}`;
}
let wu = [], og = [];
(() => {
  let n = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < n.length; e++)
    (e % 2 ? og : wu).push(t = t + n[e]);
})();
function T1(n) {
  if (n < 768) return !1;
  for (let e = 0, t = wu.length; ; ) {
    let i = e + t >> 1;
    if (n < wu[i]) t = i;
    else if (n >= og[i]) e = i + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function of(n) {
  return n >= 127462 && n <= 127487;
}
const rf = 8205;
function $1(n, e, t = !0, i = !0) {
  return (t ? rg : D1)(n, e, i);
}
function rg(n, e, t) {
  if (e == n.length) return e;
  e && lg(n.charCodeAt(e)) && ag(n.charCodeAt(e - 1)) && e--;
  let i = Ha(n, e);
  for (e += lf(i); e < n.length; ) {
    let s = Ha(n, e);
    if (i == rf || s == rf || t && T1(s))
      e += lf(s), i = s;
    else if (of(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && of(Ha(n, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function D1(n, e, t) {
  for (; e > 1; ) {
    let i = rg(n, e - 2, t);
    if (i < e) return i;
    e--;
  }
  return 0;
}
function Ha(n, e) {
  let t = n.charCodeAt(e);
  if (!ag(t) || e + 1 == n.length) return t;
  let i = n.charCodeAt(e + 1);
  return lg(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function lg(n) {
  return n >= 56320 && n < 57344;
}
function ag(n) {
  return n >= 55296 && n < 56320;
}
function lf(n) {
  return n < 65536 ? 1 : 2;
}
class nt {
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
  replace(e, t, i) {
    [e, t] = Qs(this, e, t);
    let s = [];
    return this.decompose(
      0,
      e,
      s,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      s,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      s,
      1
      /* Open.From */
    ), si.from(s, this.length - (t - e) + i.length);
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
    [e, t] = Qs(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), si.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), s = new _o(this), o = new _o(e);
    for (let r = t, l = t; ; ) {
      if (s.next(r), o.next(r), r = 0, s.lineBreak != o.lineBreak || s.done != o.done || s.value != o.value)
        return !1;
      if (l += s.value.length, s.done || l >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new _o(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new ug(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let s = this.line(e).from;
      i = this.iterRange(s, Math.max(s, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new cg(i);
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
    return e.length == 1 && !e[0] ? nt.empty : e.length <= 32 ? new Et(e) : si.from(Et.split(e, []));
  }
}
class Et extends nt {
  constructor(e, t = O1(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, s) {
    for (let o = 0; ; o++) {
      let r = this.text[o], l = s + r.length;
      if ((t ? i : l) >= e)
        return new L1(s, l, i, r);
      s = l + 1, i++;
    }
  }
  decompose(e, t, i, s) {
    let o = e <= 0 && t >= this.length ? this : new Et(af(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = i.pop(), l = rl(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        i.push(new Et(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        i.push(new Et(l.slice(0, a)), new Et(l.slice(a)));
      }
    } else
      i.push(o);
  }
  replace(e, t, i) {
    if (!(i instanceof Et))
      return super.replace(e, t, i);
    [e, t] = Qs(this, e, t);
    let s = rl(this.text, rl(i.text, af(this.text, 0, e)), t), o = this.length + i.length - (t - e);
    return s.length <= 32 ? new Et(s, o) : si.from(Et.split(s, []), o);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = Qs(this, e, t);
    let s = "";
    for (let o = 0, r = 0; o <= t && r < this.text.length; r++) {
      let l = this.text[r], a = o + l.length;
      o > e && r && (s += i), e < a && t > o && (s += l.slice(Math.max(0, e - o), t - o)), o = a + 1;
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
    let i = [], s = -1;
    for (let o of e)
      i.push(o), s += o.length + 1, i.length == 32 && (t.push(new Et(i, s)), i = [], s = -1);
    return s > -1 && t.push(new Et(i, s)), t;
  }
}
class si extends nt {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, s) {
    for (let o = 0; ; o++) {
      let r = this.children[o], l = s + r.length, a = i + r.lines - 1;
      if ((t ? a : l) >= e)
        return r.lineInner(e, t, i, s);
      s = l + 1, i = a + 1;
    }
  }
  decompose(e, t, i, s) {
    for (let o = 0, r = 0; r <= t && o < this.children.length; o++) {
      let l = this.children[o], a = r + l.length;
      if (e <= a && t >= r) {
        let u = s & ((r <= e ? 1 : 0) | (a >= t ? 2 : 0));
        r >= e && a <= t && !u ? i.push(l) : l.decompose(e - r, t - r, i, u);
      }
      r = a + 1;
    }
  }
  replace(e, t, i) {
    if ([e, t] = Qs(this, e, t), i.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, i), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new si(c, this.length - (t - e) + i.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = Qs(this, e, t);
    let s = "";
    for (let o = 0, r = 0; o < this.children.length && r <= t; o++) {
      let l = this.children[o], a = r + l.length;
      r > e && o && (s += i), e < a && t > r && (s += l.sliceString(e - r, t - r, i)), r = a + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof si))
      return 0;
    let i = 0, [s, o, r, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; s += t, o += t) {
      if (s == r || o == l)
        return i;
      let a = this.children[s], u = e.children[o];
      if (a != u)
        return i + a.scanIdentical(u, t);
      i += a.length + 1;
    }
  }
  static from(e, t = e.reduce((i, s) => i + s.length + 1, -1)) {
    let i = 0;
    for (let d of e)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let g of e)
        g.flatten(d);
      return new Et(d, t);
    }
    let s = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function h(d) {
      let g;
      if (d.lines > o && d instanceof si)
        for (let v of d.children)
          h(v);
      else d.lines > r && (a > r || !a) ? (f(), l.push(d)) : d instanceof Et && a && (g = c[c.length - 1]) instanceof Et && d.lines + g.lines <= 32 ? (a += d.lines, u += d.length + 1, c[c.length - 1] = new Et(g.text.concat(d.text), g.length + 1 + d.length)) : (a + d.lines > s && f(), a += d.lines, u += d.length + 1, c.push(d));
    }
    function f() {
      a != 0 && (l.push(c.length == 1 ? c[0] : si.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let d of e)
      h(d);
    return f(), l.length == 1 ? l[0] : new si(l, t);
  }
}
nt.empty = /* @__PURE__ */ new Et([""], 0);
function O1(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function rl(n, e, t = 0, i = 1e9) {
  for (let s = 0, o = 0, r = !0; o < n.length && s <= i; o++) {
    let l = n[o], a = s + l.length;
    a >= t && (a > i && (l = l.slice(0, i - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function af(n, e, t) {
  return rl(n, [""], e, t);
}
class _o {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof Et ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, s = this.nodes[i], o = this.offsets[i], r = o >> 1, l = s instanceof Et ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof Et) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof Et ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class ug {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new _o(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: s } = this.cursor.next(e);
    return this.pos += (s.length + e) * t, this.value = s.length <= i ? s : t < 0 ? s.slice(s.length - i) : s.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class cg {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: s } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = s, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (nt.prototype[Symbol.iterator] = function() {
  return this.iter();
}, _o.prototype[Symbol.iterator] = ug.prototype[Symbol.iterator] = cg.prototype[Symbol.iterator] = function() {
  return this;
});
class L1 {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.number = i, this.text = s;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
function Qs(n, e, t) {
  return e = Math.max(0, Math.min(n.length, e)), [e, Math.max(e, Math.min(n.length, t))];
}
function Jt(n, e, t = !0, i = !0) {
  return $1(n, e, t, i);
}
function E1(n) {
  return n >= 56320 && n < 57344;
}
function B1(n) {
  return n >= 55296 && n < 56320;
}
function I1(n, e) {
  let t = n.charCodeAt(e);
  if (!B1(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return E1(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function R1(n) {
  return n < 65536 ? 1 : 2;
}
const ku = /\r\n?|\n/;
var cn = /* @__PURE__ */ (function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
})(cn || (cn = {}));
class Ci {
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
      let i = this.sections[t + 1];
      e += i < 0 ? this.sections[t] : i;
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
    for (let t = 0, i = 0, s = 0; t < this.sections.length; ) {
      let o = this.sections[t++], r = this.sections[t++];
      r < 0 ? (e(i, s, o), s += o) : s += r, i += o;
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
    Su(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], s = this.sections[t++];
      s < 0 ? e.push(i, s) : e.push(s, i);
    }
    return new Ci(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : hg(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Cu(this, e, t);
  }
  mapPos(e, t = -1, i = cn.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (i != cn.Simple && u >= e && (i == cn.TrackDel && s < e && u > e || i == cn.TrackBefore && s < e || i == cn.TrackAfter && u > e))
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
    for (let i = 0, s = 0; i < this.sections.length && s <= t; ) {
      let o = this.sections[i++], r = this.sections[i++], l = s + o;
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
      let i = this.sections[t++], s = this.sections[t++];
      e += (e ? " " : "") + i + (s >= 0 ? ":" + s : "");
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
    return new Ci(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Ci(e);
  }
}
class Ht extends Ci {
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
    return Su(this, (t, i, s, o, r) => e = e.replace(s, s + (i - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return Cu(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let s = 0, o = 0; s < t.length; s += 2) {
      let r = t[s], l = t[s + 1];
      if (l >= 0) {
        t[s] = l, t[s + 1] = r;
        let a = s >> 1;
        for (; i.length < a; )
          i.push(nt.empty);
        i.push(r ? e.slice(o, o + r) : nt.empty);
      }
      o += r;
    }
    return new Ht(t, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : hg(this, e, !0);
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
    return e.empty ? this : Cu(this, e, t, !0);
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
    Su(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Ci.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], s = [], o = new Qo(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        qt(s, c, -1);
        let h = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        qt(t, c, h), h > 0 && zi(i, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        qt(t, c, -1), qt(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new Ht(t, i),
      filtered: Ci.create(s)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], s = this.sections[t + 1];
      s < 0 ? e.push(i) : s == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, i) {
    let s = [], o = [], r = 0, l = null;
    function a(c = !1) {
      if (!c && !s.length)
        return;
      r < t && qt(s, t - r, -1);
      let h = new Ht(s, o);
      l = l ? l.compose(h.map(l)) : h, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let h of c)
          u(h);
      else if (c instanceof Ht) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: h, to: f = h, insert: d } = c;
        if (h > f || h < 0 || f > t)
          throw new RangeError(`Invalid change range ${h} to ${f} (in doc of length ${t})`);
        let g = d ? typeof d == "string" ? nt.of(d.split(i || ku)) : d : nt.empty, v = g.length;
        if (h == f && v == 0)
          return;
        h < r && a(), h > r && qt(s, h - r, -1), qt(s, f - h, v), zi(o, s, g), r = f;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new Ht(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
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
          for (; i.length < s; )
            i.push(nt.empty);
          i[s] = nt.of(o.slice(1)), t.push(o[0], i[s].length);
        }
      }
    }
    return new Ht(t, i);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new Ht(e, t);
  }
}
function qt(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = n.length - 2;
  s >= 0 && t <= 0 && t == n[s + 1] ? n[s] += e : s >= 0 && e == 0 && n[s] == 0 ? n[s + 1] += t : i ? (n[s] += e, n[s + 1] += t) : n.push(e, t);
}
function zi(n, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < n.length)
    n[n.length - 1] = n[n.length - 1].append(t);
  else {
    for (; n.length < i; )
      n.push(nt.empty);
    n.push(t);
  }
}
function Su(n, e, t) {
  let i = n.inserted;
  for (let s = 0, o = 0, r = 0; r < n.sections.length; ) {
    let l = n.sections[r++], a = n.sections[r++];
    if (a < 0)
      s += l, o += l;
    else {
      let u = s, c = o, h = nt.empty;
      for (; u += l, c += a, a && i && (h = h.append(i[r - 2 >> 1])), !(t || r == n.sections.length || n.sections[r + 1] < 0); )
        l = n.sections[r++], a = n.sections[r++];
      e(s, u, o, c, h), s = u, o = c;
    }
  }
}
function Cu(n, e, t, i = !1) {
  let s = [], o = i ? [] : null, r = new Qo(n), l = new Qo(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      qt(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (qt(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (qt(s, 0, r.ins), o && zi(o, s, r.text), a = r.i), r.forward(c), u -= c;
      }
      l.next();
    } else if (r.ins >= 0) {
      let u = 0, c = r.len;
      for (; c; )
        if (l.ins == -1) {
          let h = Math.min(c, l.len);
          u += h, c -= h, l.forward(h);
        } else if (l.ins == 0 && l.len < c)
          c -= l.len, l.next();
        else
          break;
      qt(s, u, a < r.i ? r.ins : 0), o && a < r.i && zi(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? Ht.createSet(s, o) : Ci.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function hg(n, e, t = !1) {
  let i = [], s = t ? [] : null, o = new Qo(n), r = new Qo(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? Ht.createSet(i, s) : Ci.create(i);
    if (o.ins == 0)
      qt(i, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      qt(i, 0, r.ins, l), s && zi(s, i, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = i.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          qt(i, a, c, l), s && c && zi(s, i, r.text);
        } else r.ins == -1 ? (qt(i, o.off ? 0 : o.len, a, l), s && zi(s, i, o.textBit(a))) : (qt(i, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && zi(s, i, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || i.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class Qo {
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
    return t >= e.length ? nt.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? nt.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class Vi {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.flags = i, this.goalColumn = s;
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
    let i, s;
    return this.empty ? i = s = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), i == this.from && s == this.to ? this : new Vi(i, s, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, i = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return te.range(e, t, void 0, void 0, i);
    let s = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return te.range(this.anchor, s, void 0, void 0, i);
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
    return te.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, i, s) {
    return new Vi(e, t, i, s);
  }
}
class te {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : te.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
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
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(e.ranges[i], t))
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
    return this.ranges.length == 1 ? this : new te([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return te.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, te.create(i, this.mainIndex);
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
    return new te(e.ranges.map((t) => Vi.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new te([te.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, s = 0; s < e.length; s++) {
      let o = e[s];
      if (o.empty ? o.from <= i : o.from < i)
        return te.normalized(e.slice(), t);
      i = o.to;
    }
    return new te(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, i, s) {
    return Vi.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? Vi.create(t, e, r | 32, i) : Vi.create(e, t, r, i);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return Vi.create(e, t, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((s, o) => s.from - o.from), t = e.indexOf(i);
    for (let s = 1; s < e.length; s++) {
      let o = e[s], r = e[s - 1];
      if (o.empty ? o.from <= r.to : o.from < r.to) {
        let l = r.from, a = Math.max(o.to, r.to);
        s <= t && t--, e.splice(--s, 2, o.anchor > o.head ? te.range(a, l) : te.range(l, a));
      }
    }
    return new te(e, t);
  }
}
function fg(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let Dc = 0;
class we {
  constructor(e, t, i, s, o) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = s, this.id = Dc++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new we(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Oc), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new ll([], this, 0, e);
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
    return new ll(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new ll(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Oc(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class ll {
  constructor(e, t, i, s) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = s, this.id = Dc++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, s = this.facet.compareInput, o = this.id, r = e[o] >> 1, l = this.type == 2, a = !1, u = !1, c = [];
    for (let h of this.dependencies)
      h == "doc" ? a = !0 : h == "selection" ? u = !0 : (((t = e[h.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && c.push(e[h.id]);
    return {
      create(h) {
        return h.values[r] = i(h), 1;
      },
      update(h, f) {
        if (a && f.docChanged || u && (f.docChanged || f.selection) || Mu(h, c)) {
          let d = i(h);
          if (l ? !uf(d, h.values[r], s) : !s(d, h.values[r]))
            return h.values[r] = d, 1;
        }
        return 0;
      },
      reconfigure: (h, f) => {
        let d, g = f.config.address[o];
        if (g != null) {
          let v = Cl(f, g);
          if (this.dependencies.every((m) => m instanceof we ? f.facet(m) === h.facet(m) : m instanceof zn ? f.field(m, !1) == h.field(m, !1) : !0) || (l ? uf(d = i(h), v, s) : s(d = i(h), v)))
            return h.values[r] = v, 0;
        } else
          d = i(h);
        return h.values[r] = d, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function uf(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function Mu(n, e) {
  let t = !1;
  for (let i of e)
    No(n, i) & 1 && (t = !0);
  return t;
}
function P1(n, e, t) {
  let i = t.map((a) => n[a.id]), s = t.map((a) => a.type), o = i.filter((a) => !(a & 1)), r = n[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < i.length; c++) {
      let h = Cl(a, i[c]);
      if (s[c] == 2)
        for (let f of h)
          u.push(f);
      else
        u.push(h);
    }
    return e.combine(u);
  }
  return {
    create(a) {
      for (let u of i)
        No(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!Mu(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = Mu(a, i), h = u.config.facets[e.id], f = u.facet(e);
      if (h && !c && Oc(t, h))
        return a.values[r] = f, 0;
      let d = l(a);
      return e.compare(d, f) ? (a.values[r] = f, 0) : (a.values[r] = d, 1);
    }
  };
}
const Or = /* @__PURE__ */ we.define({ static: !0 });
class zn {
  constructor(e, t, i, s, o) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new zn(Dc++, e.create, e.update, e.compare || ((i, s) => i === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Or).find((i) => i.field == this);
    return (t?.create || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, s) => {
        let o = i.values[t], r = this.updateF(o, s);
        return this.compareF(o, r) ? 0 : (i.values[t] = r, 1);
      },
      reconfigure: (i, s) => {
        let o = i.facet(Or), r = s.facet(Or), l;
        return (l = o.find((a) => a.field == this)) && l != r.find((a) => a.field == this) ? (i.values[t] = l.create(i), 1) : s.config.address[this.id] != null ? (i.values[t] = s.field(this), 0) : (i.values[t] = this.create(i), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, Or.of({ field: this, create: e })];
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
const ds = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function yo(n) {
  return (e) => new dg(e, n);
}
const ta = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ yo(ds.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ yo(ds.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ yo(ds.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ yo(ds.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ yo(ds.lowest)
};
class dg {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class na {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new Au(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return na.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Au {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Sl {
  constructor(e, t, i, s, o, r) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = s, this.staticValues = o, this.facets = r, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let s = [], o = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ new Map();
    for (let f of _1(e, t, r))
      f instanceof zn ? s.push(f) : (o[f.facet.id] || (o[f.facet.id] = [])).push(f);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let f of s)
      l[f.id] = u.length << 1, u.push((d) => f.slot(d));
    let c = i?.config.facets;
    for (let f in o) {
      let d = o[f], g = d[0].facet, v = c && c[f] || [];
      if (d.every(
        (m) => m.type == 0
        /* Provider.Static */
      ))
        if (l[g.id] = a.length << 1 | 1, Oc(v, d))
          a.push(i.facet(g));
        else {
          let m = g.combine(d.map((b) => b.value));
          a.push(i && g.compare(m, i.facet(g)) ? i.facet(g) : m);
        }
      else {
        for (let m of d)
          m.type == 0 ? (l[m.id] = a.length << 1 | 1, a.push(m.value)) : (l[m.id] = u.length << 1, u.push((b) => m.dynamicSlot(b)));
        l[g.id] = u.length << 1, u.push((m) => P1(m, g, d));
      }
    }
    let h = u.map((f) => f(l));
    return new Sl(e, r, h, l, a, o);
  }
}
function _1(n, e, t) {
  let i = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = i[a].indexOf(r);
      u > -1 && i[a].splice(u, 1), r instanceof Au && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof Au) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof dg)
      o(r.inner, r.prec);
    else if (r instanceof zn)
      i[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof ll)
      i[l].push(r), r.facet.extensions && o(r.facet.extensions, ds.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(n, ds.default), i.reduce((r, l) => r.concat(l));
}
function No(n, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = n.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  n.status[t] = 4;
  let s = n.computeSlot(n, n.config.dynamicSlots[t]);
  return n.status[t] = 2 | s;
}
function Cl(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const pg = /* @__PURE__ */ we.define(), Tu = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), gg = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), mg = /* @__PURE__ */ we.define(), vg = /* @__PURE__ */ we.define(), yg = /* @__PURE__ */ we.define(), bg = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : !1
});
class co {
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
    return new N1();
  }
}
class N1 {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new co(this, e);
  }
}
class V1 {
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
    return new kt(this, e);
  }
}
class kt {
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
    return t === void 0 ? void 0 : t == this.value ? this : new kt(this.type, t);
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
    return new V1(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let s of e) {
      let o = s.map(t);
      o && i.push(o);
    }
    return i;
  }
}
kt.reconfigure = /* @__PURE__ */ kt.define();
kt.appendConfig = /* @__PURE__ */ kt.define();
class Zt {
  constructor(e, t, i, s, o, r) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, i && fg(i, t.newLength), o.some((l) => l.type == Zt.time) || (this.annotations = o.concat(Zt.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, i, s, o, r) {
    return new Zt(e, t, i, s, o, r);
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
    let t = this.annotation(Zt.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
Zt.time = /* @__PURE__ */ co.define();
Zt.userEvent = /* @__PURE__ */ co.define();
Zt.addToHistory = /* @__PURE__ */ co.define();
Zt.remote = /* @__PURE__ */ co.define();
function H1(n, e) {
  let t = [];
  for (let i = 0, s = 0; ; ) {
    let o, r;
    if (i < n.length && (s == e.length || e[s] >= n[i]))
      o = n[i++], r = n[i++];
    else if (s < e.length)
      o = e[s++], r = e[s++];
    else
      return t;
    !t.length || t[t.length - 1] < o ? t.push(o, r) : t[t.length - 1] < r && (t[t.length - 1] = r);
  }
}
function xg(n, e, t) {
  var i;
  let s, o, r;
  return t ? (s = e.changes, o = Ht.empty(e.changes.length), r = n.changes.compose(e.changes)) : (s = e.changes.map(n.changes), o = n.changes.mapDesc(e.changes, !0), r = n.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(s),
    effects: kt.mapEffects(n.effects, s).concat(kt.mapEffects(e.effects, o)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function $u(n, e, t) {
  let i = e.selection, s = Us(e.annotations);
  return e.userEvent && (s = s.concat(Zt.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof Ht ? e.changes : Ht.of(e.changes || [], t, n.facet(gg)),
    selection: i && (i instanceof te ? i : te.single(i.anchor, i.head)),
    effects: Us(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function wg(n, e, t) {
  let i = $u(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    i = xg(i, $u(n, e[o], r ? i.changes.newLength : n.doc.length), r);
  }
  let s = Zt.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return z1(t ? F1(s) : s);
}
function F1(n) {
  let e = n.startState, t = !0;
  for (let s of e.facet(mg)) {
    let o = s(n);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : H1(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = n.changes.invertedDesc, s = Ht.empty(e.doc.length);
    else {
      let r = n.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    n = Zt.create(e, s, n.selection && n.selection.map(o), kt.mapEffects(n.effects, o), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(vg);
  for (let s = i.length - 1; s >= 0; s--) {
    let o = i[s](n);
    o instanceof Zt ? n = o : Array.isArray(o) && o.length == 1 && o[0] instanceof Zt ? n = o[0] : n = wg(e, Us(o), !1);
  }
  return n;
}
function z1(n) {
  let e = n.startState, t = e.facet(yg), i = n;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](n);
    o && Object.keys(o).length && (i = xg(i, $u(e, o, n.changes.newLength), !0));
  }
  return i == n ? n : Zt.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const W1 = [];
function Us(n) {
  return n == null ? W1 : Array.isArray(n) ? n : [n];
}
var wi = /* @__PURE__ */ (function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
})(wi || (wi = {}));
const K1 = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Du;
try {
  Du = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function U1(n) {
  if (Du)
    return Du.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || K1.test(t)))
      return !0;
  }
  return !1;
}
function j1(n) {
  return (e) => {
    if (!/\S/.test(e))
      return wi.Space;
    if (U1(e))
      return wi.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return wi.Word;
    return wi.Other;
  };
}
class lt {
  constructor(e, t, i, s, o, r) {
    this.config = e, this.doc = t, this.selection = i, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      No(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return No(this, i), Cl(this, i);
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
    return wg(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: s } = t;
    for (let l of e.effects)
      l.is(na.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(kt.reconfigure) ? (t = null, i = l.value) : l.is(kt.appendConfig) && (t = null, i = Us(i).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Sl.resolve(i, s, this), o = new lt(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(Tu) ? e.newSelection : e.newSelection.asSingle();
    new lt(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: te.cursor(t.from + e.length, -1)
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
    let t = this.selection, i = e(t.ranges[0]), s = this.changes(i.changes), o = [i.range], r = Us(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let f = 0; f < l; f++)
        o[f] = o[f].map(c);
      let h = s.mapDesc(u, !0);
      o.push(a.range.map(h)), s = s.compose(c), r = kt.mapEffects(r, c).concat(kt.mapEffects(Us(a.effects), h));
    }
    return {
      changes: s,
      selection: te.create(o, t.mainIndex),
      effects: r
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof Ht ? e : Ht.of(e, this.doc.length, this.facet(lt.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return nt.of(e.split(this.facet(lt.lineSeparator) || ku));
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
    return t == null ? e.default : (No(this, t), Cl(this, t));
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
      for (let i in e) {
        let s = e[i];
        s instanceof zn && this.config.address[s.id] != null && (t[i] = s.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let s = [];
    if (i) {
      for (let o in i)
        if (Object.prototype.hasOwnProperty.call(e, o)) {
          let r = i[o], l = e[o];
          s.push(r.init((a) => r.spec.fromJSON(l, a)));
        }
    }
    return lt.create({
      doc: e.doc,
      selection: te.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Sl.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof nt ? e.doc : nt.of((e.doc || "").split(t.staticFacet(lt.lineSeparator) || ku)), s = e.selection ? e.selection instanceof te ? e.selection : te.single(e.selection.anchor, e.selection.head) : te.single(0);
    return fg(s, i.length), t.staticFacet(Tu) || (s = s.asSingle()), new lt(t, i, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(lt.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(lt.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(bg);
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
    for (let i of this.facet(lt.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, s) => {
      if (s == "$")
        return "$";
      let o = +(s || 1);
      return !o || o > t.length ? i : t[o - 1];
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
  languageDataAt(e, t, i = -1) {
    let s = [];
    for (let o of this.facet(pg))
      for (let r of o(this, t, i))
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
    return j1(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: i, length: s } = this.doc.lineAt(e), o = this.charCategorizer(e), r = e - i, l = e - i;
    for (; r > 0; ) {
      let a = Jt(t, r, !1);
      if (o(t.slice(a, r)) != wi.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = Jt(t, l);
      if (o(t.slice(l, a)) != wi.Word)
        break;
      l = a;
    }
    return r == l ? null : te.range(r + i, l + i);
  }
}
lt.allowMultipleSelections = Tu;
lt.tabSize = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : 4
});
lt.lineSeparator = gg;
lt.readOnly = bg;
lt.phrases = /* @__PURE__ */ we.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((s) => n[s] == e[s]);
  }
});
lt.languageData = pg;
lt.changeFilter = mg;
lt.transactionFilter = vg;
lt.transactionExtender = yg;
na.reconfigure = /* @__PURE__ */ kt.define();
function ia(n, e, t = {}) {
  let i = {};
  for (let s of n)
    for (let o of Object.keys(s)) {
      let r = s[o], l = i[o];
      if (l === void 0)
        i[o] = r;
      else if (!(l === r || r === void 0)) if (Object.hasOwnProperty.call(t, o))
        i[o] = t[o](l, r);
      else
        throw new Error("Config merge conflict for field " + o);
    }
  for (let s in e)
    i[s] === void 0 && (i[s] = e[s]);
  return i;
}
class Cs {
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
    return Ou.create(e, t, this);
  }
}
Cs.prototype.startSide = Cs.prototype.endSide = 0;
Cs.prototype.point = !1;
Cs.prototype.mapMode = cn.TrackDel;
function Lc(n, e) {
  return n == e || n.constructor == e.constructor && n.eq(e);
}
let Ou = class kg {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new kg(e, t, i);
  }
};
function Lu(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class Ec {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = s;
  }
  get length() {
    return Rs(this.to);
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, i, s = 0) {
    let o = i ? this.to : this.from;
    for (let r = s, l = o.length; ; ) {
      if (r == l)
        return r;
      let a = r + l >> 1, u = o[a] - e || (i ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == r)
        return u >= 0 ? r : l;
      u >= 0 ? l = a : r = a + 1;
    }
  }
  between(e, t, i, s) {
    for (let o = this.findIndex(t, -1e9, !0), r = this.findIndex(i, 1e9, !1, o); o < r; o++)
      if (s(this.from[o] + e, this.to[o] + e, this.value[o]) === !1)
        return !1;
  }
  map(e, t, i, s, o) {
    let r = [], l = [], a = [], u = -1, c = -1;
    e: for (let h = 0; h < this.value.length; h++) {
      let f = this.value[h], d = this.from[h] + e, g = this.to[h] + e, v, m;
      if (d == g) {
        let b = t.mapPos(d, f.startSide, f.mapMode);
        if (b == null || (v = m = b, f.startSide != f.endSide && (m = t.mapPos(d, f.endSide), m < v)))
          continue;
      } else if (v = t.mapPos(d, f.startSide), m = t.mapPos(g, f.endSide), v > m || v == m && f.startSide > 0 && f.endSide <= 0)
        continue;
      if (!((m - v || f.endSide - f.startSide) < 0))
        if (u < 0 && (u = v), f.point && (c = Math.max(c, m - v)), (v - i || f.startSide - s) >= 0)
          r.push(f), l.push(v - u), a.push(m - u), i = m, s = f.endSide;
        else {
          if (v == m)
            for (let b = r.length; b > 0; b--) {
              if ((v - (a[b - 1] + u) || f.startSide - r[b - 1].endSide) >= 0) {
                r.splice(b, 0, f), l.splice(b, 0, v - u), a.splice(b, 0, m - u);
                continue e;
              }
              if ((v - (l[b - 1] + u) || f.endSide - r[b - 1].startSide) > 0)
                break;
            }
          o(v, m, f);
        }
    }
    return { mapped: r.length ? new Ec(l, a, r, c) : null, pos: u };
  }
}
class Ye {
  constructor(e, t, i, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, i, s) {
    return new Ye(e, t, i, s);
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
    let { add: t = [], sort: i = !1, filterFrom: s = 0, filterTo: o = this.length } = e, r = e.filter;
    if (t.length == 0 && !r)
      return this;
    if (i && (t = t.slice().sort(Lu)), this.isEmpty)
      return t.length ? Ye.of(t) : this;
    let l = new Sg(this, null, -1).goto(0), a = 0, u = [], c = new ws();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let h = t[a++];
        c.addInner(h.from, h.to, h.value, !1) || u.push(h);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(Ou.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Ye.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], s = -1, o, r = (a, u, c) => {
      o || (o = new ws()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], h = e.touchesRange(u, u + c.length);
      if (h === !1)
        s = Math.max(s, c.maxPoint), t.push(c), i.push(e.mapPos(u));
      else if (h === !0) {
        let [f, d] = t.length ? [Rs(i) + Rs(t).length, Rs(Rs(t).value).endSide] : [-1, -1], { mapped: g, pos: v } = c.map(u, e, f, d, r);
        g && (s = Math.max(s, g.maxPoint), t.push(g), i.push(v));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Ye(i, t, l || Ye.empty, s);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let s = 0; s < this.chunk.length; s++) {
        let o = this.chunkPos[s], r = this.chunk[s];
        if (t >= o && e <= o + r.length && r.between(o, e - o, t - o, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return er.from([this]).goto(e);
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
    return er.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, s, o = -1) {
    let r = e.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), l = t.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), a = cf(r, l, i), u = new bo(r, a, o), c = new bo(l, a, o);
    i.iterGaps((h, f, d) => hf(u, h, c, f, d, s)), i.empty && i.length == 0 && hf(u, 0, c, 0, 0, s);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, i = 0, s) {
    s == null && (s = 999999999);
    let o = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), r = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (o.length != r.length)
      return !1;
    if (!o.length)
      return !0;
    let l = cf(o, r), a = new bo(o, l, 0).goto(i), u = new bo(r, l, 0).goto(i);
    for (; ; ) {
      if (a.to != u.to || !Eu(a.active, u.active) || a.point && (!u.point || !Lc(a.point, u.point)))
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
  static spans(e, t, i, s, o = -1) {
    let r = new bo(e, null, o).goto(t), l = t, a = r.openStart;
    for (; ; ) {
      let u = Math.min(r.to, i);
      if (r.point) {
        let c = r.activeForPoint(r.to), h = r.pointFrom < t ? c.length + 1 : r.point.startSide < 0 ? c.length : Math.min(c.length, a);
        s.point(l, u, r.point, c, h, r.pointRank), a = Math.min(r.openEnd(u), c.length);
      } else u > l && (s.span(l, u, r.active, a), a = r.openEnd(u));
      if (r.to > i)
        return a + (r.point && r.to > i ? 1 : 0);
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
    let i = new ws();
    for (let s of e instanceof Ou ? [e] : t ? G1(e) : e)
      i.add(s.from, s.to, s.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Ye.empty;
    let t = Rs(e);
    for (let i = e.length - 2; i >= 0; i--)
      for (let s = e[i]; s != Ye.empty; s = s.nextLayer)
        t = new Ye(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Ye.empty = /* @__PURE__ */ new Ye([], [], null, -1);
function Rs(n) {
  return n[n.length - 1];
}
function G1(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (Lu(e, i) > 0)
        return n.slice().sort(Lu);
      e = i;
    }
  return n;
}
Ye.empty.nextLayer = Ye.empty;
class ws {
  finishChunk(e) {
    this.chunks.push(new Ec(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
  add(e, t, i) {
    this.addRange(e, t, i, !0);
  }
  /**
  @internal
  */
  addRange(e, t, i, s) {
    this.addInner(e, t, i, s) || (this.nextLayer || (this.nextLayer = new ws())).addRange(e, t, i, s);
  }
  /**
  @internal
  */
  addInner(e, t, i, s) {
    let o = e - this.lastTo || i.startSide - this.last.endSide;
    if (s && o <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return o < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(Ye.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Ye.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function cf(n, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let o of n)
    for (let r = 0; r < o.chunk.length; r++)
      o.chunk[r].maxPoint <= 0 && i.set(o.chunk[r], o.chunkPos[r]);
  let s = /* @__PURE__ */ new Set();
  for (let o of e)
    for (let r = 0; r < o.chunk.length; r++) {
      let l = i.get(o.chunk[r]);
      l != null && (t ? t.mapPos(l) : l) == o.chunkPos[r] && !t?.touchesRange(l, l + o.chunk[r].length) && s.add(o.chunk[r]);
    }
  return s;
}
class Sg {
  constructor(e, t, i, s = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = s;
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
  gotoInner(e, t, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let s = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(s) || this.layer.chunkEnd(this.chunkIndex) < e || s.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let s = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < s) && this.setRangeIndex(s);
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
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], i = e + t.from[this.rangeIndex];
        if (this.from = i, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
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
class er {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= i && s.push(new Sg(r, t, i, o));
    return s.length == 1 ? s[0] : new er(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Fa(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Fa(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Fa(this.heap, 0);
    }
  }
}
function Fa(n, e) {
  for (let t = n[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= n.length)
      break;
    let s = n[i];
    if (i + 1 < n.length && s.compare(n[i + 1]) >= 0 && (s = n[i + 1], i++), t.compare(s) < 0)
      break;
    n[i] = t, n[e] = s, e = i;
  }
}
class bo {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = er.from(e, t, i);
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
    Lr(this.active, e), Lr(this.activeTo, e), Lr(this.activeRank, e), this.minActive = ff(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    Er(this.active, t, i), Er(this.activeTo, t, s), Er(this.activeRank, t, o), e && Er(e, t, this.cursor.from), this.minActive = ff(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let s = this.minActive;
      if (s > -1 && (this.activeTo[s] - this.cursor.from || this.active[s].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[s] > e) {
          this.to = this.activeTo[s], this.endSide = this.active[s].endSide;
          break;
        }
        this.removeActive(s), i && Lr(i, s);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let o = this.cursor.value;
          if (!o.point)
            this.addActive(i), this.cursor.next();
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
    if (i) {
      this.openStart = 0;
      for (let s = i.length - 1; s >= 0 && i[s] < e; s--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > e || this.activeTo[i] == e && this.active[i].endSide >= this.point.endSide) && t.push(this.active[i]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
      t++;
    return t;
  }
}
function hf(n, e, t, i, s, o) {
  n.goto(e), t.goto(i);
  let r = i + s, l = i, a = i - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let h = n.to + a - t.to, f = h || n.endSide - t.endSide, d = f < 0 ? n.to + a : t.to, g = Math.min(d, r);
    if (n.point || t.point ? (n.point && t.point && Lc(n.point, t.point) && Eu(n.activeForPoint(n.to), t.activeForPoint(t.to)) || o.comparePoint(l, g, n.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), g > l && !Eu(n.active, t.active) && o.compareRange(l, g, n.active, t.active), u && g < r && (h || n.openEnd(d) != t.openEnd(d)) && (c = !0)), d > r)
      break;
    l = d, f <= 0 && n.next(), f >= 0 && t.next();
  }
}
function Eu(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !Lc(n[t], e[t]))
      return !1;
  return !0;
}
function Lr(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function Er(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function ff(n, e) {
  let t = -1, i = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - i || n[s].endSide - n[t].endSide) < 0 && (t = s, i = e[s]);
  return t;
}
function sa(n, e, t = n.length) {
  let i = 0;
  for (let s = 0; s < t && s < n.length; )
    n.charCodeAt(s) == 9 ? (i += e - i % e, s++) : (i++, s = Jt(n, s));
  return i;
}
function q1(n, e, t, i) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == n.length)
      break;
    o += n.charCodeAt(s) == 9 ? t - o % t : 1, s = Jt(n, s);
  }
  return n.length;
}
const Bu = "ͼ", df = typeof Symbol > "u" ? "__" + Bu : Symbol.for(Bu), Iu = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), pf = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class Ji {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function s(r) {
      return /^@/.test(r) ? [r] : r.split(/,\s*/);
    }
    function o(r, l, a, u) {
      let c = [], h = /^@(\w+)\b/.exec(r[0]), f = h && h[1] == "keyframes";
      if (h && l == null) return a.push(r[0] + ";");
      for (let d in l) {
        let g = l[d];
        if (/&/.test(d))
          o(
            d.split(/,\s*/).map((v) => r.map((m) => v.replace(/&/, m))).reduce((v, m) => v.concat(m)),
            g,
            a
          );
        else if (g && typeof g == "object") {
          if (!h) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          o(s(d), g, c, f);
        } else g != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (v) => "-" + v.toLowerCase()) + ": " + g + ";");
      }
      (c.length || f) && a.push((i && !h && !u ? r.map(i) : r).join(", ") + " {" + c.join(" ") + "}");
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
    let e = pf[df] || 1;
    return pf[df] = e + 1, Bu + e.toString(36);
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
  static mount(e, t, i) {
    let s = e[Iu], o = i && i.nonce;
    s ? o && s.setNonce(o) : s = new Y1(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let gf = /* @__PURE__ */ new Map();
class Y1 {
  constructor(e, t) {
    let i = e.ownerDocument || e, s = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = gf.get(i);
      if (o) return e[Iu] = o;
      this.sheet = new s.CSSStyleSheet(), gf.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Iu] = this;
  }
  mount(e, t) {
    let i = this.sheet, s = 0, o = 0, r = !1;
    for (let l = 0; l < e.length; l++) {
      let a = e[l], u = this.modules.indexOf(a);
      if (u < o && u > -1 && (this.modules.splice(u, 1), r = !0, o--, u = -1), u == -1) {
        if (this.modules.splice(o++, 0, a), r = !0, i) for (let c = 0; c < a.rules.length; c++)
          i.insertRule(a.rules[c], s++);
      } else {
        for (; o < u; ) s += this.modules[o++].rules.length;
        s += a.rules.length, o++;
      }
    }
    if (i)
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
var Zi = {
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
}, tr = {
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
}, X1 = typeof navigator < "u" && /Mac/.test(navigator.platform), J1 = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var Ut = 0; Ut < 10; Ut++) Zi[48 + Ut] = Zi[96 + Ut] = String(Ut);
for (var Ut = 1; Ut <= 24; Ut++) Zi[Ut + 111] = "F" + Ut;
for (var Ut = 65; Ut <= 90; Ut++)
  Zi[Ut] = String.fromCharCode(Ut + 32), tr[Ut] = String.fromCharCode(Ut);
for (var za in Zi) tr.hasOwnProperty(za) || (tr[za] = Zi[za]);
function Z1(n) {
  var e = X1 && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || J1 && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? tr : Zi)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function oi() {
  var n = arguments[0];
  typeof n == "string" && (n = document.createElement(n));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var i in t) if (Object.prototype.hasOwnProperty.call(t, i)) {
      var s = t[i];
      typeof s == "string" ? n.setAttribute(i, s) : s != null && (n[i] = s);
    }
    e++;
  }
  for (; e < arguments.length; e++) Cg(n, arguments[e]);
  return n;
}
function Cg(n, e) {
  if (typeof e == "string")
    n.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    n.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) Cg(n, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let nn = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Ru = typeof document < "u" ? document : { documentElement: { style: {} } };
const Pu = /* @__PURE__ */ /Edge\/(\d+)/.exec(nn.userAgent), Mg = /* @__PURE__ */ /MSIE \d/.test(nn.userAgent), _u = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nn.userAgent), oa = !!(Mg || _u || Pu), mf = !oa && /* @__PURE__ */ /gecko\/(\d+)/i.test(nn.userAgent), Wa = !oa && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nn.userAgent), vf = "webkitFontSmoothing" in Ru.documentElement.style, Nu = !oa && /* @__PURE__ */ /Apple Computer/.test(nn.vendor), yf = Nu && (/* @__PURE__ */ /Mobile\/\w+/.test(nn.userAgent) || nn.maxTouchPoints > 2);
var ge = {
  mac: yf || /* @__PURE__ */ /Mac/.test(nn.platform),
  windows: /* @__PURE__ */ /Win/.test(nn.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(nn.platform),
  ie: oa,
  ie_version: Mg ? Ru.documentMode || 6 : _u ? +_u[1] : Pu ? +Pu[1] : 0,
  gecko: mf,
  gecko_version: mf ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nn.userAgent) || [0, 0])[1] : 0,
  chrome: !!Wa,
  chrome_version: Wa ? +Wa[1] : 0,
  ios: yf,
  android: /* @__PURE__ */ /Android\b/.test(nn.userAgent),
  webkit: vf,
  webkit_version: vf ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(nn.userAgent) || [0, 0])[1] : 0,
  safari: Nu,
  safari_version: Nu ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(nn.userAgent) || [0, 0])[1] : 0,
  tabSize: Ru.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function Bc(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
const Ml = /* @__PURE__ */ Object.create(null);
function Ic(n, e, t) {
  if (n == e)
    return !0;
  n || (n = Ml), e || (e = Ml);
  let i = Object.keys(n), s = Object.keys(e);
  if (i.length - 0 != s.length - 0)
    return !1;
  for (let o of i)
    if (o != t && (s.indexOf(o) == -1 || n[o] !== e[o]))
      return !1;
  return !0;
}
function Q1(n, e) {
  for (let t = n.attributes.length - 1; t >= 0; t--) {
    let i = n.attributes[t].name;
    e[i] == null && n.removeAttribute(i);
  }
  for (let t in e) {
    let i = e[t];
    t == "style" ? n.style.cssText = i : n.getAttribute(t) != i && n.setAttribute(t, i);
  }
}
function bf(n, e, t) {
  let i = !1;
  if (e)
    for (let s in e)
      t && s in t || (i = !0, s == "style" ? n.style.cssText = "" : n.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (i = !0, s == "style" ? n.style.cssText = t[s] : n.setAttribute(s, t[s]));
  return i;
}
function ex(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < n.attributes.length; t++) {
    let i = n.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class pr {
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
  updateDOM(e, t, i) {
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
  coordsAt(e, t, i) {
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
var jt = /* @__PURE__ */ (function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
})(jt || (jt = {}));
class Ct extends Cs {
  constructor(e, t, i, s) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = s;
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
    return new gr(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Ms(e, t, t, i, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, i, s;
    if (e.isBlockGap)
      i = -5e8, s = 4e8;
    else {
      let { start: o, end: r } = Ag(e, t);
      i = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Ms(e, i, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new mr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Ye.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
Ct.none = Ye.empty;
class gr extends Ct {
  constructor(e) {
    let { start: t, end: i } = Ag(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? Bc(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Ml;
  }
  eq(e) {
    return this == e || e instanceof gr && this.tagName == e.tagName && Ic(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
gr.prototype.point = !1;
class mr extends Ct {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof mr && this.spec.class == e.spec.class && Ic(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
mr.prototype.mapMode = cn.TrackBefore;
mr.prototype.point = !0;
class Ms extends Ct {
  constructor(e, t, i, s, o, r) {
    super(t, i, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? cn.TrackBefore : cn.TrackAfter : cn.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? jt.WidgetRange : this.startSide <= 0 ? jt.WidgetBefore : jt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Ms && tx(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Ms.prototype.point = !0;
function Ag(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t ?? e, end: i ?? e };
}
function tx(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function js(n, e, t, i = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + i >= n ? t[s] = Math.max(t[s], e) : t.push(n, e);
}
class nr extends Cs {
  constructor(e, t, i) {
    super(), this.tagName = e, this.attributes = t, this.rank = i;
  }
  eq(e) {
    return e == this || e instanceof nr && this.tagName == e.tagName && Ic(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new nr(e.tagName, e.attributes || Ml, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Ye.of(e, t);
  }
}
nr.prototype.startSide = nr.prototype.endSide = -1;
function ir(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function Vu(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Vo(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Vu(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function al(n) {
  return n.nodeType == 3 ? sr(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function Ho(n, e, t, i) {
  return t ? xf(n, e, t, i, -1) || xf(n, e, t, i, 1) : !1;
}
function Qi(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function Al(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
function xf(n, e, t, i, s) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (s < 0 ? 0 : Di(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let o = n.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = Qi(n) + (s < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[e + (s < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      e = s < 0 ? Di(n) : 0;
    } else
      return !1;
  }
}
function Di(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function Tl(n, e) {
  let { left: t, right: i } = n;
  if (t == i)
    return n;
  let s = e ? t : i;
  return { left: s, right: s, top: n.top, bottom: n.bottom };
}
function nx(n) {
  let e = n.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: n.innerWidth,
    top: 0,
    bottom: n.innerHeight
  };
}
function Tg(n, e) {
  let t = e.width / n.offsetWidth, i = e.height / n.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - n.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - n.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function ix(n, e, t, i, s, o, r, l) {
  let a = n.ownerDocument, u = a.defaultView || window;
  for (let c = n, h = !1; c && !h; )
    if (c.nodeType == 1) {
      let f, d = c == a.body, g = 1, v = 1;
      if (d)
        f = nx(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (h = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let O = c.getBoundingClientRect();
        ({ scaleX: g, scaleY: v } = Tg(c, O)), f = {
          left: O.left,
          right: O.left + c.clientWidth * g,
          top: O.top,
          bottom: O.top + c.clientHeight * v
        };
      }
      let m = 0, b = 0;
      if (s == "nearest")
        e.top < f.top + r ? (b = e.top - (f.top + r), t > 0 && e.bottom > f.bottom + b && (b = e.bottom - f.bottom + r)) : e.bottom > f.bottom - r && (b = e.bottom - f.bottom + r, t < 0 && e.top - b < f.top && (b = e.top - (f.top + r)));
      else {
        let O = e.bottom - e.top, L = f.bottom - f.top;
        b = (s == "center" && O <= L ? e.top + O / 2 - L / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - L + r) - f.top;
      }
      if (i == "nearest" ? e.left < f.left + o ? (m = e.left - (f.left + o), t > 0 && e.right > f.right + m && (m = e.right - f.right + o)) : e.right > f.right - o && (m = e.right - f.right + o, t < 0 && e.left < f.left + m && (m = e.left - (f.left + o))) : m = (i == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : i == "start" == l ? e.left - o : e.right - (f.right - f.left) + o) - f.left, m || b)
        if (d)
          u.scrollBy(m, b);
        else {
          let O = 0, L = 0;
          if (b) {
            let E = c.scrollTop;
            c.scrollTop += b / v, L = (c.scrollTop - E) * v;
          }
          if (m) {
            let E = c.scrollLeft;
            c.scrollLeft += m / g, O = (c.scrollLeft - E) * g;
          }
          e = {
            left: e.left - O,
            top: e.top - L,
            right: e.right - O,
            bottom: e.bottom - L
          }, O && Math.abs(O - m) < 1 && (i = "nearest"), L && Math.abs(L - b) < 1 && (s = "nearest");
        }
      if (d)
        break;
      (e.top < f.top || e.bottom > f.bottom || e.left < f.left || e.right > f.right) && (e = {
        left: Math.max(e.left, f.left),
        right: Math.min(e.right, f.right),
        top: Math.max(e.top, f.top),
        bottom: Math.min(e.bottom, f.bottom)
      }), c = c.assignedSlot || c.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
function $g(n, e = !0) {
  let t = n.ownerDocument, i = null, s = null;
  for (let o = n.parentNode; o && !(o == t.body || (!e || i) && s); )
    if (o.nodeType == 1)
      !s && o.scrollHeight > o.clientHeight && (s = o), e && !i && o.scrollWidth > o.clientWidth && (i = o), o = o.assignedSlot || o.parentNode;
    else if (o.nodeType == 11)
      o = o.host;
    else
      break;
  return { x: i, y: s };
}
class sx {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Di(t) : 0), i, Math.min(e.focusOffset, i ? Di(i) : 0));
  }
  set(e, t, i, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = s;
  }
}
function Dg(n) {
  let e = [];
  for (let t = n; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Og(n, e = !0) {
  for (let { node: t, left: i, top: s } of n)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != i && (t.scrollLeft = i);
}
let hs = null;
ge.safari && ge.safari_version >= 26 && (hs = !1);
function Lg(n) {
  if (n.setActive)
    return n.setActive();
  if (hs)
    return n.focus(hs);
  let e = Dg(n);
  n.focus(hs == null ? {
    get preventScroll() {
      return hs = { preventScroll: !0 }, !0;
    }
  } : void 0), hs || (hs = !1, Og(e));
}
let wf;
function sr(n, e, t = e) {
  let i = wf || (wf = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function Gs(n, e, t, i) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = i);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, n.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, n.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function ox(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function rx(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, Di(t)); ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[i - 1];
      s.contentEditable == "false" ? i-- : (t = s, i = Di(t));
    } else {
      if (t == n)
        return !0;
      i = Qi(t), t = t.parentNode;
    }
}
function Eg(n) {
  return n instanceof Window ? n.pageYOffset > Math.max(0, n.document.documentElement.scrollHeight - n.innerHeight - 4) : n.scrollTop > Math.max(1, n.scrollHeight - n.clientHeight - 4);
}
function Bg(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i > 0)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = Di(t);
    } else if (t.parentNode && !Al(t))
      i = Qi(t), t = t.parentNode;
    else
      return null;
  }
}
function Ig(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !Al(t))
      i = Qi(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Rn {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new Rn(e.parentNode, Qi(e), t);
  }
  static after(e, t) {
    return new Rn(e.parentNode, Qi(e) + 1, t);
  }
}
var St = /* @__PURE__ */ (function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
})(St || (St = {}));
const As = St.LTR, Rc = St.RTL;
function Rg(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const lx = /* @__PURE__ */ Rg("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), ax = /* @__PURE__ */ Rg("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Hu = /* @__PURE__ */ Object.create(null), qn = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  Hu[e] = t, Hu[t] = -e;
}
function Pg(n) {
  return n <= 247 ? lx[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? ax[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8204 ? 256 : 64336 <= n && n <= 65023 ? 4 : 1;
}
const ux = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class ai {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? Rc : As;
  }
  /**
  @internal
  */
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
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
  static find(e, t, i, s) {
    let o = -1;
    for (let r = 0; r < e.length; r++) {
      let l = e[r];
      if (l.from <= t && l.to >= t) {
        if (l.level == i)
          return r;
        (o < 0 || (s != 0 ? s < 0 ? l.from < t : l.to > t : e[o].level > l.level)) && (o = r);
      }
    }
    if (o < 0)
      throw new RangeError("Index out of range");
    return o;
  }
}
function _g(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++) {
    let i = n[t], s = e[t];
    if (i.from != s.from || i.to != s.to || i.direction != s.direction || !_g(i.inner, s.inner))
      return !1;
  }
  return !0;
}
const mt = [];
function cx(n, e, t, i, s) {
  for (let o = 0; o <= i.length; o++) {
    let r = o ? i[o - 1].to : e, l = o < i.length ? i[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, h = a; u < l; u++) {
      let f = Pg(n.charCodeAt(u));
      f == 512 ? f = c : f == 8 && h == 4 && (f = 16), mt[u] = f == 4 ? 2 : f, f & 7 && (h = f), c = f;
    }
    for (let u = r, c = a, h = a; u < l; u++) {
      let f = mt[u];
      if (f == 128)
        u < l - 1 && c == mt[u + 1] && c & 24 ? f = mt[u] = c : mt[u] = 256;
      else if (f == 64) {
        let d = u + 1;
        for (; d < l && mt[d] == 64; )
          d++;
        let g = u && c == 8 || d < t && mt[d] == 8 ? h == 1 ? 1 : 8 : 256;
        for (let v = u; v < d; v++)
          mt[v] = g;
        u = d - 1;
      } else f == 8 && h == 1 && (mt[u] = 1);
      c = f, f & 7 && (h = f);
    }
  }
}
function hx(n, e, t, i, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= i.length; r++) {
    let u = r ? i[r - 1].to : e, c = r < i.length ? i[r].from : t;
    for (let h = u, f, d, g; h < c; h++)
      if (d = Hu[f = n.charCodeAt(h)])
        if (d < 0) {
          for (let v = l - 3; v >= 0; v -= 3)
            if (qn[v + 1] == -d) {
              let m = qn[v + 2], b = m & 2 ? s : m & 4 ? m & 1 ? o : s : 0;
              b && (mt[h] = mt[qn[v]] = b), l = v;
              break;
            }
        } else {
          if (qn.length == 189)
            break;
          qn[l++] = h, qn[l++] = f, qn[l++] = a;
        }
      else if ((g = mt[h]) == 2 || g == 1) {
        let v = g == s;
        a = v ? 0 : 1;
        for (let m = l - 3; m >= 0; m -= 3) {
          let b = qn[m + 2];
          if (b & 2)
            break;
          if (v)
            qn[m + 2] |= 2;
          else {
            if (b & 4)
              break;
            qn[m + 2] |= 4;
          }
        }
      }
  }
}
function fx(n, e, t, i) {
  for (let s = 0, o = i; s <= t.length; s++) {
    let r = s ? t[s - 1].to : n, l = s < t.length ? t[s].from : e;
    for (let a = r; a < l; ) {
      let u = mt[a];
      if (u == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (s == t.length)
              break;
            c = t[s++].to, l = s < t.length ? t[s].from : e;
          } else if (mt[c] == 256)
            c++;
          else
            break;
        let h = o == 1, f = (c < e ? mt[c] : i) == 1, d = h == f ? h ? 1 : 2 : i;
        for (let g = c, v = s, m = v ? t[v - 1].to : n; g > a; )
          g == m && (g = t[--v].from, m = v ? t[v - 1].to : n), mt[--g] = d;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Fu(n, e, t, i, s, o, r) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, h = !1;
      if (u == o.length || a < o[u].from) {
        let v = mt[a];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, g = a;
      e: for (; ; )
        if (u < o.length && g == o[u].from) {
          if (h)
            break e;
          let v = o[u];
          if (!c)
            for (let m = v.to, b = u + 1; ; ) {
              if (m == t)
                break e;
              if (b < o.length && o[b].from == m)
                m = o[b++].to;
              else {
                if (mt[m] == l)
                  break e;
                break;
              }
            }
          if (u++, f)
            f.push(v);
          else {
            v.from > a && r.push(new ai(a, v.from, d));
            let m = v.direction == As != !(d % 2);
            zu(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.to;
          }
          g = v.to;
        } else {
          if (g == t || (c ? mt[g] != l : mt[g] == l))
            break;
          g++;
        }
      f ? Fu(n, a, g, i + 1, s, f, r) : a < g && r.push(new ai(a, g, d)), a = g;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, h = !1;
      if (!u || a > o[u - 1].to) {
        let v = mt[a - 1];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, g = a;
      e: for (; ; )
        if (u && g == o[u - 1].to) {
          if (h)
            break e;
          let v = o[--u];
          if (!c)
            for (let m = v.from, b = u; ; ) {
              if (m == e)
                break e;
              if (b && o[b - 1].to == m)
                m = o[--b].from;
              else {
                if (mt[m - 1] == l)
                  break e;
                break;
              }
            }
          if (f)
            f.push(v);
          else {
            v.to < a && r.push(new ai(v.to, a, d));
            let m = v.direction == As != !(d % 2);
            zu(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.from;
          }
          g = v.from;
        } else {
          if (g == e || (c ? mt[g - 1] != l : mt[g - 1] == l))
            break;
          g--;
        }
      f ? Fu(n, g, a, i + 1, s, f, r) : g < a && r.push(new ai(g, a, d)), a = g;
    }
}
function zu(n, e, t, i, s, o, r) {
  let l = e % 2 ? 2 : 1;
  cx(n, s, o, i, l), hx(n, s, o, i, l), fx(s, o, i, l), Fu(n, s, o, e, t, i, r);
}
function dx(n, e, t) {
  if (!n)
    return [new ai(0, 0, e == Rc ? 1 : 0)];
  if (e == As && !t.length && !ux.test(n))
    return Ng(n.length);
  if (t.length)
    for (; n.length > mt.length; )
      mt[mt.length] = 256;
  let i = [], s = e == As ? 0 : 1;
  return zu(n, s, s, t, 0, n.length, i), i;
}
function Ng(n) {
  return [new ai(0, n, 0)];
}
let Vg = "";
function px(n, e, t, i, s) {
  var o;
  if (!n.length)
    return null;
  let r = i.head - n.from, l;
  if (i.head == n.from && i.assoc < 0) {
    if (!s)
      return null;
    r = e[l = 0].side(!1, t);
  } else if (i.head == n.to && i.assoc > 0) {
    if (s)
      return null;
    r = e[l = e.length - 1].side(!0, t);
  } else
    l = ai.find(e, r, (o = i.bidiLevel) !== null && o !== void 0 ? o : -1, i.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let f = l += s ? 1 : -1;
    if (f < 0 || f >= e.length)
      return null;
    a = e[l = f], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = Jt(n.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Vg = n.text.slice(Math.min(r, c), Math.max(r, c));
  let h = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!h)
      return s ? te.cursor(n.to, 1) : te.cursor(n.from, -1);
    if (h.level + (s ? 0 : 1) < a.level)
      return te.cursor(h.side(!s, t) + n.from, h.forward(s, t) ? 1 : -1, h.level);
  }
  return te.cursor(c + n.from, a.forward(s, t) ? -1 : 1, a.level);
}
function gx(n, e, t) {
  for (let i = e; i < t; i++) {
    let s = Pg(n.charCodeAt(i));
    if (s == 1)
      return As;
    if (s == 2 || s == 4)
      return Rc;
  }
  return As;
}
const Hg = /* @__PURE__ */ we.define(), Fg = /* @__PURE__ */ we.define(), zg = /* @__PURE__ */ we.define(), Wg = /* @__PURE__ */ we.define(), Wu = /* @__PURE__ */ we.define(), Kg = /* @__PURE__ */ we.define(), Ug = /* @__PURE__ */ we.define(), Pc = /* @__PURE__ */ we.define(), _c = /* @__PURE__ */ we.define(), jg = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
}), Gg = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
}), qg = /* @__PURE__ */ we.define();
class qs {
  constructor(e, t, i, s, o, r = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new qs(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new qs(te.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Br = /* @__PURE__ */ kt.define({ map: (n, e) => n.map(e) }), Yg = /* @__PURE__ */ kt.define();
function Pn(n, e, t) {
  let i = n.facet(Wg);
  i.length ? i[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const bi = /* @__PURE__ */ we.define({ combine: (n) => n.length ? n[0] : !0 });
let mx = 0;
const _s = /* @__PURE__ */ we.define({
  combine(n) {
    return n.filter((e, t) => {
      for (let i = 0; i < t; i++)
        if (n[i].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class gn {
  constructor(e, t, i, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(_s.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(_s.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: s, provide: o, decorations: r } = t || {};
    return new gn(mx++, e, i, s, (l) => {
      let a = [];
      return r && a.push(ra.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : Ct.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return gn.define((i, s) => new e(i, s), t);
  }
}
class Ka {
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
          } catch (i) {
            if (Pn(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
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
        Pn(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Pn(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Xg = /* @__PURE__ */ we.define(), Nc = /* @__PURE__ */ we.define(), ra = /* @__PURE__ */ we.define(), Jg = /* @__PURE__ */ we.define(), Vc = /* @__PURE__ */ we.define(), vr = /* @__PURE__ */ we.define(), Zg = /* @__PURE__ */ we.define();
function kf(n, e) {
  let t = n.state.facet(Zg);
  if (!t.length)
    return t;
  let i = t.map((o) => o instanceof Function ? o(n) : o), s = [];
  return Ye.spans(i, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, h = s;
      for (let f = l.length - 1; f >= 0; f--, a--) {
        let d = l[f].spec.bidiIsolate, g;
        if (d == null && (d = gx(e.text, u, c)), a > 0 && h.length && (g = h[h.length - 1]).to == u && g.direction == d)
          g.to = c, h = g.inner;
        else {
          let v = { from: u, to: c, direction: d, inner: [] };
          h.push(v), h = v.inner;
        }
      }
    }
  }), s;
}
const Qg = /* @__PURE__ */ we.define();
function Hc(n) {
  let e = 0, t = 0, i = 0, s = 0;
  for (let o of n.state.facet(Qg)) {
    let r = o(n);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (i = Math.max(i, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: i, bottom: s };
}
const To = /* @__PURE__ */ we.define();
class Sn {
  constructor(e, t, i, s) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = s;
  }
  join(e) {
    return new Sn(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let s = e[t - 1];
      if (!(s.fromA > i.toA)) {
        if (s.toA < i.fromA)
          break;
        i = i.join(s), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let s = 0, o = 0, r = 0; ; ) {
      let l = s < e.length ? e[s].fromB : 1e9, a = o < t.length ? t[o] : 1e9, u = Math.min(l, a);
      if (u == 1e9)
        break;
      let c = u + r, h = u, f = c;
      for (; ; )
        if (o < t.length && t[o] <= h) {
          let d = t[o + 1];
          o += 2, h = Math.max(h, d);
          for (let g = s; g < e.length && e[g].fromB <= h; g++)
            r = e[g].toA - e[g].toB;
          f = Math.max(f, d + r);
        } else if (s < e.length && e[s].fromB <= h) {
          let d = e[s++];
          h = Math.max(h, d.toB), f = Math.max(f, d.toA), r = d.toA - d.toB;
        } else
          break;
      i.push(new Sn(c, f, u, h));
    }
    return i;
  }
}
class $l {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = Ht.empty(this.startState.doc.length);
    for (let o of i)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Sn(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new $l(e, t, i);
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
const vx = [];
class Dt {
  constructor(e, t, i = 0) {
    this.dom = e, this.length = t, this.flags = i, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return vx;
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
      t && Q1(this.dom, t);
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
    let i = t;
    for (let s of this.children) {
      if (s == e)
        return i;
      i += s.length + s.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t, i) {
    return null;
  }
  domPosFor(e, t) {
    let i = Qi(this.dom), s = this.length ? e > 0 : t > 0;
    return new Rn(this.parent.dom, i + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof aa)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class la extends Dt {
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
    let t = this.dom, i = null, s, o = e?.node == t ? e : null, r = 0;
    for (let l of this.children) {
      if (l.sync(e), r += l.length + l.breakAfter, s = i ? i.nextSibling : t.firstChild, o && s != l.dom && (o.written = !0), l.dom.parentNode == t)
        for (; s && s != l.dom; )
          s = Sf(s);
      else
        t.insertBefore(l.dom, s);
      i = l.dom;
    }
    for (s = i ? i.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = Sf(s);
    this.length = r;
  }
}
function Sf(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class aa extends la {
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
      let t = Dt.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], i = this, s = 0, o = 0; ; )
      if (s == i.children.length) {
        if (!t.length)
          return;
        i = i.parent, i.breakAfter && o++, s = t.pop();
      } else {
        let r = i.children[s++];
        if (r instanceof Mi)
          t.push(s), i = r, s = 0;
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
    let i, s = -1, o, r = -1;
    if (this.blockTiles((l, a) => {
      let u = a + l.length;
      if (e >= a && e <= u) {
        if (l.isWidget() && t >= -1 && t <= 1) {
          if (l.flags & 32)
            return !0;
          l.flags & 16 && (i = void 0);
        }
        (a < e || e == u && (t < -1 ? l.length : l.covers(1))) && (!i || !l.isWidget() && i.isWidget()) && (i = l, s = e - a), (u > e || e == a && (t > 1 ? l.length : l.covers(-1))) && (!o || !l.isWidget() && o.isWidget()) && (o = l, r = e - a);
      }
    }), !i && !o)
      throw new Error("No tile at position " + e);
    return i && t < 0 || !o ? { tile: i, offset: s } : { tile: o, offset: r };
  }
}
class Mi extends la {
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
    let i = new Mi(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class eo extends la {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, i) {
    let s = new eo(t || document.createElement("div"), e);
    return (!t || !i) && (s.flags |= 4), s;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  // Side -2/2 is handled specially, in that it allows the position
  // returned to be before (-2) or after (2) widgets that would always
  // be after/before a cursor position.
  resolveInline(e, t, i) {
    let s = null, o = -1, r = null, l = -1;
    function a(c, h) {
      for (let f = 0, d = 0; f < c.children.length && d <= h; f++) {
        let g = c.children[f], v = d + g.length;
        v >= h && (g.isComposite() ? a(g, h - d) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || i && bx(r, g))) && (v > h || g.flags & 32 && t <= 1) ? (r = g, l = h - d) : (d < h || g.flags & 16 && !g.isHidden && t >= -1) && (s = g, o = h - d)), d = v;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, i) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, i) : yx(this);
  }
  domIn(e, t) {
    let i = this.resolveInline(e, t);
    if (i) {
      let { tile: s, offset: o } = i;
      if (this.dom.contains(s.dom))
        return s.isText() ? new Rn(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = i.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new Rn(a.dom, 0);
        a == i.tile && (l = !0);
      }
    }
    return new Rn(this.dom, 0);
  }
}
function yx(n) {
  let e = n.dom.lastChild;
  if (!e)
    return n.dom.getBoundingClientRect();
  let t = al(e);
  return t[t.length - 1] || null;
}
function bx(n, e) {
  let t = n.coordsIn(0, 1), i = e.coordsIn(0, 1);
  return t && i && i.top < t.bottom;
}
class hn extends la {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let i = new hn(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class vs extends Dt {
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
  coordsIn(e, t, i) {
    let s = this.dom.nodeValue.length;
    e > s && (e = s);
    let o = e, r = e, l = 0;
    e == 0 && t < 0 || e == s && t >= 0 ? ge.chrome || ge.gecko || (e ? (o--, l = 1) : r < s && (r++, l = -1)) : t < 0 ? o-- : r < s && r++;
    let a = sr(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return ge.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), i == null ? u : Tl(u, (l ? l > 0 : t < 0) == i);
  }
  static of(e, t) {
    let i = new vs(t || document.createTextNode(e), e);
    return t || (i.flags |= 2), i;
  }
}
class Ts extends Dt {
  constructor(e, t, i, s) {
    super(e, t, s), this.widget = i;
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
  coordsInWidget(e, t, i) {
    let s = this.widget.coordsAt(this.dom, e, t);
    if (s)
      return s;
    if (i)
      return Tl(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return Tl(r, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return nt.empty;
    let { root: e } = this;
    if (!e)
      return nt.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, i, s, o) {
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Ts(o, i, e, s);
  }
}
class Dl extends Dt {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return nt.empty;
  }
  coordsIn(e, t, i) {
    let s = this.dom.getBoundingClientRect();
    return i == null ? s : Tl(s, t > 0 == i);
  }
}
class xx {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, i) {
    let { tile: s, index: o, beforeBreak: r, parents: l } = this;
    for (; e || t > 0; )
      if (s.isComposite())
        if (r) {
          if (!e)
            break;
          i && i.break(), e--, r = !1;
        } else if (o == s.children.length) {
          if (!e && !l.length)
            break;
          i && i.leave(s), r = !!s.breakAfter, { tile: s, index: o } = l.pop(), o++;
        } else {
          let a = s.children[o], u = a.breakAfter;
          (t > 0 ? a.length <= e : a.length < e) && (!i || i.skip(a, 0, a.length) !== !1 || !a.isComposite) ? (r = !!u, o++, e -= a.length) : (l.push({ tile: s, index: o }), s = a, o = 0, i && a.isComposite() && i.enter(a));
        }
      else {
        let a = s.length;
        if (o < a && e) {
          let u = Math.min(e, a - o);
          i && i.skip(s, o, o + u), e -= u, o += u;
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
class wx {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.wrapper = i, this.rank = s;
  }
}
class kx {
  constructor(e, t, i) {
    this.cache = e, this.root = t, this.blockWrappers = i, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, i, s) {
    var o;
    this.flushBuffer();
    let r = this.ensureMarks(t, i), l = r.lastChild;
    if (l && l.isText() && !(l.flags & 8) && l.length + e.length < 512) {
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
      let a = r.children[r.children.length - 1] = new vs(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || vs.of(e, (o = this.cache.find(vs)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let i = this.curLine;
    i.dom != t.line.dom && (i.setDOM(this.cache.reused.has(t.line) ? Ua(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = i;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof hn && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Ua(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && Dt.get(a.dom) && (c = Ua(a.dom));
        let h = hn.of(a.mark, c);
        s.append(h), s = h;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = Dt.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new vs(e.text, e.text.nodeValue);
    r.flags |= 8, this.pos = e.range.toB, s.append(r);
  }
  addInlineWidget(e, t, i) {
    let s = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    s || this.flushBuffer();
    let o = this.ensureMarks(t, i);
    !s && !(e.flags & 16) && o.append(this.getBuffer(1)), o.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, i) {
    this.flushBuffer(), this.ensureMarks(t, i).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var i;
    e || (e = em);
    let s = eo.start(e, t || ((i = this.cache.find(eo)) === null || i === void 0 ? void 0 : i.dom), !!t);
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
    var i;
    let s = this.curLine;
    for (let o = e.length - 1; o >= 0; o--) {
      let r = e[o], l;
      if (t > 0 && (l = s.lastChild) && l instanceof hn && l.mark.eq(r))
        s = l, t--;
      else {
        let a = hn.of(r, (i = this.cache.find(hn, (u) => u.mark.eq(r))) === null || i === void 0 ? void 0 : i.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Cf(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(ge.ios && Cf(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        ja,
        0,
        32
        /* TileFlag.After */
      ) || new Ts(
        ja.toDOM(),
        0,
        ja,
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
        let t = e.rank * 102 + e.value.rank, i = new wx(e.from, e.to, e.value, t), s = this.wrappers.length;
        for (; s > 0 && (this.wrappers[s - 1].rank - i.rank || this.wrappers[s - 1].to - i.to) < 0; )
          s--;
        this.wrappers.splice(s, 0, i);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let i of this.wrappers) {
      let s = t.lastChild;
      if (i.from < this.pos && s instanceof Mi && s.wrapper.eq(i.wrapper))
        t = s;
      else {
        let o = Mi.of(i.wrapper, (e = this.cache.find(Mi, (r) => r.wrapper.eq(i.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
    let t = 2 | (e < 0 ? 16 : 32), i = this.cache.find(
      Dl,
      void 0,
      1
      /* Reused.Full */
    );
    return i && (i.flags = t), i || new Dl(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class Sx {
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
    let t = Math.min(this.text.length, this.textOff + e), i = this.text.slice(this.textOff, t);
    return this.textOff = t, i;
  }
}
const Ol = [Ts, eo, vs, hn, Dl, Mi, aa];
for (let n = 0; n < Ol.length; n++)
  Ol[n].bucket = n;
class Cx {
  constructor(e) {
    this.view = e, this.buckets = Ol.map(() => []), this.index = Ol.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, i = this.buckets[t];
    i.length < 6 ? i.push(e) : i[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, i = 2) {
    let s = e.bucket, o = this.buckets[s], r = this.index[s];
    for (let l = 0; l < o.length; l++) {
      let a = (l + r) % o.length, u = o[a];
      if ((!t || t(u)) && !this.reused.has(u))
        return o.splice(a, 1), a < r && this.index[s]--, this.reused.set(u, i), u;
    }
    return null;
  }
  findWidget(e, t, i) {
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
          return s.splice(o, 1), o < this.index[0] && this.index[0]--, l.widget == e && l.length == t && (l.flags & 497) == i ? (this.reused.set(
            l,
            1
            /* Reused.Full */
          ), l) : (this.reused.set(
            l,
            2
            /* Reused.DOM */
          ), new Ts(l.dom, t, e, l.flags & -498 | i));
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
class Mx {
  constructor(e, t, i, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Cx(e), this.text = new Sx(e.state.doc), this.builder = new kx(this.cache, new aa(e, e.contentDOM), Ye.iter(i)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new xx(t), this.reuseWalker = {
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
    let i = t && this.getCompositionContext(t.text);
    for (let s = 0, o = 0, r = 0; ; ) {
      let l = r < e.length ? e[r++] : null, a = l ? l.fromA : this.old.root.length;
      if (a > s) {
        let u = a - s;
        this.preserve(u, !r, !l), s = a, o += u;
      }
      if (!l)
        break;
      t && l.fromA <= t.range.fromA && l.toA >= t.range.toA ? (this.forward(l.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(o, t.range.fromB), this.builder.flushBuffer(), this.cache.clear(), this.builder.addComposition(t, i), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, l.toA), this.emit(t.range.toB, l.toB)) : (this.forward(l.fromA, l.toA), this.emit(o, l.toB)), o = l.toB, s = l.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, i) {
    let s = $x(this.old), o = this.openMarks;
    this.old.advance(e, i ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Ts.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof Dl)
          this.cache.add(r);
        else if (r instanceof hn)
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
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof hn && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof hn && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let i = null, s = this.builder, o = -1, r = Ye.spans(this.decorations, e, t, {
      point: (l, a, u, c, h, f) => {
        if (u instanceof Ms) {
          if (this.disallowBlockEffectsFor[f]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, h > c.length)
            s.continueWidget(a - l);
          else {
            let d = u.widget || (u.block ? to.block : to.inline), g = Ax(u), v = this.cache.findWidget(d, a - l, g) || Ts.of(d, this.view, a - l, g);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(i), s.addBlockWidget(v)) : (s.ensureLine(i), s.addInlineWidget(v, c, h));
          }
          i = null;
        } else
          i = Tx(i, u);
        a > l && this.text.skip(a - l);
      },
      span: (l, a, u, c) => {
        for (let h = l; h < a; ) {
          let f = this.text.next(Math.min(512, a - h));
          f == null ? (s.addLineStartIfNotCovered(i), s.addBreak(), h++) : (s.ensureLine(i), s.addText(f, u, h == l ? c : u.length), h += f.length), i = null;
        }
        o = u.length;
      }
    });
    o > -1 && (this.openWidget = r > o), this.openWidget || s.addLineStartIfNotCovered(i), this.openMarks = r;
  }
  forward(e, t, i = 1) {
    t - e <= 10 ? this.old.advance(t - e, i, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, i, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], i = null;
    for (let s = e.parentNode; ; s = s.parentNode) {
      let o = Dt.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof hn ? t.push(o) : o?.isLine() ? i = o : o instanceof Mi || (s.nodeName == "DIV" && !i ? i = new eo(s, em) : i || t.push(hn.of(new gr({ tagName: s.nodeName.toLowerCase(), attributes: ex(s) }), s)));
    }
    return i ? { line: i, marks: t } : null;
  }
}
function Cf(n, e) {
  let t = (i) => {
    for (let s of i.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(n);
}
function Ax(n) {
  let e = n.isReplace ? (n.startSide < 0 ? 64 : 0) | (n.endSide > 0 ? 128 : 0) : n.startSide > 0 ? 32 : 16;
  return n.block && (e |= 256), e;
}
const em = { class: "cm-line" };
function Tx(n, e) {
  let t = e.spec.attributes, i = e.spec.class;
  return !t && !i || (n || (n = { class: "cm-line" }), t && Bc(t, n), i && (n.class += " " + i)), n;
}
function $x(n) {
  let e = [];
  for (let t = n.parents.length; t > 1; t--) {
    let i = t == n.parents.length ? n.tile : n.parents[t].tile;
    i instanceof hn && e.push(i.mark);
  }
  return e;
}
function Ua(n) {
  let e = Dt.get(n);
  return e && e.setDOM(n.cloneNode()), n;
}
class to extends pr {
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
to.inline = /* @__PURE__ */ new to("span");
to.block = /* @__PURE__ */ new to("div");
const ja = /* @__PURE__ */ new class extends pr {
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
class Mf {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Ct.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new aa(e, e.contentDOM), this.updateInner([new Sn(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: c, toA: h }) => h < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !_x(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Ox(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: h } = this.hasComposition;
      i = new Sn(c, h, e.changes.mapPos(c, -1), e.changes.mapPos(h, 1)).addToSet(i.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (ge.ie || ge.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Bx(r, this.decorations, e.changes);
    a.length && (i = Sn.extendWithRanges(i, a));
    let u = Rx(l, this.blockWrappers, e.changes);
    return u.length && (i = Sn.extendWithRanges(i, u)), o && !i.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (i = o.range.addToSet(i.slice())), this.tile.flags & 2 && i.length == 0 ? !1 : (this.updateInner(i, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: i } = this.view;
    i.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new Mx(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && Dt.get(t.text) && l.cache.reused.set(
          Dt.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), Ku(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = ge.chrome || ge.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || i.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Ga && s.push(o.dom);
    i.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(Yg) && (this.editContextFormatting = i.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: i } = this.tile, s = this.view.root.activeElement, o = s == i, r = !o && !(this.view.state.facet(bi) || i.tabIndex > -1) && Vo(i, this.view.observer.selectionRange) && !(s && i.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), ge.gecko && a.empty && !this.hasComposition && Dx(u)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(f, u.node.childNodes[u.offset] || null)), u = c = new Rn(f, 0), l = !0;
    }
    let h = this.view.observer.selectionRange;
    (l || !h.focusNode || (!Ho(u.node, u.offset, h.anchorNode, h.anchorOffset) || !Ho(c.node, c.offset, h.focusNode, h.focusOffset)) && !this.suppressWidgetCursorChange(h, a)) && (this.view.observer.ignore(() => {
      ge.android && ge.chrome && i.contains(h.focusNode) && Px(h.focusNode, i) && (i.blur(), i.focus({ preventScroll: !0 }));
      let f = ir(this.view.root);
      if (f) if (a.empty) {
        if (ge.gecko) {
          let d = Lx(u.node, u.offset);
          if (d && d != 3) {
            let g = (d == 1 ? Bg : Ig)(u.node, u.offset);
            g && (u = new Rn(g.node, g.offset));
          }
        }
        f.collapse(u.node, u.offset), a.bidiLevel != null && f.caretBidiLevel !== void 0 && (f.caretBidiLevel = a.bidiLevel);
      } else if (f.extend) {
        f.collapse(u.node, u.offset);
        try {
          f.extend(c.node, c.offset);
        } catch {
        }
      } else {
        let d = document.createRange();
        a.anchor > a.head && ([u, c] = [c, u]), d.setEnd(c.node, c.offset), d.setStart(u.node, u.offset), f.removeAllRanges(), f.addRange(d);
      }
      r && this.view.root.activeElement == i && (i.blur(), s && s.focus());
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new Rn(h.anchorNode, h.anchorOffset), this.impreciseHead = c.precise ? null : new Rn(h.focusNode, h.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Ho(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = ir(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
    if (!i || !t.empty || !t.assoc || !i.modify)
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
    i.collapse(c.node, c.offset), i.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let h = e.observer.selectionRange;
    e.docView.posFromDOM(h.anchorNode, h.anchorOffset) != t.from && i.collapse(s, o);
  }
  posFromDOM(e, t) {
    let i = this.tile.nearest(e);
    if (!i)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let s = i.posAtStart;
    if (i.isComposite()) {
      let o;
      if (e == i.dom)
        o = i.dom.childNodes[t];
      else {
        let r = Di(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let l = e.parentNode;
          if (l == i.dom)
            break;
          r == 0 && l.firstChild != l.lastChild && (e == l.firstChild ? r = -1 : r = 1), e = l;
        }
        r < 0 ? o = e : o = e.nextSibling;
      }
      if (o == i.dom.firstChild)
        return s;
      for (; o && !Dt.get(o); )
        o = o.nextSibling;
      if (!o)
        return s + i.length;
      for (let r = 0, l = s; ; r++) {
        let a = i.children[r];
        if (a.dom == o)
          return l;
        l += a.length + a.breakAfter;
      }
    } else return i.isText() ? e == i.dom ? s + t : s + (t ? i.length : 0) : s;
  }
  domAtPos(e, t) {
    let { tile: i, offset: s } = this.tile.resolveBlock(e, t);
    return i.isWidget() ? i.domPosFor(s, t) : i.domIn(s, t);
  }
  inlineDOMNearPos(e, t) {
    let i, s = -1, o = !1, r, l = -1, a = !1;
    return this.tile.blockTiles((u, c) => {
      if (u.isWidget()) {
        if (u.flags & 32 && c >= e)
          return !0;
        u.flags & 16 && (o = !0);
      } else {
        let h = c + u.length;
        if (c <= e && (i = u, s = e - c, o = h < e), h >= e && !r && (r = u, l = e - c, a = c > e), c > e && r)
          return !0;
      }
    }), !i && !r ? this.domAtPos(e, t) : (o && r ? i = null : a && i && (r = null), i && t < 0 || !r ? i.domIn(s, t) : r.domIn(l, t));
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(e, t, i) {
    let { tile: s, offset: o } = this.tile.resolveBlock(e, t);
    return s.isWidget() ? s.widget instanceof Ga ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, i);
  }
  lineAt(e, t) {
    let { tile: i } = this.tile.resolveBlock(e, t);
    return i.isLine() ? i : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: i } = this.tile.resolveBlock(e, 1);
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
        let l = Jt(o.text, r);
        if (l == r)
          return null;
        let a = sr(o.dom, r, l).getClientRects();
        for (let u = 0; u < a.length; u++) {
          let c = a[u];
          if (u == a.length - 1 || c.top < c.bottom && c.left < c.right)
            return c;
        }
      }
      return null;
    }
    return s(t, i);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == St.LTR, u = 0, c = (h, f, d) => {
      for (let g = 0; g < h.children.length && !(f > s); g++) {
        let v = h.children[g], m = f + v.length, b = v.dom.getBoundingClientRect(), { height: O } = b;
        if (d && !g && (u += b.top - d.top), v instanceof Mi)
          m > i && c(v, f, b);
        else if (f >= i && (u > 0 && t.push(-u), t.push(O + u), u = 0, r)) {
          let L = v.dom.lastChild, E = L ? al(L) : [];
          if (E.length) {
            let B = E[E.length - 1], z = a ? B.right - b.left : b.right - B.left;
            z > l && (l = z, this.minWidth = o, this.minWidthFrom = f, this.minWidthTo = m);
          }
        }
        d && g == h.children.length - 1 && (u += d.bottom - b.bottom), f = m + v.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? St.RTL : St.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = al(u.dom);
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
    let t = document.createElement("div"), i, s, o;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let r = al(t.firstChild)[0];
      i = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : i, t.remove();
    }), { lineHeight: i, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > i) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(Ct.replace({
          widget: new Ga(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, r));
      }
      if (!o)
        break;
      i = o.to + 1;
    }
    return Ct.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(ra).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), i = !1, s = this.view.state.facet(Vc).map((o, r) => {
      let l = typeof o == "function";
      return l && (i = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = i, t.push(Ye.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Jg).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(qg))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        Pn(this.view.state, c, "scroll handler");
      }
    let { range: t } = e, i = this.coordsAt(t.head, t.assoc || (t.head > t.anchor ? -1 : 1)), s;
    if (!i)
      return;
    !t.empty && (s = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, s.left),
      top: Math.min(i.top, s.top),
      right: Math.max(i.right, s.right),
      bottom: Math.max(i.bottom, s.bottom)
    });
    let o = Hc(this.view), r = {
      left: i.left - o.left,
      top: i.top - o.top,
      right: i.right + o.right,
      bottom: i.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (ix(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == St.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (i.top > window.visualViewport.offsetTop + window.visualViewport.height || i.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Dg(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), Og(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (i) => i.isWidget() || i.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    Ku(this.tile);
  }
}
function Ku(n, e) {
  let t = e?.get(n);
  if (t != 1) {
    t == null && n.destroy();
    for (let i of n.children)
      Ku(i, e);
  }
}
function Dx(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
function tm(n, e) {
  let t = n.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = Bg(t.focusNode, t.focusOffset), s = Ig(t.focusNode, t.focusOffset), o = i || s;
  if (s && i && s.node != i.node) {
    let l = Dt.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (n.docView.lastCompositionAfterCursor) {
      let a = Dt.get(i.node);
      !a || a.isText() && a.text != i.node.nodeValue || (o = s);
    }
  }
  if (n.docView.lastCompositionAfterCursor = o != i, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Ox(n, e, t) {
  let i = tm(n, t);
  if (!i)
    return null;
  let { node: s, from: o, to: r } = i, l = s.nodeValue;
  if (/[\n\r]/.test(l) || n.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Sn(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Lx(n, e) {
  return n.nodeType != 1 ? 0 : (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Ex = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    js(e, t, this.changes);
  }
  comparePoint(e, t) {
    js(e, t, this.changes);
  }
  boundChange(e) {
    js(e, e, this.changes);
  }
};
function Bx(n, e, t) {
  let i = new Ex();
  return Ye.compare(n, e, t, i), i.changes;
}
class Ix {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    js(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    js(e, e, this.changes);
  }
}
function Rx(n, e, t) {
  let i = new Ix();
  return Ye.compare(n, e, t, i), i.changes;
}
function Px(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function _x(n, e) {
  let t = !1;
  return e && n.iterChangedRanges((i, s) => {
    i < e.to && s > e.from && (t = !0);
  }), t;
}
class Ga extends pr {
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
function Nx(n, e, t = 1) {
  let i = n.charCategorizer(e), s = n.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return te.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = Jt(s.text, o, !1) : l = Jt(s.text, o);
  let a = i(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = Jt(s.text, r, !1);
    if (i(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = Jt(s.text, l);
    if (i(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return te.undirectionalRange(r + s.from, l + s.from);
}
function Vx(n, e, t, i, s) {
  let o = Math.round((i - e.left) * n.defaultCharacterWidth);
  if (n.lineWrapping && t.height > n.defaultLineHeight * 1.5) {
    let l = n.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (n.defaultLineHeight - l) * 0.5) / l);
    o += a * n.viewState.heightOracle.lineLength;
  }
  let r = n.state.sliceDoc(t.from, t.to);
  return t.from + q1(r, o, n.state.tabSize);
}
function Uu(n, e, t) {
  let i = n.lineBlockAt(e);
  if (Array.isArray(i.type)) {
    let s;
    for (let o of i.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == jt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || i;
  }
  return i;
}
function Hx(n, e, t, i) {
  let s = Uu(n, e.head, e.assoc || -1), o = !i || s.type != jt.Text || !(n.lineWrapping || s.widgetLineBreaks) ? null : n.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = n.dom.getBoundingClientRect(), l = n.textDirectionAt(s.from), a = n.posAtCoords({
      x: t == (l == St.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return te.cursor(a, t ? -1 : 1);
  }
  return te.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function Af(n, e, t, i) {
  let s = n.state.doc.lineAt(e.head), o = n.bidiSpans(s), r = n.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = px(s, o, r, l, t), c = Vg;
    if (!u) {
      if (s.number == (t ? n.state.doc.lines : 1))
        return l;
      c = `
`, s = n.state.doc.line(s.number + (t ? 1 : -1)), o = n.bidiSpans(s), u = t ? te.cursor(s.from, -1) : te.cursor(s.to, 1);
    }
    if (a) {
      if (!a(c))
        return l;
    } else {
      if (!i)
        return u;
      a = i(c);
    }
    l = u;
  }
}
function Fx(n, e, t) {
  let i = n.state.charCategorizer(e), s = i(t);
  return (o) => {
    let r = i(o);
    return s == wi.Space && (s = r), s == r;
  };
}
function zx(n, e, t, i) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? n.state.doc.length : 0))
    return te.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), u = n.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = n.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let g = n.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, n.defaultCharacterWidth * (s - g.from))), l = (o < 0 ? g.top : g.bottom) + c;
  }
  let h = a.left + r, f = n.viewState.heightOracle.textHeight >> 1, d = i ?? f;
  for (let g = 0; ; g += f) {
    let v = l + (d + g) * o, m = ju(n, { x: h, y: v }, !1, o);
    if (t ? v > a.bottom : v < a.top)
      return te.cursor(m.pos, m.assoc);
    let b = n.coordsAtPos(m.pos, m.assoc), O = b ? (b.top + b.bottom) / 2 : 0;
    if (!b || (t ? O > l : O < l))
      return te.cursor(m.pos, m.assoc, void 0, r);
  }
}
function Fo(n, e, t) {
  for (; ; ) {
    let i = 0;
    for (let s of n)
      s.between(e - 1, e + 1, (o, r, l) => {
        if (e > o && e < r) {
          let a = i || t || (e - o < r - e ? -1 : 1);
          e = a < 0 ? o : r, i = a;
        }
      });
    if (!i)
      return e;
  }
}
function nm(n, e) {
  let t = null;
  for (let i = 0; i < e.ranges.length; i++) {
    let s = e.ranges[i], o = null;
    if (s.empty) {
      let r = Fo(n, s.from, 0);
      r != s.from && (o = te.cursor(r, -1));
    } else {
      let r = Fo(n, s.from, -1), l = Fo(n, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = te.undirectionalRange(s.from, s.to) : o = te.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[i] = o);
  }
  return t ? te.create(t, e.mainIndex) : e;
}
function qa(n, e, t) {
  let i = Fo(n.state.facet(vr).map((s) => s(n)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : te.cursor(i, i < t.from ? 1 : -1);
}
class ri {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function ju(n, e, t, i) {
  let s = n.contentDOM.getBoundingClientRect(), o = s.top + n.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new ri(0, 1);
    if (a > n.viewState.docHeight)
      return new ri(n.state.doc.length, -1);
    if (u = n.elementAtHeight(a), i == null)
      break;
    if (u.type == jt.Text) {
      if (i < 0 ? u.to < n.viewport.from : u.from > n.viewport.to)
        break;
      let f = n.docView.coordsAt(i < 0 ? u.from : u.to, i > 0 ? -1 : 1);
      if (f && (i < 0 ? f.top <= a + o : f.bottom >= a + o))
        break;
    }
    let h = n.viewState.heightOracle.textHeight / 2;
    a = i > 0 ? u.bottom + h : u.top - h;
  }
  if (n.viewport.from >= u.to || n.viewport.to <= u.from) {
    if (t)
      return null;
    if (u.type == jt.Text) {
      let h = Vx(n, s, u, r, l);
      return new ri(h, h == u.from ? 1 : -1);
    }
  }
  if (u.type != jt.Text)
    return a < (u.top + u.bottom) / 2 ? new ri(u.from, 1) : new ri(u.to, -1);
  let c = n.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = n.docView.lineAt(u.from, -2)), new Wx(n, r, l, n.textDirectionAt(u.from)).scanTile(c, u.from);
}
class Wx {
  constructor(e, t, i, s) {
    this.view = e, this.x = t, this.y = i, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[ai.find(s, e - i.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[ai.find(s, e - i.from, -1, t)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(e, t) {
    let { spans: i, line: s } = this.bidiSpansAt(e);
    return i.length > 1 || i.length && (i[0].level != this.baseDir || i[0].to + s.from < t);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(e, t, i = !1) {
    let s = 0, o = e.length - 1, r = /* @__PURE__ */ new Set(), l = this.bidiIn(e[0], e[o]), a, u, c = -1, h = 1e9, f;
    e: for (; s < o; ) {
      let g = o - s, v = s + o >> 1;
      t: if (r.has(v)) {
        for (let O = 1; O < g; O++) {
          let L = v + O;
          if (L >= o && (L -= g), !r.has(L)) {
            v = L;
            break t;
          }
        }
        break e;
      }
      r.add(v);
      let m = t(v), b = 0;
      if (m)
        for (let O = 0; O < m.length; O++) {
          let L = m[O];
          if (!(L.width == 0 && m.length > 1))
            if (L.bottom < this.y)
              (!a || a.bottom < L.bottom) && (a = L), b = 1;
            else if (L.top > this.y)
              (!u || u.top > L.top) && (u = L), b = -1;
            else {
              let E = L.left > this.x ? this.x - L.left : L.right < this.x ? this.x - L.right : 0, B = Math.abs(E);
              B < h && (c = v, h = B, f = L), E && (b = E < 0 == (this.baseDir == St.LTR) ? -1 : 1);
            }
        }
      b == -1 && (!l || this.baseDirAt(e[v], 1)) ? o = v : b == 1 && (!l || this.baseDirAt(e[v + 1], -1)) && (s = v + 1);
    }
    if (!f) {
      if (!u && !a)
        return { i: 0, after: !1 };
      let g = a && (!u || this.y - a.bottom < u.top - this.y) ? a : u;
      return this.y = (g.top + g.bottom) / 2, this.scan(e, t, !0);
    }
    if (h && !i) {
      let { top: g, bottom: v } = f;
      if (a && a.bottom > (g + g + v) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (u && u.top < (g + v + v) / 3)
        return this.y = u.top + 1, this.scan(e, t, !0);
    }
    let d = (l ? this.dirAt(e[c], 1) : this.baseDir) == St.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (f.left + f.right) / 2 == d
    };
  }
  scanText(e, t) {
    let i = [];
    for (let o = 0; o < e.length; o = Jt(e.text, o))
      i.push(t + o);
    i.push(t + e.length);
    let s = this.scan(i, (o) => {
      let r = i[o] - t, l = i[o + 1] - t;
      return sr(e.dom, r, l).getClientRects();
    });
    return s.after ? new ri(i[s.i + 1], -1) : new ri(i[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new ri(t, 1);
    if (e.children.length == 1) {
      let l = e.children[0];
      if (l.isText())
        return this.scanText(l, t);
      if (l.isComposite())
        return this.scanTile(l, t);
    }
    let i = [t];
    for (let l = 0, a = t; l < e.children.length; l++)
      i.push(a += e.children[l].length);
    let s = this.scan(i, (l) => {
      let a = e.children[l];
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : sr(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = i[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new ri(i[s.i + 1], -1) : new ri(r, 1);
  }
}
const Ps = "￿";
class Kx {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(lt.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Ps;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(i, s);
      let o = this.text.length;
      this.readNode(s);
      let r = Dt.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && i != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = Dt.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : Al(s)) || Al(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !jx(l, t) && this.lineBreak(), s = l;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, s = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let o = -1, r = 1, l;
      if (this.lineSeparator ? (o = t.indexOf(this.lineSeparator, i), r = this.lineSeparator.length) : (l = s.exec(t)) && (o = l.index, r = l[0].length), this.append(t.slice(i, o < 0 ? t.length : o)), o < 0)
        break;
      if (this.lineBreak(), r > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= r - 1);
      i = o + r;
    }
  }
  readNode(e) {
    let t = Dt.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let s = i.iter(); !s.next().done; )
        s.lineBreak ? this.lineBreak() : this.append(s.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let i of this.points)
      i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let i of this.points)
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (Ux(e, i.node, i.offset) ? t : 0));
  }
}
function Ux(n, e, t) {
  for (; ; ) {
    if (!e || t < Di(e))
      return !1;
    if (e == n)
      return !0;
    t = Qi(e) + 1, e = e.parentNode;
  }
}
function jx(n, e) {
  let t;
  for (; !(n == e || !n); n = n.nextSibling) {
    let i = Dt.get(n);
    if (!i?.isWidget())
      return !1;
    i && (t || (t = [])).push(i);
  }
  if (t)
    for (let i of t) {
      let s = i.overrideDOMText;
      if (s?.length)
        return !1;
    }
  return !0;
}
class Tf {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Gx {
  constructor(e, t, i, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = im(e.docView.tile, t, i, 0))) {
      let a = o || r ? [] : Yx(e), u = new Kx(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = Xx(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Vu(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Vu(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), h = e.viewport;
      if ((ge.ios || ge.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (h.from > 0 || h.to < e.state.doc.length)) {
        let f = Math.min(u, c), d = Math.max(u, c), g = h.from - f, v = h.to - d;
        (g == 0 || g == 1 || f == 0) && (v == 0 || v == -1 || d == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(te.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let f = e.coordsAtPos(u, -1), d = 0;
        f && (d = e.inputState.lastTouchY <= f.bottom ? -1 : 1), this.newSel = te.create([te.cursor(u, d)]);
      } else
        this.newSel = te.single(c, u);
    }
  }
}
function im(n, e, t, i) {
  if (n.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = i, c = i; a < n.children.length; a++) {
      let h = n.children[a], f = u + h.length;
      if (u < e && f > t)
        return im(h, e, t, u);
      if (f >= e && s == -1 && (s = a, o = u), u > t && h.dom.parentNode == n.dom) {
        r = a, l = c;
        break;
      }
      c = f, u = f + h.breakAfter;
    }
    return {
      from: o,
      to: l < 0 ? i + n.length : l,
      startDOM: (s ? n.children[s - 1].dom.nextSibling : null) || n.dom.firstChild,
      endDOM: r < n.children.length && r >= 0 ? n.children[r].dom : null
    };
  } else return n.isText() ? { from: i, to: i + n.length, startDOM: n.dom, endDOM: n.dom.nextSibling } : null;
}
function sm(n, e) {
  let t, { newSel: i } = e, { state: s } = n, o = s.selection.main, r = n.inputState.lastKeyTime > Date.now() - 100 ? n.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || ge.android && e.text.length < a - l) && (u = o.to, c = "end");
    let h = s.doc.sliceString(l, a, Ps), f, d;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || h != e.text) && h.slice(0, o.from - l) == e.text.slice(0, o.from - l) && h.slice(o.to - l) == e.text.slice(f = e.text.length - (h.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: nt.of(e.text.slice(o.from - l, f).split(Ps))
    } : (d = om(h, e.text, u - l, c)) && (ge.chrome && r == 13 && d.toB == d.from + 2 && e.text.slice(d.from, d.toB) == Ps + Ps && d.toB--, t = {
      from: l + d.from,
      to: l + d.toA,
      insert: nt.of(e.text.slice(d.from, d.toB).split(Ps))
    });
  } else i && (!n.hasFocus && s.facet(bi) || Ll(i, o)) && (i = null);
  if (!t && !i)
    return !1;
  if ((ge.mac || ge.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && n.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = te.single(i.main.anchor - 1, i.main.head - 1)), t = { from: t.from, to: t.to, insert: nt.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && n.docView.lineHasWidget(o.to) && n.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(n.inputState.insertingText)
  } : ge.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && n.lineWrapping && (i && (i = te.single(i.main.anchor - 1, i.main.head - 1)), t = { from: o.from, to: o.to, insert: nt.of([" "]) }), t)
    return Fc(n, t, i, r);
  if (i && !Ll(i, o)) {
    let l = !1, a = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), a = n.inputState.lastSelectionOrigin, a == "select.pointer" && (i = nm(s.facet(vr).map((u) => u(n)), i))), n.dispatch({ selection: i, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function Fc(n, e, t, i = -1) {
  if (ge.ios && n.inputState.flushIOSKey(e))
    return !0;
  let s = n.state.selection.main;
  if (ge.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && n.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Gs(n.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > s.head) && Gs(n.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && Gs(n.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  n.inputState.composing >= 0 && n.inputState.composing++;
  let r, l = () => r || (r = qx(n, e, t));
  return n.state.facet(Kg).some((a) => a(n, e.from, e.to, o, l)) || n.dispatch(l()), !0;
}
function qx(n, e, t) {
  let i, s = n.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Fo(s.facet(vr).map((h) => h(n)), u, a);
    e.from == c && (r = c);
  }
  if (r > -1)
    i = {
      changes: e,
      selection: te.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && n.inputState.composing < 0) {
    let a = o.from < e.from ? s.sliceDoc(o.from, e.from) : "", u = o.to > e.to ? s.sliceDoc(e.to, o.to) : "";
    i = s.replaceSelection(n.state.toText(a + e.insert.sliceString(0, void 0, n.state.lineBreak) + u));
  } else {
    let a = s.changes(e), u = t && t.main.to <= a.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (n.inputState.composing >= 0 || n.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let c = n.state.sliceDoc(e.from, e.to), h, f = t && tm(n, t.main.head);
      if (f) {
        let g = e.insert.length - (e.to - e.from);
        h = { from: f.from, to: f.to - g };
      } else
        h = n.state.doc.lineAt(o.head);
      let d = o.to - e.to;
      i = s.changeByRange((g) => {
        if (g.from == o.from && g.to == o.to)
          return { changes: a, range: u || g.map(a) };
        let v = g.to - d, m = v - c.length;
        if (n.state.sliceDoc(m, v) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        v >= h.from && m <= h.to)
          return { range: g };
        let b = s.changes({ from: m, to: v, insert: e.insert }), O = g.to - o.to;
        return {
          changes: b,
          range: u ? te.range(Math.max(0, u.anchor + O), Math.max(0, u.head + O)) : g.map(b)
        };
      });
    } else
      i = {
        changes: a,
        selection: u && s.selection.replaceRange(u)
      };
  }
  let l = "input.type";
  return (n.composing || n.inputState.compositionPendingChange && n.inputState.compositionEndedAt > Date.now() - 50) && (n.inputState.compositionPendingChange = !1, l += ".compose", n.inputState.compositionFirstChange && (l += ".start", n.inputState.compositionFirstChange = !1)), s.update(i, { userEvent: l, scrollIntoView: !0 });
}
function om(n, e, t, i) {
  let s = Math.min(n.length, e.length), o = 0;
  for (; o < s && n.charCodeAt(o) == e.charCodeAt(o); )
    o++;
  if (o == s && n.length == e.length)
    return null;
  let r = n.length, l = e.length;
  for (; r > 0 && l > 0 && n.charCodeAt(r - 1) == e.charCodeAt(l - 1); )
    r--, l--;
  if (i == "end") {
    let a = Math.max(0, o - Math.min(r, l));
    t -= r + a - o;
  }
  if (r < o && n.length < e.length) {
    let a = t <= o && t >= r ? o - t : 0;
    o -= a, l = o + (l - r), r = o;
  } else if (l < o) {
    let a = t <= o && t >= l ? o - t : 0;
    o -= a, r = o + (r - l), l = o;
  }
  return { from: o, toA: r, toB: l };
}
function Yx(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o } = n.observer.selectionRange;
  return t && (e.push(new Tf(t, i)), (s != t || o != i) && e.push(new Tf(s, o))), e;
}
function Xx(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t < 0 || i < 0 ? null : t == i ? te.create([te.cursor(i + e, -1)]) : te.single(t + e, i + e);
}
function Ll(n, e) {
  return e.head == n.main.head && e.anchor == n.main.anchor;
}
class Jx {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, ge.safari && e.contentDOM.addEventListener("input", () => null), ge.gecko && dw(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !rw(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let i = this.handlers[e];
    if (i) {
      for (let s of i.observers)
        s(this.view, t);
      for (let s of i.handlers) {
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
    let t = Qx(e), i = this.handlers, s = this.view.contentDOM;
    for (let o in t)
      if (o != "scroll") {
        let r = !t[o].handlers.length, l = i[o];
        l && r != !l.handlers.length && (s.removeEventListener(o, this.handleEvent), l = null), l || s.addEventListener(o, this.handleEvent, { passive: r });
      }
    for (let o in i)
      o != "scroll" && !t[o] && s.removeEventListener(o, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && lm.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), ge.android && ge.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (ge.ios && !e.synthetic && !e.altKey && !e.metaKey && (rm.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || ew.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && ge.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && Zx(this.view.win) && (t.shiftKey = !1);
      let i = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == i && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Gs(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : ge.safari && !ge.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
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
function Zx(n) {
  return n.visualViewport ? n.visualViewport.height * n.visualViewport.scale / n.document.documentElement.clientHeight < 0.85 : !1;
}
function $f(n, e) {
  return (t, i) => {
    try {
      return e.call(n, i, t);
    } catch (s) {
      Pn(t.state, s);
    }
  };
}
function Qx(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of n) {
    let s = i.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push($f(i.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push($f(i.value, a));
      }
  }
  for (let i in Fn)
    t(i).handlers.push(Fn[i]);
  for (let i in ln)
    t(i).observers.push(ln[i]);
  return e;
}
const rm = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], ew = "dthko", lm = [16, 17, 18, 20, 91, 92, 224, 225], Ir = 6;
function Rr(n) {
  return Math.max(0, n) * 0.7 + 8;
}
function tw(n, e) {
  return Math.max(Math.abs(n.clientX - e.clientX), Math.abs(n.clientY - e.clientY));
}
class nw {
  constructor(e, t, i, s) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = $g(e.contentDOM), this.atoms = e.state.facet(vr).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(lt.allowMultipleSelections) && iw(e, t), this.dragging = ow(e, t) && cm(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && tw(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = Hc(this.view);
    e.clientX - a.left <= s + Ir ? t = -Rr(s - e.clientX) : e.clientX + a.right >= r - Ir && (t = Rr(e.clientX - r)), e.clientY - a.top <= o + Ir ? i = -Rr(o - e.clientY) : e.clientY + a.bottom >= l - Ir && (i = Rr(e.clientY - l)), this.setScrollSpeed(t, i);
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
    let { view: t } = this, i = nm(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function iw(n, e) {
  let t = n.state.facet(Hg);
  return t.length ? t[0](e) : ge.mac ? e.metaKey : e.ctrlKey;
}
function sw(n, e) {
  let t = n.state.facet(Fg);
  return t.length ? t[0](e) : ge.mac ? !e.altKey : !e.ctrlKey;
}
function ow(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = ir(n.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let s = i.getRangeAt(0).getClientRects();
  for (let o = 0; o < s.length; o++) {
    let r = s[o];
    if (r.left <= e.clientX && r.right >= e.clientX && r.top <= e.clientY && r.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function rw(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = Dt.get(t)) && i.isWidget() && !i.isHidden && i.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const Fn = /* @__PURE__ */ Object.create(null), ln = /* @__PURE__ */ Object.create(null), am = ge.ie && ge.ie_version < 15 || ge.ios && ge.webkit_version < 604;
function lw(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), um(n, t.value);
  }, 50);
}
function ua(n, e, t) {
  for (let i of n.facet(e))
    t = i(t, n);
  return t;
}
function um(n, e) {
  e = ua(n.state, Pc, e);
  let { state: t } = n, i, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Gu != null && t.selection.ranges.every((a) => a.empty) && Gu == o.toString()) {
    let a = -1;
    i = t.changeByRange((u) => {
      let c = t.doc.lineAt(u.from);
      if (c.from == a)
        return { range: u };
      a = c.from;
      let h = t.toText((r ? o.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: h },
        range: te.cursor(u.from + h.length, -1)
      };
    });
  } else r ? i = t.changeByRange((a) => {
    let u = o.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: u.text },
      range: te.cursor(a.from + u.length, -1)
    };
  }) : i = t.replaceSelection(o);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
ln.scroll = (n) => {
  let e = n.inputState;
  e.lastScrollTop = n.scrollDOM.scrollTop, e.lastScrollLeft = n.scrollDOM.scrollLeft, ge.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
ln.wheel = ln.mousewheel = (n) => {
  n.inputState.lastWheelEvent = Date.now();
};
Fn.keydown = (n, e) => (n.inputState.setSelectionOrigin("select"), e.keyCode == 27 && n.inputState.tabFocusMode != 0 && (n.inputState.tabFocusMode = Date.now() + 2e3), !1);
ln.touchstart = (n, e) => {
  let t = n.inputState, i = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), i && (t.lastTouchX = i.clientX, t.lastTouchY = i.clientY), t.setSelectionOrigin("select.pointer");
};
ln.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
ln.touchend = (n, e) => {
  n.inputState.touchActive = !1;
};
Fn.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of n.state.facet(zg))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = uw(n, e)), t) {
    let i = !n.hasFocus;
    n.inputState.startMouseSelection(new nw(n, e, t, i)), i && n.observer.ignore(() => {
      Lg(n.contentDOM);
      let o = n.root.activeElement;
      o && !o.contains(n.contentDOM) && o.blur();
    });
    let s = n.inputState.mouseSelection;
    if (s)
      return s.start(e), s.dragging === !1;
  } else
    n.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function Df(n, e, t, i) {
  if (i == 1)
    return te.cursor(e, t);
  if (i == 2)
    return Nx(n.state, e, t);
  {
    let s = n.docView.lineAt(e, t), o = n.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < n.state.doc.length && l == o.to && l++, te.undirectionalRange(r, l);
  }
}
const aw = ge.ie && ge.ie_version <= 11;
let Of = null, Lf = 0, Ef = 0;
function cm(n) {
  if (!aw)
    return n.detail;
  let e = Of, t = Ef;
  return Of = n, Ef = Date.now(), Lf = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (Lf + 1) % 3 : 1;
}
function uw(n, e) {
  let t = n.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), i = cm(e), s = n.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = n.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Df(n, a.pos, a.assoc, i);
      if (t.pos != a.pos && !r) {
        let h = Df(n, t.pos, t.assoc, i), f = Math.min(h.from, c.from), d = Math.max(h.to, c.to);
        c = f < c.from ? te.range(f, d, c.assoc) : te.range(d, f, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && i == 1 && s.ranges.length > 1 && (u = cw(s, a.pos)) ? u : l ? s.addRange(c) : te.create([c]);
    }
  };
}
function cw(n, e) {
  for (let t = 0; t < n.ranges.length; t++) {
    let { from: i, to: s } = n.ranges[t];
    if (i <= e && s >= e)
      return te.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
  }
  return null;
}
Fn.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state;
  if (e.target.draggable) {
    let s = n.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = te.undirectionalRange(o, r));
    }
  }
  let { inputState: i } = n;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", ua(n.state, _c, n.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
Fn.dragend = (n) => (n.inputState.draggedContent = null, !1);
function Bf(n, e, t, i) {
  if (t = ua(n.state, Pc, t), !t)
    return;
  let s = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = n.inputState, r = i && o && sw(n, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = n.state.changes(r ? [r, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), n.inputState.draggedContent = null;
}
Fn.drop = (n, e) => {
  if (!e.dataTransfer)
    return !1;
  if (n.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), s = 0, o = () => {
      ++s == t.length && Bf(n, e, i.filter((r) => r != null).join(n.state.lineBreak), !1);
    };
    for (let r = 0; r < t.length; r++) {
      let l = new FileReader();
      l.onerror = o, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[r] = l.result), o();
      }, l.readAsText(t[r]);
    }
    return !0;
  } else {
    let i = e.dataTransfer.getData("Text");
    if (i)
      return Bf(n, e, i, !0), !0;
  }
  return !1;
};
Fn.paste = (n, e) => {
  if (n.state.readOnly)
    return !0;
  n.observer.flush();
  let t = am ? null : e.clipboardData;
  return t ? (um(n, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (lw(n), !1);
};
function hw(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function fw(n) {
  let e = [], t = [], i = !1;
  for (let s of n.selection.ranges)
    s.empty || (e.push(n.sliceDoc(s.from, s.to)), t.push(s));
  if (!e.length) {
    let s = -1;
    for (let { from: o } of n.selection.ranges) {
      let r = n.doc.lineAt(o);
      r.number > s && (e.push(r.text), t.push({ from: r.from, to: Math.min(n.doc.length, r.to + 1) })), s = r.number;
    }
    i = !0;
  }
  return { text: ua(n, _c, e.join(n.lineBreak)), ranges: t, linewise: i };
}
let Gu = null;
Fn.copy = Fn.cut = (n, e) => {
  if (!Vo(n.contentDOM, n.observer.selectionRange))
    return !1;
  let { text: t, ranges: i, linewise: s } = fw(n.state);
  if (!t && !s)
    return !1;
  Gu = s ? t : null, e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = am ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (hw(n, t), !1);
};
const hm = /* @__PURE__ */ co.define();
function fm(n, e) {
  let t = [];
  for (let i of n.facet(Ug)) {
    let s = i(n, e);
    s && t.push(s);
  }
  return t.length ? n.update({ effects: t, annotations: hm.of(!0) }) : null;
}
function dm(n) {
  setTimeout(() => {
    let e = n.hasFocus;
    if (e != n.inputState.notifiedFocused) {
      let t = fm(n.state, e);
      t ? n.dispatch(t) : n.update([]);
    }
  }, 10);
}
ln.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), dm(n);
};
ln.blur = (n) => {
  n.observer.clearSelectionRange(), dm(n);
};
ln.compositionstart = ln.compositionupdate = (n) => {
  if (!n.observer.editContext && (n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0)) {
    let { main: e } = n.state.selection;
    !e.empty && n.lineBlockAt(e.from).from != n.lineBlockAt(e.to).from && n.dispatch({
      changes: n.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), n.inputState.composing = 0;
  }
};
ln.compositionend = (n) => {
  n.observer.editContext || (n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionPendingKey = !0, n.inputState.compositionPendingChange = n.observer.pendingRecords().length > 0, n.inputState.compositionFirstChange = null, ge.chrome && ge.android ? n.observer.flushSoon() : n.inputState.compositionPendingChange ? Promise.resolve().then(() => n.observer.flush()) : setTimeout(() => {
    n.inputState.composing < 0 && n.docView.hasComposition && n.update([]);
  }, 50));
};
ln.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
Fn.beforeinput = (n, e) => {
  var t, i;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (n.inputState.insertingText = e.data, n.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && n.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = n.posAtDOM(l.startContainer, l.startOffset), u = n.posAtDOM(l.endContainer, l.endOffset);
      return Fc(n, { from: a, to: u, insert: n.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (ge.chrome && ge.android && (s = rm.find((o) => o.inputType == e.inputType)) && (n.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
  return ge.ios && e.inputType == "deleteContentForward" && n.observer.flushSoon(), ge.safari && e.inputType == "insertText" && n.inputState.composing >= 0 && setTimeout(() => ln.compositionend(n, e), 20), !1;
};
const If = /* @__PURE__ */ new Set();
function dw(n) {
  If.has(n) || (If.add(n), n.addEventListener("copy", () => {
  }), n.addEventListener("cut", () => {
  }));
}
const Rf = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let no = !1;
function Pf() {
  no = !1;
}
class pw {
  constructor(e) {
    this.lineWrapping = e, this.doc = nt.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Rf.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      s < 0 ? i++ : this.heightSamples[Math.floor(s * 10)] || (t = !0, this.heightSamples[Math.floor(s * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, s, o, r) {
    let l = Rf.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = t, this.charWidth = i, this.textHeight = s, this.lineLength = o, a) {
      this.heightSamples = {};
      for (let u = 0; u < r.length; u++) {
        let c = r[u];
        c < 0 ? u++ : this.heightSamples[Math.floor(c * 10)] = !0;
      }
    }
    return a;
  }
}
class gw {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class In {
  /**
  @internal
  */
  constructor(e, t, i, s, o) {
    this.from = e, this.length = t, this.top = i, this.height = s, this._content = o;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? jt.Text : Array.isArray(this._content) ? this._content : this._content.type;
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
    return this._content instanceof Ms ? this._content.widget : null;
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
    return new In(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var wt = /* @__PURE__ */ (function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
})(wt || (wt = {}));
const ul = 1e-3;
class rn {
  constructor(e, t, i = 2) {
    this.length = e, this.height = t, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > ul && (no = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return rn.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, s) {
    let o = this, r = i.doc;
    for (let l = s.length - 1; l >= 0; l--) {
      let { fromA: a, toA: u, fromB: c, toB: h } = s[l], f = o.lineAt(a, wt.ByPosNoHeight, i.setDoc(t), 0, 0), d = f.to >= u ? f : o.lineAt(u, wt.ByPosNoHeight, i, 0, 0);
      for (h += d.to - u, u = d.to; l > 0 && f.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < f.from && (f = o.lineAt(a, wt.ByPosNoHeight, i, 0, 0));
      c += f.from - a, a = f.from;
      let g = zc.build(i.setDoc(r), e, c, h);
      o = El(o, o.replace(a, u, g));
    }
    return o.updateHeight(i, 0);
  }
  static empty() {
    return new dn(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, s = 0, o = 0;
    for (; ; )
      if (t == i)
        if (s > o * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), i += 1 + l.break, s -= l.size;
        } else if (o > s * 2) {
          let l = e[i];
          l.break ? e.splice(i, 1, l.left, null, l.right) : e.splice(i, 1, l.left, l.right), i += 2 + l.break, o -= l.size;
        } else
          break;
      else if (s < o) {
        let l = e[t++];
        l && (s += l.size);
      } else {
        let l = e[--i];
        l && (o += l.size);
      }
    let r = !1;
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, i++), new vw(rn.of(e.slice(0, t)), r, rn.of(e.slice(i)));
  }
}
function El(n, e) {
  return n == e ? n : (n.constructor != e.constructor && (no = !0), e);
}
rn.prototype.size = 1;
const mw = /* @__PURE__ */ Ct.replace({});
class pm extends rn {
  constructor(e, t, i) {
    super(e, t), this.deco = i, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new In(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, i, s) {
    return this.spaceAbove && e < i + this.spaceAbove ? new In(s, 0, i, this.spaceAbove, mw) : this.mainBlock(i, s);
  }
  lineAt(e, t, i, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, i, s, o).join(r) : r;
  }
  forEachLine(e, t, i, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, wt.ByPos, i, s, o));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more && this.setMeasuredHeight(s), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class dn extends pm {
  constructor(e, t, i) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = i;
  }
  mainBlock(e, t) {
    return new In(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, i) {
    let s = i[0];
    return i.length == 1 && (s instanceof dn || s instanceof Wt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof Wt ? s = new dn(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : rn.of(i);
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (i || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Wt extends rn {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let i = e.doc.lineAt(t).number, s = e.doc.lineAt(t + this.length).number, o = s - i + 1, r, l = 0;
    if (e.lineWrapping) {
      let a = Math.min(this.height, e.lineHeight * o);
      r = a / o, this.length > o + 1 && (l = (this.height - a) / (this.length - o - 1));
    } else
      r = this.height / o;
    return { firstLine: i, lastLine: s, perLine: r, perChar: l };
  }
  blockAt(e, t, i, s) {
    let { firstLine: o, lastLine: r, perLine: l, perChar: a } = this.heightMetrics(t, s);
    if (t.lineWrapping) {
      let u = s + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - i) / this.height)) * this.length)), c = t.doc.lineAt(u), h = l + c.length * a, f = Math.max(i, e - h / 2);
      return new In(c.from, c.length, f, h, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - i) / l))), { from: c, length: h } = t.doc.line(o + u);
      return new In(c, h, i + l * u, l, 0);
    }
  }
  lineAt(e, t, i, s, o) {
    if (t == wt.ByHeight)
      return this.blockAt(e, i, s, o);
    if (t == wt.ByPosNoHeight) {
      let { from: d, to: g } = i.doc.lineAt(e);
      return new In(d, g - d, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(i, o), u = i.doc.lineAt(e), c = l + u.length * a, h = u.number - r, f = s + l * h + a * (u.from - o - h);
    return new In(u.from, u.length, Math.max(s, Math.min(f, s + this.height - c)), c, 0);
  }
  forEachLine(e, t, i, s, o, r) {
    e = Math.max(e, o), t = Math.min(t, o + this.length);
    let { firstLine: l, perLine: a, perChar: u } = this.heightMetrics(i, o);
    for (let c = e, h = s; c <= t; ) {
      let f = i.doc.lineAt(c);
      if (c == e) {
        let g = f.number - l;
        h += a * g + u * (e - o - g);
      }
      let d = a + u * f.length;
      r(new In(f.from, f.length, h, d, 0)), h += d, c = f.to + 1;
    }
  }
  replace(e, t, i) {
    let s = this.length - t;
    if (s > 0) {
      let o = i[i.length - 1];
      o instanceof Wt ? i[i.length - 1] = new Wt(o.length + s) : i.push(null, new Wt(s - 1));
    }
    if (e > 0) {
      let o = i[0];
      o instanceof Wt ? i[0] = new Wt(e + o.length) : i.unshift(new Wt(e - 1), null);
    }
    return rn.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new Wt(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new Wt(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new Wt(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let h = s.heights[s.index++], f = 0;
        h < 0 && (f = -h, h = s.heights[s.index++]), a == -1 ? a = h : Math.abs(h - a) >= ul && (a = -2);
        let d = new dn(c, h, f);
        d.outdated = !1, r.push(d), l += c + 1;
      }
      l <= o && r.push(null, new Wt(o - l).updateHeight(e, l));
      let u = rn.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= ul || Math.abs(a - this.heightMetrics(e, t).perLine) >= ul) && (no = !0), El(this, u);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class vw extends rn {
  constructor(e, t, i) {
    super(e.length + (t ? 1 : 0) + i.length, e.height + i.height, (t ? 1 : 0) | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  // Returns 1 if there is a line break between this.left and
  // this.right, 0 otherwise.
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, s) {
    let o = i + this.left.height;
    return e < o ? this.left.blockAt(e, t, i, s) : this.right.blockAt(e, t, o, s + this.left.length + this.break);
  }
  lineAt(e, t, i, s, o) {
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == wt.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, i, s, o) : this.right.lineAt(e, t, i, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == wt.ByPosNoHeight ? wt.ByPosNoHeight : wt.ByPos;
    return a ? u.join(this.right.lineAt(l, c, i, r, l)) : this.left.lineAt(l, c, i, s, o).join(u);
  }
  forEachLine(e, t, i, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, s, o, r), t >= a && this.right.forEachLine(e, t, i, l, a, r);
    else {
      let u = this.lineAt(a, wt.ByPos, i, s, o);
      e < u.from && this.left.forEachLine(e, Math.min(t, u.from - 1), i, s, o, r), u.to >= e && u.from <= t && r(u), t > u.to && this.right.forEachLine(Math.max(e, u.to + 1), t, i, l, a, r);
    }
  }
  replace(e, t, i) {
    let s = this.left.length + this.break;
    if (t < s)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - s, t - s, i));
    let o = [];
    e > 0 && this.decomposeLeft(e, o);
    let r = o.length;
    for (let l of i)
      o.push(l);
    if (e > 0 && _f(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), _f(o, l);
    }
    return rn.of(o);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, s = i + this.break;
    if (e >= s)
      return this.right.decomposeRight(e - s, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < s && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? rn.of(this.break ? [e, null, t] : [e, t]) : (this.left = El(this.left, e), this.right = El(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, i, s) : o.updateHeight(e, t, i), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, i, s) : r.updateHeight(e, l, i), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function _f(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof Wt && (i = n[e + 1]) instanceof Wt && n.splice(e - 1, 3, new Wt(t.length + 1 + i.length));
}
const yw = 5;
class zc {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof dn ? s.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new dn(i - this.pos, -1, 0)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let s = i.widget ? i.widget.estimatedHeight : 0, o = i.widget ? i.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      i.block ? this.addBlock(new pm(r, s, i)) : (r || o || s >= yw) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new dn(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new Wt(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof dn)
      return e;
    let t = new dn(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, i) {
    let s = this.ensureLine();
    s.length += i, s.collapsed += i, s.widgetHeight = Math.max(s.widgetHeight, e), s.breaks += t, this.writtenTo = this.pos = this.pos + i;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof dn) && !this.isCovered ? this.nodes.push(new dn(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let s of this.nodes)
      s instanceof dn && s.updateHeight(this.oracle, i), i += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, i, s) {
    let o = new zc(i, e);
    return Ye.spans(t, i, s, o, 0), o.finish(i);
  }
}
function bw(n, e, t) {
  let i = new xw();
  return Ye.compare(n, e, t, i, 0), i.changes;
}
class xw {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, s) {
    (e < t || i && i.heightRelevant || s && s.heightRelevant) && js(e, t, this.changes, 5);
  }
}
function ww(n, e) {
  let t = n.getBoundingClientRect(), i = n.ownerDocument, s = i.defaultView || window, o = Math.max(0, t.left), r = Math.min(s.innerWidth, t.right), l = Math.max(0, t.top), a = Math.min(s.innerHeight, t.bottom);
  for (let u = n.parentNode; u && u != i.body; )
    if (u.nodeType == 1) {
      let c = u, h = window.getComputedStyle(c);
      if ((c.scrollHeight > c.clientHeight || c.scrollWidth > c.clientWidth) && h.overflow != "visible") {
        let f = c.getBoundingClientRect();
        o = Math.max(o, f.left), r = Math.min(r, f.right), l = Math.max(l, f.top), a = Math.min(u == n.parentNode ? s.innerHeight : a, f.bottom);
      }
      u = h.position == "absolute" || h.position == "fixed" ? c.offsetParent : c.parentNode;
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
function kw(n) {
  let e = n.getBoundingClientRect(), t = n.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function Sw(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Ya {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.size = i, this.displaySize = s;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i], o = t[i];
      if (s.from != o.from || s.to != o.to || s.size != o.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return Ct.replace({
      widget: new Cw(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Cw extends pr {
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
class Nf {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Vf, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = St.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let i = t.facet(Nc).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new pw(i), this.stateDeco = Hf(t), this.heightMap = rn.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle.setDoc(t.doc), [new Sn(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = Ct.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let s = i ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new Pr(o, r));
      }
    }
    return this.viewports = e.sort((i, s) => i.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Vf : new Wc(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push($o(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = Hf(this.state);
    let s = e.changedRanges, o = Sn.extendWithRanges(s, bw(i, this.stateDeco, e ? e.changes : Ht.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Pf(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || no) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Gg) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, i = window.getComputedStyle(t), s = this.heightOracle, o = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? St.RTL : St.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: B, scaleY: z } = Tg(t, l);
      (B > 5e-3 && Math.abs(this.scaleX - B) > 5e-3 || z > 5e-3 && Math.abs(this.scaleY - z) > 5e-3) && (this.scaleX = B, this.scaleY = z, u |= 16, r = a = !0);
    }
    let h = (parseInt(i.paddingTop) || 0) * this.scaleY, f = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != h || this.paddingBottom != f) && (this.paddingTop = h, this.paddingBottom = f, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let d = $g(this.view.contentDOM, !1).y;
    d != this.scrollParent && (this.scrollParent = d, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let g = this.getScrollOffset();
    this.scrollOffset != g && (this.scrollAnchorHeight = -1, this.scrollOffset = g), this.scrolledToBottom = Eg(this.scrollParent || e.win);
    let v = (this.printing ? Sw : ww)(t, this.paddingTop), m = v.top - this.pixelViewport.top, b = v.bottom - this.pixelViewport.bottom;
    this.pixelViewport = v;
    let O = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (O != this.inView && (this.inView = O, O && (a = !0)), !this.inView && !this.scrollTarget && !kw(e.dom))
      return 0;
    let L = l.width;
    if ((this.contentDOMWidth != L || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let B = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(B) && (r = !0), r || s.lineWrapping && Math.abs(L - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: z, charWidth: P, textHeight: Y } = e.docView.measureTextSize();
        r = z > 0 && s.refresh(o, z, P, Y, Math.max(5, L / P), B), r && (e.docView.minWidth = 0, u |= 16);
      }
      m > 0 && b > 0 ? c = Math.max(m, b) : m < 0 && b < 0 && (c = Math.min(m, b)), Pf();
      for (let z of this.viewports) {
        let P = z.from == this.viewport.from ? B : e.docView.measureVisibleLineHeights(z);
        this.heightMap = (r ? rn.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle, [new Sn(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new gw(z.from, P));
      }
      no && (u |= 2);
    }
    let E = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return E && (u & 2 && (u |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), u |= this.updateForViewport()), (u & 2 || E) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(r ? [] : this.lineGaps, e)), u |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), u;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new Pr(s.lineAt(r - i * 1e3, wt.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - i) * 1e3, wt.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), h = s.lineAt(u, wt.ByPos, o, 0, 0), f;
        t.y == "center" ? f = (h.top + h.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? f = h.top : f = h.bottom - c, a = new Pr(s.lineAt(f - 1e3 / 2, wt.ByHeight, o, 0, 0).from, s.lineAt(f + c + 1e3 / 2, wt.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new Pr(this.heightMap.lineAt(i, wt.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, wt.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, wt.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, wt.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
    return (e == 0 || s <= r - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || o >= l + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && s > r - 2 * 1e3 && o < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let s of e)
      t.touchesRange(s.from, s.to) || i.push(new Ya(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let i = this.heightOracle.lineWrapping, s = i ? 1e4 : 2e3, o = s >> 1, r = s << 1;
    if (this.defaultTextDirection != St.LTR && !i)
      return [];
    let l = [], a = (c, h, f, d) => {
      if (h - c < o)
        return;
      let g = this.state.selection.main, v = [g.from];
      g.empty || v.push(g.to);
      for (let b of v)
        if (b > c && b < h) {
          a(c, b - 10, f, d), a(b + 10, h, f, d);
          return;
        }
      let m = Aw(e, (b) => b.from >= f.from && b.to <= f.to && Math.abs(b.from - c) < o && Math.abs(b.to - h) < o && !v.some((O) => b.from < O && b.to > O));
      if (!m) {
        if (h < f.to && t && i && t.visibleRanges.some((L) => L.from <= h && L.to >= h)) {
          let L = t.moveToLineBoundary(te.cursor(h), !1, !0).head;
          L > c && (h = L);
        }
        let b = this.gapSize(f, c, h, d), O = i || b < 2e6 ? b : 2e6;
        m = new Ya(c, h, b, O);
      }
      l.push(m);
    }, u = (c) => {
      if (c.length < r || c.type != jt.Text)
        return;
      let h = Mw(c.from, c.to, this.stateDeco);
      if (h.total < r)
        return;
      let f = this.scrollTarget ? this.scrollTarget.range.head : null, d, g;
      if (i) {
        let v = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, m, b;
        if (f != null) {
          let O = Nr(h, f), L = ((this.visibleBottom - this.visibleTop) / 2 + v) / c.height;
          m = O - L, b = O + L;
        } else
          m = (this.visibleTop - c.top - v) / c.height, b = (this.visibleBottom - c.top + v) / c.height;
        d = _r(h, m), g = _r(h, b);
      } else {
        let v = h.total * this.heightOracle.charWidth, m = s * this.heightOracle.charWidth, b = 0;
        if (v > 2e6)
          for (let z of e)
            z.from >= c.from && z.from < c.to && z.size != z.displaySize && z.from * this.heightOracle.charWidth + b < this.pixelViewport.left && (b = z.size - z.displaySize);
        let O = this.pixelViewport.left + b, L = this.pixelViewport.right + b, E, B;
        if (f != null) {
          let z = Nr(h, f), P = ((L - O) / 2 + m) / v;
          E = z - P, B = z + P;
        } else
          E = (O - m) / v, B = (L + m) / v;
        d = _r(h, E), g = _r(h, B);
      }
      d > c.from && a(c.from, d, c, h), g < c.to && a(g, c.to, c, h);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, i, s) {
    let o = Nr(s, i) - Nr(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    Ya.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Ct.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let i = [];
    Ye.spans(t, this.viewport.from, this.viewport.to, {
      span(o, r) {
        i.push({ from: o, to: r });
      },
      point() {
      }
    }, 20);
    let s = 0;
    if (i.length != this.visibleRanges.length)
      s = 12;
    else
      for (let o = 0; o < i.length && !(s & 8); o++) {
        let r = this.visibleRanges[o], l = i[o];
        (r.from != l.from || r.to != l.to) && (s |= 4, e && e.mapPos(r.from, -1) == l.from && e.mapPos(r.to, 1) == l.to || (s |= 8));
      }
    return this.visibleRanges = i, s;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || $o(this.heightMap.lineAt(e, wt.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || $o(this.heightMap.lineAt(this.scaler.fromDOM(e), wt.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return $o(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Pr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Mw(n, e, t) {
  let i = [], s = n, o = 0;
  return Ye.spans(t, n, e, {
    span() {
    },
    point(r, l) {
      r > s && (i.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (i.push({ from: s, to: e }), o += e - s), { total: o, ranges: i };
}
function _r({ total: n, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(n * t);
  for (let s = 0; ; s++) {
    let { from: o, to: r } = e[s], l = r - o;
    if (i <= l)
      return o + i;
    i -= l;
  }
}
function Nr(n, e) {
  let t = 0;
  for (let { from: i, to: s } of n.ranges) {
    if (e <= s) {
      t += e - i;
      break;
    }
    t += s - i;
  }
  return t / n.total;
}
function Aw(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const Vf = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1,
  eq(n) {
    return n == this;
  }
};
function Hf(n) {
  let e = n.facet(ra).filter((i) => typeof i != "function"), t = n.facet(Vc).filter((i) => typeof i != "function");
  return t.length && e.push(Ye.join(t)), e;
}
class Wc {
  constructor(e, t, i) {
    let s = 0, o = 0, r = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, wt.ByPos, e, 0, 0).top, c = t.lineAt(a, wt.ByPos, e, 0, 0).bottom;
      return s += c - u, { from: l, to: a, top: u, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - s) / (t.height - s);
    for (let l of this.viewports)
      l.domTop = r + (l.top - o) * this.scale, r = l.domBottom = l.domTop + (l.bottom - l.top), o = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, i = 0, s = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.top)
        return s + (e - i) * this.scale;
      if (e <= o.bottom)
        return o.domTop + (e - o.top);
      i = o.bottom, s = o.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, s = 0; ; t++) {
      let o = t < this.viewports.length ? this.viewports[t] : null;
      if (!o || e < o.domTop)
        return i + (e - s) / this.scale;
      if (e <= o.domBottom)
        return o.top + (e - o.domTop);
      i = o.bottom, s = o.domBottom;
    }
  }
  eq(e) {
    return e instanceof Wc ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function $o(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new In(n.from, n.length, t, i - t, Array.isArray(n._content) ? n._content.map((s) => $o(s, e)) : n._content);
}
const Vr = /* @__PURE__ */ we.define({ combine: (n) => n.join(" ") }), qu = /* @__PURE__ */ we.define({ combine: (n) => n.indexOf(!0) > -1 }), Yu = /* @__PURE__ */ Ji.newName(), gm = /* @__PURE__ */ Ji.newName(), mm = /* @__PURE__ */ Ji.newName(), vm = { "&light": "." + gm, "&dark": "." + mm };
function Xu(n, e, t) {
  return new Ji(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (s) => {
        if (s == "&")
          return n;
        if (!t || !t[s])
          throw new RangeError(`Unsupported selector: ${s}`);
        return t[s];
      }) : n + " " + i;
    }
  });
}
const Tw = /* @__PURE__ */ Xu("." + Yu, {
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
}, vm), $w = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Xa = ge.ie && ge.ie_version <= 11;
class Dw {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new sx(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (ge.ie && ge.ie_version <= 11 || ge.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && ge.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(ge.chrome && ge.chrome_version < 126) && (this.editContext = new Lw(e), e.state.facet(bi) && (e.contentDOM.editContext = this.editContext.editContext)), Xa && (this.onCharData = (t) => {
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
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))) {
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
    let { view: i } = this, s = this.selectionRange;
    if (i.state.facet(bi) ? i.root.activeElement != this.dom : !Vo(this.dom, s))
      return;
    let o = s.anchorNode && i.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (ge.ie && ge.ie_version <= 11 || ge.android && ge.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Ho(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = ir(e.root);
    if (!t)
      return !1;
    let i = ge.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Ow(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let s = Vo(this.dom, i);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && rx(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), s && (this.selectionChanged = !0), !0);
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
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == i ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = t)
        i.addEventListener("scroll", this.onScroll);
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
    this.active || (this.observer.observe(this.dom, $w), Xa && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), Xa && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
    var i;
    if (!this.delayedAndroidKey) {
      let s = () => {
        let o = this.delayedAndroidKey;
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && Gs(this.dom, o.key, o.keyCode));
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
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
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
    let t = -1, i = -1, s = !1;
    for (let o of e) {
      let r = this.readMutation(o);
      r && (r.typeOver && (s = !0), t == -1 ? { from: t, to: i } = r : (t = Math.min(r.from, t), i = Math.max(r.to, i)));
    }
    return { from: t, to: i, typeOver: s };
  }
  readChange() {
    let { from: e, to: t, typeOver: i } = this.processRecords(), s = this.selectionChanged && Vo(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Gx(this.view, e, t, i);
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
    let i = this.view.state, s = sm(this.view, t);
    return this.view.state == i && (t.domChanged || t.newSel && !Ll(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let i = Ff(t, e.previousSibling || e.target.previousSibling, -1), s = Ff(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
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
    this.editContext && (this.editContext.update(e), e.startState.facet(bi) != e.state.facet(bi) && (e.view.contentDOM.editContext = e.state.facet(bi) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Ff(n, e, t) {
  for (; e; ) {
    let i = Dt.get(e);
    if (i && i.parent == n)
      return i;
    let s = e.parentNode;
    e = s != n.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function zf(n, e) {
  let t = e.startContainer, i = e.startOffset, s = e.endContainer, o = e.endOffset, r = n.docView.domAtPos(n.state.selection.main.anchor, 1);
  return Ho(r.node, r.offset, s, o) && ([t, i, s, o] = [s, o, t, i]), { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o };
}
function Ow(n, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(n.root)[0];
    if (s)
      return zf(n, s);
  }
  let t = null;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return n.contentDOM.addEventListener("beforeinput", i, !0), n.dom.ownerDocument.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", i, !0), t ? zf(n, t) : null;
}
class Lw {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (i) => {
      let s = e.state.selection.main, { anchor: o, head: r } = s, l = this.toEditorPos(i.updateRangeStart), a = this.toEditorPos(i.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: i.updateRangeStart, editorBase: l, drifted: !1 });
      let u = a - l > i.text.length;
      l == this.from && o < this.from ? l = o : a == this.to && o > this.to && (a = o);
      let c = om(e.state.sliceDoc(l, a), i.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let f = te.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd));
        Ll(f, s) || e.dispatch({ selection: f, userEvent: "select" });
        return;
      }
      let h = {
        from: c.from + l,
        to: c.toA + l,
        insert: nt.of(i.text.slice(c.from, c.toB).split(`
`))
      };
      if ((ge.mac || ge.android) && h.from == r - 1 && /^\. ?$/.test(i.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (h = { from: l, to: a, insert: nt.of([i.text.replace(".", " ")]) }), this.pendingContextChange = h, !e.state.readOnly) {
        let f = this.to - this.from + (h.to - h.from + h.insert.length);
        Fc(e, h, te.single(this.toEditorPos(i.selectionStart, f), this.toEditorPos(i.selectionEnd, f)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), h.from < h.to && !h.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, i.updateRangeStart - 1), Math.min(t.text.length, i.updateRangeStart + 1))) && this.handlers.compositionend(i);
    }, this.handlers.characterboundsupdate = (i) => {
      let s = [], o = null;
      for (let r = this.toEditorPos(i.rangeStart), l = this.toEditorPos(i.rangeEnd); r < l; r++) {
        let a = e.coordsForChar(r);
        o = a && new DOMRect(a.left, a.top, a.right - a.left, a.bottom - a.top) || o || new DOMRect(), s.push(o);
      }
      t.updateCharacterBounds(i.rangeStart, s);
    }, this.handlers.textformatupdate = (i) => {
      let s = [];
      for (let o of i.getTextFormats()) {
        let r = o.underlineStyle, l = o.underlineThickness;
        if (!/none/i.test(r) && !/none/i.test(l)) {
          let a = this.toEditorPos(o.rangeStart), u = this.toEditorPos(o.rangeEnd);
          if (a < u) {
            let c = `text-decoration: underline ${/^[a-z]/.test(r) ? r + " " : r == "Dashed" ? "dashed " : r == "Squiggle" ? "wavy " : ""}${/thin/i.test(l) ? 1 : 2}px`;
            s.push(Ct.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: Yg.of(Ct.set(s)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: i } = this.composing;
        this.composing = null, i && this.reset(e.state);
      }
    };
    for (let i in this.handlers)
      t.addEventListener(i, this.handlers[i]);
    this.measureReq = { read: (i) => {
      let s = ir(i.root);
      s && s.rangeCount && this.editContext.updateSelectionBounds(s.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, i = !1, s = this.pendingContextChange;
    return e.changes.iterChanges((o, r, l, a, u) => {
      if (i)
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
          i = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(o), this.toContextPos(r), u.toString()), this.to += c;
      }
      t += c;
    }), s && !i && this.revertPending(e.state), !i;
  }
  update(e) {
    let t = this.pendingContextChange, i = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(i.from, i.to) && e.transactions.some((s) => !s.isUserEvent("input.type") && s.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
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
    let { main: t } = e.selection, i = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), s = this.toContextPos(t.head);
    (this.editContext.selectionStart != i || this.editContext.selectionEnd != s) && this.editContext.updateSelection(i, s);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let i = this.composing;
    return i && i.drifted ? i.editorBase + (e - i.contextBase) : e + this.from;
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
class De {
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
    let { dispatch: i } = e;
    this.dispatchTransactions = e.dispatchTransactions || i && ((s) => s.forEach((o) => i(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || ox(e.parent) || document, this.viewState = new Nf(this, e.state || lt.create(e)), e.scrollTo && e.scrollTo.is(Br) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(_s).map((s) => new Ka(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Dw(this), this.inputState = new Jx(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Mf(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof Zt ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
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
    let t = !1, i = !1, s, o = this.state;
    for (let f of e) {
      if (f.startState != o)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      o = f.state;
    }
    if (this.destroyed) {
      this.viewState.state = o;
      return;
    }
    let r = this.hasFocus, l = 0, a = null;
    e.some((f) => f.annotation(hm)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = fm(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(lt.phrases) != this.state.facet(lt.phrases))
      return this.setState(o);
    s = $l.create(this, o, e), s.flags |= l;
    let h = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let f of e) {
        if (h && (h = h.map(f.changes)), f.scrollIntoView) {
          let { main: d } = f.state.selection, { x: g, y: v } = this.state.facet(De.cursorScrollMargin);
          h = new qs(d.empty ? d : te.cursor(d.head, d.head > d.anchor ? -1 : 1), "nearest", "nearest", v, g);
        }
        for (let d of f.effects)
          d.is(Br) && (h = d.value.clip(this.state));
      }
      this.viewState.update(s, h), this.bidiCache = Bl.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(To) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((f) => f.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Vr) != s.state.facet(Vr) && (this.viewState.mustMeasureContent = !0), (t || i || h || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let f of this.state.facet(Wu))
        try {
          f(s);
        } catch (d) {
          Pn(this.state, d, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !sm(this, c) && u.force && Gs(this.contentDOM, u.key, u.keyCode);
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
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new Nf(this, e), this.plugins = e.facet(_s).map((i) => new Ka(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Mf(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(_s), i = e.state.facet(_s);
    if (t != i) {
      let s = [];
      for (let o of i) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new Ka(o));
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
    t != i && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (i) {
          Pn(this.state, i, "doc view update listener");
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
    let t = null, i = this.viewState.scrollParent, s = this.viewState.getScrollOffset(), { scrollAnchorPos: o, scrollAnchorHeight: r, scaleY: l } = this.viewState;
    Math.abs(s - this.viewState.scrollOffset) > 1 && (r = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let a = 0; ; a++) {
        if (r < 0) {
          if (Eg(i || this.win))
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
        let h = c.map((g) => {
          try {
            return g.read(this);
          } catch (v) {
            return Pn(this.state, v), Wf;
          }
        }), f = $l.create(this, this.state, []), d = !1;
        f.flags |= u, t ? t.flags |= u : t = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), d = this.docView.update(f), d && this.docViewUpdate());
        for (let g = 0; g < c.length; g++)
          if (h[g] != Wf)
            try {
              let v = c[g];
              v.write && v.write(h[g], this);
            } catch (v) {
              Pn(this.state, v);
            }
        if (d && this.docView.updateSelection(!0), !f.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, r = -1;
              continue;
            } else {
              let v = (o < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(o).top) / this.viewState.scaleY - r / l;
              if ((v > 1 || v < -1) && !(ge.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (i == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                s = s + v, i ? o < 0 ? i.scrollTop = i.scrollHeight : i.scrollTop += v : this.win.scrollBy(0, v), r = -1;
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
      for (let a of this.state.facet(Wu))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return Yu + " " + (this.state.facet(qu) ? mm : gm) + " " + this.state.facet(Vr);
  }
  updateAttrs() {
    let e = Kf(this, Xg, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(bi) ? "true" : "false",
      class: "cm-content",
      style: `${ge.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), Kf(this, Nc, t);
    let i = this.observer.ignore(() => {
      let s = bf(this.contentDOM, this.contentAttrs, t), o = bf(this.dom, this.editorAttrs, e);
      return s || o;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let s of i.effects)
        if (s.is(De.announce)) {
          t && (this.announceDOM.textContent = "", this.win.clearTimeout(this.clearAnnouncement), this.clearAnnouncement = this.win.setTimeout(() => {
            this.announceDOM.textContent = " ";
          }, 200), t = !1);
          let o = this.announceDOM.appendChild(document.createElement("div"));
          o.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(To);
    let e = this.state.facet(De.cspNonce);
    Ji.mount(this.root, this.styleModules.concat(Tw).reverse(), e ? { nonce: e } : void 0);
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
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((i) => i.plugin == e) || null), t && t.update(this).value;
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
  moveByChar(e, t, i) {
    return qa(this, e, Af(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return qa(this, e, Af(this, e, t, (i) => Fx(this, e.head, i)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? te.cursor(e.to, 1) : te.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, i = !0) {
    return Hx(this, e, t, i);
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
  moveVertically(e, t, i) {
    return qa(this, e, zx(this, e, t, i));
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
    let i = ju(this, e, t);
    return i && i.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), ju(this, e, t);
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
    let i = this.state.doc.lineAt(e), s = this.bidiSpans(i), o = s[ai.find(s, e - i.from, -1, t)];
    return i.length && (e == i.from && t < 0 || e == i.to && t > 0) && o.dir != this.textDirectionAt(i.from) && (e == i.to ? (e = i.from + o.from, t = 1) : (e = i.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == St.RTL);
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
    return !this.state.facet(jg) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > Ew)
      return Ng(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || _g(o.isolates, i = kf(this, e))))
        return o.order;
    i || (i = kf(this, e));
    let s = dx(e.text, t, i);
    return this.bidiCache.push(new Bl(e.from, e.to, t, i, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || ge.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Lg(this.contentDOM), this.docView.updateSelection();
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
    var i, s, o, r;
    return Br.of(new qs(typeof e == "number" ? te.cursor(e) : e, (i = t.y) !== null && i !== void 0 ? i : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, i = this.viewState.scrollAnchorAt(e);
    return Br.of(new qs(te.cursor(i.from), "start", "start", i.top - e, t, !0));
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
    return gn.define(() => ({}), { eventHandlers: e });
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
    return gn.define(() => ({}), { eventObservers: e });
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
    let i = Ji.newName(), s = [Vr.of(i), To.of(Xu(`.${i}`, e))];
    return t && t.dark && s.push(qu.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return ta.lowest(To.of(Xu("." + Yu, e, vm)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), s = i && Dt.get(i) || Dt.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
De.styleModule = To;
De.inputHandler = Kg;
De.clipboardInputFilter = Pc;
De.clipboardOutputFilter = _c;
De.scrollHandler = qg;
De.focusChangeEffect = Ug;
De.perLineTextDirection = jg;
De.exceptionSink = Wg;
De.updateListener = Wu;
De.editable = bi;
De.mouseSelectionStyle = zg;
De.dragMovesSelection = Fg;
De.clickAddsSelectionRange = Hg;
De.decorations = ra;
De.blockWrappers = Jg;
De.outerDecorations = Vc;
De.atomicRanges = vr;
De.bidiIsolatedRanges = Zg;
De.cursorScrollMargin = /* @__PURE__ */ we.define({
  combine: (n) => {
    let e = 5, t = 5;
    for (let i of n)
      typeof i == "number" ? e = t = i : { x: e, y: t } = i;
    return { x: e, y: t };
  }
});
De.scrollMargins = Qg;
De.darkTheme = qu;
De.cspNonce = /* @__PURE__ */ we.define({ combine: (n) => n.length ? n[0] : "" });
De.contentAttributes = Nc;
De.editorAttributes = Xg;
De.lineWrapping = /* @__PURE__ */ De.contentAttributes.of({ class: "cm-lineWrapping" });
De.announce = /* @__PURE__ */ kt.define();
const Ew = 4096, Wf = {};
class Bl {
  constructor(e, t, i, s, o, r) {
    this.from = e, this.to = t, this.dir = i, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let i = [], s = e.length ? e[e.length - 1].dir : St.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && i.push(new Bl(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return i;
  }
}
function Kf(n, e, t) {
  for (let i = n.state.facet(e), s = i.length - 1; s >= 0; s--) {
    let o = i[s], r = typeof o == "function" ? o(n) : o;
    r && Bc(r, t);
  }
  return t;
}
const Bw = ge.mac ? "mac" : ge.windows ? "win" : ge.linux ? "linux" : "key";
function Iw(n, e) {
  const t = n.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
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
  return s && (i = "Alt-" + i), o && (i = "Ctrl-" + i), l && (i = "Meta-" + i), r && (i = "Shift-" + i), i;
}
function Hr(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const Rw = /* @__PURE__ */ ta.default(/* @__PURE__ */ De.domEventHandlers({
  keydown(n, e) {
    return Vw(Pw(e.state), n, e, "editor");
  }
})), ym = /* @__PURE__ */ we.define({ enables: Rw }), Uf = /* @__PURE__ */ new WeakMap();
function Pw(n) {
  let e = n.facet(ym), t = Uf.get(e);
  return t || Uf.set(e, t = Nw(e.reduce((i, s) => i.concat(s), []))), t;
}
let Hi = null;
const _w = 4e3;
function Nw(n, e = Bw) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = i[r];
    if (a == null)
      i[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var h, f;
    let d = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), g = l.split(/ (?!$)/).map((b) => Iw(b, e));
    for (let b = 1; b < g.length; b++) {
      let O = g.slice(0, b).join(" ");
      s(O, !0), d[O] || (d[O] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(L) => {
          let E = Hi = { view: L, prefix: O, scope: r };
          return setTimeout(() => {
            Hi == E && (Hi = null);
          }, _w), !0;
        }]
      });
    }
    let v = g.join(" ");
    s(v, !1);
    let m = d[v] || (d[v] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((f = (h = d._any) === null || h === void 0 ? void 0 : h.run) === null || f === void 0 ? void 0 : f.slice()) || []
    });
    a && m.run.push(a), u && (m.preventDefault = !0), c && (m.stopPropagation = !0);
  };
  for (let r of n) {
    let l = r.scope ? r.scope.split(" ") : ["editor"];
    if (r.any)
      for (let u of l) {
        let c = t[u] || (t[u] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: h } = r;
        for (let f in c)
          c[f].run.push((d) => h(d, Ju));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Ju = null;
function Vw(n, e, t, i) {
  Ju = e;
  let s = Z1(e), o = I1(s, 0), r = R1(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  Hi && Hi.view == t && Hi.scope == i && (l = Hi.prefix + " ", lm.indexOf(e.keyCode) < 0 && (u = !0, Hi = null));
  let h = /* @__PURE__ */ new Set(), f = (m) => {
    if (m) {
      for (let b of m.run)
        if (!h.has(b) && (h.add(b), b(t)))
          return m.stopPropagation && (c = !0), !0;
      m.preventDefault && (m.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, d = n[i], g, v;
  return d && (f(d[l + Hr(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(ge.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(ge.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (g = Zi[e.keyCode]) && g != s ? (f(d[l + Hr(g, e, !0)]) || e.shiftKey && (v = tr[e.keyCode]) != s && v != g && f(d[l + Hr(v, e, !1)])) && (a = !0) : r && e.shiftKey && f(d[l + Hr(s, e, !0)]) && (a = !0), !a && f(d._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Ju = null, a;
}
class ks {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(e, t, i, s, o) {
    this.className = e, this.left = t, this.top = i, this.width = s, this.height = o;
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
  static forRange(e, t, i) {
    if (i.empty) {
      let s = e.coordsAtPos(i.head, i.assoc || 1);
      if (!s)
        return [];
      let o = bm(e);
      return [new ks(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Hw(e, t, i);
  }
}
function bm(n) {
  let e = n.scrollDOM.getBoundingClientRect();
  return { left: (n.textDirection == St.LTR ? e.left : e.right - n.scrollDOM.clientWidth * n.scaleX) - n.scrollDOM.scrollLeft * n.scaleX, top: e.top - n.scrollDOM.scrollTop * n.scaleY };
}
function jf(n, e, t, i) {
  let s = n.coordsAtPos(e, t * 2);
  if (!s)
    return i;
  let o = n.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = n.posAtCoords({ x: o.left + 1, y: r }), a = n.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? i : { from: Math.max(i.from, Math.min(l, a)), to: Math.min(i.to, Math.max(l, a)) };
}
function Hw(n, e, t) {
  if (t.to <= n.viewport.from || t.from >= n.viewport.to)
    return [];
  let i = Math.max(t.from, n.viewport.from), s = Math.min(t.to, n.viewport.to), o = n.textDirection == St.LTR, r = n.contentDOM, l = r.getBoundingClientRect(), a = bm(n), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), h = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), f = l.right - (c ? parseInt(c.paddingRight) : 0), d = Uu(n, i, 1), g = Uu(n, s, -1), v = d.type == jt.Text ? d : null, m = g.type == jt.Text ? g : null;
  if (v && (n.lineWrapping || d.widgetLineBreaks) && (v = jf(n, i, 1, v)), m && (n.lineWrapping || g.widgetLineBreaks) && (m = jf(n, s, -1, m)), v && m && v.from == m.from && v.to == m.to)
    return O(L(t.from, t.to, v));
  {
    let B = v ? L(t.from, null, v) : E(d, !1), z = m ? L(null, t.to, m) : E(g, !0), P = [];
    return (v || d).to < (m || g).from - (v && m ? 1 : 0) || d.widgetLineBreaks > 1 && B.bottom + n.defaultLineHeight / 2 < z.top ? P.push(b(h, B.bottom, f, z.top)) : B.bottom < z.top && n.elementAtHeight((B.bottom + z.top) / 2).type == jt.Text && (B.bottom = z.top = (B.bottom + z.top) / 2), O(B).concat(P).concat(O(z));
  }
  function b(B, z, P, Y) {
    return new ks(e, B - a.left, z - a.top, Math.max(0, P - B), Y - z);
  }
  function O({ top: B, bottom: z, horizontal: P }) {
    let Y = [];
    for (let K = 0; K < P.length; K += 2)
      Y.push(b(P[K], B, P[K + 1], z));
    return Y;
  }
  function L(B, z, P) {
    let Y = 1e9, K = -1e9, re = [];
    function j(ke, $e, ce, pe, He) {
      let Oe = n.coordsAtPos(ke, ke == P.to ? -2 : 2), Re = n.coordsAtPos(ce, ce == P.from ? 2 : -2);
      !Oe || !Re || (Y = Math.min(Oe.top, Re.top, Y), K = Math.max(Oe.bottom, Re.bottom, K), He == St.LTR ? re.push(o && $e ? h : Oe.left, o && pe ? f : Re.right) : re.push(!o && pe ? h : Re.left, !o && $e ? f : Oe.right));
    }
    let D = B ?? P.from, U = z ?? P.to;
    for (let ke of n.visibleRanges)
      if (ke.to > D && ke.from < U)
        for (let $e = Math.max(ke.from, D), ce = Math.min(ke.to, U); ; ) {
          let pe = n.state.doc.lineAt($e);
          for (let He of n.bidiSpans(pe)) {
            let Oe = He.from + pe.from, Re = He.to + pe.from;
            if (Oe >= ce)
              break;
            Re > $e && j(Math.max(Oe, $e), B == null && Oe <= D, Math.min(Re, ce), z == null && Re >= U, He.dir);
          }
          if ($e = pe.to + 1, $e >= ce)
            break;
        }
    return re.length == 0 && j(D, B == null, U, z == null, n.textDirection), { top: Y, bottom: K, horizontal: re };
  }
  function E(B, z) {
    let P = l.top + (z ? B.top : B.bottom);
    return { top: P, bottom: P, horizontal: [] };
  }
}
function Fw(n, e) {
  return n.constructor == e.constructor && n.eq(e);
}
class zw {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(cl) != e.state.facet(cl) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, i = e.facet(cl);
    for (; t < i.length && i[t] != this.layer; )
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
    if (e.length != this.drawn.length || e.some((t, i) => !Fw(t, this.drawn[i]))) {
      let t = this.dom.firstChild, i = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[i].constructor && s.update(t, this.drawn[i]) ? (t = t.nextSibling, i++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, ge.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const cl = /* @__PURE__ */ we.define();
function xm(n) {
  return [
    gn.define((e) => new zw(e, n)),
    cl.of(n)
  ];
}
const io = /* @__PURE__ */ we.define({
  combine(n) {
    return ia(n, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Ww(n = {}) {
  return [
    io.of(n),
    Kw,
    Uw,
    Gw,
    Gg.of(!0)
  ];
}
function wm(n) {
  return n.startState.facet(io) != n.state.facet(io);
}
const Kw = /* @__PURE__ */ xm({
  above: !0,
  markers(n) {
    let { state: e } = n, t = e.facet(io), i = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && ge.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : te.cursor(s.head, s.assoc);
        for (let a of ks.forRange(n, r, l))
          i.push(a);
      }
    }
    return i;
  },
  update(n, e) {
    n.transactions.some((i) => i.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = wm(n);
    return t && Gf(n.state, e), n.docChanged || n.selectionSet || t;
  },
  mount(n, e) {
    Gf(e.state, n);
  },
  class: "cm-cursorLayer"
});
function Gf(n, e) {
  e.style.animationDuration = n.facet(io).cursorBlinkRate + "ms";
}
const Uw = /* @__PURE__ */ xm({
  above: !1,
  markers(n) {
    let e = [], { main: t, ranges: i } = n.state.selection;
    for (let s of i)
      if (!s.empty)
        for (let o of ks.forRange(n, "cm-selectionBackground", s))
          e.push(o);
    if (ge.ios && !t.empty && n.state.facet(io).iosSelectionHandles) {
      for (let s of ks.forRange(n, "cm-selectionHandle cm-selectionHandle-start", te.cursor(t.from, 1)))
        e.push(s);
      for (let s of ks.forRange(n, "cm-selectionHandle cm-selectionHandle-end", te.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(n, e) {
    return n.docChanged || n.selectionSet || n.viewportChanged || wm(n);
  },
  class: "cm-selectionLayer"
}), jw = ge.gecko && ge.gecko_version == 153 ? "#ffffff01" : "transparent", Gw = /* @__PURE__ */ ta.highest(/* @__PURE__ */ De.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${jw} !important` },
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
function qw() {
  return Xw;
}
const Yw = /* @__PURE__ */ Ct.line({ class: "cm-activeLine" }), Xw = /* @__PURE__ */ gn.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.docChanged || n.selectionSet) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let e = -1, t = [];
    for (let i of n.state.selection.ranges) {
      let s = n.lineBlockAt(i.head);
      s.from > e && (t.push(Yw.range(s.from)), e = s.from);
    }
    return Ct.set(t);
  }
}, {
  decorations: (n) => n.decorations
}), Fr = "-10000px";
class km {
  constructor(e, t, i, s) {
    this.facet = t, this.createTooltipView = i, this.removeTooltipView = s, this.input = e.state.facet(t), this.tooltips = this.input.filter((r) => r);
    let o = null;
    this.tooltipViews = this.tooltips.map((r) => o = i(r, o));
  }
  update(e, t) {
    var i;
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
        for (let h = 0; h < this.tooltips.length; h++) {
          let f = this.tooltips[h];
          f && f.create == u.create && (c = h);
        }
        if (c < 0)
          r[a] = this.createTooltipView(u, a ? r[a - 1] : null), l && (l[a] = !!u.above);
        else {
          let h = r[a] = this.tooltipViews[c];
          l && (l[a] = t[c]), h.update && h.update(e);
        }
      }
    }
    for (let a of this.tooltipViews)
      r.indexOf(a) < 0 && (this.removeTooltipView(a), (i = a.destroy) === null || i === void 0 || i.call(a));
    return t && (l.forEach((a, u) => t[u] = a), t.length = l.length), this.input = s, this.tooltips = o, this.tooltipViews = r, !0;
  }
}
function Jw(n) {
  let e = n.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const Ja = /* @__PURE__ */ we.define({
  combine: (n) => {
    var e, t, i;
    return {
      position: ge.ios ? "absolute" : ((e = n.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = n.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = n.find((s) => s.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || Jw
    };
  }
}), qf = /* @__PURE__ */ new WeakMap(), Sm = /* @__PURE__ */ gn.fromClass(class {
  constructor(n) {
    this.view = n, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = n.state.facet(Ja);
    this.position = e.position, this.parent = e.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new km(n, Kc, (t, i) => this.createTooltip(t, i), (t) => {
      this.resizeObserver && this.resizeObserver.unobserve(t.dom), t.dom.remove();
    }), this.above = this.manager.tooltips.map((t) => !!t.above), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((t) => {
      Date.now() > this.lastTransaction - 50 && t.length > 0 && t[t.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), n.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let n of this.manager.tooltipViews)
        this.intersectionObserver.observe(n.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(n) {
    n.transactions.length && (this.lastTransaction = Date.now());
    let e = this.manager.update(n, this.above);
    e && this.observeIntersection();
    let t = e || n.geometryChanged, i = n.state.facet(Ja);
    if (i.position != this.position && !this.madeAbsolute) {
      this.position = i.position;
      for (let s of this.manager.tooltipViews)
        s.dom.style.position = this.position;
      t = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let s of this.manager.tooltipViews)
        this.container.appendChild(s.dom);
      t = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    t && this.maybeMeasure();
  }
  createTooltip(n, e) {
    let t = n.create(this.view), i = e ? e.dom : null;
    if (t.dom.classList.add("cm-tooltip"), n.arrow && !t.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let s = document.createElement("div");
      s.className = "cm-tooltip-arrow", t.dom.appendChild(s);
    }
    return t.dom.style.position = this.position, t.dom.style.top = Fr, t.dom.style.left = "0px", this.container.insertBefore(t.dom, i), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
  }
  destroy() {
    var n, e, t;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let i of this.manager.tooltipViews)
      i.dom.remove(), (n = i.destroy) === null || n === void 0 || n.call(i);
    this.parent && this.container.remove(), (e = this.resizeObserver) === null || e === void 0 || e.disconnect(), (t = this.intersectionObserver) === null || t === void 0 || t.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let n = 1, e = 1, t = !1;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom: o } = this.manager.tooltipViews[0];
      if (ge.safari) {
        let r = o.getBoundingClientRect();
        t = Math.abs(r.top + 1e4) > 1 || Math.abs(r.left) > 1;
      } else
        t = !!o.offsetParent && o.offsetParent != this.container.ownerDocument.body;
    }
    if (t || this.position == "absolute")
      if (this.parent) {
        let o = this.parent.getBoundingClientRect();
        o.width && o.height && (n = o.width / this.parent.offsetWidth, e = o.height / this.parent.offsetHeight);
      } else
        ({ scaleX: n, scaleY: e } = this.view.viewState);
    let i = this.view.scrollDOM.getBoundingClientRect(), s = Hc(this.view);
    return {
      visible: {
        left: i.left + s.left,
        top: i.top + s.top,
        right: i.right - s.right,
        bottom: i.bottom - s.bottom
      },
      parent: this.parent ? this.container.getBoundingClientRect() : this.view.dom.getBoundingClientRect(),
      pos: this.manager.tooltips.map((o, r) => {
        let l = this.manager.tooltipViews[r];
        return l.getCoords ? l.getCoords(o.pos) : this.view.coordsAtPos(o.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: o }) => o.getBoundingClientRect()),
      space: this.view.state.facet(Ja).tooltipSpace(this.view),
      scaleX: n,
      scaleY: e,
      makeAbsolute: t
    };
  }
  writeMeasure(n) {
    var e;
    if (n.makeAbsolute) {
      this.madeAbsolute = !0, this.position = "absolute";
      for (let l of this.manager.tooltipViews)
        l.dom.style.position = "absolute";
    }
    let { visible: t, space: i, scaleX: s, scaleY: o } = n, r = [];
    for (let l = 0; l < this.manager.tooltips.length; l++) {
      let a = this.manager.tooltips[l], u = this.manager.tooltipViews[l], { dom: c } = u, h = n.pos[l], f = n.size[l];
      if (!h || a.clip !== !1 && (h.bottom <= Math.max(t.top, i.top) || h.top >= Math.min(t.bottom, i.bottom) || h.right < Math.max(t.left, i.left) - 0.1 || h.left > Math.min(t.right, i.right) + 0.1)) {
        c.style.top = Fr;
        continue;
      }
      let d = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, g = d ? 7 : 0, v = f.right - f.left, m = (e = qf.get(u)) !== null && e !== void 0 ? e : f.bottom - f.top, b = u.offset || Qw, O = this.view.textDirection == St.LTR, L = f.width > i.right - i.left ? O ? i.left : i.right - f.width : O ? Math.max(i.left, Math.min(h.left - (d ? 14 : 0) + b.x, i.right - v)) : Math.min(Math.max(i.left, h.left - v + (d ? 14 : 0) - b.x), i.right - v), E = this.above[l];
      !a.strictSide && (E ? h.top - m - g - b.y < i.top : h.bottom + m + g + b.y > i.bottom) && E == i.bottom - h.bottom > h.top - i.top && (E = this.above[l] = !E);
      let B = (E ? h.top - i.top : i.bottom - h.bottom) - g;
      if (B < m && u.resize !== !1) {
        if (B < this.view.defaultLineHeight) {
          c.style.top = Fr;
          continue;
        }
        qf.set(u, m), c.style.height = (m = B) / o + "px";
      } else c.style.height && (c.style.height = "");
      let z = E ? h.top - m - g - b.y : h.bottom + g + b.y, P = L + v;
      if (u.overlap !== !0)
        for (let Y of r)
          Y.left < P && Y.right > L && Y.top < z + m && Y.bottom > z && (z = E ? Y.top - m - 2 - g : Y.bottom + g + 2);
      if (this.position == "absolute" ? (c.style.top = (z - n.parent.top) / o + "px", Yf(c, (L - n.parent.left) / s)) : (c.style.top = z / o + "px", Yf(c, L / s)), d) {
        let Y = h.left + (O ? b.x : -b.x) - (L + 14 - 7);
        d.style.left = Y / s + "px";
      }
      u.overlap !== !0 && r.push({ left: L, top: z, right: P, bottom: z + m }), c.classList.toggle("cm-tooltip-above", E), c.classList.toggle("cm-tooltip-below", !E), u.positioned && u.positioned(n.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = Fr;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function Yf(n, e) {
  let t = parseInt(n.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (n.style.left = e + "px");
}
const Zw = /* @__PURE__ */ De.baseTheme({
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
}), Qw = { x: 0, y: 0 }, Kc = /* @__PURE__ */ we.define({
  enables: [Sm, Zw]
}), Il = /* @__PURE__ */ we.define({
  combine: (n) => n.reduce((e, t) => e.concat(t), [])
});
class ca {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new ca(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new km(e, Il, (t, i) => this.createHostedView(t, i), (t) => t.dom.remove());
  }
  createHostedView(e, t) {
    let i = e.create(this.view);
    return i.dom.classList.add("cm-tooltip-section"), this.dom.insertBefore(i.dom, t ? t.dom.nextSibling : this.dom.firstChild), this.mounted && i.mount && i.mount(this.view), i;
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
    for (let i of this.manager.tooltipViews) {
      let s = i[e];
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
const ek = /* @__PURE__ */ Kc.compute([Il], (n) => {
  let e = n.facet(Il);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var i;
      return (i = t.end) !== null && i !== void 0 ? i : t.pos;
    })),
    create: ca.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), tk = /* @__PURE__ */ we.define();
class nk {
  constructor(e, t, i, s, o, r) {
    this.view = e, this.source = t, this.field = i, this.locked = s, this.setHover = o, this.hoverTime = r, this.hoverTimeout = -1, this.restartTimeout = -1, this.pending = null, this.lastMove = { x: 0, y: 0, target: e.dom, time: 0 }, this.checkHover = this.checkHover.bind(this), e.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this)), e.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
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
    let { view: e, lastMove: t } = this, i = e.docView.tile.nearest(t.target);
    if (!i)
      return;
    let s, o = 1;
    if (i.isWidget())
      s = i.posAtStart;
    else {
      if (s = e.posAtCoords(t), s == null)
        return;
      let r = e.coordsAtPos(s);
      if (!r || t.y < r.top || t.y > r.bottom || t.x < r.left - e.defaultCharacterWidth || t.x > r.right + e.defaultCharacterWidth)
        return;
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == St.RTL ? -1 : 1;
      o = t.x < r.left ? -a : a;
    }
    this.activateHover(e, s, o);
  }
  activateHover(e, t, i, s) {
    let o = this.source(e, t, i), r = (l) => {
      if (l && !(Array.isArray(l) && !l.length)) {
        let a = Array.isArray(l) ? l : [l];
        s && this.locked.set(a, s), e.dispatch({ effects: this.setHover.of(a) });
      }
    };
    if (o && "then" in o) {
      let l = this.pending = { pos: t };
      o.then((a) => {
        this.pending == l && (this.pending = null, r(a));
      }, (a) => Pn(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Sm), t = e ? e.manager.tooltips.findIndex((i) => i.create == ca.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, i;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !ik(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (i = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && i !== void 0 ? i : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !sk(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
    }
  }
  mouseleave(e) {
    clearTimeout(this.hoverTimeout), this.hoverTimeout = -1;
    let { active: t } = this;
    if (t.length && !this.locked.has(t)) {
      let { tooltip: i } = this;
      i && i.dom.contains(e.relatedTarget) ? this.watchTooltipLeave(i.dom) : this.view.dispatch({ effects: this.setHover.of([]) });
    }
  }
  watchTooltipLeave(e) {
    let t = (i) => {
      e.removeEventListener("mouseleave", t);
      let { active: s } = this;
      s.length && !this.locked.has(s) && !this.view.dom.contains(i.relatedTarget) && this.view.dispatch({ effects: this.setHover.of([]) });
    };
    e.addEventListener("mouseleave", t);
  }
  destroy() {
    clearTimeout(this.hoverTimeout), clearTimeout(this.restartTimeout), this.view.dom.removeEventListener("mouseleave", this.mouseleave), this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
const zr = 4;
function ik(n, e) {
  let { left: t, right: i, top: s, bottom: o } = n.getBoundingClientRect(), r;
  if (r = n.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - zr && e.clientX <= i + zr && e.clientY >= s - zr && e.clientY <= o + zr;
}
function sk(n, e, t, i, s, o) {
  let r = n.scrollDOM.getBoundingClientRect(), l = n.documentTop + n.documentPadding.top + n.contentHeight;
  if (r.left > i || r.right < i || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = n.posAtCoords({ x: i, y: s }, !1);
  return a >= e && a <= t;
}
function ok(n, e = {}) {
  let t = kt.define(), i = /* @__PURE__ */ new WeakMap(), s = zn.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = i.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let h = l.changes.mapPos(c.pos, -1, cn.TrackDel);
          if (h != null) {
            let f = Object.assign(/* @__PURE__ */ Object.create(null), c);
            f.pos = h, f.end != null && (f.end = l.changes.mapPos(f.end)), u.push(f);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(rk) && !u.value || u.value == s) && (r = []);
      return r.length && a && i.set(r, a), r;
    },
    provide: (r) => Il.from(r)
  });
  const o = gn.define((r) => new nk(
    r,
    n,
    s,
    i,
    t,
    e.hoverTime || 300
    /* Hover.Time */
  ));
  return {
    active: s,
    extension: [
      s,
      o,
      tk.of(o),
      ek
    ]
  };
}
const rk = /* @__PURE__ */ kt.define(), Xf = /* @__PURE__ */ we.define({
  combine(n) {
    let e, t;
    for (let i of n)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), lk = /* @__PURE__ */ gn.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(Zu), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(n));
    let e = n.state.facet(Xf);
    this.top = new Wr(n, !0, e.topContainer), this.bottom = new Wr(n, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(n) {
    let e = n.state.facet(Xf);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Wr(n.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Wr(n.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = n.state.facet(Zu);
    if (t != this.input) {
      let i = t.filter((a) => a), s = [], o = [], r = [], l = [];
      for (let a of i) {
        let u = this.specs.indexOf(a), c;
        u < 0 ? (c = a(n.view), l.push(c)) : (c = this.panels[u], c.update && c.update(n)), s.push(c), (c.top ? o : r).push(c);
      }
      this.specs = i, this.panels = s, this.top.sync(o), this.bottom.sync(r);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(n);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (n) => De.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Wr {
  constructor(e, t, i) {
    this.view = e, this.top = t, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
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
          e = Jf(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Jf(e);
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
function Jf(n) {
  let e = n.nextSibling;
  return n.remove(), e;
}
const Zu = /* @__PURE__ */ we.define({
  enables: lk
});
class es extends Cs {
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
es.prototype.elementClass = "";
es.prototype.toDOM = void 0;
es.prototype.mapMode = cn.TrackBefore;
es.prototype.startSide = es.prototype.endSide = -1;
es.prototype.point = !0;
const Za = /* @__PURE__ */ we.define(), ak = /* @__PURE__ */ we.define(), uk = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Ye.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, zo = /* @__PURE__ */ we.define();
function ck(n) {
  return [Cm(), zo.of({ ...uk, ...n })];
}
const Zf = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
});
function Cm(n) {
  return [
    hk
  ];
}
const hk = /* @__PURE__ */ gn.fromClass(class {
  constructor(n) {
    this.view = n, this.domAfter = null, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = n.state.facet(zo).map((e) => new ed(n, e)), this.fixed = !n.state.facet(Zf);
    for (let e of this.gutters)
      e.config.side == "after" ? this.getDOMAfter().appendChild(e.dom) : this.dom.appendChild(e.dom);
    this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), n.scrollDOM.insertBefore(this.dom, n.contentDOM);
  }
  getDOMAfter() {
    return this.domAfter || (this.domAfter = document.createElement("div"), this.domAfter.className = "cm-gutters cm-gutters-after", this.domAfter.setAttribute("aria-hidden", "true"), this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.domAfter.style.position = this.fixed ? "sticky" : "", this.view.scrollDOM.appendChild(this.domAfter)), this.domAfter;
  }
  update(n) {
    if (this.updateGutters(n)) {
      let e = this.prevViewport, t = n.view.viewport, i = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(i < (t.to - t.from) * 0.8);
    }
    if (n.geometryChanged) {
      let e = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = e, this.domAfter && (this.domAfter.style.minHeight = e);
    }
    this.view.state.facet(Zf) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let e = this.dom.nextSibling;
    n && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Ye.iter(this.view.state.facet(Za), this.view.viewport.from), i = [], s = this.gutters.map((o) => new fk(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == jt.Text && r) {
            Qu(t, i, l.from);
            for (let a of s)
              a.line(this.view, l, i);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == jt.Text) {
        Qu(t, i, o.from);
        for (let r of s)
          r.line(this.view, o, i);
      } else if (o.widget)
        for (let r of s)
          r.widget(this.view, o);
    for (let o of s)
      o.finish();
    n && (this.view.scrollDOM.insertBefore(this.dom, e), this.domAfter && this.view.scrollDOM.appendChild(this.domAfter));
  }
  updateGutters(n) {
    let e = n.startState.facet(zo), t = n.state.facet(zo), i = n.docChanged || n.heightChanged || n.viewportChanged || !Ye.eq(n.startState.facet(Za), n.state.facet(Za), n.view.viewport.from, n.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(n) && (i = !0);
    else {
      i = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new ed(this.view, o)) : (this.gutters[r].update(n), s.push(this.gutters[r]));
      }
      for (let o of this.gutters)
        o.dom.remove(), s.indexOf(o) < 0 && o.destroy();
      for (let o of s)
        o.config.side == "after" ? this.getDOMAfter().appendChild(o.dom) : this.dom.appendChild(o.dom);
      this.gutters = s;
    }
    return i;
  }
  destroy() {
    for (let n of this.gutters)
      n.destroy();
    this.dom.remove(), this.domAfter && this.domAfter.remove();
  }
}, {
  provide: (n) => De.scrollMargins.of((e) => {
    let t = e.plugin(n);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let i = t.dom.offsetWidth * e.scaleX, s = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == St.LTR ? { left: i, right: s } : { right: i, left: s };
  })
});
function Qf(n) {
  return Array.isArray(n) ? n : [n];
}
function Qu(n, e, t) {
  for (; n.value && n.from <= t; )
    n.from == t && e.push(n.value), n.next();
}
class fk {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.i = 0, this.cursor = Ye.iter(e.markers, t.from);
  }
  addElement(e, t, i) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Mm(e, r, o, i);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, i);
    this.height = t.bottom, this.i++;
  }
  line(e, t, i) {
    let s = [];
    Qu(this.cursor, s, t.from), i.length && (s = s.concat(i));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let i = this.gutter.config.widgetMarker(e, t.widget, t), s = i ? [i] : null;
    for (let o of e.state.facet(ak)) {
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
class ed {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in t.domEventHandlers)
      this.dom.addEventListener(i, (s) => {
        let o = s.target, r;
        if (o != this.dom && this.dom.contains(o)) {
          for (; o.parentNode != this.dom; )
            o = o.parentNode;
          let a = o.getBoundingClientRect();
          r = (a.top + a.bottom) / 2;
        } else
          r = s.clientY;
        let l = e.lineBlockAtHeight(r - e.documentTop);
        t.domEventHandlers[i](e, l, s) && s.preventDefault();
      });
    this.markers = Qf(t.markers(e)), t.initialSpacer && (this.spacer = new Mm(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = Qf(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let i = e.view.viewport;
    return !Ye.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Mm {
  constructor(e, t, i, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, s);
  }
  update(e, t, i, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), dk(this.markers, s) || this.setMarkers(e, s);
  }
  setMarkers(e, t) {
    let i = "cm-gutterElement", s = this.dom.firstChild;
    for (let o = 0, r = 0; ; ) {
      let l = r, a = o < t.length ? t[o++] : null, u = !1;
      if (a) {
        let c = a.elementClass;
        c && (i += " " + c);
        for (let h = r; h < this.markers.length; h++)
          if (this.markers[h].compare(a)) {
            l = h, u = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; r < l; ) {
        let c = this.markers[r++];
        if (c.toDOM) {
          c.destroy(s);
          let h = s.nextSibling;
          s.remove(), s = h;
        }
      }
      if (!a)
        break;
      a.toDOM && (u ? s = s.nextSibling : this.dom.insertBefore(a.toDOM(e), s)), u && r++;
    }
    this.dom.className = i, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function dk(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].compare(e[t]))
      return !1;
  return !0;
}
const pk = /* @__PURE__ */ we.define(), gk = /* @__PURE__ */ we.define(), Ns = /* @__PURE__ */ we.define({
  combine(n) {
    return ia(n, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let i = Object.assign({}, e);
        for (let s in t) {
          let o = i[s], r = t[s];
          i[s] = o ? (l, a, u) => o(l, a, u) || r(l, a, u) : r;
        }
        return i;
      }
    });
  }
});
class Qa extends es {
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
function eu(n, e) {
  return n.state.facet(Ns).formatNumber(e, n.state);
}
const mk = /* @__PURE__ */ zo.compute([Ns], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(pk);
  },
  lineMarker(e, t, i) {
    return i.some((s) => s.toDOM) ? null : new Qa(eu(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, i) => {
    for (let s of e.state.facet(gk)) {
      let o = s(e, t, i);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Ns) != e.state.facet(Ns),
  initialSpacer(e) {
    return new Qa(eu(e, td(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = eu(t.view, td(t.view.state.doc.lines));
    return i == e.number ? e : new Qa(i);
  },
  domEventHandlers: n.facet(Ns).domEventHandlers,
  side: "before"
}));
function vk(n = {}) {
  return [
    Ns.of(n),
    Cm(),
    mk
  ];
}
function td(n) {
  let e = 9;
  for (; e < n; )
    e = e * 10 + 9;
  return e;
}
const yk = 1024;
let bk = 0;
class tu {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Je {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = bk++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
    return typeof e != "function" && (e = fn.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
Je.closedBy = new Je({ deserialize: (n) => n.split(" ") });
Je.openedBy = new Je({ deserialize: (n) => n.split(" ") });
Je.group = new Je({ deserialize: (n) => n.split(" ") });
Je.isolate = new Je({ deserialize: (n) => {
  if (n && n != "rtl" && n != "ltr" && n != "auto")
    throw new RangeError("Invalid value for isolate: " + n);
  return n || "auto";
} });
Je.contextHash = new Je({ perNode: !0 });
Je.lookAhead = new Je({ perNode: !0 });
Je.mounted = new Je({ perNode: !0 });
class Wo {
  constructor(e, t, i, s = !1) {
    this.tree = e, this.overlay = t, this.parser = i, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[Je.mounted.id];
  }
}
const xk = /* @__PURE__ */ Object.create(null);
class fn {
  /**
  @internal
  */
  constructor(e, t, i, s = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = s;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : xk, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new fn(e.name || "", t, e.id, i);
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
      let t = this.prop(Je.group);
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
    for (let i in e)
      for (let s of i.split(" "))
        t[s] = e[i];
    return (i) => {
      for (let s = i.prop(Je.group), o = -1; o < (s ? s.length : 0); o++) {
        let r = t[o < 0 ? i.name : s[o]];
        if (r)
          return r;
      }
    };
  }
}
fn.none = new fn(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class Uc {
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
    for (let i of this.types) {
      let s = null;
      for (let o of e) {
        let r = o(i);
        if (r) {
          s || (s = Object.assign({}, i.props));
          let l = r[1], a = r[0];
          a.combine && a.id in s && (l = a.combine(s[a.id], l)), s[a.id] = l;
        }
      }
      t.push(s ? new fn(i.name, s, i.id, i.flags) : i);
    }
    return new Uc(t);
  }
}
const Kr = /* @__PURE__ */ new WeakMap(), nd = /* @__PURE__ */ new WeakMap();
var Bt;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays", n[n.EnterBracketed = 16] = "EnterBracketed";
})(Bt || (Bt = {}));
class At {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, i, s, o) {
    if (this.type = e, this.children = t, this.positions = i, this.length = s, this.props = null, o && o.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [r, l] of o)
        this.props[typeof r == "number" ? r : r.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = Wo.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let s = i.toString();
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
    return new tc(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let s = Kr.get(this) || this.topNode, o = new tc(s);
    return o.moveTo(e, t), Kr.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new An(this, 0, 0, null);
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
    let i = or(Kr.get(this) || this.topNode, e, t, !1);
    return Kr.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = or(nd.get(this) || this.topNode, e, t, !0);
    return nd.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Sk(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: i, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & Bt.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | Bt.IncludeAnonymous); ; ) {
      let u = !1;
      if (a.from <= o && a.to >= s && (!l && a.type.isAnonymous || t(a) !== !1)) {
        if (a.firstChild())
          continue;
        u = !0;
      }
      for (; u && i && (l || !a.type.isAnonymous) && i(a), !a.nextSibling(); ) {
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
    return this.children.length <= 8 ? this : qc(fn.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, s) => new At(this.type, t, i, s, this.propValues), e.makeTree || ((t, i, s) => new At(fn.none, t, i, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Ck(e);
  }
}
At.empty = new At(fn.none, [], [], 0);
class jc {
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
    return new jc(this.buffer, this.index);
  }
}
class ts {
  /**
  Create a tree buffer.
  */
  constructor(e, t, i) {
    this.buffer = e, this.length = t, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return fn.none;
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
    let t = this.buffer[e], i = this.buffer[e + 3], s = this.set.types[t], o = s.name;
    if (/\W/.test(o) && !s.isError && (o = JSON.stringify(o)), e += 4, i == e)
      return o;
    let r = [];
    for (; e < i; )
      r.push(this.childString(e)), e = this.buffer[e + 3];
    return o + "(" + r.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, i, s, o) {
    let { buffer: r } = this, l = -1;
    for (let a = e; a != t && !(Am(o, s, r[a + 1], r[a + 2]) && (l = a, i > 0)); a = r[a + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(e, t, i) {
    let s = this.buffer, o = new Uint16Array(t - e), r = 0;
    for (let l = e, a = 0; l < t; ) {
      o[a++] = s[l++], o[a++] = s[l++] - i;
      let u = o[a++] = s[l++] - i;
      o[a++] = s[l++] - e, r = Math.max(r, u);
    }
    return new ts(o, r, this.set);
  }
}
function Am(n, e, t, i) {
  switch (n) {
    case -2:
      return t < e;
    case -1:
      return i >= e && t < e;
    case 0:
      return t < e && i > e;
    case 1:
      return t <= e && i > e;
    case 2:
      return i > e;
    case 4:
      return !0;
  }
}
function or(n, e, t, i) {
  for (var s; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let r = !i && n instanceof An && n.index < 0 ? null : n.parent;
    if (!r)
      return n;
    n = r;
  }
  let o = i ? 0 : Bt.IgnoreOverlays;
  if (i)
    for (let r = n, l = r.parent; l; r = l, l = r.parent)
      r instanceof An && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (n = l);
  for (; ; ) {
    let r = n.enter(e, t, o);
    if (!r)
      return n;
    n = r;
  }
}
class Tm {
  cursor(e = 0) {
    return new tc(this, e);
  }
  getChild(e, t = null, i = null) {
    let s = id(this, e, t, i);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return id(this, e, t, i);
  }
  resolve(e, t = 0) {
    return or(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return or(this, e, t, !0);
  }
  matchContext(e) {
    return ec(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), i = this;
    for (; t; ) {
      let s = t.lastChild;
      if (!s || s.to != t.to)
        break;
      s.type.isError && s.from == s.to ? (i = t, t = s.prevSibling) : t = s;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class An extends Tm {
  constructor(e, t, i, s) {
    super(), this._tree = e, this.from = t, this.index = i, this._parent = s;
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
  nextChild(e, t, i, s, o = 0) {
    for (let r = this; ; ) {
      for (let { children: l, positions: a } = r._tree, u = t > 0 ? l.length : -1; e != u; e += t) {
        let c = l[e], h = a[e] + r.from, f;
        if (!(!(o & Bt.EnterBracketed && c instanceof At && (f = Wo.get(c)) && !f.overlay && f.bracketed && i >= h && i <= h + c.length) && !Am(s, i, h, h + c.length))) {
          if (c instanceof ts) {
            if (o & Bt.ExcludeBuffers)
              continue;
            let d = c.findChild(0, c.buffer.length, t, i - h, s);
            if (d > -1)
              return new Wi(new wk(r, c, e, h), null, d);
          } else if (o & Bt.IncludeAnonymous || !c.type.isAnonymous || Gc(c)) {
            let d;
            if (!(o & Bt.IgnoreMounts) && (d = Wo.get(c)) && !d.overlay)
              return new An(d.tree, h, e, r);
            let g = new An(c, h, e, r);
            return o & Bt.IncludeAnonymous || !g.type.isAnonymous ? g : g.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, s, o);
          }
        }
      }
      if (o & Bt.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
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
  enter(e, t, i = 0) {
    let s;
    if (!(i & Bt.IgnoreOverlays) && (s = Wo.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = i & Bt.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new An(s.tree, s.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, i);
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
function id(n, e, t, i) {
  let s = n.cursor(), o = [];
  if (!s.firstChild())
    return o;
  if (t != null) {
    for (let r = !1; !r; )
      if (r = s.type.is(t), !s.nextSibling())
        return o;
  }
  for (; ; ) {
    if (i != null && s.type.is(i))
      return o;
    if (s.type.is(e) && o.push(s.node), !s.nextSibling())
      return i == null ? o : [];
  }
}
function ec(n, e, t = e.length - 1) {
  for (let i = n; t >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (e[t] && e[t] != i.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class wk {
  constructor(e, t, i, s) {
    this.parent = e, this.buffer = t, this.index = i, this.start = s;
  }
}
class Wi extends Tm {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, i) {
    super(), this.context = e, this._parent = t, this.index = i, this.type = e.buffer.set.types[e.buffer.buffer[i]];
  }
  child(e, t, i) {
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.context.start, i);
    return o < 0 ? null : new Wi(this.context, this, o);
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
  enter(e, t, i = 0) {
    if (i & Bt.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return o < 0 ? null : new Wi(this.context, this, o);
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
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new Wi(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new Wi(this.context, this._parent, e.findChild(
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
    let e = [], t = [], { buffer: i } = this.context, s = this.index + 4, o = i.buffer[this.index + 3];
    if (o > s) {
      let r = i.buffer[this.index + 1];
      e.push(i.slice(s, o, r)), t.push(0);
    }
    return new At(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function $m(n) {
  if (!n.length)
    return null;
  let e = 0, t = n[0];
  for (let o = 1; o < n.length; o++) {
    let r = n[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let i = t instanceof An && t.index < 0 ? null : t.parent, s = n.slice();
  return i ? s[e] = i : s.splice(e, 1), new kk(s, t);
}
class kk {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return $m(this.heads);
  }
}
function Sk(n, e, t) {
  let i = n.resolveInner(e, t), s = null;
  for (let o = i instanceof An ? i : i.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [i])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Wo.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new An(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [i])).push(or(l, e, t, !1));
      }
    }
  return s ? $m(s) : i;
}
class tc {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~Bt.EnterBracketed, e instanceof An)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let i = e._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: i, buffer: s } = this.buffer;
    return this.type = t || s.set.types[s.buffer[e]], this.from = i + s.buffer[e + 1], this.to = i + s.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof An ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: s } = this.buffer, o = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.buffer.start, i);
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
  enter(e, t, i = this.mode) {
    return this.buffer ? i & Bt.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & Bt.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & Bt.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let s = i < 0 ? 0 : this.stack[i] + 4;
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
      if (s < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(s);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
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
    let t, i, { buffer: s } = this;
    if (s) {
      if (e > 0) {
        if (this.index < s.buffer.buffer.length)
          return !1;
      } else
        for (let o = 0; o < this.index; o++)
          if (s.buffer.buffer[o + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = s);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let o = t + e, r = e < 0 ? -1 : i._tree.children.length; o != r; o += e) {
          let l = i._tree.children[o];
          if (this.mode & Bt.IncludeAnonymous || l instanceof ts || !l.type.isAnonymous || Gc(l))
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
    let e = this.bufferNode, t = null, i = 0;
    if (e && e.context == this.buffer)
      e: for (let s = this.index, o = this.stack.length; o >= 0; ) {
        for (let r = e; r; r = r._parent)
          if (r.index == s) {
            if (s == this.index)
              return r;
            t = r, i = o + 1;
            break e;
          }
        s = this.stack[--o];
      }
    for (let s = i; s < this.stack.length; s++)
      t = new Wi(this.buffer, t, this.stack[s]);
    return this.bufferNode = new Wi(this.buffer, t, this.index);
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
    for (let i = 0; ; ) {
      let s = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (s = !0);
      }
      for (; ; ) {
        if (s && t && t(this), s = this.type.isAnonymous, !i)
          return;
        if (this.nextSibling())
          break;
        this.parent(), i--, s = !0;
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
      return ec(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return ec(this._tree, e, s);
      let r = i[t.buffer[this.stack[o]]];
      if (!r.isAnonymous) {
        if (e[s] && e[s] != r.name)
          return !1;
        s--;
      }
    }
    return !0;
  }
}
function Gc(n) {
  return n.children.some((e) => e instanceof ts || !e.type.isAnonymous || Gc(e));
}
function Ck(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: s = yk, reused: o = [], minRepeatType: r = i.types.length } = n, l = Array.isArray(t) ? new jc(t, t.length) : t, a = i.types, u = 0, c = 0;
  function h(B, z, P, Y, K, re) {
    let { id: j, start: D, end: U, size: ke } = l, $e = c, ce = u;
    if (ke < 0)
      if (l.next(), ke == -1) {
        let Le = o[j];
        P.push(Le), Y.push(D - B);
        return;
      } else if (ke == -3) {
        u = j;
        return;
      } else if (ke == -4) {
        c = j;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ke}`);
    let pe = a[j], He, Oe, Re = D - B;
    if (U - D <= s && (Oe = m(l.pos - z, K))) {
      let Le = new Uint16Array(Oe.size - Oe.skip), J = l.pos - Oe.size, ct = Le.length;
      for (; l.pos > J; )
        ct = b(Oe.start, Le, ct);
      He = new ts(Le, U - Oe.start, i), Re = Oe.start - B;
    } else {
      let Le = l.pos - ke;
      l.next();
      let J = [], ct = [], be = j >= r ? j : -1, Ie = 0, se = U;
      for (; l.pos > Le; )
        be >= 0 && l.id == be && l.size >= 0 ? (l.end <= se - s && (g(J, ct, D, Ie, l.end, se, be, $e, ce), Ie = J.length, se = l.end), l.next()) : re > 2500 ? f(D, Le, J, ct) : h(D, Le, J, ct, be, re + 1);
      if (be >= 0 && Ie > 0 && Ie < J.length && g(J, ct, D, Ie, D, se, be, $e, ce), J.reverse(), ct.reverse(), be > -1 && Ie > 0) {
        let Z = d(pe, ce);
        He = qc(pe, J, ct, 0, J.length, 0, U - D, Z, Z);
      } else
        He = v(pe, J, ct, U - D, $e - U, ce);
    }
    P.push(He), Y.push(Re);
  }
  function f(B, z, P, Y) {
    let K = [], re = 0, j = -1;
    for (; l.pos > z; ) {
      let { id: D, start: U, end: ke, size: $e } = l;
      if ($e > 4)
        l.next();
      else {
        if (j > -1 && U < j)
          break;
        j < 0 && (j = ke - s), K.push(D, U, ke), re++, l.next();
      }
    }
    if (re) {
      let D = new Uint16Array(re * 4), U = K[K.length - 2];
      for (let ke = K.length - 3, $e = 0; ke >= 0; ke -= 3)
        D[$e++] = K[ke], D[$e++] = K[ke + 1] - U, D[$e++] = K[ke + 2] - U, D[$e++] = $e;
      P.push(new ts(D, K[2] - U, i)), Y.push(U - B);
    }
  }
  function d(B, z) {
    return (P, Y, K) => {
      let re = 0, j = P.length - 1, D, U;
      if (j >= 0 && (D = P[j]) instanceof At) {
        if (!j && D.type == B && D.length == K)
          return D;
        (U = D.prop(Je.lookAhead)) && (re = Y[j] + D.length + U);
      }
      return v(B, P, Y, K, re, z);
    };
  }
  function g(B, z, P, Y, K, re, j, D, U) {
    let ke = [], $e = [];
    for (; B.length > Y; )
      ke.push(B.pop()), $e.push(z.pop() + P - K);
    B.push(v(i.types[j], ke, $e, re - K, D - re, U)), z.push(K - P);
  }
  function v(B, z, P, Y, K, re, j) {
    if (re) {
      let D = [Je.contextHash, re];
      j = j ? [D].concat(j) : [D];
    }
    if (K > 25) {
      let D = [Je.lookAhead, K];
      j = j ? [D].concat(j) : [D];
    }
    return new At(B, z, P, Y, j);
  }
  function m(B, z) {
    let P = l.fork(), Y = 0, K = 0, re = 0, j = P.end - s, D = { size: 0, start: 0, skip: 0 };
    e: for (let U = P.pos - B; P.pos > U; ) {
      let ke = P.size;
      if (P.id == z && ke >= 0) {
        D.size = Y, D.start = K, D.skip = re, re += 4, Y += 4, P.next();
        continue;
      }
      let $e = P.pos - ke;
      if (ke < 0 || $e < U || P.start < j)
        break;
      let ce = P.id >= r ? 4 : 0, pe = P.start;
      for (P.next(); P.pos > $e; ) {
        if (P.size < 0)
          if (P.size == -3 || P.size == -4)
            ce += 4;
          else
            break e;
        else P.id >= r && (ce += 4);
        P.next();
      }
      K = pe, Y += ke, re += ce;
    }
    return (z < 0 || Y == B) && (D.size = Y, D.start = K, D.skip = re), D.size > 4 ? D : void 0;
  }
  function b(B, z, P) {
    let { id: Y, start: K, end: re, size: j } = l;
    if (l.next(), j >= 0 && Y < r) {
      let D = P;
      if (j > 4) {
        let U = l.pos - (j - 4);
        for (; l.pos > U; )
          P = b(B, z, P);
      }
      z[--P] = D, z[--P] = re - B, z[--P] = K - B, z[--P] = Y;
    } else j == -3 ? u = Y : j == -4 && (c = Y);
    return P;
  }
  let O = [], L = [];
  for (; l.pos > 0; )
    h(n.start || 0, n.bufferStart || 0, O, L, -1, 0);
  let E = (e = n.length) !== null && e !== void 0 ? e : O.length ? L[0] + O[0].length : 0;
  return new At(a[n.topID], O.reverse(), L.reverse(), E);
}
const sd = /* @__PURE__ */ new WeakMap();
function hl(n, e) {
  if (!n.isAnonymous || e instanceof ts || e.type != n)
    return 1;
  let t = sd.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof At)) {
        t = 1;
        break;
      }
      t += hl(n, i);
    }
    sd.set(e, t);
  }
  return t;
}
function qc(n, e, t, i, s, o, r, l, a) {
  let u = 0;
  for (let g = i; g < s; g++)
    u += hl(n, e[g]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), h = [], f = [];
  function d(g, v, m, b, O) {
    for (let L = m; L < b; ) {
      let E = L, B = v[L], z = hl(n, g[L]);
      for (L++; L < b; L++) {
        let P = hl(n, g[L]);
        if (z + P >= c)
          break;
        z += P;
      }
      if (L == E + 1) {
        if (z > c) {
          let P = g[E];
          d(P.children, P.positions, 0, P.children.length, v[E] + O);
          continue;
        }
        h.push(g[E]);
      } else {
        let P = v[L - 1] + g[L - 1].length - B;
        h.push(qc(n, g, v, E, L, B, P, null, a));
      }
      f.push(B + O - o);
    }
  }
  return d(e, t, i, s, 0), (l || a)(h, f, r);
}
class Ss {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, i, s, o = !1, r = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = s, this.open = (o ? 1 : 0) | (r ? 2 : 0);
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
  static addTree(e, t = [], i = !1) {
    let s = [new Ss(0, e.length, e, 0, !1, i)];
    for (let o of t)
      o.to > e.length && s.push(o);
    return s;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let s = [], o = 1, r = e.length ? e[0] : null;
    for (let l = 0, a = 0, u = 0; ; l++) {
      let c = l < t.length ? t[l] : null, h = c ? c.fromA : 1e9;
      if (h - a >= i)
        for (; r && r.from < h; ) {
          let f = r;
          if (a >= f.from || h <= f.to || u) {
            let d = Math.max(f.from, a) - u, g = Math.min(f.to, h) - u;
            f = d >= g ? null : new Ss(d, g, f.tree, f.offset + u, l > 0, !!c);
          }
          if (f && s.push(f), r.to > h)
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
class Dm {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, i) {
    return typeof e == "string" && (e = new Mk(e)), i = i ? i.length ? i.map((s) => new tu(s.from, s.to)) : [new tu(0, 0)] : [new tu(0, e.length)], this.createParse(e, t || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, i) {
    let s = this.startParse(e, t, i);
    for (; ; ) {
      let o = s.advance();
      if (o)
        return o;
    }
  }
}
class Mk {
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
new Je({ perNode: !0 });
let Ak = 0;
class kn {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    this.name = e, this.set = t, this.base = i, this.modified = s, this.id = Ak++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let i = typeof e == "string" ? e : "?";
    if (e instanceof kn && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let s = new kn(i, [], null, []);
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
    let t = new Rl(e);
    return (i) => i.modified.indexOf(t) > -1 ? i : Rl.get(i.base || i, i.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let Tk = 0;
class Rl {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Tk++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && $k(t, l.modified));
    if (i)
      return i;
    let s = [], o = new kn(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Dk(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(Rl.get(l, a));
    return o;
  }
}
function $k(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function Dk(n) {
  let e = [[]];
  for (let t = 0; t < n.length; t++)
    for (let i = 0, s = e.length; i < s; i++)
      e.push(e[i].concat(n[t]));
  return e.sort((t, i) => i.length - t.length);
}
function Ok(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    Array.isArray(i) || (i = [i]);
    for (let s of t.split(" "))
      if (s) {
        let o = [], r = 2, l = s;
        for (let h = 0; ; ) {
          if (l == "..." && h > 0 && h + 3 == s.length) {
            r = 1;
            break;
          }
          let f = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!f)
            throw new RangeError("Invalid path: " + s);
          if (o.push(f[0] == "*" ? "" : f[0][0] == '"' ? JSON.parse(f[0]) : f[0]), h += f[0].length, h == s.length)
            break;
          let d = s[h++];
          if (h == s.length && d == "!") {
            r = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + s);
          l = s.slice(h);
        }
        let a = o.length - 1, u = o[a];
        if (!u)
          throw new RangeError("Invalid path: " + s);
        let c = new rr(i, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return Om.add(e);
}
const Om = new Je({
  combine(n, e) {
    let t, i, s;
    for (; n || e; ) {
      if (!n || e && n.depth < e.depth ? (s = e, e = e.next) : (s = n, n = n.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new rr(s.tags, s.mode, s.context);
      t ? t.next = o : i = o, t = o;
    }
    return i;
  }
});
class rr {
  constructor(e, t, i, s) {
    this.tags = e, this.mode = t, this.context = i, this.next = s;
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
rr.empty = new rr([], 2, null);
function Lm(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let o of n)
    if (!Array.isArray(o.tag))
      t[o.tag.id] = o.class;
    else
      for (let r of o.tag)
        t[r.id] = o.class;
  let { scope: i, all: s = null } = e || {};
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
    scope: i
  };
}
function Lk(n, e) {
  let t = null;
  for (let i of n) {
    let s = i.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function Ek(n, e, t, i = 0, s = n.length) {
  let o = new Bk(i, Array.isArray(e) ? e : [e], t);
  o.highlightRange(n.cursor(), i, s, "", o.highlighters), o.flush(s);
}
class Bk {
  constructor(e, t, i) {
    this.at = e, this.highlighters = t, this.span = i, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, i, s, o) {
    let { type: r, from: l, to: a } = e;
    if (l >= i || a <= t)
      return;
    r.isTop && (o = this.highlighters.filter((d) => !d.scope || d.scope(r)));
    let u = s, c = Ik(e) || rr.empty, h = Lk(o, c.tags);
    if (h && (u && (u += " "), u += h, c.mode == 1 && (s += (s ? " " : "") + h)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let f = e.tree && e.tree.prop(Je.mounted);
    if (f && f.overlay) {
      let d = e.node.enter(f.overlay[0].from + l, 1), g = this.highlighters.filter((m) => !m.scope || m.scope(f.tree.type)), v = e.firstChild();
      for (let m = 0, b = l; ; m++) {
        let O = m < f.overlay.length ? f.overlay[m] : null, L = O ? O.from + l : a, E = Math.max(t, b), B = Math.min(i, L);
        if (E < B && v)
          for (; e.from < B && (this.highlightRange(e, E, B, s, o), this.startSpan(Math.min(B, e.to), u), !(e.to >= L || !e.nextSibling())); )
            ;
        if (!O || L > i)
          break;
        b = O.to + l, b > t && (this.highlightRange(d.cursor(), Math.max(t, O.from + l), Math.min(i, b), "", g), this.startSpan(Math.min(i, b), u));
      }
      v && e.parent();
    } else if (e.firstChild()) {
      f && (s = "");
      do
        if (!(e.to <= t)) {
          if (e.from >= i)
            break;
          this.highlightRange(e, t, i, s, o), this.startSpan(Math.min(i, e.to), u);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function Ik(n) {
  let e = n.type.prop(Om);
  for (; e && e.context && !n.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const de = kn.define, Ur = de(), Ri = de(), od = de(Ri), rd = de(Ri), Pi = de(), jr = de(Pi), nu = de(Pi), Zn = de(), us = de(Zn), Yn = de(), Xn = de(), nc = de(), xo = de(nc), Gr = de(), _e = {
  /**
  A comment.
  */
  comment: Ur,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: de(Ur),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: de(Ur),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: de(Ur),
  /**
  Any kind of identifier.
  */
  name: Ri,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: de(Ri),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: od,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: de(od),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: rd,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: de(rd),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: de(Ri),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: de(Ri),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: de(Ri),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: de(Ri),
  /**
  A literal value.
  */
  literal: Pi,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: jr,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: de(jr),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: de(jr),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: de(jr),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: nu,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: de(nu),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: de(nu),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: de(Pi),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: de(Pi),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: de(Pi),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: de(Pi),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: de(Pi),
  /**
  A language keyword.
  */
  keyword: Yn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: de(Yn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: de(Yn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: de(Yn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: de(Yn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: de(Yn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: de(Yn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: de(Yn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: de(Yn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: de(Yn),
  /**
  An operator.
  */
  operator: Xn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: de(Xn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: de(Xn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: de(Xn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: de(Xn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: de(Xn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: de(Xn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: de(Xn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: de(Xn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: de(Xn),
  /**
  Program or markup punctuation.
  */
  punctuation: nc,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: de(nc),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: xo,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: de(xo),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: de(xo),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: de(xo),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: de(xo),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Zn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: us,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: de(us),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: de(us),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: de(us),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: de(us),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: de(us),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: de(us),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: de(Zn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: de(Zn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: de(Zn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: de(Zn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: de(Zn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: de(Zn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: de(Zn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: de(Zn),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: de(),
  /**
  Deleted text.
  */
  deleted: de(),
  /**
  Changed text.
  */
  changed: de(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: de(),
  /**
  Metadata or meta-instruction.
  */
  meta: Gr,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: de(Gr),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: de(Gr),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: de(Gr),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: kn.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: kn.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: kn.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: kn.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: kn.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: kn.defineModifier("special")
};
for (let n in _e) {
  let e = _e[n];
  e instanceof kn && (e.name = n);
}
Lm([
  { tag: _e.link, class: "tok-link" },
  { tag: _e.heading, class: "tok-heading" },
  { tag: _e.emphasis, class: "tok-emphasis" },
  { tag: _e.strong, class: "tok-strong" },
  { tag: _e.keyword, class: "tok-keyword" },
  { tag: _e.atom, class: "tok-atom" },
  { tag: _e.bool, class: "tok-bool" },
  { tag: _e.url, class: "tok-url" },
  { tag: _e.labelName, class: "tok-labelName" },
  { tag: _e.inserted, class: "tok-inserted" },
  { tag: _e.deleted, class: "tok-deleted" },
  { tag: _e.literal, class: "tok-literal" },
  { tag: _e.string, class: "tok-string" },
  { tag: _e.number, class: "tok-number" },
  { tag: [_e.regexp, _e.escape, _e.special(_e.string)], class: "tok-string2" },
  { tag: _e.variableName, class: "tok-variableName" },
  { tag: _e.local(_e.variableName), class: "tok-variableName tok-local" },
  { tag: _e.definition(_e.variableName), class: "tok-variableName tok-definition" },
  { tag: _e.special(_e.variableName), class: "tok-variableName2" },
  { tag: _e.definition(_e.propertyName), class: "tok-propertyName tok-definition" },
  { tag: _e.typeName, class: "tok-typeName" },
  { tag: _e.namespace, class: "tok-namespace" },
  { tag: _e.className, class: "tok-className" },
  { tag: _e.macroName, class: "tok-macroName" },
  { tag: _e.propertyName, class: "tok-propertyName" },
  { tag: _e.operator, class: "tok-operator" },
  { tag: _e.comment, class: "tok-comment" },
  { tag: _e.meta, class: "tok-meta" },
  { tag: _e.invalid, class: "tok-invalid" },
  { tag: _e.punctuation, class: "tok-punctuation" }
]);
var iu;
const Vs = /* @__PURE__ */ new Je();
function Rk(n) {
  return we.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
const Pk = /* @__PURE__ */ new Je();
class _n {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], s = "") {
    this.data = e, this.name = s, lt.prototype.hasOwnProperty("tree") || Object.defineProperty(lt.prototype, "tree", { get() {
      return fi(this);
    } }), this.parser = t, this.extension = [
      ro.of(this),
      lt.languageData.of((o, r, l) => {
        let a = ld(o, r, l), u = a.type.prop(Vs);
        if (!u)
          return [];
        let c = o.facet(u), h = a.type.prop(Pk);
        if (h) {
          let f = a.resolve(r - a.from, l);
          for (let d of h)
            if (d.test(f, o)) {
              let g = o.facet(d.facet);
              return d.type == "replace" ? g : g.concat(c);
            }
        }
        return c;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, i = -1) {
    return ld(e, t, i).type.prop(Vs) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(ro);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], s = (o, r) => {
      if (o.prop(Vs) == this.data) {
        i.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Je.mounted);
      if (l) {
        if (l.tree.prop(Vs) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + r, to: a.to + r });
          else
            i.push({ from: r, to: r + o.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (s(l.tree, l.overlay[0].from + r), i.length > a)
            return;
        }
      }
      for (let a = 0; a < o.children.length; a++) {
        let u = o.children[a];
        u instanceof At && s(u, o.positions[a] + r);
      }
    };
    return s(fi(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
_n.setState = /* @__PURE__ */ kt.define();
function ld(n, e, t) {
  let i = n.facet(ro), s = fi(n).topNode;
  if (!i || i.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, Bt.ExcludeBuffers | Bt.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function fi(n) {
  let e = n.field(_n.state, !1);
  return e ? e.tree : At.empty;
}
class _k {
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
    let i = this.cursorPos - this.string.length;
    return e < i || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - i, t - i);
  }
}
let wo = null;
class so {
  constructor(e, t, i = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new so(e, t, [], At.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new _k(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != At.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(Ss.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Ss.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = wo;
    wo = this;
    try {
      return e();
    } finally {
      wo = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = ad(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, h, f) => a.push({ fromA: u, toA: c, fromB: h, toB: f })), i = Ss.applyChanges(i, a), s = At.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), h = e.mapPos(u.to, -1);
          c < h && l.push({ from: c, to: h });
        }
      }
    }
    return new so(this.parser, t, i, s, o, r, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: s, to: o } = this.skipped[i];
      s < e.to && o > e.from && (this.fragments = ad(this.fragments, s, o), this.skipped.splice(i--, 1));
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
    return new class extends Dm {
      createParse(t, i, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = wo;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new At(fn.none, [], [], r - o);
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
    return wo;
  }
}
function ad(n, e, t) {
  return Ss.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class oo {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new oo(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = so.create(e.facet(ro).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new oo(i);
  }
}
_n.state = /* @__PURE__ */ zn.define({
  create: oo.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(_n.setState))
        return t.value;
    return e.startState.facet(ro) != e.state.facet(ro) ? oo.init(e.state) : n.apply(e);
  }
});
let Em = (n) => {
  let e = setTimeout(
    () => n(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Em = (n) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(n, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const su = typeof navigator < "u" && (!((iu = navigator.scheduling) === null || iu === void 0) && iu.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Nk = /* @__PURE__ */ gn.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(_n.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(_n.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Em(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: s } } = this.view, o = i.field(_n.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !su ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && i.doc.length > s + 1e3, a = o.context.work(() => su && su() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: _n.setState.of(new oo(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Pn(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), ro = /* @__PURE__ */ we.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: (n) => [
    _n.state,
    Nk,
    De.contentAttributes.compute([n], (e) => {
      let t = e.facet(n);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Vk = /* @__PURE__ */ we.define(), Yc = /* @__PURE__ */ we.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    let e = n[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return e;
  }
});
function $s(n) {
  let e = n.facet(Yc);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function Pl(n, e) {
  let t = "", i = n.tabSize, s = n.facet(Yc)[0];
  if (s == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Bm(n, e) {
  n instanceof lt && (n = new ha(n));
  for (let i of n.state.facet(Vk)) {
    let s = i(n, e);
    if (s !== void 0)
      return s;
  }
  let t = fi(n.state);
  return t.length >= e ? Hk(n, t, e) : null;
}
class ha {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = $s(e);
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
    let i = this.state.doc.lineAt(e), { simulateBreak: s, simulateDoubleBreak: o } = this.options;
    return s != null && s >= i.from && s <= i.to ? o && s == e ? { text: "", from: e } : (t < 0 ? s < e : s <= e) ? { text: i.text.slice(s - i.from), from: s } : { text: i.text.slice(0, s - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: s } = this.lineAt(e, t);
    return i.slice(e - s, Math.min(i.length, e + 100 - s));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: i, from: s } = this.lineAt(e, t), o = this.countColumn(i, e - s), r = this.options.overrideIndentation ? this.options.overrideIndentation(s) : -1;
    return r > -1 && (o += r - this.countColumn(i, i.search(/\S|$/))), o;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return sa(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: i, from: s } = this.lineAt(e, t), o = this.options.overrideIndentation;
    if (o) {
      let r = o(s);
      if (r > -1)
        return r;
    }
    return this.countColumn(i, i.search(/\S|$/));
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
const Im = /* @__PURE__ */ new Je();
function Hk(n, e, t) {
  let i = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != i.node) {
    let o = [];
    for (let r = s; r && !(r.from < i.node.from || r.to > i.node.to || r.from == i.node.from && r.type == i.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      i = { node: o[r], next: i };
  }
  return Rm(i, n, t);
}
function Rm(n, e, t) {
  for (let i = n; i; i = i.next) {
    let s = zk(i.node);
    if (s)
      return s(Xc.create(e, t, i));
  }
  return 0;
}
function Fk(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function zk(n) {
  let e = n.type.prop(Im);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(Je.closedBy))) {
    let s = n.lastChild, o = s && i.indexOf(s.name) > -1;
    return (r) => jk(r, !0, 1, void 0, o && !Fk(r) ? s.from : void 0);
  }
  return n.parent == null ? Wk : null;
}
function Wk() {
  return 0;
}
class Xc extends ha {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = i;
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
  static create(e, t, i) {
    return new Xc(e, t, i);
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
      let i = e.resolve(t.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (Kk(i, e))
        break;
      t = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return Rm(this.context.next, this.base, this.pos);
  }
}
function Kk(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function Uk(n) {
  let e = n.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let s = n.options.simulateBreak, o = n.state.doc.lineAt(t.from), r = s == null || s <= o.from ? o.to : Math.min(o.to, s);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == i)
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
function jk(n, e, t, i, s) {
  let o = n.textAfter, r = o.match(/^\s*/)[0].length, l = i && o.slice(r, r + i.length) == i || s == n.pos + r, a = Uk(n);
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
class fa {
  constructor(e, t) {
    this.specs = e;
    let i;
    function s(l) {
      let a = Ji.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof _n ? (l) => l.prop(Vs) == r.data : r ? (l) => l == r : void 0, this.style = Lm(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = i ? new Ji(i) : null, this.themeType = t.themeType;
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
    return new fa(e, t || {});
  }
}
const ic = /* @__PURE__ */ we.define(), Gk = /* @__PURE__ */ we.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function ou(n) {
  let e = n.facet(ic);
  return e.length ? e : n.facet(Gk);
}
function qk(n, e) {
  let t = [Xk], i;
  return n instanceof fa && (n.module && t.push(De.styleModule.of(n.module)), i = n.themeType), i ? t.push(ic.computeN([De.darkTheme], (s) => s.facet(De.darkTheme) == (i == "dark") ? [n] : [])) : t.push(ic.of(n)), t;
}
class Yk {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = fi(e.state), this.decorations = this.buildDeco(e, ou(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = fi(e.state), i = ou(e.state), s = i != ou(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, i), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Ct.none;
    let i = new ws();
    for (let { from: s, to: o } of e.visibleRanges)
      Ek(this.tree, t, (r, l, a) => {
        i.add(r, l, this.markCache[a] || (this.markCache[a] = Ct.mark({ class: a })));
      }, s, o);
    return i.finish();
  }
}
const Xk = /* @__PURE__ */ ta.high(/* @__PURE__ */ gn.fromClass(Yk, {
  decorations: (n) => n.decorations
})), Jk = 1e4, Zk = "()[]{}", Qk = /* @__PURE__ */ new Je();
function sc(n, e, t) {
  let i = n.prop(e < 0 ? Je.openedBy : Je.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let s = t.indexOf(n.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function oc(n) {
  let e = n.type.prop(Qk);
  return e ? e(n.node) : n;
}
function Hs(n, e, t, i = {}) {
  let s = i.maxScanDistance || Jk, o = i.brackets || Zk, r = fi(n), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = sc(a.type, t, o);
    if (u && a.from < a.to) {
      let c = oc(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return eS(n, e, t, a, c, u, o);
    }
  }
  return tS(n, e, t, r, l.type, s, o);
}
function eS(n, e, t, i, s, o, r) {
  let l = i.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(i.from) : c.childAfter(i.to)))
    do
      if (t < 0 ? c.to <= i.from : c.from >= i.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let h = oc(c);
          return { start: a, end: h ? { from: h.from, to: h.to } : void 0, matched: !0 };
        } else if (sc(c.type, t, r))
          u++;
        else if (sc(c.type, -t, r)) {
          if (u == 0) {
            let h = oc(c);
            return {
              start: a,
              end: h && h.from < h.to ? { from: h.from, to: h.to } : void 0,
              matched: !1
            };
          }
          u--;
        }
      }
    while (t < 0 ? c.prevSibling() : c.nextSibling());
  return { start: a, matched: !1 };
}
function tS(n, e, t, i, s, o, r) {
  if (t < 0 ? !e : e == n.doc.length)
    return null;
  let l = t < 0 ? n.sliceDoc(e - 1, e) : n.sliceDoc(e, e + 1), a = r.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let u = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = n.doc.iterRange(e, t > 0 ? n.doc.length : 0), h = 0;
  for (let f = 0; !c.next().done && f <= o; ) {
    let d = c.value;
    t < 0 && (f += d.length);
    let g = e + f * t;
    for (let v = t > 0 ? 0 : d.length - 1, m = t > 0 ? d.length : -1; v != m; v += t) {
      let b = r.indexOf(d[v]);
      if (!(b < 0 || i.resolveInner(g + v, 1).type != s))
        if (b % 2 == 0 == t > 0)
          h++;
        else {
          if (h == 1)
            return { start: u, end: { from: g + v, to: g + v + 1 }, matched: b >> 1 == a >> 1 };
          h--;
        }
    }
    t > 0 && (f += d.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function ud(n, e, t, i = 0, s = 0) {
  e == null && (e = n.search(/[^\s\u00a0]/), e == -1 && (e = n.length));
  let o = s;
  for (let r = i; r < e; r++)
    n.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class Pm {
  /**
  Create a stream.
  */
  constructor(e, t, i, s) {
    this.string = e, this.tabSize = t, this.indentUnit = i, this.overrideIndent = s, this.pos = 0, this.start = 0, this.lastColumnPos = 0, this.lastColumnValue = 0;
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
    let t = this.string.charAt(this.pos), i;
    if (typeof e == "string" ? i = t == e : i = t && (e instanceof RegExp ? e.test(t) : e(t)), i)
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = ud(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : ud(this.string, null, this.tabSize);
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
  match(e, t, i) {
    if (typeof e == "string") {
      let s = (r) => i ? r.toLowerCase() : r, o = this.string.substr(this.pos, e.length);
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
function nS(n) {
  return {
    name: n.name || "",
    token: n.token,
    blankLine: n.blankLine || (() => {
    }),
    startState: n.startState || (() => !0),
    copyState: n.copyState || iS,
    indent: n.indent || (() => null),
    languageData: n.languageData || {},
    tokenTable: n.tokenTable || Qc,
    mergeTokens: n.mergeTokens !== !1
  };
}
function iS(n) {
  if (typeof n != "object")
    return n;
  let e = {};
  for (let t in n) {
    let i = n[t];
    e[t] = i instanceof Array ? i.slice() : i;
  }
  return e;
}
const cd = /* @__PURE__ */ new WeakMap();
class Jc extends _n {
  constructor(e) {
    let t = Rk(e.languageData), i = nS(e), s, o = new class extends Dm {
      createParse(r, l, a) {
        return new oS(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = aS(t, this), s = this, this.streamParser = i, this.stateAfter = new Je({ perNode: !0 }), this.tokenTable = e.tokenTable ? new Hm(i.tokenTable) : lS;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Jc(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: i } = e.options;
    i && (t = cd.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = Zc(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = i ? i(a.from) : -1, h = new Pm(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; h.pos < u - a.from; )
          Nm(this.streamParser.token, h, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return i && t == null && cd.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function Zc(n, e, t, i, s) {
  let o = t >= i && t + e.length <= s && e.prop(n.stateAfter);
  if (o)
    return { state: n.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof At && a < s && Zc(n, l, a, i, s);
    if (u)
      return u;
  }
  return null;
}
function _m(n, e, t, i, s) {
  if (s && t <= 0 && i >= e.length)
    return e;
  !s && t == 0 && e.type == n.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < i && l instanceof At) {
      if (!(a = _m(n, l, t - r, i - r, s)))
        break;
      return s ? new At(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function sS(n, e, t, i, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && Zc(n, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= i && (u = _m(n, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: n.streamParser.startState(s ? $s(s) : 4), tree: At.empty };
}
class oS {
  constructor(e, t, i, s) {
    this.lang = e, this.input = t, this.fragments = i, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = so.get(), r = s[0].from, { state: l, tree: a } = sS(e, i, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState($s(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = so.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), i = Math.min(
      t,
      this.chunkStart + 512
      /* C.ChunkSize */
    );
    for (e && (i = Math.min(i, e.viewport.to)); this.parsedPos < i; )
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
      let i = t.indexOf(`
`);
      i > -1 && (t = t.slice(0, i));
    }
    return e + t.length <= this.to ? t : t.slice(0, this.to - e);
  }
  nextLine() {
    let e = this.parsedPos, t = this.lineAfter(e), i = e + t.length;
    for (let s = this.rangeIndex; ; ) {
      let o = this.ranges[s].to;
      if (o >= i || (t = t.slice(0, o - (i - t.length)), s++, s == this.ranges.length))
        break;
      let r = this.ranges[s].from, l = this.lineAfter(r);
      t += l, i = r + l.length;
    }
    return { line: t, end: i };
  }
  skipGapsTo(e, t, i) {
    for (; ; ) {
      let s = this.ranges[this.rangeIndex].to, o = e + t;
      if (i > 0 ? s > o : s >= o)
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
  emitToken(e, t, i, s) {
    let o = 4;
    if (this.ranges.length > 1) {
      s = this.skipGapsTo(t, s, 1), t += s;
      let l = this.chunk.length;
      s = this.skipGapsTo(i, s, -1), i += s, o += this.chunk.length - l;
    }
    let r = this.chunk.length - 4;
    return this.lang.streamParser.mergeTokens && o == 4 && r >= 0 && this.chunk[r] == e && this.chunk[r + 2] == t ? this.chunk[r + 2] = i : this.chunk.push(e, t, i, o), s;
  }
  parseLine(e) {
    let { line: t, end: i } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new Pm(t, e ? e.state.tabSize : 4, e ? $s(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = Nm(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = i, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = At.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: rS,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new At(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new At(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function Nm(n, e, t) {
  e.start = e.pos;
  for (let i = 0; i < 10; i++) {
    let s = n(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const Qc = /* @__PURE__ */ Object.create(null), lr = [fn.none], rS = /* @__PURE__ */ new Uc(lr), hd = [], fd = /* @__PURE__ */ Object.create(null), Vm = /* @__PURE__ */ Object.create(null);
for (let [n, e] of [
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
  Vm[n] = /* @__PURE__ */ Fm(Qc, e);
class Hm {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Vm);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = Fm(this.extra, e)) : 0;
  }
}
const lS = /* @__PURE__ */ new Hm(Qc);
function ru(n, e) {
  hd.indexOf(n) > -1 || (hd.push(n), console.warn(e));
}
function Fm(n, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = n[u] || _e[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : ru(u, `Modifier ${u} used at start of tag`) : a.length ? ru(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : ru(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), s = i + " " + t.map((l) => l.id), o = fd[s];
  if (o)
    return o.id;
  let r = fd[s] = fn.define({
    id: lr.length,
    name: i,
    props: [Ok({ [i]: t })]
  });
  return lr.push(r), r.id;
}
function aS(n, e) {
  let t = fn.define({ id: lr.length, name: "Document", props: [
    Vs.add(() => n),
    Im.add(() => (i) => e.getIndent(i))
  ], top: !0 });
  return lr.push(t), t;
}
St.RTL, St.LTR;
const uS = (n) => {
  let { state: e } = n, t = e.doc.lineAt(e.selection.main.from), i = th(n.state, t.from);
  return i.line ? cS(n) : i.block ? fS(n) : !1;
};
function eh(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let s = n(e, t);
    return s ? (i(t.update(s)), !0) : !1;
  };
}
const cS = /* @__PURE__ */ eh(
  gS,
  0
  /* CommentOption.Toggle */
), hS = /* @__PURE__ */ eh(
  zm,
  0
  /* CommentOption.Toggle */
), fS = /* @__PURE__ */ eh(
  (n, e) => zm(n, e, pS(e)),
  0
  /* CommentOption.Toggle */
);
function th(n, e) {
  let t = n.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const ko = 50;
function dS(n, { open: e, close: t }, i, s) {
  let o = n.sliceDoc(i - ko, i), r = n.sliceDoc(s, s + ko), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, h;
  s - i <= 2 * ko ? c = h = n.sliceDoc(i, s) : (c = n.sliceDoc(i, i + ko), h = n.sliceDoc(s - ko, s));
  let f = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(h)[0].length, g = h.length - d - t.length;
  return c.slice(f, f + e.length) == e && h.slice(g, g + t.length) == t ? {
    open: {
      pos: i + f + e.length,
      margin: /\s/.test(c.charAt(f + e.length)) ? 1 : 0
    },
    close: {
      pos: s - d - t.length,
      margin: /\s/.test(h.charAt(g - 1)) ? 1 : 0
    }
  } : null;
}
function pS(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), s = t.to <= i.to ? i : n.doc.lineAt(t.to);
    s.from > i.from && s.from == t.to && (s = t.to == i.to + 1 ? i : n.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > i.from ? e[o].to = s.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: s.to });
  }
  return e;
}
function zm(n, e, t = e.selection.ranges) {
  let i = t.map((o) => th(e, o.from).block);
  if (!i.every((o) => o))
    return null;
  let s = t.map((o, r) => dS(e, i[r], o.from, o.to));
  if (n != 2 && !s.every((o) => o))
    return { changes: e.changes(t.map((o, r) => s[r] ? [] : [{ from: o.from, insert: i[r].open + " " }, { from: o.to, insert: " " + i[r].close }])) };
  if (n != 1 && s.some((o) => o)) {
    let o = [];
    for (let r = 0, l; r < s.length; r++)
      if (l = s[r]) {
        let a = i[r], { open: u, close: c } = l;
        o.push({ from: u.pos - a.open.length, to: u.pos + u.margin }, { from: c.pos - c.margin, to: c.pos + a.close.length });
      }
    return { changes: o };
  }
  return null;
}
function gS(n, e, t = e.selection.ranges) {
  let i = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = i.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let h = e.doc.lineAt(c);
      if (u == null && (u = th(e, h.from).line, !u))
        continue e;
      if (h.from > s && (o == r || r > h.from)) {
        s = h.from;
        let f = /^\s*/.exec(h.text)[0].length, d = f == h.length, g = h.text.slice(f, f + u.length) == u ? f : -1;
        f < h.text.length && f < a && (a = f), i.push({ line: h, comment: g, token: u, indent: f, empty: d, single: !1 });
      }
      c = h.to + 1;
    }
    if (a < 1e9)
      for (let c = l; c < i.length; c++)
        i[c].indent < i[c].line.text.length && (i[c].indent = a);
    i.length == l + 1 && (i[l].single = !0);
  }
  if (n != 2 && i.some((o) => o.comment < 0 && (!o.empty || o.single))) {
    let o = [];
    for (let { line: l, token: a, indent: u, empty: c, single: h } of i)
      (h || !c) && o.push({ from: l.from + u, insert: a + " " });
    let r = e.changes(o);
    return { changes: r, selection: e.selection.map(r, 1) };
  } else if (n != 1 && i.some((o) => o.comment >= 0)) {
    let o = [];
    for (let { line: r, comment: l, token: a } of i)
      if (l >= 0) {
        let u = r.from + l, c = u + a.length;
        r.text[c - r.from] == " " && c++, o.push({ from: u, to: c });
      }
    return { changes: o };
  }
  return null;
}
function ho(n, e) {
  return te.create(n.ranges.map(e), n.mainIndex);
}
function Wn(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Kn({ state: n, dispatch: e }, t) {
  let i = ho(n.selection, t);
  return i.eq(n.selection, !0) ? !1 : (e(Wn(n, i)), !0);
}
function da(n, e) {
  return te.cursor(e ? n.to : n.from);
}
function Wm(n, e) {
  return Kn(n, (t) => t.empty ? n.moveByChar(t, e) : da(t, e));
}
function en(n) {
  return n.textDirectionAt(n.state.selection.main.head) == St.LTR;
}
const Km = (n) => Wm(n, !en(n)), Um = (n) => Wm(n, en(n));
function jm(n, e) {
  return Kn(n, (t) => t.empty ? n.moveByGroup(t, e) : da(t, e));
}
const mS = (n) => jm(n, !en(n)), vS = (n) => jm(n, en(n));
function yS(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function pa(n, e, t) {
  let i = fi(n).resolveInner(e.head), s = t ? Je.closedBy : Je.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? i.childAfter(a) : i.childBefore(a);
    if (!u)
      break;
    yS(n, u, s) ? i = u : a = t ? u.to : u.from;
  }
  let o = i.type.prop(s), r, l;
  return o && (r = t ? Hs(n, i.from, 1) : Hs(n, i.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? i.to : i.from, te.cursor(l, t ? -1 : 1);
}
const bS = (n) => Kn(n, (e) => pa(n.state, e, !en(n))), xS = (n) => Kn(n, (e) => pa(n.state, e, en(n)));
function Gm(n, e) {
  return Kn(n, (t) => {
    if (!t.empty)
      return da(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const qm = (n) => Gm(n, !1), Ym = (n) => Gm(n, !0);
function Xm(n) {
  let e = n.scrollDOM.clientHeight < n.scrollDOM.scrollHeight - 2, t = 0, i = 0, s;
  if (e) {
    for (let o of n.state.facet(De.scrollMargins)) {
      let r = o(n);
      r?.top && (t = Math.max(r?.top, t)), r?.bottom && (i = Math.max(r?.bottom, i));
    }
    s = n.scrollDOM.clientHeight - t - i;
  } else
    s = (n.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: i,
    selfScroll: e,
    height: Math.max(n.defaultLineHeight, s - 5)
  };
}
function Jm(n, e) {
  let t = Xm(n), { state: i } = n, s = ho(i.selection, (r) => r.empty ? n.moveVertically(r, e, t.height) : da(r, e));
  if (s.eq(i.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = n.coordsAtPos(i.selection.main.head), l = n.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = De.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return n.dispatch(Wn(i, s), { effects: o }), !0;
}
const dd = (n) => Jm(n, !1), rc = (n) => Jm(n, !0);
function ns(n, e, t) {
  let i = n.lineBlockAt(e.head), s = n.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? i.to : i.from) && (s = n.moveToLineBoundary(e, t, !1)), !t && s.head == i.from && i.length) {
    let o = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    o && e.head != i.from + o && (s = te.cursor(i.from + o));
  }
  return s;
}
const wS = (n) => Kn(n, (e) => ns(n, e, !0)), kS = (n) => Kn(n, (e) => ns(n, e, !1)), SS = (n) => Kn(n, (e) => ns(n, e, !en(n))), CS = (n) => Kn(n, (e) => ns(n, e, en(n))), MS = (n) => Kn(n, (e) => n.moveToLineBoundary(e, !1, !1)), AS = (n) => Kn(n, (e) => n.moveToLineBoundary(e, !0, !1));
function TS(n, e, t) {
  let i = !1, s = ho(n.selection, (o) => {
    let r = Hs(n, o.head, -1) || Hs(n, o.head, 1) || o.head > 0 && Hs(n, o.head - 1, 1) || o.head < n.doc.length && Hs(n, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    i = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return te.cursor(l);
  });
  return i ? (e(Wn(n, s)), !0) : !1;
}
const $S = ({ state: n, dispatch: e }) => TS(n, e);
function On(n, e, t) {
  let i = ho(n.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = te.range(s.head, s.anchor));
    let o = t(s);
    return te.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return i.eq(n.state.selection) ? !1 : (n.dispatch(Wn(n.state, i)), !0);
}
function Zm(n, e) {
  return On(n, e, (t) => n.moveByChar(t, e));
}
const Qm = (n) => Zm(n, !en(n)), ev = (n) => Zm(n, en(n));
function tv(n, e) {
  return On(n, e, (t) => n.moveByGroup(t, e));
}
const DS = (n) => tv(n, !en(n)), OS = (n) => tv(n, en(n)), LS = (n) => {
  let e = !en(n);
  return On(n, e, (t) => pa(n.state, t, e));
}, ES = (n) => {
  let e = en(n);
  return On(n, e, (t) => pa(n.state, t, e));
};
function nv(n, e) {
  return On(n, e, (t) => n.moveVertically(t, e));
}
const iv = (n) => nv(n, !1), sv = (n) => nv(n, !0);
function ov(n, e) {
  return On(n, e, (t) => n.moveVertically(t, e, Xm(n).height));
}
const pd = (n) => ov(n, !1), gd = (n) => ov(n, !0), BS = (n) => On(n, !0, (e) => ns(n, e, !0)), IS = (n) => On(n, !1, (e) => ns(n, e, !1)), RS = (n) => {
  let e = !en(n);
  return On(n, e, (t) => ns(n, t, e));
}, PS = (n) => {
  let e = en(n);
  return On(n, e, (t) => ns(n, t, e));
}, _S = (n) => On(n, !1, (e) => te.cursor(n.lineBlockAt(e.head).from)), NS = (n) => On(n, !0, (e) => te.cursor(n.lineBlockAt(e.head).to)), md = ({ state: n, dispatch: e }) => (e(Wn(n, { anchor: 0 })), !0), vd = ({ state: n, dispatch: e }) => (e(Wn(n, { anchor: n.doc.length })), !0), yd = ({ state: n, dispatch: e }) => (e(Wn(n, { anchor: n.selection.main.anchor, head: 0 })), !0), bd = ({ state: n, dispatch: e }) => (e(Wn(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), VS = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), HS = ({ state: n, dispatch: e }) => {
  let t = ga(n).map(({ from: i, to: s }) => te.undirectionalRange(i, Math.min(s + 1, n.doc.length)));
  return e(n.update({ selection: te.create(t), userEvent: "select" })), !0;
}, FS = ({ state: n, dispatch: e }) => {
  let t = ho(n.selection, (i) => {
    let s = fi(n), o = s.resolveStack(i.from, 1);
    if (i.empty) {
      let r = s.resolveStack(i.from, -1);
      r.node.from >= o.node.from && r.node.to <= o.node.to && (o = r);
    }
    for (let r = o; r; r = r.next) {
      let { node: l } = r;
      if ((l.from < i.from && l.to >= i.to || l.to > i.to && l.from <= i.from) && r.next)
        return te.undirectionalRange(l.from, l.to);
    }
    return i;
  });
  return t.eq(n.selection) ? !1 : (e(Wn(n, t)), !0);
};
function rv(n, e) {
  let { state: t } = n, i = t.selection, s = t.selection.ranges.slice();
  for (let o of t.selection.ranges) {
    let r = t.doc.lineAt(o.head);
    if (e ? r.to < n.state.doc.length : r.from > 0)
      for (let l = o; ; ) {
        let a = n.moveVertically(l, e);
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
  return s.length == i.ranges.length ? !1 : (n.dispatch(Wn(t, te.create(s, s.length - 1))), !0);
}
const zS = (n) => rv(n, !1), WS = (n) => rv(n, !0), KS = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = te.create([t.main]) : t.main.empty || (i = te.create([te.cursor(t.main.head)])), i ? (e(Wn(n, i)), !0) : !1;
};
function yr(n, e) {
  if (n.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = n, s = i.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = qr(n, a, !1)) : a > r && (t = "delete.forward", a = qr(n, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = qr(n, r, !1), l = qr(n, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: te.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (n.dispatch(i.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? De.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function qr(n, e, t) {
  if (n instanceof De)
    for (let i of n.state.facet(De.atomicRanges).map((s) => s(n)))
      i.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const lv = (n, e, t) => yr(n, (i) => {
  let s = i.from, { state: o } = n, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = sa(l, o.tabSize), c = u % $s(o) || $s(o);
    for (let h = 0; h < c && l[l.length - 1 - h] == " "; h++)
      s--;
    a = s;
  } else
    a = Jt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = Jt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), lc = (n) => lv(n, !1, !0), av = (n) => lv(n, !0, !1), uv = (n, e) => yr(n, (t) => {
  let i = t.head, { state: s } = n, o = s.doc.lineAt(i), r = s.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? o.to : o.from)) {
      i == t.head && o.number != (e ? s.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let a = Jt(o.text, i - o.from, e) + o.from, u = o.text.slice(Math.min(i, a) - o.from, Math.max(i, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || i != t.head) && (l = c), i = a;
  }
  return i;
}), cv = (n) => uv(n, !1), US = (n) => uv(n, !0), jS = (n) => yr(n, (e) => {
  let t = n.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), GS = (n) => yr(n, (e) => {
  let t = n.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), qS = (n) => yr(n, (e) => {
  let t = n.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), YS = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: nt.of(["", ""]) },
    range: te.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, XS = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let s = i.from, o = n.doc.lineAt(s), r = s == o.from ? s - 1 : Jt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : Jt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: n.doc.slice(s, l).append(n.doc.slice(r, s)) },
      range: te.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function ga(n) {
  let e = [], t = -1;
  for (let i of n.selection.ranges) {
    let s = n.doc.lineAt(i.from), o = n.doc.lineAt(i.to);
    if (!i.empty && i.to == o.from && (o = n.doc.lineAt(i.to - 1)), t >= s.number) {
      let r = e[e.length - 1];
      r.to = o.to, r.ranges.push(i);
    } else
      e.push({ from: s.from, to: o.to, ranges: [i] });
    t = o.number + 1;
  }
  return e;
}
function hv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], s = [];
  for (let o of ga(n)) {
    if (t ? o.to == n.doc.length : o.from == 0)
      continue;
    let r = n.doc.lineAt(t ? o.to + 1 : o.from - 1), l = r.length + 1;
    if (t) {
      i.push({ from: o.to, to: r.to }, { from: o.from, insert: r.text + n.lineBreak });
      for (let a of o.ranges)
        s.push(te.range(Math.min(n.doc.length, a.anchor + l), Math.min(n.doc.length, a.head + l)));
    } else {
      i.push({ from: r.from, to: o.from }, { from: o.to, insert: n.lineBreak + r.text });
      for (let a of o.ranges)
        s.push(te.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (e(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: te.create(s, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const JS = ({ state: n, dispatch: e }) => hv(n, e, !1), ZS = ({ state: n, dispatch: e }) => hv(n, e, !0);
function fv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let o of ga(n))
    t ? i.push({ from: o.from, insert: n.doc.slice(o.from, o.to) + n.lineBreak }) : i.push({ from: o.to, insert: n.lineBreak + n.doc.slice(o.from, o.to) });
  let s = n.changes(i);
  return e(n.update({
    changes: s,
    selection: n.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const QS = ({ state: n, dispatch: e }) => fv(n, e, !1), eC = ({ state: n, dispatch: e }) => fv(n, e, !0), tC = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(ga(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), i = ho(e.selection, (s) => {
    let o;
    if (n.lineWrapping) {
      let r = n.lineBlockAt(s.head), l = n.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + n.documentTop - l.bottom + n.defaultLineHeight / 2);
    }
    return n.moveVertically(s, !0, o);
  }).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function nC(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = fi(n).resolveInner(e), i = t.childBefore(e), s = t.childAfter(e), o;
  return i && s && i.to <= e && s.from >= e && (o = i.type.prop(Je.closedBy)) && o.indexOf(s.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(s.from).from && !/\S/.test(n.sliceDoc(i.to, s.from)) ? { from: i.to, to: s.from } : null;
}
const xd = /* @__PURE__ */ dv(!1), iC = /* @__PURE__ */ dv(!0);
function dv(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !n && o == r && nC(e, o);
      n && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new ha(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Bm(u, o);
      for (c == null && (c = sa(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let h = ["", Pl(e, c)];
      return a && h.push(Pl(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: nt.of(h) },
        range: te.cursor(o + 1 + h[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function nh(n, e) {
  let t = -1;
  return n.changeByRange((i) => {
    let s = [];
    for (let r = i.from; r <= i.to; ) {
      let l = n.doc.lineAt(r);
      l.number > t && (i.empty || i.to > l.from) && (e(l, s, i), t = l.number), r = l.to + 1;
    }
    let o = n.changes(s);
    return {
      changes: s,
      range: te.range(o.mapPos(i.anchor, 1), o.mapPos(i.head, 1))
    };
  });
}
const sC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new ha(n, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = nh(n, (o, r, l) => {
    let a = Bm(i, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = Pl(n, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(n.update(s, { userEvent: "indent" })), !0;
}, oC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(nh(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(Yc) });
}), { userEvent: "input.indent" })), !0), rC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(nh(n, (t, i) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = sa(s, n.tabSize), r = 0, l = Pl(n, Math.max(0, o - $s(n)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  i.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), lC = (n) => (n.setTabFocusMode(), !0), aC = [
  { key: "Ctrl-b", run: Km, shift: Qm, preventDefault: !0 },
  { key: "Ctrl-f", run: Um, shift: ev },
  { key: "Ctrl-p", run: qm, shift: iv },
  { key: "Ctrl-n", run: Ym, shift: sv },
  { key: "Ctrl-a", run: MS, shift: _S },
  { key: "Ctrl-e", run: AS, shift: NS },
  { key: "Ctrl-d", run: av },
  { key: "Ctrl-h", run: lc },
  { key: "Ctrl-k", run: jS },
  { key: "Ctrl-Alt-h", run: cv },
  { key: "Ctrl-o", run: YS },
  { key: "Ctrl-t", run: XS },
  { key: "Ctrl-v", run: rc }
], uC = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Km, shift: Qm, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: mS, shift: DS, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: SS, shift: RS, preventDefault: !0 },
  { key: "ArrowRight", run: Um, shift: ev, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: vS, shift: OS, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: CS, shift: PS, preventDefault: !0 },
  { key: "ArrowUp", run: qm, shift: iv, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: md, shift: yd },
  { mac: "Ctrl-ArrowUp", run: dd, shift: pd },
  { key: "ArrowDown", run: Ym, shift: sv, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: vd, shift: bd },
  { mac: "Ctrl-ArrowDown", run: rc, shift: gd },
  { key: "PageUp", run: dd, shift: pd },
  { key: "PageDown", run: rc, shift: gd },
  { key: "Home", run: kS, shift: IS, preventDefault: !0 },
  { key: "Mod-Home", run: md, shift: yd },
  { key: "End", run: wS, shift: BS, preventDefault: !0 },
  { key: "Mod-End", run: vd, shift: bd },
  { key: "Enter", run: xd, shift: xd },
  { key: "Mod-a", run: VS },
  { key: "Backspace", run: lc, shift: lc, preventDefault: !0 },
  { key: "Delete", run: av, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: cv, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: US, preventDefault: !0 },
  { mac: "Mod-Backspace", run: GS, preventDefault: !0 },
  { mac: "Mod-Delete", run: qS, preventDefault: !0 }
].concat(/* @__PURE__ */ aC.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), cC = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: bS, shift: LS },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: xS, shift: ES },
  { key: "Alt-ArrowUp", run: JS },
  { key: "Shift-Alt-ArrowUp", run: QS },
  { key: "Alt-ArrowDown", run: ZS },
  { key: "Shift-Alt-ArrowDown", run: eC },
  { key: "Mod-Alt-ArrowUp", run: zS },
  { key: "Mod-Alt-ArrowDown", run: WS },
  { key: "Escape", run: KS },
  { key: "Mod-Enter", run: iC },
  { key: "Alt-l", mac: "Ctrl-l", run: HS },
  { key: "Mod-i", run: FS, preventDefault: !0 },
  { key: "Mod-[", run: rC },
  { key: "Mod-]", run: oC },
  { key: "Mod-Alt-\\", run: sC },
  { key: "Shift-Mod-k", run: tC },
  { key: "Shift-Mod-\\", run: $S },
  { key: "Mod-/", run: uS },
  { key: "Alt-A", mac: "Ctrl-A", run: hS },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: lC }
].concat(uC);
class wd {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.diagnostic = i;
  }
}
class ps {
  constructor(e, t, i) {
    this.diagnostics = e, this.panel = t, this.selected = i;
  }
  static init(e, t, i) {
    let s = i.facet(ar).markerFilter;
    s && (e = s(e, i));
    let o = e.slice().sort((d, g) => d.from - g.from || d.to - g.to), r = new ws(), l = [], a = 0, u = i.doc.iter(), c = 0, h = i.doc.length;
    for (let d = 0; ; ) {
      let g = d == o.length ? null : o[d];
      if (!g && !l.length)
        break;
      let v, m;
      if (l.length)
        v = a, m = l.reduce((L, E) => Math.min(L, E.to), g && g.from > v ? g.from : 1e8);
      else {
        if (v = g.from, v > h)
          break;
        m = g.to, l.push(g), d++;
      }
      for (; d < o.length; ) {
        let L = o[d];
        if (L.from == v && (L.to > L.from || L.to == v))
          l.push(L), d++, m = Math.min(L.to, m);
        else {
          m = Math.min(L.from, m);
          break;
        }
      }
      m = Math.min(m, h);
      let b = !1;
      if (l.some((L) => L.from == v && (L.to == m || m == h)) && (b = v == m, !b && m - v < 10)) {
        let L = v - (c + u.value.length);
        L > 0 && (u.next(L), c = v);
        for (let E = v; ; ) {
          if (E >= m) {
            b = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > E)
            break;
          E = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let O = xv(l);
      if (b)
        r.add(v, v, Ct.widget({
          widget: new pC(O),
          diagnostics: l.slice()
        }));
      else {
        let L = l.reduce((E, B) => B.markClass ? E + " " + B.markClass : E, "");
        r.add(v, m, Ct.mark({
          class: "cm-lintRange cm-lintRange-" + O + L,
          diagnostics: l.slice(),
          inclusiveEnd: l.some((E) => E.to > m)
        }));
      }
      if (a = m, a == h)
        break;
      for (let L = 0; L < l.length; L++)
        l[L].to <= a && l.splice(L--, 1);
    }
    let f = r.finish();
    return new ps(f, t, lo(f));
  }
}
function lo(n, e = null, t = 0) {
  let i = null;
  return n.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!i)
        i = new wd(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(i.diagnostic) < 0)
          return !1;
        i = new wd(i.from, o, i.diagnostic);
      }
  }), i;
}
function pv(n, e) {
  let t = e.pos, i = e.end || t, s = n.state.facet(ar).hideOn(n, t, i);
  if (s != null)
    return s;
  let o = n.startState.doc.lineAt(e.pos);
  return !!(n.effects.some((r) => r.is(ma)) || n.changes.touchesRange(o.from, Math.max(o.to, i)));
}
function hC(n, e) {
  return n.field(Nn, !1) ? e : e.concat(kt.appendConfig.of(SC));
}
function lu(n, e) {
  return {
    effects: hC(n, [ma.of(e)])
  };
}
const ma = /* @__PURE__ */ kt.define(), gv = /* @__PURE__ */ kt.define(), mv = /* @__PURE__ */ kt.define(), Nn = /* @__PURE__ */ zn.define({
  create() {
    return new ps(Ct.none, null, null);
  },
  update(n, e) {
    if (e.docChanged && n.diagnostics.size) {
      let t = n.diagnostics.map(e.changes), i = null, s = n.panel;
      if (n.selected) {
        let o = e.changes.mapPos(n.selected.from, 1);
        i = lo(t, n.selected.diagnostic, o) || lo(t, null, o);
      }
      !t.size && s && e.state.facet(ar).autoPanel && (s = null), n = new ps(t, s, i);
    }
    for (let t of e.effects)
      if (t.is(ma)) {
        let i = e.state.facet(ar).autoPanel ? t.value.length ? _l.open : null : n.panel;
        n = ps.init(t.value, i, e.state);
      } else t.is(gv) ? n = new ps(n.diagnostics, t.value ? _l.open : null, n.selected) : t.is(mv) && (n = new ps(n.diagnostics, n.panel, t.value));
    return n;
  },
  provide: (n) => [
    Zu.from(n, (e) => e.panel),
    De.decorations.from(n, (e) => e.diagnostics)
  ]
}), fC = /* @__PURE__ */ Ct.mark({ class: "cm-lintRange cm-lintRange-active" });
function dC(n, e, t) {
  let { diagnostics: i } = n.state.field(Nn), s, o = -1, r = -1;
  i.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = n.state.facet(ar).tooltipFilter;
  return s && l && (s = l(s, n.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: vv(n, s) };
    }
  } : null;
}
function vv(n, e) {
  return oi("ul", { class: "cm-tooltip-lint" }, e.map((t) => bv(n, t, !1)));
}
const kd = (n) => {
  let e = n.state.field(Nn, !1);
  return !e || !e.panel ? !1 : (n.dispatch({ effects: gv.of(!1) }), !0);
}, ar = /* @__PURE__ */ we.define({
  combine(n) {
    return {
      sources: n.map((e) => e.source).filter((e) => e != null),
      ...ia(n.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: Sd,
        tooltipFilter: Sd,
        needsRefresh: (e, t) => e ? t ? (i) => e(i) || t(i) : e : t,
        hideOn: (e, t) => e ? t ? (i, s, o) => e(i, s, o) || t(i, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function Sd(n, e) {
  return n ? e ? (t, i) => e(n(t, i), i) : n : e;
}
function yv(n) {
  let e = [];
  if (n)
    e: for (let { name: t } of n) {
      for (let i = 0; i < t.length; i++) {
        let s = t[i];
        if (/[a-zA-Z]/.test(s) && !e.some((o) => o.toLowerCase() == s.toLowerCase())) {
          e.push(s);
          continue e;
        }
      }
      e.push("");
    }
  return e;
}
function bv(n, e, t) {
  var i;
  let s = t ? yv(e.actions) : [];
  return oi("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, oi("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(n) : e.message), (i = e.actions) === null || i === void 0 ? void 0 : i.map((o, r) => {
    let l = !1, a = (d) => {
      if (d.preventDefault(), l)
        return;
      l = !0;
      let g = lo(n.state.field(Nn).diagnostics, e);
      g && o.apply(n, g.from, g.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, h = c < 0 ? u : [
      u.slice(0, c),
      oi("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], f = o.markClass ? " " + o.markClass : "";
    return oi("button", {
      type: "button",
      class: "cm-diagnosticAction" + f,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, h);
  }), e.source && oi("div", { class: "cm-diagnosticSource" }, e.source));
}
class pC extends pr {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return oi("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class Cd {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = bv(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class _l {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          kd(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = yv(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = lo(this.view.state.field(Nn).diagnostics, o);
              a && o.actions[l].apply(e, a.from, a.to);
            }
        } else
          return;
        s.preventDefault();
      }
    }, i = (s) => {
      for (let o = 0; o < this.items.length; o++)
        this.items[o].dom.contains(s.target) && this.moveSelection(o);
    };
    this.list = oi("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: i
    }), this.dom = oi("div", { class: "cm-panel-lint" }, this.list, oi("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => kd(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(Nn).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(Nn), i = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
    for (e.between(0, this.view.state.doc.length, (l, a, { spec: u }) => {
      for (let c of u.diagnostics) {
        if (r.has(c))
          continue;
        r.add(c);
        let h = -1, f;
        for (let d = i; d < this.items.length; d++)
          if (this.items[d].diagnostic == c) {
            h = d;
            break;
          }
        h < 0 ? (f = new Cd(this.view, c), this.items.splice(i, 0, f), s = !0) : (f = this.items[h], h > i && (this.items.splice(i, h - i), s = !0)), t && f.diagnostic == t.diagnostic ? f.dom.hasAttribute("aria-selected") || (f.dom.setAttribute("aria-selected", "true"), o = f) : f.dom.hasAttribute("aria-selected") && f.dom.removeAttribute("aria-selected"), i++;
      }
    }); i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Cd(this.view, {
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
      let i = e;
      e = i.nextSibling, i.remove();
    }
    for (let i of this.items)
      if (i.dom.parentNode == this.list) {
        for (; e != i.dom; )
          t();
        e = i.dom.nextSibling;
      } else
        this.list.insertBefore(i.dom, e);
    for (; e; )
      t();
  }
  moveSelection(e) {
    if (this.selectedIndex < 0)
      return;
    let t = this.view.state.field(Nn), i = lo(t.diagnostics, this.items[e].diagnostic);
    i && this.view.dispatch({
      selection: { anchor: i.from, head: i.to },
      scrollIntoView: !0,
      effects: mv.of(i)
    });
  }
  static open(e) {
    return new _l(e);
  }
}
function fl(n, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(n)}</svg>')`;
}
function Yr(n) {
  return fl(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${n}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const gC = /* @__PURE__ */ De.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Yr("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Yr("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Yr("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Yr("#66d") },
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
function mC(n) {
  return n == "error" ? 4 : n == "warning" ? 3 : n == "info" ? 2 : 1;
}
function xv(n) {
  let e = "hint", t = 1;
  for (let i of n) {
    let s = mC(i.severity);
    s > t && (t = s, e = i.severity);
  }
  return e;
}
class wv extends es {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = xv(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let i = this.diagnostics, s = e.state.facet(va).tooltipFilter;
    return s && (i = s(i, e.state)), i.length && (t.onmouseover = () => yC(e, t, i)), t;
  }
}
function vC(n, e) {
  let t = (i) => {
    let s = e.getBoundingClientRect();
    if (!(i.clientX > s.left - 10 && i.clientX < s.right + 10 && i.clientY > s.top - 10 && i.clientY < s.bottom + 10)) {
      for (let o = i.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), n.state.field(kv) && n.dispatch({ effects: ih.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function yC(n, e, t) {
  function i() {
    let r = n.elementAtHeight(e.getBoundingClientRect().top + 5 - n.documentTop);
    n.coordsAtPos(r.from) && n.dispatch({ effects: ih.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: vv(n, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, vC(n, e);
  }
  let { hoverTime: s } = n.state.facet(va), o = setTimeout(i, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(i, s);
  };
}
function bC(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = n.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let i = [];
  for (let s in t)
    i.push(new wv(t[s]).range(+s));
  return Ye.of(i, !0);
}
const xC = /* @__PURE__ */ ck({
  class: "cm-gutter-lint",
  markers: (n) => n.state.field(ac),
  widgetMarker: (n, e, t) => {
    let i = [];
    return n.state.field(ac).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && i.push(...r.diagnostics);
    }), i.length ? new wv(i) : null;
  }
}), ac = /* @__PURE__ */ zn.define({
  create() {
    return Ye.empty;
  },
  update(n, e) {
    n = n.map(e.changes);
    let t = e.state.facet(va).markerFilter;
    for (let i of e.effects)
      if (i.is(ma)) {
        let s = i.value;
        t && (s = t(s || [], e.state)), n = bC(e.state.doc, s.slice(0));
      }
    return n;
  }
}), ih = /* @__PURE__ */ kt.define(), kv = /* @__PURE__ */ zn.define({
  create() {
    return null;
  },
  update(n, e) {
    return n && e.docChanged && (n = pv(e, n) ? null : { ...n, pos: e.changes.mapPos(n.pos) }), e.effects.reduce((t, i) => i.is(ih) ? i.value : t, n);
  },
  provide: (n) => Kc.from(n)
}), wC = /* @__PURE__ */ De.baseTheme({
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
    content: /* @__PURE__ */ fl('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ fl('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ fl('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), kC = /* @__PURE__ */ ok(dC, { hideOn: pv }), SC = [
  Nn,
  /* @__PURE__ */ De.decorations.compute([Nn], (n) => {
    let { selected: e, panel: t } = n.field(Nn);
    return !e || !t || e.from == e.to ? Ct.none : Ct.set([
      fC.range(e.from, e.to)
    ]);
  }),
  kC,
  gC
], va = /* @__PURE__ */ we.define({
  combine(n) {
    return ia(n, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function CC(n = {}) {
  return [va.of(n), ac, xC, wC, kv];
}
const Md = /* @__PURE__ */ Qt({
  __name: "AbcEditor",
  props: {
    text: {},
    diagnostics: {},
    reveal: {},
    readonly: { type: Boolean }
  },
  emits: ["change", "cursor"],
  setup(n, { emit: e }) {
    const t = n, i = e, s = /* @__PURE__ */ G(null);
    let o = null, r = !1;
    const l = Jc.define({
      token(f) {
        return f.sol() && f.match(/^%.*/) ? "comment" : f.sol() && f.match(/^[A-Za-z]:.*/) ? "meta" : f.match(/^"[^"\n]*"/) ? "string" : f.match(/^\[K:[^\]\n]*\]/) ? "meta" : f.eat("|") ? "punctuation" : f.match(/^[zZ][0-9]*/) ? "atom" : f.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (f.next(), null);
      },
      startState: () => null
    }), a = fa.define([
      { tag: _e.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: _e.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: _e.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: _e.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: _e.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
    ]), u = De.theme({
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
    function c(f) {
      const d = f.doc.length;
      return t.diagnostics.filter((g) => typeof g.start == "number" && typeof g.end == "number").map((g) => ({
        from: Math.min(g.start, d),
        to: Math.min(Math.max(g.end, g.start), d),
        severity: g.severity === "error" ? "error" : g.severity === "warning" ? "warning" : "info",
        message: g.message
      }));
    }
    dr(() => {
      s.value && (o = new De({
        parent: s.value,
        state: lt.create({
          doc: t.text,
          extensions: [
            vk(),
            Ww(),
            qw(),
            ym.of(cC),
            l,
            qk(a),
            CC(),
            u,
            De.lineWrapping,
            lt.readOnly.of(!!t.readonly),
            De.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            De.updateListener.of((f) => {
              f.docChanged && !r && i("change", f.state.doc.toString()), f.selectionSet && !r && f.transactions.some((d) => d.isUserEvent("select")) && i("cursor", f.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(lu(o.state, c(o.state))));
    }), $i(() => o?.destroy()), Ge(
      () => t.text,
      (f) => {
        if (!o || o.state.doc.toString() === f) return;
        r = !0;
        const d = Math.min(o.state.selection.main.head, f.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: f }, selection: { anchor: d } }), r = !1, o.dispatch(lu(o.state, c(o.state)));
      }
    ), Ge(
      () => t.diagnostics,
      () => {
        o && o.dispatch(lu(o.state, c(o.state)));
      }
    ), Ge(
      () => t.reveal,
      (f) => {
        if (!o || !f) return;
        const d = o.state.doc.length, [g, v] = [Math.min(f[0], d), Math.min(f[1], d)], m = o.state.selection.main;
        m.from === g && m.to === v || (r = !0, o.dispatch({ selection: te.single(g, v) }), r = !1, h(o, g));
      }
    );
    function h(f, d) {
      const g = f.scrollDOM, v = f.lineBlockAt(d);
      (v.top < g.scrollTop || v.bottom > g.scrollTop + g.clientHeight) && (g.scrollTop = Math.max(0, v.top - g.clientHeight / 3));
    }
    return (f, d) => (w(), M("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), ti = 18, fs = 24, xi = ti + fs, Do = 22, Oo = 34, wn = 36, MC = 6, Ad = 3, AC = 12, Sv = 6, Cv = 28, TC = 21, $C = 108;
function sh(n) {
  return [
    ...n.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...n.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function ya(n) {
  const e = Number(n.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function DC(n, e) {
  return e === "auto" ? Math.max(1, n.grid.snap) : Math.max(1, Math.round(ya(n) / e));
}
function OC(n, e = 4, t = 24) {
  let i = n.length ? Math.min(...n.map((o) => o.pitch)) - e : 60, s = n.length ? Math.max(...n.map((o) => o.pitch)) + e : 79;
  if (s - i + 1 < t) {
    const o = t - (s - i + 1);
    i -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return i < 0 && ([i, s] = [0, Math.min(127, s - i)]), s > 127 && ([i, s] = [Math.max(0, i - (s - 127)), 127]), [i, s];
}
function LC(n) {
  const e = n.map((s) => s.pitch), t = Math.max(0, Math.min(TC, ...e.map((s) => s - 2))), i = Math.min(127, Math.max($C, ...e.map((s) => s + 2)));
  return [t, i];
}
function EC(n, e) {
  const t = xi + (e.lyrics ? Do : 0), i = t + (e.source ? Oo : 0), s = sh(n), [o, r] = LC(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(n.grid.units_per_quarter, 1e-9), u = Math.max(Sv, Math.min(Cv, Math.round(e.rowHeight ?? AC))), c = DC(n, e.snap), h = Math.max(1, Math.round(n.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: OC(s),
    total: n.total,
    snap: c,
    drawLength: Math.max(c, Math.round(h / c) * c),
    width: wn + n.total * a + 40,
    height: i + l * u,
    top: i,
    sourceTop: e.source ? t : null
  };
}
const rt = (n, e) => wn + n * e.pxPerUnit, Qn = (n, e) => (n - wn) / e.pxPerUnit, ao = (n, e) => e.top + (e.high - n) * e.rowHeight;
function Mv(n, e, t, i) {
  const s = (ao(i, n) + ao(t, n) + n.rowHeight) / 2, o = Math.max(0, e - n.top), r = s - n.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, n.height - e), r)));
}
function Td(n, e, t, i) {
  const s = ao(i, n);
  return s >= e + n.top && s + n.rowHeight <= e + t ? null : Mv(n, t, i, i);
}
function Nl(n, e) {
  const t = e.high - Math.floor((n - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const uc = (n, e) => Math.floor(n / e) * e, Xr = (n, e) => Math.round(n / e) * e;
function Fi(n, e) {
  return {
    x: rt(n.onset, e),
    y: ao(n.pitch, e) + 0.5,
    width: Math.max(2, n.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function Vl(n, e, t) {
  const i = n.name.length * 7 + 10, s = e ? (e.onset - n.onset) * t.pxPerUnit - 2 : i;
  return Math.max(12, Math.min(i, s));
}
const BC = (n) => [1, 3, 6, 8, 10].includes((n % 12 + 12) % 12);
function IC(n) {
  return `C${Math.floor(n / 12) - 1}`;
}
function RC(n) {
  const e = [];
  for (const t of n.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const i = Number(t.meter.split("/")[0]) || 1, s = t.length / i;
    for (let o = 1; o < i; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function $d(n, e, t, i, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, Qn(n, s))), u = e - r;
  if (u < ti) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= xi && u < s.top) return { area: "lyrics", unit: a };
  if (u < xi) {
    for (let f = i.length - 1; f >= 0; f--) {
      const d = i[f], g = rt(d.onset, s);
      if (n >= g && n <= g + Vl(d, i[f + 1], s)) return { area: "chord", chord: d };
    }
    return { area: "lane", unit: a };
  }
  if (n - l < wn) return { area: "keys", pitch: Nl(e, s) };
  const c = t.filter((f) => {
    const d = Fi(f, s);
    return n >= d.x && n <= d.x + d.width && e >= d.y - 0.5 && e <= d.y + d.height + 0.5;
  }), h = c.find((f) => f.track === o) ?? c[0];
  if (h) {
    const f = Fi(h, s), d = n >= f.x + f.width - Math.min(MC, f.width / 3) ? "end" : "body";
    return { area: "note", note: h, edge: d };
  }
  return { area: "grid", unit: a, pitch: Nl(e, s) };
}
function Av(n, e, t) {
  return n.y0 < (n.from?.scrollTop ?? t) + e || n.y1 < t + e;
}
function Tv(n, e, t = 0, i = 0) {
  const s = n.from?.scrollTop ?? t, o = n.from?.scrollLeft ?? i, r = (f, d) => Math.max(d + wn, Math.min(e.width, f)), l = (f, d) => Math.max(d + e.top, Math.min(e.height, f)), a = [r(n.x0, o), r(n.x1, i)], u = [l(n.y0, s), l(n.y1, t)], c = Math.min(...a), h = Math.min(...u);
  return { x: c, y: h, width: Math.max(...a) - c, height: Math.max(...u) - h };
}
function PC(n, e = 0, t = xi) {
  return Av(n, t, e);
}
function _C(n, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : n.filter((i) => {
    const s = Fi(i, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function NC(n, e, t, i = 0, s = 0) {
  if (!Av(e, t.top, i)) return [];
  const o = Tv(e, t, i, s);
  return o.width <= 0 ? [] : n.filter((r, l) => {
    const a = rt(r.onset, t);
    return a < o.x + o.width && a + Vl(r, n[l + 1], t) > o.x;
  });
}
function VC(n, e, t, i) {
  return { kind: "move", notes: n, anchor: e, fromUnit: t, fromPitch: i, delta: 0, semitones: 0 };
}
function HC(n, e = [], t = 1 / 0) {
  const i = e.filter((o) => o.track === n.track && o.onset > n.onset).map((o) => o.onset), s = Math.min(t, ...i);
  return { kind: "resize", note: n, end: n.onset + n.duration, overwrite: !1, limit: s };
}
function FC(n, e, t, i) {
  const s = Math.max(0, Math.min(uc(e, i.snap), i.total - 1));
  return { kind: "draw", track: n, start: s, end: Math.min(i.total, s + i.snap), pitch: t };
}
function zC(n, e = n.onset) {
  return { kind: "chord", chord: n, fromUnit: e, to: n.onset };
}
const Lo = (n, e, t) => Math.max(e, Math.min(t, n));
function WC(n, e, t, i, s) {
  switch (n.kind) {
    case "move": {
      const o = n.anchor.onset + (e - n.fromUnit), r = Math.min(...n.notes.map((f) => f.onset)), l = Math.max(...n.notes.map((f) => f.onset + f.duration)), a = Lo(Xr(o, i.snap) - n.anchor.onset, -r, i.total - l), u = Math.min(...n.notes.map((f) => f.pitch)), c = Math.max(...n.notes.map((f) => f.pitch)), h = Lo(t - n.fromPitch, -u, 127 - c);
      return { ...n, delta: a, semitones: h, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(i.snap, i.total - n.note.onset), r = s.alt ? i.total : Math.max(n.note.onset + n.note.duration, Math.min(i.total, n.limit)), l = Lo(Xr(e, i.snap), n.note.onset + Math.max(1, o), r);
      return { ...n, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= n.start ? n.start + i.snap : Math.max(n.start + i.snap, Xr(e, i.snap));
      return { ...n, end: Math.min(i.total, o) };
    }
    case "chord":
      return { ...n, to: Lo(Xr(n.chord.onset + e - n.fromUnit, i.snap), 0, i.total - 1) };
  }
}
function KC(n, e) {
  switch (n.kind) {
    case "move": {
      if (n.copy) {
        const t = Math.min(...n.notes.map((s) => s.onset)), i = Math.max(...n.notes.map((s) => s.onset + s.duration));
        return !n.delta && !n.semitones ? null : {
          op: "paste",
          at: t + n.delta,
          mode: "overwrite",
          span: i - t,
          tracks: [...new Set(n.notes.map((s) => s.track))],
          with_chords: !1,
          notes: n.notes.map((s) => ({ track: s.track, onset: s.onset - t, duration: s.duration, pitch: s.pitch + n.semitones })),
          chords: [],
          sections: []
        };
      }
      return !n.delta && !n.semitones ? null : { op: "move_notes", ids: n.notes.map((t) => t.id), delta: n.delta, semitones: n.semitones };
    }
    case "resize": {
      const t = n.end - n.note.onset;
      return t === n.note.duration ? null : { op: "resize_note", id: n.note.id, duration: t, mode: n.overwrite ? "overwrite" : e };
    }
    case "draw":
      return { op: "insert_note", track: n.track, onset: n.start, duration: n.end - n.start, pitch: n.pitch };
    case "chord":
      return n.to === n.chord.onset ? null : { op: "move_chord", onset: n.chord.onset, to: n.to };
  }
}
function UC(n) {
  if (!n) return [];
  switch (n.kind) {
    case "move":
      return n.notes.map((e) => ({
        track: e.track,
        onset: e.onset + n.delta,
        duration: e.duration,
        pitch: e.pitch + n.semitones
      }));
    case "resize":
      return [{ track: n.note.track, onset: n.note.onset, duration: n.end - n.note.onset, pitch: n.note.pitch }];
    case "draw":
      return [{ track: n.track, onset: n.start, duration: n.end - n.start, pitch: n.pitch }];
    case "chord":
      return [];
  }
}
function jC(n) {
  return n ? n.kind === "move" ? n.copy ? /* @__PURE__ */ new Set() : new Set(n.notes.map((e) => e.id)) : n.kind === "resize" ? /* @__PURE__ */ new Set([n.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function GC(n, e, t, i, s, o) {
  const r = t.map((l) => l.id);
  switch (n) {
    case "ArrowUp":
    case "ArrowDown": {
      if (!t.length && !i.length) return;
      const l = (e.shift ? 12 : 1) * (n === "ArrowUp" ? 1 : -1), a = t.map((u) => u.pitch + l);
      return a.length && (Math.min(...a) < 0 || Math.max(...a) > 127) ? null : { op: "set_note_pitch", ids: [...r, ...i.map((u) => u.id)], semitones: l };
    }
    case "ArrowLeft":
    case "ArrowRight": {
      if (!t.length) return;
      const l = n === "ArrowRight" ? 1 : -1;
      if (e.alt) {
        const f = t[0], d = f.duration + l * s.snap;
        return d < 1 || f.onset + d > s.total ? null : { op: "resize_note", id: f.id, duration: d, mode: o };
      }
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((f) => f.onset)), c = Math.max(...t.map((f) => f.onset + f.duration)), h = Lo(l * a, -u, s.total - c);
      return h ? { op: "move_notes", ids: r, delta: h } : null;
    }
    case "Delete":
    case "Backspace": {
      const l = [...r, ...i.map((a) => a.id)];
      return l.length ? { op: e.shift ? "delete_close_gap" : "delete", ids: l } : void 0;
    }
    default:
      return;
  }
}
const qC = /^(vocal|ins):\d+$/;
function uo(n, e) {
  const t = n?.model?.tracks, i = /* @__PURE__ */ new Set();
  if (!t) return i;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (qC.test(o)) i.add(o);
    else {
      const r = s.get(o);
      r && i.add(r);
    }
  return i;
}
function ur(n) {
  return new Set(n.filter((e) => e.startsWith("chord:")));
}
function Jr(n, e = []) {
  return [...n.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const $v = [
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
], YC = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Dv(n, e) {
  let t = null;
  for (const i of n.measures) i.onset <= e && (t = i);
  return t;
}
function Ov(n, e, t) {
  const i = n?.model;
  if (!i) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = uo(n, e), o = ur(e), r = sh(i).filter((h) => s.has(h.id)), l = i.tracks.chords.filter((h) => o.has(h.id)), a = r.length === 1 ? i.tracks.chords.find((h) => h.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Dv(i, u) : t ? i.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function XC(n, e) {
  const t = Dv(n, e) ?? n.measures[0], i = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(i / o) + 1, l = i - (r - 1) * o, a = ya(n), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: i, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function JC(n, e, t) {
  const i = n.measures[e - 1];
  return !i || !Number.isInteger(t) || t < 0 || t >= i.length ? null : i.onset + t;
}
const ZC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, QC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function cc(n) {
  return `${QC[n % 12]}${Math.floor(n / 12) - 1}`;
}
function e2(n) {
  const e = n.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const i = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + ZC[t[1].toUpperCase()] + i;
  return s >= 0 && s <= 127 ? s : null;
}
function t2(n) {
  const e = ya(n), t = [];
  for (const i of [32, 16, 8, 4, 2, 1]) {
    e % i === 0 && t.push({ label: `1/${i}`, units: e / i });
    const s = e / i * 1.5;
    i >= 2 && i <= 16 && Number.isInteger(s) && t.push({ label: `1/${i}.`, units: s });
  }
  return t.sort((i, s) => i.units - s.units);
}
function n2(n, e) {
  return !n.length || n.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: n.map((t) => t.id), midi: e };
}
function Bi(n, e, t = []) {
  return !n.length && !t.length || n.some((i) => i.pitch + e < 0 || i.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...n.map((i) => i.id), ...t.map((i) => i.id)], semitones: e };
}
function Dd(n, e) {
  return !n.length || n.every((t) => t.track === e) ? null : { op: "move_notes", ids: n.map((t) => t.id), track: e };
}
function i2(n, e, t) {
  return t === null || t === e.onset || t + e.duration > n.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function s2(n, e, t, i) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > n.total ? null : { op: "resize_note", id: e.id, duration: t, mode: i };
}
function o2(n, e, t) {
  const i = e.trim();
  return i ? t?.name === i ? null : { op: "put_chord", onset: n, name: i } : t ? { op: "delete_chord", onset: n } : null;
}
function r2(n, e) {
  return e === null || e === n.onset ? null : { op: "move_chord", onset: n.onset, to: e };
}
function Od(n, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? n.n : n.n + 1, count: t };
}
function l2(n, e = 1) {
  return { op: "duplicate_measures", bar: n.n, count: e };
}
function a2(n, e, t = 1) {
  return n.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Ld(n, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === n.meter ? null : { op: "change_meter", bar: n.n, count: 1, meter: t };
}
function Lv(n, e) {
  return n.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function u2(n, e) {
  return !$v.includes(e) || e === n.key ? null : { op: "put_key", onset: n.onset, key: e };
}
function c2(n, e) {
  const t = Lv(n, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function h2(n, e) {
  return n === "text" ? "text" : n === "daw" ? "daw" : n === "review" ? "review" : e;
}
const f2 = {
  class: "inspector",
  "aria-label": "Inspector"
}, d2 = {
  key: 0,
  class: "facts"
}, p2 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, g2 = {
  key: 0,
  class: "facts"
}, m2 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, v2 = ["disabled"], y2 = ["disabled"], b2 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, x2 = ["disabled"], w2 = ["disabled"], k2 = ["disabled", "onKeydown"], S2 = ["disabled"], C2 = ["disabled"], M2 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, A2 = ["disabled", "onKeydown"], T2 = ["disabled", "aria-label", "onKeydown"], $2 = { class: "facts" }, D2 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, O2 = ["disabled", "aria-label"], L2 = ["disabled"], E2 = ["value"], B2 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, I2 = ["disabled"], R2 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, P2 = ["disabled", "onKeydown"], _2 = { class: "field" }, N2 = ["disabled"], V2 = ["disabled"], H2 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, F2 = {
  key: 0,
  class: "facts"
}, z2 = { class: "field" }, W2 = ["disabled", "onKeydown"], K2 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, U2 = ["disabled"], j2 = ["disabled"], G2 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, q2 = ["disabled", "onKeydown"], Y2 = ["disabled", "onKeydown"], X2 = { class: "field" }, J2 = ["disabled"], Z2 = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, Q2 = { class: "facts" }, eM = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, tM = ["disabled"], nM = ["disabled"], iM = { class: "field" }, sM = ["disabled"], oM = ["aria-label"], rM = { class: "facts" }, lM = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, aM = ["disabled"], uM = ["disabled"], cM = ["disabled"], hM = ["disabled"], fM = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, dM = ["disabled"], pM = { id: "plenio-meters" }, gM = ["value"], mM = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, vM = ["disabled"], yM = ["value"], bM = ["disabled"], xM = {
  key: 4,
  class: "facts"
}, wM = {
  key: 5,
  class: "error"
}, kM = /* @__PURE__ */ Qt({
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
  setup(n) {
    const e = n, t = N(() => e.view?.model ?? null), i = N(() => Ov(e.view, e.selection, e.fallbackBar)), s = N(() => i.value.notes.length === 1 ? i.value.notes[0] : null), o = N(() => i.value.chords.length === 1 && !i.value.notes.length ? i.value.chords[0] : null), r = N(() => i.value.measure), l = N(() => !e.readonly && !e.stale && !e.busy), a = N(() => t.value ? t2(t.value) : []), u = N(() => t.value && r.value ? Lv(t.value, r.value) : null), c = N(() => {
      const j = s.value?.onset ?? o.value?.onset;
      return t.value && j !== void 0 ? XC(t.value, j) : null;
    }), h = N(() => {
      const j = new Set(i.value.notes.map((D) => D.track));
      return j.size === 1 ? [...j][0] : j.size ? "mixed" : null;
    }), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(1), g = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(1), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(""), O = /* @__PURE__ */ G("4/4"), L = /* @__PURE__ */ G("C");
    Ge(
      [s, o, r, () => i.value.chordAtNote],
      () => {
        const j = s.value;
        f.value = j ? cc(j.pitch) : "", v.value = j?.duration ?? 1, d.value = c.value?.bar ?? 1, g.value = c.value?.offset ?? 0, b.value = (j ? i.value.chordAtNote?.name : o.value?.name) ?? "", O.value = r.value?.meter ?? "4/4", L.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const E = /* @__PURE__ */ G(null);
    async function B(j) {
      !j || !l.value || (E.value = null, await e.operate(j));
    }
    function z() {
      const j = e2(f.value);
      if (j === null) {
        E.value = `"${f.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, f.value = s.value ? cc(s.value.pitch) : "";
        return;
      }
      B(n2(i.value.notes, j));
    }
    function P() {
      const j = t.value;
      if (!j) return;
      const D = JC(j, Number(d.value), Number(g.value));
      if (D === null) {
        E.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? B(i2(j, s.value, D)) : o.value && B(r2(o.value, D));
    }
    function Y(j = Number(v.value)) {
      const D = t.value;
      !D || !s.value || B(s2(D, s.value, j, m.value ? "overwrite" : e.resizeMode));
    }
    function K() {
      const j = s.value?.onset ?? o.value?.onset;
      j !== void 0 && B(o2(j, b.value, s.value ? i.value.chordAtNote : o.value));
    }
    function re(j) {
      const D = [...i.value.notes.map((U) => U.id), ...i.value.chords.map((U) => U.id)];
      D.length && B({ op: j ? "delete_close_gap" : "delete", ids: D });
    }
    return (j, D) => (w(), M("aside", f2, [
      t.value ? (w(), M(me, { key: 1 }, [
        i.value.notes.length ? (w(), M("section", p2, [
          p("h4", null, [
            ye(F(s.value ? `${h.value === "vocal" ? "Vocal" : "Ins"} note` : `${i.value.notes.length} notes`) + " ", 1),
            c.value ? (w(), M("span", g2, F(c.value.text), 1)) : ee("", !0)
          ]),
          p("div", m2, [
            D[36] || (D[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: qe({ active: h.value === "vocal" }),
              disabled: !l.value,
              onClick: D[0] || (D[0] = (U) => B(V(Dd)(i.value.notes, "vocal")))
            }, "Vocal", 10, v2),
            p("button", {
              class: qe({ active: h.value === "ins" }),
              disabled: !l.value,
              onClick: D[1] || (D[1] = (U) => B(V(Dd)(i.value.notes, "ins")))
            }, "Ins", 10, y2)
          ]),
          p("div", b2, [
            D[37] || (D[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: D[2] || (D[2] = (U) => B(V(Bi)(i.value.notes, -12, i.value.chords)))
            }, "−8va", 8, x2),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: D[3] || (D[3] = (U) => B(V(Bi)(i.value.notes, -1, i.value.chords)))
            }, "−1", 8, w2),
            s.value ? ze((w(), M("input", {
              key: 0,
              "onUpdate:modelValue": D[4] || (D[4] = (U) => f.value = U),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: Lt(ft(z, ["prevent"]), ["enter"]),
              onChange: z
            }, null, 40, k2)), [
              [Nt, f.value]
            ]) : ee("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: D[5] || (D[5] = (U) => B(V(Bi)(i.value.notes, 1, i.value.chords)))
            }, "+1", 8, S2),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: D[6] || (D[6] = (U) => B(V(Bi)(i.value.notes, 12, i.value.chords)))
            }, "+8va", 8, C2)
          ]),
          s.value ? (w(), M(me, { key: 0 }, [
            p("div", M2, [
              D[38] || (D[38] = p("span", { class: "name" }, "start", -1)),
              D[39] || (D[39] = ye(" bar ", -1)),
              ze(p("input", {
                "onUpdate:modelValue": D[7] || (D[7] = (U) => d.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: Lt(ft(P, ["prevent"]), ["enter"]),
                onChange: P
              }, null, 40, A2), [
                [
                  Nt,
                  d.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              D[40] || (D[40] = ye(" + ", -1)),
              ze(p("input", {
                "onUpdate:modelValue": D[8] || (D[8] = (U) => g.value = U),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: Lt(ft(P, ["prevent"]), ["enter"]),
                onChange: P
              }, null, 40, T2), [
                [
                  Nt,
                  g.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", $2, "× " + F(t.value.unit), 1)
            ]),
            p("div", D2, [
              D[42] || (D[42] = p("span", { class: "name" }, "length", -1)),
              ze(p("input", {
                "onUpdate:modelValue": D[9] || (D[9] = (U) => v.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: D[10] || (D[10] = Lt(ft((U) => Y(), ["prevent"]), ["enter"])),
                onChange: D[11] || (D[11] = (U) => Y())
              }, null, 40, O2), [
                [
                  Nt,
                  v.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: D[12] || (D[12] = (U) => Y(Number(U.target.value)))
              }, [
                D[41] || (D[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (w(!0), M(me, null, Be(a.value, (U) => (w(), M("option", {
                  key: U.label,
                  value: U.units
                }, F(U.label), 9, E2))), 128))
              ], 40, L2)
            ]),
            p("label", B2, [
              ze(p("input", {
                "onUpdate:modelValue": D[13] || (D[13] = (U) => m.value = U),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, I2), [
                [un, m.value]
              ]),
              D[43] || (D[43] = ye(" longer: over the next note ", -1))
            ]),
            p("div", R2, [
              D[44] || (D[44] = p("span", { class: "name" }, "chord", -1)),
              ze(p("input", {
                "onUpdate:modelValue": D[14] || (D[14] = (U) => b.value = U),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: Lt(ft(K, ["prevent"]), ["enter"]),
                onChange: K
              }, null, 40, P2), [
                [Nt, b.value]
              ])
            ])
          ], 64)) : ee("", !0),
          p("div", _2, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: D[15] || (D[15] = (U) => re(!1))
            }, "→ rest", 8, N2),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: D[16] || (D[16] = (U) => re(!0))
            }, "close gap", 8, V2)
          ])
        ])) : o.value ? (w(), M("section", H2, [
          p("h4", null, [
            D[45] || (D[45] = ye(" Chord symbol ", -1)),
            c.value ? (w(), M("span", F2, F(c.value.text), 1)) : ee("", !0)
          ]),
          p("div", z2, [
            D[46] || (D[46] = p("span", { class: "name" }, "name", -1)),
            ze(p("input", {
              "onUpdate:modelValue": D[17] || (D[17] = (U) => b.value = U),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: Lt(ft(K, ["prevent"]), ["enter"]),
              onChange: K
            }, null, 40, W2), [
              [Nt, b.value]
            ])
          ]),
          p("div", K2, [
            D[47] || (D[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: D[18] || (D[18] = (U) => B(V(Bi)([], -1, i.value.chords)))
            }, "−1", 8, U2),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: D[19] || (D[19] = (U) => B(V(Bi)([], 1, i.value.chords)))
            }, "+1", 8, j2)
          ]),
          p("div", G2, [
            D[48] || (D[48] = p("span", { class: "name" }, "start", -1)),
            D[49] || (D[49] = ye(" bar ", -1)),
            ze(p("input", {
              "onUpdate:modelValue": D[20] || (D[20] = (U) => d.value = U),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: Lt(ft(P, ["prevent"]), ["enter"]),
              onChange: P
            }, null, 40, q2), [
              [
                Nt,
                d.value,
                void 0,
                { number: !0 }
              ]
            ]),
            D[50] || (D[50] = ye(" + ", -1)),
            ze(p("input", {
              "onUpdate:modelValue": D[21] || (D[21] = (U) => g.value = U),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: Lt(ft(P, ["prevent"]), ["enter"]),
              onChange: P
            }, null, 40, Y2), [
              [
                Nt,
                g.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", X2, [
            p("button", {
              disabled: !l.value,
              onClick: D[22] || (D[22] = (U) => re(!1))
            }, "remove", 8, J2)
          ])
        ])) : i.value.chords.length > 1 ? (w(), M("section", Z2, [
          p("h4", null, [
            ye(F(i.value.chords.length) + " chord symbols ", 1),
            p("span", Q2, F(i.value.chords.map((U) => U.name).join(" ")), 1)
          ]),
          p("div", eM, [
            D[51] || (D[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: D[23] || (D[23] = (U) => B(V(Bi)([], -1, i.value.chords)))
            }, "−1", 8, tM),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: D[24] || (D[24] = (U) => B(V(Bi)([], 1, i.value.chords)))
            }, "+1", 8, nM)
          ]),
          p("div", iM, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: D[25] || (D[25] = (U) => re(!1))
            }, "remove", 8, sM)
          ])
        ])) : ee("", !0),
        r.value ? (w(), M("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            ye(" Bar " + F(r.value.n) + " ", 1),
            p("span", rM, F(r.value.meter) + " · " + F(r.value.key), 1)
          ]),
          p("div", lM, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: D[26] || (D[26] = (U) => B(V(Od)(r.value, "before")))
            }, "+ before", 8, aM),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: D[27] || (D[27] = (U) => B(V(Od)(r.value, "after")))
            }, "+ after", 8, uM),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: D[28] || (D[28] = (U) => B(V(l2)(r.value)))
            }, "duplicate", 8, cM),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: D[29] || (D[29] = (U) => B(V(a2)(t.value, r.value)))
            }, "delete", 8, hM)
          ]),
          p("div", fM, [
            D[52] || (D[52] = p("span", { class: "name" }, "meter", -1)),
            ze(p("input", {
              "onUpdate:modelValue": D[30] || (D[30] = (U) => O.value = U),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: D[31] || (D[31] = Lt(ft((U) => B(V(Ld)(r.value, O.value)), ["prevent"]), ["enter"])),
              onChange: D[32] || (D[32] = (U) => B(V(Ld)(r.value, O.value)))
            }, null, 40, dM), [
              [Nt, O.value]
            ]),
            p("datalist", pM, [
              (w(!0), M(me, null, Be(V(YC), (U) => (w(), M("option", {
                key: U,
                value: U
              }, null, 8, gM))), 128))
            ])
          ]),
          p("div", mM, [
            D[53] || (D[53] = p("span", { class: "name" }, "key", -1)),
            ze(p("select", {
              "onUpdate:modelValue": D[33] || (D[33] = (U) => L.value = U),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: D[34] || (D[34] = (U) => B(V(u2)(r.value, L.value)))
            }, [
              (w(!0), M(me, null, Be(V($v), (U) => (w(), M("option", {
                key: U,
                value: U
              }, F(U), 9, yM))), 128))
            ], 40, vM), [
              [Xi, L.value]
            ]),
            u.value ? (w(), M("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: D[35] || (D[35] = (U) => B(V(c2)(t.value, r.value)))
            }, "remove change", 8, bM)) : ee("", !0)
          ])
        ], 8, oM)) : ee("", !0),
        !i.value.notes.length && !o.value && !r.value ? (w(), M("p", xM, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : ee("", !0),
        E.value ? (w(), M("p", wM, F(E.value), 1)) : ee("", !0)
      ], 64)) : (w(), M("p", d2, F(n.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), SM = { class: "keys-help" }, CM = ["aria-expanded"], MM = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, AM = /* @__PURE__ */ Qt({
  __name: "KeysHelp",
  setup(n) {
    const e = /* @__PURE__ */ G(!1), t = [
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
    return (i, s) => (w(), M("span", SM, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, CM),
      e.value ? (w(), M("div", MM, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (w(), M(me, null, Be(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, F(o.title), 1),
          p("table", null, [
            (w(!0), M(me, null, Be(o.rows, ([r, l]) => (w(), M("tr", { key: r }, [
              p("th", null, F(r), 1),
              p("td", null, F(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : ee("", !0)
    ]));
  }
}), TM = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], hc = [4, 8, 16, 32, 64];
function $M(n) {
  return n.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function DM(n) {
  const e = {};
  for (const t of n) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function OM(n) {
  const e = n?.model?.unit ?? n?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), i = Number.isFinite(t) && t > 0 ? t : 16, s = hc.filter((o) => o <= i);
  return s.length ? s[s.length - 1] : hc[0];
}
function LM(n) {
  let e = "";
  for (let t = 0; t < n.length; t += 8192)
    e += String.fromCharCode(...n.subarray(t, t + 8192));
  return btoa(e);
}
function EM(n) {
  const e = atob(n), t = new Uint8Array(e.length);
  for (let i = 0; i < e.length; i++) t[i] = e.charCodeAt(i);
  return t;
}
function Ys(n, e, t = "audio/midi") {
  const i = new ArrayBuffer(e.length);
  new Uint8Array(i).set(e);
  const s = URL.createObjectURL(new Blob([i], { type: t })), o = document.createElement("a");
  o.href = s, o.download = n, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function BM(n) {
  const e = n.name.trim() || "unnamed";
  return n.notes === 1 ? `${e} · 1 note` : `${e} · ${n.notes} notes`;
}
function IM(n, e, t, { current: i = 0, keep: s = !0 } = {}) {
  const o = [...n];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && i) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${i} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Ed(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
class RM {
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
  record(e, t, i = {}) {
    if (e === this.current.text && !i.side) return;
    const s = i.group ?? null;
    this.entries = this.entries.slice(0, this.cursor + 1), s !== null && s === this.openGroup && this.cursor > 0 ? this.entries[this.cursor] = { text: e, label: t, extra: this.entries[this.cursor].extra } : (this.entries.push(i.extra === void 0 ? { text: e, label: t } : { text: e, label: t, extra: i.extra }), this.cursor = this.entries.length - 1, this.entries.length > this.limit && (this.entries.shift(), this.cursor--)), this.openGroup = s;
  }
  /**
   * Attach ``extra`` to the current step unless it has its own: the state that belonged to this
   * text before a step changes it, so an undo back to here restores it. Objects are merged key by
   * key - the step keeps what it has and gains what it lacks (an import's Guide notes, then the
   * lyrics of an arrangement).
   */
  annotate(e) {
    const t = this.current.extra;
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Ed(t) && Ed(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function Xs(n) {
  return n instanceof Jd ? `${n.message}${n.hint ? ` — ${n.hint}` : ""}` : String(n instanceof Error ? n.message : n);
}
function PM(n) {
  if (!n.text.trim()) return null;
  if (n.pending || n.busy) return "The score is still being checked.";
  if (n.checkFailed) return `The score could not be checked: ${n.checkFailed}`;
  if (!n.view) return "The score has not been checked yet.";
  if (!n.view.ok) {
    const e = n.view.diagnostics.find((i) => i.severity === "error");
    return `The ABC text is not valid${e ? ` (${e.line ? `line ${e.line}` : e.where}: ${e.message})` : ""}. Fix it, or revert to the last valid score.`;
  }
  return null;
}
function _M(n, e) {
  const t = /* @__PURE__ */ Fs(null), i = /* @__PURE__ */ Fs(null), s = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(null), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G([]), c = /* @__PURE__ */ G([]), h = new RM(n.text), f = /* @__PURE__ */ G(0);
  let d = "", g = 0, v, m = !1;
  const b = N(() => t.value && t.value.sha256 && !o.value ? t.value : null), O = N(() => xs(i.value, c.value[0])), L = N(() => (f.value, h.canUndo)), E = N(() => (f.value, h.canRedo)), B = N(() => (f.value, h.undoLabel)), z = N(() => (f.value, h.redoLabel)), P = N(
    () => PM({
      text: n.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), Y = N(
    () => s.value !== null && s.value !== n.text && !!t.value && !t.value.ok
  );
  function K(be, Ie) {
    if (t.value = be, a.value = null, be.ok) {
      i.value = be, s.value = Ie;
      const se = y1(be);
      c.value = c.value.filter((Z) => se.has(Z));
    }
  }
  async function re() {
    const be = n.text, Ie = ++g;
    if (d = be, !be.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const se = await Qv(e.fetcher, be, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Ie !== g || d !== be || n.text !== be) return;
      K(se, be), l.value = null;
    } catch (se) {
      n.text === be && (l.value = Xs(se), a.value = l.value);
    } finally {
      n.text === be && (o.value = !1);
    }
  }
  function j(be = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(v), v = setTimeout(() => {
      re();
    }, be);
  }
  function D(be, Ie, se, Z) {
    be !== n.text && (m = !0, n.text = be, m = !1, h.record(be, Ie, { group: se, extra: Z }), f.value++, e.onEdit?.());
  }
  function U(be) {
    D(be, "typing", "typing"), j();
  }
  function ke(be, Ie, se = null, Z) {
    return be === n.text ? !1 : (h.seal(), Z && h.annotate(Z.before), D(be, Ie, void 0, Z?.after), h.seal(), clearTimeout(v), d = be, o.value = !1, u.value = [], se && se.ok && (se.lyrics || !e.lyrics?.()) ? (K(se, be), l.value = null) : j(0), !0);
  }
  async function $e(be) {
    const Ie = n.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++g;
      const se = await ey(e.fetcher, Ie, be, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (n.text !== Ie)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const Z = e.onTransform?.(se, be);
      return h.seal(), Z && h.annotate(Z.before), D(se.abc, se.changes[0] ?? be.op, void 0, Z?.after), h.seal(), clearTimeout(v), o.value = !1, d = se.abc, K(se.analysis, se.abc), u.value = [...se.changes, ...se.warnings.map((ne) => `warning: ${ne}`)], se.select.length && (c.value = b1(se.analysis, se.select)), !0;
    } catch (se) {
      return l.value = Xs(se), !1;
    } finally {
      r.value = !1;
    }
  }
  function ce(be) {
    be && (m = !0, n.text = be.text, m = !1, be.extra !== void 0 && e.onRestore?.(be.extra), f.value++, e.onEdit?.(), u.value = [], j(0));
  }
  const pe = () => ce(h.undo()), He = () => ce(h.redo());
  function Oe() {
    const be = s.value;
    return be === null || be === n.text || !i.value ? !1 : (h.seal(), D(be, "revert to the last valid score"), h.seal(), clearTimeout(v), d = be, o.value = !1, t.value = i.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Re(be) {
    c.value = be;
  }
  function Le(be, Ie, se) {
    h.seal(), h.annotate(Ie), h.record(n.text, be, { extra: se, side: !0 }), h.seal(), f.value++;
  }
  function J() {
    r.value ? setTimeout(J, 60) : n.text.trim() && !o.value && re();
  }
  Ge(
    () => n.text,
    (be) => {
      m || (h.seal(), h.record(be, "document replaced"), h.seal(), f.value++, j(0));
    },
    { flush: "sync" }
  );
  function ct() {
    clearTimeout(v);
  }
  return j(0), /* @__PURE__ */ ms({
    view: t,
    lastValid: i,
    lastValidText: s,
    current: b,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: O,
    canUndo: L,
    canRedo: E,
    undoLabel: B,
    redoLabel: z,
    commitBlock: P,
    canRevert: Y,
    typed: U,
    replaceText: ke,
    operate: $e,
    undo: pe,
    redo: He,
    revertToLastValid: Oe,
    select: Re,
    analyze: re,
    refreshLyrics: J,
    recordSide: Le,
    dispose: ct
  });
}
const NM = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, VM = { class: "facts" }, HM = { class: "body" }, FM = {
  key: 0,
  class: "hint"
}, zM = {
  key: 1,
  class: "error",
  role: "alert"
}, WM = { class: "tracks" }, KM = { class: "number" }, UM = ["onUpdate:modelValue", "aria-label"], jM = ["value", "title"], GM = {
  key: 0,
  class: "hint"
}, qM = { class: "controls" }, YM = { title: "Foreign timing is quantised to this note value" }, XM = ["value"], JM = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, ZM = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, QM = { class: "report" }, eA = { key: 0 }, tA = ["disabled"], nA = /* @__PURE__ */ Qt({
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
  setup(n, { emit: e }) {
    const t = n, i = e, s = /* @__PURE__ */ G(!1), o = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(OM(t.view)), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(t.keepsGuide), h = N(() => l.value.filter((b) => b.notes > 0)), f = N(() => l.value.filter((b) => b.notes === 0)), d = N(
      () => r.value ? IM(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let g = 0;
    async function v(b) {
      const O = ++g;
      s.value = !0, o.value = null;
      try {
        const L = await ty(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: b ? DM(l.value) : void 0
        });
        if (O !== g) return;
        r.value = L, b || (l.value = $M(L.tracks));
      } catch (L) {
        O === g && (o.value = Xs(L));
      } finally {
        O === g && (s.value = !1);
      }
    }
    function m() {
      v(!0);
    }
    return dr(() => {
      v(!1);
    }), (b, O) => (w(), M("div", {
      class: "plenio-overlay",
      onMousedown: O[9] || (O[9] = ft((L) => i("close"), ["self"]))
    }, [
      p("div", NM, [
        p("header", null, [
          O[10] || (O[10] = p("h2", null, "Import MIDI", -1)),
          p("span", VM, F(n.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: O[0] || (O[0] = (L) => i("close"))
          }, "×")
        ]),
        p("div", HM, [
          s.value ? (w(), M("p", FM, "Reading the file…")) : ee("", !0),
          o.value ? (w(), M("p", zM, F(o.value), 1)) : ee("", !0),
          r.value && !o.value ? (w(), M(me, { key: 2 }, [
            p("table", WM, [
              O[11] || (O[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), M(me, null, Be(h.value, (L) => (w(), M("tr", {
                  key: L.index
                }, [
                  p("td", null, [
                    p("span", KM, F(L.number), 1),
                    ye(" " + F(V(BM)(L)), 1)
                  ]),
                  p("td", null, [
                    ze(p("select", {
                      "onUpdate:modelValue": (E) => L.role = E,
                      "aria-label": `Role of track ${L.number}`,
                      onChange: O[1] || (O[1] = (E) => m())
                    }, [
                      (w(!0), M(me, null, Be(V(TM), (E) => (w(), M("option", {
                        key: E.value,
                        value: E.value,
                        title: E.title
                      }, F(E.label), 9, jM))), 128))
                    ], 40, UM), [
                      [Xi, L.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            f.value.length ? (w(), M("p", GM, " Empty track(s) not shown: " + F(f.value.map((L) => L.number).join(", ")) + ". ", 1)) : ee("", !0),
            p("p", qM, [
              p("label", YM, [
                O[12] || (O[12] = ye(" grid ", -1)),
                ze(p("select", {
                  "onUpdate:modelValue": O[2] || (O[2] = (L) => a.value = L),
                  "aria-label": "Import grid",
                  onChange: O[3] || (O[3] = (L) => m())
                }, [
                  (w(!0), M(me, null, Be(V(hc), (L) => (w(), M("option", {
                    key: L,
                    value: L
                  }, "1/" + F(L), 9, XM))), 128))
                ], 544), [
                  [
                    Xi,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", JM, [
                ze(p("input", {
                  "onUpdate:modelValue": O[4] || (O[4] = (L) => u.value = L),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: O[5] || (O[5] = (L) => m())
                }, null, 544), [
                  [un, u.value]
                ]),
                O[13] || (O[13] = ye(" read chords from the notes ", -1))
              ]),
              n.keepsGuide && r.value.guide.length ? (w(), M("label", ZM, [
                ze(p("input", {
                  "onUpdate:modelValue": O[6] || (O[6] = (L) => c.value = L),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [un, c.value]
                ]),
                O[14] || (O[14] = ye(" keep the Guide notes ", -1))
              ])) : ee("", !0)
            ]),
            O[15] || (O[15] = p("h3", null, "What the import did", -1)),
            p("ul", QM, [
              (w(!0), M(me, null, Be(d.value, (L, E) => (w(), M("li", { key: E }, F(L), 1))), 128)),
              d.value.length ? ee("", !0) : (w(), M("li", eA, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : ee("", !0)
        ]),
        p("footer", null, [
          O[16] || (O[16] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            onClick: O[7] || (O[7] = (L) => i("close"))
          }, "Cancel"),
          p("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: O[8] || (O[8] = (L) => r.value && i("insert", r.value, c.value))
          }, " Insert ", 8, tA)
        ])
      ])
    ], 32));
  }
}), iA = {
  key: 0,
  class: "stale-note",
  role: "status"
}, sA = {
  key: 1,
  class: "error"
}, oA = /* @__PURE__ */ Qt({
  __name: "NotationView",
  props: {
    view: {},
    stale: { type: Boolean },
    selection: {},
    playing: {},
    zoom: {}
  },
  emits: ["select"],
  setup(n, { expose: e, emit: t }) {
    const i = n, s = t, o = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(null);
    let l = /* @__PURE__ */ new Map(), a = {
      "plenio-selected": [],
      "plenio-playing": []
    }, u = !1, c = null, h = 0;
    function f(O) {
      const L = /* @__PURE__ */ new Map(), E = O.lines ?? [];
      for (const B of E)
        for (const z of B.staff ?? [])
          for (const P of z.voices ?? [])
            for (const Y of P)
              Y.el_type === "note" && typeof Y.endChar == "number" && Y.abselem?.elemset && L.set(Y.endChar, Y.abselem.elemset);
      return L;
    }
    function d(O) {
      const L = xs(i.view, O);
      return L ? l.get(L.display[1]) ?? [] : [];
    }
    function g(O, L) {
      for (const E of a[O]) E.classList.remove(O);
      a[O] = L.flatMap(d);
      for (const E of a[O]) E.classList.add(O);
    }
    function v() {
      const O = o.value;
      if (!O) return;
      const L = i.view?.display_abc;
      if (!L) {
        O.innerHTML = "", l = /* @__PURE__ */ new Map();
        return;
      }
      try {
        const E = getComputedStyle(O).color || "#dddddd";
        h = O.clientWidth;
        const B = Ny.renderAbc(O, L, {
          add_classes: !0,
          responsive: "resize",
          scale: i.zoom,
          foregroundColor: E,
          selectionColor: E,
          staffwidth: Math.max(480, Math.floor(O.clientWidth / i.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (z) => {
            const P = z;
            if (!i.view || typeof P.startChar != "number" || typeof P.endChar != "number") return;
            const Y = x1(i.view, P.startChar, P.endChar);
            Y && s("select", Y.id, u);
          }
        });
        l = f(B[0]), a = { "plenio-selected": [], "plenio-playing": [] }, g("plenio-selected", i.selection), g("plenio-playing", i.playing), r.value = null;
      } catch (E) {
        r.value = `The notation could not be drawn: ${E instanceof Error ? E.message : String(E)}`;
      }
    }
    function m(O) {
      const [L] = d(O), E = o.value?.parentElement;
      if (!L || !E) return;
      const B = E.getBoundingClientRect(), z = L.getBoundingClientRect();
      z.top < B.top ? E.scrollTop += z.top - B.top - 8 : z.bottom > B.bottom && (E.scrollTop += z.bottom - B.bottom + 8), z.left < B.left ? E.scrollLeft += z.left - B.left - 8 : z.right > B.right && (E.scrollLeft += z.right - B.right + 8);
    }
    e({ reveal: m }), Ge(() => [i.view?.display_abc, i.zoom], () => Bn(v)), Ge(
      () => i.selection,
      (O) => {
        g("plenio-selected", O), O[0] && m(O[0]);
      }
    ), Ge(
      () => i.playing,
      (O) => {
        g("plenio-playing", O), O[0] && m(O[0]);
      }
    ), dr(() => {
      v(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - h) > 40 && v();
      }), o.value && c.observe(o.value);
    }), $i(() => c?.disconnect());
    function b(O) {
      u = O.shiftKey || O.ctrlKey || O.metaKey;
    }
    return (O, L) => (w(), M("div", {
      class: qe(["notation-wrap", { stale: n.stale }])
    }, [
      n.stale ? (w(), M("p", iA, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : ee("", !0),
      r.value ? (w(), M("p", sA, F(r.value), 1)) : ee("", !0),
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
function Ko(n, e) {
  let t = 1;
  for (const i of n.measures) {
    if (i.onset > e) break;
    t = i.n;
  }
  return t;
}
function Bd(n, e) {
  return n.measures[Math.max(0, Math.min(n.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Id(n, e, t) {
  const i = e > 0 ? Math.round(n / e) * e : Math.round(n);
  return Math.max(0, Math.min(t, i));
}
function oh(n, e) {
  const t = n.model;
  if (!t) return 0;
  const i = Ko(t, e), s = t.measures[i - 1], o = n.bars[i - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function rh(n, e) {
  const t = n.model;
  if (!t || !n.bars.length || !t.measures.length) return null;
  let i = 0;
  for (let l = 0; l < n.bars.length && !(n.bars[l].start_s > e + el); l++)
    i = l;
  const s = n.bars[i], o = t.measures[Math.min(i, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function Ev(n, e) {
  const t = Ko(n, e), i = n.measures[t - 1];
  if (!i) return "1.1.1";
  const s = Number(i.meter.split("/")[0]) || 1, o = i.length / s, r = Math.max(0, e - i.onset), l = Math.min(s - 1, Math.floor(r / o)), a = n.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const rA = 0.25, lA = 30, au = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, uu = 6e-3;
class aA {
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
  sounds = ny();
  onTick = null;
  onEnd = null;
  length = 0;
  get playing() {
    return this.timer !== null;
  }
  play(e, t = {}) {
    this.stop();
    const i = window.AudioContext ?? window.webkitAudioContext;
    if (!i) throw new Error("This browser cannot play audio (no Web Audio).");
    this.context ??= new i(), this.context.resume();
    const s = this.context;
    this.master = s.createGain(), this.master.gain.value = 0.8, this.master.connect(s.destination), this.levels = t.levels ?? { tones: 1, source: 1 }, this.sounds = t.sounds ?? this.sounds, this.tones = s.createGain(), this.tones.gain.value = this.levels.tones, this.tones.connect(this.master), this.events = e, this.length = e.reduce((r, l) => Math.max(r, l.at + l.duration), t.length ?? 0), this.next = 0, this.startedAt = s.currentTime + 0.05;
    const o = t.source;
    if (o?.segments.length) {
      this.sourceGain = s.createGain(), this.sourceGain.gain.value = this.levels.source, this.sourceGain.connect(this.master);
      for (const r of o.segments) this.playSegment(o.buffer, r);
      this.length = Math.max(this.length, ...o.segments.map((r) => r.at + r.duration));
    }
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), lA), this.tick();
  }
  /**
   * Seconds since playback started of a moment given in ``performance.now()`` milliseconds (a key of
   * a MIDI keyboard), as the listener heard it: the audio output's latency is taken out, so a key
   * played with a note one hears lands on that note.
   */
  elapsedAt(e) {
    const t = this.context;
    if (!t) return 0;
    const i = typeof t.getOutputTimestamp == "function" ? t.getOutputTimestamp() : null;
    if (i && typeof i.contextTime == "number" && typeof i.performanceTime == "number" && i.performanceTime > 0)
      return i.contextTime + (e - i.performanceTime) / 1e3 - this.startedAt;
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
    for (; this.next < this.events.length && this.events[this.next].at < t + rA; )
      this.sound(this.events[this.next]), this.next++;
    this.onTick?.(Math.max(0, t)), t > this.length + 0.1 && (this.stop(), this.onEnd?.());
  }
  sound(e) {
    const t = this.context;
    if (!t || !this.master) return;
    const i = this.startedAt + e.at, s = i + Math.max(0.05, e.duration), o = this.tones ?? this.master;
    if (e.part !== "click") {
      let u;
      try {
        u = pl(t, o, this.sounds[e.part], e.midi, i, { level: au[e.part] });
      } catch {
        try {
          u = pl(t, o, "plain", e.midi, i, { level: au[e.part] });
        } catch {
          return;
        }
      }
      u.release(s);
      const c = t.currentTime;
      this.voices = this.voices.filter((h) => h.end > c), this.voices.push({ voice: u, end: s + 2 });
      return;
    }
    const r = t.createOscillator();
    r.type = "square", r.frequency.value = iy(e.midi);
    const l = t.createGain(), a = au.click;
    l.gain.setValueAtTime(0, i), l.gain.linearRampToValueAtTime(a, i + 2e-3), l.gain.setValueAtTime(a * 0.8, Math.max(i + 3e-3, s - 0.04)), l.gain.linearRampToValueAtTime(0, s), r.connect(l).connect(o), r.start(i), r.stop(s + 0.02), r.onended = () => {
      this.clicks = this.clicks.filter((u) => u !== r), l.disconnect();
    }, this.clicks.push(r);
  }
  playSegment(e, t) {
    const i = this.context;
    if (!i || !this.sourceGain || t.duration <= 0) return;
    const s = i.createBufferSource();
    s.buffer = e;
    const o = i.createGain(), r = this.startedAt + t.at, l = r + t.duration;
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + uu), o.gain.setValueAtTime(1, Math.max(r + uu, l - uu)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class uA {
  context = null;
  tones = /* @__PURE__ */ new Map();
  /** The sound of the keys: the recorded track's. */
  sound = "soft";
  on(e, t = 100) {
    const i = window.AudioContext ?? window.webkitAudioContext;
    if (i)
      try {
        this.context ??= new i();
        const s = this.context;
        s.resume(), this.off(e), this.tones.set(e, pl(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
      } catch {
      }
  }
  off(e) {
    const t = this.tones.get(e), i = this.context;
    !t || !i || (this.tones.delete(e), t.release(i.currentTime));
  }
  allOff() {
    for (const e of [...this.tones.keys()]) this.off(e);
  }
  close() {
    for (const e of this.tones.values()) e.stop();
    this.tones.clear(), this.context?.close(), this.context = null;
  }
}
let Rd = null;
function fc(n, e = 0.35, t = "soft") {
  const i = window.AudioContext ?? window.webkitAudioContext;
  if (i)
    try {
      Rd ??= new i();
      const s = Rd;
      s.resume();
      const o = s.currentTime + 0.01;
      pl(s, s.destination, t, n, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const cA = 200, Bs = /* @__PURE__ */ new Map(), hA = 2;
function fA(n, e) {
  if (n.numberOfChannels === 1) return n;
  const t = new e(1, 1, n.sampleRate).createBuffer(1, n.length, n.sampleRate), i = t.getChannelData(0);
  for (let s = 0; s < n.numberOfChannels; s++) {
    const o = n.getChannelData(s);
    for (let r = 0; r < o.length; r++) i[r] += o[r] / n.numberOfChannels;
  }
  return t;
}
function dA(n, e, t = cA) {
  const i = Math.max(1, Math.round(e / t)), s = Math.ceil(n.length / i), o = new Float32Array(s), r = new Float32Array(s);
  for (let l = 0; l < s; l++) {
    let a = 0, u = 0;
    const c = Math.min(n.length, (l + 1) * i);
    for (let h = l * i; h < c; h++) {
      const f = n[h];
      f < a && (a = f), f > u && (u = f);
    }
    o[l] = a, r[l] = u;
  }
  return { rate: e / i, min: o, max: r, duration: n.length / e };
}
function pA(n, e = gA) {
  let t = Bs.get(n);
  if (!t) {
    for (t = (async () => {
      const i = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!i) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(n), o = await new i(1, 1, 48e3).decodeAudioData(s), r = fA(o, i);
      return { buffer: r, envelope: dA(r.getChannelData(0), r.sampleRate) };
    })(), Bs.set(n, t); Bs.size > hA; ) Bs.delete(Bs.keys().next().value);
    t.catch(() => Bs.delete(n));
  }
  return t;
}
async function gA(n) {
  const e = await fetch(n);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function mA(n, e, t, i) {
  const s = [];
  if (i <= 0 || t <= e) return s;
  const o = (t - e) / i;
  for (let r = 0; r < i; r++) {
    const l = Math.max(0, Math.floor((e + r * o) * n.rate)), a = Math.min(n.min.length, Math.max(l + 1, Math.ceil((e + (r + 1) * o) * n.rate)));
    let u = 0, c = 0;
    for (let h = l; h < a; h++)
      n.min[h] < u && (u = n.min[h]), n.max[h] > c && (c = n.max[h]);
    s.push([u, c]);
  }
  return s;
}
function vA(n) {
  return !n || "problem" in n || !Array.isArray(n.midi) || !(n.rate > 0) ? null : { rate: n.rate, start: n.start ?? 0, midi: n.midi };
}
function yA(n, e) {
  const t = Math.round((e - n.start) * n.rate);
  return t >= 0 && t < n.midi.length ? n.midi[t] : null;
}
function bA(n, e, t) {
  let i = 0;
  for (let r = 0; r < n.measures.length; r++) n.measures[r].onset <= t && (i = r);
  const s = n.measures[i], o = e?.[i];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function xA(n, e, t) {
  const i = [];
  for (const s of n.tracks.vocal) {
    const o = bA(n, e, s.onset + s.duration / 2), r = o === null ? null : yA(t, o);
    r !== null && i.push(s.pitch - r);
  }
  return i.length < 6 ? 0 : (i.sort((s, o) => s - o), 12 * Math.round(i[Math.floor(i.length / 2)] / 12));
}
function wA(n, e, t, i, s, o = 0) {
  const r = [];
  let l = [], a = null;
  const u = 1 / t.rate;
  for (let c = Math.max(0, i); c <= Math.min(s, n.measures.length - 1); c++) {
    const h = n.measures[c], f = e?.[c];
    if (!f || f[1] <= f[0]) {
      l.length > 1 && r.push(l), l = [], a = null;
      continue;
    }
    const d = Math.ceil((f[0] - t.start) * t.rate), g = Math.floor((f[1] - t.start) * t.rate - 1e-9);
    for (let v = d; v <= g; v++) {
      const m = v >= 0 && v < t.midi.length ? t.midi[v] : null, b = t.start + v * u;
      (m === null || a !== null && Math.abs(b - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = b, m !== null && l.push([h.onset + (b - f[0]) / (f[1] - f[0]) * h.length, m + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const kA = ["aria-label"], SA = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, CA = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, MA = ["aria-pressed"], AA = ["aria-pressed"], TA = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, $A = ["aria-pressed"], DA = ["aria-pressed"], OA = { title: "Grid for drawing, moving and resizing" }, LA = { value: "auto" }, EA = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, BA = ["disabled"], IA = ["disabled"], RA = ["disabled", "title"], PA = ["disabled", "title"], _A = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, NA = ["disabled", "title"], VA = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, HA = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, FA = ["title"], zA = ["disabled"], WA = { title: "The roll pages along with the playback line" }, KA = { class: "hint" }, UA = {
  key: 0,
  class: "roll-note"
}, jA = ["width", "height"], GA = ["y", "width", "height"], qA = ["x1", "x2", "y1", "y2"], YA = ["x", "y"], XA = ["x", "y"], JA = ["d"], ZA = ["x1", "x2", "y1", "y2"], QA = ["x1", "x2", "y1", "y2"], eT = ["transform"], tT = ["y", "width", "height"], nT = ["y"], iT = ["transform"], sT = ["width", "height"], oT = ["x", "width", "height"], rT = ["y", "width", "height"], lT = ["y", "width", "height"], aT = ["x", "y", "width", "height"], uT = ["d"], cT = ["x", "y"], hT = ["y", "width", "height"], fT = ["x", "y", "width", "height"], dT = ["x", "y", "height"], pT = ["x", "y"], gT = ["x1", "x2", "y2"], mT = ["x"], vT = ["x"], yT = ["x", "y", "width", "height"], bT = ["x", "y"], xT = {
  key: 2,
  class: "chord ghost"
}, wT = ["x", "y", "width", "height"], kT = ["x", "y"], ST = ["x", "y", "width", "height"], CT = ["x1", "x2", "y2"], MT = ["transform"], AT = ["y2"], TT = ["onKeydown"], $T = ["onKeydown"], So = 5, Pd = 6.2, DT = 26, OT = /* @__PURE__ */ Qt({
  __name: "PianoRoll",
  props: /* @__PURE__ */ $n({
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
  emits: /* @__PURE__ */ $n(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = t, o = It(n, "lyricSelection"), r = It(n, "zoom"), l = It(n, "audition"), a = It(n, "rowHeight"), u = It(n, "follow"), c = It(n, "sungVisible"), h = It(n, "waveVisible"), f = N(() => !!i.source && h.value), d = /* @__PURE__ */ G(null), g = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), b = It(n, "track"), O = /* @__PURE__ */ G("draw"), L = /* @__PURE__ */ G("auto"), E = /* @__PURE__ */ G(null), B = /* @__PURE__ */ G(null), z = /* @__PURE__ */ G(!1), P = /* @__PURE__ */ G(0), Y = /* @__PURE__ */ G(0), K = /* @__PURE__ */ G(0), re = /* @__PURE__ */ G(0);
    let j = !1;
    const D = /* @__PURE__ */ G(null), U = /* @__PURE__ */ G(null), ke = /* @__PURE__ */ G(null);
    let $e = !1;
    const ce = /* @__PURE__ */ G(null);
    let pe = null, He = null;
    const Oe = N(() => i.view?.model ?? null), Re = N(() => Oe.value ? sh(Oe.value) : []), Le = N(() => Oe.value?.tracks.chords ?? []), J = N(
      () => Oe.value ? EC(Oe.value, {
        pxPerQuarter: r.value,
        snap: L.value,
        lyrics: !!i.lyrics,
        source: f.value,
        rowHeight: a.value
      }) : null
    ), ct = /* @__PURE__ */ G(null);
    function be(k) {
      l.value && fc(k, 0.35, i.sound);
    }
    const Ie = N(() => !i.readonly && !i.stale && !i.busy && !z.value), se = N(() => uo(i.view, i.selection)), Z = N(() => ur(i.selection)), ne = N(() => uo(i.view, i.playing)), Xe = N(() => jC(E.value)), ht = N(() => UC(E.value)), vt = N(() => {
      const k = J.value, A = B.value;
      if (!k || !A) return null;
      const T = Tv(A, k, Y.value, P.value), Q = new Set(A.keep);
      for (const Ee of _C(Re.value, T, k)) Q.add(Ee.id);
      const q = new Set(A.keepChords);
      for (const Ee of NC(Le.value, A, k, Y.value, P.value)) q.add(Ee.id);
      const ve = PC(A, Y.value);
      return { rect: T, ids: Q, chords: q, lane: ve };
    }), S = N(
      () => O.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), x = N(
      () => i.lyrics && i.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), $ = N(() => Oe.value && i.locator !== null ? Ev(Oe.value, i.locator) : "");
    function I(k, A, T) {
      const Q = ce.value;
      return !Q || !Q.delta ? [A, T] : Q.kind === "move" && Q.keys.includes(k) ? [A + Q.delta, T + Q.delta] : Q.key !== k ? [A, T] : Q.kind === "start" ? [Math.min(A + Q.delta, T - 1), T] : Q.kind === "end" ? [A, Math.max(T + Q.delta, A + 1)] : [A, T];
    }
    function _(k) {
      const A = ce.value;
      return A?.delta ? A.kind === "move" ? A.keys.includes(k) : A.key === k : !1;
    }
    const H = N(() => {
      const k = J.value, A = i.lyrics;
      if (!k || !A) return [];
      const T = A.sections.flatMap(
        (q) => q.lines.filter((ve) => ve.text).map((ve) => {
          const Ee = ml(q.section, ve.line), [je, ot] = I(Ee, ve.start, ve.end);
          return { ...ve, start: je, end: ot, section: q.section, key: Ee };
        })
      ).sort((q, ve) => q.start - ve.start || q.line - ve.line), Q = new Set(o.value);
      return T.map((q, ve) => {
        const Ee = rt(q.start, k), je = T.slice(ve + 1).find((Ne) => Ne.start > q.start), ot = je ? rt(je.start, k) - Ee - 2 : 640, Pe = Math.max(16, rt(q.end, k) - Ee), it = Math.max(1, Math.floor((Math.max(Pe, Math.min(ot, q.text.length * Pd + 8)) - 8) / Pd)), $t = q.text.length > it ? `${q.text.slice(0, Math.max(1, it - 1))}…` : q.text;
        return { ...q, x: Ee, width: Pe, shown: $t, selected: Q.has(q.key), dragged: _(q.key) };
      }).filter((q) => et(q.start, Math.max(q.end, q.start + 64)));
    });
    function he(k) {
      const A = H.value.filter((q) => k >= q.x - So && k <= q.x + q.width + So), T = A.find((q) => k >= q.x && k <= q.x + q.width) ?? A[0];
      if (!T) return null;
      const Q = k >= T.x + T.width - So ? "end" : k <= T.x + So && T.width > 3 * So ? "start" : "move";
      return { key: T.key, start: T.start, end: T.end, part: Q };
    }
    function ie(k) {
      const A = [];
      for (const T of i.lyrics?.sections.flatMap((Q) => Q.lines.map((q) => ({ ...q, key: ml(Q.section, q.line) }))) ?? []) {
        if (!(k.kind === "move" ? k.keys.includes(T.key) : T.key === k.key)) continue;
        const q = Math.max(T.end, T.start + 1);
        let ve = [T.start, q];
        k.kind === "move" ? ve = [T.start + k.delta, q + k.delta] : k.kind === "start" ? ve = [Math.min(T.start + k.delta, q - 1), q] : ve = [T.start, Math.max(q + k.delta, T.start + 1)], A.push({ key: T.key, start: Math.max(0, ve[0]), end: Math.max(1, ve[1]) });
      }
      return A;
    }
    const oe = N(() => {
      const k = /* @__PURE__ */ new Map();
      for (const A of i.lyrics?.sections ?? [])
        for (const T of A.lines) for (const Q of T.syllables) k.set(Q.onset, Q.end_of_word ? Q.text : `${Q.text}-`);
      return k;
    }), X = N(() => {
      const k = J.value;
      return k ? pt.value.map((A) => ({ n: A, rect: Fi(A, k) })).filter(({ rect: A }) => A.width >= DT).map(({ n: A, rect: T }) => ({ key: A.id, x: T.x + 2, y: T.y + T.height - 2.5, text: cc(A.pitch) })) : [];
    }), Ae = N(() => {
      const k = J.value;
      return !k || !oe.value.size ? [] : pt.value.filter((A) => A.track === "vocal" && oe.value.has(A.onset)).map((A) => {
        const T = Fi(A, k);
        return { key: A.id, x: T.x + 1, y: T.y - 2, text: oe.value.get(A.onset) };
      });
    });
    function fe(k) {
      const A = Oe.value, T = i.lyrics;
      if (!A || !T) return null;
      for (const Q of T.sections) {
        const q = A.sections[Q.section];
        if (!q) continue;
        const ve = A.measures[q.first_bar - 1]?.onset ?? 0, Ee = A.measures[q.first_bar - 1 + q.bars]?.onset ?? A.total;
        if (k < ve || k >= Ee || Q.block === null) continue;
        const je = Q.lines.length ? Math.max(...Q.lines.map((Ne) => Ne.line)) + 1 : 0, ot = Q.lines.find((Ne) => Ne.text && k >= Ne.start && k < Math.max(Ne.end, Ne.start + 1)), Pe = (Ne) => ({
          section: Q.section,
          block: Q.block,
          line: Ne.line,
          text: Ne.text,
          original: Ne.text,
          start: Ne.start
        });
        if (ot) return Pe(ot);
        const it = Q.phrases.find(([Ne, yt]) => k >= Ne && k < yt);
        if (it && !Q.lines.some((Ne) => Ne.syllables.length && Ne.start < it[1] && Ne.end > it[0]))
          return Pe({ line: je, text: "", start: it[0] });
        const $t = [...Q.lines].reverse().find((Ne) => Ne.text && Ne.start <= k);
        return Pe($t ?? { line: je, text: "", start: ve });
      }
      return null;
    }
    function Ce(k) {
      const A = fe(k);
      A && ($e = !1, ke.value = A, Bn(() => {
        U.value?.focus(), U.value?.select();
      }));
    }
    function Te() {
      const k = ke.value;
      if (ke.value = null, !k || $e) {
        $e = !1;
        return;
      }
      d.value?.focus({ preventScroll: !0 }), k.text.trim() !== k.original.trim() && s("lyricEdit", { section: k.section, block: k.block, line: k.line, text: k.text.trim(), at: k.start });
    }
    function Fe() {
      $e = !0, ke.value = null, d.value?.focus({ preventScroll: !0 });
    }
    const We = N(() => Oe.value ? `1/${Math.round(ya(Oe.value) / (J.value?.snap ?? 1))}` : ""), Ke = N(() => {
      const k = J.value;
      if (!k) return [0, 0];
      const A = K.value || 1e5;
      return [Qn(P.value - 200, k), Qn(P.value + A + 200, k)];
    }), et = (k, A) => A >= Ke.value[0] && k <= Ke.value[1], pt = N(() => Re.value.filter((k) => et(k.onset, k.onset + k.duration))), Pt = N(
      () => Le.value.map((k, A) => ({ chord: k, next: Le.value[A + 1] })).filter(({ chord: k }) => et(k.onset, k.onset + 64))
    ), st = N(() => Oe.value ? RC(Oe.value).filter((k) => et(k.unit, k.unit)) : []), mn = N(() => {
      const k = J.value;
      return k ? Array.from({ length: k.high - k.low + 1 }, (A, T) => k.high - T) : [];
    }), Un = N(() => {
      const k = Oe.value;
      return k ? k.sections.filter((A) => !A.implicit).map((A) => ({ label: A.label, unit: k.measures[A.first_bar - 1]?.onset ?? 0 })).filter((A) => et(A.unit, A.unit + 64)) : [];
    });
    function Ot(k) {
      const A = v.value?.getBoundingClientRect();
      return [k.clientX - (A?.left ?? 0), k.clientY - (A?.top ?? 0)];
    }
    function _t(k) {
      return {
        note: !0,
        [k.track]: !0,
        selected: (vt.value?.ids ?? se.value).has(k.id),
        playing: ne.value.has(k.id),
        dragged: Xe.value.has(k.id)
      };
    }
    function vn(k) {
      const A = k.track === "vocal" ? "Vocal" : "Ins";
      let T = 1;
      for (const Q of Oe.value?.measures ?? []) Q.onset <= k.onset && (T = Q.n);
      return `${A} bar ${T}: ${k.name}, ${k.duration} units`;
    }
    function Mt(k) {
      s("select", k);
    }
    function is(k) {
      const A = J.value;
      if (!A || k.button !== 0) return;
      d.value?.focus({ preventScroll: !0 });
      const [T, Q] = Ot(k), q = $d(T, Q, Re.value, Le.value, A, b.value, Y.value, P.value);
      if (q.area === "keys") {
        l.value && fc(q.pitch, 0.35, i.sound);
        return;
      }
      if (q.area === "header" || q.area === "source") {
        s("locate", Id(q.unit, A.snap, A.total)), pe = { x: T, y: Q, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, Ln(k);
        return;
      }
      const ve = k.shiftKey || k.ctrlKey || k.metaKey;
      if (q.area === "lyrics") {
        const Pe = he(T);
        if (!Pe) {
          ve || (o.value = []);
          return;
        }
        i.selection.length && Mt([]);
        const it = o.value, $t = it.includes(Pe.key), Ne = ve ? $t ? it.filter((yt) => yt !== Pe.key) : [...it, Pe.key] : $t ? it : [Pe.key];
        if (Ne !== it && (o.value = Ne), i.lyricsEditable && (Ne.includes(Pe.key) || Pe.part !== "move")) {
          const yt = Pe.part === "move" ? [...Ne] : [Pe.key];
          pe = { x: T, y: Q, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Pe.part, key: Pe.key, keys: yt, origin: Qn(T, A), delta: 0 } }, Ln(k);
        }
        return;
      }
      o.value.length && !ve && (o.value = []);
      let Ee = null, je = !1, ot = null;
      if (q.area === "note") {
        const Pe = se.value.has(q.note.id);
        let it;
        if (ve) {
          const $t = new Set(se.value);
          Pe ? $t.delete(q.note.id) : $t.add(q.note.id), it = Re.value.filter((Ne) => $t.has(Ne.id)), Mt(Jr(it, Le.value.filter((Ne) => Z.value.has(Ne.id))));
        } else Pe ? it = Re.value.filter(($t) => se.value.has($t.id)) : (it = [q.note], Mt(Jr(it)));
        Ie.value && it.some(($t) => $t.id === q.note.id) && (Ee = q.edge === "end" && it.length === 1 ? HC(q.note, Re.value, A.total) : VC(it, q.note, Qn(T, A), Nl(Q, A))), be(q.note.pitch);
      } else if (q.area === "chord") {
        if (ve) {
          const Pe = new Set(Z.value);
          Pe.has(q.chord.id) ? Pe.delete(q.chord.id) : Pe.add(q.chord.id), Mt([...i.selection.filter((it) => !it.startsWith("chord:")), ...Pe]);
        } else Z.value.has(q.chord.id) || Mt([q.chord.id]);
        Ie.value && (Ee = zC(q.chord, Qn(T, A)));
      } else if ((q.area === "grid" || q.area === "lane") && (O.value === "select" || k.shiftKey))
        ot = ve ? { notes: [...se.value], chords: Le.value.filter((Pe) => Z.value.has(Pe.id)) } : { notes: [], chords: [] }, je = !ve;
      else if (q.area === "grid") {
        const Pe = !i.selection.length && !o.value.length;
        Ie.value && !ve && (Ee = FC(b.value, q.unit, q.pitch, A), be(q.pitch)), je = !ve, pe = { x: T, y: Q, start: Ee, started: !1, clear: je, keep: ot, insert: Ie.value && !ve && Pe }, Ln(k);
        return;
      } else
        je = !ve;
      pe = { x: T, y: Q, start: Ee, started: !1, clear: je, keep: ot, from: { scrollTop: Y.value, scrollLeft: P.value } }, Ln(k);
    }
    function Ln(k) {
      try {
        v.value?.setPointerCapture?.(k.pointerId);
      } catch {
      }
    }
    function ss(k) {
      const A = g.value, T = J.value;
      if (!A || !T) return;
      const Q = A.getBoundingClientRect();
      if (!Q.height) return;
      const q = T.rowHeight;
      if (k.clientY < Q.top + T.top + 12) A.scrollTop = Math.max(0, A.scrollTop - q);
      else if (k.clientY > Q.bottom - 16) A.scrollTop = A.scrollTop + q;
      else return;
      tn();
    }
    function Ds(k) {
      const A = J.value;
      if (!pe || !pe.start && !pe.keep && !pe.ruler && !pe.lyric || !A) return;
      const [T, Q] = Ot(k);
      if (pe.ruler) {
        s("locate", Id(Qn(T, A), A.snap, A.total));
        return;
      }
      if (pe.lyric) {
        if (!pe.started && Math.abs(T - pe.x) < Ad) return;
        pe.started = !0;
        const q = Math.round((Qn(T, A) - pe.lyric.origin) / A.snap) * A.snap;
        ce.value = { ...pe.lyric, delta: q };
        return;
      }
      if (pe.started && ss(k), !(!pe.started && Math.hypot(T - pe.x, Q - pe.y) < Ad)) {
        if (pe.started = !0, pe.keep)
          B.value = {
            x0: pe.x,
            y0: pe.y,
            x1: T,
            y1: Q,
            from: pe.from,
            keep: pe.keep.notes,
            keepChords: pe.keep.chords.map((q) => q.id)
          };
        else if (pe.start) {
          const q = E.value, ve = WC(pe.start, Qn(T, A), Nl(Q, A), A, { alt: k.altKey });
          ve.kind === "move" && ve.semitones !== (q?.kind === "move" ? q.semitones : 0) && be(ve.anchor.pitch + ve.semitones), E.value = ve;
        }
      }
    }
    async function Ft(k) {
      z.value = !0;
      try {
        await i.operate(k);
      } finally {
        z.value = !1, E.value = null;
      }
    }
    function Li() {
      const k = pe;
      if (pe = null, !k || k.ruler) return;
      if (k.lyric) {
        const Q = ce.value;
        ce.value = null, k.started && Q?.delta && s("lyricPlace", ie(Q));
        return;
      }
      if (!k.started) {
        if (E.value = null, k.insert && k.start?.kind === "draw" && J.value) {
          const Q = J.value, q = Math.min(ct.value ?? Q.drawLength, Q.total - k.start.start);
          Ft({ op: "insert_note", track: k.start.track, onset: k.start.start, duration: q, pitch: k.start.pitch });
          return;
        }
        k.clear && Mt([]);
        return;
      }
      if (k.keep) {
        const Q = vt.value?.ids ?? /* @__PURE__ */ new Set(), q = vt.value?.chords ?? new Set(k.keep.chords.map((ve) => ve.id));
        B.value = null, Mt(Jr(Re.value.filter((ve) => Q.has(ve.id)), Le.value.filter((ve) => q.has(ve.id))));
        return;
      }
      const A = E.value, T = A ? KC(A, i.resizeMode) : null;
      if (!T) {
        E.value = null;
        return;
      }
      A?.kind === "draw" ? ct.value = A.end - A.start : A?.kind === "resize" && (ct.value = A.end - A.note.onset), Ft(T);
    }
    function Ze() {
      pe = null, E.value = null, B.value = null, ce.value = null;
    }
    function jn(k) {
      const A = J.value;
      if (!A) return;
      const [T, Q] = Ot(k), q = $d(T, Q, Re.value, Le.value, A, b.value, Y.value, P.value);
      if (q.area === "lyrics") {
        i.lyricsEditable && Ce(q.unit);
        return;
      }
      if (Ie.value) {
        if (q.area === "grid") {
          if (O.value !== "draw") return;
          const ve = Math.min(uc(q.unit, A.snap), A.total - 1), Ee = Math.min(A.drawLength, A.total - ve);
          Ft({ op: "insert_note", track: b.value, onset: ve, duration: Ee, pitch: q.pitch });
        } else if (q.area === "lane" || q.area === "chord") {
          const ve = q.area === "chord" ? q.chord : null, Ee = q.area === "chord" ? q.chord.onset : Math.min(uc(q.unit, A.snap), A.total - 1);
          D.value = { onset: Ee, name: ve?.name ?? "", original: ve?.name ?? null }, Bn(() => {
            m.value?.focus(), m.value?.select();
          });
        }
      }
    }
    function fo() {
      const k = D.value;
      if (D.value = null, d.value?.focus({ preventScroll: !0 }), !k) return;
      const A = k.name.trim();
      if (A !== (k.original ?? "")) {
        if (!A) {
          k.original !== null && Ft({ op: "delete_chord", onset: k.onset });
          return;
        }
        Ft({ op: "put_chord", onset: k.onset, name: A });
      }
    }
    function os() {
      D.value = null, d.value?.focus({ preventScroll: !0 });
    }
    function di(k) {
      if (k.target?.closest("input, select, textarea")) return;
      const T = J.value;
      if (!T) return;
      if (o.value.length && !k.ctrlKey && !k.metaKey) {
        const je = k.key === "ArrowLeft" ? -T.snap : k.key === "ArrowRight" ? T.snap : 0;
        if (k.key === "Delete" || k.key === "Backspace" || je || k.key === "Escape") {
          if (k.preventDefault(), k.stopPropagation(), k.key === "Escape") o.value = [];
          else if (i.lyricsEditable) je ? s("lyricPlace", ie({ kind: "move", key: "", keys: [...o.value], delta: je })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (k.key === "Escape") {
        if (pe || E.value || B.value) Ze();
        else if (i.selection.length) Mt([]);
        else return;
        k.preventDefault(), k.stopPropagation();
        return;
      }
      const Q = k.key.toLowerCase();
      if ((Q === "g" || Q === "h") && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), k.shiftKey ? Me(Q === "h" ? 2 : -2) : le(Q === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (Q === "q" && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Gt(k.shiftKey);
        return;
      }
      if (k.key.toLowerCase() === "a" && (k.ctrlKey || k.metaKey) && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Mt(Jr(Re.value, Le.value));
        return;
      }
      const q = Re.value.filter((je) => se.value.has(je.id)), ve = Le.value.filter((je) => Z.value.has(je.id)), Ee = GC(
        k.key,
        { shift: k.shiftKey, alt: k.altKey },
        q,
        ve,
        T,
        i.resizeMode
      );
      Ee !== void 0 && (k.preventDefault(), k.stopPropagation(), Ee && Ie.value && Ft(Ee));
    }
    function tn() {
      P.value = g.value?.scrollLeft ?? 0, Y.value = g.value?.scrollTop ?? 0, K.value = g.value?.clientWidth ?? 0, re.value = g.value?.clientHeight ?? 0;
    }
    function yn() {
      const k = J.value, A = g.value;
      j || !k || !A || !A.clientHeight || (j = !0, A.scrollTop = Mv(k, A.clientHeight, k.focus[0], k.focus[1]), tn());
    }
    function W(k, A = !0) {
      const T = J.value, Q = g.value, q = Re.value.find((je) => k.has(je.id));
      if (!T || !Q || !q || !Q.clientWidth) return;
      const ve = rt(q.onset, T);
      A && (ve < Q.scrollLeft + wn || ve > Q.scrollLeft + Q.clientWidth - 40) && (Q.scrollLeft = Math.max(0, ve - Q.clientWidth / 3));
      const Ee = Q.clientHeight ? Td(T, Q.scrollTop, Q.clientHeight, q.pitch) : null;
      Ee !== null && (Q.scrollTop = Ee), tn();
    }
    function le(k, A) {
      const T = g.value, Q = J.value, q = Math.max(12, Math.min(240, Math.round(r.value * k)));
      if (q === r.value) return;
      if (!T || !Q) {
        r.value = q;
        return;
      }
      const ve = T.getBoundingClientRect(), Ee = i.locator !== null ? rt(i.locator, Q) - T.scrollLeft : null, je = A !== void 0 ? A - ve.left : Ee !== null && Ee >= wn && Ee <= T.clientWidth ? Ee : T.clientWidth / 2, ot = Qn(T.scrollLeft + je, Q);
      r.value = q, Bn(() => {
        const Pe = J.value;
        Pe && (T.scrollLeft = Math.max(0, rt(ot, Pe) - je), tn());
      });
    }
    function ae(k) {
      const A = k.deltaY || k.deltaX;
      if (k.altKey || (k.ctrlKey || k.metaKey) && k.shiftKey) {
        k.preventDefault(), Me(A < 0 ? 1 : -1, k.clientY);
        return;
      }
      !k.ctrlKey && !k.metaKey || (k.preventDefault(), le(A < 0 ? 1.15 : 1 / 1.15, k.clientX));
    }
    function Me(k, A) {
      const T = g.value, Q = J.value, q = Math.max(Sv, Math.min(Cv, a.value + k));
      if (q === a.value) return;
      if (!T || !Q) {
        a.value = q;
        return;
      }
      const ve = T.getBoundingClientRect(), Ee = A !== void 0 ? A - ve.top : T.clientHeight / 2, je = Q.high - (T.scrollTop + Ee - Q.top) / Q.rowHeight;
      a.value = q, Bn(() => {
        const ot = J.value;
        ot && (T.scrollTop = Math.max(0, ot.top + (ot.high - je) * ot.rowHeight - Ee), tn());
      });
    }
    function Gt(k) {
      const A = J.value;
      if (!A || !Ie.value) return;
      const T = se.value.size ? Re.value.filter((Q) => se.value.has(Q.id)) : Re.value;
      T.length && Ft({ op: "quantize", ids: T.map((Q) => Q.id), grid: A.snap, lengths: k });
    }
    const br = N(() => {
      const k = i.source?.envelope;
      if (!k) return 1;
      let A = 0;
      for (let T = 0; T < k.max.length; T++) A = Math.max(A, k.max[T], -k.min[T]);
      return A || 1;
    }), xr = N(() => {
      const k = J.value, A = Oe.value, T = i.sung;
      if (!k || !A || !T?.curve || !c.value) return [];
      const [Q, q] = Ke.value;
      let ve = 0, Ee = A.measures.length - 1;
      A.measures.forEach((ot, Pe) => {
        ot.onset + ot.length < Q && (ve = Pe + 1), ot.onset <= q && (Ee = Pe);
      });
      const je = (ot) => k.top + (k.high - ot) * k.rowHeight + k.rowHeight / 2;
      return wA(A, T.bars, T.curve, ve, Ee, T.offset).map((ot, Pe) => ({
        key: `c${ve}-${Pe}`,
        d: ot.map(([it, $t], Ne) => `${Ne ? "L" : "M"}${rt(it, k).toFixed(1)} ${je($t).toFixed(1)}`).join("")
      }));
    }), ba = N(() => {
      const k = i.sung?.offset ?? 0;
      if (!k) return "sung";
      const A = Math.abs(k / 12);
      return `sung ${k > 0 ? "+" : "−"}${A > 1 ? A : ""}8va`;
    }), Os = N(() => {
      const k = i.sung;
      if (!k) return "";
      if (k.problem) return `No sung pitch: ${k.problem}`;
      const A = k.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${A ? ` - drawn ${Math.abs(A / 12)} octave${Math.abs(A) > 12 ? "s" : ""} ${A > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), wr = N(() => {
      const k = J.value, A = Oe.value, T = i.source;
      if (!k || !A || !T || k.sourceTop === null) return [];
      const Q = k.sourceTop + Oo / 2, q = (Oo / 2 - 3) / br.value, ve = [];
      return A.measures.forEach((Ee, je) => {
        if (!et(Ee.onset, Ee.onset + Ee.length)) return;
        const ot = rt(Ee.onset, k), Pe = Ee.length * k.pxPerUnit, it = T.bars?.[je];
        if (!it) {
          ve.push({ key: `w${je}`, d: "", missing: !0, x: ot, width: Pe });
          return;
        }
        const $t = Math.max(1, Math.floor(Pe / 2)), Ne = [];
        mA(T.envelope, it[0], it[1], $t).forEach(([yt, Ei], go) => {
          const kr = (ot + (go + 0.5) * (Pe / $t)).toFixed(1);
          Ne.push(`M${kr} ${(Q - Ei * q - 0.5).toFixed(1)}V${(Q - yt * q + 0.5).toFixed(1)}`);
        }), ve.push({ key: `w${je}`, d: Ne.join(""), missing: !1, x: ot, width: Pe });
      }), ve;
    });
    function po(k) {
      const A = J.value, T = g.value;
      if (k === null || !A || !T || !T.clientWidth) return;
      const Q = rt(k, A);
      Q >= T.scrollLeft + wn && Q <= T.scrollLeft + T.clientWidth - 24 || (T.scrollLeft = Math.max(0, Q - wn - 24), tn());
    }
    return Ge(se, (k) => W(k)), Ge(ne, (k) => {
      i.recorded && i.playhead !== null || (u.value || i.playhead === null) && W(k, i.playhead === null);
    }), Ge(
      () => i.playhead,
      (k) => {
        u.value && po(k);
      }
    ), Ge(() => i.locator, po), Ge(
      () => i.recorded?.notes.at(-1)?.pitch,
      (k) => {
        const A = J.value, T = g.value;
        if (k === void 0 || !A || !T?.clientHeight) return;
        const Q = Td(A, T.scrollTop, T.clientHeight, k);
        Q !== null && (T.scrollTop = Q, tn());
      }
    ), Ge(
      () => !!Oe.value,
      (k) => {
        k ? Bn(yn) : j = !1;
      }
    ), dr(() => {
      tn(), yn(), g.value && typeof ResizeObserver < "u" && (He = new ResizeObserver(() => {
        tn(), yn();
      }), He.observe(g.value));
    }), $i(() => He?.disconnect()), e({ zoomBy: le, zoomRows: Me }), (k, A) => (w(), M("div", {
      ref_key: "root",
      ref: d,
      class: qe(["roll", { stale: n.stale, readonly: n.readonly, [`mode-${O.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": O.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: di
    }, [
      p("div", SA, [
        p("span", CA, [
          p("button", {
            class: qe(["mode draw", { active: O.value === "draw" }]),
            "aria-pressed": O.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: A[0] || (A[0] = (T) => O.value = "draw")
          }, [...A[20] || (A[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            ye(" Draw ", -1)
          ])], 10, MA),
          p("button", {
            class: qe(["mode select", { active: O.value === "select" }]),
            "aria-pressed": O.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: A[1] || (A[1] = (T) => O.value = "select")
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
            ye(" Select ", -1)
          ])], 10, AA)
        ]),
        p("span", TA, [
          A[22] || (A[22] = ye(" draw into ", -1)),
          p("button", {
            class: qe([{ active: b.value === "vocal" }, "vocal"]),
            "aria-pressed": b.value === "vocal",
            onClick: A[2] || (A[2] = (T) => b.value = "vocal")
          }, " Vocal ", 10, $A),
          p("button", {
            class: qe([{ active: b.value === "ins" }, "ins"]),
            "aria-pressed": b.value === "ins",
            onClick: A[3] || (A[3] = (T) => b.value = "ins")
          }, " Ins ", 10, DA)
        ]),
        p("label", OA, [
          A[27] || (A[27] = ye(" snap ", -1)),
          ze(p("select", {
            "onUpdate:modelValue": A[4] || (A[4] = (T) => L.value = T),
            "aria-label": "Snap"
          }, [
            p("option", LA, "auto (" + F(L.value === "auto" ? We.value : "score") + ")", 1),
            A[23] || (A[23] = p("option", { value: 4 }, "1/4", -1)),
            A[24] || (A[24] = p("option", { value: 8 }, "1/8", -1)),
            A[25] || (A[25] = p("option", { value: 16 }, "1/16", -1)),
            A[26] || (A[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [Xi, L.value]
          ])
        ]),
        p("span", EA, [
          p("button", {
            disabled: !n.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: A[5] || (A[5] = (T) => s("clipboard", "copy"))
          }, " Copy ", 8, BA),
          p("button", {
            disabled: !n.selection.length || !Ie.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: A[6] || (A[6] = (T) => s("clipboard", "cut"))
          }, " Cut ", 8, IA),
          p("button", {
            disabled: !n.clip || !Ie.value || n.locator === null,
            title: n.clip ? `Paste ${n.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: A[7] || (A[7] = (T) => s("clipboard", "paste"))
          }, " Paste ", 8, RA),
          p("button", {
            disabled: !n.clip || !Ie.value || n.locator === null,
            title: n.clip ? `Insert ${n.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: A[8] || (A[8] = (T) => s("clipboard", "insert"))
          }, " Insert ", 8, PA)
        ]),
        p("label", _A, [
          ze(p("input", {
            "onUpdate:modelValue": A[9] || (A[9] = (T) => l.value = T),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [un, l.value]
          ]),
          A[28] || (A[28] = ye(" hear ", -1))
        ]),
        p("button", {
          disabled: !Ie.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${We.value}); Shift+Q: their lengths too`,
          onClick: A[10] || (A[10] = (T) => Gt(!1))
        }, " Q ", 8, NA),
        p("span", VA, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: A[11] || (A[11] = (T) => le(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: A[12] || (A[12] = (T) => le(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: A[13] || (A[13] = (T) => Me(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: A[14] || (A[14] = (T) => Me(2))
          }, "↕+")
        ]),
        n.source ? (w(), M("label", HA, [
          ze(p("input", {
            "onUpdate:modelValue": A[15] || (A[15] = (T) => h.value = T),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [un, h.value]
          ]),
          A[29] || (A[29] = ye(" wave ", -1))
        ])) : ee("", !0),
        n.sung ? (w(), M("label", {
          key: 1,
          title: Os.value,
          class: qe({ unavailable: !!n.sung.problem })
        }, [
          ze(p("input", {
            "onUpdate:modelValue": A[16] || (A[16] = (T) => c.value = T),
            type: "checkbox",
            disabled: !!n.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, zA), [
            [un, c.value]
          ]),
          ye(" " + F(ba.value), 1)
        ], 10, FA)) : ee("", !0),
        p("label", WA, [
          ze(p("input", {
            "onUpdate:modelValue": A[17] || (A[17] = (T) => u.value = T),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [un, u.value]
          ]),
          A[30] || (A[30] = ye(" follow ", -1))
        ]),
        p("span", KA, F(S.value) + F(x.value), 1)
      ]),
      !Oe.value && n.view?.model_error ? (w(), M("p", UA, F(n.view.model_error.message), 1)) : Oe.value && J.value ? (w(), M("div", {
        key: 1,
        ref_key: "scroller",
        ref: g,
        class: "roll-scroll",
        style: ki({ height: `${Math.min(n.height, J.value.height + 16)}px` }),
        onScroll: tn,
        onWheel: ae
      }, [
        (w(), M("svg", {
          ref_key: "svg",
          ref: v,
          class: "roll-svg",
          width: J.value.width,
          height: J.value.height,
          onPointerdown: is,
          onPointermove: Ds,
          onPointerup: Li,
          onPointercancel: Ze,
          onDblclick: jn
        }, [
          (w(!0), M(me, null, Be(mn.value, (T) => (w(), M("rect", {
            key: "row" + T,
            class: qe(["row", { black: V(BC)(T), c: T % 12 === 0 }]),
            x: 0,
            y: V(ao)(T, J.value),
            width: J.value.width,
            height: J.value.rowHeight
          }, null, 10, GA))), 128)),
          (w(!0), M(me, null, Be(st.value, (T) => (w(), M("line", {
            key: "l" + T.unit,
            class: qe(T.kind),
            x1: V(rt)(T.unit, J.value),
            x2: V(rt)(T.unit, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 10, qA))), 128)),
          (w(!0), M(me, null, Be(pt.value, (T) => (w(), M("rect", Mo({
            key: T.id,
            class: _t(T)
          }, { ref_for: !0 }, V(Fi)(T, J.value), { rx: "2" }), [
            p("title", null, F(vn(T)), 1)
          ], 16))), 128)),
          (w(!0), M(me, null, Be(X.value, (T) => (w(), M("text", {
            key: "p" + T.key,
            class: "note-name",
            x: T.x,
            y: T.y
          }, F(T.text), 9, YA))), 128)),
          (w(!0), M(me, null, Be(Ae.value, (T) => (w(), M("text", {
            key: "y" + T.key,
            class: "syllable",
            x: T.x,
            y: T.y
          }, F(T.text), 9, XA))), 128)),
          (w(!0), M(me, null, Be(xr.value, (T) => (w(), M("path", {
            key: T.key,
            class: "sung-pitch",
            d: T.d
          }, null, 8, JA))), 128)),
          n.recorded ? (w(!0), M(me, { key: 0 }, Be(n.recorded.notes, (T, Q) => (w(), M("rect", Mo({
            key: "rec" + Q,
            class: "rec-note"
          }, { ref_for: !0 }, V(Fi)({ onset: T.onset, duration: Math.max(T.duration, 0.5), pitch: T.pitch }, J.value), { rx: "2" }), null, 16))), 128)) : ee("", !0),
          (w(!0), M(me, null, Be(ht.value, (T, Q) => (w(), M("rect", Mo({
            key: "ghost" + Q,
            class: ["ghost", T.track]
          }, { ref_for: !0 }, V(Fi)(T, J.value), { rx: "2" }), null, 16))), 128)),
          vt.value && vt.value.rect.height > 0 ? (w(), M("rect", Mo({
            key: 1,
            class: "band"
          }, vt.value.rect), null, 16)) : ee("", !0),
          n.locator !== null ? (w(), M("line", {
            key: 2,
            class: "locator",
            x1: V(rt)(n.locator, J.value),
            x2: V(rt)(n.locator, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, ZA)) : ee("", !0),
          n.playhead !== null ? (w(), M("line", {
            key: 3,
            class: "playhead",
            x1: V(rt)(n.playhead, J.value),
            x2: V(rt)(n.playhead, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, QA)) : ee("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${P.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: J.value.top,
              width: V(wn) - 2,
              height: J.value.height - J.value.top
            }, [...A[31] || (A[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, tT),
            (w(!0), M(me, null, Be(mn.value.filter((T) => T % 12 === 0), (T) => (w(), M("text", {
              key: "k" + T,
              class: "key-label",
              x: 4,
              y: V(ao)(T, J.value) + J.value.rowHeight - 2
            }, F(V(IC)(T)), 9, nT))), 128))
          ], 8, eT),
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
            }, null, 8, sT),
            p("rect", {
              class: "ruler",
              x: V(wn),
              y: 0,
              width: J.value.width - V(wn),
              height: V(ti)
            }, [...A[32] || (A[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, oT),
            p("rect", {
              class: "lane",
              x: 0,
              y: V(ti),
              width: J.value.width,
              height: V(fs)
            }, null, 8, rT),
            n.source && J.value.sourceTop !== null ? (w(), M(me, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: J.value.sourceTop,
                width: J.value.width,
                height: V(Oo)
              }, [...A[33] || (A[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, lT),
              (w(!0), M(me, null, Be(wr.value, (T) => (w(), M(me, {
                key: T.key
              }, [
                T.missing ? (w(), M("rect", {
                  key: 0,
                  class: "source-missing",
                  x: T.x,
                  y: J.value.sourceTop + 2,
                  width: T.width,
                  height: V(Oo) - 4
                }, [...A[34] || (A[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, aT)) : (w(), M("path", {
                  key: 1,
                  class: "source-wave",
                  d: T.d
                }, null, 8, uT))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: P.value + 3,
                y: J.value.sourceTop + 11
              }, "source", 8, cT)
            ], 64)) : ee("", !0),
            n.lyrics ? (w(), M(me, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: V(xi),
                width: J.value.width,
                height: V(Do)
              }, null, 8, hT),
              (w(!0), M(me, null, Be(H.value, (T) => (w(), M("g", {
                key: T.key,
                class: qe(["lyric-line", { unsung: !T.syllables.length, selected: T.selected, dragged: T.dragged }])
              }, [
                p("rect", {
                  x: T.x,
                  y: V(xi) + 3,
                  width: T.width,
                  height: V(Do) - 6,
                  rx: "3"
                }, null, 8, fT),
                n.lyricsEditable ? (w(), M("rect", {
                  key: 0,
                  class: "edge",
                  x: T.x + T.width - 3,
                  y: V(xi) + 5,
                  width: 3,
                  height: V(Do) - 10
                }, null, 8, dT)) : ee("", !0),
                p("text", {
                  x: T.x + 4,
                  y: V(xi) + V(Do) / 2 + 4
                }, F(T.shown), 9, pT),
                p("title", null, F(T.text) + F(n.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : ee("", !0),
            (w(!0), M(me, null, Be(st.value.filter((T) => T.kind === "bar"), (T) => (w(), M("line", {
              key: "t" + T.unit,
              class: "bar",
              x1: V(rt)(T.unit, J.value),
              x2: V(rt)(T.unit, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, gT))), 128)),
            (w(!0), M(me, null, Be(st.value.filter((T) => T.bar), (T) => (w(), M("text", {
              key: "n" + T.unit,
              class: "bar-number",
              x: V(rt)(T.unit, J.value) + 3,
              y: 12
            }, F(T.bar), 9, mT))), 128)),
            (w(!0), M(me, null, Be(Un.value, (T) => (w(), M("text", {
              key: "s" + T.unit,
              class: "section-label",
              x: V(rt)(T.unit, J.value) + 22,
              y: 12
            }, F(T.label), 9, vT))), 128)),
            (w(!0), M(me, null, Be(Pt.value, ({ chord: T, next: Q }) => (w(), M("g", {
              key: T.id,
              class: qe(["chord", {
                selected: (vt.value?.chords ?? Z.value).has(T.id),
                dragged: E.value?.kind === "chord" && E.value.chord.id === T.id
              }])
            }, [
              p("rect", {
                x: V(rt)(T.onset, J.value),
                y: V(ti) + 3,
                width: V(Vl)(T, Q, J.value),
                height: V(fs) - 6,
                rx: "3"
              }, null, 8, yT),
              p("text", {
                x: V(rt)(T.onset, J.value) + 4,
                y: V(ti) + V(fs) / 2 + 4
              }, F(T.name), 9, bT),
              p("title", null, "chord " + F(T.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            E.value?.kind === "chord" ? (w(), M("g", xT, [
              p("rect", {
                x: V(rt)(E.value.to, J.value),
                y: V(ti) + 3,
                width: V(Vl)(E.value.chord, void 0, J.value),
                height: V(fs) - 6,
                rx: "3"
              }, null, 8, wT),
              p("text", {
                x: V(rt)(E.value.to, J.value) + 4,
                y: V(ti) + V(fs) / 2 + 4
              }, F(E.value.chord.name), 9, kT)
            ])) : ee("", !0),
            vt.value?.lane && vt.value.rect.width > 0 ? (w(), M("rect", {
              key: 3,
              class: "band",
              x: vt.value.rect.x,
              y: V(ti),
              width: vt.value.rect.width,
              height: V(fs)
            }, null, 8, ST)) : ee("", !0),
            n.playhead !== null ? (w(), M("line", {
              key: 4,
              class: "playhead",
              x1: V(rt)(n.playhead, J.value),
              x2: V(rt)(n.playhead, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, CT)) : ee("", !0),
            n.locator !== null ? (w(), M("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${V(rt)(n.locator, J.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: J.value.top
              }, null, 8, AT),
              A[35] || (A[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + F($.value) + " - click or drag in the ruler to move it", 1)
            ], 8, MT)) : ee("", !0)
          ], 8, iT)
        ], 40, jA)),
        D.value ? ze((w(), M("input", {
          key: 0,
          ref_key: "chordInput",
          ref: m,
          "onUpdate:modelValue": A[18] || (A[18] = (T) => D.value.name = T),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: ki({ left: `${V(rt)(D.value.onset, J.value)}px`, top: `${V(ti) + 1 + Y.value}px` }),
          onKeydown: [
            Lt(ft(fo, ["prevent"]), ["enter"]),
            Lt(ft(os, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: os
        }, null, 44, TT)), [
          [Nt, D.value.name]
        ]) : ee("", !0),
        ke.value ? ze((w(), M("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: U,
          "onUpdate:modelValue": A[19] || (A[19] = (T) => ke.value.text = T),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: ki({ left: `${V(rt)(ke.value.start, J.value)}px`, top: `${V(xi) + 1 + Y.value}px` }),
          onKeydown: [
            Lt(ft(Te, ["prevent"]), ["enter"]),
            Lt(ft(Fe, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Te
        }, null, 44, $T)), [
          [Nt, ke.value.text]
        ]) : ee("", !0)
      ], 36)) : ee("", !0)
    ], 42, kA));
  }
}), Hl = (n) => [...new Set(n)].sort((e, t) => e - t);
function _d(n, e, t, i) {
  if (t.range && i !== null) {
    const [s, o] = i <= e ? [i, e] : [e, i], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? Hl([...n, ...r]) : r;
  }
  return t.toggle ? n.includes(e) ? n.filter((s) => s !== e) : Hl([...n, e]) : [e];
}
function Nd(n, e) {
  const t = new Set(e), i = Array.from({ length: n }, (s, o) => o).filter((s) => !t.has(s));
  return !i.length || i.length === n ? null : { order: i.map((s) => s + 1), selection: [] };
}
function Vd(n, e) {
  const t = Hl(e).filter((o) => o >= 0 && o < n);
  if (!t.length) return null;
  const i = t[t.length - 1];
  return { order: [
    ...Array.from({ length: i + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: n - i - 1 }, (o, r) => i + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => i + 1 + r) };
}
function Hd(n, e, t) {
  const i = new Set(e.filter((l) => l >= 0 && l < n));
  if (!i.size) return null;
  const s = Array.from({ length: n }, (l, a) => a), o = t < 0 ? s : [...s].reverse();
  let r = !1;
  for (const l of o) {
    const a = s[l], u = l + t;
    !i.has(a) || u < 0 || u >= n || i.has(s[u]) || (s[l] = s[u], s[u] = a, r = !0);
  }
  return r ? { order: s.map((l) => l + 1), selection: s.flatMap((l, a) => i.has(l) ? [a] : []) } : null;
}
function Fd(n, e, t, i) {
  const s = Hl(e).filter((a) => a >= 0 && a < n);
  if (!s.length || t < 0 || t > n) return null;
  const o = i ? Array.from({ length: n }, (a, u) => u) : Array.from({ length: n }, (a, u) => u).filter((a) => !s.includes(a)), r = i ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !i && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const _i = /* @__PURE__ */ G(null);
function Fl(n) {
  return n.id.startsWith("ins:") ? "ins" : "vocal";
}
function LT(n, e, t = null) {
  const i = [...new Set(e)].sort((u, c) => u - c).filter((u) => n.sections[u]), s = i.map((u) => n.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const h = n.measures[c.first_bar - 1], f = n.measures[c.first_bar - 1 + c.bars - 1], d = h.onset, g = f.onset + f.length;
    for (const m of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (m.onset >= g || m.onset + m.duration <= d) continue;
      const b = Math.max(m.onset, d);
      o.push({ track: Fl(m), onset: b - d + a, duration: Math.min(m.onset + m.duration, g) - b, pitch: m.pitch });
    }
    for (const m of n.tracks.chords) m.onset >= d && m.onset < g && r.push({ onset: m.onset - d + a, name: m.name });
    const v = t?.[i[u]];
    l.push(v ? { onset: a, label: c.label, lyrics: v } : { onset: a, label: c.label }), a += g - d;
  }
  return {
    unit: n.unit,
    span: a,
    tracks: ["vocal", "ins"],
    withChords: !0,
    notes: o,
    chords: r,
    sections: l,
    label: `section${s.length > 1 ? "s" : ""} ${s.map((u) => u.label).join(", ")}`
  };
}
function ET(n) {
  const e = [...new Set(n)].sort((i, s) => i - s), t = [];
  for (let i = 0; i < e.length; ) {
    let s = i;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > i ? `${e[i]}-${e[s]}` : `${e[i]}`), i = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function BT(n, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => n.measures[r]);
  if (!t.length) return null;
  const i = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = n.measures[r], u = l + a;
    for (const c of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const h = Math.max(c.onset, l);
      i.push({ track: Fl(c), onset: h - l + o, duration: Math.min(c.onset + c.duration, u) - h, pitch: c.pitch });
    }
    for (const c of n.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: n.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: i, chords: s, sections: [], label: ET(t.map((r) => r + 1)) };
}
function zd(n, e, t) {
  if (!e.length && !t.length) return null;
  const i = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => Fl(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: n.unit,
    span: s - i,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: Fl(l), onset: l.onset - i, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - i, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function Wd(n) {
  const e = /^1\/(\d+)$/.exec(n.trim());
  return e ? Number(e[1]) : NaN;
}
function IT(n, e) {
  const t = Wd(e) / Wd(n.unit);
  if (!Number.isFinite(t) || t <= 0) return null;
  if (t === 1) return n;
  const i = (o) => {
    const r = o * t;
    return Number.isInteger(r) ? r : null;
  };
  return [
    n.span,
    ...n.notes.flatMap((o) => [o.onset, o.duration]),
    ...n.chords.map((o) => o.onset),
    ...n.sections.map((o) => o.onset),
    ...(n.lyricLines ?? []).flatMap((o) => [o.offset, o.length])
  ].some((o) => i(o) === null) ? null : {
    ...n,
    unit: e,
    span: n.span * t,
    notes: n.notes.map((o) => ({ ...o, onset: o.onset * t, duration: o.duration * t })),
    chords: n.chords.map((o) => ({ ...o, onset: o.onset * t })),
    sections: n.sections.map((o) => ({ ...o, onset: o.onset * t })),
    ...n.lyricLines ? { lyricLines: n.lyricLines.map((o) => ({ ...o, offset: o.offset * t, length: o.length * t })) } : {}
  };
}
function RT(n, e) {
  if (!e.length) return null;
  const t = Math.max(...e.map((i) => i.offset + i.length));
  return {
    unit: n,
    span: t,
    tracks: [],
    withChords: !1,
    notes: [],
    chords: [],
    sections: [],
    lyricLines: e.map((i) => ({ ...i })),
    label: `${e.length} lyrics line${e.length > 1 ? "s" : ""}`
  };
}
function Kd(n, e, t, i) {
  const s = IT(n, e.unit);
  return s ? t < 0 || t >= e.total ? "Set the cursor inside the score first." : {
    op: "paste",
    at: t,
    mode: i,
    span: s.span,
    tracks: s.tracks,
    with_chords: s.withChords,
    notes: s.notes,
    chords: s.chords,
    sections: i === "insert" ? s.sections.map(({ onset: o, label: r }) => ({ onset: o, label: r })) : []
  } : `The clip was copied with L:${n.unit} and does not fit this score's L:${e.unit} grid.`;
}
const PT = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, _T = { class: "hint" }, NT = ["disabled"], VT = ["disabled"], HT = ["disabled"], FT = ["disabled"], zT = ["disabled"], WT = ["draggable", "aria-selected", "onDragstart", "onDragover"], KT = ["onClick"], UT = ["title"], jT = { key: 0 }, GT = ["onKeydown", "onBlur"], qT = { class: "facts" }, YT = {
  key: 0,
  class: "section-tools"
}, XT = ["onClick"], JT = ["onClick"], ZT = ["onClick"], QT = ["onClick"], e$ = {
  key: 1,
  class: "split"
}, t$ = ["disabled"], n$ = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, i$ = { class: "hint" }, s$ = ["disabled"], o$ = ["disabled"], r$ = ["disabled"], l$ = ["disabled"], a$ = ["disabled"], u$ = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], c$ = /* @__PURE__ */ Qt({
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
  setup(n, { emit: e }) {
    const t = n, i = e, s = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(""), r = /* @__PURE__ */ G("bridge"), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(null);
    let u = null;
    const c = /* @__PURE__ */ G(!1), h = /* @__PURE__ */ G(null), f = /* @__PURE__ */ G([]), d = /* @__PURE__ */ G(null);
    let g = null;
    const v = /* @__PURE__ */ G("sections"), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(null), O = N(() => t.view?.sections ?? []), L = N(() => t.view?.bars ?? []), E = N(() => t.view && t.bar ? xu(t.view, t.bar) : -1), B = N(() => new Set(t.errorBars)), z = N(() => !t.readonly && !!t.view?.model && O.value.length > 0);
    Ge(O, (x) => {
      l.value = (u ?? l.value).filter(($) => $ < x.length), u = null;
    }), Ge(L, (x) => {
      f.value = (g ?? f.value).filter(($) => $ < x.length), g = null;
    });
    function P(x, $) {
      s.value = x, o.value = $;
    }
    function Y(x) {
      const $ = o.value.trim();
      s.value = null, $ && $ !== O.value[x]?.label && i("operate", { op: "rename_section", section: x + 1, label: $ });
    }
    function K(x, $) {
      const I = O.value[x];
      I && i("operate", { op: "move_section_boundary", section: x + 1, start_bar: I.start_bar + $ });
    }
    function re(x) {
      const $ = t.sourceStarts?.[x - 1];
      return typeof $ == "number" ? ol($) : null;
    }
    function j(x, $) {
      v.value = "sections";
      const I = $.ctrlKey || $.metaKey;
      l.value = _d(l.value, x, { toggle: I, range: $.shiftKey }, a.value), $.shiftKey || (a.value = x);
      const _ = O.value[x];
      _ && !I && !$.shiftKey && i("goto", _.start_bar);
    }
    function D(x) {
      !x || !z.value || (u = x.selection, i("operate", { op: "arrange_sections", order: x.order }));
    }
    const U = () => D(Vd(O.value.length, l.value)), ke = () => D(Nd(O.value.length, l.value)), $e = (x) => D(Hd(O.value.length, l.value, x));
    function ce() {
      const x = t.view?.model;
      if (!x || !l.value.length) return;
      const $ = LT(x, l.value, t.sectionLyrics ?? null);
      $ && (_i.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function pe(x, $) {
      v.value = "bars";
      const I = $.ctrlKey || $.metaKey;
      f.value = _d(f.value, x, { toggle: I, range: $.shiftKey }, d.value), $.shiftKey || (d.value = x);
      const _ = L.value[x];
      _ && !I && !$.shiftKey && i("goto", _.index);
    }
    function He(x) {
      !x || !z.value || (g = x.selection, i("operate", { op: "arrange_measures", order: x.order.map(($) => $ - 1) }));
    }
    const Oe = () => He(Vd(L.value.length, f.value)), Re = () => He(Nd(L.value.length, f.value)), Le = (x) => He(Hd(L.value.length, f.value, x));
    function J() {
      const x = t.view?.model;
      if (!x || !f.value.length) return;
      const $ = BT(x, f.value);
      $ && (_i.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function ct(x) {
      const $ = x.ctrlKey || x.metaKey, I = x.key.toLowerCase();
      if (x.key === "Delete" || x.key === "Backspace") Re();
      else if ($ && I === "d") Oe();
      else if ($ && I === "c") J();
      else if ($ && I === "x" && f.value.length < L.value.length)
        J(), Re();
      else if ($ && (x.key === "ArrowLeft" || x.key === "ArrowUp")) Le(-1);
      else if ($ && (x.key === "ArrowRight" || x.key === "ArrowDown")) Le(1);
      else if ($ && I === "a") f.value = L.value.map((_, H) => H);
      else if (x.key === "Escape" && f.value.length) f.value = [];
      else return !1;
      return !0;
    }
    function be(x, $) {
      z.value && (v.value = "bars", f.value.includes(x) || (f.value = [x]), m.value = !0, $.dataTransfer?.setData("text/plain", "plenio-bars"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function Ie(x, $) {
      if (!m.value) return;
      $.preventDefault();
      const I = $.currentTarget.getBoundingClientRect();
      b.value = $.clientX < I.left + I.width / 2 ? x : x + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function se(x) {
      !m.value || b.value === null || (x.preventDefault(), He(Fd(L.value.length, f.value, b.value, x.altKey || x.ctrlKey)), Z());
    }
    function Z() {
      m.value = !1, b.value = null;
    }
    function ne(x) {
      if (!z.value || x.target?.closest("input, textarea, select")) return;
      if (v.value === "bars") {
        ct(x) && (x.preventDefault(), x.stopPropagation());
        return;
      }
      const $ = x.ctrlKey || x.metaKey, I = x.key.toLowerCase();
      let _ = !0;
      x.key === "Delete" || x.key === "Backspace" ? ke() : $ && I === "d" ? U() : $ && I === "c" ? ce() : $ && I === "x" && l.value.length < O.value.length ? (ce(), ke()) : $ && x.key === "ArrowUp" ? $e(-1) : $ && x.key === "ArrowDown" ? $e(1) : $ && I === "a" ? l.value = O.value.map((H, he) => he) : x.key === "Escape" && l.value.length ? l.value = [] : _ = !1, _ && (x.preventDefault(), x.stopPropagation());
    }
    function Xe(x, $) {
      z.value && (l.value.includes(x) || (l.value = [x]), c.value = !0, $.dataTransfer?.setData("text/plain", "plenio-sections"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function ht(x, $) {
      if (!c.value) return;
      $.preventDefault();
      const I = $.currentTarget.getBoundingClientRect();
      h.value = $.clientY < I.top + I.height / 2 ? x : x + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function vt(x) {
      !c.value || h.value === null || (x.preventDefault(), D(Fd(O.value.length, l.value, h.value, x.altKey || x.ctrlKey)), S());
    }
    function S() {
      c.value = !1, h.value = null;
    }
    return (x, $) => (w(), M("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: ne
    }, [
      z.value ? (w(), M("div", PT, [
        p("span", _T, F(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: U
        }, " Duplicate ", 8, NT),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: ce
        }, " Copy ", 8, VT),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: $[0] || ($[0] = (I) => $e(-1))
        }, "↑", 8, HT),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: $[1] || ($[1] = (I) => $e(1))
        }, "↓", 8, FT),
        p("button", {
          disabled: !l.value.length || l.value.length >= O.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: ke
        }, " Delete ", 8, zT)
      ])) : ee("", !0),
      p("ol", {
        class: "sections",
        onDragleave: $[5] || ($[5] = ft((I) => h.value = null, ["self"]))
      }, [
        (w(!0), M(me, null, Be(O.value, (I, _) => (w(), M("li", {
          key: _,
          class: qe({
            current: _ === E.value,
            picked: l.value.includes(_),
            "drop-before": h.value === _,
            "drop-after": h.value === _ + 1 && _ === O.value.length - 1
          }),
          draggable: z.value,
          "aria-selected": l.value.includes(_),
          onDragstart: (H) => Xe(_, H),
          onDragover: (H) => ht(_, H),
          onDrop: vt,
          onDragend: S
        }, [
          p("div", {
            class: "section-head",
            onClick: (H) => j(_, H)
          }, [
            p("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${I.start_bar}`
            }, [
              s.value !== _ ? (w(), M("strong", jT, F(I.label), 1)) : ee("", !0)
            ], 8, UT),
            s.value === _ ? ze((w(), M("input", {
              key: 0,
              "onUpdate:modelValue": $[2] || ($[2] = (H) => o.value = H),
              class: "rename",
              "aria-label": "Section name",
              onClick: $[3] || ($[3] = ft(() => {
              }, ["stop"])),
              onKeydown: [
                Lt(ft((H) => Y(_), ["prevent"]), ["enter"]),
                $[4] || ($[4] = Lt(ft((H) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (H) => Y(_)
            }, null, 40, GT)), [
              [Nt, o.value]
            ]) : ee("", !0),
            p("span", qT, [
              ye(" bars " + F(I.start_bar) + "-" + F(I.start_bar + I.bars - 1) + " · " + F(V(ol)(I.start_s)) + " ", 1),
              re(I.start_bar) ? (w(), M(me, { key: 0 }, [
                ye(" · source " + F(re(I.start_bar)), 1)
              ], 64)) : ee("", !0)
            ])
          ], 8, KT),
          n.readonly ? ee("", !0) : (w(), M("div", YT, [
            p("button", {
              title: "Rename this section",
              onClick: (H) => P(_, I.label)
            }, "Rename", 8, XT),
            _ > 0 ? (w(), M(me, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (H) => K(_, -1)
              }, "◀ bar", 8, JT),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (H) => K(_, 1)
              }, "bar ▶", 8, ZT),
              p("button", {
                title: "Join this section to the one before",
                onClick: (H) => i("operate", { op: "merge_section", section: _ + 1 })
              }, " Join ↑ ", 8, QT)
            ], 64)) : ee("", !0)
          ]))
        ], 42, WT))), 128))
      ], 32),
      !n.readonly && n.bar ? (w(), M("div", e$, [
        p("label", null, [
          ye(" New section at bar " + F(n.bar) + ": ", 1),
          ze(p("input", {
            "onUpdate:modelValue": $[6] || ($[6] = (I) => r.value = I),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [Nt, r.value]
          ])
        ]),
        p("button", {
          disabled: n.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: $[7] || ($[7] = (I) => i("operate", { op: "split_section", bar: n.bar, label: r.value }))
        }, " Split ", 8, t$)
      ])) : ee("", !0),
      z.value ? (w(), M("div", n$, [
        p("span", i$, F(f.value.length ? `${f.value.length} bar${f.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !f.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Oe
        }, " Duplicate ", 8, s$),
        p("button", {
          disabled: !f.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: J
        }, " Copy ", 8, o$),
        p("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: $[8] || ($[8] = (I) => Le(-1))
        }, "←", 8, r$),
        p("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: $[9] || ($[9] = (I) => Le(1))
        }, "→", 8, l$),
        p("button", {
          disabled: !f.value.length || f.value.length >= L.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Re
        }, " Delete ", 8, a$)
      ])) : ee("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: $[10] || ($[10] = ft((I) => b.value = null, ["self"]))
      }, [
        (w(!0), M(me, null, Be(L.value, (I, _) => (w(), M("button", {
          key: I.index,
          role: "listitem",
          class: qe(["bar", {
            selected: I.index === n.bar,
            picked: f.value.includes(_),
            error: B.value.has(I.index),
            alt: n.view ? V(xu)(n.view, I.index) % 2 === 1 : !1,
            "drop-before": b.value === _,
            "drop-after": b.value === _ + 1 && _ === L.value.length - 1
          }]),
          draggable: z.value,
          "aria-selected": f.value.includes(_),
          title: `Bar ${I.index} · ${V(ol)(I.start_s)} · ${I.chords.join(" ") || "no chord"}${z.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (H) => pe(_, H),
          onDragstart: (H) => be(_, H),
          onDragover: (H) => Ie(_, H),
          onDrop: se,
          onDragend: Z
        }, F(I.index), 43, u$))), 128))
      ], 32)
    ], 32));
  }
}), h$ = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, f$ = {
  class: "group",
  "aria-label": "History"
}, d$ = ["disabled", "title"], p$ = ["disabled", "title"], g$ = {
  class: "group",
  "aria-label": "Pitch"
}, m$ = ["disabled"], v$ = ["disabled"], y$ = ["disabled"], b$ = ["disabled"], x$ = {
  class: "group",
  "aria-label": "Length"
}, w$ = ["disabled"], k$ = ["disabled"], S$ = ["disabled"], C$ = ["disabled"], M$ = {
  class: "group",
  "aria-label": "Chord"
}, A$ = ["disabled"], T$ = ["disabled"], $$ = ["disabled"], D$ = { class: "group whole" }, O$ = { class: "whole-tools" }, L$ = ["disabled"], E$ = ["disabled"], B$ = ["disabled"], I$ = ["disabled"], R$ = ["disabled"], P$ = ["disabled"], _$ = /* @__PURE__ */ Qt({
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
  setup(n, { emit: e }) {
    const t = n, i = e, s = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(null), r = N(() => t.selection.filter((v) => t.view?.elements?.find((m) => m.id === v)?.kind === "note")), l = N(() => [...ur(t.selection)]), a = N(() => r.value.length > 0 || l.value.length > 0), u = N(() => t.primary?.kind === "note"), c = N(() => t.primary !== null && t.primary.kind !== "note"), h = N(() => {
      const v = t.primary;
      return !v || !t.view ? null : t.view.chords?.find((m) => m.bar === v.bar && Math.abs(m.start_s - v.start_s) < 1e-6) ?? null;
    }), f = N(() => t.primary && u.value ? bu(t.primary.units, 1) : null), d = N(() => t.primary && u.value ? bu(t.primary.units, -1) : null);
    Ge(
      () => t.view?.header?.tempo_bpm,
      (v) => {
        o.value = v ?? null;
      },
      { immediate: !0 }
    ), Ge(h, (v) => {
      s.value = v?.name ?? "";
    });
    function g(v) {
      l.value.length ? i("operate", { op: "set_note_pitch", ids: [...uo(t.view, t.selection), ...l.value], semitones: v }) : r.value.length && i("operate", { op: "shift_pitch", ids: r.value, semitones: v });
    }
    return (v, m) => (w(), M("div", h$, [
      p("div", f$, [
        p("button", {
          disabled: !n.canUndo || n.busy,
          title: `Undo${n.undoLabel ? ": " + n.undoLabel : ""} (Ctrl+Z)`,
          onClick: m[0] || (m[0] = (b) => i("undo"))
        }, "↶", 8, d$),
        p("button", {
          disabled: !n.canRedo || n.busy,
          title: `Redo${n.redoLabel ? ": " + n.redoLabel : ""} (Ctrl+Y)`,
          onClick: m[1] || (m[1] = (b) => i("redo"))
        }, "↷", 8, p$)
      ]),
      p("div", g$, [
        p("button", {
          disabled: !a.value || n.busy,
          title: "Octave down (Shift+↓)",
          onClick: m[2] || (m[2] = (b) => g(-12))
        }, "−8va", 8, m$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: m[3] || (m[3] = (b) => g(-1))
        }, "−1", 8, v$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: m[4] || (m[4] = (b) => g(1))
        }, "+1", 8, y$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Octave up (Shift+↑)",
          onClick: m[5] || (m[5] = (b) => g(12))
        }, "+8va", 8, b$)
      ]),
      p("div", x$, [
        p("button", {
          disabled: !d.value || n.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: m[6] || (m[6] = (b) => n.primary && d.value && i("operate", { op: "set_duration", id: n.primary.id, units: d.value }))
        }, " shorter ", 8, w$),
        p("button", {
          disabled: !f.value || n.busy,
          title: "Longer, into the rest after the note (])",
          onClick: m[7] || (m[7] = (b) => n.primary && f.value && i("operate", { op: "set_duration", id: n.primary.id, units: f.value }))
        }, " longer ", 8, k$),
        p("button", {
          disabled: !r.value.length || n.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: m[8] || (m[8] = (b) => i("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, S$),
        p("button", {
          disabled: !c.value || n.busy,
          title: "Turn the rest into a note (N)",
          onClick: m[9] || (m[9] = (b) => n.primary && i("operate", { op: "rest_to_note", id: n.primary.id }))
        }, " note ", 8, C$)
      ]),
      p("div", M$, [
        ze(p("input", {
          "onUpdate:modelValue": m[10] || (m[10] = (b) => s.value = b),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !n.primary || n.busy,
          onKeydown: m[11] || (m[11] = Lt(ft((b) => n.primary && s.value.trim() && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, A$), [
          [Nt, s.value]
        ]),
        p("button", {
          disabled: !n.primary || !s.value.trim() || n.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: m[12] || (m[12] = (b) => n.primary && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }))
        }, " set ", 8, T$),
        p("button", {
          disabled: !h.value || n.busy,
          title: "Remove the chord symbol at the selection",
          onClick: m[13] || (m[13] = (b) => h.value && i("operate", { op: "remove_chord", chord: h.value.id }))
        }, " remove ", 8, $$)
      ]),
      p("details", D$, [
        m[22] || (m[22] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", O$, [
          p("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone down",
            onClick: m[14] || (m[14] = (b) => i("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, L$),
          p("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone up",
            onClick: m[15] || (m[15] = (b) => i("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, E$),
          p("label", null, [
            m[21] || (m[21] = ye(" tempo ", -1)),
            ze(p("input", {
              "onUpdate:modelValue": m[16] || (m[16] = (b) => o.value = b),
              type: "number",
              min: "20",
              max: "300",
              class: "tempo",
              "aria-label": "Tempo in BPM"
            }, null, 512), [
              [
                Nt,
                o.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("button", {
            disabled: n.busy || !o.value || o.value === n.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: m[17] || (m[17] = (b) => o.value && i("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, B$),
          p("button", {
            disabled: n.busy || !n.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: m[18] || (m[18] = (b) => i("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, I$),
          p("button", {
            disabled: n.busy,
            title: "Let the instrument play the vocal melody",
            onClick: m[19] || (m[19] = (b) => i("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, R$),
          p("button", {
            disabled: n.busy,
            title: "Replace every Vocal note by rests",
            onClick: m[20] || (m[20] = (b) => i("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, P$)
        ])
      ])
    ]));
  }
}), N$ = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, V$ = ["disabled", "title"], H$ = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, F$ = ["aria-checked", "disabled", "title", "onClick"], z$ = ["disabled"], W$ = ["title"], K$ = ["disabled"], U$ = { class: "align" }, j$ = ["aria-expanded", "title"], G$ = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, q$ = ["title"], Y$ = ["title"], X$ = ["disabled"], J$ = {
  key: 0,
  class: "facts"
}, Z$ = ["title"], Q$ = { title: "A click on every beat (takes effect at the next start)" }, eD = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, tD = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, nD = ["checked"], iD = { title: "Practice speed; the score's tempo is not changed" }, sD = { class: "facts" }, oD = {
  key: 1,
  class: "error"
}, rD = /* @__PURE__ */ Qt({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ $n({
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
  emits: /* @__PURE__ */ $n(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = It(n, "voices"), o = It(n, "speed"), r = It(n, "metronome"), l = It(n, "hear"), a = It(n, "sourceLevel"), u = It(n, "sourceShift"), c = /* @__PURE__ */ G(!1);
    function h(se) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + se) * 1e3) / 1e3));
    }
    const f = N(() => {
      const se = Math.round(u.value * 1e3);
      return se ? `${Math.abs(se)} ms ${se > 0 ? "later" : "earlier"}` : "in place";
    }), d = t, g = new aA(), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1);
    let b = 0, O = null;
    const L = /* @__PURE__ */ G(!1), E = /* @__PURE__ */ G(0), B = /* @__PURE__ */ G(null);
    let z = null;
    const P = N(() => i.bar ?? 1), Y = N(() => i.from ?? i.view?.bars[P.value - 1]?.start_s ?? 0), K = N(() => i.position ? `the cursor (${i.position})` : `bar ${P.value}`), re = N(() => !!i.view?.notes), j = N(() => !!i.reference && !!i.source && o.value === 1), D = N(() => i.reference ? i.sourceProblem ? i.sourceProblem : i.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function U() {
      const se = j.value ? l.value : "notes";
      return { tones: se === "source" ? 0 : 1, source: se === "notes" ? 0 : a.value };
    }
    function ke(se) {
      const Z = i.view?.bars ?? [];
      let ne = 1;
      for (const Xe of Z) Xe.start_s <= se + el && (ne = Xe.index);
      return ne;
    }
    function $e(se) {
      if (i.loopRange) return [i.loopRange.from, i.loopRange.to];
      const Z = i.view;
      if (!Z) return null;
      const ne = Z.sections[xu(Z, ke(se))];
      return ne ? [ne.start_s, ne.end_s] : null;
    }
    function ce(se = Y.value, Z = null) {
      const ne = i.view;
      if (!ne) return;
      Re(), O = Z;
      const Xe = L.value && !Z ? $e(se) : null, ht = Xe && (se < Xe[0] - el || se >= Xe[1] - el) ? Xe[0] : se, vt = j.value, S = vt ? sy(ne, i.timelineBars) : null, x = { ...s.value };
      Z?.mute && (x[Z.mute] = !1), z = {
        from: ht,
        to: Xe ? Xe[1] : null,
        voices: x,
        speed: o.value,
        metronome: r.value,
        guide: i.guide ?? [],
        clock: S
      };
      const $ = z;
      b = Z ? He(ne, ht, Z.countIn, S) : 0;
      const I = oy(ne, $).map((H) => ({ ...H, at: H.at + b }));
      b && I.unshift(...Oe(ne, ht, Z?.countIn ?? 0, b));
      const _ = vt && S && i.source ? ry(S, ht, $.to).map((H) => ({ ...H, at: H.at + b })) : [];
      try {
        g.play(I, {
          source: _.length && i.source ? { buffer: i.source.buffer, segments: _ } : null,
          levels: U(),
          length: b + uy(ne, $),
          sounds: i.sounds,
          onTick: (H) => {
            m.value = H < b, !(H < b) && (E.value = ly($, H - b), d("cursor", ay(ne, E.value, $.voices)), d("time", E.value));
          },
          onEnd: () => {
            L.value && v.value && !Z ? ce(Xe?.[0] ?? $.from) : Le();
          }
        }), v.value = !0, m.value = b > 0, B.value = null;
      } catch (H) {
        B.value = H instanceof Error ? H.message : String(H);
      }
    }
    function pe(se, Z, ne) {
      const Xe = se.bars[ke(Z) - 1], ht = Number(Xe?.meter.split("/")[0]) || 4;
      return { beat: (ne?.[ke(Z) - 1]?.realDur ?? Xe?.duration_s ?? 2) / ht / ph(o.value), beats: ht };
    }
    function He(se, Z, ne, Xe) {
      if (ne <= 0) return 0;
      const { beat: ht, beats: vt } = pe(se, Z, Xe);
      return ne * vt * ht;
    }
    function Oe(se, Z, ne, Xe) {
      const { beat: ht, beats: vt } = pe(se, Z, z?.clock ?? null);
      return cy(se.bars[ke(Z) - 1] ?? null, vt, Z, ne, Xe, ht);
    }
    function Re() {
      g.stop(), v.value = !1, m.value = !1, O = null;
    }
    function Le() {
      const se = v.value;
      Re(), d("cursor", []), d("time", null), se && d("stopped");
    }
    function J(se, Z) {
      return ce(se, Z), v.value;
    }
    function ct(se) {
      const Z = z;
      if (!Z || !v.value) return null;
      const ne = g.elapsedAt(se) - b, Xe = Z.clock?.length ? Z.clock : null, ht = ne * ph(Z.speed);
      return Xe ? hy(Xe, fy(Xe, Z.from) + ht) : Z.from + ht;
    }
    function be() {
      v.value ? Le() : ce();
    }
    function Ie() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Ge(
      () => i.sounds,
      (se) => {
        se && g.setSounds(se);
      },
      { deep: !0 }
    ), Ge([l, a], () => {
      v.value && g.setLevels(U());
    }), Ge(
      () => i.from,
      (se, Z) => {
        v.value && !O && se !== null && se !== void 0 && se !== Z && ce(se);
      }
    ), e({ toggle: be, stop: Le, swap: Ie, playing: v, record: J, scoreSecondAt: ct, countingIn: m }), $i(() => g.close()), (se, Z) => (w(), M("div", N$, [
      p("button", {
        disabled: !re.value,
        title: v.value ? "Stop (Space)" : `Play from ${K.value} (Space)`,
        onClick: be
      }, F(v.value ? "■ stop" : "▶ play"), 9, V$),
      Q0(se.$slots, "record", {
        playing: v.value,
        countingIn: m.value
      }),
      n.reference ? (w(), M("span", H$, [
        (w(), M(me, null, Be(["both", "notes", "source"], (ne) => p("button", {
          key: ne,
          role: "radio",
          "aria-checked": l.value === ne,
          class: qe({ active: l.value === ne }),
          disabled: !j.value && ne !== "notes",
          title: D.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[ne],
          onClick: (Xe) => l.value = ne
        }, F(ne), 11, F$)), 64)),
        p("button", {
          disabled: !j.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Ie
        }, "A/B", 8, z$),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          Z[14] || (Z[14] = ye(" source ", -1)),
          ze(p("input", {
            "onUpdate:modelValue": Z[0] || (Z[0] = (ne) => a.value = ne),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !j.value,
            "aria-label": "Source level"
          }, null, 8, K$), [
            [
              Nt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, W$),
        p("span", U$, [
          p("button", {
            class: qe({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${f.value})`,
            onClick: Z[1] || (Z[1] = (ne) => c.value = !c.value)
          }, " ⇆ align" + F(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, j$),
          c.value ? (w(), M("span", G$, [
            Z[15] || (Z[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[2] || (Z[2] = (ne) => h(-(n.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, q$),
            p("button", {
              title: "10 ms earlier",
              onClick: Z[3] || (Z[3] = (ne) => h(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, F(f.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: Z[4] || (Z[4] = (ne) => h(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[5] || (Z[5] = (ne) => h(n.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, Y$),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: Z[6] || (Z[6] = (ne) => u.value = 0)
            }, "reset", 8, X$)
          ])) : ee("", !0)
        ]),
        D.value ? (w(), M("span", J$, F(D.value), 1)) : ee("", !0)
      ])) : ee("", !0),
      p("label", {
        title: n.loopRange ? `Play to the end of the selection (${n.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        ze(p("input", {
          "onUpdate:modelValue": Z[7] || (Z[7] = (ne) => L.value = ne),
          type: "checkbox"
        }, null, 512), [
          [un, L.value]
        ]),
        ye(" loop " + F(n.loopRange ? n.loopRange.label : "section"), 1)
      ], 8, Z$),
      p("label", Q$, [
        ze(p("input", {
          "onUpdate:modelValue": Z[8] || (Z[8] = (ne) => r.value = ne),
          type: "checkbox"
        }, null, 512), [
          [un, r.value]
        ]),
        Z[16] || (Z[16] = ye(" metronome", -1))
      ]),
      p("span", eD, [
        p("label", null, [
          ze(p("input", {
            "onUpdate:modelValue": Z[9] || (Z[9] = (ne) => s.value.Vocal = ne),
            type: "checkbox"
          }, null, 512), [
            [un, s.value.Vocal]
          ]),
          Z[17] || (Z[17] = ye(" Vocal", -1))
        ]),
        p("label", null, [
          ze(p("input", {
            "onUpdate:modelValue": Z[10] || (Z[10] = (ne) => s.value.Ins = ne),
            type: "checkbox"
          }, null, 512), [
            [un, s.value.Ins]
          ]),
          Z[18] || (Z[18] = ye(" Ins", -1))
        ]),
        p("label", null, [
          ze(p("input", {
            "onUpdate:modelValue": Z[11] || (Z[11] = (ne) => s.value.chords = ne),
            type: "checkbox"
          }, null, 512), [
            [un, s.value.chords]
          ]),
          Z[19] || (Z[19] = ye(" chords", -1))
        ]),
        n.guide?.length ? (w(), M("label", tD, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: Z[12] || (Z[12] = (ne) => s.value = { ...s.value, guide: ne.target.checked })
          }, null, 40, nD),
          Z[20] || (Z[20] = ye(" Guide ", -1))
        ])) : ee("", !0)
      ]),
      p("label", iD, [
        Z[22] || (Z[22] = ye(" speed ", -1)),
        ze(p("select", {
          "onUpdate:modelValue": Z[13] || (Z[13] = (ne) => o.value = ne),
          "aria-label": "Playback speed"
        }, [...Z[21] || (Z[21] = [
          p("option", { value: 0.5 }, "50 %", -1),
          p("option", { value: 0.75 }, "75 %", -1),
          p("option", { value: 1 }, "100 %", -1),
          p("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            Xi,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      p("span", sD, F(v.value ? `▶ ${V(ol)(E.value)}` : `${n.position ? `cursor ${n.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      B.value ? (w(), M("span", oD, F(B.value), 1)) : ee("", !0)
    ]));
  }
}), lD = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, aD = { class: "track-name" }, uD = { class: "count" }, cD = ["value", "aria-label", "title", "onChange"], hD = ["value", "title"], fD = ["title"], dD = ["checked", "aria-label", "onChange"], pD = {
  key: 0,
  class: "hint"
}, gD = {
  key: 1,
  class: "hint"
}, mD = /* @__PURE__ */ Qt({
  __name: "TrackPanel",
  props: /* @__PURE__ */ $n({
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
  emits: /* @__PURE__ */ $n(["clearGuide"], ["update:voices", "update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = It(n, "voices"), s = It(n, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(h, f) {
      const d = o[h];
      s.value && d && (s.value = { ...s.value, [d]: f });
    }
    const l = e, a = N(
      () => Xy(t.view, t.guideCount).filter((h) => t.keepsGuide || h.voice !== "guide")
    );
    function u(h) {
      return h === "guide" ? i.value.guide !== !1 : i.value[h] !== !1;
    }
    function c(h, f) {
      h === "guide" ? i.value = { ...i.value, guide: f } : i.value = { ...i.value, [h]: f };
    }
    return (h, f) => (w(), M("div", lD, [
      f[2] || (f[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (w(!0), M(me, null, Be(a.value, (d) => (w(), M("li", {
          key: d.voice,
          class: qe({ guide: d.voice === "guide", active: d.voice === "guide" && n.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: ki({ background: d.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", aD, F(d.name), 1),
          p("span", {
            class: qe(["destination", { unsent: !d.sent }])
          }, F(d.destination), 3),
          p("span", uD, F(V(Yy)(d.notes)), 1),
          s.value && o[d.voice] ? (w(), M("select", {
            key: 0,
            class: "sound",
            value: s.value[o[d.voice]],
            "aria-label": `Sound of the ${d.name} track`,
            title: `The ${d.name} track’s sound in the playback`,
            onChange: (g) => r(d.voice, g.target.value)
          }, [
            (w(!0), M(me, null, Be(V(Zd), (g) => (w(), M("option", {
              key: g,
              value: g,
              title: V(gl)[g].hint
            }, F(V(gl)[g].label), 9, hD))), 128))
          ], 40, cD)) : ee("", !0),
          p("label", {
            class: "play",
            title: `Play the ${d.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(d.voice),
              "aria-label": `Play the ${d.name} track`,
              onChange: (g) => c(d.voice, g.target.checked)
            }, null, 40, dD)
          ], 8, fD),
          d.voice === "guide" && d.notes > 0 && !n.readonly ? (w(), M("button", {
            key: 1,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: f[0] || (f[0] = (g) => l("clearGuide"))
          }, " clear ")) : ee("", !0)
        ], 2))), 128))
      ]),
      n.keepsGuide ? (w(), M("p", pD, [...f[1] || (f[1] = [
        ye(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        ye(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (w(), M("p", gD, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), vD = /^\[([^[\]\n]{1,40})\]$/;
function cr(n) {
  const e = [], t = [];
  let i = null;
  for (const s of n.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = vD.exec(o);
    r ? (i = { tag: r[1].trim(), lines: [] }, t.push(i)) : o && (i ? i.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function zl(n) {
  return n.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function lh(n, e) {
  return e && zl(e.tag) === zl(n) ? e.tag : n.replace(/(^|[\s-])(\p{L})/gu, (t, i, s) => i + s.toUpperCase());
}
function Ud(n) {
  return n.sections.map((e) => n.measures[e.first_bar - 1]?.onset ?? 0);
}
function Zr(n, e) {
  if (!n?.trim() || !e) return null;
  const t = cr(n), i = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== i.length || i.some((o, r) => zl(o.label) !== zl(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function yD(n, e) {
  const t = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return e.sections.forEach((i, s) => {
    if (i.implicit) return;
    const o = n.blocks[s] ?? null;
    t.push([`[${lh(i.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function bD(n, e, t, i, s = () => null) {
  const o = i?.length ? i : [[0, e.total, 0]], r = Ud(e), l = Ud(t), a = (g) => {
    let v = -1;
    return r.forEach((m, b) => {
      m <= g && (v = b);
    }), v;
  }, u = (g) => {
    for (const [v, m, b] of o)
      if (g >= b && g < b + m - v) return v + g - b;
    return null;
  }, c = (g) => g ? { tag: g.tag, lines: [...g.lines] } : null, h = [], f = [], d = /* @__PURE__ */ new Set();
  return l.forEach((g, v) => {
    const m = u(g), b = m === null ? -1 : a(m);
    f.push(b), m === null ? h.push(s(g)) : b < 0 ? h.push(null) : m === r[b] || f[v - 1] !== b ? (h.push(c(n.blocks[b] ?? null)), d.add(b)) : h.push(null);
  }), r.forEach((g, v) => {
    const m = n.blocks[v]?.lines;
    if (!(d.has(v) || !m?.length))
      for (const [b, O, L] of o) {
        if (g < b || g >= O) continue;
        const E = L + g - b;
        let B = -1;
        l.forEach((P, Y) => {
          P <= E && (B = Y);
        });
        const z = B >= 0 && l[B] !== E ? h[B] : null;
        z && (h[B] = { tag: z.tag, lines: [...z.lines, ...m] });
      }
  }), { preamble: n.preamble, blocks: h };
}
function Bv(n, e, t) {
  const i = [...n], s = t.trim();
  return e >= i.length ? s && i.push(s) : s ? i[e] = s : i.splice(e, 1), i;
}
function xD(n, e, t, i) {
  const s = cr(n);
  if (!s.blocks[e]) return n;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Bv(a.lines, t, i) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function wD(n, e, t, i, s) {
  const o = e.sections[t]?.label ?? "", r = n.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: lh(o, null), lines: [] };
    return { tag: u.tag, lines: Bv(u.lines, i, s) };
  });
  return { preamble: n.preamble, blocks: r };
}
function kD(n, e, t) {
  const i = cr(n);
  if (!i.blocks[e]) return n;
  const s = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return i.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function SD(n, e, t, i) {
  const s = e.sections[t]?.label ?? "", o = n.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: lh(s, null) }).tag, lines: [...i] } : r
  );
  return { preamble: n.preamble, blocks: o };
}
const CD = 2, MD = 0.5, AD = 32;
function jd(n, e, t, i) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= i) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, i) - l}.${o.pitch}`);
  }
  return `${n}:${s.join(",")}`;
}
function TD(n) {
  return n.measures.map((e) => [
    jd(e.meter, n.tracks.vocal, e.onset, e.onset + e.length),
    jd(e.meter, n.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function $D(n, e) {
  let t = 0;
  for (let i = 0; i < 2; i++) n[i] === e[i] && (t += n[i].endsWith(":") ? MD : CD);
  return t;
}
function DD(n, e) {
  const t = n.map((l) => e.map((a) => $D(l, a))), i = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < AD && l + u < n.length && a + u < e.length && !(i[l + u] <= 0 || t[l + u][a + u] !== i[l + u]); )
      u++;
    return u;
  }, o = [];
  let r = -1;
  for (let l = 0; l < n.length; l++) {
    const a = r + 1;
    let u;
    if (i[l] > 0) {
      const c = t[l].flatMap((d, g) => d === i[l] ? [g] : []), h = new Map(c.map((d) => [d, s(l, d)])), f = Math.max(...h.values());
      c.includes(a) && (h.get(a) ?? 0) >= f ? u = a : u = [...c].sort(
        (d, g) => (h.get(g) ?? 0) - (h.get(d) ?? 0) || Math.abs(d - a) - Math.abs(g - a) || d - g
      )[0];
    } else u = a < e.length ? a : null;
    o.push(u), u !== null && (r = u);
  }
  return o;
}
function OD(n, e) {
  if (e?.bars?.length)
    return !n || !e.bar_prints?.length ? n ? n.measures.map((t, i) => e.bars[i] ?? null) : e.bars : DD(TD(n), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const LD = "0.5.0";
function ED(n) {
  return {
    sounds: { ...n.sounds },
    metronome: n.metronome,
    hear: n.hear,
    sourceLevel: n.sourceLevel,
    wave: n.wave,
    sung: n.sung,
    record: { ...n.record },
    paper: n.paper,
    notationSize: n.notationSize
  };
}
function Gd(n, e) {
  return {
    ...n,
    ...e,
    sounds: { ...n.sounds, ...e.sounds ?? {} },
    record: { ...n.record, ...e.record ?? {} }
  };
}
function ah(n) {
  if (typeof n != "object" || n === null) return {};
  const e = n, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const i = e.sounds;
    Object.values(i).some(py) && (t.sounds = gy(i));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = my(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), vy(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const Jn = (n, e, t, i) => ({ Vocal: n, Ins: e, chord: t, guide: i }), Qr = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: Jn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: Jn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: Jn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: Jn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: Jn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: Jn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: Jn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: Jn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: Jn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...dy(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: Jn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], BD = "plenio/score-editor-presets.json", ID = "plenio.score_presets/1", Iv = "plenio.score-editor.presets";
function Rv(n) {
  const e = typeof n == "object" && n !== null ? n : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), i = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), i.push({ name: r, builtIn: !1, settings: ah(o.settings) }));
  }
  return i;
}
function Pv(n) {
  return JSON.stringify({ schema: ID, presets: n.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function RD() {
  try {
    return Rv(JSON.parse(window.localStorage.getItem(Iv) ?? "{}"));
  } catch {
    return [];
  }
}
function PD(n) {
  try {
    return window.localStorage.setItem(Iv, Pv(n)), !0;
  } catch {
    return !1;
  }
}
const _v = `/userdata/${encodeURIComponent(BD)}`;
async function _D(n) {
  if (n)
    try {
      const e = await n.fetchApi(_v, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: Rv(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: RD(), where: "browser" };
}
async function qd(n, e) {
  const t = e.filter((i) => !i.builtIn);
  if (n)
    try {
      if ((await n.fetchApi(`${_v}?overwrite=true`, { method: "POST", body: Pv(t) })).ok) return "comfyui";
    } catch {
    }
  return PD(t) ? "browser" : "failed";
}
function ND(n, e) {
  return [...n.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, i) => t.name.localeCompare(i.name));
}
const dl = "plenio.score_project/1", Nv = ".plenio.json";
function VD(n, e = /* @__PURE__ */ new Date()) {
  return {
    schema: dl,
    app: `Plenio Music Production System ${LD}`,
    saved: e.toISOString(),
    title: (n.title ?? "").trim(),
    score: n.score,
    guide: (n.guide ?? []).map(([t, i, s]) => [t, i, s]),
    lyrics: n.lyrics?.trim() ? n.lyrics : null,
    lyric_spans: n.lyrics?.trim() ? Qd(n.lyricSpans ?? []) : [],
    settings: n.settings ? ah(n.settings) : {}
  };
}
function HD(n) {
  return `${Array.from((n ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${Nv}`;
}
function FD(n) {
  let e;
  try {
    e = JSON.parse(n);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== dl ? `This file is not a Plenio score project (${dl}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: dl,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: Jy(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: Qd(t.lyric_spans),
    settings: ah(t.settings)
  };
}
const zD = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, WD = ["disabled", "title"], KD = ["disabled", "title"], UD = ["title"], jD = { class: "midi-settings" }, GD = ["aria-expanded"], qD = ["onKeydown"], YD = { class: "facts" }, XD = { key: 0 }, JD = ["value"], ZD = ["value"], QD = ["value"], eO = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, tO = ["checked"], nO = ["value"], iO = { title: "Where the take's starts and ends go" }, sO = ["value"], oO = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, rO = ["value"], lO = { title: "Silence the old notes of the recorded voice while recording" }, aO = ["checked"], uO = ["value"], cO = /* @__PURE__ */ Qt({
  __name: "RecordControls",
  props: /* @__PURE__ */ $n({
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
  emits: /* @__PURE__ */ $n(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(n, { emit: e }) {
    const t = n, i = It(n, "settings"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null);
    function l() {
      o.value = !1, Bn(() => r.value?.focus());
    }
    const a = /* @__PURE__ */ G(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    $i(() => clearInterval(u));
    const c = N(() => {
      const v = t.hub.selected.value;
      if (v === "all") return null;
      const m = t.hub.devices.value.find((b) => b.id === v);
      return m?.connected ? null : m?.name ?? "the chosen keyboard";
    }), h = N(() => a.value - t.hub.activity.value < 250), f = N(() => {
      const v = t.hub;
      if (v.status.value === "ready") {
        const m = v.devices.value.filter((b) => b.connected);
        return m.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${m.length} keyboard${m.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return v.status.value === "asking" ? "asking for MIDI access…" : v.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : v.problem.value ?? "MIDI is not available";
    }), d = N(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${i.value.countIn ? `, after ${i.value.countIn} bar${i.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function g(v, m) {
      i.value = { ...i.value, [v]: m };
    }
    return (v, m) => (w(), M("span", zD, [
      p("button", {
        class: qe(["rec", { on: n.recording, counting: n.countingIn }]),
        disabled: !!n.disabled && !n.recording,
        title: d.value,
        onClick: m[0] || (m[0] = (b) => n.recording ? s("stop") : s("record"))
      }, " ● " + F(n.recording && n.countingIn ? "count-in" : "rec"), 11, WD),
      p("button", {
        class: qe(["step", { on: n.step }]),
        disabled: !!n.disabled || n.recording,
        title: n.disabled ?? (n.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${n.target}: every key writes a note of the step length at the cursor`),
        onClick: m[1] || (m[1] = (b) => s("step"))
      }, " step ", 10, KD),
      n.step ? (w(), M("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: m[2] || (m[2] = (b) => s("rest"))
      }, "rest ▶")) : ee("", !0),
      p("span", {
        class: qe(["midi-light", { active: h.value, ready: n.hub.status.value === "ready" }]),
        title: f.value,
        "aria-hidden": "true"
      }, null, 10, UD),
      p("span", jD, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: m[3] || (m[3] = (b) => o.value ? l() : o.value = !0)
        }, "🎹", 8, GD),
        o.value ? (w(), M("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: Lt(ft(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          m[24] || (m[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", YD, F(f.value), 1),
          n.hub.status.value === "ready" ? (w(), M("label", XD, [
            m[13] || (m[13] = ye(" keyboard ", -1)),
            p("select", {
              value: n.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: m[4] || (m[4] = (b) => n.hub.selected.value = b.target.value)
            }, [
              m[12] || (m[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (w(!0), M(me, null, Be(n.hub.devices.value.filter((b) => b.connected), (b) => (w(), M("option", {
                key: b.id,
                value: b.id
              }, F(b.name), 9, ZD))), 128)),
              c.value ? (w(), M("option", {
                key: 0,
                value: n.hub.selected.value,
                disabled: ""
              }, F(c.value) + " (unplugged)", 9, QD)) : ee("", !0)
            ], 40, JD)
          ])) : n.hub.status.value !== "asking" ? (w(), M("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: m[5] || (m[5] = (b) => s("enable"))
          }, "use MIDI")) : ee("", !0),
          p("label", eO, [
            p("input", {
              checked: i.value.thru,
              type: "checkbox",
              onChange: m[6] || (m[6] = (b) => g("thru", b.target.checked))
            }, null, 40, tO),
            m[14] || (m[14] = ye(" hear the keys ", -1))
          ]),
          p("strong", null, "Recording into " + F(n.target), 1),
          m[25] || (m[25] = p("span", { class: "facts" }, [
            ye("The voice is the roll's "),
            p("em", null, "draw into"),
            ye("; the take starts at the cursor.")
          ], -1)),
          p("label", null, [
            m[16] || (m[16] = ye(" count-in ", -1)),
            p("select", {
              value: i.value.countIn,
              "aria-label": "Count-in",
              onChange: m[7] || (m[7] = (b) => g("countIn", Number(b.target.value)))
            }, [...m[15] || (m[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, nO)
          ]),
          p("label", iO, [
            m[18] || (m[18] = ye(" quantize ", -1)),
            p("select", {
              value: i.value.quantize,
              "aria-label": "Quantize the take",
              onChange: m[8] || (m[8] = (b) => g("quantize", Number(b.target.value)))
            }, [...m[17] || (m[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, sO)
          ]),
          p("label", oO, [
            m[20] || (m[20] = ye(" mode ", -1)),
            p("select", {
              value: i.value.mode,
              "aria-label": "Replace or merge",
              onChange: m[9] || (m[9] = (b) => g("mode", b.target.value))
            }, [...m[19] || (m[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, rO)
          ]),
          p("label", lO, [
            p("input", {
              checked: i.value.mute,
              type: "checkbox",
              onChange: m[10] || (m[10] = (b) => g("mute", b.target.checked))
            }, null, 40, aO),
            m[21] || (m[21] = ye(" mute its old notes ", -1))
          ]),
          m[26] || (m[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            m[23] || (m[23] = ye(" step ", -1)),
            p("select", {
              value: i.value.stepLength,
              "aria-label": "Step length",
              onChange: m[11] || (m[11] = (b) => g("stepLength", Number(b.target.value)))
            }, [...m[22] || (m[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, uO)
          ])
        ], 40, qD)) : ee("", !0)
      ])
    ]));
  }
}), hO = { class: "notation-export" }, fO = ["disabled", "aria-expanded", "title"], dO = ["onKeydown"], pO = { title: "The paper of the PDF and the print" }, gO = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, mO = { class: "formats" }, vO = ["disabled"], yO = ["disabled"], bO = ["disabled"], xO = ["disabled"], wO = { class: "facts" }, kO = /* @__PURE__ */ Qt({
  __name: "NotationExport",
  props: /* @__PURE__ */ $n({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {},
    size: { required: !0 },
    sizeModifiers: {}
  }),
  emits: /* @__PURE__ */ $n(["done", "failed"], ["update:paper", "update:size"]),
  setup(n, { emit: e }) {
    const t = n, i = It(n, "paper"), s = It(n, "size"), o = e, r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(!1), a = /* @__PURE__ */ G(null);
    function u() {
      r.value = !1, Bn(() => a.value?.focus());
    }
    async function c(h) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((d) => setTimeout(d, 20));
      let f = null;
      try {
        f = Vy(t.abc, t.title, i.value, s.value);
        const { lines: d } = f;
        if (!d.length) throw new Error("the score has no music to draw");
        const g = i.value === "a4" ? "A4" : "Letter";
        if (h === "pdf") {
          const v = await Hy(d, i.value, t.title);
          Ys(Ta(t.title, "pdf"), v, "application/pdf"), o("done", `exported the notation as PDF (${g})`);
        } else h === "png" ? (Ys(Ta(t.title, "png"), await Fy(d), "image/png"), o("done", "exported the notation as PNG")) : h === "svg" ? (Ys(Ta(t.title, "svg"), new TextEncoder().encode(zy(d)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (Wy(d, i.value, t.title), o("done", `printing the notation (${g}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (d) {
        o("failed", `The notation could not be exported: ${d instanceof Error ? d.message : String(d)}`);
      } finally {
        f?.dispose(), l.value = !1;
      }
    }
    return (h, f) => (w(), M("span", hO, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !n.abc,
        "aria-expanded": r.value,
        title: n.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: f[0] || (f[0] = (d) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, fO),
      r.value ? (w(), M("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: Lt(ft(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", pO, [
          f[8] || (f[8] = ye(" paper ", -1)),
          ze(p("select", {
            "onUpdate:modelValue": f[1] || (f[1] = (d) => i.value = d),
            "aria-label": "Paper"
          }, [...f[7] || (f[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [Xi, i.value]
          ])
        ]),
        p("label", gO, [
          f[10] || (f[10] = ye(" size ", -1)),
          ze(p("select", {
            "onUpdate:modelValue": f[2] || (f[2] = (d) => s.value = d),
            "aria-label": "Notation size"
          }, [...f[9] || (f[9] = [
            p("option", { value: "large" }, "large", -1),
            p("option", { value: "standard" }, "standard", -1),
            p("option", { value: "smaller" }, "smaller", -1),
            p("option", { value: "compact" }, "compact", -1)
          ])], 512), [
            [Xi, s.value]
          ])
        ]),
        p("span", mO, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: f[3] || (f[3] = (d) => c("pdf"))
          }, "PDF", 8, vO),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: f[4] || (f[4] = (d) => c("png"))
          }, "PNG", 8, yO),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: f[5] || (f[5] = (d) => c("svg"))
          }, "SVG", 8, bO),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: f[6] || (f[6] = (d) => c("print"))
          }, "Print…", 8, xO)
        ]),
        p("span", wO, F(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, dO)) : ee("", !0)
    ]));
  }
}), SO = { class: "sounds-settings" }, CO = ["aria-expanded"], MO = ["onKeydown"], AO = { class: "row" }, TO = { label: "Built in" }, $O = ["value", "title"], DO = {
  key: 0,
  label: "Yours"
}, OO = ["value"], LO = ["disabled"], EO = {
  key: 0,
  class: "facts"
}, BO = { class: "row" }, IO = ["onKeydown"], RO = ["disabled"], PO = {
  key: 1,
  class: "facts",
  role: "status"
}, _O = {
  key: 2,
  class: "facts"
}, NO = { class: "track" }, VO = ["value", "aria-label", "onChange"], HO = ["value", "title"], FO = ["title", "aria-label", "onClick"], zO = /* @__PURE__ */ Qt({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ $n({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ $n(["apply"], ["update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = It(n, "sounds"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(""), h = /* @__PURE__ */ G(!1), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(null), g = N(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([P]) => P !== "guide" || t.keepsGuide)
    ), v = N(() => l.value.find((P) => P.name === c.value) ?? null);
    async function m() {
      if (o.value = !0, u.value) return;
      const P = await _D(t.fetcher);
      l.value = P.presets, a.value = P.where, u.value = !0;
    }
    function b() {
      o.value = !1, h.value = !1, Bn(() => r.value?.focus());
    }
    function O() {
      const P = [...Qr, ...l.value].find((Y) => Y.name === c.value);
      P && (s("apply", P.settings, P.name), d.value = `“${P.name}” is set.`);
    }
    async function L() {
      const P = f.value.trim().slice(0, 60);
      if (!P) return;
      if (Qr.some((re) => re.name.toLowerCase() === P.toLowerCase())) {
        d.value = `“${P}” is a built-in preset - choose another name.`;
        return;
      }
      const Y = ND(l.value, { name: P, builtIn: !1, settings: structuredClone(t.settings) }), K = await qd(t.fetcher, Y);
      if (K === "failed") {
        d.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = Y, a.value = K, c.value = P, h.value = !1, f.value = "", d.value = K === "comfyui" ? `Saved “${P}” in ComfyUI’s user data.` : `Saved “${P}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function E() {
      const P = v.value;
      if (!P) return;
      const Y = l.value.filter((re) => re !== P);
      if (await qd(t.fetcher, Y) === "failed") {
        d.value = "The preset could not be deleted.";
        return;
      }
      l.value = Y, c.value = "", d.value = `Deleted “${P.name}”.`;
    }
    function B(P, Y) {
      i.value = { ...i.value, [P]: Y };
    }
    function z(P) {
      const Y = i.value[P], K = P === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : P === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [re, j, D] of K) setTimeout(() => fc(re, D, Y), j * 1e3);
    }
    return (P, Y) => (w(), M("span", SO, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: Y[0] || (Y[0] = (K) => o.value ? b() : m())
      }, "♫ sounds", 8, CO),
      o.value ? (w(), M("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: Lt(ft(b, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: b
        }, "×"),
        Y[6] || (Y[6] = p("strong", null, "Preset", -1)),
        p("span", AO, [
          ze(p("select", {
            "onUpdate:modelValue": Y[1] || (Y[1] = (K) => c.value = K),
            "aria-label": "Preset"
          }, [
            Y[5] || (Y[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", TO, [
              (w(!0), M(me, null, Be(V(Qr), (K) => (w(), M("option", {
                key: K.name,
                value: K.name,
                title: K.note
              }, F(K.name), 9, $O))), 128))
            ]),
            l.value.length ? (w(), M("optgroup", DO, [
              (w(!0), M(me, null, Be(l.value, (K) => (w(), M("option", {
                key: "own-" + K.name,
                value: K.name
              }, F(K.name), 9, OO))), 128))
            ])) : ee("", !0)
          ], 512), [
            [Xi, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: O
          }, "use", 8, LO),
          v.value ? (w(), M("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: E
          }, "delete")) : ee("", !0)
        ]),
        c.value ? (w(), M("span", EO, F([...V(Qr), ...l.value].find((K) => K.name === c.value)?.note ?? "Your preset"), 1)) : ee("", !0),
        p("span", BO, [
          h.value ? (w(), M(me, { key: 0 }, [
            ze(p("input", {
              "onUpdate:modelValue": Y[2] || (Y[2] = (K) => f.value = K),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                Lt(ft(L, ["prevent"]), ["enter"]),
                Y[3] || (Y[3] = Lt(ft((K) => h.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, IO), [
              [Nt, f.value]
            ]),
            p("button", {
              disabled: !f.value.trim(),
              onClick: L
            }, "save", 8, RO)
          ], 64)) : (w(), M("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: Y[4] || (Y[4] = (K) => h.value = !0)
          }, " save current as preset… "))
        ]),
        d.value ? (w(), M("span", PO, F(d.value), 1)) : a.value === "browser" ? (w(), M("span", _O, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : ee("", !0),
        Y[7] || (Y[7] = p("strong", null, "Sounds", -1)),
        (w(!0), M(me, null, Be(g.value, ([K, re]) => (w(), M("label", {
          key: K,
          class: "row"
        }, [
          p("span", NO, F(re), 1),
          p("select", {
            value: i.value[K],
            "aria-label": `Sound of the ${re} track`,
            onChange: (j) => B(K, j.target.value)
          }, [
            (w(!0), M(me, null, Be(V(Zd), (j) => (w(), M("option", {
              key: j,
              value: j,
              title: V(gl)[j].hint
            }, F(V(gl)[j].label), 9, HO))), 128))
          ], 40, VO),
          p("button", {
            title: `Hear the ${re} track’s sound`,
            "aria-label": `Hear the ${re} sound`,
            onClick: ft((j) => z(K), ["prevent"])
          }, "▶", 8, FO)
        ]))), 128)),
        Y[8] || (Y[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, MO)) : ee("", !0)
    ]));
  }
});
function WO(n) {
  return n.length >= 3 && (n[0] & 240) === 176 && (n[1] === 120 || n[1] === 123);
}
function KO(n, e, t) {
  if (n.length < 3) return null;
  const i = n[0] & 240, s = n[0] & 15, o = n[1] & 127, r = n[2] & 127;
  return i === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : i === 128 || i === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function UO(n, e) {
  switch (n) {
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
class jO {
  constructor(e = typeof navigator > "u" ? null : navigator) {
    this.navigatorLike = e;
  }
  navigatorLike;
  status = /* @__PURE__ */ G("off");
  problem = /* @__PURE__ */ G(null);
  devices = /* @__PURE__ */ G([]);
  /** The last note's time (``performance.now()`` ms): the activity light. */
  activity = /* @__PURE__ */ G(0);
  /** ``'all'`` or an input's id (kept while that keyboard is unplugged: then every one is listened to). */
  selected = /* @__PURE__ */ G("all");
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
      const i = t?.name;
      return this.fail(i === "SecurityError" || i === "NotAllowedError" ? "denied" : "failed", t), !1;
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
      const i = t.state !== "disconnected";
      e.push({ id: t.id, name: [t.manufacturer, t.name].filter(Boolean).join(" ") || t.id, connected: i }), t.onmidimessage = i ? (s) => this.receive(t.id, s) : null, i || this.letGo(t.id);
    }), this.devices.value = e;
  }
  /** The keyboard listened to: the chosen one, or every one while it is unplugged. */
  get listening() {
    const e = this.selected.value;
    return e !== "all" && this.devices.value.some((t) => t.id === e && t.connected) ? e : "all";
  }
  receive(e, t) {
    const i = typeof t.timeStamp == "number" && t.timeStamp > 0 ? t.timeStamp : performance.now();
    if (WO(t.data)) {
      this.letGo(e, i);
      return;
    }
    const s = KO(t.data, i, e);
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
    const i = this.held.get(e);
    if (i?.size) {
      this.held.delete(e);
      for (const [s, o] of i) this.emit({ kind: "off", note: s, velocity: 0, time: t, input: e, channel: o });
    }
  }
  emit(e) {
    for (const t of [...this.listeners])
      try {
        t(e);
      } catch (i) {
        console.error("Plenio: a MIDI listener failed", i);
      }
  }
  fail(e, t) {
    this.status.value = e, this.problem.value = UO(e, t);
  }
}
let Yd = null;
function GO() {
  return Yd ??= new jO(), Yd;
}
const qO = 0.035;
class YO {
  constructor(e, t) {
    this.start = e, this.track = t;
  }
  start;
  track;
  held = /* @__PURE__ */ new Map();
  done = [];
  noteOn(e, t) {
    const i = this.held.get(e);
    i && this.close(i, t), this.held.set(e, { pitch: e, start: t, end: null });
  }
  noteOff(e, t) {
    const i = this.held.get(e);
    i && this.close(i, t);
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
function XO(n, e) {
  const { start: t, stop: i, total: s, chordUnits: o, pickup: r } = e, l = Math.max(1, Math.round(e.grid) || 1), a = n.filter((h) => h.start >= t - r && h.start < i).map((h) => ({ pitch: h.pitch, start: Math.max(t, h.start), end: Math.min(i, Math.max(h.end ?? i, h.start)) })).sort((h, f) => h.start - f.start || f.pitch - h.pitch), u = [];
  for (const h of a) {
    const f = u.at(-1);
    if (f && h.start - f.start <= o) {
      h.pitch > f.pitch ? u[u.length - 1] = { ...h, start: f.start, end: Math.max(h.end, f.end) } : f.end = Math.max(f.end, h.end);
      continue;
    }
    u.push({ ...h });
  }
  const c = [];
  for (const [h, f] of u.entries()) {
    let d = Math.round((f.start - t) / l) * l + t, g = Math.round((f.end - t) / l) * l + t;
    g <= d && (g = d + l);
    const v = u[h + 1];
    if (v) {
      const b = Math.round((v.start - t) / l) * l + t;
      b > d && (g = Math.min(g, b));
    }
    d = Math.max(0, Math.min(d, s - 1)), g = Math.min(g, s);
    const m = c.at(-1);
    if (m && d <= m.onset) {
      g - d > m.duration && (c[c.length - 1] = { onset: m.onset, duration: g - m.onset, pitch: f.pitch });
      continue;
    }
    m && m.onset + m.duration > d && (m.duration = d - m.onset), m && d - (m.onset + m.duration) <= l && (m.duration = d - m.onset), g > d && c.push({ onset: d, duration: g - d, pitch: f.pitch });
  }
  return c;
}
function JO(n, e, t, i, s) {
  return {
    op: "place_notes",
    track: n,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(i), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function cu(n, e) {
  if (!e) return 1;
  const t = Number(n.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const ZO = 40;
function QO(n) {
  const e = /* @__PURE__ */ G(!1), t = /* @__PURE__ */ G(!1), i = /* @__PURE__ */ Fs(null), s = /* @__PURE__ */ G(0), o = new uA();
  let r = !1, l = null, a = null;
  const u = /* @__PURE__ */ G(0), c = N(() => {
    const K = i.value;
    return !K || !e.value ? [] : (u.value, K.played(s.value).filter((re) => re.end !== null && re.end > re.start).map((re) => ({ onset: re.start, duration: re.end - re.start, pitch: re.pitch })));
  });
  function h() {
    l ??= n.hub.subscribe(L);
  }
  async function f() {
    const K = await n.hub.enable();
    return n.problem(K ? null : n.hub.problem.value), K && h(), K;
  }
  function d(K) {
    const re = n.view();
    return re ? rh(re, Math.max(0, K)) : null;
  }
  async function g() {
    if (e.value) return;
    if (n.readonly()) {
      n.problem("This score belongs to the other sheet; record in that sheet.");
      return;
    }
    const K = n.view();
    if (!K?.model || !await f()) return;
    t.value = !1;
    const re = n.settings(), j = n.track(), D = Math.min(n.locator.value, K.model.total - 1), U = n.transport();
    if (!U) return;
    if (i.value = new YO(D, j), r = !1, e.value = !0, s.value = D, !U.record(oh(K, D), {
      countIn: re.countIn,
      mute: re.mute ? j === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, i.value = null, n.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    n.notify(`recording into ${j === "vocal" ? "Vocal" : "Ins"} from bar ${t4(K, D)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function v() {
    n.transport()?.stop();
  }
  function m() {
    e.value && (r = !0, n.transport()?.stop());
  }
  function b(K) {
    if (!e.value || K === null) return;
    const re = d(K);
    re !== null && (s.value = re);
  }
  async function O() {
    if (!e.value) return;
    const K = i.value, re = n.view();
    e.value = !1, i.value = null, o.allOff();
    const j = re?.model;
    if (!K || !j) return;
    if (r) {
      n.notify("recording thrown away");
      return;
    }
    const D = Math.max(s.value, K.start), U = j.measures.find((He) => He.onset <= K.start && K.start < He.onset + He.length) ?? j.measures[0], ke = re.bars[(U?.n ?? 1) - 1], $e = U && ke?.duration_s ? U.length / ke.duration_s : 8, ce = Number(U?.meter.split("/")[0]) || 4, pe = XO(K.finish(D), {
      start: K.start,
      stop: D,
      total: j.total,
      grid: cu(j.unit, n.settings().quantize),
      chordUnits: qO * $e,
      pickup: (U?.length ?? 16) / ce / 2
    });
    if (!pe.length) {
      n.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await n.operate(JO(K.track, pe, K.start, D, n.settings().mode));
  }
  function L(K) {
    if (n.settings().thru && (n.sound && (o.sound = n.sound()), K.kind === "on" ? o.on(K.note, K.velocity) : o.off(K.note)), e.value && i.value) {
      const j = n.transport()?.scoreSecondAt(K.time) ?? null, D = n.view();
      if (j === null || !D) return;
      const U = e4(D, i.value.start, j);
      if (U === null) return;
      K.kind === "on" ? i.value.noteOn(K.note, U) : i.value.noteOff(K.note, U), u.value++;
      return;
    }
    t.value && K.kind === "on" && E(K.note);
  }
  function E(K) {
    if (a) {
      a.pitches.push(K);
      return;
    }
    a = { pitches: [K], timer: setTimeout(() => {
      B();
    }, ZO) };
  }
  async function B() {
    const K = a?.pitches ?? [];
    a = null;
    const j = n.view()?.model;
    if (!j || !K.length || n.readonly()) return;
    const D = cu(j.unit, n.settings().stepLength), U = n.locator.value;
    if (U >= j.total) {
      n.notify("step input reached the end of the score - add bars or set the cursor");
      return;
    }
    await n.operate({
      op: "place_notes",
      track: n.track(),
      notes: [{ onset: U, duration: Math.min(D, j.total - U), pitch: Math.max(...K) }],
      label: "step"
    }) && (n.locator.value = Math.min(j.total, U + D));
  }
  function z() {
    const K = n.view()?.model;
    K && (n.locator.value = Math.min(K.total, n.locator.value + cu(K.unit, n.settings().stepLength)));
  }
  async function P() {
    if (t.value) {
      t.value = !1;
      return;
    }
    if (n.readonly()) {
      n.problem("This score belongs to the other sheet; enter notes in that sheet.");
      return;
    }
    await f() && (t.value = !0, n.notify(`step input into ${n.track() === "vocal" ? "Vocal" : "Ins"}: a key writes a note at the cursor and moves it on`));
  }
  function Y() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: g, stop: v, cancel: m, onTime: b, onStopped: O, toggleStep: P, rest: z, ready: f, dispose: Y };
}
function e4(n, e, t) {
  const i = n.model;
  if (!i) return null;
  const s = oh(n, e);
  if (t >= s) return rh(n, t);
  const o = i.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? i.measures[0], r = n.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function t4(n, e) {
  let t = 1;
  for (const i of n.model?.measures ?? []) i.onset <= e && (t = i.n);
  return t;
}
const n4 = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, i4 = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, s4 = ["aria-checked"], o4 = ["aria-checked"], r4 = ["aria-checked"], l4 = { title: "The piano roll and chord lane above the notation" }, a4 = { title: "Show the ABC text under the notation" }, u4 = { title: "Zoom of the notation" }, c4 = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, h4 = ["disabled", "title"], f4 = ["disabled", "title"], d4 = ["disabled"], p4 = ["disabled", "title"], g4 = ["disabled", "title"], m4 = ["accept"], v4 = {
  key: 1,
  class: "facts"
}, y4 = {
  key: 2,
  class: "facts ok"
}, b4 = {
  key: 3,
  class: "facts bad"
}, x4 = {
  key: 4,
  class: "badge"
}, w4 = {
  key: 1,
  class: "gate",
  role: "status"
}, k4 = {
  key: 2,
  class: "gate",
  role: "status"
}, S4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], C4 = ["data-layout", "data-text"], M4 = { class: "side" }, A4 = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, T4 = {
  key: 0,
  class: "hint"
}, $4 = {
  key: 0,
  class: "hint changed"
}, D4 = {
  key: 1,
  class: "hint"
}, O4 = {
  key: 2,
  class: "fit-panel"
}, L4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], E4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], B4 = {
  class: "status",
  "aria-live": "polite"
}, I4 = {
  key: 5,
  class: "error",
  role: "alert"
}, R4 = {
  key: 6,
  class: "error",
  role: "alert"
}, P4 = {
  key: 7,
  class: "error",
  role: "alert"
}, _4 = {
  key: 9,
  class: "diagnostics"
}, N4 = ["data-severity"], V4 = ["title", "onClick"], H4 = {
  key: 1,
  class: "where"
}, Xd = /* @__PURE__ */ Qt({
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
  setup(n, { emit: e }) {
    const t = n, i = e;
    function s(y) {
      return typeof y == "object" && y !== null && !Array.isArray(y);
    }
    const o = /* @__PURE__ */ Fs(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G(null);
    function a(y) {
      const C = y.op === "paste" && y.mode === "insert" && Array.isArray(y.sections) ? y.sections : [], R = typeof y.at == "number" ? y.at : 0, ue = _i.value;
      return (xe) => {
        let Se = -1;
        C.forEach((Ue, tt) => {
          Ue.onset <= xe - R && (Se = tt);
        });
        const Qe = Se >= 0 ? ue?.sections[Se]?.lyrics : null;
        return Qe ? { tag: Qe.tag, lines: [...Qe.lines] } : null;
      };
    }
    const u = _M(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => i("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => X(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (y) => {
        s(y) && (Array.isArray(y.guide) && t.guide !== void 0 && !Co(y.guide, t.guide) && i("guideChange", [...y.guide]), "lyrics" in y && (o.value = y.lyrics ?? null), "looseLyrics" in y && (r.value = y.looseLyrics ?? null), Array.isArray(y.spans) && Ae(y.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (y, C) => {
        const R = {}, ue = {}, xe = t.guide;
        if (xe?.length && y.time_map?.length) {
          const bt = Zy(xe, y.time_map);
          Co(bt, xe) || (i("guideChange", bt), R.guide = [...xe], ue.guide = bt);
        }
        const Se = X();
        if (Se.length && y.time_map?.length) {
          const bt = qy(Se, y.time_map);
          nl(bt, Se) || (Ae(bt), R.spans = [...Se], ue.spans = bt);
        }
        const Qe = o.value, Ue = ce.value?.model, tt = y.analysis.model;
        if (Qe && Ue && tt) {
          const bt = bD(Qe, Ue, tt, y.time_map, a(C));
          o.value = bt, R.lyrics = Qe, ue.lyrics = bt;
        }
        return Object.keys(ue).length ? { before: R, after: ue } : void 0;
      }
    });
    Ge(
      () => [t.doc.text, u.commitBlock],
      ([y, C]) => {
        t.readonly || i("gate", y, C);
      },
      { immediate: !0 }
    );
    const c = /* @__PURE__ */ G(yy()), h = /* @__PURE__ */ G(h2(t.layoutDefault, c.value.layout));
    function f(y) {
      h.value = y, c.value = { ...c.value, layout: y };
    }
    const d = /* @__PURE__ */ G([]), g = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), b = /* @__PURE__ */ G(null), O = /* @__PURE__ */ G(null), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G("vocal"), B = N({
      get: () => c.value.sounds,
      set: (y) => c.value = { ...c.value, sounds: y }
    }), z = N(() => ED(c.value));
    function P(y, C) {
      c.value = Gd(c.value, y), u.notes = [`${C}: ${Y(y)}`];
    }
    function Y(y) {
      const C = [];
      return y.sounds && C.push("sounds"), y.metronome !== void 0 && C.push(`metronome ${y.metronome ? "on" : "off"}`), y.hear && C.push(`hear ${y.hear}`), (y.wave !== void 0 || y.sung !== void 0) && C.push("the source view"), y.record && C.push("recording"), y.paper && C.push(`paper ${y.paper === "a4" ? "A4" : "Letter"}`), y.notationSize && C.push(`notation ${y.notationSize}`), C.length ? `${C.join(", ")} set` : "nothing to set";
    }
    const K = N(() => c.value.sounds[E.value === "vocal" ? "Vocal" : "Ins"]);
    Ge(c, (y) => $y(y), { deep: !0 });
    const re = GO();
    re.selected.value = c.value.midiInput, Ge(re.selected, (y) => c.value = { ...c.value, midiInput: y });
    const j = N({
      get: () => c.value.record,
      set: (y) => c.value = { ...c.value, record: y }
    }), D = QO({
      hub: re,
      transport: () => b.value,
      view: () => ce.value,
      locator: g,
      track: () => E.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: Gt,
      notify: (y) => u.notes = [y],
      problem: (y) => U.value = y,
      sound: () => K.value
    }), U = /* @__PURE__ */ G(null), ke = N(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : ne.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function $e(y) {
      const C = y.target;
      L.value?.contains(C) || ka(C) || y.ctrlKey || y.metaKey || y.altKey || y.key !== " " && y.key !== "Escape" || (y.preventDefault(), y.stopPropagation(), y.key === " " ? D.stop() : D.cancel());
    }
    Ge(D.recording, (y) => {
      y ? window.addEventListener("keydown", $e, !0) : window.removeEventListener("keydown", $e, !0);
    }), $i(() => {
      window.removeEventListener("keydown", $e, !0), D.cancel(), D.dispose();
    }), $i(() => u.dispose());
    const ce = N(() => u.lastValid), pe = N(() => !!u.view && !u.view.ok), He = N(() => u.view?.diagnostics ?? []), Oe = N(
      () => He.value.filter((y) => y.severity === "error" && y.bar).map((y) => y.bar)
    ), Re = N(
      () => Ov(ce.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Le = N(() => h.value !== "text"), J = N(() => h.value === "daw"), ct = N(() => t.guide ?? []), be = N(() => Qy(t.guide, ce.value?.model)), Ie = N(() => J.value ? c.value.voices.guide ?? !0 : !1), se = N(() => Ie.value ? be.value : []), Z = N(() => Le.value && c.value.roll && !!(ce.value?.model || ce.value?.model_error)), ne = N(() => ce.value?.model ?? null), Xe = N(() => ne.value ? Ko(ne.value, g.value) : Re.value), ht = N(() => ce.value && ne.value ? oh(ce.value, g.value) : null), vt = N(() => ne.value ? Ev(ne.value, g.value) : "");
    Ge(
      () => ne.value?.total,
      (y) => {
        y !== void 0 && g.value > y && (g.value = y);
      }
    );
    let S = null, x = null, $ = !1;
    Ge(
      () => [t.lyricsTarget, t.lyrics, ne.value],
      ([y, C, R]) => {
        if (!y || !C?.trim()) {
          o.value = null, r.value = null, S = null, $ = !1;
          return;
        }
        const ue = C === S || C === x;
        if (S = C, ue && ($ || !R)) {
          if (o.value && R && o.value.blocks.length !== R.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && R) {
            const Se = Zr(r.value, R);
            Se && (o.value = Se, r.value = null);
          }
          return;
        }
        const xe = !$ && t.lyricsPending || C;
        o.value = R ? Zr(xe, R) : null, r.value = o.value ? null : xe, $ = !!R;
      },
      { immediate: !0 }
    ), Ge(
      [o, r, ne],
      () => {
        const y = o.value, C = ne.value;
        y ? C && y.blocks.length === C.sections.length && (l.value = yD(y, C)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Ge(
      l,
      (y, C) => {
        x = y, i("lyricsChange", y), C !== void 0 && y !== C && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const I = N(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), _ = N(
      () => !!l.value && !t.lyricsTarget?.own && bn(l.value) !== bn(t.lyrics ?? "")
    ), H = N(() => l.value ? cr(l.value).blocks.map((y) => y.tag).join(" · ") : ""), he = N(() => l.value ?? t.lyrics ?? null);
    function ie() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...X()] };
    }
    const oe = /* @__PURE__ */ Fs(null);
    function X() {
      return oe.value ?? t.lyricSpans ?? [];
    }
    function Ae(y) {
      nl(y, X()) || (oe.value = y, i("lyricSpansChange", y), u.refreshLyrics());
    }
    Ge(
      () => t.lyricSpans,
      (y) => {
        y && oe.value && nl(y, oe.value) || (oe.value = null, u.refreshLyrics());
      }
    );
    const fe = /* @__PURE__ */ G([]);
    Ge(
      () => u.selection,
      (y) => {
        y.length && (fe.value = []);
      }
    );
    function Ce(y) {
      const C = ne.value;
      if (!C) return !1;
      const [R, ue] = Cr(C, y);
      return X().some(([xe]) => xe >= R && xe < ue);
    }
    function Te(y) {
      const C = ce.value?.lyrics?.sections.find((R) => R.section === y);
      return o.value ? [...o.value.blocks[y]?.lines ?? []] : r.value === null || !C || C.block === null ? null : [...cr(r.value).blocks[C.block]?.lines ?? []];
    }
    function Fe(y, C, R) {
      const ue = ne.value, xe = ce.value?.lyrics;
      if (!ue || !xe || !I.value) return [];
      const Se = ie();
      let Qe = X();
      const Ue = [];
      let tt = !1;
      for (const bt of [...new Set(y)].sort((En, Sr) => En - Sr)) {
        const En = Te(bt);
        if (En === null) continue;
        const Sr = Cr(ue, bt), Sa = Uy(C(bt, Mh(ue, xe, bt, En)), Sr), dh = Sa.map((rs) => rs.text);
        if (o.value) o.value = SD(o.value, ue, bt, dh);
        else if (r.value !== null) {
          const rs = xe.sections.find((Ca) => Ca.section === bt)?.block;
          if (rs == null) continue;
          r.value = kD(r.value, rs, dh);
        } else continue;
        Sa.forEach((rs, Ca) => {
          rs.id.startsWith("*") && Ue.push(ml(bt, Ca));
        }), Qe = jy(Qe, Sr, Sa), tt = !0;
      }
      return tt ? (Ae(Qe), u.recordSide(R, Se, ie()), Ue) : [];
    }
    function We(y) {
      const C = /* @__PURE__ */ new Map();
      for (const R of y) {
        const ue = Gy(R);
        ue && (C.has(ue.section) || C.set(ue.section, /* @__PURE__ */ new Set()), C.get(ue.section)?.add(ue.line));
      }
      return C;
    }
    function Ke(y) {
      const C = new Map(y.map((ue) => [ue.key, ue])), R = y.length;
      fe.value = Fe(
        [...We(y.map((ue) => ue.key)).keys()],
        (ue, xe) => xe.map((Se, Qe) => {
          const Ue = C.get(ml(ue, Qe));
          return Ue ? { ...Se, id: `*${Se.id}`, start: Ue.start, end: Ue.end } : Se;
        }),
        `lyrics: ${R === 1 ? "line" : `${R} lines`} placed`
      );
    }
    function et(y) {
      const C = We(y);
      C.size && (Fe(
        [...C.keys()],
        (R, ue) => ue.filter((xe, Se) => !C.get(R)?.has(Se)),
        `lyrics: ${y.length === 1 ? "line" : `${y.length} lines`} deleted`
      ), fe.value = []);
    }
    function pt() {
      const y = ne.value, C = ce.value?.lyrics;
      if (!y || !C) return [];
      const R = [];
      for (const [ue, xe] of We(fe.value)) {
        const Se = Te(ue);
        Se && Mh(y, C, ue, Se).forEach((Qe, Ue) => {
          xe.has(Ue) && R.push(Qe);
        });
      }
      return R;
    }
    function Pt() {
      const y = ne.value ? RT(ne.value.unit, Ch(pt())) : null;
      return y ? (_i.value = y, u.error = null, u.notes = [`copied ${y.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function st(y, C, R) {
      const ue = ne.value;
      if (!ue) return;
      const xe = Ky(ue, C);
      if (xe < 0 || Te(xe) === null) {
        u.error = "The cursor is in a section without lyrics: set it into a section that has a lyrics block.";
        return;
      }
      const [, Se] = Cr(ue, xe), Qe = y.filter((Ue) => C + Ue.offset < Se);
      Qe.length && (fe.value = Fe(
        [xe],
        (Ue, tt) => [
          ...tt,
          ...Qe.map((bt, En) => ({
            id: `*new${En}`,
            text: bt.text,
            start: C + bt.offset,
            end: Math.min(C + bt.offset + bt.length, Se)
          }))
        ],
        R
      ), u.error = null, Qe.length < y.length && (u.notes = [`${y.length - Qe.length} line(s) did not fit before the section's end`]));
    }
    function mn(y) {
      const C = _i.value;
      if ((y === "paste" || y === "insert") && C?.lyricLines?.length)
        return I.value ? ne.value && C.unit !== ne.value.unit ? (u.error = `The lines were copied with L:${C.unit} and do not fit this score's L:${ne.value.unit}.`, !0) : (st(C.lyricLines, g.value, `lyrics: ${C.label} pasted`), !0) : !0;
      if (!fe.value.length) return !1;
      if (y === "copy") Pt();
      else if (y === "cut")
        Pt() && et(fe.value);
      else if (y === "duplicate") {
        const R = pt();
        if (R.length) {
          const ue = Math.max(...R.map((xe) => xe.end));
          st(Ch(R), ue, `lyrics: ${R.length === 1 ? "line" : `${R.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function Un(y) {
      const C = ne.value;
      if (C && Ce(y.section)) {
        const ue = Math.max(1, Math.round(C.grid.units_per_quarter));
        Fe(
          [y.section],
          (xe, Se) => {
            if (y.line < Se.length)
              return y.text ? Se.map((Ue, tt) => tt === y.line ? { ...Ue, text: y.text } : Ue) : Se.filter((Ue, tt) => tt !== y.line);
            const Qe = y.at ?? Se[Se.length - 1]?.end ?? Cr(C, y.section)[0];
            return y.text ? [...Se, { id: "*typed", text: y.text, start: Qe, end: Qe + ue }] : Se;
          },
          `lyrics: ${y.text || "line removed"}`
        );
        return;
      }
      const R = ie();
      if (o.value && C) o.value = wD(o.value, C, y.section, y.line, y.text);
      else if (r.value !== null) r.value = xD(r.value, y.block, y.line, y.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${y.text || "line removed"}`, R, ie());
    }
    function Ot() {
      const y = t.lyrics, C = ne.value;
      if (!y) return;
      const R = ie();
      o.value = C ? Zr(y, C) : null, r.value = o.value ? null : y, t.readonly || u.recordSide("lyrics reverted", R, ie());
    }
    Ge(ne, (y) => {
      if (!xa || !y || r.value === null) return;
      xa = !1;
      const C = Zr(r.value, y);
      C && (o.value = C, r.value = null);
    }), Ge(Re, (y) => {
      !Z.value && y && ne.value && (g.value = Bd(ne.value, y));
    });
    const _t = N({
      get: () => c.value.metronome,
      set: (y) => c.value = { ...c.value, metronome: y }
    }), vn = N(() => t.payload?.reference_audio ? Dy(t.fetcher, t.payload.reference_audio) : null), Mt = /* @__PURE__ */ Fs(null), is = /* @__PURE__ */ G(null);
    Ge(
      vn,
      (y) => {
        Mt.value = null, is.value = null, y && pA(y).then(
          (C) => {
            vn.value === y && (Mt.value = C);
          },
          (C) => {
            vn.value === y && (is.value = `the source recording could not be read: ${C instanceof Error ? C.message : String(C)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const Ln = N({
      get: () => c.value.hear,
      set: (y) => c.value = { ...c.value, hear: y }
    }), ss = N({
      get: () => c.value.sourceLevel,
      set: (y) => c.value = { ...c.value, sourceLevel: y }
    }), Ds = N(() => {
      const y = ce.value, C = y?.model;
      if (!y || !C) return null;
      const R = Os(), ue = [...R.notes.map((tt) => [tt.onset, tt.onset + tt.duration]), ...R.chords.map((tt) => [tt.onset, tt.onset + 1])];
      if (!ue.length) return null;
      const xe = Ko(C, Math.min(...ue.map(([tt]) => tt))), Se = Ko(C, Math.max(...ue.map(([, tt]) => tt)) - 1), Qe = y.bars[xe - 1], Ue = y.bars[Se - 1];
      return !Qe || !Ue ? null : { from: Qe.start_s, to: Ue.start_s + Ue.duration_s, label: xe === Se ? `bar ${xe}` : `bars ${xe}-${Se}` };
    }), Ft = N(() => {
      const y = OD(ce.value?.model, t.payload?.timeline), C = t.sourceShift ?? 0;
      return !y || !C ? y : y.map((R) => R ? [R[0] - C, R[1] - C, R[2]] : null);
    }), Li = N(() => {
      const y = Ft.value?.[(Xe.value ?? 1) - 1] ?? Ft.value?.find((R) => R);
      if (!y) return 0.5;
      const C = Number(y[2].split("/")[0]) || 4;
      return (y[1] - y[0]) / C;
    }), Ze = N(() => {
      const y = t.payload?.sung_pitch;
      if (!y) return null;
      const C = vA(y), R = ne.value;
      return !C || !R ? { problem: "problem" in y ? y.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: C, offset: xA(R, Ft.value, C), bars: Ft.value };
    }), jn = N({
      get: () => t.sourceShift ?? 0,
      set: (y) => i("sourceShiftChange", Math.round(y * 1e3) / 1e3)
    }), fo = N(() => Ft.value?.map((y) => y?.[0] ?? null) ?? null), os = N(() => ce.value?.header?.unit ?? "1/16"), di = N({
      get: () => c.value.voices,
      set: (y) => c.value = { ...c.value, voices: y }
    }), tn = N({
      get: () => c.value.speed,
      set: (y) => c.value = { ...c.value, speed: y }
    });
    function yn(y, C = !1, R = "notation") {
      const ue = C ? u.selection.includes(y) ? u.selection.filter((Se) => Se !== y) : [...u.selection, y] : [y];
      u.select(ue);
      const xe = xs(ce.value, ue[0]);
      m.value = R !== "text" && xe ? [xe.source[0], xe.source[1]] : m.value;
    }
    function W(y) {
      if (!ce.value || pe.value) return;
      const C = w1(ce.value, y);
      C && yn(C.id, !1, "text");
    }
    function le(y) {
      if (!ce.value) return;
      ce.value.model && (g.value = Bd(ce.value.model, y));
      const C = C1(ce.value, y);
      C && yn(C.id, !1, "keys");
    }
    function ae() {
      return D.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function Me(y) {
      t.readonly || ae() || await u.operate(y);
    }
    function Gt(y) {
      return t.readonly || ae() ? Promise.resolve(!1) : u.operate(y);
    }
    function br() {
      ae() || u.undo();
    }
    function xr() {
      ae() || u.redo();
    }
    function ba(y) {
      u.select(y);
      const C = xs(ce.value, y[0]);
      C && (m.value = [C.source[0], C.source[1]]);
    }
    function Os() {
      const y = ne.value;
      if (!y) return { notes: [], chords: [] };
      const C = uo(ce.value, u.selection), R = ur(u.selection);
      return {
        notes: [...y.tracks.vocal, ...y.tracks.ins].filter((ue) => C.has(ue.id)),
        chords: y.tracks.chords.filter((ue) => R.has(ue.id))
      };
    }
    function wr() {
      const y = ne.value, C = Os(), R = y ? zd(y, C.notes, C.chords) : null;
      return R ? (_i.value = R, u.error = null, u.notes = [`copied ${R.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function po(y) {
      if (mn(y)) return;
      const C = ne.value;
      if (y === "copy") {
        wr();
        return;
      }
      if (t.readonly || !C) return;
      if (y === "cut") {
        const xe = Os();
        if (!wr()) return;
        await Me({ op: "delete", ids: [...xe.notes.map((Se) => Se.id), ...xe.chords.map((Se) => Se.id)] });
        return;
      }
      if (y === "duplicate") {
        const xe = Os(), Se = zd(C, xe.notes, xe.chords);
        if (!Se) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Qe = Math.min(...xe.notes.map((tt) => tt.onset), ...xe.chords.map((tt) => tt.onset)), Ue = Kd(Se, C, Qe + Se.span, "overwrite");
        typeof Ue == "string" ? u.error = "There is no room after the selection to duplicate it." : await Me(Ue);
        return;
      }
      const R = _i.value;
      if (!R) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const ue = Kd(R, C, g.value, y === "insert" ? "insert" : "overwrite");
      typeof ue == "string" ? u.error = ue : await Me(ue);
    }
    function k(y) {
      if (y.altKey) return null;
      switch (y.key.toLowerCase()) {
        case "c":
          return "copy";
        case "x":
          return "cut";
        case "v":
          return y.shiftKey ? "insert" : "paste";
        case "d":
          return "duplicate";
        default:
          return null;
      }
    }
    function A(y) {
      v.value = y === null || !ce.value ? null : rh(ce.value, y), D.onTime(y);
    }
    function T() {
      t.readonly || !t.guide?.length || i("guideChange", []);
    }
    const Q = N({
      get: () => c.value.rollZoom,
      set: (y) => c.value = { ...c.value, rollZoom: y }
    }), q = N(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function ve(y) {
      y.preventDefault();
      const C = c.value.rollHeight;
      tl(y, ({ dy: R }) => c.value = { ...c.value, rollHeight: gh(C, R) });
    }
    function Ee(y) {
      const C = y.key === "ArrowUp" ? -16 : y.key === "ArrowDown" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, rollHeight: gh(c.value.rollHeight, C) });
    }
    function je(y) {
      y.preventDefault();
      const C = c.value.notationShare, ue = y.currentTarget.parentElement?.clientHeight ?? 0;
      tl(y, ({ dy: xe }) => c.value = { ...c.value, notationShare: Oy(C, xe, ue) });
    }
    function ot(y) {
      const C = y.key === "ArrowDown" ? 0.03 : y.key === "ArrowUp" ? -0.03 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, notationShare: My(c.value.notationShare + C) });
    }
    function Pe(y) {
      y.preventDefault();
      const C = c.value.sideWidth;
      tl(y, ({ dx: R }) => c.value = { ...c.value, sideWidth: mh(C, R) });
    }
    function it(y) {
      const C = y.key === "ArrowLeft" ? -16 : y.key === "ArrowRight" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, sideWidth: mh(c.value.sideWidth, C) });
    }
    const $t = /* @__PURE__ */ G(null), Ne = /* @__PURE__ */ G(null), yt = /* @__PURE__ */ G(null), Ei = /* @__PURE__ */ G(!1), go = N(() => t.guide !== void 0), kr = N(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && ce.value?.display_abc ? null : "There is no score to export yet."), uh = N({
      get: () => c.value.paper,
      set: (y) => c.value = { ...c.value, paper: y }
    }), ch = N({
      get: () => c.value.notationSize,
      set: (y) => c.value = { ...c.value, notationSize: y }
    });
    function Vv(y) {
      yt.value = null, u.notes = [y];
    }
    const Ls = N(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Hv() {
      const y = Ls.value;
      if (y) {
        yt.value = y;
        return;
      }
      Ei.value = !0, yt.value = null;
      try {
        const C = await Ay(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        Ys(C.filename, EM(C.data));
      } catch (C) {
        yt.value = Xs(C);
      } finally {
        Ei.value = !1;
      }
    }
    async function Fv() {
      const y = Ls.value;
      if (y) {
        yt.value = y;
        return;
      }
      Ei.value = !0, yt.value = null;
      try {
        const C = await Ty(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: X()
        });
        Ys(C.filename, new TextEncoder().encode(C.data), C.type);
      } catch (C) {
        yt.value = Xs(C);
      } finally {
        Ei.value = !1;
      }
    }
    const hh = /* @__PURE__ */ G(null);
    function zv() {
      const y = VD({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: X(),
        settings: z.value
      });
      Ys(HD(t.title), new TextEncoder().encode(`${JSON.stringify(y, null, 1)}
`), "application/json"), yt.value = null, u.notes = [`saved the project: score${y.guide.length ? `, ${fh(y.guide.length)}` : ""}${y.lyrics ? ", lyrics" : ""}, settings`];
    }
    function Wv() {
      yt.value = null, hh.value?.click();
    }
    async function Kv(y) {
      const C = y.target, R = C.files?.[0];
      if (C.value = "", !R) return;
      const ue = FD(await R.text());
      typeof ue == "string" ? yt.value = ue : Uv(ue, R.name);
    }
    const fh = (y) => y === 1 ? "1 Guide note" : `${y} Guide notes`;
    let xa = !1;
    function Uv(y, C) {
      if (ae()) return;
      if (t.readonly) {
        yt.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const R = ["score"], ue = [], xe = ie(), Se = {}, Qe = t.guide;
      Qe !== void 0 ? (xe.guide = [...Qe], Se.guide = [...y.guide], y.guide.length && R.push(fh(y.guide.length))) : y.guide.length && ue.push("the Guide notes (only the DAW sheet keeps a Guide track)"), y.lyrics && I.value ? (o.value = null, r.value = y.lyrics, xa = !0, R.push("lyrics"), Ae(y.lyric_spans)) : y.lyrics && ue.push("the lyrics (this sheet cannot change them here)"), Object.assign(Se, ie()), Object.keys(y.settings).length && (c.value = Gd(c.value, y.settings), R.push("settings"));
      const Ue = `open project (${C})`;
      u.replaceText(y.score, Ue, null, { before: xe, after: Se }) || u.recordSide(Ue, xe, Se), Se.guide && Qe !== void 0 && !Co(Se.guide, Qe) && i("guideChange", Se.guide), yt.value = null, u.notes = [
        `opened ${C}: ${R.join(", ")}${y.title ? ` ("${y.title}")` : ""}`,
        ...ue.map((tt) => `not opened: ${tt}`)
      ];
    }
    function jv() {
      yt.value = null, $t.value?.click();
    }
    async function Gv(y) {
      const C = y.target, R = C.files?.[0];
      if (C.value = "", !!R)
        try {
          Ne.value = { data: LM(new Uint8Array(await R.arrayBuffer())), filename: R.name };
        } catch (ue) {
          yt.value = Xs(ue);
        }
    }
    function qv(y, C) {
      if (t.readonly || ae()) return;
      const R = Ne.value?.filename ?? "file", ue = t.guide, xe = ue === void 0 ? void 0 : C ? [...y.guide] : [], Se = ue === void 0 || xe === void 0 ? void 0 : { before: { guide: [...ue] }, after: { guide: xe } };
      u.replaceText(y.abc, `import MIDI (${R})`, y.analysis, Se), xe !== void 0 && ue !== void 0 && !Co(xe, ue) && i("guideChange", xe), Ne.value = null, yt.value = null;
    }
    function wa(y) {
      const C = y;
      return C ? !!C.closest("input, textarea, select, .cm-editor") : !1;
    }
    const Yv = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function ka(y) {
      const C = y;
      if (!C) return !1;
      if (C.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const R = C.closest("input");
      return !!R && !Yv.has(R.type);
    }
    function Xv(y) {
      y.key === " " && !ka(y.target) && y.preventDefault();
    }
    function Jv(y) {
      const C = y.ctrlKey || y.metaKey;
      if (C && !t.readonly && (y.key === "z" || y.key === "Z" || y.key === "y")) {
        if (wa(y.target) && !y.target.closest(".cm-editor")) return;
        y.preventDefault(), y.key === "y" || y.key.toLowerCase() === "z" && y.shiftKey ? xr() : br();
        return;
      }
      const R = C && !wa(y.target) ? k(y) : null;
      if (R) {
        y.preventDefault(), y.stopPropagation(), po(R);
        return;
      }
      if (y.key === " " && !C && !ka(y.target)) {
        y.preventDefault(), b.value?.toggle();
        return;
      }
      if (wa(y.target) || C) return;
      if (y.key === "Escape" && D.recording.value) {
        y.preventDefault(), D.cancel();
        return;
      }
      if (y.key === "R" && y.shiftKey && !y.altKey) {
        y.preventDefault(), D.recording.value ? D.stop() : D.start();
        return;
      }
      if (y.key === "Escape") {
        y.preventDefault(), u.selection.length && u.select([]), fe.value = [];
        return;
      }
      const ue = ce.value, xe = u.primary, Se = y.key.toLowerCase();
      if ((Se === "g" || Se === "h") && !y.altKey && O.value) {
        y.preventDefault(), y.shiftKey ? O.value.zoomRows(Se === "h" ? 2 : -2) : O.value.zoomBy(Se === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((y.key === "Home" || y.key === "End") && ne.value) {
        y.preventDefault(), g.value = y.key === "Home" ? 0 : ne.value.total;
        return;
      }
      if (!ue || !xe) return;
      (() => {
        switch (y.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const Ue = k1(ue, xe.id, y.key === "ArrowRight" ? 1 : -1);
            return Ue && yn(Ue.id, y.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (y.altKey) {
              const En = S1(ue, xe.id);
              return En && yn(En.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const Ue = u.selection.filter((En) => xs(ue, En)?.kind === "note"), tt = [...ur(u.selection)], bt = (y.shiftKey ? 12 : 1) * (y.key === "ArrowUp" ? 1 : -1);
            return tt.length ? Me({ op: "set_note_pitch", ids: [...uo(ue, u.selection), ...tt], semitones: bt }) : Ue.length && Me({ op: "shift_pitch", ids: Ue, semitones: bt }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || xe.kind !== "note") return !1;
            const Ue = bu(xe.units, y.key === "]" ? 1 : -1);
            return Ue && Me({ op: "set_duration", id: xe.id, units: Ue }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (xe.kind === "note" && Me({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (xe.kind !== "note" && Me({ op: "rest_to_note", id: xe.id }), !0);
          default:
            return !1;
        }
      })() && (y.preventDefault(), y.stopPropagation());
    }
    return (y, C) => (w(), M("div", {
      ref_key: "tabRoot",
      ref: L,
      class: "score-tab",
      onKeydown: Jv,
      onKeyup: Xv
    }, [
      n.readonly ? ee("", !0) : (w(), xn(_$, {
        key: 0,
        view: ce.value,
        selection: V(u).selection,
        primary: V(u).primary,
        busy: V(u).busy,
        "can-undo": V(u).canUndo,
        "can-redo": V(u).canRedo,
        "undo-label": V(u).undoLabel,
        "redo-label": V(u).redoLabel,
        onOperate: Me,
        onUndo: br,
        onRedo: xr
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", n4, [
        p("span", i4, [
          p("button", {
            role: "radio",
            "aria-checked": h.value === "review",
            class: qe({ active: h.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: C[0] || (C[0] = (R) => f("review"))
          }, " Review ", 10, s4),
          p("button", {
            role: "radio",
            "aria-checked": J.value,
            class: qe({ active: J.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: C[1] || (C[1] = (R) => f("daw"))
          }, " DAW ", 10, o4),
          p("button", {
            role: "radio",
            "aria-checked": h.value === "text",
            class: qe({ active: h.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: C[2] || (C[2] = (R) => f("text"))
          }, " Text ", 10, r4)
        ]),
        Le.value ? (w(), M(me, { key: 0 }, [
          p("label", l4, [
            ze(p("input", {
              "onUpdate:modelValue": C[3] || (C[3] = (R) => c.value.roll = R),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [un, c.value.roll]
            ]),
            C[34] || (C[34] = ye(" piano roll ", -1))
          ]),
          p("label", a4, [
            ze(p("input", {
              "onUpdate:modelValue": C[4] || (C[4] = (R) => c.value.advanced = R),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [un, c.value.advanced]
            ]),
            C[35] || (C[35] = ye(" ABC text (advanced) ", -1))
          ])
        ], 64)) : ee("", !0),
        p("label", u4, [
          C[36] || (C[36] = ye(" zoom ", -1)),
          ze(p("input", {
            "onUpdate:modelValue": C[5] || (C[5] = (R) => c.value.zoom = R),
            type: "range",
            min: "0.6",
            max: "1.8",
            step: "0.1",
            "aria-label": "Notation zoom"
          }, null, 512), [
            [
              Nt,
              c.value.zoom,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        Vt(AM),
        p("span", c4, [
          p("button", {
            disabled: Ei.value || !!Ls.value,
            title: Ls.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Hv
          }, " Export MIDI ", 8, h4),
          p("button", {
            disabled: Ei.value || !!Ls.value,
            title: Ls.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: Fv
          }, " Export MusicXML ", 8, f4),
          Vt(kO, {
            paper: uh.value,
            "onUpdate:paper": C[6] || (C[6] = (R) => uh.value = R),
            size: ch.value,
            "onUpdate:size": C[7] || (C[7] = (R) => ch.value = R),
            abc: kr.value ? null : ce.value?.display_abc ?? null,
            title: n.title ?? "",
            blocked: kr.value,
            onDone: Vv,
            onFailed: C[8] || (C[8] = (R) => yt.value = R)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !n.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: zv
          }, " Save project ", 8, d4),
          p("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: jv
          }, " Import MIDI… ", 8, p4),
          p("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: Wv
          }, " Open project… ", 8, g4),
          p("input", {
            ref_key: "midiFile",
            ref: $t,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Gv
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: hh,
            class: "hidden-file",
            type: "file",
            accept: `${V(Nv)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Kv
          }, null, 40, m4)
        ]),
        V(u).pending ? (w(), M("span", v4, "checking…")) : V(u).view?.ok ? (w(), M("span", y4, "✓ valid")) : pe.value ? (w(), M("span", b4, "✖ " + F(He.value.length) + " error(s)", 1)) : ee("", !0),
        n.readonly ? (w(), M("span", x4, "read-only: owned by the other sheet")) : ee("", !0)
      ]),
      pe.value && !n.readonly ? (w(), M("p", w4, [
        C[37] || (C[37] = ye(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        V(u).canRevert ? (w(), M("button", {
          key: 0,
          onClick: C[9] || (C[9] = (R) => V(u).revertToLastValid())
        }, "Revert to last valid")) : ee("", !0),
        Le.value && !c.value.advanced ? (w(), M("button", {
          key: 1,
          onClick: C[10] || (C[10] = (R) => c.value.advanced = !0)
        }, "Show the ABC text")) : ee("", !0)
      ])) : V(u).view?.ok && V(u).view.model_error && !n.readonly ? (w(), M("p", k4, " This score is valid for YuE2 but outside the editor's supported subset (" + F(V(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : ee("", !0),
      Z.value ? (w(), xn(OT, {
        key: 3,
        ref_key: "pianoRoll",
        ref: O,
        zoom: Q.value,
        "onUpdate:zoom": C[11] || (C[11] = (R) => Q.value = R),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": C[12] || (C[12] = (R) => c.value.rowHeight = R),
        follow: c.value.follow,
        "onUpdate:follow": C[13] || (C[13] = (R) => c.value.follow = R),
        track: E.value,
        "onUpdate:track": C[14] || (C[14] = (R) => E.value = R),
        recorded: V(D).recording.value ? { track: E.value, notes: V(D).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": C[15] || (C[15] = (R) => c.value.sung = R),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": C[16] || (C[16] = (R) => c.value.wave = R),
        sound: K.value,
        sung: Ze.value,
        height: c.value.rollHeight,
        view: ce.value,
        selection: V(u).selection,
        playing: d.value,
        operate: Gt,
        readonly: n.readonly,
        stale: pe.value,
        busy: V(u).busy,
        locator: ne.value ? g.value : null,
        playhead: v.value,
        clip: V(_i)?.label ?? null,
        lyrics: ce.value?.lyrics ?? null,
        "lyrics-editable": I.value,
        source: Mt.value ? { envelope: Mt.value.envelope, bars: Ft.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": C[17] || (C[17] = (R) => c.value.audition = R),
        "resize-mode": "rests",
        onSelect: ba,
        onLocate: C[18] || (C[18] = (R) => g.value = R),
        onClipboard: po,
        "lyric-selection": fe.value,
        "onUpdate:lyricSelection": C[19] || (C[19] = (R) => fe.value = R),
        onLyricEdit: Un,
        onLyricPlace: Ke,
        onLyricDelete: et
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : ee("", !0),
      Z.value && ce.value?.model ? (w(), M("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": V(xy),
        "aria-valuemax": V(by),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: ve,
        onKeydown: Ee
      }, null, 40, S4)) : ee("", !0),
      Vt(rD, {
        ref_key: "transport",
        ref: b,
        voices: di.value,
        "onUpdate:voices": C[22] || (C[22] = (R) => di.value = R),
        speed: tn.value,
        "onUpdate:speed": C[23] || (C[23] = (R) => tn.value = R),
        sounds: c.value.sounds,
        metronome: _t.value,
        "onUpdate:metronome": C[24] || (C[24] = (R) => _t.value = R),
        view: ce.value,
        bar: Xe.value,
        from: ht.value,
        position: vt.value,
        reference: vn.value,
        hear: Ln.value,
        "onUpdate:hear": C[25] || (C[25] = (R) => Ln.value = R),
        "source-level": ss.value,
        "onUpdate:sourceLevel": C[26] || (C[26] = (R) => ss.value = R),
        "source-shift": jn.value,
        "onUpdate:sourceShift": C[27] || (C[27] = (R) => jn.value = R),
        "source-beat": Li.value,
        "timeline-bars": Ft.value,
        guide: se.value,
        source: Mt.value,
        "source-problem": is.value,
        "loop-range": Ds.value,
        onCursor: C[28] || (C[28] = (R) => d.value = R),
        onTime: A,
        onStopped: V(D).onStopped
      }, {
        record: Lp(({ countingIn: R }) => [
          Vt(cO, {
            settings: j.value,
            "onUpdate:settings": C[20] || (C[20] = (ue) => j.value = ue),
            hub: V(re),
            recording: V(D).recording.value,
            "counting-in": R,
            step: V(D).step.value,
            target: E.value === "vocal" ? "Vocal" : "Ins",
            disabled: ke.value,
            onRecord: V(D).start,
            onStop: V(D).stop,
            onStep: V(D).toggleStep,
            onRest: V(D).rest,
            onEnable: V(D).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          Vt(zO, {
            sounds: B.value,
            "onUpdate:sounds": C[21] || (C[21] = (ue) => B.value = ue),
            fetcher: n.fetcher,
            settings: z.value,
            "keeps-guide": go.value,
            onApply: P
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: qe(["score-main", { "with-roll": Z.value && !!ce.value?.model, "with-inspector": Le.value }]),
        "data-layout": h.value,
        "data-text": Le.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: ki(q.value)
      }, [
        p("div", M4, [
          J.value ? (w(), xn(mD, {
            key: 0,
            voices: di.value,
            "onUpdate:voices": C[29] || (C[29] = (R) => di.value = R),
            view: ce.value,
            "guide-count": ct.value.length,
            sounds: B.value,
            "onUpdate:sounds": C[30] || (C[30] = (R) => B.value = R),
            "keeps-guide": go.value,
            readonly: n.readonly,
            onClearGuide: T
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : ee("", !0),
          Vt(c$, {
            view: ce.value,
            bar: Re.value,
            "error-bars": Oe.value,
            "source-starts": fo.value,
            readonly: n.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: le,
            onOperate: Me,
            onNotice: C[31] || (C[31] = (R) => V(u).notes = [R])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          n.lyricsTarget && l.value !== null ? (w(), M("div", A4, [
            C[38] || (C[38] = p("strong", null, "Lyrics", -1)),
            n.lyricsTarget.blocked ? (w(), M("p", T4, F(n.lyricsTarget.blocked), 1)) : (w(), M(me, { key: 1 }, [
              _.value ? (w(), M("p", $4, [
                ye(" Apply writes the changed lyrics into " + F(n.lyricsTarget.title) + ": " + F(H.value) + ". That sheet then asks for approval again. ", 1),
                n.lyricsTarget.replans ? (w(), M(me, { key: 0 }, [
                  ye(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : ee("", !0)
              ])) : (w(), M("p", D4, [
                ye(F(n.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${n.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !n.readonly ? (w(), M(me, { key: 0 }, [
                  ye("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : ee("", !0)
              ])),
              _.value ? (w(), M("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: Ot
              }, " Revert the lyrics ")) : ee("", !0)
            ], 64))
          ])) : ee("", !0),
          Le.value && he.value ? (w(), M("details", O4, [
            C[39] || (C[39] = p("summary", null, "Lyrics fit", -1)),
            Vt(sg, {
              lyrics: he.value,
              abc: n.doc.text,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : ee("", !0)
        ]),
        p("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": V(ky),
          "aria-valuemax": V(wy),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: Pe,
          onKeydown: it
        }, null, 40, L4),
        p("div", {
          class: qe(["score-views", { split: Le.value && c.value.advanced }])
        }, [
          Le.value ? ee("", !0) : (w(), xn(Md, {
            key: 0,
            text: n.doc.text,
            diagnostics: He.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: V(u).typed,
            onCursor: W
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          Vt(oA, {
            view: ce.value,
            stale: pe.value,
            selection: V(u).selection,
            playing: d.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: C[32] || (C[32] = (R, ue) => yn(R, ue))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Le.value && c.value.advanced ? (w(), M("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": V(Cy),
            "aria-valuemax": V(Sy),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: je,
            onKeydown: ot
          }, null, 40, E4)) : ee("", !0),
          Le.value && c.value.advanced ? (w(), xn(Md, {
            key: 2,
            text: n.doc.text,
            diagnostics: He.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: V(u).typed,
            onCursor: W
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : ee("", !0)
        ], 2),
        Le.value ? (w(), xn(kM, {
          key: 0,
          view: ce.value,
          selection: V(u).selection,
          operate: Gt,
          "fallback-bar": V(u).primary?.bar ?? null,
          readonly: n.readonly,
          stale: pe.value,
          busy: V(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : ee("", !0)
      ], 14, C4),
      p("p", B4, [
        p("span", null, F(V(u).selection.length > 1 ? `${V(u).selection.length} selected · ` : "") + F(V(A1)(V(u).primary, os.value)), 1),
        (w(!0), M(me, null, Be(V(u).notes, (R, ue) => (w(), M("span", {
          key: ue,
          class: "change"
        }, F(R), 1))), 128))
      ]),
      V(u).error ? (w(), M("p", I4, F(V(u).error), 1)) : ee("", !0),
      yt.value ? (w(), M("p", R4, F(yt.value), 1)) : ee("", !0),
      U.value ? (w(), M("p", P4, F(U.value), 1)) : ee("", !0),
      Ne.value ? (w(), xn(nA, {
        key: 8,
        fetcher: n.fetcher,
        data: Ne.value.data,
        filename: Ne.value.filename,
        view: ce.value,
        "keeps-guide": go.value,
        "current-guide": ct.value.length,
        onClose: C[33] || (C[33] = (R) => Ne.value = null),
        onInsert: qv
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : ee("", !0),
      He.value.length ? (w(), M("ul", _4, [
        (w(!0), M(me, null, Be(He.value, (R, ue) => (w(), M("li", {
          key: ue,
          "data-severity": R.severity
        }, [
          p("strong", null, F(R.severity), 1),
          R.bar ? (w(), M("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${R.bar}`,
            onClick: (xe) => le(R.bar)
          }, "bar " + F(R.bar), 9, V4)) : R.line ? (w(), M("span", H4, "line " + F(R.line), 1)) : ee("", !0),
          ye(" " + F(R.message), 1)
        ], 8, N4))), 128))
      ])) : ee("", !0)
    ], 544));
  }
}), F4 = ["aria-label"], z4 = ["title"], W4 = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, K4 = ["aria-selected", "onClick"], U4 = ["title", "aria-label", "aria-pressed"], j4 = {
  key: 0,
  class: "hint"
}, G4 = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, q4 = ["disabled", "title"], Y4 = {
  class: "body",
  role: "tabpanel"
}, X4 = { class: "doc-head" }, J4 = ["data-state"], Z4 = ["disabled", "onClick"], Q4 = ["disabled", "onClick"], eL = ["onClick"], tL = {
  key: 0,
  class: "conflict"
}, nL = ["onClick"], iL = ["onClick"], sL = ["onClick"], oL = ["onUpdate:modelValue", "rows", "aria-label", "onInput"], rL = {
  key: 3,
  class: "tag-helpers"
}, lL = ["title", "onClick"], aL = {
  key: 0,
  class: "facts"
}, uL = {
  key: 4,
  class: "asr"
}, cL = { key: 0 }, hL = { key: 1 }, fL = { key: 5 }, dL = {
  key: 0,
  class: "diff"
}, pL = { key: 0 }, gL = { key: 1 }, mL = { key: 2 }, vL = { key: 3 }, yL = {
  key: 0,
  class: "doc context wide"
}, bL = { class: "doc-head" }, xL = ["title"], wL = {
  key: 1,
  class: "badge"
}, kL = {
  key: 0,
  class: "hint score-owner"
}, SL = {
  key: 1,
  class: "hint"
}, CL = {
  key: 1,
  class: "doc sections"
}, ML = {
  key: 0,
  class: "doc context"
}, AL = { class: "doc-head" }, TL = {
  class: "findings",
  "aria-label": "Validation"
}, $L = ["data-status"], DL = { key: 0 }, OL = ["title"], LL = { key: 1 }, EL = ["title"], BL = { class: "idea" }, IL = {
  key: 0,
  class: "idea"
}, RL = {
  key: 1,
  class: "idea"
}, PL = { class: "where" }, _L = {
  key: 0,
  class: "kept"
}, NL = {
  key: 1,
  class: "error"
}, VL = {
  key: 2,
  class: "error"
}, HL = {
  key: 3,
  class: "error"
}, FL = {
  key: 4,
  class: "error"
}, zL = ["data-severity"], WL = { class: "where" }, KL = {
  key: 0,
  class: "facts"
}, UL = ["disabled"], jL = ["disabled", "title"], GL = ["disabled", "title"], qL = ["aria-valuenow", "title"], YL = /* @__PURE__ */ Qt({
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
  setup(n, { emit: e }) {
    const t = n, i = e, s = {
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = N(() => t.payload?.style_label === "caption"), u = N(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (W) => W === "style" && a.value ? "Caption" : o[W], h = (W) => W === "style" && a.value ? 14 : l[W], f = /* @__PURE__ */ ms(vh(t.state, t.payload, t.owned)), d = /* @__PURE__ */ G(t.payload), g = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(null), O = N(() => {
      const W = f.find((ae) => ae.kind === "score"), le = b.value;
      return W && le?.reason && le.text === W.text ? le.reason : null;
    }), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G(0);
    let B;
    const z = N(() => t.payload?.context?.score ?? null), P = /* @__PURE__ */ ms({ kind: "score", text: z.value ?? "", intent: "keep" }), Y = N(
      () => !f.some((W) => W.kind === "score") && !!z.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), K = /* @__PURE__ */ G(null), re = N(() => {
      const W = K.value;
      return Y.value && W?.reason && W.text === P.text ? W.reason : null;
    }), j = N(
      () => Y.value && z.value && bn(P.text) !== bn(z.value) ? P.text : null
    );
    function D() {
      if (!j.value) return;
      const W = f.find((le) => le.kind === "lyrics");
      W && W.intent !== "auto" && (W.intent = "manual");
    }
    const U = N(() => {
      const W = new Set(f.map((le) => s[le.kind]));
      for (const le of Object.keys(t.payload?.context ?? {}))
        le in s && W.add(s[le]);
      return ["score", "lyrics", "style", "details"].filter((le) => W.has(le));
    }), ke = f[0] ? s[f[0].kind] : "lyrics", $e = /* @__PURE__ */ G(ke), ce = (W) => t.payload?.docs[W] ?? null, pe = (W) => ce(W)?.upstream ?? null, He = (W) => ce(W)?.status === "conflict", Oe = (W) => f.filter((le) => s[le.kind] === W), Re = N(() => f.find((W) => W.kind === "score") ?? null), Le = N(() => Re.value?.text ?? z.value ?? null), J = N(
      () => f.find((W) => W.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), ct = N(
      () => f.find((W) => W.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), be = N(() => Ry(t.payload?.timeline)), Ie = N(() => {
      const W = t.asrNote ?? L.value;
      return W && W.draft_sha256 === ce("lyrics")?.upstream_sha256 ? W : null;
    }), se = (W) => f1(pe(W.kind) ?? "", W.text);
    function Z(W) {
      if (W.intent === "auto") return "auto";
      if (W.intent === "manual") return "manual";
      if (W.intent === "rebase") return "edited (merged)";
      if (He(W.kind)) return "conflict";
      const le = t.state.docs[W.kind]?.state ?? "auto", ae = bn(pe(W.kind) ?? "");
      return le === "auto" && bn(W.text) !== ae ? ae || !t.payload ? "edited" : "manual" : le;
    }
    function ne(W) {
      W.intent = "auto", W.text = pe(W.kind) ?? "";
    }
    function Xe(W) {
      W.intent = "manual";
    }
    function ht(W, le) {
      W.text = h1(W.text, le), x(W);
    }
    function vt(W) {
      W.intent = "manual";
    }
    function S(W) {
      W.intent = "rebase";
    }
    function x(W) {
      W.intent === "auto" && (W.intent = "keep");
    }
    function $() {
      vh(t.state, t.payload, t.owned).forEach((le, ae) => Object.assign(f[ae], le)), H.value = [...t.guide ?? []], ie.value = [...t.lyricSpans ?? []], X.value = t.sourceShift ?? 0, P.text = z.value ?? "", E.value++;
    }
    const I = N(
      () => f.filter((W) => He(W.kind) && W.intent === "keep").map((W) => W.kind)
    ), _ = N(() => Py(t.state, t.payload, f)), H = /* @__PURE__ */ G([...t.guide ?? []]);
    function he(W) {
      H.value = W;
    }
    const ie = /* @__PURE__ */ G([...t.lyricSpans ?? []]);
    function oe(W) {
      ie.value = W;
    }
    const X = /* @__PURE__ */ G(t.sourceShift ?? 0);
    function Ae(W) {
      X.value = W;
    }
    function fe() {
      return { lyricSpans: ie.value, sourceShift: X.value };
    }
    const Ce = /* @__PURE__ */ G(null), Te = N(() => f.find((W) => W.kind === "lyrics") ?? null), Fe = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, We = N(() => Te.value ? Fe : t.lyricsTarget ?? null), Ke = N(() => {
      const W = t.payload?.context?.lyrics, le = Ce.value;
      return Te.value || !We.value || We.value.blocked || !le || !W ? null : bn(le) !== bn(W) ? le : null;
    });
    function et(W) {
      const le = Te.value;
      le ? W !== null && bn(W) !== bn(le.text) && (le.text = W, x(le)) : Ce.value = W;
    }
    function pt() {
      if (!Ke.value || !We.value?.replans) return;
      const W = f.find((le) => le.kind === "score");
      W && W.intent === "keep" && (W.intent = "manual");
    }
    const Pt = N(
      () => kh(_.value) !== kh(t.state) || !Co(H.value, t.guide ?? []) || !nl(ie.value, t.lyricSpans ?? []) || X.value !== (t.sourceShift ?? 0) || Ke.value !== null || j.value !== null
    ), st = N(() => {
      const W = t.payload?.arrangement;
      return W && W.status !== "skipped" ? W : null;
    }), mn = N(() => _y(st.value?.notes ?? [])), Un = N(() => (d.value?.findings ?? []).filter((W) => W.severity !== "info")), Ot = N(() => (d.value?.findings ?? []).filter((W) => W.severity === "info")), _t = N(() => Un.value.some((W) => W.severity === "error")), vn = N(
      () => !v.value && !_t.value && !I.value.length && !O.value && !re.value && !!d.value?.fingerprint
    ), Mt = N(
      () => I.value.length ? "Resolve the conflicts first." : O.value ?? re.value
    ), is = N(() => I.value.length ? "⇄ conflict" : _t.value ? "✖ errors" : Un.value.length ? "⚠ warnings" : d.value?.waiting && !Pt.value ? "⏸ waiting for approval" : d.value ? "✓ valid" : "not run yet");
    async function Ln() {
      if (t.payload) {
        v.value = !0, g.value = null;
        try {
          d.value = await By(t.fetcher, {
            sheet_state: _.value,
            upstream: Iy(t.payload),
            owned: t.owned,
            review: t.review,
            engine: t.payload.engine,
            instrumental: t.payload.instrumental,
            // the lyrics are checked against the score as edited here
            context: j.value ? { ...t.payload.context, score: j.value } : t.payload.context,
            target_seconds: t.payload.target_seconds ?? null,
            // a series: the same rule as the node (an edit belongs to its song)
            brief_mode: t.payload.brief_mode ?? null
          });
        } catch (W) {
          g.value = W instanceof Jd ? `${W.message}${W.hint ? ` — ${W.hint}` : ""}` : String(W);
        } finally {
          v.value = !1;
        }
      }
    }
    Ge(
      () => [...f.map((W) => W.text + W.intent), j.value ?? ""].join("\0"),
      () => {
        clearTimeout(B), B = setTimeout(Ln, 300);
      }
    );
    function ss(W) {
      return j.value ? { text: j.value, approved: W } : null;
    }
    function Ds() {
      Mt.value || (pt(), D(), i(
        "apply",
        xh(_.value, t.state.review?.approved_fingerprint ?? null),
        H.value,
        Ke.value,
        ss(!1),
        !1,
        fe()
      ));
    }
    async function Ft() {
      pt(), D(), await Ln(), vn.value && i(
        "apply",
        xh(_.value, d.value?.fingerprint ?? null),
        H.value,
        Ke.value,
        ss(!0),
        !0,
        fe()
      );
    }
    function Li() {
      Pt.value ? m.value = !0 : i("close");
    }
    const Ze = /* @__PURE__ */ ms(Ly()), jn = /* @__PURE__ */ ms({ width: window.innerWidth, height: window.innerHeight }), fo = N(() => {
      const W = Ze.maximized ? jn.height - 2 * Sh : Ze.height;
      return Ze.maximized ? {
        width: `${jn.width - 2 * Sh}px`,
        height: `${W}px`,
        "--plenio-dialog-h": `${W}px`
      } : { width: `${Ze.width}px`, height: `${Ze.height}px`, "--plenio-dialog-h": `${W}px` };
    });
    function os() {
      jn.width = window.innerWidth, jn.height = window.innerHeight;
      const W = wh({ width: Ze.width, height: Ze.height }, jn);
      (W.width !== Ze.width || W.height !== Ze.height) && (Ze.width = W.width, Ze.height = W.height, Aa(Ze));
    }
    function di() {
      Ze.maximized = !Ze.maximized, Aa(Ze);
    }
    function tn(W) {
      W.preventDefault(), W.stopPropagation();
      const le = { width: Ze.width, height: Ze.height };
      tl(
        W,
        ({ dx: ae, dy: Me }) => {
          const Gt = wh(
            { width: le.width + ae, height: le.height + Me },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Ze.width = Gt.width, Ze.height = Gt.height;
        },
        () => Aa(Ze)
      );
    }
    function yn(W) {
      W.key === "Escape" && !W.defaultPrevented && (W.preventDefault(), m.value ? m.value = !1 : Li());
    }
    return dr(() => {
      window.addEventListener("keydown", yn), window.addEventListener("resize", os), t.payload && Ln();
      const W = ce("lyrics")?.upstream_sha256;
      !t.asrNote && W && Ey(t.fetcher, W).then((le) => L.value = le).catch(() => {
      });
    }), $i(() => {
      window.removeEventListener("keydown", yn), window.removeEventListener("resize", os), clearTimeout(B);
    }), (W, le) => (w(), M("div", {
      class: "plenio-overlay",
      onMousedown: ft(Li, ["self"])
    }, [
      p("div", {
        class: qe(["plenio-dialog", { maximized: Ze.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": n.title,
        style: ki(fo.value)
      }, [
        p("header", {
          onDblclick: ft(di, ["self"])
        }, [
          p("h2", null, F(n.title), 1),
          p("span", {
            class: qe(["status", { bad: _t.value || I.value.length }]),
            title: d.value?.status ?? ""
          }, F(is.value), 11, z4),
          p("div", W4, [
            (w(!0), M(me, null, Be(U.value, (ae) => (w(), M("button", {
              key: ae,
              role: "tab",
              "aria-selected": $e.value === ae,
              class: qe({ active: $e.value === ae }),
              onClick: (Me) => $e.value = ae
            }, F(c(ae)), 11, K4))), 128))
          ]),
          p("button", {
            class: "icon",
            title: Ze.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Ze.maximized ? "Restore" : "Maximize",
            "aria-pressed": Ze.maximized,
            onClick: di
          }, F(Ze.maximized ? "❐" : "⛶"), 9, U4),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: Li
          }, "×")
        ], 32),
        n.payload ? ee("", !0) : (w(), M("p", j4, [...le[4] || (le[4] = [
          ye(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          ye(". ", -1)
        ])])),
        m.value ? (w(), M("div", G4, [
          le[5] || (le[5] = ye(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!Mt.value,
            title: Mt.value ?? "Save your documents into the node",
            onClick: Ds
          }, " Apply ", 8, q4),
          p("button", {
            onClick: le[0] || (le[0] = (ae) => i("close"))
          }, "Discard"),
          p("button", {
            onClick: le[1] || (le[1] = (ae) => m.value = !1)
          }, "Keep editing")
        ])) : ee("", !0),
        p("div", Y4, [
          (w(!0), M(me, null, Be(Oe($e.value), (ae) => (w(), M("section", {
            key: ae.kind + E.value,
            class: qe(["doc", { wide: ae.kind === "score" }])
          }, [
            p("div", X4, [
              p("h3", null, F(u.value[ae.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": Z(ae)
              }, F(Z(ae)), 9, J4),
              le[6] || (le[6] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: pe(ae.kind) === null,
                title: "Discard your edit and use the draft",
                onClick: (Me) => ne(ae)
              }, " Use draft ", 8, Z4),
              ae.kind === "lyrics" ? (w(), M("button", {
                key: 0,
                disabled: ae.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (Me) => Xe(ae)
              }, " Use my own lyrics ", 8, Q4)) : (w(), M("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (Me) => Xe(ae)
              }, " Make manual ", 8, eL))
            ]),
            He(ae.kind) && ae.intent === "keep" ? (w(), M("div", tL, [
              ye(" The draft changed after you edited this document (" + F(ce(ae.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (Me) => vt(ae)
              }, "Keep my edit (manual)", 8, nL),
              p("button", {
                onClick: (Me) => ne(ae)
              }, "Use the new draft", 8, iL),
              p("button", {
                onClick: (Me) => S(ae)
              }, "Merge by hand", 8, sL)
            ])) : ee("", !0),
            ae.kind === "score" ? (w(), xn(Xd, {
              key: 1,
              doc: ae,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !1,
              "layout-default": n.layout ?? null,
              lyrics: J.value,
              title: ct.value,
              guide: H.value,
              "lyric-spans": ie.value,
              "source-shift": X.value,
              "lyrics-target": We.value,
              "lyrics-pending": Te.value ? null : Ce.value,
              onEdited: (Me) => x(ae),
              onGuideChange: he,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ae,
              onLyricsChange: et,
              onGate: le[2] || (le[2] = (Me, Gt) => b.value = { text: Me, reason: Gt })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : ze((w(), M("textarea", {
              key: 2,
              "onUpdate:modelValue": (Me) => ae.text = Me,
              rows: h(ae.kind),
              spellcheck: "false",
              "aria-label": u.value[ae.kind],
              onInput: (Me) => x(ae)
            }, null, 40, oL)), [
              [Nt, ae.text]
            ]),
            ae.kind === "lyrics" ? (w(), M("p", rL, [
              le[7] || (le[7] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (w(!0), M(me, null, Be(V(c1), (Me) => (w(), M("button", {
                key: Me,
                title: `Add [${Me}]`,
                onClick: (Gt) => ht(ae, Me)
              }, " [" + F(Me) + "] ", 9, lL))), 128)),
              ae.intent === "manual" ? (w(), M("span", aL, "the writer is not consulted - these are your lyrics")) : ee("", !0)
            ])) : ee("", !0),
            ae.kind === "lyrics" && Ie.value ? (w(), M("p", uL, [
              p("span", null, "Transcribed (" + F(Ie.value.language) + ").", 1),
              Ie.value.low_confidence.length ? (w(), M("span", cL, [
                le[8] || (le[8] = ye(" Check these unsure words: ", -1)),
                (w(!0), M(me, null, Be(Ie.value.low_confidence, (Me, Gt) => (w(), M("mark", {
                  key: "low-" + Gt
                }, F(Me), 1))), 128))
              ])) : ee("", !0),
              Ie.value.left_out.length ? (w(), M("span", hL, [
                le[9] || (le[9] = ye("Left out as not sung: ", -1)),
                p("s", null, F(Ie.value.left_out.join(" ")), 1)
              ])) : ee("", !0)
            ])) : ee("", !0),
            pe(ae.kind) !== null && V(bn)(pe(ae.kind) ?? "") !== V(bn)(ae.text) ? (w(), M("details", fL, [
              p("summary", null, "Changes against the draft (" + F(V(d1)(se(ae))) + " words)", 1),
              ae.kind !== "score" ? (w(), M("p", dL, [
                (w(!0), M(me, null, Be(se(ae), (Me, Gt) => (w(), M(me, { key: Gt }, [
                  Me.text === V(Zo) ? (w(), M("br", pL)) : Me.op === "added" ? (w(), M("ins", gL, F(Me.text + " "), 1)) : Me.op === "removed" ? (w(), M("del", mL, F(Me.text + " "), 1)) : (w(), M("span", vL, F(Me.text + " "), 1))
                ], 64))), 128))
              ])) : ee("", !0),
              p("pre", null, F(pe(ae.kind)), 1)
            ])) : ee("", !0),
            ae.kind === "lyrics" ? (w(), xn(sg, {
              key: 6,
              lyrics: ae.text,
              abc: Le.value,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : ee("", !0)
          ], 2))), 128)),
          $e.value === "score" && !Re.value && z.value ? (w(), M("section", yL, [
            p("div", bL, [
              le[10] || (le[10] = p("h3", null, "Score (ABC)", -1)),
              Y.value ? (w(), M("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${n.scoreTarget?.title}`
              }, " from " + F(n.scoreTarget?.title) + F(j.value ? " · changed" : ""), 9, xL)) : (w(), M("span", wL, "from the other sheet (read-only)"))
            ]),
            Y.value ? (w(), M("p", kL, [
              le[11] || (le[11] = ye(" Changes to the score go into ", -1)),
              p("strong", null, F(n.scoreTarget?.title), 1),
              le[12] || (le[12] = ye(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              le[13] || (le[13] = p("strong", null, "Approve", -1)),
              le[14] || (le[14] = ye(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : n.scoreTarget?.blocked ? (w(), M("p", SL, F(n.scoreTarget.blocked), 1)) : ee("", !0),
            Vt(Xd, {
              doc: P,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !Y.value,
              "layout-default": n.layout ?? null,
              lyrics: J.value,
              "lyrics-target": Te.value ? We.value : null,
              "lyric-spans": ie.value,
              "source-shift": X.value,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ae,
              onLyricsChange: et,
              onGate: le[3] || (le[3] = (ae, Me) => K.value = { text: ae, reason: Me })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : ee("", !0),
          $e.value === "lyrics" && be.value.length ? (w(), M("section", CL, [
            le[16] || (le[16] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              le[15] || (le[15] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), M(me, null, Be(be.value, (ae, Me) => (w(), M("tr", { key: Me }, [
                  p("td", null, F(ae.label), 1),
                  p("td", null, F(ae.bars), 1),
                  p("td", null, F(ae.start), 1),
                  p("td", null, F(ae.end), 1)
                ]))), 128))
              ])
            ])
          ])) : ee("", !0),
          (w(!0), M(me, null, Be(n.payload?.context ?? {}, (ae, Me) => (w(), M(me, {
            key: "context-" + Me
          }, [
            Me !== "score" && s[Me] === $e.value ? (w(), M("section", ML, [
              p("div", AL, [
                p("h3", null, F(u.value[Me] ?? Me), 1),
                le[17] || (le[17] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, F(ae), 1)
            ])) : ee("", !0)
          ], 64))), 128))
        ]),
        p("section", TL, [
          st.value ? (w(), M("div", {
            key: 0,
            class: "arrangement",
            "data-status": st.value.status
          }, [
            st.value.status === "fallback" ? (w(), M("p", DL, [
              le[18] || (le[18] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: V(Ma)
              }, "experimental", 8, OL),
              ye(" - " + F(V(yh)(st.value)) + ": " + F(st.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (w(), M("details", LL, [
              p("summary", null, [
                le[19] || (le[19] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: V(Ma)
                }, "experimental", 8, EL),
                ye(" " + F(V(yh)(st.value)) + ": " + F(st.value.summary), 1)
              ]),
              p("p", BL, F(V(Ma)), 1),
              V(bh)(st.value) ? (w(), M("p", IL, F(V(bh)(st.value)), 1)) : ee("", !0),
              st.value.idea ? (w(), M("p", RL, F(st.value.idea), 1)) : ee("", !0),
              p("ul", null, [
                (w(!0), M(me, null, Be(st.value.sections ?? [], (ae) => (w(), M("li", {
                  key: ae.index
                }, [
                  p("strong", null, F(ae.index) + " " + F(ae.label), 1),
                  p("span", PL, "bars " + F(ae.bars), 1),
                  ye(" " + F(ae.applied.length ? ae.applied.join("; ") : "unchanged") + " ", 1),
                  ae.kept.length ? (w(), M("span", _L, " - kept: " + F(ae.kept.join("; ")), 1)) : ee("", !0)
                ]))), 128)),
                (w(!0), M(me, null, Be(mn.value, (ae, Me) => (w(), M("li", {
                  key: "note" + Me,
                  "data-severity": "info"
                }, F(ae), 1))), 128))
              ])
            ]))
          ], 8, $L)) : ee("", !0),
          g.value ? (w(), M("p", NL, F(g.value), 1)) : ee("", !0),
          I.value.length ? (w(), M("p", VL, " Resolve the conflict in: " + F(I.value.join(", ")) + ". ", 1)) : ee("", !0),
          O.value ? (w(), M("p", HL, "Score: " + F(O.value), 1)) : re.value ? (w(), M("p", FL, "Score: " + F(re.value), 1)) : ee("", !0),
          p("ul", null, [
            (w(!0), M(me, null, Be(Un.value, (ae, Me) => (w(), M("li", {
              key: Me,
              "data-severity": ae.severity
            }, [
              p("strong", null, F(ae.severity), 1),
              le[20] || (le[20] = ye()),
              p("span", WL, F(ae.where), 1),
              ye(" " + F(ae.message), 1)
            ], 8, zL))), 128)),
            (w(!0), M(me, null, Be(Ot.value, (ae, Me) => (w(), M("li", {
              key: "i" + Me,
              "data-severity": "info"
            }, F(ae.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          n.owned.includes("score") && d.value ? (w(), M("span", KL, " render: " + F(d.value.planning_mode) + ", ceiling " + F(Math.round(d.value.score_seconds)) + " s ", 1)) : ee("", !0),
          le[21] || (le[21] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Pt.value,
            title: "Discard every change made in this editor",
            onClick: $
          }, "Revert", 8, UL),
          p("button", { onClick: Li }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!Mt.value,
            title: Mt.value ?? "Save your documents into the node",
            onClick: Ds
          }, " Apply ", 8, jL),
          n.review === "stop for review" ? (w(), M("button", {
            key: 1,
            class: "primary",
            disabled: !vn.value,
            title: O.value ?? "Release exactly these documents for the next run",
            onClick: Ft
          }, " Approve ", 8, GL)) : ee("", !0)
        ]),
        Ze.maximized ? ee("", !0) : (w(), M("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Ze.width,
          title: `Resize (${Ze.width} × ${Ze.height})`,
          onPointerdown: tn
        }, null, 40, qL))
      ], 14, F4)
    ], 32));
  }
});
function XL() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const n = document.createElement("style");
  n.id = "plenio-dialog-styles", n.textContent = u1, document.head.append(n);
}
function iE(n) {
  XL();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    i.unmount(), e.remove();
  }, i = r1(YL, {
    title: n.title,
    state: n.state,
    payload: n.payload,
    asrNote: n.asrNote ?? null,
    owned: n.owned,
    review: n.review,
    fetcher: n.fetcher,
    layout: n.layout ?? null,
    guide: n.guide ?? [],
    lyricSpans: n.lyricSpans ?? [],
    sourceShift: n.sourceShift ?? 0,
    lyricsTarget: n.lyricsTarget ?? null,
    scoreTarget: n.scoreTarget ?? null,
    onApply: (s, o, r, l, a, u) => {
      n.onApply(s, o, r, l, a, u), t();
    },
    onClose: t
  });
  return i.mount(e), t;
}
export {
  iE as openSheetDialog
};
